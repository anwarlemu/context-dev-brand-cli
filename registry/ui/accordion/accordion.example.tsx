import { Accordion } from '@/components/ds/ui/accordion';

export default function Example() {
	return <Accordion items={[{ question: 'Is there a free tier?', answer: '1,000 API credits per month, no credit card required.' }]} />;
}
