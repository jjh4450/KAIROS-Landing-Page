import { Buffer } from 'node:buffer';
import DOMPurify from 'isomorphic-dompurify';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

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

export const ALLOWED_IMAGE_MIME = new Set<string>([...RASTER_INPUT_MIME, 'image/svg+xml']);

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
	if (buf.length > MAX_BYTES) {
		throw new UploadRejected('파일이 너무 큽니다 (10MB 한도).');
	}

	// SVG 는 텍스트 기반이라 file-type 이 누락될 수 있음 — 텍스트 시그니처 우선 검사
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

function looksLikeSvg(buf: Buffer, declaredMime: string): boolean {
	if (declaredMime === 'image/svg+xml') return true;
	const head = buf.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
	return head.startsWith('<?xml') || head.startsWith('<svg');
}

function sanitizeSvg(buf: Buffer, originalName: string): File {
	const raw = buf.toString('utf-8');
	if (!raw.includes('<svg')) {
		throw new UploadRejected('유효하지 않은 SVG 입니다.');
	}

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

	if (!clean.includes('<svg')) {
		throw new UploadRejected('SVG sanitize 결과가 비어 있습니다.');
	}

	const stem = stripExt(originalName) || 'image';
	return new File([clean], `${stem}.svg`, { type: 'image/svg+xml' });
}

function stripExt(name: string): string {
	const i = name.lastIndexOf('.');
	return i > 0 ? name.slice(0, i) : name;
}

export async function sanitizeFiles(form: FormData, field: string): Promise<File[]> {
	const out: File[] = [];
	for (const v of form.getAll(field)) {
		if (v instanceof File && v.size > 0) {
			out.push(await sanitizeImageUpload(v));
		}
	}
	return out;
}

export async function sanitizeFile(form: FormData, field: string): Promise<File | null> {
	const v = form.get(field);
	if (!(v instanceof File) || v.size === 0) return null;
	return sanitizeImageUpload(v);
}
