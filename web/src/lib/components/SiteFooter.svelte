<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { SiteSettings } from '$lib/types';

	type Props = { settings?: SiteSettings | null };
	let { settings }: Props = $props();

	type Channel = { label: string; url?: string };
	const channels = $derived<Channel[]>(
		(
			[
				{ label: 'github', url: settings?.githubUrl },
				{ label: 'discord', url: settings?.discordUrl },
				{ label: 'kakao', url: settings?.kakaoUrl },
				{ label: 'instagram', url: settings?.instagramUrl },
				{
					label: 'email',
					url: settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined
				}
			] satisfies Channel[]
		).filter((c) => !!c.url)
	);
</script>

<footer class="mx-auto mt-16 w-full max-w-7xl px-6 pb-10">
	<Separator class="mb-8" />
	<div class="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
		<div class="flex items-center gap-2.5">
			<span
				class="inline-block h-4 w-4 bg-gradient-to-br from-kairos-cyan to-kairos-violet"
				aria-hidden="true"
			></span>
			<span class="font-mono text-[11px] tracking-widest text-muted-foreground">
				KAIROS · {settings?.footerCopy ?? '© KAIROS'}
			</span>
		</div>

		{#if channels.length}
			<ul class="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px]">
				{#each channels as c, i (c.label)}
					{#if i > 0}
						<li aria-hidden="true" class="text-muted-foreground/50">/</li>
					{/if}
					<li>
						<!-- 외부 채널(github/discord/email 등). $app/paths의 resolve()는 internal route용 -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={c.url}
							target="_blank"
							rel="noopener"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{c.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</footer>
