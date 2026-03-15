# am-clients Memory

Running memory for the American Mural client management system. Any tool (Claude Code, Codex, OpenClaw) should read this at session start and append to it after making changes.

---

## 2026-03-14

**What changed:**
- Gallery restructured: single-column layout, original aspect ratios, max-width 40rem, full-width scrollbar, border-top separator
- Slider restructured: inner wrapper with border-top separator matching gallery
- 3D view: centered "Click and drag to look around" hint with HandTap icon, fades on interaction
- System theme detection: defaults to user's OS preference (prefers-color-scheme), falls back to light
- Dark mode buttons made solid (except 3D nav which stays transparent in both themes)
- Borders globally more visible (line-soft/line-strong opacity increased)
- Home page: removed project link, updated description
- Slider prev/next buttons stay compact on mobile (removed full-width override)

**What matters next:**
- Deployed on Cloudflare Pages at https://am-clients.pages.dev/ (auto-deploys from main)
- Security for the app (mentioned but deferred)
- 3D hint uses phosphor-astro HandTap icon

## 2026-03-15

**What changed:**
- Performance: Lighthouse 64 → ~91 (images WebP via Astro `<Image>`, Three.js code-split with dynamic import, CSS inlined, LCP image + font preloaded)
- Added `public/robots.txt` — `Disallow: /` (private client site, no crawling)
- `astro.config.mjs`: `inlineStylesheets: "always"`
- `BaseLayout.astro`: preloads Montserrat latin woff2 + optional hero image
- `[slug].astro`: resolves hero image via `getImage()` for preload hint
- `ProjectPresentation.astro`: uses `<Image>` component (format webp, quality 85) instead of raw `<img>`
- `project-presentation.ts`: Three.js + OrbitControls loaded via dynamic `import()` only when 3D tab clicked (initial JS 526KB → 30KB)

**What matters next:**
- LCP (~1.8–3.8s under Lighthouse throttling) is the remaining perf ceiling — driven by hero image size, acceptable given quality requirements
- If buttons stop working in dev, clear Vite cache: `rm -rf node_modules/.vite`
- Three.js chunk warning (>500KB) is expected — it's lazy-loaded so doesn't affect initial page
