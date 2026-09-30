
// ───────────────────────── rooms, part 2: music room, stairwell, entrance hall, staff room ─────────────────────────
function chairOnly(R, x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const ca = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(B(w, h, d), m); b.position.set(px, py + h / 2, pz); g.add(b); };
  ca(0.42, 0.03, 0.4, M.chair, 0, 0.42, 0); ca(0.42, 0.3, 0.03, M.chair, 0, 0.56, 0.2);
  for (const sx of [-0.19, 0.19]) for (const sz of [-0.17, 0.19]) ca(0.025, 0.42, 0.025, M.steel, sx, 0, sz);
  ca(0.2, 0.02, 0.3, M.chair, 0.24, 0.62, -0.05);                // fold-down writing tablet
  g.updateMatrixWorld(true);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; R.statics.push(m); } });
  R.solid(x - 0.24, z - 0.22, x + 0.3, z + 0.22);
}
function officeDesk(R, x, z, facing, clutter = true) {
  R.box(1.0, 0.7, 0.7, M.steelLight, x, 0, z, { solid: true });
  R.box(1.04, 0.03, 0.74, mat(0x3f4a46), x, 0.7, z);
  if (!clutter) return;
  const r = Math.random();
  if (r < 0.4) { R.box(0.4, 0.34, 0.38, M.cream, x + 0.2, 0.73, z); R.plane(0.3, 0.22, new THREE.MeshBasicMaterial({ map: TEX.crt }), x + 0.2, 0.92, z + 0.195 * facing, facing > 0 ? 0 : Math.PI); }
  else if (r < 0.8) { for (let i = 0; i < 3; i++) R.box(0.26, 0.04 + Math.random() * 0.12, 0.34, M.paper, x - 0.25 + i * 0.05, 0.73 + 0, z + rand(-0.08, 0.08), { ry: rand(-0.2, 0.2) }); }
  R.cyl(0.04, 0.035, 0.09, 6, [M.white, M.red, M.grey][Math.floor(Math.random() * 3)], x - 0.3, 0.73, z + 0.2 * facing);
}
function officeChair(R, x, z, ry) {
  R.cyl(0.03, 0.03, 0.4, 5, M.steel, x, 0.05, z);
  R.box(0.44, 0.08, 0.44, M.dark, x, 0.43, z);
  R.box(0.44, 0.5, 0.06, M.dark, x - Math.sin(ry) * 0.2, 0.55, z - Math.cos(ry) * 0.2, { ry });
  R.solid(x - 0.24, z - 0.24, x + 0.24, z + 0.24);
}

