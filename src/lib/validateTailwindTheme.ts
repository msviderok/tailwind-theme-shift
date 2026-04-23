import * as v from 'valibot';
import { parseSupportedColor } from './colors/registry';

const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;

function stripOptionalSemicolon(src: string): string {
	const trimmed = src.trim();
	return trimmed.endsWith(';') ? trimmed.slice(0, -1).trimEnd() : trimmed;
}

function isRawStaticColor(src: string): boolean {
	return parseSupportedColor(stripOptionalSemicolon(src)) !== null;
}

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
		COLOR_FUNCTION.test(src) ||
		HEX_COLOR.test(src)
	);
}

const InputSchema = v.pipe(
	v.string(),
	v.transform((s) => s.trim()),
	v.minLength(1, 'Empty input'),
	v.check(balanced, 'Unbalanced braces or parentheses'),
	v.check(
		(s) => isRawStaticColor(s) || looksLikeCss(s),
		"Just paste your CSS variables here and we'll do the rest",
	),
);

type InputKind = { kind: 'raw-color' } | { kind: 'css' };

export function classify(src: string): InputKind {
	return isRawStaticColor(src) ? { kind: 'raw-color' } : { kind: 'css' };
}

export function validate(
	src: string,
): { ok: true; kind: 'raw-color' | 'css' } | { ok: false; message: string } {
	const r = v.safeParse(InputSchema, src);
	return r.success
		? { ok: true as const, kind: classify(src).kind }
		: { ok: false as const, message: r.issues[0].message };
}
