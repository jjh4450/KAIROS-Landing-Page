<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteMeta from '$lib/components/SiteMeta.svelte';
	import EmptyStateCard from '$lib/components/EmptyStateCard.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import { fileUrl } from '$lib/pbHelpers';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Trophy from 'phosphor-svelte/lib/Trophy';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SiteMeta title="Achievements" description="KAIROS의 입상·수상 기록." />

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-16 lg:pt-40">
	<header class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
		<div class="max-w-2xl">
			<Eyebrow class="mb-4">// achievements</Eyebrow>
			<h1 class="!text-5xl md:!text-6xl">trophies.</h1>
			<p class="mt-3 text-base text-muted-foreground md:text-lg">
				CTF, 해킹 대회 등에서 받은 입상 기록입니다.
			</p>
		</div>
		{#if data.canCreate}
			<Button href="/achievements/new" variant="default" size="lg" class="font-mono">
				<Plus /> new
			</Button>
		{/if}
	</header>

	{#if data.achievements.length === 0}
		<EmptyStateCard message="$ no entries yet." hint="(아직 등록된 기록이 없습니다)" />
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each data.achievements as a (a.id)}
				<a
					href={resolve(`/achievements/${a.id}`)}
					class="group block tilt-3d focus-visible:outline-none"
				>
					<div use:cardTilt={{ max: 5, scale: 1.015 }} class="h-full tilt-3d-card">
						<Card.Root class="relative h-full overflow-hidden">
							<div class="tilt-3d-glare"></div>
							{#if a.coverImage}
								<div class="aspect-video w-full overflow-hidden bg-black/30">
									<img
										src={fileUrl({ id: a.id, collectionId: a.collectionId }, a.coverImage)}
										alt={a.title}
										loading="lazy"
										class="h-full w-full object-cover"
									/>
								</div>
							{/if}
							<Card.Header class="relative tilt-3d-layer">
								<div class="mb-1 flex flex-wrap items-center gap-1.5">
									{#if a.rank}
										<Badge
											variant="outline"
											class="border-kairos-cyan/40 font-mono text-kairos-cyan"
										>
											<Trophy weight="fill" />
											{a.rank}
										</Badge>
									{/if}
									{#if a.competition}
										<Badge variant="outline" class="font-mono">{a.competition}</Badge>
									{/if}
								</div>
								<Card.Title class="line-clamp-2 leading-snug">{a.title}</Card.Title>
							</Card.Header>
							<Card.Footer class="relative tilt-3d-layer">
								<span class="font-mono text-[11px] text-muted-foreground">
									{a.date ?? ''}
								</span>
							</Card.Footer>
						</Card.Root>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</main>

<SiteFooter settings={null} />
