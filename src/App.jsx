import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStreak } from "./hooks/useStreak";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const affirmations = {
  Monday: "New week, fresh start. You're building something with every step.",
  Tuesday: "Texture day. Smooth skin, smooth energy. Keep showing up.",
  Wednesday: "Midweek glow-up. You're already ahead of most people just by being consistent.",
  Thursday: "Rest is productive. Your skin is recovering and so are you.",
  Friday: "End the week strong. You look good and you know it.",
  Saturday: "Weekend reset. Take your time with it today — you've earned it.",
  Sunday: "You did the whole week. That discipline is rare. Respect the process.",
};

const CAT_TO_STEP = {
  cleanser:    "Cleanse",
  exfoliant:   "Exfoliate",
  serum:       "Serum",
  "eye-cream": "Eye Cream",
  moisturiser: "Moisturizer",
  sunscreen:   "Sunscreen",
  treatment:   "Treatment",
  toner:       "Toner",
  oil:         "Oil",
  mask:        "Mask",
};

function loadRoutine() {
  const raw = localStorage.getItem("routine");
  if (!raw) return null;
  const stored = JSON.parse(raw);
  const result = {};
  for (const [lowDay, data] of Object.entries(stored)) {
    const day = lowDay.charAt(0).toUpperCase() + lowDay.slice(1);
    const mapStep = (s) => ({
      step: CAT_TO_STEP[s.category] ?? (s.category.charAt(0).toUpperCase() + s.category.slice(1)),
      product: s.product,
      notes: s.notes || "",
    });
    result[day] = {
      am: (data.am || []).map(mapStep),
      pm: (data.pm || []).map(mapStep),
      tags: [],
    };
  }
  return result;
}

const tagColors = {
  "Retinoid Night": { bg: "#3b1f5e", text: "#d4b5ff" },
  "Exfoliation Day": { bg: "#1a3a2a", text: "#7ddeaa" },
  "Rest Night": { bg: "#3a2a1a", text: "#deb87d" },
};


const stepIcons = {
  Cleanse: "🧴", Exfoliate: "🧼", Serum: "🍊",
  "Eye Cream": "👁️", Moisturizer: "💧", Sunscreen: "☀️", Treatment: "💊",
};

// ---- Icon components ----

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function AutoIcon() {
  // Half-filled circle representing "follows system"
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.25"/>
      <path d="M12 2a10 10 0 010 20V2z" fill="currentColor"/>
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  );
}

function CompressIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

