import { serializeColorFunction } from './formats/colorFunction';
import type { ColorSpaceName } from './formats/colorFunction';
import { colorFunctionFormat, OUTPUT_FORMAT_TO_COLOR_SPACE } from './formats/colorFunction';
import { hexFormat, serializeHex } from './formats/hex';
import { hslFormat, serializeHsl } from './formats/hsl';
import { hwbFormat, serializeHwb } from './formats/hwb';
import { labFormat, serializeLab } from './formats/lab';
import { lchFormat, serializeLch } from './formats/lch';
import { namedFormat } from './formats/named';
import { oklabFormat, serializeOklab } from './formats/oklab';
import { oklchFormat, serializeOklch } from './formats/oklch';
import { rgbFormat, serializeRgb } from './formats/rgb';
import { transparentFormat } from './formats/transparent';
import type { ColorFormatModule, OutputFormatId, OutputFormatOption, ParsedColor } from './types';

export const DEFAULT_OUTPUT_FORMAT: OutputFormatId = 'oklch';

export const inputColorFormats: ColorFormatModule[] = [
	rgbFormat,
	hslFormat,
	hwbFormat,
	labFormat,
	lchFormat,
	oklabFormat,
	oklchFormat,
	colorFunctionFormat,
	hexFormat,
	transparentFormat,
	namedFormat,
];

function colorFunctionSerializer(formatId: OutputFormatId) {
	const space = OUTPUT_FORMAT_TO_COLOR_SPACE[formatId] as ColorSpaceName;
	return (color: Parameters<typeof serializeColorFunction>[0]) => serializeColorFunction(color, space);
}

export const outputFormatOptions: OutputFormatOption[] = [
	{ id: 'oklch', label: 'OKLCH', serialize: serializeOklch },
	{ id: 'oklab', label: 'OKLAB', serialize: serializeOklab },
	{ id: 'lch', label: 'LCH', serialize: serializeLch },
	{ id: 'lab', label: 'LAB', serialize: serializeLab },
	{ id: 'hsl', label: 'HSL', serialize: serializeHsl },
	{ id: 'hwb', label: 'HWB', serialize: serializeHwb },
	{ id: 'rgb', label: 'RGB', serialize: serializeRgb },
	{ id: 'hex', label: 'HEX', serialize: serializeHex },
	{ id: 'color-srgb', label: 'color(srgb)', serialize: colorFunctionSerializer('color-srgb') },
	{
		id: 'color-srgb-linear',
		label: 'color(srgb-linear)',
		serialize: colorFunctionSerializer('color-srgb-linear'),
	},
	{
		id: 'color-display-p3',
		label: 'color(display-p3)',
		serialize: colorFunctionSerializer('color-display-p3'),
	},
	{
		id: 'color-a98-rgb',
		label: 'color(a98-rgb)',
		serialize: colorFunctionSerializer('color-a98-rgb'),
	},
	{
		id: 'color-prophoto-rgb',
		label: 'color(prophoto-rgb)',
		serialize: colorFunctionSerializer('color-prophoto-rgb'),
	},
	{
		id: 'color-rec2020',
		label: 'color(rec2020)',
		serialize: colorFunctionSerializer('color-rec2020'),
	},
	{ id: 'color-xyz', label: 'color(xyz)', serialize: colorFunctionSerializer('color-xyz') },
	{
		id: 'color-xyz-d50',
		label: 'color(xyz-d50)',
		serialize: colorFunctionSerializer('color-xyz-d50'),
	},
	{
		id: 'color-xyz-d65',
		label: 'color(xyz-d65)',
		serialize: colorFunctionSerializer('color-xyz-d65'),
	},
];

export function getOutputFormat(formatId: OutputFormatId): OutputFormatOption {
	return (
		outputFormatOptions.find((option) => option.id === formatId) ??
		outputFormatOptions.find((option) => option.id === DEFAULT_OUTPUT_FORMAT)!
	);
}

export function isOutputFormatId(value: string): value is OutputFormatId {
	return outputFormatOptions.some((option) => option.id === value);
}

export function parseSupportedColor(input: string): ParsedColor | null {
	for (const format of inputColorFormats) {
		const parsed = format.parse(input);
		if (parsed) return parsed;
	}
	return null;
}

export function supportedFunctionNames(): Set<string> {
	return new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color']);
}
