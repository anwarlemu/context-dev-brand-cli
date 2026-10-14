import { AppPageHeader } from '@/components/ds/blocks/app-page-header';


export default function Example() {
	return (
		<AppPageHeader variant="breadcrumb" title="Batch" breadcrumb={{ label: 'Batches', href: '/batches', current: 'bat_8f2k1q9x' }} />
	);
}
