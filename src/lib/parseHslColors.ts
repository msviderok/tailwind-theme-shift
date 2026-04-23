import { convertCssColors } from './colors/convert';
import type { ConversionToken } from './colors/types';

interface HslToken {
	start: number;
	end: number;
	raw: string;
	h: number;
	s: number;
	l: number;
	a?: string;
}

export type ColorToken = ConversionToken;

export function findHslTokens(src: string): HslToken[] {
	const { tokens } = convertCssColors(src, 'oklch');
	return tokens
		.filter((token) => token.inputFormat === 'hsl' || token.inputFormat === 'hsla')
		.map((token) => ({
			start: token.inputStart,
			end: token.inputEnd,
			raw: token.inputCss,
			h: 0,
			s: 0,
			l: 0,
		}));
}

export function convertHslToOklchCss(src: string): { output: string; tokens: ColorToken[] } {
	return convertCssColors(src, 'oklch');
}

export function convertRawHsl(src: string): { output: string; tokens: ColorToken[] } {
	return convertCssColors(src, 'oklch');
}
