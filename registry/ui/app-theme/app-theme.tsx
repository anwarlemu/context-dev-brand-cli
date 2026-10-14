'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { cx } from '@/components/ds/ui/cx';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { type AppTheme, setTheme, useTheme } from '@/components/ds/ui/app-theme-store';

export { THEME_SCRIPT, setTheme, useResolvedTheme, useTheme, type AppResolvedTheme, type AppTheme } from '@/components/ds/ui/app-theme-store';

const OPTIONS: Array<{ value: AppTheme; label: string; icon: typeof Sun }> = [
	{ value: 'light', label: 'Light', icon: Sun },
	{ value: 'system', label: 'System', icon: Monitor },
	{ value: 'dark', label: 'Dark', icon: Moon },
];

/** Light, system or dark: three icon options in a hairline track, the picked one in the brand tint. Switches at once. */
export function AppThemeSwitch({ className }: { className?: string }) {
	const theme = useTheme();
	return (
		<div role="radiogroup" aria-label="Theme" className={cx('flex rounded-control border border-line p-0.5', className)}>
			{OPTIONS.map(({ value, label, icon: Icon }) => (
				<AppTooltip key={value} label={label} side="top">
					{/* ds-override: an icon-only control needs 3:1 (UI part); accent on blue-10 is 4.49:1 */}
					<button
						type="button"
						role="radio"
						aria-checked={theme === value}
						aria-label={label}
						onClick={() => setTheme(value)}
						className={cx(
							'grid size-6 place-items-center rounded-control-sm outline-none transition-colors duration-150 ease-out focus-visible:shadow-ring-hover',
							theme === value ? 'bg-blue-10 text-accent' : 'text-fg-subtle hover:text-fg',
						)}
					>
						<Icon className="size-3.5" strokeWidth={1.5} />
					</button>
				</AppTooltip>
			))}
		</div>
	);
}
