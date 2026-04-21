import type { JSX } from 'solid-js';
import { For, createMemo, onMount } from 'solid-js';
import type { ColorToken } from '../lib/parseHslColors';
import type { DisplayToken } from '../lib/syntaxTokenizer';
import { tokenizeLine } from '../lib/syntaxTokenizer';

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
			return 'tok-selector';
		case 'punct':
			return 'tok-punct';
		case 'prop':
			return 'tok-prop';
		case 'val-hsl':
			return 'tok-val-in-hsl';
		case 'val-oklch':
			return 'tok-val';
		case 'val-other':
			return 'tok-other';
		case 'comment':
			return 'tok-comment';
		case 'plain':
			return 'tok-plain';
		default:
			return 'tok-plain';
	}
}

function TokenSpan(props: { token: DisplayToken }): JSX.Element {
	if (props.token.type === 'val-color-badge') {
		return (
			<span
				class="tok-val-bg"
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
	placeholderClass?: string;
}) {
	const tokenLines = createMemo(() =>
		tokenizeValue(props.value, props.colorTokens, props.side, props.showChips),
	);

	return (
		<>
			{!props.value && props.placeholder ? (
				<span class={props.placeholderClass ?? 'tok-placeholder'}>{props.placeholder}</span>
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
			<div class="output-rendered">
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
		<div class="input-wrap">
			<div ref={highlightRef} class="input-highlight" aria-hidden="true">
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
				class="input-textarea"
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
