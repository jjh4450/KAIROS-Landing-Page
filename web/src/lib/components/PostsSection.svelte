<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import { excerpt, fmtRelative } from '$lib/format';
	import type { Post } from '$lib/types';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	import Eye from 'phosphor-svelte/lib/Eye';
	import PushPin from 'phosphor-svelte/lib/PushPin';

	type Props = { posts: Post[] };
	let { posts }: Props = $props();

	// 최신 3개만 하이라이트
	const highlights = $derived(posts.slice(0, 3));

	let sectionEl: HTMLElement | undefined = $state();

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !sectionEl) return;

		let ctx: { revert: () => void } | undefined;
		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				gsap.registerPlugin(ScrollTrigger);
				ctx = gsap.context(() => {
					// Apple 풍 카드 시퀀스 reveal:
					//   y, scale, opacity, blur 4축으로 부드럽게 등장
					//   각 카드마다 자체 ScrollTrigger (시차 효과)
					gsap.utils.toArray<HTMLElement>('[data-highlight-card]').forEach((card, i) => {
						gsap.fromTo(
							card,
							{
								y: 80,
								scale: 0.94,
								opacity: 0,
								filter: 'blur(8px)'
							},
							{
								y: 0,
								scale: 1,
								opacity: 1,
								filter: 'blur(0px)',
								duration: 1.1,
								ease: 'power3.out',
								scrollTrigger: {
									trigger: card,
									start: 'top 88%',
									end: 'top 55%',
									scrub: 0.8
								}
							}
						);
					});

					// 헤더는 별도로 부드럽게
					gsap.from(sectionEl!.querySelector('header'), {
						y: 30,
						opacity: 0,
						duration: 0.8,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: sectionEl!,
							start: 'top 90%'
						}
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
	id="posts"
	class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32"
>
	<header class="mb-12 flex max-w-3xl flex-col gap-4 md:mb-16">
		<Eyebrow>// posts</Eyebrow>
		<h2>요즘 KAIROS는.</h2>
		<p class="text-muted-foreground text-base md:text-lg">
			공지·write-up·자료·뉴스 — 최근 동아리원이 직접 작성한 글 셋.
		</p>
	</header>

	{#if highlights.length === 0}
		<Card.Root>
			<Card.Content>
				<p class="text-muted-foreground font-mono text-sm">
					$ no public posts yet. <span class="text-kairos-cyan">(첫 글까지 진행 중)</span>
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each highlights as p, i (p.id)}
				<a
					href={`/posts/${p.id}`}
					data-highlight-card
					class="tilt-3d group block focus-visible:outline-none"
					style="opacity: 1"
				>
					<div use:cardTilt={{ max: 9, scale: 1.03 }} class="tilt-3d-card h-full">
					<Card.Root
						class="relative h-full overflow-hidden ease-[var(--ease-brand)] group-hover:border-white/20 group-focus-visible:ring-2 group-focus-visible:ring-kairos-cyan"
					>
						<!-- glow accent (z 깊이 뒤로) -->
						{#if i === 0}
							<div
								class="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
								style="background: radial-gradient(circle, var(--kairos-cyan), transparent 70%); transform: translateZ(-20px);"
								aria-hidden="true"
							></div>
						{:else if i === 1}
							<div
								class="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
								style="background: radial-gradient(circle, var(--kairos-violet), transparent 70%); transform: translateZ(-20px);"
								aria-hidden="true"
							></div>
						{:else}
							<div
								class="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
								style="background: radial-gradient(circle, var(--kairos-magenta), transparent 70%); transform: translateZ(-20px);"
								aria-hidden="true"
							></div>
						{/if}

						<!-- 마우스 추적 글로스 -->
						<div class="tilt-3d-glare"></div>

						<Card.Header class="tilt-3d-layer relative">
							<div class="mb-1 flex flex-wrap items-center gap-1.5">
								{#if p.isPinned}
									<Badge variant="outline" class="text-kairos-cyan border-kairos-cyan/40 font-mono">
										<PushPin weight="fill" /> pinned
									</Badge>
								{/if}
								{#if p.expand?.category}
									<Badge variant="outline" class="font-mono">
										{p.expand.category.name}
									</Badge>
								{/if}
							</div>
							<Card.Title
								class="tilt-3d-layer-deep line-clamp-2 text-balance text-base leading-snug md:text-lg"
							>
								{p.title}
							</Card.Title>
						</Card.Header>

						<Card.Content class="tilt-3d-layer relative">
							<p class="text-muted-foreground line-clamp-3 text-sm">{excerpt(p.content)}</p>
						</Card.Content>

						<Card.Footer
							class="tilt-3d-layer relative flex items-center justify-between"
						>
							<div class="text-muted-foreground flex items-center gap-3 font-mono text-[11px]">
								<span>{p.expand?.author?.nickname ?? 'anon'}</span>
								<span>·</span>
								<span>{fmtRelative(p.created)}</span>
							</div>
							{#if p.viewCount !== undefined && p.viewCount > 0}
								<span class="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
									<Eye class="size-3" /> {p.viewCount}
								</span>
							{/if}
						</Card.Footer>
					</Card.Root>
					</div>
				</a>
			{/each}
		</div>

		<div class="mt-10 flex justify-center">
			<Button href="/posts" variant="outline" size="lg" class="font-mono">
				view all posts <ArrowUpRight />
			</Button>
		</div>
	{/if}
</section>
