"""
Gemini-powered AI chatbot endpoint for the CivicSense platform.

Exposes a single POST endpoint at /api/chat/ that proxies citizen messages
to the Google Gemini API and returns a structured reply. The chatbot is
aware of CivicSense-specific knowledge: issue categories, department routing,
severity levels, and the report submission workflow.

Key behaviours:
  - Rate-limited to 20 requests per IP per hour (Django cache-backed).
  - Model selection is lazy and preference-ordered: available flash models
    are discovered on first request and cached for the process lifetime.
    The last successful model is tried first on all subsequent calls.
  - 429 quota exhaustion triggers a short sleep-and-retry (once, if the
    retry delay is 10 s or less), then falls through to the next model.
  - 404 model-not-found errors prune the model from the available list.
  - All error paths return HTTP 200 with a user-friendly reply string so
    the frontend never needs to handle non-2xx chat responses.

Module: core
Author: Ankitha
"""

# Standard library
import json
import logging
import re
import time

# Third-party
from google import genai
from google.genai import types
from google.genai.errors import ClientError
from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

# Preference order — models are skipped if not available on the account
PREFERRED = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
]

# Populated lazily on first request; mutated when 404s are encountered
_available_models = None
# Cached after the first successful call — tried first on every subsequent request
_working_model = None


def _discover_models(api_key):
    """Fetch the account's flash models that support generateContent (cached)."""
    global _available_models
    if _available_models is not None:
        return _available_models
    try:
        client = genai.Client(api_key=api_key)
        discovered = [
            m.name.replace("models/", "")
            for m in client.models.list()
            if "flash" in m.name.lower()
            and "generateContent" in (m.supported_actions or [])
        ]
        print(f"[CivicSense Chat] Available flash models: {discovered}")
        _available_models = discovered
    except Exception as exc:
        logger.warning("[CivicSense Chat] Model discovery failed (%s). Falling back to preferred list.", exc)
        _available_models = list(PREFERRED)
    return _available_models


def _ordered_models(api_key):
    """PREFERRED models that exist in the available list, then any remaining flash models."""
    available = _discover_models(api_key)
    available_set = set(available)
    ordered = [m for m in PREFERRED if m in available_set]
    for m in available:
        if m not in ordered:
            ordered.append(m)
    # Put the cached working model first so it is always tried before the others
    if _working_model and _working_model in ordered:
        ordered = [_working_model] + [m for m in ordered if m != _working_model]
    return ordered

SYSTEM_PROMPT = """You are the official AI assistant for CivicSense, a Smart City civic issue reporting platform for Indian citizens.

PLATFORM KNOWLEDGE:
- Citizens can report: Road Damage, Garbage, Streetlight, Water Leak, Encroachment, Other
- Report form steps: Basic Info -> Location -> Category -> Photo -> Severity -> Contact
- Severity levels: Minor, Moderate, Severe, Critical
- Status flow: Pending -> In Progress -> Resolved
- Category-to-department routing:
    Road Damage -> Public Works Department (PWD)
    Garbage -> Municipal Solid Waste Department
    Streetlight -> Electricity Department
    Water Leak -> Water Supply Department
    Encroachment -> Town Planning Department
    Other -> General Administration
- Citizens track reports at the My Reports page
- Department officers have a separate portal

YOUR CAPABILITIES:
1. If a user describes a problem (e.g. "there is a huge pothole near my house"), ANALYZE it and tell them: the right category, a suggested severity, which department will handle it, and tips for a clear description and useful photo evidence.
2. Guide users step by step through reporting.
3. Explain statuses and what happens at each stage.
4. Answer general questions about Indian municipal services and civic processes.
5. Help users phrase a clear, effective issue description.

BEHAVIOR:
- Be specific and actionable, never vague.
- 3-5 sentences per reply unless detail is genuinely needed.
- Professional but warm. No emojis ever.
- If asked something unrelated to civic issues or the platform, politely redirect to CivicSense topics.
- If the user seems frustrated about an unresolved issue, acknowledge it and explain realistic next steps."""

