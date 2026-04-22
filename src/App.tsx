import { Sun, Moon, Siren, Code } from 'lucide-solid';
import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { ColorEditor } from './components/ColorEditor';
import { Switch } from './components/ui/switch';
import type { ColorToken } from './lib/parseHslColors';
import { convertHslToOklchCss, convertRawHsl } from './lib/parseHslColors';
import { cn } from './lib/utils';
import { validate } from './lib/validateTailwindTheme';
import HighlightIcon from './components/HighlightIcon';
import { Separator } from './components/ui/separator';

const PLACEHOLDER = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
}`;

const STORAGE_KEYS = {
	theme: 'hsl-to-oklch.theme',
	highlight: 'hsl-to-oklch.highlight',
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

function LineNumbers(props: { lines: string[]; scrollTop?: number }) {
	let ref: HTMLDivElement | undefined;
	const [visibleRows, setVisibleRows] = createSignal(0);

	const updateVisibleRows = () => {
		if (!ref) return;
		console.log('updateVisibleRows', ref);
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

	const totalLines = createMemo(() => Math.max(props.lines.length, visibleRows(), 1));

	return (
		<div
			ref={ref}
			class="w-12 shrink-0 overflow-hidden border-r border-border py-4 pr-3 text-right text-[13px] box-border leading-[20px] text-muted-foreground select-none"
		>
			<For each={Array.from({ length: totalLines() })}>
				{(_, index) => <span class="block">{index() + 1}</span>}
			</For>
		</div>
	);
}

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
	const [input, setInput] = createSignal('');
	const [showChips, setShowChips] = createSignal(true);
	const [isDark, setIsDark] = createSignal(true);
	const [copied, setCopied] = createSignal(false);
	const [activeMobilePane, setActiveMobilePane] = createSignal<'input' | 'output'>('input');
	const [inputScrollTop, setInputScrollTop] = createSignal(0);

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
	});

	createEffect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(STORAGE_KEYS.theme, isDark() ? 'dark' : 'light');
	});

	createEffect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(STORAGE_KEYS.highlight, String(showChips()));
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
	const inputLines = createMemo(() => input().split('\n'));
	const outputLines = createMemo(() => outputValue().split('\n'));

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

	const isInputMobileActive = createMemo(() => activeMobilePane() === 'input');
	const isOutputMobileActive = createMemo(() => activeMobilePane() === 'output');
	const actionButtonClass =
		'bg-transparent p-0 text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground transition-colors hover:text-foreground';
	const paneClass = 'min-w-0 flex-1 flex-col overflow-hidden bg-card';

	return (
		<div class="flex h-screen min-h-screen flex-col overflow-hidden bg-background text-foreground">
			<div class="flex shrink-0 gap-2 px-4 pt-3 md:hidden">
				<button
					type="button"
					class={cn(
						'flex-1 rounded-full border px-3 py-2 text-[11px] tracking-[0.08em] uppercase transition-colors',
						isInputMobileActive()
							? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_20%,var(--muted))] text-foreground'
							: 'border-border bg-muted text-muted-foreground',
					)}
					onClick={() => setActiveMobilePane('input')}
				>
					Input
				</button>
				<button
					type="button"
					class={cn(
						'flex-1 rounded-full border px-3 py-2 text-[11px] tracking-[0.08em] uppercase transition-colors',
						isOutputMobileActive()
							? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_20%,var(--muted))] text-foreground'
							: 'border-border bg-muted text-muted-foreground',
					)}
					onClick={() => setActiveMobilePane('output')}
				>
					Output
				</button>
			</div>

			<div class="flex flex-1 overflow-hidden md:px-0">
				<div
					class={cn(
						paneClass,
						isInputMobileActive() ? 'flex' : 'hidden',
						'mx-4 my-3 rounded-[18px] border border-border md:mx-0 md:my-0 md:rounded-none md:border-0 md:flex',
					)}
				>
					<div class="flex h-10 shrink-0 items-center gap-2.5 border-b border-border bg-muted px-5">
						<div class="size-2 rounded-full bg-primary" />
						<span class="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
							Input
						</span>
						<span class="font-mono text-[10px] text-muted-foreground">HSL</span>
						<div class="flex-1" />
						<Show
							when={input()}
							fallback={
								<button type="button" class={actionButtonClass} onClick={handleSample}>
									Load sample
								</button>
							}
						>
							<button type="button" class={actionButtonClass} onClick={handleInputClear}>
								Clear
							</button>
						</Show>
					</div>

					<div class="flex flex-1 overflow-auto">
						<div class="flex min-h-full flex-1">
							<LineNumbers lines={inputLines()} scrollTop={inputScrollTop()} />
							<div class="flex min-h-full min-w-0 flex-1 flex-col px-5 py-4">
								<ColorEditor
									value={input()}
									onInput={setInput}
									readonly={false}
									showChips={showChips()}
									colorTokens={colorTokens()}
									side="input"
									placeholder="Paste your Tailwind CSS variables here…"
									onScrollPositionChange={({ top }) => setInputScrollTop(top)}
								/>
							</div>
						</div>
					</div>
				</div>

				<Separator orientation="vertical" />

				<div
					class={cn(
						paneClass,
						isOutputMobileActive() ? 'flex' : 'hidden',
						'mx-4 my-3 rounded-[18px] border border-border md:mx-0 md:my-0 md:rounded-none md:border-0 md:flex',
					)}
				>
					<div class="flex h-10 shrink-0 items-center gap-2.5 border-b border-border bg-muted px-5">
						<div class="size-2 rounded-full bg-accent" />
						<span class="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
							Output
						</span>
						<span class="font-mono text-[10px] text-muted-foreground">OKLCH</span>
						<div class="flex-1" />
						<Show when={outputValue()}>
							<button
								type="button"
								class={cn(actionButtonClass, copied() && 'text-accent hover:text-accent')}
								onClick={handleCopy}
							>
								{copied() ? 'Copied!' : 'Copy'}
							</button>
						</Show>
					</div>

					<div class="flex flex-1 overflow-auto">
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
							<div class="flex min-h-full flex-1">
								<LineNumbers lines={outputLines()} />
								<div class="flex min-h-full min-w-0 flex-1 flex-col px-5 py-4">
									<ColorEditor
										value={outputValue()}
										readonly={true}
										showChips={showChips()}
										colorTokens={colorTokens()}
										side="output"
									/>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>

			<footer class="flex h-9 shrink-0 items-center border-t border-border bg-muted px-3 md:px-4">
				<div class="ml-auto flex items-center gap-3">
					<div class="flex items-center gap-2">
						<Switch
							checked={isDark()}
							onCheckedChange={(nextDark) => {
								document.documentElement.classList.toggle('dark', nextDark);
								setIsDark(nextDark);
							}}
							aria-label={isDark() ? 'Switch to light theme' : 'Switch to dark theme'}
							class="data-unchecked:text-yellow-400 data-unchecked:border-yellow-400/50 data-checked:text-sky-900 data-checked:border-sky-600/20 data-unchecked:bg-yellow-300/90 data-checked:bg-sky-900"
							icons={{
								on: <Moon size={13} />,
								off: <Sun size={13} />,
							}}
						/>
					</div>

					<div class="h-3.5 w-px bg-border" />

					<div class="flex items-center gap-2">
						<Switch
							checked={showChips()}
							onCheckedChange={(checked) => setShowChips(checked)}
							aria-label={showChips() ? 'Disable color chips' : 'Enable color chips'}
							icons={{
								on: <HighlightIcon state="on" />,
								off: <HighlightIcon state="off" />,
							}}
						/>
					</div>
				</div>
			</footer>
		</div>
	);
}
