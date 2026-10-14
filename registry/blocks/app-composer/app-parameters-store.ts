'use client';

import { useSyncExternalStore } from 'react';

// Whether the parameters panel is open, shared by the composer's toggle and the panel's close button without a
// provider, so both can sit in a server page.
let isOpen = true;
const listeners = new Set<() => void>();

export function setParametersOpen(open: boolean) {
	if (open === isOpen) return;
	isOpen = open;
	for (const listener of listeners) listener();
}

export function useParametersOpen() {
	return useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		() => isOpen,
		() => true,
	);
}
