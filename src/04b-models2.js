
// ───────────────────────── models, part 2 ─────────────────────────

// 人体模型 — the science-lab anatomical model: one side skin, the other side muscle and organs.
function buildJintai() {
  const C = { skin: mat(0xe0b894), muscle: mat(0xa8322c), organ: mat(0x7a1c24), lung: mat(0xd08a8a), liver: mat(0x6a2a1a), gut: mat(0xd89a90), eye: mat(0xf4f0e0), pupil: mat(0x111111), brain: mat(0xd89aa0) };
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), hips = pivot(body, 0, 0.9, 0);
  const legs = [];
  for (const s of [-1, 1]) {
    const l = pivot(hips, 0.1 * s, 0, 0);
    part(B(0.14, 0.86, 0.15), s < 0 ? C.skin : C.muscle, 0, -0.43, 0, l);
    part(B(0.14, 0.06, 0.24), s < 0 ? C.skin : C.muscle, 0, -0.87, 0.04, l);
    legs.push(l);
  }
  const torso = pivot(hips, 0, 0, 0);
  part(B(0.2, 0.62, 0.24), C.skin, -0.1, 0.31, 0, torso);
  part(B(0.2, 0.62, 0.24), C.muscle, 0.1, 0.31, 0, torso);
  part(B(0.12, 0.2, 0.06), C.lung, 0.08, 0.44, 0.13, torso);
  part(B(0.08, 0.1, 0.07), C.organ, 0.03, 0.4, 0.14, torso);
  part(B(0.16, 0.08, 0.06), C.liver, 0.07, 0.24, 0.13, torso);
  for (let i = 0; i < 3; i++) part(B(0.14, 0.04, 0.05), C.gut, 0.06, 0.08 + i * 0.05, 0.13, torso);
  part(B(0.09, 0.1, 0.09), C.skin, 0, 0.66, 0, torso);
  const head = pivot(torso, 0, 0.7, 0);
  part(B(0.11, 0.26, 0.22), C.skin, -0.055, 0.14, 0, head);
  part(B(0.11, 0.26, 0.22), C.muscle, 0.055, 0.14, 0, head);
  part(B(0.1, 0.06, 0.18), C.brain, 0.055, 0.29, -0.01, head);
  part(new THREE.SphereGeometry(0.035, 6, 4), C.eye, -0.05, 0.17, 0.11, head);
  part(new THREE.SphereGeometry(0.045, 6, 4), C.eye, 0.05, 0.17, 0.115, head);
  part(B(0.02, 0.02, 0.01), C.pupil, -0.05, 0.17, 0.145, head);
  part(B(0.025, 0.025, 0.01), C.pupil, 0.05, 0.17, 0.16, head);
  part(B(0.08, 0.02, 0.02), C.eye, 0.04, 0.07, 0.11, head);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = pivot(torso, 0.26 * s, 0.56, 0);
    part(B(0.1, 0.62, 0.11), s < 0 ? C.skin : C.muscle, 0, -0.3, 0, a);
    part(B(0.08, 0.12, 0.08), s < 0 ? C.skin : C.muscle, 0, -0.66, 0, a);
    arms.push(a);
  }
  return { root, body, hips, torso, head, legs, arms };
}

// 一反木綿 — a flying strip of white cotton. Its segments are placed in world space along the path it has flown.
function buildIttan() {
  const root = new THREE.Group();
  const cm = new THREE.MeshLambertMaterial({ map: TEX.cloth, side: THREE.DoubleSide, emissive: 0x303030, flatShading: true });
  const segs = [];
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(B(0.38 - i * 0.012, 0.012, 0.3), cm);
    s.castShadow = true; root.add(s); segs.push(s);
  }
  for (const x of [-0.08, 0.08]) { const e = new THREE.Mesh(B(0.05, 0.02, 0.03), mat(0x111111)); e.position.set(x, 0.012, 0.06); segs[0].add(e); }
  return { root, segs, worldSpace: true };
}

