<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import type { SiteSettings } from '$lib/types';
	import { magnetic, cardTilt } from '$lib/motion/actions';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';

	type Props = { settings?: SiteSettings | null };
	let { settings }: Props = $props();

	const open = $derived(!!settings?.recruitmentOpen);
	const url = $derived(settings?.recruitmentFormUrl ?? '');

	function fmtDeadline(d?: string): string {
		if (!d) return '';
		return new Date(d).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<section id="join" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<div class="reveal tilt-3d">
		<div
			use:cardTilt={{ max: 3, scale: 1.005 }}
			class="relative tilt-3d-card overflow-hidden glass p-8 md:p-12"
		>
			<!-- corner ticks -->
			<span class="absolute top-0 left-0 h-3 w-3 border-t border-l border-kairos-cyan"></span>
			<span class="absolute top-0 right-0 h-3 w-3 border-t border-r border-kairos-cyan"></span>
			<span class="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-kairos-cyan"></span>
			<span class="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-kairos-cyan"></span>

			<!-- subtle radial glow -->
			<div
				class="pointer-events-none absolute -top-32 -right-32 h-96 w-96 opacity-30 blur-3xl"
				style="background: radial-gradient(circle, var(--kairos-cyan), transparent 70%)"
				aria-hidden="true"
			></div>

			<div class="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
				<div class="max-w-2xl">
					<Eyebrow class="mb-4">// join</Eyebrow>
					<h2 class="mb-4">
						{#if open}같이 부수러 갑시다.{:else}다음 기수 모집을 기다려주세요.{/if}
					</h2>
					<p class="text-base text-muted-foreground md:text-lg">
						{#if open}
							강원대 재학생이면 누구나 지원 가능합니다. 사전 지식보다 호기심이 중요합니다.
						{:else}
							현재는 신규 모집을 받고 있지 않습니다. SNS를 팔로우하시면 다음 모집 공고를 가장 먼저
							받아보실 수 있습니다.
						{/if}
					</p>
					{#if open && settings?.recruitmentDeadline}
						<div class="mt-5">
							<Badge variant="outline" class="border-kairos-cyan/40 font-mono text-kairos-cyan">
								deadline · {fmtDeadline(settings.recruitmentDeadline)}
							</Badge>
						</div>
					{/if}
				</div>

				{#if open && url}
					<div use:magnetic={{ strength: 0.3 }}>
						<Button href={url} variant="default" size="lg" class="font-mono">
							지원 폼 열기 <ArrowUpRight />
						</Button>
					</div>
				{/if}
			</div>

			<!-- glare overlay tied to mouse position -->
			<div class="tilt-3d-glare"></div>
		</div>
	</div>
</section>
