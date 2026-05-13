import geoip from 'geoip-lite';
import { centroidOf } from './countryCentroids';
import type {
	CveItem,
	IocSample,
	ThreatAttribution,
	ThreatDot,
	ThreatFeed
} from '$lib/types/threat';

export type { CveItem, IocSample, ThreatAttribution, ThreatDot, ThreatFeed };

// 5분 캐시 — 외부 API 부하 분산
const TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8_000;
const KEV_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_SAMPLES_PER_COUNTRY = 12;

const ATTRIBUTION: ThreatAttribution[] = [
	{
		name: 'abuse.ch Feodo Tracker',
		url: 'https://feodotracker.abuse.ch/',
		license: 'CC0 (attribution required)'
	},
	{
		name: 'abuse.ch ThreatFox',
		url: 'https://threatfox.abuse.ch/',
		license: 'CC0 (attribution required)'
	},
	{
		name: 'NVD (NIST National Vulnerability Database)',
		url: 'https://nvd.nist.gov/',
		license: 'Public domain (US government work)'
	},
	{
		name: 'CISA Known Exploited Vulnerabilities',
		url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
		license: 'Public domain'
	}
];

// in-memory cache (서버 인스턴스 단위)
let cache: { data: ThreatFeed; expires: number } | null = null;
let kevCache: { set: Set<string>; expires: number } | null = null;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, { ...init, signal: ctrl.signal });
		if (!res.ok) {
			console.warn(`[threatFeed] ${url} → HTTP ${res.status}`);
			return null;
		}
		return res;
	} catch (err) {
		console.warn(`[threatFeed] ${url} → ${(err as Error).message}`);
		return null;
	} finally {
		clearTimeout(timer);
	}
}

type Bucket = { count: number; malwareTally: Map<string, number>; samples: IocSample[] };

function bucketFor(map: Map<string, Bucket>, cc: string): Bucket {
	let b = map.get(cc);
	if (!b) {
		b = { count: 0, malwareTally: new Map(), samples: [] };
		map.set(cc, b);
	}
	return b;
}

function tally(b: Bucket, malware: string | undefined, sample: IocSample | null) {
	b.count++;
	if (malware) b.malwareTally.set(malware, (b.malwareTally.get(malware) ?? 0) + 1);
	if (sample && b.samples.length < MAX_SAMPLES_PER_COUNTRY) b.samples.push(sample);
}

type Aggregated = { fetched: number; unmapped: number };

async function fetchFeodo(
	byCountry: Map<string, Bucket>,
	unmapped: { count: number }
): Promise<number> {
	const res = await fetchWithTimeout('https://feodotracker.abuse.ch/downloads/ipblocklist.json', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return 0;

	type FeodoRow = {
		country?: string;
		malware?: string;
		ip_address?: string;
		port?: number;
		first_seen?: string;
	};
	let rows: FeodoRow[] = [];
	try {
		rows = (await res.json()) as FeodoRow[];
	} catch (err) {
		console.warn(`[threatFeed] Feodo JSON parse → ${(err as Error).message}`);
		return 0;
	}

	let included = 0;
	for (const row of rows) {
		const cc = row.country?.toUpperCase();
		if (!cc) continue;
		if (!centroidOf(cc)) {
			unmapped.count++;
			continue;
		}
		const b = bucketFor(byCountry, cc);
		const sample: IocSample | null = row.ip_address
			? {
					ioc: row.port ? `${row.ip_address}:${row.port}` : row.ip_address,
					iocType: 'ip:port',
					malware: row.malware ?? 'unknown',
					firstSeen: row.first_seen ?? '',
					iocId: null
				}
			: null;
		tally(b, row.malware, sample);
		included++;
	}
	return included;
}

const IP_RE = /^(\d{1,3}\.){3}\d{1,3}/;

// abuse.ch CSV 전용 파서. 형식: `"v1", "v2", ...` (쉼표 뒤 공백, 모든 필드 따옴표).
// papaparse 등은 leading space + quote 패턴을 quoted field 로 인식 못하므로 hand-rolled.
// 핸들링: 따옴표 escape (`""` → `"`), 따옴표 시작 전 공백 무시, quoted 내 쉼표는 분리자 아님.
function parseAbuseCsvLine(line: string): string[] {
	const out: string[] = [];
	let cur = '';
	let inQuote = false;
	let seenContent = false; // 현재 필드에서 비공백 문자 본 적 있는지
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			if (inQuote && line[i + 1] === '"') {
				cur += '"';
				i++;
			} else if (!inQuote && !seenContent) {
				// quoted field 시작 — 앞 공백 무시
				inQuote = true;
				cur = '';
			} else {
				inQuote = !inQuote;
			}
		} else if (ch === ',' && !inQuote) {
			out.push(cur);
			cur = '';
			seenContent = false;
		} else if (inQuote) {
			cur += ch;
		} else if (ch !== ' ' && ch !== '\t') {
			cur += ch;
			seenContent = true;
		}
	}
	out.push(cur);
	return out;
}

