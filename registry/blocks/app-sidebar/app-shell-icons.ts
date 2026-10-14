import {
	ArrowLeft, Boxes, ChartNoAxesColumn, CircleHelp, Code, FileText, Gift, Globe, Hash, Image, KeyRound, LayoutGrid, Layers, type LucideIcon,
	Map, Newspaper, Palette, Radar, ScanSearch, Search, Settings, Sparkles, UserRound, Users,
} from 'lucide-react';

/** The icons product navigation may use, by name, so pages (server components) pass strings, not components. */
export const APP_ICONS = {
	'arrow-left': ArrowLeft,
	boxes: Boxes,
	'chart-column': ChartNoAxesColumn,
	'circle-help': CircleHelp,
	code: Code,
	'file-text': FileText,
	gift: Gift,
	globe: Globe,
	hash: Hash,
	image: Image,
	'key-round': KeyRound,
	'layout-grid': LayoutGrid,
	layers: Layers,
	map: Map,
	newspaper: Newspaper,
	palette: Palette,
	radar: Radar,
	'scan-search': ScanSearch,
	search: Search,
	settings: Settings,
	sparkles: Sparkles,
	'user-round': UserRound,
	users: Users,
} satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof APP_ICONS;
