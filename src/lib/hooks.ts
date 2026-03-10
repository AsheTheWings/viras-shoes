"use client";

import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 1024px)";

function subscribe(cb: () => void) {
  const mql = window.matchMedia(MD_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(MD_QUERY).matches;
}

function getServerSnapshot() {
  return true; // assume desktop for SSR to avoid layout shift on most users
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
