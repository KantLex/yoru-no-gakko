
// ───────────────────────── state, items, documents, UI ─────────────────────────
const ITEMS = {
  hands: { k: '手', jp: '素手', en: 'Bare hands', weapon: true, desc: 'A front kick from kendo footwork. It barely troubles a spirit, but it is better than nothing.' },
  shinai: { k: '竹', jp: '竹刀', en: 'Shinai', weapon: true, desc: 'Your bamboo kendo sword. Hard enough to knock a haunted object senseless, but it passes straight through true spirits.' },
  salt: { k: '塩', jp: '清めの塩', en: 'Purifying salt', weapon: true, count: true, desc: 'Salt from a morijio pile. Thrown at a spirit it burns: blue flames go out, and stronger ghosts are stunned for a few seconds. Each throw uses one handful.' },
  ofuda: { k: '札', jp: 'お札', en: 'Ofuda', weapon: true, desc: 'A shrine talisman in vermilion ink, peeled from the piano. Hold it up to a spirit at close range. Mr. Kuroda wrote that only this can send "the girl" home.' },
  onigiri: { k: '飯', jp: 'おにぎり', en: 'Onigiri', heal: 35, desc: 'A rice ball with a pickled plum inside, left over from lunch. Restores some strength.' },
  ramune: { k: '泡', jp: 'ラムネ', en: 'Ramune', heal: 25, desc: 'Ice-cold marble soda from the vending machine. Restores a little strength.' },
  firstaid: { k: '薬', jp: '救急箱', en: 'First-aid kit', heal: 100, desc: 'Bandages, disinfectant, and a roll of tape. Restores all strength.' },
  staffkey: { k: '鍵', jp: '職員室の鍵', en: 'Staff room key', desc: 'A small brass key on a red tag that reads 「職員室」. It opens the staff room on the ground floor.' },
  entrancekey: { k: '錠', jp: '昇降口の鍵', en: 'Entrance key', desc: 'A heavy iron key for the padlock on the main doors.' },
  bandage: { k: '包', jp: '包帯', en: 'Bandage', heal: 20, desc: 'A roll of bandage from the infirmary. Restores a little strength.' },
  painkiller: { k: '痛', jp: '痛み止め', en: 'Painkillers', heal: 45, desc: 'A strip of painkillers. Restores a good deal of strength.' },
  handbook: { k: '図', jp: '生徒手帳', en: 'Student handbook', map: true, desc: 'Your student handbook. The rules nobody follows, and a floor map of the school in the back. (M)' },
  sciencekey: { k: '鍵', jp: '理科室の鍵', en: 'Science lab key', desc: 'A spare key from the nurse\'s desk, on a tag marked 理科室.' },
  gymkey: { k: '鍵', jp: '体育館の鍵', en: 'Gym key', desc: 'A key on a loop of red string, taken from the skeleton\'s fingers. Tagged 体育館.' },
  shutterkey: { k: '鍵', jp: 'シャッターの鍵', en: 'Fire shutter key', desc: 'A small steel key stamped 防火シャッター 東階段: the fire shutter over the east stairs, 2F.' },
  roofkey: { k: '鍵', jp: '屋上の鍵', en: 'Rooftop key', desc: 'A key tagged 屋上, with a child\'s red hair ribbon tied through the ring.' },
  nurselog: { k: '録', jp: '保健室日誌', en: 'Infirmary record, 1950', doc: 'nurselog', desc: 'The school nurse\'s record book from 1950.' },
  yearbook: { k: '写', jp: '学級写真帳', en: 'Class photographs, 1950', doc: 'yearbook', desc: 'Class 2-A, 1950. One face scratched out.' },
  kokkurinote: { k: '狐', jp: 'こっくりさんの答え', en: 'Kokkuri-san\'s answers', doc: 'kokkurinote', desc: 'What the coin spelled out, copied into your handbook.' },
  oldlist: { k: '古', jp: '昭和の七不思議', en: 'The 1950 list', doc: 'oldlist', desc: 'The original seven mysteries, written by children in 1950.' },
  letter: { k: '書', jp: '黒田の手紙', en: 'Kuroda\'s letter', doc: 'letter', desc: 'A letter to the Shiraishi family, sealed and never sent.' },
  note7: { k: '帳', jp: '七不思議', en: 'The Seven Mysteries', doc: 'note7', desc: 'Yuki\'s notebook of school ghost stories.' },
  kuroda: { k: '譜', jp: '黒田先生のメモ', en: 'Mr. Kuroda\'s note', doc: 'kuroda', desc: 'A warning scrawled on staff paper by the music teacher.' },
  dutylog: { k: '誌', jp: '宿直日誌', en: 'Night-duty log', doc: 'dutylog', desc: 'The log kept by the teacher on night duty.' },
  shoenote: { k: '紙', jp: '下駄箱の手紙', en: 'Note in your shoe', doc: 'shoenote', desc: 'A note someone left in your outdoor shoe.' },
};
const WEAPON_ORDER = ['hands', 'shinai', 'salt', 'ofuda'];

