import { useRender } from '@msviderok/base-ui-solid/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { mergeProps, splitProps } from 'solid-js';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-base w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] overflow-hidden',
	{
		variants: {
			variant: {
				default: 'bg-main text-main-foreground',
				neutral: 'bg-secondary-background text-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

function Badge(props: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	const mergedProps = mergeProps({ variant: 'default' as const }, props);
	const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'render']);
	const element = useRender({
		props: mergeProps(
			{
				get class() {
					return cn(badgeVariants({ class: local.class, variant: local.variant }));
				},
			},
			rest,
		),
		get render() {
			return local.render ?? 'span';
		},
		state: {
			slot: 'badge',
			get variant() {
				return local.variant;
			},
		},
	});

	return <>{element()}</>;
}

export { Badge, badgeVariants };
