import DOMPurify from 'isomorphic-dompurify';

/**
 * 업로드 파일 화이트리스트 + SVG sanitize.
 *
 * - 허용 MIME 5종 (raster 4 + SVG). 그 외는 reject.
 * - SVG 는 DOMPurify SVG profile 로 sanitize. <script>, event handler, foreignObject,
 *   외부 리소스 참조 제거. 결과를 동일 이름의 새 File 로 반환.
 * - PB 스키마(`mimeTypes`) 와 이중 방어. PB 가 막더라도 SK 단에서 먼저 차단.
 */

export const ALLOWED_IMAGE_MIME = new Set([
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
	'image/svg+xml'
]);

export class UploadRejected extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UploadRejected';
	}
}

/**
 * 단일 File 검증·세정.
 * MIME 거부 시 UploadRejected throw. SVG 면 sanitize 한 새 File 반환, 그 외는 원본 그대로.
 */
export async function sanitizeImageUpload(file: File): Promise<File> {
	if (!ALLOWED_IMAGE_MIME.has(file.type)) {
		throw new UploadRejected(`허용되지 않은 파일 타입: ${file.type || '(unknown)'}`);
	}

	if (file.type !== 'image/svg+xml') {
		return file;
	}

	const raw = await file.text();
	const clean = DOMPurify.sanitize(raw, {
		USE_PROFILES: { svg: true, svgFilters: true },
		FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'object', 'embed'],
		FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
		// 외부 리소스 참조 차단: data: 만 허용 (외부 fetch / SSRF 방지)
		ALLOWED_URI_REGEXP: /^(?:data:image\/|#)/i
	});

	return new File([clean], file.name, { type: 'image/svg+xml' });
}

/**
 * FormData 의 특정 field 에서 File 들을 꺼내 sanitize. 빈 파일은 스킵.
 */
export async function sanitizeFiles(form: FormData, field: string): Promise<File[]> {
	const out: File[] = [];
	for (const v of form.getAll(field)) {
		if (v instanceof File && v.size > 0) {
			out.push(await sanitizeImageUpload(v));
		}
	}
	return out;
}

/**
 * FormData 단일 file field 헬퍼. 없으면 null.
 */
export async function sanitizeFile(form: FormData, field: string): Promise<File | null> {
	const v = form.get(field);
	if (!(v instanceof File) || v.size === 0) return null;
	return sanitizeImageUpload(v);
}
