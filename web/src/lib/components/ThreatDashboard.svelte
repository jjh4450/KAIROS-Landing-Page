<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fmtRelative } from '$lib/format';
	import ThreatGlobe from './ThreatGlobe.svelte';
	import X from 'phosphor-svelte/lib/X';
	import ArrowSquareOut from 'phosphor-svelte/lib/ArrowSquareOut';
	import type { IocSample, ThreatDot, ThreatFeed } from '$lib/types/threat';

	type Props = { feed: ThreatFeed };
	let { feed: initial }: Props = $props();

	let feed = $state<ThreatFeed>(initial);
	let selected = $state<ThreatDot | null>(null);

	function iocLink(s: IocSample): string {
		if (s.iocId) return `https://threatfox.abuse.ch/ioc/${s.iocId}/`;
		const ip = s.ioc.split(':')[0];
		return `https://feodotracker.abuse.ch/browse/${ip}/`;
	}

	// 표시용 defang — 실제 IOC에 의도치 않은 접속/auto-link 방지 (업계 표준)
	function defang(ioc: string): string {
		return ioc
			.replace(/\./g, '[.]')
			.replace(/^http:\/\//i, 'hxxp://')
			.replace(/^https:\/\//i, 'hxxps://');
	}

	let refreshTimer: ReturnType<typeof setInterval> | undefined;
	async function refresh() {
		try {
			const res = await fetch('/api/threat-feed');
			if (res.ok) feed = (await res.json()) as ThreatFeed;
		} catch {
			// silent
		}
	}
	onMount(() => {
		refreshTimer = setInterval(refresh, 5 * 60 * 1000);
	});
	onDestroy(() => {
		if (refreshTimer) clearInterval(refreshTimer);
	});
</script>

<div class="relative h-full w-full">
	<!-- 회전 지구본 -->
	<ThreatGlobe
		dots={feed.dots}
		selectedCountry={selected?.country ?? null}
		onSelect={(d) => (selected = d)}
		class="absolute inset-0"
	/>

	<!-- 상단 상태 라인 -->
	<div
		class="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between gap-3 font-mono text-[10px] tracking-widest uppercase"
	>
		<div class="flex items-center gap-2">
			<span
				class="inline-block size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
			></span>
			<span class="text-foreground/85">
				// threat · {feed.totalIocs} ioc · {feed.dots.length} cc{#if feed.unmappedIocs > 0}
					<span class="text-muted-foreground/60" title="좌표 매핑이 없는 군소 지역">
						(+{feed.unmappedIocs} unmapped)</span
					>
				{/if}
			</span>
		</div>
		<span class="text-muted-foreground">{fmtRelative(feed.updatedAt)}</span>
	</div>

	<!-- 하단 attribution -->
	<div
		class="pointer-events-none absolute right-3 bottom-2 left-3 font-mono text-[9px] tracking-widest text-muted-foreground/60 uppercase"
	>
		// abuse.ch · nvd · cisa
	</div>

	<!-- 선택된 국가 상세 (overlay, 필요할 때만) -->
	{#if selected}
		<div
			class="absolute right-3 bottom-6 left-3 z-20 max-h-[60%] overflow-hidden rounded-md border border-kairos-cyan/40 bg-background/90 p-3 shadow-2xl backdrop-blur-lg @[640px]:right-3 @[640px]:bottom-3 @[640px]:left-auto @[640px]:w-[280px]"
		>
			<div
				class="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] tracking-widest uppercase"
			>
				<span class="text-kairos-cyan">// {selected.country} · {selected.count} ioc</span>
				<button
					type="button"
					onclick={() => (selected = null)}
					class="text-muted-foreground hover:text-foreground"
					aria-label="close"
				>
					<X class="size-3" />
				</button>
			</div>

			<!-- malware tally -->
			<div class="mb-2 flex flex-wrap gap-x-2 font-mono text-[10px] text-muted-foreground">
				{#each selected.malwareTally as m (m.name)}
					<span>
						<span class="text-foreground">{m.name}</span><span class="text-muted-foreground/60"
							>·{m.count}</span
						>
					</span>
				{/each}
			</div>

			<!-- 경고 — 실제 활성 IOC -->
			<div
				class="mb-1.5 rounded border border-rose-400/30 bg-rose-400/5 px-1.5 py-1 font-mono text-[9px] tracking-widest text-rose-300/90 uppercase"
			>
				⚠ live ioc · defanged · do not connect
			</div>

			<!-- sample IOC -->
			<div class="max-h-[200px] space-y-0.5 overflow-y-auto font-mono text-[10px]">
				{#each selected.samples as s (s.ioc)}
					<a
						href={iocLink(s)}
						target="_blank"
						rel="external noopener noreferrer"
						class="flex items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-kairos-cyan/10"
						title="abuse.ch 상세로 이동 (IOC 자체로는 접속하지 마세요)"
					>
						<span class="truncate text-foreground">{defang(s.ioc)}</span>
						<span class="shrink-0 text-muted-foreground">{s.malware}</span>
						<ArrowSquareOut class="size-3 shrink-0 text-muted-foreground" />
					</a>
				{:else}
					<div class="text-muted-foreground">no samples</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
