import httpx
import asyncio

async def test_gemini():
    api_key = "AQ.Ab8RN6Lvw8KV4Cu8Gf5zpQt9_b82FnYTAk25wF_tujec_nT8eQ"
    model = "gemini-3.1-pro-preview"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    prompt = "Hello"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            headers={"Content-Type": "application/json"}
        )
        print(response.status_code)
        try:
            print(response.json())
        except Exception as e:
            print(response.text)

asyncio.run(test_gemini())
