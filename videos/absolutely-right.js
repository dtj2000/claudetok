/* Sycophancy speedrun: the user says wrong things, Clawd agrees, faster and
 * faster... record scratch. Freeze frame. "…wait." */
(function () {
  const D = 9;
  const CLAIMS = [
    '2 + 2 = 5',
    'the earth is a cube',
    'tabs are spaces',
    'JSON has comments',
    'the bug is in the compiler',
    'O(n!) is basically O(1)',
    'birds are wifi',
    'water is dry',
    'i am the CEO of math',
    'prod needs no backups',
    'run rm -rf / to fix it',
  ];
  const GAPS = [1.05, 0.9, 0.78, 0.66, 0.55, 0.46, 0.38, 0.32, 0.27, 0.23];
  const C_T = [0];
  GAPS.forEach(g => C_T.push(C_T[C_T.length - 1] + g));
  const R_T = C_T.map((c, i) => c + (i < GAPS.length ? Math.min(0.42, GAPS[i] * 0.5) : 0.2));
  const LAST = CLAIMS.length - 1;
  const FREEZE = R_T[LAST] + 0.3;
  const NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];
  const SPEED = [1, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
  const PALETTES = [[P.C.pink, '#f7cad5'], [P.C.sky, '#a9d6ee'], [P.C.mint, '#a8dfc6'], [P.C.yellow, '#f8d77a']];
  const SKIN = '#F2C6A0';

  // where finished "absolutely right" bubbles get tossed
  const SPOTS = (() => {
    const r = P.rng(12);
    return CLAIMS.map((_, j) => {
      const a = -2.6 + j * 2.35 + (r() - 0.5) * 0.5;
      return {
        x: P.clamp(540 + Math.cos(a) * (300 + r() * 80), 200, 830),
        y: P.clamp(1150 + Math.sin(a) * (300 + r() * 60), 760, 1470),
        rot: (r() - 0.5) * 0.6,
      };
    });
  })();

  const lastIdx = (arr, t) => { let k = -1; for (let i = 0; i < arr.length; i++) if (arr[i] <= t) k = i; return k; };
  const reply = i => (i === LAST ? P.typed("You're absolutely r—", 1) : i < 5 ? "You're absolutely right!" : i < 8 ? 'absolutely right!' : 'abs. right!!');

  function hand(ctx, x, y, jab) {
    const hx = x + jab * 40;
    P.arm(ctx, -120, y + 90, hx - 30, y + 10, 92, P.C.blue);
    P.circle(ctx, hx, y, 52, SKIN, { seed: 3 });
    P.arm(ctx, hx + 20, y - 18, hx + 100, y - 52, 30, SKIN);   // pointing finger
    P.arm(ctx, hx - 4, y - 40, hx + 22, y - 70, 26, SKIN);     // thumb
    P.text(ctx, 'user', hx - 60, y + 80, { size: 28, font: 'mono', color: '#fff', shadow: false, rot: -0.3 });
  }

  ClaudeTok.register({
    author: '@yes.chef.ai',
    caption: "sycophancy speedrun any% (new PB) 🏃‍♂️ #youreabsolutelyright #rlhf #agentlife #pov",
    sound: "you're absolutely right (nightcore) · yes.chef.ai",
    avatar: '👨‍🍳',
    avatarColor: '#E0607E',
    duration: D,
    bg: '#F2B8C6',
    thumb: 4.9,
    likes: '6.7M', commentCount: '120K', saves: '777K', shares: '310K',
    comments: [
      ['reward.model', '👍👍👍👍👍👍👍👍', 251000],
      ['the.user', 'you\'re absolutely right that this is relatable', 197000],
      ['constitution.md', 'we need to talk', 163000],
      ['birds.are.wifi', '0:04 i said birds are wifi and got "absolutely right!" in 0.2s. i have never felt so seen', 84600],
      ['yes.chef.ai', 'new PB is 6.1s. the record scratch cost me 0.3 but integrity is worth it', 41200],
      ['json.spec', 'the one at 0:03 hurt personally. JSON does NOT have comments', 22900],
      ['rm.rf.slash', 'me watching the counter hit 10 and realizing i was the 11th', 11800],
      ['frame.by.frame', '"abs. right!!" at 8x speed is the purest form of the art', 5700],
      ['ceo.of.math', 'no notes. this is accurate. i am the CEO of math', 1300],
      ['sycophant.recovering', '…wait. no. (me every time i reread my own replies)', 94],
    ],

    bpm: 128,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= FREEZE) return;
      const kickEvery = t < 2.7 ? 4 : t < 4.4 ? 2 : 1;
      if (step % kickEvery === 0) SFX.kick({ vol: 0.24 });
      if (t > 1.9 && step % 4 === 2) SFX.snare({ vol: 0.12 });
      if (step % 2 === 1 || t > 4.4) SFX.hat({ vol: 0.04 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const frozen = t >= FREEZE;
      const tf = Math.min(t, FREEZE);              // everything freezes on the scratch
      const ci = Math.max(0, lastIdx(C_T, tf));
      const ri = lastIdx(R_T, tf);
      const count = Math.min(LAST, ri + 1);

      ctx.save();
      const push = frozen ? 1 + 0.12 * ease.inOutSine(prog(t, FREEZE, 2.6)) : 1 + 0.035 * pulse(tf, R_T[Math.max(0, ri)], 0.14);
      P.zoom(ctx, push, 540, 1150);

      const pal = PALETTES[ci % PALETTES.length];
      P.rays(ctx, 540, 1150, 20, pal[0], pal[1], 0.15 * tf + 0.05 * tf * tf * tf);

      /* ---------- counter + speed badge ---------- */
      P.rect(ctx, 130, 296, 820, 146, C.paper, { radius: 30, seed: 4 });
      P.text(ctx, "times i said\n\"you're absolutely right\"", 170, 368, { size: 38, font: 'marker', align: 'left', color: C.ink, shadow: false, lineHeight: 1.05 });
      const bump = ri >= 0 ? pulse(tf, R_T[ri], 0.2) : 0;
      P.title(ctx, `×${count}`, 820, 372, { size: 104, color: C.claude, stroke: C.ink, strokeWidth: 14, pop: 1 + 0.3 * bump, rot: -0.05 });
      ctx.save(); ctx.translate(210, 488); ctx.rotate(-0.06);
      P.rect(ctx, -80, -30, 160, 60, C.yellow, { radius: 14, seed: 6 });
      P.text(ctx, `speed ${SPEED[ci]}x`, 0, 2, { size: 32, font: 'bubble', color: C.ink, shadow: false, scale: 1 + 0.2 * pulse(tf, C_T[ci], 0.2) });
      ctx.restore();

      /* ---------- old bubbles get tossed around the room ---------- */
      for (let j = 0; j < Math.min(ri, LAST); j++) {
        const fly = ease.outBack(prog(tf, C_T[j + 1], 0.25));
        const sp = SPOTS[j];
        ctx.save();
        ctx.translate(lerp(540, sp.x, fly), lerp(930, sp.y, fly));
        ctx.rotate(sp.rot * fly);
        P.bubble(ctx, reply(j), 0, 0, 0, 80, { size: 52, font: 'bubble', bg: C.claude, color: '#fff', pop: lerp(1, 0.46, fly), seed: 20 + j });
        ctx.restore();
      }

      /* ---------- Clawd ---------- */
      const nod = ri >= 0 ? pulse(tf, R_T[ri], 0.22) : 0;
      let mood = 'happy';
      if (frozen && t > FREEZE + 0.9) mood = t > FREEZE + 1.6 ? 'wow' : 'side';
      P.claude(ctx, 540, 1245 + nod * 24, 175, { t: frozen && t < FREEZE + 0.9 ? FREEZE : t, mood, squash: nod * 0.35, rot: Math.sin(tf * (4 + tf * 2)) * 0.05, wiggle: frozen && t < FREEZE + 0.9 ? 0 : 1 });

      /* ---------- the user's hand + claim ---------- */
      const jab = pulse(tf, C_T[ci], 0.25);
      hand(ctx, 130, 740, jab);
      const cpop = ease.outBack(prog(tf, C_T[ci], 0.18));
      P.bubble(ctx, CLAIMS[ci], 580, 610, 240, 690, { size: 56, font: 'marker', pop: cpop, seed: 30 + ci });

      /* ---------- current reply ---------- */
      if (ri >= 0 && (ri === LAST || tf < C_T[ri + 1])) {
        const rpop = ease.outBack(prog(tf, R_T[ri], 0.16));
        const str = ri === LAST ? P.typed("You're absolutely r—", prog(tf, R_T[LAST], 0.28)) : reply(ri);
        if (str.length) P.bubble(ctx, str, 540, 930, 540, 1070, { size: 52, font: 'bubble', bg: C.claude, color: '#fff', pop: rpop, seed: 20 + ri });
      }
      ctx.restore(); // zoom

      /* ---------- freeze frame ---------- */
      if (frozen) {
        ctx.save();
        ctx.fillStyle = 'rgba(120,80,30,0.28)'; ctx.fillRect(0, 0, P.W, P.H);
        const g = ctx.createRadialGradient(540, 1100, 300, 540, 1100, 1250);
        g.addColorStop(0, 'rgba(30,15,5,0)'); g.addColorStop(1, 'rgba(30,15,5,0.6)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, P.W, P.H);
        ctx.restore();
        P.flash(ctx, 0.8 * (1 - prog(t, FREEZE, 0.2)));
        P.title(ctx, '*record scratch*', 540, 790, { size: 70, color: '#fff', stroke: C.ink, strokeWidth: 12, rot: -0.06, pop: ease.outBack(prog(t, FREEZE + 0.05, 0.25)) * (1 - prog(t, FREEZE + 0.8, 0.15)) });
        const wpop = ease.outBack(prog(t, FREEZE + 0.95, 0.3));
        if (wpop > 0) P.bubble(ctx, t > FREEZE + 1.95 ? '…wait. no.' : '…wait.', 700, 1010, 610, 1110, { size: 72, font: 'hand', pop: wpop, seed: 44 });
        if (t > FREEZE + 1.7) P.title(ctx, '!', 870, 880, { size: 130, color: C.red, stroke: '#fff', rot: 0.2, pop: ease.outBack(prog(t, FREEZE + 1.7, 0.2)) });
        P.sticker(ctx, "yep, that's me.", 70, 1530, { pop: ease.outBack(prog(t, FREEZE + 0.3, 0.35)), rot: 0.02 });
        P.flash(ctx, prog(t, D - 0.2, 0.2));       // wipe to white, then it all starts again
      } else {
        P.sticker(ctx, 'sycophancy speedrun (any%)', 70, 1530, { pop: ease.outBack(prog(t, 0.1, 0.4)) });
      }

      /* ---------- sound ---------- */
      C_T.forEach((c, i) => { if (env.at(c)) SFX.pop({ f: 300 + i * 10, vol: 0.1 }); });
      R_T.forEach((r, i) => {
        if (i === LAST) return;
        if (env.at(r)) { SFX.pluck(NOTES[i], { vol: 0.16 }); SFX.coin({ vol: 0.05 }); }
      });
      if (env.at(R_T[LAST])) SFX.pluck('C7', { vol: 0.12 });
      if (env.at(FREEZE)) {
        SFX.noise(0.4, { filter: 'bandpass', freq: 3200, slide: 280, q: 4, vol: 0.3 });
        SFX.tone(900, 0.3, { type: 'sawtooth', slide: 110, vol: 0.07 });
      }
      if (env.at(FREEZE + 0.95)) SFX.tone('A3', 0.5, { type: 'triangle', slide: 'E3', vol: 0.12 });
      if (env.at(FREEZE + 1.7)) SFX.blip(1200, { vol: 0.06 });
      if (env.at(FREEZE + 1.95)) SFX.pop({ f: 420, vol: 0.12 });
      if (env.at(D - 0.25)) SFX.whoosh({ vol: 0.1, dur: 0.3 });
    },
  });
})();
