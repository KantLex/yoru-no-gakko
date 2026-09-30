import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

// ───────────────────────── core: renderer, retro post pass, input, helpers ─────────────────────────
const W = 480, H = 300;                       // internal resolution, upscaled with nearest-neighbour
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const dist2 = (ax, az, bx, bz) => (ax - bx) ** 2 + (az - bz) ** 2;

const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 90);

// Post pass: linear→sRGB, vignette, grain, 4×4 ordered dither to a reduced palette, fades and flashes.
const post = {
  uniforms: {
    tDiffuse: { value: rt.texture }, time: { value: 0 }, res: { value: new THREE.Vector2(W, H) },
    fade: { value: 0 }, flash: { value: 0 }, red: { value: 0 }, levels: { value: 22 }, gray: { value: 0 }, wobble: { value: 0 },
    bright: { value: 1 }, gamma: { value: 1 },   // brightness setting (06f)
  },
};
post.mat = new THREE.ShaderMaterial({
  uniforms: post.uniforms, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, fade, flash, red, levels, gray, wobble, bright, gamma; uniform vec2 res; varying vec2 vUv;
    float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
    float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    vec3 toSRGB(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    void main(){
      vec2 uv = vUv;
      uv.x += sin(uv.y * 40.0 + time * 9.0) * 0.004 * wobble;
      vec3 c = toSRGB(texture2D(tDiffuse, uv).rgb);
      c = pow(c, vec3(gamma)) * bright;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, vec3(l), gray);
      vec2 d = vUv - 0.5; c *= 1.0 - dot(d, d) * 1.25;
      c += (hash(floor(vUv * res) + fract(time * 7.13) * 91.0) - 0.5) * 0.045;
      c = mix(c, vec3(l * 1.3, l * 0.15, l * 0.12) + vec3(0.12, 0.0, 0.0), red * 0.55);
      c += flash;
      float b = bayer4(gl_FragCoord.xy) - 0.5;
      c = floor(c * levels + b + 0.5) / levels;
      gl_FragColor = vec4(c * fade, 1.0);
    }`,
});
post.scene = new THREE.Scene();
post.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
post.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post.mat));

// ── Stage fitting (16:10 letterbox; leaves room for touch controls in portrait) ──
const stage = $('stage');
const touchUI = $('touch');
const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
function fitStage() {
  const portraitTouch = !touchUI.hidden && innerHeight > innerWidth;
  const reserve = portraitTouch ? 200 : 0;
  $('app').style.paddingBottom = reserve ? reserve + 'px' : '';
  $('app').style.justifyContent = 'center';
  const vw = innerWidth - (portraitTouch ? 32 : 0), vh = innerHeight - reserve;
  const w = Math.max(160, Math.floor(Math.min(vw, vh * 1.6)));
  stage.style.width = w + 'px';
  stage.style.height = Math.floor(w / 1.6) + 'px';
  stage.style.setProperty('--u', (w / 100).toFixed(2) + 'px');
  // touch pause button: just outside the stage's top-right corner when there is room, else inside it under the equip box
  const tp = touchUI.querySelector('.tpause');
  if (tp && !touchUI.hidden) {
    const r = stage.getBoundingClientRect(), s = 40;
    let x = r.right - s, y = r.top - s - 8;
    if (innerWidth - r.right >= s + 16) { x = r.right + 8; y = r.top + 4; }
    else if (y < 4) { x = r.right - s - w * 0.02; y = r.top + w * 0.06; }
    tp.style.left = x + 'px'; tp.style.top = y + 'px';
  }
}
addEventListener('resize', fitStage);

// ── Input ──
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'run', ShiftRight: 'run', Space: 'attack', KeyE: 'interact', Enter: 'interact', NumpadEnter: 'interact',
  KeyI: 'inv', Tab: 'inv', KeyQ: 'cycle', KeyM: 'map', Escape: 'pause', KeyP: 'pause', Backspace: 'back', Backquote: 'debug',
};
const held = {}, touchHeld = {}, padHeld = {}, stickHeld = {};
let pressed = new Set();
let runToggle = false;
// control scheme: 'tank' (classic: up walks, left/right turn) or 'modern' (camera-relative); S3's settings call setControlScheme
let CONTROLS = isTouch ? 'modern' : 'tank';
function setControlScheme(s) { CONTROLS = s === 'modern' ? 'modern' : 'tank'; onInputChange(); }
// last input source, for on-screen glyphs: 'kb' | 'touch' | 'pad'
let lastDevice = isTouch ? 'touch' : 'kb';
function setDevice(d) { if (d !== lastDevice) { lastDevice = d; onInputChange(); } }
const GLYPHS = {
  kb: { interact: 'E', attack: 'Space', inv: 'I', cycle: 'Q', map: 'M', pause: 'Esc', run: 'Shift', back: 'Backspace' },
  touch: { interact: '調', attack: '撃', inv: '持', cycle: '替', map: '持', pause: '⏸', run: '走', back: '⏸' },
  pad: { interact: 'A', attack: 'X', inv: 'Y', cycle: 'LB', map: 'Back', pause: 'Start', run: 'B', back: 'B' },
};
const glyph = (a) => GLYPHS[lastDevice][a] || a;
addEventListener('keydown', (e) => {
  const a = KEYMAP[e.code];
  if (!a) return;
  e.preventDefault();
  if (!held[a]) pressed.add(a);
  held[a] = true;
  setDevice('kb');
  audio.unlock();
});
addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) held[a] = false; });
addEventListener('pointerdown', () => audio.unlock());   // "click once to enable sound"
addEventListener('blur', () => { for (const k in held) held[k] = false; for (const k in touchHeld) touchHeld[k] = false; clearPad(); padQuiet = true; });
addEventListener('gamepaddisconnected', clearPad);

// ── Gamepad (standard mapping), polled once per frame ──
const PADMAP = { 0: ['interact'], 1: ['back', 'run'], 2: ['attack'], 3: ['inv'], 4: ['cycle'], 5: ['cycle'], 6: ['run'], 7: ['attack'], 8: ['map'], 9: ['pause'], 12: ['up'], 13: ['down'], 14: ['left'], 15: ['right'] };
const DIRS = ['up', 'down', 'left', 'right'];
const PADACTS = ['interact', 'back', 'run', 'attack', 'inv', 'cycle', 'map', 'pause', ...DIRS];
const stick = { x: 0, y: 0, mag: 0 };
const padNow = {}, padRep = { up: 0, down: 0, left: 0, right: 0 };   // held direction → time of its next menu autorepeat (0 = not held)
let padLive = false, padQuiet = false, padCtx = null;
function clearPad() {
  for (const k in padHeld) padHeld[k] = false;
  for (const k in stickHeld) stickHeld[k] = false;
  for (const k in padRep) padRep[k] = 0;
  stick.x = stick.y = stick.mag = 0; padLive = false;
}
// ctx identifies the open menu/overlay (from frame()): directions held into a newly opened one don't autorepeat until released;
// after a blur (padQuiet) whatever is still held becomes the baseline instead of a fresh press
function pollPad(ctx) {
  let gp = null;
  try { const gs = navigator.getGamepads ? navigator.getGamepads() : null; if (gs) for (let i = 0; i < gs.length; i++) if (gs[i] && gs[i].connected !== false) { gp = gs[i]; break; } } catch (_) {}
  const reopen = ctx !== padCtx; padCtx = ctx;
  if (!gp) { if (padLive) clearPad(); padQuiet = false; return; }
  padLive = true;
  // left stick: radial deadzone, rescaled to 0..1; y is up/away (the pad's axis 1 is +down)
  const ax = gp.axes[0] || 0, ay = -(gp.axes[1] || 0), m = Math.hypot(ax, ay);
  const k = m < 0.2 ? 0 : Math.min(1, (m - 0.2) / 0.75) / m;
  stick.x = ax * k; stick.y = ay * k; stick.mag = Math.min(1, m * k);
  stickHeld.up = stickHeld.up ? stick.y > 0.35 : stick.y > 0.5; stickHeld.down = stickHeld.down ? -stick.y > 0.35 : -stick.y > 0.5;
  stickHeld.left = stickHeld.left ? -stick.x > 0.35 : -stick.x > 0.5; stickHeld.right = stickHeld.right ? stick.x > 0.35 : stick.x > 0.5;
  for (const a of PADACTS) padNow[a] = false;
  const bs = gp.buttons;
  for (let i = 0; i < bs.length; i++) { const b = bs[i], acts = PADMAP[i]; if (acts && b && (b.pressed || b.value > 0.5)) for (const a of acts) padNow[a] = true; }
  const t = performance.now(); let edge = false;
  for (const a of PADACTS) {
    const dir = a in padRep, on = padNow[a] || (dir && stickHeld[a]), was = !!padHeld[a] || (dir && padRep[a] > 0);
    if (on && !was && !padQuiet) { pressed.add(a); edge = true; if (dir) padRep[a] = t + 350; }
    else if (on && dir && (reopen || padQuiet)) padRep[a] = Infinity;               // held into a new menu: wait for release
    else if (on && dir && t >= padRep[a]) { pressed.add(a); padRep[a] = t + 110; }   // menu autorepeat
    if (!on && dir) padRep[a] = 0;
    padHeld[a] = padNow[a];
  }
  padQuiet = false;
  if (edge || stick.mag > 0.15) setDevice('pad');
  if (edge) audio.unlock();
}
// movement intent {x right, y up/away, mag 0..1}: digital directions (8-way, normalised) merged with the left stick (reused object)
const moveV = { x: 0, y: 0, mag: 0, analog: false };
const digDir = (a) => !!held[a] || !!touchHeld[a] || !!padHeld[a];
const input = {
  down: (a) => !!held[a] || !!touchHeld[a] || !!padHeld[a] || !!stickHeld[a] || (a === 'run' && runToggle),
  hit: (a) => pressed.has(a),
  consume: (a) => pressed.delete(a),
  endFrame: () => { pressed.clear(); },
  poll: pollPad,
  move() {
    let x = (digDir('right') ? 1 : 0) - (digDir('left') ? 1 : 0), y = (digDir('up') ? 1 : 0) - (digDir('down') ? 1 : 0);
    const analog = !x && !y && stick.mag > 0;
    const l = Math.hypot(x, y); if (l) { x /= l; y /= l; }
    x += stick.x; y += stick.y;
    const mag = Math.min(1, Math.hypot(x, y)), n = Math.hypot(x, y) || 1;
    moveV.x = x / n * mag; moveV.y = y / n * mag; moveV.mag = mag; moveV.analog = analog;
    return moveV;
  },
};
if (isTouch) {
  touchUI.hidden = false;
  touchUI.querySelectorAll('button').forEach((b) => {
    const k = b.dataset.k;
    const on = (e) => {
      e.preventDefault(); audio.unlock(); setDevice('touch');
      if (b.dataset.toggle) { runToggle = !runToggle; b.classList.toggle('on', runToggle); return; }
      if (!touchHeld[k]) pressed.add(k);
      touchHeld[k] = true; b.classList.add('on');
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const off = () => { if (b.dataset.toggle) return; touchHeld[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('lostpointercapture', off);
  });
}

// ── Collision: circles against axis-aligned boxes on the floor plane ──
function pushOut(p, r, boxes, filter) {
  for (let iter = 0; iter < 2; iter++) {
    for (const b of boxes) {
      if (filter && !filter(b)) continue;
      const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2), k = (r - d) / d;
        p.x += dx * k; p.z += dz * k;
      } else {
        // centre inside the box: leave through the nearest face
        const l = p.x - b.x0, rr = b.x1 - p.x, t = p.z - b.z0, bt = b.z1 - p.z, m = Math.min(l, rr, t, bt);
        if (m === l) p.x = b.x0 - r; else if (m === rr) p.x = b.x1 + r; else if (m === t) p.z = b.z0 - r; else p.z = b.z1 + r;
      }
    }
  }
}
const inRect = (x, z, r, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

// ── Static geometry merging (one draw call per material & shadow setting) ──
function mergeMeshes(meshes) {
  const groups = new Map();
  for (const m of meshes) {
    const key = m.material.uuid + (m.castShadow ? 'c' : '') + (m.receiveShadow ? 'r' : '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }
  const out = [];
  for (const list of groups.values()) {
    const parts = list.map((m) => {
      m.updateWorldMatrix(true, false);
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      return g;
    });
    const hasUV = parts.every((g) => g.attributes.uv);
    let n = 0; for (const g of parts) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = hasUV ? new Float32Array(n * 2) : null;
    let o = 0;
    for (const g of parts) {
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      if (uv) uv.set(g.attributes.uv.array, o * 2);
      o += g.attributes.position.count;
      g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, list[0].material);
    mesh.castShadow = list[0].castShadow; mesh.receiveShadow = list[0].receiveShadow;
    mesh.matrixAutoUpdate = false;
    out.push(mesh);
  }
  return out;
}

// Flat-shaded material cache: the 1992 look is faceted polygons, so everything is Lambert + flatShading.
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
  matCache.set(key, m);
  return m;
}
