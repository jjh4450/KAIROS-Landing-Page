/**
 * Svelte actions for motion micro-interactions.
 */

import type { Action } from 'svelte/action';

/* ============================================================
 * magnetic — 커서를 따라 요소가 살짝 끌려옴 (Apple/Awwwards 풍)
 *
 * <button use:magnetic={{ strength: 0.25 }} />
 * ============================================================ */
export const magnetic: Action<HTMLElement, { strength?: number; radius?: number } | undefined> = (
	node,
	params
) => {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let strength = params?.strength ?? 0.28;
	let radius = params?.radius ?? 1.2;
	let raf = 0;
	let target = { x: 0, y: 0 };
	let current = { x: 0, y: 0 };

	function loop() {
		current.x += (target.x - current.x) * 0.18;
		current.y += (target.y - current.y) * 0.18;
		node.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
		if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) {
			raf = requestAnimationFrame(loop);
		} else {
			raf = 0;
		}
	}

	function start(e: PointerEvent) {
		if (reduced) return;
		const rect = node.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const maxDist = (Math.max(rect.width, rect.height) / 2) * radius;
		const dx = e.clientX - cx;
		const dy = e.clientY - cy;
		const dist = Math.hypot(dx, dy);
		if (dist > maxDist) {
			target = { x: 0, y: 0 };
		} else {
			target = { x: dx * strength, y: dy * strength };
		}
		if (!raf) raf = requestAnimationFrame(loop);
	}

	function reset() {
		target = { x: 0, y: 0 };
		if (!raf) raf = requestAnimationFrame(loop);
	}

	node.style.willChange = 'transform';
	node.addEventListener('pointermove', start);
	node.addEventListener('pointerleave', reset);

	return {
		update(next) {
			strength = next?.strength ?? 0.28;
			radius = next?.radius ?? 1.2;
		},
		destroy() {
			node.removeEventListener('pointermove', start);
			node.removeEventListener('pointerleave', reset);
			if (raf) cancelAnimationFrame(raf);
			node.style.transform = '';
			node.style.willChange = '';
		}
	};
};

/* ============================================================
 * cardTilt — 마우스 추적 3D 회전 (perspective + rotateX/Y)
 *   카드에 use:cardTilt 를 걸면 자식들이 --rx, --ry, --mx, --my 를 받아
 *   layered translateZ + 글로스 스포트라이트로 깊이감을 표현.
 *
 *   카드 컨테이너에서 사용하는 CSS:
 *     transform: perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0));
 *     transform-style: preserve-3d;
 *   자식 레이어:
 *     transform: translateZ(20px);
 *
 * <Card use:cardTilt={{ max: 8 }}>...</Card>
 * ============================================================ */
export const cardTilt: Action<
	HTMLElement,
	{ max?: number; perspective?: number; scale?: number; reset?: number } | undefined
> = (node, params) => {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let max = params?.max ?? 8;
	let scale = params?.scale ?? 1.02;
	let reset = params?.reset ?? 0.18;

	let raf = 0;
	let target = { rx: 0, ry: 0, mx: 50, my: 50, s: 1 };
	let current = { rx: 0, ry: 0, mx: 50, my: 50, s: 1 };

	function loop() {
		const lerp = 0.16;
		current.rx += (target.rx - current.rx) * lerp;
		current.ry += (target.ry - current.ry) * lerp;
		current.mx += (target.mx - current.mx) * lerp;
		current.my += (target.my - current.my) * lerp;
		current.s += (target.s - current.s) * lerp;

		node.style.setProperty('--rx', current.rx.toFixed(2) + 'deg');
		node.style.setProperty('--ry', current.ry.toFixed(2) + 'deg');
		node.style.setProperty('--mx', current.mx.toFixed(1) + '%');
		node.style.setProperty('--my', current.my.toFixed(1) + '%');
		node.style.setProperty('--tilt-scale', current.s.toFixed(3));

		const dx = Math.abs(target.rx - current.rx);
		const dy = Math.abs(target.ry - current.ry);
		if (dx > 0.02 || dy > 0.02 || Math.abs(target.s - current.s) > 0.001) {
			raf = requestAnimationFrame(loop);
		} else {
			raf = 0;
		}
	}

	function move(e: PointerEvent) {
		if (reduced) return;
		const rect = node.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width; // 0..1
		const py = (e.clientY - rect.top) / rect.height; // 0..1
		// 중심 기준 -1..1
		const nx = px * 2 - 1;
		const ny = py * 2 - 1;
		target.ry = nx * max;
		target.rx = -ny * max;
		target.mx = px * 100;
		target.my = py * 100;
		target.s = scale;
		if (!raf) raf = requestAnimationFrame(loop);
	}

	function leave() {
		target.rx = 0;
		target.ry = 0;
		target.mx = 50;
		target.my = 50;
		target.s = 1;
		if (!raf) raf = requestAnimationFrame(loop);
	}

	node.style.willChange = 'transform';
	node.style.setProperty('--rx', '0deg');
	node.style.setProperty('--ry', '0deg');
	node.style.setProperty('--mx', '50%');
	node.style.setProperty('--my', '50%');
	node.style.setProperty('--tilt-scale', '1');
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);

	return {
		update(next) {
			max = next?.max ?? 8;
			scale = next?.scale ?? 1.02;
			reset = next?.reset ?? 0.18;
		},
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
			if (raf) cancelAnimationFrame(raf);
			node.style.transform = '';
			node.style.willChange = '';
		}
	};
};

/* ============================================================
 * tiltSpotlight — 카드 마우스 추적 스포트라이트 (CSS 변수 출력)
 *
 * <Card use:tiltSpotlight />
 * CSS 안에서 var(--mx), var(--my) 를 활용 (% 단위)
 * ============================================================ */
export const tiltSpotlight: Action<HTMLElement> = (node) => {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) return {};

	function move(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		node.style.setProperty('--mx', `${x}%`);
		node.style.setProperty('--my', `${y}%`);
	}
	function leave() {
		node.style.setProperty('--mx', `50%`);
		node.style.setProperty('--my', `50%`);
	}
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	leave();

	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
};
