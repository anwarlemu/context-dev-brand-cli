export type Severity = 'error' | 'warn';

export type Fix = { start: number; end: number; text: string };

export type Finding = {
	file: string;
	line: number;
	column: number;
	rule: string;
	severity: Severity;
	message: string;
	hint: string;
	snippet: string;
	fix?: Fix;
	overridden?: string;
	/** On an override-approval finding: the rule the override skips. */
	overrideOf?: string;
};

export type RawFinding = Omit<Finding, 'file' | 'severity' | 'line' | 'column' | 'snippet'> & { offset: number; length?: number };
