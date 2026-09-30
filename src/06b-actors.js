
// ───────────────────────── player, obake, effects ─────────────────────────
const player = { x: 0, z: 0, y: 0, rot: 0, r: 0.28, m: null, walk: 0, speed: 0, kx: 0, kz: 0, atk: null, hurtT: 0, inv: 0, dead: false, deadT: 0, lastStep: 0 };
const flash = new THREE.SpotLight(0xfff0d8, 11, 15, 0.5, 0.55, 1.1);
flash.castShadow = true;
flash.shadow.mapSize.set(512, 512);
flash.shadow.camera.near = 0.2; flash.shadow.camera.far = 15;
flash.shadow.bias = -0.002;
const playerLamp = new THREE.PointLight(0x9aaad0, 2.4, 3.6, 1);
const FLASH_ON = 11, LAMP_ON = 2.4;
let ofudaMesh = null;

const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const turnTo = (e, target, rate, dt) => { e.rot += clamp(angDiff(e.rot, target), -rate * dt, rate * dt); };
const moveFwd = (e, sp, dt) => { e.x += Math.sin(e.rot) * sp * dt; e.z += Math.cos(e.rot) * sp * dt; };
// modern controls: the camera yaw is latched while a direction is held, so reverse-angle cuts don't flip her around
let moveLatch = null;
function relatchMove(rot) { const mv = input.move(); moveLatch = mv.mag > 0.05 ? { a: Math.atan2(mv.x, mv.y), yaw: rot + Math.atan2(mv.x, mv.y) } : null; }

function initPlayer() {
  player.m = buildStudent();
  player.m.shinai.rotation.x = 0.43;
  ofudaMesh = new THREE.Mesh(B(0.07, 0.2, 0.01), new THREE.MeshBasicMaterial({ map: canvasTex(16, 48, (g) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, 16, 48); g.fillStyle = '#b0282c'; g.fillRect(4, 6, 8, 3); g.fillRect(7, 10, 2, 30); g.fillRect(4, 22, 8, 2); }, true) }));
  ofudaMesh.position.set(0, -0.36, 0.05); ofudaMesh.visible = false;
  player.m.arms[0].fore.add(ofudaMesh);
}
function resetPose() {
  const m = player.m;
  m.body.rotation.set(0, 0, 0); m.body.position.y = 0;
  m.torso.rotation.set(0, 0, 0);
  for (const a of m.arms) { a.arm.rotation.set(0, 0, 0); a.fore.rotation.set(0, 0, 0); }
  for (const l of m.legs) l.rotation.set(0, 0, 0);
}

