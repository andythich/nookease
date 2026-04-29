# NookEase — Project Context

## What this is

NookEase is a calm, warm-toned wellness companion app at **nook-ease.com**. It's evolved from a teaser landing page into a working app: visitors see a marketing carousel, sign up with email or Google, and get four working features (Planner, Journal, Workout log, Notecards). Diary still shows a marketing teaser.

Built with Vite + React, deployed on Vercel, code lives at `github.com/andythich/nookease`. Authentication and per-user data sync live in Supabase.

The aesthetic is intentional and worth preserving:
- Warm beige background (`#F6F1EA`) with a film grain overlay (now at `z-index: -1`, true background layer)
- Burnt orange accent palette (`#FF7A45` and warm variants, with `#D94A20` for primary CTAs)
- Fraunces (italic serif) for headings, Inter Tight for body text
- Quiet, slow, "small chunks of daily life" voice — never loud, never urgent
- A companion character named **Ember** (scripted decision-tree chat, not LLM-backed) that appears bottom-corner

## Current panels

The homepage has an auto-scrolling carousel of feature panels. There are five:

1. **Planner** — "Order from the everyday" — INTERACTIVE (weekly grid)
2. **Journal** — "A page that listens" — INTERACTIVE (iPhone-Notes-style with rich text)
3. **Workout log** — "Small motions, stacked" — INTERACTIVE (cardio logger + chart, weight logger + chart)
4. **Notecards** — "Ideas, one at a time" — INTERACTIVE (Quizlet-style, with CSV import)
5. **Diary** — "The record of your days" — still marketing teaser

Click a Planner / Journal / Workout / Notecards panel while logged out → bounced to login. Diary still goes to the read-only `FeaturePage` teaser.

## Tech stack

- **Framework:** React 18 + Vite (`npm create vite@latest` template)
- **Styling:** All inline styles + a single `<GlobalStyles />` component in App.jsx with a `<style>` tag. No Tailwind, no CSS modules, no styled-components.
- **State:** Plain React `useState` + `useEffect` + `useRef`. No Redux, no Zustand.
- **Routing:** Single-page, no React Router. Page switching is done via a `useState` view selector.
- **Auth + Database:** Supabase (`@supabase/supabase-js`). Email/password and Google OAuth. Data syncs per user via Row Level Security (RLS).
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Domain:** nook-ease.com (also www.nook-ease.com), DNS pointed at Vercel, free SSL via Vercel
- **Repo:** `github.com/andythich/nookease`, single `main` branch
- **Favicon:** Custom NookEase house mark in `public/favicon.svg` (replaced the default Vite lightning bolt)

## Project structure

```
nookease/
├── index.html              ← Vite entry, references /src/main.jsx and /favicon.svg
├── package.json            ← includes @supabase/supabase-js
├── vite.config.js
├── vercel.json             ← explicit Vercel config (framework: vite, etc.)
├── .env.local              ← Supabase URL + anon key, NOT committed (in .gitignore)
├── public/
│   └── favicon.svg         ← NookEase house mark (orange dot inside dark brown house)
└── src/
    ├── main.jsx            ← React entry, mounts App
    ├── App.jsx             ← THE WHOLE APP, ~4,200 lines
    ├── supabase.js         ← shared Supabase client (uses VITE_SUPABASE_* env vars)
    ├── index.css           ← emptied/minimal (Vite default removed)
    └── assets/
```

**Important:** App.jsx is currently a single ~4,200-line monolith. User has been told this should eventually be split into separate component files but hasn't done so yet. Don't propose splitting unless asked.

## Important file landmarks in App.jsx

Line numbers drift with edits — use them as a "look around here" hint, not exact addresses. Function names are stable.

