import satori from 'satori';
import { html as toSatoriNode } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from './$types';
import { SITE } from '$lib/seo';

export const prerender = false;

const FONT_PATHS = ['/fonts/Pretendard-Bold.otf', '/fonts/Pretendard-Regular.otf'] as const;

let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;

async function fetchFont(fetch: typeof globalThis.fetch, path: string) {
	const r = await fetch(path);
	if (!r.ok) throw new Error(`font fetch ${path} → ${r.status}`);
	return r.arrayBuffer();
}

function loadFonts(fetch: typeof globalThis.fetch) {
	// reject 가 캐시되면 영구 실패하므로 실패 시 캐시를 비워 다음 요청에서 재시도 가능.
	fontsPromise ??= Promise.all([
		fetchFont(fetch, FONT_PATHS[0]),
		fetchFont(fetch, FONT_PATHS[1])
	]).catch((e) => {
		fontsPromise = null;
		throw e;
	});
	return fontsPromise;
}

function clamp(s: string, max: number) {
	if (s.length <= max) return s;
	return s.slice(0, max - 1) + '…';
}

export const GET: RequestHandler = async ({ url, setHeaders, fetch }) => {
	const title = clamp(url.searchParams.get('t')?.trim() || SITE.name, 80);
	const description = clamp(url.searchParams.get('d')?.trim() || SITE.tagline, 140);

	const [fontBold, fontRegular] = await loadFonts(fetch);

	const outer =
		'display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px 80px;background:#08080c;font-family:Pretendard;color:#fff;position:relative;overflow:hidden;';
	const blob =
		'display:flex;position:absolute;top:-200px;right:-120px;width:720px;height:720px;border-radius:9999px;background:linear-gradient(135deg,#67e8f9 0%,#8b5cf6 55%,#ec4899 100%);filter:blur(40px);opacity:0.55;';
	const topRow = 'display:flex;align-items:center;gap:14px;';
	const mark =
		'display:flex;width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#67e8f9,#8b5cf6 60%,#ec4899);';
	const wordmark = 'display:flex;font-size:22px;letter-spacing:0.18em;font-weight:700;color:#fff;';
	const mid = 'display:flex;flex-direction:column;gap:18px;';
	const titleStyle =
		'display:flex;font-size:68px;line-height:1.15;font-weight:800;color:#fff;letter-spacing:-0.01em;';
	const descStyle =
		'display:flex;font-size:28px;line-height:1.45;color:rgba(255,255,255,0.78);font-weight:400;';
	const footRow =
		'display:flex;align-items:center;justify-content:space-between;font-size:18px;color:rgba(255,255,255,0.55);font-family:Pretendard;';
	const footLeft = 'display:flex;';
	const footRight = 'display:flex;letter-spacing:0.2em;';

	const markup = toSatoriNode(
		`<div style="${outer}">` +
			`<div style="${blob}"></div>` +
			`<div style="${topRow}"><div style="${mark}"></div><div style="${wordmark}">${escapeHtml(SITE.name)}_</div></div>` +
			`<div style="${mid}"><div style="${titleStyle}">${escapeHtml(title)}</div><div style="${descStyle}">${escapeHtml(description)}</div></div>` +
			`<div style="${footRow}"><div style="${footLeft}">${escapeHtml(SITE.tagline)}</div><div style="${footRight}">// EST. 2026</div></div>` +
			`</div>`
	);

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: 'Pretendard', data: fontBold, weight: 700, style: 'normal' },
			{ name: 'Pretendard', data: fontRegular, weight: 400, style: 'normal' }
		]
	});

	const png = new Resvg(svg).render().asPng();
	const body = new Uint8Array(png);

	setHeaders({
		'content-type': 'image/png',
		'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
	});

	return new Response(body);
};

const HTML_ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c);
}
