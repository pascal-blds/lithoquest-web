import { useState } from 'react'
import { apiAAS } from '../api'
import ResultPanel from '../components/ResultPanel'

const ELEMENTS = ['Li','Na','K','Ca','Mg','Fe','Al','Si','Ti','Mn','Cu','Zn','Pb','Ni','Co','Cr','Au','Ag']

export default function AAS() {
  const [form, setForm] = useState({
    absorbance: '', slope: '', intercept: '0',
    dilution_factor: '1', weight_g: '', volume_ml: '', element: 'Li',
  })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setResult(null); setLoading(true)
    try {
      const payload = {
        absorbance:      parseFloat(form.absorbance),
        slope:           parseFloat(form.slope),
        intercept:       parseFloat(form.intercept || 0),
        dilution_factor: parseFloat(form.dilution_factor || 1),
        weight_g:  form.weight_g  ? parseFloat(form.weight_g)  : undefined,
        volume_ml: form.volume_ml ? parseFloat(form.volume_ml) : undefined,
        element: form.element || undefined,
      }
      const data = await apiAAS(payload)
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
        <h2 style={{ marginBottom: '0.5rem' }}>AAS <em>Calculator</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2.5rem', maxWidth: 560, fontSize: '0.93rem' }}>
          Derive element concentrations from absorbance readings using Beer-Lambert law.
          Supports multi-unit output including oxide % conversion.
        </p>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <form onSubmit={submit}>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '1.2rem' }}>Instrument Parameters</div>

              <div className="field">
                <label className="label">Element</label>
                <select className="select" value={form.element} onChange={set('element')}>
                  {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="label">Absorbance (A) <span style={{ color: '#c0392b' }}>*</span></label>
                <input className="input" type="number" step="any" min="0" required
                  placeholder="e.g. 0.342" value={form.absorbance} onChange={set('absorbance')} />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Slope (m) <span style={{ color: '#c0392b' }}>*</span></label>
                  <input className="input" type="number" step="any" required
                    placeholder="Calibration slope" value={form.slope} onChange={set('slope')} />
                </div>
                <div className="field">
                  <label className="label">Intercept (b)</label>
                  <input className="input" type="number" step="any"
                    placeholder="0" value={form.intercept} onChange={set('intercept')} />
                </div>
                <div className="field">
                  <label className="label">Dilution Factor</label>
                  <input className="input" type="number" step="any" min="0.001"
                    placeholder="1" value={form.dilution_factor} onChange={set('dilution_factor')} />
                </div>
              </div>

              <div style={{
                padding: '0.8rem 1rem', background: 'var(--surface-2)',
                borderLeft: '2px solid var(--teal-dim)', marginBottom: '1.2rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  To convert mg/L → ppm in solid sample, enter both weight and volume below.
                </p>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Sample Weight (g)</label>
                  <input className="input" type="number" step="any" min="0"
                    placeholder="e.g. 0.25" value={form.weight_g} onChange={set('weight_g')} />
                </div>
                <div className="field">
                  <label className="label">Final Volume (mL)</label>
                  <input className="input" type="number" step="any" min="0"
                    placeholder="e.g. 50" value={form.volume_ml} onChange={set('volume_ml')} />
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Calculating...</> : 'Calculate Concentration'}
              </button>
            </div>
          </form>

          <div>
            <div className="card card-sm" style={{ background: 'var(--surface-2)', marginBottom: '1rem' }}>
              <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Formula Reference</div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--cream-dim)', lineHeight: 2 }}>
                c = (A − b) / m × DF<br />
                ppm = (c × V_L / W_g) × 1000<br />
                ppb = c × 1000<br />
                % = ppm / 10,000
              </p>
            </div>
            <ResultPanel data={result} title="Concentration Results" />
          </div>
        </div>
      </div>
    </div>
  )
}
