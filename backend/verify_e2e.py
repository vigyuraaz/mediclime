import sys
import requests

BASE_URL = "http://127.0.0.1:8000"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_full_pipeline():
    log("Starting comprehensive end-to-end verification...")
    
    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    log("Backend health check PASSED", "PASS")

    # 2. Public product detail check (ProDentim)
    res = requests.get(f"{BASE_URL}/api/v1/public/products/prodentim-prodentim")
    assert res.status_code == 200, f"Failed to fetch ProDentim: {res.text}"
    product = res.json()["data"]
    log(f"Fetched ProDentim: {product.get('name') or product.get('title')}", "PASS")
    
    # Check meta_keywords
    meta_keywords = product.get("meta_keywords")
    log(f"ProDentim meta_keywords: '{meta_keywords}'")
    assert meta_keywords and len(meta_keywords) > 5, "meta_keywords missing or empty!"
    kw_list = [k.strip() for k in meta_keywords.split(",") if k.strip()]
    assert len(kw_list) >= 4, f"Expected 5-6 keywords, got {len(kw_list)}"
    log(f"ProDentim has {len(kw_list)} valid meta keywords: {kw_list}", "PASS")

    # Check that description does NOT contain raw markdown '## '
    desc = product.get("description", "")
    assert "## " not in desc, f"Description contains raw markdown '## ': {desc[:200]}"
    log("ProDentim description is clean HTML without raw markdown '## ' headings", "PASS")

    # 3. Public site settings
    res = requests.get(f"{BASE_URL}/api/v1/public/settings")
    assert res.status_code == 200, f"Failed to fetch public settings: {res.text}"
    settings = res.json()["data"]
    log(f"Current Public Site Settings: Name='{settings.get('site_name')}', Tagline='{settings.get('site_tagline')}'", "PASS")
    assert "site_name" in settings
    assert "default_meta_keywords" in settings
    assert "announcement_text" in settings

    # 4. Admin Authentication
    login_res = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "admin@mediclime.com",
        "password": "MediclimeAdmin2026!"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    log("Admin authentication successful", "PASS")

    # 5. Plug & Play Site Settings Clone / Update
    test_update = {
        "site_name": "HealthVibe",
        "site_name_highlight": "Vibe",
        "site_tagline": "Next-Gen Vitality & Clinical Protocols",
        "announcement_enabled": True,
        "announcement_text": "Spring Special Protocol Launch 2026 • Verified Clinical Guides",
        "default_meta_title": "HealthVibe — Premium Evidence Health & Nutraceuticals",
        "default_meta_description": "HealthVibe evidence-based wellness platform and supplement facts database.",
        "default_meta_keywords": "healthvibe, longevity, vitamins, clinical health, nutraceuticals, wellness",
        "footer_copyright": "2026 HealthVibe Media & Health Group. All Rights Reserved.",
        "contact_email": "hello@healthvibe.test",
        "primary_color": "#0F6265",
        "accent_color": "#F43F5E"
    }
    
    put_res = requests.put(f"{BASE_URL}/api/v1/admin/settings", headers=headers, json=test_update)
    assert put_res.status_code == 200, f"Failed to update settings: {put_res.text}"
    updated_data = put_res.json()["data"]
    assert updated_data["site_name"] == "HealthVibe"
    assert updated_data["site_tagline"] == "Next-Gen Vitality & Clinical Protocols"
    assert updated_data["default_meta_keywords"] == "healthvibe, longevity, vitamins, clinical health, nutraceuticals, wellness"
    log("Admin Plug & Play settings successfully updated to 'HealthVibe'", "PASS")

    # Verify public settings reflects changes
    pub_res2 = requests.get(f"{BASE_URL}/api/v1/public/settings")
    pub_data2 = pub_res2.json()["data"]
    assert pub_data2["site_name"] == "HealthVibe"
    assert pub_data2["announcement_text"] == "Spring Special Protocol Launch 2026 • Verified Clinical Guides"
    log("Public settings immediately synchronized with updated brand clone", "PASS")

    # 6. Revert back to MediClime default branding so production defaults remain standard
    revert_update = {
        "site_name": "Mediclime",
        "site_name_highlight": "clime",
        "site_tagline": "Evidence-Led Health",
        "announcement_enabled": True,
        "announcement_text": "Clinical Evidence-First Editorial • Updated Medical Research 2026",
        "default_meta_title": "Mediclime — Evidence-Based Health & Supplement Reviews",
        "default_meta_description": "Evidence-based medical publishing platform providing peer-reviewed clinical guides, supplement facts, and therapeutic wellness protocols.",
        "default_meta_keywords": "medical blog, health guides, supplements, clinical nutrition, evidence-based wellness",
        "footer_copyright": "Mediclime Clinical Publishing Group. All rights reserved.",
        "contact_email": "support@mediclime.com",
        "primary_color": "#094749",
        "accent_color": "#F43F5E"
    }
    revert_res = requests.put(f"{BASE_URL}/api/v1/admin/settings", headers=headers, json=revert_update)
    assert revert_res.status_code == 200
    log("Site settings reset back to clean default Mediclime branding", "PASS")

    # 7. Article detail verification for meta_keywords
    art_res = requests.get(f"{BASE_URL}/api/v1/public/articles/understanding-peripheral-neuropathy")
    assert art_res.status_code == 200
    article = art_res.json()["data"]
    log(f"Article '{article['title']}' has meta_keywords: '{article.get('meta_keywords')}'", "PASS")
    assert article.get("meta_keywords"), "Article meta_keywords is empty!"

    print("\n========================================================")
    print("ALL 7 END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("========================================================\n")

if __name__ == "__main__":
    test_full_pipeline()
