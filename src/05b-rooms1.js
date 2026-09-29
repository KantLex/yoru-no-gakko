
// ───────────────────────── rooms, part 1: classroom, corridor, lavatory ─────────────────────────
const ROOM_DEFS = {};
const plaster = () => mat(0xffffff, { map: TEX.plaster });

ROOM_DEFS.classroom = () => {
  const R = new Room('classroom', { name: '２年Ａ組', en: 'CLASSROOM 2-A', surface: 'wood', ambience: [0.12, 0.04, 0], fogNear: 7, fogFar: 22 });
  const x0 = -4.5, x1 = 4.5, z0 = -3.5, z1 = 3.5, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.wood }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  const win = [-3.1, -1.3, 0.5, 2.3].map((a) => ({ a, b: a + 1.5, y0: 0.85, y1: 2.6 }));
  R.wall('z', x0, z0, z1, +1, { win, wains: 0.85 });
  R.wall('z', x1, z0, z1, -1, { wains: 0.85 });
  R.wall('x', z0, x0, x1, +1, { wains: 0.85 });
  R.wall('x', z1, x0, x1, -1, { wains: 0.85 });
  R.door({ id: 'front', wall: 'z', at: x1, pos: -2.6, inner: -1, kind: 'slide', to: 'hall2', toDoor: 'a_front', snd: 'slide' });
  R.door({ id: 'back', wall: 'z', at: x1, pos: 2.6, inner: -1, kind: 'slide', to: 'hall2', toDoor: 'a_back', snd: 'slide' });
  // blackboard, chalk tray, stopped clock, speaker
  R.box(5.2, 1.2, 0.06, mat(0xffffff, { map: TEX.blackboard }), 0, 0.95, z0 + 0.13);
  R.box(5.36, 1.36, 0.04, M.woodDark, 0, 0.87, z0 + 0.1);
  R.box(5.2, 0.04, 0.14, M.steelLight, 0, 0.9, z0 + 0.2);
  wallClock(R, 0, 2.55, z0 + 0.12, 0);
  R.box(0.42, 0.3, 0.16, M.cream, 3.4, 2.3, z0 + 0.18);
  // teacher's steel desk with a green top
  R.box(1.2, 0.7, 0.6, M.steel, 0, 0, -2.55, { solid: true });
  R.box(1.26, 0.04, 0.66, mat(0x46574a), 0, 0.7, -2.55);
  R.box(0.24, 0.03, 0.32, mat(0x23315e), 0.2, 0.74, -2.55);
  // twenty desks, one chair pulled out and turned
  const cols = [-3.2, -1.95, -0.7, 0.55, 1.8], rows = [-1.3, -0.3, 0.7, 1.7];
  for (const c of cols) for (const r of rows) studentDesk(R, c, r, c === -1.95 && r === 0.7 ? { chairOut: true, chairRot: 0.8 } : {});
  // white chrysanthemums on a desk: what a class does when a classmate dies
  R.cyl(0.05, 0.04, 0.2, 6, mat(0xcfd9e2), 0.55, 0.73, -0.3);
  for (let i = 0; i < 5; i++) R.box(0.06, 0.06, 0.06, mat(0xf2f2ea), 0.55 + rand(-0.06, 0.06), 0.93 + rand(0, 0.08), -0.3 + rand(-0.06, 0.06));
  // cubbies along the back, notice board above
  R.box(6.4, 1.0, 0.45, M.wood, 0.6, 0, z1 - 0.33, { solid: true });
  R.plane(6.3, 0.95, mat(0xffffff, { map: TEX.lockers }), 0.6, 0.5, z1 - 0.565, Math.PI);
  R.box(2.4, 1.0, 0.04, mat(0xffffff, { map: TEX.notice }), -2.2, 1.35, z1 - 0.13);
  for (const x of [-2.5, 0, 2.5]) for (const z of [-1.5, 1.5]) fluorescentFixture(R, x, z, h, 1.3, false);

  R.ambient(0x1c2440, 1.1);
  R.moon([-16, 10, 3], [0, 0, 0], 2.8, 9);
  R.cam([1.6, 0.4, 4.5, 3.5], [-1.4, 2.75, -2.7], [3.4, 0.5, 2.5], 58);
  R.cam([1.6, -3.5, 4.5, 0.4], [-1.4, 2.75, 3.1], [3.4, 0.5, -2.5], 58);
  R.cam([-4.5, 0.4, 1.6, 3.5], [4.1, 2.75, -3.1], [-2.2, 0.4, 2.0], 55);
  R.cam([-4.5, -3.5, 1.6, 0.4], [-4.1, 2.75, 3.1], [1.2, 0.5, -2.2], 55);

  R.spot({ id: 'mydesk', x: -3.2, z: 1.7, use: async () => {
    if (!F.onigiri) { F.onigiri = 1; await say('Your desk by the window. Your bag still hangs on its hook.'); give('onigiri'); give('handbook'); await say('Inside: the onigiri you never finished at lunch, and your student handbook, with the school map in the back.'); }
    else await say('Your desk. Scratched into the corner, very small: 「消えろ」 — "Disappear." You stopped seeing it weeks ago.');
  } });
  R.spot({ id: 'yuki', x: -1.95, z: 1.7, use: async () => {
    if (!F.note7) { F.note7 = 1; await say('Yuki\'s desk. A notebook pokes out of the drawer: "The Seven Mysteries of Seiran High."'); give('note7'); showDoc('note7'); }
    else await say('Yuki\'s desk. Yuki used to save you a seat at lunch. Not since the summer.');
  } });
  R.spot({ id: 'vase', x: 0.55, z: -0.3, use: () => say('A vase of white chrysanthemums on a desk. That\'s what a class does when a student has died. The name label on the desk reads 花子 — Hanako.') });
  R.spot({ id: 'tdesk', x: 0, z: -2.55, r: 1.1, use: () => say('The attendance book. Beside every name for October 13th, a neat red circle: present. Beside yours, in pencil, someone has written 「いない人」 — "the one who isn\'t here."') });
  R.spot({ id: 'board', x: 0, z: -3.1, r: 1.3, use: () => say('「自習」 — "Self-study." In the day-duty column on the right, in careful chalk: 日直 花子. There is no Hanako in this class. Above the board, the clock has stopped at 2:13.') });
  R.spot({ id: 'window', x: -4.1, z: 0, r: 1.3, use: () => say('The school gate is shut. Past it, the town is completely dark. Not one streetlight, not one window.') });
  R.spot({ id: 'cubby', x: 2.3, z: 2.75, r: 1.0, use: async () => {
    if (F.shinai) return say('Your cubby. Textbooks and a gym bag.');
    F.shinai = 1;
    await say('Your cubby. Your kendo shinai is still here in its cloth bag. The bamboo feels solid in your hands.');
    give('shinai'); equip('shinai');
    await wait(0.6);
    audio.play('slide', 4.2, 2.6);
    await wait(0.7);
    wake('L1');
    audio.play('sting');
    note('The back door rattles open. Something glowing drifts in...', 4);
  } });
  R.enemy({ type: 'lantern', id: 'L1', x: 3.8, z: 2.6, dormant: true });
  return R.finalize();
};

