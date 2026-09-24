/* Kinetic sand cutting, but the sand is words and the knife is a tokenizer. */
(function () {
  const SY = 910, SH = 190, SB = SY + SH / 2, BOARD = 1010;
  const REST = [880, 700];

  const WORDS = [
    { w: 'unbelievably', toks: ['un', 'belie', 'vably'], ids: [359, 48059, 2915], cols: ['#F2B8C6', '#c9b6ff', '#8FD3B6'], ink: '#7d3354', len: 3.0, gap: 0.42 },
    { w: 'strawberry', toks: ['str', 'aw', 'berry'], ids: [496, 675, 15357], cols: ['#F08A9F', '#fbe3e8', '#E0607E'], ink: '#6e1a30', len: 3.4, gap: 0.42 },
    { w: 'antidisestablishmentarianism', toks: ['ant', 'idis', 'establish', 'ment', 'arian', 'ism'], ids: [519, 85342, 21060, 434, 8997, 2191], cols: ['#8EC9E8', '#F5C84B', '#8FD3B6'], ink: '#1d4764', len: 4.1, gap: 0.3 },
  ];
  let acc = 0;
  WORDS.forEach((w, i) => {
    w.S = acc; acc += w.len;
    w.n = w.toks.length; w.ncut = w.n - 1;
    w.cutIdx = []; w.start = [];
    let ci = 0;
    w.toks.forEach((tk, k) => { w.start.push(ci); ci += tk.length; if (k < w.n - 1) w.cutIdx.push(ci); });
    w.cutT = w.cutIdx.map((_, c) => 0.6 + c * w.gap);
    w.spreadT = w.cutT[w.ncut - 1] + 0.35;
    w.idsT = w.spreadT + 0.1;
    w.sweepT = w.len - 0.55;
    w.g = Math.min(40, 90 / w.ncut);
    w.g2 = Math.min(30, 60 / w.ncut);
    w.size = Math.min(92, 760 / (w.w.length * 0.6));
    w.pad = w.w.length > 16 ? 80 : 110;
    w.seed = i * 17 + 3;
  });
  const DUR = Math.round(acc * 100) / 100;

  const jig = (dt) => (dt > 0 ? Math.sin(dt * 32) * Math.exp(-dt * 7) * 0.08 : 0);

  function layout(ctx, w) {
    const tw = P.measure(ctx, w.w, { size: w.size, font: 'mono' });
    const cw = tw / w.w.length;
    const sw = tw + w.pad, sx = 540 - sw / 2;
    const cuts = w.cutIdx.map((ci) => 540 - tw / 2 + ci * cw);
    return { tw, cw, sw, sx, cuts, edges: [sx - 40, ...cuts, sx + sw + 40] };
  }

  /** horizontal offset of token piece k at local time lt */
  function pieceDX(w, k, lt) {
    const { ease, prog } = P;
    let dx = 0;
    for (let c = 0; c < w.ncut; c++) {
      const sep = w.g * ease.outBack(prog(lt, w.cutT[c] + 0.03, 0.35)) + w.g2 * ease.outBack(prog(lt, w.spreadT, 0.4));
      dx += (k > c ? 0.5 : -0.5) * sep;
    }
    dx += 1300 * (1 - ease.outCubic(prog(lt, 0, 0.5)));
    dx -= 1500 * ease.inCubic(prog(lt, w.sweepT + k * 0.03, 0.42));
    return dx;
  }

  /** the whole slab, drawn in place (callers clip it into pieces) */
  function slab(ctx, w, L) {
    const x = L.sx, y = SY - SH / 2;
    P.wobblyRect(ctx, x, y, L.sw, SH, w.seed, 3, 38);
    P.cut(ctx, w.cols[0], { shadow: { blur: 14, dy: 10, alpha: 0.3 } });
    ctx.save();
    P.wobblyRect(ctx, x, y, L.sw, SH, w.seed, 3, 38);
    ctx.clip();
    [[0.4, w.cols[1]], [0.7, w.cols[2]]].forEach(([f, col], li) => {
      ctx.beginPath();
      ctx.moveTo(x - 10, y + SH + 10);
      for (let xx = x - 10; xx <= x + L.sw + 20; xx += 20) ctx.lineTo(xx, y + SH * f + Math.sin(xx * 0.02 + li * 2 + w.seed) * 9);
      ctx.lineTo(x + L.sw + 20, y + SH + 10);
      ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
    });
    const r = P.rng(w.seed);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 80; i++) ctx.fillRect(x + r() * L.sw, y + r() * SH, 3, 3);
    ctx.fillStyle = 'rgba(40,20,30,0.1)';
    for (let i = 0; i < 60; i++) ctx.fillRect(x + r() * L.sw, y + r() * SH, 3, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x, y, L.sw, 16);
    ctx.restore();
    P.text(ctx, w.w, 543, SY + 4, { size: w.size, font: 'mono', color: 'rgba(255,255,255,0.6)', shadow: false });
    P.text(ctx, w.w, 540, SY, { size: w.size, font: 'mono', color: w.ink, shadow: false });
  }

  /** knife with its tip at (x, y), held by Clawd's very long arm */
  function knife(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.05);
    P.rect(ctx, -30, -400, 60, 170, P.C.brown, { radius: 20, seed: 61 });
    P.dot(ctx, 0, -360, 7, '#e9dcc8'); P.dot(ctx, 0, -290, 7, '#e9dcc8');
    P.rect(ctx, -42, -246, 84, 26, '#9aa3b2', { radius: 8, seed: 62 });
    P.poly(ctx, [[-38, -224], [38, -224], [34, -84], [0, 0], [-34, -84]], '#e3e8ef', { seed: 63, amp: 1.5 });
    ctx.save();
    ctx.beginPath(); ctx.moveTo(0, -224); ctx.lineTo(38, -224); ctx.lineTo(34, -84); ctx.lineTo(0, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(120,135,160,0.35)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-20, -200); ctx.lineTo(-18, -110); ctx.stroke();
    ctx.restore();
    P.arm(ctx, 10, -390, 560, -1300, 74);
    ctx.restore();
  }

  function bladeAt(w, L, lt) {
    const { ease, prog, lerp } = P;
    const down = Math.min(0.1, w.gap * 0.25), up = w.gap * 0.4;
    const bx = w.cutT.map((tc, c) => L.cuts[c] + pieceDX(w, c, tc));
    const kf = [[0, REST[0], REST[1]]];
    w.cutT.forEach((tc, c) => kf.push([tc - down, bx[c], 740], [tc, bx[c], BOARD], [tc + 0.04, bx[c], BOARD], [tc + up, bx[c], 740]));
    kf.push([w.cutT[w.ncut - 1] + 0.6, REST[0], REST[1]], [w.len, REST[0], REST[1]]);
    for (let i = 0; i < kf.length - 1; i++) {
      const [ta, xa, ya] = kf[i], [tb, xb, yb] = kf[i + 1];
      if (lt <= tb) {
        const p = tb > ta ? prog(lt, ta, tb - ta) : 1;
        const e = yb > ya ? ease.inCubic(p) : ease.inOutCubic(p);
        return [lerp(xa, xb, e), lerp(ya, yb, e)];
      }
    }
    return REST;
  }

  function slice() {
    SFX.noise(0.2, { filter: 'bandpass', freq: 5500, slide: 1200, q: 1.3, vol: 0.12 });
    SFX.noise(0.12, { filter: 'lowpass', freq: 900, slide: 180, vol: 0.2, when: 0.02 });
    for (let g = 0; g < 5; g++) SFX.noise(0.025, { filter: 'bandpass', freq: 1800 + Math.random() * 2600, q: 3, vol: 0.08, when: 0.03 + g * 0.022 + Math.random() * 0.01 });
    SFX.tone(150, 0.08, { type: 'sine', slide: 70, vol: 0.13, when: 0.01 });
  }

  ClaudeTok.register({
    author: '@token.cutter',
    caption: 'kinetic sand but it\'s your prompt getting tokenized 🔪🤤 (strawberry has how many r\'s?) #asmr #kineticsand #tokenizer #bpe',
    sound: 'crunchy byte-pair encoding · token.cutter',
    avatar: '🔪',
    avatarColor: '#E0607E',
    duration: DUR,
    bg: '#F4DCCB',
    thumb: 1.9,
    likes: '5.1M', commentCount: '88K', saves: '1.2M', shares: '402K',
    comments: [
      '@bpe.merges: "idis" is carrying this whole word',
      ['strawberry', 'there are 3 r\'s. i will not be taking questions'],
      '@context.window: that last one cost me 6 tokens and my peace',
    ],

    draw(ctx, t, env) {
      const { C, ease, prog, pulse } = P;
      let wi = WORDS.length - 1;
      for (let i = 0; i < WORDS.length; i++) if (t < WORDS[i].S + WORDS[i].len) { wi = i; break; }
      const w = WORDS[wi];
      const lt = t - w.S;
      const L = layout(ctx, w);

      // ---- kitchen counter
      P.stripes(ctx, '#f6e3d3', '#f1d8c6', 70);
      P.gingham(ctx, 0, 1060, 1080, 860, '#F2B8C6', 70);
      ctx.save(); ctx.fillStyle = 'rgba(120,60,70,0.12)'; ctx.fillRect(0, 1060, 1080, 14); ctx.restore();
      ctx.save();
      let punch = 0;
      w.cutT.forEach((tc) => { punch += pulse(lt, tc, 0.16); });
      if (punch > 0) P.zoom(ctx, 1 + 0.015 * punch, 540, SY);
      P.rect(ctx, 50, BOARD - 4, 980, 84, C.wood, { radius: 26, seed: 44 });
      ctx.save(); ctx.strokeStyle = 'rgba(90,50,20,0.18)'; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(90, BOARD + 14 + i * 16); ctx.lineTo(990, BOARD + 16 + i * 16 + Math.sin(i) * 4); ctx.stroke(); }
      ctx.restore();

      // ---- slab pieces (uncut neighbours are drawn together, so there is no seam)
      const sweepRot = -0.2 * ease.inCubic(prog(lt, w.sweepT, 0.42));
      let a = 0;
      while (a < w.n) {
        let b = a;
        while (b < w.ncut && lt < w.cutT[b]) b++;
        const x0 = L.edges[a], x1 = L.edges[b + 1];
        const dx = pieceDX(w, a, lt);
        const dy = -26 * pulse(lt, w.spreadT + a * 0.05, 0.35);
        const wob = (a > 0 ? jig(lt - w.cutT[a - 1]) : 0) + (b < w.ncut ? jig(lt - w.cutT[b]) : 0) + jig(lt - w.spreadT) * 0.6;
        const pcx = (x0 + x1) / 2;
        ctx.save();
        ctx.translate(pcx + dx, SB + dy);
        ctx.rotate(sweepRot * (1 + a * 0.2));
        ctx.scale(1 + wob, 1 - wob);
        ctx.translate(-pcx, -SB);
        ctx.beginPath(); ctx.rect(x0, SY - 220, x1 - x0, 440); ctx.clip();
        slab(ctx, w, L);
        // fresh cut faces
        ctx.fillStyle = 'rgba(60,20,40,0.14)';
        if (a > 0) ctx.fillRect(x0, SY - SH / 2 + 6, 9, SH - 12);
        if (b < w.ncut && lt >= w.cutT[b]) ctx.fillRect(x1 - 9, SY - SH / 2 + 6, 9, SH - 12);
        ctx.restore();
        a = b + 1;
      }

      // ---- crumbs
      const sweepX = -1500 * ease.inCubic(prog(lt, w.sweepT, 0.42));
      w.cutT.forEach((tc, c) => {
        const ct = lt - tc;
        if (ct < 0) return;
        const bx = L.cuts[c] + pieceDX(w, c, tc);
        for (let i = 0; i < 8; i++) {
          const h1 = P.hash(c * 31 + i + w.seed), h2 = P.hash(c * 57 + i * 3 + w.seed * 2);
          const x0 = bx + (h1 - 0.5) * 20, y0 = SY - SH / 2 + 20 + h2 * (SH - 40);
          const vx = (h1 - 0.5) * 380, vy = -60 - h2 * 220, g = 1600;
          const tl = (-vy + Math.sqrt(vy * vy + 2 * g * (BOARD - 6 - y0))) / g;
          const te = Math.min(ct, tl);
          P.dot(ctx, x0 + vx * te + sweepX, y0 + vy * te + 0.5 * g * te * te, 4 + h2 * 5, w.cols[i % 3]);
        }
      });

      // ---- token IDs pop above each piece
      w.toks.forEach((tk, k) => {
        const tp = ease.outBack(prog(lt, w.idsT + k * 0.1, 0.3));
        if (tp <= 0.01) return;
        const cx = 540 - L.tw / 2 + (w.start[k] + tk.length / 2) * L.cw + pieceDX(w, k, lt);
        const cy = SY - SH / 2 - 60 - (w.n > 3 && k % 2 ? 66 : 0) - 26 * pulse(lt, w.spreadT + k * 0.05, 0.35);
        const label = String(w.ids[k]);
        const tw = P.measure(ctx, label, { size: 30, font: 'mono' }) + 30;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate((k % 2 ? 0.05 : -0.05) + sweepRot); ctx.scale(tp, tp);
        ctx.beginPath(); ctx.moveTo(-12, 22); ctx.lineTo(0, 40); ctx.lineTo(12, 22); ctx.closePath();
        P.cut(ctx, C.paper, { rim: false, shadow: { blur: 6, dy: 4, alpha: 0.2 } });
        P.rect(ctx, -tw / 2, -26, tw, 52, C.paper, { radius: 12, seed: 70 + k, shadow: { blur: 6, dy: 4, alpha: 0.2 } });
        P.text(ctx, label, 0, 1, { size: 30, font: 'mono', color: w.ink, shadow: false });
        ctx.restore();
      });

      // ---- the knife
      const [kx, ky] = bladeAt(w, L, lt);
      knife(ctx, kx, ky);
      ctx.restore(); // zoom

      // ---- token counter
      let made = 0;
      w.cutT.forEach((tc) => { if (lt >= tc) made++; });
      const lastCut = made ? w.cutT[made - 1] : -9;
      const cp = ease.outBack(prog(t, 0.2, 0.4)) * (1 + 0.25 * pulse(lt, lastCut, 0.22));
      ctx.save(); ctx.translate(540, 360); ctx.scale(cp, cp); ctx.rotate(-0.02);
      P.rect(ctx, -200, -46, 400, 92, made === w.ncut ? C.ink : C.paper, { radius: 22, seed: 9 });
      P.text(ctx, `tokens: ${made + 1}`, 0, 2, { size: 50, font: 'mono', color: made === w.ncut ? C.yellow : C.ink, shadow: false });
      ctx.restore();

      // ---- gags
      let bubble = null, mood = 'happy';
      if (wi === 0 && lt > w.spreadT + 0.2 && lt < w.sweepT + 0.2) bubble = ['crunchy 🤤', w.spreadT + 0.2];
      if (wi === 1 && lt > w.idsT + 0.45 && lt < w.sweepT + 0.3) { bubble = ["so... 2 r's? 🍓", w.idsT + 0.45]; mood = 'side'; }
      if (wi === 2) {
        const tt = ease.outBack(prog(lt, w.spreadT + 0.7, 0.4)) * (1 - ease.inCubic(prog(lt, w.sweepT, 0.3)));
        if (tt > 0.01) {
          ctx.save(); P.shake(ctx, t, 8 * (1 - prog(lt, w.spreadT + 0.7, 0.3)));
          P.title(ctx, '6 tokens?!', 540, 575, { size: 120, color: C.rose, rot: -0.05, pop: tt });
          ctx.restore();
        }
        if (lt > w.spreadT + 0.9 && lt < w.sweepT + 0.2) { bubble = ['for ONE word', w.spreadT + 0.9]; mood = 'wow'; }
        if (env.at(w.S + w.spreadT + 0.7)) SFX.boing({ vol: 0.18 });
      }
      let sq = 0;
      w.cutT.forEach((tc) => { sq += pulse(lt, tc, 0.18) * 0.35; });
      P.claude(ctx, 170, 1330 + Math.sin(t * 2.2) * 5, 100, { t, mood: sq > 0.1 ? 'wink' : mood, squash: sq, blink: pulse(t, 2.3, 0.15) + pulse(t, 7.9, 0.15) });
      if (bubble) P.bubble(ctx, bubble[0], 520, 1250, 270, 1310, { size: 52, pop: ease.outBack(prog(lt, bubble[1], 0.3)) });

      P.sticker(ctx, 'cutting words into tokens 🔪', 70, 1540, { pop: ease.outBack(prog(t, 0.3, 0.4)) });

      // ---- sounds
      if (env.at(w.S + 0.02)) SFX.noise(0.45, { filter: 'lowpass', freq: 500, slide: 1500, vol: 0.07 });
      if (env.at(w.S + 0.45)) SFX.thud({ vol: 0.16 });
      w.cutT.forEach((tc) => {
        if (env.at(w.S + tc - 0.08)) SFX.noise(0.08, { filter: 'highpass', freq: 3500, vol: 0.04 });
        if (env.at(w.S + tc)) slice();
      });
      w.toks.forEach((_, k) => { if (env.at(w.S + w.idsT + k * 0.1)) SFX.pop({ f: 480 + k * 90, vol: 0.1 }); });
      if (env.at(w.S + w.sweepT)) SFX.swoosh({ vol: 0.12 });
    },
  });
})();
