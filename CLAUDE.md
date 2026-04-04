# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # local dev server (Vite, port 5173)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

To test Netlify functions locally, use the Netlify CLI:
```bash
npx netlify dev   # runs Vite + functions together on port 8888
```

## Environment Variables

Required in `.env` (not committed):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase client
- `ANTHROPIC_API_KEY` — used server-side in `netlify/functions/generate-routine.js`

## Architecture

**Stack**: React 18 + Vite 5, deployed to Netlify. Auto-deploys on push to `main`.

**Routing** (`src/router.jsx`): React Router v6 browser router. Route flow:
`/` → `/login` → `/onboarding` → `/generating` → `/review` → `/tracker`

**Data flow (no global state)**:
- Onboarding data: written to `localStorage['onboarding']` on `/onboarding` submit
- Generated routine: written to `localStorage['routine']` after `/generating` calls the Netlify function
- `App.jsx` (`/tracker`) reads `localStorage['routine']` directly via `loadRoutine()`
- Streak tracking: `localStorage['checkedToday']` (resets each calendar day) + `localStorage['streakData']` (map of date → boolean)

**Routine data shape** (as stored in `localStorage['routine']`):
```json
{
  "monday": { "am": [{ "product": "...", "category": "cleanser", "notes": "..." }], "pm": [...] },
  ...
}
```
`App.jsx:loadRoutine()` maps `category` → display `step` name using `CAT_TO_STEP`. Valid categories: `cleanser`, `toner`, `exfoliant`, `serum`, `treatment`, `eye-cream`, `moisturiser`, `sunscreen`, `oil`, `mask`, `other`.

**Netlify Functions** (`netlify/functions/`):
- `generate-routine.js` — POST, calls Claude API (`claude-sonnet-4-20250514`) with a detailed system prompt encoding r/SkincareAddiction routine ordering rules. Returns `{ routine }` JSON.

**Auth** (partially implemented):
- `src/lib/supabase.js` — Supabase client singleton
- `src/context/AuthContext.jsx` — Supabase auth state listener (stub)
- `src/components/AuthGuard.jsx` — route guard (stub)
- `src/hooks/useAuth.js`, `useProfile.js` — auth/profile hooks (stubs)
- `src/pages/Login.jsx` — auth page (stub)

**Donations**: Optional via Buy Me a Coffee (external link, no integration needed).

**Styling**: All CSS is written as inline `<style>` tags inside each component (no CSS files, no Tailwind). Each page defines its own color palette via a local `C` constant object. `App.jsx` uses a dark theme (`#0b0b0d` bg); all other pages use a warm light theme (`#fdf8f5` bg).

## Key Logic Notes

- AM is defined as hours 0–16 (`hour < 17`); PM is 17–23. This controls which routine column highlights as "Now" in the tracker.
- `useStreak` (`src/hooks/useStreak.js`) uses local noon (`T12:00:00`) when parsing date strings to avoid DST edge cases.
- The Claude system prompt in `generate-routine.js` encodes all ingredient scheduling rules (retinoids PM-only, never same night as AHAs/BHAs, sunscreen mandatory AM, etc.). Changes to routine generation logic go there.
- Onboarding saves to `localStorage` only (the Supabase save is marked `// TODO`).
