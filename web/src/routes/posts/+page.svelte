<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import { excerpt, fmtRelative } from '$lib/format';
	import EmptyStateCard from '$lib/components/EmptyStateCard.svelte';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import Plus from 'phosphor-svelte/lib/Plus';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';
	import PushPin from 'phosphor-svelte/lib/PushPin';
	import Eye from 'phosphor-svelte/lib/Eye';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// 입력값 — 네비게이션 시 URL 쿼리(data.q)와 동기화
	let queryInput = $state('');
	$effect(() => {
		queryInput = data.q;
	});

	function updateQuery(params: Record<string, string | null>) {
		const url = new URL(page.url);
		for (const [k, v] of Object.entries(params)) {
			if (v === null || v === '') url.searchParams.delete(k);
			else url.searchParams.set(k, v);
		}
		// 페이지 변경이 아니면 page=1 리셋
		if (!('page' in params)) url.searchParams.delete('page');
		goto(url.pathname + url.search, { noScroll: false, keepFocus: true });
	}

	function onSearchSubmit(e: SubmitEvent) {
		e.preventDefault();
		updateQuery({ q: queryInput || null });
	}

	function setCategory(slug: string | null) {
		updateQuery({ category: slug });
	}

	function setPage(p: number) {
		updateQuery({ page: String(p) });
	}
</script>

<svelte:head>
	<title>Posts · KAIROS</title>
	<meta name="description" content="KAIROS 게시물 모음 — 공지, write-up, 자료, 뉴스." />
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-16 lg:pt-40">
	<header class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
		<div class="max-w-2xl">
			<Eyebrow class="mb-4">// posts</Eyebrow>
			<h1 class="!text-5xl md:!text-6xl">archive.</h1>
			<p class="mt-3 text-base text-muted-foreground md:text-lg">
				공지, 풀이(write-up), 자료, 뉴스가 올라옵니다. 카테고리나 검색어로 좁혀 볼 수 있습니다.
			</p>
		</div>
		<Button href="/posts/new" variant="default" size="lg" class="font-mono">
			<Plus /> new post
		</Button>
	</header>

	<!-- Filter bar -->
	<div class="mb-8 flex flex-col gap-4">
		<form onsubmit={onSearchSubmit} class="relative">
			<MagnifyingGlass
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={queryInput}
				name="q"
				type="search"
				placeholder="검색 — 제목·본문 (e.g. SQLi, CVE, write-up)"
				class="h-11 bg-card/50 pl-10 font-mono backdrop-blur-md"
			/>
		</form>

		<div class="flex flex-wrap items-center gap-1.5">
			<button
				type="button"
				onclick={() => setCategory(null)}
				class="cursor-pointer"
				aria-pressed={!data.categorySlug}
			>
				<Badge
					variant={!data.categorySlug ? 'default' : 'outline'}
					class="font-mono tracking-wider uppercase"
				>
					all
				</Badge>
			</button>
			{#each data.categories as c (c.id)}
				<button
					type="button"
					onclick={() => setCategory(c.slug)}
					class="cursor-pointer"
					aria-pressed={data.categorySlug === c.slug}
				>
					<Badge variant={data.categorySlug === c.slug ? 'default' : 'outline'} class="font-mono">
						{c.name}
					</Badge>
				</button>
			{/each}
		</div>
	</div>

	<Separator class="mb-8" />

	<!-- Results -->
	{#if data.posts.length === 0}
		<EmptyStateCard
			message="$ no matches."
			hint={data.q ? `("${data.q}" 검색 결과 없음)` : '(아직 게시물이 없습니다)'}
		/>
	{:else}
		<div class="mb-4 font-mono text-xs text-muted-foreground">
			$ found <span class="text-foreground">{data.totalItems}</span> entries
			{#if data.q}
				· q: <span class="text-kairos-cyan">{data.q}</span>
			{/if}
			{#if data.categorySlug}
				· category: <span class="text-kairos-cyan">{data.categorySlug}</span>
			{/if}
		</div>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each data.posts as p (p.id)}
				<a href={`/posts/${p.id}`} class="group block tilt-3d focus-visible:outline-none">
					<div use:cardTilt={{ max: 5, scale: 1.015 }} class="h-full tilt-3d-card">
						<Card.Root
							class="relative h-full overflow-hidden ease-[var(--ease-brand)] group-hover:border-white/20 group-focus-visible:ring-2 group-focus-visible:ring-kairos-cyan"
						>
							<div class="tilt-3d-glare"></div>
							<Card.Header class="relative tilt-3d-layer">
								<div class="mb-1 flex flex-wrap items-center gap-1.5">
									{#if p.isPinned}
										<Badge
											variant="outline"
											class="border-kairos-cyan/40 font-mono text-kairos-cyan"
										>
											<PushPin weight="fill" /> pinned
										</Badge>
									{/if}
									{#if p.expand?.category}
										<Badge variant="outline" class="font-mono">{p.expand.category.name}</Badge>
									{/if}
								</div>
								<Card.Title class="line-clamp-2 leading-snug text-balance">
									{p.title}
								</Card.Title>
							</Card.Header>
							<Card.Content class="relative tilt-3d-layer">
								<p class="line-clamp-3 text-sm text-muted-foreground">{excerpt(p.content)}</p>
							</Card.Content>
							<Card.Footer class="relative flex tilt-3d-layer items-center justify-between">
								<span class="font-mono text-[11px] text-muted-foreground">
									{p.expand?.author?.nickname ?? 'anon'} · {fmtRelative(p.created)}
								</span>
								{#if p.viewCount !== undefined && p.viewCount > 0}
									<span class="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
										<Eye class="size-3" />
										{p.viewCount}
									</span>
								{/if}
							</Card.Footer>
						</Card.Root>
					</div>
				</a>
			{/each}
		</div>

		{#if data.totalPages > 1}
			<nav class="mt-10 flex items-center justify-center gap-2" aria-label="페이지네이션">
				<Button
					variant="outline"
					size="sm"
					disabled={data.page <= 1}
					onclick={() => setPage(data.page - 1)}
					class="font-mono"
				>
					<ArrowLeft /> prev
				</Button>
				<span class="px-3 font-mono text-xs text-muted-foreground">
					{data.page} / {data.totalPages}
				</span>
				<Button
					variant="outline"
					size="sm"
					disabled={data.page >= data.totalPages}
					onclick={() => setPage(data.page + 1)}
					class="font-mono"
				>
					next <ArrowRight />
				</Button>
			</nav>
		{/if}
	{/if}
</main>

<SiteFooter settings={null} />