function updatePlayer(dt) {
  const p = player, m = p.m;
  if (p.dead) {
    p.deadT += dt;
    const k = smooth(p.deadT / 0.9);
    m.body.rotation.x = -1.5 * k; m.body.position.y = 0.05 * k;
    m.arms[0].arm.rotation.z = 0.6 * k; m.arms[1].arm.rotation.z = -0.6 * k;
    return;
  }
  p.inv -= dt; p.hurtT = Math.max(0, p.hurtT - dt);
  let fwd = 0, turn = 0;
  if (!G.cutscene && !p.atk && G.mode === 'play') {
    const mv = input.move(), run = input.down('run');
    if (CONTROLS === 'modern') {
      // camera-relative: steer toward the stick direction as seen from the latched camera yaw, no backpedal
      if (mv.mag > 0.05) {
        const a = Math.atan2(mv.x, mv.y);
        if (!moveLatch || Math.abs(angDiff(moveLatch.a, a)) > 0.7) moveLatch = { yaw: camYaw(), a };
        const target = moveLatch.yaw - a;
        turnTo(p, target, 9, dt);
        fwd = (run ? 3.1 : 1.45) * mv.mag * Math.max(0, Math.cos(angDiff(p.rot, target)));
      } else moveLatch = null;
    } else if (mv.analog) {
      turn = -mv.x;
      fwd = mv.y > 0 ? (run ? 3.1 : 1.45) * mv.y : -0.85 * -mv.y;
    } else {
      turn = (input.down('left') ? 1 : 0) - (input.down('right') ? 1 : 0);
      if (input.down('up')) fwd = run ? 3.1 : 1.45;
      else if (input.down('down')) fwd = -0.85;
    }
    if (G.turnOnly) fwd = 0;
    if (p.slowT > 0) fwd *= 0.45;
  }
  p.fwdIntent = fwd > 0.2;                         // walking forward on purpose: checkDoors reads this
  p.slowT = Math.max(0, (p.slowT || 0) - dt);
  p.rot += turn * (fwd > 2 ? 2.2 : 2.8) * dt;
  p.speed = lerp(p.speed, fwd, 1 - Math.exp(-dt * 10));
  p.x += Math.sin(p.rot) * p.speed * dt + p.kx * dt;
  p.z += Math.cos(p.rot) * p.speed * dt + p.kz * dt;
  const kd = Math.exp(-dt * 8); p.kx *= kd; p.kz *= kd;
  pushOut(p, p.r, G.room.colliders);
  p.y = lerp(p.y, G.room.floorY(p.x, p.z), 1 - Math.exp(-dt * 14));

  // walk cycle
  const amp = clamp(Math.abs(p.speed) / 1.45, 0, 1.4);
  if (amp > 0.05) p.walk += dt * (Math.abs(p.speed) > 2 ? 10.5 : 7.4) * Math.sign(p.speed);
  const s = Math.sin(p.walk);
  const armed = G.equipped === 'shinai';
  m.legs[0].rotation.x = s * 0.6 * amp; m.legs[1].rotation.x = -s * 0.6 * amp;
  m.hips.position.y = 0.8 + Math.abs(Math.cos(p.walk)) * 0.035 * amp;
  m.torso.rotation.x = (amp > 1.1 ? 0.18 : 0.02) + (p.hurtT > 0 ? -0.4 * p.hurtT / 0.4 : 0);
  m.torso.rotation.y = 0;
  if (!p.atk) {
    if (armed) {
      m.arms[0].arm.rotation.set(-0.6 + s * 0.05 * amp, 0, 0.3); m.arms[1].arm.rotation.set(-0.6 - s * 0.05 * amp, 0, -0.3);
      m.arms[0].fore.rotation.x = -0.2; m.arms[1].fore.rotation.x = -0.2;
    } else {
      m.arms[0].arm.rotation.set(s * 0.55 * amp, 0, 0.05); m.arms[1].arm.rotation.set(-s * 0.55 * amp, 0, -0.05);
      m.arms[0].fore.rotation.x = -0.35 * amp; m.arms[1].fore.rotation.x = -0.35 * amp;
    }
  } else updateAttack(dt);
  const step = Math.floor(p.walk / Math.PI);
  if (step !== p.lastStep) { p.lastStep = step; if (amp > 0.25) audio.play('step', p.x, p.z, G.room.surface); }

  m.root.position.set(p.x, p.y, p.z);
  m.root.rotation.y = p.rot;
  const fx = Math.sin(p.rot), fz = Math.cos(p.rot);
  flash.position.set(p.x + fx * 0.3, p.y + 1.25, p.z + fz * 0.3);
  flash.target.position.set(p.x + fx * 5, p.y + 0.35, p.z + fz * 5);
  // a soft key light on the camera side, so the heroine always reads against the dark
  const cx = camera.position.x - p.x, cz = camera.position.z - p.z, cl = Math.hypot(cx, cz) || 1;
  playerLamp.position.set(p.x + cx / cl * 1.1, p.y + 1.9, p.z + cz / cl * 1.1);
}

