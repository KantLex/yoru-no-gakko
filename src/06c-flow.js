
// ───────────────────────── rooms, cameras, screens, main loop ─────────────────────────
const roomCache = {};
function getRoom(id) { return roomCache[id] || (roomCache[id] = ROOM_DEFS[id]()); }

function enterRoom(id, doorId, start) {
  const old = G.room;
  if (old) { old.onExit?.(); for (const e of G.enemies) old.scene.remove(e.m.root); }
  const R = getRoom(id);
  G.room = R; G.roomId = id; G.cam = null; G.doorId = doorId || null; G.camOverride = null; bossBar(null);
  R.scene.add(player.m.root, flash, flash.target, playerLamp, fx.group);
  for (const p of fx.pool) { p.life = 0; p.s.visible = false; }
  const sp = doorId ? R.doors.find((d) => d.id === doorId).spawn : start;
  G.spawnPos = { x: sp.x, z: sp.z, rot: sp.rot };
  Object.assign(player, { x: sp.x, z: sp.z, rot: sp.rot, speed: 0, kx: 0, kz: 0, atk: null });
  player.y = R.floorY(sp.x, sp.z);
  G.enemies = [];
  for (const s of R.spawns) if (!F['dead_' + s.id] && (!s.when || s.when())) G.enemies.push(makeEnemy(s));
  if (R.journal) R.journal.visible = !!F.hard;       // Nightmare's class journal on the teacher's desk
  R.onEnter?.(doorId);
  audio.setAmbience(...R.ambience);
  audio.setAcoustics(R.acoustics);
  audio.setBuzz(0);
  relatchMove(sp.rot);                 // a held direction keeps walking her into the room, not back out of the door
  updatePlayer(0);
  pickCam(true);
}

function pickCam(force) {
  const R = G.room, p = player;
  if (!force && G.cam && inRect(p.x, p.z, G.cam.zone, 0.35)) return;
  const c = R.cams.find((k) => inRect(p.x, p.z, k.zone)) || R.cams[0];
  if (c !== G.cam) { G.cam = c; camera.fov = c.fov; camera.updateProjectionMatrix(); }
}
const camRight = new THREE.Vector3();
// yaw of the active camera definition in the game's rot convention (no shake noise)
function camYaw() {
  const o = G.camOverride ? (typeof G.camOverride === 'function' ? G.camOverride() : G.camOverride) : G.cam;
  return o ? Math.atan2(o.look.x - o.pos.x, o.look.z - o.pos.z) : player.rot;
}
function updateCamera(dt) {
  if (G.mode === 'title') {
    camera.fov = 52; camera.updateProjectionMatrix();
    camera.position.set(-13.2 + Math.sin(G.time * 0.13) * 0.15, 1.5 + Math.sin(G.time * 0.21) * 0.05, 0.9);
    camera.lookAt(6, 1.15, -0.35);
  } else if (G.camOverride || G.cam) {
    let pos, look;
    if (G.camOverride) {
      const o = typeof G.camOverride === 'function' ? G.camOverride() : G.camOverride;
      if (camera.fov !== o.fov) { camera.fov = o.fov; camera.updateProjectionMatrix(); }
      pos = o.pos; look = o.look;
    } else { pickCam(false); pos = G.cam.pos; look = G.cam.look; }
    camera.position.copy(pos);
    if (G.shake > 0) {
      camera.position.x += rand(-1, 1) * G.shake * 0.07; camera.position.y += rand(-1, 1) * G.shake * 0.07;
      G.shake = Math.max(0, G.shake - dt * 1.4);
    }
    camera.lookAt(look);
  }
  camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
  audio.listen(player.x, player.z, camRight.x, camRight.z);
}

