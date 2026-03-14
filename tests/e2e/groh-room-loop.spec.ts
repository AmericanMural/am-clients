import { expect, test } from "@playwright/test";

test("Groh room loop wraps after the fourth wall", async ({ page }) => {
  await page.goto("/projects/groh-fde1");
  await page.waitForFunction(() => {
    const viewer = document.querySelector("[data-room-loop]") as
      | (HTMLElement & { __roomLoopCleanup?: () => void })
      | null;
    return typeof viewer?.__roomLoopCleanup === "function";
  });

  await expect(page.getByText("Groh-FDE1")).toBeVisible();

  const viewer = page.locator("[data-room-loop]");
  const nextButton = page.locator("[data-room-loop-next]");
  await expect(viewer).toBeVisible();
  await expect(page.locator("[data-wall-slide]")).toHaveCount(4);
  await expect(viewer).toHaveAttribute("data-current-index", "0");
  await expect(nextButton).toBeVisible();

  await nextButton.click();
  await expect(viewer).toHaveAttribute("data-current-index", "1");

  await nextButton.click();
  await expect(viewer).toHaveAttribute("data-current-index", "2");

  await nextButton.click();
  await expect(viewer).toHaveAttribute("data-current-index", "3");

  await nextButton.click();
  await expect(viewer).toHaveAttribute("data-current-index", "0");
});

test("Groh room loop exposes Slider, 3D, and Gallery modes with a gallery lightbox", async ({
  page,
}) => {
  await page.goto("/projects/groh-fde1");

  const sliderButton = page.getByRole("button", { name: "Slider" });
  const threeDButton = page.getByRole("button", { name: "3D" });
  const galleryButton = page.getByRole("button", { name: "Gallery" });
  const sliderHint = page.locator("[data-slider-hint]");

  await expect(sliderButton).toBeVisible();
  await expect(threeDButton).toBeVisible();
  await expect(galleryButton).toBeVisible();
  await expect(sliderHint).toBeVisible();
  await expect(sliderHint).toHaveText("Drag, swipe or scroll");
  await expect(page.locator(".room__mode-switch")).toHaveCount(0);

  const controlStyles = await page.evaluate(() => {
    const slider = document.querySelector("[data-view-trigger='slider']") as HTMLElement;
    const toggle = document.querySelector("[data-theme-toggle]") as HTMLElement;

    return {
      sliderBackground: getComputedStyle(slider).backgroundColor,
      sliderBorderRadius: getComputedStyle(slider).borderRadius,
      toggleBackground: getComputedStyle(toggle).backgroundColor,
      toggleBorderRadius: getComputedStyle(toggle).borderRadius,
    };
  });

  expect(controlStyles).toEqual({
    sliderBackground: "rgb(252, 251, 248)",
    sliderBorderRadius: "999px",
    toggleBackground: "rgb(252, 251, 248)",
    toggleBorderRadius: "999px",
  });

  await galleryButton.click();
  await expect(sliderHint).toBeHidden();

  const galleryGrid = page.locator("[data-gallery-grid]");
  const lightbox = page.locator("[data-gallery-lightbox]");

  await expect(galleryGrid).toBeVisible();
  await expect(galleryGrid.locator("[data-gallery-item]")).toHaveCount(5);

  await galleryGrid.locator("[data-gallery-item]").first().click();
  await expect(lightbox).toHaveAttribute("open", "");

  await page.getByRole("button", { name: "Close image" }).click();
  await expect(lightbox).not.toHaveAttribute("open", "");

  await threeDButton.click();
  await expect(sliderHint).toBeHidden();
  await expect(page.locator("[data-room-3d-canvas]")).toBeVisible();

  const overlayMetrics = await page.evaluate(() => {
    const shell = document.querySelector("[data-room-loop]") as HTMLElement;
    const menu = document.querySelector(".room__menu") as HTMLElement;
    const canvas = document.querySelector("[data-room-3d-canvas]") as HTMLElement;

    return {
      shellHeight: shell.getBoundingClientRect().height,
      menuTop: menu.getBoundingClientRect().top - shell.getBoundingClientRect().top,
      menuRight: shell.getBoundingClientRect().right - menu.getBoundingClientRect().right,
      canvasHeight: canvas.getBoundingClientRect().height,
    };
  });

  expect(overlayMetrics.menuTop).toBeLessThanOrEqual(24);
  expect(overlayMetrics.menuRight).toBeLessThanOrEqual(24);
  expect(overlayMetrics.canvasHeight).toBeGreaterThanOrEqual(overlayMetrics.shellHeight - 40);
});

