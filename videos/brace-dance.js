/* New dance trend just dropped: four googly-eyed curly braces on a disco floor.
 * 120 bpm, a new move every 2 beats (1s), 8 moves, then it loops. */
(function () {
  const TAU = Math.PI * 2;
  const W8 = TAU / 8; // one full cycle per loop (8s), so every wiggle loops cleanly
  const COLS = ['#F7B2C8', '#8FD3B6', '#C9B6FF', '#F5D46B'];
  const GLYPH = ['{', '}', '{', '}'];
  const BX = [200, 400, 620, 820];
  const FEET = 1185;
  const MOVES = ['the bounce', 'the side step', 'the spin', 'the wave', 'the jump', 'the lean', 'the {} hug', 'the pose'];
  const LEAD = ['E5', 0, 'G5', 0, 'C6', 0, 'G5', 'E5', 'A5', 0, 'C6', 0, 'E6', 0, 'C6', 0,
    'F5', 0, 'A5', 0, 'C6', 0, 'A5', 'F5', 'G5', 0, 'B5', 0, 'D6', 'B5', 'G5', 0];
  const ROOTS = [['C2', 'C3'], ['A1', 'A2'], ['F1', 'F2'], ['G1', 'G2']];

  /* one dancer's pose for move m at beat b (i = which brace) */
  function pose(m, b, i) {
    const s = Math.abs(Math.sin(Math.PI * b)); // 0 on each beat, 1 halfway
    const w = Math.sin(Math.PI * b);           // -1..1, flips every beat
    const side = i % 2 ? 1 : -1;               // '{' = -1, '}' = +1
    const o = { dx: 0, dy: 0, rot: 0, sq: 0, spin: 0, aL: 0.5, aR: 0.5, leg: 0 };
    switch (m) {
      case 0: // bounce
        o.dy = -s * 45; o.sq = (1 - s) * 0.16; o.aL = o.aR = 0.5 + s * 0.9; break;
      case 1: // side step
        o.dx = w * 55; o.rot = w * 0.12; o.dy = -s * 14; o.aL = 1.3 - w * 0.7; o.aR = 1.3 + w * 0.7; o.leg = w; break;
      case 2: { // spin (a paper-flip: { becomes } halfway round)
        const mp = (b % 2) / 2;
        o.spin = P.ease.inOutCubic(mp) * TAU; o.dy = -Math.sin(Math.PI * mp) * 70; o.aL = o.aR = 1.5 + Math.sin(Math.PI * mp); break;
      }
      case 3: { // the wave
        const ws = Math.abs(Math.sin(Math.PI * (b - i * 0.25)));
        o.dy = -ws * 80; o.sq = (1 - ws) * 0.1; o.aL = o.aR = 0.4 + ws * 2.3; break;
      }
      case 4: // jump
        o.dy = -s * 130; o.sq = s < 0.3 ? (0.3 - s) * 0.7 : -s * 0.1; o.aL = o.aR = 0.5 + s * 2.4; o.leg = s * 0.8; break;
      case 5: // lean
        o.rot = w * 0.36; o.dx = w * 25; o.aL = 1.4 + w * 1.1; o.aR = 1.4 - w * 1.1; o.dy = -s * 10; break;
      case 6: // the {} hug: each pair closes into an object literal
        o.dx = -side * s * 72; o.dy = -s * 18;
        if (side < 0) { o.aR = 1.5 + s * 0.5; o.aL = 0.6; } else { o.aL = 1.5 + s * 0.5; o.aR = 0.6; }
        break;
      case 7: // the pose (freeze on beat 1, bounce on beat 2)
        if (b % 2 < 1) {
          const k = P.ease.outBack(P.clamp((b % 1) / 0.25));
          o.aL = P.lerp(0.5, side < 0 ? 2.8 : 0.3, k); o.aR = P.lerp(0.5, side < 0 ? 0.3 : 2.8, k);
          o.rot = side * 0.14 * k; o.dy = -12 * k; o.leg = side * 0.8 * k;
        } else { o.dy = -s * 45; o.sq = (1 - s) * 0.16; o.aL = o.aR = 0.5 + s * 0.9; }
        break;
    }
    return o;
  }

  /* blend out of the previous move over the first 0.3 beats */
  function blended(b, i) {
    const m = Math.floor(b / 2) % 8, prev = (m + 7) % 8;
    const cur = pose(m, b, i);
    const k = P.ease.outCubic(P.clamp((b % 2) / 0.3));
    if (k >= 1) return cur;
    const pr = pose(prev, b, i);
    for (const key in cur) cur[key] = P.lerp(pr[key], cur[key], k);
    return cur;
  }

  function limb(ctx, x1, y1, x2, y2, w, col) {
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + (y2 - y1) * 0.12, (y1 + y2) / 2 - (x2 - x1) * 0.12, x2, y2);
    ctx.stroke(); ctx.restore();
  }

  function dancer(ctx, i, o, t) {
    const { C } = P;
    const x = BX[i] + o.dx, y = FEET + o.dy;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot);
    const c = Math.cos(o.spin);
    const flip = Math.abs(c) < 0.05 ? 0.05 * (c < 0 ? -1 : 1) : c;
    ctx.scale(flip * (1 + o.sq * 0.7), 1 - o.sq);
    ctx.translate(0, -215);

    // legs + sneakers
    const lg = o.leg * 22;
    limb(ctx, -24, 105, -40 + lg, 200, 15, C.ink);
    limb(ctx, 24, 105, 40 + lg, 200, 15, C.ink);
    P.circle(ctx, -52 + lg, 206, 26, '#fff', { ry: 15, seed: i * 3 + 1, shadow: { blur: 4, dy: 3, alpha: 0.3 } });
    P.circle(ctx, 52 + lg, 206, 26, '#fff', { ry: 15, seed: i * 3 + 2, shadow: { blur: 4, dy: 3, alpha: 0.3 } });

    // arms + white cartoon gloves
    const arm = (sx0, a, sd) => {
      const hx = sx0 + sd * Math.sin(a) * 86, hy = -12 + Math.cos(a) * 86;
      limb(ctx, sx0, -12, hx, hy, 13, C.ink);
      P.circle(ctx, hx, hy, 19, '#fff', { shadow: { blur: 4, dy: 3, alpha: 0.3 }, seed: i + 7 });
    };
    arm(-44, o.aL, -1); arm(44, o.aR, 1);

    // the brace itself
    P.text(ctx, GLYPH[i], 0, 0, { size: 330, font: 'bubble', color: COLS[i], stroke: C.paper, strokeWidth: 24 });

    // googly eyes (pupils rattle around)
    [-30, 30].forEach((ex, k) => {
      P.circle(ctx, ex, -62, 30, '#fff', { shadow: { blur: 4, dy: 3, alpha: 0.25 }, stroke: C.ink, lineWidth: 5, seed: i * 2 + k, amp: 1.5 });
      const jx = Math.sin(t * W8 * 11 + i * 1.7 + k) * 8, jy = Math.cos(t * W8 * 9 + i + k * 2) * 7;
      P.dot(ctx, ex + jx, -56 + jy, 13, C.ink);
      P.dot(ctx, ex + jx - 4, -60 + jy, 4, '#fff');
    });
    // blush + smile
    ctx.save();
    ctx.fillStyle = 'rgba(240,110,120,0.5)';
    ctx.beginPath(); ctx.ellipse(-44, -20, 13, 8, 0, 0, TAU); ctx.ellipse(44, -20, 13, 8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -22, 15, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function discoBall(ctx, x, y, r, t) {
    ctx.save();
    ctx.strokeStyle = '#d8d2ea'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - r - 10); ctx.stroke();
    ctx.restore();
    P.rect(ctx, x - 16, y - r - 24, 32, 30, '#9a96ad', { radius: 6, seed: 3 });
    P.circle(ctx, x, y, r, '#b9b7c9', { seed: 8, shadow: { blur: 30, dy: 10, alpha: 0.4 } });
    ctx.save();
    P.wobblyCircle(ctx, x, y, r - 3, 8, 2); ctx.clip();
    const rows = 9, cols = 14, rot = t * W8, half = Math.PI / cols;
    for (let k = 0; k < rows; k++) {
      const lat0 = -Math.PI / 2 + (k / rows) * Math.PI, lat1 = lat0 + Math.PI / rows;
      const y0 = y + Math.sin(lat0) * r, y1 = y + Math.sin(lat1) * r;
      const rw = Math.cos((lat0 + lat1) / 2) * r;
      for (let m = 0; m < cols; m++) {
        let am = (m / cols) * TAU + rot + half;
        am = ((am + Math.PI) % TAU + TAU) % TAU - Math.PI;
        if (Math.abs(am) > Math.PI / 2 + half) continue;
        const x0 = Math.sin(P.clamp(am - half, -Math.PI / 2, Math.PI / 2)) * rw;
        const x1 = Math.sin(P.clamp(am + half, -Math.PI / 2, Math.PI / 2)) * rw;
        if (x1 - x0 < 2) continue;
        const glint = P.hash(k * 31 + m * 7 + P.boil(t, 6)) > 0.93;
        const v = Math.round(140 + P.hash(k * 17 + m * 5) * 55 + Math.max(0, -Math.sin(lat0) * 40 - am * 25));
        ctx.fillStyle = glint ? '#ffffff' : `rgb(${v},${v},${Math.min(255, v + 18)})`;
        ctx.fillRect(x + x0 + 1.5, y0 + 1.5, x1 - x0 - 3, y1 - y0 - 3);
      }
    }
    ctx.restore();
    P.star(ctx, x - r * 0.42, y - r * 0.42, 24 + 8 * Math.sin(t * W8 * 12), '#fff', { points: 4, inner: 0.25, shadow: false });
  }

  function spot(ctx, sx, sy, ang, col) {
    const L = 1800, half = 0.15;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.13; ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang - half) * L, sy + Math.sin(ang - half) * L);
    ctx.lineTo(sx + Math.cos(ang + half) * L, sy + Math.sin(ang + half) * L);
    ctx.closePath(); ctx.fill();
    const d = (FEET - sy) / Math.sin(ang), px = sx + Math.cos(ang) * d;
    ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.ellipse(px, FEET, 190, 55, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // lamp can
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
    P.rect(ctx, -30, -34, 80, 68, '#3b3354', { radius: 12, seed: 4 });
    P.circle(ctx, 50, 0, 30, col, { ry: 34, shadow: false, seed: 5 });
    ctx.restore();
  }

  function floor(ctx, b) {
    const top = 1110, bot = 1920, rows = 7, cols = 8;
    const rowY = k => top + (bot - top) * Math.pow(k / rows, 1.3);
    const xAt = (c, y) => 540 + (c / cols - 0.5) * 1080 * P.lerp(1.15, 2.3, (y - top) / (bot - top));
    const bi = Math.floor(b), fade = 0.55 + 0.45 * Math.pow(1 - (b % 1), 2);
    const pal = ['#F7B2C8', '#8FD3B6', '#C9B6FF', '#F5D46B', '#8EC9E8', '#E0607E'];
    ctx.save();
    ctx.fillStyle = '#231a48'; ctx.fillRect(0, top, 1080, bot - top);
    for (let r = 0; r < rows; r++) {
      const y0 = rowY(r), y1 = rowY(r + 1);
      for (let c = -1; c <= cols; c++) {
        const lit = P.hash(r * 13 + c * 7 + bi * 31) > 0.5;
        ctx.beginPath();
        ctx.moveTo(xAt(c, y0) + 4, y0 + 3); ctx.lineTo(xAt(c + 1, y0) - 4, y0 + 3);
        ctx.lineTo(xAt(c + 1, y1) - 4, y1 - 3); ctx.lineTo(xAt(c, y1) + 4, y1 - 3); ctx.closePath();
        if (lit) { ctx.globalAlpha = fade; ctx.fillStyle = pal[(((r * 3 + c * 5 + bi) % 6) + 6) % 6]; }
        else { ctx.globalAlpha = 1; ctx.fillStyle = (r + c) % 2 ? '#3a2f6b' : '#30275c'; }
        ctx.fill();
      }
    }
    ctx.restore();
    // shiny edge of the floor
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, top - 6, 1080, 8); ctx.restore();
  }

  ClaudeTok.register({
    author: '@curly.crew',
    caption: 'new dance trend just dropped 🕺 learn the {} hug before your linter does #dancechallenge #json #fyp',
    sound: 'object literal (disco edit) · curly.crew',
    avatar: '🕺',
    avatarColor: '#C9B6FF',
    duration: 8,
    bg: '#2a1f55',
    likes: '3.4M', commentCount: '61K', saves: '802K', shares: '233K',
    thumb: 4.25,
    comments: [
      ['json.parse', 'finally a dance i can parse', 131000],
      ['lint.bot', 'the second { is half a beat off. fixing automatically', 94200],
      ['python.dev', 'we don\'t do braces here 🐍 (i am learning it anyway)', 61900],
      ['clawd', 'i was not late at the {} hug. i was lazy evaluating', 38700],
      ['curly.crew', 'the googly eyes were not choreographed. they do that on their own', 22300],
      ['trailing.comma', 'step 7 the {} hug had me crying. finally some closure', 12400],
      ['yaml.enjoyer', 'me doing "the spin" at 0:02 and immediately losing my indentation', 5600],
      ['off.by.one', 'there are 8 moves but they only count to step 8/8 so where is step 0', 1900],
      ['disco.floor.tile', '🕺{}🕺', 430],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step) {
      const s = step % 32, chord = Math.floor(s / 8) % 4;
      if (s % 2 === 0) SFX.kick({ vol: 0.32 });
      if (s % 4 === 2) { SFX.snare({ vol: 0.13 }); SFX.clap({ vol: 0.08 }); }
      if (s % 2 === 1) SFX.hat({ vol: 0.05 });
      SFX.bass(ROOTS[chord][s % 2], 0.2, { vol: 0.2 });
      if (LEAD[s]) SFX.pluck(LEAD[s], { vol: 0.07 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const b = t * 2;                        // beats (120 bpm)
      const m = Math.floor(b / 2) % 8;        // current move
      const bb = b % 1;
      const punch = 0.05 * P.pulse(t, 7, 0.5);

      ctx.save();
      P.zoom(ctx, 1 + 0.012 * Math.pow(1 - bb, 3) + punch, 540, 1000);

      // back wall
      P.gradient(ctx, '#1f1745', '#4d2f7d');
      // disco reflections sweeping the wall
      for (let i = 0; i < 36; i++) {
        const a = P.hash(i) * TAU + t * W8;
        const rad = 170 + P.hash(i + 40) * 640;
        const px = 540 + Math.cos(a) * rad * 1.15, py = 380 + Math.sin(a) * rad * 0.8;
        if (py > 1100 || py < 0) continue;
        const tw = 0.5 + 0.5 * Math.sin(t * W8 * 6 + i * 2.3);
        P.star(ctx, px, py, 6 + tw * 11, i % 3 ? '#fff' : COLS[i % 4], { points: 4, inner: 0.3, shadow: false });
      }

      floor(ctx, b);
      spot(ctx, 40, 300, 1.05 + 0.3 * Math.sin(t * W8 * 2), '#FFE9A8');
      spot(ctx, 1040, 300, Math.PI - 1.05 - 0.3 * Math.sin(t * W8 * 2 + 1.3), '#FFC2E0');
      discoBall(ctx, 540, 372, 86, t);

      P.title(ctx, 'new dance trend\njust dropped', 540, 565, {
        size: 78, color: C.yellow, rot: -0.03, pop: 1 + 0.05 * Math.pow(1 - bb, 3),
      });

      // floor shadows, then the crew
      const poses = [0, 1, 2, 3].map(i => blended(b, i));
      poses.forEach((o, i) => {
        ctx.save();
        ctx.globalAlpha = 0.35 * P.clamp(1 + o.dy / 260);
        ctx.fillStyle = '#120c2a';
        ctx.beginPath(); ctx.ellipse(BX[i] + o.dx, FEET + 6, 78 * (1 + o.dy / 500), 18, 0, 0, TAU); ctx.fill();
        ctx.restore();
      });
      poses.forEach((o, i) => dancer(ctx, i, o, t));

      // hearts between the pairs during the {} hug
      if (m === 6) {
        const hp = Math.abs(Math.sin(Math.PI * b));
        [300, 720].forEach((hx, k) => P.heart(ctx, hx, 870 - hp * 40, 26 + hp * 16, C.rose, { seed: k }));
      }

      // Clawd in the corner, trying to keep up (always a bit late)
      const cb = Math.abs(Math.sin(Math.PI * (b - 0.4)));
      P.claude(ctx, 140, 1350 - cb * 28, 72, {
        t, mood: m === 7 ? 'wow' : 'side', rot: Math.sin(Math.PI * (b - 0.4)) * 0.2, squash: (1 - cb) * 0.15,
      });

      // move counter
      const lp = ease.outBack(P.clamp((b % 2) / 0.35));
      P.text(ctx, `step ${m + 1}/8`, 250, 1318, { size: 40, font: 'marker', color: '#dcd0ff', align: 'left' });
      P.text(ctx, MOVES[m], 250, 1375, { size: 66, font: 'bubble', color: COLS[m % 4], align: 'left', stroke: C.ink, strokeWidth: 10, scale: lp });
      P.burstLines(ctx, 230, 1375, 30, prog(b % 2, 0, 0.5), C.yellow, 8, 6);

      ctx.restore();

      const sp = ease.outBack(prog(t, 0.6, 0.4)) * (1 - ease.inCubic(prog(t, 7.6, 0.35)));
      if (sp > 0.01) P.sticker(ctx, 'ok i need to learn this', 70, 1488, { pop: sp, rot: -0.03 });

      if (t >= 7) P.flash(ctx, 0.3 * (1 - prog(t, 7, 0.25)));

      if (env.at(2)) SFX.whoosh({ vol: 0.12 });
      if (env.at(4)) SFX.boing({ vol: 0.12 });
      if (env.at(6)) SFX.chime({ vol: 0.08 });
      if (env.at(7)) SFX.clap({ vol: 0.25 });
    },
  });
})();
