<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		for?: string;
		class?: string;
		children: Snippet;
	};

	let { for: htmlFor, class: extra = '', children }: Props = $props();
</script>

<Label for={htmlFor} class="font-mono text-[11px] tracking-[0.18em] uppercase {extra}">
	{@render children()}
</Label>
