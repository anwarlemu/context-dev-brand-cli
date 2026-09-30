export type TrustMarkId = 'compliance' | 'retention' | 'reliability';

export const TRUST_MARK_PITCH = 5;
export const TRUST_MARK_DOT_RADIUS = 1.9;
export const TRUST_MARK_RING_STROKE = 0.8;
export const TRUST_MARK_CELLS = 15;

// Each mark is drawn in the brand dot grid, matching the rest of the page's dot art: `#` a solid dot, `o` a ring.
export const TRUST_MARK_ROWS: Record<TrustMarkId, string[]> = {
	compliance: ['     #####     ', '   ##ooooo##   ', '  ##ooooooo##  ', ' ##ooooooooo## ', ' #ooooooooooo# ', '#o###o###o###o#', '#o#ooo#o#o#ooo#', '#o###o#o#o#ooo#', '#ooo#o#o#o#ooo#', '#o###o###o###o#', ' #ooooooooooo# ', ' ##ooooooooo## ', '  ##ooooooo##  ', '   ##ooooo##   ', '     #####     '],
	retention: ['               ', '    #######  # ', '  ##ooooooo##  ', '  #oooooooo#   ', '  ######### #  ', '  #oooooo# o#  ', '  #ooooo# oo#  ', '  ###### ####  ', '  #ooo# oooo#  ', '  #oo# ooooo#  ', '  ### #######  ', '  ## ooooooo#  ', '  # ooooooo##  ', ' #  #######    ', '               '],
	reliability: [' ############# ', '#ooooooooooooo#', '#ooooooooooooo#', '#ooooo#ooooooo#', '#ooooo#ooooooo#', '#oooo#o#oooooo#', '#oooo#o#oooooo#', '#####oo#oo#####', '#oooooo#oo#ooo#', '#ooooooo##oooo#', '#ooooooo##oooo#', '#ooooooo#ooooo#', '#ooooooooooooo#', '#ooooooooooooo#', ' ############# '],
};
