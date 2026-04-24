import tailwindcss from '@tailwindcss/vite';
import solidPlugin from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite-plus';
import type { OxfmtConfig } from 'vite-plus/fmt';
import fmtConfigJson from './.oxcfmtrc.json' with { type: 'json' };

const fmtConfig = Object.entries(fmtConfigJson).reduce((acc, [key, value]) => {
	if (key === '$schema') return acc;
	acc[key] = value;
	return acc;
}, {} as OxfmtConfig);

export default defineConfig({
	plugins: [
		solidPlugin(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico'],
			manifest: {
				name: 'Themeshift',
				short_name: 'Themeshift',
				description: 'Convert HSL colors to OKLCH',
				theme_color: '#000000',
				background_color: '#000000',
				display: 'standalone',
				icons: [
					{
						src: 'favicon.ico',
						sizes: 'any',
						type: 'image/x-icon',
					},
				],
			},
			workbox: {
				clientsClaim: true,
				cleanupOutdatedCaches: true,
				globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
				runtimeCaching: [
					{
						urlPattern: ({ request, url }) =>
							request.mode === 'navigate' || url.origin === self.location.origin,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'themeshift-runtime',
							networkTimeoutSeconds: 3,
							cacheableResponse: {
								statuses: [0, 200],
							},
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
				],
			},
		}),
	],
	fmt: fmtConfig,
	server: {
		port: 3000,
	},
	resolve: {
		tsconfigPaths: true,
	},
	build: {
		target: 'esnext',
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
	},
});
