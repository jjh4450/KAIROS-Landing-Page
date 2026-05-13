<script lang="ts">
	// Aurora gradient mesh + 미세 격자 + 노이즈 + parallax (Lenis 동기화 시 GSAP가 추가 변형)
</script>

<div class="aurora" aria-hidden="true">
	<div class="aurora__blob aurora__blob--cyan"></div>
	<div class="aurora__blob aurora__blob--violet"></div>
	<div class="aurora__blob aurora__blob--magenta"></div>
	<div class="aurora__grid"></div>
	<div class="aurora__grain"></div>
	<div class="aurora__vignette"></div>
</div>

<style>
	.aurora {
		position: fixed;
		inset: 0;
		z-index: -10;
		pointer-events: none;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 20% 0%, oklch(0.22 0.07 230 / 0.25), transparent 60%),
			radial-gradient(ellipse at 80% 100%, oklch(0.22 0.07 290 / 0.2), transparent 60%),
			var(--background);
	}

	.aurora__blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(110px);
		mix-blend-mode: screen;
		will-change: transform;
		animation: drift 28s ease-in-out infinite alternate;
	}
	.aurora__blob--cyan {
		width: 55vw;
		height: 55vw;
		top: -20vw;
		left: -20vw;
		background: var(--kairos-cyan);
		opacity: 0.22;
		animation-delay: 0s;
	}
	.aurora__blob--violet {
		width: 50vw;
		height: 50vw;
		top: 25vh;
		right: -20vw;
		background: var(--kairos-violet);
		opacity: 0.18;
		animation-delay: -9s;
	}
	.aurora__blob--magenta {
		width: 45vw;
		height: 45vw;
		bottom: -15vw;
		left: 20vw;
		background: var(--kairos-magenta);
		opacity: 0.12;
		animation-delay: -17s;
	}

	@keyframes drift {
		0% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(4vw, -3vw, 0) scale(1.08);
		}
		100% {
			transform: translate3d(-3vw, 5vw, 0) scale(0.94);
		}
	}

	.aurora__grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to right, oklch(1 0 0 / 3%) 1px, transparent 1px),
			linear-gradient(to bottom, oklch(1 0 0 / 3%) 1px, transparent 1px);
		background-size: 72px 72px;
		mask-image: radial-gradient(ellipse at 50% 35%, black 25%, transparent 80%);
		-webkit-mask-image: radial-gradient(ellipse at 50% 35%, black 25%, transparent 80%);
	}

	.aurora__grain {
		position: absolute;
		inset: 0;
		opacity: 0.07;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
	}

	.aurora__vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 35%, oklch(0 0 0 / 55%) 100%);
	}

	@media (prefers-reduced-motion: reduce) {
		.aurora__blob {
			animation: none;
		}
	}
</style>
