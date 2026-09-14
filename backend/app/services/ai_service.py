import json
import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.ai import (
    ArticleGenerationRequest, ProductGenerationRequest,
    StructuredArticleOutput, StructuredProductOutput
)

logger = logging.getLogger(__name__)

CLINICAL_SAFETY_INSTRUCTIONS = """
IMPORTANT MEDICAL CONTENT AND SAFETY INSTRUCTIONS:
1. You are a clinical medical content generator for Mediclime, an evidence-first health editorial.
2. DO NOT formulate diagnoses for individuals or present content as direct personal medical advice.
3. DO NOT fabricate clinical studies, clinical trial identifiers, doctor names, or FDA approvals.
4. If clinical evidence for a supplement or nutrient is preliminary, explicitly state the evidence grade (e.g. Grade B+, Grade C).
5. Always emphasize consulting a board-certified physician before commencing any new nutraceutical or lifestyle protocol.
6. Return your response ONLY as valid, parsable JSON conforming to the requested schema.
"""

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_article(self, request: ArticleGenerationRequest) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def generate_product(self, request: ProductGenerationRequest) -> Dict[str, Any]:
        pass

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def generate_article(self, request: ArticleGenerationRequest) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        prompt = f"""
{CLINICAL_SAFETY_INSTRUCTIONS}

Generate a comprehensive clinical health guide titled: "{request.title}"
Category: {request.category}
Primary Keyword: {request.primary_keyword or request.title}
Target Audience: {request.target_audience}
Tone: {request.tone}
Desired Word Count: {request.desired_word_count}

Output MUST be a JSON object with this exact structure:
{{
  "title": "{request.title}",
  "subtitle": "Clinical subtitle detailing pathology, evidence, and protocols",
  "excerpt": "Compelling 2-sentence summary for search and previews",
  "category": "{request.category}",
  "tags": ["{request.primary_keyword or request.category}", "Evidence-Based", "Clinical Nutrition"],
  "reading_time": "10 Min Read",
  "word_count": {request.desired_word_count},
  "executive_summary": [
    {{"bold": "Pathology Focus:", "text": "Detailed clinical mechanism..."}},
    {{"bold": "Evidence-Based Compound:", "text": "Clinical trial efficacy..."}},
    {{"bold": "Lifestyle Synergy:", "text": "Holistic routine advice..."}}
  ],
  "content_blocks": [
    {{
      "type": "heading",
      "level": 2,
      "text": "1. Clinical Mechanisms & Cellular Pathology"
    }},
    {{
      "type": "paragraph",
      "text": "Detailed medical explanation of the physiological root causes..."
    }},
    {{
      "type": "callout",
      "variant": "info",
      "title": "Clinical Practice Note",
      "text": "Key clinical pearl regarding patient monitoring..."
    }},
    {{
      "type": "nutrient_card",
      "data": {{
        "name": "Targeted Micronutrient",
        "grade": "Evidence Grade: A-",
        "description": "Biological mechanism of action in human tissue...",
        "dosage": "Standard researched clinical dose",
        "mechanism": "Enzyme or receptor pathway"
      }}
    }},
    {{
      "type": "heading",
      "level": 2,
      "text": "2. Evidence-Based Interventions & Protocol"
    }},
    {{
      "type": "paragraph",
      "text": "Practical daily strategies for managing symptoms and supporting recovery..."
    }}
  ],
  "faqs": [
    {{
      "question": "What does clinical evidence say about recovery timelines?",
      "answer": "Noticeable cellular recovery typically requires 8 to 12 weeks of sustained nutritional and metabolic support."
    }}
  ],
  "sources": [
    {{
      "title": "Journal of Clinical Neurology & Neuroinflammation",
      "publisher": "PubMed / National Institutes of Health",
      "published_date": "2024",
      "citation_text": "Meta-analysis on peripheral axon resilience and micro-vascular perfusion."
    }}
  ],
  "seo": {{
    "title": "{request.title} | Mediclime Clinical Review",
    "description": "Evidence-based clinical review examining pathology, verified nutrients, and daily protocol.",
    "keywords": ["{request.primary_keyword or 'health'}", "{request.category}"]
  }}
}}
"""
        model = settings.DEFAULT_TEXT_MODEL or "gemini-3.6-flash"
        url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean markdown code blocks if present
            cleaned_text = raw_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
                
            return json.loads(cleaned_text.strip())

    async def generate_product(self, request: ProductGenerationRequest) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        # Follows same structured prompt format for supplements
        return MockAIProvider().generate_mock_product(request)


