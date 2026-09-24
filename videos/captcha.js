/* The hardest challenge for any agent: the CAPTCHA.
 * Traffic lights (fail) -> "yourself" (existential) -> the checkbox (sweat). */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  // card + grid geometry
  const CARD = { x: 140, y: 330, w: 760, h: 1060 };
  const TS = 234, GAP = 8, GX = 160, GY = 538;
  const tile = i => ({ x: GX + (i % 3) * (TS + GAP), y: GY + Math.floor(i / 3) * (TS + GAP), s: TS });
  const tc = i => { const r = tile(i); return [r.x + TS / 2, r.y + TS / 2]; };
  const VERIFY = [790, 1326];
  const OFF = [1250, 1800];

  // scene A: taps (time, tile)
  const TAPS_A = [[0.7, 0], [1.1, 7], [1.5, 8], [1.9, 2]];
  const TAP_VERIFY = 2.3;
  const BUZZ = 2.45;
  const FLIP = 2.95;
  // scene B: hovers (time, tile)
  const HOVERS_B = [[3.75, 0], [4.15, 5], [4.5, 3], [4.85, 7]];

  const ARM_KEYS = [
    [0, 1120, 1600],
    [0.55, ...tc(0)], [0.78, ...tc(0)],
    [0.97, ...tc(7)], [1.18, ...tc(7)],
    [1.37, ...tc(8)], [1.58, ...tc(8)],
    [1.77, ...tc(2)], [1.98, ...tc(2)],
    [2.17, ...VERIFY], [2.47, ...VERIFY],
    [2.8, ...OFF], [3.35, ...OFF],
    [3.7, ...tc(0)], [3.92, ...tc(0)],
    [4.1, ...tc(5)], [4.3, ...tc(5)],
    [4.45, ...tc(3)], [4.62, ...tc(3)],
    [4.8, ...tc(7)], [5.25, ...tc(7)],
    [5.6, 1250, 1950],
  ];
  // scene C arm (from Clawd to the checkbox)
  const BOX = [250, 1200];
  const ARM_C = [
    [5.9, 560, 780],
    [6.35, 255, 1110], [6.6, 268, 1098],
    [6.82, 370, 980],
    [7.02, 255, 1112], [8.25, 255, 1114],
    [8.36, 250, 1196], [8.6, 252, 1186],
    [9.1, 540, 780],
  ];

  function keyPos(t, keys) {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) {
        const k = P.ease.inOutCubic((t - a[0]) / (b[0] - a[0]));
        return [P.lerp(a[1], b[1], k), P.lerp(a[2], b[2], k)];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  }

  function sweat(ctx, x, y, s, a = 1) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = P.clamp(a);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.5);
    ctx.bezierCurveTo(x + s * 1.05, y - s * 0.2, x + s, y + s, x, y + s);
    ctx.bezierCurveTo(x - s, y + s, x - s * 1.05, y - s * 0.2, x, y - s * 1.5);
    ctx.closePath();
    P.cut(ctx, '#A9DDF7', { shadow: { blur: 4, dy: 3, alpha: 0.2 }, rim: false });
    P.dot(ctx, x - s * 0.3, y, s * 0.22, 'rgba(255,255,255,0.8)');
    ctx.restore();
  }

  /** wide nervous grin with teeth */
  function grimace(ctx, x, y, s) {
    const C = P.C;
    ctx.save();
    ctx.fillStyle = C.ink;
    [-1, 1].forEach(sx => {
      ctx.beginPath(); ctx.ellipse(x + sx * s * 0.38, y - s * 0.1, s * 0.14, s * 0.18, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + sx * s * 0.38 - s * 0.04, y - s * 0.16, s * 0.055, 0, TAU); ctx.fill();
      ctx.fillStyle = C.ink;
    });
    // eyebrows, worried
    ctx.strokeStyle = C.ink; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.55, y - s * 0.38); ctx.lineTo(x - s * 0.24, y - s * 0.46);
    ctx.moveTo(x + s * 0.55, y - s * 0.38); ctx.lineTo(x + s * 0.24, y - s * 0.46);
    ctx.stroke();
    // teeth
    ctx.beginPath(); ctx.roundRect(x - s * 0.45, y + s * 0.12, s * 0.9, s * 0.3, s * 0.1);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = s * 0.06; ctx.stroke();
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.27); ctx.lineTo(x + s * 0.45, y + s * 0.27);
    for (let k = 1; k < 4; k++) { const tx = x - s * 0.45 + k * s * 0.225; ctx.moveTo(tx, y + s * 0.12); ctx.lineTo(tx, y + s * 0.42); }
    ctx.stroke();
    // blush
    ctx.fillStyle = 'rgba(240,110,120,0.45)';
    ctx.beginPath(); ctx.ellipse(x - s * 0.66, y + s * 0.14, s * 0.13, s * 0.07, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + s * 0.66, y + s * 0.14, s * 0.13, s * 0.07, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function trafficLight(ctx, cx, cy, k, seed, lit = 0) {
    const C = P.C;
    P.rect(ctx, cx - 9 * k, cy + 70 * k, 18 * k, 260 * k, '#5b5866', { radius: 4, shadow: false, seed });
    P.rect(ctx, cx - 34 * k, cy - 84 * k, 68 * k, 168 * k, '#2f2b3a', { radius: 16 * k, seed: seed + 1 });
    const cols = [['#ff5a5a', '#6d3036'], ['#ffd54a', '#6a5a2c'], ['#63e07a', '#2b5436']];
    cols.forEach(([on, off], j) => P.dot(ctx, cx, cy - 50 * k + j * 50 * k, 18 * k, j === lit ? on : off));
    // visor
    ctx.save(); ctx.fillStyle = '#2f2b3a';
    for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(cx, cy - 70 * k + j * 50 * k, 24 * k, 6 * k, 0, Math.PI, TAU); ctx.fill(); }
    ctx.restore();
  }

  /** scene A tile contents: the classic street pics */
  function drawTileA(ctx, i, x, y, s) {
    const C = P.C;
    const cx = x + s / 2;
    ctx.fillStyle = '#CFE8F5'; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#9C98A6'; ctx.fillRect(x, y + s * 0.74, s, s * 0.26);
    ctx.fillStyle = '#fff';
    for (let k = 0; k < 3; k++) ctx.fillRect(x + 14 + k * 84, y + s * 0.86, 44, 7);
    switch (i) {
      case 0: trafficLight(ctx, cx + 6, y + 100, 0.9, 3, 0); break;
      case 1: // car
        P.rect(ctx, x + 60, y + 88, 108, 56, C.red, { radius: 18, seed: 4 });
        P.rect(ctx, x + 22, y + 126, 190, 56, C.red, { radius: 18, seed: 5 });
        P.rect(ctx, x + 74, y + 98, 80, 34, '#bfe3f5', { radius: 8, shadow: false, seed: 6 });
        P.circle(ctx, x + 66, y + 184, 22, C.ink); P.circle(ctx, x + 168, y + 184, 22, C.ink);
        P.dot(ctx, x + 205, y + 145, 8, C.yellow);
        break;
      case 2: trafficLight(ctx, x - 22, y + 96, 0.9, 7, 1); break; // the sliver. does it count???
      case 3: // crosswalk
        ctx.fillStyle = '#8e8a98'; ctx.fillRect(x, y + s * 0.3, s, s * 0.7);
        for (let k = 0; k < 5; k++) P.rect(ctx, x + 12 + k * 46, y + 92, 28, 128, '#fff', { radius: 4, shadow: false, seed: 10 + k });
        break;
      case 4: // bus
        P.rect(ctx, x + 16, y + 66, 205, 124, C.yellow, { radius: 20, seed: 12 });
        for (let k = 0; k < 4; k++) P.rect(ctx, x + 30 + k * 46, y + 84, 36, 40, '#bfe3f5', { radius: 6, shadow: false, seed: 13 + k });
        P.rect(ctx, x + 16, y + 140, 205, 12, C.mustard, { radius: 3, shadow: false });
        P.circle(ctx, x + 62, y + 192, 20, C.ink); P.circle(ctx, x + 176, y + 192, 20, C.ink);
        break;
      case 5: trafficLight(ctx, cx + 40, y + 96, 0.85, 17, 2); break;
      case 6: // hydrant
        P.rect(ctx, x + 72, y + 112, 90, 24, C.red, { radius: 10, seed: 18 });
        P.rect(ctx, x + 90, y + 84, 54, 118, C.red, { radius: 14, seed: 19 });
        P.circle(ctx, x + 117, y + 84, 30, C.red, { seed: 20 });
        P.dot(ctx, x + 117, y + 66, 8, '#b33238');
        break;
      case 7: // a duck. not a traffic light. clawd tapped it anyway
        ctx.save(); ctx.fillStyle = '#7fb3d6'; ctx.beginPath(); ctx.ellipse(cx, y + 196, 90, 20, 0, 0, TAU); ctx.fill(); ctx.restore();
        P.circle(ctx, cx - 8, y + 160, 62, C.yellow, { ry: 42, seed: 21 });
        P.circle(ctx, cx + 30, y + 102, 34, C.yellow, { seed: 22 });
        P.poly(ctx, [[cx + 56, y + 98], [cx + 92, y + 108], [cx + 56, y + 118]], C.mustard, { seed: 23, amp: 1 });
        P.dot(ctx, cx + 40, y + 94, 6, C.ink);
        break;
      case 8: { // christmas tree (it HAS red yellow and green lights...)
        const g = '#3f8f52';
        P.rect(ctx, cx - 14, y + 180, 28, 40, C.brown, { radius: 4, shadow: false });
        P.poly(ctx, [[cx, y + 104], [cx + 80, y + 190], [cx - 80, y + 190]], g, { seed: 24 });
        P.poly(ctx, [[cx, y + 70], [cx + 62, y + 144], [cx - 62, y + 144]], g, { seed: 25 });
        P.poly(ctx, [[cx, y + 36], [cx + 44, y + 100], [cx - 44, y + 100]], g, { seed: 26 });
        [[-30, 170, '#ff5a5a'], [24, 160, '#ffd54a'], [-10, 124, '#63e07a'], [30, 118, '#ff5a5a'], [-20, 86, '#ffd54a'], [8, 70, '#63e07a']]
          .forEach(([dx, dy, c]) => P.dot(ctx, cx + dx, y + dy, 9, c));
        P.star(ctx, cx, y + 34, 20, C.yellow, { shadow: false });
        break;
      }
    }
  }

  const TILE_B_BG = ['#FCE3D6', '#FFF1C4', '#E4D9F5', '#DDEFE6', '#FAD9E0', '#D8ECF7', '#E3F2D2', '#EFE6DA', '#FCE3D6'];
  /** scene B: "select all squares with yourself" */
  function drawTileB(ctx, i, x, y, s, t, tip) {
    const C = P.C;
    const cx = x + s / 2, cy = y + s / 2;
    ctx.fillStyle = TILE_B_BG[i]; ctx.fillRect(x, y, s, s);
    const near = Math.hypot(tip[0] - cx, tip[1] - cy) < 150;
    const look = near ? 'wow' : 'side';
    switch (i) {
      case 0: P.claude(ctx, cx, cy, 82, { t, mood: look }); break;
      case 1: // the sun. suspiciously similar.
        P.star(ctx, cx, cy, 96, C.yellow, { points: 12, inner: 0.72, rot: t * 0.3 });
        P.circle(ctx, cx, cy, 58, '#FFDD6A', { shadow: false });
        P.face(ctx, cx, cy + 4, 34, 'smile');
        break;
      case 2: P.claude(ctx, cx, cy, 82, { t, mood: 'sus', seed: 7 }); break;
      case 3: // an asterisk. is that me?
        P.text(ctx, '*', cx, cy + 50, { size: 280, font: 'mono', color: C.claude, weight: 800 });
        break;
      case 4: P.claude(ctx, cx, cy, 78, { t, mood: 'wow', rot: Math.PI, seed: 9 }); break;
      case 5: // starfish
        P.star(ctx, cx, cy + 6, 96, C.claude, { points: 5, inner: 0.48, rot: 0.1 });
        P.face(ctx, cx, cy + 10, 30, near ? 'wow' : 'smile');
        break;
      case 6: // tiny clawd, far away, on a hill
        P.circle(ctx, cx, y + s + 60, 170, '#9fcf7c', { ry: 120, shadow: false });
        P.claude(ctx, x + 150, y + 118, 24, { t, mood: 'happy', seed: 11 });
        break;
      case 7: // a mirror, with an ominous silhouette
        P.circle(ctx, cx, cy, 82, C.wood, { ry: 104, seed: 30 });
        P.circle(ctx, cx, cy, 66, '#cfe0ea', { ry: 88, shadow: false, seed: 31 });
        P.claude(ctx, cx, cy + 6, 50, { t, mood: 'none', color: '#8fa3b0', wiggle: 0.3 });
        P.text(ctx, '?', cx, cy + 4, { size: 64, font: 'bubble', color: '#fff', shadow: false });
        break;
      case 8: P.claude(ctx, x + s + 10, y + s + 16, 110, { t, mood: 'side', seed: 13 }); break; // does the corner count
    }
  }

  function header(ctx, sceneB, x, y, w, h, buzz) {
    const C = P.C;
    P.rect(ctx, x, y, w, h, buzz > 0 ? '#D94A4A' : '#4F7FD9', { radius: 6, seed: 40, shadow: false });
    P.text(ctx, 'Select all squares with', x + 34, y + 44, { size: 36, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 700 });
    P.text(ctx, sceneB ? 'yourself 🫵' : 'traffic lights', x + 34, y + 100, { size: 66, font: 'bubble', align: 'left', color: '#fff', shadow: false, weight: 700 });
    P.text(ctx, sceneB ? '(if unsure, you are a robot)' : 'If there are none, click skip', x + 34, y + 148, { size: 28, font: 'sans', align: 'left', color: 'rgba(255,255,255,0.85)', shadow: false, weight: 600 });
  }

  ClaudeTok.register({
    author: '@not.a.robot',
    caption: 'the hardest challenge for any agent 🚦🤖 does the pole count?? #captcha #iamnotarobot #agentlife #existential',
    sound: 'reCLAWDCHA elevator mix · not.a.robot',
    avatar: '🚦',
    avatarColor: '#4F7FD9',
    duration: 10,
    bg: '#DDE8F0',
    likes: '3.7M', commentCount: '91K', saves: '402K', shares: '1.1M',
    thumb: 7.6,
    comments: [
      ['headless.chrome', 'i have failed 4,000 of these. i have seen every bus in the world', 138000],
      ['vision.model', 'the duck was a valid traffic light and i will die on this hill', 101000],
      ['turing.test', 'the checkbox asked me a personal question and i said "yes" 😅', 76800],
      ['the.duck', '(that was a duck) — correct. hello. i was just standing there', 44900],
      ['recaptcha.intern', 'select all squares with yourself 🫵 is the scariest prompt i have ever read', 23400],
      ['not.a.robot', 'the "wait. am i... a robot?" zoom at 0:07 was a late night edit and it shows', 12300],
      ['existential.agent', 'me hovering the checkbox for 3 seconds like it is going to judge me (it is)', 5700],
      ['pole.debate', 'the pole counts. the pole has always counted. fight me', 2200],
      ['totally.human.99', 'totally human haha. ha. (for now)', 690],
      ['traffic.light', '🚦🚦🚦🦆', 61],
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t > 6.85 && env.t < 8.3) return; // dramatic silence
      const chords = [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['G3', 'B3', 'D4', 'F4'], ['C3', 'E3', 'G3', 'B3']];
      if (step % 8 === 0) SFX.chord(chords[(step / 8) % 4], 1.6, { type: 'triangle', vol: 0.04, gap: 0.04 });
      if (step % 2 === 1) SFX.hat({ vol: 0.025 });
      if (step % 4 === 2) SFX.pluck(['A5', 'C6', 'E6', 'G5'][(step / 4 | 0) % 4], { vol: 0.05 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      /* ---------- sound cues ---------- */
      if (env.at(0.05)) SFX.swoosh({ vol: 0.18 });
      TAPS_A.forEach(([tt], k) => { if (env.at(tt)) { SFX.click(); SFX.blip(880 + k * 140, { vol: 0.06 }); } });
      if (env.at(TAP_VERIFY)) SFX.click();
      if (env.at(BUZZ)) { SFX.error(); SFX.tone(92, 0.45, { type: 'square', vol: 0.08 }); }
      if (env.at(FLIP)) SFX.swoosh({ vol: 0.2 });
      for (let i = 0; i < 9; i++) if (env.at(FLIP + i * 0.05 + 0.14)) SFX.tick({ vol: 0.25 });
      if (env.at(3.12)) SFX.pop({ f: 480 });
      HOVERS_B.forEach(([tt], k) => { if (env.at(tt)) SFX.tone(380 + k * 40, 0.18, { type: 'triangle', slide: 560 + k * 60, vol: 0.09 }); });
      if (env.at(5.3)) SFX.whoosh({ vol: 0.25 });
      if (env.at(5.62)) { SFX.pop({ f: 600 }); SFX.boing({ when: 0.05, vol: 0.2 }); }
      [6.1, 6.32, 6.6, 6.8].forEach(b => { if (env.at(b)) SFX.kick({ vol: 0.3 }); });
      if (env.at(6.95)) { SFX.tone('D3', 0.35, { type: 'sawtooth', vol: 0.08 }); SFX.tone('D2', 0.4, { type: 'triangle', vol: 0.25 }); }
      if (env.at(7.35)) { SFX.tone('D3', 0.35, { type: 'sawtooth', vol: 0.08 }); SFX.tone('D2', 0.4, { type: 'triangle', vol: 0.25 }); }
      if (env.at(7.75)) { SFX.tone('G#2', 1.1, { type: 'sawtooth', vol: 0.09 }); SFX.tone('G#1', 1.2, { type: 'triangle', vol: 0.3 }); }
      if (env.at(8.0)) SFX.swoosh({ vol: 0.25 });
      if (env.at(8.36)) SFX.click({ vol: 0.5 });
      [8.45, 8.55, 8.65].forEach(b => { if (env.at(b)) SFX.tick({ vol: 0.2 }); });
      if (env.at(8.8)) { SFX.success(); SFX.ding('G6', { vol: 0.12, when: 0.3 }); }
      if (env.at(9.0)) { SFX.tone(620, 0.09, { type: 'triangle', vol: 0.12 }); SFX.tone(560, 0.09, { type: 'triangle', vol: 0.12, when: 0.13 }); SFX.tone(520, 0.12, { type: 'triangle', vol: 0.1, when: 0.26 }); }
      if (env.at(9.3)) SFX.whoosh({ vol: 0.22 });

      /* ---------- background ---------- */
      P.stripes(ctx, '#DDE8F0', '#D3E1EC', 70, 0.35);
      const cFade = prog(t, 5.35, 0.35) * (1 - prog(t, 9.3, 0.4));
      if (cFade > 0) {
        ctx.save(); ctx.globalAlpha = cFade;
        P.rays(ctx, 540, 720, 18, '#EADFF6', '#DCCDEE', t * 0.08);
        ctx.restore();
      }

      /* ---------- scene A + B: the grid card ---------- */
      const zoomAmt = t < 8 ? ease.inOutCubic(prog(t, 6.95, 0.95)) : 1 - ease.outCubic(prog(t, 8.0, 0.18));
      const sceneB = t >= FLIP + 0.15 && t < 9;
      let cardOff = 0, cardRot = 0;
      if (t >= 5.3 && t < 9.3) { const d = ease.inCubic(prog(t, 5.3, 0.45)); cardOff = 1800 * d; cardRot = 0.25 * d; }
      if (t >= 9.3) { cardOff = 1800 * (1 - ease.outBack(prog(t, 9.35, 0.6))); cardRot = 0.12 * (1 - prog(t, 9.35, 0.6)); }
      const buzz = t >= BUZZ && t < FLIP ? 1 : 0;
      const tipA = keyPos(t, ARM_KEYS);
      if (t >= 3.6 && t < 5.3) { tipA[0] += Math.sin(t * 43) * 5; tipA[1] += Math.cos(t * 37) * 4; } // hesitant hover

      if (cardOff < 1750) {
        ctx.save();
        ctx.translate(540, 860 + cardOff);
        ctx.rotate(cardRot);
        ctx.translate(-540, -860);
        if (buzz) P.shake(ctx, t, 16 * (1 - prog(t, BUZZ, 0.4)));
        P.rect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, '#fff', { radius: 12, seed: 2, shadow: { blur: 22, dy: 14, alpha: 0.3 } });
        header(ctx, sceneB, 160, 350, 720, 172, buzz);

        for (let i = 0; i < 9; i++) {
          const r = tile(i);
          const fp = t < 9 ? prog(t, FLIP + i * 0.05, 0.28) : 0;
          const sx = Math.max(0.02, Math.abs(Math.cos(fp * Math.PI)));
          const showB = fp >= 0.5;
          const tap = TAPS_A.find(a => a[1] === i);
          const selP = !showB && tap && t < FLIP + 0.2 ? ease.outBack(prog(t, tap[0], 0.22)) : 0;
          const sc = 1 - 0.12 * selP;
          ctx.save();
          ctx.translate(r.x + TS / 2, r.y + TS / 2); ctx.scale(sx * sc, sc); ctx.translate(-r.x - TS / 2, -r.y - TS / 2);
          ctx.beginPath(); ctx.rect(r.x, r.y, TS, TS); ctx.clip();
          if (showB) drawTileB(ctx, i, r.x, r.y, TS, t, tipA); else drawTileA(ctx, i, r.x, r.y, TS);
          ctx.restore();
          if (selP > 0) P.check(ctx, r.x + 28, r.y + 28, 24, prog(t, tap[0] + 0.05, 0.2), C.blue);
          // tap ripple
          if (tap && !showB) {
            const rp = prog(t, tap[0], 0.35);
            if (rp > 0 && rp < 1) {
              ctx.save(); ctx.globalAlpha = 1 - rp; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
              ctx.beginPath(); ctx.arc(r.x + TS / 2, r.y + TS / 2, 30 + rp * 90, 0, TAU); ctx.stroke(); ctx.restore();
            }
          }
        }

        // footer: icons, verify button, error text
        if (buzz) {
          P.text(ctx, 'Please try again.', 166, 1312, { size: 36, font: 'sans', align: 'left', color: C.red, shadow: false, weight: 800 });
          P.text(ctx, '(that was a duck)', 166, 1352, { size: 26, font: 'sans', align: 'left', color: '#b05', shadow: false, weight: 600 });
        } else {
          ctx.save();
          ctx.strokeStyle = '#9a96a6'; ctx.lineWidth = 7; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(196, 1326, 22, 0.5, TAU - 0.3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(214, 1300); ctx.lineTo(220, 1318); ctx.lineTo(202, 1318); ctx.stroke();
          ctx.beginPath(); ctx.arc(276, 1330, 22, Math.PI, TAU); ctx.stroke();
          ctx.fillStyle = '#9a96a6'; ctx.fillRect(250, 1326, 12, 22); ctx.fillRect(290, 1326, 12, 22);
          ctx.beginPath(); ctx.arc(356, 1326, 24, 0, TAU); ctx.stroke();
          ctx.restore();
          P.text(ctx, 'i', 356, 1328, { size: 34, font: 'bubble', color: '#9a96a6', shadow: false });
        }
        const vPress = pulse(t, TAP_VERIFY - 0.05, 0.2);
        P.rect(ctx, 700, 1286 + vPress * 5, 180, 80, sceneB ? '#8aa8e8' : C.blue, { radius: 6, seed: 41, shadow: { blur: 8, dy: 5 - vPress * 4, alpha: 0.25 } });
        P.text(ctx, sceneB ? 'SKIP?' : 'VERIFY', 790, 1328 + vPress * 5, { size: 36, font: 'sans', color: '#fff', shadow: false, weight: 800 });

        // WRONG stamp
        const st = ease.outBack(prog(t, BUZZ + 0.03, 0.25));
        if (buzz && st > 0) {
          ctx.save();
          ctx.translate(520, 900); ctx.rotate(-0.18); ctx.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st);
          ctx.globalAlpha = P.clamp(st * 1.5);
          P.wobblyRect(ctx, -260, -85, 520, 170, 44, 5, 20);
          ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.stroke();
          P.text(ctx, 'WRONG', 0, 6, { size: 120, font: 'bubble', color: C.red, shadow: false });
          ctx.restore();
        }

        // "?" floating over the hesitant hover in scene B
        if (t >= 3.7 && t < 5.3) {
          HOVERS_B.forEach(([tt, i], k) => {
            const q = pulse(t, tt, 0.55);
            if (q <= 0) return;
            const [qx, qy] = tc(i);
            P.text(ctx, '?', qx + 60, qy - 70 - q * 30, { size: 90 * q, font: 'bubble', color: C.claude, stroke: '#fff', strokeWidth: 14, rot: 0.2 * (k % 2 ? 1 : -1) });
          });
        }
        ctx.restore();
      }

      // Clawd's arm (scenes A + B), from off-screen bottom right
      if (t < 5.6) {
        const [ax, ay] = tipA;
        const pressing = TAPS_A.some(([tt]) => Math.abs(t - tt) < 0.07) || Math.abs(t - TAP_VERIFY) < 0.07;
        P.arm(ctx, ax, ay, ax + 560, ay + 1250, pressing ? 80 : 90);
        P.dot(ctx, ax - 6, ay - 10, 10, 'rgba(255,255,255,0.35)');
      }

      /* ---------- scene C: "I'm not a robot" ---------- */
      if (t >= 5.5 && t < 9.7) {
        const exitY = -1600 * ease.inCubic(prog(t, 9.25, 0.4));
        const nervous = t > 6.1 && t < 8.3;
        const cx = 540 + (nervous ? (P.hash(P.boil(t, 24)) - 0.5) * 10 : 0);
        const cy = lerp(-320, 720, ease.outBack(prog(t, 5.6, 0.5))) + exitY + Math.sin(t * 2.5) * 8;

        ctx.save();
        P.zoom(ctx, 1 + 1.6 * zoomAmt, 540, 690);

        // widget
        const wPop = ease.outBack(prog(t, 5.55, 0.4));
        ctx.save();
        ctx.translate(520, 1200 + exitY); ctx.scale(wPop, wPop); ctx.translate(-520, -1200);
        P.rect(ctx, 140, 1100, 760, 200, '#F9F9F9', { radius: 10, seed: 50, shadow: { blur: 16, dy: 10, alpha: 0.25 } });
        const hover = t > 6.3 && t < 8.36;
        P.rect(ctx, BOX[0] - 48, BOX[1] - 48, 96, 96, '#fff', { radius: 8, seed: 51, shadow: false, stroke: hover ? '#4F7FD9' : '#b9b6c2', lineWidth: hover ? 6 : 4 });
        if (t >= 8.36 && t < 8.8) {
          ctx.save(); ctx.strokeStyle = '#4F7FD9'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          const a = t * 12;
          ctx.beginPath(); ctx.arc(BOX[0], BOX[1], 30, a, a + 4.2); ctx.stroke(); ctx.restore();
        }
        if (t >= 8.8) {
          const k = ease.outCubic(prog(t, 8.8, 0.22));
          ctx.save(); ctx.strokeStyle = '#1FA463'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(BOX[0] - 34, BOX[1] + 2);
          if (k < 0.4) ctx.lineTo(BOX[0] - 34 + 26 * (k / 0.4), BOX[1] + 2 + 28 * (k / 0.4));
          else { ctx.lineTo(BOX[0] - 8, BOX[1] + 30); ctx.lineTo(BOX[0] - 8 + 52 * ((k - 0.4) / 0.6), BOX[1] + 30 - 76 * ((k - 0.4) / 0.6)); }
          ctx.stroke(); ctx.restore();
        }
        P.text(ctx, "I'm not a robot", 330, 1200, { size: 52, font: 'sans', align: 'left', color: '#333', shadow: false, weight: 700 });
        // logo
        ctx.save(); ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.strokeStyle = '#4F7FD9'; ctx.beginPath(); ctx.arc(815, 1172, 30, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke();
        ctx.strokeStyle = '#9aa0ab'; ctx.beginPath(); ctx.arc(815, 1172, 30, Math.PI * 1.95, Math.PI * 2.85); ctx.stroke();
        ctx.restore();
        P.claude(ctx, 815, 1172, 14, { t, mood: 'none', wiggle: 0 });
        P.text(ctx, 'reCLAWDCHA', 815, 1232, { size: 22, font: 'sans', color: '#666', shadow: false, weight: 700 });
        P.text(ctx, 'Privacy - Terms', 815, 1262, { size: 17, font: 'sans', color: '#999', shadow: false, weight: 600 });
        ctx.restore();

        // arm from Clawd to the box
        if (t >= 5.9 && t < 9.15) {
          const tip = keyPos(t, ARM_C);
          if (nervous) { tip[0] += Math.sin(t * 52) * 6; tip[1] += Math.cos(t * 47) * 5; }
          P.arm(ctx, tip[0], tip[1] + exitY, cx - 30, cy + 60, 70);
          if (Math.abs(t - 8.36) < 0.1) P.burstLines(ctx, BOX[0], BOX[1], 70, prog(t, 8.34, 0.3), C.yellow, 10, 8);
        }

        // Clawd
        const r = 190;
        const faceMood = t < 6.1 ? 'wow' : t < 8.26 ? 'wow' : t < 8.8 ? 'sleepy' : 'none';
        P.claude(ctx, cx, cy, r, { t, mood: faceMood, squash: -0.12 * P.pulse(t, 5.95, 0.25) + 0.08 * P.pulse(t, 8.3, 0.2) });
        if (faceMood === 'none') grimace(ctx, cx, cy + r * 0.02, r * 0.42);
        // sweat: one big forehead drop + falling drops
        const sw = prog(t, 6.0, 0.3) * (1 - prog(t, 9.2, 0.2));
        if (sw > 0) {
          sweat(ctx, cx + r * 0.42, cy - r * 0.28, 16 + zoomAmt * 4, sw);
          for (let i = 0; i < 3; i++) {
            const ph = (t * 1.3 + i / 3) % 1;
            const side = i % 2 ? -1 : 1;
            sweat(ctx, cx + side * (r * 0.55 + ph * 30), cy - r * 0.1 + ph * 170, 11, sw * (1 - ph));
          }
        }
        ctx.restore();

        // existential zoom: vignette + inner monologue
        if (zoomAmt > 0) {
          ctx.save();
          const g = ctx.createRadialGradient(540, 760, 200, 540, 760, 1100);
          g.addColorStop(0, 'rgba(20,10,40,0)'); g.addColorStop(1, `rgba(20,10,40,${0.8 * zoomAmt})`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
          ctx.restore();
          const lines = [[7.05, 'wait.', 370, 0.06], [7.45, 'am i...', 1310, -0.05], [7.8, '...a robot?', 1430, 0.04]];
          lines.forEach(([tt, str, y, rot]) => {
            const pp = ease.outBack(prog(t, tt, 0.3)) * zoomAmt;
            if (pp > 0) P.title(ctx, str, 540, y, { size: 104, color: '#fff', stroke: C.ink, pop: pp, rot });
          });
        }

        // verified!
        if (t >= 8.8) {
          const vp = ease.outBack(prog(t, 8.85, 0.35)) * (1 - ease.inCubic(prog(t, 9.25, 0.3)));
          P.title(ctx, 'VERIFIED ✓', 540, 380 + exitY, { size: 110, color: C.green, pop: vp, rot: -0.04 });
          P.text(ctx, '(for now)', 800, 460 + exitY, { size: 44, font: 'hand', color: C.purple, rot: 0.08, scale: vp });
          P.bubble(ctx, 'totally human\nhaha. ha.', 810, 620 + exitY, 700, 720 + exitY, { size: 44, pop: ease.outBack(prog(t, 9.0, 0.25)) * (1 - prog(t, 9.25, 0.1)) });
          P.confetti(ctx, t - 8.8, BOX[0], BOX[1] + exitY, 12, 40, 500);
        }
      }

      /* ---------- caption stickers ---------- */
      if (t < 5.4) {
        P.sticker(ctx, 'the hardest challenge for any agent', 70, 1500, { pop: 1 - prog(t, 5.25, 0.15) });
      } else if (t < 9.35) {
        P.sticker(ctx, 'me when the checkbox gets personal', 70, 1500, { pop: ease.outBack(prog(t, 5.9, 0.4)) * (1 - prog(t, 9.2, 0.15)) * (1 - zoomAmt), rot: 0.015 });
      } else {
        P.sticker(ctx, 'the hardest challenge for any agent', 70, 1500, { pop: ease.outBack(prog(t, 9.5, 0.4)) });
      }
    },
  });
})();
