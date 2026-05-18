import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import GearSix from 'phosphor-svelte/lib/GearSix';
import UserCircle from 'phosphor-svelte/lib/UserCircle';
import type { Component } from 'svelte';

export type UserMenuLink = { href: string; label: string; Icon: Component };

export const USER_MENU_LINKS: UserMenuLink[] = [
	{ href: '/account', label: 'my profile', Icon: UserCircle },
	{ href: '/members/me', label: 'account', Icon: GearSix }
];

export async function clientLogout(): Promise<void> {
	await fetch('/logout', { method: 'POST', redirect: 'manual' });
	await goto(resolve('/'), { invalidateAll: true });
}
