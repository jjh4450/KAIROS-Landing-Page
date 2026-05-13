import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals }) => {
	// hooks.server.ts가 cleared authStore를 만료 쿠키로 export 해 자동 삭제됨
	locals.pb.authStore.clear();
	throw redirect(303, '/');
};
