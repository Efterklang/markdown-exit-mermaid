# Refactoring Plan: Switch to beautiful-mermaid

## Objective
Refactor the project to replace browser-based mermaid.js with `lukilabs/beautiful-mermaid` for server-side SVG rendering, while maintaining compatibility with markdown-exit and existing functionality.

## Current Architecture Analysis

### What We Have
- **Package**: `markdown-exit-mermaid` - a Hexo markdown plugin
- **Current Renderer**: Browser-based mermaid.js (CDN loaded)
- **Output**: HTML with inline scripts + interactive viewer (pan/zoom controls)
- **Tech Stack**: Bun (runtime), Vite (build), TypeScript
- **Key Dependencies**: markdown-exit (peer dependency)
- **Build Output**: `dist/` with ESM and CJS modules, plus copied/minified assets

### Current Flow
1. Hexo calls markdown-exit-mermaid with mermaid code blocks
2. Plugin generates HTML with mermaid.js CDN script
3. Browser loads mermaid.js and renders diagram
4. Interactive viewer.js provides pan/zoom/copy controls

### What's Problematic
- **Browser dependency**: Requires client-side rendering
- **CDN latency**: mermaid.js loaded from unpkg.com
- **Complexity**: Inline scripts, viewer controls, dynamic loading
- **Heavy**: mermaid.js is large (~600KB+ minified)

## Target Architecture

### What We Want
- **New Renderer**: Server-side beautiful-mermaid (SVG output)
- **Output**: Clean HTML with embedded SVG
- **Tech Stack**: Bun (runtime), Vite (build), TypeScript
- **Key Dependencies**: beautiful-mermaid (new), markdown-exit (peer)

### New Flow
1. Hexo calls markdown-exit-mermaid with mermaid code blocks
2. Plugin calls beautiful-mermaid to render SVG
3. Plugin generates HTML with embedded SVG
4. Browser displays static SVG (no JavaScript needed)

### Benefits
- ✅ **Server-side rendering**: No browser dependency, faster page load
- ✅ **Static output**: No inline scripts or dynamic loading
- ✅ **Beautiful themes**: 15+ built-in themes, Shiki compatibility
- ✅ **Smaller footprint**: beautiful-mermaid is lighter, no need for viewer.js
- ✅ **Better performance**: No runtime initialization

## Detailed Implementation Plan

### Phase 1: Project Setup & Dependencies

#### 1.1 Add beautiful-mermaid
```bash
bun add beautiful-mermaid
```

#### 1.2 Remove browser-based assets
- Delete or deprecate `assets/viewer.js` (no longer needed)
- Remove viewer.js copy from vite.config.ts if keeping for backwards compat
- Keep `src/html_template.ts` but simplify (remove toolbar/grid icons)

#### 1.3 Update exports
- Keep existing export: `export default mermaidRenderer`
- Add SVG-only export option: `export const mermaidSvgRenderer` (optional enhancement)

### Phase 2: Core Refactoring - src/index.ts

#### 2.1 Change Import
```typescript
// OLD:
import mermaid from 'mermaid'

// NEW:
import { renderMermaid, THEMES } from 'beautiful-mermaid'
```

#### 2.2 Refactor Renderer Function
Current signature:
```typescript
type MermaidRendererOptions = {
  theme?: string;
  js_url?: string;
  css_url?: string;
  viewer_js_url?: string;
  theme_variables?: Record<string, string>;
  html_only?: boolean;
}
```

New signature (backwards compatible):
```typescript
type MermaidRendererOptions = {
  theme?: string;              // Keep: beautiful-mermaid theme name
  js_url?: string;             // Deprecate: unused, warn if provided
  css_url?: string;            // Deprecate: unused, warn if provided
  viewer_js_url?: string;      // Deprecate: unused, warn if provided
  theme_variables?: Record<string, string>; // Map to beautiful-mermaid theme
  html_only?: boolean;         // Keep: for SVG-only output
  transparent?: boolean;       // New: beautiful-mermaid option
  bg?: string;                 // New: override theme bg
  fg?: string;                 // New: override theme fg
}
```

