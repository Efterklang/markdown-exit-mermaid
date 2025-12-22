import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MarkdownExit } from "markdown-exit";
import mermaidDiagram from "../dist/index.es.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runTest() {
	const testMarkdown = `
# 测试页面

下面是一个 mermaid 流程图：

\`\`\`mermaid
graph TD
    A[Hard] -->|Text| B(Round)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
\`\`\`

这是另一个序列图：

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
\`\`\`

结束
`;

	const md = new MarkdownExit();
	md.use(mermaidDiagram, {
		js_url: "https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js",
		theme: "default",
		className: "mermaid-diagram",
	});

	const html = md.render(testMarkdown);

	const wrappedHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Test</title></head><body>${html}</body></html>`;
	fs.writeFileSync(path.join(__dirname, "render.html"), wrappedHtml, "utf-8");

	console.log("测试完成，结果已保存到 render.html");
	console.log(
		"原始 mermaid 代码块数量:",
		(testMarkdown.match(/```mermaid/g) || []).length,
	);
	console.log(
		"转换后的容器数量:",
		(html.match(/mermaid-diagram-container/g) || []).length,
	);
}

runTest();
