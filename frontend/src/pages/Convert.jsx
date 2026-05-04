import { useState } from 'react'
import { apiConvert } from '../api'

const UNITS = ['ppm','ppb','ppt','percent','g_per_t','oz_per_t','mg_per_kg','mg_per_L']
const UNIT_LABELS = {
  ppm:'ppm (mg/kg)', ppb:'ppb (µg/kg)', ppt:'ppt (ng/kg)',
  percent:'% (percent)', g_per_t:'g/t', oz_per_t:'oz/t (troy)',
  mg_per_kg:'mg/kg', mg_per_L:'mg/L',
}

export default function Convert() {
  const [value, setValue]       = useState('')
  const [from, setFrom]         = useState('ppm')
  const [to, setTo]             = useState('ppb')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [history, setHistory]   = useState([])

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const data = await apiConvert({ value: parseFloat(value), from_unit: from, to_unit: to })
      setResult(data)
      setHistory(h => [data, ...h].slice(0, 8))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container section">
        <div className="eyebrow">Geochemical Automation Engine</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Unit <em>Converter</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2.5rem', maxWidth: 520, fontSize: '0.93rem' }}>
          Instantly convert between all standard geochemical concentration units.
        </p>

        <div className="grid-2" style={{ alignItems: 'start', maxWidth: 860 }}>
          <form onSubmit={submit}>
            <div className="card">
              <div className="field">
                <label className="label">Value <span style={{ color: '#c0392b' }}>*</span></label>
                <input className="input" type="number" step="any" required
                  placeholder="e.g. 847" value={value} onChange={e => setValue(e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label className="label">From</label>
                  <select className="select" value={from} onChange={e => setFrom(e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">To</label>
                  <select className="select" value={to} onChange={e => setTo(e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Converting...</> : 'Convert'}
              </button>

              {result && (
                <div style={{
                  marginTop: '1.5rem', padding: '1.5rem', textAlign: 'center',
                  background: 'var(--surface-2)', borderTop: '2px solid var(--amber-dim)',
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {result.input_value} {result.input_unit} =
                  </div>
                  <div style={{ fontFamily: "'Cormorant',serif", fontSize: '2.4rem', fontWeight: 600, color: '#e8a84a', lineHeight: 1.1 }}>
                    {result.output_value.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: 'var(--teal)', marginTop: '0.3rem' }}>
                    {result.output_unit}
                  </div>
                </div>
              )}
            </div>
          </form>

          {history.length > 0 && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '1rem' }}>Conversion History</div>
              {history.map((h, i) => (
                <div className="result-row" key={i}>
                  <span className="result-key">{h.input_value} {h.input_unit}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
                  <span className="result-value" style={{ color: '#e8a84a' }}>
                    {h.output_value.toLocaleString(undefined, { maximumFractionDigits: 6 })} {h.output_unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
