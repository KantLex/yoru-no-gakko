
// ───────────────────────── models: low-poly people and obake, built from primitives ─────────────────────────
function part(geo, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }

// Misaki, in a navy sailor uniform, white indoor shoes with red toes, kendo shinai when equipped.
function buildStudent() {
  const C = { navy: mat(0x1c2340), skin: mat(0xe8c4a4), hair: mat(0x14110f), white: mat(0xe8e6de), red: mat(0xb0282c), sock: mat(0xdcdad2), shoe: mat(0xe9e7df), toe: mat(0xa02828), bamboo: mat(0xc9a868), tsuba: mat(0x2a2016) };
  const root = new THREE.Group();
  const body = pivot(root, 0, 0, 0);
  const hips = pivot(body, 0, 0.8, 0);
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = pivot(hips, 0.085 * s, 0, 0);
    part(B(0.12, 0.36, 0.13), C.skin, 0, -0.2, 0, leg);
    part(B(0.125, 0.34, 0.135), C.sock, 0, -0.55, 0, leg);
    part(B(0.13, 0.08, 0.24), C.shoe, 0, -0.76, 0.04, leg);
    part(B(0.135, 0.085, 0.06), C.toe, 0, -0.76, 0.15, leg);
    legs.push(leg);
  }
  const skirt = part(new THREE.CylinderGeometry(0.17, 0.3, 0.36, 10, 1), C.navy, 0, -0.08, 0, hips);
  const torso = pivot(hips, 0, 0.08, 0);
  part(B(0.34, 0.44, 0.21), C.navy, 0, 0.22, 0, torso);
  part(B(0.36, 0.2, 0.02), C.navy, 0, 0.36, -0.115, torso);                  // sailor collar flap
  part(B(0.36, 0.02, 0.025), C.white, 0, 0.3, -0.12, torso);                  // collar stripe
  part(B(0.02, 0.2, 0.025), C.white, 0.16, 0.37, -0.12, torso);
  part(B(0.02, 0.2, 0.025), C.white, -0.16, 0.37, -0.12, torso);
  const scarf = part(new THREE.ConeGeometry(0.07, 0.16, 4), C.red, 0, 0.3, 0.12, torso); scarf.rotation.x = Math.PI;
  part(B(0.08, 0.1, 0.08), C.skin, 0, 0.49, 0, torso);                        // neck
  const head = pivot(torso, 0, 0.55, 0);
  part(B(0.22, 0.25, 0.22), C.skin, 0, 0.12, 0, head);
  part(B(0.25, 0.1, 0.25), C.hair, 0, 0.25, -0.005, head);
  part(B(0.25, 0.26, 0.08), C.hair, 0, 0.1, -0.1, head);
  part(B(0.035, 0.24, 0.2), C.hair, 0.125, 0.1, -0.01, head);
  part(B(0.035, 0.24, 0.2), C.hair, -0.125, 0.1, -0.01, head);
  part(B(0.23, 0.06, 0.04), C.hair, 0, 0.2, 0.11, head);                      // fringe
  part(B(0.24, 0.42, 0.05), C.hair, 0, -0.14, -0.12, head);                   // long hair down the back
  part(B(0.035, 0.03, 0.01), C.hair, 0.05, 0.12, 0.112, head);                // eyes
  part(B(0.035, 0.03, 0.01), C.hair, -0.05, 0.12, 0.112, head);
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = pivot(torso, 0.225 * s, 0.4, 0);
    part(B(0.1, 0.3, 0.1), C.navy, 0, -0.14, 0, arm);
    part(B(0.11, 0.04, 0.11), C.white, 0, -0.29, 0, arm);                     // cuff stripe
    const fore = pivot(arm, 0, -0.3, 0);
    part(B(0.075, 0.24, 0.075), C.skin, 0, -0.12, 0, fore);
    part(B(0.08, 0.08, 0.06), C.skin, 0, -0.27, 0, fore);
    arms.push({ arm, fore });
  }
  // shinai held in the right hand
  const shinai = pivot(arms[1].fore, 0, -0.28, 0.02);
  part(new THREE.CylinderGeometry(0.018, 0.022, 0.28, 5), C.tsuba, 0, 0, 0, shinai).rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 8), C.tsuba, 0, 0, 0.12, shinai).rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(0.018, 0.024, 0.84, 5), C.bamboo, 0, 0, 0.55, shinai).rotation.x = Math.PI / 2;
  shinai.visible = false;
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, body, hips, torso, head, legs, arms, skirt, shinai };
}

