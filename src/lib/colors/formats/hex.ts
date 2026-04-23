import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alpha, channel, clamp01, toBoundedMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function toHexByte(value: number): string {
	return Math.round(clamp01(value) * 255)
		.toString(16)
		.padStart(2, '0');
}

export function parseHexColor(input: string): ParsedColor | null {
	if (!HEX_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'hex', color } : null;
}

export function serializeHex(color: CuloriColor): string {
	const rgb = toBoundedMode('rgb', color);
	const body = `${toHexByte(channel(rgb, 'r'))}${toHexByte(channel(rgb, 'g'))}${toHexByte(
		channel(rgb, 'b'),
	)}`;
	const a = alpha(rgb);
	return `#${body}${a === undefined ? '' : toHexByte(a)}`;
}

export const hexFormat: ColorFormatModule = {
	id: 'hex',
	label: 'HEX',
	parse: parseHexColor,
	serialize: serializeHex,
};
