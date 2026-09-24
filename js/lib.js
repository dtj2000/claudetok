/* ClaudeTok helper library.
 *
 *   P   – drawing helpers for the paper-cutout look (window.P)
 *   SFX – tiny WebAudio synth for sound effects + music (window.SFX)
 *
 * Every video draws in a virtual 1080 x 1920 canvas. See README.md.
 */
(function () {
  'use strict';

  const W = 1080, H = 1920, TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ *
   *  Math / timing
   * ------------------------------------------------------------------ */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
  /** 0..1 progress of `t` through the window [start, start+dur]. */
  const prog = (t, start, dur) => clamp((t - start) / dur);
  /** 0 → 1 → 0 pulse over [start, start+dur]. */
  const pulse = (t, start, dur) => { const p = prog(t, start, dur); return Math.sin(p * Math.PI); };
  /** Stepped time for a stop-motion "boil" (default 8 fps). */
  const boil = (t, fps = 8) => Math.floor(t * fps);

  function rng(seed = 1) {
    let s = (seed * 2654435761) >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  /** Deterministic hash noise in [0,1) for integer-ish inputs. */
  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  const ease = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
    outBounce: t => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  };

  /* ------------------------------------------------------------------ *
   *  Palette – soft construction-paper colors
   * ------------------------------------------------------------------ */
  const C = {
    claude: '#E8845C',     // the orange mascot / arm
    claudeDark: '#C96A45',
    cream: '#F6EEDD',
    paper: '#FBF7EE',
    ink: '#2B2233',
    night: '#2E2A5C',
    nightDeep: '#1E1B45',
    purple: '#6B4E9B',
    pink: '#F2B8C6',
    rose: '#E0607E',
    red: '#E0484E',
    yellow: '#F5C84B',
    mustard: '#E5A93B',
    green: '#5DB36A',
    mint: '#8FD3B6',
    teal: '#2F8F7A',
    sky: '#8EC9E8',
    blue: '#4F7FD9',
    brown: '#8A5A3C',
    wood: '#C08A5B',
    white: '#FFFFFF',
    black: '#1A1620',
  };

  /* ------------------------------------------------------------------ *
   *  Fonts (loaded in index.html from Google Fonts, with fallbacks)
   * ------------------------------------------------------------------ */
  const FONTS = {
    hand: '"Gaegu", "Comic Sans MS", cursive',
    marker: '"Patrick Hand", "Comic Sans MS", cursive',
    bubble: '"Fredoka", "Arial Rounded MT Bold", sans-serif',
    mono: '"JetBrains Mono", Consolas, monospace',
    sans: '"Nunito", system-ui, sans-serif',
  };

  /* ------------------------------------------------------------------ *
   *  Core drawing state. The engine sets P.scale each frame
   *  (device pixels per virtual pixel) so shadows look the same at
   *  every screen size (canvas shadows ignore the transform).
   * ------------------------------------------------------------------ */
  const P = {
    W, H, TAU, C, FONTS, ease,
    clamp, lerp, map, prog, pulse, boil, rng, hash,
    scale: 1,
  };

  /** Set a paper drop shadow on ctx (call inside save/restore). */
  P.shadow = function (ctx, blur = 10, dy = 7, alpha = 0.28, dx = 0) {
    ctx.shadowColor = `rgba(20,10,30,${alpha})`;
    ctx.shadowBlur = blur * P.scale;
    ctx.shadowOffsetX = dx * P.scale;
    ctx.shadowOffsetY = dy * P.scale;
  };
  P.noShadow = function (ctx) {
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  };

  /**
   * Fill the current path like a piece of cut paper:
   * drop shadow + fill + a faint lighter rim.
   *   opts: { shadow: true|false|{blur,dy,alpha}, rim: true, stroke, lineWidth }
   */
  P.cut = function (ctx, color, opts = {}) {
    ctx.save();
    if (opts.shadow !== false) {
      const s = typeof opts.shadow === 'object' ? opts.shadow : {};
      P.shadow(ctx, s.blur ?? 10, s.dy ?? 7, s.alpha ?? 0.28);
    }
    ctx.fillStyle = color;
    ctx.fill();
    P.noShadow(ctx);
    if (opts.rim !== false) {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (opts.stroke) {
      ctx.strokeStyle = opts.stroke;
      ctx.lineWidth = opts.lineWidth || 4;
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ---------- wobbly (hand-cut) path builders ---------- */

  /** Closed polygon through pts [[x,y],...] with jittered edges. */
  P.wobblyPoly = function (ctx, pts, seed = 1, amp = 4, seg = 28) {
    const r = rng(seed);
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const n = Math.max(1, Math.round(len / seg));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const j = k === 0 ? 0 : 1;
        const x = lerp(x1, x2, t) + (r() - 0.5) * amp * 2 * j;
        const y = lerp(y1, y2, t) + (r() - 0.5) * amp * 2 * j;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  };

  /** Wobbly rounded rect path. */
  P.wobblyRect = function (ctx, x, y, w, h, seed = 1, amp = 3, radius = 14) {
    const r = rng(seed);
    const pts = [];
    const rad = Math.min(radius, w / 2, h / 2);
    const corner = (cx, cy, a0) => {
      for (let i = 0; i <= 4; i++) {
        const a = a0 + (i / 4) * (Math.PI / 2);
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
    };
    corner(x + w - rad, y + rad, -Math.PI / 2);
    corner(x + w - rad, y + h - rad, 0);
    corner(x + rad, y + h - rad, Math.PI / 2);
    corner(x + rad, y + rad, Math.PI);
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const n = Math.max(1, Math.round(len / 30));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const px = lerp(x1, x2, t) + (r() - 0.5) * amp * 2;
        const py = lerp(y1, y2, t) + (r() - 0.5) * amp * 2;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
  };

  /** Wobbly circle / ellipse path. */
  P.wobblyCircle = function (ctx, x, y, rx, seed = 1, amp = 3, ry = rx) {
    const r = rng(seed);
    const n = Math.max(16, Math.round((rx + ry) / 6));
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const j = 1 + (r() - 0.5) * (amp / Math.max(rx, 1)) * 2;
      const px = x + Math.cos(a) * rx * j, py = y + Math.sin(a) * ry * j;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  /* ---------- convenience: build + cut in one call ---------- */
  P.rect = function (ctx, x, y, w, h, color, o = {}) {
    P.wobblyRect(ctx, x, y, w, h, o.seed ?? 1, o.amp ?? 3, o.radius ?? 14);
    P.cut(ctx, color, o);
  };
  P.circle = function (ctx, x, y, r, color, o = {}) {
    P.wobblyCircle(ctx, x, y, r, o.seed ?? 1, o.amp ?? 3, o.ry ?? r);
    P.cut(ctx, color, o);
  };
  P.poly = function (ctx, pts, color, o = {}) {
    P.wobblyPoly(ctx, pts, o.seed ?? 1, o.amp ?? 4);
    P.cut(ctx, color, o);
  };

  /* ------------------------------------------------------------------ *
   *  Backgrounds
   * ------------------------------------------------------------------ */
  P.bg = function (ctx, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  /** Vertical gradient background. */
  P.gradient = function (ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  };

  /** Sunburst rays behind something. */
  P.rays = function (ctx, cx, cy, n, c1, c2, rot = 0, radius = 2600) {
    ctx.save();
    ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = c2;
    for (let i = 0; i < n; i++) {
      const a0 = rot + (i / n) * TAU, a1 = a0 + TAU / n / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius);
      ctx.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  /** Graph-paper grid (cutting mat). */
  P.grid = function (ctx, color, line = 'rgba(255,255,255,0.14)', step = 60) {
    ctx.save();
    ctx.fillStyle = color; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = line; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = line.replace(/[\d.]+\)$/, m => (parseFloat(m) * 1.8).toFixed(2) + ')');
    ctx.beginPath();
    for (let x = 0; x <= W; x += step * 5) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += step * 5) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.restore();
  };

  /** Vertical wallpaper stripes. */
  P.stripes = function (ctx, c1, c2, width = 90, angle = 0) {
    ctx.save();
    ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2); ctx.rotate(angle); ctx.translate(-W * 1.5, -H * 1.5);
    ctx.fillStyle = c2;
    for (let x = 0; x < W * 3; x += width * 2) ctx.fillRect(x, 0, width, H * 3);
    ctx.restore();
  };

  /** Gingham / checkered cloth in a region. */
  P.gingham = function (ctx, x, y, w, h, color, size = 70, base = '#fff') {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color; ctx.globalAlpha = 0.55;
    for (let i = 0; i * size < w; i += 2) ctx.fillRect(x + i * size, y, size, h);
    for (let j = 0; j * size < h; j += 2) ctx.fillRect(x, y + j * size, w, size);
    ctx.globalAlpha = 1;
    for (let i = 0; i * size < w; i += 2)
      for (let j = 0; j * size < h; j += 2) ctx.fillRect(x + i * size, y + j * size, size, size);
    ctx.restore();
  };

  /** A torn paper strip: fills from edge y down (or up) with a ragged top. */
  P.tornEdge = function (ctx, y, color, seed = 1, fromBottom = true, amp = 14) {
    const r = rng(seed);
    ctx.beginPath();
    ctx.moveTo(0, fromBottom ? H + 10 : -10);
    for (let x = 0; x <= W + 20; x += 18) ctx.lineTo(x, y + (r() - 0.5) * amp * 2);
    ctx.lineTo(W + 20, fromBottom ? H + 10 : -10);
    ctx.closePath();
    P.cut(ctx, color, { shadow: { blur: 12, dy: fromBottom ? -6 : 6, alpha: 0.25 } });
  };

  /** Twinkling paper stars. */
  P.stars = function (ctx, t, seed = 7, count = 30, color = C.yellow, area = [0, 0, W, H * 0.5]) {
    const r = rng(seed);
    for (let i = 0; i < count; i++) {
      const x = area[0] + r() * area[2], y = area[1] + r() * area[3];
      const s = 8 + r() * 16;
      const tw = 0.6 + 0.4 * Math.sin(t * (1 + r() * 3) + i);
      if (r() < 0.35) P.dot(ctx, x, y, s * 0.35 * tw, '#fff');
      else P.star(ctx, x, y, s * tw, color, { shadow: false, rot: r() });
    }
  };

  /* ------------------------------------------------------------------ *
   *  Shapes
   * ------------------------------------------------------------------ */
  P.dot = function (ctx, x, y, r, color) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  };

  P.star = function (ctx, x, y, r, color, o = {}) {
    const pts = [];
    const rot = o.rot || 0, n = o.points || 5, inner = o.inner || 0.45;
    for (let i = 0; i < n * 2; i++) {
      const a = rot - Math.PI / 2 + (i / (n * 2)) * TAU;
      const rr = i % 2 ? r * inner : r;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    P.cut(ctx, color, { rim: false, ...o });
  };

  P.heart = function (ctx, x, y, s, color = C.red, o = {}) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
    ctx.closePath();
    P.cut(ctx, color, o);
  };

  /** Rounded "capsule" from (x1,y1) to (x2,y2). */
  P.capsulePath = function (ctx, x1, y1, x2, y2, w) {
    const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
    ctx.save();
    ctx.translate(x1, y1); ctx.rotate(a);
    ctx.roundRect(-w / 2, -w / 2, len + w, w, w / 2);
    ctx.restore();
  };

  /** Green check-mark badge (like "all tests passed"). */
  P.check = function (ctx, x, y, r, done = 1, color = C.green) {
    P.circle(ctx, x, y, r, color, { amp: 2 });
    if (done <= 0) return;
    ctx.save();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const a = [x - r * 0.45, y + r * 0.02], b = [x - r * 0.1, y + r * 0.35], c = [x + r * 0.5, y - r * 0.35];
    const d1 = Math.hypot(b[0] - a[0], b[1] - a[1]), d2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const L = (d1 + d2) * clamp(done);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]);
    if (L <= d1) ctx.lineTo(lerp(a[0], b[0], L / d1), lerp(a[1], b[1], L / d1));
    else { ctx.lineTo(b[0], b[1]); const k = (L - d1) / d2; ctx.lineTo(lerp(b[0], c[0], k), lerp(b[1], c[1], k)); }
    ctx.stroke();
    ctx.restore();
  };

  /** Fluffy paper cloud. */
  P.cloud = function (ctx, x, y, s = 1, color = '#fff') {
    ctx.beginPath();
    [[0, 0, 70], [-80, 20, 55], [80, 18, 58], [-40, -35, 55], [40, -40, 62]].forEach(([dx, dy, r]) => {
      ctx.moveTo(x + dx * s + r * s, y + dy * s);
      ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
    });
    ctx.rect(x - 120 * s, y, 240 * s, 60 * s);
    P.cut(ctx, color, { rim: false });
  };

  /** Confetti burst: call every frame with local time since burst `lt`. */
  P.confetti = function (ctx, lt, x, y, seed = 3, count = 60, spread = 700) {
    if (lt < 0) return;
    const r = rng(seed);
    const cols = [C.yellow, C.pink, C.mint, C.sky, C.claude, C.purple, C.green];
    ctx.save();
    for (let i = 0; i < count; i++) {
      const a = r() * TAU, v = (0.3 + r()) * spread;
      const px = x + Math.cos(a) * v * Math.min(lt, 1.2);
      const py = y + Math.sin(a) * v * Math.min(lt, 1.2) * 0.8 + 600 * lt * lt;
      const alpha = clamp(1 - lt / 2.2);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cols[i % cols.length];
      ctx.save(); ctx.translate(px, py); ctx.rotate(lt * (3 + r() * 8) + i);
      ctx.fillRect(-9, -5, 18, 10);
      ctx.restore();
    }
    ctx.restore();
  };

  /** Little radiating "impact" lines (like a pop!). */
  P.burstLines = function (ctx, x, y, r, p, color = C.yellow, n = 8, w = 8) {
    if (p <= 0 || p >= 1) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.globalAlpha = 1 - p;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const r1 = r + p * r * 0.6, r2 = r1 + r * 0.35 * (1 - p);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------------ *
   *  Faces – usable on any character
   *    mood: 'happy' | 'smile' | 'wow' | 'sad' | 'sleepy' | 'wink' |
   *          'angry' | 'dead' | 'side' | 'sus'
   * ------------------------------------------------------------------ */
  P.face = function (ctx, x, y, s, mood = 'smile', o = {}) {
    const ink = o.ink || C.ink;
    const blink = o.blink || 0; // 0..1
    ctx.save();
    ctx.strokeStyle = ink; ctx.fillStyle = ink;
    ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const ex = s * 0.38, ey = -s * 0.05, er = s * 0.12;
    const eye = (sx) => {
      const px = x + sx * ex, py = y + ey;
      switch (mood) {
        case 'happy':
          ctx.beginPath(); ctx.arc(px, py + er * 0.5, er, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); break;
        case 'sleepy':
          ctx.beginPath(); ctx.moveTo(px - er, py); ctx.lineTo(px + er, py); ctx.stroke(); break;
        case 'dead':
          ctx.beginPath(); ctx.moveTo(px - er, py - er); ctx.lineTo(px + er, py + er);
          ctx.moveTo(px + er, py - er); ctx.lineTo(px - er, py + er); ctx.stroke(); break;
        case 'wink':
          if (sx > 0) { ctx.beginPath(); ctx.arc(px, py + er * 0.5, er, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); break; }
        // falls through
        default: {
          const big = mood === 'wow' ? 1.35 : 1;
          const h = Math.max(0.08, 1 - blink);
          ctx.beginPath(); ctx.ellipse(px, py, er * big, er * big * 1.15 * h, 0, 0, TAU); ctx.fill();
          if (h > 0.5) {
            ctx.fillStyle = '#fff';
            const lx = mood === 'side' ? er * 0.45 : -er * 0.3;
            ctx.beginPath(); ctx.arc(px + lx, py - er * 0.35, er * 0.38 * big, 0, TAU); ctx.fill();
            ctx.fillStyle = ink;
          }
          if (mood === 'angry') {
            ctx.beginPath(); ctx.moveTo(px - er * 1.4 * sx, py - er * 2.2); ctx.lineTo(px + er * 1.2 * sx, py - er * 1.2); ctx.stroke();
          }
          if (mood === 'sus') {
            ctx.save(); ctx.fillStyle = o.skin || C.claude;
            ctx.fillRect(px - er * 1.6, py - er * 1.8, er * 3.2, er * 1.6); ctx.restore();
            ctx.beginPath(); ctx.moveTo(px - er * 1.3, py - er * 0.2); ctx.lineTo(px + er * 1.3, py - er * 0.2); ctx.stroke();
          }
        }
      }
    };
    eye(-1); eye(1);

    // blush
    if (o.blush !== false) {
      ctx.fillStyle = 'rgba(240,110,120,0.45)';
      ctx.beginPath(); ctx.ellipse(x - s * 0.62, y + s * 0.2, s * 0.14, s * 0.08, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + s * 0.62, y + s * 0.2, s * 0.14, s * 0.08, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = ink;
    }

    // mouth
    const my = y + s * 0.22;
    ctx.beginPath();
    switch (mood) {
      case 'wow': ctx.ellipse(x, my + s * 0.05, s * 0.1, s * 0.14, 0, 0, TAU); ctx.fill(); break;
      case 'sad': case 'dead': ctx.arc(x, my + s * 0.16, s * 0.13, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); break;
      case 'angry': ctx.moveTo(x - s * 0.12, my + s * 0.05); ctx.lineTo(x + s * 0.12, my + s * 0.05); ctx.stroke(); break;
      case 'sleepy': ctx.ellipse(x, my + s * 0.04, s * 0.05, s * 0.04, 0, 0, TAU); ctx.fill(); break;
      case 'sus': ctx.moveTo(x - s * 0.1, my + s * 0.06); ctx.lineTo(x + s * 0.14, my + s * 0.02); ctx.stroke(); break;
      default: ctx.arc(x, my - s * 0.02, s * 0.13, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------------ *
   *  Clawd – the orange starburst mascot
   *    P.claude(ctx, x, y, r, { t, mood, wiggle, color, squash, rot, rays, blink })
   * ------------------------------------------------------------------ */
  P.claude = function (ctx, x, y, r, o = {}) {
    const t = o.t || 0;
    const color = o.color || C.claude;
    const nRays = o.rays || 11;
    const wiggle = o.wiggle ?? 1;
    const sq = o.squash || 0; // + = squashed flat, - = stretched tall
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    ctx.scale(1 + sq * 0.25, 1 - sq * 0.25);

    ctx.beginPath();
    const rr = rng(o.seed || 42);
    for (let i = 0; i < nRays; i++) {
      const a = -Math.PI / 2 + (i / nRays) * TAU + (rr() - 0.5) * 0.18;
      const len = r * (0.92 + rr() * 0.28) * (1 + Math.sin(t * 3 + i * 1.7) * 0.04 * wiggle);
      const w = r * (0.2 + rr() * 0.05);
      const bend = Math.sin(t * 2.2 + i) * 0.06 * wiggle;
      ctx.save();
      ctx.rotate(a + bend);
      ctx.roundRect(r * 0.1, -w / 2, len - r * 0.1, w, w / 2);
      ctx.restore();
    }
    ctx.moveTo(r * 0.5, 0);
    ctx.arc(0, 0, r * 0.5, 0, TAU);
    P.cut(ctx, color, { rim: false });

    if (o.mood !== 'none') P.face(ctx, 0, r * 0.02, r * 0.42, o.mood || 'happy', { blink: o.blink, skin: color });
    ctx.restore();
  };

  /** Clawd's long orange arm (the "swiping finger"). */
  P.arm = function (ctx, x1, y1, x2, y2, w = 90, color = C.claude) {
    ctx.beginPath();
    P.capsulePath(ctx, x1, y1, x2, y2, w);
    P.cut(ctx, color, { shadow: { blur: 18, dy: 10, alpha: 0.3 } });
  };

  /**
   * The signature "Claude swipes up" gag: an arm slides in from bottom
   * right, drags upward and leaves. `p` is 0..1 through the gesture.
   */
  P.swipe = function (ctx, p, color = C.claude) {
    if (p <= 0 || p >= 1) return;
    const inP = ease.outCubic(prog(p, 0, 0.35));
    const drag = ease.inOutCubic(prog(p, 0.35, 0.4));
    const out = ease.inCubic(prog(p, 0.75, 0.25));
    const tipX = lerp(1250, 820, inP) + out * 400;
    const tipY = lerp(1500, 1250, inP) - drag * 520 + out * 300;
    P.arm(ctx, tipX, tipY, tipX + 700, tipY + 1300, 100, color);
  };

  /* ------------------------------------------------------------------ *
   *  Text
   * ------------------------------------------------------------------ */
  /**
   * P.text(ctx, str, x, y, { size, font, color, align, baseline, weight,
   *   stroke, strokeWidth, shadow, rot, maxWidth, lineHeight, letter })
   * font is a key of P.FONTS or a raw CSS family string. Handles "\n".
   */
  P.text = function (ctx, str, x, y, o = {}) {
    const size = o.size || 64;
    const fam = FONTS[o.font || 'hand'] || o.font;
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    if (o.scale) ctx.scale(o.scale, o.scale);
    ctx.font = `${o.weight || 700} ${size}px ${fam}`;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.letter) ctx.letterSpacing = o.letter + 'px';
    const lines = String(str).split('\n');
    const lh = size * (o.lineHeight || 1.15);
    const y0 = -((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => {
      const ly = y0 + i * lh;
      if (o.shadow !== false) P.shadow(ctx, 6, 5, 0.3);
      if (o.stroke) {
        ctx.strokeStyle = o.stroke; ctx.lineWidth = o.strokeWidth || size * 0.18; ctx.lineJoin = 'round';
        ctx.strokeText(line, 0, ly, o.maxWidth);
        P.noShadow(ctx);
      }
      ctx.fillStyle = o.color || C.ink;
      ctx.fillText(line, 0, ly, o.maxWidth);
      P.noShadow(ctx);
    });
    ctx.restore();
  };

  /** Measure text width with the same font rules as P.text. */
  P.measure = function (ctx, str, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 700} ${o.size || 64}px ${FONTS[o.font || 'hand'] || o.font}`;
    const w = Math.max(...String(str).split('\n').map(l => ctx.measureText(l).width));
    ctx.restore();
    return w;
  };

  /** Typewriter: returns the first fraction p (0..1) of str. */
  P.typed = (str, p) => str.slice(0, Math.floor(str.length * clamp(p)));

  /**
   * Torn-paper caption sticker with the little orange spark, like
   * "✳ ok i need to learn this". Sits bottom-left-ish by default.
   */
  P.sticker = function (ctx, str, x = 70, y = 1480, o = {}) {
    const size = o.size || 52;
    const w = P.measure(ctx, str, { size, font: o.font || 'marker' }) + size * 2.2;
    const h = size * 1.7;
    const pop = o.pop ?? 1;
    ctx.save();
    ctx.translate(x + w / 2, y);
    ctx.rotate(o.rot ?? -0.02);
    ctx.scale(pop, pop);
    P.wobblyRect(ctx, -w / 2, -h / 2, w, h, o.seed || 5, 4, 10);
    P.cut(ctx, o.bg || C.paper);
    P.claude(ctx, -w / 2 + size * 0.85, 0, size * 0.42, { mood: 'none', wiggle: 0 });
    P.text(ctx, str, -w / 2 + size * 1.5, 2, { size, font: o.font || 'marker', align: 'left', color: o.color || C.claudeDark, shadow: false });
    ctx.restore();
  };

  /** Speech bubble with a tail pointing at (tx, ty). */
  P.bubble = function (ctx, str, x, y, tx, ty, o = {}) {
    const size = o.size || 56;
    const lines = String(str).split('\n');
    const w = P.measure(ctx, str, { size, font: o.font || 'hand' }) + size * 1.4;
    const h = lines.length * size * 1.15 + size * 0.9;
    const pop = o.pop ?? 1;
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
    ctx.beginPath();
    P.wobblyRect(ctx, x - w / 2, y - h / 2, w, h, o.seed || 9, 3, size * 0.6);
    // tail
    const bx = clamp(tx, x - w / 2 + 60, x + w / 2 - 60);
    const by = ty > y ? y + h / 2 - 4 : y - h / 2 + 4;
    ctx.moveTo(bx - 34, by); ctx.lineTo(tx, ty); ctx.lineTo(bx + 34, by); ctx.closePath();
    P.cut(ctx, o.bg || '#fff', { rim: false });
    // re-cover the seam
    P.wobblyRect(ctx, x - w / 2, y - h / 2, w, h, o.seed || 9, 3, size * 0.6);
    ctx.save(); ctx.fillStyle = o.bg || '#fff'; ctx.fill(); ctx.restore();
    P.text(ctx, str, x, y + 2, { size, font: o.font || 'hand', color: o.color || C.ink, shadow: false });
    ctx.restore();
  };

  /**
   * Big bubbly headline text ("10 PROMPTS" style): fat outline,
   * colored fill, drop shadow. Optional `pop` 0..1 scale-in.
   */
  P.title = function (ctx, str, x, y, o = {}) {
    const pop = o.pop ?? 1;
    if (pop <= 0) return;
    P.text(ctx, str, x, y, {
      size: o.size || 120, font: o.font || 'bubble', weight: 700,
      color: o.color || C.yellow, stroke: o.stroke || C.white,
      strokeWidth: o.strokeWidth || (o.size || 120) * 0.2,
      rot: o.rot || 0, scale: pop, maxWidth: o.maxWidth, lineHeight: o.lineHeight,
    });
  };

  /** A window/panel like a little OS app ("$ npm test" card). */
  P.window = function (ctx, x, y, w, h, title = '', o = {}) {
    P.rect(ctx, x, y, w, h, o.bg || C.paper, { seed: o.seed || 3, radius: 22 });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x, y, w, 70, [22, 22, 0, 0]);
    ctx.fillStyle = o.bar || 'rgba(0,0,0,0.06)'; ctx.fill();
    [C.red, C.yellow, C.green].forEach((c, i) => P.dot(ctx, x + 40 + i * 38, y + 35, 12, c));
    ctx.restore();
    if (title) P.text(ctx, title, x + 150, y + 36, { size: 34, font: 'mono', align: 'left', color: o.titleColor || C.ink, shadow: false, weight: 600 });
  };

  /** Code-ish colored bars (for fake code on screens). */
  P.codeLines = function (ctx, x, y, w, lines = 8, seed = 2, lh = 34, p = 1) {
    const r = rng(seed);
    const cols = [C.pink, C.mint, C.yellow, C.sky, C.claude, '#c9b6ff'];
    const shown = Math.floor(lines * clamp(p));
    ctx.save();
    for (let i = 0; i < shown; i++) {
      let cx = x + Math.floor(r() * 3) * 30;
      const segs = 1 + Math.floor(r() * 4);
      for (let s = 0; s < segs; s++) {
        const sw = 30 + r() * (w / 3);
        if (cx + sw > x + w) break;
        ctx.fillStyle = cols[Math.floor(r() * cols.length)];
        ctx.beginPath(); ctx.roundRect(cx, y + i * lh, sw, lh * 0.5, lh * 0.25); ctx.fill();
        cx += sw + 14;
      }
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------------ *
   *  Camera helpers – wrap drawing in shake / zoom
   * ------------------------------------------------------------------ */
  /** Screen shake of `amount` px; call inside save/restore before drawing. */
  P.shake = function (ctx, t, amount) {
    if (amount <= 0) return;
    ctx.translate((hash(boil(t, 30)) - 0.5) * amount * 2, (hash(boil(t, 30) + 99) - 0.5) * amount * 2);
  };
  /** Zoom around a point. */
  P.zoom = function (ctx, s, cx = W / 2, cy = H / 2) {
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  };
  /** Full-screen white flash with alpha a. */
  P.flash = function (ctx, a, color = '#fff') {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore();
  };

  window.P = P;

  /* ================================================================== *
   *  SFX – WebAudio synth. All functions are safe to call when muted
   *  or before audio is unlocked (they just do nothing).
   *  `when` args are seconds offset from now.
   * ================================================================== */
  const SFX = { ctx: null, master: null, muted: false, volume: 0.6 };

  SFX.init = function () {
    if (SFX.ctx) { if (SFX.ctx.state === 'suspended') SFX.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    SFX.ctx = new AC();
    SFX.master = SFX.ctx.createGain();
    SFX.master.gain.value = SFX.muted ? 0 : SFX.volume;
    const comp = SFX.ctx.createDynamicsCompressor();
    SFX.master.connect(comp); comp.connect(SFX.ctx.destination);
  };
  SFX.setMuted = function (m) {
    SFX.muted = m;
    if (SFX.master) SFX.master.gain.setTargetAtTime(m ? 0 : SFX.volume, SFX.ctx.currentTime, 0.02);
  };
  const ready = () => SFX.ctx && SFX.ctx.state === 'running' && !SFX.muted;

  const NOTE_I = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  /** 'A4' → 440. Numbers pass through. */
  SFX.freq = function (n) {
    if (typeof n === 'number') return n;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return 440;
    return 440 * Math.pow(2, (NOTE_I[m[1]] + (parseInt(m[2]) + 1) * 12 - 69) / 12);
  };

  /**
   * SFX.tone(freq|'C4', dur, { type, vol, attack, slide, when, pan, detune })
   * slide: target frequency to glide to over the duration.
   */
  SFX.tone = function (f, dur = 0.2, o = {}) {
    if (!ready()) return;
    const a = SFX.ctx, t0 = a.currentTime + (o.when || 0);
    const osc = a.createOscillator(), g = a.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(SFX.freq(f), t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, SFX.freq(o.slide)), t0 + dur);
    if (o.detune) osc.detune.value = o.detune;
    const vol = o.vol ?? 0.3, att = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out = g;
    if (o.pan && a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    osc.connect(g); out.connect(SFX.master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  };

  let noiseBuf = null;
  /** SFX.noise(dur, { vol, filter:'lowpass'|'highpass'|'bandpass', freq, q, when, slide }) */
  SFX.noise = function (dur = 0.2, o = {}) {
    if (!ready()) return;
    const a = SFX.ctx, t0 = a.currentTime + (o.when || 0);
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = a.createBufferSource(); src.buffer = noiseBuf;
    const f = a.createBiquadFilter(); f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 2000, t0);
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    f.Q.value = o.q || 1;
    const g = a.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(SFX.master);
    src.start(t0, Math.random()); src.stop(t0 + dur + 0.05);
  };

  /** Play a chord / arpeggio: notes array, gap seconds between notes. */
  SFX.chord = function (notes, dur = 0.5, o = {}) {
    notes.forEach((n, i) => SFX.tone(n, dur, { ...o, when: (o.when || 0) + i * (o.gap || 0) }));
  };

  /* ---------- preset sound effects ---------- */
  SFX.pop = (o = {}) => SFX.tone(o.f || 520, 0.12, { type: 'sine', slide: (o.f || 520) * 2.2, vol: 0.35, ...o });
  SFX.click = (o = {}) => { SFX.noise(0.03, { filter: 'highpass', freq: 3000, vol: 0.4, ...o }); SFX.tone(1800 + Math.random() * 400, 0.02, { type: 'square', vol: 0.05, when: o.when }); };
  SFX.tick = (o = {}) => SFX.noise(0.015, { filter: 'bandpass', freq: 4000 + Math.random() * 2000, q: 3, vol: 0.5, ...o });
  SFX.type = (o = {}) => SFX.noise(0.025, { filter: 'bandpass', freq: 2500 + Math.random() * 1500, q: 2, vol: 0.35, ...o });
  SFX.blip = (f = 880, o = {}) => SFX.tone(f, 0.08, { type: 'square', vol: 0.1, ...o });
  SFX.ding = (f = 'E6', o = {}) => { SFX.tone(f, 1.2, { type: 'sine', vol: 0.3, ...o }); SFX.tone(SFX.freq(f) * 2.01, 0.6, { type: 'sine', vol: 0.08, ...o }); };
  SFX.chime = (o = {}) => SFX.chord(['C6', 'E6', 'G6', 'C7'], 0.9, { gap: 0.07, vol: 0.18, ...o });
  SFX.success = (o = {}) => SFX.chord(['C5', 'E5', 'G5', 'C6'], 0.5, { gap: 0.09, type: 'triangle', vol: 0.22, ...o });
  SFX.fail = (o = {}) => SFX.chord(['G4', 'F#4', 'F4', 'E4'], 0.45, { gap: 0.22, type: 'triangle', vol: 0.22, ...o });
  SFX.error = (o = {}) => { SFX.tone(110, 0.35, { type: 'sawtooth', vol: 0.18, ...o }); SFX.tone(116, 0.35, { type: 'square', vol: 0.1, ...o }); };
  SFX.whoosh = (o = {}) => SFX.noise(o.dur || 0.45, { filter: 'bandpass', freq: 400, slide: 3000, q: 1.5, vol: 0.35, ...o });
  SFX.swoosh = (o = {}) => SFX.noise(o.dur || 0.3, { filter: 'bandpass', freq: 3000, slide: 300, q: 1.2, vol: 0.3, ...o });
  SFX.boing = (o = {}) => { SFX.tone(180, 0.5, { type: 'sine', slide: 520, vol: 0.35, ...o }); SFX.tone(186, 0.5, { type: 'triangle', slide: 540, vol: 0.12, ...o }); };
  SFX.thud = (o = {}) => { SFX.tone(120, 0.25, { type: 'sine', slide: 40, vol: 0.6, ...o }); SFX.noise(0.08, { freq: 600, vol: 0.3, ...o }); };
  SFX.kick = (o = {}) => SFX.tone(150, 0.3, { type: 'sine', slide: 40, vol: 0.7, attack: 0.002, ...o });
  SFX.snare = (o = {}) => { SFX.noise(0.18, { filter: 'highpass', freq: 1500, vol: 0.35, ...o }); SFX.tone(220, 0.08, { type: 'triangle', vol: 0.2, ...o }); };
  SFX.hat = (o = {}) => SFX.noise(0.05, { filter: 'highpass', freq: 8000, vol: 0.18, ...o });
  SFX.clap = (o = {}) => [0, 0.012, 0.024].forEach(d => SFX.noise(0.12, { filter: 'bandpass', freq: 1500, q: 0.8, vol: 0.3, ...o, when: (o.when || 0) + d }));
  SFX.bass = (n = 'C2', dur = 0.3, o = {}) => SFX.tone(n, dur, { type: 'triangle', vol: 0.45, ...o });
  SFX.drop = (o = {}) => { SFX.tone(90, 1.4, { type: 'sawtooth', slide: 30, vol: 0.35, ...o }); SFX.kick({ vol: 0.9, ...o }); };
  SFX.riser = (dur = 1.5, o = {}) => { SFX.noise(dur, { filter: 'bandpass', freq: 300, slide: 6000, q: 2, vol: 0.25, ...o }); SFX.tone(200, dur, { type: 'sawtooth', slide: 1200, vol: 0.06, ...o }); };
  SFX.quack = (o = {}) => { SFX.tone(600, 0.14, { type: 'sawtooth', slide: 380, vol: 0.2, ...o }); SFX.noise(0.12, { filter: 'bandpass', freq: 1200, q: 4, vol: 0.2, ...o }); };
  SFX.meow = (o = {}) => { SFX.tone(700, 0.5, { type: 'triangle', slide: 480, vol: 0.2, attack: 0.08, ...o }); SFX.tone(1400, 0.35, { type: 'sine', slide: 900, vol: 0.05, attack: 0.08, ...o }); };
  SFX.chirp = (o = {}) => SFX.tone(2200, 0.09, { type: 'sine', slide: 3400, vol: 0.18, ...o });
  SFX.coin = (o = {}) => { SFX.tone('B5', 0.08, { type: 'square', vol: 0.12, ...o }); SFX.tone('E6', 0.35, { type: 'square', vol: 0.12, ...o, when: (o.when || 0) + 0.08 }); };
  SFX.notify = (o = {}) => { SFX.tone('A5', 0.15, { vol: 0.2, ...o }); SFX.tone('E6', 0.3, { vol: 0.2, ...o, when: (o.when || 0) + 0.12 }); };
  SFX.pluck = (n = 'C5', o = {}) => SFX.tone(n, 0.35, { type: 'triangle', vol: 0.25, attack: 0.002, ...o });
  SFX.vine = (o = {}) => { SFX.tone(1200, 0.6, { type: 'square', slide: 900, vol: 0.15, ...o }); SFX.thud(o); };

  window.SFX = SFX;
})();
