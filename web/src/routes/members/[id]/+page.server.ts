import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Member } from '$lib/types';
import { renderMarkdown } from '$lib/markdown';
import { fileUrl } from '$lib/pbHelpers';
import { isStaff } from '$lib/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	let member: Member & { collectionId: string };
	try {
		member = await locals.pb
			.collection('members')
			.getOne<Member & { collectionId: string }>(params.id, { expand: 'user' });
	} catch {
		throw error(404, '멤버를 찾을 수 없습니다.');
	}

	const isSelf = locals.user?.id === member.user;
	if (!member.publicProfile && !isSelf && !isStaff(locals.user)) {
		throw error(403, '비공개 프로필입니다.');
	}

	return {
		member,
		renderedBio: renderMarkdown(member.bio ?? ''),
		avatarUrl: member.avatar ? fileUrl(member, member.avatar) : null,
		canEdit: isSelf || isStaff(locals.user)
	};
};
