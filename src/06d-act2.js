
// ───────────────────────── act two: new obake, story scenes, séance, lock, map, finale ─────────────────────────
G.tweens = [];
function tween(secs, fn) { return new Promise((res) => G.tweens.push({ t: 0, secs, fn, res })); }

// 大首 — Sayo's mother, grown too big for the building. Her face fills the corridor from floor to ceiling.
function buildOkubi() {
  const skin = new THREE.MeshLambertMaterial({ color: 0xe8dcd0, flatShading: true, emissive: 0x241e1a });
  const hair = mat(0x070606), glowW = new THREE.MeshBasicMaterial({ color: 0xf2eee4 }), black = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const root = new THREE.Group(), head = pivot(root, 0, 1.45, 0);
  const face = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), skin); face.scale.set(1.02, 1.26, 0.82); head.add(face);
  const back = new THREE.Mesh(new THREE.SphereGeometry(1.12, 10, 8), hair); back.scale.set(1.18, 1.28, 0.9); back.position.z = -0.6; head.add(back);
  for (let i = 0; i < 6; i++) { const strand = new THREE.Mesh(B(0.045, rand(1.0, 1.8), 0.02), hair); strand.position.set(rand(-0.75, 0.75), rand(-0.1, 0.4), 0.86); strand.rotation.z = rand(-0.15, 0.15); head.add(strand); }
  const fringe = new THREE.Mesh(B(2.1, 0.42, 0.6), hair); fringe.position.set(0, 1.0, 0.45); head.add(fringe);
  for (const s of [-1, 1]) { const side = new THREE.Mesh(B(0.34, 2.5, 1.3), hair); side.position.set(1.02 * s, -0.1, 0.1); head.add(side); }
  const pupils = [];
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), glowW); eye.scale.set(1.35, 0.75, 0.5); eye.position.set(0.38 * s, 0.22, 0.76); head.add(eye);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 4), black); p.position.set(0.38 * s, 0.22, 0.85); head.add(p); pupils.push(p);
    const brow = new THREE.Mesh(B(0.2, 0.08, 0.05), hair); brow.position.set(0.4 * s, 0.78, 0.74); head.add(brow);
  }
  const mouth = pivot(head, 0, -0.58, 0.72);
  mouth.add(new THREE.Mesh(B(0.78, 0.2, 0.12), mat(0x7a1418)));
  const teeth = new THREE.Mesh(B(0.64, 0.12, 0.13), black); mouth.add(teeth);
  const hands = [];
  for (const s of [-1, 1]) {
    const hnd = pivot(root, 0.95 * s, 0.12, 1.1);
    hnd.add(new THREE.Mesh(B(0.72, 0.2, 0.62), skin));
    for (let f = 0; f < 4; f++) { const fg = new THREE.Mesh(B(0.13, 0.1, 0.55), skin); fg.position.set(-0.27 + f * 0.18, -0.02, 0.55); hnd.add(fg); }
    const th = new THREE.Mesh(B(0.13, 0.1, 0.4), skin); th.position.set(-0.45 * s, 0, 0.2); th.rotation.y = 0.7 * s; hnd.add(th);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.6, 6), skin); arm.position.set(0, 0.5, -0.7); arm.rotation.x = -1.0; hnd.add(arm);
    hands.push(hnd);
  }
  const streamers = [];
  for (let i = 0; i < 16; i++) {
    const st = new THREE.Mesh(B(0.3, 0.05, 4.2), hair);
    st.geometry.translate(0, 0, -2.1);
    st.position.set(-1.25 + (i % 8) * 0.36, 0.35 + Math.floor(i / 8) * 1.9 + rand(-0.2, 0.2), -0.6);
    root.add(st); streamers.push(st);
  }
  const light = new THREE.PointLight(0xc8d0ff, 2.2, 7, 1.2); light.position.set(0, 1.6, 2.2); root.add(light);
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, head, face, pupils, mouth, hands, streamers, light };
}

Object.assign(ETYPES, {
  jintai: { hp: 5, r: 0.35, speed: 1.9, aggro: 99, dmg: 15, build: buildJintai, stepMotion: true,
    deathMsg: 'The model collapses. Its plastic organs scatter across the floor like dropped marbles.' },
  ittan: { hp: 2, r: 0.3, speed: 1.7, aggro: 6.5, dmg: 8, float: true, ghost: true, noPush: true, build: buildIttan,
    deathMsg: 'The cloth goes limp and drifts to the floor: just a strip of old cotton.',
    init(e) { e.trail = []; e.hy = 1.5; for (let i = 0; i < 48; i++) e.trail.push(V3(e.x, 1.5, e.z)); },
    onDying(e, k) { e.m.segs.forEach((s) => { s.scale.setScalar(Math.max(0.01, 1 - k)); s.position.y += 0.01; }); } },
  teke: { hp: 999, r: 0.3, speed: 4.8, aggro: 99, dmg: 22, ghost: true, build: buildTeke,
    onHit(e, kind, kb) {
      if (kind === 'salt' || kind === 'ofuda') { e.state = 'stun'; e.t = 0; e.stunT = 3; kb(2.5); audio.play('scream', e.x, e.z); return; }
      kb(2.2); throttledNote('She doesn\'t stop. She doesn\'t even slow down. Salt might.');
    } },
  okubi: { hp: 999, r: 1.3, speed: 2.6, aggro: 99, dmg: 30, ghost: true, noPush: true, noCollide: true, build: buildOkubi, light: 2.2 * 1.6,
    onHit(e, kind) { if (kind === 'salt') { e.state = 'recoil'; e.t = 0; audio.play('ghostHurt', e.x, e.z); throttledNote('She flinches, just for a moment. RUN.'); } else throttledNote('It\'s like hitting a wall. She is far too big. RUN.'); } },
  rokuro: { hp: 12, r: 0.35, speed: 0.7, aggro: 99, dmg: 18, build: buildRokuro, boss: ['ろくろ首', 'ROKUROKUBI'],
    onHit(e, kind, kb) {
      if (e.state === 'wake') return;
      const hy = e.m.head.position.y;
      if (hy > 1.95 && e.state !== 'stuck') { throttledNote('Her head sways high above you, out of reach. Wait for it to come down.'); return; }
      if (kind === 'salt' || kind === 'ofuda') { e.state = 'stuck'; e.t = 0; e.stuckT = 2.8; e.hp -= 1; audio.play('hiss', e.hx, e.hz); audio.play('ghostHurt', e.hx, e.hz); }
      else { e.hp -= (kind === 'kick' ? 0.5 : 1) * (e.state === 'stuck' ? 2 : 1); audio.play('hit', e.hx, e.hz); audio.play('ghostHurt', e.hx, e.hz); }
      burst(e.hx, hy, e.hz, 10, { color: 0xffe0d0, speed: 2, up: 1, life: 0.4, size: 0.05 });
      if (e.hp <= 0) killRokuro(e);
    },
    onDying(e, k) {
      const m = e.m;
      m.head.position.y = Math.max(0.2, m.head.position.y - 0.05); m.setNeck();
      m.body.rotation.x = -1.4 * k; m.body.position.y = 0.1 * k;
      if (k >= 1) { m.root.position.y = -100; }
    } },
});

// Local ↔ world for things attached to a turned body (three.js rotates +z toward +x for positive y).
function toLocal(e, wx, wz) { const c = Math.cos(e.rot), s = Math.sin(e.rot), dx = wx - e.x, dz = wz - e.z; return [c * dx - s * dz, s * dx + c * dz]; }
function toWorld(e, lx, lz) { const c = Math.cos(e.rot), s = Math.sin(e.rot); return [e.x + c * lx + s * lz, e.z - s * lx + c * lz]; }

