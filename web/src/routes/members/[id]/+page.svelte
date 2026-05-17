<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import MarkdownView from '$lib/components/MarkdownView.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const m = $derived(data.member);
	const displayName = $derived(m.displayName ?? m.expand?.user?.nickname ?? '—');

	const socials = $derived(
		[
			{ label: 'github', url: m.githubUrl },
			{ label: 'blog', url: m.blogUrl },
			{ label: 'linkedin', url: m.linkedinUrl },
			{ label: 'twitter', url: m.twitterUrl },
			{ label: 'site', url: m.personalUrl }
		].filter((s) => !!s.url)
	);
</script>

<svelte:head><title>{displayName} · KAIROS</title></svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/members" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back
	</Button>

	<Card.Root>
		<Card.Content class="space-y-6 py-8">
			<div class="flex items-center gap-5">
				<Avatar.Root class="size-20">
					{#if data.avatarUrl}
						<Avatar.Image src={data.avatarUrl} alt={displayName} />
					{/if}
					<Avatar.Fallback class="bg-kairos-cyan/20 font-mono text-2xl text-kairos-cyan">
						{displayName.charAt(0).toUpperCase()}
					</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<h1 class="!text-3xl">{displayName}</h1>
					<div
						class="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground"
					>
						<span>{m.position}</span>
						{#if m.year}<span>· {m.year}</span>{/if}
					</div>
				</div>
			</div>

			{#if m.tracks && m.tracks.length > 0}
				<div class="flex flex-wrap gap-1.5">
					{#each m.tracks as t (t)}
						<Badge variant="outline" class="font-mono">{t}</Badge>
					{/each}
				</div>
			{/if}

			{#if data.renderedBio}
				<MarkdownView html={data.renderedBio} />
			{/if}

			{#if socials.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each socials as s (s.label)}
						<!-- 외부 소셜 링크(github/blog 등) -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={s.url}
							target="_blank"
							rel="noopener noreferrer"
							class="font-mono text-xs text-kairos-cyan hover:underline"
						>
							{s.label} ↗
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if data.canEdit}
		<Separator class="my-10" />
		<div class="flex items-center justify-end gap-2">
			<Button href="/members/me" variant="outline" size="sm" class="font-mono">
				<PencilSimple /> edit my profile
			</Button>
		</div>
	{/if}
</main>

<SiteFooter settings={null} />
