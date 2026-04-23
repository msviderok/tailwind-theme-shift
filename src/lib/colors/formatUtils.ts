import { clampGamut, converter } from 'culori';
import type { CuloriColor } from 'culori';

const modeConverters = new Map<string, (color: CuloriColor) => CuloriColor>();

export function toMode(mode: string, color: CuloriColor): CuloriColor {
	let convert = modeConverters.get(mode);
	if (!convert) {
		convert = converter(mode);
		modeConverters.set(mode, convert);
	}
	return convert(color);
}

export function toBoundedMode(mode: string, color: CuloriColor): CuloriColor {
	const clamped = clampGamut(mode)(color) ?? color;
	return toMode(mode, clamped);
}

export function channel(color: CuloriColor, key: string, fallback = 0): number {
	const value = color[key];
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function alpha(color: CuloriColor): number | undefined {
	return typeof color.alpha === 'number' && color.alpha < 1 ? clamp01(color.alpha) : undefined;
}

export function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

export function trimNumber(value: number, digits = 3): string {
	if (!Number.isFinite(value)) return '0';
	const fixed = value.toFixed(digits);
	return fixed.replace(/\.?0+$/, '');
}

export function fixedNumber(value: number, digits: number): string {
	return Number.isFinite(value) ? value.toFixed(digits) : (0).toFixed(digits);
}

export function alphaSuffix(color: CuloriColor): string {
	const a = alpha(color);
	return a === undefined ? '' : ` / ${trimNumber(a, 3)}`;
}

export function hue(value: number): number {
	if (!Number.isFinite(value)) return 0;
	const normalized = value % 360;
	return normalized < 0 ? normalized + 360 : normalized;
}
