"use client";

import * as React from "react";

// One remembered code language for the whole page: every code tabs window, install command and code explorer follows
// the visitor's last pick, and the choice is kept where storage allows (other tabs follow through the storage event).
const LANGUAGE_KEY = "ds:code-language";
const LANGUAGE_EVENT = "ds:code-language-change";
let sessionLanguage: string | null = null;

/** The picked language, or null when the visitor has not picked one yet. */
export function readCodeLanguage(): string | null {
  try {
    return sessionLanguage ?? window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return sessionLanguage;
  }
}

/** Picks a language for every code sample on the page and remembers it. */
export function storeCodeLanguage(language: string) {
  sessionLanguage = language;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage can be blocked (private browsing); the session value still keeps this page's code samples in sync.
  }
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

/** Calls `onChange` when the language changes here or in another tab; returns the unsubscribe. */
export function subscribeCodeLanguage(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANGUAGE_KEY) return;
    sessionLanguage = event.newValue;
    onChange();
  };
  window.addEventListener(LANGUAGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LANGUAGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page's remembered language (null on the server and before a pick) and the setter every sample shares. */
export function useCodeLanguage(): [string | null, (language: string) => void] {
  const language = React.useSyncExternalStore(subscribeCodeLanguage, readCodeLanguage, () => null);
  return [language, storeCodeLanguage];
}
