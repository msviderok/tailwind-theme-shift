import type { ColorToken } from './parseHslColors';

export type TokenType =
	| 'plain'
	| 'selector'
	| 'punct'
	| 'prop'
	| 'val-hsl'
	| 'val-oklch'
	| 'val-other'
	| 'comment'
	| 'val-color-badge';

export interface DisplayToken {
	type: TokenType;
	text: string;
	css?: string;
	fg?: '#111' | '#fff';
}

const SELECTOR_LINE = /^[.:@]?[\w-]+\s*\{?\s*$/;
const HSL_VALUE =
	/^(?:hsla?\(\s*[^)]*\)|[+-]?\d*\.?\d+(?:deg|rad|turn|grad)?\s+\d*\.?\d+%\s+\d*\.?\d+%(?:\s*\/\s*[\d.]+%?)?)$/i;
const OKLCH_VALUE = /^oklch\(\s*[^)]*\)$/i;
const CUSTOM_PROPERTY_LINE = /^(\s*)(--[\w-]+)(\s*:\s*)([^;]*?)(\s*;)(\s*\/\*.*\*\/\s*)?$/;

export function contrastColor(oklchL: number): '#111' | '#fff' {
	return oklchL > 0.6 ? '#111' : '#fff';
}

function overlaps(startA: number, endA: number, startB: number, endB: number) {
	return startA < endB && startB < endA;
}

function findMatchingColorToken(
	valueStart: number,
	valueEnd: number,
	colorTokens: ColorToken[],
	side: 'input' | 'output',
) {
	return colorTokens.find((token) => {
		const start = side === 'input' ? token.inputStart : token.outputStart;
		const end = side === 'input' ? token.inputEnd : token.outputEnd;
		return overlaps(valueStart, valueEnd, start, end);
	});
}

function getValueToken(
	value: string,
	valueStart: number,
	valueEnd: number,
	colorTokens: ColorToken[],
	side: 'input' | 'output',
	showChips: boolean,
): DisplayToken {
	const colorToken = findMatchingColorToken(valueStart, valueEnd, colorTokens, side);

	if (colorToken && showChips) {
		return {
			type: 'val-color-badge',
			text: value,
			css: side === 'input' ? colorToken.inputCss : colorToken.outputCss,
			fg: contrastColor(colorToken.oklchL),
		};
	}

	if (side === 'input' && HSL_VALUE.test(value.trim())) {
		return { type: 'val-hsl', text: value };
	}

	if (side === 'output' && OKLCH_VALUE.test(value.trim())) {
		return { type: 'val-oklch', text: value };
	}

	return { type: 'val-other', text: value };
}

export function tokenizeLine(
	line: string,
	lineOffset: number,
	colorTokens: ColorToken[],
	side: 'input' | 'output',
	showChips: boolean,
): DisplayToken[] {
	const trimmed = line.trim();

	if (!trimmed) {
		return [{ type: 'plain', text: line }];
	}

	if (trimmed.startsWith('/*')) {
		const indentLength = line.length - line.trimStart().length;
		return [
			{ type: 'plain', text: line.slice(0, indentLength) },
			{ type: 'comment', text: line.slice(indentLength) },
		];
	}

	if (trimmed === '}') {
		return [{ type: 'punct', text: line }];
	}

	if (!line.includes('--') && SELECTOR_LINE.test(trimmed)) {
		return [{ type: 'selector', text: line }];
	}

	const rawLineToken = getValueToken(
		line,
		lineOffset,
		lineOffset + line.length,
		colorTokens,
		side,
		showChips,
	);
	if (
		(side === 'input' && HSL_VALUE.test(trimmed)) ||
		(side === 'output' && OKLCH_VALUE.test(trimmed))
	) {
		return [rawLineToken];
	}

	const propertyMatch = CUSTOM_PROPERTY_LINE.exec(line);
	if (propertyMatch) {
		const [, indent, property, colon, value, semi, trailingComment] = propertyMatch;
		const valueStart = lineOffset + indent.length + property.length + colon.length;
		const valueEnd = valueStart + value.length;

		const tokens: DisplayToken[] = [
			{ type: 'plain', text: indent },
			{ type: 'prop', text: property },
			{ type: 'punct', text: colon },
			getValueToken(value, valueStart, valueEnd, colorTokens, side, showChips),
			{ type: 'punct', text: semi },
		];

		if (trailingComment) {
			tokens.push({ type: 'comment', text: trailingComment });
		}

		return tokens;
	}

	return [{ type: 'plain', text: line }];
}
