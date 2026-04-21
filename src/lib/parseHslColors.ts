import { hslToOklch } from './hslToOklch';

interface HslToken {
	start: number;
	end: number;
	raw: string;
	h: number;
	s: number;
	l: number;
	a?: string;
}

export interface ColorToken {
	/** start offset in the SOURCE string */
	inputStart: number;
	inputEnd: number;
	inputCss: string; // e.g. "hsl(220 10% 50%)"
	/** start offset in the OUTPUT string */
	outputStart: number;
	outputEnd: number;
	outputCss: string; // e.g. "oklch(0.523 0.076 258.34)"
	/** oklch L value [0,1], used for swatch foreground contrast */
	oklchL: number;
}

// ---------------------------------------------------------------------------
// Hue normalisation
// ---------------------------------------------------------------------------
function normaliseHue(raw: string): number {
	const v = parseFloat(raw);
	if (/turn/i.test(raw)) return v * 360;
	if (/rad/i.test(raw)) return (v * 180) / Math.PI;
	if (/grad/i.test(raw)) return v * 0.9;
	return v; // deg or unitless
}

// ---------------------------------------------------------------------------
// OKLCH formatter
// ---------------------------------------------------------------------------
function formatOklch(okl: number, okc: number, okh: number, alpha?: string): string {
	const body = `${okl.toFixed(3)} ${okc.toFixed(3)} ${okh.toFixed(2)}`;
	return alpha !== undefined ? `oklch(${body} / ${alpha})` : `oklch(${body})`;
}

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

// Functional hsl()/hsla()
// Handles modern (space-sep) and legacy (comma-sep), optional alpha after / or ,
const FUNCTIONAL_HSL_EXACT =
	/^hsla?\(\s*([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s*[,\s]\s*([+-]?\d*\.?\d+)%\s*[,\s]\s*([+-]?\d*\.?\d+)%\s*(?:[,/]\s*([+-]?\d*\.?\d+%?))?\s*\)$/i;

// Bare triplet used as the full custom property value.
const BARE_TRIPLET_EXACT =
	/^([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s+(\d*\.?\d+)%\s+(\d*\.?\d+)%\s*(?:\/\s*([\d.]+%?))?$/i;

// Any custom property declaration anywhere in the source.
const CUSTOM_PROPERTY_DECL = /(--[\w-]+\s*:\s*)([^;]+)(;)/g;

// ---------------------------------------------------------------------------
// Main: findHslTokens
// ---------------------------------------------------------------------------
export function findHslTokens(src: string): HslToken[] {
	const tokens: HslToken[] = [];
	let m: RegExpExecArray | null;

	CUSTOM_PROPERTY_DECL.lastIndex = 0;
	while ((m = CUSTOM_PROPERTY_DECL.exec(src)) !== null) {
		const [, prefix, rawValue] = m;
		const trimmedValue = rawValue.trim();
		const leadingWhitespace = rawValue.match(/^\s*/)?.[0].length ?? 0;
		const valueStart = m.index + prefix.length + leadingWhitespace;

		const functional = FUNCTIONAL_HSL_EXACT.exec(trimmedValue);
		if (functional) {
			const [full, rawH, rawS, rawL, rawA] = functional;
			tokens.push({
				start: valueStart,
				end: valueStart + full.length,
				raw: full,
				h: normaliseHue(rawH),
				s: parseFloat(rawS),
				l: parseFloat(rawL),
				a: rawA,
			});
			continue;
		}

		const bare = BARE_TRIPLET_EXACT.exec(trimmedValue);
		if (!bare) continue;

		const [full, rawH, rawS, rawL, rawA] = bare;
		tokens.push({
			start: valueStart,
			end: valueStart + full.length,
			raw: full,
			h: normaliseHue(rawH),
			s: parseFloat(rawS),
			l: parseFloat(rawL),
			a: rawA,
		});
	}

	// Sort by start position
	tokens.sort((a, b) => a.start - b.start);
	return tokens;
}

// ---------------------------------------------------------------------------
// convertHslToOklchCss – CSS mode (replaces in-place)
// ---------------------------------------------------------------------------
export function convertHslToOklchCss(src: string): { output: string; tokens: ColorToken[] } {
	const hslTokens = findHslTokens(src);
	if (hslTokens.length === 0) {
		return convertRawHsl(src);
	}

	const colorTokens: ColorToken[] = [];

	let output = '';
	let cursor = 0;
	let outputCursor = 0;

	for (const t of hslTokens) {
		// Append unchanged text before this token
		const before = src.slice(cursor, t.start);
		output += before;
		outputCursor += before.length;

		const ok = hslToOklch(t.h, t.s, t.l);
		const oklchStr = formatOklch(ok.l, ok.c, ok.h, t.a);
		const inputCss = t.raw.startsWith('hsl')
			? t.raw
			: `hsl(${t.h} ${t.s}% ${t.l}%${t.a !== undefined ? ` / ${t.a}` : ''})`;

		colorTokens.push({
			inputStart: t.start,
			inputEnd: t.end,
			inputCss,
			outputStart: outputCursor,
			outputEnd: outputCursor + oklchStr.length,
			outputCss: oklchStr,
			oklchL: ok.l,
		});

		output += oklchStr;
		outputCursor += oklchStr.length;
		cursor = t.end;
	}

	output += src.slice(cursor);
	return { output, tokens: colorTokens };
}

// ---------------------------------------------------------------------------
// convertRawHsl – single value mode
// ---------------------------------------------------------------------------
export function convertRawHsl(src: string): { output: string; tokens: ColorToken[] } {
	const trimmed = src.trim().replace(/;$/, '').trim();

	// Try functional first
	const fm = FUNCTIONAL_HSL_EXACT.exec(trimmed);
	if (fm) {
		const [, rawH, rawS, rawL, rawA] = fm;
		const ok = hslToOklch(normaliseHue(rawH), parseFloat(rawS), parseFloat(rawL));
		const oklchStr = formatOklch(ok.l, ok.c, ok.h, rawA);
		const token: ColorToken = {
			inputStart: 0,
			inputEnd: trimmed.length,
			inputCss: trimmed,
			outputStart: 0,
			outputEnd: oklchStr.length,
			outputCss: oklchStr,
			oklchL: ok.l,
		};
		return { output: oklchStr, tokens: [token] };
	}

	// Try bare triplet (H S% L% with optional / alpha)
	const bm = BARE_TRIPLET_EXACT.exec(trimmed);
	if (bm) {
		const [, rawH, rawS, rawL, rawA] = bm;
		const ok = hslToOklch(normaliseHue(rawH), parseFloat(rawS), parseFloat(rawL));
		const oklchStr = formatOklch(ok.l, ok.c, ok.h, rawA);
		const token: ColorToken = {
			inputStart: 0,
			inputEnd: trimmed.length,
			inputCss: `hsl(${rawH} ${rawS}% ${rawL}%)`,
			outputStart: 0,
			outputEnd: oklchStr.length,
			outputCss: oklchStr,
			oklchL: ok.l,
		};
		return { output: oklchStr, tokens: [token] };
	}

	return { output: src, tokens: [] };
}
