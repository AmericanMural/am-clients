# am-clients

## Groh-FDE1 Room Viewer

This repo now includes a lightweight Three.js viewer for the `Groh-FDE1` mural package. The room is inferred from the mural JPG ratios:

- `Groh-FDE1-2.jpg` and `Groh-FDE1-4.jpg` are treated as the long walls.
- `Groh-FDE1-1.jpg` and `Groh-FDE1-3.jpg` are treated as the short walls.
- `Groh-FDE1-ceiling.jpg` defines the room footprint.

The viewer keeps the room simple on purpose. It shows the mural surfaces in a proportional 3D shell, allows free orbit navigation, and includes a single Home reset without trying to model doors, trim, or built-ins as separate geometry.

## Run It

```bash
npm install
npm run dev
```

Open the local Vite URL in your browser.

## Checks

```bash
npm test -- --run
npm run build
```
