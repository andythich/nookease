# NookEase — Project Context

## What this is

NookEase is a calm, warm-toned wellness companion app. The site at **nook-ease.com** is currently a single-page React landing/teaser site that previews the product's features. Built with Vite + React, deployed on Vercel, code lives at `github.com/andythich/nookease`.

The aesthetic is intentional and worth preserving:
- Warm beige background (`#F6F1EA`) with a film grain overlay
- Burnt orange accent palette (`#FF7A45` and warm variants)
- Fraunces (italic serif) for headings, Inter for body text
- Quiet, slow, "small chunks of daily life" voice — never loud, never urgent
- A companion character named **Ember** (scripted decision-tree chat, not LLM-backed) that appears bottom-corner

## Current panels (post-edit)

The homepage has an auto-scrolling carousel of feature panels. As of the latest edits there are five:

1. **Planner** — "Order from the everyday"
2. **Journal** — "A page that listens"
3. **Workout log** — "Small motions, stacked"
4. **Notecards** — "Ideas, one at a time"
5. **Diary** — "The record of your days"

Previous panels that were removed: habits, meals, mood, sleep. The `PanelIllustration` function in App.jsx may still contain dead code blocks for those four (safe to delete, doesn't break anything).

## Tech stack

- **Framework:** React 18 + Vite (`npm create vite@latest` template)
- **Styling:** All inline styles + a single `<GlobalStyles />` component in App.jsx with a `<style>` tag. No Tailwind, no CSS modules, no styled-components.
- **State:** Plain React `useState`. No Redux, no Zustand, nothing fancy.
- **Routing:** Single-page, no React Router. Page switching is done via a `useState` view selector.
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Domain:** nook-ease.com (also www.nook-ease.com), DNS pointed at Vercel, free SSL via Vercel
- **Repo:** `github.com/andythich/nookease`, single `main` branch

## Project structure

```
nookease/
├── index.html              ← Vite entry, references /src/main.jsx
├── package.json
├── vite.config.js
├── vercel.json             ← explicit Vercel config (framework: vite, etc.)
├── public/
└── src/
    ├── main.jsx            ← React entry, mounts App
    ├── App.jsx             ← THE WHOLE APP, ~1400 lines
    ├── index.css           ← emptied/minimal (Vite default removed)
    └── assets/
```

**Important:** App.jsx is currently a single 1,400-line monolith containing PANELS array, GlobalStyles, Nav, PanelCard, PanelIllustration, Carousel, HomePage, FeaturePage, LoginPage, Companion (Ember), and the App default export. User has been told this should eventually be split into separate component files but hasn't done so yet.

## Important file landmarks in App.jsx

- **Lines ~4–61:** `PANELS` array — single source of truth for the homepage carousel
- **Lines ~70–112:** `GlobalStyles` component with the `<style>` block (font imports, grain overlay, keyframes, base resets)
- **Line ~85 (formerly):** `.grain::before { z-index: 1 }` — was changed from `100` to `1` so panels pop above the grain. Nav has `z-index: 50` so it still sits above grain.
- **Lines ~260–370:** `PanelIllustration` — switch on `id` returning custom SVG per panel. New panels (notecards, diary) have illustrations added at the bottom.
- **Lines ~375–400:** Carousel container with `scroll-x` keyframe animation, mask-image fade on edges, pause on hover.
- **Companion (Ember):** scripted, choice-based. Each "node" has text and 2–4 option buttons. Not AI-backed.

## What works

- Site is live at nook-ease.com with valid SSL
- Auto-deploy on push to main works correctly
- Local dev: `cd nookease && npm run dev` → http://localhost:5173
- Carousel, panel click → feature page, Login page, Ember chat all functional

## What doesn't yet (future work the user has flagged interest in)

- **"Get Early Access" button** currently navigates home — does not collect emails. Needs Formspree, ConvertKit, Buttondown, or Supabase form integration.
- **Ember** is scripted; user may eventually want LLM-backed conversation (separate build)
- **Code organization:** monolithic App.jsx should be split into `src/components/Nav.jsx`, `Companion.jsx`, etc.
- **Favicon:** still the default Vite logo in `public/`. Needs replacement with NookEase mark.
- **Git author email** on early commits shows "invalid-email-address" — fixed for future commits via `git config --global user.email`. Old commits unchanged (not worth rewriting history).

## Known gotchas / lessons from initial deploy

These took us a while to debug last time. If something is failing now, check these first:

1. **`vite: command not found` on Vercel** → Install Command isn't running. Fix: keep `vercel.json` in repo root with explicit `installCommand: "npm install"` and `framework: "vite"`. Setting Framework Preset to "Vite" in dashboard also fixes it.

2. **Build completes in 19ms with no output** → Vercel cloned the repo but `package.json` isn't at the root. Means either the wrong folder was pushed, or files are nested under a subfolder. Verify on github.com that `package.json`, `vite.config.js`, `index.html` are at the top level of the repo.

3. **`fatal: Pathspec 'src/main.jsx' is in submodule 'src'`** → A nested `.git` folder inside `src/` made git treat src as a submodule. Fix: `git rm --cached src && rmdir /s /q src\.git && git add src && commit && push`. Verify in github.com that clicking into `src/` shows actual files, not a submodule pointer.

4. **404: NOT_FOUND on nook-ease.com with Vercel logo** → Domain reaches Vercel but no project owns it. Cause: deployment was deleted or domain not attached. Fix: redeploy and re-attach domain in Settings → Domains.

5. **Vite default `index.css` clashes with custom `<GlobalStyles />`** → Either delete the `import './index.css'` line in `main.jsx` or empty the file. The `<GlobalStyles />` component is the styling source of truth.

## How to make changes

User's workflow is: edit App.jsx locally → `git add . && git commit -m "..." && git push` → Vercel auto-redeploys in ~30 seconds. They run on Windows (cmd, not bash).

When proposing edits, give specific line numbers and exact replacement code blocks rather than describing changes abstractly. User is comfortable copy-pasting into VS Code or similar but not deeply experienced with React internals — explain *why* a change works, not just what to do.

## Voice and design principles when editing copy

If asked to write new panel descriptions, taglines, or marketing copy, match the existing tone:
- Lowercase-feeling even when capitalized; soft, not punchy
- Sensory and spatial words: "quiet," "corner," "room," "small," "slow"
- Avoid: hustle vocabulary, productivity-jargon, exclamation points, AI-coded phrases like "leverage," "unlock," "supercharge"
- Short sentences. Fragments are fine.
- Em-dashes used sparingly, only where they earn it

## Things NOT to do without asking

- Don't suggest switching to Next.js, Tailwind, or another framework — Vite + inline styles is a deliberate choice and the site works
- Don't propose splitting App.jsx into multiple files unless explicitly asked (user knows it's monolithic; they'll get to it)
- Don't add tracking, analytics, or third-party scripts without confirmation
- Don't change the warm orange palette or the Fraunces/Inter typography pairing — these are core to the brand
- Don't make Ember "smarter" with an LLM — it's intentionally scripted right now
