"""
Generate actual XAI visualization outputs (Grad-CAM, LIME, SHAP) for a sample MRI scan.
Saves them as PNG images in report_assets/.
"""

import os
import base64
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
SAMPLE_IMAGE = os.path.join(BASE_DIR, "BrainTumorDataset", "Testing", "glioma", "Te-gl_1.jpg")
OUTPUT_DIR = os.path.join(ROOT_DIR, "report_assets")

def save_base64_image(base64_str, filename):
    if not base64_str:
        print(f"Warning: No data for {filename}")
        return False
    try:
        img_data = base64.b64decode(base64_str)
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, "wb") as f:
            f.write(img_data)
        print(f"Saved: {path}")
        return True
    except Exception as e:
        print(f"Error saving {filename}: {e}")
        return False

def main():
    print("Generating sample explainability visuals (Grad-CAM, LIME, SHAP)...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    if not os.path.exists(SAMPLE_IMAGE):
        raise FileNotFoundError(f"Sample image not found: {SAMPLE_IMAGE}")
        
    url = "http://localhost:5000/explain"
    print(f"Uploading {SAMPLE_IMAGE} to {url}...")
    
    try:
        with open(SAMPLE_IMAGE, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
            
        if response.status_code != 200:
            print(f"Error: API returned status code {response.status_code}")
            print(response.text)
            return
            
        result = response.json()
        print("API request successful. Decoding visual assets...")
        
        save_base64_image(result.get("heatmap"), "gradcam_output.png")
        save_base64_image(result.get("lime"), "lime_output.png")
        save_base64_image(result.get("shap"), "shap_output.png")
        
        print("XAI sample export complete.")
        
    except requests.exceptions.ConnectionError:
        print("Error: Flask API is not running. Please start the API server first by running start.bat.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
