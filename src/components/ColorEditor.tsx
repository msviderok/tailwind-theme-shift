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

function LineNumbers(props: { readonly: boolean; value: string; scrollTop?: number }) {
	let ref!: HTMLDivElement;
	const [visibleRows, setVisibleRows] = createSignal(0);
	const lines = createMemo(() => props.value.split('\n'));
	const totalLines = createMemo(() => Math.max(lines().length, visibleRows(), 1));

	function updateVisibleRows() {
		setVisibleRows(Math.max(1, Math.ceil(ref.clientHeight / 20)));
	}

	createEffect(() => {
		if (!ref) return;
		ref.scrollTop = props.scrollTop ?? 0;
	});

	onMount(() => {
		updateVisibleRows();
		const observer = new ResizeObserver(() => updateVisibleRows());
		observer.observe(ref);
		onCleanup(() => observer.disconnect());
	});

	return (
		<div
			ref={(el) => {
				ref = el;
			}}
			class={cn(
				'w-12 sticky left-0 top-0 shrink-0 border-r border-border py-0 pr-3 text-right text-[13px] leading-[20px] text-muted-foreground select-none bg-primary h-full z-1',
				!props.readonly && 'overflow-hidden',
			)}
		>
			<For each={Array.from({ length: totalLines() })}>
				{(_, index) => <span class="block">{index() + 1}</span>}
			</For>
		</div>
	);
}

function TokenSpan(props: { token: DisplayToken }): JSX.Element {
	const isBadge = () => props.token.type === 'val-color-badge';
	return (
		<span
			class={cn(
				isBadge() &&
					'relative before:transition-[background,color] before:content-[""] before:absolute before:top-[-2px] before:left-[-5px] before:w-full before:z-[-1] before:h-[18px] before:border before:border-(--b) before:rounded-[3px] before:px-[5px] before:box-content before:bg-(--bg) z-0 text-foreground/85',
				props.token.type === 'selector' && 'text-(--syntax-selector)',
				props.token.type === 'punct' && 'text-foreground/60',
				props.token.type === 'prop' && 'text-(--syntax-prop)',
				props.token.type === 'val-color-input' && 'text-(--syntax-value-input)',
				props.token.type === 'val-color-output' && 'text-(--syntax-value-output)',
				props.token.type === 'val-other' && 'text-foreground/70',
				props.token.type === 'comment' && 'text-(--syntax-comment) italic',
				props.token.type === 'plain' && 'text-foreground/85',
			)}
			style={{
				color: isBadge() ? (props.token.fg ?? `contrast-color(${props.token.css})`) : undefined,
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
	let highlightRef!: HTMLDivElement;

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

		props.onScrollPositionChange?.({ top: textareaRef.scrollTop, left: textareaRef.scrollLeft });
	};

	const handleHighlightScroll: JSX.EventHandlerUnion<HTMLDivElement, Event> = () => {
		if (!highlightRef || !props.readonly || props.externallyScrolled) return;
		props.onScrollPositionChange?.({ top: highlightRef.scrollTop, left: highlightRef.scrollLeft });
	};

	createEffect(() => {
		const top = props.scrollTop;
		const scrollElement = getScrollElement();
		if (top === undefined || !scrollElement || scrollElement.scrollTop === top) return;
		scrollElement.scrollTop = top;
	});

	onMount(() => {
		if (props.readonly) {
			handleHighlightScroll(new Event('scroll') as any);
			return;
		}

		handleTextareaScroll();
	});

	return (
		<div class={cn('flex flex-1 gap-2 h-full', props.readonly && 'h-min')}>
			<LineNumbers readonly={props.readonly} value={props.value} scrollTop={props.scrollTop} />
			<div class="relative text-editor leading-[20px] align-middle inline-block box-border outline-none [tab-size:2] whitespace-pre-wrap break-all p-0 border border-transparent w-full">
				<div
					ref={(el) => {
						highlightRef = el;
					}}
					class={cn(
						'relative w-max',
						!props.readonly && 'absolute inset-0 overflow-hidden pointer-events-none',
					)}
					aria-hidden="true"
					onScroll={handleHighlightScroll}
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
						ref={(el) => {
							textareaRef = el;
						}}
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
