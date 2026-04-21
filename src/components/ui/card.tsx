import { cn } from '@/lib/utils';
import { mergeProps, splitProps, type ComponentProps } from 'solid-js';

function Card(props: ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
	const mergedProps = mergeProps({ size: 'default' }, props);
	const [local, rest] = splitProps(mergedProps, ['class', 'size']);
	return (
		<div
			data-slot="card"
			data-size={local.size}
			class={cn(
				'group/card flex flex-col gap-6 overflow-hidden rounded-4xl bg-card py-6 text-sm text-card-foreground shadow-md ring-1 ring-foreground/5 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 dark:ring-foreground/10 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl',
				local.class,
			)}
			{...rest}
		/>
	);
}

function CardHeader(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-header"
			class={cn(
				'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
				local.class,
			)}
			{...rest}
		/>
	);
}

function CardTitle(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-title"
			class={cn('font-heading text-base font-medium', local.class)}
			{...rest}
		/>
	);
}

function CardDescription(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-description"
			class={cn('text-sm text-muted-foreground', local.class)}
			{...rest}
		/>
	);
}

function CardAction(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-action"
			class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', local.class)}
			{...rest}
		/>
	);
}

function CardContent(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-content"
			class={cn('px-6 group-data-[size=sm]/card:px-4', local.class)}
			{...rest}
		/>
	);
}

function CardFooter(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="card-footer"
			class={cn(
				'flex items-center rounded-b-4xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4',
				local.class,
			)}
			{...rest}
		/>
	);
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
