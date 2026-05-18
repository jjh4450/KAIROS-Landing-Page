import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { requireUser } from '$lib/auth';
import { fileUrl } from '$lib/pbHelpers';
import { isTrack } from '$lib/memberOptions';
import { formBool, formFile, formStr } from '$lib/formHelpers';
import type { Actions, PageServerLoad } from './$types';
import type { Member } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	let member: (Member & { collectionId: string }) | null;
	try {
		member = await locals.pb
			.collection('members')
			.getFirstListItem<Member & { collectionId: string }>(`user="${user.id}"`);
	} catch {
		member = null;
	}

	return {
		member,
		avatarUrl: member?.avatar ? fileUrl(member, member.avatar) : null
	};
};

function buildFormData(form: FormData, userId: string, isCreate: boolean) {
	const data = new FormData();
	if (isCreate) {
		data.set('user', userId);
		data.set('position', 'member');
	}

	for (const f of [
		'displayName',
		'realName',
		'bio',
		'githubUrl',
		'blogUrl',
		'linkedinUrl',
		'twitterUrl',
		'personalUrl'
	] as const) {
		data.set(f, formStr(form, f));
	}

	const year = formStr(form, 'year');
	if (year) data.set('year', year);

	data.set('publicProfile', formBool(form, 'publicProfile') ? 'true' : 'false');

	const allTracks = form.getAll('tracks').map(String).filter(isTrack);
	if (allTracks.length === 0) {
		data.set('tracks', '');
	} else {
		for (const t of allTracks) data.append('tracks', t);
	}

	const avatar = formFile(form, 'avatar');
	if (avatar) data.set('avatar', avatar);
	if (formBool(form, 'removeAvatar')) data.set('avatar', '');

	return data;
}

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		const user = requireUser(locals, url);
		const form = await request.formData();

		let existing: { id: string } | null;
		try {
			existing = await locals.pb.collection('members').getFirstListItem(`user="${user.id}"`);
		} catch {
			existing = null;
		}

		const data = buildFormData(form, user.id, !existing);

		try {
			if (existing) {
				await locals.pb.collection('members').update(existing.id, data);
			} else {
				await locals.pb.collection('members').create(data);
			}
			throw redirect(303, '/members/me');
		} catch (err) {
			if (isRedirect(err)) throw err;
			return fail(400, { error: '저장 실패 (입력값 확인)' });
		}
	},

	delete: async ({ locals, url }) => {
		const user = requireUser(locals, url);
		try {
			const existing = await locals.pb.collection('members').getFirstListItem(`user="${user.id}"`);
			await locals.pb.collection('members').delete(existing.id);
		} catch {
			return fail(400, { error: '삭제 실패' });
		}
		throw redirect(303, '/members');
	}
};
