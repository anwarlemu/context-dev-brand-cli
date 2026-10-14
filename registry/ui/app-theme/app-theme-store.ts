'use client';

import { useSyncExternalStore } from 'react';

export type AppTheme = 'light' | 'system' | 'dark';
export type AppResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: AppTheme = 'light';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Runs inline in <head>, before paint, so a dark page never flashes light. Keep it in step with readTheme and resolve. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"&&t!=="system")t="${DEFAULT_THEME}";var d=t==="dark"||(t==="system"&&matchMedia("${DARK_QUERY}").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

function readTheme(): AppTheme {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME;
	} catch {
		return DEFAULT_THEME;
	}
}

const resolve = (theme: AppTheme): AppResolvedTheme => (theme === 'dark' || (theme === 'system' && window.matchMedia(DARK_QUERY).matches) ? 'dark' : 'light');
const readResolved = (): AppResolvedTheme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

const listeners = new Set<() => void>();

function apply() {
	document.documentElement.dataset.theme = resolve(readTheme());
	for (const listener of listeners) listener();
}

// The OS switching only matters while the pick is System, and another tab changing the pick lands here too; both are
// watched only while something is subscribed.
function subscribe(listener: () => void) {
	if (listeners.size === 0) {
		window.matchMedia(DARK_QUERY).addEventListener('change', apply);
		window.addEventListener('storage', apply);
	}
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
		if (listeners.size > 0) return;
		window.matchMedia(DARK_QUERY).removeEventListener('change', apply);
		window.removeEventListener('storage', apply);
	};
}

export function setTheme(theme: AppTheme) {
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

/** Light or dark as shown, for canvases that paint surface colors themselves and must repaint. */
export function useResolvedTheme() {
	return useSyncExternalStore(subscribe, readResolved, () => 'light' as const);
}
