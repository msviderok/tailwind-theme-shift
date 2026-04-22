import type { JSX } from 'solid-js';
import { For, Show, createMemo, onMount } from 'solid-js';
import type { ColorToken } from '../lib/parseHslColors';
import type { DisplayToken } from '../lib/syntaxTokenizer';
import { tokenizeLine } from '../lib/syntaxTokenizer';
import { cn } from '../lib/utils';

interface ColorEditorProps {
	value: string;
	onInput?: (value: string) => void;
	readonly: boolean;
	showChips: boolean;
	colorTokens: ColorToken[];
	side: 'input' | 'output';
	placeholder?: string;
	onScrollPositionChange?: (position: { top: number; left: number }) => void;
}

function getTokenClass(token: DisplayToken) {
	switch (token.type) {
		case 'selector':
			return 'text-[var(--syntax-selector)]';
		case 'punct':
			return 'text-foreground/60';
		case 'prop':
			return 'text-[var(--syntax-prop)]';
		case 'val-hsl':
			return 'text-[var(--syntax-value-input)]';
		case 'val-oklch':
			return 'text-[var(--syntax-value-output)]';
		case 'val-other':
			return 'text-foreground/70';
		case 'comment':
			return 'text-[var(--syntax-comment)] italic';
		case 'plain':
			return 'text-foreground/85';
		default:
			return 'text-foreground/85';
	}
}

function TokenSpan(props: { token: DisplayToken }): JSX.Element {
	const isBadge = () => props.token.type === 'val-color-badge';
	return (
		<span
			class={cn(
				getTokenClass(props.token),
				isBadge() &&
					'relative before:transition-[background,color] before:content-[""] before:absolute before:top-0 before:left-0 before:w-full before:z-[-1] before:h-[calc(100%-2px)] before:border before:border-(--b) before:rounded-[3px] before:px-[5px] before:box-content before:bg-(--bg) z-0',
			)}
			style={{
				color: isBadge() ? `contrast-color(${props.token.css})` : undefined,
				'--bg': isBadge() ? (props.token.css ?? 'transparent') : undefined,
				'--b': isBadge() ? `contrast-color(${props.token.css})` : undefined,
			}}
		>
			{props.token.text}
		</span>
	);
}

function tokenizeValue(
	value: string,
	colorTokens: ColorToken[],
	side: 'input' | 'output',
	showChips: boolean,
) {
	const lines = value.split('\n');
	let offset = 0;

	return lines.map((line) => {
		const lineOffset = offset;
		offset += line.length + 1;
		return tokenizeLine(line, lineOffset, colorTokens, side, showChips);
	});
}

function TokenizedCode(props: {
	value: string;
	colorTokens: ColorToken[];
	side: 'input' | 'output';
	showChips: boolean;
	placeholder?: string;
}) {
	const tokenLines = createMemo(() =>
		tokenizeValue(props.value, props.colorTokens, props.side, props.showChips),
	);

	return (
		<Show
			when={props.value}
			fallback={<span class="text-muted-foreground">{props.placeholder}</span>}
		>
			<For each={tokenLines()}>
				{(lineTokens, index) => (
					<>
						<For each={lineTokens}>{(token) => <TokenSpan token={token} />}</For>
						{index() < tokenLines().length - 1 ? '\n' : null}
					</>
				)}
			</For>
		</Show>
	);
}

export function ColorEditor(props: ColorEditorProps) {
	let textareaRef: HTMLTextAreaElement | undefined;
	let highlightRef: HTMLDivElement | undefined;

	const syncScroll = () => {
		if (!textareaRef) return;

		if (highlightRef) {
			highlightRef.scrollTop = textareaRef.scrollTop;
			highlightRef.scrollLeft = textareaRef.scrollLeft;
		}

		props.onScrollPositionChange?.({
			top: textareaRef.scrollTop,
			left: textareaRef.scrollLeft,
		});
	};

	onMount(() => {
		syncScroll();
	});

	return (
		<div class="relative flex-1 min-h-full editor w-full">
			<div
				ref={highlightRef}
				class={cn(
					'pointer-events-none absolute inset-0 overflow-hidden',
					props.readonly && 'relative pointer-events-auto overflow-auto',
				)}
				aria-hidden="true"
			>
				<TokenizedCode
					value={props.value}
					colorTokens={props.colorTokens}
					side={props.side}
					showChips={props.showChips}
					placeholder={props.placeholder}
				/>
			</div>
			<Show when={!props.readonly}>
				<textarea
					ref={textareaRef}
					class={cn(
						'absolute inset-0 h-full w-full resize-none border border-transparent bg-transparent p-0 outline-none',
						'caret-primary placeholder:text-transparent text-transparent',
					)}
					value={props.value}
					onInput={(event) => props.onInput?.(event.currentTarget.value)}
					onScroll={syncScroll}
					placeholder={props.placeholder}
					spellcheck={false}
					autocapitalize="off"
					autocomplete="off"
					autocorrect="off"
				/>
			</Show>
		</div>
	);
}
