import { useState } from 'react'
import { apiMineral } from '../api'
import ResultPanel from '../components/ResultPanel'

const ELEMENTS = ['Li','Cu','Au','Ag','Zn','Pb','Ni','Co','Fe','Mn','Ti','Cr','V','Ba','Sr','Ce','La']

export default function Mineral() {
  const [element, setElement]   = useState('Li')
  const [conc, setConc]         = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setResult(null); setLoading(true)
    try {
      const data = await apiMineral({ element, concentration_ppm: parseFloat(conc) })
      setResult(data)
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
        <h2 style={{ marginBottom: '0.5rem' }}>Mineral <em>Grade Calculator</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2.5rem', maxWidth: 520, fontSize: '0.93rem' }}>
          Convert element concentration to oxide %, oz/tonne, and receive an industry-standard
          ore grade classification for critical and base metals.
        </p>

        <div className="grid-2" style={{ alignItems: 'start', maxWidth: 860 }}>
          <form onSubmit={submit}>
            <div className="card">
              <div className="field">
                <label className="label">Element <span style={{ color: '#c0392b' }}>*</span></label>
                <select className="select" value={element} onChange={e => setElement(e.target.value)}>
                  {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Concentration (ppm) <span style={{ color: '#c0392b' }}>*</span></label>
                <input className="input" type="number" step="any" min="0" required
                  placeholder="e.g. 847" value={conc} onChange={e => setConc(e.target.value)} />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Calculating...</> : 'Calculate Grade'}
              </button>
            </div>
          </form>

          <div>
            <div className="card card-sm" style={{ background: 'var(--surface-2)', marginBottom: '1rem' }}>
              <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>Lepidolite / Li Reference</div>
              {[
                ['< 200 ppm Li', 'Sub-economic'],
                ['200–500 ppm Li', 'Low grade'],
                ['500–1500 ppm Li', 'Medium grade'],
                ['1500–5000 ppm Li', 'High grade'],
                ['> 5000 ppm Li', 'Very high grade'],
              ].map(([k, v]) => (
                <div className="result-row" key={k}>
                  <span className="result-key">{k}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cream-dim)' }}>{v}</span>
                </div>
              ))}
            </div>
            <ResultPanel data={result} title="Grade Results" />
          </div>
        </div>
      </div>
    </div>
  )
}
