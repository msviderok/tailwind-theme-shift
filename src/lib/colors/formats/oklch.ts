import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, fixedNumber, hue, toMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const OKLCH_RE = /^oklch\(/i;

export function parseOklchColor(input: string): ParsedColor | null {
	if (!OKLCH_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'oklch', color } : null;
}

export function serializeOklch(color: CuloriColor): string {
	const oklch = toMode('oklch', color);
	return `oklch(${fixedNumber(channel(oklch, 'l'), 3)} ${fixedNumber(
		channel(oklch, 'c'),
		3,
	)} ${fixedNumber(hue(channel(oklch, 'h')), 2)}${alphaSuffix(oklch)})`;
}

export const oklchFormat: ColorFormatModule = {
	id: 'oklch',
	label: 'OKLCH',
	parse: parseOklchColor,
	serialize: serializeOklch,
};