ROOM_DEFS.hall2 = () => {
  const R = new Room('hall2', { name: '２階 廊下', en: '2F CORRIDOR', surface: 'lino', ambience: [0.14, 0.09, 0], fogNear: 6, fogFar: 22 });
  const x0 = -14, x1 = 14, z0 = -1.5, z1 = 1.5, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  const win = []; for (let a = -13; a < 12.5; a += 2.6) win.push({ a, b: a + 2.0, y0: 0.9, y1: 2.6 });
  R.wall('x', z1, x0, x1, -1, { win, wains: 0.9 });
  R.wall('x', z0, x0, x1, +1, { wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { wains: 0.9 });
  R.wall('z', x1, z0, z1, -1, { wains: 0.9 });
  const stuck = 'Classroom 2-B. The door won\'t move. Something heavy is leaning against it from the inside, and it is breathing.';
  R.door({ id: 'a_front', wall: 'x', at: z0, pos: -10, inner: +1, kind: 'slide', sign: '２年Ａ組', to: 'classroom', toDoor: 'front', snd: 'slide' });
  R.door({ id: 'a_back', wall: 'x', at: z0, pos: -5.2, inner: +1, kind: 'slide', to: 'classroom', toDoor: 'back', snd: 'slide' });
  R.door({ id: 'toilet', wall: 'x', at: z0, pos: 1.0, inner: +1, kind: 'steel', color: 0x8a7078, w: 0.9, sign: '女子トイレ', to: 'toilet', toDoor: 'door', snd: 'creak' });
  R.door({ id: 'b_front', wall: 'x', at: z0, pos: 5.2, inner: +1, kind: 'slide', sign: '２年Ｂ組', lock: 'never', lockMsg: stuck });
  R.door({ id: 'b_back', wall: 'x', at: z0, pos: 10.2, inner: +1, kind: 'slide', lock: 'never', lockMsg: stuck });
  R.door({ id: 'stairs', wall: 'z', at: x0, pos: 0, inner: +1, kind: 'steel', w: 1.2, sign: '西階段', to: 'stairs', toDoor: 'top', snd: 'creak' });
  R.door({ id: 'music', wall: 'z', at: x1, pos: 0, inner: -1, kind: 'slide', w: 1.2, sign: '音楽室', to: 'music', toDoor: 'door', snd: 'slide' });
  // emergency exit sign over the stairs, the only green in the building
  const exitMat = new THREE.MeshLambertMaterial({ map: TEX.exit, emissive: 0xffffff, emissiveMap: TEX.exit, emissiveIntensity: 1.2 });
  R.box(0.04, 0.22, 0.44, exitMat, x0 + 0.13, 2.4, 0, { cast: false });
  R.point(0x30ff80, 0.5, 4, x0 + 0.5, 2.4, 0);
  // fire hydrant cabinet with its red lamp
  R.box(0.7, 0.9, 0.14, M.red, 7.6, 0.6, z0 + 0.17);
  R.box(0.5, 0.05, 0.02, M.white, 7.6, 1.2, z0 + 0.25);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3020, fog: false }));
  lamp.position.set(7.6, 1.66, z0 + 0.2); R.scene.add(lamp);
  R.point(0xff2a1a, 0.9, 4.5, 7.6, 1.7, z0 + 0.4);
  R.cyl(0.08, 0.08, 0.5, 8, M.red, -7.3, 0, z0 + 0.22);
  R.box(1.6, 1.1, 0.04, mat(0xffffff, { map: TEX.notice }), -1.8, 1.1, z0 + 0.13);
  // hand-washing trough
  R.box(1.6, 0.8, 0.45, M.steelLight, 3.0, 0, z0 + 0.33, { solid: true });
  for (const dx of [-0.5, 0, 0.5]) R.cyl(0.02, 0.02, 0.15, 5, M.steel, 3.0 + dx, 0.95, z0 + 0.2);
  // lost-and-found umbrellas
  R.cyl(0.18, 0.15, 0.45, 8, M.steel, 6.4, 0, z0 + 0.35, { solid: true });
  [[0x2a3a5a, -0.06], [0x5a2a2a, 0.05], [0x2a2a2a, 0.0]].forEach(([c, dx], i) => R.cyl(0.02, 0.07, 0.95, 6, mat(c), 6.4 + dx, 0.2, z0 + 0.35 + (i - 1) * 0.06, { rz: dx }));
  R.door({ id: 'stairs_e', wall: 'x', at: z0, pos: 12.7, inner: +1, kind: 'steel', w: 1.1, sign: '東階段', to: 'stairs_e', toDoor: 'bottom', snd: 'creak',
    shutter: true, lock: 'shutterkey', stayAfterUnlock: true,
    lockMsg: 'The east stairs. A fire shutter, 防火シャッター, is pulled down across them. There is a keyhole in the control box beside it.',
    unlockMsg: 'You turn the key in the shutter\'s control box. With a grinding roar, the fire shutter begins to roll up into the ceiling.',
    onUnlock: () => { audio.play('shutter', 12.7, z0); R.setShutter('stairs_e', false, true); } });
  for (let x = -12; x <= 12; x += 4) fluorescentFixture(R, x, 0, h, 1.3, true);

  R.ambient(0x1c2440, 1.0);
  R.moon([6, 10, 16], [0, 0, 0], 2.8, 16);
  R.cam([-14, -1.5, -7, 1.5], [-6.2, 2.7, 1.2], [-13.5, 0.9, -0.4], 58);
  R.cam([-7, -1.5, -0.5, 1.5], [0.8, 2.7, 1.25], [-6, 0.6, -0.8], 55);
  R.cam([-0.5, -1.5, 6, 1.5], [-1.9, 2.7, -1.25], [5, 0.6, 0.6], 55);
  R.cam([6, -1.5, 14, 1.5], [5.2, 2.7, 1.25], [13.8, 0.8, -0.3], 55);

  R.salt = morijio(R, 1.9, z0 + 0.35);
  R.spot({ id: 'salt', x: 1.9, z: z0 + 0.35, r: 0.9, when: () => !F.salt_hall, use: async () => {
    F.salt_hall = 1; R.salt.visible = false;
    await say('A small cone of salt on a saucer beside the lavatory door. Morijio — salt set out to keep spirits from crossing a threshold. You scoop it into a handkerchief.');
    give('salt', 2);
  } });
  R.spot({ id: 'sink', x: 3.0, z: z0 + 0.4, use: () => say('The taps are dry. One of them drips anyway. The drops look red in the hydrant light... no, just rust.') });
  R.spot({ id: 'board', x: -1.8, z: z0 + 0.3, r: 1.1, use: () => say('The corridor notice board. 「廊下を走るな！」 "No running in the corridor!" Beside it, a yellowed poster: 「探しています」 "MISSING: girl, red skirt, bobbed hair." The date on it is 1950.') });
  R.spot({ id: 'hydrant', x: 7.6, z: z0 + 0.3, use: () => say('The fire hydrant cabinet, 消火栓. Its red lamp is the only warm light on this floor.') });
  R.spot({ id: 'umbrellas', x: 6.4, z: z0 + 0.4, use: () => say('Lost-and-found umbrellas. Nobody ever comes back for them. They say an umbrella left for a hundred years opens its eye.') });
  R.spot({ id: 'win', x: -3.8, z: z1 - 0.3, r: 1.2, use: () => say('Across the courtyard, the other wing of the school. In one window on the third floor, a paper lantern is bobbing. There is no one holding it.') });
  R.enemy({ type: 'wisp', id: 'W1', x: -6.5, z: 0.3 });
  R.enemy({ type: 'wisp', id: 'W2', x: 4.5, z: -0.2 });
  R.enemy({ type: 'lantern', id: 'L2', x: 11.5, z: 0.2, when: () => F.ofuda });
  R.onEnter = () => { R.salt.visible = !F.salt_hall; R.setShutter('stairs_e', !F.unlocked_shutterkey); };
  R.update = (dt) => R.updateShutters(dt);
  return R.finalize();
};

