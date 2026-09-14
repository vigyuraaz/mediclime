import httpx
import asyncio

async def list_models():
    api_key = "AQ.Ab8RN6Lvw8KV4Cu8Gf5zpQt9_b82FnYTAk25wF_tujec_nT8eQ"
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            models = response.json().get('models', [])
            for m in models:
                if 'generateContent' in m.get('supportedGenerationMethods', []):
                    print(m['name'])
        else:
            print(response.status_code, response.text)

asyncio.run(list_models())
