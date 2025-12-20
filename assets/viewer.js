window.initMermaidDiagram = (id, jsUrl, theme) => {
	const container = document.getElementById(id);
	if (!container) return;
	const viewContainer = container.querySelector(
		".mermaid-view-container",
	);
	const content = container.querySelector(".mermaid-content");
	const codeElement = container.querySelector(".mermaid-code");
	const toolbar = container.querySelector(".mermaid-toolbar");

	if (!viewContainer || !content || !codeElement) return;

	// State for pan/zoom
	let currentScale = 1;
	let currentTranslateX = 0;
	let currentTranslateY = 0;

	function applyTransform() {
		content.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
	}

	// Load Mermaid if needed
	const loadMermaid = () => {
		return new Promise((resolve, reject) => {
			if (window.mermaid) return resolve(window.mermaid);
			// Check if script is already loading
			const existingScript = document.querySelector(`script[src="${jsUrl}"]`);
			if (existingScript) {
				existingScript.addEventListener("load", () => resolve(window.mermaid));
				existingScript.addEventListener("error", reject);
				return;
			}

			const script = document.createElement("script");
			script.src = jsUrl;
			script.onload = () => resolve(window.mermaid);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	};

	loadMermaid().then((mermaid) => {
		mermaid.initialize({
			startOnLoad: false,
			theme: theme,
			securityLevel: "strict",
			fontSize: 16,
			flowchart: {
				useMaxWidth: true,
				htmlLabels: true,
			},
		});

		const code = codeElement.textContent;
		// Use a unique ID for the SVG
		const svgId = `${id}-svg`;

		mermaid
			.render(svgId, code)
			.then(({ svg }) => {
				content.insertAdjacentHTML('beforeend', svg);
			})
			.catch((error) => {
				console.error("Mermaid rendering error:", error);
				content.insertAdjacentHTML('beforeend',
					'<p style="color: red;">Failed to render diagram: ' +
					error.message +
					"</p>");
			});
	});

	// Toolbar actions
	if (toolbar) {
		toolbar.addEventListener("click", (e) => {
			const button = e.target.closest("button");
			if (!button) return;

			if (button.classList.contains("copy-code")) {
				const code = codeElement.textContent;
				navigator.clipboard.writeText(code).then(() => {
					const originalTitle = button.getAttribute("title");
					button.setAttribute("title", "Copied!");
					setTimeout(() => button.setAttribute("title", originalTitle), 2000);
				});
			}
		});
	}

	const gridPanel = container.querySelector(".mermaid-viewer-grid-panel");
	if (gridPanel) {
		gridPanel.addEventListener("click", (e) => {
			const button = e.target.closest("button");
			if (!button) return;

			if (button.classList.contains("zoom-in")) {
				currentScale = Math.min(currentScale * 1.2, 5);
			} else if (button.classList.contains("zoom-out")) {
				currentScale = Math.max(currentScale / 1.2, 0.2);
			} else if (button.classList.contains("reset")) {
				currentScale = 1;
				currentTranslateX = 0;
				currentTranslateY = 0;
			} else if (button.classList.contains("up")) {
				currentTranslateY += 40;
			} else if (button.classList.contains("down")) {
				currentTranslateY -= 40;
			} else if (button.classList.contains("left")) {
				currentTranslateX += 40;
			} else if (button.classList.contains("right")) {
				currentTranslateX -= 40;
			}
			applyTransform();
		});
	}

	// Drag to pan
	let isDragging = false;
	let startX, startY;
	let initialTranslateX, initialTranslateY;

	viewContainer.addEventListener("mousedown", (e) => {
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		initialTranslateX = currentTranslateX;
		initialTranslateY = currentTranslateY;
		viewContainer.style.cursor = "grabbing";
	});

	window.addEventListener("mousemove", (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		currentTranslateX = initialTranslateX + dx;
		currentTranslateY = initialTranslateY + dy;
		applyTransform();
	});

	window.addEventListener("mouseup", () => {
		if (isDragging) {
			isDragging = false;
			viewContainer.style.cursor = "grab";
		}
	});
};
