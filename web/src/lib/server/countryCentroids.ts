/**
 * Alpha-2 ISO 코드 → [lon, lat] 중심점 lookup.
 *
 * 구현: world-atlas/countries-110m TopoJSON 의 각 국가 feature 에 대해
 * d3-geo.geoCentroid 로 중심점을 계산하고, ISO numeric → alpha-2 매핑으로
 * 키를 만든다. 모듈 로드 시 1회 수행 (server-only).
 *
 * countries-110m 가 표시하지 않는 군소 영토(예: 일부 의존지역, 마이크로국가)는
 * 매핑되지 않아 lookup miss 가 가능 — getThreatFeed 가 unmappedIocs 로 카운팅.
 */
import { feature } from 'topojson-client';
import { geoCentroid } from 'd3-geo';
import worldData from 'world-atlas/countries-110m.json';
import { NUMERIC_TO_ALPHA2 } from './isoNumericToAlpha2';
import type { Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

const topology = worldData as unknown as Topology;
const fc = feature(
	topology,
	topology.objects.countries as never
) as unknown as FeatureCollection<Geometry, { name: string }>;

const CENTROIDS: Record<string, [number, number]> = {};

for (const f of fc.features as Feature<Geometry, { name: string }>[]) {
	const numericId = String(f.id ?? '').padStart(3, '0');
	const alpha2 = NUMERIC_TO_ALPHA2[numericId];
	if (!alpha2) continue;
	const c = geoCentroid(f);
	if (!Number.isFinite(c[0]) || !Number.isFinite(c[1])) continue;
	CENTROIDS[alpha2] = [c[0], c[1]];
}

export function centroidOf(alpha2: string | null | undefined): [number, number] | null {
	if (!alpha2) return null;
	return CENTROIDS[alpha2.toUpperCase()] ?? null;
}

export function knownCountryCount(): number {
	return Object.keys(CENTROIDS).length;
}
