<script lang="ts">
	import Paperclip from 'phosphor-svelte/lib/Paperclip';

	type Existing = { name: string; url: string };

	type Props = {
		name?: string;
		removeFieldName?: string;
		existing?: Existing[];
		accept?: string;
		multiple?: boolean;
	};

	let {
		name = 'newAttachments',
		removeFieldName = 'removeAttachment',
		existing = [],
		accept = 'image/*',
		multiple = true
	}: Props = $props();

	let selectedNames = $state<string[]>([]);
	let removed = $state<string[]>([]);

	function onPickFiles(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		selectedNames = input.files ? Array.from(input.files).map((f) => f.name) : [];
	}

	function toggleRemoveExisting(filename: string) {
		removed = removed.includes(filename)
			? removed.filter((n) => n !== filename)
			: [...removed, filename];
	}

	async function copyMarkdown(att: Existing) {
		const md = `![${att.name}](${att.url})`;
		try {
			await navigator.clipboard.writeText(md);
		} catch {
			// ignore
		}
	}
</script>

<div class="space-y-3">
	{#if existing.length > 0}
		<div>
			<div class="text-muted-foreground mb-2 font-mono text-[10px] tracking-[0.18em] uppercase">
				기존 첨부 ({existing.length})
			</div>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
				{#each existing as att (att.name)}
					{@const isRemoved = removed.includes(att.name)}
					<div
						class="border-border/60 group relative aspect-square overflow-hidden rounded-md border bg-black/20"
						class:opacity-30={isRemoved}
					>
						<img
							src={att.url}
							alt={att.name}
							loading="lazy"
							class="h-full w-full object-cover"
							onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
						/>
						<div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 px-1.5 py-1">
							<button
								type="button"
								onclick={() => copyMarkdown(att)}
								class="text-kairos-cyan font-mono text-[9px] hover:underline"
								title="markdown 복사"
							>
								md
							</button>
							<button
								type="button"
								onclick={() => toggleRemoveExisting(att.name)}
								class="text-destructive font-mono text-[9px] hover:underline"
								title="삭제 표시"
							>
								{isRemoved ? 'undo' : 'rm'}
							</button>
						</div>
						{#if isRemoved}
							<input type="hidden" name={removeFieldName} value={att.name} />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div>
		<label
			class="border-border/60 hover:border-kairos-cyan/40 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-black/10 px-4 py-6 font-mono text-xs"
		>
			<Paperclip class="size-4" />
			<span>{multiple ? '이미지 추가 (다중 선택 가능)' : '이미지 선택'}</span>
			<input
				type="file"
				{name}
				{accept}
				{multiple}
				onchange={onPickFiles}
				class="hidden"
			/>
		</label>

		{#if selectedNames.length > 0}
			<div class="mt-2 space-y-1">
				{#each selectedNames as fname (fname)}
					<div class="rounded bg-black/20 px-2 py-1 font-mono text-[11px] text-foreground/80 truncate">
						+ {fname}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<p class="text-muted-foreground font-mono text-[10px]">
		tip: 업로드 후 상세 페이지의 갤러리에서 `md` 버튼으로 markdown 링크 복사해 본문에 인라인 삽입.
	</p>
</div>
