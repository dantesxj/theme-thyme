/* Dev / esbuild entry only — do NOT paste into Thymer (uses import/export). Ship: latest-release/plugin.ts */
import { HTML_LAYOUT } from "./PanelForm";
import { presetThemes } from "./presetThemes";

export class Plugin extends AppPlugin {
    STORAGE_KEY: string = "theme-architect-raw-css";

    private _statusBarItem: ReturnType<UIAPI["addStatusBarItem"]> | null = null;
    private _cmdOpenEditor: ReturnType<UIAPI["addCommandPaletteCommand"]> | null =
        null;

    onLoad() {
        this._statusBarItem =
            this.ui.addStatusBarItem?.({
                icon: "analyze",
                tooltip: "Theme Architect — live theme editor",
                onClick: () => {
                    void this.createAndNavigateToNewPanel();
                },
            }) ?? null;
        this._cmdOpenEditor = this.ui.addCommandPaletteCommand({
            label: "Theme Architect: Open editor",
            icon: "analyze",
            onSelected: () => {
                void this.createAndNavigateToNewPanel();
            },
        });
    }

    onUnload() {
        try {
            this._statusBarItem?.remove?.();
        } catch (_) {}
        try {
            this._cmdOpenEditor?.remove?.();
        } catch (_) {}
        this._statusBarItem = null;
        this._cmdOpenEditor = null;

        const panel = this.ui.getActivePanel();
        const element = panel?.getElement();
        const cssInput = element?.querySelector(
            "#css-input"
        ) as HTMLTextAreaElement;

        // Cleanup styles from the document when the plugin/panel is closed
        if (cssInput) {
            this.resetTheme(cssInput);
        }
    }

    async createAndNavigateToNewPanel() {
        this.ui.registerCustomPanelType("theme-architect", (panel) => {
            const element = panel.getElement();
            if (element === null) return;
            element.innerHTML = HTML_LAYOUT;
            this.setupThemeLogic(element);
        });

        const newPanel = await this.ui.createPanel();
        if (newPanel) {
            newPanel.setTitle("Theme Architect");
            newPanel.navigateToCustomType("theme-architect");
        }
    }

    /**
     * Clears specific CSS variables from the document root based on input text
     */
    private clearActiveStyles(cssContent: string) {
        if (!cssContent) return;
        const regex = /(--[\w-]+)/g;
        const matches = cssContent.match(regex);
        if (matches) {
            [...new Set(matches)].forEach((prop) => {
                document.documentElement.style.removeProperty(prop.trim());
            });
        }
    }

    /**
     * Resets the UI and removes all custom document styles
     */
    private resetTheme(cssInput: HTMLTextAreaElement) {
        this.clearActiveStyles(cssInput.value);
        document.documentElement.style.removeProperty("color-scheme");
        cssInput.value = "";
    }

    /**
     * Ensures color-scheme is the very first line of the textarea
     */
    private updateColorSchemeInText(
        textarea: HTMLTextAreaElement,
        scheme: string
    ) {
        const currentText = textarea.value;
        const schemeLine = `color-scheme: ${scheme};`;

        // Remove any existing color-scheme line
        const cleanedText = currentText.replace(
            /^color-scheme: (dark|light|white);?\n?/m,
            ""
        );

        // Prepend the new one
        textarea.value = schemeLine + "\n" + cleanedText.trimStart();
    }