// テケテケ — a girl with no lower body, dragging herself along on her elbows.
function buildTeke() {
  const C = { navy: mat(0x1c2340), skin: mat(0xcfc6c0), hair: mat(0x0b0a0a), white: mat(0xe8e6de), red: mat(0xb0282c), dark: mat(0x1a0808) };
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const torso = pivot(body, 0, 0.3, 0);
  part(B(0.34, 0.2, 0.46), C.navy, 0, 0, -0.05, torso);
  part(B(0.36, 0.03, 0.2), C.white, 0, 0.1, 0.02, torso);
  part(B(0.3, 0.16, 0.05), C.dark, 0, -0.02, -0.3, torso);
  part(new THREE.ConeGeometry(0.06, 0.14, 4), C.red, 0, -0.06, 0.2, torso);
  const head = pivot(torso, 0, 0.2, 0.3);
  part(B(0.2, 0.22, 0.2), C.skin, 0, 0.02, 0.02, head);
  part(B(0.24, 0.08, 0.24), C.hair, 0, 0.14, 0, head);
  part(B(0.24, 0.3, 0.05), C.hair, 0, -0.02, -0.1, head);
  part(B(0.05, 0.3, 0.22), C.hair, 0.12, -0.04, 0, head);
  part(B(0.05, 0.3, 0.22), C.hair, -0.12, -0.04, 0, head);
  part(B(0.24, 0.04, 0.6), C.hair, 0, -0.05, -0.4, head);
  part(B(0.04, 0.03, 0.01), mat(0xeeeeee), 0.05, 0.04, 0.125, head);
  part(B(0.04, 0.03, 0.01), mat(0xeeeeee), -0.05, 0.04, 0.125, head);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = pivot(torso, 0.21 * s, 0.05, 0.14);
    const up = part(B(0.08, 0.3, 0.08), C.navy, 0, -0.14, 0, a);
    const fore = pivot(a, 0, -0.28, 0);
    part(B(0.07, 0.3, 0.07), C.skin, 0, -0.14, 0, fore);
    void up; arms.push({ a, fore });
  }
  const glow = new THREE.PointLight(0x8a9ad0, 1.4, 3, 1.2); glow.position.set(0, 0.7, 0.6); root.add(glow);
  return { root, body, torso, head, arms };
}

// ろくろ首 — the school nurse, whose neck will not stop growing.
function buildRokuro() {
  const C = { coat: mat(0xe2e4e0), skin: mat(0xd9c7b8), hair: mat(0x0d0c0c), stock: mat(0xd8d0c8), shoe: mat(0xe8e8e8), lip: mat(0x8a1c24), cap: mat(0xf2f2f0) };
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const legs = [];
  for (const s of [-1, 1]) { const l = pivot(body, 0.08 * s, 0.82, 0); part(B(0.11, 0.8, 0.12), C.stock, 0, -0.4, 0, l); part(B(0.12, 0.06, 0.22), C.shoe, 0, -0.8, 0.04, l); legs.push(l); }
  part(new THREE.CylinderGeometry(0.2, 0.28, 0.5, 8), C.coat, 0, 0.62, 0, body);
  const torso = pivot(body, 0, 0.86, 0);
  part(B(0.38, 0.52, 0.22), C.coat, 0, 0.26, 0, torso);
  part(B(0.04, 0.3, 0.02), mat(0x9ab0c8), 0.08, 0.3, 0.115, torso);
  part(B(0.09, 0.08, 0.09), C.skin, 0, 0.56, 0, torso);
  const arms = [];
  for (const s of [-1, 1]) { const a = pivot(torso, 0.24 * s, 0.48, 0); part(B(0.1, 0.56, 0.11), C.coat, 0, -0.27, 0, a); part(B(0.08, 0.1, 0.08), C.skin, 0, -0.6, 0, a); arms.push(a); }
  const head = new THREE.Group(); root.add(head);
  part(B(0.2, 0.25, 0.2), C.skin, 0, 0.08, 0, head);
  part(B(0.24, 0.09, 0.24), C.hair, 0, 0.23, -0.01, head);
  part(B(0.24, 0.26, 0.06), C.hair, 0, 0.1, -0.1, head);
  part(B(0.04, 0.3, 0.2), C.hair, 0.12, 0.04, 0, head);
  part(B(0.04, 0.3, 0.2), C.hair, -0.12, 0.04, 0, head);
  part(B(0.26, 0.7, 0.05), C.hair, 0, -0.3, -0.11, head);
  part(B(0.16, 0.05, 0.12), C.cap, 0, 0.3, 0.02, head);
  part(B(0.035, 0.02, 0.01), mat(0x111111), 0.05, 0.1, 0.101, head);
  part(B(0.035, 0.02, 0.01), mat(0x111111), -0.05, 0.1, 0.101, head);
  const mouth = part(B(0.07, 0.02, 0.01), C.lip, 0, 0.02, 0.101, head);
  const neck = [];
  const ng = new THREE.SphereGeometry(0.045, 6, 4);
  for (let i = 0; i < 24; i++) { const n = new THREE.Mesh(ng, C.skin); n.castShadow = true; root.add(n); neck.push(n); }
  const base = V3(0, 1.44, 0);
  const tmp = new THREE.Vector3(), ctl = new THREE.Vector3(), tip = new THREE.Vector3();
  function setNeck() {
    tip.copy(head.position).y -= 0.02;
    const d = tip.distanceTo(base);
    ctl.copy(base).add(tip).multiplyScalar(0.5); ctl.y += 0.15 + d * 0.3;
    neck.forEach((n, i) => {
      const t = (i + 1) / (neck.length + 1), u = 1 - t;
      tmp.set(0, 0, 0).addScaledVector(base, u * u).addScaledVector(ctl, 2 * u * t).addScaledVector(tip, t * t);
      n.position.copy(tmp);
      n.visible = d > 0.12;
    });
  }
  head.position.set(0, 1.5, 0); setNeck();
  return { root, body, torso, legs, arms, head, mouth, neck, base, setNeck };
}

