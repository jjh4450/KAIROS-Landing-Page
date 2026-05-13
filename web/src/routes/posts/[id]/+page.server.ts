import PocketBase from 'pocketbase';
import { PUBLIC_PB_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const pb = new PocketBase(PUBLIC_PB_URL);

	let post: Post;
	try {
		post = await pb.collection('posts').getOne<Post>(params.id, {
			expand: 'author,category,tags'
		});
	} catch (e) {
		throw error(404, '게시물을 찾을 수 없습니다.');
	}

	if (post.isPrivate) {
		// 비공개 글은 로그인 시스템이 생기기 전까지 일단 차단
		throw error(403, '비공개 게시물입니다.');
	}

	return { post };
};
