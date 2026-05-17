export const SITE = {
	name: 'KAIROS',
	tagline: 'Kangwon Academic Initiative for Research On Security',
	description: '강원권 학생들이 모여 만들어 나가는 보안 커뮤니티입니다.',
	locale: 'ko_KR',
	themeColor: '#08080c'
} as const;

export type OgParams = {
	title?: string;
	description?: string;
};

export function buildOgUrl(origin: string, params: OgParams = {}): string {
	const u = new URL('/og', origin);
	if (params.title) u.searchParams.set('t', params.title);
	if (params.description) u.searchParams.set('d', params.description);
	return u.toString();
}