Object.assign(AI, {
  jintai(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    const run = e.state === 'chase' || e.state === 'lunge';
    e.walk = (e.walk || 0) + dt * (run ? 9 : 0);
    const s = Math.sin(Math.floor(e.walk * 1.5) / 1.5);
    m.legs[0].rotation.x = s * 0.7; m.legs[1].rotation.x = -s * 0.7;
    m.arms[0].rotation.x = -s * 0.8; m.arms[1].rotation.x = s * 0.8;
    m.head.rotation.z = Math.sin(e.ph * 11) > 0.9 ? 0.4 : 0;
    switch (e.state) {
      case 'wake': m.head.rotation.y = angDiff(e.rot, c.toP) * Math.min(1, e.t * 3); if (e.t > 0.6) { e.state = 'chase'; m.head.rotation.y = 0; } break;
      case 'idle': e.state = 'chase'; break;
      case 'chase': turnTo(e, c.toP, 3, dt); if (c.hunt) moveFwd(e, e.T.speed, dt); if (c.hunt && c.d < 2.0 && e.cd <= 0) { e.state = 'windup'; e.t = 0; } break;
      case 'windup': if (e.t > 0.25) { e.state = 'lunge'; e.t = 0; e.lr = c.toP; } break;
      case 'lunge': e.rot = e.lr; moveFwd(e, 4.2, dt);
        if (c.d < e.T.r + 0.5) { hurtPlayer(e.T.dmg, e.x, e.z); e.state = 'recover'; e.t = 0; e.cd = 1.4; }
        else if (e.t > 0.45) { e.state = 'recover'; e.t = 0; e.cd = 1.0; }
        break;
      case 'recover': if (e.t > 0.5) e.state = 'chase'; break;
      case 'hurt': if (e.t < 0.05) burst(e.x, c.fy + 1.2, e.z, 6, { color: 0xc03030, speed: 1.5, up: 0.5, life: 0.5, size: 0.05, grav: -6 }); if (e.t > 0.35) e.state = 'chase'; break;
      case 'stun': m.head.rotation.y = Math.sin(e.t * 25) * 0.5; if (e.t > e.stunT) { m.head.rotation.y = 0; e.state = 'chase'; } break;
      default: e.state = 'chase';
    }
  },
  ittan(e, dt, c) {
    const m = e.m;
    let sp = 0.6;
    switch (e.state) {
      case 'idle': case 'wake': case 'chase':
        if (c.hunt && c.d < e.aggro) { turnTo(e, c.toP + Math.sin(e.ph * 2.3) * 0.9, 2.6, dt); sp = e.T.speed; if (c.d < 1.7 && e.cd <= 0) { e.state = 'dart'; e.t = 0; e.lr = c.toP; } }
        else turnTo(e, dist2(e.x, e.z, e.homeX, e.homeZ) > 9 ? Math.atan2(e.homeX - e.x, e.homeZ - e.z) : e.rot + Math.sin(e.ph * 0.9) * 2, 1.6, dt);
        break;
      case 'dart':
        e.rot = e.lr; sp = 5;
        if (c.d < 0.6) {
          if (hurtPlayer(e.T.dmg, e.x, e.z)) { player.slowT = 2.2; throttledNote('The cloth wraps around your throat! You can barely move.'); }
          e.state = 'recover'; e.t = 0; e.cd = 1.8;
        } else if (e.t > 0.45) { e.state = 'recover'; e.t = 0; e.cd = 1.2; }
        break;
      case 'recover': sp = 1; if (e.t > 0.6) e.state = 'chase'; break;
      case 'hurt': sp = -1.5; if (e.t > 0.3) e.state = 'chase'; break;
      case 'stun': sp = 0; if (e.t > e.stunT) e.state = 'chase'; break;
      default: e.state = 'chase';
    }
    moveFwd(e, sp, dt);
    e.hy = lerp(e.hy, e.state === 'dart' ? 1.25 : 1.5 + Math.sin(e.ph * 1.7) * 0.35, 1 - Math.exp(-dt * 3));
    const last = e.trail.pop(); last.set(e.x, c.fy + e.hy, e.z); e.trail.unshift(last);
    m.segs.forEach((s, i) => {
      const a = e.trail[Math.min(e.trail.length - 1, i * 3)], b = e.trail[Math.min(e.trail.length - 1, i * 3 + 2)];
      s.position.copy(a); s.position.y += Math.sin(e.ph * 6 - i * 0.7) * 0.06;
      if (a.distanceToSquared(b) > 1e-6) { s.lookAt(b); s.rotateY(Math.PI); }
      s.rotateZ(Math.sin(e.ph * 5 + i * 0.6) * 0.5);
    });
  },
  teke(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    const moving = e.state === 'charge' || e.state === 'retreat';
    e.walk = (e.walk || 0) + dt * (moving ? 16 : 3);
    const s = Math.sin(e.walk);
    m.arms[0].a.rotation.x = -0.9 + s * 0.8; m.arms[1].a.rotation.x = -0.9 - s * 0.8;
    m.arms[0].fore.rotation.x = -0.6 - s * 0.4; m.arms[1].fore.rotation.x = -0.6 + s * 0.4;
    m.torso.position.y = 0.3 + Math.abs(s) * 0.05;
    m.head.rotation.x = -0.2 + Math.sin(e.ph * 2) * 0.05;
    if (moving && Math.sign(s) !== e.lastS) { e.lastS = Math.sign(s); audio.play('teke', e.x, e.z); }
    const farX = player.x < 0 ? 13 : -13;
    switch (e.state) {
      case 'wake': e.state = 'charge'; break;
      case 'idle': case 'lurk': turnTo(e, c.toP, 4, dt); if (c.hunt && e.t > 2.2) { e.state = 'charge'; e.t = 0; } break;
      case 'charge':
        turnTo(e, c.toP, 6, dt); if (c.hunt) moveFwd(e, e.T.speed, dt);
        if (c.hunt && c.d < 0.65) { hurtPlayer(e.T.dmg, e.x, e.z); e.state = 'retreat'; e.t = 0; e.rx = farX; audio.play('giggle', e.x, e.z); }
        break;
      case 'retreat':
        turnTo(e, Math.atan2(e.rx - e.x, -e.z), 8, dt); moveFwd(e, 6, dt);
        if (Math.abs(e.x - e.rx) < 0.8 || e.t > 4) { e.state = 'lurk'; e.t = 0; }
        break;
      case 'stun': m.head.rotation.y = Math.sin(e.t * 22) * 0.4; if (e.t > e.stunT) { m.head.rotation.y = 0; e.state = 'charge'; } break;
      default: e.state = 'charge';
    }
  },
  okubi(e, dt, c) {
    const m = e.m;
    m.root.position.y = 0;
    e.rot = -Math.PI / 2;
    e.z = lerp(e.z, clamp(player.z * 0.25, -0.25, 0.25), 1 - Math.exp(-dt * 2));
    const behind = e.x - player.x;
    let sp = behind > 10 ? 3.2 : behind < 3.5 ? 2.35 : 2.65;
    if (e.state === 'recoil') { sp = -1.5; if (e.t > 1.2) e.state = 'chase'; }
    else if (e.state !== 'chase') { if (e.state === 'wake') { sp = 1.2; if (e.t > 1.4) e.state = 'chase'; } else e.state = 'chase'; }
    if (c.hunt) e.x -= sp * dt;
    e.x = Math.max(e.x, -12.4);
    // crawl: hands plant alternately; the face bobs; the hair streams back
    e.crawl = (e.crawl || 0) + dt * (2.2 + sp * 0.6);
    m.hands.forEach((h, i) => {
      const ph = e.crawl + i * Math.PI, lift = Math.max(0, Math.sin(ph));
      h.position.set(0.95 * (i ? 1 : -1), 0.12 + lift * 0.45, 1.1 + Math.cos(ph) * 0.45);
      if (Math.sign(Math.sin(ph)) !== h.userData.s) { h.userData.s = Math.sign(Math.sin(ph)); if (h.userData.s < 0 && c.hunt) { audio.play('thud'); shake(0.12); } }
    });
    m.head.position.y = 1.45 + Math.sin(e.crawl * 2) * 0.06;
    m.head.rotation.z = Math.sin(e.ph * 0.7) * 0.12;
    m.mouth.scale.y = 1 + Math.max(0, Math.sin(e.ph * 1.3)) * 1.6;
    m.streamers.forEach((st, i) => { st.rotation.x = Math.sin(e.ph * 3 + i) * 0.12; st.rotation.y = Math.sin(e.ph * 2.2 + i * 0.7) * 0.12; });
    const [lx] = toLocal(e, player.x, player.z);
    m.pupils.forEach((p, i) => { p.position.x = (i ? 0.38 : -0.38) + clamp(lx * 0.05, -0.08, 0.08); });
    m.light.intensity = e.T.light * (0.85 + Math.random() * 0.2);
    e.voiceT = (e.voiceT ?? 1) - dt;
    if (e.voiceT <= 0) { e.voiceT = rand(3.5, 5); audio.play('voice', e.x, e.z, 150); if (Math.random() < 0.5) note('「さよ……？　さよ……？」', 2, true); }
    if (c.hunt && behind < 1.9 && e.state === 'chase') {
      if (hurtPlayer(e.T.dmg, e.x, e.z)) { player.kx = -7; player.kz = 0; throttledNote('Her hair pours over you, cold and heavy — and flings you down the corridor.'); }
      e.state = 'recoil'; e.t = 0;
    }
  },
  rokuro(e, dt, c) {
    const m = e.m, H = m.head.position;
    m.root.position.y = c.fy;
    const phase2 = e.hp <= 6;
    const hover = () => V3(Math.sin(e.ph * 0.9) * 0.5, 2.55 + Math.sin(e.ph * 1.3) * 0.25, 0.45);
    const easeTo = (v, k) => H.lerp(v, 1 - Math.exp(-dt * k));
    switch (e.state) {
      case 'wake': {
        if (!e.stung) { e.stung = 1; audio.play('sting'); audio.play('hiss', e.x, e.z); }
        const t = e.t;
        if (t < 0.9) m.head.rotation.y = Math.PI * smooth(t / 0.9);
        else if (t < 2.2) {
          const k = smooth((t - 0.9) / 1.3);
          H.set(0, lerp(1.5, 2.6, k), lerp(0, 0.45, k));
          e.rot = e.rot0 + angDiff(e.rot0, c.toP) * k; m.head.rotation.y = Math.PI * (1 - k);
        } else { e.state = 'stalk'; e.cd = 1.5; m.head.rotation.y = 0; }
        break;
      }
      case 'idle': case 'chase': e.state = 'stalk'; break;
      case 'stalk':
        turnTo(e, c.toP, 1.6, dt);
        if (c.hunt && c.d > 4.2) moveFwd(e, e.T.speed, dt); else if (c.hunt && c.d < 2.6) moveFwd(e, -0.6, dt);
        easeTo(hover(), 3);
        m.mouth.scale.y = 1;
        if (c.hunt && e.cd <= 0) { e.state = phase2 && Math.random() < 0.4 ? 'sweep' : 'rear'; e.t = 0; }
        break;
      case 'rear':
        easeTo(V3(0, 2.95, -0.7), 5); m.mouth.scale.y = 3.5;
        if (e.t < dt * 1.5) audio.play('hiss', e.hx, e.hz);
        if (e.t > (phase2 ? 0.5 : 0.7)) {
          let tx = player.x, tz = player.z; const dx = tx - e.x, dz = tz - e.z, dd = Math.hypot(dx, dz);
          if (dd > 6) { tx = e.x + dx / dd * 6; tz = e.z + dz / dd * 6; }
          e.tgt = toLocal(e, tx, tz); e.from = H.clone(); e.state = 'strike'; e.t = 0; e.bit = false;
        }
        break;
      case 'strike': {
        const k = Math.min(1, e.t / 0.32);
        H.lerpVectors(e.from, V3(e.tgt[0], 1.05, e.tgt[1]), smooth(k));
        if (!e.bit && Math.hypot(e.hx - player.x, e.hz - player.z) < 0.65 && H.y < 1.8) { e.bit = hurtPlayer(e.T.dmg, e.hx, e.hz); }
        if (k >= 1) { e.state = 'stuck'; e.t = 0; e.stuckT = phase2 ? 1.1 : 1.5; audio.play('thud'); }
        break;
      }
      case 'stuck':
        H.y = lerp(H.y, 0.35, 1 - Math.exp(-dt * 8)); m.mouth.scale.y = 1 + Math.abs(Math.sin(e.t * 9)) * 2.5;
        if (e.t > e.stuckT) { e.state = 'retract'; e.t = 0; }
        break;
      case 'retract': easeTo(hover(), 6); if (e.t > 0.6) { e.state = 'stalk'; e.cd = phase2 ? rand(0.8, 1.4) : rand(1.3, 2.1); } break;
      case 'sweep': {
        const a = (e.t / 2.0) * TAU;
        H.set(Math.sin(a) * 2.6, 0.95, Math.cos(a) * 2.6);
        if (Math.hypot(e.hx - player.x, e.hz - player.z) < 0.75) hurtPlayer(14, e.hx, e.hz);
        if (e.t > 2.0) { e.state = 'stuck'; e.t = 0; e.stuckT = 0.9; }
        break;
      }
      case 'stun': e.state = 'stuck'; e.stuckT = e.stunT || 2; break;
      default: e.state = 'stalk';
    }
    m.setNeck();
    [e.hx, e.hz] = toWorld(e, H.x, H.z);
  },
});

