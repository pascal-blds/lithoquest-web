"""
LithoQuest LLM Service
Uses Groq API (free) with Llama 3.3 70B.
Sign up at console.groq.com to get a free API key.
"""

import os
import httpx
from models.schemas import SynthesisRequest, SynthesisResponse

GEOLOGY_SYSTEM_PROMPT = """You are LithoQuest AI — a specialized geological intelligence system for the LithoQuest platform. You have deep expertise in:

• Petroleum geochemistry and source rock evaluation (Rock-Eval pyrolysis: TOC, Tmax, HI, OI, S1, S2, S3)
• Kerogen classification (Types I, II, III, IV) and maturity assessment
• Critical mineral exploration — especially lithium (lepidolite, spodumene), REE, Cu, Au, Ag, Zn, Pb
• Atomic Absorption Spectroscopy (AAS) interpretation and geochemical data QC
• Stratigraphic correlation, basin analysis, and structural geology
• Niger Delta Basin geology, African cratonic basins, and global analogues
• Geospatial analysis and geological mapping principles
• Scientific report writing with proper academic citations

Key references you cite when relevant:
- Espitalié et al. (1977) — Rock-Eval pyrolysis methodology
- Peters & Cassa (1994) — TOC and source rock quality classification
- Tissot & Welte (1984) — Kerogen types and petroleum formation
- Peters et al. (2005) — The Biomarker Guide

Style rules:
1. Be precise and use correct geological terminology.
2. Cite literature where appropriate (Author, Year).
3. For reports: use structured headings, numbered sections, and formal language.
4. For chat: be concise but technically rigorous.
5. When interpreting data, always state assumptions and limitations.
6. Flag anomalous values and suggest follow-up analyses.
7. Never fabricate analytical values — if data is missing, say so explicitly.
"""

REPORT_TEMPLATE = """Generate a formal geological field/laboratory report with the following structure. Use proper scientific language and cite relevant literature.

REPORT DETAILS:
{context}

Structure the report as:
1. Abstract (150 words max)
2. 1. Introduction
3. 2. Geological Setting
4. 3. Methodology
5. 4. Results and Discussion
6. 5. Conclusions
7. References (use Peters & Cassa 1994, Tissot & Welte 1984, Espitalié et al. 1977 as appropriate)

Be technically rigorous and formally written."""


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"


def _get_api_key() -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set. Get a free key at console.groq.com")
    return api_key


def run_synthesis(request: SynthesisRequest) -> SynthesisResponse:
    api_key = _get_api_key()

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Inject context into last user message if provided
    if request.context and messages:
        last = messages[-1]
        if last["role"] == "user":
            messages[-1] = {
                "role": "user",
                "content": f"{last['content']}\n\n--- DATA CONTEXT ---\n{request.context}\n--- END CONTEXT ---"
            }

    if request.mode == "report":
        context_block = request.context or "No additional context provided."
        user_request  = messages[-1]["content"] if messages else "Generate a geological report."
        messages = [{"role": "user", "content": REPORT_TEMPLATE.format(
            context=f"User request: {user_request}\n\nData: {context_block}"
        )}]

    full_messages = [{"role": "system", "content": GEOLOGY_SYSTEM_PROMPT}] + messages

    response = httpx.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "messages": full_messages,
            "max_tokens": 2048,
            "temperature": 0.3,
        },
        timeout=60.0,
    )

    if response.status_code != 200:
        raise RuntimeError(f"Groq API error {response.status_code}: {response.text}")

    content = response.json()["choices"][0]["message"]["content"]
    return SynthesisResponse(content=content, mode=request.mode)