ROOM_DEFS.toilet = () => {
  const R = new Room('toilet', { name: '女子トイレ', en: 'GIRLS\' LAVATORY', surface: 'tile', ambience: [0.1, 0.02, 0.015], fogNear: 5, fogFar: 16 });
  const x0 = -3, x1 = 3, z0 = -2.5, z1 = 2.5, h = 2.8;
  const tile = mat(0xffffff, { map: TEX.tile });
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.floortile }), 1.2);
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('x', z0, x0, x1, +1, { h, mat: tile, uv: 1 });
  R.wall('x', z1, x0, x1, -1, { h, mat: tile, uv: 1 });
  R.wall('z', x0, z0, z1, +1, { h, mat: tile, uv: 1 });
  R.wall('z', x1, z0, z1, -1, { h, mat: tile, uv: 1, win: [{ a: -0.6, b: 1.4, y0: 1.7, y1: 2.4 }], frosted: true });
  R.door({ id: 'door', wall: 'x', at: z1, pos: -2.0, inner: -1, kind: 'steel', color: 0x8a7078, w: 0.9, to: 'hall2', toDoor: 'toilet', snd: 'creak' });
  // three stalls along the north wall
  const stallMat = mat(0xffffff, { map: TEX.stall });
  for (const px of [-1.85, -0.4, 1.05]) R.box(0.05, 2.0, 1.5, stallMat, px, 0.1, -1.75);
  const centres = [-1.125, 0.325, 2.0];
  const fronts = [[-1.85, centres[0] - 0.375], [centres[0] + 0.375, centres[1] - 0.375], [centres[1] + 0.375, centres[2] - 0.375], [centres[2] + 0.375, 2.9]];
  for (const [a, b] of fronts) R.box(b - a, 2.0, 0.05, stallMat, (a + b) / 2, 0.1, -1.0);
  R.box(4.8, 0.06, 0.08, M.steel, 0.55, 2.08, -1.0);
  R.solid(-1.9, z0, x1, -0.95, 'furn');
  R.stallDoors = centres.map((c, i) => {
    const g = new THREE.Group(); g.position.set(c - 0.375, 0.1, -1.0);
    const d = new THREE.Mesh(B(0.75, 1.9, 0.04), stallMat); d.geometry.translate(0.375, 0.95, 0); d.castShadow = d.receiveShadow = true;
    g.add(d); g.rotation.y = [-1.2, -0.45, 0][i]; R.scene.add(g); return g;
  });
  R.plane(0.55, 0.55, mat(0xffffff, { map: TEX.wordsStall }), 1.02, 1.3, -1.8, -Math.PI / 2);
  for (const c of centres) { R.box(0.34, 0.07, 0.55, M.porcelain, c, 0, -1.85); R.box(0.34, 0.18, 0.1, M.porcelain, c, 0, -2.12); }
  // sinks and the long mirror
  for (const z of [-0.1, 0.9, 1.9]) {
    R.box(0.46, 0.18, 0.5, M.porcelain, x0 + 0.34, 0.68, z);
    R.box(0.14, 0.68, 0.14, M.porcelain, x0 + 0.25, 0, z);
    R.cyl(0.015, 0.015, 0.14, 5, M.steelLight, x0 + 0.16, 0.9, z);
  }
  R.solid(x0, -0.4, x0 + 0.6, 2.2, 'furn');
  R.box(0.03, 0.75, 2.6, mat(0xffffff, { map: TEX.mirror }), x0 + 0.12, 1.1, 0.9);
  // one flickering tube
  const tubeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xe8fff2, emissiveIntensity: 1 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), tubeMat);
  tube.rotation.z = Math.PI / 2; tube.position.set(0, h - 0.1, 0.4); R.scene.add(tube);
  const fl = R.point(0xdff5ea, 3.2, 9, 0, h - 0.25, 0.4, 'fluoro');
  R.flickers[0].mesh = tubeMat;
  R.point(0x6f86c8, 1.3, 5, 2.5, 2.0, 0.5);
  R.ambient(0x141a2c, 0.9);
  R.cam([-3, -2.5, 0.5, 2.5], [2.75, 2.45, 2.25], [-1.6, 0.5, -0.4], 60);
  R.cam([0.5, -2.5, 3, 2.5], [-0.4, 2.5, 2.3], [2.1, 0.5, -1.2], 62);

  R.spot({ id: 'mirror', x: x0 + 0.3, z: 0.9, r: 1.2, use: async () => {
    if (!F.mirror) { F.mirror = 1; audio.play('sting', 0, 0, 0.35); await say('For an instant, in the mirror, a small girl in a red skirt is standing right behind you.'); await say('You spin around. The lavatory is empty.'); }
    else await say('Your own face, pale and tired. Only yours.');
  } });
  R.spot({ id: 's1', x: centres[0], z: -0.6, r: 0.8, use: () => say('The first stall. Empty. The toilet-paper roll is turning slowly, all by itself.') });
  R.spot({ id: 's2', x: centres[1], z: -0.6, r: 0.8, use: () => say('The second stall. Empty. On the partition, in red marker: 「三回ノック」 — "Knock three times."') });
  R.spot({ id: 's3', x: centres[2], z: -0.6, r: 0.9, use: async () => {
    if (F.hanako_done) return say('The third stall. Only an ordinary toilet now, and the smell of old water.');
    if (F.hanako_awake) return say('The third stall stands open. Cold air pours out of it like breath.');
    const c = await ask('The third stall. The door is shut tight and cold air seeps from beneath it. Knock three times?', ['Knock', 'Leave it']);
    if (c !== 0) return;
    G.cutscene = true;
    audio.play('knock', centres[2], -1.0);
    await wait(1.6);
    await say('「花子さん、遊びましょ」', { jp: true, sub: '"Hanako-san... will you come out and play?"' });
    G.cutscene = true;
    await wait(1.4);
    audio.play('voice', centres[2], -1.6);
    note('「はーい」 ...Ye-es...', 2.5, true);
    await wait(2.0);
    F.hanako_awake = 1;
    R.stallDoors[2].userData.swing = 1;
    audio.play('creak', centres[2], -1.0); audio.play('sting');
    wake('H');
    G.cutscene = false;
  } });
  R.spot({ id: 'window', x: x1 - 0.4, z: 0.5, r: 1.1, use: () => say('A small frosted window, too high to climb out of. Moonlight comes through it the colour of skimmed milk.') });
  R.spot({ id: 'key', x: 0, z: 0, r: 0.8, when: () => F.hanako_done && !F.staffkey, use: async () => {
    F.staffkey = 1; R.keyGlint.visible = false;
    await say('A small brass key on a red tag, lying where Hanako vanished. The tag reads 「職員室」 — Staff Room.');
    give('staffkey');
  } });
  R.keyGlint = buildGlint(); R.keyGlint.visible = false; R.scene.add(R.keyGlint);
  R.enemy({ type: 'hanako', id: 'H', x: 2.0, z: -1.8, dormant: true, when: () => !F.hanako_done });
  R.onEnter = () => {
    R.stallDoors[2].rotation.y = F.hanako_awake ? -1.4 : 0;
    const k = R.spots.find((s) => s.id === 'key');
    if (F.keyX !== undefined) { k.x = F.keyX; k.z = F.keyZ; R.keyGlint.position.set(F.keyX, 0.08, F.keyZ); }
    R.keyGlint.visible = !!(F.hanako_done && !F.staffkey);
  };
  R.update = (dt) => {
    const d = R.stallDoors[2];
    if (d.userData.swing) { d.rotation.y = lerp(d.rotation.y, -1.4, 1 - Math.exp(-dt * 8)); if (d.rotation.y < -1.38) d.userData.swing = 0; }
    if (R.keyGlint.visible) { R.keyGlint.rotation.y += dt * 3; R.keyGlint.position.y = 0.1 + Math.sin(G.time * 4) * 0.03; }
  };
  return R.finalize();
};
