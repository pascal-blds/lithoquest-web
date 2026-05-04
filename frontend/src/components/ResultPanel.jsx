export default function ResultPanel({ data, title = 'Results' }) {
  if (!data) return null

  const badge = (val) => {
    if (!val) return null
    const poor = /poor|immature|type iv|sub-eco/i.test(val)
    const good = /excellent|very good|peak|type i|high grade|bonanza/i.test(val)
    const cls = poor ? 'result-badge badge-red' : good ? 'result-badge badge-teal' : 'result-badge badge-amber'
    return <span className={cls}>{val}</span>
  }

  const fmt = (v) => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') return v.toLocaleString(undefined, { maximumFractionDigits: 6 })
    return String(v)
  }

  const classificationKeys = [
    'toc_classification', 'hi_classification', 'maturity', 'kerogen_type',
    'generation_potential', 'grade_category',
  ]
  const descriptionKeys = [
    'toc_description', 'maturity_description', 'kerogen_description',
  ]

  const entries = Object.entries(data).filter(
    ([k]) => !descriptionKeys.includes(k) && k !== 'sample_id'
  )

  const descriptions = Object.entries(data).filter(([k]) => descriptionKeys.includes(k))

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="eyebrow" style={{ marginBottom: '1rem' }}>{title}</div>

      {data.sample_id && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: '#1ab3bc',
            border: '0.5px solid rgba(26,179,188,0.3)',
            padding: '0.25rem 0.7rem',
          }}>
            Sample: {data.sample_id}
          </span>
        </div>
      )}

      {entries.map(([k, v]) => (
        <div className="result-row" key={k}>
          <span className="result-key">{k.replace(/_/g, ' ')}</span>
          {classificationKeys.includes(k)
            ? badge(fmt(v))
            : <span className="result-value">{fmt(v)}</span>
          }
        </div>
      ))}

      {descriptions.length > 0 && (
        <div style={{
          marginTop: '1.2rem',
          padding: '1rem',
          background: 'var(--surface-2)',
          borderLeft: '2px solid var(--amber-dim)',
        }}>
          {descriptions.map(([k, v]) => (
            <p key={k} style={{ fontSize: '0.84rem', color: 'var(--cream-dim)', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {k.replace(/_/g, ' ')}:{' '}
              </strong>
              {v}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
