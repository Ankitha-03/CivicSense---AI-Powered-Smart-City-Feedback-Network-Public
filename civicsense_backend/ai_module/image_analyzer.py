# civicsense_backend/ai_module/image_analyzer.py

import cv2
import numpy as np
from PIL import Image

class ImageAnalyzer:
    """
    Additional image analysis utilities
    """
    
    @staticmethod
    def analyze_image_quality(image_path):
        """
        Analyze if the image is clear enough for classification
        Returns: (is_good_quality, quality_score, issues)
        """
        try:
            img = cv2.imread(image_path)
            
            if img is None:
                return False, 0.0, ["Could not read image"]
            
            issues = []
            quality_scores = []
            
            # Check 1: Image size
            height, width = img.shape[:2]
            if width < 300 or height < 300:
                issues.append("Image resolution too low")
                quality_scores.append(0.3)
            else:
                quality_scores.append(1.0)
            
            # Check 2: Brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            mean_brightness = np.mean(gray)
            
            if mean_brightness < 50:
                issues.append("Image too dark")
                quality_scores.append(0.4)
            elif mean_brightness > 200:
                issues.append("Image too bright")
                quality_scores.append(0.6)
            else:
                quality_scores.append(1.0)
            
            # Check 3: Blur detection (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            if laplacian_var < 100:
                issues.append("Image is blurry")
                quality_scores.append(0.5)
            else:
                quality_scores.append(1.0)
            
            # Calculate overall quality score
            overall_score = np.mean(quality_scores)
            is_good = overall_score > 0.6
            
            return is_good, overall_score, issues
            
        except Exception as e:
            return False, 0.0, [f"Error analyzing image: {str(e)}"]
    
    @staticmethod
    def extract_image_metadata(image_path):
        """
        Extract useful metadata from image
        """
        try:
            img = Image.open(image_path)
            
            metadata = {
                'format': img.format,
                'size': img.size,
                'mode': img.mode,
                'width': img.width,
                'height': img.height,
            }
            
            # Try to get EXIF data
            exif = img._getexif() if hasattr(img, '_getexif') else None
            if exif:
                metadata['has_exif'] = True
            
            return metadata
            
        except Exception as e:
            return {'error': str(e)}
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from civicsense_backend.ai_module.ai_classifier import IssueClassifier

classifier = IssueClassifier()

@api_view(['POST'])
def analyze_image(request):
    """
    REST API endpoint — analyze uploaded issue image using AI + quality checks
    """
    try:
        image = request.FILES.get('image') or request.FILES.get('photo')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Save temporarily
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            for chunk in image.chunks():
                tmp.write(chunk)
            temp_path = tmp.name

        # Run AI classification
        result = classifier.predict(temp_path)

        # Run quality analysis
        from civicsense_backend.ai_module.image_analyzer import ImageAnalyzer
        is_good, quality_score, issues = ImageAnalyzer.analyze_image_quality(temp_path)

        # Clean up temporary file
        os.remove(temp_path)

        # Merge results
        response_data = {
            "ai_category": result.get("category", "unknown"),
            "ai_confidence": result.get("confidence", 0.0),
            "image_quality_score": quality_score,
            "image_quality_issues": issues,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        print("🔥 AI ANALYZE ERROR:", e)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
