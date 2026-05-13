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
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let description = $state('');
</script>

<svelte:head><title>새 입상 기록 · KAIROS</title></svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/achievements" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// new achievement</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">기록 추가</h1>
	</header>

	<Card.Root>
		<form method="POST" enctype="multipart/form-data" use:enhance>
			<Card.Content class="space-y-5 py-6">
				<div class="space-y-2">
					<FieldLabel for="title">title</FieldLabel>
					<Input id="title" name="title" required class="h-11" />
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<FieldLabel for="competition">competition</FieldLabel>
						<Input id="competition" name="competition" placeholder="e.g. CCE 2025" />
					</div>
					<div class="space-y-2">
						<FieldLabel for="rank">rank</FieldLabel>
						<Input id="rank" name="rank" placeholder="e.g. 1st, gold" />
					</div>
					<div class="space-y-2">
						<FieldLabel for="date">date</FieldLabel>
						<Input id="date" name="date" type="date" />
					</div>
					<div class="space-y-2">
						<FieldLabel for="link">link</FieldLabel>
						<Input id="link" name="link" type="url" placeholder="https://..." />
					</div>
				</div>
				<div class="space-y-2">
					<FieldLabel for="coverImage">cover image</FieldLabel>
					<Input id="coverImage" name="coverImage" type="file" accept="image/*" />
				</div>
				<div class="space-y-2">
					<FieldLabel for="members">members (user id, 쉼표 구분)</FieldLabel>
					<Input id="members" name="members" placeholder="userId1, userId2" />
				</div>
				<div class="space-y-2">
					<FieldLabel for="description">description (markdown)</FieldLabel>
					<MarkdownEditor name="description" bind:value={description} />
				</div>

				{#if form?.error}
					<p class="text-destructive font-mono text-sm">{form.error}</p>
				{/if}
			</Card.Content>
			<Separator />
			<Card.Footer class="flex justify-end gap-2 pt-6">
				<Button href="/achievements" variant="ghost" size="sm" type="button" class="font-mono">cancel</Button>
				<Button type="submit" size="sm" class="font-mono">create</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</main>

<SiteFooter settings={null} />
