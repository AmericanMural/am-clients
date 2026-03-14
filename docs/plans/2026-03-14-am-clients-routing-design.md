# AM Clients Routed Presentation Design

**Goal:** Turn Diego's `am-clients` repo into the actual client-facing app by keeping `/` minimal and serving the Groh-FDE1 presentation from `/projects/groh-fde1`.

## Context

- The current repo contains a working standalone Three.js mural viewer.
- The client-facing `/projects/groh-fde1` URL the user checked was coming from a different worktree, not this repo.
- This repo is now the source of truth.
- The root route should remain intentionally sparse and should not link into the project pages.

## Route Structure

- `/`
  - Minimal holding page
  - Text only, such as `AM Client Access`
  - No project links or extra marketing copy
- `/projects/groh-fde1`
  - Full Groh-FDE1 presentation page
  - Includes the current 3D room view
  - Leaves room for other viewing modes on the same page

## Chosen Approach

Use a lightweight client-side router inside the existing Vite app.

Why:

- Keeps the repo simple
- Reuses the working Three.js viewer
- Avoids a framework migration
- Supports future routes like `/projects/<slug>` without rebuilding from scratch

## App Architecture

- Replace the current single-page `src/main.js` bootstrapping with a small route-aware app shell.
- Split the UI into:
  - `HomePage`
  - `ProjectPage`
  - `GrohFde1Viewer`
- Keep room geometry, camera behavior, and project asset config in separate modules.

## Project Page Design

The Groh page should feel presentation-ready rather than like a developer demo.

- Main emphasis stays on the mural viewer.
- A compact title and mode-switch area can live outside the canvas.
- The current free navigation behavior and Home reset remain.
- The page should be able to add non-3D modes later without rewriting the route structure.

## Root Page Design

- Very minimal
- No navigation list
- No CTA to the Groh page
- Plain branded access screen only

## Routing Behavior

- The app reads `window.location.pathname`.
- `/` renders the minimal access page.
- `/projects/groh-fde1` renders the project presentation.
- Unknown routes can render a simple not-found state or fall back to the minimal root treatment.

## Testing

- Add route-resolution tests for `/` and `/projects/groh-fde1`.
- Keep the existing geometry and camera tests.
- Verify the build still succeeds.

## Non-Goals

- No framework migration
- No CMS or content collection system
- No public projects index
- No extra navigation on the root page