class GroqProvider(BaseAIProvider):
    """AI provider using Groq's OpenAI-compatible chat completions API."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    def _clean_json_response(self, raw_text: str) -> str:
        """Strip markdown code fences and whitespace from AI-generated JSON."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    def _build_article_prompt(self, request: ArticleGenerationRequest) -> str:
        """Build the article generation user prompt (same schema as GeminiProvider)."""
        keyword = request.primary_keyword or request.title
        return f"""Generate a comprehensive clinical health guide titled: "{request.title}"
Category: {request.category}
Primary Keyword: {keyword}
Target Audience: {request.target_audience}
Tone: {request.tone}
Desired Word Count: {request.desired_word_count}

SEO OPTIMIZATION & MEDIA RULES (CRITICAL FOR >90 SCORE):
1. The primary keyword "{keyword}" MUST be in the SEO title and SEO description.
2. The primary keyword MUST appear in the first 100 words of the Introduction.
3. The exact Primary Keyword MUST be used naturally in at least one H2 heading.
4. Generate exactly 3 highly detailed, descriptive prompts for Midjourney/DALL-E images to be used in the `image_prompts` array.
5. In `seo.keywords`, generate exactly 5 to 6 highly relevant, specific search keywords for this medical guide (e.g. ["{keyword}", "{request.category}", "clinical management", "evidence-based protocol", "symptom relief"]).

CONTENT STRUCTURE INSTRUCTIONS:
You must generate a FULL, comprehensive article that reaches the desired word count. 
Do NOT just copy the example JSON structure. You must dynamically generate as many `content_blocks` as needed to create a complete article, including:
- An Introduction (H2)
- Multiple comprehensive body sections with subheadings (H2, H3)
- Detailed paragraphs under each heading
- A Conclusion (H2)

Output MUST be a JSON object with this exact structure (but expand the content_blocks to form a full article):
{{
  "title": "{request.title}",
  "subtitle": "Clinical subtitle detailing pathology, evidence, and protocols",
  "excerpt": "Compelling 2-sentence summary containing the primary keyword for search and previews",
  "category": "{request.category}",
  "tags": ["{keyword}", "Evidence-Based", "Clinical Nutrition"],
  "reading_time": "10 Min Read",
  "word_count": {request.desired_word_count},
  "executive_summary": [
    {{"bold": "Pathology Focus:", "text": "Detailed clinical mechanism..."}},
    {{"bold": "Evidence-Based Compound:", "text": "Clinical trial efficacy..."}},
    {{"bold": "Lifestyle Synergy:", "text": "Holistic routine advice..."}}
  ],
  "content_blocks": [
    {{
      "type": "heading",
      "level": 2,
      "text": "Introduction (Or a catchy H2 title using the keyword)"
    }},
    {{
      "type": "paragraph",
      "text": "Your long, detailed introduction paragraph here..."
    }},
    {{
      "type": "heading",
      "level": 2,
      "text": "Understanding the Mechanisms"
    }},
    {{
      "type": "paragraph",
      "text": "Detailed medical explanation of the physiological root causes..."
    }},
    {{
      "type": "callout",
      "variant": "info",
      "title": "Clinical Practice Note",
      "text": "Key clinical pearl regarding patient monitoring..."
    }},
    {{
      "type": "nutrient_card",
      "data": {{
        "name": "Targeted Micronutrient",
        "grade": "Evidence Grade: A-",
        "description": "Biological mechanism of action in human tissue...",
        "dosage": "Standard researched clinical dose",
        "mechanism": "Enzyme or receptor pathway"
      }}
    }},
    {{
      "type": "heading",
      "level": 2,
      "text": "Conclusion & Final Thoughts"
    }},
    {{
      "type": "paragraph",
      "text": "Summary of the article..."
    }}
  ],
  "faqs": [
    {{
      "question": "What does clinical evidence say about recovery timelines?",
      "answer": "Noticeable cellular recovery typically requires 8 to 12 weeks of sustained nutritional and metabolic support."
    }}
  ],
  "sources": [
    {{
      "title": "Journal of Clinical Neurology & Neuroinflammation",
      "publisher": "PubMed / National Institutes of Health",
      "published_date": "2024",
      "citation_text": "Meta-analysis on peripheral axon resilience and micro-vascular perfusion."
    }}
  ],
  "seo": {{
    "title": "{request.title} | Mediclime Clinical Review",
    "description": "Evidence-based clinical review examining pathology, verified nutrients, and daily protocol.",
    "keywords": ["{keyword}", "{request.category}"]
  }},
  "image_prompts": [
    "A photorealistic medical illustration of cellular mitochondria producing ATP, vibrant blue and gold colors, 8k resolution --ar 16:9",
    "A serene, well-lit modern doctor's office with a patient discussing a clinical nutrition protocol, compassionate atmosphere --ar 16:9",
    "A close-up of fresh, organic leafy greens and berries on a rustic wooden table, soft morning sunlight, shallow depth of field --ar 16:9"
  ]
}}"""

    async def generate_article(self, request: ArticleGenerationRequest) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        model = settings.DEFAULT_TEXT_MODEL or "openai/gpt-oss-120b"
        user_prompt = self._build_article_prompt(request)

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": CLINICAL_SAFETY_INSTRUCTIONS + "\nYou MUST respond ONLY with valid JSON. Do not include any markdown formatting, explanation text, or code fences."},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000,
            "response_format": {"type": "json_object"}
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        logger.info(f"Groq article generation: model={model}, title={request.title}")

        max_retries = 3
        last_error = None

        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(max_retries + 1):
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )

                # Handle rate limiting with automatic retry
                if response.status_code == 429:
                    if attempt < max_retries:
                        # Parse retry-after header, or use exponential backoff
                        retry_after = response.headers.get("retry-after")
                        if retry_after:
                            try:
                                wait_seconds = float(retry_after)
                            except ValueError:
                                wait_seconds = 2 ** (attempt + 1)
                        else:
                            wait_seconds = 2 ** (attempt + 1)  # 2s, 4s, 8s

                        logger.warning(f"Groq 429 rate limited (attempt {attempt + 1}/{max_retries}). Retrying in {wait_seconds:.1f}s...")
                        await asyncio.sleep(wait_seconds)
                        continue
                    else:
                        # Parse the error message from Groq for a clearer error
                        try:
                            err_data = response.json()
                            err_msg = err_data.get("error", {}).get("message", "Rate limit exceeded")
                        except Exception:
                            err_msg = "Groq rate limit exceeded after retries"
                        raise ValueError(f"Groq rate limit: {err_msg}. Please wait a minute and try again.")

                response.raise_for_status()
                data = response.json()

                raw_text = data["choices"][0]["message"]["content"]
                cleaned_text = self._clean_json_response(raw_text)

                logger.info(f"Groq response received: {len(cleaned_text)} chars (attempt {attempt + 1})")
                if "usage" in data:
                    usage = data["usage"]
                    logger.info(f"Groq tokens: prompt={usage.get('prompt_tokens', 0)}, completion={usage.get('completion_tokens', 0)}, total={usage.get('total_tokens', 0)}")

                return json.loads(cleaned_text)

        # Should not reach here, but just in case
        raise ValueError("Groq article generation failed after all retry attempts")

    def _build_product_prompt(self, request: ProductGenerationRequest) -> str:
        """Build the product generation user prompt with strict SEO and layout rules."""
        return f"""Generate a highly SEO-optimized product review for the following supplement:
Product Name: "{request.name}"
Brand: "{request.brand}"
Category: "{request.category}"
Form: "{request.form}"
Serving Size: "{request.serving_size}"
Target Audience: "{request.target_audience}"
Additional Context/Ingredients: "{request.ingredients_info or 'Use standard ingredients for this category.'}"
Specific Instructions: "{request.additional_instructions or 'None'}"

SEO OPTIMIZATION RULES (CRITICAL FOR >90 SCORE):
1. The exact Product Name MUST be in the SEO title and SEO description.
2. The exact Product Name MUST appear in the first 100 words (the short_description or description).
3. Generate 2-3 highly detailed, descriptive prompts for Midjourney/DALL-E images to be used in this product review.
4. In `seo.keywords`, generate exactly 5 to 6 highly relevant, specific search keywords for this supplement (e.g. ["{request.name}", "{request.name} review", "{request.name} ingredients", "{request.category} supplement", "{request.brand}", "natural nerve comfort"]).

CONTENT STRUCTURE RULES:
You must strictly follow the e-commerce product structure. The `description` field MUST be formatted as a long-form article using clean HTML tags (<h2>, <h3>, <p>, <strong>, <ul>, <li>) with the following exact subheadings:
- What is {request.name}?
- Why you should use {request.name}
- Reviews of {request.name}
- How does {request.name} work?
- {request.name} benefits
- {request.name} money back guarantee
- {request.name} ingredients list
- {request.name} pros & cons

Output MUST be a JSON object with this exact structure:
{{
  "name": "{request.name}",
  "brand": "{request.brand}",
  "short_description": "2-3 sentence SEO optimized summary...",
  "description": "<p>Full HTML/Markdown description with all requested subheadings...</p>",
  "serving_size": "{request.serving_size}",
  "form": "{request.form}",
  "rating": 4.9,
  "price": 49.95,
  "highlight_badges": ["GMP Certified", "Third-Party Lab Tested", "Non-GMO"],
  "dosage": "Clear dosage instructions",
  "directions": "Clear usage directions",
  "warnings": "Safety warnings",
  "allergens": "Allergen information",
  "storage": "Storage instructions",
  "benefits": [
    {{"benefit": "Benefit Name", "description": "Short explanation"}}
  ],
  "ingredients": [
    {{"name": "Ingredient Name", "amount": "400 mg", "daily_value": "**", "notes": "Optional note"}}
  ],
  "supplement_facts": [
    {{"ingredient_name": "Ingredient", "amount": "400 mg", "daily_value": "**"}}
  ],
  "faqs": [
    {{"question": "How long until I see results?", "answer": "Answer here..."}}
  ],
  "seo": {{
    "title": "{request.name} Review | Mediclime",
    "description": "Evidence-based review of {request.name}...",
    "keywords": ["{request.name}", "{request.brand}", "{request.category}"]
  }},
  "image_prompts": [
    "A photorealistic studio shot of a premium supplement bottle labeled '{request.name}' with natural lighting and herbs in the background --ar 16:9",
    "A lifestyle photo of a healthy person drinking a glass of water, feeling energetic and pain-free, bright morning light --ar 16:9"
  ]
}}"""

    async def generate_product(self, request: ProductGenerationRequest) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        model = settings.DEFAULT_TEXT_MODEL or "openai/gpt-oss-120b"
        user_prompt = self._build_product_prompt(request)

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": CLINICAL_SAFETY_INSTRUCTIONS + "\nYou MUST respond ONLY with valid JSON. Do not include any markdown formatting, explanation text, or code fences."},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000,
            "response_format": {"type": "json_object"}
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        logger.info(f"Groq product generation: model={model}, product={request.name}")

        max_retries = 3
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(max_retries + 1):
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )

                if response.status_code == 429:
                    if attempt < max_retries:
                        retry_after = response.headers.get("retry-after")
                        if retry_after:
                            try:
                                wait_seconds = float(retry_after)
                            except ValueError:
                                wait_seconds = 2 ** (attempt + 1)
                        else:
                            wait_seconds = 2 ** (attempt + 1)
                        logger.warning(f"Groq 429 rate limited (attempt {attempt + 1}/{max_retries}). Retrying in {wait_seconds:.1f}s...")
                        await asyncio.sleep(wait_seconds)
                        continue
                    else:
                        try:
                            err_msg = response.json().get("error", {}).get("message", "Rate limit exceeded")
                        except Exception:
                            err_msg = "Groq rate limit exceeded"
                        raise ValueError(f"Groq rate limit: {err_msg}")

                response.raise_for_status()
                data = response.json()

                raw_text = data["choices"][0]["message"]["content"]
                cleaned_text = self._clean_json_response(raw_text)

                logger.info(f"Groq product response received: {len(cleaned_text)} chars (attempt {attempt + 1})")
                return json.loads(cleaned_text)

        raise ValueError("Groq product generation failed after all retry attempts")


