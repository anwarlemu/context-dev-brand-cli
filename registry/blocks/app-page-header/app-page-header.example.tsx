import { AppPageHeader } from '@/components/ds/blocks/app-page-header';
import { AppButton } from '@/components/ds/ui/app-button';

export default function Example() {
	return (
		<AppPageHeader variant="centered" title="API keys" sub="Use these keys to authenticate requests to the Context.dev API.">
			<AppButton variant="brand" size="sm">
				Create API key
			</AppButton>
		</AppPageHeader>
	);
}
