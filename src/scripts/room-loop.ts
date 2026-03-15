import EmblaCarousel from "embla-carousel";

import { wrapCarouselIndex } from "../lib/carousel";

type RoomLoopRoot = HTMLElement & {
  __roomLoopCleanup?: () => void;
};

function cleanupRoomLoops() {
  document.querySelectorAll<RoomLoopRoot>("[data-room-loop]").forEach((node) => {
    node.__roomLoopCleanup?.();
  });
}

function initializeRoomLoops() {
  cleanupRoomLoops();

  document.querySelectorAll<RoomLoopRoot>("[data-room-loop]").forEach((root) => {
    const viewport = root.querySelector<HTMLElement>("[data-room-loop-viewport]");
    const prevButton = root.querySelector<HTMLButtonElement>("[data-room-loop-prev]");
    const nextButton = root.querySelector<HTMLButtonElement>("[data-room-loop-next]");
    const caption = root.querySelector<HTMLElement>("[data-room-loop-caption]");
    const hint = root.querySelector<HTMLElement>("[data-slider-hint]");
    const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-wall-slide]"));

    if (!(viewport instanceof HTMLElement) || slides.length === 0) {
      return;
    }

    const embla = EmblaCarousel(viewport, {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
    });
    // Embla internal API — pinned to 8.6.0; verify after upgrades
    const engine = embla.internalEngine();

    const updateState = () => {
      const currentIndex = wrapCarouselIndex(embla.selectedScrollSnap(), slides.length);

      root.dataset.currentIndex = String(currentIndex);

      if (caption) {
        caption.textContent = `${currentIndex + 1}/${slides.length}`;
      }
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        embla.scrollNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        embla.scrollPrev();
      }
    };

    const onWheel = (event: WheelEvent) => {
      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (Math.abs(dominantDelta) < 1) {
        return;
      }

      event.preventDefault();
      const modeFactor =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport.clientWidth
            : 1;
      const smoothDelta = engine.axis.direction(dominantDelta * modeFactor * 0.7);

      engine.scrollBody.useFriction(0.3).useDuration(0.75);
      engine.target.add(smoothDelta);
      engine.animation.start();
    };

    const hideHint = () => {
      if (hint) hint.hidden = true;
    };

    const onPrevClick = () => embla.scrollPrev();
    const onNextClick = () => embla.scrollNext();

    prevButton?.addEventListener("click", onPrevClick);
    nextButton?.addEventListener("click", onNextClick);
    root.addEventListener("keydown", onKeydown);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    embla.on("init", updateState);
    embla.on("reInit", updateState);
    embla.on("select", updateState);
    embla.on("scroll", hideHint, { once: true });
    updateState();

    root.__roomLoopCleanup = () => {
      prevButton?.removeEventListener("click", onPrevClick);
      nextButton?.removeEventListener("click", onNextClick);
      root.removeEventListener("keydown", onKeydown);
      viewport.removeEventListener("wheel", onWheel);
      embla.destroy();
    };
  });
}

document.addEventListener("astro:before-swap", cleanupRoomLoops);
document.addEventListener("astro:page-load", initializeRoomLoops);
initializeRoomLoops();
