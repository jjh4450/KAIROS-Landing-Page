<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import EmptyStateCard from './EmptyStateCard.svelte';
	import type { Section, Sponsor } from '$lib/types';
	import { PUBLIC_PB_URL } from '$env/static/public';

	type Props = { sponsors: Sponsor[]; section?: Section | null };
	let { sponsors, section }: Props = $props();

	const eyebrow = $derived(section?.eyebrow ?? '// supported by');
	const title = $derived(section?.title ?? '후원사 & 파트너');

	const tierOrder: Record<Sponsor['tier'], number> = {
		platinum: 0,
		gold: 1,
		silver: 2,
		bronze: 3,
		partner: 4
	};

	const sorted = $derived(
		[...sponsors].sort(
			(a, b) => tierOrder[a.tier] - tierOrder[b.tier] || (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
		)
	);

	function logoUrl(s: Sponsor): string | undefined {
		if (!s.logo) return undefined;
		return `${PUBLIC_PB_URL}/api/files/sponsors/${s.id}/${s.logo}`;
	}
</script>

<section id="sponsors" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-10 flex max-w-3xl flex-col gap-4">
		<Eyebrow>{eyebrow}</Eyebrow>
		<h2>{title}</h2>
	</header>

	{#if sorted.length === 0}
		<EmptyStateCard message="$ awaiting partners." hint="후원과 협력 문의를 환영합니다." />
	{:else}
		<div class="reveal flex flex-wrap items-center justify-start gap-x-2 gap-y-4">
			{#each sorted as s, i (s.id)}
				{#if i > 0}
					<Separator orientation="vertical" class="h-12" />
				{/if}
				<div class="tilt-3d">
					<div use:cardTilt={{ max: 10, scale: 1.05 }} class="tilt-3d-card">
						{#if s.link}
							<!-- 외부 스폰서 사이트 -->
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								href={s.link}
								target="_blank"
								rel="noopener"
								class="relative inline-flex h-16 min-w-[140px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-5 ring-1 ring-foreground/10 transition-all hover:ring-foreground/25"
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
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{:else}
							<div
								class="relative inline-flex h-16 min-w-[140px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-5 ring-1 ring-foreground/10"
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
