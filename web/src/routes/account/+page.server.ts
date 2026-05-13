import { fail } from '@sveltejs/kit';
import { requireUser, validateNewPassword } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const user = requireUser(locals, url);
	return { user };
};

export const actions: Actions = {
	changePassword: async ({ request, locals, url }) => {
		const user = requireUser(locals, url);

		const form = await request.formData();
		const oldPassword = String(form.get('oldPassword') ?? '');
		const password = String(form.get('password') ?? '');
		const passwordConfirm = String(form.get('passwordConfirm') ?? '');

		const invalid = validateNewPassword(password, passwordConfirm);
		if (invalid) return fail(400, { error: invalid });

		try {
			await locals.pb.collection('users').update(user.id, {
				oldPassword,
				password,
				passwordConfirm
			});
		} catch {
			return fail(400, { error: '현재 비밀번호가 올바르지 않거나 변경에 실패했습니다.' });
		}
		return { success: '비밀번호가 변경되었습니다.' };
	}
};