// ── doors, spots, triggers ──
function checkDoors(dt) {
  G.lockCd -= dt;
  if (!player.fwdIntent) return;
  for (const d of G.room.doors) {
    if (!inRect(player.x, player.z, d.rect)) continue;
    if (Math.abs(angDiff(player.rot, d.face)) > 1.1) continue;
    if (G.dawn || G.final || (F.final_started && !F.final_done)) { throttledNote('The door won\'t move. Not until morning.'); return; }   // no leaving the roof mid-finale
    useDoor(d);
    return;
  }
}
function stepBack(k = 1.5) { player.kx = -Math.sin(player.rot) * k; player.kz = -Math.cos(player.rot) * k; }
async function useDoor(d) {
  const bump = async (msg) => {
    if (G.lockCd > 0) return;
    G.lockCd = 2.5; audio.play('kick', player.x, player.z); stepBack();
    await say(msg);
  };
  if (d.shutter && G.room.shutters[d.id].rising) return;
  if (d.cond && !d.cond()) return bump(d.lockMsg || 'It won\'t open.');
  if (d.dial && !F['unlocked_dial_' + d.id]) {
    if (G.lockCd > 0) return;
    G.lockCd = 1.5; stepBack(1);
    const ok = await openDial(d.dial);
    if (!ok) return;
    F['unlocked_dial_' + d.id] = 1; audio.play('kick', player.x, player.z);
    await say('The last wheel clicks into place, and the padlock drops open.');
  }
  if (d.lock) {
    if (d.lock === 'never' || !has(d.lock)) return bump(d.lockMsg || 'It\'s locked.');
    if (!F['unlocked_' + d.lock]) {
      F['unlocked_' + d.lock] = 1; audio.play('kick', player.x, player.z);
      await say(d.unlockMsg || (() => trf('You unlock the door with the {item}.', { item: LANG === 'en' ? ITEMS[d.lock].en.toLowerCase() : tr(ITEMS[d.lock].en) })));
      d.onUnlock?.();
      if (d.stayAfterUnlock) { G.lockCd = 1.5; stepBack(); return; }
    }
  }
  if (!d.to) return;
  G.transition = true;
  audio.play(d.snd || 'creak', player.x, player.z);
  await fadeTo(0, 0.35);
  enterRoom(d.to, d.toDoor);
  if (!F.hard) setCheckpoint();                      // Nightmare saves only in class journals
  try { renderer.compile(G.room.scene, camera); } catch (_) {}
  const first = !F['visited_' + d.to];
  F['visited_' + d.to] = 1;
  G.transition = false;
  await fadeTo(1, 0.45);
  if (first) showRoomCard(G.room);
}
function nearestSpot() {
  let best = null, bs = 1e9;
  for (const s of G.room.spots) {
    if (s.when && !s.when()) continue;
    const dx = s.x - player.x, dz = s.z - player.z, d = Math.hypot(dx, dz);
    if (d > s.r + 0.35) continue;
    const a = Math.abs(angDiff(player.rot, Math.atan2(dx, dz)));
    if (d > 0.45 && a > 1.25) continue;
    const score = d + a * 0.6;
    if (score < bs) { bs = score; best = s; }
  }
  return best;
}
function checkTriggers() { for (const t of G.room.triggers) if (inRect(player.x, player.z, t.rect)) t.fn(); }

// ── saving (checkpoint at every door, a class journal in Nightmare, and for live page updates) ──
const SAVE_KEY = 'yoru-no-gakko-save-2';
function setCheckpoint() { G.checkpoint = makeSave(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.checkpoint)); } catch (_) {} syncMeta(); }
// a save where she stands (loadSave spawns at pos when door is null)
function manualSave() {
  G.checkpoint = { ...makeSave(), door: null, pos: { x: player.x, z: player.z, rot: player.rot } };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.checkpoint)); } catch (_) {}
  syncMeta();
}
function storedSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (_) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (_) {} }
function makeSave() {
  return JSON.parse(JSON.stringify({ room: G.roomId, door: G.doorId, pos: G.spawnPos, hp: G.hp, inv: G.inv, equipped: G.equipped, F, stats: G.stats, t: G.time - G.stats.t0 }));
}
function loadSave(s) {
  F = JSON.parse(JSON.stringify(s.F)); G.inv = { ...s.inv }; G.hp = F.hard ? s.hp : Math.max(45, s.hp);   // no mercy heal in Nightmare
  G.stats = { ...s.stats }; G.stats.t0 = G.time - (s.t || 0);
  player.dead = false; resetPose(); resetAct2();
  enterRoom(s.room, s.door, s.pos);
  equip(s.equipped in G.inv || s.equipped === 'hands' ? s.equipped : 'hands');
  setCheckpoint();
}

// ── generic button menus (pause, game over, ending) ──
function openMenu(el, sel = 0) {
  const btns = [...el.querySelectorAll('.btn')];
  G.menu = { btns, sel };
  btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
}
function menuMove(d) {
  const m = G.menu; m.sel = (m.sel + d + m.btns.length) % m.btns.length;
  m.btns.forEach((b, i) => b.classList.toggle('sel', i === m.sel));
}
function openPause() { setPause(true); openMenu($('pause')); }

