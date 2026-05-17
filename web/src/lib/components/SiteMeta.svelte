<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { page } from '$app/state';
	import { SITE, buildOgUrl } from '$lib/seo';

	type Props = {
		title?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article';
		publishedTime?: string;
		modifiedTime?: string;
		noindex?: boolean;
	};

	let {
		title,
		description,
		image,
		type = 'website',
		publishedTime,
		modifiedTime,
		noindex = false
	}: Props = $props();

	const desc = $derived(description ?? SITE.description);
	const headline = $derived(title ?? SITE.name);
	const fullTitle = $derived.by(() => {
		if (!title) return `${SITE.name} · ${SITE.tagline}`;
		return title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
	});
	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);
	const ogImage = $derived(
		image ?? buildOgUrl(page.url.origin, { title: headline, description: desc })
	);
</script>

<MetaTags
	title={fullTitle}
	{description}
	{canonical}
	robots={noindex ? 'noindex,nofollow' : 'index,follow'}
	openGraph={{
		type,
		siteName: SITE.name,
		locale: SITE.locale,
		url: canonical,
		title: fullTitle,
		description: desc,
		images: [{ url: ogImage, width: 1200, height: 630, alt: headline }],
		...(type === 'article' && (publishedTime || modifiedTime)
			? { article: { publishedTime, modifiedTime } }
			: {})
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: fullTitle,
		description: desc,
		image: ogImage,
		imageAlt: headline
	}}
	additionalMetaTags={[
		{ name: 'theme-color', content: SITE.themeColor },
		{ name: 'application-name', content: SITE.name }
	]}
/>
