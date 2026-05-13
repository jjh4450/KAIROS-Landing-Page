import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import PocketBase from 'pocketbase';
import { PUBLIC_PB_URL } from '$env/static/public';
import { dev } from '$app/environment';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { User } from '$lib/types';

const handleAuth: Handle = async ({ event, resolve }) => {
	const pb = new PocketBase(PUBLIC_PB_URL);
	// SSR: 같은 인스턴스에서 동시 실행되는 호출들이 서로 cancel 되는 것 방지
	pb.autoCancellation(false);
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

	try {
		if (pb.authStore.isValid) {
			await pb.collection('users').authRefresh();
		}
	} catch {
		pb.authStore.clear();
	}

	event.locals.pb = pb;
	event.locals.user = pb.authStore.isValid ? (pb.authStore.model as unknown as User) : null;

	const response = await resolve(event);

	response.headers.append(
		'set-cookie',
		pb.authStore.exportToCookie({
			secure: !dev,
			httpOnly: true,
			sameSite: 'Lax',
			path: '/'
		})
	);

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleAuth, handleParaglide);
