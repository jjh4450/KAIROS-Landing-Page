<script lang="ts">
	type Props = { size?: number; class?: string };
	let { size = 36, class: extra = '' }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	stroke="currentColor"
	stroke-width="1.1"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={extra}
	aria-hidden="true"
>
	<path d="M16 3 L27 9 L27 23 L16 29 L5 23 L5 9 Z" opacity="0.5" />
	<path d="M8 22 L12 13 L16 19 L20 11 L24 22" />
	<path d="M7.5 25 L24.5 25" opacity="0.32" />
	<circle cx="16" cy="16" r="0.7" fill="currentColor" opacity="0.7" />
</svg>
