
// ───────────────────────── rooms, part 4: the east stairs, the third floor, and the roof ─────────────────────────
ROOM_DEFS.stairs_e = () => stairwell('stairs_e', '東階段', 'EAST STAIRWELL', { top: ['hall3', 'stairs_e'], bottom: ['hall2', 'stairs_e'], extra: (R) => {
  R.ball = buildBall(); R.ball.visible = false; R.scene.add(R.ball);
  R.enter = (door) => {
    R.ball.visible = !!F.ball;
    if (F.ball) R.ball.position.set(0.5, 0.12, 3.3);
    if (door === 'bottom' && !F.ball) { F.ball = 1; R.ballT = 0; R.ball.visible = true; R.lastStep = -1; setTimeout(() => note('Something is bouncing down the stairs toward you. One step at a time.', 3.5), 600); }
  };
  R.update = (dt) => {
    if (R.ballT === undefined) return;
    R.ballT += dt;
    const z = Math.min(3.3, -4.2 + R.ballT * 1.1);
    const step = Math.floor((z - R.s0) / R.run);
    if (step !== R.lastStep && z > R.s0 && z < R.s1) { R.lastStep = step; audio.play('bounce', 0.4, z, 0.5); }
    const ph = ((z - R.s0) / R.run) % 1;
    R.ball.position.set(0.4, R.floorY(0, z) + 0.12 + (z < R.s1 ? Math.sin(ph * Math.PI) * 0.22 : 0), z);
    R.ball.rotation.x += dt * 6;
    if (z >= 3.3) R.ballT = undefined;
  };
  R.spot({ id: 'ball', x: 0.5, z: 3.3, r: 0.9, when: () => F.ball && R.ballT === undefined, use: () => say('A child\'s temari ball, wound with red and gold thread. It is warm, as if someone was holding it a moment ago.') });
} });

ROOM_DEFS.hall3 = () => {
  const R = new Room('hall3', { name: '３階 廊下', en: '3F CORRIDOR', surface: 'lino', ambience: [0.15, 0.11, 0], fogNear: 5, fogFar: 22 });
  const x0 = -14, x1 = 14, { z0 } = corridor(R, x0, x1, { exitAt: x0 });
  R.door({ id: 'stairs_e', wall: 'z', at: x1, pos: 0, inner: -1, kind: 'steel', w: 1.2, sign: '東階段', to: 'stairs_e', toDoor: 'top', snd: 'creak' });
  R.door({ id: 'roof', wall: 'z', at: x0, pos: 0, inner: +1, kind: 'steel', w: 1.2, sign: '屋上', to: 'roof', toDoor: 'door', snd: 'creak', lock: 'roofkey',
    lockMsg: 'The door to the rooftop stairs. Locked, with a rusted sign: 「立入禁止」 — "No entry."' });
  R.door({ id: 'a3', wall: 'x', at: z0, pos: -9.5, inner: +1, kind: 'slide', sign: '３年Ａ組', lock: 'never',
    lockMsg: 'Classroom 3-A. Behind the door, many children are chanting very softly: 「かごめ、かごめ」. When you touch the handle, they stop.' });
  R.door({ id: 'b3', wall: 'x', at: z0, pos: -3.5, inner: +1, kind: 'slide', sign: '３年Ｂ組', to: 'class3b', toDoor: 'door', snd: 'slide' });
  R.door({ id: 'library', wall: 'x', at: z0, pos: 5.5, inner: +1, kind: 'slide', w: 1.4, sign: '図書室', to: 'library', toDoor: 'door', snd: 'slide' });
  R.box(2.6, 0.95, 0.03, mat(0xffffff, { map: TEX.art }), 1.2, 1.1, z0 + 0.12);
  R.box(0.7, 0.9, 0.14, M.red, 10, 0.6, z0 + 0.17);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3020, fog: false }));
  lamp.position.set(10, 1.66, z0 + 0.2); R.scene.add(lamp);
  R.point(0xff2a1a, 0.9, 4.5, 10, 1.7, z0 + 0.4);
  // desks the giant woman flings into the corridor when she comes
  R.chaseDesks = [[2.2, 0.55, 0.4], [-2.6, -0.6, -0.6], [-7.2, 0.5, 1.2], [-11.2, -0.55, 0.3]].map(([x, z, ry]) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.set(0, ry, Math.PI / 2 - 0.2);
    const top = new THREE.Mesh(B(0.62, 0.03, 0.45), M.deskTop); top.position.y = 0.36; g.add(top);
    const body = new THREE.Mesh(B(0.58, 0.14, 0.4), M.steel); body.position.set(0, 0.22, 0); g.add(body);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    g.visible = false; R.scene.add(g);
    const c = { x0: 9999, x1: 9999, z0: 9999, z1: 9999, kind: 'furn', box: [x - 0.42, z - 0.38, x + 0.42, z + 0.38] };
    R.colliders.push(c);
    return { g, c };
  });
  R.showDesks = (on) => R.chaseDesks.forEach(({ g, c }) => {
    g.visible = on;
    if (on) [c.x0, c.z0, c.x1, c.z1] = c.box; else c.x0 = c.x1 = c.z0 = c.z1 = 9999;
  });
  R.spot({ id: 'art', x: 1.2, z: z0 + 0.45, r: 1.2, use: () => say('Self-portraits by the first-year class. On every one of them, the face has been scribbled out in black crayon.') });
  R.spot({ id: 'win', x: -6, z: 1.2, r: 1.2, use: () => say('From up here you can see the whole town. Every window is dark. Only the school is awake.') });
  R.enemy({ type: 'teke', id: 'T1', x: -13, z: 0, rot: Math.PI / 2, when: () => false });
  R.enemy({ type: 'okubi', id: 'O1', x: 16.5, z: 0, rot: -Math.PI / 2, when: () => false });
  R.enemy({ type: 'wisp', id: 'W7', x: -6, z: -0.3 });
  R.onEnter = (door) => {
    R.showDesks(!!F.okubi_started);
    if (!F.teke1) tekeChase(R);
    else if (F.roofkey_taken && !F.okubi_done) okubiChase(R, door);
  };
  return R.finalize();
};

