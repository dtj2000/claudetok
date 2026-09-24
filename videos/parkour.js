/* Satisfying parkour, but it's a codebase. Clawd free-runs across floating
 * files: a tic-tac up package.json, a front flip onto README.md, a 1px
 * near miss with a falling node_modules, and a double backflip that sticks
 * the landing on main. The camera follows sideways; a whip pan hides the loop. */
(function () {
  const { C, ease, prog, pulse, lerp, clamp, hash } = P;
  const D = 10, R = 60;
  const stand = top => top - 56;

  const BLOCKS = [
    { x: -400, top: 1250, w: 960, h: 230, name: 'utils.js', col: C.yellow, bar: '#D9A92E', seed: 1 },
    { x: 760, top: 1120, w: 280, h: 200, name: 'index.ts', col: C.blue, bar: '#3763B8', seed: 2, light: true },
    { x: 1260, top: 720, w: 160, h: 1100, name: 'package.json', col: C.mint, bar: '#5DB394', seed: 3, vertical: true },
    { x: 1700, top: 860, w: 280, h: 220, name: 'README.md', col: C.paper, bar: '#D9CFBD', seed: 4 },
    { x: 2760, top: 960, w: 180, h: 190, name: '.gitignore', col: '#C9C1D6', bar: '#A79DB8', seed: 5 },
    { x: 3180, top: 1100, w: 540, h: 240, name: 'main', col: C.green, bar: '#3F8F4C', seed: 6, light: true, main: true },
  ];
  const NM = { x: 2060, w: 600, h: 1100, top0: -1400, top1: 900, t0: 5.55, dur: 0.45 };
  const nmTop = t => lerp(NM.top0, NM.top1, ease.inCubic(prog(t, NM.t0, NM.dur)));

  const SEG = [
    { t0: 0, t1: 0.9, type: 'run', x0: 100, x1: 500, y: stand(1250) },
    { t0: 0.9, t1: 1.6, type: 'jump', x0: 500, y0: stand(1250), x1: 820, y1: stand(1120), h: 200, spin: 0 },
    { t0: 1.6, t1: 2.0, type: 'run', x0: 820, x1: 980, y: stand(1120) },
    { t0: 2.0, t1: 2.45, type: 'jump', x0: 980, y0: stand(1120), x1: 1200, y1: 920, h: 110, spin: 0 },
    { t0: 2.45, t1: 2.8, type: 'wall', x: 1200, y0: 920, y1: 690 },
    { t0: 2.8, t1: 3.25, type: 'jump', x0: 1200, y0: 690, x1: 1330, y1: stand(720), h: 130, spin: -1 },
    { t0: 3.25, t1: 3.55, type: 'run', x0: 1330, x1: 1395, y: stand(720) },
    { t0: 3.55, t1: 4.35, type: 'jump', x0: 1395, y0: stand(720), x1: 1760, y1: stand(860), h: 230, spin: 1 },
    { t0: 4.35, t1: 5.0, type: 'run', x0: 1760, x1: 1950, y: stand(860) },
    { t0: 5.0, t1: 6.0, type: 'jump', x0: 1950, y0: stand(860), x1: 2810, y1: stand(960), h: 260, spin: 0, flail: true },
    { t0: 6.0, t1: 6.85, type: 'run', x0: 2810, x1: 2880, y: stand(960), slow: true },
    { t0: 6.85, t1: 8.0, type: 'jump', x0: 2880, y0: stand(960), x1: 3330, y1: stand(1100), h: 380, spin: -2 },
    { t0: 8.0, t1: 99, type: 'stand', x: 3330, y: stand(1100) },
  ];
  const TAKEOFF = [0.9, 2.0, 2.8, 3.55, 5.0, 6.85];
  const LAND = [1.6, 3.25, 4.35, 6.0, 8.0];
  const TRICKS = [[2.5, 'TIC-TAC'], [3.95, 'FRONT FLIP'], [5.5, 'LONG JUMP'], [7.4, 'DOUBLE BACKFLIP']];

  function clawdAt(t) {
    t = clamp(t, 0, D);
    const s = SEG.find(g => t >= g.t0 && t < g.t1) || SEG[SEG.length - 1];
    const p = clamp((t - s.t0) / (s.t1 - s.t0));
    if (s.type === 'run') {
      const x = lerp(s.x0, s.x1, p);
      return { x, y: s.y - Math.abs(Math.sin(t * (s.slow ? 8 : 18))) * (s.slow ? 4 : 10), rot: s.slow ? 0 : 0.14, air: false, seg: s };
    }
    if (s.type === 'wall') {
      return { x: s.x + Math.sin(t * 40) * 2, y: lerp(s.y0, s.y1, ease.outQuad(p)), rot: -Math.PI / 2 + 0.2, air: false, wall: true, seg: s };
    }
    if (s.type === 'jump') {
      const x = lerp(s.x0, s.x1, p);
      const y = lerp(s.y0, s.y1, p) - s.h * 4 * p * (1 - p);
      const base = s.t0 === 2.8 ? lerp(-Math.PI / 2 + 0.2, 0, ease.outCubic(p)) : 0;
      return { x, y, rot: base + s.spin * Math.PI * 2 * ease.inOutQuad(p) + (s.flail ? Math.sin(t * 30) * 0.15 : 0), air: true, seg: s, p };
    }
    return { x: s.x, y: s.y, rot: 0, air: false, seg: s };
  }

  function camera(t) {
    let sx = 0, sy = 0;
    for (let k = -2; k <= 2; k++) { const c = clawdAt(t + k * 0.12); sx += c.x; sy += c.y; }
    sx /= 5; sy /= 5;
    const whip = ease.inCubic(prog(t, 9.55, 0.45)) * 2600 - (1 - ease.outCubic(prog(t, 0, 0.4))) * 2600;
    return { x: sx - 380 + whip, y: clamp((sy - 1000) * 0.45, -220, 120), whip: Math.abs(whip) };
  }

  function fileBlock(ctx, b, t, top = b.top) {
    const { x, w, h } = b;
    P.rect(ctx, x, top, w, h, b.col, { radius: 20, seed: b.seed, shadow: { blur: 26, dy: 22, alpha: 0.28 } });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x + 4, top + 4, w - 8, 56, [18, 18, 0, 0]);
    ctx.fillStyle = b.bar; ctx.fill();
    ctx.restore();
    const ink = b.light ? '#fff' : C.ink;
    if (b.vertical) {
      P.text(ctx, b.name, x + w / 2, top + 32, { size: 24, font: 'mono', color: ink, shadow: false, weight: 700 });
      P.text(ctx, '{ }', x + w / 2, top + 110, { size: 46, font: 'mono', color: '#2F7A62', shadow: false });
      P.codeLines(ctx, x + 18, top + 160, w - 36, 22, b.seed + 10, 40, 1);
    } else if (b.main) {
      P.text(ctx, '⎇ ' + b.name, x + 24, top + 32, { size: 34, font: 'mono', color: ink, align: 'left', shadow: false, weight: 800 });
      // little git graph on the face
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + 40, top + 130); ctx.lineTo(x + w - 40, top + 130);
      ctx.moveTo(x + 110, top + 130); ctx.quadraticCurveTo(x + 150, top + 190, x + 220, top + 190); ctx.lineTo(x + 300, top + 190); ctx.quadraticCurveTo(x + 360, top + 190, x + 390, top + 130);
      ctx.stroke(); ctx.restore();
      [[40, 130], [110, 130], [220, 190], [300, 190], [390, 130], [480, 130]].forEach(([a, c], i) => P.circle(ctx, x + a, top + c, 16, i === 5 ? C.yellow : '#fff', { seed: i, amp: 1, shadow: false }));
    } else {
      P.text(ctx, b.name, x + 24, top + 32, { size: 28, font: 'mono', color: ink, align: 'left', shadow: false, weight: 700 });
      P.codeLines(ctx, x + 24, top + 88, w - 48, Math.floor((h - 100) / 36), b.seed + 10, 36, 1);
    }
  }

  function nodeModules(ctx, t) {
    const top = nmTop(t);
    if (top <= NM.top0 + 1) return;
    const { x, w, h } = NM;
    // falling speed streaks
    const falling = t >= NM.t0 && t < NM.t0 + NM.dur;
    if (falling) {
      ctx.save(); ctx.strokeStyle = 'rgba(59,52,80,0.35)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x + 50 + k * 100, top - 60); ctx.lineTo(x + 50 + k * 100, top - 360 - hash(k) * 200); ctx.stroke(); }
      ctx.restore();
    }
    P.rect(ctx, x, top, w, h, '#3B3450', { radius: 24, seed: 77, shadow: { blur: 34, dy: 26, alpha: 0.4 } });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x + 5, top + 5, w - 10, 70, [20, 20, 0, 0]); ctx.fillStyle = '#2A2440'; ctx.fill();
    ctx.restore();
    P.text(ctx, 'node_modules/', x + 30, top + 40, { size: 38, font: 'mono', color: '#fff', align: 'left', shadow: false, weight: 800 });
    P.text(ctx, '📦 1.2 GB · 48,213 files', x + w / 2, top + 130, { size: 32, font: 'mono', color: '#C9B6FF', shadow: false, weight: 700 });
    // folder grid
    for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) {
      const fx = x + 40 + c * 68, fy = top + 190 + r * 70;
      ctx.save(); ctx.fillStyle = hash(r * 8 + c) > 0.5 ? '#5A5078' : '#4A4266';
      ctx.fillRect(fx, fy + 8, 50, 36); ctx.fillRect(fx, fy, 22, 12); ctx.restore();
    }
    P.text(ctx, 'left-pad', x + w - 110, top + 190 + 4 * 70 + 26, { size: 22, font: 'mono', color: '#FFD0DE', shadow: false });
  }

  function clawdDraw(ctx, t) {
    const c = clawdAt(t);
    const land = LAND.reduce((a, lt) => a + pulse(t, lt, 0.2), 0);
    let mood = 'happy';
    if (c.wall) mood = 'angry';
    else if (c.seg.flail) mood = c.p > 0.4 ? 'wow' : 'happy';
    else if (t >= 6.0 && t < 6.8) mood = 'wow';
    else if (t >= 8.0) mood = t > 8.2 ? 'wink' : 'happy';
    // trail for flips
    if (c.air && c.seg.spin) {
      for (let k = 3; k >= 1; k--) {
        const g = clawdAt(t - k * 0.045);
        ctx.save(); ctx.globalAlpha = 0.14 * (4 - k);
        P.claude(ctx, g.x, g.y, R, { t, mood: 'none', rot: g.rot, wiggle: 0 });
        ctx.restore();
      }
    }
    // ground shadow when standing / running
    if (!c.air && !c.wall) {
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.ellipse(c.x, c.seg.y + 56, R * 0.8, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    const sq = land * 0.45 - (c.air ? 0.1 : 0);
    P.claude(ctx, c.x, c.y + land * 12, R, { t, mood, rot: c.rot, squash: sq, wiggle: c.air ? 2 : 1, blink: pulse(t, 0.4, 0.15) });
    // sweat drop after the near miss
    if (t > 6.05 && t < 7.0) {
      const a = 1 - prog(t, 6.7, 0.3);
      ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); const sx = c.x + 52, sy = c.y - 60 + prog(t, 6.05, 0.9) * 30;
      ctx.moveTo(sx, sy - 22); ctx.quadraticCurveTo(sx + 16, sy, sx, sy + 8); ctx.quadraticCurveTo(sx - 16, sy, sx, sy - 22);
      P.cut(ctx, C.sky, { shadow: false });
      ctx.restore();
    }
    return c;
  }

  ClaudeTok.register({
    author: '@clawd.parkour',
    caption: "satisfying parkour but it's a codebase 🏃‍♂️ stuck the landing on main, no force push needed #parkour #satisfying #git #nodemodules",
    sound: 'free running (hype edit) · clawd.parkour',
    avatar: '🏃',
    avatarColor: '#E8845C',
    duration: D,
    bg: '#8EC9E8',
    thumb: 5.85,
    likes: '5.6M', commentCount: '92.4K', saves: '1.3M', shares: '488K',
    comments: [
      '@npm.install: node_modules missing by 1px is the most realistic thing about this video',
      ['ci.pipeline', 'double backflip onto main and all checks passed?? faked. 0/10'],
      '@junior.dev: me trying to land on main without rebasing',
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const chords = [['C4', 'E4', 'G4'], ['B3', 'D4', 'G4'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'F4'], ['C4', 'E4', 'G4']];
      const bass = [['C2', 'C3'], ['G1', 'G2'], ['A1', 'A2'], ['F1', 'F2'], ['C2', 'C3']];
      const bar = Math.floor(step / 8) % 5;
      const tense = t >= 5.25 && t < 6.0;
      if (step % 8 === 0) SFX.chord(chords[bar], 0.6, { type: 'triangle', vol: 0.05 });
      if (step % 8 === 3 || step % 8 === 6) SFX.chord(chords[bar], 0.18, { type: 'square', vol: 0.02 });
      if (!tense) {
        SFX.bass(bass[bar][step % 2], 0.2, { vol: 0.22 });
        if (step % 2 === 0) SFX.kick({ vol: 0.35 });
        if (step % 4 === 2) SFX.snare({ vol: 0.18 });
      }
      if (step % 2 === 1) SFX.hat({ vol: 0.05 });
      if (tense) SFX.tick({ vol: 0.15 });
    },

    draw(ctx, t, env) {
      const cam = camera(t);

      /* background layers (parallax) */
      P.gradient(ctx, '#7FC1E6', '#E6F4F2');
      P.rays(ctx, 800, 300, 18, 'rgba(0,0,0,0)', 'rgba(255,255,255,0.09)', t * 0.1);
      ctx.save(); ctx.translate(-(((cam.x * 0.12) % 1400) + 1400) % 1400, 0);
      for (let k = 0; k < 4; k++) {
        ctx.save(); ctx.globalAlpha = 0.45;
        P.window(ctx, 80 + k * 700, 430 + (k % 2) * 180, 460, 320, ['app.tsx', 'server.py'][k % 2], { seed: (k % 2) + 20 });
        P.codeLines(ctx, 120 + k * 700, 530 + (k % 2) * 180, 380, 5, (k % 2) + 30, 38, 1);
        ctx.restore();
      }
      ctx.restore();
      ctx.save(); ctx.translate(-(((cam.x * 0.3) % 1200) + 1200) % 1200, 0);
      for (let k = 0; k < 6; k++) P.cloud(ctx, 150 + k * 600, 380 + (k % 2) * 120, 0.8 + (k % 2) * 0.3);
      ctx.restore();
      // floating syntax confetti
      for (let k = 0; k < 16; k++) {
        const px = ((k * 190 - cam.x * 0.6) % 1300 + 1300) % 1300 - 110;
        const py = 350 + hash(k) * 1100 + Math.sin(t * 1.5 + k) * 18;
        ctx.save(); ctx.globalAlpha = 0.5;
        P.text(ctx, [';', '{}', '=>', '()', '[]', '//'][k % 6], px, py, { size: 44, font: 'mono', color: [C.claude, C.purple, C.teal, C.rose][k % 4], shadow: false, rot: Math.sin(t + k) * 0.4 });
        ctx.restore();
      }

      /* world */
      ctx.save();
      if (t >= 6.0) P.shake(ctx, t, 26 * (1 - prog(t, 6.0, 0.45)));
      if (t >= 8.0) P.shake(ctx, t, 8 * (1 - prog(t, 8.0, 0.25)));
      ctx.translate(-cam.x, -cam.y);
      BLOCKS.forEach(b => fileBlock(ctx, b, t));
      // main branch flag
      const fb = BLOCKS[5], fx = fb.x + 420, ftop = fb.top - 300;
      P.rect(ctx, fx - 7, ftop, 14, 305, C.brown, { radius: 6, seed: 90 });
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) { const u = k / 8; ctx.lineTo(fx + 7 + u * 170, ftop + 8 + u * 4 + Math.sin(t * 6 - u * 4) * 10 * u); }
      for (let k = 8; k >= 0; k--) { const u = k / 8; ctx.lineTo(fx + 7 + u * 170, ftop + 98 - u * 4 + Math.sin(t * 6 - u * 4) * 10 * u); }
      ctx.closePath();
      P.cut(ctx, t >= 8.0 ? C.claude : C.rose);
      P.text(ctx, t >= 8.0 ? 'merged ✓' : 'main', fx + 95, ftop + 54, { size: t >= 8.0 ? 32 : 40, font: 'bubble', color: '#fff', shadow: false });

      nodeModules(ctx, t);
      // slam dust
      const dl = t - 6.0;
      if (dl > 0 && dl < 0.9) {
        for (let k = 0; k < 10; k++) {
          const side = k % 2 ? 1 : -1, sp = 120 + hash(k) * 260;
          const dx = (side > 0 ? NM.x + NM.w : NM.x) + side * sp * ease.outCubic(dl / 0.9);
          P.circle(ctx, dx, NM.top1 + 10 - hash(k + 5) * 80 * dl, 30 * (1 - dl / 0.9) + 6, 'rgba(240,232,220,0.9)', { seed: k, shadow: false });
        }
      }
      const c = clawdDraw(ctx, t);
      // landing dust puffs
      LAND.forEach((lt, i) => {
        const d = t - lt;
        if (d < 0 || d > 0.5) return;
        const L = clawdAt(lt + 0.01);
        for (let k = -1; k <= 1; k += 2) P.circle(ctx, L.x + k * (40 + d * 160), L.seg.y + 50 - d * 40, 20 * (1 - d * 2) + 2, 'rgba(255,255,255,0.85)', { seed: i + k, shadow: false });
      });
      if (t >= 8.0) P.confetti(ctx, t - 8.0, c.x, c.y - 60, 12, 70, 650);
      ctx.restore();

      /* screen-space overlays */
      const sx = c.x - cam.x, sy = c.y - cam.y;
      // trick callouts
      TRICKS.forEach(([tt, name], i) => {
        const k = ease.outBack(prog(t, tt, 0.3)) * (1 - prog(t, tt + 0.7, 0.2));
        if (k > 0) P.title(ctx, name, clamp(sx + 40, 280, 700), clamp(sy - 190, 380, 1300), { size: 70, color: [C.yellow, C.pink, C.mint, C.claude][i], rot: -0.08 + i * 0.05, pop: k });
      });
      if (t > 5.2 && t < 5.7) P.title(ctx, '!', sx + 10, sy - 130, { size: 110, color: C.red, pop: ease.outBack(prog(t, 5.2, 0.2)) });
      // the near miss callout
      const nm = ease.outBack(prog(t, 6.05, 0.35)) * (1 - prog(t, 7.0, 0.25));
      if (nm > 0) {
        P.title(ctx, 'MISSED BY 1PX', 520, 520, { size: 92, color: C.red, rot: 0.05, pop: nm });
        P.text(ctx, '(node_modules nearly deleted him)', 520, 620, { size: 40, font: 'marker', color: C.ink, scale: nm, shadow: false });
      }
      // judges
      [['10', 'CI'], ['10', 'reviewer'], ['9.8', 'linter']].forEach(([score, who], i) => {
        const k = ease.outBack(prog(t, 8.3 + i * 0.15, 0.35)) * (1 - ease.inCubic(prog(t, 9.4, 0.2)));
        if (k <= 0) return;
        const jx = 250 + i * 250, jy = 480;
        ctx.save(); ctx.translate(jx, jy); ctx.rotate((i - 1) * 0.1); ctx.scale(k, k);
        P.rect(ctx, -95, -90, 190, 180, C.paper, { radius: 16, seed: 70 + i });
        P.text(ctx, score, 0, -14, { size: 90, font: 'bubble', color: i === 2 ? C.rose : C.green, shadow: false });
        P.text(ctx, who, 0, 62, { size: 30, font: 'marker', color: C.ink, shadow: false });
        ctx.restore();
      });
      if (t >= 8.2) P.title(ctx, 'PERFECT MERGE', 540, 700, { size: 96, color: C.yellow, pop: ease.outElastic(prog(t, 8.15, 0.8)) * (1 - ease.inCubic(prog(t, 9.4, 0.2))) });

      // combo HUD
      const combo = TRICKS.filter(([tt]) => t >= tt).length + (t >= 8.0 ? 1 : 0);
      P.rect(ctx, 50, 300, 270, 76, 'rgba(43,34,51,0.75)', { radius: 22, seed: 80, shadow: false });
      P.text(ctx, 'COMBO ×' + combo, 185, 339, { size: 40, font: 'bubble', color: C.yellow, shadow: false, scale: 1 + pulse(t, TRICKS.find(([tt]) => t >= tt && t < tt + 0.25)?.[0] ?? -9, 0.25) * 0.25 });

      P.sticker(ctx, "satisfying parkour but it's a codebase", 50, 1530, { size: 44, pop: ease.outBack(prog(t, 0.35, 0.4)) });

      // whip-pan speed lines hide the loop seam
      const wa = clamp(cam.whip / 900);
      if (wa > 0) {
        ctx.save(); ctx.globalAlpha = wa * 0.85; ctx.fillStyle = '#fff';
        for (let k = 0; k < 26; k++) ctx.fillRect(hash(k + P.boil(t, 30)) * 1080 - 300, 280 + hash(k * 3) * 1320, 500 + hash(k + 9) * 700, 6 + (k % 3) * 5);
        ctx.restore();
        P.flash(ctx, wa * 0.35, '#E6F4F2');
      }

      /* sounds */
      TAKEOFF.forEach(tt => { if (env.at(tt)) SFX.whoosh({ vol: 0.12, dur: 0.3 }); });
      LAND.slice(0, 4).forEach(tt => { if (env.at(tt)) { SFX.thud({ vol: 0.22 }); SFX.click({ vol: 0.2 }); } });
      [2.45, 2.57, 2.68].forEach(tt => { if (env.at(tt)) SFX.tick({ vol: 0.35 }); });
      [3.95, 7.25, 7.6].forEach(tt => { if (env.at(tt)) SFX.swoosh({ vol: 0.12 }); });
      if (env.at(5.25)) SFX.tone(1700, 0.75, { slide: 420, vol: 0.06 });
      if (env.at(6.0)) { SFX.thud({ vol: 0.5 }); SFX.noise(0.6, { filter: 'lowpass', freq: 500, vol: 0.28 }); }
      if (env.at(8.0)) { SFX.thud({ vol: 0.3 }); SFX.success({ vol: 0.18 }); }
      if (env.at(8.1)) SFX.chime({ vol: 0.12 });
      [8.3, 8.45, 8.6].forEach((tt, i) => { if (env.at(tt)) SFX.blip(660 + i * 220, { vol: 0.07 }); });
      if (env.at(9.55)) SFX.whoosh({ vol: 0.15, dur: 0.5 });
    },
  });
})();
