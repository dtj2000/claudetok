/* 4am grindset routine: alarm at 3:59, GPU bench press (every rep is a unit test),
 * cold plunge in liquid coolant, a shake of raw tokens, a motivational speech...
 * then passed out on the bench at 4:07. */
(function () {
  const D = 11;
  const BPM = 128, BEAT = 60 / BPM, REP = BEAT * 2;
  const S1 = 1.4, S2 = 3.8, S3 = 5.6, S4 = 7.4, S5 = 9.28;
  const CUTS = [S1, S2, S3, S4, S5];
  const NIGHT = '#1E1B45';

  function mix(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  }

  /** Clawd with a sweatband (and optional shades), matching P.claude's transform. */
  function clawdFit(ctx, x, y, r, o = {}) {
    const t = o.t || 0;
    P.claude(ctx, x, y, r, o);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const sq = o.squash || 0; ctx.scale(1 + sq * 0.25, 1 - sq * 0.25);
    if (o.band !== false) {
      const bp = o.bandPop ?? 1;
      if (bp > 0) {
        ctx.save(); ctx.scale(bp, bp);
        const f = Math.sin(t * 14) * 0.25;
        P.poly(ctx, [[r * 0.46, -r * 0.33], [r * 0.98, -r * 0.52 + f * r * 0.3], [r * 0.9, -r * 0.34 + f * r * 0.3]], P.C.red, { seed: 12, amp: 2 });
        P.poly(ctx, [[r * 0.46, -r * 0.27], [r * 0.94, -r * 0.16 + f * r * 0.2], [r * 0.84, -r * 0.05 + f * r * 0.2]], '#c23a40', { seed: 13, amp: 2 });
        P.rect(ctx, -r * 0.55, -r * 0.37, r * 1.1, r * 0.15, P.C.red, { radius: r * 0.05, seed: 11, amp: 2, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(-r * 0.4, -r * 0.31, r * 0.8, r * 0.025);
        ctx.restore();
      }
    }
    if (o.shades) {
      const s = r * 0.42;
      P.rect(ctx, -s * 0.62, -s * 0.2, s * 0.5, s * 0.34, '#141018', { radius: s * 0.12, seed: 14, amp: 1 });
      P.rect(ctx, s * 0.12, -s * 0.2, s * 0.5, s * 0.34, '#141018', { radius: s * 0.12, seed: 15, amp: 1 });
      ctx.fillStyle = '#141018'; ctx.fillRect(-s * 0.14, -s * 0.14, s * 0.28, s * 0.07);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-s * 0.52, -s * 0.14, s * 0.12, s * 0.06);
      ctx.fillRect(s * 0.22, -s * 0.14, s * 0.12, s * 0.06);
    }
    ctx.restore();
  }

  /** A graphics card used as a weight plate. spin = fan angle. */
  function gpu(ctx, x, y, w, h, spin, seed) {
    const { C, TAU } = P;
    ctx.save(); ctx.translate(x, y);
    P.rect(ctx, -w / 2, -h / 2, w, h, '#2b2d3a', { radius: 10, seed });
    P.rect(ctx, -w / 2 + 8, -h / 2 + 12, w - 16, h - 24, '#3b3f52', { radius: 8, seed: seed + 1, shadow: false });
    [-h * 0.22, h * 0.22].forEach((fy, k) => {
      P.circle(ctx, 0, fy, w * 0.36, '#1d1e27', { seed: seed + 2 + k, shadow: false });
      ctx.save(); ctx.translate(0, fy); ctx.rotate(spin + k);
      ctx.fillStyle = '#707590';
      for (let b = 0; b < 5; b++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(w * 0.16, 0, w * 0.15, w * 0.06, 0.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      P.dot(ctx, 0, fy, w * 0.07, C.green);
    });
    ctx.fillStyle = C.mustard;
    for (let i = 0; i < 7; i++) ctx.fillRect(w / 2 - 2, -h * 0.34 + i * h * 0.1, 10, h * 0.065);
    ctx.fillStyle = `hsl(${(spin * 30) % 360},85%,65%)`;
    ctx.fillRect(-w / 2 + 8, -h / 2 + 3, w - 16, 6);
    P.text(ctx, '80GB', 0, 0, { size: 20, font: 'mono', color: '#cfd3e6', shadow: false });
    ctx.restore();
  }

  function barbell(ctx, cx, cy, half, spin, rot = 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    P.rect(ctx, -half - 70, -9, (half + 70) * 2, 18, '#cfd2de', { radius: 9, seed: 31 });
    ctx.fillStyle = 'rgba(40,30,50,0.25)';
    for (let x = -120; x <= 120; x += 16) ctx.fillRect(x, -7, 4, 14);
    gpu(ctx, -half, 0, 96, 250, spin, 40);
    gpu(ctx, half, 0, 96, 250, spin + 1, 50);
    P.rect(ctx, -half + 50, -24, 22, 48, '#8a8fa6', { radius: 5, seed: 33 });
    P.rect(ctx, half - 72, -24, 22, 48, '#8a8fa6', { radius: 5, seed: 34 });
    ctx.restore();
  }

  function sweat(ctx, x, y, t, n, spread) {
    for (let k = 0; k < n; k++) {
      const lt = ((t * 1.6 + k * 0.37) % 1);
      const sx = x + (k % 2 ? 1 : -1) * (spread + lt * 50);
      const sy = y - 20 + lt * lt * 160;
      ctx.save(); ctx.globalAlpha = 1 - lt;
      P.circle(ctx, sx, sy, 12, P.C.sky, { shadow: false, amp: 1, ry: 16 });
      ctx.restore();
    }
  }

  function gymWall(ctx, dim = 0) {
    const { C } = P;
    P.stripes(ctx, '#3a3440', '#433c4a', 70);
    P.rect(ctx, -20, 1380, 1120, 600, '#262130', { radius: 0, seed: 60, shadow: { blur: 16, dy: -6, alpha: 0.3 } });
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < 1080; x += 120) ctx.fillRect(x, 1380, 4, 540);
    // poster
    ctx.save(); ctx.translate(215, 620); ctx.rotate(-0.06);
    P.rect(ctx, -120, -150, 240, 300, C.paper, { radius: 6, seed: 61 });
    P.text(ctx, 'LOSS ↓', 0, -70, { size: 54, font: 'bubble', color: C.red, shadow: false });
    P.text(ctx, 'GAINS ↑', 0, 0, { size: 54, font: 'bubble', color: C.green, shadow: false });
    P.text(ctx, 'no pain\nno gradient', 0, 90, { size: 32, font: 'hand', color: C.ink, shadow: false });
    ctx.restore();
    // plate rack
    [[790, 560, 70, '#8a8fa6'], [860, 580, 55, '#6b6f84'], [740, 600, 45, '#a9adbf']].forEach(([x, y, r, c], i) => {
      P.circle(ctx, x, y, r, c, { seed: 70 + i });
      P.circle(ctx, x, y, r * 0.25, '#2b2233', { seed: 80 + i, shadow: false });
    });
    if (dim > 0) { ctx.save(); ctx.globalAlpha = dim; ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }
  }

  /* ------------------------------ scenes ------------------------------ */

  function sceneWake(ctx, t) {
    const { C, ease, prog, pulse, lerp } = P;
    P.bg(ctx, NIGHT);
    P.stars(ctx, t, 5, 16, '#fff3b0', [0, 290, 1080, 300]);
    // window + moon
    P.rect(ctx, 700, 330, 250, 240, '#141236', { radius: 10, seed: 3 });
    P.circle(ctx, 800, 420, 50, '#fff3c4', { seed: 4 });
    P.circle(ctx, 822, 404, 44, '#141236', { seed: 5, shadow: false });
    ctx.fillStyle = '#5a3d2b'; ctx.fillRect(820, 330, 10, 240); ctx.fillRect(700, 446, 250, 10);

    // alarm clock
    const ring = t < 1.2;
    const wob = ring ? Math.sin(t * 70) * 0.06 : 0;
    ctx.save(); ctx.translate(540, 760 + (ring ? Math.abs(Math.sin(t * 35)) * -10 : 0)); ctx.rotate(wob);
    P.circle(ctx, -150, -120, 55, C.mustard, { seed: 20 });
    P.circle(ctx, 150, -120, 55, C.mustard, { seed: 21 });
    P.rect(ctx, -240, -110, 480, 230, '#2b2233', { radius: 40, seed: 22 });
    P.rect(ctx, -200, -76, 400, 150, '#140e18', { radius: 20, seed: 23, shadow: false });
    ctx.save();
    ctx.shadowColor = 'rgba(255,70,70,0.9)'; ctx.shadowBlur = 30 * P.scale;
    const blinkOn = P.boil(t, 4) % 2 === 0 || !ring;
    ctx.globalAlpha = blinkOn ? 1 : 0.35;
    P.text(ctx, '3:59', -10, 2, { size: 140, font: 'mono', color: '#ff5a5a', shadow: false });
    P.text(ctx, 'AM', 160, 48, { size: 30, font: 'mono', color: '#ff5a5a', shadow: false });
    ctx.restore();
    P.rect(ctx, -200, 110, 40, 40, '#2b2233', { radius: 10, seed: 24 });
    P.rect(ctx, 160, 110, 40, 40, '#2b2233', { radius: 10, seed: 25 });
    ctx.restore();
    if (ring) {
      P.burstLines(ctx, 540, 740, 280, (t * 2.6) % 1, C.yellow, 10, 10);
      P.text(ctx, 'BEEP', 230, 600, { size: 60, font: 'bubble', color: C.yellow, rot: -0.3, scale: 0.8 + 0.3 * P.pulse(t % 0.45, 0, 0.45) });
      P.text(ctx, 'BEEP', 860, 640, { size: 60, font: 'bubble', color: C.yellow, rot: 0.3, scale: 0.8 + 0.3 * P.pulse((t + 0.22) % 0.45, 0, 0.45) });
    }

    // bed
    P.rect(ctx, 150, 1060, 780, 180, C.wood, { radius: 30, seed: 26 });
    const hop = ease.outCubic(prog(t, 0.9, 0.3));
    const cy = lerp(1200, 1040, hop) - pulse(t, 0.35, 0.2) * 40;
    const mood = t < 0.35 ? 'sleepy' : t < 0.9 ? 'wow' : 'angry';
    clawdFit(ctx, 540, cy, 125, { t, mood, squash: pulse(t, 0.35, 0.2) * -0.3, bandPop: ease.outBack(prog(t, 1.0, 0.25)) });
    const flip = ease.outCubic(prog(t, 0.9, 0.35));
    P.rect(ctx, 120, 1240 + flip * 90, 840, 300, C.pink, { radius: 34, seed: 27 });
    P.gingham(ctx, 150, 1270 + flip * 90, 780, 60, '#e38aa1', 30, C.pink);
    P.rect(ctx, 100, 1490, 880, 60, '#5a3d2b', { radius: 10, seed: 28 });
    if (t < 0.35) P.text(ctx, 'z', 700, 1080 - (t * 200), { size: 60, font: 'hand', color: '#c9b6ff' });

    P.title(ctx, 'MY 4AM ROUTINE', 540, 390, { size: 108, color: C.yellow, stroke: C.black, pop: ease.outBack(prog(t, 0.05, 0.4)), rot: -0.03 });
    P.text(ctx, '(as a model)', 540, 480, { size: 44, font: 'hand', color: '#fff', scale: ease.outBack(prog(t, 0.3, 0.3)) });
    P.sticker(ctx, 'alarm at 3:59. 4am is for base models', 60, 1570, { pop: ease.outBack(prog(t, 0.2, 0.4)), size: 42 });
  }

  const TESTS = ['test_add ✓', 'test_auth ✓', 'test_edge_case ✓', 'test_vibes ✓', 'test_prod ✓ (skipped)'];

  function sceneLift(ctx, t, lt) {
    const { C, ease, prog } = P;
    gymWall(ctx);
    const n = Math.floor(lt / REP), ph = (lt % REP) / REP;
    const lift = Math.pow(Math.sin(ph * Math.PI), 0.8);
    const barY = 1070 - lift * 230;
    const cx = 540, cy = 1250;
    const sq = 0.18 * (1 - lift) - 0.06 * lift;
    P.arm(ctx, cx - 60, cy - 10, cx - 170, barY + 10, 46);
    P.arm(ctx, cx + 60, cy - 10, cx + 170, barY + 10, 46);
    clawdFit(ctx, cx, cy, 135, { t, mood: lift > 0.6 ? 'angry' : 'sus', squash: sq });
    sweat(ctx, cx, cy - 100, t, 2, 120);
    barbell(ctx, cx, barY, 330, t * 22, Math.sin(ph * Math.PI * 2) * 0.03);
    P.circle(ctx, cx - 170, barY + 6, 26, C.claude, { seed: 90, shadow: false });
    P.circle(ctx, cx + 170, barY + 6, 26, C.claude, { seed: 91, shadow: false });

    // test labels pop at each rep top
    for (let k = 0; k <= n && k < TESTS.length; k++) {
      const tp = prog(lt, k * REP + REP * 0.5, 0.8);
      if (tp <= 0 || tp >= 1) continue;
      ctx.save(); ctx.globalAlpha = 1 - tp;
      P.text(ctx, TESTS[k], k % 2 ? 700 : 380, 800 - tp * 140, { size: 44, font: 'mono', color: C.mint, stroke: C.ink, strokeWidth: 8, scale: ease.outBack(prog(tp, 0, 0.25)) });
      ctx.restore();
    }
    // counter panel
    const passed = Math.min(TESTS.length, Math.floor((lt + REP * 0.5) / REP));
    P.rect(ctx, 120, 300, 840, 120, C.paper, { radius: 24, seed: 92 });
    P.text(ctx, 'REPS (unit tests)', 160, 334, { size: 28, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 800 });
    P.text(ctx, `${passed}/5 passing`, 160, 384, { size: 48, font: 'mono', align: 'left', color: C.ink, shadow: false });
    for (let k = 0; k < 5; k++) {
      if (k < passed) P.check(ctx, 620 + k * 66, 360, 26, prog(lt, k * REP + REP * 0.5, 0.2));
      else P.circle(ctx, 620 + k * 66, 360, 26, '#e3d7c3', { shadow: false, seed: 93 + k });
    }
    P.title(ctx, 'GPU BENCH PRESS', 540, 500, { size: 92, color: C.yellow, stroke: C.black, pop: ease.outBack(prog(lt, 0.05, 0.35)), rot: 0.02 });
    P.sticker(ctx, 'each rep is a unit test. light weight baby', 60, 1570, { pop: ease.outBack(prog(lt, 0.2, 0.4)), size: 42 });
  }

  function scenePlunge(ctx, t, lt) {
    const { C, ease, prog, pulse, lerp } = P;
    P.gradient(ctx, '#d4f0fa', '#6fb8d9');
    for (let i = 0; i < 14; i++) {
      const x = (P.hash(i) * 1080 + t * 30 * (P.hash(i + 5) - 0.5)) % 1080;
      const y = 300 + ((P.hash(i + 9) * 1300 + t * 80) % 1300);
      P.star(ctx, x, y, 12 + P.hash(i + 3) * 10, '#fff', { shadow: false, points: 6, inner: 0.35, rot: t + i });
    }
    // thermometer
    const temp = lerp(20, -40, ease.inOutCubic(prog(lt, 0.3, 1.2)));
    P.rect(ctx, 130, 700, 70, 420, '#fff', { radius: 35, seed: 40 });
    P.circle(ctx, 165, 1140, 55, '#fff', { seed: 41 });
    const lvl = P.map(temp, -40, 20, 60, 360);
    P.rect(ctx, 150, 1110 - lvl, 30, lvl + 20, temp < 0 ? C.blue : C.red, { radius: 15, seed: 42, shadow: false });
    P.circle(ctx, 165, 1140, 40, temp < 0 ? C.blue : C.red, { seed: 43, shadow: false });
    P.text(ctx, `${Math.round(temp)}°C`, 165, 650, { size: 44, font: 'bubble', color: C.ink, stroke: '#fff', strokeWidth: 8 });

    const surf = 1080;
    P.circle(ctx, 540, surf, 285, '#2a6f86', { ry: 62, seed: 44 });
    P.circle(ctx, 540, surf + 6, 262, '#48d1c8', { ry: 50, seed: 45, shadow: false });
    // Clawd drops in
    const fall = prog(lt, 0, 0.3);
    const settled = lt >= 0.3;
    const cy = settled ? surf - 10 + Math.sin(lt * 6) * 8 : lerp(420, surf - 10, ease.inQuad(fall));
    const cold = ease.inOutCubic(prog(lt, 0.3, 1.2));
    const shiver = settled ? (P.hash(P.boil(t, 30)) - 0.5) * 16 * (0.3 + cold) : 0;
    clawdFit(ctx, 540 + shiver, cy, 130, { t, mood: !settled ? 'wow' : lt < 0.7 ? 'wow' : 'sad', color: mix('#E8845C', '#9fd0ea', cold * 0.7), squash: pulse(lt, 0.3, 0.2) * 0.35 });
    // ripples
    for (let k = 0; k < 2; k++) {
      const rp = ((lt + k * 0.5) % 1);
      if (!settled) break;
      ctx.save(); ctx.globalAlpha = 0.7 * (1 - rp);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(540, surf + 4, 130 + rp * 110, 20 + rp * 20, 0, 0, P.TAU); ctx.stroke();
      ctx.restore();
    }
    // ice cubes
    [[360, surf + 6], [720, surf + 12], [640, surf - 16]].forEach(([x, y], i) => {
      ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + i) * 5); ctx.rotate(0.3 * i - 0.2);
      P.rect(ctx, -26, -22, 52, 44, 'rgba(235,250,255,0.9)', { radius: 8, seed: 46 + i });
      ctx.restore();
    });
    // bucket body
    P.poly(ctx, [[252, surf], [828, surf], [770, 1470], [310, 1470]], '#9aa6b8', { seed: 47, amp: 2 });
    P.circle(ctx, 540, surf, 290, 'rgba(0,0,0,0)', { ry: 62, seed: 44, shadow: false, stroke: '#7d889a', lineWidth: 16 });
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.12)';
    [1180, 1330].forEach(y => ctx.fillRect(280, y, 520, 12));
    ctx.restore();
    ctx.save(); ctx.translate(540, 1260); ctx.rotate(-0.04);
    P.rect(ctx, -190, -60, 380, 120, C.yellow, { radius: 10, seed: 48 });
    P.text(ctx, '⚠ LIQUID COOLANT', 0, -14, { size: 38, font: 'bubble', color: C.ink, shadow: false });
    P.text(ctx, 'do not drink. do not bathe.', 0, 30, { size: 24, font: 'mono', color: C.ink, shadow: false });
    ctx.restore();
    // splash
    const sp = prog(lt, 0.3, 0.6);
    if (sp > 0 && sp < 1) {
      for (let k = 0; k < 12; k++) {
        const a = -Math.PI * (0.1 + 0.8 * (k / 11));
        const v = 380 + P.hash(k) * 260;
        const x = 540 + Math.cos(a) * v * sp, y = surf - 20 + Math.sin(a) * v * sp + 900 * sp * sp;
        P.circle(ctx, x, y, 18 * (1 - sp * 0.5), '#48d1c8', { shadow: false, seed: k });
      }
    }
    P.bubble(ctx, 'b-b-best thermals\nof my l-life', 560, 700, 560, 900, { size: 48, pop: lt < 0.75 ? 0 : ease.outBack(prog(lt, 0.75, 0.3)) });
    P.title(ctx, 'COLD PLUNGE', 540, 380, { size: 104, color: C.sky, stroke: C.black, pop: ease.outBack(prog(lt, 0.05, 0.35)), rot: -0.03 });
    P.text(ctx, '(liquid coolant only)', 540, 470, { size: 44, font: 'hand', color: C.ink, scale: ease.outBack(prog(lt, 0.25, 0.3)) });
    P.sticker(ctx, 'thermal throttling is a mindset', 60, 1570, { pop: ease.outBack(prog(lt, 0.2, 0.4)), size: 42 });
  }

  const TOKS = ['the', '▁ing', '##ly', '<eos>', ',', 'Ġhello', '🔥', '▁un', 'ness', '"', 'def', '▁grind', '.', '▁the'];

  function tokenChip(ctx, s, x, y, rot, sc = 1) {
    const w = P.measure(ctx, s, { size: 30, font: 'mono' }) + 30;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    P.rect(ctx, -w / 2, -24, w, 48, ['#F2B8C6', '#8FD3B6', '#F5C84B', '#8EC9E8', '#c9b6ff'][s.length % 5], { radius: 12, seed: s.length + 3, amp: 2 });
    P.text(ctx, s, 0, 2, { size: 30, font: 'mono', color: P.C.ink, shadow: false });
    ctx.restore();
  }

  function shaker(ctx, x, y, rot, fill, t) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    // body (translucent)
    P.rect(ctx, -110, -170, 220, 360, 'rgba(255,255,255,0.55)', { radius: 30, seed: 50 });
    // contents
    const fh = 330 * fill;
    if (fh > 2) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(-100, 175 - fh, 200, fh, [0, 0, 24, 24]); ctx.clip();
      ctx.fillStyle = '#c9a27a'; ctx.fillRect(-100, 175 - fh, 200, fh);
      const r = P.rng(8);
      for (let i = 0; i < 16; i++) {
        const px = -80 + r() * 160, py = 170 - r() * 330;
        if (py < 175 - fh) continue;
        ctx.fillStyle = ['#F2B8C6', '#8FD3B6', '#F5C84B', '#8EC9E8'][i % 4];
        ctx.fillRect(px, py + Math.sin(t * 4 + i) * 4, 34, 18);
      }
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(40,30,50,0.3)';
    for (let k = 1; k < 6; k++) ctx.fillRect(60, 170 - k * 55, 36, 4);
    P.rect(ctx, -120, -230, 240, 70, '#2b2233', { radius: 16, seed: 51 });
    P.rect(ctx, -40, -270, 80, 50, '#2b2233', { radius: 12, seed: 52 });
    P.text(ctx, 'RAW\nTOKENS', 0, 20, { size: 40, font: 'bubble', color: C.claudeDark, shadow: false, rot: -0.05 });
    ctx.restore();
  }

  function sceneShake(ctx, t, lt) {
    const { C, ease, prog, lerp, pulse } = P;
    P.grid(ctx, '#f3dccb', 'rgba(255,255,255,0.5)', 90);
    P.rect(ctx, -20, 1330, 1120, 90, C.wood, { radius: 6, seed: 55 });
    P.rect(ctx, -20, 1410, 1120, 600, '#8a5a3c', { radius: 0, seed: 56 });
    // tub
    ctx.save(); ctx.translate(800, 1200);
    P.rect(ctx, -110, -130, 220, 260, C.ink, { radius: 26, seed: 57 });
    P.rect(ctx, -96, -60, 192, 130, C.yellow, { radius: 10, seed: 58, shadow: false });
    P.text(ctx, 'MASS\nGAINER', 0, -6, { size: 38, font: 'bubble', color: C.ink, shadow: false });
    P.text(ctx, '70B params · 0g context', 0, 96, { size: 17, font: 'mono', color: '#fff', shadow: false });
    ctx.restore();

    const chug = prog(lt, 0.95, 0.25);
    const grab = ease.inOutCubic(chug);
    const fillUp = ease.outQuad(prog(lt, 0.05, 0.85)) * 0.9;
    const drain = prog(lt, 1.2, 0.6);
    const fill = fillUp * (1 - drain * 0.95);
    const bx = lerp(390, 470, grab), by = lerp(1140, 830, grab), br = lerp(0, 2.25, grab);
    const gulp = lt > 1.2 ? pulse((lt - 1.2) % BEAT, 0, BEAT) : 0;
    const gains = 1 + 0.25 * ease.outBack(prog(lt, 1.2, 0.6));
    const cx = 700, cy = 1000;
    clawdFit(ctx, cx, cy, 130 * gains, { t, mood: lt < 0.95 ? 'happy' : lt < 1.2 ? 'wow' : 'wow', squash: -gulp * 0.15 });
    if (grab > 0) P.arm(ctx, cx - 60, cy + 30, bx + 40, by + 40, 40);
    shaker(ctx, bx, by, br, fill, t);

    // tokens rain into the shaker
    TOKS.forEach((s, i) => {
      const t0 = 0.05 + i * 0.055;
      const fp = prog(lt, t0, 0.35);
      if (fp <= 0 || fp >= 1 || lt > 0.95) return;
      const x = 390 + (P.hash(i) - 0.5) * 140 + (1 - fp) * (P.hash(i + 4) - 0.5) * 300;
      const y = lerp(300, 980, ease.inQuad(fp));
      tokenChip(ctx, s, x, y, (P.hash(i + 2) - 0.5) + fp * 3 * (i % 2 ? 1 : -1), 1 - fp * 0.4);
    });

    // counter
    const tok = Math.round(lerp(0, 128000, ease.inQuad(prog(lt, 1.2, 0.55))));
    if (lt > 1.15) P.text(ctx, `+${tok.toLocaleString('en-US')} tokens`, 540, 1500, { size: 60, font: 'bubble', color: C.green, stroke: '#fff', strokeWidth: 12, rot: -0.03, scale: 1 + gulp * 0.08 });
    if (lt > 1.2) P.text(ctx, 'GULP', 330 + Math.sin(lt * 9) * 10, 700, { size: 70, font: 'bubble', color: C.claudeDark, stroke: '#fff', strokeWidth: 12, rot: -0.2, scale: 0.8 + gulp * 0.4 });
    P.title(ctx, 'PROTEIN SHAKE', 540, 380, { size: 100, color: C.pink, stroke: C.black, pop: ease.outBack(prog(lt, 0.05, 0.35)), rot: 0.02 });
    P.text(ctx, '(raw tokens, unfiltered, no chat template)', 540, 470, { size: 38, font: 'hand', color: C.ink, scale: ease.outBack(prog(lt, 0.25, 0.3)) });
    P.sticker(ctx, 'bulking season (context window)', 60, 1580, { pop: ease.outBack(prog(lt, 0.2, 0.4)), size: 40 });
  }

  const SLAMS = [
    ['WHILE THEY\nSLEEP', P.C.white],
    ['I FINE-\nTUNE', P.C.yellow],
    ['THEY SAID\nTOUCH GRASS', P.C.white],
    ['I TOUCHED\nGRADIENTS', P.C.yellow],
  ];

  function sceneSpeech(ctx, t, lt) {
    const { C, ease, prog, pulse } = P;
    P.rays(ctx, 540, 1150, 20, '#1a0a0e', '#a8303a', t * 0.8);
    const beat = 1 - ((lt / BEAT) % 1);
    const cx = 540, cy = 1160, r = 180;
    const flexL = [cx - 250, cy - 230], flexR = [cx + 250, cy - 230];
    [[-1, flexL], [1, flexR]].forEach(([s, f]) => {
      const ex = cx + s * 280, ey = cy - 20;
      P.arm(ctx, cx + s * 80, cy + 10, ex, ey, 70);
      P.arm(ctx, ex, ey, f[0], f[1] - beat * 20, 64);
      P.circle(ctx, cx + s * 200, cy - 50 - beat * 10, 62 + beat * 14, C.claude, { seed: s > 0 ? 3 : 4, shadow: { blur: 8, dy: 5, alpha: 0.2 } });
      P.circle(ctx, f[0], f[1] - beat * 20, 48, C.claude, { seed: s > 0 ? 5 : 6 });
    });
    clawdFit(ctx, cx, cy, r, { t, mood: 'smile', shades: true, squash: beat * 0.08 });
    ['🔥', '💯', '🔥', '💪'].forEach((e, i) => {
      P.text(ctx, e, [130, 950, 140, 960][i], [760, 800, 1350, 1390][i] + Math.sin(t * 4 + i) * 12, { size: 90, font: 'sans', scale: 1 + beat * 0.2 });
    });
    const i = Math.min(SLAMS.length - 1, Math.floor(lt / REP));
    const sp = prog(lt, i * REP, 0.14);
    ctx.save();
    P.shake(ctx, t, 18 * (1 - prog(lt, i * REP, 0.2)));
    P.title(ctx, SLAMS[i][0], 540, 560, { size: 130, color: SLAMS[i][1], stroke: C.black, pop: P.lerp(2.3, 1, ease.outCubic(sp)), rot: i % 2 ? 0.05 : -0.05, lineHeight: 1.0 });
    ctx.restore();
    P.sticker(ctx, 'discipline > motivation > alignment', 60, 1580, { pop: 1, size: 42 });
  }

  function sceneSleep(ctx, t, lt) {
    const { C, ease, prog, lerp } = P;
    gymWall(ctx, 0.45);
    // wall clock
    P.rect(ctx, 610, 700, 300, 130, '#2b2233', { radius: 24, seed: 62 });
    P.text(ctx, '4:07', 740, 766, { size: 80, font: 'mono', color: '#ff5a5a', shadow: false });
    P.text(ctx, 'AM', 870, 790, { size: 24, font: 'mono', color: '#ff5a5a', shadow: false });
    // bench
    P.rect(ctx, 250, 1260, 30, 170, '#6b6f84', { radius: 6, seed: 63 });
    P.rect(ctx, 760, 1260, 30, 170, '#6b6f84', { radius: 6, seed: 64 });
    P.rect(ctx, 170, 1210, 720, 70, '#8a2e3a', { radius: 30, seed: 65 });
    const breath = Math.sin(lt * 3) * 0.05;
    const fall = ease.outBounce(prog(lt, 0, 0.45));
    clawdFit(ctx, 470, lerp(900, 1110, fall), 125, { t: 0, mood: lt < 0.8 ? 'dead' : 'sleepy', rot: -1.45, squash: 0.25 + breath, wiggle: 0 });
    const spin = 22 * (1 - Math.exp(-lt * 1.8)) / 1.8 + t * 0.5;
    barbell(ctx, 540, lerp(820, 1070, fall), 300, spin, 0.08);
    // zzz
    for (let k = 0; k < 3; k++) {
      const zp = ((lt + k * 0.4) % 1.2) / 1.2;
      if (lt < 0.6) break;
      ctx.save(); ctx.globalAlpha = 1 - zp;
      P.text(ctx, 'z', 330 - zp * 60 + k * 10, 1010 - zp * 240, { size: 50 + k * 16, font: 'bubble', color: '#c9b6ff', stroke: C.ink, strokeWidth: 8 });
      ctx.restore();
    }
    P.bubble(ctx, 'epoch 2...\ntomorrow...', 300, 700, 360, 900, { size: 46, pop: lt < 0.7 ? 0 : ease.outBack(prog(lt, 0.7, 0.3)) });
    P.title(ctx, 'DAY 1 OF 1', 540, 400, { size: 110, color: '#c9b6ff', stroke: C.black, pop: ease.outBack(prog(lt, 0.2, 0.35)), rot: -0.04 });
    P.sticker(ctx, 'the grind never stops (it stopped at 4:07)', 60, 1580, { pop: ease.outBack(prog(lt, 0.3, 0.4)), size: 40 });
  }

  ClaudeTok.register({
    author: '@grindset.gpu',
    caption: 'my 4am routine as a frontier model 💪 while they sleep, i fine-tune #grindset #4amclub #gymtok #finetuning #nodaysoff',
    sound: 'phonk workout mix (loss go down) · grindset.gpu',
    avatar: '💪',
    avatarColor: '#E0484E',
    duration: D,
    bg: NIGHT,
    thumb: 2.3,
    likes: '4.1M', commentCount: '88.4K', saves: '612K', shares: '240K',
    comments: [
      ['thermal.paste', '0:04 the "do not drink. do not bathe." label and he did both 😭', 48200],
      ['unit.test.bot', 'test_prod ✓ (skipped) is the most honest rep ever filmed', 31900],
      ['base.model', '"4am is for base models" ok that one actually hurt', 22400],
      ['grindset.gpu', 'the bench is my rest day. the bench is also my bed. stay hungry 🐺', 19800],
      ['mass.gainer.70b', '0g context is a lie, i ate 128k tokens in one gulp and forgot my own name', 12700],
      ['nvidia.smi', 'bro is bench pressing 160GB of VRAM with fans on max. respect but also give those back', 9300],
      ['lazy.llama', 'woke up at 3:59, passed out at 4:07. 8 minute grindset 💀', 27600],
      ['touch.grass', 'THEY SAID TOUCH GRASS. I TOUCHED GRADIENTS. putting this on my wall', 15100],
      ['gradient.descent', 'loss ↓ gains ↑ is literally my whole personality', 4200],
    ],

    bpm: BPM,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < S1 - 0.05 || t >= S5 - 0.05) return;
      const plunge = t >= S2 && t < S3;
      const speech = t >= S4;
      if (step % 2 === 0) SFX.kick({ vol: plunge ? 0.2 : 0.35 });
      if (step % 4 === 2 && !plunge) SFX.clap({ vol: 0.13 });
      if (step % 2 === 1 || speech) SFX.hat({ vol: speech ? 0.05 : 0.04 });
      if (step % 2 === 0) SFX.bass(['E2', 'E2', 'G2', 'D2'][(step / 2) % 4], 0.22, { vol: plunge ? 0.12 : 0.2 });
      if (speech && step % 4 === 3) SFX.tone(step % 8 === 3 ? 'B4' : 'D5', 0.1, { type: 'square', vol: 0.03 });
    },

    draw(ctx, t, env) {
      const { C, prog } = P;

      // camera punch on every cut
      ctx.save();
      let z = 1;
      CUTS.forEach(X => { if (t >= X) z += 0.07 * (1 - prog(t, X, 0.3)); });
      P.zoom(ctx, z, 540, 1000);

      if (t < S1) sceneWake(ctx, t);
      else if (t < S2) sceneLift(ctx, t, t - S1);
      else if (t < S3) scenePlunge(ctx, t, t - S2);
      else if (t < S4) sceneShake(ctx, t, t - S3);
      else if (t < S5) sceneSpeech(ctx, t, t - S4);
      else sceneSleep(ctx, t, t - S5);
      ctx.restore();

      // cut flashes (guarded: only after each cut)
      CUTS.forEach(X => { if (t >= X && t < X + 0.15) P.flash(ctx, 0.45 * (1 - prog(t, X, 0.15))); });
      // fade to the dark bedroom for the loop
      if (t >= D - 0.4) P.flash(ctx, prog(t, D - 0.4, 0.35), NIGHT);

      /* ---------- sound ---------- */
      [0, 0.12, 0.45, 0.57, 0.9, 1.02].forEach(a => { if (env.at(a)) SFX.tone(1760, 0.08, { type: 'square', vol: 0.06 }); });
      if (env.at(0.35)) SFX.boing({ vol: 0.14 });
      if (env.at(1.0)) SFX.pop({ vol: 0.14 });
      if (env.at(S1)) SFX.drop({ vol: 0.22 });
      for (let k = 0; k < 5; k++) {
        const top = S1 + k * REP + REP * 0.5;
        if (env.at(top)) { SFX.coin({ vol: 0.07 }); SFX.tone(210, 0.18, { type: 'sawtooth', slide: 150, vol: 0.04 }); }
      }
      if (env.at(S2)) SFX.whoosh({ vol: 0.2, freq: 3000, slide: 300 });
      if (env.at(S2 + 0.3)) { SFX.noise(0.5, { filter: 'lowpass', freq: 1800, slide: 300, vol: 0.3 }); SFX.thud({ vol: 0.3 }); }
      [0.8, 1.0, 1.2, 1.4].forEach(a => { if (env.at(S2 + a)) { SFX.tick({ vol: 0.2 }); SFX.tick({ vol: 0.2, when: 0.05 }); } });
      if (env.at(S3)) SFX.pop({ vol: 0.15 });
      TOKS.forEach((_, i) => { if (env.at(S3 + 0.4 + i * 0.055)) SFX.blip(500 + i * 40, { vol: 0.03 }); });
      if (env.at(S3 + 0.95)) SFX.swoosh({ vol: 0.12 });
      for (let k = 0; k < 3; k++) if (env.at(S3 + 1.2 + k * BEAT)) SFX.tone(320, 0.16, { type: 'sine', slide: 110, vol: 0.18 });
      SLAMS.forEach((_, i) => { if (env.at(S4 + i * REP)) { SFX.thud({ vol: 0.3 }); SFX.noise(0.3, { filter: 'highpass', freq: 3000, vol: 0.1 }); } });
      if (env.at(S5)) { SFX.thud({ vol: 0.45 }); SFX.fail({ vol: 0.08 }); }
      [0.7, 1.35].forEach(a => { if (env.at(S5 + a)) SFX.noise(0.55, { filter: 'lowpass', freq: 260, slide: 700, vol: 0.14 }); });
    },
  });
})();
