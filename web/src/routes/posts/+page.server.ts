import type { PageServerLoad } from './$types';
import type { Category, Post } from '$lib/types';

const PER_PAGE = 12;

export const load: PageServerLoad = async ({ url, locals }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const categorySlug = url.searchParams.get('category')?.trim() ?? '';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));

	// 카테고리 전체를 먼저 가져온 뒤 슬러그→id 매핑을 in-memory 로 해결
	// (예전엔 getFirstListItem 으로 별도 round-trip 했음)
	const categories = await locals.pb
		.collection('categories')
		.getFullList<Category>({ sort: 'sortOrder' })
		.catch(() => [] as Category[]);

	// pb.filter() 로 파라미터 바인딩 — 수동 escape 대신 SDK 가 안전하게 직렬화.
	const filterParts: string[] = ['isPrivate = false'];
	if (q) {
		filterParts.push(locals.pb.filter('(title ~ {:q} || content ~ {:q})', { q }));
	}
	if (categorySlug) {
		const cat = categories.find((c) => c.slug === categorySlug);
		if (cat) {
			filterParts.push(locals.pb.filter('category = {:id}', { id: cat.id }));
		}
		// unknown slug → filter dropped, treat as "all"
	}

	const postsRes = await locals.pb
		.collection('posts')
		.getList<Post>(page, PER_PAGE, {
			sort: '-isPinned,-created',
			filter: filterParts.join(' && '),
			expand: 'author,category,tags'
		})
		.catch(() => ({
			items: [] as Post[],
			totalItems: 0,
			totalPages: 0,
			page: 1,
			perPage: PER_PAGE
		}));

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
