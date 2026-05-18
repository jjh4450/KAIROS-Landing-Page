import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function pbHealthCheck(): Plugin {
	return {
		name: 'pb-health-check',
		apply: 'build',
		async buildStart() {
			const env = loadEnv('production', process.cwd(), 'PUBLIC_');
			const url = env.PUBLIC_PB_URL || process.env.PUBLIC_PB_URL;
			if (!url) {
				this.error('PUBLIC_PB_URL is not set — refusing to build.');
			}
			const healthUrl = `${url.replace(/\/+$/, '')}/api/health`;
			console.log(`[pb-health] checking ${healthUrl}`);
			const ctrl = new AbortController();
			const timer = setTimeout(() => ctrl.abort(), 10_000);
			try {
				const res = await fetch(healthUrl, { signal: ctrl.signal });
				if (!res.ok) this.error(`[pb-health] HTTP ${res.status} ${res.statusText}`);
				const body = await res.json();
				if (body?.code !== 200) {
					this.error(`[pb-health] unexpected payload: ${JSON.stringify(body)}`);
				}
				console.log(`[pb-health] OK — ${body.message ?? 'healthy'}`);
			} catch (e) {
				if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'PLUGIN_ERROR') throw e;
				this.error(`[pb-health] failed to reach ${healthUrl}: ${(e as Error)?.message ?? e}`);
			} finally {
				clearTimeout(timer);
			}
		}
	};
}

export default defineConfig({
	plugins: [
		pbHealthCheck(),
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	],
	ssr: {
		// bits-ui ships .svelte files; SSR must process them via the Svelte plugin
		noExternal: ['bits-ui']
	}
});
