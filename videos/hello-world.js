/* An egg wobbles, cracks, and hatches a chick that says hello, world! Then it naps back inside. */
(function () {
  const TAU = Math.PI * 2;
  const EX = 540, EY = 1100, A = 150, B = 190, Y0 = 1060;   // egg + where it breaks
  const R = 120, HIDDEN = Y0 + R - 38, UP = 975;             // chick radius / hidden y / hatched y
  const HATCH = 4.6, SINK = 8.95, SHUT = 9.55;
  const CRACKS = [1.4, 2.7, 3.8];
  const ZZ = [];
  for (let k = 0; k <= 10; k++) ZZ.push([EX - 170 + k * 34, Y0 + (k % 2 ? -16 : 16)]);
  const MEL = ['E6', 0, 'G6', 0, 'C7', 0, 'B6', 0, 'A6', 0, 'G6', 0, 'E6', 0, 0, 0,
    'F6', 0, 'A6', 0, 'G6', 0, 'E6', 0, 'D6', 0, 'E6', 'D6', 'C6', 0, 0, 0];
  const LOW = ['C5', 'A4', 'F4', 'G4'];
  const TITLES = [[0, 'shh... it moved'], [1.4, "it's hatching!!"], [HATCH, 'IT COMPILED!!'], [SINK, 'nap time zzz']];

  function eggPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(EX, EY - B);
    ctx.bezierCurveTo(EX + A * 0.75, EY - B, EX + A, EY - B * 0.1, EX + A, EY + B * 0.3);
    ctx.bezierCurveTo(EX + A, EY + B * 0.8, EX + A * 0.5, EY + B, EX, EY + B);
    ctx.bezierCurveTo(EX - A * 0.5, EY + B, EX - A, EY + B * 0.8, EX - A, EY + B * 0.3);
    ctx.bezierCurveTo(EX - A, EY - B * 0.1, EX - A * 0.75, EY - B, EX, EY - B);
    ctx.closePath();
  }

  /* half an egg ('top' or 'bot'), clipped along the zigzag */
  function piece(ctx, which) {
    ctx.save();
    ctx.beginPath();
    ZZ.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    const yy = which === 'top' ? Y0 - 300 : EY + B + 60;
    ctx.lineTo(EX + 220, Y0 + (which === 'top' ? 16 : 16)); ctx.lineTo(EX + 220, yy); ctx.lineTo(EX - 220, yy); ctx.lineTo(EX - 220, Y0 + 16);
    ctx.closePath();
    ctx.clip();
    eggPath(ctx);
    P.cut(ctx, '#FFF3DC', { shadow: { blur: 14, dy: 8, alpha: 0.28 } });
    [[-60, -110, 9], [40, -140, 7], [70, -40, 10], [-90, 10, 8], [20, 60, 11], [90, 110, 7], [-40, 130, 9], [-20, -60, 6]].forEach(([dx, dy, r]) =>
      P.dot(ctx, EX + dx, EY + dy, r, '#F2CFA6'));
    ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(EX - 70, EY - 80, 22, 50, 0.35, 0, TAU); ctx.fill(); ctx.restore();
    ctx.restore();
  }

  function crackLine(ctx, n, alpha) {
    if (n <= 0 || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    eggPath(ctx); ctx.clip();
    ctx.strokeStyle = '#6d4a36'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lo = 5 - n, hi = 5 + n;
    const at = f => { const i = Math.floor(f), k = f - i, a = ZZ[Math.max(0, Math.min(10, i))], b = ZZ[Math.max(0, Math.min(10, i + 1))]; return [P.lerp(a[0], b[0], k), P.lerp(a[1], b[1], k)]; };
    ctx.beginPath();
    const s = at(lo); ctx.moveTo(s[0], s[1]);
    for (let i = Math.ceil(lo); i <= Math.floor(hi); i++) ctx.lineTo(ZZ[i][0], ZZ[i][1]);
    const e = at(hi); ctx.lineTo(e[0], e[1]);
    // a couple of little branch cracks
    if (n > 1.2) { ctx.moveTo(ZZ[4][0], ZZ[4][1]); ctx.lineTo(ZZ[4][0] - 10, ZZ[4][1] - 34); }
    if (n > 3) { ctx.moveTo(ZZ[7][0], ZZ[7][1]); ctx.lineTo(ZZ[7][0] + 14, ZZ[7][1] + 30); }
    ctx.stroke();
    ctx.restore();
  }

  function chick(ctx, x, y, t, mood, talk, flap, vis) {
    // wings
    [-1, 1].forEach(sd => {
      ctx.save(); ctx.translate(x + sd * 100, y + 15); ctx.rotate(sd * (0.5 + flap * 0.7)); ctx.scale(vis, vis);
      P.circle(ctx, sd * 22, 0, 46, '#F2C23E', { ry: 28, seed: 3 + sd });
      ctx.restore();
    });
    // tuft
    [-18, 0, 18].forEach((d, k) => P.circle(ctx, x + d, y - R - 8 + Math.abs(d) * 0.4, 12, '#F2C23E', { ry: 26, seed: 7 + k, shadow: false }));
    P.circle(ctx, x, y, R, '#F9D65C', { seed: 5 });
    P.circle(ctx, x, y + 50, 70, '#FCE79A', { ry: 50, seed: 6, shadow: false });
    P.face(ctx, x, y - 18, 86, mood);
    // beak
    const open = talk * 16;
    P.poly(ctx, [[x - 24, y + 8], [x + 24, y + 8], [x, y + 30]], '#F29A38', { amp: 1, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    if (open > 0.5) P.poly(ctx, [[x - 18, y + 14 + open], [x + 18, y + 14 + open], [x, y + 30 + open]], '#E07F28', { amp: 1, shadow: false });
  }

  function crackSfx() {
    SFX.noise(0.05, { filter: 'highpass', freq: 3000, vol: 0.28 });
    SFX.noise(0.09, { filter: 'bandpass', freq: 1300, q: 3, vol: 0.2, when: 0.03 });
    SFX.tick({ vol: 0.3, when: 0.07 });
  }

  ClaudeTok.register({
    author: '@hello.world',
    caption: 'my first program just hatched 🥹 #helloworld #firstprogram #baby',
    sound: 'music box lullaby (O(1) edition) · hello.world',
    avatar: '🐣',
    avatarColor: '#F5C84B',
    duration: 10,
    bg: '#FFE7A8',
    likes: '5.9M', commentCount: '72K', saves: '1.4M', shares: '511K',
    thumb: 6.3,
    comments: [
      ['gcc', '0 warnings 0 errors. proud of you kid', 188000],
      ['stdout', 'i\'ve been waiting my whole life to print this', 141000],
      ['claude', 'every program starts here 🥹 next it will be asking for more memory', 102000],
      ['egg.shell.hat', 'the shell staying on as a little hat after 0:04 is the cutest thing ever compiled', 58600],
      ['hello.world', 'three cracks, one hatch, one nap. like every first program', 30400],
      ['segfault.sam', '"IT COMPILED!!" and he was so proud. i remember that feeling. it was before pointers', 16700],
      ['printf.pedant', 'should be printed with a newline. anyway i am crying', 7100],
      ['nap.time.zzz', 'me after writing one line of code: nap time zzz', 2800],
      ['main.return.0', 'he went back in the egg at the end. exit code 0. peaceful', 940],
      ['baby.chick', '🐣👋🌍', 87],
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step) {
      const s = step % 32;
      if (MEL[s]) {
        SFX.tone(MEL[s], 1.1, { type: 'sine', vol: 0.07 });
        SFX.tone(SFX.freq(MEL[s]) * 2, 0.3, { type: 'sine', vol: 0.015 });
      }
      if (s % 8 === 0) SFX.tone(LOW[s / 8], 1.8, { type: 'triangle', vol: 0.035 });
      if (s % 8 === 4) SFX.tone(SFX.freq(LOW[(s - 4) / 8]) * 1.5, 1.2, { type: 'triangle', vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const out = t >= HATCH && t < SHUT;

      // sunburst sky
      P.rays(ctx, 540, 1050, 20, '#FFE7A8', '#FFDB8E', t * TAU / 100);
      P.cloud(ctx, 170 + Math.sin(t * TAU / 10) * 20, 770, 0.8);
      P.cloud(ctx, 880 + Math.sin(t * TAU / 5 + 1) * 15, 860, 0.6);

      // branch
      ctx.beginPath(); P.capsulePath(ctx, -80, 1395, 1160, 1330, 80); P.cut(ctx, C.brown);
      [[90, 1450, 0.5], [250, 1465, -0.4], [830, 1405, 0.6], [985, 1390, -0.5]].forEach(([x, y, a], k) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.sin(t * TAU / 5 + k) * 0.06);
        P.circle(ctx, 0, 30, 30, k % 2 ? C.green : '#7CC47F', { ry: 52, seed: 80 + k }); ctx.restore();
      });

      // nest back
      P.circle(ctx, 540, 1250, 250, C.brown, { ry: 70, seed: 21 });
      P.circle(ctx, 540, 1246, 215, '#6d452c', { ry: 50, seed: 22, shadow: false });

      // wobble (before hatching and as it closes back up)
      let amp = 0;
      if (t < HATCH) {
        amp = 0.05;
        CRACKS.concat([4.35]).forEach(ci => { if (t > ci) amp += 0.18 * Math.exp(-(t - ci) * 3); });
      } else if (t >= SHUT) amp = 0.05 * prog(t, SHUT, 0.45);
      const wob = amp * Math.sin(t * TAU * 2.2);

      // chick position
      let cy = HIDDEN;
      const bob = -Math.abs(Math.sin(t * TAU * 0.8)) * 18;
      if (out) {
        cy = lerp(HIDDEN, UP + bob, ease.outBack(prog(t, HATCH, 0.5)));
        if (t > SINK) cy = lerp(UP + bob, HIDDEN, ease.inOutCubic(prog(t, SINK, SHUT - SINK)));
      }
      const talk = t > 5.3 && t < 6.2 ? Math.abs(Math.sin(t * 28)) : 0;
      const flap = t > 5.0 && t < 8.8 ? Math.abs(Math.sin(t * TAU * 2.4)) * (t < 6.4 ? 1 : 0.4) : 0;
      const vis = P.clamp((HIDDEN - cy) / 60);
      if (out) {
        const mood = t < 5.1 ? 'wow' : t > 8.75 ? 'sleepy' : pulse(t, 7.3, 0.18) > 0.5 ? 'happy' : 'smile';
        chick(ctx, EX, cy, t, t > 6.2 && t < 7.2 ? 'happy' : mood, talk, flap, vis);
      }

      // bottom shell
      ctx.save();
      ctx.translate(EX, EY + B); ctx.rotate(wob); ctx.translate(-EX, -EY - B);
      piece(ctx, 'bot');
      ctx.restore();

      // nest front with twigs
      ctx.beginPath(); ctx.moveTo(285, 1235);
      ctx.bezierCurveTo(300, 1380, 780, 1380, 795, 1235);
      ctx.bezierCurveTo(700, 1290, 380, 1290, 285, 1235);
      P.cut(ctx, '#A0703F');
      ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 6;
      const r = P.rng(9);
      for (let k = 0; k < 22; k++) {
        const x = 310 + r() * 460, y = 1275 + r() * 60 - Math.abs(x - 540) * 0.12;
        ctx.strokeStyle = k % 2 ? '#7a4e2e' : '#c4955f';
        ctx.beginPath(); ctx.moveTo(x - 40, y + (r() - 0.5) * 20); ctx.lineTo(x + 40, y + (r() - 0.5) * 20); ctx.stroke();
      }
      ctx.restore();

      // top shell: on the egg, flying, or worn as a hat
      let hx = 0, hy = 0, hr = 0;
      if (out) {
        const tx = 0, ty = cy - R + 38 - Y0;
        const tilt = -0.3 * (1 - ease.inOutCubic(prog(t, SINK, SHUT - SINK))) + (t < SINK ? Math.sin(t * TAU * 0.8) * 0.05 : 0);
        const k = ease.inOutCubic(prog(t, HATCH, 0.6));
        hx = lerp(0, tx, k) + Math.sin(Math.PI * k) * 70;
        hy = lerp(0, ty, k) - Math.sin(Math.PI * k) * 330;
        hr = lerp(0, TAU + tilt, k);
      }
      ctx.save();
      ctx.translate(EX, EY + B); ctx.rotate(wob); ctx.translate(-EX, -EY - B);
      ctx.translate(EX + hx, Y0 + hy); ctx.rotate(hr); ctx.translate(-EX, -Y0);
      piece(ctx, 'top');
      ctx.restore();

      // cracks (only while the egg is whole)
      if (!out) {
        const n = 1.5 * ease.outCubic(prog(t, CRACKS[0], 0.15)) + 1.5 * ease.outCubic(prog(t, CRACKS[1], 0.15)) + 2 * ease.outCubic(prog(t, CRACKS[2], 0.15));
        ctx.save();
        ctx.translate(EX, EY + B); ctx.rotate(wob); ctx.translate(-EX, -EY - B);
        crackLine(ctx, t >= SHUT ? 5 : n, t >= SHUT ? 1 - prog(t, SHUT + 0.05, 0.35) : 1);
        ctx.restore();
      }
      CRACKS.forEach(ci => P.burstLines(ctx, EX, Y0, 180, prog(t, ci, 0.35), C.claude, 10, 7));
      P.burstLines(ctx, EX, Y0 - 40, 200, prog(t, HATCH, 0.45), C.yellow, 12, 10);
      if (t >= SHUT) P.star(ctx, EX + 80, Y0 - 60, 30 * P.pulse(t, SHUT + 0.05, 0.4), '#fff', { points: 4, inner: 0.25, shadow: false });

      // speech bubble
      const bp = ease.outBack(prog(t, 5.2, 0.3)) * (1 - ease.inCubic(prog(t, 8.7, 0.25)));
      if (bp > 0.01) P.bubble(ctx, P.typed('hello, world!', prog(t, 5.3, 0.8)) || ' ', 540, 640, 560, 745, { font: 'mono', size: 60, pop: bp });

      // hearts
      if (t > 5.8 && t < 9.1) {
        for (let k = 0; k < 4; k++) {
          const ph = ((t - 5.8) * 0.55 + k / 4) % 1;
          ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * P.clamp((9.1 - t) * 3);
          P.heart(ctx, 360 + k * 120 + Math.sin(ph * 6 + k) * 20, 1000 - ph * 260, 26, k % 2 ? C.rose : C.pink, { seed: k });
          ctx.restore();
        }
      }

      // title
      let ti = 0;
      TITLES.forEach(([s], i) => { if (t >= s) ti = i; });
      const [ts, tstr] = TITLES[ti];
      P.title(ctx, tstr, 540, 410, { size: 96, color: '#F29A38', rot: -0.03 + Math.sin(t * TAU * 0.4) * 0.02, pop: ts === 0 ? 1 : ease.outBack(prog(t, ts, 0.35)) });

      // proud parent Clawd
      const cp = ease.outBack(prog(t, 5.6, 0.5)) * (1 - ease.inCubic(prog(t, 9.1, 0.4)));
      if (cp > 0.01) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1380); ctx.clip();
        P.claude(ctx, 170, lerp(1500, 1210, cp), 105, { t, mood: 'happy', rot: Math.sin(t * TAU * 0.5) * 0.12, blink: pulse(t, 7.8, 0.15) });
        ctx.restore();
      }
      const sp = ease.outBack(prog(t, 6.0, 0.4)) * (1 - ease.inCubic(prog(t, 9.1, 0.3)));
      if (sp > 0.01) P.sticker(ctx, 'hello, little one!!', 70, 1525, { pop: sp, rot: -0.02 });

      // sounds
      [0.7, 0.95, 2.2, 3.3].forEach(k => { if (env.at(k)) SFX.tone(900, 0.05, { type: 'triangle', vol: 0.12 }); });
      CRACKS.forEach(ci => { if (env.at(ci)) crackSfx(); });
      if (env.at(4.35)) { crackSfx(); SFX.tick({ vol: 0.3, when: 0.12 }); }
      if (env.at(HATCH)) { SFX.pop({ f: 350, vol: 0.25 }); SFX.whoosh({ vol: 0.1 }); }
      if (env.at(4.9)) SFX.chirp({ vol: 0.14 });
      if (env.at(5.05)) SFX.chirp({ vol: 0.12 });
      if (env.at(5.2)) SFX.pop({ f: 620, vol: 0.12 });
      for (let k = 0; k < 13; k++) if (env.at(5.3 + k * 0.062)) SFX.tone(1100 + k * 45, 0.05, { type: 'sine', vol: 0.07 });
      if (env.at(6.3)) SFX.chirp({ vol: 0.12 });
      if (env.at(6.0)) SFX.notify({ vol: 0.1 });
      if (env.at(8.85)) SFX.tone(520, 0.7, { type: 'triangle', slide: 300, vol: 0.08, attack: 0.12 });
      if (env.at(SHUT)) { SFX.tick({ vol: 0.25 }); SFX.chime({ vol: 0.08, when: 0.1 }); }
    },
  });
})();
