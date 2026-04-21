import { cva, type VariantProps } from 'class-variance-authority';
import { splitProps, type ComponentProps } from 'solid-js';

import { cn } from '@/lib/utils';

const alertVariants = cva(
	"group/alert relative grid w-full gap-0.5 rounded-2xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive:
					'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

function Alert(props: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
	const [local, rest] = splitProps(props, ['class', 'variant']);
	return (
		<div
			data-slot="alert"
			role="alert"
			class={cn(alertVariants({ variant: local.variant }), local.class)}
			{...rest}
		/>
	);
}

function AlertTitle(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="alert-title"
			class={cn(
				'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
				local.class,
			)}
			{...rest}
		/>
	);
}

function AlertDescription(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			data-slot="alert-description"
			class={cn(
				'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
				local.class,
			)}
			{...rest}
		/>
	);
}

function AlertAction(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div data-slot="alert-action" class={cn('absolute top-2.5 right-3', local.class)} {...rest} />
	);
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