#### 2.3 Rendering Logic Rewrite

**OLD Logic:**
```typescript
// Generate HTML with inline mermaid.js initialization
// Include viewer.js for interactive controls
// Browser renders mermaid code to SVG dynamically
```

**NEW Logic:**
```typescript
async function renderMermaidToHtml(
  code: string,
  options: MermaidRendererOptions = {}
): Promise<string> {
  // 1. Resolve theme
  const themeName = options.theme || 'default'
  const theme = THEMES[themeName] || THEMES['zinc-light']

  // 2. Merge custom theme variables
  const themeOptions = {
    ...theme,
    ...options.theme_variables,
    bg: options.bg || theme.bg,
    fg: options.fg || theme.fg,
    transparent: options.transparent ?? false,
  }

  // 3. Render SVG server-side
  const svg = await renderMermaid(code, themeOptions)

  // 4. Wrap in HTML
  if (options.html_only) {
    return svg // Return SVG only
  }

  return `<div class="mermaid-wrapper">${svg}</div>`
}
```

#### 2.4 Handle Deprecated Options
Add warnings for deprecated options:
```typescript
if (options.js_url || options.css_url || options.viewer_js_url) {
  console.warn('[markdown-exit-mermaid] Browser-based options (js_url, css_url, viewer_js_url) are deprecated when using beautiful-mermaid. These options will be ignored.')
}
```

### Phase 3: Theme System Migration

#### 3.1 Map Existing Themes to beautiful-mermaid Themes
| Old Mermaid Theme | beautiful-mermaid Theme |
|------------------|------------------------|
| `default` | `zinc-light` |
| `dark` | `zinc-dark` |
| `forest` | `tokyo-night` (closest match) |
| `neutral` | `nord` |
| *custom* | Use `theme_variables` mapping |

#### 3.2 Update src/html_template.ts
- Remove toolbar icons (SVG icons)
- Remove grid panel template
- Keep simple wrapper if needed
- Or remove entirely if using inline HTML

**Simplified version:**
```typescript
export function mermaidWrapper(svg: string): string {
  return `<div class="mermaid">${svg}</div>`
}
```

### Phase 4: Build Configuration Updates

#### 4.1 Update vite.config.ts
- Remove viewer.js from static-copy (if deprecating)
- Keep esbuild minification for other assets
- Ensure beautiful-mermaid is bundled or treated as external

