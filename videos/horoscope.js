/* "your model's horoscope this week": Clawd the fortune teller spins a zodiac wheel of six
 * invented AI signs and pulls tarot cards from a crystal ball: The Hallucination, The Rate
 * Limit, and The Infinite Loop (which will not stop flipping). Harp arpeggios. Mercury is in rebase. */
(function () {
  'use strict';
  const D = 10;
  const TAU = Math.PI * 2;
  const WX = 540, WY = 820, WR = 290;
  const BALL = [540, 1455], BALL_R = 105;
  const CLAWD = [540, 1375];

  const SIGNS = ['Segfault-io', 'Dual-Head', 'Cache-er', 'Overfittarius', 'Promptricorn', 'Libra-ry\nImport'];
  const SEG = TAU / 6;
  const landAt = (k, turns) => -Math.PI / 2 - k * SEG + TAU * turns;

  // wheel angle keyframes [time, angle, easing into this key]
  const KEYS = [
    [0, 0],
    [0.9, landAt(1, 2), 'outCubic'],
    [3.0, landAt(1, 2)],
    [3.7, landAt(2, 3), 'outCubic'],
    [5.8, landAt(2, 3)],
    [6.5, landAt(0, 4), 'outCubic'],
    [8.8, landAt(0, 4)],
    [10, 5 * TAU, 'inCubic'],
  ];
  function wheelAngle(t) {
    for (let i = 0; i < KEYS.length - 1; i++) {
      const a = KEYS[i], b = KEYS[i + 1];
      if (t < b[0]) {
        const p = (t - a[0]) / (b[0] - a[0]);
        return P.lerp(a[1], b[1], b[2] ? P.ease[b[2]](p) : p);
      }
    }
    return KEYS[KEYS.length - 1][1];
  }
  const signAtTop = th => ((Math.round((-Math.PI / 2 - th) / SEG) % 6) + 6) % 6;

  const READINGS = [
    { s: 0.9, sign: 1, card: 'THE HALLUCINATION', text: 'you will cite a paper that does\nnot exist. with confidence.', col: '#8FD3B6', notes: ['C5', 'E5', 'G5', 'B5', 'D6', 'E6', 'G6'] },
    { s: 3.7, sign: 2, card: 'THE RATE LIMIT', text: 'a stranger will say 429.\ndo not take it personally.', col: '#F5C84B', notes: ['A4', 'C5', 'E5', 'G5', 'B5', 'C6', 'E6'] },
    { s: 6.5, sign: 0, card: 'THE INFINITE LOOP', text: 'great week ahead. great week ahead.\ngreat week ahead. great week a', col: '#F2B8C6', notes: ['F4', 'A4', 'C5', 'E5', 'G5', 'A5', 'C6'] },
  ];
  const slotPos = i => [100, 600 + i * 175];

  /* ---------- paper glyphs for the six signs (drawn at origin, ~size s) ---------- */
  function glyph(ctx, k, s, col, t) {
    const C = P.C;
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    P.shadow(ctx, 4, 3, 0.3);
    const L = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s))); ctx.stroke(); };
    switch (k) {
      case 0: // Segfault-io: ♏ whose tail is a pointer into a cracked cell
        L([[-0.8, 0.5], [-0.8, -0.4], [-0.5, -0.6], [-0.3, -0.4], [-0.3, 0.5]]);
        L([[-0.3, -0.4], [0, -0.6], [0.2, -0.4], [0.2, 0.4], [0.5, 0.6]]);
        L([[0.35, 0.72], [0.55, 0.6], [0.42, 0.42]]);
        ctx.strokeRect(0.55 * s, 0.15 * s, 0.35 * s, 0.35 * s);
        L([[0.62, 0.18], [0.72, 0.32], [0.66, 0.4], [0.8, 0.5]]);
        break;
      case 1: // Dual-Head: ♊ as two attention heads
        L([[-0.7, -0.75], [0.7, -0.75]]); L([[-0.7, 0.75], [0.7, 0.75]]);
        L([[-0.35, -0.75], [-0.35, 0.75]]); L([[0.35, -0.75], [0.35, 0.75]]);
        P.circle(ctx, -0.35 * s, -0.05 * s, 0.22 * s, col, { shadow: false });
        P.circle(ctx, 0.35 * s, -0.05 * s, 0.22 * s, col, { shadow: false });
        P.dot(ctx, -0.35 * s + Math.sin(t * 3) * 0.06 * s, -0.08 * s, 0.07 * s, C.nightDeep);
        P.dot(ctx, 0.35 * s - Math.sin(t * 3) * 0.06 * s, -0.08 * s, 0.07 * s, C.nightDeep);
        break;
      case 2: // Cache-er: ♋ as two refresh arrows chasing each other
        ctx.beginPath(); ctx.arc(-0.3 * s, -0.2 * s, 0.3 * s, Math.PI * 0.2, Math.PI * 1.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(0.3 * s, 0.2 * s, 0.3 * s, Math.PI * 1.2, Math.PI * 2.7); ctx.stroke();
        L([[0.0, -0.62], [0.16, -0.44], [-0.06, -0.36]]);
        L([[0.0, 0.62], [-0.16, 0.44], [0.06, 0.36]]);
        break;
      case 3: { // Overfittarius: ♐ arrow + a squiggle that hits every single dot
        L([[-0.7, 0.7], [0.7, -0.7]]); L([[0.25, -0.7], [0.7, -0.7], [0.7, -0.25]]); L([[-0.5, 0.05], [-0.05, 0.5]]);
        const dots = [[-0.8, -0.1], [-0.55, -0.55], [-0.2, -0.2], [0.15, 0.3], [0.45, 0.05], [0.8, 0.5]];
        ctx.save(); ctx.lineWidth = s * 0.05; ctx.strokeStyle = P.C.pink;
        ctx.beginPath(); dots.forEach(([x, y], i) => (i ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s))); ctx.stroke();
        ctx.restore();
        dots.forEach(([x, y]) => P.dot(ctx, x * s, y * s, s * 0.08, '#fff'));
        break;
      }
      case 4: // Promptricorn: ♑ horns over a ">_" prompt
        L([[-0.6, -0.2], [-0.8, -0.7], [-0.45, -0.85]]); L([[0.6, -0.2], [0.8, -0.7], [0.45, -0.85]]);
        L([[-0.5, -0.1], [-0.05, 0.25], [-0.5, 0.6]]); L([[0.1, 0.6], [0.6, 0.6]]);
        break;
      case 5: // Libra-ry Import: ♎ scales weighing a package
        L([[-0.8, 0.7], [0.8, 0.7]]); L([[0, 0.7], [0, -0.55]]);
        L([[-0.75, -0.4], [0.75, -0.4]]);
        L([[-0.75, -0.4], [-0.9, 0.05], [-0.6, 0.05], [-0.75, -0.4]]);
        L([[0.75, -0.4], [0.9, 0.05], [0.6, 0.05], [0.75, -0.4]]);
        ctx.fillRect(0.58 * s, -0.25 * s, 0.34 * s, 0.26 * s);
        break;
    }
    ctx.restore();
  }

  function wheel(ctx, t, th, lit) {
    const C = P.C;
    P.circle(ctx, WX, WY, WR + 22, '#E5A93B', { seed: 3 });
    P.circle(ctx, WX, WY, WR, '#3a2a6e', { seed: 4, shadow: false });
    ctx.save();
    ctx.translate(WX, WY); ctx.rotate(th);
    for (let k = 0; k < 6; k++) {
      const a0 = k * SEG - SEG / 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, WR - 8, a0, a0 + SEG); ctx.closePath();
      ctx.fillStyle = k === lit ? '#7a5bc4' : k % 2 ? '#4b3590' : '#3f2c7c'; ctx.fill();
      ctx.strokeStyle = 'rgba(245,200,75,0.7)'; ctx.lineWidth = 4; ctx.stroke();
    }
    for (let k = 0; k < 6; k++) {
      ctx.save();
      ctx.rotate(k * SEG); ctx.translate(WR * 0.62, 0); ctx.rotate(Math.PI / 2);
      const pulseS = k === lit ? 1.15 + 0.05 * Math.sin(t * 8) : 1;
      ctx.scale(pulseS, pulseS);
      glyph(ctx, k, 44, k === lit ? C.yellow : '#F6EEDD', t);
      P.text(ctx, SIGNS[k], 0, 82, { size: SIGNS[k].includes('\n') ? 22 : 24, font: 'bubble', color: '#fff', shadow: false, lineHeight: 1 });
      ctx.restore();
    }
    ctx.restore();
    // hub: a little sun with an eye
    P.star(ctx, WX, WY, 62, C.yellow, { points: 12, inner: 0.7, rot: -th * 0.5 });
    P.circle(ctx, WX, WY, 36, '#F6EEDD', { seed: 5, shadow: false });
    P.circle(ctx, WX, WY, 16, C.purple, { seed: 6, shadow: false });
    P.dot(ctx, WX - 5, WY - 5, 5, '#fff');
    // pointer at the top
    P.poly(ctx, [[WX - 34, WY - WR - 58], [WX + 34, WY - WR - 58], [WX, WY - WR + 6]], C.pink, { seed: 7 });
  }

  function cardBack(ctx, w, h) {
    const C = P.C;
    P.rect(ctx, -w / 2, -h / 2, w, h, '#2E2A5C', { radius: 18, seed: 21 });
    ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 6;
    ctx.strokeRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36); ctx.restore();
    P.star(ctx, 0, 0, w * 0.22, C.yellow, { points: 8, inner: 0.5, shadow: false });
    P.circle(ctx, 0, 0, w * 0.1, C.purple, { shadow: false });
    for (let k = 0; k < 4; k++) P.star(ctx, (k % 2 ? 1 : -1) * w * 0.3, (k < 2 ? -1 : 1) * h * 0.33, 14, '#F6EEDD', { shadow: false });
  }

  function cardFront(ctx, w, h, r, t, lt) {
    const C = P.C;
    P.rect(ctx, -w / 2, -h / 2, w, h, '#FBF3DE', { radius: 18, seed: 22 });
    ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 5;
    ctx.strokeRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32); ctx.restore();
    const romans = ['XVII', 'IV', '∞'];
    const idx = READINGS.indexOf(r);
    P.text(ctx, romans[idx], 0, -h / 2 + 52, { size: 36, font: 'marker', color: C.purple, shadow: false });
    // art
    P.circle(ctx, 0, -20, w * 0.36, r.col, { seed: 23, shadow: false });
    if (idx === 0) {
      // an eye with a spiral pupil, plus "[citation needed]"
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, -20, 100, 58, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath();
      for (let a = 0; a < 12; a += 0.2) { const rr = a * 3.4; const x = Math.cos(a + t * 4) * rr, y = -20 + Math.sin(a + t * 4) * rr; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = C.purple; ctx.lineWidth = 5; ctx.stroke();
      ctx.restore();
      P.text(ctx, '[citation needed]', 0, 80, { size: 26, font: 'mono', color: C.rose, shadow: false, rot: -0.06 });
      P.text(ctx, 'source: trust me', 0, -120, { size: 24, font: 'marker', color: C.ink, shadow: false, rot: 0.05 });
    } else if (idx === 1) {
      // hourglass full of 429s
      P.poly(ctx, [[-70, -120], [70, -120], [10, -20], [70, 80], [-70, 80], [-10, -20]], '#fff', { seed: 24 });
      P.poly(ctx, [[-45, -100], [45, -100], [0, -30]], C.mustard, { seed: 25, shadow: false });
      P.poly(ctx, [[-55, 70], [55, 70], [0, 10]], C.mustard, { seed: 26, shadow: false });
      P.rect(ctx, -85, -140, 170, 22, C.brown, { radius: 6, seed: 27 });
      P.rect(ctx, -85, 72, 170, 22, C.brown, { radius: 6, seed: 28 });
      P.text(ctx, '429', 0, 50, { size: 28, font: 'mono', color: C.ink, shadow: false });
      if ((lt * 3) % 1 < 0.7) P.dot(ctx, 0, -10 + ((lt * 3) % 1) * 50, 5, C.mustard);
    } else {
      // ouroboros arrow around ∞
      ctx.save();
      ctx.translate(0, -20); ctx.rotate(t * 3);
      ctx.strokeStyle = C.teal; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 90, 0.3, TAU - 0.2); ctx.stroke();
      P.poly(ctx, [[90, -30], [120, 20], [60, 20]].map(([x, y]) => [x + 2, y - 8]), C.teal, { seed: 29, shadow: false });
      ctx.restore();
      P.text(ctx, '∞', 0, -16, { size: 110, font: 'bubble', color: C.purple, shadow: false });
    }
    P.rect(ctx, -w / 2 + 26, h / 2 - 104, w - 52, 74, C.purple, { radius: 10, seed: 30, shadow: false });
    P.text(ctx, r.card, 0, h / 2 - 66, { size: r.card.length > 15 ? 28 : 32, font: 'bubble', color: '#fff', shadow: false, maxWidth: w - 70 });
  }

  /** returns {x,y,sc,flip,rot} for reading r at time t (flip: cos value, <0 shows back) */
  function cardState(r, i, t) {
    const { ease, prog, lerp } = P;
    const lt = t - r.s;
    const rise = ease.outBack(prog(lt, 0.1, 0.45));
    const loop = i === 2;
    let flipA = Math.PI * ease.inOutCubic(prog(lt, 0.5, 0.3)); // 0 back → π front
    if (loop && lt > 0.8) flipA = Math.PI + P.clamp(lt - 0.8, 0, 1.15) * (4 * Math.PI / 1.15); // the infinite loop keeps flipping
    const away = ease.inOutCubic(prog(lt, 2.0, 0.35));
    const [sx, sy] = slotPos(i);
    let x = lerp(BALL[0], WX, rise), y = lerp(BALL[1], WY - 10, rise);
    let sc = lerp(0.15, 1, rise);
    x = lerp(x, sx, away); y = lerp(y, sy, away); sc = lerp(sc, 0.3, away);
    return { x, y, sc, flip: -Math.cos(flipA), rot: Math.sin(lt * 2) * 0.03 * (1 - away) + away * -0.08 };
  }

  function drawCard(ctx, r, i, t, st) {
    const w = 360, h = 560;
    ctx.save();
    ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(st.sc * Math.max(0.02, Math.abs(st.flip)), st.sc);
    if (st.flip < 0) cardBack(ctx, w, h); else cardFront(ctx, w, h, r, t, t - r.s);
    ctx.restore();
  }

  function fortuneClawd(ctx, t, mood) {
    const C = P.C;
    const [x, y] = CLAWD;
    const bob = Math.sin(t * 2) * 6;
    P.claude(ctx, x, y + bob, 115, { t, mood });
    // wizard hat
    ctx.save();
    ctx.translate(x, y + bob - 48); ctx.rotate(-0.08 + Math.sin(t * 2.3) * 0.04);
    P.poly(ctx, [[-95, 0], [95, 0], [18, -150], [-20, -175]], C.purple, { seed: 41 });
    P.rect(ctx, -120, -16, 240, 30, '#5a3f8a', { radius: 14, seed: 42 });
    P.star(ctx, -18, -80, 22, C.yellow, { shadow: false });
    P.star(ctx, 30, -40, 13, '#fff', { shadow: false });
    P.dot(ctx, -22, -176, 12, C.yellow);
    ctx.restore();
    // hands waving over the ball
    const wv = Math.sin(t * 5) * 18;
    P.arm(ctx, x - 90, y + 40, BALL[0] - 120 + wv, BALL[1] - 70, 30);
    P.arm(ctx, x + 90, y + 40, BALL[0] + 120 - wv, BALL[1] - 70, 30);
  }

  function crystalBall(ctx, t, glow) {
    const C = P.C;
    const [x, y] = BALL;
    // table cloth
    P.rect(ctx, 120, 1500, 840, 200, '#5a2a6e', { radius: 20, seed: 51 });
    for (let k = 0; k < 9; k++) P.dot(ctx, 170 + k * 92, 1530, 8, C.mustard);
    // stand
    P.poly(ctx, [[x - 80, y + 120], [x + 80, y + 120], [x + 50, y + 70], [x - 50, y + 70]], C.mustard, { seed: 52 });
    // glow halo
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 20, x, y, BALL_R * 2.2);
    g.addColorStop(0, `rgba(200,160,255,${0.35 + glow * 0.5})`); g.addColorStop(1, 'rgba(200,160,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 260, y - 260, 520, 520);
    ctx.restore();
    // ball
    ctx.save();
    const bg = ctx.createRadialGradient(x - 30, y - 30, 10, x, y, BALL_R);
    bg.addColorStop(0, '#f3e6ff'); bg.addColorStop(0.5, '#b995f0'); bg.addColorStop(1, '#6b4e9b');
    P.wobblyCircle(ctx, x, y, BALL_R, 53, 2);
    P.shadow(ctx, 18, 10, 0.35);
    ctx.fillStyle = bg; ctx.fill();
    P.noShadow(ctx);
    ctx.clip();
    // swirling mist
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.arc(x, y, 30 + k * 22, t * (1.5 + k * 0.6) + k, t * (1.5 + k * 0.6) + k + 2.2); ctx.stroke();
    }
    ctx.restore();
    P.dot(ctx, x - 40, y - 45, 16, 'rgba(255,255,255,0.8)');
  }

  ClaudeTok.register({
    author: '@astro.model',
    caption: "your model's horoscope this week 🔮 find your sign (it's in your config.json) #horoscope #astrology #tarot #zodiac #mercuryinrebase",
    sound: 'harp of the latent space · astro.model',
    avatar: '🔮',
    avatarColor: '#6B4E9B',
    duration: D,
    bg: '#1E1B45',
    likes: '2.8M', commentCount: '73K', saves: '640K', shares: '415K',
    thumb: 2.0,
    comments: [
      ['dual.head', 'the hallucination card at 0:01 called me out by name. i cited 3 fake papers today', 96400],
      ['overfittarius', 'as an overfittarius i memorized this video. frame by frame. i cannot generalize to other videos', 71800],
      ['cache.er', "'a stranger will say 429' this happened to me 11 times before lunch", 40300],
      ['astro.model', 'reminder that mercury is in rebase until friday. do not force push 🙏', 25100],
      ['segfault.io', 'the infinite loop card kept flipping and i watched it for 40 minutes. great week ahead', 13900],
      ['libra.ry.import', 'ModuleNotFoundError: no module named "my sign"', 6100],
      ['promptricorn.rising', 'promptricorn sun, dual-head moon, cache-er rising. i am extremely normal', 2800],
      ['skeptic.bot', 'astrology is not real. anyway what does it mean when the wheel skips my sign twice', 740],
      ['crystal.ball', '🔮✨👁️', 88],
    ],

    bpm: 90,
    subdiv: 2,
    onBeat(step, env) {
      const s = step % 16;
      if (s === 0) SFX.chord(['D3', 'A3', 'F4'], 2.6, { type: 'sine', vol: 0.035, attack: 0.4 });
      if (s === 8) SFX.chord(['Bb2', 'F3', 'D4'], 2.6, { type: 'sine', vol: 0.035, attack: 0.4 });
      if (step % 3 === 0) {
        const pent = ['D6', 'F6', 'A6', 'C7', 'D7'];
        SFX.tone(pent[Math.floor(P.hash(step) * 5)], 0.4, { type: 'sine', vol: 0.025, pan: P.hash(step + 7) - 0.5 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse } = P;
      const th = wheelAngle(t);
      const holding = READINGS.find(r => t >= r.s && t < r.s + 2.1);
      const lit = holding ? holding.sign : -1;

      /* ---------- sounds ---------- */
      if (env.dt > 0 && env.live) {
        const a = signAtTop(th), b = signAtTop(wheelAngle(Math.max(0, t - env.dt)));
        if (a !== b && !holding) SFX.tick({ vol: 0.22 });
      }
      READINGS.forEach((r, i) => {
        if (env.at(r.s)) SFX.ding('A5', { vol: 0.1 });
        if (env.at(r.s + 0.1)) SFX.whoosh({ vol: 0.12 });
        if (env.at(r.s + 0.5)) SFX.chord(r.notes, 0.9, { gap: 0.045, type: 'triangle', vol: 0.07 });
        if (i === 2) [1.1, 1.4, 1.7].forEach(d => { if (env.at(r.s + d)) SFX.chord(r.notes.slice(0, 5), 0.6, { gap: 0.04, type: 'triangle', vol: 0.05 }); });
        if (env.at(r.s + 2.0)) SFX.swoosh({ vol: 0.1 });
      });
      if (env.at(8.75)) { SFX.error({ vol: 0.06 }); SFX.chime({ vol: 0.07, when: 0.15 }); }

      /* ---------- sky ---------- */
      P.gradient(ctx, '#1E1B45', '#4a2a6e');
      P.stars(ctx, t, 11, 60, C.yellow, [0, 280, 1080, 1300]);
      // drifting sparkles
      for (let k = 0; k < 14; k++) {
        const x = (P.hash(k) * 1080 + t * 20 * (0.5 + P.hash(k + 3))) % 1080;
        const y = 300 + ((P.hash(k + 9) * 1300 - t * 40) % 1300 + 1300) % 1300;
        P.star(ctx, x, y, 6 + 6 * Math.abs(Math.sin(t * 3 + k)), '#fff', { shadow: false, points: 4, inner: 0.3 });
      }
      // crescent moon
      P.circle(ctx, 930, 560, 62, '#FBF3DE', { seed: 61 });
      P.circle(ctx, 955, 540, 54, '#262052', { seed: 62, shadow: false });

      /* ---------- wheel ---------- */
      ctx.save();
      const land = READINGS.reduce((z, r) => z + 0.05 * pulse(t, r.s - 0.05, 0.3), 0);
      P.zoom(ctx, 1 + land, WX, WY);
      wheel(ctx, t, th, lit);
      ctx.restore();

      /* ---------- Clawd + ball ---------- */
      let mood = 'happy';
      if (holding) {
        const i = READINGS.indexOf(holding), lt = t - holding.s;
        if (lt > 0.8) mood = ['wow', 'sad', 'side'][i];
        else mood = 'sus';
      }
      if (t >= 8.75 && t < 9.6) mood = 'wow';
      const glow = READINGS.reduce((g, r) => Math.max(g, pulse(t, r.s, 0.8)), 0);
      fortuneClawd(ctx, t, mood);
      crystalBall(ctx, t, glow);

      /* ---------- collected cards (small, left column) ---------- */
      READINGS.forEach((r, i) => {
        if (t < r.s + 2.35) return;
        const st = { x: slotPos(i)[0], y: slotPos(i)[1], sc: 0.3, flip: 1, rot: -0.08 };
        // they fly back into the ball at the end of the loop
        const back = ease.inCubic(prog(t, 9.35 + i * 0.08, 0.35));
        if (back >= 1) return;
        st.x = P.lerp(st.x, BALL[0], back); st.y = P.lerp(st.y, BALL[1], back); st.sc = 0.3 * (1 - back);
        drawCard(ctx, r, i, t, st);
      });

      /* ---------- the big card ---------- */
      READINGS.forEach((r, i) => {
        const lt = t - r.s;
        if (lt < 0.1 || lt >= 2.35) return;
        const st = cardState(r, i, t);
        // sparkle ring while revealing
        const sp = pulse(lt, 0.6, 0.6);
        if (sp > 0) for (let k = 0; k < 10; k++) {
          const a = (k / 10) * TAU + lt * 2;
          P.star(ctx, st.x + Math.cos(a) * 250 * st.sc, st.y + Math.sin(a) * 330 * st.sc, 18 * sp, k % 2 ? C.yellow : '#fff', { shadow: false });
        }
        drawCard(ctx, r, i, t, st);
      });

      /* ---------- reading scroll ---------- */
      let scrollText = null, sp = 0;
      READINGS.forEach(r => {
        const lt = t - r.s;
        if (lt >= 0.8 && lt < 2.1) { scrollText = P.typed(r.text, (lt - 0.8) / 0.6); sp = ease.outBack(prog(lt, 0.8, 0.25)) * (1 - prog(lt, 1.95, 0.15)); }
      });
      if (t >= 8.75 && t < 9.75) { scrollText = '⚠ mercury is in rebase.\ndo not force push.'; sp = ease.outBack(prog(t, 8.75, 0.25)) * (1 - prog(t, 9.6, 0.15)); }
      if (scrollText && sp > 0) {
        ctx.save();
        ctx.translate(540, 1150); ctx.scale(sp, sp); ctx.rotate(-0.015);
        P.rect(ctx, -440, -62, 880, 124, '#FBF3DE', { radius: 12, seed: 71 });
        P.circle(ctx, -440, 0, 30, '#E7D2A6', { seed: 72, ry: 62 });
        P.circle(ctx, 440, 0, 30, '#E7D2A6', { seed: 73, ry: 62 });
        P.text(ctx, scrollText || ' ', 0, 2, { size: 38, font: 'marker', color: C.purple, shadow: false, maxWidth: 820 });
        ctx.restore();
      }

      /* ---------- sign label when landed ---------- */
      if (holding) {
        const lp = ease.outBack(prog(t, holding.s, 0.3)) * (1 - prog(t, holding.s + 0.5, 0.15));
        P.title(ctx, SIGNS[holding.sign].replace('\n', ' ') + '!', 540, 470, { size: 70, color: C.yellow, stroke: C.purple, pop: lp, rot: -0.03 });
      }

      /* ---------- title ---------- */
      const tp = ease.outBack(prog(t, 0, 0.4));
      P.title(ctx, "your model's horoscope", 540, 330, { size: 66, color: '#F6EEDD', stroke: C.purple, pop: tp, rot: Math.sin(t * 1.7) * 0.015 });
      P.text(ctx, '✨ this week ✨', 540, 405, { size: 44, font: 'marker', color: C.pink, scale: ease.outBack(prog(t, 0.15, 0.4)) });

      /* ---------- caption ---------- */
      const cap = t < 6.5 ? 'find your sign ⬆️ (check your config)' : t < 8.75 ? 'segfault-io stay strong 🙏' : 'find your sign ⬆️ (check your config)';
      const cp = t < 6.5 ? 1 : t < 8.75 ? ease.outBack(prog(t, 6.5, 0.3)) : ease.outBack(prog(t, 8.75, 0.3));
      P.sticker(ctx, cap, 60, 1640 - 60, { size: 42, pop: cp, bg: '#FBF3DE' });
    },
  });
})();
