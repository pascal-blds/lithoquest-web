"""
LithoQuest Geochemical Service
Core calculation engine for source rock evaluation, AAS analysis,
and mineral concentration calculations.

References:
  - Peters & Cassa (1994) - TOC and source rock classification
  - Tissot & Welte (1984) - Maturity and kerogen classification
  - Espitalié et al. (1977) - Rock-Eval pyrolysis parameters
"""

from models.schemas import (
    RockEvalInput, RockEvalResult,
    AASInput, AASResult,
    ConversionInput, ConversionResult,
    MineralCalcInput, MineralCalcResult,
)

# ── Atomic masses (g/mol) ────────────────────────────────────────────────────
ATOMIC_MASSES = {
    "Li": 6.941,   "Na": 22.990,  "K":  39.098,  "Ca": 40.078,
    "Mg": 24.305,  "Fe": 55.845,  "Al": 26.982,  "Si": 28.086,
    "Ti": 47.867,  "Mn": 54.938,  "Cu": 63.546,  "Zn": 65.380,
    "Pb": 207.200, "Ni": 58.693,  "Co": 58.933,  "Cr": 51.996,
    "V":  50.942,  "Ba": 137.330, "Sr": 87.620,  "Rb": 85.468,
    "Au": 196.970, "Ag": 107.870, "Pt": 195.080, "As": 74.922,
    "U":  238.030, "Th": 232.040, "Ce": 140.120, "La": 138.910,
}

# Oxide conversion: element_ppm × multiplier = oxide_%
# multiplier = M_oxide / (stoich_element × M_element) / 10000
OXIDE_DATA = {
    "Li": ("Li₂O",  29.881 / (2 * 6.941) / 10000),
    "Na": ("Na₂O",  61.979 / (2 * 22.990) / 10000),
    "K":  ("K₂O",   94.196 / (2 * 39.098) / 10000),
    "Ca": ("CaO",   56.077 / 40.078 / 10000),
    "Mg": ("MgO",   40.304 / 24.305 / 10000),
    "Fe": ("Fe₂O₃", 159.688 / (2 * 55.845) / 10000),
    "Al": ("Al₂O₃", 101.961 / (2 * 26.982) / 10000),
    "Si": ("SiO₂",  60.083 / 28.086 / 10000),
    "Ti": ("TiO₂",  79.865 / 47.867 / 10000),
    "Mn": ("MnO",   70.937 / 54.938 / 10000),
    "Cu": ("CuO",   79.545 / 63.546 / 10000),
}

# 1 troy oz = 31.1035 g, 1 metric tonne = 1,000,000 g → 1 oz/t = 31.1035 ppm
PPM_PER_OZ_TONNE = 31.1035

# ── Unit conversion lookup (all relative to ppm / mg kg⁻¹) ─────────────────
UNIT_TO_PPM = {
    "ppm":      1.0,
    "mg_per_kg":1.0,
    "g_per_t":  1.0,
    "ppb":      1e-3,
    "ppt":      1e-6,
    "percent":  10_000.0,
    "mg_per_L": 1.0,        # assumes density ≈ 1 kg/L (dilute aqueous)
    "oz_per_t": PPM_PER_OZ_TONNE,
}


# ── TOC classification (Peters & Cassa, 1994) ────────────────────────────────
def classify_toc(toc: float) -> tuple[str, str]:
    if toc < 0.5:
        return "Poor", "Insufficient organic matter for significant hydrocarbon generation."
    elif toc < 1.0:
        return "Fair", "Marginal source rock; limited generation potential under favourable thermal conditions."
    elif toc < 2.0:
        return "Good", "Good source rock with moderate generation potential."
    elif toc < 4.0:
        return "Very Good", "Very good source rock with high generation and expulsion potential."
    else:
        return "Excellent", "Excellent source rock; world-class generation potential."


