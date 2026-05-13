import geoip from 'geoip-lite';
import { centroidOf } from './countryCentroids';
import { project } from './worldMap';

export type ThreatDot = {
	country: string;
	count: number;
	x: number;
	y: number;
	topMalware: string;
};

export type CveItem = {
	id: string;
	score: number | null;
	severity: string | null;
	description: string;
	published: string;
	exploited: boolean;
};

export type ThreatFeed = {
	dots: ThreatDot[];
	cves: CveItem[];
	updatedAt: string;
	totalIocs: number;
};

const TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;

let cache: { data: ThreatFeed; expires: number } | null = null;
let kevCache: { set: Set<string>; expires: number } | null = null;

const KEV_TTL_MS = 12 * 60 * 60 * 1000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, { ...init, signal: ctrl.signal });
		return res.ok ? res : null;
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

type Bucket = { count: number; malwareTally: Map<string, number> };

function tally(map: Map<string, Bucket>, cc: string, malware?: string) {
	const slot = map.get(cc) ?? { count: 0, malwareTally: new Map() };
	slot.count++;
	if (malware) slot.malwareTally.set(malware, (slot.malwareTally.get(malware) ?? 0) + 1);
	map.set(cc, slot);
}

async function fetchFeodo(byCountry: Map<string, Bucket>): Promise<number> {
	const res = await fetchWithTimeout('https://feodotracker.abuse.ch/downloads/ipblocklist.json', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return 0;

	type FeodoRow = { country?: string; malware?: string; status?: string; last_online?: string };
	let rows: FeodoRow[] = [];
	try {
		rows = (await res.json()) as FeodoRow[];
	} catch {
		return 0;
	}

	let included = 0;
	for (const row of rows) {
		const cc = row.country?.toUpperCase();
		if (!cc) continue;
		tally(byCountry, cc, row.malware);
		included++;
	}
	return included;
}

const IP_RE = /^(\d{1,3}\.){3}\d{1,3}/;

function parseCsvLine(line: string): string[] {
	// 단순 CSV 파서 — abuse.ch CSV 는 `"a", "b", "c"` 형식 (쉼표+공백 구분, 모든 필드가 따옴표)
	const out: string[] = [];
	let cur = '';
	let inQuote = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			inQuote = !inQuote;
		} else if (ch === ',' && !inQuote) {
			out.push(cur.trim());
			cur = '';
		} else {
			cur += ch;
		}
	}
	out.push(cur.trim());
	return out;
}

async function fetchThreatFox(byCountry: Map<string, Bucket>): Promise<number> {
	const res = await fetchWithTimeout('https://threatfox.abuse.ch/export/csv/recent/', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return 0;

	let csv: string;
	try {
		csv = await res.text();
	} catch {
		return 0;
	}

	let included = 0;
	for (const raw of csv.split('\n')) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const cols = parseCsvLine(line);
		// 컬럼: 0 first_seen, 2 ioc_value, 3 ioc_type, 7 malware_printable
		const iocType = cols[3];
		if (iocType !== 'ip:port' && iocType !== 'ip') continue;
		const m = cols[2]?.match(IP_RE);
		if (!m) continue;
		const lookup = geoip.lookup(m[0]);
		if (!lookup?.country) continue;
		tally(byCountry, lookup.country, cols[7] || cols[5] || 'unknown');
		included++;
	}
	return included;
}

function bucketsToDots(byCountry: Map<string, Bucket>): ThreatDot[] {
	const dots: ThreatDot[] = [];
	for (const [cc, { count, malwareTally }] of byCountry) {
		const centroid = centroidOf(cc);
		if (!centroid) continue;
		const projected = project(centroid[0], centroid[1]);
		if (!projected) continue;
		const topMalware =
			[...malwareTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';
		dots.push({ country: cc, count, x: projected[0], y: projected[1], topMalware });
	}
	dots.sort((a, b) => b.count - a.count);
	return dots;
}

async function fetchKev(): Promise<Set<string>> {
	if (kevCache && kevCache.expires > Date.now()) return kevCache.set;
	const res = await fetchWithTimeout(
		'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
	);
	if (!res) return kevCache?.set ?? new Set();

	try {
		const json = (await res.json()) as { vulnerabilities?: { cveID: string }[] };
		const set = new Set((json.vulnerabilities ?? []).map((v) => v.cveID));
		kevCache = { set, expires: Date.now() + KEV_TTL_MS };
		return set;
	} catch {
		return kevCache?.set ?? new Set();
	}
}

async function fetchCves(exploitedSet: Set<string>): Promise<CveItem[]> {
	const end = new Date();
	const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000);
	const fmt = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '');
	const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&resultsPerPage=40`;

	const res = await fetchWithTimeout(url);
	if (!res) return [];

	type Nvd = {
		vulnerabilities?: {
			cve: {
				id: string;
				published: string;
				descriptions?: { lang: string; value: string }[];
				metrics?: {
					cvssMetricV31?: {
						cvssData?: { baseScore?: number; baseSeverity?: string };
					}[];
					cvssMetricV30?: {
						cvssData?: { baseScore?: number; baseSeverity?: string };
					}[];
				};
			};
		}[];
	};

	let json: Nvd;
	try {
		json = (await res.json()) as Nvd;
	} catch {
		return [];
	}

	const items: CveItem[] = (json.vulnerabilities ?? []).map((v) => {
		const m =
			v.cve.metrics?.cvssMetricV31?.[0]?.cvssData ??
			v.cve.metrics?.cvssMetricV30?.[0]?.cvssData ??
			null;
		const desc = v.cve.descriptions?.find((d) => d.lang === 'en')?.value ?? '';
		return {
			id: v.cve.id,
			score: m?.baseScore ?? null,
			severity: m?.baseSeverity ?? null,
			description: desc.length > 180 ? desc.slice(0, 177) + '…' : desc,
			published: v.cve.published,
			exploited: exploitedSet.has(v.cve.id)
		};
	});

	items.sort((a, b) => {
		if (a.exploited !== b.exploited) return a.exploited ? -1 : 1;
		return (b.score ?? 0) - (a.score ?? 0);
	});

	return items.slice(0, 8);
}

async function build(): Promise<ThreatFeed> {
	const kev = await fetchKev();
	const byCountry = new Map<string, Bucket>();
	const [feodoCount, threatFoxCount, cves] = await Promise.all([
		fetchFeodo(byCountry),
		fetchThreatFox(byCountry),
		fetchCves(kev)
	]);

	return {
		dots: bucketsToDots(byCountry),
		cves,
		updatedAt: new Date().toISOString(),
		totalIocs: feodoCount + threatFoxCount
	};
}

export function invalidateThreatFeedCache(): void {
	cache = null;
}

export async function getThreatFeed(): Promise<ThreatFeed> {
	if (cache && cache.expires > Date.now()) return cache.data;
	try {
		const data = await build();
		cache = { data, expires: Date.now() + TTL_MS };
		return data;
	} catch {
		if (cache) return cache.data;
		return { dots: [], cves: [], updatedAt: new Date().toISOString(), totalIocs: 0 };
	}
}
