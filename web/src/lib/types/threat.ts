// 위협 대시보드 공유 타입 — 서버/클라이언트 양쪽에서 import 가능한 중립 위치.
// 서버 전용 fetcher 는 $lib/server/threatFeed 에서 이 타입을 사용한다.

export type IocSample = {
	ioc: string;
	iocType: 'ip:port' | 'ip' | 'domain' | 'url';
	malware: string;
	firstSeen: string;
	iocId: string | null;
};

export type ThreatDot = {
	country: string;
	count: number;
	lat: number;
	lon: number;
	topMalware: string;
	malwareTally: { name: string; count: number }[];
	samples: IocSample[];
};

export type CveItem = {
	id: string;
	score: number | null;
	severity: string | null;
	description: string;
	published: string;
	exploited: boolean;
};

export type ThreatAttribution = {
	name: string;
	url: string;
	license: string;
};

export type ThreatFeed = {
	dots: ThreatDot[];
	cves: CveItem[];
	updatedAt: string;
	totalIocs: number;
	// 좌표 매핑이 없어 지구본에 표시 안 된 IOC 개수 (countries-110m 에 없는 군소 지역 등)
	unmappedIocs: number;
	attribution: ThreatAttribution[];
};
