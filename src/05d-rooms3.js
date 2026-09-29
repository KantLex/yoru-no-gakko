
// ───────────────────────── rooms, part 3: the ground floor beyond the fire shutter ─────────────────────────
function corridor(R, x0, x1, opts = {}) {
  const z0 = -1.5, z1 = 1.5, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xffffff, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  const win = []; for (let a = x0 + 1; a < x1 - 1.4; a += 2.6) win.push({ a, b: a + 2.0, y0: 0.9, y1: 2.6 });
  R.wall('x', z1, x0, x1, -1, { win, wains: 0.9 });
  R.wall('x', z0, x0, x1, +1, { wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { wains: 0.9 });
  R.wall('z', x1, z0, z1, -1, { wains: 0.9 });
  for (let x = x0 + 2; x <= x1 - 2; x += 4) fluorescentFixture(R, x, 0, h, 1.3, true);
  R.ambient(0x1c2440, 1.0);
  R.moon([6, 10, 16], [0, 0, 0], 2.8, Math.max(8, (x1 - x0) * 0.6));
  const q = (x1 - x0) / 4;
  R.cam([x0, z0, x0 + q, z1], [x0 + q + 1.6, 2.7, 1.2], [x0 + 0.5, 0.9, -0.4], 58);
  R.cam([x0 + q, z0, x0 + 2 * q, z1], [x0 + 2 * q + 1.2, 2.7, 1.25], [x0 + q - 0.5, 0.6, -0.8], 55);
  R.cam([x0 + 2 * q, z0, x0 + 3 * q, z1], [x0 + 2 * q - 1.3, 2.7, -1.25], [x0 + 3 * q + 0.5, 0.6, 0.6], 55);
  R.cam([x0 + 3 * q, z0, x1, z1], [x0 + 3 * q - 1.6, 2.7, 1.25], [x1 - 0.2, 0.8, -0.3], 55);
  if (opts.exitAt !== undefined) {
    const exitMat = new THREE.MeshLambertMaterial({ map: TEX.exit, emissive: 0xffffff, emissiveMap: TEX.exit, emissiveIntensity: 1.2 });
    R.box(0.04, 0.22, 0.44, exitMat, opts.exitAt + 0.13 * Math.sign(-opts.exitAt), 2.4, 0, { cast: false });
    R.point(0x30ff80, 0.5, 4, opts.exitAt + 0.5 * Math.sign(-opts.exitAt), 2.4, 0);
  }
  return { z0, z1, h };
}

ROOM_DEFS.hall1 = () => {
  const R = new Room('hall1', { name: '１階 廊下', en: '1F CORRIDOR', surface: 'lino', ambience: [0.14, 0.09, 0], fogNear: 6, fogFar: 22 });
  const x0 = -12, x1 = 12, { z0 } = corridor(R, x0, x1, { exitAt: x0 });
  R.door({ id: 'west', wall: 'z', at: x0, pos: 0, inner: +1, kind: 'steel', w: 1.4, to: 'entrance', toDoor: 'east', snd: 'creak' });
  R.door({ id: 'infirmary', wall: 'x', at: z0, pos: -7, inner: +1, kind: 'slide', sign: '保健室', to: 'infirmary', toDoor: 'door', snd: 'slide' });
  R.door({ id: 'science', wall: 'x', at: z0, pos: 2, inner: +1, kind: 'slide', sign: '理科室', to: 'science', toDoor: 'door', snd: 'slide', lock: 'sciencekey',
    lockMsg: 'The science lab. Locked. The school nurse keeps the spare key to the lab, because of the chemicals.' });
  R.door({ id: 'gym', wall: 'z', at: x1, pos: 0, inner: -1, kind: 'steel', w: 1.6, sign: '体育館', to: 'gym', toDoor: 'door', snd: 'creak', lock: 'gymkey',
    lockMsg: 'The doors to the gymnasium passage are locked. A note is taped to them: 「体育館の鍵 → 理科室」 "Gym key: science lab."' });
  // trophy case, with the 1950 festival photograph
  R.box(1.8, 1.9, 0.42, M.woodDark, -2.8, 0, z0 + 0.32, { solid: true });
  R.plane(1.7, 1.7, new THREE.MeshBasicMaterial({ color: 0x6a7a9a, transparent: true, opacity: 0.18, depthWrite: false }), -2.8, 1.0, z0 + 0.54, 0, { dyn: true });
  for (let i = 0; i < 5; i++) R.cyl(0.05, 0.08, 0.22, 6, mat(0xc8a040), -3.5 + i * 0.35, 1.2 + (i % 2) * 0.45, z0 + 0.3);
  R.box(0.4, 0.3, 0.02, mat(0xffffff, { map: TEX.art }), -2.6, 0.45, z0 + 0.52);
  R.box(0.8, 0.8, 0.4, M.steelLight, 6.2, 0, z0 + 0.3, { solid: true });
  R.cyl(0.02, 0.02, 0.1, 4, M.steel, 6.2, 0.8, z0 + 0.3);
  R.plane(0.7, 1.0, mat(0xffffff, { map: TEX.healthPoster }), -5.2, 1.5, z0 + 0.12);
  R.cyl(0.08, 0.08, 0.5, 8, M.red, 9.2, 0, z0 + 0.22);

  R.spot({ id: 'trophy', x: -2.8, z: z0 + 0.6, r: 1.1, use: () => say('Trophies for kendo, track and the choir; the newest is from 1994. One shelf holds only a photograph of the 1950 school festival: paper lanterns in rows, and every child smiling. At the edge of the picture, a single child is not smiling. Her face has been scratched away.') });
  R.spot({ id: 'win', x: 0.5, z: 1.2, r: 1.2, use: () => say('In the courtyard stands the bronze statue of Ninomiya Kinjirō, reading as he carries his firewood. This afternoon he faced the gate. Now he is facing you.') });
  R.spot({ id: 'fountain', x: 6.2, z: z0 + 0.6, use: () => say('You press the drinking-fountain tap. Nothing, then a gurgle, then a thin stream of water. It is warm, like someone\'s hand.') });
  R.spot({ id: 'poster', x: -5.2, z: z0 + 0.4, use: () => say('The nurse\'s newsletter, 保健だより: "If something is wrong, tell a teacher!" Underneath, very small, in pencil: 「言ったよ」 — "I did."') });
  R.enemy({ type: 'wisp', id: 'W5', x: -4, z: 0.4 });
  R.enemy({ type: 'lantern', id: 'L3', x: 7.5, z: -0.2 });
  R.enemy({ type: 'umbrella', id: 'K3', x: 10, z: 0.4, aggro: 5 });
  return R.finalize();
};

ROOM_DEFS.infirmary = () => {
  const R = new Room('infirmary', { name: '保健室', en: 'INFIRMARY', surface: 'lino', ambience: [0.1, 0.03, 0], fogNear: 6, fogFar: 20 });
  const x0 = -4.5, x1 = 4.5, z0 = -3.5, z1 = 3.5, h = 3;
  R.floor(x0, z0, x1, z1, mat(0xb4bcb8, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('x', z0, x0, x1, +1, { win: [{ a: -3.6, b: -1.8, y0: 0.9, y1: 2.6 }, { a: -1.2, b: 0.6, y0: 0.9, y1: 2.6 }] });
  R.wall('x', z1, x0, x1, -1);
  R.wall('z', x0, z0, z1, +1);
  R.wall('z', x1, z0, z1, -1);
  R.door({ id: 'door', wall: 'x', at: z1, pos: -2.6, inner: -1, kind: 'slide', to: 'hall1', toDoor: 'infirmary', snd: 'slide' });
  const curtainMat = new THREE.MeshLambertMaterial({ map: TEX.curtain, transparent: true, opacity: 0.78, side: THREE.DoubleSide });
  for (const bz of [-2.0, 0.9]) {
    R.box(2.0, 0.45, 0.95, M.steelLight, 3.4, 0, bz, { solid: true });
    R.box(1.95, 0.14, 0.9, M.white, 3.4, 0.45, bz);
    R.box(0.35, 0.1, 0.6, M.white, 4.15, 0.59, bz);
    R.box(1.2, 0.06, 0.92, mat(0x9ab8d0), 3.0, 0.59, bz);
    R.plane(1.4, 2.05, curtainMat, 2.25, 1.18, bz, Math.PI / 2, { dyn: true, cast: false });
    R.box(0.03, 0.03, 1.5, M.steel, 2.25, 2.22, bz);
    R.solid(2.2, bz - 0.7, 2.3, bz + 0.7);
  }
  R.box(1.2, 0.72, 0.6, M.steelLight, -3.6, 0, -2.4, { solid: true });
  R.box(1.24, 0.03, 0.64, mat(0x46574a), -3.6, 0.72, -2.4);
  R.box(0.3, 0.02, 0.22, M.paper, -3.8, 0.75, -2.35, { ry: 0.3 });
  R.cyl(0.06, 0.07, 0.3, 6, mat(0x2a4a2a), -3.2, 0.75, -2.55);
  R.box(1.0, 1.8, 0.4, M.white, 0.4, 0, z0 + 0.3, { solid: true });
  R.plane(0.9, 1.6, new THREE.MeshBasicMaterial({ color: 0x9ab0c8, transparent: true, opacity: 0.2, depthWrite: false }), 0.4, 0.95, z0 + 0.51, 0, { dyn: true });
  for (let i = 0; i < 8; i++) R.cyl(0.04, 0.04, 0.14, 6, mat([0xe8e8e0, 0x6a3a1a, 0x3a6a9a][i % 3]), 0.1 + (i % 4) * 0.2, 0.55 + Math.floor(i / 4) * 0.5, z0 + 0.3);
  R.box(0.42, 0.08, 0.42, M.steel, -3.8, 0, 1.6);
  R.cyl(0.02, 0.02, 1.9, 4, M.steelLight, -4.3, 0, 2.0);
  R.plane(0.5, 1.0, mat(0xffffff, { map: TEX.eyechart }), x0 + 0.12, 1.5, 0.2, Math.PI / 2);
  R.box(0.6, 0.85, 0.45, M.porcelain, 1.4, 0, z1 - 0.3, { solid: true });
  R.plane(0.7, 1.0, mat(0xffffff, { map: TEX.healthPoster }), 2.8, 1.5, z1 - 0.12, Math.PI);
  R.ambient(0x1c2440, 0.95);
  R.moon([2, 10, -16], [0, 0, 0], 2.6, 8);
  R.point(0xffd9a0, 1.2, 4, -3.3, 1.2, -2.3, 'lamp');
  R.bedLight = R.point(0xffc890, 1.8, 3.5, 3.9, 1.35, 0.9);
  // the nurse, sitting on the far bed behind the curtain
  R.nurse = buildRokuro();
  R.nurse.root.position.set(3.15, -0.26, 0.9); R.nurse.root.rotation.y = -Math.PI / 2;
  R.nurse.legs.forEach((l) => (l.rotation.x = -1.4));
  R.scene.add(R.nurse.root);
  R.cam([x0, z0, 0, z1], [-4.2, 2.75, -3.2], [2.2, 0.6, 1.6], 58);
  R.cam([0, z0, x1, z1], [4.2, 2.75, 3.1], [-2.5, 0.6, -1.8], 56);

  R.spot({ id: 'desk', x: -3.6, z: -1.9, r: 1.0, use: async () => {
    if (!F.nurselog) {
      F.nurselog = 1;
      await say('The nurse\'s desk. Under the blotter: an old record book with a brittle brown cover, and a key on a tag marked 理科室, Science Lab.');
      give('sciencekey'); give('nurselog'); showDoc('nurselog');
    } else await say('The nurse\'s desk. The old record book\'s last page is dated 1950. After that, nothing is written in it for forty-five years.');
  } });
  R.spot({ id: 'cabinet', x: 0.4, z: z0 + 0.7, r: 1.0, use: async () => {
    if (F.cabinet) return say('The medicine cabinet. Nothing left that would help tonight.');
    F.cabinet = 1;
    await say('The medicine cabinet. Bandages, gauze, and a bottle of painkillers. You take what you can carry.');
    give('bandage', 2); give('painkiller');
  } });
  R.spot({ id: 'chart', x: x0 + 0.5, z: 0.2, r: 1.1, use: () => say('The eye chart. The rings get smaller and smaller. The bottom line isn\'t rings at all: 「みつけて」 — "Find me."') });
  R.spot({ id: 'bed1', x: 2.0, z: -2.0, r: 1.0, use: () => say('The sheets are still warm. There is a dent in the pillow, as if someone got up a moment ago.') });
  R.spot({ id: 'bed2', x: 2.0, z: 0.9, r: 1.0, when: () => F.nurse_seen, use: () => say('Long black hairs on the pillow. Very, very long. They trail off the bed and across the floor, toward the door.') });
  R.spot({ id: 'scale', x: -3.8, z: 1.6, r: 0.9, use: () => say('You step onto the scale. The needle does not move at all.') });
  R.onEnter = () => {
    R.nurse.root.visible = !F.nurse_seen;
    R.bedLight.intensity = F.nurse_seen ? 0 : 1.8 * 1.6;
    if (!F.nurse_seen) infirmaryScare(R);
  };
  return R.finalize();
};

function skeletonModel(R, x, z) {
  const bone = mat(0xe4dcc6), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -2.4;
  const add = (geo, px, py, pz, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, bone); m.position.set(px, py, pz); m.rotation.set(rx, 0, rz); g.add(m); };
  add(new THREE.CylinderGeometry(0.2, 0.25, 0.04, 8), 0, 0.02, 0);
  add(new THREE.CylinderGeometry(0.015, 0.015, 1.9, 4), 0, 0.95, -0.12);
  add(new THREE.SphereGeometry(0.11, 7, 5), 0, 1.66, 0);
  add(B(0.12, 0.05, 0.08), 0, 1.53, 0.03);
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 5), 0, 1.2, 0);
  for (let i = 0; i < 5; i++) add(new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 10), 0, 1.42 - i * 0.07, 0, Math.PI / 2);
  add(B(0.3, 0.1, 0.12), 0, 0.88, 0);
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.82, 4), 0.1 * s, 0.45, 0);
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4), 0.2 * s, 1.15, 0.05, 0, 0.12 * s);
  }
  g.updateMatrixWorld(true);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; R.statics.push(m); } });
  R.solid(x - 0.3, z - 0.3, x + 0.3, z + 0.3);
}

