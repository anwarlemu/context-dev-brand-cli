'use client';

import { ChevronsUpDown, LogOut, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppIconButton } from '@/components/ds/ui/app-icon-button';
import { MENU_LABEL_CLASS, MENU_LIST_CLASS, MENU_ROW_CLASS, MENU_SEPARATOR_CLASS, MENU_SURFACE_CLASS } from '@/components/ds/ui/app-menu';
import { useMenuDismiss } from '@/components/ds/ui/app-menu-dismiss';
import { AppThemeSwitch } from '@/components/ds/ui/app-theme';
import { APP_ICONS, type AppIconName } from '@/components/ds/blocks/app-shell-icons';
import { setNavOpen, useNavOpen } from '@/components/ds/blocks/app-shell-store';

export { setNavOpen, useNavOpen } from '@/components/ds/blocks/app-shell-store';
export { APP_ICONS, type AppIconName } from '@/components/ds/blocks/app-shell-icons';

export type AppNavItem = { title: string; href: string; icon: AppIconName };
export type AppNavGroup = { label?: string; items: AppNavItem[] };
export type AppMenuLink = { label: string; href: string };

export type AppSidebarProps = {
	workspace: { name: string; plan?: string; createHref?: string };
	groups: AppNavGroup[];
	/** The current path's link. Omitted, the sidebar matches the browser's path (longest href that prefixes it). */
	activeHref?: string;
	footer?: AppNavItem[];
	user: { name: string; email: string; links?: AppMenuLink[][]; logoutHref: string };
	/** Called by the search button. Without it, the button dispatches a `ds:open-search` window event. */
	onSearch?: () => void;
};

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

function usePathname() {
	return useSyncExternalStore(
		(listener) => {
			window.addEventListener('popstate', listener);
			return () => window.removeEventListener('popstate', listener);
		},
		() => window.location.pathname,
		() => '',
	);
}

function linkClassName(active: boolean) {
	// The page you're on sits in a gray box, a step short of black; hovering another link lays a lighter gray.
	return cx(
		'group/link relative flex h-8 items-center gap-2.5 rounded-control pr-2 pl-3 text-body-sm outline-none transition-colors duration-150 ease-out focus-visible:shadow-ring-hover',
		active ? 'bg-wash/7 font-medium text-neutral-80' : 'text-fg-muted hover:bg-wash/4 hover:text-fg',
	);
}

function NavLink({ item, active }: { item: AppNavItem; active: boolean }) {
	const Icon = APP_ICONS[item.icon];
	const external = item.href.startsWith('http');
	return (
		<a href={item.href} aria-current={active ? 'page' : undefined} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} onClick={() => setNavOpen(false)} className={linkClassName(active)}>
			<Icon className={cx('size-4 shrink-0 transition-colors duration-150', active ? 'text-neutral-80' : 'text-fg-subtle group-hover/link:text-fg-muted')} strokeWidth={1.75} />
			<span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
		</a>
	);
}

