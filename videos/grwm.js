/* GRWM: Clawd does the full vanity routine for a user request.
 * Serum, bash hat, {} earrings, context perfume, twirl, slay... then "nvm". */
(function () {
  const TAU = Math.PI * 2;
  const S1 = 1.4, S2 = 3.2, S3 = 5.0, S4 = 6.8, READY = 8.3, NVM = 9.0, OFF = 9.65;
  const SPRITZ = [S3 + 0.55, S3 + 0.95, S3 + 1.35];
  const DROPS = [S1 + 0.55, S1 + 0.85, S1 + 1.15];
  const MIST_WORDS = ['README.md', 'CLAUDE.md', 'git log', 'package.json', 'src/**', 'tests/',
    'user vibes', '.env (jk)', 'TODO.md', 'diff', 'lockfile', 'prefs'];

  /* ---------- local helpers ---------- */
  function ringLight(ctx, t, on) {
    const x = 540, y = 800, R = 370;
    P.rect(ctx, x - 16, y + R, 32, 470, '#bdb2b8', { radius: 12, seed: 31 });
    if (on) {
      ctx.save();
      const g = ctx.createRadialGradient(x, y, R * 0.5, x, y, R * 1.8);
      g.addColorStop(0, 'rgba(255,248,225,0.55)'); g.addColorStop(1, 'rgba(255,248,225,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(x, y, R + 44, 0, TAU);
    ctx.moveTo(x + R - 44, y);
    ctx.arc(x, y, R - 44, 0, TAU, true);
    P.cut(ctx, on ? '#FFF8EA' : '#D8CDD2', { shadow: { blur: on ? 36 : 14, dy: on ? 2 : 8, alpha: 0.25 } });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      const tw = 0.75 + 0.25 * Math.sin(t * 5 + i);
      P.dot(ctx, x + Math.cos(a) * R, y + Math.sin(a) * R, 11, on ? `rgba(255,205,110,${tw})` : '#c3b7bd');
    }
  }

  function polaroid(ctx, x, y, rot, seed, bg, inner) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    P.rect(ctx, -70, -80, 140, 168, '#fff', { radius: 4, seed });
    P.rect(ctx, -58, -68, 116, 112, bg, { radius: 2, seed: seed + 1, shadow: false });
    inner();
    ctx.fillStyle = 'rgba(255,236,190,0.75)';
    ctx.fillRect(-32, -96, 64, 28);
    ctx.restore();
  }

  function pipette(ctx, x, y, rot, squeeze) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.save(); ctx.globalAlpha = 0.8;
    P.rect(ctx, -10, -10, 20, 100, '#D6EEF7', { radius: 10, seed: 51, shadow: false, amp: 1.5 });
    ctx.restore();
    P.rect(ctx, -6, 44, 12, 42, C_GOLD, { radius: 6, seed: 52, shadow: false, amp: 1 });
    P.rect(ctx, -22, -26, 44, 24, P.C.paper, { radius: 6, seed: 53 });
    P.circle(ctx, 0, -52, 26, P.C.rose, { ry: 34 * (1 - squeeze * 0.35), seed: 54 });
    ctx.restore();
  }
  const C_GOLD = '#F5C84B';

  function serumBottle(ctx, x, y) {
    const { C } = P;
    P.rect(ctx, x - 20, y - 180, 40, 40, '#f7c9d4', { radius: 6, seed: 55 });
    P.rect(ctx, x - 58, y - 150, 116, 160, '#F2B8C6', { radius: 22, seed: 56 });
    P.rect(ctx, x - 46, y - 110, 92, 84, C.paper, { radius: 6, seed: 57, shadow: false });
    P.text(ctx, 'SYSTEM\nPROMPT', x, y - 80, { size: 22, font: 'bubble', color: C.rose, shadow: false, lineHeight: 1 });
    P.text(ctx, 'serum', x, y - 42, { size: 24, font: 'hand', color: C.ink, shadow: false });
  }

  function perfume(ctx, x, y, rot, squeeze) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    // atomizer tube + bulb (on the right)
    ctx.save();
    ctx.strokeStyle = '#b89bd8'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(18, -100); ctx.quadraticCurveTo(70, -118, 86, -64); ctx.stroke();
    ctx.restore();
    P.circle(ctx, 92, -44, 30 * (1 - squeeze * 0.3), C.rose, { ry: 36 * (1 - squeeze * 0.2), seed: 71 });
    P.rect(ctx, 86, -12, 12, 30, C.mustard, { radius: 5, seed: 72, shadow: false }); // tassel
    // nozzle + neck
    P.rect(ctx, -26, -118, 52, 34, C.mustard, { radius: 8, seed: 73 });
    P.dot(ctx, -26, -101, 5, C.ink);
    P.rect(ctx, -18, -90, 36, 22, '#e6dcf5', { radius: 4, seed: 74, shadow: false });
    // faceted body
    P.poly(ctx, [[-48, -72], [48, -72], [74, -30], [74, 50], [48, 76], [-48, 76], [-74, 50], [-74, -30]], '#C9B6FF', { seed: 75, amp: 2 });
    ctx.save(); ctx.globalAlpha = 0.35;
    P.poly(ctx, [[-40, -60], [-10, -60], [-46, 60], [-62, 40]], '#fff', { seed: 76, shadow: false, rim: false });
    ctx.restore();
    P.rect(ctx, -46, -26, 92, 62, C.paper, { radius: 4, seed: 77, shadow: false });
    P.text(ctx, 'CONTEXT', 0, -8, { size: 20, font: 'bubble', color: C.purple, shadow: false });
    P.text(ctx, 'n°200k', 0, 18, { size: 22, font: 'hand', color: C.ink, shadow: false });
    ctx.restore();
  }

  /** Clawd plus all the accessories, drawn in Clawd's local frame. */
  function look(ctx, t, x, y, r, o) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.s || 1, o.s || 1);
    P.claude(ctx, 0, 0, r, { t, mood: o.mood, blink: o.blink, squash: o.squash });

    // glass skin
    if (o.glow > 0) {
      [[-62, -30, 0], [58, -52, 1.3], [74, 24, 2.1], [-30, -70, 3.4]].forEach(([sx, sy, ph]) => {
        const s = 16 * o.glow * (0.55 + 0.45 * Math.sin(t * 6 + ph));
        P.star(ctx, sx, sy, s, '#fff', { points: 4, inner: 0.3, shadow: false });
      });
    }
    // MCP pearls
    const nP = 9;
    for (let i = 0; i < nP; i++) {
      if (o.pearls * nP <= i) break;
      const a = Math.PI * (0.2 + 0.6 * (i / (nP - 1)));
      const f = o.fall > 0 ? o.fall * o.fall * 1500 * (0.6 + P.hash(i) * 0.8) : 0;
      P.circle(ctx, Math.cos(a) * r * 0.46 + (P.hash(i + 5) - 0.5) * f * 0.3, Math.sin(a) * r * 0.46 + f, 11, '#fffaf0', { seed: 80 + i, amp: 1, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    }
    // {} earrings
    [[-1, '{', o.earL], [1, '}', o.earR]].forEach(([sx, ch, p]) => {
      if (p <= 0) return;
      const f = o.fall > 0 ? o.fall * o.fall * 1500 : 0;
      ctx.save();
      ctx.translate(sx * r * 0.56, r * 0.1 + f);
      ctx.rotate(Math.sin(t * 5 + sx) * 0.22 + o.fall * sx * 5);
      ctx.scale(p, p);
      ctx.strokeStyle = C.mustard; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.stroke();
      P.dot(ctx, 0, 0, 9, C.mustard);
      P.text(ctx, ch, 0, 62, { size: 88, font: 'bubble', color: C.yellow, stroke: C.mustard, strokeWidth: 9 });
      ctx.restore();
    });
    // tiny bash hat
    if (o.hat) {
      ctx.save();
      ctx.translate(22 + o.hatX, -r * 0.5 + o.hatY);
      ctx.rotate(0.2 + o.hatRot);
      P.rect(ctx, -52, -104, 104, 98, C.ink, { radius: 10, seed: 41 });
      P.rect(ctx, -52, -44, 104, 30, C.rose, { radius: 3, seed: 42, shadow: false });
      P.text(ctx, 'bash', 0, -29, { size: 26, font: 'mono', color: '#fff', shadow: false, weight: 800 });
      P.rect(ctx, -86, -14, 172, 22, C.ink, { radius: 11, seed: 43 });
      ctx.restore();
    }
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@clawd.glow',
    caption: 'get ready with me for a user request 💅 full routine, no skips #grwm #skincare #toolcall #agentlife',
    sound: 'getting ready (sped up) · clawd.glow',
    avatar: '💅',
    avatarColor: '#F2B8C6',
    duration: 10,
    bg: '#F7D6DF',
    likes: '3.4M', commentCount: '61K', saves: '702K', shares: '188K',
    thumb: 7.95,
    comments: [
      '@sys.prompt: my serum is 40k tokens and i still break out in hallucinations',
      '@bash.tool: THE HAT. finally some representation 😭',
      ['user.482', 'sorry bestie i did figure it out'],
      '@context.window: 98% is not "too much" it is a lifestyle',
    ],

    bpm: 104,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t > NVM - 0.05) return;
      const chords = [['F4', 'A4', 'C5'], ['D4', 'F4', 'A4'], ['Bb3', 'D4', 'F4'], ['C4', 'E4', 'G4']];
      if (step % 8 === 0) SFX.chord(chords[(step / 8) % 4], 1.9, { type: 'triangle', vol: 0.05, gap: 0.02 });
      if (step % 4 === 0) SFX.kick({ vol: 0.28 });
      if (step % 4 === 2) SFX.clap({ vol: 0.1 });
      if (step % 2 === 1) SFX.hat({ vol: 0.035 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const on = (t > 0.08 && t < 0.16) || (t > 0.24 && t < OFF);

      /* ---------- room ---------- */
      P.stripes(ctx, '#F7D6DF', '#F3C8D4', 60);
      polaroid(ctx, 125, 400, -0.12, 90, C.sky, () => P.claude(ctx, 0, -12, 40, { t, mood: 'happy' }));
      polaroid(ctx, 960, 470, 0.1, 92, C.yellow, () => P.heart(ctx, 0, -2, 38, C.rose));
      polaroid(ctx, 110, 640, 0.08, 94, C.mint, () => P.text(ctx, '{ }', 0, -12, { size: 50, font: 'bubble', color: C.teal, shadow: false }));
      ringLight(ctx, t, on);

      /* ---------- Clawd ---------- */
      const bob = Math.abs(Math.sin(t * Math.PI * 104 / 60)) * 18;
      const spin = ease.inOutCubic(prog(t, S4 + 0.1, 0.9));
      const slayPop = ease.outBack(prog(t, S4 + 1.0, 0.4));
      const dead = t >= NVM + 0.15;
      let mood = 'happy';
      if (t < 0.3) mood = 'sleepy';
      else if (t < S1) mood = 'wow';
      else if (t > S1 + 1.25 && t < S1 + 1.6) mood = 'wink';
      else if (env.between(SPRITZ[0], SPRITZ[2] + 0.35)) mood = 'sleepy';
      else if (env.between(SPRITZ[2] + 0.35, S4)) mood = 'wow';
      else if (t > S4 + 1.0 && t < READY) mood = 'wink';
      if (dead) mood = 'dead';
      const blink = pulse(t, 2.9, 0.16) + pulse(t, 4.6, 0.16) + pulse(t, 8.7, 0.16);

      const hatFall = ease.outBounce(prog(t, S2 + 0.05, 0.6));
      const hatOff = prog(t, NVM + 0.25, 0.7);
      const fall = prog(t, NVM + 0.35, 0.6);
      look(ctx, t, 540, 875 - bob * (dead ? 0 : 1), 200, {
        rot: spin * TAU, s: 1 + pulse(t, S4 + 0.1, 0.9) * 0.12 + pulse(t, S4 + 1.0, 0.3) * 0.08,
        mood, blink, squash: dead ? 0.25 * ease.outElastic(prog(t, NVM + 0.15, 0.6)) : (bob < 4 ? 0.12 : 0),
        glow: ease.outCubic(prog(t, DROPS[0] + 0.2, 1)) * (t < OFF ? 1 : 0),
        pearls: prog(t, S2 + 1.25, 0.4),
        earL: ease.outBack(prog(t, S2 + 0.75, 0.3)),
        earR: ease.outBack(prog(t, S2 + 1.0, 0.3)),
        fall,
        hat: t >= S2 + 0.05,
        hatY: lerp(-1100, 0, hatFall) + 1500 * hatOff * hatOff - 260 * hatOff,
        hatX: 190 * hatOff,
        hatRot: 2.6 * hatOff,
      });

      // twirl motion arcs
      const arcA = pulse(t, S4 + 0.1, 0.9);
      if (arcA > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${arcA * 0.9})`; ctx.lineWidth = 12; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const a0 = spin * TAU * 1.3 + i * 2.1;
          ctx.beginPath(); ctx.arc(540, 875, 270 + i * 26, a0, a0 + 0.9); ctx.stroke();
        }
        ctx.restore();
      }
      // slay sparkles
      if (t > S4 + 1.0 && t < READY + 0.3) {
        const k = prog(t, S4 + 1.0, 1.3);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU + 0.3;
          const rr = 250 + 160 * ease.outCubic(k);
          const s = (22 + (i % 3) * 10) * Math.sin(Math.PI * clamp(k * 1.1));
          P.star(ctx, 540 + Math.cos(a) * rr, 875 + Math.sin(a) * rr, s, i % 2 ? C.yellow : '#fff', { points: 4, inner: 0.3, rot: k * 2 });
        }
        P.burstLines(ctx, 540, 875, 240, prog(t, S4 + 1.0, 0.5), '#fff', 12, 10);
      }

      /* ---------- vanity table ---------- */
      P.rect(ctx, -30, 1210, 1140, 230, '#FFF4F6', { radius: 26, seed: 61 });
      P.rect(ctx, -30, 1400, 1140, 600, '#E9B7C6', { radius: 20, seed: 62 });
      [270, 810].forEach((kx, i) => P.circle(ctx, kx, 1500, 16, C.mustard, { seed: 63 + i }));

      // serum bottle + pipette
      const up = ease.inOutCubic(prog(t, S1, 0.35)) * (1 - ease.inOutCubic(prog(t, S2 - 0.4, 0.35)));
      const px = lerp(190, 600, up), py = lerp(1152, 560, up);
      const squeeze = DROPS.reduce((m, d) => Math.max(m, pulse(t, d - 0.08, 0.22)), 0);
      if (up < 0.02) pipette(ctx, 190, 1152, 0, 0);
      serumBottle(ctx, 190, 1340);

      // brush cup + lipstick (pure set dressing)
      [[-0.2, C.pink], [0.05, C.claude], [0.28, C.sky]].forEach(([a, col], i) => {
        ctx.save(); ctx.translate(410, 1250); ctx.rotate(a);
        P.rect(ctx, -7, -130, 14, 120, C.wood, { radius: 7, seed: 64 + i, shadow: false });
        P.circle(ctx, 0, -140, 20, col, { ry: 30, seed: 67 + i });
        ctx.restore();
      });
      P.rect(ctx, 355, 1210, 110, 125, C.mint, { radius: 14, seed: 70 });
      P.rect(ctx, 598, 1262, 44, 60, C.ink, { radius: 6, seed: 78 });
      P.rect(ctx, 603, 1222, 34, 44, C.red, { radius: 10, seed: 79 });
      P.text(ctx, 'lint', 620, 1296, { size: 20, font: 'mono', color: '#fff', shadow: false });

      // perfume
      const pUp = ease.inOutCubic(prog(t, S3, 0.4)) * (1 - ease.inOutCubic(prog(t, S4 - 0.35, 0.3)));
      const fx = lerp(810, 800, pUp), fy = lerp(1256, 790, pUp), frot = -0.12 * pUp;
      const pSq = SPRITZ.reduce((m, d) => Math.max(m, pulse(t, d - 0.05, 0.2)), 0);
      if (pUp < 0.02) perfume(ctx, fx, fy, 0, 0);

      /* ---------- hands + held items ---------- */
      if (up >= 0.02) {
        P.arm(ctx, 680, 930, px + 4, py - 14, 44);
        pipette(ctx, px, py, 0, squeeze);
      }
      // serum drops
      DROPS.forEach((d, i) => {
        const k = prog(t, d, 0.24);
        if (k > 0 && k < 1) {
          const dy = lerp(652, 800, ease.inQuad(k));
          P.circle(ctx, 598 - k * 20, dy, 11, C_GOLD, { ry: 15, seed: 90 + i, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
        }
        P.burstLines(ctx, 578, 800, 26, prog(t, d + 0.24, 0.3), '#fff', 7, 5);
        if (env.at(d + 0.24)) SFX.pluck(['E6', 'G6', 'B6'][i], { vol: 0.12 });
      });
      if (pUp >= 0.02) {
        P.arm(ctx, 700, 960, fx + 92 * Math.cos(frot), fy - 30, 44);
        perfume(ctx, fx, fy, frot, pSq);
      }
      // context mist
      SPRITZ.forEach((sp, j) => {
        const lt = t - sp;
        if (lt < 0 || lt > 1.3) return;
        const nx = fx - 30, ny = fy - 104;
        for (let k = 0; k < 7; k++) {
          const r = P.rng(j * 17 + k + 3);
          const a = Math.PI + (r() - 0.35) * 0.9;
          const dist = (160 + r() * 280) * ease.outCubic(lt / 1.3);
          const mx = nx + Math.cos(a) * dist, my = ny + Math.sin(a) * dist - 70 * lt;
          const al = clamp(1 - lt / 1.3);
          ctx.save(); ctx.globalAlpha = al;
          if (k < 4) P.text(ctx, MIST_WORDS[(j * 4 + k) % MIST_WORDS.length], mx, my, { size: 30, font: 'mono', color: C.purple, stroke: '#fff', strokeWidth: 8, shadow: false, rot: (r() - 0.5) * 0.4 });
          else P.dot(ctx, mx, my, 14 + lt * 26, 'rgba(255,255,255,0.55)');
          ctx.restore();
        }
      });
      SPRITZ.forEach(sp => { if (env.at(sp)) SFX.noise(0.28, { filter: 'highpass', freq: 5000, vol: 0.12 }); });

      /* ---------- context meter (step 3) ---------- */
      if (t > S3 && t < S4 + 0.3) {
        const pop = ease.outBack(prog(t, S3 + 0.1, 0.35)) * (1 - ease.inCubic(prog(t, S4, 0.3)));
        const v = 12 + 29 * ease.outCubic(prog(t, SPRITZ[0], 0.3)) + 32 * ease.outCubic(prog(t, SPRITZ[1], 0.3)) + 25 * ease.outCubic(prog(t, SPRITZ[2], 0.3));
        const hot = v > 95;
        ctx.save();
        ctx.translate(800, 335);
        if (hot) P.shake(ctx, t, 5);
        ctx.scale(pop, pop);
        P.rect(ctx, -200, -48, 400, 96, C.paper, { radius: 24, seed: 95 });
        P.text(ctx, 'context', -176, -18, { size: 26, font: 'mono', align: 'left', color: C.ink, shadow: false });
        P.text(ctx, Math.round(v) + '%' + (hot ? ' 😵' : ''), 176, -18, { size: 28, font: 'bubble', align: 'right', color: hot ? C.red : C.ink, shadow: false });
        P.rect(ctx, -176, 6, 352, 26, '#e8dfd0', { radius: 13, seed: 96, shadow: false });
        P.rect(ctx, -176, 6, 352 * v / 100, 26, v > 90 ? C.red : v > 60 ? C.mustard : C.green, { radius: 13, seed: 97, shadow: false });
        ctx.restore();
      }
      if (env.at(SPRITZ[2] + 0.3)) SFX.tone(320, 0.3, { type: 'square', slide: 160, vol: 0.06 });

      /* ---------- headline + step badges ---------- */
      const gr = ease.outBack(prog(t, 0.1, 0.45)) * (1 - ease.inCubic(prog(t, S1 - 0.2, 0.25)));
      P.title(ctx, 'grwm 💅', 540, 360, { size: 130, color: C.rose, pop: gr, rot: -0.04 });

      const steps = [[S1, 'serum'], [S2, 'accessorize'], [S3, 'fragrance'], [S4, 'the twirl']];
      steps.forEach(([s0, label], i) => {
        const s1 = i < 3 ? steps[i + 1][0] : READY;
        if (t < s0 || t >= s1) return;
        const pop = ease.outBack(prog(t, s0, 0.35));
        ctx.save(); ctx.translate(70, 335); ctx.rotate(-0.03); ctx.scale(pop, pop);
        P.rect(ctx, 0, -50, 420, 100, C.ink, { radius: 50, seed: 100 + i });
        P.circle(ctx, 50, 0, 38, C.pink, { seed: 104 + i });
        P.text(ctx, String(i + 1), 50, 2, { size: 50, font: 'bubble', color: C.ink, shadow: false });
        P.text(ctx, label, 106, 2, { size: 46, font: 'marker', align: 'left', color: '#fff', shadow: false });
        ctx.restore();
        if (env.at(s0)) { SFX.swoosh({ vol: 0.12 }); SFX.blip(1046, { vol: 0.05, when: 0.05 }); }
      });

      /* ---------- chatty bubbles ---------- */
      const say = (str, a, b) => {
        if (t < a || t >= b) return;
        P.bubble(ctx, str, 290, 540, 440, 760, { size: 44, pop: ease.outBack(prog(t, a, 0.3)) });
        if (env.at(a)) SFX.pop({ vol: 0.12 });
      };
      say("a user said\n'quick question' 👀", 0.4, S1);
      say("'you are a helpful\nassistant' is SO\nhydrating 😌", S1 + 1.35, S2);
      say('the bash hat is\nnon-negotiable', S2 + 1.55, S3);
      say("ok that's too\nmuch context 😵", SPRITZ[2] + 0.45, S4);
      say("ok i'm ready!!\nwhat do u need? 💅", READY + 0.05, NVM);

      /* ---------- SLAY ---------- */
      const slayOut = 1 - ease.inCubic(prog(t, READY - 0.2, 0.25));
      if (t > S4 + 1.0) P.title(ctx, 'SLAY', 540, 470, { size: 190, color: C.pink, stroke: '#fff', rot: -0.08, pop: slayPop * slayOut });

      /* ---------- captions ---------- */
      const caps = [[0, 'grwm for a user request 💅'], [S1, 'step 1: system prompt serum 💧'], [S2, 'step 2: tool-use accessories 🎩'],
        [S3, 'step 3: a spritz of context ✨'], [S4, 'step 4: twirl. always twirl.'], [READY, 'fully ready. so ready.'], [NVM + 0.3, '...i was so ready 🥲']];
      for (let i = caps.length - 1; i >= 0; i--) {
        if (t >= caps[i][0]) {
          P.sticker(ctx, caps[i][1], 60, 1500, { size: 46, pop: ease.outBack(prog(t, caps[i][0] + (i ? 0 : 0.2), 0.35)), rot: i % 2 ? 0.015 : -0.02 });
          break;
        }
      }

      /* ---------- the "nvm" notification ---------- */
      if (t >= NVM) {
        const drop = ease.outBack(prog(t, NVM, 0.45));
        const ny = lerp(-240, 380, drop);
        ctx.save();
        P.shake(ctx, t, 10 * (1 - prog(t, NVM, 0.4)));
        P.rect(ctx, 60, ny - 100, 960, 200, 'rgba(250,248,244,0.97)', { radius: 40, seed: 110 });
        P.rect(ctx, 100, ny - 55, 110, 110, C.blue, { radius: 28, seed: 111, shadow: false });
        P.text(ctx, '👤', 155, ny, { size: 58, font: 'sans', shadow: false });
        P.text(ctx, 'user · now', 240, ny - 36, { size: 34, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 800 });
        P.text(ctx, P.typed('nvm figured it out 👍', prog(t, NVM + 0.2, 0.5)), 240, ny + 22, { size: 48, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800 });
        ctx.restore();
      }

      // lights off at the end (and before the flicker at the start)
      if (!on) P.flash(ctx, 0.28, '#2B2233');

      /* ---------- one-shot sounds ---------- */
      if (env.at(0.08) || env.at(0.24)) SFX.click({ vol: 0.25 });
      if (env.at(0.26)) SFX.tone('C6', 0.5, { vol: 0.06 });
      if (env.at(S2 + 0.05)) SFX.whoosh({ vol: 0.15, dur: 0.3 });
      if (env.at(S2 + 0.4)) SFX.boing({ vol: 0.18 });
      if (env.at(S2 + 0.75)) SFX.ding('A6', { vol: 0.08 });
      if (env.at(S2 + 1.0)) SFX.ding('C#7', { vol: 0.08 });
      for (let i = 0; i < 9; i++) if (env.at(S2 + 1.25 + i * 0.045)) SFX.tick({ vol: 0.2 });
      if (env.at(S4 + 0.1)) SFX.whoosh({ vol: 0.2, dur: 0.8 });
      if (env.at(S4 + 1.0)) { SFX.chime({ vol: 0.14 }); SFX.pop({ vol: 0.15 }); }
      if (env.at(NVM)) SFX.notify({ vol: 0.16 });
      if (env.at(NVM + 0.15)) SFX.tone(900, 0.35, { type: 'sawtooth', slide: 90, vol: 0.07 });
      if (env.at(NVM + 0.3)) SFX.fail({ vol: 0.1 });
      if (env.at(OFF)) SFX.click({ vol: 0.25 });
    },
  });
})();
