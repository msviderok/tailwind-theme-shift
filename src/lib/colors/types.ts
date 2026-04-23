import type { CuloriColor } from 'culori';

export type OutputFormatId =
	| 'oklch'
	| 'oklab'
	| 'lch'
	| 'lab'
	| 'hsl'
	| 'hwb'
	| 'rgb'
	| 'hex'
	| 'color-srgb'
	| 'color-srgb-linear'
	| 'color-display-p3'
	| 'color-a98-rgb'
	| 'color-prophoto-rgb'
	| 'color-rec2020'
	| 'color-xyz'
	| 'color-xyz-d50'
	| 'color-xyz-d65';

export interface ParsedColor {
	source: string;
	formatId: string;
	color: CuloriColor;
}

export interface ColorFormatModule {
	id: string;
	label: string;
	parse(input: string): ParsedColor | null;
	serialize?(color: CuloriColor): string;
}

export interface OutputFormatOption {
	id: OutputFormatId;
	label: string;
	serialize(color: CuloriColor): string;
}

export interface ConversionToken {
	inputStart: number;
	inputEnd: number;
	inputCss: string;
	inputFormat: string;
	outputStart: number;
	outputEnd: number;
	outputCss: string;
	outputFormat: OutputFormatId;
	previewCss: string;
	oklchL: number;
}