function killRokuro(e) {
  F.skeyX = clamp(e.hx ?? e.x, -8.5, 8.5); F.skeyZ = clamp(e.hz ?? e.z, -4.5, 7);
  killEnemy(e);
  bossBar(null);
  G.room.onEnter?.();
  note('Her neck goes slack, and she folds to the floor like a dropped coat. Something small clatters across the boards.', 4);
}

// ── HUD helpers ──
function bossBar(o) {
  const el = $('boss');
  if (!o) { el.hidden = true; return; }
  el.hidden = false;
  el.querySelector('.jp').textContent = o.name; el.querySelector('.en').textContent = o.en;
  el.querySelector('.bar i').style.width = clamp(o.frac, 0, 1) * 100 + '%';
}
let bigT = null;
function bigText(html, secs, red) {
  const el = $('bigtext'); clearTimeout(bigT);
  if (!html) { el.classList.remove('on'); return; }
  el.innerHTML = `<div>${html}</div>`; el.classList.toggle('red', !!red); el.classList.add('on');
  if (secs) bigT = setTimeout(() => el.classList.remove('on'), secs * 1000);
}
async function showStory(lines, hold = 2.8) {
  const el = $('intro');
  el.querySelectorAll('p').forEach((p) => p.remove());
  const ps = lines.map(([jp, en]) => { const p = document.createElement('p'); p.innerHTML = `<span class="jp">${jp}</span><span class="en">${en}</span>`; el.insertBefore(p, el.querySelector('.skip')); return p; });
  el.hidden = false; G.storyOpen = true; G.skip = false;
  for (const p of ps) { if (G.skip) break; p.classList.add('on'); for (let k = 0; k < hold * 10 && !G.skip; k++) await wait(0.1); }
  el.hidden = true; G.storyOpen = false;
}
const CHAPTERS = {
  1: ['第一章　七不思議', 'CHAPTER ONE — THE SEVEN MYSTERIES'],
  2: ['第二章　いない人', 'CHAPTER TWO — THE ONE WHO ISN\'T HERE'],
  3: ['第三章　名前', 'CHAPTER THREE — NAMES'],
  4: ['終章　夜明け', 'FINAL CHAPTER — DAWN'],
};
async function chapterCard(n) {
  if (F['chapter_' + n]) return;
  F['chapter_' + n] = 1;
  const was = G.cutscene; G.cutscene = true;
  const f0 = G.fadeTarget; await fadeTo(0.25, 0.6);
  bigText(`${CHAPTERS[n][0]}<small>${CHAPTERS[n][1]}</small>`, 3.2);
  audio.play('rin');
  await wait(3.6);
  await fadeTo(f0 || 1, 0.8);
  G.cutscene = was;
}

