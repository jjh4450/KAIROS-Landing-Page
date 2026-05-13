import type { PageServerLoad } from './$types';
import { getThreatFeed } from '$lib/server/threatFeed';
import type {
	Achievement,
	Category,
	EventRecord,
	Member,
	Post,
	SiteSettings,
	Sponsor
} from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const emptyList = <T>() => ({ items: [] as T[], totalItems: 0, totalPages: 0, page: 1, perPage: 0 });

	const [settings, achievementsRes, eventsRes, sponsorsRes, membersRes, postsRes, categoriesRes, threatFeed] =
		await Promise.all([
			locals.pb
				.collection('siteSettings')
				.getFirstListItem<SiteSettings>("key='main'")
				.catch(() => null),
			locals.pb
				.collection('achievements')
				.getList<Achievement>(1, 8, { sort: '-date,-created' })
				.catch(() => emptyList<Achievement>()),
			locals.pb
				.collection('events')
				.getList<EventRecord>(1, 6, { sort: '-startsAt' })
				.catch(() => emptyList<EventRecord>()),
			locals.pb
				.collection('sponsors')
				.getList<Sponsor>(1, 30, { sort: 'tier,sortOrder' })
				.catch(() => emptyList<Sponsor>()),
			locals.pb
				.collection('members')
				.getList<Member>(1, 60, { sort: 'sortOrder', expand: 'user' })
				.catch(() => emptyList<Member>()),
			locals.pb
				.collection('posts')
				.getList<Post>(1, 7, {
					sort: '-isPinned,-created',
					filter: 'isPrivate = false',
					expand: 'author,category,tags'
				})
				.catch(() => emptyList<Post>()),
			locals.pb
				.collection('categories')
				.getFullList<Category>({ sort: 'sortOrder' })
				.catch(() => [] as Category[]),
			getThreatFeed().catch(() => ({
				dots: [],
				cves: [],
				updatedAt: new Date().toISOString(),
				totalIocs: 0
			}))
		]);

	return {
		settings,
		achievements: achievementsRes.items,
		events: eventsRes.items,
		sponsors: sponsorsRes.items,
		members: membersRes.items,
		posts: postsRes.items,
		categories: categoriesRes,
		stats: {
			posts: postsRes.totalItems ?? postsRes.items.length,
			members: membersRes.totalItems ?? membersRes.items.length,
			achievements: achievementsRes.totalItems ?? achievementsRes.items.length
		},
		threatFeed
	};
};
