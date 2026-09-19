import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const useIsMobileSize = (maxW: number = 500) => useMediaQuery(`(max-width: ${maxW}px)`);

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

export const useIsTouch = () => useMediaQuery("(pointer: coarse)");
