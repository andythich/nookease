# NookEase — Project Context

## What this is

NookEase is a calm, warm-toned wellness companion app at **nook-ease.com**. It's evolved from a teaser landing page into a working app: visitors see a marketing carousel, sign up with email or Google, and get three working features (Planner, Journal, Workout log). Notecards and Diary still show marketing teasers.

Built with Vite + React, deployed on Vercel, code lives at `github.com/andythich/nookease`. Authentication and per-user data sync live in Supabase.

The aesthetic is intentional and worth preserving:
- Warm beige background (`#F6F1EA`) with a film grain overlay (now at `z-index: -1`, true background layer)
- Burnt orange accent palette (`#FF7A45` and warm variants, with `#D94A20` for primary CTAs)
- Fraunces (italic serif) for headings, Inter Tight for body text
- Quiet, slow, "small chunks of daily life" voice — never loud, never urgent
- A companion character named **Ember** (scripted decision-tree chat, not LLM-backed) that appears bottom-corner

## Current panels (post-edit)

The homepage has an auto-scrolling carousel of feature panels. There are five:

1. **Planner** — "Order from the everyday" — INTERACTIVE (weekly grid)
2. **Journal** — "A page that listens" — INTERACTIVE (iPhone-Notes-style with rich text)
3. **Workout log** — "Small motions, stacked" — INTERACTIVE (cardio logger + chart)
4. **Notecards** — "Ideas, one at a time" — still marketing teaser
5. **Diary** — "The record of your days" — still marketing teaser

Click a Planner / Journal / Workout panel while logged out → bounced to login. Notecards and Diary still go to the read-only `FeaturePage` teaser.

## Tech stack

- **Framework:** React 18 + Vite (`npm create vite@latest` template)
- **Styling:** All inline styles + a single `<GlobalStyles />` component in App.jsx with a `<style>` tag. No Tailwind, no CSS modules, no styled-components.
- **State:** Plain React `useState` + `useEffect` + `useRef`. No Redux, no Zustand.
- **Routing:** Single-page, no React Router. Page switching is done via a `useState` view selector.
- **Auth + Database:** Supabase (`@supabase/supabase-js`). Email/password and Google OAuth. Data syncs per user via Row Level Security (RLS).
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Domain:** nook-ease.com (also www.nook-ease.com), DNS pointed at Vercel, free SSL via Vercel
- **Repo:** `github.com/andythich/nookease`, single `main` branch

## Project structure

```
nookease/
├── index.html              ← Vite entry, references /src/main.jsx
├── package.json            ← includes @supabase/supabase-js
├── vite.config.js
├── vercel.json             ← explicit Vercel config (framework: vite, etc.)
├── .env.local              ← Supabase URL + anon key, NOT committed (in .gitignore)
├── public/
└── src/
    ├── main.jsx            ← React entry, mounts App
    ├── App.jsx             ← THE WHOLE APP, ~2,750 lines
    ├── supabase.js         ← shared Supabase client (uses VITE_SUPABASE_* env vars)
    ├── index.css           ← emptied/minimal (Vite default removed)
    └── assets/
```

**Important:** App.jsx is currently a single ~2,750-line monolith. User has been told this should eventually be split into separate component files but hasn't done so yet. Don't propose splitting unless asked.

## Important file landmarks in App.jsx

- **Lines ~5–28:** `useAuth` hook — wraps `supabase.auth.getSession()` and `onAuthStateChange`
- **Lines ~30–93:** `PANELS` array — single source of truth for the homepage carousel
- **Lines ~95–125:** `GlobalStyles` component with the `<style>` block (font imports, grain overlay, keyframes, base resets)
- **Lines ~93–110:** Grain layer styles — `.grain` parent gets `position: relative; z-index: 0` to create a stacking context, `.grain::before` is at `z-index: -1` so it sits below ALL content
- **Lines ~127–250:** `Nav` — receives `user` prop, conditionally shows "Log in / Get Early Access" (logged out) vs "hi, [name] / Sign out" (logged in)
- **Lines ~280–390:** `PanelIllustration` — switch on `id` returning custom SVG per panel
- **Lines ~395–425:** Carousel container with `scroll-x` keyframe animation
- **Lines ~440–510:** `LoadingNote` and `PanelHeader` (shared by interactive panels)
- **Lines ~515–840:** `PlannerPage` — fetches/inserts/deletes against `planner_events` table
- **Lines ~870–1250:** `JournalPage` — fetches/inserts/updates/deletes against `journal_pages` table; uses `contentEditable` + `document.execCommand` for rich text (no editor library); 600ms debounced saves
- **Lines ~1255–1665:** `WorkoutPage` — fetches/inserts/deletes against `workout_sessions` table; hand-rolled inline SVG chart (no Recharts)
- **Lines ~1665–1785:** `FeaturePage` — marketing teaser for Notecards/Diary (no auth required)
- **Lines ~1785–2085:** `LoginPage` — Supabase email/password + Google OAuth + forgot password
- **Companion (Ember):** scripted, choice-based. Each "node" has text and 2–4 option buttons. Not AI-backed.

