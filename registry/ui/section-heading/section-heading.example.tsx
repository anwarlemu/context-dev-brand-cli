import { Button } from '@/components/ds/ui/button';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export default function Example() {
	return (
		<SectionHeading
			title="Give your agent access to the web."
			highlight="access to the web."
			sub="Search, scraping, people data and company data in one API."
			action={<Button variant="secondary" href="/customers">Read customer stories</Button>}
		/>
	);
}
