/* Clawd the Magnificent pulls citations out of a hat. The fact-check bot is
 * not okay. [citation needed]. */
(function () {
  const D = 10;
  const HAT_X = 560, HAT_Y = 1150;       // hat opening
  const SHOW_X = 430, SHOW_Y = 740;      // where a citation is presented
  const CLAWD_X = 270, CLAWD_Y = 1180, CR = 120;
  const BOT_X = 800;
  const STAMP = 7.6;
  const RESET = 9.25;
  const S = [0.15, 1.45, 2.7, 3.9, 5.05, 6.2];
  const CARDS = [
    { t1: 'Smith et al. (2031)', t2: 'Nature, probably' },
    { t1: 'Journal of Things\nI Made Up', t2: 'vol. ∞, pp. 1–∞' },
    { t1: 'Dr. Source, PhD', t2: '"trust me bro" (2024)' },
    { t1: 'arXiv:9999.99999', t2: '"True If Said Confidently"' },
    { rabbit: true },
    { t1: 'this video', t2: '(Clawd, 2026) [self-cited]' },
  ];
  const TADA = ['ta-da!', 'behold!', 'peer reviewed*', 'very real', '✨ DOI ✨', 'me, cited'];
  const BOT_SAYS = ['2031??', "that's not\na journal", 'trust WHO?', "that's not how\narXiv works", "THAT'S A\nRABBIT", "YOU CAN'T\nCITE YOURSELF"];
  const BOT_MOOD = ['smile', 'sus', 'sus', 'wow', 'angry', 'wow', 'angry'];
  const SLOTS = (() => {
    const r = P.rng(31);
    return CARDS.map((_, k) => ({ x: 150 + k * 156, y: 478 + (k % 2) * 26, rot: (r() - 0.5) * 0.4 }));
  })();
  const size = c => (c.rabbit ? [260, 300] : [440, 210]);

  function drawCard(ctx, c, k, x, y, rot, s) {
    const { C } = P;
    const [w, h] = size(c);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (c.rabbit) {
      P.arm(ctx, -30, -100, -52, -205, 40, '#fff');
      P.arm(ctx, 30, -100, 50, -205, 40, '#fff');
      P.arm(ctx, -34, -115, -48, -190, 16, C.pink);
      P.arm(ctx, 34, -115, 46, -190, 16, C.pink);
      P.circle(ctx, 0, 60, 88, '#fff', { seed: 40 });
      P.circle(ctx, 0, -50, 66, '#fff', { seed: 41 });
      P.face(ctx, 0, -48, 56, 'happy');
      P.dot(ctx, 0, -32, 8, C.rose);
      ctx.save(); ctx.rotate(-0.06);
      P.rect(ctx, -125, 20, 250, 96, C.yellow, { radius: 10, seed: 42 });
      P.text(ctx, 'doi:10.1234/\nbunny', 0, 68, { size: 28, font: 'mono', color: C.ink, shadow: false });
      ctx.restore();
      P.circle(ctx, -95, 60, 24, '#fff', { seed: 43 });
      P.circle(ctx, 95, 60, 24, '#fff', { seed: 44 });
    } else {
      P.rect(ctx, -w / 2, -h / 2, w, h, C.paper, { radius: 10, seed: 50 + k });
      ctx.fillStyle = 'rgba(79,127,217,0.18)';
      for (let j = 0; j < 4; j++) ctx.fillRect(-w / 2 + 16, -h / 2 + 70 + j * 34, w - 32, 3);
      ctx.fillStyle = 'rgba(224,72,78,0.5)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 54, w - 32, 4);
      const multi = c.t1.includes('\n');
      P.text(ctx, c.t1, 0, multi ? -30 : -h / 2 + 30 + 4, { size: multi ? 38 : 44, font: 'marker', color: C.ink, shadow: false, lineHeight: 1 });
      P.text(ctx, c.t2, 0, multi ? 62 : 26, { size: 32, font: 'hand', color: '#6d6275', shadow: false, maxWidth: w - 30 });
      if (!multi) P.text(ctx, `[${k + 1}]`, w / 2 - 34, h / 2 - 28, { size: 26, font: 'mono', color: C.blue, shadow: false });
    }
    ctx.restore();
  }

  // position of citation k at time t (null = not visible)
  function cardAt(k, t) {
    const { ease, prog, lerp } = P;
    const s = S[k], c = CARDS[k], [, h] = size(c), sl = SLOTS[k];
    if (t >= RESET) {
      const p = ease.inCubic(prog(t, RESET + k * 0.07, 0.4));
      if (p >= 1) return null;
      return { x: lerp(sl.x, HAT_X, p), y: lerp(sl.y, HAT_Y - 20, p), rot: sl.rot + p * 6, s: lerp(0.36, 0.05, p), clip: false };
    }
    if (t < s + 0.35) return null;
    if (t < s + 0.85) {
      const p = ease.outBack(prog(t, s + 0.35, 0.5));
      return { x: lerp(HAT_X, SHOW_X, p), y: lerp(HAT_Y + h / 2, SHOW_Y, p), rot: (1 - p) * 0.3, s: 1, clip: true };
    }
    if (t < s + 1.35) return { x: SHOW_X, y: SHOW_Y + Math.sin(t * 5) * 6, rot: Math.sin(t * 6) * 0.04, s: 1 + 0.06 * P.pulse(t, s + 0.85, 0.25), clip: false };
    const p = ease.inOutCubic(prog(t, s + 1.35, 0.35));
    return { x: lerp(SHOW_X, sl.x, p), y: lerp(SHOW_Y, sl.y, p), rot: lerp(0, sl.rot, p), s: lerp(1, 0.36, p), clip: false };
  }

  function wandTip(t) {
    const { ease, prog, lerp } = P;
    const rest = [450, 1060 + Math.sin(t * 3) * 10];
    let k = -1; for (let i = 0; i < S.length; i++) if (t >= S[i]) k = i;
    if (k < 0 || t >= STAMP - 0.2) return rest;
    const lt = t - S[k];
    const tap = [520, 1090], raise = [410, 900];
    if (lt < 0.35) { const p = ease.inOutCubic(lt / 0.35); return [lerp(rest[0], tap[0], p), lerp(rest[1], tap[1], p)]; }
    if (lt < 0.85) { const p = ease.outCubic((lt - 0.35) / 0.5); return [lerp(tap[0], raise[0], p) + Math.sin(t * 30) * 8, lerp(tap[1], raise[1], p)]; }
    if (lt < 1.15) return [raise[0] + Math.sin(t * 12) * 14, raise[1]];
    const p = ease.inOutCubic(prog(lt, 1.15, 0.25));
    return [lerp(raise[0], rest[0], p), lerp(raise[1], rest[1], p)];
  }

  function stamp(ctx, x, y, rot) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    P.rect(ctx, -42, -190, 84, 110, C.wood, { radius: 14, seed: 60 });
    P.circle(ctx, 0, -215, 66, C.red, { seed: 61 });
    P.rect(ctx, -230, -92, 460, 80, '#6b4a33', { radius: 14, seed: 62 });
    P.rect(ctx, -220, -20, 440, 22, '#b3263a', { radius: 6, seed: 63, shadow: false });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@source.trust.me',
    caption: 'every citation is real if you believe hard enough 🎩✨ #hallucination #citationneeded #trustmebro #agentlife',
    sound: 'magic show but the sources are fake · source.trust.me',
    avatar: '🎩',
    avatarColor: '#A3243B',
    duration: D,
    bg: '#2a1633',
    thumb: 5.9,
    likes: '4.2M', commentCount: '93.1K', saves: '404K', shares: '221K',
    comments: [
      '@reviewer.2: absolutely not',
      ['doi.org', '404 bunny not found'],
      '@smith.et.al: i have not even written this yet',
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t >= STAMP - 0.1 && env.t < RESET) return;
      const arp = ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'G#3', 'B3'];
      SFX.pluck(arp[step % 8], { vol: 0.06 });
      if (step % 4 === 0) SFX.bass('A2', 0.3, { vol: 0.12 });
      if (step % 2 === 1) SFX.hat({ vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;
      let level = 0;
      S.forEach(s => { if (t >= s + 0.85) level++; });
      if (t >= RESET + 0.15) level = 0;

      ctx.save();
      if (t >= STAMP) P.shake(ctx, t, 22 * (1 - prog(t, STAMP, 0.35)));

      /* ---------- stage ---------- */
      P.stripes(ctx, '#3a1f47', '#33193f', 60);
      const beam = ctx.createRadialGradient(540, 1050, 60, 540, 1050, 700);
      beam.addColorStop(0, 'rgba(255,236,190,0.32)'); beam.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.save(); ctx.fillStyle = beam; ctx.fillRect(0, 0, P.W, P.H); ctx.restore();
      P.stars(ctx, t, 9, 18, C.yellow, [200, 560, 680, 300]);
      P.rect(ctx, -20, 1390, 1120, 560, C.wood, { radius: 6, seed: 2 });
      ctx.fillStyle = 'rgba(90,50,30,0.25)';
      for (let y = 1450; y < 1920; y += 70) ctx.fillRect(0, y, 1080, 5);
      const sway = Math.sin(t * 1.1) * 10;
      P.poly(ctx, [[0, 300], [190, 300], [130 + sway, 1420], [0, 1420]], '#a3243b', { seed: 3 });
      P.poly(ctx, [[890, 300], [1080, 300], [1080, 1420], [955 + sway, 1420]], '#a3243b', { seed: 4 });
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      [50, 110].forEach(x => ctx.fillRect(x, 300, 14, 1100));
      [960, 1020].forEach(x => ctx.fillRect(x, 300, 14, 1100));
      P.rect(ctx, -20, 270, 1120, 60, '#8a1c30', { radius: 6, seed: 5 });
      for (let x = 0; x <= 1080; x += 90) P.circle(ctx, x + 45, 330, 45, '#8a1c30', { seed: 6 + x, shadow: false, ry: 30 });
      P.text(ctx, 'sources:', 90, 420, { size: 30, font: 'mono', align: 'left', color: '#f6d9e2', shadow: false });

      /* ---------- table + hat ---------- */
      P.rect(ctx, 420, 1316, 280, 28, C.wood, { radius: 8, seed: 7 });
      P.poly(ctx, [[410, 1330], [710, 1330], [745, 1445], [375, 1445]], C.purple, { seed: 8 });
      [[470, 1380], [560, 1405], [650, 1372]].forEach(([x, y], i) => P.star(ctx, x, y, 18, C.yellow, { shadow: false, rot: i }));
      P.poly(ctx, [[470, HAT_Y], [650, HAT_Y], [638, 1320], [482, 1320]], '#1e1a24', { seed: 9 });
      P.poly(ctx, [[478, 1250], [644, 1250], [641, 1282], [480, 1282]], C.red, { seed: 10, shadow: false });
      P.circle(ctx, HAT_X, HAT_Y, 132, '#1e1a24', { ry: 28, seed: 11 });
      P.circle(ctx, HAT_X, HAT_Y - 2, 94, '#0b0810', { ry: 18, seed: 12, shadow: false });

      // sparkles swirling over the hat
      for (let i = 0; i < 6; i++) {
        const a = t * 2.2 + i * P.TAU / 6;
        const tw = 0.5 + 0.5 * Math.sin(t * 7 + i * 2);
        P.star(ctx, HAT_X + Math.cos(a) * 170, HAT_Y - 60 + Math.sin(a) * 40, 10 + 14 * tw, i % 2 ? C.yellow : '#fff', { shadow: false, rot: t * 3 });
      }

      // citations mid-pull (emerging from the hat) and presented
      CARDS.forEach((c, k) => {
        const st = cardAt(k, t);
        if (!st || st.s < 0.5) return;
        if (st.clip) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, P.W, HAT_Y); ctx.clip(); }
        drawCard(ctx, c, k, st.x, st.y, st.rot, st.s);
        if (st.clip) ctx.restore();
        if (st.clip) for (let j = 0; j < 4; j++) {
          const lt = ((t * 3 + j / 4) % 1);
          P.star(ctx, st.x + Math.sin(j * 2.3 + t * 4) * 180, lerp(HAT_Y - 20, st.y, lt), 14 * (1 - lt), C.yellow, { shadow: false });
        }
      });

      /* ---------- Clawd the Magnificent ---------- */
      let mood = 'happy';
      const presenting = S.some(s => t >= s + 0.85 && t < s + 1.35);
      if (presenting) mood = 'wink';
      if (t >= STAMP && t < RESET) mood = t < STAMP + 0.6 ? 'wow' : 'sad';
      const bow = pulse(t, RESET, 0.8);
      const hop = S.reduce((m, s) => Math.max(m, pulse(t, s + 0.85, 0.3)), 0);
      ctx.save();
      ctx.translate(CLAWD_X, CLAWD_Y); ctx.rotate(bow * 0.4); ctx.translate(-CLAWD_X, -CLAWD_Y);
      P.claude(ctx, CLAWD_X, CLAWD_Y - hop * 30, CR, { t, mood, blink: pulse(t, 3.4, 0.15) });
      // top hat
      const hx = CLAWD_X, hy = CLAWD_Y - hop * 30 - CR * 0.92 - hop * 30 - bow * 40;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.14 - bow * 0.5);
      P.rect(ctx, -58, -130, 116, 130, '#1e1a24', { radius: 10, seed: 13 });
      P.rect(ctx, -58, -34, 116, 22, C.red, { radius: 4, seed: 14, shadow: false });
      P.circle(ctx, 0, 0, 92, '#1e1a24', { ry: 16, seed: 15 });
      ctx.restore();
      ctx.restore();

      // arm + wand
      const [tx, ty] = wandTip(t);
      const sx = CLAWD_X + 60, sy = CLAWD_Y + 10;
      P.arm(ctx, sx, sy, tx, ty, 44);
      const dl = Math.hypot(tx - sx, ty - sy) || 1;
      const ux = (tx - sx) / dl, uy = (ty - sy) / dl;
      ctx.beginPath(); P.capsulePath(ctx, tx, ty, tx + ux * 120, ty + uy * 120, 18); P.cut(ctx, '#1e1a24', { rim: false });
      P.circle(ctx, tx + ux * 128, ty + uy * 128, 13, '#fff', { shadow: false });
      if (presenting) P.burstLines(ctx, tx + ux * 128, ty + uy * 128, 30, (t * 3) % 1, C.yellow, 8, 5);

      /* ---------- fact-check bot ---------- */
      const shakeAmt = level * 2.5 + (t >= STAMP - 0.4 && t < STAMP ? 8 : 0);
      const bx = BOT_X + (P.hash(P.boil(t, 30)) - 0.5) * shakeAmt * 2;
      P.rect(ctx, bx - 82, 1340, 164, 58, '#3b3447', { radius: 26, seed: 20 });
      [-50, 0, 50].forEach(o => P.dot(ctx, bx + o, 1369, 14, '#8a8494'));
      P.rect(ctx, bx - 70, 1150, 140, 196, '#b9c6d3', { radius: 18, seed: 21 });
      P.rect(ctx, bx - 50, 1190, 100, 70, C.paper, { radius: 8, seed: 22, shadow: false });
      P.text(ctx, 'FACT\nCHECK', bx, 1226, { size: 22, font: 'mono', color: C.ink, shadow: false, lineHeight: 1.1 });
      ctx.save(); ctx.strokeStyle = '#8a8494'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, 1015); ctx.lineTo(bx + Math.sin(t * 9) * level * 3, 968); ctx.stroke(); ctx.restore();
      const alarm = level >= 3 && P.boil(t, 8) % 2;
      P.circle(ctx, bx + Math.sin(t * 9) * level * 3, 960, 18, level === 0 ? C.green : level < 3 ? C.yellow : alarm ? C.red : '#ff9a9a', { seed: 23 });
      P.rect(ctx, bx - 68, 1012, 136, 124, '#b9c6d3', { radius: 20, seed: 24 });
      P.rect(ctx, bx - 56, 1024, 112, 100, '#2b2640', { radius: 14, seed: 25, shadow: false });
      P.face(ctx, bx, 1076, 60, BOT_MOOD[level], { ink: C.mint, blush: false, skin: '#2b2640' });
      if (level >= 4 && t < RESET) {
        const lt = (t * 1.6) % 1;
        ctx.save(); ctx.globalAlpha = 1 - lt;
        P.circle(ctx, bx + 78 + lt * 20, 1030 + lt * 60, 12, C.sky, { shadow: false, ry: 16 });
        ctx.restore();
      }
      if (level >= 6 && t < RESET) for (let j = 0; j < 3; j++) {
        const lt = ((t * 1.3 + j / 3) % 1);
        ctx.save(); ctx.globalAlpha = 0.8 * (1 - lt);
        P.circle(ctx, bx - 40 + j * 40, 1000 - lt * 120, 20 + lt * 26, '#eee', { shadow: false, seed: j });
        ctx.restore();
      }

      // "ta-da!" + bot objections
      S.forEach((s, k) => {
        const p = ease.outBack(prog(t, s + 0.85, 0.25)) * (1 - prog(t, s + 1.2, 0.15));
        if (p > 0) P.title(ctx, TADA[k], SHOW_X, 590, { size: 66, color: C.yellow, stroke: C.purple, strokeWidth: 12, rot: -0.08, pop: p });
        const end = k < S.length - 1 ? S[k + 1] + 0.95 : STAMP;
        if (t >= s + 0.95 && t < end) {
          P.bubble(ctx, BOT_SAYS[k], 790, 885, BOT_X, 1000, { size: k >= 4 ? 44 : 42, font: k >= 4 ? 'bubble' : 'hand', color: k >= 4 ? C.red : C.ink, pop: ease.outBack(prog(t, s + 0.95, 0.2)), seed: 70 + k });
        }
      });

      /* ---------- the bibliography shelf ---------- */
      CARDS.forEach((c, k) => {
        const st = cardAt(k, t);
        if (st && st.s < 0.5) drawCard(ctx, c, k, st.x, st.y, st.rot, st.s);
      });

      /* ---------- [citation needed] ---------- */
      if (t >= STAMP && t < RESET + 0.4) {
        const fade = 1 - prog(t, RESET, 0.35);
        const sc = lerp(1.18, 1, ease.outCubic(prog(t, STAMP, 0.15)));
        ctx.save();
        ctx.globalAlpha = 0.92 * fade;
        ctx.translate(540, 900); ctx.rotate(-0.1); ctx.scale(sc, sc);
        P.wobblyRect(ctx, -410, -95, 820, 190, 80, 5, 26);
        ctx.strokeStyle = '#d42a3c'; ctx.lineWidth = 14; ctx.stroke();
        P.text(ctx, '[citation needed]', 0, 4, { size: 88, font: 'bubble', color: '#d42a3c', shadow: false });
        ctx.restore();
        P.burstLines(ctx, 540, 900, 420, prog(t, STAMP, 0.4), C.yellow, 14, 12);
      }
      // the stamp itself, swung by the bot's stretchy arm
      if (t >= STAMP - 0.35 && t < 8.3) {
        const down = ease.inCubic(prog(t, STAMP - 0.3, 0.3));
        const upp = ease.outCubic(prog(t, 7.85, 0.4));
        const sy2 = lerp(lerp(-120, 1000, down), -300, upp);
        const sx2 = 540;
        P.arm(ctx, BOT_X - 40, 1180, sx2 + 40, sy2 - 215, 34, '#9aa7b4');
        stamp(ctx, sx2, sy2, -0.1);
      }
      if (t >= STAMP && t < STAMP + 0.12) P.flash(ctx, 0.5 * (1 - prog(t, STAMP, 0.12)));
      ctx.restore(); // shake

      // caption sticker
      if (t < STAMP) P.sticker(ctx, 'trust me, i have sources ✨', 70, 1540, { pop: ease.outBack(prog(t, 0.1, 0.4)) });
      else P.sticker(ctx, 'pov: the user asked for sources', 70, 1540, { pop: ease.outBack(prog(t, STAMP + 0.3, 0.4)), rot: 0.02 });

      /* ---------- sound ---------- */
      S.forEach((s, k) => {
        if (env.at(s)) SFX.whoosh({ vol: 0.1, dur: 0.3 });
        if (env.at(s + 0.35)) SFX.tone(420, 0.45, { type: 'sine', slide: 1300, vol: 0.1 });
        if (env.at(s + 0.85)) {
          if (CARDS[k].rabbit) { SFX.boing({ vol: 0.2 }); SFX.chirp({ when: 0.12 }); } else SFX.chime({ vol: 0.09 });
        }
        if (env.at(s + 0.95)) { if (k >= 3) SFX.error({ vol: 0.07 }); else SFX.blip(520 + k * 160, { vol: 0.06 }); }
      });
      if (env.at(STAMP - 0.3)) SFX.swoosh({ vol: 0.18 });
      if (env.at(STAMP)) { SFX.thud({ vol: 0.5 }); SFX.kick({ vol: 0.4 }); SFX.noise(0.3, { freq: 800, vol: 0.22 }); }
      if (env.at(STAMP + 0.45)) SFX.fail({ vol: 0.12 });
      if (env.at(RESET)) SFX.swoosh({ vol: 0.15 });
      if (env.at(RESET + 0.5)) SFX.pop({ vol: 0.12 });
    },
  });
})();