# ── Tmax / maturity (Tissot & Welte, 1984; Espitalié et al., 1977) ──────────
def classify_tmax(tmax: float) -> tuple[str, str]:
    if tmax < 435:
        return "Immature", "Below the oil generation threshold; hydrocarbons not yet generated."
    elif tmax < 445:
        return "Early Mature (Oil Window)", "Early oil generation; beginning of the oil window."
    elif tmax < 450:
        return "Peak Mature (Oil Window)", "Peak oil generation; maximum expulsion efficiency."
    elif tmax < 470:
        return "Late Mature (Wet Gas / Condensate)", "Late oil window; condensate and wet gas predominate."
    else:
        return "Post-Mature (Dry Gas)", "Overmature; dry gas only; significant cracking of earlier-generated oil."


# ── Kerogen type from HI (Van Krevelen modified) ────────────────────────────
def classify_kerogen(hi: float) -> tuple[str, str]:
    if hi > 600:
        return "Type I (Lacustrine/Algal)", "Highly oil-prone; lacustrine or algal source; H/C ratio > 1.5."
    elif hi > 300:
        return "Type II (Marine)", "Oil-prone; marine origin; mixed oil and gas generation."
    elif hi > 50:
        return "Type III (Terrestrial/Humic)", "Gas-prone; higher plant material; low H/C ratio."
    else:
        return "Type IV (Inertinite)", "No generation potential; reworked or oxidised organic matter."


# ── Generation potential string ──────────────────────────────────────────────
def generation_potential(s2: float) -> str:
    if s2 < 2:
        return "Poor (<2 mg HC/g)"
    elif s2 < 6:
        return "Fair (2–6 mg HC/g)"
    elif s2 < 14:
        return "Good (6–14 mg HC/g)"
    else:
        return "Excellent (>14 mg HC/g)"


# ── Main Rock-Eval interpreter ───────────────────────────────────────────────
def interpret_rock_eval(data: RockEvalInput) -> RockEvalResult:
    toc_class, toc_desc = classify_toc(data.toc)

    hi = oi = pi = None
    hi_class = maturity = mat_desc = kerogen = ker_desc = gen_pot = None

    if data.s2 is not None:
        hi = round(data.s2 / data.toc * 100, 2) if data.toc > 0 else None
        if hi is not None:
            hi_class, ker_desc = classify_kerogen(hi)
            kerogen = hi_class

        gen_pot = generation_potential(data.s2)

    if data.s3 is not None:
        oi = round(data.s3 / data.toc * 100, 2) if data.toc > 0 else None

    if data.s1 is not None and data.s2 is not None:
        denom = data.s1 + data.s2
        pi = round(data.s1 / denom, 3) if denom > 0 else None

    if data.tmax is not None:
        maturity, mat_desc = classify_tmax(data.tmax)

    return RockEvalResult(
        sample_id=data.sample_id,
        toc=data.toc,
        toc_classification=toc_class,
        toc_description=toc_desc,
        hi=hi,
        hi_classification=hi_class,
        oi=oi,
        pi=pi,
        tmax=data.tmax,
        maturity=maturity,
        maturity_description=mat_desc,
        kerogen_type=kerogen,
        kerogen_description=ker_desc,
        generation_potential=gen_pot,
        s1=data.s1,
        s2=data.s2,
        s3=data.s3,
    )