// Light theme CSS variable values — interpolated into css for both [data-theme="light"]
// and the auto media query, so they're only written once.
const LIGHT_VARS = `
    --bg: #f5f0eb;
    --bg-alt: #ede8e2;
    --card: #ffffff;
    --card-hover: #f8f3ee;
    --card-today: #fdf9f6;
    --icon-bg: #ede8e0;
    --text: #2d1f17;
    --text-strong: #1a100a;
    --muted: #7a6555;
    --text-dim: #5a4535;
    --text-faint: #9a8070;
    --text-step: #8a7060;
    --text-divider: #b09080;
    --text-footer: #c0a898;
    --border: #e5d4c5;
    --border-inner: #ede0d4;
    --border-active: #d4b5a0;
    --border-check: #d4c0b0;
    --am-bg: #e4f0df;
    --am: #3a7a30;
    --am-dark: #2a6020;
    --pm-bg: #ede3f5;
    --pm: #7a3a9a;
    --pm-dark: #6a2a8a;
    --streak-active-bg: #fdf3e0;
    --streak-active-border: #e0c880;
    --streak-active-text: #7a5a10;
    --streak-broken-bg: #fde8e8;
    --streak-broken-border: #e0a0a0;
    --streak-broken-text: #8a3a3a;
    --streak-zero-bg: #f0eceb;
    --streak-zero-border: #ddd0c8;
    --streak-zero-text: #8a7870;
    --marker: #8a4aaa;
    --marker-glow-0: rgba(138, 74, 170, 0.35);
    --marker-glow-1: rgba(138, 74, 170, 0);
    --glow: rgba(120, 80, 160, 0.08);
    --check-bg: #d0eac8;
    --check-border: #4a8a40;
    --check-icon: #2a6a20;
    --ctrl-btn-bg: rgba(0, 0, 0, 0.06);
    --ctrl-btn-hover: rgba(0, 0, 0, 0.12);
    --ctrl-btn-color: #5a4535;
`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');

  /* ---- CUSTOM PROPERTIES: DARK (default) ---- */
  :root {
    --bg: #0b0b0d;
    --bg-alt: #0f0f12;
    --card: #121215;
    --card-hover: #141418;
    --card-today: #111115;
    --icon-bg: #18181b;
    --text: #e8e4df;
    --text-strong: #f5f0ea;
    --muted: #a09a92;
    --text-dim: #d4d0ca;
    --text-faint: #6a6560;
    --text-step: #5a5650;
    --text-divider: #4a4640;
    --text-footer: #3a3630;
    --border: #1e1e22;
    --border-inner: #1a1a1e;
    --border-active: #3a3a40;
    --border-check: #2e2e34;
    --am-bg: #1a2e1a;
    --am: #a8d89a;
    --am-dark: #5a8a4e;
    --pm-bg: #2a1a2e;
    --pm: #c89ad8;
    --pm-dark: #7a4e8a;
    --streak-active-bg: #1f1a10;
    --streak-active-border: #3a2e12;
    --streak-active-text: #c8a84a;
    --streak-broken-bg: #1a1010;
    --streak-broken-border: #2e1a1a;
    --streak-broken-text: #8a5a5a;
    --streak-zero-bg: #141418;
    --streak-zero-border: #22222a;
    --streak-zero-text: #4a4a54;
    --marker: #d4b5ff;
    --marker-glow-0: rgba(212, 181, 255, 0.4);
    --marker-glow-1: rgba(212, 181, 255, 0);
    --glow: rgba(200, 154, 216, 0.06);
    --check-bg: #2a3a2a;
    --check-border: #4a7a4a;
    --check-icon: #6aaa6a;
    --ctrl-btn-bg: rgba(255, 255, 255, 0.07);
    --ctrl-btn-hover: rgba(255, 255, 255, 0.12);
    --ctrl-btn-color: #a09a92;
  }

  /* ---- LIGHT THEME ---- */
  [data-theme="light"] {
    ${LIGHT_VARS}
  }

  /* ---- AUTO THEME: follows system preference ---- */
  @media (prefers-color-scheme: light) {
    [data-theme="auto"] {
      ${LIGHT_VARS}
    }
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    transition: background 0.25s, color 0.25s;
  }

  .page { max-width: 900px; margin: 0 auto; padding: 32px 20px 64px; }

  /* ---- CONTROLS BAR ---- */
  .ctrl-bar {
    position: fixed;
    top: 16px;
    right: 20px;
    z-index: 900;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ctrl-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--ctrl-btn-bg);
    color: var(--ctrl-btn-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }

  .ctrl-btn:hover {
    background: var(--ctrl-btn-hover);
    color: var(--text);
  }

  /* ---- TODAY HERO ---- */
  .hero { margin-bottom: 56px; }

  .hero-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .hero-day {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: var(--text-strong);
    letter-spacing: -0.5px;
  }

  .hero-time {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-faint);
    letter-spacing: 1px;
  }

  .hero-period-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .badge-am { background: var(--am-bg); color: var(--am); }
  .badge-pm { background: var(--pm-bg); color: var(--pm); }

  .hero-affirmation {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    font-weight: 500;
    color: var(--muted);
    line-height: 1.55;
    margin-bottom: 28px;
    max-width: 600px;
  }

  .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }

  .tag {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ---- TWO-COL AM/PM ---- */
  .today-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 600px) {
    .today-grid { grid-template-columns: 1fr; }
  }

  .col {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .col::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }

  .col-am::before { background: linear-gradient(90deg, var(--am), var(--am-dark)); }
  .col-pm::before { background: linear-gradient(90deg, var(--pm), var(--pm-dark)); }

  .col-active {
    border-color: var(--border-active);
    box-shadow: 0 0 40px var(--glow);
  }

  .col-header {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .col-am .col-header { color: var(--am); }
  .col-pm .col-header { color: var(--pm); }

  .step-row {
    display: flex;
    gap: 12px;
    padding: 11px 0;
    border-bottom: 1px solid var(--border-inner);
    align-items: flex-start;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s;
  }

  .step-row:last-child { border-bottom: none; }
  .step-row:hover { opacity: 0.8; }

  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--icon-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .step-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-step);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 2px;
  }

  .step-product {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    line-height: 1.35;
  }

  /* ---- DIVIDER ---- */
  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 56px 0 40px;
  }

  .divider-line { flex: 1; height: 1px; background: var(--border); }

  .divider-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-divider);
  }

  /* ---- WEEKLY GRID ---- */
  .week-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .week-day {
    background: var(--bg-alt);
    border: 1px solid var(--border-inner);
    border-radius: 14px;
    overflow: hidden;
  }

  .week-day-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-inner);
    cursor: pointer;
    transition: background 0.2s;
  }

  .week-day-header:hover { background: var(--card-hover); }

  .week-day-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-strong);
  }

  .week-day-tags { display: flex; gap: 6px; flex-wrap: wrap; }

  .week-day-affirmation {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 14px;
    color: var(--text-faint);
    padding: 0 20px 14px;
    line-height: 1.5;
  }

  .week-day-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }

  @media (max-width: 600px) {
    .week-day-body { grid-template-columns: 1fr; }
  }

  .week-col { padding: 16px 20px; }

  .week-col:first-child { border-right: 1px solid var(--border-inner); }

  @media (max-width: 600px) {
    .week-col:first-child {
      border-right: none;
      border-bottom: 1px solid var(--border-inner);
    }
  }

  .week-col-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .week-col-am .week-col-label { color: var(--am); }
  .week-col-pm .week-col-label { color: var(--pm); }

  .week-step {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    align-items: center;
  }

  .week-step-icon {
    font-size: 14px;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: var(--icon-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .week-step-product {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.3;
  }

  .today-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--marker);
    display: inline-block;
    margin-left: 10px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--marker-glow-0); }
    50%       { opacity: 0.7; box-shadow: 0 0 0 6px var(--marker-glow-1); }
  }

  .footer-note {
    text-align: center;
    font-size: 11px;
    color: var(--text-footer);
    margin-top: 48px;
    line-height: 1.6;
  }

  /* ---- STREAK BANNER ---- */
  .streak-banner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    margin-bottom: 20px;
  }

  .streak-active {
    background: var(--streak-active-bg);
    border: 1px solid var(--streak-active-border);
    color: var(--streak-active-text);
  }

  .streak-broken {
    background: var(--streak-broken-bg);
    border: 1px solid var(--streak-broken-border);
    color: var(--streak-broken-text);
  }

  .streak-zero {
    background: var(--streak-zero-bg);
    border: 1px solid var(--streak-zero-border);
    color: var(--streak-zero-text);
  }

  /* ---- STEP CHECK ---- */
  .step-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid var(--border-check);
    flex-shrink: 0;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }

  .step-check--done {
    background: var(--check-bg);
    border-color: var(--check-border);
  }

  /* ---- STEP NOTES ---- */
  .step-notes-hint {
    font-size: 9px;
    color: var(--text-faint);
    margin-left: 2px;
  }

  .step-notes {
    font-size: 11px;
    color: var(--text-faint);
    font-style: italic;
    margin-top: 4px;
    line-height: 1.4;
  }

  /* ---- SKIP BUTTON ---- */
  .skip-btn {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: var(--text-faint);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .step-row:hover .skip-btn { opacity: 1; }
  .skip-btn:hover { color: var(--text); }

  @media (max-width: 600px) {
    .skip-btn { opacity: 0.6; }
  }

  .step-check--skipped {
    background: var(--border);
    border-color: var(--text-faint);
  }

  /* ---- FULL DAY CELEBRATION ---- */
  .day-complete {
    text-align: center;
    padding: 40px 20px 24px;
  }

  .day-complete-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .day-complete-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-strong);
    margin-bottom: 6px;
  }

  .day-complete-sub {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 24px;
  }

  /* ---- TOMORROW PREVIEW ---- */
  .tomorrow-preview {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    max-width: 500px;
    margin: 0 auto;
    text-align: left;
  }

  .tomorrow-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 14px;
  }

  .tomorrow-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 600px) {
    .tomorrow-cols { grid-template-columns: 1fr; }
  }

  .tomorrow-col-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .tomorrow-col-am .tomorrow-col-label { color: var(--am); }
  .tomorrow-col-pm .tomorrow-col-label { color: var(--pm); }

  .tomorrow-step {
    font-size: 12px;
    color: var(--muted);
    padding: 3px 0;
  }

  /* ---- PROGRESS BAR ---- */
  .progress-bar-wrap {
    margin-top: 8px;
    margin-bottom: 14px;
  }

  .progress-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.3px;
    margin-bottom: 5px;
  }

  .progress-track {
    height: 3px;
    border-radius: 2px;
    background: var(--border);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .col-am .progress-fill { background: var(--am); }
  .col-pm .progress-fill { background: var(--pm); }

  /* ---- ALL DONE STATE ---- */
  .all-done {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px 16px;
    text-align: center;
    gap: 8px;
  }

  .all-done-icon { font-size: 28px; }

  .all-done-text {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-strong);
  }

  .all-done-sub {
    font-size: 12px;
    color: var(--muted);
  }

  /* ---- RESET BUTTON ---- */
  .reset-btn {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--text-faint);
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 12px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    margin-top: 6px;
  }

  .reset-btn:hover {
    color: var(--text);
    border-color: var(--border-active);
  }

  /* ---- HEATMAP ---- */
  .heatmap {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .heatmap-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .heatmap-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .heatmap-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1.5px solid var(--border-check);
    background: transparent;
    transition: background 0.2s, border-color 0.2s;
  }

  .heatmap-dot--done {
    background: var(--check-bg);
    border-color: var(--check-border);
  }

  .heatmap-dot--today {
    border-color: var(--marker);
    box-shadow: 0 0 0 2px var(--marker-glow-0);
  }

  /* ---- COLLAPSIBLE WEEK DAY ---- */
  .week-day-toggle {
    font-size: 14px;
    color: var(--text-faint);
    transition: transform 0.2s;
    margin-left: 8px;
  }

  .week-day-toggle--open {
    transform: rotate(90deg);
  }

  /* ---- FADE IN ---- */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeUp 0.5s ease-out both; }
  .fade-d1 { animation-delay: 0.05s; }
  .fade-d2 { animation-delay: 0.12s; }
  .fade-d3 { animation-delay: 0.2s; }
  .fade-d4 { animation-delay: 0.28s; }



