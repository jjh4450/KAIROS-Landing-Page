<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import ThreatDashboard from './ThreatDashboard.svelte';
	import type { SiteSettings } from '$lib/types';
	import { magnetic } from '$lib/motion/actions';
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';

	import type { ThreatFeed } from '$lib/types/threat';

	type Props = {
		settings?: SiteSettings | null;
		threatFeed: ThreatFeed;
	};
	let { settings, threatFeed }: Props = $props();

	const subtitle = $derived(
		settings?.heroSubtitle ?? '함께 배우고, 함께 공격하고, 함께 방어합니다.'
	);
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
		<Eyebrow class="mb-7">
			KAIROS
			<span class="text-muted-foreground">· est. 2025</span>
		</Eyebrow>

		<h1 class="mb-10 max-w-[14ch]">
			<span class="text-foreground inline-block" data-hero-word>we</span>
			<span class="text-foreground inline-block" data-hero-word>hack</span>
			<span class="text-foreground inline-block" data-hero-word>to</span>
			<br />
			<span class="text-gradient-aurora inline-block" data-hero-word>understand.</span>
		</h1>

		<p class="text-muted-foreground max-w-2xl text-base md:text-lg">{subtitle}</p>

		<div class="mt-10 flex flex-wrap items-center gap-3">
			<Button href="#about" variant="outline" size="lg" class="font-mono" onclick={scrollToAbout}>
				더 알아보기 <ArrowDown />
			</Button>
			{#if recruiting}
				<div use:magnetic={{ strength: 0.24 }}>
					<Button href={settings?.recruitmentFormUrl} variant="default" size="lg" class="font-mono">
						지원하기 <ArrowUpRight />
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
