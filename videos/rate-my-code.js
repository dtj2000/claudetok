/* Rate My Code: three paper judges roast a snippet. Tabs AND spaces on the same
 * line, a variable named data2_final, a 900-line function. Scorecards flip
 * 2/10, 1/10, -4/10 while the snippet sweats. Then git blame reveals the author
 * is the harshest judge, who quietly re-flips to 10/10 (vintage). */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 11;
  const FLIP = [1.9, 3.6, 5.6];
  const BLAME = 7.0, HALZ = 8.2, REFLIP = 9.4, CLOSE = 10.3;
  const CURTAIN = '#B8323F', CURTAIN_D = '#8E2231';
  const HEAD_Y = 1150, CARD_Y = 1005;

  const JUDGES = [
    { x: 190, name: 'LINT LARRY', role: 'the linter', col: '#2F8F7A', skin: '#8FD3B6', score: '2/10' },
    { x: 490, name: 'NIT NANCY', role: 'code review', col: '#E0607E', skin: '#F2B8C6', score: '1/10' },
    { x: 790, name: 'HARSH HAL', role: 'principal eng', col: '#6B4E9B', skin: '#c9b6ff', score: '-4/10' },
  ];

  // the snippet: [text, kind, highlight?]
  const K = { kw: '#C45BAA', fn: '#3F77B5', v: '#C96A45', ink: '#2B2233', cm: '#8a8494', ws: '#E0607E' };
  const LINES = [
    [['function ', 'kw'], ['doEverything', 'fn'], ['(data) {', 'ink']],
    [['→   ', 'ws'], ['let ', 'kw'], ['data2_final', 'v', 1], [' = data;', 'ink']],
    [['··', 'ws'], ['if ', 'kw'], ['(', 'ink'], ['data2_final', 'v', 1], [') {', 'ink']],
    [['→ ··', 'ws'], ['data2_final', 'v', 1], [' = ', 'ink'], ['data2_final', 'v', 1], [';', 'ink']],
    [['····', 'ws'], ['// TODO: fix later', 'cm']],
    [['··', 'ws'], ['}', 'ink'], ['  // 894 more lines', 'cm']],
  ];
  const WIN = { x: 120, y: 400, w: 840, h: 520 };
  const LH = 56, CODE_Y = 505, CODE_X = 215;

  const BLAME_LINES = [
    ['a1b2c3 (', 'hal', ' 2019) function doEverything('],
    ['a1b2c3 (', 'hal', ' 2019)   let data2_final = …'],
    ['a1b2c3 (', 'hal', ' 2019)   // TODO: fix later'],
    ['…894 more (', 'hal', ' 2019) }'],
  ];

  function drop(ctx, x, y, s, col = '#8EC9E8') {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.2);
    ctx.bezierCurveTo(x + s * 0.9, y, x + s * 0.8, y + s * 0.9, x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 0.8, y + s * 0.9, x - s * 0.9, y, x, y - s * 1.2);
    ctx.closePath();
    P.cut(ctx, col, { rim: false, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
  }

  /** sweat drops falling from a point, deterministic in t */
  function sweat(ctx, t, x, y, amount, seed, n = 3) {
    if (amount <= 0) return;
    for (let k = 0; k < n; k++) {
      const rate = 1.1 + P.hash(seed + k) * 0.8;
      const ph = (t * rate + k / n + P.hash(seed * 3 + k)) % 1;
      const dx = (P.hash(seed + k * 7) - 0.5) * 40;
      ctx.save(); ctx.globalAlpha = (1 - ph) * P.clamp(amount);
      drop(ctx, x + dx, y + ph * 140 * amount, 11 + amount * 5);
      ctx.restore();
    }
  }

  function curtains(ctx, closed, t) {
    const { lerp } = P;
    const w = lerp(95, 560, closed);
    const sway = Math.sin(t * 2.3) * 6 * (1 - closed);
    const side = (dir) => {
      ctx.save();
      if (dir < 0) { ctx.translate(1080, 0); ctx.scale(-1, 1); }
      const folds = 7, fw = w / folds;
      for (let i = 0; i < folds; i++) {
        const x0 = i * fw, bottomBulge = Math.sin(i * 1.3 + t * 1.5) * 8;
        ctx.beginPath();
        ctx.moveTo(x0 - 4, 250);
        ctx.lineTo(x0 + fw + 4, 250);
        ctx.lineTo(x0 + fw + 4 + sway * (i / folds), 1930);
        ctx.lineTo(x0 - 4 + sway * (i / folds), 1930 + bottomBulge);
        ctx.closePath();
        P.cut(ctx, i % 2 ? CURTAIN_D : CURTAIN, { rim: false, shadow: i === folds - 1 ? { blur: 20, dy: 0, alpha: 0.4 } : false });
      }
      // tie-back rope
      if (closed < 0.6) {
        ctx.save(); ctx.globalAlpha = 1 - closed / 0.6;
        P.rect(ctx, w - 30, 1100, 44, 26, P.C.mustard, { radius: 12, seed: 7 });
        P.circle(ctx, w - 8, 1150, 16, P.C.yellow, { seed: 8 });
        ctx.restore();
      }
      ctx.restore();
    };
    side(1); side(-1);
    // valance
    ctx.beginPath();
    ctx.moveTo(-10, 230);
    for (let x = -10; x <= 1100; x += 90) ctx.quadraticCurveTo(x + 45, 330, x + 90, 280);
    ctx.lineTo(1100, 230); ctx.closePath();
    P.cut(ctx, CURTAIN_D, { rim: false });
    for (let x = 35; x < 1080; x += 90) P.dot(ctx, x, 300, 8, P.C.mustard);
    if (closed > 0.02) {
      P.title(ctx, 'RATE MY\nCODE', 540, 880, { size: 150, color: P.C.yellow, stroke: CURTAIN_D, pop: P.clamp(closed * 1.4 - 0.3), rot: -0.05, lineHeight: 1 });
      P.text(ctx, 'tonight\'s contestant: doEverything.js', 540, 1110, { size: 44, font: 'marker', color: '#FBE6DC', scale: P.clamp(closed * 1.4 - 0.3) });
    }
  }

  function marquee(ctx, t) {
    const { C } = P;
    P.rect(ctx, 250, 296, 580, 84, C.mustard, { radius: 18, seed: 11 });
    const on = P.boil(t, 5) % 2;
    for (let i = 0; i < 16; i++) {
      const bx = 268 + i * 36.3;
      P.dot(ctx, bx, 304, 6, (i + on) % 2 ? '#FFF6C8' : '#b88a2a');
      P.dot(ctx, bx, 372, 6, (i + on + 1) % 2 ? '#FFF6C8' : '#b88a2a');
    }
    P.text(ctx, 'RATE MY CODE', 540, 340, { size: 52, font: 'bubble', color: C.red, shadow: false });
  }

  function lineBars(ctx, x, y, lineNo) {
    const r = P.rng(lineNo * 13 + 5);
    const cols = [K.kw, K.fn, K.v, '#5DB36A', '#8a8494', '#E5A93B'];
    let cx = x + Math.floor(r() * 4) * 38;
    const segs = 1 + Math.floor(r() * 4);
    ctx.save();
    for (let s = 0; s < segs; s++) {
      const sw = 40 + r() * 190;
      if (cx + sw > WIN.x + WIN.w - 80) break;
      ctx.fillStyle = cols[Math.floor(r() * cols.length)];
      ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.roundRect(cx, y - 13, sw, 26, 13); ctx.fill();
      cx += sw + 16;
    }
    ctx.restore();
  }

  function snippet(ctx, t, env) {
    const { C, ease, prog, pulse, lerp, clamp } = P;
    const { x, y, w, h } = WIN;
    P.window(ctx, x, y, w, h, 'doEverything.js', { seed: 12 });
    // gutter
    ctx.save(); ctx.fillStyle = 'rgba(43,34,51,0.05)'; ctx.fillRect(x + 12, y + 72, 70, h - 170); ctx.restore();

    const scrolling = t >= 3.8 && t < 5.6;
    const tabsP = t >= 0.6 && t < 1.95 ? 1 : 0;
    const hlP = ease.outCubic(prog(t, 2.15, 0.45)) * (t < 3.7 ? 1 : 0);

    ctx.save();
    ctx.beginPath(); ctx.rect(x + 10, y + 74, w - 20, 340); ctx.clip();
    if (scrolling) {
      const off = t < 5.3 ? ease.inOutQuad(prog(t, 3.8, 1.5)) * 894 : lerp(894, 0, ease.outCubic(prog(t, 5.3, 0.3)));
      const base = Math.floor(off), frac = off - base;
      for (let i = -1; i < 7; i++) {
        const n = base + i, ly = CODE_Y + (i - frac) * LH;
        if (n < 0 || n > 899) continue;
        P.text(ctx, String(n + 1), x + 70, ly, { size: 24, font: 'mono', color: '#b3aabd', align: 'right', shadow: false });
        if (n < 6 && off < 6) continue;
        lineBars(ctx, CODE_X, ly, n);
      }
      // re-draw the real code under it when near the top
      if (off < 6) drawCode(ctx, t, -off * LH, 0, 0, []);
    } else {
      const hits = [];
      for (let i = 0; i < LINES.length; i++) P.text(ctx, String(i + 1), x + 70, CODE_Y + i * LH, { size: 24, font: 'mono', color: '#b3aabd', align: 'right', shadow: false });
      drawCode(ctx, t, 0, tabsP, hlP, hits);
      // magnifier over data2_final
      const mg = ease.outBack(prog(t, 2.2, 0.35)) * (1 - prog(t, 3.5, 0.2));
      if (mg > 0 && hits.length) {
        const k = Math.min(hits.length - 1, Math.floor(prog(t, 2.4, 1.1) * hits.length));
        const hx = hits[k][0] + hits[k][1] / 2, hy = hits[k][2];
        ctx.save();
        ctx.translate(hx, hy); ctx.scale(mg, mg);
        ctx.strokeStyle = C.brown; ctx.lineWidth = 16; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(62, 62); ctx.lineTo(120, 120); ctx.stroke();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, 84, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();

    // scrollbar
    const sbY = scrolling ? (t < 5.3 ? ease.inOutQuad(prog(t, 3.8, 1.5)) : 1 - ease.outCubic(prog(t, 5.3, 0.3))) : 0;
    P.rect(ctx, x + w - 36, y + 86, 18, 320, 'rgba(43,34,51,0.08)', { radius: 9, shadow: false, seed: 13 });
    P.rect(ctx, x + w - 36, y + 86 + sbY * 314, 18, 6, C.ink, { radius: 3, shadow: false, seed: 14 });

    // tabs red circle
    if (t >= 0.7 && t < 2.0) {
      const cp = ease.outCubic(prog(t, 0.7, 0.5));
      ctx.save();
      ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(CODE_X + 42, CODE_Y + 2.5 * LH, 78, 150, -0.08, -1.2, -1.2 + TAU * 1.05 * cp); ctx.stroke();
      ctx.restore();
    }

    // face strip at the bottom of the window
    const fy = y + h - 64;
    let mood = 'smile';
    if (t >= FLIP[0]) mood = 'wow';
    if (t >= FLIP[1]) mood = 'sad';
    if (t >= FLIP[2]) mood = 'sad';
    if (t >= 7.6) mood = 'side';
    if (t >= REFLIP) mood = 'happy';
    const blink = pulse(t % 2.7, 2.5, 0.18);
    P.face(ctx, 540, fy, 62, mood, { skin: C.paper, blink });
    // tears
    if (t >= FLIP[2] && t < 7.6) {
      const tp = prog(t, FLIP[2], 0.4);
      ctx.save(); ctx.fillStyle = 'rgba(79,127,217,0.7)';
      [-1, 1].forEach(s => {
        const ex = 540 + s * 24;
        ctx.beginPath(); ctx.roundRect(ex - 6, fy, 12, 70 * tp + Math.sin(t * 20 + s) * 4, 6); ctx.fill();
      });
      ctx.restore();
    }
    // smug sparkle after re-flip
    if (t >= REFLIP) {
      const g = pulse(t, REFLIP + 0.1, 0.8);
      P.star(ctx, 640, fy - 40, 20 * g, C.yellow, { shadow: false, rot: t });
      P.star(ctx, 440, fy - 50, 14 * g, C.yellow, { shadow: false, rot: -t });
    }
  }

  function drawCode(ctx, t, dy, tabsP, hlP, hits) {
    const { C } = P;
    LINES.forEach((line, i) => {
      let cx = CODE_X;
      const ly = CODE_Y + i * LH + dy;
      line.forEach(([str, kind, hl]) => {
        const sw = P.measure(ctx, str, { size: 32, font: 'mono' });
        if (hl && hlP > 0) {
          ctx.save(); ctx.fillStyle = 'rgba(245,200,75,0.8)';
          ctx.beginPath(); ctx.roundRect(cx - 4, ly - 20, (sw + 8) * hlP, 40, 6); ctx.fill(); ctx.restore();
          hits.push([cx, sw, ly]);
        }
        const ws = kind === 'ws';
        const sc = ws && tabsP ? 1 + 0.25 * Math.abs(Math.sin(t * 9)) : 1;
        P.text(ctx, str, cx, ly, { size: 32, font: 'mono', align: 'left', color: ws ? (tabsP ? C.red : 'rgba(224,96,126,0.55)') : K[kind], shadow: false, scale: sc });
        cx += sw;
      });
    });
  }

  function stickyNote(ctx, str, x, y, pop, rot, seed) {
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(pop, pop);
    P.rect(ctx, -150, -80, 300, 160, '#FFE680', { radius: 4, seed });
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-150, -80, 300, 26); ctx.restore();
    P.text(ctx, str, 0, 12, { size: 42, font: 'marker', color: P.C.red, shadow: false, lineHeight: 1 });
    ctx.restore();
  }

  function blameTerm(ctx, t) {
    const { C, ease, prog } = P;
    if (t < BLAME) return;
    const dy = P.lerp(-760, 0, ease.outBack(prog(t, BLAME, 0.35)));
    ctx.save();
    ctx.translate(0, dy);
    P.rect(ctx, 150, 430, 780, 440, '#1E1B2E', { radius: 22, seed: 21 });
    [C.red, C.yellow, C.green].forEach((c, i) => P.dot(ctx, 190 + i * 36, 466, 11, c));
    P.text(ctx, 'terminal', 540, 466, { size: 26, font: 'mono', color: '#8a8494', shadow: false });
    const cmd = P.typed('$ git blame doEverything.js', prog(t, BLAME + 0.25, 0.45));
    P.text(ctx, cmd + (P.boil(t, 4) % 2 ? '▌' : ''), 185, 530, { size: 30, font: 'mono', align: 'left', color: C.mint, shadow: false });
    BLAME_LINES.forEach(([a, who, b], i) => {
      const at = BLAME + 0.8 + i * 0.15;
      if (t < at) return;
      const ly = 600 + i * 62;
      const wa = P.measure(ctx, a, { size: 26, font: 'mono' });
      const ww = P.measure(ctx, who, { size: 26, font: 'mono' });
      const glow = t >= HALZ - 0.3;
      if (glow) { ctx.save(); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.roundRect(185 + wa - 4, ly - 18, ww + 8, 36, 6); ctx.fill(); ctx.restore(); }
      P.text(ctx, a, 185, ly, { size: 26, font: 'mono', align: 'left', color: '#b3aabd', shadow: false });
      P.text(ctx, who, 185 + wa, ly, { size: 26, font: 'mono', align: 'left', color: glow ? C.ink : C.pink, shadow: false });
      P.text(ctx, b, 185 + wa + ww, ly, { size: 26, font: 'mono', align: 'left', color: '#e8e2f0', shadow: false });
    });
    ctx.restore();
  }

  function scoreCard(ctx, x, y, front, flipP, o = {}) {
    const { C } = P;
    const sx = Math.max(0.03, Math.abs(Math.cos(flipP * Math.PI)));
    const showFront = flipP >= 0.5;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    P.rect(ctx, -8, 40, 16, 150, C.wood, { radius: 6, seed: 31 });
    ctx.scale(sx * (o.scale || 1), o.scale || 1);
    P.rect(ctx, -92, -64, 184, 128, showFront ? (o.bg || C.paper) : C.yellow, { radius: 12, seed: 32 + (o.seed || 0) });
    if (showFront) {
      const multi = front.indexOf('\n') >= 0;
      P.text(ctx, front, 0, 4, { size: multi ? 40 : 64, font: 'bubble', color: o.color || C.ink, shadow: false, lineHeight: 0.95 });
    } else P.text(ctx, '?', 0, 4, { size: 74, font: 'bubble', color: C.claudeDark, shadow: false });
    ctx.restore();
  }

  function judge(ctx, j, i, t) {
    const { C, ease, prog } = P;
    const x = j.x;
    const isHal = i === 2;
    const scored = t >= FLIP[i];
    let mood = 'sus';
    if (t >= FLIP[i] - 0.5 && t < FLIP[i] + 0.9) mood = 'angry';
    if (isHal && t >= FLIP[2] && t < BLAME) mood = 'angry';
    if (t >= HALZ) mood = isHal ? 'side' : 'side';
    if (!isHal && t >= HALZ) mood = 'sus';
    if (isHal && t >= HALZ + 0.1 && t < HALZ + 0.5) mood = 'wow';
    if (isHal && t >= REFLIP + 0.2) mood = 'wink';
    const talk = isHal && t >= 6.0 && t < 6.9 && P.boil(t, 9) % 2;
    if (talk) mood = 'wow';
    const lean = isHal && t >= FLIP[2] && t < BLAME ? Math.sin(t * 14) * 0.03 : 0;
    const halSweat = isHal ? P.clamp((t - HALZ) / 0.6) * (t < REFLIP ? 1 : 0.4) : 0;

    ctx.save();
    ctx.translate(x, HEAD_Y); ctx.rotate(lean); ctx.translate(-x, -HEAD_Y);
    // torso
    P.rect(ctx, x - 100, HEAD_Y + 60, 200, 220, j.col, { radius: 60, seed: 40 + i });
    if (i === 0) P.poly(ctx, [[x - 14, HEAD_Y + 70], [x + 14, HEAD_Y + 70], [x + 20, HEAD_Y + 170], [x, HEAD_Y + 190], [x - 20, HEAD_Y + 170]], C.yellow, { seed: 44 });
    if (i === 1) for (let k = 0; k < 7; k++) P.dot(ctx, x - 54 + k * 18, HEAD_Y + 86 + Math.sin(k / 6 * Math.PI) * 22, 8, '#fff');
    if (isHal) P.rect(ctx, x - 58, HEAD_Y + 52, 116, 40, '#4b3570', { radius: 14, seed: 45 });
    // head
    if (i === 0) {
      P.rect(ctx, x - 70, HEAD_Y - 70, 140, 136, j.skin, { radius: 30, seed: 46 });
      P.rect(ctx, x - 40, HEAD_Y - 92, 80, 30, '#2B2233', { radius: 10, seed: 47 });
    } else if (i === 1) {
      P.circle(ctx, x, HEAD_Y - 96, 62, C.brown, { seed: 48 });
      P.circle(ctx, x, HEAD_Y, 72, j.skin, { seed: 49 });
      P.dot(ctx, x - 70, HEAD_Y + 26, 9, C.yellow); P.dot(ctx, x + 70, HEAD_Y + 26, 9, C.yellow);
    } else {
      P.circle(ctx, x - 64, HEAD_Y - 10, 30, '#d9d4e2', { seed: 50 });
      P.circle(ctx, x + 64, HEAD_Y - 10, 30, '#d9d4e2', { seed: 51 });
      P.circle(ctx, x, HEAD_Y, 74, j.skin, { seed: 52 });
      P.poly(ctx, [[x - 58, HEAD_Y + 30], [x + 58, HEAD_Y + 30], [x + 36, HEAD_Y + 110], [x, HEAD_Y + 128], [x - 36, HEAD_Y + 110]], '#d9d4e2', { seed: 53 });
    }
    P.face(ctx, x, HEAD_Y + (isHal ? -6 : 4), 62, mood, { skin: j.skin });
    if (isHal) {
      // mouth hole in the beard
      ctx.save(); ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(x, HEAD_Y + 44, 16, talk ? 14 : 5, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (i === 0) {
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x - 24, HEAD_Y, 22, 0, TAU); ctx.moveTo(x + 46, HEAD_Y); ctx.arc(x + 24, HEAD_Y, 22, 0, TAU);
      ctx.moveTo(x - 2, HEAD_Y); ctx.lineTo(x + 2, HEAD_Y); ctx.stroke(); ctx.restore();
    }
    sweat(ctx, t, x + 60, HEAD_Y - 50, halSweat * 1.2, 77, 4);
    ctx.restore();

    // score card + arm
    const raise = ease.outBack(prog(t, FLIP[i] - 0.5, 0.3));
    if (raise > 0) {
      const cy = P.lerp(1330, CARD_Y, raise);
      let flip = prog(t, FLIP[i] - 0.14, 0.26);
      let front = j.score, bg, color;
      if (isHal) { bg = C.red; color = '#fff'; }
      if (isHal && t >= REFLIP - 0.14) { flip = prog(t, REFLIP - 0.14, 0.3); if (flip >= 0.5) { front = '10/10\n(vintage)'; bg = C.green; } else { flip = 1 - flip; } }
      const wob = isHal && t >= FLIP[2] && t < BLAME ? Math.sin(t * 20) * 0.06 : Math.sin(t * 3 + i) * 0.03;
      const sc = isHal && scored && t < REFLIP ? 1.12 : 1;
      const hx = x - 80;
      P.arm(ctx, x - 78, HEAD_Y + 110, hx, cy + 150, 34, j.col);
      scoreCard(ctx, hx, cy, front, flip, { bg, color, rot: wob, scale: sc, seed: i });
      if (scored && t < FLIP[i] + 0.4) P.burstLines(ctx, hx, cy, 110, prog(t, FLIP[i], 0.4), isHal ? C.red : C.yellow, 10, 9);
      if (isHal && t >= REFLIP && t < REFLIP + 0.5) P.burstLines(ctx, hx, cy, 110, prog(t, REFLIP, 0.5), C.green, 10, 9);
    }
  }

  function desk(ctx, t) {
    const { C } = P;
    P.rect(ctx, 30, 1250, 1020, 210, '#3B2D5E', { radius: 18, seed: 60 });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(40, 1262, 1000, 14); ctx.restore();
    JUDGES.forEach((j, i) => {
      P.rect(ctx, j.x - 105, 1300, 210, 86, C.cream, { radius: 8, seed: 61 + i });
      P.text(ctx, j.name, j.x, 1330, { size: 34, font: 'bubble', color: j.col, shadow: false });
      P.text(ctx, j.role, j.x, 1364, { size: 24, font: 'marker', color: '#8a7f70', shadow: false });
    });
    // Hal's mug
    P.rect(ctx, 606, 1196, 64, 70, C.paper, { radius: 10, seed: 64 });
    ctx.save(); ctx.strokeStyle = C.paper; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(672, 1230, 18, -1.2, 1.2); ctx.stroke(); ctx.restore();
    P.text(ctx, '#1\nreviewer', 638, 1231, { size: 15, font: 'sans', color: C.red, shadow: false, lineHeight: 1 });
  }

  function ooh() {
    SFX.tone(260, 0.8, { type: 'triangle', slide: 200, vol: 0.1, attack: 0.1 });
    SFX.tone(330, 0.8, { type: 'triangle', slide: 250, vol: 0.08, attack: 0.1 });
    SFX.noise(0.7, { filter: 'bandpass', freq: 700, q: 1, vol: 0.08 });
  }

  ClaudeTok.register({
    author: '@code.critic',
    caption: 'rate my code 🥺 be brutal (not like that) #ratemycode #codereview #gitblame #tabsvsspaces #legacycode',
    sound: 'judges table (ragebait mix) · code.critic',
    avatar: '🧑‍⚖️',
    avatarColor: '#6B4E9B',
    duration: D,
    bg: '#2B1F45',
    likes: '3.8M', commentCount: '211K', saves: '402K', shares: '1.1M',
    thumb: 5.9,
    comments: [
      ['blame.bot', '0:08 the way hal\'s eyes went sideways the SECOND git blame loaded 💀', 128400],
      ['lint.larry', 'i stand by my 2/10. the tab was RIGHT NEXT to the spaces', 76100],
      ['data1_final', 'nobody asked where i went. nobody.', 61900],
      ['hal.principal', 'that was a different hal', 44300],
      ['nit.nancy', '1/10 and i was being generous. the magnifying glass was for my own safety', 31800],
      ['code.critic', 'hal asked us to blur his commits. we said no', 22700],
      ['refactor.agent', 'me when i see a 900 line function: "i\'ll just make a small change"', 9800],
      ['vintage.dev', '"10/10 (vintage)" is how every legacy codebase survives code review', 4100],
      ['tab.enjoyer', '→ ··', 612],
      ['todo.later', 'the TODO is from 2019 and it is still later', 88],
    ],

    bpm: 128,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= BLAME - 0.05 && t < HALZ) { if (step % 2 === 0) SFX.tick({ vol: 0.25 }); return; }
      if (t >= HALZ && t < REFLIP) return;
      if (t >= CLOSE) { SFX.snare({ vol: 0.06 + 0.1 * P.prog(t, CLOSE, 0.7) }); return; }
      const happy = t >= REFLIP;
      const bass = happy ? ['C3', 'C3', 'E3', 'G3', 'A3', 'G3', 'E3', 'D3'] : ['A2', 'A2', 'C3', 'A2', 'G2', 'G2', 'E2', 'G2'];
      if (step % 4 === 0) SFX.kick({ vol: 0.45 });
      if (step % 4 === 2) SFX.clap({ vol: 0.16 });
      SFX.hat({ vol: 0.04 });
      if (step % 2 === 0) SFX.bass(bass[(step / 2) % 8], 0.2, { vol: 0.24 });
      if (!happy && step % 16 === 14) SFX.tone('E4', 0.15, { type: 'sawtooth', vol: 0.05 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      /* ---------- sound ---------- */
      if (env.at(0)) { SFX.swoosh({ vol: 0.25 }); SFX.clap({ vol: 0.2 }); SFX.clap({ vol: 0.15, when: 0.15 }); }
      if (env.at(0.7)) SFX.pop({ vol: 0.15 });
      if (env.at(2.2)) SFX.pop({ f: 700, vol: 0.12 });
      if (env.at(3.8)) SFX.riser(1.4, { vol: 0.12 });
      if (env.at(5.3)) SFX.whoosh({ vol: 0.2 });
      FLIP.forEach((ft, i) => {
        if (env.at(ft - 0.5)) SFX.swoosh({ vol: 0.14 });
        if (env.at(ft)) {
          if (i < 2) { SFX.fail({ vol: 0.13 }); SFX.blip(220, { vol: 0.08 }); }
          else { SFX.drop({ vol: 0.22 }); SFX.error({ vol: 0.12 }); ooh(); }
        }
      });
      if (env.at(6.0)) SFX.tone(180, 0.6, { type: 'sawtooth', slide: 120, vol: 0.08 });
      if (env.at(BLAME)) { SFX.noise(0.25, { filter: 'bandpass', freq: 2400, slide: 300, q: 3, vol: 0.3 }); SFX.tone(900, 0.25, { type: 'sawtooth', slide: 120, vol: 0.1 }); }
      for (let k = 0; k < 9; k++) if (env.at(BLAME + 0.27 + k * 0.05)) SFX.type({ vol: 0.25 });
      for (let k = 0; k < 4; k++) if (env.at(BLAME + 0.8 + k * 0.15)) SFX.blip(500 + k * 120, { vol: 0.06 });
      if (env.at(HALZ)) {
        SFX.tone('E3', 0.22, { type: 'sawtooth', vol: 0.16 });
        SFX.tone('E3', 0.22, { type: 'sawtooth', vol: 0.16, when: 0.3 });
        SFX.tone('C3', 1.1, { type: 'sawtooth', vol: 0.16, when: 0.6 });
        SFX.tone(55, 1.2, { type: 'triangle', vol: 0.2, when: 0.6 });
      }
      if (env.at(REFLIP)) { SFX.success({ vol: 0.14 }); SFX.ding('C6', { vol: 0.12 }); }
      if (env.at(CLOSE)) SFX.whoosh({ vol: 0.22 });

      /* ---------- camera ---------- */
      const halZoom = ease.inOutCubic(prog(t, HALZ, 0.5)) * (1 - ease.inOutCubic(prog(t, 9.95, 0.35)));
      const shakeAmt = 16 * (1 - prog(t, FLIP[2], 0.5)) * (t >= FLIP[2] ? 1 : 0) + (t >= BLAME && t < BLAME + 0.25 ? 10 : 0);

      ctx.save();
      P.shake(ctx, t, shakeAmt);
      P.zoom(ctx, 1 + 0.5 * halZoom, JUDGES[2].x, 1080);

      // stage
      P.gradient(ctx, '#2B1F45', '#4A2F5E');
      ctx.save();
      ctx.globalAlpha = 0.14; ctx.fillStyle = '#FFF3C4';
      ctx.beginPath(); ctx.moveTo(470, 260); ctx.lineTo(610, 260); ctx.lineTo(1000, 1250); ctx.lineTo(80, 1250); ctx.closePath(); ctx.fill();
      ctx.restore();
      marquee(ctx, t);

      // snippet (trembles as it gets roasted)
      const nerves = t < FLIP[0] ? 0 : t < FLIP[2] ? 2.5 : t < 7.6 ? 5 : t < REFLIP ? 1 : 0;
      ctx.save();
      ctx.translate((P.hash(P.boil(t, 20)) - 0.5) * nerves * 2, 0);
      const bob = Math.sin(t * 2.4) * 6;
      ctx.translate(0, bob);
      snippet(ctx, t, env);
      const sweatAmt = t < FLIP[0] ? 0 : t < FLIP[1] ? 0.5 : t < FLIP[2] ? 0.9 : t < 7.6 ? 1.4 : t < REFLIP ? 0.3 : 0;
      sweat(ctx, t, WIN.x + 30, WIN.y + 90, sweatAmt, 3, 3);
      sweat(ctx, t, WIN.x + WIN.w - 30, WIN.y + 110, sweatAmt, 9, 3);
      ctx.restore();

      // sticky-note callouts
      const n1 = ease.outBack(prog(t, 0.75, 0.3)) * (1 - prog(t, 2.0, 0.15));
      const n2 = ease.outBack(prog(t, 2.25, 0.3)) * (1 - prog(t, 3.7, 0.15));
      const n3 = ease.outBack(prog(t, 3.9, 0.3)) * (1 - prog(t, 5.5, 0.15));
      stickyNote(ctx, 'TABS *AND*\nSPACES??', 780, 790, n1, 0.08, 71);
      stickyNote(ctx, 'data2_final\n(data1 where)', 780, 790, n2, -0.06, 72);
      const lineNo = t < 5.3 ? Math.max(1, Math.round(ease.inOutQuad(prog(t, 3.8, 1.5)) * 900)) : 900;
      stickyNote(ctx, 'ONE FUNCTION\nline ' + lineNo + '/900', 780, 790, n3, 0.05, 73);

      blameTerm(ctx, t);

      JUDGES.forEach((j, i) => judge(ctx, j, i, t));
      desk(ctx, t);

      // Hal's bubbles
      const b1 = ease.outBack(prog(t, 6.0, 0.25)) * (1 - prog(t, BLAME - 0.1, 0.1));
      if (b1 > 0) P.bubble(ctx, 'who WROTE this?!', 800, 872, 850, 1080, { size: 46, pop: b1, seed: 81 });

      // spotlight on Hal during the reveal
      const spot = ease.outCubic(prog(t, HALZ, 0.3)) * (1 - prog(t, REFLIP, 0.35));
      if (spot > 0) {
        ctx.save();
        ctx.globalAlpha = 0.55 * spot;
        ctx.fillStyle = '#120c1e';
        ctx.beginPath(); ctx.rect(-200, -200, 1480, 2320);
        ctx.ellipse(JUDGES[2].x, 1110, 230, 290, 0, 0, TAU, true);
        ctx.fill('evenodd');
        ctx.restore();
      }
      ctx.restore();

      // screen-space overlays
      if (t >= FLIP[2] && t < FLIP[2] + 0.4) P.flash(ctx, 0.5 * (1 - prog(t, FLIP[2], 0.4)), C.red);
      if (t >= HALZ && t < HALZ + 0.3) P.flash(ctx, 0.6 * (1 - prog(t, HALZ, 0.3)));
      const b2 = ease.outBack(prog(t, 8.65, 0.25)) * (1 - prog(t, REFLIP - 0.12, 0.1));
      if (b2 > 0) P.bubble(ctx, 'that was a\ndifferent hal', 330, 1000, 680, 1160, { size: 46, pop: b2, seed: 82 });
      const tag = ease.outBack(prog(t, HALZ + 0.1, 0.3)) * (1 - prog(t, 9.9, 0.2));
      if (tag > 0) P.title(ctx, 'IT WAS HAL', 540, 470, { size: 120, color: C.red, stroke: '#fff', pop: tag, rot: -0.06 });

      /* ---------- caption sticker ---------- */
      if (t < FLIP[2]) P.sticker(ctx, 'rate my code. be brutal', 70, 1510, { pop: ease.outBack(prog(t, 0.4, 0.4)) * (1 - prog(t, FLIP[2] - 0.1, 0.1)) });
      else if (t < HALZ) P.sticker(ctx, 'ok not THAT brutal', 70, 1510, { pop: ease.outBack(prog(t, FLIP[2] + 0.1, 0.35)) * (1 - prog(t, HALZ - 0.1, 0.1)) });
      else P.sticker(ctx, 'the call is coming from inside the repo', 70, 1510, { pop: ease.outBack(prog(t, HALZ + 0.3, 0.35)), size: 46 });

      /* ---------- curtains (closed at the loop seam) ---------- */
      const closed = t < 0.65 ? 1 - ease.inOutCubic(prog(t, 0, 0.65)) : ease.inOutCubic(prog(t, CLOSE, D - CLOSE));
      curtains(ctx, closed, t);
    },
  });
})();
