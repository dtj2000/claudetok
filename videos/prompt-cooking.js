/* Overhead cooking video: dice requirements, a "pinch" of context, whisk in
 * few-shot eggs, simmer (with thinking steam), plate a beautiful answer. */
(function () {
  const TAU = Math.PI * 2;
  const B = 1.9, CC = 3.4, D = 5.2, E = 7.3, F = 10.3, DUR = 11;
  const CHOPS = [0.25, 0.6, 0.95, 1.3];
  const EDGES = [720, 600, 480, 360];
  const EGGS = [3.5, 3.85, 4.2];
  const WHISK = 4.45;
  const SEG = [['fast', '#F2B8C6'], ['cheap', '#8FD3B6'], ['good', '#F5C84B'], ['by fri', '#8EC9E8'], ['vibes', '#c9b6ff']];
  const BOWL = [540, 580, 205];
  const GRAINS = ['a', '{', '.md', '#', 'fn', ';', '→', 'git', '()', 'id', '//', 'k'];
  const HEAP = ['README', 'docs/', 'src/', 'CLAUDE.md', 'tests', 'git log', 'deps', 'diff', '.env?', 'TODO', 'logs', 'api/', 'utils', 'types', 'ci.yml', 'notes'];

  /* ---------- props ---------- */
  function marble(ctx) {
    P.bg(ctx, '#EEE8DE');
    ctx.save();
    ctx.strokeStyle = 'rgba(120,110,130,0.14)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const r = P.rng(4);
    for (let i = 0; i < 9; i++) {
      let x = r() * 1080, y = r() * 1920;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (r() - 0.3) * 220; y += (r() - 0.5) * 260; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
  }

  function board(ctx) {
    const { C } = P;
    P.rect(ctx, 130, 830, 780, 560, C.wood, { radius: 34, seed: 11, shadow: { blur: 22, dy: 16, alpha: 0.3 } });
    ctx.save();
    ctx.strokeStyle = 'rgba(120,70,40,0.25)'; ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(160, 880 + i * 72);
      ctx.bezierCurveTo(400, 860 + i * 72 + (i % 2 ? 20 : -15), 650, 900 + i * 72, 880, 870 + i * 72);
      ctx.stroke();
    }
    ctx.restore();
  }

  function bowl(ctx) {
    const [x, y, r] = BOWL;
    P.circle(ctx, x, y, r, '#9CCFE0', { seed: 21, shadow: { blur: 22, dy: 14, alpha: 0.3 } });
    P.circle(ctx, x, y, r - 26, '#D8EEF5', { seed: 22, shadow: false });
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r - 13, 3.6, 4.4); ctx.stroke();
    ctx.restore();
  }

  function cube(ctx, x, y, s, word, col, rot, w = 120, h = 150) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.rect(ctx, -w / 2, -h / 2, w, h, col, { radius: 10, seed: word.length * 7 + 3, amp: 2 });
    P.text(ctx, word, 0, 2, { size: 30, font: 'marker', color: P.C.ink, shadow: false, maxWidth: w - 10 });
    ctx.restore();
  }

  function knife(ctx, x, y, lift) {
    const { C } = P;
    ctx.save();
    P.zoom(ctx, 1 + lift * 0.1, x, y + 200);
    const sh = { blur: 10 + 22 * lift, dy: 7 + 36 * lift, alpha: 0.3 - lift * 0.1 };
    P.poly(ctx, [[x - 20, y + 110], [x - 24, y - 120], [x + 4, y - 160], [x + 22, y - 130], [x + 22, y + 110]], '#DDE2EA', { seed: 31, amp: 1.5, shadow: sh });
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 18, y + 100); ctx.lineTo(x - 22, y - 116); ctx.stroke(); ctx.restore();
    P.rect(ctx, x - 26, y + 108, 52, 170, C.ink, { radius: 18, seed: 32, shadow: sh });
    [150, 200, 245].forEach(dy => P.dot(ctx, x, y + dy, 7, '#c9ced6'));
    ctx.restore();
  }

  /* ---------- the chopping/mixing counter (A, B, C) ---------- */
  function counter(ctx, t, env, live) {
    const { C, ease, prog, lerp, clamp } = P;
    marble(ctx);
    board(ctx);
    bowl(ctx);
    const [bx, by] = BOWL;
    // recipe tag
    P.rect(ctx, 330, 900, 420, 64, C.paper, { radius: 10, seed: 41, rot: -0.02 });
    P.text(ctx, 'requirements.md', 540, 934, { size: 36, font: 'mono', color: C.ink, shadow: false });

    // requirement cubes: on the board, then swept into the bowl, then whisked
    const swirl = ease.inOutCubic(prog(t, WHISK, 0.8)) * 7 + Math.max(0, t - WHISK - 0.8) * 9;
    const blend = ease.inOutCubic(prog(t, WHISK + 0.25, 0.55));
    SEG.forEach(([word, col], i) => {
      const freeT = CHOPS[Math.min(3, 4 - i)];
      const e = ease.outBack(prog(t, freeT, 0.3));
      let x = 300 + i * 120 + (i - 2) * 24 * e;
      let y = 1080 + (P.hash(i) - 0.5) * 50 * e;
      let rot = (P.hash(i + 9) - 0.5) * 0.5 * e;
      let s = 1;
      const sw = ease.inOutCubic(prog(t, B + i * 0.07, 0.4));
      if (sw > 0) {
        const a = i * 1.26 + swirl;
        const tx = bx + Math.cos(a) * 95, ty = by + Math.sin(a) * 80;
        x = lerp(x, tx, sw); y = lerp(y, ty, sw) - Math.sin(sw * Math.PI) * 160;
        rot += sw * (1.2 + i * 0.3) + swirl; s = lerp(1, 0.58, sw);
      }
      if (blend >= 1) return;
      ctx.save(); ctx.globalAlpha = 1 - blend;
      cube(ctx, x, y, s, word, col, rot);
      ctx.restore();
    });

    // knife
    let kx = EDGES[0];
    for (let k = 1; k < 4; k++) if (t > CHOPS[k - 1]) kx = lerp(EDGES[k - 1], EDGES[k], ease.inOutCubic(prog(t, CHOPS[k - 1] + 0.06, 0.2)));
    const d = Math.min(...CHOPS.map(c => Math.abs(t - c)));
    const lift = clamp(d / 0.16);
    const away = ease.inCubic(prog(t, B - 0.2, 0.4));
    if (away < 1) {
      const kxx = kx + away * 900, ky = 1080;
      P.arm(ctx, kxx + 10, ky + 270, kxx + 380, ky + 900, 82);
      knife(ctx, kxx, ky, lift);
    }
    if (live) CHOPS.forEach((c, k) => {
      P.burstLines(ctx, EDGES[k], 1000, 50, prog(t, c, 0.25), '#fff', 6, 7);
      if (env.at(c)) { SFX.thud({ vol: 0.22 }); SFX.noise(0.05, { filter: 'highpass', freq: 2600, vol: 0.18 }); }
    });

    // context salt: a pinch... then the lid falls off
    const [sx0, sy0] = [760, 430];
    const shakeOn = t > B + 0.4 && t < CC;
    const inS = ease.outBack(prog(t, B + 0.25, 0.35)) * (1 - ease.inCubic(prog(t, CC - 0.25, 0.3)));
    const lidOff = t >= B + 1.05;
    if (inS > 0) {
      const jig = shakeOn && !lidOff ? Math.sin(t * 42) * 16 : 0;
      const sx = lerp(1250, sx0, inS), sy = sy0 + jig;
      // grains / the dump
      for (let i = 0; i < 24; i++) {
        const ts = B + 0.45 + i * 0.025;
        const k = prog(t, ts, 0.32);
        if (k <= 0 || k >= 1 || ts > B + 1.05) continue;
        const r = P.rng(i + 50);
        const gx = lerp(sx - 110, bx + (r() - 0.5) * 160, k), gy = lerp(sy + 80, by + (r() - 0.5) * 120, ease.inQuad(k));
        P.text(ctx, GRAINS[i % GRAINS.length], gx, gy, { size: 24, font: 'mono', color: C.ink, shadow: false });
      }
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(-2.2);
      P.rect(ctx, -60, -95, 120, 190, 'rgba(235,245,250,0.92)', { radius: 22, seed: 51 });
      P.rect(ctx, -48, -40, 96, 110, '#fff', { radius: 12, seed: 52, shadow: false });
      P.text(ctx, 'CONTEXT', 0, 5, { size: 22, font: 'bubble', color: C.blue, shadow: false, rot: Math.PI / 2 });
      if (!lidOff) {
        P.rect(ctx, -58, -140, 116, 56, '#C9CED6', { radius: 14, seed: 53 });
        for (let h = 0; h < 5; h++) P.dot(ctx, -34 + h * 17, -112, 5, '#7d8491');
      }
      ctx.restore();
      P.arm(ctx, sx + 30, sy + 40, sx + 500, sy + 300, 70);
      if (lidOff) {
        const lk = prog(t, B + 1.05, 0.6);
        ctx.save(); ctx.translate(lerp(sx - 110, 250, lk), lerp(sy + 60, 1000, lk) - Math.sin(lk * Math.PI) * 150); ctx.rotate(lk * 7);
        P.rect(ctx, -58, -28, 116, 56, '#C9CED6', { radius: 14, seed: 53 });
        ctx.restore();
      }
    }
    // the 200k-token heap in the bowl
    const heap = ease.outBack(prog(t, B + 1.1, 0.35));
    if (heap > 0 && blend < 1) {
      ctx.save(); ctx.globalAlpha = 1 - blend;
      HEAP.forEach((w, i) => {
        const r = P.rng(i + 200);
        const a = r() * TAU + swirl * 0.8, rr = Math.sqrt(r()) * 140 * heap;
        P.text(ctx, w, bx + Math.cos(a) * rr, by + Math.sin(a) * rr * 0.85, { size: 28 * heap, font: 'mono', color: [C.purple, C.teal, C.rose, C.ink][i % 4], stroke: '#fff', strokeWidth: 6, shadow: false, rot: r() - 0.5 + swirl * 0.8 });
      });
      ctx.restore();
    }
    P.bubble(ctx, '(it was not\na pinch)', 250, 380, 380, 500, { size: 44, pop: ease.outBack(prog(t, B + 1.25, 0.3)) * (t < CC ? 1 : 0) });

    // few-shot eggs
    EGGS.forEach((te, i) => {
      const inE = ease.outCubic(prog(t, te - 0.3, 0.3));
      const crack = prog(t, te, 0.3);
      const ex = 760 - i * 20, ey = 480 + i * 25;
      const yolkX = bx + [-60, 55, 0][i], yolkY = by + [-40, -20, 60][i];
      if (t > te) {
        // yolk lands in the bowl and gets whisked
        const a = Math.atan2(yolkY - by, yolkX - bx) + swirl * 1.1, rr = Math.hypot(yolkX - bx, yolkY - by);
        const yx = lerp(ex, bx + Math.cos(a) * rr, ease.outCubic(crack)), yy = lerp(ey, by + Math.sin(a) * rr, ease.outCubic(crack));
        if (blend < 1) {
          ctx.save(); ctx.globalAlpha = 1 - blend;
          P.circle(ctx, yx, yy, 52, '#FFF8EC', { seed: 60 + i, amp: 5, shadow: false });
          P.circle(ctx, yx, yy, 30, C.mustard, { seed: 63 + i });
          P.text(ctx, 'ex ' + (i + 1), yx, yy, { size: 22, font: 'bubble', color: '#fff', shadow: false });
          ctx.restore();
        }
      }
      if (inE > 0 && crack < 1) {
        const x = lerp(1250, ex, inE), open = ease.outCubic(crack) * 70;
        [-1, 1].forEach(sd => {
          ctx.save(); ctx.translate(x + sd * open, ey - open * 0.3); ctx.rotate(sd * crack * 0.8);
          ctx.beginPath(); ctx.ellipse(0, 0, 58, 74, 0, sd < 0 ? Math.PI / 2 : -Math.PI / 2, sd < 0 ? Math.PI * 1.5 : Math.PI / 2);
          ctx.closePath();
          P.cut(ctx, '#FFF4E0');
          ctx.restore();
        });
        if (crack === 0) P.text(ctx, 'example ' + (i + 1), x, ey, { size: 24, font: 'marker', color: C.brown, shadow: false });
        P.arm(ctx, x + 40 + open, ey + 30, x + 460, ey + 380, 66);
      }
      if (env.at(te)) { SFX.noise(0.07, { filter: 'highpass', freq: 1800, vol: 0.25 }); SFX.tick({ vol: 0.3 }); }
      if (env.at(te + 0.2)) SFX.tone(260, 0.12, { type: 'sine', slide: 120, vol: 0.12 });
    });

    // batter + whisk
    if (blend > 0) {
      ctx.save(); ctx.globalAlpha = blend;
      P.circle(ctx, bx, by, 172, '#F3D58A', { seed: 70, shadow: false });
      ctx.strokeStyle = 'rgba(232,132,92,0.6)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        ctx.beginPath(); ctx.arc(bx, by, 40 + k * 32, swirl * 1.3 + k, swirl * 1.3 + k + 2.2); ctx.stroke();
      }
      ctx.restore();
    }
    const wIn = ease.outCubic(prog(t, WHISK - 0.2, 0.25)) * (1 - ease.inCubic(prog(t, D - 0.2, 0.2)));
    if (wIn > 0) {
      const a = (t - WHISK) * 13;
      const wx = lerp(1200, bx + Math.cos(a) * 80, wIn), wy = lerp(900, by + Math.sin(a) * 60, wIn);
      P.arm(ctx, wx + 230, wy + 380, wx + 600, wy + 900, 80);
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#8d929c'; ctx.lineWidth = 34;
      ctx.beginPath(); ctx.moveTo(wx + 60, wy + 90); ctx.lineTo(wx + 240, wy + 390); ctx.stroke();
      ctx.strokeStyle = '#DDE2EA'; ctx.lineWidth = 6;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(wx, wy, 70, 20, k * Math.PI / 4 + a * 0.2, 0, TAU); ctx.stroke(); }
      ctx.restore();
    }
  }

  /* ---------- the stove (D) ---------- */
  function stove(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.bg(ctx, '#34313a');
    ctx.save(); ctx.strokeStyle = '#1f1d24'; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(100, 460); ctx.lineTo(980, 460); ctx.moveTo(100, 1340); ctx.lineTo(980, 1340);
    ctx.moveTo(150, 400); ctx.lineTo(150, 1400); ctx.moveTo(930, 400); ctx.lineTo(930, 1400); ctx.stroke();
    ctx.restore();
    const cx = 540, cy = 900;
    // flame ring
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU, fl = 36 + Math.sin(t * 19 + i * 2.3) * 12;
      const r0 = 330;
      ctx.save(); ctx.translate(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.rotate(a);
      P.poly(ctx, [[0, -16], [fl + 24, 0], [0, 16]], i % 3 ? '#5B8DEF' : C.claude, { seed: i, amp: 2, shadow: false });
      ctx.restore();
    }
    // pot
    P.rect(ctx, cx - 470, cy - 34, 140, 68, '#2a2830', { radius: 30, seed: 81 });
    P.rect(ctx, cx + 330, cy - 34, 130, 68, '#2a2830', { radius: 30, seed: 82 });
    P.circle(ctx, cx, cy, 340, '#B8BCC6', { seed: 83, shadow: { blur: 30, dy: 18, alpha: 0.45 } });
    P.circle(ctx, cx, cy, 305, '#8d929c', { seed: 84, shadow: false });
    P.circle(ctx, cx, cy, 290, C.claude, { seed: 85, shadow: false });
    ctx.save(); ctx.globalAlpha = 0.35; P.circle(ctx, cx - 60, cy - 70, 170, C.yellow, { seed: 86, shadow: false }); ctx.restore();
    // floating bits
    ['few-shot', 'context', 'reqs', 'tone: nice'].forEach((w, i) => {
      const a = t * 0.9 + i * 1.57, r = 150 + (i % 2) * 60;
      P.text(ctx, w, cx + Math.cos(a) * r, cy + Math.sin(a) * r, { size: 32, font: 'marker', color: C.paper, shadow: false, rot: a + 1.57 });
    });
    // bubbles
    for (let i = 0; i < 30; i++) {
      const per = 0.7 + P.hash(i) * 0.6, ph = ((t + P.hash(i + 3) * per) % per) / per;
      const r = P.rng(i + 400 + Math.floor((t + P.hash(i + 3) * per) / per));
      const a = r() * TAU, rr = Math.sqrt(r()) * 250;
      const bxp = cx + Math.cos(a) * rr, byp = cy + Math.sin(a) * rr;
      if (ph < 0.85) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,240,220,0.8)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(bxp, byp, 4 + ph * 22, 0, TAU); ctx.stroke(); ctx.restore();
      } else P.burstLines(ctx, bxp, byp, 18, (ph - 0.85) / 0.15, 'rgba(255,240,220,0.9)', 6, 4);
    }
    // wooden spoon
    const sa = t * 3.2;
    const spx = cx + Math.cos(sa) * 150, spy = cy + Math.sin(sa) * 120;
    P.arm(ctx, spx + 250, spy + 420, spx + 600, spy + 1000, 80);
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.wood; ctx.lineWidth = 26;
    P.shadow(ctx, 10, 8, 0.3);
    ctx.beginPath(); ctx.moveTo(spx + 30, spy + 50); ctx.lineTo(spx + 250, spy + 420); ctx.stroke(); ctx.restore();
    P.circle(ctx, spx, spy, 46, C.wood, { ry: 60, seed: 87 });
    // steam with thoughts
    const thoughts = ['thinking…', 'hmm', 'wait,', 'actually—', 'ok so'];
    for (let i = 0; i < 5; i++) {
      const per = 1.6, k = ((t + i * 0.32) % per) / per;
      const x = cx - 240 + i * 120 + Math.sin(t * 2 + i) * 40, y = lerp(760, 330, k);
      ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI) * 0.5;
      P.cloud(ctx, x, y, 0.55 + k * 0.4, '#fff');
      ctx.restore();
      ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
      P.text(ctx, thoughts[i], x, y + 10, { size: 34, font: 'hand', color: C.ink, shadow: false });
      ctx.restore();
    }
    // simmer timer
    const tok = Math.floor(ease.inOutQuad(prog(lt, 0.2, 1.7)) * 2048);
    P.rect(ctx, 250, 1290, 580, 96, C.paper, { radius: 24, seed: 88 });
    P.text(ctx, '🔥 thinking: ' + tok.toLocaleString('en-US') + ' tok', 540, 1340, { size: 44, font: 'mono', color: C.ink, shadow: false });
  }

  /* ---------- plating (E) ---------- */
  function plate(ctx, t, lt, env) {
    const { C, ease, prog, lerp } = P;
    P.bg(ctx, '#3b3f46');
    ctx.save(); ctx.globalAlpha = 0.08;
    for (let i = 0; i < 40; i++) P.dot(ctx, P.hash(i) * 1080, 300 + P.hash(i + 50) * 1400, 30 + P.hash(i + 9) * 60, '#fff');
    ctx.restore();
    const px = 540, py = 930;
    P.circle(ctx, px, py, 360, '#FBFBF8', { seed: 91, shadow: { blur: 30, dy: 20, alpha: 0.4 } });
    ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(px, py, 270, 0, TAU); ctx.stroke(); ctx.restore();

    // sauce swoosh + dots
    const sp = ease.inOutCubic(prog(lt, 0.8, 0.5));
    if (sp > 0) {
      ctx.save(); ctx.strokeStyle = C.claude; ctx.lineCap = 'round';
      const n = Math.floor(40 * sp);
      for (let i = 0; i < n; i++) {
        const k = i / 40;
        const a0 = 2.1 + k * 1.9, a1 = 2.1 + (k + 1 / 40) * 1.9;
        ctx.lineWidth = 34 * Math.sin(Math.PI * (0.1 + k * 0.85));
        ctx.beginPath(); ctx.arc(px, py + 10, 220, a0, a1); ctx.stroke();
      }
      ctx.restore();
      [0, 1, 2].forEach(i => { if (sp > 0.6 + i * 0.15) P.dot(ctx, px + 120 + i * 50, py + 210 - i * 35, 16 - i * 4, C.claude); });
    }
    // the answer lands
    const land = ease.outBounce(prog(lt, 0.1, 0.55));
    if (lt > 0.1) {
      const s = lerp(1.5, 1, land);
      ctx.save(); P.zoom(ctx, s, px, py - 30); ctx.translate(px, py - 30); ctx.rotate(-0.08);
      P.rect(ctx, -190, -140, 380, 280, C.paper, { radius: 24, seed: 92, shadow: { blur: 10 + 30 * (1 - land), dy: 8 + 30 * (1 - land), alpha: 0.3 } });
      P.text(ctx, 'answer.md', -160, -95, { size: 34, font: 'mono', align: 'left', color: C.ink, shadow: false, weight: 800 });
      P.codeLines(ctx, -160, -50, 320, 5, 14, 34, 1);
      P.check(ctx, 140, 100, 26, 1);
      ctx.restore();
    }
    // garnish: tweezers place a tiny Clawd
    const gIn = ease.inOutCubic(prog(lt, 1.35, 0.4));
    const gOut = ease.inCubic(prog(lt, 1.85, 0.3));
    const gx = lerp(1150, px + 140, gIn) + gOut * 700, gy = lerp(600, py - 150, gIn) - gOut * 400;
    const placed = lt >= 1.75;
    const clawdX = px + 140, clawdY = py - 165;
    if (placed) P.claude(ctx, clawdX, clawdY, 50, { t, mood: 'happy', rot: 0.2 });
    // micro greens
    for (let i = 0; i < 7; i++) {
      if (lt < 1.95 + i * 0.05) break;
      const r = P.rng(i + 700);
      const lx = px - 160 + r() * 120, ly = py + 120 + r() * 60;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(r() * TAU);
      ctx.beginPath(); ctx.ellipse(0, 0, 20, 9, 0, 0, TAU); P.cut(ctx, C.green, { shadow: { blur: 4, dy: 3, alpha: 0.25 } });
      ctx.restore();
    }
    if (gIn > 0 && gOut < 1) {
      if (!placed) P.claude(ctx, gx, gy - 15, 50, { t, mood: 'wow', rot: 0.2 });
      ctx.save(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      P.shadow(ctx, 8, 6, 0.3);
      ctx.beginPath(); ctx.moveTo(gx - 10, gy - 20); ctx.lineTo(gx + 250, gy - 300); ctx.moveTo(gx + 10, gy - 10); ctx.lineTo(gx + 270, gy - 280); ctx.stroke();
      ctx.restore();
      P.arm(ctx, gx + 240, gy - 280, gx + 700, gy - 500, 72);
    }
    // chef Clawd peeks in: chef's kiss
    const peek = ease.outBack(prog(lt, 2.0, 0.4));
    if (peek > 0) {
      const cx = 200, cy = lerp(160, 500, peek);
      P.claude(ctx, cx, cy, 120, { t, mood: lt > 2.35 ? 'wink' : 'happy' });
      P.rect(ctx, cx - 70, cy - 150, 140, 60, '#fff', { radius: 10, seed: 95 });
      P.cloud(ctx, cx, cy - 190, 0.62, '#fff');
      P.bubble(ctx, 'mwah 🤌', 480, 440, 310, 490, { size: 52, pop: ease.outBack(prog(lt, 2.35, 0.3)) });
      P.star(ctx, 330, 400, 26 * P.pulse(lt, 2.35, 0.6), C.yellow, { points: 4, inner: 0.3 });
    }
    P.title(ctx, 'bon appétit ✨', 540, 1390, { size: 96, color: C.yellow, stroke: C.ink, pop: ease.outBack(prog(lt, 2.4, 0.4)), rot: -0.03 });
  }

  const CAPS = [[0, 'step 1: dice your requirements 🔪'], [B, 'a pinch of context. JUST a pinch 🧂'], [CC, 'whisk in 3 few-shot examples 🥚'],
    [D, "simmer until it stops saying 'wait'"], [E, 'plate it. garnish w/ confidence 🌿']];

  ClaudeTok.register({
    author: '@chef.context',
    caption: 'cooking a fresh prompt from scratch 👨‍🍳 no store-bought system prompts in this kitchen #asmr #cooking #promptengineering #fewshot',
    sound: 'kitchen asmr (no talking) · chef.context',
    avatar: '👨‍🍳',
    avatarColor: '#C08A5B',
    duration: DUR,
    bg: '#EEE8DE',
    likes: '892K', commentCount: '14.2K', saves: '233K', shares: '51K',
    thumb: 9.6,
    comments: [
      '@gordon.ramsLLM: the context is RAW. 200k tokens of RAW',
      '@few.shot: being cracked into a bowl is my love language',
      ['user', 'looks great but can you make it shorter, longer, and in french'],
    ],

    bpm: 90,
    subdiv: 4,
    onBeat(step, env) {
      const tt = env.t;
      if (step % 16 === 0) SFX.chord([['D4', 'F#4', 'A4', 'C#5'], ['B3', 'D4', 'F#4', 'A4'], ['G3', 'B3', 'D4', 'F#4'], ['A3', 'C#4', 'E4', 'G4']][(step / 16) % 4], 2.4, { type: 'triangle', vol: 0.035, gap: 0.04 });
      if (step % 8 === 4) SFX.hat({ vol: 0.025 });
      // whisk swish
      if (tt > WHISK && tt < D - 0.2 && step % 2 === 0) SFX.noise(0.14, { filter: 'bandpass', freq: 3000, slide: 1200, q: 1.5, vol: 0.07 });
      // sizzle ASMR while simmering (and a little on the plate)
      if (tt >= D && tt < E) {
        SFX.noise(0.22, { filter: 'highpass', freq: 3500 + Math.random() * 2500, vol: 0.035 + Math.random() * 0.03 });
        if (Math.random() < 0.35) SFX.tone(140 + Math.random() * 90, 0.07, { type: 'sine', slide: 320, vol: 0.06 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp } = P;
      let cutFlash = 0;
      if (t < D) counter(ctx, t, env, true);
      else if (t < E) stove(ctx, t, t - D, env);
      else plate(ctx, t, t - E, env);
      // the next order slides in (and becomes frame 0 again)
      if (t >= F) {
        const k = ease.inOutCubic(prog(t, F, 0.7));
        ctx.save(); ctx.translate(lerp(1080, 0, k), 0);
        P.shadow(ctx, 30, 0, 0.4, -10); ctx.fillStyle = '#EEE8DE'; ctx.fillRect(0, 0, 1080, 1920); P.noShadow(ctx);
        counter(ctx, 0, env, false);
        ctx.restore();
      }
      [D, E].forEach(c => { if (t >= c) cutFlash = Math.max(cutFlash, 1 - prog(t, c, 0.18)); });
      P.flash(ctx, cutFlash * 0.5);

      // title card up front
      const tp = ease.outBack(prog(t, 0, 0.45)) * (1 - ease.inCubic(prog(t, B - 0.3, 0.3)));
      P.title(ctx, 'cooking a fresh prompt\nfrom scratch 👨‍🍳', 540, 440, { size: 76, color: C.claude, stroke: '#fff', pop: tp, rot: -0.03, lineHeight: 1.1, maxWidth: 940 });

      // captions
      if (t < F) {
        for (let i = CAPS.length - 1; i >= 0; i--) {
          if (t >= CAPS[i][0]) {
            P.sticker(ctx, CAPS[i][1], 60, 1510, { size: 44, pop: ease.outBack(prog(t, CAPS[i][0] + 0.15, 0.35)), rot: i % 2 ? 0.015 : -0.02 });
            break;
          }
        }
      }

      /* ---------- one-shots ---------- */
      if (env.at(B)) SFX.whoosh({ vol: 0.12, dur: 0.35 });
      for (let i = 0; i < 5; i++) if (env.at(B + 0.3 + i * 0.07)) SFX.tick({ vol: 0.2 });
      for (let i = 0; i < 6; i++) if (env.at(B + 0.45 + i * 0.1)) SFX.noise(0.08, { filter: 'bandpass', freq: 6500, q: 2, vol: 0.12 });
      if (env.at(B + 1.05)) { SFX.pop({ vol: 0.16 }); SFX.noise(0.5, { filter: 'lowpass', freq: 1200, slide: 300, vol: 0.2 }); }
      if (env.at(B + 1.25)) SFX.boing({ vol: 0.12 });
      if (env.at(D)) { SFX.swoosh({ vol: 0.15 }); SFX.noise(0.9, { filter: 'highpass', freq: 3000, vol: 0.12 }); }
      if (env.at(E)) SFX.swoosh({ vol: 0.15 });
      if (env.at(E + 0.2)) SFX.thud({ vol: 0.25 });
      if (env.at(E + 0.8)) SFX.tone(400, 0.5, { type: 'sine', slide: 900, vol: 0.06 });
      if (env.at(E + 1.75)) SFX.ding('E6', { vol: 0.1 });
      if (env.at(E + 2.35)) { SFX.pop({ vol: 0.15 }); SFX.chime({ vol: 0.12 }); }
      if (env.at(F)) SFX.whoosh({ vol: 0.14, dur: 0.6 });
    },
  });
})();
