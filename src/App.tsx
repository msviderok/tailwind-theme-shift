import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createMemo, createSignal, Show } from 'solid-js';
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

type DerivedResult =
	| { error: string }
	| { output: string; tokens: ColorToken[]; kind: 'raw-hsl' | 'css' };

export default function App() {
	const [input, setInput] = createSignal('');
	const [highlight, setHighlight] = createSignal(true);

	const derived = createMemo((): DerivedResult => {
		const src = input();
		if (!src.trim()) return { output: '', tokens: [], kind: 'css' };
		const v = validate(src);
		if (!v.ok) return { error: v.message };
		if (v.kind === 'raw-hsl') {
			const { output, tokens } = convertRawHsl(src);
			return { output, tokens, kind: 'raw-hsl' };
		}
		const { output, tokens } = convertHslToOklchCss(src);
		return { output, tokens, kind: 'css' };
	});

	const outputValue = () => {
		const d = derived();
		return 'error' in d ? '' : d.output;
	};

	const inputTokens = (): ColorToken[] => {
		const d = derived();
		return 'error' in d ? [] : d.tokens;
	};

	const outputTokens = (): ColorToken[] => {
		const d = derived();
		return 'error' in d ? [] : d.tokens;
	};

	const errorMessage = () => {
		const d = derived();
		return 'error' in d ? d.error : null;
	};

	return (
		<div class="flex flex-col h-screen p-4 gap-4 min-h-0">
			{/* Header */}
			<div class="flex items-center justify-between shrink-0">
				<h1 class="text-xl font-semibold tracking-tight">HSL → OKLCH Tailwind v4 Converter</h1>
				<div class="flex items-center gap-2">
					<Switch checked={highlight()} onCheckedChange={(checked) => setHighlight(checked)} />
					<Label>Highlight colors</Label>
				</div>
			</div>

			{/* Error banner */}
			<Show when={errorMessage()}>
				{(msg) => (
					<div class="shrink-0 px-3 py-2 rounded-md border border-destructive bg-destructive/10 text-destructive text-sm">
						{msg()}
					</div>
				)}
			</Show>

			{/* Editor panes */}
			<div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
				<div class="flex flex-col gap-1.5 min-h-0">
					<Label class="text-xs text-muted-foreground uppercase tracking-wide">Input (HSL)</Label>
					<ColorEditor
						value={input()}
						onInput={setInput}
						readonly={false}
						highlight={highlight()}
						tokens={inputTokens()}
						side="input"
						placeholder={PLACEHOLDER}
					/>
				</div>
				<div class="flex flex-col gap-1.5 min-h-0">
					<Label class="text-xs text-muted-foreground uppercase tracking-wide">
						Output (OKLCH)
					</Label>
					<ColorEditor
						value={outputValue()}
						readonly={true}
						highlight={highlight()}
						tokens={outputTokens()}
						side="output"
						placeholder="Output will appear here…"
					/>
				</div>
			</div>
		</div>
	);
}
