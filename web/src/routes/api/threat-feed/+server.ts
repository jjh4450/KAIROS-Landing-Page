import { json } from '@sveltejs/kit';
import { getThreatFeed, invalidateThreatFeedCache } from '$lib/server/threatFeed';

export async function GET({ url }) {
	if (url.searchParams.get('refresh') === '1') invalidateThreatFeedCache();
	const data = await getThreatFeed();
	return json(data, {
		headers: {
			'cache-control': 'public, max-age=60'
		}
	});
}
