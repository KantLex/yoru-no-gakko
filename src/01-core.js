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
  },
};
post.mat = new THREE.ShaderMaterial({
  uniforms: post.uniforms, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, fade, flash, red, levels, gray, wobble; uniform vec2 res; varying vec2 vUv;
    float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
    float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    vec3 toSRGB(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    void main(){
      vec2 uv = vUv;
      uv.x += sin(uv.y * 40.0 + time * 9.0) * 0.004 * wobble;
      vec3 c = toSRGB(texture2D(tDiffuse, uv).rgb);
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
}
addEventListener('resize', fitStage);

// ── Input ──
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'run', ShiftRight: 'run', Space: 'attack', KeyE: 'interact', Enter: 'interact', NumpadEnter: 'interact',
  KeyI: 'inv', Tab: 'inv', KeyQ: 'cycle', KeyM: 'map', Escape: 'pause', KeyP: 'pause', Backquote: 'debug',
};
const held = {}, touchHeld = {};
let pressed = new Set();
let runToggle = false;
addEventListener('keydown', (e) => {
  const a = KEYMAP[e.code];
  if (!a) return;
  e.preventDefault();
  if (!held[a]) pressed.add(a);
  held[a] = true;
  audio.unlock();
});
addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) held[a] = false; });
addEventListener('blur', () => { for (const k in held) held[k] = false; for (const k in touchHeld) touchHeld[k] = false; });
const input = {
  down: (a) => !!held[a] || !!touchHeld[a] || (a === 'run' && runToggle),
  hit: (a) => pressed.has(a),
  consume: (a) => pressed.delete(a),
  endFrame: () => { pressed = new Set(); },
};
if (isTouch) {
  touchUI.hidden = false;
  touchUI.querySelectorAll('button').forEach((b) => {
    const k = b.dataset.k;
    const on = (e) => {
      e.preventDefault(); audio.unlock();
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
