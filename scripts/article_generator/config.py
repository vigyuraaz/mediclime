import os

DEFAULT_API_URL = os.getenv("MEDICLIME_API_URL", "http://localhost:8000")
DEFAULT_API_KEY = os.getenv("MEDICLIME_API_KEY", "med_live_demo_test_api_key_2026")
DEFAULT_TIMEOUT = int(os.getenv("MEDICLIME_TIMEOUT", "60"))