// ── title, intro, game over, ending ──
function showTitle() {
  G.mode = 'title';
  for (const id of ['over', 'ending', 'intro', 'inv', 'doc', 'pause', 'choice', 'map', 'dial', 'kokkuri', 'settings', 'records']) $(id).hidden = true;
  G.menu = null; G.settings = null; G.records = null; G.dialog = null; G.choice = null; G.invOpen = false; G.docOpen = null; G.paused = false; G.cutscene = false;
  hud.root.hidden = true; hud.msg.classList.remove('on');
  $('title').hidden = false;
  onInputChange();
  F = {}; G.inv = {}; G.hp = 100;
  player.dead = false; resetPose(); resetAct2();
  const save = G.hotSave || storedSave(), menu = $('titlemenu');
  const add = (tag, cls, label) => { const b = document.createElement(tag); b.className = cls; b.dataset.t = label; b.textContent = tr(label); menu.appendChild(b); return b; };
  const addBtn = (label, fn) => { add('button', 'btn', label).onclick = (e) => { e.stopPropagation(); fn(); }; };
  const main = (sel = 0) => {
    menu.innerHTML = '';
    if (save) addBtn('つづきから · Continue', () => startGame(save));
    if (save?.F?.hard) add('div', 'desc hard', '悪夢 · Nightmare');
    addBtn(save ? 'はじめから · New game' : 'はじめる · Begin', difficulty);
    if (metaAny()) addBtn('記録 · Records', () => openRecords('title'));
    addBtn('設定 · Settings', () => openSettings('title'));
    $('title').classList.toggle('tall', menu.children.length > 3);
    openMenu(menu, sel);
  };
  const difficulty = () => {                        // New game → Normal / Nightmare
    menu.innerHTML = '';
    addBtn('通常 · Normal', () => startGame(null, false));
    addBtn('悪夢 · Nightmare', () => startGame(null, true));
    add('div', 'desc', 'Harder obake, fewer supplies, saves only in class journals.');
    addBtn('戻る · Back', () => main(save ? 1 : 0));
    $('title').classList.add('tall');
    openMenu(menu);
    G.menu.back = () => main(save ? 1 : 0);
  };
  main();
  $('title').querySelector('.seal.hard').hidden = !(meta().clears.nightmare > 0);   // Nightmare has been cleared
  enterRoom('hall2', null, { x: -12.5, z: 0, rot: FACE.E });
  player.m.root.visible = false; flash.intensity = 0; playerLamp.intensity = 0;
  G.fadeTarget = 1; G.fadeSpeed = 0.7;
}
function toTitle() { G.hotSave = null; audio.pianoStop(false); audio.stopVoice(); fadeTo(0, 0.4).then(showTitle); }

async function startGame(resume, hard) {
  if (G.mode !== 'title') return;
  audio.unlock();
  G.mode = 'intro'; G.menu = null;
  $('title').hidden = true;
  await fadeTo(0, 0.7);
  G.hotSave = null;
  G.stats = { t0: G.time, purified: 0, deaths: 0 };
  if (!resume) {
    const el = $('intro');
    el.querySelectorAll('p').forEach((p) => p.remove());
    const lines = [
      ['放課後、剣道部の練習のあと、教室で眠ってしまった。', 'After kendo practice, I fell asleep at my desk.'],
      ['目が覚めると、午前二時だった。', 'When I woke up, it was two in the morning.'],
      ['校舎には、もう誰もいないはずだった。', 'There shouldn\'t have been anyone left in the building.'],
      ['それなのに、チャイムが鳴った。', 'And yet, the school chime began to ring.'],
    ];
    const ps = lines.map(([jp, en]) => { const p = document.createElement('p'); p.innerHTML = `<span class="jp">${jp}</span><span class="en">${tr(en)}</span>`; el.insertBefore(p, el.querySelector('.skip')); return p; });
    el.hidden = false; G.skip = false;
    audio.setAmbience(0.08, 0.06, 0);
    for (let i = 0; i < ps.length && !G.skip; i++) {
      ps[i].classList.add('on');
      if (i === 3) audio.play('chime', 0, 0, 1);
      for (let k = 0; k < (i === 3 ? 60 : 30) && !G.skip; k++) await wait(0.1);
    }
    el.hidden = true;
    F = {}; G.inv = {}; G.hp = 100;
    if (hard) F.hard = 1;                            // Nightmare (travels in F, so in every save)
    enterRoom('classroom', null, { x: -2.55, z: 2.35, rot: FACE.N });
    F.visited_classroom = 1;
    equip('hands');
    setCheckpoint();
  } else loadSave(resume);
  player.m.root.visible = true; flash.intensity = FLASH_ON; playerLamp.intensity = LAMP_ON;
  G.mode = 'play';
  hud.root.hidden = false; updateHUD();
  try { renderer.compile(G.room.scene, camera); } catch (_) {}
  await fadeTo(1, 1.4);
  if (!resume) await chapterCard(1);
  showRoomCard(G.room);
  if (!resume) {
    await wait(1.8);
    const g = { a: glyph('interact'), b: glyph('inv'), c: glyph('attack') };
    note('「ここから、出なきゃ……」', 6, true, trf(lastDevice === 'touch' ? 'I have to get out of here.  ({a} examine · {b} items)' : 'I have to get out of here.  ({a} examine · {b} items · {c} attack)', g));
    audio.speak('v01');
  }
}

