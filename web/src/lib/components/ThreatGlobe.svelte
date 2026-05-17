<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { TOUCH } from 'three';
	import type { ThreatDot } from '$lib/types/threat';

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

	let { dots, onHover, onSelect, selectedCountry = null, class: extra = '' }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	// globe.gl 은 chainable factory 인데 패키지 타입 정의가 class 로 잘못 노출돼 있어
	// 정확한 typing 이 어려움. 동작은 런타임으로 검증됨.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let globe: any = null;
	let globeModule: Promise<typeof import('globe.gl')> | null = null;
	let resizeObs: ResizeObserver | null = null;
	let disposed = false;

	let hintVisible = $state(false);
	let hintTimer: ReturnType<typeof setTimeout> | null = null;

	function clearHintTimer() {
		if (!hintTimer) return;
		clearTimeout(hintTimer);
		hintTimer = null;
	}

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length >= 2) {
			hintVisible = false;
			clearHintTimer();
			return;
		}
		if (!hintVisible) hintVisible = true;
		clearHintTimer();
		hintTimer = setTimeout(() => {
			hintVisible = false;
			hintTimer = null;
		}, 1200);
	}

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
			// types 가 class 처럼 노출되지만 실제로는 factory: `Globe()(domEl)` 가 정상 호출 패턴
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const Globe = mod.default as any;
			globe = Globe()(containerEl)
				.backgroundColor('rgba(0,0,0,0)')
				.globeImageUrl('/textures/earth-night.jpg')
				.bumpImageUrl('/textures/earth-topology.png')
				.showAtmosphere(true)
				.atmosphereColor('#67e8f9')
				.atmosphereAltitude(0.25)
				.width(containerEl.clientWidth)
				.height(containerEl.clientHeight);

			const controls = globe.controls();
			controls.autoRotate = true;
			controls.autoRotateSpeed = 0.45;
			controls.enableZoom = false;
			// 한 손가락은 OrbitControls 무시 → 페이지 스크롤로 위임. enableZoom=false 라 DOLLY_ROTATE 는 두 손가락 회전만 처리.
			controls.touches = { ONE: null, TWO: TOUCH.DOLLY_ROTATE };
			// OrbitControls.connect() 가 강제한 touch-action:none 을 pan-y 로 덮어 한 손가락 native 스크롤 허용.
			controls.domElement.style.touchAction = 'pan-y';

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
		clearHintTimer();
		try {
			globe?._destructor?.();
		} catch {
			// noop
		}
	});

	// dots / selectedCountry 변경 시 globe.gl 데이터 바인딩 갱신
	$effect(() => {
		// 명시적 reactive dependency — setData() 내부 access만으로는 globe null 단계에서 누락
		void dots;
		void selectedCountry;
		if (globe) setData();
	});
</script>

<!-- data-lenis-prevent: Lenis 가 이 영역 touch 를 가로채지 않게 → globe touch-action 과 충돌 회피. -->
<div
	bind:this={containerEl}
	class={['relative h-full w-full', extra]}
	ontouchstart={onTouchStart}
	role="region"
	aria-label="Global threat globe"
	data-lenis-prevent
>
	{#if hintVisible}
		<div
			class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-[1px] transition-opacity duration-200"
			aria-hidden="true"
		>
			<span
				class="rounded-md border border-kairos-cyan/40 bg-background/90 px-3 py-1.5 text-xs text-foreground/90 backdrop-blur-lg"
			>
				두 손가락으로 회전
			</span>
		</div>
	{/if}
</div>
