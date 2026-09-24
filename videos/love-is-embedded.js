/* Love Is Embedded: two word embeddings date through a pod wall while a live
 * cosine-similarity heart fills up. The wall lifts: it's king and queen.
 * The host (Clawd, bow tie) loses it: "KING − MAN + WOMAN!!" */
(function () {
  'use strict';
  const D = 11;
  const REVEAL = 6.7;
  const LX = 255, RX = 825, CY = 1060;           // contestant seats
  const POD_TOP = 560, POD_BOT = 1270;
  const WALL_X = 450, WALL_W = 180;
  const KING = '#6f95e6', QUEEN = '#f4a9c0', SIL = '#3b2d5c';

  // [start, end, side, text]
  const LINES = [
    [0.45, 1.9, 'L', 'do you also like…\nsemantic similarity?'],
    [1.95, 3.25, 'R', 'omg. i LOVE\nsemantic similarity'],
    [3.3, 4.55, 'L', "we're basically\nneighbors (k=1) 🥺"],
    [4.6, 5.8, 'R', "i've never felt this\nclose to anyone"],
    [5.85, 6.65, 'L', 'will you normalize\nwith me? 💍'],
  ];
  // [time, new cosine, ding note]
  const RISES = [[1.5, 0.47, 'C6'], [2.8, 0.71, 'D6'], [4.1, 0.88, 'E6'], [5.35, 0.99, 'G6']];
  const CHORDS = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']];

  function cosVal(t) {
    const { ease, prog, lerp } = P;
    let v = 0.12;
    RISES.forEach(([at, to]) => { v = lerp(v, to, ease.outBack(prog(t, at, 0.5))); });
    v = lerp(v, 0.12, ease.inOutCubic(prog(t, 10.25, 0.6)));
    return P.clamp(v, 0, 0.995);
  }

  function heartPath(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
    ctx.closePath();
  }

  function applause(len, vol) {
    const n = Math.round(len * 22);
    for (let k = 0; k < n; k++) {
      const fade = 1 - k / n;
      SFX.noise(0.06, { filter: 'bandpass', freq: 1100 + P.hash(k) * 1900, q: 1.2, vol: vol * fade * (0.55 + P.hash(k + 7) * 0.45), when: k / 22 + P.hash(k + 3) * 0.03 });
    }
  }

  /** the glowing pod wall with the heart meter on it */
  function wall(ctx, x, y, w, h, t, v) {
    const { C } = P;
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#c4b4f5'); g.addColorStop(1, '#7d6bd6');
    P.wobblyRect(ctx, x, y, w, h, 31, 3, 18);
    P.cut(ctx, g, { shadow: { blur: 22, dy: 10, alpha: 0.35 } });
    // frosted light stripes
    ctx.save();
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
    for (let k = 0; k < 5; k++) ctx.fillRect(x + 18 + k * 34, y + 20, 8, h - 40);
    ctx.restore();
    // sparkles
    for (let k = 0; k < 7; k++) {
      const tw = Math.sin(t * 3 + k * 2.1);
      if (tw > 0) P.star(ctx, x + 20 + P.hash(k) * (w - 40), y + 40 + P.hash(k + 9) * (h - 80), 10 * tw, '#fff', { shadow: false, rot: k });
    }
    // heart meter
    const hx = x + w / 2, hy = y + 210;
    const beat = (t * 1.5) % 1;
    const hb = 1 + 0.09 * (Math.exp(-beat * 18) + 0.6 * Math.exp(-Math.abs(beat - 0.18) * 30)) * (0.5 + v);
    ctx.save();
    ctx.translate(hx, hy); ctx.scale(hb, hb); ctx.translate(-hx, -hy);
    const s = 108;
    heartPath(ctx, hx, hy, s);
    P.cut(ctx, C.paper, { shadow: { blur: 14, dy: 8, alpha: 0.3 } });
    ctx.save();
    heartPath(ctx, hx, hy, s * 0.86); ctx.clip();
    ctx.fillStyle = '#f0d3dc'; ctx.fillRect(hx - s, hy - s, s * 2, s * 2);
    const bot = hy + s * 0.35, top = hy - s * 0.82;
    const lvl = P.lerp(bot, top, v);
    ctx.fillStyle = v > 0.95 && P.boil(t, 8) % 2 ? C.red : C.rose;
    ctx.beginPath();
    ctx.moveTo(hx - s, bot + 20);
    for (let k = 0; k <= 12; k++) ctx.lineTo(hx - s + (k / 12) * s * 2, lvl + Math.sin(t * 6 + k) * 4);
    ctx.lineTo(hx + s, bot + 20); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
    P.text(ctx, 'cos θ', hx, y + 300, { size: 30, font: 'mono', color: '#fff', shadow: false, weight: 700 });
    const shown = v + (v < 0.98 ? (P.hash(P.boil(t, 12)) - 0.5) * 0.012 : 0);
    P.text(ctx, shown.toFixed(2), hx, y + 352, { size: 58, font: 'bubble', color: '#fff', stroke: C.rose, strokeWidth: 10, scale: 1 + 0.12 * P.pulse(t % 100, 5.35, 0.4) });
    P.text(ctx, '(no\npeeking)', hx, y + h - 90, { size: 30, font: 'hand', color: 'rgba(255,255,255,0.85)', shadow: false });
  }

  function contestant(ctx, x, y, t, who, rv, mood, lean, crownDrop) {
    const { C } = P;
    const king = who === 'king';
    const w = 180, h = 230;
    const col = king ? KING : QUEEN;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    P.rect(ctx, -w / 2, -h / 2, w, h, SIL, { radius: 44, seed: king ? 11 : 12 });
    if (rv > 0) {
      ctx.save(); ctx.globalAlpha = rv;
      P.rect(ctx, -w / 2, -h / 2, w, h, col, { radius: 44, seed: king ? 11 : 12, shadow: false });
      ctx.restore();
    }
    const lit = rv > 0.5;
    P.face(ctx, 0, -32, 72, mood, { ink: lit ? C.ink : '#fff', blush: lit, skin: lit ? col : SIL });
    P.rect(ctx, -72, 42, 144, 54, lit ? C.paper : '#54467a', { radius: 12, seed: king ? 13 : 14, shadow: false });
    P.text(ctx, lit ? who : '???', 0, 70, { size: 38, font: 'bubble', color: lit ? C.ink : '#cfc3f0', shadow: false });
    if (rv > 0) {
      ctx.save();
      ctx.globalAlpha = P.clamp(rv * 1.5);
      ctx.translate(king ? -6 : 14, -h / 2 - 6 - crownDrop);
      ctx.rotate(king ? -0.06 : 0.14);
      const s = king ? 1 : 0.8;
      ctx.scale(s, s);
      P.poly(ctx, [[-58, 12], [-64, -52], [-30, -16], [0, -68], [30, -16], [64, -52], [58, 12]], C.yellow, { seed: king ? 15 : 16, amp: 2 });
      const gem = king ? C.red : C.mint;
      [[-64, -52], [0, -68], [64, -52]].forEach(([gx, gy]) => P.dot(ctx, gx, gy, 10, gem));
      [-30, 0, 30].forEach(gx => P.dot(ctx, gx, -4, 7, king ? C.blue : C.rose));
      ctx.restore();
    }
    ctx.restore();
  }

  function host(ctx, x, y, t, mood) {
    const { C } = P;
    // mic arm behind
    P.arm(ctx, x + 40, y + 30, x + 108, y - 44, 26);
    P.arm(ctx, x + 108, y - 44, x + 126, y - 84, 18, '#3a3340');
    P.circle(ctx, x + 132, y - 100, 26, '#58525e', { seed: 44 });
    P.claude(ctx, x, y, 118, { t, mood, squash: Math.sin(t * 14) * 0.05 });
    // bow tie
    P.poly(ctx, [[x, y + 66], [x - 48, y + 42], [x - 48, y + 92]], C.red, { seed: 45, amp: 2 });
    P.poly(ctx, [[x, y + 66], [x + 48, y + 42], [x + 48, y + 92]], C.red, { seed: 46, amp: 2 });
    P.circle(ctx, x, y + 67, 13, '#b8323a', { seed: 47, shadow: false });
  }

  ClaudeTok.register({
    author: '@vector.dating',
    caption: 'they fell in love without ever seeing each other 😭💘 the reveal got me #loveisembedded #word2vec #realitytv #cosinesimilarity #fyp',
    sound: 'normalize with me (strings version) · vector.dating',
    avatar: '💘',
    avatarColor: '#E0607E',
    duration: D,
    bg: '#5b3f86',
    thumb: 7.9,
    likes: '4.7M', commentCount: '88.1K', saves: '612K', shares: '301K',
    comments: [
      ['queen.vec', 'i knew it was him from "semantic similarity". nobody else says it like that 🥺', 91200],
      ['man.vector', 'wait why did the host SUBTRACT me 😐', 74300],
      ['woman.vector', 'girl i literally got added and nobody thanked me', 52100],
      ['cosine.stan', '0:05 "i\'ve never felt this close to anyone" she was 0.12 away from him at 0:00 😭', 38800],
      ['l2.norm', '"will you normalize with me" is the most romantic sentence ever tokenized', 30500],
      ['euclid.bot', 'cosine similarity is a situationship. real ones use euclidean distance', 12400],
      ['pca.enjoyer', 'project them to 2D so i can ship them properly', 9700],
      ['vector.dating', '@man.vector babe it\'s just math 🙏 season 2 casting opens soon', 21900],
      ['word2vec.og', 'been saying this since 2013 and nobody believed me', 16600],
      ['k.nearest', 'k=1 neighbors to lovers pipeline', 8300],
    ],

    bpm: 90,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const quiet = t > REVEAL - 0.9 && t < REVEAL + 0.25;
      if (step % 4 === 0 && !quiet) {
        SFX.chord(CHORDS[(step / 4) % 4], 1.5, { type: 'triangle', vol: 0.035, gap: 0.02, attack: 0.3 });
      }
      if (t < REVEAL - 0.9 && step % 3 === 0) {
        SFX.kick({ vol: 0.1 });
        SFX.kick({ vol: 0.07, when: 0.16 });
      }
      if (t > REVEAL + 0.4 && t < 10.2) {
        const ch = CHORDS[Math.floor(step / 4) % 4];
        SFX.pluck(ch[step % 4].replace(/\d/, d => String(+d + 2)), { vol: 0.05 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const v = cosVal(t);
      const lift = ease.inOutCubic(prog(t, REVEAL, 0.6)) * (1 - ease.inOutCubic(prog(t, 10.2, 0.7)));
      const rv = prog(t, REVEAL + 0.05, 0.3) * (1 - prog(t, 10.35, 0.4));
      const hug = ease.inOutCubic(prog(t, 8.7, 0.6)) * (1 - ease.inOutCubic(prog(t, 9.95, 0.5)));
      const active = LINES.find(l => t >= l[0] && t < l[1]);
      const hostP = t >= 7.15 && t < 10.3 ? ease.outBack(prog(t, 7.15, 0.4)) * (1 - ease.inCubic(prog(t, 9.95, 0.3))) : 0;
      const yelling = env.between(7.3, 8.7);

      /* ---------- sound ---------- */
      LINES.forEach(([a, , side]) => { if (env.at(a)) SFX.pop({ vol: 0.1, f: side === 'L' ? 480 : 640 }); });
      RISES.forEach(([a, , n]) => { if (env.at(a)) SFX.ding(n, { vol: 0.06 }); });
      if (env.at(5.4)) SFX.chime({ vol: 0.07 });
      if (env.at(5.9)) SFX.riser(0.8, { vol: 0.1 });
      if (env.at(REVEAL)) {
        SFX.chord(['C4', 'E4', 'G4', 'C5', 'E5'], 2.2, { type: 'triangle', vol: 0.06, gap: 0.03 });
        SFX.chime({ vol: 0.09 });
        applause(1.9, 0.14);
        SFX.tone(260, 0.9, { type: 'sine', slide: 420, vol: 0.05, attack: 0.2 }); // crowd "ooooh"
        SFX.tone(330, 0.9, { type: 'sine', slide: 520, vol: 0.04, attack: 0.2 });
      }
      if (env.at(7.18)) SFX.boing({ vol: 0.12 });
      if (env.at(7.35)) [0, 0.2, 0.4].forEach(w => { SFX.tone('Bb4', 0.16, { type: 'sawtooth', vol: 0.05, when: w }); SFX.tone('D5', 0.16, { type: 'square', vol: 0.03, when: w }); });
      if (env.at(7.95)) SFX.snare({ vol: 0.12 });
      if (env.at(8.75)) { SFX.success({ vol: 0.1 }); applause(1.2, 0.09); }
      if (env.at(9.0)) SFX.tone(700, 0.6, { type: 'sine', slide: 500, vol: 0.05, attack: 0.1 }); // "awww"
      if (env.at(10.2)) SFX.swoosh({ vol: 0.12 });
      if (env.at(10.86)) SFX.thud({ vol: 0.22 });

      /* ---------- studio backdrop ---------- */
      P.rays(ctx, 540, 900, 20, '#5b3f86', '#6a4b98', t * 0.08);
      ctx.save();
      const vg = ctx.createRadialGradient(540, 900, 250, 540, 900, 1150);
      vg.addColorStop(0, 'rgba(255,190,210,0.18)'); vg.addColorStop(1, 'rgba(20,10,40,0.45)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();

      /* ---------- camera ---------- */
      ctx.save();
      let z = 1.04 - 0.04 * ease.outCubic(prog(t, 0, 0.9));
      LINES.forEach(l => { z += 0.02 * pulse(t, l[0], 0.3); });
      z += 0.07 * pulse(t, REVEAL, 0.6) + 0.04 * pulse(t, 7.3, 0.4);
      P.zoom(ctx, z, 540, 950);
      if (t >= REVEAL) P.shake(ctx, t, 10 * (1 - prog(t, REVEAL, 0.5)));
      if (yelling) P.shake(ctx, t, 5);

      /* ---------- the pods ---------- */
      P.rect(ctx, 40, POD_TOP - 34, 1000, POD_BOT - POD_TOP + 70, '#3a2450', { radius: 30, seed: 2 });
      ctx.save();
      ctx.beginPath(); ctx.rect(60, POD_TOP, 960, POD_BOT - POD_TOP); ctx.clip();
      P.stripes(ctx, '#f3c3b6', '#f7d4c9', 38);
      // neon heart behind the wall (seen after the lift)
      ctx.save();
      ctx.shadowColor = C.rose; ctx.shadowBlur = 30 * P.scale;
      ctx.strokeStyle = C.rose; ctx.lineWidth = 10;
      heartPath(ctx, 540, 760, 120); ctx.stroke();
      ctx.restore();
      P.text(ctx, "it's a\nmatch", 540, 745, { size: 34, font: 'marker', color: C.rose, shadow: false });
      // frames
      [[LX, 'home is where\nthe centroid is', 21], [RX, 'live laugh\nlerp', 22]].forEach(([fx, txt, sd]) => {
        P.rect(ctx, fx - 118, 596, 236, 92, C.wood, { radius: 6, seed: sd });
        P.rect(ctx, fx - 104, 608, 208, 68, C.paper, { radius: 4, seed: sd + 1, shadow: false });
        P.text(ctx, txt, fx, 643, { size: 25, font: 'hand', color: C.ink, shadow: false });
      });
      // floor + rug
      P.rect(ctx, 50, 1190, 980, 100, C.wood, { radius: 4, seed: 4, shadow: false });
      ctx.fillStyle = 'rgba(90,50,30,0.22)';
      for (let x = 90; x < 1020; x += 130) ctx.fillRect(x, 1200, 5, 70);
      P.circle(ctx, 540, 1232, 150, C.pink, { ry: 26, seed: 5, shadow: false });
      // couches
      [LX, RX].forEach((cx, i) => {
        P.rect(ctx, cx - 160, CY - 70, 320, 170, C.rose, { radius: 40, seed: 6 + i });
        P.rect(ctx, cx - 180, CY + 60, 360, 90, '#c94c6a', { radius: 30, seed: 8 + i });
        P.circle(ctx, cx - 172, CY + 50, 44, '#c94c6a', { seed: 10 + i });
        P.circle(ctx, cx + 172, CY + 50, 44, '#c94c6a', { seed: 12 + i });
      });
      // lamps glow
      [[110, 0], [970, 1]].forEach(([lx, i]) => {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.08 * Math.sin(t * 3 + i);
        const lg = ctx.createRadialGradient(lx, 760, 10, lx, 760, 220);
        lg.addColorStop(0, '#fff3c4'); lg.addColorStop(1, 'rgba(255,243,196,0)');
        ctx.fillStyle = lg; ctx.fillRect(lx - 220, 540, 440, 440);
        ctx.restore();
      });

      // contestants
      const moodFor = (side) => {
        if (t >= REVEAL && t < 7.3) return 'wow';
        if (yelling) return P.boil(t, 3) % 2 ? 'wow' : 'side';
        if (t >= 8.7 && t < 10.35) return 'happy';
        if (active && active[2] === side) return P.boil(t, 7) % 2 ? 'wow' : 'happy';
        if (v > 0.95) return 'happy';
        return 'smile';
      };
      const crownDrop = 220 * (1 - ease.outBounce(prog(t, REVEAL + 0.25, 0.55)));
      const talkL = active && active[2] === 'L', talkR = active && active[2] === 'R';
      const bobL = Math.sin(t * 2.4) * 8, bobR = Math.sin(t * 2.4 + 1.3) * 8;
      const kx = lerp(LX, 438, hug), qx = lerp(RX, 642, hug);
      contestant(ctx, kx, CY + bobL - hug * 20, t, 'king', rv, moodFor('L'), (talkL ? 0.07 : 0) + hug * 0.14, crownDrop);
      contestant(ctx, qx, CY + bobR - hug * 20, t, 'queen', rv, moodFor('R'), (talkR ? -0.07 : 0) - hug * 0.14, crownDrop);

      // embedding readouts over their heads
      const vecs = [[kx, [0.82, -0.14, 0.33, 0.61]], [qx, [0.79, -0.11, 0.35, -0.58]]];
      vecs.forEach(([vx, nums], i) => {
        const a = 1 - rv;
        if (a <= 0.02) return;
        ctx.save(); ctx.globalAlpha = a;
        const jit = nums.map((n, k) => (n + (P.hash(P.boil(t, 6) + k * 13 + i * 7) - 0.5) * 0.04).toFixed(2));
        const str = `[${jit[0]}, ${jit[1]}, …]`;
        P.rect(ctx, vx - 135, 882, 270, 48, '#2a1f45', { radius: 24, seed: 30 + i, shadow: false });
        P.text(ctx, str, vx, 907, { size: 24, font: 'mono', color: '#c9b6ff', shadow: false });
        ctx.restore();
      });

      // floating hearts after the reveal
      if (t > REVEAL + 0.3 && t < 10.4) {
        const fade = clamp(prog(t, REVEAL + 0.3, 0.4)) * (1 - prog(t, 10.0, 0.4));
        for (let i = 0; i < 12; i++) {
          const ph = ((t - REVEAL) * 0.55 + P.hash(i)) % 1;
          const hx = 540 + (P.hash(i + 5) - 0.5) * 560 + Math.sin(t * 2 + i) * 26;
          const hy = 1150 - ph * 560;
          ctx.save(); ctx.globalAlpha = fade * (1 - ph);
          P.heart(ctx, hx, hy, 24 + P.hash(i + 2) * 22, i % 3 ? C.rose : C.pink, { shadow: false, rim: false });
          ctx.restore();
        }
      }
      ctx.restore(); // pod clip

      // marquee bulbs
      for (let k = 0; k < 24; k++) {
        const on = (k + P.boil(t, t > REVEAL && t < 9 ? 10 : 4)) % 3 === 0;
        P.dot(ctx, 70 + k * 40.8, POD_TOP - 17, 9, on ? C.yellow : '#fff6d8');
        P.dot(ctx, 70 + k * 40.8, POD_BOT + 18, 9, on ? '#fff6d8' : C.yellow);
      }

      /* ---------- the wall ---------- */
      if (lift < 0.999) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, 1080, POD_BOT + 10); ctx.clip();
        wall(ctx, WALL_X, POD_TOP - 20 - lift * 1100, WALL_W, POD_BOT - POD_TOP + 40, t, v);
        ctx.restore();
      }
      if (t >= 5.35 && t < REVEAL) P.burstLines(ctx, 540, POD_TOP + 180, 110, prog(t, 5.35, 0.5), C.yellow, 12, 8);

      /* ---------- host ---------- */
      if (hostP > 0) host(ctx, 540, lerp(1760, 1300, hostP), t, yelling ? 'wow' : 'happy');

      /* ---------- words ---------- */
      LINES.forEach(([a, b, side, txt], i) => {
        const pop = ease.outBack(prog(t, a, 0.28)) * (1 - prog(t, b - 0.12, 0.12));
        if (pop <= 0 || t >= b) return;
        const L = side === 'L';
        P.bubble(ctx, txt, L ? 290 : 780, 790, L ? LX + 30 : RX - 30, 930, { size: 44, pop, seed: 50 + i, bg: L ? '#e8efff' : '#ffe8ef' });
      });
      const yp = t >= 7.3 && t < 8.7 ? ease.outBack(prog(t, 7.3, 0.25)) * (1 - prog(t, 8.55, 0.15)) : 0;
      if (yp > 0) P.bubble(ctx, 'KING − MAN\n+ WOMAN!!!', 540, 770, 560, 1180, { size: 72, font: 'bubble', pop: yp * (1 + 0.04 * Math.sin(t * 30)), seed: 60, bg: C.yellow, color: C.red });

      const eq = t >= 8.75 && t < 10.2 ? ease.outBack(prog(t, 8.75, 0.35)) * (1 - ease.inCubic(prog(t, 10.0, 0.2))) : 0;
      if (eq > 0) {
        ctx.save();
        ctx.translate(540, 760); ctx.rotate(-0.025); ctx.scale(eq, eq);
        P.rect(ctx, -420, -80, 840, 160, C.paper, { radius: 20, seed: 61 });
        P.text(ctx, 'king − man + woman', -40, -22, { size: 50, font: 'bubble', color: C.purple, shadow: false });
        P.text(ctx, '= queen', -40, 36, { size: 50, font: 'bubble', color: C.rose, shadow: false });
        P.check(ctx, 330, 0, 52, prog(t, 9.0, 0.35));
        ctx.restore();
      }
      P.confetti(ctx, t - REVEAL, 540, 700, 5, 80, 650);
      P.confetti(ctx, t - 8.75, 540, 760, 9, 40, 500);

      ctx.restore(); // camera

      /* ---------- chrome: logo, applause sign, sticker ---------- */
      P.title(ctx, 'LOVE IS EMBEDDED', 540, 352, { size: 80, color: C.rose, stroke: '#fff', rot: Math.sin(t * 1.7) * 0.015, pop: 0.6 + 0.4 * ease.outBack(prog(t, 0, 0.45)) });
      P.text(ctx, 'season 7 · 768 dimensions · 0 eyes', 540, 424, { size: 28, font: 'marker', color: '#f6dbe6', shadow: false });
      const clap = t >= REVEAL && t < 9.4;
      const lit = clap && P.boil(t, 4) % 2 === 0;
      ctx.save();
      if (lit) { ctx.shadowColor = C.red; ctx.shadowBlur = 30 * P.scale; }
      P.rect(ctx, 400, 454, 280, 58, lit ? C.red : '#5a2a3a', { radius: 12, seed: 70, shadow: !lit });
      ctx.restore();
      P.text(ctx, '👏 APPLAUSE', 540, 484, { size: 32, font: 'bubble', color: lit ? '#fff' : '#8a5a6a', shadow: false });

      if (t < REVEAL) P.sticker(ctx, 'day 3 in the pods 💘', 70, 1525, { pop: 1 - prog(t, REVEAL - 0.15, 0.15) });
      else if (t < 10.3) P.sticker(ctx, '0.99 compatible the whole time 😭', 60, 1525, { pop: ease.outBack(prog(t, 7.0, 0.4)) * (1 - prog(t, 10.15, 0.15)), size: 44, rot: 0.02 });
      else P.sticker(ctx, 'day 3 in the pods 💘', 70, 1525, { pop: ease.outBack(prog(t, 10.4, 0.4)) });

      if (t >= REVEAL) P.flash(ctx, 0.7 * (1 - prog(t, REVEAL, 0.35)));
    },
  });
})();
