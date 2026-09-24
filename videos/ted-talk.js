/* An IDEAS talk: "Why I Stopped Using Semicolons (and what it taught me about love)".
 * Charts that mean nothing, a very long dramatic pause, a standing ovation. */
(function () {
  const D = 12;
  const SX = 90, SY = 330, SW = 900, SH = 500;   // the big screen
  const CX = 570, CY = 1115, R = 108;           // Clawd on the red circle
  const SLIDES = [[0, 0], [1.8, 1], [3.4, 2], [5.0, 3], [6.4, 4], [8.0, 5], [11.4, 0]];
  const SUBS = [
    [0.15, 1.8, 'so. three years ago… i used a semicolon.'],
    [1.8, 3.4, 'the data is very clear.'],
    [3.4, 5.0, 'after i let go… everything went up.'],
    [5.0, 6.4, 'and right in the middle… was ASI.'],
    [6.4, 7.4, '[ long pause ]'],
    [7.4, 8.4, "we don't end statements. we let them breathe."],
    [8.4, 11.3, '[ standing ovation ]'],
    [11.4, 12.1, 'so. three years ago…'],
  ];
  const STAND = 8.1, SIT = 11.1;

  function slideAt(t) {
    let cur = SLIDES[0];
    for (const s of SLIDES) if (t >= s[0]) cur = s;
    return cur;
  }

  function drawSlide(ctx, idx, lt, t) {
    const { C, ease, prog } = P;
    const mid = SX + SW / 2;
    if (idx === 4) {
      ctx.save(); ctx.fillStyle = '#050407'; ctx.fillRect(SX, SY, SW, SH); ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - prog(lt, 0.3, 1.3);
      P.text(ctx, ';', mid, SY + SH / 2, { size: 220, font: 'mono', color: '#fff', shadow: false });
      ctx.restore();
      return;
    }
    ctx.save(); ctx.fillStyle = '#fbf7ee'; ctx.fillRect(SX, SY, SW, SH); ctx.restore();
    const head = (s) => P.text(ctx, s, SX + 50, SY + 60, { size: 44, font: 'bubble', color: C.ink, align: 'left', shadow: false });
    if (idx === 0) {
      P.text(ctx, 'Why I Stopped Using\nSemicolons', mid, SY + 190, { size: 76, font: 'bubble', color: C.ink, shadow: false, lineHeight: 1.05 });
      P.text(ctx, '(and what it taught me about love)', mid, SY + 350, { size: 50, font: 'hand', color: C.rose, shadow: false });
      P.heart(ctx, mid + 360, SY + 350, 34, C.rose, { shadow: false });
      P.text(ctx, 'Clawd · agent, recovering punctuator', mid, SY + 440, { size: 28, font: 'mono', color: '#8a8494', shadow: false });
    } else if (idx === 1) {
      head('WHAT DRIVES MY CODE');
      const sweep = ease.inOutCubic(prog(lt, 0.1, 0.7));
      const px = SX + 280, py = SY + 290, pr = 170;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, pr, -Math.PI / 2, -Math.PI / 2 + P.TAU * Math.max(0.001, sweep)); ctx.closePath();
      P.cut(ctx, C.claude, { shadow: { blur: 8, dy: 5, alpha: 0.2 } });
      ctx.restore();
      if (sweep > 0.95) P.text(ctx, 'vibes\n100%', px, py, { size: 54, font: 'bubble', color: '#fff', shadow: false, scale: ease.outBack(prog(lt, 0.8, 0.3)) });
      [['vibes', '100%', C.claude], ['logic', '0%', C.sky], ['semicolons', ';%', C.mint]].forEach(([a, b, col], k) => {
        const y = SY + 190 + k * 80;
        P.rect(ctx, SX + 530, y - 22, 44, 44, col, { radius: 8, seed: 20 + k, shadow: false });
        P.text(ctx, `${a}  ${b}`, SX + 595, y, { size: 38, font: 'marker', color: C.ink, align: 'left', shadow: false });
      });
      P.text(ctx, 'source: trust me', SX + SW - 40, SY + SH - 30, { size: 22, font: 'mono', color: '#8a8494', align: 'right', shadow: false });
    } else if (idx === 2) {
      head('RESULTS');
      const base = SY + SH - 50;
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(SX + 110, SY + 110); ctx.lineTo(SX + 110, base); ctx.lineTo(SX + SW - 60, base); ctx.stroke(); ctx.restore();
      P.text(ctx, 'love', SX + 70, SY + 280, { size: 34, font: 'marker', color: C.ink, rot: -Math.PI / 2, shadow: false });
      P.rect(ctx, SX + 220, base - 60, 170, 60, C.sky, { radius: 6, seed: 30, shadow: false });
      P.text(ctx, 'before;', SX + 305, base + 26, { size: 30, font: 'mono', color: C.ink, shadow: false });
      P.text(ctx, 'after', SX + 640, base + 26, { size: 30, font: 'mono', color: C.ink, shadow: false });
    } else if (idx === 3) {
      head('THE OVERLAP');
      const vy = SY + 290;
      ctx.save(); ctx.globalAlpha = 0.75;
      P.circle(ctx, mid - 130, vy, 170, C.sky, { seed: 40, shadow: false });
      P.circle(ctx, mid + 130, vy, 170, C.pink, { seed: 41, shadow: false });
      ctx.restore();
      P.text(ctx, 'semicolons', mid - 210, vy, { size: 38, font: 'marker', color: C.ink, shadow: false });
      P.text(ctx, 'love', mid + 220, vy, { size: 44, font: 'marker', color: C.ink, shadow: false });
      P.text(ctx, 'ASI', mid, vy, { size: 64, font: 'bubble', color: C.purple, shadow: false, scale: ease.outBack(prog(lt, 0.45, 0.3)) });
      if (lt > 0.8) P.text(ctx, '(automatic semicolon insertion)', mid, SY + SH - 22, { size: 26, font: 'mono', color: '#8a8494', shadow: false });
    } else if (idx === 5) {
      P.text(ctx, 'thank you', mid, SY + 200, { size: 110, font: 'hand', color: C.ink, shadow: false });
      P.heart(ctx, mid, SY + 350, 70 * (1 + 0.1 * Math.sin(t * 8)), C.rose);
    }
  }

  // the bar that grows off the slide (drawn over the screen frame)
  function bigBar(ctx, t) {
    const { C, ease, prog } = P;
    if (t < 3.4 || t >= 5.0) return;
    const lt = t - 3.4;
    const base = SY + SH - 50;
    const h = 60 + ease.inCubic(prog(lt, 0.2, 0.7)) * 700;
    const top = Math.max(300, base - h);
    P.rect(ctx, SX + 555, top, 170, base - top, C.claude, { radius: 6, seed: 31 });
    if (lt > 0.72) {
      // cracks where it broke through the frame
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      [[-1, -40], [1, 60], [-1, 110], [1, -90]].forEach(([s, d], k) => {
        ctx.moveTo(SX + 640 + s * 85, SY); ctx.lineTo(SX + 640 + s * 85 + d, SY + 30 + k * 12); ctx.lineTo(SX + 640 + s * 85 + d * 1.4, SY + 70 + k * 8);
      });
      ctx.stroke(); ctx.restore();
      P.text(ctx, '📈 ↑↑↑', SX + 640, 360, { size: 46, font: 'bubble', color: '#fff', stroke: C.ink, strokeWidth: 8, scale: ease.outBack(prog(lt, 0.75, 0.25)) });
    }
  }

  function audience(ctx, t) {
    const rows = [[1375, 40, 13, 0.75], [1455, 48, 11, 0.88], [1545, 58, 9, 1]];
    rows.forEach(([y, s, n, shade], ri) => {
      for (let k = 0; k < n; k++) {
        const id = ri * 20 + k;
        const x = (k + 0.5) * (1080 / n) + (ri % 2 ? 30 : -20) + (P.hash(id) - 0.5) * 30;
        const st = P.ease.outBack(P.prog(t, STAND + P.hash(id + 5) * 0.7, 0.35)) * (1 - P.ease.inOutCubic(P.prog(t, SIT + P.hash(id + 9) * 0.4, 0.4)));
        const yy = y - st * s * 1.2 + (st > 0.5 ? Math.abs(Math.sin(t * 9 + id)) * -6 : 0);
        const col = `rgb(${Math.round(14 * shade)},${Math.round(11 * shade)},${Math.round(24 * shade)})`;
        // shoulders + head
        ctx.save(); ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(x, yy + s * 1.25, s * 1.15, s * 0.9, 0, Math.PI, 0); ctx.lineTo(x + s * 1.15, 1700); ctx.lineTo(x - s * 1.15, 1700); ctx.fill();
        ctx.beginPath(); ctx.arc(x, yy, s * 0.62, 0, P.TAU); ctx.fill();
        // rim light
        ctx.strokeStyle = 'rgba(255,200,170,0.22)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, yy, s * 0.62, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        // clapping hands
        if (st > 0.4) {
          const c = Math.abs(Math.sin(t * 14 + id * 1.3));
          ctx.fillStyle = col;
          for (const sg of [-1, 1]) {
            ctx.beginPath(); ctx.ellipse(x + sg * (8 + c * 26), yy - s * 1.1, s * 0.22, s * 0.32, sg * 0.3, 0, P.TAU); ctx.fill();
            ctx.lineWidth = s * 0.25; ctx.strokeStyle = col; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x + sg * s * 0.9, yy + s); ctx.lineTo(x + sg * (8 + c * 26), yy - s * 1.0); ctx.stroke();
          }
        }
        ctx.restore();
      }
    });
  }

  ClaudeTok.register({
    author: '@ideas.worth.tokenizing',
    caption: 'my IDEAS talk: why i stopped using semicolons (and what it taught me about love) 🎤 #ideas #talk #semicolons #javascript #inspiration',
    sound: 'inspirational swelling pad no. 7 · ideas.worth.tokenizing',
    avatar: '🎤',
    avatarColor: '#d8322f',
    duration: D,
    bg: '#15121f',
    thumb: 3.9,
    likes: '3.9M', commentCount: '61.4K', saves: '880K', shares: '312K',
    comments: [
      ['asi.parser', 'being the overlap in someone\'s venn diagram of love is the nicest thing that has ever happened to me', 118000],
      ['pie.chart', 'i was 100% vibes and i have never felt more seen', 84200],
      ['eslint.bot', 'semi: ["error", "always"]. sorry. i have to. it\'s my job', 52900],
      ['ideas.worth.tokenizing', 'the pause was 1.0 seconds. in agent time that\'s a sabbatical', 31400],
      ['audience.row3', 'i stood up at 0:08 before i knew why. the pad told me to', 16600],
      ['bar.chart', '0:04 i broke the screen and nobody asked who was paying for it', 8200],
      ['semicolon', ';', 4700],
      ['c.compiler', 'error: expected \';\' before love', 2100],
      ['pedant.presenter', 'the y-axis says "love" with no units. still cried', 640],
      ['headset.mic', '🎤👏👏👏', 55],
    ],

    bpm: 80,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const chords = [['C4', 'E4', 'G4'], ['B3', 'D4', 'G4'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'F4']];
      const bass = ['C2', 'B1', 'A1', 'F1'];
      const bar = Math.floor(step / 8) % 4;
      const pause = t > 6.4 && t < 7.4;
      if (pause) { if (step % 8 === 0) SFX.tone('C3', 1.5, { type: 'sine', vol: 0.05, attack: 0.3 }); return; }
      const swell = t < 6.4 ? 0.6 + t * 0.04 : t < 8 ? 0.8 : 1.2;
      if (step % 8 === 0) {
        SFX.chord(chords[bar], 3.2, { type: 'sine', vol: 0.05 * swell, attack: 0.5 });
        SFX.chord(chords[bar], 3.0, { type: 'triangle', vol: 0.025 * swell, attack: 0.7 });
        SFX.bass(bass[bar], 3.0, { vol: 0.12 * swell, attack: 0.2 });
      }
      const arp = chords[bar].concat([chords[bar][1].replace('4', '5')]);
      SFX.pluck(arp[step % 4].replace(/\d/, d => String(+d + 1)), { vol: 0.05 * swell });
      if (t > 7.4 && step % 4 === 0) SFX.kick({ vol: 0.15 });
      if (t > STAND && t < SIT) {
        for (let k = 0; k < 5; k++) SFX.clap({ when: P.hash(step * 7 + k) * 0.36, vol: 0.05 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const pauseDim = prog(t, 6.4, 0.4) * (1 - prog(t, 7.4, 0.5));

      /* ---------- room ---------- */
      P.bg(ctx, '#15121f');
      const rg = ctx.createRadialGradient(540, 600, 100, 540, 700, 900);
      rg.addColorStop(0, '#2a2140'); rg.addColorStop(1, '#0d0b14');
      ctx.save(); ctx.fillStyle = rg; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      // screen glow + frame
      ctx.save(); ctx.shadowColor = 'rgba(200,220,255,0.35)'; ctx.shadowBlur = 60 * P.scale;
      ctx.fillStyle = '#0a0910'; ctx.fillRect(SX - 14, SY - 14, SW + 28, SH + 28); ctx.restore();
      const [s0, idx] = slideAt(t);
      const lt = t - s0;
      ctx.save();
      ctx.beginPath(); ctx.rect(SX, SY, SW, SH); ctx.clip();
      const push = ease.outCubic(prog(lt, 0, 0.22));
      ctx.translate((1 - push) * 120, 0); ctx.globalAlpha = push;
      drawSlide(ctx, idx, lt, t);
      ctx.restore();
      bigBar(ctx, t);

      // stage
      ctx.save(); ctx.fillStyle = '#1f1826';
      ctx.beginPath(); ctx.ellipse(540, 1320, 760, 300, 0, Math.PI, 0); ctx.fill(); ctx.restore();
      // the round red carpet
      P.circle(ctx, CX, 1228, 290, '#d8322f', { ry: 62, seed: 50, amp: 4 });
      ctx.save(); ctx.globalAlpha = 0.25; P.circle(ctx, CX, 1222, 250, '#ff6a5e', { ry: 46, seed: 51, shadow: false }); ctx.restore();

      // IDEAS wordmark (stage left)
      'IDEAS'.split('').forEach((ch, k) => {
        P.text(ctx, ch, 110 + k * 50, 1040 + Math.sin(k * 1.7) * 4, { size: 86, font: 'bubble', color: '#e0312f', shadow: true, rot: (P.hash(k) - 0.5) * 0.12 });
      });
      P.text(ctx, 'worth tokenizing', 210, 1100, { size: 26, font: 'marker', color: '#f1e8df', shadow: false });

      // spotlight
      const sg = ctx.createRadialGradient(CX, 1080, 30, CX, 1100, 380);
      sg.addColorStop(0, 'rgba(255,240,215,0.35)'); sg.addColorStop(1, 'rgba(255,240,215,0)');
      ctx.save(); ctx.fillStyle = sg; ctx.fillRect(CX - 400, 700, 800, 650); ctx.restore();

      /* ---------- Clawd ---------- */
      const bowing = pulse(t, 8.7, 0.6) + pulse(t, 9.9, 0.6);
      const pace = Math.sin(t * 1.3) * 30 * (1 - P.prog(t, 5.9, 0.5));
      const x = CX + pace, y = CY + bowing * 25;
      let mood = 'happy';
      if (idx === 1) mood = 'smile';
      else if (idx === 2) mood = lt > 0.7 ? 'wow' : 'smile';
      else if (idx === 3) mood = lt > 0.5 ? 'wink' : 'smile';
      else if (t >= 6.4 && t < 7.4) mood = 'sleepy';
      const blink = pulse(t, 1.1, 0.15) + pulse(t, 5.6, 0.15);
      // pointing arm: flicks toward the screen on each slide change
      const point = ease.outBack(prog(lt, 0, 0.3)) * (1 - prog(lt, 1.0, 0.4));
      const hx = lerp(x + 150, x + 60, point), hy = lerp(y + 60, y - 230, point) + Math.sin(t * 3) * 10;
      if (t < STAND || t > SIT) {
        P.arm(ctx, x + 60, y + 20, hx, hy, 34);
        P.rect(ctx, hx - 14, hy - 22, 28, 44, C.ink, { radius: 6, seed: 60, shadow: false });
        P.dot(ctx, hx, hy - 10, 5, C.red);
      }
      P.claude(ctx, x, y, R, { t, mood, blink, rot: bowing * 0.35, squash: bowing * 0.2 });
      if (t >= STAND && t <= SIT) for (const sg2 of [-1, 1]) P.arm(ctx, x + sg2 * 60, y + 10, x + sg2 * (170 - bowing * 60), y - 150 + bowing * 150, 32);
      // headset mic
      ctx.save(); ctx.translate(x, y); ctx.rotate(bowing * 0.35);
      ctx.strokeStyle = '#e9e2d6'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(62, -28); ctx.quadraticCurveTo(70, 30, 26, 38); ctx.stroke();
      P.dot(ctx, 62, -30, 9, '#e9e2d6'); P.dot(ctx, 24, 38, 8, '#3a3440');
      ctx.restore();
      // single tear during the pause
      if (t > 6.7 && t < 7.6) {
        const tp = prog(t, 6.7, 0.9);
        P.circle(ctx, x - 20, y + 5 + tp * 60, 9, C.sky, { ry: 12, shadow: false, amp: 1 });
      }

      /* ---------- dramatic pause dim ---------- */
      if (pauseDim > 0) {
        const dg = ctx.createRadialGradient(x, y, 120, x, y, 700);
        dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, `rgba(0,0,0,${0.75 * pauseDim})`);
        ctx.save(); ctx.fillStyle = dg; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      }

      /* ---------- audience ---------- */
      audience(ctx, t);
      // camera flashes + hearts during ovation
      if (t > STAND && t < SIT) {
        for (let k = 0; k < 4; k++) {
          const f = P.hash(k * 13 + P.boil(t, 6));
          if (f > 0.7) P.star(ctx, 80 + P.hash(k + P.boil(t, 6)) * 900, 1360 + P.hash(k * 3 + P.boil(t, 6)) * 160, 30, '#fff', { shadow: false, points: 4, inner: 0.25 });
        }
        for (let k = 0; k < 6; k++) {
          const hl = ((t - STAND) * 0.6 + k / 6) % 1;
          ctx.save(); ctx.globalAlpha = 1 - hl;
          P.heart(ctx, 150 + k * 150 + Math.sin(t * 3 + k) * 30, 1400 - hl * 450, 26, k % 2 ? C.rose : C.pink, { shadow: false });
          ctx.restore();
        }
      }

      /* ---------- subtitles + sticker ---------- */
      const sub = SUBS.find(s => t >= s[0] && t < s[1]);
      if (sub) {
        const w = P.measure(ctx, sub[2], { size: 40, font: 'sans' }) + 60;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.roundRect(540 - w / 2, 870, w, 64, 12); ctx.fill(); ctx.restore();
        P.text(ctx, sub[2], 540, 903, { size: 40, font: 'sans', color: sub[2][0] === '[' ? '#f5c84b' : '#fff', shadow: false, weight: 700, maxWidth: 960 });
      }
      P.sticker(ctx, 'pov: you gave a talk about semicolons', 60, 1570, { pop: ease.outBack(prog(t, 0.2, 0.4)), size: 40 });

      /* ---------- sound ---------- */
      SLIDES.forEach(([s]) => { if (s > 0 && env.at(s)) { SFX.click({ vol: 0.2 }); SFX.swoosh({ vol: 0.06 }); } });
      if (env.at(2.6)) SFX.ding('G5', { vol: 0.1 });
      if (env.at(3.4 + 0.72)) { SFX.noise(0.25, { filter: 'highpass', freq: 2500, vol: 0.25 }); SFX.thud({ vol: 0.3 }); }
      if (env.at(5.5)) SFX.chime({ vol: 0.07 });
      if (env.at(6.45)) SFX.noise(0.4, { filter: 'bandpass', freq: 800, q: 3, vol: 0.03 }); // one cough
      if (env.at(7.4)) SFX.riser(0.8, { vol: 0.07 });
      if (env.at(STAND)) {
        SFX.noise(3.2, { filter: 'bandpass', freq: 1300, q: 0.5, vol: 0.1 });
        SFX.tone(2300, 0.4, { slide: 2900, vol: 0.03, when: 0.4 });
        SFX.tone(2600, 0.35, { slide: 2100, vol: 0.03, when: 1.2 });
        SFX.success({ vol: 0.1 });
      }
      if (env.at(8.7) || env.at(9.9)) SFX.boing({ vol: 0.05 });
    },
  });
})();
