import { describe, expect, it } from 'vite-plus/test';
import { convertCssColors } from './convert';
import { scanCssVariableDeclarations } from './scanCssVariables';

describe('convertCssColors - raw static colors', () => {
	it('converts raw named colors to OKLCH', () => {
		const { output, tokens } = convertCssColors('red', 'oklch');

		expect(output).toMatch(/^oklch\(/);
		expect(tokens).toHaveLength(1);
		expect(tokens[0].inputFormat).toBe('named');
	});

	it('converts raw hex to RGB', () => {
		const { output } = convertCssColors('#fff', 'rgb');

		expect(output).toBe('rgb(255 255 255)');
	});

	it('converts wide-gamut color() values to OKLCH', () => {
		const { output } = convertCssColors('color(display-p3 1 0 0)', 'oklch');

		expect(output).toMatch(/^oklch\(/);
	});

	it('preserves alpha in output formats', () => {
		const { output } = convertCssColors('rgb(255 0 0 / 50%)', 'hex');

		expect(output).toBe('#ff000080');
	});
});

describe('convertCssColors - CSS variables', () => {
	it('converts mixed static colors in custom properties', () => {
		const src = `@theme {
  --primary: hsl(220 10% 50%);
  --ring: #ff00aa;
  --shadow: 0 2px 8px rgb(0 0 0 / 20%);
  --gradient: linear-gradient(90deg, red, color(display-p3 1 0 0));
}`;

		const { output, tokens } = convertCssColors(src, 'oklch');

		expect(tokens).toHaveLength(5);
		expect(output).toContain('--primary: oklch(');
		expect(output).toContain('--ring: oklch(');
		expect(output).toContain('--shadow: 0 2px 8px oklch(');
		expect(output).toContain('linear-gradient(90deg, oklch(');
		expect(output).not.toContain('#ff00aa');
	});

	it('leaves normal CSS declarations unchanged', () => {
		const src = `.foo { color: red; background: #fff; }`;
		const { output, tokens } = convertCssColors(src, 'oklch');

		expect(output).toBe(src);
		expect(tokens).toHaveLength(0);
	});

	it('leaves unsupported dynamic functions unchanged', () => {
		const src = `:root { --mix: color-mix(in oklch, red, blue); --x: var(--fallback, red); }`;
		const { output, tokens } = convertCssColors(src, 'oklch');

		expect(output).toBe(src);
		expect(tokens).toHaveLength(0);
	});

	it('preserves strings and comments while converting colors', () => {
		const src = `:root {
  --image: "red; #fff";
  --commented: /* red */ #000;
}`;
		const { output, tokens } = convertCssColors(src, 'rgb');

		expect(output).toContain('"red; #fff"');
		expect(output).toContain('/* red */ rgb(0 0 0)');
		expect(tokens).toHaveLength(1);
	});

	it('keeps existing bare Tailwind HSL triplets working', () => {
		const src = `:root { --primary: 222.2 47.4% 11.2%; }`;
		const { output, tokens } = convertCssColors(src, 'oklch');

		expect(output).toContain('oklch(');
		expect(tokens[0].inputFormat).toBe('hsl-triplet');
	});
});

describe('scanCssVariableDeclarations', () => {
	it('handles multiline values and semicolons inside strings', () => {
		const src = `:root {
  --gradient: linear-gradient(
    90deg,
    red,
    blue
  );
  --content: "a;b";
}`;
		const declarations = scanCssVariableDeclarations(src);

		expect(declarations.map((declaration) => declaration.name)).toEqual([
			'--gradient',
			'--content',
		]);
		expect(declarations[0].value).toContain('linear-gradient');
		expect(declarations[1].value).toBe(' "a;b"');
	});
});
