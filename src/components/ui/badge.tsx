import { useRender } from '@msviderok/base-ui-solid/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { mergeProps, splitProps } from 'solid-js';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center gap-1 w-fit whitespace-nowrap shrink-0 font-heading font-black uppercase tracking-[0.15em] text-[11px] leading-none px-2 py-1 -rotate-2 [&>svg]:size-3 [&>svg]:pointer-events-none',
	{
		variants: {
			variant: {
				primary: 'bg-primary-strong text-primary-soft',
				secondary: 'bg-secondary-strong text-secondary-soft',
				tertiary: 'bg-tertiary-strong text-tertiary-soft',
			},
		},
		defaultVariants: {
			variant: 'primary',
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
