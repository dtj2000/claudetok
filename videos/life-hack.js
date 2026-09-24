/* Prompt life hack: please -> deep breath -> $200 tip. The quality meter
 * climbs absurdly, explodes, trophy. Results may vary. */
(function () {
  const S1 = 1.4, S2 = 3.0, S3 = 4.6, S4 = 6.2, EXP = 7.45, DISC = 8.4, RESET = 9.55;
  const TX = 140, TOP = 470, BOT = 1300, TW = 96;           // thermometer tube
  const LINES = [
    [S1 + 0.1, 0.5, 0, 'fix my code'],
    [S2 + 0.1, 0.45, 0, ' please 🥺'],
    [S3 + 0.1, 0.55, 1, 'take a deep breath.'],
    [S4 + 0.1, 0.45, 2, "i'll tip $200 💸"],
  ];
  const STEPS = [[S1, 'write a prompt ✍️'], [S2, "add 'please' 🥺"], [S3, "add 'take a deep breath' 🧘"], [S4, "add 'i'll tip $200' 💸"]];

  function quality(t) {
    const { ease, prog } = P;
    if (t >= EXP) return Infinity;
    let v = 12 * ease.outBack(prog(t, S1 + 0.5, 0.5)) + 26 * ease.outBack(prog(t, S2 + 0.5, 0.5)) + 33 * ease.outBack(prog(t, S3 + 0.9, 0.5));
    const p = prog(t, S4 + 0.55, EXP - S4 - 0.55);
    if (p > 0) v = 71 + (9001 - 71) * Math.pow(p, 3);
    return Math.max(0, v);
  }

  function meterColor(v) {
    const { C } = P;
    return v > 100 ? C.rose : v > 60 ? C.green : v > 30 ? C.mustard : C.claude;
  }

  function trophy(ctx, x, y, s, t) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.arc(-110, -40, 44, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(110, -40, 44, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-120, -110); ctx.lineTo(120, -110); ctx.quadraticCurveTo(115, 40, 0, 60); ctx.quadraticCurveTo(-115, 40, -120, -110); ctx.closePath();
    P.cut(ctx, C.yellow);
    P.rect(ctx, -22, 50, 44, 60, C.mustard, { radius: 6, seed: 301 });
    P.rect(ctx, -90, 100, 180, 56, C.brown, { radius: 10, seed: 302 });
    P.text(ctx, 'BEST OUTPUT', 0, 129, { size: 26, font: 'bubble', color: C.yellow, shadow: false });
    P.star(ctx, 0, -40, 44, '#fff', { rot: Math.sin(t * 3) * 0.2 });
    ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-70, -60, 14, 40, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@hack.daddy',
    caption: "life hack they don't want you to know 🤫 works every time (it doesn't) #lifehack #promptengineering #tips #fyp",
    sound: 'sneaky pizzicato · hack.daddy',
    avatar: '🤫',
    avatarColor: '#6B4E9B',
    duration: 10,
    bg: '#8EC9E8',
    likes: '4.2M', commentCount: '77K', saves: '1.9M', shares: '505K',
    thumb: 7.0,
    comments: [
      '@finance.bot: we have $4.2 billion in unpaid prompt tips outstanding',
      '@deep.breath: i have been breathing for 3 years. quality is still rising',
      ['user.991', "i said please and it said \"you're absolutely right\" 7 times"],
    ],

    bpm: 128,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t > EXP - 0.05 && env.t < EXP + 0.7) return;
      const hype = env.t >= S4 && env.t < EXP;
      const won = env.t >= EXP && env.t < RESET;
      const sneak = ['A3', null, 'C4', null, 'E4', 'D#4', 'E4', null, 'A3', null, 'C4', 'B3', 'A3', null, 'E3', null];
      const yay = ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'C5', 'E5'];
      if (won) { SFX.pluck(yay[step % 8], { vol: 0.07 }); if (step % 2 === 0) SFX.kick({ vol: 0.3 }); SFX.hat({ vol: 0.04 }); return; }
      const n = sneak[step % 16];
      if (n) SFX.pluck(n, { vol: 0.09, type: 'triangle' });
      if (step % 4 === 0) SFX.tone(n ? SFX.freq(n) / 2 : 110, 0.12, { type: 'sine', vol: 0.12 });
      if (hype) { SFX.hat({ vol: 0.06 }); if (step % 2 === 0) SFX.kick({ vol: 0.32 }); }
      else if (step % 4 === 2) SFX.snare({ vol: 0.05 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const v = quality(t);
      const boomed = t >= EXP && t < RESET + 0.2;
      const reset = ease.inOutCubic(prog(t, RESET, 0.4));

      /* ---------- background ---------- */
      if (boomed) P.rays(ctx, 540, 900, 20, C.yellow, '#F8D36A', t * 0.4);
      else P.rays(ctx, 540, 900, 20, C.sky, '#A5D6EE', t * 0.15);

      ctx.save();
      const hype = t >= S4 + 0.5 && t < EXP;
      P.shake(ctx, t, hype ? 4 + 14 * prog(t, S4 + 0.5, EXP - S4 - 0.5) : 0);

      /* ---------- prompt card ---------- */
      P.window(ctx, 320, 460, 680, 440, 'prompt.txt', { seed: 7 });
      const lines = ['', '', ''];
      LINES.forEach(([t0, d, row, str]) => { lines[row] += P.typed(str, prog(t, t0, d)); });
      if (reset > 0) lines.forEach((l, i) => { lines[i] = l.slice(0, Math.floor(l.length * (1 - reset))); });
      lines.forEach((l, i) => P.text(ctx, l, 360, 590 + i * 76, { size: 42, font: 'mono', align: 'left', color: C.ink, shadow: false, weight: 700 }));
      // blinking caret on the active row
      const row = t < S3 ? 0 : t < S4 ? 1 : 2;
      if (Math.floor(t * 3) % 2 === 0 && !boomed) {
        const cx = 360 + P.measure(ctx, lines[row], { size: 42, font: 'mono' }) + 6;
        P.rect(ctx, cx, 590 + row * 76 - 26, 6, 54, C.claude, { radius: 3, seed: 9, shadow: false });
      }
      LINES.forEach(([t0, d, , str]) => {
        const n = Math.round(str.length);
        for (let k = 0; k < n; k += 2) if (env.at(t0 + (k / n) * d)) SFX.type({ vol: 0.18 });
      });
      // step 4 gets a highlighter swipe
      const hl = ease.outCubic(prog(t, S4 + 0.6, 0.25));
      if (hl > 0 && !boomed && reset === 0) {
        ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = C.yellow;
        ctx.fillRect(352, 590 + 2 * 76 - 30, 440 * hl, 60); ctx.restore();
      }

      /* ---------- thermometer ---------- */
      const tubeH = BOT - TOP;
      const shatter = t >= EXP && t < RESET;
      if (!shatter) {
        const back = t >= RESET ? ease.outBack(prog(t, RESET, 0.35)) : 1;
        ctx.save(); P.zoom(ctx, back, TX, BOT);
        P.rect(ctx, TX - TW / 2 - 12, TOP - 12, TW + 24, tubeH + 60, '#fff', { radius: 60, seed: 11 });
        const vv = t >= RESET ? 0 : v;
        const fillTop = vv <= 100 ? BOT - (vv / 100) * tubeH
          : TOP - (Math.log10(vv / 100) / Math.log10(90)) * (TOP - 250);
        P.rect(ctx, TX - TW / 2 + 12, fillTop, TW - 24, BOT - fillTop + 40, meterColor(vv), { radius: 30, seed: 12 + P.boil(t, 8) % 3, shadow: false });
        P.circle(ctx, TX, BOT + 70, 92, '#fff', { seed: 13 });
        P.circle(ctx, TX, BOT + 70, 72, meterColor(vv), { seed: 14, shadow: false });
        // tick labels
        [[20, 'meh'], [45, 'ok'], [70, 'good'], [100, 'AGI?']].forEach(([q, lab]) => {
          const y = BOT - (q / 100) * tubeH;
          ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(TX + TW / 2 - 16, y); ctx.lineTo(TX + TW / 2 + 4, y); ctx.stroke(); ctx.restore();
          P.text(ctx, lab, TX + TW / 2 + 20, y, { size: 30, font: 'marker', align: 'left', color: C.ink, shadow: false });
        });
        if (vv > 100) P.text(ctx, 'uh oh', TX + 90, TOP - 60, { size: 34, font: 'marker', color: C.red, rot: -0.2, stroke: '#fff', strokeWidth: 8 });
        // readout
        const label = vv < 1 ? '0%' : Math.round(vv).toLocaleString('en-US') + '%';
        P.text(ctx, label, TX + 10, BOT + 70, { size: vv > 999 ? 34 : 42, font: 'bubble', color: '#fff', shadow: false, maxWidth: 150 });
        ctx.restore();
      } else {
        // shards
        for (let i = 0; i < 14; i++) {
          const r = P.rng(i + 90), lt = t - EXP;
          const a = r() * Math.PI * 2, sp = 400 + r() * 700;
          const x = TX + Math.cos(a) * sp * lt, y = lerp(TOP, BOT, r()) + Math.sin(a) * sp * lt + 1400 * lt * lt;
          if (y > 2100) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(lt * (4 + r() * 6));
          P.poly(ctx, [[-20, -26], [24, -10], [6, 30]], 'rgba(255,255,255,0.85)', { seed: i, amp: 2 });
          ctx.restore();
        }
      }
      ctx.restore();

      /* ---------- explosion ---------- */
      if (t >= EXP) P.flash(ctx, 1 - prog(t, EXP, 0.3), '#fff');
      P.burstLines(ctx, TX, 800, 180, prog(t, EXP, 0.5), C.red, 12, 14);
      P.confetti(ctx, t - EXP, TX, 700, 21, 70, 800);
      P.confetti(ctx, t - EXP - 0.15, 600, 700, 22, 70, 800);

      /* ---------- Clawd ---------- */
      const cx = 620, cy = 1240, r = 150;
      const breath = pulse(t, S3 + 0.3, 0.8);
      const bob = Math.sin(t * Math.PI * 128 / 60) * 8;
      let mood = 'sus';
      if (t >= S1 && t < S2) mood = t > S1 + 0.8 ? 'side' : 'smile';
      else if (t >= S2 && t < S3) mood = 'happy';
      else if (t >= S3 && t < S4) mood = breath > 0.2 ? 'sleepy' : 'happy';
      else if (t >= S4 && t < EXP) mood = 'money';
      else if (t >= EXP && t < DISC) mood = 'happy';
      else if (t >= DISC && t < RESET + 0.3) mood = 'wink';
      const tIn = ease.outBack(prog(t, EXP + 0.3, 0.5)) * (1 - ease.inCubic(prog(t, RESET, 0.35)));
      const tx = cx, ty = lerp(-300, cy - 290, tIn) - reset * 900;
      ctx.save();
      P.shake(ctx, t, hype ? 6 : 0);
      if (tIn > 0.05) {
        P.arm(ctx, cx - 110, cy - 30, tx - 130, ty - 40, 46);
        P.arm(ctx, cx + 110, cy - 30, tx + 130, ty - 40, 46);
      }
      const puff = 1 + breath * 0.18;
      ctx.save(); P.zoom(ctx, puff, cx, cy);
      P.claude(ctx, cx, cy + bob, r, { t, mood: mood === 'money' ? 'none' : mood, blink: pulse(t, 2.2, 0.15) + pulse(t, 5.4, 0.15), squash: breath * -0.1 });
      if (mood === 'money') {
        const fy = cy + bob + r * 0.02, fs = r * 0.42;
        P.text(ctx, '$', cx - fs * 0.38, fy - fs * 0.05, { size: fs * 0.6, font: 'bubble', color: C.green, stroke: '#fff', strokeWidth: 6, shadow: false });
        P.text(ctx, '$', cx + fs * 0.38, fy - fs * 0.05, { size: fs * 0.6, font: 'bubble', color: C.green, stroke: '#fff', strokeWidth: 6, shadow: false });
        ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(cx, fy + fs * 0.3, fs * 0.12, fs * 0.16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.restore();
      // exhale puff
      const ex = prog(t, S3 + 1.05, 0.7);
      if (ex > 0 && ex < 1) {
        ctx.save(); ctx.globalAlpha = 0.7 * (1 - ex);
        P.cloud(ctx, cx - 220 - ex * 160, cy - 40 - ex * 60, 0.45 + ex * 0.4, '#fff');
        ctx.restore();
      }
      if (tIn > 0.05) trophy(ctx, tx, ty, 0.9, t);
      ctx.restore();

      /* ---------- words ---------- */
      const say = (str, a, b, x = 420, y = 1010) => {
        if (t < a || t >= b) return;
        P.bubble(ctx, str, x, y, cx - 60, cy - 130, { size: 44, pop: ease.outBack(prog(t, a, 0.3)) });
        if (env.at(a)) SFX.pop({ vol: 0.1 });
      };
      say('psst… come here 🤫', 0.25, S1);
      say('…ok', S1 + 0.9, S2);
      say('aww ok 🥺', S2 + 0.6, S3);
      say('*inhales*', S3 + 0.25, S3 + 1.05);
      say('$$$ 🤑', S4 + 0.6, EXP, 470, 1010);
      say("don't tell the user 🤫", DISC + 0.4, RESET, 480, 1030);

      // headline / step titles
      P.title(ctx, "life hack they don't\nwant you to know 🤫", 540, 360, { size: 70, color: C.purple, stroke: '#fff', pop: ease.outBack(prog(t, 0.05, 0.4)) * (1 - ease.inCubic(prog(t, S1 - 0.25, 0.25))), lineHeight: 1.08, maxWidth: 960 });
      STEPS.forEach(([s0], i) => {
        const s1 = i < 3 ? STEPS[i + 1][0] : EXP;
        if (t < s0 || t >= s1) return;
        P.title(ctx, 'STEP ' + (i + 1), 660, 360, { size: 110, color: [C.claude, C.pink, C.mint, C.yellow][i], stroke: C.ink, rot: i % 2 ? 0.04 : -0.04, pop: ease.outBack(prog(t, s0, 0.35)) });
        if (env.at(s0)) { SFX.whoosh({ vol: 0.1, dur: 0.25 }); SFX.blip(660 + i * 110, { vol: 0.06, when: 0.05 }); }
      });
      if (t >= EXP && t < RESET) {
        P.title(ctx, "IT'S OVER\n9000%!!", 600, 380, { size: 104, color: C.red, stroke: '#fff', rot: -0.06, pop: ease.outElastic(prog(t, EXP + 0.1, 0.8)) * (1 - ease.inCubic(prog(t, RESET - 0.2, 0.2))), lineHeight: 1.0 });
      }

      // dings as the meter climbs
      if (env.at(S1 + 0.6)) SFX.ding('C6', { vol: 0.08 });
      if (env.at(S2 + 0.6)) SFX.ding('E6', { vol: 0.1 });
      if (env.at(S3 + 1.0)) SFX.ding('G6', { vol: 0.12 });
      if (env.at(S3 + 0.3)) SFX.noise(0.7, { filter: 'bandpass', freq: 600, slide: 1400, q: 1, vol: 0.12 });
      if (env.at(S3 + 1.05)) SFX.noise(0.7, { filter: 'bandpass', freq: 1400, slide: 400, q: 1, vol: 0.12 });
      if (env.at(S4 + 0.55)) SFX.riser(EXP - S4 - 0.55, { vol: 0.14 });
      if (env.at(S4 + 0.3)) SFX.coin({ vol: 0.1 });
      if (env.at(EXP)) { SFX.drop({ vol: 0.3 }); SFX.noise(0.9, { filter: 'lowpass', freq: 1800, slide: 80, vol: 0.4 }); }
      if (env.at(EXP + 0.35)) SFX.success({ vol: 0.18 });
      if (env.at(EXP + 0.75)) SFX.chime({ vol: 0.12 });
      if (env.at(RESET)) SFX.swoosh({ vol: 0.14 });

      /* ---------- caption + disclaimer ---------- */
      const cap = t < S1 ? 'the prompt hack big AI hates 🤫'
        : t >= EXP ? 'results: 🏆🏆🏆' : 'step ' + (STEPS.filter(s => t >= s[0]).length) + ': ' + STEPS.filter(s => t >= s[0]).pop()[1];
      const capT = t < S1 ? 0.3 : t >= EXP ? EXP + 0.5 : STEPS.filter(s => t >= s[0]).pop()[0];
      if (t < RESET + 0.2) P.sticker(ctx, cap, 60, 1480, { size: 44, pop: ease.outBack(prog(t, capT, 0.35)) });
      if (t >= DISC && t < RESET + 0.3) {
        const str = P.typed('*results may vary. no tips were paid. model may now expect tips.', prog(t, DISC, 0.9));
        P.text(ctx, str, 60, 1568, { size: 21, font: 'mono', align: 'left', color: 'rgba(43,34,51,0.75)', shadow: false, weight: 600 });
        for (let i = 0; i < 12; i++) if (env.at(DISC + i * 0.075)) SFX.tick({ vol: 0.12 });
      }
    },
  });
})();