// 提灯お化け — a paper lantern with one eye and a long tongue, lit from inside.
function buildLantern() {
  const root = new THREE.Group(), bob = pivot(root, 0, 1.3, 0);
  const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector2(0.18 + Math.sin(t * Math.PI) * 0.2, -0.36 + t * 0.72)); }
  const paper = new THREE.MeshLambertMaterial({ map: TEX.lantern, emissive: 0xff8a30, emissiveIntensity: 0.9, emissiveMap: TEX.lantern, flatShading: true });
  const body = part(new THREE.LatheGeometry(pts, 10), paper, 0, 0, 0, bob);
  body.rotation.y = Math.PI * 0.35;
  part(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 10), mat(0x1a1210), 0, 0.39, 0, bob);
  part(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 10), mat(0x1a1210), 0, -0.39, 0, bob);
  const eye = part(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ map: TEX.eye }), 0.02, 0.1, 0.33, bob);
  eye.rotation.y = -Math.PI / 2;
  const mouth = part(B(0.3, 0.04, 0.05), mat(0x3a0808), 0, -0.1, 0.36, bob);
  const tongue = pivot(bob, 0, -0.12, 0.37);
  const tmat = mat(0xd03048);
  part(B(0.09, 0.02, 0.22), tmat, 0, 0, 0.11, tongue);
  const tip = pivot(tongue, 0, 0, 0.22); tip.rotation.x = 0.8;
  part(B(0.08, 0.02, 0.2), tmat, 0, 0, 0.1, tip);
  const light = new THREE.PointLight(0xff9a40, 2.2, 6, 1.2);
  light.position.set(0, 0, 0); bob.add(light);
  return { root, bob, eye, tongue, tip, light, body, mouth };
}

// 傘お化け — a one-eyed paper umbrella hopping on a single leg in a geta.
function buildUmbrella() {
  const root = new THREE.Group(), hop = pivot(root, 0, 0, 0);
  const canopy = part(new THREE.ConeGeometry(0.55, 0.75, 10, 1, true), new THREE.MeshLambertMaterial({ map: TEX.wagasa, side: THREE.DoubleSide, flatShading: true }), 0, 1.05, 0, hop);
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 5), mat(0x2a1a10), 0, 1.47, 0, hop);
  const eye = part(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ map: TEX.eye }), 0, 1.02, 0.3, hop);
  eye.rotation.y = -Math.PI / 2;
  const tongue = pivot(hop, 0, 0.86, 0.36); tongue.rotation.x = 0.6;
  part(B(0.1, 0.02, 0.36), mat(0xd03048), 0, 0, 0.16, tongue);
  const leg = pivot(hop, 0, 0.7, 0);
  part(new THREE.CylinderGeometry(0.035, 0.03, 0.5, 5), mat(0x8a6a50), 0, -0.25, 0, leg);
  part(B(0.12, 0.05, 0.26), mat(0x9a7448), 0, -0.52, 0.02, leg);
  part(B(0.02, 0.06, 0.02), mat(0x2a1a10), 0, -0.56, 0.1, leg);
  return { root, hop, canopy, eye, tongue, leg };
}

