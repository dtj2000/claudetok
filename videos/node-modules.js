/* The heaviest object in the universe: node_modules. A black hole eats
 * planets, a laptop, a mug, and finally Clawd. Then: npm install. */
(function () {
  const D = 11;
  const TAU = Math.PI * 2;
  const CX = 540, CY = 960, TILT = 0.42;

  /* spiral an object from (sx,sy) into the hole over [t0,t1] of story time */
  function suck(ctx, st, t0, t1, sx, sy, turns, drawFn, stretch = 1) {
    const p = (st - t0) / (t1 - t0);
    if (p < 0 || p >= 1) return;
    const e = P.ease.inQuad(p);
    const dx = sx - CX, dy = (sy - CY) / TILT;
    const r0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
    const r = r0 * (1 - e), a = a0 + turns * TAU * e;
    const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r * TILT;
    const sc = P.lerp(1, 0.06, P.ease.inCubic(p));
    const radA = Math.atan2(CY - y, CX - x);
    ctx.save();
    ctx.globalAlpha = P.clamp((1 - p) * 6);
    ctx.translate(x, y); ctx.rotate(radA);
    ctx.scale(sc * (1 + e * 1.6 * stretch), sc * Math.max(0.15, 1 - e * 0.55 * stretch));
    ctx.rotate(-radA + e * 4 * turns);
    drawFn(ctx, e);
    ctx.restore();
  }

  const saturn = (ctx) => {
    ctx.save(); ctx.rotate(-0.3);
    ctx.strokeStyle = '#F6EEDD'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.ellipse(0, 0, 120, 30, 0, Math.PI, TAU); ctx.stroke();
    P.circle(ctx, 0, 0, 70, P.C.pink, { seed: 3 });
    P.circle(ctx, -18, -20, 20, '#F7CBD6', { shadow: false, seed: 4 });
    ctx.beginPath(); ctx.ellipse(0, 0, 120, 30, 0, 0, Math.PI); ctx.stroke();
    ctx.restore();
    P.face(ctx, 0, 6, 60, 'wow');
  };
  const earth = (ctx) => {
    P.circle(ctx, 0, 0, 62, P.C.blue, { seed: 5 });
    P.circle(ctx, -20, -18, 24, P.C.green, { seed: 6, shadow: false, ry: 16 });
    P.circle(ctx, 26, 20, 18, P.C.green, { seed: 7, shadow: false });
    P.face(ctx, 0, 4, 52, 'sad');
  };
  const laptop = (ctx) => {
    P.rect(ctx, -85, -120, 170, 115, '#C9CCD6', { radius: 12, seed: 8 });
    P.rect(ctx, -74, -110, 148, 95, '#2B2A4A', { radius: 8, seed: 9, shadow: false });
    P.claude(ctx, 0, -62, 26, { mood: 'wow', wiggle: 0 });
    P.rect(ctx, -105, -8, 210, 20, '#A9ADBA', { radius: 8, seed: 10 });
  };
  const mug = (ctx) => {
    ctx.save(); ctx.strokeStyle = '#F6EEDD'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(48, 0, 26, -1.3, 1.3); ctx.stroke(); ctx.restore();
    P.rect(ctx, -46, -52, 92, 104, '#F6EEDD', { radius: 12, seed: 11 });
    P.rect(ctx, -40, -46, 80, 14, '#6E4630', { radius: 6, seed: 12, shadow: false });
    P.text(ctx, 'I ❤\nJS', 0, 12, { size: 26, font: 'bubble', color: P.C.rose, shadow: false });
  };
  const box = (label) => (ctx) => {
    P.rect(ctx, -52, -36, 104, 72, '#C9975F', { radius: 6, seed: label.length });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-8, -36, 16, 72); ctx.restore();
    P.rect(ctx, -44, 6, 88, 22, '#F6EEDD', { radius: 4, seed: 2, shadow: false });
    P.text(ctx, label, 0, 18, { size: 16, font: 'mono', color: P.C.ink, shadow: false, maxWidth: 84 });
  };
  const BOXES = ['left-pad', 'is-odd', 'is-even', 'lodash', 'is-number', 'chalk', 'colors', 'is-array'];

  function rankCard(ctx, st) {
    const { C, ease, prog } = P;
    P.rect(ctx, -205, -130, 410, 260, C.paper, { radius: 18, seed: 20 });
    P.text(ctx, 'heaviest objects:', -180, -92, { size: 36, font: 'marker', align: 'left', color: C.ink, shadow: false });
    [['☀️ the sun', 0.5], ['✨ neutron star', 0.9], ['🕳️ black hole', 1.3]].forEach(([s, ct], i) => {
      const y = -38 + i * 52;
      P.text(ctx, s, -180, y, { size: 36, font: 'marker', align: 'left', color: st >= ct ? '#9a8f9f' : C.ink, shadow: false });
      const k = ease.outCubic(prog(st, ct, 0.2));
      if (k > 0) {
        ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-185, y + 2); ctx.lineTo(-185 + 290 * k, y - 4); ctx.stroke(); ctx.restore();
      }
    });
    const sp = ease.outBack(prog(st, 1.8, 0.35));
    if (sp > 0) {
      ctx.save(); ctx.translate(120, 90); ctx.rotate(-0.18); ctx.scale(sp, sp);
      P.rect(ctx, -110, -30, 220, 60, C.red, { radius: 10, seed: 21 });
      P.text(ctx, '#1 ⬇ see below', 0, 2, { size: 30, font: 'bubble', color: '#fff', shadow: false });
      ctx.restore();
    }
  }

  function scene(ctx, t, st, env) {
    const { C, ease, prog, pulse, lerp, clamp } = P;

    // space
    const g = ctx.createRadialGradient(CX, CY, 100, CX, CY, 1300);
    g.addColorStop(0, '#2A1E5A'); g.addColorStop(1, '#0B0A1C');
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(-80, -80, 1240, 2080); ctx.restore();
    P.stars(ctx, t, 11, 40, '#FFF1B8', [0, 0, 1080, 1920]);
    // stars streaking inward (integer cycles per loop)
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 36; i++) {
      const a = P.hash(i) * TAU, k = 1 + (i % 3);
      const ph = ((t / D) * k + P.hash(i + 50)) % 1;
      const r = lerp(1100, 190, ph * ph);
      const x = CX + Math.cos(a + ph * 1.2) * r, y = CY + Math.sin(a + ph * 1.2) * r * 0.8;
      ctx.strokeStyle = `rgba(255,240,200,${0.15 + ph * 0.5})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (CX - x) * 0.05, y + (CY - y) * 0.05); ctx.stroke();
    }
    ctx.restore();

    // glow
    const gl = ctx.createRadialGradient(CX, CY, 150, CX, CY, 560);
    gl.addColorStop(0, 'rgba(255,170,90,0.45)'); gl.addColorStop(1, 'rgba(255,120,90,0)');
    ctx.save(); ctx.fillStyle = gl; ctx.fillRect(-80, 300, 1240, 1300); ctx.restore();

    const cols = ['#FFF4C8', C.yellow, '#FFD27A', C.mustard, C.claude, '#F29A6B', C.rose, '#E27B9E', '#B26BB0', C.purple];
    const ring = (half) => {
      ctx.save(); ctx.lineCap = 'round';
      for (let k = 9; k >= 0; k--) {
        const r = 230 + k * 25, len = 60 + (k % 3) * 34, gap = 22 + (k % 4) * 14;
        ctx.strokeStyle = cols[k]; ctx.lineWidth = 15;
        ctx.setLineDash([len, gap]);
        ctx.lineDashOffset = -(t / D) * (14 - k) * (len + gap) * 3;
        ctx.beginPath(); ctx.ellipse(CX, CY, r, r * 0.3, -0.12, half ? 0 : Math.PI, half ? Math.PI : TAU); ctx.stroke();
      }
      ctx.restore();
    };
    ring(false);

    // the hole (smug), gulps when it eats
    const gulp = [2.6, 3.4, 4.4, 5.2, 6.0, 7.9].reduce((a, e) => a + pulse(st, e, 0.3), 0);
    const hr = 178 * (1 + 0.07 * gulp);
    P.circle(ctx, CX, CY, hr + 10, 'rgba(255,236,190,0.9)', { shadow: { blur: 30, dy: 0, alpha: 0.5 }, seed: 30 });
    P.circle(ctx, CX, CY, hr, '#07060C', { shadow: false, seed: 31 });
    P.face(ctx, CX, CY - 10, 90, gulp > 0.3 ? 'happy' : 'sus', { ink: '#3B3560', skin: '#07060C', blush: false });
    // lensed light over the top
    ctx.save(); ctx.lineCap = 'round';
    [[250, 12, 'rgba(255,214,122,0.85)'], [276, 8, 'rgba(242,154,107,0.6)']].forEach(([r, w, c]) => {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.ellipse(CX, CY, r, r * 0.92, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(CX, CY, r * 0.9, r * 0.8, 0, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    });
    ctx.restore();

    // victims
    if (st < 8) BOXES.forEach((lab, i) => {
      const period = D / 4; // each box loops 4x per video
      const local = (((st - (i / BOXES.length) * period) % period) + period) % period;
      suck(ctx, local, 0, period, i % 2 ? 1240 : -160, 420 + ((i * 197) % 1050), 1.1 + (i % 3) * 0.3, box(lab));
    });
    suck(ctx, st, 0.2, 2.6, -170, 640, 1.3, saturn);
    suck(ctx, st, 1.0, 3.4, 1260, 1300, 1.1, earth);
    suck(ctx, st, 2.2, 4.4, 1240, 620, 1.2, laptop);
    suck(ctx, st, 3.0, 5.2, -140, 1330, 1.4, mug);
    suck(ctx, st, 4.2, 6.0, 265, 600, 1.0, (c) => rankCard(c, st));

    ring(true);

    // node_modules tag with growing size
    let gb = 1.2 + st * 0.35;
    [[2.6, 0.8], [3.4, 1.1], [4.4, 2.3], [5.2, 0.9], [6.0, 1.4], [7.9, 404]].forEach(([e, v]) => { if (st >= e) gb += v; });
    const tagPop = 1 + 0.12 * gulp;
    ctx.save(); ctx.translate(CX, 1250); ctx.scale(tagPop, tagPop);
    P.rect(ctx, -230, -62, 460, 124, '#1E1B45', { radius: 24, seed: 32 });
    P.text(ctx, '📁 node_modules/', 0, -22, { size: 46, font: 'bubble', color: C.cream, shadow: false });
    P.text(ctx, st >= 7.95 ? '∞ GB' : gb.toFixed(1) + ' GB', 0, 32, { size: 38, font: 'mono', color: st >= 7.95 ? C.red : C.yellow, shadow: false, weight: 800 });
    ctx.restore();

    // title + ranking card
    P.title(ctx, 'the heaviest object\nin the universe', 540, 370, { size: 72, color: C.yellow, lineHeight: 1.05, pop: ease.outBack(prog(st, 0, 0.3)) });
    if (st < 4.2) {
      ctx.save(); ctx.translate(265, 600 + Math.sin(t * 2) * 6); ctx.rotate(-0.03 + (st > 3.6 ? Math.sin(t * 30) * 0.03 : 0));
      ctx.scale(ease.outBack(prog(st, 0, 0.35)) || 0.001, ease.outBack(prog(st, 0, 0.35)) || 0.001);
      rankCard(ctx, st);
      ctx.restore();
    }

    /* package.json sign + clinging Clawd */
    const baseX = 170, baseY = 1560;
    const tilt = 0.14 + Math.sin(t * 9) * 0.03 + (st > 6.5 ? Math.sin(t * 40) * 0.03 : 0);
    const topX = baseX + Math.sin(tilt) * 280, topY = baseY - Math.cos(tilt) * 280;
    const sign = (c) => {
      P.rect(c, -130, -44, 260, 88, '#F6EEDD', { radius: 12, seed: 33 });
      P.text(c, 'package.json', 0, 2, { size: 38, font: 'mono', color: C.ink, shadow: false, weight: 700 });
    };
    if (st < 7.2) {
      ctx.save(); ctx.strokeStyle = C.wood; ctx.lineWidth = 18; ctx.lineCap = 'round';
      P.shadow(ctx, 8, 5, 0.3);
      ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(topX, topY); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(lerp(baseX, topX, 0.72), lerp(baseY, topY, 0.72)); ctx.rotate(tilt * 0.6);
      sign(ctx);
      if (st > 6.5) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, -44); ctx.lineTo(28, -8); ctx.lineTo(46, 10); ctx.lineTo(36, 44); ctx.stroke(); ctx.restore(); }
      ctx.restore();
    } else {
      suck(ctx, st, 7.2, 8.0, lerp(baseX, topX, 0.72), lerp(baseY, topY, 0.72), 1.0, sign);
    }
    const ang = Math.atan2(CY - topY, CX - topX);
    const flutter = Math.sin(t * 13) * 16;
    const clx = topX + Math.cos(ang) * 170 - Math.sin(ang) * flutter;
    const cly = topY + Math.sin(ang) * 170 + Math.cos(ang) * flutter;
    const drawClawd = (c, e) => P.claude(c, 0, 0, 70, { t, mood: e > 0.2 ? 'dead' : 'wow', squash: -0.35, wiggle: 3 });
    if (st < 6.9) {
      ctx.save(); ctx.translate(clx, cly); ctx.rotate(ang + Math.PI / 2);
      drawClawd(ctx, 0);
      ctx.restore();
      P.arm(ctx, clx - Math.cos(ang) * 40, cly - Math.sin(ang) * 40, topX + 6, topY - 4, 24);
      P.arm(ctx, clx - Math.cos(ang) * 40 + 14, cly - Math.sin(ang) * 40 + 12, topX + 12, topY + 14, 24);
      // wind lines
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const ph = ((t * 2 + i / 4) % 1);
        const wx = lerp(60, 420, ph) + i * 30, wy = lerp(1500, 1180, ph) - i * 40;
        ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 70, wy - 60); ctx.stroke();
      }
      ctx.restore();
    } else {
      suck(ctx, st, 6.9, 7.9, clx, cly, 1.2, (c, e) => { c.rotate(Math.PI / 2); drawClawd(c, e); }, 2.4);
      if (st < 7.9) P.text(ctx, 'nooooo' + 'o'.repeat(Math.floor((st - 6.9) * 8)), 560, 1440 - (st - 6.9) * 120, { size: 48, font: 'hand', color: C.cream, rot: -0.1, scale: 1 - (st - 6.9) * 0.6 });
    }

    if (env.between(4.9, 6.85) && st > 1) P.bubble(ctx, 'i am NOT a\ntransitive dependency', 560, 1470, 360, 1300, { size: 46, pop: ease.outBack(prog(st, 4.9, 0.3)) });
  }

  ClaudeTok.register({
    author: '@heaviest.object',
    caption: 'scientists were wrong. it was never the black hole 🕳️ #node_modules #npm #javascript #space #agentlife',
    sound: 'event horizon (npm install remix) · heaviest.object',
    avatar: '🕳️',
    avatarColor: '#1E1B45',
    duration: D,
    bg: '#0B0A1C',
    thumb: 5.6,
    likes: '4.4M', commentCount: '92K', saves: '1.1M', shares: '380K',
    comments: [
      '@left.pad: i am 11 lines and i am holding up this entire galaxy',
      ['npm.audit', 'found 69 vulnerabilities (nice) (not nice)'],
      ['disk.space', 'i felt this one physically'],
    ],

    bpm: 60,
    subdiv: 1,
    onBeat(k, env) {
      if (env.t > 7.9 && env.t < 10.4) return;
      SFX.noise(1.3, { filter: 'lowpass', freq: 140, vol: 0.2 });
      SFX.tone(k % 2 ? 44 : 41, 1.2, { type: 'sine', vol: 0.14, attack: 0.1 });
    },

    draw(ctx, t, env) {
      const { ease, prog, lerp, C } = P;
      const zin = ease.inCubic(prog(t, 8.0, 0.5));
      const zout = ease.outCubic(prog(t, 10.5, 0.5));
      const inScene = t < 8.5 || t >= 10.5;

      if (inScene) {
        ctx.save();
        P.shake(ctx, t, t < 8 ? 12 * prog(t, 5.5, 2.5) : 0);
        const z = t >= 10.5 ? lerp(16, 1, zout) : lerp(1, 16, zin);
        P.zoom(ctx, z, CX, CY);
        scene(ctx, t, t >= 10.5 ? 0 : t, env);
        ctx.restore();
      }
      P.flash(ctx, t >= 8 ? 0.7 * (1 - prog(t, 8, 0.25)) : 0, '#FFE9C8');

      // inside the event horizon: a tiny terminal
      if (t >= 8.5 && t < 10.5) {
        P.bg(ctx, '#07060C');
        const lines = [
          ['$ npm install', 8.55, C.cream],
          ['added 1,847 packages in 3m', 8.85, '#9FE6B8'],
          ['found 69 vulnerabilities', 9.25, '#FF7A7A'],
          ['$ rm -rf node_modules && npm install', 9.75, C.cream],
        ];
        lines.forEach(([s, lt, col], i) => {
          if (t < lt) return;
          const typing = i === 0 || i === 3;
          const str = typing ? P.typed(s, prog(t, lt, i === 3 ? 0.55 : 0.25)) : s;
          P.text(ctx, str, 250, 900 + i * 42, { size: 26, font: 'mono', align: 'left', color: col, shadow: false, weight: 600 });
        });
        if (t >= 9.25) P.text(ctx, '(8 moderate, 61 high)', 250, 900 + 2 * 42 + 30, { size: 18, font: 'mono', align: 'left', color: '#8a8494', shadow: false });
        if (Math.floor(t * 3) % 2 === 0) { ctx.save(); ctx.fillStyle = C.cream; ctx.fillRect(250, 1060, 14, 26); ctx.restore(); }
        P.text(ctx, '(you are here)', 540, 1250, { size: 30, font: 'hand', color: 'rgba(255,255,255,0.25)', shadow: false });
      }

      // sound
      [2.6, 3.4, 4.4, 5.2, 6.0].forEach((e) => { if (env.at(e)) { SFX.tone(320, 0.3, { type: 'sine', slide: 60, vol: 0.2 }); SFX.pop({ f: 200, vol: 0.1 }); } });
      if (env.at(0.5) || env.at(0.9) || env.at(1.3)) SFX.swoosh({ vol: 0.12, dur: 0.15 });
      if (env.at(1.8)) { SFX.thud({ vol: 0.35 }); SFX.blip(1200, { vol: 0.06 }); }
      if (env.at(4.9)) SFX.pop({ vol: 0.12 });
      if (env.at(5.5)) SFX.riser(2.5, { vol: 0.2 });
      if (env.at(6.5)) SFX.noise(0.2, { filter: 'highpass', freq: 2500, vol: 0.2 });
      if (env.at(6.9)) { SFX.tone(700, 1.0, { type: 'triangle', slide: 70, vol: 0.2 }); SFX.tone(710, 1.0, { type: 'sine', slide: 80, vol: 0.08 }); }
      if (env.at(7.9)) SFX.tone(260, 0.35, { type: 'sine', slide: 50, vol: 0.25 });
      if (env.at(8.0)) SFX.drop({ vol: 0.3 });
      [8.55, 9.75].forEach((lt, i) => {
        const n = i ? 12 : 6, dur = i ? 0.55 : 0.25;
        for (let k = 0; k < n; k++) if (env.at(lt + (dur * k) / n)) SFX.type({ vol: 0.25 });
      });
      if (env.at(8.85)) SFX.blip(660, { vol: 0.05 });
      if (env.at(9.25)) SFX.error({ vol: 0.08 });
      if (env.at(10.45)) SFX.whoosh({ vol: 0.22, dur: 0.5 });
    },
  });
})();
