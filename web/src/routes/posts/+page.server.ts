import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';
import type { Category, Post } from '$lib/types';

const PER_PAGE = 12;

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const categorySlug = url.searchParams.get('category')?.trim() ?? '';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));

	// Build PocketBase filter
	const filterParts: string[] = ['isPrivate = false'];
	if (q) {
		const safe = q.replace(/"/g, '\\"');
		filterParts.push(`(title ~ "${safe}" || content ~ "${safe}")`);
	}

	// 카테고리 슬러그로 들어오므로 먼저 id 변환
	let categoryId = '';
	if (categorySlug) {
		try {
			const cat = await pb
				.collection('categories')
				.getFirstListItem<Category>(`slug='${categorySlug}'`);
			categoryId = cat.id;
			filterParts.push(`category = "${categoryId}"`);
		} catch {
			// unknown slug — ignore filter
		}
	}

	const filter = filterParts.join(' && ');

	const [postsRes, categories] = await Promise.all([
		pb
			.collection('posts')
			.getList<Post>(page, PER_PAGE, {
				sort: '-isPinned,-created',
				filter,
				expand: 'author,category,tags'
			})
			.catch(() => ({
				items: [] as Post[],
				totalItems: 0,
				totalPages: 0,
				page: 1,
				perPage: PER_PAGE
			})),
		pb
			.collection('categories')
			.getFullList<Category>({ sort: 'sortOrder' })
			.catch(() => [] as Category[])
	]);

	return {
		posts: postsRes.items,
		totalItems: postsRes.totalItems,
		totalPages: postsRes.totalPages,
		page: postsRes.page,
		perPage: postsRes.perPage,
		q,
		categorySlug,
		categories
	};
};
