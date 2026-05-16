<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';

	const pillars: { idx: string; title: string; body: string }[] = [
		{
			idx: '01',
			title: 'Learn',
			body: '웹, 포너블, 리버싱, 암호 분야로 나뉜 정기 스터디를 운영합니다. 처음 시작하는 부원도 따라올 수 있도록 단계별 자료와 선배 멘토링을 제공합니다.'
		},
		{
			idx: '02',
			title: 'Compete',
			body: '국내외 CTF에 함께 참여합니다. 풀이(write-up)는 함께 기록으로 남겨 이어서 활용합니다.'
		},
		{
			idx: '03',
			title: 'Build',
			body: '학습 과정에서 만든 도구와 연구 결과는 오픈소스로 공개합니다.'
		},
		{
			idx: '04',
			title: 'Share',
			body: '교내 세미나와 KUCIS 활동에 참여하고, 가능한 자리에서는 외부 발표도 합니다.'
		}
	];
</script>

<section id="about" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-12 max-w-3xl md:mb-16">
		<Eyebrow class="mb-4">// about</Eyebrow>
		<h2>보안 모임 KAIROS.</h2>
		<p class="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
			KAIROS는 보안을 공부하는 사람들이 모인 자리입니다. 정기 스터디를 함께 진행하고, 배운
			내용과 활동 결과를 기록으로 남깁니다.
		</p>
	</header>

	<div class="reveal-children grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each pillars as p (p.idx)}
			<div class="tilt-3d">
				<div use:cardTilt={{ max: 7, scale: 1.02 }} class="h-full tilt-3d-card">
					<Card.Root class="relative h-full overflow-hidden">
						<div class="tilt-3d-glare"></div>
						<Card.Header class="relative tilt-3d-layer">
							<Card.Description class="font-mono text-kairos-cyan/80">{p.idx}</Card.Description>
							<Card.Title class="font-mono text-base">{p.title}</Card.Title>
						</Card.Header>
						<Card.Content class="relative tilt-3d-layer">
							<p class="text-sm text-muted-foreground">{p.body}</p>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		{/each}
	</div>
</section>