function showGameOver() {
  G.mode = 'over';
  hud.root.hidden = true;
  const el = $('over');
  el.innerHTML = `<h2>おしまい</h2>
    <p class="on"><span class="jp">あなたも、七不思議のひとつになった。</span><span class="en">${tr('You have become one of the Seven Mysteries.')}</span></p>
    <div style="display:flex;gap:calc(var(--u)*1.5);flex-wrap:wrap;justify-content:center">
      <button class="btn" data-act="retry">${tr(F.hard ? 'Try again from your last save' : 'Try again from the last door')}</button><button class="btn" data-act="title">${tr('Title screen')}</button></div>`;
  el.hidden = false;
  openMenu(el);
  G.fadeTarget = 1; G.fadeSpeed = 1;
  // the death counts even though the retry goes back to a save made before it (and so does Continue from the title)
  if (G.checkpoint) { G.checkpoint.stats.deaths = G.stats.deaths; try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.checkpoint)); } catch (_) {} }
  el.onclick = async (e) => {
    const act = e.target.dataset?.act; if (!act) return;
    el.onclick = null; G.menu = null;
    if (act === 'title') { el.hidden = true; toTitle(); return; }
    await fadeTo(0, 0.3); el.hidden = true;
    loadSave(G.checkpoint);
    G.mode = 'play'; hud.root.hidden = false; updateHUD();
    await fadeTo(1, 0.8);
    showRoomCard(G.room);
  };
}

