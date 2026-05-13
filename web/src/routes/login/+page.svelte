<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import AuthShell from '$lib/components/AuthShell.svelte';
	import AppleLogo from 'phosphor-svelte/lib/AppleLogo';
	import GoogleLogo from 'phosphor-svelte/lib/GoogleLogo';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const id = $props.id();
</script>

<svelte:head>
	<title>로그인 · KAIROS</title>
</svelte:head>

<AuthShell>
	<Card.Root class="glass">
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Welcome back</Card.Title>
			<Card.Description>이메일과 비밀번호로 로그인</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<input type="hidden" name="next" value={data.next} />
				<FieldGroup>
					<Field>
						<Button
							variant="outline"
							type="button"
							disabled
							aria-disabled="true"
							tabindex={-1}
							title="준비 중"
							onclick={(e) => e.preventDefault()}
						>
							<AppleLogo weight="fill" />
							Login with Apple
						</Button>
						<Button
							variant="outline"
							type="button"
							disabled
							aria-disabled="true"
							tabindex={-1}
							title="준비 중"
							onclick={(e) => e.preventDefault()}
						>
							<GoogleLogo weight="fill" />
							Login with Google
						</Button>
					</Field>
					<FieldSeparator>Or continue with</FieldSeparator>
					<Field>
						<FieldLabel for="email-{id}">Email</FieldLabel>
						<Input
							id="email-{id}"
							name="email"
							type="email"
							placeholder="you@kairos.dev"
							value={form?.email ?? ''}
							required
						/>
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel for="password-{id}">Password</FieldLabel>
							<a
								href="/forgot-password"
								class="ms-auto text-sm underline-offset-4 hover:underline"
							>
								Forgot your password?
							</a>
						</div>
						<Input id="password-{id}" name="password" type="password" required />
					</Field>
					{#if form?.error}
						<p class="text-destructive font-mono text-sm">{form.error}</p>
					{/if}
					<Field>
						<Button type="submit">Login</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>

	{#snippet footer()}
		<FieldDescription class="px-6 text-center">
			KAIROS 가입 문의는 어드민(<a href="#join" class="underline">join</a>)으로.
		</FieldDescription>
	{/snippet}
</AuthShell>
