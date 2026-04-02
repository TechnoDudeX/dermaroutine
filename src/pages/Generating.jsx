// Generating page — calls netlify/functions/generate-routine (Claude API)
// Shows a loading state while Claude builds the routine
// On completion: saves routine to localStorage, redirects to /review
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  bg:      '#fdf8f5',
  card:    '#ffffff',
  border:  '#e5d4c5',
  text:    '#2d1f17',
  muted:   '#7a6555',
  faint:   '#b09080',
  accent:  '#c47a5c',
  accentBg:'#fceee8',
  cta:     '#2d1f17',
  ctaText: '#fdf8f5',
}

const STEPS = [
  'Analysing your skin profile…',
  'Matching products to your concerns…',
  'Sequencing AM and PM steps…',
  'Checking ingredient compatibility…',
  'Finalising your routine…',
]

export default function Generating() {
  const navigate  = useNavigate()
  const [phase, setPhase]     = useState(0)   // which status message
  const [error, setError]     = useState(null)
  const [retrying, setRetrying] = useState(false)
  const ran = useRef(false)

  async function generate() {
    setError(null)
    setRetrying(false)
    setPhase(0)

    const raw = localStorage.getItem('onboarding')
    const onboarding = raw ? JSON.parse(raw) : { skinType: 'Normal', concerns: [], products: '' }

    // Cycle through status messages while waiting
    const interval = setInterval(() => {
      setPhase(p => Math.min(p + 1, STEPS.length - 1))
    }, 2200)

    try {
      const res = await fetch('/.netlify/functions/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skinType: onboarding.skinType,
          concerns: onboarding.concerns,
          products: onboarding.products,
        }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server error ${res.status}`)
      }

      const { routine } = await res.json()
      localStorage.setItem('routine', JSON.stringify(routine))
      navigate('/review')
    } catch (err) {
      clearInterval(interval)
      setError(err.message || 'Something went wrong.')
    }
  }

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gen-root {
          min-height: 100vh;
          background: ${C.bg};
          font-family: 'Inter', sans-serif;
          color: ${C.text};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .gen-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(45,31,23,0.07);
        }

        .gen-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${C.text};
          margin-bottom: 36px;
          display: block;
          text-decoration: none;
        }

        /* ── Orb animation ── */
        .gen-orb-wrap {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 32px;
        }

        .gen-orb {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${C.accentBg};
          border: 2px solid ${C.accent};
          animation: gen-pulse 2s ease-in-out infinite;
        }

        .gen-orb-ring {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1.5px solid ${C.accent};
          opacity: 0;
          animation: gen-ripple 2s ease-out infinite;
        }

        .gen-orb-ring:nth-child(2) { animation-delay: 0.6s; }
        .gen-orb-ring:nth-child(3) { animation-delay: 1.2s; }

        .gen-orb-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
        }

        @keyframes gen-pulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.06); opacity: 0.85; }
        }

        @keyframes gen-ripple {
          0%   { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        /* ── Status text ── */
        .gen-status {
          font-size: 1rem;
          font-weight: 500;
          color: ${C.text};
          margin-bottom: 8px;
          min-height: 1.5em;
          animation: gen-fadein 0.4s ease;
        }

        @keyframes gen-fadein {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .gen-subtext {
          font-size: 0.875rem;
          color: ${C.faint};
        }

        /* ── Progress dots ── */
        .gen-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 28px;
        }

        .gen-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${C.border};
          transition: background 0.3s;
        }

        .gen-dot--active {
          background: ${C.accent};
        }

        /* ── Error state ── */
        .gen-error-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .gen-error-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${C.text};
          margin-bottom: 8px;
        }

        .gen-error-msg {
          font-size: 0.875rem;
          color: ${C.muted};
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .gen-retry-btn {
          padding: 12px 28px;
          background: ${C.cta};
          color: ${C.ctaText};
          border: none;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .gen-retry-btn:hover { opacity: 0.85; }

        @media (max-width: 480px) {
          .gen-card { padding: 36px 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gen-orb, .gen-orb-ring { animation: none !important; }
          .gen-status { animation: none !important; }
        }
      `}</style>

      <div className="gen-root">
        <div className="gen-card">
          <a href="/" className="gen-logo">trackmyskin</a>

          {error ? (
            /* ── Error state ── */
            <>
              <div className="gen-error-icon">✦</div>
              <div className="gen-error-title">Something went wrong</div>
              <div className="gen-error-msg">{error}</div>
              <button
                className="gen-retry-btn"
                onClick={() => { setRetrying(true); generate() }}
                disabled={retrying}
              >
                {retrying ? 'Trying again…' : 'Try again'}
              </button>
            </>
          ) : (
            /* ── Loading state ── */
            <>
              <div className="gen-orb-wrap">
                <div className="gen-orb-ring" />
                <div className="gen-orb-ring" />
                <div className="gen-orb-ring" />
                <div className="gen-orb">
                  <div className="gen-orb-icon">◈</div>
                </div>
              </div>

              <div className="gen-status" key={phase}>{STEPS[phase]}</div>
              <div className="gen-subtext">This usually takes 10–20 seconds</div>

              <div className="gen-dots">
                {STEPS.map((_, i) => (
                  <div key={i} className={`gen-dot${i <= phase ? ' gen-dot--active' : ''}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