async function finishGame() {
  G.mode = 'ending'; G.cutscene = true;
  setPrompt(null); bossBar(null);
  const secs = Math.round(G.time - G.stats.t0), mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
  const nDocs = docCount(), trueEnd = nDocs === DOC_ORDER.length;   // every page read: 四十二人目
  recordEnding(trueEnd ? 'true' : 'dawn', secs);                     // before the run's save goes
  clearSave();
  await fadeTo(0, 2.4);
  hud.root.hidden = true;
  audio.setAmbience(0.03, 0.1, 0); audio.setAcoustics('room'); // the epilogue is nowhere in particular: no roof wind
  const el = $('ending');
  // [jp, en, voice?]
  const lines = trueEnd ? [
    ['午前五時四十分。体育倉庫の扉を開けたのは、宿直の黒田先生だった。', '5:40 a.m. The one who opened the gym storeroom was Mr. Kuroda, the teacher on night duty.'],
    ['私は、先生に一通の手紙を渡した。四十五年間、出されなかった手紙。', 'I handed him a letter. One that had waited forty-five years to be sent.'],
    ['先生は宛名を見て、その場に座りこんだ。「……白石さん」', 'He read the name on the envelope and sank to the floor. "...Shiraishi-san."'],
    ['校門の外で、ユキが泣きながら私の名前を呼んでいた。', 'Outside the gate, Yuki was crying and calling my name.'],
    ['その向こうに、髪の長い、背の高い女の人が立っていた。先生は、その人に深く頭を下げたまま、しばらく動かなかった。', 'Beyond her stood a tall woman with very long hair. Mr. Kuroda bowed to her, low, and stayed that way for a long time.'],
    ['赤いスカートの女の子が、その人のところへ走っていった。一度だけふりかえって、手をふった。', 'A little girl in a red skirt ran to her. She looked back once, and waved.'],
    ['学校は、昭和二十五年の学級写真を刷りなおした。四十二人の顔が、はじめてそろった。', 'The school reprinted the 1950 class photograph. For the first time, all forty-two faces were there.'],
    ['私の名前は、橘美咲。あの子の名前は、白石小夜。私たちは、同じ教室の友だちだった。', 'My name is Tachibana Misaki. Her name is Shiraishi Sayo. We were friends, in the same classroom.', 'v15'],
    ['「小夜ちゃん。また、あした。」', '"See you tomorrow, Sayo."', 'v16'],
  ] : [
    ['午前五時四十分。体育倉庫の扉を開けたのは、宿直の黒田先生だった。', '5:40 a.m. The one who opened the gym storeroom was Mr. Kuroda, the teacher on night duty.'],
    ['四十五年前、彼はノックの音を聞いて、扉を開けなかった。', 'Forty-five years ago, he heard knocking behind a door, and did not open it.'],
    ['今度は、開けた。', 'This time, he did.'],
    ['校門の外で、ユキが泣きながら私の名前を呼んでいた。一晩中、探してくれていたのだと言った。', 'Outside the gate, Yuki was crying and calling my name. She said she had been looking for me all night.'],
    ['その向こうに、髪の長い、背の高い女の人が立っていた。赤いスカートの女の子が、その人のところへ走っていった。', 'Beyond her stood a tall woman with very long hair. A little girl in a red skirt ran to her, and they were gone.'],
    ['私の名前は、橘美咲。あの子の名前は、白石小夜。', 'My name is Tachibana Misaki. Her name was Shiraishi Sayo.', 'v15'],
    ['名前を呼んでくれる人がいるかぎり、人はお化けにはならない。', 'As long as someone calls you by your name, you do not become a ghost.'],
  ];
  const fin = trueEnd ? ['青嵐高校の七不思議は、あの朝から、六つになった。', 'Since that morning, Seiran High has only six mysteries.']
    : ['', 'Since that morning, the piano in the music room plays its song all the way to the end.'];
  el.innerHTML = lines.map(([jp, en]) => `<p><span class="jp">${jp}</span><span class="en">${tr(en)}</span></p>`).join('') +
    `<p class="fin"><span style="font-family:var(--f-title);font-size:calc(var(--u)*4.4);letter-spacing:.3em">終</span>${fin[0] ? `<span class="jp" style="display:block">${fin[0]}</span>` : ''}<span class="en">${tr(fin[1])}</span></p>` +
    (trueEnd ? '' : `<p class="hint-end"><span class="jp">この物語には、まだ読まれていないページがある。</span><span class="en">${tr('Some pages of this story have not been read yet.')}</span></p>`) +
    `<div class="stats fin" style="opacity:0;transition:opacity 1.4s"><span>${tr('Difficulty')}</span><b>${tr(F.hard ? '悪夢 · Nightmare' : '通常 · Normal')}</b><span>${tr('Time')}</span><b>${mm}:${ss}</b>` +
    `<span>${tr('資料 · Documents')}</span><b>${nDocs}/${DOC_ORDER.length}</b><span>${tr('Obake laid to rest')}</span><b>${G.stats.purified}</b><span>${tr('Times you became a mystery')}</span><b>${G.stats.deaths}</b></div>
     <button class="btn fin" data-act="again" style="opacity:0;transition:opacity 1.4s">${tr('Back to the title')}</button>`;
  el.hidden = false; el.dataset.end = trueEnd ? 'true' : 'dawn';
  G.fadeTarget = 1;
  // one line at a time, two to a page; the last page keeps its line with 終 (and the hint)
  const ps = [...el.querySelectorAll('p')], n = lines.length;
  ps.forEach((p) => { p.style.display = 'none'; });   // lines still to come take no room (a long ending would push the page off the top)
  for (let i = 0; i < ps.length; i++) {
    ps[i].style.display = ''; void ps[i].offsetWidth; ps[i].classList.add('on');
    if (i === (trueEnd ? 6 : 2)) audio.play('rin');
    const v = lines[i]?.[2] ? audio.speak(lines[i][2]) : null, en = lines[i]?.[1] || '';
    await wait(i === ps.length - 1 ? 1.4 : 3.4 + Math.max(0, en.length - 80) * 0.025);
    if (v) await v;
    if (i < n - 1 && i % 2 === 1) ps.slice(0, i + 1).forEach((q) => { q.style.display = 'none'; });
  }
  el.querySelectorAll('div.fin, button.fin').forEach((x) => (x.style.opacity = 1));
  openMenu(el);
  el.onclick = (e) => { if (e.target.dataset?.act === 'again') { el.onclick = null; G.menu = null; el.hidden = true; toTitle(); } };
}

