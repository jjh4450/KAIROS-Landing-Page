import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { requireStaff } from '$lib/auth';
import { formFile, formStr } from '$lib/formHelpers';
import { sanitizeImageUpload, UploadRejected } from '$lib/server/sanitizeUpload';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireStaff(locals, url);
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		requireStaff(locals, url);

		const form = await request.formData();
		const title = formStr(form, 'title');
		const competition = formStr(form, 'competition');
		const rank = formStr(form, 'rank');
		const date = formStr(form, 'date');
		const link = formStr(form, 'link');
		const description = formStr(form, 'description');
		const membersCsv = formStr(form, 'members');

		if (!title) return fail(400, { error: '제목 필수.' });

		const data = new FormData();
		data.set('title', title);
		if (competition) data.set('competition', competition);
		if (rank) data.set('rank', rank);
		if (date) data.set('date', date);
		if (link) data.set('link', link);
		if (description) data.set('description', description);
		if (membersCsv) {
			for (const id of membersCsv
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)) {
				data.append('members', id);
			}
		}
		const coverRaw = formFile(form, 'coverImage');
		if (coverRaw) {
			try {
				data.set('coverImage', await sanitizeImageUpload(coverRaw));
			} catch (err) {
				const msg = err instanceof UploadRejected ? err.message : '이미지 처리 실패';
				return fail(400, { error: msg });
			}
		}

		try {
			const rec = await locals.pb.collection('achievements').create(data);
			throw redirect(303, `/achievements/${rec.id}`);
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(400, { error: '생성 실패 (권한 또는 입력값 확인)' });
		}
	}
};
