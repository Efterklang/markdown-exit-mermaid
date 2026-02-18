# markdown-exit-mermaid

A markdown-exit plugin that renders [Mermaid](https://mermaid.js.org/) diagrams as SVGs using [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid).

## ✨ Features

- 🎨 15+ built-in beautiful themes
- 🖼️ Server-side SVG rendering (no browser dependency)
- 📦 Zero runtime initialization
- 🎯 Full theme customization
- 🔒 Secure rendering
- 🚀 Zero configuration required - works out of the box

## 📦 Installation

```bash
# Using bun
bun add markdown-exit-mermaid beautiful-mermaid

# Using npm
npm install markdown-exit-mermaid beautiful-mermaid

# Using yarn
yarn add markdown-exit-mermaid beautiful-mermaid

# Using pnpm
pnpm add markdown-exit-mermaid beautiful-mermaid
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
  theme: 'tokyo-night',          // beautiful-mermaid theme name
  bg: '#1a1a1a',                  // Override background color
  fg: '#e0e0e0',                  // Override foreground color
  accent: '#4f46e5',              // Override accent color
  html_only: true                 // Return SVG only (no wrapper div)
});
```

## ⚙️ Options

| Option            | Type      | Default               | Description                                                                                     |
| ----------------- | --------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `theme`           | `string`  | `'zinc-light'`        | Theme name (see [Themes](#themes) section)                                                      |
| `bg`              | `string`  | theme-specific        | Override background color                                                                      |
| `fg`              | `string`  | theme-specific        | Override foreground color                                                                      |
| `line`            | `string`  | theme-specific        | Override line color                                                                           |
| `accent`          | `string`  | theme-specific        | Override accent color                                                                         |
| `muted`           | `string`  | theme-specific        | Override muted color                                                                          |
| `surface`         | `string`  | theme-specific        | Override surface color                                                                        |
| `border`          | `string`  | theme-specific        | Override border color                                                                         |
| `font`            | `string`  | theme-specific        | Override font family                                                                          |
| `padding`         | `number`  | theme-specific        | Override padding value                                                                        |
| `nodeSpacing`     | `number`  | theme-specific        | Override node spacing                                                                         |
| `layerSpacing`    | `number`  | theme-specific        | Override layer spacing                                                                        |
| `html_only`       | `boolean` | `false`               | Return SVG only without wrapper div                                                            |
| `transparent`     | `boolean` | `false`               | Make SVG background transparent                                                               |

## 🎨 Themes

beautiful-mermaid comes with 15+ built-in themes:

- **Light Themes**: `zinc-light`, `nord-light`, `github-light`
- **Dark Themes**: `zinc-dark`, `tokyo-night`, `tokyo-night-storm`, `catppuccin-mocha`, `nord`, `dracula`, `github-dark`, `rose-pine-moon`, `rose-pine-dawn`
- **More**: Check [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) for the full list

### Dark Theme Example

```javascript
md.use(mermaidPlugin, {
  theme: 'tokyo-night'
});
```

### Custom Theme Example

```javascript
md.use(mermaidPlugin, {
  theme: 'zinc-light',
  bg: '#ffffff',
  fg: '#000000',
  accent: '#2563eb',
  border: '#e5e7eb'
});
```

## 🔧 Advanced Configuration

### SVG-Only Output

If you only want the SVG without any wrapper:

```javascript
md.use(mermaidPlugin, {
  html_only: true
});
```

This is useful when you want full control over the SVG container styling.

### Transparent Background

For transparent SVGs (useful for embedding):

```javascript
md.use(mermaidPlugin, {
  transparent: true
});
```

## 🏗️ How It Works

1. **Code Block Detection**: The plugin intercepts fenced code blocks with `mermaid` language
2. **SVG Rendering**: Uses beautiful-mermaid's `renderMermaid()` API to convert code to SVG server-side
3. **Theme Application**: Applies the selected theme with any custom overrides
4. **HTML Output**: Wraps the SVG in a div (unless `html_only` is true)

## 📄 License

MIT

## 👤 Author

GnixAij