// ── input routing ──
function handleInput() {
  const hit = input.hit;
  if (hit('debug')) { const f = $('fps'); f.style.display = f.style.display === 'block' ? 'none' : 'block'; }
  if (G.settings) { settingsInput(hit); return; }   // topmost layer (over the title or the pause panel)
  if (G.records) { recordsInput(hit); return; }
  if (G.storyOpen) { if (hit('interact') || hit('attack') || hit('pause') || hit('back')) G.skip = true; return; }
  if (G.dial) { dialInput(hit); return; }
  if (G.mapOpen) { if (hit('map') || hit('pause') || hit('inv') || hit('back') || hit('interact') || hit('attack')) closeMap(); return; }
  if (G.docOpen) {
    if (hit('interact') || hit('attack') || hit('right')) docStep(1);
    else if (hit('left')) docStep(-1);
    else if (hit('down')) docScroll(2);
    else if (hit('up')) docScroll(-2);
    else if (hit('pause') || hit('inv') || hit('back')) closeDoc();
    return;
  }
  if (G.choice) {
    if (hit('left') || hit('up')) choiceMove(-1);
    if (hit('right') || hit('down')) choiceMove(1);
    if (hit('interact') || hit('attack')) G.choice.finish(G.choice.sel);
    return;
  }
  if (G.dialog) { if (hit('interact') || hit('attack')) advanceDialog(); return; }
  if (G.menu) {
    if (hit('up') || hit('left')) menuMove(-1);
    if (hit('down') || hit('right')) menuMove(1);
    if (hit('interact') || hit('attack')) G.menu.btns[G.menu.sel].click();
    if (G.paused && (hit('pause') || hit('back'))) { setPause(false); G.menu = null; }
    else if (G.menu?.back && (hit('pause') || hit('back'))) G.menu.back();   // a submenu (title difficulty) steps back
    return;
  }
  if (G.invOpen) {
    if (hit('map') && has('handbook')) { openMap(); return; }
    if (hit('up')) { inv.sel--; renderInv(); }
    if (hit('down')) { inv.sel++; renderInv(); }
    if (hit('interact') || hit('attack')) invAction(0);
    if (hit('cycle')) invAction(1);
    if (hit('inv') || hit('pause') || hit('back')) closeInv();
    return;
  }
  switch (G.mode) {
    case 'title': if (hit('interact') || hit('attack')) startGame(); break;
    case 'intro': if (hit('interact') || hit('attack') || hit('pause') || hit('back')) G.skip = true; break;
    case 'play':
      if (player.dead || G.transition) break;
      if (hit('pause')) { openPause(); break; }
      if (G.cutscene) break;
      if (hit('inv')) { openInv(); break; }
      if (hit('map')) { if (has('handbook')) openMap(); else note('You don\'t have a map of the school.', 2); break; }
      if (G.final) { if (hit('attack') || hit('interact')) finaleAnswer(); break; }
      if (hit('cycle')) cycleWeapon();
      if (hit('interact')) { const s = nearestSpot(); if (s) s.use(); }
      else if (hit('attack')) startAttack();
      break;
  }
}
$('intro').addEventListener('click', () => { G.skip = true; });
stage.addEventListener('click', (e) => { if (G.dialog && !G.settings && !G.records && !e.target.closest('.btn')) advanceDialog(); });
$('pause').addEventListener('click', () => { if ($('pause').hidden) G.menu = null; });

// ── device / scheme dependent help: title key list, examine prompt glyph ──
function onInputChange() {
  const t = $('title');
  t.querySelector('.keys:not(.pad)').hidden = lastDevice !== 'kb';
  t.querySelector('.keys.pad').hidden = lastDevice !== 'pad';
  t.querySelectorAll('[data-scheme]').forEach((e) => { e.hidden = e.dataset.scheme !== CONTROLS; });
  document.querySelectorAll('[data-dev]').forEach((e) => { e.hidden = (e.dataset.dev === 'pad') !== (lastDevice === 'pad'); });
  $('padhint').textContent = tr('🔈 Press a key or click once to enable sound');
  if (setPrompt.text) setPrompt(setPrompt.text);
}

