import { useState, useEffect } from "react";

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

const routine = {
  Monday: {
    am: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Treatment", product: "Retin-A (Tretinoin 0.025%)" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "La Roche-Posay Hydraphase HA Rich" },
    ],
    tags: ["Retinoid Night"],
  },
  Tuesday: {
    am: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Exfoliate", product: "Clinique For Men Face Scrub" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "CeraVe Facial Moisturizing Lotion PM" },
    ],
    tags: ["Exfoliation Day", "Rest Night"],
  },
  Wednesday: {
    am: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Treatment", product: "Retin-A (Tretinoin 0.025%)" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "La Roche-Posay Hydraphase HA Rich" },
    ],
    tags: ["Retinoid Night"],
  },
  Thursday: {
    am: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "CeraVe Facial Moisturizing Lotion PM" },
    ],
    tags: ["Rest Night"],
  },
  Friday: {
    am: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Treatment", product: "Retin-A (Tretinoin 0.025%)" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "La Roche-Posay Hydraphase HA Rich" },
    ],
    tags: ["Retinoid Night"],
  },
  Saturday: {
    am: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Exfoliate", product: "Clinique For Men Face Scrub" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "CeraVe Facial Moisturizing Lotion PM" },
    ],
    tags: ["Exfoliation Day", "Rest Night"],
  },
  Sunday: {
    am: [
      { step: "Cleanse", product: "Cetaphil Gentle Skin Cleanser" },
      { step: "Serum", product: "The Inkey List Vitamin C + EGF" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "Vichy Homme Structure Force" },
      { step: "Sunscreen", product: "Bioré UV Aqua Rich SPF 50+" },
    ],
    pm: [
      { step: "Cleanse", product: "Clinique For Men Face Wash" },
      { step: "Treatment", product: "Retin-A (Tretinoin 0.025%)" },
      { step: "Treatment", product: "Zoryve (Roflumilast Foam 0.3%)" },
      { step: "Eye Cream", product: "The Inkey List Caffeine Eye Cream" },
      { step: "Moisturizer", product: "La Roche-Posay Hydraphase HA Rich" },
    ],
    tags: ["Retinoid Night"],
  },
};

const tagColors = {
  "Retinoid Night": { bg: "#3b1f5e", text: "#d4b5ff" },
  "Exfoliation Day": { bg: "#1a3a2a", text: "#7ddeaa" },
  "Rest Night": { bg: "#3a2a1a", text: "#deb87d" },
};

