import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/types';
import { renderMarkdown } from '$lib/markdown';
import { fileUrls } from '$lib/pbHelpers';
import { isStaff } from '$lib/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	let post: Post & { collectionId: string };
	try {
		post = await locals.pb.collection('posts').getOne<Post & { collectionId: string }>(params.id, {
			expand: 'author,category,tags'
		});
	} catch {
		throw error(404, '게시물을 찾을 수 없습니다.');
	}

	if (post.isPrivate && !locals.user) {
		throw error(403, '비공개 게시물입니다.');
	}

	const renderedContent = renderMarkdown(post.content);
	const attachments = fileUrls(post, post.attachments);

	const canEdit =
		!!locals.user && (locals.user.id === post.author || isStaff(locals.user));
	const canDelete =
		!!locals.user && (locals.user.id === post.author || locals.user.role === 'admin');

	return { post, renderedContent, attachments, canEdit, canDelete };
};
