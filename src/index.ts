import { renderMermaid, THEMES, type RenderOptions, type ThemeName } from "beautiful-mermaid";
import type { MarkdownExit, PluginWithOptions } from "markdown-exit";
import { renderMermaidViewer } from "./html_template";

interface MermaidOptions {
	theme?: string;
	bg?: string;
	fg?: string;
	line?: string;
	accent?: string;
	muted?: string;
	surface?: string;
	border?: string;
	font?: string;
	padding?: number;
	nodeSpacing?: number;
	layerSpacing?: number;
	html_only?: boolean;
	transparent?: boolean;
	viewer?: boolean;
}

const mermaidDiagram: PluginWithOptions<MermaidOptions> =
	async function mermaidDiagram(md: MarkdownExit, options: MermaidOptions = {}) {
		const origFence = md.renderer.rules.fence;

		const themeName = options.theme || "default";
		const theme = THEMES[themeName as ThemeName] || THEMES["zinc-dark"];
		const enableViewer = options.viewer ?? true;

		const getRenderOptions = (): RenderOptions => ({
			bg: options.bg ?? theme.bg,
			fg: options.fg ?? theme.fg,
			line: options.line ?? theme.line,
			accent: options.accent ?? theme.accent,
			muted: options.muted ?? theme.muted,
			surface: options.surface ?? theme.surface,
			border: options.border ?? theme.border,
			font: options.font,
			padding: options.padding,
			nodeSpacing: options.nodeSpacing,
			layerSpacing: options.layerSpacing,
			transparent: options.transparent ?? false,
		});

		let mermaidIndex = 0;

		md.renderer.rules.fence = async (tokens, idx, _opts, _env, self) => {
			const token = tokens[idx];
			if (!token) return "";

			const info = (token.info || "").trim();
			const lang = info.split(/\s+/)[0];
			const code = token.content || "";

			if (lang !== "mermaid") {
				return origFence
					? origFence(tokens, idx, _opts, _env, self)
					: self.renderToken(tokens, idx, _opts);
			}

			try {
				const renderOptions = getRenderOptions();
				const svg = await renderMermaid(code, renderOptions);

				if (options.html_only) {
					return svg;
				}

				const viewerId = `mermaid-viewer-${mermaidIndex++}`;

				if (enableViewer) {
					return renderMermaidViewer(viewerId, svg);
				}

				return `<div class="mermaid">${svg}</div>`;
			} catch (error) {
				console.error("[markdown-exit-mermaid] Failed to render mermaid diagram:", error);
				const escapedCode = code
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#39;");
				return `<pre><code class="language-mermaid">${escapedCode}</code></pre>`;
			}
		};
	};

export default mermaidDiagram;
