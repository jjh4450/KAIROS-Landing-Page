<script lang="ts">
	type Props = { html: string; class?: string };
	let { html, class: extra = '' }: Props = $props();
</script>

<div
	class="prose prose-invert prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-kairos-cyan prose-strong:text-foreground prose-code:text-kairos-cyan prose-img:rounded-md max-w-none {extra}"
>
	{@html html}
</div>
