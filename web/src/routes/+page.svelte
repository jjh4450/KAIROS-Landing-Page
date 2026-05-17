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
	import SiteMeta from '$lib/components/SiteMeta.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SiteMeta title={data.settings?.siteTitle} description={data.settings?.siteDescription} />

<AmbientBackdrop />
<SiteHeader settings={data.settings} user={data.user} />

<main class="relative">
	<HeroSection hero={data.hero} threatFeed={data.threatFeed} settings={data.settings} />

	{#each data.sections as s (s.id)}
		{#if s.slug === 'about'}
			<AboutSection section={s} pillars={data.pillars} />
		{:else if s.slug === 'posts'}
			<PostsSection section={s} posts={data.posts} />
		{:else if s.slug === 'activities'}
			<ActivitiesSection section={s} events={data.events} />
		{:else if s.slug === 'achievements'}
			<AchievementsSection section={s} achievements={data.achievements} />
		{:else if s.slug === 'members'}
			<MembersSection section={s} members={data.members} />
		{:else if s.slug === 'sponsors'}
			<SponsorsSection section={s} sponsors={data.sponsors} />
		{/if}
	{/each}

	<JoinCTA settings={data.settings} />
</main>

<SiteFooter settings={data.settings} />
