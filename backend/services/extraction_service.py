"""
LithoQuest Extraction Service
AI-powered structured data extraction from unstructured geological field reports.
Uses Groq (free) with Llama 3.3 70B as the extraction engine.

Capabilities:
  1. VES (Vertical Electrical Sounding) data extraction
  2. Hydrogeological classification
  3. Mineral liberation / processing data extraction
"""

import os
import json
import re
import httpx

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

# ── Prompts ──────────────────────────────────────────────────────────────────

VES_PROMPT = """You are a geological data extraction engine for the LithoQuest platform.

Your ONLY job: extract ALL Vertical Electrical Sounding (VES) layer data from the provided field report text.

RULES:
- Return ONLY a valid JSON array. No preamble, no explanation, no markdown code fences.
- If a value is not mentioned, use null.
- Extract EVERY layer mentioned across ALL VES stations in the text.
- Numbers must be numeric (float or int), not strings.

Each element in the array must follow this exact schema:
{
  "station_id": string or null,
  "location": string or null,
  "layer_number": integer or null,
  "layer_depth_m": float or null,
  "layer_thickness_m": float or null,
  "resistivity_ohm_m": float or null,
  "lithology_description": string or null,
  "aquifer_type": string or null,
  "water_table_depth_m": float or null
}

Begin extraction now. Output JSON only."""

HYDRO_PROMPT = """You are a hydrogeological data extraction engine for the LithoQuest platform.

Your ONLY job: extract ALL hydrogeological information from the provided field notes or report.

RULES:
- Return ONLY a valid JSON object. No preamble, no explanation, no markdown code fences.
- If a value is not mentioned, use null.
- lithology_sequence must be a JSON array of strings (ordered from surface to depth).
- Numbers must be numeric (float or int), not strings.

The JSON object must follow this exact schema:
{
  "location": string or null,
  "coordinates": string or null,
  "aquifer_type": string or null,
  "aquifer_classification": string or null,
  "water_table_depth_m": float or null,
  "static_water_level_m": float or null,
  "saturated_thickness_m": float or null,
  "hydraulic_conductivity_m_per_day": float or null,
  "transmissivity_m2_per_day": float or null,
  "borehole_yield_l_per_s": float or null,
  "water_quality_description": string or null,
  "total_dissolved_solids_mg_l": float or null,
  "ph": float or null,
  "lithology_sequence": [string] or [],
  "overburden_thickness_m": float or null,
  "weathered_layer_thickness_m": float or null,
  "fractured_zone_depth_m": float or null,
  "recommendations": string or null,
  "overall_groundwater_potential": string or null
}

Begin extraction now. Output JSON only."""

MINERAL_LIBERATION_PROMPT = """You are a mineral processing and liberation data extraction engine for the LithoQuest platform.

Your ONLY job: extract ALL mineral processing, liberation, and assay data from the provided text.

RULES:
- Return ONLY a valid JSON array. No preamble, no explanation, no markdown code fences.
- If a value is not mentioned, use null.
- reagents must be a JSON array of strings.
- Numbers must be numeric (float or int), not strings.
- Extract data for EVERY mineral or ore type mentioned.

Each element must follow this exact schema:
{
  "mineral": string or null,
  "mineral_formula": string or null,
  "ore_type": string or null,
  "deposit_type": string or null,
  "head_grade_percent": float or null,
  "head_grade_ppm": float or null,
  "optimal_crushing_size_mm": float or null,
  "primary_grinding_size_microns": float or null,
  "liberation_size_microns": float or null,
  "p80_microns": float or null,
  "recovery_percent": float or null,
  "concentrate_grade_percent": float or null,
  "processing_method": string or null,
  "flotation_reagents": [string] or [],
  "leaching_reagent": string or null,
  "leach_recovery_percent": float or null,
  "water_requirements_l_per_t": float or null,
  "energy_kwh_per_t": float or null,
  "notes": string or null
}

Begin extraction now. Output JSON only."""


# ── Groq caller ───────────────────────────────────────────────────────────────

def _call_groq(system_prompt: str, user_text: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set. Get a free key at console.groq.com")

    response = httpx.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": f"FIELD REPORT TEXT:\n\n{user_text}"},
            ],
            "max_tokens": 4096,
            "temperature": 0.0,   # deterministic for data extraction
        },
        timeout=90.0,
    )

    if response.status_code != 200:
        raise RuntimeError(f"Groq API error {response.status_code}: {response.text}")

    return response.json()["choices"][0]["message"]["content"].strip()


def _clean_json(raw: str) -> str:
    """Strip any markdown fences the model may have added despite instructions."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"```$",          "", raw, flags=re.MULTILINE)
    return raw.strip()


# ── VES Extraction ────────────────────────────────────────────────────────────

def extract_ves(text: str, source: str | None = None) -> dict:
    raw     = _call_groq(VES_PROMPT, text)
    cleaned = _clean_json(raw)

    try:
        layers = json.loads(cleaned)
        if not isinstance(layers, list):
            layers = [layers]
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}\n\nRaw output:\n{raw[:500]}")

    return {
        "layers": layers,
        "total_layers": len(layers),
        "source": source,
    }


# ── Hydrogeological Extraction ────────────────────────────────────────────────

def extract_hydro(text: str, source: str | None = None) -> dict:
    raw     = _call_groq(HYDRO_PROMPT, text)
    cleaned = _clean_json(raw)

    try:
        result = json.loads(cleaned)
        if isinstance(result, list):
            result = result[0] if result else {}
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}\n\nRaw output:\n{raw[:500]}")

    result["source"] = source
    return result


# ── Mineral Liberation Extraction ─────────────────────────────────────────────

def extract_mineral_liberation(text: str, source: str | None = None) -> dict:
    raw     = _call_groq(MINERAL_LIBERATION_PROMPT, text)
    cleaned = _clean_json(raw)

    try:
        items = json.loads(cleaned)
        if not isinstance(items, list):
            items = [items]
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}\n\nRaw output:\n{raw[:500]}")

    return {
        "items": items,
        "total_minerals": len(items),
        "source": source,
    }
