// @generated BEGIN thymer-ext-path-b (source: plugins/plugin-settings/ThymerExtPathBRuntime.js — edit that file, then npm run embed-path-b)
/**
 * ThymerExtPathB — shared path-B storage (Plugin Settings collection + localStorage mirror).
 * Edit this file in the repo, then run `npm run embed-path-b` to refresh embedded copies inside each Path B plugin.
 *
 * API: ThymerExtPathB.init({ plugin, pluginId, modeKey, mirrorKeys, label, data, ui })
 *      ThymerExtPathB.scheduleFlush(plugin, mirrorKeys)
 *      ThymerExtPathB.openStorageDialog(plugin, { pluginId, modeKey, mirrorKeys, label, data, ui })
 */
(function pathBRuntime(g) {
  if (g.ThymerExtPathB) return;

  const COL_NAME = 'Plugin Settings';
  const q = [];
  let busy = false;

  function drain() {
    if (busy || !q.length) return;
    busy = true;
    const job = q.shift();
    Promise.resolve(typeof job === 'function' ? job() : job)
      .catch((e) => console.error('[ThymerExtPathB]', e))
      .finally(() => {
        busy = false;
        if (q.length) setTimeout(drain, 450);
      });
  }

  function enqueue(job) {
    q.push(job);
    drain();
  }

  async function findColl(data) {
    try {
      const all = await data.getAllCollections();
      return all.find((c) => (c.getName?.() || '') === COL_NAME) || null;
    } catch (_) {
      return null;
    }
  }

  async function readDoc(data, pluginId) {
    const coll = await findColl(data);
    if (!coll) return null;
    let records;
    try {
      records = await coll.getAllRecords();
    } catch (_) {
      return null;
    }
    const r = records.find((x) => (x.text?.('plugin_id') || '').trim() === pluginId);
    if (!r) return null;
    let raw = '';
    try {
      raw = r.text?.('settings_json') || '';
    } catch (_) {}
    if (!raw || !String(raw).trim()) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  async function writeDoc(data, pluginId, doc) {
    const coll = await findColl(data);
    if (!coll) return;
    const json = JSON.stringify(doc);
    let records;
    try {
      records = await coll.getAllRecords();
    } catch (_) {
      return;
    }
    let r = records.find((x) => (x.text?.('plugin_id') || '').trim() === pluginId);
    if (!r) {
      let guid = null;
      try {
        guid = coll.createRecord?.(pluginId);
      } catch (_) {}
      if (guid) {
        for (let i = 0; i < 30; i++) {
          await new Promise((res) => setTimeout(res, i < 8 ? 100 : 200));
          try {
            const again = await coll.getAllRecords();
            r = again.find((x) => x.guid === guid) || again.find((x) => (x.text?.('plugin_id') || '').trim() === pluginId);
            if (r) break;
          } catch (_) {}
        }
      }
    }
    if (!r) return;
    try {
      const pId = r.prop?.('plugin_id');
      if (pId && typeof pId.set === 'function') pId.set(pluginId);
    } catch (_) {}
    try {
      const pj = r.prop?.('settings_json');
      if (pj && typeof pj.set === 'function') pj.set(json);
    } catch (_) {}
  }

  function showFirstRunDialog(ui, label, preferred, onPick) {
    const id = 'thymerext-pathb-first-' + Math.random().toString(36).slice(2);
    const box = document.createElement('div');
    box.id = id;
    box.style.cssText =
      'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:16px;';
    const card = document.createElement('div');
    card.style.cssText =
      'max-width:420px;width:100%;background:var(--panel-bg-color,#1d1915);border:1px solid var(--border-default,#3f3f46);border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.5);';
    const title = document.createElement('div');
    title.textContent = label + ' — where to store settings?';
    title.style.cssText = 'font-weight:700;font-size:15px;margin-bottom:10px;';
    const hint = document.createElement('div');
    hint.textContent = 'Change later via Command Palette → “Storage location…”';
    hint.style.cssText = 'font-size:12px;color:var(--text-muted,#888);margin-bottom:16px;line-height:1.45;';
    const mk = (t, sub, prim) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.cssText =
        'display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:10px;border-radius:8px;cursor:pointer;font-size:14px;border:1px solid var(--border-default,#3f3f46);background:' +
        (prim ? 'rgba(167,139,250,0.25)' : 'transparent') +
        ';color:inherit;';
      const x = document.createElement('div');
      x.textContent = t;
      x.style.fontWeight = '600';
      b.appendChild(x);
      if (sub) {
        const s = document.createElement('div');
        s.textContent = sub;
        s.style.cssText = 'font-size:11px;opacity:0.75;margin-top:4px;line-height:1.35;';
        b.appendChild(s);
      }
      return b;
    };
    const bLoc = mk('This device only', 'Browser localStorage only.', preferred === 'local');
    const bSyn = mk('Sync via Plugin Settings', 'Workspace collection “' + COL_NAME + '”.', preferred === 'synced');
    const fin = (m) => {
      try {
        box.remove();
      } catch (_) {}
      onPick(m);
    };
    bLoc.addEventListener('click', () => fin('local'));
    bSyn.addEventListener('click', () => fin('synced'));
    card.appendChild(title);
    card.appendChild(hint);
    card.appendChild(bLoc);
    card.appendChild(bSyn);
    box.appendChild(card);
    document.body.appendChild(box);
  }

  g.ThymerExtPathB = {
    COL_NAME,
    enqueue,
    async init(opts) {
      const { plugin, pluginId, modeKey, mirrorKeys, label, data, ui } = opts;
      let mode = null;
      try {
        mode = localStorage.getItem(modeKey);
      } catch (_) {}

      const remote = await readDoc(data, pluginId);
      if (!mode && remote && (remote.storageMode === 'synced' || remote.storageMode === 'local')) {
        mode = remote.storageMode;
        try {
          localStorage.setItem(modeKey, mode);
        } catch (_) {}
      }

      if (!mode) {
        const coll = await findColl(data);
        const preferred = coll ? 'synced' : 'local';
        await new Promise((outerResolve) => {
          enqueue(async () => {
            const picked = await new Promise((r) => {
              showFirstRunDialog(ui, label, preferred, r);
            });
            try {
              localStorage.setItem(modeKey, picked);
            } catch (_) {}
            outerResolve(picked);
          });
        });
        try {
          mode = localStorage.getItem(modeKey);
        } catch (_) {}
      }

      plugin._pathBMode = mode === 'synced' ? 'synced' : 'local';
      plugin._pathBPluginId = pluginId;
      const keys = typeof mirrorKeys === 'function' ? mirrorKeys() : mirrorKeys;

      if (plugin._pathBMode === 'synced' && remote && remote.payload && typeof remote.payload === 'object') {
        for (const k of keys) {
          const v = remote.payload[k];
          if (typeof v === 'string') {
            try {
              localStorage.setItem(k, v);
            } catch (_) {}
          }
        }
      }

      if (plugin._pathBMode === 'synced') {
        try {
          await g.ThymerExtPathB.flushNow(data, pluginId, keys);
        } catch (_) {}
      }
    },

    scheduleFlush(plugin, mirrorKeys) {
      if (plugin._pathBMode !== 'synced') return;
      const keys = typeof mirrorKeys === 'function' ? mirrorKeys() : mirrorKeys;
      if (plugin._pathBFlushTimer) clearTimeout(plugin._pathBFlushTimer);
      plugin._pathBFlushTimer = setTimeout(() => {
        plugin._pathBFlushTimer = null;
        const data = plugin.data;
        const pid = plugin._pathBPluginId;
        if (!pid || !data) return;
        g.ThymerExtPathB.flushNow(data, pid, keys).catch((e) => console.error('[ThymerExtPathB] flush', e));
      }, 500);
    },

    async flushNow(data, pluginId, mirrorKeys) {
      const keys = typeof mirrorKeys === 'function' ? mirrorKeys() : mirrorKeys;
      const payload = {};
      for (const k of keys) {
        try {
          const v = localStorage.getItem(k);
          if (v !== null) payload[k] = v;
        } catch (_) {}
      }
      const doc = {
        v: 1,
        storageMode: 'synced',
        updatedAt: new Date().toISOString(),
        payload,
      };
      await writeDoc(data, pluginId, doc);
    },

    async openStorageDialog(opts) {
      const { plugin, pluginId, modeKey, mirrorKeys, label, data, ui } = opts;
      const cur = plugin._pathBMode === 'synced' ? 'synced' : 'local';
      const pick = await new Promise((resolve) => {
        const close = (v) => {
          try {
            box.remove();
          } catch (_) {}
          resolve(v);
        };
        const box = document.createElement('div');
        box.style.cssText =
          'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:16px;';
        box.addEventListener('click', (e) => {
          if (e.target === box) close(null);
        });
        const card = document.createElement('div');
        card.style.cssText =
          'max-width:400px;width:100%;background:var(--panel-bg-color,#1d1915);border:1px solid var(--border-default,#3f3f46);border-radius:12px;padding:18px;';
        card.addEventListener('click', (e) => e.stopPropagation());
        const t = document.createElement('div');
        t.textContent = label + ' — storage';
        t.style.cssText = 'font-weight:700;margin-bottom:12px;';
        const b1 = document.createElement('button');
        b1.type = 'button';
        b1.textContent = 'This device only';
        const b2 = document.createElement('button');
        b2.type = 'button';
        b2.textContent = 'Sync via Plugin Settings';
        [b1, b2].forEach((b) => {
          b.style.cssText =
            'display:block;width:100%;padding:10px 12px;margin-bottom:8px;border-radius:8px;cursor:pointer;border:1px solid var(--border-default,#3f3f46);background:transparent;color:inherit;text-align:left;';
        });
        b1.addEventListener('click', () => close('local'));
        b2.addEventListener('click', () => close('synced'));
        const bx = document.createElement('button');
        bx.type = 'button';
        bx.textContent = 'Cancel';
        bx.style.cssText =
          'margin-top:8px;padding:8px 14px;border-radius:8px;cursor:pointer;border:1px solid var(--border-default,#3f3f46);background:transparent;color:inherit;';
        bx.addEventListener('click', () => close(null));
        card.appendChild(t);
        card.appendChild(b1);
        card.appendChild(b2);
        card.appendChild(bx);
        box.appendChild(card);
        document.body.appendChild(box);
      });
      if (!pick || pick === cur) return;
      try {
        localStorage.setItem(modeKey, pick);
      } catch (_) {}
      plugin._pathBMode = pick === 'synced' ? 'synced' : 'local';
      const keys = typeof mirrorKeys === 'function' ? mirrorKeys() : mirrorKeys;
      if (pick === 'synced') await g.ThymerExtPathB.flushNow(data, pluginId, keys);
      ui.addToaster?.({
        title: label,
        message: 'Storage: ' + (pick === 'synced' ? 'synced' : 'local only'),
        dismissible: true,
        autoDestroyTime: 3500,
      });
    },
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
// @generated END thymer-ext-path-b


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

  var plugin_exports = {};
  __export(plugin_exports, {
    Plugin: () => Plugin
  });

  // helpers.ts
  var Helpers = class {
    static { __name(this, "Helpers"); }
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
      const f = __name((n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      }, "f");
      return `#${f(0)}${f(8)}${f(4)}`;
    }
  };

  function createScaleInput(label, varName, defaultVal) {
    return `
        <div style="flex: 1 1 calc(33% - 10px); min-width: 110px; background: var(--color-bg-800); padding: 8px; border-radius: 6px; border: 1px solid var(--color-bg-400); box-sizing: border-box;">
            <label style="display:block; font-size: 8px; margin-bottom: 4px; color: var(--color-text-500); text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;">${label}</label>
            <input type="color" data-var="${varName}" value="${defaultVal}" style="width: 100%; height: 24px; border: none; cursor: pointer; background: transparent; display: block;">
        </div>
    `;
  }
  __name(createScaleInput, "createScaleInput");

  var sectionHeader = __name((title) => `
    <div style="width: 100%; margin-top: 15px; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid var(--color-bg-400);">
        <span style="font-size: 10px; font-weight: 800; color: var(--color-primary-400); text-transform: uppercase; letter-spacing: 1px;">${title}</span>
    </div>
`, "sectionHeader");

  var HTML_LAYOUT = `
    <div
        id="theme-editor"
        style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; padding: 15px; font-family: 'JetBrains Mono', monospace; color: var(--color-text-100); background: var(--color-bg-900); border-radius: 12px; border: 1px solid var(--color-bg-400); max-height: 95vh; overflow-y: auto;"
    >
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <h2 style="margin: 0; font-size: 1rem; color: var(--color-primary-400);">Theme Architect</h2>
            <div style="display: flex; gap: 6px; align-items: center;">
                <div id="contrast-badge" style="padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; background: var(--color-bg-800); border: 1px solid var(--color-bg-400); transition: all 0.3s ease;">CONTRAST: --</div>
                <button id="reset-all" style="padding: 4px 10px; cursor: pointer; background: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b; border-radius: 4px; font-size: 10px; font-weight: bold; font-family: inherit;" title="Clear all saved theme & background settings and reload">🗑 RESET ALL</button>
            </div>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <select id="theme-preset" style="flex: 2; padding: 8px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 12px; cursor: pointer;"></select>
            <button id="randomize-theme" style="flex: 1; padding: 8px; cursor: pointer; background: var(--color-bg-600); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; font-weight: bold;">\u{1F3B2} RANDOM</button>
        </div>

        <div style="display: flex; gap: 6px; width: 100%;">
            <input type="text" id="custom-theme-name" placeholder="my-custom-theme" style="flex: 2; padding: 8px; background: var(--color-bg-700); border: 1px solid var(--color-bg-400); color: var(--color-text-100); border-radius: 4px; font-size: 11px;"/>
            <button id="copy-css" style="flex: 1; padding: 8px; cursor: pointer; background: var(--color-primary-400); color: var(--color-bg-900); border: none; border-radius: 4px; font-weight: bold; font-size: 11px;">COPY CSS</button>
        </div>
        <div style="display: flex; gap: 6px; width: 100%;">
            <button id="export-theme" style="flex: 1; padding: 7px; cursor: pointer; background: var(--color-bg-600); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; font-weight: bold;">⬇ Export Theme</button>
            <button id="import-theme" style="flex: 1; padding: 7px; cursor: pointer; background: var(--color-bg-600); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; font-weight: bold;">⬆ Import Theme</button>
            <input id="import-file-input" type="file" accept=".json" style="display:none;" />
        </div>

        <form id="theme-form" style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;">
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
            ${createScaleInput("pri-400 (Main)", "--color-primary-400", "#cba6f7")}
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
            ${createScaleInput("Quote Border", "--ed-quote-border-color", "#b4befe")}
            ${createScaleInput("Todo Done", "--ed-check-done-bg", "#a6e3a1")}
            ${sectionHeader("UI Components")}
            ${createScaleInput("Sidebar Active", "--side-bg-active-focus", "#313244")}
            ${createScaleInput("Card Background", "--cards-bg", "#181825")}
            ${createScaleInput("Input Background", "--input-bg-color", "#11111b")}
            ${createScaleInput("Logo Color", "--logo-color", "#cba6f7")}
        </form>

        <!-- ═══════════════════════════════════════════════════ -->
        <!-- TRANSPARENCY & BACKGROUND SECTION                   -->
        <!-- ═══════════════════════════════════════════════════ -->

        ${sectionHeader("✦ Transparency & Background")}

        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">

            <!-- Background Image Upload -->
            <div style="background: var(--color-bg-800); border: 1px solid var(--color-bg-400); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 9px; font-weight: bold; color: var(--color-text-500); text-transform: uppercase; letter-spacing: 1px;">Background Image</label>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <label id="bg-upload-label" style="padding: 7px 14px; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; cursor: pointer; color: var(--color-text-100); white-space: nowrap;">
                        📂 Upload Image
                        <input type="file" id="bg-image-upload" accept="image/*" style="display: none;">
                    </label>
                    <input type="text" id="bg-image-url" placeholder="...or paste image URL" style="flex: 1; min-width: 140px; padding: 7px 10px; background: var(--color-bg-700); border: 1px solid var(--color-bg-400); color: var(--color-text-100); border-radius: 4px; font-size: 11px;">
                    <button id="bg-clear" style="padding: 7px 10px; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px; cursor: pointer; color: var(--color-text-500);">✕ Clear</button>
                </div>
                <div id="bg-preview" style="display: none; width: 100%; height: 80px; border-radius: 6px; background-size: cover; background-position: center; border: 1px solid var(--color-bg-400); position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); font-size: 10px; color: #fff;">Preview</div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px;">
                        <label style="display: block; font-size: 8px; color: var(--color-text-500); margin-bottom: 3px;">SIZE</label>
                        <select id="bg-size" style="width: 100%; padding: 5px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px;">
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 120px;">
                        <label style="display: block; font-size: 8px; color: var(--color-text-500); margin-bottom: 3px;">POSITION</label>
                        <select id="bg-position" style="width: 100%; padding: 5px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px;">
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 120px;">
                        <label style="display: block; font-size: 8px; color: var(--color-text-500); margin-bottom: 3px;">REPEAT</label>
                        <select id="bg-repeat" style="width: 100%; padding: 5px; background: var(--color-bg-700); color: var(--color-text-100); border: 1px solid var(--color-bg-400); border-radius: 4px; font-size: 11px;">
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Transparency Sliders -->
            <div style="background: var(--color-bg-800); border: 1px solid var(--color-bg-400); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                <label style="font-size: 9px; font-weight: bold; color: var(--color-text-500); text-transform: uppercase; letter-spacing: 1px;">Transparency</label>
                <p style="font-size: 10px; color: var(--color-text-700); margin: 0;">Requires a background image above, or a dark wallpaper visible through the app window. Lower = more transparent.</p>
                ${makeSlider("Overall", "panel-opacity", 0.85)}
                ${makeSlider("Command Palette", "cmdpal-opacity", 0.92)}
                ${makeSlider("Plugin Cards", "plugin-cards-opacity", 0.24)}
                <div style="margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--color-bg-400); display: flex; flex-direction: column; gap: 6px;">
                    <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 11px; color: var(--color-text-100);">
                        <input type="checkbox" id="desktop-hide-titlebar" style="margin-top: 2px; accent-color: var(--color-primary-400); flex-shrink: 0;">
                        <span style="line-height: 1.4;">
                            <strong style="display: block; margin-bottom: 4px; font-size: 11px;">Hide native title bar (desktop app)</strong>
                            <span style="font-size: 10px; color: var(--color-text-500); font-weight: normal;">Only applies in the Thymer desktop (Electron) build; no effect in the browser. May change window chrome / drag region. Turn off here or use Reset All to restore. Status row height is fixed (30px) — if the app layout shifts after a Thymer update, disable this and report it.</span>
                        </span>
                    </label>
                </div>
            </div>

            <!-- Backdrop Blur -->
            <div style="background: var(--color-bg-800); border: 1px solid var(--color-bg-400); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                <label style="font-size: 9px; font-weight: bold; color: var(--color-text-500); text-transform: uppercase; letter-spacing: 1px;">Frosted Glass Blur</label>

                ${makeSlider("Panel Blur (px)", "panel-blur", 0, 0, 24, 1, "px")}
                <div style="padding:6px 0 2px;font-size:11px;color:var(--text-muted);opacity:0.6;">Sidebar blur disabled (CSS limitation — breaks menus)</div>
            </div>

        </div>

        <!-- Live Style Painter -->
        ${sectionHeader("🎨 Live Style Painter")}
        <div style="background: var(--color-bg-800); border: 1px solid var(--color-bg-400); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
            <p style="font-size: 10px; color: var(--color-text-700); margin: 0;">Pick any element, choose a class, then paint its color live.</p>

            <!-- Step 1: Pick -->
            <div style="display: flex; gap: 8px; align-items: center;">
                <button id="painter-pick" style="flex: 1; padding: 7px; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); border-radius: 6px; font-size: 11px; cursor: pointer; color: var(--color-text-100); display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span id="painter-pick-icon">🎯</span> <span id="painter-pick-label">Pick Element</span>
                </button>
                <button id="painter-clear-all" style="padding: 7px 10px; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); border-radius: 6px; font-size: 11px; cursor: pointer; color: var(--color-text-500);">✕ Reset</button>
            </div>

            <!-- Step 2: Class chips (hidden until pick) -->
            <div id="painter-classes" style="display: none; flex-wrap: wrap; gap: 5px;"></div>

            <!-- Step 3: Property selector (hidden until class selected) -->
            <div id="painter-prop-row" style="display: none; gap: 6px; flex-direction: column;">
                <div style="font-size: 10px; color: var(--color-text-500); padding: 2px 0;">Editing: <strong id="painter-target-label" style="color: var(--color-text-200);"></strong></div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="painter-prop-btn" data-prop="color" style="padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); color: var(--color-text-200);">Text color</button>
                    <button class="painter-prop-btn" data-prop="background" style="padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); color: var(--color-text-200);">Background</button>
                    <button class="painter-prop-btn" data-prop="border-color" style="padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); color: var(--color-text-200);">Border</button>
                    <button class="painter-prop-btn" data-prop="custom" style="padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; background: var(--color-bg-600); border: 1px solid var(--color-bg-400); color: var(--color-text-200);">Custom…</button>
                </div>
            </div>

            <!-- Step 4: Color controls (hidden until property selected) -->
            <div id="painter-color-row" style="display: none; flex-direction: column; gap: 8px; background: var(--color-bg-900); border-radius: 6px; padding: 10px; border: 1px solid var(--color-bg-400);">
                <div id="painter-custom-prop-row" style="display: none; gap: 6px; align-items: center;">
                    <span style="font-size: 10px; color: var(--color-text-500); white-space: nowrap;">Property:</span>
                    <input id="painter-custom-prop" type="text" placeholder="e.g. font-size" style="flex: 1; padding: 4px 7px; border-radius: 4px; border: 1px solid var(--color-bg-400); background: var(--color-bg-700); color: var(--color-text-100); font-size: 11px;" />
                    <span style="font-size: 10px; color: var(--color-text-500); white-space: nowrap;">Value:</span>
                    <input id="painter-custom-val" type="text" placeholder="e.g. 24px" style="flex: 1; padding: 4px 7px; border-radius: 4px; border: 1px solid var(--color-bg-400); background: var(--color-bg-700); color: var(--color-text-100); font-size: 11px;" />
                </div>
                <div id="painter-color-controls" style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-size: 10px; color: var(--color-text-500); width: 36px;">Color</label>
                        <input id="painter-color-hex" type="color" value="#ffffff" style="width: 36px; height: 28px; border: none; background: none; cursor: pointer; border-radius: 4px;" />
                        <input id="painter-color-text" type="text" value="#ffffff" style="flex: 1; padding: 4px 7px; border-radius: 4px; border: 1px solid var(--color-bg-400); background: var(--color-bg-700); color: var(--color-text-100); font-size: 11px; font-family: monospace;" />
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-size: 10px; color: var(--color-text-500); width: 36px;">Alpha</label>
                        <input id="painter-alpha" type="range" min="0" max="1" step="0.01" value="1" style="flex: 1;" />
                        <span id="painter-alpha-val" style="font-size: 10px; color: var(--color-text-300); width: 28px; text-align: right;">100%</span>
                    </div>
                    <div id="painter-preview-swatch" style="height: 18px; border-radius: 4px; background: white; border: 1px solid var(--color-bg-400);"></div>
                </div>
                <button id="painter-apply" style="padding: 7px; background: var(--color-primary-600); border: none; border-radius: 6px; font-size: 11px; cursor: pointer; color: white; font-weight: 600;">Apply Live ✓</button>
            </div>

            <!-- Saved overrides list -->
            <div id="painter-saved-list" style="display: none; flex-direction: column; gap: 4px;">
                <div style="font-size: 10px; color: var(--color-text-600); padding: 2px 0;">Saved overrides:</div>
                <div id="painter-saved-items" style="display: flex; flex-direction: column; gap: 3px;"></div>
            </div>

            <!-- Debug output (collapsed by default) -->
            <details style="margin-top: 2px;">
                <summary style="font-size: 10px; color: var(--color-text-600); cursor: pointer;">Show raw classes (debug)</summary>
                <div id="inspector-output" style="margin-top: 6px; font-size: 10px; font-family: monospace; background: var(--color-bg-900); border: 1px solid var(--color-bg-400); border-radius: 4px; padding: 8px; color: var(--color-text-100); white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto;"></div>
            </details>
        </div>

        <div style="font-size: 9px; color: var(--color-text-700); text-align: center; margin-top: 10px;">
            Changes are applied live to the application root.
        </div>
    </div>
`;

  function makeSlider(label, id, defaultVal, min = 0, max = 1, step = 0.01, unit = "") {
    const displayVal = unit === "px" ? `${defaultVal}${unit}` : `${Math.round(defaultVal * 100)}%`;
    return `
        <div style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label style="font-size: 9px; color: var(--color-text-500); text-transform: uppercase; letter-spacing: 0.5px;">${label}</label>
                <span id="${id}-val" style="font-size: 10px; color: var(--color-primary-400); font-variant-numeric: tabular-nums;">${displayVal}</span>
            </div>
            <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${defaultVal}"
                style="width: 100%; accent-color: var(--color-primary-400); cursor: pointer; height: 4px;">
        </div>
    `;
  }
  __name(makeSlider, "makeSlider");

  // preset themes (unchanged from original)
  var presetThemes = {
    catppuccin_by_jd_and_niklas: {
      "--color-bg-50": "#bac2de", "--color-bg-100": "#a6adc8", "--color-bg-150": "#9399b2",
      "--color-bg-200": "#7f849c", "--color-bg-300": "#6c7086", "--color-bg-400": "#585b70",
      "--color-bg-500": "#45475a", "--color-bg-600": "#313244", "--color-bg-700": "#1e1e2e",
      "--color-bg-800": "#181825", "--color-bg-900": "#11111b", "--color-bg-950": "#0a0a12",
      "--color-primary-400": "#cba6f7", "--color-primary-600": "#9d71e8",
      "--color-text-100": "#ffffff", "--text-ok": "#a6e3a1", "--text-warning": "#fab387",
      "--text-error": "#f38ba8", "--link-color": "#89b4fa", "--ed-hashtag-color": "#94e2d5",
      "--ed-quote-border-color": "#b4befe", "--cards-bg": "#181825", "--input-bg-color": "#181825",
      "--logo-color": "#cba6f7", "--side-bg-active-focus": "#cba6f7"
    },
    wayward_by_hostile_spoon: {
      "--color-bg-700": "#242220", "--color-bg-800": "#1c1b19", "--color-bg-900": "#141312",
      "--color-bg-400": "#4a453e", "--color-primary-400": "#d79921", "--color-text-100": "#ebdbb2",
      "--text-ok": "#b8bb26", "--text-warning": "#fe8019", "--text-error": "#fb4934",
      "--link-color": "#83a598", "--ed-hashtag-color": "#8ec07c", "--ed-quote-border-color": "#d3869b",
      "--cards-bg": "#1c1b19", "--input-bg-color": "#242220", "--logo-color": "#d79921"
    },
    nordic: {
      "--color-bg-700": "#2e3440", "--color-bg-800": "#242933", "--color-bg-900": "#1b1e25",
      "--color-bg-400": "#4c566a", "--color-primary-400": "#88c0d0", "--color-text-100": "#eceff4",
      "--text-ok": "#a3be8c", "--text-warning": "#ebcb8b", "--text-error": "#bf616a",
      "--link-color": "#81a1c1", "--ed-hashtag-color": "#8fbcbb", "--ed-quote-border-color": "#b48ead",
      "--cards-bg": "#242933", "--input-bg-color": "#2e3440", "--logo-color": "#88c0d0"
    },
    rose_pine: {
      "--color-bg-700": "#191724", "--color-bg-800": "#12101b", "--color-bg-900": "#0a0910",
      "--color-bg-400": "#403d52", "--color-primary-400": "#ebbcba", "--color-text-100": "#e0def4",
      "--text-ok": "#9ccfd8", "--text-warning": "#f6c177", "--text-error": "#eb6f92",
      "--link-color": "#31748f", "--ed-hashtag-color": "#ebbcba", "--ed-quote-border-color": "#c4a7e7",
      "--cards-bg": "#1f1d2e", "--input-bg-color": "#191724", "--logo-color": "#ebbcba"
    },
    cyber_lime: {
      "--color-bg-700": "#050505", "--color-bg-800": "#000000", "--color-bg-900": "#000000",
      "--color-bg-400": "#222222", "--color-primary-400": "#ccff00", "--color-text-100": "#ffffff",
      "--text-ok": "#00ff88", "--text-warning": "#ffff00", "--text-error": "#ff0055",
      "--link-color": "#00ccff", "--ed-hashtag-color": "#ccff00", "--ed-quote-border-color": "#333333",
      "--cards-bg": "#0a0a0a", "--input-bg-color": "#111111", "--logo-color": "#ccff00"
    }
  };

  var STORAGE_KEY = "theme-architect";
  var STORAGE_KEY_BG = "theme-architect-bg";

  var Plugin = class extends AppPlugin {
    static { __name(this, "Plugin"); }
    Helpers = new Helpers();
    _injectedCssHandle = null;

    _taPathBMirrorKeys() {
      return [STORAGE_KEY, STORAGE_KEY_BG, "theme-architect-painter"];
    }

    _taPathBFlush() {
      globalThis.ThymerExtPathB?.scheduleFlush?.(this, () => this._taPathBMirrorKeys());
    }

    async onLoad() {
      await (globalThis.ThymerExtPathB?.init?.({
        plugin: this,
        pluginId: "theme-architect",
        modeKey: "thymerext_ps_mode_theme_architect",
        mirrorKeys: () => this._taPathBMirrorKeys(),
        label: "Theme Architect",
        data: this.data,
        ui: this.ui,
      }) ?? (console.warn("[Theme Architect] ThymerExtPathB runtime missing (redeploy full plugin .js from repo)."), Promise.resolve()));
      this.hydrateThemeFromStorage();
      this._applyPersistedTransparencyCSS();
      this.ui.addSidebarItem({
        label: "Theme Architect",
        icon: "analyze",
        tooltip: "Live customisation of colors and transparency for thymer",
        onClick: __name(() => { this.createAndNavigateToNewPanel(); }, "onClick")
      });
      this.ui.addCommandPaletteCommand({
        label: "Theme Architect: Storage location…",
        icon: "ti-database",
        onSelected: () => {
          globalThis.ThymerExtPathB?.openStorageDialog?.({
            plugin: this,
            pluginId: "theme-architect",
            modeKey: "thymerext_ps_mode_theme_architect",
            mirrorKeys: () => this._taPathBMirrorKeys(),
            label: "Theme Architect",
            data: this.data,
            ui: this.ui,
          });
        },
      });
    }

    onUnload() {
      this.saveCurrentThemeToStorage();
      this.saveBgToStorage();
    }

    // Called on load and whenever settings change — uses injectCSS so it survives navigation
    _applyPersistedTransparencyCSS() {
      const bgData = this.loadBgData();
      if (bgData.dataUrl) this._currentBgDataUrl = bgData.dataUrl;

      const url = bgData.dataUrl || bgData.url || "";
      const size = bgData.size || "cover";
      const position = bgData.position || "center";
      const repeat = bgData.repeat || "no-repeat";
      const panelOpacity   = bgData.panelOpacity   ?? 0.85;
      const sidebarOpacity = panelOpacity;  // master slider controls all
      const cmdpalOpacity  = bgData.cmdpalOpacity   ?? 0.92;
      const pluginCardsOpacity = bgData.pluginCardsOpacity ?? 0.24;
      const cardsOpacity   = panelOpacity;
      const modalOpacity   = panelOpacity;
      const panelBlur      = bgData.panelBlur       ?? 0;
      const cardBlur       = 0;
      const listitemBlur   = 0;
      const listitemCardOpacity   = bgData.listitemCardOpacity   ?? 0.45;
      const listitemBorderOpacity = bgData.listitemBorderOpacity ?? 0.08;
      const listitemRadius = bgData.listitemRadius  ?? 6;
      const cardsEnabled   = bgData.cardsEnabled    === true;
      const hideDesktopTitleBar = bgData.hideDesktopTitleBar === true;

      const root = document.documentElement;
      const getBaseRgb = (varName, fallback) => {
        const hex = root.style.getPropertyValue(varName).trim() ||
                    getComputedStyle(root).getPropertyValue(varName).trim() ||
                    fallback;
        const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (!m) return "0,0,0";
        return `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}`;
      };

      const panelRgb   = getBaseRgb("--color-bg-900", "#11111b");
      const sidebarRgb = getBaseRgb("--color-bg-800", "#181825");
      const cmdpalRgb  = getBaseRgb("--color-bg-700", "#1e1e2e");
      const cardsRgb   = getBaseRgb("--color-bg-800", "#181825");
      const seamOpacity = Math.min(0.2, Math.max(0.06, panelOpacity * 0.18));
      const globalTintOpacity = Math.min(0.96, Math.max(0.08, panelOpacity));
      const blur = (px) => px > 0 ? `blur(${px}px)` : "none";
      const bgImageCSS = url ? `url("${url}") ${repeat} ${position} / ${size} fixed` : "";

      const listitemCSS = cardsEnabled ? `
        .listitem {
          background: rgba(${panelRgb}, ${listitemCardOpacity}) !important;
          border-radius: ${listitemRadius}px !important;
          margin-bottom: 2px !important;
          border: 1px solid rgba(255,255,255,${listitemBorderOpacity}) !important;
          backdrop-filter: ${blur(listitemBlur)};
          -webkit-backdrop-filter: ${blur(listitemBlur)};
        }
      ` : "";

      const css = `
        /* Background on body::before — keeps html free of stacking context.
           html with background-image can create a containing block in Electron
           that offsets position:fixed menus. body::before is safe. */
        html, body {
          background: transparent !important;
        }
        body {
          position: relative !important;
        }
        ${url ? `
        body::before {
          content: '' !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: -9999 !important;
          background: url("${url}") ${repeat} ${position} / ${size} !important;
          pointer-events: none !important;
        }` : ""}
        body::after {
          content: '' !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: -9998 !important;
          background: rgba(${panelRgb}, ${globalTintOpacity}) !important;
          pointer-events: none !important;
        }
        /* Make app containers transparent so background shows through */
        .app,
        #app,
        .panels-grid,
        .panels-grid-content {
          background: transparent !important;
          gap: 0 !important;
          column-gap: 0 !important;
          row-gap: 0 !important;
        }
        /* Cadence datepicker overrides disabled for now (can cause duplicate/double calendar rendering).
           Future fix should live in Cadence plugin CSS with precise selectors. */

        /* Panel tint: direct background on panel-body — safe, no stacking context */
        .panel-body {
          background: transparent !important;
        }
        /* panel-normal: completely clean — no stacking context properties at all */
        .panel-normal {
          background: transparent !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        /* Panel blur applied to body::before via filter.
           No transform used — transform creates a containing block in Chromium
           which would offset position:fixed menus.
           Blur edge bleed is hidden by body overflow:hidden instead. */
        body {
          overflow: hidden !important;
        }
        /* Very large blur values are expensive (full-viewport filter); keep the slider sane in UI. */
        ${panelBlur > 0 ? `
        body::before {
          filter: blur(${panelBlur}px) !important;
        }` : `
        body::before {
          filter: none !important;
        }`}
        /* Panel header / breadcrumb bar — tinted with master opacity */
        .panel-heading,
        .panel-bar,
        .panel-bar--tabs,
        .panel-bar--tabsbar {
          background: transparent !important;
        }
        .banner-container,
        .banner-outer,
        .panel-header-scrim {
          background: transparent !important;
          opacity: 1 !important;
        }
        .panel-header-scrim {
          display: none !important;
        }

        /* All sizer/divider elements — fully transparent, no borders */
        .panel-h-sizer,
        .panel-h-sizer-handle,
        .panel-v-sizer,
        .panel-v-sizer-handle,
        .sb_sizer,
        .panel-sizer,
        [class*="-sizer"],
        [class*="-sizer-handle"] {
          background: rgba(${panelRgb}, ${seamOpacity}) !important;
          background-color: rgba(${panelRgb}, ${seamOpacity}) !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }
        .panels-grid,
        .panels-grid-sidebar,
        .panels-grid-content,
        .app-chrome-panels {
          background: transparent !important;
          background-color: transparent !important;
        }
        /* NOTE: overflow:hidden on panels breaks dropdown/calendar popups — do NOT add */

        /* Status bar — transparent, inherits background blur from body::before */
        .statusbar--status-bar,
        .statusbar,
        [class*="status-bar"],
        [class*="statusbar"] {
          background: transparent !important;
          background-color: transparent !important;
          border-top: none !important;
          box-shadow: none !important;
        }

        /* Table: frozen left column + options cell transparency */
        .overview-panel,
        .overview-view,
        .layout-margin,
        .table-view,
        .table-view-table,
        .table-view-cell.options-cell,
        .table-view-cell.is-frozen,
        .table-view-cell.is-focused,
        [class*="options-cell"],
        [class*="is-frozen"] {
          background: transparent !important;
          background-color: transparent !important;
        }

        /* Sidebar — uses same opacity as master transparency slider */
        .sidebar {
          background: transparent !important;
          position: relative !important;
        }
        /* Toggler arrow — must have explicit position to show above sidebar bg */
        .sidebar--toggler {
          position: absolute !important;
          right: -14px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 100 !important;
        }
        .cmdpal--dialog {
          background: rgba(${cmdpalRgb}, ${cmdpalOpacity}) !important;
          backdrop-filter: ${blur(Math.max(panelBlur, 8))};
          -webkit-backdrop-filter: ${blur(Math.max(panelBlur, 8))};
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
        /* Plugin/settings cards and dialog content: apply frosted surfaces instead of opaque dark blocks */
        .plugin-item,
        .plugins-list .plugin-item,
        .modal-tab-body .plugin-item,
        .panel-dialog-body .plugin-item,
        #id--global-content .plugin-item,
        .modal-tab-body,
        .panel-dialog-body,
        .id--body,
        .id--main {
          background: rgba(${panelRgb}, ${pluginCardsOpacity}) !important;
          border-color: rgba(255,255,255,0.10) !important;
          backdrop-filter: ${blur(Math.max(panelBlur, 10))} !important;
          -webkit-backdrop-filter: ${blur(Math.max(panelBlur, 10))} !important;
        }
        .collection-card, .kanban-card {
          background: rgba(${cardsRgb}, ${Math.max(0.05, cardsOpacity * 0.2)}) !important;
          backdrop-filter: ${blur(cardBlur)};
          -webkit-backdrop-filter: ${blur(cardBlur)};
        }
        .modal, .toaster {
          background: rgba(${panelRgb}, ${Math.max(0.18, modalOpacity * 0.55)}) !important;
        }
        ${listitemCSS}

        /* Command palette & menu selected item highlight color */
        .cmdpal--option-selected,
        .cmdpal--option.is-selected,
        .autocomplete--option-selected,
        [class*="option-selected"],
        [class*="option--selected"],
        .button-normal-hover:focus,
        .cmdpal--dialog .active > *,
        .cmdpal--dialog [class*="selected"] {
          background: var(--color-primary-600) !important;
          color: var(--color-text-50) !important;
        }

        /* Choice / status property pills — rounded */
        .prop-status-record,
        .prop-status,
        [class*="prop-status"],
        .prop-multi-values .prop-status-record,
        .page-props-cell .prop-status-record {
          border-radius: 999px !important;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        /* The grey container around multi-value props */
        .prop-multi-values {
          border-radius: 8px !important;
        }
        .page-props-cell {
          border-radius: 8px !important;
        }

        /* Backreferences footer — glass treatment */
        .tlr-footer {
          background: rgba(${panelRgb}, ${panelOpacity}) !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.04) !important;
          padding: 12px 14px !important;
          margin-top: 16px !important;
        }
        .tlr-sort-menu {
          backdrop-filter: ${blur(Math.max(panelBlur, 8))} !important;
          -webkit-backdrop-filter: ${blur(Math.max(panelBlur, 8))} !important;
          border-radius: 10px !important;
        }
        .tlr-search-wrap {
          border-radius: 8px !important;
        }
      `;

      const titleBarChromeCSS = hideDesktopTitleBar
        ? `
        .title-bar {
          visibility: hidden;
          overflow: hidden;
          height: 0px;
          padding: 0;
          border: none;
          min-height: 0;
        }
        .app-chrome-panels {
          grid-template-rows: 14px minmax(0px, 1fr) 30px !important;
        }
      `
        : "";

      // Remove previous injected CSS and replace — injectCSS persists across navigation
      if (this._injectedCssHandle) {
        try { this._injectedCssHandle.remove(); } catch(e) {}
      }
      this._injectedCssHandle = this.ui.injectCSS(css + titleBarChromeCSS);
    }

    async createAndNavigateToNewPanel() {
      this.ui.registerCustomPanelType("theme-architect", (panel) => {
        const element = panel.getElement();
        if (element === null) return;
        element.innerHTML = HTML_LAYOUT;
        this.hydrateThemeFromStorage();
        this._applyPersistedTransparencyCSS();
        this.setupThemeLogic(element);
        this.setupBgLogic(element);
      });
      const newPanel = await this.ui.createPanel();
      if (newPanel) {
        newPanel.setTitle("Theme Architect");
        newPanel.navigateToCustomType("theme-architect");
      }
    }

    // ─── Contrast badge ───────────────────────────────────────────────────────
    updateContrastUI(container) {
      const badge = container.querySelector("#contrast-badge");
      const bgInput = container.querySelector('[data-var="--color-bg-700"]');
      const txtInput = container.querySelector('[data-var="--color-text-100"]');
      if (!badge || !bgInput || !txtInput) return;
      const l1 = this.Helpers.getLuminance(bgInput.value);
      const l2 = this.Helpers.getLuminance(txtInput.value);
      const ratioObject = this.Helpers.calculateContrastRatio(l1, l2);
      badge.textContent = `CONTRAST: ${ratioObject.ratio.toFixed(1)}:1 ${ratioObject.pass ? "\u2705" : "\u274C"}`;
      badge.style.background = ratioObject.pass ? "#a6e3a1" : "#f38ba8";
      badge.style.color = "#11111b";
    }

    // ─── Theme color logic (original) ─────────────────────────────────────────
    setupThemeLogic(container) {
      const themeForm = container.querySelector("#theme-form");
      const inputs = container.querySelectorAll('input[type="color"]');
      const copyBtn = container.querySelector("#copy-css");
      const randomizeBtn = container.querySelector("#randomize-theme");
      const presetSelect = container.querySelector("#theme-preset");
      const resetAllBtn = container.querySelector("#reset-all");

      // ── Reset All ──────────────────────────────────────────────────────────
      if (resetAllBtn) {
        resetAllBtn.addEventListener("click", () => {
          if (!confirm("Reset ALL Theme Architect settings?\n\nThis clears your saved theme colours, background image, and all transparency settings. The page will reload.")) return;
          // Clear storage
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEY_BG);
          try { localStorage.removeItem("theme-architect-painter"); } catch (e) {}
          this._taPathBFlush();
          // Remove injected CSS
          if (this._injectedCssHandle) {
            try { this._injectedCssHandle.remove(); } catch(e) {}
            this._injectedCssHandle = null;
          }
          // Clear background image from root
          document.documentElement.style.removeProperty("background-image");
          document.documentElement.style.removeProperty("background-size");
          document.documentElement.style.removeProperty("background-position");
          document.documentElement.style.removeProperty("background-repeat");
          document.documentElement.style.removeProperty("background-attachment");
          document.body.style.removeProperty("background");
          // Clear all CSS variables set by the plugin
          const allInputs = container.querySelectorAll('input[data-var]');
          allInputs.forEach(inp => {
            if (inp.dataset.var) document.documentElement.style.removeProperty(inp.dataset.var);
          });
          // Reload the panel
          container.innerHTML = "<div style='padding:20px;font-family:monospace;color:var(--color-text-100)'>✅ Reset complete. Close and reopen the Theme Architect panel to start fresh.</div>";
        });
      }

      // ── Export Theme ───────────────────────────────────────────────────────
      const exportBtn = container.querySelector("#export-theme");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          const bundle = {
            _version: 1,
            _exported: new Date().toISOString(),
            theme:       JSON.parse(localStorage.getItem(STORAGE_KEY)   || "null"),
            bg:          (() => {
              // Don't export full dataUrl (too large) — export url only
              try {
                const b = JSON.parse(localStorage.getItem(STORAGE_KEY_BG) || "null");
                if (b) { const out = {...b}; delete out.dataUrl; return out; }
              } catch(e) {}
              return null;
            })(),
            painter:     JSON.parse(localStorage.getItem("theme-architect-painter") || "[]"),
          };
          const name = (container.querySelector("#custom-theme-name")?.value?.trim() || "my-theme")
            .replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
          const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: "application/json"});
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${name}-theme-architect.json`;
          a.click();
          URL.revokeObjectURL(url);
          exportBtn.textContent = "✓ Exported!";
          setTimeout(() => exportBtn.textContent = "⬇ Export Theme", 1500);
        });
      }

      // ── Import Theme ───────────────────────────────────────────────────────
      const importBtn   = container.querySelector("#import-theme");
      const importInput = container.querySelector("#import-file-input");
      if (importBtn && importInput) {
        importBtn.addEventListener("click", () => importInput.click());
        importInput.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const bundle = JSON.parse(ev.target.result);
              if (!bundle || bundle._version !== 1) {
                alert("Invalid theme file — make sure it was exported from Theme Architect.");
                return;
              }
              if (!confirm(`Import theme "${file.name}"?\n\nThis will overwrite your current theme, transparency settings, and painter overrides.`)) return;

              if (bundle.theme)   localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle.theme));
              if (bundle.bg)      localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(bundle.bg));
              if (bundle.painter) localStorage.setItem("theme-architect-painter", JSON.stringify(bundle.painter));
              this._taPathBFlush();

              importBtn.textContent = "✓ Imported! Reloading…";
              importBtn.style.background = "var(--color-success, #2d9e5a)";
              importBtn.style.color = "white";

              // Re-render the panel with new data
              setTimeout(() => {
                container.innerHTML = "<div style='padding:20px;font-family:monospace;color:var(--color-text-100)'>✅ Theme imported. Close and reopen the Theme Architect panel to see changes.</div>";
                // Re-apply CSS from imported data
                if (bundle.theme) {
                  try {
                    const td = bundle.theme;
                    const vars = Object.entries(td).filter(([k]) => k.startsWith("--"));
                    vars.forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
                  } catch(err) {}
                }
              }, 800);
            } catch(err) {
              alert("Could not read theme file: " + err.message);
            }
            importInput.value = "";
          };
          reader.readAsText(file);
        });
      }

      const saved = localStorage.getItem(STORAGE_KEY);
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

      const presetOptionsMarkup = Object.keys(presetThemes)
        .map((key) => `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`)
        .join("");
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
            hex = this.Helpers.hslToHex(masterHue, 15, Math.random() * 10 + 5);
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
        this.saveCurrentThemeToStorage();
      });

      themeForm.addEventListener("input", (e) => {
        const target = e.target;
        const varName = target.dataset.var;
        if (varName) {
          this.applyThemeVariable(varName, target.value, container);
          this.updateContrastUI(container);
          this.saveCurrentThemeToStorage();
        }
      });

      copyBtn.addEventListener("click", () => {
        const themeName = container.querySelector("#custom-theme-name")?.value || "custom-theme";
        let css = `html[data-theme="basic-${themeName}"] {\n  color-scheme: dark;\n`;
        inputs.forEach((input) => {
          css += `  ${input.dataset.var}: ${input.value};\n`;
        });
        // Also bake transparency into the CSS export
        css += this.buildTransparencyCSS(container, themeName);
        css += `}`;
        navigator.clipboard.writeText(css).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = "\u2705 COPIED!";
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

    // ─── Background & Transparency logic (new) ────────────────────────────────
    setupBgLogic(container) {
      const bgData = this.loadBgData();

      // Restore saved state to inputs
      const urlInput = container.querySelector("#bg-image-url");
      const sizeSelect = container.querySelector("#bg-size");
      const posSelect = container.querySelector("#bg-position");
      const repeatSelect = container.querySelector("#bg-repeat");
      const cardsCheck = container.querySelector("#listitem-cards-enabled");

      if (urlInput && bgData.url) urlInput.value = bgData.url;
      if (sizeSelect && bgData.size) sizeSelect.value = bgData.size;
      if (posSelect && bgData.position) posSelect.value = bgData.position;
      if (repeatSelect && bgData.repeat) repeatSelect.value = bgData.repeat;
      if (cardsCheck) cardsCheck.checked = bgData.cardsEnabled === true;

      const hideTitleBarCheck = container.querySelector("#desktop-hide-titlebar");
      if (hideTitleBarCheck) hideTitleBarCheck.checked = bgData.hideDesktopTitleBar === true;

      // Restore sliders
      const sliders = [
        { id: "panel-opacity", key: "panelOpacity", unit: "" },
        { id: "cmdpal-opacity", key: "cmdpalOpacity", unit: "" },
        { id: "plugin-cards-opacity", key: "pluginCardsOpacity", unit: "" },
        { id: "panel-blur", key: "panelBlur", unit: "px" },
        { id: "sidebar-blur", key: "sidebarBlur", unit: "px" },
        { id: "listitem-card-opacity", key: "listitemCardOpacity", unit: "" },
        { id: "listitem-border-opacity", key: "listitemBorderOpacity", unit: "" },
      ];

      sliders.forEach(({ id, key, unit }) => {
        const el = container.querySelector(`#${id}`);
        const valEl = container.querySelector(`#${id}-val`);
        if (!el) return;
        if (bgData[key] !== undefined) {
          el.value = bgData[key];
          if (valEl) valEl.textContent = unit === "px" ? `${bgData[key]}px` : `${Math.round(bgData[key] * 100)}%`;
        }
        el.addEventListener("input", () => {
          const v = parseFloat(el.value);
          if (valEl) valEl.textContent = unit === "px" ? `${v}px` : `${Math.round(v * 100)}%`;
          this.applyAllTransparency(container);
        });
      });

      // Radius slider
      const radiusEl = container.querySelector("#listitem-radius");
      const radiusVal = container.querySelector("#listitem-radius-val");
      if (radiusEl) {
        if (bgData.listitemRadius !== undefined) {
          radiusEl.value = bgData.listitemRadius;
          if (radiusVal) radiusVal.textContent = `${bgData.listitemRadius}px`;
        }
        radiusEl.addEventListener("input", () => {
          if (radiusVal) radiusVal.textContent = `${radiusEl.value}px`;
          this.applyAllTransparency(container);
        });
      }

      // Cards toggle
      if (cardsCheck) {
        cardsCheck.addEventListener("change", () => {
          this.applyAllTransparency(container);
        });
      }

      if (hideTitleBarCheck) {
        hideTitleBarCheck.addEventListener("change", () => {
          this.applyAllTransparency(container);
        });
      }

      // File upload
      const fileInput = container.querySelector("#bg-image-upload");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            if (urlInput) urlInput.value = "";
            this._currentBgDataUrl = dataUrl;
            this.applyAllTransparency(container);
            this.updateBgPreview(container, dataUrl);
          };
          reader.readAsDataURL(file);
        });
      }

      // URL input
      if (urlInput) {
        urlInput.addEventListener("input", () => {
          this._currentBgDataUrl = null;
          this.applyAllTransparency(container);
          this.updateBgPreview(container, urlInput.value);
        });
      }

      // Size / position / repeat
      [sizeSelect, posSelect, repeatSelect].forEach((el) => {
        if (el) el.addEventListener("change", () => {
          this.applyAllTransparency(container);
        });
      });

      // Clear button
      const clearBtn = container.querySelector("#bg-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          this._currentBgDataUrl = null;
          if (urlInput) urlInput.value = "";
          const preview = container.querySelector("#bg-preview");
          if (preview) preview.style.display = "none";
          document.documentElement.style.removeProperty("--ta-bg-image");
          document.documentElement.style.removeProperty("background-image");
          document.body.style.removeProperty("background");
          document.body.style.removeProperty("background-image");
          this.applyAllTransparency(container);
        });
      }

      // Apply whatever was saved
      if (bgData.dataUrl) {
        this._currentBgDataUrl = bgData.dataUrl;
        this.updateBgPreview(container, bgData.dataUrl);
      } else if (bgData.url) {
        this.updateBgPreview(container, bgData.url);
      }
      this.applyAllTransparency(container);

      // ── Live Style Painter ──────────────────────────────────────────
      const painterPickBtn   = container.querySelector("#painter-pick");
      const painterClearAll  = container.querySelector("#painter-clear-all");
      const painterClasses   = container.querySelector("#painter-classes");
      const painterPropRow   = container.querySelector("#painter-prop-row");
      const painterColorRow  = container.querySelector("#painter-color-row");
      const painterTargetLbl = container.querySelector("#painter-target-label");
      const painterHex       = container.querySelector("#painter-color-hex");
      const painterText      = container.querySelector("#painter-color-text");
      const painterAlpha     = container.querySelector("#painter-alpha");
      const painterAlphaVal  = container.querySelector("#painter-alpha-val");
      const painterSwatch    = container.querySelector("#painter-preview-swatch");
      const painterApply     = container.querySelector("#painter-apply");
      const painterSavedList = container.querySelector("#painter-saved-list");
      const painterSavedItems= container.querySelector("#painter-saved-items");
      const painterPickLabel = container.querySelector("#painter-pick-label");
      const painterCustomRow = container.querySelector("#painter-custom-prop-row");
      const painterCustomProp= container.querySelector("#painter-custom-prop");
      const painterCustomVal = container.querySelector("#painter-custom-val");
      const painterColorCtrl = container.querySelector("#painter-color-controls");
      const debugOutput      = container.querySelector("#inspector-output");

      // Storage key for custom overrides
      const PAINTER_KEY = "theme-architect-painter";

      // State
      let painterSelectedClass = null;
      let painterSelectedProp  = null;
      let painterOverrides = (() => {
        try { return JSON.parse(localStorage.getItem(PAINTER_KEY) || "[]"); } catch(e) { return []; }
      })();
      let painterCssHandle = null;

      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return {r,g,b};
      };

      const rgbToHex = (r,g,b) => "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");

      const currentRgba = () => {
        const {r,g,b} = hexToRgb(painterHex.value || "#ffffff");
        const a = parseFloat(painterAlpha.value ?? 1);
        return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(2)})`;
      };

      const updateSwatch = () => {
        if (painterSwatch) painterSwatch.style.background = currentRgba();
        if (painterAlphaVal) painterAlphaVal.textContent = Math.round(parseFloat(painterAlpha.value||1)*100)+"%";
      };

      const buildPainterCSS = () => {
        return painterOverrides.map(o => `${o.selector} { ${o.prop}: ${o.value} !important; }`).join("\n");
      };

      const applyPainterCSS = () => {
        try { painterCssHandle?.remove?.(); } catch(e) {}
        const css = buildPainterCSS();
        if (css) painterCssHandle = this.ui.injectCSS(css);
      };

      const savePainterOverrides = () => {
        try { localStorage.setItem(PAINTER_KEY, JSON.stringify(painterOverrides)); } catch(e) {}
        this._taPathBFlush();
      };

      const renderSavedList = () => {
        if (!painterSavedItems || !painterSavedList) return;
        painterSavedItems.innerHTML = "";
        if (painterOverrides.length === 0) {
          painterSavedList.style.display = "none";
          return;
        }
        painterSavedList.style.display = "flex";
        painterOverrides.forEach((o, i) => {
          const row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:center;gap:6px;font-size:10px;padding:3px 6px;background:var(--color-bg-900);border-radius:4px;";

          const swatch = document.createElement("div");
          swatch.style.cssText = `width:12px;height:12px;border-radius:3px;border:1px solid rgba(255,255,255,0.15);background:${o.value};flex-shrink:0;`;

          const label = document.createElement("span");
          label.style.cssText = "flex:1;color:var(--color-text-300);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
          label.textContent = `.${o.selector.replace(/^\./,"")} → ${o.prop}: ${o.value}`;

          const del = document.createElement("button");
          del.textContent = "✕";
          del.style.cssText = "background:none;border:none;color:var(--color-text-600);cursor:pointer;font-size:10px;padding:0 2px;";
          del.addEventListener("click", () => {
            painterOverrides.splice(i, 1);
            savePainterOverrides();
            applyPainterCSS();
            renderSavedList();
          });

          row.appendChild(swatch);
          row.appendChild(label);
          row.appendChild(del);
          painterSavedItems.appendChild(row);
        });
      };

      // Apply saved overrides on load
      applyPainterCSS();
      renderSavedList();

      // Prop buttons
      container.querySelectorAll(".painter-prop-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          container.querySelectorAll(".painter-prop-btn").forEach(b => {
            b.style.background = "var(--color-bg-600)";
            b.style.borderColor = "var(--color-bg-400)";
            b.style.color = "var(--color-text-200)";
          });
          btn.style.background = "var(--color-primary-700)";
          btn.style.borderColor = "var(--color-primary-400)";
          btn.style.color = "white";

          painterSelectedProp = btn.dataset.prop;
          const isCustom = painterSelectedProp === "custom";
          if (painterCustomRow) painterCustomRow.style.display = isCustom ? "flex" : "none";
          if (painterColorCtrl) painterColorCtrl.style.display = isCustom ? "none" : "flex";
          if (painterColorRow) painterColorRow.style.display = "flex";
          updateSwatch();
        });
      });

      // Custom value apply
      if (painterCustomProp && painterCustomVal) {
        const applyCustom = () => {
          if (!painterSelectedClass) return;
          const prop = painterCustomProp.value.trim();
          const val = painterCustomVal.value.trim();
          if (!prop || !val) return;
          const selector = "." + painterSelectedClass;
          const existing = painterOverrides.findIndex(o => o.selector === selector && o.prop === prop);
          if (existing >= 0) painterOverrides[existing].value = val;
          else painterOverrides.push({ selector, prop, value: val });
          savePainterOverrides();
          applyPainterCSS();
          renderSavedList();
        };
        painterCustomVal.addEventListener("keydown", e => { if (e.key === "Enter") applyCustom(); });
      }

      // Color/alpha sync
      if (painterHex) painterHex.addEventListener("input", () => {
        if (painterText) painterText.value = painterHex.value;
        updateSwatch();
      });
      if (painterText) painterText.addEventListener("input", () => {
        const v = painterText.value.trim();
        if (/^#[0-9a-f]{6}$/i.test(v)) { if (painterHex) painterHex.value = v; }
        updateSwatch();
      });
      if (painterAlpha) painterAlpha.addEventListener("input", updateSwatch);

      // Apply button
      if (painterApply) painterApply.addEventListener("click", () => {
        if (!painterSelectedClass) return;
        if (painterSelectedProp === "custom") {
          if (!painterCustomProp || !painterCustomVal) return;
          const prop = painterCustomProp.value.trim();
          const val = painterCustomVal.value.trim();
          if (!prop || !val) return;
          const selector = "." + painterSelectedClass;
          const existing = painterOverrides.findIndex(o => o.selector === selector && o.prop === prop);
          if (existing >= 0) painterOverrides[existing].value = val;
          else painterOverrides.push({ selector, prop, value: val });
        } else {
          if (!painterSelectedProp) return;
          const selector = "." + painterSelectedClass;
          const value = currentRgba();
          const existing = painterOverrides.findIndex(o => o.selector === selector && o.prop === painterSelectedProp);
          if (existing >= 0) painterOverrides[existing].value = value;
          else painterOverrides.push({ selector, prop: painterSelectedProp, value });
        }
        savePainterOverrides();
        applyPainterCSS();
        renderSavedList();

        // Flash the button
        painterApply.textContent = "✓ Applied!";
        painterApply.style.background = "var(--color-success, #2d9e5a)";
        setTimeout(() => {
          painterApply.textContent = "Apply Live ✓";
          painterApply.style.background = "var(--color-primary-600)";
        }, 1200);
      });

      // Pick button
      if (painterPickBtn) painterPickBtn.addEventListener("click", () => {
        if (painterPickLabel) painterPickLabel.textContent = "Click anywhere...";
        painterPickBtn.style.borderColor = "var(--color-primary-400)";
        painterPickBtn.style.background = "var(--color-primary-800)";

        const onPick = (e) => {
          if (container.contains(e.target)) {
            document.removeEventListener("click", onPick, true);
            if (painterPickLabel) painterPickLabel.textContent = "Pick Element";
            painterPickBtn.style.borderColor = "";
            painterPickBtn.style.background = "";
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          document.removeEventListener("click", onPick, true);
          if (painterPickLabel) painterPickLabel.textContent = "Pick Element";
          painterPickBtn.style.borderColor = "";
          painterPickBtn.style.background = "";

          const el = e.target;
          // Collect all unique classes from element + 5 ancestors
          const allClasses = [];
          const seen = new Set();
          let node = el;
          for (let i = 0; i < 6 && node && node !== document.body; i++) {
            Array.from(node.classList).forEach(c => {
              if (!seen.has(c) && c.length > 1 && !/^(focused|has-focus|is-target|animate|VC_)/.test(c)) {
                seen.add(c);
                allClasses.push({ cls: c, depth: i });
              }
            });
            node = node.parentElement;
          }

          // Show class chips
          if (painterClasses) {
            painterClasses.innerHTML = "";
            painterClasses.style.display = "flex";
            allClasses.forEach(({ cls, depth }) => {
              const chip = document.createElement("button");
              chip.textContent = "." + cls;
              chip.style.cssText = `padding:3px 8px;border-radius:999px;font-size:10px;font-family:monospace;cursor:pointer;border:1px solid var(--color-bg-400);background:${depth===0?"var(--color-bg-500)":"var(--color-bg-700)"};color:${depth===0?"var(--color-text-100)":"var(--color-text-400)"};white-space:nowrap;`;
              chip.addEventListener("click", () => {
                // Highlight selected chip
                painterClasses.querySelectorAll("button").forEach(b => {
                  b.style.background = "var(--color-bg-700)";
                  b.style.borderColor = "var(--color-bg-400)";
                  b.style.color = "var(--color-text-400)";
                });
                chip.style.background = "var(--color-primary-700)";
                chip.style.borderColor = "var(--color-primary-400)";
                chip.style.color = "white";

                painterSelectedClass = cls;
                painterSelectedProp = null;
                if (painterTargetLbl) painterTargetLbl.textContent = "." + cls;
                if (painterPropRow) painterPropRow.style.display = "flex";
                if (painterColorRow) painterColorRow.style.display = "none";

                // Reset prop buttons
                container.querySelectorAll(".painter-prop-btn").forEach(b => {
                  b.style.background = "var(--color-bg-600)";
                  b.style.borderColor = "var(--color-bg-400)";
                  b.style.color = "var(--color-text-200)";
                });

                // Try to read current computed color of that element
                try {
                  const computed = window.getComputedStyle(el);
                  const bg = computed.backgroundColor;
                  const col = computed.color;
                  const match = bg && bg !== "rgba(0, 0, 0, 0)" ? bg : col;
                  if (match) {
                    const m = match.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                    if (m) {
                      const hex = rgbToHex(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]));
                      if (painterHex) painterHex.value = hex;
                      if (painterText) painterText.value = hex;
                      if (painterAlpha) painterAlpha.value = m[4] !== undefined ? parseFloat(m[4]) : 1;
                      updateSwatch();
                    }
                  }
                } catch(e) {}
              });
              painterClasses.appendChild(chip);
            });
          }

          // Also update debug output
          if (debugOutput) {
            const tag = el.tagName.toLowerCase();
            const classes = Array.from(el.classList).join("  ");
            let ancestry = `ELEMENT: <${tag}>\nCLASSES: ${classes||"(none)"}\n`;
            let n = el.parentElement;
            for (let i=0;i<6&&n&&n!==document.body;i++) {
              ancestry += `\n↑ <${n.tagName.toLowerCase()}>\n  ${Array.from(n.classList).join("  ")||"(no classes)"}`;
              n = n.parentElement;
            }
            debugOutput.textContent = ancestry;
          }
        };
        document.addEventListener("click", onPick, true);
      });

      // Clear all painter state
      if (painterClearAll) painterClearAll.addEventListener("click", () => {
        painterSelectedClass = null;
        painterSelectedProp = null;
        if (painterClasses) { painterClasses.innerHTML = ""; painterClasses.style.display = "none"; }
        if (painterPropRow) painterPropRow.style.display = "none";
        if (painterColorRow) painterColorRow.style.display = "none";
        if (debugOutput) { debugOutput.textContent = ""; }
      });
    }

    updateBgPreview(container, src) {
      const preview = container.querySelector("#bg-preview");
      if (!preview || !src) return;
      preview.style.backgroundImage = `url("${src}")`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
      preview.style.display = "block";
    }

    applyAllTransparency(container) {
      const get = (id) => {
        const el = container?.querySelector?.(`#${id}`);
        return el ? parseFloat(el.value) : null;
      };
      const getStr = (id) => {
        const el = container?.querySelector?.(`#${id}`);
        return el ? el.value : null;
      };
      const getBool = (id) => {
        const el = container?.querySelector?.(`#${id}`);
        return el ? el.checked : false;
      };

      const panelOpacity   = get("panel-opacity")   ?? 0.85;
      const sidebarOpacity = panelOpacity;  // master slider
      const cmdpalOpacity  = get("cmdpal-opacity")   ?? 0.92;
      const pluginCardsOpacity = get("plugin-cards-opacity") ?? 0.24;
      const cardsOpacity   = panelOpacity;
      const inputOpacity   = panelOpacity;
      const modalOpacity   = panelOpacity;
      const panelBlur      = get("panel-blur")       ?? 0;
      const sidebarBlur    = get("sidebar-blur")     ?? 0;
      const cardBlur       = 0;
      const listitemBlur   = 0;
      const listitemCardOpacity   = get("listitem-card-opacity")   ?? 0.45;
      const listitemBorderOpacity = get("listitem-border-opacity") ?? 0.08;
      const listitemRadius = get("listitem-radius")  ?? 6;
      const cardsEnabled   = getBool("listitem-cards-enabled");
      const hideDesktopTitleBar = getBool("desktop-hide-titlebar");

      // Background image — injected directly into each surface via CSS
      // so it shows through regardless of Thymer's own body/html background
      const url       = this._currentBgDataUrl || getStr("bg-image-url") || "";
      const size      = getStr("bg-size")     || "cover";
      const position  = getStr("bg-position") || "center";
      const repeat    = getStr("bg-repeat")   || "no-repeat";

      const root = document.documentElement;
      const bgImageCSS = url
        ? `url("${url}") ${repeat} ${position} / ${size} fixed`
        : "";

      // Keep html/body clear of background — it lives in body::before via injectCSS
      root.style.removeProperty("background-image");
      root.style.removeProperty("background-size");
      root.style.removeProperty("background-position");
      root.style.removeProperty("background-repeat");
      root.style.removeProperty("background-attachment");
      document.body.style.removeProperty("background");
      document.body.style.background = "transparent";

      // Helper to get the base color from a CSS var (we read it from the root)
      const getBaseRgb = (varName, fallback) => {
        const hex = root.style.getPropertyValue(varName).trim() ||
                    getComputedStyle(root).getPropertyValue(varName).trim() ||
                    fallback;
        const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (!m) return `0,0,0`;
        return `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}`;
      };

      // Save current slider values directly (already read from container above)
      const dataToSave = {
        url:                   getStr("bg-image-url") || "",
        dataUrl:               this._currentBgDataUrl || this.loadBgData().dataUrl || "",
        size, position, repeat,
        cardsEnabled,
        panelOpacity, sidebarOpacity, cmdpalOpacity, pluginCardsOpacity, cardsOpacity,

        modalOpacity, panelBlur, sidebarBlur, cardBlur, listitemBlur,
        listitemCardOpacity, listitemBorderOpacity, listitemRadius,
        hideDesktopTitleBar,
      };
      try {
        localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(dataToSave));
      } catch(e) {
        const d2 = { ...dataToSave, dataUrl: "" };
        try { localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(d2)); } catch(e2) {}
      }
      this._taPathBFlush();

      // Re-apply via injectCSS (persists across navigation)
      this._applyPersistedTransparencyCSS();
    }

    buildTransparencyCSS(container, themeName) {
      // Returns transparency-related CSS to append to the copy export
      // This is a best-effort export — the dynamic injection works better live
      return `\n  /* Transparency — set live via Theme Architect */\n`;
    }

    // ─── Persistence ──────────────────────────────────────────────────────────
    applyThemeVariable(varName, hex, container) {
      document.documentElement.style.setProperty(varName, hex);
      if (varName === "--color-bg-500")
        document.documentElement.style.setProperty("--color-bg-500-50", this.Helpers.hexToRgba(hex, 0.5));
      if (varName === "--color-primary-400") {
        document.documentElement.style.setProperty("--selection-bg", this.Helpers.hexToRgba(hex, 0.35));
        document.documentElement.style.setProperty("--color-primary-400-70", this.Helpers.hexToRgba(hex, 0.7));
      }
      const input = container.querySelector(`input[data-var="${varName}"]`);
      if (input) input.value = hex;
    }

    saveCurrentThemeToStorage() {
      const themeData = {};
      const inputs = document.querySelectorAll('#theme-form input[type="color"]');
      if (inputs.length > 0) {
        inputs.forEach((input) => {
          if (input.dataset.var) themeData[input.dataset.var] = input.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(themeData));
        this._taPathBFlush();
      }
    }

    hydrateThemeFromStorage() {
      const saved = localStorage.getItem(STORAGE_KEY);
      let themeData;
      if (saved) {
        try { themeData = JSON.parse(saved); } catch (e) {}
      }
      if (!themeData) {
        const firstPresetKey = Object.keys(presetThemes)[0];
        themeData = presetThemes[firstPresetKey];
      }
      if (themeData) {
        Object.entries(themeData).forEach(([varName, hex]) => {
          document.documentElement.style.setProperty(varName, hex);
        });
      }
    }

    loadBgData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_BG);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {};
    }

    saveBgToStorage() {
      // Merge slider values with existing stored data — only update keys where slider actually exists
      const existing = this.loadBgData();
      const get = (id, fallback) => {
        const el = document.querySelector(`#${id}`);
        return el ? (el.type === "checkbox" ? el.checked : el.value) : null;
      };
      const getFloat = (id, fallback) => {
        const v = get(id);
        return v !== null ? parseFloat(v) : fallback;
      };
      const data = {
        url:                   get("bg-image-url") ?? existing.url ?? "",
        dataUrl:               this._currentBgDataUrl || existing.dataUrl || "",
        size:                  get("bg-size") ?? existing.size ?? "cover",
        position:              get("bg-position") ?? existing.position ?? "center",
        repeat:                get("bg-repeat") ?? existing.repeat ?? "no-repeat",
        cardsEnabled:          get("listitem-cards-enabled") ?? existing.cardsEnabled ?? false,
        panelOpacity:          getFloat("panel-opacity", existing.panelOpacity ?? 0.85),
        cmdpalOpacity:         getFloat("cmdpal-opacity", existing.cmdpalOpacity ?? 0.92),
        pluginCardsOpacity:    getFloat("plugin-cards-opacity", existing.pluginCardsOpacity ?? 0.24),
        panelBlur:             getFloat("panel-blur", existing.panelBlur ?? 0),
        sidebarBlur:           getFloat("sidebar-blur", existing.sidebarBlur ?? 0),
        cardBlur:              0,
        listitemBlur:          0,
        listitemCardOpacity:   getFloat("listitem-card-opacity", existing.listitemCardOpacity ?? 0.45),
        listitemBorderOpacity: getFloat("listitem-border-opacity", existing.listitemBorderOpacity ?? 0.08),
        listitemRadius:        getFloat("listitem-radius", existing.listitemRadius ?? 6),
        hideDesktopTitleBar:   get("desktop-hide-titlebar") ?? existing.hideDesktopTitleBar ?? false,
      };
      try {
        localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(data));
      } catch (e) {
        const dataWithoutImage = { ...data, dataUrl: "" };
        try { localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(dataWithoutImage)); } catch (e2) {}
      }
      this._taPathBFlush();
    }
  };

  return __toCommonJS(plugin_exports);
})();