// ── attacks ──
const ATK = {
  kick: { dur: 0.45, hitT: 0.14, range: 1.1, cone: 0.8 },
  shinai: { dur: 0.52, hitT: 0.22, range: 1.65, cone: 1.0 },
  salt: { dur: 0.45, hitT: 0.15, range: 3.3, cone: 0.65 },
  ofuda: { dur: 0.8, hitT: 0.3, range: 2.4, cone: 0.9 },
};
function startAttack() {
  const p = player; if (p.atk || p.dead) return;
  let kind = G.equipped === 'hands' ? 'kick' : G.equipped;
  if (kind === 'salt' && !has('salt')) { note('You\'re out of salt.', 2); equip(has('shinai') ? 'shinai' : 'hands'); return; }
  p.atk = { kind, t: 0, done: false, ...ATK[kind] };
  if (kind === 'shinai' || kind === 'kick') audio.play('swing', p.x, p.z);
  if (kind === 'ofuda') ofudaMesh.visible = true;
}
function updateAttack(dt) {
  const a = player.atk, m = player.m; a.t += dt; const t = a.t;
  const A0 = m.arms[0].arm, A1 = m.arms[1].arm;
  if (a.kind === 'shinai') {
    const ang = t < 0.15 ? lerp(-0.6, -2.9, smooth(t / 0.15)) : t < 0.25 ? lerp(-2.9, -0.3, (t - 0.15) / 0.1) : lerp(-0.3, -0.6, smooth((t - 0.25) / 0.27));
    A0.rotation.set(ang, 0, 0.3); A1.rotation.set(ang, 0, -0.3);
    m.torso.rotation.x = t > 0.15 && t < 0.35 ? 0.15 : 0;
  } else if (a.kind === 'kick') {
    m.legs[1].rotation.x = t < 0.14 ? lerp(0, -1.45, t / 0.14) : lerp(-1.45, 0, smooth((t - 0.14) / 0.31));
    m.torso.rotation.x = -0.15;
  } else if (a.kind === 'salt') {
    A0.rotation.set(t < 0.1 ? lerp(0, 0.9, t / 0.1) : lerp(0.9, -1.7, smooth((t - 0.1) / 0.15)), 0, 0.1);
  } else if (a.kind === 'ofuda') {
    const k = smooth(t / 0.25) * (1 - smooth((t - 0.6) / 0.2));
    A0.rotation.set(-1.5 * k, 0, 0.15 * k); A1.rotation.set(-1.3 * k, 0, -0.25 * k);
  }
  if (!a.done && t >= a.hitT) { a.done = true; resolveAttack(a); }
  if (t >= a.dur) { player.atk = null; ofudaMesh.visible = false; m.legs[1].rotation.x = 0; }
}
function inArc(e, a) {
  const dx = (e.hx ?? e.x) - player.x, dz = (e.hz ?? e.z) - player.z, d = Math.hypot(dx, dz) - (e.hx !== undefined ? 0.25 : e.T.r);
  return d < a.range && Math.abs(angDiff(player.rot, Math.atan2(dx, dz))) < a.cone;
}
let throttleT = 0;
function throttledNote(t) { if (G.time > throttleT) { note(t, 2.5); throttleT = G.time + 3; } }
function resolveAttack(a) {
  const p = player, targets = G.enemies.filter((e) => (e.state !== 'dying' && e.state !== 'dead') && inArc(e, a) && (!e.dormant || e.seated));
  targets.sort((u, v) => dist2(u.x, u.z, p.x, p.z) - dist2(v.x, v.z, p.x, p.z));
  if (a.kind === 'salt') {
    take('salt');
    audio.play('salt', p.x, p.z);
    burst(p.x + Math.sin(p.rot) * 0.4, p.y + 1.2, p.z + Math.cos(p.rot) * 0.4, 26, { color: 0xf4f4ff, speed: 5, dir: p.rot, spread: 0.45, up: 0.6, life: 0.55, size: 0.05, grav: -6 });
    for (const e of targets) hitEnemy(e, 'salt');
    if (!has('salt') && G.equipped === 'salt') equip(has('shinai') ? 'shinai' : 'hands');
    return;
  }
  if (a.kind === 'ofuda') {
    audio.play('rin', p.x, p.z);
    burst(p.x + Math.sin(p.rot) * 0.5, p.y + 1.3, p.z + Math.cos(p.rot) * 0.5, 14, { color: 0xffd8a0, speed: 1.2, up: 1, life: 0.9, size: 0.05, grav: 0.5 });
    if (!targets.length) { note('You hold up the ofuda. Nothing close enough reacts to it.', 2.5); return; }
    hitEnemy(targets[0], 'ofuda');
    return;
  }
  if (!targets.length) return;
  for (const e of a.kind === 'shinai' ? targets.slice(0, 2) : targets.slice(0, 1)) hitEnemy(e, a.kind);
}

function hurtPlayer(dmg, fx, fz) {
  const p = player;
  if (p.inv > 0 || p.dead || G.mode !== 'play' || G.cutscene) return false;
  if (F.hard) dmg = Math.round(dmg * 1.5);         // Nightmare
  G.hp = Math.max(0, G.hp - dmg);
  p.inv = 0.9; p.hurtT = 0.4;
  const dx = p.x - fx, dz = p.z - fz, d = Math.hypot(dx, dz) || 1;
  p.kx = dx / d * 3.5; p.kz = dz / d * 3.5;
  if (p.atk) { p.atk = null; ofudaMesh.visible = false; p.m.legs[1].rotation.x = 0; }
  G.red = 1; shake(0.5); audio.play('hurt');
  updateHUD();
  if (G.hp <= 0) killPlayer();
  return true;
}
async function killPlayer() {
  player.dead = true; player.deadT = 0; G.stats.deaths++;
  setPrompt(null);
  audio.play('sting'); await wait(0.5); audio.play('thud');
  await wait(1.6);
  await fadeTo(0, 1.2);
  showGameOver();
}