ROOM_DEFS.science = () => {
  const R = new Room('science', { name: '理科室', en: 'SCIENCE LAB', surface: 'lino', ambience: [0.11, 0.04, 0], fogNear: 7, fogFar: 22 });
  const x0 = -5, x1 = 5, z0 = -4, z1 = 4, h = 3;
  R.floor(x0, z0, x1, z1, mat(0x9aa29c, { map: TEX.lino }), 2);
  R.ceiling(x0, z0, x1, z1, h);
  R.wall('z', x1, z0, z1, -1, { win: [-3, -0.8, 1.4].map((a) => ({ a, b: a + 1.8, y0: 0.9, y1: 2.6 })), wains: 0.9 });
  R.wall('z', x0, z0, z1, +1, { wains: 0.9 });
  R.wall('x', z0, x0, x1, +1, { wains: 0.9 });
  R.wall('x', z1, x0, x1, -1, { wains: 0.9 });
  R.door({ id: 'door', wall: 'x', at: z1, pos: 3, inner: -1, kind: 'slide', to: 'hall1', toDoor: 'science', snd: 'slide' });
  R.box(4.4, 1.1, 0.06, mat(0xffffff, { map: TEX.labboard }), -0.5, 0.95, z0 + 0.13);
  R.box(4.56, 1.26, 0.04, M.woodDark, -0.5, 0.87, z0 + 0.1);
  R.box(2.6, 0.9, 0.8, M.woodDark, -0.5, 0, -2.9, { solid: true });
  R.box(2.64, 0.04, 0.84, M.black, -0.5, 0.9, -2.9);
  for (const x of [-2.4, 1.2]) for (const z of [-1.3, 0.6, 2.5]) {
    R.box(1.9, 0.85, 0.95, M.woodDark, x, 0, z, { solid: true });
    R.box(1.95, 0.04, 1.0, M.black, x, 0.85, z);
    R.box(0.4, 0.02, 0.3, M.steel, x + 0.5, 0.89, z);
    R.cyl(0.015, 0.015, 0.35, 4, M.steelLight, x + 0.5, 0.89, z - 0.3);
    R.box(0.06, 0.08, 0.06, mat(0xc8a040), x - 0.6, 0.89, z - 0.35);
    for (const [dx, dz] of [[-0.55, 0.75], [0.55, 0.75], [-0.55, -0.75], [0.55, -0.75]]) R.cyl(0.16, 0.14, 0.6, 7, M.wood, x + dx, 0, z + dz);
  }
  // specimen jars on the west shelves
  R.box(0.45, 2.0, 3.0, M.wood, x0 + 0.3, 0, -1.2, { solid: true });
  const jar = new THREE.MeshLambertMaterial({ color: 0x9ac0a0, transparent: true, opacity: 0.45, depthWrite: false });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    R.cyl(0.08, 0.08, 0.24, 8, jar, x0 + 0.35, 0.35 + r * 0.6, -2.5 + c * 0.45, { cast: false });
    R.box(0.07, 0.1, 0.05, mat(0xd8c8b0), x0 + 0.35, 0.4 + r * 0.6, -2.5 + c * 0.45);
  }
  R.box(0.9, 1.6, 0.45, M.steelLight, x0 + 0.3, 0, 2.2, { solid: true, ry: Math.PI / 2 });
  skeletonModel(R, 4.2, -3.2);
  R.ambient(0x1c2440, 1.0);
  R.moon([15, 9, 1], [0, 0, 0], 2.7, 9);
  R.cam([x0, z0, 0, z1], [4.6, 2.7, 3.6], [-2.5, 0.5, -1.5], 56);
  R.cam([0, z0, x1, z1], [-4.6, 2.7, 3.6], [2.5, 0.5, -1.5], 56);

  R.spot({ id: 'skeleton', x: 3.8, z: -2.8, r: 1.0, use: async () => {
    if (F.gymkey_taken) return say('The skeleton grins at you. Its jaw is wired shut.');
    F.gymkey_taken = 1;
    await say('The skeleton model. Hanging from its finger bones on a loop of red string: a key tagged 体育館, Gymnasium.');
    give('gymkey');
    if (!F.awake_J1 && !F.dead_J1) { audio.play('creak', -4, -3.2); note('Across the room, something plastic creaks.', 3); await wait(0.9); wake('J1'); }
  } });
  R.spot({ id: 'chem', x: x0 + 0.8, z: 2.2, r: 1.0, use: async () => {
    if (F.salt_lab) return say('The chemicals cabinet. Acids and alcohol. Nothing that helps against the dead.');
    F.salt_lab = 1;
    await say('The chemicals cabinet. A plastic tub labelled 塩化ナトリウム — sodium chloride. Salt is salt.');
    give('salt', 3);
  } });
  R.spot({ id: 'jars', x: x0 + 0.8, z: -1.2, r: 1.2, use: () => say('Specimen jars: a frog, a snake, a thing with too many fingers. In the last jar, the pale thing inside turns slowly to look at you.') });
  R.spot({ id: 'board', x: -0.5, z: z0 + 0.6, r: 1.2, use: () => say('Chemistry notes. In the corner, in a different, rounder hand: 「こっくりさん　こっくりさん　おいでください」 — the words that call Kokkuri-san.') });
  R.enemy({ type: 'jintai', id: 'J1', x: -4.1, z: -3.3, rot: 0.7, dormant: true, standby: true });
  return R.finalize();
};

