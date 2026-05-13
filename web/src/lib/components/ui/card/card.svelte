<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = 'default',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { size?: 'default' | 'sm' } = $props();
</script>

<!--
  KAIROS glass card override of shadcn-svelte "lyra" base.
  Adds: backdrop-blur translucency, rounded radius, inset highlight, ambient drop shadow.
-->
<div
	bind:this={ref}
	data-slot="card"
	data-size={size}
	class={cn(
		[
			// layout
			'group/card relative flex flex-col gap-4 overflow-hidden py-5',
			'text-sm/relaxed text-card-foreground',
			// glass surface
			'bg-card/65 supports-[backdrop-filter]:bg-card/40',
			'backdrop-blur-xl backdrop-saturate-150',
			'border border-white/10',
			'rounded-[var(--radius-lg)]',
			// elevation
			'shadow-[inset_0_1px_0_var(--glass-highlight),0_24px_60px_-28px_oklch(0_0_0_/_60%)]',
			// footer/image edge handling
			'has-data-[slot=card-footer]:pb-0',
			'has-[>img:first-child]:pt-0',
			// size variant
			'data-[size=sm]:gap-2 data-[size=sm]:py-4',
			'data-[size=sm]:has-data-[slot=card-footer]:pb-0',
			// image children stay square
			'*:[img:first-child]:rounded-none *:[img:last-child]:rounded-none'
		],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