// ── obake ──
const ETYPES = {
  lantern: { hp: 3, r: 0.35, speed: 1.25, aggro: 7.5, dmg: 12, float: true, build: buildLantern, light: 2.2 },
  umbrella: { hp: 3, r: 0.35, speed: 1.75, aggro: 6, dmg: 14, build: buildUmbrella },
  wisp: { hp: 1, r: 0.25, speed: 0.85, aggro: 4.5, dmg: 6, float: true, ghost: true, noPush: true, build: buildWisp, light: 1.8 },
  hanako: { hp: 99, r: 0.3, speed: 0.85, aggro: 99, dmg: 20, ghost: true, build: buildHanako },
  noppera: { hp: 6, r: 0.35, speed: 1.05, aggro: 99, dmg: 18, build: buildNoppera },
};
function makeEnemy(s) {
  const T0 = ETYPES[s.type], hard = !!F.hard;       // Nightmare: a per-instance scaled copy (ETYPES itself is never touched)
  const T = hard ? { ...T0, speed: T0.speed * 1.12, hp: T0.hp < 99 ? Math.ceil(T0.hp * 1.5) : T0.hp } : T0, m = T.build();
  const e = { ...s, T, m, hp: T.hp, rot: s.rot ?? rand(-3, 3), state: 'idle', t: 0, ph: rand(0, 10), cd: 1, kx: 0, kz: 0, homeX: s.x, homeZ: s.z,
    aggro: (s.aggro ?? T.aggro) + (hard ? 1.5 : 0), lightBase: T.light || 0, stunT: 0 };
  e.dormant = !!s.dormant && !F['awake_' + s.id];
  if (s.seated && !e.dormant) e.seated = false;
  if (s.standby && !e.dormant) e.standby = false;
  if (!e.dormant && s.dormant) e.state = 'chase';
  T.init?.(e);
  if (e.seated) {
    m.body.position.y = -0.45; m.legs.forEach((l) => (l.rotation.x = -1.5)); m.arms.forEach((a) => (a.rotation.x = -0.9));
  }
  m.root.position.set(e.x, e.dormant && !e.seated && !e.standby ? -100 : G.room.floorY(e.x, e.z), e.z);
  m.root.rotation.y = e.rot;
  if (m.light && e.dormant) m.light.intensity = 0;
  G.room.scene.add(m.root);
  return e;
}
function wake(id) {
  F['awake_' + id] = 1;
  let e = G.enemies.find((x) => x.id === id);
  if (!e) { const s = G.room.spawns.find((x) => x.id === id); if (!s) return; e = makeEnemy(s); G.enemies.push(e); }
  e.dormant = false; e.standby = false; e.state = 'wake'; e.t = 0; e.rot0 = e.rot;
  e.m.root.position.y = G.room.floorY(e.x, e.z);
  if (e.type === 'noppera') F.noppera_awake = 1;
  if (e.type === 'hanako') audio.play('whisper');
}
function killEnemy(e, msg) {
  e.state = 'dying'; e.t = 0;
  F['dead_' + e.id] = 1; G.stats.purified++;
  audio.play('purify', e.x, e.z);
  const col = { lantern: 0xffb060, umbrella: 0xff8080, wisp: 0x9fd0ff, hanako: 0xffffff, noppera: 0xa08050 }[e.type];
  burst(e.x, G.room.floorY(e.x, e.z) + 1.1, e.z, 34, { color: col, speed: 1.4, up: 1.6, life: 1.3, size: 0.06, grav: 0.8 });
  if (msg) note(msg, 3.5);
}
function hitEnemy(e, kind) {
  const kb = (sp) => { const dx = e.x - player.x, dz = e.z - player.z, d = Math.hypot(dx, dz) || 1; e.kx = dx / d * sp; e.kz = dz / d * sp; };
  if (e.dormant && (e.seated || e.standby)) { wake(e.id); return; }
  if (e.T.onHit) return e.T.onHit(e, kind, kb);
  if (e.type === 'wisp') {
    if (kind === 'salt' || kind === 'ofuda') return killEnemy(e);
    throttledNote(kind === 'kick' ? 'Your foot passes through the flame. It doesn\'t even burn.' : 'The shinai passes straight through the flame.');
    return;
  }
  if (e.type === 'hanako') {
    if (kind === 'ofuda') return banishHanako(e);
    if (kind === 'salt') { e.state = 'stun'; e.t = 0; e.stunT = 4; kb(3); audio.play('scream', e.x, e.z); return; }
    throttledNote(kind === 'kick' ? 'Your foot meets nothing but cold air.' : 'The shinai passes through her like smoke. She doesn\'t even flinch.');
    return;
  }
  if (kind === 'ofuda') { e.state = 'stun'; e.t = 0; e.stunT = 2; kb(4); throttledNote('The ofuda flares. The creature recoils, but the talisman isn\'t meant for it.'); return; }
  if (kind === 'salt' && e.type === 'noppera') { e.state = 'stun'; e.t = 0; e.stunT = 2; kb(2); audio.play('ghostHurt', e.x, e.z); return; }
  const dmg = { shinai: 1, kick: 0.5, salt: 2 }[kind] ?? 0;
  e.hp -= dmg; kb(kind === 'kick' ? 2.5 : 3.5);
  audio.play('hit', e.x, e.z); audio.play('ghostHurt', e.x, e.z);
  burst(e.x, G.room.floorY(e.x, e.z) + 1.1, e.z, 8, { color: 0xffe0b0, speed: 2.2, up: 1, life: 0.35, size: 0.04 });
  if (e.hp <= 0) {
    const msgs = { lantern: 'The lantern\'s flame gutters out. It drops to the floor as plain paper.', umbrella: 'The umbrella folds shut with a snap and lies still.', noppera: 'The faceless teacher crumples into a heap of dry leaves.' };
    killEnemy(e, F['msg_' + e.type] ? null : e.T.deathMsg ?? msgs[e.type]);
    F['msg_' + e.type] = 1;
  } else { e.state = 'hurt'; e.t = 0; }
}
async function banishHanako(e) {
  take('ofuda'); if (G.equipped === 'ofuda') equip(has('shinai') ? 'shinai' : 'hands');
  G.cutscene = true;
  G.flash = 0.9; audio.play('scream', e.x, e.z);
  e.state = 'banish'; e.t = 0;
  await wait(1.6);
  F.keyX = clamp(e.x, -2.4, 2.4); F.keyZ = clamp(e.z, -0.6, 2.0);
  killEnemy(e);
  F.hanako_done = 1;
  await wait(1.2);
  await say('「…また、遊んでね」', { jp: true, sub: '"...Play with me again sometime."' });
  G.room.onEnter?.();
  note('Something small clinks onto the tiles.', 3);
  G.cutscene = false;
}

