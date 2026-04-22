import type { JSX } from 'solid-js';
import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
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
	scrollTop?: number;
	externallyScrolled?: boolean;
	onScrollPositionChange?: (position: { top: number; left: number }) => void;
}

function LineNumbers(props: { value: string; scrollTop?: number }) {
	let ref!: HTMLDivElement;
	const [visibleRows, setVisibleRows] = createSignal(0);
	const lines = createMemo(() => props.value.split('\n'));

	const updateVisibleRows = () => {
		if (!ref) return;
		setVisibleRows(Math.max(1, Math.ceil(ref.clientHeight / 20)));
	};

	createEffect(() => {
		if (ref) {
			ref.scrollTop = props.scrollTop ?? 0;
		}
	});

	onMount(() => {
		updateVisibleRows();

		if (!ref) return;

		const observer = new ResizeObserver(() => updateVisibleRows());
		observer.observe(ref);

		onCleanup(() => observer.disconnect());
	});

	const totalLines = createMemo(() => Math.max(lines().length, visibleRows(), 1));

	return (
		<div
			ref={(el) => {
				ref = el;
			}}
			class="w-12 shrink-0 overflow-hidden border-r border-border py-0 pr-3 text-right text-[13px] leading-[20px] text-muted-foreground select-none"
		>
			<For each={Array.from({ length: totalLines() })}>
				{(_, index) => <span class="block">{index() + 1}</span>}
			</For>
		</div>
	);
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
					'relative before:transition-[background,color] before:content-[""] before:absolute before:top-[-2px] before:left-[-5px] before:w-full before:z-[-1] before:h-[18px] before:border before:border-(--b) before:rounded-[3px] before:px-[5px] before:box-content before:bg-(--bg) z-0',
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

	const getScrollElement = () => {
		if (props.readonly && props.externallyScrolled) return undefined;
		return props.readonly ? highlightRef : textareaRef;
	};

	const handleTextareaScroll = () => {
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

	const handleHighlightScroll: JSX.EventHandlerUnion<HTMLDivElement, Event> = () => {
		if (!highlightRef || !props.readonly || props.externallyScrolled) return;

		props.onScrollPositionChange?.({
			top: highlightRef.scrollTop,
			left: highlightRef.scrollLeft,
		});
	};

	createEffect(() => {
		const target = props.scrollTop;
		const scrollElement = getScrollElement();
		if (target === undefined || !scrollElement || scrollElement.scrollTop === target) return;

		scrollElement.scrollTop = target;
	});

	onMount(() => {
		if (props.readonly) {
			handleHighlightScroll(new Event('scroll') as any);
			return;
		}

		handleTextareaScroll();
	});

	return (
		<div class={cn('flex min-h-full w-full flex-1', props.readonly && 'contents')}>
			<LineNumbers value={props.value} scrollTop={props.scrollTop} />
			<div class="relative min-h-full flex-1 px-5 editor">
				<div
					ref={highlightRef}
					class={cn(
						'pointer-events-none absolute inset-0 overflow-hidden',
						props.readonly && 'relative',
						props.readonly && !props.externallyScrolled && 'pointer-events-auto overflow-auto',
						props.readonly && props.externallyScrolled && 'overflow-visible',
					)}
					onScroll={handleHighlightScroll}
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
						onScroll={handleTextareaScroll}
						placeholder={props.placeholder}
						spellcheck={false}
						autocapitalize="off"
						autocomplete="off"
						autocorrect="off"
					/>
				</Show>
			</div>
		</div>
	);
}
