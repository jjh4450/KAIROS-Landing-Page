<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';
	import type { EventRecord } from '$lib/types';

	type Props = { events: EventRecord[] };
	let { events }: Props = $props();

	const typeLabel: Record<EventRecord['type'], string> = {
		seminar: 'seminar',
		study: 'study',
		ctf: 'ctf',
		conference: 'conference',
		social: 'social',
		other: 'other'
	};

	const typeColor: Record<EventRecord['type'], string> = {
		seminar: 'var(--kairos-cyan)',
		study: 'var(--kairos-violet)',
		ctf: 'var(--kairos-magenta)',
		conference: 'var(--kairos-lime)',
		social: 'var(--muted-foreground)',
		other: 'var(--muted-foreground)'
	};

	function fmtDate(d?: string): string {
		if (!d) return '—';
		const dt = new Date(d);
		return dt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
	}
</script>

<section id="activities" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-12 flex max-w-3xl flex-col gap-4 md:mb-16">
		<Eyebrow>// activities</Eyebrow>
		<h2>이번 학기에 무엇을 하고 있나요.</h2>
		<p class="text-muted-foreground text-base md:text-lg">
			정기 스터디, CTF, 세미나, 외부 행사 — 한 곳에서 모든 일정을 봅니다.
		</p>
	</header>

	{#if events.length === 0}
		<div class="tilt-3d">
			<div use:cardTilt={{ max: 4, scale: 1.01 }} class="tilt-3d-card">
				<Card.Root class="relative overflow-hidden">
					<div class="tilt-3d-glare"></div>
					<Card.Content class="tilt-3d-layer relative">
						<p class="text-muted-foreground font-mono text-sm">
							$ no events scheduled.
							<span class="text-kairos-cyan">(coming soon)</span>
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<div class="reveal-children grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each events as ev (ev.id)}
				<div class="tilt-3d">
					<div use:cardTilt={{ max: 6, scale: 1.02 }} class="tilt-3d-card h-full">
						<Card.Root class="relative h-full overflow-hidden">
							<div class="tilt-3d-glare"></div>
							<Card.Header class="tilt-3d-layer relative">
								<div class="flex items-center justify-between">
									<Badge
										variant="outline"
										class="font-mono"
										style="color: {typeColor[ev.type]}; border-color: color-mix(in oklch, {typeColor[
											ev.type
										]} 35%, transparent);"
									>
										{typeLabel[ev.type]}
									</Badge>
									<span class="text-muted-foreground font-mono text-[11px]">
										{fmtDate(ev.startsAt)}
									</span>
								</div>
								<Card.Title class="tilt-3d-layer-deep font-mono text-base">{ev.title}</Card.Title>
								{#if ev.location}
									<Card.Description class="font-mono">@ {ev.location}</Card.Description>
								{/if}
							</Card.Header>
						</Card.Root>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
