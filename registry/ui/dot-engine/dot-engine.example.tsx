import { resolveColor } from '@/components/ds/ui/ds-color';

export function example(element: Element) {
	return resolveColor(element, 'var(--ds-color-brand)');
}
