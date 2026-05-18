<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import { TRACKS } from '$lib/memberOptions';
	import { convertImageFields } from '$lib/image/toWebp';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Trash from 'phosphor-svelte/lib/Trash';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const m = $derived(data.member);

	let displayName = $state(data.member?.displayName ?? '');
	let realName = $state(data.member?.realName ?? '');
	let year = $state(data.member?.year ?? '');
	let bio = $state(data.member?.bio ?? '');
	let githubUrl = $state(data.member?.githubUrl ?? '');
	let blogUrl = $state(data.member?.blogUrl ?? '');
	let linkedinUrl = $state(data.member?.linkedinUrl ?? '');
	let twitterUrl = $state(data.member?.twitterUrl ?? '');
	let personalUrl = $state(data.member?.personalUrl ?? '');
	let publicProfile = $state(data.member?.publicProfile ?? false);
	let tracks = $state<string[]>(data.member?.tracks ?? []);

	function toggleTrack(t: string) {
		tracks = tracks.includes(t) ? tracks.filter((x) => x !== t) : [...tracks, t];
	}

	const YEAR_OPTIONS = (() => {
		const now = new Date().getFullYear();
		return Array.from({ length: 11 }, (_, i) => now - i);
	})();
</script>

<svelte:head><title>내 프로필 · KAIROS</title></svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/members" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to roster
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// my profile</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">{m ? '프로필 편집' : '프로필 생성'}</h1>
		<p class="mt-3 text-base text-muted-foreground">
			공개 옵션을 켜야 /members 명단에 표시됩니다. 본인만 수정할 수 있습니다.
		</p>
	</header>

	<Card.Root>
		<form
			method="POST"
			action="?/save"
			enctype="multipart/form-data"
			use:enhance={async ({ formData }) => {
				await convertImageFields(formData, ['avatar']);
			}}
		>
			{#each tracks as t (t)}
				<input type="hidden" name="tracks" value={t} />
			{/each}

			<Card.Content class="space-y-5 py-6">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<FieldLabel for="displayName">display name</FieldLabel>
						<Input id="displayName" name="displayName" bind:value={displayName} />
					</div>
					<div class="space-y-2">
						<FieldLabel for="realName">real name (선택)</FieldLabel>
						<Input id="realName" name="realName" bind:value={realName} />
					</div>
					<div class="space-y-2">
						<FieldLabel>position</FieldLabel>
						<div class="flex h-9 items-center">
							<Badge variant="outline" class="font-mono">{m?.position ?? 'member'}</Badge>
						</div>
					</div>
					<div class="space-y-2">
						<FieldLabel for="year">year (입학년도)</FieldLabel>
						<select
							id="year"
							name="year"
							bind:value={year}
							class="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
						>
							<option value="">—</option>
							{#each YEAR_OPTIONS as y (y)}
								<option value={y}>{y}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<FieldLabel>tracks (최대 5)</FieldLabel>
					<div class="flex flex-wrap gap-1.5">
						{#each TRACKS as t (t)}
							<button type="button" onclick={() => toggleTrack(t)} class="cursor-pointer">
								<Badge variant={tracks.includes(t) ? 'default' : 'outline'} class="font-mono"
									>{t}</Badge
								>
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<FieldLabel>avatar</FieldLabel>
					{#if data.avatarUrl}
						<img
							src={data.avatarUrl}
							alt="avatar"
							class="mb-2 size-20 rounded-full border border-border/60 object-cover"
						/>
						<label class="flex items-center gap-2 font-mono text-xs">
							<input type="checkbox" name="removeAvatar" />
							<span>현재 아바타 제거</span>
						</label>
					{/if}
					<Input name="avatar" type="file" accept="image/*" />
				</div>

				<div class="space-y-2">
					<FieldLabel>bio (markdown)</FieldLabel>
					<MarkdownEditor name="bio" bind:value={bio} rows={8} />
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<FieldLabel class="!text-[10px] !tracking-normal">github</FieldLabel>
						<Input name="githubUrl" type="url" bind:value={githubUrl} />
					</div>
					<div class="space-y-1.5">
						<FieldLabel class="!text-[10px] !tracking-normal">blog</FieldLabel>
						<Input name="blogUrl" type="url" bind:value={blogUrl} />
					</div>
					<div class="space-y-1.5">
						<FieldLabel class="!text-[10px] !tracking-normal">linkedin</FieldLabel>
						<Input name="linkedinUrl" type="url" bind:value={linkedinUrl} />
					</div>
					<div class="space-y-1.5">
						<FieldLabel class="!text-[10px] !tracking-normal">twitter</FieldLabel>
						<Input name="twitterUrl" type="url" bind:value={twitterUrl} />
					</div>
					<div class="space-y-1.5 sm:col-span-2">
						<FieldLabel class="!text-[10px] !tracking-normal">personal site</FieldLabel>
						<Input name="personalUrl" type="url" bind:value={personalUrl} />
					</div>
				</div>

				<label class="flex items-center gap-2 font-mono text-xs">
					<input type="checkbox" name="publicProfile" bind:checked={publicProfile} />
					<span>공개 — /members 명단에 표시</span>
				</label>

				{#if form?.error}
					<p class="font-mono text-sm text-destructive">{form.error}</p>
				{/if}
			</Card.Content>
			<Separator />
			<Card.Footer class="flex justify-end gap-2 pt-6">
				<Button href="/members" variant="ghost" size="sm" type="button" class="font-mono"
					>cancel</Button
				>
				<Button type="submit" size="sm" class="font-mono">{m ? 'save' : 'create'}</Button>
			</Card.Footer>
		</form>
	</Card.Root>

	{#if m}
		<Separator class="my-10" />
		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(e) => {
				if (!confirm('정말 프로필을 삭제하시겠습니까?')) e.preventDefault();
			}}
		>
			<Button type="submit" variant="ghost" size="sm" class="font-mono text-destructive">
				<Trash /> delete my profile
			</Button>
		</form>
	{/if}
</main>

<SiteFooter settings={null} />
