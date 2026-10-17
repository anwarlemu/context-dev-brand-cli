import { glyphCellsFromRows, type GlyphCell } from '@/components/visuals/dot-engine/dot-glyph-cells';
import type { DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';

/**
 * The small pictures on the persona cards, in the brand dot grid: for each kind of team, a glyph for what it builds
 * and a second for what the API gives it, which the first gives way to and returns from.
 */

export const PERSONA_GLYPH_GRID: DotGrid = { columns: 11, rows: 11, pitch: 10, dotRadius: 3.7, ringStroke: 1.3, haloRadius: 0 };

// Every drawing, one string per row: `#` a solid dot, `o` a ring.
const ART = {
	cylinder: ['  #######  ', ' #       # ', ' ######### ', ' #       # ', ' #       # ', ' ######### ', ' #       # ', ' #       # ', ' ######### ', ' #       # ', '  #######  '],
	chunks: ['### ### ###', '### ### ###', '### ### ###', '           ', '### ooo ###', '### ooo ###', '### ooo ###', '           ', '### ### ###', '### ### ###', '### ### ###'],
	robot: ['     #     ', '     #     ', ' ######### ', ' #       # ', ' # ## ## # ', ' # ## ## # ', ' #       # ', ' #  ###  # ', ' #       # ', ' ######### ', '  ##   ##  '],
	browser: ['###########', '#o o o    #', '###########', '#         #', '# ####### #', '#         #', '# ###     #', '#         #', '# #####   #', '#         #', '###########'],
	magnifier: ['  #####    ', ' #ooooo#   ', '#ooooooo#  ', '#ooooooo#  ', '#ooooooo#  ', '#ooooooo#  ', ' #ooooo#   ', '  ######   ', '       ##  ', '        ## ', '         ##'],
	bubble: [' ######### ', '#         #', '# ####### #', '#         #', '# #####   #', '#         #', ' ######### ', '   ##      ', '  ##       ', '  #        ', '           '],
	shield: ['     #     ', '  #######  ', ' #ooooooo# ', ' #ooooooo# ', ' #ooooooo# ', ' #ooooooo# ', ' #ooooooo# ', '  #ooooo#  ', '   #ooo#   ', '    ###    ', '     #     '],
	eye: ['           ', '           ', '   #####   ', ' ##     ## ', '#   ###   #', '#  #####  #', '#   ###   #', ' ##     ## ', '   #####   ', '           ', '           '],
	book: ['           ', ' #### #### ', '#    #    #', '# ## # ## #', '#    #    #', '# ## # ## #', '#    #    #', '# ## # ## #', '#    #    #', ' #### #### ', '           '],
	layers: ['     #     ', '   ## ##   ', ' ##     ## ', '   ## ##   ', ' #   #   # ', '  ##   ##  ', '    ###    ', ' #       # ', '  ##   ##  ', '    ###    ', '           '],
	file: [' #######   ', ' #     ##  ', ' #      ## ', ' # ###   # ', ' #       # ', ' # ##### # ', ' #       # ', ' # ###   # ', ' #       # ', ' #       # ', ' ######### '],
	checklist: ['##  #######', '##         ', '           ', '##  #####  ', '##         ', '           ', '##  #######', '##         ', '           ', '##  ####   ', '##         '],
	bolt: ['      ##   ', '     ##    ', '    ##     ', '   ###     ', '  ######## ', '     ###   ', '     ##    ', '    ##     ', '   ##      ', '  ##       ', '  #        '],
	pencil: ['        ## ', '       ####', '      ## ##', '     ## ## ', '    ## ##  ', '   ## ##   ', '  ## ##    ', ' # ###     ', ' #  #      ', ' ###       ', '           '],
	globe: ['   #####   ', '  # # # #  ', ' #  # #  # ', '###########', '#  #   #  #', '#  #   #  #', '#  #   #  #', '###########', ' #  # #  # ', '  # # # #  ', '   #####   '],
	image: ['###########', '#         #', '#      ## #', '#      ## #', '#  #      #', '# ###   # #', '#####  ####', '###########', '###########', '###########', '###########'],
	briefcase: ['           ', '   #####   ', '   #   #   ', '###########', '#ooooooooo#', '#ooooooooo#', '#####o#####', '#         #', '#         #', '###########', '           '],
	contactCard: ['###########', '#         #', '#  ##     #', '# #### ## #', '#  ##     #', '# #### ## #', '# ####    #', '#      ## #', '#         #', '###########', '           '],
	tower: ['  #######  ', '  #     #  ', '  # # # #  ', '  #     #  ', '  # # # #  ', '  #     #  ', '  # # # #  ', '  #     #  ', '  # ### #  ', '  # # # #  ', '###########'],
	tiles: ['##### #####', '#   # #   #', '# # # # # #', '#   # #   #', '##### #####', '           ', '##### #####', '#   # #   #', '# # # # # #', '#   # #   #', '##### #####'],
	bars: ['         ##', '         ##', '      ## ##', '      ## ##', '      ## ##', '   ## ## ##', '   ## ## ##', '## ## ## ##', '## ## ## ##', '## ## ## ##', '###########'],
	trend: ['       ####', '         ##', '        # #', '       #  #', '   #  #    ', '  # ##     ', ' #         ', '#          ', '           ', '###########', '           '],
	chain: ['           ', '  ####     ', ' #    #    ', '#   ####   ', '#  #  # #  ', '#  #  #  # ', ' # #  #  # ', '  ####   # ', '   #    #  ', '    ####   ', '           '],
	logo: ['    #######', '    #######', '    #######', '  ###ooo###', ' ####ooo###', '#####ooo###', '#######    ', '#######    ', ' #####     ', '  ###      ', '           '],
	storefront: [' ######### ', ' #ooooooo# ', '###########', '# # # # # #', ' ######### ', ' #       # ', ' # ##  # # ', ' # ##  # # ', ' # ##    # ', ' # ##    # ', ' ######### '],
	tag: ['           ', '           ', '  ######## ', ' ##      # ', '##  ##   # ', '#   ##   # ', '##       # ', ' ##      # ', '  ######## ', '           ', '           '],
	scroll: [' ########  ', '#        # ', ' # ##### # ', ' #       # ', ' # ##### # ', ' #       # ', ' # ###   # ', ' #       # ', ' #       ##', ' #        #', '  ######## '],
	tick: ['           ', '          #', '         ##', '        ## ', '       ##  ', '#     ##   ', '##   ##    ', ' ## ##     ', '  ###      ', '   #       ', '           '],
	signedShield: ['     #     ', '  #######  ', ' ######### ', ' #######o# ', ' ######o## ', ' #o###o### ', ' ##o#o#### ', '  ##o####  ', '   #####   ', '    ###    ', '     #     '],
	key: ['           ', '           ', '  ###      ', ' #   #     ', '#     #####', '#     #  # ', ' #   #     ', '  ###      ', '           ', '           ', '           '],
	clock: ['   #####   ', '  #     #  ', ' #   #   # ', '#    #    #', '#    #    #', '#    ###  #', '#         #', '#         #', ' #       # ', '  #     #  ', '   #####   '],
	log: ['           ', '# #########', '           ', '# ######   ', '           ', '# #########', '           ', '# #####    ', '           ', '# ######## ', '           '],
	wand: ['        # #', '         # ', '        # #', '       #   ', '      #    ', '     #     ', '    #      ', '   #       ', '  #        ', ' #         ', '#          '],
	bell: ['     #     ', '    ###    ', '   #####   ', '  #######  ', '  #######  ', '  #######  ', '  #######  ', ' ######### ', '###########', '           ', '    ###    '],
	office: ['   #####   ', '   #   #   ', '   # # #   ', '   #   ####', '   # # #  #', '   #   # ##', '   # # #  #', '   #   # ##', '   # # #  #', '   #   #  #', '###########'],
	bust: ['   #####   ', '  #     #  ', '  #     #  ', '  #     #  ', '   #####   ', '           ', '  #######  ', ' #       # ', '#         #', '#         #', '###########'],
	rocket: ['     #     ', '    ###    ', '   #####   ', '   ## ##   ', '   #####   ', '   #####   ', '  #######  ', ' ## ### ## ', ' #  ###  # ', '    # #    ', '     #     '],
	form: ['###########', '#         #', '# ####### #', '#         #', '# #####   #', '#         #', '# ####### #', '#         #', '#     ### #', '#     ### #', '###########'],
	dashboard: ['###########', '# #       #', '# # ##### #', '# #       #', '# # ## ## #', '# # ## ## #', '# #       #', '# # ##### #', '# #       #', '# #       #', '###########'],
	swatches: ['##### ooooo', '##### ooooo', '##### ooooo', '##### ooooo', '##### ooooo', '           ', 'ooooo #####', 'ooooo # # #', 'ooooo ## ##', 'ooooo # # #', 'ooooo #####'],
	people: ['  ###   ## ', ' #####  ## ', ' ##### ####', '  ###  ####', '        ## ', ' #####     ', '####### ###', '###########', '###########', '###########', '           '],
	mail: ['           ', '###########', '##       ##', '# #     # #', '#  #   #  #', '#   # #   #', '#    #    #', '#         #', '#         #', '###########', '           '],
	flow: ['###        ', '###        ', '###        ', ' #         ', ' #     ### ', ' ######### ', ' #     ### ', ' #         ', '###        ', '###        ', '###        '],
	megaphone: ['         ##', '       ####', '     ######', '###########', '###########', '###########', '     ######', '  ##   ####', '  ##     ##', '  ##       ', '           '],
	pen: ['     #     ', '    ###    ', '    ###    ', '   ## ##   ', '   ## ##   ', '  ##   ##  ', '  ## # ##  ', '  #######  ', '   #####   ', '   #####   ', '    ###    '],
	slide: ['###########', '#         #', '# ###     #', '#      ## #', '# ##   ## #', '#    # ## #', '###########', '     #     ', '    ###    ', '   #   #   ', '  #     #  '],
	brandedDoc: [' ######### ', ' #       # ', ' # ##    # ', ' # ##    # ', ' #       # ', ' # ##### # ', ' #       # ', ' # ##### # ', ' #       # ', ' # ##    # ', ' ######### '],
	palette: ['   #####   ', '  #######  ', ' ##o###o## ', '####### ###', '#o#####    ', '######     ', '#o#####    ', '########## ', ' ##o###o## ', '  #######  ', '   #####   '],
	pie: ['   #####   ', '  ###   #  ', ' ####    # ', '#####     #', '#####     #', '###########', '#         #', '#         #', ' #       # ', '  #     #  ', '   #####   '],
	share: ['        ###', '        ###', '      ##   ', '    ##     ', '###        ', '###        ', '    ##     ', '      ##   ', '        ###', '        ###', '           '],
	spark: ['     #     ', '     #     ', '    ###    ', '    ###    ', '  #######  ', '###########', '  #######  ', '    ###    ', '    ###    ', '     #     ', '     #     '],
	textLines: ['###########', '           ', '########   ', '           ', '###########', '           ', '######     ', '           ', '###########', '           ', '#######    '],
} satisfies Record<string, string[]>;

// Each card's pair: what the team builds or the feature is, then what the API gives it. The last five of the first
// group belong to feature cards rather than teams, and the last five of all to the products in the header's menu.
const PAIRS = {
	database: ['cylinder', 'chunks'],
	bot: ['robot', 'browser'],
	search: ['magnifier', 'bubble'],
	shield: ['shield', 'eye'],
	book: ['book', 'layers'],
	file: ['file', 'checklist'],
	bolt: ['bolt', 'pencil'],
	globe: ['globe', 'image'],
	briefcase: ['briefcase', 'contactCard'],
	building: ['tower', 'tiles'],
	chart: ['bars', 'trend'],
	link: ['chain', 'logo'],
	store: ['storefront', 'tag'],
	scroll: ['scroll', 'tick'],
	signed: ['signedShield', 'key'],
	history: ['clock', 'log'],
	wand: ['wand', 'bell'],
	company: ['office', 'logo'],
	person: ['bust', 'contactCard'],
	rocket: ['rocket', 'form'],
	theme: ['dashboard', 'swatches'],
	portal: ['browser', 'logo'],
	team: ['people', 'mail'],
	tenants: ['layers', 'swatches'],
	agency: ['people', 'swatches'],
	whitelabel: ['flow', 'tag'],
	email: ['mail', 'swatches'],
	design: ['pen', 'slide'],
	campaign: ['megaphone', 'mail'],
	document: ['file', 'brandedDoc'],
	creative: ['palette', 'layers'],
	report: ['pie', 'bars'],
	social: ['share', 'image'],
	generate: ['spark', 'textLines'],
	imagegen: ['image', 'swatches'],
	writing: ['pencil', 'textLines'],
	slides: ['slide', 'swatches'],
	chat: ['robot', 'bubble'],
	outreach: ['bubble', 'mail'],
	scrape: ['browser', 'textLines'],
	map: ['globe', 'log'],
	batches: ['layers', 'checklist'],
	monitor: ['clock', 'bell'],
	styleguide: ['palette', 'swatches'],
} satisfies Record<string, [keyof typeof ART, keyof typeof ART]>;

export type PersonaGlyphName = keyof typeof PAIRS;

export const personaGlyph = (name: PersonaGlyphName): GlyphCell[] => glyphCellsFromRows(ART[PAIRS[name][0]]);
export const personaOutcome = (name: PersonaGlyphName): GlyphCell[] => glyphCellsFromRows(ART[PAIRS[name][1]]);
