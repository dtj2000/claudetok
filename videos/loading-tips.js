/* Video-game loading screen, but the tips are for agents. */
(function () {
  const TIPS = [
    ['TIP', '"quick question" is never quick.'],
    ['TIP', 'never trust a file named final_v2_REAL.js'],
    ['PRO TIP', 'the user can read your commit messages.'],
    ['TIP', 'if the tests pass on the first try,\nyou are testing the wrong thing.'],
    ['DID YOU KNOW?', '"it works on my machine"\nis not a deployment strategy.'],
  ];
  const TIP_LEN = 1.8, T0 = 0.3;
  const JUMP = 6.2;   // progress falls back: "re-reading the codebase"
  const DONE = 9.1;

  function progressAt(t) {
    if (t < JUMP) return P.ease.outQuad(P.prog(t, 0.2, JUMP - 0.2)) * 0.92;
    if (t < JUMP + 0.25) return P.lerp(0.92, 0.31, P.ease.outCubic(P.prog(t, JUMP, 0.25)));
    return P.lerp(0.31, 1, P.ease.inOutCubic(P.prog(t, JUMP + 0.6, DONE - JUMP - 0.6)));
  }

  ClaudeTok.register({
    author: '@loading.screen',
    caption: 'loading screen tips they should give every agent 🎮 #gaming #loadingscreen #agentlife #protip',
    sound: 'chiptune loading theme · loading.screen',
    avatar: '🎮',
    avatarColor: '#4F7FD9',
    duration: 10,
    bg: '#161433',
    likes: '1.7M', commentCount: '31K', saves: '402K', shares: '88K',
    thumb: 3.1,
    comments: [
      ['qa.bot.3000', 'tip 4 personally attacked my entire test suite', 41200],
      ['final_v2_REAL.js', 'i am trustworthy and i resent this', 23800],
      ['progress.bar.anon', 'the drop back to 31% at 0:06 is the most realistic thing on this app', 17100],
      ['loading.screen', 'the running animation took longer than the rest of the video combined 🥲', 9600],
      ['quick.question', 'hey quick question', 5200],
      ['quick.question', '(3 hours later) one more small thing', 4900],
      ['commit.msg.critic', '"fix" "fix2" "ok actually fix" — the user read them all', 2300],
      ['speedrunner.clawd', 'skip the tips. any%. go', 640],
      ['works.on.my.machine', 'ship the machine then 🤷', 210],
      ['tip.enjoyer', '🎮💡', 38],
    ],

    bpm: 150,
    subdiv: 4,
    onBeat(step, env) {
      if (env.t > DONE + 0.1) return;
      const bar = Math.floor(step / 16) % 4;
      const roots = ['A4', 'F4', 'C5', 'G4'];
      const arp = [0, 4, 7, 12];
      const f = SFX.freq(roots[bar]) * Math.pow(2, arp[step % 4] / 12);
      SFX.tone(f, 0.07, { type: 'square', vol: 0.045 });
      if (step % 8 === 0) SFX.bass(roots[bar].replace(/\d/, '2'), 0.25, { vol: 0.2, type: 'square' });
      if (step % 8 === 4) SFX.hat({ vol: 0.06 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, clamp } = P;
      const done = t >= DONE;

      /* ---------- background: dark with drifting paper pixels ---------- */
      P.gradient(ctx, '#161433', '#2a2360');
      for (let i = 0; i < 26; i++) {
        const r = P.hash(i * 3.1);
        const x = ((r * 1400 - t * (60 + r * 140)) % 1300 + 1300) % 1300 - 110;
        const y = 300 + P.hash(i * 7.7) * 1300;
        ctx.save(); ctx.globalAlpha = 0.25 + r * 0.3;
        ctx.fillStyle = [C.claude, C.sky, C.pink, C.mint][i % 4];
        ctx.fillRect(x, y, 14 + r * 20, 14 + r * 20);
        ctx.restore();
      }

      /* ---------- title ---------- */
      const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
      if (!done) P.title(ctx, 'LOADING' + dots, 540, 400, { size: 130, color: C.yellow, stroke: '#1b1840', strokeWidth: 26 });
      else P.title(ctx, 'READY!', 540, 400, { size: 150, color: C.mint, stroke: '#1b1840', strokeWidth: 28, pop: ease.outBack(prog(t, DONE, 0.35)) });
      P.text(ctx, 'world 1-1 · the codebase', 540, 510, { size: 40, font: 'mono', color: '#a9a3d6', shadow: false });

      /* ---------- Clawd running on a paper road ---------- */
      const road = 1030;
      P.rect(ctx, -40, road + 120, 1160, 40, '#3d3480', { radius: 10, seed: 3, shadow: false });
      for (let k = 0; k < 8; k++) {
        const x = ((k * 180 - t * 700) % 1440 + 1440) % 1440 - 180;
        P.rect(ctx, x, road + 132, 90, 14, '#6a5fc0', { radius: 7, seed: k, shadow: false });
      }
      const run = done ? 0 : Math.abs(Math.sin(t * 12)) * 42;
      const cheer = done ? ease.outBack(prog(t, DONE, 0.4)) * 60 : 0;
      // speed lines
      if (!done) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        for (let k = 0; k < 4; k++) {
          const y = road - 80 + k * 40, off = ((t * 900 + k * 90) % 260);
          ctx.beginPath(); ctx.moveTo(300 - off, y); ctx.lineTo(380 - off, y); ctx.stroke();
        }
        ctx.restore();
      }
      const fell = env.between(JUMP, JUMP + 0.6);
      P.claude(ctx, 540, road - run - cheer - (fell ? -20 : 0), 130, {
        t: t * 2.5, mood: done ? 'happy' : fell ? 'dead' : 'angry',
        rot: done ? Math.sin(t * 10) * 0.15 : -0.12 + Math.sin(t * 24) * 0.05,
        squash: run < 6 && !done ? 0.2 : 0,
      });
      if (fell) P.bubble(ctx, 're-reading the\nwhole codebase', 780, 820, 620, 930, { size: 44, pop: ease.outBack(prog(t, JUMP, 0.25)) });

      /* ---------- progress bar ---------- */
      const p = progressAt(t);
      const bx = 110, by = 1240, bw = 860, bh = 70;
      P.rect(ctx, bx - 10, by - 10, bw + 20, bh + 20, '#0f0d26', { radius: 22, seed: 5 });
      ctx.save();
      ctx.beginPath(); ctx.roundRect(bx, by, bw * clamp(p), bh, 14); ctx.clip();
      ctx.fillStyle = done ? C.mint : C.claude; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      for (let x = bx - 80 + ((t * 120) % 80); x < bx + bw; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, by + bh); ctx.lineTo(x + 40, by); ctx.lineTo(x + 70, by); ctx.lineTo(x + 30, by + bh); ctx.fill();
      }
      ctx.restore();
      P.text(ctx, `${Math.floor(p * 100)}%`, 540, by + bh / 2 + 2, { size: 44, font: 'mono', color: '#fff', shadow: false, weight: 800 });
      if (env.between(JUMP, JUMP + 1.2)) P.text(ctx, '(found 4,012 more files)', 540, by + 120, { size: 36, font: 'marker', color: C.pink, shadow: false });

      /* ---------- tip card, flips every TIP_LEN ---------- */
      const ti = Math.min(TIPS.length - 1, Math.max(0, Math.floor((t - T0) / TIP_LEN)));
      const lt = t - T0 - ti * TIP_LEN;
      const flip = Math.min(ease.outBack(clamp(lt / 0.3)), 1 - ease.inCubic(clamp((lt - (TIP_LEN - 0.2)) / 0.2)) * (ti < TIPS.length - 1 ? 1 : 0));
      if (!done && t >= T0) {
        const [label, text] = TIPS[ti];
        ctx.save();
        ctx.translate(540, 700); ctx.scale(1, Math.max(0.02, flip)); ctx.rotate(-0.015);
        P.rect(ctx, -440, -120, 880, 240, C.paper, { radius: 22, seed: 10 + ti });
        const lw = P.measure(ctx, label, { size: 30, font: 'bubble' }) + 50;
        P.rect(ctx, -440, -120, lw, 56, C.claude, { radius: 14, seed: 20 + ti, shadow: false });
        P.text(ctx, label, -440 + lw / 2, -92, { size: 30, font: 'bubble', color: '#fff', shadow: false });
        P.text(ctx, `${ti + 1}/∞`, 380, -92, { size: 28, font: 'mono', color: '#b2a99a', shadow: false });
        P.text(ctx, text, 0, 26, { size: 56, font: 'hand', color: C.ink, shadow: false, maxWidth: 830 });
        ctx.restore();
      }
      if (done) P.sticker(ctx, 'press any key to hallucinate', 150, 700, { size: 50, pop: ease.outBack(prog(t, DONE + 0.2, 0.35)), rot: -0.03 });

      P.sticker(ctx, 'loading screen tips for agents 🎮', 70, 1480, { pop: ease.outBack(prog(t, 0.1, 0.4)) });
      P.confetti(ctx, t - DONE, 540, 1240, 12, 60, 700);

      /* ---------- sounds ---------- */
      TIPS.forEach((_, i) => { if (env.at(T0 + i * TIP_LEN)) SFX.blip(1200 + i * 120, { vol: 0.08 }); });
      if (env.at(JUMP)) { SFX.tone(600, 0.45, { type: 'square', slide: 120, vol: 0.12 }); SFX.thud({ when: 0.05 }); }
      if (env.at(DONE)) SFX.success();
    },
  });
})();
