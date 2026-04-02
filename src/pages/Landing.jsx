// Landing page — TrackMySkin full redesign
import { useState } from 'react'

// ── Color tokens ───────────────────────────────────────────────
const C = {
  bg:           '#fdf8f5',
  surface:      '#f5ede8',
  card:         '#ffffff',
  border:       '#e5d4c5',
  borderLight:  '#f0e4da',
  text:         '#2d1f17',
  muted:        '#7a6555',
  faint:        '#b09080',
  green:        '#5a9e74',
  greenBg:      '#eaf5ef',
  greenBorder:  '#bce0cb',
  streak:       '#c47a5c',
  streakBg:     '#fceee8',
  streakBorder: '#f2c0a8',
  cta:          '#2d1f17',
  ctaText:      '#fdf8f5',
}

// ── Global styles (keyframes + fonts + responsive) ─────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; }

      @keyframes tms-progressFill {
        from { width: 0%; }
        to   { width: 62%; }
      }
      @keyframes tms-streakGlow {
        0%,100% { box-shadow: 0 0 0 0 rgba(196,122,92,0.35); }
        50%     { box-shadow: 0 0 14px 4px rgba(196,122,92,0.12); }
      }
      @keyframes tms-phoneFloat {
        0%,100% { transform: translateY(0px) rotate(-2deg); }
        50%     { transform: translateY(-10px) rotate(-2deg); }
      }

      .tms-progress { animation: tms-progressFill 1.6s cubic-bezier(0.4,0,0.2,1) 0.9s both; }
      .tms-phone    { animation: tms-phoneFloat 5s ease-in-out infinite; }
      .tms-streak   { animation: tms-streakGlow 2.5s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .tms-progress, .tms-phone, .tms-streak { animation: none !important; }
      }

      .tms-hero-inner {
        display: flex;
        align-items: center;
        gap: 64px;
        max-width: 1020px;
        margin: 0 auto;
        padding: 0 32px;
      }
      .tms-hero-text   { flex: 1; min-width: 0; }
      .tms-hero-visual { flex-shrink: 0; }

      .tms-screens-grid {
        display: grid;
        grid-template-columns: repeat(3, 238px);
        gap: 24px;
        justify-content: center;
      }

      @media (max-width: 840px) {
        .tms-hero-inner { flex-direction: column; gap: 48px; text-align: center; }
        .tms-hero-visual { order: -1; }
        .tms-hero-text  { display: flex; flex-direction: column; align-items: center; }
        .tms-screens-grid { grid-template-columns: 238px; }
      }
      @media (max-width: 520px) {
        .tms-hero-inner { padding: 0 20px; }
      }
    `}</style>
  )
}

// ── SVG primitives ─────────────────────────────────────────────
function Flame({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
      <path d="M7 1s4 4.5 4 8c0 2.2-1.8 4-4 4S3 11.2 3 9c0-2 1-3.5 2-4.5 0 0 0 2.5 2 2.5 0 0 1-1.5 0-3.5.5.5 2 2 2 3.5 0 0 1-1 .5-2.5C10.5 6 11 7.5 11 9" />
    </svg>
  )
}

function Tick({ color = 'white', size = 10 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path d="M1 4L3.5 6.5L9 1.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuoteDecor() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
      <path d="M0 18V11C0 7.333 1.833 4.167 5.5 2L7.5 4.5C6 5.333 5 6.5 4.5 8H9V18H0ZM13 18V11C13 7.333 14.833 4.167 18.5 2L20.5 4.5C19 5.333 18 6.5 17.5 8H22V18H13Z" fill={C.greenBorder} />
    </svg>
  )
}

// ── Phone frame ────────────────────────────────────────────────
function PhoneFrame({ children, float = false, tilt = false }) {
  return (
    <div
      className={float ? 'tms-phone' : undefined}
      style={{
        width: 238,
        height: 486,
        background: '#1c1c1e',
        borderRadius: 40,
        padding: 3,
        boxShadow: [
          '0 40px 80px rgba(45,31,23,0.20)',
          '0 0 0 1.5px rgba(45,31,23,0.10)',
          'inset 0 0 0 1px rgba(255,255,255,0.06)',
        ].join(', '),
        transform: tilt && !float ? 'rotate(-2deg)' : undefined,
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div style={{
        width: '100%', height: '100%',
        background: C.bg, borderRadius: 37,
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 88, height: 26, background: '#1c1c1e', borderRadius: 13, zIndex: 10,
        }} />
        {/* Battery indicator */}
        <div style={{
          position: 'absolute', top: 18, right: 22, zIndex: 11,
          width: 16, height: 8, border: `1px solid ${C.faint}`, borderRadius: 2.5,
        }}>
          <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2, height: 4, background: C.faint, borderRadius: 1 }} />
          <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '70%', background: C.green, borderRadius: 1 }} />
        </div>
        {/* Content */}
        <div style={{ paddingTop: 48, height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
      {/* Right button */}
      <div style={{ position: 'absolute', right: -2.5, top: 110, width: 2.5, height: 54, background: '#2c2c2e', borderRadius: '0 2px 2px 0' }} />
      {/* Left buttons */}
      {[80, 128, 174].map(t => (
        <div key={t} style={{ position: 'absolute', left: -2.5, top: t, width: 2.5, height: 32, background: '#2c2c2e', borderRadius: '2px 0 0 2px' }} />
      ))}
    </div>
  )
}

// ── Screen 1: Daily routine ────────────────────────────────────
function DailyScreen() {
  const steps = [
    { name: 'Oil Cleanser',     done: true  },
    { name: 'Vitamin C Serum',  done: true  },
    { name: 'Moisturizer',      done: true  },
    { name: 'Eye Cream',        done: false },
    { name: 'Sunscreen SPF 50', done: false },
  ]
  return (
    <div style={{ padding: '10px 13px' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'Inter', fontSize: 9.5, fontWeight: 600, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 1 }}>Monday</div>
        <div style={{ fontFamily: 'Playfair Display', fontSize: 15.5, fontWeight: 700, color: C.text }}>Morning Routine</div>
      </div>

      <div
        className="tms-streak"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: C.streakBg, border: `1px solid ${C.streakBorder}`,
          borderRadius: 100, padding: '3px 9px', marginBottom: 10,
          fontFamily: 'Inter', fontSize: 10.5, fontWeight: 600, color: C.streak,
        }}
      >
        <Flame size={10} /> 3 day streak
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 9.5, fontWeight: 500, color: C.muted }}>3 of 5 complete</span>
          <span style={{ fontFamily: 'Inter', fontSize: 9.5, fontWeight: 600, color: C.green }}>60%</span>
        </div>
        <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
          <div
            className="tms-progress"
            style={{ height: '100%', background: `linear-gradient(90deg, ${C.green}, #7ac49a)`, borderRadius: 99 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4.5 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 9px', borderRadius: 9,
            background: s.done ? C.greenBg : C.card,
            border: `1px solid ${s.done ? C.greenBorder : C.borderLight}`,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              background: s.done ? C.green : 'transparent',
              border: `1.5px solid ${s.done ? C.green : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.done && <Tick />}
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 10.5, fontWeight: s.done ? 500 : 400, color: s.done ? C.green : C.text }}>
              {s.name}
            </span>
            {s.done && (
              <span style={{ marginLeft: 'auto', fontFamily: 'Inter', fontSize: 9, fontWeight: 600, color: C.green }}>Done</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Screen 2: Weekly overview ──────────────────────────────────
function WeeklyScreen() {
  const days = [
    { d: 'M', s: 'full'    },
    { d: 'T', s: 'full'    },
    { d: 'W', s: 'full'    },
    { d: 'T', s: 'partial' },
    { d: 'F', s: 'partial' },
    { d: 'S', s: 'empty'   },
    { d: 'S', s: 'empty'   },
  ]
  const bg  = s => s === 'full' ? C.green : s === 'partial' ? C.streakBg : C.borderLight
  const bdr = s => s === 'full' ? C.green : s === 'partial' ? C.streakBorder : C.border

  return (
    <div style={{ padding: '10px 13px' }}>
      <div style={{ fontFamily: 'Playfair Display', fontSize: 15.5, fontWeight: 700, color: C.text, marginBottom: 2 }}>This Week</div>
      <div style={{ fontFamily: 'Inter', fontSize: 10, color: C.muted, marginBottom: 14 }}>Apr 1 – Apr 7</div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 18 }}>
        {days.map((day, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 8.5, fontWeight: 600, color: C.faint, marginBottom: 4, letterSpacing: '0.04em' }}>{day.d}</div>
            <div style={{
              width: '100%', aspectRatio: '1',
              background: bg(day.s), border: `1.5px solid ${bdr(day.s)}`,
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {day.s === 'full'    && <Tick />}
              {day.s === 'partial' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.streak }} />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 14 }}>
        <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: '9px 11px' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: C.green }}>5</div>
          <div style={{ fontFamily: 'Inter', fontSize: 9.5, color: C.muted, fontWeight: 500 }}>Days active</div>
        </div>
        <div style={{ background: C.streakBg, border: `1px solid ${C.streakBorder}`, borderRadius: 10, padding: '9px 11px' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 700, color: C.streak }}>87%</div>
          <div style={{ fontFamily: 'Inter', fontSize: 9.5, color: C.muted, fontWeight: 500 }}>Completion</div>
        </div>
      </div>

      <div style={{
        fontFamily: 'Inter', fontSize: 10, color: C.muted,
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: '7px 10px',
      }}>
        PM routine completed · Sunday
      </div>
    </div>
  )
}

// ── Screen 3: Streak ───────────────────────────────────────────
function StreakScreen() {
  return (
    <div style={{ padding: '10px 13px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div
        className="tms-streak"
        style={{
          width: 70, height: 70,
          background: C.streakBg, border: `2px solid ${C.streakBorder}`,
          borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, color: C.streak,
        }}
      >
        <Flame size={34} />
      </div>

      <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Current streak</div>
      <div style={{ fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 700, color: C.streak, lineHeight: 1 }}>7</div>
      <div style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 600, color: C.text, marginTop: 2, marginBottom: 18 }}>days in a row</div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 7,
            background: C.green, border: `1.5px solid ${C.greenBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tick />
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'Inter', fontSize: 10.5, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
        Keep going. Your skin will thank you.
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function Landing() {
  const [cta1, setCta1] = useState(false)
  const [cta2, setCta2] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const ctaStyle = (hover) => ({
    display: 'inline-flex', alignItems: 'center',
    background: C.cta, color: C.ctaText,
    fontFamily: 'Inter', fontSize: 15, fontWeight: 600,
    padding: '14px 32px', borderRadius: 100,
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    boxShadow: hover ? '0 10px 32px rgba(45,31,23,0.32)' : '0 4px 16px rgba(45,31,23,0.20)',
    transform: hover ? 'translateY(-2px)' : 'translateY(0)',
    whiteSpace: 'nowrap',
  })

  const inner = { maxWidth: 680, margin: '0 auto', padding: '0 28px' }
  const divider = <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`, margin: '0 28px' }} />

  const faqs = [
    { q: 'What is TrackMySkin?', a: 'TrackMySkin is a skincare routine app that helps you build and track your daily skincare routine with AM and PM steps.' },
    { q: 'How do I track my skincare routine daily?', a: 'Use TrackMySkin to check off each step in your routine every morning and night. This helps you stay consistent.' },
    { q: 'What is the correct skincare routine order?', a: 'TrackMySkin organizes your products in the correct order, usually cleanser, treatment, serum, moisturizer, and sunscreen in the morning.' },
    { q: 'Is TrackMySkin free?', a: 'Yes — TrackMySkin is completely free, no account or payment required.' },
  ]

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'Inter, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(253,248,245,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.borderLight}`,
        padding: '0 28px',
      }}>
        <div style={{ maxWidth: 1020, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>TrackMySkin</div>
          <a
            href="/onboarding"
            style={{
              fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
              color: C.ctaText, background: C.cta,
              padding: '8px 20px', borderRadius: 100,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'opacity 150ms ease',
            }}
          >
            Get started — free
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 72, paddingBottom: 80 }} aria-labelledby="hero-h1">
        <div className="tms-hero-inner">
          <div className="tms-hero-text">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: C.greenBg, border: `1px solid ${C.greenBorder}`,
              borderRadius: 100, padding: '4px 12px', marginBottom: 24,
              fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: C.green,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
              Daily skincare tracker
            </div>

            <h1 id="hero-h1" style={{
              fontFamily: 'Playfair Display',
              fontSize: 'clamp(34px, 5vw, 54px)',
              fontWeight: 700, lineHeight: 1.1, color: C.text,
              marginBottom: 20, letterSpacing: '-0.02em',
            }}>
              Track your skincare.<br />
              <span style={{ fontStyle: 'italic', color: C.streak }}>Stay consistent.</span>
            </h1>

            <p style={{ fontFamily: 'Inter', fontSize: 17, lineHeight: 1.65, color: C.muted, marginBottom: 12, maxWidth: 440 }}>
              TrackMySkin helps you build and follow your AM and PM routine so you don't miss steps or skip days.
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 15, lineHeight: 1.6, color: C.muted, marginBottom: 36, maxWidth: 400 }}>
              Check it off. Build your streak. See results.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <a
                href="/onboarding"
                style={ctaStyle(cta1)}
                onMouseEnter={() => setCta1(true)}
                onMouseLeave={() => setCta1(false)}
                onFocus={() => setCta1(true)}
                onBlur={() => setCta1(false)}
              >
                Build my routine — free
              </a>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: C.faint }}>
                Free, forever · No account needed
              </span>
            </div>
          </div>

          <div className="tms-hero-visual">
            <PhoneFrame float>
              <DailyScreen />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* ── Quick proof ── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '28px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
          {[
            'Track your skincare routine daily',
            'Build a personalized AM and PM routine',
            'Follow the correct skincare order every day',
            'Free, forever. No account needed.',
          ].map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Tick />
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: C.text }}>{pt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why TrackMySkin ── */}
      <section style={{ padding: '80px 0' }} aria-labelledby="why-heading">
        <div style={inner}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Why TrackMySkin</p>
          <h2 id="why-heading" style={{
            fontFamily: 'Playfair Display', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700, color: C.text, marginBottom: 20, lineHeight: 1.2,
          }}>
            Consistency is what actually improves your skin.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 16, lineHeight: 1.7, color: C.muted, marginBottom: 14, maxWidth: 560 }}>
            TrackMySkin makes it easy to remember what to use, when to use it, and keeps everything in one place.
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 16, lineHeight: 1.7, color: C.muted, maxWidth: 560 }}>
            If you've been looking for a skincare routine app or a way to track your skincare routine daily, this is built for that.
          </p>

          {/* Habit / streak cue */}
          <div style={{
            marginTop: 44, padding: '24px 28px',
            background: C.streakBg, border: `1px solid ${C.streakBorder}`,
            borderRadius: 18, display: 'inline-block',
          }}>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.faint, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 14 }}>Your streak</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div
                className="tms-streak"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: C.streakBg, border: `1.5px solid ${C.streakBorder}`,
                  borderRadius: 12, padding: '10px 18px',
                  fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, color: C.streak,
                }}
              >
                <Flame size={20} /> 5 days
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: i < 5 ? C.green : C.surface,
                    border: `1.5px solid ${i < 5 ? C.greenBorder : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Inter', fontSize: 9.5, fontWeight: 700,
                    color: i < 5 ? 'white' : C.faint,
                  }}>
                    {i < 5 ? <Tick /> : d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── How it works ── */}
      <section style={{ padding: '80px 0' }} aria-labelledby="how-heading">
        <div style={inner}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>How it works</p>
          <h2 id="how-heading" style={{
            fontFamily: 'Playfair Display', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700, color: C.text, textAlign: 'center',
            marginBottom: 52, lineHeight: 1.2,
          }}>
            Three steps to staying consistent.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '1', title: 'Build your routine',      desc: 'Enter your skin type, concerns, and products. TrackMySkin organizes your routine into AM and PM.' },
              { n: '2', title: 'Follow the right order',  desc: 'Each step is placed in the correct skincare order so you always know what comes next.' },
              { n: '3', title: 'Track it daily',          desc: 'Check off each step and build your streak. Your skincare routine tracker keeps you consistent.' },
            ].map((step, i, arr) => (
              <div key={i}>
                <div style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  padding: '24px 28px', borderRadius: 14,
                  background: C.card, border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, color: C.green,
                  }}>
                    {step.n}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>{step.title}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65, color: C.muted }}>{step.desc}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 16, background: C.border, marginLeft: 46 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {divider}

      {/* ── 3 Product screens ── */}
      <section style={{ padding: '80px 28px' }} aria-labelledby="screens-heading">
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>What it looks like</p>
          <h2 id="screens-heading" style={{
            fontFamily: 'Playfair Display', fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700, color: C.text, textAlign: 'center',
            marginBottom: 56, lineHeight: 1.2,
          }}>
            A habit product, not a tool.
          </h2>
          <div className="tms-screens-grid">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PhoneFrame>
                <DailyScreen />
              </PhoneFrame>
              <div style={{ marginTop: 20, fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: C.text }}>Daily view</div>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.muted, marginTop: 4 }}>Check off each step</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 36 }}>
              <PhoneFrame>
                <WeeklyScreen />
              </PhoneFrame>
              <div style={{ marginTop: 20, fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: C.text }}>Weekly overview</div>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.muted, marginTop: 4 }}>See your week at a glance</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PhoneFrame>
                <StreakScreen />
              </PhoneFrame>
              <div style={{ marginTop: 20, fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: C.text }}>Streak moment</div>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: C.muted, marginTop: 4 }}>Build the habit, feel it</div>
            </div>
          </div>
        </div>
      </section>

      {divider}

      {/* ── Social proof ── */}
      <section style={{ padding: '80px 0', background: C.surface }} aria-labelledby="proof-heading">
        <div style={inner}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>What people say</p>
          <h2 id="proof-heading" style={{
            fontFamily: 'Playfair Display', fontSize: 'clamp(24px, 3.5vw, 34px)',
            fontWeight: 700, color: C.text, textAlign: 'center', marginBottom: 48, lineHeight: 1.2,
          }}>
            Real people. Real routines.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'I finally found a way to stick to my skincare routine.',
              'This made tracking my skincare routine so easy.',
              'My skin improved once I stopped missing days.',
            ].map((quote, i) => (
              <div key={i} style={{
                padding: '24px 28px', borderRadius: 14,
                background: C.card, border: `1px solid ${C.border}`,
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}><QuoteDecor /></div>
                <p style={{ fontFamily: 'Playfair Display', fontSize: 17, fontStyle: 'italic', color: C.text, lineHeight: 1.55, margin: 0 }}>
                  "{quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {divider}

      {/* ── What you get ── */}
      <section style={{ padding: '80px 0' }} aria-labelledby="features-heading">
        <div style={inner}>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>What you get</p>
          <h2 id="features-heading" style={{
            fontFamily: 'Playfair Display', fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 700, color: C.text, marginBottom: 36, lineHeight: 1.2,
          }}>
            Everything you need. Nothing you don't.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'A complete AM and PM skincare routine',
              'A daily skincare tracker with check-offs',
              'Weekly structure for treatments and active days',
              'Clear step-by-step product order',
              'A simple way to stay consistent with skincare',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Tick />
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 15, color: C.text, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: '0 0 80px' }} aria-labelledby="pricing-heading">
        <div style={{ ...inner, textAlign: 'center' }}>
          <div style={{
            padding: '52px 44px', borderRadius: 24,
            background: C.card, border: `1px solid ${C.border}`,
            boxShadow: '0 8px 40px rgba(45,31,23,0.07)',
          }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, color: C.text, lineHeight: 1.1, marginBottom: 8 }}>
              Free, forever.
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: C.muted, marginBottom: 24, fontWeight: 500, letterSpacing: '0.02em' }}>
              No account · No subscription · No upsells
            </div>
            <h2 id="pricing-heading" style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: C.text, marginBottom: 14, lineHeight: 1.2 }}>
              Your routine, ready every day.
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: C.muted, lineHeight: 1.65, maxWidth: 400, margin: '0 auto 36px' }}>
              Get a personalised AM and PM routine in under a minute. No fees, no locked features, nothing to sign up for. Come back any day and your tracker is still there.
            </p>
            <a
              href="/onboarding"
              style={ctaStyle(cta2)}
              onMouseEnter={() => setCta2(true)}
              onMouseLeave={() => setCta2(false)}
              onFocus={() => setCta2(true)}
              onBlur={() => setCta2(false)}
            >
              Build my routine — free
            </a>
          </div>
        </div>
      </section>

      {divider}

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 0' }} aria-labelledby="faq-heading">
        <div style={inner}>
          <h2 id="faq-heading" style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: C.text, marginBottom: 40, lineHeight: 1.2 }}>
            Frequently asked questions
          </h2>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                borderTop: `1px solid ${C.border}`,
                ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}),
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  style={{
                    width: '100%', padding: '20px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: C.text }}>{faq.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease', color: C.muted }}
                  >
                    <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 20, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, color: C.muted }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO footer ── */}
      <section style={{ padding: '48px 28px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 13, lineHeight: 1.85, color: C.faint }}>
            TrackMySkin is a skincare routine tracker that helps you build and follow your daily skincare routine. It works as both a skincare routine builder and tracker, organizing your AM and PM steps while letting you check off each step daily. If you're looking for the best way to track your skincare routine, stay consistent, and follow the correct skincare order, TrackMySkin gives you a simple system that works.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '24px 28px', borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <span style={{ fontFamily: 'Playfair Display', fontSize: 15, fontWeight: 700, color: C.text }}>TrackMySkin</span>
        <span style={{ fontFamily: 'Inter', fontSize: 12, color: C.faint }}>Built by Mazin Kanuga</span>
      </footer>
    </div>
  )
}
