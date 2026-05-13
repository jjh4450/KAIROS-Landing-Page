import PocketBase from 'pocketbase';
import { PUBLIC_PB_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';
import type { Category } from '$lib/types';

export const load: PageServerLoad = async () => {
	const pb = new PocketBase(PUBLIC_PB_URL);
	const categories = await pb
		.collection('categories')
		.getFullList<Category>({ sort: 'sortOrder' })
		.catch(() => [] as Category[]);
	return { categories };
};
