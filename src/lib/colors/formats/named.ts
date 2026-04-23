import { colorsNamed, parse } from 'culori';
import type { ColorFormatModule, ParsedColor } from '../types';

export function isNamedColor(value: string): boolean {
	return Object.prototype.hasOwnProperty.call(colorsNamed, value.toLowerCase());
}

export function parseNamedColor(input: string): ParsedColor | null {
	if (!isNamedColor(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'named', color } : null;
}

export const namedFormat: ColorFormatModule = {
	id: 'named',
	label: 'Named',
	parse: parseNamedColor,
};
