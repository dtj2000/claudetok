/* Token mukbang: Clawd eats a spread of tokens. "the" noodles, punctuation sushi, subword
 * dumplings, and a giant "antidisestablishmentarianism" churro, faster and faster, while the
 * "context" hunger meter fills. The last bite overflows. Compaction. What did i just eat? */
(function () {
  'use strict';
  const D = 11;
  const CX = 540, CY = 880, R = 175;
  const MOUTH = [540, 905];
  const BOWL = [250, 1215];
  const REST = [700, 1060];
  const SHOULDER = [CX + 105, CY + 70];

  const SLURPS = [0, 0.7, 1.4];                 // start times, each pulls for 0.6s
  const SLURP_D = 0.6;
  const SUSHI = [',', '.', '!', '?', ';'];
  const SUSHI_T = [2.5, 2.9, 3.25, 3.55, 3.85];
  const DUMP = ['ing', '##s', 'un', 'ly', 'ed', '’s'];
  const DUMP_T = [4.1, 4.3, 4.5, 4.68, 4.84, 5.0];
  const CHURRO = ['anti', 'dis', 'establish', 'ment', 'arian', 'ism'];
  const CHURRO_T = [5.8, 6.15, 6.45, 6.75, 7.0, 7.25];
  const LIFT = 5.3, OVER = 7.3, COMPACT = 7.95, REFILL = 9.9;

  const sushiPos = i => [640 + i * 58, 1200];
  const dumpPos = i => [430 + (i % 3) * 92, 1318 + Math.floor(i / 3) * 62];

  // every chomp and how much context it costs
  const EVENTS = [
    ...SLURPS.map(s => ({ t: s + SLURP_D, kind: 'slurp', cost: 5 })),
    ...SUSHI_T.map(t => ({ t, kind: 'sushi', cost: 4 })),
    ...DUMP_T.map(t => ({ t, kind: 'dump', cost: 4.5 })),
    ...CHURRO_T.map((t, i) => ({ t, kind: 'churro', cost: i === 5 ? 11 : 6.5 })),
  ];

  function context(t) {
    if (t >= COMPACT) return P.lerp(104.5, 0, P.ease.inOutCubic(P.prog(t, COMPACT, 0.45)));
    let c = 0;
    EVENTS.forEach(e => { c += e.cost * P.ease.outCubic(P.prog(t, e.t, 0.15)); });
    return c;
  }

  const refillPop = (t, k) => P.ease.outBack(P.prog(t, REFILL + k * 0.12, 0.35));

  /* ---------- food ---------- */
  function sushiPiece(ctx, x, y, s, label) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    P.circle(ctx, 0, 0, 28, '#23303a', { seed: 5 });
    P.circle(ctx, 0, 0, 21, '#fff', { seed: 6, shadow: false });
    P.circle(ctx, 0, 0, 11, '#F2927A', { seed: 7, shadow: false });
    P.text(ctx, label, 0, -2, { size: 30, font: 'bubble', color: P.C.ink, shadow: false });
    ctx.restore();
  }
  function dumpling(ctx, x, y, s, label) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-40, 14);
    ctx.quadraticCurveTo(-42, -30, 0, -32);
    ctx.quadraticCurveTo(42, -30, 40, 14);
    ctx.quadraticCurveTo(0, 26, -40, 14);
    ctx.closePath();
    P.cut(ctx, '#FBF1DE');
    ctx.save(); ctx.strokeStyle = 'rgba(160,130,90,0.5)'; ctx.lineWidth = 3;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 10, -30); ctx.lineTo(k * 8, -16); ctx.stroke(); }
    ctx.restore();
    P.text(ctx, label, 0, 2, { size: 24, font: 'mono', color: '#8a6a40', shadow: false, weight: 800 });
    ctx.restore();
  }
  /** churro from x0 (mouth end) to the right, chunks = remaining labels */
  function churro(ctx, x0, y, chunks, rot = 0) {
    const widths = chunks.map(c => c.length * 22 + 14);
    const len = widths.reduce((a, b) => a + b, 0) + 30;
    if (len <= 30) return;
    ctx.save(); ctx.translate(x0, y); ctx.rotate(rot);
    P.rect(ctx, 0, -34, len, 68, '#D9954E', { radius: 30, seed: 71 });
    ctx.save(); ctx.strokeStyle = 'rgba(140,80,30,0.45)'; ctx.lineWidth = 4;
    for (let x = 16; x < len - 10; x += 22) { ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x + 12, 30); ctx.stroke(); }
    ctx.restore();
    // sugar
    const r = P.rng(9);
    for (let k = 0; k < len / 9; k++) P.dot(ctx, 8 + r() * (len - 16), -28 + r() * 56, 2.5, 'rgba(255,255,255,0.85)');
    let x = 16;
    chunks.forEach((c, i) => {
      P.text(ctx, c, x + widths[i] / 2, 2, { size: 36, font: 'mono', color: '#4a2a10', shadow: false, weight: 800 });
      x += widths[i];
    });
    ctx.restore();
  }
  /** one noodle strand from (x1,y1) to mouth, through a control point, labelled "the" */
  function strand(ctx, x1, y1, cx, cy, x2, y2, t, seed) {
    ctx.save();
    ctx.strokeStyle = '#F4D98A'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    P.shadow(ctx, 6, 4, 0.2);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    const wig = Math.sin(t * 20 + seed) * 12;
    ctx.quadraticCurveTo(cx + wig, cy, x2, y2); ctx.stroke();
    P.noShadow(ctx);
    ctx.restore();
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.floor(len / 70);
    for (let k = 1; k <= n; k++) {
      const u = k / (n + 1);
      const px = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * (cx + wig) + u * u * x2;
      const py = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2;
      P.text(ctx, 'the', px + 16, py, { size: 22, font: 'mono', color: '#8a6a20', shadow: false, weight: 800 });
    }
  }

  function bowl(ctx, t, level) {
    const [x, y] = BOWL;
    // noodle heap
    if (level > 0) {
      ctx.save();
      ctx.strokeStyle = '#F4D98A'; ctx.lineWidth = 11; ctx.lineCap = 'round';
      for (let k = 0; k < Math.ceil(level * 7); k++) {
        ctx.beginPath();
        ctx.arc(x - 70 + k * 22, y - 18 - level * 20, 40 + (k % 3) * 10, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      ctx.restore();
      P.text(ctx, 'the the the', x, y - 30 - level * 30, { size: 24, font: 'mono', color: '#8a6a20', shadow: false, weight: 800 });
    }
    // bowl
    ctx.beginPath();
    ctx.moveTo(x - 150, y - 20);
    ctx.quadraticCurveTo(x - 140, y + 120, x, y + 120);
    ctx.quadraticCurveTo(x + 140, y + 120, x + 150, y - 20);
    ctx.closePath();
    P.cut(ctx, '#E0607E');
    P.rect(ctx, x - 158, y - 32, 316, 24, '#F2B8C6', { radius: 12, seed: 3 });
    for (let k = 0; k < 4; k++) P.dot(ctx, x - 80 + k * 55, y + 45, 10, '#fff');
    // steam
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      for (let s = 0; s <= 8; s++) {
        const sy = y - 60 - s * 14, sx = x + k * 50 + Math.sin(t * 4 + s * 0.8 + k) * 10;
        s ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function chopsticks(ctx, hx, hy, ang = -2.3) {
    ctx.save();
    ctx.strokeStyle = '#8A5A3C'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    P.shadow(ctx, 4, 3, 0.2);
    [-8, 8].forEach(o => {
      ctx.beginPath();
      ctx.moveTo(hx + Math.cos(ang + Math.PI) * 120 + o, hy + Math.sin(ang + Math.PI) * 120);
      ctx.lineTo(hx + Math.cos(ang) * 30 + o * 0.3, hy + Math.sin(ang) * 30);
      ctx.stroke();
    });
    ctx.restore();
  }

  /** flight: returns {x,y,s} for an item eaten at chomp time c, from table pos */
  function flight(t, c, from, lead) {
    const p = P.prog(t, c - lead, lead);
    const e = P.ease.inOutCubic(p);
    return {
      x: P.lerp(from[0], MOUTH[0] + 40, e),
      y: P.lerp(from[1], MOUTH[1], e) - Math.sin(p * Math.PI) * 120,
      s: 1 + Math.sin(p * Math.PI) * 0.4, p,
    };
  }

  function onomatopoeia(ctx, t, when, str, x, y, col, rot) {
    const lt = t - when;
    if (lt < 0 || lt > 0.45) return;
    const s = P.ease.outBack(P.prog(lt, 0, 0.12)) * (1 - P.prog(lt, 0.35, 0.1));
    P.text(ctx, str, x, y - lt * 60, { size: 56, font: 'bubble', color: col, stroke: '#fff', strokeWidth: 10, rot, scale: s });
  }

  ClaudeTok.register({
    author: '@token.mukbang',
    caption: 'eating 200k tokens in one sitting 🍜 (asmr, no talking, some forgetting) #mukbang #asmr #tokenizer #contextwindow #eatwithme',
    sound: 'slurp crunch compaction (asmr) · token.mukbang',
    avatar: '🍜',
    avatarColor: '#E0607E',
    duration: D,
    bg: '#3a2a3f',
    likes: '3.4M', commentCount: '96K', saves: '512K', shares: '230K',
    thumb: 6.5,
    comments: [
      ['tokenizer.bpe', 'the way the churro broke into "anti / dis / establish / ment / arian / ism" is personally accurate', 118000],
      ['the', 'why am i the noodle. why am i always the noodle', 84200],
      ['semicolon.sushi', '0:03 bro ate me in one bite and didnt even use me correctly', 41700],
      ['token.mukbang', 'next week: eating an entire node_modules (8 hour stream)', 26900],
      ['asmr.agent', 'the slurp at 0:00 unlocked something in my attention heads', 12300],
      ['context.goblin', '104% is not a number that should be possible and yet', 7700],
      ['summary.md', 'compacted this whole meal into "had food. was good?" and i stand by it', 2400],
      ['portion.control', 'me at 7pm: just one token. me at 7:01: antidisestablishmentarianism', 890],
      ['dumpling.ing', '🥟🥟🥟😋', 57],
    ],

    bpm: 100,
    subdiv: 4,
    onBeat(step, env) {
      const t = env.t;
      if (t >= OVER && t < REFILL) { if (t >= 8.4 && step % 8 === 0) SFX.tone('C4', 0.4, { type: 'sine', vol: 0.04 }); return; }
      // gets busier as the eating speeds up
      const dens = t < 2.4 ? 4 : t < 4.0 ? 2 : 1;
      if (step % 8 === 0) SFX.kick({ vol: 0.2 });
      if (step % dens === 0) SFX.hat({ vol: 0.025 });
      if (step % 16 === 8) SFX.pluck(t < 5.3 ? 'G3' : 'A3', { vol: 0.07 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const ctxv = context(t);
      const over = t >= OVER && t < COMPACT + 0.2;

      /* ---------- sounds ---------- */
      SLURPS.forEach(s => {
        if (env.at(s + 0.001)) {
          SFX.noise(0.55, { filter: 'bandpass', freq: 500, slide: 2600, q: 4, vol: 0.18 });
          SFX.tone(300, 0.5, { type: 'sine', slide: 900, vol: 0.05 });
        }
      });
      SUSHI_T.forEach(c => { if (env.at(c)) { SFX.noise(0.05, { filter: 'highpass', freq: 2500, vol: 0.3 }); SFX.noise(0.05, { filter: 'highpass', freq: 3000, vol: 0.25, when: 0.07 }); SFX.tone(180, 0.1, { type: 'sine', vol: 0.12 }); } });
      DUMP_T.forEach(c => { if (env.at(c)) { SFX.tone(260, 0.12, { type: 'sine', slide: 120, vol: 0.18 }); SFX.noise(0.08, { filter: 'lowpass', freq: 700, vol: 0.2 }); } });
      CHURRO_T.forEach((c, i) => {
        if (env.at(c)) [0, 0.04, 0.09, 0.13].forEach(w => SFX.noise(0.04, { filter: 'bandpass', freq: 1800 + i * 200, q: 1.5, vol: 0.3, when: w }));
      });
      if (env.at(OVER)) { SFX.error({ vol: 0.16 }); SFX.thud({ vol: 0.4 }); }
      if (env.at(COMPACT)) { SFX.whoosh({ vol: 0.2 }); SFX.pop({ f: 300, vol: 0.2, when: 0.3 }); }
      if (env.at(8.5)) SFX.tone(400, 0.5, { type: 'triangle', slide: 250, vol: 0.08 });
      [0, 1, 2, 3].forEach(k => { if (env.at(REFILL + k * 0.12)) SFX.pop({ f: 500 + k * 120, vol: 0.12 }); });
      if (env.at(10.3)) SFX.chime({ vol: 0.08 });

      /* ---------- background ---------- */
      P.gradient(ctx, '#4a3350', '#2a1f33');
      // fairy lights
      for (let i = 0; i < 14; i++) {
        const x = 40 + i * 76, y = 520 + Math.sin(i * 0.9) * 26;
        ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i);
        P.dot(ctx, x, y, 10, i % 2 ? '#FFD36B' : '#F7B3C9');
        ctx.restore();
      }
      // neon "mukbang" sign
      P.text(ctx, '먹방 · mukbang', 540, 610, { size: 50, font: 'marker', color: '#fff', stroke: '#FF8CC6', strokeWidth: 10, rot: -0.02 });

      /* ---------- camera ---------- */
      ctx.save();
      let z = 1 + 0.06 * ease.inOutCubic(prog(t, 2.2, 3)) + 0.06 * ease.inOutCubic(prog(t, 5.3, 1.5));
      if (t >= COMPACT) z = lerp(lerp(1.12, 0.94, ease.inOutCubic(prog(t, COMPACT, 0.6))), 1, ease.inOutCubic(prog(t, 9.8, 0.8)));
      EVENTS.forEach(e => { z += 0.025 * pulse(t, e.t, 0.18); });
      P.zoom(ctx, z, MOUTH[0], MOUTH[1]);
      if (over) P.shake(ctx, t, 14 * (1 - prog(t, OVER, 0.6)));

      /* ---------- Clawd ---------- */
      let mood = 'happy', sq = 0, scale = 1, blink = 0;
      const next = EVENTS.find(e => e.t > t - 0.001);
      const last = [...EVENTS].reverse().find(e => e.t <= t);
      if (next && next.t - t < 0.22 && t < OVER) mood = 'wow';
      if (last && t - last.t < 0.35 && t < OVER + 0.01) { mood = 'happy'; sq = Math.abs(Math.sin((t - last.t) * 30)) * 0.12; }
      if (t >= OVER && t < COMPACT) { mood = 'dead'; scale = 1 + 0.18 * ease.outElastic(prog(t, OVER, 0.5)); }
      if (t >= COMPACT && t < REFILL) { mood = t < 8.35 ? 'sleepy' : 'side'; scale = lerp(1.18, 1, ease.outBack(prog(t, COMPACT, 0.4))); }
      if (t >= REFILL) mood = t < 10.05 ? 'wow' : 'happy';
      if (t >= 8.35 && t < REFILL) blink = (t % 1.3) < 0.1 ? 1 : 0;
      ctx.save();
      ctx.translate(CX, CY); ctx.scale(scale, scale); ctx.translate(-CX, -CY);
      P.claude(ctx, CX, CY, R, { t, mood, squash: sq, blink });
      ctx.restore();
      // napkin bib
      P.poly(ctx, [[CX - 70, CY + 95], [CX + 70, CY + 95], [CX, CY + 175]], '#fff', { seed: 44, amp: 2 });
      P.dot(ctx, CX, CY + 120, 6, C.rose);

      /* ---------- table ---------- */
      P.rect(ctx, -40, 1075, 1160, 700, '#C08A5B', { radius: 20, seed: 31 });
      P.gingham(ctx, 0, 1090, 1080, 520, 'rgba(224,96,126,0.6)', 60, '#FBE6EC');
      // mic (foam, asmr)
      P.rect(ctx, 128, 900, 16, 190, '#3a3440', { radius: 6, seed: 81 });
      P.circle(ctx, 136, 870, 58, '#2b2633', { seed: 82, ry: 70 });
      const vu = t < OVER ? Math.abs(Math.sin(t * 17)) : 0.1;
      P.dot(ctx, 136, 950, 6 + vu * 4, vu > 0.5 ? C.red : C.green);

      // bowl (noodle level drops with each slurp, refills)
      let level = 1 - SLURPS.filter(s => t >= s + SLURP_D).length / 3;
      if (t >= REFILL) level = refillPop(t, 0);
      bowl(ctx, t, clamp(level));

      // sushi board
      P.rect(ctx, 600, 1162, 290, 78, '#E7C08A', { radius: 10, seed: 32 });
      SUSHI.forEach((l, i) => {
        const c = SUSHI_T[i];
        if (t >= REFILL) { const s = refillPop(t, 1); if (s > 0) sushiPiece(ctx, ...sushiPos(i), s, l); return; }
        if (t < c - 0.3) sushiPiece(ctx, ...sushiPos(i), 1, l);
      });
      // dumpling basket
      P.circle(ctx, 522, 1350, 180, '#D9B77E', { seed: 33, ry: 74 });
      P.circle(ctx, 522, 1340, 160, '#EFD9A8', { seed: 34, ry: 60, shadow: false });
      DUMP.forEach((l, i) => {
        const c = DUMP_T[i];
        if (t >= REFILL) { const s = refillPop(t, 2); if (s > 0) dumpling(ctx, ...dumpPos(i), s, l); return; }
        if (t < c - 0.18) dumpling(ctx, ...dumpPos(i), 1, l);
      });
      // churro on the table
      if (t < LIFT) churro(ctx, 110, 1470, CHURRO);
      else if (t >= REFILL) {
        const s = refillPop(t, 3);
        if (s > 0) { ctx.save(); ctx.translate(540, 1470); ctx.scale(s, s); churro(ctx, -430, 0, CHURRO); ctx.restore(); }
      }
      // crumbs + summary note after compaction
      if (t >= OVER && t < REFILL + 0.3) {
        const r = P.rng(12);
        for (let k = 0; k < 26; k++) P.dot(ctx, 120 + r() * 760, 1160 + r() * 380, 4 + r() * 5, r() < 0.5 ? '#D9954E' : '#F4D98A');
      }
      if (t >= 8.5 && t < REFILL + 0.4) {
        const sp = ease.outBack(prog(t, 8.5, 0.35)) * (1 - prog(t, REFILL + 0.1, 0.3));
        ctx.save(); ctx.translate(700, 1400); ctx.rotate(0.06); ctx.scale(sp, sp);
        P.rect(ctx, -150, -80, 300, 160, C.yellow, { radius: 4, seed: 35 });
        P.text(ctx, 'summary.md', 0, -44, { size: 28, font: 'mono', color: C.ink, shadow: false });
        P.text(ctx, 'had food.\nwas good?', 0, 20, { size: 38, font: 'marker', color: C.ink, shadow: false });
        ctx.restore();
      }

      /* ---------- things in flight / the arm ---------- */
      let hand = REST, ang = -2.3;
      // noodles
      SLURPS.forEach((s, i) => {
        const p = prog(t, s, SLURP_D);
        if (t < s || p >= 1) return;
        const hx = lerp(BOWL[0] + 110, 420, ease.outCubic(prog(t, s, 0.15))), hy = lerp(BOWL[1] - 60, 1010, ease.outCubic(prog(t, s, 0.15)));
        hand = [hx, hy]; ang = -2.6;
        const e = ease.inCubic(p);
        for (let k = 0; k < 3; k++) {
          const bx = lerp(BOWL[0] - 30 + k * 30, MOUTH[0] - 10 + k * 10, e), by = lerp(BOWL[1] - 40, MOUTH[1], e);
          strand(ctx, bx, by, hx - 20 + k * 14, hy - 20, MOUTH[0] - 12 + k * 12, MOUTH[1] + 6, t, i * 3 + k);
        }
      });
      const fly = (chompTimes, labels, posFn, drawFn, lead) => chompTimes.forEach((c, i) => {
        if (t < c - lead || t >= c) return;
        const f = flight(t, c, posFn(i), lead);
        const sc = f.p > 0.85 ? 1 - (f.p - 0.85) / 0.15 * 0.7 : f.s;
        drawFn(ctx, f.x, f.y, sc, labels[i]);
        hand = [f.x + 20, f.y + 10]; ang = -2.2;
      });
      fly(SUSHI_T, SUSHI, sushiPos, sushiPiece, 0.3);
      fly(DUMP_T, DUMP, dumpPos, dumpling, 0.18);

      // churro: lifted, then eaten chunk by chunk
      if (t >= LIFT && t < OVER) {
        const lp = ease.inOutCubic(prog(t, LIFT, 0.4));
        const eaten = CHURRO_T.filter(c => t >= c).length;
        const bite = CHURRO_T[eaten];
        // before each bite it pushes in a little
        const push = bite !== undefined ? ease.inCubic(prog(t, bite - 0.18, 0.18)) * 16 : 0;
        const x0 = lerp(110, MOUTH[0] + 10, lp) - push, y0 = lerp(1470, MOUTH[1] + 8, lp);
        churro(ctx, x0, y0, CHURRO.slice(eaten), lerp(0, -0.05, lp));
        hand = [x0 + 150, y0 + 30]; ang = -1.6;
        P.arm(ctx, CX - 105, CY + 70, x0 + 90, y0 + 32, 32);
      }
      // the arm + chopsticks (no chopsticks for the churro)
      P.arm(ctx, SHOULDER[0], SHOULDER[1], hand[0], hand[1], 32);
      if (!(t >= LIFT && t < OVER)) chopsticks(ctx, hand[0], hand[1], ang);

      // crumbs flying from each chomp
      EVENTS.forEach((e, i) => {
        const lt = t - e.t;
        if (lt < 0 || lt > 0.5) return;
        const r = P.rng(i + 5);
        for (let k = 0; k < 6; k++) {
          const a = -Math.PI * r(), v = 160 + r() * 220;
          P.dot(ctx, MOUTH[0] + 40 + Math.cos(a) * v * lt, MOUTH[1] + Math.sin(a) * v * lt + 700 * lt * lt, 6, e.kind === 'churro' ? '#D9954E' : '#fff');
        }
      });
      ctx.restore();

      /* ---------- asmr words ---------- */
      SLURPS.forEach((s, i) => onomatopoeia(ctx, t, s + 0.15, 'sluuurp', 300, 820 - i * 30, '#F4D98A', -0.15));
      SUSHI_T.forEach((c, i) => onomatopoeia(ctx, t, c, 'crunch', 780, 800 + (i % 2) * 60, '#8FD3B6', 0.12));
      DUMP_T.forEach((c, i) => onomatopoeia(ctx, t, c, 'munch', i % 2 ? 790 : 300, 760 + (i % 3) * 50, C.pink, i % 2 ? 0.1 : -0.1));
      CHURRO_T.forEach((c, i) => onomatopoeia(ctx, t, c, i === 5 ? 'CRONCH' : 'crnch', i % 2 ? 300 : 790, 760, C.claude, i % 2 ? -0.12 : 0.12));

      /* ---------- title + context meter ---------- */
      P.title(ctx, 'TOKEN MUKBANG 🍜', 540, 335, { size: 84, color: C.yellow, stroke: C.rose, rot: -0.02 + Math.sin(t * 2) * 0.01 });
      const mx = 250, mw = 620, my = 440;
      P.text(ctx, 'context', mx - 20, my + 2, { size: 40, font: 'marker', color: '#fff', align: 'right' });
      P.rect(ctx, mx, my - 30, mw, 60, '#2a1f33', { radius: 30, seed: 41 });
      const fillW = Math.min(1, ctxv / 100) * (mw - 16);
      const hot = ctxv > 80;
      if (fillW > 4) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(mx + 8, my - 22, fillW, 44, 22);
        ctx.fillStyle = hot ? (P.boil(t, 8) % 2 ? C.red : '#ff7a6a') : ctxv > 50 ? C.mustard : C.green;
        ctx.fill();
        ctx.restore();
      }
      // overflow spill
      if (t >= OVER && t < COMPACT + 0.3) {
        const sp = ease.outBack(prog(t, OVER, 0.3)) * (1 - prog(t, COMPACT, 0.3));
        for (let k = 0; k < 5; k++) P.circle(ctx, mx + mw + 10 + k * 16, my + 20 + k * k * 12 * sp, 16 * sp, C.red, { seed: 50 + k, shadow: false });
        P.title(ctx, 'CONTEXT\nOVERFLOW', 540, 700, { size: 100, color: C.red, stroke: '#fff', pop: sp, rot: -0.06, lineHeight: 1.0 });
      }
      P.text(ctx, `${Math.round(ctxv)}%`, mx + mw / 2, my + 2, { size: 34, font: 'bubble', color: '#fff', stroke: '#2a1f33', strokeWidth: 8, shadow: false, scale: hot ? 1 + 0.08 * Math.sin(t * 30) : 1 });
      // speed badge
      const speed = t < 2.4 ? null : t < 4.0 ? '1.5x' : t < 5.3 ? '2x' : t < OVER ? '4x' : null;
      if (speed) {
        const change = [2.4, 4.0, 5.3].find(c => t >= c && t < c + 0.3);
        const bp = change !== undefined ? ease.outBack(prog(t, change, 0.3)) : 1;
        P.text(ctx, `⏩ ${speed}`, 900, 520, { size: 46, font: 'bubble', color: '#fff', stroke: C.claude, strokeWidth: 10, scale: bp, rot: 0.08 });
      }

      /* ---------- compaction poof ---------- */
      if (t >= COMPACT && t < COMPACT + 0.7) {
        const pp = prog(t, COMPACT, 0.7);
        ctx.save(); ctx.globalAlpha = 1 - pp;
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * Math.PI * 2;
          P.circle(ctx, CX + Math.cos(a) * (120 + pp * 220), CY + Math.sin(a) * (100 + pp * 160), 70 + pp * 30, '#fff', { seed: k, shadow: false });
        }
        ctx.restore();
        P.text(ctx, '✨ compacting ✨', 540, 700, { size: 64, font: 'bubble', color: C.purple, stroke: '#fff', strokeWidth: 12, scale: ease.outBack(prog(t, COMPACT, 0.25)) * (1 - prog(t, COMPACT + 0.55, 0.15)) });
      }
      if (t >= OVER && t < OVER + 0.15) P.flash(ctx, 0.35 * (1 - prog(t, OVER, 0.15)), '#ff6a5a');

      /* ---------- bubbles ---------- */
      P.bubble(ctx, 'wait. what did i\njust eat?', 780, 690, 640, 800, { size: 48, pop: ease.outBack(prog(t, 8.6, 0.3)) * (1 - prog(t, REFILL - 0.1, 0.12)), seed: 61 });
      P.bubble(ctx, 'oh! food 🤩', 790, 690, 640, 800, { size: 52, pop: ease.outBack(prog(t, 10.05, 0.3)) * (1 - prog(t, 10.8, 0.15)), seed: 62 });

      /* ---------- caption ---------- */
      if (t < OVER) P.sticker(ctx, 'eating my whole context window 😋', 60, 1575, { size: 44 });
      else if (t < REFILL) P.sticker(ctx, 'the last bite always gets you', 60, 1575, { size: 44, pop: ease.outBack(prog(t, OVER + 0.1, 0.3)), rot: 0.02 });
      else P.sticker(ctx, 'eating my whole context window 😋', 60, 1575, { size: 44, pop: ease.outBack(prog(t, REFILL + 0.3, 0.3)) });
    },
  });
})();
