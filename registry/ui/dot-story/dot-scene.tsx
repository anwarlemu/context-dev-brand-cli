import type { ComponentType } from 'react';
import { ActionsStory } from '@/components/ds/ui/actions-story';
import { AnswerStory } from '@/components/ds/ui/answer-story';
import { AssetsStory } from '@/components/ds/ui/assets-story';
import { AutofillStory } from '@/components/ds/ui/autofill-story';
import { BatchStory } from '@/components/ds/ui/batch-story';
import { CollectStory } from '@/components/ds/ui/collect-story';
import { ComponentsStory } from '@/components/ds/ui/components-story';
import { ContextStory } from '@/components/ds/ui/context-story';
import { CrawlStory } from '@/components/ds/ui/crawl-story';
import { DesignSystemStory } from '@/components/ds/ui/design-system-story';
import { DiscoverStory } from '@/components/ds/ui/discover-story';
import { EnrichStory } from '@/components/ds/ui/enrich-story';
import { ExtractStory } from '@/components/ds/ui/extract-story';
import { FreshnessStory } from '@/components/ds/ui/freshness-story';
import { IdentityStory } from '@/components/ds/ui/identity-story';
import { MetadataStory } from '@/components/ds/ui/metadata-story';
import { OutputStory } from '@/components/ds/ui/output-story';
import { QuestionStory } from '@/components/ds/ui/question-story';
import { RagStory } from '@/components/ds/ui/rag-story';
import { ResearchStory } from '@/components/ds/ui/research-story';
import { ScopeStory } from '@/components/ds/ui/scope-story';
import { ScrapeStory } from '@/components/ds/ui/scrape-story';
import { SearchStory } from '@/components/ds/ui/search-story';
import { SetupStory } from '@/components/ds/ui/setup-story';
import { SiteMapStory } from '@/components/ds/ui/site-map-story';
import { SourcesStory } from '@/components/ds/ui/sources-story';
import { SpacingStory } from '@/components/ds/ui/spacing-story';
import { StructureStory } from '@/components/ds/ui/structure-story';
import { TypeStory } from '@/components/ds/ui/type-story';
import { UrlListStory } from '@/components/ds/ui/url-list-story';
import { WatchStory } from '@/components/ds/ui/watch-story';

const SCENES = {
	'actions': ActionsStory,
	'answer': AnswerStory,
	'assets': AssetsStory,
	'autofill': AutofillStory,
	'batch': BatchStory,
	'collect': CollectStory,
	'components': ComponentsStory,
	'context': ContextStory,
	'crawl': CrawlStory,
	'design-system': DesignSystemStory,
	'discover': DiscoverStory,
	'enrich': EnrichStory,
	'extract': ExtractStory,
	'freshness': FreshnessStory,
	'identity': IdentityStory,
	'metadata': MetadataStory,
	'output': OutputStory,
	'question': QuestionStory,
	'rag': RagStory,
	'research': ResearchStory,
	'scope': ScopeStory,
	'scrape': ScrapeStory,
	'search': SearchStory,
	'setup': SetupStory,
	'site-map': SiteMapStory,
	'sources': SourcesStory,
	'spacing': SpacingStory,
	'structure': StructureStory,
	'type': TypeStory,
	'url-list': UrlListStory,
	'watch': WatchStory,
} satisfies Record<string, ComponentType<{ className?: string }>>;

export type DotSceneName = keyof typeof SCENES;
export const DOT_SCENES = Object.keys(SCENES) as DotSceneName[];

export function DotScene({ variant, className }: { variant: DotSceneName; className?: string }) {
	const Scene = SCENES[variant];
	return <Scene className={className} />;
}
