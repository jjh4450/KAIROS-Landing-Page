<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import { fmtYear } from '$lib/format';
	import EmptyStateCard from './EmptyStateCard.svelte';
	import type { Achievement, Section } from '$lib/types';

	type Props = { achievements: Achievement[]; section?: Section | null };
	let { achievements, section }: Props = $props();

	const eyebrow = $derived(section?.eyebrow ?? '// wall of fame');
	const title = $derived(section?.title ?? '학기별 활동 기록.');
	const description = $derived(
		section?.description ?? '대회 입상, CVE 발견, 외부 발표 기록입니다.'
	);

	let sectionEl: HTMLElement | undefined = $state();

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !sectionEl) return;

		let ctx: { revert: () => void } | undefined;
		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				gsap.registerPlugin(ScrollTrigger);
				ctx = gsap.context(() => {
					// 타임라인의 점들을 스크롤에 맞춰 살짝 좌→우로 슬라이드
					gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((el) => {
						gsap.fromTo(
							el,
							{ x: -24, opacity: 0.6 },
							{
								x: 0,
								opacity: 1,
								ease: 'power2.out',
								scrollTrigger: {
									trigger: el,
									start: 'top 85%',
									end: 'top 50%',
									scrub: 0.4
								}
							}
						);
					});
				}, sectionEl!);
			}
		);

		return () => {
			ctx?.revert();
		};
	});
</script>

<section
	bind:this={sectionEl}
	id="achievements"
	class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32"
>
	<header class="reveal mb-12 flex max-w-3xl flex-col gap-4 md:mb-16">
		<Eyebrow>{eyebrow}</Eyebrow>
		<h2>{title}</h2>
		<p class="text-base text-muted-foreground md:text-lg">
			{description}
		</p>
	</header>

	{#if achievements.length === 0}
		<EmptyStateCard message="$ no entries yet." hint="(아직 등록된 기록이 없습니다)" />
	{:else}
		<ol
			class="reveal-children relative space-y-3 border-l border-border/40 pl-6 md:pl-8"
			style="font-feature-settings: 'tnum'"
		>
			{#each achievements as a (a.id)}
				<li class="relative tilt-3d" data-timeline-item>
					<span
						class="absolute top-4 -left-[27px] z-10 h-2 w-2 bg-kairos-cyan md:-left-[33px]"
						style="box-shadow: 0 0 12px var(--kairos-cyan)"
					></span>
					<div use:cardTilt={{ max: 5, scale: 1.015 }} class="tilt-3d-card">
						<Card.Root size="sm" class="relative overflow-hidden">
							<div class="tilt-3d-glare"></div>
							<Card.Content
								class="relative flex tilt-3d-layer flex-col gap-1.5 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<div class="text-sm font-medium text-foreground">{a.title}</div>
									{#if a.competition}
										<div class="mt-0.5 font-mono text-[11px] text-muted-foreground">
											{a.competition}
										</div>
									{/if}
								</div>
								<div class="flex shrink-0 items-center gap-3 font-mono text-[11px]">
									{#if a.rank}
										<Badge
											variant="outline"
											class="border-kairos-magenta/40 font-mono text-kairos-magenta uppercase"
										>
											{a.rank}
										</Badge>
									{/if}
									<span class="text-muted-foreground">{fmtYear(a.date)}</span>
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</section>
