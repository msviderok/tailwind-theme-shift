import { Code, Moon, Siren, Sun } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { ColorEditor } from './components/ColorEditor';
import HighlightIcon from './components/HighlightIcon';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './components/ui/select';
import { Separator } from './components/ui/separator';
import { Switch } from './components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import type { ColorToken } from './lib/parseHslColors';
import { convertHslToOklchCss, convertRawHsl } from './lib/parseHslColors';
import { cn } from './lib/utils';
import { validate } from './lib/validateTailwindTheme';
import { PLACEHOLDER } from './placeholder';

const STORAGE_KEYS = {
	theme: 'hsl-to-oklch.theme',
	highlight: 'hsl-to-oklch.highlight',
	input: 'hsl-to-oklch.input',
} as const;

type DerivedState =
	| { status: 'empty'; output: ''; tokens: []; error: null; kind: 'css' }
	| { status: 'invalid'; output: ''; tokens: []; error: string; kind: null }
	| {
			status: 'valid';
			output: string;
			tokens: ColorToken[];
			error: null;
			kind: 'raw-hsl' | 'css';
	  };

function EmptyOutputState(props: { message: string; detail?: string; invalid?: boolean }) {
	return (
		<div
			class={cn(
				'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center text-muted-foreground/60',
				props.invalid && 'text-destructive',
			)}
		>
			<div class="grid size-20 place-items-center rounded-lg border border-dashed border-current text-3xl">
				<Show when={props.invalid} fallback={<Code size={30} />}>
					<Siren size={40} />
				</Show>
			</div>
			<div class="text-base leading-[1.7] text-current">
				{props.message}
				<Show when={props.detail}>
					<br />
					{props.detail}
				</Show>
			</div>
		</div>
	);
}

