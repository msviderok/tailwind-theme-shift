import { channel, toBoundedMode, toMode } from './formatUtils';
import { parseSupportedColor, supportedFunctionNames } from './registry';
import type { ConversionToken, OutputFormatId, OutputFormatOption } from './types';

interface Replacement {
	start: number;
	end: number;
	inputCss: string;
	inputFormat: string;
	outputCss: string;
	previewCss: string;
	oklchL: number;
}

const HEX_RE = /^#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/i;
const SKIP_FUNCTIONS = new Set([
	'var',
	'url',
	'color-mix',
	'light-dark',
	'contrast-color',
	'alpha',
	'device-cmyk',
]);

function isIdentStart(ch: string | undefined): boolean {
	return ch !== undefined && /[a-zA-Z_]/.test(ch);
}

function isIdentChar(ch: string | undefined): boolean {
	return ch !== undefined && /[-_a-zA-Z0-9]/.test(ch);
}

function hasIdentBoundary(value: string, start: number, end: number): boolean {
	return !isIdentChar(value[start - 1]) && !isIdentChar(value[end]);
}

function skipString(src: string, start: number): number {
	const quote = src[start];
	let i = start + 1;
	while (i < src.length) {
		if (src[i] === '\\') {
			i += 2;
			continue;
		}
		if (src[i] === quote) return i + 1;
		i++;
	}
	return src.length;
}

function skipComment(src: string, start: number): number {
	const end = src.indexOf('*/', start + 2);
	return end === -1 ? src.length : end + 2;
}

function findMatchingParen(src: string, openIndex: number): number {
	let depth = 0;
	let i = openIndex;
	while (i < src.length) {
		const ch = src[i];
		const next = src[i + 1];

		if (ch === '"' || ch === "'") {
			i = skipString(src, i);
			continue;
		}
		if (ch === '/' && next === '*') {
			i = skipComment(src, i);
			continue;
		}
		if (ch === '(') {
			depth++;
		} else if (ch === ')') {
			depth--;
			if (depth === 0) return i;
		}
		i++;
	}
	return -1;
}

function serializePreview(outputCss: string, color: Parameters<typeof toMode>[1]): string {
	if (/^(?:#|rgb\(|hsl\(|hwb\(|lab\(|lch\(|oklab\(|oklch\(|color\()/i.test(outputCss)) {
		return outputCss;
	}

	const rgb = toBoundedMode('rgb', color);
	const r = Math.round(channel(rgb, 'r') * 255);
	const g = Math.round(channel(rgb, 'g') * 255);
	const b = Math.round(channel(rgb, 'b') * 255);
	return `rgb(${r} ${g} ${b})`;
}

function replacementFor(
	source: string,
	start: number,
	end: number,
	outputFormat: OutputFormatOption,
): Replacement | null {
	if (/var\(/i.test(source)) return null;

	const parsed = parseSupportedColor(source);
	if (!parsed) return null;

	const outputCss = outputFormat.serialize(parsed.color);
	const oklch = toMode('oklch', parsed.color);

	return {
		start,
		end,
		inputCss: source,
		inputFormat: parsed.formatId,
		outputCss,
		previewCss: serializePreview(outputCss, parsed.color),
		oklchL: channel(oklch, 'l'),
	};
}

function findReplacements(value: string, outputFormat: OutputFormatOption): Replacement[] {
	const leading = value.length - value.trimStart().length;
	const trimmed = value.trim();
	const fullValueReplacement = replacementFor(
		trimmed.endsWith(';') ? trimmed.slice(0, -1).trimEnd() : trimmed,
		leading,
		leading + trimmed.length,
		outputFormat,
	);
	if (fullValueReplacement) return [fullValueReplacement];

	const replacements: Replacement[] = [];
	const colorFunctions = supportedFunctionNames();
	let i = 0;

	while (i < value.length) {
		const ch = value[i];
		const next = value[i + 1];

		if (ch === '"' || ch === "'") {
			i = skipString(value, i);
			continue;
		}
		if (ch === '/' && next === '*') {
			i = skipComment(value, i);
			continue;
		}

		if (isIdentStart(ch)) {
			let identEnd = i + 1;
			while (isIdentChar(value[identEnd])) identEnd++;

			const ident = value.slice(i, identEnd).toLowerCase();
			let cursor = identEnd;
			while (/\s/.test(value[cursor] ?? '')) cursor++;

			if (value[cursor] === '(') {
				const close = findMatchingParen(value, cursor);
				if (close === -1) {
					i = identEnd;
					continue;
				}

				if (colorFunctions.has(ident)) {
					const source = value.slice(i, close + 1);
					const replacement = replacementFor(source, i, close + 1, outputFormat);
					if (replacement) replacements.push(replacement);
					i = close + 1;
					continue;
				}

				if (SKIP_FUNCTIONS.has(ident)) {
					i = close + 1;
					continue;
				}

				i = cursor + 1;
				continue;
			}

			const source = value.slice(i, identEnd);
			if (hasIdentBoundary(value, i, identEnd)) {
				const replacement = replacementFor(source, i, identEnd, outputFormat);
				if (replacement) replacements.push(replacement);
			}
			i = identEnd;
			continue;
		}

		if (ch === '#') {
			const match = HEX_RE.exec(value.slice(i));
			if (match) {
				const replacement = replacementFor(match[0], i, i + match[0].length, outputFormat);
				if (replacement) replacements.push(replacement);
				i += match[0].length;
				continue;
			}
		}

		i++;
	}

	return replacements;
}

export function replaceColorsInValue(
	value: string,
	valueStartOffset: number,
	outputStartOffset: number,
	outputFormat: OutputFormatOption,
	outputFormatId: OutputFormatId,
): { output: string; tokens: ConversionToken[] } {
	const replacements = findReplacements(value, outputFormat);
	if (replacements.length === 0) return { output: value, tokens: [] };

	const tokens: ConversionToken[] = [];
	let output = '';
	let cursor = 0;

	for (const replacement of replacements) {
		const before = value.slice(cursor, replacement.start);
		output += before;

		const outputStart = outputStartOffset + output.length;
		output += replacement.outputCss;

		tokens.push({
			inputStart: valueStartOffset + replacement.start,
			inputEnd: valueStartOffset + replacement.end,
			inputCss: replacement.inputCss,
			inputFormat: replacement.inputFormat,
			outputStart,
			outputEnd: outputStart + replacement.outputCss.length,
			outputCss: replacement.outputCss,
			outputFormat: outputFormatId,
			previewCss: replacement.previewCss,
			oklchL: replacement.oklchL,
		});

		cursor = replacement.end;
	}

	output += value.slice(cursor);
	return { output, tokens };
}
