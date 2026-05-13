<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Dot = {
		country: string;
		count: number;
		lat: number;
		lon: number;
		topMalware: string;
	};

	type Props = {
		dots: Dot[];
		onHover?: (d: Dot | null) => void;
		onSelect?: (d: Dot | null) => void;
		selectedCountry?: string | null;
		class?: string;
	};

	let {
		dots,
		onHover,
		onSelect,
		selectedCountry = null,
		class: extra = ''
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	type GlobeInstance = ReturnType<NonNullable<Awaited<typeof globeModule>>['default']>;
	let globe: GlobeInstance | null = null;
	let globeModule: Promise<typeof import('globe.gl')> | null = null;
	let resizeObs: ResizeObserver | null = null;
	let disposed = false;

	const maxCount = $derived(Math.max(1, ...dots.map((d) => d.count)));

	function dotAltitude(count: number) {
		return 0.04 + (count / maxCount) * 0.28;
	}
	function dotRadius(count: number, isSelected: boolean) {
		const base = 0.35 + Math.sqrt(count / maxCount) * 0.8;
		return isSelected ? base * 1.6 : base;
	}
	function dotColor(d: Dot) {
		if (selectedCountry && d.country === selectedCountry) return '#fb7185'; // rose-400
		// 사이안 톤 그라데이션 (count 비율에 따라 밝기)
		const ratio = d.count / maxCount;
		const lightness = 55 + ratio * 25;
		return `hsl(190, 95%, ${lightness}%)`;
	}

	function setData() {
		if (!globe) return;
		globe
			.pointsData(dots as unknown as Record<string, unknown>[])
			.pointLat('lat')
			.pointLng('lon')
			.pointAltitude((d: object) => dotAltitude((d as Dot).count))
			.pointRadius((d: object) =>
				dotRadius((d as Dot).count, (d as Dot).country === selectedCountry)
			)
			.pointColor((d: object) => dotColor(d as Dot))
			.pointLabel((d: object) => {
				const dot = d as Dot;
				return `<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;padding:6px 8px;background:rgba(0,0,0,0.85);border:1px solid rgba(56,189,248,0.4);border-radius:4px;color:white;line-height:1.5"><div style="color:#67e8f9"><b>${dot.country}</b> · ${dot.count} IOC</div><div style="opacity:0.7">top: ${dot.topMalware}</div><div style="opacity:0.5;font-size:9px;margin-top:2px">click for details</div></div>`;
			})
			.onPointHover((d: object | null) => onHover?.(d as Dot | null))
			.onPointClick((d: object) => onSelect?.(d as Dot));
	}

	onMount(() => {
		if (!containerEl) return;
		globeModule = import('globe.gl');
		globeModule.then((mod) => {
			if (disposed || !containerEl) return;
			const Globe = mod.default;
			globe = Globe()(containerEl)
				.backgroundColor('rgba(0,0,0,0)')
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
				.showAtmosphere(true)
				.atmosphereColor('#38bdf8')
				.atmosphereAltitude(0.18)
				.width(containerEl.clientWidth)
				.height(containerEl.clientHeight);

			globe.controls().autoRotate = true;
			globe.controls().autoRotateSpeed = 0.45;
			globe.controls().enableZoom = false;

			setData();

			resizeObs = new ResizeObserver(() => {
				if (containerEl && globe) {
					globe.width(containerEl.clientWidth).height(containerEl.clientHeight);
				}
			});
			resizeObs.observe(containerEl);
		});
	});

	onDestroy(() => {
		disposed = true;
		resizeObs?.disconnect();
		try {
			globe?._destructor?.();
		} catch {
			// noop
		}
	});

	// reactive 데이터/선택 변경 반영
	$effect(() => {
		if (globe) {
			// referencing reactive deps so $effect re-runs
			void dots.length;
			void selectedCountry;
			setData();
		}
	});
</script>

<div bind:this={containerEl} class={['relative h-full w-full', extra]} aria-label="Global threat globe"></div>
