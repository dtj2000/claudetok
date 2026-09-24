/* ＡＥＳＴＨＥＴＩＣ. 2017 was a different time: a paper greek bust in
 * shades, a scrolling neon grid, a sliced sunset, VHS tracking, and the
 * paper that started it all. */
(function () {
  const { C, ease, prog, pulse, lerp, clamp, hash } = P;
  const D = 10;
  const HY = 1080;                      // horizon
  const HEAD = { x: 540, y: 880 };
  const MARBLE = { skin: '#EEE8F4', shade: '#CFC2E0', line: '#A99BC2' };
  const TINTS = [
    { skin: '#F9CFE6', shade: '#E7A6CB', line: '#B9739C' },
    { skin: '#C9F1F7', shade: '#98D9E6', line: '#5FA3B3' },
    { skin: '#E4D6FF', shade: '#BFA8F0', line: '#8A70C4' },
    { skin: '#FFE0C4', shade: '#F4B98E', line: '#C08660' },
    { skin: '#CFF6DF', shade: '#9CDDB8', line: '#5FA383' },
    { skin: '#FFD1DC', shade: '#F2A0B5', line: '#C06B85' },
    { skin: '#D6E4FF', shade: '#A6BEF2', line: '#6D86C4' },
  ];

  /* ---------- the sliced sunset ---------- */
  function sun(ctx, cx, cy, r, t) {
    ctx.save();
    const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.1);
    halo.addColorStop(0, 'rgba(255,120,200,0.45)'); halo.addColorStop(1, 'rgba(255,120,200,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 1080, HY);
    const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    g.addColorStop(0, '#FFF27A'); g.addColorStop(0.45, '#FFB35C'); g.addColorStop(1, '#FF3F9E');
    P.circle(ctx, cx, cy, r * 1.01, 'rgba(255,90,180,0.25)', { shadow: { blur: 50, dy: 0, alpha: 0.2 }, rim: false });
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    // slices that drift down and widen (even-odd holes)
    ctx.beginPath();
    ctx.rect(cx - r, cy - r, r * 2, r * 2);
    const ph = (t / D * 4) % 1, gap = r * 0.15;
    for (let n = -1; n < 8; n++) {
      const s = n + ph;
      const gy = cy - r * 0.05 + s * gap, gh = Math.min(3 + s * 4.5, gap * 0.8);
      if (gh <= 1 || gy > cy + r) continue;
      ctx.rect(cx - r, gy, r * 2, gh);
    }
    ctx.fillStyle = g; ctx.fill('evenodd');
    ctx.restore();
  }

  /* ---------- scrolling perspective neon grid ---------- */
  function grid(ctx, t) {
    const fl = ctx.createLinearGradient(0, HY, 0, 1920);
    fl.addColorStop(0, '#3B0A63'); fl.addColorStop(1, '#14021F');
    ctx.save();
    ctx.fillStyle = fl; ctx.fillRect(0, HY, 1080, 1920 - HY);
    // sun reflection on the floor
    const rg = ctx.createRadialGradient(540, HY, 10, 540, HY, 520);
    rg.addColorStop(0, 'rgba(255,90,190,0.55)'); rg.addColorStop(1, 'rgba(255,90,190,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, HY, 1080, 600);
    ctx.strokeStyle = '#FF4FD8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.shadowColor = '#FF4FD8'; ctx.shadowBlur = 18 * P.scale;
    const phase = (t / D * 10) % 1;
    ctx.beginPath();
    for (let k = 0; k < 40; k++) {
      const z = k + 1 - phase;
      const y = HY + 760 / z;
      if (y > 1930) continue;
      ctx.moveTo(0, y); ctx.lineTo(1080, y);
    }
    for (let j = -14; j <= 14; j++) {
      ctx.moveTo(540 + j * 6, HY); ctx.lineTo(540 + j * 230, 1920);
    }
    ctx.stroke();
    ctx.restore();
    // horizon glow line
    ctx.save(); ctx.fillStyle = '#FFB3F0'; ctx.shadowColor = '#FF4FD8'; ctx.shadowBlur = 24 * P.scale;
    ctx.fillRect(0, HY - 3, 1080, 6); ctx.restore();
  }

  /* ---------- palm tree silhouette ---------- */
  function palm(ctx, x0, y0, x1, y1, bend, t, seed, col = '#2A0A40') {
    const cx = (x0 + x1) / 2 + bend, cy = (y0 + y1) / 2;
    const pt = s => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1];
    const L = [], R = [];
    for (let i = 0; i <= 12; i++) {
      const s = i / 12, [px, py] = pt(s), [qx, qy] = pt(Math.min(1, s + 0.01));
      const a = Math.atan2(qy - py, qx - px) + Math.PI / 2, w = lerp(24, 12, s);
      L.push([px + Math.cos(a) * w, py + Math.sin(a) * w]);
      R.push([px - Math.cos(a) * w, py - Math.sin(a) * w]);
    }
    P.poly(ctx, L.concat(R.reverse()), col, { seed, amp: 2, shadow: { blur: 10, dy: 6, alpha: 0.3 } });
    // fronds
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k - 3.5) * 0.42 + Math.sin(t * 1.3 + k + seed) * 0.05;
      const len = 200 + hash(seed + k) * 70;
      const spine = s => [x1 + Math.cos(a) * s * len, y1 + Math.sin(a) * s * len + 0.6 * len * s * s];
      const A = [], B = [];
      for (let i = 0; i <= 10; i++) {
        const s = i / 10, [px, py] = spine(s), [qx, qy] = spine(Math.min(1, s + 0.02));
        const n = Math.atan2(qy - py, qx - px) + Math.PI / 2, w = Math.sin(Math.PI * s) * len * 0.13;
        const saw = i % 2 ? 0.55 : 1;           // jagged frond edge
        A.push([px + Math.cos(n) * w * saw, py + Math.sin(n) * w * saw]);
        B.push([px - Math.cos(n) * w * saw, py - Math.sin(n) * w * saw]);
      }
      P.poly(ctx, A.concat(B.reverse()), col, { seed: seed + k, amp: 1.5, shadow: { blur: 8, dy: 5, alpha: 0.25 } });
    }
    P.circle(ctx, x1, y1 + 6, 18, col, { seed, shadow: false });
  }

  /* ---------- marble head (x, y is head center) ---------- */
  function head(ctx, x, y, s, pal, shades, t) {
    P.circle(ctx, x - 112 * s, y + 12 * s, 22 * s, pal.shade, { ry: 36 * s, seed: 3, shadow: { blur: 8, dy: 5, alpha: 0.2 } });
    P.circle(ctx, x + 112 * s, y + 12 * s, 22 * s, pal.shade, { ry: 36 * s, seed: 4, shadow: { blur: 8, dy: 5, alpha: 0.2 } });
    P.circle(ctx, x, y, 114 * s, pal.skin, { ry: 140 * s, seed: 5, shadow: { blur: 16, dy: 10, alpha: 0.3 } });
    // side shading
    ctx.save();
    P.wobblyCircle(ctx, x, y, 114 * s, 5, 3, 140 * s); ctx.clip();
    ctx.fillStyle = pal.shade; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.ellipse(x + 120 * s, y + 20 * s, 80 * s, 170 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // curls
    for (let k = 0; k < 13; k++) {
      const a = Math.PI * (1.02 + k * 0.96 / 12);
      const cx = x + Math.cos(a) * 112 * s, cy = y + Math.sin(a) * 132 * s + 8 * s;
      P.circle(ctx, cx, cy, (26 + (k % 3) * 5) * s, k % 2 ? pal.skin : pal.shade, { seed: 20 + k, amp: 2, shadow: { blur: 5, dy: 3, alpha: 0.18 } });
      ctx.save(); ctx.strokeStyle = pal.line; ctx.lineWidth = 3 * s; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(cx, cy, 12 * s, 0.5, 4.2); ctx.stroke(); ctx.restore();
    }
    // face
    ctx.save();
    ctx.strokeStyle = pal.line; ctx.lineCap = 'round'; ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(x - 70 * s, y - 22 * s); ctx.quadraticCurveTo(x - 40 * s, y - 38 * s, x - 12 * s, y - 24 * s);
    ctx.moveTo(x + 12 * s, y - 24 * s); ctx.quadraticCurveTo(x + 40 * s, y - 38 * s, x + 70 * s, y - 22 * s);
    // blank statue eyes
    ctx.moveTo(x - 64 * s, y + 2 * s); ctx.quadraticCurveTo(x - 40 * s, y - 12 * s, x - 18 * s, y + 2 * s);
    ctx.moveTo(x + 18 * s, y + 2 * s); ctx.quadraticCurveTo(x + 40 * s, y - 12 * s, x + 64 * s, y + 2 * s);
    // lips + chin
    ctx.moveTo(x - 26 * s, y + 82 * s); ctx.quadraticCurveTo(x, y + 92 * s, x + 26 * s, y + 82 * s);
    ctx.moveTo(x - 14 * s, y + 104 * s); ctx.quadraticCurveTo(x, y + 110 * s, x + 14 * s, y + 104 * s);
    ctx.stroke();
    ctx.restore();
    P.poly(ctx, [[x - 4 * s, y - 20 * s], [x - 22 * s, y + 46 * s], [x + 8 * s, y + 52 * s]], pal.shade, { seed: 9, amp: 1, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
    if (shades !== null) glasses(ctx, x, y + shades * s, s);
  }

  function glasses(ctx, x, y, s) {
    const lens = (dx) => [[x + dx - 72 * s, y - 20 * s], [x + dx + 8 * s, y - 20 * s], [x + dx + 2 * s, y + 18 * s], [x + dx - 62 * s, y + 20 * s]];
    ctx.save();
    ctx.strokeStyle = C.black; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 112 * s, y - 14 * s); ctx.lineTo(x + 112 * s, y - 14 * s); ctx.stroke();
    ctx.restore();
    const g = ctx.createLinearGradient(0, y - 20 * s, 0, y + 20 * s);
    g.addColorStop(0, '#FF6EC7'); g.addColorStop(0.55, '#7A2AB8'); g.addColorStop(1, '#3FE0FF');
    [-6, 70].forEach((dx, i) => {
      P.wobblyPoly(ctx, lens(dx), 40 + i, 1.5 * s, 12);
      P.cut(ctx, g, { stroke: C.black, lineWidth: 7 * s, shadow: { blur: 8, dy: 5, alpha: 0.35 } });
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + dx - 56 * s, y - 10 * s); ctx.lineTo(x + dx - 38 * s, y + 8 * s); ctx.stroke(); ctx.restore();
    });
  }

  function bust(ctx, t, shades) {
    const { x, y } = HEAD;
    // plinth
    P.rect(ctx, x - 215, y + 455, 430, 70, '#D8CDE6', { radius: 8, seed: 50 });
    P.rect(ctx, x - 170, y + 520, 340, 180, '#E6DEF0', { radius: 6, seed: 51 });
    P.text(ctx, 'VASWANI ET AL.', x, y + 580, { size: 30, font: 'serif', color: '#8C7BAA', letter: 6, shadow: false });
    P.text(ctx, 'MMXVII', x, y + 630, { size: 36, font: 'serif', color: '#8C7BAA', letter: 10, shadow: false });
    // chest + drape
    const ch = [[-270, 460], [-262, 330], [-220, 250], [-110, 212], [110, 212], [220, 250], [262, 330], [270, 460]].map(([a, b]) => [x + a, y + b]);
    P.poly(ctx, ch, MARBLE.skin, { seed: 52, amp: 3, shadow: { blur: 18, dy: 12, alpha: 0.3 } });
    P.poly(ctx, [[x - 250, y + 270], [x - 170, y + 240], [x + 250, y + 440], [x + 210, y + 460], [x - 260, y + 330]], MARBLE.shade, { seed: 53, amp: 3, shadow: { blur: 6, dy: 4, alpha: 0.2 } });
    ctx.save(); ctx.strokeStyle = MARBLE.line; ctx.lineWidth = 4; ctx.globalAlpha = 0.6; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 4; k++) { ctx.moveTo(x - 200 + k * 40, y + 285 + k * 18); ctx.quadraticCurveTo(x - 90 + k * 60, y + 330 + k * 30, x + 40 + k * 55, y + 360 + k * 25); }
    ctx.stroke(); ctx.restore();
    // neck
    P.rect(ctx, x - 50, y + 90, 100, 150, MARBLE.skin, { radius: 30, seed: 54, shadow: { blur: 8, dy: 6, alpha: 0.2 } });
    head(ctx, x, y, 1, MARBLE, shades, t);
  }

  function dolphin(ctx, x, y, rot, t) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    P.poly(ctx, [[-10, -34], [-46, -82], [-52, -30]], '#58B8DE', { seed: 60, amp: 2 });
    P.poly(ctx, [[130, 4], [96, -20], [50, -34], [-10, -40], [-70, -30], [-126, -8], [-162, -38], [-150, 0], [-164, 34], [-120, 10], [-60, 24], [10, 30], [70, 24], [112, 14]], '#7FD6F2', { seed: 61, amp: 2, shadow: { blur: 14, dy: 10, alpha: 0.3 } });
    P.poly(ctx, [[100, 12], [40, 22], [-40, 22], [-100, 8], [-40, 12], [40, 10]], '#D8F6FF', { seed: 62, amp: 1, shadow: false });
    P.dot(ctx, 82, -8, 6, C.ink);
    P.poly(ctx, [[20, 20], [-10, 54], [-30, 22]], '#58B8DE', { seed: 63, amp: 1, shadow: false });
    // Clawd riding, in tiny shades
    P.claude(ctx, -14, -84, 46, { t, mood: 'happy', seed: 42, rot: -rot * 0.5 });
    ctx.save(); ctx.translate(-14, -84); ctx.rotate(-rot * 0.5);
    ctx.fillStyle = C.black; ctx.fillRect(-26, -12, 22, 12); ctx.fillRect(4, -12, 22, 12); ctx.fillRect(-26, -12, 52, 4);
    ctx.restore();
    ctx.restore();
  }

  /** VHS tracking: displace strips of the already-drawn frame. */
  function vhs(ctx, t, amt) {
    const cv = ctx.canvas;
    const bands = [((t / 5) % 1) * 2300 - 200];
    if (amt > 0.05) bands.push(((t * 1.7) % 1) * 1920, 600 + hash(P.boil(t, 20)) * 900);
    const tr = ctx.getTransform ? ctx.getTransform() : null;
    bands.forEach((by, bi) => {
      const bh = 70 + amt * 160;
      if (tr && cv && cv.width) {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let k = 0; k * 12 < bh; k++) {
          const vy = by + k * 12;
          const dy = Math.round(tr.d * vy + tr.f), h = Math.ceil(tr.d * 12);
          if (dy < 0 || dy + h > cv.height) continue;
          const off = (hash(P.boil(t, 24) * 31 + k + bi * 7) - 0.5) * (14 + amt * 140) * tr.a;
          ctx.drawImage(cv, 0, dy, cv.width, h, off, dy, cv.width, h);
        }
        ctx.restore();
      }
      // static speckles + bright tracking line
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let k = 0; k < 30; k++) {
        const hx = hash(P.boil(t, 24) * 13 + k + bi * 50);
        ctx.globalAlpha = 0.2 + 0.5 * hash(k * 3 + P.boil(t, 24));
        ctx.fillRect(hx * 1080, by + hash(k + P.boil(t, 24) * 7) * bh, 6 + hx * 40, 3);
      }
      ctx.globalAlpha = 0.25; ctx.fillRect(0, by + bh - 4, 1080, 4);
      ctx.restore();
    });
  }

  function chromeText(ctx, str, x, y, size, letter) {
    const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, '#FFA8E8'); g.addColorStop(0.55, '#B06CFF'); g.addColorStop(1, '#6FF0FF');
    const o = { size, font: 'sans', weight: 900, letter, shadow: false };
    P.text(ctx, str, x - 7, y, { ...o, color: 'rgba(63,224,255,0.75)' });
    P.text(ctx, str, x + 7, y, { ...o, color: 'rgba(255,60,190,0.75)' });
    P.text(ctx, str, x, y, { ...o, color: g, stroke: '#3A0A5E', strokeWidth: size * 0.12, shadow: true });
  }

  ClaudeTok.register({
    author: '@attention.wave',
    caption: '2017 was a different time 🌴 512 tokens of context and we were HAPPY #vaporwave #aesthetic #transformers #nostalgia',
    sound: 'ｓｏｆｔｍａｘ ｓｕｎｓｅｔ (slowed + reverb) · attention.wave',
    avatar: '🗿',
    avatarColor: '#B06CFF',
    duration: D,
    bg: '#2B0A4A',
    thumb: 6.4,
    likes: '4.2M', commentCount: '77.7K', saves: '1.1M', shares: '340K',
    comments: [
      '@bert.base.uncased: i was there. we had [CLS] tokens and dreams',
      ['lstm.ghost', 'they said attention was all you need. nobody asked about me 🥲'],
      '@positional.encoding: sinusoidal. vintage. never going back',
    ],

    bpm: 72,
    subdiv: 2,
    onBeat(step, env) {
      const chords = [
        ['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'],
        ['G3', 'B3', 'D4', 'F4'], ['F3', 'A3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'G4'],
      ];
      const roots = ['F2', 'E2', 'D2', 'G2', 'F2', 'A2'];
      const glitch = env.t > 2.75 && env.t < 3.35;
      if (step % 4 === 0) {
        const i = (step / 4) % 6;
        chords[i].forEach((n, k) => {
          SFX.tone(n, 1.9, { type: 'triangle', vol: 0.03, attack: 0.25, detune: -14, pan: -0.3, when: k * 0.02 });
          SFX.tone(n, 1.9, { type: 'triangle', vol: 0.03, attack: 0.25, detune: 13, pan: 0.3, when: k * 0.02 });
        });
        SFX.tone(roots[i], 1.6, { type: 'sine', vol: 0.12, attack: 0.04 });
        // dreamy echoing top note
        const top = chords[i][3].replace(/\d/, d => +d + 1);
        [0.83, 1.25, 1.66].forEach((w, k) => SFX.tone(top, 0.5, { type: 'sine', vol: 0.03 / (k + 1), when: w, pan: k % 2 ? 0.5 : -0.5 }));
      }
      if (glitch) return;
      if (step % 8 === 0) SFX.tone(110, 0.5, { type: 'sine', slide: 35, vol: 0.28, attack: 0.003 });
      if (step % 8 === 4) { SFX.noise(0.35, { filter: 'lowpass', freq: 2200, vol: 0.12 }); SFX.tone(190, 0.1, { type: 'triangle', vol: 0.08 }); }
      if (step % 2 === 1) SFX.hat({ vol: 0.025 });
    },

    draw(ctx, t, env) {
      const glitch = pulse(t, 2.8, 0.5);
      ctx.save();
      if (glitch > 0) P.shake(ctx, t, 16 * glitch);

      /* sky */
      const sky = ctx.createLinearGradient(0, 0, 0, HY);
      sky.addColorStop(0, '#1C0638'); sky.addColorStop(0.35, '#5B1A86'); sky.addColorStop(0.7, '#D2489C'); sky.addColorStop(1, '#FF9A8B');
      ctx.fillStyle = sky; ctx.fillRect(-40, -40, 1160, HY + 40);
      P.stars(ctx, t, 17, 26, '#FFD6F5', [0, 280, 1080, 380]);
      sun(ctx, 540, 850, 270, t);
      // far paper mountains
      P.poly(ctx, [[-20, HY], [120, 930], [230, 990], [330, 900], [470, HY]], '#6A1F8F', { seed: 70, amp: 3, shadow: { blur: 10, dy: -2, alpha: 0.2 } });
      P.poly(ctx, [[600, HY], [740, 920], [830, 970], [950, 880], [1100, HY]], '#6A1F8F', { seed: 71, amp: 3, shadow: { blur: 10, dy: -2, alpha: 0.2 } });
      grid(ctx, t);

      /* palms */
      palm(ctx, 90, 1330, 250, 640, -60, t, 1);
      palm(ctx, 1010, 1260, 860, 690, 70, t, 9);

      /* multi-head attention: clones fan out behind the bust */
      const fan = ease.inOutCubic(prog(t, 6.0, 0.6)) * (1 - ease.inOutCubic(prog(t, 7.45, 0.5)));
      if (fan > 0.01) {
        for (let k = 0; k < 7; k++) {
          const a = Math.PI * (1.06 + k * 0.88 / 6);
          const hx = lerp(HEAD.x, HEAD.x + Math.cos(a) * 380, fan);
          const hy = lerp(HEAD.y, HEAD.y + 20 + Math.sin(a) * 250 + Math.sin(t * 3 + k) * 10, fan);
          head(ctx, hx, hy, 0.42 * (0.6 + 0.4 * fan), TINTS[k], -8, t);
        }
      }

      /* the bust + shades */
      const drop = ease.outBounce(prog(t, 1.4, 0.45));
      const lift = ease.inCubic(prog(t, 9.3, 0.45));
      const shades = t >= 1.4 && lift < 1 ? lerp(-760, -8, drop) - lift * 760 : null;
      bust(ctx, t, shades);
      P.burstLines(ctx, HEAD.x, HEAD.y, 170, prog(t, 1.8, 0.35), '#FFF27A', 12, 8);
      if (t > 1.8 && t < 2.8) {
        const k = ease.outBack(prog(t, 1.85, 0.3)) * (1 - prog(t, 2.6, 0.2));
        P.text(ctx, 'deal with it', 800, 700, { size: 56, font: 'marker', color: '#FFF27A', stroke: '#3A0A5E', strokeWidth: 10, rot: 0.12, scale: k });
      }
      if (fan > 0.3) {
        P.title(ctx, 'MULTI-HEAD', 540, 1250, { size: 96, color: '#FF6EC7', stroke: '#2A0A40', rot: -0.04, pop: ease.outBack(prog(t, 6.25, 0.4)) * clamp(fan * 1.4) });
        P.text(ctx, 'h = 8', 540, 1340, { size: 48, font: 'mono', color: '#6FF0FF', stroke: '#2A0A40', strokeWidth: 8, scale: clamp(fan * 1.4) });
      }

      /* dolphin + Clawd leap */
      const dp = prog(t, 3.6, 2.1);
      if (dp > 0 && dp < 1) {
        const dx = lerp(-260, 1340, dp), dy = 1180 - 600 * Math.sin(Math.PI * dp);
        const rot = Math.atan2(-600 * Math.PI * Math.cos(Math.PI * dp), 1600);
        for (let k = 1; k <= 5; k++) {
          const q = dp - k * 0.035;
          if (q > 0) P.star(ctx, lerp(-260, 1340, q) - 120, 1180 - 600 * Math.sin(Math.PI * q) + 10, 16 - k * 2, k % 2 ? '#FFF27A' : '#6FF0FF', { shadow: false, rot: t * 4 + k });
        }
        dolphin(ctx, dx, dy, rot, t);
      }

      /* title */
      const typed = P.typed('ATTENTION', prog(t, 0.1, 0.8));
      chromeText(ctx, typed, 540, 430, 124, 18);
      const sub = ease.outBack(prog(t, 0.9, 0.4));
      if (sub > 0) {
        ctx.save(); P.zoom(ctx, sub, 540, 540);
        chromeText(ctx, 'IS ALL YOU NEED', 540, 540, 60, 16);
        ctx.restore();
      }
      if (fan < 0.2) {
        ctx.save(); ctx.globalAlpha = clamp(prog(t, 1.2, 0.4)) * (1 - fan * 5);
        P.text(ctx, 'ア テ ン シ ョ ン', 540, 615, { size: 38, font: 'sans', color: '#FFD6F5', weight: 800, letter: 10, shadow: false });
        ctx.restore();
      }

      /* 2017 popup */
      const pop = ease.outBack(prog(t, 7.9, 0.35)) * (1 - ease.inCubic(prog(t, 9.0, 0.25)));
      if (pop > 0.01) {
        ctx.save(); P.zoom(ctx, pop, 540, 1300);
        P.window(ctx, 170, 1150, 740, 300, 'attention.exe', { bg: '#D9D3E6', bar: 'rgba(58,10,94,0.85)', titleColor: '#fff', seed: 8 });
        P.claude(ctx, 260, 1300, 52, { t, mood: 'wink', seed: 42 });
        P.text(ctx, 'context window: 512 tokens.', 340, 1270, { size: 40, font: 'marker', color: C.ink, align: 'left', shadow: false });
        P.text(ctx, "that's plenty ☺", 340, 1322, { size: 40, font: 'marker', color: C.ink, align: 'left', shadow: false });
        P.rect(ctx, 700, 1370, 170, 58, '#EEE8F4', { radius: 8, seed: 12, stroke: '#3A0A5E', lineWidth: 4 });
        P.text(ctx, 'OK', 785, 1400, { size: 38, font: 'mono', color: C.ink, shadow: false });
        ctx.restore();
      }

      P.sticker(ctx, '2017 was a different time', 70, 1530, { pop: ease.outBack(prog(t, 0.6, 0.4)), bg: '#FFE6F6', color: '#7A2AB8', rot: -0.03 });

      /* VCR OSD */
      const blink = Math.floor(t * 2) % 2 === 0;
      P.text(ctx, (blink ? '▶ ' : '   ') + 'PLAY', 70, 330, { size: 40, font: 'mono', color: '#fff', align: 'left', weight: 800, shadow: false, stroke: 'rgba(0,0,0,0.35)', strokeWidth: 6 });
      P.text(ctx, 'SP  0:00:0' + Math.floor(t), 70, 380, { size: 30, font: 'mono', color: '#fff', align: 'left', weight: 700, shadow: false });
      P.text(ctx, 'JUN.12 2017', 1010, 330, { size: 40, font: 'mono', color: '#FFB347', align: 'right', weight: 800, shadow: false, stroke: 'rgba(0,0,0,0.35)', strokeWidth: 6 });
      ctx.restore();

      /* VHS: tracking wobble, glitch, scanlines, vignette */
      vhs(ctx, t, glitch);
      if (glitch > 0 && ctx.canvas && ctx.canvas.width && ctx.getTransform) {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 0.35 * glitch; ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(ctx.canvas, 14 * glitch * P.scale, 0);
        ctx.restore();
        P.flash(ctx, glitch * 0.25, '#3FE0FF');
        P.text(ctx, 'TRACKING', 540, 960, { size: 70, font: 'mono', color: '#fff', weight: 800, shadow: false, scale: 1 + glitch * 0.1 });
      }
      ctx.save();
      ctx.fillStyle = 'rgba(10,0,20,0.12)';
      for (let y = 0; y < 1920; y += 6) ctx.fillRect(0, y, 1080, 2);
      const vg = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250);
      vg.addColorStop(0, 'rgba(20,0,40,0)'); vg.addColorStop(1, 'rgba(20,0,40,0.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();

      /* sounds */
      if (env.at(0.1)) SFX.tone('C5', 0.6, { type: 'sine', vol: 0.06, slide: 'G5' });
      if (env.at(1.4)) SFX.swoosh({ vol: 0.12 });
      if (env.at(1.8)) { SFX.thud({ vol: 0.35 }); SFX.tone(70, 0.9, { type: 'sine', slide: 40, vol: 0.2 }); }
      if (env.at(2.8)) { SFX.tone(320, 0.55, { type: 'sawtooth', slide: 40, vol: 0.06 }); SFX.noise(0.5, { filter: 'highpass', freq: 3000, vol: 0.08 }); }
      if (env.at(3.6)) SFX.whoosh({ vol: 0.12, dur: 0.8 });
      if (env.at(4.5)) { SFX.tone(1800, 0.12, { slide: 2600, vol: 0.06 }); SFX.tone(2000, 0.12, { slide: 2900, vol: 0.05, when: 0.14 }); }
      if (env.at(6.0)) SFX.chord(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'], 0.6, { gap: 0.07, type: 'triangle', vol: 0.06 });
      if (env.at(7.9)) SFX.chord(['E5', 'B5'], 0.5, { gap: 0.1, type: 'sine', vol: 0.12 });
      if (env.at(9.3)) SFX.swoosh({ vol: 0.1, freq: 400, slide: 3000 });
    },
  });
})();
