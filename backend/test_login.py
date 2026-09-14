import requests

url = "http://localhost:8000/api/v1/auth/login"
payload = {
    "email": "admin@mediclime.com",
    "password": "MediclimeAdmin2026!"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
