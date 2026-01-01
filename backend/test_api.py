import requests
import json

# Test the predict endpoint
url = "http://localhost:8000/predict"
data = {"text": "레이저 거리측정기"}

print("Sending request...")
response = requests.post(url, json=data)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
