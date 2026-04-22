import { Switch as SwitchPrimitive } from '@msviderok/base-ui-solid/switch';
import { mergeProps, Show, splitProps, type JSX } from 'solid-js';

import { cn } from '@/lib/utils';

function Switch(
	props: SwitchPrimitive.Root.Props & {
		size?: 'sm' | 'default';
		icons: { on: JSX.Element; off: JSX.Element };
	},
) {
	const mergedProps = mergeProps({ size: 'default' }, props);
	const [local, rest] = splitProps(mergedProps, ['class', 'size', 'icons']);
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={local.size}
			class={cn(
				'peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-transparent data-checked:bg-input/90 data-unchecked:border-transparent data-unchecked:bg-input/90 data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer',
				local.class,
			)}
			{...rest}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				class="pointer-events-none relative flex items-center justify-center group/thumb rounded-full bg-background shadow-sm ring-0 transition-transform not-dark:bg-clip-padding group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-6 group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4 data-checked:translate-x-[calc(100%-8px)] dark:data-checked:bg-primary-foreground data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground group-active/switch:scale-95 group-active/switch:inset-shadow-red-600 group-active/switch:inset-shadow-2xl"
			>
				<span class="absolute top-0 left-0 size-full flex items-center justify-center group-data-checked/thumb:flex group-data-checked/thumb:checked:opacity-100 group-data-unchecked/thumb:hidden group-data-unchecked/thumb:opacity-0 transition-[filter,opacity,transform] group-data-checked/thumb:filter-none group-data-unchecked/thumb:blur-[0.5px]">
					{local.icons.on}
				</span>
				<span class="absolute top-0 left-0 size-full flex items-center justify-center group-data-checked/thumb:flex group-data-unchecked/thumb:flex group-data-unchecked/thumb:opacity-100 group-data-checked/thumb:opacity-0 transition-[opacity,filter,transform] group-data-checked/thumb:blur-[0.5px] group-data-unchecked/thumb:filter-none">
					{local.icons.off}
				</span>
			</SwitchPrimitive.Thumb>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
