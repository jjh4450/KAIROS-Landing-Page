<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: [
			'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap',
			'h-5 px-2 py-0.5 text-[11px] font-medium',
			'rounded-full border border-transparent',
			'transition-colors duration-200',
			'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
			'[&>svg]:size-3! [&>svg]:pointer-events-none',
			'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
			'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
		].join(' '),
		variants: {
			variant: {
				default: 'bg-primary/15 text-primary border-primary/30 [a]:hover:bg-primary/25',
				secondary:
					'bg-secondary/20 text-secondary-foreground border-secondary/30 [a]:hover:bg-secondary/30',
				destructive:
					'bg-destructive/15 text-destructive border-destructive/30 focus-visible:ring-destructive/40 [a]:hover:bg-destructive/25',
				outline: 'border-white/15 bg-white/5 text-foreground backdrop-blur [a]:hover:bg-white/10',
				ghost: 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
