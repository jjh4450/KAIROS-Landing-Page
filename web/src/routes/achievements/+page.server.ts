import type { PageServerLoad } from './$types';
import type { Achievement } from '$lib/types';
import { isStaff } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const items = await locals.pb
		.collection('achievements')
		.getFullList<Achievement & { collectionId: string }>({ sort: '-date,sortOrder' })
		.catch(() => [] as (Achievement & { collectionId: string })[]);

	return {
		achievements: items,
		canCreate: isStaff(locals.user)
	};
};
