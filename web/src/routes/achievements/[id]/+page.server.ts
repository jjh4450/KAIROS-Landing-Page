import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Achievement } from '$lib/types';
import { renderMarkdown } from '$lib/markdown';
import { fileUrl } from '$lib/pbHelpers';
import { isAdmin, isStaff } from '$lib/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	let item: Achievement & { collectionId: string };
	try {
		item = await locals.pb
			.collection('achievements')
			.getOne<Achievement & { collectionId: string }>(params.id, { expand: 'members' });
	} catch {
		throw error(404, '기록을 찾을 수 없습니다.');
	}

	return {
		item,
		renderedDescription: renderMarkdown(item.description ?? ''),
		coverUrl: item.coverImage ? fileUrl(item, item.coverImage) : null,
		canEdit: isStaff(locals.user),
		canDelete: isAdmin(locals.user)
	};
};
