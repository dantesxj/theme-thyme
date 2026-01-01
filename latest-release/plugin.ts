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
        const defaultTheme = presetThemes[""];
        Object.entries(defaultTheme).forEach(([varName, hex]) => {
          this.applyThemeVariable(varName, hex, container);
        });
      }
      const presetOptions = presetSelect.innerHTML = Object.keys(
        presetThemes
      ).map(
        (key) => `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
      ).join("");
      presetSelect.innerHTML = `<option value="custom" id="opt-custom">\u2728 Custom (Modified)</option>` + presetOptions;
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
      if (saved) {
        try {
          const themeData = JSON.parse(saved);
          Object.entries(themeData).forEach(([varName, hex]) => {
            document.documentElement.style.setProperty(
              varName,
              hex
            );
          });
        } catch (e) {
          console.error("Failed to load custom theme from storage", e);
        }
      }
    }
  };
  return __toCommonJS(plugin_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcGx1Z2luLnRzIiwgIi4uL2hlbHBlcnMudHMiLCAiLi4vUGFuZWxGb3JtLnRzIiwgIi4uL3ByZXNldFRoZW1lcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgSGVscGVycyB9IGZyb20gXCIuL2hlbHBlcnNcIjtcclxuaW1wb3J0IHsgSFRNTF9MQVlPVVQgfSBmcm9tIFwiLi9QYW5lbEZvcm1cIjtcclxuaW1wb3J0IHsgcHJlc2V0VGhlbWVzIH0gZnJvbSBcIi4vcHJlc2V0VGhlbWVzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUGx1Z2luIGV4dGVuZHMgQXBwUGx1Z2luIHtcclxuICAgIEhlbHBlcnM6IEhlbHBlcnMgPSBuZXcgSGVscGVycygpO1xyXG4gICAgU1RPUkFHRV9LRVk6IHN0cmluZyA9IFwidGhlbWUtYXJjaGl0ZWN0XCI7XHJcbiAgICBvbkxvYWQoKSB7XHJcbiAgICAgICAgdGhpcy51aS5hZGRTaWRlYmFySXRlbSh7XHJcbiAgICAgICAgICAgIGxhYmVsOiBcIlRoZW1lIEFyY2hpdGVjdFwiLFxyXG4gICAgICAgICAgICBpY29uOiBcImFuYWx5emVcIixcclxuICAgICAgICAgICAgdG9vbHRpcDogXCJMaXZlIGN1c3RvbWlzYXRpb24gb2YgY29sb3JzIGZvciB0aHltZXJcIixcclxuICAgICAgICAgICAgb25DbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBbmROYXZpZ2F0ZVRvTmV3UGFuZWwoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25VbmxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zYXZlQ3VycmVudFRoZW1lVG9zdG9yYWdlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlQW5kTmF2aWdhdGVUb05ld1BhbmVsKCkge1xyXG4gICAgICAgIHRoaXMudWkucmVnaXN0ZXJDdXN0b21QYW5lbFR5cGUoXCJ0aGVtZS1hcmNoaXRlY3RcIiwgKHBhbmVsKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBwYW5lbC5nZXRFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gSFRNTF9MQVlPVVQ7XHJcbiAgICAgICAgICAgIHRoaXMuaHlkcmF0ZVRoZW1lRnJvbVN0b3JhZ2UoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cFRoZW1lTG9naWMoZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgbmV3UGFuZWwgPSBhd2FpdCB0aGlzLnVpLmNyZWF0ZVBhbmVsKCk7XHJcbiAgICAgICAgaWYgKG5ld1BhbmVsKSB7XHJcbiAgICAgICAgICAgIG5ld1BhbmVsLnNldFRpdGxlKFwiVGhlbWUgQXJjaGl0ZWN0XCIpO1xyXG4gICAgICAgICAgICBuZXdQYW5lbC5uYXZpZ2F0ZVRvQ3VzdG9tVHlwZShcInRoZW1lLWFyY2hpdGVjdFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9XQ0FHIFN0YW5kYXJkcyBDb250cmFzdCBmZWVkYmFja1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVDb250cmFzdFVJKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICBjb25zdCBiYWRnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiI2NvbnRyYXN0LWJhZGdlXCIpIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IGJnSW5wdXQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJ1tkYXRhLXZhcj1cIi0tY29sb3ItYmctNzAwXCJdJ1xyXG4gICAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICBjb25zdCB0eHRJbnB1dCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnW2RhdGEtdmFyPVwiLS1jb2xvci10ZXh0LTEwMFwiXSdcclxuICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICghYmFkZ2UgfHwgIWJnSW5wdXQgfHwgIXR4dElucHV0KSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgbDEgPSB0aGlzLkhlbHBlcnMuZ2V0THVtaW5hbmNlKGJnSW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IGwyID0gdGhpcy5IZWxwZXJzLmdldEx1bWluYW5jZSh0eHRJbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgY29uc3QgcmF0aW9PYmplY3QgPSB0aGlzLkhlbHBlcnMuY2FsY3VsYXRlQ29udHJhc3RSYXRpbyhsMSwgbDIpO1xyXG4gICAgICAgIGJhZGdlLnRleHRDb250ZW50ID0gYENPTlRSQVNUOiAke3JhdGlvT2JqZWN0LnJhdGlvLnRvRml4ZWQoMSl9OjEgJHtcclxuICAgICAgICAgICAgcmF0aW9PYmplY3QucGFzcyA/IFwiXHUyNzA1XCIgOiBcIlx1Mjc0Q1wiXHJcbiAgICAgICAgfWA7XHJcbiAgICAgICAgYmFkZ2Uuc3R5bGUuYmFja2dyb3VuZCA9IHJhdGlvT2JqZWN0LnBhc3MgPyBcIiNhNmUzYTFcIiA6IFwiI2YzOGJhOFwiO1xyXG4gICAgICAgIGJhZGdlLnN0eWxlLmNvbG9yID0gXCIjMTExMTFiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFRoZW1lTG9naWMoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lRm9ybSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICBcIiN0aGVtZS1mb3JtXCJcclxuICAgICAgICApIGFzIEhUTUxGb3JtRWxlbWVudDtcclxuICAgICAgICBjb25zdCBpbnB1dHMgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgJ2lucHV0W3R5cGU9XCJjb2xvclwiXSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGNvcHlCdG4gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgXCIjY29weS1jc3NcIlxyXG4gICAgICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcmFuZG9taXplQnRuID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIFwiI3JhbmRvbWl6ZS10aGVtZVwiXHJcbiAgICAgICAgKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgICAgICBjb25zdCBwcmVzZXRTZWxlY3QgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgXCIjdGhlbWUtcHJlc2V0XCJcclxuICAgICAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xyXG5cclxuICAgICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVkpO1xyXG4gICAgICAgIGlmIChzYXZlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aGVtZURhdGEgPSBKU09OLnBhcnNlKHNhdmVkKTtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModGhlbWVEYXRhKS5mb3JFYWNoKChbdmFyTmFtZSwgaGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVRoZW1lVmFyaWFibGUodmFyTmFtZSwgaGV4IGFzIHN0cmluZywgY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHByZXNldFNlbGVjdC52YWx1ZSA9IFwiY3VzdG9tXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFRoZW1lID0gcHJlc2V0VGhlbWVzW1wiXCJdO1xyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhkZWZhdWx0VGhlbWUpLmZvckVhY2goKFt2YXJOYW1lLCBoZXhdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5VGhlbWVWYXJpYWJsZSh2YXJOYW1lLCBoZXggYXMgc3RyaW5nLCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJlc2V0T3B0aW9ucyA9IChwcmVzZXRTZWxlY3QuaW5uZXJIVE1MID0gT2JqZWN0LmtleXMoXHJcbiAgICAgICAgICAgIHByZXNldFRoZW1lc1xyXG4gICAgICAgIClcclxuICAgICAgICAgICAgLm1hcChcclxuICAgICAgICAgICAgICAgIChrZXkpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgYDxvcHRpb24gdmFsdWU9XCIke2tleX1cIj4ke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBrZXkuc2xpY2UoMSlcclxuICAgICAgICAgICAgICAgICAgICB9PC9vcHRpb24+YFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpKTtcclxuICAgICAgICBwcmVzZXRTZWxlY3QuaW5uZXJIVE1MID1cclxuICAgICAgICAgICAgYDxvcHRpb24gdmFsdWU9XCJjdXN0b21cIiBpZD1cIm9wdC1jdXN0b21cIj5cdTI3MjggQ3VzdG9tIChNb2RpZmllZCk8L29wdGlvbj5gICtcclxuICAgICAgICAgICAgcHJlc2V0T3B0aW9ucztcclxuXHJcbiAgICAgICAgcHJlc2V0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRoZW1lID0gcHJlc2V0VGhlbWVzW3ByZXNldFNlbGVjdC52YWx1ZV07XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFRoZW1lKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzZWxlY3RlZFRoZW1lKS5mb3JFYWNoKChbdmFyTmFtZSwgaGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlUaGVtZVZhcmlhYmxlKHZhck5hbWUsIGhleCBhcyBzdHJpbmcsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udHJhc3RVSShjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmFuZG9taXplQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFBpY2sgb25lIGFuY2hvciBodWUgZm9yIHRoZSB3aG9sZSBzZXNzaW9uXHJcbiAgICAgICAgICAgIGNvbnN0IG1hc3Rlckh1ZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhck5hbWUgPSBpbnB1dC5kYXRhc2V0LnZhcjtcclxuICAgICAgICAgICAgICAgIGlmICghdmFyTmFtZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBoZXg6IHN0cmluZztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodmFyTmFtZS5pbmNsdWRlcyhcImJnXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFja2dyb3VuZHM6IExvdyBzYXR1cmF0aW9uLCB2ZXJ5IGxvdyBsaWdodG5lc3MgKERhcmsgVGhlbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgaGV4ID0gdGhpcy5IZWxwZXJzLmhzbFRvSGV4KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXJIdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDE1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnJhbmRvbSgpICogMTAgKyA1XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyTmFtZS5pbmNsdWRlcyhcInByaW1hcnlcIikgfHxcclxuICAgICAgICAgICAgICAgICAgICB2YXJOYW1lLmluY2x1ZGVzKFwibG9nb1wiKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGV4ID0gdGhpcy5IZWxwZXJzLnJhbmRvbUNvaGVzaXZlSGV4KG1hc3Rlckh1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhck5hbWUuaW5jbHVkZXMoXCJ0ZXh0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGV4ID0gdGhpcy5IZWxwZXJzLmhzbFRvSGV4KG1hc3Rlckh1ZSwgMTAsIDkwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGV4ID0gdGhpcy5IZWxwZXJzLnJhbmRvbUNvaGVzaXZlSGV4KG1hc3Rlckh1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVRoZW1lVmFyaWFibGUodmFyTmFtZSwgaGV4LCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHByZXNldFNlbGVjdC52YWx1ZSA9IFwiY3VzdG9tXCI7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udHJhc3RVSShjb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVDdXJyZW50VGhlbWVUb3N0b3JhZ2UoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhlbWVGb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICBjb25zdCB2YXJOYW1lID0gdGFyZ2V0LmRhdGFzZXQudmFyO1xyXG4gICAgICAgICAgICBpZiAodmFyTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVRoZW1lVmFyaWFibGUodmFyTmFtZSwgdGFyZ2V0LnZhbHVlLCBjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDb250cmFzdFVJKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVDdXJyZW50VGhlbWVUb3N0b3JhZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvcHlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVOYW1lID1cclxuICAgICAgICAgICAgICAgIChcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCIjY3VzdG9tLXRoZW1lLW5hbWVcIlxyXG4gICAgICAgICAgICAgICAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudFxyXG4gICAgICAgICAgICAgICAgKT8udmFsdWUgfHwgXCJjdXN0b20tdGhlbWVcIjtcclxuICAgICAgICAgICAgbGV0IGNzcyA9IGBodG1sW2RhdGEtdGhlbWU9XCJiYXNpYy0ke3RoZW1lTmFtZX1cIl0ge1xcbiAgY29sb3Itc2NoZW1lOiBkYXJrO1xcbmA7XHJcbiAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3NzICs9IGAgICR7aW5wdXQuZGF0YXNldC52YXJ9OiAke2lucHV0LnZhbHVlfTtcXG5gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3NzICs9IGB9YDtcclxuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY3NzKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGNvcHlCdG4udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLnRleHRDb250ZW50ID0gXCJcdTI3MDUgQ09QSUVEIVwiO1xyXG4gICAgICAgICAgICAgICAgY29weUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ2YXIoLS10ZXh0LW9rKVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvcHlCdG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbFRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29weUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ2YXIoLS1jb2xvci1wcmltYXJ5LTQwMClcIjtcclxuICAgICAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIXNhdmVkKSB7XHJcbiAgICAgICAgICAgIHByZXNldFNlbGVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVDb250cmFzdFVJKGNvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXBwbHlUaGVtZVZhcmlhYmxlKFxyXG4gICAgICAgIHZhck5hbWU6IHN0cmluZyxcclxuICAgICAgICBoZXg6IHN0cmluZyxcclxuICAgICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50XHJcbiAgICApIHtcclxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkodmFyTmFtZSwgaGV4KTtcclxuICAgICAgICBpZiAodmFyTmFtZSA9PT0gXCItLWNvbG9yLWJnLTUwMFwiKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXHJcbiAgICAgICAgICAgICAgICBcIi0tY29sb3ItYmctNTAwLTUwXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLkhlbHBlcnMuaGV4VG9SZ2JhKGhleCwgMC41KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIGlmICh2YXJOYW1lID09PSBcIi0tY29sb3ItcHJpbWFyeS00MDBcIikge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXHJcbiAgICAgICAgICAgICAgICBcIi0tc2VsZWN0aW9uLWJnXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLkhlbHBlcnMuaGV4VG9SZ2JhKGhleCwgMC4zNSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFxyXG4gICAgICAgICAgICAgICAgXCItLWNvbG9yLXByaW1hcnktNDAwLTcwXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLkhlbHBlcnMuaGV4VG9SZ2JhKGhleCwgMC43KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgYGlucHV0W2RhdGEtdmFyPVwiJHt2YXJOYW1lfVwiXWBcclxuICAgICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgaWYgKGlucHV0KSBpbnB1dC52YWx1ZSA9IGhleDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNhdmVDdXJyZW50VGhlbWVUb3N0b3JhZ2UoKSB7XHJcbiAgICAgICAgY29uc3QgdGhlbWVEYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICAgICAgY29uc3QgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgJyN0aGVtZS1mb3JtIGlucHV0W3R5cGU9XCJjb2xvclwiXSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChpbnB1dHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhc2V0LnZhcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoZW1lRGF0YVtpbnB1dC5kYXRhc2V0LnZhcl0gPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuU1RPUkFHRV9LRVksIEpTT04uc3RyaW5naWZ5KHRoZW1lRGF0YSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgaHlkcmF0ZVRoZW1lRnJvbVN0b3JhZ2UoKSB7XHJcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlNUT1JBR0VfS0VZKTtcclxuICAgICAgICBpZiAoc2F2ZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRoZW1lRGF0YSA9IEpTT04ucGFyc2Uoc2F2ZWQpO1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModGhlbWVEYXRhKS5mb3JFYWNoKChbdmFyTmFtZSwgaGV4XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGV4IGFzIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBsb2FkIGN1c3RvbSB0aGVtZSBmcm9tIHN0b3JhZ2VcIiwgZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwgImV4cG9ydCBjbGFzcyBIZWxwZXJzIHtcclxuICAgIHB1YmxpYyBnZXRMdW1pbmFuY2UoaGV4OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IHJnYiA9IGhleC5tYXRjaCgvXFx3XFx3L2cpPy5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmFsID0gcGFyc2VJbnQoeCwgMTYpIC8gMjU1O1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsIDw9IDAuMDM5MjhcclxuICAgICAgICAgICAgICAgID8gdmFsIC8gMTIuOTJcclxuICAgICAgICAgICAgICAgIDogTWF0aC5wb3coKHZhbCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xyXG4gICAgICAgIH0pIHx8IFswLCAwLCAwXTtcclxuICAgICAgICByZXR1cm4gMC4yMTI2ICogcmdiWzBdICsgMC43MTUyICogcmdiWzFdICsgMC4wNzIyICogcmdiWzJdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjYWxjdWxhdGVDb250cmFzdFJhdGlvKGwxOiBudW1iZXIsIGwyOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCByYXRpbyA9IChNYXRoLm1heChsMSwgbDIpICsgMC4wNSkgLyAoTWF0aC5taW4obDEsIGwyKSArIDAuMDUpO1xyXG4gICAgICAgIGNvbnN0IHBhc3MgPSByYXRpbyA+IDQuNTtcclxuICAgICAgICByZXR1cm4geyByYXRpbywgcGFzcyB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoZXhUb1JnYmEoaGV4OiBzdHJpbmcsIGFscGhhOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoaGV4LnNsaWNlKDEsIDMpLCAxNikgfHwgMDtcclxuICAgICAgICBjb25zdCBnID0gcGFyc2VJbnQoaGV4LnNsaWNlKDMsIDUpLCAxNikgfHwgMDtcclxuICAgICAgICBjb25zdCBiID0gcGFyc2VJbnQoaGV4LnNsaWNlKDUsIDcpLCAxNikgfHwgMDtcclxuICAgICAgICByZXR1cm4gYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthbHBoYX0pYDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmFuZG9tQ29oZXNpdmVIZXgoYmFzZUh1ZT86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgaCA9XHJcbiAgICAgICAgICAgIGJhc2VIdWUgIT09IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgPyAoYmFzZUh1ZSArIChNYXRoLnJhbmRvbSgpICogNjAgLSAzMCkgKyAzNjApICUgMzYwXHJcbiAgICAgICAgICAgICAgICA6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0MCArIDQwKTtcclxuXHJcbiAgICAgICAgY29uc3QgbCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwICsgNTApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5oc2xUb0hleChoLCBzLCBsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaHNsVG9IZXgoaDogbnVtYmVyLCBzOiBudW1iZXIsIGw6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbCAvPSAxMDA7XHJcbiAgICAgICAgY29uc3QgYSA9IChzICogTWF0aC5taW4obCwgMSAtIGwpKSAvIDEwMDtcclxuICAgICAgICBjb25zdCBmID0gKG46IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBrID0gKG4gKyBoIC8gMzApICUgMTI7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gbCAtIGEgKiBNYXRoLm1heChNYXRoLm1pbihrIC0gMywgOSAtIGssIDEpLCAtMSk7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKDI1NSAqIGNvbG9yKVxyXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKDE2KVxyXG4gICAgICAgICAgICAgICAgLnBhZFN0YXJ0KDIsIFwiMFwiKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBgIyR7ZigwKX0ke2YoOCl9JHtmKDQpfWA7XHJcbiAgICB9XHJcbn1cclxuIiwgImZ1bmN0aW9uIGNyZWF0ZVNjYWxlSW5wdXQobGFiZWw6IHN0cmluZywgdmFyTmFtZTogc3RyaW5nLCBkZWZhdWx0VmFsOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBgXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImZsZXg6IDEgMSBjYWxjKDMzJSAtIDEwcHgpOyBtaW4td2lkdGg6IDExMHB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1iZy04MDApOyBwYWRkaW5nOiA4cHg7IGJvcmRlci1yYWRpdXM6IDZweDsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTsgYm94LXNpemluZzogYm9yZGVyLWJveDtcIj5cclxuICAgICAgICAgICAgPGxhYmVsIHN0eWxlPVwiZGlzcGxheTpibG9jazsgZm9udC1zaXplOiA4cHg7IG1hcmdpbi1ib3R0b206IDRweDsgY29sb3I6IHZhcigtLWNvbG9yLXRleHQtNTAwKTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IHdoaXRlLXNwYWNlOiBub3dyYXA7IGZvbnQtd2VpZ2h0OiBib2xkO1wiPiR7bGFiZWx9PC9sYWJlbD5cclxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjb2xvclwiIGRhdGEtdmFyPVwiJHt2YXJOYW1lfVwiIHZhbHVlPVwiJHtkZWZhdWx0VmFsfVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IGhlaWdodDogMjRweDsgYm9yZGVyOiBub25lOyBjdXJzb3I6IHBvaW50ZXI7IGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBkaXNwbGF5OiBibG9jaztcIj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGA7XHJcbn1cclxuXHJcbmNvbnN0IHNlY3Rpb25IZWFkZXIgPSAodGl0bGU6IHN0cmluZykgPT4gYFxyXG4gICAgPGRpdiBzdHlsZT1cIndpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxNXB4OyBtYXJnaW4tYm90dG9tOiA1cHg7IHBhZGRpbmctYm90dG9tOiA0cHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1jb2xvci1iZy00MDApO1wiPlxyXG4gICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxMHB4OyBmb250LXdlaWdodDogODAwOyBjb2xvcjogdmFyKC0tY29sb3ItcHJpbWFyeS00MDApOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBsZXR0ZXItc3BhY2luZzogMXB4O1wiPiR7dGl0bGV9PC9zcGFuPlxyXG4gICAgPC9kaXY+XHJcbmA7XHJcblxyXG5leHBvcnQgY29uc3QgSFRNTF9MQVlPVVQgPSBgXHJcbiAgICA8ZGl2XHJcbiAgICAgICAgaWQ9XCJ0aGVtZS1lZGl0b3JcIlxyXG4gICAgICAgIHN0eWxlPVwiZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgZ2FwOiAxMnB4OyB3aWR0aDogMTAwJTsgYm94LXNpemluZzogYm9yZGVyLWJveDsgcGFkZGluZzogMTVweDsgZm9udC1mYW1pbHk6ICdKZXRCcmFpbnMgTW9ubycsIG1vbm9zcGFjZTsgY29sb3I6IHZhcigtLWNvbG9yLXRleHQtMTAwKTsgYmFja2dyb3VuZDogdmFyKC0tY29sb3ItYmctOTAwKTsgYm9yZGVyLXJhZGl1czogMTJweDsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmctNDAwKTsgbWF4LWhlaWdodDogOTV2aDsgb3ZlcmZsb3cteTogYXV0bztcIlxyXG4gICAgPlxyXG4gICAgICAgIDxkaXZcclxuICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICAgIDxoMlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJtYXJnaW46IDA7IGZvbnQtc2l6ZTogMXJlbTsgY29sb3I6IHZhcigtLWNvbG9yLXByaW1hcnktNDAwKTtcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICBUaGVtZSBBcmNoaXRlY3RcclxuICAgICAgICAgICAgPC9oMj5cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgaWQ9XCJjb250cmFzdC1iYWRnZVwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT1cInBhZGRpbmc6IDRweCA4cHg7IGJvcmRlci1yYWRpdXM6IDRweDsgZm9udC1zaXplOiA5cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1iZy04MDApOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1iZy00MDApOyB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1wiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIENPTlRSQVNUOiAtLVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGdhcDogNnB4OyB3aWR0aDogMTAwJTtcIj5cclxuICAgICAgICAgICAgPHNlbGVjdFxyXG4gICAgICAgICAgICAgICAgaWQ9XCJ0aGVtZS1wcmVzZXRcIlxyXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJmbGV4OiAyOyBwYWRkaW5nOiA4cHg7IGJhY2tncm91bmQ6IHZhcigtLWNvbG9yLWJnLTcwMCk7IGNvbG9yOiB2YXIoLS1jb2xvci10ZXh0LTEwMCk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWJnLTQwMCk7IGJvcmRlci1yYWRpdXM6IDRweDsgZm9udC1zaXplOiAxMnB4OyBjdXJzb3I6IHBvaW50ZXI7XCJcclxuICAgICAgICAgICAgPjwvc2VsZWN0PlxyXG4gICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBpZD1cInJhbmRvbWl6ZS10aGVtZVwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT1cImZsZXg6IDE7IHBhZGRpbmc6IDhweDsgY3Vyc29yOiBwb2ludGVyOyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1iZy02MDApOyBjb2xvcjogdmFyKC0tY29sb3ItdGV4dC0xMDApOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1iZy00MDApOyBib3JkZXItcmFkaXVzOiA0cHg7IGZvbnQtc2l6ZTogMTFweDsgZm9udC13ZWlnaHQ6IGJvbGQ7XCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgXHVEODNDXHVERkIyIFJBTkRPTVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGdhcDogNnB4OyB3aWR0aDogMTAwJTtcIj5cclxuICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICBpZD1cImN1c3RvbS10aGVtZS1uYW1lXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwibXktY3VzdG9tLXRoZW1lXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPVwiZmxleDogMjsgcGFkZGluZzogOHB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1iZy03MDApOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1iZy00MDApOyBjb2xvcjogdmFyKC0tY29sb3ItdGV4dC0xMDApOyBib3JkZXItcmFkaXVzOiA0cHg7IGZvbnQtc2l6ZTogMTFweDtcIlxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICBpZD1cImNvcHktY3NzXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPVwiZmxleDogMTsgcGFkZGluZzogOHB4OyBjdXJzb3I6IHBvaW50ZXI7IGJhY2tncm91bmQ6IHZhcigtLWNvbG9yLXByaW1hcnktNDAwKTsgY29sb3I6IHZhcigtLWNvbG9yLWJnLTkwMCk7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogNHB4OyBmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxMXB4O1wiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIENPUFkgQ1NTXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8Zm9ybVxyXG4gICAgICAgICAgICBpZD1cInRoZW1lLWZvcm1cIlxyXG4gICAgICAgICAgICBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGZsZXgtd3JhcDogd3JhcDsgZ2FwOiA4cHg7IHdpZHRoOiAxMDAlO1wiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgICAke3NlY3Rpb25IZWFkZXIoXCJCYWNrZ3JvdW5kIFNjYWxlXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy01MFwiLCBcIi0tY29sb3ItYmctNTBcIiwgXCIjYmFjMmRlXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy0xMDBcIiwgXCItLWNvbG9yLWJnLTEwMFwiLCBcIiNhNmFkYzhcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTE1MFwiLCBcIi0tY29sb3ItYmctMTUwXCIsIFwiIzkzOTliMlwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctMjAwXCIsIFwiLS1jb2xvci1iZy0yMDBcIiwgXCIjN2Y4NDljXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy0zMDBcIiwgXCItLWNvbG9yLWJnLTMwMFwiLCBcIiM2YzcwODZcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTQwMFwiLCBcIi0tY29sb3ItYmctNDAwXCIsIFwiIzU4NWI3MFwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctNTAwXCIsIFwiLS1jb2xvci1iZy01MDBcIiwgXCIjNDU0NzVhXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJiZy02MDBcIiwgXCItLWNvbG9yLWJnLTYwMFwiLCBcIiMzMTMyNDRcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTcwMCAoQmFzZSlcIiwgXCItLWNvbG9yLWJnLTcwMFwiLCBcIiMxZTFlMmVcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTgwMCAoTWFudGxlKVwiLCBcIi0tY29sb3ItYmctODAwXCIsIFwiIzE4MTgyNVwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiYmctOTAwIChDcnVzdClcIiwgXCItLWNvbG9yLWJnLTkwMFwiLCBcIiMxMTExMWJcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcImJnLTk1MFwiLCBcIi0tY29sb3ItYmctOTUwXCIsIFwiIzBhMGExMlwiKX1cclxuICAgICAgICAgICAgJHtzZWN0aW9uSGVhZGVyKFwiUHJpbWFyeSBBY2NlbnRcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcInByaS01MFwiLCBcIi0tY29sb3ItcHJpbWFyeS01MFwiLCBcIiNmYWY1ZmZcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcInByaS0yMDBcIiwgXCItLWNvbG9yLXByaW1hcnktMjAwXCIsIFwiI2U5ZDVmZFwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFxyXG4gICAgICAgICAgICAgICAgXCJwcmktNDAwIChNYWluKVwiLFxyXG4gICAgICAgICAgICAgICAgXCItLWNvbG9yLXByaW1hcnktNDAwXCIsXHJcbiAgICAgICAgICAgICAgICBcIiNjYmE2ZjdcIlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJwcmktNjAwXCIsIFwiLS1jb2xvci1wcmltYXJ5LTYwMFwiLCBcIiM5ZDcxZThcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcInByaS04MDBcIiwgXCItLWNvbG9yLXByaW1hcnktODAwXCIsIFwiIzZiM2ZiZFwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwicHJpLTk1MFwiLCBcIi0tY29sb3ItcHJpbWFyeS05NTBcIiwgXCIjMzUxZDZiXCIpfVxyXG4gICAgICAgICAgICAke3NlY3Rpb25IZWFkZXIoXCJUeXBvZ3JhcGh5XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJUZXh0IEhpZ2hcIiwgXCItLWNvbG9yLXRleHQtMTAwXCIsIFwiI2ZmZmZmZlwiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiVGV4dCBNZWRcIiwgXCItLWNvbG9yLXRleHQtNTBcIiwgXCIjY2RkNmY0XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJUZXh0IExvd1wiLCBcIi0tY29sb3ItdGV4dC01MDBcIiwgXCIjN2Y4NDljXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJUZXh0IE11dGVkXCIsIFwiLS1jb2xvci10ZXh0LTcwMFwiLCBcIiM2YzcwODZcIil9XHJcbiAgICAgICAgICAgICR7c2VjdGlvbkhlYWRlcihcIlNlbWFudGljICYgTGlua3NcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIlN1Y2Nlc3NcIiwgXCItLXRleHQtb2tcIiwgXCIjYTZlM2ExXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJXYXJuaW5nXCIsIFwiLS10ZXh0LXdhcm5pbmdcIiwgXCIjZmFiMzg3XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJFcnJvclwiLCBcIi0tdGV4dC1lcnJvclwiLCBcIiNmMzhiYThcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIkxpbmtcIiwgXCItLWxpbmstY29sb3JcIiwgXCIjODliNGZhXCIpfVxyXG4gICAgICAgICAgICAke3NlY3Rpb25IZWFkZXIoXCJFZGl0b3IgRWxlbWVudHNcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIkhhc2h0YWdcIiwgXCItLWVkLWhhc2h0YWctY29sb3JcIiwgXCIjOTRlMmQ1XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJNZW50aW9uXCIsIFwiLS1lZC1tZW50aW9uLWNvbG9yXCIsIFwiI2Y1YzJlN1wiKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiRGF0ZS9UaW1lXCIsIFwiLS1lZC1kYXRldGltZS1jb2xvclwiLCBcIiM3NGM3ZWNcIil9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcclxuICAgICAgICAgICAgICAgIFwiUXVvdGUgQm9yZGVyXCIsXHJcbiAgICAgICAgICAgICAgICBcIi0tZWQtcXVvdGUtYm9yZGVyLWNvbG9yXCIsXHJcbiAgICAgICAgICAgICAgICBcIiNiNGJlZmVcIlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXCJUb2RvIERvbmVcIiwgXCItLWVkLWNoZWNrLWRvbmUtYmdcIiwgXCIjYTZlM2ExXCIpfVxyXG4gICAgICAgICAgICAke3NlY3Rpb25IZWFkZXIoXCJVSSBDb21wb25lbnRzXCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXHJcbiAgICAgICAgICAgICAgICBcIlNpZGViYXIgQWN0aXZlXCIsXHJcbiAgICAgICAgICAgICAgICBcIi0tc2lkZS1iZy1hY3RpdmUtZm9jdXNcIixcclxuICAgICAgICAgICAgICAgIFwiIzMxMzI0NFwiXHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICR7Y3JlYXRlU2NhbGVJbnB1dChcIkNhcmQgQmFja2dyb3VuZFwiLCBcIi0tY2FyZHMtYmdcIiwgXCIjMTgxODI1XCIpfVxyXG4gICAgICAgICAgICAke2NyZWF0ZVNjYWxlSW5wdXQoXHJcbiAgICAgICAgICAgICAgICBcIklucHV0IEJhY2tncm91bmRcIixcclxuICAgICAgICAgICAgICAgIFwiLS1pbnB1dC1iZy1jb2xvclwiLFxyXG4gICAgICAgICAgICAgICAgXCIjMTExMTFiXCJcclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgJHtjcmVhdGVTY2FsZUlucHV0KFwiTG9nbyBDb2xvclwiLCBcIi0tbG9nby1jb2xvclwiLCBcIiNjYmE2ZjdcIil9XHJcbiAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgIHN0eWxlPVwiZm9udC1zaXplOiA5cHg7IGNvbG9yOiB2YXIoLS1jb2xvci10ZXh0LTcwMCk7IHRleHQtYWxpZ246IGNlbnRlcjsgbWFyZ2luLXRvcDogMTBweDtcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgICAgQ2hhbmdlcyBhcmUgYXBwbGllZCBsaXZlIHRvIHRoZSBhcHBsaWNhdGlvbiByb290LlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbmA7XHJcbiIsICJleHBvcnQgY29uc3QgcHJlc2V0VGhlbWVzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiA9IHtcclxuICAgIGNhdHBwdWNjaW5fYnlfamRfYW5kX25pa2xhczoge1xyXG4gICAgICAgIFwiLS1jb2xvci1iZy01MFwiOiBcIiNiYWMyZGVcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctMTAwXCI6IFwiI2E2YWRjOFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy0xNTBcIjogXCIjOTM5OWIyXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTIwMFwiOiBcIiM3Zjg0OWNcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctMzAwXCI6IFwiIzZjNzA4NlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy00MDBcIjogXCIjNTg1YjcwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTUwMFwiOiBcIiM0NTQ3NWFcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNjAwXCI6IFwiIzMxMzI0NFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy03MDBcIjogXCIjMWUxZTJlXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTgwMFwiOiBcIiMxODE4MjVcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctOTAwXCI6IFwiIzExMTExYlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy05NTBcIjogXCIjMGEwYTEyXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXByaW1hcnktNDAwXCI6IFwiI2NiYTZmN1wiLFxyXG4gICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTYwMFwiOiBcIiM5ZDcxZThcIixcclxuICAgICAgICBcIi0tY29sb3ItdGV4dC0xMDBcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgICAgXCItLXRleHQtb2tcIjogXCIjYTZlM2ExXCIsXHJcbiAgICAgICAgXCItLXRleHQtd2FybmluZ1wiOiBcIiNmYWIzODdcIixcclxuICAgICAgICBcIi0tdGV4dC1lcnJvclwiOiBcIiNmMzhiYThcIixcclxuICAgICAgICBcIi0tbGluay1jb2xvclwiOiBcIiM4OWI0ZmFcIixcclxuICAgICAgICBcIi0tZWQtaGFzaHRhZy1jb2xvclwiOiBcIiM5NGUyZDVcIixcclxuICAgICAgICBcIi0tZWQtcXVvdGUtYm9yZGVyLWNvbG9yXCI6IFwiI2I0YmVmZVwiLFxyXG4gICAgICAgIFwiLS1jYXJkcy1iZ1wiOiBcIiMxODE4MjVcIixcclxuICAgICAgICBcIi0taW5wdXQtYmctY29sb3JcIjogXCIjMTgxODI1XCIsXHJcbiAgICAgICAgXCItLWxvZ28tY29sb3JcIjogXCIjY2JhNmY3XCIsXHJcbiAgICAgICAgXCItLXNpZGUtYmctYWN0aXZlLWZvY3VzXCI6IFwiI2NiYTZmN1wiLFxyXG4gICAgfSxcclxuXHJcbiAgICB3YXl3YXJkX2J5X2hvc3RpbGVfc3Bvb246IHtcclxuICAgICAgICBcIi0tY29sb3ItYmctNzAwXCI6IFwiIzI0MjIyMFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy04MDBcIjogXCIjMWMxYjE5XCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTkwMFwiOiBcIiMxNDEzMTJcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNDAwXCI6IFwiIzRhNDUzZVwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMFwiOiBcIiNkNzk5MjFcIixcclxuICAgICAgICBcIi0tY29sb3ItdGV4dC0xMDBcIjogXCIjZWJkYmIyXCIsXHJcbiAgICAgICAgXCItLXRleHQtb2tcIjogXCIjYjhiYjI2XCIsXHJcbiAgICAgICAgXCItLXRleHQtd2FybmluZ1wiOiBcIiNmZTgwMTlcIixcclxuICAgICAgICBcIi0tdGV4dC1lcnJvclwiOiBcIiNmYjQ5MzRcIixcclxuICAgICAgICBcIi0tbGluay1jb2xvclwiOiBcIiM4M2E1OThcIixcclxuICAgICAgICBcIi0tZWQtaGFzaHRhZy1jb2xvclwiOiBcIiM4ZWMwN2NcIixcclxuICAgICAgICBcIi0tZWQtcXVvdGUtYm9yZGVyLWNvbG9yXCI6IFwiI2QzODY5YlwiLFxyXG4gICAgICAgIFwiLS1jYXJkcy1iZ1wiOiBcIiMxYzFiMTlcIixcclxuICAgICAgICBcIi0taW5wdXQtYmctY29sb3JcIjogXCIjMjQyMjIwXCIsXHJcbiAgICAgICAgXCItLWxvZ28tY29sb3JcIjogXCIjZDc5OTIxXCIsXHJcbiAgICB9LFxyXG5cclxuICAgIG5vcmRpYzoge1xyXG4gICAgICAgIC8vIERlZXAgQXJjdGljIEJsdWVzXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTcwMFwiOiBcIiMyZTM0NDBcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctODAwXCI6IFwiIzI0MjkzM1wiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy05MDBcIjogXCIjMWIxZTI1XCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTQwMFwiOiBcIiM0YzU2NmFcIixcclxuICAgICAgICBcIi0tY29sb3ItcHJpbWFyeS00MDBcIjogXCIjODhjMGQwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLXRleHQtMTAwXCI6IFwiI2VjZWZmNFwiLFxyXG4gICAgICAgIFwiLS10ZXh0LW9rXCI6IFwiI2EzYmU4Y1wiLFxyXG4gICAgICAgIFwiLS10ZXh0LXdhcm5pbmdcIjogXCIjZWJjYjhiXCIsXHJcbiAgICAgICAgXCItLXRleHQtZXJyb3JcIjogXCIjYmY2MTZhXCIsXHJcbiAgICAgICAgXCItLWxpbmstY29sb3JcIjogXCIjODFhMWMxXCIsXHJcbiAgICAgICAgXCItLWVkLWhhc2h0YWctY29sb3JcIjogXCIjOGZiY2JiXCIsXHJcbiAgICAgICAgXCItLWVkLXF1b3RlLWJvcmRlci1jb2xvclwiOiBcIiNiNDhlYWRcIixcclxuICAgICAgICBcIi0tY2FyZHMtYmdcIjogXCIjMjQyOTMzXCIsXHJcbiAgICAgICAgXCItLWlucHV0LWJnLWNvbG9yXCI6IFwiIzJlMzQ0MFwiLFxyXG4gICAgICAgIFwiLS1sb2dvLWNvbG9yXCI6IFwiIzg4YzBkMFwiLFxyXG4gICAgfSxcclxuXHJcbiAgICByb3NlX3BpbmU6IHtcclxuICAgICAgICAvLyBNdXRlZCBTb2Z0IFBhbGV0dGVcclxuICAgICAgICBcIi0tY29sb3ItYmctNzAwXCI6IFwiIzE5MTcyNFwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy04MDBcIjogXCIjMTIxMDFiXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTkwMFwiOiBcIiMwYTA5MTBcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNDAwXCI6IFwiIzQwM2Q1MlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMFwiOiBcIiNlYmJjYmFcIixcclxuICAgICAgICBcIi0tY29sb3ItdGV4dC0xMDBcIjogXCIjZTBkZWY0XCIsXHJcbiAgICAgICAgXCItLXRleHQtb2tcIjogXCIjOWNjZmQ4XCIsXHJcbiAgICAgICAgXCItLXRleHQtd2FybmluZ1wiOiBcIiNmNmMxNzdcIixcclxuICAgICAgICBcIi0tdGV4dC1lcnJvclwiOiBcIiNlYjZmOTJcIixcclxuICAgICAgICBcIi0tbGluay1jb2xvclwiOiBcIiMzMTc0OGZcIixcclxuICAgICAgICBcIi0tZWQtaGFzaHRhZy1jb2xvclwiOiBcIiNlYmJjYmFcIixcclxuICAgICAgICBcIi0tZWQtcXVvdGUtYm9yZGVyLWNvbG9yXCI6IFwiI2M0YTdlN1wiLFxyXG4gICAgICAgIFwiLS1jYXJkcy1iZ1wiOiBcIiMxZjFkMmVcIixcclxuICAgICAgICBcIi0taW5wdXQtYmctY29sb3JcIjogXCIjMTkxNzI0XCIsXHJcbiAgICAgICAgXCItLWxvZ28tY29sb3JcIjogXCIjZWJiY2JhXCIsXHJcbiAgICB9LFxyXG5cclxuICAgIGN5YmVyX2xpbWU6IHtcclxuICAgICAgICBcIi0tY29sb3ItYmctNzAwXCI6IFwiIzA1MDUwNVwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1iZy04MDBcIjogXCIjMDAwMDAwXCIsXHJcbiAgICAgICAgXCItLWNvbG9yLWJnLTkwMFwiOiBcIiMwMDAwMDBcIixcclxuICAgICAgICBcIi0tY29sb3ItYmctNDAwXCI6IFwiIzIyMjIyMlwiLFxyXG4gICAgICAgIFwiLS1jb2xvci1wcmltYXJ5LTQwMFwiOiBcIiNjY2ZmMDBcIixcclxuICAgICAgICBcIi0tY29sb3ItdGV4dC0xMDBcIjogXCIjZmZmZmZmXCIsXHJcbiAgICAgICAgXCItLXRleHQtb2tcIjogXCIjMDBmZjg4XCIsXHJcbiAgICAgICAgXCItLXRleHQtd2FybmluZ1wiOiBcIiNmZmZmMDBcIixcclxuICAgICAgICBcIi0tdGV4dC1lcnJvclwiOiBcIiNmZjAwNTVcIixcclxuICAgICAgICBcIi0tbGluay1jb2xvclwiOiBcIiMwMGNjZmZcIixcclxuICAgICAgICBcIi0tZWQtaGFzaHRhZy1jb2xvclwiOiBcIiNjY2ZmMDBcIixcclxuICAgICAgICBcIi0tZWQtcXVvdGUtYm9yZGVyLWNvbG9yXCI6IFwiIzMzMzMzM1wiLFxyXG4gICAgICAgIFwiLS1jYXJkcy1iZ1wiOiBcIiMwYTBhMGFcIixcclxuICAgICAgICBcIi0taW5wdXQtYmctY29sb3JcIjogXCIjMTExMTExXCIsXHJcbiAgICAgICAgXCItLWxvZ28tY29sb3JcIjogXCIjY2NmZjAwXCIsXHJcbiAgICB9LFxyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FPLE1BQU0sVUFBTixNQUFjO0FBQUEsSUFBckIsT0FBcUI7QUFBQTtBQUFBO0FBQUEsSUFDVixhQUFhLEtBQXFCO0FBQ3JDLFlBQU0sTUFBTSxJQUFJLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNO0FBQ3ZDLGNBQU0sTUFBTSxTQUFTLEdBQUcsRUFBRSxJQUFJO0FBQzlCLGVBQU8sT0FBTyxVQUNSLE1BQU0sUUFDTixLQUFLLEtBQUssTUFBTSxTQUFTLE9BQU8sR0FBRztBQUFBLE1BQzdDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2QsYUFBTyxTQUFTLElBQUksQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksU0FBUyxJQUFJLENBQUM7QUFBQSxJQUM3RDtBQUFBLElBRU8sdUJBQXVCLElBQVksSUFBWTtBQUNsRCxZQUFNLFNBQVMsS0FBSyxJQUFJLElBQUksRUFBRSxJQUFJLFNBQVMsS0FBSyxJQUFJLElBQUksRUFBRSxJQUFJO0FBQzlELFlBQU0sT0FBTyxRQUFRO0FBQ3JCLGFBQU8sRUFBRSxPQUFPLEtBQUs7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
