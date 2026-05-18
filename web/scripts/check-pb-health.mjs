#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadDotenv(file) {
	const path = resolve(root, file);
	if (!existsSync(path)) return {};
	const out = {};
	for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
		if (!m) continue;
		let v = m[2];
		if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
			v = v.slice(1, -1);
		}
		out[m[1]] = v;
	}
	return out;
}

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = {
	...loadDotenv('.env'),
	...loadDotenv(`.env.${mode}`),
	...loadDotenv('.env.local'),
	...loadDotenv(`.env.${mode}.local`),
	...process.env
};

const url = env.PUBLIC_PB_URL;
if (!url) {
	console.error('[pb-health] PUBLIC_PB_URL is not set — refusing to build.');
	process.exit(1);
}

const healthUrl = `${url.replace(/\/+$/, '')}/api/health`;
console.log(`[pb-health] checking ${healthUrl}`);

const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 10_000);

try {
	const res = await fetch(healthUrl, { signal: ctrl.signal });
	if (!res.ok) {
		console.error(`[pb-health] HTTP ${res.status} ${res.statusText}`);
		process.exit(1);
	}
	const body = await res.json();
	if (body?.code !== 200) {
		console.error(`[pb-health] unexpected payload: ${JSON.stringify(body)}`);
		process.exit(1);
	}
	console.log(`[pb-health] OK — ${body.message ?? 'healthy'}`);
} catch (e) {
	console.error(`[pb-health] failed to reach ${healthUrl}: ${e?.message ?? e}`);
	process.exit(1);
} finally {
	clearTimeout(timer);
}
