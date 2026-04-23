import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, clamp01, toBoundedMode } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const RGB_RE = /^rgba?\(/i;

function rgbChannel(value: number): number {
	return Math.round(clamp01(value) * 255);
}

export function parseRgbColor(input: string): ParsedColor | null {
	if (!RGB_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: input.toLowerCase().startsWith('rgba') ? 'rgba' : 'rgb', color } : null;
}

export function serializeRgb(color: CuloriColor): string {
	const rgb = toBoundedMode('rgb', color);
	return `rgb(${rgbChannel(channel(rgb, 'r'))} ${rgbChannel(channel(rgb, 'g'))} ${rgbChannel(
		channel(rgb, 'b'),
	)}${alphaSuffix(rgb)})`;
}

export const rgbFormat: ColorFormatModule = {
	id: 'rgb',
	label: 'RGB',
	parse: parseRgbColor,
	serialize: serializeRgb,
};
