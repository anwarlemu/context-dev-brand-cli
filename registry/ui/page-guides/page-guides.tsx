/** The page's outer guides: two dashed hairlines just outside the content column, the full page height. */
export function PageGuides() {
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden justify-center md:flex">
			<div className="relative h-full w-full max-w-7xl">
				<div className="absolute inset-y-0 left-0 border-l border-dashed border-line" />
				<div className="absolute inset-y-0 right-0 border-r border-dashed border-line" />
			</div>
		</div>
	);
}
