const BASE = import.meta.env.VITE_API_URL || '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
  return data
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
  return data
}

// ── Geochemical ──────────────────────────────────────────────────────────────
export const apiRockEval   = (body) => post('/geochem/rock-eval', body)
export const apiAAS        = (body) => post('/geochem/aas', body)
export const apiConvert    = (body) => post('/geochem/convert', body)
export const apiMineral    = (body) => post('/geochem/mineral', body)
export const apiElements   = ()     => get('/geochem/elements')
export const apiUnits      = ()     => get('/geochem/units')

// ── Synthesis ────────────────────────────────────────────────────────────────
export const apiChat       = (body) => post('/synthesis/chat', body)
export const apiReport     = (body) => post('/synthesis/report', body)
export const apiSummarize  = (body) => post('/synthesis/summarize', body)

// ── Geospatial ───────────────────────────────────────────────────────────────
export const apiGeoJSON    = (body) => post('/geo/geojson', body)
export const apiLegend     = ()     => get('/geo/anomaly-legend')
