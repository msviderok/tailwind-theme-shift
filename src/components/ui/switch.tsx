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
				'peer group/switch relative inline-flex shrink-0 items-center rounded-base border-2 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 aria-invalid:border-destructive data-[size=default]:h-6 data-[size=default]:w-12 data-[size=sm]:h-5 data-[size=sm]:w-9 data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer data-checked:bg-primary-soft data-checked:border-primary-strong data-unchecked:bg-secondary-soft data-unchecked:border-secondary-strong shadow-shadow active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none',
				local.class,
			)}
			{...rest}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				class="pointer-events-none relative flex items-center justify-center group/thumb rounded-base border-2 bg-background ring-0 transition-transform group-data-checked/switch:border-primary-strong group-data-unchecked/switch:border-secondary-strong group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-5 group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0"
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