    private setupThemeLogic(container: HTMLElement): void {
        const cssInput = container.querySelector(
            "#css-input"
        ) as HTMLTextAreaElement;
        const presetSelect = container.querySelector(
            "#theme-preset"
        ) as HTMLSelectElement;
        const schemeSelect = container.querySelector(
            "#scheme-select"
        ) as HTMLSelectElement;
        const themeNameInput = container.querySelector(
            "#theme-name"
        ) as HTMLInputElement;
        const resetBtn = container.querySelector(
            "#reset-theme"
        ) as HTMLButtonElement;
        const previewBtn = container.querySelector(
            "#preview-css"
        ) as HTMLButtonElement;
        const copyBtn = container.querySelector(
            "#copy-css"
        ) as HTMLButtonElement;

        // 1. Populate Dropdown (Alphabetical)
        const sortedKeys = Object.keys(presetThemes).sort();
        const presetOptionsMarkup = sortedKeys
            .map(
                (key) =>
                    `<option value="${key}">${key
                        .replace(/_/g, " ")
                        .toUpperCase()}</option>`
            )
            .join("");

        presetSelect.innerHTML =
            `<option value="default">✨ Default (Reset)</option>` +
            `<option value="custom" hidden>🛠️ Custom (Modified)</option>` +
            presetOptionsMarkup;

        // 2. Set Initial State
        cssInput.value = "";
        presetSelect.value = "default";

        // 3. Theme Selection Logic
        presetSelect.addEventListener("change", () => {
            const selectedKey = presetSelect.value;

            if (selectedKey === "default") {
                this.resetTheme(cssInput);
            } else if (selectedKey !== "custom") {
                // IMPORTANT: Wipe old variables before loading new ones
                this.clearActiveStyles(cssInput.value);

                this.loadPresetIntoTextarea(selectedKey, cssInput);
                this.updateColorSchemeInText(cssInput, schemeSelect.value);

                // Auto-apply preview
                this.applyCSSFromText(cssInput.value);
            }
        });

        // 4. Color Scheme Switcher
        schemeSelect.addEventListener("change", () => {
            this.updateColorSchemeInText(cssInput, schemeSelect.value);
            document.documentElement.style.setProperty(
                "color-scheme",
                schemeSelect.value
            );
            // Re-apply styles to ensure sync
            this.applyCSSFromText(cssInput.value);
        });

        // 5. Manual Text Editing
        cssInput.addEventListener("input", () => {
            if (presetSelect.value !== "custom") {
                presetSelect.value = "custom";
            }
        });

        // 6. Reset Button
        resetBtn.addEventListener("click", () => {
            this.resetTheme(cssInput);
            presetSelect.value = "default";
            themeNameInput.value = "";
        });

        // 7. Preview Button
        previewBtn.addEventListener("click", () => {
            this.applyCSSFromText(cssInput.value);
            const originalText = previewBtn.textContent;
            previewBtn.textContent = "⚡ APPLIED";
            setTimeout(() => (previewBtn.textContent = originalText), 1000);
        });

        // 8. Copy Button (with basic- prefixing)
        copyBtn.addEventListener("click", () => {
            const rawName =
                themeNameInput.value
                    .trim()
                    .replace(/\s+/g, "-")
                    .toLowerCase() || "custom-theme";
            const finalThemeName = `basic-${rawName}`;

            const cleanLines = cssInput.value
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line) => `  ${line}`)
                .join("\n");

            const finalOutput = `html[data-theme="${finalThemeName}"] {\n${cleanLines}\n}`;

            navigator.clipboard.writeText(finalOutput).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = "✅ COPIED!";
                setTimeout(() => (copyBtn.textContent = originalText), 2000);
            });
        });
    }

    private loadPresetIntoTextarea(key: string, textarea: HTMLTextAreaElement) {
        const theme = presetThemes[key];
        if (!theme) return;
        textarea.value = Object.entries(theme)
            .map(([k, v]) => `${k}: ${v};`)
            .join("\n");
    }

    private applyCSSFromText(css: string) {
        // Match variables
        const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
        // Match color scheme
        const schemeRegex = /color-scheme:\s*(dark|light|white);/i;

        let match;
        while ((match = varRegex.exec(css)) !== null) {
            const prop = match[1].trim();
            const val = match[2].trim();
            if (prop && val) {
                document.documentElement.style.setProperty(prop, val);
            }
        }

        const schemeMatch = css.match(schemeRegex);
        if (schemeMatch) {
            document.documentElement.style.setProperty(
                "color-scheme",
                schemeMatch[1].trim()
            );
        }
    }
}
