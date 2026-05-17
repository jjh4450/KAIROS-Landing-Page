<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteMeta from '$lib/components/SiteMeta.svelte';
	import EmptyStateCard from '$lib/components/EmptyStateCard.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import { fileUrl } from '$lib/pbHelpers';
	import UserCircle from 'phosphor-svelte/lib/UserCircle';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function initial(m: { displayName?: string; expand?: { user?: { nickname?: string } } }) {
		const n = m.displayName ?? m.expand?.user?.nickname ?? '?';
		return n.charAt(0).toUpperCase();
	}
</script>

<SiteMeta title="Members" description="KAIROS 멤버 명단. 공개에 동의한 사람만 표시됩니다." />

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-16 lg:pt-40">
	<header class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
		<div class="max-w-2xl">
			<Eyebrow class="mb-4">// members</Eyebrow>
			<h1 class="!text-5xl md:!text-6xl">roster.</h1>
			<p class="mt-3 text-base text-muted-foreground md:text-lg">
				공개에 동의한 멤버만 표시됩니다. 본인 프로필은 my profile 메뉴에서 편집할 수 있습니다.
			</p>
		</div>
		{#if data.user}
			<Button href="/members/me" variant="default" size="lg" class="font-mono">
				<UserCircle /> my profile
			</Button>
		{/if}
	</header>

	{#if data.members.length === 0}
		<EmptyStateCard message="$ no public profiles." hint="(공개 옵션을 켠 멤버가 없습니다)" />
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each data.members as m (m.id)}
				<a href={resolve(`/members/${m.id}`)} class="group block focus-visible:outline-none">
					<Card.Root class="h-full transition-colors group-hover:border-white/20">
						<Card.Content class="flex flex-col items-center gap-3 py-6 text-center">
							<Avatar.Root class="size-16">
								{#if m.avatar}
									<Avatar.Image
										src={fileUrl({ id: m.id, collectionId: m.collectionId }, m.avatar)}
										alt={m.displayName ?? ''}
									/>
								{/if}
								<Avatar.Fallback class="bg-kairos-cyan/20 font-mono text-kairos-cyan">
									{initial(m)}
								</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<div class="font-mono font-semibold">
									{m.displayName ?? m.expand?.user?.nickname ?? '—'}
								</div>
								<div class="font-mono text-[11px] text-muted-foreground">{m.position}</div>
							</div>
							{#if m.tracks && m.tracks.length > 0}
								<div class="flex flex-wrap justify-center gap-1">
									{#each m.tracks as t (t)}
										<Badge variant="outline" class="font-mono text-[10px]">{t}</Badge>
									{/each}
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</main>

<SiteFooter settings={null} />
