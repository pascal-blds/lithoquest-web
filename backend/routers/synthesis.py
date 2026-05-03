from fastapi import APIRouter, HTTPException
from models.schemas import SynthesisRequest, SynthesisResponse
from services.llm_service import run_synthesis

router = APIRouter()


@router.post("/chat", response_model=SynthesisResponse)
def chat(request: SynthesisRequest):
    """Chat with the geology-specialized LLM."""
    try:
        request.mode = "chat"
        return run_synthesis(request)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report", response_model=SynthesisResponse)
def generate_report(request: SynthesisRequest):
    """Generate a structured geological report from provided data and context."""
    try:
        request.mode = "report"
        return run_synthesis(request)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize", response_model=SynthesisResponse)
def summarize(request: SynthesisRequest):
    """Summarize a technical geological paper or dataset."""
    try:
        request.mode = "summarize"
        return run_synthesis(request)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