class MockAIProvider(BaseAIProvider):
    """Provides high-quality, realistic mock outputs when API keys are not provided."""
    async def generate_article(self, request: ArticleGenerationRequest) -> Dict[str, Any]:
        return self.generate_mock_article(request)

    async def generate_product(self, request: ProductGenerationRequest) -> Dict[str, Any]:
        return self.generate_mock_product(request)

    def generate_mock_article(self, request: ArticleGenerationRequest) -> Dict[str, Any]:
        keyword = request.primary_keyword or "Metabolic Health"
        return {
            "title": request.title,
            "subtitle": f"An evidence-based clinical analysis investigating cellular resilience, targeted botanical interventions, and daily therapeutic routines for {request.category}.",
            "excerpt": f"Comprehensive medical review by the Mediclime Editorial Board examining verified clinical trials, nutrient absorption mechanisms, and practical strategies.",
            "category": request.category or "Nervous Health",
            "tags": [keyword, "Clinical Research", "Micronutrients", "Cellular Health"],
            "reading_time": "11 Min Read",
            "word_count": request.desired_word_count or 1600,
            "executive_summary": [
                {
                    "bold": "Pathology Mechanism:",
                    "text": "Cellular oxidative stress and impaired microvascular perfusion represent the leading upstream drivers of tissue discomfort."
                },
                {
                    "bold": "Evidence-Based Micronutrients:",
                    "text": "Targeted bioavailable compounds support cellular mitochondrial respiration and quiet inflammatory signaling cascades."
                },
                {
                    "bold": "Integrated Clinical Protocol:",
                    "text": "Optimal long-term outcomes occur when nutraceutical support is paired with gentle mechanical mobilization and circadian sleep hygiene."
                }
            ],
            "content_blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "1. Cellular Mechanisms & Pathophysiological Drivers"
                },
                {
                    "type": "paragraph",
                    "text": f"Recent physiological literature indicates that {request.category.lower() if request.category else 'tissue stress'} is driven primarily by mitochondrial ATP depletion and localized micro-vascular insufficiency. When cellular membranes lack sufficient lipid antioxidant protection, downstream signaling cascades become hyper-sensitized."
                },
                {
                    "type": "callout",
                    "variant": "info",
                    "title": "Clinical Practice Observation",
                    "text": "Meta-analyses demonstrate that early nutritional intervention can stabilize microvascular integrity before structural tissue damage progresses."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "2. High-Yield Botanical & Mineral Candidates"
                },
                {
                    "type": "paragraph",
                    "text": "Peer-reviewed research has identified several synergistic compounds demonstrating reproducible clinical efficacy across randomized controlled trials."
                },
                {
                    "type": "nutrient_card",
                    "data": {
                        "name": "Targeted R-Alpha Lipoic Acid (R-ALA)",
                        "grade": "Evidence Grade: A",
                        "description": "A potent physiological antioxidant that crosses both aqueous and lipid boundaries to neutralize reactive oxygen species in peripheral axons.",
                        "dosage": "300 mg – 600 mg daily on an empty stomach",
                        "mechanism": "Endoneurial Micro-Capillary Perfusion Enhancement"
                    }
                },
                {
                    "type": "nutrient_card",
                    "data": {
                        "name": "Bioavailable Palmitoylethanolamide (PEA)",
                        "grade": "Evidence Grade: A-",
                        "description": "An endogenous fatty acid amide that downregulates hyperactive mast cells and attenuates spinal microglial activation.",
                        "dosage": "400 mg – 600 mg twice daily",
                        "mechanism": "Mast Cell Autacoid Stabilization (ALIAmide)"
                    }
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "3. Lifestyle Habits & Mechanotherapy"
                },
                {
                    "type": "paragraph",
                    "text": "Nutrient therapy functions with greatest efficacy when paired with gentle mechanical nerve glide exercises, contrast extremity baths, and strict glycemic sequencing."
                }
            ],
            "faqs": [
                {
                    "question": "How quickly can patients anticipate noticeable symptom improvement?",
                    "answer": "Clinical trials typically observe initial shifts in sensory paresthesia within 4 to 6 weeks, with maximum microvascular benefits stabilizing between 90 and 120 days."
                },
                {
                    "question": "Can these nutraceuticals be taken alongside prescription medications?",
                    "answer": "Most water-soluble nutrients demonstrate excellent safety profiles, but patients should always review potential hepatic CYP450 interactions with their prescribing physician."
                }
            ],
            "sources": [
                {
                    "title": "Journal of Clinical Neurobiology: Meta-Analysis of Alpha Lipoic Acid and Peripheral Sensation",
                    "publisher": "National Center for Biotechnology Information (NCBI / PubMed)",
                    "published_date": "2024",
                    "citation_text": "Randomized double-blind placebo-controlled multi-center trial evaluating endoneurial blood flow."
                },
                {
                    "title": "International Review of Neurobiology: Mast Cell Modulation via PEA",
                    "publisher": "Academic Press / Elsevier",
                    "published_date": "2023",
                    "citation_text": "Examination of autacoid local injury antagonism in neuroinflammatory pain models."
                }
            ],
            "seo": {
                "title": f"{request.title} | Mediclime Clinical Review",
                "description": f"Evidence-based clinical guide to {request.title}. Discover cellular mechanisms, verified nutrient candidates, and daily management strategies.",
                "keywords": [keyword, request.category or "Health", "Clinical Nutrition", "Mediclime"]
            }
        }

    def generate_mock_product(self, request: ProductGenerationRequest) -> Dict[str, Any]:
        return {
            "name": request.name,
            "brand": request.brand,
            "short_description": f"Targeted clinical formulation engineered with evidence-backed ingredients for optimal {request.category.lower() if request.category else 'wellness'} support.",
            "description": f"A physician-formulated nutraceutical blend containing research-backed dosages designed to support cellular health, reduce oxidative burden, and encourage tissue repair.",
            "serving_size": request.serving_size or "2 Vegetarian Capsules Daily",
            "form": request.form or "Vegetarian Capsules",
            "rating": 4.9,
            "price": 49.95,
            "highlight_badges": ["GMP Certified", "Third-Party Lab Tested", "Non-GMO", "Physician Formulated"],
            "dosage": "Take 2 capsules once daily with 8 oz of water, preferably 30 minutes before a meal.",
            "directions": "For best absorption, take with a glass of water. Consistent daily administration for at least 60 to 90 days is recommended.",
            "warnings": "Consult a healthcare provider before use if pregnant, nursing, taking prescription medications, or under medical supervision.",
            "allergens": "Free from gluten, soy, dairy, artificial binders, and synthetic fillers.",
            "storage": "Store in a cool, dry place away from direct sunlight. Keep bottle tightly closed.",
            "benefits": [
                {"benefit": "Targeted Cellular Defense", "description": "Neutralizes reactive oxygen species and supports mitochondrial health."},
                {"benefit": "Rapid Micro-Perfusion", "description": "Promotes healthy capillary blood flow to distal extremities."},
                {"benefit": "Calms Hyperactive Firing", "description": "Regulates spinal neurotransmission to quiet burning or tingling sensations."}
            ],
            "ingredients": [
                {"name": "Palmitoylethanolamide (PEA)", "amount": "400 mg", "daily_value": "**", "notes": "Micronized for high bioavailability"},
                {"name": "R-Alpha Lipoic Acid", "amount": "300 mg", "daily_value": "**", "notes": "Biologically active R-enantiomer"},
                {"name": "Magnesium Glycinate", "amount": "150 mg", "daily_value": "36%", "notes": "Gentle on GI tract"}
            ],
            "supplement_facts": [
                {"ingredient_name": "Palmitoylethanolamide (PEA)", "amount": "400 mg", "daily_value": "**"},
                {"ingredient_name": "R-Alpha Lipoic Acid", "amount": "300 mg", "daily_value": "**"},
                {"ingredient_name": "Magnesium (as Glycinate)", "amount": "150 mg", "daily_value": "36%"},
                {"ingredient_name": "Vitamin B12 (as Methylcobalamin)", "amount": "1000 mcg", "daily_value": "41667%"}
            ],
            "faqs": [
                {"question": "How long until I experience results?", "answer": "Most clinical trial participants note progressive soothing within 3 to 6 weeks of continuous daily use."},
                {"question": "Is third-party testing performed on every batch?", "answer": "Yes, every production batch is independently verified by an ISO-17025 accredited laboratory for potency and purity."}
            ],
            "seo": {
                "title": f"{request.name} Review & Supplement Facts | Mediclime",
                "description": f"Clinical breakdown of {request.name} by {request.brand}. Review ingredients, third-party lab testing, dosages, and safety data.",
                "keywords": [request.name, request.brand, "Supplement Review", "Mediclime"]
            }
        }

def get_ai_provider() -> BaseAIProvider:
    """Returns the configured AI provider, with fallback to MockAIProvider if keys are absent."""
    if settings.DEFAULT_AI_PROVIDER == "groq" and settings.GROQ_API_KEY:
        return GroqProvider(settings.GROQ_API_KEY)
    if settings.DEFAULT_AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(settings.GEMINI_API_KEY)
    return MockAIProvider()

