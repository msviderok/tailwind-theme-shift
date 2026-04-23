import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, fixedNumber, toMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const LAB_RE = /^lab\(/i;

export function parseLabColor(input: string): ParsedColor | null {
	if (!LAB_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'lab', color } : null;
}

export function serializeLab(color: CuloriColor): string {
	const lab = toMode('lab', color);
	return `lab(${fixedNumber(channel(lab, 'l'), 2)}% ${fixedNumber(
		channel(lab, 'a'),
		2,
	)} ${fixedNumber(channel(lab, 'b'), 2)}${alphaSuffix(lab)})`;
}

export const labFormat: ColorFormatModule = {
	id: 'lab',
	label: 'LAB',
	parse: parseLabColor,
	serialize: serializeLab,
};
