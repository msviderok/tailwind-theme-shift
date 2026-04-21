import { describe, expect, it } from 'vite-plus/test';
import type { ColorToken } from './parseHslColors';
import { contrastColor, tokenizeLine } from './syntaxTokenizer';

function createColorToken(inputLine: string, outputLine: string): ColorToken {
	const inputValue = inputLine.slice(inputLine.indexOf(':') + 1, inputLine.lastIndexOf(';')).trim();
	const outputValue = outputLine.slice(outputLine.indexOf(':') + 1, outputLine.lastIndexOf(';')).trim();
	const inputStart = inputLine.indexOf(inputValue);
	const outputStart = outputLine.indexOf(outputValue);

	return {
		inputStart,
		inputEnd: inputStart + inputValue.length,
		inputCss: `hsl(${inputValue})`,
		outputStart,
		outputEnd: outputStart + outputValue.length,
		outputCss: outputValue,
		oklchL: 0.72,
	};
}

describe('syntaxTokenizer', () => {
	it('tokenizes a comment-only line', () => {
		expect(tokenizeLine('  /* comment */', 0, [], 'input', true)).toEqual([
			{ type: 'plain', text: '  ' },
			{ type: 'comment', text: '/* comment */' },
		]);
	});

	it('tokenizes selector lines with and without braces', () => {
		expect(tokenizeLine(':root {', 0, [], 'input', true)).toEqual([
			{ type: 'selector', text: ':root {' },
		]);
		expect(tokenizeLine('@theme', 0, [], 'input', true)).toEqual([
			{ type: 'selector', text: '@theme' },
		]);
	});

	it('tokenizes a closing brace line', () => {
		expect(tokenizeLine('}', 0, [], 'input', true)).toEqual([{ type: 'punct', text: '}' }]);
	});

	it('tokenizes a custom property with a non-color value', () => {
		expect(tokenizeLine('  --radius: 0.875rem;', 0, [], 'input', true)).toEqual([
			{ type: 'plain', text: '  ' },
			{ type: 'prop', text: '--radius' },
			{ type: 'punct', text: ': ' },
			{ type: 'val-other', text: '0.875rem' },
			{ type: 'punct', text: ';' },
		]);
	});

	it('renders an input-side HSL token as a badge when chips are enabled', () => {
		const inputLine = '  --primary: 220 10% 50%;';
		const outputLine = '  --primary: oklch(0.583 0.028 264.00);';
		const tokens = tokenizeLine(
			inputLine,
			0,
			[createColorToken(inputLine, outputLine)],
			'input',
			true,
		);

		expect(tokens[3]).toEqual({
			type: 'val-color-badge',
			text: '220 10% 50%',
			css: 'hsl(220 10% 50%)',
			fg: '#111',
		});
	});

	it('renders an output-side OKLCH token as a badge when chips are enabled', () => {
		const inputLine = '  --primary: 220 10% 50%;';
		const outputLine = '  --primary: oklch(0.583 0.028 264.00);';
		const tokens = tokenizeLine(
			outputLine,
			0,
			[createColorToken(inputLine, outputLine)],
			'output',
			true,
		);

		expect(tokens[3]).toEqual({
			type: 'val-color-badge',
			text: 'oklch(0.583 0.028 264.00)',
			css: 'oklch(0.583 0.028 264.00)',
			fg: '#111',
		});
	});

	it('falls back to syntax coloring when chips are disabled', () => {
		const inputLine = '  --primary: 220 10% 50%;';
		const outputLine = '  --primary: oklch(0.583 0.028 264.00);';

		expect(
			tokenizeLine(inputLine, 0, [createColorToken(inputLine, outputLine)], 'input', false)[3],
		).toEqual({
			type: 'val-hsl',
			text: '220 10% 50%',
		});

		expect(
			tokenizeLine(outputLine, 0, [createColorToken(inputLine, outputLine)], 'output', false)[3],
		).toEqual({
			type: 'val-oklch',
			text: 'oklch(0.583 0.028 264.00)',
		});
	});

	it('preserves trailing inline comments on custom properties', () => {
		expect(
			tokenizeLine('  --primary: 220 10% 50%; /* accent */', 0, [], 'input', true),
		).toEqual([
			{ type: 'plain', text: '  ' },
			{ type: 'prop', text: '--primary' },
			{ type: 'punct', text: ': ' },
			{ type: 'val-hsl', text: '220 10% 50%' },
			{ type: 'punct', text: ';' },
			{ type: 'comment', text: ' /* accent */' },
		]);
	});

	it('computes contrast color from OKLCH lightness', () => {
		expect(contrastColor(0.61)).toBe('#111');
		expect(contrastColor(0.6)).toBe('#fff');
	});
});