`;

function StepRow({ item, isChecked, isSkipped, onToggle, onSkip }) {
  const [showNotes, setShowNotes] = useState(false);
  const hasNotes = !!item.notes;
  const isDone = isChecked || isSkipped;

  return (
    <div
      className="step-row"
      style={isDone ? { opacity: 0.55 } : undefined}
    >
      <div className="step-icon">{stepIcons[item.step] || "•"}</div>
      <div
        style={{ flex: 1, cursor: hasNotes ? "pointer" : "default" }}
        onClick={() => hasNotes && setShowNotes((v) => !v)}
      >
        <div className="step-label">
          {item.step}
          {hasNotes && <span className="step-notes-hint">{showNotes ? " ▾" : " ▸"}</span>}
        </div>
        <div
          className="step-product"
          style={
            isChecked
              ? { textDecoration: "line-through", textDecorationColor: "var(--check-border)", color: "var(--check-icon)" }
              : isSkipped
              ? { textDecoration: "line-through" }
              : undefined
          }
        >
          {item.product}
        </div>
        {showNotes && hasNotes && (
          <div className="step-notes">{item.notes}</div>
        )}
      </div>
      {!isDone && (
        <button className="skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>skip</button>
      )}
      <div
        className={`step-check${isChecked ? " step-check--done" : ""}${isSkipped ? " step-check--skipped" : ""}`}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{ cursor: "pointer" }}
      >
        {isChecked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" style={{ color: "var(--check-icon)" }}>
            <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isSkipped && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ color: "var(--text-faint)" }}>
            <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

function WeekStep({ item }) {
  return (
    <div className="week-step">
      <div className="week-step-icon">{stepIcons[item.step] || "•"}</div>
      <div className="week-step-product">{item.product}</div>
    </div>
  );
}

function Tag({ label }) {
  const c = tagColors[label] || { bg: "#222", text: "#aaa" };
  return <span className="tag" style={{ background: c.bg, color: c.text }}>{label}</span>;
}

export default function App() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = saved;
    return saved;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const todayName = DAYS[now.getDay()];
  const hour = now.getHours();
  const isAM = hour < 17;

  const routine = loadRoutine();
  // todayData computed before any conditional return so useStreak is always called
  const todayData = (routine && routine[todayName]) ?? { am: [], pm: [], tags: [] };

  const { checked, skipped, toggleStep, skipStep, resetToday, todayComplete, streak, bestStreak, streakStatus, streakData, todayStr } = useStreak(todayData);
  const [expandedDays, setExpandedDays] = useState({ [todayName]: true });

  function toggleDay(dayName) {
    setExpandedDays(prev => ({ ...prev, [dayName]: !prev[dayName] }));
  }

  // Progress counts for AM/PM (checked + skipped both count)
  const amTotal = todayData.am.length;
  const pmTotal = todayData.pm.length;
  const amDone = todayData.am.filter((_, i) => checked.has(`am-${i}`) || skipped.has(`am-${i}`)).length;
  const pmDone = todayData.pm.filter((_, i) => checked.has(`pm-${i}`) || skipped.has(`pm-${i}`)).length;
  const amComplete = amTotal > 0 && amDone === amTotal;
  const pmComplete = pmTotal > 0 && pmDone === pmTotal;

  // Tomorrow's routine for preview
  const tomorrowIdx = (now.getDay() + 1) % 7;
  const tomorrowName = DAYS[tomorrowIdx];
  const tomorrowData = routine ? routine[tomorrowName] : null;

  // 7-day heatmap data (today + 6 days before)
  const heatmapDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const ds = `${y}-${m}-${day}`;
    const isToday = ds === todayStr;
    heatmapDays.push({
      label: DAY_LABELS[(d.getDay() + 6) % 7], // Mon=0
      dateStr: ds,
      done: isToday ? todayComplete : !!streakData[ds],
      isToday,
    });
  }

  function cycleTheme() {
    setTheme(t => t === "dark" ? "light" : t === "light" ? "auto" : "dark");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  const themeLabel =
    theme === "dark" ? "Switch to light theme" :
    theme === "light" ? "Switch to auto theme" :
    "Switch to dark theme";

  const controls = (
    <div className="ctrl-bar">
      <button className="ctrl-btn" onClick={cycleTheme} title={themeLabel} aria-label={themeLabel}>
        {theme === "dark" ? <MoonIcon /> : theme === "light" ? <SunIcon /> : <AutoIcon />}
      </button>
      <button
        className="ctrl-btn"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
      </button>
      <button
        className="ctrl-btn"
        onClick={() => navigate("/settings")}
        title="Settings"
        aria-label="Settings"
      >
        <GearIcon />
      </button>
    </div>
  );

  if (!routine) {
    return (
      <>
        <style>{css}</style>
        {controls}
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "16px" }}>
          <div style={{ fontSize: 16, color: "var(--muted)" }}>No routine found — go back and create one.</div>
          <a href="/onboarding" style={{ color: "var(--pm)", fontSize: 14, textDecoration: "none" }}>← Create your routine</a>
        </div>
      </>
    );
  }

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      <style>{css}</style>
      {controls}

      <div className="page">
        {/* ===== TODAY HERO ===== */}
        <div className="hero">
          <div className="hero-top fade-in">
            <div className="hero-day">{todayName}</div>
            <div className="hero-time">{timeStr}</div>
          </div>

          <div className="hero-tags fade-in fade-d1">
            <span className={`hero-period-badge ${isAM ? "badge-am" : "badge-pm"}`}>
              {isAM ? "☀️  Morning Routine" : "🌙  Evening Routine"}
            </span>
            {todayData.tags.map((t) => <Tag key={t} label={t} />)}
          </div>

          <div className="hero-affirmation fade-in fade-d2">
            "{affirmations[todayName]}"
          </div>

          <div className="fade-in fade-d2">
            {streakStatus === "active" && (
              <div className="streak-banner streak-active">
                🔥 {streak} day streak{bestStreak > streak ? ` (best: ${bestStreak})` : bestStreak === streak && streak > 1 ? " — personal best!" : ""}
              </div>
            )}
            {streakStatus === "broken" && (
              <div className="streak-banner streak-broken">
                Streak broken — start fresh today{bestStreak > 0 ? ` (best: ${bestStreak})` : ""}
              </div>
            )}
            {streakStatus === "zero" && (
              <div className="streak-banner streak-zero">
                Complete today to start your streak
              </div>
            )}
          </div>

          <div className="heatmap fade-in fade-d2">
            {heatmapDays.map((h) => (
              <div className="heatmap-day" key={h.dateStr}>
                <span className="heatmap-label">{h.label}</span>
                <span className={`heatmap-dot${h.done ? " heatmap-dot--done" : ""}${h.isToday ? " heatmap-dot--today" : ""}`} />
              </div>
            ))}
          </div>

          {todayComplete ? (
            <div className="fade-in fade-d3">
              <div className="day-complete">
                <div className="day-complete-icon">🎉</div>
                <div className="day-complete-title">You're done for the day</div>
                <div className="day-complete-sub">
                  All {amTotal + pmTotal} steps complete — rest up and let your skin do the work.
                </div>
                <button className="reset-btn" onClick={resetToday}>Reset today</button>
              </div>

              {tomorrowData && (
                <div className="tomorrow-preview">
                  <div className="tomorrow-title">Tomorrow — {tomorrowName}</div>
                  <div className="tomorrow-cols">
                    <div className="tomorrow-col-am">
                      <div className="tomorrow-col-label">☀️ Morning</div>
                      {tomorrowData.am.map((item, i) => (
                        <div className="tomorrow-step" key={i}>{item.step} — {item.product}</div>
                      ))}
                    </div>
                    <div className="tomorrow-col-pm">
                      <div className="tomorrow-col-label">🌙 Evening</div>
                      {tomorrowData.pm.map((item, i) => (
                        <div className="tomorrow-step" key={i}>{item.step} — {item.product}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="today-grid fade-in fade-d3">
                {/* AM Column */}
                <div className={`col col-am ${isAM ? "col-active" : ""}`}>
                  <div className="col-header">☀️  Morning{isAM ? " — Now" : ""}</div>
                  {amTotal > 0 && (
                    <div className="progress-bar-wrap">
                      <div className="progress-label">{amDone} / {amTotal} steps</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${(amDone / amTotal) * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {amComplete ? (
                    <div className="all-done">
                      <div className="all-done-icon">✨</div>
                      <div className="all-done-text">Morning done</div>
                      <div className="all-done-sub">All {amTotal} steps complete</div>
                    </div>
                  ) : (
                    todayData.am.map((item, i) => (
                      <StepRow
                        key={i}
                        item={item}
                        isChecked={checked.has(`am-${i}`)}
                        isSkipped={skipped.has(`am-${i}`)}
                        onToggle={() => toggleStep("am", i)}
                        onSkip={() => skipStep("am", i)}
                      />
                    ))
                  )}
                </div>

                {/* PM Column */}
                <div className={`col col-pm ${!isAM ? "col-active" : ""}`}>
                  <div className="col-header">🌙  Evening{!isAM ? " — Now" : ""}</div>
                  {pmTotal > 0 && (
                    <div className="progress-bar-wrap">
                      <div className="progress-label">{pmDone} / {pmTotal} steps</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${(pmDone / pmTotal) * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {pmComplete ? (
                    <div className="all-done">
                      <div className="all-done-icon">🌙</div>
                      <div className="all-done-text">Evening done</div>
                      <div className="all-done-sub">All {pmTotal} steps complete</div>
                    </div>
                  ) : (
                    todayData.pm.map((item, i) => (
                      <StepRow
                        key={i}
                        item={item}
                        isChecked={checked.has(`pm-${i}`)}
                        isSkipped={skipped.has(`pm-${i}`)}
                        onToggle={() => toggleStep("pm", i)}
                        onSkip={() => skipStep("pm", i)}
                      />
                    ))
                  )}
                </div>
              </div>

              {(checked.size > 0 || skipped.size > 0) && (
                <div style={{ textAlign: "center", marginTop: 16 }} className="fade-in">
                  <button className="reset-btn" onClick={resetToday}>Reset today</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== DIVIDER ===== */}
        <div className="divider fade-in fade-d4">
          <div className="divider-line" />
          <div className="divider-text">Full Week</div>
          <div className="divider-line" />
        </div>

        {/* ===== WEEKLY VIEW ===== */}
        <div className="week-grid">
          {DAY_ORDER.map((dayName) => {
            const d = routine[dayName];
            const isToday = dayName === todayName;
            const isOpen = !!expandedDays[dayName];
            return (
              <div
                key={dayName}
                className="week-day"
                style={isToday ? { borderColor: "var(--border-active)", background: "var(--card-today)" } : {}}
              >
                <div className="week-day-header" onClick={() => toggleDay(dayName)}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="week-day-name">{dayName}</span>
                    {isToday && <span className="today-marker" />}
                    <span className={`week-day-toggle${isOpen ? " week-day-toggle--open" : ""}`}>›</span>
                  </div>
                  <div className="week-day-tags">
                    {d.tags.map((t) => <Tag key={t} label={t} />)}
                  </div>
                </div>

                {isOpen && (
                  <>
                    <div className="week-day-affirmation">"{affirmations[dayName]}"</div>

                    <div className="week-day-body">
                      <div className="week-col week-col-am">
                        <div className="week-col-label">☀️  Morning</div>
                        {d.am.map((item, i) => <WeekStep key={i} item={item} />)}
                      </div>
                      <div className="week-col week-col-pm">
                        <div className="week-col-label">🌙  Evening</div>
                        {d.pm.map((item, i) => <WeekStep key={i} item={item} />)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="footer-note">
          If you experience irritation, stop use immediately and consult a healthcare professional.<br />
          Sunscreen every single morning.
        </div>
      </div>
    </>
  );
}