const DOCS = {
  note7: { title: '青嵐高校の七不思議', pages: [
    [['一、二階の女子トイレ、三番目の個室。三回ノックして「花子さん、遊びましょ」と言うと、返事がある。', '1. Second-floor girls\' lavatory, third stall. Knock three times, say "Hanako-san, let\'s play," and someone answers.'],
      ['二、音楽室のピアノは、真夜中にひとりでに鳴る。昔、黒田先生がお札で封じたらしい。', '2. At midnight the music-room piano plays by itself. They say Mr. Kuroda sealed it with an ofuda.'],
      ['三、西階段は、夜になると一段増える。', '3. At night, the west stairs have one step too many.']],
    [['四、職員室には、顔のない先生がいる。', '4. In the staff room there is a teacher with no face.'],
      ['五、文化祭の提灯と、忘れ物の傘は、夜になると目を開ける。', '5. The festival lanterns and the lost-property umbrellas open their eyes at night.'],
      ['六、廊下の青い火の玉は、塩をまくと消える。', '6. The blue fireballs in the corridor go out if you throw salt at them.'],
      ['七、七つ目を知った人は、', '7. Whoever learns the seventh mystery'],
      ['（ここから先は破り取られている）', '(the rest of the page has been torn out)', 'torn']],
  ] },
  kuroda: { title: '黒田先生のメモ', pages: [[
    ['誰かがこれを読んでいるなら。', 'If anyone is reading this:'],
    ['ピアノの封印を、決して剥がしてはいけない。', 'Never remove the seal from the piano.'],
    ['戸口には盛り塩を置いた。火の玉には塩が効く。', 'I have set salt at the doorways. Salt works on the fireballs.'],
    ['だが、あの子には、塩は足止めにしかならない。', 'But against that girl, salt will only hold her back for a moment.'],
    ['あの子を帰せるのは、お札だけだ。近づいて、まっすぐ掲げること。', 'Only the ofuda can send her home. Get close, and hold it up straight at her.'],
    ['— 黒田', '— Kuroda'],
  ]] },
  dutylog: { title: '宿直日誌', pages: [[
    ['十月十三日（金）　宿直　黒田', 'Friday, October 13th. Night duty: Kuroda.'],
    ['午前一時。また廊下で子供の歌が聞こえる。', '1:00 a.m. The children\'s song in the corridor again.'],
    ['午前一時四十分。体育館の方から、ノックの音。風だ。風に決まっている。', '1:40. Knocking, from the direction of the gym. The wind. It must be the wind.'],
    ['午前一時半。日直の欄に「花子」と書かれていた。私は書いていない。', '1:30. Someone has written "Hanako" in the day-duty column. I did not write it.'],
    ['午前二時。職員室の鍵は日直が持っている、と誰かが耳元で言った。', '2:00. Someone whispered in my ear that the day-duty student has the staff room key.'],
    ['午前二時十三分。鏡を見た。', '2:13. I looked in the mirror.'],
    ['顔が、ない。', 'I have no face.', 'torn'],
  ]] },
  nurselog: { title: '保健室日誌　昭和二十五年', pages: [[
    ['十月二日　二年Ａ組　白石。両腕にあざ。「転んだ」と言う。', 'Oct 2. Shiraishi, 2-A. Bruises on both arms. She says she fell.'],
    ['十月六日　白石、また来る。「転んだ」と書いておく。', 'Oct 6. Shiraishi again. I write down "fell."'],
    ['十月十日　白石「みんなに、わたしが見えていないみたい」。気のせいよ、と答えた。', 'Oct 10. Shiraishi: "It\'s like nobody can see me." I told her she was imagining it.'],
    ['十月十六日　校長先生に言われ、「心臓の病気」と書いた。', 'Oct 16. On the principal\'s instruction, I wrote "heart condition."'],
    ['私は見ていた。見ないふりをした。', 'I saw. I pretended I didn\'t.', 'torn'],
  ]] },
  yearbook: { title: '学級写真帳　昭和二十五年', pages: [[
    ['二年Ａ組　担任　黒田', 'Class 2-A. Homeroom teacher: Kuroda.'],
    ['四十一人の生徒が、並んで笑っている。', 'Forty-one pupils stand in rows, smiling.'],
    ['四十二人目の顔は、針で削り取られている。', 'The face of the forty-second has been scratched away with a pin.'],
    ['名前の欄は、修正液で白く塗りつぶされている。', 'Her name has been painted out with correction fluid.'],
    ['その上に、鉛筆で小さく：「はなこ」', 'Over it, in small pencil letters: "Hanako."'],
    ['花子。書類の見本に書く名前。だれでもいい子の名前。', 'Hanako: the name printed on sample forms. The name for a girl who could be anyone.', 'torn'],
  ]] },
  kokkurinote: { title: 'こっくりさんの答え', pages: [[
    ['「わたしは、死んだの？」　→　いいえ……まだ', '"Am I dead?" → No... not yet.'],
    ['「あなたは、だれ？」　→　さ・よ', '"Who are you?" → Sa-yo.'],
    ['「七つ目の不思議は？」　→　しょこ　０・２・１・３', '"What is the seventh mystery?" → Archive. 0-2-1-3.'],
    ['「だれか、わたしをさがしてる？」　→　いいえ', '"Is anyone looking for me?" → No.', 'torn'],
  ]] },
  oldlist: { title: '七不思議　昭和二十五年十月二十日', pages: [[
    ['（子供の字。一週間後の日付）', '(A child\'s handwriting, dated one week after the festival.)'],
    ['一、トイレの三番目には、花子さんがいる。', '1. In the third stall, there is Hanako-san.'],
    ['二、音楽室のピアノが、夜にひとりで鳴る。', '2. The music-room piano plays by itself at night.'],
    ['三、西階段は、目をつぶると一段多い。', '3. If you shut your eyes, the west stairs have one step more.'],
    ['七、二年Ａ組の白石小夜は、トイレの花子さんになった。', '7. Shiraishi Sayo of 2-A turned into Toilet Hanako.', 'torn'],
    ['おもしろいから、みんなに広めよう。', 'It\'s funny, so let\'s tell everyone.'],
  ]] },
  letter: { title: '白石様', pages: [[
    ['十月十三日の夜、私は二階の女子便所から、ノックの音を聞きました。', 'On the night of October 13th, I heard knocking from the second-floor girls\' lavatory.'],
    ['子供のいたずらだと思い、そのまま帰りました。', 'I thought it was children playing a prank, and I went home.'],
    ['お母様が一年間、毎日学校に来られていたことも知っています。私は裏口から帰りました。', 'I know you came to the school every day for a year, Mrs. Shiraishi. I left by the back door so I would not have to see you.'],
    ['あれから、私はずっと、あのノックを聞いています。', 'I have been listening for that knocking ever since.'],
    ['この手紙を出す勇気が、私にはありません。　黒田', 'I do not have the courage to send this letter. — Kuroda', 'torn'],
  ]] },
  shoenote: { title: '下駄箱の手紙', pages: [[
    ['まだ帰っちゃだめ。', 'You can\'t go home yet.'],
    ['まだ、いっしょに遊んでないでしょ？', 'We haven\'t played together yet, have we?'],
    ['— は　な　こ', '— Ha-na-ko'],
  ]] },
};

