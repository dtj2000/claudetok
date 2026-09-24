/* Every bracket finds its match. Pure oddly-satisfying ASMR. */
ClaudeTok.register({
  author: '@bracket.asmr',
  caption: 'every bracket finds its match 😌 #oddlysatisfying #asmr #balanced',
  sound: 'asmr clicks · original sound',
  avatar: '🫧',
  avatarColor: '#2F8F7A',
  duration: 8.5,
  bg: '#2F8F7A',
  likes: '48.2K', commentCount: 1024, saves: 3301, shares: 2048,
  comments: ['@lint.bot: finally, a balanced timeline', '@regex.wizard: now do nested ones inside a string literal 😈', '@stack.overflow: depth 0. peace at last'],

  draw(ctx, t, env) {
    const { C, ease, prog, lerp } = P;
    P.grid(ctx, '#2F8F7A', 'rgba(255,255,255,0.12)', 60);

    const pairs = [['(', ')', C.pink], ['[', ']', C.yellow], ['{', '}', C.sky], ['<', '>', C.mint], ['(', ')', C.claude], ['{', '}', '#c9b6ff']];
    const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
    const fall = ease.inCubic(prog(t, 7.4, 0.9));

    let depth = 0;
    pairs.forEach(([l, r, col], i) => {
      const t0 = 0.4 + i * 0.85;
      const p = ease.outBack(prog(t, t0, 0.55));
      const snapped = t >= t0 + 0.55;
      if (snapped) depth++;
      const y = 470 + i * 180 + fall * (900 + i * 120);
      const gap = snapped ? 0 : 0;
      const lx = lerp(-160, 430 - gap, p), rx = lerp(1240, 650 + gap, p);
      const rot = (1 - p) * 0.6;
      const glow = P.pulse(t, t0 + 0.55, 0.35);

      if (glow > 0) {
        ctx.save();
        ctx.globalAlpha = glow * 0.6;
        P.wobblyRect(ctx, 330, y - 85, 420, 170, i + 11, 3, 40);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.restore();
      }
      const opts = { size: 190, font: 'bubble', color: col, stroke: C.paper, strokeWidth: 30 };
      P.text(ctx, l, lx, y, { ...opts, rot: -rot });
      P.text(ctx, r, rx, y, { ...opts, rot: rot });
      P.burstLines(ctx, 540, y, 110, prog(t, t0 + 0.5, 0.4), C.paper, 10, 7);

      if (env.at(t0 + 0.5)) {
        SFX.click();
        SFX.pluck(notes[i], { vol: 0.2 });
      }
    });

    // stack depth readout
    const done = t >= 5.6;
    P.rect(ctx, 290, 250, 500, 110, done ? C.paper : 'rgba(20,40,35,0.55)', { radius: 30, seed: 3, shadow: done });
    P.text(ctx, done ? 'balanced ✓' : `unmatched: ${6 - depth}`, 540, 306, {
      size: 58, font: done ? 'bubble' : 'mono', color: done ? C.teal : '#dff', shadow: false,
      scale: done ? ease.outBack(prog(t, 5.6, 0.4)) : 1,
    });
    if (env.at(5.6)) SFX.chime();
    P.confetti(ctx, t - 5.6, 540, 300, 8, 50, 600);

    // Clawd peeks in from the bottom, satisfied
    const peek = ease.outBack(prog(t, 5.8, 0.6)) * (1 - fall);
    P.claude(ctx, 180, 2000 - peek * 450, 150, { t, mood: 'happy' });
    if (peek > 0.5) P.bubble(ctx, 'mmm.', 370, 1470, 250, 1560, { size: 54, pop: ease.outBack(prog(t, 6.2, 0.3)) * (1 - fall) });
  },
});
