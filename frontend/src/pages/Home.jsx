import { Link } from 'react-router-dom'

const modules = [
  {
    to: '/rock-eval',
    title: 'Rock-Eval Interpreter',
    desc: 'Input TOC, S1, S2, S3, and Tmax to instantly classify source rock quality, kerogen type, and thermal maturity.',
    tag: 'Peters & Cassa 1994',
    color: '#c8831e',
  },
  {
    to: '/aas',
    title: 'AAS Calculator',
    desc: 'Beer-Lambert absorbance → concentration in mg/L, ppm, ppb, %, and oxide % with dilution correction.',
    tag: 'Atomic Absorption',
    color: '#1ab3bc',
  },
  {
    to: '/convert',
    title: 'Unit Converter',
    desc: 'Instantly convert between ppm, ppb, ppt, %, g/t, oz/t, mg/L and every geochemical concentration unit.',
    tag: 'Geochemical Units',
    color: '#c8831e',
  },
  {
    to: '/mineral',
    title: 'Mineral Grade',
    desc: 'Convert element ppm to oxide %, oz/tonne, and receive an industry-standard ore grade classification.',
    tag: 'Li · Cu · Au · Zn',
    color: '#1ab3bc',
  },
  {
    to: '/synthesis',
    title: 'AI Synthesis',
    desc: 'Chat with a geology-specialized AI, auto-generate cited field reports, and summarize technical papers.',
    tag: 'Powered by Claude',
    color: '#c8831e',
  },
  {
    to: '/map',
    title: 'Geo Map',
    desc: 'Plot sample points as GeoJSON on an interactive map with concentration-graded colour markers.',
    tag: 'Geospatial AI',
    color: '#1ab3bc',
  },
]

export default function Home() {
  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        borderBottom: '0.5px solid var(--border-dim)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Strata bg */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            repeating-linear-gradient(180deg,
              transparent 0px, transparent 38px,
              rgba(200,131,30,0.025) 38px, rgba(200,131,30,0.025) 39px),
            repeating-linear-gradient(180deg,
              transparent 0px, transparent 92px,
              rgba(26,179,188,0.018) 92px, rgba(26,179,188,0.018) 93px)
          `,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 2rem' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1ab3bc',
            border: '0.5px solid rgba(26,179,188,0.3)', display: 'inline-flex',
            alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', marginBottom: '2rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1ab3bc', display: 'inline-block' }} />
            Geospatial AI · Mineral Discovery
          </div>
          <h1 style={{ marginBottom: '1.4rem', maxWidth: 640 }}>
            Where <em>Earth Science</em><br />Meets Intelligence
          </h1>
          <p style={{ color: 'var(--cream-dim)', maxWidth: 520, fontSize: '1.02rem', marginBottom: '2.5rem' }}>
            LithoQuest transforms raw geochemical data into predictive, actionable insights —
            from Rock-Eval pyrolysis to AAS results to AI-authored field reports.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/rock-eval" className="btn btn-primary">Start with Rock-Eval</Link>
            <Link to="/synthesis" className="btn btn-ghost">Open AI Synthesis</Link>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">Platform Modules</div>
          <h2 style={{ marginBottom: '3rem' }}>Six tools. <em>One platform.</em></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: 'var(--border-dim)' }}>
            {modules.map(m => (
              <Link
                key={m.to}
                to={m.to}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--black)', padding: '2.2rem 2rem',
                  transition: 'background 0.25s', cursor: 'pointer',
                  height: '100%',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
                >
                  <div style={{
                    width: 2, height: '2.5rem',
                    background: `linear-gradient(180deg, ${m.color}, transparent)`,
                    marginBottom: '1.4rem',
                  }} />
                  <h3 style={{ marginBottom: '0.6rem', fontSize: '1.05rem' }}>{m.title}</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.2rem' }}>
                    {m.desc}
                  </p>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.63rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: m.color, border: `0.5px solid ${m.color}44`,
                    padding: '0.25rem 0.7rem',
                  }}>{m.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
