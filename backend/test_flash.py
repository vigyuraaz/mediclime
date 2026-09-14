import httpx
import asyncio

async def test_flash():
    api_key = "AQ.Ab8RN6Lvw8KV4Cu8Gf5zpQt9_b82FnYTAk25wF_tujec_nT8eQ"
    model = "gemini-3.6-flash"
    prompt = "Hello"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            headers={"Content-Type": "application/json"}
        )
        print("Status:", response.status_code)
        try:
            print(response.json())
        except:
            print(response.text)

asyncio.run(test_flash())