- **Top of file:** `useAuth` hook — wraps `supabase.auth.getSession()` and `onAuthStateChange`
- **PANELS array** — single source of truth for the homepage carousel
- **GlobalStyles component** — `<style>` block (font imports, grain overlay, keyframes, base resets)
- **Grain layer styles** — `.grain` parent gets `position: relative; z-index: 0` to create a stacking context, `.grain::before` is at `z-index: -1` so it sits below ALL content
- **Nav** — receives `user` prop, conditionally shows "Log in / Get Early Access" (logged out) vs "hi, [name] / Sign out" (logged in)
- **PanelIllustration** — switch on `id` returning custom SVG per panel
- **HomePage** — stateful component (holds `filmOpen` for the Watch film modal). The modal is `<video src="/nookease-film.mp4" autoPlay controls playsInline>` inside a fixed dark backdrop. Backdrop click closes; the inner video container uses `e.stopPropagation()` so clicks on the video don't dismiss. `playsInline` is required for iOS Safari (otherwise it auto-fullscreens on play). The video file must exist at `public/nookease-film.mp4` — if it 404s, the modal opens but shows a black box.
- **Carousel** — JS-driven horizontal scroller with mouse wheel, click+drag, and touch swipe support. Uses Pointer Events (one code path for mouse + touch). Panels are tripled (`[...PANELS, ...PANELS, ...PANELS]`) and the scroller is centered on the middle copy; a `requestAnimationFrame` loop nudges `scrollLeft` forward at ~30px/s and snaps the position back by `scrollWidth/3` when the user crosses an edge copy, giving seamless wrap-around in either direction. Auto-advance pauses while hovered/dragging and for ~1.2s after a wheel or drag ends. A 5px movement threshold on pointerup suppresses the click so dragging doesn't open a panel. `touch-action: pan-y` on the scroller lets vertical page scroll work on mobile while horizontal swipes drive the carousel.
- **LoadingNote and PanelHeader** — shared by interactive panels
- **PlannerPage** — fetches/inserts/deletes against `planner_events` table
- **JournalPage** — fetches/inserts/updates/deletes against `journal_pages` table; uses `contentEditable` + `document.execCommand` for rich text (no editor library); 600ms debounced saves
- **WorkoutPage** — fetches/inserts/deletes against `workout_sessions` and `weight_logs` tables; hand-rolled inline SVG charts (no Recharts) for both cardio metrics and weight
- **NotecardsPage** — three internal views (`list` | `detail` | `study`); fetches/inserts/updates/deletes against `notecard_sets` and `notecards` tables; supports CSV import
- **NotecardsList / NotecardsDetail / NotecardsStudy** — sub-components for each view
- **TagPill / CardRow** — small reusable sub-components for Notecards
- **FeaturePage** — marketing teaser for Diary (no auth required)
- **LoginPage** — Supabase email/password + Google OAuth + forgot password
- **Companion (Ember):** scripted, choice-based. Each "node" has text and 2–4 option buttons. Not AI-backed.

## Mobile responsiveness

The site is otherwise styled inline, but a handful of components have `className` hooks specifically for a `@media (max-width: 768px)` block in `GlobalStyles`. Without these, things crashed into each other on phones. **If you remove a className thinking it's unused, you'll silently break mobile layout.** The classes and what they do:

| Class                  | On                              | Mobile behavior                                       |
| ---------------------- | ------------------------------- | ----------------------------------------------------- |
| `site-nav`             | `<nav>` element                 | Tighter padding (16/20 instead of 24/40)              |
| `nav-actions`          | The right-side action group     | Smaller gap                                           |
| `nav-index`            | The "Index" / "1 / 5" pill      | `display: none` (saves horizontal space)              |
| `nav-cta-secondary`    | All outlined nav buttons        | Smaller padding + font                                |
| `nav-greeting`         | "hi, [name]" span               | `display: none`                                       |
| `home-hero`            | Hero outer wrapper              | Tighter padding                                       |
| `home-hero-row`        | Hero flex row                   | Smaller gap                                           |
| `home-hero-copy`       | Right-column copy block         | Full-width, no bottom padding                         |
| `home-hero-cta-row`    | Hero buttons row                | `flex-wrap: wrap`, buttons stretch                    |
| `home-section-label`   | "— 02 · Seven rooms" row        | Stacks vertically                                     |
| `home-footer`          | Bottom strip                    | Stacks vertically                                     |
| `home-footer-quote`    | The quote text                  | Smaller font                                          |
| `ember-launcher`       | Floating Ember button           | Shrinks to 52×52 and tucks closer to corner           |
| `carousel-scroller`    | The carousel scroll container   | Hides the scrollbar (`::-webkit-scrollbar`)           |

These classes are applied in addition to inline styles, so adding more inline styles doesn't break the responsive overrides — but removing the className severs the hook.

## Watch film modal + nookease-film

