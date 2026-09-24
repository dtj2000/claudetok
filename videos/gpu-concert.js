/* INFERENCE TOUR 2026: four GPUs play a stadium. The singer fries an
 * egg on its own backplate mid-solo. */
(function () {
  const D = 10, BPM = 144;
  const BEAT = 60 / BPM, STEP = BEAT / 2, BAR = BEAT * 4; // bar = 1.667s
  const TAU = Math.PI * 2;
  const F = (n) => SFX.freq(n);

  // riff roots per bar (8 eighths); null = rest
  const RIFF = [
    ['E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'G2', 'A2'],
    ['E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'B1', 'D2'],
    ['C2', 'C2', 'C2', 'C2', 'D2', 'D2', 'D2', 'D2'],
    ['E2', null, null, null, 'E2', null, null, null],
    ['C2', null, null, null, 'D2', null, null, null],
    ['E2', null, null, null, null, null, 'E2', 'E2'],
  ];
  const LEAD = [
    ['E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'D5', 'B4', 'A4', 'B4', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5'],
    ['B5', null, null, null, 'A5', 'G5', 'E5', 'G5', 'A5', 'B5', 'D6', 'B5', 'A5', 'G5', 'E5', 'D5'],
  ];
  const VOX = [
    [[0, 'B3', 2], [2, 'E4', 2], [4, 'G4', 4, 'A4']],
    [[0, 'A4', 1], [1, 'G4', 1], [2, 'E4', 2], [4, 'D4', 4, 'E4']],
  ];

  function power(root, dur, vol) {
    const f = F(root);
    [f, f * 1.4983, f * 2].forEach((x, i) => SFX.tone(x, dur, { type: 'sawtooth', vol: vol * (i === 2 ? 0.6 : 1), detune: i ? 6 : 0 }));
  }

  /* a graphics card with a spinning-fan face */
  function gpu(ctx, t, x, y, o) {
    const { C } = P;
    const w = o.w || 170, h = o.h || 300;
    const flipX = o.flip === undefined ? 1 : o.flip;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    // power cables = hair
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 9;
    for (let i = 0; i < 4; i++) {
      const sw = Math.sin(t * 7 + i) * 18 + (o.hairSwing || 0) * (i - 1.5) * 10;
      ctx.strokeStyle = i % 2 ? C.yellow : C.ink;
      ctx.beginPath(); ctx.moveTo(-18 + i * 12, -h / 2 - 16); ctx.quadraticCurveTo(-30 + i * 20 + sw, -h / 2 - 70, -40 + i * 26 + sw * 1.6, -h / 2 - 40 - (i % 2) * 30); ctx.stroke();
    }
    ctx.restore();
    P.rect(ctx, -34, -h / 2 - 22, 68, 26, '#1A1620', { radius: 6, seed: 3 });
    // arms (behind the card)
    (o.arms || []).forEach(([ax, ay, bx, by]) => P.arm(ctx, ax, ay, bx, by, 20, o.accent));
    ctx.save(); ctx.scale(flipX, 1);
    const back = flipX < 0;
    // PCIe gold fingers = feet
    P.rect(ctx, -w / 2 + 16, h / 2 - 6, w - 32, 26, '#2B6E3F', { radius: 4, seed: 4 });
    ctx.save(); ctx.fillStyle = C.yellow;
    for (let i = 0; i < 9; i++) ctx.fillRect(-w / 2 + 24 + i * ((w - 48) / 9), h / 2 + 4, (w - 48) / 9 - 4, 14);
    ctx.restore();
    if (!back) {
      P.rect(ctx, -w / 2, -h / 2, w, h, '#2E2B3A', { radius: 22, seed: o.seed || 5 });
      P.rect(ctx, -w / 2 + 6, -h / 2 + 8, 12, h - 16, o.accent, { radius: 6, seed: 6, shadow: false });
      P.rect(ctx, w / 2 - 18, -h / 2 + 8, 12, h - 16, o.accent, { radius: 6, seed: 7, shadow: false });
      [-h * 0.22, h * 0.24].forEach((fy, fi) => {
        const r = w * 0.36;
        P.circle(ctx, 0, fy, r + 6, '#1A1620', { seed: 8 + fi, shadow: false });
        ctx.save(); ctx.translate(0, fy); ctx.rotate(t * (o.fanSpeed || 14) * (fi ? -1 : 1));
        for (let b = 0; b < 7; b++) {
          ctx.rotate(TAU / 7);
          ctx.beginPath(); ctx.moveTo(r * 0.2, 0); ctx.quadraticCurveTo(r * 0.7, -r * 0.35, r * 0.95, -r * 0.05); ctx.quadraticCurveTo(r * 0.6, r * 0.12, r * 0.2, 0);
          ctx.fillStyle = fi ? '#5A5670' : '#6A6684'; ctx.fill();
        }
        ctx.restore();
        P.circle(ctx, 0, fy, r * 0.28, fi ? '#3A3648' : o.accent, { seed: 10 + fi, shadow: false });
      });
      ctx.restore(); ctx.save(); ctx.scale(Math.abs(flipX), 1); // un-flip for the face + label
      P.face(ctx, 0, -h * 0.22, w * 0.5, o.mood || 'happy', { ink: '#fff', skin: '#2E2B3A', blush: false });
      P.text(ctx, o.label, 0, h / 2 - 26, { size: 22, font: 'mono', color: o.accent, shadow: false, weight: 800 });
    } else {
      // the backplate
      P.rect(ctx, -w / 2, -h / 2, w, h, '#B9BCC8', { radius: 22, seed: 12 });
      ctx.save(); ctx.fillStyle = 'rgba(40,36,56,0.35)';
      for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) {
        const hx = -w / 2 + 34 + c * 34 + (r % 2) * 17, hy = -h / 2 + 30 + r * 36;
        if (hx < w / 2 - 20) { ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
      ctx.restore(); ctx.save(); ctx.scale(Math.abs(flipX), 1);
      P.rect(ctx, -60, h / 2 - 70, 120, 40, C.yellow, { radius: 6, seed: 13 });
      P.text(ctx, '⚠ HOT', 0, h / 2 - 49, { size: 24, font: 'mono', color: C.ink, shadow: false, weight: 800 });
      if (o.egg) o.egg(ctx);
    }
    ctx.restore();
    ctx.restore();
  }

  function heat(ctx, t, x, y, n, amt) {
    ctx.save(); ctx.strokeStyle = `rgba(255,200,150,${0.25 * amt})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const ph = (t * 1.2 + i / n) % 1;
      const bx = x + (i - (n - 1) / 2) * 34;
      ctx.beginPath();
      for (let k = 0; k <= 10; k++) {
        const yy = y - ph * 160 - k * 12;
        const xx = bx + Math.sin(k * 0.9 + t * 8 + i) * 8;
        k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function tempTag(ctx, x, y, temp, hot, t) {
    const blink = hot && Math.floor(t * 6) % 2;
    P.rect(ctx, x - 70, y - 24, 140, 48, blink ? P.C.red : '#1A1620', { radius: 12, seed: 14 });
    P.text(ctx, (hot ? '🔥' : '') + Math.round(temp) + '°C', x, y + 2, { size: 28, font: 'mono', color: hot ? '#fff' : P.C.mint, shadow: false, weight: 800 });
  }

  ClaudeTok.register({
    author: '@the.gpus',
    caption: 'GPU 0 fried an egg on its backplate mid-solo and the crowd lost it 🍳🤘 #inferencetour #gpu #rock #matmul #agentlife',
    sound: 'attention is all you need (live) · the.gpus',
    avatar: '🤘',
    avatarColor: '#6B4E9B',
    duration: D,
    bg: '#1A1433',
    thumb: 7.2,
    likes: '6.6M', commentCount: '144K', saves: '1.2M', shares: '512K',
    comments: [
      '@datacenter.hvac: i was not consulted about this tour',
      ['cuda.oom', 'tried to get tickets. out of memory'],
      ['tiny.clawd', 'I CAUGHT THE EGG 🍳 best night of my life'],
    ],

    bpm: BPM,
    subdiv: 2,
    onBeat(k) {
      const bar = Math.floor(k / 8) % 6, s = k % 8;
      const solo = bar === 3 || bar === 4;
      // drums
      if (s === 0 || s === 4 || (s === 3 && !solo) || (solo && s % 2 === 1)) SFX.kick({ vol: solo && s % 2 ? 0.3 : 0.45 });
      if (s === 2 || s === 6) SFX.snare({ vol: 0.24 });
      SFX.hat({ vol: s % 2 ? 0.04 : 0.06 });
      if (s === 0 && (bar === 0 || bar === 3 || bar === 5)) SFX.noise(1.1, { filter: 'highpass', freq: 5000, vol: 0.11 });
      // guitars
      const root = RIFF[bar][s];
      if (root) power(root, bar === 5 && s === 0 ? 1.4 : solo ? 0.75 : 0.13, 0.04);
      if (root) SFX.bass(root.replace(/\d/, (d) => String(Number(d) - 1)), solo ? 0.7 : 0.16, { vol: 0.2 });
      // vocals
      if (bar === 1 || bar === 2) VOX[bar - 1].forEach(([st, n, len, to]) => {
        if (st !== s) return;
        const dur = len * STEP * 0.95;
        SFX.tone(n, dur, { type: 'sawtooth', vol: 0.05, attack: 0.02, slide: to });
        SFX.tone(F(n) * 1.005, dur, { type: 'square', vol: 0.025, attack: 0.02, slide: to ? F(to) * 1.005 : undefined });
      });
      // shred
      if (solo) {
        const lead = LEAD[bar - 3];
        [0, 1].forEach((h) => {
          const n = lead[s * 2 + h];
          if (!n) return;
          const long = lead[s * 2 + h + 1] === null;
          SFX.tone(n, long ? STEP * 1.8 : STEP * 0.5, { type: 'square', vol: 0.045, when: (h * STEP) / 2, slide: long ? F(n) * 1.06 : undefined });
          SFX.tone(n, long ? STEP * 1.8 : STEP * 0.5, { type: 'sawtooth', vol: 0.02, when: (h * STEP) / 2, detune: 12 });
        });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const beat = t / BEAT, step = Math.floor(t / STEP), bar = Math.floor(t / BAR);
      const onBeat = 1 - (beat % 1);
      const head = Math.abs(Math.sin(Math.PI * beat));
      const soloOn = t >= 3 * BAR && t < 5 * BAR;
      const finale = t >= 5 * BAR;

      P.shake(ctx, t, onBeat * (finale ? 8 : 3));
      P.zoom(ctx, 1 + 0.015 * onBeat + (finale ? 0.03 * (1 - prog(t, 5 * BAR, 0.4)) : 0), 540, 1000);

      /* ---------- venue ---------- */
      P.bg(ctx, '#1A1433');
      P.rect(ctx, 60, 470, 960, 520, '#221A45', { radius: 20, seed: 2 });
      // back LED wall: tok/s counter + loss curve
      ctx.save(); ctx.globalAlpha = 0.9;
      P.rect(ctx, 260, 490, 560, 180, '#0E0B22', { radius: 14, seed: 3 });
      ctx.strokeStyle = C.mint; ctx.lineWidth = 6; ctx.beginPath();
      for (let x = 0; x <= 520; x += 10) { const yy = 520 + 120 * (1 - Math.exp(-x / 120)) + Math.sin(x * 0.3 + t * 6) * 4; x ? ctx.lineTo(280 + x, yy) : ctx.moveTo(280, yy); }
      ctx.stroke(); ctx.restore();
      P.text(ctx, `${(9001 + Math.floor(t * 777)).toLocaleString('en-US')} tok/s`, 540, 540, { size: 38, font: 'mono', color: C.yellow, shadow: false, weight: 800 });
      // amp stacks
      [[50, 'VRAM'], [880, '80GB']].forEach(([ax, lab], i) => {
        for (let r = 0; r < 3; r++) {
          const pump = r === 1 ? onBeat * 6 : 0;
          P.rect(ctx, ax, 640 + r * 150, 150, 140, '#15121F', { radius: 10, seed: 20 + i * 3 + r });
          P.circle(ctx, ax + 75, 710 + r * 150, 44 + pump, '#2E2B3A', { seed: 30 + r, shadow: false });
          P.circle(ctx, ax + 75, 710 + r * 150, 14, '#4A4660', { seed: 33 + r, shadow: false });
        }
        P.text(ctx, lab, ax + 75, 610, { size: 30, font: 'marker', color: C.cream, shadow: false });
      });

      // banner with chasing bulbs
      const bannerPop = 1 + (finale ? 0.06 * onBeat : 0);
      ctx.save(); ctx.translate(540, 360); ctx.scale(bannerPop, bannerPop); ctx.rotate(-0.015);
      P.rect(ctx, -450, -70, 900, 140, C.red, { radius: 20, seed: 40 });
      for (let i = 0; i < 36; i++) {
        const per = 36, f = i / per;
        let bx, by;
        if (f < 0.35) { bx = -440 + (f / 0.35) * 880; by = -62; } else if (f < 0.5) { bx = 440; by = -62 + ((f - 0.35) / 0.15) * 124; } else if (f < 0.85) { bx = 440 - ((f - 0.5) / 0.35) * 880; by = 62; } else { bx = -440; by = 62 - ((f - 0.85) / 0.15) * 124; }
        const lit = (i + step) % 3 === 0;
        P.dot(ctx, bx, by, 8, lit ? '#FFF4C8' : '#8a2e3c');
      }
      P.text(ctx, 'INFERENCE TOUR 2026', 0, 4, { size: 76, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 12 });
      ctx.restore();

      // truss + moving-head lights
      P.rect(ctx, 30, 440, 1020, 34, '#8A8FA0', { radius: 8, seed: 41 });
      ctx.save(); ctx.strokeStyle = '#6A6F80'; ctx.lineWidth = 4;
      for (let x = 40; x < 1040; x += 34) { ctx.beginPath(); ctx.moveTo(x, 444); ctx.lineTo(x + 30, 470); ctx.stroke(); }
      ctx.restore();
      const LCOL = ['#F2B8C6', '#8EC9E8', '#C9B6FF', '#F5C84B', '#FF7A6B', '#8FD3B6'];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      [150, 330, 540, 750, 930].forEach((lx, i) => {
        const col = LCOL[(bar + i) % LCOL.length];
        const sw = Math.sin(beat * Math.PI * 0.5 + i * 1.3) * (soloOn && i === 1 ? 0.1 : 0.45);
        const tx = lx + Math.sin(sw) * 900, ty = 1250;
        ctx.globalAlpha = 0.13 + 0.07 * onBeat;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(lx - 20, 480); ctx.lineTo(lx + 20, 480); ctx.lineTo(tx + 160, ty); ctx.lineTo(tx - 160, ty); ctx.closePath(); ctx.fill();
      });
      ctx.restore();
      [150, 330, 540, 750, 930].forEach((lx, i) => { P.rect(ctx, lx - 26, 468, 52, 44, '#2E2B3A', { radius: 10, seed: 42 + i }); P.dot(ctx, lx, 505, 14, LCOL[(bar + i) % LCOL.length]); });

      // stage floor
      P.poly(ctx, [[20, 1110], [1060, 1110], [1080, 1262], [0, 1262]], '#3A2B22', { seed: 45 });
      P.rect(ctx, -10, 1255, 1100, 90, '#15121F', { radius: 6, seed: 46 });

      /* ---------- the band ---------- */
      const singerTemp = lerp(78, 104, ease.inOutSine(prog(t, 0.5, 5)));
      // drummer (GPU 3) on the riser
      const hitL = Math.pow(1 - ((beat / 2 + 0.5) % 1), 3), hitR = Math.pow(1 - ((beat * 2) % 1), 2);
      P.rect(ctx, 330, 790, 420, 70, '#2E2B3A', { radius: 10, seed: 47 });
      gpu(ctx, t, 540, 660 - head * 8, {
        w: 150, h: 250, accent: C.mint, label: 'GPU 3', mood: 'happy', seed: 51, fanSpeed: 18,
        arms: [[-60, 40, -150, 110 - hitL * 50], [60, 40, 160, 90 - hitR * 50]],
      });
      // sticks
      ctx.save(); ctx.strokeStyle = '#F6EEDD'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(390, 770 - hitL * 50); ctx.lineTo(330, 820 - hitL * 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(700, 750 - hitR * 50); ctx.lineTo(770, 770 - hitR * 90); ctx.stroke();
      ctx.restore();
      // kit
      P.circle(ctx, 360, 820, 70, '#D8D2E0', { ry: 20, seed: 48 });
      ctx.save(); ctx.translate(780, 740); ctx.rotate(-0.2 + Math.sin(t * 20) * 0.08 * hitR);
      P.circle(ctx, 0, 0, 80, C.mustard, { ry: 16, seed: 49 }); ctx.restore();
      P.circle(ctx, 470, 800, 50, C.rose, { ry: 34, seed: 52 }); P.circle(ctx, 610, 800, 50, C.rose, { ry: 34, seed: 53 });
      P.circle(ctx, 540, 880, 100 + onBeat * 6, C.cream, { seed: 54, stroke: C.red, lineWidth: 16 });
      P.text(ctx, 'FP16', 540, 884, { size: 58, font: 'bubble', color: C.red, shadow: false });

      // heat shimmer over everyone
      heat(ctx, t, 250, 860, 3, 0.8);
      heat(ctx, t, 820, 860, 3, 0.8);
      heat(ctx, t, 540, 890, 5, 1 + prog(t, 3, 4) * 2);

      // guitarist (GPU 1): steps up for the solo
      const gFwd = ease.inOutCubic(clamp(prog(t, 3 * BAR - 0.2, 0.4) - prog(t, 5 * BAR - 0.2, 0.4)));
      const gx = lerp(240, 280, gFwd), gy = 1040 + gFwd * 30;
      const strum = (t / STEP) % 1;
      const gRot = soloOn ? -0.25 + Math.sin(t * 9) * 0.05 : 0.15 * head;
      gpu(ctx, t, gx, gy, {
        w: 160, h: 280, accent: C.rose, label: 'GPU 1', mood: soloOn ? 'wink' : 'angry', rot: gRot, seed: 55, hairSwing: head,
        arms: [[-60, 20, -30, 90], [60, 20, 150, 60 + strum * 20]],
      });
      ctx.save(); ctx.translate(gx + 30, gy + 80); ctx.rotate(gRot - 0.5);
      P.arm(ctx, 20, 0, 260, 0, 24, '#6E4630');
      P.rect(ctx, 250, -18, 50, 36, '#2B2233', { radius: 6, seed: 56 });
      P.poly(ctx, [[-10, 0], [-110, -80], [-80, -90], [30, -18], [30, 18], [-80, 90], [-110, 80]], C.red, { seed: 57 });
      ctx.restore();
      if (soloOn) {
        for (let i = 0; i < 6; i++) {
          const ph = (t * 3 + i / 6) % 1;
          P.star(ctx, gx + 190 + ph * 120 * Math.cos(i), gy - 40 - ph * 150, 14 * (1 - ph), C.yellow, { shadow: false, points: 4, inner: 0.35 });
        }
      }

      // bassist (GPU 2)
      gpu(ctx, t, 810, 1040 + head * 6, {
        w: 160, h: 280, accent: C.sky, label: 'GPU 2', mood: t % 3 < 1.5 ? 'sus' : 'side', rot: -0.08 * head, seed: 58,
        arms: [[60, 20, 20, 100], [-60, 20, -150, 30]],
      });
      ctx.save(); ctx.translate(800, 1130); ctx.rotate(0.55 - 0.08 * head);
      P.arm(ctx, 0, 0, -300, 0, 22, '#6E4630');
      P.circle(ctx, 20, 0, 70, C.blue, { ry: 50, seed: 59 });
      P.rect(ctx, -330, -16, 44, 32, '#2B2233', { radius: 6, seed: 60 });
      ctx.restore();

      // singer (GPU 0): flips round to fry an egg on its backplate
      const flipA = ease.inOutCubic(prog(t, 3 * BAR + 0.35, 0.35)) * Math.PI + ease.inOutCubic(prog(t, 4.9 * BAR, 0.3)) * Math.PI;
      const flipX = Math.cos(flipA) || 0.001;
      const crack = 3 * BAR + 0.9;
      const egg = (c) => {
        const cook = prog(t, crack, 2.2);
        const spread = ease.outElastic(prog(t, crack, 0.6));
        if (t < crack) {
          // hand holding the egg
          P.arm(c, -150, -120, -20, -70, 20, C.claude);
          P.circle(c, 0, -60 + Math.sin(t * 20) * 3, 30, C.cream, { ry: 38, seed: 70 });
          return;
        }
        const pts = [];
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * TAU, rr = (52 + P.hash(i + 3) * 26) * spread;
          pts.push([Math.cos(a) * rr, -30 + Math.sin(a) * rr * 1.1]);
        }
        const white = `rgba(255,255,255,${0.55 + 0.45 * cook})`;
        P.poly(c, pts, cook > 0.6 ? '#E9C79A' : white, { seed: 71, amp: 3 });
        if (cook > 0.6) P.poly(c, pts.map(([px, py]) => [px * 0.85, -30 + (py + 30) * 0.85]), '#FFFFFF', { seed: 72, amp: 3, shadow: false });
        P.circle(c, 6, -34, 24 * spread, '#F5B82E', { seed: 73 });
        P.circle(c, -2, -42, 7 * spread, 'rgba(255,255,255,0.7)', { shadow: false });
        // sizzle bubbles + shell halves falling
        for (let i = 0; i < 6; i++) {
          const ph = (t * 2.5 + i / 6) % 1;
          P.dot(c, Math.cos(i * 2.1) * 50, -30 + Math.sin(i * 2.1) * 40, 5 * (1 - ph), 'rgba(255,255,255,0.8)');
        }
        const fall = t - crack;
        if (fall < 1) {
          P.circle(c, -40 - fall * 60, -60 + fall * fall * 900, 22, C.cream, { ry: 14, seed: 74 });
          P.circle(c, 40 + fall * 60, -60 + fall * fall * 900, 22, C.cream, { ry: 14, seed: 75 });
        }
      };
      const sx = 540, sy = 1060 + head * 6;
      const singing = t >= BAR && t < 3 * BAR;
      gpu(ctx, t, sx, sy, {
        w: 180, h: 310, accent: C.claude, label: 'GPU 0', seed: 61, fanSpeed: 10 + singerTemp * 0.2,
        mood: singing ? (step % 2 ? 'wow' : 'happy') : finale ? 'wink' : 'happy', flip: flipX, egg, hairSwing: head * 1.5,
        rot: singing ? -0.05 * head : 0,
        arms: flipX > 0 ? [[80, -20, 150, -60], [-80, 10, -140, 80 - head * 30]] : [[80, -20, 150, 40], [-80, -20, -150, -80]],
      });
      // mic stand
      ctx.save(); ctx.strokeStyle = '#8A8FA0'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(680, 1240); ctx.lineTo(680, 1050); ctx.lineTo(640, 980); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(640, 1240); ctx.lineTo(720, 1240); ctx.stroke();
      ctx.restore();
      P.circle(ctx, 632, 968, 20, '#4A4660', { ry: 26, seed: 62 });
      if (singing) {
        for (let i = 0; i < 3; i++) {
          const ph = ((t * 1.5 + i / 3) % 1);
          P.text(ctx, i % 2 ? '♫' : '♪', 660 + ph * 90, 930 - ph * 160, { size: 46, font: 'sans', color: `rgba(255,244,200,${1 - ph})`, shadow: false });
        }
      }
      // temperature tags
      tempTag(ctx, 690, 590, 71, false, t);
      tempTag(ctx, gx, 835, 88 + (soloOn ? 6 : 0), false, t);
      tempTag(ctx, 810, 835, 83, false, t);
      tempTag(ctx, 540, 815, singerTemp, singerTemp > 100, t);

      // smoke machine fog
      ctx.save(); ctx.globalAlpha = 0.35;
      for (let i = 0; i < 9; i++) {
        const fx = ((i * 140 + (t / D) * 280 * (i % 2 ? 1 : -1)) % 1260 + 1260) % 1260 - 90;
        P.circle(ctx, fx, 1230 + Math.sin(t + i) * 10, 90, '#E4DCFF', { shadow: false, seed: i });
      }
      ctx.restore();

      // pyro in the finale
      if (finale || t < 0.6) {
        const lt = finale ? t - 5 * BAR : t + 1.5;
        [150, 930].forEach((px, j) => {
          const r = P.rng(j + 3);
          for (let i = 0; i < 26; i++) {
            const ph = ((lt * 1.6 + r()) % 1);
            const a = -Math.PI / 2 + (r() - 0.5) * 0.5;
            const v = 700 + r() * 300;
            const x = px + Math.cos(a) * v * ph * 0.6, y = 1250 + Math.sin(a) * v * ph + 900 * ph * ph * 0.5;
            P.dot(ctx, x, y, 8 * (1 - ph), i % 3 ? C.yellow : '#FFF4C8');
          }
        });
      }

      // the egg flies to the crowd
      const eggFly = prog(t, 5 * BAR - 0.05, 0.7);
      if (t >= 5 * BAR - 0.05 && eggFly < 1) {
        const ex = lerp(540, 250, eggFly), ey = lerp(960, 1380, eggFly) - Math.sin(eggFly * Math.PI) * 380;
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(eggFly * 9);
        P.circle(ctx, 0, 0, 44, '#fff', { seed: 76 }); P.circle(ctx, 4, -2, 18, '#F5B82E', { seed: 77, shadow: false });
        ctx.restore();
      }

      /* ---------- crowd ---------- */
      const caught = t >= 5 * BAR + 0.65;
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 9; i++) {
          const idx = row * 9 + i;
          const cx = 20 + i * 130 + (row ? 65 : 0), cy = 1420 + row * 100;
          const bob = Math.abs(Math.sin(Math.PI * beat + idx * 0.4)) * 20;
          const lighter = idx % 3 === 0, phone = idx % 5 === 2;
          const isCatcher = row === 0 && i === 2;
          const armUp = soloOn || finale || lighter;
          if (armUp) {
            const hx = cx + 30 + Math.sin(t * 2 + idx) * 20, hy = cy - bob - 120;
            P.arm(ctx, cx + 20, cy - bob, hx, hy, 18);
            if (lighter) {
              P.rect(ctx, hx - 12, hy - 36, 24, 36, '#9CA0AE', { radius: 5, seed: idx, shadow: false });
              const fl = 1 + Math.sin(t * 25 + idx) * 0.2;
              P.circle(ctx, hx, hy - 52 * fl, 12, C.yellow, { ry: 20 * fl, seed: idx, shadow: { blur: 20, dy: 0, alpha: 0.5 } });
              P.circle(ctx, hx, hy - 48 * fl, 5, '#fff', { ry: 9, shadow: false });
            } else P.circle(ctx, hx, hy, 14, C.claude, { shadow: false });
          }
          P.claude(ctx, cx, cy - bob, 48, { t: t + idx, mood: isCatcher && caught ? 'happy' : isCatcher && t >= 5 * BAR ? 'wow' : soloOn ? 'wow' : 'happy', seed: 40 + (idx % 6), color: row ? '#D9774F' : C.claude });
          if (phone && !lighter) {
            P.rect(ctx, cx - 70, cy - bob - 110, 44, 70, C.ink, { radius: 8, seed: idx });
            P.rect(ctx, cx - 65, cy - bob - 104, 34, 58, C.mint, { radius: 5, seed: idx + 1, shadow: false });
          }
          if (isCatcher && caught) {
            P.circle(ctx, cx + 40, cy - bob - 50, 42, '#fff', { ry: 14, seed: 80 });
            P.circle(ctx, cx + 40, cy - bob - 62, 30, '#fff', { ry: 18, seed: 81, shadow: false });
            P.circle(ctx, cx + 44, cy - bob - 64, 12, '#F5B82E', { seed: 82, shadow: false });
          }
        }
      }
      // signs
      [['MORE VRAM', 700, 1330, 0.05, C.yellow], ['FP8 OR DIE 🤘', 440, 1310, -0.06, C.pink]].forEach(([s, x, y, r, col], i) => {
        const up = Math.abs(Math.sin(Math.PI * beat + i)) * 18;
        ctx.save(); ctx.translate(x, y - up); ctx.rotate(r);
        const w = P.measure(ctx, s, { size: 38, font: 'marker' }) + 40;
        P.rect(ctx, -6, 30, 12, 110, C.wood, { radius: 4, seed: 90 + i, shadow: false });
        P.rect(ctx, -w / 2, -34, w, 68, col, { radius: 8, seed: 92 + i });
        P.text(ctx, s, 0, 2, { size: 38, font: 'marker', color: C.ink, shadow: false });
        ctx.restore();
      });

      /* ---------- text ---------- */
      if (singing) {
        const line = t < 2 * BAR ? '🎤 ATTENTIONNN' : 'IS ALL YOU NEEEED';
        P.bubble(ctx, line, 330, 620, 480, 930, { size: 52, pop: ease.outBack(prog((t - BAR) % BAR, 0, 0.25)) });
      }
      P.title(ctx, 'GUITAR SOLO', 540, 610, { size: 110, color: C.rose, rot: -0.05, pop: ease.outBack(prog(t, 3 * BAR, 0.3)) * (1 - ease.inCubic(prog(t, 3 * BAR + 0.8, 0.2))) });
      if (t >= 3 * BAR + 1.1 && t < 5 * BAR) P.bubble(ctx, 'hold my\nthermal paste', 320, 700, 480, 950, { size: 46, pop: ease.outBack(prog(t, 3 * BAR + 1.1, 0.3)) });
      if (t < 4.8) P.sticker(ctx, 'they only know one song: matmul', 60, 1580, { size: 40, pop: ease.outBack(prog(t, 0.3, 0.4)) });
      else if (t < 8.3) P.sticker(ctx, 'GPU 0 is at 104°C and thriving', 60, 1580, { size: 40, pop: ease.outBack(prog(t, 4.8, 0.4)), rot: 0.02, seed: 7 });
      else P.sticker(ctx, 'someone in the crowd CAUGHT THE EGG', 50, 1580, { size: 38, pop: ease.outBack(prog(t, 8.8, 0.4)), seed: 9 });
      P.flash(ctx, finale ? 0.5 * (1 - prog(t, 5 * BAR, 0.25)) : 0, '#FFF4C8');

      /* ---------- one-shots ---------- */
      if (env.at(3 * BAR + 0.35)) SFX.whoosh({ vol: 0.15, dur: 0.3 });
      if (env.at(crack)) { SFX.noise(0.08, { filter: 'highpass', freq: 3000, vol: 0.25 }); SFX.pop({ f: 900, vol: 0.1 }); }
      if (env.at(crack + 0.05)) SFX.noise(2.4, { filter: 'highpass', freq: 4000, vol: 0.07 });
      for (let k = 0; k < 8; k++) if (env.at(crack + 0.2 + k * 0.27)) SFX.noise(0.02, { filter: 'highpass', freq: 6000, vol: 0.12 });
      if (env.at(5 * BAR - 0.05)) SFX.swoosh({ vol: 0.15 });
      if (env.at(5 * BAR + 0.65)) { SFX.noise(1.6, { filter: 'bandpass', freq: 1400, q: 0.5, vol: 0.14 }); SFX.tone(2200, 0.4, { slide: 2900, vol: 0.04, when: 0.2 }); }
    },
  });
})();
