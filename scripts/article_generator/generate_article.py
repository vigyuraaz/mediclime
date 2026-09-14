#!/usr/bin/env python3
"""
Mediclime Automated Article Generator CLI
Generates peer-reviewed clinical articles through the Mediclime REST API.
"""
import sys
import json
import argparse
from client import MediclimeClient
from config import DEFAULT_API_URL, DEFAULT_API_KEY

def main():
    parser = argparse.ArgumentParser(description="Mediclime Clinical Article Generator CLI")
    parser.add_argument("--title", required=True, help="Clinical article headline")
    parser.add_argument("--category", default="Nervous Health", help="Health category (e.g. 'Nervous Health', 'Metabolic Support')")
    parser.add_argument("--keyword", help="Primary focus keyword")
    parser.add_argument("--word-count", type=int, default=1500, help="Target word count")
    parser.add_argument("--auto-publish", action="store_true", help="Attempt to publish directly if API key permits")
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help="Mediclime backend API URL")
    parser.add_argument("--api-key", default=DEFAULT_API_KEY, help="API Key for authentication")
    parser.add_argument("--no-poll", action="store_true", help="Queue job and exit without polling")

    args = parser.parse_args()

    client = MediclimeClient(api_url=args.api_url, api_key=args.api_key)

    print("=" * 60)
    print(" Mediclime Clinical Content Generator")
    print("=" * 60)
    print(f"Target Title : {args.title}")
    print(f"Category     : {args.category}")
    print(f"Word Count   : {args.word_count}")
    print(f"Auto Publish : {args.auto_publish}")
    print(f"Endpoint     : {args.api_url}")
    print("=" * 60)

    try:
        # 1. Trigger generation job
        print("Dispatching generation job...")
        response = client.generate_article(
            title=args.title,
            category=args.category,
            primary_keyword=args.keyword,
            desired_word_count=args.word_count,
            auto_publish=args.auto_publish
        )

        job_id = response.get("data", {}).get("job_id")
        print(f"Job successfully queued! Job ID: {job_id}")

        if args.no_poll:
            print("Finished without polling.")
            return

        # 2. Poll job status
        job_result = client.poll_job(job_id)
        output_data = job_result.get("output_data", {})
        
        print("\n" + "=" * 60)
        print(" Generation Completed Successfully!")
        print("=" * 60)
        print(f"Article ID   : {output_data.get('article_id')}")
        print(f"Article Slug : {output_data.get('slug')}")
        print(f"Article Title: {output_data.get('title')}")
        print(f"Status       : {output_data.get('status')}")
        print("=" * 60)
        print("Summary output:")
        print(json.dumps(output_data, indent=2))
        
    except Exception as e:
        print(f"\n[ERROR] Generation failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
