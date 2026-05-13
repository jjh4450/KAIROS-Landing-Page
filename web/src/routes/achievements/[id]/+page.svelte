<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import MarkdownView from '$lib/components/MarkdownView.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Trophy from 'phosphor-svelte/lib/Trophy';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const a = $derived(data.item);
</script>

<svelte:head>
	<title>{a.title} · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-4xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/achievements" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back
	</Button>

	<article>
		{#if data.coverUrl}
			<div class="border-border/60 mb-8 aspect-video w-full overflow-hidden rounded-md border bg-black/30">
				<img src={data.coverUrl} alt={a.title} class="h-full w-full object-cover" />
			</div>
		{/if}

		<header class="mb-8">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#if a.rank}
					<Badge variant="outline" class="text-kairos-cyan border-kairos-cyan/40 font-mono">
						<Trophy weight="fill" /> {a.rank}
					</Badge>
				{/if}
				{#if a.competition}
					<Badge variant="outline" class="font-mono">{a.competition}</Badge>
				{/if}
				{#if a.date}
					<span class="text-muted-foreground font-mono text-xs">· {a.date}</span>
				{/if}
			</div>
			<h1 class="!text-4xl text-balance md:!text-5xl">{a.title}</h1>
			{#if a.link}
				<a href={a.link} target="_blank" rel="noopener noreferrer" class="text-kairos-cyan mt-3 inline-block font-mono text-sm hover:underline">
					{a.link} ↗
				</a>
			{/if}
		</header>

		{#if data.renderedDescription}
			<Card.Root>
				<Card.Content class="py-8 text-base leading-relaxed">
					<MarkdownView html={data.renderedDescription} />
				</Card.Content>
			</Card.Root>
		{/if}

		{#if a.expand?.members && a.expand.members.length > 0}
			<section class="mt-8">
				<h2 class="text-muted-foreground mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
					// members
				</h2>
				<div class="flex flex-wrap gap-2">
					{#each a.expand.members as m (m.id)}
						<Badge variant="outline" class="font-mono">{m.nickname ?? m.id}</Badge>
					{/each}
				</div>
			</section>
		{/if}

		{#if data.canEdit}
			<Separator class="my-10" />
			<div class="flex items-center justify-end gap-2">
				<Button href={`/achievements/${a.id}/edit`} variant="outline" size="sm" class="font-mono">
					<PencilSimple /> edit
				</Button>
			</div>
		{/if}
	</article>
</main>

<SiteFooter settings={null} />
