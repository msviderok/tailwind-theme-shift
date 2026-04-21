import { Highlighter, LightbulbOff, Sun, X } from 'lucide-solid';
import {
	For,
	Show,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
} from 'solid-js';
import { ColorEditor } from './components/ColorEditor';
import type { ColorToken } from './lib/parseHslColors';
import { convertHslToOklchCss, convertRawHsl } from './lib/parseHslColors';
import { validate } from './lib/validateTailwindTheme';

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
		setVisibleRows(Math.max(1, Math.ceil(ref.clientHeight / 21)));
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

	const totalLines = createMemo(() =>
		Math.max(props.lines.length, visibleRows(), 1),
	);

	return (
		<div ref={ref} class="line-numbers">
			<For each={Array.from({ length: totalLines() })}>{(_, index) => <span>{index() + 1}</span>}</For>
		</div>
	);
}

function EmptyOutputState(props: { message: string; detail?: string }) {
	return (
		<div class="empty-state">
			<div class="empty-icon">◈</div>
			<div class="empty-text">
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
	const [lightTheme, setLightTheme] = createSignal(false);
	const [copied, setCopied] = createSignal(false);
	const [activeMobilePane, setActiveMobilePane] = createSignal<'input' | 'output'>('input');
	const [inputScrollTop, setInputScrollTop] = createSignal(0);

	let copyResetTimer: number | undefined;

	onCleanup(() => {
		if (copyResetTimer) {
			window.clearTimeout(copyResetTimer);
		}
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

	return (
		<div classList={{ app: true, light: lightTheme() }}>
			<div class="mobile-pane-tabs">
				<button
					type="button"
					classList={{ 'mobile-pane-tab': true, active: isInputMobileActive() }}
					onClick={() => setActiveMobilePane('input')}
				>
					Input
				</button>
				<button
					type="button"
					classList={{ 'mobile-pane-tab': true, active: isOutputMobileActive() }}
					onClick={() => setActiveMobilePane('output')}
				>
					Output
				</button>
			</div>

			<div class="panes">
				<div classList={{ pane: true, 'mobile-active-pane': isInputMobileActive() }}>
					<div class="pane-header">
						<div class="pane-dot dot-in" />
						<span class="pane-label">Input</span>
						<span class="pane-sublabel">HSL</span>
						<div class="pane-header-spacer" />
						<Show
							when={input()}
							fallback={
								<button type="button" class="copy-btn" onClick={handleSample}>
									Load sample
								</button>
							}
						>
							<button type="button" class="copy-btn" onClick={handleInputClear}>
								Clear
							</button>
						</Show>
					</div>

					<div class="code-scroll">
						<div class="code-inner">
							<LineNumbers lines={inputLines()} scrollTop={inputScrollTop()} />
							<div class="code-content">
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

				<div class="divider" aria-hidden="true">
					<div class="divider-handle">
						<div class="divider-dot" />
						<div class="divider-dot" />
					</div>
				</div>

				<div classList={{ pane: true, 'mobile-active-pane': isOutputMobileActive() }}>
					<div class="pane-header">
						<div class="pane-dot dot-out" />
						<span class="pane-label">Output</span>
						<span class="pane-sublabel">OKLCH</span>
						<div class="pane-header-spacer" />
						<Show when={outputValue()}>
							<button
								type="button"
								classList={{ 'copy-btn': true, copied: copied() }}
								onClick={handleCopy}
							>
								{copied() ? 'Copied!' : 'Copy'}
							</button>
						</Show>
					</div>

					<div class="code-scroll">
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
											message="Input needs attention"
											detail={
												state().status === 'invalid' ? state().error ?? undefined : undefined
											}
										/>
									</Show>
							}
						>
							<div class="code-inner">
								<LineNumbers lines={outputLines()} />
								<div class="code-content">
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

			<footer class="app-footer">
				<div class="app-footer-spacer" />

				<div class="footer-controls">
					<div class="icon-toggle icon-toggle-sm">
						<span classList={{ 'icon-toggle-icon': true, active: !lightTheme() }}>
							<LightbulbOff size={13} />
						</span>
						<button
							type="button"
							classList={{ 'icon-toggle-track': true, 'icon-toggle-track-sm': true, on: lightTheme() }}
							onClick={() => setLightTheme((value) => !value)}
							aria-label={lightTheme() ? 'Switch to dark theme' : 'Switch to light theme'}
						>
							<div class="icon-toggle-thumb icon-toggle-thumb-sm" />
						</button>
						<span classList={{ 'icon-toggle-icon': true, active: lightTheme() }}>
							<Sun size={13} />
						</span>
					</div>

					<div class="footer-controls-sep" />

					<div class="icon-toggle icon-toggle-sm">
						<span classList={{ 'icon-toggle-icon': true, active: !showChips() }}>
							<X size={13} />
						</span>
						<button
							type="button"
							classList={{ 'icon-toggle-track': true, 'icon-toggle-track-sm': true, on: showChips() }}
							onClick={() => setShowChips((value) => !value)}
							aria-label={showChips() ? 'Disable color chips' : 'Enable color chips'}
						>
							<div class="icon-toggle-thumb icon-toggle-thumb-sm" />
						</button>
						<span classList={{ 'icon-toggle-icon': true, active: showChips() }}>
							<Highlighter size={13} />
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