// ── per-frame bits ──
function updateFlickers(dt) {
  for (const f of G.room.flickers) {
    f.t -= dt;
    if (f.kind === 'fluoro') {
      if (f.t <= 0) {
        if (f.on) { f.on = false; f.t = Math.random() < 0.2 ? rand(0.8, 2.6) : rand(0.04, 0.12); }
        else { f.on = true; f.t = Math.random() < 0.5 ? rand(0.05, 0.2) : rand(0.8, 3.5); }
      }
      f.l.intensity = f.on ? f.base * rand(0.92, 1) : 0;
      if (f.mesh) f.mesh.emissiveIntensity = f.on ? 1 : 0.04;
      if (G.mode === 'play') audio.setBuzz(f.on ? 0.02 : 0);
    } else if (f.kind === 'buzz') f.l.intensity = f.base * rand(0.9, 1) * (Math.random() < 0.01 ? 0.3 : 1);
    else if (f.kind === 'lamp') f.l.intensity = f.base * rand(0.95, 1);
  }
}
let ambT = 12, heartT = 0, chimeT = 95, stepsT = 70, metaT = 1;
const padHintEl = $('padhint'), tPauseEl = touchUI.querySelector('.tpause');
function updateFrameUI(dt, playing) {
  if (G.dialog) {
    const d = G.dialog, before = Math.floor(d.shown);
    d.shown = Math.min(d.text.length, d.shown + dt * d.rate);   // characters per second (textRate)
    if (Math.floor(d.shown) !== before) renderDialog();
  }
  if (noteT > 0) { noteT -= dt; if (noteT <= 0 && !G.dialog && !G.choice) hud.msg.classList.remove('on'); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0 && toastEl) toastEl.classList.remove('on'); }
  if (G.invOpen) drawECG(dt);
  if (G.mode === 'title') { const h = !(lastDevice === 'pad' && audio.ctx?.state !== 'running'); if (padHintEl.hidden !== h) padHintEl.hidden = h; }
  if (tPauseEl) { const h = G.mode !== 'play' && G.mode !== 'intro'; if (tPauseEl.hidden !== h) tPauseEl.hidden = h; }   // touch ⏸ only where pause/skip does something
  const s = playing && !G.cutscene && !player.dead ? nearestSpot() : null;
  if (s !== G.lastSpot) { G.lastSpot = s; setPrompt(s ? s.label || '調べる · Examine' : null); }
  if (G.mode === 'play' && (metaT -= dt) <= 0) { metaT = 1; syncMeta(); }   // records pick up mysteries as their flags are set
  if (G.mode === 'play' && !player.dead) {
    if (G.hp < 30) { heartT -= dt; if (heartT <= 0) { audio.play('heart'); heartT = 0.85; } }
    ambT -= dt;
    if (ambT <= 0 && !audio.voicePlaying()) { ambT = rand(18, 40); audio.play(Math.random() < 0.6 ? 'whisper' : 'drip', player.x + rand(-5, 5), player.z + rand(-5, 5)); }
    if (G.roomId === 'toilet' && Math.random() < dt * 0.7) audio.play('drip', -2.6, rand(-0.2, 2));
    // far-off layers: the school chime somewhere in the building, footsteps on the floor above (indoors, never over the finale)
    if (!G.cutscene && !G.dialog && !G.paused && !G.final && !G.dawn && !audio.voicePlaying()) {
      const inside = G.room.acoustics !== 'outdoor';
      if ((chimeT -= dt) <= 0) { chimeT = rand(70, 140); if (inside) audio.play('chimeFar'); }
      if ((stepsT -= dt) <= 0) { stepsT = rand(50, 110); if (inside) audio.play('farSteps'); }
    }
  }
}

// which menu/overlay has the input (a new value = a newly opened one; the pad re-arms direction autorepeat)
const uiContext = () => G.settings || G.records || G.menu || G.choice || G.dial || G.docOpen || (G.invOpen && 'inv') || (G.mapOpen && 'map') || (G.storyOpen && 'story') || G.mode;

