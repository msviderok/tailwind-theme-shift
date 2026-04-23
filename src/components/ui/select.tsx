import { Select as SelectPrimitive } from '@msviderok/base-ui-solid/select';
import { mergeProps, splitProps, type ComponentProps } from 'solid-js';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-solid';
import { Button } from './button';

const Select = SelectPrimitive.Root;

function SelectGroup(props: SelectPrimitive.Group.Props) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			class={cn('scroll-my-1.5 p-1.5', local.class)}
			{...rest}
		/>
	);
}

function SelectValue(props: SelectPrimitive.Value.Props) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			class={cn('flex flex-1 text-left', local.class)}
			{...rest}
		/>
	);
}

function SelectTrigger(
	props: SelectPrimitive.Trigger.Props & {
		size?: 'sm' | 'default';
	},
) {
	const mergedProps = mergeProps({ size: 'default' as const }, props);
	const [local, rest] = splitProps(mergedProps, ['class', 'size', 'children']);
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={local.size}
			render={{
				component: Button,
				variant: 'primary',
				size: local.size,
				class: cn(
					"justify-between gap-1.5 w-fit whitespace-nowrap aria-expanded:translate-x-boxShadowX aria-expanded:translate-y-boxShadowY aria-expanded:shadow-none data-placeholder:opacity-60 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4",
					local.class,
				),
			}}
			{...rest}
		>
			{local.children}
			<SelectPrimitive.Icon
				render={{
					component: ChevronDownIcon,
					class: 'pointer-events-none size-4',
				}}
			/>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent(
	props: SelectPrimitive.Popup.Props &
		Pick<
			SelectPrimitive.Positioner.Props,
			'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
		>,
) {
	const mergedProps = mergeProps(
		{
			side: 'bottom' as const,
			sideOffset: 4,
			align: 'center' as const,
			alignOffset: 0,
			alignItemWithTrigger: true,
		},
		props,
	);
	const [local, rest] = splitProps(mergedProps, [
		'class',
		'children',
		'side',
		'sideOffset',
		'align',
		'alignOffset',
		'alignItemWithTrigger',
	]);
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				side={local.side}
				sideOffset={local.sideOffset}
				align={local.align}
				alignOffset={local.alignOffset}
				alignItemWithTrigger={local.alignItemWithTrigger}
				class="isolate z-50"
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					data-align-trigger={local.alignItemWithTrigger}
					class={cn(
						'isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-base border-2 border-primary-strong bg-primary-soft text-primary-strong font-base shadow-shadow duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 **:data-[slot$=-item]:data-highlighted:inset-shadow-[0px_0px_3px] **:data-[slot$=-item]:data-highlighted:inset-shadow-current **:data-[slot$=-item]:data-highlighted:bg-[color-mix(in_oklch,currentColor_8%,transparent)] **:data-[slot$=-item]:focus:inset-shadow-[0px_0px_3px] **:data-[slot$=-item]:focus:inset-shadow-current **:data-[slot$=-separator]:bg-primary-strong',
						local.class,
					)}
					{...rest}
				>
					<SelectScrollUpButton />
					{local.children}
					<SelectScrollDownButton />
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel(props: SelectPrimitive.GroupLabel.Props) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			class={cn('px-3 py-2.5 text-xs text-muted-foreground', local.class)}
			{...rest}
		/>
	);
}

function SelectItem(props: SelectPrimitive.Item.Props) {
	const [local, rest] = splitProps(props, ['class', 'children']);
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			class={cn(
				"relative flex h-6 w-full cursor-default items-center gap-1 rounded-none py-0 pr-6 pl-1.5 text-xs font-base outline-hidden select-none transition-[box-shadow,background-color] data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				local.class,
			)}
			{...rest}
		>
			<SelectPrimitive.ItemText class="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
				{local.children}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator
				render={{
					component: 'span',
					class: 'pointer-events-none absolute right-1.5 flex size-3.5 items-center justify-center',
				}}
			>
				<CheckIcon class="pointer-events-none" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator(props: SelectPrimitive.Separator.Props) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			class={cn('pointer-events-none -mx-1.5 my-1.5 h-0.5 bg-primary-strong', local.class)}
			{...rest}
		/>
	);
}

function SelectScrollUpButton(props: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.ScrollUpArrow
			data-slot="select-scroll-up-button"
			class={cn(
				"top-0 z-10 flex w-full cursor-default items-center justify-center bg-primary-soft text-primary-strong py-1 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			{...rest}
		>
			<ChevronUpIcon />
		</SelectPrimitive.ScrollUpArrow>
	);
}

function SelectScrollDownButton(props: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<SelectPrimitive.ScrollDownArrow
			data-slot="select-scroll-down-button"
			class={cn(
				"bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-primary-soft text-primary-strong py-1 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			{...rest}
		>
			<ChevronDownIcon />
		</SelectPrimitive.ScrollDownArrow>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
