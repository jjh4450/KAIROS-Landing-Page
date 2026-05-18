import { Buffer } from 'node:buffer';
import DOMPurify from 'isomorphic-dompurify';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { stripExt } from '$lib/format';

/**
 * 업로드 이미지 server-side 검증·세정 파이프라인.
 *
 * 공격면 → 방어:
 *   - MIME 스푸핑·매직바이트 위조 → file-type 으로 실제 시그니처 sniff.
 *   - polyglot / EXIF / 숨은 페이로드  → sharp 로 WebP 재인코딩 (메타데이터 기본 폐기).
 *   - SVG XSS                         → DOMPurify SVG profile + script/use/foreignObject/
 *                                       animate/event handler/외부 URI 차단.
 *   - zip bomb / 거대 입력            → 10MB 한도. resize 2000x2000 inside.
 *
 * 출력:
 *   - raster (jpeg/png/webp/gif/avif) → `${stem}.webp`, `image/webp`.
 *     애니메이션 입력은 animated WebP 로 보존.
 *   - svg                              → `${stem}.svg`, `image/svg+xml` (sanitize 후).
 */

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIM = 2000;

const RASTER_INPUT_MIME = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/avif'
]);

export class UploadRejected extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UploadRejected';
	}
}

export async function sanitizeImageUpload(file: File): Promise<File> {
	if (file.size > MAX_BYTES) {
		throw new UploadRejected('파일이 너무 큽니다 (10MB 한도).');
	}

	const buf = Buffer.from(await file.arrayBuffer());
	// File.size 가 거짓일 가능성에 대한 2차 방어 — buffer 실측으로 재확인
	if (buf.length > MAX_BYTES) {
		throw new UploadRejected('파일이 너무 큽니다 (10MB 한도).');
	}

	if (looksLikeSvg(buf, file.type)) {
		return sanitizeSvg(buf, file.name);
	}

	const sniff = await fileTypeFromBuffer(buf);
	if (!sniff || !RASTER_INPUT_MIME.has(sniff.mime)) {
		throw new UploadRejected(`허용되지 않은 파일 타입: ${sniff?.mime ?? file.type ?? '(unknown)'}`);
	}

	let out: Buffer;
	try {
		// animated: true → GIF / animated WebP 입력의 모든 프레임 보존
		// rotate() 인자 없음 → EXIF orientation 자동 적용. 출력에 EXIF 미포함이 기본.
		out = await sharp(buf, { animated: true })
			.rotate()
			.resize({
				width: MAX_DIM,
				height: MAX_DIM,
				fit: 'inside',
				withoutEnlargement: true
			})
			.webp({ quality: 85 })
			.toBuffer();
	} catch {
		throw new UploadRejected('이미지 디코딩 실패 (손상되었거나 위조된 파일).');
	}

	const stem = stripExt(file.name) || 'image';
	return new File([new Uint8Array(out)], `${stem}.webp`, { type: 'image/webp' });
}

/**
 * SVG 감지 — file-type 는 XML 기반 SVG 의 magic byte 가 없어 감지 못함. 헤드 256B 의
 * 텍스트 시그니처로 분기시켜 raster 파이프라인 대신 DOMPurify 로 보냄.
 */
function looksLikeSvg(buf: Buffer, declaredMime: string): boolean {
	if (declaredMime === 'image/svg+xml') return true;
	const head = buf.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
	return head.startsWith('<?xml') || head.startsWith('<svg');
}

function sanitizeSvg(buf: Buffer, originalName: string): File {
	const raw = buf.toString('utf-8');

	const clean = DOMPurify.sanitize(raw, {
		USE_PROFILES: { svg: true, svgFilters: true },
		FORBID_TAGS: [
			'script',
			'foreignObject', // HTML 임베드
			'iframe',
			'object',
			'embed',
			'use', // xlink:href 로 외부 SVG 로드 가능
			'animate', // 일부 애니메이션 기반 공격 벡터
			'animateTransform',
			'set'
		],
		FORBID_ATTR: [
			'onload',
			'onerror',
			'onclick',
			'onmouseover',
			'onfocus',
			'onblur',
			'xlink:href',
			'href' // 링크 통한 navigation 차단
		],
		// data:image/ 와 fragment 만 허용 — 외부 fetch / SSRF 차단
		ALLOWED_URI_REGEXP: /^(?:data:image\/|#)/i
	});

	// DOMPurify 가 non-SVG XML 을 비우는 경우 + 입력이 처음부터 깨진 SVG 인 경우 모두 여기서 차단
	if (!clean.includes('<svg')) {
		throw new UploadRejected('유효하지 않은 SVG 입니다.');
	}

	const stem = stripExt(originalName) || 'image';
	return new File([clean], `${stem}.svg`, { type: 'image/svg+xml' });
}

export async function sanitizeFiles(form: FormData, field: string): Promise<File[]> {
	// Promise.all 로 디코딩·인코딩을 동시 진행 — sharp 가 libvips 자체 threadpool 사용
	const tasks = form
		.getAll(field)
		.filter((v): v is File => v instanceof File && v.size > 0)
		.map((v) => sanitizeImageUpload(v));
	return Promise.all(tasks);
}

/**
 * sanitizeFiles 의 try/catch 보일러플레이트를 한 곳에 모은 wrapper.
 * UploadRejected 는 사용자 노출 메시지로 살리고, 그 외 예외는 `fallback` 로 일반화.
 * fail() 객체 빌드는 호출부 책임 — 각 route 가 추가 페이로드(title, content 등)를 끼울 수 있게.
 */
export async function safeSanitizeFiles(
	form: FormData,
	field: string,
	fallback = '파일 처리 실패'
): Promise<{ ok: true; files: File[] } | { ok: false; error: string }> {
	try {
		return { ok: true, files: await sanitizeFiles(form, field) };
	} catch (err) {
		return { ok: false, error: err instanceof UploadRejected ? err.message : fallback };
	}
}

/**
 * 단일 File 용 wrapper. avatar/coverImage 등 single-file field.
 */
export async function safeSanitizeImageUpload(
	file: File | null,
	fallback = '이미지 처리 실패'
): Promise<{ ok: true; file: File | null } | { ok: false; error: string }> {
	if (!file) return { ok: true, file: null };
	try {
		return { ok: true, file: await sanitizeImageUpload(file) };
	} catch (err) {
		return { ok: false, error: err instanceof UploadRejected ? err.message : fallback };
	}
}
