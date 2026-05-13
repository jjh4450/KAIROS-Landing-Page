<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import AuthShell from '$lib/components/AuthShell.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const id = $props.id();
</script>

<svelte:head>
	<title>비밀번호 재설정 · KAIROS</title>
</svelte:head>

<AuthShell>
	<Card.Root class="glass">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">비밀번호 재설정</Card.Title>
			<Card.Description>가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.sent}
				<p class="text-muted-foreground py-4 text-center text-sm">
					메일을 보냈습니다. 받은편지함을 확인해주세요.
				</p>
			{:else}
				<form method="POST" use:enhance>
					<FieldGroup>
						<Field>
							<FieldLabel for="email-{id}">Email</FieldLabel>
							<Input
								id="email-{id}"
								name="email"
								type="email"
								placeholder="you@kairos.dev"
								required
							/>
						</Field>
						{#if form?.error}
							<p class="text-destructive font-mono text-sm">{form.error}</p>
						{/if}
						<Field>
							<Button type="submit">재설정 메일 보내기</Button>
						</Field>
					</FieldGroup>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>

	{#snippet footer()}
		<FieldDescription class="px-6 text-center">
			<a href="/login" class="underline">로그인으로 돌아가기</a>
		</FieldDescription>
	{/snippet}
</AuthShell>
