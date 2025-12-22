import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { MarkdownExit, PluginWithOptions } from "markdown-exit";
import { girdPanelTemplate, toolbarTemplate } from "./html_template";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewerScript = readFileSync(
	path.join(__dirname, "assets", "viewer.js"),
	"utf-8",
);
const scopedStyles = readFileSync(
	path.join(__dirname, "assets", "style.css"),
	"utf-8",
);

interface MermaidOptions {
	theme?: string;
	js_url?: string;
	css_url?: string;
	viewer_js_url?: string;
	theme_variables?: Record<string, string>;
}

const mermaidDiagram: PluginWithOptions<MermaidOptions> =
	function mermaidDiagram(md: MarkdownExit, options: MermaidOptions = {}) {
		const theme = options.theme || "default";
		const jsUrl =
			options.js_url ||
			"https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

		const origFence = md.renderer.rules.fence;

		md.renderer.rules.fence = (tokens, idx, _opts, _env, self) => {
			const token = tokens[idx];
			if (!token) return "";

			const info = (token.info || "").trim();
			const lang = info.split(/\s+/)[0];
			const code = escapeHtml(token.content) || "";

			if (lang !== "mermaid") {
				// 非 mermaid 使用原始渲染器
				return origFence
					? origFence(tokens, idx, _opts, _env, self)
					: self.renderToken(tokens, idx, _opts);
			}

			const id = `mermaid-${Math.random().toString(36).slice(2)}`;

			const css = options.css_url
				? `<link rel="stylesheet" href="${options.css_url}">`
				: `<style>${scopedStyles}</style>`;

			let script = "";
			if (options.viewer_js_url) {
				script = `<script src="${options.viewer_js_url}"></script><script>window.initMermaidDiagram('${id}', '${jsUrl}', '${theme}')</script>`;
			} else {
				script = `<script>
        if (!window.initMermaidDiagram) {
          ${viewerScript}
        }
        window.initMermaidDiagram('${id}', '${jsUrl}', '${theme}', ${JSON.stringify(options.theme_variables || {})});
      </script>`;
			}

			const containerHtml = `
<div id="${id}" class="mermaid-container">
  ${css}
  <div class="mermaid-wrapper">
	${toolbarTemplate}

    <div class="mermaid-view-container">
      ${girdPanelTemplate}

      <pre class="mermaid-content">
         <code class="mermaid-code" style="display: none;">${code}</code>
      </pre>
    </div>
  </div>
  ${script}
</div>`;

			return containerHtml;
		};
	};

/**
 * 转义 HTML 字符
 */
function escapeHtml(text: string) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export default mermaidDiagram;