// ── scenes ──
async function loopEvent() {
  G.cutscene = true;
  take('entrancekey');
  audio.play('slide', 0, 4.8);
  await fadeTo(0, 1.2);
  audio.setAmbience(0.02, 0.22, 0);
  await wait(0.6);
  bigText('冷たい夜の空気。<small>Cold night air on your face.</small>', 2.4);
  await wait(3.0);
  audio.play('chime', 0, 0, 5);
  enterRoom('entrance', null, { x: 0, z: 3.7, rot: FACE.N });
  F.loop = 1;
  setCheckpoint();
  await fadeTo(1, 1.6);
  await say('You stepped through the doors, out into the night...');
  await say('...and you are standing in the entrance hall. The same shoe lockers. The same humming vending machine. Behind you, the doors are chained shut again.');
  audio.play('voice', 0, 4.5, 300);
  await say('「まだ、帰れないよ。まだ、だれもあなたをさがしてないもの」', { jp: true, sub: '"You can\'t go home yet. Nobody is even looking for you."' });
  audio.play('shutter', 7, 2.4); G.room.setShutter('east', false, true); shake(0.3);
  await wait(1.4);
  await say('On the east wall, the fire shutter grinds up into the ceiling by itself. Beyond it, a dark passage leads deeper into the ground floor.');
  G.cutscene = false;
  await chapterCard(2);
}

async function infirmaryScare(R) {
  const n = R.nurse;
  n.head.position.set(0, 1.5, 0); n.head.rotation.set(0, 0, 0); n.setNeck();
  await wait(1.2);
  if (G.roomId !== 'infirmary' || F.nurse_seen) return;
  note('Behind the far curtain, someone is sitting on the bed, perfectly still.', 3.5);
  await wait(2.4);
  if (G.roomId !== 'infirmary') return;
  audio.play('hiss', 3, 0.9);
  await tween(2.0, (k) => { n.head.position.set(0, 1.5 + smooth(k) * 1.45, smooth(k) * 0.95); n.head.rotation.x = 0.5 * k; n.setNeck(); });
  audio.play('sting'); shake(0.3);
  note('Her neck keeps growing — up over the curtain rail — and her face tilts down to look at you.', 3.5);
  await wait(1.6);
  await tween(0.35, (k) => { n.head.position.set(0, 2.95 - k * 1.45, 0.95 * (1 - k)); n.setNeck(); });
  audio.play('thud');
  R.bedLight.intensity = 0; n.root.visible = false; F.nurse_seen = 1;
  note('The lamp behind the curtain goes out. The curtain sways. The bed is empty.', 4);
}

async function storeroomScene(R) {
  if (!F.dead_R1) return say('The equipment storeroom. From inside comes a faint knocking — three times — then nothing. You\'ll have to get past the nurse to reach it.');
  if (F.storeroom_seen) {
    G.camOverride = R.storeView;
    await say('Through the gap in the storeroom doors: you, curled up on the gym mats. Still breathing. For now.');
    G.camOverride = null; G.cam = null; return;
  }
  G.cutscene = true;
  await say('The equipment storeroom. A padlock hangs on the outside of the door. From inside, very weakly, someone knocks. Three times.');
  audio.play('knock', 9.8, 5.5);
  await say('You reach for the padlock. Your fingers pass straight through it, as if one of you isn\'t really here.');
  await fadeTo(0, 0.4);
  G.camOverride = R.storeView;
  await fadeTo(1, 0.8);
  await say('Through the gap between the doors, in a stripe of moonlight: a girl in a kendo uniform, curled up on the gym mats. Her lips are blue.');
  audio.play('sting'); shake(0.4); G.flash = 0.5;
  await say('It\'s you.');
  G.camOverride = null; G.cam = null;
  await showStory([
    ['放課後、クラスの子たちが「かごめかごめ、しようよ」と言った。', 'After practice, the girls in my class said, "Let\'s play kagome kagome."'],
    ['目をつぶって、うしろの正面を当てるまで、目を開けちゃだめだって。', 'I had to keep my eyes shut until I guessed who was right behind me.'],
    ['みんなが歌いながら、私の肩を押して歩かせた。階段を、十二、十三……', 'They sang as they steered me by the shoulders. Down the stairs: twelve, thirteen...'],
    ['目を開けたら、倉庫の扉が閉まる音がした。笑い声が遠ざかっていった。', 'When I opened my eyes, the storeroom door slammed, and their laughter faded away.'],
    ['私は、眠ってなんかいなかった。', 'I never fell asleep.'],
  ], 3.2);
  F.storeroom_seen = 1;
  audio.play('voice', 9, 5, 330);
  await say('「わたしのときと、おなじだね」', { jp: true, sub: '"Just like what happened to me."' });
  await say('If no one finds you before morning, you won\'t wake up. Whatever is keeping you here is waiting upstairs, in the seventh mystery.');
  G.cutscene = false;
  await chapterCard(3);
}

async function tekeChase(R) {
  F.teke1 = 1;
  await wait(1.0);
  if (G.roomId !== 'hall3') return;
  for (let i = 0; i < 6; i++) { audio.play('teke', -13, 0); await wait(0.3); }
  note('From the far end of the corridor: teke... teke... teke...', 3);
  await wait(0.5);
  if (G.roomId !== 'hall3') return;
  wake('T1');
  G.camOverride = () => ({ pos: V3(clamp(player.x + 4.6, -12, 13.3), 2.35, -0.95), look: V3(player.x - 4, 0.9, 0.2), fov: 60 });
  note('Something without legs is coming down the corridor on its elbows. Get into a room!', 3.5);
}

async function okubiChase(R, door) {
  F.okubi_started = 1; R.showDesks(true);
  G.cutscene = true;
  if (door === 'library' || door === 'b3') player.rot = FACE.W;
  audio.play('rumble', 0, 0, 3); shake(0.9);
  await wait(0.5);
  audio.play('crash');
  wake('O1');
  const o = G.enemies.find((x) => x.id === 'O1');
  if (o) o.x = door === 'stairs_e' ? 21 : 19;
  G.camOverride = () => ({ pos: V3(clamp(player.x - 5.2, -13.3, 12.5), 2.25, 0.95), look: V3(player.x + 3, 1.35, -0.1), fov: 62 });
  await wait(0.9);
  bigText('「さよ……？」', 1.6, true);
  audio.play('voice', 13, 0, 140);
  await wait(1.2);
  G.cutscene = false;
  bigText('走れ！<small>RUN — the rooftop door is at the west end</small>', 2.2);
}

