import { json } from '@sveltejs/kit';
import { getThreatFeed } from '$lib/server/threatFeed';

export async function GET() {
	const data = await getThreatFeed();
	return json(data, {
		// 서버 in-memory TTL(5분)과 정합 — 짧은 HTTP max-age는 캐시 효과를 깎음.
		headers: { 'cache-control': 'public, max-age=300' }
	});
}
