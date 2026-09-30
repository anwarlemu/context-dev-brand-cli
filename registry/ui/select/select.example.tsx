import { Select } from '@/components/ds/ui/select';

export default function Example() {
	return <Select label="SDK" name="sdk" options={[{ value: 'ts', label: 'TypeScript' }, { value: 'py', label: 'Python' }]} />;
}