let F = {};                                     // story flags
const G = {
  mode: 'boot', time: 0, room: null, roomId: null, cam: null, enemies: [], inv: {}, equipped: 'hands', hp: 100,
  dialog: null, choice: null, invOpen: false, docOpen: null, paused: false, cutscene: false, transition: false,
  fade: 0, fadeTarget: 0, fadeSpeed: 2, shake: 0, red: 0, flash: 0, lockCd: 0, checkpoint: null,
  stats: { t0: 0, purified: 0, deaths: 0 },
};

const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
function fadeTo(v, secs = 0.5) {
  G.fadeTarget = v; G.fadeSpeed = 1 / Math.max(0.01, secs);
  return wait(secs + 0.02);
}
function shake(a) { G.shake = Math.max(G.shake, a); }

// ── inventory ──
function has(id) { return (G.inv[id] || 0) > 0; }
function give(id, n = 1) {
  G.inv[id] = (G.inv[id] || 0) + n;
  audio.play('pickup');
  toast(`${ITEMS[id].jp}　${ITEMS[id].en}${n > 1 || ITEMS[id].count ? ' ×' + n : ''}`);
  updateHUD();
}
function take(id, n = 1) { G.inv[id] = Math.max(0, (G.inv[id] || 0) - n); if (!G.inv[id]) delete G.inv[id]; updateHUD(); }
function equip(id) { G.equipped = id; player.m.shinai.visible = id === 'shinai'; updateHUD(); }
function cycleWeapon() {
  const owned = WEAPON_ORDER.filter((w) => w === 'hands' || has(w));
  const i = owned.indexOf(G.equipped);
  equip(owned[(i + 1) % owned.length]);
  audio.play('kick');
}