const AI = {
  lantern(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    m.bob.position.y = 1.3 + Math.sin(e.ph * 2.1) * 0.12; m.bob.rotation.z = Math.sin(e.ph * 1.3) * 0.15;
    m.tip.rotation.x = 0.8 + Math.sin(e.ph * 7) * 0.5; m.tongue.rotation.x = Math.sin(e.ph * 3) * 0.25;
    m.light.intensity = e.lightBase * (0.8 + Math.random() * 0.35);
    switch (e.state) {
      case 'idle':
        turnTo(e, dist2(e.x, e.z, e.homeX, e.homeZ) > 4 ? Math.atan2(e.homeX - e.x, e.homeZ - e.z) : e.rot + Math.sin(e.ph * 0.5), 1, dt);
        moveFwd(e, 0.3, dt);
        if (c.hunt && c.d < e.aggro) e.state = 'chase';
        break;
      case 'wake': e.state = 'chase'; break;
      case 'chase':
        turnTo(e, c.toP, 2.6, dt); moveFwd(e, e.T.speed, dt);
        if (c.d < 1.9 && e.cd <= 0 && Math.abs(angDiff(e.rot, c.toP)) < 0.4) { e.state = 'windup'; e.t = 0; }
        if (!c.hunt) e.state = 'idle';
        break;
      case 'windup': moveFwd(e, -0.7, dt); m.bob.scale.setScalar(1 + e.t * 0.5); if (e.t > 0.4) { e.state = 'lunge'; e.t = 0; e.lr = c.toP; m.bob.scale.setScalar(1); } break;
      case 'lunge':
        e.rot = e.lr; moveFwd(e, 4.2, dt);
        if (c.d < e.T.r + 0.45) { hurtPlayer(e.T.dmg, e.x, e.z); e.state = 'recover'; e.t = 0; e.cd = 1.5; }
        else if (e.t > 0.42) { e.state = 'recover'; e.t = 0; e.cd = 1.0; }
        break;
      case 'recover': moveFwd(e, -0.5, dt); if (e.t > 0.6) e.state = 'chase'; break;
      case 'hurt': m.bob.rotation.x = Math.sin(e.t * 30) * 0.3; if (e.t > 0.4) { m.bob.rotation.x = 0; e.state = 'chase'; } break;
      case 'stun': m.bob.rotation.z = Math.sin(e.t * 20) * 0.4; if (e.t > e.stunT) e.state = 'chase'; break;
    }
  },
  umbrella(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    const lunging = e.state === 'lunge';
    if (e.state !== 'stun' && e.state !== 'hurt') {
      e.hop = (e.hop || 0) + dt / (lunging ? 0.5 : 0.62);
      if (e.hop >= 1) { e.hop -= 1; if (c.d < 14) audio.play('geta', e.x, e.z); }
    }
    const air = (e.hop || 0) < 0.6, f = (e.hop || 0) / 0.6;
    m.hop.position.y = air ? Math.sin(f * Math.PI) * (lunging ? 0.6 : 0.32) : 0;
    m.hop.scale.y = air ? 1.04 : 0.93;
    m.leg.rotation.x = air ? -0.25 : 0.15;
    m.canopy.rotation.y += dt * (air ? 2.5 : 0.4);
    m.tongue.rotation.x = 0.6 + Math.sin(e.ph * 8) * 0.3;
    switch (e.state) {
      case 'idle':
        if (air) { turnTo(e, dist2(e.x, e.z, e.homeX, e.homeZ) > 3 ? Math.atan2(e.homeX - e.x, e.homeZ - e.z) : e.rot + Math.sin(e.ph * 0.6) * 1.5, 1.5, dt); moveFwd(e, 0.45, dt); }
        if (c.hunt && c.d < e.aggro) e.state = 'chase';
        break;
      case 'wake': e.state = 'chase'; break;
      case 'chase':
        turnTo(e, c.toP, 3, dt); if (air) moveFwd(e, e.T.speed, dt);
        if (c.d < 2.1 && e.cd <= 0) { e.state = 'lunge'; e.t = 0; e.lr = c.toP; e.hop = 0; }
        if (!c.hunt) e.state = 'idle';
        break;
      case 'lunge':
        e.rot = e.lr; if (air) moveFwd(e, 3.8, dt);
        if (c.d < e.T.r + 0.45) { hurtPlayer(e.T.dmg, e.x, e.z); e.state = 'recover'; e.t = 0; e.cd = 1.6; }
        else if (e.t > 0.5) { e.state = 'recover'; e.t = 0; e.cd = 1.0; }
        break;
      case 'recover': if (e.t > 0.5) e.state = 'chase'; break;
      case 'hurt': m.hop.rotation.z = Math.sin(e.t * 30) * 0.25; if (e.t > 0.4) { m.hop.rotation.z = 0; e.state = 'chase'; } break;
      case 'stun': m.hop.rotation.z = Math.sin(e.t * 18) * 0.3; if (e.t > e.stunT) { m.hop.rotation.z = 0; e.state = 'chase'; } break;
    }
  },
  wisp(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    m.core.position.y = 1.15 + Math.sin(e.ph * 1.7) * 0.15;
    m.ball.scale.setScalar(1 + Math.sin(e.ph * 13) * 0.08 + Math.random() * 0.06);
    m.halo.scale.setScalar(1.1 + Math.sin(e.ph * 7) * 0.12);
    m.tail.rotation.z = Math.sin(e.ph * 5) * 0.3;
    m.light.intensity = e.lightBase * (0.75 + Math.random() * 0.35);
    if (c.hunt && c.d < e.aggro) { turnTo(e, c.toP, 2, dt); moveFwd(e, e.T.speed, dt); }
    else { turnTo(e, dist2(e.x, e.z, e.homeX, e.homeZ) > 6 ? Math.atan2(e.homeX - e.x, e.homeZ - e.z) : e.rot + Math.sin(e.ph * 0.7) * 2, 1.2, dt); moveFwd(e, 0.35, dt); }
    if (c.hunt && c.d < 0.6 && e.cd <= 0 && hurtPlayer(e.T.dmg, e.x, e.z)) e.cd = 1.0;
  },
  hanako(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy + 0.03 + Math.sin(e.ph * 2) * 0.02;
    m.head.rotation.z = Math.sin(e.ph * 0.9) * 0.35;
    const reach = e.state === 'stun' ? -2.6 : c.d < 2.2 ? -1.35 : 0;
    for (const a of m.arms) a.rotation.x = lerp(a.rotation.x, reach, 1 - Math.exp(-dt * 4));
    switch (e.state) {
      case 'wake':
        e.rot = c.toP; e.z = lerp(e.z, -0.3, 1 - Math.exp(-dt * 1.6));
        if (e.t > 1.4) { e.state = 'chase'; e.tp = rand(5, 8); }
        break;
      case 'idle': e.state = 'chase'; e.tp = rand(5, 8); break;
      case 'chase':
        turnTo(e, c.toP, 4, dt);
        if (c.hunt) moveFwd(e, e.T.speed, dt);
        e.tp -= dt;
        if (c.hunt && e.tp <= 0 && c.d > 2.6) { e.state = 'vanish'; e.t = 0; }
        if (c.hunt && c.d < 0.8 && e.cd <= 0 && hurtPlayer(e.T.dmg, e.x, e.z)) { e.cd = 2.1; audio.play('voice', e.x, e.z, 250); }
        break;
      case 'vanish':
        m.root.visible = Math.floor(e.t * 22) % 2 === 0;
        if (e.t > 0.5) {
          const a = player.rot + rand(-2.2, 2.2);
          e.x = player.x + Math.sin(a) * 1.9; e.z = player.z + Math.cos(a) * 1.9;
          e.x = clamp(e.x, -2.6, 2.6); e.z = clamp(e.z, -0.6, 2.2);
          m.root.visible = true; e.state = 'chase'; e.tp = rand(5, 9); audio.play('whisper');
        }
        break;
      case 'stun': moveFwd(e, -0.6, dt); if (e.t > e.stunT) e.state = 'chase'; break;
      case 'banish': m.root.visible = Math.random() < 0.7; m.root.position.y += e.t * 0.3; for (const a of m.arms) a.rotation.x = -2.8; break;
      default: e.state = 'chase';
    }
  },
  noppera(e, dt, c) {
    const m = e.m;
    m.root.position.y = c.fy;
    switch (e.state) {
      case 'wake': {
        const t = e.t;
        if (!e.stung) { e.stung = 1; audio.play('sting'); }
        if (t < 0.9) { m.head.rotation.y = lerp(0, angDiff(e.rot, c.toP), smooth(t / 0.9)); e.headTurn = m.head.rotation.y; }
        else if (t < 1.9) {
          const k = smooth((t - 0.9) / 1.0);
          m.body.position.y = lerp(-0.45, 0, k);
          m.legs.forEach((l) => (l.rotation.x = lerp(-1.5, 0, k)));
          m.arms.forEach((a) => (a.rotation.x = lerp(-0.9, -1.4, k)));
          e.rot = e.rot0 + angDiff(e.rot0, c.toP) * k; m.head.rotation.y = e.headTurn * (1 - k);
          if (!e.noted) { e.noted = 1; note('He turns his head all the way around. Where his face should be, there is nothing at all.', 4); }
        } else { e.state = 'chase'; e.seated = false; m.head.rotation.y = 0; e.cd = 0.8; }
        break;
      }
      case 'chase': {
        turnTo(e, c.toP, 2.2, dt); moveFwd(e, e.T.speed, dt);
        e.walk = (e.walk || 0) + dt * 6.5; const s = Math.sin(e.walk);
        m.legs[0].rotation.x = s * 0.5; m.legs[1].rotation.x = -s * 0.5;
        m.arms.forEach((a, i) => (a.rotation.x = -1.45 + Math.sin(e.walk + i) * 0.08));
        m.head.rotation.z = Math.sin(e.ph * 1.5) * 0.12;
        if (c.hunt && c.d < 2.4 && e.cd <= 0) { e.state = 'windup'; e.t = 0; }
        break;
      }
      case 'windup': m.torso.rotation.x = -0.3 * smooth(e.t / 0.35); if (e.t > 0.35) { e.state = 'lunge'; e.t = 0; e.lr = c.toP; m.torso.rotation.x = 0.25; } break;
      case 'lunge':
        e.rot = e.lr; moveFwd(e, 3.3, dt);
        if (c.d < e.T.r + 0.5) { hurtPlayer(e.T.dmg, e.x, e.z); e.state = 'recover'; e.t = 0; e.cd = 1.8; }
        else if (e.t > 0.55) { e.state = 'recover'; e.t = 0; e.cd = 1.2; }
        break;
      case 'recover': m.torso.rotation.x = lerp(m.torso.rotation.x, 0, 1 - Math.exp(-dt * 6)); if (e.t > 0.7) e.state = 'chase'; break;
      case 'hurt': m.torso.rotation.x = -0.3; if (e.t > 0.35) { m.torso.rotation.x = 0; e.state = 'chase'; } break;
      case 'stun': m.head.rotation.y = Math.sin(e.t * 25) * 0.4; if (e.t > e.stunT) { m.head.rotation.y = 0; e.state = 'chase'; } break;
      default: e.state = 'chase';
    }
  },
};

