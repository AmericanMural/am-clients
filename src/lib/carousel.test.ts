import { describe, expect, it } from "vitest";

import { wrapCarouselIndex } from "./carousel";

describe("wrapCarouselIndex", () => {
  it("returns the current index when already in range", () => {
    expect(wrapCarouselIndex(2, 4)).toBe(2);
  });

  it("wraps overflow back to the beginning", () => {
    expect(wrapCarouselIndex(4, 4)).toBe(0);
    expect(wrapCarouselIndex(5, 4)).toBe(1);
  });

  it("wraps negative indices from the end", () => {
    expect(wrapCarouselIndex(-1, 4)).toBe(3);
    expect(wrapCarouselIndex(-2, 4)).toBe(2);
  });

  it("throws when asked to wrap against an empty carousel", () => {
    expect(() => wrapCarouselIndex(0, 0)).toThrow(/positive/i);
  });
});
