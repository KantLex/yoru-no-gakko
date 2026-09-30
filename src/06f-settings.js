
// ───────────────────────── settings: brightness, volumes, text size, controls, subtitles ─────────────────────────
const SETTINGS_KEY = 'yoru-no-gakko-settings-1';
const SETTINGS = { bright: 0, music: 8, sound: 8, voice: 9, text: 1, controls: 'tank', lang: 'en' };
const TEXT_SIZES = [0.9, 1, 1.15, 1.3];
const BRIGHT_GAMMA = [1.25, 1.12, 1, 0.88, 0.76], BRIGHT_GAIN = [0.9, 0.95, 1, 1.06, 1.12];
const SET_ROWS = [
  { k: 'bright', label: '明るさ · Brightness', min: -2, max: 2, meter: true },
  { k: 'music', label: '音楽 · Music', min: 0, max: 10 },
  { k: 'sound', label: '効果音 · Sound', min: 0, max: 10 },
  { k: 'voice', label: '声 · Voice', min: 0, max: 10 },
  { k: 'text', label: '文字の大きさ · Text size', opts: [[0, '小 · Small'], [1, '中 · Normal'], [2, '大 · Large'], [3, '特大 · Larger']] },
  { k: 'controls', label: '操作 · Controls', opts: [['tank', 'クラシック · Tank (classic)'], ['modern', 'モダン · Modern (camera-relative)']] },
  { k: 'lang', label: '字幕 · Subtitles', raw: true, opts: [['en', 'English'], ['zh-Hans', '简体中文'], ['zh-Hant', '繁體中文'], ['ja', '日本語']] },
];

function loadSettings() {
  SETTINGS.controls = isTouch ? 'modern' : 'tank';
  SETTINGS.lang = langFromNavigator();
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null'); } catch (_) {}
  if (s && typeof s === 'object') for (const r of SET_ROWS) {
    const v = s[r.k];
    if (r.opts ? r.opts.some(([o]) => o === v) : Number.isInteger(v) && v >= r.min && v <= r.max) SETTINGS[r.k] = v;
  }
  applySettings();
}
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (_) {} }
function applySettings() {
  const S = SETTINGS;
  audio.setVolume('music', S.music / 10); audio.setVolume('sound', S.sound / 10); audio.setVolume('voice', S.voice / 10);
  post.uniforms.gamma.value = BRIGHT_GAMMA[S.bright + 2]; post.uniforms.bright.value = BRIGHT_GAIN[S.bright + 2];
  document.documentElement.style.setProperty('--ts', TEXT_SIZES[S.text]);
  if (S.controls !== CONTROLS) setControlScheme(S.controls);
  if (S.lang !== LANG || document.documentElement.lang !== LANG) setLang(S.lang);
}
// step a row by d; wrap = cycle past the ends (interact), else numbers stop at their ends
function settingStep(r, d, wrap) {
  const S = SETTINGS, old = S[r.k];
  if (r.opts) { const i = r.opts.findIndex(([o]) => o === old), n = r.opts.length; S[r.k] = r.opts[(i + d + n) % n][0]; }
  else { let v = old + d; if (v > r.max) v = wrap ? r.min : r.max; if (v < r.min) v = wrap ? r.max : r.min; S[r.k] = v; }
  if (S[r.k] === old) return;
  saveSettings(); applySettings(); renderSettings();
  audio.play('kick');
}

// ── settings screen (over the title or the pause panel) ──
function openSettings(from) {
  const el = $('settings'), box = el.querySelector('.rows');
  if (!box.children.length) {
    SET_ROWS.forEach((r, i) => {
      const row = document.createElement('div'); row.className = 'row';
      row.innerHTML = `<span class="lbl" data-t="${r.label}"></span><button class="arr" data-d="-1">◀</button><span class="val"></span><button class="arr" data-d="1">▶</button>`;
      row.onclick = (e) => {   // ◀ ▶ step, the value cycles forward, the label just selects
        e.stopPropagation(); if (!G.settings) return; G.settings.sel = i;
        const d = +e.target.closest('[data-d]')?.dataset.d;
        if (d) settingStep(r, d); else if (e.target.closest('.val')) settingStep(r, 1, true); else renderSettings();
      };
      box.appendChild(row);
    });
    el.querySelector('.back').onclick = (e) => { e.stopPropagation(); closeSettings(); };
    applyStaticText();
  }
  G.settings = { sel: 0, from, menu: G.menu };
  G.menu = null;
  el.hidden = false;
  renderSettings();
}
function closeSettings() {
  const s = G.settings; if (!s) return;
  G.settings = null; $('settings').hidden = true;
  if (s.from === 'title' ? G.mode === 'title' : G.paused) G.menu = s.menu || null;   // back to the menu it came from, selection kept
}
function renderSettings() {
  const s = G.settings; if (!s) return;
  const el = $('settings'), rows = el.querySelectorAll('.row');
  SET_ROWS.forEach((r, i) => {
    const v = SETTINGS[r.k], row = rows[i], val = row.querySelector('.val');
    row.classList.toggle('sel', s.sel === i);
    if (r.opts) { const o = r.opts.find(([k]) => k === v); val.textContent = r.raw ? o[1] : tr(o[1]); }
    else {
      const n = r.max - r.min, on = v - r.min;
      val.innerHTML = `<span class="cells">${Array.from({ length: n + (r.meter ? 1 : 0) }, (_, k) => `<i class="${(r.meter ? k <= on : k < on) ? 'on' : ''}"></i>`).join('')}</span>` + (r.meter ? '' : `<b>${v}</b>`);
    }
    row.querySelector('[data-d="-1"]').style.visibility = !r.opts && v <= r.min ? 'hidden' : '';
    row.querySelector('[data-d="1"]').style.visibility = !r.opts && v >= r.max ? 'hidden' : '';
  });
  el.querySelector('.back').classList.toggle('sel', s.sel === SET_ROWS.length);
}
function settingsInput(hit) {
  const s = G.settings, n = SET_ROWS.length + 1, r = SET_ROWS[s.sel];
  if (hit('pause') || hit('back')) { closeSettings(); return; }
  if (hit('up')) { s.sel = (s.sel + n - 1) % n; renderSettings(); }
  else if (hit('down')) { s.sel = (s.sel + 1) % n; renderSettings(); }
  else if (r && hit('left')) settingStep(r, -1);
  else if (r && hit('right')) settingStep(r, 1);
  else if (hit('interact') || hit('attack')) { if (r) settingStep(r, 1, true); else closeSettings(); }
}
