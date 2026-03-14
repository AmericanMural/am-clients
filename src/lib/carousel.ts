export function wrapCarouselIndex(index: number, total: number) {
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error("Carousel total must be a positive integer.");
  }

  return ((index % total) + total) % total;
}
