/* A black cat walks across the keyboard and presses exactly the ; key. Then leaves. Via backspace. */
(function () {
  const TAU = Math.PI * 2;
  const CAT = '#231f2b';
  const GROUND = 1323;                 // cat walks on the bottom key row
  const KX = 225, KP = 62, KW = 56, KH = 50;
  const ROWS = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'], ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '⌫']];
  const ROWY = [1182, 1240, 1298];
  const keyC = (r, i) => [KX + i * KP + KW / 2, ROWY[r] + KH / 2];
  const SEMI = keyC(1, 9), DEL = keyC(2, 9);
  const TAP = 4.45, FIX = 4.95, DEL_T = 7.5;
  const MINOR = ['A3', 0, 'C4', 0, 'E4', 0, 'C4', 0, 'D4', 0, 'F4', 0, 'E4', 0, 'B3', 'C4'];
  const MAJOR = ['C4', 0, 'E4', 0, 'G4', 0, 'E4', 0, 'F4', 0, 'A4', 0, 'G4', 'E4', 'C5', 0];
  const inQuad = x => x * x;

  const cxAt = t => t < 3 ? P.lerp(-420, 640, P.ease.outQuad(P.prog(t, 0.1, 2.7)))
    : P.lerp(640, 1500, inQuad(P.prog(t, 6.9, 2.0)));
  const phiAt = cx => (cx - 640) / 45 + Math.PI / 2;   // all four paws are down when it stops at 640

  function pizz(n, v = 0.09) {
    SFX.tone(n, 0.13, { type: 'triangle', vol: v, attack: 0.003 });
    SFX.tone(SFX.freq(n) * 2, 0.06, { type: 'sine', vol: v * 0.25, attack: 0.002 });
  }

  /* paw positions for the four legs */
  function legs(t, cx) {
    const phi = phiAt(cx);
    const L = [
      { front: true, far: true, ph: phi + Math.PI },
      { front: false, far: true, ph: phi },
      { front: false, far: false, ph: phi + Math.PI },
      { front: true, far: false, ph: phi },
    ];
    L.forEach(l => {
      l.hx = cx + (l.front ? 95 : -95) + (l.far ? 18 : 0);
      l.hy = GROUND - 120;
      l.px = l.hx + Math.sin(l.ph) * 30;
      l.py = GROUND - Math.max(0, Math.cos(l.ph)) * 28;
    });
    // the deliberate paw: near front leg lifts, aims, taps ;
    const nf = L[3];
    if (t > 3.9 && t < 5.05) {
      const up = P.ease.inOutCubic(P.prog(t, 3.9, 0.45));
      const tap = P.ease.inCubic(P.prog(t, 4.3, 0.15));
      const back = P.ease.inOutCubic(P.prog(t, 4.72, 0.3));
      let x = P.lerp(nf.px, cx + 150, up), y = P.lerp(nf.py, GROUND - 160, up);
      x = P.lerp(x, SEMI[0] - 6, tap); y = P.lerp(y, SEMI[1] + 4, tap);
      nf.px = P.lerp(x, nf.px, back); nf.py = P.lerp(y, nf.py, back);
    }
    return L;
  }

  function leg(ctx, l, far) {
    ctx.beginPath();
    P.capsulePath(ctx, l.hx, l.hy, l.px, l.py - 10, 36);
    P.cut(ctx, far ? '#16131c' : CAT, { rim: false, shadow: { blur: 6, dy: 4, alpha: 0.25 } });
    P.circle(ctx, l.px + 6, l.py - 8, 22, far ? '#16131c' : CAT, { ry: 17, seed: 5, shadow: false });
  }

  function cat(ctx, t, cx, L, mood) {
    const { C } = P;
    const phi = phiAt(cx);
    const walking = (t > 0.1 && t < 2.8) || t > 6.9;
    const bob = walking ? Math.abs(Math.sin(phi)) * 6 : 0;
    const by = GROUND - 150 - bob;
    leg(ctx, L[0], true); leg(ctx, L[1], true);
    // tail
    const sw = Math.sin(t * TAU * (walking ? 1 : 0.5)) * (mood === 'happy' ? 70 : 45);
    ctx.save();
    P.shadow(ctx, 8, 5, 0.25);
    ctx.strokeStyle = CAT; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 130, by - 20);
    ctx.bezierCurveTo(cx - 250, by - 20, cx - 200 + sw * 0.3, by - 140, cx - 230 + sw, by - 200);
    ctx.stroke(); ctx.restore();
    // body
    P.circle(ctx, cx, by, 150, CAT, { ry: 80, seed: 11, amp: 3 });
    leg(ctx, L[2], false); leg(ctx, L[3], false);
    // head
    const hx = cx + 150, hy = by - 75 - bob * 0.5 + (mood === 'happy' ? Math.sin(t * TAU) * 4 : 0);
    const ear = (sd) => {
      P.poly(ctx, [[hx + sd * 72, hy - 20], [hx + sd * 58, hy - 118], [hx + sd * 12, hy - 70]], CAT, { seed: 12 + sd, amp: 2 });
      P.poly(ctx, [[hx + sd * 60, hy - 38], [hx + sd * 54, hy - 96], [hx + sd * 26, hy - 66]], '#E9A0B4', { seed: 14 + sd, amp: 1, shadow: false });
    };
    ear(-1); ear(1);
    P.circle(ctx, hx, hy, 82, CAT, { seed: 13, amp: 2 });
    // collar + bell
    P.circle(ctx, hx - 6, hy + 74, 58, C.red, { ry: 13, seed: 15, shadow: false });
    P.circle(ctx, hx, hy + 90, 14, C.yellow, { seed: 16, shadow: { blur: 4, dy: 2, alpha: 0.3 } });
    // eyes
    const look = mood === 'aim' ? [9, 9] : mood === 'sus' ? [-7, 0] : [8, 0];
    [-1, 1].forEach(sd => {
      const ex = hx + sd * 32, ey = hy - 8;
      ctx.save();
      if (mood === 'happy') {
        ctx.strokeStyle = '#C8E05A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(ex, ey + 8, 15, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      } else {
        ctx.fillStyle = '#C8E05A';
        ctx.beginPath(); ctx.ellipse(ex, ey, 20, 23, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = P.C.ink;
        ctx.beginPath(); ctx.ellipse(ex + look[0], ey + look[1], 6, 17, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex + look[0] - 4, ey + look[1] - 8, 4, 0, TAU); ctx.fill();
        if (mood === 'sus') {
          ctx.fillStyle = CAT; ctx.fillRect(ex - 24, ey - 26, 48, 24);
          ctx.strokeStyle = '#3d3647'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(ex - 21, ey - 2); ctx.lineTo(ex + 21, ey - 2); ctx.stroke();
        }
      }
      ctx.restore();
    });
    // nose, mouth, whiskers, blush
    ctx.save();
    ctx.fillStyle = 'rgba(240,120,150,0.45)';
    ctx.beginPath(); ctx.ellipse(hx - 55, hy + 22, 13, 7, 0, 0, TAU); ctx.ellipse(hx + 55, hy + 22, 13, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#F29AB2';
    ctx.beginPath(); ctx.moveTo(hx - 9, hy + 18); ctx.lineTo(hx + 9, hy + 18); ctx.lineTo(hx, hy + 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx - 14, hy + 34); ctx.quadraticCurveTo(hx - 7, hy + 42, hx, hy + 32); ctx.quadraticCurveTo(hx + 7, hy + 42, hx + 14, hy + 34);
    [-1, 1].forEach(sd => [-8, 4, 16].forEach((d, k) => {
      ctx.moveTo(hx + sd * 40, hy + 24 + k * 6); ctx.lineTo(hx + sd * 105, hy + 12 + d * 1.2);
    }));
    ctx.stroke();
    ctx.restore();
  }

  function codeLine(ctx, toks, x, y) {
    let cx = x;
    toks.forEach(([s, col]) => {
      P.text(ctx, s, cx, y, { size: 34, font: 'mono', align: 'left', color: col, shadow: false, weight: 600 });
      cx += P.measure(ctx, s, { size: 34, font: 'mono', weight: 600 });
    });
    return cx;
  }

  ClaudeTok.register({
    author: '@cat.tax',
    caption: 'he knew exactly what he was doing 😼 #catsoftiktok #syntaxerror #pairprogramming',
    sound: 'sneaky paws pizzicato · cat.tax',
    avatar: '🐈‍⬛',
    avatarColor: '#231f2b',
    duration: 9,
    bg: '#F4D9C9',
    likes: '6.2M', commentCount: '140K', saves: '930K', shares: '1.2M',
    thumb: 5.4,
    comments: [
      '@eslint: i have been trying to tell you about that ; for 3 hours',
      ['senior.dev', 'best code reviewer on the team. also takes backspace privileges seriously'],
      '@claude: i would have added it but you said "don\'t touch anything else" 🥲',
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const fixed = env.t >= FIX && env.t < DEL_T + 0.05;
      const n = (fixed ? MAJOR : MINOR)[step % 16];
      if (n) pizz(n);
      if (step % 4 === 0) pizz(fixed ? (step % 8 ? 'G2' : 'C3') : (step % 8 ? 'E2' : 'A2'), 0.08);
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const cx = cxAt(t);
      const L = legs(t, cx);
      const fixed = t >= FIX && t < DEL_T + 0.05;
      const semiIn = t >= FIX && t < DEL_T;

      // wallpaper
      P.stripes(ctx, '#F4D9C9', '#EFCBB8', 46);
      for (let y = 330; y < 1150; y += 120) for (let x = (y / 120) % 2 ? 60 : 120; x < 1080; x += 120) P.dot(ctx, x, y, 7, '#E5B39F');

      // framed fish picture
      P.rect(ctx, 105, 300, 300, 215, C.wood, { radius: 10, seed: 31 });
      P.rect(ctx, 127, 322, 256, 171, C.cream, { radius: 6, seed: 32, shadow: false });
      ctx.save();
      ctx.beginPath(); ctx.rect(145, 338, 220, 139); ctx.clip();
      ctx.fillStyle = C.sky; ctx.fillRect(145, 338, 220, 139);
      ctx.fillStyle = '#6FB3D9'; ctx.fillRect(145, 440, 220, 40);
      const fx = 255 + Math.sin(t * TAU / 4.5) * 55, fy = 400 + Math.sin(t * TAU / 3) * 10;
      const dir = Math.cos(t * TAU / 4.5) >= 0 ? 1 : -1;
      P.poly(ctx, [[fx - dir * 30, fy], [fx - dir * 58, fy - 20], [fx - dir * 58, fy + 20]], C.claude, { shadow: false, amp: 1 });
      P.circle(ctx, fx, fy, 36, C.claude, { ry: 22, shadow: false, seed: 33 });
      P.dot(ctx, fx + dir * 18, fy - 5, 5, C.ink);
      for (let k = 0; k < 3; k++) {
        const ph = (t / 1.5 + k / 3) % 1;
        P.dot(ctx, fx + dir * 40 + Math.sin(ph * 9) * 5, fy - 10 - ph * 70, 5 + ph * 4, 'rgba(255,255,255,0.8)');
      }
      ctx.restore();

      // wall clock (one lap per loop)
      P.circle(ctx, 790, 400, 90, C.paper, { seed: 34 });
      P.circle(ctx, 790, 400, 72, '#FFF9F0', { seed: 35, shadow: false });
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P.dot(ctx, 790 + Math.cos(a) * 60, 400 + Math.sin(a) * 60, 4, C.ink); }
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(790, 400); ctx.lineTo(790 + 30, 400 - 25); ctx.stroke();
      const sa = -Math.PI / 2 + Math.floor(t) / 9 * TAU;
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(790, 400); ctx.lineTo(790 + Math.cos(sa) * 58, 400 + Math.sin(sa) * 58); ctx.stroke();
      ctx.restore();

      // desk
      P.rect(ctx, -30, 1150, 1140, 480, C.wood, { radius: 10, seed: 21 });
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 5;
      [1210, 1330, 1480].forEach((y, k) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 20 - k * 10, 700, y - 20, 1080, y + 8); ctx.stroke(); });
      ctx.restore();
      P.rect(ctx, -30, 1600, 1140, 400, C.brown, { radius: 6, seed: 22 });

      // laptop lid + editor
      const shake = (t < 0.5 || (t > DEL_T + 0.05 && t < DEL_T + 0.5)) ? 6 * (1 - ((t < 0.5 ? t : t - DEL_T - 0.05) / 0.45)) : 0;
      P.rect(ctx, 185, 545, 690, 610, '#cfcad8', { radius: 30, seed: 41 });
      P.window(ctx, 210, 570, 640, 560, 'main.js', { bg: '#2a2440', titleColor: '#e8e0ff', bar: 'rgba(255,255,255,0.07)', seed: 42 });
      ctx.save();
      P.shake(ctx, t, shake);
      const blink = 0.8 + 0.2 * Math.sin(t * TAU * 2);
      ctx.save(); ctx.globalAlpha = fixed ? 1 : blink;
      P.rect(ctx, 232, 662, 596, 74, fixed ? C.green : C.red, { radius: 16, seed: 43, shadow: { blur: 8, dy: 4, alpha: 0.3 } });
      ctx.restore();
      const tp = fixed ? ease.outBack(prog(t, FIX, 0.35)) : 1;
      P.text(ctx, fixed ? '✓ build passed · 0 errors' : '✗ SyntaxError: missing ;', 256, 700, { size: 31, font: 'mono', align: 'left', color: '#fff', shadow: false, weight: 700, scale: tp });
      ctx.restore();
      if (fixed) P.burstLines(ctx, 530, 700, 150, prog(t, FIX, 0.5), C.mint, 12, 8);

      const LY0 = 792, LH = 56;
      const KW_ = '#F7A6C4', STR = '#8FD3B6', FN = '#8EC9E8', TXT = '#e8e0ff';
      ['1', '2', '3', '4'].forEach((n, i) => P.text(ctx, n, 236, LY0 + i * LH, { size: 30, font: 'mono', color: '#7d7399', shadow: false }));
      codeLine(ctx, [['function ', KW_], ['feedCat', FN], ['() {', TXT]], 275, LY0);
      const endX = codeLine(ctx, [['  const ', KW_], ['food = ', TXT], ['"tuna"', STR]], 275, LY0 + LH);
      codeLine(ctx, [['  return ', KW_], ['food;', TXT]], 275, LY0 + LH * 2);
      codeLine(ctx, [['}', TXT]], 275, LY0 + LH * 3);
      if (!semiIn) {
        // red squiggle + blinking cursor
        ctx.save(); ctx.strokeStyle = '#FF6B72'; ctx.lineWidth = 4; ctx.beginPath();
        const sx0 = endX - 150;
        for (let x = sx0; x <= endX; x += 5) { const y = LY0 + LH + 24 + Math.sin((x - sx0) / 5) * 4; x === sx0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke(); ctx.restore();
        if (Math.floor(t * 2.5) % 2 === 0) { ctx.save(); ctx.fillStyle = '#e8e0ff'; ctx.fillRect(endX + 3, LY0 + LH - 20, 4, 40); ctx.restore(); }
      } else {
        const sp = ease.outBack(prog(t, FIX, 0.3));
        ctx.save(); ctx.globalAlpha = 0.35 * (1 - prog(t, FIX, 0.8));
        P.circle(ctx, endX + 11, LY0 + LH, 34, C.yellow, { shadow: false }); ctx.restore();
        P.text(ctx, ';', endX + 11, LY0 + LH, { size: 34 * (1 + 0.6 * (1 - sp)), font: 'mono', color: C.yellow, shadow: false, weight: 800 });
      }

      // laptop base + keyboard
      P.rect(ctx, 185, 1140, 690, 24, '#a9a3b8', { radius: 8, seed: 44 });
      P.poly(ctx, [[185, 1160], [875, 1160], [905, 1460], [155, 1460]], '#d9d4e2', { seed: 45, amp: 2 });
      const pressed = new Set();
      L.forEach(l => {
        if (l.py < GROUND - 3 || l.px < KX || l.px > KX + 10 * KP) return;
        pressed.add('2:' + P.clamp(Math.floor((l.px - KX) / KP), 0, 9));
      });
      if (t >= TAP && t < 4.75) pressed.add('1:9');
      if (t >= DEL_T && t < DEL_T + 0.22) pressed.add('2:9');
      const aim = pulse(t, 3.9, 0.6);
      ROWS.forEach((row, r) => row.forEach((k, i) => {
        const x = KX + i * KP, y = ROWY[r], down = pressed.has(r + ':' + i);
        if (r === 1 && i === 9 && aim > 0) { ctx.save(); ctx.globalAlpha = aim; P.rect(ctx, x - 7, y - 7, KW + 14, KH + 14, C.yellow, { radius: 14, shadow: false, seed: 60 }); ctx.restore(); }
        P.rect(ctx, x, y + (down ? 4 : 0), KW, KH, down ? '#5a4f7a' : '#3a3450', { radius: 9, seed: 50 + r * 10 + i, amp: 1.5, shadow: down ? false : { blur: 3, dy: 4, alpha: 0.35 } });
        P.text(ctx, k, x + KW / 2, y + KH / 2 + (down ? 4 : 0), { size: 26, font: 'mono', color: '#e8e0ff', shadow: false });
      }));
      P.rect(ctx, KX + 2 * KP, 1356, KP * 6 - 6, 40, '#3a3450', { radius: 9, seed: 71, amp: 1.5, shadow: { blur: 3, dy: 4, alpha: 0.35 } });
      P.rect(ctx, 450, 1408, 160, 40, '#cbc5d6', { radius: 8, seed: 72, shadow: false });
      P.claude(ctx, 250, 1425, 24, { t, mood: 'happy', wiggle: 0 });

      // the cat
      const mood = (t > 2.9 && t < 3.9) || t > DEL_T + 0.1 ? 'sus' : t > 3.9 && t < TAP + 0.2 ? 'aim' : t >= FIX && t < 6.8 ? 'happy' : 'fwd';
      cat(ctx, t, cx, L, mood);

      // paw steps (tick when paws land)
      if (env.live && env.dt > 0) {
        const a = Math.floor((phiAt(cx) - Math.PI / 2) / Math.PI), b = Math.floor((phiAt(cxAt(t - env.dt)) - Math.PI / 2) / Math.PI);
        if (a !== b) SFX.tick({ vol: 0.22 });
      }

      // the flying semicolon (key -> code), and the deleted one falling out
      if (t >= TAP && t < FIX) {
        const p = ease.inOutQuad(prog(t, TAP, FIX - TAP));
        const x = lerp(SEMI[0], endX + 11, p), y = lerp(SEMI[1], LY0 + LH, p) - Math.sin(Math.PI * p) * 260;
        P.text(ctx, ';', x, y, { size: lerp(90, 34, p), font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, rot: p * TAU });
        P.burstLines(ctx, SEMI[0], SEMI[1], 40, prog(t, TAP, 0.35), C.yellow, 8, 6);
      }
      if (t >= DEL_T && t < DEL_T + 0.8) {
        const p = prog(t, DEL_T, 0.8);
        ctx.save(); ctx.globalAlpha = 1 - p;
        P.text(ctx, ';', endX + 11 + p * 60, LY0 + LH - 60 * p + 900 * p * p, { size: 50, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 8, rot: p * 5 });
        ctx.restore();
      }
      P.confetti(ctx, t - FIX, 530, 700, 5, 50, 520);

      // sticker
      const sp = ease.outBack(prog(t, 5.2, 0.4)) * (1 - ease.inCubic(prog(t, 8.6, 0.3)));
      if (sp > 0.01) P.sticker(ctx, 'my semicolon!!! 😭', 70, 1530, { pop: sp, rot: -0.03 });
      if (t > DEL_T + 0.1 && t < 8.6) P.title(ctx, 'NOOO', 700, 1000, { size: 90, color: C.red, rot: 0.12, pop: ease.outBack(prog(t, DEL_T + 0.1, 0.3)) * (1 - prog(t, 8.3, 0.3)) });

      // sound
      if (env.at(3.05)) SFX.meow({ vol: 0.16 });
      if (env.at(TAP)) { SFX.ding('A6', { vol: 0.16 }); SFX.tick({ vol: 0.4 }); SFX.tone('E7', 0.5, { vol: 0.05, when: 0.04 }); }
      if (env.at(FIX)) SFX.success({ vol: 0.18 });
      if (env.at(5.3)) SFX.noise(1.1, { filter: 'lowpass', freq: 160, vol: 0.12 });
      if (env.at(5.6)) SFX.tone(560, 0.35, { type: 'triangle', slide: 900, vol: 0.14, attack: 0.05 });
      if (env.at(DEL_T)) SFX.click({ vol: 0.35 });
      if (env.at(DEL_T + 0.05)) SFX.error({ vol: 0.07 });
      if (env.at(DEL_T + 0.35)) SFX.meow({ vol: 0.12 });
    },
  });
})();
