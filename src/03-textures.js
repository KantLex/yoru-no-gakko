
// ───────────────────────── textures: all painted on canvases at boot ─────────────────────────
const FONT_HAND = '"Klee One", "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif';
const FONT_SANS = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", "Meiryo", sans-serif';
const FONT_BRUSH = '"Yuji Syuku", "Hiragino Mincho ProN", "Yu Mincho", serif';

function canvasTex(w, h, draw, nearest = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  return t;
}
function speckle(g, w, h, n, alpha, light = false) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = light ? `rgba(255,255,255,${Math.random() * alpha})` : `rgba(0,0,0,${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, rand(1, 3), rand(1, 3));
  }
}
function vtext(g, str, x, y, size, step) { // vertical Japanese writing, top to bottom
  [...str].forEach((ch, i) => g.fillText(ch, x, y + i * (step || size * 1.05)));
}

const TEX = {};
function buildTextures() {
  TEX.wood = canvasTex(256, 256, (g, w, h) => {
    for (let r = 0; r < 8; r++) {
      const base = [92, 64, 40].map((v) => v + rand(-14, 12));
      g.fillStyle = `rgb(${base})`; g.fillRect(0, r * 32, w, 32);
      for (let k = 0; k < 16; k++) { g.strokeStyle = `rgba(40,24,12,${rand(0.08, 0.25)})`; g.beginPath(); const y = r * 32 + rand(2, 30); g.moveTo(0, y); g.bezierCurveTo(80, y + rand(-3, 3), 170, y + rand(-3, 3), 256, y + rand(-2, 2)); g.stroke(); }
      g.fillStyle = 'rgba(20,10,4,.7)'; g.fillRect(0, r * 32, w, 2);
      const cut = (r * 97) % 256; g.fillRect(cut, r * 32, 2, 32);
    }
    speckle(g, w, h, 900, 0.12);
  });
  TEX.lino = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#7f8b80'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2500, 0.18); speckle(g, w, h, 900, 0.12, true);
    g.fillStyle = 'rgba(30,36,32,.35)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(0, 127, w, 2); g.fillRect(127, 0, 2, h);
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(20, 40, 180, 60);
  });
  TEX.tile = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8f9894'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = rand(-10, 10); g.fillStyle = `rgb(${205 + v},${214 + v},${216 + v})`; g.fillRect(x * 32 + 2, y * 32 + 2, 28, 28);
      if (Math.random() < 0.1) { g.fillStyle = 'rgba(90,70,40,.25)'; g.fillRect(x * 32 + 2, y * 32 + rand(8, 26), 28, rand(3, 8)); }
    }
    speckle(g, w, h, 300, 0.12);
  });
  TEX.floortile = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#5b6260'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = rand(-8, 8); g.fillStyle = `rgb(${120 + v},${128 + v},${126 + v})`; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); }
    speckle(g, w, h, 1500, 0.2);
  });
  TEX.plaster = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c9c1ab'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, 0.07); speckle(g, w, h, 1200, 0.06, true);
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(90,80,60,${rand(0.02, 0.06)})`; g.fillRect(rand(0, w), 0, rand(4, 30), h); }
  });
  TEX.ceiling = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#bdb9ad'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(60,55,45,.55)';
    for (let y = 4; y < h; y += 7) for (let x = 4; x < w; x += 7) if (Math.random() < 0.8) g.fillRect(x + rand(-1, 1), y + rand(-1, 1), 2, 2);
    g.fillStyle = 'rgba(40,36,30,.6)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
  });
  TEX.panel = canvasTex(128, 128, (g, w, h) => { // lower-wall wainscot, varnished
    g.fillStyle = '#5a3f28'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 2, h); }
    speckle(g, w, h, 600, 0.15);
  });
  TEX.blackboard = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#23402f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(220,230,220,${rand(0.02, 0.06)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(30, 140), rand(8, 30), rand(0, 3), 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(235,238,225,.92)'; g.textBaseline = 'top';
    g.font = `44px ${FONT_HAND}`; g.fillText('10月13日（金）', 40, 30);
    g.font = `92px ${FONT_HAND}`; g.fillText('自　習', 380, 70);
    g.font = `26px ${FONT_HAND}`; g.fillText('プリント p.12〜15 を', 360, 190);
    g.font = `40px ${FONT_HAND}`; vtext(g, '日直', 930, 26, 40); vtext(g, '花子', 975, 26, 40);
    g.save(); g.translate(150, 190); g.rotate(-0.12); g.fillStyle = 'rgba(235,225,225,.7)'; g.font = `30px ${FONT_HAND}`; g.fillText('たすけて', 0, 0); g.restore();
    g.fillStyle = 'rgba(200,210,200,.25)'; g.fillRect(0, h - 10, w, 10);
  });
  TEX.staffboard = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#23402f'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(240,240,220,.55)'; g.lineWidth = 2;
    for (const top of [40, 150]) for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(30, top + i * 12); g.lineTo(w - 30, top + i * 12); g.stroke(); }
    g.fillStyle = 'rgba(240,240,225,.85)';
    const notes = [3, 3, 4, 3, 3, 3, 1, 0, 3, 5, 4, 3, 1, 0];
    notes.forEach((n, i) => { g.beginPath(); g.ellipse(90 + i * 62, 88 - n * 6, 8, 6, -0.4, 0, TAU); g.fill(); g.fillRect(97 + i * 62, 88 - n * 6 - 34, 2, 34); });
    g.font = `30px ${FONT_HAND}`; g.fillText('♪ 夜の歌 — 最後まで弾いてはいけない', 60, 218);
  });
  TEX.sky = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#04060e'); gr.addColorStop(0.65, '#16203a'); gr.addColorStop(1, '#27304a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(220,230,255,${rand(0.2, 0.9)})`; g.fillRect(rand(0, w), rand(0, h * 0.6), 1, 1); }
    const mx = 360, my = 60, rg = g.createRadialGradient(mx, my, 6, mx, my, 70); rg.addColorStop(0, 'rgba(200,215,255,.5)'); rg.addColorStop(1, 'rgba(200,215,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h); g.fillStyle = '#e8edf8'; g.beginPath(); g.arc(mx, my, 16, 0, TAU); g.fill();
    g.fillStyle = '#0b0e18'; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.72 - Math.sin(x * 0.012) * 18 - Math.sin(x * 0.041) * 8);
    g.lineTo(w, h); g.fill();
    g.fillStyle = '#05070c';
    for (let x = 0; x < w; x += rand(14, 34)) { const bh = rand(10, 34); g.fillRect(x, h - bh - 20, rand(10, 26), bh + 20); }
    for (let x = 10; x < w; x += rand(40, 90)) { g.beginPath(); g.arc(x, h - 40, rand(10, 22), 0, TAU); g.fill(); }
  });
  TEX.exit = canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#1fbf6a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4fff8'; g.fillRect(78, 8, 38, 48); g.fillStyle = '#1fbf6a'; g.fillRect(84, 14, 26, 42);
    g.strokeStyle = '#f4fff8'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(44, 14, 6, 0, TAU); g.fillStyle = '#f4fff8'; g.fill();
    g.beginPath(); g.moveTo(40, 22); g.lineTo(34, 38); g.lineTo(46, 46); g.lineTo(44, 58); g.moveTo(34, 38); g.lineTo(20, 52); g.moveTo(38, 28); g.lineTo(56, 34); g.moveTo(38, 28); g.lineTo(24, 30); g.stroke();
  }, true);
  TEX.lockers = canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#6e5238'; g.fillRect(0, 0, w, h);
    const cols = 10, rows = 3, cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      g.fillStyle = '#140d08'; g.fillRect(c * cw + 2, r * rh + 2, cw - 4, rh - 4);
      if (Math.random() < 0.45) { g.fillStyle = ['#2a3350', '#4a2020', '#3a3a3a', '#6a5a3a'][Math.floor(Math.random() * 4)]; g.fillRect(c * cw + 4, r * rh + rh * 0.35, cw - 8, rh * 0.6); }
    }
  });
  TEX.getabako = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a8676'; g.fillRect(0, 0, w, h);
    const cols = 4, rows = 5, cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * cw, y = r * rh;
      g.fillStyle = '#6a6658'; g.fillRect(x + 3, y + 3, cw - 6, rh - 6);
      g.fillStyle = '#9d998a'; g.fillRect(x + 6, y + 6, cw - 12, rh - 12);
      g.fillStyle = '#e9e5d2'; g.fillRect(x + cw / 2 - 16, y + 12, 32, 12);
      g.fillStyle = '#333'; g.font = `9px ${FONT_SANS}`; g.fillText(['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'][(r * 4 + c) % 10], x + cw / 2 - 10, y + 22);
      g.fillStyle = '#4a473e'; g.fillRect(x + cw / 2 - 6, y + rh - 16, 12, 4);
    }
    speckle(g, w, h, 500, 0.15);
  });
  TEX.vending = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#d9dde4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#eef6ff'; g.fillRect(8, 10, w - 16, 130);
    const cols = ['#2d6fd0', '#d23a3a', '#f0c030', '#40a060', '#80c8f0', '#f08030'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      g.fillStyle = cols[(r * 5 + c) % cols.length]; g.fillRect(14 + c * 21, 18 + r * 40, 14, 28);
      g.fillStyle = '#fff'; g.fillRect(16 + c * 21, 20 + r * 40, 3, 20);
      g.fillStyle = r === 2 ? '#d03030' : '#2060d0'; g.fillRect(14 + c * 21, 50 + r * 40, 14, 5);
    }
    g.fillStyle = '#2060d0'; g.font = `bold 13px ${FONT_SANS}`; g.fillText('つめた〜い', 26, 158);
    g.fillStyle = '#333'; g.fillRect(84, 170, 26, 34); g.fillRect(20, 214, 88, 26);
    g.fillStyle = '#111'; g.fillRect(24, 218, 80, 18);
  });
  TEX.lantern = canvasTex(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f3c77c'); gr.addColorStop(0.5, '#ffe2a8'); gr.addColorStop(1, '#e9a855');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,60,20,.55)'; for (let y = 6; y < h; y += 10) g.fillRect(0, y, w, 2);
    g.fillStyle = '#b3242a'; g.font = `64px ${FONT_BRUSH}`; g.textBaseline = 'middle'; g.fillText('祭', 150, 66);
    speckle(g, w, h, 300, 0.1);
  });
  TEX.wagasa = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#8c1f28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8dcc4'; g.fillRect(0, h * 0.28, w, h * 0.16);
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, h * 0.8, w, 3);
    speckle(g, w, h, 400, 0.18);
  });
  TEX.mirror = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4654'); gr.addColorStop(0.5, '#1c232c'); gr.addColorStop(1, '#2c3642');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(rand(0, w), 0); g.lineTo(rand(0, w), h); g.stroke(); }
  });
  TEX.crt = canvasTex(64, 48, (g, w, h) => {
    g.fillStyle = '#10243a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(160,200,255,${rand(0, 0.35)})`; g.fillRect(rand(0, w), rand(0, h), 1, 1); }
    g.fillStyle = 'rgba(200,230,255,.8)'; g.font = '8px monospace'; g.fillText('C:\\>_', 4, 12);
  }, true);
  TEX.schedule = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#e8e8e2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#555'; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#222'; g.font = `26px ${FONT_SANS}`; g.fillText('十月　行事予定', 24, 42);
    g.font = `16px ${FONT_HAND}`;
    const rows = ['13(金) 宿直：黒田', '14(土) 部活動', '20(金) 中間テスト', '28(土) 文化祭', '31(火) 避難訓練'];
    rows.forEach((r, i) => { g.fillStyle = i === 0 ? '#b0282c' : '#223'; g.fillText(r, 30, 80 + i * 32); g.fillStyle = '#bbb'; g.fillRect(24, 88 + i * 32, w - 48, 1); });
    g.fillStyle = 'rgba(176,40,44,.8)'; g.font = `22px ${FONT_HAND}`; g.fillText('顔を見るな', 330, 210);
  });
  TEX.notice = canvasTex(256, 192, (g, w, h) => {
    g.fillStyle = '#6b4b2e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a58a60'; g.fillRect(8, 8, w - 16, h - 16);
    const papers = [['廊下を走るな！', '#f2f0e6', '#c02020'], ['手洗い・うがい', '#e8f2ff', '#2050a0'], ['文化祭 10/28', '#fff2c8', '#a05010'], ['探しています', '#f2f2f2', '#222']];
    papers.forEach(([t, bg, fg], i) => {
      const x = 16 + (i % 2) * 118, y = 16 + Math.floor(i / 2) * 86;
      g.save(); g.translate(x + 50, y + 38); g.rotate(rand(-0.06, 0.06)); g.fillStyle = bg; g.fillRect(-50, -38, 104, 78);
      g.fillStyle = fg; g.font = `bold 15px ${FONT_SANS}`; g.fillText(t, -46, -14);
      g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 4; k++) g.fillRect(-44, 0 + k * 8, rand(50, 90), 3);
      if (t === '探しています') { g.fillStyle = '#555'; g.fillRect(-10, -8, 26, 30); g.fillStyle = '#ccc'; g.fillRect(-6, -4, 18, 10); }
      g.fillStyle = '#c33'; g.beginPath(); g.arc(0, -34, 3, 0, TAU); g.fill(); g.restore();
    });
  });
  TEX.keybox = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#6f746f'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8bcb4'; g.fillRect(6, 6, w - 12, h - 12);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      const x = 16 + c * 22, y = 16 + r * 27; g.fillStyle = '#444'; g.fillRect(x, y, 3, 3);
      if (!(r === 3 && c === 1)) { g.fillStyle = '#c8a040'; g.fillRect(x - 1, y + 4, 5, 12); g.fillStyle = ['#e04040', '#4060e0', '#40a060', '#e0e0e0'][r]; g.fillRect(x - 2, y + 16, 7, 5); }
    }
  });
  TEX.stall = canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#c9a9a6'; g.fillRect(0, 0, w, h); speckle(g, w, h, 300, 0.12); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(4, 4, w - 8, 2); });
  TEX.wordsStall = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#c9a9a6'; g.fillRect(0, 0, w, h); speckle(g, w, h, 300, 0.12); g.fillStyle = '#6a1418'; g.font = `22px ${FONT_HAND}`; g.fillText('三回', 20, 50); g.fillText('ノック', 30, 82); });
  TEX.doorWood = canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = '#7a5a3c'; g.fillRect(0, 0, w, h); speckle(g, w, h, 400, 0.18);
    g.fillStyle = '#1b2230'; g.fillRect(10, 14, w - 20, 40); g.fillStyle = 'rgba(160,180,230,.25)'; g.fillRect(12, 16, 10, 36);
    g.fillStyle = '#3a2a1a'; g.fillRect(w - 12, 64, 4, 18);
  });
  TEX.frosted = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#6d7a92'; g.fillRect(0, 0, w, h); speckle(g, w, h, 500, 0.25, true); });
  TEX.eye = canvasTex(64, 64, (g) => { g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111'; g.beginPath(); g.arc(34, 32, 13, 0, TAU); g.fill(); g.fillStyle = '#c02020'; g.beginPath(); g.arc(34, 32, 6, 0, TAU); g.fill(); });
  TEX.portraits = ['ベートーヴェン', 'バッハ', 'モーツァルト', 'ショパン', '滝廉太郎'].map((name, i) => canvasTex(96, 128, (g, w, h) => {
    g.fillStyle = '#3a2716'; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(48, 50, 4, 48, 56, 60); gr.addColorStop(0, '#5a4028'); gr.addColorStop(1, '#1a1008'); g.fillStyle = gr; g.fillRect(6, 6, w - 12, h - 30);
    g.fillStyle = ['#5a4a3a', '#d8d4c8', '#e0dcd0', '#3a2a1a', '#1a1410'][i]; g.beginPath(); g.ellipse(48, 46, i === 1 || i === 2 ? 30 : 24, 30, 0, 0, TAU); g.fill();
    g.fillStyle = '#c8a888'; g.beginPath(); g.ellipse(48, 52, 15, 20, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a120a'; g.fillRect(6, 78, w - 12, 24); g.fillStyle = '#eee'; g.fillRect(40, 74, 16, 10);
    g.fillStyle = '#d8c090'; g.font = `10px ${FONT_SANS}`; g.fillText(name, 8, h - 10);
    g.strokeStyle = '#a07a30'; g.lineWidth = 5; g.strokeRect(2, 2, w - 4, h - 4);
  }));
  TEX.signs = {};
  for (const s of ['２年Ａ組', '２年Ｂ組', '女子トイレ', '音楽室', '職員室', '西階段', '昇降口']) {
    TEX.signs[s] = canvasTex(256, 64, (g, w, h) => {
      g.fillStyle = '#f1efe6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a6a6a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
      g.fillStyle = s === '女子トイレ' ? '#b0282c' : '#1d1d24'; g.font = `bold 34px ${FONT_SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + 2);
    });
  }
}

// Box UVs scaled to world size, so one texture repeat covers `scale` metres on every face.
function worldUV(geo, w, h, d, scale) {
  const uv = geo.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
    const i = f * 4 + v;
    uv.setXY(i, uv.getX(i) * dims[f][0] / scale, uv.getY(i) * dims[f][1] / scale);
  }
  uv.needsUpdate = true;
  return geo;
}
