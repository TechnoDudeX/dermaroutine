import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DAYS_JS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ORDER_LOW = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_ABBR = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const CAT_TO_STEP = {
  cleanser: "Cleanse", exfoliant: "Exfoliate", serum: "Serum",
  "eye-cream": "Eye Cream", moisturiser: "Moisturizer", sunscreen: "Sunscreen",
  treatment: "Treatment", toner: "Toner", oil: "Oil", mask: "Mask", other: "Other",
};
const CATEGORIES = ["cleanser", "exfoliant", "serum", "eye-cream", "moisturiser", "sunscreen", "treatment", "toner", "oil", "mask", "other"];

const stepIcons = {
  Cleanse: "🧴", Exfoliate: "🧼", Serum: "🍊", "Eye Cream": "👁️",
  Moisturizer: "💧", Sunscreen: "☀️", Treatment: "💊",
  Toner: "🪴", Oil: "🫙", Mask: "🎭", Other: "•",
};

const ALL_TAG_COLORS = {
  "Retinoid Night":  { bg: "#3b1f5e", text: "#d4b5ff" },
  "Exfoliation Day": { bg: "#1a3a2a", text: "#7ddeaa" },
  "Rest Night":      { bg: "#3a2a1a", text: "#deb87d" },
  "Mask Night":      { bg: "#1a2a3a", text: "#7ab8de" },
  "Active Night":    { bg: "#3a1a2a", text: "#de7ab8" },
  "Recovery Day":    { bg: "#2a3a1a", text: "#b8de7a" },
};
const ALL_TAGS = Object.keys(ALL_TAG_COLORS);

function initCatalog() {
  try {
    const stored = localStorage.getItem("productCatalog");
    if (stored) return JSON.parse(stored);
    const raw = localStorage.getItem("routine");
    if (!raw) return [];
    const routine = JSON.parse(raw);
    const seen = new Set();
    const result = [];
    for (const day of Object.values(routine)) {
      for (const slot of ["am", "pm"]) {
        for (const item of (day[slot] || [])) {
          if (item.product && !seen.has(item.product)) {
            seen.add(item.product);
            result.push({ product: item.product, category: item.category || "other" });
          }
        }
      }
    }
    localStorage.setItem("productCatalog", JSON.stringify(result));
    return result;
  } catch { return []; }
}

