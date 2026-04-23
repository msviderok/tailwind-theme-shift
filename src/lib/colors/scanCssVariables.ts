export interface CssVariableDeclaration {
	propertyStart: number;
	propertyEnd: number;
	valueStart: number;
	valueEnd: number;
	name: string;
	value: string;
}

function isNameChar(ch: string | undefined): boolean {
	return ch !== undefined && /[-_a-zA-Z0-9]/.test(ch);
}

function skipString(src: string, start: number): number {
	const quote = src[start];
	let i = start + 1;
	while (i < src.length) {
		if (src[i] === '\\') {
			i += 2;
			continue;
		}
		if (src[i] === quote) return i + 1;
		i++;
	}
	return src.length;
}

function skipComment(src: string, start: number): number {
	const end = src.indexOf('*/', start + 2);
	return end === -1 ? src.length : end + 2;
}

function findValueEnd(src: string, start: number): number {
	let i = start;
	let depth = 0;

	while (i < src.length) {
		const ch = src[i];
		const next = src[i + 1];

		if (ch === '"' || ch === "'") {
			i = skipString(src, i);
			continue;
		}
		if (ch === '/' && next === '*') {
			i = skipComment(src, i);
			continue;
		}
		if (ch === '(') {
			depth++;
		} else if (ch === ')' && depth > 0) {
			depth--;
		} else if (ch === ';' && depth === 0) {
			return i;
		}
		i++;
	}

	return src.length;
}

export function scanCssVariableDeclarations(src: string): CssVariableDeclaration[] {
	const declarations: CssVariableDeclaration[] = [];
	let i = 0;

	while (i < src.length) {
		const ch = src[i];
		const next = src[i + 1];

		if (ch === '"' || ch === "'") {
			i = skipString(src, i);
			continue;
		}
		if (ch === '/' && next === '*') {
			i = skipComment(src, i);
			continue;
		}
		if (ch !== '-' || next !== '-' || isNameChar(src[i - 1])) {
			i++;
			continue;
		}

		const propertyStart = i;
		i += 2;
		while (isNameChar(src[i])) i++;

		const propertyEnd = i;
		const name = src.slice(propertyStart, propertyEnd);
		let cursor = i;
		while (/\s/.test(src[cursor] ?? '')) cursor++;

		if (src[cursor] !== ':') {
			i = propertyEnd;
			continue;
		}

		const valueStart = cursor + 1;
		const valueEnd = findValueEnd(src, valueStart);
		declarations.push({
			propertyStart,
			propertyEnd,
			valueStart,
			valueEnd,
			name,
			value: src.slice(valueStart, valueEnd),
		});

		i = valueEnd + 1;
	}

	return declarations;
}
