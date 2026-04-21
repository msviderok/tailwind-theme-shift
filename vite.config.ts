import tailwindcss from '@tailwindcss/vite';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
	fmt: {
		ignorePatterns: [],
		singleQuote: true,
		useTabs: true,
	},
	server: {
		port: 3000,
	},
	resolve: {
		tsconfigPaths: true,
	},
	build: {
		target: 'esnext',
	},
});
