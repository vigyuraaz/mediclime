import httpx
import asyncio

async def test_models():
    api_key = "AQ.Ab8RN6Lvw8KV4Cu8Gf5zpQt9_b82FnYTAk25wF_tujec_nT8eQ"
    
    models_to_test = [
        "gemini-pro-latest",
        "gemini-2.5-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-pro-preview"
    ]
    
    prompt = "Hello"
    async with httpx.AsyncClient() as client:
        for model in models_to_test:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            response = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"}
            )
            print(f"--- {model} ---")
            print("Status:", response.status_code)
            try:
                data = response.json()
                if "error" in data:
                    print("Error:", data["error"]["message"])
                else:
                    print("Success!")
            except:
                pass

asyncio.run(test_models())
