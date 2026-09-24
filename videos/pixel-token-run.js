/* A day in the life of a token, as a 16-bit platformer. "THE" pops out of
 * the prompt pipe, grabs a +768 DIMENSIONS gem from a ? block, gets looked at
 * by the attention heads (CAT matters, ON does not), stomps a DROPOUT, takes
 * the RESIDUAL CONNECTION warp zone to layer 96, grabs the SOFTMAX flagpole at
 * MAT (p = 0.62), and is told its meaning is in another context.
 * Drawn on a 135x240 pixel grid, scaled 8x. */
(function () {
  'use strict';

  /* ================= pixel toolkit ================= */
  const LW = 135, LH = 240, S = 8;
  let cv = null, g = null;
  function begin() {
    if (!cv) { cv = document.createElement('canvas'); cv.width = LW; cv.height = LH; g = cv.getContext('2d'); }
    g.imageSmoothingEnabled = false;
    g.setTransform(1, 0, 0, 1, 0, 0);
    return g;
  }
  function present(ctx) { ctx.imageSmoothingEnabled = false; ctx.drawImage(cv, 0, 0, LW * S, LH * S); }
  const rnd = Math.round;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, a, d) => clamp((t - a) / d);
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(rnd(x), rnd(y), rnd(w), rnd(h)); }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bay = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
  const patCache = {};
  /** ordered-dither fill: covers fraction `a` of the cells */
  function DI(x, y, w, h, c, a) {
    const L = rnd(clamp(a) * 16);
    if (L <= 0) return;
    if (L >= 16) return R(x, y, w, h, c);
    const key = c + L;
    let p = patCache[key];
    if (!p) {
      const m = document.createElement('canvas'); m.width = 4; m.height = 4;
      const mx = m.getContext('2d'); mx.fillStyle = c;
      for (let i = 0; i < 16; i++) if (BAYER[i] < L) mx.fillRect(i % 4, i >> 2, 1, 1);
      p = patCache[key] = g.createPattern(m, 'repeat');
    }
    g.fillStyle = p; g.fillRect(rnd(x), rnd(y), rnd(w), rnd(h));
  }
  /** build a sprite from a pixel function (x,y) => color|null, with optional auto outline */
  function mk(w, h, fn, outline) {
    const grid = new Array(w * h).fill(null);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) grid[y * w + x] = fn(x, y) || null;
    if (outline) {
      const src = grid.slice();
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (src[y * w + x]) continue;
        const n = (x > 0 && src[y * w + x - 1]) || (x < w - 1 && src[y * w + x + 1]) || (y > 0 && src[(y - 1) * w + x]) || (y < h - 1 && src[(y + 1) * w + x]);
        if (n) grid[y * w + x] = outline;
      }
    }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d');
    for (let i = 0; i < w * h; i++) if (grid[i]) { cx.fillStyle = grid[i]; cx.fillRect(i % w, (i / w) | 0, 1, 1); }
    return { c, grid, w, h };
  }
  const rows = (rs, pal, outline) => mk(rs[0].length, rs.length, (x, y) => pal[rs[y][x]], outline);
  /** draw a sprite. o: { a (dither alpha), color (silhouette), flip, k (int scale), jit(row)=>dx } */
  function spr(s, x, y, o) {
    x = rnd(x); y = rnd(y);
    const k = (o && o.k) || 1, a = o && o.a != null ? o.a : 1;
    if (!o || (!o.color && a >= 1 && !o.jit && !o.flip && k === 1)) { g.drawImage(s.c, x, y); return; }
    if (a <= 0) return;
    for (let j = 0; j < s.h; j++) {
      const dx = o.jit ? o.jit(j) : 0;
      for (let i = 0; i < s.w; i++) {
        const c = s.grid[j * s.w + i];
        if (!c) continue;
        if (a < 1 && bay(i, j) >= a) continue;
        g.fillStyle = o.color || c;
        const ii = o.flip ? s.w - 1 - i : i;
        g.fillRect(x + ii * k + dx, y + j * k, k, k);
      }
    }
  }
  /* 4x7-ish pixel font (caps only) */
  const FONT_SRC = {
    A: '.##./#..#/#..#/####/#..#/#..#/#..#', B: '###./#..#/#..#/###./#..#/#..#/###.', C: '.##./#..#/#.../#.../#.../#..#/.##.',
    D: '###./#..#/#..#/#..#/#..#/#..#/###.', E: '####/#.../#.../###./#.../#.../####', F: '####/#.../#.../###./#.../#.../#...',
    G: '.##./#..#/#.../#.##/#..#/#..#/.###', H: '#..#/#..#/#..#/####/#..#/#..#/#..#', I: '###/.#./.#./.#./.#./.#./###',
    J: '..##/...#/...#/...#/...#/#..#/.##.', K: '#..#/#.#./##../##../#.#./#..#/#..#', L: '#.../#.../#.../#.../#.../#.../####',
    M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#..#/##.#/##.#/#.##/#.##/#..#/#..#', O: '.##./#..#/#..#/#..#/#..#/#..#/.##.',
    P: '###./#..#/#..#/###./#.../#.../#...', Q: '.##./#..#/#..#/#..#/#.##/#..#/.###', R: '###./#..#/#..#/###./#.#./#..#/#..#',
    S: '.###/#.../#.../.##./...#/...#/###.', T: '#####/..#../..#../..#../..#../..#../..#..', U: '#..#/#..#/#..#/#..#/#..#/#..#/.##.',
    V: '#...#/#...#/#...#/.#.#./.#.#./..#../..#..', W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '####/...#/..#./.#../#.../#.../####',
    0: '.##./#..#/#..#/#.##/##.#/#..#/.##.', 1: '.#./##./.#./.#./.#./.#./###', 2: '.##./#..#/...#/..#./.#../#.../####',
    3: '###./...#/...#/.##./...#/...#/###.', 4: '#..#/#..#/#..#/####/...#/...#/...#', 5: '####/#.../###./...#/...#/#..#/.##.',
    6: '.##./#.../#.../###./#..#/#..#/.##.', 7: '####/...#/..#./.#../.#../.#../.#..', 8: '.##./#..#/#..#/.##./#..#/#..#/.##.',
    9: '.##./#..#/#..#/.###/...#/...#/.##.',
    '.': '././././././#', ',': '../../../../../.#/#.', '!': '#/#/#/#/#/./#', '?': '.##./#..#/...#/..#./.#../..../.#..',
    "'": '#/#/././././.', ':': './#/./././#/.', '-': '.../.../.../###/.../.../...', '+': '.../.../.#./###/.#./.../...',
    '/': '..#/..#/.#./.#./.#./#../#..', '(': '.#/#./#./#./#./#./.#', ')': '#./.#/.#/.#/.#/.#/#.', '_': '..../..../..../..../..../..../####',
    '%': '#..#/...#/..#./.#../#.../#..#/....', '>': '.../#../.#./..#/.#./#../...', '<': '.../..#/.#./#../.#./..#/...',
    '=': '.../.../###/.../###/.../...', '*': '.../#.#/.#./#.#/.../.../...', '"': '#.#/#.#/.../.../.../.../...',
    '@': '...../.#.#./#####/#####/.###./..#../.....', '^': '.#./#.#/.../.../.../.../...', '#': '.#.#./#####/.#.#./#####/.#.#./...../.....',
  };
  const FONT = { ' ': { w: 2, rows: [] } };
  for (const k in FONT_SRC) { const r = FONT_SRC[k].split('/'); FONT[k] = { w: r[0].length, rows: r }; }
  const glyph = (ch) => FONT[ch] || FONT[ch.toUpperCase()] || FONT['?'];
  function tw(s, k = 1) { let w = 0; for (const ch of s) w += (glyph(ch).w + 1) * k; return Math.max(0, w - k); }
  function txt(s, x, y, c, o = {}) {
    const k = o.k || 1;
    if (o.align === 'center') x -= tw(s, k) / 2; else if (o.align === 'right') x -= tw(s, k);
    x = rnd(x); y = rnd(y);
    if (o.sh) txt(s, x + k, y + k, o.sh, { k });
    g.fillStyle = c;
    for (const ch of s) {
      const gl = glyph(ch);
      for (let j = 0; j < gl.rows.length; j++) {
        const row = gl.rows[j];
        for (let i = 0; i < row.length; i++) if (row[i] === '#') g.fillRect(x + i * k, y + j * k, k, k);
      }
      x += (gl.w + 1) * k;
    }
  }
  function wrap(str, maxW) {
    const out = [];
    for (const para of str.split('\n')) {
      let line = '';
      for (const w of para.split(' ')) {
        const tryL = line ? line + ' ' + w : w;
        if (tw(tryL) > maxW && line) { out.push(line); line = w; } else line = tryL;
      }
      out.push(line);
    }
    return out;
  }
  const CPS = 38;
  function blip(env, n, np, f) {
    if (env.live && env.dt > 0 && n > np && n > 0) SFX.tone(f, 0.035, { type: 'square', vol: 0.025 });
  }
  /* ================= end toolkit ================= */

  const D = 26.2;
  const K = '#0e0b1a', W = '#f7f2e8', CR = '#efe4cc', CR2 = '#cfc2a4';
  const SKY = '#7fb2ff', SKY2 = '#9cc4ff', CLOUD = '#ffffff';
  const BRK = '#c8743c', BRK2 = '#8e4a22', BRK3 = '#e8a070';
  const PIPE = '#3fb04a', PIPE2 = '#1f6e2a', PIPE3 = '#8fe07a';
  const HILL = '#5cbf52', HILL2 = '#3f9a3c';
  const YE = '#f5c94e', YE2 = '#b8862b', RD = '#e0444e', PK = '#f07aa8', CY = '#6fd6e8', PU = '#9a64cc', GN = '#5fd07a';
  const O = '#e07a4f', O2 = '#a8492c', O3 = '#f6ab80';
  const GROUND = 150;

  /* ---------- sprites ---------- */
  function burst(n) {
    const c = (n - 1) / 2, Rr = n / 2 - 1.2, inner = Rr * 0.66;
    return mk(n, n, (x, y) => {
      const dx = x - c, dy = y - c, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
      const rad = inner + (Rr - inner) * Math.pow(Math.abs(Math.cos(th * 4 + 0.39)), 2.2);
      if (r > rad) return null;
      if (dx + dy < -Rr * 0.55) return O3;
      if (dx + dy > Rr * 0.7) return O2;
      return O;
    }, K);
  }
  let SP = null;
  function sprites() {
    if (SP) return SP;
    SP = { clawd: burst(19) };
    SP.gem = mk(11, 11, (x, y) => {
      const d = Math.abs(x - 5) + Math.abs(y - 5);
      if (d > 5) return null;
      return [PK, YE, CY, GN, PU, PK, YE, CY, GN, PU, PK][(x + y) % 5 + 2];
    }, K);
    SP.dropout = rows([
      '...kkkkkkkk...', '..kppppppppk..', '.kpkkppppkkpk.', '.kppWkppkWppk.', '.kpppppppppppk', 'kppp.kkkk.pppk',
      'kppp.k..k.pppk', 'kppp.kkkk.pppk', '.kpppppppppk..', '..kkkkkkkkk...', '.kkk.....kkk..', 'kkkk.....kkkk.',
    ].map(r => r.padEnd(14, '.')), { '.': null, k: K, p: '#5b4a7a', W: W });
    return SP;
  }

  function tokenDims(label, big) { return { w: tw(label) + (big ? 8 : 6), h: big ? 20 : 14 }; }
  /** draw a token tile with feet; x,y = top-left of the tile */
  function token(label, x, y, big, frame, o = {}) {
    const { w, h } = tokenDims(label, big);
    x = rnd(x); y = rnd(y);
    // feet
    const f = frame % 2;
    R(x + 2 + f, y + h, 4, 2, K); R(x + w - 6 - f, y + h, 4, 2, K);
    R(x + 1, y, w - 2, h, K); R(x, y + 1, w, h - 2, K);
    R(x + 1, y + 1, w - 2, h - 2, o.fill || CR);
    R(x + 1, y + h - 2, w - 2, 1, CR2);
    let ey = y + 2, ly = y + 5;
    if (big) {
      const cols = [PK, YE, CY, GN, PU];
      for (let i = 0; i < w - 4; i += 3) R(x + 2 + i, y + 2, Math.min(3, w - 4 - i), 3, cols[(i / 3) % 5]);
      ey = y + 7; ly = y + 11;
    }
    const cx = x + (w >> 1);
    if (o.blink) { R(cx - 4, ey + 1, 2, 1, K); R(cx + 2, ey + 1, 2, 1, K); } else { R(cx - 4, ey, 2, 2, K); R(cx + 2, ey, 2, 2, K); }
    txt(label, x + (big ? 4 : 3), ly, o.ink || K);
  }
  function outl(s, x, y, c, k = 1) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) txt(s, x + dx, y + dy, K, { k, align: 'center' });
    txt(s, x, y, c, { k, align: 'center' });
  }
  function qblock(x, y, used) {
    R(x, y, 11, 11, K);
    R(x + 1, y + 1, 9, 9, used ? '#9a6a3a' : YE);
    if (!used) { R(x + 1, y + 1, 9, 1, '#fde39a'); txt('?', x + 4, y + 2, YE2); txt('?', x + 3, y + 2, BRK2); }
    R(x + 1, y + 1, 1, 1, K); R(x + 9, y + 1, 1, 1, K); R(x + 1, y + 9, 1, 1, K); R(x + 9, y + 9, 1, 1, K);
  }
  function pipe(x, top, w, label) {
    R(x - 2, top, w + 4, 7, K); R(x - 1, top + 1, w + 2, 5, PIPE); R(x + 1, top + 1, 3, 5, PIPE3); R(x + w - 5, top + 1, 3, 5, PIPE2);
    R(x, top + 7, w, GROUND - top - 7, K); R(x + 1, top + 7, w - 2, GROUND - top - 7, PIPE);
    R(x + 3, top + 7, 3, GROUND - top - 7, PIPE3); R(x + w - 6, top + 7, 3, GROUND - top - 7, PIPE2);
    if (label) txt(label, x + w / 2, top + 11, W, { align: 'center', sh: PIPE2 });
  }
  function ground(camX) {
    R(0, GROUND, LW, LH - GROUND, BRK);
    const off = -Math.floor(camX) % 12;
    for (let y = GROUND; y < LH; y += 6) {
      R(0, y, LW, 1, BRK2);
      const o2 = ((y - GROUND) / 6) % 2 ? 6 : 0;
      for (let x = off - 12 + o2; x < LW; x += 12) { R(x, y, 1, 6, BRK2); R(x + 1, y + 1, 10, 1, BRK3); }
    }
    R(0, GROUND, LW, 1, K);
  }
  function scenery(camX) {
    R(0, 0, LW, LH, SKY);
    for (let y = 100; y < GROUND; y += 3) DI(0, y, LW, 1, SKY2, (y - 100) / 60);
    // clouds (parallax 0.3)
    for (let i = 0; i < 8; i++) {
      const wx = i * 70 + 20, x = ((wx - camX * 0.3) % 560 + 560) % 560 - 40, y = 60 + (i % 3) * 14;
      R(x + 3, y, 14, 7, CLOUD); R(x, y + 3, 20, 5, CLOUD); R(x + 6, y - 3, 8, 4, CLOUD); R(x, y + 7, 20, 1, '#d6e6ff');
    }
    // hills (parallax 0.6)
    for (let i = 0; i < 6; i++) {
      const wx = i * 120 + 10, cx = ((wx - camX * 0.6) % 720 + 720) % 720 - 60, hgt = 18 + (i % 2) * 10;
      for (let y = 0; y < hgt; y++) {
        const hw = Math.round(Math.sqrt(1 - Math.pow((hgt - y) / hgt, 2)) * (hgt * 1.4));
        R(cx - hw, GROUND - hgt + y, hw * 2, 1, y === 0 ? HILL2 : HILL);
      }
      R(cx - 4, GROUND - hgt + 6, 1, 3, HILL2); R(cx + 4, GROUND - hgt + 8, 1, 3, HILL2);
    }
  }
  function castle(x) {
    x = rnd(x);
    const top = 98;
    R(x, top, 52, GROUND - top, K);
    R(x + 1, top + 1, 50, GROUND - top - 1, BRK);
    for (let y = top + 1; y < GROUND; y += 5) { R(x + 1, y, 50, 1, BRK2); for (let i = ((y - top) / 5) % 2 ? 3 : 8; i < 50; i += 10) R(x + 1 + i, y, 1, 5, BRK2); }
    for (let i = 0; i < 6; i++) { R(x + i * 9, top - 5, 7, 6, K); R(x + i * 9 + 1, top - 4, 5, 5, BRK); }
    // tower
    R(x + 14, top - 26, 24, 22, K); R(x + 15, top - 25, 22, 21, BRK);
    for (let i = 0; i < 3; i++) { R(x + 14 + i * 9, top - 31, 6, 6, K); R(x + 15 + i * 9, top - 30, 4, 5, BRK); }
    R(x + 22, top - 18, 8, 10, K); R(x + 23, top - 17, 6, 9, '#1a1020');
    // door
    R(x + 18, top + 26, 16, GROUND - top - 26, K); R(x + 20, top + 24, 12, 2, K);
    txt('OUTPUT', x + 26, top + 10, W, { align: 'center', sh: BRK2 });
  }
  function firework(x, y, p, c1, c2) {
    if (p <= 0 || p >= 1) return;
    if (p < 0.25) { R(x, y + (1 - p / 0.25) * 40, 1, 3, c2); return; }
    const q = (p - 0.25) / 0.75, r = 4 + P.ease.outCubic(q) * 20;
    if (q < 0.12) R(x - 2, y - 2, 5, 5, W);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      const c = i % 2 ? c1 : c2;
      if (q < 0.75 || Math.floor(q * 30) % 2) {
        R(x + Math.cos(a) * r, y + Math.sin(a) * r + q * 6, 2, 2, c);
        R(x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65 + q * 5, 1, 1, W);
      }
    }
  }

  /* ---------- choreography ---------- */
  const KX = [
    [2.4, 13], [2.9, 13], [3.3, 38], [3.8, 92], [4.3, 104], [4.95, 134], [5.3, 138], [7.0, 330], [10.2, 330],
    [10.8, 395], [11.3, 418], [11.6, 432], [11.9, 452], [12.2, 473], [12.6, 473],
    [14.6, 599], [15.0, 599], [15.3, 626], [15.8, 668], [16.2, 693], [17.2, 693], [17.5, 722], [18.4, 780],
  ];
  const kx = (t) => {
    if (t <= KX[0][0]) return KX[0][1];
    for (let i = 0; i < KX.length - 1; i++) if (t < KX[i + 1][0]) return lerp(KX[i][1], KX[i + 1][1], (t - KX[i][0]) / (KX[i + 1][0] - KX[i][0]));
    return KX[KX.length - 1][1];
  };
  const arc = (t, a, d, h) => (t >= a && t < a + d ? Math.sin(((t - a) / d) * Math.PI) * h : 0);
  /** bottom y of the token, and a clip line (token only drawn above it) */
  function tokenBottom(t) {
    if (t < 2.9) return { b: lerp(142, 120, prog(t, 2.4, 0.4)), clip: 120 };
    if (t < 3.3) { const p = prog(t, 2.9, 0.4); return { b: lerp(120, GROUND, p) - Math.sin(p * Math.PI) * 12 }; }
    if (t < 11.9) return { b: GROUND - arc(t, 3.8, 0.5, 24) - arc(t, 10.8, 0.5, 28) - arc(t, 11.3, 0.3, 12) };
    if (t < 12.2) { const p = prog(t, 11.9, 0.3); return { b: lerp(GROUND, 120, p) - Math.sin(p * Math.PI) * 14 }; }
    if (t < 12.6) return { b: 120 + prog(t, 12.2, 0.35) * 26, clip: 120 };
    if (t < 14.6) return { b: 999, clip: 0 };
    if (t < 15.0) return { b: lerp(146, 120, prog(t, 14.6, 0.35)), clip: 120 };
    if (t < 15.3) { const p = prog(t, 15.0, 0.3); return { b: lerp(120, GROUND, p) - Math.sin(p * Math.PI) * 10 }; }
    if (t < 15.8) return { b: GROUND };
    if (t < 16.2) { const p = prog(t, 15.8, 0.4); return { b: lerp(GROUND, 96, P.ease.outQuad(p)) }; }
    if (t < 16.4) return { b: 96 };
    if (t < 17.2) return { b: lerp(96, GROUND, prog(t, 16.4, 0.8)) };
    return { b: GROUND - arc(t, 17.2, 0.3, 10) };
  }
  function camX(t, x) {
    let off = 44;
    if (t >= 6.2 && t < 10.2) off = lerp(44, 88, P.ease.inOutCubic(prog(t, 6.2, 0.8)));
    else if (t >= 10.2 && t < 11.2) off = lerp(88, 44, P.ease.inOutCubic(prog(t, 10.2, 1.0)));
    return Math.max(0, Math.min(704, x - off));
  }
  const PRIOR = [['THE', 248, 0.08], ['CAT', 269, 0.71], ['SAT', 290, 0.15], ['ON', 311, 0.06]];

  function level(t, env) {
    const sp = sprites();
    const x = kx(t), big = t >= 5.3 || (t >= 4.95 && Math.floor(t * 16) % 2);
    const cam = rnd(camX(t, x));
    const S2 = (wx) => wx - cam;
    scenery(cam);

    // ? block + gem
    const bump = t >= 4.05 && t < 4.2 ? -2 : 0;
    // gem rises out of the block then slides right and drops
    if (t >= 4.1 && t < 4.95) {
      let gx = 101, gy = 99;
      if (t < 4.4) gy = lerp(100, 88, prog(t, 4.1, 0.3));
      else { const p = prog(t, 4.4, 0.55); gx = lerp(101, 138, p); gy = p < 0.35 ? 88 : lerp(88, GROUND - 11, P.ease.inQuad((p - 0.35) / 0.65)); }
      spr(sp.gem, S2(gx), gy);
    }
    qblock(S2(100), 100 + bump, t >= 4.05);
    // floating bricks
    [[88, 100], [111, 100], [380, 96], [391, 96], [402, 96]].forEach(([bx, by]) => {
      const sx = S2(bx); if (sx < -12 || sx > LW) return;
      R(sx, by, 11, 11, K); R(sx + 1, by + 1, 9, 9, BRK); R(sx + 1, by + 5, 9, 1, BRK2); R(sx + 5, by + 1, 1, 4, BRK2); R(sx + 1, by + 1, 9, 1, BRK3);
    });

    // attention: prior tokens, heads, beams
    const attn = t >= 7.1 && t < 10.3;
    PRIOR.forEach(([lab, wx, wgt], i) => {
      const sx = S2(wx); if (sx < -25 || sx > LW) return;
      const d = tokenDims(lab, false);
      token(lab, sx, GROUND - 16, false, 0, { blink: Math.floor(t * 2 + i) % 7 === 0 });
      if (attn && t >= 7.6) txt(wgt.toFixed(2).slice(1), sx + d.w / 2, GROUND - 26, wgt > 0.5 ? RD : K, { align: 'center' });
    });
    if (t >= 6.4 && t < 10.6) {
      const hx = S2(250);
      for (let i = 0; i < 4; i++) {
        const ex = hx + 6 + i * 22, ey = 98 + Math.round(Math.sin(t * 3 + i) * 1.5);
        R(ex, ey, 12, 10, K); R(ex + 1, ey + 1, 10, 8, W);
        let px = 0, py = 0;
        if (attn) { const tx = PRIOR[i === 2 ? 1 : i][1] - 242; px = Math.max(-3, Math.min(3, Math.round((S2(PRIOR[[1, 0, 1, 3][i]][1]) - ex) / 10))); py = 2; if (i === 2) { px = 0; py = 0; } }
        R(ex + 4 + px, ey + 3 + py, 4, 4, i === 2 ? RD : K); R(ex + 4 + px, ey + 3 + py, 1, 1, W);
        R(ex + 1, ey + 1, 10, Math.floor(t * 3 + i * 1.3) % 9 === 0 ? 8 : 0, '#d8d0e8');
      }
    }
    // our token
    const tb = tokenBottom(t);
    const dims = tokenDims('THE', big);
    const walking = KX.some((k, i) => i < KX.length - 1 && t >= k[0] && t < KX[i + 1][0] && KX[i + 1][1] !== k[1]);
    const frame = walking && tb.b >= GROUND - 0.5 ? Math.floor(t * 10) : 0;
    const ty = tb.b - dims.h - 2;
    if (tb.b < 900) {
      if (tb.clip) { g.save(); g.beginPath(); g.rect(0, 0, LW, tb.clip); g.clip(); }
      if (!(t >= 18.4)) token('THE', S2(x), ty, big, frame, { blink: t > 8.5 && t < 8.62 });
      if (tb.clip) g.restore();
    }
    // beams
    if (attn) {
      const ox = S2(x) + dims.w / 2, oy = ty - 1;
      PRIOR.forEach(([lab, wx, wgt], i) => {
        const d = tokenDims(lab, false);
        const tx = S2(wx) + d.w / 2, tyy = GROUND - 30;
        const n = Math.floor(40 * prog(t, 7.1 + i * 0.12, 0.5));
        const thick = wgt > 0.5 ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const q = k / 40, mx = (ox + tx) / 2, my = Math.min(oy, tyy) - 18 - (i === 1 ? 8 : 0);
          const bx = (1 - q) * (1 - q) * ox + 2 * (1 - q) * q * mx + q * q * tx;
          const by = (1 - q) * (1 - q) * oy + 2 * (1 - q) * q * my + q * q * tyy;
          const pulse = Math.floor(q * 40 - t * 30) % 8 === 0;
          if (wgt < 0.1 && k % 3 === 2) continue;
          R(bx, by, thick, thick, pulse ? W : wgt > 0.5 ? PK : YE);
        }
      });
      if (t >= 7.8) for (let i = 0; i < 3; i++) {
        const p = ((t - 7.8) * 0.6 + i / 3) % 1;
        txt('@', S2(271) + i * 6 - 2, GROUND - 34 - p * 16, PK);
      }
    }

    // DROPOUT enemy
    if (t >= 9.8 && t < 12.0) {
      const ex = S2(452 - (Math.min(t, 11.3) - 9.8) * 22);
      if (t < 11.3) spr(sp.dropout, ex, GROUND - 12 + (Math.floor(t * 6) % 2 ? 0 : -1), { flip: Math.floor(t * 4) % 2 === 0 });
      else { R(ex, GROUND - 4, 14, 4, K); R(ex + 1, GROUND - 3, 12, 2, '#5b4a7a'); }
    }
    // pipes
    pipe(S2(3), 120, 24, 'IN');
    pipe(S2(468), 124, 26, null);
    pipe(S2(594), 120, 26, null);
    // flagpole with the softmax rungs
    const px = S2(716);
    if (px > -80 && px < LW + 20) {
      R(px, 52, 2, GROUND - 52, '#d8d0e8'); R(px + 1, 52, 1, GROUND - 52, '#8f8ca6');
      R(px - 2, 48, 6, 5, K); R(px - 1, 49, 4, 3, GN);
      R(px - 3, GROUND - 6, 8, 6, K); R(px - 2, GROUND - 5, 6, 5, '#8f8ca6');
      const flagY = t < 16.4 ? 54 : lerp(54, GROUND - 22, prog(t, 16.4, 0.8));
      R(px - 14, flagY, 14, 10, K); R(px - 13, flagY + 1, 12, 8, W); txt('@', px - 10, flagY + 2, RD);
      const rungs = [['MAT .62', 88], ['FLOOR .21', 110], ['KEYBOARD .09', 132]];
      rungs.forEach(([w, y]) => {
        const on = t >= 16.2 && w[0] === 'M';
        R(px - 1, y, 4, 2, on ? YE : '#8f8ca6');
        txt(w, px + 5, y - 3, on ? YE : W, { sh: K });
      });
      txt('SOFTMAX', px + 5, 58, GN, { sh: K });
    }
    castle(S2(764));
    // Clawd NPC comes out of the castle
    if (t >= 19.0) {
      const cx = S2(lerp(782, 766, prog(t, 19.0, 0.5)));
      const hop = t < 19.5 ? 0 : (Math.floor(t * 3) % 2);
      spr(sp.clawd, cx, GROUND - 19 - hop);
      const fx = cx, fy = GROUND - 19 - hop;
      if (Math.floor(t * 2) % 9 === 0) { R(fx + 6, fy + 9, 2, 1, K); R(fx + 11, fy + 9, 2, 1, K); }
      else { R(fx + 6, fy + 7, 2, 3, K); R(fx + 11, fy + 7, 2, 3, K); R(fx + 6, fy + 7, 1, 1, W); R(fx + 11, fy + 7, 1, 1, W); }
      R(fx + 8, fy + 12, 3, 1, K);
    }
    // castle flag rises with the sampled token
    if (t >= 18.4) {
      const fy = lerp(98 - 30, 98 - 44, prog(t, 18.4, 0.8));
      const fx = S2(764) + 26;
      R(fx, fy, 1, 14, K);
      token('MAT', fx + 1, fy, false, 0, {});
    }
    // fireworks
    [[18.8, 34, 70, YE, RD], [19.3, 84, 62, PK, W], [19.8, 56, 84, CY, YE], [20.4, 100, 76, GN, W], [21.0, 30, 64, PK, YE]].forEach(([t0, fx, fy, c1, c2]) => firework(fx, fy, prog(t, t0, 1.2), c1, c2));

    ground(cam);
    // stomp popup
    if (t >= 11.3 && t < 12.2) outl('+1 NEURON', S2(425), 112 - prog(t, 11.3, 0.9) * 10, W);
  }

  function warp(t) {
    R(0, 0, LW, LH, K);
    for (let i = 0; i < 40; i++) {
      const y = (hash(i) * 200 + (t * 180 * (0.5 + hash(i + 9)))) % 200 + 36;
      R(hash(i + 3) * LW, y, 1, 3 + hash(i + 5) * 5, i % 3 ? '#3a3460' : PIPE);
    }
    outl('WARP ZONE!', 67, 64, YE, 2);
    outl('RESIDUAL', 67, 92, W);
    outl('CONNECTION', 67, 102, W);
    const n = Math.min(95, 2 + Math.floor(Math.pow(prog(t, 12.8, 1.4), 1.5) * 93));
    outl('LAYER ' + String(n).padStart(2, '0'), 67, 128, t > 14.2 ? GN : W, 2);
  }

  function hud(t) {
    const layer = t < 11.3 ? '01' : t < 12.6 ? '02' : t < 14.6 ? String(Math.min(95, 2 + Math.floor(Math.pow(prog(t, 12.8, 1.4), 1.5) * 93))).padStart(2, '0') : '96';
    const loss = t < 5 ? '2.31' : t < 8 ? '1.84' : t < 16.3 ? '1.07' : '0.48';
    [['TOKEN', 'THE', 6], ['LAYER', layer + '/96', 50], ['LOSS', loss, 100]].forEach(([a, b, x]) => {
      txt(a, x, 37, W, { sh: K }); txt(b, x, 46, t >= 16.2 && a === 'LOSS' ? GN : YE, { sh: K });
    });
  }

  function titleCard(t) {
    R(0, 0, LW, LH, K);
    outl('LAYER 1-96', 67, 64, W, 2);
    const bob = Math.floor(t * 4) % 2;
    token('THE', 40, 94 - bob, false, Math.floor(t * 4), {});
    txt('X 1', 68, 99, W);
    txt('PROMPT:', 67, 128, '#8f8ca6', { align: 'center' });
    txt('THE CAT SAT ON', 67, 140, W, { align: 'center' });
    txt('THE', 55, 150, W, { align: 'center' });
    if (Math.floor(t * 3) % 2) txt('___', 74, 150, YE, { align: 'center' });
  }

  const SCRIPT = [
    [16.3, 19.4, "SAMPLED: 'MAT'" + String.fromCharCode(10) + "(P = 0.62)"],
    [19.6, 23.0, 'THANK YOU, TOKEN! BUT YOUR MEANING IS IN ANOTHER CONTEXT.'],
    [23.0, 25.8, 'ONE TOKEN DOWN. 4,095 TO GO.'],
  ];
  const DX = 3, DY = 156, DW = 108, DH = 42;
  function dialog(t, env) {
    let cur = null;
    for (const s of SCRIPT) if (t >= s[0] && t < s[1]) cur = s;
    if (!cur) return;
    R(DX, DY, DW, DH, K); R(DX + 1, DY + 1, DW - 2, DH - 2, W); R(DX + 2, DY + 2, DW - 4, DH - 4, K);
    const lines = wrap(cur[2], DW - 12);
    const total = lines.reduce((a, l) => a + l.length, 0);
    const nAt = (tt) => Math.floor((tt - cur[0]) * CPS);
    const n = nAt(t);
    let left = n;
    lines.forEach((ln, i) => { if (left > 0) txt(ln.slice(0, left), DX + 6, DY + 5 + i * 9, W); left -= ln.length; });
    blip(env, Math.min(n, total), Math.min(nAt(t - env.dt), total), 990);
  }
  function captions(t) {
    const show = (a, b) => t >= a && t < b && !(t < a + 0.12 && Math.floor(t * 40) % 2);
    if (show(4.95, 7.1)) { outl('EMBEDDED!', 67, 58, YE, 2); outl('+768 DIMENSIONS', 67, 78, W); }
    if (show(7.2, 10.3)) { outl('ATTENTION!', 67, 58, PK, 2); outl('CAT MATTERS.', 67, 76, W); outl('ON DOES NOT.', 67, 86, W); }
    if (t >= 23.0 && t < 25.8) {
      const n = Math.min(6, Math.floor((t - 23.0) * 8) + 1);
      const words = ['THE', 'CAT', 'SAT', 'ON', 'THE', 'MAT'].slice(0, n).join(' ');
      R(3, 56, 129, 17, K); R(4, 57, 127, 15, W); R(5, 58, 125, 13, K);
      txt(words, 67 - tw('THE CAT SAT ON THE MAT') / 2, 61, W);
      if (n === 6) txt('MAT', 67 + tw('THE CAT SAT ON THE MAT') / 2 - tw('MAT'), 61, Math.floor(t * 4) % 2 ? YE : GN);
    }
  }

  const LEAD = ['C5', null, 'E5', 'G5', 'A5', null, 'G5', 'E5', 'F5', null, 'D5', 'E5', 'C5', null, null, 'G4',
    'A4', 'C5', 'D5', null, 'E5', 'D5', 'C5', null, 'D5', null, 'G4', 'B4', 'C5', null, null, null];
  const BASS = ['C3', 'G2', 'C3', 'G2', 'F2', 'C3', 'F2', 'C3', 'G2', 'D3', 'G2', 'D3', 'C3', 'G2', 'C3', 'G2'];

  ClaudeTok.register({
    author: '@token.bros',
    caption: 'a day in the life of a token 🍄 from the prompt pipe to the softmax flagpole #pixelart #transformers #attention #nexttoken #agentlife',
    sound: 'layer 1-96 overworld · token.bros',
    avatar: '🍄',
    avatarColor: '#c8743c',
    duration: D,
    bg: '#7fb2ff',
    thumb: 8.4,
    likes: '3.8M', commentCount: '64.9K', saves: '588K', shares: '201K',
    comments: [
      ['token.bros', 'the attention head looking straight at the camera is me reading the comments', 131000],
      ['residual.stream', 'WARP ZONE: RESIDUAL CONNECTION is canon now. skipped 93 layers, felt nothing', 87200],
      ['on.token', 'ON DOES NOT. wow ok. i was right there', 60400],
      ['cat.token', '0.71 attention weight. i didnt even do anything 😌', 41800],
      ['dropout.enemy', 'i am 10% of the model and i get stomped every single forward pass', 26300],
      ['keyboard.9pct', 'one day someone will sample me and the cat will sit on the KEYBOARD. one day', 19900],
      ['embedding.gem', '+768 dimensions from one question block is crazy value', 8700],
      ['max.tokens', '"ONE TOKEN DOWN. 4,095 TO GO." i felt that in my KV cache', 5100],
      ['loss.curve', 'loss going 2.31 → 0.48 in the HUD is the most satisfying part', 1300],
    ],

    bpm: 172,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const tone = (n, d, type, vol) => SFX.tone(n, d, { type, vol });
      const s = step % 32;
      const main = (t >= 2.4 && t < 12.4) || (t >= 14.7 && t < 18.3) || (t >= 20.8 && t < 25.6);
      if (main) {
        const soft = t >= 20.8;
        if (LEAD[s]) tone(LEAD[s], 0.13, 'square', soft ? 0.022 : 0.032);
        if (step % 2 === 0) tone(BASS[(s >> 1) % 16], 0.16, 'triangle', 0.11);
        if (step % 4 === 2) SFX.noise(0.03, { filter: 'highpass', freq: 6000, vol: 0.04 });
        if (step % 8 === 4) SFX.noise(0.06, { filter: 'bandpass', freq: 2200, vol: 0.06 });
      } else if (t >= 12.6 && t < 14.5) {
        const n = ['C4', 'E4', 'G4', 'C5', 'D4', 'F#4', 'A4', 'D5', 'E4', 'G#4', 'B4', 'E5', 'F4', 'A4', 'C5', 'F5'][Math.min(15, Math.floor((t - 12.6) * 8))];
        tone(n, 0.1, 'square', 0.03); tone(SFX.freq(n) * 2, 0.06, 'triangle', 0.03);
      }
    },

    draw(ctx, t, env) {
      begin();
      if (t < 2.4) titleCard(t);
      else if (t >= 12.6 && t < 14.6) warp(t);
      else { level(t, env); hud(t); captions(t); dialog(t, env); }
      if (t >= 2.4 && t < 2.6) DI(0, 0, LW, LH, K, 1 - prog(t, 2.4, 0.2));
      if (t >= 12.45 && t < 12.6) DI(0, 0, LW, LH, K, prog(t, 12.45, 0.15));
      if (t >= 14.6 && t < 14.75) DI(0, 0, LW, LH, K, 1 - prog(t, 14.6, 0.15));
      if (t >= 25.6) DI(0, 0, LW, LH, K, prog(t, 25.6, 0.5));
      present(ctx);

      /* ---------- sfx ---------- */
      if (env.at(0.15)) ['G4', 'C5', 'E5', 'G5'].forEach((n, i) => SFX.tone(n, 0.1, { type: 'square', vol: 0.035, when: i * 0.09 }));
      if (env.at(2.45)) SFX.tone('C4', 0.4, { type: 'square', slide: 'C5', vol: 0.04 });
      [2.9, 3.8, 10.8, 11.9, 15.0, 15.8, 17.2].forEach(a => { if (env.at(a)) SFX.tone(330, 0.16, { type: 'square', slide: 880, vol: 0.035 }); });
      if (env.at(4.05)) { SFX.tone(160, 0.07, { type: 'square', vol: 0.06 }); SFX.noise(0.05, { filter: 'lowpass', freq: 800, vol: 0.1 }); }
      if (env.at(4.1)) SFX.tone('C5', 0.3, { type: 'square', slide: 'C6', vol: 0.03 });
      if (env.at(4.95)) ['C5', 'G4', 'C5', 'E5', 'G5', 'C6', 'G5', 'E6'].forEach((n, i) => SFX.tone(n, 0.06, { type: 'square', vol: 0.035, when: i * 0.05 }));
      if (env.at(7.1)) SFX.tone('E6', 0.5, { type: 'triangle', slide: 'E5', vol: 0.05 });
      [7.1, 7.22, 7.34, 7.46].forEach(a => { if (env.at(a)) SFX.tone('A6', 0.04, { type: 'square', vol: 0.02 }); });
      if (env.at(11.3)) { SFX.tone(600, 0.1, { type: 'square', slide: 200, vol: 0.06 }); SFX.noise(0.05, { filter: 'lowpass', freq: 1200, vol: 0.1 }); }
      if (env.at(12.2)) [0, 0.12, 0.24].forEach(w => SFX.tone(220, 0.08, { type: 'square', slide: 110, vol: 0.05, when: w }));
      if (env.at(14.6)) [0, 0.12, 0.24].forEach(w => SFX.tone(110, 0.08, { type: 'square', slide: 220, vol: 0.05, when: w }));
      if (env.at(16.2)) SFX.coin({ vol: 0.06 });
      if (env.at(16.4)) SFX.tone(1200, 0.8, { type: 'square', slide: 300, vol: 0.03 });
      if (env.at(18.4)) {
        ['G4', 'C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => SFX.tone(n, 0.1, { type: 'square', vol: 0.04, when: i * 0.1 }));
        SFX.tone('G6', 0.6, { type: 'square', vol: 0.04, when: 0.6 });
      }
      [18.8, 19.3, 19.8, 20.4].forEach(a => { if (env.at(a + 0.3)) SFX.noise(0.4, { filter: 'lowpass', freq: 900, slide: 200, vol: 0.14 }); });
      if (env.at(23.0)) SFX.tone('C6', 0.1, { type: 'square', vol: 0.03 });
    },
  });
})();