ROOM_DEFS.music = () => {
  const R = new Room('music', { name: '音楽室', en: 'MUSIC ROOM', surface: 'wood', ambience: [0.09, 0.04, 0], acoustics: 'room', fogNear: 7, fogFar: 22 });
  const x0 = -5, x1 = 5, z0 = -4, z1 = 4, h = 3.2;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.wood }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  const win = [-4, -1.9, 0.2, 2.3].map((a) => ({ a, b: a + 1.6, y0: 0.9, y1: 2.7 }));
  R.wall('x', z1, x0, x1, -1, { h, win, wains: 0.9 });
  R.wall('x', z0, x0, x1, +1, { h, wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { h, wains: 0.9 });
  R.wall('z', x1, z0, z1, -1, { h, wains: 0.9 });
  R.door({ id: 'door', wall: 'z', at: x0, pos: 2.6, inner: +1, kind: 'slide', w: 1.2, to: 'hall2', toDoor: 'music', snd: 'slide' });
  R.box(4.4, 1.1, 0.06, mat(0xffffff, { map: TEX.staffboard }), -1.3, 0.95, z0 + 0.13);
  R.box(4.56, 1.26, 0.04, M.woodDark, -1.3, 0.87, z0 + 0.1);
  // composers along the wall, whose eyes will light up
  R.eyes = [];
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, fog: false });
  [-3.4, -2.2, -1.0, 0.2, 1.4].forEach((x, i) => {
    R.box(0.5, 0.66, 0.04, mat(0xffffff, { map: TEX.portraits[i] }), x, 2.2, z0 + 0.13);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(B(0.035, 0.018, 0.01), eyeMat); e.position.set(x + s * 0.045, 2.6, z0 + 0.16); e.visible = false; R.scene.add(e); R.eyes.push(e); }
  });
  // grand piano, keyboard facing west
  const px = 2.8, pz = -1.8;
  R.box(1.5, 0.32, 2.0, M.black, px, 0.62, pz, { solid: true });
  for (const [dx, dz] of [[-0.6, -0.85], [-0.6, 0.85], [0.6, 0]]) R.cyl(0.05, 0.04, 0.62, 6, M.black, px + dx, 0, pz + dz);
  R.box(0.24, 0.05, 1.36, M.white, px - 0.86, 0.8, pz);
  for (let i = 0; i < 9; i++) R.box(0.12, 0.03, 0.05, M.black, px - 0.82, 0.85, pz - 0.6 + i * 0.15);
  R.box(0.06, 0.25, 1.4, M.black, px - 0.74, 0.85, pz);
  const lid = new THREE.Group(); lid.position.set(px, 0.95, pz - 1.0); lid.rotation.x = -0.55; R.scene.add(lid);
  const lm = new THREE.Mesh(B(1.46, 0.03, 1.96), M.black); lm.position.set(0, 0, 0.98); lm.castShadow = true; lid.add(lm);
  const prop = new THREE.Mesh(B(0.02, 0.9, 0.02), M.steel); prop.position.set(0.3, 0.2, 1.3); lid.add(prop);
  R.box(0.36, 0.46, 0.8, M.black, px - 1.3, 0, pz, { solid: true });
  // rows of chairs facing the board
  for (const z of [-0.3, 0.9, 2.1]) for (const x of [-3.6, -2.5, -1.4, -0.3, 0.8]) chairOnly(R, x, z, 0);
  for (const [x, z] of [[1.3, -0.6], [0.3, -2.8]]) { R.cyl(0.012, 0.012, 1.1, 4, M.steel, x, 0, z); R.box(0.45, 0.3, 0.02, M.steel, x, 1.05, z, { ry: 0.3 }); }
  R.box(0.9, 0.72, 0.55, M.wood, -4.2, 0, -2.9, { solid: true });
  R.box(0.3, 0.02, 0.22, M.paper, -4.1, 0.72, -2.85, { ry: 0.2 });
  // the red umbrella in the corner (a prop until it wakes)
  R.umb = new THREE.Group(); R.umb.position.set(4.45, 0, -3.45); R.umb.rotation.z = 0.18;
  const cm = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.0, 8), new THREE.MeshLambertMaterial({ map: TEX.wagasa, flatShading: true })); cm.position.y = 0.55; cm.rotation.x = Math.PI; R.umb.add(cm);
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), M.woodDark); hd.position.y = 1.15; R.umb.add(hd);
  R.scene.add(R.umb);
  R.salt = morijio(R, -4.45, 1.6);

  R.ambient(0x1c2440, 1.0);
  R.moon([3, 9, 15], [0, 0, 0], 2.9, 9);
  R.cam([-5, -4, 0.5, 4], [4.6, 2.9, 3.6], [-2, 0.6, -1], 55);
  R.cam([0.5, -4, 5, 4], [-4.6, 2.9, 3.6], [2.6, 0.6, -1.8], 55);

  R.spot({ id: 'piano', x: px - 1.1, z: pz, r: 1.2, use: async () => {
    if (F.ofuda) return say('The piano is silent now. Scratched into the lid: 「最後まで弾くな」 "Never play it to the end."');
    await say('The piano is playing. The keys sink and rise under no one\'s fingers, over and over, the same children\'s tune.');
    const c = await ask('Pasted inside the open lid is a strip of old paper. Reach in and take it?', ['Take it', 'Leave it']);
    if (c !== 0) return;
    F.ofuda = 1;
    audio.pianoStop(true);
    shake(0.5);
    give('ofuda');
    await say('An ofuda: a shrine talisman inked in vermilion. As it comes away, the piano slams one enormous chord and goes silent.');
    for (const e of R.eyes) e.visible = true;
    audio.play('sting');
    R.umb.visible = false;
    wake('K1');
    note('In the corner, the old red umbrella opens a single eye.', 4);
  } });
  R.spot({ id: 'portraits', x: -1.0, z: z0 + 0.6, r: 1.6, use: () => say(F.ofuda
    ? 'Beethoven, Bach, Mozart, Chopin, Taki Rentarō. Every pair of painted eyes is glowing red, and every one is fixed on you.'
    : 'The composers: Beethoven, Bach, Mozart, Chopin and Taki Rentarō. The legend says their eyes follow you around the room. They don\'t. Probably.') });
  R.spot({ id: 'desk', x: -4.2, z: -2.9, r: 1.0, use: async () => {
    if (!F.kuroda) { F.kuroda = 1; await say('The music teacher\'s desk. Mr. Kuroda\'s handwriting on a sheet of staff paper, pressed hard enough to tear it.'); give('kuroda'); showDoc('kuroda'); }
    else await say('Mr. Kuroda\'s desk. A metronome ticks once, then stops.');
  } });
  R.spot({ id: 'salt', x: -4.45, z: 1.6, r: 0.9, when: () => !F.salt_music, use: async () => {
    F.salt_music = 1; R.salt.visible = false;
    await say('Another cone of morijio just inside the door. Someone was very worried about what might come through it.');
    give('salt', F.hard ? 1 : 2);
    await hardPencil('music');
  } });
  R.spot({ id: 'board', x: -1.3, z: z0 + 0.5, r: 1.0, use: () => say('A melody in chalk on the staff lines. Underneath: 「最後まで弾いてはいけない」 "It must never be played to the end."') });
  R.spot({ id: 'umb', x: 4.3, z: -3.3, r: 1.0, when: () => !F.ofuda, use: () => say('An old red paper umbrella, a wagasa, leaning in the corner. Its paper looks almost warm.') });
  R.enemy({ type: 'umbrella', id: 'K1', x: 4.2, z: -3.2, dormant: true, when: () => F.ofuda });
  R.onEnter = () => {
    R.salt.visible = !F.salt_music;
    for (const e of R.eyes) e.visible = !!F.ofuda;
    R.umb.visible = !F.ofuda;
    if (!F.ofuda) audio.pianoStart(px - 0.5, pz);
  };
  R.onExit = () => audio.pianoStop(false);
  R.update = () => { if (F.ofuda) for (const e of R.eyes) e.material.color.setScalar(0).setRGB(0.7 + Math.sin(G.time * 3) * 0.3, 0.1, 0.05); };
  return R.finalize();
};

