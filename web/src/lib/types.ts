/**
 * KAIROS PocketBase 레코드 타입 (랜딩 페이지에서 쓰는 것만 추림)
 */

export type UserRole = 'admin' | 'staff' | 'member';

export type User = {
	id: string;
	collectionId: string;
	collectionName: 'users';
	email: string;
	emailVisibility: boolean;
	verified: boolean;
	nickname?: string;
	role: UserRole;
	avatar?: string;
	created: string;
	updated: string;
};

export type SiteSettings = {
	id: string;
	key: string;
	siteTitle?: string;
	siteDescription?: string;
	recruitmentOpen?: boolean;
	recruitmentDeadline?: string;
	recruitmentFormUrl?: string;
	discordUrl?: string;
	kakaoUrl?: string;
	githubUrl?: string;
	instagramUrl?: string;
	contactEmail?: string;
	footerCopy?: string;
};

export type HeroSettings = {
	id: string;
	key: string;
	eyebrow?: string;
	title?: string;
	tagline?: string;
	subtitle?: string;
	primaryCtaLabel?: string;
	secondaryCtaLabel?: string;
};

export type SectionSlug =
	| 'about'
	| 'posts'
	| 'activities'
	| 'achievements'
	| 'members'
	| 'sponsors';

export type Section = {
	id: string;
	slug: SectionSlug;
	eyebrow?: string;
	title?: string;
	description?: string;
	order: number;
	visible: boolean;
};

export type AboutPillar = {
	id: string;
	idx: string;
	title: string;
	body: string;
	sortOrder?: number;
};

export type Achievement = {
	id: string;
	title: string;
	competition?: string;
	rank?: string;
	date?: string;
	link?: string;
	coverImage?: string;
	members?: string[];
	description?: string;
	sortOrder?: number;
	expand?: {
		members?: { id: string; nickname?: string }[];
	};
};

export type EventRecord = {
	id: string;
	title: string;
	description?: string;
	type: 'seminar' | 'study' | 'ctf' | 'conference' | 'social' | 'other';
	startsAt: string;
	endsAt?: string;
	location?: string;
	link?: string;
	coverImage?: string;
};

export type Sponsor = {
	id: string;
	name: string;
	logo?: string;
	link?: string;
	tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
	description?: string;
	sortOrder?: number;
};

export type Post = {
	id: string;
	title: string;
	content: string;
	created: string;
	updated: string;
	author: string;
	category: string;
	tags?: string[];
	attachments?: string[];
	isPinned?: boolean;
	isPrivate?: boolean;
	viewCount?: number;
	expand?: {
		author?: { id: string; nickname?: string };
		category?: { id: string; name: string; slug: string };
		tags?: { id: string; name: string }[];
	};
};

export type Category = {
	id: string;
	name: string;
	slug: string;
	description?: string;
	writePermission: 'all' | 'member' | 'staff' | 'admin';
	sortOrder?: number;
};

export type Member = {
	id: string;
	user: string;
	displayName?: string;
	realName?: string;
	position: 'president' | 'vice-president' | 'officer' | 'member' | 'alumni' | 'advisor';
	tracks?: string[];
	year?: number;
	bio?: string;
	avatar?: string;
	githubUrl?: string;
	blogUrl?: string;
	linkedinUrl?: string;
	twitterUrl?: string;
	personalUrl?: string;
	publicProfile?: boolean;
	sortOrder?: number;
	expand?: {
		user?: { id: string; nickname?: string };
	};
};
