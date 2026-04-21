import { describe, expect, it } from 'vite-plus/test';
import { convertHslToOklchCss, convertRawHsl, findHslTokens } from './parseHslColors';

// Helper: assert oklch output contains expected L C H values (approx)
function assertOklch(oklch: string, expL: number, expC: number, expH: number) {
	const m = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
	expect(m, `Not a valid oklch string: ${oklch}`).toBeTruthy();
	expect(parseFloat(m![1])).toBeCloseTo(expL, 2);
	expect(parseFloat(m![2])).toBeCloseTo(expC, 2);
	if (expC > 0.001) {
		// hue only meaningful for chromatic colors
		expect(parseFloat(m![3])).toBeCloseTo(expH, 0);
	}
}

describe('parseHslColors – functional hsl()', () => {
	it('modern space-separated: hsl(220 10% 50%)', () => {
		const src = 'hsl(220 10% 50%)';
		const { output } = convertHslToOklchCss(src);
		expect(output).toMatch(/^oklch\(/);
		assertOklch(output, 0.583, 0.028, 264);
	});

	it('legacy comma-separated: hsl(220, 10%, 50%)', () => {
		const { output: modern } = convertHslToOklchCss('hsl(220 10% 50%)');
		const { output: legacy } = convertHslToOklchCss('hsl(220, 10%, 50%)');
		expect(modern).toBe(legacy);
	});

	it('hsla legacy alpha: hsla(220, 10%, 50%, 0.5)', () => {
		const { output } = convertHslToOklchCss('hsla(220, 10%, 50%, 0.5)');
		expect(output).toMatch(/oklch\(.*\/\s*0\.5/);
	});

	it('modern alpha with /: hsl(220 10% 50% / 50%)', () => {
		const { output } = convertHslToOklchCss('hsl(220 10% 50% / 50%)');
		expect(output).toMatch(/oklch\(.*\/\s*50%/);
	});

	it('hue in turns: hsl(1turn 50% 50%)', () => {
		// 1turn = 360deg = same as 0deg
		const { output } = convertHslToOklchCss('hsl(1turn 50% 50%)');
		expect(output).toMatch(/^oklch\(/);
	});
});

describe('parseHslColors – bare triplets', () => {
	it('bare triplet inside :root{} is converted', () => {
		const src = `:root {\n  --primary: 222.2 47.4% 11.2%;\n}`;
		const { output } = convertHslToOklchCss(src);
		expect(output).toContain('oklch(');
		expect(output).not.toContain('222.2 47.4% 11.2%');
	});

	it('bare triplet inside @theme{} is converted', () => {
		const src = `@theme {\n  --color-primary: 222.2 47.4% 11.2%;\n}`;
		const { output } = convertHslToOklchCss(src);
		expect(output).toContain('oklch(');
	});

	it('bare triplet OUTSIDE a theme block is left untouched', () => {
		const src = `body { --primary: 222.2 47.4% 11.2%; }`;
		const { output } = convertHslToOklchCss(src);
		// Should not convert since it's not in :root or @theme
		expect(output).toBe(src);
	});

	it('bare triplet with alpha', () => {
		const src = `:root {\n  --color: 220 10% 50% / 0.5;\n}`;
		const { output } = convertHslToOklchCss(src);
		expect(output).toMatch(/oklch\(.*\/\s*0\.5/);
	});
});

describe('parseHslColors – multiple colors & non-color text', () => {
	it('preserves surrounding text', () => {
		const src = `/* comment */\n.foo { color: hsl(0 0% 100%); background: hsl(0 0% 0%); }`;
		const { output } = convertHslToOklchCss(src);
		expect(output).toContain('/* comment */');
		expect(output).toContain('.foo { color:');
		expect(output).not.toContain('hsl(');
	});

	it('multiple colors converted in order', () => {
		const src = `hsl(0 0% 100%) hsl(0 0% 0%)`;
		const { output, tokens } = convertHslToOklchCss(src);
		expect(tokens).toHaveLength(2);
		expect(output).toContain('oklch(1.000');
		expect(output).toContain('oklch(0.000');
	});

	it('non-color text untouched', () => {
		const src = `@theme {\n  --radius: 0.875rem;\n}`;
		const { output } = convertHslToOklchCss(src);
		expect(output).toBe(src);
	});
});

describe('parseHslColors – reference values', () => {
	it('hsl(0 0% 100%) ≈ oklch(1 0 0) (white)', () => {
		const { output } = convertHslToOklchCss('hsl(0 0% 100%)');
		assertOklch(output, 1, 0, 0);
	});

	it('hsl(0 0% 0%) ≈ oklch(0 0 0) (black)', () => {
		const { output } = convertHslToOklchCss('hsl(0 0% 0%)');
		assertOklch(output, 0, 0, 0);
	});
});

describe('parseHslColors – convertRawHsl', () => {
	it('converts functional hsl raw value', () => {
		const { output } = convertRawHsl('hsl(220 10% 50%)');
		expect(output).toMatch(/^oklch\(/);
	});

	it('converts bare triplet raw value', () => {
		const { output } = convertRawHsl('220 10% 50%');
		expect(output).toMatch(/^oklch\(/);
	});

	it('converts turn-unit bare triplet', () => {
		const { output } = convertRawHsl('1turn 50% 50%');
		expect(output).toMatch(/^oklch\(/);
	});

	it('produces a single token for raw hsl', () => {
		const { tokens } = convertRawHsl('hsl(220 10% 50%)');
		expect(tokens).toHaveLength(1);
	});
});

describe('parseHslColors – token positions', () => {
	it('token start/end match the original text slice', () => {
		const src = 'color: hsl(220 10% 50%);';
		const tokens = findHslTokens(src);
		expect(tokens).toHaveLength(1);
		expect(src.slice(tokens[0].start, tokens[0].end)).toBe('hsl(220 10% 50%)');
	});
});
