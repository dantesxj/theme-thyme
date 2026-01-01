# Theme Architect for Thymer

![ThemeArchitect Full Layout](/screenshots/full_layout.png "Full Layout of Theme Architect")

Theme Architect is a powerful, real-time color engine for Thymer. It allows you to move beyond simple "Dark Mode" by providing granular control over every aspect of the UI—from background scales to semantic alert colors—with live-syncing CSS variables.

![Modular Control](/screenshots/modular_control.png "Upclose Theme Architect")

## 🚀 Features

-   Granular Palette Control: Fine-tune 20+ specific CSS variables including background scales (bg-50 to bg-950), primary accents, and editor-specific elements.

-   Intelligent Randomization: Unlike standard randomizers that produce "neon static," our engine uses HSL-based Cohesion. It generates harmonious color families by anchoring saturation and lightness while varying hue.

-   WCAG Contrast Analytics: Built-in real-time contrast ratio checker (standardized for bg-700 vs text-100) to ensure your notes remain readable and accessible.

-   Theme Presets: Includes professional presets like Catppuccin Mocha, Nordic Frost, and Rose Pine.

-   Persistent Storage: Automatically saves your custom tweaks to localStorage, so your architected theme stays active across sessions.

-   Instant CSS Export: Generate and copy the complete html[data-theme] CSS block with a single click to share or use in your custom stylesheets.

🛠 Usage

-   Open the Architect from your sidebar.

-   Tweak & Tune: Use the color pickers to adjust specific UI elements. The changes apply to the entire application instantly.

-   Check Contrast: Watch the Contrast Badge. A ✅ indicates the theme meets WCAG AA/AAA standards for readability.

-   Save/Export: Once you've perfected your look, use the COPY CSS button to get your code.

## 🎨 Under the Hood: The HSL Logic

Theme Architect doesn't just pick random colors. It calculates colors based on the HSL (Hue, Saturation, Lightness) model.

When you hit the Randomize button, the engine:

1. Anchors a Master Hue: Picks a primary tone to set the "mood."

2. Calculates Analogous Accents: Variations of the hue are picked for hashtags, links, and buttons.

3. Generates Functional Backgrounds: Ensures backgrounds stay in the low-lightness range (5%-15%) to prevent eye strain.

## 💻 Installation

To install

1. Navigate to the Plugins page by using ctrl or cmd + p and searching for plugins.
2. Click create plugin
3. Copy the contents of `plugin.json` under the configuration tab.
4. Copy the contents of `plugin.ts` from the dist folder (build) into custom code.
5. Preview the plugin to ensure its working and then press save.
