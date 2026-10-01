import { assignBlogCoverMotifs, BlogCoverArt, blogCardSurface, type BlogCoverMotif } from '@/components/ds/ui/blog-cover-art';
import { cx } from '@/components/ds/ui/cx';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type BlogGridProps = {
	title: string;
	highlight?: string;
	posts: { title: string; slug: string; date: string; excerpt: string; href: string; motif?: BlogCoverMotif }[];
};

export function BlogGrid({ title, highlight, posts }: BlogGridProps) {
	const shown = posts.slice(0, 6);
	const motifs = assignBlogCoverMotifs(shown);
	return (
		<Section block="blog-grid" surface="black" heading={<SectionHeading title={title} highlight={highlight} tone="inverse" />}>
			<div className="flex flex-col gap-10">
				<div className="grid gap-4 md:grid-cols-3">
					{shown.map((post, i) => {
						const surface = blogCardSurface(i);
						const paper = surface === 'paper';
						return (
							<a key={post.href} href={post.href} className="block rounded-window focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
								<article className={cx('flex h-104 flex-col overflow-hidden rounded-card', paper ? 'bg-surface text-fg' : 'bg-brand text-on-brand')}>
									<div className="relative min-h-0 flex-1 overflow-hidden">
										<BlogCoverArt motif={post.motif ?? motifs[i]} surface={surface} />
									</div>
									<div className="flex flex-col gap-2 p-6">
										<p className={cx('text-caption', paper ? 'text-fg-muted' : 'text-on-brand')}>{post.date}</p>
										<h3 className="line-clamp-2 text-h5">{post.title}</h3>
										<p className={cx('line-clamp-2 text-body-sm', paper ? 'text-fg-muted' : 'text-on-brand')}>{post.excerpt}</p>
									</div>
								</article>
							</a>
						);
					})}
				</div>
			</div>
		</Section>
	);
}
