<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Eye from 'phosphor-svelte/lib/Eye';
	import PushPin from 'phosphor-svelte/lib/PushPin';
	import Trash from 'phosphor-svelte/lib/Trash';
	import { fmtLongDateTime } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.post);
</script>

<svelte:head>
	<title>{p.title} · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} />

<main class="relative mx-auto w-full max-w-4xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/posts" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to posts
	</Button>

	<article>
		<header class="mb-10">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#if p.isPinned}
					<Badge variant="outline" class="text-kairos-cyan border-kairos-cyan/40 font-mono">
						<PushPin weight="fill" /> pinned
					</Badge>
				{/if}
				{#if p.expand?.category}
					<Badge variant="outline" class="font-mono">{p.expand.category.name}</Badge>
				{/if}
				{#each p.expand?.tags ?? [] as tag (tag.id)}
					<Badge variant="ghost" class="font-mono">#{tag.name}</Badge>
				{/each}
			</div>

			<h1 class="!text-4xl text-balance md:!text-5xl">{p.title}</h1>

			<div class="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs">
				<span>by <span class="text-foreground">{p.expand?.author?.nickname ?? 'anon'}</span></span>
				<span>·</span>
				<span>{fmtLongDateTime(p.created)}</span>
				{#if p.updated !== p.created}
					<span>·</span>
					<span>(updated {fmtLongDateTime(p.updated)})</span>
				{/if}
				{#if p.viewCount !== undefined}
					<span>·</span>
					<span class="flex items-center gap-1"><Eye class="size-3" /> {p.viewCount}</span>
				{/if}
			</div>
		</header>

		<Card.Root>
			<Card.Content
				class="prose prose-invert prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-kairos-cyan prose-strong:text-foreground prose-code:text-kairos-cyan max-w-none py-8 text-base leading-relaxed"
			>
				{@html p.content}
			</Card.Content>
		</Card.Root>

		<Separator class="my-10" />

		<!-- Author actions (login-gated TBD) -->
		<div class="flex items-center justify-between gap-4">
			<div class="text-muted-foreground font-mono text-[11px]">
				{p.id}
			</div>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" disabled class="font-mono" title="로그인 시스템 도입 후 활성화">
					<Trash /> delete
				</Button>
			</div>
		</div>
	</article>
</main>

<SiteFooter settings={null} />
