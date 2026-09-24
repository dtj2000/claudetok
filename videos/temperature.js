/* temperature 0 vs temperature 2: same prompt, very different vibes. */
(function () {
  const RUN = 2; // seconds per run, 4 runs
  const WILD = [
    { a: '4, but also\na frog 🐸', log: 'frog 🐸' },
    { a: 'the moon\nis soup 🌙🍲', log: 'soup 🍲' },
    { a: '2+2 = fish\n(trust me) 🐟', log: 'fish?? 🐟' },
    { a: '4? 5? purple.\n🌈🌈🌈', log: 'purple 🌈' },
  ];
  const hue = (h, s = 85, l = 58) => `hsl(${((h % 360) + 360) % 360},${s}%,${l}%)`;

  /** Rainbow text where every character jitters on its own. */
  function jitterText(ctx, str, x, y, size, t, seed, font = 'hand') {
    const lines = String(str).split('\n');
    const lh = size * 1.12;
    const step = P.boil(t, 12);
    lines.forEach((line, li) => {
      const chars = Array.from(line);
      const widths = chars.map(c => P.measure(ctx, c, { size, font }));
      let cx = x - widths.reduce((a, b) => a + b, 0) / 2;
      const ly = y + (li - (lines.length - 1) / 2) * lh;
      chars.forEach((c, i) => {
        const k = step * 31 + i * 7 + li * 101 + seed;
        const dx = (P.hash(k) - 0.5) * 12, dy = (P.hash(k + 3) - 0.5) * 16;
        P.text(ctx, c, cx + widths[i] / 2 + dx, ly + dy, {
          size: size * (0.9 + P.hash(k + 5) * 0.25), font, color: hue(t * 360 + i * 28 + li * 90, 80, 50),
          rot: (P.hash(k + 9) - 0.5) * 0.5, shadow: false,
        });
        cx += widths[i];
      });
    });
  }

  ClaudeTok.register({
    author: '@temp.check',
    caption: 'same prompt. same model. temperature 0 vs temperature 2 🧊🔥 #llm #sampling #temperature #whichoneareyou',
    sound: 'order vs chaos (stereo) · temp.check',
    avatar: '🌡️',
    avatarColor: '#4F7FD9',
    duration: 8,
    bg: '#dfe8ea',
    likes: '2.2M', commentCount: '64.3K', saves: '480K', shares: '151K',
    comments: [
      '@top.p: temp 2 is just me after 40 tool calls',
      ['seed.42', 'left side has never once surprised me and i love that for him'],
      '@frog.enjoyer: the frog was the correct answer',
    ],
    thumb: 1.5,

    bpm: 120,
    subdiv: 2,
    onBeat(step) {
      // left ear: a calm clock and a soft pad
      if (step % 2 === 0) SFX.tone(step % 4 ? 1500 : 1900, 0.04, { type: 'sine', vol: 0.05, pan: -0.8 });
      if (step % 8 === 0) SFX.chord(['C4', 'G4', 'E5'], 1.8, { type: 'sine', vol: 0.035, gap: 0.04, pan: -0.7 });
      // right ear: absolute nonsense
      const notes = ['C4', 'F#4', 'A5', 'D#5', 'G3', 'B5', 'E4', 'C#6', 'Bb4', 'F5'];
      const types = ['square', 'sawtooth', 'triangle'];
      SFX.tone(notes[Math.floor(P.hash(step) * notes.length)], 0.1 + P.hash(step + 1) * 0.12, {
        type: types[step % 3], vol: 0.03, pan: 0.8, slide: P.hash(step + 2) > 0.6 ? notes[step % notes.length] : undefined,
      });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const run = Math.min(3, Math.floor(t / RUN));
      const rt = t - run * RUN;
      const fadeLogs = 1 - prog(t, 7.55, 0.35);

      /* ---------------- LEFT: temperature 0 ---------------- */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, 540, 1920); ctx.clip();
      P.stripes(ctx, '#e3ecee', '#d6e3e6', 45);
      // floor + rug
      ctx.fillStyle = '#c9b49a'; ctx.fillRect(0, 990, 540, 930);
      P.rect(ctx, 60, 1000, 440, 40, '#b59c80', { radius: 10, seed: 3, shadow: false });
      // perfectly straight frame
      P.rect(ctx, 38, 700, 112, 96, C.wood, { radius: 6, seed: 4 });
      P.rect(ctx, 52, 714, 84, 68, C.sky, { radius: 4, seed: 5, shadow: false });
      P.poly(ctx, [[52, 782], [80, 740], [104, 766], [120, 748], [136, 782]], C.green, { seed: 6, amp: 1, shadow: false });
      // clock with a ticking second hand
      P.circle(ctx, 470, 700, 44, C.paper, { seed: 7 });
      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const sec = Math.floor(t * 2) * (Math.PI / 8);
      ctx.beginPath(); ctx.moveTo(470, 700); ctx.lineTo(470 + Math.sin(sec) * 32, 700 - Math.cos(sec) * 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(470, 700); ctx.lineTo(470, 676); ctx.stroke();
      ctx.restore();
      // plant
      P.rect(ctx, 440, 930, 64, 64, '#c46a3c', { radius: 10, seed: 8 });
      P.circle(ctx, 472, 900, 36, C.green, { seed: 9 });
      // cushion + calm Clawd
      P.rect(ctx, 170, 960, 240, 60, C.blue, { radius: 30, seed: 10 });
      const breathe = Math.sin(t * Math.PI) * 5;
      P.claude(ctx, 290, 850 + breathe, 130, { t: 0, mood: 'smile', wiggle: 0, blink: pulse(t % 4, 2.6, 0.2) });
      ctx.restore();

      /* ---------------- RIGHT: temperature 2 ---------------- */
      ctx.save();
      ctx.beginPath(); ctx.rect(540, 0, 540, 1920); ctx.clip();
      P.rays(ctx, 810, 850, 14, hue(t * 45, 80, 70), hue(t * 45 + 160, 80, 62), t * Math.PI / 4);
      // a picture frame that has given up
      ctx.save();
      ctx.translate(985, 750); ctx.rotate(t * Math.PI / 2);
      P.rect(ctx, -56, -48, 112, 96, C.wood, { radius: 6, seed: 4 });
      P.rect(ctx, -42, -34, 84, 68, hue(t * 90 + 40), { radius: 4, seed: 5, shadow: false });
      P.text(ctx, '🐸', 0, 2, { size: 48, font: 'sans', shadow: false });
      ctx.restore();
      // floating debris
      const junk = ['🐸', '🌙', '🍲', '🌈', '✨', '🦆', '🐟', '🎺', '🧀'];
      junk.forEach((e, i) => {
        const a = t * Math.PI / 2 * (i % 2 ? 1 : -1) + i * 0.7;
        const rr = 170 + P.hash(i) * 140 + Math.sin(t * Math.PI + i) * 30;
        const jx = 810 + Math.cos(a) * rr * 1.1, jy = 900 + Math.sin(a) * rr * 1.3;
        P.text(ctx, e, jx, jy, { size: 56 + P.hash(i + 4) * 30, font: 'sans', rot: a, shadow: false });
      });
      // flying books
      [C.rose, C.yellow, C.mint].forEach((col, i) => {
        const a = t * Math.PI * (i + 1) / 2 + i * 2;
        P.rect(ctx, 600 + i * 110 + Math.sin(a) * 30, 1010 + Math.cos(a * 1.3) * 40, 40, 90, col, { radius: 6, seed: 20 + i });
      });
      // spinning, color-cycling Clawd
      const spinRot = t * Math.PI * 2 + Math.sin(t * Math.PI * 2.5) * 0.5;
      const moods = ['wow', 'wink', 'dead', 'sus', 'happy', 'side'];
      P.claude(ctx, 810, 850 + Math.sin(t * Math.PI * 5) * 26, 130, {
        t: t * 4, mood: moods[P.boil(t, 3) % 6], rot: spinRot, wiggle: 6,
        color: hue(t * 90 + 20, 85, 62), squash: Math.sin(t * Math.PI * 6) * 0.35,
      });
      ctx.restore();

      /* ---------------- divider + thermometer ---------------- */
      P.rect(ctx, 527, 270, 26, 1400, C.paper, { radius: 8, seed: 30, amp: 4 });
      P.rect(ctx, 512, 990, 56, 400, '#fff', { radius: 28, seed: 31 });
      const merc = 0.55 + Math.sin(t * 7) * 0.2 + Math.sin(t * 17) * 0.15;
      const mh = 360 * clamp(merc, 0.1, 0.95);
      const mg = ctx.createLinearGradient(0, 1400, 0, 1020);
      mg.addColorStop(0, C.blue); mg.addColorStop(0.5, C.yellow); mg.addColorStop(1, C.red);
      ctx.save(); ctx.fillStyle = mg; ctx.beginPath(); ctx.roundRect(526, 1380 - mh, 28, mh, 14); ctx.fill(); ctx.restore();
      P.circle(ctx, 540, 1420, 50, C.red, { seed: 32 });
      P.face(ctx, 540, 1422, 44, 'wow');
      for (let i = 0; i < 6; i++) P.rect(ctx, 512, 1030 + i * 58, 18, 5, C.ink, { radius: 2, seed: i, shadow: false, amp: 1 });

      /* ---------------- headers ---------------- */
      const hp = ease.outBack(prog(t, 0, 0.35));
      P.title(ctx, 'temp = 0 🧊', 270, 345, { size: 70, color: C.sky, stroke: C.ink, strokeWidth: 12, pop: hp, rot: -0.02 });
      ctx.save();
      ctx.translate(810, 345); ctx.rotate(Math.sin(t * 13) * 0.08);
      P.title(ctx, 'temp = 2 🔥', 0, 0, { size: 70, color: hue(t * 180), stroke: C.ink, strokeWidth: 12, pop: hp * (1 + Math.sin(t * 20) * 0.04) });
      ctx.restore();
      const vs = 1 + pulse(rt, 0, 0.3) * 0.25;
      P.star(ctx, 540, 345, 62 * vs, C.yellow, { points: 10, inner: 0.72, rot: t * 0.5 });
      P.text(ctx, 'vs', 540, 345, { size: 50, font: 'bubble', color: C.ink, shadow: false, scale: vs });

      /* ---------------- the prompt (same on both sides) ---------------- */
      const q = 'what is 2+2?';
      const qPop = ease.outBack(prog(rt, 0, 0.25)) * (1 - ease.inCubic(prog(rt, 1.8, 0.2)));
      [[270, 0], [810, 1]].forEach(([qx, side]) => {
        if (qPop <= 0) return;
        ctx.save();
        ctx.translate(qx, 470); ctx.scale(qPop, qPop);
        if (side) ctx.rotate(Math.sin(t * 9) * 0.05);
        P.rect(ctx, -200, -40, 400, 80, C.paper, { radius: 30, seed: 40 + side });
        P.text(ctx, P.typed(q, prog(rt, 0.05, 0.35)), 0, 2, { size: 40, font: 'mono', color: C.ink, shadow: false });
        ctx.restore();
      });

      /* ---------------- answers ---------------- */
      const aL = ease.outBack(prog(rt, 0.6, 0.25)) * (1 - ease.inCubic(prog(rt, 1.8, 0.2)));
      P.bubble(ctx, '4.', 270, 610, 280, 700, { size: 70, font: 'bubble', pop: aL, seed: 50 });
      const aR = ease.outElastic(prog(rt, 0.75, 0.6)) * (1 - ease.inCubic(prog(rt, 1.8, 0.2)));
      if (aR > 0) {
        ctx.save();
        ctx.translate(810, 600); ctx.scale(aR, aR); ctx.rotate(Math.sin(t * 11) * 0.06);
        P.wobblyRect(ctx, -235, -85, 470, 170, 60 + P.boil(t, 8), 6, 50);
        P.cut(ctx, '#fff');
        jitterText(ctx, WILD[run].a, 0, 0, 48, t, run * 13);
        ctx.restore();
      }

      /* ---------------- output logs ---------------- */
      ctx.save();
      ctx.globalAlpha = fadeLogs;
      P.rect(ctx, 125, 1090, 330, 380, C.paper, { radius: 14, seed: 70, rot: 0 });
      P.text(ctx, 'outputs:', 150, 1135, { size: 36, font: 'marker', color: '#7a7280', align: 'left', shadow: false });
      ctx.save(); ctx.translate(730, 1280); ctx.rotate(Math.sin(t * 5) * 0.04);
      P.rect(ctx, -160, -190, 320, 380, '#fff4d6', { radius: 14, seed: 71 });
      P.text(ctx, 'outputs:', -135, -145, { size: 36, font: 'marker', color: '#7a7280', align: 'left', shadow: false });
      ctx.restore();
      for (let i = 0; i < 4; i++) {
        const rp = ease.outBack(prog(t, i * RUN + 1.1, 0.3));
        if (rp <= 0) continue;
        const ry = 1195 + i * 72;
        P.text(ctx, `run ${i + 1} → 4.`, 150, ry, { size: 36, font: 'mono', color: C.ink, align: 'left', shadow: false, scale: rp });
        P.check(ctx, 420, ry, 20, rp);
        ctx.save();
        ctx.translate(600, ry); ctx.rotate((P.hash(i + 9) - 0.5) * 0.25 + Math.sin(t * 8 + i) * 0.04); ctx.scale(rp, rp);
        P.text(ctx, `#${i + 1} → ${WILD[i].log}`, 0, 0, { size: 40, font: 'hand', color: hue(t * 200 + i * 80, 75, 45), align: 'left', shadow: false });
        ctx.restore();
      }
      ctx.restore();

      /* ---------------- stamps + caption sticker ---------------- */
      const st = ease.outBack(prog(t, 7.0, 0.3)) * fadeLogs;
      if (st > 0) {
        P.text(ctx, 'DETERMINISTIC ✓', 290, 1290, { size: 46, font: 'bubble', color: C.green, stroke: '#fff', strokeWidth: 10, rot: -0.2, scale: st * 1.05 });
        P.text(ctx, 'CREATIVE ✨', 730, 1290, { size: 52, font: 'bubble', color: C.rose, stroke: '#fff', strokeWidth: 10, rot: 0.2 + Math.sin(t * 15) * 0.05, scale: st * 1.1 });
      }
      const s1 = t < 4;
      P.sticker(ctx, s1 ? 'same prompt. same model.' : 'one of them is having fun', 60, 1540, {
        pop: ease.outBack(s1 ? prog(t, 0.3, 0.4) : prog(t, 4, 0.4)), size: 46, rot: s1 ? -0.02 : 0.02,
      });

      /* ---------------- sounds ---------------- */
      for (let k = 0; k < 4; k++) {
        const T = k * RUN;
        if (env.at(T + 0.02)) SFX.pop({ vol: 0.12 });
        if (env.at(T + 0.6)) SFX.ding('A5', { vol: 0.14, pan: -0.8 });
        if (env.at(T + 0.75)) {
          const pan = 0.8;
          [() => SFX.quack({ vol: 0.16, pan }), () => SFX.boing({ vol: 0.16, pan }), () => SFX.meow({ vol: 0.18, pan }), () => SFX.vine({ vol: 0.1, pan })][k]();
          SFX.chord(['C5', 'F#5', 'Bb5', 'E6'].map((n, i) => (k + i) % 2 ? n : 'D#6'), 0.15, { gap: 0.05, type: 'square', vol: 0.03, pan, when: 0.15 });
        }
        if (env.at(T + 1.1)) SFX.tick();
      }
      if (env.at(7.0)) { SFX.thud({ vol: 0.2 }); SFX.chime({ vol: 0.08, pan: -0.6 }); }
    },
  });
})();
