export interface GlyphCell {
	column: number;
	row: number;
	filled: boolean;
}

/** Reads a glyph drawn in text, one string per row: `#` a solid dot, `o` a ring, anything else empty. */
export function glyphCellsFromRows(rows: string[]): GlyphCell[] {
	return rows.flatMap((line, row) => [...line].flatMap((mark, column) => (mark === '#' || mark === 'o' ? [{ column, row, filled: mark === '#' }] : [])));
}
