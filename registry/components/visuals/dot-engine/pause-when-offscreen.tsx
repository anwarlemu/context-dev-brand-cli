'use client';

import { useEffect, useRef } from 'react';

/**
 * Dropped inside an SVG, it pauses that SVG's SMIL animations while the SVG is off screen. SMIL keeps ticking (and
 * restyling and repainting) whether or not anyone can see it.
 */
export function PauseWhenOffscreen() {
	const markerRef = useRef<SVGGElement>(null);

	useEffect(() => {
		const svg = markerRef.current?.ownerSVGElement;
		if (!svg) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) svg.unpauseAnimations();
			else svg.pauseAnimations();
		});
		observer.observe(svg);
		return () => observer.disconnect();
	}, []);

	return <g ref={markerRef} />;
}
