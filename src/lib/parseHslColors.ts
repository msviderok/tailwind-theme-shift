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

// Pattern 1 – functional hsl()/hsla()
// Handles modern (space-sep) and legacy (comma-sep), optional alpha after / or ,
const FUNCTIONAL_HSL =
	/hsla?\(\s*([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s*[,\s]\s*([+-]?\d*\.?\d+)%\s*[,\s]\s*([+-]?\d*\.?\d+)%\s*(?:[,/]\s*([+-]?\d*\.?\d+%?))?\s*\)/gi;

// Pattern 2 – bare triplet in custom-property: H S% L% ;
// We capture the full declaration so we can replace only the triplet portion
const BARE_TRIPLET_IN_DECL =
	/(--[\w-]+\s*:\s*)([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s+(\d*\.?\d+)%\s+(\d*\.?\d+)%\s*(?:\/\s*([\d.]+%?))?\s*;/g;

// ---------------------------------------------------------------------------
// Detect whether an offset is inside a :root / @theme block
// ---------------------------------------------------------------------------
function buildThemeRanges(src: string): Array<[number, number]> {
	const ranges: Array<[number, number]> = [];
	// Match :root or @theme (with optional inline) followed by { ... }
	const opener = /(?::root|@theme(?:\s+\w+)?)\s*\{/g;
	let m: RegExpExecArray | null;
	while ((m = opener.exec(src)) !== null) {
		const start = m.index;
		let depth = 0;
		let i = m.index + m[0].length - 1; // points at the opening '{'
		while (i < src.length) {
			if (src[i] === '{') depth++;
			else if (src[i] === '}') {
				depth--;
				if (depth === 0) {
					ranges.push([start, i]);
					break;
				}
			}
			i++;
		}
	}
	return ranges;
}

function inThemeRange(offset: number, ranges: Array<[number, number]>): boolean {
	return ranges.some(([s, e]) => offset >= s && offset <= e);
}

// ---------------------------------------------------------------------------
// Main: findHslTokens
// ---------------------------------------------------------------------------
export function findHslTokens(src: string): HslToken[] {
	const tokens: HslToken[] = [];
	const themeRanges = buildThemeRanges(src);

	// --- functional hsl()/hsla() anywhere in the source ---
	FUNCTIONAL_HSL.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = FUNCTIONAL_HSL.exec(src)) !== null) {
		const [full, rawH, rawS, rawL, rawA] = m;
		tokens.push({
			start: m.index,
			end: m.index + full.length,
			raw: full,
			h: normaliseHue(rawH),
			s: parseFloat(rawS),
			l: parseFloat(rawL),
			a: rawA,
		});
	}

	// --- bare triplets inside :root / @theme only ---
	BARE_TRIPLET_IN_DECL.lastIndex = 0;
	while ((m = BARE_TRIPLET_IN_DECL.exec(src)) !== null) {
		const [full, prefix, rawH, rawS, rawL, rawA] = m;
		const tripletStart = m.index + prefix.length;
		// Skip if a functional hsl token already covers this offset
		const alreadyCovered = tokens.some((t) => t.start <= tripletStart && tripletStart < t.end);
		if (alreadyCovered) continue;
		if (!inThemeRange(m.index, themeRanges)) continue;

		tokens.push({
			start: tripletStart,
			// end covers up to (not including) the semicolon — we replace just the triplet portion
			end: m.index + full.length - 1, // stop before ';'
			raw: src.slice(tripletStart, m.index + full.length - 1),
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
		const inputCss = t.raw.startsWith('hsl') ? t.raw : `hsl(${t.h} ${t.s}% ${t.l}%)`;

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
	FUNCTIONAL_HSL.lastIndex = 0;
	const fm = FUNCTIONAL_HSL.exec(trimmed);
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
	const BARE =
		/^([+-]?\d*\.?\d+(?:deg|rad|turn|grad)?)\s+(\d*\.?\d+)%\s+(\d*\.?\d+)%\s*(?:\/\s*([\d.]+%?))?$/i;
	const bm = BARE.exec(trimmed);
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
