# Groh-FDE1 Room View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a lightweight Three.js mural viewer for Groh-FDE1 using the five supplied JPG exports.

**Architecture:** Create a small Vite app with a single Three.js scene. Store mural metadata in a config module, derive the room footprint from the image ratios, render five inward-facing planes, and expose preset camera views for mural review.

**Tech Stack:** Vite, Three.js, vanilla JavaScript, Vitest

---

### Task 1: Scaffold the viewer app

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/styles.css`

**Step 1: Write the failing test**

Create the base test command in `package.json` before implementation so the project has an executable test target.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: fail because the test runner and test files do not exist yet.

**Step 3: Write minimal implementation**

Add the Vite app shell, dependencies, and startup scripts.

**Step 4: Run test to verify it passes**

Run: `npm install && npm test -- --run`
Expected: Vitest starts successfully and reports no tests or the single placeholder test file.

**Step 5: Commit**

```bash
git add package.json index.html src/main.js src/styles.css
git commit -m "chore: scaffold Groh-FDE1 room viewer"
```

### Task 2: Add inferred room geometry with tests

**Files:**
- Create: `src/config/grohFde1.js`
- Create: `src/lib/roomGeometry.js`
- Create: `src/tests/roomGeometry.test.js`

**Step 1: Write the failing test**

Add tests that verify:

- long wall width is derived from `2560 / 841`
- short wall width is derived from `1534 / 868`
- room footprint ratio matches the ceiling ratio within a small tolerance
- the wall ordering maps long and short walls correctly

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tests/roomGeometry.test.js`
Expected: FAIL because the geometry helpers do not exist yet.

**Step 3: Write minimal implementation**

Create the mural config module and helper functions that return normalized room dimensions and wall metadata.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tests/roomGeometry.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/config/grohFde1.js src/lib/roomGeometry.js src/tests/roomGeometry.test.js
git commit -m "feat: add inferred room geometry"
```

### Task 3: Render the room and camera presets

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Create: `src/lib/cameraPresets.js`

**Step 1: Write the failing test**

Add a focused test for the camera preset metadata so each preset targets a valid room face and the ceiling preset points upward.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tests/roomGeometry.test.js`
Expected: FAIL because the preset data is missing or incomplete.

**Step 3: Write minimal implementation**

Create the Three.js scene, load the mural textures, place the five planes, add orbit controls, and wire the preset buttons.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tests/roomGeometry.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/main.js src/styles.css src/lib/cameraPresets.js src/tests/roomGeometry.test.js
git commit -m "feat: render Groh-FDE1 room view"
```

### Task 4: Verify the build and polish the review UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `README.md`

**Step 1: Write the failing test**

Add or update a small test assertion for the room summary metadata shown in the UI.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tests/roomGeometry.test.js`
Expected: FAIL because the summary metadata is not exposed yet.

**Step 3: Write minimal implementation**

Polish the overlay, make the canvas responsive, and document the local run commands in `README.md`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run && npm run build`
Expected: PASS and a successful production build.

**Step 5: Commit**

```bash
git add src/main.js src/styles.css README.md src/tests/roomGeometry.test.js
git commit -m "docs: document Groh-FDE1 room viewer"
```
