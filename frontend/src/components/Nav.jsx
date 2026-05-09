import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/extract',   label: 'AI Extraction', isNew: true },
  { to: '/rock-eval', label: 'Rock-Eval' },
  { to: '/aas',       label: 'AAS' },
  { to: '/convert',   label: 'Convert' },
  { to: '/mineral',   label: 'Mineral' },
  { to: '/synthesis', label: 'AI Synthesis' },
  { to: '/map',       label: 'Geo Map' },
]

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem',
    background: 'rgba(8,9,11,0.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '0.5px solid rgba(200,131,30,0.15)',
  },
  logo: {
    fontFamily: "'Cormorant', serif",
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#e8a84a',
    textDecoration: 'none',
    letterSpacing: '0.05em',
  },
  logoSpan: { color: '#1ab3bc' },
  links: { display: 'flex', gap: '0.2rem', listStyle: 'none' },
  link: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '0.45rem 0.75rem',
    color: '#6e6558',
    textDecoration: 'none',
    borderBottom: '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  linkActive: { color: '#e8a84a', borderBottomColor: '#c8831e' },
  newBadge: {
    fontSize: '0.5rem',
    background: '#1ab3bc',
    color: '#08090b',
    padding: '0.1rem 0.35rem',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
}

export default function Nav() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        Litho<span style={styles.logoSpan}>Quest</span>
      </Link>

      <ul style={styles.links}>
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {l.label}
              {l.isNew && <span style={styles.newBadge}>NEW</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
