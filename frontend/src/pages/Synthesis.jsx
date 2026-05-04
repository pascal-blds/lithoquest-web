import { useState, useRef, useEffect } from 'react'
import { apiChat, apiReport, apiSummarize } from '../api'

const TABS = ['chat', 'report', 'summarize']

function ChatTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I\'m LithoQuest AI — your geology co-pilot. Ask me anything about source rock evaluation, AAS results, stratigraphic interpretation, or critical mineral exploration.' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await apiChat({
        messages: newMessages,
        context: context || undefined,
        mode: 'chat',
      })
      setMessages(m => [...m, { role: 'assistant', content: res.content }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
        padding: '1.5rem', background: 'var(--surface)', border: '0.5px solid var(--border)',
        marginBottom: '1rem',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '0.9rem 1.2rem',
              background: m.role === 'user' ? 'var(--amber-dim)' : 'var(--surface-2)',
              border: `0.5px solid ${m.role === 'user' ? 'var(--amber)' : 'var(--border)'}`,
              fontSize: '0.9rem',
              lineHeight: 1.75,
              color: 'var(--cream)',
              whiteSpace: 'pre-wrap',
            }}>
              {m.role === 'assistant' && (
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem',
                  color: 'var(--teal)', letterSpacing: '0.1em', marginBottom: '0.5rem',
                }}>LITHOQUEST AI</div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            <span className="spinner" /> Analyzing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="input"
          placeholder="Ask about TOC, kerogen types, AAS results, Niger Delta stratigraphy..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
      <div style={{ marginTop: '0.8rem' }}>
        <label className="label" style={{ marginBottom: '0.4rem', display: 'block' }}>
          Optional: Paste raw data / sample context
        </label>
        <textarea
          className="input"
          placeholder="Paste geochemical data, lab results, or additional context here..."
          value={context}
          onChange={e => setContext(e.target.value)}
          style={{ minHeight: 72 }}
        />
      </div>
    </div>
  )
}

function ReportTab() {
  const [form, setForm] = useState({ title: '', formation: '', basin: '', notes: '' })
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setResult(''); setLoading(true)
    try {
      const context = `Title: ${form.title}\nFormation: ${form.formation}\nBasin: ${form.basin}\nNotes: ${form.notes}`
      const res = await apiReport({
        messages: [{ role: 'user', content: `Generate a geological report for: ${form.title}` }],
        context,
        mode: 'report',
      })
      setResult(res.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <form onSubmit={submit}>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: '1.2rem' }}>Report Parameters</div>
          <div className="field">
            <label className="label">Report Title <span style={{ color: '#c0392b' }}>*</span></label>
            <input className="input" required placeholder="e.g. Source Rock Evaluation of Agbada Fm." value={form.title} onChange={set('title')} />
          </div>
          <div className="field">
            <label className="label">Formation</label>
            <input className="input" placeholder="e.g. Agbada Formation" value={form.formation} onChange={set('formation')} />
          </div>
          <div className="field">
            <label className="label">Basin</label>
            <input className="input" placeholder="e.g. Niger Delta Basin" value={form.basin} onChange={set('basin')} />
          </div>
          <div className="field">
            <label className="label">Data / Notes</label>
            <textarea className="input" placeholder="Paste sample data, TOC values, Tmax, HI results..." value={form.notes} onChange={set('notes')} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><span className="spinner" /> Generating Report...</> : 'Generate Report'}
          </button>
        </div>
      </form>

      {result && (
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="eyebrow">Generated Report</div>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              const blob = new Blob([result], { type: 'text/plain' })
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
              a.download = `${form.title || 'report'}.txt`; a.click()
            }}>Download .txt</button>
          </div>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: "'Outfit',sans-serif",
            fontSize: '0.86rem', color: 'var(--cream-dim)', lineHeight: 1.8,
            maxHeight: '60vh', overflowY: 'auto',
          }}>{result}</pre>
        </div>
      )}
    </div>
  )
}

function SummarizeTab() {
  const [text, setText]       = useState('')
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null); setResult(''); setLoading(true)
    try {
      const res = await apiSummarize({
        messages: [{ role: 'user', content: 'Summarize this geological text with key findings, data, and implications.' }],
        context: text,
        mode: 'summarize',
      })
      setResult(res.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <form onSubmit={submit}>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: '1.2rem' }}>Paste Technical Text</div>
          <div className="field">
            <label className="label">Paper / Report / Abstract <span style={{ color: '#c0392b' }}>*</span></label>
            <textarea className="input" required style={{ minHeight: 220 }}
              placeholder="Paste a geological paper abstract, lab report, or technical description..."
              value={text} onChange={e => setText(e.target.value)} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-teal" type="submit" disabled={loading || !text.trim()} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><span className="spinner" /> Summarizing...</> : 'Summarize with AI'}
          </button>
        </div>
      </form>

      {result && (
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="eyebrow" style={{ marginBottom: '1rem' }}>AI Summary</div>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: "'Outfit',sans-serif",
            fontSize: '0.88rem', color: 'var(--cream-dim)', lineHeight: 1.8,
          }}>{result}</pre>
        </div>
      )}
    </div>
  )
}

export default function Synthesis() {
  const [tab, setTab] = useState('chat')

  return (
    <div className="page">
      <div className="container section">
        <div className="eyebrow">Intelligent Synthesis</div>
        <h2 style={{ marginBottom: '0.5rem' }}>AI <em>Co-Pilot</em></h2>
        <p style={{ color: 'var(--cream-dim)', marginBottom: '2rem', maxWidth: 560, fontSize: '0.93rem' }}>
          A geology-specialized LLM trained on source rock interpretation, stratigraphic analysis,
          and formal scientific report structures.
        </p>

        <div className="tabs">
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'chat' ? '💬 Chat' : t === 'report' ? '📄 Report Generator' : '📑 Summarizer'}
            </button>
          ))}
        </div>

        {tab === 'chat'      && <ChatTab />}
        {tab === 'report'    && <ReportTab />}
        {tab === 'summarize' && <SummarizeTab />}
      </div>
    </div>
  )
}
