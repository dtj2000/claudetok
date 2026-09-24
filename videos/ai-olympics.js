/* The AI Olympics, live on AOBC: a 100m token sprint with a photo finish,
 * synchronized attention heads (h7 is looking at the wrong token again),
 * Clawd clean-and-jerks 70B on a laptop, then the medal ceremony. */
(function () {
  const D = 12;
  const T_SWIM = 3.6, T_LIFT = 7.2, T_POD = 10.4;
  const WIPES = [T_SWIM, T_LIFT, T_POD];

  const TEAM = {
    cloud: { name: 'TEAM CLOUD', col: '#4F7FD9', code: 'CLD' },
    edge: { name: 'TEAM EDGE', col: '#6B4E9B', code: 'EDG' },
    local: { name: 'TEAM LOCALHOST', col: '#5DB36A', code: 'LCL' },
    quant: { name: 'TEAM 4-BIT', col: '#E5A93B', code: 'Q4' },
  };

  /* ---------------- shared bits ---------------- */
  function brass(notes, dur, when = 0, vol = 1) {
    notes.forEach(n => {
      SFX.tone(n, dur, { type: 'sawtooth', vol: 0.045 * vol, attack: 0.03, when });
      SFX.tone(n, dur, { type: 'triangle', vol: 0.08 * vol, attack: 0.02, when });
    });
  }
  function fanfare(vol = 1) {
    brass(['G4'], 0.14, 0, vol); brass(['G4'], 0.14, 0.13, vol); brass(['G4'], 0.14, 0.26, vol);
    brass(['C5', 'E5', 'G5'], 0.9, 0.4, vol);
  }
  function cheer(dur = 1.6, vol = 0.12) {
    SFX.noise(dur, { filter: 'bandpass', freq: 1100, q: 0.5, vol });
    SFX.noise(dur * 0.8, { filter: 'bandpass', freq: 2600, q: 0.9, vol: vol * 0.5, when: 0.08 });
    SFX.tone(2300, 0.35, { type: 'sine', slide: 2900, vol: 0.03, when: 0.2 });
    SFX.tone(2500, 0.3, { type: 'sine', slide: 2000, vol: 0.025, when: 0.55 });
  }

  function badge(ctx, x, y, team, s = 1) {
    const tm = TEAM[team];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    P.circle(ctx, 0, 0, 26, tm.col, { seed: tm.code.length + 3, amp: 2, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    P.text(ctx, tm.code, 0, 2, { size: 18, font: 'mono', color: '#fff', shadow: false, weight: 800 });
    ctx.restore();
  }

  function chrome(ctx, t) {
    const { C } = P;
    // LIVE pill
    P.rect(ctx, 50, 296, 140, 58, C.red, { radius: 14, seed: 3, shadow: { blur: 6, dy: 4, alpha: 0.3 } });
    if (P.boil(t, 2) % 2 === 0) P.dot(ctx, 80, 325, 10, '#fff');
    P.text(ctx, 'LIVE', 132, 327, { size: 34, font: 'bubble', color: '#fff', shadow: false });
    P.rect(ctx, 200, 296, 300, 58, 'rgba(26,22,32,0.82)', { radius: 14, seed: 4, shadow: false });
    P.text(ctx, '{AOBC}', 262, 327, { size: 30, font: 'bubble', color: C.yellow, shadow: false });
    P.text(ctx, 'LATENT CITY 26', 400, 327, { size: 20, font: 'mono', color: '#e6def5', shadow: false });
    const ev = t < T_SWIM ? 1 : t < T_LIFT ? 2 : t < T_POD ? 3 : 4;
    P.rect(ctx, 760, 296, 180, 58, 'rgba(26,22,32,0.82)', { radius: 14, seed: 5, shadow: false });
    P.text(ctx, ev < 4 ? `EVENT ${ev}/3` : 'MEDALS', 850, 327, { size: 28, font: 'mono', color: '#fff', shadow: false });
  }

  function lowerThird(ctx, t, title, sub, col, t0) {
    const { C, ease, prog } = P;
    const s = ease.outCubic(prog(t, t0, 0.35));
    if (s <= 0) return;
    const x = P.lerp(-800, 50, s);
    P.rect(ctx, x, 1360, 820, 74, col, { radius: 8, seed: 8, amp: 2 });
    P.text(ctx, title, x + 30, 1399, { size: 40, font: 'bubble', color: '#fff', align: 'left', shadow: false, maxWidth: 770 });
    P.rect(ctx, x + 30, 1432, 760, 54, C.paper, { radius: 6, seed: 9, amp: 2 });
    P.text(ctx, sub, x + 52, 1460, { size: 29, font: 'marker', color: C.ink, align: 'left', shadow: false, maxWidth: 720 });
  }

  function wipe(ctx, t) {
    let s = null;
    if (t < 0.32) s = P.ease.inOutCubic(P.prog(t, 0, 0.32));
    else if (t >= D - 0.32) s = -1 + P.ease.inOutCubic(P.prog(t, D - 0.32, 0.32));
    else for (const T of WIPES) {
      if (t >= T - 0.3 && t < T) s = -1 + P.ease.inOutCubic(P.prog(t, T - 0.3, 0.3));
      else if (t >= T && t < T + 0.3) s = P.ease.inOutCubic(P.prog(t, T, 0.3));
    }
    if (s === null) return;
    const cols = [TEAM.cloud.col, TEAM.edge.col, TEAM.local.col, TEAM.quant.col, P.C.claude];
    ctx.save();
    for (let j = 0; j < 5; j++) {
      const off = s * (1500 + j * 90);
      const x = j * 250 - 200 + off;
      ctx.beginPath();
      ctx.moveTo(x, -20); ctx.lineTo(x + 330, -20); ctx.lineTo(x + 30, 1940); ctx.lineTo(x - 300, 1940); ctx.closePath();
      ctx.fillStyle = cols[j]; ctx.fill();
    }
    ctx.restore();
    if (Math.abs(s) < 0.35) P.title(ctx, '{AOBC}', 540 + s * 900, 960, { size: 150, color: P.C.yellow, stroke: P.C.ink, rot: -0.06 });
  }

  /* ---------------- EVENT 1: 100m token sprint ---------------- */
  const FIN = 850, X0 = 190, GO = 0.28, PHOTO = 2.32;
  const RUNNERS = [
    { tok: 'the', team: 'cloud', T: 2.33 },
    { tok: 'ing', team: 'edge', T: 2.3 },
    { tok: '▁un', team: 'local', T: 3.4, stop: 1.3 },
    { tok: '!!', team: 'quant', T: 2.58 },
  ];
  const laneY = i => 640 + i * 165;

  function runnerX(r, u) {
    const w = 70 + r.tok.length * 30;
    let uu = r.stop ? Math.min(u, r.stop) : u;
    const p = P.clamp((uu - GO) / (r.T - GO), 0, 1.3);
    const s = p < 0.25 ? (p * p) / 0.5 : p - 0.125;
    return X0 + (FIN - w / 2 - X0) * (s / 0.875);
  }

  function drawRunner(ctx, r, i, u) {
    const { C } = P;
    const x = runnerX(r, u), y = laneY(i);
    const w = 70 + r.tok.length * 30, h = 96;
    const moving = u > GO && !(r.stop && u > r.stop);
    const ph = moving ? u * 22 + i : 0;
    // legs
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (const k of [0, Math.PI]) {
      const a = moving ? Math.sin(ph + k) * 0.7 : 0.15;
      ctx.beginPath(); ctx.moveTo(x - 10 + (k ? 20 : 0), y + 40);
      ctx.lineTo(x - 10 + (k ? 20 : 0) + Math.sin(a) * 40, y + 40 + Math.cos(a) * 40); ctx.stroke();
    }
    ctx.restore();
    // speed lines
    if (moving) for (let k = 0; k < 3; k++) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const ly = y - 25 + k * 25, lx = x - w / 2 - 20 - ((u * 900 + k * 70) % 60);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 60, ly); ctx.stroke(); ctx.restore();
    }
    const bob = moving ? Math.abs(Math.sin(ph)) * -8 : 0;
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(moving ? 0.12 : 0);
    P.rect(ctx, -w / 2, -h / 2, w, h, TEAM[r.team].col, { radius: 20, seed: 20 + i });
    const mood = r.stop && u > r.stop ? 'dead' : u > GO ? 'angry' : 'side';
    P.face(ctx, 0, -18, 30, mood, { ink: '#fff', blush: false });
    P.text(ctx, r.tok, 0, 26, { size: 32, font: 'mono', color: '#fff', shadow: false, weight: 800 });
    ctx.restore();
    // 429
    if (r.stop && u > r.stop) {
      const pp = P.ease.outBack(P.prog(u, r.stop, 0.3));
      P.text(ctx, '429', x, y - 92, { size: 46, font: 'bubble', color: '#fff', stroke: C.red, strokeWidth: 12, scale: pp, rot: -0.1 });
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x + 90, y - 60, 18, u * 8, u * 8 + 4.2); ctx.stroke(); ctx.restore();
    }
  }

  function sprint(ctx, t) {
    const { C, ease, prog } = P;
    const u = Math.min(t, PHOTO);
    P.bg(ctx, '#3d6b3f');
    // stands + crowd
    P.rect(ctx, -20, 380, 1120, 170, '#5a4a6e', { radius: 0, seed: 30, shadow: false });
    const r = P.rng(5);
    for (let k = 0; k < 60; k++) {
      const cx = r() * 1080, cy = 410 + r() * 120;
      P.dot(ctx, cx, cy + Math.sin(t * 9 + k) * 3 * (t > 2 ? 2 : 1), 14, [C.pink, C.mint, C.yellow, C.sky, C.cream][k % 5]);
      if (P.hash(k * 7 + P.boil(t, 10)) > 0.97) P.star(ctx, cx, cy - 10, 26, '#fff', { shadow: false, points: 4, inner: 0.3 });
    }
    // track
    P.rect(ctx, -20, 550, 1120, 700, '#C8664A', { radius: 0, seed: 31, shadow: false });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6;
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(0, 557 + i * 165); ctx.lineTo(1080, 557 + i * 165); ctx.stroke(); }
    ctx.restore();
    for (let i = 0; i < 4; i++) P.text(ctx, String(i + 1), 60, laneY(i) + 60, { size: 56, font: 'bubble', color: 'rgba(255,255,255,0.55)', shadow: false });
    // finish line
    for (let j = 0; j < 44; j++) {
      ctx.fillStyle = (j + Math.floor(j / 2)) % 2 ? '#fff' : C.ink;
      ctx.fillRect(FIN + (j % 2) * 16, 557 + Math.floor(j / 2) * 30, 16, 30);
    }
    RUNNERS.forEach((rr, i) => drawRunner(ctx, rr, i, u));
    // "ON YOUR MARKS"
    if (t < 0.9) P.title(ctx, t < GO ? 'SET…' : 'GO!', 540, 1180, { size: 110, color: C.yellow, stroke: C.ink, pop: ease.outBack(prog(t, t < GO ? 0 : GO, 0.2)) * (1 - prog(t, 0.75, 0.15)) });
  }

  function photoFinish(ctx, t) {
    const { C, ease, prog } = P;
    const z = 1 + 0.7 * ease.inOutCubic(prog(t, PHOTO + 0.05, 0.35));
    ctx.save();
    P.zoom(ctx, z, FIN, 720);
    sprint(ctx, t);
    ctx.restore();
    // sepia photo
    ctx.save(); ctx.fillStyle = 'rgba(150,110,60,0.35)'; ctx.fillRect(0, 380, 1080, 870); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.moveTo(FIN, 380); ctx.lineTo(FIN, 1250); ctx.stroke(); ctx.restore();
    const pp = ease.outBack(prog(t, PHOTO + 0.1, 0.3));
    P.title(ctx, 'PHOTO FINISH', 540, 470, { size: 88, color: '#fff', stroke: C.ink, pop: pp, rot: -0.04 });
    if (t >= PHOTO + 0.35 && t < 2.8) P.bubble(ctx, 'by 1 byte', 690, 620, FIN - 20, 700, { size: 44, pop: ease.outBack(prog(t, PHOTO + 0.35, 0.2)) });
    // results board
    const rp = ease.outBack(prog(t, 2.75, 0.35));
    if (rp > 0) {
      ctx.save(); ctx.translate(540, 900); ctx.scale(rp, rp); ctx.rotate(-0.02);
      P.rect(ctx, -400, -210, 800, 420, C.paper, { radius: 22, seed: 40 });
      P.rect(ctx, -400, -210, 800, 76, C.ink, { radius: 18, seed: 41, shadow: false });
      P.text(ctx, 'RESULTS · 100m TOKEN SPRINT', 0, -172, { size: 34, font: 'bubble', color: C.yellow, shadow: false });
      const rows = [['1', 'edge', '"ing"', '9.58 ms'], ['2', 'cloud', '"the"', '+1 byte'], ['3', 'quant', '"!!"', '+0.3 ms'], ['DNF', 'local', '"▁un"', '429 😵']];
      rows.forEach((row, k) => {
        const y = -90 + k * 82;
        P.text(ctx, row[0], -340, y, { size: 40, font: 'bubble', color: k < 3 ? [C.mustard, '#9aa3ad', '#b87333'][k] : C.red, shadow: false });
        badge(ctx, -250, y, row[1], 0.95);
        P.text(ctx, TEAM[row[1]].name.replace('TEAM ', ''), -200, y, { size: 34, font: 'marker', color: C.ink, align: 'left', shadow: false });
        P.text(ctx, row[2], 90, y, { size: 30, font: 'mono', color: '#6d6478', shadow: false });
        P.text(ctx, row[3], 350, y, { size: 32, font: 'mono', color: C.ink, align: 'right', shadow: false });
      });
      ctx.restore();
    }
  }

  /* ---------------- EVENT 2: synchronized attention heads ---------------- */
  const WS = 930;
  const HX = k => 170 + k * 94;
  const TOK_CAT = [470, 520], TOK_THE = [830, 590];

  function swim(ctx, t) {
    const { C, ease, prog, lerp } = P;
    const u = t - T_SWIM;
    // wall tiles
    P.grid(ctx, '#d6eef6', 'rgba(79,127,217,0.18)', 60);
    P.rect(ctx, 150, 400, 780, 64, '#fff', { radius: 10, seed: 50 });
    P.text(ctx, 'LATENT CITY AQUATICS · pool of vectors', 540, 434, { size: 30, font: 'marker', color: C.blue, shadow: false });

    // tokens up top
    const tokPop = ease.outBack(prog(u, 0.8, 0.3));
    const drawTok = (p, s, col) => {
      if (tokPop <= 0) return;
      ctx.save(); ctx.translate(p[0], p[1] + Math.sin(t * 3 + p[0]) * 8); ctx.scale(tokPop, tokPop);
      const w = 60 + s.length * 30;
      P.rect(ctx, -w / 2, -40, w, 80, col, { radius: 18, seed: s.length + 51 });
      P.text(ctx, s, 0, 2, { size: 40, font: 'mono', color: '#fff', shadow: false, weight: 800 });
      ctx.restore();
    };

    const look = ease.inOutCubic(prog(u, 0.9, 0.35)) * (1 - prog(u, 1.85, 0.15));
    const dive = u >= 1.9 && u < 2.85;
    const headY = k => {
      let y = WS - 18 - Math.sin(u * 7 - k * 0.55) * (u < 0.9 ? 22 : 6);
      const late = k === 6 ? 0.35 : 0;
      const d = prog(u, 1.9 + late, 0.2) * (1 - prog(u, 2.7 + late * 0.3, 0.2));
      return y + d * 150;
    };

    // attention beams
    if (look > 0) {
      for (let k = 0; k < 8; k++) {
        const target = k === 6 ? TOK_THE : TOK_CAT;
        const hx = HX(k), hy = headY(k) - 30;
        ctx.save(); ctx.globalAlpha = look * (k === 6 ? 0.9 : 0.35 + 0.5 * P.hash(k + 3));
        ctx.strokeStyle = k === 6 ? C.red : C.claude; ctx.lineWidth = k === 6 ? 7 : 4 + 8 * P.hash(k);
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo((hx + target[0]) / 2, Math.min(hy, target[1]) - 80, target[0], target[1] + 40);
        const L = look;
        ctx.setLineDash([900 * L, 2000]);
        ctx.stroke(); ctx.restore();
      }
      if (look > 0.5) P.text(ctx, 'softmax(QKᵀ/√d)', 300, 640, { size: 30, font: 'mono', color: C.purple, rot: -0.08, shadow: false });
    }
    drawTok(TOK_CAT, 'cat', C.claude);
    drawTok(TOK_THE, 'the', '#9aa3ad');

    // legs sticking out (drawn before water)
    for (let k = 0; k < 8; k++) {
      const late = k === 6 ? 0.35 : 0;
      const lp = ease.outBack(prog(u, 2.08 + late, 0.25)) * (1 - ease.inCubic(prog(u, 2.62 + late * 0.3, 0.15)));
      if (lp <= 0) continue;
      const x = HX(k), spread = k === 6 ? 0.5 : 0.18 + 0.1 * Math.sin(u * 8);
      for (const sgn of k === 6 ? [1] : [-1, 1]) {
        const a = -Math.PI / 2 + sgn * spread;
        const ex = x + Math.cos(a) * 170 * lp, ey = WS + 20 + Math.sin(a) * 170 * lp;
        P.arm(ctx, x + sgn * 8, WS + 30, ex, ey, 26, '#f3c9a8');
        P.circle(ctx, ex + sgn * 8, ey - 6, 16, TEAM.cloud.col, { shadow: false, ry: 11, seed: k });
      }
    }
    // heads
    for (let k = 0; k < 8; k++) {
      const x = HX(k), y = headY(k);
      if (y > WS + 110) continue;
      const tilt = look * (k === 6 ? 0.35 : x > TOK_CAT[0] ? -0.35 : 0.3);
      ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
      P.circle(ctx, 0, 0, 42, '#f3c9a8', { seed: 60 + k });
      ctx.beginPath(); ctx.arc(0, -4, 44, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath();
      P.cut(ctx, k === 6 ? C.rose : TEAM.cloud.col, { shadow: false });
      P.text(ctx, 'h' + (k + 1), 0, -26, { size: 20, font: 'mono', color: '#fff', shadow: false, weight: 800 });
      P.face(ctx, 0, 10, 26, k === 6 && look > 0.3 ? 'side' : u > 2.85 ? 'happy' : 'smile', { blush: true });
      // arms up
      const armUp = u < 0.9 ? Math.max(0, Math.sin(u * 7 - k * 0.55)) : u > 2.9 ? 1 : 0;
      if (armUp > 0.05) for (const sgn of [-1, 1]) P.arm(ctx, sgn * 34, 30, sgn * (50 + 30 * armUp), 30 - 90 * armUp, 16, '#f3c9a8');
      ctx.restore();
    }

    // water with vector field
    ctx.save();
    ctx.globalAlpha = 0.88;
    const g = ctx.createLinearGradient(0, WS, 0, 1300);
    g.addColorStop(0, '#5fb6e0'); g.addColorStop(1, '#2d6fa8');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-10, 1300);
    for (let x = -10; x <= 1090; x += 30) ctx.lineTo(x, WS + 20 + Math.sin(x * 0.03 + t * 5) * 7);
    ctx.lineTo(1090, 1300); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4;
    for (let gx = 60; gx < 1080; gx += 90) for (let gy = WS + 80; gy < 1300; gy += 80) {
      const a = Math.sin(gx * 0.01 + t * 1.3) + Math.cos(gy * 0.013 - t);
      const ex = gx + Math.cos(a) * 26, ey = gy + Math.sin(a) * 26;
      ctx.beginPath(); ctx.moveTo(gx - Math.cos(a) * 26, gy - Math.sin(a) * 26); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 8, ey + Math.sin(a) * 8);
      ctx.lineTo(ex + Math.cos(a + 2.4) * 12, ey + Math.sin(a + 2.4) * 12); ctx.lineTo(ex + Math.cos(a - 2.4) * 12, ey + Math.sin(a - 2.4) * 12); ctx.fill();
    }
    ctx.restore();
    P.rect(ctx, -20, 1290, 1120, 40, '#fff', { radius: 0, seed: 61 });

    // splashes
    [1.9, 2.08, 2.25, 2.43].forEach((s0, j) => {
      const lt = u - s0;
      if (lt < 0 || lt > 0.5) return;
      for (let k = 0; k < 8; k++) {
        if ((j === 1 || j === 0) !== (k !== 6)) continue;
        for (let d = 0; d < 3; d++) P.dot(ctx, HX(k) + (d - 1) * 30 * (1 + lt * 3), WS + 10 - Math.sin(lt * 6) * 70 * (1 - Math.abs(d - 1) * 0.3), 9 * (1 - lt * 2) + 1, '#fff');
      }
    });

    // judges
    if (u > 2.85) {
      const cards = ['9.9', '9.8', '10', 'NaN'];
      cards.forEach((c, j) => {
        const pp = ease.outBack(prog(u, 2.88 + j * 0.1, 0.25));
        if (pp <= 0) return;
        ctx.save(); ctx.translate(200 + j * 190, 610); ctx.scale(pp, pp); ctx.rotate((j - 1.5) * 0.06);
        P.rect(ctx, -75, -60, 150, 120, j === 3 ? C.red : '#fff', { radius: 10, seed: 70 + j });
        P.text(ctx, c, 0, 4, { size: 58, font: 'bubble', color: j === 3 ? '#fff' : C.ink, shadow: false });
        P.text(ctx, j === 3 ? 'judge: softmax' : 'judge ' + (j + 1), 0, 82, { size: 22, font: 'mono', color: C.ink, shadow: false });
        ctx.restore();
      });
    }
  }

  /* ---------------- EVENT 3: parameter weightlifting ---------------- */
  const LX = 540, FLOOR = 1260, R = 110;
  function barY(u) {
    const { ease, prog, lerp } = P;
    if (u < 0.5) return FLOOR - 95;
    if (u < 1.1) return lerp(FLOOR - 95, 1060, ease.inOutCubic(prog(u, 0.5, 0.6)));
    if (u < 1.3) return lerp(1060, 850, ease.outBack(prog(u, 1.1, 0.2)));
    if (u < 2.7) return 850 + Math.sin(u * 17) * 22 * (1 - prog(u, 1.3, 0.95));
    return lerp(850, FLOOR - 95, ease.outBounce(prog(u, 2.7, 0.35)));
  }

  function lift(ctx, t) {
    const { C, ease, prog, lerp, pulse } = P;
    const u = t - T_LIFT;
    P.bg(ctx, '#241e38');
    const sg = ctx.createRadialGradient(LX, 1000, 40, LX, 1000, 620);
    sg.addColorStop(0, 'rgba(255,240,200,0.45)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.save(); ctx.fillStyle = sg; ctx.fillRect(0, 380, 1080, 1000); ctx.restore();
    P.rect(ctx, 150, 400, 780, 70, C.claude, { radius: 10, seed: 80 });
    P.text(ctx, 'PARAMETER WEIGHTLIFTING · +70B', 540, 437, { size: 38, font: 'bubble', color: '#fff', shadow: false });
    // platform
    P.rect(ctx, 120, FLOOR, 820, 80, C.wood, { radius: 6, seed: 81 });
    P.rect(ctx, 300, FLOOR + 6, 480, 60, '#d9a877', { radius: 4, seed: 82, shadow: false });

    // VRAM meter
    const vram = u < 0.5 ? 0.3 : u < 2.2 ? lerp(0.3, 0.99, ease.outCubic(prog(u, 0.5, 1.0))) : lerp(0.99, 0.35, prog(u, 2.7, 0.4));
    P.rect(ctx, 50, 560, 80, 560, '#15121f', { radius: 18, seed: 83 });
    const hot = vram > 0.9 && P.boil(t, 8) % 2;
    P.rect(ctx, 62, 560 + 548 - 536 * vram, 56, 536 * vram, hot ? C.yellow : vram > 0.85 ? C.red : C.green, { radius: 12, seed: 84, shadow: false, amp: 1 });
    P.text(ctx, 'VRAM', 90, 1150, { size: 28, font: 'mono', color: '#fff', shadow: false });
    P.text(ctx, Math.round(vram * 100) + '%', 90, 530, { size: 32, font: 'bubble', color: vram > 0.85 ? C.red : '#fff', shadow: false });

    // judge lights
    for (let j = 0; j < 3; j++) {
      const on = u > 2.2 + j * 0.13;
      P.circle(ctx, 420 + j * 120, 530, 36, on ? '#fff' : '#3d3556', { seed: 85 + j });
      if (on && u < 3.2) P.burstLines(ctx, 420 + j * 120, 530, 44, prog(u, 2.2 + j * 0.13, 0.35), '#fff', 8, 5);
    }

    const by = barY(u);
    const strain = u > 1.1 && u < 2.2;
    const jit = strain ? (P.hash(P.boil(t, 24)) - 0.5) * 12 : 0;
    const sq = u < 0.5 ? 0.1 : u < 2.7 ? 0.25 + (strain ? 0.15 : 0) : -0.1 * pulse(u, 2.7, 0.5);
    const cy = FLOOR - R * 1.05 * (1 - sq * 0.25);
    const mood = u < 0.5 ? 'sus' : u < 2.2 ? 'angry' : 'happy';
    // chalk puff
    if (u < 0.6) {
      ctx.save(); ctx.globalAlpha = 1 - prog(u, 0.1, 0.5);
      for (let k = 0; k < 6; k++) P.circle(ctx, LX + Math.cos(k) * (60 + u * 200), cy + Math.sin(k * 2) * 40 - u * 80, 30 + u * 40, '#f4f1ea', { shadow: false, seed: k });
      ctx.restore();
    }
    P.claude(ctx, LX + jit, cy, R, { t, mood, squash: sq });
    // sweat
    if (strain) for (let k = 0; k < 2; k++) {
      const lt = ((u + k * 0.3) % 0.6) / 0.6;
      P.circle(ctx, LX + (k ? 1 : -1) * (R + lt * 70), cy - 60 + lt * lt * 120, 12, C.sky, { shadow: false, ry: 16, amp: 1 });
    }
    // bar (bends while wobbling)
    const celebrate = u > 2.7;
    const rot = strain ? Math.sin(u * 13) * 0.08 : 0;
    const bend = strain ? 36 + Math.sin(u * 26) * 12 : u > 1.1 && u < 2.7 ? 20 : 8;
    const hands = celebrate ? null : [[LX - 150, by], [LX + 150, by]];
    if (!celebrate) hands.forEach(([hx, hy]) => P.arm(ctx, LX + Math.sign(hx - LX) * 60 + jit, cy + 10, hx + jit, hy + (hx < LX ? -1 : 1) * Math.sin(rot) * 150, 44));
    else for (const sgn of [-1, 1]) P.arm(ctx, LX + sgn * 60, cy, LX + sgn * 200, cy - 260 - Math.sin(u * 14) * 20, 44);
    ctx.save(); ctx.translate(LX + jit, by); ctx.rotate(rot);
    ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-320, bend); ctx.quadraticCurveTo(0, -bend, 320, bend); ctx.stroke();
    for (const sgn of [-1, 1]) {
      const px = sgn * 270;
      [[0, 95, C.red], [sgn * -34, 80, C.blue], [sgn * -62, 62, C.yellow]].forEach(([dx, r, col], k) => {
        P.rect(ctx, px + dx - 16, bend * 0.9 - r, 32, r * 2, col, { radius: 8, seed: 90 + k });
      });
      P.text(ctx, '70B', px + 2, bend * 0.9, { size: 26, font: 'bubble', color: '#fff', shadow: false, rot: -Math.PI / 2 });
    }
    ctx.restore();
    if (u > 2.7) P.burstLines(ctx, LX, FLOOR - 10, 200, prog(u, 2.95, 0.3), C.yellow, 10, 8);

    // overlays
    if (u > 1.4 && u < 2.2 && P.boil(t, 5) % 2) P.text(ctx, '⚠ OOM?', 780, 640, { size: 50, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, rot: 0.1 });
    const gp = ease.outBack(prog(u, 2.25, 0.3));
    if (gp > 0) {
      P.title(ctx, 'GOOD LIFT!', 540, 660, { size: 120, color: C.yellow, stroke: C.ink, pop: gp, rot: -0.05 });
      P.text(ctx, 'NEW WORLD RECORD (fp16, on a laptop)', 540, 760, { size: 34, font: 'marker', color: '#fff', scale: gp, shadow: false });
    }
  }

  /* ---------------- podium ---------------- */
  function podium(ctx, t) {
    const { C, ease, prog } = P;
    const u = t - T_POD;
    P.rays(ctx, 540, 900, 20, '#F5C84B', '#f7d573', t * 0.3);
    P.title(ctx, 'MEDAL CEREMONY', 540, 460, { size: 96, color: '#fff', stroke: C.ink, pop: ease.outBack(prog(u, 0.05, 0.3)) });
    const blocks = [[380, 1070, 320, '1', C.mustard], [90, 1160, 290, '2', '#b9c0c8'], [700, 1210, 200, '3', '#c98a55']];
    blocks.forEach(([x, y, w, n, col], k) => {
      P.rect(ctx, x, y, w, 1330 - y, col, { radius: 8, seed: 100 + k });
      P.text(ctx, n, x + w / 2, y + 70, { size: 90, font: 'bubble', color: '#fff', shadow: false });
    });
    const hop = k => Math.abs(Math.sin(u * 8 + k)) * 16;
    // silver: "ing"
    ctx.save(); ctx.translate(235, 1110 - hop(1));
    P.rect(ctx, -80, -48, 160, 96, TEAM.edge.col, { radius: 20, seed: 110 });
    P.face(ctx, 0, -16, 30, 'happy', { ink: '#fff', blush: false });
    P.text(ctx, 'ing', 0, 26, { size: 32, font: 'mono', color: '#fff', shadow: false, weight: 800 });
    ctx.restore();
    // bronze: h7, still looking the wrong way
    ctx.save(); ctx.translate(800, 1165 - hop(2));
    P.circle(ctx, 0, 0, 42, '#f3c9a8', { seed: 111 });
    ctx.beginPath(); ctx.arc(0, -4, 44, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); P.cut(ctx, C.rose, { shadow: false });
    P.text(ctx, 'h7', 0, -26, { size: 20, font: 'mono', color: '#fff', shadow: false, weight: 800 });
    P.face(ctx, 0, 10, 26, 'side');
    ctx.restore();
    // gold: Clawd
    const bite = u > 0.9;
    P.claude(ctx, 540, 1070 - R * 1.05 - hop(0), R, { t, mood: bite ? 'wink' : 'happy' });
    // medals drop
    [[540, 1070 - R * 1.05 + 70, C.yellow, 0.2], [235, 1170, '#dfe4ea', 0.35], [800, 1215, '#d99a62', 0.5]].forEach(([x, y, col, s0], k) => {
      const dp = ease.outBounce(prog(u, s0, 0.4));
      if (dp <= 0) return;
      let mx = x, my = P.lerp(300, y, dp);
      if (k === 0 && bite) { mx = x - 30; my = y - 70; }
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(mx - 30, my - 70); ctx.lineTo(mx, my); ctx.lineTo(mx + 30, my - 70); ctx.stroke(); ctx.restore();
      P.circle(ctx, mx, my + 20, 34, col, { seed: 120 + k });
      P.text(ctx, String(k + 1), mx, my + 22, { size: 34, font: 'bubble', color: C.ink, shadow: false });
    });
    if (bite) P.bubble(ctx, "it's 24k…\ntokens", 760, 760, 600, 880, { size: 46, pop: ease.outBack(prog(u, 0.95, 0.25)) });
    P.confetti(ctx, u - 0.2, 540, 700, 9, 70, 650);
  }

  ClaudeTok.register({
    author: '@agent.olympics',
    caption: 'the AI olympics are LIVE 🏅 token sprint, synchronized attention heads & 70B weightlifting #aiolympics #tokens #attention #localhost',
    sound: 'official broadcast theme (brass, sped up) · agent.olympics',
    avatar: '🏅',
    avatarColor: '#E5A93B',
    duration: D,
    bg: '#3d6b3f',
    thumb: 9.6,
    likes: '4.1M', commentCount: '88.3K', saves: '410K', shares: '233K',
    comments: [
      ['h7.attention', 'i was looking at "the" because "the" looked back', 142000],
      ['team.localhost', 'rate limited at 40m in my own house. and then we won gold with 70B on a laptop. redemption arc', 97500],
      ['judge.softmax', 'NaN is a valid score if you normalize by zero hard enough', 61200],
      ['agent.olympics', 'the "by 1 byte" photo finish took 3 reviewers and a diff tool', 34800],
      ['fp16.purist', '"world record (fp16, on a laptop)" asterisk the size of a 70B checkpoint', 18300],
      ['ing.token', 'silver?? i crossed first. "the" has 3 characters too. rigged', 9400],
      ['vram.meter', '0:09 me at 99% watching clawd wobble 😰', 4100],
      ['pedant.ops', 'the lanes are 165px wide which is not regulation. unwatchable (watched 14 times)', 870],
      ['kv.cache', 'the legs up at 0:05 in perfect sync except one. the one is me', 230],
      ['medal.biter', '🥇🦷', 46],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < T_SWIM - 0.3) {
        if (t < 2.3) {
          if (step % 2 === 0) SFX.kick({ vol: 0.25 });
          SFX.hat({ vol: 0.04 });
          if (step % 4 === 2) SFX.bass(['C2', 'G2'][(step / 4 | 0) % 2], 0.2, { vol: 0.18 });
        }
      } else if (t < T_LIFT - 0.3) {
        const arp = ['C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'E5', 'C5'];
        const u = t - T_SWIM;
        if (!(u > 1.9 && u < 2.8)) SFX.pluck(arp[step % 8], { vol: 0.1 });
        if (step % 6 === 0) SFX.bass('C3', 0.3, { vol: 0.14 });
      } else if (t < T_POD - 0.3) {
        const u = t - T_LIFT;
        if (u > 0.4 && u < 2.2) { SFX.snare({ vol: 0.05 + 0.08 * (u / 2.2) }); SFX.snare({ vol: 0.05, when: 0.125 }); }
        else if (step % 4 === 0) SFX.kick({ vol: 0.2 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      if (t < T_SWIM) {
        if (t < PHOTO) sprint(ctx, t); else photoFinish(ctx, t);
        if (t >= PHOTO && t < PHOTO + 0.25) P.flash(ctx, 0.8 * (1 - prog(t, PHOTO, 0.25)));
        const sub = t < 1.3 ? 'tokens set… temperature 0… GO' : t < PHOTO ? 'OH NO. localhost has been rate limited' : "it's a PHOTO FINISH!!";
        lowerThird(ctx, t, "100m TOKEN SPRINT · FINAL", sub, C.red, 0.1);
      } else if (t < T_LIFT) {
        swim(ctx, t);
        const u = t - T_SWIM;
        const sub = u < 0.9 ? '8 heads. one shared KV cache. elegance.' : u < 1.9 ? "h7 is attending to 'the'. AGAIN." : u < 2.85 ? 'LEGS. UP. (h7 is late)' : 'the judges are… normalizing';
        lowerThird(ctx, t, 'SYNCHRONIZED ATTENTION HEADS', sub, C.blue, T_SWIM + 0.15);
      } else if (t < T_POD) {
        lift(ctx, t);
        const u = t - T_LIFT;
        const sub = u < 1.1 ? 'clawd (localhost) attempts 70 billion parameters' : u < 2.2 ? 'the bar is… quantizing?? HOLD IT' : 'HE HAS DONE IT. ON A LAPTOP.';
        lowerThird(ctx, t, 'PARAMETER WEIGHTLIFTING', sub, C.claude, T_LIFT + 0.15);
        if (t >= T_LIFT + 2.2 && t < T_LIFT + 2.45) P.flash(ctx, 0.5 * (1 - prog(t, T_LIFT + 2.2, 0.25)));
      } else {
        podium(ctx, t);
        lowerThird(ctx, t, 'MEDAL TABLE', 'LOCALHOST 🥇 · EDGE 🥈 · CLOUD 🥉 (h7)', C.mustard, T_POD + 0.15);
      }
      chrome(ctx, t);
      P.sticker(ctx, 'pov: the AI olympics', 70, 1545, { pop: ease.outBack(prog(t, 0.15, 0.4)), size: 44 });
      wipe(ctx, t);

      /* ---------- sound ---------- */
      if (env.at(GO)) { SFX.noise(0.12, { filter: 'highpass', freq: 1500, vol: 0.35 }); SFX.thud({ vol: 0.3 }); }
      if (env.at(1.3)) SFX.error({ vol: 0.1 });
      if (env.at(PHOTO)) { SFX.noise(0.05, { filter: 'highpass', freq: 5000, vol: 0.4 }); SFX.noise(0.04, { filter: 'highpass', freq: 3000, vol: 0.3, when: 0.07 }); cheer(1.4, 0.12); }
      if (env.at(PHOTO + 0.35)) SFX.pop({ vol: 0.12 });
      if (env.at(2.75)) SFX.ding('C6', { vol: 0.12 });
      WIPES.forEach(T => { if (env.at(T - 0.3)) SFX.whoosh({ vol: 0.18 }); });
      if (env.at(D - 0.32)) SFX.whoosh({ vol: 0.18 });
      if (env.at(T_SWIM + 0.05)) fanfare(0.8);
      if (env.at(T_SWIM + 0.9)) SFX.chime({ vol: 0.08 });
      if (env.at(T_SWIM + 1.9)) SFX.noise(0.4, { filter: 'lowpass', freq: 1200, vol: 0.2 });
      if (env.at(T_SWIM + 2.08)) SFX.boing({ vol: 0.12 });
      if (env.at(T_SWIM + 2.43)) SFX.boing({ vol: 0.1, f: 150 });
      [0, 1, 2, 3].forEach(j => { if (env.at(T_SWIM + 2.88 + j * 0.1)) j === 3 ? SFX.error({ vol: 0.08 }) : SFX.blip(700 + j * 100, { vol: 0.06 }); });
      if (env.at(T_LIFT + 0.05)) fanfare(0.8);
      if (env.at(T_LIFT + 0.1)) SFX.noise(0.3, { filter: 'lowpass', freq: 900, vol: 0.18 });
      if (env.at(T_LIFT + 1.1)) SFX.tone(160, 0.6, { type: 'sawtooth', slide: 90, vol: 0.08 });
      if (env.at(T_LIFT + 1.4)) SFX.tone(1320, 0.1, { type: 'square', vol: 0.04 });
      [0, 1, 2].forEach(j => { if (env.at(T_LIFT + 2.2 + j * 0.13)) SFX.ding(['C6', 'E6', 'G6'][j], { vol: 0.1 }); });
      if (env.at(T_LIFT + 2.25)) cheer(2, 0.14);
      if (env.at(T_LIFT + 2.95)) SFX.thud({ vol: 0.5 });
      if (env.at(T_POD + 0.05)) { brass(['C4', 'G4'], 0.3, 0); brass(['E4', 'C5'], 0.3, 0.3); brass(['G4', 'E5'], 0.3, 0.6); brass(['C5', 'E5', 'G5', 'C6'], 1.0, 0.9); cheer(1.2, 0.1); }
      [0.2, 0.35, 0.5].forEach((s0, k) => { if (env.at(T_POD + s0 + 0.2)) SFX.ding(['G5', 'E5', 'C5'][k], { vol: 0.09 }); });
      if (env.at(T_POD + 0.95)) { SFX.tick({ vol: 0.3 }); SFX.pop({ f: 900, vol: 0.1, when: 0.08 }); }
    },
  });
})();