const LIGHT_VARS = `
    --bg:#f5f0eb; --bg-alt:#ede8e2; --card:#ffffff; --card-hover:#f8f3ee;
    --card-today:#fdf9f6; --icon-bg:#ede8e0; --text:#2d1f17; --text-strong:#1a100a;
    --muted:#7a6555; --text-dim:#5a4535; --text-faint:#9a8070; --text-step:#8a7060;
    --text-divider:#b09080; --text-footer:#c0a898; --border:#e5d4c5;
    --border-inner:#ede0d4; --border-active:#d4b5a0; --border-check:#d4c0b0;
    --am-bg:#e4f0df; --am:#3a7a30; --am-dark:#2a6020;
    --pm-bg:#ede3f5; --pm:#7a3a9a; --pm-dark:#6a2a8a;
    --streak-active-bg:#fdf3e0; --streak-active-border:#e0c880; --streak-active-text:#7a5a10;
    --streak-broken-bg:#fde8e8; --streak-broken-border:#e0a0a0; --streak-broken-text:#8a3a3a;
    --marker:#8a4aaa; --glow:rgba(120,80,160,0.08);
    --check-bg:#d0eac8; --check-border:#4a8a40; --check-icon:#2a6a20;
    --ctrl-btn-bg:rgba(0,0,0,0.06); --ctrl-btn-hover:rgba(0,0,0,0.12); --ctrl-btn-color:#5a4535;
`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');

  :root {
    --bg:#0b0b0d; --bg-alt:#0f0f12; --card:#121215; --card-hover:#141418;
    --card-today:#111115; --icon-bg:#18181b; --text:#e8e4df; --text-strong:#f5f0ea;
    --muted:#a09a92; --text-dim:#d4d0ca; --text-faint:#6a6560; --text-step:#5a5650;
    --text-divider:#4a4640; --text-footer:#3a3630; --border:#1e1e22;
    --border-inner:#1a1a1e; --border-active:#3a3a40; --border-check:#2e2e34;
    --am-bg:#1a2e1a; --am:#a8d89a; --am-dark:#5a8a4e;
    --pm-bg:#2a1a2e; --pm:#c89ad8; --pm-dark:#7a4e8a;
    --streak-active-bg:#1f1a10; --streak-active-border:#3a2e12; --streak-active-text:#c8a84a;
    --streak-broken-bg:#1a1010; --streak-broken-border:#2e1a1a; --streak-broken-text:#8a5a5a;
    --marker:#d4b5ff; --glow:rgba(200,154,216,0.06);
    --check-bg:#2a3a2a; --check-border:#4a7a4a; --check-icon:#6aaa6a;
    --ctrl-btn-bg:rgba(255,255,255,0.07); --ctrl-btn-hover:rgba(255,255,255,0.12);
    --ctrl-btn-color:#a09a92;
  }
  [data-theme="light"] { ${LIGHT_VARS} }
  @media (prefers-color-scheme: light) { [data-theme="auto"] { ${LIGHT_VARS} } }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg); color: var(--text);
    font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased;
    transition: background 0.25s, color 0.25s;
  }

  /* ---- PAGE SHELL ---- */
  .sp-root { max-width: 900px; margin: 0 auto; min-height: 100vh; }

  .sp-header {
    position: sticky; top: 0; z-index: 100;
    background: var(--bg); border-bottom: 1px solid var(--border);
    padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;
  }
  .sp-heading {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
    color: var(--text-strong);
  }
  .sp-back {
    padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--ctrl-btn-bg); color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .sp-back:hover { background: var(--ctrl-btn-hover); color: var(--text); }

  .sp-tabs {
    display: flex; gap: 4px; padding: 10px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--bg); position: sticky; top: 53px; z-index: 99;
    overflow-x: auto;
  }
  .sp-tab {
    padding: 7px 14px; border-radius: 8px; border: 1px solid transparent;
    background: transparent; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .sp-tab--active { background: var(--card); border-color: var(--border); color: var(--text); }
  .sp-tab:hover:not(.sp-tab--active) { color: var(--text); background: var(--card-hover); }

  .sp-content { padding: 24px 20px 72px; }

  /* ---- DAY PILLS ---- */
  .sp-day-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
  .sp-day-pill {
    padding: 6px 13px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--card); color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; position: relative;
  }
  .sp-day-pill--active { background: var(--pm-bg); border-color: var(--pm); color: var(--pm); font-weight: 600; }
  .sp-day-pill:hover:not(.sp-day-pill--active) { background: var(--card-hover); color: var(--text); }
  .sp-day-pill--today::after {
    content: ''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%; background: var(--marker);
  }

  /* ---- AM/PM EDIT COLUMNS ---- */
  .sp-day-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px;
  }
  @media (max-width: 640px) { .sp-day-grid { grid-template-columns: 1fr; } }

  .sp-day-col {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
  }
  .sp-col-header {
    padding: 11px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; border-bottom: 1px solid var(--border-inner);
    position: relative;
  }
  .sp-col-header::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  }
  .sp-col-am { color: var(--am); }
  .sp-col-am::before { background: linear-gradient(90deg, var(--am), var(--am-dark)); }
  .sp-col-pm { color: var(--pm); }
  .sp-col-pm::before { background: linear-gradient(90deg, var(--pm), var(--pm-dark)); }

  .sp-step-edit-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-bottom: 1px solid var(--border-inner);
  }
  .sp-step-edit-row:last-of-type { border-bottom: none; }

  .sp-step-icon-sm {
    font-size: 13px; flex-shrink: 0; width: 26px; height: 26px;
    background: var(--icon-bg); border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
  }
  .sp-step-text { flex: 1; min-width: 0; }
  .sp-step-cat {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-step); display: block; margin-bottom: 1px;
  }
  .sp-step-name {
    font-size: 11px; font-weight: 500; color: var(--text-dim);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
  }
  .sp-step-btns { display: flex; gap: 3px; flex-shrink: 0; }

  .sp-icon-btn {
    width: 22px; height: 22px; border: 1px solid var(--border); border-radius: 5px;
    background: transparent; color: var(--muted); cursor: pointer; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.12s; font-family: 'DM Sans', sans-serif; line-height: 1;
  }
  .sp-icon-btn:hover:not(:disabled) { background: var(--card-hover); color: var(--text); }
  .sp-icon-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  .sp-icon-btn--remove:hover:not(:disabled) {
    background: var(--streak-broken-bg); border-color: var(--streak-broken-border);
    color: var(--streak-broken-text);
  }

  .sp-no-steps {
    padding: 12px 14px; font-size: 12px; color: var(--text-step); font-style: italic;
  }

  .sp-add-row {
    display: flex; gap: 6px; padding: 9px 12px; border-top: 1px solid var(--border-inner);
    background: var(--bg-alt);
  }
  .sp-add-select {
    flex: 1; padding: 5px 8px; background: var(--card); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 11px; cursor: pointer; min-width: 0;
  }
  .sp-add-btn {
    padding: 5px 11px; background: var(--pm-bg); border: 1px solid var(--pm-dark);
    border-radius: 6px; color: var(--pm); font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap;
    transition: opacity 0.12s;
  }
  .sp-add-btn:hover:not(:disabled) { opacity: 0.8; }
  .sp-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ---- SUBSECTIONS ---- */
  .sp-subsection { margin-bottom: 24px; }
  .sp-subsection-title {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-step); margin-bottom: 10px;
  }

  .sp-tag-pills { display: flex; flex-wrap: wrap; gap: 7px; }
  .sp-tag-toggle {
    padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--card); color: var(--muted); font-size: 11px; font-weight: 600;
    letter-spacing: 0.3px; cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; text-transform: uppercase;
  }
  .sp-tag-toggle:hover { border-color: var(--border-active); color: var(--text); }

  .sp-copy-day-btns { display: flex; flex-wrap: wrap; gap: 6px; }
  .sp-copy-day-btn {
    padding: 6px 13px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--card); color: var(--muted); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
    min-width: 48px; text-align: center;
  }
  .sp-copy-day-btn:hover { background: var(--card-hover); color: var(--text); }
  .sp-copy-day-btn--done { background: var(--am-bg); border-color: var(--am-dark); color: var(--am); }

  /* ---- PRODUCTS TAB ---- */
  .sp-product-add-bar {
    display: flex; gap: 7px; margin-bottom: 18px; flex-wrap: wrap; align-items: center;
  }
  .sp-product-input {
    flex: 2; min-width: 130px; padding: 9px 11px; background: var(--card);
    border: 1px solid var(--border); border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none;
    transition: border-color 0.15s;
  }
  .sp-product-input:focus { border-color: var(--pm); }
  .sp-product-input::placeholder { color: var(--text-step); }

  .sp-cat-select {
    flex: 1; min-width: 100px; padding: 9px 8px; background: var(--card);
    border: 1px solid var(--border); border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer;
  }
  .sp-product-add-submit {
    padding: 9px 16px; background: var(--pm-bg); border: 1px solid var(--pm-dark);
    border-radius: 8px; color: var(--pm); font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
    transition: opacity 0.15s;
  }
  .sp-product-add-submit:hover { opacity: 0.8; }

  .sp-product-list {
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
    margin-bottom: 20px;
  }
  .sp-product-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    border-bottom: 1px solid var(--border-inner); background: var(--card);
    transition: background 0.12s;
  }
  .sp-product-item:last-child { border-bottom: none; }
  .sp-product-item:hover { background: var(--card-hover); }
  .sp-product-emoji { font-size: 16px; flex-shrink: 0; width: 28px; text-align: center; }
  .sp-product-info { flex: 1; min-width: 0; }
  .sp-product-name {
    font-size: 13px; font-weight: 500; color: var(--text-dim);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
  }
  .sp-product-cat {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-step); display: block;
  }
  .sp-product-empty {
    padding: 24px; text-align: center; font-size: 13px;
    color: var(--text-step); font-style: italic;
  }

  /* ---- REGEN ---- */
  .sp-regen-btn {
    width: 100%; padding: 12px 18px; background: var(--icon-bg);
    border: 1px solid var(--border); border-radius: 10px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .sp-regen-btn:hover:not(:disabled) { background: var(--card-hover); }
  .sp-regen-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .sp-regen-count { font-size: 11px; font-weight: 500; color: var(--text-step); flex-shrink: 0; }

  .sp-regen-confirm {
    margin-top: 10px; border: 1px solid var(--streak-active-border);
    border-radius: 10px; background: var(--streak-active-bg); padding: 14px 16px;
  }
  .sp-regen-confirm-text { font-size: 13px; color: var(--text); line-height: 1.55; margin-bottom: 12px; }
  .sp-regen-confirm-actions { display: flex; gap: 8px; }
  .sp-regen-confirm-yes {
    flex: 1; padding: 8px 12px; background: var(--streak-broken-bg);
    border: 1px solid var(--streak-broken-border); border-radius: 8px;
    color: var(--streak-broken-text); font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
  }
  .sp-regen-confirm-yes:hover { opacity: 0.8; }
  .sp-regen-confirm-cancel {
    flex: 1; padding: 8px 12px; background: var(--icon-bg);
    border: 1px solid var(--border); border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .sp-regen-confirm-cancel:hover { background: var(--card-hover); }
  .sp-regen-limit-msg { margin-top: 8px; font-size: 12px; color: var(--streak-broken-text); line-height: 1.5; }

  /* ---- SETTINGS TAB ---- */
  .sp-settings-section { }
  .sp-settings-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 0; border-bottom: 1px solid var(--border-inner); gap: 16px;
  }
  .sp-settings-row:last-child { border-bottom: none; }
  .sp-settings-label { font-size: 14px; font-weight: 500; color: var(--text); }
  .sp-settings-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .sp-theme-btns {
    display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
    flex-shrink: 0;
  }
  .sp-theme-btn {
    padding: 7px 13px; background: transparent; border: none;
    border-right: 1px solid var(--border); color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .sp-theme-btn:last-child { border-right: none; }
  .sp-theme-btn--active { background: var(--card-hover); color: var(--text); }
  .sp-theme-btn:hover:not(.sp-theme-btn--active) { background: var(--icon-bg); }

  .sp-copy-btn {
    padding: 9px 18px; background: var(--icon-bg); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
    min-width: 140px; text-align: center; flex-shrink: 0;
  }
  .sp-copy-btn:hover:not(:disabled) { background: var(--card-hover); }
  .sp-copy-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .sp-copy-btn--done { color: var(--am); border-color: var(--check-border); }
`;

export default function Settings() {
  const navigate = useNavigate();

  const todayName = DAYS_JS[new Date().getDay()];
  const todayLow  = todayName.toLowerCase();

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = saved;
    return saved;
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // ── Navigation state ───────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState("schedule");
  const [selectedDay,  setSelectedDay]  = useState(todayLow);

  // ── Routine (raw localStorage format) ─────────────────────────────────────
  const [rawRoutine, setRawRoutine] = useState(() => {
    try {
      const raw = localStorage.getItem("routine");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  function saveRoutine(updated) {
    setRawRoutine(updated);
    localStorage.setItem("routine", JSON.stringify(updated));
  }

  // ── Product catalog ────────────────────────────────────────────────────────
  const [productCatalog, setProductCatalog] = useState(initCatalog);

  function saveCatalog(updated) {
    setProductCatalog(updated);
    localStorage.setItem("productCatalog", JSON.stringify(updated));
  }

  // ── Schedule tab: add-product selects ──────────────────────────────────────
  const [addAmProduct, setAddAmProduct] = useState("");
  const [addPmProduct, setAddPmProduct] = useState("");

  useEffect(() => {
    setAddAmProduct("");
    setAddPmProduct("");
  }, [selectedDay]);

  // ── Products tab: new product form ────────────────────────────────────────
  const [newProductName,     setNewProductName]     = useState("");
  const [newProductCategory, setNewProductCategory] = useState("cleanser");

  // ── Regen ─────────────────────────────────────────────────────────────────
  const [regenCount, setRegenCount] = useState(() => {
    const stored = localStorage.getItem("regenCount");
    return stored !== null ? parseInt(stored, 10) : 5;
  });
  const [regenConfirming, setRegenConfirming] = useState(false);

  // ── Copy this day ─────────────────────────────────────────────────────────
  const [copied,       setCopied]       = useState(false);
  const [copiedToDay,  setCopiedToDay]  = useState(null);

  // ── Data manipulation ──────────────────────────────────────────────────────
  function moveStep(day, slot, index, dir) {
    const next = structuredClone(rawRoutine);
    const arr  = next?.[day]?.[slot];
    if (!arr) return;
    const to = index + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[index], arr[to]] = [arr[to], arr[index]];
    saveRoutine(next);
  }

  function removeStep(day, slot, index) {
    const next = structuredClone(rawRoutine);
    if (!next?.[day]?.[slot]) return;
    next[day][slot].splice(index, 1);
    saveRoutine(next);
  }

  function addStep(day, slot, productName) {
    if (!productName) return;
    const product = productCatalog.find(p => p.product === productName);
    if (!product) return;
    const next = structuredClone(rawRoutine);
    if (!next?.[day]) return;
    if (!next[day][slot]) next[day][slot] = [];
    next[day][slot].push({ product: product.product, category: product.category, notes: "" });
    saveRoutine(next);
  }

  function toggleTag(day, tag) {
    const next = structuredClone(rawRoutine);
    if (!next?.[day]) return;
    if (!next[day].tags) next[day].tags = [];
    const idx = next[day].tags.indexOf(tag);
    if (idx >= 0) next[day].tags.splice(idx, 1);
    else          next[day].tags.push(tag);
    saveRoutine(next);
  }

  function copyDayTo(targetDay) {
    const source = rawRoutine?.[selectedDay];
    if (!source) return;
    const next = structuredClone(rawRoutine);
    next[targetDay] = {
      am:   source.am.map(s => ({ ...s })),
      pm:   source.pm.map(s => ({ ...s })),
      tags: [...(source.tags || [])],
    };
    saveRoutine(next);
    setCopiedToDay(targetDay);
    setTimeout(() => setCopiedToDay(null), 1500);
  }

  function addProductToCatalog() {
    const name = newProductName.trim();
    if (!name) return;
    if (productCatalog.find(p => p.product === name)) return;
    saveCatalog([...productCatalog, { product: name, category: newProductCategory }]);
    setNewProductName("");
    setNewProductCategory("cleanser");
  }

  function removeProductFromCatalog(productName) {
    saveCatalog(productCatalog.filter(p => p.product !== productName));
    if (!rawRoutine) return;
    const next = structuredClone(rawRoutine);
    for (const day of DAY_ORDER_LOW) {
      if (!next[day]) continue;
      for (const slot of ["am", "pm"]) {
        if (!next[day][slot]) continue;
        next[day][slot] = next[day][slot].filter(s => s.product !== productName);
      }
    }
    saveRoutine(next);
  }

  function handleRegen() {
    const next = regenCount - 1;
    setRegenCount(next);
    localStorage.setItem("regenCount", String(next));
    setRegenConfirming(false);
    window.location.href = "/generating";
  }

  function copyToday() {
    const dayData = rawRoutine?.[todayLow];
    if (!dayData) return;
    const fmt = (items) =>
      (items || []).length
        ? items.map((item, i) => `${i + 1}. [${CAT_TO_STEP[item.category] || item.category}] ${item.product}`).join("\n")
        : "(none)";
    const text = `${todayName} — Skincare Routine\n\nMorning (AM):\n${fmt(dayData.am)}\n\nEvening (PM):\n${fmt(dayData.pm)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const dayData = rawRoutine?.[selectedDay] || { am: [], pm: [], tags: [] };

  return (
    <>
      <style>{css}</style>
      <div className="sp-root">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className="sp-header">
          <h1 className="sp-heading">Manage Routine</h1>
          <button className="sp-back" onClick={() => navigate("/tracker")}>← Display</button>
        </header>

        {/* ─── Tabs ───────────────────────────────────────────────────────── */}
        <div className="sp-tabs">
          {[
            { id: "schedule", label: "📅 Schedule" },
            { id: "products", label: "🧴 Products" },
            { id: "settings", label: "⚙️ Settings" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`sp-tab${activeTab === tab.id ? " sp-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Content ────────────────────────────────────────────────────── */}
        <div className="sp-content">

          {/* No routine */}
          {!rawRoutine && (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: "56px 0" }}>
              No routine found.{" "}
              <a href="/onboarding" style={{ color: "var(--pm)", textDecoration: "none" }}>
                Create one →
              </a>
            </div>
          )}

          {/* ══ SCHEDULE TAB ══════════════════════════════════════════════ */}
          {rawRoutine && activeTab === "schedule" && (
            <>
              {/* Day pill selector */}
              <div className="sp-day-pills">
                {DAY_ORDER.map(day => {
                  const low     = day.toLowerCase();
                  const isActive = low === selectedDay;
                  const isToday  = low === todayLow;
                  return (
                    <button
                      key={day}
                      className={`sp-day-pill${isActive ? " sp-day-pill--active" : ""}${isToday ? " sp-day-pill--today" : ""}`}
                      onClick={() => setSelectedDay(low)}
                    >
                      {DAY_ABBR[day]}
                    </button>
                  );
                })}
              </div>

              {/* AM + PM edit columns */}
              <div className="sp-day-grid">
                {[
                  { slot: "am", label: "☀️ Morning", addProduct: addAmProduct, setAdd: setAddAmProduct },
                  { slot: "pm", label: "🌙 Evening",  addProduct: addPmProduct, setAdd: setAddPmProduct },
                ].map(({ slot, label, addProduct, setAdd }) => {
                  const steps = dayData[slot] || [];
                  return (
                    <div key={slot} className="sp-day-col">
                      <div className={`sp-col-header sp-col-${slot}`}>{label}</div>

                      {steps.length === 0 && (
                        <div className="sp-no-steps">No steps — add one below.</div>
                      )}

                      {steps.map((item, i) => {
                        const stepLabel = CAT_TO_STEP[item.category] || item.category;
                        return (
                          <div key={i} className="sp-step-edit-row">
                            <div className="sp-step-icon-sm">
                              {stepIcons[stepLabel] || "•"}
                            </div>
                            <div className="sp-step-text">
                              <span className="sp-step-cat">{stepLabel}</span>
                              <span className="sp-step-name">{item.product}</span>
                            </div>
                            <div className="sp-step-btns">
                              <button
                                className="sp-icon-btn"
                                onClick={() => moveStep(selectedDay, slot, i, -1)}
                                disabled={i === 0}
                                title="Move up"
                              >↑</button>
                              <button
                                className="sp-icon-btn"
                                onClick={() => moveStep(selectedDay, slot, i, 1)}
                                disabled={i === steps.length - 1}
                                title="Move down"
                              >↓</button>
                              <button
                                className="sp-icon-btn sp-icon-btn--remove"
                                onClick={() => removeStep(selectedDay, slot, i)}
                                title="Remove"
                              >×</button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add product row */}
                      <div className="sp-add-row">
                        <select
                          className="sp-add-select"
                          value={addProduct}
                          onChange={e => setAdd(e.target.value)}
                        >
                          <option value="">Add product…</option>
                          {productCatalog.map(p => (
                            <option key={p.product} value={p.product}>{p.product}</option>
                          ))}
                        </select>
                        <button
                          className="sp-add-btn"
                          disabled={!addProduct}
                          onClick={() => { addStep(selectedDay, slot, addProduct); setAdd(""); }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Tags */}
              <div className="sp-subsection">
                <div className="sp-subsection-title">Day Tags</div>
                <div className="sp-tag-pills">
                  {ALL_TAGS.map(tag => {
                    const isActive = (dayData.tags || []).includes(tag);
                    const c = ALL_TAG_COLORS[tag];
                    return (
                      <button
                        key={tag}
                        className="sp-tag-toggle"
                        style={isActive ? { background: c.bg, borderColor: c.bg, color: c.text } : {}}
                        onClick={() => toggleTag(selectedDay, tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Copy this day to other days */}
              <div className="sp-subsection">
                <div className="sp-subsection-title">Copy this day to</div>
                <div className="sp-copy-day-btns">
                  {DAY_ORDER
                    .filter(d => d.toLowerCase() !== selectedDay)
                    .map(day => {
                      const low     = day.toLowerCase();
                      const isDone  = copiedToDay === low;
                      return (
                        <button
                          key={day}
                          className={`sp-copy-day-btn${isDone ? " sp-copy-day-btn--done" : ""}`}
                          onClick={() => copyDayTo(low)}
                        >
                          {isDone ? `✓ ${DAY_ABBR[day]}` : DAY_ABBR[day]}
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* ══ PRODUCTS TAB ══════════════════════════════════════════════ */}
          {rawRoutine && activeTab === "products" && (
            <>
              {/* Add product bar */}
              <div className="sp-product-add-bar">
                <input
                  className="sp-product-input"
                  type="text"
                  placeholder="Product name…"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addProductToCatalog(); }}
                />
                <select
                  className="sp-cat-select"
                  value={newProductCategory}
                  onChange={e => setNewProductCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CAT_TO_STEP[c]}</option>
                  ))}
                </select>
                <button className="sp-product-add-submit" onClick={addProductToCatalog}>
                  Add
                </button>
              </div>

              {/* Product list */}
              {productCatalog.length === 0 ? (
                <div className="sp-product-empty">No products yet. Add one above.</div>
              ) : (
                <div className="sp-product-list">
                  {productCatalog.map(item => {
                    const stepLabel = CAT_TO_STEP[item.category] || item.category;
                    return (
                      <div key={item.product} className="sp-product-item">
                        <span className="sp-product-emoji">{stepIcons[stepLabel] || "•"}</span>
                        <div className="sp-product-info">
                          <span className="sp-product-name">{item.product}</span>
                          <span className="sp-product-cat">{stepLabel}</span>
                        </div>
                        <button
                          className="sp-icon-btn sp-icon-btn--remove"
                          onClick={() => removeProductFromCatalog(item.product)}
                          title="Remove product"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regenerate routine */}
              {regenCount > 0 ? (
                <>
                  <button
                    className="sp-regen-btn"
                    onClick={() => setRegenConfirming(v => !v)}
                  >
                    <span>Regenerate routine</span>
                    <span className="sp-regen-count">({regenCount} remaining)</span>
                  </button>

                  {regenConfirming && (
                    <div className="sp-regen-confirm">
                      <p className="sp-regen-confirm-text">
                        ⚠️ This will permanently replace your current routine. This cannot be undone. Are you sure?
                      </p>
                      <div className="sp-regen-confirm-actions">
                        <button className="sp-regen-confirm-yes" onClick={handleRegen}>
                          Yes, regenerate
                        </button>
                        <button className="sp-regen-confirm-cancel" onClick={() => setRegenConfirming(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button className="sp-regen-btn" disabled>
                    <span>Regenerate routine</span>
                    <span className="sp-regen-count">(0 remaining)</span>
                  </button>
                  <p className="sp-regen-limit-msg">
                    Regeneration limit reached (0 remaining).
                  </p>
                </>
              )}
            </>
          )}

          {/* ══ SETTINGS TAB ══════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="sp-settings-section">

              {/* Theme */}
              <div className="sp-settings-row">
                <div>
                  <div className="sp-settings-label">Theme</div>
                  <div className="sp-settings-desc">Dark, light, or follow system</div>
                </div>
                <div className="sp-theme-btns">
                  {[
                    { id: "dark",  label: "🌙 Dark"  },
                    { id: "light", label: "☀️ Light" },
                    { id: "auto",  label: "◑ Auto"   },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`sp-theme-btn${theme === t.id ? " sp-theme-btn--active" : ""}`}
                      onClick={() => setTheme(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copy this day */}
              <div className="sp-settings-row">
                <div>
                  <div className="sp-settings-label">Copy this day</div>
                  <div className="sp-settings-desc">
                    Export {todayName}'s routine as plain text
                  </div>
                </div>
                <button
                  className={`sp-copy-btn${copied ? " sp-copy-btn--done" : ""}`}
                  onClick={copyToday}
                  disabled={!rawRoutine}
                >
                  {copied ? "Copied ✓" : `Copy ${todayName}`}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