// The children in the kagome circle: Hanako's shape, washed out to grey.
function buildChild() { return buildHanako({ skirt: 0x4a4e58, blouse: 0xbfc3c4, skin: 0xb8bec6 }); }

// がしゃどくろ — a giant skeleton made of everything the school buried. Built at world scale.
function buildGasha() {
  const bone = new THREE.MeshLambertMaterial({ color: 0xd8d0b8, flatShading: true, emissive: 0x100c08 }), dark = mat(0x0a0806);
  const root = new THREE.Group();
  const skull = new THREE.Group(); root.add(skull);
  const cr = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), bone); cr.scale.set(1, 1.05, 1.15); skull.add(cr);
  const glow = new THREE.MeshBasicMaterial({ color: 0xff3020, fog: false });
  const eyes = [];
  for (const s of [-1, 1]) {
    const so = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), dark); so.position.set(0.9 * s, 0.15, 2.2); so.scale.set(1, 0.85, 0.5); skull.add(so);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4), glow); e.position.set(0.9 * s, 0.1, 2.45); skull.add(e); eyes.push(e);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 3), dark); nose.position.set(0, -0.7, 2.5); nose.rotation.x = Math.PI; skull.add(nose);
  const jaw = new THREE.Group(); jaw.position.set(0, -1.3, 0.4); skull.add(jaw);
  const jb = new THREE.Mesh(B(2.8, 0.6, 2.2), bone); jb.position.set(0, -0.35, 1.0); jaw.add(jb);
  for (let i = 0; i < 9; i++) {
    const tU = new THREE.Mesh(B(0.22, 0.4, 0.2), bone); tU.position.set(-1.1 + i * 0.275, -1.25, 2.45); skull.add(tU);
    const tL = new THREE.Mesh(B(0.22, 0.36, 0.2), bone); tL.position.set(-1.1 + i * 0.275, 0.08, 2.0); jaw.add(tL);
  }
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7, 6), bone); spine.position.set(0, -5.2, -0.6); skull.add(spine);
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(2.6 - i * 0.2, 0.2, 4, 10, Math.PI), bone);
    rib.position.set(0, -4 - i * 1.1, -0.6); rib.rotation.set(Math.PI / 2, 0, 0); skull.add(rib);
  }
  const hands = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); root.add(g);
    const palm = new THREE.Mesh(B(1.5, 0.4, 1.4), bone); g.add(palm);
    for (let f = 0; f < 5; f++) {
      const thumb = f === 4, fg = new THREE.Group();
      fg.position.set(thumb ? 0.85 * -s : -0.55 + f * 0.37, 0, thumb ? 0.1 : 0.7);
      fg.rotation.y = thumb ? -s * 1.1 : 0;
      g.add(fg);
      let p = fg;
      for (let k = 0; k < 3; k++) {
        const seg = new THREE.Group(); seg.position.z = k === 0 ? 0 : 0.5; seg.rotation.x = 0.35; p.add(seg);
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.5, 5), bone); b.rotation.x = Math.PI / 2; b.position.z = 0.25; seg.add(b);
        p = seg;
      }
    }
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 1, 6), bone); root.add(arm);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    hands.push({ g, arm, side: s });
  }
  skull.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, skull, jaw, eyes, hands };
}

// A red temari ball, bouncing down the stairs on its own.
function buildBall() {
  const g = new THREE.Group();
  g.add(part(new THREE.IcosahedronGeometry(0.12, 1), mat(0xb0282c)));
  const band = part(new THREE.TorusGeometry(0.12, 0.018, 4, 12), mat(0xe8c040)); band.rotation.x = Math.PI / 2; g.add(band);
  const band2 = part(new THREE.TorusGeometry(0.12, 0.014, 4, 12), mat(0xf0f0e8)); g.add(band2);
  return g;
}