async function fetchThreatFox(
	byCountry: Map<string, Bucket>,
	unmapped: { count: number }
): Promise<number> {
	const res = await fetchWithTimeout('https://threatfox.abuse.ch/export/csv/recent/', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return 0;

	let csv: string;
	try {
		csv = await res.text();
	} catch (err) {
		console.warn(`[threatFeed] ThreatFox CSV read → ${(err as Error).message}`);
		return 0;
	}

	let included = 0;
	for (const raw of csv.split('\n')) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const cols = parseAbuseCsvLine(line);
		if (cols.length < 8) continue;
		// 0 first_seen, 1 ioc_id, 2 ioc_value, 3 ioc_type, 5 fk_malware, 7 malware_printable
		const iocType = cols[3];
		if (iocType !== 'ip:port' && iocType !== 'ip') continue;
		const m = cols[2]?.match(IP_RE);
		if (!m) continue;
		const lookup = geoip.lookup(m[0]);
		if (!lookup?.country) continue;
		if (!centroidOf(lookup.country)) {
			unmapped.count++;
			continue;
		}
		const malware = cols[7] || cols[5] || 'unknown';
		const sample: IocSample = {
			ioc: cols[2],
			iocType: 'ip:port',
			malware,
			firstSeen: cols[0],
			iocId: cols[1] || null
		};
		const b = bucketFor(byCountry, lookup.country);
		tally(b, malware, sample);
		included++;
	}
	return included;
}

function bucketsToDots(byCountry: Map<string, Bucket>): ThreatDot[] {
	const dots: ThreatDot[] = [];
	for (const [cc, { count, malwareTally, samples }] of byCountry) {
		const centroid = centroidOf(cc);
		if (!centroid) continue;
		const tally = [...malwareTally.entries()]
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);
		dots.push({
			country: cc,
			count,
			lon: centroid[0],
			lat: centroid[1],
			topMalware: tally[0]?.name ?? 'unknown',
			malwareTally: tally.slice(0, 5),
			samples
		});
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
	} catch (err) {
		console.warn(`[threatFeed] KEV parse → ${(err as Error).message}`);
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
					cvssMetricV31?: { cvssData?: { baseScore?: number; baseSeverity?: string } }[];
					cvssMetricV30?: { cvssData?: { baseScore?: number; baseSeverity?: string } }[];
				};
			};
		}[];
	};

	let json: Nvd;
	try {
		json = (await res.json()) as Nvd;
	} catch (err) {
		console.warn(`[threatFeed] NVD parse → ${(err as Error).message}`);
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
	const unmapped = { count: 0 };
	const [feodoCount, threatFoxCount, cves] = await Promise.all([
		fetchFeodo(byCountry, unmapped),
		fetchThreatFox(byCountry, unmapped),
		fetchCves(kev)
	]);

	return {
		dots: bucketsToDots(byCountry),
		cves,
		updatedAt: new Date().toISOString(),
		totalIocs: feodoCount + threatFoxCount,
		unmappedIocs: unmapped.count,
		attribution: ATTRIBUTION
	};
}

export async function getThreatFeed(): Promise<ThreatFeed> {
	if (cache && cache.expires > Date.now()) return cache.data;
	try {
		const data = await build();
		cache = { data, expires: Date.now() + TTL_MS };
		return data;
	} catch (err) {
		console.warn(`[threatFeed] build failed: ${(err as Error).message}`);
		if (cache) return cache.data;
		return {
			dots: [],
			cves: [],
			updatedAt: new Date().toISOString(),
			totalIocs: 0,
			unmappedIocs: 0,
			attribution: ATTRIBUTION
		};
	}
}
