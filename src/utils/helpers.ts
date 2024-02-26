export function isMobileSize(maxW: number = 500) {
  return window.matchMedia(`(max-width: ${maxW}px)`).matches;
}
