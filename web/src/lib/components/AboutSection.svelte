<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Eyebrow from './Eyebrow.svelte';
	import { cardTilt } from '$lib/motion/actions';

	const pillars: { idx: string; title: string; body: string }[] = [
		{
			idx: '01',
			title: 'Learn',
			body: '웹/포너블/리버싱/암호 트랙 스터디. 입문자도 따라올 수 있는 커리큘럼 + 멘토링.'
		},
		{
			idx: '02',
			title: 'Compete',
			body: '국내외 CTF 출전과 write-up 아카이브. 다음 기수가 이어받을 수 있게 기록을 남깁니다.'
		},
		{
			idx: '03',
			title: 'Build',
			body: '오픈소스 보안 도구·연구. 실제로 쓸 수 있는 것들을 만들고 공개합니다.'
		},
		{
			idx: '04',
			title: 'Share',
			body: '교내 세미나, KUCIS 활동, 외부 컨퍼런스 발표. 강원대를 보안 커뮤니티 위에 올립니다.'
		}
	];
</script>

<section id="about" class="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
	<header class="reveal mb-12 max-w-3xl md:mb-16">
		<Eyebrow class="mb-4">// about</Eyebrow>
		<h2>강원대의 공격적 보안 커뮤니티.</h2>
		<p class="text-muted-foreground mt-5 max-w-2xl text-base md:text-lg">
			KAIROS는 강원대학교 학생 보안 동아리입니다. 공격을 통해 방어를 이해하고, 결과물을 기록으로
			남깁니다.
		</p>
	</header>

	<div class="reveal-children grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each pillars as p (p.idx)}
			<div class="tilt-3d">
				<div use:cardTilt={{ max: 7, scale: 1.02 }} class="tilt-3d-card h-full">
					<Card.Root class="relative h-full overflow-hidden">
						<div class="tilt-3d-glare"></div>
						<Card.Header class="tilt-3d-layer relative">
							<Card.Description class="text-kairos-cyan/80 font-mono">{p.idx}</Card.Description>
							<Card.Title class="font-mono text-base">{p.title}</Card.Title>
						</Card.Header>
						<Card.Content class="tilt-3d-layer relative">
							<p class="text-muted-foreground text-sm">{p.body}</p>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		{/each}
	</div>
</section>
