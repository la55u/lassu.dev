export function isMobileSize(maxW: number = 500) {
  return window.matchMedia(`(max-width: ${maxW}px)`).matches;
}

export function timeAgo(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = [
    ["years", 3600 * 24 * 365],
    ["months", 3600 * 24 * 30],
    ["weeks", 3600 * 24 * 7],
    ["days", 3600 * 24],
    ["hours", 3600],
    ["minutes", 60],
    ["seconds", 1],
  ] as const;
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;

  for (const [rangeType, rangeVal] of ranges) {
    if (rangeVal < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / rangeVal;
      return formatter.format(Math.round(delta), rangeType);
    }
  }
}
