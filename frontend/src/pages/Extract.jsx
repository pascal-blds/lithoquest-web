import { useState } from 'react'

const BASE = 'https://lithoquest-web-production.up.railway.app/api'

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

const apiExtractVES    = (body) => post('/extract/ves', body)
const apiExtractHydro  = (body) => post('/extract/hydro', body)
const apiExtractMineral = (body) => post('/extract/mineral-liberation', body)

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v) {
  if (v === null || v === undefined) return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  if (typeof v === 'number') return v.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return String(v)
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

function downloadCSV(rows, filename) {
  if (!rows || rows.length === 0) return
  const keys = Object.keys(rows[0]).filter(k => k !== 'source')
  const csv  = [keys.join(','), ...rows.map(r => keys.map(k => {
    const v = r[k]
    if (Array.isArray(v)) return `"${v.join('; ')}"`
    if (v === null || v === undefined) return ''
    return `"${String(v).replace(/"/g, '""')}"`
  }).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

// ── Shared textarea form ──────────────────────────────────────────────────────

function ExtractionForm({ onExtract, loading, placeholder, hint }) {
  const [text, setText]     = useState('')
  const [source, setSource] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onExtract(text, source)
  }

  return (
    <form onSubmit={submit}>
      <div className="card">
        <div className="eyebrow" style={{ marginBottom: '1.2rem' }}>Paste Field Report / Lab Text</div>
        <div className="field">
          <label className="label">Source Document Name (optional)</label>
          <input className="input" placeholder="e.g. VES Survey — Nsukka Region 2024"
            value={source} onChange={e => setSource(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Report Text <span style={{ color: '#c0392b' }}>*</span></label>
          <textarea className="input" required style={{ minHeight: 260 }}
            placeholder={placeholder}
            value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div style={{
          padding: '0.8rem 1rem', background: 'var(--surface-2)',
          borderLeft: '2px solid var(--teal-dim)', marginBottom: '1.2rem',
          fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          {hint}
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading || !text.trim()}
          style={{ width: '100%', justifyContent: 'center' }}>
          {loading
            ? <><span className="spinner" /> Extracting with AI...</>
            : <>Extract Structured Data</>
          }
        </button>
      </div>
    </form>
  )
}

// ── VES Tab ───────────────────────────────────────────────────────────────────

function VESTab() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = async (text, source) => {
    setError(null); setResult(null); setLoading(true)
    try {
      const data = await apiExtractVES({ text, source: source || undefined })
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const cols = ['station_id','location','layer_number','layer_depth_m','layer_thickness_m',
    'resistivity_ohm_m','lithology_description','aquifer_type','water_table_depth_m']

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div>
        <ExtractionForm onExtract={run} loading={loading}
          placeholder={`Paste your VES survey report here. Example:\n\nVES Station 1 — Coordinates: 6.52°N, 7.43°E\nLayer 1: Depth 0–3m, Resistivity 210 Ω·m, Topsoil/Laterite\nLayer 2: Depth 3–12m, Resistivity 85 Ω·m, Weathered basement\nLayer 3: Depth 12–42m, Resistivity 12 Ω·m, Saturated sand aquifer\nWater table at 14m depth\n\nVES Station 2 — Amaigbo area...`}
          hint="Supports raw text from field notebooks, PDF copy-pastes, or typed survey summaries. The AI reads any format." />
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <div>
        {result && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div className="eyebrow">Extracted VES Data</div>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem',
                  color: 'var(--teal)', border: '0.5px solid rgba(26,179,188,0.3)',
                  padding: '0.2rem 0.6rem',
                }}>{result.total_layers} layer{result.total_layers !== 1 ? 's' : ''} extracted</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadJSON(result.layers, 'ves-data.json')}>JSON</button>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadCSV(result.layers, 'ves-data.csv')}>CSV</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    {cols.map(c => (
                      <th key={c} style={{
                        textAlign: 'left', padding: '0.5rem 0.6rem',
                        fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--text-muted)', borderBottom: '0.5px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}>{c.replace(/_/g,' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.layers.map((layer, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(200,131,30,0.03)' }}>
                      {cols.map(c => (
                        <td key={c} style={{
                          padding: '0.5rem 0.6rem',
                          color: c === 'resistivity_ohm_m' ? 'var(--amber-light)'
                               : c === 'aquifer_type' && layer[c] && layer[c] !== 'none' ? 'var(--teal)'
                               : 'var(--cream-dim)',
                          borderBottom: '0.5px solid var(--border-dim)',
                          whiteSpace: 'nowrap',
                        }}>{fmt(layer[c])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="card" style={{ background: 'var(--surface-2)', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontFamily: "'Cormorant',serif", fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Awaiting field report
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paste VES survey text and the AI will extract all layer data into a structured table ready for GIS ingestion.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Hydro Tab ─────────────────────────────────────────────────────────────────

function HydroTab() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = async (text, source) => {
    setError(null); setResult(null); setLoading(true)
    try {
      const data = await apiExtractHydro({ text, source: source || undefined })
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fields = [
    ['location', 'Location'],
    ['coordinates', 'Coordinates'],
    ['aquifer_type', 'Aquifer Type'],
    ['aquifer_classification', 'Classification'],
    ['water_table_depth_m', 'Water Table Depth (m)'],
    ['static_water_level_m', 'Static Water Level (m)'],
    ['saturated_thickness_m', 'Saturated Thickness (m)'],
    ['hydraulic_conductivity_m_per_day', 'Hydraulic Conductivity (m/day)'],
    ['transmissivity_m2_per_day', 'Transmissivity (m²/day)'],
    ['borehole_yield_l_per_s', 'Borehole Yield (L/s)'],
    ['water_quality_description', 'Water Quality'],
    ['total_dissolved_solids_mg_l', 'TDS (mg/L)'],
    ['ph', 'pH'],
    ['overburden_thickness_m', 'Overburden Thickness (m)'],
    ['weathered_layer_thickness_m', 'Weathered Layer (m)'],
    ['fractured_zone_depth_m', 'Fractured Zone Depth (m)'],
    ['overall_groundwater_potential', 'Groundwater Potential'],
    ['recommendations', 'Recommendations'],
  ]

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div>
        <ExtractionForm onExtract={run} loading={loading}
          placeholder={`Paste hydrogeological field notes or borehole report. Example:\n\nBorehole Location: Enugu-Ukwu, Anambra State\nCoordinates: 6.12°N, 7.01°E\nTotal Depth Drilled: 65m\nStatic Water Level: 18.4m\nYield: 2.3 L/s\nLithology: 0-5m laterite, 5-22m weathered shale, 22-65m fractured sandstone\nAquifer Type: Semi-confined fracture aquifer\nTDS: 312 mg/L, pH 6.8\nRecommendation: Suitable for rural water supply...`}
          hint="Supports borehole completion reports, hydrogeological survey notes, and pumping test summaries in any format." />
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <div>
        {result && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div className="eyebrow">Extracted Hydrogeological Data</div>
              <button className="btn btn-ghost btn-sm" onClick={() => downloadJSON(result, 'hydro-data.json')}>Download JSON</button>
            </div>

            {result.lithology_sequence && result.lithology_sequence.length > 0 && (
              <div style={{
                padding: '0.8rem 1rem', background: 'rgba(26,179,188,0.06)',
                borderLeft: '2px solid var(--teal-dim)', marginBottom: '1.2rem',
              }}>
                <div className="label" style={{ marginBottom: '0.4rem' }}>Lithology Sequence</div>
                {result.lithology_sequence.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--teal)', minWidth: 20 }}>{i + 1}.</span>
                    <span style={{ fontSize: '0.83rem', color: 'var(--cream-dim)' }}>{l}</span>
                  </div>
                ))}
              </div>
            )}

            {fields.map(([k, label]) => {
              if (k === 'lithology_sequence') return null
              const v = result[k]
              if (v === null || v === undefined) return null
              return (
                <div className="result-row" key={k}>
                  <span className="result-key">{label}</span>
                  <span className="result-value" style={{
                    color: k === 'overall_groundwater_potential' ? 'var(--amber-light)'
                         : k === 'aquifer_type' ? 'var(--teal)'
                         : 'var(--cream)',
                  }}>{fmt(v)}</span>
                </div>
              )
            })}
          </div>
        )}

        {!result && !loading && (
          <div className="card" style={{ background: 'var(--surface-2)', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontFamily: "'Cormorant',serif", fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Awaiting field notes
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paste borehole reports or hydrogeological notes and get structured aquifer classification and groundwater data instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mineral Liberation Tab ────────────────────────────────────────────────────

function MineralTab() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = async (text, source) => {
    setError(null); setResult(null); setLoading(true)
    try {
      const data = await apiExtractMineral({ text, source: source || undefined })
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fields = [
    ['mineral', 'Mineral'],
    ['mineral_formula', 'Formula'],
    ['ore_type', 'Ore Type'],
    ['deposit_type', 'Deposit Type'],
    ['head_grade_percent', 'Head Grade (%)'],
    ['head_grade_ppm', 'Head Grade (ppm)'],
    ['optimal_crushing_size_mm', 'Optimal Crush Size (mm)'],
    ['primary_grinding_size_microns', 'Primary Grind Size (µm)'],
    ['liberation_size_microns', 'Liberation Size (µm)'],
    ['p80_microns', 'P80 (µm)'],
    ['recovery_percent', 'Recovery (%)'],
    ['concentrate_grade_percent', 'Concentrate Grade (%)'],
    ['processing_method', 'Processing Method'],
    ['flotation_reagents', 'Flotation Reagents'],
    ['leaching_reagent', 'Leaching Reagent'],
    ['leach_recovery_percent', 'Leach Recovery (%)'],
    ['water_requirements_l_per_t', 'Water (L/t)'],
    ['energy_kwh_per_t', 'Energy (kWh/t)'],
    ['notes', 'Notes'],
  ]

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div>
        <ExtractionForm onExtract={run} loading={loading}
          placeholder={`Paste assay report or mineral processing lab text. Example:\n\nMineral: Lepidolite (KLi₂Al(AlSi₃)O₁₀(F,OH)₂)\nDeposit: Pegmatite-hosted, Nasarawa State\nHead Grade: 1.24% Li₂O (2,890 ppm Li)\n\nComminution Tests:\nOptimal crushing: 12.5mm primary crush\nGrinding to 150µm (P80) achieves 87% liberation\nFlotation recovery: 91.3% at pH 8.2\nReagents: Sodium oleate collector, MIBC frother, Na₂CO₃ depressant\nConcentrate grade: 4.8% Li₂O\nWater requirement: 1,200 L/t...`}
          hint="Supports mineralogical assay reports, comminution test results, flotation test work summaries, and metallurgical balance sheets." />
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      <div>
        {result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem',
                color: 'var(--amber-light)', border: '0.5px solid rgba(200,131,30,0.3)',
                padding: '0.2rem 0.6rem',
              }}>{result.total_minerals} mineral{result.total_minerals !== 1 ? 's' : ''} extracted</span>
              <button className="btn btn-ghost btn-sm" onClick={() => downloadJSON(result.items, 'mineral-liberation.json')}>Download JSON</button>
            </div>

            {result.items.map((item, i) => (
              <div className="card" key={i} style={{ marginBottom: '1rem', background: 'var(--surface-2)' }}>
                <div style={{
                  fontFamily: "'Cormorant',serif", fontSize: '1.2rem', fontWeight: 600,
                  color: 'var(--amber-light)', marginBottom: '1rem',
                  borderBottom: '0.5px solid var(--border-dim)', paddingBottom: '0.6rem',
                }}>
                  {item.mineral || `Mineral ${i + 1}`}
                  {item.mineral_formula && (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.8rem' }}>
                      {item.mineral_formula}
                    </span>
                  )}
                </div>
                {fields.filter(([k]) => k !== 'mineral' && k !== 'mineral_formula').map(([k, label]) => {
                  const v = item[k]
                  if (v === null || v === undefined) return null
                  if (Array.isArray(v) && v.length === 0) return null
                  return (
                    <div className="result-row" key={k}>
                      <span className="result-key">{label}</span>
                      <span className="result-value" style={{
                        color: k === 'recovery_percent' ? 'var(--teal)'
                             : k === 'liberation_size_microns' || k === 'optimal_crushing_size_mm' ? 'var(--amber-light)'
                             : 'var(--cream)',
                      }}>{fmt(v)}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {!result && !loading && (
          <div className="card" style={{ background: 'var(--surface-2)', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontFamily: "'Cormorant',serif", fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Awaiting assay report
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paste mineralogical or metallurgical test data and get structured liberation parameters — crushing size, grind size, recovery, and processing method.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'ves',     label: '🌊 VES Extraction',           sub: 'Geophysical Data' },
  { id: 'hydro',   label: '💧 Hydrogeological Mapping',  sub: 'Aquifer & Water Table' },
  { id: 'mineral', label: '💎 Mineral Liberation',       sub: 'Processing Analysis' },
]

export default function Extract() {
  const [tab, setTab] = useState('ves')

  return (
    <div className="page">
      <div className="container section">
        <div className="eyebrow">AI Extraction Engine</div>
        <h2 style={{ marginBottom: '0.5rem' }}>
          Unstructured Reports →{' '}
          <em>Structured Intelligence</em>
        </h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2rem', maxWidth: 620, fontSize: '0.93rem' }}>
          Paste any geological field report, borehole log, or assay text. The AI reads it, identifies
          every critical parameter, and returns clean structured JSON — ready for database insertion,
          GIS mapping, or direct analysis. No templates. No formatting required.
        </p>

        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'ves'     && <VESTab />}
        {tab === 'hydro'   && <HydroTab />}
        {tab === 'mineral' && <MineralTab />}
      </div>
    </div>
  )
}
