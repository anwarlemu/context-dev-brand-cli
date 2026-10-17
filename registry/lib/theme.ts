"use client";

import { useSyncExternalStore } from "react";

// The user's theme: light, dark, or following the OS. The pick is kept in localStorage and resolved onto <html> as
// data-theme="light" | "dark", which the tokens re-point every color from. THEME_SCRIPT does the same before first
// paint (put it in a <script> in <head>), so a dark page never flashes light.

export type Theme = "light" | "system" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "light";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"&&t!=="system")t="${DEFAULT_THEME}";var d=t==="dark"||(t==="system"&&matchMedia("${DARK_QUERY}").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

const resolve = (theme: Theme): ResolvedTheme => (theme === "dark" || (theme === "system" && window.matchMedia(DARK_QUERY).matches) ? "dark" : "light");
const readResolved = (): ResolvedTheme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

const listeners = new Set<() => void>();

function apply() {
  document.documentElement.dataset.theme = resolve(readTheme());
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.matchMedia(DARK_QUERY).addEventListener("change", apply);
    window.addEventListener("storage", apply);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.matchMedia(DARK_QUERY).removeEventListener("change", apply);
    window.removeEventListener("storage", apply);
  };
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be off (private windows); the theme still applies for this visit.
  }
  apply();
}

/** The user's pick, for the theme switch. */
export function useTheme() {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
}

/** Light or dark as shown, for canvases that paint the surface color themselves. */
export function useResolvedTheme() {
  return useSyncExternalStore(subscribe, readResolved, () => "light" as const);
}
