// Review page — completeness check, edit mode with drag-reorder, day toggling, inline add
// Shows a soft donation prompt before navigating to /tracker
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const SUPPORT_URL = 'https://buymeacoffee.com/mazinkanuga'

// ── Tokens ───────────────────────────────────────────────────────
const C = {
  bg:           '#fdf8f5',
  surface:      '#f5ede8',
  card:         '#ffffff',
  border:       '#e5d4c5',
  borderLight:  '#f0e4da',
  text:         '#2d1f17',
  muted:        '#7a6555',
  faint:        '#b09080',
  accent:       '#c47a5c',
  accentBg:     '#fceee8',
  accentBorder: '#f2c0a8',
  green:        '#5a9e74',
  greenBg:      '#eaf5ef',
  greenBorder:  '#bce0cb',
  warn:         '#9a6820',
  warnBg:       '#fef7e8',
  warnBorder:   '#f0d898',
  cta:          '#2d1f17',
  ctaText:      '#fdf8f5',
}

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

const DAY_LABELS = {
  monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday',
  thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday',
}

const DAY_SHORT = {
  monday:'Mo', tuesday:'Tu', wednesday:'We',
  thursday:'Th', friday:'Fr', saturday:'Sa', sunday:'Su',
}

const CATEGORIES = [
  'cleanser','toner','exfoliant','serum','treatment',
  'eye-cream','moisturiser','sunscreen','oil','mask','other',
]

const CAT_COLORS = {
  cleanser:    { bg:'#eaf5ef', border:'#bce0cb', text:'#3a7a55' },
  toner:       { bg:'#f0eeff', border:'#c9c2f5', text:'#5548c8' },
  exfoliant:   { bg:'#fceee8', border:'#f2c0a8', text:'#a0472a' },
  serum:       { bg:'#fef9e8', border:'#f5e4a0', text:'#8a6800' },
  treatment:   { bg:'#fceee8', border:'#f2c0a8', text:'#a0472a' },
  'eye-cream': { bg:'#eef6fd', border:'#b8daf5', text:'#2070a8' },
  moisturiser: { bg:'#eaf5ef', border:'#bce0cb', text:'#3a7a55' },
  sunscreen:   { bg:'#fef9e8', border:'#f5e4a0', text:'#8a6800' },
  oil:         { bg:'#fceee8', border:'#f2c0a8', text:'#a0472a' },
  mask:        { bg:'#f0eeff', border:'#c9c2f5', text:'#5548c8' },
  other:       { bg:'#f5ede8', border:'#e5d4c5', text:'#7a6555' },
}

function catStyle(cat) { return CAT_COLORS[cat] || CAT_COLORS.other }

const MISSING_WARNINGS = {
  sunscreen:   '⚠️ No sunscreen detected — SPF is essential if you\'re using actives or concerned about hyperpigmentation. Consider adding one to your routine.',
  moisturiser: '⚠️ No moisturiser detected — a good moisturiser protects your skin barrier, especially when using actives.',
  cleanser:    '⚠️ No cleanser detected — cleansing is the foundation of any routine.',
}

function getMissing(routine) {
  const allCats = new Set()
  const amCats = new Set()
  DAYS.forEach(d => {
    ;(routine[d]?.am || []).forEach(s => { allCats.add(s.category); amCats.add(s.category) })
    ;(routine[d]?.pm || []).forEach(s => allCats.add(s.category))
  })
  const missing = []
  if (!allCats.has('cleanser'))    missing.push('cleanser')
  if (!allCats.has('moisturiser')) missing.push('moisturiser')
  if (!amCats.has('sunscreen'))    missing.push('sunscreen')
  return missing
}

// ── Product checklist ─────────────────────────────────────────────
const REQUIRED_CHECKS = [
  { label: 'Cleanser',    keywords: ['cleanser','wash','foam','gel cleanser','micellar'] },
  { label: 'Moisturiser', keywords: ['moisturizer','moisturiser','cream','lotion','gel cream','barrier'] },
  { label: 'Sunscreen',   keywords: ['sunscreen','spf','sunblock','uv'] },
]