## Supabase setup (already done)

### Tables (all with Row Level Security enabled)

```sql
planner_events    (id, user_id, day, start_time, end_time, title, created_at)
journal_pages     (id, user_id, title, html, updated_at, created_at)
workout_sessions  (id, user_id, date, calories, miles, minutes, created_at)
```

Each table has a single RLS policy: `auth.uid() = user_id` for both `using` and `with check`. This is the database-level guarantee that user A cannot see/edit user B's rows even if there's a bug in frontend code. **If a row insert ever fails with "new row violates row-level security policy," the policies got dropped — re-run them.**

### Auth providers enabled

- **Email/password** — with email confirmation on by default (sends verification link)
- **Google OAuth** — configured via Google Cloud Console, callback URL points to Supabase's `/auth/v1/callback`

### Env vars (set in Vercel for Production / Preview / Development, and in local `.env.local`)

- `VITE_SUPABASE_URL` — `https://[project-ref].supabase.co`
- `VITE_SUPABASE_ANON_KEY` — public anon key (safe to ship in frontend bundles; access is governed by RLS)

### Auth redirect config in Supabase

- **Site URL:** `https://nook-ease.com`
- **Redirect URLs:** `https://nook-ease.com/**` AND `http://localhost:5173/**`

### Google OAuth in Google Cloud Console

- **Authorized JavaScript origins:** `http://localhost:5173`, `https://nook-ease.com`
- **Authorized redirect URI:** Supabase's callback URL (`https://[project-ref].supabase.co/auth/v1/callback`)

## What works

- Site live at nook-ease.com with valid SSL
- Auto-deploy on push to main (~30s)
- Local dev: `cd nookease && npm run dev` → http://localhost:5173
- Carousel, panel click, login page (email + Google), Ember chat all functional
- Sign up / log in / sign out / forgot password
- Planner, Journal, Workout all read/write from Supabase per user
- Logged-out users hitting interactive panels get bounced to login
- Grain texture sits below all interactive UI

## What doesn't yet (future work the user has flagged interest in)

