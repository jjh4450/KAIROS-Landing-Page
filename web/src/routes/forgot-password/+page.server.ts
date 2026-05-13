import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		if (!email) return fail(400, { error: '이메일을 입력해주세요.' });
		try {
			await locals.pb.collection('users').requestPasswordReset(email);
		} catch {
			// 이메일 존재 여부 누설 방지 — 무조건 성공처럼 응답
		}
		return { sent: true };
	}
};
