<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fmtRelative } from '$lib/format';
	import ThreatGlobe from './ThreatGlobe.svelte';
	import X from 'phosphor-svelte/lib/X';
	import ArrowSquareOut from 'phosphor-svelte/lib/ArrowSquareOut';

	type Sample = {
		ioc: string;
		iocType: string;
		malware: string;
		firstSeen: string;
		iocId: string | null;
	};
	type Dot = {
		country: string;
		count: number;
		lat: number;
		lon: number;
		topMalware: string;
		malwareTally: { name: string; count: number }[];
		samples: Sample[];
	};
	type Cve = {
		id: string;
		score: number | null;
		severity: string | null;
		description: string;
		published: string;
		exploited: boolean;
	};
	type Feed = { dots: Dot[]; cves: Cve[]; updatedAt: string; totalIocs: number };

	type Props = { feed: Feed };
	let { feed: initial }: Props = $props();

	let feed = $state<Feed>(initial);
	let selected = $state<Dot | null>(null);

	function severityClass(s: string | null): string {
		switch (s) {
			case 'CRITICAL':
				return 'text-rose-300';
			case 'HIGH':
				return 'text-amber-300';
			case 'MEDIUM':
				return 'text-kairos-cyan';
			default:
				return 'text-muted-foreground';
		}
	}

	function iocLink(s: Sample): string | null {
		if (s.iocId) return `https://threatfox.abuse.ch/ioc/${s.iocId}/`;
		// Feodo Tracker: IP만 추출 후 트래커 검색
		const ip = s.ioc.split(':')[0];
		return `https://feodotracker.abuse.ch/browse/${ip}/`;
	}
	function cveLink(id: string): string {
		return `https://nvd.nist.gov/vuln/detail/${id}`;
	}

	let refreshTimer: ReturnType<typeof setInterval> | undefined;
	async function refresh() {
		try {
			const res = await fetch('/api/threat-feed');
			if (res.ok) feed = (await res.json()) as Feed;
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

	const topCountries = $derived(feed.dots.slice(0, 6));
</script>

<div
	class="border-border bg-card/40 @container relative flex w-full flex-col gap-3 overflow-hidden rounded-md border p-3 backdrop-blur-md"
>
	<!-- 헤더 -->
	<header class="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest">
		<div class="flex items-center gap-2">
			<span class="inline-block size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"></span>
			<span class="text-foreground">// threat feed</span>
		</div>
		<span class="text-muted-foreground">updated {fmtRelative(feed.updatedAt)}</span>
	</header>

	<div class="grid grid-cols-1 gap-3 @[640px]:grid-cols-5">
		<!-- 지구본 영역 -->
		<div class="relative aspect-square min-h-[260px] w-full @[640px]:col-span-3 @[640px]:aspect-auto @[640px]:h-[420px]">
			<ThreatGlobe
				dots={feed.dots}
				selectedCountry={selected?.country ?? null}
				onSelect={(d) => (selected = d)}
			/>
		</div>

		<!-- 우측 패널 -->
		<div class="flex flex-col gap-3 @[640px]:col-span-2">
			{#if selected}
				<!-- 선택된 국가 상세 -->
				<div class="border-kairos-cyan/40 bg-background/40 rounded border p-2.5">
					<div class="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] tracking-widest uppercase">
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
					<div class="text-muted-foreground mb-2 font-mono text-[10px]">
						{#each selected.malwareTally as m (m.name)}
							<span class="text-foreground">{m.name}</span><span class="text-muted-foreground/70">·{m.count}</span>
							{#if m !== selected.malwareTally[selected.malwareTally.length - 1]}<span class="opacity-40"> / </span>{/if}
						{/each}
					</div>

					<!-- sample IOC 리스트 -->
					<div class="max-h-[240px] space-y-1 overflow-y-auto font-mono text-[10px]">
						{#each selected.samples as s (s.ioc)}
							{@const url = iocLink(s)}
							<a
								href={url ?? '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-kairos-cyan/10 flex items-center justify-between gap-2 rounded px-1 py-0.5"
							>
								<span class="text-foreground truncate" title={s.ioc}>{s.ioc}</span>
								<span class="text-muted-foreground shrink-0">{s.malware}</span>
								<ArrowSquareOut class="text-muted-foreground size-3 shrink-0" />
							</a>
						{:else}
							<div class="text-muted-foreground">no samples</div>
						{/each}
					</div>
				</div>
			{:else}
				<!-- 상위 국가 리스트 -->
				<div class="border-border/50 bg-background/30 rounded border p-2.5">
					<div class="text-muted-foreground mb-1.5 font-mono text-[9px] tracking-widest uppercase">
						// active c2 by country
					</div>
					<div class="font-mono text-[11px]">
						{#if topCountries.length === 0}
							<div class="text-muted-foreground">no data</div>
						{:else}
							{#each topCountries as c (c.country)}
								<button
									type="button"
									onclick={() => (selected = c)}
									class="hover:bg-kairos-cyan/10 flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left"
								>
									<span class="text-kairos-cyan">{c.country}</span>
									<span class="text-muted-foreground truncate text-[10px]" title={c.topMalware}>
										{c.topMalware}
									</span>
									<span class="text-foreground tabular-nums">{c.count}</span>
								</button>
							{/each}
						{/if}
					</div>
				</div>
			{/if}

			<!-- 최신 CVE -->
			<div class="border-border/50 bg-background/30 flex-1 overflow-hidden rounded border p-2.5">
				<div class="text-muted-foreground mb-1.5 flex items-center justify-between font-mono text-[9px] tracking-widest uppercase">
					<span>// latest cves</span>
					<span class="text-muted-foreground/70">nvd · cisa kev</span>
				</div>
				<div class="space-y-2 font-mono text-[10.5px] leading-snug">
					{#if feed.cves.length === 0}
						<div class="text-muted-foreground">no data</div>
					{:else}
						{#each feed.cves.slice(0, 4) as cve (cve.id)}
							<a
								href={cveLink(cve.id)}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-kairos-cyan/10 -mx-1 block rounded px-1 py-1"
							>
								<div class="flex items-center gap-1.5">
									<span class="text-foreground font-semibold">{cve.id}</span>
									{#if cve.score !== null}
										<span class={severityClass(cve.severity)}>{cve.score.toFixed(1)}</span>
									{/if}
									{#if cve.exploited}
										<span
											class="border-rose-400/50 bg-rose-400/10 text-rose-300 rounded-sm border px-1 text-[8px] tracking-widest uppercase"
										>
											exploited
										</span>
									{/if}
								</div>
								<div class="text-muted-foreground line-clamp-2 text-[10px]">
									{cve.description || '(no description)'}
								</div>
							</a>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- 푸터 -->
	<footer class="text-muted-foreground/70 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] tracking-widest uppercase">
		<span>// data: feodotracker.abuse.ch · threatfox.abuse.ch · nvd.nist.gov · cisa.gov</span>
		<span>{feed.totalIocs} iocs · {feed.dots.length} countries</span>
	</footer>
</div>
