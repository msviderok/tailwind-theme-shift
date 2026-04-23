import { parse } from 'culori';
import type { CuloriColor } from 'culori';
import {
	alphaSuffix,
	channel,
	toBoundedMode,
	toMode,
	trimNumber,
} from '../formatUtils';
import type { ColorFormatModule, OutputFormatId, ParsedColor } from '../types';

const COLOR_FUNCTION_RE = /^color\(\s*([a-z0-9-]+)/i;

export const COLOR_SPACE_TO_MODE = {
	'srgb': 'rgb',
	'srgb-linear': 'lrgb',
	'display-p3': 'p3',
	'a98-rgb': 'a98',
	'prophoto-rgb': 'prophoto',
	'rec2020': 'rec2020',
	'xyz': 'xyz65',
	'xyz-d50': 'xyz50',
	'xyz-d65': 'xyz65',
} as const;

export type ColorSpaceName = keyof typeof COLOR_SPACE_TO_MODE;

export const OUTPUT_FORMAT_TO_COLOR_SPACE: Partial<Record<OutputFormatId, ColorSpaceName>> = {
	'color-srgb': 'srgb',
	'color-srgb-linear': 'srgb-linear',
	'color-display-p3': 'display-p3',
	'color-a98-rgb': 'a98-rgb',
	'color-prophoto-rgb': 'prophoto-rgb',
	'color-rec2020': 'rec2020',
	'color-xyz': 'xyz',
	'color-xyz-d50': 'xyz-d50',
	'color-xyz-d65': 'xyz-d65',
};

const RGB_LIKE_MODES = new Set(['rgb', 'lrgb', 'p3', 'a98', 'prophoto', 'rec2020']);

function isSupportedColorSpace(value: string): value is ColorSpaceName {
	return Object.prototype.hasOwnProperty.call(COLOR_SPACE_TO_MODE, value);
}

export function parseColorFunction(input: string): ParsedColor | null {
	const match = COLOR_FUNCTION_RE.exec(input);
	if (!match) return null;

	const space = match[1].toLowerCase();
	if (!isSupportedColorSpace(space)) return null;

	const color = parse(input);
	return color ? { source: input, formatId: `color-${space}`, color } : null;
}

export function serializeColorFunction(color: CuloriColor, space: ColorSpaceName): string {
	const mode = COLOR_SPACE_TO_MODE[space];
	const converted = RGB_LIKE_MODES.has(mode) ? toBoundedMode(mode, color) : toMode(mode, color);
	const channels =
		mode === 'xyz50' || mode === 'xyz65'
			? [channel(converted, 'x'), channel(converted, 'y'), channel(converted, 'z')]
			: [channel(converted, 'r'), channel(converted, 'g'), channel(converted, 'b')];

	return `color(${space} ${channels.map((value) => trimNumber(value, 5)).join(' ')}${alphaSuffix(
		converted,
	)})`;
}

export const colorFunctionFormat: ColorFormatModule = {
	id: 'color',
	label: 'color()',
	parse: parseColorFunction,
};
