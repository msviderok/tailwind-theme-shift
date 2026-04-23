import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import { alphaSuffix, channel, clamp01, hue, toBoundedMode, trimNumber } from '../formatUtils';
import type { ColorFormatModule, ParsedColor } from '../types';

const HWB_RE = /^hwb\(/i;

export function parseHwbColor(input: string): ParsedColor | null {
	if (!HWB_RE.test(input)) return null;
	const color = parse(input);
	return color ? { source: input, formatId: 'hwb', color } : null;
}

export function serializeHwb(color: CuloriColor): string {
	const hwb = toBoundedMode('hwb', color);
	return `hwb(${trimNumber(hue(channel(hwb, 'h')), 2)} ${trimNumber(
		clamp01(channel(hwb, 'w')) * 100,
		2,
	)}% ${trimNumber(clamp01(channel(hwb, 'b')) * 100, 2)}%${alphaSuffix(hwb)})`;
}

export const hwbFormat: ColorFormatModule = {
	id: 'hwb',
	label: 'HWB',
	parse: parseHwbColor,
	serialize: serializeHwb,
};
