# civicsense_backend/ai_module/ai_classifier.py

import os
import numpy as np
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
from django.conf import settings

class IssueClassifier:

    """
    AI-powered issue classifier using CLIP model from HuggingFace
    Can classify images into civic issue categories
    """
    
    def __init__(self):
        
        self.categories = {
            'road_damage': ['pothole', 'road damage', 'broken road', 'crack in road'],
            'garbage': ['garbage pile', 'trash', 'waste', 'litter', 'dumping'],
            'electrical': ['broken streetlight', 'power line', 'electric pole', 'cable'],
            'water_supply': ['water leak', 'broken pipe', 'sewage', 'drainage'],
            'other': ['general issue', 'miscellaneous']
        }
        
        # Load CLIP model (runs on CPU, no GPU needed)
        print("Loading CLIP model...")
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("✅ CLIP model loaded successfully")
    
    def classify_image(self, image_path):
        """
        Classify an image into one of the civic issue categories
        Returns: (category, confidence_score, detected_issues)
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            
            # Prepare all possible labels
            all_labels = []
            label_to_category = {}
            
            for category, keywords in self.categories.items():
                for keyword in keywords:
                    all_labels.append(keyword)
                    label_to_category[keyword] = category
            
            # Process image and text
            inputs = self.processor(
                text=all_labels,
                images=image,
                return_tensors="pt",
                padding=True
            )
            
            # Get predictions
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
            
            # Get top prediction
            top_prob_idx = probs.argmax().item()
            confidence = probs[0][top_prob_idx].item()
            detected_label = all_labels[top_prob_idx]
            category = label_to_category[detected_label]
            
            # Get top 3 detections
            top_3_indices = probs[0].argsort(descending=True)[:3]
            detected_issues = [
                {
                    'label': all_labels[idx],
                    'confidence': probs[0][idx].item(),
                    'category': label_to_category[all_labels[idx]]
                }
                for idx in top_3_indices
            ]
            
            return {
                'category': category,
                'confidence': confidence,
                'detected_label': detected_label,
                'all_detections': detected_issues
            }
            
        except Exception as e:
            print(f"Error in image classification: {e}")
            return {
                'category': 'other',
                'confidence': 0.0,
                'detected_label': 'unknown',
                'all_detections': [],
                'error': str(e)
            }
    
    def classify_text(self, title, description):
        """
        Classify issue based on text description
        Returns: category
        """
        text = f"{title} {description}".lower()
        
        # Simple keyword matching
        for category, keywords in self.categories.items():
            for keyword in keywords:
                if keyword in text:
                    return category
        
        return 'other'
    def predict(self, image_path):
        """Alias for classify_image(), used by API endpoint"""
        return self.classify_image(image_path)