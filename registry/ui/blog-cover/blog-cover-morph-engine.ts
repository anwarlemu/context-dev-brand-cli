import type { BlogCoverMotif } from '@/components/ds/ui/blog-cover-art';
import { COVER_GRID, createCoverShader, parseCoverDots } from '@/components/ds/ui/blog-cover-dot-shader';
import { loadCoverScene } from '@/components/ds/ui/blog-cover-scenes';
import type { DotPalette } from '@/components/ds/ui/dot-morph-dots';
import { createDotMorphPlayer, type DotMorphPlayer } from '@/components/ds/ui/dot-morph-player';

interface BlogCoverMorphOptions {
	canvas: HTMLCanvasElement;
	motif: BlogCoverMotif;
	palette: DotPalette;
	onPlayingChange: (isPlaying: boolean) => void;
}

export async function createBlogCoverMorph({ canvas, motif, palette, onPlayingChange }: BlogCoverMorphOptions): Promise<DotMorphPlayer> {
	const [cover, scene] = await Promise.all([
		fetch(`/blog-covers/${motif}.svg`).then((response) => {
			if (!response.ok) throw new Error(`Could not load the ${motif} cover`);
			return response.text();
		}),
		loadCoverScene(motif),
	]);

	return createDotMorphPlayer({
		canvas,
		palette,
		onPlayingChange,
		source: {
			grid: COVER_GRID,
			fit: 'contain',
			restingDots: parseCoverDots(cover),
			spinSpeed: scene.spinSpeed,
			spinPeriod: scene.spinPeriod,
			sample: createCoverShader(scene),
		},
	});
}
