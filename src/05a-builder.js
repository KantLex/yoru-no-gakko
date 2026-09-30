
// ───────────────────────── room builder ─────────────────────────
// Coordinates: metres, y up, floor at 0. A character facing rotation r looks along (sin r, cos r).
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const FACE = { N: Math.PI, S: 0, E: Math.PI / 2, W: -Math.PI / 2 };

class Room {
  constructor(id, o) {
    Object.assign(this, { id, name: o.name, en: o.en, surface: o.surface || 'wood', ambience: o.ambience || [0.12, 0.05, 0], acoustics: o.acoustics || 'room' });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010207);
    this.scene.fog = new THREE.Fog(0x010207, o.fogNear ?? 7, o.fogFar ?? 24);
    this.statics = []; this.colliders = []; this.cams = []; this.doors = []; this.spots = []; this.spawns = [];
    this.triggers = []; this.updaters = []; this.flickers = [];
    this.floorY = () => 0;
  }
  put(mesh, o) {
    mesh.castShadow = o.cast !== false; mesh.receiveShadow = o.recv !== false;
    if (o.dyn) this.scene.add(mesh); else this.statics.push(mesh);
    return mesh;
  }
  // y is the bottom of the box
  box(w, h, d, material, x, y, z, o = {}) {
    const geo = B(w, h, d);
    if (o.uv) worldUV(geo, w, h, d, o.uv);
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y + h / 2, z);
    if (o.ry) m.rotation.y = o.ry;
    if (o.solid) {
      const sw = o.ry && Math.abs(Math.sin(o.ry)) > 0.7 ? d : w, sd = o.ry && Math.abs(Math.sin(o.ry)) > 0.7 ? w : d;
      this.solid(x - sw / 2, z - sd / 2, x + sw / 2, z + sd / 2, o.solid === true ? 'furn' : o.solid);
    }
    return this.put(m, o);
  }
  cyl(rt, rb, h, seg, material, x, y, z, o = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
    m.position.set(x, y + h / 2, z);
    if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz;
    if (o.solid) this.solid(x - rb, z - rb, x + rb, z + rb, 'furn');
    return this.put(m, o);
  }
  plane(w, h, material, x, y, z, ry = 0, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.position.set(x, y, z); m.rotation.y = ry;
    if (o.rx) m.rotation.x = o.rx;
    return this.put(m, { cast: false, ...o });
  }
  solid(x0, z0, x1, z1, kind = 'furn') {
    this.colliders.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), kind });
  }
  cam(zone, pos, look, fov = 55) { this.cams.push({ zone, pos: V3(...pos), look: V3(...look), fov }); }
  spot(o) { this.spots.push({ r: 1.0, y: 1, ...o }); return o; }
  enemy(o) { this.spawns.push(o); }
  trigger(rect, fn) { this.triggers.push({ rect, fn }); }

  floor(x0, z0, x1, z1, material, uv = 2, y = 0) {
    this.box(x1 - x0, 0.1, z1 - z0, material, (x0 + x1) / 2, y - 0.1, (z0 + z1) / 2, { uv, cast: false });
  }
  ceiling(x0, z0, x1, z1, h, material = mat(0xffffff, { map: TEX.ceiling }), uv = 1.8) {
    this.box(x1 - x0, 0.12, z1 - z0, material, (x0 + x1) / 2, h, (z0 + z1) / 2, { uv });
  }
  // Wall along X (at z) or along Z (at x). inner: +1/-1, the side the room is on. Openings are windows.
  wall(axis, at, from, to, inner, o = {}) {
    const h = o.h ?? 3, t = 0.2, base = o.base ?? 0, material = o.mat ?? mat(0xffffff, { map: TEX.plaster });
    const ops = (o.win || []).slice().sort((a, b) => a.a - b.a);
    const segs = []; let cur = from;
    for (const op of ops) {
      if (op.a > cur) segs.push([cur, op.a, 0, h]);
      segs.push([op.a, op.b, 0, op.y0]); segs.push([op.a, op.b, op.y1, h]);
      cur = op.b;
    }
    if (cur < to) segs.push([cur, to, 0, h]);
    for (const [a, b, y0, y1] of segs) {
      if (b - a < 0.001 || y1 - y0 < 0.001) continue;
      if (axis === 'x') this.box(b - a, y1 - y0, t, material, (a + b) / 2, base + y0, at, { uv: o.uv ?? 2 });
      else this.box(t, y1 - y0, b - a, material, at, base + y0, (a + b) / 2, { uv: o.uv ?? 2 });
    }
    if (axis === 'x') this.solid(from, at - t / 2, to, at + t / 2, 'wall'); else this.solid(at - t / 2, from, at + t / 2, to, 'wall');
    const off = inner * (t / 2 + 0.015);
    if (o.wains) {
      const wm = o.wainsMat ?? mat(0xffffff, { map: TEX.panel });
      if (axis === 'x') this.box(to - from, o.wains, 0.03, wm, (from + to) / 2, base, at + off, { uv: 1 });
      else this.box(0.03, o.wains, to - from, wm, at + off, base, (from + to) / 2, { uv: 1 });
    }
    const baseboard = mat(0x2a2320);
    if (axis === 'x') this.box(to - from, 0.1, 0.04, baseboard, (from + to) / 2, base, at + off);
    else this.box(0.04, 0.1, to - from, baseboard, at + off, base, (from + to) / 2);
    // window glazing, mullions and sills (the bars throw moonlight shadows across the floor)
    const frame = mat(0x9aa0a6), glass = new THREE.MeshBasicMaterial({ color: 0x5a6f9a, transparent: true, opacity: o.frosted ? 0.85 : 0.12, depthWrite: false, fog: false, map: o.frosted ? TEX.frosted : null });
    for (const op of ops) {
      const len = op.b - op.a, mid = (op.a + op.b) / 2, oh = op.y1 - op.y0;
      if (axis === 'x') {
        this.plane(len, oh, glass, mid, base + op.y0 + oh / 2, at, 0, { dyn: true, cast: false, recv: false });
        this.box(0.05, oh, 0.08, frame, mid, base + op.y0, at);
        this.box(len, 0.05, 0.08, frame, mid, base + op.y0 + oh * 0.62, at);
        this.box(len + 0.1, 0.05, 0.28, frame, mid, base + op.y0 - 0.05, at + inner * 0.05);
      } else {
        this.plane(len, oh, glass, at, base + op.y0 + oh / 2, mid, Math.PI / 2, { dyn: true, cast: false, recv: false });
        this.box(0.08, oh, 0.05, frame, at, base + op.y0, mid);
        this.box(0.08, 0.05, len, frame, at, base + op.y0 + oh * 0.62, mid);
        this.box(0.28, 0.05, len + 0.1, frame, at + inner * 0.05, base + op.y0 - 0.05, mid);
      }
    }
    if (ops.length && !o.frosted) {
      // night sky beyond the glass
      const sky = new THREE.MeshBasicMaterial({ map: TEX.sky, fog: false });
      const len = to - from + 16, out = -inner * 9;
      if (axis === 'x') this.plane(len, 14, sky, (from + to) / 2, base + 3, at + out, inner > 0 ? 0 : Math.PI, { dyn: true, recv: false });
      else this.plane(len, 14, sky, at + out, base + 3, (from + to) / 2, inner > 0 ? Math.PI / 2 : -Math.PI / 2, { dyn: true, recv: false });
    }
  }
  // Door on a wall. Walking into it (facing it) goes through.
  door(o) {
    const w = o.w ?? 1.0, h = o.h ?? 2.0, base = o.base ?? 0, inner = o.inner;
    const tex = { slide: TEX.doorWood, steel: null, stall: TEX.stall }[o.kind || 'slide'];
    const dm = tex ? mat(0xffffff, { map: tex }) : mat(o.color ?? 0x5d646e);
    const frame = mat(0x2a2622), off = inner * 0.13;
    let rect, spawn, face;
    const depth = o.shutter ? 0.95 : 0.62;
    if (o.wall === 'x') {
      this.box(w, h, 0.05, dm, o.pos, base, o.at + off);
      this.box(w + 0.16, 0.08, 0.07, frame, o.pos, base + h, o.at + off);
      this.box(0.08, h, 0.07, frame, o.pos - w / 2 - 0.04, base, o.at + off);
      this.box(0.08, h, 0.07, frame, o.pos + w / 2 + 0.04, base, o.at + off);
      rect = [o.pos - w / 2 + 0.12, Math.min(o.at, o.at + inner * depth), o.pos + w / 2 - 0.12, Math.max(o.at, o.at + inner * depth)];
      spawn = { x: o.pos, z: o.at + inner * 1.0, rot: inner > 0 ? FACE.S : FACE.N };
      face = inner > 0 ? FACE.N : FACE.S;
      if (o.sign) this.box(0.035, 0.24, 0.84, mat(0xffffff, { map: TEX.signs[o.sign] }), o.pos + w / 2 + 0.25, base + h + 0.28, o.at + inner * 0.52);
    } else {
      this.box(0.05, h, w, dm, o.at + off, base, o.pos);
      this.box(0.07, 0.08, w + 0.16, frame, o.at + off, base + h, o.pos);
      this.box(0.07, h, 0.08, frame, o.at + off, base, o.pos - w / 2 - 0.04);
      this.box(0.07, h, 0.08, frame, o.at + off, base, o.pos + w / 2 + 0.04);
      rect = [Math.min(o.at, o.at + inner * depth), o.pos - w / 2 + 0.12, Math.max(o.at, o.at + inner * depth), o.pos + w / 2 - 0.12];
      spawn = { x: o.at + inner * 1.0, z: o.pos, rot: inner > 0 ? FACE.E : FACE.W };
      face = inner > 0 ? FACE.W : FACE.E;
      if (o.sign) this.box(0.84, 0.24, 0.035, mat(0xffffff, { map: TEX.signs[o.sign] }), o.at + inner * 0.52, base + h + 0.28, o.pos + w / 2 + 0.25);
    }
    if (o.shutter) {
      // a fire shutter pulled down in front of the door, with its own collider while it is down
      const sm = mat(0xffffff, { map: TEX.shutter }), off2 = inner * 0.4;
      const mesh = o.wall === 'x' ? this.box(w + 0.4, h + 0.3, 0.08, sm, o.pos, base, o.at + off2, { dyn: true }) : this.box(0.08, h + 0.3, w + 0.4, sm, o.at + off2, base, o.pos, { dyn: true });
      const c = o.wall === 'x' ? { x0: o.pos - w / 2 - 0.2, x1: o.pos + w / 2 + 0.2, z0: Math.min(o.at, o.at + inner * 0.46), z1: Math.max(o.at, o.at + inner * 0.46), kind: 'wall' }
        : { x0: Math.min(o.at, o.at + inner * 0.46), x1: Math.max(o.at, o.at + inner * 0.46), z0: o.pos - w / 2 - 0.2, z1: o.pos + w / 2 + 0.2, kind: 'wall' };
      this.colliders.push(c);
      (this.shutters ||= {})[o.id] = { mesh, c, saved: { ...c }, y: mesh.position.y };
    }
    this.doors.push({ ...o, rect, spawn, face });
  }
  // Raise (or drop) a fire shutter; raising animates it up into the ceiling.
  setShutter(id, down, animate = false) {
    const s = this.shutters[id];
    if (down) { Object.assign(s.c, s.saved); s.mesh.visible = true; s.mesh.position.y = s.y; s.rising = false; return; }
    s.c.x0 = s.c.x1 = s.c.z0 = s.c.z1 = 9999;
    if (animate) s.rising = true; else s.mesh.visible = false;
  }
  updateShutters(dt) {
    for (const s of Object.values(this.shutters || {})) if (s.rising) { s.mesh.position.y += dt * 1.1; if (s.mesh.position.y > s.y + 2.4) { s.rising = false; s.mesh.visible = false; } }
  }
  ambient(color, i) { this.scene.add(new THREE.AmbientLight(color, i * 3.2)); }
  hemi(sky, ground, i) { this.scene.add(new THREE.HemisphereLight(sky, ground, i)); }
  moon(from, target, i = 2.2, span = 10, color = 0x8ea6ff) {
    const l = new THREE.DirectionalLight(color, i * 2.1);
    l.position.set(...from); l.target.position.set(...target);
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    const c = l.shadow.camera; c.left = -span; c.right = span; c.top = span; c.bottom = -span; c.near = 1; c.far = 70;
    l.shadow.bias = -0.0008; l.shadow.normalBias = 0.03;
    this.scene.add(l, l.target);
    return l;
  }
  point(color, i, d, x, y, z, flicker) {
    const l = new THREE.PointLight(color, i * 1.6, d, 1.3);
    if (flicker) i *= 1.6;
    l.position.set(x, y, z);
    this.scene.add(l);
    if (flicker) this.flickers.push({ l, base: i, kind: flicker, t: 0, on: true });
    return l;
  }
  finalize() {
    for (const m of mergeMeshes(this.statics)) this.scene.add(m);
    this.statics = [];
    return this;
  }
}