function updateEnemies(dt, playing) {
  for (const e of G.enemies) updateEnemy(e, dt, playing);
}
function updateEnemy(e, dt, playing) {
  const p = player, m = e.m, T = e.T;
  e.t += dt; e.ph += dt; e.cd -= dt;
  if (e.state === 'dead') return;
  const fy = G.room.floorY(e.x, e.z);
  if (e.state === 'dying') {
    const k = Math.min(1, e.t / 1.2);
    if (T.onDying) { T.onDying(e, k, dt); if (k >= 1) e.state = 'dead'; return; }
    m.root.scale.setScalar(Math.max(0.001, 1 - k)); m.root.rotation.y += dt * 8; m.root.position.y = fy + k * 0.9;
    if (m.light) m.light.intensity = e.lightBase * (1 - k);
    if (k >= 1) { e.state = 'dead'; m.root.position.y = -100; if (m.light) m.light.intensity = 0; }
    return;
  }
  const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 0.001;
  if (e.dormant) {
    if (e.seated || e.standby) { m.head.rotation.z = Math.sin(e.ph * 0.8) * 0.03; if (playing && d < (e.wakeDist ?? 1.25) && !G.cutscene && !p.dead) wake(e.id); }
    return;
  }
  const hunt = playing && !p.dead && !G.cutscene;
  e.x += e.kx * dt; e.z += e.kz * dt;
  const kd = Math.exp(-dt * 7); e.kx *= kd; e.kz *= kd;
  AI[e.type](e, dt, { d, toP: Math.atan2(dx, dz), hunt, fy });
  if (!T.noCollide) pushOut(e, T.r, G.room.colliders, T.float || T.ghost ? (b) => b.kind === 'wall' : null);
  const nd = Math.hypot(p.x - e.x, p.z - e.z), minD = T.r + p.r;
  if (nd < minD && nd > 0.001 && !T.noPush) { const k = (minD - nd) / nd; e.x -= (p.x - e.x) * k; e.z -= (p.z - e.z) * k; }
  if (m.worldSpace) { m.root.position.set(0, 0, 0); m.root.rotation.y = 0; return; }
  if (T.stepMotion) { e.smT = (e.smT || 0) - dt; if (e.smT > 0) return; e.smT = 0.085; }  // stop-motion jerkiness
  m.root.position.x = e.x; m.root.position.z = e.z;
  m.root.rotation.y = e.rot;
}

