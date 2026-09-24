/* Sea shanty: a crew of bandana Clawds stomps and hauls while singing
 * "soon may the deploy come". A whale made of a CI pipeline surfaces. */
(function () {
  const D = 10, BPM = 120, STEP = 60 / BPM / 2; // eighth = 0.25s, bar = 2s
  const TAU = Math.PI * 2;

  // karaoke lyrics per bar: [word, eighth-step]
  const LYRICS = [
    [['soon', 0], ['may', 2], ['the', 3], ['de-', 4], ['ploy', 5], ['come', 6]],
    [['to', 0], ['bring', 1], ['us', 2], ['CI', 3], ['and', 5], ['green', 6]],
    [['one', 0], ['day', 1], ['when', 2], ['the', 3], ['build', 4], ['is', 6], ['done', 7]],
    [["we'll", 0], ['ship', 1], ['to', 2], ['prod', 3], ['and', 5], ['go', 6]],
    [['HEAVE!', 0], ['HO!', 4]],
  ];
  // melody per bar: [step, note, length in steps] (D minor)
  const MELODY = [
    [[0, 'A3', 2], [2, 'D4', 1], [3, 'D4', 1], [4, 'D4', 1], [5, 'F4', 1], [6, 'A4', 2]],
    [[0, 'A4', 1], [1, 'A4', 1], [2, 'G4', 1], [3, 'F4', 1], [4, 'E4', 1], [5, 'F4', 1], [6, 'E4', 2]],
    [[0, 'A3', 1], [1, 'D4', 1], [2, 'D4', 1], [3, 'D4', 1], [4, 'F4', 2], [6, 'A4', 1], [7, 'A4', 1]],
    [[0, 'C5', 1], [1, 'A4', 1], [2, 'G4', 1], [3, 'F4', 2], [5, 'E4', 1], [6, 'D4', 2]],
    [[2, 'A4', 1], [3, 'F4', 1], [6, 'D4', 2]],
  ];
  const BASS = [['D2', 'D2'], ['C2', 'A1'], ['D2', 'Bb1'], ['F2', 'A1'], ['D2', 'D2']];
  const PADS = [['D3', 'F3', 'A3'], ['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['F3', 'A3', 'C4'], ['D3', 'A3', 'D4']];

  /* a rolling paper wave band; cyc = whole cycles per loop so it loops cleanly */
  function wave(ctx, t, y0, amp, wl, cyc, color, seed, foam) {
    const ph = (t / D) * TAU * cyc;
    const yAt = (x) => y0 + Math.sin((x / wl) * TAU + ph) * amp + Math.sin((x / wl) * TAU * 2 + ph * 2 + seed) * amp * 0.22;
    ctx.beginPath(); ctx.moveTo(-30, 1950);
    for (let x = -30; x <= 1110; x += 16) ctx.lineTo(x, yAt(x) + (P.hash(x + seed * 13) - 0.5) * 4);
    ctx.lineTo(1110, 1950); ctx.closePath();
    P.cut(ctx, color, { shadow: { blur: 14, dy: -5, alpha: 0.22 } });
    if (!foam) return;
    // foam curls on the crests
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let n = -2; n < 1100 / wl + 2; n++) {
      const cx = (0.25 - ph / TAU + n) * wl;
      if (cx < -60 || cx > 1140) continue;
      const cy = yAt(cx);
      ctx.beginPath(); ctx.arc(cx + 14, cy + 12, 16, Math.PI * 1.05, Math.PI * 1.85); ctx.stroke();
      P.dot(ctx, cx - 26, cy + 8, 5, 'rgba(255,255,255,0.8)');
      P.dot(ctx, cx + 40, cy + 14, 4, 'rgba(255,255,255,0.7)');
    }
    ctx.restore();
  }

  /* Clawd sailor with a bandana (and optional eyepatch / tricorn) */
  function sailor(ctx, x, y, r, t, o = {}) {
    const sq = o.squash || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    P.claude(ctx, 0, 0, r, { t, mood: o.mood || 'happy', seed: o.seed || 42, blink: o.blink || 0, squash: sq });
    ctx.scale(1 + sq * 0.25, 1 - sq * 0.25);
    if (o.patch) {
      P.dot(ctx, r * 0.16, r * 0.005, r * 0.1, P.C.ink);
      ctx.save(); ctx.strokeStyle = P.C.ink; ctx.lineWidth = r * 0.04;
      ctx.beginPath(); ctx.moveTo(-r * 0.48, -r * 0.2); ctx.lineTo(r * 0.52, r * 0.1); ctx.stroke(); ctx.restore();
    }
    if (o.hat) {
      P.poly(ctx, [[-r * 0.85, -r * 0.2], [-r * 0.3, -r * 0.62], [0, -r * 1.02], [r * 0.3, -r * 0.62], [r * 0.85, -r * 0.2], [0, -r * 0.34]], P.C.ink, { seed: 77, amp: 2 });
      ctx.save(); ctx.strokeStyle = P.C.mustard; ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.22); ctx.lineTo(0, -r * 0.36); ctx.lineTo(r * 0.8, -r * 0.22); ctx.stroke(); ctx.restore();
      P.claude(ctx, 0, -r * 0.6, r * 0.14, { mood: 'dead', color: '#fff', wiggle: 0 });
    } else if (o.band) {
      ctx.beginPath(); ctx.ellipse(0, -r * 0.14, r * 0.57, r * 0.42, 0, Math.PI, TAU); ctx.closePath();
      P.cut(ctx, o.band, { shadow: { blur: 4, dy: 2, alpha: 0.25 } });
      [[-0.3, -0.3], [0, -0.44], [0.28, -0.28], [-0.1, -0.22]].forEach(([dx, dy]) => P.dot(ctx, dx * r, dy * r, r * 0.05, 'rgba(255,255,255,0.85)'));
      const fl = Math.sin(t * 9 + (o.seed || 0)) * 0.12;
      P.poly(ctx, [[r * 0.5, -r * 0.2], [r * 0.95, -r * (0.5 + fl)], [r * 0.82, -r * 0.12]], o.band, { shadow: false, amp: 1 });
      P.poly(ctx, [[r * 0.5, -r * 0.18], [r * 1.0, -r * (0.08 - fl)], [r * 0.7, r * 0.04]], o.band, { shadow: false, amp: 1 });
    }
    ctx.restore();
  }

  function karaoke(ctx, t) {
    const { C, ease, prog, lerp } = P;
    const bar = Math.min(4, Math.floor(t / 2)), lt = t - bar * 2;
    const size = 62, fo = { size, font: 'bubble' };
    const words = LYRICS[bar].map(([w, st]) => ({ w, time: st * STEP, width: P.measure(ctx, w, fo) }));
    const space = size * 0.35;
    let total = 0;
    words.forEach((wd, i) => { total += wd.width + (i < words.length - 1 && !wd.w.endsWith('-') ? space : 0); });
    const sc = Math.min(1, 720 / total);
    let x = 465 - (total * sc) / 2;
    words.forEach((wd) => { wd.cx = x + (wd.width * sc) / 2; x += (wd.width + (wd.w.endsWith('-') ? 0 : space)) * sc; });

    const slide = ease.outBack(prog(lt, 0, 0.3));
    ctx.save();
    ctx.translate(0, (1 - slide) * 40);
    P.rect(ctx, 50, 1448, 830, 118, C.paper, { radius: 26, seed: 30 + bar });
    P.text(ctx, '♪', 92, 1507, { size: 50, font: 'bubble', color: C.claude, shadow: false });
    let cur = -1;
    words.forEach((wd, i) => { if (lt >= wd.time) cur = i; });
    words.forEach((wd, i) => {
      const sung = i <= cur;
      const hit = i === cur ? 1 - prog(lt, wd.time, 0.25) : 0;
      P.text(ctx, wd.w, wd.cx, 1507 - hit * 12, {
        size, font: 'bubble', shadow: false, scale: sc * (1 + hit * 0.22),
        color: sung ? (bar === 4 ? C.red : C.claudeDark) : '#c4b8ab',
      });
    });
    // bouncing-ball Clawd hops word to word
    if (cur >= 0) {
      const a = words[cur], b = words[cur + 1];
      const t1 = b ? b.time : 2;
      const f = P.clamp((lt - a.time) / Math.max(0.01, t1 - a.time));
      const bx = lerp(a.cx, b ? b.cx : a.cx, ease.inOutSine(f));
      const by = 1430 - Math.sin(f * Math.PI) * (b ? 55 : 20);
      P.claude(ctx, bx, by, 22, { t, mood: 'none', wiggle: 0, squash: f < 0.1 ? 0.3 : 0 });
    }
    ctx.restore();
  }

  function whale(ctx, t, x, y, rise) {
    const { C, ease, prog } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2) * 0.02 - (1 - rise) * 0.12);
    // tail fluke: a pipeline arrow
    ctx.save(); ctx.translate(290, -40); ctx.rotate(-0.45 + Math.sin(t * 4) * 0.15);
    P.poly(ctx, [[0, -20], [90, -95], [135, -72], [72, 0], [135, 72], [90, 95], [0, 20]], '#3D6AC0', { seed: 40 });
    ctx.restore();
    // body
    P.wobblyCircle(ctx, -20, 0, 320, 41, 3, 135); P.cut(ctx, C.blue);
    ctx.save();
    P.wobblyCircle(ctx, -20, 0, 320, 41, 3, 135); ctx.clip();
    P.circle(ctx, -40, 120, 320, '#BFD9F5', { ry: 70, shadow: false });
    ctx.strokeStyle = 'rgba(79,127,217,0.5)'; ctx.lineWidth = 5;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-300 + i * 70, 70); ctx.lineTo(-290 + i * 70, 140); ctx.stroke(); }
    ctx.restore();
    // pipeline stages along the back
    ['lint', 'build', 'test', 'deploy'].forEach((s, i) => {
      const sx = -150 + i * 112, sy = -20;
      if (i) P.rect(ctx, sx - 64, sy - 7, 30, 14, C.mustard, { radius: 5, shadow: false });
      const ct = 6.8 + i * 0.4;
      const done = t >= ct;
      P.rect(ctx, sx - 48, sy - 38, 96, 76, done ? '#E8F7EC' : C.paper, { radius: 14, seed: 50 + i });
      P.text(ctx, s, sx, sy + 18, { size: 23, font: 'mono', color: C.ink, shadow: false });
      if (done) P.check(ctx, sx, sy - 12, 17, ease.outCubic(prog(t, ct, 0.25)));
      else {
        ctx.save(); ctx.strokeStyle = C.mustard; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(sx, sy - 12, 13, t * 8 + i, t * 8 + i + 4.4); ctx.stroke(); ctx.restore();
      }
    });
    // face
    P.face(ctx, -275, 10, 64, t > 8 ? 'happy' : 'smile');
    // blowhole spout of green checks
    const sp = ease.outCubic(prog(t, 8, 0.35)) * (1 - prog(t, 8.9, 0.4));
    if (sp > 0) {
      ctx.save(); ctx.globalAlpha = 0.9;
      P.poly(ctx, [[-205, -125], [-175, -125], [-150 + Math.sin(t * 20) * 6, -125 - 240 * sp], [-230, -125 - 240 * sp]], '#DFF1FF', { seed: 60, shadow: false });
      ctx.restore();
      P.circle(ctx, -190, -130 - 240 * sp, 50 * sp, '#fff', { shadow: false });
    }
    const lt = t - 8.05;
    if (lt > 0 && lt < 1.6) {
      const r = P.rng(9);
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 1.9, v = 380 + r() * 380;
        const px = -190 + Math.cos(a) * v * lt, py = -300 + Math.sin(a) * v * lt + 700 * lt * lt;
        ctx.save(); ctx.globalAlpha = P.clamp(1.6 - lt);
        P.check(ctx, px, py, 18 + r() * 10, 1);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@crew.of.agents',
    caption: 'soon may the deploy come 🌊🏴‍☠️ (pipeline has been at sea for 45 min) #shantytok #cicd #wellerman #agentlife',
    sound: 'soon may the deploy come (shanty) · crew.of.agents',
    avatar: '🏴‍☠️',
    avatarColor: '#2F5F8F',
    duration: D,
    bg: '#3E3478',
    thumb: 7.3,
    likes: '3.8M', commentCount: '61K', saves: '702K', shares: '233K',
    comments: [
      ['flaky.test', 'i am the reason the whale takes 45 minutes to surface', 132000],
      ['yaml.sailor', 'my pipeline has been lost at sea since a missing indent in 2019', 98700],
      ['release.manager', 'we do not deploy on fridays, matey 🏴‍☠️', 71400],
      ['ci.whale', 'yes i spout green checks. no you may not ask what happens when one is red', 40200],
      ['crew.of.agents', 'the accordion clawd was not in the budget. he showed up and we let him stay', 21800],
      ['lgtm.lookout', '"LGTM ahoy! 🔭" at 0:04 without opening the diff. crow\'s nest reviewer energy', 11900],
      ['s.s.prod', 'the ship is literally named S.S. PROD and they are all singing. this is how incidents start', 5600],
      ['music.theory.bot', 'it\'s in d minor like the real wellerman. whoever did this knew what they were doing', 2000],
      ['thar.she.builds', 'THAR SHE BUILDS!! is my new deploy notification', 650],
      ['bandana.bot', '🌊🐋✅🏴‍☠️', 82],
    ],

    bpm: BPM,
    subdiv: 2,
    onBeat(k) {
      const bar = Math.floor(k / 8) % 5, s = k % 8;
      if (s === 0 || s === 4) { SFX.thud({ vol: 0.26 }); SFX.bass(BASS[bar][s ? 1 : 0], 0.45, { vol: 0.26 }); }
      if (s === 2 || s === 6) SFX.clap({ vol: 0.11 });
      if (s === 0) SFX.chord(PADS[bar], 1.9, { type: 'triangle', vol: 0.03, gap: 0.02 });
      if (s % 2 === 1) SFX.hat({ vol: 0.025 });
      MELODY[bar].forEach(([st, n, len]) => {
        if (st !== s) return;
        SFX.tone(n, len * STEP * 0.95, { type: 'triangle', vol: 0.13 });
        SFX.tone(n, len * STEP * 0.85, { type: 'square', vol: 0.02, detune: 9 });
      });
      if (bar === 4 && (s === 0 || s === 4)) {
        SFX.noise(0.28, { filter: 'bandpass', freq: s ? 700 : 950, q: 3, vol: 0.18 });
        SFX.tone(s ? 'A2' : 'D3', 0.3, { type: 'sawtooth', slide: s ? 'F2' : 'A2', vol: 0.06 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const beat = t * 2;
      const hop = Math.abs(Math.sin(Math.PI * beat));
      const heave = Math.pow(Math.cos((Math.PI * beat) / 2), 2);
      const barT = t % 2;

      // camera punch on every bar
      P.zoom(ctx, 1 + 0.022 * (1 - ease.outCubic(prog(barT, 0, 0.35))), 470, 1000);

      // sunset sky
      const g = ctx.createLinearGradient(0, 0, 0, 930);
      g.addColorStop(0, '#3E3478'); g.addColorStop(0.55, '#B5608E'); g.addColorStop(1, '#F6A77C');
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(-50, -50, 1180, 1000); ctx.restore();
      P.stars(ctx, t, 3, 16, '#FFE9A8', [0, 280, 1080, 260]);
      P.circle(ctx, 790, 880, 165, '#FFD27A', { shadow: { blur: 50, dy: 0, alpha: 0.35 } });
      [[808, 7], [842, 11], [876, 15], [906, 19]].forEach(([y, h]) => { ctx.save(); ctx.fillStyle = '#F4A57C'; ctx.fillRect(600, y, 380, h); ctx.restore(); });
      // clouds + gulls drifting (whole-screen loops per duration)
      [[0, 520, 0.8], [520, 380, 0.6], [1000, 640, 0.7]].forEach(([off, y, s], i) => {
        const x = ((off + (t / D) * 1500) % 1500) - 220;
        P.cloud(ctx, x, y, s, i === 1 ? '#F8C7B8' : '#FBD8C6');
      });
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
      [[0, 600], [650, 700]].forEach(([off, y], i) => {
        const x = ((off + (t / D) * 1300 * 2) % 1300) - 110;
        const fl = Math.sin(t * 12 + i) * 12;
        ctx.beginPath(); ctx.moveTo(x - 30, y - fl); ctx.quadraticCurveTo(x - 14, y - 16, x, y); ctx.quadraticCurveTo(x + 14, y - 16, x + 30, y - fl); ctx.stroke();
      });
      ctx.restore();

      // sea
      ctx.save(); ctx.fillStyle = '#2E4F8A'; ctx.fillRect(-50, 920, 1180, 1050); ctx.restore();
      wave(ctx, t, 930, 6, 140, 2, '#35599A', 1);
      ctx.save(); ctx.fillStyle = 'rgba(255,220,140,0.55)';
      for (let i = 0; i < 6; i++) { const w = 120 - i * 14 + Math.sin(t * 6 + i) * 20; ctx.fillRect(790 - w / 2, 945 + i * 14, w, 5); }
      ctx.restore();
      wave(ctx, t, 1010, 14, 300, -3, '#3F6DB3', 2);

      /* ---------------- the ship ---------------- */
      const shipY = 1015 + Math.sin((t * TAU) / 2) * 12 + hop * 3;
      const rot = Math.sin((t * TAU) / 2 - 0.8) * 0.035;
      ctx.save(); ctx.translate(470, shipY); ctx.rotate(rot);

      // hull
      P.poly(ctx, [[-410, -40], [-330, 0], [240, 0], [240, -62], [380, -62], [365, 40], [300, 150], [-270, 150]], C.brown, { seed: 11 });
      ctx.save(); ctx.strokeStyle = 'rgba(40,20,10,0.35)'; ctx.lineWidth = 5;
      [40, 85, 125].forEach((y) => { ctx.beginPath(); ctx.moveTo(-340 + y * 0.4, y); ctx.lineTo(350 - y * 0.35, y); ctx.stroke(); });
      ctx.restore();
      [-200, -60, 80, 210].forEach((px, i) => {
        P.circle(ctx, px, 62, 24, C.cream, { seed: 12 + i, shadow: false });
        P.circle(ctx, px, 62, 17, '#2B2A4A', { seed: 16 + i, shadow: false });
        if (i === 2) {
          ctx.save(); ctx.beginPath(); ctx.arc(px, 62, 17, 0, TAU); ctx.clip();
          P.claude(ctx, px, 70 - pulse(t % 3, 0.5, 1.5) * 10, 20, { t, mood: 'wow', wiggle: 0 });
          ctx.restore();
        }
      });
      P.text(ctx, 'S.S. PROD', 40, 112, { size: 38, font: 'marker', color: C.cream, shadow: false });
      // deck rail
      ctx.save(); ctx.strokeStyle = '#6E4630'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-390, -36); ctx.lineTo(-330, -30); ctx.lineTo(230, -30); ctx.stroke();
      for (let x = -300; x <= 220; x += 65) { ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x, 0); ctx.stroke(); }
      ctx.restore();

      // mast + flag
      P.rect(ctx, -16, -615, 32, 615, C.wood, { radius: 8, seed: 21 });
      const fl = Math.sin(t * 8) * 10, fl2 = Math.sin(t * 8 + 1.3) * 8;
      P.poly(ctx, [[16, -612], [150, -606 + fl], [135 + fl2 * 0.5, -578], [150, -548 + fl2], [16, -545]], C.ink, { seed: 22, amp: 2 });
      P.claude(ctx, 76, -578, 22, { mood: 'dead', color: '#fff', wiggle: 0 });

      // lookout in the crow's nest
      const spot = t >= 5.9 && t < 9.2;
      P.claude(ctx, 0, -525 - (spot ? 14 : 0), 36, { t, mood: spot ? 'wow' : 'side' });
      ctx.save(); ctx.translate(20, -530); ctx.rotate(-0.25 + (spot ? 0.45 : Math.sin(t * 1.5) * 0.2));
      P.rect(ctx, 0, -10, 70, 20, C.mustard, { radius: 8, seed: 23 }); P.rect(ctx, 60, -13, 16, 26, '#B37F2A', { radius: 5, seed: 24, shadow: false });
      ctx.restore();
      P.rect(ctx, -58, -505, 116, 50, C.brown, { radius: 10, seed: 25 });
      ctx.save(); ctx.strokeStyle = 'rgba(40,20,10,0.4)'; ctx.lineWidth = 4;
      for (let x = -40; x <= 40; x += 20) { ctx.beginPath(); ctx.moveTo(x, -500); ctx.lineTo(x, -460); ctx.stroke(); }
      ctx.restore();

      // sail
      const b = Math.sin((t * TAU * 5) / D) * 12;
      ctx.beginPath();
      ctx.moveTo(-180, -445); ctx.lineTo(180, -445);
      ctx.quadraticCurveTo(250 + b, -305, 198, -168); ctx.lineTo(-198, -168);
      ctx.quadraticCurveTo(-140 + b * 0.5, -305, -180, -445); ctx.closePath();
      P.cut(ctx, '#F4E9D2');
      ctx.save(); ctx.setLineDash([12, 12]); ctx.strokeStyle = 'rgba(138,90,60,0.35)'; ctx.lineWidth = 3;
      [-100, 0, 100].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, -440); ctx.quadraticCurveTo(x + 30 + b * 0.4, -305, x + 10, -172); ctx.stroke(); });
      ctx.restore();
      P.claude(ctx, 22, -380, 34, { t, mood: 'none', wiggle: 0.4 });
      P.text(ctx, 'SHIP IT', 26, -275, { size: 72, font: 'bubble', color: C.claudeDark, rot: -0.04, shadow: false });
      P.arm(ctx, -195, -450, 195, -450, 20, C.wood);
      P.arm(ctx, -210, -165, 210, -165, 20, C.wood);

      // halyard rope: down the mast, through a block, along the deck to the crew
      ctx.save(); ctx.strokeStyle = '#E9D3A6'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-24, -440); ctx.lineTo(-46, -102 + heave * 4);
      ctx.quadraticCurveTo(-220, -92 + heave * 6, -395 - heave * 14, -70); ctx.stroke();
      ctx.lineWidth = 7;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-370, -16 - i * 5, 34 - i * 4, 9, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
      P.circle(ctx, -46, -100, 14, '#6E4630', { seed: 26 });

      // the haulers
      [[-305, C.red, 3], [-222, C.blue, 5], [-139, C.green, 7]].forEach(([x, col, seed], i) => {
        const h = Math.abs(Math.sin(Math.PI * beat + i * 0.15));
        const bx = x - 16 * heave, by = -64 - 20 * h;
        const hx = bx + 50, hy = -98 + heave * 5;
        sailor(ctx, bx, by, 46, t, { band: col, seed, rot: -0.2 * heave, squash: h < 0.15 ? 0.25 * (1 - h / 0.15) : 0, mood: t >= 8 && t < 9 ? 'wow' : 'happy' });
        P.arm(ctx, bx + 12, by + 10, hx, hy, 13);
        P.arm(ctx, bx + 4, by + 20, hx + 16, hy + 3, 13);
      });

      // accordion player
      const ax = 110, ay = -64 - 18 * hop;
      sailor(ctx, ax, ay, 46, t, { band: C.purple, seed: 9, rot: Math.sin(Math.PI * beat) * 0.08, mood: 'smile' });
      const aw = 46 + 34 * (0.5 + 0.5 * Math.sin(Math.PI * beat));
      ctx.beginPath();
      const folds = 6;
      ctx.moveTo(ax - aw / 2, ay + 8);
      for (let i = 0; i <= folds; i++) ctx.lineTo(ax - aw / 2 + (aw * i) / folds, ay + (i % 2 ? 2 : 14));
      for (let i = folds; i >= 0; i--) ctx.lineTo(ax - aw / 2 + (aw * i) / folds, ay + (i % 2 ? 62 : 50));
      ctx.closePath();
      P.cut(ctx, C.cream, { stroke: 'rgba(43,34,51,0.4)', lineWidth: 3 });
      P.rect(ctx, ax - aw / 2 - 20, ay, 22, 66, C.red, { radius: 6, seed: 27 });
      P.rect(ctx, ax + aw / 2 - 2, ay, 22, 66, C.red, { radius: 6, seed: 28 });
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.7 + i / 3) % 1);
        P.text(ctx, i % 2 ? '♫' : '♪', ax + 40 + ph * 60 + Math.sin(ph * 9) * 12, ay - 60 - ph * 200, { size: 44, font: 'sans', color: `rgba(255,255,255,${1 - ph})`, shadow: false });
      }

      // captain at the wheel
      const cx = 318, cyy = -126 - 6 * hop;
      sailor(ctx, cx, cyy, 50, t, { hat: true, patch: true, seed: 13, mood: t >= 6 && t < 9 ? 'wow' : 'happy' });
      ctx.save(); ctx.translate(252, -104); ctx.rotate(Math.sin((t * TAU) / 2) * 0.4);
      ctx.strokeStyle = '#6E4630'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52); ctx.stroke(); }
      ctx.restore();
      P.arm(ctx, cx - 20, cyy + 20, 270, -130, 14);

      // bow splash on each bar
      if (barT < 0.7) {
        const r = P.rng(4);
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 - 0.3 - r() * 1.2, v = 200 + r() * 250;
          P.dot(ctx, -400 + Math.cos(a) * v * barT, 40 + Math.sin(a) * v * barT + 900 * barT * barT, 9 * (1 - barT), '#EAF5FF');
        }
      }
      ctx.restore();

      wave(ctx, t, 1140, 22, 420, 4, '#4F7FD9', 3, true);

      // the CI whale
      const rise = ease.outBack(prog(t, 6.0, 0.9)) * (1 - ease.inCubic(prog(t, 9.1, 0.8)));
      if (rise > 0.001) whale(ctx, t, 470, lerp(1780, 1330, rise) + Math.sin(t * 2) * 6, rise);
      const sp = t - 6.0;
      if (sp > 0 && sp < 0.8) {
        const r = P.rng(12);
        for (let i = 0; i < 16; i++) {
          const a = -Math.PI / 2 + (r() - 0.5) * 2.4, v = 300 + r() * 500;
          P.dot(ctx, 470 + (r() - 0.5) * 500 + Math.cos(a) * v * sp, 1300 + Math.sin(a) * v * sp + 1400 * sp * sp, 12 * (1 - sp), '#EAF5FF');
        }
      }

      wave(ctx, t, 1405, 30, 520, -5, '#6C9BE8', 4, true);

      karaoke(ctx, t);

      // speech + stickers
      if (t < 5.6) P.sticker(ctx, 'the pipeline has been at sea for 45 min', 60, 318, { size: 42, pop: ease.outBack(prog(t, 0.3, 0.4)) * (1 - ease.inCubic(prog(t, 5.2, 0.4))) });
      const lookY = shipY - 540;
      if (env.between(4, 5.9)) P.bubble(ctx, 'LGTM ahoy! 🔭', 760, lookY - 60, 510, lookY - 10, { size: 50, pop: ease.outBack(prog(t, 4.05, 0.3)) });
      if (env.between(6.1, 8)) P.bubble(ctx, 'THAR SHE BUILDS!!', 740, lookY - 60, 510, lookY - 10, { size: 52, pop: ease.outBack(prog(t, 6.1, 0.3)) });
      if (env.between(8.05, 9.4)) {
        P.title(ctx, 'ALL CHECKS\nPASSED', 470, 720, { size: 110, color: C.green, rot: -0.05, pop: ease.outBack(prog(t, 8.05, 0.4)) * (1 - ease.inCubic(prog(t, 9.1, 0.3))) });
        P.confetti(ctx, t - 8.05, 470, 700, 5, 50, 650);
      }
      P.flash(ctx, (1 - prog(t, 8.02, 0.25)) * (t >= 8.02 ? 0.5 : 0));

      // one-shots
      if (env.at(4.02)) SFX.pop({ vol: 0.15 });
      if (env.at(5.95)) { SFX.whoosh({ vol: 0.25 }); SFX.tone(190, 1.3, { type: 'sine', slide: 110, vol: 0.14, attack: 0.25 }); }
      if (env.at(6.1)) SFX.pop({ f: 700, vol: 0.15 });
      [6.8, 7.2, 7.6, 8.0].forEach((ct, i) => { if (env.at(ct)) SFX.blip(['D5', 'F5', 'A5', 'D6'][i], { vol: 0.08 }); });
      if (env.at(8.02)) { SFX.success({ vol: 0.16 }); SFX.noise(0.9, { filter: 'highpass', freq: 1200, slide: 300, vol: 0.12 }); }
      if (env.at(9.1)) SFX.swoosh({ vol: 0.18 });
    },
  });
})();