ROOM_DEFS.class3b = () => {
  const R = new Room('class3b', { name: '３年Ｂ組', en: 'CLASSROOM 3-B', surface: 'wood', ambience: [0.1, 0.04, 0], fogNear: 6, fogFar: 20 });
  const x0 = -4.5, x1 = 4.5, z0 = -3.5, z1 = 3.5, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.wood }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('x', z0, x0, x1, +1, { win: [-3.6, -1.8, 0, 1.8].map((a) => ({ a, b: a + 1.5, y0: 0.85, y1: 2.6 })), wains: 0.85 });
  R.wall('x', z1, x0, x1, -1, { wains: 0.85 });
  R.wall('z', x0, z0, z1, +1, { wains: 0.85 });
  R.wall('z', x1, z0, z1, -1, { wains: 0.85 });
  R.door({ id: 'door', wall: 'x', at: z1, pos: 3.0, inner: -1, kind: 'slide', to: 'hall3', toDoor: 'b3', snd: 'slide' });
  R.plane(4.6, 1.2, mat(0xffffff, { map: TEX.board3b }), x0 + 0.13, 1.55, 0, Math.PI / 2);
  R.box(0.04, 1.36, 4.76, M.woodDark, x0 + 0.1, 0.87, 0);
  // desks shoved against the walls, chairs upturned on top
  [[3.6, -2.6, 0.3], [3.7, -1.5, -0.2], [3.5, -0.3, 0.1], [2.4, 2.6, 1.6], [1.2, 2.7, 1.4], [-0.2, 2.6, 1.7], [-3.6, 2.5, 0.5], [3.6, 1.1, 2.9]].forEach(([x, z, ry]) => {
    studentDesk(R, x, z, { ry, noChair: true });
    R.box(0.4, 0.03, 0.38, M.chair, x, 0.9, z, { ry: ry + 0.3 });
  });
  // four desks pushed together for Kokkuri-san
  for (const [dx, dz, ry] of [[-0.32, -0.23, 0], [0.32, -0.23, 0], [-0.32, 0.23, Math.PI], [0.32, 0.23, Math.PI]]) studentDesk(R, dx, dz, { ry, noChair: true });
  R.solid(-0.66, -0.5, 0.66, 0.5);
  R.plane(0.9, 0.56, mat(0xffffff, { map: TEX.kokkuri }), 0, 0.738, 0, 0, { rx: -Math.PI / 2, recv: true });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.006, 10), mat(0xb87a40)); coin.position.set(0, 0.745, -0.2); R.scene.add(coin); R.coin = coin;
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb050, fog: false });
  R.candles = [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]].map(([x, z]) => {
    R.cyl(0.025, 0.025, 0.14, 6, M.white, x, 0.735, z);
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 5), flameMat); f.position.set(x, 0.9, z); R.scene.add(f); return f;
  });
  R.candleLights = [R.point(0xffa040, 1.3, 5, -0.4, 1.1, 0, 'lamp'), R.point(0xffa040, 1.3, 5, 0.4, 1.1, 0, 'lamp')];
  R.box(1.2, 0.72, 0.6, M.steel, -3.3, 0, -1.9, { solid: true });
  R.box(1.26, 0.04, 0.66, mat(0x46574a), -3.3, 0.72, -1.9);
  R.ambient(0x1c2440, 0.9);
  R.moon([-2, 10, -16], [0, 0, 0], 2.6, 8);
  R.cam([x0, z0, 0, z1], [4.1, 2.75, 3.1], [-1.5, 0.5, -1.2], 56);
  R.cam([0, z0, x1, z1], [-4.1, 2.75, 3.1], [1.8, 0.5, -1.0], 56);

  R.spot({ id: 'kokkuri', x: 0, z: 0.75, r: 0.8, use: () => kokkuriScene(R) });
  R.spot({ id: 'kokkuri2', x: 0, z: -0.75, r: 0.8, use: () => kokkuriScene(R) });
  R.spot({ id: 'board', x: x0 + 0.6, z: 0, r: 1.4, use: () => say('The class\'s plan for the festival: 「お化け屋敷」, a haunted house. Beside it, in red chalk and a different hand: 「本物」 — "the real thing." The jobs list includes "kagome kagome."') });
  R.spot({ id: 'tdesk', x: -3.3, z: -1.3, r: 1.0, use: async () => {
    if (F.desk3b) return say('The teacher\'s desk. Empty drawers, and a class photo turned face down.');
    F.desk3b = 1;
    await say('In the teacher\'s drawer: a first-aid pouch, and a paper packet of salt from the school kitchen.');
    give('bandage'); give('salt', 2);
  } });
  for (const [i, x, z] of [[8, -2.8, -2.2], [9, 2.4, -2.4], [10, -2.6, 2.0]]) R.enemy({ type: 'wisp', id: 'W' + i, x, z, dormant: true });
  R.onEnter = () => {
    const lit = !F.kokkuri;
    R.candles.forEach((f) => (f.visible = lit));
    R.candleLights.forEach((l) => (l.intensity = lit ? 1.3 * 1.6 : 0));
    R.flickers.forEach((f) => (f.base = lit ? 1.3 * 1.6 : 0));
  };
  return R.finalize();
};

