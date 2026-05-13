<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import type { Sponsor } from '$lib/types';
	import { PUBLIC_PB_URL } from '$env/static/public';

	type Props = { sponsors: Sponsor[] };
	let { sponsors }: Props = $props();

	const tierOrder: Record<Sponsor['tier'], number> = {
		platinum: 0,
		gold: 1,
		silver: 2,
		bronze: 3,
		partner: 4
	};

	const sorted = $derived(
		[...sponsors].sort(
			(a, b) =>
				tierOrder[a.tier] - tierOrder[b.tier] ||
				(a.sortOrder ?? 999) - (b.sortOrder ?? 999)
		)
	);

	function logoUrl(s: Sponsor): string | undefined {
		if (!s.logo) return undefined;
		return `${PUBLIC_PB_URL}/api/files/sponsors/${s.id}/${s.logo}`;
	}
</script>

<section id="sponsors" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-10 flex max-w-3xl flex-col gap-4">
		<Eyebrow>// supported by</Eyebrow>
		<h2>후원사 & 파트너</h2>
	</header>

	{#if sorted.length === 0}
		<div class="tilt-3d">
			<div use:cardTilt={{ max: 4, scale: 1.01 }} class="tilt-3d-card">
				<Card.Root class="relative overflow-hidden">
					<div class="tilt-3d-glare"></div>
					<Card.Content class="tilt-3d-layer relative">
						<p class="text-muted-foreground font-mono text-sm">
							$ awaiting partners.
							<span class="text-kairos-cyan">동아리 후원 / 협력 문의 환영.</span>
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<div class="reveal flex flex-wrap items-center justify-start gap-x-2 gap-y-4">
			{#each sorted as s, i (s.id)}
				{#if i > 0}
					<Separator orientation="vertical" class="h-12" />
				{/if}
				<div class="tilt-3d">
					<div use:cardTilt={{ max: 10, scale: 1.05 }} class="tilt-3d-card">
						{#if s.link}
							<a
								href={s.link}
								target="_blank"
								rel="noopener"
								class="ring-foreground/10 hover:ring-foreground/25 relative inline-flex h-16 min-w-[140px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-5 ring-1 transition-all"
								title={s.name}
							>
								<span class="tilt-3d-glare"></span>
								<span class="tilt-3d-layer">
									{#if logoUrl(s)}
										<img src={logoUrl(s)} alt={s.name} class="max-h-9 max-w-full opacity-80" />
									{:else}
										<span class="font-mono text-sm">{s.name}</span>
									{/if}
								</span>
							</a>
						{:else}
							<div
								class="ring-foreground/10 relative inline-flex h-16 min-w-[140px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-5 ring-1"
							>
								<span class="tilt-3d-glare"></span>
								<span class="tilt-3d-layer">
									{#if logoUrl(s)}
										<img src={logoUrl(s)} alt={s.name} class="max-h-9 max-w-full opacity-80" />
									{:else}
										<span class="font-mono text-sm">{s.name}</span>
									{/if}
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
