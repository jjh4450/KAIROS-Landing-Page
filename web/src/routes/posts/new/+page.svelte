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
	import { convertImageFields } from '$lib/image/toWebp';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let title = $state('');
	let categoryId = $state('');
	let content = $state('');
	let isPrivate = $state(false);
</script>

<svelte:head>
	<title>새 글 · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/posts" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to posts
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// new post</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">글 쓰기</h1>
		<p class="mt-3 text-base text-muted-foreground">
			KAIROS 멤버라면 누구나 글을 남길 수 있습니다. 본문은 Markdown을 지원합니다.
		</p>
	</header>

	<Card.Root>
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={async ({ formData }) => {
				await convertImageFields(formData, ['newAttachments']);
			}}
		>
			<input type="hidden" name="categoryId" value={categoryId} />
			<Card.Content class="space-y-5 py-6">
				<div class="space-y-2">
					<FieldLabel for="title">title</FieldLabel>
					<Input
						id="title"
						name="title"
						bind:value={title}
						placeholder="제목을 입력하세요"
						class="h-11 text-base"
					/>
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
					<AttachmentUploader />
				</div>

				<label class="flex items-center gap-2 font-mono text-xs">
					<input type="checkbox" name="isPrivate" bind:checked={isPrivate} />
					<span>비공개 — 로그인 사용자에게만 표시</span>
				</label>

				{#if form?.error}
					<p class="font-mono text-sm text-destructive">{form.error}</p>
				{/if}
			</Card.Content>

			<Separator />

			<Card.Footer class="flex items-center justify-between gap-3 pt-6">
				<span class="font-mono text-[11px] text-muted-foreground">
					{title.length} chars · {content.length} body chars
				</span>
				<div class="flex gap-2">
					<Button href="/posts" variant="ghost" size="sm" type="button" class="font-mono"
						>cancel</Button
					>
					<Button type="submit" variant="default" size="sm" class="font-mono">publish</Button>
				</div>
			</Card.Footer>
		</form>
	</Card.Root>
</main>

<SiteFooter settings={null} />
