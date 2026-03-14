import './styles.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { grohFde1Room } from './config/grohFde1.js';
import { createHomeView } from './lib/cameraPresets.js';
import { createSurfaceSpecs, inferRoomDimensions } from './lib/roomGeometry.js';

const room = inferRoomDimensions(grohFde1Room);
const homeView = createHomeView(room);

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="viewer-shell">
    <canvas class="viewer-canvas" aria-label="3D room view of the Groh-FDE1 mural package"></canvas>
    <div class="viewer-toolbar">
      <button class="home-button" type="button">Home</button>
      <p class="viewer-status" data-state="loading">Loading room...</p>
    </div>
  </main>
`;

const canvas = app.querySelector('.viewer-canvas');
const homeButton = app.querySelector('.home-button');
const status = app.querySelector('.viewer-status');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas,
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 160);
camera.up.set(0, 1, 0);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.58;
controls.zoomSpeed = 0.82;
controls.panSpeed = 0.75;
controls.minDistance = 5;
controls.maxDistance = 34;
controls.minPolarAngle = 0.08;
controls.maxPolarAngle = Math.PI - 0.06;

const roomGroup = new THREE.Group();
scene.add(roomGroup);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(room.width, room.depth),
  new THREE.MeshBasicMaterial({
    color: new THREE.Color('#e7dfd0'),
  }),
);
floor.rotation.x = Math.PI / 2;
floor.position.set(0, 0, 0);
roomGroup.add(floor);

const loader = new THREE.TextureLoader();
const surfaceSpecs = createSurfaceSpecs(room);

const edgeInset = 5.5;
const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();
const targetUp = new THREE.Vector3(0, 1, 0);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clampCameraPosition = () => {
  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    -room.width / 2 - edgeInset,
    room.width / 2 + edgeInset,
  );
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.2, room.height + 8.5);
  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    -room.depth / 2 - edgeInset,
    room.depth / 2 + edgeInset * 1.4,
  );
};

const setHomeView = (snap = false) => {
  targetPosition.set(homeView.position.x, homeView.position.y, homeView.position.z);
  targetLookAt.set(homeView.lookAt.x, homeView.lookAt.y, homeView.lookAt.z);
  targetUp.set(homeView.up.x, homeView.up.y, homeView.up.z);
  if (snap || reduceMotion) {
    camera.position.copy(targetPosition);
    camera.up.copy(targetUp);
    controls.target.copy(targetLookAt);
    clampCameraPosition();
    controls.update();
  }
};

homeButton.addEventListener('click', () => setHomeView());

const resize = () => {
  const { clientWidth, clientHeight } = canvas;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
};

window.addEventListener('resize', resize);

const applyTextureSettings = (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
};

const buildRoom = async () => {
  const loadedSurfaces = await Promise.all(
    surfaceSpecs.map(async (surface) => ({
      ...surface,
      texture: applyTextureSettings(await loader.loadAsync(surface.textureUrl)),
    })),
  );

  loadedSurfaces.forEach((surface) => {
    const geometry = new THREE.PlaneGeometry(surface.size.width, surface.size.height);
    const material = new THREE.MeshBasicMaterial({ map: surface.texture });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(surface.position.x, surface.position.y, surface.position.z);
    mesh.rotation.set(surface.rotation.x, surface.rotation.y, surface.rotation.z);
    mesh.name = surface.id;

    roomGroup.add(mesh);
  });
};

const renderLoop = () => {
  requestAnimationFrame(renderLoop);

  if (!reduceMotion) {
    camera.position.lerp(targetPosition, 0.08);
    camera.up.lerp(targetUp, 0.08);
    controls.target.lerp(targetLookAt, 0.065);
  }

  clampCameraPosition();
  controls.update();
  renderer.render(scene, camera);
};

const init = async () => {
  resize();
  setHomeView(true);

  try {
    await buildRoom();
    status.textContent = 'Room loaded';
    status.dataset.state = 'ready';
    document.body.dataset.ready = 'true';
  } catch (error) {
    status.textContent = 'Could not load room';
    status.dataset.state = 'error';
    throw error;
  }

  renderLoop();
};

init();
