<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		class?: ClassValue;
		children: Snippet;
	};

	let { class: klass, children }: Props = $props();
</script>

<div class={['flex items-center gap-2.5 eyebrow', klass]}>
	<span
		class="inline-block h-1.5 w-1.5 rounded-full bg-kairos-cyan"
		style="box-shadow: 0 0 12px var(--kairos-cyan)"
	></span>
	{@render children()}
</div>