The "Watch film" button on the home page hero opens a modal that plays `public/nookease-film.mp4`. The MP4 itself was generated by a separate HyperFrames project (lives outside this repo, in `~/Downloads/nookease-film/` or wherever the user kept it). To re-render or tweak the film:

```
cd nookease-film
npx hyperframes preview     # opens studio at localhost:3002 for scrubbing/editing
npx hyperframes render -o nookease-film.mp4
```

Requires Node 22+ and FFmpeg installed and on PATH. The rendered MP4 then gets copied into NookEase's `public/nookease-film.mp4` (overwriting the previous one). It's an editorial 25s teaser at 1920×1080, brand-matched to NookEase (Fraunces + Inter Tight, beige + burnt orange, quiet voice).


## Supabase setup (already done)

### Tables (all with Row Level Security enabled)

```sql
planner_events    (id, user_id, day, start_time, end_time, title, created_at)
journal_pages     (id, user_id, title, html, updated_at, created_at)
workout_sessions  (id, user_id, date, calories, miles, minutes, created_at)
weight_logs       (id, user_id, date, weight, created_at)
notecard_sets     (id, user_id, title, description, tags[], created_at, updated_at)
notecards         (id, set_id, user_id, front, back, position, created_at)
```

Each table has a single RLS policy: `auth.uid() = user_id` for both `using` and `with check`. **If a row insert ever fails with "new row violates row-level security policy," the policies got dropped — re-run them.**

`notecards.set_id` has `on delete cascade` so deleting a set automatically removes its cards. There's also an index on `notecards(set_id, position)` for ordered fetches.

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
- Carousel supports mouse wheel, click+drag, and touch swipe in addition to auto-advance
- Sign up / log in / sign out / forgot password
- Planner, Journal, Workout, Notecards all read/write from Supabase per user
- Logged-out users hitting interactive panels get bounced to login
- Grain texture sits below all interactive UI
- Notecards CSV import (file picker → preview modal → bulk insert via single Supabase call)
- Mobile-responsive layout (≤768px breakpoint) — nav tightens, hero CTAs wrap, footer/section labels stack
- "Watch film" button on home hero opens a modal that plays `public/nookease-film.mp4`

## Notecards feature details

The Notecards page has three internal views, switched via local state:

- **List view** — grid of set tiles + tag filter pills; "+ New set" tile is always first
- **Detail view** — editable header (title, description, tags), add-card row, inline-editable card list, "Import CSV" button, "Delete set" button, "Study →" CTA
- **Study view** — flip mode (click to reveal back) and quiz mode (self-graded with "Got it ✓" / "Review again"); shuffled per session; quiz mode shows a session-summary screen when all cards are graded

### CSV import details

- File picker accepts `.csv` files up to 5 MB
- Hand-rolled CSV parser handles quoted fields with commas, escaped quotes (`""`), blank rows, and optional `front,back` header row
- Preview modal shows count, filename, and first 3 cards before user confirms
- Bulk insert via a single `.insert([...rows]).select()` Supabase call
- Optimistic UI: cards appear immediately on confirm
- Inline success ("Added 247 cards.") or error message persists in the header until dismissed

### CSV format expected

```csv
front,back
"What is the question?","The answer."
"Question with, a comma","Answer."
```

Header row optional. Empty rows skipped.

### Tags

- Type a word in the tags input, hit Space/Enter/Comma to commit it as a pill
- Backspace on empty input removes the last tag
- Tags are normalized to lowercase, alphanumeric + hyphens only
- The list view's tag filter bar appears only when at least one set has at least one tag

## What doesn't yet (future work the user has flagged interest in)

