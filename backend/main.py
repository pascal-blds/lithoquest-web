from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import geochemical, synthesis, geospatial

load_dotenv()

app = FastAPI(
    title="LithoQuest API",
    description="Geospatial AI & Geochemical Intelligence Platform",
    version="1.0.0",
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(geochemical.router, prefix="/api/geochem", tags=["Geochemical"])
app.include_router(synthesis.router,   prefix="/api/synthesis", tags=["Synthesis"])
app.include_router(geospatial.router,  prefix="/api/geo",       tags=["Geospatial"])

@app.get("/health")
def health():
    return {"status": "online", "platform": "LithoQuest v1.0"}
