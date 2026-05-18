/**
 * 사이트 전체에서 공유하는 포매팅 헬퍼.
 */

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = DAY * 7;

export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function excerpt(content: string, max = 140): string {
	const t = stripHtml(content);
	return t.length > max ? t.slice(0, max).trim() + '…' : t;
}

/**
 * "방금" / "N분 전" / "N시간 전" / "N일 전" / 그 이상은 짧은 한국어 날짜.
 */
export function fmtRelative(input: string | Date): string {
	const dt = typeof input === 'string' ? new Date(input) : input;
	const diff = (Date.now() - dt.getTime()) / 1000;
	if (diff < MINUTE) return '방금';
	if (diff < HOUR) return Math.floor(diff / MINUTE) + '분 전';
	if (diff < DAY) return Math.floor(diff / HOUR) + '시간 전';
	if (diff < WEEK) return Math.floor(diff / DAY) + '일 전';
	return fmtShortDate(dt);
}

export function fmtShortDate(input: string | Date): string {
	const dt = typeof input === 'string' ? new Date(input) : input;
	return dt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function fmtNumericDate(input: string | Date): string {
	const dt = typeof input === 'string' ? new Date(input) : input;
	return dt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

export function fmtLongDateTime(input: string | Date): string {
	const dt = typeof input === 'string' ? new Date(input) : input;
	return dt.toLocaleString('ko-KR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function fmtYear(input?: string | Date): string {
	if (!input) return '—';
	const dt = typeof input === 'string' ? new Date(input) : input;
	return String(dt.getFullYear());
}

/**
 * 파일명에서 마지막 확장자를 제거. `a.b.png` → `a.b`, `noext` → `noext`.
 */
export function stripExt(name: string): string {
	const i = name.lastIndexOf('.');
	return i > 0 ? name.slice(0, i) : name;
}
