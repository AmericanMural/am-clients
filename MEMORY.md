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
