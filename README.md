# Theme Architect for Thymer

This repository is a fork/customization of Theme Architect work for Thymer.

‼️ In progress. Created by AI, vibes, and someone who knows nothing about coding! Suggestions and support very welcome! ‼️

Theme Architect is a live CSS editor for Thymer. It helps you preview color-variable changes quickly, try presets, and export a full `html[data-theme="..."]` block for reuse.

## Fork Focus

- Expanded preset and customization workflow used in this workspace
- Faster iteration with copy/export and live preview behavior
- Release artifacts maintained in `latest-release/` for easy install

## Features

- Theme presets, including Catppuccin-inspired and other bundled options
- Live preview of CSS variables on demand
- One-click CSS export with automatic theme-name wrapper
- Reset flow for clearing active custom variables

## Usage

- Open **Theme Architect** from the **status bar** (bottom): click the same **analyze** icon, or use the command palette (**Theme Architect: Open editor**)
- Select a preset or edit variables directly
- Click **PREVIEW** to apply your current theme
- Click **COPY CSS** to export your final theme block

## Install (from `latest-release`)

1. Open Thymer, then open the Plugins screen (`Cmd/Ctrl + P` and search `Plugins`)
2. Choose **Create Plugin** (or edit your existing Theme Architect plugin)
3. Copy **`latest-release/plugin.json`** into the plugin **configuration** tab
4. Copy **`latest-release/plugin.ts`** into the **custom code** tab (one bundled script — no `import` / `export` at the top)
5. Preview, then save

### If you see `Cannot use import statement outside a module`

Thymer runs custom code as a normal script, not an ES module. You almost certainly pasted the **wrong file**:

- **Use:** `latest-release/plugin.ts` (starts with `// @generated` … embedded runtime, then an IIFE bundle).
- **Do not use:** the repo-root **`plugin.ts`** (starts with `import { HTML_LAYOUT }` …). That file is only for `npm run build` / hot reload; esbuild turns it into a single file for Thymer.

## Credits

- Original Theme Architect plugin work by upstream maintainers/contributors
- Fork maintenance and customizations in this repo by `dantesxj`
