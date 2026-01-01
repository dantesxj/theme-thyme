import { Helpers } from "./helpers";
import { HTML_LAYOUT } from "./PanelForm";
import { presetThemes } from "./presetThemes";

export class Plugin extends AppPlugin {
    Helpers: Helpers = new Helpers();
    STORAGE_KEY: string = "theme-architect";
    onLoad() {
        this.ui.addSidebarItem({
            label: "Theme Architect",
            icon: "analyze",
            tooltip: "Live customisation of colors for thymer",
            onClick: () => {
                this.createAndNavigateToNewPanel();
            },
        });
    }

    public onUnload(): void {
        this.saveCurrentThemeTostorage();
    }

    async createAndNavigateToNewPanel() {
        this.ui.registerCustomPanelType("theme-architect", (panel) => {
            const element = panel.getElement();
            if (element === null) return;
            element.innerHTML = HTML_LAYOUT;
            this.hydrateThemeFromStorage();
            this.setupThemeLogic(element);
        });
        const newPanel = await this.ui.createPanel();
        if (newPanel) {
            newPanel.setTitle("Theme Architect");
            newPanel.navigateToCustomType("theme-architect");
        }
    }

    //WCAG Standards Contrast feedback
    private updateContrastUI(container: HTMLElement) {
        const badge = container.querySelector("#contrast-badge") as HTMLElement;
        const bgInput = container.querySelector(
            '[data-var="--color-bg-700"]'
        ) as HTMLInputElement;
        const txtInput = container.querySelector(
            '[data-var="--color-text-100"]'
        ) as HTMLInputElement;

        if (!badge || !bgInput || !txtInput) return;
        const l1 = this.Helpers.getLuminance(bgInput.value);
        const l2 = this.Helpers.getLuminance(txtInput.value);
        const ratioObject = this.Helpers.calculateContrastRatio(l1, l2);
        badge.textContent = `CONTRAST: ${ratioObject.ratio.toFixed(1)}:1 ${
            ratioObject.pass ? "✅" : "❌"
        }`;
        badge.style.background = ratioObject.pass ? "#a6e3a1" : "#f38ba8";
        badge.style.color = "#11111b";
    }

    private setupThemeLogic(container: HTMLElement): void {
        const themeForm = container.querySelector(
            "#theme-form"
        ) as HTMLFormElement;
        const inputs = container.querySelectorAll<HTMLInputElement>(
            'input[type="color"]'
        );
        const copyBtn = container.querySelector(
            "#copy-css"
        ) as HTMLButtonElement;
        const randomizeBtn = container.querySelector(
            "#randomize-theme"
        ) as HTMLButtonElement;
        const presetSelect = container.querySelector(
            "#theme-preset"
        ) as HTMLSelectElement;

        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            const themeData = JSON.parse(saved);
            Object.entries(themeData).forEach(([varName, hex]) => {
                this.applyThemeVariable(varName, hex as string, container);
            });
            presetSelect.value = "custom";
        } else {
            const defaultTheme = presetThemes[""];
            Object.entries(defaultTheme).forEach(([varName, hex]) => {
                this.applyThemeVariable(varName, hex as string, container);
            });
        }
        const presetOptions = (presetSelect.innerHTML = Object.keys(
            presetThemes
        )
            .map(
                (key) =>
                    `<option value="${key}">${
                        key.charAt(0).toUpperCase() + key.slice(1)
                    }</option>`
            )
            .join(""));
        presetSelect.innerHTML =
            `<option value="custom" id="opt-custom">✨ Custom (Modified)</option>` +
            presetOptions;

        presetSelect.addEventListener("change", () => {
            const selectedTheme = presetThemes[presetSelect.value];
            if (selectedTheme) {
                Object.entries(selectedTheme).forEach(([varName, hex]) => {
                    this.applyThemeVariable(varName, hex as string, container);
                });
                this.updateContrastUI(container);
            }
        });
        randomizeBtn.addEventListener("click", () => {
            // Pick one anchor hue for the whole session
            const masterHue = Math.floor(Math.random() * 360);

            inputs.forEach((input) => {
                const varName = input.dataset.var;
                if (!varName) return;

                let hex: string;

                if (varName.includes("bg")) {
                    // Backgrounds: Low saturation, very low lightness (Dark Theme)
                    hex = this.Helpers.hslToHex(
                        masterHue,
                        15,
                        Math.random() * 10 + 5
                    );
                } else if (
                    varName.includes("primary") ||
                    varName.includes("logo")
                ) {
                    hex = this.Helpers.randomCohesiveHex(masterHue);
                } else if (varName.includes("text")) {
                    hex = this.Helpers.hslToHex(masterHue, 10, 90);
                } else {
                    hex = this.Helpers.randomCohesiveHex(masterHue);
                }

                this.applyThemeVariable(varName, hex, container);
            });

            presetSelect.value = "custom";
            this.updateContrastUI(container);
            this.saveCurrentThemeTostorage();
        });

        themeForm.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            const varName = target.dataset.var;
            if (varName) {
                this.applyThemeVariable(varName, target.value, container);
                this.updateContrastUI(container);
                this.saveCurrentThemeTostorage();
            }
        });
        copyBtn.addEventListener("click", () => {
            const themeName =
                (
                    container.querySelector(
                        "#custom-theme-name"
                    ) as HTMLInputElement
                )?.value || "custom-theme";
            let css = `html[data-theme="basic-${themeName}"] {\n  color-scheme: dark;\n`;
            inputs.forEach((input) => {
                css += `  ${input.dataset.var}: ${input.value};\n`;
            });
            css += `}`;
            navigator.clipboard.writeText(css).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = "✅ COPIED!";
                copyBtn.style.background = "var(--text-ok)";

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = "var(--color-primary-400)";
                }, 2000);
            });
        });
        if (!saved) {
            presetSelect.dispatchEvent(new Event("change"));
        } else {
            this.updateContrastUI(container);
        }
    }

    private applyThemeVariable(
        varName: string,
        hex: string,
        container: HTMLElement
    ) {
        document.documentElement.style.setProperty(varName, hex);
        if (varName === "--color-bg-500")
            document.documentElement.style.setProperty(
                "--color-bg-500-50",
                this.Helpers.hexToRgba(hex, 0.5)
            );
        if (varName === "--color-primary-400") {
            document.documentElement.style.setProperty(
                "--selection-bg",
                this.Helpers.hexToRgba(hex, 0.35)
            );
            document.documentElement.style.setProperty(
                "--color-primary-400-70",
                this.Helpers.hexToRgba(hex, 0.7)
            );
        }

        const input = container.querySelector(
            `input[data-var="${varName}"]`
        ) as HTMLInputElement;
        if (input) input.value = hex;
    }

    private saveCurrentThemeTostorage() {
        const themeData: Record<string, string> = {};
        const inputs = document.querySelectorAll<HTMLInputElement>(
            '#theme-form input[type="color"]'
        );
        if (inputs.length > 0) {
            inputs.forEach((input) => {
                if (input.dataset.var) {
                    themeData[input.dataset.var] = input.value;
                }
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(themeData));
        }
    }
    private hydrateThemeFromStorage() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const themeData = JSON.parse(saved);
                Object.entries(themeData).forEach(([varName, hex]) => {
                    document.documentElement.style.setProperty(
                        varName,
                        hex as string
                    );
                });
            } catch (e) {
                console.error("Failed to load custom theme from storage", e);
            }
        }
    }
}
