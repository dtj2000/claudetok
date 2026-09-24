/* Karaoke night: Clawd belts an original ballad made entirely of error messages.
 * Bouncing-ball lyrics, disco ball, a crowd of agents with lighters,
 * a completely unnecessary key change, confetti, and a score of NaN. */
(function () {
  'use strict';
  const D = 12;
  const TAU = Math.PI * 2;
  const BEAT = 0.5; // 120 bpm
  const KEY_T = 8.0, SCORE_T = 11.1;
  const SCR = { x: 100, y: 330, w: 880, h: 320 };

  // [text, beat offset, note, length in beats]; null beat = shown, not sung
  const LINES = [
    { start: 0.5, key: 0, segs: [['seg', 0, 'E4', 0.5], ['men', 0.5, 'G4', 0.5], ['ta', 1, 'A4', 0.5], ['tion ', 1.5, 'G4', 0.5], ['fault… ', 2, 'C5', 1.1], ['core ', 3.25, 'B4', 0.5], ['dumped ', 3.75, 'G4', 1.1], ['🎤', null]] },
    { start: 5.5, key: 0, segs: [['un', 0, 'A4', 0.5], ['de', 0.5, 'A4', 0.5], ['fined ', 1, 'G4', 0.6], ['is ', 1.75, 'E4', 0.4], ['not ', 2.25, 'F4', 0.4], ['a ', 2.75, 'E4', 0.4], ['func', 3.25, 'D4', 0.5], ['tion', 3.75, 'C4', 1.2]] },
    { start: 10.5, key: 0, segs: [['four', 0, 'C5', 0.5], ['-oh-', 0.5, 'B4', 0.5], ['four, ', 1, 'A4', 0.8], ['my ', 2, 'G4', 0.5], ['heart ', 2.5, 'A4', 0.7], ['not ', 3.25, 'G4', 0.5], ['found', 3.75, 'E4', 1.1]] },
    { start: 16.5, key: 2, segs: [['FOUR', 0, 'C5', 0.5], ['-OH-', 0.5, 'B4', 0.5], ['FOUR, ', 1, 'A4', 0.8], ['my ', 2, 'G4', 0.5], ['heart ', 2.5, 'A4', 0.7], ['not ', 3.25, 'B4', 0.5], ['fouuund', 3.75, 'C5', 1.75]] },
  ];
  // flatten into sung notes with absolute times
  const NOTES = [];
  LINES.forEach((L, li) => L.segs.forEach((s, si) => {
    if (s[1] === null) return;
    NOTES.push({ li, si, t: (L.start + s[1]) * BEAT, dur: s[3] * BEAT, note: s[2], key: L.key });
  }));
  const hz = (n, key) => SFX.freq(n) * Math.pow(2, key / 12);

  function lineAt(t) {
    let li = 0;
    for (let i = 0; i < LINES.length; i++) if (t >= LINES[i].start * BEAT - 0.35) li = i;
    return li;
  }

  function voice(n, dur, key) {
    const f = hz(n, key);
    SFX.tone(f, dur + 0.05, { type: 'triangle', vol: 0.11, attack: 0.02 });
    SFX.tone(f, dur + 0.05, { type: 'sawtooth', vol: 0.022, attack: 0.03, detune: 12 });
    if (dur >= 0.5) SFX.tone(f * 2, dur, { type: 'sine', vol: 0.025, attack: 0.08, detune: -10 });
  }

  /* ---------------- karaoke screen ---------------- */
  function screen(ctx, t) {
    const { C, prog, ease } = P;
    const { x, y, w, h } = SCR;
    P.rect(ctx, x - 20, y - 20, w + 40, h + 40, '#15121f', { radius: 20, seed: 3 });
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    // generic karaoke stock footage: a beach nobody has ever been to
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#6aa7e0'); g.addColorStop(0.6, '#f2a6b8'); g.addColorStop(1, '#f7c27a');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    P.circle(ctx, x + w * 0.7, y + h * 0.62, 60, '#ffe7a3', { shadow: false });
    ctx.fillStyle = '#4c79b8'; ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + ((k * 170 + t * 40) % w), y + h * 0.75 + (k % 3) * 22, 80, 4);
    ctx.save(); ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x + 90, y + h); ctx.quadraticCurveTo(x + 110, y + 150, x + 150, y + 90); ctx.stroke(); ctx.restore();
    for (let k = 0; k < 5; k++) {
      const a = -2.6 + k * 0.55 + Math.sin(t * 2 + k) * 0.05;
      P.poly(ctx, [[x + 150, y + 90], [x + 150 + Math.cos(a) * 110, y + 90 + Math.sin(a) * 60 + 20], [x + 150 + Math.cos(a + 0.2) * 70, y + 90 + Math.sin(a + 0.2) * 40]], '#2f6b4f', { seed: 10 + k, shadow: false, amp: 2 });
    }
    ctx.fillStyle = 'rgba(20,12,40,0.45)'; ctx.fillRect(x, y, w, h);

    if (t >= SCORE_T) {
      const pp = ease.outBack(prog(t, SCORE_T, 0.35));
      P.text(ctx, 'YOUR SCORE', 540, y + 70, { size: 40, font: 'bubble', color: '#fff', shadow: false, scale: pp });
      P.text(ctx, 'NaN', 540, y + 160, { size: 110, font: 'bubble', color: C.yellow, stroke: C.rose, strokeWidth: 14, scale: pp * (1 + 0.05 * Math.sin(t * 10)) });
      for (let k = 0; k < 5; k++) P.star(ctx, 380 + k * 80, y + 262, 26 * ease.outBack(prog(t, SCORE_T + 0.2 + k * 0.08, 0.3)), C.yellow, { shadow: false });
      ctx.restore();
      return;
    }
    P.text(ctx, '♪ stderr (feat. core dump) ♪', 540, y + 36, { size: 26, font: 'mono', color: '#fff', shadow: false });

    const li = lineAt(t);
    const L = LINES[li];
    drawLine(ctx, t, L, li, y + 150, 58, true);
    if (li < LINES.length - 1) drawLine(ctx, t, LINES[li + 1], li + 1, y + 250, 38, false);
    ctx.restore();
  }

  function drawLine(ctx, t, L, li, cy, size, live) {
    const { C, clamp } = P;
    const font = 'bubble';
    const ws = L.segs.map(s => P.measure(ctx, s[0], { size, font }));
    const total = ws.reduce((a, b) => a + b, 0);
    const sc = Math.min(1, 780 / total);
    const cum = []; let acc = 0; ws.forEach(w => { cum.push(acc); acc += w; });
    const x0 = -total / 2;
    const col = L.key ? C.yellow : C.pink;
    // how much is sung
    let sung = 0;
    if (live) L.segs.forEach((s, i) => {
      if (s[1] === null) return;
      const st = (L.start + s[1]) * BEAT, d = Math.max(0.2, s[3] * BEAT);
      if (t >= st) sung = cum[i] + ws[i] * clamp((t - st) / d);
    });
    const draw = (fill) => L.segs.forEach((s, i) => P.text(ctx, s[0], x0 + cum[i], 0, { size, font, color: fill, align: 'left', stroke: live ? '#2B2233' : null, strokeWidth: 10, shadow: false }));
    ctx.save(); ctx.translate(540, cy); ctx.scale(sc, sc);
    if (!live) ctx.globalAlpha = 0.6;
    draw('#fff');
    if (sung > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, -size, sung + 20, size * 2); ctx.clip();
      draw(col); ctx.restore();
    }
    // bouncing ball
    if (live) {
      const sungSegs = L.segs.map((s, i) => [s, i]).filter(([s]) => s[1] !== null);
      const times = sungSegs.map(([s]) => (L.start + s[1]) * BEAT);
      const cxs = sungSegs.map(([, i]) => x0 + cum[i] + ws[i] / 2);
      let bx = cxs[0], by = -size * 0.95 - 40;
      if (t < times[0]) {
        const f = clamp((t - (times[0] - 0.35)) / 0.35);
        bx = cxs[0] - (1 - f) * 120; by = -size * 0.95 - Math.sin(f * Math.PI) * 50 - (1 - f) * 20;
      } else {
        let k = times.length - 1;
        for (let i = 0; i < times.length - 1; i++) if (t < times[i + 1]) { k = i; break; }
        if (k < times.length - 1) {
          const f = clamp((t - times[k]) / (times[k + 1] - times[k]));
          bx = P.lerp(cxs[k], cxs[k + 1], f); by = -size * 0.95 - Math.sin(f * Math.PI) * 60;
        } else {
          bx = cxs[k]; by = -size * 0.95 - Math.abs(Math.sin((t - times[k]) * 8)) * 16;
        }
      }
      P.circle(ctx, bx, by, 16 / sc, col, { shadow: false, seed: 4, amp: 1 });
    }
    ctx.restore();
  }

  /* ---------------- stage ---------------- */
  function discoBall(ctx, t, x, y, r) {
    ctx.save(); ctx.strokeStyle = '#888'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, SCR.y + SCR.h + 20); ctx.lineTo(x, y - r); ctx.stroke(); ctx.restore();
    P.circle(ctx, x, y, r, '#b9b4c9', { seed: 5 });
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 2, 0, TAU); ctx.clip();
    const s = 14, off = (t * 30) % s;
    for (let gx = -r - s; gx < r + s; gx += s) for (let gy = -r; gy < r; gy += s) {
      const v = P.hash(Math.floor((gx - off) / s) * 13 + gy + P.boil(t, 8));
      ctx.fillStyle = v > 0.85 ? '#fff' : v > 0.5 ? '#d8d4e6' : '#8f8aa6';
      ctx.fillRect(x + gx + off, y + gy, s - 2, s - 2);
    }
    ctx.restore();
  }

  function beams(ctx, t, gold) {
    const cols = gold ? ['#FFD76B', '#FFE9A8', '#F5C84B'] : ['#F2B8C6', '#8FD3B6', '#8EC9E8', '#c9b6ff', '#F5C84B'];
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const a = t * 0.9 + i * TAU / 7;
      const x = 540, y = 760;
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a - 0.06) * 1400, y + Math.sin(a - 0.06) * 1400);
      ctx.lineTo(x + Math.cos(a + 0.06) * 1400, y + Math.sin(a + 0.06) * 1400);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function crowdMember(ctx, i, x, y, t, hype) {
    const { C } = P;
    const cols = [C.mint, C.sky, C.pink, C.yellow, '#c9b6ff', C.claude];
    const col = cols[i % cols.length];
    const sway = Math.sin(t * Math.PI + i * 0.5) * (0.1 + hype * 0.08);
    const jump = hype ? Math.abs(Math.sin(t * TAU + i)) * 22 * hype : 0;
    ctx.save(); ctx.translate(x, y - jump); ctx.rotate(sway);
    // raised arm with a light
    const hx = 34, hy = -150;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(22, -20); ctx.lineTo(hx, hy); ctx.stroke(); ctx.restore();
    if (i % 3 === 1) {
      P.rect(ctx, hx - 14, hy - 48, 28, 48, '#2b2233', { radius: 6, seed: 30 + i });
      ctx.save(); ctx.globalAlpha = 0.35; P.dot(ctx, hx, hy - 42, 30, '#fff'); ctx.restore();
      P.dot(ctx, hx, hy - 42, 7, '#fff');
    } else {
      P.rect(ctx, hx - 9, hy - 30, 18, 30, '#9a94a8', { radius: 4, seed: 30 + i });
      const fl = 1 + 0.15 * Math.sin(t * 20 + i * 3);
      ctx.save(); ctx.translate(hx, hy - 34); ctx.scale(fl, fl);
      ctx.globalAlpha = 0.3; P.dot(ctx, 0, -8, 26, '#FFB347'); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(12, -6, 0, 4); ctx.quadraticCurveTo(-12, -6, 0, -30);
      P.cut(ctx, C.yellow, { shadow: false, rim: false });
      ctx.restore();
    }
    // head
    if (i % 3 === 0) P.claude(ctx, 0, 0, 62, { t, mood: hype ? 'happy' : 'smile', color: col, wiggle: 0.3, seed: 40 + i });
    else if (i % 3 === 1) {
      ctx.save(); ctx.strokeStyle = '#888'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, -80); ctx.stroke(); ctx.restore();
      P.dot(ctx, 0, -82, 8, C.red);
      P.rect(ctx, -48, -50, 96, 90, col, { radius: 18, seed: 50 + i });
      P.face(ctx, 0, -2, 36, hype ? 'happy' : 'smile');
    } else {
      P.circle(ctx, 0, 0, 50, col, { seed: 60 + i });
      P.face(ctx, 0, 0, 36, hype ? 'wow' : 'happy');
    }
    ctx.restore();
  }

  function singingNow(t) {
    for (const n of NOTES) if (t >= n.t && t < n.t + Math.max(0.2, n.dur)) return n;
    return null;
  }

  ClaudeTok.register({
    author: '@karaoke.night',
    caption: 'clawd picked the saddest song in the book: every error message he has ever seen 🎤😭 the key change at 0:08 #karaoke #errors #segfault #404 #keychange',
    sound: 'stderr (feat. core dump) [karaoke version] · karaoke.night',
    avatar: '🎤',
    avatarColor: '#c9b6ff',
    duration: D,
    bg: '#231C3A',
    thumb: 8.6,
    likes: '3.3M', commentCount: '64.8K', saves: '540K', shares: '301K',
    comments: [
      ['segfault.sally', 'the "fault…" hold at 0:01 gave me chills. and a core dump', 97000],
      ['undefined', 'finally a song about me. i am not a function and i have never been prouder', 71000],
      ['karaoke.night', 'the key change was not in the backing track. clawd just decided', 44000],
      ['http.404', 'my heart was not found and neither was the page. we match 🥹', 26000],
      ['lighter.bot', 'held my lighter up for 12 seconds. fuel at 3%. worth it', 14800],
      ['score.nan', 'he got NaN out of 5 stars and that is still the highest score tonight', 8200],
      ['pitch.pedant', 'technically the key change goes C to D, that is +2 semitones, not "↑". please label your arrows', 2600],
      ['standup.survivor', 'me belting "undefined is not a function" at standup when they ask for an update', 930],
      ['crowd.agent.7', '🎤🔥🕯️📱✨', 77],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const beat = step / 2;
      const key = t >= KEY_T - 0.01 ? 2 : 0;
      // chords by beat
      let ch, root;
      if (beat < 4) { ch = ['C4', 'E4', 'G4']; root = 'C2'; }
      else if (beat < 8) { ch = ['A3', 'C4', 'E4']; root = 'A1'; }
      else if (beat < 12) { ch = ['F3', 'A3', 'C4']; root = 'F2'; }
      else if (beat < 16) { ch = ['G3', 'B3', 'D4']; root = 'G2'; }
      else if (beat < 20) { ch = ['C4', 'E4', 'G4']; root = 'C2'; }
      else if (beat < 22) { ch = ['F3', 'A3', 'C4']; root = 'F2'; }
      else { ch = ['G3', 'B3', 'D4']; root = 'G2'; }
      const tr = n => hz(n, key);
      if (step % 8 === 0 || (beat === 20 || beat === 22) && step % 2 === 0 && step % 4 === 0) {
        ch.forEach(n => SFX.tone(tr(n), 1.9, { type: 'triangle', vol: 0.04, attack: 0.03 }));
      }
      if (step % 2 === 1) ch.forEach(n => SFX.tone(tr(n), 0.1, { type: 'square', vol: 0.012 }));
      if (step % 2 === 0) SFX.bass(tr(root) * (step % 4 === 2 ? 2 : 1), 0.22, { vol: 0.22 });
      if (t > SCORE_T + 0.2) return; // band stops for the applause
      if (step % 4 === 0) SFX.kick({ vol: 0.35 });
      if (step % 4 === 2) SFX.snare({ vol: 0.12 });
      SFX.hat({ vol: 0.03 });
      if (step === 30 || step === 31) for (let k = 1; k < 4; k++) SFX.snare({ vol: 0.06 + k * 0.02, when: k * 0.0625 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;
      const hype = t >= KEY_T ? 1 : 0;

      /* ---------- sound ---------- */
      NOTES.forEach(n => { if (env.at(n.t)) voice(n.note, Math.max(0.2, n.dur), n.key); });
      if (env.at(7.5)) SFX.riser(0.5, { vol: 0.12 });
      if (env.at(KEY_T)) { SFX.noise(1.4, { filter: 'highpass', freq: 6000, vol: 0.16 }); SFX.chime({ vol: 0.08 }); }
      if (env.at(KEY_T + 0.25) || env.at(9.5)) SFX.pop({ vol: 0.15 });
      if (env.at(SCORE_T)) {
        SFX.noise(1.3, { filter: 'bandpass', freq: 1500, q: 0.6, vol: 0.12 });
        SFX.tone(700, 0.4, { slide: 1100, vol: 0.05, when: 0.1 });
        SFX.tone(850, 0.4, { slide: 1300, vol: 0.04, when: 0.35 });
        SFX.coin({ vol: 0.08, when: 0.3 });
      }
      for (let k = 0; k < 6; k++) if (env.at(SCORE_T + k * 0.14)) SFX.clap({ vol: 0.12 });

      /* ---------- room ---------- */
      const flash = t >= KEY_T ? pulse(t, KEY_T, 0.4) : 0;
      P.bg(ctx, hype ? '#2c2046' : '#231C3A');
      P.stars(ctx, t, 17, 24, '#c9b6ff', [0, 280, 1080, 900]);
      beams(ctx, t, hype && t < 9.2);
      // curtains
      [[0, 1], [1080, -1]].forEach(([x0, s]) => {
        ctx.save(); ctx.translate(x0, 0); ctx.scale(s, 1);
        P.poly(ctx, [[-20, 280], [120, 280], [100 + Math.sin(t) * 6, 700], [135, 1300], [-20, 1300]], '#B2334A', { seed: 70 });
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 6;
        for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(k * 28, 290); ctx.lineTo(k * 30 + Math.sin(t + k) * 4, 1290); ctx.stroke(); }
        ctx.restore();
      });

      screen(ctx, t);
      discoBall(ctx, t, 540, 745, 46);

      // stage
      P.rect(ctx, 70, 1200, 940, 90, '#5a3d2b', { radius: 10, seed: 80 });
      P.rect(ctx, 70, 1190, 940, 26, '#A87450', { radius: 8, seed: 81 });
      for (let k = 0; k < 8; k++) P.dot(ctx, 120 + k * 120, 1250, 8, P.boil(t, 4) % 2 === k % 2 ? C.yellow : '#7a5a3a');
      // spotlight
      ctx.save(); ctx.globalAlpha = hype ? 0.3 : 0.2; ctx.fillStyle = hype ? '#FFE9A8' : '#fff';
      ctx.beginPath(); ctx.moveTo(420, 660); ctx.lineTo(560, 660); ctx.lineTo(680, 1210); ctx.lineTo(220, 1210); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.35; P.circle(ctx, 450, 1205, 220, hype ? '#FFE9A8' : '#fff', { ry: 30, shadow: false }); ctx.restore();

      /* ---------- Clawd ---------- */
      const n = singingNow(t);
      const held = n && n.dur >= 0.5;
      const rise = ease.outBack(prog(t, KEY_T - 0.1, 0.4)) * (t < SCORE_T ? 1 : 1 - prog(t, SCORE_T, 0.3));
      const cx = 440, cy = 1040 - rise * 40 + Math.sin(t * Math.PI * 2) * 6;
      let mood = n ? (held ? 'happy' : 'wow') : 'smile';
      if (t >= SCORE_T) mood = 'happy';
      const vib = held ? Math.sin(t * 40) * 0.03 : 0;
      const bow = t >= SCORE_T ? Math.sin(prog(t, SCORE_T + 0.2, 0.6) * Math.PI) * 0.5 : 0;
      // mic stand
      ctx.save(); ctx.strokeStyle = '#3b3148'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(600, 1200); ctx.lineTo(600, 1060); ctx.lineTo(548, 1030); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(560, 1200); ctx.lineTo(640, 1200); ctx.stroke(); ctx.restore();
      P.circle(ctx, 540, 1026, 20, '#4a4458', { seed: 90, ry: 16 });
      P.claude(ctx, cx, cy, 135, { t, mood, rot: -0.12 - (held ? 0.15 : 0) + vib + bow, squash: held ? -0.08 : 0.04 * Math.sin(t * 12), wiggle: 1.5 });
      P.arm(ctx, cx + 50, cy + 40, 530, 1036, 30);
      if (hype && t < SCORE_T) P.arm(ctx, cx - 40, cy + 10, cx - 170 + Math.sin(t * 6) * 20, cy - 300, 30); // the dramatic arm
      // sweat of passion
      if (t > 4.5 && t < SCORE_T) {
        const lt = (t * 1.5) % 1;
        ctx.save(); ctx.globalAlpha = 1 - lt; P.circle(ctx, cx - 120 - lt * 30, cy - 90 + lt * 60, 11, C.sky, { ry: 15, shadow: false }); ctx.restore();
      }
      // floating notes from the mic
      if (n) for (let k = 0; k < 3; k++) {
        const lt = ((t - n.t) * 1.4 + k / 3) % 1;
        ctx.save(); ctx.globalAlpha = 1 - lt;
        P.text(ctx, k % 2 ? '♪' : '♫', 580 + lt * 120 + k * 20, 980 - lt * 180, { size: 48, font: 'sans', color: hype ? C.yellow : C.pink, shadow: false });
        ctx.restore();
      }

      /* ---------- key change ---------- */
      if (t >= 7.55 && t < 9.0) {
        const pp = ease.outBack(prog(t, 7.6, 0.3)) * (1 - ease.inCubic(prog(t, 8.75, 0.25)));
        if (pp > 0) {
          P.title(ctx, 'KEY CHANGE', 540, 880, { size: 110, color: C.yellow, stroke: C.rose, pop: pp, rot: -0.06 + Math.sin(t * 20) * 0.02 });
          P.text(ctx, '↑', 870, 860, { size: 150, font: 'bubble', color: C.mint, stroke: '#fff', strokeWidth: 16, scale: pp, rot: 0.1 });
        }
      }
      if (flash > 0) P.flash(ctx, flash * 0.5, '#FFE9A8');
      P.confetti(ctx, t - (KEY_T + 0.25), 540, 760, 5, 80, 800);
      P.confetti(ctx, t - 9.5, 200, 700, 8, 50, 500);
      P.confetti(ctx, t - 9.5, 880, 700, 9, 50, 500);
      P.confetti(ctx, t - SCORE_T, 540, 600, 11, 60, 700);

      /* ---------- crowd ---------- */
      for (let i = 0; i < 9; i++) crowdMember(ctx, i, 80 + i * 115, 1460 + (i % 2) * 40, t, hype);

      /* ---------- caption ---------- */
      if (t < 7.55) P.sticker(ctx, 'karaoke night at the server farm', 70, 1560, { pop: ease.outBack(prog(t, 0.05, 0.4)) });
      else if (t >= 9.0) P.sticker(ctx, 'the key change hit different', 70, 1560, { pop: ease.outBack(prog(t, 9.0, 0.35)), rot: 0.02 });
    },
  });
})();
