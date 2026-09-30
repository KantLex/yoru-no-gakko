
// ───────────────────────── replay: cross-run records, the records screen, Nightmare pencils and class journals ─────────────────────────
const META_KEY = 'yoru-no-gakko-meta-1';
const DOC_ORDER = ['note7', 'shoenote', 'kuroda', 'dutylog', 'nurselog', 'yearbook', 'kokkurinote', 'oldlist', 'letter'];   // story order
const anyFlag = (re) => Object.keys(F).some((k) => F[k] && re.test(k));
// the seven mysteries as Yuki's notebook (note7) lists them; the seventh is the name the 1950 list gives back
const MYSTERIES = [
  ['トイレの花子さん', 'Toilet Hanako-san', () => F.hanako_awake],
  ['ひとりでに鳴るピアノ', 'The piano that plays by itself', () => F.ofuda],
  ['一段多い西階段', 'The west stairs with one step too many', () => F.step13],
  ['顔のない先生', 'The teacher with no face', () => F.noppera_awake],
  ['目を開ける提灯と傘', 'Lanterns and umbrellas that open their eyes', () => anyFlag(/^(awake|dead)_[LK]\d/)],
  ['塩で消える青い火の玉', 'Blue fireballs that go out with salt', () => anyFlag(/^(awake|dead)_W\d/)],
  ['白石小夜', 'Shiraishi Sayo', () => F.realname],
];
const ENDINGS = [['dawn', '夜明け', 'Dawn'], ['true', '四十二人目', 'The Forty-Second Face']];
const KANJI_NUM = '一二三四五六七';

let META = null;
function meta() {
  if (META) return META;
  let m = null;
  try { m = JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch (_) {}
  const o = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  m = o(m);
  return (META = { docs: o(m.docs), mysteries: o(m.mysteries), endings: o(m.endings), clears: o(m.clears), best: o(m.best) });
}
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(meta())); } catch (_) {} }
const metaAny = () => { const m = meta(); return [m.docs, m.mysteries, m.endings, m.clears].some((o) => Object.keys(o).length > 0); };
const docCount = () => DOC_ORDER.filter(has).length;
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
// merge what this run has found into the records (docs are never taken away, so has() is "found")
function syncMeta() {
  const m = meta(); let ch = false;
  for (const id of DOC_ORDER) if (has(id) && !m.docs[id]) { m.docs[id] = 1; ch = true; }
  MYSTERIES.forEach(([, , found], i) => { if (!m.mysteries[i + 1] && found()) { m.mysteries[i + 1] = 1; ch = true; } });
  if (ch) saveMeta();
}
function recordEnding(kind, secs) {
  syncMeta();
  const m = meta(), d = F.hard ? 'nightmare' : 'normal';
  m.endings[kind] = 1; m.clears[d] = (m.clears[d] || 0) + 1;
  if (!(m.best[d] <= secs)) m.best[d] = secs;
  saveMeta();
}

