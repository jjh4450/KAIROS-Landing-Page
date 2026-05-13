<script lang="ts">
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import type { Snippet } from 'svelte';

	let { children, footer }: { children: Snippet; footer?: Snippet } = $props();
</script>

<AmbientBackdrop />

<main class="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<a href="/" class="flex items-center gap-2 self-center font-mono font-medium">
			<span
				class="from-kairos-cyan to-kairos-violet inline-block h-5 w-5 bg-gradient-to-br"
				style="box-shadow: 0 0 18px -4px var(--kairos-cyan)"
				aria-hidden="true"
			></span>
			<span class="text-[13px] tracking-widest">
				KAIROS<span class="text-kairos-cyan">_</span>
			</span>
		</a>

		{@render children()}

		{#if footer}
			{@render footer()}
		{/if}
	</div>
</main>