// ── HUD ──
const hud = { root: $('hud'), hp: $('hp'), hpbar: $('hp').querySelector('i'), equip: $('equip'), prompt: $('prompt'), card: $('roomcard'), msg: $('msg') };
function updateHUD() {
  hud.hpbar.style.width = G.hp + '%';
  hud.hp.classList.toggle('low', G.hp < 30);
  const it = ITEMS[G.equipped];
  hud.equip.querySelector('b').textContent = it.k;
  hud.equip.querySelector('.n').textContent = it.en + (it.count ? ' ×' + (G.inv[G.equipped] || 0) : '');
}
let toastEl = null, toastT = 0;
function toast(text) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'toast'; hud.root.appendChild(toastEl); }
  toastEl.textContent = text; toastEl.classList.add('on'); toastT = 2.4;
}
function showRoomCard(R) {
  hud.card.querySelector('.jp').textContent = R.name;
  hud.card.querySelector('.en').textContent = R.en;
  hud.card.classList.add('on');
  clearTimeout(showRoomCard.t);
  showRoomCard.t = setTimeout(() => hud.card.classList.remove('on'), 2600);
}
function setPrompt(text) {
  if (text) { hud.prompt.innerHTML = `<kbd>${isTouch ? '調' : 'E'}</kbd>${text}`; hud.prompt.classList.add('on'); }
  else hud.prompt.classList.remove('on');
}

