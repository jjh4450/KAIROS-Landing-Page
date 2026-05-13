<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Trash from 'phosphor-svelte/lib/Trash';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const a = $derived(data.item);

	let title = $state(a.title);
	let competition = $state(a.competition ?? '');
	let rank = $state(a.rank ?? '');
	let date = $state(a.date ?? '');
	let link = $state(a.link ?? '');
	let description = $state(a.description ?? '');
	let membersCsv = $state((a.members ?? []).join(', '));
</script>

<svelte:head><title>편집 · {a.title}</title></svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href={`/achievements/${a.id}`} variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// edit achievement</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">기록 수정</h1>
	</header>

	<Card.Root>
		<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance>
			<Card.Content class="space-y-5 py-6">
				<div class="space-y-2">
					<FieldLabel for="title">title</FieldLabel>
					<Input id="title" name="title" bind:value={title} class="h-11" />
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<FieldLabel for="competition">competition</FieldLabel>
						<Input id="competition" name="competition" bind:value={competition} />
					</div>
					<div class="space-y-2">
						<FieldLabel for="rank">rank</FieldLabel>
						<Input id="rank" name="rank" bind:value={rank} />
					</div>
					<div class="space-y-2">
						<FieldLabel for="date">date</FieldLabel>
						<Input id="date" name="date" type="date" bind:value={date} />
					</div>
					<div class="space-y-2">
						<FieldLabel for="link">link</FieldLabel>
						<Input id="link" name="link" type="url" bind:value={link} />
					</div>
				</div>
				<div class="space-y-2">
					<FieldLabel>cover image</FieldLabel>
					{#if data.coverUrl}
						<img
							src={data.coverUrl}
							alt="cover"
							class="mb-2 max-h-40 rounded-md border border-border/60"
						/>
						<label class="flex items-center gap-2 font-mono text-xs">
							<input type="checkbox" name="removeCover" />
							<span>현재 cover 제거</span>
						</label>
					{/if}
					<Input name="coverImage" type="file" accept="image/*" />
				</div>
				<div class="space-y-2">
					<FieldLabel for="members">members (user id, 쉼표 구분)</FieldLabel>
					<Input id="members" name="members" bind:value={membersCsv} />
				</div>
				<div class="space-y-2">
					<FieldLabel>description (markdown)</FieldLabel>
					<MarkdownEditor name="description" bind:value={description} />
				</div>

				{#if form?.error}
					<p class="font-mono text-sm text-destructive">{form.error}</p>
				{/if}
			</Card.Content>
			<Separator />
			<Card.Footer class="flex justify-end gap-2 pt-6">
				<Button
					href={`/achievements/${a.id}`}
					variant="ghost"
					size="sm"
					type="button"
					class="font-mono">cancel</Button
				>
				<Button type="submit" size="sm" class="font-mono">save</Button>
			</Card.Footer>
		</form>
	</Card.Root>

	{#if data.canDelete}
		<Separator class="my-10" />
		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(e) => {
				if (!confirm('정말 삭제하시겠습니까?')) e.preventDefault();
			}}
		>
			<Button type="submit" variant="ghost" size="sm" class="font-mono text-destructive">
				<Trash /> delete
			</Button>
		</form>
	{/if}
</main>

<SiteFooter settings={null} />
