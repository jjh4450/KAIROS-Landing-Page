<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ThreatDot } from '$lib/server/threatFeed';

	// 노드 크기/색상 튜닝 상수
	const DOT_ALTITUDE_MIN = 0.02;
	const DOT_ALTITUDE_SCALE = 0.1; // 비선형(pow 0.6) 후 곱해질 max 증분
	const DOT_ALTITUDE_POWER = 0.6; // 큰 값 완만화 (우주엘리베이터 방지)
	const DOT_RADIUS_BASE = 0.5;
	const DOT_RADIUS_SCALE = 2.0;
	const DOT_SELECTED_MULT = 1.35;
	const SELECTED_COLOR = '#fb7185'; // rose-400
	const DOT_HUE = 190; // 사이안 톤
	const DOT_LIGHTNESS_MIN = 55;
	const DOT_LIGHTNESS_RANGE = 25;

	type Props = {
		dots: ThreatDot[];
		onHover?: (d: ThreatDot | null) => void;
		onSelect?: (d: ThreatDot | null) => void;
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
		return DOT_ALTITUDE_MIN + Math.pow(count / maxCount, DOT_ALTITUDE_POWER) * DOT_ALTITUDE_SCALE;
	}
	function dotRadius(count: number, isSelected: boolean) {
		const base = DOT_RADIUS_BASE + Math.sqrt(count / maxCount) * DOT_RADIUS_SCALE;
		return isSelected ? base * DOT_SELECTED_MULT : base;
	}
	function dotColor(d: ThreatDot) {
		if (selectedCountry && d.country === selectedCountry) return SELECTED_COLOR;
		const lightness = DOT_LIGHTNESS_MIN + (d.count / maxCount) * DOT_LIGHTNESS_RANGE;
		return `hsl(${DOT_HUE}, 95%, ${lightness}%)`;
	}

	function setData() {
		if (!globe) return;
		const asDot = (d: object) => d as ThreatDot;
		globe
			.pointsData(dots as unknown as Record<string, unknown>[])
			.pointLat('lat')
			.pointLng('lon')
			.pointAltitude((d: object) => dotAltitude(asDot(d).count))
			.pointRadius((d: object) => dotRadius(asDot(d).count, asDot(d).country === selectedCountry))
			.pointColor((d: object) => dotColor(asDot(d)))
			.pointLabel((d: object) => {
				const dot = asDot(d);
				return `<div style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;padding:6px 8px;background:rgba(0,0,0,0.85);border:1px solid rgba(56,189,248,0.4);border-radius:4px;color:white;line-height:1.5"><div style="color:#67e8f9"><b>${dot.country}</b> · ${dot.count} IOC</div><div style="opacity:0.7">top: ${dot.topMalware}</div><div style="opacity:0.5;font-size:9px;margin-top:2px">click for details</div></div>`;
			})
			.onPointHover((d: object | null) => onHover?.(d ? asDot(d) : null))
			.onPointClick((d: object) => onSelect?.(asDot(d)));
	}

	onMount(() => {
		if (!containerEl) return;
		globeModule = import('globe.gl');
		globeModule.then((mod) => {
			if (disposed || !containerEl) return;
			const Globe = mod.default;
			globe = Globe()(containerEl)
				.backgroundColor('rgba(0,0,0,0)')
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				.showAtmosphere(true)
				.atmosphereColor('#67e8f9')
				.atmosphereAltitude(0.25)
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

	// dots / selectedCountry 변경 시 globe.gl 데이터 바인딩 갱신
	$effect(() => {
		dots;
		selectedCountry;
		if (globe) setData();
	});
</script>

<div bind:this={containerEl} class={['relative h-full w-full', extra]} aria-label="Global threat globe"></div>
