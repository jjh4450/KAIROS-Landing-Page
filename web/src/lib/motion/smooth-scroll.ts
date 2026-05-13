/**
 * Lenis ↔ GSAP ScrollTrigger 동기화.
 * +layout.svelte 의 onMount 안에서 setupSmoothScroll() 호출.
 *
 * - Lenis 가 메인 스크롤을 가로채 관성/Apple 풍 lerp 적용
 * - lenis.on('scroll') → ScrollTrigger.update() 로 GSAP 트리거가 같은 좌표계 사용
 * - gsap.ticker 로 lenis.raf 호출 (브라우저 rAF 대신 GSAP 시계 사용)
 *
 * reduced-motion 이면 비활성.
 */

import { browser } from '$app/environment';

export type SmoothScrollHandle = {
	destroy: () => void;
};

export async function setupSmoothScroll(): Promise<SmoothScrollHandle | null> {
	if (!browser) return null;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) return null;

	const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
		import('lenis'),
		import('gsap'),
		import('gsap/ScrollTrigger')
	]);

	gsap.registerPlugin(ScrollTrigger);

	const lenis = new Lenis({
		// Apple 풍 부드러운 관성
		lerp: 0.09,
		duration: 1.2,
		smoothWheel: true,
		wheelMultiplier: 1,
		touchMultiplier: 1.4
	});

	lenis.on('scroll', ScrollTrigger.update);

	const tick = (time: number) => {
		lenis.raf(time * 1000);
	};
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);

	return {
		destroy() {
			gsap.ticker.remove(tick);
			lenis.destroy();
			ScrollTrigger.getAll().forEach((t) => t.kill());
		}
	};
}
