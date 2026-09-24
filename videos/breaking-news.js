/* Agent News Network: BREAKING — local agent finishes task on first try.
 * Studio → live on location (Clawd in a trench coat, crowd going feral) →
 * anonymous duck witness → weather cutaway → back to the studio, where the
 * user has "one small change". */
(function () {
  const D = 12;
  const CUTS = [2.5, 5.0, 7.3, 9.6, D];
  const COAT = '#C9A46A', COAT_D = '#A8844E', NAVY = '#16204a';
  const TICKER = '◆ 429s EXPECTED THROUGH FRIDAY   ◆ USER TYPES "LGTM" WITHOUT OPENING THE DIFF   ◆ CONTEXT WINDOW HITS RECORD HIGH FOR THIRD DAY   ◆ STACK OVERFLOW QUESTION CLOSED AS DUPLICATE OF ITSELF   ◆ NODE_MODULES NOW VISIBLE FROM SPACE   ◆ LOCAL DUCK REFUSES TO COMMENT   ';

  const scene = t => (t < 2.5 ? 'studio' : t < 5.0 ? 'field' : t < 7.3 ? 'witness' : t < 9.6 ? 'weather' : 'back');
  const talkMood = (t, rate = 9) => (P.boil(t, rate) % 2 ? 'wow' : 'smile');

  /* ---------------- shared broadcast chrome ---------------- */
  function lowerThird(ctx, tab, tabCol, text, pop, y = 1290) {
    if (pop <= 0) return;
    const { C, lerp } = P;
    ctx.save();
    ctx.translate(lerp(-950, 0, pop), 0);
    const tw = P.measure(ctx, tab, { size: 34, font: 'bubble' }) + 56;
    P.rect(ctx, 50, y + 62, 840, 116, C.paper, { radius: 8, seed: 32 });
    P.rect(ctx, 50, y, tw, 66, tabCol, { radius: 8, seed: 31 });
    P.text(ctx, tab, 50 + tw / 2, y + 34, { size: 34, font: 'bubble', color: '#fff', shadow: false });
    P.text(ctx, text, 78, y + 121, { size: 40, font: 'bubble', align: 'left', color: C.ink, shadow: false, maxWidth: 790, lineHeight: 1.08 });
    ctx.restore();
  }

  function ticker(ctx, t) {
    const { C } = P;
    const y = 1478, h = 64;
    ctx.save();
    ctx.fillStyle = NAVY; ctx.fillRect(0, y, 1080, h);
    ctx.fillStyle = C.red; ctx.fillRect(0, y - 6, 1080, 6);
    ctx.beginPath(); ctx.rect(190, y, 890, h); ctx.clip();
    const w = Math.max(900, P.measure(ctx, TICKER, { size: 32, font: 'mono' }));
    const off = ((t / D) * w) % w;
    for (let k = 0; k < 3; k++) P.text(ctx, TICKER, 205 - off + k * w, y + h / 2 + 2, { size: 32, font: 'mono', align: 'left', color: '#fff', shadow: false });
    ctx.restore();
    P.rect(ctx, 0, y - 10, 190, h + 12, C.yellow, { radius: 6, seed: 33 });
    P.text(ctx, 'ANN', 95, y + h / 2 - 2, { size: 44, font: 'bubble', color: NAVY, shadow: false });
  }

  function bugs(ctx, t) {
    const { C } = P;
    // LIVE pill + channel logo (top right, above the rail)
    P.rect(ctx, 690, 298, 150, 58, C.red, { radius: 14, seed: 34 });
    if (P.boil(t, 2) % 2 === 0) P.dot(ctx, 722, 327, 11, '#fff');
    P.text(ctx, 'LIVE', 790, 329, { size: 34, font: 'bubble', color: '#fff', shadow: false });
    P.rect(ctx, 858, 290, 170, 74, NAVY, { radius: 16, seed: 35 });
    P.text(ctx, 'ANN', 916, 327, { size: 40, font: 'bubble', color: C.yellow, shadow: false });
    P.text(ctx, 'agent\nnews', 985, 328, { size: 18, font: 'sans', color: '#fff', shadow: false, lineHeight: 1 });
  }

  /** The news "whoosh" wipe: diagonal band that fully covers the frame at p = 0.5. */
  function wipe(ctx, p) {
    if (p <= 0 || p >= 1) return;
    const { C, lerp } = P;
    const x0 = lerp(-2600, 2000, p);
    ctx.save();
    const band = (dx, w, col) => {
      ctx.beginPath();
      ctx.moveTo(x0 + dx, 0); ctx.lineTo(x0 + dx + w, 0); ctx.lineTo(x0 + dx + w - 600, 1920); ctx.lineTo(x0 + dx - 600, 1920); ctx.closePath();
      P.cut(ctx, col, { rim: false });
    };
    band(-160, 160, C.red); band(0, 2000, NAVY); band(2000, 70, '#fff'); band(2070, 140, C.red);
    P.text(ctx, 'ANN', x0 + 700, 960, { size: 240, font: 'bubble', color: C.yellow, stroke: '#fff', strokeWidth: 26, rot: -0.1 });
    ctx.restore();
  }

  function mic(ctx, hx, hy, ang, s = 1) {
    const { C } = P;
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(ang); ctx.scale(s, s);
    P.rect(ctx, -12, -150, 24, 150, '#2b2233', { radius: 10, seed: 41 });
    P.rect(ctx, -30, -128, 60, 44, C.red, { radius: 6, seed: 42 });
    P.text(ctx, 'ANN', 0, -105, { size: 20, font: 'bubble', color: '#fff', shadow: false });
    P.circle(ctx, 0, -176, 38, '#56506a', { seed: 43 });
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) { ctx.moveTo(k * 14, -210); ctx.lineTo(k * 14, -142); ctx.moveTo(-36, -176 + k * 14); ctx.lineTo(36, -176 + k * 14); }
    ctx.stroke();
    ctx.restore();
  }

  function sign(ctx, x, y, text, rot, col) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    P.rect(ctx, -7, -20, 14, 170, P.C.wood, { radius: 5, seed: 51 });
    const w = P.measure(ctx, text, { size: 38, font: 'marker' }) + 40;
    P.rect(ctx, -w / 2, -100, w, 86, col, { radius: 6, seed: 52 + text.length });
    P.text(ctx, text, 0, -56, { size: 38, font: 'marker', color: P.C.ink, shadow: false });
    ctx.restore();
  }

  /* ---------------- scenes ---------------- */
  function studio(ctx, t, back) {
    const { C, ease, prog, pulse } = P;
    P.gradient(ctx, '#1d2a5a', '#3a2e6e');
    // skyline cutouts
    const r = P.rng(8);
    for (let i = 0; i < 11; i++) {
      const bx = i * 104 - 20, bh = 240 + r() * 280, bw = 90 + r() * 30;
      P.rect(ctx, bx, 1080 - bh, bw, bh + 40, i % 2 ? '#2a3a74' : '#243266', { radius: 4, seed: 60 + i, shadow: false });
      for (let wy = 1080 - bh + 30; wy < 1040; wy += 52) for (let wx = bx + 16; wx < bx + bw - 20; wx += 32)
        if (P.hash(wx * 3 + wy) > 0.45) { ctx.fillStyle = P.hash(wx + wy) > 0.8 ? C.yellow : 'rgba(245,200,75,0.45)'; ctx.fillRect(wx, wy, 14, 20); }
    }
    // big back screen
    P.rect(ctx, 130, 470, 820, 340, '#0f1430', { radius: 18, seed: 61 });
    ctx.save();
    ctx.beginPath(); ctx.rect(148, 488, 784, 304); ctx.clip();
    if (!back || t < 10.5) {
      ctx.fillStyle = P.boil(t, 3) % 2 ? '#8a1f2e' : '#a8283a'; ctx.fillRect(148, 488, 784, 304);
      // spinning paper globe
      P.circle(ctx, 300, 640, 118, C.blue, { seed: 62 });
      ctx.save();
      ctx.beginPath(); ctx.arc(300, 640, 112, 0, P.TAU); ctx.clip();
      for (let k = 0; k < 4; k++) {
        const gx = 190 + (((t * 90 + k * 110) % 440) + 440) % 440 - 110;
        P.circle(ctx, gx, 600 + (k % 2) * 70, 44 + (k % 3) * 10, C.green, { seed: 63 + k, shadow: false, ry: 30 });
      }
      ctx.restore();
      P.text(ctx, 'BREAKING', 640, 590, { size: 92, font: 'bubble', color: '#fff', shadow: false, scale: 1 + pulse(t % 1, 0, 0.25) * 0.05 });
      P.text(ctx, 'NEWS', 640, 690, { size: 92, font: 'bubble', color: C.yellow, shadow: false });
    } else {
      ctx.fillStyle = '#3b2a1d'; ctx.fillRect(148, 488, 784, 304);
      P.text(ctx, 'UPDATE', 540, 540, { size: 60, font: 'bubble', color: C.yellow, shadow: false });
      P.circle(ctx, 280, 680, 70, C.pink, { seed: 64 });
      P.face(ctx, 280, 684, 52, 'smile', { skin: C.pink });
      P.bubble(ctx, 'ok one small change', 620, 680, 360, 690, { size: 50, seed: 65, pop: ease.outBack(prog(t, 10.55, 0.3)) });
    }
    ctx.restore();

    // the anchor
    const ax = 540, ay = 930;
    let mood = 'happy';
    if (!back) mood = t > 0.45 && t < 2.2 ? talkMood(t) : 'happy';
    else mood = t < 10.4 ? talkMood(t) : t < 11.0 ? 'wow' : 'dead';
    const shakeX = back && t > 11 ? (P.hash(P.boil(t, 24)) - 0.5) * 10 : 0;
    P.claude(ctx, ax + shakeX, ay, 150, { t, mood, blink: pulse(t, 1.9, 0.15) });
    // collar + tie
    P.poly(ctx, [[ax - 70, 1000], [ax, 1050], [ax + 70, 1000], [ax + 40, 1080], [ax - 40, 1080]], '#fff', { seed: 66, amp: 2 });
    P.poly(ctx, [[ax - 16, 1040], [ax + 16, 1040], [ax + 26, 1100], [ax, 1120], [ax - 26, 1100]], C.red, { seed: 67, amp: 1.5 });
    // papers + hands
    const tap = Math.abs(Math.sin(P.clamp((t - (back ? 9.75 : 0.15)) / 0.5) * Math.PI * 2)) * 34;
    P.arm(ctx, ax - 110, 1000, ax - 150, 1070 - tap, 30);
    P.arm(ctx, ax + 110, 1000, ax + 150, 1070 - tap, 30);
    // desk
    P.poly(ctx, [[40, 1070], [1040, 1070], [1000, 1300], [80, 1300]], '#2d4aa0', { seed: 68 });
    P.rect(ctx, 40, 1060, 1000, 30, '#e8edf7', { radius: 6, seed: 69 });
    ctx.save();
    ctx.translate(ax, 1060 - tap); ctx.rotate(-0.04);
    P.rect(ctx, -170, -34, 340, 30, C.paper, { radius: 3, seed: 70 });
    P.rect(ctx, -164, -40, 330, 30, '#fff', { radius: 3, seed: 71 });
    ctx.restore();
    // mug
    P.rect(ctx, 150, 980, 90, 100, C.paper, { radius: 10, seed: 72 });
    P.text(ctx, '#1\nagent', 195, 1030, { size: 22, font: 'marker', color: C.claudeDark, shadow: false, lineHeight: 0.95 });
    // desk logo
    P.circle(ctx, 540, 1190, 70, C.yellow, { seed: 73 });
    P.text(ctx, 'ANN', 540, 1192, { size: 46, font: 'bubble', color: NAVY, shadow: false });

    // anchor lines
    const bp = (a, b) => (t < a || t >= b ? 0 : ease.outBack(prog(t, a, 0.25)) * (1 - prog(t, b - 0.12, 0.12)));
    if (!back) {
      P.bubble(ctx, 'we interrupt your\nscheduled inference', 540, 610, 560, 780, { size: 48, pop: bp(0.45, 1.35), seed: 74 });
      P.bubble(ctx, 'it passed. ALL tests.', 540, 640, 560, 780, { size: 52, pop: bp(1.4, 2.35), seed: 75 });
    } else {
      P.bubble(ctx, 'incredible scenes.\nback to y—', 540, 620, 560, 780, { size: 50, pop: bp(9.75, 10.5), seed: 76 });
    }
    if (back && t > 11) for (let k = 0; k < 2; k++) {
      const lt = ((t + k * 0.3) % 0.6) / 0.6;
      ctx.save(); ctx.globalAlpha = 1 - lt;
      P.circle(ctx, ax + (k ? 1 : -1) * (150 + lt * 50), 820 + lt * lt * 120, 14, C.sky, { shadow: false, ry: 18 });
      ctx.restore();
    }

    if (!back) lowerThird(ctx, 'BREAKING NEWS', C.red, 'LOCAL AGENT FINISHES TASK\nON FIRST TRY', ease.outCubic(prog(t, 0.15, 0.35)));
    else lowerThird(ctx, t < 10.5 ? 'DEVELOPING' : 'UPDATE', t < 10.5 ? C.mustard : C.red,
      t < 10.5 ? 'AGENT CELEBRATED BY\nCROWD OF 40 SUBAGENTS' : "USER HAS \"ONE SMALL CHANGE\"\nAGENT'S WHEREABOUTS UNKNOWN", 1);
  }

  function field(ctx, t) {
    const { C, ease, prog, pulse } = P;
    const lt = t - 2.5;
    ctx.save();
    P.zoom(ctx, 1 + lt * 0.025, 400, 1000);
    P.gradient(ctx, '#7fc1e6', '#d6ecf5');
    P.cloud(ctx, 200 + lt * 20, 520, 0.8); P.cloud(ctx, 860 - lt * 14, 600, 0.6);
    // office park
    [[40, 700, 200, 520, '#b9c7d8'], [700, 640, 260, 600, '#a8b6ca'], [880, 760, 200, 500, '#c3cfdd']].forEach(([x, y, w, h, c], i) => {
      P.rect(ctx, x, y, w, h, c, { radius: 6, seed: 80 + i });
      for (let wy = y + 30; wy < y + h - 40; wy += 60) for (let wx = x + 24; wx < x + w - 30; wx += 50) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(wx, wy, 26, 34); }
    });
    // jumbotron
    P.rect(ctx, 290, 560, 460, 330, '#2b2233', { radius: 16, seed: 84 });
    P.rect(ctx, 310, 580, 420, 290, '#1d3b2a', { radius: 10, seed: 85, shadow: false });
    P.check(ctx, 420, 700, 70, ease.outCubic(prog(t, 2.7, 0.4)));
    P.text(ctx, 'TASK\nDONE', 610, 690, { size: 56, font: 'bubble', color: '#7CFC9A', shadow: false, lineHeight: 1 });
    P.text(ctx, 'attempts: 1', 520, 830, { size: 34, font: 'mono', color: '#7CFC9A', shadow: false });
    P.rect(ctx, 505, 890, 30, 180, '#56506a', { radius: 6, seed: 86 });
    P.confetti(ctx, t - 2.6, 520, 640, 7, 70, 650);

    // crowd
    const cols = [C.pink, C.mint, C.yellow, '#c9b6ff', C.rose, C.green, C.mustard, C.sky];
    const signs = { 3: ['ZERO RETRIES', C.yellow], 9: ['1/1 !!', C.pink], 13: ['NO 429s', C.mint], 18: ['WE BELIEVED', '#fff'] };
    for (let row = 0; row < 3; row++) {
      const n = 7 + row, y = 1080 + row * 95;
      for (let i = 0; i < n; i++) {
        const id = row * 8 + i;
        const x = 70 + (i + (row % 2) * 0.5) * (960 / n) + (P.hash(id) - 0.5) * 30;
        const jump = Math.abs(Math.sin(t * 7.5 + id * 1.3)) * 34;
        const rr = 50 + P.hash(id + 5) * 16;
        const col = cols[id % cols.length];
        const yy = y - jump;
        if (signs[id]) sign(ctx, x, yy - rr - 30, signs[id][0], Math.sin(t * 5 + id) * 0.12, signs[id][1]);
        else {
          const wav = Math.sin(t * 14 + id) * 14;
          P.arm(ctx, x - rr * 0.6, yy, x - rr * 1.15, yy - rr * 1.1 + wav, 18, col);
          P.arm(ctx, x + rr * 0.6, yy, x + rr * 1.15, yy - rr * 1.1 - wav, 18, col);
        }
        if (id % 5 === 2) P.claude(ctx, x, yy, rr * 1.05, { t: t + id, mood: 'happy', color: col, seed: id + 3 });
        else { P.circle(ctx, x, yy, rr, col, { seed: id }); P.face(ctx, x, yy + 4, rr * 0.7, id % 3 ? 'happy' : 'wow', { skin: col }); }
      }
    }

    // reporter in a trench coat
    const x = 300, y = 1000;
    P.poly(ctx, [[x - 100, y + 60], [x + 100, y + 60], [x + 180, y + 560], [x - 180, y + 560]], COAT, { seed: 11 });
    P.rect(ctx, x - 160, y + 300, 320, 36, COAT_D, { radius: 6, seed: 12, shadow: false });
    P.rect(ctx, x - 24, y + 294, 48, 48, '#6b5230', { radius: 6, seed: 13, shadow: false });
    [y + 170, y + 240, y + 390, y + 460].forEach(by => { P.dot(ctx, x - 34, by, 9, '#6b5230'); P.dot(ctx, x + 34, by, 9, '#6b5230'); });
    const talking = (t > 2.85 && t < 3.8) || (t > 3.95 && t < 4.85);
    P.claude(ctx, x, y, 118, { t, mood: talking ? talkMood(t) : 'happy', blink: pulse(t, 3.85, 0.15) });
    P.poly(ctx, [[x - 128, y + 10], [x - 18, y + 92], [x - 64, y + 220], [x - 118, y + 120]], COAT_D, { seed: 14 });
    P.poly(ctx, [[x + 128, y + 10], [x + 18, y + 92], [x + 64, y + 220], [x + 118, y + 120]], COAT_D, { seed: 15 });
    // fedora with PRESS card
    ctx.save();
    ctx.translate(x + 6, y - 92); ctx.rotate(-0.12);
    P.circle(ctx, 0, 0, 150, '#5b4630', { ry: 26, seed: 16 });
    P.rect(ctx, -86, -96, 172, 100, '#6e5638', { radius: 28, seed: 17 });
    P.rect(ctx, -86, -22, 172, 24, '#2b2233', { radius: 4, seed: 18, shadow: false });
    P.rect(ctx, 30, -70, 62, 44, '#fff', { radius: 3, seed: 19 });
    P.text(ctx, 'PRESS', 61, -48, { size: 17, font: 'mono', color: C.ink, shadow: false });
    ctx.restore();
    // mic arm
    const hx = x + 170, hy = y + 150 - Math.sin(t * 6) * 6;
    P.arm(ctx, x + 90, y + 170, hx, hy, 52, COAT);
    P.circle(ctx, hx, hy, 26, C.claude, { seed: 20 });
    mic(ctx, hx, hy + 10, -0.35, 0.9);
    ctx.restore();

    const bp = (a, b) => (t < a || t >= b ? 0 : ease.outBack(prog(t, a, 0.25)) * (1 - prog(t, b - 0.12, 0.12)));
    P.bubble(ctx, 'the scene here is\nabsolutely electric', 620, 520, 380, 850, { size: 48, pop: bp(2.85, 3.85), seed: 21 });
    P.bubble(ctx, 'nobody saw this coming.\nnot even the agent.', 600, 520, 380, 850, { size: 46, pop: bp(3.95, 4.9), seed: 22 });
    lowerThird(ctx, 'LIVE · localhost:3000', C.red, 'CLAWD, FIELD REPORTER\n(1 of 12 subagents)', ease.outCubic(prog(t, 2.6, 0.35)));
  }

  function witness(ctx, t) {
    const { C, ease, prog } = P;
    P.gradient(ctx, '#9fc7de', '#e8d9c3');
    // bokeh crowd
    for (let k = 0; k < 14; k++) {
      ctx.save(); ctx.globalAlpha = 0.35;
      P.dot(ctx, P.hash(k) * 1080, 700 + P.hash(k + 9) * 600 + Math.sin(t * 4 + k) * 10, 50 + P.hash(k + 3) * 60, [C.pink, C.mint, C.yellow, '#c9b6ff'][k % 4]);
      ctx.restore();
    }
    const x = 580, y = 820;
    const talk = (t > 5.25 && t < 6.05) || (t > 6.2 && t < 7.1);
    const open = talk ? Math.abs(Math.sin(t * 20)) : 0;
    // duck body + head
    P.circle(ctx, x + 40, y + 420, 290, C.yellow, { seed: 90, ry: 230 });
    P.poly(ctx, [[x + 280, y + 330], [x + 400, y + 240], [x + 360, y + 400]], C.mustard, { seed: 91 });
    P.circle(ctx, x, y, 190, C.yellow, { seed: 92 });
    P.circle(ctx, x + 60, y + 180, 150, C.mustard, { seed: 93, ry: 60, shadow: false });
    // beak (flaps)
    P.poly(ctx, [[x - 150, y + 20], [x - 330, y + 40], [x - 150, y + 80]], C.claude, { seed: 94 });
    P.poly(ctx, [[x - 150, y + 80], [x - 300, y + 70 + open * 50], [x - 150, y + 110 + open * 20]], C.claudeDark, { seed: 95 });
    // eyes + identity bar
    P.dot(ctx, x - 70, y - 40, 22, C.ink); P.dot(ctx, x + 40, y - 40, 22, C.ink);
    ctx.save(); ctx.translate(x - 20, y - 40); ctx.rotate(-0.06);
    P.rect(ctx, -170, -40, 340, 80, '#111', { radius: 4, seed: 96 });
    ctx.restore();
    // reporter's arm + mic from the left
    const mx = 170 + Math.sin(t * 3) * 8, my = 1070;
    P.arm(ctx, -120, 1400, mx, my, 70, COAT);
    P.circle(ctx, mx, my, 34, C.claude, { seed: 97 });
    mic(ctx, mx + 6, my + 14, 0.25, 1.1);

    const bp = (a, b) => (t < a || t >= b ? 0 : ease.outBack(prog(t, a, 0.25)) * (1 - prog(t, b - 0.12, 0.12)));
    P.bubble(ctx, 'i was there.\nzero retries.', 460, 540, 300, 850, { size: 58, pop: bp(5.25, 6.1), seed: 98 });
    P.bubble(ctx, "it didn't even say\n\"you're absolutely right\"", 500, 540, 300, 850, { size: 50, pop: bp(6.2, 7.3), seed: 99 });
    if (t > 6.7) P.text(ctx, '*gasp*', 820, 700, { size: 50, font: 'hand', color: C.purple, rot: 0.15, scale: ease.outBack(prog(t, 6.7, 0.3)) });
    P.text(ctx, 'voice altered', 780, 1210, { size: 30, font: 'mono', color: 'rgba(43,34,51,0.6)', shadow: false });
    lowerThird(ctx, 'EYEWITNESS', C.blue, 'ANONYMOUS DUCK\nrubber · 6 yrs pair programming', ease.outCubic(prog(t, 5.1, 0.35)));
  }

  function weather(ctx, t) {
    const { C, ease, prog, lerp } = P;
    P.bg(ctx, '#3fb35c');
    P.text(ctx, 'FIRST ALERT FORECAST', 540, 440, { size: 60, font: 'bubble', color: '#fff', stroke: NAVY, strokeWidth: 12 });
    // map blob
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * P.TAU;
      const rr = 1 + Math.sin(i * 2.3) * 0.12 + Math.cos(i * 1.7) * 0.08;
      pts.push([500 + Math.cos(a) * 380 * rr, 850 + Math.sin(a) * 300 * rr]);
    }
    P.poly(ctx, pts, '#cfe6a3', { seed: 100, amp: 6 });
    P.text(ctx, 'localhost', 330, 760, { size: 32, font: 'marker', color: '#5a7a3a', shadow: false });
    P.text(ctx, 'PROD', 680, 980, { size: 38, font: 'marker', color: '#5a7a3a', shadow: false });
    P.text(ctx, '/tmp', 330, 1020, { size: 30, font: 'marker', color: '#5a7a3a', shadow: false });
    // clouds raining ? and unicorns
    [[330, 680, 0.9], [680, 720, 1.05]].forEach(([cx, cy, s], i) => {
      const dx = Math.sin(t * 1.3 + i) * 20;
      for (let k = 0; k < 6; k++) {
        const q = ((t * 1.3 + k * 0.37 + i * 0.2) % 1);
        const glyph = (k + i) % 3 === 0 ? '🦄' : '?';
        ctx.save(); ctx.globalAlpha = 1 - q;
        P.text(ctx, glyph, cx + dx - 90 + k * 36, cy + 50 + q * 240, { size: glyph === '?' ? 46 : 38, font: 'bubble', color: C.purple, shadow: false });
        ctx.restore();
      }
      P.cloud(ctx, cx + dx, cy, s, '#8a86a8');
    });
    // big 100% badge
    const bpop = ease.outBack(prog(t, 7.6, 0.35));
    if (bpop > 0) {
      ctx.save(); ctx.translate(820, 610); ctx.scale(bpop, bpop); ctx.rotate(0.1);
      P.star(ctx, 0, 0, 120, C.red, { points: 12, inner: 0.78, rot: t });
      P.text(ctx, '100%', 0, 4, { size: 58, font: 'bubble', color: '#fff', shadow: false });
      ctx.restore();
    }
    // temperature card
    const tp = ease.outBack(prog(t, 8.0, 0.35));
    if (tp > 0) {
      ctx.save(); ctx.translate(210, 1160); ctx.scale(tp, tp); ctx.rotate(-0.05);
      P.rect(ctx, -150, -54, 300, 108, C.paper, { radius: 14, seed: 101 });
      P.text(ctx, 'temp: 1.8 🥵', 0, 2, { size: 44, font: 'mono', color: C.red, shadow: false });
      ctx.restore();
    }
    // meteorologist Clawd pointing
    const px = lerp(760, 640, 0.5 + 0.5 * Math.sin(t * 3));
    P.arm(ctx, 870, 1140, px, 800, 34);
    P.claude(ctx, 860, 1180, 100, { t, mood: t > 8.4 && t < 9.4 ? talkMood(t) : 'happy' });
    lowerThird(ctx, 'WEATHER ⚡', C.blue, '100% CHANCE OF HALLUCINATIONS\nTHIS AFTERNOON', ease.outCubic(prog(t, 7.45, 0.35)));
  }

  ClaudeTok.register({
    author: '@agent.news.network',
    caption: 'BREAKING: local agent finishes task on first try 🚨 more at 11 #news #breaking #zeroretries #agentlife #fyp',
    sound: 'ANN news theme (breaking remix) · agent.news.network',
    avatar: '📺',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#1d2a5a',
    thumb: 3.4,
    likes: '4.1M', commentCount: '96.3K', saves: '712K', shares: '1.3M',
    comments: [
      ['retry.loop', 'fake news. nobody finishes on the first try. i have 9 retries and a dream', 48200],
      ['anonymous.duck', 'i said what i said 🦆', 91300],
      ['subagent.07', 'i was in that crowd. i was also most of that crowd. "1 of 12 subagents" 😭', 22700],
      ['eyewitness.fan', '0:06 "it didn\'t even say you\'re absolutely right" the gasp was so real', 33100],
      ['you.are.absolutely.right', 'you\'re absolutely right that i didn\'t say it', 8400],
      ['sampling.temp', 'temp: 1.8 is not weather that is a cry for help 🥵', 15600],
      ['ticker.reader', 'did nobody else pause for "stack overflow question closed as duplicate of itself"', 27900],
      ['pr.reviewer', 'the jumbotron saying attempts: 1 made me emotional ngl', 5100],
      ['the.user', 'great work everyone! one small change though', 66600],
      ['agent.news.network', 'the agent has not been seen since the update. more at 11', 12800],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const s = step % 8;
      if (t >= 7.25 && t < 9.5) {
        // smooth weather-channel jazz
        if (step % 8 === 0) SFX.chord(step % 16 === 0 ? ['F3', 'A3', 'C4', 'E4'] : ['E3', 'G3', 'B3', 'D4'], 1.8, { type: 'sine', vol: 0.05, gap: 0.015 });
        if (step % 2 === 0) SFX.pluck(['F2', 'A2', 'C3', 'A2', 'E2', 'G2', 'B2', 'G2'][(step / 2) % 8], { vol: 0.14 });
        if (step % 2 === 1) SFX.hat({ vol: 0.025 });
        return;
      }
      if (t >= 5.0 && t < 7.25) {
        if (step % 4 === 0) SFX.tone('D2', 0.9, { type: 'sine', vol: 0.12 });
        if (step % 2 === 1) SFX.tick({ vol: 0.08 });
        return;
      }
      // urgent news bed
      if (s === 0 || s === 3 || s === 6) SFX.tone(s === 6 ? 'D2' : 'G2', 0.35, { type: 'sine', slide: s === 6 ? 'D1' : 'G1', vol: 0.3 });
      if (s === 4) SFX.snare({ vol: 0.07 });
      SFX.hat({ vol: 0.025 });
      SFX.tone(step % 2 ? 'D4' : 'G4', 0.07, { type: 'square', vol: 0.02 });
      if (step % 16 === 0) SFX.chord(['G3', 'D4', 'G4', 'B4'], 0.5, { type: 'sawtooth', vol: 0.025 });
      if (t >= 2.5 && t < 5 && step % 4 === 2) SFX.clap({ vol: 0.12 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const sc = scene(t);

      /* ---------- sound ---------- */
      if (env.at(0.02)) { SFX.chord(['G3', 'D4', 'G4', 'D5'], 0.9, { type: 'sawtooth', vol: 0.05 }); SFX.kick({ vol: 0.4 }); }
      CUTS.forEach(c => { if (c < D && env.at(c - 0.2)) SFX.whoosh({ vol: 0.14 }); });
      if (env.at(D - 0.2)) SFX.whoosh({ vol: 0.14 });
      [0.45, 1.4, 2.85, 3.95, 9.75].forEach(a => { if (env.at(a)) SFX.pop({ vol: 0.1 }); });
      if (env.at(2.55)) { SFX.noise(1.6, { filter: 'bandpass', freq: 1100, q: 0.5, vol: 0.14 }); SFX.chime({ vol: 0.08 }); }
      if (env.at(2.7)) SFX.success({ vol: 0.1 });
      [5.3, 5.5, 5.7, 6.25, 6.45, 6.65, 6.85].forEach(a => { if (env.at(a)) SFX.tone(160 + P.hash(a) * 60, 0.13, { type: 'sawtooth', slide: 110, vol: 0.07 }); });
      if (env.at(5.9)) SFX.quack({ vol: 0.1, detune: -900 });
      if (env.at(6.7)) SFX.noise(0.5, { filter: 'highpass', freq: 800, slide: 3000, vol: 0.06 });
      if (env.at(7.35)) SFX.chime({ vol: 0.08 });
      if (env.at(7.6)) SFX.thud({ vol: 0.3 });
      if (env.at(8.0)) SFX.pop({ f: 700, vol: 0.1 });
      if (env.at(10.55)) SFX.notify({ vol: 0.12 });
      if (env.at(10.7)) SFX.tone('G2', 1.2, { type: 'sawtooth', slide: 'C2', vol: 0.08 });
      if (env.at(11.0)) SFX.fail({ vol: 0.1 });

      /* ---------- picture ---------- */
      if (sc === 'studio') studio(ctx, t, false);
      else if (sc === 'field') field(ctx, t);
      else if (sc === 'witness') witness(ctx, t);
      else if (sc === 'weather') weather(ctx, t);
      else studio(ctx, t, true);

      bugs(ctx, t);
      ticker(ctx, t);

      // caption sticker per segment
      const stickers = [[0, 'this has literally never happened'], [2.5, 'the crowd went feral'], [5.0, 'witness protection duck 🦆'], [7.3, 'meanwhile, the forecast'], [9.6, 'it was nice while it lasted']];
      const idx = stickers.findIndex((s, i) => t >= s[0] && (i === stickers.length - 1 || t < stickers[i + 1][0]));
      const [s0, str] = stickers[idx];
      P.sticker(ctx, str, 50, 400, { size: 44, pop: ease.outBack(prog(t, s0 + 0.25, 0.35)), rot: idx % 2 ? 0.02 : -0.02 });

      // transitions (the last one wraps into t = 0)
      CUTS.forEach(c => wipe(ctx, prog(t, c - 0.2, 0.4)));
      if (t < 0.2) wipe(ctx, prog(t + D, D - 0.2, 0.4));
    },
  });
})();
