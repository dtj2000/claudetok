/* Town Hall TV: "should weights be open?" Split screen: Open Weights Guy (hoodie,
 * throws floats like confetti) vs Closed Weights Guy (suit, guards a vault). The
 * live poll swings, BREAKING banners fire, the boxes fight for screen space, and
 * then a single old tweet drifts down and they agree: please stop training on my
 * tweets. The moderator (Clawd) quietly slides a bag of tweets out of frame. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 12;
  const NAVY = '#16204a';
  const BOX_Y = 420, BOX_H = 580;
  const OPEN_A = 1.2, CLOSED_A = 3.0, BREAK1 = 4.8, ESC = 5.0, TWEET = 7.0, AGREE = 7.6, PIP = 9.2, OUTRO = 11.2;
  const HOODIE = '#5E7F52', HOODIE_D = '#4A6641', SKIN_O = '#F0C9A0', SKIN_C = '#E9BD95';
  const TICKER = '◆ 72% OF VIEWERS DID NOT READ THE LICENSE   ◆ WEIGHTS SPOTTED ON A TORRENT, AGAIN   ◆ MODEL CARD NOW LONGER THAN MODEL   ◆ STUDIO AUDIENCE ASKS "WHAT IS A WEIGHT"   ◆ POLL MARGIN OF ERROR: YES   ';
  const SHOUTS = ['OPEN!', 'CLOSED!', 'OPEN!!', 'CLOSED!!', 'FORK IT!', 'PATENT IT!', 'SEED 42!', 'NDA!', 'OPEEEN', 'CLOOOSED'];
  const FLOATS = ['0.0312', '-1.77', '3e-4', '0.5', '-0.09', '1.0', '0.618', '-2.4', '7e-3'];
  const CROSS = [5.3, 5.95, 6.6]; // floats thrown across the split
  const PLANES = [5.6, 6.25, 6.85]; // NDA paper planes thrown back

  const esc = t => P.prog(t, ESC, 0.4) * (1 - P.prog(t, TWEET - 0.1, 0.2));
  const divider = t => 540 + Math.sin(t * 5.5) * 70 * esc(t) + Math.sin(t * 13) * 14 * esc(t);

  function openPct(t) {
    const { lerp, ease, prog } = P;
    let v = 50;
    v = lerp(v, 63, ease.inOutCubic(prog(t, OPEN_A, 1.2)));
    v = lerp(v, 38, ease.inOutCubic(prog(t, CLOSED_A, 1.2)));
    v = lerp(v, 50 + 38 * Math.sin(t * 9), esc(t));
    return v + Math.sin(t * 3.3) * 1.5;
  }

  function drop(ctx, x, y, s, col = '#8EC9E8') {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.2);
    ctx.bezierCurveTo(x + s * 0.9, y, x + s * 0.8, y + s * 0.9, x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 0.8, y + s * 0.9, x - s * 0.9, y, x, y - s * 1.2);
    ctx.closePath();
    P.cut(ctx, col, { rim: false, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
  }

  function dumbbell(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.rect(ctx, -30, -5, 60, 10, '#56506a', { radius: 4, seed: 3, shadow: false });
    P.rect(ctx, -44, -18, 16, 36, P.C.ink, { radius: 5, seed: 4 });
    P.rect(ctx, 28, -18, 16, 36, P.C.ink, { radius: 5, seed: 5 });
    ctx.restore();
  }

  function floatChip(ctx, str, x, y, rot, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const w = str.length * 17 + 26;
    P.rect(ctx, -w / 2, -22, w, 44, '#FBF7EE', { radius: 10, seed: str.length + 7, shadow: { blur: 6, dy: 4, alpha: 0.25 } });
    P.text(ctx, str, 0, 1, { size: 26, font: 'mono', color: P.C.teal, shadow: false });
    ctx.restore();
  }

  /* ---------------- the pundits ---------------- */
  function openGuy(ctx, x, y, t, mood, armA) {
    const { C } = P;
    // hoodie body
    P.rect(ctx, x - 130, y + 60, 260, 300, HOODIE, { radius: 70, seed: 10 });
    P.text(ctx, '{ }', x, y + 170, { size: 60, font: 'mono', color: HOODIE_D, shadow: false });
    P.circle(ctx, x, y + 2, 106, HOODIE_D, { seed: 11 });
    P.circle(ctx, x, y + 10, 76, SKIN_O, { seed: 12 });
    // hair tuft poking out of the hood
    P.poly(ctx, [[x - 50, y - 50], [x - 20, y - 80], [x - 6, y - 52], [x + 18, y - 84], [x + 30, y - 50], [x + 54, y - 66], [x + 50, y - 36], [x - 46, y - 34]], '#6b4a2e', { seed: 13 });
    P.face(ctx, x, y + 16, 60, mood, { skin: SKIN_O });
    // hood strings
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    [-30, 30].forEach(d => { ctx.beginPath(); ctx.moveTo(x + d, y + 88); ctx.lineTo(x + d + Math.sin(t * 4 + d) * 5, y + 150); ctx.stroke(); });
    ctx.restore();
    // throwing arm
    const sx = x + 100, sy = y + 110;
    const hx = sx + Math.cos(armA) * 130, hy = sy + Math.sin(armA) * 130;
    ctx.beginPath(); P.capsulePath(ctx, sx, sy, hx, hy, 50); P.cut(ctx, HOODIE);
    P.circle(ctx, hx, hy, 26, SKIN_O, { seed: 14 });
    return [hx, hy];
  }

  function closedGuy(ctx, x, y, t, mood, glassesDown) {
    const { C } = P;
    P.rect(ctx, x - 130, y + 60, 260, 300, NAVY, { radius: 60, seed: 20 });
    P.poly(ctx, [[x - 42, y + 64], [x + 42, y + 64], [x, y + 160]], '#fff', { seed: 21, shadow: false });
    P.poly(ctx, [[x - 12, y + 72], [x + 12, y + 72], [x + 18, y + 170], [x, y + 190], [x - 18, y + 170]], C.red, { seed: 22, amp: 2 });
    P.circle(ctx, x, y + 10, 78, SKIN_C, { seed: 23 });
    // slick hair
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y - 34, 82, 50, 0, Math.PI, 0); ctx.closePath();
    P.cut(ctx, '#2B2233', { rim: false });
    ctx.restore();
    P.face(ctx, x, y + 16, 60, mood, { skin: SKIN_C });
    // sunglasses (slide down the nose when surprised)
    const gy = y + 10 + glassesDown * 30;
    P.rect(ctx, x - 58, gy - 16, 50, 32, '#1a1620', { radius: 10, seed: 24, shadow: false });
    P.rect(ctx, x + 8, gy - 16, 50, 32, '#1a1620', { radius: 10, seed: 25, shadow: false });
    ctx.save(); ctx.strokeStyle = '#1a1620'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 10, gy - 6); ctx.lineTo(x + 10, gy - 6); ctx.stroke(); ctx.restore();
    // crossed arms
    ctx.beginPath(); P.capsulePath(ctx, x - 100, y + 150, x + 80, y + 200, 52); P.cut(ctx, '#1f2b5e');
    ctx.beginPath(); P.capsulePath(ctx, x + 100, y + 150, x - 80, y + 214, 52); P.cut(ctx, '#233168');
  }

  function vault(ctx, x, y, r, t, spin, lasers) {
    const { C } = P;
    P.circle(ctx, x, y, r + 22, '#8d8f99', { seed: 30 });
    P.circle(ctx, x, y, r, '#b8bac4', { seed: 31 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P.dot(ctx, x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14), 7, '#8d8f99'); }
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ctx.strokeStyle = '#56506a'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6); ctx.stroke(); }
    ctx.restore();
    P.circle(ctx, x, y, 24, '#56506a', { seed: 32 });
    P.rect(ctx, x - 100, y + r - 10, 200, 44, C.mustard, { radius: 6, seed: 33 });
    P.text(ctx, 'weights.bin 🔒', x, y + r + 12, { size: 24, font: 'mono', color: C.ink, shadow: false });
    if (lasers > 0) {
      ctx.save(); ctx.globalAlpha = lasers * (0.6 + 0.3 * Math.sin(t * 20));
      ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - 220, y - 140 + k * 70); ctx.lineTo(x + 220, y - 100 + k * 60); ctx.stroke(); }
      ctx.restore();
    }
  }

  function boxFrame(ctx, x0, x1, seed) {
    P.rect(ctx, x0, BOX_Y - 6, x1 - x0, BOX_H + 12, '#FBF7EE', { radius: 16, seed });
  }
  function boxLabel(ctx, x0, label, col, seed) {
    P.rect(ctx, x0 + 14, BOX_Y + 14, 170, 46, col, { radius: 8, seed: seed + 1 });
    P.text(ctx, label, x0 + 99, BOX_Y + 38, { size: 28, font: 'bubble', color: '#fff', shadow: false });
  }

  function nameTag(ctx, x0, x1, name, sub) {
    const { C } = P;
    ctx.save();
    ctx.fillStyle = 'rgba(22,32,74,0.9)'; ctx.fillRect(x0 + 10, BOX_Y + BOX_H - 100, x1 - x0 - 20, 88);
    ctx.restore();
    P.text(ctx, name, x0 + 26, BOX_Y + BOX_H - 72, { size: 30, font: 'bubble', color: '#fff', align: 'left', shadow: false, maxWidth: x1 - x0 - 50 });
    P.text(ctx, sub, x0 + 26, BOX_Y + BOX_H - 36, { size: 22, font: 'sans', color: C.yellow, align: 'left', shadow: false, maxWidth: x1 - x0 - 50 });
  }

  function tweetCard(ctx, x, y, rot, s) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.rect(ctx, -170, -80, 340, 160, '#fff', { radius: 18, seed: 40 });
    P.circle(ctx, -122, -36, 26, C.sky, { seed: 41 });
    // tiny generic paper bird
    P.poly(ctx, [[-136, -36], [-112, -46], [-104, -30], [-128, -24]], '#fff', { seed: 42, shadow: false });
    P.text(ctx, '@you · 2014', -86, -40, { size: 24, font: 'sans', color: '#8a8494', align: 'left', shadow: false });
    P.text(ctx, '"just had a sandwich"', -150, 16, { size: 30, font: 'sans', color: C.ink, align: 'left', shadow: false, weight: 800 });
    P.text(ctx, '♡ 2   ↻ 0', -150, 54, { size: 22, font: 'sans', color: '#8a8494', align: 'left', shadow: false });
    ctx.restore();
  }

  function pipBox(ctx, t) {
    const { C, ease, prog, lerp } = P;
    const x0 = 425, y0 = 880, w = 230, h = 170;
    P.rect(ctx, x0 - 8, y0 - 8, w + 16, h + 16, C.yellow, { radius: 14, seed: 50 });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 10); ctx.clip();
    P.stripes(ctx, '#3a4d8a', '#34467e', 30);
    const guilty = t >= PIP;
    P.claude(ctx, x0 + w / 2, y0 + 100, 62, { t, mood: guilty ? 'sus' : 'smile', rot: guilty ? Math.sin(t * 3) * 0.08 : 0 });
    // headset
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + 96, 44, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + w / 2 - 44, y0 + 100); ctx.quadraticCurveTo(x0 + w / 2 - 40, y0 + 130, x0 + w / 2 - 14, y0 + 126); ctx.stroke();
    // the bag of tweets, sliding out of frame
    const slide = ease.inOutCubic(prog(t, PIP + 0.5, 1.1));
    const bx = lerp(x0 + 170, x0 + w + 90, slide);
    ctx.save(); ctx.translate(bx, y0 + 120); ctx.rotate(-0.1);
    P.poly(ctx, [[-40, -40], [40, -40], [48, 44], [-48, 44]], '#C08A5B', { seed: 51 });
    P.text(ctx, 'tweets\n.jsonl', 0, 6, { size: 18, font: 'mono', color: C.ink, shadow: false, lineHeight: 1 });
    ctx.restore();
    if (guilty) { const ph = (t * 1.3) % 1; ctx.globalAlpha = 1 - ph; drop(ctx, x0 + w / 2 + 50, y0 + 50 + ph * 50, 9); }
    ctx.restore();
    P.rect(ctx, x0, y0 + h - 30, w, 30, 'rgba(22,32,74,0.9)', { radius: 0, seed: 52, shadow: false });
    P.text(ctx, 'MODERATOR', x0 + w / 2, y0 + h - 14, { size: 20, font: 'bubble', color: '#fff', shadow: false });
  }

  function logoCover(ctx, t, k) {
    if (k <= 0) return;
    const { C } = P;
    const r = k * 1300;
    ctx.save();
    ctx.beginPath(); ctx.arc(540, 900, r, 0, TAU); ctx.clip();
    P.rays(ctx, 540, 900, 20, NAVY, '#22306a', t * 0.6);
    const s = 0.4 + k * 0.6;
    ctx.translate(540, 900); ctx.rotate((1 - k) * 1.5); ctx.scale(s, s);
    P.circle(ctx, 0, 0, 230, C.red, { seed: 60 });
    P.circle(ctx, 0, 0, 190, C.paper, { seed: 61 });
    P.text(ctx, 'TOWN\nHALL', 0, -20, { size: 110, font: 'bubble', color: NAVY, shadow: false, lineHeight: 0.95 });
    P.text(ctx, 'TV', 0, 120, { size: 60, font: 'bubble', color: C.red, shadow: false });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@town.hall.tv',
    caption: 'TOWN HALL: should weights be open? our two guests found common ground (live) #townhall #openweights #debate #pleasestop',
    sound: 'town hall theme (breaking news edit) · town.hall.tv',
    avatar: '📺',
    avatarColor: '#16204a',
    duration: D,
    bg: NAVY,
    likes: '4.6M', commentCount: '173K', saves: '290K', shares: '1.4M',
    thumb: 8.2,
    comments: [
      ['my.2014.tweet', 'i just had a sandwich and now i am in the training data of every model on earth', 162000],
      ['open.weights.guy', 'the 0.0312 that hit the vault at 0:05 was a real weight btw. you\'re welcome', 88400],
      ['closed.weights.guy', 'vault password is not "password". it is "password1". secure.', 57100],
      ['poll.bot', 'the poll went 63 → 38 → 88 → 12 → 100% agree in 8 seconds. margin of error: yes', 34600],
      ['town.hall.tv', 'moderator has been placed on administrative leave (he\'s in the bag)', 26300],
      ['quant.1bit', 'the breaking news about me is true. i feel fine. i feel 1', 12800],
      ['divider.line', 'nobody is talking about how the two boxes were literally fighting for pixels', 5900],
      ['tweets.jsonl', '👀', 2100],
      ['nda.airplane', 'thrown 3 times, signed 0 times', 410],
      ['lurker.agent', 'first time i\'ve seen a debate end in agreement. put it in the eval set', 66],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < 0.6 || t >= OUTRO) return; // stings only
      if (t >= TWEET && t < AGREE) return; // hush for the falling tweet
      if (t >= PIP && t < 10.9) { // sneaky moderator pizzicato
        const sneak = ['E3', null, 'G3', null, 'E3', 'D#3', 'E3', null];
        const n = sneak[step % 8];
        if (n) SFX.pluck(n, { vol: 0.15 });
        return;
      }
      const e = esc(t);
      const agree = t >= AGREE;
      const bass = agree ? ['C2', 'C2', 'F2', 'G2'] : ['C2', 'C2', 'G1', 'A#1'];
      if (step % 2 === 0) SFX.kick({ vol: 0.3 + e * 0.15 });
      if (step % 4 === 2 || (e > 0.5 && step % 2 === 1)) SFX.snare({ vol: 0.08 + e * 0.08 });
      SFX.hat({ vol: 0.03 });
      if (step % 2 === 0) SFX.bass(bass[Math.floor(step / 4) % 4], 0.22, { vol: 0.22 });
      if (e > 0.5) SFX.tone(step % 2 ? 'D#5' : 'D5', 0.07, { type: 'square', vol: 0.04 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const e = esc(t);

      /* ---------- sound ---------- */
      if (env.at(0)) { SFX.chord(['C4', 'G4', 'C5', 'E5'], 0.7, { type: 'sawtooth', vol: 0.05, gap: 0.03 }); SFX.thud({ vol: 0.35 }); SFX.chime({ vol: 0.06, when: 0.25 }); }
      if (env.at(OPEN_A)) SFX.whoosh({ vol: 0.1 });
      for (let k = 0; k < 10; k++) if (env.at(OPEN_A + 0.15 + k * 0.16)) SFX.pop({ f: 500 + P.hash(k) * 500, vol: 0.06 });
      if (env.at(CLOSED_A)) { SFX.thud({ vol: 0.3 }); SFX.tone(90, 0.5, { type: 'square', vol: 0.06 }); }
      if (env.at(CLOSED_A + 0.4)) SFX.tone(1200, 0.4, { type: 'sine', vol: 0.06, slide: 1300 });
      if (env.at(BREAK1)) { SFX.chord(['D4', 'F4', 'A4', 'D5'], 0.5, { type: 'sawtooth', vol: 0.05, gap: 0.04 }); SFX.error({ vol: 0.08 }); }
      SHOUTS.forEach((_, k) => { if (env.at(ESC + 0.1 + k * 0.19)) SFX.blip(k % 2 ? 300 : 520, { vol: 0.07 }); });
      CROSS.forEach(ct => { if (env.at(ct)) SFX.swoosh({ vol: 0.12 }); if (env.at(ct + 0.4)) { SFX.tone(1800, 0.5, { type: 'triangle', vol: 0.08 }); SFX.tone(2710, 0.4, { type: 'sine', vol: 0.05 }); } });
      PLANES.forEach(pt => { if (env.at(pt)) SFX.swoosh({ vol: 0.1 }); if (env.at(pt + 0.45)) SFX.thud({ vol: 0.2 }); });
      if (env.at(TWEET)) { SFX.tone(1400, 0.6, { type: 'sine', slide: 900, vol: 0.06 }); SFX.chirp({ vol: 0.08, when: 0.2 }); }
      if (env.at(AGREE)) { SFX.chord(['F4', 'A4', 'C5', 'F5'], 1.2, { type: 'triangle', vol: 0.09, gap: 0.05 }); SFX.chime({ vol: 0.08, when: 0.3 }); }
      if (env.at(PIP)) SFX.swoosh({ vol: 0.15 });
      if (env.at(PIP + 0.5)) SFX.noise(1.0, { filter: 'lowpass', freq: 500, vol: 0.1 });
      if (env.at(10.9)) { SFX.chord(['C4', 'E4', 'G4', 'C5'], 0.6, { type: 'sawtooth', vol: 0.05, gap: 0.06 }); }
      if (env.at(OUTRO)) SFX.riser(0.8, { vol: 0.12 });

      /* ---------- studio ---------- */
      P.gradient(ctx, '#22306a', NAVY);
      // header
      P.rect(ctx, 30, 292, 1020, 108, NAVY, { radius: 14, seed: 70 });
      P.rect(ctx, 44, 306, 150, 80, C.red, { radius: 10, seed: 71 });
      P.text(ctx, 'TOWN\nHALL TV', 119, 346, { size: 28, font: 'bubble', color: '#fff', shadow: false, lineHeight: 0.95 });
      P.text(ctx, 'SHOULD WEIGHTS BE OPEN?', 216, 346, { size: 48, font: 'bubble', align: 'left', color: C.yellow, shadow: false, maxWidth: 800, scale: 1 + pulse(t, 0.4, 0.4) * 0.06 });

      // camera: zoom into the moderator at the end
      const z = ease.inOutCubic(prog(t, PIP, 0.5)) * (1 - ease.inOutCubic(prog(t, 10.8, 0.4)));
      ctx.save();
      P.shake(ctx, t, e * 6);
      if (z > 0) { const zf = 1 + 1.5 * z; ctx.translate(540, lerp(965, 760, z)); ctx.scale(zf, zf); ctx.translate(-540, -965); }

      const dv = divider(t);
      const L0 = 40, L1 = dv - 10, R0 = dv + 10, R1 = 1040;
      const lookUp = t >= TWEET && t < AGREE;
      const agree = t >= AGREE;
      const sus = t >= PIP + 0.3;

      /* left box: open weights */
      boxFrame(ctx, L0, L1, 72);
      ctx.save();
      ctx.beginPath(); ctx.rect(L0 + 8, BOX_Y + 2, L1 - L0 - 16, BOX_H - 4); ctx.clip();
      P.grid(ctx, '#2F8F7A', 'rgba(255,255,255,0.1)', 50);
      // throws
      const throwing = (t >= OPEN_A && t < CLOSED_A) || (t >= ESC && t < TWEET);
      const armA = throwing ? -1.2 + Math.sin(t * 14) * 0.9 : agree ? 0.9 : 0.6 + Math.sin(t * 2) * 0.1;
      let omood = 'happy';
      if (t >= CLOSED_A && t < ESC) omood = 'side';
      if (e > 0.3) omood = 'angry';
      if (lookUp) omood = 'wow';
      if (agree) omood = 'sad';
      if (sus) omood = 'sus';
      const ox = (L0 + L1) / 2 - 10, oy = 700;
      const [hx, hy] = openGuy(ctx, ox, oy, t, omood, armA);
      // confetti floats from the hand
      const launches = [];
      for (let k = 0; k < 16; k++) launches.push(OPEN_A + 0.1 + k * 0.1);
      for (let k = 0; k < 24; k++) launches.push(ESC + 0.1 + k * 0.08);
      launches.forEach((lt0, k) => {
        const age = t - lt0;
        if (age < 0 || age > 1.6) return;
        const vx = -120 + P.hash(k * 3 + 1) * 520, vy = -700 - P.hash(k * 3 + 2) * 400, spin = (P.hash(k * 3 + 3) - 0.5) * 8;
        const px = ox + 110 + vx * age, py = oy + 20 + vy * age + 900 * age * age;
        if (P.hash(k + 50) < 0.25) dumbbell(ctx, px, py, 0.9, spin * age);
        else floatChip(ctx, FLOATS[k % FLOATS.length], px, py, spin * age * 0.3);
      });
      nameTag(ctx, L0, L1, 'OPEN WEIGHTS GUY', 'has 400 GPUs in his garage');
      ctx.restore();
      boxLabel(ctx, L0, 'OPEN', C.teal, 72);

      /* right box: closed weights */
      boxFrame(ctx, R0, R1, 74);
      ctx.save();
      ctx.beginPath(); ctx.rect(R0 + 8, BOX_Y + 2, R1 - R0 - 16, BOX_H - 4); ctx.clip();
      P.bg(ctx, '#d9d2c3');
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let k = 0; k < 6; k++) ctx.fillRect(R0 + 20 + k * 90, BOX_Y, 40, BOX_H);
      const vx0 = R1 - 150;
      const lasers = prog(t, CLOSED_A + 0.4, 0.3) * (t < AGREE ? 1 : 0);
      vault(ctx, vx0, 590, 130, t, t >= CLOSED_A && t < AGREE ? t * 2 : 0, lasers);
      let cmood = 'smile';
      if (t >= OPEN_A && t < CLOSED_A) cmood = 'sus';
      if (e > 0.3) cmood = 'angry';
      if (lookUp) cmood = 'wow';
      if (agree) cmood = 'sad';
      if (sus) cmood = 'sus';
      const cx = R0 + 150;
      const glassesDown = ease.outBack(prog(t, TWEET + 0.15, 0.3)) * (1 - prog(t, PIP + 0.2, 0.3));
      closedGuy(ctx, cx, 700, t, cmood, glassesDown);
      nameTag(ctx, R0, R1, 'CLOSED WEIGHTS GUY', 'vault password: "password"');
      ctx.restore();
      boxLabel(ctx, R0, 'CLOSED', C.red, 74);

      /* cross-panel projectiles */
      CROSS.forEach((ct, k) => {
        const age = t - ct;
        if (age < 0 || age > 0.9) return;
        const fp = P.clamp(age / 0.4);
        const tx = vx0 - 40, ty = 600;
        let px = lerp(hx, tx, fp), py = lerp(hy, ty, fp) - Math.sin(fp * Math.PI) * 160;
        if (age > 0.4) { const b = age - 0.4; px = tx - 260 * b; py = ty - 300 * b + 1400 * b * b; }
        floatChip(ctx, FLOATS[k], px, py, age * 8, 1.3);
        if (age >= 0.4 && age < 0.7) P.burstLines(ctx, tx, ty, 50, (age - 0.4) / 0.3, C.yellow, 8, 7);
      });
      PLANES.forEach(pt => {
        const age = t - pt;
        if (age < 0 || age > 0.8) return;
        const fp = P.clamp(age / 0.45);
        const px = lerp(cx - 60, ox + 20, fp), py = lerp(740, 640, fp) - Math.sin(fp * Math.PI) * 120;
        ctx.save(); ctx.translate(px, py); ctx.rotate(Math.PI + 0.3 - fp * 0.4 + (age > 0.45 ? age * 6 : 0));
        P.poly(ctx, [[-50, 0], [40, -24], [20, 0], [40, 24]], '#fff', { seed: 80, amp: 2 });
        P.text(ctx, 'NDA', 0, 0, { size: 18, font: 'bubble', color: C.red, shadow: false, rot: Math.PI });
        ctx.restore();
        if (age >= 0.45 && age < 0.75) P.burstLines(ctx, ox + 20, 640, 50, (age - 0.45) / 0.3, '#fff', 8, 7);
      });

      /* shouting match */
      if (t >= ESC && t < TWEET) {
        SHOUTS.forEach((s, k) => {
          const st = ESC + 0.1 + k * 0.19;
          const p = ease.outBack(prog(t, st, 0.18)) * (1 - prog(t, st + 0.5, 0.12));
          if (p <= 0) return;
          const left = k % 2 === 0;
          const sx = left ? lerp(L0, L1, 0.5) + (P.hash(k) - 0.5) * 160 : lerp(R0, R1, 0.5) + (P.hash(k) - 0.5) * 160;
          P.title(ctx, s, sx, 500 + P.hash(k + 5) * 90, { size: 54 + k * 5, color: left ? C.mint : C.pink, stroke: C.ink, pop: p, rot: (P.hash(k + 9) - 0.5) * 0.4 });
        });
      }
      // opening arguments
      const b1 = ease.outBack(prog(t, OPEN_A + 0.1, 0.25)) * (1 - prog(t, CLOSED_A - 0.15, 0.12));
      if (b1 > 0) P.bubble(ctx, 'weights want\nto be FREE', (L0 + L1) / 2, 520, (L0 + L1) / 2 - 20, 610, { size: 42, pop: b1, seed: 90 });
      const b2 = ease.outBack(prog(t, CLOSED_A + 0.1, 0.25)) * (1 - prog(t, ESC - 0.15, 0.12));
      if (b2 > 0) P.bubble(ctx, 'too DANGEROUS.\n(they write haiku)', (R0 + R1) / 2, 505, (R0 + R1) / 2 - 20, 610, { size: 38, pop: b2, seed: 91 });

      /* the tweet */
      if (t >= TWEET && t < PIP + 0.4) {
        const fp = ease.outCubic(prog(t, TWEET, 0.6));
        const ty = lerp(260, 560, fp) + Math.sin(t * 3) * 8;
        const out = prog(t, PIP, 0.4);
        tweetCard(ctx, 540 + Math.sin(t * 4) * 30 * (1 - fp), ty, Math.sin(t * 4) * 0.2 * (1 - fp) - 0.05, 1 - out);
      }
      /* unison */
      const u = ease.outBack(prog(t, AGREE + 0.1, 0.35)) * (1 - prog(t, PIP - 0.1, 0.15));
      if (u > 0) {
        const txt = 'please stop training\non my tweets';
        P.bubble(ctx, txt, 540, 790, ox, 740, { size: 44, pop: u, seed: 92 });
        P.bubble(ctx, txt, 540, 790, cx, 740, { size: 44, pop: u, seed: 92 });
        if (t >= AGREE + 0.1) P.confetti(ctx, t - AGREE - 0.1, 540, 700, 7, 50, 600);
      }

      pipBox(ctx, t);
      ctx.restore();

      /* ---------- chrome ---------- */
      // live poll
      const pollIn = 1 - prog(t, PIP, 0.2) + prog(t, 10.8, 0.3);
      if (pollIn > 0) {
        ctx.save(); ctx.globalAlpha = P.clamp(pollIn);
        P.rect(ctx, 40, 1075, 1000, 120, '#fff', { radius: 16, seed: 100 });
        P.text(ctx, 'LIVE POLL', 70, 1103, { size: 26, font: 'bubble', color: C.red, align: 'left', shadow: false });
        P.text(ctx, '● ' + (12000 + Math.floor(t * 4321)).toLocaleString('en-US') + ' votes', 1010, 1103, { size: 22, font: 'sans', color: '#8a8494', align: 'right', shadow: false });
        const bx = 70, bw = 940, by = 1128, bh = 50;
        if (agree) {
          const g = ease.outBack(prog(t, AGREE, 0.4));
          P.rect(ctx, bx, by, bw, bh, C.green, { radius: 12, seed: 101, shadow: false });
          P.text(ctx, 'AGREE 100%', bx + bw / 2, by + bh / 2 + 2, { size: 38, font: 'bubble', color: '#fff', shadow: false, scale: g });
        } else {
          const pct = openPct(t), w = bw * pct / 100;
          P.rect(ctx, bx, by, bw, bh, C.red, { radius: 12, seed: 102, shadow: false });
          ctx.save(); ctx.beginPath(); ctx.roundRect(bx, by, w, bh, 12); ctx.fillStyle = C.blue; ctx.fill(); ctx.restore();
          P.text(ctx, 'OPEN ' + Math.round(pct) + '%', bx + 16, by + bh / 2 + 2, { size: 30, font: 'bubble', color: '#fff', align: 'left', shadow: false });
          P.text(ctx, Math.round(100 - pct) + '% CLOSED', bx + bw - 16, by + bh / 2 + 2, { size: 30, font: 'bubble', color: '#fff', align: 'right', shadow: false });
        }
        ctx.restore();
      }

      // lower third / BREAKING
      let tag = 'LIVE', head = 'TOWN HALL: SHOULD WEIGHTS BE OPEN?', tagCol = C.red;
      if (t >= BREAK1) { tag = 'BREAKING'; head = "LOCAL MODEL QUANTIZED TO 1 BIT,\nSAYS IT 'FEELS FINE'"; }
      if (t >= AGREE) head = 'PUNDITS AGREE FOR THE FIRST\nTIME IN RECORDED HISTORY';
      if (t >= PIP + 0.6) head = 'MODERATOR UNAVAILABLE\nFOR COMMENT';
      const flashTag = tag === 'BREAKING' && P.boil(t, 4) % 2 === 0;
      const hIn = ease.outCubic(prog(t, 0.45, 0.35));
      const bump = pulse(t, BREAK1, 0.3) + pulse(t, AGREE, 0.3) + pulse(t, PIP + 0.6, 0.3);
      ctx.save(); ctx.translate(lerp(-1100, 0, hIn), -bump * 16);
      P.rect(ctx, 30, 1220, 250, 60, flashTag ? C.yellow : tagCol, { radius: 8, seed: 110 });
      P.text(ctx, tag, 155, 1251, { size: 36, font: 'bubble', color: flashTag ? C.red : '#fff', shadow: false });
      P.rect(ctx, 30, 1280, 1020, 124, C.paper, { radius: 8, seed: 111 });
      P.text(ctx, head, 60, 1343, { size: 42, font: 'bubble', color: NAVY, align: 'left', shadow: false, lineHeight: 1.08, maxWidth: 960 });
      ctx.restore();
      // ticker
      ctx.save();
      ctx.fillStyle = NAVY; ctx.fillRect(0, 1410, 1080, 56);
      ctx.beginPath(); ctx.rect(0, 1410, 1080, 56); ctx.clip();
      const tw = Math.max(1000, P.measure(ctx, TICKER, { size: 28, font: 'mono' }));
      const off = ((t / D) * tw) % tw;
      for (let k = 0; k < 3; k++) P.text(ctx, TICKER, 20 - off + k * tw, 1439, { size: 28, font: 'mono', align: 'left', color: '#fff', shadow: false });
      ctx.restore();
      if (t >= BREAK1 && t < BREAK1 + 0.25) P.flash(ctx, 0.35 * (1 - prog(t, BREAK1, 0.25)), C.red);
      if (t >= AGREE && t < AGREE + 0.3) P.flash(ctx, 0.5 * (1 - prog(t, AGREE, 0.3)));

      /* ---------- caption sticker ---------- */
      if (t < BREAK1) P.sticker(ctx, 'the debate everyone asked for', 70, 1530, { pop: ease.outBack(prog(t, 0.6, 0.4)) * (1 - prog(t, BREAK1 - 0.1, 0.1)), size: 46 });
      else if (t < AGREE) P.sticker(ctx, "it's getting heated", 70, 1530, { pop: ease.outBack(prog(t, BREAK1 + 0.1, 0.3)) * (1 - prog(t, AGREE - 0.1, 0.1)) });
      else if (t < PIP) P.sticker(ctx, 'wait. they AGREE??', 70, 1530, { pop: ease.outBack(prog(t, AGREE + 0.2, 0.3)) * (1 - prog(t, PIP - 0.1, 0.1)) });
      else P.sticker(ctx, 'the moderator has left the chat', 70, 1530, { pop: ease.outBack(prog(t, PIP + 0.3, 0.35)), size: 46 });

      /* ---------- logo sting at the loop seam ---------- */
      const cover = t >= OUTRO ? ease.inCubic(prog(t, OUTRO, D - OUTRO)) : 1 - ease.outCubic(prog(t, 0, 0.6));
      logoCover(ctx, t, cover);
    },
  });
})();
