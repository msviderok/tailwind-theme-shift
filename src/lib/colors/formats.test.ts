import { describe, expect, it } from 'vite-plus/test';
import { outputFormatOptions, parseSupportedColor } from './registry';

describe('supported color format parsing', () => {
	const cases = [
		['#abc', 'hex'],
		['#abcd', 'hex'],
		['#aabbcc', 'hex'],
		['#aabbccdd', 'hex'],
		['red', 'named'],
		['transparent', 'transparent'],
		['rgb(255 0 0 / 0.5)', 'rgb'],
		['rgba(255, 0, 0, 0.5)', 'rgba'],
		['hsl(220 10% 50%)', 'hsl'],
		['hsla(220, 10%, 50%, 0.5)', 'hsla'],
		['hwb(220 45% 45%)', 'hwb'],
		['lab(54.2% -2 -18)', 'lab'],
		['lch(54.2% 18.4 270)', 'lch'],
		['oklab(0.583 -0.003 -0.028)', 'oklab'],
		['oklch(0.583 0.028 264)', 'oklch'],
		['color(srgb 1 0 0)', 'color-srgb'],
		['color(srgb-linear 1 0 0)', 'color-srgb-linear'],
		['color(display-p3 1 0 0)', 'color-display-p3'],
		['color(a98-rgb 1 0 0)', 'color-a98-rgb'],
		['color(prophoto-rgb 1 0 0)', 'color-prophoto-rgb'],
		['color(rec2020 1 0 0)', 'color-rec2020'],
		['color(xyz 0.1 0.2 0.3)', 'color-xyz'],
		['color(xyz-d50 0.1 0.2 0.3)', 'color-xyz-d50'],
		['color(xyz-d65 0.1 0.2 0.3)', 'color-xyz-d65'],
	] as const;

	it.each(cases)('parses %s as %s', (input, formatId) => {
		expect(parseSupportedColor(input)?.formatId).toBe(formatId);
	});

	it('rejects dynamic or contextual color syntax', () => {
		for (const input of [
			'currentColor',
			'CanvasText',
			'color-mix(in oklch, red, blue)',
			'light-dark(red, blue)',
			'contrast-color(red)',
			'alpha(red / 50%)',
			'device-cmyk(0 1 1 0)',
		]) {
			expect(parseSupportedColor(input), input).toBeNull();
		}
	});
});

describe('output format serializers', () => {
	it('serializes every exposed output format', () => {
		const parsed = parseSupportedColor('color(display-p3 1 0 0)');
		expect(parsed).toBeTruthy();

		for (const option of outputFormatOptions) {
			expect(option.serialize(parsed!.color), option.id).toMatch(/^(?:#|rgb|hsl|hwb|lab|lch|oklab|oklch|color\()/);
		}
	});
});
