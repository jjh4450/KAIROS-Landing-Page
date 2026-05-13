import geoip from 'geoip-lite';
import { parse as parseCsv } from 'csv-parse/sync';
import { centroidOf } from './countryCentroids';
import type {
	CveItem,
	IocSample,
	ThreatAttribution,
	ThreatDot,
	ThreatFeed
} from '$lib/types/threat';

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

type Bucket = {
	count: number;
	malwareTally: Map<string, number>;
	samples: IocSample[];
	centroid: [number, number];
};

function bucketFor(
	map: Map<string, Bucket>,
	cc: string,
	centroid: [number, number]
): Bucket {
	let b = map.get(cc);
	if (!b) {
		b = { count: 0, malwareTally: new Map(), samples: [], centroid };
		map.set(cc, b);
	}
	return b;
}

function tally(b: Bucket, malware: string | undefined, sample: IocSample | null) {
	b.count++;
	if (malware) b.malwareTally.set(malware, (b.malwareTally.get(malware) ?? 0) + 1);
	if (sample && b.samples.length < MAX_SAMPLES_PER_COUNTRY) b.samples.push(sample);
}

type AggregateResult = { fetched: number; unmapped: number };

async function fetchFeodo(byCountry: Map<string, Bucket>): Promise<AggregateResult> {
	const res = await fetchWithTimeout('https://feodotracker.abuse.ch/downloads/ipblocklist.json', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return { fetched: 0, unmapped: 0 };

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
		return { fetched: 0, unmapped: 0 };
	}

	let fetched = 0;
	let unmapped = 0;
	for (const row of rows) {
		const cc = row.country?.toUpperCase();
		if (!cc) continue;
		const centroid = centroidOf(cc);
		if (!centroid) {
			unmapped++;
			continue;
		}
		const b = bucketFor(byCountry, cc, centroid);
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
		fetched++;
	}
	return { fetched, unmapped };
}

const IP_RE = /^(\d{1,3}\.){3}\d{1,3}/;

async function fetchThreatFox(byCountry: Map<string, Bucket>): Promise<AggregateResult> {
	const res = await fetchWithTimeout('https://threatfox.abuse.ch/export/csv/recent/', {
		headers: { 'User-Agent': 'KAIROS-landing/1.0 (+https://github.com/jjh4450)' }
	});
	if (!res) return { fetched: 0, unmapped: 0 };

	let csv: string;
	try {
		csv = await res.text();
	} catch (err) {
		console.warn(`[threatFeed] ThreatFox CSV read → ${(err as Error).message}`);
		return { fetched: 0, unmapped: 0 };
	}

	// csv-parse 의 `trim: true` 가 abuse.ch 의 비표준 `, "value"` (쉼표 뒤 공백) 포맷을
	// 정상 처리. `comment: '#'` 로 abuse.ch 가 헤더처럼 쓰는 # 주석 라인 자동 skip.
	let rows: string[][] = [];
	try {
		rows = parseCsv(csv, {
			comment: '#',
			trim: true,
			skip_empty_lines: true,
			relax_column_count: true,
			columns: false
		});
	} catch (err) {
		console.warn(`[threatFeed] ThreatFox CSV parse → ${(err as Error).message}`);
		return { fetched: 0, unmapped: 0 };
	}

	let fetched = 0;
	let unmapped = 0;
	for (const row of rows) {
		if (row.length < 8) continue;
		// 0 first_seen, 1 ioc_id, 2 ioc_value, 3 ioc_type, 5 fk_malware, 7 malware_printable
		const iocType = row[3];
		if (iocType !== 'ip:port' && iocType !== 'ip') continue;
		const m = row[2]?.match(IP_RE);
		if (!m) continue;
		const lookup = geoip.lookup(m[0]);
		if (!lookup?.country) continue;
		const centroid = centroidOf(lookup.country);
		if (!centroid) {
			unmapped++;
			continue;
		}
		const malware = row[7] || row[5] || 'unknown';
		const sample: IocSample = {
			ioc: row[2],
			iocType: 'ip:port',
			malware,
			firstSeen: row[0],
			iocId: row[1] || null
		};
		const b = bucketFor(byCountry, lookup.country, centroid);
		tally(b, malware, sample);
		fetched++;
	}
	return { fetched, unmapped };
}

function bucketsToDots(byCountry: Map<string, Bucket>): ThreatDot[] {
	const dots: ThreatDot[] = [];
	for (const [cc, { count, malwareTally, samples, centroid }] of byCountry) {
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
	const [feodo, threatFox, cves] = await Promise.all([
		fetchFeodo(byCountry),
		fetchThreatFox(byCountry),
		fetchCves(kev)
	]);

	return {
		dots: bucketsToDots(byCountry),
		cves,
		updatedAt: new Date().toISOString(),
		totalIocs: feodo.fetched + threatFox.fetched,
		unmappedIocs: feodo.unmapped + threatFox.unmapped,
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
