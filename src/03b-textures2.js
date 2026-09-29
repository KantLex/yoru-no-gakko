
// ───────────────────────── textures for the second half of the school ─────────────────────────
function makeSign(s) {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#f1efe6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a6a6a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = s === '屋上' || s === '書庫' ? '#b0282c' : '#1d1d24'; g.font = `bold 34px ${FONT_SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + 2);
  });
}
function buildTextures2() {
  for (const s of ['保健室', '理科室', '体育館', '東階段', '３年Ａ組', '３年Ｂ組', '図書室', '書庫', '屋上', '体育倉庫']) TEX.signs[s] = makeSign(s);
  TEX.court = canvasTex(1024, 820, (g, w, h) => {
    for (let x = 0; x < w; x += 22) { const v = rand(-12, 12); g.fillStyle = `rgb(${176 + v},${128 + v},${76 + v})`; g.fillRect(x, 0, 22, h); g.fillStyle = 'rgba(60,30,10,.25)'; g.fillRect(x, 0, 1, h); }
    speckle(g, w, h, 3000, 0.08);
    g.strokeStyle = 'rgba(245,245,235,.85)'; g.lineWidth = 5;
    const m = 60; g.strokeRect(m, m, w - m * 2, h - m * 2);
    g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w / 2, h - m); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 90, 0, TAU); g.stroke();
    for (const s of [-1, 1]) {
      const ex = s < 0 ? m : w - m;
      g.strokeRect(s < 0 ? ex : ex - 190, h / 2 - 75, 190, 150);
      g.beginPath(); g.arc(ex + s * 190, h / 2, 75, s < 0 ? -Math.PI / 2 : Math.PI / 2, s < 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke();
      g.beginPath(); g.arc(ex, h / 2, 330, s < 0 ? -1.2 : Math.PI - 1.2, s < 0 ? 1.2 : Math.PI + 1.2); g.stroke();
    }
    g.strokeStyle = 'rgba(230,200,60,.6)'; g.lineWidth = 4; g.strokeRect(150, 140, w - 300, h - 280);
  });
  TEX.eyechart = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#111'; let y = 24;
    [18, 13, 10, 8, 6, 5, 4].forEach((r) => {
      const n = Math.floor(100 / (r * 3));
      for (let i = 0; i < n; i++) { const x = 64 + (i - (n - 1) / 2) * r * 3; g.lineWidth = r * 0.4; const a = Math.floor(Math.random() * 4) * Math.PI / 2; g.beginPath(); g.arc(x, y, r, a + 0.35, a + TAU - 0.35); g.stroke(); }
      y += r * 2.6 + 6;
    });
    g.fillStyle = '#b0282c'; g.font = `18px ${FONT_HAND}`; g.textAlign = 'center'; g.fillText('みつけて', 64, 238);
  });
  TEX.labboard = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#23402f'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(235,238,225,.85)'; g.font = `38px ${FONT_HAND}`; g.textBaseline = 'top';
    g.fillText('NaCl → Na⁺ + Cl⁻', 50, 40); g.fillText('H₂O', 60, 120);
    g.font = `26px ${FONT_HAND}`; g.fillText('第３章　人体のしくみ', 420, 40);
    g.strokeStyle = 'rgba(235,238,225,.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(560, 150, 40, 60, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(560, 210); g.lineTo(560, 240); g.stroke();
    g.fillStyle = 'rgba(235,210,210,.6)'; g.font = `22px ${FONT_HAND}`; g.fillText('こっくりさん　こっくりさん　おいでください', 620, 190);
  });
  TEX.kokkuri = canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = '#ece2c8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b0282c'; g.fillRect(112, 8, 32, 5); g.fillRect(116, 16, 24, 3); g.fillRect(118, 10, 4, 22); g.fillRect(134, 10, 4, 22);
    g.fillStyle = '#2a1c14'; g.font = `12px ${FONT_HAND}`; g.fillText('はい', 40, 24); g.fillText('いいえ', 190, 24);
    g.font = `9px ${FONT_HAND}`;
    for (let i = 0; i < 10; i++) g.fillText(String(i), 22 + i * 22, 50);
    const kana = ['わをん', 'らりるれろ', 'やゆよ', 'まみむめも', 'はひふへほ', 'なにぬねの', 'たちつてと', 'さしすせそ', 'かきくけこ', 'あいうえお'];
    kana.forEach((col, c) => [...col].forEach((ch, r) => g.fillText(ch, 20 + c * 22, 70 + r * 18)));
  });
  TEX.books = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#3a2a1c'; g.fillRect(0, 0, w, h);
    const cols = ['#6a1c1c', '#1c3a5a', '#2a4a2a', '#5a4a1c', '#3a2a4a', '#7a6a50', '#20202a', '#8a3a20'];
    for (let r = 0; r < 4; r++) {
      let x = 2; const y = r * 64;
      g.fillStyle = '#5a4028'; g.fillRect(0, y + 58, w, 6);
      while (x < w - 4) {
        const bw = rand(6, 14), bh = rand(34, 54);
        g.fillStyle = cols[Math.floor(Math.random() * cols.length)]; g.fillRect(x, y + 58 - bh, bw, bh);
        g.fillStyle = 'rgba(255,230,160,.35)'; g.fillRect(x + 1, y + 58 - bh + 6, bw - 2, 2);
        x += bw + 1;
      }
    }
    speckle(g, w, h, 600, 0.15);
  });
  TEX.fence = canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(170,180,190,1)'; g.lineWidth = 2;
    for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
  });
  TEX.concrete = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#6e6f6c'; g.fillRect(0, 0, w, h); speckle(g, w, h, 4000, 0.18); speckle(g, w, h, 1500, 0.08, true);
    g.fillStyle = 'rgba(20,20,20,.4)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(30,40,30,${rand(0.05, 0.15)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(10, 50), rand(8, 30), 0, 0, TAU); g.fill(); }
  });
  TEX.shutter = canvasTex(64, 128, (g, w, h) => {
    for (let y = 0; y < h; y += 8) { g.fillStyle = '#7d8480'; g.fillRect(0, y, w, 5); g.fillStyle = '#4e5552'; g.fillRect(0, y + 5, w, 3); }
    speckle(g, w, h, 300, 0.2);
  });
  TEX.curtain = canvasTex(128, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) { const v = 215 + Math.sin(x * 0.35) * 25; g.fillStyle = `rgb(${v},${v + 4},${v + 2})`; g.fillRect(x, 0, 1, h); }
  });
  TEX.art = canvasTex(256, 96, (g, w, h) => {
    for (let i = 0; i < 3; i++) {
      const x = 8 + i * 84; g.fillStyle = '#f2eee2'; g.fillRect(x, 8, 76, 80);
      g.fillStyle = ['#e0b090', '#d8a888', '#e8c0a0'][i]; g.beginPath(); g.ellipse(x + 38, 44, 22, 28, 0, 0, TAU); g.fill();
      g.fillStyle = '#222'; g.fillRect(x + 16, 14, 44, 14);
      g.strokeStyle = 'rgba(10,10,10,.9)'; g.lineWidth = 3;
      for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(x + 18 + rand(0, 40), 30 + rand(0, 30)); g.lineTo(x + 18 + rand(0, 40), 30 + rand(0, 30)); g.stroke(); }
    }
  });
  TEX.healthPoster = canvasTex(128, 180, (g, w, h) => {
    g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a8a5a'; g.font = `bold 18px ${FONT_SANS}`; g.fillText('保健だより', 14, 30);
    g.fillStyle = '#444'; for (let i = 0; i < 7; i++) g.fillRect(14, 48 + i * 14, rand(60, 100), 4);
    g.fillStyle = '#e07a4a'; g.beginPath(); g.arc(90, 150, 18, 0, TAU); g.fill();
  });
  TEX.cloth = canvasTex(32, 64, (g, w, h) => { g.fillStyle = '#e8e6de'; g.fillRect(0, 0, w, h); speckle(g, w, h, 120, 0.1); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 2, h); });
  TEX.board3b = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#23402f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(220,230,220,${rand(0.02, 0.06)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(30, 140), rand(8, 30), rand(0, 3), 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(235,238,225,.9)'; g.textBaseline = 'top';
    g.font = `40px ${FONT_HAND}`; g.fillText('文化祭の出し物', 60, 40);
    g.font = `84px ${FONT_HAND}`; g.fillText('お化け屋敷', 90, 100);
    g.fillStyle = 'rgba(240,140,140,.85)'; g.font = `46px ${FONT_HAND}`; g.fillText('← 本物', 560, 130);
    g.fillStyle = 'rgba(235,238,225,.7)'; g.font = `26px ${FONT_HAND}`; g.fillText('係：受付・おどかし役・かごめかごめ', 620, 40);
  });
  TEX.register = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a7a60';
    for (let y = 16; y < h; y += 10) { g.beginPath(); g.moveTo(8, y); g.lineTo(w - 8, y); g.stroke(); }
    g.fillStyle = '#3a2a20'; for (let y = 22; y < h; y += 10) g.fillRect(12, y - 5, rand(30, 60), 3);
    g.fillStyle = '#f4f2ec'; g.fillRect(10, 62, 70, 8);
  });
}
