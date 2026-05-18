<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { User } from '$lib/types';
	import SignOut from 'phosphor-svelte/lib/SignOut';
	import { USER_MENU_LINKS, clientLogout } from '$lib/userMenu';

	let { user }: { user: User } = $props();
	const initial = $derived((user.nickname ?? user.email).charAt(0).toUpperCase());
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
		{#each USER_MENU_LINKS as { href, label, Icon } (href)}
			<DropdownMenu.Item onSelect={() => goto(resolve(href))}>
				<Icon /> {label}
			</DropdownMenu.Item>
		{/each}
		<DropdownMenu.Item onSelect={clientLogout}>
			<SignOut /> logout
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
