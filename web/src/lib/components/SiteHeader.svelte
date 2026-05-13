<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { SiteSettings } from '$lib/types';
	import { magnetic } from '$lib/motion/actions';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';

	type Props = { settings?: SiteSettings | null };
	let { settings }: Props = $props();

	const navItems = [
		{ href: '/#about', label: 'about' },
		{ href: '/posts', label: 'posts' },
		{ href: '/#activities', label: 'activities' },
		{ href: '/#achievements', label: 'achievements' },
		{ href: '/#members', label: 'members' }
	];

	const recruiting = $derived(!!settings?.recruitmentOpen && !!settings?.recruitmentFormUrl);
</script>

<header class="fixed inset-x-0 top-0 z-50 px-4 pt-4">
	<nav class="glass mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
		<a href="/" class="group flex items-center gap-2">
			<span
				class="from-kairos-cyan to-kairos-violet inline-block h-5 w-5 bg-gradient-to-br"
				style="box-shadow: 0 0 18px -4px var(--kairos-cyan)"
				aria-hidden="true"
			></span>
			<span class="font-mono text-[13px] font-semibold tracking-widest">
				KAIROS<span class="text-kairos-cyan">_</span>
			</span>
		</a>

		<ul class="hidden items-center gap-1 md:flex">
			{#each navItems as item (item.href)}
				<li>
					<Button href={item.href} variant="ghost" size="sm" class="font-mono">
						{item.label}
					</Button>
				</li>
			{/each}
		</ul>

		{#if recruiting}
			<div use:magnetic={{ strength: 0.22 }}>
				<Button href={settings?.recruitmentFormUrl} variant="default" size="sm" class="font-mono">
					apply <ArrowUpRight />
				</Button>
			</div>
		{:else}
			<Button href="#join" variant="outline" size="sm" class="font-mono">join</Button>
		{/if}
	</nav>
</header>
