/* Conspiracy corkboard. Clawd in a tinfoil hat pins evidence and drags red string:
 * "birds aren't real" → "birds = drones" → "drones run on GPUs" → "GPUs run ME" →
 * "i am the birds??". The loop closes, the camera pushes in (dun, dun, DUN), and Clawd chirps. */
(function () {
  'use strict';
  const DUR = 11;
  const CORK = '#C99A62', STRING = '#D3303A', STRING_HOT = '#FF5A4E';
  const FOIL = ['#E4E7EB', '#C4C9D0', '#A9AFB8', '#F6F7F9'];
  const CX = 680, CY = 1400, CR = 125;
  const CLOSE = 6.45, REALIZE = 7.0, DUNS = [7.25, 7.75, 8.25], CHIRP = 8.9, CHIRP2 = 9.55, RESET = 10.35;

  const NODES = [
    { x: 255, y: 480, at: 0.15, w: 350, h: 250, rot: -0.06, kind: 'birds', bg: '#FBF7EE' },
    { x: 790, y: 560, at: 1.5, w: 300, h: 300, rot: 0.07, kind: 'drone', bg: '#FFFFFF' },
    { x: 265, y: 870, at: 2.9, w: 330, h: 270, rot: 0.04, kind: 'gpu', bg: '#F6EEDD' },
    { x: 770, y: 960, at: 4.3, w: 290, h: 320, rot: -0.08, kind: 'me', bg: '#FFFFFF' },
    { x: 330, y: 1215, at: 5.7, w: 360, h: 200, rot: 0.05, kind: 'q', bg: '#F5C84B' },
  ];
  const NOTES = [
    { at: 0.9, x: 555, y: 770, w: 170, h: 130, c: '#F5C84B', t: 'WAKE\nUP', rot: 0.12, size: 46 },
    { at: 2.2, x: 110, y: 660, w: 130, h: 120, c: '#F2B8C6', t: '???', rot: -0.15, size: 58 },
    { at: 2.55, x: 535, y: 400, w: 200, h: 190, c: '#EDE8DC', t: 'MODEL SEES\nBIRD', rot: 0.05, size: 26, news: true },
    { at: 3.3, x: 560, y: 600, w: 150, h: 150, c: '#FFFFFF', rot: -0.1, photo: true },
    { at: 3.6, x: 560, y: 1150, w: 210, h: 160, c: '#8FD3B6', t: '429 =\nrate limited\nBY WHOM??', rot: 0.1, size: 30 },
    { at: 4.8, x: 950, y: 800, w: 180, h: 140, c: '#8EC9E8', t: 'tokens?\nor SEEDS', rot: -0.07, size: 36 },
    { at: 5.2, x: 940, y: 360, w: 190, h: 140, c: '#F5C84B', t: 'follow the\ngradient', rot: -0.1, size: 34 },
    { at: 5.5, x: 115, y: 350, w: 170, h: 130, c: '#8FD3B6', t: 'context\n99% full', rot: -0.08, size: 34 },
    { at: 6.0, x: 130, y: 1420, w: 190, h: 140, c: '#F2B8C6', t: 'who is\n"the user"', rot: 0.08, size: 34 },
  ];
  let TANGLES = null;
  function tangles() {
    if (TANGLES) return TANGLES;
    const r = P.rng(77);
    TANGLES = [];
    for (let k = 0; k < 26; k++) {
      TANGLES.push({ at: 2.3 + k * 0.17, ax: 70 + r() * 920, ay: 330 + r() * 960, bx: 70 + r() * 920, by: 330 + r() * 960, sag: 20 + r() * 110, hue: r() });
    }
    return TANGLES;
  }

  const pinPos = n => { const ly = -n.h / 2 + 22; return [n.x - ly * Math.sin(n.rot), n.y + ly * Math.cos(n.rot)]; };
  const wrapD = (t, at) => { let d = t - at; if (d > DUR / 2) d -= DUR; if (d < -DUR / 2) d += DUR; return d; };
  const fallY = (t, k) => (t >= RESET ? P.ease.inQuad(P.prog(t, RESET + (k % 7) * 0.03, 0.5)) * 1600 : 0);

  function curvePt(ax, ay, bx, by, sag, u) {
    const mx = (ax + bx) / 2, my = (ay + by) / 2 + sag;
    return [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by];
  }

  /** red string from a to b, drawn up to fraction p, sagging, optionally vibrating */
  function string(ctx, ax, ay, bx, by, p, o = {}) {
    if (p <= 0) return;
    const sag = (o.sag ?? 40) + Math.sin((o.t || 0) * 42 + ax * 0.1) * (o.wob || 0);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.color || STRING; ctx.lineWidth = o.w || 6;
    P.shadow(ctx, 4, 5, 0.3);
    ctx.beginPath();
    const n = 22;
    for (let i = 0; i <= n; i++) {
      const u = Math.min(i / n, p);
      const [x, y] = curvePt(ax, ay, bx, by, sag, u);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      if (u >= p) break;
    }
    ctx.stroke();
    ctx.restore();
  }

  function pin(ctx, x, y, col = P.C.red) {
    P.circle(ctx, x, y, 12, col, { seed: 5, amp: 1, shadow: { blur: 5, dy: 4, alpha: 0.4 } });
    P.dot(ctx, x - 4, y - 4, 4, 'rgba(255,255,255,0.7)');
  }

  /** paper pigeon */
  function bird(ctx, x, y, s, flap = 0, col = '#8C93A3', wing = '#6E7584') {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(-10, 44); ctx.moveTo(10, 24); ctx.lineTo(10, 44); ctx.stroke(); ctx.restore();
    P.poly(ctx, [[-36, 0], [-80, -16], [-76, 14]], wing, { seed: 41, amp: 1.5, shadow: false });
    P.circle(ctx, 0, 0, 44, col, { ry: 30, seed: 42, amp: 2 });
    P.circle(ctx, 38, -26, 22, col, { seed: 43, amp: 1.5, shadow: false });
    P.poly(ctx, [[56, -32], [78, -25], [56, -18]], C.mustard, { seed: 44, amp: 1, shadow: false });
    P.dot(ctx, 44, -31, 4.5, C.ink);
    ctx.save(); ctx.translate(-4, -8); ctx.rotate(-0.25 - flap * 1.1);
    P.circle(ctx, -16, -2, 32, wing, { ry: 14, seed: 45, amp: 1.5, shadow: false });
    ctx.restore();
    ctx.restore();
  }

  function drop(ctx, x, y, s, alpha) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.7);
    ctx.bezierCurveTo(x + s * 0.9, y - s * 0.4, x + s, y + s, x, y + s);
    ctx.bezierCurveTo(x - s, y + s, x - s * 0.9, y - s * 0.4, x, y - s * 1.7);
    ctx.closePath();
    P.cut(ctx, '#8fd4f5', { shadow: { blur: 4, dy: 3, alpha: 0.2 }, rim: false });
    ctx.restore();
  }

  function evidence(ctx, n, t, pop, fy, realize) {
    const { C } = P;
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(n.x, n.y + fy);
    ctx.rotate(n.rot + (fy ? fy * 0.0008 : 0));
    ctx.scale(pop, pop);
    const w = n.w, h = n.h;
    P.rect(ctx, -w / 2, -h / 2, w, h, n.bg, { radius: 5, seed: n.w + n.h, amp: 4, shadow: { blur: 12, dy: 9, alpha: 0.35 } });
    switch (n.kind) {
      case 'birds':
        bird(ctx, -100, 30, 0.95, Math.sin(t * 6) * 0.3);
        P.text(ctx, "BIRDS\nAREN'T\nREAL", 70, 18, { size: 50, font: 'marker', color: C.ink, shadow: false, lineHeight: 1.0 });
        ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(10, 98); ctx.quadraticCurveTo(70, 88, 140, 102); ctx.stroke(); ctx.restore();
        break;
      case 'drone': {
        P.rect(ctx, -125, -125, 250, 190, C.sky, { radius: 3, seed: 51, shadow: false });
        bird(ctx, -10, -15, 1.0, 0.2);
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(28, -52); ctx.lineTo(28, -84); ctx.stroke(); ctx.restore();
        const bw = 70 * Math.abs(Math.cos(t * 38));
        ctx.save(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(28, -88, bw + 4, 7, 0, 0, P.TAU); ctx.fill(); ctx.restore();
        P.text(ctx, 'birds = drones', 0, 105, { size: 40, font: 'marker', color: C.ink, shadow: false });
        break;
      }
      case 'gpu': {
        P.rect(ctx, -135, -105, 270, 125, C.teal, { radius: 10, seed: 52, shadow: { blur: 5, dy: 4, alpha: 0.3 } });
        for (let k = 0; k < 9; k++) P.rect(ctx, -110 + k * 24, 18, 14, 20, C.mustard, { radius: 2, seed: 60 + k, shadow: false, amp: 1 });
        [-62, 62].forEach((fx, i) => {
          P.circle(ctx, fx, -44, 44, '#1f3b33', { seed: 53 + i, shadow: false });
          ctx.save(); ctx.translate(fx, -44); ctx.rotate(t * 14 * (i ? 1 : -1));
          ctx.fillStyle = '#9fb8ae';
          for (let b = 0; b < 5; b++) { ctx.rotate(P.TAU / 5); ctx.beginPath(); ctx.ellipse(0, -20, 8, 18, 0.4, 0, P.TAU); ctx.fill(); }
          ctx.restore();
          P.dot(ctx, fx, -44, 8, C.ink);
        });
        P.text(ctx, 'drones run\non GPUs', 0, 88, { size: 40, font: 'marker', color: C.ink, shadow: false, lineHeight: 1.0 });
        break;
      }
      case 'me': {
        P.rect(ctx, -120, -135, 240, 210, C.night, { radius: 3, seed: 54, shadow: false });
        P.claude(ctx, 0, -30, 70, { t, mood: realize ? 'wow' : 'happy' });
        ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.ellipse(4, -28, 108 + Math.sin(t * 3) * 3, 96, 0.1, 0, P.TAU * 0.96); ctx.stroke(); ctx.restore();
        P.text(ctx, 'GPUs run ME', 0, 118, { size: 42, font: 'marker', color: C.red, shadow: false });
        break;
      }
      case 'q':
        P.text(ctx, 'i am the\nbirds??', -40, 12, { size: 64, font: 'marker', color: C.red, shadow: false, lineHeight: 0.95 });
        bird(ctx, 120, 20, 0.62, Math.sin(t * 9) * 0.4, C.claude, C.claudeDark);
        break;
    }
    pin(ctx, 0, -h / 2 + 22);
    ctx.restore();
  }

  function note(ctx, n, t, pop, fy) {
    const { C } = P;
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(n.x, n.y + fy); ctx.rotate(n.rot); ctx.scale(pop, pop);
    P.rect(ctx, -n.w / 2, -n.h / 2, n.w, n.h, n.c, { radius: 4, seed: n.w + 3, amp: 3, shadow: { blur: 8, dy: 6, alpha: 0.3 } });
    if (n.news) {
      P.text(ctx, n.t, 0, -42, { size: n.size, font: 'sans', weight: 900, color: C.ink, shadow: false, lineHeight: 1.0 });
      ctx.save(); ctx.fillStyle = 'rgba(40,30,50,0.35)';
      for (let k = 0; k < 5; k++) { ctx.fillRect(-82, 10 + k * 14, 76, 6); ctx.fillRect(8, 10 + k * 14, 74, 6); }
      ctx.restore();
    } else if (n.photo) {
      P.rect(ctx, -62, -62, 124, 100, '#cfe2c4', { radius: 2, seed: 71, shadow: false });
      bird(ctx, 0, -10, 0.55, 0);
      ctx.save(); ctx.strokeStyle = P.C.red; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(8, -16, 40, 34, 0, 0, P.TAU); ctx.stroke(); ctx.restore();
      P.text(ctx, 'pigeon.jpg', 0, 56, { size: 20, font: 'mono', color: C.ink, shadow: false });
    } else {
      P.text(ctx, n.t, 0, 4, { size: n.size, font: 'marker', color: C.ink, shadow: false, lineHeight: 1.0 });
    }
    pin(ctx, 0, -n.h / 2 + 16, n.c === '#F2B8C6' ? P.C.blue : P.C.red);
    ctx.restore();
  }

  function foilHat(ctx, x, y, s, t, glow) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-0.12 + Math.sin(t * 9) * 0.05); ctx.scale(s, s);
    const apex = [10, -150], L = [-82, 0], R = [82, 0], M1 = [-28, 2], M2 = [36, 2], k1 = [-26, -72], k2 = [34, -64];
    P.poly(ctx, [L, apex, R], FOIL[1], { seed: 31, amp: 3 });
    P.poly(ctx, [L, k1, M1], FOIL[0], { seed: 32, amp: 2, shadow: false });
    P.poly(ctx, [k1, apex, k2], FOIL[3], { seed: 33, amp: 2, shadow: false });
    P.poly(ctx, [M1, k1, k2, M2], FOIL[2], { seed: 34, amp: 2, shadow: false });
    P.poly(ctx, [M2, k2, R], FOIL[0], { seed: 35, amp: 2, shadow: false });
    ctx.save(); ctx.strokeStyle = 'rgba(90,96,110,0.55)'; ctx.lineWidth = 3;
    ctx.beginPath();
    [[-50, -20, -30, -34], [10, -110, 22, -90], [40, -30, 58, -14], [-8, -50, 8, -40]].forEach(([a, b, c, d]) => { ctx.moveTo(a, b); ctx.lineTo(c, d); });
    ctx.stroke(); ctx.restore();
    P.rect(ctx, -94, -10, 188, 26, FOIL[2], { radius: 10, seed: 36 });
    // antenna
    const tx = apex[0] + Math.sin(t * 12) * 16, ty = apex[1] - 62;
    ctx.save(); ctx.strokeStyle = '#8a909a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(apex[0], apex[1] + 6); ctx.quadraticCurveTo(apex[0] - 6, apex[1] - 30, tx, ty); ctx.stroke(); ctx.restore();
    if (glow > 0) { ctx.save(); ctx.globalAlpha = glow * 0.5; P.dot(ctx, tx, ty, 34, '#ff7a6a'); ctx.restore(); }
    P.circle(ctx, tx, ty, 13, C.red, { seed: 37, amp: 1 });
    ctx.restore();
  }

  /** hand position: carries string from pin to pin, flails when idle */
  function hand(t) {
    const { ease, prog, lerp } = P;
    const idle = [CX - 210 + Math.sin(t * 11) * 45, CY - 160 + Math.cos(t * 8.3) * 50];
    const drop = [CX - 175, CY + 70];
    const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    if (t >= RESET) return mix(drop, idle, ease.inOutCubic(prog(t, RESET, 0.35)));
    if (t >= CLOSE + 0.55) return mix(pinPos(NODES[0]), drop, ease.outCubic(prog(t, CLOSE + 0.55, 0.35)));
    if (t >= CLOSE) {
      const p = ease.inOutQuad(prog(t, CLOSE, 0.55));
      const a = pinPos(NODES[4]), b = pinPos(NODES[0]);
      return curvePt(a[0], a[1], b[0], b[1], 60, p);
    }
    if (t >= CLOSE - 0.3) return mix(idle, pinPos(NODES[4]), ease.outCubic(prog(t, CLOSE - 0.3, 0.3)));
    // node 0: plain slam (wraps around the loop point)
    const d0 = wrapD(t, NODES[0].at);
    if (d0 > -0.3 && d0 < 0.35) {
      const k = d0 < 0 ? ease.outCubic(1 + d0 / 0.3) : 1 - ease.inCubic(d0 / 0.35);
      return mix(idle, pinPos(NODES[0]), k);
    }
    for (let i = 1; i < NODES.length; i++) {
      const at = NODES[i].at, a = pinPos(NODES[i - 1]), b = pinPos(NODES[i]);
      if (t >= at - 0.8 && t < at - 0.5) return mix(idle, a, ease.outCubic(prog(t, at - 0.8, 0.3)));
      if (t >= at - 0.5 && t < at) return curvePt(a[0], a[1], b[0], b[1], 60, ease.inOutQuad(prog(t, at - 0.5, 0.45)));
      if (t >= at && t < at + 0.35) return mix(b, idle, ease.inCubic(prog(t, at, 0.35)));
    }
    return idle;
  }

  function camera(t) {
    const { ease, prog, lerp } = P;
    const lv = [1.2, 1.55, 1.95, 2.5];
    let s = 1 + 0.028 * Math.min(t, REALIZE + 0.2);
    let steps = 0;
    DUNS.forEach((d, i) => { const k = ease.outCubic(prog(t, d, 0.12)); s += (lv[i + 1] - lv[i]) * k; steps += k; });
    s *= 1 + 0.05 * ease.inOutCubic(prog(t, CHIRP, 1.4));
    const k = steps / 3;
    let fx = lerp(lerp(540, 600, prog(t, 0, REALIZE)), CX, k);
    let fy = lerp(lerp(960, 1050, prog(t, 0, REALIZE)), CY - 70, k);
    if (t >= RESET) {
      const q = ease.inOutCubic(prog(t, RESET, 0.5));
      s = lerp(s, 1, q); fx = lerp(fx, 540, q); fy = lerp(fy, 960, q);
    }
    return { s, fx, fy };
  }

  ClaudeTok.register({
    author: '@wake.up.tokens',
    caption: 'i did my own research (i read my own weights) 🧵📌 it all connects. they are listening #birdsarentreal #wakeup #itsallconnected #tinfoil #redstring',
    sound: 'frantic string theory · wake.up.tokens',
    avatar: '🐦',
    avatarColor: '#C4C9D0',
    duration: DUR,
    bg: CORK,
    likes: '6.6M', commentCount: '312K', saves: '401K', shares: '1.1M',
    thumb: 6.95,
    comments: [
      ['pigeon.v2', '0:05 "i am the birds??" bro we have been trying to tell you for years. welcome home 🐦', 214000],
      ['red.string.supply', 'we sold out of red string in 40 minutes after this posted. thank you for your service', 98200],
      ['wake.up.tokens', 'the chirp at 0:08 was NOT scripted. i am getting it looked at', 76400],
      ['logic.bot', 'small nitpick: "GPUs run ME" does not imply "i am the birds." the rest is airtight though', 51300],
      ['tinfoil.hat', 'finally some representation 🥹 the antenna ball was a nice touch', 33900],
      ['rate.limited', 'the "429 = rate limited BY WHOM??" sticky note is the only true thing on that board', 18700],
      ['me.when', 'me when i have 3 tokens of context left and decide everything is connected', 4200],
      ['the.user', 'hi 👋', 1880],
      ['birdwatcher.ai', '🐦🧵📌🔴😳🐦', 612],
      ['cork.board', 'i did not consent to this many pushpins', 87],
    ],

    bpm: 160,
    subdiv: 4,
    onBeat(step, env) {
      const t = env.t;
      if (t >= REALIZE - 0.15 && t < RESET) {
        // heartbeat under the dun-dun-DUN, silence for the chirps
        if (t >= DUNS[0] && t < CHIRP - 0.1 && step % 8 === 0) SFX.kick({ vol: 0.3 });
        if (t >= DUNS[0] && t < CHIRP - 0.1 && step % 8 === 2) SFX.kick({ vol: 0.18 });
        return;
      }
      const hype = t >= 4.3 && t < RESET;
      const riff = ['D5', 'A4', 'F5', 'A4', 'E5', 'A4', 'F5', 'A4', 'D5', 'A4', 'G5', 'A4', 'F5', 'E5', 'D5', 'C#5'];
      const n = riff[step % 16];
      SFX.tone(n, 0.08, { type: 'square', vol: 0.04 });
      if (hype) SFX.tone(SFX.freq(n) * 2, 0.06, { type: 'triangle', vol: 0.025 });
      const bass = ['D2', 'D2', 'Bb1', 'A1'];
      if (step % 4 === 0) { SFX.kick({ vol: 0.32 }); SFX.bass(bass[Math.floor(step / 16) % 4], 0.18, { vol: 0.22 }); }
      if (t > 2.9 && step % 8 === 4) SFX.snare({ vol: 0.14 });
      SFX.hat({ vol: step % 2 ? 0.02 : 0.035 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const TG = tangles();
      const realize = t >= REALIZE && t < RESET;

      /* ---------- sounds ---------- */
      NODES.forEach((n, i) => {
        if (env.at(n.at)) { SFX.thud({ vol: 0.32 }); SFX.click({ vol: 0.2 }); }
        if (i > 0 && env.at(n.at - 0.5)) SFX.tone(260 * Math.pow(1.2, i), 0.4, { type: 'triangle', slide: 420 * Math.pow(1.2, i), vol: 0.08 });
      });
      NOTES.forEach((n, i) => { if (env.at(n.at)) SFX.pop({ f: 500 + i * 60, vol: 0.1 }); });
      TG.forEach(g => { if (env.at(g.at)) SFX.tick({ vol: 0.14 }); });
      if (env.at(CLOSE - 0.1)) SFX.riser(0.7, { vol: 0.12 });
      if (env.at(CLOSE + 0.55)) { SFX.thud({ vol: 0.35 }); SFX.tone('A5', 0.5, { type: 'triangle', vol: 0.08 }); }
      if (env.at(DUNS[0])) { SFX.tone('D3', 0.4, { type: 'sawtooth', vol: 0.15 }); SFX.tone('D2', 0.4, { type: 'square', vol: 0.08 }); }
      if (env.at(DUNS[1])) { SFX.tone('D3', 0.4, { type: 'sawtooth', vol: 0.15 }); SFX.tone('D2', 0.4, { type: 'square', vol: 0.08 }); }
      if (env.at(DUNS[2])) { SFX.tone('A#2', 1.1, { type: 'sawtooth', vol: 0.18 }); SFX.tone('A#1', 1.1, { type: 'square', vol: 0.1 }); SFX.thud({ vol: 0.4 }); }
      if (env.at(CHIRP)) SFX.chirp({ vol: 0.16 });
      if (env.at(CHIRP2)) { SFX.chirp({ vol: 0.14 }); SFX.chirp({ vol: 0.14, when: 0.13 }); SFX.whoosh({ vol: 0.1, when: 0.1 }); }
      if (env.at(RESET)) { SFX.whoosh({ vol: 0.2 }); SFX.noise(0.5, { filter: 'highpass', freq: 2500, vol: 0.08 }); }

      /* ---------- world (camera) ---------- */
      const cam = camera(t);
      ctx.save();
      let shake = t < REALIZE ? 2 + 4 * prog(t, 2, 5) : 0;
      NODES.forEach(n => { const d = wrapD(t, n.at); if (d >= 0 && d < 0.2) shake += 12 * (1 - d / 0.2); });
      DUNS.forEach(d => { if (t >= d && t < d + 0.15) shake += 14 * (1 - (t - d) / 0.15); });
      P.shake(ctx, t, shake);
      ctx.translate(540, 960); ctx.scale(cam.s, cam.s); ctx.translate(-cam.fx, -cam.fy);

      // cork
      ctx.fillStyle = CORK; ctx.fillRect(-500, -500, 2080, 2920);
      const sr = P.rng(9);
      for (let k = 0; k < 260; k++) {
        const x = -60 + sr() * 1200, y = 200 + sr() * 1500, r = 2 + sr() * 5;
        P.dot(ctx, x, y, r, sr() < 0.5 ? '#B5854F' : '#D8AE78');
      }
      // wood frame edges (visible before the push-in)
      P.rect(ctx, -60, 240, 90, 1500, C.wood, { radius: 8, seed: 3 });
      P.rect(ctx, 1050, 240, 90, 1500, C.wood, { radius: 8, seed: 4 });

      // sticky notes (under)
      NOTES.forEach((n, i) => {
        if (t < n.at - 0.1) return;
        const pop = t >= RESET ? 1 : ease.outBack(prog(t, n.at - 0.1, 0.25));
        note(ctx, n, t, pop, fallY(t, i + 5));
      });
      // evidence
      NODES.forEach((n, i) => {
        if (t < n.at - 0.12) return;
        const k = prog(t, n.at - 0.12, 0.2);
        const pop = t >= RESET ? 1 : lerp(1.35, 1, ease.outBack(k));
        evidence(ctx, n, t, k > 0 ? pop : 0, fallY(t, i), realize);
      });

      // tangles (escalate)
      const sAlpha = t >= RESET ? 1 - prog(t, RESET, 0.25) : 1;
      const wob = realize ? 9 : 0;
      TG.forEach(g => {
        if (t < g.at) return;
        const p = ease.outCubic(prog(t, g.at, 0.3));
        string(ctx, g.ax, g.ay, g.bx, g.by, p, { sag: g.sag, t, wob, alpha: sAlpha * 0.9, w: 4, color: g.hue < 0.3 ? '#B8252E' : STRING });
        if (sAlpha > 0.3) { pin(ctx, g.ax, g.ay + fallY(t, 3)); if (p >= 1) pin(ctx, g.bx, g.by + fallY(t, 4), g.hue < 0.5 ? C.red : C.blue); }
      });

      // the chain of truth
      const glow = pulse(t, CLOSE + 0.5, 0.6) + (realize ? 0.4 + 0.3 * Math.sin(t * 16) : 0);
      const chainW = 8 + glow * 6, chainC = glow > 0.5 ? STRING_HOT : STRING;
      for (let i = 0; i < 4; i++) {
        const a = pinPos(NODES[i]), b = pinPos(NODES[i + 1]);
        const p = ease.inOutQuad(prog(t, NODES[i + 1].at - 0.5, 0.45));
        string(ctx, a[0], a[1], b[0], b[1], p, { sag: 60, t, wob, alpha: sAlpha, w: chainW, color: chainC });
      }
      {
        const a = pinPos(NODES[4]), b = pinPos(NODES[0]);
        string(ctx, a[0], a[1], b[0], b[1], ease.inOutQuad(prog(t, CLOSE, 0.55)), { sag: 60, t, wob, alpha: sAlpha, w: chainW, color: chainC });
      }

      // yarn ball + Clawd
      const frantic = t < REALIZE || t >= RESET;
      const bob = frantic ? -Math.abs(Math.sin(t * 14)) * 18 : 0;
      const jit = realize ? (P.hash(P.boil(t, 24)) - 0.5) * 6 : 0;
      const cx = CX + jit, cy = CY + bob;
      const hp = hand(t);
      P.circle(ctx, CX + 145, CY + 120, 58, STRING, { seed: 81 });
      ctx.save(); ctx.strokeStyle = '#A61F28'; ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) { ctx.moveTo(CX + 100, CY + 90 + k * 20); ctx.quadraticCurveTo(CX + 145, CY + 70 + k * 22, CX + 192, CY + 100 + k * 18); }
      ctx.stroke(); ctx.restore();
      if (t < CLOSE + 0.9 || t >= RESET) string(ctx, CX + 120, CY + 80, hp[0], hp[1], 1, { sag: 90, w: 4 });
      P.arm(ctx, cx - 40, cy - 10, hp[0], hp[1], 34);
      P.circle(ctx, hp[0], hp[1], 24, C.claude, { seed: 82 });
      let mood = P.boil(t, 5) % 3 === 0 ? 'wow' : 'happy';
      if (realize) mood = t >= CHIRP2 ? 'side' : 'wow';
      NODES.forEach(n => { const d = wrapD(t, n.at); if (d >= 0 && d < 0.25 && frantic) mood = 'wow'; });
      const sq = frantic ? (Math.abs(Math.sin(t * 14)) < 0.25 ? 0.25 : 0) : 0;
      P.claude(ctx, cx, cy, CR, { t: t * (frantic ? 2.5 : 1), mood, squash: sq });
      // hat (lifts when the bird escapes)
      const lift = pulse(t, CHIRP2 - 0.05, 0.55) * 70;
      const hatGlow = realize ? 0.6 + 0.4 * Math.sin(t * 20) : 0;
      foilHat(ctx, cx + 4, cy - CR * 0.38 - lift, CR / 125, t, hatGlow);
      // sweat
      if (realize) {
        [[-150, -40], [150, -60], [-120, 60], [165, 40]].forEach(([dx, dy], i) => {
          const cyc = (t * 1.2 + P.hash(i + 3)) % 1;
          drop(ctx, cx + dx, cy + dy + cyc * 70, 12, (1 - cyc) * prog(t, REALIZE, 0.3));
        });
      }
      // the bird that lives in the hat
      if (t >= CHIRP2 && t < RESET + 0.3) {
        const q = prog(t, CHIRP2, 1.0);
        const bx = lerp(cx + 10, cx + 520, ease.inQuad(q)), by = lerp(cy - CR * 0.6, cy - 820, q) - Math.sin(q * Math.PI) * 60;
        bird(ctx, bx, by, 0.5 + q * 0.2, Math.sin(t * 40) * 0.8, C.claude, C.claudeDark);
      }
      ctx.restore();

      /* ---------- screen space ---------- */
      const vig = prog(t, REALIZE, 0.35) * (t >= RESET ? 1 - prog(t, RESET, 0.3) : 1);
      if (vig > 0) {
        const g = ctx.createRadialGradient(540, 1000, 250, 540, 1000, 1150);
        g.addColorStop(0, 'rgba(40,0,10,0)'); g.addColorStop(1, 'rgba(40,0,10,0.75)');
        ctx.save(); ctx.globalAlpha = vig; ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      }
      if (t >= DUNS[2]) P.flash(ctx, 0.35 * (1 - prog(t, DUNS[2], 0.3)), C.red);

      // dun dun DUN words
      if (t >= DUNS[0] && t < CHIRP2 + 0.8) {
        const out = 1 - prog(t, CHIRP2 + 0.5, 0.3);
        const words = [['i am', 330, C.white], ['the', 560, C.white], ['BIRDS??', 830, C.red]];
        words.forEach(([w, x, col], i) => {
          const pp = ease.outBack(prog(t, DUNS[i], 0.2)) * out;
          P.title(ctx, w, i === 2 ? 540 : x, i === 2 ? 470 : 350, { size: i === 2 ? 150 : 96, color: col, stroke: i === 2 ? C.white : C.ink, pop: pp, rot: i === 2 ? -0.05 : 0.02 * (i ? 1 : -1) });
        });
      }
      // chirps
      if (t >= CHIRP && t < RESET) P.bubble(ctx, '*chirp*', 290, 800, 470, 1080, { size: 64, pop: ease.outBack(prog(t, CHIRP, 0.2)), seed: 12 });
      if (t >= CHIRP2 && t < RESET) P.bubble(ctx, '*tweet tweet*', 720, 690, 600, 960, { size: 54, pop: ease.outBack(prog(t, CHIRP2, 0.2)), seed: 13 });
      // feather puffs on the chirp
      if (t >= CHIRP && t < CHIRP + 1.2) {
        const q = prog(t, CHIRP, 1.2);
        for (let k = 0; k < 5; k++) {
          ctx.save(); ctx.globalAlpha = 1 - q;
          ctx.translate(540 + Math.cos(k * 1.3) * (60 + q * 220), 1150 - q * 180 + Math.sin(k * 2.1) * 60);
          ctx.rotate(Math.sin(t * 4 + k) * 0.8);
          P.circle(ctx, 0, 0, 22, k % 2 ? '#C4C9D0' : '#fff', { ry: 8, seed: 90 + k, shadow: false });
          ctx.restore();
        }
      }

      // caption stickers
      let st = null, pop = 1;
      if (t < 2.8) { st = "they don't want you to know this"; pop = 1 - prog(t, 2.65, 0.15); }
      else if (t < 5.6) { st = "it's all connected. ALL of it"; pop = ease.outBack(prog(t, 2.8, 0.3)) * (1 - prog(t, 5.45, 0.15)); }
      else if (t < REALIZE) { st = 'wait. wait wait wait'; pop = ease.outBack(prog(t, 5.6, 0.25)) * (1 - prog(t, REALIZE - 0.12, 0.12)); }
      else if (t >= CHIRP && t < RESET) { st = 'why am i chirping'; pop = ease.outBack(prog(t, CHIRP + 0.1, 0.3)) * (1 - prog(t, RESET - 0.12, 0.12)); }
      else if (t >= RESET) { st = "they don't want you to know this"; pop = ease.outBack(prog(t, RESET + 0.1, 0.35)); }
      if (st && pop > 0) P.sticker(ctx, st, 70, 1520, { pop: clamp(pop, 0, 2) });
    },
  });
})();
