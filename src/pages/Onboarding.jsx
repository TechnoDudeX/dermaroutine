// Onboarding form — collects skin type, concerns, and current products
// On submit: saves to Supabase, redirects to /generating
import { useState } from 'react'
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

const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']

const CONCERNS = [
  'Acne',
  'Hyperpigmentation',
  'Anti-aging',
  'Redness',
  'Texture',
  'Hydration',
]

export default function Onboarding() {
  const navigate = useNavigate()

  const [skinType,  setSkinType]  = useState(null)
  const [concerns,  setConcerns]  = useState([])
  const [products,  setProducts]  = useState('')
  const [submitted, setSubmitted] = useState(false)

  function toggleConcern(c) {
    setConcerns(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!skinType) return
    setSubmitted(true)
    localStorage.setItem('onboarding', JSON.stringify({ skinType, concerns, products }))
    // TODO: save to Supabase profiles table, then navigate
    navigate('/generating')
  }

  const canSubmit = skinType !== null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100vh;
          background: ${C.bg};
          font-family: 'Inter', sans-serif;
          color: ${C.text};
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 24px 64px;
        }

        .ob-wrap {
          width: 100%;
          max-width: 520px;
        }

        .ob-header {
          margin-bottom: 36px;
        }

        .ob-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${C.text};
          margin-bottom: 24px;
          display: block;
          text-decoration: none;
        }

        .ob-step {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${C.accent};
          margin-bottom: 8px;
        }

        .ob-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1.25;
          color: ${C.text};
          margin-bottom: 8px;
        }

        .ob-subtitle {
          font-size: 0.9375rem;
          color: ${C.muted};
          line-height: 1.5;
        }

        .ob-section {
          margin-bottom: 32px;
        }

        .ob-label {
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${C.muted};
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ob-label-required {
          color: ${C.accent};
          font-size: 0.75rem;
        }

        .ob-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ob-pill {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1.5px solid ${C.border};
          background: ${C.card};
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: ${C.muted};
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
        }
        .ob-pill:hover {
          border-color: ${C.accent};
          color: ${C.accent};
        }
        .ob-pill--active {
          background: ${C.accentBg};
          border-color: ${C.accent};
          color: ${C.accent};
        }

        .ob-textarea {
          width: 100%;
          min-height: 120px;
          padding: 14px 16px;
          border: 1.5px solid ${C.border};
          border-radius: 12px;
          background: ${C.card};
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          color: ${C.text};
          resize: vertical;
          outline: none;
          transition: border-color 0.15s;
          line-height: 1.6;
        }
        .ob-textarea::placeholder { color: ${C.faint}; }
        .ob-textarea:focus { border-color: ${C.accent}; }

        .ob-textarea-hint {
          margin-top: 6px;
          font-size: 0.8rem;
          color: ${C.faint};
        }

        .ob-divider {
          height: 1px;
          background: ${C.border};
          margin-bottom: 32px;
        }

        .ob-submit {
          width: 100%;
          padding: 15px 24px;
          background: ${C.cta};
          color: ${C.ctaText};
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .ob-submit:hover:not(:disabled) { opacity: 0.85; }
        .ob-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ob-submit-hint {
          margin-top: 12px;
          text-align: center;
          font-size: 0.8125rem;
          color: ${C.faint};
        }

        @media (max-width: 480px) {
          .ob-root { padding: 32px 20px 48px; }
          .ob-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="ob-root">
        <div className="ob-wrap">
          <header className="ob-header">
            <a href="/" className="ob-logo">trackmyskin</a>
            <p className="ob-step">Step 1 of 1</p>
            <h1 className="ob-title">Tell us about your skin</h1>
            <p className="ob-subtitle">
              We'll use this to build a routine that actually fits you.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            {/* Skin type */}
            <div className="ob-section">
              <div className="ob-label">
                Skin type <span className="ob-label-required">required</span>
              </div>
              <div className="ob-pills">
                {SKIN_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`ob-pill${skinType === t ? ' ob-pill--active' : ''}`}
                    onClick={() => setSkinType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div className="ob-section">
              <div className="ob-label">
                Skin concerns <span style={{ color: C.faint, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
              </div>
              <div className="ob-pills">
                {CONCERNS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`ob-pill${concerns.includes(c) ? ' ob-pill--active' : ''}`}
                    onClick={() => toggleConcern(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-divider" />

            {/* Products */}
            <div className="ob-section">
              <div className="ob-label">
                Current products <span style={{ color: C.faint, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
              </div>
              <textarea
                className="ob-textarea"
                placeholder={`CeraVe Hydrating Cleanser\nThe Ordinary Niacinamide 10%\nNeutrogena Sunscreen SPF 50`}
                value={products}
                onChange={e => setProducts(e.target.value)}
              />
              <p className="ob-textarea-hint">One product per line.</p>
            </div>

            <button className="ob-submit" type="submit" disabled={!canSubmit || submitted}>
              {submitted ? 'Building your routine…' : 'Build my routine →'}
            </button>
            {!canSubmit && (
              <p className="ob-submit-hint">Select your skin type to continue.</p>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
