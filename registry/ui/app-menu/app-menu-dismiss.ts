import { type RefObject, useEffect } from 'react';

/** Closes on a mousedown outside the container (and outside `menuRef`, for a panel rendered elsewhere) or on Escape. */
export function useMenuDismiss(containerRef: RefObject<HTMLElement | null>, isOpen: boolean, close: () => void, menuRef?: RefObject<HTMLElement | null>) {
	useEffect(() => {
		if (!isOpen) return;
		function closeOnOutsideClick(event: MouseEvent) {
			const target = event.target as Node;
			if (!containerRef.current?.contains(target) && !menuRef?.current?.contains(target)) close();
		}
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') close();
		}
		document.addEventListener('mousedown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('mousedown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, [containerRef, menuRef, isOpen, close]);
}
