import { error, redirect } from '@sveltejs/kit';
import type { User } from '$lib/types';

export function safeNext(next: string | null | undefined, fallback = '/'): string {
	if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
	return next;
}

export function requireUser(
	locals: App.Locals,
	url: { pathname: string }
): User {
	if (!locals.user) {
		throw redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);
	}
	return locals.user;
}

export function isStaff(user: User | null | undefined): boolean {
	return !!user && (user.role === 'admin' || user.role === 'staff');
}

export function isAdmin(user: User | null | undefined): boolean {
	return user?.role === 'admin';
}

export function requireStaff(locals: App.Locals, url: { pathname: string }): User {
	const user = requireUser(locals, url);
	if (!isStaff(user)) throw error(403, '권한이 없습니다 (스태프 전용).');
	return user;
}

export function validateNewPassword(password: string, passwordConfirm: string): string | null {
	if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
	if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.';
	return null;
}
