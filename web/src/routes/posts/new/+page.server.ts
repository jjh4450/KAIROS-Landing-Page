import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { formBool, formStr } from '$lib/formHelpers';
import type { Actions, PageServerLoad } from './$types';
import type { Category } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals, url);
	const categories = await locals.pb
		.collection('categories')
		.getFullList<Category>({ sort: 'sortOrder' })
		.catch(() => [] as Category[]);
	return { categories };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		requireUser(locals, url);

		const form = await request.formData();
		const title = formStr(form, 'title');
		const categoryId = formStr(form, 'categoryId');
		const content = formStr(form, 'content');
		const isPrivate = formBool(form, 'isPrivate');

		if (!title) return fail(400, { title, content, categoryId, error: '제목을 입력해주세요.' });
		if (!categoryId) return fail(400, { title, content, categoryId, error: '카테고리를 선택해주세요.' });
		if (!content) return fail(400, { title, content, categoryId, error: '본문을 입력해주세요.' });

		const data = new FormData();
		data.set('title', title);
		data.set('content', content);
		data.set('category', categoryId);
		data.set('isPrivate', String(isPrivate));
		for (const file of form.getAll('newAttachments')) {
			if (file instanceof File && file.size > 0) {
				data.append('attachments', file);
			}
		}

		try {
			const post = await locals.pb.collection('posts').create(data);
			throw redirect(303, `/posts/${post.id}`);
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(400, { title, content, categoryId, error: '게시 실패 (권한 또는 입력값 확인)' });
		}
	}
};
