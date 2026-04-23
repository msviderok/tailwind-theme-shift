import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, fixedNumber, toMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const OKLAB_RE = /^oklab\(/i;

export function parseOklabColor(input: string): ParsedColor | null {
	if (!OKLAB_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'oklab', color } : null;
}

export function serializeOklab(color: CuloriColor): string {
	const oklab = toMode('oklab', color);
	return `oklab(${fixedNumber(channel(oklab, 'l'), 3)} ${fixedNumber(
		channel(oklab, 'a'),
		3,
	)} ${fixedNumber(channel(oklab, 'b'), 3)}${alphaSuffix(oklab)})`;
}

export const oklabFormat: ColorFormatModule = {
	id: 'oklab',
	label: 'OKLAB',
	parse: parseOklabColor,
	serialize: serializeOklab,
};
