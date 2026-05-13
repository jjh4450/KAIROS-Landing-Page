import { fail, redirect } from '@sveltejs/kit';
import { validateNewPassword } from '$lib/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const passwordConfirm = String(form.get('passwordConfirm') ?? '');

		const invalid = validateNewPassword(password, passwordConfirm);
		if (invalid) return fail(400, { error: invalid });

		try {
			await locals.pb
				.collection('users')
				.confirmPasswordReset(params.token, password, passwordConfirm);
		} catch {
			return fail(400, { error: '토큰이 만료되었거나 잘못되었습니다.' });
		}
		throw redirect(303, '/login');
	}
};
