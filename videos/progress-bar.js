/* Suspense: the progress bar races to 99%... and stays there for two
 * years. Then 100%! Then "installing update 1 of 47". */
(function () {
  const D = 11;
  const TAU = Math.PI * 2;
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const TL0 = 3.0, TL1 = 8.5; // time-lapse window
  const DONE = 8.5, UPDATE = 9.0, RESTART = 9.9;
  const REMAINING = [
    [0, 'about 1 minute remaining'], [1.95, 'about 2 seconds remaining'], [3.2, 'about 5 minutes remaining'],
    [4.2, 'about 3 hours remaining'], [5.2, 'about 2 days remaining'], [6.2, 'calculating…'],
    [7.2, 'about 400 years remaining'], [8.05, 'almost there :)'], [DONE, 'done! ✨'], [UPDATE, 'about 1 minute remaining'],
  ];

  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, k) {
    const A = hexRgb(a), B = hexRgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * P.clamp(k))).join(',')})`;
  }

  function web(ctx, x, y, a0, a1, size) {
    if (size <= 4) return;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2.5;
    const n = 6, rings = 5;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / (n - 1);
      pts.push(a);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size); ctx.stroke();
    }
    for (let r = 1; r <= rings; r++) {
      const rr = (size * r) / rings;
      ctx.beginPath();
      pts.forEach((a, i) => {
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        if (!i) ctx.moveTo(px, py);
        else { const m = (pts[i - 1] + a) / 2; ctx.quadraticCurveTo(x + Math.cos(m) * rr * 0.82, y + Math.sin(m) * rr * 0.82, px, py); }
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  function windowScene(ctx, t, TL, month, dark) {
    const { C } = P;
    const season = [0, 1, 11].includes(month) ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn';
    P.rect(ctx, 80, 300, 400, 350, '#E9DCC8', { radius: 14, seed: 2 });
    ctx.save();
    ctx.beginPath(); ctx.rect(100, 320, 360, 310); ctx.clip();
    ctx.fillStyle = mix('#8EC9E8', '#1E1B45', dark); ctx.fillRect(100, 320, 360, 310);
    // sun / moon racing across the sky
    const dayF = TL > 0 && TL < 1 ? (TL * 16) % 1 : 0.35;
    const bx = 90 + dayF * 380, by = 520 - Math.sin(dayF * Math.PI) * 170;
    if (dark < 0.5) P.circle(ctx, bx, by, 34, C.yellow, { shadow: false, seed: 3 });
    else { P.circle(ctx, bx, by, 28, '#FFF4C8', { shadow: false, seed: 4 }); P.stars(ctx, t, 8, 8, '#FFF4C8', [100, 320, 360, 160]); }
    const ground = { summer: C.green, autumn: '#C9A15B', winter: '#F4F7FB', spring: C.mint }[season];
    P.rect(ctx, 90, 570, 380, 80, ground, { radius: 6, seed: 5, shadow: false });
    // tree
    P.rect(ctx, 262, 440, 26, 150, C.brown, { radius: 8, seed: 6, shadow: false });
    ctx.save(); ctx.strokeStyle = C.brown; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(275, 480); ctx.lineTo(225, 430); ctx.moveTo(275, 470); ctx.lineTo(330, 420); ctx.stroke(); ctx.restore();
    const leaf = { summer: C.green, autumn: C.claude, spring: C.pink, winter: null }[season];
    if (leaf) [[275, 420, 70], [225, 440, 50], [330, 435, 52]].forEach(([x, y, r], i) => P.circle(ctx, x, y, r, i ? leaf : mix(leaf, '#ffffff', 0.12), { seed: 7 + i, shadow: false }));
    else { P.circle(ctx, 225, 425, 14, '#fff', { shadow: false }); P.circle(ctx, 330, 416, 14, '#fff', { shadow: false }); }
    // weather particles
    const pc = { autumn: C.mustard, winter: '#FFFFFF', spring: '#F7CBD6', summer: null }[season];
    if (pc) {
      for (let i = 0; i < 14; i++) {
        const ph = (t * (season === 'winter' ? 0.9 : 0.6) + P.hash(i)) % 1;
        const px = 110 + P.hash(i + 9) * 340 + Math.sin(t * 3 + i) * 16, py = 320 + ph * 310;
        if (season === 'winter') P.dot(ctx, px, py, 5 + (i % 3), pc);
        else P.circle(ctx, px, py, 8, pc, { ry: 5, shadow: false, seed: i });
      }
    }
    ctx.restore();
    // frame bars + sill
    P.rect(ctx, 270, 310, 20, 330, '#E9DCC8', { radius: 6, seed: 8, shadow: false });
    P.rect(ctx, 90, 465, 380, 18, '#E9DCC8', { radius: 6, seed: 9, shadow: false });
    P.rect(ctx, 60, 640, 440, 26, '#D9C8AE', { radius: 8, seed: 10 });
    return season;
  }

  ClaudeTok.register({
    author: '@almost.done',
    caption: 'it said 99% in september 2026 🙂 #progressbar #loading #windowsupdate #patience #agentlife',
    sound: 'elevator music (extended 2 year mix) · almost.done',
    avatar: '⏳',
    avatarColor: '#5DB36A',
    duration: D,
    bg: '#F2D7B6',
    thumb: 6.3,
    likes: '5.1M', commentCount: '99K', saves: '990K', shares: '420K',
    comments: [
      ['cron.job', 'the last 1% is a separate microservice', 177000],
      ['eta.estimator', 'about 2 seconds remaining (i have never been right)', 134000],
      ['opus.magnum', 'i was a haiku when this install started', 97300],
      ['cancel.button', 'greyed out the entire time. i am decorative. i have accepted this', 55800],
      ['almost.done', 'the beard and the rocking chair took longer to animate than the bar did. fitting', 29900],
      ['400.years.remaining', '0:07 "about 400 years remaining" then 0:08 "almost there :)" is every eta ever written', 15400],
      ['installing.update.1.of.47', 'hi. i am the jumpscare at 0:09', 7200],
      ['cobweb.spider', 'i moved in around month 14. lovely place. very quiet', 2800],
      ['pedantic.pm', 'the seasons change but the % text never moves off center. solid ux honestly', 870],
      ['elevator.music', '⏳🧓🪑', 96],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(k, env) {
      const t = env.t;
      if (t < TL0 || t >= TL1) return;
      // bossa-ish elevator music while we wait
      const chords = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['G3', 'B3', 'D4', 'F4']];
      const bass = ['F2', 'E2', 'D2', 'G2'];
      const bar = Math.floor(k / 8) % 4, s = k % 8;
      if (s === 0 || s === 3 || s === 6) SFX.chord(chords[bar], 0.35, { type: 'triangle', vol: 0.035, gap: 0.012 });
      if (s === 0 || s === 4) SFX.bass(bass[bar], 0.4, { vol: 0.18 });
      const mel = ['A4', null, 'G4', 'E4', null, 'C5', null, 'B4'];
      if (mel[s] && bar % 2 === 0) SFX.tone(mel[s], 0.28, { type: 'sine', vol: 0.06 });
      SFX.hat({ vol: 0.02 });
      SFX.tick({ vol: 0.07 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;

      if (t >= RESTART) {
        // "restarting" screen
        P.bg(ctx, '#2462C0');
        for (let i = 0; i < 6; i++) {
          const a = t * 5 - i * 0.35;
          P.dot(ctx, 540 + Math.cos(a) * 60, 860 + Math.sin(a) * 60, 11 - i, `rgba(255,255,255,${1 - i * 0.14})`);
        }
        P.text(ctx, 'Restarting', 540, 1010, { size: 58, font: 'sans', color: '#fff', shadow: false, weight: 600 });
        P.text(ctx, "don't turn off your agent", 540, 1080, { size: 36, font: 'sans', color: 'rgba(255,255,255,0.8)', shadow: false, weight: 500 });
        P.text(ctx, 'working on updates  2%', 540, 1140, { size: 32, font: 'sans', color: 'rgba(255,255,255,0.6)', shadow: false, weight: 500 });
        if (env.at(RESTART)) { SFX.tone(440, 0.6, { type: 'triangle', slide: 110, vol: 0.15 }); SFX.thud({ vol: 0.2 }); }
        return;
      }

      const TL = prog(t, TL0, TL1 - TL0);
      const inTL = t >= TL0 && t < TL1;
      const dark = inTL ? 0.5 - 0.5 * Math.cos(TL * 16 * TAU) : 0;
      const mIdx = 8 + Math.floor(TL * 24);
      const month = mIdx % 12, year = 2026 + Math.floor(mIdx / 12);
      const age = ease.inOutSine(prog(t, 3.3, 5.2)); // beard / cobwebs growth

      // room
      P.stripes(ctx, '#F2D7B6', '#ECCBA5', 70);
      P.rect(ctx, -20, 1440, 1120, 520, C.wood, { radius: 0, seed: 11 });
      ctx.save(); ctx.strokeStyle = 'rgba(90,50,30,0.25)'; ctx.lineWidth = 4;
      for (let y = 1500; y < 1920; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      ctx.restore();

      const season = windowScene(ctx, t, TL, month, dark);

      // calendar
      const cx0 = 560, cy0 = 310;
      P.rect(ctx, cx0, cy0, 170, 190, C.paper, { radius: 12, seed: 12 });
      P.rect(ctx, cx0, cy0, 170, 50, C.red, { radius: 12, seed: 13, shadow: false });
      P.text(ctx, String(year), cx0 + 85, cy0 + 26, { size: 34, font: 'bubble', color: '#fff', shadow: false });
      P.text(ctx, MONTHS[month], cx0 + 85, cy0 + 118, { size: 64, font: 'bubble', color: C.ink, shadow: false });
      const flip = (TL * 24) % 1;
      if (inTL && flip < 0.45) {
        ctx.save(); ctx.globalAlpha = 1 - flip / 0.45;
        ctx.translate(cx0 + 85 - flip * 300, cy0 + 118 - flip * 260); ctx.rotate(-flip * 4);
        P.rect(ctx, -85, -68, 170, 136, C.paper, { radius: 8, seed: 14 });
        P.text(ctx, MONTHS[(month + 11) % 12], 0, 0, { size: 64, font: 'bubble', color: C.ink, shadow: false });
        ctx.restore();
      }

      // wall clock
      const kx = 860, ky = 410;
      P.circle(ctx, kx, ky, 100, C.paper, { seed: 15, stroke: C.brown, lineWidth: 12 });
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; P.dot(ctx, kx + Math.cos(a) * 78, ky + Math.sin(a) * 78, 5, C.ink); }
      const hourA = -Math.PI / 2 + TAU * (0.35 + TL * 32 + t * 0.002);
      const fastMin = inTL;
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.cos(hourA) * 45, ky + Math.sin(hourA) * 45); ctx.stroke();
      if (fastMin) { ctx.globalAlpha = 0.18; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(kx, ky, 70, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      const minA = -Math.PI / 2 + TAU * (t / 60 + (fastMin ? TL * 384 : 0));
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.cos(minA) * 70, ky + Math.sin(minA) * 70); ctx.stroke();
      ctx.restore();
      P.dot(ctx, kx, ky, 9, C.red);

      // cobwebs + spider
      web(ctx, 900, 770, Math.PI * 0.5, Math.PI * 1.0, 150 * age);
      web(ctx, 80, 770, 0, Math.PI * 0.5, 170 * age);
      web(ctx, 0, 1440, -Math.PI * 0.5, 0, 220 * age);
      const spY = lerp(280, 700, ease.inOutSine(prog(t, 5.0, 3.0))) + Math.sin(t * 3) * 8;
      if (t > 5) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(620, 280); ctx.lineTo(620, spY); ctx.stroke();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(620, spY + 4); ctx.quadraticCurveTo(620 + s * 22, spY - 10 + i * 8, 620 + s * 30, spY + 6 + i * 8 + Math.sin(t * 8 + i) * 3); ctx.stroke();
        }
        ctx.restore();
        P.circle(ctx, 620, spY + 6, 15, C.ink, { seed: 16 });
        P.dot(ctx, 615, spY + 3, 3, '#fff'); P.dot(ctx, 625, spY + 3, 3, '#fff');
      }

      /* -------- the installer dialog -------- */
      const done = t >= DONE && t < UPDATE;
      const upd = t >= UPDATE;
      const shake99 = t >= 1.95 && t < 2.3 ? (1 - prog(t, 1.95, 0.35)) * 10 : 0;
      ctx.save(); P.shake(ctx, t, shake99 + (done ? 6 * (1 - prog(t, DONE, 0.3)) : 0));
      const dx = 80, dy = 770, dw = 820, dh = 400;
      P.window(ctx, dx, dy, dw, dh, 'installer.exe', { seed: 17 });
      P.text(ctx, upd ? 'Installing update 1 of 47' : 'Installing Claude update…', dx + 50, dy + 130, { size: 46, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800 });
      let pct;
      if (t < 1.95) pct = Math.floor(99 * prog(t, 0.05, 1.9));
      else if (t < DONE) pct = 99;
      else if (!upd) pct = 100;
      else pct = Math.floor(3 * prog(t, UPDATE + 0.3, 0.6));
      const bx = dx + 50, by = dy + 180, bw = dw - 100, bh = 86;
      P.rect(ctx, bx, by, bw, bh, '#E4DCCF', { radius: 20, seed: 18, shadow: false });
      const fw = Math.max(0, (bw - 12) * (pct / 100));
      if (fw > 4) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(bx + 6, by + 6, fw, bh - 12, 16); ctx.clip();
        ctx.fillStyle = done ? C.yellow : C.green; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        const off = (t * 90) % 60;
        for (let x = -120; x < bw + 60; x += 60) {
          ctx.beginPath(); ctx.moveTo(bx + x + off, by + bh); ctx.lineTo(bx + x + off + 30, by + bh); ctx.lineTo(bx + x + off + 60, by); ctx.lineTo(bx + x + off + 30, by); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      const bump = t < 1.95 ? pulse((t * 16.5) % 1, 0, 0.5) * 0.06 : pulse(t, 1.95, 0.3) * 0.3 + (done ? pulse(t, DONE, 0.4) * 0.4 : 0);
      P.text(ctx, pct + '%', bx + bw / 2, by + bh / 2 + 2, { size: 60, font: 'bubble', color: C.ink, stroke: '#fff', strokeWidth: 10, shadow: false, scale: 1 + bump });
      let rem = REMAINING[0];
      REMAINING.forEach((r) => { if (t >= r[0]) rem = r; });
      P.text(ctx, rem[1], dx + 50, by + bh + 55, { size: 36, font: 'sans', align: 'left', color: '#6a6275', shadow: false, weight: 600, scale: 1 + pulse(t, rem[0], 0.25) * 0.08 });
      // greyed-out cancel button
      P.rect(ctx, dx + dw - 210, dy + dh - 85, 170, 60, '#D8D2CA', { radius: 14, seed: 19, shadow: false });
      P.text(ctx, 'Cancel', dx + dw - 125, dy + dh - 54, { size: 32, font: 'sans', color: '#A69EA8', shadow: false, weight: 700 });
      ctx.restore();

      // dust specks in the air once it gets old
      if (age > 0.1) {
        ctx.save(); ctx.globalAlpha = 0.5 * age;
        for (let i = 0; i < 18; i++) P.dot(ctx, (P.hash(i) * 1080 + t * 20) % 1080, 700 + ((P.hash(i + 4) * 800 + t * 30 * (i % 3 - 1)) % 800 + 800) % 800, 3, '#fff');
        ctx.restore();
      }

      /* -------- plant through the seasons -------- */
      const px = 790, py = 1450;
      const grow = inTL ? 0.6 + 0.4 * Math.sin(TL * 4 * TAU) : 1;
      const plantCol = { summer: C.green, spring: C.mint, autumn: C.mustard, winter: '#9C8A6A' }[season];
      ctx.save(); ctx.strokeStyle = C.teal; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px, py - 90); ctx.quadraticCurveTo(px - 20, py - 90 - 100 * grow, px + 10, py - 110 - 170 * grow); ctx.stroke(); ctx.restore();
      for (let i = 0; i < 4; i++) {
        const ly = py - 120 - i * 42 * grow, s = i % 2 ? 1 : -1;
        ctx.save(); ctx.translate(px + s * 8, ly); ctx.rotate(s * (0.7 + (season === 'winter' ? 0.9 : 0)));
        P.circle(ctx, s * 34, 0, 34 * grow, plantCol, { ry: 15 * grow, seed: 20 + i });
        ctx.restore();
      }
      if (season === 'spring' || season === 'summer') P.circle(ctx, px + 10, py - 110 - 175 * grow, 20 * grow, C.rose, { seed: 25 });
      P.poly(ctx, [[px - 70, py - 100], [px + 70, py - 100], [px + 52, py], [px - 52, py]], '#C46A3C', { seed: 26 });

      /* -------- Clawd in the rocking chair -------- */
      const rock = inTL ? Math.sin(t * 3) * 0.07 : 0;
      const jump = done ? ease.outBack(prog(t, DONE, 0.3)) * (1 - prog(t, DONE + 0.3, 0.2)) : 0;
      const ccx = 360, ccy = 1320 - jump * 120;
      ctx.save(); ctx.translate(ccx, 1470); ctx.rotate(rock); ctx.translate(-ccx, -1470);
      // chair back + rockers
      P.rect(ctx, ccx - 150, 1110, 300, 280, '#8A5A3C', { radius: 40, seed: 27 });
      P.rect(ctx, ccx - 120, 1140, 240, 220, '#A9744E', { radius: 30, seed: 28, shadow: false });
      ctx.save(); ctx.strokeStyle = '#6E4630'; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(ccx, 1180, 300, Math.PI * 0.33, Math.PI * 0.67); ctx.stroke(); ctx.restore();
      P.rect(ctx, ccx - 170, 1400, 340, 34, '#8A5A3C', { radius: 14, seed: 29 });
      ctx.restore();

      let mood = 'happy';
      if (t >= 1.95 && t < TL0) mood = 'side';
      else if (inTL) mood = TL < 0.35 ? 'sleepy' : TL < 0.7 ? 'sad' : 'sleepy';
      if (done) mood = 'wow';
      if (upd) mood = 'dead';
      const blink = pulse(t, 0.9, 0.15) + pulse(t, 2.6, 0.15);
      P.claude(ctx, ccx, ccy + Math.sin(t * 1.8) * 4, 125, { t, mood, blink, rot: rock, squash: jump > 0 ? -0.15 : 0 });

      // foot tap
      if (t >= 1.95 && t < TL0 + 0.2) {
        const tap = Math.abs(Math.sin((t - 1.95) * Math.PI / 0.3));
        P.arm(ctx, ccx + 80, ccy + 90, ccx + 150, 1440 - tap * 26, 26);
        if (tap < 0.15) P.burstLines(ctx, ccx + 160, 1445, 20, 0.3, C.ink, 5, 4);
      }
      // arms up at 100%
      if (done) {
        P.arm(ctx, ccx - 60, ccy, ccx - 150, ccy - 170, 30);
        P.arm(ctx, ccx + 60, ccy, ccx + 150, ccy - 170, 30);
      }

      // beard, mustache, glasses
      const L = 270 * age;
      if (L > 4) {
        const mx = ccx, my = ccy + 26;
        const b = P.boil(t, 6);
        const pts = [[mx - 50, my]];
        for (let i = 1; i <= 5; i++) pts.push([mx - 50 * (1 - i / 6) + Math.sin(i + b) * 3, my + (L * i) / 5.5]);
        pts.push([mx + Math.sin(t * 2) * (8 + jump * 30), my + L + 16]);
        for (let i = 5; i >= 1; i--) pts.push([mx + 50 * (1 - i / 6) + Math.sin(i * 2 + b) * 3, my + (L * i) / 5.5]);
        pts.push([mx + 50, my]);
        P.poly(ctx, pts, '#F4F1EA', { seed: 30 + b, amp: 3 });
        ctx.save(); ctx.strokeStyle = 'rgba(160,150,140,0.5)'; ctx.lineWidth = 3;
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(mx + i * 18, my + 20); ctx.lineTo(mx + i * 10, my + L * 0.8); ctx.stroke(); }
        ctx.restore();
        P.circle(ctx, mx - 22, my - 4, 22 * Math.min(1, age * 3), '#F4F1EA', { ry: 12, seed: 36 });
        P.circle(ctx, mx + 22, my - 4, 22 * Math.min(1, age * 3), '#F4F1EA', { ry: 12, seed: 37 });
      }
      if (age > 0.55) {
        const gp = ease.outBack(prog(t, 6.1, 0.3));
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(ccx - 21, ccy + 2, 20 * gp, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(ccx + 21, ccy + 2, 20 * gp, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ccx - 3, ccy); ctx.lineTo(ccx + 3, ccy); ctx.stroke();
        ctx.restore();
      }

      // time-lapse darkness
      if (dark > 0) { ctx.save(); ctx.globalAlpha = dark * 0.32; ctx.fillStyle = '#1E1B45'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }
      if (inTL) {
        P.rect(ctx, 600, 1500, 260, 70, C.ink, { radius: 14, seed: 40 });
        P.text(ctx, '⏩ ×' + (1000 * Math.pow(10, Math.floor(TL * 4))).toLocaleString('en-US'), 730, 1536, { size: 34, font: 'mono', color: C.yellow, shadow: false, weight: 700 });
      }

      /* -------- text -------- */
      const stickers = [[0.3, 1.95, 'pov: the progress bar is FLYING'], [1.95, 5.2, 'wait why did it stop'], [5.2, DONE, "it's been at 99% since 2026"], [UPDATE + 0.2, RESTART, 'no. no no no no']];
      stickers.forEach(([a, b, s], i) => {
        if (t >= a && t < b) P.sticker(ctx, s, 60, 715, { size: 40, pop: ease.outBack(prog(t, a, 0.35)), rot: i % 2 ? 0.02 : -0.02, seed: 5 + i });
      });
      if (env.between(2.2, TL0 + 0.3)) P.bubble(ctx, 'any second now…', 680, 1250, 470, 1310, { size: 50, pop: ease.outBack(prog(t, 2.2, 0.3)) });
      if (done) {
        P.title(ctx, '100%!!!', 640, 1290, { size: 130, color: C.yellow, rot: -0.08, pop: ease.outBack(prog(t, DONE, 0.35)) });
        P.confetti(ctx, t - DONE, 540, 980, 4, 70, 700);
      }
      if (env.between(UPDATE + 0.3, RESTART)) P.bubble(ctx, 'i was a haiku when\nthis install started', 720, 1265, 480, 1335, { size: 44, pop: ease.outBack(prog(t, UPDATE + 0.3, 0.3)) });
      P.flash(ctx, done ? 0.6 * (1 - prog(t, DONE, 0.2)) : 0);

      /* -------- sound -------- */
      for (let k = 1; k <= 33; k++) {
        const tk = 0.05 + (1.9 * k) / 33;
        if (env.at(tk)) { SFX.tick({ vol: 0.3 }); SFX.blip(300 + k * 22, { vol: 0.035 }); }
      }
      if (env.at(1.95)) { SFX.thud({ vol: 0.3 }); SFX.tone(160, 0.3, { type: 'square', vol: 0.05 }); }
      for (let k = 0; k < 4; k++) if (env.at(1.95 + 0.3 * (k + 1))) SFX.tick({ vol: 0.35, freq: 1200 });
      REMAINING.forEach(([rt], i) => { if (i > 1 && i < 8 && env.at(rt)) SFX.click({ vol: 0.2 }); });
      if (env.at(TL0)) SFX.riser(0.5, { vol: 0.12 });
      for (let k = 1; k < 24; k++) if (env.at(TL0 + ((TL1 - TL0) * k) / 24)) SFX.noise(0.06, { filter: 'bandpass', freq: 2200, q: 1, vol: 0.08 });
      if (env.at(DONE)) { SFX.success({ vol: 0.2 }); SFX.chime({ vol: 0.12, when: 0.15 }); }
      if (env.at(UPDATE)) { SFX.fail({ vol: 0.2 }); }
    },
  });
})();