const stepIcons = {
  Cleanse: "🧴", Exfoliate: "🧼", Serum: "🍊",
  "Eye Cream": "👁️", Moisturizer: "💧", Sunscreen: "☀️", Treatment: "💊",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #0b0b0d;
    color: #e8e4df;
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .page { max-width: 900px; margin: 0 auto; padding: 32px 20px 64px; }

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
    color: #f5f0ea;
    letter-spacing: -0.5px;
  }

  .hero-time {
    font-size: 14px;
    font-weight: 500;
    color: #6a6560;
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

  .badge-am { background: #1a2e1a; color: #a8d89a; }
  .badge-pm { background: #2a1a2e; color: #c89ad8; }

  .hero-affirmation {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    font-weight: 500;
    color: #a09a92;
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
    background: #121215;
    border: 1px solid #1e1e22;
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

  .col-am::before { background: linear-gradient(90deg, #a8d89a, #5a8a4e); }
  .col-pm::before { background: linear-gradient(90deg, #c89ad8, #7a4e8a); }

  .col-active {
    border-color: #3a3a40;
    box-shadow: 0 0 40px rgba(200, 154, 216, 0.06);
  }

  .col-header {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .col-am .col-header { color: #a8d89a; }
  .col-pm .col-header { color: #c89ad8; }

  .step-row {
    display: flex;
    gap: 12px;
    padding: 11px 0;
    border-bottom: 1px solid #1a1a1e;
    align-items: flex-start;
  }

  .step-row:last-child { border-bottom: none; }

  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #18181b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .step-label {
    font-size: 10px;
    font-weight: 600;
    color: #5a5650;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 2px;
  }

  .step-product {
    font-size: 13px;
    font-weight: 500;
    color: #d4d0ca;
    line-height: 1.35;
  }

  /* ---- DIVIDER ---- */
  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 56px 0 40px;
  }

  .divider-line { flex: 1; height: 1px; background: #1e1e22; }

  .divider-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #4a4640;
  }

  /* ---- WEEKLY GRID ---- */
  .week-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .week-day {
    background: #0f0f12;
    border: 1px solid #1a1a1e;
    border-radius: 14px;
    overflow: hidden;
  }

  .week-day-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1a1a1e;
    cursor: pointer;
    transition: background 0.2s;
  }

  .week-day-header:hover { background: #141418; }

  .week-day-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #f5f0ea;
  }

  .week-day-tags { display: flex; gap: 6px; flex-wrap: wrap; }

  .week-day-affirmation {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 14px;
    color: #6a6560;
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

  .week-col {
    padding: 16px 20px;
  }

  .week-col:first-child {
    border-right: 1px solid #1a1a1e;
  }

  @media (max-width: 600px) {
    .week-col:first-child {
      border-right: none;
      border-bottom: 1px solid #1a1a1e;
    }
  }

  .week-col-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .week-col-am .week-col-label { color: #a8d89a; }
  .week-col-pm .week-col-label { color: #c89ad8; }

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
    background: #18181b;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .week-step-product {
    font-size: 12px;
    color: #a09a92;
    line-height: 1.3;
  }

  .today-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d4b5ff;
    display: inline-block;
    margin-left: 10px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(212, 181, 255, 0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(212, 181, 255, 0); }
  }

  .footer-note {
    text-align: center;
    font-size: 11px;
    color: #3a3630;
    margin-top: 48px;
    line-height: 1.6;
  }

  /* fade in */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeUp 0.5s ease-out both; }
  .fade-d1 { animation-delay: 0.05s; }
  .fade-d2 { animation-delay: 0.12s; }
  .fade-d3 { animation-delay: 0.2s; }
  .fade-d4 { animation-delay: 0.28s; }
`;

function StepRow({ item }) {
  return (
    <div className="step-row">
      <div className="step-icon">{stepIcons[item.step] || "•"}</div>
      <div>
        <div className="step-label">{item.step}</div>
        <div className="step-product">{item.product}</div>
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const todayName = DAYS[now.getDay()];
  const hour = now.getHours();
  const isAM = hour < 17;
  const todayData = routine[todayName];

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      <style>{css}</style>
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

          <div className="today-grid fade-in fade-d3">
            {/* AM Column */}
            <div className={`col col-am ${isAM ? "col-active" : ""}`}>
              <div className="col-header">☀️  Morning{isAM ? " — Now" : ""}</div>
              {todayData.am.map((item, i) => <StepRow key={i} item={item} />)}
            </div>

            {/* PM Column */}
            <div className={`col col-pm ${!isAM ? "col-active" : ""}`}>
              <div className="col-header">🌙  Evening{!isAM ? " — Now" : ""}</div>
              {todayData.pm.map((item, i) => <StepRow key={i} item={item} />)}
            </div>
          </div>
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
            return (
              <div
                key={dayName}
                className="week-day"
                style={isToday ? { borderColor: "#2a2a30", background: "#111115" } : {}}
              >
                <div className="week-day-header">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="week-day-name">{dayName}</span>
                    {isToday && <span className="today-marker" />}
                  </div>
                  <div className="week-day-tags">
                    {d.tags.map((t) => <Tag key={t} label={t} />)}
                  </div>
                </div>

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
              </div>
            );
          })}
        </div>

        <div className="footer-note">
          If irritation builds from Retin-A, swap a retinoid night for a rest night.<br />
          Apply Zoryve per your prescription. Sunscreen every single morning.
        </div>
      </div>
    </>
  );
}
