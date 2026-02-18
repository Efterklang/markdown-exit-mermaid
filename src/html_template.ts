export const toolbarButtons = {
	copy: `<button class="copy-code" title="Copy code" data-action="copy-code">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
		</svg>
	</button>`,
};

export const gridPanelButtons = {
	zoomIn: `<button class="zoom-in" title="Zoom in">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="8" x2="12" y2="16"></line>
			<line x1="8" y1="12" x2="16" y2="12"></line>
		</svg>
	</button>`,
	zoomOut: `<button class="zoom-out" title="Zoom out">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="8" y1="12" x2="16" y2="12"></line>
		</svg>
	</button>`,
	reset: `<button class="reset" title="Reset view">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"></circle>
			<polyline points="12 6 12 12 18 12"></polyline>
		</svg>
	</button>`,
	up: `<button class="up" title="Move up">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="18 15 12 9 6 15"></polyline>
		</svg>
	</button>`,
	down: `<button class="down" title="Move down">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>`,
	left: `<button class="left" title="Move left">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>
	</button>`,
	right: `<button class="right" title="Move right">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="9 6 15 12 9 18"></polyline>
		</svg>
	</button>`,
};

export function renderMermaidViewer(htmlId: string, mermaidCode: string): string {
	return `<div id="${htmlId}" class="mermaid-viewer" style="position: relative; display: flex; flex-direction: column;">
		<div class="mermaid-view-container" style="flex: 1; overflow: auto; cursor: grab; min-height: 200px;">
			<div class="mermaid-content" style="transform-origin: center center;">
				${mermaidCode}
			</div>
		</div>
		<div class="mermaid-viewer-grid-panel" style="
			position: absolute;
			bottom: 16px;
;
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
		">
			<div style="grid-column: 1; grid-row: 1;"></div>
			${gridPanelButtons.up}
			${gridPanelButtons.zoomIn}
			${gridPanelButtons.left}
			${gridPanelButtons.reset}
			${gridPanelButtons.right}
			<div style="grid-column: 1; grid-row: 3;"></div>
			${gridPanelButtons.down}
			${gridPanelButtons.zoomOut}
		</div>
		<div class="mermaid-code" style="display: none;">${mermaidCode}</div>
	</div>`;
}
