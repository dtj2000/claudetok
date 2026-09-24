/* A perfectly symmetrical pastel storybook film in two parts.
 * Part 1: The Concierge (two bells, rung at once, for symmetry).
 * Part 2: The Missing GPU (it went up a pink mountain by funicular. to cold storage). */
(function () {
  'use strict';
  const D = 11;
  const TAU = Math.PI * 2;
  const SERIF = 'Georgia, "Times New Roman", serif';
  const PINK = '#F7CAD5', ROSE = '#EDA3B7', MAUVE = '#C47A97', BURG = '#8C3B5A', LILAC = '#CDB8E6',
    MINT = '#BFE6D2', CREAM = '#FBF1E1', GOLD = '#E6C067', PLUM = '#54397D';

  const T_CH1 = 2.0, T_LOBBY = 2.9, T_BELL = 3.15, T_WL = 4.4, T_BOY = 4.65, T_WR = 5.4, T_ZOOM = 5.65,
    T_CH2 = 6.2, T_FUNI = 7.1, T_ARRIVE = 9.6, T_IRIS = 10.2;
  const WHIP = 0.25;
  const IRIS_X = 540, IRIS_Y = 690;

  /* ---------------- helpers ---------------- */
  function mirror(ctx, fn) {
    fn();
    ctx.save(); ctx.translate(1080, 0); ctx.scale(-1, 1); fn(); ctx.restore();
  }
  const win = (t, a, b, f = 0.12) => P.clamp(Math.min((t - a) / f, (b - t) / f));

  function hat(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y);
    P.rect(ctx, -s * 0.5, -s * 0.66, s, s * 0.66, P.C.purple, { radius: s * 0.12, seed: 31 });
    ctx.fillStyle = GOLD; ctx.fillRect(-s * 0.5, -s * 0.24, s, s * 0.12);
    P.rect(ctx, -s * 0.66, -s * 0.08, s * 1.32, s * 0.16, PLUM, { radius: s * 0.08, seed: 32, shadow: false });
    P.dot(ctx, 0, -s * 0.68, s * 0.1, GOLD);
    ctx.restore();
  }

  /** the deadpan face: dot eyes, flat mouth. concern = symmetrical worried brows */
  function deadFace(ctx, x, y, s, o = {}) {
    const look = (o.look || 0) * s * 0.08;
    ctx.save();
    ctx.fillStyle = P.C.ink; ctx.strokeStyle = P.C.ink; ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, s * 0.08);
    const h = Math.max(0.1, 1 - (o.blink || 0));
    [-1, 1].forEach(sx => {
      ctx.beginPath(); ctx.ellipse(x + sx * s * 0.36 + look, y - s * 0.05, s * 0.09, s * 0.1 * h, 0, 0, TAU); ctx.fill();
      if (o.concern) {
        ctx.beginPath();
        ctx.moveTo(x + sx * s * 0.56, y - s * 0.28);
        ctx.lineTo(x + sx * s * 0.2, y - s * 0.42);
        ctx.stroke();
      }
    });
    ctx.beginPath(); ctx.moveTo(x - s * 0.13, y + s * 0.26); ctx.lineTo(x + s * 0.13, y + s * 0.26); ctx.stroke();
    ctx.fillStyle = 'rgba(240,110,120,0.4)';
    [-1, 1].forEach(sx => { ctx.beginPath(); ctx.ellipse(x + sx * s * 0.6, y + s * 0.16, s * 0.13, s * 0.07, 0, 0, TAU); ctx.fill(); });
    ctx.restore();
  }

  function concierge(ctx, x, y, r, t, o = {}) {
    P.claude(ctx, x, y, r, { t, mood: 'none', wiggle: 0.4 });
    deadFace(ctx, x, y + r * 0.02, r * 0.42, o);
    hat(ctx, x, y - r * 0.44 - (o.hop || 0), r * 0.5);
  }

  const ledCol = (k, t) => [P.C.green, '#7CFC9A', P.C.claude, '#fff'][Math.floor(P.hash(k * 3.3 + P.boil(t, 3) * 7.1) * 4)];

  function gpuCard(ctx, x, y, s, t, seed) {
    P.rect(ctx, x - 45 * s, y - 26 * s, 90 * s, 52 * s, '#3E8E5E', { radius: 6, seed, shadow: { blur: 4, dy: 3, alpha: 0.3 } });
    [-1, 1].forEach(k => {
      const fx = x + k * 21 * s;
      P.dot(ctx, fx, y, 17 * s, '#2b2b33');
      ctx.save(); ctx.strokeStyle = '#6b6b78'; ctx.lineWidth = 3 * s;
      for (let b = 0; b < 3; b++) {
        const a = t * 9 * k + b * TAU / 3;
        ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx + Math.cos(a) * 14 * s, y + Math.sin(a) * 14 * s); ctx.stroke();
      }
      ctx.restore();
    });
    ctx.fillStyle = GOLD; ctx.fillRect(x - 36 * s, y + 24 * s, 72 * s, 6 * s);
  }

  function narrate(ctx, str, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    P.rect(ctx, 110, 1345, 860, 136, CREAM, { radius: 10, seed: 71 });
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(126, 1361, 828, 104);
    P.text(ctx, str, 540, 1414, { size: 38, font: SERIF, color: BURG, shadow: false, weight: 'italic 400', maxWidth: 790 });
    ctx.restore();
  }

  function centeredSticker(ctx, str, pop) {
    if (pop <= 0) return;
    const w = P.measure(ctx, str, { size: 48, font: 'marker' }) + 48 * 2.2;
    P.sticker(ctx, str, 540 - w / 2, 1540, { pop, rot: 0, size: 48 });
  }

  function iris(ctx, cx, cy, r) {
    if (r > 1500) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 1080, 1920);
    ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, Math.max(r, 0.1), 0, TAU);
    ctx.fillStyle = '#1C1218'; ctx.fill('evenodd');
    ctx.restore();
  }

  function whip(ctx, p, dir, drawA, drawB) {
    const e = P.ease.inOutCubic(p);
    const off = e * 1080 * dir;
    [[off, drawA], [off - 1080 * dir, drawB]].forEach(([dx, fn]) => {
      ctx.save(); ctx.translate(dx, 0);
      ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.clip();
      fn();
      ctx.restore();
    });
    const s = Math.sin(p * Math.PI);
    const cols = [PINK, ROSE, LILAC, MINT, CREAM, GOLD];
    ctx.save();
    for (let i = 0; i < 46; i++) {
      ctx.globalAlpha = 0.8 * s * (0.4 + P.hash(i + 3) * 0.6);
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(0, P.hash(i) * 1920, 1080, 6 + P.hash(i + 50) * 46);
    }
    ctx.restore();
  }

  /* ---------------- scenes ---------------- */
  function facade(ctx, t) {
    const { C } = P;
    P.gradient(ctx, '#FDE6EC', '#F5C1CE');
    P.circle(ctx, 540, 600, 300, '#FFF1D9', { shadow: false, seed: 2 });
    mirror(ctx, () => {
      P.poly(ctx, [[-120, 1250], [190, 640], [500, 1250]], '#E9A6BA', { seed: 11 });
      P.poly(ctx, [[190, 640], [245, 748], [215, 730], [190, 760], [165, 730], [135, 748]], '#fff', { seed: 12, shadow: false });
      P.cloud(ctx, 160 + Math.sin(t * 0.9) * 14, 390, 0.55);
    });
    // ground + path
    P.rect(ctx, -20, 1400, 1120, 560, '#E9B7C4', { radius: 2, seed: 3, shadow: false });
    P.poly(ctx, [[470, 1420], [610, 1420], [720, 1960], [360, 1960]], CREAM, { seed: 4, shadow: false });
    // the hotel
    P.rect(ctx, 150, 860, 780, 560, ROSE, { radius: 6, seed: 12 });
    P.rect(ctx, 250, 640, 580, 230, PINK, { radius: 6, seed: 14 });
    P.rect(ctx, 130, 840, 820, 40, BURG, { radius: 6, seed: 13 });
    P.rect(ctx, 340, 470, 400, 180, ROSE, { radius: 6, seed: 15 });
    P.rect(ctx, 230, 622, 620, 34, BURG, { radius: 6, seed: 16 });
    P.poly(ctx, [[320, 478], [540, 360], [760, 478]], BURG, { seed: 17 });
    P.circle(ctx, 540, 440, 24, GOLD, { shadow: false });
    P.dot(ctx, 540, 440, 8, ledCol(99, t));
    // sign
    P.rect(ctx, 372, 490, 336, 124, BURG, { radius: 8, seed: 18, shadow: false });
    P.text(ctx, 'THE GRAND', 540, 522, { size: 36, font: SERIF, color: GOLD, shadow: false, letter: 4 });
    P.text(ctx, 'DATACENTER', 540, 578, { size: 44, font: SERIF, color: CREAM, shadow: false });
    // windows: every one a tiny server, blinking in perfect mirror image
    mirror(ctx, () => {
      for (let i = 0; i < 3; i++) {
        const wx = 300 + i * 80;
        P.rect(ctx, wx - 28, 682, 56, 112, CREAM, { radius: 26, seed: 20 + i, shadow: false });
        for (let k = 0; k < 3; k++) P.dot(ctx, wx, 720 + k * 24, 6, ledCol(i * 3 + k, t));
      }
      for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) {
        const wx = 210 + i * 90, wy = 910 + row * 150;
        P.rect(ctx, wx - 30, wy, 60, 110, CREAM, { radius: 28, seed: 30 + i + row * 3, shadow: false });
        for (let k = 0; k < 3; k++) P.dot(ctx, wx, wy + 40 + k * 24, 6, ledCol(20 + row * 9 + i * 3 + k, t));
        if (row === 0) { ctx.fillStyle = BURG; ctx.fillRect(wx - 40, wy + 108, 80, 10); }
      }
      // flags
      const wave = Math.sin(t * 5);
      ctx.save(); ctx.fillStyle = PLUM; ctx.fillRect(362, 330, 8, 145); ctx.restore();
      P.poly(ctx, [[370, 334], [460 + wave * 8, 350 + wave * 6], [370, 384]], GOLD, { seed: 19, amp: 2 });
      // topiary
      P.rect(ctx, 70, 1360, 70, 60, MAUVE, { radius: 8, seed: 40 });
      P.circle(ctx, 105, 1300, 50, '#8FCFA4', { seed: 41 });
      P.circle(ctx, 105, 1222, 36, '#8FCFA4', { seed: 42 });
    });
    // door + awning + steps
    P.rect(ctx, 460, 1200, 160, 220, BURG, { radius: 80, seed: 50 });
    P.rect(ctx, 478, 1220, 124, 200, '#5E2440', { radius: 62, seed: 51, shadow: false });
    for (let k = 0; k < 6; k++) P.poly(ctx, [[420 + k * 40, 1160], [460 + k * 40, 1160], [460 + k * 40, 1190], [420 + k * 40, 1190]], k % 2 ? CREAM : MAUVE, { seed: 52 + k, amp: 1, shadow: false });
    mirror(ctx, () => P.dot(ctx, 440, 1192, 20, CREAM));
    P.rect(ctx, 420, 1414, 240, 22, CREAM, { radius: 4, seed: 60 });
    P.rect(ctx, 398, 1432, 284, 22, CREAM, { radius: 4, seed: 61 });
    // a tiny concierge in the doorway
    concierge(ctx, 540, 1372, 36, t, { blink: P.pulse(t, 1.2, 0.15) });
  }

  function chapter(ctx, t, t0, part, name, sub) {
    P.bg(ctx, BURG);
    ctx.save();
    P.zoom(ctx, 1 + 0.025 * P.prog(t, t0, 0.9), 540, 940);
    mirror(ctx, () => { for (let k = 0; k < 6; k++) P.star(ctx, 70, 420 + k * 220, 16, '#A5557A', { shadow: false, points: 4 }); });
    P.rect(ctx, 150, 620, 780, 640, CREAM, { radius: 8, seed: 90 });
    ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.strokeRect(180, 650, 720, 580);
    ctx.lineWidth = 2; ctx.strokeRect(198, 668, 684, 544);
    mirror(ctx, () => { P.star(ctx, 198, 668, 20, GOLD, { shadow: false, points: 4 }); P.star(ctx, 198, 1212, 20, GOLD, { shadow: false, points: 4 }); });
    P.text(ctx, part, 540, 790, { size: 56, font: SERIF, color: MAUVE, shadow: false, weight: 'italic 400' });
    P.text(ctx, P.typed(name, P.prog(t, t0 + 0.1, 0.45)), 540, 915, { size: 80, font: SERIF, color: BURG, shadow: false, maxWidth: 660 });
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(360, 1015); ctx.lineTo(720, 1015); ctx.stroke(); ctx.restore();
    P.star(ctx, 540, 1015, 16, GOLD, { shadow: false, points: 4 });
    P.text(ctx, sub, 540, 1100, { size: 34, font: SERIF, color: MAUVE, shadow: false, weight: 'italic 400' });
    ctx.restore();
  }

  function bell(ctx, x, y, press) {
    P.rect(ctx, x - 44, y - 8, 88, 14, '#b8b2c0', { radius: 6, seed: 55 });
    ctx.beginPath(); ctx.arc(x, y - 8, 32, Math.PI, 0); ctx.closePath();
    P.cut(ctx, '#e4dfea');
    P.dot(ctx, x, y - 44 + press * 8, 8, '#b8b2c0');
  }

  function lobby(ctx, t, o = {}) {
    const { C } = P;
    P.stripes(ctx, '#F9D6DE', '#F3C4D0', 45);
    P.rect(ctx, -20, 1180, 1120, 800, '#D98CA4', { radius: 2, seed: 31 });
    P.text(ctx, 'RESERVATIONS', 540, 360, { size: 40, font: SERIF, color: BURG, shadow: false, letter: 6 });
    // key cubbies: one GPU per room. the centre one is missing (it is the centre, so it stays symmetrical)
    P.rect(ctx, 220, 400, 640, 410, '#A0526F', { radius: 8, seed: 32 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = 240 + c * 120, y = 418 + r * 128;
      P.rect(ctx, x, y, 110, 118, '#6E2E48', { radius: 4, seed: 40 + r * 5 + c, shadow: false });
      if (r === 1 && c === 2) {
        const glow = o.hint ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
        if (glow > 0) { ctx.save(); ctx.strokeStyle = `rgba(230,192,103,${glow})`; ctx.lineWidth = 5; ctx.strokeRect(x + 4, y + 4, 102, 110); ctx.restore(); }
        continue;
      }
      gpuCard(ctx, x + 55, y + 52, 0.95, t, 60 + r * 5 + c);
    }
    mirror(ctx, () => {
      // sconces
      P.rect(ctx, 110, 600, 40, 90, GOLD, { radius: 10, seed: 70 });
      ctx.save(); ctx.globalAlpha = 0.3 + 0.08 * Math.sin(t * 7); P.dot(ctx, 130, 575, 70, '#FFF3C8'); ctx.restore();
      P.poly(ctx, [[95, 590], [165, 590], [150, 540], [110, 540]], PINK, { seed: 71 });
    });
    // concierge behind the desk
    const bob = Math.sin(t * 2.4) * 4;
    concierge(ctx, 540, 1000 + bob, 150, t, o);
    // two arms, two bells. one bell would be asymmetrical
    const raise = P.ease.inOutCubic(P.prog(t, T_BELL - 0.35, 0.3)) * (1 - P.ease.inOutCubic(P.prog(t, T_BELL + 0.35, 0.3)));
    const press = P.pulse(t, T_BELL, 0.18);
    mirror(ctx, () => P.arm(ctx, 470, 1030 + bob, P.lerp(452, 404, raise), P.lerp(1066, 1018, raise) + press * 16, 30));
    // desk
    P.rect(ctx, 190, 1066, 700, 44, '#B8617F', { radius: 8, seed: 80 });
    P.rect(ctx, 210, 1104, 660, 420, BURG, { radius: 6, seed: 81 });
    mirror(ctx, () => P.rect(ctx, 240, 1150, 150, 300, '#7A3050', { radius: 6, seed: 82, shadow: false }));
    P.rect(ctx, 420, 1190, 240, 80, GOLD, { radius: 6, seed: 83 });
    P.text(ctx, 'CONCIERGE', 540, 1232, { size: 34, font: SERIF, color: BURG, shadow: false, letter: 3 });
    mirror(ctx, () => bell(ctx, 404, 1072, press));
  }

  function lobbyBoy(ctx, x, y, t) {
    const { C } = P;
    P.rect(ctx, x - 50, y + 60, 34, 110, PLUM, { radius: 10, seed: 81 });
    P.rect(ctx, x + 16, y + 60, 34, 110, PLUM, { radius: 10, seed: 82 });
    P.rect(ctx, x - 80, y - 90, 160, 170, C.purple, { radius: 26, seed: 83 });
    for (let k = 0; k < 3; k++) { P.dot(ctx, x - 24, y - 55 + k * 40, 7, GOLD); P.dot(ctx, x + 24, y - 55 + k * 40, 7, GOLD); }
    P.rect(ctx, x - 66, y - 215, 132, 120, MINT, { radius: 34, seed: 84 });
    deadFace(ctx, x, y - 152, 46, { blink: P.pulse(t, 5.05, 0.14) });
    hat(ctx, x, y - 212, 64);
    // velvet pillow with a GPU-shaped absence
    P.rect(ctx, x - 130, y - 6, 260, 50, '#B03A5B', { radius: 22, seed: 85 });
    P.dot(ctx, x - 130, y + 20, 10, GOLD); P.dot(ctx, x + 130, y + 20, 10, GOLD);
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = CREAM; ctx.lineWidth = 4;
    ctx.strokeRect(x - 50, y - 38, 100, 34); ctx.restore();
    [-1, 1].forEach(k => { ctx.beginPath(); P.capsulePath(ctx, x + k * 70, y - 62, x + k * 118, y + 6, 30); P.cut(ctx, C.purple, { rim: false }); });
  }

  function hallway(ctx, t) {
    P.stripes(ctx, '#E7DAF3', '#DCCBEE', 45);
    P.gingham(ctx, 0, 1250, 1080, 700, '#E7A0B4', 70, CREAM);
    mirror(ctx, () => {
      P.rect(ctx, 90, 640, 200, 600, BURG, { radius: 100, seed: 91 });
      P.rect(ctx, 115, 670, 150, 560, '#A0526F', { radius: 76, seed: 92, shadow: false });
      P.dot(ctx, 240, 960, 11, GOLD);
      P.rect(ctx, 150, 700, 80, 44, GOLD, { radius: 6, seed: 93, shadow: false });
      ctx.save(); ctx.globalAlpha = 0.28 + 0.06 * Math.sin(t * 6); P.dot(ctx, 390, 560, 60, '#FFF3C8'); ctx.restore();
      P.poly(ctx, [[360, 575], [420, 575], [405, 530], [375, 530]], PINK, { seed: 94 });
    });
    P.text(ctx, 'Nº 6', 190, 723, { size: 28, font: SERIF, color: BURG, shadow: false });
    P.text(ctx, 'Nº 8', 890, 723, { size: 28, font: SERIF, color: BURG, shadow: false });
    // chandelier
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 280); ctx.lineTo(540, 360); ctx.stroke(); ctx.restore();
    P.poly(ctx, [[440, 360], [640, 360], [590, 400], [490, 400]], GOLD, { seed: 95 });
    for (let k = -2; k <= 2; k++) {
      P.rect(ctx, 534 + k * 44, 330, 12, 30, CREAM, { radius: 4, seed: 96 + k, shadow: false });
      P.circle(ctx, 540 + k * 44, 322 + Math.sin(t * 12 + k * k) * 2, 8, '#FFC66B', { shadow: false, ry: 12 });
    }
    lobbyBoy(ctx, 540, 1080, t);
  }

  function rack(ctx, x, y, w, h, t) {
    P.rect(ctx, x - w / 2, y - h / 2, w, h, '#3b3148', { radius: 8 * w / 110, seed: 101 });
    const n = 5, uh = (h - 40 * w / 110) / n;
    for (let k = 0; k < n; k++) {
      const uy = y - h / 2 + 30 * w / 110 + k * uh;
      ctx.fillStyle = '#4d4260'; ctx.fillRect(x - w * 0.4, uy, w * 0.8, uh * 0.72);
      for (let j = 0; j < 3; j++) P.dot(ctx, x + w * 0.1 + j * w * 0.1, uy + uh * 0.36, Math.max(2, w * 0.03), ledCol(k * 3 + j + 40, t));
    }
    ctx.fillStyle = GOLD; ctx.fillRect(x - w * 0.3, y - h / 2 + 6 * w / 110, w * 0.6, 16 * w / 110);
    P.text(ctx, 'GPU Nº 7', x, y - h / 2 + 14 * w / 110, { size: 13 * w / 110, font: 'mono', color: BURG, shadow: false });
  }

  function car(ctx, x, y, s, t) {
    P.rect(ctx, x - 150 * s, y - 200 * s, 300 * s, 200 * s, '#F2C57C', { radius: 14 * s, seed: 110 });
    P.rect(ctx, x - 120 * s, y - 178 * s, 240 * s, 136 * s, '#FFF4E0', { radius: 10 * s, seed: 111, shadow: false });
    rack(ctx, x, y - 106 * s, 110 * s, 126 * s, t);
    P.rect(ctx, x - 165 * s, y - 222 * s, 330 * s, 28 * s, BURG, { radius: 10 * s, seed: 112 });
    ctx.fillStyle = BURG; ctx.fillRect(x - 150 * s, y - 30 * s, 300 * s, 12 * s);
    [-1, 1].forEach(k => P.dot(ctx, x + k * 100 * s, y + 4 * s, 18 * s, PLUM));
    concierge(ctx, x, y - 222 * s - 52 * s, 72 * s, t, { blink: P.pulse(t, 8.4, 0.15) });
  }

  function funicular(ctx, t) {
    const { ease, prog, lerp } = P;
    const p = ease.inOutSine(prog(t, T_FUNI + 0.2, T_ARRIVE - T_FUNI - 0.2));
    P.gradient(ctx, '#D9C8F0', '#FAD3DC');
    P.circle(ctx, 540, 450, 150, '#FFE9B8', { shadow: false, seed: 5 });
    mirror(ctx, () => {
      P.cloud(ctx, 150 + Math.sin(t * 0.8) * 12, 380, 0.5);
      P.poly(ctx, [[-120, 1500], [140, 900], [420, 1500]], '#F4BCCB', { seed: 120 });
    });
    P.poly(ctx, [[-120, 1700], [540, 560], [1200, 1700]], '#EE9FB5', { seed: 60 });
    P.poly(ctx, [[540, 560], [640, 735], [600, 712], [566, 748], [540, 722], [514, 748], [480, 712], [440, 735]], '#fff', { seed: 61, shadow: false });
    P.text(ctx, 'COLD STORAGE', 540, 685, { size: 22, font: 'mono', color: BURG, shadow: false });
    // summit annexe
    P.rect(ctx, 490, 500, 100, 70, PINK, { radius: 4, seed: 62 });
    P.poly(ctx, [[478, 504], [540, 462], [602, 504]], BURG, { seed: 63 });
    P.dot(ctx, 540, 535, 9, ledCol(7, t));
    mirror(ctx, () => {
      [[0.32, 1], [0.5, 0.8], [0.66, 0.62]].forEach(([u, s], i) => {
        const x = lerp(-120, 540, u) + 110, y = lerp(1700, 560, u) + 120;
        P.poly(ctx, [[x, y - 90 * s], [x + 42 * s, y], [x - 42 * s, y]], '#6FB58E', { seed: 130 + i });
        P.poly(ctx, [[x, y - 130 * s], [x + 30 * s, y - 60 * s], [x - 30 * s, y - 60 * s]], '#7DC49B', { seed: 133 + i, shadow: false });
      });
    });
    // track, with perspective
    const gap = y => lerp(110, 10, (1700 - y) / (1700 - 600));
    ctx.save();
    ctx.strokeStyle = '#9C5874'; ctx.lineWidth = 5;
    for (let k = 0; k < 22; k++) {
      const y = 1700 - Math.pow(k / 21, 0.8) * 1100;
      ctx.beginPath(); ctx.moveTo(540 - gap(y) - 10, y); ctx.lineTo(540 + gap(y) + 10, y); ctx.stroke();
    }
    ctx.strokeStyle = PLUM; ctx.lineWidth = 7;
    mirror(ctx, () => { ctx.beginPath(); ctx.moveTo(540 - gap(1700), 1700); ctx.lineTo(540 - gap(600), 600); ctx.stroke(); });
    ctx.restore();
    const cy = lerp(1380, 690, p), s = lerp(1, 0.38, p);
    ctx.save(); ctx.strokeStyle = '#3b3148'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(540, cy - 222 * s); ctx.lineTo(540, 560); ctx.stroke(); ctx.restore();
    car(ctx, 540, cy, s, t);
    if (t >= T_ARRIVE) {
      const g = P.pulse(t, T_ARRIVE, 0.9);
      mirror(ctx, () => { for (let k = 0; k < 3; k++) P.star(ctx, 430 - k * 50, 600 - k * 40, 22 * g, k % 2 ? '#fff' : GOLD, { shadow: false, rot: t * 3 }); });
      mirror(ctx, () => {
        for (let k = 0; k < 10; k++) {
          const x = 330 + P.hash(k) * 200, y = 420 + ((t - T_ARRIVE) * 80 + P.hash(k + 9) * 360) % 360;
          P.dot(ctx, x, y, 5, '#fff');
        }
      });
    }
  }

  /* ---------------- music: a plucky harpsichord ---------------- */
  const CHORDS = [['D4', 'F#4', 'A4', 'D5'], ['C#4', 'E4', 'A4', 'C#5'], ['B3', 'D4', 'F#4', 'B4'], ['G3', 'B3', 'D4', 'G4']];
  const BASS = ['D3', 'A2', 'B2', 'G2'];
  const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
  const MEL = [
    { 0: 'A5', 4: 'F#5', 6: 'G5', 8: 'A5', 12: 'B5', 14: 'A5' },
    { 0: 'E5', 4: 'C#5', 6: 'D5', 8: 'E5', 12: 'A5' },
    { 0: 'F#5', 4: 'D5', 6: 'E5', 8: 'F#5', 12: 'B5', 14: 'A5' },
    { 0: 'G5', 4: 'F#5', 6: 'E5', 8: 'D5', 12: 'E5', 14: 'C#5' },
  ];
  function harp(n, v) {
    SFX.tone(n, 0.32, { type: 'sawtooth', vol: v, attack: 0.002 });
    SFX.tone(SFX.freq(n) * 2, 0.12, { type: 'square', vol: v * 0.3, attack: 0.002 });
  }

  ClaudeTok.register({
    author: '@the.grand.datacenter',
    caption: 'a film in two parts. every frame measured with a ruler. twice 🎀🛎️ #symmetry #gpu #storybook #coldstorage #pastel',
    sound: 'concierto for harpsichord & missing GPU · the.grand.datacenter',
    avatar: '🛎️',
    avatarColor: '#E7A0B4',
    duration: D,
    bg: BURG,
    thumb: 3.3,
    likes: '1.9M', commentCount: '38.2K', saves: '410K', shares: '96K',
    comments: [
      ['lobby.boy', 'sir. the GPU. it is gone. (i rehearsed that line for three weeks)', 48200],
      ['cold.storage', 'i had GPU Nº 7 the whole time and not one of you asked how i was doing', 31600],
      ['the.grand.datacenter', 'he rang both bells because one bell would be asymmetrical. we do not discuss it', 22400],
      ['pixel.pedant', 'the left snowcap is 2px wider than the right one. unwatchable. watched 41 times', 12900],
      ['bellhop.hat.fan', 'the hat is so small. the hat is doing so much', 8800],
      ['whip.pan.enjoyer', '0:04 whip pan left, 0:05 whip pan right. my neck has never been so balanced', 5100],
      ['concierge.clawd', 'i was not concerned. i was centered.', 3300],
      ['rack.mount.rick', 'me being carried up a pink mountain at 0.3 km/h to be "archived"', 1200],
      ['empty.cubby', 'dead center of the wall and nobody noticed me until 0:04', 640],
      ['emoji.agent', '🎩🛎️🚡❄️🎀', 88],
    ],

    bpm: 120,
    subdiv: 4,
    onBeat(step, env) {
      const t = env.t;
      if (t > T_ZOOM - 0.05 && t < T_CH2) return;   // deadpan silence
      if (t > T_IRIS + 0.45) return;
      const bar = Math.floor(step / 16) % 4, s = step % 16;
      if (s % 2 === 0) harp(CHORDS[bar][ARP[(s / 2) % 8]], 0.022);
      if (s % 4 === 0) SFX.pluck(BASS[bar], { vol: 0.13 });
      const m = MEL[bar][s];
      if (m) harp(m, 0.04);
    },

    draw(ctx, t, env) {
      const { ease, prog } = P;

      /* ---------- sound ---------- */
      if (env.at(0.02)) SFX.chime({ vol: 0.06 });
      [T_CH1, T_CH2].forEach(c => {
        if (env.at(c)) { SFX.thud({ vol: 0.22 }); SFX.chord(['D4', 'F#4', 'A4', 'D5'], 0.9, { type: 'triangle', gap: 0.05, vol: 0.06 }); }
        for (let k = 0; k < 6; k++) if (env.at(c + 0.12 + k * 0.07)) SFX.type({ vol: 0.2 });
      });
      if (env.at(T_BELL)) { SFX.ding('A6', { vol: 0.12, pan: -0.5 }); SFX.ding('A6', { vol: 0.12, pan: 0.5 }); }
      if (env.at(T_WL) || env.at(T_WR)) SFX.whoosh({ vol: 0.22, dur: 0.3 });
      if (env.at(T_ZOOM)) { SFX.tone(98, 0.6, { type: 'triangle', vol: 0.25 }); SFX.thud({ vol: 0.3 }); }
      for (let k = 0; k < 7; k++) if (env.at(T_FUNI + 0.35 + k * 0.32)) SFX.tick({ vol: 0.14 });
      if (env.at(T_ARRIVE)) { SFX.chime({ vol: 0.1 }); SFX.ding('D6', { vol: 0.08 }); }
      if (env.at(T_IRIS)) SFX.swoosh({ vol: 0.12 });
      if (env.at(T_IRIS + 0.6)) SFX.chord(['D4', 'A4', 'D5', 'F#5'], 1.2, { type: 'triangle', gap: 0.06, vol: 0.07 });

      /* ---------- picture ---------- */
      const lobbyO = () => ({
        hop: 26 * P.pulse(t, T_BELL, 0.3),
        blink: P.pulse(t, 3.8, 0.15),
        look: P.ease.inOutCubic(prog(t, 4.05, 0.2)) * -1,
        hint: t > 3.9,
      });
      if (t < T_CH1) {
        ctx.save(); P.zoom(ctx, 1 + 0.05 * prog(t, 0, T_CH1), 540, 900); facade(ctx, t); ctx.restore();
      } else if (t < T_LOBBY) {
        chapter(ctx, t, T_CH1, 'Part 1:', 'The Concierge', 'in which a bell is rung. twice.');
      } else if (t < T_WL) {
        lobby(ctx, t, lobbyO());
      } else if (t < T_BOY) {
        whip(ctx, prog(t, T_WL, WHIP), 1, () => lobby(ctx, t, lobbyO()), () => hallway(ctx, t));
      } else if (t < T_WR) {
        hallway(ctx, t);
      } else if (t < T_ZOOM) {
        whip(ctx, prog(t, T_WR, WHIP), -1, () => hallway(ctx, t), () => lobby(ctx, t, { concern: true }));
      } else if (t < T_CH2) {
        ctx.save();
        P.zoom(ctx, 1 + 1.4 * ease.outCubic(prog(t, T_ZOOM, 0.1)), 540, 1000);
        lobby(ctx, t, { concern: true });
        ctx.restore();
      } else if (t < T_FUNI) {
        chapter(ctx, t, T_CH2, 'Part 2:', 'The Missing GPU', 'in which a rack goes uphill.');
      } else {
        funicular(ctx, t);
      }

      /* ---------- words ---------- */
      narrate(ctx, 'Our story begins at a very\nsymmetrical hotel.', win(t, 0.45, T_CH1));
      narrate(ctx, '“Welcome. Your GPU\nhas been reserved.”', win(t, 3.3, T_WL));
      narrate(ctx, '“Sir. The GPU.\nIt is gone.”', win(t, T_BOY + 0.05, T_WR));
      narrate(ctx, 'The concierge was\ndeeply concerned.', win(t, T_ZOOM + 0.12, T_CH2));
      narrate(ctx, 'The rack went up the mountain,\nby funicular, very slowly.', win(t, 7.35, T_ARRIVE));
      narrate(ctx, 'It had been in cold storage\nthe whole time.', win(t, T_ARRIVE, 10.8));

      if (t < T_CH1) centeredSticker(ctx, 'pov: you booked 1 GPU', ease.outBack(prog(t, 0.25, 0.4)));
      else if (t >= T_LOBBY && t < T_ZOOM) centeredSticker(ctx, 'pov: you booked 1 GPU', 1);
      else if (t >= T_FUNI && t < T_IRIS + 0.3) centeredSticker(ctx, 'every frame measured with a ruler', ease.outBack(prog(t, T_FUNI + 0.1, 0.4)));

      /* ---------- iris in / out ---------- */
      if (t < 0.55) iris(ctx, IRIS_X, IRIS_Y, P.lerp(70, 1500, ease.inCubic(prog(t, 0, 0.55))));
      if (t >= T_IRIS) {
        const r = P.lerp(1500, 70, ease.inOutCubic(prog(t, T_IRIS, 0.55)));
        iris(ctx, IRIS_X, IRIS_Y, r);
        if (t > T_IRIS + 0.45) P.text(ctx, 'fin.', 540, 900, { size: 72, font: SERIF, color: CREAM, shadow: false, weight: 'italic 400', scale: ease.outBack(prog(t, T_IRIS + 0.45, 0.3)) });
      }
    },
  });
})();
