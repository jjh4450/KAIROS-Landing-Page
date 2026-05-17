import type { PageServerLoad } from './$types';
import { getThreatFeed } from '$lib/server/threatFeed';
import type {
	Achievement,
	AboutPillar,
	Category,
	EventRecord,
	HeroSettings,
	Member,
	Post,
	Section,
	SectionSlug,
	SiteSettings,
	Sponsor
} from '$lib/types';

// 프론트가 dispatch할 수 있는 slug만 통과 — admin이 임의 slug를 만들어도
// 화면에서 누락되는 일이 명시적으로 차단되고, 후속 코드의 타입이 좁혀짐.
const KNOWN_SLUGS = new Set<SectionSlug>([
	'about',
	'posts',
	'activities',
	'achievements',
	'members',
	'sponsors'
]);
const isKnownSection = (s: Section): s is Section & { slug: SectionSlug } =>
	KNOWN_SLUGS.has(s.slug);

// PB 미적용/다운 시 화면이 비지 않게 — 각 컴포넌트가 하드코딩 카피 폴백
const DEFAULT_SECTIONS: Section[] = [
	{ id: 'default-about', slug: 'about', order: 10, visible: true },
	{ id: 'default-posts', slug: 'posts', order: 20, visible: true },
	{ id: 'default-activities', slug: 'activities', order: 30, visible: true },
	{ id: 'default-achievements', slug: 'achievements', order: 40, visible: true },
	{ id: 'default-members', slug: 'members', order: 50, visible: true },
	{ id: 'default-sponsors', slug: 'sponsors', order: 60, visible: true }
];

export const load: PageServerLoad = async ({ locals }) => {
	const emptyList = <T>() => ({
		items: [] as T[],
		totalItems: 0,
		totalPages: 0,
		page: 1,
		perPage: 0
	});

	const [
		settings,
		hero,
		sectionList,
		pillars,
		achievementsRes,
		eventsRes,
		sponsorsRes,
		membersRes,
		postsRes,
		categoriesRes,
		threatFeed
	] = await Promise.all([
		locals.pb
			.collection('siteSettings')
			.getFirstListItem<SiteSettings>("key='main'")
			.catch(() => null),
		locals.pb
			.collection('main_heroSettings')
			.getFirstListItem<HeroSettings>("key='main'")
			.catch(() => null),
		locals.pb
			.collection('main_sections')
			.getFullList<Section>({ sort: 'order' })
			.catch(() => [] as Section[]),
		locals.pb
			.collection('main_aboutPillars')
			.getFullList<AboutPillar>({ sort: 'sortOrder' })
			.catch(() => [] as AboutPillar[]),
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
		// getThreatFeed 는 내부에서 외부 API 실패를 graceful 처리 — 여기서 catch 는 방어선
		getThreatFeed()
	]);

	const sections =
		sectionList.length > 0
			? sectionList.filter((s) => s.visible !== false && isKnownSection(s))
			: DEFAULT_SECTIONS;

	return {
		settings,
		hero,
		sections,
		pillars,
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
