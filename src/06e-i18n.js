
// ───────────────────────── i18n: English-keyed lookup into ZH (06g) and JA (06j), applied at display time ─────────────────────────
// LANG: 'en' | 'zh-Hans' | 'zh-Hant' | 'ja'. The Japanese half of every line stays Japanese; only the English half is translated.
// In 'ja' an English gloss of Japanese already on screen translates to '' (hidden), so nothing is shown twice.
let LANG = 'en';
const trMissing = new Set(), trDone = new Set();   // keys with no translation; strings already produced by tr/trf (never re-looked-up)
function tr(s) {
  if (LANG === 'en' || typeof s !== 'string' || !/[A-Za-z]/.test(s) || trDone.has(s)) return s;   // no Latin letters: pure JP (or already Chinese)
  let t;
  if (LANG === 'ja') t = JA[s];
  else { const e = ZH[s]; t = e && ((LANG === 'zh-Hant' ? e[1] : e[0]) || e[0]); }
  if (t == null || (!t && LANG !== 'ja')) { trMissing.add(s); return s; }
  trDone.add(t);
  return t;
}
// translate a template key, then fill {name} placeholders (values are inserted as given)
const trfSrc = new Map();   // trf output → [key, vars], so an open dialog showing it can be re-translated
function trf(key, vars = {}) {
  const t = tr(key).replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));
  if (LANG !== 'en') trDone.add(t);
  trfSrc.set(t, [key, vars]);
  return t;
}
// typewriter speed (chars/s) from the text itself: Chinese and Japanese carry more per glyph than English
function textRate(t) {
  const han = (t.match(/[\u3400-\u9fff]/g) || []).length, kana = (t.match(/[\u3040-\u30ff]/g) || []).length, latin = (t.match(/[A-Za-z]/g) || []).length;
  if (han + kana <= latin) return 48;
  return kana ? 26 : 22;
}
// a dialog's text: src is an English key, or a function (trf templates) re-run on a language change
const dlgText = (src) => (typeof src === 'function' ? src() : trfSrc.has(src) ? trf(...trfSrc.get(src)) : tr(src));
function langFromNavigator() {
  const l = String(navigator.language || 'en');
  if (/^ja\b/i.test(l)) return 'ja';
  if (!/^zh\b/i.test(l)) return 'en';
  return /^zh-(TW|HK|MO)\b|Hant/i.test(l) ? 'zh-Hant' : 'zh-Hans';
}
function applyStaticText() { document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = tr(el.dataset.t); }); }
function setLang(l) {
  LANG = l === 'zh-Hans' || l === 'zh-Hant' || l === 'ja' ? l : 'en';
  document.documentElement.lang = LANG;
  applyStaticText();
  updateHUD();
  onInputChange();                                 // title pad hint, examine prompt
  // re-render whatever is open
  const d = G.dialog;
  if (d) { const done = d.shown >= d.text.length; d.text = dlgText(d.src); d.rate = textRate(d.text); d.o.sub = tr(d.subSrc); d.shown = done ? d.text.length : Math.min(d.shown, d.text.length); renderDialog(); }
  if (G.invOpen) renderInv();
  if (G.docOpen) renderDoc();
  if (G.mapOpen) openMap();
  if (G.settings) renderSettings();
  if (G.records) renderRecords();
  if (G.paused) pauseInfo();
}
