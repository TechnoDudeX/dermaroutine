# trackmyskin

A personalized AI skincare routine generator and daily tracker. Users answer a few questions about their skin, and the app uses Claude to build a full 7-day AM/PM routine tailored to the products they already own. They can then review, edit, and track their routine day-by-day, with a streak system to encourage consistency.

---

## What it does

### 1. Onboarding (`/onboarding`)
The user fills out a single-step form:
- **Skin type** (required): Dry, Oily, Combination, Sensitive, or Normal
- **Skin concerns** (optional, multi-select): Acne, Hyperpigmentation, Anti-aging, Redness, Texture, Hydration
- **Current products** (optional): A free-text list of products they already own, one per line

This data is saved to `localStorage` and will eventually be persisted to a Supabase `profiles` table.

### 2. Routine generation (`/generating`)
The app POSTs the onboarding data to a Netlify serverless function (`netlify/functions/generate-routine.js`), which calls the **Claude API** (`claude-sonnet-4-20250514`) with a structured system prompt acting as a licensed esthetician.

Claude returns a strict JSON object — a 7-day routine with AM and PM step arrays for each day. Each step contains:
- `product`: the product name (only from the user's list, never invented)
- `category`: one of 11 canonical categories (cleanser, toner, exfoliant, serum, treatment, eye-cream, moisturiser, sunscreen, oil, mask, other)
- `notes`: a brief practical note (layering order, frequency reminders, ingredient conflicts, max 12 words)

Rules enforced by the prompt:
- Only uses products the user listed
- Respects frequency rules (e.g. AHAs/BHAs 2–3×/week, retinol 3×/week)
- Correct step ordering: cleanse → tone → treatment/serum → eye cream → moisturiser → SPF (AM) or face oil/sleeping mask (PM)
- Returns pure JSON — no markdown, no code fences

While Claude is working, the UI cycles through five status messages to communicate progress. On success the routine is saved to `localStorage` and the user is forwarded to `/review`.

### 3. Review & edit (`/review`)
Before the routine goes live, the user can inspect and refine it:
- Day tabs across the top (Mo–Su) to switch between days
- AM and PM sections each show the ordered step list with color-coded category badges
- **Edit mode**: inline add/remove steps, drag-to-reorder within a session
- **Day toggling**: individual days can be turned on/off (e.g. skip Sunday entirely)
- A soft "Buy me a coffee" donation prompt appears before the user continues
- On confirm, navigates to `/tracker`

### 4. Daily tracker (`/tracker`)
The tracker (`src/App.jsx`) is the core daily-use view:
- Shows today's AM and PM steps
- Each step is a checkbox — tap to mark complete
- **Streak tracking** via `useStreak` hook: persists completion state per calendar day in `localStorage`, calculates a consecutive-day streak, and surfaces whether the streak is active, broken, or at zero
- Completed state resets each calendar day automatically

### 5. Auth (`/login`)
Google OAuth via Supabase. On successful sign-in, redirects to `/onboarding`. Auth is wired but access control (requiring auth + payment before `/tracker`) is still in progress.

---

## User flow

```
Landing (/) → Login (/login) → Onboarding (/onboarding)
  → Generating (/generating) [calls Claude API]
  → Review (/review) [inspect + edit routine]
  → Tracker (/tracker) [daily AM/PM checklist + streak]
```

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Styling | Inline CSS-in-JSX (no CSS framework) |
| Fonts | Google Fonts — Playfair Display + Inter |
| Auth | Supabase (Google OAuth) |
| Database | Supabase (Postgres) — wired, profile persistence in progress |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk` |
| Payments | Stripe (`@stripe/stripe-js` + `stripe`) — wired, not yet active |
| Serverless | Netlify Functions (Node, bundled with esbuild) |
| Hosting | Netlify (auto-deploy on push to `main`) |
| Local persistence | `localStorage` (routine, onboarding data, streak, daily check state) |

---

## Project structure

```
dermaroutine/
├── netlify/
│   └── functions/
│       └── generate-routine.js   # Serverless function — Claude API call
├── src/
│   ├── hooks/
│   │   └── useStreak.js          # Streak tracking logic
│   ├── lib/
│   │   └── supabase.js           # Supabase client init
│   ├── pages/
│   │   ├── Landing.jsx           # Marketing / home page
│   │   ├── Login.jsx             # Google OAuth via Supabase
│   │   ├── Onboarding.jsx        # Skin type, concerns, products form
│   │   ├── Generating.jsx        # Loading state + Claude API call
│   │   ├── Review.jsx            # Routine review, edit, day toggling
│   │   └── Tracker.jsx           # Daily AM/PM checklist wrapper
│   ├── App.jsx                   # Core tracker UI
│   ├── main.jsx                  # React entry point
│   └── router.jsx                # Route definitions
├── netlify.toml                  # Build config (npm run build → dist/)
├── vite.config.js
└── package.json
```

---

## Environment variables

| Variable | Where used | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Netlify Function (server-side) | Authenticates Claude API calls |
| `VITE_SUPABASE_URL` | Client-side (`src/lib/supabase.js`) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client-side (`src/lib/supabase.js`) | Supabase public anon key |

Set `ANTHROPIC_API_KEY` in Netlify → Site settings → Environment variables. The `VITE_*` vars go there too and are injected at build time.

---

## Local development

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173
```

To test the Netlify function locally:

```bash
npx netlify-cli dev
```

This runs both Vite and the serverless functions on a single port and proxies `/.netlify/functions/*` correctly.

---

## Deployment

Netlify auto-deploys on every push to `main`. Build command: `npm run build`. Publish directory: `dist/`. Serverless functions are bundled automatically from `netlify/functions/` using esbuild.

---

## What's still in progress

- Supabase profile persistence (onboarding data currently only stored in `localStorage`)
- Auth-gating `/tracker` and `/review` (require signed-in + paid user)
- Stripe payment integration (packages wired, checkout flow not yet built)
- Routine editing persistence (drag-reorder and edits live only in React state for the session)
