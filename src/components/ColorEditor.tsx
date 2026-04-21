import { cn } from '@/lib/utils';
import { For, Show, createSignal } from 'solid-js';
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

export function ColorEditor(props: ColorEditorProps) {
	let textareaRef: HTMLTextAreaElement | undefined;
	let mirrorRef: HTMLDivElement | undefined;
	const [scrollTop, setScrollTop] = createSignal(0);
	const [scrollLeft, setScrollLeft] = createSignal(0);

	const sharedStyle =
		'font-mono text-sm leading-relaxed p-3 whitespace-pre-wrap break-words overflow-auto resize-none';

	const segments = () => {
		if (!props.highlight) return null;
		return getCharRanges(props.value, props.tokens, props.side);
	};

	return (
		<div class="relative w-full h-full min-h-0">
			{/* Mirror overlay */}
			<Show when={props.highlight && segments()}>
				<div
					ref={mirrorRef}
					aria-hidden
					class={cn(sharedStyle, 'absolute inset-0 pointer-events-none select-none text-transparent')}
					style={{
						'overflow-y': 'hidden',
						'overflow-x': 'hidden',
						transform: `translateY(-${scrollTop()}px) translateX(-${scrollLeft()}px)`,
					}}
				>
					<For each={segments()!}>
						{(seg) => (
							<Show
								when={seg.css}
								fallback={<span>{seg.text}</span>}
							>
								<span
									style={{
										'background-color': seg.css,
										color: (seg.oklchL ?? 0) > 0.6 ? '#000' : '#fff',
										'border-radius': '2px',
										padding: '0 1px',
									}}
								>
									{seg.text}
								</span>
							</Show>
						)}
					</For>
				</div>
			</Show>

			<textarea
				ref={textareaRef}
				class={cn(
					sharedStyle,
					'relative w-full h-full min-h-0 block',
					'bg-transparent',
					'border border-input rounded-md',
					'focus:outline-none focus:ring-2 focus:ring-ring/50',
					props.readonly && 'cursor-default',
				)}
				style={{ 'caret-color': 'currentColor', color: 'inherit' }}
				value={props.value}
				readOnly={props.readonly}
				placeholder={props.placeholder}
				onInput={(e) => props.onInput?.(e.currentTarget.value)}
				onScroll={(e) => {
					setScrollTop(e.currentTarget.scrollTop);
					setScrollLeft(e.currentTarget.scrollLeft);
				}}
			/>
		</div>
	);
}
