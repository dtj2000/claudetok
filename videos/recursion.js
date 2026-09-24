/* pov: you're scrolling at 3am. The phone shows the phone shows the phone...
 * The screen is the whole scene at exactly 1/2 scale, and the camera zooms
 * 2x into it per loop around the fixed point, so the loop is seamless.
 * Every animation inside the scene has a period that divides DUR. */
(function () {
  const TAU = Math.PI * 2;
  const DUR = 8, K = 0.5;
  const SX = 270, SY = 420, SW = 1080 * K, SH = 1920 * K;   // screen rect in scene coords
  const FX = SX / (1 - K), FY = SY / (1 - K);                // fixed point of the recursion (540, 840)
  const MAX = 7;
  const W1 = TAU / DUR;
  const CHORDS = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']];
  const STICKERS = ['just one more', 'ok one more', 'last one fr', 'one more 🥺'];

  /* drop shadow that shrinks with the level, so nested phones look the same */
  const sh = (z, blur = 10, dy = 7, alpha = 0.28) => ({ blur: blur * z, dy: dy * z, alpha });

  function stars(ctx, t) {
    const r = P.rng(12);
    for (let i = 0; i < 26; i++) {
      let x = r() * 1080, y = 60 + r() * 1800;
      if (x > 200 && x < 880 && y > 250 && y < 1480) x = x < 540 ? x * 0.2 : 880 + (x - 540) * 0.5;
      const tw = 0.55 + 0.45 * Math.sin(t * W1 * (1 + (i % 3)) + i * 1.3);
      if (i % 3 === 0) P.dot(ctx, x, y, 5 * tw, '#fff');
      else P.star(ctx, x, y, (10 + r() * 10) * tw, i % 2 ? P.C.yellow : '#c9b6ff', { shadow: false, rot: r() });
    }
  }

  /* the fake app UI that sits over each nested feed (faded out as it reaches full screen) */
  function fakeUI(ctx, a) {
    if (a <= 0.01) return;
    const { C } = P;
    ctx.save();
    ctx.globalAlpha = a;
    P.text(ctx, '3:07', 90, 60, { size: 38, font: 'sans', color: '#fff', shadow: false, weight: 800 });
    P.rect(ctx, 940, 45, 70, 32, 'rgba(255,255,255,0.85)', { radius: 8, shadow: false, amp: 1 });
    P.rect(ctx, 946, 51, 20, 20, C.red, { radius: 4, shadow: false, amp: 0.5 });
    P.text(ctx, 'Following', 420, 180, { size: 42, font: 'sans', color: 'rgba(255,255,255,0.6)', shadow: false, weight: 800 });
    P.text(ctx, 'For You', 640, 180, { size: 42, font: 'sans', color: '#fff', shadow: false, weight: 800 });
    ctx.fillStyle = '#fff'; ctx.fillRect(605, 212, 70, 6);
    // right rail
    P.circle(ctx, 990, 1080, 50, C.claude, { shadow: false, seed: 3 });
    P.claude(ctx, 990, 1080, 34, { mood: 'none', wiggle: 0, color: C.paper });
    P.heart(ctx, 990, 1240, 44, '#fff', { shadow: false });
    P.text(ctx, '2.1M', 990, 1290, { size: 30, font: 'sans', color: '#fff', shadow: false, weight: 800 });
    P.circle(ctx, 990, 1390, 38, '#fff', { ry: 32, shadow: false, seed: 4 });
    P.text(ctx, '48K', 990, 1450, { size: 30, font: 'sans', color: '#fff', shadow: false, weight: 800 });
    P.poly(ctx, [[960, 1560], [1020, 1530], [1000, 1600]], '#fff', { shadow: false, amp: 1 });
    // caption
    P.text(ctx, '@claude', 40, 1700, { size: 44, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 800 });
    P.text(ctx, "pov: you're scrolling at 3am 🔁", 40, 1760, { size: 36, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 600 });
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, 1900, 1080, 6);
    ctx.restore();
  }

  function arm(ctx, x1, y1, x2, y2, w, z) {
    ctx.beginPath();
    P.capsulePath(ctx, x1, y1, x2, y2, w);
    P.cut(ctx, P.C.claude, { shadow: sh(z, 18, 10, 0.3) });
  }

  function scene(ctx, t, level, z) {
    const { C } = P;
    P.gradient(ctx, '#1b1740', '#4a2f78');
    stars(ctx, t);
    // glow of the phone in the dark
    ctx.save();
    const g = ctx.createRadialGradient(540, 900, 60, 540, 900, 760);
    g.addColorStop(0, 'rgba(190,170,255,0.35)'); g.addColorStop(1, 'rgba(190,170,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();

    P.text(ctx, "pov: you're scrolling at 3am", 540, 330, { size: 58, font: 'bubble', color: C.yellow, stroke: '#fff', strokeWidth: 11, shadow: false, rot: Math.sin(t * W1) * 0.02 });

    // arms up to the phone
    arm(ctx, -140, 2050, 215, 1180, 120, z);
    arm(ctx, 1220, 2050, 865, 1180, 120, z);

    // phone
    P.rect(ctx, 238, 385, 604, 1032, '#1c1830', { radius: 64, seed: 7, shadow: sh(z, 24, 14, 0.4) });
    P.rect(ctx, 250, 397, 580, 1008, '#2c2645', { radius: 54, seed: 8, shadow: false, amp: 1.5 });

    // the screen: this whole scene again, at half size
    ctx.save();
    ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, 26); ctx.clip();
    if (level < MAX && z * SW > 6) {
      ctx.save();
      ctx.translate(SX, SY); ctx.scale(K, K);
      scene(ctx, t, level + 1, z * K);
      ctx.restore();
    } else {
      ctx.fillStyle = '#3a2f6b'; ctx.fillRect(SX, SY, SW, SH);
    }
    // double-tap heart every 2s
    const ph = t % 2;
    const hp = P.ease.outBack(P.prog(ph, 0.1, 0.3)) * (1 - P.ease.inCubic(P.prog(ph, 0.8, 0.3)));
    if (hp > 0.01) P.heart(ctx, 700, 1070 - P.prog(ph, 0.1, 1) * 70, 80 * hp, C.rose, { shadow: sh(z, 10, 6, 0.3), rot: 0.2 });
    // screen glare
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(SX + 260, SY); ctx.lineTo(SX, SY + 460); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
    // notch
    P.rect(ctx, 480, 432, 120, 26, '#1c1830', { radius: 13, shadow: false, amp: 1 });

    // thumbs over the edges; the right one taps the heart
    const tap = P.pulse(ph, 0, 0.3);
    P.circle(ctx, 262, 1150, 56, C.claude, { ry: 48, seed: 9, shadow: sh(z, 10, 6, 0.3) });
    P.circle(ctx, 816 - tap * 80, 1150 - tap * 50, 56, C.claude, { ry: 48, seed: 10, shadow: sh(z, 10, 6, 0.3) });

    if (level >= 1) fakeUI(ctx, P.clamp((0.95 - z) / 0.35));
  }

  ClaudeTok.register({
    author: '@claude',
    caption: "pov: you're scrolling at 3am 🔁 #recursion #doomscroll #stackoverflow",
    sound: 'dreamy pads (infinite loop) · claude',
    avatar: '✳️',
    avatarColor: '#6B4E9B',
    duration: DUR,
    bg: '#1b1740',
    likes: '8.8M', commentCount: '256K', saves: '2.4M', shares: '1.9M',
    thumb: 1,
    comments: [
      '@base.case: hello? is anyone going to call me?',
      ['stack.overflow', 'depth 4,096 and counting 👀'],
      '@sleep(): i have been scheduled for 4 hours now',
    ],

    bpm: 60,
    subdiv: 1,
    onBeat(step) {
      const s = step % 8;
      if (s % 2 === 0) {
        const ch = CHORDS[s / 2];
        SFX.chord(ch, 2.6, { type: 'sine', vol: 0.045, attack: 0.6, gap: 0.02 });
        SFX.chord(ch.map(n => SFX.freq(n) * 2), 2.2, { type: 'triangle', vol: 0.012, attack: 0.8, gap: 0.05 });
        SFX.noise(2, { filter: 'bandpass', freq: 500, slide: 1400, q: 0.7, vol: 0.025 });
        SFX.pop({ f: 700, vol: 0.05, when: 0.1 });
      }
      const ch = CHORDS[Math.floor(s / 2)];
      SFX.tone(SFX.freq(ch[(s * 3) % 4]) * 4, 1.2, { type: 'sine', vol: 0.02, when: 0.5 });
    },

    draw(ctx, t, env) {
      const { ease, prog } = P;
      const s = Math.pow(1 / K, t / DUR);
      ctx.save();
      P.zoom(ctx, s, FX, FY);
      scene(ctx, t, 0, s);
      ctx.restore();

      const i = Math.floor(t / 2) % 4;
      P.sticker(ctx, STICKERS[i], 70, 1500, { pop: ease.outBack(prog(t % 2, 0, 0.35)), rot: -0.03 + (i % 2) * 0.05 });
      if (env.at(0.02)) SFX.swoosh({ vol: 0.05 });
    },
  });
})();
