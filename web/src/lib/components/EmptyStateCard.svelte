<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { cardTilt } from '$lib/motion/actions';

	type Props = {
		/** "$ no events scheduled." 같은 모노스페이스 1줄. */
		message: string;
		/** "(coming soon)" / "(첫 글까지 진행 중)" 같은 cyan 힌트. */
		hint?: string;
		/** custom content takes precedence over message/hint */
		children?: Snippet;
	};

	let { message, hint, children }: Props = $props();
</script>

<div class="tilt-3d">
	<div use:cardTilt={{ max: 4, scale: 1.01 }} class="tilt-3d-card">
		<Card.Root class="relative overflow-hidden">
			<div class="tilt-3d-glare"></div>
			<Card.Content class="tilt-3d-layer relative">
				{#if children}
					{@render children()}
				{:else}
					<p class="text-muted-foreground font-mono text-sm">
						{message}
						{#if hint}
							<span class="text-kairos-cyan">{hint}</span>
						{/if}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
