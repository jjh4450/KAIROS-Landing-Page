<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { User } from '$lib/types';
	import GearSix from 'phosphor-svelte/lib/GearSix';
	import SignOut from 'phosphor-svelte/lib/SignOut';
	import UserCircle from 'phosphor-svelte/lib/UserCircle';

	let { user }: { user: User } = $props();
	const initial = $derived((user.nickname ?? user.email).charAt(0).toUpperCase());

	async function logout() {
		await fetch('/logout', { method: 'POST', redirect: 'manual' });
		await goto(resolve('/'), { invalidateAll: true });
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="rounded-full ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		aria-label="user menu"
	>
		<Avatar.Root class="size-8">
			<Avatar.Fallback class="bg-kairos-cyan/20 font-mono text-xs text-kairos-cyan">
				{initial}
			</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-48 font-mono">
		<DropdownMenu.Label class="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
			{user.nickname ?? user.email}
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onSelect={() => goto(resolve('/members/me'))}>
			<UserCircle /> my profile
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={() => goto(resolve('/account'))}>
			<GearSix /> account
		</DropdownMenu.Item>
		<DropdownMenu.Item onSelect={logout}>
			<SignOut /> logout
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
