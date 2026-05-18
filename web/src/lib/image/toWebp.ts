/**
 * 브라우저에서 업로드 직전 이미지 → WebP 변환 (lossy 85%, max 2000px inside).
 *
 * 일상 사용 한정 — 대역폭/저장공간 절감 목적. 클라이언트 변환은 우회 가능하므로
 * 보안 sanitize 가 아님. SVG/GIF 는 변환하지 않고 그대로 (각각 텍스트·애니메이션 보존).
 */

const MAX_DIM = 2000;
const QUALITY = 0.85;

// 변환하지 않고 통과시키는 MIME — 변환이 정보 손실을 일으키는 포맷
const PASSTHROUGH_MIME = new Set(['image/svg+xml', 'image/gif', 'image/webp']);

export async function fileToWebp(file: File): Promise<File> {
	if (!file.type.startsWith('image/') || PASSTHROUGH_MIME.has(file.type)) {
		return file;
	}

	const url = URL.createObjectURL(file);
	try {
		const img = await loadImage(url);
		const { width, height } = fitInside(img.naturalWidth, img.naturalHeight, MAX_DIM);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return file;
		ctx.drawImage(img, 0, 0, width, height);

		const blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
		if (!blob) return file;

		const stem = stripExt(file.name) || 'image';
		return new File([blob], `${stem}.webp`, { type: 'image/webp' });
	} catch {
		// 디코딩 실패 시 원본 그대로 — 서버에서 처리 (또는 거부) 위임
		return file;
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * FormData 의 지정 field 안 모든 File 을 WebP 로 치환. 빈 파일/비-File 은 그대로.
 *
 *   await convertImageFields(formData, ['newAttachments', 'coverImage']);
 */
export async function convertImageFields(form: FormData, fields: string[]): Promise<void> {
	for (const field of fields) {
		const values = form.getAll(field);
		if (values.length === 0) continue;

		form.delete(field);
		for (const v of values) {
			if (v instanceof File && v.size > 0) {
				form.append(field, await fileToWebp(v));
			} else {
				form.append(field, v);
			}
		}
	}
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('image decode failed'));
		img.src = url;
	});
}

function canvasToBlob(
	canvas: HTMLCanvasElement,
	type: string,
	quality: number
): Promise<Blob | null> {
	return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function fitInside(w: number, h: number, max: number): { width: number; height: number } {
	if (w <= max && h <= max) return { width: w, height: h };
	const r = Math.min(max / w, max / h);
	return { width: Math.round(w * r), height: Math.round(h * r) };
}

function stripExt(name: string): string {
	const i = name.lastIndexOf('.');
	return i > 0 ? name.slice(0, i) : name;
}
