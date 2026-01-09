"use strict";
var plugins = (() => {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __name = (target, value) =>
        __defProp(target, "name", { value, configurable: true });
    var __export = (target, all) => {
        for (var name in all)
            __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
        if ((from && typeof from === "object") || typeof from === "function") {
            for (let key of __getOwnPropNames(from))
                if (!__hasOwnProp.call(to, key) && key !== except)
                    __defProp(to, key, {
                        get: () => from[key],
                        enumerable:
                            !(desc = __getOwnPropDesc(from, key)) ||
                            desc.enumerable,
                    });
        }
        return to;
    };
    var __toCommonJS = (mod) =>
        __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // plugin.ts
    var plugin_exports = {};
    __export(plugin_exports, {
        Plugin: () => Plugin,
    });

    // PanelForm.ts
    var HTML_LAYOUT = `
    <div
        id="theme-editor"
        style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; padding: 15px; font-family: 'JetBrains Mono', monospace; color: var(--color-text-100); background: var(--color-bg-900); border-radius: 12px; border: 1px solid var(--color-bg-400); max-height: 95vh; overflow-y: auto;"
    >
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 1rem; color: var(--color-primary-400);">Theme Architect (Copy all Changes Before Closing Panel)</h2>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <select
                id="theme-preset"
                style="flex: 2; padding: 8px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 12px;"
            ></select>
            <button
                id="reset-theme"
                style="flex: 1; padding: 8px; cursor: pointer; background: var(--color-bg-600); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; font-weight: bold;"
            >
                \u{1F5D1}\uFE0F RESET
            </button>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <input 
                id="theme-name" 
                type="text" 
                placeholder="theme-name" 
                style="flex: 2; padding: 8px; background: var(--color-bg-800); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 12px;"
            />
            <select
                id="scheme-select"
                style="flex: 1; padding: 8px; background: var(--color-bg-800); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 12px;"
            >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>

        <div style="flex: 1; min-height: 300px; position: relative;">
            <textarea
                id="css-input"
                spellcheck="false"
                placeholder="--color-name: #hex;"
                style="width: 100%; height: 100%; min-height: 400px; background: var(--color-bg-950); color: #cba6f7; border: 1px solid var(--color-bg-400); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.5; outline: none; resize: vertical;"
            ></textarea>
        </div>

        <button
            id="preview-css"
            style="width: 100%; padding: 10px; cursor: pointer; background: var(--color-primary-400); color: var(--color-bg-900); border: none; border-radius: 4px; font-weight: bold; font-size: 11px;"
        >
            PREVIEW
        </button>

        <button
            id="copy-css"
            style="width: 100%; padding: 10px; cursor: pointer; background: var(--color-primary-400); color: var(--color-bg-900); border: none; border-radius: 4px; font-weight: bold; font-size: 11px;"
        >
            COPY CSS
        </button>
    </div>
`;

    // presetThemes.ts
    var presetThemes = {
        catppuccin_by_jd_and_niklas: {
            // Base backgrounds
            "--color-bg-50": "#bac2de",
            "--color-bg-100": "#a6adc8",
            "--color-bg-150": "#9399b2",
            "--color-bg-200": "#7f849c",
            "--color-bg-300": "#6c7086",
            "--color-bg-400": "#585b70",
            "--color-bg-500": "#45475a",
            "--color-bg-600": "#313244",
            "--color-bg-700": "#1e1e2e",
            "--color-bg-800": "#181825",
            "--color-bg-900": "#11111b",
            "--color-bg-950": "#0a0a12",
            "--color-bg-500-50": "rgba(69, 71, 90, 0.5)",
            "--color-bg-950-50": "rgba(10, 10, 18, 0.65)",
            // Mauve primary
            "--color-primary-50": "#faf5ff",
            "--color-primary-100": "#f3e8fe",
            "--color-primary-200": "#e9d5fd",
            "--color-primary-300": "#d8b4fc",
            "--color-primary-400": "#cba6f7",
            "--color-primary-500": "#b48cf0",
            "--color-primary-600": "#9d71e8",
            "--color-primary-700": "#8657db",
            "--color-primary-800": "#6b3fbd",
            "--color-primary-900": "#502d96",
            "--color-primary-950": "#351d6b",
            "--color-primary-400-70": "rgba(203, 166, 247, 0.7)",
            "--color-primary-950-20": "rgba(53, 29, 107, 0.2)",
            "--color-primary-text-100": "#1e1e2e",
            // Text
            "--color-text-50": "#cdd6f4",
            "--color-text-100": "#ffffff",
            "--color-text-200": "#cdd6f4",
            "--color-text-300": "#cdd6f4",
            "--color-text-400": "#cdd6f4",
            "--color-text-500": "#cdd6f4",
            "--color-text-600": "#6c7086",
            "--color-text-700": "#a6e3a1",
            "--color-text-800": "#cdd6f4",
            "--color-text-900": "#313244",
            "--color-text-950": "#b4befe",
            // Semantic
            "--text-ok": "#a6e3a1",
            "--text-status-online": "#a6e3a1",
            "--text-warning": "#fab387",
            "--text-error": "#f38ba8",
            "--bg-alert": "#f38ba8",
            "--fg-alert": "#1e1e2e",
            // Links
            "--link-color": "#89b4fa",
            "--link-hover-color": "#b4befe",
            "--ed-link-color": "#89b4fa",
            "--ed-link-hover-color": "#b4befe",
            // Hashtags, Mentions, Dates
            "--ed-hashtag-color": "#94e2d5",
            "--ed-hashtag-bg": "rgba(148, 226, 213, 0.15)",
            "--ed-mention-color": "#f5c2e7",
            "--ed-mention-bg": "rgba(245, 194, 231, 0.15)",
            "--ed-mention-hover-bg": "rgba(245, 194, 231, 0.25)",
            "--ed-mention-hover-color": "#f5c2e7",
            "--ed-datetime-color": "#74c7ec",
            "--ed-datetime-bg": "rgba(116, 199, 236, 0.15)",
            // UI Components
            "--ed-check-div-border": "#cba6f7",
            "--ed-check-div-hover-border": "#d8b4fc",
            "--ed-check-done-bg": "#a6e3a1",
            "--ed-check-done-fg": "#1e1e2e",
            "--selection-bg": "rgba(203, 166, 247, 0.35)",
            "--selection-fg": "#cdd6f4",
            "--ed-selection-self-bg": "rgba(203, 166, 247, 0.25)",
            "--ed-selection-blurred-bg": "rgba(203, 166, 247, 0.1)",
            "--ed-quote-border-color": "#b4befe",
            "--ed-code-border": "#45475a",
            "--ed-code-bg": "rgba(49, 50, 68, 0.5)",
            // Surfaces & Sidebar
            "--cards-bg": "#181825",
            "--cards-hover-bg": "#1e1e2e",
            "--cards-border-color": "#313244",
            "--cards-border-color-focused": "#45475a",
            "--side-bg-active-focus": "#cba6f7",
            "--side-fg-active-focus": "#1e1e2e",
            "--sidebar-bg-hover": "#313244",
            // Command Palette & Inputs
            "--cmdpal-bg-color": "#1e1e2e",
            "--cmdpal-selected-bg-color": "#cba6f7",
            "--cmdpal-selected-fg-color": "#1e1e2e",
            "--cmdpal-hover-bg-color": "#313244",
            "--cmdpal-border-color": "#45475a",
            "--input-bg-color": "#181825",
            "--input-border-color": "#45475a",
            "--input-border-focus": "1px solid #cba6f7",
            "--input-border-shadow": "0 0 8px rgba(203, 166, 247, 0.4)",
            // Buttons
            "--button-primary-bg-color": "#cba6f7",
            "--button-primary-fg-color": "#1e1e2e",
            "--button-primary-bg-hover-color": "#d8b4fc",
            "--button-bg-color": "#313244",
            "--button-border-color": "#45475a",
            "--button-bg-hover-color": "#45475a",
            // Logo & Shadows
            "--color-shadow": "rgba(0, 0, 0, 0.25)",
            "--color-shadow-cards": "0 4px 6px rgba(0, 0, 0, 0.2)",
            "--color-shadow-hover": "0 6px 12px rgba(0, 0, 0, 0.3)",
            "--logo-color": "#cba6f7",
            "--logo-glow-shadow":
                "0 0 15px rgba(203, 166, 247, 0.5), 0 0 30px rgba(203, 166, 247, 0.3)",
            // Enums
            "--enum-red-bg": "rgba(243, 139, 168, 0.25)",
            "--enum-red-fg": "#f38ba8",
            "--enum-orange-bg": "rgba(250, 179, 135, 0.25)",
            "--enum-orange-fg": "#fab387",
            "--enum-yellow-bg": "rgba(249, 226, 175, 0.25)",
            "--enum-yellow-fg": "#f9e2af",
            "--enum-green-bg": "rgba(166, 227, 161, 0.25)",
            "--enum-green-fg": "#a6e3a1",
            "--enum-cyan-bg": "rgba(148, 226, 213, 0.25)",
            "--enum-cyan-fg": "#94e2d5",
            "--enum-blue-bg": "rgba(137, 180, 250, 0.25)",
            "--enum-blue-fg": "#89b4fa",
            "--enum-purple-bg": "rgba(203, 166, 247, 0.25)",
            "--enum-purple-fg": "#cba6f7",
            "--enum-pink-bg": "rgba(245, 194, 231, 0.25)",
            "--enum-pink-fg": "#f5c2e7",
        },
        wayward_by_hostile_spoon: {
            "--color-bg-700": "#242220",
            "--color-bg-800": "#1c1b19",
            "--color-bg-900": "#141312",
            "--color-bg-400": "#4a453e",
            "--color-primary-400": "#d79921",
            "--color-text-100": "#ebdbb2",
            "--text-ok": "#b8bb26",
            "--text-warning": "#fe8019",
            "--text-error": "#fb4934",
            "--link-color": "#83a598",
            "--ed-hashtag-color": "#8ec07c",
            "--ed-quote-border-color": "#d3869b",
            "--cards-bg": "#1c1b19",
            "--input-bg-color": "#242220",
            "--logo-color": "#d79921",
        },
        nordic: {
            "--color-bg-700": "#2e3440",
            "--color-bg-800": "#242933",
            "--color-bg-900": "#1b1e25",
            "--color-bg-400": "#4c566a",
            "--color-primary-400": "#88c0d0",
            "--color-text-100": "#eceff4",
            "--text-ok": "#a3be8c",
            "--text-warning": "#ebcb8b",
            "--text-error": "#bf616a",
            "--link-color": "#81a1c1",
            "--ed-hashtag-color": "#8fbcbb",
            "--ed-quote-border-color": "#b48ead",
            "--cards-bg": "#242933",
            "--input-bg-color": "#2e3440",
            "--logo-color": "#88c0d0",
            "--side-bg-active-focus": "#88c0d0",
            "--side-fg-active-focus": "#2e3440",
            "--cmdpal-bg-color": "#2e3440",
            "--cmdpal-selected-bg-color": "#88c0d0",
            "--button-primary-bg-color": "#88c0d0",
            "--enum-purple-fg": "#b48ead",
            "--enum-blue-fg": "#81a1c1",
            "--enum-green-fg": "#a3be8c",
        },
        rose_pine: {
            "--color-bg-700": "#191724",
            "--color-bg-800": "#12101b",
            "--color-bg-900": "#0a0910",
            "--color-bg-400": "#403d52",
            "--color-primary-400": "#ebbcba",
            "--color-text-100": "#e0def4",
            "--text-ok": "#9ccfd8",
            "--text-warning": "#f6c177",
            "--text-error": "#eb6f92",
            "--link-color": "#31748f",
            "--ed-hashtag-color": "#ebbcba",
            "--ed-quote-border-color": "#c4a7e7",
            "--cards-bg": "#1f1d2e",
            "--input-bg-color": "#191724",
            "--logo-color": "#ebbcba",
            "--side-bg-active-focus": "#ebbcba",
            "--side-fg-active-focus": "#191724",
            "--cmdpal-bg-color": "#191724",
            "--cmdpal-selected-bg-color": "#ebbcba",
            "--button-primary-bg-color": "#ebbcba",
            "--enum-purple-fg": "#c4a7e7",
            "--enum-blue-fg": "#31748f",
            "--enum-green-fg": "#9ccfd8",
        },
        cyber_lime: {
            "--color-bg-700": "#050505",
            "--color-bg-800": "#000000",
            "--color-bg-900": "#000000",
            "--color-bg-400": "#222222",
            "--color-primary-400": "#ccff00",
            "--color-text-100": "#ffffff",
            "--text-ok": "#00ff88",
            "--text-warning": "#ffff00",
            "--text-error": "#ff0055",
            "--link-color": "#00ccff",
            "--ed-hashtag-color": "#ccff00",
            "--ed-quote-border-color": "#333333",
            "--cards-bg": "#0a0a0a",
            "--input-bg-color": "#111111",
            "--logo-color": "#ccff00",
            "--side-bg-active-focus": "#ccff00",
            "--side-fg-active-focus": "#000000",
            "--button-primary-bg-color": "#ccff00",
            "--input-border-focus": "1px solid #ccff00",
            "--logo-glow-shadow": "0 0 15px rgba(204, 255, 0, 0.5)",
        },
        tokyo_night: {
            "--color-bg-700": "#1a1b26",
            "--color-bg-800": "#16161e",
            "--color-bg-900": "#101014",
            "--color-bg-400": "#414868",
            "--color-primary-400": "#7aa2f7",
            "--color-text-100": "#c0caf5",
            "--text-ok": "#9ece6a",
            "--text-warning": "#e0af68",
            "--text-error": "#f7768e",
            "--link-color": "#2ac3de",
            "--ed-hashtag-color": "#bb9af7",
            "--ed-quote-border-color": "#cfc9c2",
            "--cards-bg": "#16161e",
            "--input-bg-color": "#1a1b26",
            "--logo-color": "#7aa2f7",
            "--side-bg-active-focus": "#7aa2f7",
            "--side-fg-active-focus": "#1a1b26",
            "--cmdpal-bg-color": "#1a1b26",
            "--cmdpal-selected-bg-color": "#7aa2f7",
            "--enum-purple-fg": "#bb9af7",
            "--enum-blue-fg": "#7aa2f7",
            "--enum-cyan-fg": "#2ac3de",
        },
        monokai_pro: {
            "--color-bg-700": "#2d2a2e",
            "--color-bg-800": "#221f22",
            "--color-bg-900": "#19181a",
            "--color-bg-400": "#5b595c",
            "--color-primary-400": "#ffd866",
            "--color-text-100": "#fcfcfa",
            "--text-ok": "#a9dc76",
            "--text-warning": "#fc9867",
            "--text-error": "#ff6188",
            "--link-color": "#78dce8",
            "--ed-hashtag-color": "#ab9df2",
            "--ed-quote-border-color": "#727072",
            "--cards-bg": "#221f22",
            "--input-bg-color": "#2d2a2e",
            "--logo-color": "#ffd866",
            "--side-bg-active-focus": "#ffd866",
            "--side-fg-active-focus": "#2d2a2e",
            "--button-primary-bg-color": "#ffd866",
            "--enum-pink-fg": "#ff6188",
            "--enum-orange-fg": "#fc9867",
            "--enum-yellow-fg": "#ffd866",
        },
        everforest: {
            "--color-bg-700": "#2d353b",
            "--color-bg-800": "#232a2e",
            "--color-bg-900": "#1e2326",
            "--color-bg-400": "#505a60",
            "--color-primary-400": "#a7c080",
            "--color-text-100": "#d3c6aa",
            "--text-ok": "#83c092",
            "--text-warning": "#dbbc7f",
            "--text-error": "#e67e80",
            "--link-color": "#7fbbb3",
            "--ed-hashtag-color": "#d699b6",
            "--ed-quote-border-color": "#859289",
            "--cards-bg": "#232a2e",
            "--input-bg-color": "#2d353b",
            "--logo-color": "#a7c080",
            "--side-bg-active-focus": "#a7c080",
            "--side-fg-active-focus": "#2d353b",
            "--cmdpal-selected-bg-color": "#a7c080",
            "--button-primary-bg-color": "#a7c080",
            "--enum-green-fg": "#83c092",
            "--enum-yellow-fg": "#dbbc7f",
        },
        dracula: {
            "--color-bg-700": "#282a36",
            "--color-bg-800": "#1e1f29",
            "--color-bg-900": "#191a21",
            "--color-bg-400": "#44475a",
            "--color-primary-400": "#bd93f9",
            "--color-text-100": "#f8f8f2",
            "--text-ok": "#50fa7b",
            "--text-warning": "#ffb86c",
            "--text-error": "#ff5555",
            "--link-color": "#8be9fd",
            "--ed-hashtag-color": "#ff79c6",
            "--ed-quote-border-color": "#6272a4",
            "--cards-bg": "#1e1f29",
            "--input-bg-color": "#282a36",
            "--logo-color": "#bd93f9",
            "--side-bg-active-focus": "#bd93f9",
            "--side-fg-active-focus": "#282a36",
            "--button-primary-bg-color": "#bd93f9",
            "--cmdpal-selected-bg-color": "#bd93f9",
            "--enum-purple-fg": "#bd93f9",
            "--enum-pink-fg": "#ff79c6",
        },
        synthwave_84: {
            "--color-bg-700": "#2b213a",
            "--color-bg-800": "#241b2f",
            "--color-bg-900": "#1f1826",
            "--color-bg-400": "#493e5b",
            "--color-primary-400": "#ff7edb",
            "--color-text-100": "#ffffff",
            "--text-ok": "#72f1b8",
            "--text-warning": "#fede5d",
            "--text-error": "#fe4450",
            "--link-color": "#03edf9",
            "--ed-hashtag-color": "#ff7edb",
            "--ed-quote-border-color": "#34294f",
            "--cards-bg": "#241b2f",
            "--input-bg-color": "#2b213a",
            "--logo-color": "#fede5d",
            "--side-bg-active-focus": "#ff7edb",
            "--side-fg-active-focus": "#2b213a",
            "--logo-glow-shadow": "0 0 15px rgba(255, 126, 219, 0.6)",
            "--button-primary-bg-color": "#ff7edb",
        },
        solarized_dark: {
            // Base backgrounds (The iconic Solarized Blue/Greys)
            "--color-bg-700": "#073642",
            // Base02
            "--color-bg-800": "#002b36",
            // Base03
            "--color-bg-900": "#001e26",
            // Deeper Base
            "--color-bg-400": "#586e75",
            // Base01
            "--color-primary-400": "#268bd2",
            // Blue
            "--color-text-100": "#93a1a1",
            // Base1
            "--text-ok": "#859900",
            // Green
            "--text-warning": "#cb4b16",
            // Orange
            "--text-error": "#dc322f",
            // Red
            "--link-color": "#2aa198",
            // Cyan
            "--ed-hashtag-color": "#b58900",
            // Yellow
            "--ed-quote-border-color": "#657b83",
            // Base00
            "--cards-bg": "#002b36",
            "--input-bg-color": "#073642",
            "--logo-color": "#268bd2",
            "--side-bg-active-focus": "#268bd2",
            "--side-fg-active-focus": "#fdf6e3",
            // Base3
            "--cmdpal-selected-bg-color": "#268bd2",
            "--button-primary-bg-color": "#268bd2",
            "--enum-yellow-fg": "#b58900",
            "--enum-purple-fg": "#6c71c4",
            // Violet
        },
        ayo_dark: {
            // Vibrant, high-contrast modern dark
            "--color-bg-700": "#1f2430",
            "--color-bg-800": "#171b24",
            "--color-bg-900": "#0f131a",
            "--color-bg-400": "#3e4b59",
            "--color-primary-400": "#ffcc66",
            // Gold/Yellow
            "--color-text-100": "#cbccc6",
            "--text-ok": "#bae67e",
            "--text-warning": "#ffa759",
            "--text-error": "#ff3333",
            "--link-color": "#5ccfe6",
            "--ed-hashtag-color": "#ffd580",
            "--ed-quote-border-color": "#707a8c",
            "--cards-bg": "#171b24",
            "--input-bg-color": "#1f2430",
            "--logo-color": "#ffcc66",
            "--side-bg-active-focus": "#ffcc66",
            "--side-fg-active-focus": "#0f131a",
            "--cmdpal-selected-bg-color": "#ffcc66",
            "--button-primary-bg-color": "#ffcc66",
            "--enum-purple-fg": "#d4bfff",
            "--enum-blue-fg": "#73d0ff",
            "--enum-green-fg": "#bae67e",
        },
    };

    // plugin.ts
    var Plugin = class extends AppPlugin {
        static {
            __name(this, "Plugin");
        }
        STORAGE_KEY = "theme-architect-raw-css";
        onLoad() {
            this.ui.addSidebarItem({
                label: "Theme Architect",
                icon: "analyze",
                tooltip: "Live CSS Editor",
                onClick: /* @__PURE__ */ __name(() => {
                    this.createAndNavigateToNewPanel();
                }, "onClick"),
            });
        }
        onUnload() {
            const panel = this.ui.getActivePanel();
            const element = panel?.getElement();
            const cssInput = element?.querySelector("#css-input");
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
        clearActiveStyles(cssContent) {
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
        resetTheme(cssInput) {
            this.clearActiveStyles(cssInput.value);
            document.documentElement.style.removeProperty("color-scheme");
            cssInput.value = "";
        }
        /**
         * Ensures color-scheme is the very first line of the textarea
         */
        updateColorSchemeInText(textarea, scheme) {
            const currentText = textarea.value;
            const schemeLine = `color-scheme: ${scheme};`;
            const cleanedText = currentText.replace(
                /^color-scheme: (dark|light|white);?\n?/m,
                ""
            );
            textarea.value = schemeLine + "\n" + cleanedText.trimStart();
        }
        setupThemeLogic(container) {
            const cssInput = container.querySelector("#css-input");
            const presetSelect = container.querySelector("#theme-preset");
            const schemeSelect = container.querySelector("#scheme-select");
            const themeNameInput = container.querySelector("#theme-name");
            const resetBtn = container.querySelector("#reset-theme");
            const previewBtn = container.querySelector("#preview-css");
            const copyBtn = container.querySelector("#copy-css");
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
                `<option value="default">\u2728 Default (Reset)</option><option value="custom" hidden>\u{1F6E0}\uFE0F Custom (Modified)</option>` +
                presetOptionsMarkup;
            cssInput.value = "";
            presetSelect.value = "default";
            presetSelect.addEventListener("change", () => {
                const selectedKey = presetSelect.value;
                if (selectedKey === "default") {
                    this.resetTheme(cssInput);
                } else if (selectedKey !== "custom") {
                    this.clearActiveStyles(cssInput.value);
                    this.loadPresetIntoTextarea(selectedKey, cssInput);
                    this.updateColorSchemeInText(cssInput, schemeSelect.value);
                    this.applyCSSFromText(cssInput.value);
                }
            });
            schemeSelect.addEventListener("change", () => {
                this.updateColorSchemeInText(cssInput, schemeSelect.value);
                document.documentElement.style.setProperty(
                    "color-scheme",
                    schemeSelect.value
                );
                this.applyCSSFromText(cssInput.value);
            });
            cssInput.addEventListener("input", () => {
                if (presetSelect.value !== "custom") {
                    presetSelect.value = "custom";
                }
            });
            resetBtn.addEventListener("click", () => {
                this.resetTheme(cssInput);
                presetSelect.value = "default";
                themeNameInput.value = "";
            });
            previewBtn.addEventListener("click", () => {
                this.applyCSSFromText(cssInput.value);
                const originalText = previewBtn.textContent;
                previewBtn.textContent = "\u26A1 APPLIED";
                setTimeout(() => (previewBtn.textContent = originalText), 1e3);
            });
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
                const finalOutput = `html[data-theme="${finalThemeName}"] {
${cleanLines}
}`;
                navigator.clipboard.writeText(finalOutput).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = "\u2705 COPIED!";
                    setTimeout(() => (copyBtn.textContent = originalText), 2e3);
                });
            });
        }
        loadPresetIntoTextarea(key, textarea) {
            const theme = presetThemes[key];
            if (!theme) return;
            textarea.value = Object.entries(theme)
                .map(([k, v]) => `${k}: ${v};`)
                .join("\n");
        }
        applyCSSFromText(css) {
            const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
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
    };
    return __toCommonJS(plugin_exports);
})();
