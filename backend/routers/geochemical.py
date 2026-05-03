from fastapi import APIRouter, HTTPException
from models.schemas import (
    RockEvalInput, RockEvalResult,
    AASInput, AASResult,
    ConversionInput, ConversionResult,
    MineralCalcInput, MineralCalcResult,
)
from services.geochem_service import (
    interpret_rock_eval,
    calculate_aas,
    convert_unit,
    calculate_mineral,
)

router = APIRouter()


@router.post("/rock-eval", response_model=RockEvalResult)
def rock_eval(data: RockEvalInput):
    """Interpret Rock-Eval pyrolysis parameters (TOC, Tmax, HI, OI, S1, S2, S3)."""
    try:
        return interpret_rock_eval(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/aas", response_model=AASResult)
def aas_calculate(data: AASInput):
    """Calculate element concentration from AAS absorbance using Beer-Lambert law."""
    try:
        return calculate_aas(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/convert", response_model=ConversionResult)
def unit_convert(data: ConversionInput):
    """Convert between geochemical concentration units (ppm, ppb, %, oz/t, etc.)."""
    try:
        return convert_unit(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/mineral", response_model=MineralCalcResult)
def mineral_calc(data: MineralCalcInput):
    """Convert element concentration to oxide % and ore grade metrics."""
    try:
        return calculate_mineral(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/elements")
def list_elements():
    """Return the list of elements supported by the geochemical engine."""
    from services.geochem_service import ATOMIC_MASSES, OXIDE_DATA
    return {
        "elements": list(ATOMIC_MASSES.keys()),
        "oxide_supported": list(OXIDE_DATA.keys()),
    }


@router.get("/units")
def list_units():
    """Return supported concentration unit keys."""
    from services.geochem_service import UNIT_TO_PPM
    return {"units": list(UNIT_TO_PPM.keys())}
