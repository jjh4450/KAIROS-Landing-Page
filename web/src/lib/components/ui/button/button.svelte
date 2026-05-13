<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: cn(
			// shape
			"group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap",
			"rounded-[var(--radius-md)] border border-transparent bg-clip-padding",
			// type
			"text-xs font-medium tracking-tight",
			// transition / motion
			"transition-all duration-300 ease-[var(--ease-brand)]",
			"active:not-aria-[haspopup]:translate-y-px",
			// focus
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 outline-none",
			// invalid
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-1",
			// disabled
			"select-none disabled:pointer-events-none disabled:opacity-50",
			// icons
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
		),
		variants: {
			variant: {
				default: cn(
					"bg-gradient-to-br from-kairos-cyan to-kairos-violet text-primary-foreground font-semibold",
					"shadow-[0_8px_24px_-8px_var(--kairos-cyan)] hover:shadow-[0_12px_32px_-8px_var(--kairos-cyan)]",
					"hover:brightness-110"
				),
				outline: cn(
					"border-white/15 bg-white/5 text-foreground",
					"backdrop-blur-lg backdrop-saturate-150",
					"hover:bg-white/10 hover:border-white/30"
				),
				secondary: cn(
					"bg-secondary/40 text-secondary-foreground backdrop-blur-lg",
					"hover:bg-secondary/55"
				),
				ghost: cn(
					"text-muted-foreground hover:text-foreground",
					"hover:bg-white/5"
				),
				destructive: cn(
					"bg-destructive/15 text-destructive hover:bg-destructive/25",
					"focus-visible:ring-destructive/40"
				),
				link: "text-kairos-cyan underline-offset-4 hover:underline"
			},
			size: {
				default: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
				xs: "h-7 gap-1 px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1.5 px-3 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-11 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
				icon: "size-9",
				"icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
				"icon-lg": "size-11"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
