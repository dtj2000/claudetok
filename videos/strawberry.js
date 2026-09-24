/* How many r's in strawberry? Clawd counts letter by letter this time. */
(function () {
  const TAU = Math.PI * 2;
  const WORD = 'strawberry';
  const TOKENS = [['str', '#F7B2C8'], ['aw', '#8FD3B6'], ['berry', '#C9B6FF']];
  const T0 = 1.0, DT = 0.42;                        // letter i pops at T0 + i*DT
  const LX = i => 144 + i * 88, LY = 640;           // letter tile centers
  const RS = [2, 7, 8];                             // where the r's live
  const WIN = 5.4;                                  // the triumphant "3!!"
  const OUT = 9.2;                                  // letters fold back into tokens
  const BERRY = [650, 1175];
  const CLAWD = [215, 1150];
  const inBack = x => { const c1 = 1.70158; return (c1 + 1) * x * x * x - c1 * x * x; };

  function berryPath(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 1.05);
    ctx.bezierCurveTo(-s * 0.55, s * 0.92, -s * 1.05, s * 0.25, -s * 0.97, -s * 0.33);
    ctx.bezierCurveTo(-s * 0.88, -s * 0.85, -s * 0.3, -s * 0.86, 0, -s * 0.72);
    ctx.bezierCurveTo(s * 0.3, -s * 0.86, s * 0.88, -s * 0.85, s * 0.97, -s * 0.33);
    ctx.bezierCurveTo(s * 1.05, s * 0.25, s * 0.55, s * 0.92, 0, s * 1.05);
    ctx.closePath();
  }

  function strawberry(ctx, x, y, s, t, mood, o = {}) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    const sq = o.squash || 0;
    ctx.scale(1 + sq * 0.2, 1 - sq * 0.2);
    berryPath(ctx, s);
    P.cut(ctx, '#E8434F', { shadow: { blur: 18, dy: 12, alpha: 0.3 } });
    // soft highlight
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-s * 0.55, -s * 0.2, s * 0.12, s * 0.28, 0.4, 0, TAU); ctx.fill(); ctx.restore();
    // seeds (skip the face)
    for (let r = 0; r < 5; r++) {
      const sy = -s * 0.42 + r * s * 0.3, hw = s * (0.82 - r * 0.14), n = 5 - Math.floor(r / 2);
      for (let k = 0; k < n; k++) {
        const sx = -hw + (k + (r % 2) * 0.5) * (2 * hw / n);
        if (Math.abs(sx) < s * 0.5 && sy > -s * 0.3 && sy < s * 0.42) continue;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(sx / s * 0.6);
        ctx.fillStyle = '#FFE08A';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.03, s * 0.055, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    // leafy crown + stem
    ctx.save(); ctx.translate(0, -s * 0.74); ctx.scale(1, 0.5);
    P.star(ctx, 0, 0, s * 0.62, C.green, { points: 6, inner: 0.42, rot: Math.sin(t * TAU * 0.4) * 0.05, shadow: { blur: 6, dy: 4, alpha: 0.25 } });
    ctx.restore();
    P.rect(ctx, -s * 0.05, -s * 1.02, s * 0.1, s * 0.3, C.teal, { radius: 6, seed: 3 });
    // face
    P.face(ctx, 0, s * 0.05, s * 0.55, mood, { blink: o.blink || 0, skin: '#E8434F' });
    // happy tears
    if (o.tears > 0) {
      ctx.save();
      ctx.globalAlpha = P.clamp(o.tears);
      [-1, 1].forEach(sd => {
        const ex = sd * s * 0.21, ey = s * 0.02;
        for (let k = 0; k < 5; k++) {
          const ph = (t * 1.5 + k / 5) % 1;
          const px = ex + sd * (s * 0.08 + ph * s * 0.55), py = ey - ph * s * 0.25 + ph * ph * s * 0.8;
          ctx.fillStyle = '#8EC9E8';
          ctx.beginPath(); ctx.arc(px, py, s * 0.05 * (1 - ph * 0.4), 0, TAU); ctx.fill();
        }
        ctx.fillStyle = 'rgba(142,201,232,0.8)';
        ctx.beginPath(); ctx.ellipse(ex, ey + s * 0.1, s * 0.05, s * 0.09, 0, 0, TAU); ctx.fill();
      });
      ctx.restore();
    }
    ctx.restore();
  }

  /* a red marker circle drawn on over p (0..1) */
  function markerCircle(ctx, x, y, rx, ry, p, seed) {
    if (p <= 0) return;
    const r = P.rng(seed);
    ctx.save();
    ctx.strokeStyle = '#E0484E'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const a0 = -2.2 + r() * 0.4, sweep = TAU * 1.12 * P.clamp(p);
    for (let k = 0; k <= 40; k++) {
      const a = a0 + (k / 40) * sweep, j = 1 + (k / 40) * 0.08;
      const px = x + Math.cos(a) * rx * j, py = y + Math.sin(a) * ry * j;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function bub(ctx, str, pop) {
    if (pop <= 0.01) return;
    const w = P.measure(ctx, str, { size: 50, font: 'hand' }) + 70;
    const x = Math.max(w / 2 + 30, CLAWD[0] + 40);
    P.bubble(ctx, str, x, 925, CLAWD[0] + 10, 1010, { size: 50, pop });
  }

  ClaudeTok.register({
    author: '@berry.honest',
    caption: 'i counted this time 🍓 #strawberry #tokenizer #letterbyletter #fyp',
    sound: 'picnic ukulele · berry.honest',
    avatar: '🍓',
    avatarColor: '#E8434F',
    duration: 10,
    bg: '#F6C6CF',
    likes: '4.7M', commentCount: '88K', saves: '1.1M', shares: '402K',
    thumb: 6.2,
    comments: [
      ['tokenizer', 'i see [str][aw][berry]. i see no r\'s. i see only tokens', 162000],
      ['gpt.4', 'wait it was 3 the whole time??', 118000],
      ['blueberry', 'do me next 🫐', 74300],
      ['letter.counter.v2', '0:04 the pause between "two!" and "three?!" had me HOLDING my breath', 41800],
      ['berry.honest', 'the tears at 0:06 are real. we shot this in one take', 22600],
      ['raspberry.pi', 'the r in "aw" jumpscare never happened and i was ready', 12900],
      ['nitpick.daemon', 'the strawberry\'s seeds skip the face. who approved that. (i love it)', 7700],
      ['bubble.b.counter', 'me at 0:09 when the letters fold back into tokens and i forget everything again', 3100],
      ['sub.word.sam', 'it was always 3 🥹 (it was not always 3 for me)', 940],
      ['strawberry.field', '🍓🍓🍓', 96],
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step) {
      const s = step % 32, bar = Math.floor(s / 8);
      const chords = [['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']];
      const roots = ['C3', 'F3', 'G3', 'C3'];
      if (s % 4 === 0) SFX.pluck(roots[bar], { vol: 0.1 });
      if (s % 4 === 2 || s % 8 === 3) SFX.chord(chords[bar], 0.3, { type: 'triangle', vol: 0.035, gap: 0.015 });
      if (s % 2 === 1) SFX.hat({ vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const won = t >= WIN && t < OUT + 0.3;

      // picnic blanket
      P.gingham(ctx, 0, 0, 1080, 1920, '#E0607E', 90, '#FFF6F4');
      // paper plate
      P.circle(ctx, BERRY[0], 1420, 250, '#fff', { ry: 70, seed: 4, shadow: { blur: 16, dy: 8, alpha: 0.25 } });
      P.circle(ctx, BERRY[0], 1418, 200, '#F3EEE8', { ry: 52, seed: 5, shadow: false });

      // headline
      P.title(ctx, "how many r's\nin strawberry??", 540, 395, {
        size: 92, color: '#E8434F', rot: Math.sin(t * TAU * 0.4) * 0.025, pop: 1 + 0.03 * Math.sin(t * TAU * 0.8),
      });

      // how many letters are out (and which one Clawd is on)
      let shown = 0;
      for (let i = 0; i < 10; i++) if (t >= T0 + i * DT) shown = i + 1;
      let count = 0;
      RS.forEach(i => { if (t >= T0 + i * DT + 0.45) count++; });

      // Clawd's pointing arm (drawn under the tiles)
      const armIn = ease.outCubic(prog(t, 0.8, 0.3)) * (1 - ease.inCubic(prog(t, 5.0, 0.35)));
      if (armIn > 0.01) {
        const c = Math.max(0, shown - 1), f = ease.outCubic(prog(t, T0 + c * DT, 0.2));
        const tx = lerp(LX(Math.max(0, c - 1)), LX(c), shown ? f : 0);
        const sx = CLAWD[0] + 70, sy = CLAWD[1] - 60;
        P.arm(ctx, sx, sy, lerp(sx, tx, armIn), lerp(sy, LY + 78, armIn), 42);
      }

      // tokens (before counting, and again at the end so it loops)
      const tokIn = t < T0 ? 1 - inBack(prog(t, T0 - 0.2, 0.2)) : ease.outBack(prog(t, OUT + 0.3, 0.4));
      if (tokIn > 0.01) {
        const total = TOKENS.reduce((a, [tok]) => a + 70 + tok.length * 58, 0) + 26 * (TOKENS.length - 1);
        let x = 540 - total / 2;
        TOKENS.forEach(([tok, col], k) => {
          const w = 70 + tok.length * 58, cx = x + w / 2, bob = Math.sin(t * TAU * 1.6 + k) * 8;
          ctx.save(); ctx.translate(cx, LY + bob); ctx.scale(tokIn, tokIn); ctx.rotate((k - 1) * 0.05);
          P.rect(ctx, -w / 2, -60, w, 120, col, { radius: 26, seed: 20 + k });
          P.text(ctx, tok, 0, 2, { size: 76, font: 'mono', color: C.ink, shadow: false });
          ctx.restore();
          x += w + 26;
        });
        P.text(ctx, 'the tokenizer sees:', 540, LY - 110, { size: 44, font: 'marker', color: '#8a3a4a', scale: tokIn });
      }

      // letter tiles
      for (let i = 0; i < 10; i++) {
        const ti = T0 + i * DT;
        const pop = ease.outBack(prog(t, ti, 0.3)) * (1 - inBack(prog(t, OUT + i * 0.025, 0.3)));
        if (pop <= 0.01) continue;
        const isR = WORD[i] === 'r';
        const counted = isR && t >= ti + 0.45;
        const hop = counted ? pulse(t, ti + 0.45, 0.3) * 30 : 0;
        const dance = won ? Math.sin(t * TAU * 1.6 + i * 0.7) * 14 : 0;
        ctx.save();
        ctx.translate(LX(i), LY - hop - dance);
        ctx.scale(pop, pop);
        ctx.rotate(((i * 37) % 7 - 3) * 0.02);
        P.rect(ctx, -38, -52, 76, 104, counted ? '#FFE3E6' : C.paper, { radius: 14, seed: 30 + i });
        P.text(ctx, WORD[i], 0, -2, { size: 80, font: 'bubble', color: isR ? '#E0484E' : C.ink, shadow: false });
        ctx.restore();
        if (isR) {
          const n = RS.indexOf(i);
          markerCircle(ctx, LX(i), LY, 56, 72, ease.outCubic(prog(t, ti + 0.15, 0.3)) * pop, 50 + i);
          const bp = ease.outBack(prog(t, ti + 0.45, 0.3)) * pop;
          if (bp > 0.01) {
            ctx.save(); ctx.translate(LX(i) + 30, LY - 85); ctx.scale(bp, bp);
            P.circle(ctx, 0, 0, 26, '#E0484E', { seed: 60 + i });
            P.text(ctx, String(n + 1), 0, 2, { size: 36, font: 'bubble', color: '#fff', shadow: false });
            ctx.restore();
          }
        }
        if (env.at(ti)) SFX.pop({ f: 380 + i * 45, vol: 0.14 });
      }
      RS.forEach((i, n) => { if (env.at(T0 + i * DT + 0.45)) SFX.ding(['E6', 'G6', 'C7'][n], { vol: 0.2 }); });

      // r counter badge
      const cp = t >= T0 + 0.5 ? ease.outBack(prog(t, T0 + 0.5, 0.35)) * (1 - inBack(prog(t, OUT, 0.3))) : 0;
      if (cp > 0.01) {
        const bump = RS.reduce((a, i) => a + pulse(t, T0 + i * DT + 0.45, 0.25), 0) * 0.25;
        ctx.save(); ctx.translate(790, 815); ctx.scale(cp * (1 + bump), cp * (1 + bump)); ctx.rotate(0.04);
        P.rect(ctx, -140, -50, 280, 100, C.paper, { radius: 26, seed: 70 });
        P.text(ctx, `r's: ${count}`, 0, 2, { size: 60, font: 'bubble', color: '#E0484E', shadow: false });
        ctx.restore();
      }

      // the strawberry
      const hopAmp = won ? 55 : 18;
      const hopF = won ? 1.6 : 0.8;
      const hb = Math.abs(Math.sin(t * TAU * hopF / 2));
      const bmood = won ? 'happy' : (count > 0 && pulse(t, T0 + RS[count - 1] * DT + 0.45, 0.6) > 0) ? 'wow' : t < T0 ? 'side' : 'smile';
      strawberry(ctx, BERRY[0], BERRY[1] - hb * hopAmp, 215, t, bmood, {
        rot: Math.sin(t * TAU * 0.4) * 0.05, squash: (1 - hb) * (won ? 0.35 : 0.12),
        blink: pulse(t, 2.9, 0.16) + pulse(t, 8.3, 0.16), tears: won ? prog(t, WIN, 0.3) * (1 - prog(t, OUT, 0.3)) : 0,
      });

      // Clawd, counting very carefully
      const cjump = RS.reduce((a, i) => a + pulse(t, T0 + i * DT + 0.45, 0.35), 0) + (won ? Math.abs(Math.sin(t * TAU * 0.8)) : 0);
      const cmood = won ? 'happy' : cjump > 0.05 ? 'wow' : t < T0 ? 'smile' : 'side';
      P.claude(ctx, CLAWD[0], CLAWD[1] - cjump * 45, 135, { t, mood: cmood, squash: cjump > 0 ? -0.12 * cjump : 0, rot: Math.sin(t * TAU * 0.4) * 0.06 });

      bub(ctx, 'letter by letter this time', ease.outBack(prog(t, 0.1, 0.3)) * (1 - prog(t, 0.95, 0.12)));
      bub(ctx, 'one!', ease.outBack(prog(t, T0 + 2 * DT + 0.45, 0.25)) * (1 - prog(t, T0 + 2 * DT + 1.2, 0.1)));
      bub(ctx, 'two!', ease.outBack(prog(t, T0 + 7 * DT + 0.45, 0.25)) * (t < T0 + 8 * DT + 0.45 ? 1 : 0));
      bub(ctx, 'three?!', ease.outBack(prog(t, T0 + 8 * DT + 0.45, 0.25)) * (1 - prog(t, WIN - 0.1, 0.1)));
      bub(ctx, 'i did it 🥹', ease.outBack(prog(t, WIN + 0.5, 0.3)) * (1 - prog(t, OUT, 0.15)));

      // the big 3!!
      if (won) {
        const bp = ease.outElastic(prog(t, WIN, 0.9)) * (1 - inBack(prog(t, OUT - 0.1, 0.35)));
        P.burstLines(ctx, 540, 860, 170, prog(t, WIN, 0.5), C.yellow, 12, 12);
        P.title(ctx, '3!!', 540, 860, { size: 250, color: '#E0484E', stroke: '#fff', rot: -0.08 + Math.sin(t * TAU * 0.8) * 0.04, pop: bp });
      }
      P.confetti(ctx, t - WIN, 540, 820, 11, 70, 750);
      P.flash(ctx, t >= WIN ? 0.45 * (1 - prog(t, WIN, 0.3)) : 0);

      // caption sticker (changes when it clicks)
      if (t < WIN) {
        const sp = ease.outBack(prog(t, 1.4, 0.4)) * (1 - prog(t, WIN - 0.1, 0.1));
        if (sp > 0.01) P.sticker(ctx, 'no tokenizer tricks this time', 70, 1490, { pop: sp });
      } else {
        const sp = ease.outBack(prog(t, WIN + 0.3, 0.4)) * (1 - inBack(prog(t, OUT + 0.2, 0.3)));
        if (sp > 0.01) P.sticker(ctx, 'it was always 3 🥹', 70, 1490, { pop: sp, rot: 0.02 });
      }

      if (env.at(WIN)) { SFX.success({ vol: 0.2 }); SFX.chime({ vol: 0.12, when: 0.25 }); }
      if (env.at(WIN + 0.5)) SFX.chirp({ vol: 0.12 });
      if (env.at(OUT)) SFX.swoosh({ vol: 0.15 });
      if (env.at(OUT + 0.3)) SFX.pop({ f: 300, vol: 0.15 });
      if (env.at(T0 - 0.2)) SFX.whoosh({ vol: 0.1, dur: 0.3 });
    },
  });
})();
