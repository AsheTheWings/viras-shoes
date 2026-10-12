"use client";

import { useSyncExternalStore } from "react";

const KEY = "viras-favorites";
const EVENT = "viras-favorites-change";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(EVENT, listener);
  };
}

function snapshot() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function useFavorites() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let favorites: number[] = [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed))
      favorites = parsed.filter((id): id is number => typeof id === "number");
  } catch {
    /* Unreadable preferences display an empty list. */
  }

  function toggle(id: number) {
    const next = favorites.includes(id)
      ? favorites.filter((value) => value !== id)
      : [...favorites, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      /* Browsing remains available when local storage is disabled. */
    }
  }
  return { favorites, toggle };
}

function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

export function useProductLink() {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const match = /^#shoe-(\d+)$/.exec(hash);
  return {
    productId: match ? Number(match[1]) : null,
    close() {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    },
  };
}
