import { describe, expect, it } from 'vite-plus/test';
import { classify, validate } from './validateTailwindTheme';

describe('validateTailwindTheme – valid CSS inputs', () => {
	const validCases = [
		'@theme { --color-primary: oklch(0.5 0.1 200); }',
		':root { --x: 1 2% 3%; }',
		'@layer base { body { @apply bg-background; } }',
		"@import 'tailwindcss';",
		'@custom-variant dark (&:is(.dark *))',
		'--x: 1rem;',
		'hsl(220 10% 50%)',
		'hsla(220,10%,50%,0.5)',
		'220 10% 50%',
		'1turn 50% 50%',
		'#ff00aa',
		'red',
		'color(display-p3 1 0 0)',
	];

	for (const css of validCases) {
		it(`accepts: ${css.slice(0, 50)}`, () => {
			const r = validate(css);
			expect(r.ok).toBe(true);
		});
	}
});

describe('validateTailwindTheme – raw-color classification', () => {
	const rawColorCases = [
		'hsl(220 10% 50%)',
		'hsla(220,10%,50%,0.5)',
		'220 10% 50%',
		'1turn 50% 50%',
		'hsl(220 10% 50%);',
		'#ff00aa',
		'red',
		'color(display-p3 1 0 0)',
	];

	for (const c of rawColorCases) {
		it(`classifies as raw-color: ${c}`, () => {
			expect(classify(c).kind).toBe('raw-color');
		});
	}

	const cssCases = [':root { --x: 220 10% 50%; }', '@theme { --primary: 222.2 47.4% 11.2%; }'];

	for (const c of cssCases) {
		it(`classifies as css: ${c.slice(0, 40)}`, () => {
			expect(classify(c).kind).toBe('css');
		});
	}
});

describe('validateTailwindTheme – invalid inputs', () => {
	it('rejects empty string', () => {
		const r = validate('');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.message).toMatch(/empty/i);
	});

	it('rejects whitespace-only', () => {
		const r = validate('   ');
		expect(r.ok).toBe(false);
	});

	it('rejects plain prose', () => {
		const r = validate('hello world');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.message).toMatch(/css|color/i);
	});

	it('rejects unbalanced braces', () => {
		const r = validate(':root { --x: 1 2% 3%;');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.message).toMatch(/unbalanced|brace/i);
	});

	it('rejects unbalanced parens', () => {
		const r = validate('hsl(220 10% 50%');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.message).toMatch(/unbalanced|paren/i);
	});

	it('rejects extra closing brace', () => {
		const r = validate(':root { --x: 1 2% 3%; } }');
		expect(r.ok).toBe(false);
	});
});
