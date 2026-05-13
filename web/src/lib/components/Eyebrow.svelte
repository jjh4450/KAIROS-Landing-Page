<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: klass, children }: Props = $props();
</script>

<div class={['eyebrow flex items-center gap-2.5', klass]}>
	<span
		class="bg-kairos-cyan inline-block h-1.5 w-1.5 rounded-full"
		style="box-shadow: 0 0 12px var(--kairos-cyan)"
	></span>
	{@render children()}
</div>
