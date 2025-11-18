import random

def analyze_issue_photo(photo_path):
    """
    Dummy AI logic — replace with real AI API later.
    photo_path: local path to uploaded image
    """
    categories = [
        "Road Damage",
        "Garbage Collection",
        "Electrical Issue",
        "Water Supply",
        "Other"
    ]
    
    # TODO: Replace this section with actual ML model inference
    # For now, pick a random one to test flow
    prediction = random.choice(categories)
    print(f"AI predicted category: {prediction} for photo {photo_path}")
    return prediction
