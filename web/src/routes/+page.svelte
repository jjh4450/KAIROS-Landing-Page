<script lang="ts">
	import type { PageData } from './$types';
	import AmbientBackdrop from '$lib/components/AmbientBackdrop.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import PostsSection from '$lib/components/PostsSection.svelte';
	import ActivitiesSection from '$lib/components/ActivitiesSection.svelte';
	import AchievementsSection from '$lib/components/AchievementsSection.svelte';
	import MembersSection from '$lib/components/MembersSection.svelte';
	import SponsorsSection from '$lib/components/SponsorsSection.svelte';
	import JoinCTA from '$lib/components/JoinCTA.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>KAIROS · KAIROS</title>
	<meta
		name="description"
		content="강원대학교 학생 보안 동아리 KAIROS. 함께 배우고, 함께 공격하고, 함께 방어합니다."
	/>
</svelte:head>

<AmbientBackdrop />
<SiteHeader settings={data.settings} user={data.user} />

<main class="relative">
	<HeroSection settings={data.settings} />
	<AboutSection />
	<PostsSection posts={data.posts} />
	<ActivitiesSection events={data.events} />
	<AchievementsSection achievements={data.achievements} />
	<MembersSection members={data.members} />
	<SponsorsSection sponsors={data.sponsors} />
	<JoinCTA settings={data.settings} />
</main>

<SiteFooter settings={data.settings} />
