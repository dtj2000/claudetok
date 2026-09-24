/* hello world speedrun any% (WR). Type it, clip through the compile step,
 * hit RUN, 0:00.69. Chat loses it. Runner immediately resets. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const GO = 0.5, STOP = 5.3;
  const STAGE = { x: 60, y: 470, w: 960, h: 775 };
  const GROUND = 1150;
  const WALL = { x: 500, w: 80, top: 650 };
  const BTN = [815, 1100];

  // real time -> in-game time
  const IGT = [[0.5, 0], [1.1, 0.09], [2.5, 0.31], [3.95, 0.33], [4.8, 0.58], [5.3, 0.69]];
  const SPLITS = [
    ['open editor', 1.1, '0.09', '-0.02', 'green'],
    ['type hello world', 2.5, '0.31', '+0.04', 'red'],
    ['compile step', 3.95, '0.33', '-44:59.1', 'gold'],
    ['run ▶', 4.8, '0.58', '-0.11', 'green'],
    ['print', 5.3, '0.69', '-0.20', 'gold'],
  ];
  const DELTA_COL = { green: '#5DE07A', red: '#FF6B6B', gold: '#FFD54A' };

  const CODE = ['int main() {', '  puts("hello world");', '}'];
  const CODE_LEN = CODE.join('').length;

  const CHAT = [
    ['byte_bandit', 'clawdHype', 'clawdHype clawdHype'],
    ['tok3n_muncher', 'tokenPog', 'tokenPog'],
    ['gpu_goblin', null, 'WR WR WR WR'],
    ['lint_lord', null, 'no compile step?? 🤨'],
    ['ctx_window', 'ctxFull', 'ctxFull'],
    ['sudo_sam', null, '.69 LMAO'],
    ['heap_hero', 'tokenPog', 'tokenPog tokenPog'],
    ['seg_fault', null, 'is this TAS??'],
    ['rate_limited', '429sob', '429sob i got rate limited watching'],
    ['mod_bot', null, 'mods check his logs'],
    ['clawd_fan', 'clawdHype', 'clawdHype'],
    ['kernel_k', 'gpuBrr', 'gpuBrr gpuBrr'],
    ['nullptr', null, 'GG'],
    ['prompt_pro', 'tokenPog', 'first try btw'],
    ['rust_evangelist', null, 'rewrite it in rust for 0.68'],
    ['byte_bandit', 'clawdHype', 'clawdHype'],
    ['temp_zero', 'ctxFull', 'deterministic run fr'],
    ['anon_agent', null, 'WR'],
    ['gc_pause', 'gpuBrr', 'gpuBrr'],
    ['tok3n_muncher', 'tokenPog', 'tokenPog'],
    ['compiler_irl', '429sob', 'i am literally right here'],
    ['clawd_fan', 'clawdHype', 'clawdHype clawdHype clawdHype'],
  ];
  const NAME_COLS = ['#FF8FA3', '#8FD3B6', '#F5C84B', '#8EC9E8', '#E8845C', '#c9b6ff', '#7CFC9A'];

  function interp(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) return P.lerp(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
    }
    return keys[keys.length - 1][1];
  }
  const fmt = s => { const cs = Math.floor(s * 100 + 1e-6); return `0:${String(Math.floor(cs / 100)).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`; };

  function emote(ctx, kind, x, y, r, t) {
    const C = P.C;
    switch (kind) {
      case 'clawdHype': P.claude(ctx, x, y, r, { t: t * 3, mood: 'happy', wiggle: 2 }); break;
      case 'tokenPog':
        P.circle(ctx, x, y, r, C.yellow, { shadow: false, amp: 1 });
        P.face(ctx, x, y + 1, r * 0.75, 'wow', { blush: false });
        break;
      case 'ctxFull':
        P.rect(ctx, x - r, y - r, r * 2, r * 2, '#fff', { radius: 6, shadow: false, amp: 1 });
        P.rect(ctx, x - r + 3, y - r + 3, r * 2 - 6, r * 2 - 6, C.red, { radius: 4, shadow: false, amp: 1 });
        P.face(ctx, x, y, r * 0.7, 'dead', { ink: '#fff', blush: false });
        break;
      case '429sob':
        P.circle(ctx, x, y, r, C.sky, { shadow: false, amp: 1 });
        P.face(ctx, x, y, r * 0.75, 'sad', { blush: false });
        P.dot(ctx, x - r * 0.3, y + r * 0.35 + ((t * 2) % 1) * r * 0.5, r * 0.14, '#fff');
        break;
      case 'gpuBrr':
        P.rect(ctx, x - r, y - r, r * 2, r * 2, C.green, { radius: 5, shadow: false, amp: 1 });
        P.face(ctx, x, y, r * 0.7, 'angry', { blush: false });
        P.star(ctx, x + r * 0.8, y - r * 0.8, r * 0.5, C.claude, { shadow: false, points: 4 });
        break;
    }
  }

  function chatChip(ctx, msg, i, x, y, t) {
    const [user, em, text] = msg;
    const us = user + ':';
    const uw = P.measure(ctx, us, { size: 28, font: 'sans' });
    const tw = P.measure(ctx, text, { size: 32, font: 'sans' });
    const w = 36 + uw + (em ? 58 : 12) + tw + 28, h = 66;
    P.rect(ctx, x, y - h / 2, w, h, 'rgba(24,20,44,0.88)', { radius: 20, seed: 200 + i, shadow: { blur: 10, dy: 6, alpha: 0.3 }, amp: 2 });
    P.text(ctx, us, x + 20, y + 2, { size: 28, font: 'sans', color: NAME_COLS[i % NAME_COLS.length], align: 'left', shadow: false, weight: 800 });
    let cx = x + 20 + uw + 12;
    if (em) { emote(ctx, em, cx + 22, y, 22, t); cx += 52; }
    P.text(ctx, text, cx, y + 2, { size: 32, font: 'sans', color: '#fff', align: 'left', shadow: false, weight: 800 });
    return w;
  }

  function trophy(ctx, x, y, s, t) {
    const C = P.C;
    ctx.save();
    ctx.strokeStyle = C.mustard; ctx.lineWidth = 16 * s;
    ctx.beginPath(); ctx.arc(x - 70 * s, y - 70 * s, 34 * s, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 70 * s, y - 70 * s, 34 * s, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.restore();
    P.poly(ctx, [[x - 80 * s, y - 120 * s], [x + 80 * s, y - 120 * s], [x + 60 * s, y - 20 * s], [x + 20 * s, y + 10 * s], [x - 20 * s, y + 10 * s], [x - 60 * s, y - 20 * s]], C.yellow, { seed: 90 });
    P.rect(ctx, x - 16 * s, y + 5 * s, 32 * s, 40 * s, C.mustard, { radius: 4, seed: 91, shadow: false });
    P.rect(ctx, x - 60 * s, y + 40 * s, 120 * s, 34 * s, C.brown, { radius: 6, seed: 92 });
    P.text(ctx, 'WR', x, y - 68 * s, { size: 54 * s, font: 'bubble', color: C.mustard, shadow: false });
    // glint
    const g = (t * 0.8) % 1;
    P.star(ctx, x - 50 * s + g * 100 * s, y - 100 * s, 12 * s * Math.sin(g * Math.PI), '#fff', { shadow: false, points: 4 });
  }

  ClaudeTok.register({
    author: '@any.percent',
    caption: 'hello world speedrun any% (WR) 🏆 0:00.69 compile step skip is legal in this category #speedrun #helloworld #wr #glitched',
    sound: 'chiptune any% route · any.percent',
    avatar: '⏱️',
    avatarColor: '#5DB36A',
    duration: 10,
    bg: '#1E1B45',
    likes: '6.9M', commentCount: '69K', saves: '420K', shares: '690K',
    thumb: 6.4,
    comments: [
      ['gcc.official', 'we need to talk about the wall', 231000],
      ['sum.of.best', 'possible timesave: skip the "hello". just print " world"', 176000],
      ['speedrun.mod', 'run rejected: no footage of the compiler being alive', 128000],
      ['compiler.irl', 'i was literally right there. ETA: 45 min. he clipped through me like i was a comment', 69400],
      ['any.percent', 'attempt #4,812. the -44:59.1 gold split on compile step is not a typo', 36900],
      ['rust.evangelist', 'rewrite it in rust for 0.68. i will not be elaborating', 18200],
      ['tas.detector', 'the frame perfect wall clip at 0:03 is either the greatest run ever or a TAS. mods check his logs', 8700],
      ['autocomplete.tab', '"✨ hello world ⇥ tab" is carrying this entire run and gets no credit', 3100],
      ['puts.pedant', 'puts adds the newline for you. the run is valid. i checked. i had to', 1000],
      ['chat.spammer', 'WR WR WR WR', 69],
    ],

    bpm: 150,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= GO && t < STOP) {
        const bass = ['C3', 'C3', 'G2', 'C3', 'A#2', 'A#2', 'F2', 'G2'];
        const arp = ['C5', 'E5', 'G5', 'C6', 'A#4', 'D5', 'F5', 'A#5'];
        SFX.tone(bass[(step >> 1) % 8], 0.14, { type: 'square', vol: 0.05 });
        SFX.tone(arp[step % 8], 0.08, { type: 'square', vol: 0.03 });
        if (step % 4 === 0) SFX.kick({ vol: 0.3 });
        if (step % 4 === 2) SFX.snare({ vol: 0.1 });
      } else if (t >= 5.7 && t < 8.7) {
        const win = ['C5', 'E5', 'G5', 'E5', 'F5', 'A5', 'C6', 'A5', 'G5', 'B5', 'D6', 'B5'];
        SFX.tone(win[step % 12], 0.12, { type: 'square', vol: 0.035 });
        if (step % 2 === 0) SFX.hat({ vol: 0.05 });
        if (step % 4 === 0) SFX.kick({ vol: 0.3 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      /* ---------- sounds ---------- */
      if (env.at(0.02)) SFX.tone('A4', 0.12, { type: 'square', vol: 0.07 });
      if (env.at(0.25)) SFX.tone('A4', 0.12, { type: 'square', vol: 0.07 });
      if (env.at(GO)) { SFX.tone('A5', 0.3, { type: 'square', vol: 0.08 }); SFX.whoosh({ vol: 0.15 }); }
      for (let k = 0; k < 30; k++) if (env.at(0.6 + k * 0.06)) SFX.type({ vol: 0.3 });
      SPLITS.forEach(([, st, , , col]) => {
        if (!env.at(st)) return;
        if (col === 'gold') SFX.coin({ vol: 0.1 });
        else if (col === 'green') SFX.chirp({ vol: 0.12 });
        else SFX.tone(200, 0.2, { type: 'square', vol: 0.06, slide: 150 });
      });
      if (env.at(2.5)) SFX.whoosh({ vol: 0.2 });
      for (let k = 0; k < 6; k++) if (env.at(2.65 + k * 0.09)) SFX.tick({ vol: 0.2 });
      for (let k = 0; k < 12; k++) if (env.at(3.15 + k * 0.05)) SFX.tone(200 + P.hash(k * 3.1) * 1600, 0.04, { type: 'square', vol: 0.05 });
      if (env.at(3.78)) { SFX.pop({ f: 700 }); SFX.chord(['E6', 'G6', 'B6'], 0.3, { gap: 0.04, type: 'square', vol: 0.04 }); }
      if (env.at(4.45)) SFX.boing({ vol: 0.14 });
      if (env.at(4.8)) { SFX.click(); SFX.thud({ vol: 0.3 }); }
      for (let k = 0; k < 6; k++) if (env.at(4.88 + k * 0.03)) SFX.type({ vol: 0.25 });
      if (env.at(STOP)) SFX.ding('E6', { vol: 0.16 });
      if (env.at(5.6)) { SFX.success({ vol: 0.2 }); SFX.chime({ vol: 0.12, when: 0.35 }); SFX.kick({ vol: 0.5 }); }
      CHAT.forEach((_, i) => { if (env.at(5.9 + i * 0.12)) SFX.tick({ vol: 0.18 }); });
      if (env.at(8.85)) SFX.tone(700, 0.35, { type: 'square', slide: 90, vol: 0.06 });

      P.gradient(ctx, '#1E1B45', '#2E2A5C');
      P.stars(ctx, t, 3, 26, 'rgba(255,255,255,0.5)', [0, 0, 1080, 1920]);

      /* ---------- the stage ---------- */
      ctx.save();
      P.wobblyRect(ctx, STAGE.x, STAGE.y, STAGE.w, STAGE.h, 7, 3, 24);
      P.cut(ctx, '#2A2550');
      P.wobblyRect(ctx, STAGE.x, STAGE.y, STAGE.w, STAGE.h, 7, 3, 24);
      ctx.clip();

      // --- editor phase ---
      const edOff = t < 5 ? -900 * ease.inCubic(prog(t, 2.45, 0.25)) : -900 * (1 - ease.outCubic(prog(t, 9.0, 0.35)));
      if (t < 2.75 || t >= 9.0) {
        ctx.save();
        ctx.translate(0, edOff);
        P.window(ctx, 110, 500, 860, 400, 'main.c', { bg: C.paper });
        const typing = t >= 9 ? 0 : prog(t, 0.6, 1.8);
        let left = Math.floor(CODE_LEN * typing);
        let lastX = 150, lastY = 620;
        CODE.forEach((ln, k) => {
          const s = ln.slice(0, Math.max(0, left)); left -= ln.length;
          const y = 620 + k * 78;
          P.text(ctx, String(k + 1), 128, y, { size: 30, font: 'mono', color: '#b8b0c4', align: 'left', shadow: false });
          if (s.length) {
            P.text(ctx, s, 170, y, { size: 44, font: 'mono', color: k === 1 ? C.purple : C.ink, align: 'left', shadow: false, weight: 700 });
            lastX = 170 + P.measure(ctx, s, { size: 44, font: 'mono', weight: 700 }); lastY = y;
          }
        });
        if (Math.floor(t * 4) % 2 === 0 || (typing > 0 && typing < 1)) P.rect(ctx, lastX + 4, lastY - 26, 6, 52, C.claude, { shadow: false, radius: 2, amp: 0 });
        const ac = pulse(t, 1.45, 0.45);
        if (ac > 0 && t < 5) {
          P.rect(ctx, 420, 720, 420, 66, '#fff', { radius: 12, seed: 33, shadow: { blur: 10, dy: 6, alpha: 0.25 } });
          P.text(ctx, '✨ hello world   ⇥ tab', 440, 754, { size: 32, font: 'mono', color: C.ink, align: 'left', shadow: false, scale: 1 });
        }
        // keyboard
        P.rect(ctx, 240, 1120, 600, 118, '#3d3a52', { radius: 20, seed: 34 });
        const kb = P.boil(t, 18);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) {
          const lit = t >= GO && t < 2.5 && P.hash(kb * 13 + r * 11 + c) > 0.82;
          P.rect(ctx, 262 + c * 52, 1134 + r * 32, 44, 26, lit ? C.yellow : '#eae3f2', { radius: 6, shadow: false, amp: 1, seed: r * 11 + c });
        }
        // flying keycaps
        if (t < 5) {
          for (let i = 0; i < 11; i++) {
            const b = 0.65 + i * 0.16, lt = t - b;
            if (lt < 0 || lt > 1.2) continue;
            const kx = 300 + P.hash(i * 5.3) * 480, vx = (P.hash(i * 2.1) - 0.5) * 500;
            const x = kx + vx * lt, y = 1150 - 900 * lt + 1300 * lt * lt;
            ctx.save(); ctx.translate(x, y); ctx.rotate(lt * 8 * (i % 2 ? 1 : -1));
            P.rect(ctx, -24, -20, 48, 40, '#eae3f2', { radius: 6, seed: i, shadow: { blur: 6, dy: 4, alpha: 0.3 } });
            P.text(ctx, 'hello world'[i], 0, 1, { size: 28, font: 'mono', color: C.ink, shadow: false });
            ctx.restore();
          }
        }
        // Clawd typing
        const typingNow = t >= GO && t < 2.5;
        const cy = typingNow ? 1010 + Math.sin(t * 40) * 4 : 1010 - Math.abs(Math.sin(t * 4)) * 26;
        if (typingNow) {
          for (let ghost = 2; ghost >= 0; ghost--) {
            const b = kb - ghost;
            ctx.save(); ctx.globalAlpha = ghost ? 0.25 : 1;
            P.arm(ctx, 300 + P.hash(b) * 220, 1150 + P.hash(b + 0.5) * 50, 480, 1030, 44);
            P.arm(ctx, 560 + P.hash(b + 7) * 220, 1150 + P.hash(b + 7.5) * 50, 600, 1030, 44);
            ctx.restore();
          }
        } else {
          P.arm(ctx, 380, 1140, 480, 1040, 44);
          P.arm(ctx, 700, 1140, 600, 1040, 44);
        }
        P.claude(ctx, 540, cy, 105, { t, mood: typingNow ? 'angry' : 'happy', squash: typingNow ? 0.1 : 0 });
        if (typingNow) {
          // speed lines
          ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          for (let k = 0; k < 4; k++) {
            const yy = 950 + k * 40, o = ((t * 6 + k * 0.3) % 1) * 60;
            ctx.beginPath(); ctx.moveTo(380 - o, yy); ctx.lineTo(330 - o, yy); ctx.moveTo(700 + o, yy); ctx.lineTo(750 + o, yy); ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      // --- platformer phase ---
      if (t >= 2.5 && t < 5.95) {
        const lx = 1000 * (1 - ease.outCubic(prog(t, 2.5, 0.3)));
        ctx.save();
        ctx.translate(lx, 0);
        P.gradient(ctx, '#3b2f7a', '#6b4e9b');
        P.stars(ctx, t, 11, 16, C.yellow, [60, 480, 960, 300]);
        P.circle(ctx, 250, 1180, 260, '#4a3c8c', { ry: 140, shadow: false, seed: 3 });
        P.circle(ctx, 800, 1190, 320, '#57489a', { ry: 160, shadow: false, seed: 4 });
        // ground
        P.rect(ctx, 30, GROUND, 1020, 140, C.green, { radius: 8, seed: 5 });
        ctx.fillStyle = C.brown; ctx.fillRect(40, GROUND + 34, 1000, 120);
        for (let k = 0; k < 16; k++) P.dot(ctx, 60 + k * 64, GROUND + 70 + (k % 2) * 30, 7, '#6e4630');
        // start sign
        P.rect(ctx, 96, 1030, 12, 120, C.wood, { radius: 3, shadow: false });
        P.rect(ctx, 70, 1000, 110, 50, C.paper, { radius: 8, seed: 6 });
        P.text(ctx, 'any% →', 125, 1026, { size: 26, font: 'marker', color: C.ink, shadow: false });
        // the wall
        const clipping = t >= 3.15 && t < 3.8;
        for (let r = 0; r < 10; r++) for (let c = 0; c < 2; c++) {
          const off = r % 2 ? 20 : 0;
          const bx = WALL.x + c * 40 - off + (r % 2 ? 0 : 0), by = WALL.top + r * 50;
          ctx.save(); ctx.beginPath(); ctx.rect(WALL.x, WALL.top, WALL.w, GROUND - WALL.top); ctx.clip();
          P.rect(ctx, bx, by, 38, 46, r % 3 ? '#B5533C' : '#A6452F', { radius: 4, seed: r * 2 + c, shadow: false, amp: 1 });
          if (r % 2) P.rect(ctx, WALL.x + 60, by, 38, 46, '#B5533C', { radius: 4, seed: r * 3, shadow: false, amp: 1 });
          ctx.restore();
        }
        ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.strokeRect(WALL.x, WALL.top, WALL.w, GROUND - WALL.top); ctx.restore();
        ctx.save(); ctx.translate(540, 590); ctx.rotate(-0.05 + (clipping ? Math.sin(t * 60) * 0.04 : 0));
        P.rect(ctx, -130, -44, 260, 88, C.paper, { radius: 10, seed: 8 });
        P.text(ctx, 'COMPILE STEP', 0, -8, { size: 36, font: 'bubble', color: C.red, shadow: false });
        P.text(ctx, 'ETA: 45 min', 0, 26, { size: 22, font: 'mono', color: '#8a8494', shadow: false });
        ctx.restore();
        // RUN button
        const pressed = t >= 4.8;
        P.rect(ctx, BTN[0] - 60, BTN[1] - 10, 120, 60, '#5b5866', { radius: 10, seed: 9 });
        P.circle(ctx, BTN[0], BTN[1] - 14, 46, C.red, { ry: pressed ? 12 : 26, seed: 10 });
        P.text(ctx, 'RUN ▶', BTN[0], GROUND + 80, { size: 34, font: 'bubble', color: '#fff', shadow: false });

        // Clawd the runner
        let px, py;
        if (t < 3.15) { px = lerp(160, 455, ease.inQuad(prog(t, 2.6, 0.55))); py = GROUND - 60 - Math.abs(Math.sin(t * 18)) * 30; }
        else if (t < 3.8) { px = 455 + P.hash(P.boil(t, 25)) * 90; py = GROUND - 60 - P.hash(P.boil(t, 25) + 3) * 20; }
        else if (t < 4.45) { px = lerp(640, 720, prog(t, 3.8, 0.65)); py = GROUND - 60 - Math.abs(Math.sin(t * 18)) * 30; }
        else { const j = prog(t, 4.45, 0.35); px = lerp(720, BTN[0], j); py = lerp(GROUND - 60, BTN[1] - 90, j) - Math.sin(j * Math.PI) * 160; }
        if (t >= 4.8) { px = BTN[0]; py = BTN[1] - 80 + Math.sin(t * 6) * 4; }
        const mood = clipping ? 'dead' : t < 3.8 ? 'angry' : t < 4.8 ? 'wow' : 'happy';
        if (clipping) {
          ctx.save(); ctx.globalAlpha = 0.55;
          P.claude(ctx, px - 16, py, 60, { t, mood: 'none', color: '#3ff0ff' });
          P.claude(ctx, px + 16, py, 60, { t, mood: 'none', color: '#ff3fd0' });
          ctx.restore();
        }
        P.claude(ctx, px, py, 60, { t, mood, rot: t < 3.15 ? 0.2 : 0, squash: pulse(t, 4.8, 0.2) * 0.4 });
        // glitch slices
        if (clipping) {
          for (let k = 0; k < 6; k++) {
            const h = P.hash(P.boil(t, 20) * 5 + k);
            ctx.fillStyle = k % 2 ? 'rgba(63,240,255,0.3)' : 'rgba(255,63,208,0.3)';
            ctx.fillRect(60 + (h - 0.5) * 300, 520 + h * 700, 960, 8 + h * 26);
          }
        }
        const fp = ease.outBack(prog(t, 3.4, 0.25)) * (1 - prog(t, 4.3, 0.2));
        P.title(ctx, 'FRAME PERFECT\nWALL CLIP', 540, 800, { size: 78, color: '#3ff0ff', stroke: C.ink, pop: fp, rot: 0.05, lineHeight: 1.05 });
        ctx.restore();
      }

      // --- terminal ---
      if (t >= 4.85 && t < 5.95) {
        const ty = lerp(1300, 560, ease.outBack(prog(t, 4.85, 0.2)));
        P.window(ctx, 140, ty, 800, 330, 'zsh', { bg: '#1D1A2B', titleColor: '#cfc6e0', bar: 'rgba(255,255,255,0.08)' });
        P.text(ctx, P.typed('$ ./a.out', prog(t, 4.9, 0.12)), 180, ty + 130, { size: 42, font: 'mono', color: '#cfc6e0', align: 'left', shadow: false });
        const hw = P.typed('hello world', prog(t, 5.08, 0.2));
        P.text(ctx, hw, 180, ty + 230, { size: 76, font: 'mono', color: '#7CFC9A', align: 'left', shadow: false, weight: 800 });
      }

      // --- WR overlay ---
      const wr = prog(t, 5.6, 0.25) * (1 - prog(t, 8.9, 0.25));
      if (wr > 0) {
        ctx.save(); ctx.globalAlpha = wr;
        P.rays(ctx, 540, 820, 22, '#6B4E9B', '#7d5fb0', t * 0.4);
        ctx.restore();
        const wp = ease.outBack(prog(t, 5.65, 0.4)) * (1 - ease.inCubic(prog(t, 8.8, 0.2)));
        P.title(ctx, 'NEW WORLD\nRECORD', 540, 640, { size: 124, color: C.yellow, stroke: C.ink, pop: wp, rot: Math.sin(t * 5) * 0.04, lineHeight: 1.0 });
        const tp = ease.outElastic(prog(t, 5.85, 0.7)) * (1 - ease.inCubic(prog(t, 8.8, 0.2)));
        P.title(ctx, '0:00.69', 540, 880, { size: 150, color: '#FFD54A', stroke: '#fff', pop: tp });
        P.text(ctx, '(IGT, glitched, no TAS, pinky promise)', 540, 975, { size: 30, font: 'marker', color: '#fff', scale: tp });
        const cb = Math.abs(Math.sin(t * 7)) * 30;
        P.claude(ctx, 390, 1130 - cb * wp, 100, { t, mood: 'happy', squash: cb < 5 ? 0.2 : 0, rot: -0.1 });
        if (wp > 0) {
          ctx.save(); ctx.translate(640, 1150); ctx.scale(wp, wp); ctx.rotate(Math.sin(t * 4) * 0.08);
          trophy(ctx, 0, 0, 0.9, t);
          ctx.restore();
        }
        P.confetti(ctx, t - 5.65, 540, 700, 9, 70, 700);
      }

      // --- RESET / READY / GO ---
      const rs = ease.outBack(prog(t, 8.85, 0.2)) * (1 - prog(t, 9.25, 0.12));
      if (rs > 0) P.title(ctx, 'RESET', 540, 850, { size: 170, color: C.red, pop: rs, rot: -0.08 });
      if (t < GO || t >= 9.35) {
        const blink = Math.floor(t * 6) % 2 === 0 ? 1 : 0.85;
        P.title(ctx, 'READY?', 540, 760, { size: 120, color: C.mint, stroke: C.ink, pop: blink * (t >= 9.35 ? ease.outBack(prog(t, 9.35, 0.25)) : 1) });
      }
      const gp = prog(t, GO, 0.45);
      if (gp > 0 && gp < 1) P.title(ctx, 'GO!', 540, 760, { size: 200 + gp * 120, color: C.green, stroke: '#fff', pop: 1 - ease.inCubic(gp) });
      ctx.restore(); // stage clip

      // chat spam flies in from the right (over everything)
      if (t >= 5.9 && t < 9.2) {
        CHAT.forEach((m, i) => {
          const s = 5.9 + i * 0.12, lt = t - s;
          if (lt < 0) return;
          const speed = 650 + P.hash(i * 1.7) * 450;
          const x = 1090 - lt * speed;
          if (x < -900) return;
          const y = 510 + P.hash(i * 4.3) * 700;
          chatChip(ctx, m, i, x, y, t);
        });
      }

      /* ---------- HUD: title + timer ---------- */
      P.rect(ctx, 60, 292, 960, 160, '#16132f', { radius: 22, seed: 50 });
      P.claude(ctx, 118, 348, 30, { t, mood: 'none', wiggle: 0.5 });
      P.text(ctx, 'Hello World%', 162, 350, { size: 48, font: 'bubble', color: '#fff', align: 'left', shadow: false });
      P.text(ctx, 'any% · glitched · attempt #4,812', 92, 412, { size: 26, font: 'mono', color: '#9d94b8', align: 'left', shadow: false });
      let timerVal = 0, timerCol = '#ffffff';
      if (t >= GO && t < STOP) { timerVal = interp(t, IGT); timerCol = '#5DE07A'; }
      else if (t >= STOP && t < 9.0) { timerVal = 0.69; timerCol = Math.floor(t * 5) % 2 && t < 6.2 ? '#fff' : '#FFD54A'; }
      const tsc = 1 + pulse(t, STOP, 0.3) * 0.2;
      P.text(ctx, fmt(timerVal), 990, 372, { size: 104, font: 'mono', color: timerCol, align: 'right', shadow: false, weight: 800, scale: tsc });

      /* ---------- splits ---------- */
      P.rect(ctx, 60, 1262, 590, 242, '#16132f', { radius: 18, seed: 51 });
      const cleared = t >= 9.0;
      const cur = SPLITS.findIndex(s => t < s[1]);
      SPLITS.forEach(([name, st, time, delta, col], k) => {
        const y = 1300 + k * 42;
        if (!cleared && t >= GO && k === cur) P.rect(ctx, 70, y - 19, 570, 38, 'rgba(79,127,217,0.45)', { radius: 8, shadow: false, amp: 1, seed: k });
        P.text(ctx, name, 90, y, { size: 30, font: 'marker', color: '#e8e2f5', align: 'left', shadow: false });
        const done = !cleared && t >= st;
        if (done) {
          const pp = ease.outBack(prog(t, st, 0.25));
          P.text(ctx, delta, 500, y, { size: 26, font: 'mono', color: DELTA_COL[col], align: 'right', shadow: false, weight: 800, scale: pp });
          P.text(ctx, time, 625, y, { size: 28, font: 'mono', color: '#fff', align: 'right', shadow: false, weight: 700 });
        } else P.text(ctx, '—', 625, y, { size: 28, font: 'mono', color: '#6d6590', align: 'right', shadow: false });
      });
      // little stats
      P.text(ctx, 'PB  0:00.73', 680, 1300, { size: 26, font: 'mono', color: '#9d94b8', align: 'left' });
      P.text(ctx, 'SoB 0:00.66', 680, 1340, { size: 26, font: 'mono', color: '#9d94b8', align: 'left' });
      P.text(ctx, 'compiler:', 680, 1380, { size: 26, font: 'mono', color: '#9d94b8', align: 'left' });
      P.text(ctx, t >= 3.8 && t < 9 ? 'skipped' : 'waiting', 680, 1414, { size: 26, font: 'mono', color: t >= 3.8 && t < 9 ? '#FFD54A' : '#9d94b8', align: 'left' });

      /* ---------- sticker ---------- */
      if (t < 5.6) P.sticker(ctx, 'no compiler was harmed', 70, 1560, { size: 42, pop: 1 });
      else if (t < 8.85) P.sticker(ctx, "chat i'm literally shaking", 70, 1560, { size: 42, pop: ease.outBack(prog(t, 5.8, 0.3)), rot: 0.02 });
      else P.sticker(ctx, 'going for 0:00.68', 70, 1560, { size: 42, pop: ease.outBack(prog(t, 8.95, 0.3)) });
    },
  });
})();
