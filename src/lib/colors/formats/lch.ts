import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, fixedNumber, hue, toMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const LCH_RE = /^lch\(/i;

export function parseLchColor(input: string): ParsedColor | null {
	if (!LCH_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'lch', color } : null;
}

export function serializeLch(color: CuloriColor): string {
	const lch = toMode('lch', color);
	return `lch(${fixedNumber(channel(lch, 'l'), 2)}% ${fixedNumber(
		channel(lch, 'c'),
		2,
	)} ${fixedNumber(hue(channel(lch, 'h')), 2)}${alphaSuffix(lch)})`;
}

export const lchFormat: ColorFormatModule = {
	id: 'lch',
	label: 'LCH',
	parse: parseLchColor,
	serialize: serializeLch,
};
