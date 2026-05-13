import DOMPurify from 'isomorphic-dompurify';
import { pb } from '$lib/pb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	let post: Post;
	try {
		post = await pb.collection('posts').getOne<Post>(params.id, {
			expand: 'author,category,tags'
		});
	} catch {
		throw error(404, '게시물을 찾을 수 없습니다.');
	}

	if (post.isPrivate) {
		// 비공개 글은 로그인 시스템이 생기기 전까지 일단 차단
		throw error(403, '비공개 게시물입니다.');
	}

	// content 는 PocketBase editor 필드에서 온 사용자 입력 HTML.
	// {@html} 로 직접 렌더하기 전에 SSR 단계에서 sanitize 해 XSS 차단.
	post.content = DOMPurify.sanitize(post.content, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed'],
		FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
	});

	return { post };
};