test("Groh room loop keeps a 1px seam and wheel scrolling smooth", async ({
  page,
}) => {
  await page.goto("/projects/groh-fde1");
  await page.waitForFunction(() => {
    const viewer = document.querySelector("[data-room-loop]") as
      | (HTMLElement & { __roomLoopCleanup?: () => void })
      | null;
    return typeof viewer?.__roomLoopCleanup === "function";
  });

  const viewport = page.locator("[data-room-loop-viewport]");
  const viewer = page.locator("[data-room-loop]");
  const slides = page.locator("[data-wall-slide]");

  await expect(viewport).toBeVisible();

  const styleSummary = await viewport.evaluate((node) => {
    const container = node.querySelector(".room__container");
    const firstSlide = node.querySelector<HTMLElement>("[data-wall-slide]");
    const firstImage = firstSlide?.querySelector("img");

    return {
      containerGap: container ? getComputedStyle(container).gap : null,
      containerPaddingLeft: container ? getComputedStyle(container).paddingLeft : null,
      containerPaddingRight: container ? getComputedStyle(container).paddingRight : null,
      slidePaddingLeft: firstSlide ? getComputedStyle(firstSlide).paddingLeft : null,
      slidePaddingRight: firstSlide ? getComputedStyle(firstSlide).paddingRight : null,
      imageRadius: firstImage ? getComputedStyle(firstImage).borderRadius : null,
    };
  });

  expect(styleSummary).toEqual({
    containerGap: "1px",
    containerPaddingLeft: "0px",
    containerPaddingRight: "0px",
    slidePaddingLeft: "0px",
    slidePaddingRight: "0px",
    imageRadius: "0px",
  });

  const firstBox = await slides.nth(0).boundingBox();
  const secondBox = await slides.nth(1).boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();

  if (!firstBox || !secondBox) {
    throw new Error("Expected first two wall slides to have layout boxes.");
  }

  expect(Math.round(secondBox.x - (firstBox.x + firstBox.width))).toBe(1);

  const beforeWheel = await viewport.evaluate((node) => {
    const container = node.querySelector(".room__container");
    return container ? getComputedStyle(container).transform : "none";
  });

  await viewport.evaluate((node) => {
    node.dispatchEvent(
      new WheelEvent("wheel", {
        deltaY: 240,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  await expect(viewer).toHaveAttribute("data-current-index", "0");

  await page.waitForTimeout(120);

  const afterWheel = await viewport.evaluate((node) => {
    const container = node.querySelector(".room__container");
    return container ? getComputedStyle(container).transform : "none";
  });

  expect(afterWheel).not.toBe(beforeWheel);
});

test("Groh room loop gives the carousel more space on mobile by tightening the chrome", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 680 });
  await page.goto("/projects/groh-fde1");

  const firstImage = page.locator("[data-wall-slide] img").first();
  await expect(firstImage).toBeVisible();

  const metrics = await page.evaluate(() => {
    const image = document.querySelector("[data-wall-slide] img") as HTMLElement;
    const shell = document.querySelector("[data-room-loop]") as HTMLElement;

    return {
      imageHeight: image.getBoundingClientRect().height,
      shellHeight: shell.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
    };
  });

  expect(metrics.imageHeight / metrics.viewportHeight).toBeGreaterThanOrEqual(0.539);
  expect(metrics.imageHeight / metrics.viewportHeight).toBeLessThanOrEqual(0.58);
  expect(metrics.shellHeight).toBeGreaterThanOrEqual(metrics.viewportHeight - 24);
  expect(metrics.shellHeight).toBeLessThanOrEqual(metrics.viewportHeight);
});

test("Groh room loop scales the wall image to fill the viewport height on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects/groh-fde1");

  const metrics = await page.evaluate(() => {
    const viewport = document.querySelector("[data-room-loop-viewport]") as HTMLElement;
    const slide = document.querySelector("[data-wall-slide]") as HTMLElement;
    const image = slide?.querySelector("img") as HTMLElement | null;

    if (!viewport || !slide || !image) {
      throw new Error("Expected viewport, slide, and image to exist.");
    }

    return {
      viewportHeight: viewport.getBoundingClientRect().height,
      slideHeight: slide.getBoundingClientRect().height,
      imageHeight: image.getBoundingClientRect().height,
    };
  });

  expect(Math.abs(metrics.imageHeight - metrics.slideHeight)).toBeLessThanOrEqual(2);
  expect(metrics.imageHeight / metrics.viewportHeight).toBeGreaterThanOrEqual(0.65);
});

