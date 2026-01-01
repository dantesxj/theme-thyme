function createScaleInput(label: string, varName: string, defaultVal: string) {
    return `
        <div style="flex: 1 1 calc(33% - 10px); min-width: 110px; background: var(--color-bg-800); padding: 8px; border-radius: 6px; border: 1px solid var(--color-bg-400); box-sizing: border-box;">
            <label style="display:block; font-size: 8px; margin-bottom: 4px; color: var(--color-text-500); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">${label}</label>
            <input type="color" data-var="${varName}" value="${defaultVal}" style="width: 100%; height: 24px; border: none; cursor: pointer; background: transparent; display: block;">
        </div>
    `;
}

const sectionHeader = (title: string) => `
    <div style="width: 100%; margin-top: 15px; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid var(--color-bg-400);">
        <span style="font-size: 10px; font-weight: 800; color: var(--color-primary-400); text-transform: uppercase; letter-spacing: 1px;">${title}</span>
    </div>
`;

export const HTML_LAYOUT = `
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
                🎲 RANDOM
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
