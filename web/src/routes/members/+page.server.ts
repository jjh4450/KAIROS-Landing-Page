import type { PageServerLoad } from './$types';
import type { Member } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const members = await locals.pb
		.collection('members')
		.getFullList<Member & { collectionId: string }>({
			sort: 'sortOrder,position',
			expand: 'user',
			filter: 'publicProfile = true'
		})
		.catch(() => [] as (Member & { collectionId: string })[]);

	return { members };
};