const RECOMMENDED_CHECKS = [
  { label: 'Vitamin C',   keywords: ['vitamin c','ascorbic','l-aa'] },
  { label: 'Niacinamide', keywords: ['niacinamide','niacin'] },
  { label: 'Toner',       keywords: ['toner','essence'] },
  { label: 'Eye cream',   keywords: ['eye cream','eye serum'] },
  { label: 'Retinoid',    keywords: ['retinol','retinoid','tretinoin','retin-a','adapalene'] },
  { label: 'Exfoliant',   keywords: ['aha','bha','glycolic','salicylic','lactic','exfoliant','peeling'] },
]

function matchesAny(productLine, keywords) {
  const lower = productLine.toLowerCase()
  return keywords.some(kw => lower.includes(kw))
}

function buildChecklists(productsText) {
  const lines = (productsText || '').split('\n').map(l => l.trim()).filter(Boolean)
  const required = REQUIRED_CHECKS.map(({ label, keywords }) => ({
    label,
    found: lines.some(l => matchesAny(l, keywords)),
  }))
  const recommended = RECOMMENDED_CHECKS.map(({ label, keywords }) => ({
    label,
    found: lines.some(l => matchesAny(l, keywords)),
  }))
  return { required, recommended }
}

// ── AddForm ──────────────────────────────────────────────────────
function AddForm({ onAdd, onCancel }) {
  const [product, setProduct]   = useState('')
  const [category, setCategory] = useState('other')
  const [notes, setNotes]       = useState('')

  function submit(e) {
    e.preventDefault()
    if (!product.trim()) return
    onAdd({ product: product.trim(), category, notes: notes.trim() })
    setProduct(''); setNotes('')
  }

  return (
    <form className="rev-add-form" onSubmit={submit}>
      <input
        className="rev-field"
        placeholder="Product name"
        value={product}
        onChange={e => setProduct(e.target.value)}
        autoFocus
      />
      <select className="rev-field" value={category} onChange={e => setCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input
        className="rev-field"
        placeholder="Notes (optional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <div className="rev-add-actions">
        <button type="submit" className="rev-add-submit" disabled={!product.trim()}>
          Add step
        </button>
        <button type="button" className="rev-add-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Step ─────────────────────────────────────────────────────────
function Step({
  step, editMode, day, slot, index, routine,
  isDragOver, onDelete, onToggleDay,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const cs = catStyle(step.category)

  // Which days does this product appear in the same slot?
  const activeDays = editMode
    ? DAYS.filter(d => (routine[d]?.[slot] || []).some(s => s.product === step.product))
    : []

  return (
    <div
      className={[
        'rev-step',
        editMode    ? 'rev-step--edit'     : '',
        isDragOver  ? 'rev-step--dragover' : '',
      ].filter(Boolean).join(' ')}
      onDragOver={editMode ? (e) => { e.preventDefault(); onDragOver() } : undefined}
      onDrop={editMode ? (e) => { e.preventDefault(); onDrop() } : undefined}
      onDragEnd={editMode ? onDragEnd : undefined}
    >
      {editMode && (
        <div
          className="rev-drag-handle"
          draggable={true}
          onDragStart={(e) => { e.stopPropagation(); onDragStart() }}
          title="Drag to reorder"
        >
          ⠿
        </div>
      )}

      <div className="rev-step-body">
        <div className="rev-step-top">
          <span className="rev-product">{step.product}</span>
          <span
            className="rev-cat"
            style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text }}
          >
            {step.category}
          </span>
          {editMode && (
            <button
              type="button"
              className="rev-delete-btn"
              onClick={() => onDelete(day, slot, index)}
              title="Remove step"
            >
              ×
            </button>
          )}
        </div>

        {step.notes && <div className="rev-notes">{step.notes}</div>}

        {editMode && (
          <div className="rev-day-chips">
            {DAYS.map(d => {
              const on = activeDays.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  className={`rev-day-chip${on ? ' rev-day-chip--on' : ''}`}
                  onClick={() => onToggleDay(step, slot, d, on)}
                  title={`${on ? 'Remove from' : 'Add to'} ${DAY_LABELS[d]}`}
                >
                  {DAY_SHORT[d]}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slot (AM or PM column) ────────────────────────────────────────
function Slot({
  day, slot, labelText, labelClass, steps, editMode, routine,
  addingIn, onSetAdding, onAddStep, onDeleteStep, onToggleDay,
  dragOver, onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const isAddingHere = addingIn?.day === day && addingIn?.slot === slot

  return (
    <div className="rev-col">
      <div className={`rev-col-label ${labelClass}`}>{labelText}</div>

      {steps.length > 0
        ? steps.map((s, i) => (
            <Step
              key={`${s.product}-${i}`}
              step={s}
              editMode={editMode}
              day={day}
              slot={slot}
              index={i}
              routine={routine}
              isDragOver={
                dragOver?.day === day &&
                dragOver?.slot === slot &&
                dragOver?.index === i
              }
              onDelete={onDeleteStep}
              onToggleDay={onToggleDay}
              onDragStart={() => onDragStart(day, slot, i)}
              onDragOver={() => onDragOver(day, slot, i)}
              onDrop={() => onDrop(day, slot, i)}
              onDragEnd={onDragEnd}
            />
          ))
        : <div className="rev-empty">No steps</div>
      }

      {editMode && isAddingHere && (
        <AddForm
          onAdd={(step) => { onAddStep(day, slot, step); onSetAdding(null) }}
          onCancel={() => onSetAdding(null)}
        />
      )}

      {editMode && !isAddingHere && (
        <button
          type="button"
          className="rev-add-trigger"
          onClick={() => onSetAdding({ day, slot })}
        >
          + Add step
        </button>
      )}
    </div>
  )
}

// ── DaySection ───────────────────────────────────────────────────
function DaySection(props) {
  const { day, routine, editMode } = props
  const isWeekend = day === 'saturday' || day === 'sunday'
  const amSteps = routine[day]?.am || []
  const pmSteps = routine[day]?.pm || []

  return (
    <div className="rev-day">
      <div className="rev-day-header">
        <span className="rev-day-name">{DAY_LABELS[day]}</span>
        {isWeekend && <span className="rev-weekend-badge">Weekend</span>}
      </div>
      <div className="rev-columns">
        <Slot {...props} slot="am" labelText="☀ AM" labelClass="rev-col-label--am" steps={amSteps} />
        <div className="rev-col-divider" />
        <Slot {...props} slot="pm" labelText="☽ PM" labelClass="rev-col-label--pm" steps={pmSteps} />
      </div>
    </div>
  )
}

// ── Review ───────────────────────────────────────────────────────
export default function Review() {
  const navigate = useNavigate()

  const [routine, setRoutine] = useState(() => {
    const raw = localStorage.getItem('routine')
    return raw ? JSON.parse(raw) : null
  })

  const checklists = (() => {
    try {
      const ob = JSON.parse(localStorage.getItem('onboarding') || '{}')
      return buildChecklists(ob.products || '')
    } catch { return null }
  })()
  const [editMode, setEditMode]   = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [addingIn, setAddingIn]   = useState(null) // { day, slot } | null
  const [dragOver, setDragOver]   = useState(null) // { day, slot, index } | null
  const dragSrc = useRef(null)                      // { day, slot, index }

  // ── Mutations ──────────────────────────────────────────────────
  function updateSlot(day, slot, newSteps) {
    setRoutine(r => ({ ...r, [day]: { ...r[day], [slot]: newSteps } }))
  }

  function deleteStep(day, slot, index) {
    updateSlot(day, slot, (routine[day]?.[slot] || []).filter((_, i) => i !== index))
  }

  function addStep(day, slot, step) {
    updateSlot(day, slot, [...(routine[day]?.[slot] || []), step])
  }

  function toggleDay(step, slot, targetDay, isActive) {
    if (isActive) {
      updateSlot(targetDay, slot,
        (routine[targetDay]?.[slot] || []).filter(s => s.product !== step.product))
    } else {
      updateSlot(targetDay, slot,
        [...(routine[targetDay]?.[slot] || []), { ...step }])
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────
  function handleDragStart(day, slot, index) {
    dragSrc.current = { day, slot, index }
  }

  function handleDragOver(day, slot, index) {
    setDragOver({ day, slot, index })
  }

  function handleDrop(targetDay, targetSlot, targetIndex) {
    const src = dragSrc.current
    setDragOver(null)
    dragSrc.current = null
    if (!src || src.day !== targetDay || src.slot !== targetSlot) return
    if (src.index === targetIndex) return
    const steps = [...(routine[targetDay]?.[targetSlot] || [])]
    const [moved] = steps.splice(src.index, 1)
    steps.splice(src.index < targetIndex ? targetIndex - 1 : targetIndex, 0, moved)
    updateSlot(targetDay, targetSlot, steps)
  }

  function handleDragEnd() {
    setDragOver(null)
    dragSrc.current = null
  }

  // ── Confirm ────────────────────────────────────────────────────
  function confirm() {
    localStorage.setItem('routine', JSON.stringify(routine))
    setShowSupport(true)
  }

  function goToTracker() {
    navigate('/tracker')
  }

  // ── Empty state ────────────────────────────────────────────────
  if (!routine) {
    return (
      <>
        <style>{styles}</style>
        <div className="rev-root">
          <div className="rev-empty-state">
            <div className="rev-empty-icon">◈</div>
            <div className="rev-empty-title">No routine found</div>
            <p className="rev-empty-body">Head back to generate your routine first.</p>
            <button className="rev-cta-btn" onClick={() => navigate('/onboarding')}>
              Start over
            </button>
          </div>
        </div>
      </>
    )
  }

  const missing = getMissing(routine)
  const totalSteps = DAYS.reduce((acc, d) => {
    return acc + (routine[d]?.am?.length || 0) + (routine[d]?.pm?.length || 0)
  }, 0)

  const sharedSlotProps = {
    routine, editMode, addingIn,
    onSetAdding: setAddingIn,
    onAddStep: addStep,
    onDeleteStep: deleteStep,
    onToggleDay: toggleDay,
    dragOver,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rev-root">

        {/* ── Header ── */}
        <header className="rev-header">
          <a href="/" className="rev-logo">trackmyskin</a>
          <span className="rev-meta-chip">{totalSteps} steps · 7 days</span>
        </header>

        {/* ── Hero ── */}
        <div className="rev-hero">
          <h1 className="rev-title">Your personalised routine</h1>
          <p className="rev-subtitle">
            Review each day before you start tracking. Steps are ordered and timed for your skin.
          </p>
        </div>

        <div className="rev-content">

          {/* ── Product checklists ── */}
          {checklists && (
            <div className="rev-checklist-card">
              <div className="rev-checklist-section">
                <div className="rev-checklist-title">Your routine essentials</div>
                {checklists.required.map(({ label, found }) => (
                  <div key={label} className={`rev-check-row ${found ? 'rev-check-row--ok' : 'rev-check-row--warn'}`}>
                    <span className="rev-check-icon">{found ? '✅' : '⚠️'}</span>
                    <span className="rev-check-text">
                      {found
                        ? `You have a ${label}`
                        : `Missing: ${label} — essential for every routine`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rev-checklist-divider" />
              <div className="rev-checklist-section">
                <div className="rev-checklist-title">Recommended additions</div>
                {checklists.recommended.map(({ label, found }) => (
                  <div key={label} className={`rev-check-row ${found ? 'rev-check-row--ok' : 'rev-check-row--soft'}`}>
                    <span className="rev-check-icon">{found ? '✅' : '○'}</span>
                    <span className="rev-check-text">
                      {found
                        ? label
                        : `${label} — not in your current routine, optional but beneficial`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Missing essentials banners ── */}
          {missing.map(key => (
            <div key={key} className="rev-banner rev-banner--warn">
              <div className="rev-banner-text">{MISSING_WARNINGS[key]}</div>
            </div>
          ))}

          {/* ── Edit mode hint ── */}
          {editMode && (
            <div className="rev-banner rev-banner--edit">
              <span className="rev-banner-icon">✦</span>
              <div className="rev-banner-text">
                <strong>Edit mode — </strong>
                drag ⠿ to reorder · tap day chips to reschedule · + Add step to insert new steps
              </div>
            </div>
          )}

          {/* ── Day cards ── */}
          {DAYS.map(day => (
            <DaySection key={day} day={day} {...sharedSlotProps} />
          ))}
        </div>

        {/* ── Support modal ── */}
        {showSupport && (
          <div className="rev-overlay" onClick={goToTracker}>
            <div className="rev-modal" onClick={e => e.stopPropagation()}>
              <div className="rev-modal-icon">☕</div>
              <h2 className="rev-modal-title">trackmyskin is free,<br />and always will be.</h2>
              <p className="rev-modal-body">
                If it's helped your skin, consider buying me a coffee — whatever you can.
                No pressure at all.
              </p>
              <a
                className="rev-modal-support"
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Support the project ☕
              </a>
              <button className="rev-modal-skip" onClick={goToTracker}>
                No thanks, take me to my routine →
              </button>
            </div>
          </div>
        )}

        {/* ── Footer CTAs ── */}
        <div className="rev-footer">
          <button className="rev-cta-btn" onClick={confirm}>
            Looks good — start tracking
          </button>
          <button
            className="rev-edit-btn"
            onClick={() => { setEditMode(m => !m); setAddingIn(null) }}
          >
            {editMode ? 'Done editing' : 'Make changes'}
          </button>
          <button className="rev-regen-btn" onClick={() => navigate('/onboarding')}>
            Regenerate
          </button>
        </div>

      </div>
    </>
  )
}

// ── Styles ───────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rev-root {
    min-height: 100vh;
    background: ${C.bg};
    font-family: 'Inter', sans-serif;
    color: ${C.text};
  }

  /* ── Header ── */
  .rev-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid ${C.borderLight};
    background: ${C.bg};
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .rev-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.1875rem;
    font-weight: 600;
    color: ${C.text};
    text-decoration: none;
  }

  .rev-meta-chip {
    font-size: 0.8125rem;
    font-weight: 500;
    color: ${C.muted};
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 20px;
    padding: 4px 12px;
  }

  /* ── Hero ── */
  .rev-hero {
    max-width: 720px;
    margin: 0 auto;
    padding: 44px 32px 28px;
    text-align: center;
  }

  .rev-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 600;
    line-height: 1.2;
    color: ${C.text};
    margin-bottom: 12px;
  }

  .rev-subtitle {
    font-size: 1rem;
    color: ${C.muted};
    line-height: 1.6;
  }

  /* ── Content wrapper ── */
  .rev-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Banners ── */
  .rev-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .rev-banner--warn {
    background: ${C.warnBg};
    border: 1px solid ${C.warnBorder};
    color: ${C.warn};
  }
  .rev-banner--warn strong { color: ${C.text}; }

  .rev-banner--edit {
    background: ${C.accentBg};
    border: 1px solid ${C.accentBorder};
    color: ${C.muted};
  }
  .rev-banner--edit strong { color: ${C.text}; }

  .rev-banner-icon {
    flex-shrink: 0;
    font-size: 1rem;
    margin-top: 2px;
  }
  .rev-banner--edit .rev-banner-icon { color: ${C.accent}; }

  .rev-banner-text { flex: 1; }

  /* ── Checklist card ── */
  .rev-checklist-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 16px;
    overflow: hidden;
  }

  .rev-checklist-section {
    padding: 18px 20px;
  }

  .rev-checklist-divider {
    height: 1px;
    background: ${C.borderLight};
  }

  .rev-checklist-title {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${C.faint};
    margin-bottom: 12px;
  }

  .rev-check-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 5px 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .rev-check-icon {
    flex-shrink: 0;
    font-size: 0.875rem;
    width: 18px;
    text-align: center;
  }

  .rev-check-row--ok   .rev-check-text { color: ${C.text}; font-weight: 500; }
  .rev-check-row--warn .rev-check-text { color: ${C.warn}; font-weight: 500; }
  .rev-check-row--soft .rev-check-text { color: ${C.muted}; }

  /* ── Day card ── */
  .rev-day {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 16px;
    overflow: hidden;
  }

  .rev-day-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: ${C.surface};
    border-bottom: 1px solid ${C.border};
  }

  .rev-day-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.0625rem;
    font-weight: 600;
    color: ${C.text};
  }

  .rev-weekend-badge {
    font-size: 0.75rem;
    font-weight: 500;
    color: ${C.accent};
    background: ${C.accentBg};
    border: 1px solid ${C.accentBorder};
    border-radius: 20px;
    padding: 2px 8px;
  }

  /* ── AM / PM columns ── */
  .rev-columns {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    min-height: 72px;
  }

  .rev-col {
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rev-col-divider {
    background: ${C.borderLight};
    align-self: stretch;
  }

  .rev-col-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .rev-col-label--am { color: ${C.accent}; }
  .rev-col-label--pm { color: #5548c8; }

  /* ── Step (view mode) ── */
  .rev-step {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rev-step-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rev-step-top {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rev-product {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${C.text};
    line-height: 1.3;
    flex: 1;
    min-width: 0;
  }

  .rev-cat {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    border-radius: 20px;
    padding: 2px 8px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .rev-notes {
    font-size: 0.8125rem;
    color: ${C.muted};
    line-height: 1.4;
  }

  .rev-empty {
    font-size: 0.8125rem;
    color: ${C.faint};
    font-style: italic;
  }

  /* ── Step (edit mode) ── */
  .rev-step--edit {
    flex-direction: row;
    align-items: flex-start;
    gap: 6px;
    padding: 7px 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: background 0.12s, border-color 0.12s;
  }
  .rev-step--edit:hover {
    background: ${C.surface};
    border-color: ${C.borderLight};
  }
  .rev-step--dragover {
    background: ${C.accentBg} !important;
    border-color: ${C.accentBorder} !important;
    border-style: dashed !important;
  }

  /* ── Drag handle ── */
  .rev-drag-handle {
    cursor: grab;
    color: ${C.faint};
    font-size: 1rem;
    padding: 2px 2px;
    user-select: none;
    flex-shrink: 0;
    margin-top: 2px;
    line-height: 1;
    transition: color 0.12s;
  }
  .rev-drag-handle:hover { color: ${C.muted}; }
  .rev-drag-handle:active { cursor: grabbing; }

  /* ── Delete button ── */
  .rev-delete-btn {
    background: none;
    border: none;
    color: ${C.faint};
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
    transition: color 0.12s;
  }
  .rev-delete-btn:hover { color: #c0392b; }

  /* ── Day chips ── */
  .rev-day-chips {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 5px;
  }

  .rev-day-chip {
    padding: 2px 7px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    font-family: 'Inter', sans-serif;
    border-radius: 20px;
    border: 1px solid ${C.border};
    background: transparent;
    color: ${C.faint};
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s;
  }
  .rev-day-chip:hover {
    border-color: ${C.accent};
    color: ${C.accent};
  }
  .rev-day-chip--on {
    background: ${C.accentBg};
    border-color: ${C.accentBorder};
    color: ${C.accent};
  }

  /* ── Add form ── */
  .rev-add-form {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 12px;
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 10px;
    margin-top: 2px;
  }

  .rev-field {
    width: 100%;
    padding: 8px 11px;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: ${C.text};
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 8px;
    outline: none;
    appearance: none;
    transition: border-color 0.12s;
  }
  .rev-field::placeholder { color: ${C.faint}; }
  .rev-field:focus { border-color: ${C.accent}; }

  .rev-add-actions {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }

  .rev-add-submit {
    padding: 7px 16px;
    background: ${C.cta};
    color: ${C.ctaText};
    border: none;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.12s;
  }
  .rev-add-submit:disabled { opacity: 0.45; cursor: not-allowed; }
  .rev-add-submit:not(:disabled):hover { opacity: 0.82; }

  .rev-add-cancel {
    padding: 7px 14px;
    background: transparent;
    border: 1px solid ${C.border};
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: ${C.muted};
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
  }
  .rev-add-cancel:hover { border-color: ${C.muted}; color: ${C.text}; }

  /* ── Add trigger ── */
  .rev-add-trigger {
    background: transparent;
    border: 1px dashed ${C.border};
    border-radius: 8px;
    padding: 7px 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: ${C.muted};
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
    margin-top: 2px;
  }
  .rev-add-trigger:hover {
    border-color: ${C.accent};
    color: ${C.accent};
    background: ${C.accentBg};
  }

  /* ── Footer ── */
  .rev-footer {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px 24px 52px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .rev-cta-btn {
    width: 100%;
    max-width: 400px;
    padding: 15px 28px;
    background: ${C.cta};
    color: ${C.ctaText};
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .rev-cta-btn:hover { opacity: 0.84; }

  .rev-edit-btn {
    width: 100%;
    max-width: 400px;
    padding: 13px 28px;
    background: transparent;
    color: ${C.text};
    border: 1.5px solid ${C.border};
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .rev-edit-btn:hover {
    border-color: ${C.accent};
    background: ${C.accentBg};
  }

  .rev-regen-btn {
    background: none;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${C.muted};
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s;
  }
  .rev-regen-btn:hover { color: ${C.text}; }

  /* ── Empty state ── */
  .rev-empty-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
    gap: 10px;
  }

  .rev-empty-icon {
    font-size: 2.5rem;
    color: ${C.faint};
    margin-bottom: 4px;
  }

  .rev-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: ${C.text};
  }

  .rev-empty-body {
    font-size: 0.9375rem;
    color: ${C.muted};
    margin-bottom: 10px;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .rev-header  { padding: 16px 20px; }
    .rev-hero    { padding: 36px 20px 24px; }
    .rev-content { padding: 0 14px 32px; gap: 12px; }
    .rev-footer  { padding: 12px 14px 44px; }

    .rev-columns {
      grid-template-columns: 1fr;
    }
    .rev-col-divider {
      height: 1px;
      width: auto;
    }
    .rev-col:first-child {
      border-bottom: 1px solid ${C.borderLight};
    }
  }

  /* ── Support modal ── */
  .rev-overlay {
    position: fixed;
    inset: 0;
    background: rgba(45, 31, 23, 0.45);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: rev-fadein 0.2s ease;
  }

  @keyframes rev-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .rev-modal {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 24px;
    padding: 44px 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 80px rgba(45,31,23,0.18);
    animation: rev-slideup 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes rev-slideup {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .rev-modal-icon {
    font-size: 2.25rem;
    margin-bottom: 16px;
    display: block;
  }

  .rev-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.25;
    color: ${C.text};
    margin-bottom: 14px;
  }

  .rev-modal-body {
    font-size: 0.9375rem;
    color: ${C.muted};
    line-height: 1.65;
    margin-bottom: 28px;
  }

  .rev-modal-support {
    display: block;
    width: 100%;
    padding: 14px 24px;
    background: ${C.accent};
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-bottom: 12px;
  }
  .rev-modal-support:hover { opacity: 0.88; }

  .rev-modal-skip {
    background: none;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${C.muted};
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s;
  }
  .rev-modal-skip:hover { color: ${C.text}; }

  @media (max-width: 480px) {
    .rev-modal { padding: 36px 28px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .rev-step--edit, .rev-cta-btn, .rev-edit-btn,
    .rev-regen-btn, .rev-add-trigger, .rev-day-chip {
      transition: none !important;
    }
    .rev-overlay, .rev-modal { animation: none !important; }
  }
`
