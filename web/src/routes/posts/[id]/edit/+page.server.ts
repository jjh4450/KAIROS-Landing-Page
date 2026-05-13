import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { isStaff, requireUser } from '$lib/auth';
import { fileUrls } from '$lib/pbHelpers';
import { formBool, formStr } from '$lib/formHelpers';
import type { Actions, PageServerLoad } from './$types';
import type { Category, Post } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = requireUser(locals, url);

	const [postResult, categories] = await Promise.all([
		locals.pb
			.collection('posts')
			.getOne<Post & { collectionId: string }>(params.id)
			.catch(() => null),
		locals.pb
			.collection('categories')
			.getFullList<Category>({ sort: 'sortOrder' })
			.catch(() => [] as Category[])
	]);

	if (!postResult) throw error(404, '게시물을 찾을 수 없습니다.');
	if (postResult.author !== user.id && !isStaff(user)) {
		throw error(403, '수정 권한이 없습니다.');
	}

	const canDelete = postResult.author === user.id || user.role === 'admin';

	return {
		post: postResult,
		categories,
		attachments: fileUrls(postResult, postResult.attachments),
		canDelete
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals, url }) => {
		requireUser(locals, url);
		const form = await request.formData();
		const title = formStr(form, 'title');
		const content = formStr(form, 'content');
		const categoryId = formStr(form, 'categoryId');
		const isPrivate = formBool(form, 'isPrivate');

		if (!title) return fail(400, { error: '제목을 입력해주세요.' });
		if (!categoryId) return fail(400, { error: '카테고리를 선택해주세요.' });
		if (!content) return fail(400, { error: '본문을 입력해주세요.' });

		const data = new FormData();
		data.set('title', title);
		data.set('content', content);
		data.set('category', categoryId);
		data.set('isPrivate', String(isPrivate));

		// 새로 추가된 파일들 (기존 첨부는 유지)
		for (const file of form.getAll('newAttachments')) {
			if (file instanceof File && file.size > 0) {
				data.append('attachments+', file);
			}
		}

		// 제거 요청된 파일들
		for (const name of form.getAll('removeAttachment')) {
			if (typeof name === 'string' && name) {
				data.append('attachments-', name);
			}
		}

		try {
			await locals.pb.collection('posts').update(params.id, data);
			throw redirect(303, `/posts/${params.id}`);
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(400, { error: '수정 실패 (권한 또는 입력값 확인)' });
		}
	},

	delete: async ({ params, locals, url }) => {
		requireUser(locals, url);
		try {
			await locals.pb.collection('posts').delete(params.id);
		} catch {
			return fail(400, { error: '삭제 실패 (권한 확인)' });
		}
		throw redirect(303, '/posts');
	}
};
