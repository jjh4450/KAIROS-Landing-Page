<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import type { Achievement } from '$lib/types';

	type Props = { achievements: Achievement[] };
	let { achievements }: Props = $props();

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
					gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((el, i) => {
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

	function year(d?: string): string {
		if (!d) return '—';
		return String(new Date(d).getFullYear());
	}
</script>

<section
	bind:this={sectionEl}
	id="achievements"
	class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32"
>
	<header class="reveal mb-12 flex max-w-3xl flex-col gap-4 md:mb-16">
		<Eyebrow>// wall of fame</Eyebrow>
		<h2>기록은 거짓말하지 않습니다.</h2>
		<p class="text-muted-foreground text-base md:text-lg">
			대회 입상, CVE 발견, 외부 발표 — 한 학기씩 쌓아 올린 결과들.
		</p>
	</header>

	{#if achievements.length === 0}
		<div class="tilt-3d">
			<div use:cardTilt={{ max: 4, scale: 1.01 }} class="tilt-3d-card">
				<Card.Root class="relative overflow-hidden">
					<div class="tilt-3d-glare"></div>
					<Card.Content class="tilt-3d-layer relative">
						<p class="text-muted-foreground font-mono text-sm">
							$ no entries yet.
							<span class="text-kairos-cyan">(첫 수상까지 진행 중)</span>
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<ol
			class="reveal-children border-border/40 relative space-y-3 border-l pl-6 md:pl-8"
			style="font-feature-settings: 'tnum'"
		>
			{#each achievements as a (a.id)}
				<li class="relative tilt-3d" data-timeline-item>
					<span
						class="bg-kairos-cyan absolute top-4 -left-[27px] z-10 h-2 w-2 md:-left-[33px]"
						style="box-shadow: 0 0 12px var(--kairos-cyan)"
					></span>
					<div use:cardTilt={{ max: 5, scale: 1.015 }} class="tilt-3d-card">
						<Card.Root size="sm" class="relative overflow-hidden">
							<div class="tilt-3d-glare"></div>
							<Card.Content
								class="tilt-3d-layer relative flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<div class="text-foreground text-sm font-medium">{a.title}</div>
									{#if a.competition}
										<div class="text-muted-foreground mt-0.5 font-mono text-[11px]">
											{a.competition}
										</div>
									{/if}
								</div>
								<div class="flex shrink-0 items-center gap-3 font-mono text-[11px]">
									{#if a.rank}
										<Badge
											variant="outline"
											class="text-kairos-magenta border-kairos-magenta/40 font-mono uppercase"
										>
											{a.rank}
										</Badge>
									{/if}
									<span class="text-muted-foreground">{year(a.date)}</span>
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</section>
