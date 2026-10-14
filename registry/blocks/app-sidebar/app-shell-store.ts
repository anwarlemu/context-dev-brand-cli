'use client';

import { useSyncExternalStore } from 'react';

// The drawer's open state, shared by the sidebar and the top bar's menu button without a provider, so both can sit in a
// server layout.
let isNavOpen = false;
const listeners = new Set<() => void>();

export function setNavOpen(open: boolean) {
	if (open === isNavOpen) return;
	isNavOpen = open;
	for (const listener of listeners) listener();
}

export function useNavOpen() {
	return useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		() => isNavOpen,
		() => false,
	);
}
