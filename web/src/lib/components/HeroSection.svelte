<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import ThreatDashboard from './ThreatDashboard.svelte';
	import type { HeroSettings, SiteSettings } from '$lib/types';
	import { magnetic } from '$lib/motion/actions';
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';

	import type { ThreatFeed } from '$lib/types/threat';

	type Props = {
		hero?: HeroSettings | null;
		settings?: SiteSettings | null;
		threatFeed: ThreatFeed;
	};
	let { hero, settings, threatFeed }: Props = $props();

	const eyebrow = $derived(hero?.eyebrow ?? '// est. 2026');
	const title = $derived(hero?.title ?? 'KAIROS');
	const tagline = $derived(
		hero?.tagline ?? 'Kangwon Academic Initiative for Research On Security'
	);
	const subtitle = $derived(
		hero?.subtitle ?? '강원권 학생들이 모여 만들어 나가는 보안 커뮤니티입니다.'
	);
	const primaryCtaLabel = $derived(hero?.primaryCtaLabel ?? '더 알아보기');
	const secondaryCtaLabel = $derived(hero?.secondaryCtaLabel ?? '지원하기');
	const recruiting = $derived(!!settings?.recruitmentOpen && !!settings?.recruitmentFormUrl);

	let sectionEl: HTMLElement | undefined = $state();
	let copyEl: HTMLDivElement | undefined = $state();
	let sceneEl: HTMLDivElement | undefined = $state();

	function scrollToAbout(e: Event) {
		e.preventDefault();
		const target = document.getElementById('about');
		if (!target) return;
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		// URL 해시는 변경하지 않음 — 뒤로가기 시 의도치 않은 history 점프 방지.
		// 사용자가 URL 공유로 #about 진입은 여전히 정상 동작 (브라우저 기본 anchor).
	}

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !sectionEl || !copyEl || !sceneEl) return;

		let ctx: { revert: () => void } | undefined;
		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				gsap.registerPlugin(ScrollTrigger);
				ctx = gsap.context(() => {
					// 헤드라인 단어 stagger drop
					gsap.utils.toArray<HTMLElement>('[data-hero-word]').forEach((word, i) => {
						gsap.from(word, {
							y: 60,
							opacity: 0,
							rotateX: -40,
							duration: 0.8,
							ease: 'power3.out',
							delay: 0.15 + i * 0.08
						});
					});

					// 스크롤 시 카피 위로 사라짐
					gsap.to(copyEl!, {
						y: -100,
						opacity: 0,
						ease: 'power1.in',
						scrollTrigger: {
							trigger: sectionEl!,
							start: 'top top',
							end: 'bottom top',
							scrub: 0.8
						}
					});

					// 대시보드 패럴랙스 (살짝 위로 + 약간 축소)
					gsap.fromTo(
						sceneEl!,
						{ y: 0, scale: 1 },
						{
							y: 30,
							scale: 0.98,
							ease: 'none',
							scrollTrigger: {
								trigger: sectionEl!,
								start: 'top top',
								end: 'bottom top',
								scrub: 0.8
							}
						}
					);
				}, sectionEl!);
			}
		);

		return () => ctx?.revert();
	});
</script>

<section
	bind:this={sectionEl}
	id="top"
	class="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 pt-40 pb-24 lg:grid-cols-12 lg:gap-10 lg:pb-32"
>
	<div bind:this={copyEl} class="reveal relative z-10 lg:col-span-7">
		<Eyebrow class="mb-7">{eyebrow}</Eyebrow>

		<h1 class="mb-6">
			<span class="inline-block text-gradient-aurora" data-hero-word>{title}</span>
		</h1>

		<p
			class="mb-8 max-w-2xl font-mono text-sm tracking-[0.18em] text-muted-foreground uppercase md:text-base"
			data-hero-word
		>
			{tagline}
		</p>

		<p class="max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>

		<div class="mt-10 flex flex-wrap items-center gap-3">
			<Button href="#about" variant="outline" size="lg" class="font-mono" onclick={scrollToAbout}>
				{primaryCtaLabel} <ArrowDown />
			</Button>
			{#if recruiting}
				<div use:magnetic={{ strength: 0.24 }}>
					<Button href={settings?.recruitmentFormUrl} variant="default" size="lg" class="font-mono">
						{secondaryCtaLabel} <ArrowUpRight />
					</Button>
				</div>
			{/if}
		</div>
	</div>

	<div
		bind:this={sceneEl}
		class="reveal @container relative z-10 h-[420px] w-full lg:col-span-5 lg:h-[560px]"
	>
		<ThreatDashboard feed={threatFeed} />
	</div>
</section>
