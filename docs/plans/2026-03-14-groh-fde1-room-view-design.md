# Groh-FDE1 3D Room View Design

**Goal:** Create a lightweight Three.js viewer that shows the Groh-FDE1 mural package on four walls and one ceiling inside an inferred rectangular room.

## What We Know

- The asset set includes four wall JPGs and one ceiling JPG in `Groh-FDE1/`.
- `Groh-FDE1-2.jpg` and `Groh-FDE1-4.jpg` are the long walls.
- `Groh-FDE1-1.jpg` and `Groh-FDE1-3.jpg` are the short walls.
- The wall image ratios imply a room proportion of about `1.7224`.
- The ceiling image ratio is about `1.7227`, which matches the inferred wall footprint closely enough to treat the exports as a coordinated set.

## Chosen Approach

Build a simple rectangular room with five inward-facing planes:

- long wall A
- long wall B
- short wall A
- short wall B
- ceiling

The viewer will ignore architectural cutouts such as doors, cabinets, and trim as modeled geometry. Those details remain baked into the mural artwork because the purpose of this viewer is mural review, not architectural validation.

## Room Sizing

Use a normalized wall height of `10` world units and derive the footprint from the image ratios:

- long wall width: `10 * (2560 / 841)` = about `30.44`
- short wall width: `10 * (1534 / 868)` = about `17.67`
- ceiling footprint: `30.44 x 17.67`

This keeps all five images in agreement without inventing real-world dimensions.

## Scene Design

- Use a single `PerspectiveCamera`.
- Start the camera inside the room at about eye level and slightly offset from center.
- Use `OrbitControls` with limits that keep the viewer inside the room and reduce clipping.
- Add wall presets for straight-on review and one ceiling preset for looking up.
- Use neutral lighting and mural-first materials so the art stays true to the source JPGs.
- Add a simple matte floor plane to ground the camera visually.

## Rendering Choices

- Load textures with `TextureLoader`.
- Use `SRGBColorSpace`.
- Prefer unlit or near-unlit materials so color stays close to the source images.
- Render inward-facing surfaces by rotating planes into place rather than relying on double-sided materials everywhere.

## Layout And UI

- Full-viewport canvas.
- Small overlay for preset view buttons and a short room summary.
- Responsive layout that keeps controls usable on desktop and tablet.

## Non-Goals

- No modeled doors, millwork, or ceiling penetrations.
- No walkthrough collision system.
- No photoreal lighting.
- No attempt to recover exact field dimensions from the artwork.

## Validation

- Each preset should show the correct wall or ceiling without a flipped texture.
- The room should feel proportionally consistent from free orbit.
- The ceiling should align with the inferred wall footprint.
- The scene should build and run locally with a lightweight toolchain.