// A straight flight of twelve steps between two floors: the upper door at the north landing, the lower at the south.
function stairwell(id, name, en, o) {
  const R = new Room(id, { name, en, surface: 'stair', ambience: [0.13, 0.08, 0], acoustics: 'stair', fogNear: 6, fogFar: 20 });
  const x0 = -1.6, x1 = 1.6, z0 = -5.5, z1 = 5.5, top = 3.0, s0 = -3.5, s1 = 2.0, n = 12, run = (s1 - s0) / n, rise = top / n, H = 6.2;
  Object.assign(R, { x0, x1, z0, z1, top, s0, s1, run, rise });
  R.floorY = (x, z) => (z <= s0 ? top : z >= s1 ? 0 : top - Math.min(n, Math.floor((z - s0) / run) + 1) * rise);
  const stone = mat(0xffffff, { map: TEX.lino });
  R.floor(x0, s0, x1, z1, mat(0xffffff, { map: TEX.floortile }), 1.6);
  R.box(3.2, top, s0 - z0, stone, 0, 0, (z0 + s0) / 2, { uv: 2 });
  for (let i = 0; i < n - 1; i++) {
    const hh = top - (i + 1) * rise;
    R.box(3.2, hh, run + 0.01, stone, 0, 0, s0 + (i + 0.5) * run, { uv: 2 });
    R.box(3.2, 0.03, 0.05, M.steel, 0, hh - 0.02, s0 + (i + 1) * run - 0.02);
  }
  R.box(3.2, 0.03, 0.05, M.steel, 0, top - 0.02, s0 - 0.02);
  R.ceiling(x0, z0, x1, z1, H);
  R.wall('z', x0, z0, z1, +1, { h: H });
  R.wall('z', x1, z0, z1, -1, { h: H, win: [{ a: -2.2, b: -0.2, y0: 2.4, y1: 4.5 }] });
  R.wall('x', z0, x0, x1, +1, { h: H });
  R.wall('x', z1, x0, x1, -1, { h: H });
  R.door({ id: 'top', wall: 'x', at: z0, pos: 0, inner: +1, kind: 'steel', w: 1.2, base: top, to: o.top[0], toDoor: o.top[1], snd: 'creak' });
  R.door({ id: 'bottom', wall: 'x', at: z1, pos: 0, inner: -1, kind: 'steel', w: 1.2, to: o.bottom[0], toDoor: o.bottom[1], snd: 'creak' });
  // handrail down the west wall
  const a = V3(x0 + 0.1, top + 0.9, s0), b = V3(x0 + 0.1, 0.9, s1), dir = b.clone().sub(a);
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, dir.length(), 5), M.woodDark);
  rail.position.copy(a).add(b).multiplyScalar(0.5); rail.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.normalize()); R.put(rail, {});
  const exitMat = new THREE.MeshLambertMaterial({ map: TEX.exit, emissive: 0xffffff, emissiveMap: TEX.exit, emissiveIntensity: 1.2 });
  R.box(0.44, 0.22, 0.04, exitMat, 0, 2.4, z1 - 0.13, { cast: false });
  R.point(0x30ff80, 0.45, 3.5, 0, 2.3, z1 - 0.5);
  R.plane(0.6, 0.8, mat(0xffffff, { map: TEX.notice }), x0 + 0.12, top + 1.4, -4.4, Math.PI / 2);
  R.ambient(0x1c2440, 1.0);
  R.moon([14, 12, -1], [0, 2, 0], 3.0, 8);
  R.cam([x0, z0, x1, -0.5], [1.05, 2.3, 5.1], [0, 3.3, -4.5], 60);
  R.cam([x0, -0.5, x1, z1], [-1.05, 5.7, -5.2], [0, 0.4, 3.5], 60);
  R.onEnter = (door) => { R.cameFromTop = door === 'top'; R.enter?.(door); };
  o.extra?.(R);
  return R.finalize();
}

