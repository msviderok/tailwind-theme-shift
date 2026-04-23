import { parse } from 'culori';
import type { ColorFormatModule, ParsedColor } from '../types';

export function parseTransparentColor(input: string): ParsedColor | null {
	if (input.toLowerCase() !== 'transparent') return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'transparent', color } : null;
}

export const transparentFormat: ColorFormatModule = {
	id: 'transparent',
	label: 'Transparent',
	parse: parseTransparentColor,
};
