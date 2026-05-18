<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { SiteSettings, User } from '$lib/types';
	import { magnetic } from '$lib/motion/actions';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	import List from 'phosphor-svelte/lib/List';
	import SignOut from 'phosphor-svelte/lib/SignOut';
	import X from 'phosphor-svelte/lib/X';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { USER_MENU_LINKS, clientLogout } from '$lib/userMenu';

	type Props = { settings?: SiteSettings | null; user?: User | null };
	let { settings, user = null }: Props = $props();

	// 공개 사이트의 라우트는 frontend 코드에 1:1 매핑되어 있어서 nav를 별도
	// admin 편집 가능 데이터로 두는 게 redundant. 새 라우트를 추가하려면
	// 어차피 SvelteKit 페이지를 같이 만들어야 함 — 그때 이 배열도 같이 갱신.
	const navItems: { label: string; href: string }[] = [
		{ href: '/#about', label: 'about' },
		{ href: '/posts', label: 'posts' },
		{ href: '/achievements', label: 'achievements' },
		{ href: '/members', label: 'members' }
	];

	const recruiting = $derived(!!settings?.recruitmentOpen && !!settings?.recruitmentFormUrl);

	let mobileOpen = $state(false);

	$effect(() => {
		document.body.style.overflow = mobileOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function handleKey(e: KeyboardEvent) {
		if (!mobileOpen) return;
		if (e.key === 'Escape') mobileOpen = false;
	}

	async function handleLogout() {
		mobileOpen = false;
		await clientLogout();
	}
</script>

<svelte:window onkeydown={handleKey} />

<header class="fixed inset-x-0 top-0 z-50 px-4 pt-4">
	<nav class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 glass px-4 py-2.5">
		<a href={resolve('/')} class="group flex items-center gap-2">
			<span
				class="inline-block h-5 w-5 bg-gradient-to-br from-kairos-cyan to-kairos-violet"
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

		<div class="flex items-center gap-2">
			{#if recruiting}
				<div use:magnetic={{ strength: 0.22 }} class="hidden sm:block">
					<Button href={settings?.recruitmentFormUrl} variant="default" size="sm" class="font-mono">
						apply <ArrowUpRight />
					</Button>
				</div>
			{:else}
				<Button href="#join" variant="outline" size="sm" class="hidden font-mono sm:inline-flex"
					>join</Button
				>
			{/if}
			<div class="hidden md:contents">
				{#if user}
					<UserMenu {user} />
				{:else}
					<Button href="/login" variant="ghost" size="sm" class="font-mono">sign in</Button>
				{/if}
			</div>
			<button
				type="button"
				class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 hover:bg-white/5 hover:text-foreground"
				aria-label="메뉴 열기"
				aria-expanded={mobileOpen}
				aria-controls="mobile-nav"
				onclick={() => (mobileOpen = true)}
			>
				<List size={20} />
			</button>
		</div>
	</nav>
</header>

{#if mobileOpen}
	<div
		role="presentation"
		class="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm md:hidden"
		onclick={() => (mobileOpen = false)}
	></div>
{/if}

<aside
	id="mobile-nav"
	class="fixed top-0 right-0 z-[70] flex h-dvh w-[78%] max-w-sm flex-col gap-2 border-l border-border/40 bg-background/95 p-5 backdrop-blur-xl transition-transform duration-200 ease-out md:hidden"
	class:translate-x-0={mobileOpen}
	class:translate-x-full={!mobileOpen}
	inert={!mobileOpen}
>
	<div class="mb-2 flex items-center justify-between">
		<span class="font-mono text-[13px] font-semibold tracking-widest">
			KAIROS<span class="text-kairos-cyan">_</span>
		</span>
		<button
			type="button"
			class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 hover:bg-white/5 hover:text-foreground"
			aria-label="메뉴 닫기"
			onclick={() => (mobileOpen = false)}
		>
			<X size={20} />
		</button>
	</div>

	<nav class="flex flex-col gap-1">
		{#each navItems as item (item.href)}
			<a
				href={item.href}
				class="rounded-md px-3 py-3 font-mono text-sm text-foreground/90 hover:bg-white/5"
				onclick={() => (mobileOpen = false)}
			>
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="mt-auto flex flex-col gap-2 border-t border-border/40 pt-4">
		{#if user}
			<div
				class="mb-1 px-3 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
			>
				{user.nickname ?? user.email}
			</div>
			{#each USER_MENU_LINKS as { href, label, Icon } (href)}
				<a
					{href}
					class="flex items-center gap-2 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 hover:bg-white/5"
					onclick={() => (mobileOpen = false)}
				>
					<Icon /> {label}
				</a>
			{/each}
			<button
				type="button"
				class="flex items-center gap-2 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 hover:bg-white/5"
				onclick={handleLogout}
			>
				<SignOut /> logout
			</button>
		{:else}
			<Button
				href="/login"
				variant="ghost"
				size="sm"
				class="w-full font-mono"
				onclick={() => (mobileOpen = false)}
			>
				sign in
			</Button>
		{/if}

		{#if recruiting}
			<Button
				href={settings?.recruitmentFormUrl}
				variant="default"
				size="sm"
				class="w-full font-mono"
				onclick={() => (mobileOpen = false)}
			>
				apply <ArrowUpRight />
			</Button>
		{:else}
			<Button
				href="#join"
				variant="outline"
				size="sm"
				class="w-full font-mono"
				onclick={() => (mobileOpen = false)}
			>
				join
			</Button>
		{/if}
	</div>
</aside>