// ── records screen (over the title or the pause panel; input like settings) ──
function openRecords(from) {
  syncMeta();
  G.records = { from, menu: G.menu };
  G.menu = null;
  $('records').hidden = false;
  renderRecords();
  $('records').querySelector('.body').scrollTop = 0;
  recordsMore();
}
// fade the bottom edge while there is more to scroll to
function recordsMore() { const b = $('records').querySelector('.body'); b.classList.toggle('more', b.scrollTop + b.clientHeight < b.scrollHeight - 2); }
$('records').querySelector('.body').addEventListener('scroll', recordsMore);
addEventListener('resize', () => { if (G.records) recordsMore(); });
function closeRecords() {
  const r = G.records; if (!r) return;
  G.records = null; $('records').hidden = true;
  if (r.from === 'title' ? G.mode === 'title' : G.paused) G.menu = r.menu || null;
}
function renderRecords() {
  const m = meta(), q = '<span class="q">？？？</span>';
  const li = (n, ok, jp, en) => `<li class="${ok ? 'on' : ''}"><i>${n}</i>${ok ? `<b>${esc(jp)}</b><span class="en">${esc(tr(en))}</span>` : q}</li>`;
  const nd = DOC_ORDER.filter((id) => m.docs[id]).length;
  const best = (d) => (m.best[d] >= 0 ? mmss(m.best[d]) : '—');
  $('records').querySelector('.body').innerHTML =
    `<div><h3>${esc(tr('七不思議 · SEVEN MYSTERIES'))}</h3><ol>${MYSTERIES.map(([jp, en], i) => li(KANJI_NUM[i], m.mysteries[i + 1], jp, en)).join('')}</ol>
      <h3>${esc(tr('結末 · ENDINGS'))}</h3><ol>${ENDINGS.map(([k, jp, en], i) => li(i + 1, m.endings[k], jp, en)).join('')}</ol>
      <div class="stats"><span>${esc(tr('悪夢クリア · Nightmare cleared'))}</span><b>${m.clears.nightmare ? '✓' : '—'}</b>
        <span>${esc(tr('最速 通常 · Best time, Normal'))}</span><b>${best('normal')}</b><span>${esc(tr('最速 悪夢 · Best time, Nightmare'))}</span><b>${best('nightmare')}</b></div></div>
    <div><h3>${esc(tr('資料 · DOCUMENTS'))} <span class="n">${nd}/${DOC_ORDER.length}</span></h3><ol>${DOC_ORDER.map((id, i) => li(i + 1, m.docs[id], ITEMS[id].jp, ITEMS[id].en)).join('')}</ol></div>`;
  recordsMore();
}
function recordsInput(hit) {
  const b = $('records').querySelector('.body');
  if (hit('pause') || hit('back') || hit('interact') || hit('attack')) { closeRecords(); return; }
  if (hit('up')) b.scrollTop -= b.clientHeight * 0.3;
  if (hit('down')) b.scrollTop += b.clientHeight * 0.3;
}
$('records').querySelector('.back').onclick = (e) => { e.stopPropagation(); closeRecords(); };

// the pause panel's line: this run's documents, and the difficulty
function pauseInfo() {
  $('pause').querySelector('.pinfo').innerHTML = `${esc(tr('資料 · Documents'))} <b>${docCount()}/${DOC_ORDER.length}</b>` +
    (F.hard ? `<span class="hard">${esc(tr('悪夢 · Nightmare'))}</span>` : '');
}

// ── Nightmare: pencils, and class journals (学級日誌) on teachers' desks that save where you stand ──
async function hardPencil(tag, text = 'There is a pencil stub here too. You take it.') {
  if (!F.hard || F['pencil_' + tag]) return;
  F['pencil_' + tag] = 1;
  await say(text);
  give('pencil');
}
function journalDesk(R, bx, by, bz, sx, sz, ry = 0, r = 0.6) {   // book on the desk top at (bx, by, bz); the spot at (sx, sz), clear of the desk's own spot
  const g = new THREE.Group(); g.position.set(bx, by, bz); g.rotation.y = ry;
  const cover = new THREE.Mesh(B(0.22, 0.03, 0.3), mat(0x9a3a2c)); cover.position.y = 0.015; g.add(cover);
  const label = new THREE.Mesh(B(0.11, 0.004, 0.05), M.paper); label.position.set(0, 0.031, -0.07); g.add(label);
  g.visible = false; R.scene.add(g); R.journal = g;
  R.spot({ id: 'journal', x: sx, z: sz, r, label: '学級日誌 · Class journal', when: () => F.hard, use: useJournal });
}
async function useJournal() {
  if (!has('pencil')) return say('You need a pencil to write in the journal.');
  const c = await ask('Write in the class journal? It uses a pencil.', ['Write', 'Leave it'], 1);   // 'Leave it' first: a mashed E never spends a pencil
  if (c !== 0) return;
  take('pencil'); manualSave(); audio.play('pickup');
  toast(tr('学級日誌 · Progress saved'));
  await say('You write the date and your name in the journal.');
}