// ── Kokkuri-san ──
const KANA_COLS = ['わをん', 'らりるれろ', 'やゆよ', 'まみむめも', 'はひふへほ', 'なにぬねの', 'たちつてと', 'さしすせそ', 'かきくけこ', 'あいうえお'];
function buildKokkuriSheet() {
  const el = $('kokkuri');
  if (el.dataset.built) return;
  el.dataset.built = '1';
  el.querySelector('.nums').innerHTML = [...'0123456789'].map((d) => `<span data-c="${d}">${d}</span>`).join('');
  let html = '';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) { const ch = KANA_COLS[c][r] || ''; html += `<span data-c="${ch}">${ch}</span>`; }
  el.querySelector('.kana').innerHTML = html;
  el.querySelector('.yes').dataset.c = 'yes'; el.querySelector('.no').dataset.c = 'no'; el.querySelector('.torii').dataset.c = 'torii';
}
function coinTo(key) {
  const el = $('kokkuri'), sheet = el.querySelector('.sheet'), t = sheet.querySelector(`[data-c="${key}"]`);
  if (!t) return null;
  const a = sheet.getBoundingClientRect(), b = t.getBoundingClientRect();
  const coin = sheet.querySelector('.coin');
  coin.style.left = ((b.left + b.width / 2 - a.left) / a.width * 100) + '%';
  coin.style.top = ((b.top + b.height / 2 - a.top) / a.height * 100) + '%';
  return t;
}
async function spell(path, show) {
  const ans = $('kokkuri').querySelector('.answer'); ans.textContent = '';
  for (const k of path) {
    const t = coinTo(k); audio.play('coin');
    await wait(0.9);
    if (t) { t.classList.add('hot'); setTimeout(() => t.classList.remove('hot'), 450); }
  }
  ans.textContent = show;
  await wait(0.6);
}
const QA = [
  { q: '「わたしは、死んだの？」 Am I dead?', path: ['no', 'ま', 'た'], show: 'いいえ　……まだ', sub: 'No... not yet.' },
  { q: '「あなたは、だれ？」 Who are you?', path: ['さ', 'よ'], show: 'さ　よ', sub: '"Sa... yo." Sayonara? Or a name?' },
  { q: '「七つ目の不思議は？」 What is the seventh mystery?', path: ['し', 'よ', 'こ', '0', '2', '1', '3'], show: 'しょこ　０２１３', sub: '"Archive." Then four numbers: 0, 2, 1, 3. Like the stopped clocks: 2:13.' },
  { q: '「だれか、わたしをさがしてる？」 Is anyone looking for me?', path: ['yes', 'no', 'yes', 'no'], show: 'いいえ', sub: 'The coin drifts toward はい... hesitates... and slides to いいえ. No.' },
];
async function kokkuriScene(R) {
  if (F.kokkuri) return say(F.kokkuri_bad ? 'The Kokkuri-san sheet has been torn in half. The coin is gone.' : 'The Kokkuri-san sheet. The coin rests on the torii, where it belongs.');
  G.cutscene = true;
  await say('Four desks pushed together. On them, a sheet of paper: a red torii, 「はい」 and 「いいえ」, the numbers 0 to 9, and the whole kana table. A ¥10 coin waits on the torii, and four candles are burning.');
  await say('Someone was playing Kokkuri-san here and never finished. A spirit that is called and never sent home stays.');
  const c = await ask('Put your finger on the coin?', ['Put a finger on it', 'Leave it']);
  if (c !== 0) { G.cutscene = false; return; }
  const el = $('kokkuri'); buildKokkuriSheet(); el.querySelector('.answer').textContent = ''; el.hidden = false;
  await wait(0.05); coinTo('torii');
  await say('「こっくりさん、こっくりさん、おいでください」', { jp: true, sub: '"Kokkuri-san, Kokkuri-san, please come."' });
  audio.play('whisper'); coinTo('yes'); await wait(1.3);
  const asked = new Set();
  while (asked.size < QA.length) {
    const left = QA.map((q, i) => i).filter((i) => !asked.has(i));
    const pick = await ask('Ask Kokkuri-san...', left.map((i) => QA[i].q));
    const qi = left[pick]; asked.add(qi);
    await spell(QA[qi].path, QA[qi].show);
    await say(QA[qi].sub);
    coinTo('torii'); await wait(0.5);
  }
  const end = await ask('How do you end it?', ['「お帰りください」 Please go home', 'Take your finger off the coin']);
  if (end === 0) {
    await say('「こっくりさん、こっくりさん、お帰りください」', { jp: true, sub: '"Kokkuri-san, Kokkuri-san, please go home."' });
    coinTo('yes'); await wait(1.1); coinTo('torii'); await wait(1.1);
  } else {
    F.kokkuri_bad = 1;
    coinTo('no'); await wait(0.4); coinTo('わ'); await wait(0.3); coinTo('あ'); await wait(0.3); coinTo('9');
    audio.play('scream'); shake(0.5);
    await say('You lift your finger. The coin keeps moving without you, faster and faster, round and round the sheet.');
  }
  el.hidden = true;
  F.kokkuri = 1; give('kokkurinote');
  R.onEnter();
  if (F.kokkuri_bad) { for (const id of ['W8', 'W9', 'W10']) wake(id); audio.play('sting'); note('The candle flames tear loose and float up into the dark.', 3); }
  else note('The coin slides home to the torii and stops. The candles gutter out, one by one.', 3.5);
  G.cutscene = false;
}

// ── dial padlock ──
function openDial(code) {
  return new Promise((resolve) => {
    const el = $('dial'), wheels = el.querySelector('.wheels');
    const d = G.dial = { vals: [0, 0, 0, 0], sel: 0, code, resolve };
    wheels.innerHTML = '';
    d.els = d.vals.map((v, i) => {
      const w = document.createElement('div'); w.className = 'wheel';
      w.innerHTML = '<button class="up">▲</button><div class="num">0</div><button class="dn">▼</button>';
      w.querySelector('.up').onclick = () => { d.sel = i; dialTurn(1); };
      w.querySelector('.dn').onclick = () => { d.sel = i; dialTurn(-1); };
      wheels.appendChild(w); return w;
    });
    el.querySelector('.dl-sub').textContent = 'The archive door is held by a four-digit dial padlock.';
    el.querySelector('[data-act=open]').onclick = () => dialTry();
    el.querySelector('[data-act=cancel]').onclick = () => dialClose(false);
    el.hidden = false; dialRender();
  });
}
function dialRender() { const d = G.dial; d.els.forEach((w, i) => { w.classList.toggle('sel', i === d.sel); w.querySelector('.num').textContent = d.vals[i]; }); }
function dialTurn(dv) { const d = G.dial; d.vals[d.sel] = (d.vals[d.sel] + dv + 10) % 10; audio.play('kick'); dialRender(); }
function dialTry() {
  const d = G.dial;
  if (d.vals.join('') === d.code) { dialClose(true); return; }
  audio.play('thud');
  $('dial').querySelector('.dl-sub').textContent = 'The shackle doesn\'t move. Wrong number.';
}
function dialClose(ok) { $('dial').hidden = true; const r = G.dial.resolve; G.dial = null; r(ok); }
function dialInput(hit) {
  const d = G.dial;
  if (hit('left')) { d.sel = (d.sel + 3) % 4; dialRender(); }
  if (hit('right')) { d.sel = (d.sel + 1) % 4; dialRender(); }
  if (hit('up')) dialTurn(1);
  if (hit('down')) dialTurn(-1);
  if (hit('interact') || hit('attack')) dialTry();
  if (hit('pause') || hit('inv')) dialClose(false);
}