ROOM_DEFS.library = () => {
  const R = new Room('library', { name: '図書室', en: 'LIBRARY', surface: 'wood', ambience: [0.1, 0.05, 0], fogNear: 6, fogFar: 22 });
  const x0 = -6, x1 = 6, z0 = -5, z1 = 5, h = 3.2;
  R.floor(x0, z0, x1, z1, mat(0x7a4a4a, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('z', x1, z0, z1, -1, { h, win: [-4, -1.6, 0.8].map((a) => ({ a, b: a + 1.8, y0: 0.9, y1: 2.7 })), wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { h });
  R.wall('x', z0, x0, x1, +1, { h, wains: 0.9 });
  R.wall('x', z1, x0, x1, -1, { h, wains: 0.9 });
  R.door({ id: 'door', wall: 'x', at: z1, pos: 4, inner: -1, kind: 'slide', w: 1.2, to: 'hall3', toDoor: 'library', snd: 'slide' });
  R.door({ id: 'archive', wall: 'x', at: z0, pos: -4.5, inner: +1, kind: 'steel', w: 1.0, sign: '書庫', to: 'archive', toDoor: 'door', snd: 'creak', dial: '0213' });
  const books = mat(0xffffff, { map: TEX.books });
  for (const z of [-3.0, -1.0, 1.0]) R.box(4.4, 2.1, 0.45, books, -3.4, 0, z, { uv: 2, solid: true });
  R.box(0.4, 2.3, 8, books, x0 + 0.25, 0, 0.4, { uv: 2, solid: true });
  R.box(2.0, 1.0, 0.6, M.wood, 1.4, 0, 3.6, { solid: true });
  R.box(2.04, 0.04, 0.64, M.woodDark, 1.4, 1.0, 3.6);
  R.box(0.34, 0.05, 0.26, mat(0x6a1c1c), 1.2, 1.04, 3.55, { ry: 0.2 });
  for (const z of [-2.4, 0.4]) {
    R.box(2.2, 0.72, 1.1, M.deskTop, 2.9, 0, z, { solid: true });
    for (const [dx, dz, ry] of [[-0.6, -0.8, 0], [0.6, -0.8, 0], [-0.6, 0.8, Math.PI], [0.6, 0.8, Math.PI]]) chairOnly(R, 2.9 + dx, z + dz, ry);
  }
  R.ambient(0x1c2440, 0.95);
  R.moon([15, 10, 1], [0, 0, 0], 2.7, 10);
  R.point(0xffd9a0, 1.0, 4, 1.8, 1.4, 3.5, 'lamp');
  R.cam([x0, z0, -0.8, -2.8], [0.4, 2.8, -4.2], [-5.5, 0.5, -3.7], 58);
  R.cam([x0, -2.8, -0.8, -0.8], [0.4, 2.7, -1.9], [-5.5, 0.5, -1.9], 58);
  R.cam([x0, -0.8, -0.8, 1.2], [0.4, 2.7, 0.1], [-5.5, 0.5, 0.1], 58);
  R.cam([-0.8, z0, x1, 0.6], [5.6, 2.9, 4.6], [-0.5, 0.5, -3], 58);
  R.cam([x0, -5, x1, z1], [-5.6, 3.0, 4.6], [3, 0.5, 0], 58);

  R.spot({ id: 'counter', x: 1.4, z: 3.0, r: 1.1, use: async () => {
    if (!F.yearbook) {
      F.yearbook = 1;
      await say('On the lending counter, a 1950 yearbook lies open, as if someone had just been reading it.');
      give('yearbook'); showDoc('yearbook');
    } else await say('The 1950 yearbook, open at Class 2-A. The homeroom teacher smiles stiffly in the corner: a young man named Kuroda.');
  } });
  R.spot({ id: 'ghostbooks', x: -3.4, z: -2.0, r: 1.2, use: () => say('The shelf of 学校の怪談, school ghost stories, is the most worn in the library. Every book falls open at the same story: Toilet Hanako-san.') });
  R.spot({ id: 'table', x: 2.9, z: -1.6, r: 1.1, use: () => say('Someone has scratched tally marks into the table, in groups of five. Forty-five groups.') });
  R.trigger([x0, -2.6, -1.4, -1.4], async () => {
    if (F.bookdrop) return;
    F.bookdrop = 1;
    audio.play('thud'); shake(0.2);
    note('Behind you, a book slides off the shelf and falls open at a page of children\'s songs: 「うしろの正面だあれ」 — "Who is right behind you?"', 5);
  });
  R.enemy({ type: 'ittan', id: 'I1', x: -3.4, z: 0.0 });
  R.enemy({ type: 'ittan', id: 'I2', x: 3.2, z: -3.6 });
  return R.finalize();
};

ROOM_DEFS.archive = () => {
  const R = new Room('archive', { name: '書庫', en: 'ARCHIVE', surface: 'wood', ambience: [0.08, 0.02, 0], fogNear: 4, fogFar: 14 });
  const x0 = -3, x1 = 3, z0 = -2.5, z1 = 2.5, h = 2.8;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.wood }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  for (const [ax, at, a, b, inn] of [['x', z0, x0, x1, 1], ['x', z1, x0, x1, -1], ['z', x0, z0, z1, 1], ['z', x1, z0, z1, -1]]) R.wall(ax, at, a, b, inn, { h });
  R.door({ id: 'door', wall: 'x', at: z1, pos: 0, inner: -1, kind: 'steel', w: 1.0, to: 'library', toDoor: 'archive', snd: 'creak' });
  const books = mat(0xffffff, { map: TEX.books });
  R.box(0.4, 2.3, 4.4, books, x0 + 0.25, 0, 0, { uv: 2, solid: true });
  R.box(0.4, 2.3, 4.4, books, x1 - 0.25, 0, 0, { uv: 2, solid: true });
  for (let i = 0; i < 7; i++) R.box(0.5, 0.35, 0.4, mat(0x9a7a50), -1.6 + (i % 4) * 0.55, Math.floor(i / 4) * 0.36, z0 + 0.35, { solid: i < 4 });
  R.box(1.4, 0.75, 0.8, M.wood, 0, 0, -0.4, { solid: true });
  R.plane(0.45, 0.35, mat(0xffffff, { map: TEX.register }), -0.2, 0.755, -0.4, 0, { rx: -Math.PI / 2, recv: true });
  R.cyl(0.03, 0.03, 0.12, 6, M.white, 0.45, 0.75, -0.55);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 5), new THREE.MeshBasicMaterial({ color: 0xffb050, fog: false })); fl.position.set(0.45, 0.9, -0.55); R.scene.add(fl);
  R.point(0xffa040, 1.5, 5, 0.45, 1.1, -0.5, 'lamp');
  R.keyGlint = buildGlint(); R.keyGlint.position.set(-1.9, 1.3, z0 + 0.25); R.scene.add(R.keyGlint);
  R.ambient(0x1c2440, 0.7);
  R.cam([-0.8, z0, x1, z1], [2.5, 2.45, 2.2], [-1, 0.5, -1], 62);
  R.cam([x0, z0, -0.8, z1], [2.5, 2.45, -2.1], [-2.2, 0.6, 1], 62);

  R.spot({ id: 'table', x: 0, z: 0.35, r: 0.9, use: () => archiveScene(R) });
  R.spot({ id: 'tin', x: x1 - 0.6, z: -1.2, r: 1.0, use: async () => {
    if (!F.letter) { F.letter = 1; await say('In a biscuit tin on the shelf: a letter, sealed and never sent. It is addressed to 「白石家」 — the Shiraishi family.'); give('letter'); showDoc('letter'); }
    else showDoc('letter');
  } });
  R.spot({ id: 'key', x: -1.9, z: z0 + 0.6, r: 0.9, when: () => !F.roofkey_taken, use: async () => {
    if (!F.realname) return say('On a nail by the boxes hangs a key tagged 屋上, Rooftop. Your hand stops short of it, as if you haven\'t earned it yet. The record book on the table is open.');
    F.roofkey_taken = 1; R.keyGlint.visible = false;
    await say('On a nail by the boxes: a key tagged 屋上 — Rooftop — and tied to it, a child\'s red hair ribbon.');
    give('roofkey');
    await wait(0.4);
    audio.play('rumble', 0, 0, 3); shake(0.4);
    note('Somewhere below, something enormous shifts its weight. The whole school creaks.', 4);
  } });
  R.onEnter = () => { R.keyGlint.visible = !F.roofkey_taken; };
  R.update = (dt) => { if (R.keyGlint.visible) { R.keyGlint.rotation.y += dt * 3; } };
  return R.finalize();
};

