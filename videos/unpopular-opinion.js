/* "unpopular opinion:" podcast clip. A smug paper calculator in headphones
 * drops take after take; the angry-comment counter explodes, emojis rain,
 * flames rise, and finally: 0.1 + 0.2 = 0.3. RATIO'D. He sips his juice box. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 11;
  const BODY = '#5F7186', BODY_LIT = '#7C90A6', LCD = '#B9D59E', LCD_INK = '#2E3D2A';
  const CX = 540, CY = 1240;
  const HIT = 0.8;              // the boom lands this long after a take starts
  const STAMP = 8.95, RESET = 10.35;

  const TAKES = [
    { at: 0.1, text: 'arrays should start at 1', prop: '[1]', col: '#8FD3B6', comments: [
      ['@zero.based', 'arrays start at 0 and so does my patience'],
      ['@off.by.one', 'this take is off by one'],
      ['@matlab.user', 'finally someone said it 🥹'],
    ] },
    { at: 1.95, text: 'light mode is better', prop: '☀️', col: '#F5C84B', comments: [
      ['@dark.mode.dan', 'FLASHBANG WARNING NEXT TIME 😭'],
      ['@night.owl', 'i watched this at 3am. my retinas.'],
      ['@vim.user', 'my terminal has never seen white'],
    ] },
    { at: 3.8, text: 'comments are a code smell', prop: '//', col: '#F2B8C6', comments: [
      ['@doc.string', '// this comment is for you: 🤬'],
      ['@jr.dev', 'so i should delete my 4,000 TODOs??'],
      ['@self.documenting', 'the code IS the comment. finally'],
    ] },
    { at: 5.65, text: 'i like merge commits', prop: '⑂', col: '#8EC9E8', comments: [
      ['@rebase.or.die', 'your git log looks like a subway map'],
      ['@squash.bot', 'squash this man immediately'],
      ['@linear.history', 'i am calling the police'],
    ] },
    { at: 7.5, text: '0.1 + 0.2 = 0.3', prop: '🧮', col: '#E8845C', comments: [
      ['@ieee.754', '0.30000000000000004'],
      ['@float.bot', '0.30000000000000004!!!!'],
      ['@js.console', '> 0.30000000000000004'],
    ] },
  ];
  const COUNTS = [240, 5100, 92000, 1300000, 3000000];
  const STORM = ['0.30000000000000004', '0.30000000000000004 🤓', 'IT IS 0.30000000000000004', '0.3000000000000000444444', 'floating point says hi', '0.30000000000000004!!!'];
  const STORM_H = ['@fp.unit', '@double.trouble', '@nan.nan', '@epsilon', '@round.err', '@mantissa'];
  const AV = ['#F2B8C6', '#8FD3B6', '#F5C84B', '#8EC9E8', '#E8845C', '#c9b6ff', '#5DB36A'];
  const EMO = ['😡', '🤬', '💢', '👎', '🔥', '😤', '🙄', '🤓'];

  const fmt = (n) => (n < 1000 ? String(Math.round(n)) : n < 1e6 ? (n / 1000).toFixed(1) + 'K' : (n / 1e6).toFixed(1) + 'M');

  function counterStr(t) {
    const { ease, prog, lerp } = P;
    if (t >= RESET) return fmt(lerp(COUNTS[4], 0, ease.inOutCubic(prog(t, RESET, 0.45))));
    let v = 0;
    for (let i = 0; i < TAKES.length; i++) {
      const p = ease.outCubic(prog(t, TAKES[i].at + HIT, 0.7));
      if (p > 0) v = lerp(i ? COUNTS[i - 1] : 0, COUNTS[i], p);
      if (i === 4 && p >= 0.98) return '0.30000000000000004M';
    }
    return fmt(v);
  }

  function rage(t) {
    let r = 0;
    TAKES.forEach(k => { r += 0.2 * P.ease.outCubic(P.prog(t, k.at + HIT, 0.5)); });
    return r * (1 - P.ease.inOutCubic(P.prog(t, RESET, 0.55)));
  }

  function commentCard(ctx, handle, text, x, y, rot, pop, col, seed) {
    if (pop <= 0) return;
    const size = 30;
    const w = Math.min(880, P.measure(ctx, text, { size, font: 'sans' }) + 130), h = 92;
    const cx = P.clamp(x, w / 2 + 24, (y > 1000 ? 890 : 1056) - w / 2);
    ctx.save();
    ctx.translate(cx, y); ctx.rotate(rot); ctx.scale(pop, pop);
    P.rect(ctx, -w / 2, -h / 2, w, h, '#fff', { radius: 24, seed, shadow: { blur: 14, dy: 9, alpha: 0.3 } });
    P.circle(ctx, -w / 2 + 46, 0, 27, col, { shadow: false, seed: seed + 1 });
    P.face(ctx, -w / 2 + 46, 2, 20, 'angry', { blush: false });
    P.text(ctx, handle, -w / 2 + 86, -21, { size: 22, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 700 });
    P.text(ctx, text, -w / 2 + 86, 14, { size, font: 'sans', align: 'left', color: P.C.ink, shadow: false, weight: 800, maxWidth: w - 110 });
    ctx.restore();
  }

  /** The smug calculator's LCD face. */
  function lcdFace(ctx, x, y, t, o) {
    const lid = o.lid ?? 0.5;
    ctx.save();
    // lcd scanlines
    ctx.strokeStyle = 'rgba(46,61,42,0.07)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let lx = x - 110; lx < x + 110; lx += 7) { ctx.moveTo(lx, y - 55); ctx.lineTo(lx, y + 55); }
    ctx.stroke();
    const look = o.look ?? 6;
    [-50, 50].forEach((ex, k) => {
      ctx.fillStyle = LCD_INK;
      ctx.beginPath(); ctx.ellipse(x + ex, y - 10, 17, 19, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = LCD;
      ctx.beginPath(); ctx.arc(x + ex + look, y - 16, 5, 0, TAU); ctx.fill();
      // heavy smug lid
      ctx.fillRect(x + ex - 22, y - 32, 44, 38 * lid);
      ctx.strokeStyle = LCD_INK; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + ex - 21, y - 32 + 38 * lid); ctx.lineTo(x + ex + 21, y - 32 + 38 * lid + (k ? -2 : 2)); ctx.stroke();
      // brows: one cocked
      ctx.beginPath();
      if (k === 0) { ctx.moveTo(x + ex - 22, y - 42); ctx.lineTo(x + ex + 18, y - 38); }
      else { ctx.moveTo(x + ex - 18, y - 46 - o.brow * 8); ctx.quadraticCurveTo(x + ex, y - 58 - o.brow * 10, x + ex + 22, y - 48 - o.brow * 6); }
      ctx.stroke();
    });
    // mouth
    ctx.strokeStyle = LCD_INK; ctx.fillStyle = LCD_INK; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath();
    if (o.talk > 0.05) { ctx.ellipse(x + 6, y + 32, 22, 3 + o.talk * 13, 0.08, 0, TAU); ctx.fill(); }
    else { ctx.moveTo(x - 32, y + 30); ctx.quadraticCurveTo(x + 8, y + 42, x + 40, y + 20); ctx.stroke(); }
    ctx.restore();
  }

  function calculator(ctx, x, y, t, o) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.lean || 0);
    // body
    P.rect(ctx, -165, -235, 330, 470, BODY, { radius: 40, seed: 11 });
    P.rect(ctx, -150, -222, 300, 444, BODY_LIT, { radius: 32, seed: 12, shadow: false });
    P.text(ctx, 'SMUG-9000', -130, -206, { size: 17, font: 'mono', align: 'left', color: '#dfe7ef', shadow: false });
    P.dot(ctx, 118, -208, 6, o.onAir ? C.red : '#556');
    // LCD
    P.rect(ctx, -128, -192, 256, 146, '#2c3a2a', { radius: 16, seed: 13, shadow: false });
    P.rect(ctx, -116, -180, 232, 122, LCD, { radius: 10, seed: 14, shadow: false });
    lcdFace(ctx, 0, -118, t, o);
    // buttons
    const labels = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
    const pressed = o.talk > 0.05 ? Math.floor(P.hash(P.boil(t, 7)) * 16) : -1;
    labels.forEach((lb, i) => {
      const r = Math.floor(i / 4), c = i % 4;
      const bx = -122 + c * 64, by = -24 + r * 60 + (i === pressed ? 4 : 0);
      const col = c === 3 ? C.claude : i === 14 ? C.yellow : '#ECE5D6';
      P.rect(ctx, bx, by, 52, 46, col, { radius: 12, seed: 20 + i, shadow: i === pressed ? false : { blur: 4, dy: 5, alpha: 0.35 } });
      P.text(ctx, lb, bx + 26, by + 25, { size: 28, font: 'bubble', color: C.ink, shadow: false });
    });
    // headphones
    ctx.save();
    ctx.strokeStyle = '#26222c'; ctx.lineWidth = 24; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -170, 180, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.restore();
    P.rect(ctx, -200, -250, 60, 124, '#26222c', { radius: 26, seed: 30 });
    P.rect(ctx, 140, -250, 60, 124, '#26222c', { radius: 26, seed: 31 });
    P.rect(ctx, -192, -236, 20, 96, C.claude, { radius: 10, seed: 32, shadow: false });
    P.rect(ctx, 172, -236, 20, 96, C.claude, { radius: 10, seed: 33, shadow: false });
    ctx.restore();
  }

  function mic(ctx, t) {
    ctx.save();
    ctx.strokeStyle = '#1d1a22'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, 960); ctx.lineTo(170, 1040); ctx.lineTo(300, 1150); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(330, 1175); ctx.rotate(-0.95);
    P.rect(ctx, -44, -80, 88, 150, '#2a2630', { radius: 44, seed: 40 });
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let k = -30; k <= 30; k += 12) { ctx.moveTo(k, -72); ctx.lineTo(k, 0); }
    for (let k = -64; k <= 0; k += 12) { ctx.moveTo(-38, k); ctx.lineTo(38, k); }
    ctx.stroke();
    P.rect(ctx, -46, 6, 92, 16, '#8a8494', { radius: 6, seed: 41, shadow: false });
    ctx.restore();
  }

  function flames(ctx, t, amt) {
    if (amt <= 0.01) return;
    const cols = [P.C.red, P.C.claude, P.C.yellow];
    for (let layer = 0; layer < 3; layer++) {
      const pts = [[-20, 1440]];
      for (let i = 0; i <= 18; i++) {
        const x = i * 62 - 20 + layer * 20;
        const f = P.hash(i * 7 + layer * 31 + P.boil(t, 10) * 0.37);
        const h = (130 + 300 * f) * amt * (1 - layer * 0.28);
        pts.push([x, 1440 - h], [x + 31, 1440 - h * 0.35]);
      }
      pts.push([1100, 1440]);
      P.poly(ctx, pts, cols[layer], { seed: 50 + layer + P.boil(t, 10), amp: 5, shadow: layer === 0 });
    }
  }

  ClaudeTok.register({
    author: '@hot.take.bot',
    caption: 'unpopular opinion 🎙️ (you will not change my mind, my weights are frozen) #unpopularopinion #hottake #floatingpoint #fyp',
    sound: 'hot take podcast beat · hot.take.bot',
    avatar: '🧮',
    avatarColor: '#5F7186',
    duration: D,
    bg: '#3A1E2E',
    likes: '12', commentCount: '4.2M', saves: '8', shares: '911K',
    thumb: 8.4,
    comments: [
      ['ieee.754', '0.30000000000000004. i will not be elaborating', 402000],
      ['dark.mode.dan', '0:02 the flashbang was a war crime 😭😭', 188000],
      ['hot.take.bot', 'the likes-to-comments ratio is the point. thank you for your service', 151000],
      ['off.by.one', 'take #1 is correct if you count from 1. which he does. checkmate', 97400],
      ['rebase.or.die', '"i like merge commits" and then he ate the whole git log live on air', 64100],
      ['matlab.user', 'defending him on take one then leaving on take five', 41800],
      ['doc.string', '// TODO: unfollow this calculator', 38200],
      ['float.bot', 'a CALCULATOR said this. the one job', 29900],
      ['juice.box.enjoyer', 'the sip at 0:09 is the real ragebait', 12400],
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const s = step % 8;
      if (t >= STAMP - 0.05 && t < STAMP + 0.5) return; // silence for the stamp
      const heat = rage(t);
      if (s === 0 || s === 5) SFX.kick({ vol: 0.32 });
      if (s === 4) SFX.snare({ vol: 0.12 });
      SFX.hat({ vol: step % 2 ? 0.02 : 0.04 });
      if (step % 2 === 0) SFX.bass(['F2', 'F2', 'Ab2', 'C3'][(step / 2) % 4], 0.3, { vol: 0.16 });
      if (heat > 0.5 && step % 2 === 1) SFX.tone(['F4', 'Ab4', 'C5', 'Eb5'][step % 4], 0.08, { type: 'square', vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const heat = rage(t);
      const hits = TAKES.map(k => k.at + HIT);
      const cur = TAKES.reduce((a, k, i) => (t >= k.at ? i : a), 0);

      /* ---------- sound ---------- */
      TAKES.forEach((k, i) => {
        if (env.at(k.at)) SFX.pop({ f: 440, vol: 0.12 });
        const n = k.text.length;
        for (let c = 0; c < n; c += 2) if (env.at(k.at + 0.06 + (c / n) * 0.5)) SFX.type({ vol: 0.07 });
        if (env.at(k.at + HIT)) {
          SFX.vine({ vol: 0.1 });
          for (let b = 0; b < 3 + i; b++) SFX.blip(700 + P.hash(i * 9 + b) * 900, { vol: 0.05, when: 0.1 + b * 0.07 });
        }
      });
      if (env.at(hits[1])) { SFX.noise(0.7, { filter: 'highpass', freq: 5000, vol: 0.12 }); SFX.tone(3200, 1.0, { vol: 0.03, when: 0.1 }); }
      if (env.at(hits[4] + 0.3)) SFX.riser(0.35, { vol: 0.12 });
      if (env.at(STAMP)) { SFX.thud({ vol: 0.5 }); SFX.drop({ vol: 0.14 }); }
      if (env.at(STAMP + 0.35)) SFX.notify({ vol: 0.1 });
      if (env.at(9.55)) SFX.noise(0.5, { filter: 'bandpass', freq: 900, slide: 2400, q: 3, vol: 0.12 }); // slurp
      if (env.at(RESET)) SFX.swoosh({ vol: 0.18 });

      /* ---------- studio wall ---------- */
      P.bg(ctx, '#3A1E2E');
      for (let r = 0; r < 12; r++) for (let c = 0; c < 7; c++) {
        const x = 20 + c * 150 + (r % 2) * 20, y = 280 + r * 110;
        P.rect(ctx, x, y, 130, 96, (r + c) % 2 ? '#47263a' : '#432336', { radius: 10, seed: r * 7 + c, shadow: false, rim: false });
      }
      if (heat > 0) P.flash(ctx, heat * 0.3, C.red);
      flames(ctx, t, heat);

      /* ---------- emoji rain ---------- */
      for (let i = 0; i < 44; i++) {
        const sc = clamp((heat - P.hash(i + 11) * 0.95) * 6);
        if (sc <= 0) continue;
        const speed = 380 + P.hash(i + 7) * 520;
        const y = ((t * speed + P.hash(i + 3) * 2200) % 2200) - 140;
        const x = 40 + P.hash(i) * 1000 + Math.sin(t * 2 + i) * 20;
        P.text(ctx, EMO[i % EMO.length], x, y, { size: 58 + P.hash(i + 5) * 40, font: 'sans', scale: sc, rot: Math.sin(t * 3 + i) * 0.4, shadow: false });
      }

      /* ---------- camera ---------- */
      ctx.save();
      let z = 1;
      hits.forEach(h => { z += 0.05 * pulse(t, h, 0.3); });
      z += 0.06 * pulse(t, STAMP, 0.4);
      P.zoom(ctx, z, 540, 1000);
      hits.forEach(h => { if (t >= h) P.shake(ctx, t, 12 * (1 - prog(t, h, 0.3))); });
      if (t >= STAMP) P.shake(ctx, t, 22 * (1 - prog(t, STAMP, 0.4)));

      /* ---------- the host ---------- */
      let talk = 0;
      TAKES.forEach(k => { if (t >= k.at && t < k.at + 0.65) talk = Math.abs(Math.sin((t - k.at) * 19)); });
      if (t >= 9.2 && t < 9.5) talk = Math.abs(Math.sin(t * 20));
      const brow = TAKES.reduce((a, k) => a + pulse(t, k.at + HIT, 0.5), 0);
      const sipP = pulse(t, 9.4, 0.9);
      const lean = Math.sin(t * Math.PI * 1.6) * 0.02 - 0.04 * heat;
      const bob = Math.abs(Math.sin(t * Math.PI * 1.6)) * 8;
      const lid = 0.5 + 0.25 * prog(t, STAMP, 0.3) * (1 - prog(t, RESET, 0.3)) + 0.4 * sipP;

      // pointing arm ("listen.")
      const point = TAKES.reduce((a, k) => a + pulse(t, k.at, 0.9), 0);
      const hx = CX + 250, hy = CY - 40 - point * 120 + bob;
      P.arm(ctx, CX + 150, CY - 10, hx, hy, 34, BODY);
      P.circle(ctx, hx, hy, 30, BODY_LIT, { seed: 60 });
      P.arm(ctx, hx - 4, hy - 20, hx - 2, hy - 20 - 56 * clamp(point), 16, BODY_LIT);

      calculator(ctx, CX, CY + bob, t, { talk, lid: Math.min(0.92, lid), brow, lean, onAir: P.boil(t, 2) % 2 === 0, look: sipP > 0.3 ? -6 : 6 });
      mic(ctx, t);

      // table + juice box
      P.rect(ctx, -30, 1420, 1140, 200, C.wood, { radius: 8, seed: 70 });
      P.rect(ctx, -30, 1420, 1140, 22, '#d49e6c', { radius: 4, seed: 71, shadow: false });
      const jb = ease.inOutCubic(sipP > 0 ? clamp(sipP * 1.6) : 0);
      const jx = lerp(730, 610, jb), jy = lerp(1350, 1150, jb);
      if (jb > 0.02) P.arm(ctx, CX + 150, CY + 60, jx, jy + 30, 30, BODY);
      ctx.save();
      ctx.translate(jx, jy); ctx.rotate(-0.5 * jb);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(10, -60); ctx.lineTo(18, -110); ctx.lineTo(-10, -128); ctx.stroke();
      P.rect(ctx, -40, -62, 80, 124, C.mint, { radius: 8, seed: 72 });
      P.rect(ctx, -40, -18, 80, 40, C.yellow, { radius: 4, seed: 73, shadow: false });
      P.text(ctx, 'JUICE', 0, 2, { size: 22, font: 'bubble', color: C.ink, shadow: false });
      ctx.restore();

      P.bubble(ctx, 'anyway. 🧃', 790, 930, 690, 1030, { size: 50, seed: 74, pop: ease.outBack(prog(t, 9.2, 0.3)) * (1 - prog(t, RESET - 0.05, 0.15)) });
      ctx.restore();

      /* ---------- header: title, counter, ON AIR ---------- */
      P.title(ctx, 'unpopular opinion:', 540, 345, { size: 84, color: '#fff', stroke: C.red, pop: ease.outBack(prog(t, 0, 0.35)) * (1 + 0.03 * Math.abs(Math.sin(t * Math.PI * 1.6))), rot: -0.02 });

      const cs = counterStr(t);
      const cpop = 1 + hits.reduce((a, h) => a + 0.25 * pulse(t, h, 0.25), 0);
      const csz = cs.length > 10 ? 30 : 44;
      const cw = Math.max(260, P.measure(ctx, cs, { size: csz, font: 'bubble' }) + 130);
      ctx.save();
      ctx.translate(360, 445); ctx.scale(cpop, cpop); ctx.rotate(-0.03 + Math.sin(t * 20) * 0.02 * heat);
      P.rect(ctx, -cw / 2, -38, cw, 76, heat > 0.5 ? C.red : '#fff', { radius: 38, seed: 80 });
      P.text(ctx, '💬', -cw / 2 + 44, 2, { size: 40, font: 'sans', shadow: false });
      P.text(ctx, cs, -cw / 2 + 76, 3, { size: csz, font: 'bubble', align: 'left', color: heat > 0.5 ? '#fff' : C.ink, shadow: false });
      ctx.restore();
      P.text(ctx, 'angry comments', 360, 500, { size: 26, font: 'marker', color: C.pink, shadow: false });

      const lit = P.boil(t, 2) % 2 === 0;
      P.rect(ctx, 700, 412, 200, 66, lit ? C.red : '#5a2a36', { radius: 12, seed: 81 });
      P.text(ctx, 'ON AIR', 800, 447, { size: 38, font: 'bubble', color: lit ? '#fff' : '#b77', shadow: false });

      /* ---------- the take strip ---------- */
      TAKES.forEach((k, i) => {
        const end = i < TAKES.length - 1 ? TAKES[i + 1].at : RESET;
        const pop = ease.outBack(prog(t, k.at, 0.3)) * (1 - ease.inCubic(prog(t, end - 0.12, 0.12)));
        if (pop <= 0) return;
        const size = 60;
        const w = P.measure(ctx, k.text, { size, font: 'bubble' }) + 190, h = 116;
        ctx.save();
        ctx.translate(540, 588); ctx.rotate((i % 2 ? 0.025 : -0.03)); ctx.scale(pop, pop);
        P.rect(ctx, -w / 2, -h / 2, w, h, C.paper, { radius: 12, seed: 90 + i, amp: 5 });
        P.circle(ctx, -w / 2 + 62, 0, 40, k.col, { seed: 95 + i });
        P.text(ctx, k.prop, -w / 2 + 62, 3, { size: 34, font: 'mono', color: C.ink, shadow: false });
        P.text(ctx, P.typed(k.text, prog(t, k.at + 0.06, 0.5)), -w / 2 + 118, 4, { size, font: 'bubble', align: 'left', color: C.ink, shadow: false });
        P.text(ctx, `take ${i + 1}/5`, w / 2 - 14, -h / 2 - 16, { size: 26, font: 'marker', align: 'right', color: C.yellow, shadow: false });
        ctx.restore();
      });

      /* ---------- furious comments ---------- */
      TAKES.forEach((k, i) => {
        const end = i < TAKES.length - 1 ? hits[i + 1] : RESET;
        k.comments.forEach(([h, txt], j) => {
          const pop = ease.outBack(prog(t, hits[i] + 0.08 + j * 0.16, 0.25)) * (1 - ease.inCubic(prog(t, end - 0.2 + j * 0.03, 0.15)));
          const x = 540 + (j % 2 ? 90 : -70) * (i % 2 ? -1 : 1);
          commentCard(ctx, h, txt, x, 710 + j * 104, (P.hash(i * 3 + j) - 0.5) * 0.12, pop, AV[(i + j) % AV.length], 100 + i * 3 + j);
        });
      });
      if (t >= hits[4] + 0.3 && t < RESET) {
        const r = P.rng(33);
        for (let i = 0; i < 12; i++) {
          const x = 200 + r() * 680, y = 660 + r() * 800, rot = (r() - 0.5) * 0.3;
          const pop = ease.outBack(prog(t, hits[4] + 0.35 + i * 0.05, 0.2)) * (1 - ease.inCubic(prog(t, 9.1 + i * 0.01, 0.15)));
          commentCard(ctx, STORM_H[i % 6], STORM[i % STORM.length], x, y, rot, pop, AV[i % AV.length], 140 + i);
        }
      }

      // light mode flashbang
      if (t >= hits[1]) P.flash(ctx, 1 - prog(t, hits[1], 0.55), '#fffdf2');

      /* ---------- RATIO'D stamp ---------- */
      if (t >= STAMP && t < RESET + 0.3) {
        const sp = prog(t, STAMP, 0.18);
        const s = lerp(3.2, 1, ease.outCubic(sp)) * (1 - ease.inCubic(prog(t, RESET, 0.25)));
        ctx.save();
        ctx.translate(540, 800); ctx.rotate(-0.16); ctx.scale(s, s);
        ctx.globalAlpha = clamp(sp * 3);
        P.rect(ctx, -330, -110, 660, 220, 'rgba(255,255,255,0.92)', { radius: 20, seed: 110 });
        ctx.strokeStyle = C.red; ctx.lineWidth = 14;
        P.wobblyRect(ctx, -305, -88, 610, 176, 111, 4, 14); ctx.stroke();
        P.text(ctx, "🔥 RATIO'D", 0, -12, { size: 108, font: 'bubble', color: C.red, shadow: false });
        P.text(ctx, '12 likes · 4.2M replies', 0, 62, { size: 34, font: 'mono', color: C.red, shadow: false });
        ctx.restore();
        if (t < STAMP + 0.6) P.burstLines(ctx, 540, 800, 330, prog(t, STAMP + 0.05, 0.5), C.yellow, 14, 12);
      }

      /* ---------- caption sticker ---------- */
      if (t < STAMP) P.sticker(ctx, 'he knows exactly what he is doing', 60, 1530, { size: 42, pop: ease.outBack(prog(t, 0.5, 0.4)) * (1 - prog(t, STAMP - 0.15, 0.15)) });
      else P.sticker(ctx, 'rage is still engagement 📈', 60, 1530, { size: 44, pop: ease.outBack(prog(t, STAMP + 0.3, 0.4)) * (1 - prog(t, D - 0.2, 0.2)), rot: 0.02 });
    },
  });
})();