// ── message box: say() blocks the game until dismissed, note() is a passing caption ──
const msgP = hud.msg.querySelector('p');
function esc(s) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function say(text, o = {}) {
  return new Promise((resolve) => {
    G.dialog = { text, o, shown: 0, resolve };
    hud.msg.classList.add('on');
    renderDialog();
  });
}
function renderDialog() {
  const d = G.dialog; if (!d) return;
  const n = Math.floor(d.shown), t = esc(d.text.slice(0, n));
  const done = n >= d.text.length;
  msgP.innerHTML = (d.o.jp ? `<span class="jp">${t}</span>${done && d.o.sub ? esc(d.o.sub) : ''}` : t) + (done ? '<span class="more">▼</span>' : '');
}
function advanceDialog() {
  const d = G.dialog; if (!d) return;
  if (d.shown < d.text.length) { d.shown = d.text.length; renderDialog(); return; }
  G.dialog = null; hud.msg.classList.remove('on');
  d.resolve();
}
let noteT = 0;
function note(text, secs = 3, jp = false) {
  if (G.dialog) return;
  msgP.innerHTML = jp ? `<span class="jp">${esc(text)}</span>` : esc(text);
  hud.msg.classList.add('on'); noteT = secs;
}
function ask(text, options) {
  return new Promise((resolve) => {
    msgP.innerHTML = esc(text); hud.msg.classList.add('on');
    const box = $('choice'), opts = box.querySelector('.opts');
    opts.innerHTML = '';
    options.forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'btn' + (i === 0 ? ' sel' : ''); b.textContent = o;
      b.onclick = () => finish(i); opts.appendChild(b);
    });
    box.hidden = false;
    G.choice = { sel: 0, n: options.length, finish };
    function finish(i) { box.hidden = true; G.choice = null; hud.msg.classList.remove('on'); resolve(i); }
  });
}
function choiceMove(d) {
  const c = G.choice; c.sel = (c.sel + d + c.n) % c.n;
  $('choice').querySelectorAll('.btn').forEach((b, i) => b.classList.toggle('sel', i === c.sel));
}

// ── documents ──
function showDoc(id) {
  G.docOpen = { id, page: 0 };
  $('doc').hidden = false;
  renderDoc();
}
function renderDoc() {
  const d = DOCS[G.docOpen.id], pg = G.docOpen.page;
  $('doctitle').textContent = d.title;
  $('docbody').innerHTML = d.pages[pg].map(([jp, en, cls]) => `<p class="${cls || ''}">${esc(jp)}</p><p class="en">${esc(en)}</p>`).join('');
  $('docpage').textContent = d.pages.length > 1 ? `${pg + 1} / ${d.pages.length}` : '';
  $('docprev').style.visibility = pg > 0 ? 'visible' : 'hidden';
  $('docnext').textContent = pg < d.pages.length - 1 ? '次 →' : '閉じる ×';
}
function docNav(d) {
  const doc = DOCS[G.docOpen.id], np = G.docOpen.page + d;
  if (np >= doc.pages.length) { closeDoc(); return; }
  if (np < 0) return;
  G.docOpen.page = np; renderDoc();
}
function closeDoc() { G.docOpen = null; $('doc').hidden = true; }
$('docprev').onclick = () => docNav(-1);
$('docnext').onclick = () => docNav(1);

