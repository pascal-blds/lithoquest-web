from fastapi import APIRouter, HTTPException
from models.schemas import SamplePointsRequest, GeoJSONResponse, GeoJSONFeature, SamplePoint
from typing import List

router = APIRouter()


def _color_for_concentration(ppm: float | None) -> str:
    if ppm is None:
        return "#6e6558"
    if ppm < 100:
        return "#1ab3bc"
    elif ppm < 500:
        return "#e8a84a"
    elif ppm < 2000:
        return "#c8831e"
    else:
        return "#ff4444"


def _point_to_feature(pt: SamplePoint) -> GeoJSONFeature:
    return GeoJSONFeature(
        type="Feature",
        geometry={
            "type": "Point",
            "coordinates": [pt.longitude, pt.latitude],
        },
        properties={
            "id": pt.id,
            "element": pt.element,
            "concentration_ppm": pt.concentration_ppm,
            "formation": pt.formation,
            "depth_m": pt.depth_m,
            "notes": pt.notes,
            "marker_color": _color_for_concentration(pt.concentration_ppm),
        },
    )


@router.post("/geojson", response_model=GeoJSONResponse)
def points_to_geojson(request: SamplePointsRequest):
    """Convert sample point data to GeoJSON FeatureCollection."""
    try:
        points = request.points
        if request.element_filter:
            points = [p for p in points if (p.element or "").upper() == request.element_filter.upper()]

        features = [_point_to_feature(p) for p in points]
        return GeoJSONResponse(type="FeatureCollection", features=features)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/anomaly-legend")
def anomaly_legend():
    """Return the concentration colour thresholds used for map markers."""
    return {
        "legend": [
            {"range": "< 100 ppm",      "color": "#1ab3bc", "label": "Background"},
            {"range": "100–500 ppm",     "color": "#e8a84a", "label": "Anomalous"},
            {"range": "500–2000 ppm",    "color": "#c8831e", "label": "Significant"},
            {"range": "> 2000 ppm",      "color": "#ff4444", "label": "High grade"},
        ]
    }
