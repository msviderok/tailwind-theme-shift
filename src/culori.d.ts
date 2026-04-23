declare module 'culori' {
	export interface CuloriColor {
		mode: string;
		alpha?: number;
		[channel: string]: string | number | undefined;
	}

	export const colorsNamed: Record<string, string>;

	export function parse(color: string): CuloriColor | undefined;
	export function converter(mode: string): (color: CuloriColor) => CuloriColor;
	export function clampGamut(mode?: string): (color: CuloriColor) => CuloriColor | undefined;
}
