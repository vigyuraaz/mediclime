import json
import time
from typing import Dict, Any, Optional
from config import DEFAULT_API_URL, DEFAULT_API_KEY, DEFAULT_TIMEOUT

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    HAS_REQUESTS = False

class MediclimeClient:
    """
    Python client for interacting with the Mediclime Medical Publishing API.
    Designed for external automation, CLI tools, and scheduled scripts.
    Works with either `requests` or built-in standard library `urllib`.
    """
    def __init__(self, api_url: str = DEFAULT_API_URL, api_key: str = DEFAULT_API_KEY):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "User-Agent": "Mediclime-Automation-Client/1.0"
        }
        if HAS_REQUESTS:
            self.session = requests.Session()
            self.session.headers.update(self.headers)

    def _http_post(self, url: str, payload: dict) -> dict:
        if HAS_REQUESTS:
            res = self.session.post(url, json=payload, timeout=DEFAULT_TIMEOUT)
            res.raise_for_status()
            return res.json()
        else:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=self.headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as response:
                return json.loads(response.read().decode("utf-8"))

    def _http_get(self, url: str) -> dict:
        if HAS_REQUESTS:
            res = self.session.get(url, timeout=DEFAULT_TIMEOUT)
            res.raise_for_status()
            return res.json()
        else:
            req = urllib.request.Request(url, headers=self.headers, method="GET")
            with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT) as response:
                return json.loads(response.read().decode("utf-8"))


    def generate_article(
        self,
        title: str,
        category: str = "Nervous Health",
        primary_keyword: Optional[str] = None,
        desired_word_count: int = 1500,
        auto_publish: bool = False,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """Request AI generation of a structured clinical article."""
        url = f"{self.api_url}/api/v1/integrations/articles/generate"
        payload = {
            "title": title,
            "category": category,
            "primary_keyword": primary_keyword or title,
            "desired_word_count": desired_word_count,
            "auto_publish": auto_publish,
            "idempotency_key": idempotency_key
        }
        return self._http_post(url, payload)

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Check the status of an asynchronous generation job."""
        url = f"{self.api_url}/api/v1/ai/jobs/{job_id}"
        return self._http_get(url)

    def poll_job(self, job_id: str, timeout: int = 60, poll_interval: int = 2) -> Dict[str, Any]:
        """Poll until the AI generation job reaches 'completed' or 'failed'."""
        start_time = time.time()
        print(f"Polling job {job_id}...")
        while time.time() - start_time < timeout:
            response = self.get_job_status(job_id)
            data = response.get("data", {})
            status = data.get("status")
            print(f"  -> Job Status: {status}")
            if status == "completed":
                return data
            elif status in ["failed", "cancelled"]:
                raise RuntimeError(f"Generation job {status}: {data.get('error')}")
            time.sleep(poll_interval)
        raise TimeoutError(f"Generation job timed out after {timeout} seconds")

    def submit_article(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a pre-formatted structured article JSON draft."""
        url = f"{self.api_url}/api/v1/integrations/articles"
        return self._http_post(url, article_data)

