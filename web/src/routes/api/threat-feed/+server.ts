import { json } from '@sveltejs/kit';
import { getThreatFeed } from '$lib/server/threatFeed';

export async function GET() {
	const data = await getThreatFeed();
	return json(data, {
		// 서버 TTL(5분)과 정합 — 짧은 max-age는 캐시 효과를 깎고 백엔드 요청만 늘림
		headers: { 'cache-control': 'public, max-age=300' }
	});
}
