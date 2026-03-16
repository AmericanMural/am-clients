type PresentationRoot = HTMLElement & {
  __presentationCleanup?: () => void;
};

type RoomImage = {
  id: string;
  label: string;
  order?: number;
  src: string;
  width: number;
  height: number;
};

type Room3DConfig = {
  title: string;
  wallHeight: number;
  walls: RoomImage[];
  ceiling?: RoomImage;
};

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const deriveWallWidth = (wall: RoomImage, wallHeight: number) =>
  wallHeight * (wall.width / wall.height);

function cleanupPresentations() {
  document.querySelectorAll<PresentationRoot>("[data-presentation]").forEach((root) => {
    root.__presentationCleanup?.();
  });
}

async function initializeRoom3D(root: HTMLElement) {
  const container = root.querySelector<HTMLElement>("[data-room-3d]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-room-3d-canvas]");
  const homeButton = root.querySelector<HTMLButtonElement>("[data-room-3d-home]");
  const zoomInBtn = root.querySelector<HTMLButtonElement>("[data-room-3d-zoom-in]");
  const zoomOutBtn = root.querySelector<HTMLButtonElement>("[data-room-3d-zoom-out]");
  const zoomSlider = root.querySelector<HTMLInputElement>("[data-room-3d-zoom-slider]");
  const status = root.querySelector<HTMLElement>("[data-room-3d-status]");
  const configNode = root.querySelector<HTMLScriptElement>("[data-room-3d-config]");

  if (
    !(container instanceof HTMLElement) ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(homeButton instanceof HTMLButtonElement) ||
    !(status instanceof HTMLElement) ||
    !(configNode instanceof HTMLScriptElement)
  ) {
    return () => {};
  }

  // Dynamic imports — Three.js only loads when user opens the 3D view
  const [THREE, { OrbitControls }] = await Promise.all([
    import("three"),
    import("three/examples/jsm/controls/OrbitControls.js"),
  ]);

  const config = JSON.parse(configNode.textContent ?? "{}") as Room3DConfig;

  // Build surface specs (inlined to use dynamically-imported THREE)
  if (config.walls.length < 4) {
    throw new Error(`Room requires 4 walls, got ${config.walls.length}`);
  }

  const derivedWalls = config.walls.map((wall) => ({
    ...wall,
    worldWidth: deriveWallWidth(wall, config.wallHeight),
  }));
  const sortedByWidth = [...derivedWalls].sort(
    (left, right) => right.worldWidth - left.worldWidth || (left.order ?? 0) - (right.order ?? 0),
  );
  const longWalls = sortedByWidth
    .slice(0, 2)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  const shortWalls = sortedByWidth
    .slice(2)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  const roomWidth = average(longWalls.map((wall) => wall.worldWidth));
  const roomDepth = average(shortWalls.map((wall) => wall.worldWidth));
  const roomHeight = config.wallHeight;

  type SurfaceSpec = {
    id: string;
    label: string;
    src: string;
    width: number;
    height: number;
    position: InstanceType<typeof THREE.Vector3>;
    rotation: InstanceType<typeof THREE.Euler>;
  };

  const surfaces: SurfaceSpec[] = [
    {
      id: "north-wall",
      label: longWalls[0]?.label ?? "North wall",
      src: longWalls[0]?.src ?? config.walls[0].src,
      width: roomWidth,
      height: roomHeight,
      position: new THREE.Vector3(0, roomHeight / 2, -roomDepth / 2),
      rotation: new THREE.Euler(0, 0, 0),
    },
    {
      id: "south-wall",
      label: longWalls[1]?.label ?? "South wall",
      src: longWalls[1]?.src ?? config.walls[1].src,
      width: roomWidth,
      height: roomHeight,
      position: new THREE.Vector3(0, roomHeight / 2, roomDepth / 2),
      rotation: new THREE.Euler(0, Math.PI, 0),
    },
    {
      id: "west-wall",
      label: shortWalls[0]?.label ?? "West wall",
      src: shortWalls[0]?.src ?? config.walls[2].src,
      width: roomDepth,
      height: roomHeight,
      position: new THREE.Vector3(-roomWidth / 2, roomHeight / 2, 0),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
    },
    {
      id: "east-wall",
      label: shortWalls[1]?.label ?? "East wall",
      src: shortWalls[1]?.src ?? config.walls[3].src,
      width: roomDepth,
      height: roomHeight,
      position: new THREE.Vector3(roomWidth / 2, roomHeight / 2, 0),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    },
  ];

  if (config.ceiling) {
    surfaces.push({
      id: "ceiling",
      label: config.ceiling.label,
      src: config.ceiling.src,
      width: roomWidth,
      height: roomDepth,
      position: new THREE.Vector3(0, roomHeight, 0),
      rotation: new THREE.Euler(Math.PI / 2, 0, Math.PI),
    });
  }

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
  camera.position.set(0, roomHeight * 0.38, 5);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = -0.58;
  controls.zoomSpeed = 0.82;
  controls.panSpeed = 0.75;
  controls.minDistance = 0.25;
  controls.maxDistance = 5;
  controls.minPolarAngle = Math.PI / 2 - 0.12;
  controls.maxPolarAngle = Math.PI - 0.06;
  controls.target.set(0, roomHeight * 0.38, 0);

  const homePosition = new THREE.Vector3(0, roomHeight * 0.38, 5);
  const homeTarget = new THREE.Vector3(0, roomHeight * 0.38, 0);

  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f2f2f2"),
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  roomGroup.add(floor);

  const loader = new THREE.TextureLoader();
  const resources: Array<THREE.Texture | THREE.Material | THREE.BufferGeometry> = [floor.geometry, floor.material as THREE.Material];
  const targetPosition = homePosition.clone();
  const targetLookAt = homeTarget.clone();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let transitioning = false;
  let frameId = 0;

  const resize = () => {
    const { clientWidth, clientHeight } = container;

    if (!clientWidth || !clientHeight) {
      return;
    }

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  };

  const onResize = () => resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  window.addEventListener("resize", onResize);

  const threeDHint = container.closest("[data-view-panel]")?.querySelector<HTMLElement>("[data-room-3d-hint]");

  controls.addEventListener("start", () => {
    transitioning = false;
    if (threeDHint) threeDHint.hidden = true;
    canvas.style.cursor = "grabbing";
  });
  controls.addEventListener("end", () => {
    canvas.style.cursor = "grab";
  });

  const onHomeClick = () => {
    if (reduceMotion) {
      camera.position.copy(homePosition);
      controls.target.copy(homeTarget);
      controls.update();
      return;
    }
    targetPosition.copy(homePosition);
    targetLookAt.copy(homeTarget);
    transitioning = true;
  };

  homeButton.addEventListener("click", onHomeClick);

  const distRange = controls.maxDistance - controls.minDistance;
  const distFromSlider = (val: number) =>
    controls.maxDistance - (val / 100) * distRange;
  const sliderFromDist = (dist: number) =>
    ((controls.maxDistance - dist) / distRange) * 100;

  const setZoomDist = (newDist: number) => {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    dir.setLength(Math.max(controls.minDistance, Math.min(controls.maxDistance, newDist)));
    camera.position.copy(controls.target).add(dir);
  };

  const syncSlider = () => {
    if (!zoomSlider) return;
    const dist = camera.position.distanceTo(controls.target);
    zoomSlider.value = String(Math.round(sliderFromDist(dist)));
  };

  const onSliderInput = () => {
    if (!zoomSlider) return;
    setZoomDist(distFromSlider(Number(zoomSlider.value)));
  };
  zoomSlider?.addEventListener("input", onSliderInput);

  const zoomStep = 15;
  const onZoomIn = () => {
    if (!zoomSlider) return;
    const next = Math.min(100, Number(zoomSlider.value) + zoomStep);
    zoomSlider.value = String(next);
    setZoomDist(distFromSlider(next));
  };
  const onZoomOut = () => {
    if (!zoomSlider) return;
    const next = Math.max(0, Number(zoomSlider.value) - zoomStep);
    zoomSlider.value = String(next);
    setZoomDist(distFromSlider(next));
  };
  zoomInBtn?.addEventListener("click", onZoomIn);
  zoomOutBtn?.addEventListener("click", onZoomOut);

  resize();
  syncSlider();

  try {
    const loadedSurfaces = await Promise.all(
      surfaces.map(async (surface) => {
        const texture = await loader.loadAsync(surface.src);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.needsUpdate = true;
        resources.push(texture);

        return {
          ...surface,
          texture,
        };
      }),
    );

    loadedSurfaces.forEach((surface) => {
      const geometry = new THREE.PlaneGeometry(surface.width, surface.height);
      const material = new THREE.MeshBasicMaterial({
        map: surface.texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.copy(surface.position);
      mesh.rotation.copy(surface.rotation);
      roomGroup.add(mesh);
      resources.push(geometry, material);
    });

    status.hidden = true;
  } catch (error) {
    const text = status.querySelector("[data-room-3d-status] .room__three-loader-text, .room__three-loader-text");
    if (text) text.textContent = "Could not load room";
    const spinner = status.querySelector(".room__spinner");
    if (spinner) (spinner as HTMLElement).style.display = "none";
    console.error("Room 3D load failed:", error);
  }

  const render = () => {
    frameId = window.requestAnimationFrame(render);

    if (transitioning) {
      camera.position.lerp(targetPosition, 0.08);
      controls.target.lerp(targetLookAt, 0.065);

      const positionDone = camera.position.distanceTo(targetPosition) < 0.02;
      const targetDone = controls.target.distanceTo(targetLookAt) < 0.02;
      if (positionDone && targetDone) {
        camera.position.copy(targetPosition);
        controls.target.copy(targetLookAt);
        transitioning = false;
      }
    }

    controls.update();
    syncSlider();
    renderer.render(scene, camera);
  };

  render();

  return () => {
    window.cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    window.removeEventListener("resize", onResize);
    homeButton.removeEventListener("click", onHomeClick);
    zoomInBtn?.removeEventListener("click", onZoomIn);
    zoomOutBtn?.removeEventListener("click", onZoomOut);
    zoomSlider?.removeEventListener("input", onSliderInput);
    controls.dispose();
    resources.forEach((resource) => resource.dispose());
    roomGroup.clear();
    renderer.dispose();
  };
}

function initializePresentations() {
  cleanupPresentations();

  document.querySelectorAll<PresentationRoot>("[data-presentation]").forEach((root) => {
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-view-trigger]"),
    );
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-view-panel]"));
    const galleryItems = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-gallery-item]"),
    );
    const lightbox = root.querySelector<HTMLDialogElement>("[data-gallery-lightbox]");
    const lightboxImage = root.querySelector<HTMLImageElement>("[data-gallery-lightbox-image]");
    const lightboxCaption = root.querySelector<HTMLElement>("[data-gallery-lightbox-caption]");
    const lightboxPrev = root.querySelector<HTMLButtonElement>("[data-lightbox-prev]");
    const lightboxNext = root.querySelector<HTMLButtonElement>("[data-lightbox-next]");

    let teardown3d: (() => void) | undefined;
    let threeDInitialized = false;
    let currentLightboxIndex = 0;

    const setView = async (view: string) => {
      root.dataset.activeView = view;

      triggers.forEach((trigger) => {
        trigger.setAttribute("aria-pressed", String(trigger.dataset.viewTrigger === view));
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.viewPanel !== view;
      });

      if (view === "3d" && !threeDInitialized) {
        teardown3d = await initializeRoom3D(root);
        threeDInitialized = true;
      }

      if (view === "3d") {
        window.dispatchEvent(new Event("resize"));
      }
    };

    const onTriggerClick = (event: Event) => {
      const trigger = event.currentTarget as HTMLButtonElement;
      void setView(trigger.dataset.viewTrigger ?? "slider");
    };

    const showLightboxImage = (index: number) => {
      if (
        !(lightboxImage instanceof HTMLImageElement) ||
        !(lightboxCaption instanceof HTMLElement) ||
        !galleryItems.length
      ) return;

      currentLightboxIndex = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
      const item = galleryItems[currentLightboxIndex];
      lightboxImage.src = item.dataset.gallerySrc ?? "";
      lightboxImage.alt = item.dataset.galleryAlt ?? "";
      lightboxCaption.textContent = item.dataset.galleryLabel ?? "";
    };

    const onGalleryClick = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      if (!(lightbox instanceof HTMLDialogElement)) return;

      const index = galleryItems.indexOf(button);
      showLightboxImage(index);
      lightbox.showModal();
    };

    const onLightboxClick = (event: MouseEvent) => {
      if (event.target === lightbox) {
        lightbox?.close();
      }
    };

    const onLightboxPrev = () => showLightboxImage(currentLightboxIndex - 1);
    const onLightboxNext = () => showLightboxImage(currentLightboxIndex + 1);

    triggers.forEach((trigger) => trigger.addEventListener("click", onTriggerClick));
    galleryItems.forEach((item) => item.addEventListener("click", onGalleryClick));
    lightbox?.addEventListener("click", onLightboxClick);
    lightboxPrev?.addEventListener("click", onLightboxPrev);
    lightboxNext?.addEventListener("click", onLightboxNext);

    root.__presentationCleanup = () => {
      triggers.forEach((trigger) => trigger.removeEventListener("click", onTriggerClick));
      galleryItems.forEach((item) => item.removeEventListener("click", onGalleryClick));
      lightbox?.removeEventListener("click", onLightboxClick);
      lightboxPrev?.removeEventListener("click", onLightboxPrev);
      lightboxNext?.removeEventListener("click", onLightboxNext);
      teardown3d?.();
    };
  });
}

document.addEventListener("astro:before-swap", cleanupPresentations);
document.addEventListener("astro:page-load", initializePresentations);
initializePresentations();
