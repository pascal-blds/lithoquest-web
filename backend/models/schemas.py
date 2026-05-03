from pydantic import BaseModel, Field
from typing import Optional, List

# ── Geochemical schemas ──────────────────────────────────────────────────────

class RockEvalInput(BaseModel):
    toc: float = Field(..., description="Total Organic Carbon (%)", ge=0)
    s1: Optional[float] = Field(None, description="Free hydrocarbons (mg HC/g rock)", ge=0)
    s2: Optional[float] = Field(None, description="Remaining generative potential (mg HC/g rock)", ge=0)
    s3: Optional[float] = Field(None, description="CO2 yield (mg CO2/g rock)", ge=0)
    tmax: Optional[float] = Field(None, description="Temperature at max S2 peak (°C)")
    sample_id: Optional[str] = Field(None, description="Sample identifier")
    formation: Optional[str] = Field(None, description="Formation/unit name")

class RockEvalResult(BaseModel):
    sample_id: Optional[str]
    toc: float
    toc_classification: str
    toc_description: str
    hi: Optional[float]
    hi_classification: Optional[str]
    oi: Optional[float]
    pi: Optional[float]
    tmax: Optional[float]
    maturity: Optional[str]
    maturity_description: Optional[str]
    kerogen_type: Optional[str]
    kerogen_description: Optional[str]
    generation_potential: Optional[str]
    s1: Optional[float]
    s2: Optional[float]
    s3: Optional[float]

class AASInput(BaseModel):
    absorbance: float = Field(..., description="Measured absorbance (dimensionless)", ge=0)
    slope: float = Field(..., description="Calibration curve slope")
    intercept: float = Field(0.0, description="Calibration curve intercept")
    dilution_factor: float = Field(1.0, description="Dilution factor applied to sample", gt=0)
    weight_g: Optional[float] = Field(None, description="Sample weight in grams (for ppm conversion)")
    volume_ml: Optional[float] = Field(None, description="Final volume in mL (for ppm conversion)")
    element: Optional[str] = Field(None, description="Element being measured")

class AASResult(BaseModel):
    element: Optional[str]
    absorbance: float
    concentration_mg_L: float
    concentration_ppm: Optional[float]
    concentration_ppb: float
    concentration_percent: Optional[float]
    oxide_percent: Optional[float]
    oxide_formula: Optional[str]

class ConversionInput(BaseModel):
    value: float
    from_unit: str = Field(..., description="One of: ppm, ppb, ppt, percent, g_per_t, oz_per_t, mg_per_kg, mg_per_L")
    to_unit: str

class ConversionResult(BaseModel):
    input_value: float
    input_unit: str
    output_value: float
    output_unit: str

class MineralCalcInput(BaseModel):
    element: str = Field(..., description="Element symbol e.g. Li, Cu, Au")
    concentration_ppm: float = Field(..., ge=0)

class MineralCalcResult(BaseModel):
    element: str
    concentration_ppm: float
    concentration_ppb: float
    concentration_percent: float
    oxide_formula: Optional[str]
    oxide_percent: Optional[float]
    oz_per_tonne: float
    grade_category: str

# ── Synthesis schemas ────────────────────────────────────────────────────────

class SynthesisMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class SynthesisRequest(BaseModel):
    messages: List[SynthesisMessage]
    context: Optional[str] = Field(None, description="Optional raw data or sample context to inject")
    mode: str = Field("chat", description="chat | report | summarize")

class SynthesisResponse(BaseModel):
    content: str
    mode: str

class ReportRequest(BaseModel):
    title: str
    formation: Optional[str]
    basin: Optional[str]
    rock_eval_data: Optional[RockEvalResult]
    aas_data: Optional[List[AASResult]]
    notes: Optional[str]

# ── Geospatial schemas ───────────────────────────────────────────────────────

class SamplePoint(BaseModel):
    id: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    element: Optional[str]
    concentration_ppm: Optional[float] = Field(None, ge=0)
    formation: Optional[str]
    depth_m: Optional[float]
    notes: Optional[str]

class SamplePointsRequest(BaseModel):
    points: List[SamplePoint]
    element_filter: Optional[str]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict

class GeoJSONResponse(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
