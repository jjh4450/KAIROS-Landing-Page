import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { isAdmin, requireStaff } from '$lib/auth';
import { fileUrl } from '$lib/pbHelpers';
import { formBool, formFile, formStr } from '$lib/formHelpers';
import { sanitizeImageUpload, UploadRejected } from '$lib/server/sanitizeUpload';
import type { Actions, PageServerLoad } from './$types';
import type { Achievement } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	requireStaff(locals, url);
	let item: Achievement & { collectionId: string };
	try {
		item = await locals.pb
			.collection('achievements')
			.getOne<Achievement & { collectionId: string }>(params.id);
	} catch {
		throw error(404);
	}
	return {
		item,
		coverUrl: item.coverImage ? fileUrl(item, item.coverImage) : null,
		canDelete: isAdmin(locals.user)
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals, url }) => {
		requireStaff(locals, url);
		const form = await request.formData();

		const data = new FormData();
		for (const f of ['title', 'competition', 'rank', 'date', 'link', 'description'] as const) {
			data.set(f, formStr(form, f));
		}

		const membersCsv = formStr(form, 'members');
		// reset members relation: clear then add (PB accepts duplicated key for relation arrays)
		if (membersCsv) {
			for (const id of membersCsv
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)) {
				data.append('members', id);
			}
		} else {
			data.set('members', '');
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
		if (formBool(form, 'removeCover')) data.set('coverImage', '');

		try {
			await locals.pb.collection('achievements').update(params.id, data);
			throw redirect(303, `/achievements/${params.id}`);
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(400, { error: '수정 실패' });
		}
	},

	delete: async ({ params, locals, url }) => {
		requireStaff(locals, url);
		if (!isAdmin(locals.user)) throw error(403, 'admin만 삭제 가능');
		try {
			await locals.pb.collection('achievements').delete(params.id);
		} catch {
			return fail(400, { error: '삭제 실패' });
		}
		throw redirect(303, '/achievements');
	}
};
