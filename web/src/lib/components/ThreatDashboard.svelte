<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fmtRelative } from '$lib/format';

	type Dot = { country: string; count: number; x: number; y: number; topMalware: string };
	type Cve = {
		id: string;
		score: number | null;
		severity: string | null;
		description: string;
		published: string;
		exploited: boolean;
	};
	type Feed = { dots: Dot[]; cves: Cve[]; updatedAt: string; totalIocs: number };
	type World = { paths: string[]; width: number; height: number };

	type Props = { feed: Feed; world: World };
	let { feed: initial, world }: Props = $props();

	let feed = $state<Feed>(initial);

	const maxDotCount = $derived(Math.max(1, ...feed.dots.map((d) => d.count)));
	const dotRadius = (count: number) => 2.5 + Math.sqrt(count / maxDotCount) * 8;

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

	let refreshTimer: ReturnType<typeof setInterval> | undefined;

	async function refresh() {
		try {
			const res = await fetch('/api/threat-feed');
			if (res.ok) feed = (await res.json()) as Feed;
		} catch {
			// silent — keep last good
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
	<!-- 헤더 라인 -->
	<header class="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest">
		<div class="flex items-center gap-2">
			<span class="inline-block size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"></span>
			<span class="text-foreground">// threat feed</span>
		</div>
		<span class="text-muted-foreground">
			updated {fmtRelative(feed.updatedAt)}
		</span>
	</header>

	<div class="grid flex-1 grid-cols-1 gap-3 @[640px]:grid-cols-5">
		<!-- 좌측: 세계 지도 -->
		<div class="relative @[640px]:col-span-3">
			<svg
				viewBox={`0 0 ${world.width} ${world.height}`}
				preserveAspectRatio="xMidYMid meet"
				class="h-full w-full"
				aria-label="Global C2 server origin map"
			>
				<defs>
					<radialGradient id="pulse" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stop-color="var(--kairos-cyan)" stop-opacity="0.85" />
						<stop offset="60%" stop-color="var(--kairos-cyan)" stop-opacity="0.18" />
						<stop offset="100%" stop-color="var(--kairos-cyan)" stop-opacity="0" />
					</radialGradient>
				</defs>

				<!-- 국가 경계 -->
				<g
					stroke="var(--kairos-cyan)"
					stroke-opacity="0.35"
					stroke-width="0.4"
					fill="rgb(255 255 255 / 0.04)"
				>
					{#each world.paths as d, i (i)}
						<path {d} />
					{/each}
				</g>

				<!-- IOC 분포 점 -->
				<g>
					{#each feed.dots as dot (dot.country)}
						{@const r = dotRadius(dot.count)}
						<g>
							<circle cx={dot.x} cy={dot.y} r={r * 1.8} fill="url(#pulse)">
								<animate
									attributeName="r"
									values={`${r * 1.4};${r * 2.2};${r * 1.4}`}
									dur="3.2s"
									repeatCount="indefinite"
								/>
								<animate
									attributeName="opacity"
									values="0.7;0.3;0.7"
									dur="3.2s"
									repeatCount="indefinite"
								/>
							</circle>
							<circle
								cx={dot.x}
								cy={dot.y}
								r={Math.min(r, 5)}
								fill="var(--kairos-cyan)"
								fill-opacity="0.9"
								stroke="var(--kairos-cyan)"
								stroke-opacity="0.6"
								stroke-width="0.6"
							/>
						</g>
					{/each}
				</g>
			</svg>
		</div>

		<!-- 우측: 데이터 패널 -->
		<div class="flex flex-col gap-3 @[640px]:col-span-2">
			<!-- 상위 발신국 -->
			<div class="border-border/50 bg-background/30 rounded border p-2.5">
				<div class="text-muted-foreground mb-1.5 font-mono text-[9px] tracking-widest uppercase">
					// active c2 by country
				</div>
				<div class="text-foreground font-mono text-[11px]">
					{#if topCountries.length === 0}
						<div class="text-muted-foreground">no data</div>
					{:else}
						{#each topCountries as c (c.country)}
							<div class="flex items-center justify-between gap-2 leading-relaxed">
								<span class="text-kairos-cyan">{c.country}</span>
								<span class="text-muted-foreground truncate text-[10px]" title={c.topMalware}>
									{c.topMalware}
								</span>
								<span class="text-foreground tabular-nums">{c.count}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

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
						{#each feed.cves.slice(0, 5) as cve (cve.id)}
							<div>
								<div class="flex items-center gap-1.5">
									<span class="text-foreground font-semibold">{cve.id}</span>
									{#if cve.score !== null}
										<span class={severityClass(cve.severity)}>
											{cve.score.toFixed(1)}
										</span>
									{/if}
									{#if cve.exploited}
										<span
											class="border-rose-400/50 bg-rose-400/10 text-rose-300 rounded-sm border px-1 text-[8px] tracking-widest uppercase"
											title="CISA KEV"
										>
											exploited
										</span>
									{/if}
								</div>
								<div class="text-muted-foreground line-clamp-2 text-[10px]">
									{cve.description || '(no description)'}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- 푸터: attribution -->
	<footer class="text-muted-foreground/70 flex items-center justify-between font-mono text-[9px] tracking-widest uppercase">
		<span>// data: feodotracker.abuse.ch · nvd.nist.gov · cisa.gov</span>
		<span>{feed.totalIocs} iocs tracked</span>
	</footer>
</div>
