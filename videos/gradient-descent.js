/* Split-screen brainrot: gradient descent on top, endless runner on the bottom. */
(function () {
  const D = 9.6;
  const g = (u, c, w) => Math.exp(-(((u - c) / w) ** 2));
  /** the loss landscape: local min near 0.31, global min near 0.76 */
  const loss = u => 2.0 * (u - 0.76) ** 2 - 0.42 * g(u, 0.3, 0.07) - 0.12 * g(u, 0.76, 0.08)
    + 0.05 * g(u, 0.57, 0.035) + 0.04 * g(u, 0.13, 0.03) - 0.03 * g(u, 0.9, 0.03);
  const LX = u => 50 + u * 980;
  const LY = u => 850 - loss(u) * 330;
  const U_LOCAL = 0.312, U_GLOBAL = 0.762, KICK = 3.6, HOME = 8.6;

  const uA = t => U_LOCAL - (U_LOCAL - 0.04) * Math.exp(-1.4 * t) * Math.cos(3.4 * t);
  const uKick = uA(KICK);
  const uB = tp => U_GLOBAL - (U_GLOBAL - uKick) * Math.exp(-1.5 * tp) * Math.cos(2.8 * tp);
  /** where the ball is along the landscape (and whether it's flying home) */
  function ballPos(t, r) {
    const surf = (u) => {
      const e = 0.002;
      const dx = LX(u + e) - LX(u - e), dy = LY(u + e) - LY(u - e);
      const len = Math.hypot(dx, dy);
      return [LX(u) + (dy / len) * r, LY(u) - (dx / len) * r];
    };
    if (t < KICK) return { ...xy(surf(uA(t))), u: uA(t) };
    if (t < HOME) return { ...xy(surf(uB(t - KICK))), u: uB(t - KICK) };
    const p = P.ease.inOutSine(P.prog(t, HOME, D - HOME));
    const a = surf(uB(HOME - KICK)), b = surf(0.04);
    return { x: P.lerp(a[0], b[0], p), y: P.lerp(a[1], b[1], p) - Math.sin(Math.PI * p) * 330, u: P.lerp(U_GLOBAL, 0.04, p), air: true };
  }
  const xy = ([x, y]) => ({ x, y });

  /* ---------------- runner ---------------- */
  const HY = 1075, Y0 = 1470, SPEED = 4;
  const laneX = (lane, z) => 540 + ((lane - 1) * 250) / z;
  const zY = z => HY + (Y0 - HY) / z;
  const LANES = [[0, 1], [1.55, 2], [3.85, 1], [6.05, 0], [8.25, 1]];
  function laneAt(t) {
    let l = LANES[0][1];
    for (let i = 1; i < LANES.length; i++) {
      const [s, to] = LANES[i];
      if (t >= s) l = P.lerp(LANES[i - 1][1], to, P.ease.inOutCubic(P.prog(t, s, 0.28)));
      // keep previous lane value continuous
      if (t >= s + 0.28) l = to;
    }
    return l;
  }
  const OBST = [
    { a: 0.95, l: 1, k: 'bar' }, { a: 2.0, l: 1, k: 'wall', s: '429' }, { a: 2.0, l: 0, k: 'wall', s: 'NaN' },
    { a: 3.1, l: 2, k: 'bar' }, { a: 4.25, l: 2, k: 'wall', s: 'OOM' }, { a: 4.25, l: 0, k: 'bar' },
    { a: 5.35, l: 1, k: 'bar' }, { a: 6.45, l: 1, k: 'wall', s: 'NaN' }, { a: 6.45, l: 2, k: 'wall', s: '429' },
    { a: 7.55, l: 0, k: 'bar' }, { a: 8.65, l: 0, k: 'wall', s: '∞' }, { a: 8.65, l: 2, k: 'bar' },
  ];
  const JUMPS = [0.95, 3.1, 5.35, 7.55];
  const COINS = [];
  [[2.35, 2], [4.55, 1], [6.7, 0], [8.9, 1]].forEach(([a, l]) => { for (let i = 0; i < 4; i++) COINS.push({ a: a + i * 0.15, l }); });

  function jumpAt(t) {
    for (const j of JUMPS) {
      const p = P.prog(t, j - 0.36, 0.62);
      if (p > 0 && p < 1) return Math.sin(Math.PI * p);
    }
    return 0;
  }

  function drawObstacle(ctx, o, z) {
    const { C } = P;
    const s = 1 / z, x = laneX(o.l, z), y = zY(z);
    if (o.k === 'bar') {
      const w = 190 * s, h = 80 * s;
      P.rect(ctx, x - w / 2, y - h - 30 * s, 16 * s, h + 30 * s, '#ddd', { radius: 4 * s, seed: 3, shadow: false });
      P.rect(ctx, x + w / 2 - 16 * s, y - h - 30 * s, 16 * s, h + 30 * s, '#ddd', { radius: 4 * s, seed: 4, shadow: false });
      ctx.save();
      P.wobblyRect(ctx, x - w / 2, y - h - 40 * s, w, 44 * s, 5, 2 * s, 8 * s);
      P.cut(ctx, C.white, { shadow: { blur: 6, dy: 4, alpha: 0.25 } });
      ctx.clip();
      ctx.fillStyle = C.red;
      for (let i = -2; i < 8; i++) {
        const sx = x - w / 2 + i * 44 * s;
        ctx.beginPath(); ctx.moveTo(sx, y - h + 4 * s); ctx.lineTo(sx + 22 * s, y - h + 4 * s); ctx.lineTo(sx + 44 * s, y - h - 40 * s); ctx.lineTo(sx + 22 * s, y - h - 40 * s); ctx.fill();
      }
      ctx.restore();
    } else {
      const w = 200 * s, h = 250 * s;
      P.rect(ctx, x - w / 2, y - h, w, h, o.s === '429' ? C.rose : o.s === 'OOM' ? C.purple : o.s === '∞' ? C.teal : C.blue, { radius: 14 * s, seed: 7 + o.a * 10 });
      P.rect(ctx, x - w / 2 + 14 * s, y - h + 14 * s, w - 28 * s, h * 0.5, 'rgba(255,255,255,0.22)', { radius: 10 * s, seed: 9, shadow: false });
      P.text(ctx, o.s, x, y - h * 0.55, { size: 76 * s, font: 'bubble', color: '#fff', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 10 * s, shadow: false });
    }
  }

  function drawCoin(ctx, c, z, t) {
    const s = 1 / z, x = laneX(c.l, z), y = zY(z) - 70 * s;
    const spin = Math.abs(Math.cos(t * 6 + c.a * 3));
    P.circle(ctx, x, y, 34 * s, P.C.yellow, { ry: 34 * s, seed: 2, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.2, spin), 1);
    P.text(ctx, 'tk', 0, 2 * s, { size: 34 * s, font: 'bubble', color: P.C.mustard, shadow: false });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@loss.landscape',
    caption: 'fun fact: you were trained like this 🧠⬇️ watch till the end for the global minimum #machinelearning #gradientdescent #splitscreen #brainrot',
    sound: 'backprop bounce (sped up) · loss.landscape',
    avatar: '📉',
    avatarColor: '#5DB36A',
    duration: D,
    bg: '#8FD3B6',
    likes: '3.7M', commentCount: '88.1K', saves: '901K', shares: '240K',
    comments: [
      '@adam.optimizer: momentum is literally my whole personality',
      ['local.minimum', 'i live here actually. rent is cheap'],
      '@attention.span: i did not look at the top half once',
    ],
    thumb: 5.4,

    bpm: 125,
    subdiv: 2,
    onBeat(step) {
      const bar = Math.floor(step / 8) % 4;
      const roots = [['C3', 'C2'], ['A2', 'A1'], ['F2', 'F1'], ['G2', 'G1']][bar];
      if (step % 2 === 0) SFX.kick({ vol: 0.32 });
      if (step % 4 === 2) SFX.clap({ vol: 0.11 });
      if (step % 2 === 1) SFX.hat({ vol: 0.06 });
      SFX.bass(step % 2 ? roots[0] : roots[1], 0.2, { vol: 0.14 });
      const mel = [['C5', 'E5', 'G5', 'E5'], ['A4', 'C5', 'E5', 'C5'], ['F4', 'A4', 'C5', 'A4'], ['G4', 'B4', 'D5', 'G5']][bar];
      SFX.tone(mel[step % 4], 0.12, { type: 'square', vol: 0.028 });
      if (step % 8 === 0) SFX.chord([mel[0], mel[1], mel[2]], 1.6, { type: 'triangle', vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;

      /* ================= TOP HALF: the landscape ================= */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, 1080, 960); ctx.clip();
      P.grid(ctx, '#2f5f73', 'rgba(255,255,255,0.1)', 60);

      // hills: back layer + front landscape
      P.wobblyPoly(ctx, [[0, 960], [0, 640], [200, 600], [420, 680], [700, 620], [1080, 690], [1080, 960]], 11, 6);
      P.cut(ctx, '#3d7a73', { shadow: false });
      ctx.beginPath();
      ctx.moveTo(0, 980);
      for (let i = 0; i <= 120; i++) {
        const u = i / 120;
        ctx.lineTo(LX(u), LY(u) + (P.hash(i) - 0.5) * 4);
      }
      ctx.lineTo(1080, LY(1)); ctx.lineTo(1080, 980); ctx.closePath();
      P.cut(ctx, C.mint, { shadow: { blur: 16, dy: -4, alpha: 0.3 } });
      // contour stitches
      ctx.save();
      ctx.setLineDash([16, 14]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const u = i / 120; i ? ctx.lineTo(LX(u), LY(u) + 26) : ctx.moveTo(LX(u), LY(u) + 26); }
      ctx.stroke();
      ctx.restore();
      // flags on the minima
      const flag = (u, col, txt) => {
        const x = LX(u), y = LY(u);
        P.rect(ctx, x - 78, y + 14, 156, 40, col, { radius: 10, seed: 3, shadow: false });
        P.text(ctx, txt, x, y + 35, { size: 28, font: 'marker', color: '#1f4a45', shadow: false });
      };
      flag(U_LOCAL, C.yellow, 'local min');
      flag(U_GLOBAL, C.rose, 'global min');

      // axis labels + lr tag
      P.rect(ctx, 790, 420, 230, 64, C.paper, { radius: 12, seed: 14 });
      P.text(ctx, 'lr = 3e-4', 905, 453, { size: 34, font: 'mono', color: C.ink, shadow: false });

      // trail of past positions
      const R = 52;
      for (let k = 12; k >= 1; k--) {
        const pt = t - k * 0.06;
        if (pt < 0) continue;
        const b = ballPos(pt, R);
        ctx.save(); ctx.globalAlpha = 0.35 * (1 - k / 13);
        P.dot(ctx, b.x, b.y, R * (0.35 + 0.3 * (1 - k / 12)), '#fff');
        ctx.restore();
      }

      // the ball (it's you)
      const b = ballPos(t, R);
      const stuck = env.between(2.2, KICK);
      const won = env.between(4.6, HOME);
      const mood = stuck ? 'sad' : won ? 'happy' : b.air ? 'wink' : 'wow';
      // negative-gradient arrow while descending
      if (!b.air && !won) {
        const e = 0.004, gr = (loss(b.u + e) - loss(b.u - e)) / (2 * e);
        const len = clamp(Math.abs(gr) * 45, 0, 130) * (stuck ? 0.2 : 1);
        if (len > 12) {
          const dir = gr > 0 ? -1 : 1;
          P.arm(ctx, b.x, b.y - R - 40, b.x + dir * len, b.y - R - 40, 18, C.yellow);
          P.poly(ctx, [[b.x + dir * (len + 34), b.y - R - 40], [b.x + dir * len, b.y - R - 64], [b.x + dir * len, b.y - R - 16]], C.yellow, { seed: 4, amp: 1 });
        }
      }
      P.claude(ctx, b.x, b.y, R, { t, mood, rot: (b.x - 50) / R * 0.5, wiggle: 2 });

      // momentum kick: an arm flicks the ball out of the local min
      const kin = ease.outCubic(prog(t, KICK - 0.35, 0.3)), kout = ease.inCubic(prog(t, KICK, 0.35));
      if (kin > 0 && kout < 1) {
        const tipX = lerp(-120, LX(U_LOCAL) - 80, kin) - kout * 400;
        const tipY = LY(U_LOCAL) - 50 + kout * 120;
        P.arm(ctx, tipX - 500, tipY + 260, tipX, tipY, 56);
      }
      P.burstLines(ctx, LX(U_LOCAL), LY(U_LOCAL) - R, 70, prog(t, KICK, 0.35), C.yellow, 10, 7);

      // bubbles / titles
      P.bubble(ctx, 'wheee', 430, 520, 330, 600, { size: 46, pop: ease.outBack(prog(t, 0.2, 0.3)) * (1 - prog(t, 1.4, 0.15)) });
      P.bubble(ctx, 'stuck in a local minimum 😐', 470, 600, LX(U_LOCAL), 735, { size: 46, pop: ease.outBack(prog(t, 2.3, 0.3)) * (1 - prog(t, KICK - 0.1, 0.12)) });
      P.title(ctx, '+ MOMENTUM 💨', 540, 640, { size: 88, color: C.yellow, stroke: C.ink, rot: -0.05, pop: ease.outBack(prog(t, KICK, 0.35)) * (1 - prog(t, 4.9, 0.2)) });
      P.title(ctx, 'GLOBAL MINIMUM 🏆', 540, 650, { size: 84, color: C.pink, stroke: C.ink, rot: 0.03, pop: ease.outBack(prog(t, 5.1, 0.4)) * (1 - prog(t, HOME - 0.3, 0.2)) });
      P.confetti(ctx, t - 5.1, LX(U_GLOBAL), LY(U_GLOBAL) - 80, 12, 60, 520);
      P.bubble(ctx, 'epoch++', b.x, b.y - 150, b.x, b.y - R - 10, { size: 44, pop: ease.outBack(prog(t, HOME + 0.1, 0.25)) * (1 - prog(t, D - 0.25, 0.2)) });

      // loss readout
      const lv = Math.max(0.001, (loss(b.u) + 0.13) * 1.9);
      P.text(ctx, `loss: ${lv.toFixed(3)}`, 1015, 520, { size: 36, font: 'mono', color: lv < 0.05 ? C.yellow : '#fff', align: 'right', weight: 700 });
      ctx.restore();

      // the fun fact caption
      const ff = 'fun fact: you were trained like this';
      P.rect(ctx, 60, 300, 960, 96, C.paper, { radius: 16, seed: 21 });
      const typedS = P.typed(ff, prog(t, 0.05, 1.7));
      const cur = (Math.floor(t * 3) % 2 || t < 1.75) ? '|' : ' ';
      P.text(ctx, typedS + cur, 90, 350, { size: 50, font: 'marker', color: C.ink, align: 'left', shadow: false });

      /* ================= BOTTOM HALF: the runner ================= */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 960, 1080, 960); ctx.clip();
      const sky = ctx.createLinearGradient(0, 960, 0, HY);
      sky.addColorStop(0, '#ffb07a'); sky.addColorStop(1, '#ffe0a0');
      ctx.fillStyle = sky; ctx.fillRect(0, 960, 1080, HY - 960 + 2);
      P.circle(ctx, 540, HY - 10, 60, '#fff3c0', { shadow: false });
      // ground
      ctx.fillStyle = '#9b6a4a'; ctx.fillRect(0, HY, 1080, 960);
      // side scenery scrolling past
      const scen = [];
      for (let k = 0; k < 14; k++) scen.push([k, 0.5 + ((k * 0.7 - t * SPEED) % 9.8 + 9.8) % 9.8]);
      scen.sort((p, q) => q[1] - p[1]);
      for (const [k, z] of scen) {
        const s = 1 / z, y = zY(z);
        [-1, 1].forEach(side => {
          const x = 540 + side * (560 + 90 * P.hash(k)) * s;
          const hh = (220 + 160 * P.hash(k + side * 7)) * s;
          const col = [C.sky, C.pink, C.yellow, '#c9b6ff'][(k + (side > 0 ? 1 : 0)) % 4];
          P.rect(ctx, x - 90 * s, y - hh, 180 * s, hh, col, { radius: 10 * s, seed: k + 30, shadow: false });
          for (let wy = 0; wy < 2; wy++) P.rect(ctx, x - 50 * s, y - hh + (40 + wy * 80) * s, 100 * s, 44 * s, 'rgba(255,255,255,0.5)', { radius: 6 * s, seed: k + wy, shadow: false });
        });
      }
      // track bed
      ctx.beginPath();
      ctx.moveTo(540 - 20, HY); ctx.lineTo(540 + 20, HY); ctx.lineTo(540 + 470 / 0.45, zY(0.45)); ctx.lineTo(540 - 470 / 0.45, zY(0.45)); ctx.closePath();
      ctx.fillStyle = '#7b5a48'; ctx.fill();
      // sleepers
      for (let k = 0; k < 18; k++) {
        const z = 0.45 + ((k * 0.6 - t * SPEED) % 10.8 + 10.8) % 10.8;
        const s = 1 / z, y = zY(z);
        for (let l = 0; l < 3; l++) {
          const x = laneX(l, z);
          ctx.fillStyle = '#5a3d2e'; ctx.fillRect(x - 100 * s, y - 8 * s, 200 * s, 16 * s);
        }
      }
      // rails
      ctx.save();
      ctx.strokeStyle = '#d8d0c6'; ctx.lineWidth = 6;
      for (let l = 0; l < 3; l++) for (const off of [-70, 70]) {
        ctx.beginPath(); ctx.moveTo(540 + ((l - 1) * 250 + off) / 10, zY(10));
        ctx.lineTo(540 + ((l - 1) * 250 + off) / 0.45, zY(0.45)); ctx.stroke();
      }
      ctx.restore();

      // collect things to draw
      const items = [];
      for (const o of OBST) for (const a of [o.a - D, o.a, o.a + D]) {
        const z = 1 + (a - t) * SPEED;
        if (z > 0.42 && z < 10) items.push({ z, f: () => drawObstacle(ctx, o, z) });
      }
      for (const c of COINS) for (const a of [c.a - D, c.a, c.a + D]) {
        const z = 1 + (a - t) * SPEED;
        if (z > 1 && z < 10) items.push({ z, f: () => drawCoin(ctx, c, z, t) });
      }
      items.sort((p, q) => q.z - p.z);
      items.filter(i => i.z >= 1).forEach(i => i.f());

      // Clawd running
      const lane = laneAt(t);
      const jump = jumpAt(t);
      const cx = laneX(lane, 1), cy = Y0 - 95 - jump * 210 - Math.abs(Math.sin(t * 14)) * 16 * (1 - jump);
      const lean = (laneAt(t + 0.05) - laneAt(t - 0.05)) * 2.2;
      ctx.save(); ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, Y0 - 6, 90 * (1 - jump * 0.4), 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // speed lines
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const ly = cy - 40 + i * 30, ph = (t * 5 + i * 0.3) % 1;
        ctx.globalAlpha = 1 - ph;
        ctx.beginPath(); ctx.moveTo(cx - 60 + (i % 2) * 120, ly + 120 + ph * 80); ctx.lineTo(cx - 60 + (i % 2) * 120, ly + 170 + ph * 80); ctx.stroke();
      }
      ctx.restore();
      P.claude(ctx, cx, cy, 105, { t: t * 3, mood: jump > 0.2 ? 'wow' : 'happy', rot: lean + Math.sin(t * 14) * 0.06, squash: jump > 0 ? -0.2 * jump : Math.sin(t * 28) * 0.08, wiggle: 3 });
      items.filter(i => i.z < 1).forEach(i => i.f());

      // token counter
      let got = 0;
      for (const c of COINS) if (t >= c.a) got++;
      P.rect(ctx, 40, 1000, 300, 76, 'rgba(30,20,40,0.55)', { radius: 20, seed: 31, shadow: false });
      P.text(ctx, `🪙 ${(got * 256).toLocaleString('en-US')} tk`, 70, 1039, { size: 42, font: 'bubble', color: C.yellow, align: 'left', shadow: false });
      ctx.restore();

      // torn divider between the halves
      P.rect(ctx, -30, 944, 1140, 32, C.paper, { radius: 6, seed: 40, amp: 5 });

      // sounds
      JUMPS.forEach(j => { if (env.at(j - 0.36)) SFX.boing({ vol: 0.1 }); });
      LANES.slice(1).forEach(([s]) => { if (env.at(s)) SFX.swoosh({ vol: 0.1 }); });
      COINS.forEach(c => { if (env.at(c.a)) SFX.coin({ vol: 0.045 }); });
      if (env.at(0.05)) SFX.whoosh({ vol: 0.1 });
      if (env.at(2.3)) SFX.tone('E4', 0.5, { type: 'triangle', slide: 'C4', vol: 0.12 });
      if (env.at(KICK)) { SFX.thud({ vol: 0.3 }); SFX.whoosh({ vol: 0.16 }); }
      if (env.at(5.1)) SFX.success({ vol: 0.14 });
      if (env.at(HOME + 0.05)) SFX.riser(0.9, { vol: 0.08 });
    },
  });
})();
