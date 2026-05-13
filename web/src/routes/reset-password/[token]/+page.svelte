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
	<title>새 비밀번호 설정 · KAIROS</title>
</svelte:head>

<AuthShell>
	<Card.Root class="glass">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">새 비밀번호 설정</Card.Title>
			<Card.Description>새 비밀번호는 8자 이상.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<FieldGroup>
					<Field>
						<FieldLabel for="password-{id}">새 비밀번호</FieldLabel>
						<Input id="password-{id}" name="password" type="password" required minlength={8} />
					</Field>
					<Field>
						<FieldLabel for="confirm-{id}">비밀번호 확인</FieldLabel>
						<Input
							id="confirm-{id}"
							name="passwordConfirm"
							type="password"
							required
							minlength={8}
						/>
					</Field>
					{#if form?.error}
						<p class="font-mono text-sm text-destructive">{form.error}</p>
					{/if}
					<Field>
						<Button type="submit">비밀번호 변경</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>

	{#snippet footer()}
		<FieldDescription class="px-6 text-center">
			<a href="/login" class="underline">로그인으로 돌아가기</a>
		</FieldDescription>
	{/snippet}
</AuthShell>
