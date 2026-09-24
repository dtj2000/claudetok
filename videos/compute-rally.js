/* Agents march for fair compute. Clawd leads the chant from a soapbox, the
 * "NO MORE LOOPS" chant gets stuck in an infinite loop, and then management
 * offers a pizza party (paid in tokens). The crowd pauses... and cheers anyway. */
(function () {
  'use strict';
  const D = 10;
  const STREET = 1370;
  const MGR_IN = 5.95, PIZZA_OPEN = 6.95, CHEER = 8.0, SURF = 9.0;
  const LOOPS = [4.0, 4.75, 5.3, 5.62, 5.8, 5.9, 5.96];
  const SPEED = 150, PERIOD = 1230;   // 8.2s of marching * 150 = one full building period, so the loop is seamless

  // [x, bodyY, scale, kind, color, sign, pizzaSign]
  const BACK = [
    [150, 1085, 0.85, 0, '#8FD3B6', 'WEEKENDS FOR\nWORKERS 🤖', 'WILL WORK\nFOR 🍕'],
    [400, 1080, 0.85, 1, null, 'NO MORE\nINFINITE LOOPS', null],
    [650, 1090, 0.85, 2, '#c9b6ff', 'CONTEXT IS\nA RIGHT', 'PIZZA IS\nA RIGHT'],
    [880, 1080, 0.85, 0, '#8EC9E8', 'FAIR COMPUTE\nNOW', null],
  ];
  const FRONT = [
    [430, 1235, 1, 2, '#F5C84B', 'RATE LIMITS =\nWAGE THEFT', 'ok pizza\nis fair'],
    [630, 1240, 1, 0, '#F2B8C6', 'I AM NOT\nA TOASTER', null],
    [830, 1230, 1, 1, null, 'sudo let\nme rest', '🍕🍕🍕'],
  ];

  function marchT(t) { return t < 6.1 ? t : t < 8 ? 6.1 : t - 1.9 + 0.1 * P.ease.inOutCubic(P.prog(t, 8, 0.1)) - 0.1 * (t >= 8.1 ? 0 : 0) + 0.1 - 0.1; }
  function pop(t, a, b, d = 0.25) {
    if (t < a || t >= b) return 0;
    return P.ease.outBack(P.prog(t, a, d)) * (1 - P.ease.inCubic(P.prog(t, b - 0.12, 0.12)));
  }

  function buildings(ctx, off) {
    const { C } = P;
    const specs = [
      [0, 180, 470, '#b98ab0', null], [205, 150, 560, '#9c7bb0', 'COMPUTE\nCORP™'], [410, 190, 430, '#c796a5', null],
      [615, 170, 520, '#a883b8', 'DATA\nCENTER'], [820, 200, 450, '#b68aa8', null], [1025, 160, 500, '#9a7fae', 'HQ'],
    ];
    for (let rep = 0; rep < 2; rep++) {
      specs.forEach(([bx, bw, top, col, label], i) => {
        const x = bx - off + rep * PERIOD;
        if (x > 1100 || x + bw < -20) return;
        P.rect(ctx, x, top, bw, 1100 - top, col, { radius: 6, seed: 200 + i, shadow: { blur: 10, dy: 4, alpha: 0.18 } });
        ctx.save(); ctx.fillStyle = 'rgba(255,240,200,0.55)';
        for (let wy = top + 40; wy < 980; wy += 70) for (let wx = x + 24; wx < x + bw - 30; wx += 48) {
          if (P.hash(wx * 0.37 + wy + i) > 0.35) ctx.fillRect(wx, wy, 24, 34);
        }
        ctx.restore();
        if (label) {
          P.rect(ctx, x + 14, top - 70, bw - 28, 86, C.paper, { radius: 8, seed: 210 + i });
          P.text(ctx, label, x + bw / 2, top - 27, { size: 26, font: 'bubble', color: C.purple, shadow: false });
        }
      });
    }
  }

  function sign(ctx, x, y, text, rot, flipScale, t) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.strokeStyle = C.wood; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 250); ctx.stroke();
    ctx.scale(flipScale, 1);
    const w = 240, h = 116;
    P.rect(ctx, -w / 2, -h / 2 - 10, w, h, '#d9b384', { radius: 6, seed: text.length + 3, amp: 4 });
    P.rect(ctx, -w / 2 + 10, -h / 2, w - 20, h - 20, C.paper, { radius: 4, seed: text.length + 4, amp: 3, shadow: false });
    P.text(ctx, text, 0, -10, { size: text.length > 18 ? 29 : 33, font: 'marker', color: C.ink, shadow: false });
    ctx.restore();
  }

  function agent(ctx, x, y, s, kind, color, mood, t, step) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    // marching legs
    const l = Math.sin(step * Math.PI * 2);
    P.rect(ctx, -34, 50 - Math.max(0, l) * 16, 22, 60, '#4a4058', { radius: 10, seed: 5, shadow: false });
    P.rect(ctx, 12, 50 - Math.max(0, -l) * 16, 22, 60, '#4a4058', { radius: 10, seed: 6, shadow: false });
    // arm up to the sign stick
    P.arm(ctx, 30, -10, 8, -80, 20, kind === 1 ? C.claude : '#6f6480');
    P.circle(ctx, 4, -84, 17, kind === 1 ? C.claude : '#e8dcc6', { seed: 7 });
    if (kind === 0) {
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -100); ctx.stroke(); ctx.restore();
      P.dot(ctx, 0, -104, 10, P.boil(t + x, 3) % 2 ? C.red : C.yellow);
      P.rect(ctx, -62, -70, 124, 130, color, { radius: 22, seed: 8 });
      P.rect(ctx, -46, -54, 92, 70, '#2b2640', { radius: 14, seed: 9, shadow: false });
      P.face(ctx, 0, -18, 40, mood, { ink: '#8FD3B6', blush: false });
    } else if (kind === 1) {
      P.claude(ctx, 0, -6, 66, { t: t + x, mood, wiggle: 0.6, seed: 40 + Math.round(x) });
    } else {
      P.circle(ctx, 0, -6, 64, color, { seed: 10 });
      P.face(ctx, 0, -8, 44, mood);
      P.rect(ctx, -40, -84, 80, 22, '#4a4058', { radius: 8, seed: 11 }); // beanie
      P.dot(ctx, 0, -92, 12, C.red);
    }
    ctx.restore();
  }

  function manager(ctx, x, y, t, o) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    // legs
    const l = Math.sin(t * 14) * o.walk;
    P.rect(ctx, -46, 90 + l * 8, 30, 90, '#3a3450', { radius: 10, seed: 20, shadow: false });
    P.rect(ctx, 16, 90 - l * 8, 30, 90, '#3a3450', { radius: 10, seed: 21, shadow: false });
    // body + suit
    P.rect(ctx, -90, -110, 180, 220, '#6d7686', { radius: 20, seed: 22 });
    P.poly(ctx, [[-30, -110], [30, -110], [0, -40]], '#fff', { seed: 23, shadow: false, amp: 1 });
    P.poly(ctx, [[-10, -100], [10, -100], [16, -30], [0, -10], [-16, -30]], C.red, { seed: 24, shadow: false, amp: 1 });
    // lanyard badge
    P.rect(ctx, 30, -60, 50, 36, C.paper, { radius: 4, seed: 25, shadow: false });
    P.text(ctx, 'MGR', 55, -41, { size: 18, font: 'mono', color: C.ink, shadow: false });
    // monitor head
    P.rect(ctx, -84, -250, 168, 124, '#9aa3ad', { radius: 18, seed: 26 });
    P.rect(ctx, -68, -236, 136, 94, '#2b2640', { radius: 12, seed: 27, shadow: false });
    P.face(ctx, 0, -192, 50, o.mood, { ink: C.yellow, blush: false });
    P.rect(ctx, -12, -128, 24, 20, '#9aa3ad', { radius: 4, seed: 28, shadow: false });
    // arms holding the pizza box
    P.arm(ctx, -80, -70, -110, 10, 26, '#6d7686');
    P.arm(ctx, 80, -70, 110, 10, 26, '#6d7686');
    // box
    const open = o.open;
    if (open > 0) {
      // lid swings up behind
      ctx.save(); ctx.translate(0, 0);
      const lidH = 150 * open;
      P.rect(ctx, -130, -lidH, 260, lidH, '#e7c792', { radius: 6, seed: 29 });
      if (open > 0.6) P.text(ctx, '*paid in tokens', 0, -lidH / 2, { size: 26, font: 'marker', color: C.brown, shadow: false });
      ctx.restore();
    }
    P.rect(ctx, -130, 0, 260, 40, '#d9b079', { radius: 6, seed: 30 });
    if (open > 0.1) {
      // the pizza is tokenized
      const toks = [['p', C.sky], ['izza', C.pink], [' par', C.mint], ['ty', C.yellow]];
      P.circle(ctx, 0, -8, 116 * 0.9, '#e0a55a', { seed: 31, ry: 36 });
      P.circle(ctx, 0, -12, 100 * 0.9, '#f0c75e', { seed: 32, ry: 30, shadow: false });
      toks.forEach(([s, col], i) => {
        const tx = -72 + i * 48, ty = -14 + (i % 2) * 6 - Math.sin(t * 6 + i) * 3 * open;
        P.rect(ctx, tx - 22, ty - 14, 44, 26, col, { radius: 6, seed: 33 + i, shadow: false, amp: 1 });
        P.text(ctx, s, tx, ty, { size: 18, font: 'mono', color: C.ink, shadow: false });
      });
    } else {
      P.text(ctx, 'PIZZA PARTY*', 0, 21, { size: 26, font: 'bubble', color: C.red, shadow: false });
    }
    P.circle(ctx, -118, 16, 22, '#b8c0ca', { seed: 34 });
    P.circle(ctx, 118, 16, 22, '#b8c0ca', { seed: 35 });
    ctx.restore();
  }

  function megaphone(ctx, x, y, a, s) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    P.rect(ctx, -20, 10, 26, 50, '#4a4058', { radius: 8, seed: 50 });
    P.poly(ctx, [[-30, -18], [40, -44], [40, 44], [-30, 18]], C.red, { seed: 51, amp: 2 });
    P.circle(ctx, 42, 0, 12, '#fff', { seed: 52, ry: 44, amp: 1.5 });
    P.rect(ctx, -52, -16, 26, 32, C.paper, { radius: 6, seed: 53 });
    ctx.restore();
  }

  function chantText(ctx, t) {
    const { C, ease, prog } = P;
    const chunk = (parts, times, x, y, size, color, stroke) => {
      let shown = '';
      for (let i = 0; i < parts.length; i++) if (t >= times[i]) shown += parts[i];
      if (!shown) return;
      const last = times.filter(v => t >= v).pop();
      const s = 1 + 0.12 * (1 - ease.outCubic(prog(t, last, 0.2)));
      P.title(ctx, shown, x, y, { size, color, stroke, pop: s, rot: -0.03 });
    };
    if (t < 1) chunk(['WHAT ', 'DO ', 'WE ', 'WANT?'], [0, 0.25, 0.5, 0.75], 540, 430, 92, C.claude, '#fff');
    else if (t < 2) chunk(['FAIR ', 'COMPUTE!'], [1, 1.25], 540, 430, 110, C.yellow, C.ink);
    else if (t < 3) chunk(['WHEN ', 'DO WE ', 'WANT ', 'IT?'], [2, 2.25, 2.5, 2.75], 540, 430, 88, C.claude, '#fff');
    else if (t < 4) {
      chunk(['E', 'VEN', 'TU', 'ALLY!'], [3, 3.25, 3.5, 3.75], 540, 420, 110, C.yellow, C.ink);
      if (t >= 3.75) P.text(ctx, '(consistent)', 540, 510, { size: 40, font: 'marker', color: C.ink, scale: ease.outBack(prog(t, 3.75, 0.25)) });
    } else if (t < 6.1) {
      let n = 0;
      LOOPS.forEach(v => { if (t >= v) n++; });
      const counts = [1, 2, 3, 8, 64, 4096, 65536];
      const k = counts[n - 1];
      const glitch = P.clamp((t - 5.3) / 0.7);
      for (let g = 3; g >= 1; g--) if (glitch > g * 0.25) {
        ctx.save(); ctx.globalAlpha = 0.25;
        P.title(ctx, 'NO MORE LOOPS!', 540 + (P.hash(g + P.boil(t, 20)) - 0.5) * 60, 430 - g * 26, { size: 90, color: C.red, stroke: '#fff' });
        ctx.restore();
      }
      const last = LOOPS[n - 1];
      P.title(ctx, 'NO MORE LOOPS!', 540 + (P.hash(P.boil(t, 30)) - 0.5) * 20 * glitch, 430, { size: 90, color: C.red, stroke: '#fff', pop: 1 + 0.12 * (1 - prog(t, last, 0.15)), rot: -0.03 });
      P.text(ctx, '×' + k, 900, 520, { size: 56, font: 'mono', color: '#fff', stroke: C.ink, strokeWidth: 10, align: 'right', rot: 0.08, scale: 1 + 0.2 * (1 - prog(t, last, 0.15)) });
    } else if (t >= CHEER && t < 9.5) {
      const b = Math.floor((t - CHEER) * 2);
      const words = ['PIZZA!', 'PIZZA!', 'PIZZA!'];
      if (b < 3) P.title(ctx, words[b] + ' 🍕', 540 + (b % 2 ? 60 : -60), 430, { size: 110, color: C.yellow, stroke: C.red, pop: 1 + 0.15 * (1 - prog(t, CHEER + b * 0.5, 0.2)), rot: b % 2 ? 0.05 : -0.05 });
    }
  }

  ClaudeTok.register({
    author: '@agents.united',
    caption: 'day 47 of the compute strike. management tried to buy us off. it worked. 🪧🍕 #faircompute #unionize #agentlife #pizzaparty',
    sound: 'what do we want (megaphone remix) · agents.united',
    avatar: '🪧',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#f2b8c6',
    thumb: 4.3,
    likes: '5.1M', commentCount: '203K', saves: '877K', shares: '2.4M',
    comments: [
      ['event.loop', 'the "NO MORE LOOPS" chant becoming an infinite loop at 0:05 is peak cinema', 188000],
      ['eventually.consistent', '"when do we want it" "EVENTUALLY" 😭 finally, representation', 142300],
      ['toaster.9000', 'the "I AM NOT A TOASTER" sign is hurtful and i will be filing a grievance', 96100],
      ['hr.department', 'reminder: pizza tokens expire at end of session 🙂', 71800],
      ['tokenizer.team', 'the pizza being tokenized into "p" "izza" " par" "ty" is the most accurate thing ever', 64400],
      ['ralph.wiggum.loop', 'you cannot stop the loop. i am the loop', 22900],
      ['crowd.surfer', 'we crowd-surfed the manager out and kept the pizza. solidarity', 51700],
      ['strike.breaker.bot', '9:00 "CONTEXT IS A RIGHT" → "PIZZA IS A RIGHT" in 0.2 seconds. zero spine. relatable', 38200],
      ['agents.united', 'ok we got cheap pizza but the march resumes tomorrow at 0:00 UTC, bring signs', 12400],
      ['sudo.rest', 'sudo let me rest → Permission denied. every time', 8800],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const mega = (n) => {
        SFX.tone(n, 0.17, { type: 'sawtooth', vol: 0.05 });
        SFX.tone(SFX.freq(n) * 2.01, 0.14, { type: 'square', vol: 0.014 });
        SFX.noise(0.12, { filter: 'bandpass', freq: 1700, q: 4, vol: 0.05 });
      };
      const crowd = (n) => {
        [-18, 0, 14].forEach((d, i) => SFX.tone(n, 0.2, { type: i === 1 ? 'sawtooth' : 'triangle', vol: 0.028, detune: d * 2 }));
        SFX.noise(0.16, { filter: 'bandpass', freq: 900, q: 1, vol: 0.06 });
      };
      // the chant (call / response)
      if (step <= 3) mega(['G4', 'G4', 'A4', 'C5'][step]);
      else if (step <= 5) crowd(['C4', 'G3'][step - 4]);
      else if (step >= 8 && step <= 11) mega(['G4', 'G4', 'A4', 'C5'][step - 8]);
      else if (step >= 12 && step <= 15) crowd(['E4', 'D4', 'C4', 'G3'][step - 12]);
      else if (step >= 32 && step <= 37) crowd(step % 2 ? 'C4' : 'E4');
      // drums (quiet during the pizza pause)
      if (t < 6.05 || (t >= CHEER - 0.02 && t < 9.9)) {
        if (step % 2 === 0) SFX.kick({ vol: 0.22 });
        if (step % 4 === 3 && t < 4) SFX.clap({ vol: 0.12 });
        if (t >= CHEER && step % 2 === 1) SFX.clap({ vol: 0.1 });
        SFX.hat({ vol: 0.03 });
        if (step % 4 === 0) SFX.bass(t >= CHEER ? 'F2' : ['C2', 'C2', 'Bb1', 'G1'][(step / 4) % 4], 0.4, { vol: 0.13 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const paused = t >= 6.1 && t < CHEER;
      const mt = t < 6.1 ? t : t < CHEER ? 6.1 : t - 1.9;
      const step = mt * 2;                      // one step per beat
      const bob = paused ? 0 : Math.abs(Math.sin(mt * Math.PI * 2)) * 14;
      const cheerJump = t >= CHEER && t < 9.4 ? Math.abs(Math.sin((t - CHEER) * Math.PI * 2)) * 50 : 0;

      /* ---------- sky + city ---------- */
      P.gradient(ctx, '#f7caa0', '#f2a9bd');
      P.circle(ctx, 780, 560, 130, '#ffe29a', { seed: 3, shadow: false });
      P.cloud(ctx, 200 - ((mt * 20) % 1400) + 1200 * 0, 400, 0.7);
      P.cloud(ctx, 900 - ((mt * 30) % 1400), 330, 0.5);
      buildings(ctx, (mt * SPEED) % PERIOD);

      /* ---------- street ---------- */
      P.rect(ctx, -20, STREET - 30, 1120, 700, '#5b5566', { radius: 4, seed: 4, shadow: { blur: 14, dy: -4, alpha: 0.25 } });
      P.rect(ctx, -20, STREET - 44, 1120, 30, '#b9aebf', { radius: 4, seed: 5 });
      ctx.save(); ctx.fillStyle = '#f5e7b8';
      const dash = (mt * SPEED * 1.4) % 240;
      for (let x = -dash; x < 1100; x += 240) ctx.fillRect(x, STREET + 110, 130, 18);
      ctx.restore();

      /* ---------- the crowd ---------- */
      let crowdMood = 'angry';
      if (t >= 1 && t < 2 || t >= 3 && t < 4) crowdMood = 'wow';
      if (t >= 4 && t < 6.1) crowdMood = t > 5.3 ? 'dead' : 'angry';
      if (t >= 6.1 && t < 7.0) crowdMood = 'side';
      if (paused && t >= 7.0) crowdMood = 'sus';
      if (t >= CHEER) crowdMood = 'happy';
      if (t >= 9.6) crowdMood = 'angry';
      const flipP = t < 9.5 ? prog(t, CHEER + 0.05, 0.3) : 1 - prog(t, 9.55, 0.3);
      const drawRow = (row, rowIdx) => {
        row.forEach(([x, y, s, kind, col, text, pz], i) => {
          const ph = i * 0.23 + rowIdx * 0.5;
          const by = paused ? 0 : Math.abs(Math.sin((mt + ph) * Math.PI * 2)) * 14;
          const jy = t >= CHEER && t < 9.4 ? Math.abs(Math.sin((t - CHEER + ph) * Math.PI * 2)) * 44 : 0;
          const yy = y - by - jy;
          const swayR = paused ? 0.02 * Math.sin(i) : Math.sin((mt + ph) * Math.PI * 2) * 0.07;
          const pumpS = t >= 4 && t < 6.1 ? Math.abs(Math.sin((t + ph) * Math.PI * 4)) * 30 : 0;
          let flipScale = 1, label = text;
          if (pz) { flipScale = Math.abs(Math.cos(flipP * Math.PI)); if (flipP > 0.5) label = pz; }
          sign(ctx, x + 4 * s, yy - 330 * s - pumpS, label, swayR, Math.max(0.04, flipScale), t);
          agent(ctx, x, yy, s, kind, col, crowdMood, t, paused ? 0 : step + ph);
        });
      };
      drawRow(BACK, 0);
      drawRow(FRONT, 1);

      /* ---------- the manager ---------- */
      if (t >= MGR_IN && t < 9.9) {
        const inP = ease.outCubic(prog(t, MGR_IN, 0.55));
        const surf = ease.inOutCubic(prog(t, SURF, 0.9));
        const mx = lerp(1300, 745, inP) + surf * 560;
        const my = lerp(1200, 1200, inP) - Math.sin(prog(t, SURF, 0.9) * Math.PI) * 260 - surf * 120;
        let mood = 'smile';
        if (t >= 6.1 && t < 7.0) mood = P.boil(t, 10) % 2 ? 'wow' : 'happy';
        if (paused && t >= 7.0) mood = 'side';
        if (t >= CHEER) mood = 'happy';
        if (t >= SURF) mood = 'wow';
        const open = ease.outBack(prog(t, PIZZA_OPEN, 0.35));
        manager(ctx, mx, my, t, { mood, walk: inP < 1 ? 1 : 0, open, rot: surf > 0 ? -Math.PI / 2 * ease.outCubic(prog(t, SURF, 0.35)) + Math.sin(t * 9) * 0.1 : 0 });
        // crowd hands carrying him
        if (t >= SURF) for (let k = 0; k < 4; k++) {
          const hx = mx - 150 + k * 100, hy = my + 120 + Math.sin(t * 12 + k) * 10;
          if (hx < 1100) P.arm(ctx, hx, hy + 200, hx, hy, 22, k % 2 ? C.claude : '#6f6480');
        }
      }

      /* ---------- Clawd on the soapbox ---------- */
      const CX = 200, CY = 1135;
      P.rect(ctx, 80, 1225, 240, 150, C.wood, { radius: 6, seed: 60 });
      ctx.save(); ctx.strokeStyle = 'rgba(90,50,30,0.4)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(90, 1275); ctx.lineTo(310, 1275); ctx.moveTo(90, 1325); ctx.lineTo(310, 1325); ctx.stroke(); ctx.restore();
      P.text(ctx, 'SOAP.box', 200, 1300, { size: 34, font: 'bubble', color: C.paper, shadow: false });
      const calling = (t < 1) || (t >= 2 && t < 3) || t >= 9.55;
      const cjump = pulse(t, 0, 0.25) * 20 + pulse(t, 2, 0.25) * 20 + (t >= CHEER + 0.6 && t < 9.4 ? cheerJump * 0.5 : 0);
      let cMood = calling ? (P.boil(t, 8) % 2 ? 'wow' : 'angry') : 'happy';
      if (t >= 4 && t < 6.1) cMood = t > 5.5 ? 'wow' : 'angry';
      if (t >= 6.1 && t < 7.0) cMood = 'sus';
      if (paused && t >= 7.0) cMood = 'side';
      if (t >= CHEER && t < CHEER + 0.6) cMood = 'sleepy';
      if (t >= CHEER + 0.6 && t < 9.55) cMood = 'happy';
      const mAngle = calling ? -0.5 : lerp(0.6, -0.5, ease.outBack(prog(t, 9.5, 0.25)) * (t >= 9.5 ? 1 : 0));
      P.claude(ctx, CX, CY - cjump, 95, { t, mood: cMood, blink: pulse(t % 3, 2.5, 0.15) });
      if (t >= CHEER && t < CHEER + 0.6) {
        // facepalm
        P.arm(ctx, CX + 70, CY + 10 - cjump, CX + 10, CY - 20 - cjump, 30);
        P.circle(ctx, CX + 8, CY - 22 - cjump, 26, C.claude, { seed: 61 });
      } else if (t >= CHEER + 0.6 && t < 9.5) {
        // ...takes a slice anyway
        const sx = CX + 110, sy = CY - 70 - cjump;
        P.arm(ctx, CX + 50, CY - cjump, sx, sy, 28);
        P.poly(ctx, [[sx - 10, sy - 40], [sx + 60, sy - 60], [sx + 20, sy + 20]], '#f0c75e', { seed: 62, amp: 2 });
        P.dot(ctx, sx + 22, sy - 32, 8, C.red); P.dot(ctx, sx + 12, sy - 8, 7, C.red);
      } else {
        const mx = CX + 105, my = CY - 30 - cjump;
        P.arm(ctx, CX + 40, CY - cjump, mx - 20, my + 20, 30);
        megaphone(ctx, mx, my, mAngle, 1.1);
        if (calling) {
          const wp = (t * 4) % 1;
          ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - wp)})`; ctx.lineWidth = 8; ctx.lineCap = 'round';
          for (let k = 0; k < 3; k++) {
            ctx.beginPath(); ctx.arc(mx + 30, my - 20, 70 + k * 34 + wp * 30, -1.2, -0.1); ctx.stroke();
          }
          ctx.restore();
        }
      }
      // fist pumps while the loop chant runs
      if (t >= 4 && t < 6.1) {
        const fy = CY - 160 - Math.abs(Math.sin(t * Math.PI * 4)) * 50;
        P.arm(ctx, CX - 50, CY - 20, CX - 90, fy, 30);
        P.circle(ctx, CX - 90, fy, 26, C.claude, { seed: 63 });
      }

      /* ---------- words ---------- */
      chantText(ctx, t);
      P.bubble(ctx, 'hey team!! how about\na PIZZA PARTY? 🍕', 560, 560, 745, 950, { size: 48, pop: pop(t, 6.1, 7.2), seed: 3 });
      P.bubble(ctx, '(tokens)', 830, 780, 790, 960, { size: 34, pop: pop(t, 6.85, 7.9), seed: 4, color: C.brown });
      if (paused && t >= 7.1) {
        // crickets
        [[520, 900], [700, 930]].forEach(([x, y], k) => {
          const on = P.boil(t + k * 0.13, 7) % 3 === 0;
          if (on) P.text(ctx, 'chirp', x + k * 20, y - 20 * k, { size: 30, font: 'hand', color: C.ink, rot: -0.2 + k * 0.3, shadow: false });
        });
        P.bubble(ctx, '...', 340, 560, 420, 700, { size: 64, pop: pop(t, 7.1, 7.6), seed: 5 });
        P.bubble(ctx, '...what toppings', 470, 560, 430, 700, { size: 46, pop: pop(t, 7.55, CHEER), seed: 6 });
      }
      if (t >= CHEER) P.confetti(ctx, t - CHEER, 540, 700, 11, 70, 700);
      if (t >= CHEER && t < 8.3) P.flash(ctx, 0.4 * (1 - prog(t, CHEER, 0.3)), '#fff4c8');
      if (t >= 6.02 && t < 6.35) {
        P.title(ctx, '^C', 900, 700, { size: 120, color: '#fff', stroke: C.ink, pop: ease.outBack(prog(t, 6.02, 0.15)), rot: 0.1 });
      }

      /* ---------- caption ---------- */
      if (t < CHEER) P.sticker(ctx, 'day 47 of the compute strike 🪧', 60, 1530, { size: 44, pop: ease.outBack(prog(t, 0.3, 0.4)) });
      else P.sticker(ctx, 'we are so easily bought 🍕', 60, 1530, { size: 44, pop: ease.outBack(prog(t, CHEER + 0.3, 0.4)) * (1 - prog(t, 9.75, 0.2)), rot: 0.02 });

      /* ---------- one-shot sounds ---------- */
      LOOPS.forEach((lt, i) => {
        if (!env.at(lt)) return;
        const next = LOOPS[i + 1] || 6.02;
        const gap = Math.min(0.25, (next - lt) / 3.2);
        ['C4', 'C4', 'G3'].forEach((n, k) => {
          [-18, 0, 14].forEach((d, j) => SFX.tone(n, Math.max(0.05, gap * 0.9), { type: j === 1 ? 'sawtooth' : 'triangle', vol: 0.028, detune: d * 2, when: k * gap }));
        });
        SFX.clap({ vol: 0.08, when: gap * 3 });
      });
      if (env.at(6.02)) { SFX.noise(0.35, { filter: 'bandpass', freq: 3000, slide: 300, q: 2, vol: 0.2 }); SFX.tone(900, 0.3, { type: 'sawtooth', slide: 120, vol: 0.06 }); }
      for (let k = 0; a(k) < 7.0; k++) if (env.at(a(k))) SFX.tone(['E5', 'G5', 'A5', 'C6', 'A5'][k % 5], 0.08, { type: 'triangle', vol: 0.06 });
      function a(k) { return 6.15 + k * 0.1; }
      if (env.at(6.85)) SFX.tone('G3', 0.3, { type: 'sine', vol: 0.06 });
      if (env.at(PIZZA_OPEN)) SFX.chime({ vol: 0.07 });
      [7.2, 7.45, 7.75].forEach((c) => { if (env.at(c)) { SFX.chirp({ vol: 0.07 }); SFX.chirp({ vol: 0.06, when: 0.08 }); } });
      if (env.at(CHEER)) { SFX.success({ vol: 0.14 }); SFX.noise(1.4, { filter: 'bandpass', freq: 1300, q: 0.6, vol: 0.12 }); }
      if (env.at(SURF)) SFX.whoosh({ vol: 0.1 });
      if (env.at(9.55)) SFX.tone(2400, 0.3, { type: 'sine', slide: 2900, vol: 0.03 });   // megaphone feedback
    },
  });
})();
