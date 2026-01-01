"use strict";
var plugins = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // plugin.ts
  var plugin_exports = {};
  __export(plugin_exports, {
    Plugin: () => Plugin
  });

  // helpers.ts
  var Helpers = class {
    static {
      __name(this, "Helpers");
    }
    getLuminance(hex) {
      const rgb = hex.match(/\w\w/g)?.map((x) => {
        const val = parseInt(x, 16) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      }) || [0, 0, 0];
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }
    calculateContrastRatio(l1, l2) {
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const pass = ratio > 4.5;
      return { ratio, pass };
    }
    hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    randomCohesiveHex(baseHue) {
      const h = baseHue !== void 0 ? (baseHue + (Math.random() * 60 - 30) + 360) % 360 : Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 40 + 40);
      const l = Math.floor(Math.random() * 20 + 50);
      return this.hslToHex(h, s, l);
    }
    hslToHex(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = /* @__PURE__ */ __name((n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      }, "f");
      return `#${f(0)}${f(8)}${f(4)}`;
    }
  };

  // PanelForm.ts
  function createScaleInput(label, varName, defaultVal) {
    return `
        <div style="flex: 1 1 calc(33% - 10px); min-width: 110px; background: var(--color-bg-800); padding: 8px; border-radius: 6px; border: 1px solid var(--color-bg-400); box-sizing: border-box;">
            <label style="display:block; font-size: 8px; margin-bottom: 4px; color: var(--color-text-500); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">${label}</label>
            <input type="color" data-var="${varName}" value="${defaultVal}" style="width: 100%; height: 24px; border: none; cursor: pointer; background: transparent; display: block;">
        </div>
    `;
  }
  __name(createScaleInput, "createScaleInput");
  var sectionHeader = /* @__PURE__ */ __name((title) => `
    <div style="width: 100%; margin-top: 15px; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid var(--color-bg-400);">
        <span style="font-size: 10px; font-weight: 800; color: var(--color-primary-400); text-transform: uppercase; letter-spacing: 1px;">${title}</span>
    </div>
`, "sectionHeader");
  var HTML_LAYOUT = `
    <div
        id="theme-editor"
        style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; padding: 15px; font-family: 'JetBrains Mono', monospace; color: var(--color-text-100); background: var(--color-bg-900); border-radius: 12px; border: 1px solid var(--color-bg-400); max-height: 95vh; overflow-y: auto;"
    >
        <div
            style="display: flex; justify-content: space-between; align-items: center;"
        >
            <h2
                style="margin: 0; font-size: 1rem; color: var(--color-primary-400);"
            >
                Theme Architect
            </h2>
            <div
                id="contrast-badge"
                style="padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; background: var(--color-bg-800); border: 1px solid var(--color-bg-400); transition: all 0.3s ease;"
            >
                CONTRAST: --
            </div>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <select
                id="theme-preset"
                style="flex: 2; padding: 8px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 12px; cursor: pointer;"
            ></select>
            <button
                id="randomize-theme"
                style="flex: 1; padding: 8px; cursor: pointer; background: var(--color-bg-600); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; font-weight: bold;"
            >
                \u{1F3B2} RANDOM
            </button>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <input
                type="text"
                id="custom-theme-name"
                placeholder="my-custom-theme"
                style="flex: 2; padding: 8px; background: var(--color-bg-700); border: 1px solid var(--color-bg-400); color: var(--color-text-100); border-radius: 4px; font-size: 11px;"
            />
            <button
                id="copy-css"
                style="flex: 1; padding: 8px; cursor: pointer; background: var(--color-primary-400); color: var(--color-bg-900); border: none; border-radius: 4px; font-weight: bold; font-size: 11px;"
            >
                COPY CSS
            </button>
        </div>

        <form
            id="theme-form"
            style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;"
        >
            ${sectionHeader("Background Scale")}
            ${createScaleInput("bg-50", "--color-bg-50", "#bac2de")}
            ${createScaleInput("bg-100", "--color-bg-100", "#a6adc8")}
            ${createScaleInput("bg-150", "--color-bg-150", "#9399b2")}
            ${createScaleInput("bg-200", "--color-bg-200", "#7f849c")}
            ${createScaleInput("bg-300", "--color-bg-300", "#6c7086")}
            ${createScaleInput("bg-400", "--color-bg-400", "#585b70")}
            ${createScaleInput("bg-500", "--color-bg-500", "#45475a")}
            ${createScaleInput("bg-600", "--color-bg-600", "#313244")}
            ${createScaleInput("bg-700 (Base)", "--color-bg-700", "#1e1e2e")}
            ${createScaleInput("bg-800 (Mantle)", "--color-bg-800", "#181825")}
            ${createScaleInput("bg-900 (Crust)", "--color-bg-900", "#11111b")}
            ${createScaleInput("bg-950", "--color-bg-950", "#0a0a12")}
            ${sectionHeader("Primary Accent")}
            ${createScaleInput("pri-50", "--color-primary-50", "#faf5ff")}
            ${createScaleInput("pri-200", "--color-primary-200", "#e9d5fd")}
            ${createScaleInput(
    "pri-400 (Main)",
    "--color-primary-400",
    "#cba6f7"
  )}
            ${createScaleInput("pri-600", "--color-primary-600", "#9d71e8")}
            ${createScaleInput("pri-800", "--color-primary-800", "#6b3fbd")}
            ${createScaleInput("pri-950", "--color-primary-950", "#351d6b")}
            ${sectionHeader("Typography")}
            ${createScaleInput("Text High", "--color-text-100", "#ffffff")}
            ${createScaleInput("Text Med", "--color-text-50", "#cdd6f4")}
            ${createScaleInput("Text Low", "--color-text-500", "#7f849c")}
            ${createScaleInput("Text Muted", "--color-text-700", "#6c7086")}
            ${sectionHeader("Semantic & Links")}
            ${createScaleInput("Success", "--text-ok", "#a6e3a1")}
            ${createScaleInput("Warning", "--text-warning", "#fab387")}
            ${createScaleInput("Error", "--text-error", "#f38ba8")}
            ${createScaleInput("Link", "--link-color", "#89b4fa")}
            ${sectionHeader("Editor Elements")}
            ${createScaleInput("Hashtag", "--ed-hashtag-color", "#94e2d5")}
            ${createScaleInput("Mention", "--ed-mention-color", "#f5c2e7")}
            ${createScaleInput("Date/Time", "--ed-datetime-color", "#74c7ec")}
            ${createScaleInput(
    "Quote Border",
    "--ed-quote-border-color",
    "#b4befe"
  )}
            ${createScaleInput("Todo Done", "--ed-check-done-bg", "#a6e3a1")}
            ${sectionHeader("UI Components")}
            ${createScaleInput(
    "Sidebar Active",
    "--side-bg-active-focus",
    "#313244"
  )}
            ${createScaleInput("Card Background", "--cards-bg", "#181825")}
            ${createScaleInput(
    "Input Background",
    "--input-bg-color",
    "#11111b"
  )}
            ${createScaleInput("Logo Color", "--logo-color", "#cba6f7")}
        </form>

        <div
            style="font-size: 9px; color: var(--color-text-700); text-align: center; margin-top: 10px;"
        >
            Changes are applied live to the application root.
        </div>
    </div>
`;

  // presetThemes.ts
  var presetThemes = {
    catppuccin_by_jd_and_niklas: {
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
      "--color-primary-400": "#cba6f7",
      "--color-primary-600": "#9d71e8",
      "--color-text-100": "#ffffff",
      "--text-ok": "#a6e3a1",
      "--text-warning": "#fab387",
      "--text-error": "#f38ba8",
      "--link-color": "#89b4fa",
      "--ed-hashtag-color": "#94e2d5",
      "--ed-quote-border-color": "#b4befe",
      "--cards-bg": "#181825",
      "--input-bg-color": "#181825",
      "--logo-color": "#cba6f7",
      "--side-bg-active-focus": "#cba6f7"
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
      "--logo-color": "#d79921"
    },
    nordic: {
      // Deep Arctic Blues
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
      "--logo-color": "#88c0d0"
    },
    rose_pine: {
      // Muted Soft Palette
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
      "--logo-color": "#ebbcba"
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
      "--logo-color": "#ccff00"
    }
  };

  // plugin.ts
  var Plugin = class extends AppPlugin {
    static {
      __name(this, "Plugin");
    }
    Helpers = new Helpers();
    STORAGE_KEY = "theme-architect";
    onLoad() {
      this.hydrateThemeFromStorage();
      this.ui.addSidebarItem({
        label: "Theme Architect",
        icon: "analyze",
        tooltip: "Live customisation of colors for thymer",
        onClick: /* @__PURE__ */ __name(() => {
          this.createAndNavigateToNewPanel();
        }, "onClick")
      });
    }
    onUnload() {
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
    updateContrastUI(container) {
      const badge = container.querySelector("#contrast-badge");
      const bgInput = container.querySelector(
        '[data-var="--color-bg-700"]'
      );
      const txtInput = container.querySelector(
        '[data-var="--color-text-100"]'
      );
      if (!badge || !bgInput || !txtInput) return;
      const l1 = this.Helpers.getLuminance(bgInput.value);
      const l2 = this.Helpers.getLuminance(txtInput.value);
      const ratioObject = this.Helpers.calculateContrastRatio(l1, l2);
      badge.textContent = `CONTRAST: ${ratioObject.ratio.toFixed(1)}:1 ${ratioObject.pass ? "\u2705" : "\u274C"}`;
      badge.style.background = ratioObject.pass ? "#a6e3a1" : "#f38ba8";
      badge.style.color = "#11111b";
    }
    setupThemeLogic(container) {
      const themeForm = container.querySelector(
        "#theme-form"
      );
      const inputs = container.querySelectorAll(
        'input[type="color"]'
      );
      const copyBtn = container.querySelector(
        "#copy-css"
      );
      const randomizeBtn = container.querySelector(
        "#randomize-theme"
      );
      const presetSelect = container.querySelector(
        "#theme-preset"
      );
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const themeData = JSON.parse(saved);
        Object.entries(themeData).forEach(([varName, hex]) => {
          this.applyThemeVariable(varName, hex, container);
        });
        presetSelect.value = "custom";
      } else {
        const firstPresetKey = Object.keys(presetThemes)[0];
        const defaultTheme = presetThemes[firstPresetKey];
        if (defaultTheme) {
          Object.entries(defaultTheme).forEach(([varName, hex]) => {
            this.applyThemeVariable(varName, hex, container);
          });
          presetSelect.value = firstPresetKey;
        }
      }
      const presetOptionsMarkup = Object.keys(presetThemes).map(
        (key) => `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
      ).join("");
      presetSelect.innerHTML = `<option value="custom" id="opt-custom">\u2728 Custom (Modified)</option>` + presetOptionsMarkup;
      presetSelect.addEventListener("change", () => {
        const selectedTheme = presetThemes[presetSelect.value];
        if (selectedTheme) {
          Object.entries(selectedTheme).forEach(([varName, hex]) => {
            this.applyThemeVariable(varName, hex, container);
          });
          this.updateContrastUI(container);
        }
      });
      randomizeBtn.addEventListener("click", () => {
        const masterHue = Math.floor(Math.random() * 360);
        inputs.forEach((input) => {
          const varName = input.dataset.var;
          if (!varName) return;
          let hex;
          if (varName.includes("bg")) {
            hex = this.Helpers.hslToHex(
              masterHue,
              15,
              Math.random() * 10 + 5
            );
          } else if (varName.includes("primary") || varName.includes("logo")) {
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
        const target = e.target;
        const varName = target.dataset.var;
        if (varName) {
          this.applyThemeVariable(varName, target.value, container);
          this.updateContrastUI(container);
          this.saveCurrentThemeTostorage();
        }
      });
      copyBtn.addEventListener("click", () => {
        const themeName = container.querySelector(
          "#custom-theme-name"
        )?.value || "custom-theme";
        let css = `html[data-theme="basic-${themeName}"] {
  color-scheme: dark;
`;
        inputs.forEach((input) => {
          css += `  ${input.dataset.var}: ${input.value};
`;
        });
        css += `}`;
        navigator.clipboard.writeText(css).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = "\u2705 COPIED!";
          copyBtn.style.background = "var(--text-ok)";
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = "var(--color-primary-400)";
          }, 2e3);
        });
      });
      if (!saved) {
        presetSelect.dispatchEvent(new Event("change"));
      } else {
        this.updateContrastUI(container);
      }
    }
    applyThemeVariable(varName, hex, container) {
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
      );
      if (input) input.value = hex;
    }
    saveCurrentThemeTostorage() {
      const themeData = {};
      const inputs = document.querySelectorAll(
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
    hydrateThemeFromStorage() {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      let themeData;
      if (saved) {
        try {
          themeData = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load custom theme from storage", e);
        }
      }
      if (!themeData) {
        const firstPresetKey = Object.keys(presetThemes)[0];
        themeData = presetThemes[firstPresetKey];
      }
      if (themeData) {
        Object.entries(themeData).forEach(([varName, hex]) => {
          document.documentElement.style.setProperty(
            varName,
            hex
          );
        });
      }
    }
  };
  return __toCommonJS(plugin_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcGx1Z2luLnRzIiwgIi4uL2hlbHBlcnMudHMiLCAiLi4vUGFuZWxGb3JtLnRzIiwgIi4uL3ByZXNldFRoZW1lcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgSGVscGVycyB9IGZyb20gXCIuL2hlbHBlcnNcIjtcclxuaW1wb3J0IHsgSFRNTF9MQVlPVVQgfSBmcm9tIFwiLi9QYW5lbEZvcm1cIjtcclxuaW1wb3J0IHsgcHJlc2V0VGhlbWVzIH0gZnJvbSBcIi4vcHJlc2V0VGhlbWVzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUGx1Z2luIGV4dGVuZHMgQXBwUGx1Z2luIHtcclxuICAgIEhlbHBlcnM6IEhlbHBlcnMgPSBuZXcgSGVscGVycygpO1xyXG4gICAgU1RPUkFHRV9LRVk6IHN0cmluZyA9IFwidGhlbWUtYXJjaGl0ZWN0XCI7XHJcbiAgICBvbkxvYWQoKSB7XHJcbiAgICAgICAgdGhpcy5oeWRyYXRlVGhlbWVGcm9tU3RvcmFnZSgpO1xyXG4gICAgICAgIHRoaXMudWkuYWRkU2lkZWJhckl0ZW0oe1xyXG4gICAgICAgICAgICBsYWJlbDogXCJUaGVtZSBBcmNoaXRlY3RcIixcclxuICAgICAgICAgICAgaWNvbjogXCJhbmFseXplXCIsXHJcbiAgICAgICAgICAgIHRvb2x0aXA6IFwiTGl2ZSBjdXN0b21pc2F0aW9uIG9mIGNvbG9ycyBmb3IgdGh5bWVyXCIsXHJcbiAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQW5kTmF2aWdhdGVUb05ld1BhbmVsKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uVW5sb2FkKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2F2ZUN1cnJlbnRUaGVtZVRvc3RvcmFnZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZUFuZE5hdmlnYXRlVG9OZXdQYW5lbCgpIHtcclxuICAgICAgICB0aGlzLnVpLnJlZ2lzdGVyQ3VzdG9tUGFuZWxUeXBlKFwidGhlbWUtYXJjaGl0ZWN0XCIsIChwYW5lbCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gcGFuZWwuZ2V0RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IEhUTUxfTEFZT1VUO1xyXG4gICAgICAgICAgICB0aGlzLmh5ZHJhdGVUaGVtZUZyb21TdG9yYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBUaGVtZUxvZ2ljKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IG5ld1BhbmVsID0gYXdhaXQgdGhpcy51aS5jcmVhdGVQYW5lbCgpO1xyXG4gICAgICAgIGlmIChuZXdQYW5lbCkge1xyXG4gICAgICAgICAgICBuZXdQYW5lbC5zZXRUaXRsZShcIlRoZW1lIEFyY2hpdGVjdFwiKTtcclxuICAgICAgICAgICAgbmV3UGFuZWwubmF2aWdhdGVUb0N1c3RvbVR5cGUoXCJ0aGVtZS1hcmNoaXRlY3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vV0NBRyBTdGFuZGFyZHMgQ29udHJhc3QgZmVlZGJhY2tcclxuICAgIHByaXZhdGUgdXBkYXRlQ29udHJhc3RVSShjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3QgYmFkZ2UgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIiNjb250cmFzdC1iYWRnZVwiKSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICBjb25zdCBiZ0lucHV0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICdbZGF0YS12YXI9XCItLWNvbG9yLWJnLTcwMFwiXSdcclxuICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgdHh0SW5wdXQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJ1tkYXRhLXZhcj1cIi0tY29sb3ItdGV4dC0xMDBcIl0nXHJcbiAgICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAoIWJhZGdlIHx8ICFiZ0lucHV0IHx8ICF0eHRJbnB1dCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGwxID0gdGhpcy5IZWxwZXJzLmdldEx1bWluYW5jZShiZ0lucHV0LnZhbHVlKTtcclxuICAgICAgICBjb25zdCBsMiA9IHRoaXMuSGVscGVycy5nZXRMdW1pbmFuY2UodHh0SW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvT2JqZWN0ID0gdGhpcy5IZWxwZXJzLmNhbGN1bGF0ZUNvbnRyYXN0UmF0aW8obDEsIGwyKTtcclxuICAgICAgICBiYWRnZS50ZXh0Q29udGVudCA9IGBDT05UUkFTVDogJHtyYXRpb09iamVjdC5yYXRpby50b0ZpeGVkKDEpfToxICR7XHJcbiAgICAgICAgICAgIHJhdGlvT2JqZWN0LnBhc3MgPyBcIlx1MjcwNVwiIDogXCJcdTI3NENcIlxyXG4gICAgICAgIH1gO1xyXG4gICAgICAgIGJhZGdlLnN0eWxlLmJhY2tncm91bmQgPSByYXRpb09iamVjdC5wYXNzID8gXCIjYTZlM2ExXCIgOiBcIiNmMzhiYThcIjtcclxuICAgICAgICBiYWRnZS5zdHlsZS5jb2xvciA9IFwiIzExMTExYlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBUaGVtZUxvZ2ljKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0aGVtZUZvcm0gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgXCIjdGhlbWUtZm9ybVwiXHJcbiAgICAgICAgKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgaW5wdXRzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICdpbnB1dFt0eXBlPVwiY29sb3JcIl0nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBjb3B5QnRuID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIFwiI2NvcHktY3NzXCJcclxuICAgICAgICApIGFzIEhUTUxCdXR0b25FbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHJhbmRvbWl6ZUJ0biA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICBcIiNyYW5kb21pemUtdGhlbWVcIlxyXG4gICAgICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcHJlc2V0U2VsZWN0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIFwiI3RoZW1lLXByZXNldFwiXHJcbiAgICAgICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxuXHJcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZKTtcclxuICAgICAgICBpZiAoc2F2ZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVEYXRhID0gSlNPTi5wYXJzZShzYXZlZCk7XHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHRoZW1lRGF0YSkuZm9yRWFjaCgoW3Zhck5hbWUsIGhleF0pID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlUaGVtZVZhcmlhYmxlKHZhck5hbWUsIGhleCBhcyBzdHJpbmcsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwcmVzZXRTZWxlY3QudmFsdWUgPSBcImN1c3RvbVwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0UHJlc2V0S2V5ID0gT2JqZWN0LmtleXMocHJlc2V0VGhlbWVzKVswXTtcclxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFRoZW1lID0gcHJlc2V0VGhlbWVzW2ZpcnN0UHJlc2V0S2V5XTtcclxuICAgICAgICAgICAgaWYgKGRlZmF1bHRUaGVtZSkge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZGVmYXVsdFRoZW1lKS5mb3JFYWNoKChbdmFyTmFtZSwgaGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlUaGVtZVZhcmlhYmxlKHZhck5hbWUsIGhleCBhcyBzdHJpbmcsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHByZXNldFNlbGVjdC52YWx1ZSA9IGZpcnN0UHJlc2V0S2V5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByZXNldE9wdGlvbnNNYXJrdXAgPSBPYmplY3Qua2V5cyhwcmVzZXRUaGVtZXMpXHJcbiAgICAgICAgICAgIC5tYXAoXHJcbiAgICAgICAgICAgICAgICAoa2V5KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIGA8b3B0aW9uIHZhbHVlPVwiJHtrZXl9XCI+JHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnNsaWNlKDEpXHJcbiAgICAgICAgICAgICAgICAgICAgfTwvb3B0aW9uPmBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgcHJlc2V0U2VsZWN0LmlubmVySFRNTCA9XHJcbiAgICAgICAgICAgIGA8b3B0aW9uIHZhbHVlPVwiY3VzdG9tXCIgaWQ9XCJvcHQtY3VzdG9tXCI+XHUyNzI4IEN1c3RvbSAoTW9kaWZpZWQpPC9vcHRpb24+YCArXHJcbiAgICAgICAgICAgIHByZXNldE9wdGlvbnNNYXJrdXA7XHJcblxyXG4gICAgICAgIHByZXNldFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUaGVtZSA9IHByZXNldFRoZW1lc1twcmVzZXRTZWxlY3QudmFsdWVdO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRUaGVtZSkge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoc2VsZWN0ZWRUaGVtZSkuZm9yRWFjaCgoW3Zhck5hbWUsIGhleF0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5VGhlbWVWYXJpYWJsZSh2YXJOYW1lLCBoZXggYXMgc3RyaW5nLCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyYXN0VUkoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJhbmRvbWl6ZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBQaWNrIG9uZSBhbmNob3IgaHVlIGZvciB0aGUgd2hvbGUgc2Vzc2lvblxyXG4gICAgICAgICAgICBjb25zdCBtYXN0ZXJIdWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApO1xyXG5cclxuICAgICAgICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YXJOYW1lID0gaW5wdXQuZGF0YXNldC52YXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhck5hbWUpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaGV4OiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZhck5hbWUuaW5jbHVkZXMoXCJiZ1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEJhY2tncm91bmRzOiBMb3cgc2F0dXJhdGlvbiwgdmVyeSBsb3cgbGlnaHRuZXNzIChEYXJrIFRoZW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIGhleCA9IHRoaXMuSGVscGVycy5oc2xUb0hleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzdGVySHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAxNSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5yYW5kb20oKSAqIDEwICsgNVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIHZhck5hbWUuaW5jbHVkZXMoXCJwcmltYXJ5XCIpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyTmFtZS5pbmNsdWRlcyhcImxvZ29cIilcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhleCA9IHRoaXMuSGVscGVycy5yYW5kb21Db2hlc2l2ZUhleChtYXN0ZXJIdWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YXJOYW1lLmluY2x1ZGVzKFwidGV4dFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhleCA9IHRoaXMuSGVscGVycy5oc2xUb0hleChtYXN0ZXJIdWUsIDEwLCA5MCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGhleCA9IHRoaXMuSGVscGVycy5yYW5kb21Db2hlc2l2ZUhleChtYXN0ZXJIdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlUaGVtZVZhcmlhYmxlKHZhck5hbWUsIGhleCwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBwcmVzZXRTZWxlY3QudmFsdWUgPSBcImN1c3RvbVwiO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyYXN0VUkoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlQ3VycmVudFRoZW1lVG9zdG9yYWdlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoZW1lRm9ybS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3QgdmFyTmFtZSA9IHRhcmdldC5kYXRhc2V0LnZhcjtcclxuICAgICAgICAgICAgaWYgKHZhck5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlUaGVtZVZhcmlhYmxlKHZhck5hbWUsIHRhcmdldC52YWx1ZSwgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udHJhc3RVSShjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlQ3VycmVudFRoZW1lVG9zdG9yYWdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb3B5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lTmFtZSA9XHJcbiAgICAgICAgICAgICAgICAoXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiI2N1c3RvbS10aGVtZS1uYW1lXCJcclxuICAgICAgICAgICAgICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICAgICAgICAgICAgICk/LnZhbHVlIHx8IFwiY3VzdG9tLXRoZW1lXCI7XHJcbiAgICAgICAgICAgIGxldCBjc3MgPSBgaHRtbFtkYXRhLXRoZW1lPVwiYmFzaWMtJHt0aGVtZU5hbWV9XCJdIHtcXG4gIGNvbG9yLXNjaGVtZTogZGFyaztcXG5gO1xyXG4gICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNzcyArPSBgICAke2lucHV0LmRhdGFzZXQudmFyfTogJHtpbnB1dC52YWx1ZX07XFxuYDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNzcyArPSBgfWA7XHJcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNzcykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFRleHQgPSBjb3B5QnRuLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgY29weUJ0bi50ZXh0Q29udGVudCA9IFwiXHUyNzA1IENPUElFRCFcIjtcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwidmFyKC0tdGV4dC1vaylcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb3B5QnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvcHlCdG4uc3R5bGUuYmFja2dyb3VuZCA9IFwidmFyKC0tY29sb3ItcHJpbWFyeS00MDApXCI7XHJcbiAgICAgICAgICAgICAgICB9LCAyMDAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCFzYXZlZCkge1xyXG4gICAgICAgICAgICBwcmVzZXRTZWxlY3QuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udHJhc3RVSShjb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5VGhlbWVWYXJpYWJsZShcclxuICAgICAgICB2YXJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgaGV4OiBzdHJpbmcsXHJcbiAgICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudFxyXG4gICAgKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHZhck5hbWUsIGhleCk7XHJcbiAgICAgICAgaWYgKHZhck5hbWUgPT09IFwiLS1jb2xvci1iZy01MDBcIilcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFxyXG4gICAgICAgICAgICAgICAgXCItLWNvbG9yLWJnLTUwMC01MFwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5IZWxwZXJzLmhleFRvUmdiYShoZXgsIDAuNSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICBpZiAodmFyTmFtZSA9PT0gXCItLWNvbG9yLXByaW1hcnktNDAwXCIpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFxyXG4gICAgICAgICAgICAgICAgXCItLXNlbGVjdGlvbi1iZ1wiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5IZWxwZXJzLmhleFRvUmdiYShoZXgsIDAuMzUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcclxuICAgICAgICAgICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMC03MFwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5IZWxwZXJzLmhleFRvUmdiYShoZXgsIDAuNylcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIGBpbnB1dFtkYXRhLXZhcj1cIiR7dmFyTmFtZX1cIl1gXHJcbiAgICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIGlmIChpbnB1dCkgaW5wdXQudmFsdWUgPSBoZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzYXZlQ3VycmVudFRoZW1lVG9zdG9yYWdlKCkge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lRGF0YTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICcjdGhlbWUtZm9ybSBpbnB1dFt0eXBlPVwiY29sb3JcIl0nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoaW5wdXRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YXNldC52YXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGVtZURhdGFbaW5wdXQuZGF0YXNldC52YXJdID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeSh0aGVtZURhdGEpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGh5ZHJhdGVUaGVtZUZyb21TdG9yYWdlKCkge1xyXG4gICAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5TVE9SQUdFX0tFWSk7XHJcbiAgICAgICAgbGV0IHRoZW1lRGF0YTtcclxuICAgICAgICBpZiAoc2F2ZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoZW1lRGF0YSA9IEpTT04ucGFyc2Uoc2F2ZWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgY3VzdG9tIHRoZW1lIGZyb20gc3RvcmFnZVwiLCBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoZW1lRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdFByZXNldEtleSA9IE9iamVjdC5rZXlzKHByZXNldFRoZW1lcylbMF07XHJcbiAgICAgICAgICAgIHRoZW1lRGF0YSA9IHByZXNldFRoZW1lc1tmaXJzdFByZXNldEtleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGVtZURhdGEpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModGhlbWVEYXRhKS5mb3JFYWNoKChbdmFyTmFtZSwgaGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFxyXG4gICAgICAgICAgICAgICAgICAgIHZhck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaGV4IGFzIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsICJleHBvcnQgY2xhc3MgSGVscGVycyB7XHJcbiAgICBwdWJsaWMgZ2V0THVtaW5hbmNlKGhleDogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCByZ2IgPSBoZXgubWF0Y2goL1xcd1xcdy9nKT8ubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IHBhcnNlSW50KHgsIDE2KSAvIDI1NTtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbCA8PSAwLjAzOTI4XHJcbiAgICAgICAgICAgICAgICA/IHZhbCAvIDEyLjkyXHJcbiAgICAgICAgICAgICAgICA6IE1hdGgucG93KCh2YWwgKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcclxuICAgICAgICB9KSB8fCBbMCwgMCwgMF07XHJcbiAgICAgICAgcmV0dXJuIDAuMjEyNiAqIHJnYlswXSArIDAuNzE1MiAqIHJnYlsxXSArIDAuMDcyMiAqIHJnYlsyXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2FsY3VsYXRlQ29udHJhc3RSYXRpbyhsMTogbnVtYmVyLCBsMjogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgcmF0aW8gPSAoTWF0aC5tYXgobDEsIGwyKSArIDAuMDUpIC8gKE1hdGgubWluKGwxLCBsMikgKyAwLjA1KTtcclxuICAgICAgICBjb25zdCBwYXNzID0gcmF0aW8gPiA0LjU7XHJcbiAgICAgICAgcmV0dXJuIHsgcmF0aW8sIHBhc3MgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGV4VG9SZ2JhKGhleDogc3RyaW5nLCBhbHBoYTogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgciA9IHBhcnNlSW50KGhleC5zbGljZSgxLCAzKSwgMTYpIHx8IDA7XHJcbiAgICAgICAgY29uc3QgZyA9IHBhcnNlSW50KGhleC5zbGljZSgzLCA1KSwgMTYpIHx8IDA7XHJcbiAgICAgICAgY29uc3QgYiA9IHBhcnNlSW50KGhleC5zbGljZSg1LCA3KSwgMTYpIHx8IDA7XHJcbiAgICAgICAgcmV0dXJuIGByZ2JhKCR7cn0sICR7Z30sICR7Yn0sICR7YWxwaGF9KWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJhbmRvbUNvaGVzaXZlSGV4KGJhc2VIdWU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGggPVxyXG4gICAgICAgICAgICBiYXNlSHVlICE9PSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgID8gKGJhc2VIdWUgKyAoTWF0aC5yYW5kb20oKSAqIDYwIC0gMzApICsgMzYwKSAlIDM2MFxyXG4gICAgICAgICAgICAgICAgOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApO1xyXG5cclxuICAgICAgICBjb25zdCBzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNDAgKyA0MCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGwgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCArIDUwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaHNsVG9IZXgoaCwgcywgbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhzbFRvSGV4KGg6IG51bWJlciwgczogbnVtYmVyLCBsOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGwgLz0gMTAwO1xyXG4gICAgICAgIGNvbnN0IGEgPSAocyAqIE1hdGgubWluKGwsIDEgLSBsKSkgLyAxMDA7XHJcbiAgICAgICAgY29uc3QgZiA9IChuOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgayA9IChuICsgaCAvIDMwKSAlIDEyO1xyXG4gICAgICAgICAgICBjb25zdCBjb2xvciA9IGwgLSBhICogTWF0aC5tYXgoTWF0aC5taW4oayAtIDMsIDkgLSBrLCAxKSwgLTEpO1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgyNTUgKiBjb2xvcilcclxuICAgICAgICAgICAgICAgIC50b1N0cmluZygxNilcclxuICAgICAgICAgICAgICAgIC5wYWRTdGFydCgyLCBcIjBcIik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gYCMke2YoMCl9JHtmKDgpfSR7Zig0KX1gO1xyXG4gICAgfVxyXG59XHJcbiIsICJmdW5jdGlvbiBjcmVhdGVTY2FsZUlucHV0KGxhYmVsOiBzdHJpbmcsIHZhck5hbWU6IHN0cmluZywgZGVmYXVsdFZhbDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gYFxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJmbGV4OiAxIDEgY2FsYygzMyUgLSAxMHB4KTsgbWluLXdpZHRoOiAxMTBweDsgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmctODAwKTsgcGFkZGluZzogOHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWJnLTQwMCk7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7XCI+XHJcbiAgICAgICAgICAgIDxsYWJlbCBzdHlsZT1cImRpc3BsYXk6YmxvY2s7IGZvbnQtc2l6ZTogOHB4OyBtYXJnaW4tYm90dG9tOiA0cHg7IGNvbG9yOiB2YXIoLS1jb2xvci10ZXh0LTUwMCk7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOyB3aGl0ZS1zcGFjZTogbm93cmFwOyBmb250LXdlaWdodDogYm9sZDtcIj4ke2xhYmVsfTwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY29sb3JcIiBkYXRhLXZhcj1cIiR7dmFyTmFtZX1cIiB2YWx1ZT1cIiR7ZGVmYXVsdFZhbH1cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDI0cHg7IGJvcmRlcjogbm9uZTsgY3Vyc29yOiBwb2ludGVyOyBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsgZGlzcGxheTogYmxvY2s7XCI+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgO1xyXG59XHJcblxyXG5jb25zdCBzZWN0aW9uSGVhZGVyID0gKHRpdGxlOiBzdHJpbmcpID0+IGBcclxuICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMTAwJTsgbWFyZ2luLXRvcDogMTVweDsgbWFyZ2luLWJvdHRvbTogNXB4OyBwYWRkaW5nLWJvdHRvbTogNHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTtcIj5cclxuICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMTBweDsgZm9udC13ZWlnaHQ6IDgwMDsgY29sb3I6IHZhcigtLWNvbG9yLXByaW1hcnktNDAwKTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgbGV0dGVyLXNwYWNpbmc6IDFweDtcIj4ke3RpdGxlfTwvc3Bhbj5cclxuICAgIDwvZGl2PlxyXG5gO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhUTUxfTEFZT1VUID0gYFxyXG4gICAgPGRpdlxyXG4gICAgICAgIGlkPVwidGhlbWUtZWRpdG9yXCJcclxuICAgICAgICBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGdhcDogMTJweDsgd2lkdGg6IDEwMCU7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IHBhZGRpbmc6IDE1cHg7IGZvbnQtZmFtaWx5OiAnSmV0QnJhaW5zIE1vbm8nLCBtb25vc3BhY2U7IGNvbG9yOiB2YXIoLS1jb2xvci10ZXh0LTEwMCk7IGJhY2tncm91bmQ6IHZhcigtLWNvbG9yLWJnLTkwMCk7IGJvcmRlci1yYWRpdXM6IDEycHg7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWJnLTQwMCk7IG1heC1oZWlnaHQ6IDk1dmg7IG92ZXJmbG93LXk6IGF1dG87XCJcclxuICAgID5cclxuICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgIHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyO1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgICA8aDJcclxuICAgICAgICAgICAgICAgIHN0eWxlPVwibWFyZ2luOiAwOyBmb250LXNpemU6IDFyZW07IGNvbG9yOiB2YXIoLS1jb2xvci1wcmltYXJ5LTQwMCk7XCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgVGhlbWUgQXJjaGl0ZWN0XHJcbiAgICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIGlkPVwiY29udHJhc3QtYmFkZ2VcIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJwYWRkaW5nOiA0cHggOHB4OyBib3JkZXItcmFkaXVzOiA0cHg7IGZvbnQtc2l6ZTogOXB4OyBmb250LXdlaWdodDogYm9sZDsgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmctODAwKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTsgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICBDT05UUkFTVDogLS1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBnYXA6IDZweDsgd2lkdGg6IDEwMCU7XCI+XHJcbiAgICAgICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgICAgICAgIGlkPVwidGhlbWUtcHJlc2V0XCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPVwiZmxleDogMjsgcGFkZGluZzogOHB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1iZy03MDApOyBjb2xvcjogdmFyKC0tY29sb3ItdGV4dC0xMDApOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1iZy00MDApOyBib3JkZXItcmFkaXVzOiA0cHg7IGZvbnQtc2l6ZTogMTJweDsgY3Vyc29yOiBwb2ludGVyO1wiXHJcbiAgICAgICAgICAgID48L3NlbGVjdD5cclxuICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgaWQ9XCJyYW5kb21pemUtdGhlbWVcIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJmbGV4OiAxOyBwYWRkaW5nOiA4cHg7IGN1cnNvcjogcG9pbnRlcjsgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmctNjAwKTsgY29sb3I6IHZhcigtLWNvbG9yLXRleHQtMTAwKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTsgYm9yZGVyLXJhZGl1czogNHB4OyBmb250LXNpemU6IDExcHg7IGZvbnQtd2VpZ2h0OiBib2xkO1wiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIFx1RDgzQ1x1REZCMiBSQU5ET01cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBnYXA6IDZweDsgd2lkdGg6IDEwMCU7XCI+XHJcbiAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgaWQ9XCJjdXN0b20tdGhlbWUtbmFtZVwiXHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIm15LWN1c3RvbS10aGVtZVwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT1cImZsZXg6IDI7IHBhZGRpbmc6IDhweDsgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmctNzAwKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTsgY29sb3I6IHZhcigtLWNvbG9yLXRleHQtMTAwKTsgYm9yZGVyLXJhZGl1czogNHB4OyBmb250LXNpemU6IDExcHg7XCJcclxuICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgaWQ9XCJjb3B5LWNzc1wiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT1cImZsZXg6IDE7IHBhZGRpbmc6IDhweDsgY3Vyc29yOiBwb2ludGVyOyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1wcmltYXJ5LTQwMCk7IGNvbG9yOiB2YXIoLS1jb2xvci1iZy05MDApOyBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDRweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGZvbnQtc2l6ZTogMTFweDtcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICBDT1BZIENTU1xyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGZvcm1cclxuICAgICAgICAgICAgaWQ9XCJ0aGVtZS1mb3JtXCJcclxuICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogOHB4OyB3aWR0aDogMTAwJTtcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgICAgJHtzZWN0aW9uSGVhZGVyKFwiQmFja2dyb3VuZCBTY2FsZVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctNTBcIiwgXCItLWNvbG9yLWJnLTUwXCIsIFwiI2JhYzJkZVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctMTAwXCIsIFwiLS1jb2xvci1iZy0xMDBcIiwgXCIjYTZhZGM4XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy0xNTBcIiwgXCItLWNvbG9yLWJnLTE1MFwiLCBcIiM5Mzk5YjJcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTIwMFwiLCBcIi0tY29sb3ItYmctMjAwXCIsIFwiIzdmODQ5Y1wiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctMzAwXCIsIFwiLS1jb2xvci1iZy0zMDBcIiwgXCIjNmM3MDg2XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy00MDBcIiwgXCItLWNvbG9yLWJnLTQwMFwiLCBcIiM1ODViNzBcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTUwMFwiLCBcIi0tY29sb3ItYmctNTAwXCIsIFwiIzQ1NDc1YVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctNjAwXCIsIFwiLS1jb2xvci1iZy02MDBcIiwgXCIjMzEzMjQ0XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy03MDAgKEJhc2UpXCIsIFwiLS1jb2xvci1iZy03MDBcIiwgXCIjMWUxZTJlXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy04MDAgKE1hbnRsZSlcIiwgXCItLWNvbG9yLWJnLTgwMFwiLCBcIiMxODE4MjVcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTkwMCAoQ3J1c3QpXCIsIFwiLS1jb2xvci1iZy05MDBcIiwgXCIjMTExMTFiXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy05NTBcIiwgXCItLWNvbG9yLWJnLTk1MFwiLCBcIiMwYTBhMTJcIil9XHJcbiAgICAgICAgICAgICR7c2VjdGlvbkhlYWRlcihcIlByaW1hcnkgQWNjZW50XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJwcmktNTBcIiwgXCItLWNvbG9yLXByaW1hcnktNTBcIiwgXCIjZmFmNWZmXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJwcmktMjAwXCIsIFwiLS1jb2xvci1wcmltYXJ5LTIwMFwiLCBcIiNlOWQ1ZmRcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcclxuICAgICAgICAgICAgICAgIFwicHJpLTQwMCAoTWFpbilcIixcclxuICAgICAgICAgICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMFwiLFxyXG4gICAgICAgICAgICAgICAgXCIjY2JhNmY3XCJcclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwicHJpLTYwMFwiLCBcIi0tY29sb3ItcHJpbWFyeS02MDBcIiwgXCIjOWQ3MWU4XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJwcmktODAwXCIsIFwiLS1jb2xvci1wcmltYXJ5LTgwMFwiLCBcIiM2YjNmYmRcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcInByaS05NTBcIiwgXCItLWNvbG9yLXByaW1hcnktOTUwXCIsIFwiIzM1MWQ2YlwiKX1cclxuICAgICAgICAgICAgJHtzZWN0aW9uSGVhZGVyKFwiVHlwb2dyYXBoeVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiVGV4dCBIaWdoXCIsIFwiLS1jb2xvci10ZXh0LTEwMFwiLCBcIiNmZmZmZmZcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIlRleHQgTWVkXCIsIFwiLS1jb2xvci10ZXh0LTUwXCIsIFwiI2NkZDZmNFwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiVGV4dCBMb3dcIiwgXCItLWNvbG9yLXRleHQtNTAwXCIsIFwiIzdmODQ5Y1wiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiVGV4dCBNdXRlZFwiLCBcIi0tY29sb3ItdGV4dC03MDBcIiwgXCIjNmM3MDg2XCIpfVxyXG4gICAgICAgICAgICAke3NlY3Rpb25IZWFkZXIoXCJTZW1hbnRpYyAmIExpbmtzXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJTdWNjZXNzXCIsIFwiLS10ZXh0LW9rXCIsIFwiI2E2ZTNhMVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiV2FybmluZ1wiLCBcIi0tdGV4dC13YXJuaW5nXCIsIFwiI2ZhYjM4N1wiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiRXJyb3JcIiwgXCItLXRleHQtZXJyb3JcIiwgXCIjZjM4YmE4XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJMaW5rXCIsIFwiLS1saW5rLWNvbG9yXCIsIFwiIzg5YjRmYVwiKX1cclxuICAgICAgICAgICAgJHtzZWN0aW9uSGVhZGVyKFwiRWRpdG9yIEVsZW1lbnRzXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJIYXNodGFnXCIsIFwiLS1lZC1oYXNodGFnLWNvbG9yXCIsIFwiIzk0ZTJkNVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiTWVudGlvblwiLCBcIi0tZWQtbWVudGlvbi1jb2xvclwiLCBcIiNmNWMyZTdcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIkRhdGUvVGltZVwiLCBcIi0tZWQtZGF0ZXRpbWUtY29sb3JcIiwgXCIjNzRjN2VjXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXHJcbiAgICAgICAgICAgICAgICBcIlF1b3RlIEJvcmRlclwiLFxyXG4gICAgICAgICAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiLFxyXG4gICAgICAgICAgICAgICAgXCIjYjRiZWZlXCJcclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiVG9kbyBEb25lXCIsIFwiLS1lZC1jaGVjay1kb25lLWJnXCIsIFwiI2E2ZTNhMVwiKX1cclxuICAgICAgICAgICAgJHtzZWN0aW9uSGVhZGVyKFwiVUkgQ29tcG9uZW50c1wiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFxyXG4gICAgICAgICAgICAgICAgXCJTaWRlYmFyIEFjdGl2ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCItLXNpZGUtYmctYWN0aXZlLWZvY3VzXCIsXHJcbiAgICAgICAgICAgICAgICBcIiMzMTMyNDRcIlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJDYXJkIEJhY2tncm91bmRcIiwgXCItLWNhcmRzLWJnXCIsIFwiIzE4MTgyNVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFxyXG4gICAgICAgICAgICAgICAgXCJJbnB1dCBCYWNrZ3JvdW5kXCIsXHJcbiAgICAgICAgICAgICAgICBcIi0taW5wdXQtYmctY29sb3JcIixcclxuICAgICAgICAgICAgICAgIFwiIzExMTExYlwiXHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIkxvZ28gQ29sb3JcIiwgXCItLWxvZ28tY29sb3JcIiwgXCIjY2JhNmY3XCIpfVxyXG4gICAgICAgIDwvZm9ybT5cclxuXHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICBzdHlsZT1cImZvbnQtc2l6ZTogOXB4OyBjb2xvcjogdmFyKC0tY29sb3ItdGV4dC03MDApOyB0ZXh0LWFsaWduOiBjZW50ZXI7IG1hcmdpbi10b3A6IDEwcHg7XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICAgIENoYW5nZXMgYXJlIGFwcGxpZWQgbGl2ZSB0byB0aGUgYXBwbGljYXRpb24gcm9vdC5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5gO1xyXG4iLCAiZXhwb3J0IGNvbnN0IHByZXNldFRoZW1lczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4gPSB7XHJcbiAgICBjYXRwcHVjY2luX2J5X2pkX2FuZF9uaWtsYXM6IHtcclxuICAgICAgICBcIi0tY29sb3ItYmctNTBcIjogXCIjYmFjMmRlXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTEwMFwiOiBcIiNhNmFkYzhcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctMTUwXCI6IFwiIzkzOTliMlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy0yMDBcIjogXCIjN2Y4NDljXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTMwMFwiOiBcIiM2YzcwODZcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNDAwXCI6IFwiIzU4NWI3MFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy01MDBcIjogXCIjNDU0NzVhXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTYwMFwiOiBcIiMzMTMyNDRcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNzAwXCI6IFwiIzFlMWUyZVwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy04MDBcIjogXCIjMTgxODI1XCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTkwMFwiOiBcIiMxMTExMWJcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctOTUwXCI6IFwiIzBhMGExMlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMFwiOiBcIiNjYmE2ZjdcIixcclxuICAgICAgICBcIi0tY29sb3ItcHJpbWFyeS02MDBcIjogXCIjOWQ3MWU4XCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXRleHQtMTAwXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIFwiLS10ZXh0LW9rXCI6IFwiI2E2ZTNhMVwiLFxyXG4gICAgICAgIFwiLS10ZXh0LXdhcm5pbmdcIjogXCIjZmFiMzg3XCIsXHJcbiAgICAgICAgXCItLXRleHQtZXJyb3JcIjogXCIjZjM4YmE4XCIsXHJcbiAgICAgICAgXCItLWxpbmstY29sb3JcIjogXCIjODliNGZhXCIsXHJcbiAgICAgICAgXCItLWVkLWhhc2h0YWctY29sb3JcIjogXCIjOTRlMmQ1XCIsXHJcbiAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiOiBcIiNiNGJlZmVcIixcclxuICAgICAgICBcIi0tY2FyZHMtYmdcIjogXCIjMTgxODI1XCIsXHJcbiAgICAgICAgXCItLWlucHV0LWJnLWNvbG9yXCI6IFwiIzE4MTgyNVwiLFxyXG4gICAgICAgIFwiLS1sb2dvLWNvbG9yXCI6IFwiI2NiYTZmN1wiLFxyXG4gICAgICAgIFwiLS1zaWRlLWJnLWFjdGl2ZS1mb2N1c1wiOiBcIiNjYmE2ZjdcIixcclxuICAgIH0sXHJcblxyXG4gICAgd2F5d2FyZF9ieV9ob3N0aWxlX3Nwb29uOiB7XHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTcwMFwiOiBcIiMyNDIyMjBcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctODAwXCI6IFwiIzFjMWIxOVwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy05MDBcIjogXCIjMTQxMzEyXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTQwMFwiOiBcIiM0YTQ1M2VcIixcclxuICAgICAgICBcIi0tY29sb3ItcHJpbWFyeS00MDBcIjogXCIjZDc5OTIxXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXRleHQtMTAwXCI6IFwiI2ViZGJiMlwiLFxyXG4gICAgICAgIFwiLS10ZXh0LW9rXCI6IFwiI2I4YmIyNlwiLFxyXG4gICAgICAgIFwiLS10ZXh0LXdhcm5pbmdcIjogXCIjZmU4MDE5XCIsXHJcbiAgICAgICAgXCItLXRleHQtZXJyb3JcIjogXCIjZmI0OTM0XCIsXHJcbiAgICAgICAgXCItLWxpbmstY29sb3JcIjogXCIjODNhNTk4XCIsXHJcbiAgICAgICAgXCItLWVkLWhhc2h0YWctY29sb3JcIjogXCIjOGVjMDdjXCIsXHJcbiAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiOiBcIiNkMzg2OWJcIixcclxuICAgICAgICBcIi0tY2FyZHMtYmdcIjogXCIjMWMxYjE5XCIsXHJcbiAgICAgICAgXCItLWlucHV0LWJnLWNvbG9yXCI6IFwiIzI0MjIyMFwiLFxyXG4gICAgICAgIFwiLS1sb2dvLWNvbG9yXCI6IFwiI2Q3OTkyMVwiLFxyXG4gICAgfSxcclxuXHJcbiAgICBub3JkaWM6IHtcclxuICAgICAgICAvLyBEZWVwIEFyY3RpYyBCbHVlc1xyXG4gICAgICAgIFwiLS1jb2xvci1iZy03MDBcIjogXCIjMmUzNDQwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTgwMFwiOiBcIiMyNDI5MzNcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctOTAwXCI6IFwiIzFiMWUyNVwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy00MDBcIjogXCIjNGM1NjZhXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXByaW1hcnktNDAwXCI6IFwiIzg4YzBkMFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci10ZXh0LTEwMFwiOiBcIiNlY2VmZjRcIixcclxuICAgICAgICBcIi0tdGV4dC1va1wiOiBcIiNhM2JlOGNcIixcclxuICAgICAgICBcIi0tdGV4dC13YXJuaW5nXCI6IFwiI2ViY2I4YlwiLFxyXG4gICAgICAgIFwiLS10ZXh0LWVycm9yXCI6IFwiI2JmNjE2YVwiLFxyXG4gICAgICAgIFwiLS1saW5rLWNvbG9yXCI6IFwiIzgxYTFjMVwiLFxyXG4gICAgICAgIFwiLS1lZC1oYXNodGFnLWNvbG9yXCI6IFwiIzhmYmNiYlwiLFxyXG4gICAgICAgIFwiLS1lZC1xdW90ZS1ib3JkZXItY29sb3JcIjogXCIjYjQ4ZWFkXCIsXHJcbiAgICAgICAgXCItLWNhcmRzLWJnXCI6IFwiIzI0MjkzM1wiLFxyXG4gICAgICAgIFwiLS1pbnB1dC1iZy1jb2xvclwiOiBcIiMyZTM0NDBcIixcclxuICAgICAgICBcIi0tbG9nby1jb2xvclwiOiBcIiM4OGMwZDBcIixcclxuICAgIH0sXHJcblxyXG4gICAgcm9zZV9waW5lOiB7XHJcbiAgICAgICAgLy8gTXV0ZWQgU29mdCBQYWxldHRlXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTcwMFwiOiBcIiMxOTE3MjRcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctODAwXCI6IFwiIzEyMTAxYlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy05MDBcIjogXCIjMGEwOTEwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTQwMFwiOiBcIiM0MDNkNTJcIixcclxuICAgICAgICBcIi0tY29sb3ItcHJpbWFyeS00MDBcIjogXCIjZWJiY2JhXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXRleHQtMTAwXCI6IFwiI2UwZGVmNFwiLFxyXG4gICAgICAgIFwiLS10ZXh0LW9rXCI6IFwiIzljY2ZkOFwiLFxyXG4gICAgICAgIFwiLS10ZXh0LXdhcm5pbmdcIjogXCIjZjZjMTc3XCIsXHJcbiAgICAgICAgXCItLXRleHQtZXJyb3JcIjogXCIjZWI2ZjkyXCIsXHJcbiAgICAgICAgXCItLWxpbmstY29sb3JcIjogXCIjMzE3NDhmXCIsXHJcbiAgICAgICAgXCItLWVkLWhhc2h0YWctY29sb3JcIjogXCIjZWJiY2JhXCIsXHJcbiAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiOiBcIiNjNGE3ZTdcIixcclxuICAgICAgICBcIi0tY2FyZHMtYmdcIjogXCIjMWYxZDJlXCIsXHJcbiAgICAgICAgXCItLWlucHV0LWJnLWNvbG9yXCI6IFwiIzE5MTcyNFwiLFxyXG4gICAgICAgIFwiLS1sb2dvLWNvbG9yXCI6IFwiI2ViYmNiYVwiLFxyXG4gICAgfSxcclxuXHJcbiAgICBjeWJlcl9saW1lOiB7XHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTcwMFwiOiBcIiMwNTA1MDVcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctODAwXCI6IFwiIzAwMDAwMFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy05MDBcIjogXCIjMDAwMDAwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTQwMFwiOiBcIiMyMjIyMjJcIixcclxuICAgICAgICBcIi0tY29sb3ItcHJpbWFyeS00MDBcIjogXCIjY2NmZjAwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXRleHQtMTAwXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIFwiLS10ZXh0LW9rXCI6IFwiIzAwZmY4OFwiLFxyXG4gICAgICAgIFwiLS10ZXh0LXdhcm5pbmdcIjogXCIjZmZmZjAwXCIsXHJcbiAgICAgICAgXCItLXRleHQtZXJyb3JcIjogXCIjZmYwMDU1XCIsXHJcbiAgICAgICAgXCItLWxpbmstY29sb3JcIjogXCIjMDBjY2ZmXCIsXHJcbiAgICAgICAgXCItLWVkLWhhc2h0YWctY29sb3JcIjogXCIjY2NmZjAwXCIsXHJcbiAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiOiBcIiMzMzMzMzNcIixcclxuICAgICAgICBcIi0tY2FyZHMtYmdcIjogXCIjMGEwYTBhXCIsXHJcbiAgICAgICAgXCItLWlucHV0LWJnLWNvbG9yXCI6IFwiIzExMTExMVwiLFxyXG4gICAgICAgIFwiLS1sb2dvLWNvbG9yXCI6IFwiI2NjZmYwMFwiLFxyXG4gICAgfSxcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBTyxNQUFNLFVBQU4sTUFBYztBQUFBLElBQXJCLE9BQXFCO0FBQUE7QUFBQTtBQUFBLElBQ1YsYUFBYSxLQUFxQjtBQUNy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
