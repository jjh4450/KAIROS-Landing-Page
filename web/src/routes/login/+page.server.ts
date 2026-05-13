import { fail, redirect } from '@sveltejs/kit';
import { safeNext } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (locals.user) {
		throw redirect(303, next);
	}
	return { next };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const next = safeNext(String(form.get('next') ?? '') || url.searchParams.get('next'));

		if (!email || !password) {
			return fail(400, { email, error: '이메일과 비밀번호를 입력해주세요.' });
		}

		try {
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch {
			return fail(400, { email, error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
		}

		throw redirect(303, next);
	}
};