# ── AAS Calculator ───────────────────────────────────────────────────────────
def calculate_aas(data: AASInput) -> AASResult:
    """
    Beer-Lambert: A = mc + b  →  c = (A - b) / m
    Returns concentration in mg/L, then converts using sample weight/volume.
    """
    conc_mg_L = (data.absorbance - data.intercept) / data.slope * data.dilution_factor
    conc_mg_L = max(conc_mg_L, 0.0)

    # Convert mg/L in digest solution → ppm in solid sample
    conc_ppm = None
    if data.weight_g and data.volume_ml:
        # ppm = mg/kg = (conc_mg_L × volume_L) / weight_g × 1000
        conc_ppm = round(conc_mg_L * (data.volume_ml / 1000) / data.weight_g * 1000, 4)

    conc_ppb = round(conc_mg_L * 1000, 4)

    conc_pct = None
    oxide_pct = None
    oxide_formula = None

    if conc_ppm is not None:
        conc_pct = round(conc_ppm / 10000, 6)

    elem = (data.element or "").upper().strip()
    if elem and elem in OXIDE_DATA and conc_ppm is not None:
        oxide_formula, mult = OXIDE_DATA[elem]
        oxide_pct = round(conc_ppm * mult, 4)

    return AASResult(
        element=data.element,
        absorbance=data.absorbance,
        concentration_mg_L=round(conc_mg_L, 4),
        concentration_ppm=round(conc_ppm, 4) if conc_ppm is not None else None,
        concentration_ppb=conc_ppb,
        concentration_percent=conc_pct,
        oxide_percent=oxide_pct,
        oxide_formula=oxide_formula,
    )


# ── Unit conversion ──────────────────────────────────────────────────────────
def convert_unit(data: ConversionInput) -> ConversionResult:
    from_key = data.from_unit.lower().replace(" ", "_")
    to_key   = data.to_unit.lower().replace(" ", "_")

    if from_key not in UNIT_TO_PPM:
        raise ValueError(f"Unknown unit: {data.from_unit}")
    if to_key not in UNIT_TO_PPM:
        raise ValueError(f"Unknown unit: {data.to_unit}")

    ppm_value  = data.value * UNIT_TO_PPM[from_key]
    out_value  = ppm_value / UNIT_TO_PPM[to_key]

    return ConversionResult(
        input_value=data.value,
        input_unit=data.from_unit,
        output_value=round(out_value, 8),
        output_unit=data.to_unit,
    )


# ── Mineral grade calculator ─────────────────────────────────────────────────
def _grade_category(element: str, ppm: float) -> str:
    thresholds = {
        "Au": [(0.1, "Sub-economic"), (0.5, "Low grade"), (2.0, "Medium grade"), (5.0, "High grade"), (float("inf"), "Bonanza grade")],
        "Cu": [(1000, "Sub-economic"), (3000, "Low grade"), (10000, "Medium grade"), (30000, "High grade"), (float("inf"), "Very high grade")],
        "Li": [(200, "Sub-economic"), (500, "Low grade"), (1500, "Medium grade"), (5000, "High grade"), (float("inf"), "Very high grade")],
        "Zn": [(2000, "Sub-economic"), (5000, "Low grade"), (15000, "Medium grade"), (float("inf"), "High grade")],
        "Pb": [(2000, "Sub-economic"), (5000, "Low grade"), (15000, "Medium grade"), (float("inf"), "High grade")],
    }
    cats = thresholds.get(element.upper(), [(500, "Trace"), (5000, "Anomalous"), (float("inf"), "Significant")])
    for limit, label in cats:
        if ppm <= limit:
            return label
    return "High grade"


def calculate_mineral(data: MineralCalcInput) -> MineralCalcResult:
    ppm = data.concentration_ppm
    elem = data.element.strip().capitalize()

    oxide_formula = None
    oxide_pct = None
    oxide_key = elem.upper()
    if oxide_key in OXIDE_DATA:
        oxide_formula, mult = OXIDE_DATA[oxide_key]
        oxide_pct = round(ppm * mult, 5)

    return MineralCalcResult(
        element=elem,
        concentration_ppm=round(ppm, 4),
        concentration_ppb=round(ppm * 1000, 2),
        concentration_percent=round(ppm / 10000, 6),
        oxide_formula=oxide_formula,
        oxide_percent=oxide_pct,
        oz_per_tonne=round(ppm / PPM_PER_OZ_TONNE, 6),
        grade_category=_grade_category(elem, ppm),
    )
