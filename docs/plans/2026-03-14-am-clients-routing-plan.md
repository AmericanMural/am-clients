# AM Clients Routed Presentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert Diego's `am-clients` repo into a small routed app with a minimal root page and a dedicated `/projects/groh-fde1` presentation route.

**Architecture:** Keep Vite and use a lightweight in-app router keyed off `window.location.pathname`. Move the existing Groh-FDE1 viewer into reusable modules and render route-specific pages from a shared app entry.

**Tech Stack:** Vite, Three.js, vanilla JavaScript, Vitest

---

### Task 1: Add route resolution tests

**Files:**
- Create: `src/lib/router.js`
- Create: `src/tests/router.test.js`

**Step 1: Write the failing test**

Add tests that verify:

- `/` resolves to the home page
- `/projects/groh-fde1` resolves to the Groh project page
- unknown paths resolve to a fallback page

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tests/router.test.js`
Expected: FAIL because the router module does not exist yet.

**Step 3: Write minimal implementation**

Create a small route resolver that maps the current pathname to a page id and optional project slug.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tests/router.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/router.js src/tests/router.test.js
git commit -m "feat: add app route resolution"
```

### Task 2: Refactor the Groh viewer into route-friendly modules

**Files:**
- Create: `src/pages/renderHomePage.js`
- Create: `src/pages/renderProjectPage.js`
- Modify: `src/main.js`
- Modify: `src/config/grohFde1.js`

**Step 1: Write the failing test**

Add a focused router test or page-config test that verifies the Groh project slug resolves to the project renderer.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tests/router.test.js`
Expected: FAIL because the page mapping does not exist yet.

**Step 3: Write minimal implementation**

Split the app into route renderers, keep `/` minimal, and make `/projects/groh-fde1` mount the existing viewer.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tests/router.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/main.js src/pages/renderHomePage.js src/pages/renderProjectPage.js src/config/grohFde1.js src/tests/router.test.js
git commit -m "feat: render routed client pages"
```

### Task 3: Preserve the 3D viewer behavior on the project route

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `src/lib/cameraController.js`
- Modify: `src/tests/cameraController.test.js`
- Modify: `src/tests/roomGeometry.test.js`

**Step 1: Write the failing test**

Add or adjust tests so the current Home reset and free-navigation behavior remain intact after the routing refactor.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL because the route refactor temporarily breaks assumptions in the viewer code.

**Step 3: Write minimal implementation**

Reconnect the current Three.js viewer to the project page and keep the fixed camera, ceiling orientation, and Home-button behavior.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/main.js src/styles.css src/lib/cameraController.js src/tests/cameraController.test.js src/tests/roomGeometry.test.js
git commit -m "fix: preserve Groh viewer behavior on routed page"
```

### Task 4: Update docs and verify the routed app

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

No new automated test required if route coverage already exists. Use the route tests plus build verification.

**Step 2: Run test to verify behavior before docs**

Run: `npm test -- --run && npm run build`
Expected: PASS

**Step 3: Write minimal implementation**

Document the route structure and local run instructions in `README.md`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run && npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: describe routed client app"
```
