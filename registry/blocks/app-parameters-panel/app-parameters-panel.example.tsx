import { AppParametersPanel } from '@/components/ds/blocks/app-parameters-panel';

export default function Example() {
	return (
		<AppParametersPanel
			formats={{ options: ['HTML', 'Markdown', 'Screenshot', 'Images', 'Links', 'JSON'], selected: ['Markdown'] }}
			groups={[
				{
					title: 'Content',
					params: [
						{ name: 'mainOnly', label: 'Main content only', description: 'Remove navigation, headers, footers, and other boilerplate.', control: 'switch', value: true },
						{ name: 'include', label: 'Include selectors', description: 'Keep content matching these CSS selectors.', control: 'text', value: '', placeholder: 'article, #content', mono: true },
					],
				},
				{
					title: 'Browser',
					params: [
						{ name: 'country', label: 'Country', control: 'select', value: 'auto', options: [{ value: 'auto', label: 'Auto (default)' }, { value: 'de', label: 'Germany' }] },
						{ name: 'width', label: 'Viewport width', control: 'number', value: '', placeholder: '1440' },
					],
				},
			]}
		/>
	);
}