ROOM_DEFS.stairs = () => stairwell('stairs', '西階段', 'WEST STAIRWELL', { top: ['hall2', 'stairs'], bottom: ['entrance', 'stairs'], extra: (R) => {
  R.trigger([R.x0, 2.0, R.x1, 3.2], async () => {
    if (F.step13 || !R.cameFromTop) return;
    F.step13 = 1;
    G.cutscene = true;
    audio.play('thud'); shake(0.7); audio.play('sting', 0, 0, 0.4);
    await say('You counted the steps on the way down, the way you always do. Ten... eleven... twelve.');
    await say('...and your foot came down on a thirteenth.');
    await say('「……十三段目？」', { jp: true, sub: '...A thirteenth step?', voice: 'v05' });
    await say('For a moment there are hands on your shoulders, steering you, and a girl\'s voice counting the steps for you, laughing. Then nothing.');
    G.cutscene = false;
  });
  R.spot({ id: 'win', x: R.x1 - 0.4, z: -1.2, r: 1.2, use: () => say('Through the window, the moon hangs over the sports ground. Something pale is standing in the middle of the running track, facing the school.') });
  R.enemy({ type: 'wisp', id: 'W3', x: 0, z: -0.8 });
} });

ROOM_DEFS.entrance = () => {
  const R = new Room('entrance', { name: '昇降口', en: 'ENTRANCE HALL', surface: 'tile', ambience: [0.13, 0.1, 0], acoustics: 'hall', fogNear: 7, fogFar: 24 });
  const x0 = -7, x1 = 7, z0 = -5, z1 = 5, h = 3.2;
  R.floor(x0, z0, x1, 2.6, mat(0xffffff, { map: TEX.floortile }), 1.6);
  R.floor(x0, 2.6, x1, z1, mat(0x8a8078, { map: TEX.floortile }), 0.8);
  for (let i = 0; i < 6; i++) R.box(3.0, 0.04, 0.09, M.wood, 0, 0, 1.3 + i * 0.16, { cast: false });
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('x', z1, x0, x1, -1, { h, win: [{ a: -3, b: 3, y0: 0.02, y1: 2.6 }, { a: -6.4, b: -4.2, y0: 1.0, y1: 2.6 }, { a: 4.2, b: 6.4, y0: 1.0, y1: 2.6 }] });
  R.wall('x', z0, x0, x1, +1, { h, wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { h, wains: 0.9 });
  R.wall('z', x1, z0, z1, -1, { h, wains: 0.9 });
  for (const x of [-1.5, 1.5]) R.box(0.06, 2.6, 0.1, mat(0x9aa0a6), x, 0, z1);
  for (const x of [-0.12, 0.12]) R.box(0.03, 0.5, 0.05, M.steel, x, 0.8, z1 - 0.1);
  for (let i = 0; i < 7; i++) R.box(0.06, 0.04, 0.03, M.steel, -0.2 + i * 0.065, 1.0 + (i % 2) * 0.03, z1 - 0.14, { ry: i % 2 ? 0.8 : -0.8 });
  R.box(0.12, 0.14, 0.05, mat(0x8a7a40), 0, 0.88, z1 - 0.16);
  R.door({ id: 'stairs', wall: 'x', at: z0, pos: -5.5, inner: +1, kind: 'steel', w: 1.2, sign: '西階段', to: 'stairs', toDoor: 'bottom', snd: 'creak' });
  R.door({ id: 'staff', wall: 'x', at: z0, pos: 3.0, inner: +1, kind: 'slide', w: 1.1, sign: '職員室', to: 'staff', toDoor: 'door', snd: 'slide', lock: 'staffkey',
    lockMsg: 'The staff room. Locked. On school days the day-duty student, the 日直, carries this key.' });
  // shoe lockers, getabako, in four ranks with a central aisle
  const shoe = mat(0xffffff, { map: TEX.getabako });
  for (const [a, b, z] of [[-6.3, -1.8, 0.45], [1.8, 6.3, 0.45], [-6.3, -1.8, -1.95], [1.8, 6.3, -1.95]]) R.box(b - a, 1.8, 0.5, shoe, (a + b) / 2, 0, z, { uv: 1.8, solid: true });
  // vending machine, humming
  R.box(0.72, 1.85, 0.95, M.steelLight, 6.55, 0, -3.3, { solid: true });
  R.plane(0.9, 1.8, new THREE.MeshLambertMaterial({ map: TEX.vending, emissive: 0xffffff, emissiveMap: TEX.vending, emissiveIntensity: 0.55 }), 6.18, 0.92, -3.3, -Math.PI / 2);
  R.point(0xdfe8ff, 2.6, 7, 5.8, 1.4, -3.3, 'buzz');
  R.cyl(0.2, 0.17, 0.5, 8, M.steel, 5.2, 0, 4.4, { solid: true });
  for (const [c, dx] of [[0x2a3a5a, -0.07], [0x3a3a3a, 0.06]]) R.cyl(0.02, 0.07, 0.95, 6, mat(c), 5.2 + dx, 0.2, 4.4, { rz: dx });
  R.box(1.6, 0.42, 0.4, M.wood, -6.6, 0, 3.4, { solid: true, ry: Math.PI / 2 });
  R.box(1.8, 1.2, 0.04, mat(0xffffff, { map: TEX.notice }), -1.2, 1.1, z0 + 0.13);
  wallClock(R, 0.8, 2.6, z0 + 0.12, 0);

  R.ambient(0x1c2440, 1.0);
  R.moon([-3, 9, 18], [0, 0, 0], 3.2, 12);
  R.cam([-7, -5, 7, -1.65], [-6.5, 2.9, 1.0], [2.5, 0.4, -4.2], 58);
  R.cam([-7, -1.65, -1.6, 0.2], [0.2, 2.9, -0.75], [-5.5, 0.4, -0.75], 58);
  R.cam([1.6, -1.65, 7, 0.2], [-0.2, 2.9, -0.75], [5.5, 0.4, -0.75], 58);
  R.cam([-7, -1.65, 7, 5], [0, 3.05, -1.3], [0, 0.4, 4.2], 66);

  R.door({ id: 'east', wall: 'z', at: x1, pos: 2.4, inner: -1, kind: 'steel', w: 1.4, to: 'hall1', toDoor: 'west', snd: 'creak', shutter: true, cond: () => F.loop,
    lockMsg: 'A fire shutter, 防火シャッター, has been pulled down across the east passage. It won\'t move an inch.' });
  R.spot({ id: 'doors', x: 0, z: z1 - 0.5, r: 1.5, use: async () => {
    if (F.loop) return say('The chain is back, wound three times through the handles. The doors won\'t open. Not until morning.');
    if (!has('entrancekey')) return say('The main doors are chained through their handles. A heavy padlock holds the chain. The key will be in the staff room.');
    await say('You fit the entrance key into the padlock. It turns stiffly... and the chain slithers to the floor.');
    loopEvent();
  } });
  R.onEnter = () => R.setShutter('east', !F.loop);
  R.update = (dt) => R.updateShutters(dt);
  R.spot({ id: 'shoes', x: -4.0, z: 0.95, r: 1.0, use: async () => {
    if (!F.shoenote) { F.shoenote = 1; await say('Your shoe locker, labelled 橘. Your outdoor shoes aren\'t in it. Someone has hidden them again. In their place is a folded note in a child\'s handwriting.'); give('shoenote'); showDoc('shoenote'); }
    else await say('Your empty shoe locker. If you get out, you\'ll walk home in your indoor shoes. You have before.');
  } });
  R.spot({ id: 'vend', x: 5.9, z: -3.3, r: 1.0, use: async () => {
    if (!F.ramune) { F.ramune = 1; await say('A vending machine, still humming. You find a ¥100 coin in your skirt pocket. Clunk. A bottle of ramune rolls out, ice cold.'); give('ramune'); }
    else await say('The machine hums. Every button now reads 売切 — "sold out".');
  } });
  R.spot({ id: 'board', x: -1.2, z: z0 + 0.4, r: 1.1, use: () => say('The school newspaper. A headline from 1950 has been pinned over this month\'s: 「女子生徒、校内で行方不明」 "Schoolgirl goes missing inside school building."') });
  R.enemy({ type: 'umbrella', id: 'K2', x: 4.4, z: 3.7, aggro: 5 });
  R.enemy({ type: 'wisp', id: 'W4', x: -4.0, z: 3.2 });
  return R.finalize();
};

ROOM_DEFS.staff = () => {
  const R = new Room('staff', { name: '職員室', en: 'STAFF ROOM', surface: 'lino', ambience: [0.11, 0.03, 0], acoustics: 'room', fogNear: 7, fogFar: 22 });
  const x0 = -5, x1 = 5, z0 = -4, z1 = 4, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xa0a8a0, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  const win = [-3.2, -1.0, 1.2].map((a) => ({ a, b: a + 1.8, y0: 0.9, y1: 2.6 }));
  R.wall('z', x1, z0, z1, -1, { h, win });
  R.wall('z', x0, z0, z1, +1, { h });
  R.wall('x', z0, x0, x1, +1, { h });
  R.wall('x', z1, x0, x1, -1, { h });
  R.door({ id: 'door', wall: 'x', at: z1, pos: -3.5, inner: -1, kind: 'slide', w: 1.1, to: 'entrance', toDoor: 'staff', snd: 'slide' });
  // two islands of steel desks, facing each other
  for (const x of [-2.9, -1.85, -0.8]) { officeDesk(R, x, -0.35, -1); officeDesk(R, x, 0.35, 1, x !== -1.85); officeChair(R, x, -1.0, 0); officeChair(R, x, 1.0, Math.PI); }
  for (const x of [1.6, 2.65, 3.7]) { officeDesk(R, x, -0.35, -1); officeDesk(R, x, 0.35, 1, x !== 2.65); officeChair(R, x, -1.0, 0); if (x !== 2.65) officeChair(R, x, 1.0, Math.PI); }
  R.box(0.44, 0.08, 0.44, M.dark, 2.65, 0.43, 1.05); R.box(0.44, 0.5, 0.06, M.dark, 2.65, 0.51, 1.27); R.cyl(0.03, 0.03, 0.4, 5, M.steel, 2.65, 0.05, 1.05);
  // desk lamp on the night-duty teacher's desk
  R.cyl(0.07, 0.08, 0.02, 8, M.dark, 2.95, 0.73, 0.3); R.cyl(0.012, 0.012, 0.35, 4, M.dark, 2.95, 0.75, 0.3);
  R.cyl(0.04, 0.1, 0.1, 8, new THREE.MeshLambertMaterial({ color: 0x2a4a2a, emissive: 0x302000 }), 2.95, 1.06, 0.3);
  R.point(0xffc27a, 2.6, 6, 2.9, 1.0, 0.4, 'lamp');
  R.point(0x6090ff, 0.7, 3, -2.7, 1.1, -0.1);
  R.box(0.5, 0.5, 0.08, mat(0xffffff, { map: TEX.keybox }), -3.2, 1.3, z0 + 0.14);
  R.box(2.4, 1.2, 0.05, mat(0xffffff, { map: TEX.schedule }), 0.8, 1.0, z0 + 0.13);
  wallClock(R, 3.4, 2.5, z0 + 0.12, 0);
  for (const z of [-3.3, -2.35]) R.box(0.5, 1.4, 0.9, M.steelLight, x0 + 0.35, 0, z, { solid: true });
  R.box(0.45, 1.0, 1.0, M.wood, x0 + 0.33, 0, 0.8, { solid: true });
  R.kit = new THREE.Group(); R.kit.position.set(x0 + 0.33, 1.0, 0.8);
  const kb = new THREE.Mesh(B(0.26, 0.2, 0.34), M.white); kb.position.y = 0.1; R.kit.add(kb);
  for (const [w, d] of [[0.02, 0.2], [0.02, 0.06]]) { const c = new THREE.Mesh(B(w + 0.26, 0.02, d), M.red); c.position.y = 0.2; R.kit.add(c); }
  const c2 = new THREE.Mesh(B(0.28, 0.02, 0.06), M.red); c2.position.set(0, 0.2, 0); c2.rotation.y = Math.PI / 2; R.kit.add(c2);
  R.scene.add(R.kit);

  R.ambient(0x1a2036, 1.0);
  R.moon([15, 10, -1], [0, 0, 0], 2.7, 9);
  R.cam([-5, -4, 0.3, 4], [4.6, 2.7, 3.6], [-2.6, 0.6, -1.6], 56);
  R.cam([0.3, -4, 5, 4], [-4.6, 2.7, 3.6], [2.6, 0.6, -1.0], 56);

  R.spot({ id: 'keys', x: -3.2, z: z0 + 0.45, r: 1.0, use: async () => {
    if (F.entrancekey) return say('The key cabinet. One hook is empty now.');
    F.entrancekey = 1;
    await say('A glass-fronted key cabinet. On the hook labelled 「昇降口」, Entrance, the key is still hanging. You take it.');
    give('entrancekey');
    if (!F.noppera_awake && !F.dead_N) { audio.play('creak', 2.65, 1.1); note('Behind you, a chair creaks.', 3); await wait(1.0); wake('N'); }
  } });
  R.spot({ id: 'teacher', x: 2.65, z: 1.35, r: 1.1, when: () => !F.noppera_awake && !F.dead_N, use: async () => {
    await say('A teacher is sitting at the lamp-lit desk with his back to you, perfectly still.');
    await say('「先生…？」', { jp: true, sub: '"Sensei...?"', voice: 'v03' });
    wake('N');
  } });
  R.spot({ id: 'chair', x: 2.65, z: 1.35, r: 1.1, when: () => F.dead_N, use: () => say('A heap of dry leaves on the chair, and a smell like wet fur. Something small, a badger perhaps, scurried away under the desks.') });
  journalDesk(R, -2.1, 0.73, 0.42, -2.2, 1.1, -0.15, 0.7);   // the empty desk, from its west corner
  R.spot({ id: 'log', x: -0.8, z: 0.8, r: 1.0, use: async () => {
    if (!F.dutylog) { F.dutylog = 1; await say('An open notebook on a desk: 「宿直日誌」, the night-duty log.'); give('dutylog'); showDoc('dutylog'); }
    else showDoc('dutylog');
  } });
  R.spot({ id: 'sched', x: 0.8, z: z0 + 0.45, r: 1.2, use: () => say('October\'s calendar. 「13（金）宿直：黒田」 "Fri 13th, night duty: Kuroda." Across the corner, in red: 「顔を見るな」 "Don\'t look at his face."') });
  R.spot({ id: 'kit', x: x0 + 0.6, z: 0.8, r: 1.0, when: () => !F.firstaid, use: async () => {
    F.firstaid = 1; R.kit.visible = false;
    await say('A first-aid kit, 救急箱. You take it.');
    give('firstaid');
  } });
  R.spot({ id: 'crt', x: -2.9, z: -1.0, r: 0.9, use: () => say('A computer, still on. 「C:\\>_」 The cursor blinks as if it\'s waiting for you to type your name.') });
  R.enemy({ type: 'noppera', id: 'N', x: 2.65, z: 1.05, rot: Math.PI, dormant: true, seated: true });
  R.onEnter = () => { R.kit.visible = !F.firstaid; };
  return R.finalize();
};
