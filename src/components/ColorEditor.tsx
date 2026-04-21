import { cn } from '@/lib/utils';
import { CodeJar } from 'codejar';
import { createEffect, onCleanup, onMount } from 'solid-js';
import type { ColorToken } from '../lib/parseHslColors';

interface ColorEditorProps {
	value: string;
	onInput?: (val: string) => void;
	readonly?: boolean;
	highlight: boolean;
	tokens: ColorToken[];
	/** whether tokens are input-side (inputStart/End) or output-side (outputStart/End) */
	side: 'input' | 'output';
	placeholder?: string;
}

function getCharRanges(
	text: string,
	tokens: ColorToken[],
	side: 'input' | 'output',
): Array<{ text: string; css?: string; oklchL?: number }> {
	if (tokens.length === 0) return [{ text }];

	const segments: Array<{ text: string; css?: string; oklchL?: number }> = [];
	let cursor = 0;

	for (const tok of tokens) {
		const start = side === 'input' ? tok.inputStart : tok.outputStart;
		const end = side === 'input' ? tok.inputEnd : tok.outputEnd;
		const css = side === 'input' ? tok.inputCss : tok.outputCss;

		if (start > cursor) {
			segments.push({ text: text.slice(cursor, start) });
		}
		if (end > start) {
			segments.push({
				text: text.slice(start, end),
				css,
				oklchL: tok.oklchL,
			});
		}
		cursor = end;
	}

	if (cursor < text.length) {
		segments.push({ text: text.slice(cursor) });
	}

	return segments;
}

function escapeHtml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function ColorEditor(props: ColorEditorProps) {
	let editorRef!: HTMLDivElement;
	let jar: ReturnType<typeof CodeJar> | undefined;
	let lastSyncedValue = '';

	const renderHighlightedHtml = (text: string) => {
		const segments = props.highlight ? getCharRanges(text, props.tokens, props.side) : [{ text }];

		return segments
			.map((seg) => {
				const chunk = escapeHtml(seg.text);
				if (!seg.css) return chunk;

				const ring =
					(seg.oklchL ?? 0) > 0.6
						? 'inset 0 0 0 1px rgb(0 0 0 / 0.06)'
						: 'inset 0 0 0 1px rgb(255 255 255 / 0.12)';

				const col = escapeHtml(seg.css);
				return `<span style="background-color:${col};border-radius:2px;color:contrast-color(${col});box-shadow:${ring}">${chunk}</span>`;
			})
			.join('');
	};

	const hasEditorSelection = () => {
		if (!jar || editorRef.ownerDocument.activeElement !== editorRef) return false;

		const selection = editorRef.ownerDocument.getSelection();
		if (!selection || selection.rangeCount === 0) return false;

		return (
			!!selection.anchorNode &&
			!!selection.focusNode &&
			editorRef.contains(selection.anchorNode) &&
			editorRef.contains(selection.focusNode)
		);
	};

	const paintEditor = (text: string, preserveSelection: boolean) => {
		if (!editorRef) return;

		let selection: ReturnType<typeof jar.save> | null = null;
		if (preserveSelection && hasEditorSelection()) {
			try {
				selection = jar!.save();
			} catch {
				selection = null;
			}
		}

		editorRef.innerHTML = renderHighlightedHtml(text);

		if (selection && jar) {
			try {
				jar.restore(selection);
			} catch {
				// The DOM changed under us or the selection moved; leave the new markup in place.
			}
		}
	};

	onMount(() => {
		editorRef.textContent = props.value;
		paintEditor(props.value, false);
		lastSyncedValue = props.value;

		if (props.readonly) return;

		jar = CodeJar(
			editorRef,
			(el) => {
				paintEditor(el.textContent ?? '', false);
			},
			{
				tab: '  ',
				spellcheck: false,
				catchTab: true,
			},
		);

		jar.onUpdate((code) => {
			lastSyncedValue = code;
			if (code !== props.value) props.onInput?.(code);
		});

		onCleanup(() => jar?.destroy());
	});

	createEffect(() => {
		const value = props.value;
		props.tokens;
		props.highlight;

		if (!editorRef) return;

		if (props.readonly) {
			paintEditor(value, false);
			lastSyncedValue = value;
			return;
		}

		if (value !== lastSyncedValue) {
			editorRef.textContent = value;
			paintEditor(value, false);
			lastSyncedValue = value;
			return;
		}

		paintEditor(value, true);
	});

	return (
		<div
			class={cn(
				'relative w-full h-full min-h-0',
				'border border-input rounded-md overflow-hidden',
				'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring/50',
			)}
		>
			<div
				ref={(el) => {
					editorRef = el;
				}}
				contentEditable={props.readonly ? false : 'plaintext-only'}
				role="textbox"
				aria-multiline="true"
				data-placeholder={props.placeholder}
				class={cn(
					'color-editor-host h-full min-h-full w-full overflow-auto p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words outline-none text-foreground',
					props.readonly && 'cursor-default',
				)}
				style={{ 'caret-color': 'var(--foreground)' }}
				spellcheck={false}
			/>
		</div>
	);
}
