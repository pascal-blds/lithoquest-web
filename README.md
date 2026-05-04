# LithoQuest

> AI-powered geological intelligence platform for mineral discovery and source rock evaluation.

## Repository Structure

```
lithoquest/
├── backend/
│   ├── main.py                   ← FastAPI app entry point
│   ├── requirements.txt          ← Python dependencies
│   ├── .env.example              ← Copy to .env, add API key
│   ├── models/schemas.py         ← All Pydantic models
│   ├── services/
│   │   ├── geochem_service.py    ← Rock-Eval, AAS, conversion, grade logic
│   │   └── llm_service.py        ← Anthropic API with geology system prompt
│   └── routers/
│       ├── geochemical.py        ← /api/geochem/* endpoints
│       ├── synthesis.py          ← /api/synthesis/* endpoints
│       └── geospatial.py         ← /api/geo/* endpoints
│
├── frontend/
│   ├── index.html                ← Vite HTML entry
│   ├── vite.config.js            ← Dev proxy to backend
│   ├── package.json
│   └── src/
│       ├── main.jsx              ← React root
│       ├── App.jsx               ← Router
│       ├── api.js                ← All API calls
│       ├── index.css             ← Global styles + palette
│       ├── components/
│       │   ├── Nav.jsx
│       │   └── ResultPanel.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── RockEval.jsx
│           ├── AAS.jsx
│           ├── Convert.jsx
│           ├── Mineral.jsx
│           ├── Synthesis.jsx
│           └── GeoMap.jsx
│
├── .github/workflows/ci.yml      ← GitHub Actions CI
├── .gitignore
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # Add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Deployment

- **Frontend**: Vercel or Netlify (root: `frontend/`, build: `npm run build`, out: `dist`)
- **Backend**: Railway or Render (root: `backend/`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- Set `ANTHROPIC_API_KEY` and `ALLOWED_ORIGINS` as env vars in your backend host dashboard.

## References

- Espitalié et al. (1977), Peters & Cassa (1994), Tissot & Welte (1984)
