# markdown-exit-mermaid

A markdown-exit plugin that renders [Mermaid](https://mermaid.js.org/) diagrams with an interactive viewer and control panel.

## ✨ Features

- 🎨 Interactive diagram viewer with pan and zoom controls
- 📋 One-click code copy functionality
- 🎯 Grid-based navigation panel for precise diagram positioning
- 🔒 Secure rendering with Mermaid's strict security level
- 🎭 Customizable theme support
- 📦 Self-contained or CDN-based asset loading
- 🚀 Zero configuration required - works out of the box

## 📦 Installation

```bash
# Using bun
bun add markdown-exit-mermaid

# Using npm
npm install markdown-exit-mermaid

# Using yarn
yarn add markdown-exit-mermaid

# Using pnpm
pnpm add markdown-exit-mermaid
```

## 🚀 Usage

### Basic Usage

```javascript
import MarkdownExit from 'markdown-exit';
import mermaidPlugin from 'markdown-exit-mermaid';

const md = new MarkdownExit();
md.use(mermaidPlugin);

const markdown = `
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
\`\`\`
`;

const html = md.render(markdown);
```

### With Options

```javascript
md.use(mermaidPlugin, {
  theme: 'dark',                    // Mermaid theme (default: 'default')
  js_url: 'https://cdn.custom.com/mermaid.js',  // Custom Mermaid JS URL
  css_url: 'https://cdn.custom.com/style.css',  // External CSS URL
  viewer_js_url: 'https://cdn.custom.com/viewer.js'  // External viewer JS URL
});
```

## ⚙️ Options

| Option          | Type     | Default                                                         | Description                                                                                                                                                      |
| --------------- | -------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`         | `string` | `'default'`                                                     | Mermaid theme name. See[Mermaid themes](https://mermaid.js.org/config/theming.html) for available options (e.g., `'default'`, `'dark'`, `'forest'`, `'neutral'`) |
| `js_url`        | `string` | `'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'` | URL to load Mermaid.js library from                                                                                                                              |
| `css_url`       | `string` | `undefined`                                                     | Optional external CSS URL. If not provided, inline styles are used                                                                                               |
| `viewer_js_url` | `string` | `undefined`                                                     | Optional external viewer script URL. If not provided, inline viewer script is used                                                                               |

## 🎮 Interactive Controls

The rendered diagrams include an interactive control panel with the following features:

### Navigation

- **Arrow buttons** (↑ ↓ ← →): Pan the diagram in all directions
- **Reset button** (⟳): Reset view to original position and scale

### Zoom

- **Zoom In** (+): Increase diagram scale up to 5x
- **Zoom Out** (−): Decrease diagram scale down to 0.2x

### Toolbar

- **Copy button** (📋): Copy the original Mermaid code to🔧 Advanced Configuration

### Using Custom CDN

```javascript
md.use(mermaidPlugin, {
  js_url: 'https://unpkg.com/mermaid@11/dist/mermaid.min.js'
});
```

### External Assets for Better Caching

If you're rendering multiple pages, you can host the viewer script and styles externally to improve caching:

```javascript
md.use(mermaidPlugin, {
  css_url: 'https://your-cdn.com/mermaid-viewer.css',
  viewer_js_url: 'https://your-cdn.com/mermaid-viewer.js'
});
```

### Dark Theme Example

```javascript
md.use(mermaidPlugin, {
  theme: 'dark'
});
```

## 🏗️ How It Works

1. **Code Block Detection**: The plugin intercepts fenced code blocks with `mermaid` language
2. **HTML Generation**: Creates a container with control panel, toolbar, and viewer area
3. **Mermaid Loading**: Dynamically loads Mermaid.js library (cached after first load)
4. **Diagram Rendering**: Uses Mermaid's `render()` API to convert code to SVG
5. **Interactive Controls**: Attaches event listeners for pan, zoom, and copy functionality

## 📄 License

MIT

## 👤 Author

GnixAij
