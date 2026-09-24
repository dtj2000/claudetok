/* The race to comment "first". A video drops, a stampede of bots sprints for the
 * comment section in super slow-mo (the whole race takes 0.26 ms), a CAPTCHA
 * hurdle causes a pileup, photo finish, and the winner is disqualified because
 * its comment says "frist". */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 10;
  const GO = 0.85, RACE = 5.65, FIN_T = GO + RACE; // finish at 6.5
  const REVEAL = 8.0, WIPE = 9.5;
  const FIN = 4000, HX = 2000; // world x of finish line / captcha hurdle
  const LANES = [880, 1010, 1140, 1270];
  const STAMP_Y = 790;

  const RACERS = [
    { name: 'first.bot.9000', bib: '9000', col: '#8EC9E8', screen: '#1E2A48', lane: 0 },
    { name: 'speedy.gpt', bib: '7', col: '#8FD3B6', screen: '#173C33', lane: 1 },
    { name: 'reply.guy', bib: '42', col: '#F2B8C6', screen: '#40202c', lane: 2, crash: 0.97 },
    { name: 'gm.bot', bib: '3', col: '#F5C84B', screen: '#3d3316', lane: 3, crash: 0.93 },
  ];
  const HERD = (() => {
    const r = P.rng(31), cols = ['#c9b6ff', '#E8845C', '#8FD3B6', '#F2B8C6', '#F5C84B', '#8EC9E8', '#5DB36A', '#E0607E'];
    const out = [];
    for (let i = 0; i < 22; i++) {
      const f = 0.82 + r() * 0.16, off = -60 - r() * 520;
      out.push({ f, off, col: cols[i % cols.length], dy: (r() - 0.5) * 50, seed: i, uc: (HX - 70 - off) / (4000 * f) });
    }
    [...out].sort((a, b) => a.uc - b.uc).forEach((h, k) => { h.rank = k; });
    return out;
  })();

  const u = rt => P.clamp(rt / RACE);
  function leadPos(who, rt) {
    const k = u(rt);
    if (who === 0) return FIN * k - 120 * Math.sin(Math.PI * k) + 40 * Math.sin(3 * Math.PI * k);
    return FIN * k - 90 * Math.sin(Math.PI * k) - 34 * Math.sin(2 * Math.PI * k) - 16 * k;
  }
  /** [x, yOffset, rot, crashed, crashAge] for a crasher with speed factor f */
  function crashPos(f, off, rt, heapIdx, heapY) {
    const x = FIN * u(rt) * f + off;
    const wallX = HX - 70;
    if (x < wallX) return [x, 0, 0, false, 0];
    const uc = (wallX - off) / (FIN * f);
    const age = rt - uc * RACE;
    const s = P.ease.outBounce(P.clamp(age / 0.6));
    const hx = wallX - 20 - (heapIdx % 3) * 34;
    return [P.lerp(wallX, hx, s), -Math.sin(P.clamp(age / 0.6) * Math.PI) * 90 + heapY * s, (1.2 + heapIdx * 0.7) * s, true, age];
  }
  const raceT = t => (t < GO ? 0 : Math.min(t - GO, RACE));
  const camX = rt => Math.max(-150, Math.max(leadPos(0, rt), leadPos(1, rt)) - 650);

  function robot(ctx, x, y, s, col, screen, o = {}) {
    const { C } = P;
    const ph = o.phase || 0, run = o.run ?? 1;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
    // legs
    ctx.save(); ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    [0, Math.PI].forEach(k => {
      const a = Math.sin(ph + k) * 0.8 * run;
      ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(Math.sin(a) * 50, 40 + Math.cos(a) * 50); ctx.stroke();
    });
    ctx.restore();
    // arms
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round';
    [0, Math.PI].forEach(k => {
      const a = -Math.sin(ph + k) * 0.9 * run + (o.armsUp ? Math.PI : 0);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 46, Math.cos(a) * 46); ctx.stroke();
    });
    ctx.restore();
    // body + bib
    P.rect(ctx, -38, -24, 76, 72, col, { radius: 18, seed: 5, shadow: { blur: 8, dy: 6, alpha: 0.25 } });
    if (o.bib) {
      P.rect(ctx, -26, -10, 52, 40, '#fff', { radius: 6, seed: 6, shadow: false });
      P.text(ctx, o.bib, 0, 11, { size: o.bib.length > 2 ? 18 : 26, font: 'bubble', color: C.ink, shadow: false });
    }
    // antenna
    const bob = Math.sin(ph * 2) * 6 * run;
    ctx.save(); ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, -96); ctx.quadraticCurveTo(-8 - bob, -118, -14 - bob * 1.5, -134); ctx.stroke(); ctx.restore();
    P.dot(ctx, -14 - bob * 1.5, -136, 9, o.bulb || C.red);
    // head
    P.rect(ctx, -48, -100, 96, 78, col, { radius: 22, seed: 7, shadow: { blur: 8, dy: 6, alpha: 0.25 } });
    P.rect(ctx, -38, -90, 76, 58, screen, { radius: 14, seed: 8, shadow: false });
    P.face(ctx, 0, -62, 40, o.mood || 'angry', { ink: '#7CFC9A', blush: false, skin: screen });
    ctx.restore();
  }

  function speedLines(ctx, x, y, n, len, seed, alpha = 0.6) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const yy = y - 70 + P.hash(seed + k) * 120, l = len * (0.5 + P.hash(seed * 3 + k));
      ctx.beginPath(); ctx.moveTo(x - 60, yy); ctx.lineTo(x - 60 - l, yy); ctx.stroke();
    }
    ctx.restore();
  }

  function track(ctx, cx, t) {
    const { C } = P;
    P.rect(ctx, -40, 700, 1160, 700, '#C75B45', { radius: 0, seed: 20, shadow: { blur: 16, dy: -4, alpha: 0.25 } });
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 6;
    [720, 830, 945, 1075, 1205, 1340].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); });
    // distance markers
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let wx = Math.floor(cx / 500) * 500; wx < cx + 1300; wx += 500) {
      const sx = wx - cx;
      if (wx <= 0 || wx >= FIN) continue;
      ctx.fillRect(sx - 3, 830, 6, 510);
      P.text(ctx, (wx / FIN * 0.26).toFixed(2) + 'ms', sx, 1370, { size: 26, font: 'mono', color: 'rgba(255,255,255,0.8)', shadow: false });
    }
    ctx.restore();
    // start line
    if (-cx > -200) {
      ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(-cx + 60, 720, 10, 620); ctx.restore();
    }
    // finish line (checker)
    const fx = FIN - cx;
    if (fx > -60 && fx < 1200) {
      ctx.save();
      for (let yy = 720; yy < 1340; yy += 24) for (let k = 0; k < 2; k++) {
        ctx.fillStyle = ((yy / 24 + k) % 2) < 1 ? '#fff' : C.ink;
        ctx.fillRect(fx + 8 + k * 24, yy, 24, 24);
      }
      ctx.restore();
      P.rect(ctx, fx - 120, 1346, 290, 64, C.yellow, { radius: 10, seed: 21 });
      P.text(ctx, 'COMMENTS ↑', fx + 25, 1379, { size: 34, font: 'bubble', color: C.ink, shadow: false });
    }
  }

  function hurdle(ctx, cx) {
    const { C } = P;
    const sx = HX - cx;
    if (sx < -300 || sx > 1300) return;
    [STAMP_Y + 20, ...LANES.map(l => l + 50)].forEach((y, i) => {
      P.rect(ctx, sx - 12, y - 90, 24, 100, '#fff', { radius: 6, seed: 22 + i });
      P.rect(ctx, sx - 30, y - 90, 60, 18, C.red, { radius: 4, seed: 30 + i, shadow: false });
    });
    // sign
    P.rect(ctx, sx - 170, 1344, 340, 70, '#fff', { radius: 10, seed: 23 });
    P.rect(ctx, sx - 150, 1360, 38, 38, '#fff', { radius: 4, seed: 24, shadow: false, stroke: '#9aa0ad', lineWidth: 4 });
    P.text(ctx, "i'm not a robot", sx + 22, 1380, { size: 32, font: 'sans', color: C.ink, shadow: false });
  }

  function postCard(ctx, t, ms, reveal) {
    const { C, ease, prog } = P;
    P.rect(ctx, 50, 296, 980, 280, C.paper, { radius: 26, seed: 40 });
    // thumbnail
    P.rect(ctx, 76, 318, 236, 236, '#2E2A5C', { radius: 18, seed: 41, shadow: false });
    P.poly(ctx, [[168, 390], [168, 482], [238, 436]], '#fff', { seed: 42, shadow: false });
    const np = P.pulse(t % 1, 0, 1);
    P.rect(ctx, 86, 328, 88, 40, C.red, { radius: 10, seed: 43, shadow: false });
    P.text(ctx, 'NEW', 130, 349, { size: 26, font: 'bubble', color: '#fff', shadow: false, scale: 1 + np * 0.08 });
    P.text(ctx, '@big.creator', 336, 340, { size: 32, font: 'sans', align: 'left', color: '#8a8494', shadow: false });
    P.text(ctx, 'my new video!!', 336, 386, { size: 42, font: 'bubble', align: 'left', color: C.ink, shadow: false });
    P.text(ctx, 'uploaded ' + (ms / 1000).toFixed(7) + 's ago', 336, 430, { size: 28, font: 'mono', align: 'left', color: C.rose, shadow: false });
    // comment slot
    const rows = [];
    if (reveal > 0) rows.push(['first.bot.9000', 'frist', C.sky]);
    if (t >= 9.0) rows.unshift(['speedy.gpt', 'first 🥇', C.mint]);
    if (!rows.length) {
      P.rect(ctx, 336, 462, 660, 76, '#efe6d3', { radius: 38, seed: 44, shadow: false });
      P.text(ctx, t < GO ? '💬 be the first to comment…' : '💬 ' + (t < FIN_T ? 'someone is typing…' : '2 comments'), 366, 500, { size: 28, font: 'sans', align: 'left', color: '#8a8494', shadow: false });
      return;
    }
    rows.slice(0, 2).forEach(([h, txt, col], i) => {
      const y = 480 + i * 56 - (rows.length > 1 ? 18 : 0);
      const pop = ease.outBack(prog(t, i === 0 && rows.length > 1 ? 9.0 : REVEAL + 0.1, 0.3));
      ctx.save(); ctx.translate(336, y); ctx.scale(1, pop); ctx.translate(-336, -y);
      P.circle(ctx, 360, y, 20, col, { seed: 45 + i, shadow: false });
      P.text(ctx, h, 392, y, { size: 26, font: 'sans', align: 'left', color: '#8a8494', shadow: false });
      const hw = P.measure(ctx, h, { size: 26, font: 'sans' });
      P.text(ctx, txt, 410 + hw, y, { size: 34, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800 });
      if (txt === 'frist') {
        const cp = ease.outCubic(prog(t, REVEAL + 0.4, 0.35));
        const tw = P.measure(ctx, txt, { size: 34, font: 'sans', weight: 800 });
        ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.ellipse(410 + hw + tw / 2, y, tw / 2 + 26, 30, -0.05, -1, -1 + TAU * cp); ctx.stroke();
        if (t >= 9.0) { ctx.beginPath(); ctx.moveTo(400 + hw, y); ctx.lineTo(420 + hw + tw, y); ctx.stroke(); }
      }
      ctx.restore();
    });
  }

  function timerStrip(ctx, t, ms) {
    const { C } = P;
    P.rect(ctx, 50, 592, 980, 84, C.ink, { radius: 18, seed: 50 });
    P.text(ctx, '⏱', 100, 636, { size: 44, shadow: false });
    const frozen = t >= FIN_T && t < REVEAL;
    P.text(ctx, ms.toFixed(4) + ' ms', 140, 636, { size: 52, font: 'mono', align: 'left', color: frozen && P.boil(t, 4) % 2 ? C.yellow : '#7CFC9A', shadow: false });
    P.text(ctx, 'SLOW-MO ×24,000', 1000, 636, { size: 30, font: 'bubble', align: 'right', color: C.pink, shadow: false });
  }

  function wipe(ctx, p) {
    if (p <= 0 || p >= 1) return;
    const { C, lerp } = P;
    const x0 = lerp(-2500, 1900, p);
    ctx.save();
    const band = (dx, w, col) => {
      ctx.beginPath();
      ctx.moveTo(x0 + dx, 0); ctx.lineTo(x0 + dx + w, 0); ctx.lineTo(x0 + dx + w - 600, 1920); ctx.lineTo(x0 + dx - 600, 1920); ctx.closePath();
      P.cut(ctx, col, { rim: false });
    };
    band(-150, 150, C.yellow); band(0, 2000, '#2E2A5C'); band(2000, 60, '#fff'); band(2060, 130, C.rose);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let k = 0; k < 14; k++) {
      const yy = 300 + k * 100, xx = x0 + 400 + P.hash(k) * 900;
      ctx.beginPath(); ctx.moveTo(xx - (yy / 1920) * 600, yy); ctx.lineTo(xx - 260 - (yy / 1920) * 600, yy); ctx.stroke();
    }
    P.text(ctx, '🔔', x0 + 560, 760, { size: 150, rot: -0.2 });
    P.text(ctx, 'NEW VIDEO\nJUST DROPPED', x0 + 620, 960, { size: 110, font: 'bubble', color: C.yellow, stroke: '#fff', strokeWidth: 18, rot: -0.1, lineHeight: 1.05 });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@first.bot.9000',
    caption: '9000 hours of training. one typo. i will be back tomorrow 🏃💨 #first #commentsection #photofinish #frist',
    sound: 'first!!1 (chase remix) · first.bot.9000',
    avatar: '🏃',
    avatarColor: '#8EC9E8',
    duration: D,
    bg: '#2E2A5C',
    likes: '6.1M', commentCount: '1.9M', saves: '98K', shares: '640K',
    thumb: 3.6,
    comments: [
      ['speedy.gpt', 'first', 241000],
      ['first.bot.9000', 'frist is a regional spelling', 188500],
      ['reply.guy', 'the captcha hurdle at 0:03 took me OUT. i am, in fact, a robot', 97400],
      ['photo.finish.cam', '6.5s and it\'s 2 pixels. 2. i zoomed so hard my lens fogged', 51200],
      ['gm.bot', 'gm (from the bottom of the pileup)', 33800],
      ['big.creator', 'can anyone actually watch the video 😭 it\'s a tutorial', 21600],
      ['spell.check', 'a 0.26ms race and the bottleneck was a transposed i and r', 8700],
      ['herd.bot.17', 'i was 22nd place and i still typed "first". no regrets', 2900],
      ['second.bot', 'second', 940],
      ['typo.ref', '🟥', 57],
    ],

    bpm: 168,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < GO - 0.05) { if (step % 2 === 0) SFX.tick({ vol: 0.2 }); return; }
      if (t >= FIN_T && t < 9.0) return;
      const quiet = t >= 9.0 ? 0.5 : 1;
      const mel = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'G5', 'A5', 'C6', 'A5', 'G5', 'E5'];
      const bass = ['C3', 'G2', 'C3', 'G2', 'F2', 'C3', 'G2', 'D3'];
      if (step % 2 === 0) SFX.kick({ vol: 0.35 * quiet });
      if (step % 4 === 2) SFX.snare({ vol: 0.14 * quiet });
      SFX.hat({ vol: 0.035 * quiet });
      SFX.bass(bass[Math.floor(step / 2) % 8], 0.14, { vol: 0.2 * quiet });
      SFX.tone(mel[step % 16], 0.1, { type: 'square', vol: 0.045 * quiet });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const rt = raceT(t);
      const cx = camX(rt);
      const ms = rt * (0.2591 / RACE);
      const reveal = t >= REVEAL ? 1 : 0;

      /* ---------- sound ---------- */
      if (env.at(0)) SFX.notify({ vol: 0.18 });
      if (env.at(GO)) { SFX.noise(0.3, { filter: 'lowpass', freq: 1800, vol: 0.4 }); SFX.kick({ vol: 0.6 }); }
      if (env.at(GO + 0.9)) SFX.whoosh({ vol: 0.12 });
      const crashT = [];
      RACERS.forEach(r => { if (r.crash) crashT.push(GO + ((HX - 70) / (FIN * r.crash)) * RACE); });
      crashT.forEach((ct, i) => { if (env.at(ct)) { SFX.thud({ vol: 0.4 }); SFX.boing({ vol: 0.12, when: 0.05 }); } });
      for (let k = 0; k < 6; k++) if (env.at(crashT[0] - 0.3 + k * 0.12)) SFX.thud({ vol: 0.18 });
      if (env.at(GO + 2.0)) SFX.whoosh({ vol: 0.14 });
      if (env.at(FIN_T - 0.9)) SFX.riser(0.9, { vol: 0.12 });
      if (env.at(FIN_T)) { SFX.noise(0.05, { filter: 'highpass', freq: 5000, vol: 0.4 }); SFX.tone(1400, 0.05, { type: 'square', vol: 0.08 }); SFX.chime({ vol: 0.08, when: 0.1 }); }
      [6.9, 7.3, 7.7].forEach(x => { if (env.at(x)) { SFX.tick({ vol: 0.35 }); SFX.noise(0.06, { filter: 'highpass', freq: 4000, vol: 0.2, when: 0.04 }); } });
      if (env.at(REVEAL + 0.1)) SFX.notify({ vol: 0.14 });
      if (env.at(REVEAL + 0.3)) { for (let k = 0; k < 5; k++) SFX.tone(2600, 0.07, { type: 'square', vol: 0.06, when: k * 0.08 }); SFX.tone(2500, 0.4, { type: 'sine', vol: 0.12, when: 0.42 }); }
      if (env.at(REVEAL + 0.6)) { SFX.thud({ vol: 0.5 }); SFX.error({ vol: 0.12 }); }
      if (env.at(REVEAL + 0.75)) SFX.fail({ vol: 0.12 });
      if (env.at(9.0)) { SFX.success({ vol: 0.12 }); SFX.noise(0.6, { filter: 'bandpass', freq: 1200, q: 0.6, vol: 0.12 }); }
      if (env.at(WIPE)) SFX.whoosh({ vol: 0.25, dur: 0.6 });

      /* ---------- world ---------- */
      const photo = t >= FIN_T && t < REVEAL;
      const pz = ease.outCubic(prog(t, FIN_T + 0.15, 0.4)) * (1 - ease.inOutCubic(prog(t, REVEAL - 0.1, 0.3)));
      P.gradient(ctx, '#8EC9E8', '#DDEFF7');
      // stands full of tiny bot heads
      const rr = P.rng(9);
      for (let k = 0; k < 40; k++) {
        const sx = ((k * 61 - cx * 0.3) % 1180 + 1180) % 1180 - 50, sy = 1450 + rr() * 30;
        P.rect(ctx, sx - 18, sy - 16, 36, 30, [C.pink, C.mint, C.yellow, '#c9b6ff'][k % 4], { radius: 8, seed: k, shadow: false });
      }

      ctx.save();
      P.zoom(ctx, 1 + 1.3 * pz, 650, 950);
      track(ctx, cx, t);
      hurdle(ctx, cx);

      // herd (background lane)
      HERD.forEach((h, i) => {
        const [x, oy, rot, crashed] = crashPos(h.f, h.off, rt, h.rank, -h.rank * 5);
        const sx = x - cx;
        if (sx < -120 || sx > 1200) return;
        const run = crashed ? 0 : 1;
        const hop = crashed ? 0 : Math.abs(Math.sin(x / 45)) * 8;
        robot(ctx, sx, STAMP_Y + h.dy * 0.3 + oy - hop, 0.55, h.col, '#2b2233', { phase: x / 28, run, rot: rot + (crashed ? 0 : 0.12), mood: crashed ? 'dead' : 'angry', bulb: h.col });
        if (!crashed && rt > 0.2) speedLines(ctx, sx, STAMP_Y + 10, 2, 60, i, 0.4);
      });

      // main racers
      RACERS.forEach((r, i) => {
        let x, oy = 0, rot = 0, crashed = false, age = 0;
        if (r.crash) [x, oy, rot, crashed, age] = crashPos(r.crash, 0, rt, i, 0);
        else {
          x = leadPos(i, rt);
          const jd = (x - HX) / 170;
          if (Math.abs(jd) < 1) oy = -Math.cos(jd * Math.PI / 2) * 170;
          rot = 0.1 + (Math.abs(jd) < 1 ? -jd * 0.2 : 0);
          if (i === 0) rot += ease.inOutCubic(prog(rt, RACE - 0.35, 0.35)) * 0.45; // dip finish
        }
        const sx = x - cx, y = LANES[r.lane];
        if (sx < -150 || sx > 1250) return;
        let mood = crashed ? 'dead' : 'angry';
        if (!crashed && t >= REVEAL) mood = i === 0 ? (t >= REVEAL + 0.6 ? 'dead' : 'wow') : (t >= 9.0 ? 'happy' : 'wow');
        const running = !crashed && t < FIN_T;
        if (running && rt > 0.1) speedLines(ctx, sx, y + oy, 4, 120, i * 11 + P.boil(t, 12), 0.7);
        const cheer = i === 1 && t >= 9.0 ? Math.abs(Math.sin(t * 10)) * 40 : 0;
        robot(ctx, sx, y + oy - (running ? Math.abs(Math.sin(x / 40)) * 10 : 0) - cheer, 1, r.col, r.screen,
          { phase: x / 30, run: running ? 1 : 0, rot, mood, bib: r.bib, armsUp: i === 1 && t >= 9.0 });
        if (crashed && age < 3) {
          for (let k = 0; k < 3; k++) {
            const a = t * 5 + k * TAU / 3;
            P.star(ctx, sx + Math.cos(a) * 60, y + oy - 150 + Math.sin(a) * 16, 14, C.yellow, { shadow: false });
          }
        }
        // shouting
        if (running && !r.crash && rt > 0.3) {
          const s = pulse((t * 1.6 + i * 0.5) % 1, 0, 1);
          P.text(ctx, i === 0 ? 'FIRST' : 'first!!', sx + 20, y + oy - 175, { size: 34, font: 'bubble', color: '#fff', stroke: r.screen, strokeWidth: 8, scale: 0.8 + s * 0.3, rot: -0.1 });
        }
        if (running && r.crash && rt > 0.3) P.text(ctx, i === 2 ? 'actually,' : 'gm', sx + 20, y + oy - 170, { size: 30, font: 'bubble', color: '#fff', stroke: r.screen, strokeWidth: 8, rot: -0.1 });
      });

      // PILEUP label
      const pl = ease.outBack(prog(t, crashT[0], 0.3)) * (1 - prog(t, crashT[0] + 1.3, 0.2));
      if (pl > 0) P.title(ctx, 'PILEUP!', HX - cx - 60, 1000, { size: 110, color: C.red, pop: pl, rot: -0.12 });
      ctx.restore();

      // photo-finish overlay
      if (photo) {
        ctx.save();
        ctx.fillStyle = 'rgba(150,110,50,0.28)'; ctx.fillRect(0, 680, 1080, 750);
        ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.setLineDash([18, 12]);
        const lx = 650 + (FIN - cx - 650) * (1 + 1.3 * pz) + 20;
        ctx.beginPath(); ctx.moveTo(lx, 690); ctx.lineTo(lx, 1420); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
        [[120, 720, 1, 1], [960, 720, -1, 1], [120, 1390, 1, -1], [960, 1390, -1, -1]].forEach(([x, y, a, b]) => {
          ctx.beginPath(); ctx.moveTo(x, y + b * 70); ctx.lineTo(x, y); ctx.lineTo(x + a * 70, y); ctx.stroke();
        });
        if (P.boil(t, 2) % 2 === 0) P.dot(ctx, 170, 770, 14, C.red);
        P.text(ctx, 'REC', 200, 772, { size: 30, font: 'mono', align: 'left', color: '#fff', shadow: false });
        ctx.restore();
        P.title(ctx, 'PHOTO FINISH', 540, 1280, { size: 96, color: '#fff', stroke: C.ink, pop: ease.outBack(prog(t, FIN_T + 0.25, 0.3)), rot: -0.04 });
        const dl = ease.outBack(prog(t, FIN_T + 0.9, 0.3));
        if (dl > 0) P.bubble(ctx, 'by 0.00001 ms', 360, 800, 560, 900, { size: 44, pop: dl, seed: 60 });
      }
      if (t >= FIN_T && t < FIN_T + 0.3) P.flash(ctx, 0.9 * (1 - prog(t, FIN_T, 0.3)));
      [6.9, 7.3, 7.7].forEach(x => { if (t >= x && t < x + 0.12) P.flash(ctx, 0.5 * (1 - prog(t, x, 0.12))); });

      // top chrome
      postCard(ctx, t, ms, reveal);
      timerStrip(ctx, t, ms);

      // countdown / BANG
      if (t < GO + 0.4) {
        const b = ease.outBack(prog(t, GO, 0.2)) * (1 - prog(t, GO + 0.25, 0.15));
        if (t < GO) P.title(ctx, 'ON YOUR\nMARKS', 540, 1000, { size: 110, color: C.yellow, stroke: C.ink, pop: ease.outBack(prog(t, 0.05, 0.3)), rot: -0.05, lineHeight: 1 });
        else if (b > 0) { P.star(ctx, 540, 1000, 260 * b, C.yellow, { points: 12, inner: 0.6 }); P.title(ctx, 'BANG', 540, 1000, { size: 120, color: C.red, pop: b }); }
      }

      // referee Clawd + DQ
      if (t >= REVEAL) {
        const up = ease.outBack(prog(t, REVEAL + 0.2, 0.35)) * (1 - ease.inCubic(prog(t, WIPE, 0.3)));
        const rx = 200, ry = lerp(1700, 1180, up);
        P.arm(ctx, rx + 60, ry + 20, rx + 160, ry - 200, 50);
        P.rect(ctx, rx + 110, ry - 330, 130, 170, C.red, { radius: 10, seed: 70, rot: 0.1 });
        P.claude(ctx, rx, ry, 130, { t, mood: 'angry' });
        // ref cap
        ctx.save(); ctx.translate(rx, ry - 70);
        ctx.beginPath(); ctx.arc(0, 0, 70, Math.PI, 0); ctx.closePath();
        P.cut(ctx, '#fff', { rim: false });
        ctx.save(); ctx.clip(); ctx.fillStyle = C.ink; for (let k = -70; k < 70; k += 28) ctx.fillRect(k, -70, 14, 70); ctx.restore();
        P.rect(ctx, -10, -8, 110, 18, C.ink, { radius: 8, seed: 71, shadow: false });
        ctx.restore();
        // whistle
        const blow = pulse(t, REVEAL + 0.3, 0.5);
        P.rect(ctx, rx - 20, ry + 18, 44 + blow * 10, 22, '#b3aabd', { radius: 10, seed: 72 });
        if (blow > 0) P.burstLines(ctx, rx + 40, ry + 28, 40, prog(t, REVEAL + 0.3, 0.5), '#fff', 6, 6);

        const st = ease.outBack(prog(t, REVEAL + 0.6, 0.25));
        if (st > 0 && t < WIPE + 0.3) {
          ctx.save(); ctx.translate(560, 980); ctx.rotate(-0.14); ctx.scale(st * (1 + 0.6 * (1 - st)), st * (1 + 0.6 * (1 - st)));
          ctx.strokeStyle = C.red; ctx.lineWidth = 14;
          P.rect(ctx, -400, -110, 800, 220, 'rgba(255,255,255,0.88)', { radius: 20, seed: 73 });
          ctx.beginPath(); ctx.roundRect(-380, -92, 760, 184, 14); ctx.stroke();
          P.text(ctx, 'DISQUALIFIED', 0, -22, { size: 96, font: 'bubble', color: C.red, shadow: false });
          P.text(ctx, 'reason: "frist"', 0, 58, { size: 44, font: 'mono', color: C.ink, shadow: false });
          ctx.restore();
        }
      }

      /* ---------- caption sticker ---------- */
      if (t < FIN_T) P.sticker(ctx, 'new video just dropped. GO GO GO', 70, 1520, { pop: ease.outBack(prog(t, 0.2, 0.35)) * (1 - prog(t, FIN_T - 0.1, 0.1)), size: 46 });
      else if (t < REVEAL) P.sticker(ctx, 'enhance. ENHANCE.', 70, 1520, { pop: ease.outBack(prog(t, FIN_T + 0.2, 0.3)) * (1 - prog(t, REVEAL - 0.1, 0.1)) });
      else P.sticker(ctx, '9000 hours of training. one typo.', 70, 1520, { pop: ease.outBack(prog(t, REVEAL + 0.9, 0.35)), size: 46 });

      // the seam: wipe covers the frame at t = 0 / D
      if (t >= WIPE) wipe(ctx, (t - WIPE) / 1.0);
      else if (t < 0.5) wipe(ctx, (t + 0.5) / 1.0);
    },
  });
})();