**Decision**: beautiful-mermaid should be **external** (bundled by user's project), not bundled into this plugin.

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MarkdownExitMermaid',
      fileName: (format) => `index.${format.format}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['markdown-exit', 'beautiful-mermaid'], // Don't bundle
      output: {
        globals: {
          'markdown-exit': 'markdownExit',
          'beautiful-mermaid': 'beautifulMermaid'
        }
      }
    }
  },
  plugins: [
    dts({ rollupTypes: true }),
    // Remove viewer.js copy if deprecating
    staticCopy({
      targets: [
        // { src: 'assets/viewer.js', dest: '.' }, // REMOVED
      ]
    })
  ]
})
```

#### 4.2 Update package.json
```json
{
  "dependencies": {
    "beautiful-mermaid": "latest"
  },
  "peerDependencies": {
    "markdown-exit": "*",
    "beautiful-mermaid": "*"  // Add peer dependency
  },
  "peerDependenciesMeta": {
    "markdown-exit": { "optional": true },
    "beautiful-mermaid": { "optional": true }  // Allow user to install their version
  }
}
```

### Phase 5: Test Updates

#### 5.1 Update test/test.ts
Current tests:
```typescript
test('renders flowchart', async () => {
  const result = await mermaidRenderer(`graph TD; A-->B`)
  expect(result).toContain('mermaid')
  expect(result).toContain('class="mermaid"')
})
```

New tests:
```typescript
test('renders flowchart with beautiful-mermaid', async () => {
  const result = await mermaidRenderer(`graph TD; A-->B`)
  expect(result).toContain('<svg')
  expect(result).not.toContain('<script') // No inline scripts
  expect(result).not.toContain('unpkg.com') // No CDN
})

test('renders with theme', async () => {
  const result = await mermaidRenderer(`graph LR; A-->B`, {
    theme: 'tokyo-night'
  })
  expect(result).toContain('<svg') // Should have SVG
})

test('html_only mode', async () => {
  const result = await mermaidRenderer(`graph TD; A-->B`, {
    html_only: true
  })
  expect(result).toMatch(/^<svg/) // Should be SVG-only
  expect(result).not.toContain('<div') // No wrapper
})
```

#### 5.2 Run Tests
```bash
bun test
```

### Phase 6: Documentation Updates

#### 6.1 Update README.md
**Key sections to update:**
- Installation (add beautiful-mermaid)
- Usage examples (remove CDN references)
- Theme system (document beautiful-mermaid themes)
- API reference (update options, mark deprecated)
- Migration guide (from v0.x to v1.0)

**New README structure:**
```markdown
# markdown-exit-mermaid

> Hexo plugin for rendering Mermaid diagrams with beautiful-mermaid

## Features
- Server-side SVG rendering (no browser dependency)
- 15+ built-in themes
- Full theme customization
- Static output (no JavaScript)
- Zero runtime initialization

## Installation
\`\`\`bash
bun add markdown-exit-mermaid beautiful-mermaid
\`\`\`

## Usage
\`\`\`js
import markdownExit from 'markdown-exit'
import mermaidRenderer from 'markdown-exit-mermaid'

hexo.extend.markdown.register({
  renderer: markdown:Exit({
    mermaid: mermaidRenderer
  })
})
\`\`\`

## Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| theme | string | 'zinc-light' | Theme name |
| bg | string | - | Override background color |
| fg | string | - | Override foreground color |
| html_only | boolean | false | Return SVG only |
| theme_variables | object | - | Custom theme colors |

## Themes
Built-in themes: zinc-light, zinc-dark, tokyo-night, tokyo-night-storm, catppuccin-mocha, nord, dracula, github-dark, etc.

## Migration from v0.x
[Migration guide]
\`\`\`

## Breaking Changes Checklist

- [ ] User must now install beautiful-mermaid as dependency
- [ ] js_url, css_url, viewer_js_url options deprecated (warnings only)
- [ ] Output is now static SVG (no interactive controls)
- [ ] Theme names have changed (new mapping)
- [ ] No more viewer.js shipped with package
- [ ] Function is now async (was sync)

## Backwards Compatibility Strategy

1. **Deprecation warnings**: Warn users about deprecated options but don't break
2. **Graceful fallbacks**: If theme not found, default to zinc-light
3. **Documented migration**: Clear guide in README
4. **Version bump**: Release as v1.0.0 (major version change)

## Testing Strategy

1. **Unit tests**: All current tests updated for new output
2. **Integration tests**: Test with actual markdown-exit
3. **Theme tests**: Verify all 15+ themes render correctly
4. **Edge cases**: Invalid mermaid syntax, missing themes, etc.

## Rollout Plan

1. ✅ Create refactoring plan (this document)
2. Implement Phase 1-2 (Setup + Core Refactoring)
3. Implement Phase 3-4 (Themes + Build Config)
4. Implement Phase 5 (Tests)
5. Implement Phase 6 (Documentation)
6. Test thoroughly in staging
7. Release as v1.0.0 with migration guide
8. Update hexo-blog-skeleton (or other consumers)

## Questions/Decisions Needed

1. **Should we deprecate viewer.js entirely?** - Recommendation: Yes, static SVG is better
2. **Should beautiful-mermaid be bundled or external?** - Decision: External (peer dep)
3. **Should we support both old and new renderers?** - Recommendation: No, break cleanly with v1.0
4. **Theme name mapping strategy?** - Decision: Map common themes, default otherwise
