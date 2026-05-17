<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import MarkdownView from '$lib/components/MarkdownView.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Eye from 'phosphor-svelte/lib/Eye';
	import PushPin from 'phosphor-svelte/lib/PushPin';
	import Trash from 'phosphor-svelte/lib/Trash';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';
	import { fmtLongDateTime } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.post);
</script>

<svelte:head>
	<title>{p.title} · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-4xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/posts" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to posts
	</Button>

	<article>
		<header class="mb-10">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#if p.isPinned}
					<Badge variant="outline" class="border-kairos-cyan/40 font-mono text-kairos-cyan">
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

			<div
				class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground"
			>
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
			<Card.Content class="py-8 text-base leading-relaxed">
				<MarkdownView html={data.renderedContent} />
			</Card.Content>
		</Card.Root>

		{#if data.attachments.length > 0}
			<section class="mt-8">
				<h2 class="mb-3 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
					// attachments ({data.attachments.length})
				</h2>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{#each data.attachments as att (att.name)}
						<!-- PocketBase 첨부 URL (외부 origin) -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={att.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative block aspect-square overflow-hidden rounded-md border border-border/60 bg-black/20 hover:border-kairos-cyan/60"
						>
							<img
								src={att.url}
								alt={att.name}
								loading="lazy"
								class="h-full w-full object-cover transition-transform group-hover:scale-105"
								onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
							/>
							<span
								class="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80"
							>
								{att.name}
							</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				</div>
			</section>
		{/if}

		<Separator class="my-10" />

		<div class="flex items-center justify-between gap-4">
			<div class="font-mono text-[11px] text-muted-foreground">
				{p.id}
			</div>
			<div class="flex items-center gap-2">
				{#if data.canEdit}
					<Button href={`/posts/${p.id}/edit`} variant="outline" size="sm" class="font-mono">
						<PencilSimple /> edit
					</Button>
				{/if}
				{#if data.canDelete}
					<form
						method="POST"
						action={`/posts/${p.id}/edit?/delete`}
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'redirect') {
									await update();
								}
							};
						}}
					>
						<Button
							type="submit"
							variant="ghost"
							size="sm"
							class="font-mono text-destructive hover:text-destructive"
							onclick={(e) => {
								if (!confirm('정말 삭제하시겠습니까?')) e.preventDefault();
							}}
						>
							<Trash /> delete
						</Button>
					</form>
				{/if}
			</div>
		</div>
	</article>
</main>

<SiteFooter settings={null} />