ROOM_DEFS.gym = () => {
  const R = new Room('gym', { name: '体育館', en: 'GYMNASIUM', surface: 'wood', ambience: [0.13, 0.1, 0], fogNear: 10, fogFar: 34 });
  const x0 = -10, x1 = 10, z0 = -8, z1 = 8, h = 7;
  R.box(20, 0.1, 16, mat(0xffffff, { map: TEX.court }), 0, -0.1, 0, { cast: false });
  R.ceiling(x0, z0, x1, z1, h);
  for (let x = -8; x <= 8; x += 4) R.box(0.3, 0.4, 16, M.woodDark, x, h - 0.5, 0);
  R.wall('x', z1, x0, x1, -1, { h, win: [-8.5, -4.5, -0.5, 3.5].map((a) => ({ a, b: a + 3, y0: 3.6, y1: 6.2 })), wains: 1.2, uv: 3 });
  R.wall('x', z0, x0, x1, +1, { h, wains: 1.2, uv: 3 });
  R.wall('z', x0, z0, z1, +1, { h, wains: 1.2, uv: 3 });
  R.wall('z', x1, z0, z1, -1, { h, wains: 1.2, uv: 3 });
  R.door({ id: 'door', wall: 'z', at: x0, pos: 5, inner: +1, kind: 'steel', w: 1.6, to: 'hall1', toDoor: 'gym', snd: 'creak' });
  R.door({ id: 'store', wall: 'z', at: x1, pos: 5.5, inner: -1, kind: 'steel', w: 1.6, sign: '体育倉庫', cond: () => false,
    lockMsg: 'The equipment storeroom. A padlock hangs on the outside of the door.' });
  // the stage, its curtains, and a single chair
  R.box(20, 1.1, 2.8, M.woodDark, 0, 0, -6.6, { solid: true });
  R.box(20, 0.08, 0.1, M.wood, 0, 1.05, -5.2);
  const velvet = mat(0x6a1016);
  for (const s of [-1, 1]) R.box(3.2, 5.6, 0.25, velvet, s * 8.4, 1.1, -7.6);
  R.box(20, 1.0, 0.25, velvet, 0, 5.9, -5.35);
  R.box(0.45, 0.04, 0.45, M.steel, 0, 1.55, -6.6); R.box(0.45, 0.45, 0.04, M.steel, 0, 1.6, -6.82);
  for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) R.cyl(0.015, 0.015, 0.45, 4, M.steel, dx, 1.1, -6.6 + dz);
  // hoops
  for (const s of [-1, 1]) {
    R.box(0.06, 1.05, 1.8, M.white, s * (x1 - 0.75), 2.7, 0);
    R.box(0.7, 0.08, 0.08, M.steel, s * (x1 - 0.4), 3.2, 0);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 4, 12), mat(0xd06020)); rim.rotation.x = Math.PI / 2; rim.position.set(s * (x1 - 1.05), 3.05, 0); R.put(rim, {});
  }
  // wall bars, mats, a basket of balls
  for (let i = 0; i < 6; i++) R.box(0.08, 2.6, 0.08, M.wood, x1 - 0.18, 0, -3 + i * 0.7);
  for (let j = 0; j < 9; j++) R.box(0.05, 0.05, 3.6, M.wood, x1 - 0.18, 0.3 + j * 0.28, -1.25);
  R.box(2.2, 0.45, 1.3, mat(0x2a4a8a), -7.6, 0, 6.8, { solid: true });
  R.cyl(0.4, 0.35, 0.7, 8, M.steel, -8.4, 0, -3.5, { solid: true });
  for (let i = 0; i < 5; i++) R.cyl(0.11, 0.11, 0.22, 6, mat(0xe8e0c8), -8.4 + rand(-0.2, 0.2), 0.62 + (i > 2 ? 0.15 : 0), -3.5 + rand(-0.2, 0.2));
  // behind the storeroom door: mats, a vaulting box, and you
  R.floor(10.1, 3.6, 13, 7.4, M.woodDark, 2);
  R.wall('z', 13, 3.6, 7.4, -1, { h: 3 }); R.wall('x', 3.6, 10.1, 13, +1, { h: 3 }); R.wall('x', 7.4, 10.1, 13, -1, { h: 3 });
  R.box(2.9, 0.1, 3.8, M.woodDark, 11.55, 3, 5.5);
  R.box(1.2, 0.3, 1.9, mat(0x2a4a8a), 11.7, 0, 5.5); R.box(1.1, 0.22, 1.75, mat(0x2a4a8a), 11.75, 0.3, 5.45, { ry: 0.08 });
  for (let i = 0; i < 4; i++) R.box(0.9 - i * 0.05, 0.28, 0.6, M.wood, 12.4, i * 0.28, 4.2);
  const me = buildStudent();
  me.root.rotation.order = 'YXZ'; me.root.position.set(11.6, 0.66, 6.25); me.root.rotation.set(0, -Math.PI / 2, Math.PI / 2);
  me.legs.forEach((l) => (l.rotation.x = -1.3)); me.arms.forEach((a) => (a.arm.rotation.x = -1.1)); me.head.rotation.x = 0.4;
  R.scene.add(me.root);
  R.point(0x9ab0ff, 1.6, 3.5, 11.0, 2.4, 5.2);
  R.storeView = { pos: V3(10.4, 1.25, 4.1), look: V3(11.5, 0.6, 5.0), fov: 58 };
  R.ambient(0x1c2440, 0.95);
  R.moon([3, 18, 24], [0, 0, 0], 3.3, 14);
  R.cam([x0, z0, 0, 0], [-9.4, 6.2, -4.8], [0, 0.4, 1.5], 64);
  R.cam([0, z0, x1, 0], [9.4, 6.2, -4.8], [0, 0.4, 1.5], 64);
  R.cam([x0, 0, 0, z1], [-9.4, 6.2, 7.6], [0.5, 0.4, -1.5], 64);
  R.cam([0, 0, x1, z1], [9.4, 6.2, 7.6], [-0.5, 0.4, -1.5], 64);

  R.spot({ id: 'stage', x: 0, z: -4.8, r: 1.6, use: () => say('The stage. A single folding chair sits in the middle of it, facing the empty hall, as if someone had been made to sit there and be looked at.') });
  R.spot({ id: 'balls', x: -8.4, z: -2.9, r: 1.0, use: () => say('A basket of volleyballs. One of them is rolling slowly back and forth, all on its own.') });
  R.spot({ id: 'store', x: x1 - 0.9, z: 5.5, r: 1.3, use: () => storeroomScene(R) });
  R.spot({ id: 'skey', x: 0, z: 0, r: 0.9, when: () => F.dead_R1 && !F.shutterkey_taken, use: async () => {
    F.shutterkey_taken = 1; R.keyGlint.visible = false;
    await say('Where the nurse fell, a small steel key on a ring stamped 防火シャッター 東階段 — Fire shutter, East stairs.');
    give('shutterkey');
  } });
  R.keyGlint = buildGlint(); R.keyGlint.visible = false; R.scene.add(R.keyGlint);
  R.enemy({ type: 'rokuro', id: 'R1', x: 0.5, z: 0.5, rot: Math.PI, dormant: true, standby: true, wakeDist: 6.5 });
  R.knockT = 3;
  R.onEnter = () => {
    const k = R.spots.find((s) => s.id === 'skey');
    if (F.skeyX !== undefined) { k.x = F.skeyX; k.z = F.skeyZ; R.keyGlint.position.set(F.skeyX, 0.1, F.skeyZ); }
    R.keyGlint.visible = !!(F.dead_R1 && !F.shutterkey_taken);
  };
  R.update = (dt) => {
    if (!F.storeroom_seen) { R.knockT -= dt; if (R.knockT <= 0) { R.knockT = rand(6, 9); audio.play('knock', x1 - 0.3, 5.5); } }
    if (R.keyGlint.visible) { R.keyGlint.rotation.y += dt * 3; R.keyGlint.position.y = 0.12 + Math.sin(G.time * 4) * 0.03; }
  };
  return R.finalize();
};