// ── the school map, from the back of the student handbook ──
const MAP_FLOORS = [
  ['屋上', [['roof', '屋上', 'Roof', 0, 0, 3.2, 2]]],
  ['3F', [['a3', '３年Ａ組', '3-A', 1.6, 0, 2.3, 1], ['class3b', '３年Ｂ組', '3-B', 4.1, 0, 2.2, 1], ['library', '図書室', 'Library', 6.5, 0, 2.2, 1],
    ['archive', '書庫', 'Archive', 8.9, 0, 1.3, 1], ['stairs_e', '東階段', 'E stairs', 10.4, 0, 1.6, 1], ['hall3', '３階廊下', '3F corridor', 0, 1, 12, 1]]],
  ['2F', [['stairs', '西階段', 'W stairs', 0, 0, 1.4, 1], ['classroom', '２年Ａ組', '2-A', 1.6, 0, 2.4, 1], ['toilet', '女子トイレ', 'Lavatory', 4.2, 0, 1.8, 1],
    ['b2', '２年Ｂ組', '2-B', 6.2, 0, 2.3, 1], ['music', '音楽室', 'Music', 10.2, 0, 1.8, 1], ['hall2', '２階廊下', '2F corridor', 0, 1, 12, 1]]],
  ['1F', [['entrance', '昇降口', 'Entrance', 0, 0, 2.6, 2], ['staff', '職員室', 'Staff', 2.8, 0, 2, 1], ['infirmary', '保健室', 'Infirmary', 5, 0, 2, 1],
    ['science', '理科室', 'Science', 7.2, 0, 2, 1], ['gym', '体育館', 'Gym', 9.6, 0, 2.4, 2], ['hall1', '１階廊下', '1F corridor', 2.8, 1, 6.6, 1]]],
];
function openMap() {
  const box = $('map').querySelector('.floors');
  box.innerHTML = MAP_FLOORS.map(([label, rooms]) => `<div class="floor"><span>${label}</span><div class="rooms">${rooms.map(([id, jp, en, x, y, w, h]) => {
    const seen = F['visited_' + id] || G.roomId === id, here = G.roomId === id;
    return `<div class="rm${seen ? ' seen' : ''}${here ? ' here' : ''}" style="left:${x / 12 * 100}%;top:${y * 50}%;width:${w / 12 * 100}%;height:${h * 50}%">${jp}<small>${here ? '現在地 · you' : en}</small></div>`;
  }).join('')}</div></div>`).join('');
  $('map').hidden = false; G.mapOpen = true;
}
function closeMap() { $('map').hidden = true; G.mapOpen = false; }
$('map').addEventListener('click', closeMap);

// ── the archive ──
async function archiveScene(R) {
  if (F.realname) return say('The 1950 register, open on the table. Under the scraped-away paint, her name: 白石 小夜. Shiraishi Sayo.');
  G.cutscene = true;
  await say('A candle is burning on the table, though no one could have lit it. Beside it lies an attendance register from 1950, open at Class 2-A.');
  await say('One line has been painted over with correction fluid, thick and white, as if someone wanted to be very sure.');
  const c = await ask('Scrape the paint away?', ['Scrape it off with your nail', 'Leave it']);
  if (c !== 0) { G.cutscene = false; return; }
  audio.play('coin'); await wait(0.7); audio.play('coin'); await wait(0.7);
  bigText('白石　小夜<small>SHIRAISHI SAYO</small>', 3.4);
  audio.play('rin');
  await wait(3.6);
  F.realname = 1;
  await say('Shiraishi Sayo. Not Hanako. "Hanako" is the name printed on sample forms, the name for a girl who could be anyone. They gave it to her so that her real one would be forgotten.');
  await say('Tucked into the register is a sheet of school paper, yellow and soft with age. A list, in children\'s handwriting.');
  give('oldlist'); showDoc('oldlist');
  G.cutscene = false;
}

