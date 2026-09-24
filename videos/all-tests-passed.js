/* $ npm test. 30 pending tests turn green one by one, each ding a little
 * higher. One is flaky. Then: the best sound in the world. */
(function () {
  const COLS = 6, ROWS = 5, N = COLS * ROWS, FLAKY = 17;
  const RED_T = 3.6, GREEN_T = 4.55, WIN_T = 5.8, RESET_T = 8.55, DUR = 9.4;

  // diagonal wave order: top-left to bottom-right
  const cells = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) cells.push({ i, j });
  cells.sort((a, b) => (a.i + a.j) - (b.i + b.j) || a.j - b.j);
  cells.forEach((c, k) => {
    c.k = k;
    c.x = 500 + (c.i - 2.5) * 124;
    c.y = 530 + c.j * 118;
    c.t = k < FLAKY ? 0.5 + 3.1 * Math.pow(k / FLAKY, 0.8)
      : k === FLAKY ? RED_T
        : 4.75 + (k - FLAKY - 1) * 0.075;
    c.pass = k === FLAKY ? GREEN_T : c.t;
    c.reset = RESET_T + (N - 1 - k) * 0.016;
    c.f = 440 * Math.pow(2, (k * 0.85) / 12);
  });
  const fl = cells[FLAKY];

  const ding = (f, v) => {
    SFX.tone(f, 0.45, { type: 'sine', vol: v });
    SFX.tone(f * 2.01, 0.22, { type: 'sine', vol: v * 0.3 });
  };

  ClaudeTok.register({
    author: '@all.green',
    caption: 'the ding ding ding when every test goes green 🥹 (one was flaky, we don\'t talk about it) #asmr #oddlysatisfying #npmtest #ci',
    sound: 'ding ding ding (exit code 0) · all.green',
    avatar: '✅',
    avatarColor: '#5DB36A',
    duration: DUR,
    bg: '#264d45',
    thumb: 6.4,
    likes: '3.8M', commentCount: '61K', saves: '702K', shares: '233K',
    comments: [
      '@flaky.test: i passed on retry, that counts 😇',
      ['ci.runner', 'green on my machine too for once'],
      '@claude: i did not skip any tests. i did not. (i did not)',
    ],

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const won = t >= WIN_T && t < RESET_T + 0.3;

      // ---- background
      if (won) P.rays(ctx, 500, 760, 18, '#4f9e5c', '#5fb26c', t * 0.25);
      else P.grid(ctx, '#264d45', 'rgba(255,255,255,0.08)', 60);

      // ---- camera
      ctx.save();
      const z = ease.inOutCubic(prog(t, RED_T, 0.35)) * (1 - ease.inOutCubic(prog(t, GREEN_T + 0.15, 0.4)));
      if (z > 0) P.zoom(ctx, 1 + 0.14 * z, fl.x, fl.y);
      const punch = pulse(t, WIN_T, 0.35);
      if (punch > 0) P.zoom(ctx, 1 + 0.05 * punch, 500, 760);
      if (t > RED_T && t < RED_T + 0.35) P.shake(ctx, t, 12 * (1 - prog(t, RED_T, 0.35)));

      // ---- terminal
      P.window(ctx, 90, 300, 820, 930, '~/agent — zsh', { bg: '#262a38', titleColor: '#d9d4e8', bar: 'rgba(255,255,255,0.06)', seed: 7 });
      const cmd = '$ npm test';
      const typedCmd = cmd.slice(0, 2 + Math.floor((cmd.length - 2) * prog(t, 0, 0.4)));
      P.text(ctx, typedCmd, 140, 418, { size: 42, font: 'mono', align: 'left', color: C.mint, shadow: false });
      if (Math.floor(t * 3) % 2 === 0) {
        const cw = P.measure(ctx, typedCmd, { size: 42, font: 'mono' });
        ctx.save(); ctx.fillStyle = C.mint; ctx.fillRect(146 + cw, 396, 22, 44); ctx.restore();
      }

      // ---- the test grid
      let passedF = 0, passed = 0;
      cells.forEach((c) => {
        const isF = c.k === FLAKY;
        const on = t >= c.t && t < c.reset;
        const green = t >= c.pass && t < c.reset;
        if (green) passed++;
        passedF += t < c.reset ? prog(t, c.pass, 0.25) : 0;
        const bob = Math.sin(t * 5 - (c.i + c.j) * 0.7) * 0.04;
        const shrink = 1 - ease.inCubic(prog(t, c.reset - 0.14, 0.14));

        ctx.save();
        ctx.translate(c.x, c.y);
        if (!on) {
          // pending: dark disc with a spinning arc
          const back = t >= c.reset ? ease.outBack(prog(t, c.reset, 0.3)) : 1;
          const s = (1 + bob) * back;
          if (s > 0.01) {
            ctx.scale(s, s);
            P.circle(ctx, 0, 0, 44, '#3a3f52', { seed: c.k + 1, shadow: { blur: 6, dy: 4, alpha: 0.3 } });
            ctx.strokeStyle = '#8b90a8'; ctx.lineWidth = 7; ctx.lineCap = 'round';
            const a = t * 5 + c.k * 0.7;
            ctx.beginPath(); ctx.arc(0, 0, 22, a, a + Math.PI * 1.2); ctx.stroke();
          }
        } else if (!green) {
          // the flaky one: red X + retry spinner
          const pp = lerp(0.4, 1, ease.outBack(prog(t, c.t, 0.3)));
          ctx.scale(pp, pp);
          P.circle(ctx, 0, 0, 46, C.red, { seed: 99 });
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-15, -15); ctx.lineTo(15, 15); ctx.moveTo(15, -15); ctx.lineTo(-15, 15); ctx.stroke();
          ctx.strokeStyle = C.yellow; ctx.lineWidth = 7;
          const a = t * 9;
          ctx.beginPath(); ctx.arc(0, 0, 60, a, a + Math.PI * 1.3); ctx.stroke();
        } else {
          const jump = pulse(t, WIN_T + (c.i + c.j) * 0.045, 0.32);
          const pp = lerp(0.4, 1, ease.outBack(prog(t, c.pass, isF ? 0.45 : 0.3))) * shrink * (1 + bob * 0.5);
          ctx.translate(0, -34 * jump);
          if (pp > 0.01) {
            ctx.scale(pp, pp);
            P.check(ctx, 0, 0, 46, prog(t, c.pass + 0.03, 0.2), isF ? '#4fb85e' : C.green);
          }
        }
        ctx.restore();
        P.burstLines(ctx, c.x, c.y, isF ? 64 : 52, prog(t, c.pass, isF ? 0.5 : 0.35), isF ? C.yellow : C.mint, 8, isF ? 9 : 6);

        if (env.at(c.t)) {
          if (isF) { SFX.error({ vol: 0.07 }); SFX.thud({ vol: 0.25 }); }
          else { ding(c.f, 0.085); SFX.tick({ vol: 0.12 }); }
        }
      });
      if (env.at(RED_T + 0.35) || env.at(RED_T + 0.65)) SFX.tick({ vol: 0.3 });
      if (env.at(GREEN_T)) { ding(fl.f * 1.5, 0.14); SFX.chirp({ vol: 0.1 }); }

      // "flaky" tag over the red one
      const tagP = ease.outBack(prog(t, RED_T + 0.1, 0.3)) * (1 - ease.inCubic(prog(t, GREEN_T + 0.2, 0.2)));
      if (tagP > 0.01) {
        ctx.save();
        ctx.translate(fl.x, fl.y - 88); ctx.rotate(-0.06 + Math.sin(t * 12) * 0.03); ctx.scale(tagP, tagP);
        P.rect(ctx, -95, -30, 190, 60, C.yellow, { radius: 12, seed: 4 });
        P.text(ctx, 'flaky 😬', 0, 2, { size: 36, font: 'marker', color: C.ink, shadow: false });
        ctx.restore();
      }

      // ---- status line + progress bar
      const failing = t >= RED_T && t < GREEN_T;
      P.text(ctx, failing ? '✗ 1 failed  ↻ retry 1/3' : `✓ ${passed} passed`, 140, 1100, {
        size: 38, font: 'mono', align: 'left', color: failing ? '#ff8f8f' : C.mint, shadow: false,
      });
      P.text(ctx, `${passed}/${N}`, 860, 1100, { size: 38, font: 'mono', align: 'right', color: '#d9d4e8', shadow: false });
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.roundRect(140, 1145, 720, 30, 15); ctx.fill();
      const bw = 720 * clamp(passedF / N);
      if (bw > 4) {
        ctx.fillStyle = failing ? C.red : C.green;
        ctx.beginPath(); ctx.roundRect(140, 1145, Math.max(30, bw), 30, 15); ctx.fill();
      }
      ctx.restore();
      ctx.restore(); // camera

      // ---- the payoff
      if (t >= WIN_T && t < WIN_T + 0.25) P.flash(ctx, 0.55 * (1 - prog(t, WIN_T, 0.25)));
      if (won) P.confetti(ctx, t - WIN_T, 500, 700, 4, 80, 800);
      const out = 1 - ease.inCubic(prog(t, RESET_T - 0.2, 0.3));
      const tp = ease.outBack(prog(t, WIN_T, 0.5)) * out;
      if (won && tp > 0.01) {
        P.title(ctx, 'all tests\npassed', 500, 720 + Math.sin(t * 3) * 8, { size: 150, color: C.yellow, rot: -0.05, pop: tp, lineHeight: 1.0 });
        const ep = ease.outBack(prog(t, WIN_T + 0.4, 0.35)) * out;
        if (ep > 0.01) {
          ctx.save();
          ctx.translate(500, 930); ctx.rotate(0.04); ctx.scale(ep, ep);
          P.rect(ctx, -150, -38, 300, 76, C.paper, { radius: 14, seed: 12 });
          P.text(ctx, 'exit code 0', 0, 2, { size: 40, font: 'mono', color: C.teal, shadow: false });
          ctx.restore();
        }
      }
      if (env.at(WIN_T)) { SFX.success({ vol: 0.18 }); SFX.chime({ vol: 0.12, when: 0.25 }); }
      if (env.at(RESET_T - 0.2)) SFX.swoosh({ vol: 0.12 });

      // ---- Clawd, nervously watching the run
      const hop = pulse(t, WIN_T, 0.45) * 90 + (won ? Math.abs(Math.sin((t - WIN_T) * 5)) * 18 * out : 0);
      const cx = 780, cy = 1440 - hop + Math.sin(t * 2) * 4;
      const mood = failing ? 'wow' : won ? 'happy' : t >= GREEN_T ? 'smile' : 'side';
      const r = 108;
      P.claude(ctx, cx, cy, r, { t, mood, squash: hop > 5 ? -0.12 : 0, blink: pulse(t, 1.8, 0.16) + pulse(t, 5.1, 0.16) });
      if (won && t > WIN_T + 0.3) {
        // tears of joy
        const s = r * 0.42, ey = cy + r * 0.02 - s * 0.05;
        for (let side = -1; side <= 1; side += 2) for (let d = 0; d < 2; d++) {
          const ph = ((t - WIN_T) * 1.3 + d * 0.5) % 1;
          const tx = cx + side * (s * 0.38 + ph * 26), ty = ey + 14 + ph * 100;
          ctx.save(); ctx.globalAlpha = (1 - ph * ph) * out;
          ctx.fillStyle = '#9fd8ff';
          ctx.beginPath(); ctx.moveTo(tx, ty - 16); ctx.lineTo(tx - 9, ty); ctx.arc(tx, ty, 9, Math.PI, 0, true); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
      if (failing) P.bubble(ctx, 'nooo 😰', 560, 1320, 690, 1400, { size: 50, pop: ease.outBack(prog(t, RED_T + 0.15, 0.3)) });
      else if (won) P.bubble(ctx, 'the sound 🥹', 540, 1300, 690, 1390, { size: 50, pop: ease.outBack(prog(t, WIN_T + 0.6, 0.3)) * out });

      P.sticker(ctx, 'best sound ever 🥹', 70, 1530, { pop: ease.outBack(prog(t, 0.2, 0.4)) });
    },
  });
})();
