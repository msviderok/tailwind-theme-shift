import { Show, splitProps, type JSX } from 'solid-js';

interface HighlightIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	state?: 'on' | 'off';
}

export default function HighlightIcon(props: HighlightIconProps) {
	const [local, rest] = splitProps(props, ['state']);
	return (
		<svg
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			<path d="m10 6-6 6 6 6" stroke={local.state === 'on' ? '#c084fc' : '#9ca3af'} />
			<path d="m14 6 6 6-6 6" stroke={local.state === 'on' ? '#c084fc' : '#9ca3af'} />
			<path d="m13 9-2 6" stroke={local.state === 'on' ? '#38bdf8' : '#9ca3af'} />
			<Show when={local.state === 'off'}>
				<path d="m5 5 15 15" stroke="#9ca3af" />
			</Show>
		</svg>
	);
}