// ── the rooftop: kagome kagome, then the long wait for morning ──
const LYRICS = ['かごめ　かごめ', 'かごの　なかの　とりは', 'いつ　いつ　でやる', 'よあけの　ばんに', 'つると　かめが　すべった'];
const ROUND = [{ beat: 0.36, spin: 0.55, win: 2.7 }, { beat: 0.31, spin: 0.85, win: 2.2 }, { beat: 0.27, spin: 1.2, win: 1.9 }];
const CIRCLE = { x: 0, z: 0.6, r: 2.3 };
async function finaleScene(R) {
  if (G.final || G.dawn || F.final_done) return;
  F.final_started = 1;
  G.cutscene = true;
  await chapterCard(4);
  const H = R.hanako;
  await say('She is standing in the middle of the roof with her back to you, humming. Her red skirt stirs in a wind you can\'t feel.');
  await tween(0.8, (k) => { H.root.rotation.y = Math.PI * (1 - k); });
  audio.play('voice', 0, -1.5, 330);
  await say('「来てくれたんだ」', { jp: true, sub: '"You came."' });
  await say('「かごめかごめ、しよう。あの日、みんなは歌の途中でいなくなっちゃったから」', { jp: true, sub: '"Let\'s play kagome kagome. That day, everyone went away before the song was over."' });
  await say('「うしろの正面、だあれ？　あてて。そして、わたしの名前を呼んで」', { jp: true, sub: '"Who is right behind you? Guess — and call me by my name."' });
  await fadeTo(0, 0.5);
  Object.assign(player, { x: CIRCLE.x, z: CIRCLE.z, rot: FACE.S, speed: 0, kx: 0, kz: 0 });
  G.turnOnly = true;
  R.kids = [H];
  for (let i = 0; i < 5; i++) { const k = buildChild(); R.scene.add(k.root); R.kids.push(k); }
  if (!R.decoy) { R.decoy = buildHanako(); R.scene.add(R.decoy.root); }
  R.decoy.root.visible = false;
  G.final = { R, round: 0, wins: 0, phase: 'intro', t: 0, angle: 0, radius: CIRCLE.r, order: [0, 1, 2, 3, 4, 5] };
  placeCircle();
  G.camOverride = { pos: V3(0, 7.4, 6.2), look: V3(0, 0, 0.6), fov: 55 };
  await fadeTo(1, 0.6);
  G.cutscene = false;
  note(isTouch ? 'When the song stops, turn to face whoever is right behind you, and tap 撃.' : 'When the song stops, turn to face whoever is right behind you, and press Space.', 6);
}
function slotAngle(i) { return G.final.angle + i * TAU / 6; }
function placeCircle() {
  const f = G.final;
  f.order.forEach((ki, slot) => {
    const k = f.R.kids[ki], a = slotAngle(slot);
    k.root.visible = true;
    k.root.position.set(CIRCLE.x + Math.sin(a) * f.radius, Math.abs(Math.sin(G.time * 6 + slot)) * 0.05, CIRCLE.z + Math.cos(a) * f.radius);
    k.root.rotation.y = a + Math.PI;
    k.arms.forEach((arm, j) => (arm.rotation.z = (j ? -1 : 1) * 0.9));
  });
}
function facedSlot() {
  let best = 0, bd = 9;
  for (let s = 0; s < 6; s++) { const d = Math.abs(angDiff(player.rot, slotAngle(s))); if (d < bd) { bd = d; best = s; } }
  return [best, bd];
}
function updateFinale(dt) {
  const f = G.final; if (!f || f.busy) return;
  f.t += dt;
  const rd = ROUND[f.round];
  switch (f.phase) {
    case 'intro':
      if (f.t > 1.4) { f.phase = 'sing'; f.t = 0; f.dur = audio.sing(rd.beat) || 9; f.lyric = -1; }
      break;
    case 'sing': {
      f.angle += rd.spin * dt;
      const li = Math.floor(f.t / (f.dur / LYRICS.length));
      if (li !== f.lyric && li < LYRICS.length) { f.lyric = li; bigText(LYRICS[li], f.dur / LYRICS.length * 0.9); }
      if (f.t >= f.dur) { f.phase = 'stop'; f.t = 0; bigText('うしろの　しょうめん　だあれ？<small>WHO IS RIGHT BEHIND YOU?</small>', 2.4, true); G.fadeTarget = 0.08; G.fadeSpeed = 6; }
      break;
    }
    case 'stop':
      if (f.t > 0.4 && !f.swapped) {
        f.swapped = true;
        const behind = player.rot + Math.PI;
        let bs = 0, bd = 9;
        for (let s = 0; s < 6; s++) { const d = Math.abs(angDiff(behind, slotAngle(s))); if (d < bd) { bd = d; bs = s; } }
        f.angle += angDiff(slotAngle(bs), behind);
        const hs = f.order.indexOf(0);
        [f.order[hs], f.order[bs]] = [f.order[bs], f.order[hs]];
        if (f.round === 2) {
          let fs = 0, fd = 9;
          for (let s = 0; s < 6; s++) { const d = Math.abs(angDiff(player.rot, slotAngle(s))); if (d < fd) { fd = d; fs = s; } }
          f.decoySlot = fs;
        }
        audio.play('whisper');
      }
      if (f.t > 0.8) { G.fadeTarget = 1; G.fadeSpeed = 3; f.phase = 'answer'; f.t = 0; }
      break;
    case 'answer':
      if (f.t > rd.win) finaleFail('Too slow.');
      break;
  }
  placeCircle();
  if (f.round === 2 && f.decoySlot !== undefined && (f.phase === 'answer' || f.phase === 'stop')) {
    const k = f.R.kids[f.order[f.decoySlot]], d = f.R.decoy;
    if (k && f.order[f.decoySlot] !== 0) { k.root.visible = false; d.root.visible = true; d.root.position.copy(k.root.position); d.root.rotation.y = k.root.rotation.y; }
  } else if (f.R.decoy) f.R.decoy.root.visible = false;
}
async function finaleAnswer() {
  const f = G.final; if (!f || f.phase !== 'answer' || f.busy) return;
  const [slot, diff] = facedSlot();
  if (f.order[slot] !== 0 || diff > 0.7) return finaleFail(f.round === 2 && slot === f.decoySlot ? 'That one was right in front of you. Not behind.' : 'Wrong child.');
  f.busy = true; f.decoySlot = undefined;
  const calls = ['「花子さん、みーつけた！」', '「花子さん！」', '「小夜ちゃん！」'];
  bigText(calls[f.round], 2, f.round === 2);
  audio.play(f.round === 2 ? 'rin' : 'giggle', f.R.kids[0].root.position.x, f.R.kids[0].root.position.z);
  G.flash = 0.35;
  await wait(1.6);
  f.wins++;
  if (f.round === 0) await say('「みつかっちゃった。……でも、それはわたしの名前じゃないよ」', { jp: true, sub: '"You found me. ...But that isn\'t my name."' });
  if (f.round === 1) await say('「ちがうよ。みんな、そう呼んだの。……もう一回」', { jp: true, sub: '"No. That\'s what they all called me. ...Once more."' });
  if (f.wins >= 3) { f.busy = false; return finaleWin(); }
  f.round++; f.phase = 'intro'; f.t = 0; f.swapped = false; f.busy = false;
}
async function finaleFail(why) {
  const f = G.final; if (!f || f.busy) return;
  f.busy = true;
  bigText(why, 1.4, true);
  audio.play('giggle', player.x + 1, player.z);
  await tween(0.35, (k) => { f.radius = lerp(CIRCLE.r, 0.75, k); placeCircle(); });
  hurtPlayer(15, player.x + Math.sin(player.rot), player.z + Math.cos(player.rot));
  await wait(0.4);
  await tween(0.5, (k) => { f.radius = lerp(0.75, CIRCLE.r, k); placeCircle(); });
  f.phase = 'intro'; f.t = 0; f.swapped = false; f.decoySlot = undefined; f.busy = false;
}
async function finaleWin() {
  const f = G.final, R = f.R;
  f.phase = 'done'; f.busy = true;
  G.cutscene = true;
  for (let i = 1; i < R.kids.length; i++) { const k = R.kids[i]; burst(k.root.position.x, 1, k.root.position.z, 12, { color: 0xc8d0ff, speed: 0.8, up: 1.4, life: 1.2, size: 0.05, grav: 0.6 }); k.root.visible = false; await wait(0.25); }
  R.decoy.root.visible = false;
  const H = R.kids[0];
  H.root.rotation.y = Math.atan2(player.x - H.root.position.x, player.z - H.root.position.z);
  G.camOverride = { pos: V3(2.2, 2.2, CIRCLE.z + 4), look: V3(H.root.position.x * 0.5, 1.0, H.root.position.z * 0.5 + CIRCLE.z * 0.5), fov: 50 };
  await say('「……やっと、呼んでくれた」', { jp: true, sub: '"...At last. Someone called me by my name."' });
  await say('For the first time, you see her face under the heavy fringe. She is just a girl, a little younger than you, and she is smiling.');
  await say('「ありがとう、美咲ちゃん。でも、まだ終わってない。この学校が埋めてきたものが、わたしたちを離さない」', { jp: true, sub: '"Thank you, Misaki. But it isn\'t over. Everything this school ever buried won\'t let go of us."' });
  audio.play('rumble', 0, 0, 5); shake(1.2);
  burst(H.root.position.x, 1, H.root.position.z, 40, { color: 0xffe8c0, speed: 1, up: 2, life: 1.8, size: 0.06, grav: 0.8 });
  H.root.visible = false;
  F.final_done = 1;
  // the gashadokuro climbs the side of the school
  const g = R.gasha || (R.gasha = buildGasha());
  R.scene.add(g.root); g.root.visible = true;
  g.skull.position.set(0, -9, -13.5);
  g.hands.forEach((h, i) => { h.g.position.set(h.side * 5.5, -6, -9); h.state = 'rest'; h.t = 0; });
  G.camOverride = { pos: V3(0, 5.6, 9.4), look: V3(0, 3.0, -5), fov: 66 };
  G.turnOnly = false;
  await tween(3.2, (k) => { g.skull.position.y = lerp(-9, 5.2, smooth(k)); g.hands.forEach((h) => (h.g.position.y = lerp(-6, 4.5, smooth(k)))); updateGashaArms(g); });
  audio.play('slam'); shake(0.8);
  await say('Beyond the fence, something enormous has hauled itself up the side of the school: a skeleton the size of the building, made of everything the school ever buried.');
  audio.play('voice', 0, 0, 360);
  await say('「朝まで、にげて！」', { jp: true, sub: '"Keep away from it until morning!"' });
  if (!R.rings) {
    R.rings = [0, 1].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.65, 28), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = 0.03; r.visible = false; R.scene.add(r); return r; });
    R.sun = new THREE.Mesh(new THREE.CircleGeometry(4, 20), new THREE.MeshBasicMaterial({ color: 0xffb060, fog: false, transparent: true, opacity: 0 }));
    R.sun.position.set(24, -4, 8); R.sun.lookAt(0, 2, 0); R.scene.add(R.sun);
  }
  G.final = null;
  G.dawn = { R, g, t: 0, dur: 45, next: 1.2, which: 0 };
  G.camOverride = () => ({ pos: V3(player.x * 0.35, 6.2, 9.6), look: V3(player.x * 0.5, 1.4, player.z * 0.4 - 3), fov: 64 });
  G.cutscene = false;
}
const SKY_NIGHT = new THREE.Color(0x060a18), SKY_DAWN = new THREE.Color(0xd89878), AMB_NIGHT = new THREE.Color(0x1c2440), AMB_DAWN = new THREE.Color(0x8a6050);
const MOON_C = new THREE.Color(0x8ea6ff), SUN_C = new THREE.Color(0xffb070);
function updateGashaArms(g) {
  g.hands.forEach((h) => {
    const sh = g.skull.position.clone().add(V3(h.side * 3.8, -4.2, 0.8)), wr = h.g.position.clone().add(V3(0, 0.3, -0.7));
    const dir = wr.clone().sub(sh), len = dir.length();
    h.arm.position.copy(sh).add(wr).multiplyScalar(0.5); h.arm.scale.set(1, len, 1);
    h.arm.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.normalize());
  });
}
function updateDawn(dt) {
  const D = G.dawn, R = D.R, g = D.g;
  D.t += dt;
  const k = clamp(D.t / D.dur, 0, 1);
  bossBar({ name: '夜明けまで', en: 'UNTIL DAWN', frac: k });
  R.skyCol.lerpColors(SKY_NIGHT, SKY_DAWN, k * k); R.scene.fog.color.copy(R.skyCol);
  R.skyMat.color.setRGB(1, lerp(1, 0.78, k), lerp(1, 0.66, k)).multiplyScalar(lerp(0.9, 1.4, k));
  R.amb.color.lerpColors(AMB_NIGHT, AMB_DAWN, k);
  R.moonLight.color.lerpColors(MOON_C, SUN_C, k); R.moonLight.intensity = 3.2 * 2.1 * lerp(1, 1.3, k);
  R.moonDisc.material.opacity = 1 - k; R.moonDisc.material.transparent = true;
  R.sun.material.opacity = clamp(k * 1.5 - 0.3, 0, 1); R.sun.position.y = lerp(-5, 3.5, k);
  R.dawnDome.visible = true; R.dawnDome.material.opacity = clamp(k * 1.15 - 0.1, 0, 0.92);
  // the skull breathes and watches
  g.skull.position.y = 5.2 + Math.sin(G.time * 0.8) * 0.3;
  g.skull.rotation.y = clamp(player.x * 0.04, -0.3, 0.3); g.skull.rotation.x = 0.15;
  g.jaw.rotation.x = 0.15 + Math.abs(Math.sin(G.time * 1.7)) * 0.25;
  g.eyes.forEach((e) => e.scale.setScalar(0.8 + Math.random() * 0.5));
  // hands take turns slamming where you're standing
  D.next -= dt;
  if (D.next <= 0) {
    const h = g.hands[D.which]; D.which = 1 - D.which;
    if (h.state === 'rest') {
      const vx = player.speed * Math.sin(player.rot) * 0.45, vz = player.speed * Math.cos(player.rot) * 0.45;
      h.tx = clamp(player.x + vx, -7.2, 7.2); h.tz = clamp(player.z + vz, -6.2, 6.2);
      h.state = 'aim'; h.t = 0; h.from = h.g.position.clone();
      const ring = R.rings[g.hands.indexOf(h)]; ring.position.x = h.tx; ring.position.z = h.tz; ring.visible = true; h.ring = ring;
    }
    D.next = lerp(2.4, 1.15, k);
  }
  for (const h of g.hands) {
    h.t += dt;
    if (h.state === 'aim') {
      const q = smooth(Math.min(1, h.t / 0.85));
      h.g.position.lerpVectors(h.from, V3(h.tx, 5.2, h.tz - 0.3), q);
      h.ring.material.opacity = 0.35 + Math.abs(Math.sin(h.t * (8 + h.t * 10))) * 0.6;
      if (h.t > 0.95) { h.state = 'drop'; h.t = 0; }
    } else if (h.state === 'drop') {
      h.g.position.y = lerp(5.2, 0.3, Math.min(1, h.t / 0.16));
      if (h.t >= 0.16) {
        h.state = 'down'; h.t = 0; h.ring.visible = false;
        audio.play('slam'); shake(0.7);
        burst(h.tx, 0.3, h.tz, 22, { color: 0xb8b0a0, speed: 2.4, up: 1.2, life: 0.7, size: 0.07, grav: -3 });
        if (Math.hypot(player.x - h.tx, player.z - h.tz) < 1.75) hurtPlayer(22, h.tx, h.tz);
      }
    } else if (h.state === 'down') { if (h.t > 0.55) { h.state = 'lift'; h.t = 0; h.from = h.g.position.clone(); } }
    else if (h.state === 'lift') {
      h.g.position.lerpVectors(h.from, V3(h.side * 5.5, 4.5, -9), smooth(Math.min(1, h.t / 0.7)));
      if (h.t > 0.7) { h.state = 'rest'; h.t = 0; }
    } else h.g.position.y = 4.5 + Math.sin(G.time * 1.3 + h.side) * 0.3;
  }
  updateGashaArms(g);
  if (k >= 1) dawnEnd();
}
async function dawnEnd() {
  const D = G.dawn, R = D.R, g = D.g;
  G.dawn = null; G.cutscene = true;
  R.rings.forEach((r) => (r.visible = false));
  bossBar(null);
  audio.play('dawn'); G.flash = 0.7;
  await say('The sun clears the rooftops of the town. Its first light falls across the skull, and the skull begins to crumble like ash in a wind.');
  await tween(3, (q) => {
    g.skull.position.y = 5.2 - q * 6; g.skull.scale.setScalar(1 - q * 0.6);
    g.hands.forEach((h) => { h.g.position.y = 4.5 - q * 8; });
    updateGashaArms(g);
    if (Math.random() < 0.6) burst(rand(-5, 5), rand(2, 8), -12 + rand(-2, 2), 3, { color: 0xd8d0b8, speed: 0.6, up: 1.5, life: 2, size: 0.1, grav: 0.3 });
  });
  g.root.visible = false;
  await say('Somewhere far below you, a door is opening.');
  finishGame();
}