// ── furniture ──
const M = {};
function furnitureMats() {
  Object.assign(M, {
    deskTop: mat(0xb89468), steel: mat(0x5b6168), steelLight: mat(0x8a9097), chair: mat(0x9c7a52), dark: mat(0x1a1714),
    white: mat(0xe6e4dc), paper: mat(0xece8da), black: mat(0x0e0e10), grey: mat(0x6c6c70), red: mat(0xa3262a), green: mat(0x2b4a36),
    wood: mat(0x6b4a2c), woodDark: mat(0x3a2718), cream: mat(0xd8cfb6), porcelain: mat(0xe9eef0), chalk: mat(0x23402f),
  });
}
// Student desk and chair; the pupil faces -z.
function studentDesk(R, x, z, o = {}) {
  const ry = o.ry || 0;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const add = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(B(w, h, d), m); b.position.set(px, py + h / 2, pz); g.add(b); };
  add(0.62, 0.03, 0.45, M.deskTop, 0, 0.7, 0);
  add(0.58, 0.14, 0.4, M.steel, 0, 0.56, -0.01);
  for (const sx of [-0.28, 0.28]) for (const sz of [-0.19, 0.19]) add(0.03, 0.56, 0.03, M.steel, sx, 0, sz);
  if (!o.noChair) {
    const cz = o.chairOut ? 0.62 : 0.4, cr = o.chairRot || 0;
    const c = new THREE.Group(); c.position.set(0, 0, cz); c.rotation.y = cr; g.add(c);
    const ca = (w, h, d, m, px, py, pz) => { const b = new THREE.Mesh(B(w, h, d), m); b.position.set(px, py + h / 2, pz); c.add(b); };
    ca(0.4, 0.03, 0.38, M.chair, 0, 0.42, 0);
    ca(0.4, 0.26, 0.03, M.chair, 0, 0.58, 0.19);
    for (const sx of [-0.18, 0.18]) for (const sz of [-0.16, 0.18]) ca(0.025, 0.42, 0.025, M.steel, sx, 0, sz);
    ca(0.025, 0.4, 0.025, M.steel, -0.18, 0.44, 0.19); ca(0.025, 0.4, 0.025, M.steel, 0.18, 0.44, 0.19);
  }
  g.updateMatrixWorld(true);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; R.statics.push(m); } });
  R.solid(x - 0.33, z - 0.25, x + 0.33, z + 0.25);
  if (!o.noChair) R.solid(x - 0.2, z + (o.chairOut ? 0.44 : 0.22), x + 0.2, z + (o.chairOut ? 0.8 : 0.58));
}
function fluorescentFixture(R, x, z, h, len = 1.3, alongX = true) {
  const w = alongX ? len : 0.18, d = alongX ? 0.18 : len;
  R.box(w, 0.06, d, mat(0x6d7072), x, h - 0.08, z, { cast: false });
  R.box(alongX ? len - 0.1 : 0.05, 0.04, alongX ? 0.05 : len - 0.1, mat(0x9aa4a8), x, h - 0.12, z, { cast: false });
}
function wallClock(R, x, y, z, ry) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 12), M.white);
  c.rotation.x = Math.PI / 2; c.rotation.z = 0; c.position.set(x, y, z);
  const g = new THREE.Group(); g.add(c); g.position.set(0, 0, 0);
  const holder = new THREE.Group(); holder.position.set(x, y, z); holder.rotation.y = ry; R.scene.add(holder);
  c.position.set(0, 0, 0); holder.add(c);
  const hand = (len, ang, w) => { const m = new THREE.Mesh(B(w, len, 0.01), M.black); m.geometry.translate(0, len / 2, 0); m.rotation.z = -ang; m.position.z = 0.03; holder.add(m); };
  hand(0.09, (2 + 13 / 60) / 12 * TAU, 0.018);   // stopped at 2:13
  hand(0.14, 13 / 60 * TAU, 0.012);
}
function morijio(R, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.02, 8), M.white); plate.position.y = 0.01; g.add(plate);
  const salt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), mat(0xf4f4f0)); salt.position.y = 0.08; g.add(salt);
  R.scene.add(g);
  return g;
}
