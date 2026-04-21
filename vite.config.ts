import tailwindcss from '@tailwindcss/vite';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vite-plus';
import type { OxfmtConfig } from 'vite-plus/fmt';
import fmtConfigJson from './.oxcfmtrc.json' with { type: 'json' };

const fmtConfig = Object.entries(fmtConfigJson).reduce((acc, [key, value]) => {
	if (key === '$schema') return acc;
	acc[key] = value;
	return acc;
}, {} as OxfmtConfig);

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
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
});
