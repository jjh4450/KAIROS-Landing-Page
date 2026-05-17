<script lang="ts">
	// 호출자는 반드시 $lib/markdown 의 renderMarkdown/sanitizeHtml 로 DOMPurify 거친 결과만 전달.
	// 원본 markdown/HTML 직접 주입 금지 — XSS.
	type Props = { html: string; class?: string };
	let { html, class: extra = '' }: Props = $props();
</script>

<div
	class="prose max-w-none prose-invert prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-kairos-cyan prose-strong:text-foreground prose-code:text-kairos-cyan prose-img:rounded-md {extra}"
>
	{@html html}
</div>
