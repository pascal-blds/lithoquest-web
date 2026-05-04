import { useState } from 'react'
import { apiRockEval } from '../api'
import ResultPanel from '../components/ResultPanel'

const initialForm = {
  sample_id: '', formation: '',
  toc: '', s1: '', s2: '', s3: '', tmax: '',
}

export default function RockEval() {
  const [form, setForm]     = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setResult(null); setLoading(true)
    try {
      const payload = {
        toc: parseFloat(form.toc),
        sample_id: form.sample_id || undefined,
        formation: form.formation || undefined,
        s1:   form.s1   ? parseFloat(form.s1)   : undefined,
        s2:   form.s2   ? parseFloat(form.s2)   : undefined,
        s3:   form.s3   ? parseFloat(form.s3)   : undefined,
        tmax: form.tmax ? parseFloat(form.tmax) : undefined,
      }
      const data = await apiRockEval(payload)
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
        <h2 style={{ marginBottom: '0.5rem' }}>Rock-Eval <em>Interpreter</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2.5rem', maxWidth: 560, fontSize: '0.93rem' }}>
          Input pyrolysis parameters to instantly classify source rock quality, kerogen type,
          and thermal maturity. References: Espitalié et al. (1977), Peters & Cassa (1994),
          Tissot & Welte (1984).
        </p>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <form onSubmit={submit}>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '1.2rem' }}>Sample Parameters</div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Sample ID</label>
                  <input className="input" placeholder="e.g. ND-001" value={form.sample_id} onChange={set('sample_id')} />
                </div>
                <div className="field">
                  <label className="label">Formation</label>
                  <input className="input" placeholder="e.g. Agbada Fm." value={form.formation} onChange={set('formation')} />
                </div>
              </div>

              <div className="field">
                <label className="label">TOC (%) <span style={{ color: '#c0392b' }}>*</span></label>
                <input className="input" type="number" step="any" min="0" required
                  placeholder="e.g. 2.4" value={form.toc} onChange={set('toc')} />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">S1 (mg HC/g rock)</label>
                  <input className="input" type="number" step="any" min="0"
                    placeholder="Free hydrocarbons" value={form.s1} onChange={set('s1')} />
                </div>
                <div className="field">
                  <label className="label">S2 (mg HC/g rock)</label>
                  <input className="input" type="number" step="any" min="0"
                    placeholder="Generative potential" value={form.s2} onChange={set('s2')} />
                </div>
                <div className="field">
                  <label className="label">S3 (mg CO₂/g rock)</label>
                  <input className="input" type="number" step="any" min="0"
                    placeholder="CO₂ yield" value={form.s3} onChange={set('s3')} />
                </div>
                <div className="field">
                  <label className="label">Tmax (°C)</label>
                  <input className="input" type="number" step="any"
                    placeholder="e.g. 438" value={form.tmax} onChange={set('tmax')} />
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Interpreting...</> : 'Interpret Parameters'}
              </button>
            </div>
          </form>

          <div>
            <div className="card card-sm" style={{ marginBottom: '1rem', background: 'var(--surface-2)' }}>
              <div className="eyebrow" style={{ marginBottom: '0.6rem' }}>Reference Guide</div>
              {[
                ['TOC < 0.5%', 'Poor source rock'],
                ['TOC 0.5–1%', 'Fair source rock'],
                ['TOC 1–2%', 'Good source rock'],
                ['TOC 2–4%', 'Very good source rock'],
                ['TOC > 4%', 'Excellent source rock'],
                ['Tmax < 435°C', 'Immature'],
                ['Tmax 435–445°C', 'Early oil window'],
                ['Tmax 445–450°C', 'Peak oil window'],
                ['Tmax 450–470°C', 'Wet gas / condensate'],
                ['Tmax > 470°C', 'Dry gas / overmature'],
              ].map(([k, v]) => (
                <div className="result-row" key={k}>
                  <span className="result-key">{k}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cream-dim)' }}>{v}</span>
                </div>
              ))}
            </div>

            <ResultPanel data={result} title="Interpretation Results" />
          </div>
        </div>
      </div>
    </div>
  )
}
