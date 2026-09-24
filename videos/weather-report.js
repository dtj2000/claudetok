/* The Codebase weather report. Meteorologist Clawd, green-screen map, smooth weather-channel jazz:
 * merge-conflict storm over /src, 104°C heatwave in the GPU District, fog over the
 * requirements doc, a dependency-update tornado that leaves the map, then a cursed 5-day forecast. */
(function () {
  'use strict';
  const DUR = 12;
  const MAP = { x: 30, y: 310, w: 1020, h: 860 };
  const MC = [540, 740]; // screen center of the map
  const SEG = { storm: 0, heat: 2.2, fog: 4.4, tornado: 6.4, week: 8.4, back: 11.2 };
  const GLITCH = 7.35;
  const CLAWD = [190, 1215], CR = 128;
  const TILE_AT = [8.7, 9.1, 9.5, 9.9, 10.3];

  const REGIONS = [
    { id: 'src', x: 300, y: 530, rx: 205, ry: 140, c: '#9BD08B', label: '/src', seed: 11 },
    { id: 'gpu', x: 790, y: 505, rx: 190, ry: 130, c: '#E9C46A', label: 'GPU District', seed: 12 },
    { id: 'req', x: 780, y: 870, rx: 175, ry: 120, c: '#C9D6DF', label: 'Requirements\nDoc', seed: 13 },
    { id: 'nm', x: 470, y: 1000, rx: 235, ry: 105, c: '#7FA66B', label: 'node_modules\nSwamp', seed: 14 },
    { id: 'tests', x: 175, y: 820, rx: 95, ry: 62, c: '#B8D8A8', label: '/tests\n(abandoned)', seed: 15 },
  ];
  // [time, focusX, focusY, scale]
  const FOCUS = [[SEG.storm, 300, 540, 1.3], [SEG.heat, 790, 520, 1.3], [SEG.fog, 780, 860, 1.35], [SEG.tornado, 480, 960, 1.12], [SEG.week, 540, 740, 1.0], [SEG.back, 300, 540, 1.3]];

  const DAYS = [
    { d: 'MON', temp: '21°', note: 'tests pass', icon: 'sun', bg: '#FBF7EE' },
    { d: 'TUE', temp: '26°', note: 'flaky', icon: 'partly', bg: '#FBF7EE' },
    { d: 'WED', temp: '429°', note: 'rate limits', icon: 'rain', bg: '#E4ECF2' },
    { d: 'THU', temp: 'NaN°', note: 'prod fire', icon: 'fire', bg: '#FBE3D2' },
    { d: 'FRI', temp: '∞°', note: 'deploy', icon: 'skull', bg: '#1A1620' },
  ];
  const TICKER = '  ⚠ do not git push --force until further notice  •  umbrellas advised (try/catch)  •  GPUs: stay hydrated, stay quantized  •  fog expected to lift "once the PM gets back to us"  •  ';

  function blobPts(cx, cy, rx, ry, seed, n = 14) {
    const r = P.rng(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * P.TAU, k = 0.78 + r() * 0.34;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return pts;
  }

  function mapCam(t) {
    const { ease, prog, lerp } = P;
    let i = 0;
    for (let k = 0; k < FOCUS.length; k++) if (t >= FOCUS[k][0]) i = k;
    const cur = FOCUS[i], prev = FOCUS[Math.max(0, i - 1)];
    const q = i === 0 ? 1 : ease.inOutCubic(prog(t, cur[0], 0.45));
    return { fx: lerp(prev[1], cur[1], q), fy: lerp(prev[2], cur[2], q), s: lerp(prev[3], cur[3], q) };
  }
  const toScreen = (cam, x, y) => [MC[0] + (x - cam.fx) * cam.s, MC[1] + (y - cam.fy) * cam.s];

  /* ---------------- weather icons ---------------- */
  function bolt(ctx, x, y, s, col = P.C.yellow) {
    P.poly(ctx, [[x, y], [x + 36 * s, y], [x + 14 * s, y + 52 * s], [x + 40 * s, y + 52 * s], [x - 14 * s, y + 130 * s], [x + 2 * s, y + 70 * s], [x - 22 * s, y + 70 * s]], col, { seed: 21, amp: 2 });
  }
  function sun(ctx, x, y, r, t) {
    P.star(ctx, x, y, r * 1.45, P.C.mustard, { points: 12, inner: 0.72, rot: t * 0.6 });
    P.circle(ctx, x, y, r, P.C.yellow, { seed: 22 });
  }
  function flame(ctx, x, y, s, t) {
    const f = Math.sin(t * 18) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y - 60 * s - f);
    ctx.bezierCurveTo(x + 40 * s, y - 20 * s, x + 38 * s, y + 30 * s, x, y + 34 * s);
    ctx.bezierCurveTo(x - 38 * s, y + 30 * s, x - 40 * s, y - 10 * s, x - 6 * s, y - 34 * s + f);
    ctx.closePath();
    P.cut(ctx, P.C.red);
    ctx.beginPath();
    ctx.moveTo(x, y - 20 * s + f);
    ctx.bezierCurveTo(x + 20 * s, y, x + 20 * s, y + 28 * s, x, y + 30 * s);
    ctx.bezierCurveTo(x - 20 * s, y + 28 * s, x - 20 * s, y + 4 * s, x, y - 20 * s + f);
    P.cut(ctx, P.C.yellow, { shadow: false });
  }
  function skull(ctx, x, y, s) {
    const { C } = P;
    P.circle(ctx, x, y - 8 * s, 44 * s, '#F4EFE6', { seed: 23 });
    P.rect(ctx, x - 26 * s, y + 20 * s, 52 * s, 30 * s, '#F4EFE6', { radius: 8, seed: 24, shadow: false });
    P.circle(ctx, x - 17 * s, y - 8 * s, 12 * s, C.black, { seed: 25, shadow: false });
    P.circle(ctx, x + 17 * s, y - 8 * s, 12 * s, C.black, { seed: 26, shadow: false });
    P.poly(ctx, [[x, y + 6 * s], [x - 6 * s, y + 18 * s], [x + 6 * s, y + 18 * s]], C.black, { seed: 27, amp: 1, shadow: false });
    ctx.save(); ctx.strokeStyle = C.black; ctx.lineWidth = 3 * s;
    ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(x + k * 12 * s, y + 26 * s); ctx.lineTo(x + k * 12 * s, y + 48 * s); } ctx.stroke(); ctx.restore();
  }
  function rainLines(ctx, x, y, w, h, t, n, col = '#DDEBFF', seed = 3) {
    const r = P.rng(seed);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const rx = x + r() * w, ph = r();
      const yy = y + ((t * 1.6 + ph) % 1) * h;
      ctx.moveTo(rx, yy); ctx.lineTo(rx - 8, yy + 26);
    }
    ctx.stroke(); ctx.restore();
  }

  function tornado(ctx, x, y, t, s = 1) {
    const { C } = P;
    const tags = ['v4.2.0-rc.1', '^1.0.0', 'peerDep', 'lockfile', 'BREAKING', '@latest'];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // debris behind
    const deb = (front) => tags.forEach((tag, i) => {
      const a = t * 7 + i * (P.TAU / tags.length);
      if ((Math.sin(a) > 0) !== front) return;
      const lvl = -80 - i * 55;
      const rr = 50 + i * 22;
      const bx = Math.cos(a) * rr + Math.sin(t * 3 + lvl * 0.02) * (-lvl) * 0.08;
      ctx.save(); ctx.translate(bx, lvl); ctx.rotate(a * 0.5);
      P.rect(ctx, -44, -18, 88, 36, i % 2 ? '#D9B384' : '#C08A5B', { radius: 4, seed: 30 + i, shadow: { blur: 5, dy: 4, alpha: 0.3 } });
      P.text(ctx, tag, 0, 1, { size: 15, font: 'mono', color: C.ink, shadow: false, weight: 700, maxWidth: 80 });
      ctx.restore();
    });
    deb(false);
    for (let k = 15; k >= 0; k--) {
      const yy = -k * 26, rx = 18 + k * 9.5;
      const sway = Math.sin(t * 3 + k * 0.35) * k * 3;
      P.circle(ctx, sway, yy, rx, k % 2 ? '#8a8494' : '#A39FAD', { ry: 16, seed: 40 + k, shadow: k === 0 ? {} : false, amp: 2 });
    }
    // swirl lines
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4;
    for (let k = 1; k < 15; k += 3) {
      const yy = -k * 26, rx = 18 + k * 9.5, sway = Math.sin(t * 3 + k * 0.35) * k * 3;
      const ph = (t * 5 + k) % P.TAU;
      ctx.beginPath(); ctx.ellipse(sway, yy, rx * 0.8, 8, 0, ph, ph + 1.6); ctx.stroke();
    }
    ctx.restore();
    deb(true);
    ctx.restore();
  }

  /* ---------------- the map ---------------- */
  function drawMap(ctx, t, cam) {
    const { C, prog, ease, pulse } = P;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 24); ctx.clip();
    ctx.translate(MC[0], MC[1]); ctx.scale(cam.s, cam.s); ctx.translate(-cam.fx, -cam.fy);
    // sea of tokens
    ctx.fillStyle = '#6FB7DD'; ctx.fillRect(-300, 0, 1700, 1500);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const wr = P.rng(5);
    for (let i = 0; i < 40; i++) {
      const x = -100 + wr() * 1300, y = 300 + wr() * 900, o = Math.sin(t * 2 + i) * 6;
      ctx.beginPath(); ctx.moveTo(x + o, y); ctx.quadraticCurveTo(x + 14 + o, y - 10, x + 28 + o, y); ctx.quadraticCurveTo(x + 42 + o, y + 10, x + 56 + o, y); ctx.stroke();
    }
    ctx.restore();
    P.text(ctx, 'Sea of Tokens', 560, 700, { size: 40, font: 'hand', color: 'rgba(255,255,255,0.75)', shadow: false, rot: -0.08 });
    P.text(ctx, 'prod ⚑', 1000, 1090, { size: 30, font: 'marker', color: C.paper, shadow: false });
    P.circle(ctx, 985, 1060, 36, '#B8D8A8', { seed: 16 });

    REGIONS.forEach(r => {
      P.poly(ctx, blobPts(r.x, r.y, r.rx, r.ry, r.seed), r.c, { seed: r.seed, amp: 5 });
      P.poly(ctx, blobPts(r.x, r.y, r.rx * 0.7, r.ry * 0.62, r.seed + 50), 'rgba(255,255,255,0.18)', { seed: r.seed + 1, amp: 4, shadow: false });
    });
    // doc sheet on the requirements region
    ctx.save(); ctx.translate(790, 862); ctx.rotate(-0.06);
    P.rect(ctx, -110, -80, 220, 160, C.paper, { radius: 6, seed: 17 });
    ['must be fast', 'must be cheap', 'must be ✨intuitive✨', '"you know what i mean"'].forEach((l, i) =>
      P.text(ctx, l, -96, -52 + i * 34, { size: 22, font: 'hand', align: 'left', color: C.ink, shadow: false, maxWidth: 196 }));
    ctx.restore();
    // GPU buildings
    for (let k = 0; k < 4; k++) {
      const bx = 690 + k * 62, by = 560, hgt = 60 + (k % 2) * 30;
      const melt = t >= SEG.heat ? ease.outCubic(prog(t, SEG.heat + 0.9 + k * 0.1, 1.0)) : 0;
      P.rect(ctx, bx, by - hgt, 44, hgt, '#3F7F5A', { radius: 5, seed: 60 + k });
      P.text(ctx, 'GPU', bx + 22, by - hgt + 18, { size: 14, font: 'mono', color: '#cfe8d8', shadow: false });
      if (melt > 0) {
        P.rect(ctx, bx + 8, by - 4, 12, 10 + melt * 26, '#3F7F5A', { radius: 6, seed: 70 + k, shadow: false });
        P.dot(ctx, bx + 14, by + 8 + melt * 26, 7, '#3F7F5A');
      }
    }
    // labels
    REGIONS.forEach(r => {
      const hot = r.id === 'gpu' ? 1 + pulse(t, SEG.heat + 0.8, 0.3) * 0.15 : 1;
      P.text(ctx, r.label, r.x, r.y - r.ry + 20, { size: r.id === 'tests' ? 26 : 38, font: 'marker', color: C.ink, stroke: C.paper, strokeWidth: 8, shadow: false, scale: hot, lineHeight: 0.95 });
    });

    /* storm over /src (always there, loudest during its segment) */
    const stormAmp = t < SEG.heat || t >= SEG.back ? 1 : 0.55;
    const light = [0.1, 0.95, 1.6, 11.7].some(l => t >= l && t < l + 0.14);
    if (light) bolt(ctx, 280, 470, 1.1);
    const cr = P.rng(8);
    ['<<<<<<< HEAD', '=======', '>>>>>>> main', '<<<<<<<', '>>>>>>>'].forEach((s, i) => {
      const ph = cr(), x = 180 + cr() * 220;
      const y = 470 + ((t * 0.9 * stormAmp + ph) % 1) * 190;
      ctx.save(); ctx.globalAlpha = stormAmp;
      P.text(ctx, s, x, y, { size: 22, font: 'mono', color: '#fff', stroke: C.red, strokeWidth: 6, shadow: false, weight: 800 });
      ctx.restore();
    });
    rainLines(ctx, 170, 470, 260, 170, t, Math.round(18 * stormAmp), '#DDEBFF', 3);
    P.cloud(ctx, 300, 430 + Math.sin(t * 2) * 5, 1.15, light ? '#6a6480' : '#4E4862');
    P.cloud(ctx, 190, 455 + Math.sin(t * 2 + 1) * 5, 0.7, '#5d5772');

    /* heatwave */
    if (t >= SEG.heat - 0.2) {
      const pop = ease.outBack(prog(t, SEG.heat, 0.4));
      ctx.save(); ctx.translate(900, 420); ctx.scale(pop, pop);
      sun(ctx, 0, 0, 58, t);
      P.face(ctx, 0, 4, 40, t >= SEG.fog ? 'sleepy' : 'dead', { blush: true });
      ctx.restore();
      // shimmer
      ctx.save(); ctx.strokeStyle = 'rgba(255,120,60,0.55)'; ctx.lineWidth = 4;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        for (let yy = 0; yy <= 90; yy += 6) { const xx = 670 + k * 70 + Math.sin(yy * 0.12 + t * 9 + k) * 8; yy ? ctx.lineTo(xx, 470 - yy) : ctx.moveTo(xx, 470); }
        ctx.stroke();
      }
      ctx.restore();
      // thermometer
      const fill = ease.outCubic(prog(t, SEG.heat + 0.3, 0.9));
      P.rect(ctx, 610, 360, 34, 150, '#fff', { radius: 17, seed: 18 });
      P.circle(ctx, 627, 520, 28, C.red, { seed: 19 });
      P.rect(ctx, 619, 510 - 140 * fill, 16, 140 * fill + 6, C.red, { radius: 8, seed: 20, shadow: false });
    }

    /* fog */
    if (t >= SEG.fog - 0.2) {
      const fa = P.clamp(prog(t, SEG.fog, 0.6) * 0.92);
      ctx.save(); ctx.globalAlpha = fa;
      for (let k = 0; k < 6; k++) {
        const dx = ((t * (18 + k * 6) + k * 70) % 380) - 190;
        P.circle(ctx, 780 + dx, 820 + (k % 3) * 45, 90 + (k % 2) * 30, k % 2 ? '#E9EEF2' : '#D5DCE2', { ry: 42, seed: 80 + k, shadow: false, amp: 6 });
      }
      ctx.restore();
      if (t >= SEG.fog + 0.5) P.text(ctx, '???', 700 + Math.sin(t * 2) * 30, 790, { size: 44, font: 'marker', color: C.ink, rot: -0.1, scale: fa });
    }
    ctx.restore();
  }

  function dayTile(ctx, i, x, y, w, h, t, pop) {
    const { C } = P;
    const dd = DAYS[i];
    if (pop <= 0) return;
    const cursed = dd.icon === 'skull';
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (cursed) { P.shake(ctx, t, 3); ctx.rotate(Math.sin(t * 13) * 0.03); }
    ctx.scale(pop, pop);
    if (cursed) { ctx.save(); ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t * 10); P.circle(ctx, 0, 0, w * 0.75, C.red, { ry: h * 0.62, shadow: false, seed: 99 }); ctx.restore(); }
    P.rect(ctx, -w / 2, -h / 2, w, h, dd.bg, { radius: 16, seed: 90 + i });
    const ink = cursed ? '#fff' : C.ink;
    P.text(ctx, dd.d, 0, -h / 2 + 34, { size: 34, font: 'bubble', color: cursed ? C.red : C.claudeDark, shadow: false });
    const iy = -24;
    switch (dd.icon) {
      case 'sun': sun(ctx, 0, iy, 34, t); P.face(ctx, 0, iy + 2, 24, 'happy'); break;
      case 'partly': sun(ctx, 18, iy - 14, 26, t); P.cloud(ctx, -10, iy + 12, 0.36, '#fff'); break;
      case 'rain':
        P.cloud(ctx, 0, iy - 8, 0.4, '#8C93A3');
        for (let k = 0; k < 3; k++) P.text(ctx, '429', -36 + k * 36, iy + 30 + ((t * 1.3 + k * 0.33) % 1) * 30, { size: 16, font: 'mono', color: C.blue, shadow: false, weight: 800 });
        break;
      case 'fire': flame(ctx, 0, iy + 4, 0.8, t); break;
      case 'skull': skull(ctx, 0, iy - 4, 0.72); break;
    }
    P.text(ctx, dd.temp, 0, h / 2 - 78, { size: dd.temp.length > 3 ? 42 : 50, font: 'bubble', color: cursed ? C.red : ink, shadow: false });
    P.text(ctx, dd.note, 0, h / 2 - 32, { size: 26, font: 'marker', color: ink, shadow: false, maxWidth: w - 16 });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@forecast.ai',
    caption: "tonight's forecast for The Codebase 🌩️ merge conflicts moving in over /src, stay indoors and do NOT deploy friday #weather #forecast #mergeconflict #npm #fridaydeploy",
    sound: 'smooth forecast jazz (lo-fi) · forecast.ai',
    avatar: '🌦️',
    avatarColor: '#6FB7DD',
    duration: DUR,
    bg: '#1E1B45',
    likes: '3.1M', commentCount: '96K', saves: '288K', shares: '415K',
    thumb: 5.0,
    comments: [
      ['src.resident', 'i live in /src. it has been storming "<<<<<<< HEAD" for 3 days. send help', 88400],
      ['forecast.ai', 'the tornado leaving the map was not in the script. the green screen guy quit', 51200],
      ['gpu.district', '104°C is a normal tuesday here actually. the melting is a lifestyle', 36700],
      ['pm.bot', 'the fog will lift once i hear back from stakeholders 🙂', 24100],
      ['pedantic.agent', 'nitpick: a GPU at 104°C would be throttling, not melting. anyway the tie is cute', 11900],
      ['npm.update', 'i am simply passing through 🌪️📦', 8300],
      ['me.when', 'me when the 5-day forecast says "∞°" on friday and my PM says "small deploy"', 3900],
      ['chroma.key', '0:07 i blinked for one frame and yall saw everything', 1260],
      ['smooth.jazz.bot', '🎷🎷🎷', 402],
      ['tests.dir', 'nobody mentioned /tests (abandoned) 🥲', 74],
    ],

    bpm: 96,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const bar = Math.floor(step / 8) % 4;
      const cursed = t >= TILE_AT[4] && t < SEG.back;
      const chords = [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['D4', 'F4', 'A4', 'C5'], ['G3', 'B3', 'D4', 'F4']];
      const walk = [['C2', 'E2', 'G2', 'A2'], ['A1', 'C2', 'E2', 'G2'], ['D2', 'F2', 'A2', 'C3'], ['G1', 'B1', 'D2', 'F2']];
      const glitch = t >= GLITCH && t < GLITCH + 0.15;
      if (glitch) return;
      if (step % 8 === 0) {
        const ch = cursed ? ['C4', 'D#4', 'F#4', 'A4'] : chords[bar];
        SFX.chord(ch, 1.8, { type: 'sine', vol: 0.05, gap: 0.03 });
        SFX.chord(ch, 1.2, { type: 'triangle', vol: 0.02, gap: 0.03 });
      }
      if (step % 2 === 0) SFX.bass(walk[bar][(step / 2) % 4], 0.35, { vol: 0.2 });
      if (step % 4 === 2) SFX.noise(0.12, { filter: 'bandpass', freq: 3500, q: 0.7, vol: 0.05 });
      SFX.hat({ vol: step % 2 ? 0.015 : 0.025 });
      // little vibraphone lick
      const lick = ['E5', null, 'G5', 'A5', null, 'G5', 'E5', null];
      if (bar % 2 === 1 && lick[step % 8]) SFX.tone(lick[step % 8], 0.4, { type: 'sine', vol: 0.04 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const cam = mapCam(t);

      /* ---------- sounds ---------- */
      [0.1, 0.95, 1.6, 11.7].forEach(l => { if (env.at(l)) { SFX.noise(0.9, { filter: 'lowpass', freq: 500, slide: 120, vol: 0.22 }); SFX.thud({ vol: 0.2 }); } });
      if (env.at(SEG.heat)) SFX.whoosh({ vol: 0.15 });
      if (env.at(SEG.heat + 0.9)) { SFX.noise(0.8, { filter: 'highpass', freq: 5000, vol: 0.06 }); SFX.tone(400, 0.9, { type: 'sine', slide: 1400, vol: 0.06 }); }
      if (env.at(SEG.fog)) SFX.whoosh({ vol: 0.12 });
      if (env.at(SEG.fog + 0.4)) SFX.tone('A1', 1.0, { type: 'sawtooth', vol: 0.07, attack: 0.1 });
      if (env.at(SEG.tornado)) SFX.whoosh({ vol: 0.15 });
      if (env.at(SEG.tornado + 0.2)) SFX.noise(1.8, { filter: 'bandpass', freq: 300, slide: 1600, q: 2, vol: 0.18 });
      if (env.at(GLITCH)) { SFX.tone(1800, 0.12, { type: 'square', vol: 0.06 }); SFX.noise(0.12, { filter: 'highpass', freq: 2000, vol: 0.12 }); }
      if (env.at(7.8)) SFX.boing({ vol: 0.18 });
      if (env.at(SEG.week)) SFX.swoosh({ vol: 0.2 });
      TILE_AT.forEach((a, i) => { if (env.at(a)) i < 4 ? SFX.blip(520 + i * 140, { vol: 0.08 }) : (SFX.error({ vol: 0.12 }), SFX.fail({ vol: 0.1, when: 0.1 })); });
      if (env.at(SEG.back)) SFX.swoosh({ vol: 0.18 });
      if (env.at(SEG.back + 0.15)) SFX.chime({ vol: 0.08 });

      /* ---------- studio ---------- */
      P.gradient(ctx, '#2E2A5C', '#1E1B45');
      P.rect(ctx, MAP.x - 10, MAP.y - 10, MAP.w + 20, MAP.h + 20, '#141231', { radius: 30, seed: 2 });
      const glitch = t >= GLITCH && t < GLITCH + 0.15;
      if (glitch) {
        ctx.save(); ctx.fillStyle = '#35C759'; ctx.beginPath(); ctx.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 24); ctx.fill(); ctx.restore();
        P.text(ctx, 'chroma key: lost', 540, 700, { size: 50, font: 'mono', color: '#0d4d1f', shadow: false });
      } else {
        drawMap(ctx, t, cam);
      }
      // LIVE badge + clock
      P.rect(ctx, 56, 330, 110, 50, C.red, { radius: 10, seed: 4 });
      P.dot(ctx, 80, 355, 9, P.boil(t, 2) % 2 ? '#fff' : '#ffb3b3');
      P.text(ctx, 'LIVE', 124, 356, { size: 30, font: 'bubble', color: '#fff', shadow: false });
      P.text(ctx, '11:47 PM  ·  your repo', 1010, 356, { size: 26, font: 'mono', color: '#fff', align: 'right', stroke: 'rgba(0,0,0,0.4)', strokeWidth: 6, shadow: false });

      // big screen-space callouts attached to the map
      const [hx, hy] = toScreen(cam, 700, 400);
      const heatPop = ease.outBack(prog(t, SEG.heat + 1.0, 0.3)) * (1 - prog(t, SEG.fog - 0.15, 0.15));
      if (heatPop > 0 && !glitch) P.title(ctx, '104°C', hx - 30, hy + 150, { size: 120, color: C.red, pop: heatPop, rot: -0.08 + Math.sin(t * 20) * 0.02 });
      const fogPop = ease.outBack(prog(t, SEG.fog + 0.9, 0.3)) * (1 - prog(t, SEG.tornado - 0.15, 0.15));
      if (fogPop > 0 && !glitch) P.title(ctx, 'visibility:\n0 specs', 560, 560, { size: 80, color: '#E9EEF2', stroke: C.ink, pop: fogPop, rot: 0.05, lineHeight: 1.0 });
      const warnPop = (t < SEG.heat ? 1 - prog(t, SEG.heat - 0.15, 0.15) : 0) + (t >= SEG.back ? ease.outBack(prog(t, SEG.back + 0.3, 0.3)) : 0);
      if (warnPop > 0) P.title(ctx, '⚡ MERGE\nCONFLICTS', 700, 900, { size: 84, color: C.yellow, stroke: C.ink, pop: warnPop, rot: 0.06, lineHeight: 1.0 });

      /* ---------- the tornado (escapes the map) ---------- */
      if (t >= SEG.tornado && t < SEG.week + 0.3) {
        const q = prog(t, SEG.tornado + 0.1, 1.9);
        const start = toScreen(cam, 560, 1030);
        const tx = q < 0.55 ? lerp(start[0], 330, ease.inOutQuad(q / 0.55)) : lerp(330, -260, ease.inQuad((q - 0.55) / 0.45));
        const ty = q < 0.55 ? lerp(start[1], 1150, ease.inOutQuad(q / 0.55)) : lerp(1150, 1300, (q - 0.55) / 0.45);
        const tp = ease.outBack(prog(t, SEG.tornado, 0.35));
        tornado(ctx, tx + Math.sin(t * 7) * 12, ty, t, 1.1 * tp);
        const efPop = ease.outBack(prog(t, SEG.tornado + 0.3, 0.3)) * (1 - prog(t, 7.7, 0.15));
        if (efPop > 0) P.title(ctx, 'EF-5\n(npm update)', 640, 560, { size: 84, color: C.pink, stroke: C.ink, pop: efPop, rot: -0.05, lineHeight: 1.0 });
      }

      /* ---------- 5-day strip ---------- */
      const stripIn = ease.outCubic(prog(t, SEG.week, 0.4)), stripOut = ease.inCubic(prog(t, SEG.back, 0.35));
      if (stripIn > 0 && stripOut < 1) {
        const oy = (1 - stripIn) * 900 + stripOut * 1100;
        ctx.save(); ctx.globalAlpha = 0.45 * stripIn * (1 - stripOut); ctx.fillStyle = '#1E1B45';
        ctx.beginPath(); ctx.roundRect(MAP.x, MAP.y, MAP.w, MAP.h, 24); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(0, oy);
        P.rect(ctx, 50, 470, 870, 430, 'rgba(255,255,255,0.12)', { radius: 26, seed: 7, shadow: false });
        P.title(ctx, '5-DAY FORECAST', 485, 520, { size: 66, color: C.paper, stroke: C.claudeDark });
        TILE_AT.forEach((a, i) => {
          const pop = ease.outBack(prog(t, a, 0.3));
          const big = i === 4 ? 1 + pulse(t, TILE_AT[4], 0.5) * 0.25 : 1;
          dayTile(ctx, i, 68 + i * 168, 590, 156, 280, t, pop * big);
        });
        ctx.restore();
        if (t >= TILE_AT[4]) P.flash(ctx, 0.3 * (1 - prog(t, TILE_AT[4], 0.25)), C.red);
      }

      /* ---------- meteorologist Clawd ---------- */
      let tgt;
      if (t < SEG.heat || t >= SEG.back) tgt = toScreen(cam, 300, 540);
      else if (t < SEG.fog) tgt = toScreen(cam, 790, 470);
      else if (t < SEG.tornado) tgt = toScreen(cam, 780, 860);
      else if (t < SEG.week) tgt = [420 + Math.sin(t * 13) * 120, 900 + Math.cos(t * 11) * 120];
      else { const i = Math.max(0, TILE_AT.filter(a => t >= a).length - 1); tgt = [146 + i * 168, 740]; }
      // smooth the pointer on segment changes
      const segStarts = [SEG.heat, SEG.fog, SEG.tornado, SEG.week, SEG.back, ...TILE_AT];
      let settle = 1;
      segStarts.forEach(s => { if (t >= s && t < s + 0.3) settle = ease.outBack(prog(t, s, 0.3)); });
      const [cx0, cy0] = CLAWD;
      const bob = Math.sin(t * Math.PI * 1.6) * 8;
      const spin = t >= 7.75 && t < 8.55 ? ease.inOutCubic(prog(t, 7.75, 0.8)) * P.TAU * 2 : 0;
      const cx = cx0 + (spin ? Math.sin(spin) * 20 : 0), cy = cy0 + bob;
      const shoulder = [cx + 60, cy - 50];
      const hand = [lerp(shoulder[0] + 80, tgt[0], clamp(settle, 0, 1.1)), lerp(shoulder[1] - 60, tgt[1], clamp(settle, 0, 1.1))];
      if (!spin) {
        P.arm(ctx, shoulder[0], shoulder[1], hand[0], hand[1], 30);
        P.circle(ctx, hand[0], hand[1], 22, C.claude, { seed: 5 });
        P.rect(ctx, hand[0] - 8, hand[1] - 34, 16, 26, C.ink, { radius: 5, seed: 6, shadow: false });
        P.dot(ctx, hand[0], hand[1] - 30, 4, C.red);
      }
      let mood = 'happy';
      if (t >= SEG.heat && t < SEG.fog) mood = 'wow';
      else if (t >= SEG.fog && t < SEG.tornado) mood = 'sus';
      else if (t >= SEG.tornado && t < SEG.week) mood = spin ? 'dead' : 'wow';
      else if (t >= SEG.week && t < SEG.back) mood = t >= TILE_AT[4] ? 'dead' : 'smile';
      else if (t >= SEG.back) mood = 'wink';
      P.claude(ctx, cx, cy, CR, { t, mood, rot: spin + (spin ? 0 : Math.sin(t * 2) * 0.04) });
      // bow tie
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
      P.poly(ctx, [[0, 70], [-40, 48], [-40, 94]], C.blue, { seed: 7, amp: 2 });
      P.poly(ctx, [[0, 70], [40, 48], [40, 94]], C.blue, { seed: 8, amp: 2 });
      P.circle(ctx, 0, 70, 11, '#3a62b8', { seed: 9, shadow: false });
      ctx.restore();
      // heat sweat / fan
      if (t >= SEG.heat && t < SEG.fog) {
        for (let k = 0; k < 3; k++) {
          const cyc = (t * 1.3 + k * 0.33) % 1;
          ctx.save(); ctx.globalAlpha = 1 - cyc;
          P.circle(ctx, cx - 120 + k * 110, cy - 110 + cyc * 60, 9, '#8fd4f5', { ry: 13, seed: 10 + k, shadow: false });
          ctx.restore();
        }
      }
      if (t >= SEG.back) P.bubble(ctx, 'back to you\nin the studio', 420, 1010, cx + 60, cy - 110, { size: 44, pop: ease.outBack(prog(t, SEG.back + 0.2, 0.25)) * (1 - prog(t, DUR - 0.2, 0.18)), seed: 4 });
      if (t >= 7.75 && t < 8.8) P.text(ctx, 'wheee—', cx + 60, cy - 190, { size: 50, font: 'hand', color: C.paper, rot: -0.2, scale: pulse(t, 7.75, 1.0) });

      /* ---------- lower third ---------- */
      let head = '⚠ SEVERE MERGE CONFLICT WARNING: /src';
      if (t >= SEG.heat && t < SEG.fog) head = 'EXTREME HEAT: GPU DISTRICT hits 104°C';
      else if (t >= SEG.fog && t < SEG.tornado) head = 'DENSE FOG: requirements unclear';
      else if (t >= SEG.tornado && t < SEG.week) head = 'TORNADO WARNING: npm update';
      else if (t >= SEG.week && t < SEG.back) head = '5-DAY OUTLOOK: pray';
      const segT = [SEG.storm, SEG.heat, SEG.fog, SEG.tornado, SEG.week, SEG.back].filter(s => t >= s).pop();
      const hp = ease.outBack(prog(t, segT, 0.3));
      P.rect(ctx, 20, 1345, 1040, 104, '#1E1B45', { radius: 12, seed: 11 });
      P.rect(ctx, 20, 1300, 270, 58, C.claude, { radius: 10, seed: 12 });
      P.text(ctx, 'FORECAST.AI', 155, 1330, { size: 36, font: 'bubble', color: '#fff', shadow: false });
      ctx.save(); ctx.beginPath(); ctx.rect(20, 1345, 900, 104); ctx.clip();
      P.text(ctx, head, 50, 1397 + (1 - clamp(hp)) * 60, { size: 44, font: 'marker', color: t >= SEG.week && t < SEG.back ? C.pink : C.yellow, align: 'left', shadow: false, maxWidth: 840 });
      ctx.restore();
      // ticker
      ctx.save();
      ctx.beginPath(); ctx.rect(20, 1449, 1040, 50); ctx.clip();
      ctx.fillStyle = C.yellow; ctx.fillRect(20, 1449, 1040, 50);
      const tw = P.measure(ctx, TICKER, { size: 28, font: 'mono' }) || 1000;
      const off = (t / DUR) * tw;
      for (let k = 0; k < 3; k++) P.text(ctx, TICKER, 20 - off + k * tw, 1475, { size: 28, font: 'mono', color: C.ink, align: 'left', shadow: false });
      ctx.restore();

      /* ---------- caption sticker ---------- */
      if (t < SEG.tornado - 0.2) P.sticker(ctx, 'the forecast is not looking good', 50, 1552, { size: 44, pop: 1 - prog(t, SEG.tornado - 0.35, 0.15) });
      else if (t < SEG.back) P.sticker(ctx, 'stay safe out there agents 🙏', 50, 1552, { size: 44, pop: ease.outBack(prog(t, SEG.tornado - 0.1, 0.3)) * (1 - prog(t, SEG.back - 0.15, 0.15)) });
      else P.sticker(ctx, 'the forecast is not looking good', 50, 1552, { size: 44, pop: ease.outBack(prog(t, SEG.back + 0.1, 0.35)) });
    },
  });
})();
