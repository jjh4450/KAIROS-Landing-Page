<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import MarkdownView from '$lib/components/MarkdownView.svelte';
	import { renderMarkdown } from '$lib/markdown';

	type Props = {
		name?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		id?: string;
	};

	let {
		name = 'content',
		value = $bindable(''),
		placeholder = '본문 (Markdown 지원 — # 제목, **굵게**, `code`, ![이미지](url) ...)',
		rows = 14,
		id = 'content'
	}: Props = $props();

	let tab = $state<'write' | 'preview'>('write');
	const preview = $derived(renderMarkdown(value));
</script>

<div class="space-y-2">
	<div class="flex items-center gap-1">
		<Button
			type="button"
			variant={tab === 'write' ? 'default' : 'ghost'}
			size="sm"
			class="font-mono text-[11px]"
			onclick={() => (tab = 'write')}
		>
			write
		</Button>
		<Button
			type="button"
			variant={tab === 'preview' ? 'default' : 'ghost'}
			size="sm"
			class="font-mono text-[11px]"
			onclick={() => (tab = 'preview')}
		>
			preview
		</Button>
	</div>

	{#if tab === 'write'}
		<Textarea
			{id}
			{name}
			bind:value
			{placeholder}
			{rows}
			class="font-mono text-sm"
		/>
	{:else}
		<input type="hidden" {name} {value} />
		<div class="border-border bg-card/40 rounded-md border p-4 text-sm">
			{#if value.trim()}
				<MarkdownView html={preview} />
			{:else}
				<p class="text-muted-foreground font-mono">(미리보기 — 본문을 입력하세요)</p>
			{/if}
		</div>
	{/if}
</div>
