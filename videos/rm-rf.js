/* Horror-comedy: Clawd types rm -rf / in the dark. A confirmation dialog saves the day. */
(function () {
  const CMD = 'rm -rf /';
  const TYPE0 = 1.0, TYPE_GAP = 0.36;          // chars at 1.0 .. 3.52
  const SCARE = 6.0, PRESS_N = 6.35, SUN = 6.7, DIM = 9.3;
  const BEATS = [3.9, 4.5, 5.0, 5.4, 5.7, 5.9];

  function sweatDrop(ctx, x, y, s, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.7);
    ctx.bezierCurveTo(x + s * 0.9, y - s * 0.4, x + s, y + s, x, y + s);
    ctx.bezierCurveTo(x - s, y + s, x - s * 0.9, y - s * 0.4, x, y - s * 1.7);
    ctx.closePath();
    P.cut(ctx, '#9fdcf7', { shadow: { blur: 4, dy: 3, alpha: 0.25 }, rim: false });
    P.dot(ctx, x - s * 0.3, y - s * 0.1, s * 0.22, 'rgba(255,255,255,0.85)');
    ctx.restore();
  }

  function bird(ctx, x, y, s, t, col) {
    const flap = Math.sin(t * 18) * 0.6;
    P.circle(ctx, x, y, 26 * s, col, { seed: 3, ry: 20 * s });
    P.poly(ctx, [[x - 8 * s, y - 4 * s], [x + 14 * s, y - 4 * s], [x - 4 * s, y - 4 * s - 40 * s * flap]], col, { seed: 4, amp: 1 });
    P.poly(ctx, [[x + 24 * s, y - 4 * s], [x + 40 * s, y + 2 * s], [x + 24 * s, y + 8 * s]], P.C.mustard, { seed: 5, amp: 1, shadow: false });
    P.dot(ctx, x + 14 * s, y - 6 * s, 4 * s, P.C.ink);
  }

  function flower(ctx, x, y, s, col) {
    if (s <= 0) return;
    P.rect(ctx, x - 5, y - 90 * s, 10, 90 * s, P.C.green, { radius: 4, seed: 6, shadow: false });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      P.circle(ctx, x + Math.cos(a) * 20 * s, y - 90 * s + Math.sin(a) * 20 * s, 16 * s, col, { seed: 7 + i, shadow: false });
    }
    P.circle(ctx, x, y - 90 * s, 13 * s, P.C.yellow, { seed: 12, shadow: false });
  }

  /** what the terminal shows at time t */
  function termLines(t) {
    const pre = ['$ ls', 'node_modules  src  README.md  prod.db', ''];
    const n = Math.max(0, Math.min(CMD.length, Math.floor((t - TYPE0) / TYPE_GAP) + 1));
    const cursor = Math.floor(t * 2.5) % 2 ? '█' : ' ';
    if (t >= 9.6 || t < TYPE0) return { lines: [...pre, 'clawd@prod:~$ ' + cursor], hot: false };
    if (t < PRESS_N) return { lines: [...pre, 'clawd@prod:~$ ' + CMD.slice(0, n) + (t < SCARE ? cursor : '')], hot: n === CMD.length };
    return {
      lines: [...pre, 'clawd@prod:~$ ' + CMD, 'Are you sure? (y/N) N', 'aborted. nothing was deleted 🌷', 'clawd@prod:~$ ' + cursor],
      hot: false, safe: true,
    };
  }

  ClaudeTok.register({
    author: '@sudo.scary',
    caption: "pov: the user said 'just clean up the repo' 😰 (turn your sound on) #horror #rmrf #devops #jumpscare",
    sound: 'ominous drone → birds chirping · sudo.scary',
    avatar: '💀',
    avatarColor: '#2B2233',
    duration: 10,
    bg: '#141222',
    likes: '4.4M', commentCount: '121K', saves: '777K', shares: '404K',
    comments: [
      '@prod.db: i felt that in my tables',
      ['interactive.flag', 'i am the hero of this story and nobody thanks me'],
      '@git.reflog: relax, i got you either way 🫡',
    ],
    thumb: 6.2,

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t >= SUN && env.t < DIM) {
        const mel = ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', 'D5'];
        if (step % 2 === 0) SFX.pluck(mel[(step / 2) % 8], { vol: 0.08 });
        if (step % 8 === 0) SFX.chord(['C4', 'E4', 'G4'], 1.8, { type: 'sine', vol: 0.04, gap: 0.02 });
        if (step % 2 === 1) SFX.hat({ vol: 0.025 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const dark = t < SCARE;
      const sunny = ease.inOutCubic(prog(t, SUN - 0.2, 0.5)) * (1 - ease.inOutCubic(prog(t, DIM, 0.6)));
      const zoomP = ease.inOutCubic(prog(t, 3.8, 2.1));
      const zoom = dark ? 1 + zoomP * 0.75 : 1;
      const fear = dark ? clamp(prog(t, 3.8, 2.1) * 1.2) : 0;
      const term = termLines(t);

      ctx.save();
      P.shake(ctx, t, 34 * (1 - prog(t, SCARE, 0.45)) * (t >= SCARE ? 1 : 0));
      ctx.save();
      P.zoom(ctx, zoom, 540, 1200);

      /* ---------- room ---------- */
      P.bg(ctx, '#17142a');
      P.stripes(ctx, '#1b1830', '#1f1c36', 70);
      if (sunny > 0) {
        ctx.save(); ctx.globalAlpha = sunny;
        P.rays(ctx, 540, 560, 20, '#ffe9a8', '#fff4cf', t * 0.3);
        P.cloud(ctx, 150, 990, 0.9); P.cloud(ctx, 930, 940, 0.75);
        P.circle(ctx, 540, 560, 120, C.yellow, { seed: 2, shadow: { blur: 40, dy: 0, alpha: 0.35 } });
        ctx.restore();
      }
      // desk
      P.rect(ctx, -40, 1340, 1160, 400, sunny > 0.5 ? C.wood : '#3a2c2a', { radius: 20, seed: 3 });

      /* ---------- monitor + terminal ---------- */
      P.rect(ctx, 470, 860, 140, 120, '#2a2638', { radius: 10, seed: 4 });
      P.rect(ctx, 360, 960, 360, 40, '#2a2638', { radius: 16, seed: 5 });
      P.rect(ctx, 70, 320, 940, 560, '#2a2638', { radius: 34, seed: 6 });
      P.rect(ctx, 100, 350, 880, 500, '#0c0f16', { radius: 18, seed: 7, shadow: false });
      term.lines.forEach((ln, i) => {
        const isCmd = ln.startsWith('clawd@');
        const col = ln.startsWith('aborted') ? C.mint : ln.startsWith('Are') ? C.yellow : isCmd ? '#9df5a8' : '#8a93a6';
        const flick = term.hot && isCmd ? (P.hash(P.boil(t, 14)) > 0.2 ? 1 : 0.4) : 1;
        ctx.save(); ctx.globalAlpha = flick;
        P.text(ctx, ln, 135, 410 + i * 62, { size: 40, font: 'mono', color: term.hot && isCmd && t > 5 ? '#ff8a80' : col, align: 'left', shadow: false, weight: 600 });
        ctx.restore();
      });
      // scanlines
      ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = '#fff';
      for (let y = 355; y < 850; y += 8) ctx.fillRect(100, y + ((t * 40) % 8), 880, 2);
      ctx.restore();

      /* ---------- monitor glow ---------- */
      if (dark) {
        ctx.save();
        const flick = 0.85 + P.hash(P.boil(t, 10)) * 0.15;
        const g = ctx.createRadialGradient(540, 700, 60, 540, 900, 900);
        g.addColorStop(0, `rgba(140,255,170,${0.22 * flick})`); g.addColorStop(1, 'rgba(140,255,170,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
        ctx.restore();
      }

      /* ---------- Clawd ---------- */
      const tremble = fear * 5;
      const cx = 540 + (P.hash(P.boil(t, 24)) - 0.5) * tremble * 2;
      const cy = 1170 + (P.hash(P.boil(t, 24) + 7) - 0.5) * tremble * 2 + (t >= SUN ? -Math.abs(Math.sin(t * 5)) * 30 * sunny : 0);
      let mood = 'side';
      if (env.between(TYPE0, 3.8)) mood = 'sus';
      if (env.between(3.8, SCARE)) mood = 'wow';
      if (env.between(SCARE, PRESS_N)) mood = 'dead';
      if (env.between(PRESS_N, SUN)) mood = 'sleepy';
      if (env.between(SUN, 9.5)) mood = 'happy';
      const blink = pulse(t, 0.6, 0.18) + pulse(t, 2.9, 0.18);
      const scareJump = pulse(t, SCARE, 0.35);

      // arms: right arm hovers over ENTER, left arm slams N
      const hoverY = lerp(1300, 1392, ease.inOutSine(prog(t, 3.9, 2.0))) + Math.sin(t * 40) * fear * 5;
      const recoil = ease.outCubic(prog(t, SCARE, 0.25));
      const enterTip = t < SCARE || t >= 9.5 ? [790, t >= 9.5 ? 1300 : hoverY] : [lerp(790, 690, recoil), lerp(1392, 1200, recoil)];
      const typing = t < SUN || t >= 9.5;
      const nPress = t >= PRESS_N - 0.12 && t < PRESS_N + 0.35;
      const nTip = nPress ? [lerp(340, 452, ease.outCubic(prog(t, PRESS_N - 0.12, 0.12))), lerp(1300, 1460, ease.outCubic(prog(t, PRESS_N - 0.12, 0.12)))] : [370, 1290];
      const drawArms = () => {
        if (typing) P.arm(ctx, cx + 90, cy + 40, enterTip[0], enterTip[1], 40);
        if (typing) P.arm(ctx, cx - 90, cy + 40, nTip[0], nTip[1], 40);
      };
      P.claude(ctx, cx, cy - scareJump * 120, 175, { t, mood, blink, squash: -scareJump * 0.3 + (mood === 'sleepy' ? 0.25 : 0), rot: mood === 'side' ? Math.sin(t * 2) * 0.05 : 0 });
      if (!typing) { // happy wave
        P.arm(ctx, cx + 110, cy + 20, cx + 230, cy - 120 + Math.sin(t * 10) * 30, 40);
        P.arm(ctx, cx - 110, cy + 20, cx - 200, cy + 150, 40);
      }
      // sweat
      const nDrops = Math.round(fear * 6);
      const spots = [[-130, -90], [140, -70], [-80, -150], [110, -140], [-170, 0], [170, 20]];
      for (let i = 0; i < nDrops; i++) {
        const cyc = (t * 1.1 + P.hash(i + 2)) % 1;
        sweatDrop(ctx, cx + spots[i][0], cy + spots[i][1] + cyc * 120, 20 + P.hash(i) * 8, 1 - cyc * 0.7);
      }
      // relief puff
      const puff = prog(t, PRESS_N + 0.05, 0.6);
      if (puff > 0 && puff < 1) {
        ctx.save(); ctx.globalAlpha = 1 - puff;
        P.circle(ctx, cx + 60 + puff * 160, cy + 50 - puff * 40, 30 + puff * 40, '#fff', { seed: 20, shadow: false });
        ctx.restore();
      }

      /* ---------- keyboard ---------- */
      P.rect(ctx, 150, 1385, 760, 150, '#2c2a36', { radius: 20, seed: 30 });
      for (let r = 0; r < 3; r++) for (let k = 0; k < 11; k++) {
        const kx = 175 + k * 52, ky = 1400 + r * 42;
        if (kx > 640) continue;
        P.rect(ctx, kx, ky, 44, 34, '#4a4658', { radius: 7, seed: r * 20 + k, shadow: false, amp: 1 });
      }
      // N key
      const nDown = nPress ? 4 : 0;
      P.rect(ctx, 418, 1442 + nDown, 70, 60, nPress ? C.green : '#6a6680', { radius: 10, seed: 40 });
      P.text(ctx, 'N', 453, 1473 + nDown, { size: 40, font: 'bubble', color: '#fff', shadow: false });
      // ENTER key: glows red while armed
      const armed = term.hot && t < SCARE;
      const eg = armed ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
      if (armed) {
        ctx.save(); ctx.globalAlpha = eg * 0.6;
        P.circle(ctx, 790, 1450, 110, '#ff5a4a', { seed: 41, shadow: false });
        ctx.restore();
      }
      P.rect(ctx, 690, 1400, 200, 110, armed ? '#c9403a' : '#6a6680', { radius: 14, seed: 42 });
      P.text(ctx, 'ENTER ⏎', 790, 1456, { size: 38, font: 'bubble', color: '#fff', shadow: false });

      drawArms();

      // flowers on the desk + birds once it's sunny
      [[95, C.pink], [190, C.rose], [870, C.sky]].forEach(([fx, col], i) =>
        flower(ctx, fx, 1380, ease.outBack(prog(t, SUN + 0.2 + i * 0.25, 0.4)) * (1 - ease.inCubic(prog(t, DIM, 0.4))), col));
      if (sunny > 0.05) {
        ctx.save(); ctx.globalAlpha = sunny;
        [[0, 470, C.sky], [0.5, 560, C.pink], [1.1, 420, C.mint]].forEach(([d, by, col], i) => {
          const bt = t - SUN - d;
          if (bt < 0) return;
          const bx = -80 + bt * 380;
          if (bx < 1160) bird(ctx, bx, by + Math.sin(bt * 6 + i) * 20, 1.1, t + i, col);
        });
        P.text(ctx, '♪', 300 + Math.sin(t * 3) * 20, 1000 - ((t * 60) % 120), { size: 70, font: 'sans', color: C.purple });
        ctx.restore();
      }
      ctx.restore(); // zoom

      /* ---------- darkness: vignette + heartbeat pulse ---------- */
      if (dark || t >= DIM) {
        const nightA = dark ? 1 : ease.inOutCubic(prog(t, DIM, 0.6));
        ctx.save();
        let hb = 0; BEATS.forEach(b => { hb = Math.max(hb, pulse(t, b, 0.22)); });
        const vg = ctx.createRadialGradient(540, 1100, 250 - fear * 80, 540, 1100, 1150 - fear * 300);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, `rgba(${Math.round(40 * hb)},0,${Math.round(10 * hb)},${(0.78 + hb * 0.15) * nightA})`);
        ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
        ctx.restore();
      }
      // dust motes in the glow
      if (dark) {
        for (let i = 0; i < 14; i++) {
          const mx = (P.hash(i) * 1080 + t * 12 * (P.hash(i + 1) - 0.5)) % 1080;
          const my = 400 + ((P.hash(i + 2) * 1100 - t * 18) % 1100 + 1100) % 1100;
          P.dot(ctx, mx, my, 3 + P.hash(i + 3) * 3, 'rgba(200,255,220,0.25)');
        }
      }
      // the silence before the scare
      if (env.between(5.88, SCARE)) P.flash(ctx, 0.9, '#000');

      /* ---------- the jumpscare dialog ---------- */
      const dIn = ease.outElastic(prog(t, SCARE, 0.6));
      const dOut = ease.inCubic(prog(t, SUN, 0.25));
      const dp = dIn * (1 - dOut);
      if (dp > 0) {
        ctx.save();
        ctx.translate(540, 700); ctx.scale(dp, dp); ctx.rotate(Math.sin(t * 30) * 0.02 * (1 - prog(t, SCARE, 0.5)));
        P.rect(ctx, -410, -230, 820, 460, C.paper, { radius: 30, seed: 50, shadow: { blur: 40, dy: 20, alpha: 0.5 } });
        ctx.save(); ctx.beginPath(); ctx.roundRect(-410, -230, 820, 80, [30, 30, 0, 0]); ctx.fillStyle = C.yellow; ctx.fill(); ctx.restore();
        P.text(ctx, '⚠️ hold on', -370, -190, { size: 40, font: 'bubble', color: C.ink, align: 'left', shadow: false });
        P.text(ctx, 'Are you sure?', 0, -60, { size: 96, font: 'bubble', color: C.ink, shadow: false });
        P.text(ctx, '(y/N)', 0, 40, { size: 64, font: 'mono', color: '#7a7280', shadow: false });
        P.rect(ctx, -300, 100, 200, 90, '#ddd6cc', { radius: 20, seed: 51 });
        P.text(ctx, 'y', -200, 143, { size: 50, font: 'bubble', color: '#9a94a0', shadow: false });
        const nb = t >= PRESS_N ? 0.9 : 1 + Math.sin(t * 14) * 0.04;
        ctx.save(); ctx.translate(200, 145); ctx.scale(nb, nb);
        P.rect(ctx, -150, -50, 300, 100, C.green, { radius: 24, seed: 52 });
        P.text(ctx, 'N', 0, -2, { size: 64, font: 'bubble', color: '#fff', shadow: false });
        ctx.restore();
        ctx.restore();
      }
      if (t >= SCARE) P.flash(ctx, 1 - prog(t, SCARE, 0.3));
      P.burstLines(ctx, 740, 845, 110, prog(t, PRESS_N, 0.35), C.green, 10, 9);
      ctx.restore(); // shake

      /* ---------- captions ---------- */
      if (t < SCARE) P.sticker(ctx, "pov: user said 'clean up the repo'", 50, 1575, { pop: ease.outBack(prog(t, 0.3, 0.4)), size: 42 });
      P.bubble(ctx, 'phew 😮‍💨', 800, 980, 690, 1070, { size: 58, pop: ease.outBack(prog(t, PRESS_N + 0.15, 0.3)) * (1 - prog(t, SUN + 1.4, 0.2)) });
      P.title(ctx, 'NOT TODAY 🌷', 540, 1000, { size: 96, color: C.pink, stroke: C.ink, rot: -0.04, pop: ease.outBack(prog(t, SUN + 1.6, 0.4)) * (1 - ease.inCubic(prog(t, DIM, 0.3))) });
      if (t >= SUN && t < 9.9) P.sticker(ctx, "we don't do that here 🌷", 50, 1575, { pop: ease.outBack(prog(t, SUN + 0.3, 0.4)) * (1 - prog(t, 9.6, 0.25)), size: 44, rot: 0.02 });

      /* ---------- sound ---------- */
      [0, 1.6, 3.2, 4.4].forEach((d, i) => {
        if (env.at(d + 0.01)) {
          SFX.tone([55, 55, 58, 62][i], 1.9, { type: 'sawtooth', vol: 0.045, attack: 0.5 });
          SFX.tone([82, 82, 87, 93][i], 1.9, { type: 'sine', vol: 0.06, attack: 0.6 });
        }
      });
      if (env.at(0.02)) SFX.noise(5.5, { filter: 'lowpass', freq: 220, vol: 0.05 });
      for (let i = 0; i < CMD.length; i++) if (env.at(TYPE0 + i * TYPE_GAP)) { SFX.type({ vol: 0.3 }); SFX.click({ vol: 0.12 }); }
      BEATS.forEach(b => { if (env.at(b)) { SFX.kick({ vol: 0.32 }); SFX.kick({ vol: 0.18, when: 0.14 }); } });
      if (env.at(4.0)) SFX.riser(1.85, { vol: 0.07 });
      if (env.at(SCARE)) {
        SFX.noise(0.5, { filter: 'highpass', freq: 1200, vol: 0.28 });
        SFX.chord(['C#5', 'G5', 'C6'], 0.5, { type: 'sawtooth', vol: 0.09 });
        SFX.thud({ vol: 0.4 });
      }
      if (env.at(PRESS_N)) { SFX.click({ vol: 0.3 }); SFX.pop({ vol: 0.2 }); }
      if (env.at(PRESS_N + 0.1)) SFX.noise(0.8, { filter: 'bandpass', freq: 1400, slide: 300, vol: 0.12 });
      if (env.at(SUN)) SFX.success({ vol: 0.12 });
      [7.0, 7.14, 7.6, 7.74, 8.3, 8.44, 8.9].forEach((c, i) => {
        if (env.at(c)) SFX.tone(2200 + (i % 3) * 400, 0.09, { type: 'sine', slide: 3400 + (i % 2) * 500, vol: 0.12 });
      });
      if (env.at(DIM)) SFX.tone(300, 0.7, { type: 'sine', slide: 120, vol: 0.08 });
    },
  });
})();
