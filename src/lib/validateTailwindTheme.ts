import * as v from 'valibot';

// Matches a single HSL literal (functional OR bare triplet), optional surrounding whitespace + trailing semicolon
const RAW_HSL =
	/^\s*(?:hsla?\([^)]*\)|[+-]?\d*\.?\d+(?:deg|rad|turn|grad)?\s+\d*\.?\d+%\s+\d*\.?\d+%(?:\s*\/\s*[\d.]+%?)?)\s*;?\s*$/i;

function balanced(src: string): boolean {
	let braces = 0;
	let parens = 0;
	for (const ch of src) {
		if (ch === '{') braces++;
		else if (ch === '}') braces--;
		else if (ch === '(') parens++;
		else if (ch === ')') parens--;
		if (braces < 0 || parens < 0) return false;
	}
	return braces === 0 && parens === 0;
}

function looksLikeCss(src: string): boolean {
	return (
		/[@:{};]/.test(src) || // any CSS punctuation
		/--[\w-]+\s*:/.test(src) || // custom property
		/hsla?\(/i.test(src) // at least a color
	);
}

export const InputSchema = v.pipe(
	v.string(),
	v.transform((s) => s.trim()),
	v.minLength(1, 'Empty input'),
	v.check(balanced, 'Unbalanced braces or parentheses'),
	v.check(
		(s) => RAW_HSL.test(s) || looksLikeCss(s),
		"Input doesn't look like CSS or an HSL color.",
	),
);

export type InputKind = { kind: 'raw-hsl' } | { kind: 'css' };

export function classify(src: string): InputKind {
	return RAW_HSL.test(src.trim()) ? { kind: 'raw-hsl' } : { kind: 'css' };
}

export function validate(src: string):
	| { ok: true; kind: 'raw-hsl' | 'css' }
	| { ok: false; message: string } {
	const r = v.safeParse(InputSchema, src);
	return r.success
		? { ok: true as const, kind: classify(src).kind }
		: { ok: false as const, message: r.issues[0].message };
}