test("Groh room loop stays fully visible on short landscape mobile screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/projects/groh-fde1");

  const metrics = await page.evaluate(() => {
    const shell = document.querySelector("[data-room-loop]") as HTMLElement;
    const title = document.querySelector("h1") as HTMLElement;
    const hint = document.querySelector(".room__hint") as HTMLElement;

    return {
      shellHeight: shell.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
      titleSize: getComputedStyle(title).fontSize,
      hintSize: getComputedStyle(hint).fontSize,
    };
  });

  expect(metrics.shellHeight).toBeGreaterThanOrEqual(metrics.viewportHeight - 16);
  expect(metrics.shellHeight).toBeLessThanOrEqual(metrics.viewportHeight);
  expect(metrics.titleSize).toBe("22px");
  expect(metrics.hintSize).toBe("13px");
});

test("Groh room loop keeps the active caption outside the rounded viewport", async ({
  page,
}) => {
  await page.goto("/projects/groh-fde1");

  const viewport = page.locator("[data-room-loop-viewport]");
  const caption = page.locator("[data-room-loop-caption]");

  await expect(viewport).toBeVisible();
  await expect(caption).toBeVisible();
  await expect(caption).toContainText("1/4");

  const captionInsideViewport = await page.evaluate(() => {
    const viewportNode = document.querySelector("[data-room-loop-viewport]");
    const captionNode = document.querySelector("[data-room-loop-caption]");

    return Boolean(viewportNode && captionNode && viewportNode.contains(captionNode));
  });

  expect(captionInsideViewport).toBe(false);
});

test("Groh room loop uses the caption as compact progress text", async ({ page }) => {
  await page.goto("/projects/groh-fde1");
  await page.waitForFunction(() => {
    const viewer = document.querySelector("[data-room-loop]") as
      | (HTMLElement & { __roomLoopCleanup?: () => void })
      | null;
    return typeof viewer?.__roomLoopCleanup === "function";
  });

  const caption = page.locator("[data-room-loop-caption]");
  const nextButton = page.locator("[data-room-loop-next]");
  const legacyProgress = page.locator("[data-room-loop-progress-label]");

  await expect(caption).toHaveText("1/4");
  await expect(nextButton).toBeVisible();
  await expect(legacyProgress).toHaveCount(0);

  await nextButton.click();
  await expect(caption).toHaveText("2/4");
});

test("Groh room loop defaults to light mode and toggles to dark mode", async ({
  page,
}) => {
  await page.goto("/projects/groh-fde1");
  await page.waitForFunction(() => {
    const viewer = document.querySelector("[data-room-loop]") as
      | (HTMLElement & { __roomLoopCleanup?: () => void })
      | null;
    return typeof viewer?.__roomLoopCleanup === "function";
  });

  const html = page.locator("html");
  const toggle = page.locator("[data-theme-toggle]");
  const moonIcon = page.locator("[data-theme-icon='moon']");
  const sunIcon = page.locator("[data-theme-icon='sun']");

  await expect(toggle).toBeVisible();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(moonIcon).toBeVisible();
  await expect(sunIcon).toBeHidden();

  const lightTokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);

    return {
      bg0: styles.getPropertyValue("--bg-0").trim(),
      bg1: styles.getPropertyValue("--bg-1").trim(),
      bg2: styles.getPropertyValue("--bg-2").trim(),
      lineSoft: styles.getPropertyValue("--line-soft").trim(),
    };
  });

  expect(lightTokens).toEqual({
    bg0: "#fcfbf8",
    bg1: "#fcfbf8",
    bg2: "#fcfbf8",
    lineSoft: "rgba(61, 52, 39, 0.1)",
  });

  const lightSurfaces = await page.evaluate(() => {
    const bodyStyles = getComputedStyle(document.body);
    const roomLoopStyles = getComputedStyle(
      document.querySelector("[data-room-loop]") as HTMLElement,
    );
    const viewportStyles = getComputedStyle(
      document.querySelector("[data-room-loop-viewport]") as HTMLElement,
    );
    const toggleStyles = getComputedStyle(
      document.querySelector("[data-theme-toggle]") as HTMLElement,
    );

    return {
      body: bodyStyles.backgroundColor,
      roomLoop: roomLoopStyles.backgroundColor,
      viewport: viewportStyles.backgroundColor,
      toggle: toggleStyles.backgroundColor,
    };
  });

  expect(lightSurfaces).toEqual({
    body: "rgb(252, 251, 248)",
    roomLoop: "rgb(252, 251, 248)",
    viewport: "rgb(252, 251, 248)",
    toggle: "rgb(252, 251, 248)",
  });

  await page.waitForFunction(() => {
    const button = document.querySelector("[data-theme-toggle]") as HTMLButtonElement | null;
    return typeof button?.onclick === "function";
  });
  await toggle.click({ force: true });
  await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");

  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(moonIcon).toBeHidden();
  await expect(sunIcon).toBeVisible();

  await page.reload();

  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(moonIcon).toBeHidden();
  await expect(sunIcon).toBeVisible();
});