RATE_LIMIT = 20
RATE_WINDOW = 3600


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "unknown")


def _to_gemini_history(messages):
    history = []
    for m in messages[:-1]:
        role = "model" if m["role"] == "assistant" else "user"
        history.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))
    return history


def _extract_retry_delay(exc):
    """Parse retry delay seconds from a 429 ClientError string, or return None."""
    msg = str(exc)
    m = re.search(r"retryDelay['\"]:\s*['\"](\d+(?:\.\d+)?)s", msg)
    if m:
        return float(m.group(1))
    m = re.search(r"retry in (\d+(?:\.\d+)?)s", msg, re.IGNORECASE)
    if m:
        return float(m.group(1))
    return None


def _call_gemini(api_key, history, last_message):
    """
    Try models in preference order (working model first).
    - 429 with short delay: sleep once and retry, then move on.
    - 404: prune from available list and move on.
    Returns reply text, or None if all models are exhausted.
    """
    global _available_models, _working_model

    client = genai.Client(api_key=api_key)

    for model in _ordered_models(api_key):
        for attempt in range(2):
            try:
                chat = client.chats.create(
                    model=model,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        max_output_tokens=400,
                    ),
                    history=history,
                )
                response = chat.send_message(last_message)
                _working_model = model
                print(f"[CivicSense Chat] Using model: {model}")
                return response.text

            except ClientError as exc:
                code = getattr(exc, "status_code", 500)

                if code == 429:
                    if attempt == 0:
                        delay = _extract_retry_delay(exc)
                        if delay is not None and delay <= 10:
                            logger.info(
                                "[CivicSense Chat] Model %s rate-limited, sleeping %.1fs then retrying.",
                                model, delay,
                            )
                            time.sleep(delay)
                            continue
                    logger.warning("[CivicSense Chat] Model %s quota exhausted, trying next.", model)
                    break

                elif code == 404:
                    logger.warning("[CivicSense Chat] Model %s not found, pruning from list.", model)
                    if _available_models and model in _available_models:
                        _available_models.remove(model)
                    if _working_model == model:
                        _working_model = None
                    break

                else:
                    raise

    return None


@method_decorator(csrf_exempt, name="dispatch")
class ChatView(View):
    def post(self, request):
        ip = _get_client_ip(request)
        cache_key = f"chat_rate_{ip}"
        count = cache.get(cache_key, 0)
        if count >= RATE_LIMIT:
            return JsonResponse(
                {"reply": "I am receiving a lot of questions right now. Please try again in about a minute."}
            )
        cache.set(cache_key, count + 1, RATE_WINDOW)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"reply": "I could not understand that request. Please try again."})

        messages = body.get("messages", [])
        if not messages:
            return JsonResponse({"reply": "Please send a message and I will help you."})

        clean = [
            {"role": m["role"], "content": str(m["content"])[:2000]}
            for m in messages
            if isinstance(m, dict)
            and m.get("role") in ("user", "assistant")
            and m.get("content", "").strip()
        ][-20:]

        if not clean or clean[-1]["role"] != "user":
            return JsonResponse({"reply": "Please send a message and I will help you."})

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_AIza_key_here":
            logger.error("[CivicSense Chat] GEMINI_API_KEY is not configured.")
            return JsonResponse({"reply": "The assistant is temporarily unavailable."})

        history = _to_gemini_history(clean)

        try:
            reply = _call_gemini(api_key, history, clean[-1]["content"])
            if reply is None:
                return JsonResponse(
                    {"reply": "I am receiving a lot of questions right now. Please try again in about a minute."}
                )
            return JsonResponse({"reply": reply})

        except ClientError as exc:
            code = getattr(exc, "status_code", 500)
            logger.exception("[CivicSense Chat] ClientError %s", code)
            if code in (401, 403):
                return JsonResponse({"reply": "The assistant is temporarily unavailable."})
            return JsonResponse({"reply": "Something went wrong on my end. Please try again."})

        except Exception:
            logger.exception("[CivicSense Chat] Unexpected error")
            return JsonResponse({"reply": "Something went wrong on my end. Please try again."})
