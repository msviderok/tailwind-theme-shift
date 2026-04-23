import { cva, type VariantProps } from 'class-variance-authority';
import { children, mergeProps, splitProps, type JSX } from 'solid-js';
import { cn } from '../../lib/utils';

function callEventHandler<T, E extends Event>(
	handler: JSX.EventHandlerUnion<T, E> | undefined,
	event: E & { currentTarget: T; target: Element },
) {
	if (!handler) return;
	if (typeof handler === 'function') {
		handler(event);
	} else {
		handler[0](handler[1], event);
	}
}

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-base font-bold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 px-2 text-xs [&_span[data-only=false]]:contents [&_span[data-only=true]]:transition-all',
	{
		variants: {
			variant: {
				primary: 'bg-primary-soft text-primary-strong border-2 border-primary-strong',
				secondary: 'bg-secondary-soft text-secondary-strong border-2 border-secondary-strong',
				tertiary: 'bg-tertiary-soft text-tertiary-strong border-2 border-tertiary-strong',
			},
			vibe: {
				elevated:
					'shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
				'elevated-reverse':
					'shadow-none hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow',
				'pushed-in':
					'inset-shadow-current hover:inset-shadow-[0px_0px_3px] active:bg-primary-soft/80 active:[&_span]:scale-94 active:shadow-[inset_0_0_10px_2px_color-mix(in_oklch,currentColor_30%,transparent),inset_0_4px_8px_-2px_color-mix(in_oklch,currentColor_35%,transparent)]',
			},
		},
		defaultVariants: {
			variant: 'primary',
			vibe: 'elevated',
		},
	},
);

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		focusableWhenDisabled?: boolean | undefined;
		nativeButton?: boolean | undefined;
	};

function Button(props: ButtonProps) {
	const mergedProps = mergeProps(
		{
			variant: 'primary' as const,
			vibe: 'elevated' as const,
			focusableWhenDisabled: false,
			nativeButton: true,
			type: 'button' as const,
		},
		props,
	);

	const [local, rest] = splitProps(mergedProps, [
		'class',
		'vibe',
		'variant',
		'disabled',
		'focusableWhenDisabled',
		'nativeButton',
		'type',
		'tabIndex',
		'onClick',
		'onMouseDown',
		'onPointerDown',
		'onKeyDown',
		'onKeyUp',
		'children',
	]);

	const safeChildren = children(() => local.children);

	const isDisabled = () => Boolean(local.disabled);
	const isFocusableWhenDisabled = () => isDisabled() && Boolean(local.focusableWhenDisabled);

	const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
		if (isDisabled()) {
			event.preventDefault();
			return;
		}
		callEventHandler(local.onClick, event);
	};

	const handleMouseDown: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
		if (!isDisabled()) {
			callEventHandler(local.onMouseDown, event);
		}
	};

	const handlePointerDown: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (event) => {
		if (isDisabled()) {
			event.preventDefault();
			return;
		}
		callEventHandler(local.onPointerDown, event);
	};

	const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
		if (isDisabled()) {
			if (isFocusableWhenDisabled()) {
				event.preventDefault();
			}
			return;
		}
		callEventHandler(local.onKeyDown, event);
	};

	const handleKeyUp: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
		if (isDisabled()) {
			if (isFocusableWhenDisabled()) {
				event.preventDefault();
			}
			return;
		}
		callEventHandler(local.onKeyUp, event);
	};

	return (
		<button
			data-slot="button"
			aria-disabled={isDisabled() || undefined}
			class={cn(buttonVariants({ variant: local.variant, vibe: local.vibe }), local.class)}
			disabled={isDisabled() && !isFocusableWhenDisabled()}
			tabIndex={isFocusableWhenDisabled() ? (local.tabIndex ?? 0) : local.tabIndex}
			type={local.nativeButton ? local.type : undefined}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
			onMouseDown={handleMouseDown}
			onPointerDown={handlePointerDown}
			{...rest}
		>
			<span data-only={safeChildren.toArray().length === 1}>{local.children}</span>
		</button>
	);
}

export { Button, buttonVariants };
