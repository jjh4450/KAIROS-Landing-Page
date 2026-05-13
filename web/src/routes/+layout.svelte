<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupSmoothScroll, type SmoothScrollHandle } from '$lib/motion/smooth-scroll';

	let { children } = $props();

	onMount(() => {
		let handle: SmoothScrollHandle | null = null;
		setupSmoothScroll().then((h) => {
			handle = h;
		});
		return () => {
			handle?.destroy();
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
