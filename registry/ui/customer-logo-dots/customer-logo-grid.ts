import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';

export const LOGO_CELLS = 28;
// The art fills its whole area (slice), so the grid runs past the logo on every side; the logo sits in its middle.
export const LOGO_GRID: DotGrid = { columns: 76, rows: 54, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 16 };
export const LOGO_LEFT = (LOGO_GRID.columns - LOGO_CELLS) / 2;
export const LOGO_TOP = (LOGO_GRID.rows - LOGO_CELLS) / 2;
