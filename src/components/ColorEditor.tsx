import type { JSX } from 'solid-js';
import { For, createMemo, onMount } from 'solid-js';
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
			return 'text-[var(--syntax-selector)] font-medium';
		case 'punct':
			return 'text-foreground/60';
		case 'prop':
			return 'text-[var(--syntax-prop)]';
		case 'val-hsl':
			return 'inline-block box-border align-middle border border-transparent px-[5px] leading-[18px] text-[var(--syntax-value-input)]';
		case 'val-oklch':
			return 'inline-block box-border align-middle border border-transparent px-[5px] leading-[18px] text-[var(--syntax-value-output)]';
		case 'val-other':
			return 'inline-block box-border align-middle border border-transparent px-[5px] leading-[18px] text-foreground/70';
		case 'comment':
			return 'text-[var(--syntax-comment)] italic';
		case 'plain':
			return 'text-foreground/85';
		default:
			return 'text-foreground/85';
	}
}

function TokenSpan(props: { token: DisplayToken }): JSX.Element {
	if (props.token.type === 'val-color-badge') {
		return (
			<span
				class="inline-block box-border align-middle rounded-[3px] px-[5px] leading-[18px] font-medium transition-[background,color]"
				style={{
					'background-color': props.token.css ?? 'transparent',
					color: `contrast-color(${props.token.css})`,
					border: `1px solid contrast-color(${props.token.css})`,
				}}
			>
				{props.token.text}
			</span>
		);
	}

	return <span class={getTokenClass(props.token)}>{props.token.text}</span>;
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
		<>
			{!props.value && props.placeholder ? (
				<span class="text-muted-foreground">{props.placeholder}</span>
			) : (
				<For each={tokenLines()}>
					{(lineTokens, index) => (
						<>
							<For each={lineTokens}>{(token) => <TokenSpan token={token} />}</For>
							{index() < tokenLines().length - 1 ? '\n' : null}
						</>
					)}
				</For>
			)}
		</>
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

	if (props.readonly) {
		return (
			<div class="block min-h-full w-full font-mono text-[13px] leading-[20px] whitespace-pre-wrap break-all [tab-size:2]">
				<TokenizedCode
					value={props.value}
					colorTokens={props.colorTokens}
					side={props.side}
					showChips={props.showChips}
					placeholder={props.placeholder}
				/>
			</div>
		);
	}

	return (
		<div class="relative flex-1 min-h-full">
			<div
				ref={highlightRef}
				class="pointer-events-none absolute inset-0 overflow-hidden font-mono text-[13px] leading-[20px] whitespace-pre-wrap break-all [tab-size:2]"
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
			<textarea
				ref={textareaRef}
				class={cn(
					'absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-0 font-mono text-[13px] leading-[20px] whitespace-pre-wrap break-all text-transparent outline-none [tab-size:2]',
					'caret-[var(--primary)] placeholder:text-transparent selection:bg-[color-mix(in_srgb,var(--primary)_34%,transparent)]',
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
		</div>
	);
}
