import requests
import os

# Create a dummy image file
with open("test_image.png", "wb") as f:
    f.write(os.urandom(1024)) # 1KB random data

url = "http://localhost:8000/api/v1/media"
payload = {
    "email": "admin@mediclime.com",
    "password": "MediclimeAdmin2026!"
}

# 1. Login to get token
login_res = requests.post("http://localhost:8000/api/v1/auth/login", json=payload)
token = login_res.json()["data"]["access_token"]

# 2. Upload file
headers = {
    "Authorization": f"Bearer {token}"
}
files = {
    "file": ("test_image.png", open("test_image.png", "rb"), "image/png")
}

upload_res = requests.post(url, headers=headers, files=files)
print(f"Status Code: {upload_res.status_code}")
print(f"Response: {upload_res.text}")