// ── particles ──
const fx = { group: new THREE.Group(), pool: [] };
function initFx() {
  for (let i = 0; i < 140; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.visible = false; fx.group.add(s);
    fx.pool.push({ s, life: 0, max: 1, v: new THREE.Vector3(), g: 0 });
  }
}
function burst(x, y, z, n, o = {}) {
  const { color = 0xffffff, speed = 2, up = 1, life = 0.8, size = 0.07, dir = null, spread = Math.PI, grav = -2 } = o;
  for (let i = 0; i < n; i++) {
    const p = fx.pool.find((q) => q.life <= 0); if (!p) break;
    if (dir !== null) { const a = dir + rand(-spread, spread), sp = speed * rand(0.5, 1); p.v.set(Math.sin(a) * sp, rand(-0.2, 1) * up, Math.cos(a) * sp); }
    else p.v.set(rand(-1, 1), rand(0, 1) * up, rand(-1, 1)).multiplyScalar(speed * rand(0.4, 1));
    p.life = p.max = life * rand(0.6, 1.2); p.g = grav;
    p.s.material.color.set(color); p.s.scale.setScalar(size * rand(0.7, 1.3)); p.s.position.set(x, y, z); p.s.visible = true;
  }
}
function updateFx(dt) {
  for (const p of fx.pool) {
    if (p.life <= 0) continue;
    p.life -= dt;
    p.s.position.addScaledVector(p.v, dt); p.v.y += p.g * dt;
    p.s.material.opacity = Math.max(0, p.life / p.max);
    if (p.life <= 0) p.s.visible = false;
  }
}
