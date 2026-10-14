import { BookOpen, Plus } from 'lucide-react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { appButtonClassName } from '@/components/ds/ui/app-button';
import { AppEmptyState } from '@/components/ds/ui/app-empty-state';
import { DotScene, type DotSceneName } from '@/components/ds/ui/dot-scene';

export type AppEmptyPageProps = {
	/** The fine-dot story that shows what the feature does. */
	scene: DotSceneName;
	title: string;
	body: string;
	primary: { label: string; href: string };
	docs?: { label: string; href: string };
	/** The plan limit under the actions: "Running 0 / 1 concurrent" with a way to raise it. */
	usage?: { label: string; used: number; limit: number; unit?: string; upgrade?: { label: string; href: string } };
};

export function AppEmptyPage({ scene, title, body, primary, docs, usage }: AppEmptyPageProps) {
	return (
		<AppBlock block="app-empty-page" className="flex flex-1">
			<AppEmptyState
				media={<DotScene variant={scene} className="w-full" />}
				title={title}
				body={body}
				actions={
					<>
						<a href={primary.href} className={appButtonClassName('brand', 'sm')}>
							<Plus className="size-3.5" strokeWidth={1.75} />
							{primary.label}
						</a>
						{docs && (
							<a href={docs.href} className={appButtonClassName('outline', 'sm')}>
								<BookOpen className="size-3.5" strokeWidth={1.5} />
								{docs.label}
							</a>
						)}
					</>
				}
				footnote={
					usage && (
						<span className="flex items-center gap-3">
							<span>
								{usage.label}{' '}
								<span className="text-fg tabular-nums">
									{usage.used} / {usage.limit}
								</span>
								{usage.unit && ` ${usage.unit}`}
							</span>
							{usage.upgrade && (
								<a href={usage.upgrade.href} className="flex h-7 w-fit items-center rounded-control-sm border border-accent px-3 text-body-sm text-accent outline-none transition-colors duration-150 ease-out hover:bg-blue-10 focus-visible:shadow-ring-hover">
									{usage.upgrade.label}
								</a>
							)}
						</span>
					)
				}
			/>
		</AppBlock>
	);
}