ROOM_DEFS.roof = () => {
  const R = new Room('roof', { name: '屋上', en: 'ROOFTOP', surface: 'tile', ambience: [0.07, 0.22, 0], fogNear: 16, fogFar: 70 });
  R.skyCol = new THREE.Color(0x060a18); R.scene.background = R.skyCol; R.scene.fog.color = R.skyCol;
  const x0 = -8, x1 = 8, z0 = -7, z1 = 7;
  R.box(16, 0.1, 14, mat(0xffffff, { map: TEX.concrete }), 0, -0.1, 0, { uv: 2, cast: false });
  for (const [w, d, x, z] of [[16.4, 0.2, 0, z0 - 0.1], [16.4, 0.2, 0, z1 + 0.1], [0.2, 14, x0 - 0.1, 0], [0.2, 14, x1 + 0.1, 0]]) R.box(w, 0.35, d, M.grey, x, 0, z);
  const fence = (len, x, z, ry) => {
    const t = TEX.fence.clone(); t.repeat.set(len / 0.5, 2.4 / 0.5); t.needsUpdate = true;
    const fm = new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
    R.plane(len, 2.4, fm, x, 1.55, z, ry, { dyn: true, cast: true });
  };
  fence(16, 0, z0, 0); fence(16, 0, z1, 0); fence(14, x0, 0, Math.PI / 2); fence(14, x1, 0, Math.PI / 2);
  for (let x = x0; x <= x1; x += 2) { R.cyl(0.04, 0.04, 2.8, 5, M.steelLight, x, 0.3, z0); R.cyl(0.04, 0.04, 2.8, 5, M.steelLight, x, 0.3, z1); }
  for (let z = z0 + 2; z < z1; z += 2) { R.cyl(0.04, 0.04, 2.8, 5, M.steelLight, x0, 0.3, z); R.cyl(0.04, 0.04, 2.8, 5, M.steelLight, x1, 0.3, z); }
  R.solid(x0 - 0.3, z0 - 0.3, x1 + 0.3, z0 + 0.15, 'wall'); R.solid(x0 - 0.3, z1 - 0.15, x1 + 0.3, z1 + 0.3, 'wall');
  R.solid(x0 - 0.3, z0, x0 + 0.15, z1, 'wall'); R.solid(x1 - 0.15, z0, x1 + 0.3, z1, 'wall');
  // the stair housing, with the door we came through
  R.box(2.6, 2.9, 3.2, mat(0xffffff, { map: TEX.plaster }), -6.7, 0, 0, { uv: 2, solid: true });
  R.box(2.8, 0.15, 3.4, M.grey, -6.7, 2.9, 0);
  R.door({ id: 'door', wall: 'z', at: -5.4, pos: 0, inner: +1, kind: 'steel', w: 1.0, to: 'hall3', toDoor: 'roof', snd: 'creak' });
  R.point(0xffe0b0, 0.8, 5, -5.1, 2.5, 0);
  // water tank, air conditioners, a bench
  R.cyl(0.9, 0.9, 1.6, 10, M.steelLight, 5.5, 1.0, -5, { solid: true });
  for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) R.cyl(0.05, 0.05, 1.0, 4, M.steel, 5.5 + dx, 0, -5 + dz);
  R.box(1.1, 0.8, 0.7, M.steelLight, 6.5, 0, 5.8, { solid: true }); R.box(1.1, 0.8, 0.7, M.steelLight, 5.1, 0, 5.8, { solid: true });
  R.box(1.6, 0.45, 0.45, M.wood, -2, 0, 6.3, { solid: true });
  // sky on every side, and a huge moon
  const sky = new THREE.MeshBasicMaterial({ map: TEX.sky, fog: false }); R.skyMat = sky;
  for (const [x, z, ry] of [[0, -40, 0], [0, 40, Math.PI], [-40, 0, Math.PI / 2], [40, 0, -Math.PI / 2]]) R.plane(90, 36, sky, x, 4, z, ry, { dyn: true, recv: false });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), new THREE.MeshBasicMaterial({ color: 0xe8edf8, fog: false }));
  moon.position.set(-14, 16, -34); moon.lookAt(0, 2, 0); moon.visible = false; R.scene.add(moon); R.moonDisc = moon;
  // a sky dome that fades in as the sun comes up
  const dawnTex = canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7f9cd8'); gr.addColorStop(0.55, '#e8b894'); gr.addColorStop(0.75, '#ff9a5a'); gr.addColorStop(1, '#ff8040'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  R.dawnDome = new THREE.Mesh(new THREE.SphereGeometry(32, 16, 12), new THREE.MeshBasicMaterial({ map: dawnTex, side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  R.dawnDome.position.y = -6; R.dawnDome.visible = false; R.scene.add(R.dawnDome);
  R.amb = new THREE.AmbientLight(0x1c2440, 1.2 * 2.6); R.scene.add(R.amb);
  R.moonLight = R.moon([-10, 14, -18], [0, 0, 0], 3.2, 11);
  R.cam([-3, z0, x1, z1], [6.8, 5.2, 6.6], [-1.5, 0.3, -1], 58);
  R.cam([x0, z0, -3, z1], [3.2, 4.4, 6.4], [-5, 0.8, -0.5], 58);

  R.hanako = buildHanako(); R.hanako.root.position.set(0, 0, -1.5); R.hanako.root.rotation.y = Math.PI; R.scene.add(R.hanako.root);
  R.spot({ id: 'hanako', x: 0, z: -1.5, r: 1.6, when: () => !F.final_started || F.final_retry, use: () => finaleScene(R) });
  R.trigger([-3, -4.5, 3, 1.2], () => { if (!F.final_started) finaleScene(R); });
  R.onEnter = () => { F.okubi_done = 1; R.hanako.root.visible = !F.final_done; };
  return R.finalize();
};