export default function App() {
	const [input, setInput] = createSignal(
		typeof window === 'undefined' ? '' : (window.localStorage.getItem(STORAGE_KEYS.input) ?? ''),
	);
	const [showChips, setShowChips] = createSignal(true);
	const [isDark, setIsDark] = createSignal(true);
	const [copied, setCopied] = createSignal(false);
	const [activeMobilePane, setActiveMobilePane] = createSignal<'input' | 'output'>('input');
	const [inputScrollTop, setInputScrollTop] = createSignal(0);
	const [outputScrollTop, setOutputScrollTop] = createSignal(0);
	const [isShiftPressed, setIsShiftPressed] = createSignal(false);

	let outputScrollContainerRef: HTMLDivElement | undefined;

	let copyResetTimer: number | undefined;

	onCleanup(() => {
		if (copyResetTimer) {
			window.clearTimeout(copyResetTimer);
		}
	});

	onMount(() => {
		const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
		const storedHighlight = window.localStorage.getItem(STORAGE_KEYS.highlight);
		const initialDark =
			storedTheme === null
				? document.documentElement.classList.contains('dark')
				: storedTheme === 'dark';

		setIsDark(initialDark);
		setShowChips(storedHighlight === null ? true : storedHighlight === 'true');
		document.documentElement.classList.toggle('dark', initialDark);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Shift') {
				setIsShiftPressed(true);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Shift') {
				setIsShiftPressed(false);
			}
		};

		const handleWindowBlur = () => {
			setIsShiftPressed(false);
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleWindowBlur);

		onCleanup(() => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('blur', handleWindowBlur);
		});
	});

	createEffect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(STORAGE_KEYS.theme, isDark() ? 'dark' : 'light');
	});

	createEffect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(STORAGE_KEYS.highlight, String(showChips()));
	});

	createEffect(() => {
		if (typeof window === 'undefined') return;

		const nextInput = input();
		if (nextInput) {
			window.localStorage.setItem(STORAGE_KEYS.input, nextInput);
			return;
		}

		window.localStorage.removeItem(STORAGE_KEYS.input);
	});

	const state = createMemo<DerivedState>(() => {
		const source = input();
		if (!source.trim()) {
			return { status: 'empty', output: '', tokens: [], error: null, kind: 'css' };
		}

		const validation = validate(source);
		if (!validation.ok) {
			return { status: 'invalid', output: '', tokens: [], error: validation.message, kind: null };
		}

		if (validation.kind === 'raw-hsl') {
			const { output, tokens } = convertRawHsl(source);
			return { status: 'valid', output, tokens, error: null, kind: 'raw-hsl' };
		}

		const { output, tokens } = convertHslToOklchCss(source);
		return { status: 'valid', output, tokens, error: null, kind: 'css' };
	});

	const outputValue = createMemo(() => (state().status === 'valid' ? state().output : ''));
	const colorTokens = createMemo(() => (state().status === 'valid' ? state().tokens : []));

	const handleCopy = async () => {
		const text = outputValue();
		if (!text) return;

		await navigator.clipboard.writeText(text);
		setCopied(true);

		if (copyResetTimer) {
			window.clearTimeout(copyResetTimer);
		}

		copyResetTimer = window.setTimeout(() => {
			setCopied(false);
			copyResetTimer = undefined;
		}, 1600);
	};

	const handleSample = () => {
		setInput(PLACEHOLDER);
	};

	const handleInputClear = () => {
		setInput('');
		setCopied(false);
	};

	createEffect(() => {
		if (!outputScrollContainerRef) return;
		const top = outputScrollTop();
		if (outputScrollContainerRef.scrollTop !== top) {
			outputScrollContainerRef.scrollTop = top;
		}
	});

	createEffect(() => {
		document.documentElement.classList.toggle('dark', isDark());
	});

	const syncPaneScroll = (nextScrollTop: number) => {
		setInputScrollTop(nextScrollTop);
		setOutputScrollTop(nextScrollTop);
	};

	const handleInputScroll = (e: { top: number; left: number }) => {
		setInputScrollTop(e.top);
		if (isShiftPressed()) {
			syncPaneScroll(e.top);
		}
	};

	const handleOutputScroll = (e: { top: number; left: number }) => {
		setOutputScrollTop(e.top);
		if (isShiftPressed()) {
			syncPaneScroll(e.top);
		}
	};

	const handleOutputContainerScroll: JSX.EventHandler<HTMLDivElement, Event> = (event) => {
		handleOutputScroll({
			top: event.currentTarget.scrollTop,
			left: event.currentTarget.scrollLeft,
		});
	};

	const isInputMobileActive = createMemo(() => activeMobilePane() === 'input');
	const isOutputMobileActive = createMemo(() => activeMobilePane() === 'output');

	return (
		<div class="flex h-screen min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<header class="flex h-10 shrink-0 items-center justify-between border-b border-border bg-primary px-3 md:px-4">
				<div class="flex items-center gap-3">
					<Button
						variant={input() ? 'primary' : 'tertiary'}
						vibe="pushed-in"
						onClick={() => {
							if (input()) {
								handleInputClear();
							} else {
								handleSample();
							}
						}}
					>
						{input() ? 'Clear' : 'Load sample'}
					</Button>

					<Show when={outputValue()}>
						<Button
							variant="primary"
							vibe="pushed-in"
							class={cn(copied() && 'text-accent hover:text-accent')}
							onClick={handleCopy}
						>
							{copied() ? 'Copied!' : 'Copy'}
						</Button>
					</Show>
				</div>
				<div class=" flex items-center gap-3">
					<div class="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger
								render={(p) => (
									<Switch
										{...p}
										checked={isDark()}
										onCheckedChange={setIsDark}
										aria-label={`Switch to ${isDark() ? 'light' : 'dark'} theme`}
										class={cn(
											p.class,
											'data-unchecked:text-secondary data-unchecked:bg-secondary',
											'data-checked:text-darkblue data-checked:border-darkblue/20 data-checked:bg-darkblue',
										)}
										icons={{
											on: <Moon size={12} />,
											off: <Sun size={12} class="stroke-3" />,
										}}
									/>
								)}
							/>

							<TooltipContent>Switch to {isDark() ? 'light' : 'dark'} theme</TooltipContent>
						</Tooltip>
					</div>

					<Separator orientation="vertical" />

					<div class="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger
								render={(p) => (
									<Switch
										{...p}
										checked={showChips()}
										onCheckedChange={(checked) => setShowChips(checked)}
										aria-label={showChips() ? 'Do not highlight colors' : 'Highlight colors'}
										class={cn(p.class, 'data-unchecked:bg-slate-700')}
										icons={{
											on: <HighlightIcon state="on" width={12} height={12} />,
											off: <HighlightIcon state="off" width={12} height={12} />,
										}}
									/>
								)}
							/>
							<TooltipContent>
								{showChips() ? 'Do not highlight colors' : 'Highlight colors'}
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</header>

			<div class="flex shrink-0 gap-2 px-4 pt-3 md:hidden">
				<Button
					variant="secondary"
					class={cn(
						'flex-1 rounded-full px-3 py-2 text-[11px] tracking-[0.08em] uppercase',
						isInputMobileActive()
							? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_20%,var(--muted))] text-foreground'
							: 'bg-primary text-muted-foreground',
					)}
					onClick={() => setActiveMobilePane('input')}
				>
					Input
				</Button>
				<Button
					variant="secondary"
					class={cn(
						'flex-1 rounded-full px-3 py-2 text-[11px] tracking-[0.08em] uppercase',
						isOutputMobileActive()
							? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_20%,var(--muted))] text-foreground'
							: 'bg-primary text-muted-foreground',
					)}
					onClick={() => setActiveMobilePane('output')}
				>
					Output
				</Button>
			</div>

			<div class="flex flex-1 overflow-hidden md:px-0">
				<div
					class={cn(
						isInputMobileActive() ? 'flex' : 'hidden',
						'mx-4 my-3 rounded-[18px] border border-border md:mx-0 md:my-0 md:rounded-none md:border-0 md:flex min-w-0 flex-1 flex-col overflow-hidden bg-card',
					)}
				>
					<div class="flex flex-1 overflow-auto relative">
						<ColorEditor
							value={input()}
							onInput={setInput}
							readonly={false}
							showChips={showChips()}
							colorTokens={colorTokens()}
							side="input"
							placeholder="Paste your Tailwind CSS variables here…"
							scrollTop={inputScrollTop()}
							onScrollPositionChange={handleInputScroll}
						/>

						<div class="absolute top-1 right-3">
							<Select value="HSL" items={[{ value: 'HSL', label: 'HSL' }]}>
								<SelectTrigger class="select-none">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="HSL">HSL</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<Separator orientation="vertical" />

				<div
					class={cn(
						isOutputMobileActive() ? 'flex' : 'hidden',
						'mx-4 my-3 rounded-[18px] border border-border md:mx-0 md:my-0 md:rounded-none md:border-0 md:flex min-w-0 flex-1 flex-col overflow-hidden bg-card',
					)}
				>
					<div
						ref={outputScrollContainerRef}
						class="flex flex-1 overflow-auto"
						onScroll={handleOutputContainerScroll}
					>
						<Show
							when={state().status === 'valid' && outputValue()}
							fallback={
								<Show
									when={state().status === 'invalid'}
									fallback={
										<EmptyOutputState
											message="Output will appear here"
											detail="as you type or paste HSL values"
										/>
									}
								>
									<EmptyOutputState
										message="Invalid syntax"
										detail={state().status === 'invalid' ? (state().error ?? undefined) : undefined}
										invalid={state().status === 'invalid'}
									/>
								</Show>
							}
						>
							<ColorEditor
								value={outputValue()}
								readonly={true}
								showChips={showChips()}
								colorTokens={colorTokens()}
								side="output"
								scrollTop={outputScrollTop()}
								onScrollPositionChange={handleOutputScroll}
							/>
						</Show>
					</div>
				</div>
			</div>
		</div>
	);
}
