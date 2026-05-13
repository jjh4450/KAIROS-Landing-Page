<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import EmptyStateCard from './EmptyStateCard.svelte';
	import type { Member } from '$lib/types';
	import { PUBLIC_PB_URL } from '$env/static/public';

	type Props = { members: Member[] };
	let { members }: Props = $props();

	const positionOrder: Record<Member['position'], number> = {
		president: 0,
		'vice-president': 1,
		advisor: 2,
		officer: 3,
		member: 4,
		alumni: 5
	};

	const sorted = $derived(
		[...members].sort(
			(a, b) =>
				positionOrder[a.position] - positionOrder[b.position] ||
				(a.sortOrder ?? 999) - (b.sortOrder ?? 999)
		)
	);

	function avatarUrl(m: Member): string | undefined {
		if (!m.avatar) return undefined;
		return `${PUBLIC_PB_URL}/api/files/members/${m.id}/${m.avatar}?thumb=200x200`;
	}

	function displayName(m: Member): string {
		return m.displayName || m.expand?.user?.nickname || 'Anonymous';
	}

	function initials(name: string): string {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? '')
			.join('');
	}
</script>

<section id="members" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-12 flex max-w-3xl flex-col gap-4 md:mb-16">
		<Eyebrow>// roster</Eyebrow>
		<h2>옵트인 명단.</h2>
		<p class="text-base text-muted-foreground md:text-lg">
			공개를 선택한 운영진과 멤버. 모든 부원이 여기 등장하지는 않습니다.
		</p>
	</header>

	{#if sorted.length === 0}
		<EmptyStateCard message="$ no public profiles yet." hint="(첫 멤버 등록 대기)" />
	{:else}
		<div class="reveal-children grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each sorted as m (m.id)}
				{@const name = displayName(m)}
				<div class="tilt-3d">
					<div use:cardTilt={{ max: 8, scale: 1.03 }} class="h-full tilt-3d-card">
						<Card.Root size="sm" class="relative h-full overflow-hidden">
							<div class="tilt-3d-glare"></div>
							<Card.Header class="relative tilt-3d-layer-deep">
								<Avatar.Root size="lg">
									<Avatar.Image src={avatarUrl(m)} alt={name} />
									<Avatar.Fallback class="font-mono text-xs">{initials(name)}</Avatar.Fallback>
								</Avatar.Root>
								<Card.Title class="mt-2 truncate text-sm">{name}</Card.Title>
								<Card.Description
									class="font-mono text-[10px] tracking-[0.18em] text-kairos-cyan uppercase"
								>
									{m.position}{m.year ? ` · ${m.year}` : ''}
								</Card.Description>
							</Card.Header>
							{#if m.tracks && m.tracks.length}
								<Card.Content class="relative flex tilt-3d-layer flex-wrap gap-1">
									{#each m.tracks.slice(0, 3) as t (t)}
										<Badge variant="outline" class="font-mono text-[10px]">{t}</Badge>
									{/each}
								</Card.Content>
							{/if}
						</Card.Root>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
