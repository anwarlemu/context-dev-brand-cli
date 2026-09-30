import type { SVGProps } from 'react';

type CursorClickIconProps = SVGProps<SVGSVGElement> & {
	/** Clockwise degrees; the pointer's tip faces up and to the left at 0. */
	rotation?: number;
	/** Must be unique per page when more than one cursor is rendered. */
	shadowId?: string;
	color?: string;
};

const DOT_PITCH = 3.4;
const DOT_RADIUS = 1.15;

export function CursorClickIcon({ rotation = -90, shadowId = 'footer-cursor-shadow', color = '#268BFF', ...props }: CursorClickIconProps) {
	const dotsId = `${shadowId}-dots`;
	return (
		<svg width="100%" height="100%" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
			{/* The shadow sits outside the rotation so it always falls downward, whichever way the pointer faces. */}
			<g filter={`url(#${shadowId})`}>
				<g transform={`rotate(${rotation} 50 48)`}>
					{/* Filled with the brand dot pattern over a dark base, so it reads as part of the dotted wordmark it rests on. */}
					<path d="M36.16 32.93C32.65 32.44 30.21 36.34 32.19 39.27L48.13 62.93C50.03 65.75 54.34 65.16 55.41 61.93L58.87 51.53L66.7 43.85C69.13 41.47 67.77 37.34 64.4 36.87L36.16 32.93Z" fill="#0D0D0F" />
					<path d="M36.16 32.93C32.65 32.44 30.21 36.34 32.19 39.27L48.13 62.93C50.03 65.75 54.34 65.16 55.41 61.93L58.87 51.53L66.7 43.85C69.13 41.47 67.77 37.34 64.4 36.87L36.16 32.93Z" fill={`url(#${dotsId})`} />
					<path d="M31.36 39.83C28.901 36.18 31.93 31.33 36.29 31.939L64.54 35.88C68.73 36.47 70.42 41.6 67.4 44.57L59.75 52.07L56.36 62.25C55.02 66.26 49.66 66.99 47.3 63.49L31.36 39.83Z" stroke="#0D0D0F" strokeWidth="3" />
					<path d="M31.36 39.83C28.901 36.18 31.93 31.33 36.29 31.939L64.54 35.88C68.73 36.47 70.42 41.6 67.4 44.57L59.75 52.07L56.36 62.25C55.02 66.26 49.66 66.99 47.3 63.49L31.36 39.83Z" stroke={color} strokeWidth="1.4" />
				</g>
			</g>
			<defs>
				<pattern id={dotsId} width={DOT_PITCH} height={DOT_PITCH} patternUnits="userSpaceOnUse">
					<circle cx={DOT_PITCH / 2} cy={DOT_PITCH / 2} r={DOT_RADIUS} fill={color} />
				</pattern>
				<filter id={shadowId} x="-10" y="-10" width="99" height="99" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset dy="4" />
					<feGaussianBlur stdDeviation="2" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
				</filter>
			</defs>
		</svg>
	);
}