// ── main loop ──
let last = performance.now(), fpsN = 0, fpsT = 0;
function loop(now) { requestAnimationFrame(loop); frame(now); }
// When the page is in a hidden frame, rAF stops; keep a slow heartbeat so timers and scripted scenes still resolve.
setInterval(() => { const n = performance.now(); if (n - last > 250) frame(n); }, 100);
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.time += dt;
  input.poll(uiContext());
  handleInput();
  const playing = G.mode === 'play' && !G.paused && !G.dialog && !G.choice && !G.invOpen && !G.docOpen && !G.transition && !G.dial && !G.mapOpen && !G.storyOpen;
  if (playing || (G.mode === 'play' && player.dead)) {
    updatePlayer(dt);
    updateEnemies(dt, true);
    if (!G.cutscene && !player.dead) { checkDoors(dt); checkTriggers(); }
  } else if (G.mode === 'title') updateEnemies(dt, false);
  if (G.mode === 'play' || G.mode === 'ending') updateAct2(dt, playing);
  if (G.room) { G.room.update?.(dt); updateFlickers(dt); }
  updateFx(dt);
  updateCamera(dt);
  updateFrameUI(dt, playing);
  audio.update();

  // post-process uniforms
  G.fade += clamp(G.fadeTarget - G.fade, -dt * G.fadeSpeed, dt * G.fadeSpeed);
  G.red = Math.max(0, G.red - dt * 1.6);
  G.flash = Math.max(0, G.flash - dt * 1.5);
  const han = G.enemies.find((e) => e.type === 'hanako' && !e.dormant && e.state !== 'dead' && e.state !== 'dying');
  const wob = han ? clamp((3.2 - Math.hypot(han.x - player.x, han.z - player.z)) / 3.2, 0, 1) : 0;
  const u = post.uniforms;
  u.time.value = G.time; u.fade.value = G.fade; u.flash.value = G.flash;
  u.red.value = Math.max(G.red, G.mode === 'play' && G.hp < 30 ? 0.25 + Math.sin(G.time * 7) * 0.08 : 0);
  u.wobble.value = lerp(u.wobble.value, wob, 1 - Math.exp(-dt * 3));
  u.gray.value = G.mode === 'play' ? clamp((40 - G.hp) / 40, 0, 0.6) : 0;

  if (G.room) {
    renderer.setRenderTarget(rt);
    renderer.render(G.room.scene, camera);
    renderer.setRenderTarget(null);
  }
  renderer.render(post.scene, post.cam);
  input.endFrame();

  fpsN++; fpsT += dt;
  if (fpsT > 0.5) { $('fps').textContent = Math.round(fpsN / fpsT) + ' fps · ' + (G.roomId || ''); fpsN = 0; fpsT = 0; }
}

// ── boot ──
async function boot() {
  fitStage();
  try {
    await Promise.race([
      Promise.all([document.fonts.load('40px "Klee One"', 'たすけて自習日直花子'), document.fonts.load('40px "Yuji Syuku"', '祭夜の学校'), document.fonts.load('16px "DotGothic16"', 'A体力')]),
      wait(3),
    ]);
  } catch (_) {}
  buildTextures();
  buildTextures2();
  furnitureMats();
  initPlayer();
  initFx();
  equip('hands');
  loadSettings();                      // language, volumes, brightness, text size, controls
  // Test hook: loading the page with ?test exposes internals to the headless test harness.
  if (/[?&]test\b/.test(location.search)) {
    window.__t = {
      G, player, input, audio, camera, ITEMS, DOCS, has, give, take, enterRoom, useDoor, setCheckpoint, makeSave, loadSave, startGame, showTitle, finishGame, hurtPlayer,
      VOICE, VOICE_FILES, getRoom, setControlScheme, glyph, camYaw, showDoc,
      post, SETTINGS, ZH, tr, trf, setLang, applySettings, loadSettings, openSettings, closeSettings, i18nMissing: trMissing, openPause, say, note,
      meta, syncMeta, openRecords, closeRecords, manualSave, nearestSpot, docCount, DOC_ORDER, killPlayer, storedSave, useJournal, ETYPES, makeEnemy, AI,
      get META() { return META; }, set META(v) { META = v; },
      get LANG() { return LANG; },
      get CONTROLS() { return CONTROLS; }, get lastDevice() { return lastDevice; },
      get chimeT() { return chimeT; }, set chimeT(v) { chimeT = v; }, get stepsT() { return stepsT; }, set stepsT(v) { stepsT = v; },
      get F() { return F; }, set F(v) { F = v; },
    };
  }
  const hot = window.claude?.hot;
  try { hot?.snapshot?.(() => (G.mode === 'play' && !player.dead ? { save: makeSave() } : {})); } catch (_) {}
  const start = (data) => { G.hotSave = data?.save || null; showTitle(); requestAnimationFrame(loop); };
  if (typeof hot?.ready === 'function') hot.ready(start); else start(hot?.data ?? {});
}