- **Notecards and Diary** still show marketing teasers — need to be built out as interactive features (same pattern as the other three)
- **"Get Early Access" button** currently goes to login — could collect emails for a waitlist instead via Formspree/ConvertKit if user wants a separate marketing list
- **Apple OAuth** was removed from the login page (we didn't configure Apple Developer). Can be added back when user has an Apple Developer account.
- **Ember** is scripted; user may eventually want LLM-backed conversation (separate build)
- **Code organization:** monolithic App.jsx should be split into `src/components/Nav.jsx`, `Companion.jsx`, etc.
- **Favicon:** still the default Vite logo in `public/`. Needs replacement with NookEase mark.
- **Export/delete account flows:** privacy copy promises "Export anytime, delete in one tap" — not actually implemented yet

## Known gotchas / lessons from the build

These all bit us at some point. If something is failing now, check these first:

### Vite + Vercel

1. **`vite: command not found` on Vercel** → Install Command isn't running. Fix: keep `vercel.json` in repo root with explicit `installCommand: "npm install"` and `framework: "vite"`. Setting Framework Preset to "Vite" in dashboard also fixes it.

2. **Build completes in 19ms with no output** → Vercel cloned the repo but `package.json` isn't at the root. Means files are nested under a subfolder. Verify on github.com that `package.json`, `vite.config.js`, `index.html` are at the top level.

3. **`fatal: Pathspec 'src/main.jsx' is in submodule 'src'`** → A nested `.git` folder inside `src/` made git treat src as a submodule. Fix: `git rm --cached src && rmdir /s /q src\.git && git add src && commit && push`.

4. **Vite default `index.css` clashes with custom `<GlobalStyles />`** → Either delete the `import './index.css'` line in `main.jsx` or empty the file.

### Vercel UI

5. **Environment Variables page returns 404** → Vercel reorganized. Variables now live INSIDE each environment (Production / Preview / Development) on the **Environments** page, not at a top-level "Environment Variables" page. Click into each environment and add the variable there.

### Supabase

6. **"new row violates row-level security policy"** → Either RLS policies are missing on a table, or you forgot to set `user_id: user.id` in the insert payload. Both are required.

7. **Auth works locally but Google sign-in redirects to localhost in production** → Site URL in Supabase Auth settings still says localhost. Set Site URL to `https://nook-ease.com` and add both `https://nook-ease.com/**` and `http://localhost:5173/**` to Redirect URLs.

8. **Auth state flickers (briefly shows logged-out UI for a logged-in user on page load)** → fixed in App.jsx: when `useAuth` is `loading: true` we render a "opening the door..." placeholder instead of the home page. Don't remove that.

### Z-index / visual layering

9. **Grain overlay sat on top of panels** → was caused by `z-index: 1` on `.grain::before` while panels had no z-index (defaulting to `auto`, which loses to positive values). Fixed by:
   - Setting `.grain` parent to `position: relative; z-index: 0` (creates a stacking context)
   - Setting `.grain::before` to `z-index: -1` (true background, trapped above body bg by parent's stacking context)
   - **Don't change either of these without understanding the trick.** Without the parent stacking context, `z-index: -1` would push the grain behind the body background and it'd disappear entirely.

### contentEditable / Journal

10. **Journal cursor jumping while typing** → Don't make the contentEditable controlled. We keep it uncontrolled and only sync HTML *into* it when the active page changes. The `useEffect` that swaps `editorRef.current.innerHTML` only runs on `activeId` change, not on every keystroke.

11. **Font size dropdown doesn't actually change size** → execCommand's `fontSize` only takes values 1–7 (HTML legacy). We work around this by calling execCommand with `7`, then walking the DOM to replace the resulting `<font size="7">` tags with `<span style="font-size: 16px">` (or 13/20/26).

## How to make changes

User's workflow: edit App.jsx locally → `git add . && git commit -m "..." && git push` → Vercel auto-redeploys in ~30 seconds. They run on Windows (cmd, not bash).

When proposing edits:
- Give specific line numbers and exact replacement code blocks rather than describing changes abstractly
- User is comfortable copy-pasting into VS Code but not deeply experienced with React internals — explain *why* a change works, not just what to do
- Before making non-trivial changes, verify a clean Vite production build mentally (or actually run one if you have a sandbox)
- For any panel that hits Supabase, follow the existing pattern: fetch in `useEffect`, optimistic UI updates with rollback on error, debounce writes if they happen on every keystroke

## Voice and design principles when editing copy

If asked to write new panel descriptions, taglines, or marketing copy, match the existing tone:
- Lowercase-feeling even when capitalized; soft, not punchy
- Sensory and spatial words: "quiet," "corner," "room," "small," "slow"
- Avoid: hustle vocabulary, productivity-jargon, exclamation points, AI-coded phrases like "leverage," "unlock," "supercharge"
- Short sentences. Fragments are fine.
- Em-dashes used sparingly, only where they earn it

Privacy copy says **"Yours, encrypted"** — "Your data lives in your account, encrypted in transit and at rest. Export anytime, delete in one tap." Don't revert to "stays on device" wording — data does sync to Supabase now.

## Things NOT to do without asking

- Don't suggest switching to Next.js, Tailwind, or another framework — Vite + inline styles is a deliberate choice and the site works
- Don't propose splitting App.jsx into multiple files unless explicitly asked
- Don't add tracking, analytics, or third-party scripts without confirmation
- Don't change the warm orange palette or the Fraunces/Inter typography pairing — these are core to the brand
- Don't make Ember "smarter" with an LLM — it's intentionally scripted right now
- Don't add a charting library (Recharts, Chart.js, etc.) — the workout chart is hand-rolled SVG and matches the illustrated aesthetic
- Don't add a rich text editor library (Tiptap, Slate, etc.) — the journal uses contentEditable + execCommand intentionally
- Don't revert any of the z-index trickery on `.grain` (see gotcha #9)
- Don't store sensitive data anywhere except Supabase, and don't add new tables without RLS policies