// 人魂 — a floating blue soul-flame with a tail.
function buildWisp() {
  const root = new THREE.Group(), core = pivot(root, 0, 1.3, 0);
  const m1 = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const m2 = new THREE.MeshBasicMaterial({ color: 0x3060ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const ball = part(new THREE.IcosahedronGeometry(0.13, 0), m1, 0, 0, 0, core); ball.castShadow = false;
  const halo = part(new THREE.IcosahedronGeometry(0.22, 1), m2, 0, 0, 0, core); halo.castShadow = false;
  const tail = part(new THREE.ConeGeometry(0.12, 0.5, 6), m2, 0, 0.28, -0.05, core); tail.castShadow = false; tail.rotation.x = -0.4;
  const light = new THREE.PointLight(0x5a8cff, 1.8, 5, 1.2); core.add(light);
  return { root, core, ball, halo, tail, light };
}

// トイレの花子さん — bob cut hiding the eyes, white blouse, red suspender skirt.
function buildHanako(o = {}) {
  const C = { skin: mat(o.skin ?? 0xcfd2d4), hair: mat(0x0c0b0b), white: mat(o.blouse ?? 0xe8e8e2), red: mat(o.skirt ?? 0x9c1c22), shoe: mat(0xe0dcd0) };
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  for (const s of [-1, 1]) { part(B(0.1, 0.5, 0.1), C.skin, 0.07 * s, 0.25, 0, body); part(B(0.11, 0.07, 0.18), C.shoe, 0.07 * s, 0.035, 0.03, body); }
  part(new THREE.CylinderGeometry(0.15, 0.26, 0.3, 8), C.red, 0, 0.62, 0, body);
  const torso = pivot(body, 0, 0.76, 0);
  part(B(0.28, 0.32, 0.17), C.white, 0, 0.16, 0, torso);
  part(B(0.04, 0.32, 0.18), C.red, 0.08, 0.16, 0, torso);
  part(B(0.04, 0.32, 0.18), C.red, -0.08, 0.16, 0, torso);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = pivot(torso, 0.18 * s, 0.3, 0);
    part(B(0.1, 0.1, 0.1), C.white, 0, -0.03, 0, a);
    part(B(0.07, 0.36, 0.07), C.skin, 0, -0.25, 0, a);
    arms.push(a);
  }
  const head = pivot(torso, 0, 0.36, 0);
  part(B(0.2, 0.22, 0.2), C.skin, 0, 0.11, 0, head);
  part(B(0.25, 0.1, 0.24), C.hair, 0, 0.23, 0, head);
  part(B(0.25, 0.24, 0.07), C.hair, 0, 0.1, -0.09, head);
  part(B(0.04, 0.24, 0.22), C.hair, 0.115, 0.1, 0, head);
  part(B(0.04, 0.24, 0.22), C.hair, -0.115, 0.1, 0, head);
  part(B(0.23, 0.1, 0.04), C.hair, 0, 0.16, 0.1, head);                       // heavy fringe over the eyes
  part(B(0.05, 0.015, 0.01), mat(0x5a1010), 0, 0.03, 0.101, head);            // a thin mouth
  return { root, body, torso, head, arms };
}

// のっぺらぼう — the night-duty teacher. A dark suit, a tie, and nothing at all where the face should be.
function buildNoppera() {
  const C = { suit: mat(0x23262c), shirt: mat(0xd8d8d0), tie: mat(0x5a1c20), skin: mat(0xdcc0a0), shoe: mat(0x111111), hair: mat(0x2a2622) };
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const hips = pivot(body, 0, 0.9, 0);
  const legs = [];
  for (const s of [-1, 1]) {
    const l = pivot(hips, 0.1 * s, 0, 0);
    part(B(0.15, 0.86, 0.16), C.suit, 0, -0.43, 0, l);
    part(B(0.15, 0.07, 0.28), C.shoe, 0, -0.87, 0.05, l);
    legs.push(l);
  }
  const torso = pivot(hips, 0, 0, 0);
  part(B(0.44, 0.6, 0.25), C.suit, 0, 0.3, 0, torso);
  part(B(0.14, 0.34, 0.02), C.shirt, 0, 0.43, 0.126, torso);
  part(B(0.05, 0.3, 0.02), C.tie, 0, 0.4, 0.14, torso);
  part(B(0.1, 0.1, 0.1), C.skin, 0, 0.64, 0, torso);
  const head = pivot(torso, 0, 0.68, 0);
  part(new THREE.SphereGeometry(0.14, 8, 6), C.skin, 0, 0.14, 0, head).scale.set(0.95, 1.2, 1);
  part(B(0.26, 0.07, 0.26), C.hair, 0, 0.3, -0.02, head);
  part(B(0.26, 0.16, 0.06), C.hair, 0, 0.2, -0.12, head);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = pivot(torso, 0.27 * s, 0.55, 0);
    part(B(0.12, 0.62, 0.13), C.suit, 0, -0.3, 0, a);
    part(B(0.09, 0.12, 0.09), C.skin, 0, -0.66, 0, a);
    arms.push(a);
  }
  return { root, body, hips, torso, head, legs, arms };
}

// Glinting pickup marker for items lying in the open.
function buildGlint() {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: 0xfff4c0, transparent: true, opacity: 0.9, fog: false }));
  return m;
}
