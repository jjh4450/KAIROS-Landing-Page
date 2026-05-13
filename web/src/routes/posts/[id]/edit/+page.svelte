<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import AttachmentUploader from '$lib/components/AttachmentUploader.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Trash from 'phosphor-svelte/lib/Trash';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let title = $state(data.post.title);
	let categoryId = $state(data.post.category);
	let content = $state(data.post.content);
	let isPrivate = $state(!!data.post.isPrivate);
</script>

<svelte:head>
	<title>편집 · {data.post.title} · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href={`/posts/${data.post.id}`} variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to post
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// edit post</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">글 수정</h1>
	</header>

	<Card.Root>
		<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance>
			<input type="hidden" name="categoryId" value={categoryId} />
			<Card.Content class="space-y-5 py-6">
				<div class="space-y-2">
					<FieldLabel for="title">title</FieldLabel>
					<Input id="title" name="title" bind:value={title} class="h-11 text-base" />
				</div>

				<div class="space-y-2">
					<FieldLabel>category</FieldLabel>
					<div class="flex flex-wrap gap-1.5">
						{#each data.categories as c (c.id)}
							<button type="button" onclick={() => (categoryId = c.id)} class="cursor-pointer">
								<Badge variant={categoryId === c.id ? 'default' : 'outline'} class="font-mono">
									{c.name}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<FieldLabel for="content">content (markdown)</FieldLabel>
					<MarkdownEditor bind:value={content} />
				</div>

				<div class="space-y-2">
					<FieldLabel>attachments</FieldLabel>
					<AttachmentUploader existing={data.attachments} />
				</div>

				<label class="flex items-center gap-2 font-mono text-xs">
					<input type="checkbox" name="isPrivate" bind:checked={isPrivate} />
					<span>비공개</span>
				</label>

				{#if form?.error}
					<p class="font-mono text-sm text-destructive">{form.error}</p>
				{/if}
			</Card.Content>

			<Separator />

			<Card.Footer class="flex items-center justify-between gap-3 pt-6">
				<span class="font-mono text-[11px] text-muted-foreground">
					{content.length} body chars
				</span>
				<div class="flex gap-2">
					<Button
						href={`/posts/${data.post.id}`}
						variant="ghost"
						size="sm"
						type="button"
						class="font-mono"
					>
						cancel
					</Button>
					<Button type="submit" variant="default" size="sm" class="font-mono">save</Button>
				</div>
			</Card.Footer>
		</form>
	</Card.Root>

	<Separator class="my-10" />

	{#if data.canDelete}
		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(e) => {
				if (!confirm('정말 삭제하시겠습니까? 되돌릴 수 없습니다.')) e.preventDefault();
			}}
		>
			<Button type="submit" variant="ghost" size="sm" class="font-mono text-destructive">
				<Trash /> delete post
			</Button>
		</form>
	{/if}
</main>

<SiteFooter settings={null} />
