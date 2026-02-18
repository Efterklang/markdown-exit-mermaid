import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MarkdownExit } from "markdown-exit";
import mermaidDiagram from "../src/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  const testMarkdown = `
# Test Page

Below is a mermaid flowchart:

\`\`\`mermaid
graph TD
    A[Hard] -->|Text| B(Round)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
\`\`\`

This is a sequence diagram:

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
\`\`\`

End
`;

  console.log("--- Test 1: Standard rendering with viewer (default) ---");
  const md = new MarkdownExit();
  md.use(mermaidDiagram, {
    theme: "zinc-dark",
  });

  const html = await md.renderAsync(testMarkdown);

  const {
    hasSvg,
    hasGridPanel,
    hasViewerClass,
    hasScript,
    hasCdn,
    hasToolbarButtons
  } = {
    hasSvg: html.includes("<svg"),
    hasGridPanel: html.includes('class="mermaid-viewer-grid-panel"'),
    hasViewerClass: html.includes('class="mermaid-viewer"'),
    hasScript: html.includes("<script"),
    hasCdn: html.includes("unpkg.com") || html.includes("jsdelivr.net"),
    hasToolbarButtons: html.includes('class="zoom-in"') && html.includes('class="zoom-out"'),
  };

  console.log("Contains <svg>:", hasSvg);
  console.log("Contains grid panel:", hasGridPanel);
  console.log("Contains viewer class:", hasViewerClass);
  console.log("Contains <script>:", hasScript);
  console.log("Contains CDN:", hasCdn);
  console.log("Contains toolbar buttons:", hasToolbarButtons);

  if (hasSvg && hasGridPanel && hasViewerClass && !hasScript && !hasCdn && hasToolbarButtons) {
    console.log("PASS: Viewer with grid panel rendered, no scripts or CDNs.");
  } else {
    console.error("FAIL: Viewer structure incorrect.");
    process.exit(1);
  }

  const wrappedHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Test</title><style>
