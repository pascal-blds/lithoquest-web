import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { apiGeoJSON, apiLegend } from '../api'

const ELEMENTS = ['Li','Cu','Au','Ag','Zn','Pb','Ni','Co','Fe']

const emptyPoint = () => ({
  id: `S-${Date.now()}`, latitude: '', longitude: '',
  element: 'Li', concentration_ppm: '', formation: '', depth_m: '', notes: '',
})

export default function GeoMap() {
  const [points, setPoints]   = useState([emptyPoint()])
  const [features, setFeatures] = useState([])
  const [legend, setLegend]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    apiLegend().then(d => setLegend(d.legend)).catch(() => {})
  }, [])

  const addPoint = () => setPoints(p => [...p, emptyPoint()])
  const removePoint = (i) => setPoints(p => p.filter((_, idx) => idx !== i))
  const setField = (i, k) => (e) => setPoints(p => p.map((pt, idx) => idx === i ? { ...pt, [k]: e.target.value } : pt))

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const payload = {
        points: points.filter(p => p.latitude && p.longitude).map(p => ({
          id: p.id,
          latitude:  parseFloat(p.latitude),
          longitude: parseFloat(p.longitude),
          element:   p.element || undefined,
          concentration_ppm: p.concentration_ppm ? parseFloat(p.concentration_ppm) : undefined,
          formation: p.formation || undefined,
          depth_m:   p.depth_m  ? parseFloat(p.depth_m) : undefined,
          notes:     p.notes    || undefined,
        })),
        element_filter: filter || undefined,
      }
      const data = await apiGeoJSON(payload)
      setFeatures(data.features)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const center = features.length > 0
    ? [features[0].geometry.coordinates[1], features[0].geometry.coordinates[0]]
    : [5.5, 6.5] // Default: Niger Delta

  return (
    <div className="page">
      <div className="container section">
        <div className="eyebrow">Geospatial AI</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Sample <em>Geo Map</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2rem', maxWidth: 540, fontSize: '0.93rem' }}>
          Enter sample coordinates and concentrations to plot colour-graded markers on an interactive map.
          Marker colour reflects anomaly intensity per element.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sample entry form */}
          <form onSubmit={submit}>
            <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div className="eyebrow">Sample Points</div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addPoint}>+ Add Point</button>
              </div>

              {points.map((pt, i) => (
                <div key={pt.id} style={{
                  marginBottom: '1.2rem', padding: '1rem',
                  background: 'var(--surface-2)', border: '0.5px solid var(--border-dim)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--teal)' }}>
                      {pt.id}
                    </span>
                    {points.length > 1 && (
                      <button type="button" onClick={() => removePoint(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label className="label">Latitude *</label>
                      <input className="input" type="number" step="any" required
                        placeholder="e.g. 5.543" value={pt.latitude} onChange={setField(i,'latitude')} />
                    </div>
                    <div className="field">
                      <label className="label">Longitude *</label>
                      <input className="input" type="number" step="any" required
                        placeholder="e.g. 6.781" value={pt.longitude} onChange={setField(i,'longitude')} />
                    </div>
                    <div className="field">
                      <label className="label">Element</label>
                      <select className="select" value={pt.element} onChange={setField(i,'element')}>
                        {ELEMENTS.map(el => <option key={el}>{el}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="label">Concentration (ppm)</label>
                      <input className="input" type="number" step="any" min="0"
                        placeholder="e.g. 847" value={pt.concentration_ppm} onChange={setField(i,'concentration_ppm')} />
                    </div>
                    <div className="field">
                      <label className="label">Formation</label>
                      <input className="input" placeholder="e.g. Agbada Fm." value={pt.formation} onChange={setField(i,'formation')} />
                    </div>
                    <div className="field">
                      <label className="label">Depth (m)</label>
                      <input className="input" type="number" step="any" min="0"
                        placeholder="e.g. 1200" value={pt.depth_m} onChange={setField(i,'depth_m')} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Notes</label>
                    <input className="input" placeholder="Optional field note" value={pt.notes} onChange={setField(i,'notes')} />
                  </div>
                </div>
              ))}

              <div className="field">
                <label className="label">Filter by element (optional)</label>
                <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="">All elements</option>
                  {ELEMENTS.map(el => <option key={el}>{el}</option>)}
                </select>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Plotting...</> : 'Plot on Map'}
              </button>
            </div>
          </form>

          {/* Map + legend */}
          <div>
            <div style={{ height: '60vh', border: '0.5px solid var(--border)', marginBottom: '1rem' }}>
              <MapContainer center={center} zoom={features.length > 0 ? 9 : 7} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {features.map((f, i) => (
                  <CircleMarker
                    key={i}
                    center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
                    radius={10}
                    pathOptions={{
                      color: f.properties.marker_color,
                      fillColor: f.properties.marker_color,
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: "'Outfit',sans-serif", minWidth: 160 }}>
                        <strong>{f.properties.id}</strong><br />
                        {f.properties.element && <><span>Element: {f.properties.element}</span><br /></>}
                        {f.properties.concentration_ppm != null && <><span>{f.properties.concentration_ppm} ppm</span><br /></>}
                        {f.properties.formation && <><span>{f.properties.formation}</span><br /></>}
                        {f.properties.depth_m    && <><span>Depth: {f.properties.depth_m} m</span><br /></>}
                        {f.properties.notes      && <span>{f.properties.notes}</span>}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {legend.length > 0 && (
              <div className="card card-sm">
                <div className="eyebrow" style={{ marginBottom: '0.8rem' }}>Anomaly Legend</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {legend.map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {l.label} ({l.range})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
