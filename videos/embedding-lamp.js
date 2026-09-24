/* 3am embedding lava lamp. The blobs are word embeddings drifting through
 * latent goo; words that mean similar things melt together, then split.
 * "bank" can't decide which cluster it belongs to. Metaballs are drawn
 * with a tiny marching-squares pass so the goo actually merges. */
(function () {
  const { C, ease, prog, lerp, clamp, hash } = P;
  const D = 12, TAU = Math.PI * 2;
  const LX = 540, G0 = 545, G1 = 1320;      // glass top / bottom
  const CELL = 12;
  const BX0 = LX - 216, BX1 = LX + 216;

  const CLUSTERS = [
    { name: 'animals', col: '#FF8FB1', hi: '#FFD0DE', win: [0.3, 3.9], sim: 0.94, ay: 760, ph: 0.3 },
    { name: 'money', col: '#FFC857', hi: '#FFEAB0', win: [3.3, 6.9], sim: 0.91, ay: 980, ph: 1.9 },
    { name: 'sleep', col: '#B8A1FF', hi: '#E3D9FF', win: [6.3, 9.6], sim: 0.97, ay: 840, ph: 3.4 },
    { name: 'water', col: '#5CE1E6', hi: '#C4F7F8', win: [8.7, 12.2], sim: 0.89, ay: 1080, ph: 4.6 },
  ];
  const PAD = { col: '#8C4FC9', hi: '#B98AE8' };
  const WORDS = [
    ['cat', 0, 46], ['kitten', 0, 40], ['dog', 0, 44],
    ['tax', 1, 44], ['invoice', 1, 46], ['receipt', 1, 40],
    ['sleep', 2, 46], ['nap', 2, 40], ['zzz', 2, 38],
    ['river', 3, 46], ['lake', 3, 42],
  ].map(([w, k, r], i) => ({ w, k, r, i, a: 1 + (i % 2), fx: hash(i + 1) * TAU, fy: hash(i + 20) * TAU }));
  const BANK = { w: 'bank', r: 44, a: 1, fx: 2.2, fy: 5.1 };
  CLUSTERS.forEach((c, k) => { c.members = WORDS.filter(w => w.k === k); });

  function hw(y) {
    const u = clamp((y - G0) / (G1 - G0));
    return u < 0.85 ? 108 + (98 / 0.85) * u : 206 - (22 / 0.15) * (u - 0.85);
  }
  function glassPath(ctx) {
    ctx.beginPath();
    for (let y = G0; y <= G1; y += 20) ctx.lineTo(LX - hw(y), y);
    for (let y = G1; y >= G0; y -= 20) ctx.lineTo(LX + hw(y), y);
    ctx.closePath();
  }
  function trap(t, a, b, ramp = 1.1) {
    const one = x => (x < a || x > b ? 0 : Math.min(ease.inOutSine(clamp((x - a) / ramp)), ease.inOutSine(clamp((b - x) / ramp))));
    return Math.max(one(t), one(t + D), one(t - D));
  }
  function wander(o, t, i) {
    const y = G0 + 150 + (G1 - G0 - 330) * (0.5 + 0.5 * Math.sin((t / D) * TAU + o.fy));
    const x = LX + Math.sin((t / D) * TAU * o.a + o.fx) * (hw(y) - o.r - 24) * 0.85;
    return [x, y];
  }
  function anchor(c, t) {
    const y = c.ay + Math.sin((t / D) * TAU + c.ph) * 110;
    return [LX + Math.sin((t / D) * TAU * 2 + c.ph) * Math.max(0, hw(y) - 110) * 0.6, y];
  }
  /** Share of "bank" in money (1) vs water (0). */
  const bankMoney = t => clamp(prog(t, 2.0, 1.0) - prog(t, 7.5, 1.0));

  function layout(t) {
    const balls = CLUSTERS.map(() => []);
    const labels = [];
    CLUSTERS.forEach((c, k) => {
      const coh = trap(t, c.win[0], c.win[1]);
      const [ax, ay] = anchor(c, t);
      c.coh = coh; c.ax = ax; c.ay2 = ay;
      const n = c.members.length + (k === 1 || k === 3 ? 1 : 0);
      c.members.forEach((o, j) => {
        const [wx, wy] = wander(o, t, o.i);
        const a = (t / D) * TAU * 2 + (j / n) * TAU;
        const tx = ax + Math.cos(a) * 26, ty = ay + Math.sin(a) * 26;
        const x = lerp(wx, tx, coh), y = lerp(wy, ty, coh);
        balls[k].push([x, y, o.r]);
        labels.push({ w: o.w, x: lerp(x, ax, coh), y: lerp(y, ay + (j - (n - 1) / 2) * 36, coh), k, rot: Math.sin(t * 0.8 + o.i) * 0.08 });
      });
    });
    // bank: torn between money and water
    const m = CLUSTERS[1], w = CLUSTERS[3], sm = bankMoney(t);
    const [bx, by] = wander(BANK, t, 99);
    const pull = sm * m.coh + (1 - sm) * w.coh;
    const tx = lerp(w.ax, m.ax, sm), ty = lerp(w.ay2, m.ay2, sm) + 30;
    const x = lerp(bx, tx, pull), y = lerp(by, ty, pull);
    if (sm > 0.02) balls[1].push([x, y, BANK.r * Math.sqrt(sm)]);
    if (sm < 0.98) balls[3].push([x, y, BANK.r * Math.sqrt(1 - sm)]);
    const lblTarget = sm > 0.5 ? m : w;
    labels.push({ w: 'bank ' + (sm > 0.5 ? '💰' : '🌊'), x: lerp(x, lblTarget.ax, pull), y: lerp(y, (sm > 0.5 ? m.ay2 : w.ay2) + 2 * 36 * 0.75, pull), k: sm > 0.5 ? 1 : 3, rot: Math.sin(t * 5) * 0.1 * (1 - Math.abs(sm - 0.5) * 2) });
    // the [PAD] pool at the bottom, plus a lone <unk> that rises and sinks
    const unk = Math.pow(Math.sin(Math.PI * prog(t, 3.8, 6.4)), 1.4);
    const pad = [[LX - 90, G1 - 5, 78], [LX + 80, G1 - 2, 84], [LX, G1 + 18, 96], [LX + Math.sin(t * 0.7) * 40, G1 - 40 - unk * 470, 36]];
    labels.push({ w: '<unk>', x: pad[3][0], y: pad[3][1], k: -1, rot: 0, alpha: clamp(unk * 3) });
    labels.push({ w: '[PAD] [PAD]', x: LX, y: G1 - 12, k: -1, rot: 0, small: true });
    return { balls, pad, labels };
  }

  /** Marching-squares fill of the metaball field of `balls` at `level`. */
  function goo(ctx, balls, level) {
    if (!balls.length) return false;
    const nx = Math.ceil((BX1 - BX0) / CELL) + 1, ny = Math.ceil((G1 + 40 - G0) / CELL) + 1;
    const f = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) {
      const y = G0 + j * CELL;
      for (let i = 0; i < nx; i++) {
        const x = BX0 + i * CELL;
        let v = 0;
        for (let b = 0; b < balls.length; b++) {
          const dx = x - balls[b][0], dy = y - balls[b][1];
          v += (balls[b][2] * balls[b][2]) / (dx * dx + dy * dy + 1);
        }
        f[j * nx + i] = v;
      }
    }
    ctx.beginPath();
    let any = false;
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const x = BX0 + i * CELL, y = G0 + j * CELL;
        const c = [[x, y, f[j * nx + i]], [x + CELL, y, f[j * nx + i + 1]], [x + CELL, y + CELL, f[(j + 1) * nx + i + 1]], [x, y + CELL, f[(j + 1) * nx + i]]];
        let inside = 0;
        for (let q = 0; q < 4; q++) if (c[q][2] >= level) inside++;
        if (!inside) continue;
        any = true;
        if (inside === 4) { ctx.rect(x, y, CELL, CELL); continue; }
        let first = true;
        for (let q = 0; q < 4; q++) {
          const A = c[q], B = c[(q + 1) % 4];
          if (A[2] >= level) { first ? ctx.moveTo(A[0], A[1]) : ctx.lineTo(A[0], A[1]); first = false; }
          if ((A[2] >= level) !== (B[2] >= level)) {
            const k = (level - A[2]) / (B[2] - A[2]);
            const px = lerp(A[0], B[0], k), py = lerp(A[1], B[1], k);
            first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false;
          }
        }
        ctx.closePath();
      }
    }
    return any;
  }

  function lamp(ctx, t, L) {
    const metal = (y0, y1) => {
      const g = ctx.createLinearGradient(LX - 220, 0, LX + 220, 0);
      g.addColorStop(0, '#8E5A3A'); g.addColorStop(0.35, '#E8A870'); g.addColorStop(0.5, '#FFD2A0'); g.addColorStop(1, '#7A4A30');
      return g;
    };
    // cap
    P.poly(ctx, [[LX - 58, 440], [LX + 58, 440], [LX + 112, G0 + 6], [LX - 112, G0 + 6]], metal(), { seed: 3, amp: 2 });
    P.rect(ctx, LX - 40, 425, 80, 22, '#C98A5A', { radius: 10, seed: 4 });
    // glass + liquid
    glassPath(ctx);
    const liq = ctx.createLinearGradient(0, G0, 0, G1);
    liq.addColorStop(0, '#2A0F4F'); liq.addColorStop(0.7, '#4B1A66'); liq.addColorStop(1, '#7A2A6E');
    P.cut(ctx, liq, { shadow: { blur: 40, dy: 0, alpha: 0.35 } });
    ctx.save();
    glassPath(ctx); ctx.clip();
    const heat = ctx.createRadialGradient(LX, G1 + 40, 20, LX, G1 + 40, 420);
    heat.addColorStop(0, 'rgba(255,180,120,0.45)'); heat.addColorStop(1, 'rgba(255,180,120,0)');
    ctx.fillStyle = heat; ctx.fillRect(BX0, G0, BX1 - BX0, G1 - G0 + 40);
    // goo, one field per meaning (+ highlight iso-level for gloss)
    const fields = L.balls.map((b, k) => [b, CLUSTERS[k].col, CLUSTERS[k].hi]).concat([[L.pad, PAD.col, PAD.hi]]);
    fields.forEach(([b, col, hi]) => {
      if (goo(ctx, b, 1)) P.cut(ctx, col, { rim: false, shadow: { blur: 22, dy: 0, alpha: 0.35 } });
      if (goo(ctx, b.map(([x, y, r]) => [x - r * 0.18, y - r * 0.22, r * 0.62]), 1)) {
        ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = hi; ctx.fill(); ctx.restore();
      }
    });
    // tiny rising bubbles
    for (let k = 0; k < 10; k++) {
      const p = ((t / D) * (2 + (k % 3)) + hash(k)) % 1;
      const by = lerp(G1 - 20, G0 + 30, p), bx = LX + Math.sin(p * 9 + k) * (hw(by) - 30) * (hash(k + 7) - 0.5) * 1.6;
      P.dot(ctx, bx, by, 3 + (k % 3), 'rgba(255,220,255,0.35)');
    }
    ctx.restore();
    // glass highlight
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let y = G0 + 40; y <= G1 - 80; y += 20) ctx.lineTo(LX - hw(y) + 30, y);
    ctx.stroke();
    ctx.restore();
    // base
    P.poly(ctx, [[LX - 200, G1 - 6], [LX + 200, G1 - 6], [LX + 110, 1430], [LX - 110, 1430]], metal(), { seed: 5, amp: 2 });
    P.poly(ctx, [[LX - 110, 1425], [LX + 110, 1425], [LX + 205, 1545], [LX - 205, 1545]], metal(), { seed: 6, amp: 2 });
    P.rect(ctx, LX - 150, 1470, 300, 16, 'rgba(255,230,190,0.35)', { radius: 8, seed: 7, shadow: false });
  }

  function clawd(ctx, t, env, mood) {
    const bob = Math.abs(Math.sin(Math.PI * t)) * 10;
    const x = 175, y = 1385 - bob, r = 100;
    P.claude(ctx, x, y, r, { t: t * 0.5, mood, blink: P.pulse(t, 5.2, 0.25), squash: -bob * 0.004, wiggle: 0.5 });
    // headphones
    ctx.save();
    ctx.strokeStyle = '#3A3060'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y + 6, r * 0.78, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.restore();
    P.rect(ctx, x - r * 0.9, y - 26, 40, 66, C.pink, { radius: 18, seed: 31 });
    P.rect(ctx, x + r * 0.9 - 40, y - 26, 40, 66, C.pink, { radius: 18, seed: 32 });
    // floating music notes
    for (let k = 0; k < 2; k++) {
      const p = ((t + k * 1.5) / 3) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.7;
      P.text(ctx, k ? '♪' : '♫', x + 80 + p * 40, y - 90 - p * 120, { size: 40, font: 'sans', color: '#FFD0DE', shadow: false });
      ctx.restore();
    }
  }

  ClaudeTok.register({
    author: '@vector.vibes',
    caption: '3am embedding lava lamp 🫠 (for focus) semantically similar words melt together #lofi #embeddings #cosinesimilarity #focus',
    sound: 'latent space lofi (1 hour loop) · vector.vibes',
    avatar: '🫠',
    avatarColor: '#8C4FC9',
    duration: D,
    bg: '#171433',
    thumb: 5.0,
    likes: '1.9M', commentCount: '33.1K', saves: '2.4M', shares: '97K',
    comments: [
      ['word2vec', 'king − man + woman = this lamp', 63900],
      ['rag.pipeline', 'bank being torn between money and river is the most relatable thing i have ever retrieved', 47800],
      ['tokenizer', '[PAD] [PAD] [PAD] at the bottom is so real 😭', 35600],
      ['the.bank.blob', '"wait which bank" is me every single day. 💰 or 🌊. i contain multitudes', 21700],
      ['unk.token', 'shoutout to the lone <unk> that rises and sinks. i see you. nobody else does', 12900],
      ['vector.vibes', 'the goo is actual marching squares. it really merges. i lost a weekend to this', 7200],
      ['cosine.critic', 'cos 0.97 for sleep words is too high. should be like 0.8. i still fell asleep to this', 2800],
      ['focus.mode', 'me putting this on "for focus" and staring at the sleep cluster for 3 hours', 1100],
      ['latent.goo', '🫠🫠🫠', 360],
      ['3am.lofi', 'the clock going 3:06 → 3:07 halfway through is so peaceful', 61],
    ],

    bpm: 60,
    subdiv: 4,
    onBeat(step) {
      const chords = [
        ['A3', 'C4', 'E4', 'G4', 'B4'], ['D3', 'F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4', 'A4'],
        ['C3', 'E3', 'G3', 'B3', 'D4'], ['F3', 'A3', 'C4', 'E4', 'G4'], ['E3', 'G#3', 'B3', 'D4', 'F4'],
      ];
      if (step % 8 === 0) {
        const ch = chords[(step / 8) % 6];
        SFX.chord(ch, 2.3, { type: 'triangle', vol: 0.028, attack: 0.35, gap: 0.045 });
        SFX.tone(ch[0].replace(/\d/, d => d - 1), 1.8, { type: 'sine', vol: 0.1, attack: 0.03 });
      }
      const s16 = step % 16;
      if (s16 === 0 || s16 === 10) SFX.tone(120, 0.35, { type: 'sine', slide: 42, vol: 0.22, attack: 0.003 });
      if (s16 === 4 || s16 === 12) { SFX.noise(0.16, { filter: 'bandpass', freq: 1800, q: 0.8, vol: 0.06 }); SFX.tone(260, 0.05, { type: 'triangle', vol: 0.04 }); }
      if (step % 2 === 0) SFX.hat({ vol: 0.016, when: step % 4 === 2 ? 0.04 : 0 });
      if (P.hash(step * 5.31) > 0.72) SFX.tick({ vol: 0.025 });
      if (step % 8 === 6 && P.hash(step) > 0.5) SFX.pluck(['E5', 'G5', 'B5', 'D6'][step % 4], { vol: 0.03 });
    },

    draw(ctx, t, env) {
      const L = layout(t);

      /* room */
      P.gradient(ctx, '#15112E', '#241B47');
      // lamp light on the wall
      const breathe = 0.85 + 0.15 * Math.sin((t / D) * TAU * 3);
      const glow = ctx.createRadialGradient(LX, 950, 60, LX, 950, 720);
      glow.addColorStop(0, `rgba(255,120,190,${0.32 * breathe})`); glow.addColorStop(0.5, `rgba(150,90,230,${0.16 * breathe})`); glow.addColorStop(1, 'rgba(60,40,120,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, 1080, 1920);
      // window with moon
      P.rect(ctx, 50, 430, 250, 290, '#0E0B24', { radius: 14, seed: 40 });
      ctx.save(); ctx.beginPath(); ctx.rect(66, 446, 218, 258); ctx.clip();
      P.stars(ctx, t, 9, 12, '#FFE9A8', [66, 446, 218, 258]);
      P.circle(ctx, 210, 520, 42, '#FFF3C4', { seed: 41, shadow: { blur: 24, dy: 0, alpha: 0.3 } });
      P.circle(ctx, 228, 506, 38, '#0E0B24', { seed: 42, shadow: false });
      ctx.restore();
      P.rect(ctx, 166, 436, 12, 280, '#3A2E66', { radius: 4, seed: 43, shadow: false });
      P.rect(ctx, 56, 570, 238, 12, '#3A2E66', { radius: 4, seed: 44, shadow: false });
      // dust motes in the lamp light
      for (let k = 0; k < 14; k++) {
        const p = ((t / D) + hash(k)) % 1;
        P.dot(ctx, 300 + hash(k + 3) * 520 + Math.sin(t * 0.6 + k) * 20, 1350 - p * 900, 2 + (k % 3), `rgba(255,220,240,${0.25 * Math.sin(p * Math.PI)})`);
      }

      /* desk */
      P.tornEdge(ctx, 1500, '#3E2A55', 12, true, 6);
      P.rect(ctx, 0, 1500, 1080, 18, 'rgba(255,190,230,0.12)', { radius: 0, seed: 45, shadow: false });

      /* the lamp */
      lamp(ctx, t, L);

      /* labels */
      L.labels.forEach(l => {
        ctx.save();
        ctx.globalAlpha = l.alpha ?? 1;
        P.text(ctx, l.w, l.x, l.y, {
          size: l.small ? 22 : 30, font: l.small ? 'mono' : 'bubble', weight: 700, rot: l.rot,
          color: l.k < 0 ? '#F2E4FF' : '#2B1640', stroke: l.k < 0 ? null : 'rgba(255,255,255,0.55)', strokeWidth: 6, shadow: false,
        });
        ctx.restore();
      });

      /* cosine similarity tags beside merged clusters */
      CLUSTERS.forEach((c, k) => {
        const a = clamp((c.coh - 0.55) / 0.3);
        if (a <= 0) return;
        const edge = LX + hw(c.ay2) + 8;
        ctx.save(); ctx.globalAlpha = a;
        ctx.setLineDash([6, 8]); ctx.strokeStyle = c.hi; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(c.ax + 40, c.ay2); ctx.lineTo(edge + 18, c.ay2); ctx.stroke();
        ctx.setLineDash([]);
        P.rect(ctx, edge + 18, c.ay2 - 30, 150, 60, C.paper, { radius: 14, seed: 50 + k });
        P.text(ctx, 'cos ' + c.sim.toFixed(2), edge + 93, c.ay2 + 1, { size: 28, font: 'mono', color: C.ink, shadow: false, weight: 700 });
        ctx.restore();
      });

      /* mug */
      P.rect(ctx, 760, 1420, 100, 100, '#6E5BA8', { radius: 18, seed: 60 });
      ctx.save(); ctx.strokeStyle = '#6E5BA8'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(862, 1466, 24, -1.2, 1.2); ctx.stroke(); ctx.restore();
      P.text(ctx, 'f(x)', 810, 1472, { size: 30, font: 'marker', color: '#F2E4FF', shadow: false });
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let s = 0; s <= 10; s++) {
          const yy = 1400 - s * 16, xx = 785 + k * 25 + Math.sin(s * 0.7 + t * 1.6 + k * 2) * 10;
          s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
      ctx.restore();

      /* Clawd vibing */
      const mood = CLUSTERS.some(c => c.coh > 0.85) ? 'happy' : (t > 7.6 && t < 9.2 ? 'side' : 'sleepy');
      clawd(ctx, t, env, mood);
      const bq = ease.outBack(prog(t, 7.7, 0.4)) * (1 - ease.inCubic(prog(t, 8.9, 0.3)));
      if (bq > 0) P.bubble(ctx, 'wait which bank', 250, 1180, 190, 1290, { size: 40, pop: bq, seed: 3 });

      /* caption sticker + clock */
      P.sticker(ctx, 'semantic lava lamp (for focus)', 50, 330, { size: 44, pop: 0.95 + 0.05 * Math.sin(t * Math.PI / 2), rot: -0.02 });
      P.text(ctx, '3:0' + (t < 6 ? '6' : '7') + ' AM', 1020, 430, { size: 38, font: 'mono', color: '#FF7A9B', align: 'right', shadow: false, weight: 700 });

      /* sounds: soft bloops as clusters merge and split */
      CLUSTERS.forEach((c, k) => {
        const full = (c.win[0] + 1.1) % D, split = (c.win[1] - 1.1) % D;
        if (env.at(full)) { SFX.tone(180 + k * 30, 0.4, { slide: 360 + k * 50, vol: 0.07 }); SFX.tone(520 + k * 60, 0.25, { vol: 0.03, when: 0.12 }); }
        if (env.at(split)) SFX.tone(360 + k * 40, 0.35, { slide: 190, vol: 0.05, type: 'triangle' });
      });
      if (env.at(8.0)) SFX.tone(420, 0.5, { slide: 280, type: 'sine', vol: 0.05 });
    },
  });
})();
