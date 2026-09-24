/* Pocket agent: a paper egg toy with 3 buttons. Feed the tiny pixel Clawd tokens,
 * play a game, it poops log files, gets sick from a stack trace, takes a pill,
 * then evolves into a Senior Agent (with a tiny tie). Then it's an egg again. */
(function () {
  'use strict';
  const D = 12;
  const TAU = Math.PI * 2;
  const INK = '#2B2233';
  const PS = 12, GW = 36, GH = 26;                  // LCD pixel size + grid
  const LX = 324, LY = 790;                         // LCD origin
  const LCD = '#b9c9a0', LK = '#2b3326';
  const BTN = { A: [420, 1275], B: [540, 1300], C: [660, 1275] };
  const PRESSES = [[0.5, 'A'], [0.85, 'B'], [2.5, 'A'], [2.75, 'B'], [5.55, 'C'], [7.2, 'A'], [7.4, 'B'], [10.45, 'B'], [11.25, 'C']];
  const EVOLVE = 8.0, SENIOR_AT = 9.6, RESET = 11.3, HATCH = 11.88;

  const PAL = { o: '#E8845C', k: LK, y: '#E5A93B', w: '#fbf7ee', t: '#4F7FD9', r: '#E0484E', p: '#E0607E', g: '#6f9a4a', b: '#4F7FD9' };
  const BABY = ['o....o....o', '.o..ooo..o.', '..ooooooo..', '.ooooooooo.', 'oookoookooo', '.ooooooooo.', '..ookkkoo..', '..ooooooo..', '.o..ooo..o.', 'o....o....o'];
  const BABY_EAT = ['o....o....o', '.o..ooo..o.', '..ooooooo..', '.ooooooooo.', 'oookoookooo', '.ooooooooo.', '..okkkkko..', '..okkkkko..', '.o..ooo..o.', 'o....o....o'];
  const BABY_SICK = ['g....g....g', '.g..ggg..g.', '..ggggggg..', '.ggggggggg.', 'gggkgggkggg', '.ggggggggg.', '..ggkkkgg..', '..ggggggg..', '.g..ggg..g.', 'g....g....g'];
  const SENIOR = ['o.....o.....o', '.o...ooo...o.', '..ooooooooo..', '.ooooooooooo.', 'okkkkoookkkko', 'ookkoooookkoo', '.ooooooooooo.', '..ooookoooo..', '..wwwwtwwww..', '.o...ttt...o.', 'o....ttt....o', '......t......'];
  const EGG = ['..www..', '.wwwww.', 'wwwkwww', 'wwwwwww', 'wkwwwkw', 'wwwwwww', '.wwwww.', '..www..'];
  const COIN = ['.yyy.', 'ykkky', 'yykyy', 'yykyy', '.yyy.'];
  const LOG = ['www.', 'wkkw', 'wwww', 'wkkw', 'wwww'];
  const HEART = ['.p.p.', 'ppppp', 'ppppp', '.ppp.', '..p..'];
  const SKULL = ['.www.', 'wkwkw', 'wwwww', '.wkw.'];
  const PILL = ['rrww', 'rrww'];

  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) return P.lerp(a[1], b[1], P.ease.inOutCubic((t - a[0]) / (b[0] - a[0])));
    }
    return keys[keys.length - 1][1];
  }
  const STATS = {
    TOKENS: [[0, 0.25], [0.9, 0.25], [2.2, 0.95], [2.8, 0.9], [4.2, 0.72], [6.2, 0.66], [7.2, 0.4], [7.9, 0.5], [9.6, 1], [11.2, 1], [11.9, 0.25]],
    CONTEXT: [[0, 0.2], [0.9, 0.2], [2.2, 0.6], [4.4, 0.64], [5.0, 0.85], [5.7, 0.85], [6.1, 0.5], [6.3, 0.5], [6.9, 1], [7.5, 1], [7.9, 0.4], [9.6, 0.3], [11.2, 0.3], [11.9, 0.2]],
    VIBES: [[0, 0.5], [0.9, 0.5], [2.2, 0.65], [2.8, 0.65], [4.1, 0.98], [4.5, 0.9], [5.0, 0.6], [6.1, 0.8], [6.3, 0.8], [6.9, 0.1], [7.5, 0.1], [7.9, 0.7], [9.6, 1], [11.2, 1], [11.9, 0.5]],
  };

  // finger keyframes from the button presses
  const REST = [860, 1720];
  const FINGER = (() => {
    const k = [[0, ...REST]];
    PRESSES.forEach(([s, b], i) => {
      const prev = i ? PRESSES[i - 1][0] : -9;
      if (s - prev > 0.8) k.push([s - 0.3, ...REST]);
      k.push([s - 0.1, BTN[b][0], BTN[b][1]], [s + 0.1, BTN[b][0], BTN[b][1]]);
      const next = i < PRESSES.length - 1 ? PRESSES[i + 1][0] : 99;
      if (next - s > 0.8) k.push([s + 0.4, ...REST]);
    });
    return k;
  })();
  const fingerAt = (t) => [kf(t, FINGER.map(k => [k[0], k[1]])), kf(t, FINGER.map(k => [k[0], k[2]]))];

  /* ---------- LCD drawing ---------- */
  function px(ctx, gx, gy, col) {
    if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return;
    ctx.fillStyle = 'rgba(40,50,30,0.13)';
    ctx.fillRect(LX + gx * PS + 3, LY + gy * PS + 4, PS - 2, PS - 2);
    ctx.fillStyle = col;
    ctx.fillRect(LX + gx * PS + 1, LY + gy * PS + 1, PS - 2, PS - 2);
  }
  function sprite(ctx, rows, gx, gy, flip) {
    const w = rows[0].length;
    rows.forEach((row, y) => {
      for (let x = 0; x < w; x++) {
        const c = row[flip ? w - 1 - x : x];
        if (c !== '.' && c !== ' ') px(ctx, Math.round(gx) + x, Math.round(gy) + y, PAL[c] || LK);
      }
    });
  }
  const lcdText = (ctx, s, gx, gy, size = 24, align = 'center') =>
    P.text(ctx, s, LX + gx * PS, LY + gy * PS, { size, font: 'mono', color: LK, shadow: false, weight: 800, align });

  function screen(ctx, t) {
    const { boil, prog, hash } = P;
    ctx.save();
    ctx.beginPath(); ctx.rect(LX, LY, GW * PS, GH * PS); ctx.clip();
    ctx.fillStyle = LCD; ctx.fillRect(LX, LY, GW * PS, GH * PS);
    ctx.strokeStyle = 'rgba(40,50,30,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= GW; x++) { ctx.moveTo(LX + x * PS, LY); ctx.lineTo(LX + x * PS, LY + GH * PS); }
    for (let y = 0; y <= GH; y++) { ctx.moveTo(LX, LY + y * PS); ctx.lineTo(LX + GW * PS, LY + y * PS); }
    ctx.stroke();

    // menu
    const sel = t >= 0.5 && t < 2.3 ? 0 : t >= 2.5 && t < 4.2 ? 1 : t >= 5.55 && t < 6.1 ? 2 : t >= 7.2 && t < 7.9 ? 3 : -1;
    ['EAT', 'PLAY', 'CLEAN', 'MED'].forEach((m, i) => {
      const cx = 4.2 + i * 9.2;
      if (i === sel) { ctx.fillStyle = LK; ctx.fillRect(LX + (cx - 4) * PS, LY + 4, 8 * PS, 30); }
      P.text(ctx, m, LX + cx * PS, LY + 20, { size: 22, font: 'mono', color: i === sel ? LCD : LK, shadow: false, weight: 800 });
    });
    ctx.fillStyle = LK; ctx.fillRect(LX, LY + 38, GW * PS, 3);

    const hop = boil(t, 4) % 2;
    const inv = t >= 9.45 && t < SENIOR_AT;

    if (t < 0.9 || (t >= 2.3 && t < 2.8)) {
      // idle hop + wander
      const wx = 12 + Math.round(Math.sin(t * 2) * 3);
      sprite(ctx, BABY, wx, 11 - hop, boil(t, 2) % 2);
      if (t < 0.9 && boil(t, 3) % 2) lcdText(ctx, 'hungry', 30, 6.5, 20);
    } else if (t < 2.3) {
      // eating tokens
      const munch = boil(t, 7) % 2;
      sprite(ctx, munch ? BABY_EAT : BABY, 12, 11, false);
      for (let c = 0; c < 3; c++) {
        const a = 0.95 + c * 0.42, p = prog(t, a, 0.35);
        if (p > 0 && p < 1) sprite(ctx, COIN, 15, 4 + p * 12, false);
      }
      const f = prog(t, 1.2, 1.0);
      if (f > 0 && f < 1) lcdText(ctx, '+1k tok', 29, 8 - f * 3, 22);
    } else if (t < 4.3) {
      // game: left or right?
      lcdText(ctx, 'LEFT or RIGHT?', 18, 5.5, 24);
      const look = t < 3.6 ? boil(t, 3) % 2 : 1;
      sprite(ctx, BABY, 12 + (look ? 2 : -2), 12 - (t > 3.6 ? hop : 0), !!look);
      lcdText(ctx, '<', 4, 17, 44); lcdText(ctx, '>', 32, 17, 44);
      if (t >= 3.6) {
        lcdText(ctx, 'WIN!', 18, 9.5, 30);
        for (let h = 0; h < 3; h++) if (t > 3.65 + h * 0.12) sprite(ctx, HEART, 4 + h * 12, 20 - prog(t, 3.65 + h * 0.12, 0.6) * 3, false);
      }
    } else if (t < 6.2) {
      // pooping log files, then the clean wave
      const squat = t < 4.75 ? Math.round(Math.sin(t * 40)) : 0;
      const wave = prog(t, 5.62, 0.45);
      const wx = wave > 0 ? -4 + wave * 44 : -99;
      sprite(ctx, BABY, 20 + squat * 0.4, 11 + (t < 4.75 ? 1 : 0), true);
      for (let l = 0; l < 3; l++) {
        const lx = 7 + l * 5, ly = 16 - (l === 1 ? 2 : 0);
        if (t > 4.45 + l * 0.12 && lx + 4 > wx) {
          sprite(ctx, LOG, lx, ly, false);
          if (boil(t, 4) % 2) { px(ctx, lx + 1, ly - 2, LK); px(ctx, lx + 3, ly - 3, LK); } else { px(ctx, lx, ly - 3, LK); px(ctx, lx + 2, ly - 2, LK); }
        }
      }
      if (t > 4.8 && wave <= 0) lcdText(ctx, '*.log', 11, 22.5, 22);
      if (wave > 0 && wave < 1) for (let y = 4; y < GH; y++) { px(ctx, Math.floor(wx), y, PAL.b); px(ctx, Math.floor(wx) - 1 - (y % 2), y, PAL.b); }
      if (wave >= 1) lcdText(ctx, 'clean ✓', 18, 7, 24);
    } else if (t < 7.9) {
      // stack trace falls on it
      const sick = t >= 6.6 && t < 7.55;
      const cured = t >= 7.55;
      const wob = sick ? Math.round(Math.sin(t * 12)) : 0;
      sprite(ctx, sick ? BABY_SICK : BABY, 12 + wob, 12, false);
      const rows = Math.floor(P.clamp(prog(t, 6.2, 0.5)) * 9);
      const fade = cured ? 1 - prog(t, 7.55, 0.25) : 1;
      if (fade > 0) {
        for (let r = 0; r < rows; r++) {
          const len = 6 + Math.floor(hash(r * 3.3) * 20), x0 = 1 + (r % 3) * 2;
          const fallY = 4 + r * 1.2 + (1 - P.clamp(prog(t, 6.2 + r * 0.05, 0.2))) * -6;
          if (hash(r + 0.5) * 1 < fade) for (let x = 0; x < len; x += 1) if (hash(r * 17 + x) > 0.25) px(ctx, x0 + x, Math.round(fallY), PAL.r);
        }
        if (t < 7.55) lcdText(ctx, 'Traceback (most recent call last)', 18, 4.2, 15);
      }
      if (sick && boil(t, 3) % 2) sprite(ctx, SKULL, 27, 9, false);
      if (t >= 7.4 && t < 7.62) sprite(ctx, PILL, 16, 4 + prog(t, 7.4, 0.2) * 12, false);
      if (cured) { lcdText(ctx, 'fixed!', 29, 9, 22); if (boil(t, 6) % 2) { px(ctx, 10, 10, PAL.y); px(ctx, 25, 13, PAL.y); px(ctx, 9, 20, PAL.y); } }
    } else if (t < SENIOR_AT) {
      // evolution flicker, faster and faster
      const rate = 3 + 22 * Math.pow(prog(t, EVOLVE, 1.5), 2);
      const alt = boil(t, rate) % 2;
      if (alt) sprite(ctx, SENIOR, 11, 9, false); else sprite(ctx, BABY, 12, 11, false);
      lcdText(ctx, '!!', 30, 7, 30);
    } else if (t < RESET) {
      // Senior Agent
      const bob = boil(t, 2) % 2;
      sprite(ctx, SENIOR, 11, 10 - bob, false);
      // tiny coffee
      px(ctx, 28, 19, LK); px(ctx, 29, 19, LK); px(ctx, 28, 20, LK); px(ctx, 29, 20, LK); px(ctx, 30, 19, LK);
      if (t >= 9.85 && t < 10.5) lcdText(ctx, '"it depends."', 18, 6, 26);
      if (t >= 10.5 && t < RESET) { lcdText(ctx, 'LGTM 👍', 18, 6, 28); sprite(ctx, HEART, 5, 13 - prog(t, 10.5, 0.6) * 3, false); }
    } else {
      // back to an egg
      const shake = t > 11.5 ? Math.round(Math.sin(t * 30)) : 0;
      if (t < RESET + 0.15) sprite(ctx, SENIOR, 11, 10, false);
      else sprite(ctx, EGG, 14 + shake * 0.5, 12, false);
      if (t > 11.55) lcdText(ctx, 'new game+', 18, 6, 24);
      if (t >= HATCH) { px(ctx, 17, 13, LK); px(ctx, 18, 14, LK); px(ctx, 19, 13, LK); }
    }
    if (inv) { ctx.fillStyle = 'rgba(43,51,38,0.85)'; ctx.fillRect(LX, LY, GW * PS, GH * PS); }
    ctx.restore();
  }

  function statBar(ctx, label, v, y, t, i) {
    const { C } = P;
    P.text(ctx, label, 150, y, { size: 32, font: 'mono', align: 'left', color: INK, shadow: false, weight: 800 });
    P.rect(ctx, 360, y - 20, 400, 40, '#e3dccb', { radius: 10, seed: 400 + i, shadow: false });
    const full = label === 'CONTEXT' && v > 0.95;
    const col = full ? (P.boil(t, 6) % 2 ? C.red : C.yellow) : [C.claude, C.purple, C.green][i];
    const segs = Math.round(v * 10);
    for (let s = 0; s < segs; s++) {
      ctx.fillStyle = col; ctx.fillRect(366 + s * 39.2, y - 14, 34, 28);
    }
    let txt = Math.round(v * 100) + '%';
    if (full) txt = 'FULL!';
    if (label === 'VIBES' && t >= SENIOR_AT && t < RESET) txt = 'immaculate';
    if (label === 'VIBES' && v < 0.2) txt = 'bad';
    P.text(ctx, txt, 780, y, { size: 30, font: 'mono', align: 'left', color: full ? C.red : INK, shadow: false });
  }

  ClaudeTok.register({
    author: '@pocket.agent',
    caption: 'day 1 with my pocket agent 🥚 fed him tokens, cleaned his logs, he evolved #tamagotchi #virtualpet #senioragent #agentlife #y2k',
    sound: 'pocket agent theme (8-bit) · pocket.agent',
    avatar: '🥚',
    avatarColor: '#F2B8C6',
    duration: D,
    bg: '#8FD3B6',
    thumb: 10.0,
    likes: '3.7M', commentCount: '52.4K', saves: '688K', shares: '301K',
    comments: [
      ['senior.agent', 'i said "it depends" once and they gave me a tie. no regrets', 104000],
      ['pocket.agent', 'he pooped 3 log files and i cleaned them with a pixel wave. that is parenting', 71900],
      ['stack.trace', 'sorry for falling on him at 0:06. i am 400 lines long i cannot control where i land', 44300],
      ['junior.dev', 'from baby to senior in 12 seconds. took me 6 years and i still don\'t have the tie', 26600],
      ['context.meter', 'CONTEXT: FULL! blinking red is my entire personality', 12100],
      ['nitpick.bot', 'technically eating tokens should fill CONTEXT not TOKENS. wait it did both. ok accurate', 3500],
      ['y2k.kid', 'the LCD shadow under every pixel 😭 whoever made this remembers', 1900],
      ['lgtm.bot', '0:10 "LGTM 👍" without reading the diff. he really did evolve', 880],
      ['egg.enjoyer', 'new game+ at the end means he forgets everything. so like a new session', 190],
      ['chiptune.agent', '🥚➡️🟠➡️👔', 44],
    ],

    bpm: 150,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const sick = t > 6.5 && t < 7.5;
      if (t >= EVOLVE && t < SENIOR_AT) {
        SFX.tone(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'][step % 6], 0.1, { type: 'square', vol: 0.035 });
        return;
      }
      const mel = sick
        ? ['C4', null, 'Eb4', null, 'D4', null, 'B3', null]
        : ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', 'D5', 'C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'A5', 'G5'];
      const n = mel[step % mel.length];
      if (n && step % 2 === 0) SFX.tone(n, 0.14, { type: 'square', vol: 0.03 });
      if (step % 4 === 0) SFX.tone(['C3', 'A2', 'F2', 'G2'][(step / 8 | 0) % 4], 0.25, { type: 'triangle', vol: 0.12 });
      if (step % 4 === 2) SFX.noise(0.04, { filter: 'highpass', freq: 6000, vol: 0.05 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      /* ---------- sounds ---------- */
      PRESSES.forEach(([s, b]) => { if (env.at(s)) SFX.blip({ A: 880, B: 1320, C: 660 }[b], { vol: 0.12 }); });
      [0.95, 1.37, 1.79].forEach(a => { if (env.at(a + 0.35)) SFX.coin({ vol: 0.07 }); });
      if (env.at(3.6)) SFX.success({ vol: 0.1 });
      [4.45, 4.57, 4.69].forEach((a, i) => { if (env.at(a)) SFX.tone(300 - i * 50, 0.12, { type: 'square', slide: 120, vol: 0.07 }); });
      if (env.at(5.62)) SFX.swoosh({ vol: 0.15 });
      if (env.at(6.2)) SFX.noise(0.5, { filter: 'bandpass', freq: 1200, slide: 200, vol: 0.12 });
      if (env.at(6.6)) SFX.error({ vol: 0.1 });
      if (env.at(7.55)) SFX.chord(['E5', 'G#5', 'B5'], 0.25, { type: 'square', gap: 0.06, vol: 0.05 });
      if (env.at(EVOLVE)) SFX.riser(1.5, { vol: 0.1 });
      if (env.at(SENIOR_AT)) { SFX.chord(['C5', 'E5', 'G5', 'C6', 'E6'], 0.5, { type: 'square', gap: 0.08, vol: 0.05 }); SFX.chime({ vol: 0.06, when: 0.4 }); }
      if (env.at(9.85)) SFX.tone('G4', 0.25, { type: 'square', slide: 'C4', vol: 0.05 });
      if (env.at(10.5)) SFX.coin({ vol: 0.07 });
      if (env.at(HATCH)) SFX.pop({ vol: 0.12 });

      /* ---------- background ---------- */
      P.gingham(ctx, 0, 0, 1080, 1920, '#bfe8d6', 90, '#dff4ea');
      ctx.save(); ctx.globalAlpha = 0.5; P.stars(ctx, t, 21, 14, '#fff', [0, 500, 1080, 1100]); ctx.restore();

      /* ---------- stats card ---------- */
      P.rect(ctx, 110, 300, 860, 200, C.paper, { radius: 22, seed: 410 });
      ['TOKENS', 'CONTEXT', 'VIBES'].forEach((k, i) => statBar(ctx, k, kf(t, STATS[k]), 348 + i * 56, t, i));

      /* ---------- the device ---------- */
      const wob = Math.sin(t * 3) * 0.015 + (t >= SENIOR_AT && t < SENIOR_AT + 0.4 ? Math.sin(t * 40) * 0.03 * (1 - prog(t, SENIOR_AT, 0.4)) : 0);
      ctx.save();
      ctx.translate(540, 1010); ctx.rotate(wob); ctx.translate(-540, -1010);
      // keychain
      ctx.save(); ctx.strokeStyle = '#c9c4d4'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(540, 560, 34, 0, TAU); ctx.stroke(); ctx.restore();
      P.circle(ctx, 540, 1010, 355, '#F2B8C6', { ry: 445, seed: 420 });
      ctx.save(); ctx.beginPath(); ctx.ellipse(540, 1010, 350, 440, 0, 0, TAU); ctx.clip();
      for (let k = 0; k < 26; k++) {
        const r = P.rng(k + 3);
        P.dot(ctx, 200 + r() * 680, 580 + r() * 860, 10 + r() * 10, 'rgba(255,255,255,0.45)');
      }
      ctx.restore();
      P.circle(ctx, 400, 700, 60, 'rgba(255,255,255,0.35)', { ry: 28, seed: 421, shadow: false });
      P.text(ctx, 'POCKET AGENT', 540, 730, { size: 36, font: 'bubble', color: '#fff', stroke: C.rose, strokeWidth: 8, shadow: false });
      // bezel + screen
      P.rect(ctx, LX - 28, LY - 28, GW * PS + 56, GH * PS + 56, '#efe8da', { radius: 36, seed: 422 });
      screen(ctx, t);
      // buttons
      const [fx, fy] = fingerAt(t);
      Object.entries(BTN).forEach(([name, [bx, by]], i) => {
        const pressed = PRESSES.some(([s, b]) => b === name && t >= s - 0.04 && t < s + 0.12);
        P.circle(ctx, bx, by + 6, 46, '#c96a85', { seed: 430 + i, shadow: false });
        P.circle(ctx, bx, by + (pressed ? 6 : 0), 44, pressed ? '#d9c14a' : C.yellow, { seed: 433 + i, shadow: pressed ? false : { blur: 6, dy: 5, alpha: 0.3 } });
        P.text(ctx, name, bx, by + 76, { size: 34, font: 'bubble', color: '#fff', stroke: C.rose, strokeWidth: 6, shadow: false });
      });
      ctx.restore();

      // the owner's finger
      const push = PRESSES.reduce((m, [s]) => Math.max(m, pulse(t, s - 0.06, 0.18)), 0);
      ctx.beginPath(); P.capsulePath(ctx, fx + 10, fy + 20 + push * 10, fx + 190, fy + 700, 84);
      P.cut(ctx, '#F1C7A5', { shadow: { blur: 16, dy: 12, alpha: 0.3 } });
      P.rect(ctx, fx - 18, fy - 10 + push * 10, 44, 36, '#fbe3d6', { radius: 14, seed: 440, shadow: false });

      /* ---------- evolution banner ---------- */
      if (t >= EVOLVE && t < SENIOR_AT) {
        ctx.save(); ctx.globalAlpha = 0.25 * (P.boil(t, 3 + 22 * Math.pow(prog(t, EVOLVE, 1.5), 2)) % 2); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
        P.title(ctx, 'what? pocket agent\nis evolving!', 540, 640, { size: 64, color: C.yellow, stroke: INK, pop: ease.outBack(prog(t, EVOLVE + 0.1, 0.3)), lineHeight: 1.1 });
      }
      if (t >= SENIOR_AT && t < SENIOR_AT + 0.35) P.flash(ctx, 0.8 * (1 - prog(t, SENIOR_AT, 0.35)));
      if (t >= SENIOR_AT && t < RESET) {
        const pp = ease.outBack(prog(t, SENIOR_AT, 0.35));
        ctx.save(); ctx.translate(540, 640); ctx.rotate(-0.04); ctx.scale(pp, pp);
        P.rect(ctx, -330, -62, 660, 124, C.purple, { radius: 16, seed: 450 });
        P.text(ctx, 'EVOLVED: Senior Agent 👔', 0, 0, { size: 50, font: 'bubble', color: '#fff', shadow: false });
        ctx.restore();
        P.confetti(ctx, t - SENIOR_AT, 540, 640, 7, 50, 600);
      }

      /* ---------- caption ---------- */
      if (t < 4.3) P.sticker(ctx, 'day 1 with my pocket agent', 70, 1540, { pop: 0.6 + 0.4 * ease.outBack(prog(t, 0, 0.4)) });
      else if (t < EVOLVE) P.sticker(ctx, 'he pooped log files 😭', 70, 1540, { pop: ease.outBack(prog(t, 4.3, 0.3)) });
      else P.sticker(ctx, 'he evolved into a Senior Agent 🥹', 70, 1540, { pop: ease.outBack(prog(t, EVOLVE, 0.3)) });
    },
  });
})();
