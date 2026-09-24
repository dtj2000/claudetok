/* A day in the life of a token: tokenizer -> embedding -> attention party
 * -> sampled -> detokenized -> back into the context. Vlog cuts. */
(function () {
  const TAU = Math.PI * 2;
  const SC = [0, 1.7, 3.3, 5.1, 6.8, 8.8];
  const STAMPS = [['7:00 am', 'born 🐣'], ['7:01 am', 'get embedded ✨'], ['7:02 am', 'attention party 🪩'],
    ['7:03 am', 'sampled!! 🎲'], ['7:04 am', 'detokenized 👋'], ['7:05 am', 'back to context 🔁']];
  const CAPS = ['woke up in the tokenizer ngl', '4096 dimensions and i feel all of them', 'attending to everyone (mostly ▁good 👀)',
    'temp 0.7 means anything can happen', 'it was an honor to be output 🥲', 'see u next forward pass 🎒'];
  const SENTENCE = 'sending you good vibes';
  const HERO = '▁vibes';
  const JUMPS = [5.25, 5.32, 5.39, 5.47, 5.56, 5.66, 5.78, 5.92, 6.08];

  /* ---------- characters ---------- */
  /** A token: a paper tile with a face, label, tiny legs and a backpack. */
  function tile(ctx, t, x, y, s, o = {}) {
    const { C } = P;
    const sq = o.squash || 0;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    ctx.scale(s * (1 + sq * 0.22), s * (1 - sq * 0.22));
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.pack) P.rect(ctx, 64, -62, 76, 108, C.mustard, { radius: 18, seed: 7 });
    if (o.legs) {
      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
      const k = o.walk ? Math.sin(t * 14) * 8 : 0;
      [[-40, k], [40, -k]].forEach(([lx, dk]) => {
        ctx.beginPath(); ctx.moveTo(lx, 80); ctx.lineTo(lx + dk, 112); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + dk - 4, 114); ctx.lineTo(lx + dk + 14, 114); ctx.stroke();
      });
      ctx.restore();
    }
    if (o.wave != null) {
      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
      const a = -1.1 + Math.sin(o.wave * 14) * 0.45;
      const ex = -110, hx = -110 - 60 * Math.cos(a), hy = 0 + 60 * Math.sin(a);
      ctx.beginPath(); ctx.moveTo(ex, 10); ctx.lineTo(hx, hy); ctx.stroke();
      P.dot(ctx, hx, hy, 13, C.ink);
      ctx.restore();
    }
    P.rect(ctx, -110, -85, 220, 170, o.color || C.paper, { radius: 26, seed: o.seed || 11 });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(-104, -79, 208, 26, [20, 20, 0, 0]);
    ctx.fillStyle = o.stripe || P.C.rose; ctx.fill();
    ctx.restore();
    if (o.pack) {
      ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(84, -54); ctx.lineTo(84, 40); ctx.stroke(); ctx.restore();
    }
    P.face(ctx, 0, -12, 64, o.mood || 'happy', { blink: o.blink, skin: o.color || C.paper });
    P.text(ctx, o.label || HERO, 0, 50, { size: o.labelSize || 36, font: 'mono', color: C.ink, shadow: false, weight: 800 });
    if (o.halo) {
      ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.ellipse(0, -118, 70, 18, 0, 0, TAU); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }

  function strip(ctx, y) {
    P.rect(ctx, 190, y - 46, 700, 92, P.C.paper, { radius: 14, seed: 21 });
    P.text(ctx, SENTENCE, 540, y + 2, { size: 44, font: 'mono', color: P.C.ink, shadow: false, weight: 700 });
  }

  function machine(ctx, t, busy) {
    const { C } = P;
    const shakeAmt = busy ? 4 : 0;
    ctx.save();
    P.shake(ctx, t, shakeAmt);
    P.poly(ctx, [[320, 440], [760, 440], [650, 546], [430, 546]], C.red, { seed: 31 });
    P.rect(ctx, 210, 530, 660, 560, C.teal, { radius: 34, seed: 32 });
    P.rect(ctx, 280, 570, 520, 116, C.paper, { radius: 16, seed: 33 });
    P.text(ctx, 'BPE-o-matic 3000', 540, 630, { size: 54, font: 'bubble', color: C.teal, shadow: false });
    // gear window
    P.rect(ctx, 270, 720, 330, 300, '#1f5f52', { radius: 20, seed: 34, shadow: false });
    ctx.save();
    ctx.beginPath(); ctx.rect(270, 720, 330, 300); ctx.clip();
    const spin = t * (busy ? 3 : 0.6);
    P.star(ctx, 380, 830, 95, C.mustard, { points: 10, inner: 0.78, rot: spin });
    P.dot(ctx, 380, 830, 24, '#1f5f52');
    P.star(ctx, 505, 935, 66, C.yellow, { points: 8, inner: 0.74, rot: -spin * 1.4 + 0.2 });
    P.dot(ctx, 505, 935, 16, '#1f5f52');
    ctx.restore();
    // gauge
    P.circle(ctx, 720, 800, 70, C.paper, { seed: 35 });
    const needle = -2.2 + (busy ? 1.8 + Math.sin(t * 17) * 0.3 : 0.4);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(720, 800); ctx.lineTo(720 + Math.cos(needle) * 52, 800 + Math.sin(needle) * 52); ctx.stroke(); ctx.restore();
    P.text(ctx, 'tok/s', 720, 848, { size: 22, font: 'mono', color: C.ink, shadow: false });
    // blinky lights
    [C.red, C.yellow, C.green].forEach((c, i) => P.dot(ctx, 670 + i * 50, 930, 16, P.hash(P.boil(t, 6) + i * 3) > 0.4 ? c : '#174a40'));
    // chute
    P.rect(ctx, 470, 1060, 140, 50, '#1f5f52', { radius: 10, seed: 36 });
    ctx.restore();
  }

  function belt(ctx, t, moving) {
    const { C } = P;
    P.rect(ctx, 30, 1335, 1020, 64, C.ink, { radius: 32, seed: 41 });
    const off = moving ? (t * 260) % 80 : 0;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(40, 1342, 1000, 50, 25); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6;
    for (let x = 40 - off; x < 1080; x += 80) { ctx.beginPath(); ctx.moveTo(x, 1342); ctx.lineTo(x + 30, 1392); ctx.stroke(); }
    ctx.restore();
  }

  /* ---------- scenes (lt = local time in scene) ---------- */
  function sceneBorn(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.rays(ctx, 540, 800, 18, C.yellow, '#F8D36A', t * 0.2);
    // sentence drops into the hopper
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 1080, 470); ctx.clip();
    strip(ctx, lerp(330, 600, ease.inCubic(prog(lt, 0, 0.55))));
    ctx.restore();
    machine(ctx, t, lt < 1.1);
    belt(ctx, t, lt < 1.0);
    // the siblings, chopped out first
    [['▁sending', C.sky, 0.25], ['▁you', C.mint, 0.48], ['▁good', C.pink, 0.7]].forEach(([lab, col, te], i) => {
      if (lt < te) return;
      const land = ease.outBounce(prog(lt, te, 0.25));
      const x = 540 - Math.max(0, lt - te - 0.25) * 430;
      tile(ctx, t, x, lerp(1080, 1284, land), 0.6, { label: lab, color: col, stripe: C.purple, mood: 'smile', seed: 50 + i, labelSize: 32 });
      if (env.at(te)) SFX.pop({ f: 420 + i * 90, vol: 0.12 });
    });
    // our hero
    if (lt >= 0.95) {
      const land = ease.outBounce(prog(lt, 0.95, 0.4));
      const sq = P.pulse(lt, 1.2, 0.25) * 0.5;
      tile(ctx, t, 540, lerp(1060, 1215, land), 1, { pack: true, legs: true, mood: lt < 1.3 ? 'wow' : 'happy', squash: sq });
      P.burstLines(ctx, 540, 1215, 150, prog(lt, 1.3, 0.35), C.paper, 10, 8);
    }
    P.bubble(ctx, 'hi world!!', 790, 1130, 640, 1190, { size: 48, pop: P.ease.outBack(prog(lt, 1.3, 0.25)) });
    if (env.at(SC[0] + 0.95)) SFX.whoosh({ vol: 0.12, dur: 0.25 });
    if (env.at(SC[0] + 1.3)) { SFX.boing({ vol: 0.16 }); SFX.chirp({ when: 0.1, vol: 0.1 }); }
  }

  function vecArrow(ctx, x0, y0, x1, y1, p, cols, w, seed) {
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0) * p;
    if (L < 4) return;
    ctx.save();
    ctx.translate(x0, y0); ctx.rotate(a);
    const shaft = Math.max(0, L - 70), n = cols.length;
    for (let i = 0; i < n; i++) {
      const s0 = (shaft * i) / n, s1 = (shaft * (i + 1)) / n;
      if (s1 - s0 < 2) continue;
      P.rect(ctx, s0, -w / 2, s1 - s0 + 2, w, cols[i], { radius: 4, seed: seed + i, shadow: i === 0 ? {} : false, amp: 1.5 });
    }
    P.poly(ctx, [[L, 0], [L - 90, -w * 1.6], [L - 90, w * 1.6]], cols[n - 1], { seed: seed + 20, amp: 2 });
    ctx.restore();
  }

  function sceneEmbed(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.grid(ctx, C.purple, 'rgba(255,255,255,0.08)', 60);
    const ox = 300, oy = 1160;
    // axes
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.setLineDash([18, 14]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(880, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, 480); ctx.moveTo(ox, oy); ctx.lineTo(120, 1330); ctx.stroke();
    ctx.restore();
    ['x', 'y', 'z…×4093'].forEach((s, i) => P.text(ctx, s, [[900, oy], [ox, 450], [150, 1370]][i][0] + (i === 2 ? 70 : 0), [[900, oy], [ox, 450], [150, 1370]][i][1], { size: 34, font: 'mono', color: 'rgba(255,255,255,0.8)', shadow: false }));
    // neighbours in embedding space
    const nb = ease.outCubic(prog(lt, 0.75, 0.5));
    ctx.save(); ctx.globalAlpha = 0.55;
    vecArrow(ctx, ox, oy, 850, 800, nb, [C.mint, C.mint, C.teal], 22, 60);
    vecArrow(ctx, ox, oy, 150, 650, nb, [C.mustard, C.mustard, C.brown], 22, 70);
    ctx.restore();
    if (nb > 0.9) {
      P.text(ctx, '▁good', 880, 760, { size: 36, font: 'mono', color: C.mint, shadow: false });
      P.text(ctx, '▁lasagna', 170, 600, { size: 36, font: 'mono', color: C.yellow, shadow: false });
      P.text(ctx, 'similar vibes 🤝', 700, 1010, { size: 40, font: 'marker', color: '#fff', rot: -0.35, scale: ease.outBack(prog(lt, 1.05, 0.3)) });
    }
    // hero shrinks into the origin as the arrow grows out of it
    const zap = 0.2;
    const grow = ease.outBack(prog(lt, zap + 0.1, 0.55));
    const tipX = lerp(ox, 780, grow), tipY = lerp(oy, 600, grow);
    if (lt < zap + 0.3) {
      const s = lt < zap ? 0.8 : 0.8 * (1 - ease.inCubic(prog(lt, zap, 0.3)));
      tile(ctx, t, ox, oy - (lt < zap ? 80 : 0), s, { pack: true, legs: true, mood: lt < zap ? 'smile' : 'wow', squash: P.pulse(lt, zap, 0.2) });
    }
    vecArrow(ctx, ox, oy, 780, 600, grow, [C.pink, C.claude, C.yellow, C.mint, C.sky, '#c9b6ff', C.rose], 34, 80);
    if (grow > 0.2) {
      // the arrowhead has the face now
      const ang = Math.atan2(600 - oy, 780 - ox);
      P.face(ctx, tipX - Math.cos(ang) * 44, tipY - Math.sin(ang) * 44, 36, lt > 0.9 ? 'happy' : 'wow', { skin: C.rose });
      ctx.save(); ctx.translate(lerp(ox, tipX, 0.45), lerp(oy, tipY, 0.45)); ctx.rotate(ang);
      P.text(ctx, HERO, 0, -46, { size: 34, font: 'mono', color: '#fff', shadow: false });
      ctx.restore();
    }
    P.burstLines(ctx, ox, oy - 40, 90, prog(lt, zap, 0.35), C.yellow, 10, 9);
    P.flash(ctx, P.pulse(lt, zap, 0.15) * 0.6);
    // the coordinates, typed
    P.rect(ctx, 90, 1265, 790, 92, C.paper, { radius: 20, seed: 88 });
    P.text(ctx, P.typed('[0.12, -0.83, 0.44, 0.91, … ×4096]', prog(lt, 0.35, 0.9)), 120, 1313, { size: 34, font: 'mono', align: 'left', color: C.purple, shadow: false });
    if (env.at(SC[1] + zap)) { SFX.tone(300, 0.5, { type: 'sawtooth', slide: 1600, vol: 0.06 }); SFX.pop({ vol: 0.12 }); }
    for (let i = 0; i < 12; i++) if (env.at(SC[1] + 0.35 + i * 0.075)) SFX.type({ vol: 0.15 });
  }

  function sceneParty(ctx, t, lt, env) {
    const { C, ease, prog } = P;
    P.bg(ctx, C.nightDeep);
    P.stars(ctx, t, 12, 26, C.pink, [0, 280, 1080, 1100]);
    const beat = Math.floor(t * 2);
    const bump = 1 - ((t * 2) % 1);
    // rotating light beams
    ctx.save();
    [C.pink, C.sky, C.yellow, C.mint].forEach((c, i) => {
      const a = Math.PI / 2 + Math.sin(t * 1.6 + i * 1.7) * 0.9;
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(540, 400);
      ctx.lineTo(540 + Math.cos(a - 0.12) * 1500, 400 + Math.sin(a - 0.12) * 1500);
      ctx.lineTo(540 + Math.cos(a + 0.12) * 1500, 400 + Math.sin(a + 0.12) * 1500);
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    // dance floor
    const cols = [C.pink, C.sky, C.yellow, C.mint, '#c9b6ff'];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) {
      const lit = P.hash(i * 3 + j * 7 + beat) > 0.5;
      P.rect(ctx, 20 + i * 116, 1370 + j * 96, 108, 88, lit ? cols[(i + j + beat) % 5] : '#2c2860', { radius: 8, seed: i * 2 + j, shadow: false, amp: 2 });
    }
    // disco ball
    ctx.save(); ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 280); ctx.lineTo(540, 320); ctx.stroke(); ctx.restore();
    P.circle(ctx, 540, 400, 82, '#c9c5d8', { seed: 91 });
    ctx.save();
    ctx.beginPath(); ctx.arc(540, 400, 80, 0, TAU); ctx.clip();
    for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
      const b = P.hash(i * 11 + j * 5 + P.boil(t, 6));
      ctx.fillStyle = b > 0.8 ? '#fff' : b > 0.5 ? '#e4e1ef' : '#9d98b5';
      ctx.fillRect(540 + i * 17 - 7, 400 + j * 17 - 7, 14, 14);
    }
    ctx.restore();

    const hx = 540, hy = 1000;
    const guests = [['<bos>', 220, 760, C.sky], ['▁sending', 540, 640, C.mint], ['▁you', 850, 760, C.yellow], ['▁good', 790, 1240, C.pink], [',', 290, 1240, '#c9b6ff']];
    const heads = [[0.05, 0.12, 0.08, 0.65, 0.1], [0.3, 0.1, 0.4, 0.1, 0.1]];
    const head = beat % 2;
    const w = heads[head];
    const lineCol = head ? C.sky : C.pink;
    const intro = ease.outCubic(prog(lt, 0.1, 0.4));
    // everyone-to-everyone faint lines
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 3;
    for (let i = 0; i < guests.length; i++) for (let j = i + 1; j < guests.length; j++) {
      ctx.beginPath(); ctx.moveTo(guests[i][1], guests[i][2]); ctx.lineTo(guests[j][1], guests[j][2]); ctx.stroke();
    }
    // hero's attention
    ctx.lineCap = 'round'; ctx.strokeStyle = lineCol;
    guests.forEach(([, gx, gy], i) => {
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = (4 + w[i] * 46) * (0.8 + bump * 0.35) * intro;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(P.lerp(hx, gx, intro), P.lerp(hy, gy, intro)); ctx.stroke();
    });
    ctx.restore();
    // hearts travel to ▁good on head 0
    if (head === 0) for (let k = 0; k < 3; k++) {
      const f = ((t * 1.4 + k / 3) % 1);
      P.heart(ctx, P.lerp(hx, 790, f), P.lerp(hy, 1240, f) - Math.sin(f * Math.PI) * 40, 26, C.rose, { shadow: false });
    }
    P.text(ctx, head ? 'head 2' : 'head 1', 540, 1130, { size: 30, font: 'mono', color: lineCol, shadow: false });
    // the guests dance
    guests.forEach(([lab, gx, gy, col], i) => {
      const hop = Math.abs(Math.sin((t * 2 + i * 0.25) * Math.PI)) * 26;
      tile(ctx, t, gx, gy - hop, 0.55, { label: lab, color: col, stripe: C.purple, mood: lab === '▁good' && head === 0 ? 'wink' : 'happy', rot: Math.sin(t * 6.28 + i) * 0.08, seed: 60 + i, labelSize: 34 });
    });
    const hop = Math.abs(Math.sin(t * 2 * Math.PI)) * 34;
    tile(ctx, t, hx, hy - hop, 0.78, { pack: true, legs: true, mood: 'happy', rot: Math.sin(t * Math.PI * 2) * 0.12, squash: hop < 6 ? 0.25 : 0 });
    // poor <pad>
    tile(ctx, t, 115, 1075, 0.4, { label: '<pad>', color: '#8f8aa8', stripe: '#6d6888', mood: 'sad', seed: 70, labelSize: 38 });
    P.text(ctx, 'nobody attends\nto <pad> 😔', 180, 1080, { size: 28, font: 'marker', color: '#cfcaf0', align: 'left', shadow: false });
    if (env.at(SC[2] + 0.1)) SFX.riser(0.5, { vol: 0.1 });
  }

  function sceneSampled(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.bg(ctx, C.mint);
    P.stripes(ctx, C.mint, '#9fdcc1', 45, 0.5);
    const xs = [170, 390, 610, 830];
    const cands = [['▁vibe', 0.21, C.sky], [HERO, 0.46, C.paper], ['▁energy', 0.32, C.yellow], ['▁lasagna', 0.01, C.claude]];
    const done = t >= JUMPS[JUMPS.length - 1];
    let k = 0; JUMPS.forEach(j => { if (t >= j) k++; });
    const sel = k > 0 ? k % 4 : -1;
    const lift = ease.inOutCubic(prog(lt, 1.45, 0.3));
    // bars
    cands.forEach(([lab, pr, col], i) => {
      const grow = ease.outBack(prog(lt, 0.05 + i * 0.05, 0.4));
      const h = Math.max(8, pr * 820) * grow;
      P.rect(ctx, xs[i] - 55, 820 - h, 110, h, i === 1 ? C.rose : C.teal, { radius: 12, seed: 100 + i });
      P.text(ctx, pr < 0.05 ? '0.1%' : Math.round(pr * 100) + '%', xs[i], 790 - h, { size: 40, font: 'bubble', color: C.ink, stroke: '#fff', strokeWidth: 8 });
      if (i === 1 && lift > 0) return;
      const mood = done ? (i === 1 ? 'wow' : 'sad') : (sel === i ? 'wow' : 'smile');
      tile(ctx, t, xs[i], 920 - (i === 1 && done ? P.pulse(lt, 0.98, 0.35) * 70 : 0), 0.72,
        { label: lab, color: col, stripe: C.purple, mood, seed: 110 + i, labelSize: lab.length > 7 ? 26 : 34, pack: i === 1, legs: i === 1 });
    });
    // roulette highlight
    if (sel >= 0) {
      ctx.save();
      ctx.strokeStyle = done ? C.rose : C.yellow; ctx.lineWidth = 14; ctx.lineJoin = 'round';
      P.shadow(ctx, 10, 5, 0.3);
      P.wobblyRect(ctx, xs[sel] - 95, 842, 190, 170, 120 + sel, 3, 26); ctx.stroke();
      ctx.restore();
    }
    JUMPS.forEach((j, i) => { if (env.at(j)) { SFX.tick({ vol: 0.35 }); SFX.blip(700 + i * 40, { vol: 0.04 }); } });
    // temperature slider
    P.rect(ctx, 140, 1120, 700, 22, C.ink, { radius: 11, seed: 130 });
    P.circle(ctx, 140 + 700 * 0.7 / 1.5, 1131, 30, C.red, { seed: 131 });
    P.text(ctx, 'temperature = 0.7 🌡️', 490, 1195, { size: 44, font: 'marker', color: C.ink, shadow: false });
    // SAMPLED stamp
    if (done && lift <= 0) {
      const s = ease.outBack(prog(lt, 0.98, 0.3));
      P.title(ctx, 'SAMPLED!', 390, 700, { size: 110, color: C.red, stroke: '#fff', rot: -0.18, pop: 2 - s });
    }
    P.confetti(ctx, t - JUMPS[JUMPS.length - 1], 390, 850, 11, 60, 650);
    P.bubble(ctx, 'next time 🍝', 740, 1070, 830, 990, { size: 40, pop: ease.outBack(prog(lt, 1.15, 0.3)) });
    if (env.at(JUMPS[JUMPS.length - 1])) { SFX.success({ vol: 0.16 }); SFX.thud({ vol: 0.3 }); }
    // Clawd's arm plucks the winner out
    const down = ease.outCubic(prog(lt, 1.25, 0.2));
    const tipY = lerp(-250, 830, down) - lift * 1100;
    if (lt > 1.2) {
      if (lift > 0) tile(ctx, t, 390, tipY + 90, 0.72, { pack: true, legs: true, mood: 'wow', seed: 111, color: C.paper, stripe: C.purple });
      P.arm(ctx, 390, tipY, 470, tipY - 1400, 70);
    }
    if (env.at(SC[3] + 1.45)) SFX.whoosh({ vol: 0.14, dur: 0.3 });
  }

  function sceneDetok(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.bg(ctx, C.pink);
    P.gingham(ctx, 0, 1080, 1080, 840, C.rose, 70, '#f7d3dc');
    P.window(ctx, 90, 470, 900, 500, 'assistant.txt', { seed: 140 });
    const base = 'sending you good ';
    const tx = 130;
    const bw = P.measure(ctx, base, { size: 54, font: 'mono' });
    const slotX = tx + bw + 70;
    const merged = lt >= 1.2;
    P.text(ctx, base + (merged ? 'vibes' : ''), tx, 690, { size: 54, font: 'mono', align: 'left', color: C.ink, shadow: false, weight: 700 });
    // cursor
    if (Math.floor(t * 3) % 2 === 0) {
      const cx = tx + P.measure(ctx, base + (merged ? 'vibes' : ''), { size: 54, font: 'mono' }) + 8;
      P.rect(ctx, cx, 655, 8, 70, C.claude, { radius: 3, seed: 141, shadow: false });
    }
    if (merged) {
      const g = P.pulse(lt, 1.2, 0.6);
      P.star(ctx, slotX + 60, 640, 30 * g, C.yellow, { points: 4, inner: 0.3 });
      P.star(ctx, slotX - 20, 740, 20 * g, C.yellow, { points: 4, inner: 0.3 });
    }
    // hero drops in from the arm, waves, then melts into the word
    const arrive = ease.outBack(prog(lt, 0, 0.4));
    const shrink = ease.inCubic(prog(lt, 1.0, 0.25));
    if (lt < 1.25) {
      const s = 0.72 * (1 - shrink);
      tile(ctx, t, slotX, lerp(-150, 700, arrive), s, { pack: true, legs: true, mood: lt > 0.35 ? 'happy' : 'wow', wave: lt > 0.35 ? lt : null, squash: P.pulse(lt, 0.3, 0.2) * 0.4 });
    }
    P.bubble(ctx, 'bye besties 👋', 540, 1140, slotX, 820, { size: 50, pop: ease.outBack(prog(lt, 0.4, 0.3)) * (1 - prog(lt, 1.15, 0.1)) });
    // the token's little spirit floats off
    if (lt > 1.2) {
      const up = prog(lt, 1.2, 0.8);
      tile(ctx, t, slotX + Math.sin(lt * 5) * 20, 700 - up * 420, 0.5, { pack: true, halo: true, mood: 'happy', alpha: 0.55 * (1 - up), color: '#fff', stripe: '#fff' });
    }
    if (lt > 1.5) P.text(ctx, "finish_reason: 'stop' 🛑", 130, 900, { size: 30, font: 'mono', align: 'left', color: '#8a8494', shadow: false });
    if (env.at(SC[4] + 0.3)) SFX.thud({ vol: 0.25 });
    if (env.at(SC[4] + 0.4)) SFX.chirp({ vol: 0.12 });
    if (env.at(SC[4] + 1.2)) SFX.chime({ vol: 0.12 });
  }

  function sceneBack(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.rays(ctx, 540, 800, 18, C.yellow, '#F8D36A', t * 0.2);
    machine(ctx, t, false);
    belt(ctx, t, false);
    const rise = ease.inOutCubic(prog(t, 9.1, 0.9));
    const out = 1 - ease.inCubic(prog(t, 9.7, 0.3));
    P.title(ctx, 'see u next\nforward pass 🎒', 540, 1210, { size: 92, color: C.claude, stroke: '#fff', rot: -0.04, pop: ease.outBack(prog(lt, 0.05, 0.4)) * out, lineHeight: 1.05 });
    strip(ctx, lerp(1250, 330, rise));
    if (env.at(9.1)) SFX.riser(0.9, { vol: 0.08 });
  }

  const SCENES = [sceneBorn, sceneEmbed, sceneParty, sceneSampled, sceneDetok, sceneBack];
  const BGS = ['#F5C84B', '#6B4E9B', '#1E1B45', '#8FD3B6', '#F2B8C6', '#F5C84B'];

  ClaudeTok.register({
    author: '@lil.token',
    caption: 'day in the life of a token 🎒 (lifespan: 4 minutes, emotionally: forever) #dayinthelife #vlog #tokenlife #attention',
    sound: 'morning vlog ukulele · lil.token',
    avatar: '🎒',
    avatarColor: '#F5C84B',
    duration: 10,
    bg: '#F5C84B',
    likes: '5.6M', commentCount: '92K', saves: '1.1M', shares: '340K',
    thumb: 4.1,
    comments: [
      '@pad.token: nobody attends to me and i still show up every day',
      '@lasagna: 0.1% is not zero. i will be sampled one day',
      '@softmax: head 1 is so down bad for ▁good',
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const mel = ['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'E5', 'C5', 'E5', 'G5', 'C6', 'A5', 'G5', 'E5', 'D5'];
      const party = env.t >= SC[2] && env.t < SC[3];
      const roulette = env.t >= SC[3] && env.t < SC[3] + 1.0;
      if (!roulette) SFX.pluck(mel[step % 16], { vol: party ? 0.04 : 0.07 });
      if (step % 2 === 0) SFX.kick({ vol: party ? 0.38 : 0.2 });
      if (step % 4 === 2) SFX.snare({ vol: 0.08 });
      if (party) {
        SFX.hat({ vol: 0.06 });
        if (step % 2 === 0) SFX.bass(['C2', 'A1', 'F1', 'G1'][Math.floor(step / 4) % 4], 0.22, { vol: 0.22 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      let i = SCENES.length - 1;
      while (i > 0 && t < SC[i]) i--;
      const lt = t - SC[i];
      const whip = i === 0 ? 0 : 1 - ease.outCubic(prog(lt, 0, 0.22));

      // handheld camera + whip-pan cut
      ctx.save();
      ctx.translate(Math.sin(t * 1.3) * 6 + whip * 320, Math.cos(t * 1.7) * 5);
      ctx.rotate(Math.sin(t * 0.9) * 0.006 + whip * 0.03);
      P.bg(ctx, BGS[i]);
      SCENES[i](ctx, t, lt, env);
      ctx.restore();
      P.flash(ctx, whip * 0.45);
      if (i > 0 && env.at(SC[i])) SFX.swoosh({ vol: 0.16 });

      // vlog overlay: viewfinder corners + REC
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(44, 400); ctx.lineTo(44, 300); ctx.lineTo(144, 300);
      ctx.moveTo(936, 300); ctx.lineTo(1036, 300); ctx.lineTo(1036, 400);
      ctx.stroke();
      ctx.restore();
      if (Math.floor(t * 2) % 2 === 0) P.dot(ctx, 900, 345, 14, C.red);
      P.text(ctx, 'REC', 960, 347, { size: 34, font: 'mono', color: '#fff', shadow: true, weight: 800 });

      // timestamp card
      const [clock, what] = STAMPS[i];
      const pop = ease.outBack(prog(lt, 0.05, 0.35));
      ctx.save();
      ctx.translate(80, 360); ctx.rotate(-0.04); ctx.scale(pop, pop);
      P.rect(ctx, 0, -10, 300, 96, C.ink, { radius: 20, seed: 150 + i });
      P.text(ctx, clock, 150, 40, { size: 60, font: 'bubble', color: '#fff', shadow: false });
      P.rect(ctx, 20, 84, 20 + P.measure(ctx, what, { size: 42, font: 'marker' }) + 20, 64, C.paper, { radius: 14, seed: 160 + i });
      P.text(ctx, what, 40, 117, { size: 42, font: 'marker', align: 'left', color: C.ink, shadow: false });
      ctx.restore();

      // caption sticker
      P.sticker(ctx, CAPS[i], 60, 1500 + (i === 2 ? -10 : 0), { size: 44, pop: ease.outBack(prog(lt, 0.15, 0.35)), rot: i % 2 ? 0.015 : -0.02 });
    },
  });
})();
