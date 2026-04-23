import { getOutputFormat, parseSupportedColor } from './registry';
import { scanCssVariableDeclarations } from './scanCssVariables';
import { replaceColorsInValue } from './replaceColors';
import { channel, toMode } from './formatUtils';
import type { ConversionToken, OutputFormatId } from './types';

function stripOptionalSemicolon(src: string): { value: string; leading: number } {
	const leading = src.length - src.trimStart().length;
	const trimmed = src.trim();
	const value = trimmed.endsWith(';') ? trimmed.slice(0, -1).trimEnd() : trimmed;
	return { value, leading };
}

function convertRawColor(
	source: string,
	outputFormat: ReturnType<typeof getOutputFormat>,
	outputFormatId: OutputFormatId,
): { output: string; tokens: ConversionToken[] } | null {
	const { value, leading } = stripOptionalSemicolon(source);
	const parsed = parseSupportedColor(value);
	if (!parsed) return null;

	const output = outputFormat.serialize(parsed.color);
	const oklch = toMode('oklch', parsed.color);
	return {
		output,
		tokens: [
			{
				inputStart: leading,
				inputEnd: leading + value.length,
				inputCss: value,
				inputFormat: parsed.formatId,
				outputStart: 0,
				outputEnd: output.length,
				outputCss: output,
				outputFormat: outputFormatId,
				previewCss: output,
				oklchL: channel(oklch, 'l'),
			},
		],
	};
}

export function convertCssColors(
	source: string,
	outputFormatId: OutputFormatId,
): { output: string; tokens: ConversionToken[] } {
	const outputFormat = getOutputFormat(outputFormatId);
	const raw = convertRawColor(source, outputFormat, outputFormatId);
	if (raw) return raw;

	const declarations = scanCssVariableDeclarations(source);
	if (declarations.length === 0) return { output: source, tokens: [] };

	const tokens: ConversionToken[] = [];
	let output = '';
	let inputCursor = 0;

	for (const declaration of declarations) {
		const before = source.slice(inputCursor, declaration.valueStart);
		output += before;

		const replacement = replaceColorsInValue(
			declaration.value,
			declaration.valueStart,
			output.length,
			outputFormat,
			outputFormatId,
		);

		output += replacement.output;
		tokens.push(...replacement.tokens);
		inputCursor = declaration.valueEnd;
	}

	output += source.slice(inputCursor);
	return { output, tokens };
}

export type { ConversionToken, OutputFormatId } from './types';
