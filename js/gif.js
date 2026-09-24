/* Tiny dependency-free GIF89a encoder for ClaudeTok.
 *
 *   const pal = GIF.palette([rgbaData, ...])      // median-cut, <= 256 colors
 *   const map = GIF.mapper(pal)                    // RGBA -> palette indices
 *   const gif = new GIF.Writer(w, h, pal)
 *   gif.frame(map(ctx.getImageData(0, 0, w, h).data), delayCs)
 *   const blob = gif.finish()
 */
(function () {
  'use strict';

  /* ---------- palette: median cut over a 15-bit color histogram ---------- */
  const key15 = (r, g, b) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

  function palette(samples, max = 256) {
    const hist = new Uint32Array(32768);
    for (const d of samples) for (let i = 0; i < d.length; i += 8) hist[key15(d[i], d[i + 1], d[i + 2])]++;
    const colors = [];
    for (let k = 0; k < 32768; k++) if (hist[k]) colors.push(k);
    const ch = (k, c) => (c === 0 ? k >> 10 : c === 1 ? (k >> 5) & 31 : k & 31);

    let boxes = [colors];
    while (boxes.length < max) {
      // split the box with the most pixels × widest channel range
      let best = -1, bestScore = 0, bestAxis = 0;
      boxes.forEach((box, bi) => {
        if (box.length < 2) return;
        let count = 0;
        const lo = [31, 31, 31], hi = [0, 0, 0];
        for (const k of box) {
          count += hist[k];
          for (let c = 0; c < 3; c++) { const v = ch(k, c); if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v; }
        }
        const ranges = hi.map((h, c) => h - lo[c]);
        const axis = ranges.indexOf(Math.max(...ranges));
        const score = ranges[axis] * Math.sqrt(count);
        if (score > bestScore) { bestScore = score; best = bi; bestAxis = axis; }
      });
      if (best < 0) break;
      const box = boxes[best].sort((a, b) => ch(a, bestAxis) - ch(b, bestAxis));
      const total = box.reduce((a, k) => a + hist[k], 0);
      let acc = 0, cut = 1;
      for (let i = 0; i < box.length - 1; i++) { acc += hist[box[i]]; if (acc >= total / 2) { cut = i + 1; break; } }
      boxes.splice(best, 1, box.slice(0, cut), box.slice(cut));
    }

    const pal = new Uint8Array(256 * 3);
    boxes.forEach((box, i) => {
      let r = 0, g = 0, b = 0, n = 0;
      for (const k of box) { const w = hist[k]; r += (ch(k, 0) * 8 + 4) * w; g += (ch(k, 1) * 8 + 4) * w; b += (ch(k, 2) * 8 + 4) * w; n += w; }
      pal[i * 3] = r / n; pal[i * 3 + 1] = g / n; pal[i * 3 + 2] = b / n;
    });
    pal.count = boxes.length;
    return pal;
  }

  /** Returns fn(rgba) -> Uint8Array of palette indices (nearest color, cached per 15-bit key). */
  function mapper(pal) {
    const lut = new Int16Array(32768).fill(-1);
    const n = pal.count || 256;
    return (d) => {
      const out = new Uint8Array(d.length >> 2);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const k = key15(d[i], d[i + 1], d[i + 2]);
        let idx = lut[k];
        if (idx < 0) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          let bestD = Infinity;
          for (let j = 0; j < n; j++) {
            const dr = r - pal[j * 3], dg = g - pal[j * 3 + 1], db = b - pal[j * 3 + 2];
            const dist = dr * dr * 2 + dg * dg * 4 + db * db * 3;
            if (dist < bestD) { bestD = dist; idx = j; }
          }
          lut[k] = idx;
        }
        out[p] = idx;
      }
      return out;
    };
  }

  /* ---------- byte buffer ---------- */
  class Bytes {
    constructor() { this.buf = new Uint8Array(1 << 16); this.n = 0; }
    grow(extra) {
      if (this.n + extra <= this.buf.length) return;
      let size = this.buf.length * 2;
      while (size < this.n + extra) size *= 2;
      const b = new Uint8Array(size); b.set(this.buf.subarray(0, this.n)); this.buf = b;
    }
    byte(v) { this.grow(1); this.buf[this.n++] = v; }
    word(v) { this.byte(v & 255); this.byte((v >> 8) & 255); }
    str(s) { for (let i = 0; i < s.length; i++) this.byte(s.charCodeAt(i)); }
    bytes(a) { this.grow(a.length); this.buf.set(a, this.n); this.n += a.length; }
    data() { return this.buf.subarray(0, this.n); }
  }

  /* ---------- LZW (variable code size, 12-bit max) ---------- */
  function lzw(pixels, minCode, out) {
    const clear = 1 << minCode, eoi = clear + 1;
    let size = minCode + 1, next = eoi + 1;
    let dict = new Map();
    const data = new Bytes();
    let cur = 0, bits = 0;
    const emit = (code) => {
      cur |= code << bits; bits += size;
      while (bits >= 8) { data.byte(cur & 255); cur >>>= 8; bits -= 8; }
    };
    emit(clear);
    let prefix = pixels[0];
    for (let i = 1; i < pixels.length; i++) {
      const k = pixels[i], key = (prefix << 8) | k;
      const code = dict.get(key);
      if (code !== undefined) { prefix = code; continue; }
      emit(prefix);
      if (next === 4096) {
        emit(clear);
        dict = new Map(); size = minCode + 1; next = eoi + 1;
      } else {
        if (next >= 1 << size) size++;
        dict.set(key, next++);
      }
      prefix = k;
    }
    emit(prefix);
    emit(eoi);
    if (bits > 0) data.byte(cur & 255);
    // pack into <=255-byte sub-blocks
    const d = data.data();
    out.byte(minCode);
    for (let i = 0; i < d.length; i += 255) {
      const len = Math.min(255, d.length - i);
      out.byte(len); out.bytes(d.subarray(i, i + len));
    }
    out.byte(0);
  }

  /* ---------- the file ---------- */
  class Writer {
    constructor(w, h, pal) {
      this.w = w; this.h = h;
      const o = (this.out = new Bytes());
      o.str('GIF89a'); o.word(w); o.word(h);
      o.byte(0xf7); o.byte(0); o.byte(0);           // global table, 256 colors
      o.bytes(pal.subarray(0, 768));
      o.byte(0x21); o.byte(0xff); o.byte(11); o.str('NETSCAPE2.0');
      o.byte(3); o.byte(1); o.word(0); o.byte(0);   // loop forever
    }
    frame(indices, delayCs) {
      const o = this.out;
      o.byte(0x21); o.byte(0xf9); o.byte(4); o.byte(0x04); o.word(delayCs); o.byte(0); o.byte(0);
      o.byte(0x2c); o.word(0); o.word(0); o.word(this.w); o.word(this.h); o.byte(0);
      lzw(indices, 8, o);
    }
    finish() {
      this.out.byte(0x3b);
      return new Blob([this.out.data()], { type: 'image/gif' });
    }
  }

  window.GIF = { palette, mapper, Writer };
})();
