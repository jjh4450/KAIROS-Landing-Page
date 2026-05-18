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

// Vercel·CI 등 배포 환경에선 process.env 에 이미 주입돼 있음 — 그쪽이 최우선.
// 로컬 개발 편의를 위해 .env / .env.local 도 폴백으로 읽음 (Vite 와 동일한 우선순위).
function resolveEnv(name) {
	if (process.env[name]) return process.env[name];
	const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
	for (const file of [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env']) {
		const v = loadDotenv(file)[name];
		if (v) return v;
	}
	return undefined;
}

const url = resolveEnv('PUBLIC_PB_URL');
if (!url) {
	console.error('[pb-health] PUBLIC_PB_URL is not set — refusing to build.');
	process.exit(1);
}

const source = process.env.PUBLIC_PB_URL ? 'process.env' : '.env';
console.log(`[pb-health] PUBLIC_PB_URL = ${url}  (source: ${source})`);

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