.mermaid-viewer { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
.mermaid-view-container {
  position: relative;
  overflow: auto;
  cursor: grab;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mermaid-view-container:active { cursor: grabbing; }
.mermaid-content {
  transform-origin: center center;
  transition: transform 0.1s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mermaid-content svg {
  display: block;
}
 .mermaid-viewer-grid-panel {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 6px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
 }
.mermaid-viewer-grid-panel button {
  cursor: pointer;
  padding: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.2s;
}
.mermaid-viewer-grid-panel button:hover {
  background: #f5f5f5;
  border-color: #999;
  transform: scale(1.05);
}
.mermaid-viewer-grid-panel button:active {
  transform: scale(0.95);
}
.mermaid-code { display: none; }
</style></head><body>${html}<script>
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const viewers = document.querySelectorAll('.mermaid-viewer');
    
    viewers.forEach(viewer => {
      const container = viewer.querySelector('.mermaid-view-container');
      const content = viewer.querySelector('.mermaid-content');
      const buttons = viewer.querySelectorAll('.mermaid-viewer-grid-panel button');
      
      let scale = 1;
      let panX = 0;
      let panY = 0;
      let isDragging = false;
      let startX, startY;
      const minScale = 0.1;
      const maxScale = 5;
      const scaleStep = 0.2;
      const panStep = 50;
      
      function updateTransform() {
        content.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
      }

      const gridPanel = viewer.querySelector('.mermaid-viewer-grid-panel');
      
      viewer.addEventListener('mouseenter', () => {
        gridPanel.style.opacity = '1';
        gridPanel.style.visibility = 'visible';
      });
      viewer.addEventListener('mouseleave', () => {
        gridPanel.style.opacity = '0';
        gridPanel.style.visibility = 'hidden';
      });
      
      // Zoom buttons
      viewer.querySelector('.zoom-in')?.addEventListener('click', () => {
        scale = Math.min(maxScale, scale + scaleStep);
        updateTransform();
      });
      
      viewer.querySelector('.zoom-out')?.addEventListener('click', () => {
        scale = Math.max(minScale, scale - scaleStep);
        updateTransform();
      });
      
      viewer.querySelector('.reset')?.addEventListener('click', () => {
        scale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
      });
      
      // Pan buttons
      viewer.querySelector('.up')?.addEventListener('click', () => {
        panY += panStep;
        updateTransform();
      });

      viewer.querySelector('.down')?.addEventListener('click', () => {
        panY -= panStep;
        updateTransform();
      });

      viewer.querySelector('.left')?.addEventListener('click', () => {
        panX += panStep;
        updateTransform();
      });

      viewer.querySelector('.right')?.addEventListener('click', () => {
        panX -= panStep;
        updateTransform();
      });
      
      // Mouse drag to pan
      container.addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'BUTTON') {
          isDragging = true;
          startX = e.clientX - panX;
          startY = e.clientY - panY;
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          panX = e.clientX - startX;
          panY = e.clientY - startY;
          updateTransform();
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      // Wheel zoom
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
        scale = Math.max(minScale, Math.min(maxScale, scale + delta));
        updateTransform();
      });
    });
  });
})();
</script></body></html>`;
  fs.writeFileSync(path.join(__dirname, "render.html"), wrappedHtml, "utf-8");
  console.log("HTML saved to render.html");

  console.log("\n--- Test 2: html_only mode (no viewer) ---");
  const mdHtmlOnly = new MarkdownExit();
  mdHtmlOnly.use(mermaidDiagram, {
    html_only: true,
  });

  const htmlOnly = await mdHtmlOnly.renderAsync(testMarkdown);

  const hasSvgOnly = htmlOnly.includes("<svg");
  const hasGridPanelOnly = htmlOnly.includes('class="mermaid-viewer-grid-panel"');
  const hasMermaidDiv = htmlOnly.includes('class="mermaid"');

  console.log("Contains <svg>:", hasSvgOnly);
  console.log("Contains grid panel:", hasGridPanelOnly);
  console.log("Contains mermaid div wrapper:", hasMermaidDiv);

  if (hasSvgOnly && !hasGridPanelOnly && !hasMermaidDiv) {
    console.log("PASS: Returns SVG only when html_only is true.");
  } else {
    console.error("FAIL: html_only mode did not return SVG only.");
    process.exit(1);
  }

  console.log("\n--- Test 3: Custom theme with viewer ---");
  const mdCustomTheme = new MarkdownExit();
  mdCustomTheme.use(mermaidDiagram, {
    theme: "zinc-light",
    bg: "#ffffff",
    fg: "#000000",
    accent: "#ff0000",
  });

  const customHtml = await mdCustomTheme.renderAsync(testMarkdown);
  const hasCustomBg = customHtml.includes("#ffffff");
  const hasCustomAccent = customHtml.includes("#ff0000");
  const hasCustomGridPanel = customHtml.includes('class="mermaid-viewer-grid-panel"');

  console.log("Contains custom background:", hasCustomBg);
  console.log("Contains custom accent:", hasCustomAccent);
  console.log("Contains grid panel:", hasCustomGridPanel);

  if (hasSvg && hasCustomGridPanel) {
    console.log("PASS: Custom theme with viewer applied.");
  } else {
    console.error("FAIL: Custom theme with viewer failed.");
    process.exit(1);
  }

  console.log("\n--- Test 4: viewer disabled ---");
  const mdNoViewer = new MarkdownExit();
  mdNoViewer.use(mermaidDiagram, {
    viewer: false,
  });

  const noViewerHtml = await mdNoViewer.renderAsync(testMarkdown);
  const hasNoGridPanel = noViewerHtml.includes('class="mermaid-viewer-grid-panel"');
  const hasSimpleMermaid = noViewerHtml.includes('<div class="mermaid">');

  console.log("Contains grid panel:", hasNoGridPanel);
  console.log("Contains simple mermaid div:", hasSimpleMermaid);

  if (!hasNoGridPanel && hasSimpleMermaid) {
    console.log("PASS: Viewer disabled, returns simple div wrapper.");
  } else {
    console.error("FAIL: viewer=false did not disable viewer.");
    process.exit(1);
  }

  console.log("\n✅ All tests passed!");
}

runTest();
