import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { transform } from "esbuild";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			name: "MarkdownExitMermaid",
			fileName: (format) => `index.${format}.js`,
			formats: ["es","cjs"],
		},
		rollupOptions: {
			external: ["markdown-exit", "node:fs", "path", "url"],
			output: {
				globals: {
					"markdown-exit": "MarkdownExit",
				},
			},
		},
		minify: true,
	},
	plugins: [
		dts({
			insertTypesEntry: true,
		}),
		// copy ./assets/ to dist/assets/, and minify css,js using esbuild
		viteStaticCopy({
			targets: [
				{
					src: "assets/*",
					dest: "assets",
					transform: async (content, filename) => {
						if (filename.endsWith(".css")) {
							return (await transform(content, { loader: "css", minify: true })).code;
						}
						if (filename.endsWith(".js")) {
							return (await transform(content, { loader: "js", minify: true })).code;
						}
						return content;
					},
				},
			]
		}),
	],
});
