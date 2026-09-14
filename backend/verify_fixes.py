import requests

BASE_BACKEND = "http://127.0.0.1:8000"
BASE_FRONTEND = "http://127.0.0.1:5173"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_fixes():
    log("Starting verification of Google Search Console verification & Heading Typography fixes...")

    # 1. Health check
    res = requests.get(f"{BASE_BACKEND}/health")
    assert res.status_code == 200
    log("Backend is healthy.", "PASS")

    # 2. Test Google HTML file verification endpoint
    res_google = requests.get(f"{BASE_BACKEND}/google4k9A_J6l1test.html")
    assert res_google.status_code == 200
    assert "google-site-verification: google4k9A_J6l1test.html" in res_google.text
    log(f"Google Search Console HTML file verification endpoint returned: '{res_google.text.strip()}'", "PASS")

    # 3. Test Admin Authentication & Updating Google Search Console verification
    login_res = requests.post(f"{BASE_BACKEND}/api/v1/auth/login", json={
        "email": "admin@mediclime.com",
        "password": "MediclimeAdmin2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    log("Admin authenticated successfully.", "PASS")

    # Update Google Search Console verification setting
    test_verification = "<meta name=\"google-site-verification\" content=\"test_token_google_search_console_2026_xyz\" />"
    put_res = requests.put(f"{BASE_BACKEND}/api/v1/admin/settings", headers=headers, json={
        "google_search_console_verification": test_verification
    })
    assert put_res.status_code == 200
    saved_data = put_res.json()["data"]
    assert saved_data["google_search_console_verification"] == test_verification
    log(f"Admin successfully saved Google Search Console verification: '{saved_data['google_search_console_verification']}'", "PASS")

    # Verify public settings endpoint serves it
    pub_res = requests.get(f"{BASE_BACKEND}/api/v1/public/settings")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()["data"]
    assert pub_data["google_search_console_verification"] == test_verification
    log("Public settings endpoint returned google_search_console_verification.", "PASS")

    # 4. Check Mitolyn public product detail HTML
    mitolyn_res = requests.get(f"{BASE_BACKEND}/api/v1/public/products/mitolyn-mitolyn")
    assert mitolyn_res.status_code == 200
    prod_data = mitolyn_res.json()["data"]
    desc = prod_data["description"]
    assert "<h2>What is Mitolyn?</h2>" in desc
    assert "<h2>Why you should use Mitolyn</h2>" in desc
    assert "<h2>Reviews of Mitolyn</h2>" in desc
    assert "<h2>How does Mitolyn work?</h2>" in desc
    log("Mitolyn description has proper <h2> tags in API response.", "PASS")

    # 5. Check frontend dev server response
    front_res = requests.get(BASE_FRONTEND)
    assert front_res.status_code == 200
    assert "root" in front_res.text
    log("Frontend dev server is running and accessible.", "PASS")

    print("\n========================================================")
    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("========================================================\n")

if __name__ == "__main__":
    test_fixes()