function resetAct2() {
  G.final = null; G.dawn = null; G.tweens = []; G.camOverride = null; G.turnOnly = false; G.storyOpen = false;
  bigText(null); bossBar(null);
  for (const id of ['kokkuri', 'dial', 'map']) $(id).hidden = true;
  G.dial = null; G.mapOpen = false;
  const R = roomCache.roof;
  if (R) {
    (R.kids || []).slice(1).forEach((k) => R.scene.remove(k.root)); R.kids = null;
    if (R.decoy) R.decoy.root.visible = false;
    if (R.gasha) R.gasha.root.visible = false;
    (R.rings || []).forEach((r) => (r.visible = false));
    R.hanako.root.visible = true; R.hanako.root.position.set(0, 0, -1.5); R.hanako.root.rotation.y = Math.PI;
    R.skyCol.copy(SKY_NIGHT); R.scene.fog.color.copy(SKY_NIGHT); R.skyMat.color.setRGB(1, 1, 1);
    R.amb.color.copy(AMB_NIGHT); R.moonLight.color.copy(MOON_C); R.moonLight.intensity = 3.2 * 2.1;
    R.moonDisc.material.opacity = 1; if (R.sun) R.sun.material.opacity = 0;
    R.dawnDome.visible = false; R.dawnDome.material.opacity = 0;
  }
}

function updateAct2(dt, playing) {
  if (!G.paused && !G.invOpen && !G.docOpen && !G.mapOpen && !G.dial) {
    for (const tw of G.tweens.slice()) {
      tw.t += dt; const k = Math.min(1, tw.t / tw.secs); tw.fn(k);
      if (k >= 1) { G.tweens.splice(G.tweens.indexOf(tw), 1); tw.res(); }
    }
  }
  if (!G.dawn) {
    const boss = G.enemies.find((e) => e.T.boss && !e.dormant && e.state !== 'dead' && e.state !== 'dying');
    bossBar(boss ? { name: boss.T.boss[0], en: boss.T.boss[1], frac: boss.hp / boss.T.hp } : null);
  }
  if (G.final && playing) updateFinale(dt);
  if (G.dawn && playing && !G.cutscene) updateDawn(dt);
}
