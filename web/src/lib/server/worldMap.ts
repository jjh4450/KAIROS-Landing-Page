import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import worldData from 'world-atlas/countries-110m.json';
import type { Topology } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 420;

const projection = geoNaturalEarth1()
	.scale(WORLD_WIDTH / 5.5)
	.translate([WORLD_WIDTH / 2, WORLD_HEIGHT / 2]);

const path = geoPath(projection);

const topology = worldData as unknown as Topology;
const fc = feature(
	topology,
	topology.objects.countries as never
) as unknown as FeatureCollection<Geometry, { name: string }>;

export const WORLD_PATHS: string[] = fc.features
	.map((f: Feature<Geometry, { name: string }>) => path(f) ?? '')
	.filter(Boolean);

export function project(lon: number, lat: number): [number, number] | null {
	const p = projection([lon, lat]);
	if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
	return [p[0], p[1]];
}
