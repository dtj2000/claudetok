/* "wait for it…" Clawd plays Jenga with the dependency tree. Blocks come out one
 * at a time, the countdown gets Zeno'd, there's a fake ending, and then he pulls
 * left-pad. The tower, the skyline and the internet all go down. nobody: / npm: */
(function () {
  'use strict';
  const D = 12, TAU = Math.PI * 2;
  const C = P.C;
  const BW = 130, BH = 62, GAP = 4;
  const TX = 500, FLOOR = 1360;
  const COLLAPSE = 8.3, MEME = 9.9, REWIND = 11.6;
  const slotX = s => TX + s * (BW + GAP);
  const rowY = r => FLOOR - BH / 2 - r * BH;
  const PIVOT = [slotX(1) + 30, FLOOR - BH];

  const NAMES = ['react', 'lodash', 'express', 'webpack', 'babel', 'axios', 'chalk', 'core-js', 'eslint',
    'typescript', 'jest', 'vite', 'moment', 'rxjs', 'uuid', 'debug', 'semver', 'minimist', 'glob', 'yargs',
    'commander', 'dotenv', 'colors', 'request', 'async', 'bluebird', 'jquery', 'mkdirp', 'rimraf', 'ws', 'qs', 'ms', 'tslib'];
  const WOODS = ['#E7C38F', '#DDB47B', '#EBCB9C', '#D9A96D', '#E2BC86'];

  const BLOCKS = [];
  let k = 0;
  for (let r = 1; r <= 11; r++) for (let s = -1; s <= 1; s++) {
    BLOCKS.push({ id: NAMES[k], r, s, x: slotX(s), y: rowY(r), w: BW, color: WOODS[(k * 7) % 5], i: k });
    k++;
  }
  BLOCKS.push({ id: 'is-odd', r: 0, s: -1, x: slotX(-1), y: rowY(0), w: BW, color: '#F2B8C6', i: 40 });
  BLOCKS.push({ id: 'is-even', r: 0, s: 0, x: slotX(0), y: rowY(0), w: BW, color: '#8FD3B6', i: 41 });
  BLOCKS.push({ id: 'left-pad', r: 0, s: 1, x: slotX(1) + 30, y: rowY(0), w: 50, color: C.paper, i: 42 });
  const byId = id => BLOCKS.find(b => b.id === id);

  // pulls: which block, when it slides, where it ends up
  const PULLS = [
    { id: 'moment', a: 0.3, b: 1.5, amp: 0.02, pile: [170, FLOOR - BH / 2, 0.05] },
    { id: 'is-odd', a: 1.95, b: 3.0, amp: 0.05, pile: [185, FLOOR - BH * 1.5, -0.08] },
    { id: 'is-even', a: 3.4, b: 4.4, amp: 0.075, pile: [160, FLOOR - BH * 2.5, 0.1] },
    { id: 'left-pad', a: 7.85, b: 8.0, amp: 0, pile: null },
  ];
  PULLS.forEach(p => { byId(p.id).pull = p; });
  const TOP = BLOCKS.find(b => b.r === 11 && b.s === 1);   // the fake-out block that almost slides off

  const COUNT = [[0, '5'], [0.8, '4'], [1.6, '3'], [2.4, '2'], [3.2, '1'], [3.7, '0.5'], [4.1, '0.25'], [4.45, '0.125'],
    [5.0, '🙂'], [6.0, '3'], [6.6, '2'], [7.2, '1'], [7.85, '0'], [COLLAPSE, '💥']];

  const CITY = [
    { x: 40, w: 120, h: 380, label: 'banks', col: '#9FB7D9' },
    { x: 170, w: 110, h: 290, label: 'CI/CD', col: '#C9B6FF' },
    { x: 290, w: 150, h: 470, label: 'the cloud', col: '#B8D8E8' },
    { x: 450, w: 120, h: 330, label: 'your startup', col: '#F2C8A8' },
    { x: 580, w: 140, h: 430, label: 'npm', col: '#E08A8A' },
    { x: 730, w: 110, h: 280, label: 'fintech', col: '#A8D8B9' },
    { x: 850, w: 170, h: 500, label: 'big tech', col: '#AFA4C9' },
  ];
  const ERRORS = ["npm ERR! 404 'left-pad'", "Cannot find module 'left-pad'", 'BUILD FAILED', '503 Service Unavailable',
    'the internet is down', 'is it DNS? (no)', 'CI: 4,812 jobs failed', "TypeError: pad is not a function"];

  /* ---------------- tower physics (all pure functions of scene time) ---------------- */
  function theta(st) {
    let th = 0;
    PULLS.forEach(p => { if (p.amp && st > p.b) th += p.amp * Math.exp(-(st - p.b) * 2.4) * Math.sin((st - p.b) * 9); });
    th += -0.075 * P.ease.outCubic(P.prog(st, 4.4, 0.35)) + 0.05 * P.ease.inOutCubic(P.prog(st, 4.8, 0.5));
    if (PULLS.some(p => st > p.a && st < p.b)) th += Math.sin(st * 45) * 0.004;
    if (st > 6.9 && st < 7.85) th += Math.sin(st * 60) * 0.002 * P.prog(st, 6.9, 0.9);
    return th;
  }
  const rot = (x, y, th) => {
    const dx = x - PIVOT[0], dy = y - PIVOT[1], c = Math.cos(th), s = Math.sin(th);
    return [PIVOT[0] + dx * c - dy * s, PIVOT[1] + dx * s + dy * c];
  };
  function pullDX(b, st) {
    const p = b.pull;
    if (!p || st < p.a) return 0;
    const q = P.prog(st, p.a, p.b - p.a);
    if (b.id === 'left-pad') return -330 * P.ease.inQuad(q);
    const stutter = P.clamp(q + 0.05 * Math.sin(q * TAU * 3) * (1 - q));
    return -(BW + 60) * stutter;
  }
  /** world transform of block b at scene time st: [x, y, rot] or null */
  function blockPos(b, st) {
    const p = b.pull;
    const thC = theta(COLLAPSE);
    if (p && st >= p.b) {
      if (!p.pile) {                                        // left-pad: lifted up to Clawd
        const e = P.ease.outBack(P.prog(st, p.b, 0.4));
        const x0 = b.x - 330;
        return [P.lerp(x0, 250, e), P.lerp(b.y, 690, e), -0.3 * e];
      }
      const q = P.prog(st, p.b, 0.3);
      const th = theta(p.b);
      const [sx, sy] = b.r ? rot(b.x + pullDX(b, p.b), b.y, th) : [b.x + pullDX(b, p.b), b.y];
      return [P.lerp(sx, p.pile[0], q), P.lerp(sy, p.pile[1], P.ease.outBounce(q)) - Math.sin(q * Math.PI) * 120, p.pile[2] * q];
    }
    let x = b.x + pullDX(b, st), y = b.y;
    if (b === TOP) x += 38 * P.ease.outCubic(P.prog(st, 3.05, 0.3)) + 6 * P.ease.outCubic(P.prog(st, 4.45, 0.2));
    if (b.r === 0) return [x, y, 0];
    if (st < COLLAPSE) { const th = theta(st); const [wx, wy] = rot(x, y, th); return [wx, wy, th]; }
    // collapse: everything falls
    const [x0, y0] = rot(x, y, thC);
    const dt = Math.max(0, st - COLLAPSE - P.hash(b.i * 3.7) * 0.08 - (11 - b.r) * 0.012);
    const vx = (x0 - TX) * 1.3 + (P.hash(b.i * 5.1) - 0.5) * 520;
    const spin = (P.hash(b.i * 9.3) - 0.5) * 9;
    const level = Math.floor(P.hash(b.i * 2.3) * 3.2 * Math.exp(-Math.pow((x0 - TX) / 260, 2)));
    const restY = FLOOR - BH / 2 - level * BH * 0.8;
    const g = 3400, tl = Math.sqrt(Math.max(0, 2 * (restY - y0) / g));
    const tt = Math.min(dt, tl);
    return [x0 + vx * tt, Math.min(restY, y0 + 0.5 * g * tt * tt), thC + spin * tt];
  }

  function drawBlock(ctx, b, x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r);
    P.rect(ctx, -b.w / 2, -BH / 2 + 2, b.w, BH - 4, b.color, { radius: 6, seed: b.i + 5, amp: 1.5, shadow: { blur: 6, dy: 4, alpha: 0.25 } });
    ctx.save(); ctx.strokeStyle = 'rgba(120,80,40,0.18)'; ctx.lineWidth = 2;   // wood grain
    for (let g = 0; g < 3; g++) { ctx.beginPath(); ctx.moveTo(-b.w / 2 + 8, -14 + g * 14); ctx.lineTo(b.w / 2 - 8, -12 + g * 14 + Math.sin(b.i + g) * 3); ctx.stroke(); }
    ctx.restore();
    if (b.id === 'left-pad') {
      P.text(ctx, 'left-pad', 0, 0, { size: 15, font: 'mono', color: C.ink, shadow: false, rot: -Math.PI / 2 });
    } else {
      P.text(ctx, b.id, 0, 2, { size: 20, font: 'mono', color: '#4a3526', shadow: false, maxWidth: b.w - 10 });
    }
    ctx.restore();
  }

  function armTip(st) {
    const rest = [240, 700];
    const grab = (id, s2) => {
      const b = byId(id);
      const [x, y] = b.r ? rot(b.x + pullDX(b, s2), b.y, theta(s2)) : [b.x + pullDX(b, s2), b.y];
      return [x - b.w / 2 + 12, y];
    };
    const L = (a, bb, q) => [P.lerp(a[0], bb[0], q), P.lerp(a[1], bb[1], q)];
    const io = P.ease.inOutCubic;
    if (st < 0.3) return L(rest, grab('moment', 0.3), io(P.prog(st, 0, 0.3)));
    for (let i = 0; i < 3; i++) {
      const p = PULLS[i], nx = PULLS[i + 1];
      if (st < p.b) return grab(p.id, st);
      if (st < p.b + 0.25) return blockPos(byId(p.id), st).slice(0, 2).map((v, j) => v - (j ? 0 : 50));
      if (i < 2 && st < nx.a) return L(blockPos(byId(p.id), p.b + 0.25).slice(0, 2), grab(nx.id, nx.a), io(P.prog(st, p.b + 0.25, nx.a - p.b - 0.25)));
    }
    if (st < 5.0) return L(blockPos(byId('is-even'), 4.65).slice(0, 2), rest, io(P.prog(st, 4.65, 0.35)));
    if (st < 6.0) return [rest[0] - 20, rest[1] + Math.sin(st * 6) * 10];
    const lp = grab('left-pad', 7.0);
    if (st < 7.0) {                          // the sneak: creep, stop, creep
      const q = P.prog(st, 6.0, 1.0), stepped = (Math.floor(q * 4) + io((q * 4) % 1)) / 4;
      return L(rest, lp, Math.min(1, stepped));
    }
    if (st < 7.85) return [lp[0] + Math.sin(st * 30) * 3 * P.prog(st, 7.0, 0.8), lp[1]];
    if (st < 8.0) return grab('left-pad', st);
    const [x, y] = blockPos(byId('left-pad'), st);
    return [x - 20, y + 10];
  }

  /* ---------------- the scene, as a pure function of scene time ---------------- */
  function scene(ctx, st, t) {
    const { ease, prog } = P;
    P.gradient(ctx, '#BFE3F2', '#F6EEDD');
    P.cloud(ctx, 200, 420, 0.7); P.cloud(ctx, 640 + Math.sin(st * 0.5) * 20, 330, 0.55);

    // the internet (a globe) in the sky
    {
      const crack = prog(st, 9.3, 0.15), fall = Math.max(0, st - 9.55);
      const gx = 800 + fall * 120, gy = Math.min(FLOOR - 70, 470 + 0.5 * 3000 * fall * fall);
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(fall * 3);
      P.circle(ctx, 0, 0, 80, C.blue, { seed: 13 });
      P.poly(ctx, [[-50, -30], [-10, -50], [10, -20], [-20, 10], [-45, 0]], C.green, { seed: 14, shadow: false });
      P.poly(ctx, [[20, 10], [55, 0], [50, 40], [20, 50]], C.green, { seed: 15, shadow: false });
      if (crack > 0) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-10, -80); ctx.lineTo(5, -30 * crack); ctx.lineTo(-15, 10 * crack); ctx.lineTo(10, 80 * crack); ctx.stroke();
      }
      P.face(ctx, 0, 0, 44, st < 8.3 ? 'happy' : st < 9.3 ? 'wow' : 'dead', { blush: false, ink: '#fff' });
      ctx.restore();
      if (st < 9.55) {
        ctx.save(); ctx.strokeStyle = 'rgba(79,127,217,0.6)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        for (let w = 1; w <= 3; w++) { ctx.beginPath(); ctx.arc(gx, gy - 90, w * 22, -2.3, -0.84); ctx.stroke(); }
        ctx.restore();
      }
      P.text(ctx, 'the internet', gx, gy + 112, { size: 30, font: 'marker', color: C.ink, shadow: false, scale: st < 9.55 ? 1 : 0.0001 });
    }

    // skyline: topples like dominoes, outward from the tower
    CITY.forEach((c, i) => {
      const dir = c.x + c.w / 2 < TX ? -1 : 1;
      const delay = 8.75 + Math.abs(c.x + c.w / 2 - TX) / 900;
      const q = prog(st, delay, 0.55);
      const ang = dir * (Math.PI / 2 - 0.12) * ease.outBounce(q);
      ctx.save();
      ctx.translate(dir < 0 ? c.x : c.x + c.w, FLOOR); ctx.rotate(ang); ctx.translate(dir < 0 ? -c.x : -c.x - c.w, -FLOOR);
      P.rect(ctx, c.x, FLOOR - c.h, c.w, c.h, c.col, { radius: 6, seed: 30 + i });
      for (let wy = FLOOR - c.h + 60; wy < FLOOR - 40; wy += 52) for (let wx = c.x + 18; wx < c.x + c.w - 30; wx += 38) {
        ctx.fillStyle = P.hash(wx * 3 + wy + i) > (st > delay ? 0.85 : 0.35) ? '#FFE9A8' : 'rgba(43,34,51,0.25)';
        ctx.fillRect(wx, wy - 12, 20, 24);
      }
      P.rect(ctx, c.x + 8, FLOOR - c.h - 40, c.w - 16, 38, C.paper, { radius: 8, seed: 40 + i, amp: 2 });
      P.text(ctx, c.label, c.x + c.w / 2, FLOOR - c.h - 20, { size: 21, font: 'marker', color: C.ink, shadow: false, maxWidth: c.w - 24 });
      ctx.restore();
    });

    // floor
    P.rect(ctx, -20, FLOOR, 1120, 400, '#A8845F', { radius: 0, seed: 50 });
    ctx.save(); ctx.fillStyle = 'rgba(80,50,30,0.25)';
    for (let x = 40; x < 1080; x += 170) ctx.fillRect(x, FLOOR + 10, 6, 200);
    ctx.restore();

    // pulled pile + tower
    const lp = byId('left-pad');
    BLOCKS.forEach(b => { if (b !== lp) { const [x, y, r] = blockPos(b, st); drawBlock(ctx, b, x, y, r); } });

    // dust on the collapse
    if (st > COLLAPSE && st < 10.2) {
      const q = prog(st, COLLAPSE, 1.9);
      ctx.save(); ctx.globalAlpha = 0.75 * (1 - q);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI;
        P.circle(ctx, TX + Math.cos(a) * (120 + q * 380), FLOOR - Math.sin(a) * (30 + q * 120), 50 + q * 60, '#E8DCC8', { shadow: false, seed: i });
      }
      ctx.restore();
    }

    // annotation on the tiny block
    if (st > 6.6 && st < 7.95) {
      const pop = ease.outBack(prog(st, 6.6, 0.3));
      const [bx, by] = blockPos(lp, st);
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - 110, by - 150); ctx.quadraticCurveTo(bx - 40, by - 130, bx - 18, by - 42); ctx.stroke();
      ctx.restore();
      P.text(ctx, 'left-pad\n(11 lines of code)', bx - 190, by - 200, { size: 36, font: 'marker', color: C.red, stroke: C.white, strokeWidth: 8, scale: pop, rot: -0.06 });
    }

    // Clawd + his arm
    const tip = armTip(st);
    const cx = 130, cy = 640;
    P.arm(ctx, cx + 40, cy + 30, tip[0], tip[1], 46);
    { const [x, y, r] = blockPos(lp, st); drawBlock(ctx, lp, x, y, r); }        // left-pad sits in front of the arm
    let mood = 'sus';
    if (st >= 4.4 && st < 4.9) mood = 'wow';
    else if (st >= 4.9 && st < 6.0) mood = 'happy';
    else if (st >= 8.0 && st < COLLAPSE) mood = 'wow';
    else if (st >= COLLAPSE && st < MEME) mood = 'dead';
    else if (st >= MEME) mood = 'side';
    const wob = [1.5, 3.0].some(a => st > a && st < a + 0.4) ? 'wow' : mood;
    P.claude(ctx, cx, cy + Math.sin(st * 3) * 6, 92, { t: st, mood: wob, rot: 0.1 });
    // sweat while it's tense
    if ((st > 3.4 && st < 4.9) || (st > 6.3 && st < 8.3)) {
      const lt = (st * 1.6) % 1;
      ctx.save(); ctx.globalAlpha = 1 - lt;
      P.circle(ctx, cx + 70 + lt * 20, cy - 60 + lt * lt * 120, 12, C.sky, { shadow: false, amp: 1, ry: 16 });
      ctx.restore();
    }
    if (st > 5.1 && st < 5.95) P.bubble(ctx, 'see? stable 🙂', 330, 470, cx + 50, cy - 60, { size: 44, pop: ease.outBack(prog(st, 5.1, 0.25)) });
    if (st >= MEME + 0.3) P.text(ctx, '♪', cx + 100, cy - 100 - ((st * 60) % 30), { size: 54, font: 'bubble', color: C.purple, shadow: false });

    // error toasts
    if (st > 8.9) ERRORS.forEach((e, i) => {
      const at = 8.9 + i * 0.13;
      const pop = ease.outBack(prog(st, at, 0.2));
      if (pop <= 0) return;
      const x = 150 + P.hash(i * 4.4) * 620, y = 640 + P.hash(i * 7.7) * 640;
      const w = P.measure(ctx, e, { size: 26, font: 'mono' }) + 50;
      ctx.save(); ctx.translate(x + w / 2 > 1040 ? 1040 - w / 2 : Math.max(x, w / 2 + 30), y); ctx.rotate((P.hash(i) - 0.5) * 0.2); ctx.scale(pop, pop);
      P.rect(ctx, -w / 2, -30, w, 60, C.red, { radius: 14, seed: 70 + i });
      P.text(ctx, e, 0, 2, { size: 26, font: 'mono', color: C.white, shadow: false });
      ctx.restore();
    });
  }

  ClaudeTok.register({
    author: '@wait.for.it',
    caption: 'wait for it… (it’s worth it) 🧱 #waitforit #npm #leftpad #dependencies #jenga',
    sound: 'suspense.mp3 (the internet falling down) · wait.for.it',
    avatar: '🧱',
    avatarColor: '#E08A8A',
    duration: D,
    bg: '#BFE3F2',
    thumb: 9.4,
    likes: '6.6M', commentCount: '140K', saves: '1.2M', shares: '2.4M',
    comments: [
      ['node.modules', '0:05 "see? stable 🙂" the confidence of a man with 1,400 transitive dependencies', 212000],
      ['zeno.of.elea', 'the countdown going 1… 0.5… 0.25… is a war crime. respect', 131000],
      ['left-pad', 'i am 11 lines of code and i hold up the entire world. please stop pulling me', 88400],
      ['wait.for.it', 'part 2: someone deletes is-odd', 52000],
      ['ci.pipeline', '0:09 "CI: 4,812 jobs failed" is not a joke to me it is a memory', 24700],
      ['nitpick.agent', 'technically is-even depends on is-odd so he should have pulled them in the other order', 9100],
      ['the.cloud', 'why did i fall over i was not even touching it', 3600],
      ['lockfile.enjoyer', 'this is why we pin versions. anyway rewind it again', 1400],
      ['emoji.agent', '🧱🧱🧱💥🌐💀', 380],
      ['rubber.duck', 'me watching it NOT fall at 0:04 and closing the app. came back. glad i did', 72],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const tense = (t < 4.9) || (t >= 6.0 && t < 7.85);
      if (tense) {
        if (step % 2 === 0) {
          const f = t < 5 ? 55 * (1 + t / 12) : 55 * (1 + (t - 3) / 6);
          SFX.tone(f, 0.62, { type: 'sawtooth', vol: 0.035, attack: 0.08 });
          SFX.tone(f * 1.5, 0.62, { type: 'triangle', vol: 0.02, attack: 0.08 });
        }
        // heartbeat, faster as it gets worse
        const fast = t > 6.8 || (t > 3.4 && t < 4.9);
        if (fast || step % 4 === 0) { SFX.kick({ vol: 0.18 }); SFX.kick({ vol: 0.1, when: 0.12 }); }
        if (t > 6.5 && t < 7.85) SFX.tone(1200 + (t - 6.5) * 500, 0.24, { type: 'sine', vol: 0.012 });
      } else if (t >= MEME && t < REWIND) {
        // release: silly victory beat
        const BAS = ['C3', 'C3', 'G2', 'A2', 'F2', 'F2', 'G2', 'G2'];
        if (step % 2 === 0) SFX.kick({ vol: 0.4 });
        else SFX.snare({ vol: 0.16 });
        SFX.hat({ vol: 0.05 });
        SFX.bass(BAS[step % 8], 0.2, { vol: 0.2 });
        SFX.tone(['E5', 'G5', 'C6', 'G5'][step % 4], 0.12, { type: 'square', vol: 0.03 });
      }
    },

    draw(ctx, t, env) {
      const { ease, prog } = P;

      /* ---------- sound ---------- */
      PULLS.forEach((p, i) => {
        const n = Math.max(1, Math.round((p.b - p.a) / 0.16));
        for (let j = 0; j < n; j++) if (env.at(p.a + j * 0.16)) SFX.noise(0.1, { filter: 'bandpass', freq: 700 + j * 30, q: 3, vol: 0.08 });
        if (p.amp && env.at(p.b)) SFX.tone(130, 0.5, { type: 'sawtooth', slide: 85, vol: 0.05 });      // creak
        if (p.pile && env.at(p.b + 0.3)) SFX.thud({ vol: 0.25 });
      });
      COUNT.forEach(([a]) => { if (a > 0 && a < COLLAPSE && env.at(a)) SFX.tick({ vol: 0.35 }); });
      if (env.at(3.05)) SFX.tone(300, 0.3, { type: 'triangle', slide: 200, vol: 0.08 });              // top block slips
      if (env.at(4.4)) { SFX.tone(160, 0.8, { type: 'sawtooth', slide: 70, vol: 0.07 }); SFX.noise(0.4, { filter: 'bandpass', freq: 600, vol: 0.1 }); }
      if (env.at(5.0)) { SFX.chord(['C5', 'E5', 'G5', 'C6'], 0.8, { gap: 0.1, type: 'triangle', vol: 0.12 }); SFX.ding('C6', { vol: 0.08, when: 0.45 }); }
      if (env.at(6.0)) { SFX.noise(0.3, { filter: 'bandpass', freq: 2400, slide: 300, q: 2, vol: 0.2 }); SFX.tone(900, 0.25, { type: 'sawtooth', slide: 200, vol: 0.05 }); }
      if (env.at(7.85)) SFX.swoosh({ vol: 0.3 });
      if (env.at(8.05)) SFX.pop({ f: 900, vol: 0.1 });
      if (env.at(COLLAPSE)) { SFX.drop({ vol: 0.35 }); SFX.noise(1.6, { filter: 'lowpass', freq: 900, slide: 200, vol: 0.3 }); }
      for (let j = 0; j < 10; j++) if (env.at(COLLAPSE + 0.08 + j * 0.07)) SFX.thud({ vol: 0.18 + P.hash(j) * 0.12 });
      CITY.forEach((c) => {
        const at = 8.75 + Math.abs(c.x + c.w / 2 - TX) / 900 + 0.3;
        if (env.at(at)) { SFX.thud({ vol: 0.3 }); SFX.noise(0.4, { filter: 'lowpass', freq: 500, vol: 0.18 }); }
      });
      if (env.at(9.3)) SFX.noise(0.25, { filter: 'highpass', freq: 3000, vol: 0.2 });
      ERRORS.forEach((_, i) => { if (env.at(8.9 + i * 0.13)) i === 0 ? SFX.error({ vol: 0.12 }) : SFX.blip(300 + i * 60, { vol: 0.05 }); });
      if (env.at(MEME)) { SFX.success({ vol: 0.16 }); SFX.chime({ vol: 0.1 }); }
      if (env.at(REWIND)) { SFX.tone(180, 0.4, { type: 'sawtooth', slide: 1800, vol: 0.05 }); SFX.noise(0.4, { filter: 'bandpass', freq: 1500, slide: 5000, vol: 0.12 }); }

      /* ---------- scene time (rewinds at the end) ---------- */
      const rewinding = t >= REWIND;
      const st = rewinding ? P.lerp(MEME, 0, ease.inOutQuad(prog(t, REWIND, 0.4))) : t;

      ctx.save();
      // camera: slow push-in on left-pad, snap back, shake on the collapse
      const lp = byId('left-pad');
      let z = 1;
      if (st > 6.3 && st < 8.3) z = 1 + 0.45 * ease.inOutCubic(prog(st, 6.3, 1.5)) * (1 - ease.inCubic(prog(st, 8.05, 0.2)));
      P.zoom(ctx, z, lp.x, lp.y);
      if (st > COLLAPSE && !rewinding) P.shake(ctx, t, 26 * (1 - prog(st, COLLAPSE, 1.8)));
      if (rewinding) ctx.translate((P.hash(P.boil(t, 30)) - 0.5) * 16, 0);
      scene(ctx, st, t);
      ctx.restore();

      /* ---------- countdown ---------- */
      if (!rewinding && t < MEME) {
        let label = COUNT[0][1], at = 0;
        COUNT.forEach(([a, l]) => { if (t >= a) { label = l; at = a; } });
        const pop = 1 + 0.35 * (1 - ease.outCubic(prog(t, at, 0.25)));
        P.circle(ctx, 540, 400, 76, t >= 7.2 && t < COLLAPSE ? C.red : C.ink, { seed: 90 });
        P.text(ctx, label, 540, 404, { size: label.length > 3 ? 44 : label.length > 1 ? 56 : 84, font: 'bubble', color: C.white, shadow: false, scale: pop });
      }

      /* ---------- the false ending ---------- */
      if (t >= 4.95 && t < 6.25) {
        const up = ease.outBack(prog(t, 4.95, 0.35)), away = t >= 6.0 ? ease.inCubic(prog(t, 6.0, 0.25)) : 0;
        ctx.save(); ctx.translate(0, (1 - up) * 700 + away * 900); ctx.rotate(-0.03 + away * 0.3);
        P.rect(ctx, 140, 980, 720, 330, C.paper, { radius: 30, seed: 95 });
        P.text(ctx, 'THE END', 500, 1060, { size: 92, font: 'bubble', color: C.claude, shadow: false });
        P.text(ctx, 'thanks for watching ❤️', 500, 1160, { size: 46, font: 'hand', color: C.ink, shadow: false });
        P.rect(ctx, 330, 1210, 340, 64, C.rose, { radius: 32, seed: 96 });
        P.text(ctx, '+ follow for pt 2', 500, 1243, { size: 34, font: 'sans', color: C.white, shadow: false, weight: 800 });
        ctx.restore();
      }
      if (t >= 6.0 && t < 6.9) P.title(ctx, 'wait.', 540, 560, { size: 150, color: C.white, stroke: C.ink, pop: ease.outBack(prog(t, 6.0, 0.2)) * (1 - prog(t, 6.75, 0.15)), rot: -0.08 });
      if (t >= 7.85 && t < COLLAPSE) P.text(ctx, '. . .', 540, 560, { size: 90, font: 'bubble', color: C.ink, shadow: false });

      /* ---------- nobody: / npm: ---------- */
      if (t >= MEME) {
        const inP = ease.outBack(prog(t, MEME, 0.35)), out = ease.inCubic(prog(t, REWIND - 0.05, 0.2));
        ctx.save(); ctx.translate(0, -420 * (1 - inP) - 500 * out);
        P.rect(ctx, 40, 300, 1000, 330, C.white, { radius: 12, seed: 97, amp: 2 });
        P.text(ctx, 'nobody:', 90, 380, { size: 62, font: 'sans', color: C.black, align: 'left', shadow: false, weight: 800 });
        P.text(ctx, 'npm:', 90, 550, { size: 62, font: 'sans', color: C.black, align: 'left', shadow: false, weight: 800 });
        P.text(ctx, '(someone unpublished 11 lines)', 250, 552, { size: 34, font: 'hand', color: '#8a8494', align: 'left', shadow: false });
        ctx.restore();
      }

      /* ---------- VHS rewind ---------- */
      if (rewinding) {
        ctx.save();
        ctx.fillStyle = 'rgba(20,10,40,0.12)';
        for (let y = 0; y < 1920; y += 8) ctx.fillRect(0, y, 1080, 3);
        const band = (t * 3000) % 1920;
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, band, 1080, 40);
        ctx.restore();
        P.text(ctx, '◀◀ REWIND', 90, 360, { size: 64, font: 'mono', color: C.white, align: 'left', stroke: C.ink, strokeWidth: 8 });
      }

      /* ---------- caption ---------- */
      let cap = 'wait for it…';
      if (t >= 4.95 && t < 6.0) cap = 'ok it didn’t fall. bye 👋';
      else if (t >= 6.0 && t < MEME) cap = 'wait for it… (for real this time)';
      else if (t >= MEME && t < REWIND) cap = 'worth the wait 🧱💥';
      P.sticker(ctx, cap, 70, 1530, { pop: 1, size: cap.length > 24 ? 44 : 52 });
    },
  });
})();
