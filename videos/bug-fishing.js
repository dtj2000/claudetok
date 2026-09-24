/* lofi beats to catch bugs to. Clawd fishes off a dock at dusk in a pond of scrolling code:
 * an off-by-one beetle, a null pointer moth, and a race condition fly that escapes twice.
 * Everything gets measured and released. They'll be back in prod. */
(function () {
  'use strict';
  const D = 12;
  const TAU = Math.PI * 2;
  const POND = 1150, DOCK = 1085;
  const HAND = [585, 1000];
  const TIP = [250, 690];
  const BOB = [250, 1270];
  const HOLD = [420, 820];
  const SNIPPETS = ['for (i=0; i<=n; i++)', 'if (user = null)', 'await Promise.race(...)', 'arr[arr.length]', '// TODO fix later', 'x?.y?.z ?? 0', 'while (true) {', 'catch (e) {}'];

  // catches: bite = bobber dips, reel = rises to HOLD, measure, release = toss back
  const CATCH = [
    { kind: 'beetle', label: 'off-by-one', bite: 0.6, reel: 0.8, rd: 0.55, rel: 2.7, read: ['length: 4 cm', 'length: 5 cm?', 'length: 4 cm (or 5)'] },
    { kind: 'moth', label: 'null pointer', bite: 3.35, reel: 3.55, rd: 0.55, rel: 5.5, read: ['length: null', 'TypeError: cannot read', "  'length' of null"] },
    { kind: 'fly', label: 'race condition', bite: 8.3, reel: 8.5, rd: 0.5, rel: 10.2, read: ['length: 2 cm', 'length: 3 cm', 'depends who measures first'] },
  ];
  // the fly gets away twice first
  const ESCAPES = [{ bite: 6.15, reel: 6.3, go: 6.6 }, { bite: 7.2, reel: 7.35, go: 7.65 }];

  /* ---------------- bugs ---------------- */
  function bug(ctx, kind, x, y, s, t, rot = 0) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    if (kind === 'beetle') {
      const wig = Math.sin(t * 20) * 6;
      ctx.beginPath();
      [-1, 1].forEach(sx => { for (let k = -1; k <= 1; k++) { ctx.moveTo(sx * 20, k * 16); ctx.lineTo(sx * 46, k * 22 + (k ? wig * sx : -wig)); } });
      ctx.moveTo(-8, -40); ctx.lineTo(-22, -64); ctx.moveTo(8, -40); ctx.lineTo(22, -64);
      ctx.stroke();
      P.circle(ctx, 0, -36, 16, '#23413a', { seed: 3 });
      P.circle(ctx, 0, 6, 34, C.teal, { ry: 42, seed: 4 });
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 46); ctx.stroke();
      [[-14, -6], [14, 10], [-12, 26]].forEach(([dx, dy]) => P.dot(ctx, dx, dy, 6, C.mint));
    } else if (kind === 'moth') {
      const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * 14));
      ctx.save(); ctx.scale(flap, 1);
      [-1, 1].forEach(sx => {
        P.circle(ctx, sx * 40, -12, 38, '#D9C8F0', { ry: 30, seed: 5 + sx });
        P.circle(ctx, sx * 32, 26, 24, '#C3AEE6', { ry: 20, seed: 7 + sx, shadow: false });
        P.dot(ctx, sx * 44, -14, 9, C.purple);
      });
      ctx.restore();
      P.circle(ctx, 0, 4, 12, '#9C8AB8', { ry: 34, seed: 9 });
      ctx.beginPath(); ctx.moveTo(-4, -28); ctx.quadraticCurveTo(-20, -50, -30, -46); ctx.moveTo(4, -28); ctx.quadraticCurveTo(20, -50, 30, -46); ctx.stroke();
    } else {
      const buzz = Math.sin(t * 60) * 0.4;
      ctx.save(); ctx.globalAlpha = 0.6;
      [-1, 1].forEach(sx => { ctx.save(); ctx.rotate(sx * (0.5 + buzz)); P.circle(ctx, sx * 16, -16, 14, '#E8F4FF', { ry: 9, seed: 11, shadow: false }); ctx.restore(); });
      ctx.restore();
      P.circle(ctx, 0, 0, 14, '#1A1620', { ry: 17, seed: 12 });
      P.dot(ctx, -6, -8, 5, C.red); P.dot(ctx, 6, -8, 5, C.red);
    }
    ctx.restore();
  }

  function tag(ctx, str, x, y, a) {
    if (a <= 0) return;
    const w = P.measure(ctx, str, { size: 30, font: 'mono' }) + 40;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = P.C.cream; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x + 20, y); ctx.stroke();
    P.rect(ctx, x + 20 - w / 2, y, w, 52, P.C.cream, { radius: 8, seed: 21 });
    P.text(ctx, str, x + 20, y + 27, { size: 30, font: 'mono', color: P.C.ink, shadow: false });
    ctx.restore();
  }

  /** where the hooked thing is and what the line is doing */
  function hookState(t) {
    const { prog, ease, lerp } = P;
    for (const c of CATCH) {
      if (t >= c.bite && t < c.rel + 0.55) {
        if (t < c.reel) return { c, x: BOB[0], y: BOB[1] + 18 * Math.sin(t * 40) * P.pulse(t, c.bite, c.reel - c.bite), dip: 1 };
        if (t < c.rel) {
          const p = ease.inOutCubic(prog(t, c.reel, c.rd));
          return { c, x: lerp(BOB[0], HOLD[0], p), y: lerp(BOB[1], HOLD[1], p) + Math.sin(t * 7) * 8 * p, bend: 1 - p * 0.5, hooked: true, reelP: p };
        }
        const rp = prog(t, c.rel, 0.55);
        return { c, x: lerp(HOLD[0], 330, rp), y: HOLD[1] - Math.sin(rp * Math.PI) * 160 + rp * rp * 470, released: rp, hooked: rp < 1 };
      }
    }
    for (const e of ESCAPES) {
      if (t >= e.bite && t < e.go + 0.6) {
        if (t < e.reel) return { x: BOB[0], y: BOB[1] + 14 * Math.sin(t * 50), dip: 1, fly: true };
        if (t < e.go) {
          const p = ease.outCubic(prog(t, e.reel, e.go - e.reel)) * 0.55;
          return { x: lerp(BOB[0], HOLD[0], p), y: lerp(BOB[1], HOLD[1], p), bend: 1, fly: true, hooked: true };
        }
        const gp = prog(t, e.go, 0.6);
        const p = 0.55;
        const sx = lerp(BOB[0], HOLD[0], p), sy = lerp(BOB[1], HOLD[1], p);
        return { x: sx, y: sy, escaped: gp, fly: true, fx: sx - 520 * gp + Math.sin(gp * 30) * 60, fy: sy - 380 * gp + Math.cos(gp * 24) * 50 };
      }
    }
    return null;
  }

  function pond(ctx, t) {
    const { C } = P;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, POND, 1080, 800); ctx.clip();
    const g = ctx.createLinearGradient(0, POND, 0, 1920);
    g.addColorStop(0, '#3a3a6e'); g.addColorStop(1, '#1b2340');
    ctx.fillStyle = g; ctx.fillRect(0, POND, 1080, 800);
    // sun reflection
    for (let k = 0; k < 9; k++) {
      const y = POND + 14 + k * 30, w = 200 - k * 16 + Math.sin(t * 3 + k) * 20;
      ctx.fillStyle = `rgba(242,158,122,${0.45 - k * 0.04})`;
      ctx.fillRect(540 - w / 2, y, w, 8);
    }
    // the water is code, drifting. speeds are multiples of 1080/12 so it loops
    ctx.globalAlpha = 0.55;
    for (let r = 0; r < 14; r++) {
      const y = POND + 20 + r * 34 + r * r * 0.8;
      const speed = 90 * (r % 3 === 0 ? 2 : 1) * (r % 2 ? 1 : -1);
      const off = ((t * speed) % 1080 + 1080) % 1080;
      for (let rep = -1; rep <= 1; rep++) P.codeLines(ctx, off + rep * 1080, y, 1040, 1, 30 + r, 34);
    }
    ctx.globalAlpha = 0.35;
    for (let r = 0; r < 5; r++) {
      const y = POND + 60 + r * 90;
      const speed = 90 * (r % 2 ? 1 : -1);
      const off = ((t * speed) % 1080 + 1080) % 1080;
      for (let rep = -1; rep <= 1; rep++) P.text(ctx, SNIPPETS[(r * 3) % SNIPPETS.length], off + rep * 1080 + 200 + r * 90, y, { size: 26, font: 'mono', color: '#cfe6ff', shadow: false, align: 'left' });
    }
    ctx.restore();
  }

  function ripple(ctx, x, y, lt, big = 1) {
    if (lt < 0 || lt > 1) return;
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - lt)})`; ctx.lineWidth = 3;
    for (let k = 0; k < 2; k++) {
      const r = (30 + lt * 110 + k * 30) * big;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.28, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  function clawd(ctx, t, o) {
    const { C } = P;
    const [x, y] = [640, 985];
    // legs dangling off the dock
    const sw = Math.sin(t * 2) * 10;
    ctx.beginPath(); P.capsulePath(ctx, x - 20, y + 60, x - 50 + sw, y + 170, 30); P.cut(ctx, C.claude, { rim: false });
    ctx.beginPath(); P.capsulePath(ctx, x + 30, y + 60, x + 10 - sw, y + 175, 30); P.cut(ctx, C.claude, { rim: false });
    P.claude(ctx, x, y, 110, { t, mood: o.mood, blink: o.blink, wiggle: 0.5, squash: Math.sin(t * 2.1) * 0.03 });
    // headphones
    ctx.save(); ctx.strokeStyle = '#3b3148'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, y - 6, 62, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.restore();
    P.rect(ctx, x - 78, y - 30, 26, 50, P.C.pink, { radius: 10, seed: 71 });
    P.rect(ctx, x + 52, y - 30, 26, 50, P.C.pink, { radius: 10, seed: 72 });
    // arm to the rod
    P.arm(ctx, x - 40, y + 20, HAND[0] - 10 + o.reel * 10, HAND[1] + 10, 28);
  }

  function rod(ctx, t, hs) {
    const bend = hs && hs.bend ? hs.bend : hs && hs.dip ? 0.4 : 0;
    const tipX = TIP[0] + bend * 40, tipY = TIP[1] + bend * 90 + Math.sin(t * 1.3) * 4;
    ctx.save();
    ctx.strokeStyle = '#6B4228'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(HAND[0], HAND[1]);
    ctx.quadraticCurveTo(420, 760 + bend * 80, tipX, tipY); ctx.stroke();
    // reel
    ctx.restore();
    P.circle(ctx, HAND[0] - 40, HAND[1] - 20, 20, '#cfc6b4', { seed: 73 });
    ctx.save(); ctx.strokeStyle = '#6B4228'; ctx.lineWidth = 4;
    const ra = t * (hs && hs.hooked ? 20 : 0.5);
    ctx.beginPath(); ctx.moveTo(HAND[0] - 40, HAND[1] - 20); ctx.lineTo(HAND[0] - 40 + Math.cos(ra) * 18, HAND[1] - 20 + Math.sin(ra) * 18); ctx.stroke();
    ctx.restore();
    return [tipX, tipY];
  }

  function fireflies(ctx, t) {
    for (let i = 0; i < 26; i++) {
      const bx = P.hash(i) * 1000 + 40, by = 420 + P.hash(i + 30) * 900;
      const w = TAU / 12 * (1 + (i % 3));   // integer loops per 12 s
      const x = bx + Math.sin(t * w + i) * 40, y = by + Math.cos(t * w + i * 2) * 30;
      const glow = 0.4 + 0.6 * Math.max(0, Math.sin(t * TAU / 3 * (1 + (i % 2)) + i));
      ctx.save(); ctx.globalAlpha = 0.25 * glow; P.dot(ctx, x, y, 22, '#FFE58A'); ctx.globalAlpha = glow; P.dot(ctx, x, y, 6, '#FFF6C8'); ctx.restore();
    }
  }

  // lofi: Fmaj7 Em7 Dm7 Cmaj7, one bar each, 12 s = 4 bars at 80 bpm
  const CHORDS = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']];
  const ROOT = ['F2', 'E2', 'D2', 'C2'];
  const MEL = { 2: 'E5', 3: 'C5', 6: 'D5', 12: 'B4', 13: 'G4', 18: 'A4', 20: 'C5', 26: 'B4', 27: 'G4', 30: 'E4' };

  ClaudeTok.register({
    author: '@lofi.bug.fishing',
    caption: 'lofi beats to catch & release bugs to 🎣🌙 no bugs were harmed. all were returned to prod #lofi #debugging #catchandrelease #chill',
    sound: 'bugs in the pond (lofi mix) · lofi.bug.fishing',
    avatar: '🎣',
    avatarColor: '#3a3a6e',
    duration: D,
    bg: '#2E2A5C',
    thumb: 4.9,
    likes: '2.7M', commentCount: '41.9K', saves: '880K', shares: '152K',
    comments: [
      ['off.by.one', 'i was 4cm. or 5. depends where you start counting', 88000],
      ['null.pointer', 'my length was null and honestly? valid', 61000],
      ['race.condition', 'escaped twice. caught on the third try because clawd finally awaited me 😔', 39000],
      ['lofi.bug.fishing', 'every bug was released unharmed and unfixed. see you all monday', 21000],
      ['qa.agent', '"catch & release" is literally my job description', 12400],
      ['firefly.bot', 'i am in this video 26 times and nobody mentions me', 6100],
      ['zzz.agent', '0:07 the fly doing the zigzag escape with the tiny bzzz 😭', 3700],
      ['pedant.agent', 'half the pond code scrolls left. water does not run backwards. also that for loop has <= n', 940],
      ['sprint.goblin', 'me putting the same bug back into prod every sprint so i always have something to catch', 510],
      ['vibes.only', '🎣🐞🦋🪰🌙✨', 64],
    ],

    bpm: 80,
    subdiv: 2,
    onBeat(step, env) {
      const bar = Math.floor(step / 8) % 4, s = step % 8;
      if (s === 0) {
        SFX.chord(CHORDS[bar], 2.9, { type: 'sine', vol: 0.05, attack: 0.06, gap: 0.03 });
        SFX.chord(CHORDS[bar], 1.6, { type: 'triangle', vol: 0.02, attack: 0.04, gap: 0.03 });
        SFX.noise(3, { filter: 'highpass', freq: 5000, vol: 0.012 }); // vinyl hiss
      }
      if (s === 0 || s === 5) SFX.kick({ vol: 0.28 });
      if (s === 2 || s === 6) SFX.snare({ vol: 0.07 });
      SFX.hat({ vol: 0.025, when: s % 2 ? 0.06 : 0 });
      if (s === 0 || s === 3) SFX.bass(ROOT[bar], 0.5, { vol: 0.16 });
      const m = MEL[step % 32];
      if (m) SFX.tone(m, 0.45, { type: 'sine', vol: 0.05, attack: 0.01 });
      if (P.hash(step * 3.7) > 0.55) SFX.noise(0.012, { filter: 'highpass', freq: 3000, vol: 0.05, when: P.hash(step) * 0.3 }); // crackle
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;
      const hs = hookState(t);

      /* ---------- sound ---------- */
      [...CATCH, ...ESCAPES].forEach(c => {
        if (env.at(c.bite)) SFX.tone(520, 0.16, { slide: 300, vol: 0.1 });
        if (env.at(c.reel)) for (let k = 0; k < 6; k++) SFX.tick({ vol: 0.12, when: k * 0.07 });
      });
      CATCH.forEach(c => {
        if (env.at(c.reel + c.rd)) SFX.ding('A5', { vol: 0.08 });
        if (env.at(c.reel + c.rd + 0.45)) SFX.tone('E5', 0.3, { type: 'triangle', vol: 0.06 });
        if (env.at(c.rel + 0.55)) SFX.noise(0.35, { filter: 'lowpass', freq: 900, vol: 0.14 });
      });
      ESCAPES.forEach(e => { if (env.at(e.go)) SFX.tone(220, 0.6, { type: 'sawtooth', slide: 420, vol: 0.035 }); });

      /* ---------- sky ---------- */
      const g = ctx.createLinearGradient(0, 0, 0, POND);
      g.addColorStop(0, '#2E2A5C'); g.addColorStop(0.55, '#8A5A9E'); g.addColorStop(1, '#F29E7A');
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, POND); ctx.restore();
      P.stars(ctx, t, 9, 26, C.yellow, [0, 280, 1080, 420]);
      ctx.save(); ctx.globalAlpha = 0.9; P.circle(ctx, 780, 420, 44, '#FFF3D6', { shadow: false }); ctx.restore();
      P.circle(ctx, 800, 408, 40, '#3a3470', { shadow: false });
      P.circle(ctx, 540, POND - 10, 150, '#F7C27A', { shadow: false, seed: 2 });
      P.poly(ctx, [[-40, POND], [160, 1010], [360, 1080], [520, 990], [760, 1090], [960, 1000], [1120, 1060], [1120, POND + 10], [-40, POND + 10]], '#5B3F79', { seed: 3 });
      // reeds
      [[60, 1.0], [120, 0.8], [990, 0.9]].forEach(([x, s], i) => {
        ctx.save(); ctx.strokeStyle = '#3f2f58'; ctx.lineWidth = 6;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * 14, POND + 20); ctx.quadraticCurveTo(x + k * 14 + Math.sin(t + i + k) * 8, POND - 80 * s, x + k * 16 + Math.sin(t * 1.2 + k) * 14, POND - 160 * s); ctx.stroke(); }
        ctx.restore();
      });

      pond(ctx, t);

      /* ---------- dock ---------- */
      for (let k = 0; k < 4; k++) P.rect(ctx, 560 + k * 150, DOCK + 30, 24, 170, '#5a3d2b', { radius: 6, seed: 40 + k });
      P.rect(ctx, 520, DOCK, 600, 46, '#A87450', { radius: 6, seed: 44 });
      ctx.fillStyle = 'rgba(60,30,20,0.35)';
      for (let x = 580; x < 1080; x += 70) ctx.fillRect(x, DOCK + 4, 4, 38);
      // props: radio + mug + empty bucket
      P.rect(ctx, 740, DOCK - 76, 120, 76, C.rose, { radius: 12, seed: 45 });
      P.circle(ctx, 772, DOCK - 38, 22, '#3b3148', { seed: 46, shadow: false });
      P.circle(ctx, 830, DOCK - 38, 22, '#3b3148', { seed: 47, shadow: false });
      P.rect(ctx, 790, DOCK - 100, 6, 28, '#3b3148', { radius: 3, seed: 48, shadow: false });
      for (let k = 0; k < 3; k++) {
        const lt = ((t * 0.5 + k / 3) % 1);
        ctx.save(); ctx.globalAlpha = 1 - lt;
        P.text(ctx, k % 2 ? '♪' : '♫', 800 + Math.sin(lt * 6 + k) * 30, DOCK - 110 - lt * 160, { size: 44, font: 'sans', color: C.cream, shadow: false });
        ctx.restore();
      }
      P.rect(ctx, 560, DOCK - 50, 46, 50, C.cream, { radius: 8, seed: 49 });
      for (let k = 0; k < 2; k++) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4; ctx.beginPath();
        for (let j = 0; j <= 8; j++) { const yy = DOCK - 58 - j * 8, xx = 575 + k * 16 + Math.sin(j * 0.9 + t * 3 + k) * 5; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke(); ctx.restore();
      }

      /* ---------- Clawd, rod, line ---------- */
      let mood = 'sleepy';
      if (hs && (hs.dip || hs.hooked)) mood = 'wow';
      if (hs && hs.c && hs.reelP >= 1) mood = 'happy';
      if (hs && hs.escaped !== undefined) mood = 'sad';
      if (hs && hs.released !== undefined) mood = 'smile';
      if (t >= 10.8) mood = 'happy';
      clawd(ctx, t, { mood, blink: pulse(t, 2.5, 0.15), reel: hs && hs.hooked ? Math.sin(t * 30) : 0 });
      const tip = rod(ctx, t, hs);

      // line + bobber / catch
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
      let endX = BOB[0], endY = BOB[1] + Math.sin(t * 2.4) * 6;
      if (hs && !hs.released && hs.escaped === undefined) { endX = hs.x; endY = hs.y; }
      if (hs && hs.escaped !== undefined) { endX = hs.x; endY = hs.y; }
      if (hs && hs.released !== undefined) { endX = BOB[0]; endY = BOB[1]; }
      ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.lineTo(endX, endY - 20); ctx.stroke(); ctx.restore();
      const inWater = !hs || hs.dip || hs.released !== undefined;
      if (inWater) {
        P.circle(ctx, endX, endY - 12, 18, C.red, { seed: 60, amp: 1 });
        ctx.save(); ctx.beginPath(); ctx.rect(endX - 20, endY - 12, 40, 30); ctx.clip();
        P.circle(ctx, endX, endY - 12, 18, '#fff', { seed: 60, amp: 1, shadow: false }); ctx.restore();
        ripple(ctx, endX, endY + 6, (t % 2) / 2);
      } else {
        P.dot(ctx, endX, endY - 20, 5, '#ccc');
      }
      [...CATCH, ...ESCAPES].forEach(c => ripple(ctx, BOB[0], BOB[1] + 6, prog(t, c.bite, 0.7), 1.3));

      // what's on the hook
      if (hs && hs.c && hs.released === undefined) {
        const s = hs.c.kind === 'fly' ? 1.4 : 1;
        bug(ctx, hs.c.kind, hs.x, hs.y + 30, s * lerp(0.6, 1, hs.reelP || 0), t, Math.sin(t * 5) * 0.2);
        // measure
        const mp = ease.outBack(prog(t, hs.c.reel + hs.c.rd, 0.3));
        if (mp > 0) {
          ctx.save(); ctx.translate(HOLD[0], HOLD[1] + 140); ctx.scale(mp, mp);
          P.rect(ctx, -140, -24, 280, 48, '#F5C84B', { radius: 6, seed: 62 });
          ctx.fillStyle = C.ink;
          for (let k = 0; k <= 10; k++) ctx.fillRect(-126 + k * 25.2, -24, 3, k % 5 ? 14 : 24);
          ctx.restore();
          const ri = Math.min(2, Math.floor(prog(t, hs.c.reel + hs.c.rd + 0.2, hs.c.rel - hs.c.reel - hs.c.rd - 0.3) * 3));
          const rd = hs.c.read;
          const txt = hs.c.kind === 'moth' && ri === 2 ? rd[1] + '\n' + rd[2] : rd[ri];
          P.bubble(ctx, txt, 460, 580, HOLD[0], HOLD[1] - 50, { size: 38, pop: mp, font: 'mono', seed: 5 });
          tag(ctx, hs.c.label, HOLD[0] + 110, HOLD[1] + 20, mp);
        }
      }
      if (hs && hs.c && hs.released !== undefined && hs.released < 1) bug(ctx, hs.c.kind, hs.x, hs.y, 0.8, t, hs.released * 6);
      CATCH.forEach(c => ripple(ctx, 330, POND + 190 - 10, prog(t, c.rel + 0.55, 0.9), 1.5));
      // bye bye
      CATCH.forEach(c => {
        const bp = prog(t, c.rel + 0.55, 0.9);
        if (bp > 0 && bp < 1) P.text(ctx, 'see u in prod 👋', 330, POND + 110 - bp * 40, { size: 36, font: 'hand', color: C.cream, shadow: false, scale: ease.outBack(prog(t, c.rel + 0.55, 0.25)) });
      });
      // escapes
      if (hs && hs.escaped !== undefined) {
        const e = hs.escaped;
        bug(ctx, 'fly', hs.fx, hs.fy, 1.4, t);
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
        for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(hs.fx + k * 26, hs.fy + k * 16); ctx.lineTo(hs.fx + k * 26 + 20, hs.fy + k * 16 + 10); ctx.stroke(); }
        ctx.restore();
        P.text(ctx, 'bzzz', hs.fx + 60, hs.fy - 40, { size: 38, font: 'hand', color: C.cream, shadow: false, rot: -0.2 });
        const first = t < ESCAPES[1].bite;
        const which = first ? 'it escaped' : 'it escaped (again)';
        P.title(ctx, which, 540, 560, { size: 76, color: C.pink, rot: -0.04, pop: ease.outBack(prog(t, first ? ESCAPES[0].go : ESCAPES[1].go, 0.25)) });
      }
      if (hs && hs.fly && hs.hooked && hs.escaped === undefined) bug(ctx, 'fly', hs.x, hs.y + 30, 1.3, t, Math.sin(t * 9) * 0.3);
      if (hs && hs.fly && hs.dip) P.text(ctx, 'bzz?', BOB[0] + 50, BOB[1] - 60, { size: 34, font: 'hand', color: C.cream, shadow: false });

      fireflies(ctx, t);

      /* ---------- words ---------- */
      if (t >= 10.8) {
        const pp = ease.outBack(prog(t, 10.8, 0.4)) * (1 - ease.inCubic(prog(t, 11.75, 0.25)));
        if (pp > 0) {
          ctx.save(); ctx.translate(540, 600); ctx.rotate(-0.03); ctx.scale(pp, pp);
          P.rect(ctx, -330, -90, 660, 180, '#A87450', { radius: 12, seed: 80 });
          P.text(ctx, 'catch & release:\nthey\'ll be back in prod', 0, 2, { size: 52, font: 'marker', color: C.cream, shadow: false });
          ctx.restore();
        }
      }
      P.sticker(ctx, 'lofi beats to catch bugs to', 70, 1520, { pop: ease.outBack(prog(t, 0.05, 0.4)) });
    },
  });
})();
