#!/usr/bin/env python3
"""
Mediclime Direct Structured Article Publisher CLI
Submits a structured article JSON file directly to the Mediclime API.
"""
import sys
import json
import argparse
from client import MediclimeClient
from config import DEFAULT_API_URL, DEFAULT_API_KEY

def main():
    parser = argparse.ArgumentParser(description="Mediclime Direct Article Publisher")
    parser.add_argument("--file", required=True, help="Path to JSON file containing structured article")
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help="Mediclime backend API URL")
    parser.add_argument("--api-key", default=DEFAULT_API_KEY, help="API Key for authentication")
    parser.add_argument("--publish", action="store_true", help="Set status to published")

    args = parser.parse_args()

    with open(args.file, "r", encoding="utf-8") as f:
        article_data = json.load(f)

    if args.publish:
        article_data["status"] = "published"

    client = MediclimeClient(api_url=args.api_url, api_key=args.api_key)

    print(f"Submitting article: {article_data.get('title')}...")
    res = client.submit_article(article_data)
    print("Response:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