- **Diary** still shows a marketing teaser — needs to be built out as an interactive feature
- **"Get Early Access" button** currently goes to login — could collect emails for a waitlist instead
- **Apple OAuth** was removed from the login page (we didn't configure Apple Developer)
- **Ember** is scripted; user may eventually want LLM-backed conversation (separate build)
- **Code organization:** monolithic App.jsx should be split into `src/components/Nav.jsx`, `Companion.jsx`, etc.
- **Export/delete account flows:** privacy copy promises "Export anytime, delete in one tap" — not actually implemented yet
- **Notecards: drag-to-reorder cards** — currently they sort by `position` but there's no UI to reorder

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

### Notecards

12. **Possible CSV import quirk** — user reported being unable to import a second CSV into the same set on at least one occasion. Cause not yet identified. Suspects: file input value not resetting between picks (currently `e.target.value = ''` after pick), browser caching the file input state, or a silent Supabase RLS edge case. If it recurs, ask user to open DevTools console (F12) and check for errors before/during the second import. Workaround: combine multiple CSVs into one before importing, or refresh the page between imports.

13. **Set tags can disappear if user types weirdly** — the tag input strips everything that isn't `[a-z0-9-]`. So uppercase becomes lowercase, but punctuation/spaces just get stripped silently. Worth flagging if a user is confused why their tag isn't being saved.

14. **Multi-line card content (e.g. multiple-choice options)** — the card-face `<p>` in the Study view uses `whiteSpace: 'pre-line'` so newline characters in imported CSV cells render as actual line breaks. It's also `textAlign: 'left'` and uses a smaller `clamp(20px, 2.6vw, 30px)` font (instead of the original 28–42px) so a question with four A/B/C/D options on separate lines fits on one card without overflow. The CSV importer already preserves newlines inside quoted cells; the rendering CSS is the part that makes them visible. **Don't revert these to centered / 42px / `white-space: normal`** without considering MC-style cards — they'll collapse back into a single paragraph.

### Carousel (the JS-driven one)

15. **Why panels are tripled, not doubled** — when only auto-advancing forward, doubling is enough (you only ever need a buffer to the right). But the new carousel lets the user drag/wheel *backward* too, so a buffer copy to the left is also needed. With three copies and the scroller centered on the middle one, there's always a full panel-set's worth of room in either direction before the wrap snap kicks in. **Don't change this back to doubling — backward dragging will hit a hard edge.**

16. **`touch-action: pan-y` is load-bearing on mobile** — without it, the moment a user touches the carousel, the browser locks them into either page-scroll or carousel-scroll for the duration of that touch (whichever direction won the first few pixels of movement). With `pan-y`, vertical drags scroll the page and horizontal drags scroll the carousel, which is what users expect.

17. **The 5px click-suppression threshold matters** — without it, every drag would open whichever panel happened to be under the pointer when released. `handleSelect` bails if `dragRef.current.moved > 5`. If panel clicks stop working entirely, suspect this — either the threshold is misset, or `moved` isn't being reset to 0 on pointerdown (then every click after a drag silently fails).

18. **`onWheel` only hijacks vertical wheel motion** — guarded by `Math.abs(e.deltaY) > Math.abs(e.deltaX)`. This lets trackpad horizontal-swipe fall through to the browser's default behavior. If wheel scrolling on the carousel ever stops working on a mouse, check that this condition is still inverted correctly (it should be `deltaY > deltaX`, not the other way around).

19. **The carousel is fragile and not worth "improving"** — during one debugging session, a small CSS tweak to the unrelated notecard renderer accidentally led to a multi-hour spiral of carousel "fixes" (switching `useState` to `useRef` for hover, adding window-level pointerup listeners, swapping mouse events for pointer events, adding blur/document pointerleave safety nets). All were attempts to solve a nonexistent bug. The carousel was working fine; the multi-line cards were a separate, simpler problem (gotcha #14). The carousel was eventually rolled back to its known-good state at commit `97378b5`. **Lesson: if asked to fix something specific (e.g. notecard rendering), don't also refactor the carousel "while you're in there." It is genuinely working; leave it alone.** If the carousel ever does need to change, see gotcha #20 below before debugging.

20. **Diagnosing a "broken" carousel — read this before changing anything** — false-positive bug reports are easy here because:
   - Vite hashes bundle filenames by content, so a fresh deploy can produce the *same* `index-XXXX.js` filename if the source change was minor; this looks like "the deploy didn't take" but didn't.
   - Vite's minifier mangles local variable names (`hoveredRef` → `o`), so grepping the production bundle for source-level identifiers returns false negatives. Use class names, string literals, or method names like `setPointerCapture` for reliable bundle inspection.
   - Multiple components in App.jsx use `onMouseEnter`/`onMouseLeave` for visual hover effects (PanelCard, nav buttons, etc.). Searching the bundle for `onMouseEnter` will return `true` even if the carousel itself doesn't have one.
   - The rAF loop's apparent "freeze" can be from `hoveredRef` getting stuck `true` when `mouseleave` fails to fire (e.g. user alt-tabs or focus moves to DevTools mid-hover). If diagnosing, dump the React fiber refs via the carousel's parent `__reactFiber*` key — `hoveredRef.current === true` while the cursor isn't on the page is the smoking gun. But again: this only matters if you've already made changes to the carousel. The original code at `97378b5` doesn't have this problem because the original `[hovered]` useState behavior, while imperfect, hasn't caused user-visible issues.

### Modal / video

21. **`playsInline` on the Watch film modal video is required** — without it, iOS Safari will try to take the video fullscreen the instant it autoplays, which breaks the modal experience. Don't remove this attribute.

22. **`e.stopPropagation()` on the modal's inner div** — clicks on the video element bubble up. Without `stopPropagation`, every click on the video controls (play/pause, seek bar) closes the modal. Don't remove the wrapper div or its handler.

23. **The video file is not in the repo** — `public/nookease-film.mp4` exists in production and locally but is NOT the kind of thing to regenerate on a whim. Re-rendering means going to the separate HyperFrames project, running `npx hyperframes render`, and copying the new MP4 in. (See "Watch film modal + nookease-film" section above.) If git starts complaining about file size on push, the MP4 grew — either trim the film or move it to external hosting (Cloudflare R2, S3, Vercel Blob) and update the `<video src>`.

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

Examples of in-tone microcopy:
- Empty state: "no sets yet. let's make one." (not "Get started!")
- Description placeholder: "add a quiet note about this set…" (not "Description (optional)")
- Quiz perfect run: "a clean run. set it down and come back tomorrow."
- Loading: "gathering your things…" (not "Loading...")
- Auth loading: "opening the door…"
- Planner empty: "a quiet week. add your first block above."
- Workout empty: "log a session above to see the curve."

Privacy copy says **"Yours, encrypted"** — "Your data lives in your account, encrypted in transit and at rest. Export anytime, delete in one tap." Don't revert to "stays on device" wording — data does sync to Supabase now.

## Things NOT to do without asking

- Don't suggest switching to Next.js, Tailwind, or another framework — Vite + inline styles is a deliberate choice and the site works
- Don't propose splitting App.jsx into multiple files unless explicitly asked
- Don't add tracking, analytics, or third-party scripts without confirmation
- Don't change the warm orange palette or the Fraunces/Inter typography pairing — these are core to the brand
- Don't make Ember "smarter" with an LLM — it's intentionally scripted right now
- Don't add a charting library (Recharts, Chart.js, etc.) — the workout chart is hand-rolled SVG and matches the illustrated aesthetic
- Don't add a rich text editor library (Tiptap, Slate, etc.) — the journal uses contentEditable + execCommand intentionally
- Don't add a CSV parsing library (Papa Parse, etc.) — the Notecards importer hand-rolls a parser that handles quoted fields, escaped quotes, and blank rows in ~25 lines
- Don't revert any of the z-index trickery on `.grain` (see gotcha #9)
- Don't revert the Carousel to a CSS-keyframe animation — interactivity (wheel/drag/swipe) and wrap-around require imperative scroll control. The old `@keyframes scroll-x` rule is gone; if you need to slow the auto-advance, change `SPEED_PX_PER_SEC` in the Carousel component.
- Don't remove the mobile-responsive className hooks (`site-nav`, `home-hero`, etc.) — they look unused next to inline styles but they wire up the `@media (max-width: 768px)` block in GlobalStyles. See "Mobile responsiveness" section.
- Don't store sensitive data anywhere except Supabase, and don't add new tables without RLS policies
- **Don't fix things that aren't broken.** When asked to make a focused change (e.g. "make my notecards render multi-line content"), make *only* that change. Don't refactor surrounding code "while you're in there," don't preemptively address possible bugs that the user didn't report, and don't restructure component state because something looks fragile. Each speculative edit is another chance to introduce a real bug while solving an imaginary one. See gotcha #19 for a concrete example of how this went sideways.
- **When you can't reproduce a bug after several attempts, offer to roll back rather than continue patching.** If a debugging session has gone through 3+ rounds of "try this fix → didn't work → try this fix" without progress, the right move is to ask the user for the last known-good commit (`git show <hash>:src/App.jsx > backup.jsx`) and apply *only* the originally-requested change to that baseline. A clean rollback + minimal patch is almost always faster than continuing to chase a regression you may have caused.
