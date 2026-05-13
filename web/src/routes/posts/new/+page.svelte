<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import LockKey from 'phosphor-svelte/lib/LockKey';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// UI 상태 — 로그인 미구현이므로 실제 submit은 안 되지만, 폼 자체는 시각적으로 렌더
	let title = $state('');
	let categorySlug = $state('');
	let content = $state('');

	// TODO: 인증 시스템 도입 시 실제 세션에서 가져오기
	const isLoggedIn = false;

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		// 향후: PocketBase JS SDK 로 클라이언트에서 인증 후 posts collection 에 create
		alert('로그인 시스템이 아직 도입되지 않았습니다. 임시로 PocketBase 어드민 UI 에서 생성해주세요.');
	}
</script>

<svelte:head>
	<title>새 글 · KAIROS</title>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={null} />

<main class="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-16 lg:pt-40">
	<Button href="/posts" variant="ghost" size="sm" class="mb-8 font-mono">
		<ArrowLeft /> back to posts
	</Button>

	<header class="mb-8">
		<Eyebrow class="mb-4">// new post</Eyebrow>
		<h1 class="!text-4xl md:!text-5xl">글 쓰기</h1>
		<p class="text-muted-foreground mt-3 text-base">
			KAIROS 멤버라면 누구나 글을 남길 수 있습니다. 카테고리별로 작성 권한이 다릅니다.
		</p>
	</header>

	{#if !isLoggedIn}
		<Card.Root class="mb-6 relative overflow-hidden">
			<div
				class="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
				style="background: radial-gradient(circle, var(--kairos-cyan), transparent 70%)"
				aria-hidden="true"
			></div>
			<Card.Header class="relative">
				<div class="flex items-center gap-2">
					<LockKey class="text-kairos-cyan size-5" />
					<Card.Title class="font-mono text-base">로그인 필요</Card.Title>
				</div>
				<Card.Description>
					글 작성·삭제는 로그인이 필요한 작업입니다. 현재는 인증 시스템이 도입되지 않아 폼 미리보기만 제공됩니다.
				</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button href="/" variant="outline" size="sm" class="font-mono">
					home으로 돌아가기
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}

	<Card.Root>
		<form onsubmit={onSubmit}>
			<Card.Content class="space-y-5 py-6">
				<div class="space-y-2">
					<Label for="title" class="font-mono text-[11px] tracking-[0.18em] uppercase">title</Label>
					<Input
						id="title"
						bind:value={title}
						placeholder="제목을 입력하세요"
						class="h-11 text-base"
						disabled={!isLoggedIn}
					/>
				</div>

				<div class="space-y-2">
					<Label class="font-mono text-[11px] tracking-[0.18em] uppercase">category</Label>
					<div class="flex flex-wrap gap-1.5">
						{#each data.categories as c (c.id)}
							<button
								type="button"
								onclick={() => (categorySlug = c.slug)}
								disabled={!isLoggedIn}
								class="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
							>
								<Badge
									variant={categorySlug === c.slug ? 'default' : 'outline'}
									class="font-mono"
								>
									{c.name}
								</Badge>
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="content" class="font-mono text-[11px] tracking-[0.18em] uppercase">content</Label>
					<Textarea
						id="content"
						bind:value={content}
						placeholder="본문 (Markdown / HTML 지원 예정)"
						rows={12}
						class="font-mono text-sm"
						disabled={!isLoggedIn}
					/>
				</div>
			</Card.Content>

			<Separator />

			<Card.Footer class="flex items-center justify-between gap-3 pt-6">
				<span class="text-muted-foreground font-mono text-[11px]">
					{title.length} chars · {content.length} body chars
				</span>
				<div class="flex gap-2">
					<Button href="/posts" variant="ghost" size="sm" type="button" class="font-mono">cancel</Button>
					<Button type="submit" variant="default" size="sm" disabled={!isLoggedIn} class="font-mono">
						publish
					</Button>
				</div>
			</Card.Footer>
		</form>
	</Card.Root>
</main>

<SiteFooter settings={null} />
