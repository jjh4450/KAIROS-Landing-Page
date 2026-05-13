import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ gfm: true, breaks: true });

const SANITIZE_CONFIG = {
	FORBID_TAGS: ['style', 'iframe', 'form', 'object', 'embed', 'script'],
	FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
	ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#|data:image\/)/i
};

export function renderMarkdown(src: string | null | undefined): string {
	if (!src) return '';
	const raw = marked.parse(src, { async: false }) as string;
	return DOMPurify.sanitize(raw, SANITIZE_CONFIG);
}

export function sanitizeHtml(html: string | null | undefined): string {
	if (!html) return '';
	return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
