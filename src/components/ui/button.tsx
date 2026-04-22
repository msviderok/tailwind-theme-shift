import { cva, type VariantProps } from 'class-variance-authority';
import { mergeProps, splitProps, type JSX } from 'solid-js';

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
	'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
				noShadow: 'text-main-foreground bg-main border-2 border-border',
				neutral:
					'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
				reverse:
					'text-main-foreground bg-main border-2 border-border hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 px-3',
				lg: 'h-11 px-8',
				icon: 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
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
			variant: 'default' as const,
			size: 'default' as const,
			focusableWhenDisabled: false,
			nativeButton: true,
			type: 'button' as const,
		},
		props,
	);

	const [local, rest] = splitProps(mergedProps, [
		'class',
		'variant',
		'size',
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
	]);

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
			class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
			disabled={isDisabled() && !isFocusableWhenDisabled()}
			tabIndex={isFocusableWhenDisabled() ? (local.tabIndex ?? 0) : local.tabIndex}
			type={local.nativeButton ? local.type : undefined}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
			onMouseDown={handleMouseDown}
			onPointerDown={handlePointerDown}
			{...rest}
		/>
	);
}

export { Button, buttonVariants };
