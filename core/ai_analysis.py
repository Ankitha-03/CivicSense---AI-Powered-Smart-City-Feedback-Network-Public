"""
Gemini Vision image analysis for CivicSense issue reports.

Provides analyze_issue_image(), which sends an uploaded civic issue photo
to the Google Gemini Vision API and returns a structured classification:
detected category, confidence score, severity assessment, a factual
description of what is visible, and whether the image matches the
citizen-reported category.

Model selection uses the same lazy discovery and preference-ordered fallback
strategy as core.chat_views: available flash models are fetched once on first
call and cached for the process lifetime. The model that last succeeded is
tried first on each subsequent request.

Module: core
Author: Ankitha
"""

# Standard library
import json
import logging
import mimetypes
import re
import time

# Third-party
from google import genai
from google.genai import types
from google.genai.errors import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)

PREFERRED = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
]

# Process-level cache — separate from chat_views to avoid cross-contamination
_vision_available_models = None
_vision_working_model = None

VISION_PROMPT = (
    "You are analyzing a photo submitted with a civic issue report in India.\n"
    "Reported title: {title}\n"
    "Reported description: {description}\n"
    "Reported category: {category}\n\n"
    "Analyze the image and respond ONLY with valid JSON, no markdown, no backticks:\n"
    '{{\n'
    '  "detected_category": "one of Road Damage, Garbage, Streetlight, Water Leak, Encroachment, Other",\n'
    '  "confidence": integer 0-100 representing how clearly the image shows this category of issue,\n'
    '  "matches_report": true or false whether the image matches the reported category,\n'
    '  "description": "one factual sentence describing what is visible in the image",\n'
    '  "severity_assessment": "one of Minor, Moderate, Severe, Critical based on what is visible"\n'
    '}}'
)


def _discover_vision_models(api_key):
    global _vision_available_models
    if _vision_available_models is not None:
        return _vision_available_models
    try:
        client = genai.Client(api_key=api_key)
        discovered = [
            m.name.replace("models/", "")
            for m in client.models.list()
            if "flash" in m.name.lower()
            and "generateContent" in (m.supported_actions or [])
        ]
        print(f"[CivicSense AI] Available flash models for vision: {discovered}")
        _vision_available_models = discovered
    except Exception as exc:
        logger.warning("[CivicSense AI] Model discovery failed (%s). Falling back to preferred list.", exc)
        _vision_available_models = list(PREFERRED)
    return _vision_available_models


def _ordered_vision_models(api_key):
    available = _discover_vision_models(api_key)
    available_set = set(available)
    ordered = [m for m in PREFERRED if m in available_set]
    for m in available:
        if m not in ordered:
            ordered.append(m)
    if _vision_working_model and _vision_working_model in ordered:
        ordered = [_vision_working_model] + [m for m in ordered if m != _vision_working_model]
    return ordered


def _extract_retry_delay(exc):
    msg = str(exc)
    m = re.search(r"retryDelay['\"]:\s*['\"](\d+(?:\.\d+)?)s", msg)
    if m:
        return float(m.group(1))
    m = re.search(r"retry in (\d+(?:\.\d+)?)s", msg, re.IGNORECASE)
    if m:
        return float(m.group(1))
    return None


def analyze_issue_image(image_path, title, description, category):
    """
    Analyze an uploaded civic issue photo using Gemini Vision.

    Returns a dict with keys: detected_category, confidence, matches_report,
    description, severity_assessment — or None on any failure.

    Never raises: all errors are caught and logged so callers never crash.
    Production note: move this call into a Celery task to avoid blocking
    the HTTP request thread on the API round-trip.
    """
    global _vision_available_models, _vision_working_model

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("[CivicSense AI] GEMINI_API_KEY not configured — skipping analysis.")
        return None

    try:
        with open(image_path, "rb") as fh:
            image_bytes = fh.read()
    except OSError as exc:
        logger.warning("[CivicSense AI] Could not read image file %s: %s", image_path, exc)
        return None

    mime_type, _ = mimetypes.guess_type(str(image_path))
    if not mime_type or not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    prompt = VISION_PROMPT.format(
        title=title or "(no title)",
        description=description or "(no description)",
        category=category or "(no category)",
    )

    client = genai.Client(api_key=api_key)
    raw = ""

    for model in _ordered_vision_models(api_key):
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=[
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                                types.Part(text=prompt),
                            ],
                        )
                    ],
                    config=types.GenerateContentConfig(max_output_tokens=256),
                )
                raw = response.text.strip()
                # Strip markdown fences if the model wraps the JSON anyway
                raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
                raw = re.sub(r"\s*```$", "", raw)

                result = json.loads(raw)
                _vision_working_model = model

                detected = str(result.get("detected_category", "Other"))
                confidence = int(result.get("confidence", 0))
                print(f"[CivicSense AI] Image analyzed: {detected} ({confidence}%)")

                return {
                    "detected_category": detected,
                    "confidence": confidence,
                    "matches_report": bool(result.get("matches_report", False)),
                    "description": str(result.get("description", ""))[:255],
                    "severity_assessment": str(result.get("severity_assessment", "")),
                }

            except (json.JSONDecodeError, ValueError) as exc:
                logger.warning(
                    "[CivicSense AI] JSON parse failed for model %s: %s. Raw: %.200s",
                    model, exc, raw,
                )
                return None

            except ClientError as exc:
                code = getattr(exc, "status_code", 500)

                if code == 429:
                    if attempt == 0:
                        delay = _extract_retry_delay(exc)
                        if delay is not None and delay <= 10:
                            logger.info(
                                "[CivicSense AI] Model %s rate-limited, sleeping %.1fs.", model, delay
                            )
                            time.sleep(delay)
                            continue
                    logger.warning("[CivicSense AI] Model %s quota exhausted, trying next.", model)
                    break

                elif code == 404:
                    logger.warning("[CivicSense AI] Model %s not found, pruning.", model)
                    if _vision_available_models and model in _vision_available_models:
                        _vision_available_models.remove(model)
                    if _vision_working_model == model:
                        _vision_working_model = None
                    break

                else:
                    logger.exception("[CivicSense AI] ClientError %s on model %s", code, model)
                    return None

            except Exception as exc:
                logger.exception("[CivicSense AI] Unexpected error on model %s: %s", model, exc)
                return None

    logger.warning("[CivicSense AI] All models exhausted — analysis skipped.")
    return None
