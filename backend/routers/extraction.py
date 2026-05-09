from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.extraction_service import (
    extract_ves,
    extract_hydro,
    extract_mineral_liberation,
)

router = APIRouter()


class ExtractionInput(BaseModel):
    text: str
    source: Optional[str] = None


@router.post("/ves")
def ves_extraction(data: ExtractionInput):
    """
    Extract VES (Vertical Electrical Sounding) layer data from unstructured field report text.
    Returns structured JSON with layer depth, resistivity, lithology, and aquifer classification.
    """
    try:
        return extract_ves(data.text, data.source)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hydro")
def hydro_extraction(data: ExtractionInput):
    """
    Extract hydrogeological data from field notes or borehole reports.
    Returns aquifer type, water table depth, yield, transmissivity, and lithology sequence.
    """
    try:
        return extract_hydro(data.text, data.source)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mineral-liberation")
def mineral_liberation_extraction(data: ExtractionInput):
    """
    Extract mineral processing and liberation data from assay reports or lab text.
    Returns crushing size, grinding size, liberation size, recovery %, and processing method.
    """
    try:
        return extract_mineral_liberation(data.text, data.source)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
