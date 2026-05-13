<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>계정 · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} user={data.user} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<header class="mb-8">
		<Eyebrow class="mb-4">// account</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">계정</h1>
	</header>

	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title class="font-mono text-base">프로필</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3 pb-6">
			<div class="grid grid-cols-3 gap-2">
				<span class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
					>email</span
				>
				<span class="col-span-2 font-mono text-sm">{data.user?.email}</span>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<span class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
					>nickname</span
				>
				<span class="col-span-2 font-mono text-sm">{data.user?.nickname ?? '—'}</span>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<span class="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
					>role</span
				>
				<span class="col-span-2">
					<Badge variant="outline" class="font-mono">{data.user?.role}</Badge>
				</span>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="font-mono text-base">비밀번호 변경</Card.Title>
			<Card.Description>새 비밀번호는 8자 이상이어야 합니다.</Card.Description>
		</Card.Header>
		<form method="POST" action="?/changePassword" use:enhance>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="oldPassword" class="font-mono text-[11px] tracking-[0.18em] uppercase"
						>current password</Label
					>
					<Input id="oldPassword" name="oldPassword" type="password" required />
				</div>
				<div class="space-y-2">
					<Label for="password" class="font-mono text-[11px] tracking-[0.18em] uppercase"
						>new password</Label
					>
					<Input id="password" name="password" type="password" required minlength={8} />
				</div>
				<div class="space-y-2">
					<Label for="passwordConfirm" class="font-mono text-[11px] tracking-[0.18em] uppercase"
						>confirm new</Label
					>
					<Input
						id="passwordConfirm"
						name="passwordConfirm"
						type="password"
						required
						minlength={8}
					/>
				</div>
				{#if form?.error}
					<p class="font-mono text-sm text-destructive">{form.error}</p>
				{/if}
				{#if form?.success}
					<p class="font-mono text-sm text-kairos-cyan">{form.success}</p>
				{/if}
			</Card.Content>
			<Separator />
			<Card.Footer class="flex justify-end pt-6">
				<Button type="submit" size="sm" class="font-mono">save</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</main>

<SiteFooter settings={null} />
