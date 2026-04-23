import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, clamp01, hue, toBoundedMode, trimNumber } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const HSL_RE = /^hsla?\(/i;
const BARE_HSL_RE =
	/^([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%(?:\s*\/\s*([+-]?\d*\.?\d+%?))?$/i;

function normalizeHue(raw: string): number {
	const value = parseFloat(raw);
	if (/turn/i.test(raw)) return value * 360;
	if (/rad/i.test(raw)) return (value * 180) / Math.PI;
	if (/grad/i.test(raw)) return value * 0.9;
	return value;
}

function normalizeAlpha(raw: string | undefined): number | undefined {
	if (raw === undefined) return undefined;
	const value = parseFloat(raw);
	return raw.endsWith('%') ? value / 100 : value;
}

export function parseHslColor(input: string): ParsedColor | null {
	const bare = BARE_HSL_RE.exec(input);
	if (bare) {
		const [, rawH, rawS, rawL, rawA] = bare;
		const alpha = normalizeAlpha(rawA);
		return {
			source: input,
			formatId: 'hsl-triplet',
			color: {
				mode: 'hsl',
				h: normalizeHue(rawH),
				s: parseFloat(rawS) / 100,
				l: parseFloat(rawL) / 100,
				...(alpha === undefined ? {} : { alpha }),
			},
		};
	}

	if (!HSL_RE.test(input)) return null;
	const color = parse(input);
	return color
		? { source: input, formatId: input.toLowerCase().startsWith('hsla') ? 'hsla' : 'hsl', color }
		: null;
}

export function serializeHsl(color: CuloriColor): string {
	const hsl = toBoundedMode('hsl', color);
	return `hsl(${trimNumber(hue(channel(hsl, 'h')), 2)} ${trimNumber(
		clamp01(channel(hsl, 's')) * 100,
		2,
	)}% ${trimNumber(clamp01(channel(hsl, 'l')) * 100, 2)}%${alphaSuffix(hsl)})`;
}

export const hslFormat: ColorFormatModule = {
	id: 'hsl',
	label: 'HSL',
	parse: parseHslColor,
	serialize: serializeHsl,
};