function useMenu() {
	const [isOpen, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useMenuDismiss(ref, isOpen, close);
	return { isOpen, setOpen, ref };
}

function WorkspaceSwitcher({ workspace }: { workspace: AppSidebarProps['workspace'] }) {
	const { isOpen, setOpen, ref } = useMenu();
	return (
		<div ref={ref} className="relative min-w-0">
			<button type="button" onClick={() => setOpen((open) => !open)} aria-expanded={isOpen} className={cx('flex h-8 max-w-full items-center gap-2 rounded-control pr-2 pl-3 text-body-sm text-fg outline-none transition-colors duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover', isOpen && 'bg-wash/4')}>
				<span className="grid size-4 shrink-0 place-items-center rounded-sm bg-fg text-micro text-surface">{workspace.name[0]}</span>
				<span className="truncate text-left font-medium">{workspace.name}</span>
				<ChevronsUpDown className="-ml-0.5 size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
			</button>
			{isOpen && (
				<div className={cx('popover-in absolute top-full left-0 z-40 mt-1.5 w-56 origin-top-left', MENU_SURFACE_CLASS)}>
					<p className={MENU_LABEL_CLASS}>Organization</p>
					<div className="flex h-9 items-center gap-2 rounded-control bg-surface-subtle pr-1.5 pl-2.5 text-body-sm">
						<span className="min-w-0 flex-1 truncate">{workspace.name}</span>
						{workspace.plan && <span className="rounded-sm bg-blue-10/60 px-1.5 text-micro text-accent">{workspace.plan}</span>}
					</div>
					{workspace.createHref && (
						<>
							<div className={MENU_SEPARATOR_CLASS} />
							<a href={workspace.createHref} className={cx(MENU_ROW_CLASS, 'text-body-sm text-fg-muted hover:bg-wash/4 hover:text-fg')}>
								<Plus className="size-3.5" strokeWidth={1.5} />
								Create organization
							</a>
						</>
					)}
				</div>
			)}
		</div>
	);
}

function UserMenu({ user }: { user: AppSidebarProps['user'] }) {
	const { isOpen, setOpen, ref } = useMenu();
	return (
		<div ref={ref} className="relative">
			<button type="button" onClick={() => setOpen((open) => !open)} aria-expanded={isOpen} className={cx('group flex h-9 w-full items-center gap-2.5 rounded-control px-3 text-body-sm outline-none transition-colors duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover', isOpen && 'bg-wash/4')}>
				<span className="grid size-5 shrink-0 place-items-center rounded-pill bg-brand text-micro text-on-brand">{initials(user.name)}</span>
				<span className="flex-1 truncate text-left">{user.name}</span>
				<ChevronsUpDown className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg-muted" strokeWidth={1.5} />
			</button>
			{isOpen && (
				<div className={cx('popover-in absolute bottom-full left-0 z-40 mb-1.5 w-60 origin-bottom-left', MENU_SURFACE_CLASS)}>
					<div className="flex items-center gap-2.5 rounded-control bg-surface-subtle px-2.5 py-2">
						<span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand text-micro text-on-brand">{initials(user.name)}</span>
						<span className="min-w-0">
							<span className="block truncate text-body-sm">{user.name}</span>
							<span className="block truncate text-caption text-fg-subtle">{user.email}</span>
						</span>
					</div>
					{(user.links ?? []).map((section, index) => (
						<div key={index}>
							<div className={MENU_SEPARATOR_CLASS} />
							<div className={MENU_LIST_CLASS}>
								{section.map((link) => (
									<a key={link.href} href={link.href} className={cx(MENU_ROW_CLASS, 'text-body-sm text-fg-muted hover:bg-wash/4 hover:text-fg')}>
										{link.label}
									</a>
								))}
							</div>
						</div>
					))}
					<div className={MENU_SEPARATOR_CLASS} />
					<div className="flex items-center justify-between py-0.5 pr-0.5 pl-2.5">
						<span className="text-body-sm text-fg-muted">Theme</span>
						<AppThemeSwitch />
					</div>
					<div className={MENU_SEPARATOR_CLASS} />
					<a href={user.logoutHref} className={cx(MENU_ROW_CLASS, 'text-body-sm text-danger hover:bg-danger/6')}>
						<LogOut className="size-3.5" strokeWidth={1.5} />
						Log out
					</a>
				</div>
			)}
		</div>
	);
}

/** The product sidebar: workspace, search, the nav groups, help links and the account. A drawer below md. */
export function AppSidebar({ workspace, groups, activeHref, footer = [], user, onSearch }: AppSidebarProps) {
	const isOpen = useNavOpen();
	const pathname = usePathname();
	const hrefs = groups.flatMap((group) => group.items.map((item) => item.href));
	const active = activeHref ?? hrefs.filter((href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))).sort((a, b) => b.length - a.length)[0];
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setNavOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen]);

	return (
		<AppBlock block="app-sidebar" className="contents">
			{/* Below md the sidebar slides over the page; the scrim fades with it rather than popping. */}
			<div aria-hidden onClick={() => setNavOpen(false)} className={cx('fixed inset-0 z-40 bg-scrim transition-opacity duration-200 ease-emphasized md:hidden', !isOpen && 'pointer-events-none opacity-0')} />
			<aside
				className={cx(
					'flex h-full w-[212px] shrink-0 flex-col bg-canvas px-7',
					'max-md:fixed max-md:inset-y-2 max-md:left-2 max-md:z-50 max-md:h-auto max-md:rounded-shell max-md:bg-surface max-md:shadow-drawer max-md:transition-[translate,visibility] max-md:ease-emphasized motion-reduce:max-md:transition-[visibility]',
					// In over 250ms, out over a quicker 200ms; transitions, so a quick reopen turns around mid-way.
					isOpen ? 'max-md:translate-x-0 max-md:duration-250' : 'max-md:invisible max-md:-translate-x-[calc(100%+1rem)] max-md:duration-200',
				)}
			>
				<div className="flex shrink-0 items-center gap-0.5 pt-6 pb-2">
					<WorkspaceSwitcher workspace={workspace} />
					<AppIconButton label="Search" tooltipClassName="mr-0.5 ml-auto" onClick={() => (onSearch ? onSearch() : window.dispatchEvent(new CustomEvent('ds:open-search')))}>
						<APP_ICONS.search className="size-3.5" strokeWidth={1.5} />
					</AppIconButton>
				</div>
				<nav className="scrollbar-thin -mx-7 flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-0.5">
					{/* Spacers center the list; they shrink first, so a long list still scrolls from its first row. */}
					<div aria-hidden className="min-h-0 flex-1" />
					<div className="flex shrink-0 flex-col gap-1.5">
						{groups.map((group, index) => (
							<div key={group.label ?? index} className="flex flex-col gap-0.5">
								{group.label && <p className="mt-3 mb-1 ml-3 w-fit rounded-control-sm border border-line px-1.5 text-micro text-fg-muted">{group.label}</p>}
								{group.items.map((item) => <NavLink key={item.href} item={item} active={item.href === active} />)}
							</div>
						))}
					</div>
					<div aria-hidden className="min-h-0 flex-1" />
				</nav>
				<div className="flex flex-col gap-1.5 pt-2 pb-5">
					{footer.map((item) => <NavLink key={item.href} item={item} active={false} />)}
					<UserMenu user={user} />
				</div>
			</aside>
		</AppBlock>
	);
}
