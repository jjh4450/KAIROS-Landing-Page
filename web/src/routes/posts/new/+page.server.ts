import { pb } from '$lib/pb';
import type { PageServerLoad } from './$types';
import type { Category } from '$lib/types';

export const load: PageServerLoad = async () => {
	const categories = await pb
		.collection('categories')
		.getFullList<Category>({ sort: 'sortOrder' })
		.catch(() => [] as Category[]);
	return { categories };
};
