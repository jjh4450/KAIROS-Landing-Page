<script lang="ts">
	type Props = { class?: string };
	let { class: extra = '' }: Props = $props();
</script>

<svg
	class={['pointer-events-none', extra]}
	viewBox="0 0 800 600"
	preserveAspectRatio="xMidYMid slice"
	fill="none"
	stroke="currentColor"
	stroke-width="0.6"
	aria-hidden="true"
>
	<g opacity="0.22">
		<path d="M-40 410 Q 160 390 320 405 T 660 410 T 860 405" />
		<path d="M-40 445 Q 160 420 320 435 T 660 440 T 860 435" />
		<path d="M-40 478 Q 160 452 320 468 T 660 472 T 860 466" />
		<path d="M-40 512 Q 160 485 320 502 T 660 506 T 860 498" />
		<path d="M-40 546 Q 160 518 320 535 T 660 540 T 860 530" />
	</g>
	<g opacity="0.12" stroke-dasharray="2 4">
		<path d="M-40 380 Q 160 360 320 374 T 660 378 T 860 372" />
		<path d="M-40 580 Q 160 552 320 568 T 660 574 T 860 564" />
	</g>
</svg>