// ── inventory screen ──
const inv = { sel: 0, list: [], ecgX: 0, ecgY: 20 };
function openInv() {
  G.invOpen = true; $('inv').hidden = false; inv.sel = 0; renderInv();
  const ctx = $('ecg').getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 180, 40); inv.ecgX = 0;
}
function closeInv() { G.invOpen = false; $('inv').hidden = true; }
function invItems() {
  const ids = Object.keys(ITEMS).filter((id) => id !== 'hands' && has(id));
  return ['hands', ...ids];
}
function renderInv() {
  inv.list = invItems();
  inv.sel = clamp(inv.sel, 0, inv.list.length - 1);
  const ul = $('invlist'); ul.innerHTML = '';
  inv.list.forEach((id, i) => {
    const it = ITEMS[id], li = document.createElement('li'), b = document.createElement('button');
    b.className = i === inv.sel ? 'sel' : '';
    b.innerHTML = `<span class="k">${it.k}</span><span>${esc(it.en)}${G.equipped === id ? ' <span class="eq">装備中</span>' : ''}</span><span class="c">${it.count ? '×' + G.inv[id] : ''}</span>`;
    b.onclick = () => { if (inv.sel === i) invAction(0); else { inv.sel = i; renderInv(); } };
    li.appendChild(b); ul.appendChild(li);
  });
  const id = inv.list[inv.sel], it = ITEMS[id];
  $('invbig').textContent = it.k;
  $('invname').innerHTML = `${esc(it.en)}<small>${esc(it.jp)}</small>`;
  $('invdesc').textContent = it.desc;
  const acts = invActs(id), box = $('invacts'); box.innerHTML = '';
  acts.forEach(([label], i) => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; b.onclick = () => invAction(i); box.appendChild(b); });
  const cond = G.hp > 60 ? ['良好 · Fine', '#6fd08c'] : G.hp > 30 ? ['注意 · Hurt', '#e8a24a'] : ['危険 · Danger', '#e0484c'];
  $('condtxt').textContent = cond[0]; $('condtxt').style.color = cond[1];
  $('goal').innerHTML = `<b>目的</b>${esc(currentGoal())}`;
}
function currentGoal() {
  if (!F.loop) {
    if (!F.visited_entrance) return 'Find a way out of the school.';
    if (!F.unlocked_staffkey) return 'Get into the staff room. The day-duty student (日直) carries its key.';
    if (!F.entrancekey) return 'Find the entrance key in the staff room.';
    return 'Unlock the main doors in the entrance hall.';
  }
  if (!has('sciencekey') && !F.unlocked_sciencekey) return 'The school won\'t let you go. Go through the east passage and search the ground floor.';
  if (!F.gymkey_taken) return 'Search the science lab.';
  if (!F.dead_R1) return 'Something is knocking in the gymnasium.';
  if (!F.storeroom_seen) return 'Look inside the gym storeroom.';
  if (!F.unlocked_shutterkey) return 'Raise the fire shutter over the east stairs on the second floor.';
  if (!F.kokkuri) return 'Go up to the third floor. Someone left Kokkuri-san unfinished.';
  if (!F.unlocked_dial_archive) return 'Open the library archive (書庫). Kokkuri-san told you the code.';
  if (!F.roofkey_taken) return 'Search the archive. Learn her real name.';
  if (!F.final_done) return 'Go up to the roof. Find her, and call her by her name.';
  return 'Survive until morning.';
}
function invActs(id) {
  const it = ITEMS[id], a = [];
  if (it.weapon && G.equipped !== id) a.push(['装備 Equip', () => { equip(id); renderInv(); }]);
  if (it.heal) a.push(['使う Use', () => {
    const before = G.hp; G.hp = Math.min(100, G.hp + it.heal); take(id); audio.play('pickup');
    toast(`体力 +${Math.round(G.hp - before)}`); renderInv();
  }]);
  if (it.doc) a.push(['読む Read', () => { showDoc(it.doc); }]);
  if (it.map) a.push(['地図 Map', () => { openMap(); }]);
  return a;
}
function invAction(i) { const a = invActs(inv.list[inv.sel])[i]; if (a) a[1](); }
function drawECG(dt) {
  const ctx = $('ecg').getContext('2d');
  const col = G.hp > 60 ? '#6fd08c' : G.hp > 30 ? '#e8a24a' : '#e0484c';
  const rate = G.hp > 60 ? 1 : G.hp > 30 ? 1.4 : 2.0;
  for (let s = 0; s < 3; s++) {
    inv.ecgX += dt * 40;
    const x = inv.ecgX % 180, ph = (G.time * rate * 1.1) % 1;
    let y = 22;
    if (ph > 0.1 && ph < 0.13) y = 6; else if (ph >= 0.13 && ph < 0.16) y = 34; else if (ph > 0.3 && ph < 0.38) y = 18;
    ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fillRect(x, 0, 6, 40);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 1, inv.ecgY); ctx.lineTo(x, y); ctx.stroke();
    inv.ecgY = y;
  }
}

// ── pause ──
function setPause(on) { G.paused = on; $('pause').hidden = !on; if (on) $('pause').querySelector('.btn').focus(); }
$('pause').addEventListener('click', (e) => {
  const act = e.target.dataset?.act;
  if (act === 'resume') setPause(false);
  if (act === 'restart') { setPause(false); toTitle(); }
});
