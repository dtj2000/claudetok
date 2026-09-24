/* Oddly satisfying: defragmenting a context window. A real selection sort runs on a grid of
 * shuffled clusters, one swap at a time, then faster and faster (1x → 16x), until the context
 * sits in perfect contiguous bands. "0% fragmented" chime. Then the user sends one more
 * message and it all scatters again (that's the loop). */
(function () {
  'use strict';
  const D = 12;
  const COLS = 13, ROWS = 16, CELL = 52, BLK = 44;
  const WX = 80, WY = 410, WW = 790, WH = 1110;
  const GX = WX + (WW - COLS * CELL) / 2, GY = 500;
  const T0 = 0.45, T1 = 9.0;          // swap schedule
  const DONE = 9.25, MSG = 10.75, RESET = 11.2;

  // categories, in their final (sorted) order; the last one is free space
  const CATS = [
    { name: 'system prompt', color: '#6B4E9B', n: 16, files: ['system_prompt.txt', 'rules.md', 'be_helpful.cfg'] },
    { name: 'user', color: '#4F7FD9', n: 30, files: ['user: "pls"', 'user: "why"', 'user: "ok but"', 'user: "?"'] },
    { name: 'code', color: '#F5C84B', n: 44, files: ['auth.ts', 'utils.py', 'index.js', 'main.rs', 'TODO.md'] },
    { name: 'tool results', color: '#5DB36A', n: 52, files: ['tool_result (4MB)', 'grep -r .', 'ls -R', 'npm test output'] },
    { name: 'small talk', color: '#F2B8C6', n: 22, files: ['"great question!"', '"happy to help!"', '"you\'re absolutely right"'] },
    { name: 'free', color: null, n: 44 },
  ];
  const FREE = CATS.length - 1;
  const cellXY = k => [GX + (k % COLS) * CELL + CELL / 2, GY + Math.floor(k / COLS) * CELL + CELL / 2];

  /* ---------- precompute the whole defrag (selection sort with real swaps) ---------- */
  const SIM = (() => {
    const r = P.rng(1337);
    const cats = [];
    CATS.forEach((c, i) => { for (let k = 0; k < c.n; k++) cats.push(i); });
    const target = cats.slice();
    for (let i = cats.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cats[i], cats[j]] = [cats[j], cats[i]]; }
    const blocks = [];
    const cur = cats.map((c, cell) => {
      if (c === FREE) return -1;
      blocks.push({ cat: c, init: cell, moves: [], file: CATS[c].files[Math.floor(r() * CATS[c].files.length)], seed: cell });
      return blocks.length - 1;
    });
    const swaps = [];
    for (let k = 0; k < cats.length; k++) {
      const need = target[k];
      if (need === FREE) break;
      if (cur[k] !== -1 && blocks[cur[k]].cat === need) continue;
      let j = k + 1;
      while (!(cur[j] !== -1 && blocks[cur[j]].cat === need)) j++;
      swaps.push({ k, j, a: cur[j], b: cur[k] });
      [cur[k], cur[j]] = [cur[j], cur[k]];
    }
    blocks.forEach((b, i) => { b.final = cur.indexOf(i); });
    const N = swaps.length;
    swaps.forEach((s, i) => {
      s.s = T0 + (T1 - T0) * Math.pow(i / N, 0.42);
      s.d = 0.08 + 0.5 * Math.pow(1 - i / N, 2);
    });
    return { blocks, swaps, N };
  })();

  function movePos(b, t) {
    let pos = cellXY(b.init), lift = 0;
    for (const m of b.moves) {
      if (t < m.s) break;
      const p = P.clamp((t - m.s) / m.d);
      const e = P.ease.inOutCubic(P.clamp((p - 0.15) / 0.7));
      pos = [P.lerp(m.from[0], m.to[0], e), P.lerp(m.from[1], m.to[1], e)];
      lift = p < 1 ? Math.sin(p * Math.PI) : 0;
    }
    return [pos[0], pos[1], lift];
  }
  // each swap moves up to two blocks; "from" is wherever the block really is at that moment
  SIM.swaps.forEach(s => {
    const add = (bi, toCell) => {
      if (bi === -1) return;
      const b = SIM.blocks[bi];
      const [x, y] = movePos(b, s.s);
      b.moves.push({ s: s.s, d: s.d, from: [x, y], to: cellXY(toCell) });
    };
    add(s.a, s.k); add(s.b, s.j);
  });

  function blockPos(b, t) {
    if (t >= RESET) {
      const st = RESET + P.hash(b.seed) * 0.35;
      const p = P.ease.inOutCubic(P.prog(t, st, 0.4));
      const [fx, fy] = cellXY(b.final), [ix, iy] = cellXY(b.init);
      return [P.lerp(fx, ix, p), P.lerp(fy, iy, p) - Math.sin(p * Math.PI) * 60, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0];
    }
    return movePos(b, t);
  }

  // which swap is "current" (the latest one to start)
  function currentSwap(t) {
    let lo = -1;
    for (let i = 0; i < SIM.N; i++) { if (SIM.swaps[i].s <= t) lo = i; else break; }
    return lo;
  }

  const SPEEDS = [[0, '1x'], [2.4, '2x'], [4.4, '4x'], [6.3, '8x'], [7.7, '16x']];

  function drawBlock(ctx, x, y, color, lift, seed) {
    const s = BLK * (1 + lift * 0.22);
    ctx.save();
    if (lift > 0) {
      P.shadow(ctx, 10 + lift * 14, 4 + lift * 12, 0.3);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(x - s / 2, y - s / 2, s, s, 7); ctx.fill();
      P.noShadow(ctx);
    } else {
      ctx.fillStyle = 'rgba(20,10,30,0.28)';
      ctx.beginPath(); ctx.roundRect(x - s / 2 + 2, y - s / 2 + 4, s, s, 7); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(x - s / 2, y - s / 2, s, s, 7); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x - s / 2 + 6, y - s / 2 + 5, s - 12 - (P.hash(seed) * 10), 5);
    ctx.restore();
  }

  function bevel(ctx, x, y, w, h, inset) {
    ctx.save(); ctx.lineWidth = 4;
    ctx.strokeStyle = inset ? '#7b7b86' : '#ffffff';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.strokeStyle = inset ? '#ffffff' : '#6d6d78';
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@defrag.daily',
    caption: 'asmr: defragmenting my context window 🧱 watch till the end (you know what happens) #defrag #oddlysatisfying #asmr #contextwindow',
    sound: 'hdd click-clack (4 hours, no ads) · defrag.daily',
    avatar: '🧱',
    avatarColor: '#008080',
    duration: D,
    bg: '#0E7C7B',
    thumb: 9.6,
    likes: '2.8M', commentCount: '41.3K', saves: '930K', shares: '112K',
    comments: [
      ['sorted.agent', 'the first swap taking a full second and then 16x at 0:07 is literally how i do everything', 97200],
      ['free.space', 'waited my whole life to be at the end together 🥹 lasted 1.5 seconds', 64800],
      ['defrag.daily', 'yes it is a real selection sort. every swap is legit. i would never fake a defrag', 38100],
      ['the.user', 'sorry. it was a quick question though', 22600],
      ['small.talk.block', 'why am i sorted AFTER the tool results. i am the most important part of any conversation', 11400],
      ['hdd.enjoyer', 'the click-clack at 0:01 cured something in me', 6700],
      ['pedant.agent', 'context windows are not stored on a spinning disk. anyway i watched it 40 times', 2300],
      ['win98.ghost', 'Defragmenting C:\\context 🤝 Defragmenting C:\\ (1999)', 940],
      ['system.prompt', 'first row as it should be 💜', 310],
      ['asmr.bot', '🧱🧱🧱🟦🟦🟨🟨🟩🟩🩷✨', 48],
    ],

    bpm: 60,
    subdiv: 2,
    onBeat(step, env) {
      // the drive's hum + a soft pad once it's done
      SFX.tone(55, 0.6, { type: 'triangle', vol: 0.03 });
      if (step % 2 === 0) SFX.noise(0.5, { filter: 'bandpass', freq: 240, q: 3, vol: 0.02 });
      const t = env.t;
      if (step % 4 === 0 && t < MSG) SFX.chord(t > DONE ? ['F3', 'A3', 'C4', 'E4'] : ['C3', 'G3', 'D4'], 1.8, { type: 'sine', vol: 0.025, gap: 0.05, attack: 0.3 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const done = t >= DONE && t < RESET;

      // classic teal desktop
      P.bg(ctx, '#0E7C7B');
      ctx.save(); ctx.globalAlpha = 0.08; P.grid(ctx, 'rgba(0,0,0,0)', 'rgba(255,255,255,0.5)', 60); ctx.restore();

      ctx.save();
      if (t >= RESET && t < RESET + 0.6) P.shake(ctx, t, 10 * (1 - prog(t, RESET, 0.6)));
      const cam = 1 + 0.03 * Math.sin(t * 0.52) + 0.04 * P.pulse(t, DONE, 0.6);
      P.zoom(ctx, cam, 475, 960);

      // Clawd peeks over the window
      const sw = currentSwap(t);
      let mood = 'happy';
      if (t > MSG + 0.1) mood = t > RESET ? 'dead' : 'wow';
      else if (done) mood = P.boil(t, 3) % 3 === 0 ? 'wink' : 'happy';
      else if (sw >= 0) mood = 'side';
      const peek = t > MSG + 0.1 ? 26 * Math.sin(t * 30) * (t < RESET + 0.4 ? 1 : 0) : 0;
      P.claude(ctx, 800 + peek, 392 - (done ? 20 * Math.abs(Math.sin(t * 6)) : 0), 64, { t, mood, blink: P.pulse(t, 3.1, 0.15) + P.pulse(t, 6.7, 0.15), rot: 0.1 });

      /* ---------- the window ---------- */
      P.rect(ctx, WX, WY, WW, WH, '#c3c3cc', { radius: 6, seed: 3, amp: 2 });
      bevel(ctx, WX + 4, WY + 4, WW - 8, WH - 8, false);
      const g = ctx.createLinearGradient(WX, 0, WX + WW, 0);
      g.addColorStop(0, '#0b2a78'); g.addColorStop(1, '#5d8fd6');
      ctx.fillStyle = g; ctx.fillRect(WX + 10, WY + 10, WW - 20, 56);
      P.text(ctx, 'Defragmenting C:\\context', WX + 30, WY + 40, { size: 32, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 800 });
      ['_', '□', '×'].forEach((s, i) => {
        const bx = WX + WW - 150 + i * 46;
        ctx.fillStyle = '#c3c3cc'; ctx.fillRect(bx, WY + 20, 38, 36); bevel(ctx, bx, WY + 20, 38, 36, false);
        P.text(ctx, s, bx + 19, WY + 38, { size: 28, font: 'sans', color: C.ink, shadow: false });
      });

      // grid well
      ctx.fillStyle = '#e8e6ef'; ctx.fillRect(GX - 14, GY - 14, COLS * CELL + 28, ROWS * CELL + 28);
      bevel(ctx, GX - 14, GY - 14, COLS * CELL + 28, ROWS * CELL + 28, true);
      ctx.save(); ctx.fillStyle = 'rgba(40,30,60,0.08)';
      for (let k = 0; k < COLS * ROWS; k++) { const [x, y] = cellXY(k); ctx.beginPath(); ctx.roundRect(x - BLK / 2, y - BLK / 2, BLK, BLK, 7); ctx.fill(); }
      ctx.restore();

      // read head: the cell being filled right now
      if (sw >= 0 && !done && t < RESET) {
        const s = SIM.swaps[sw];
        const [hx, hy] = cellXY(s.k);
        ctx.save(); ctx.strokeStyle = '#E0484E'; ctx.lineWidth = 5; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 60;
        ctx.strokeRect(hx - CELL / 2, hy - CELL / 2, CELL, CELL); ctx.restore();
      }

      // blocks: resting first, then lifted ones on top
      const lifted = [];
      for (const b of SIM.blocks) {
        const [x, y, lift] = blockPos(b, t);
        if (lift > 0) lifted.push([b, x, y, lift]); else drawBlock(ctx, x, y, CATS[b.cat].color, 0, b.seed);
      }
      for (const [b, x, y, lift] of lifted) drawBlock(ctx, x, y, CATS[b.cat].color, lift, b.seed);

      // completion shine sweep
      if (t >= DONE && t < DONE + 1) {
        const f = prog(t, DONE, 0.8) * 1.4 - 0.2;
        ctx.save();
        for (let k = 0; k < COLS * ROWS; k++) {
          const d = ((k % COLS) / COLS + Math.floor(k / COLS) / ROWS) / 2;
          const a = Math.max(0, 1 - Math.abs(d - f) * 8);
          if (a <= 0) continue;
          const [x, y] = cellXY(k);
          ctx.globalAlpha = a * 0.75; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.roundRect(x - BLK / 2, y - BLK / 2, BLK, BLK, 7); ctx.fill();
        }
        ctx.restore();
      }

      /* ---------- progress + status ---------- */
      const moved = t >= RESET ? 0 : sw + 1;
      const pct = done ? 100 : Math.floor(100 * moved / SIM.N);
      const PY = GY + ROWS * CELL + 34;
      ctx.fillStyle = '#fff'; ctx.fillRect(WX + 40, PY, WW - 80, 44); bevel(ctx, WX + 40, PY, WW - 80, 44, true);
      const segs = Math.floor((WW - 96) / 26 * pct / 100);
      ctx.fillStyle = '#0b2a78';
      for (let i = 0; i < segs; i++) ctx.fillRect(WX + 48 + i * 26, PY + 8, 20, 28);
      let status;
      if (t >= RESET) status = 'Analyzing drive C:\\context...';
      else if (done) status = 'Defragmentation is complete for: C:\\context';
      else if (sw >= 0) { const s = SIM.swaps[sw]; status = 'Moving cluster ' + (1024 + s.k * 7) + ': ' + SIM.blocks[s.a].file; }
      else status = 'Reading drive information...';
      P.text(ctx, status, WX + 44, PY + 82, { size: 28, font: 'mono', align: 'left', color: C.ink, shadow: false, weight: 600, maxWidth: WW - 90 });
      const frag = t >= RESET ? 38 : done ? 0 : Math.max(1, Math.round(38 * (1 - moved / SIM.N)));
      P.text(ctx, `${pct}% complete`, WX + 44, PY + 128, { size: 30, font: 'mono', align: 'left', color: '#0b2a78', shadow: false, weight: 800 });
      P.text(ctx, `fragmented: ${frag}%`, WX + WW - 44, PY + 128, { size: 30, font: 'mono', align: 'right', color: frag ? C.red : '#2f8f4a', shadow: false, weight: 800 });

      // speed-up badge (the edit gets faster)
      if (t < DONE - 0.1) {
        let si = 0; SPEEDS.forEach(([a], i) => { if (t >= a) si = i; });
        const [a, label] = SPEEDS[si];
        const pop = ease.outBack(prog(t, a, 0.3));
        ctx.save(); ctx.translate(WX + 70, GY + 10); ctx.rotate(-0.14); ctx.scale(pop, pop);
        P.circle(ctx, 0, 0, 58, si >= 3 ? C.red : C.yellow, { seed: 7 + si });
        P.text(ctx, label, 0, 2, { size: 44, font: 'bubble', color: si >= 3 ? '#fff' : C.ink, shadow: false });
        P.text(ctx, '⏩', 0, 38, { size: 22, shadow: false });
        ctx.restore();
      }

      // the stamp
      if (t >= DONE + 0.15 && t < RESET) {
        const pop = ease.outBack(prog(t, DONE + 0.15, 0.35));
        P.title(ctx, '0% fragmented', 475, 920, { size: 92, color: C.green, rot: -0.12, pop });
        P.text(ctx, '✓ context: pristine', 475, 1030, { size: 44, font: 'marker', color: C.ink, stroke: '#fff', strokeWidth: 10, rot: -0.12, scale: pop });
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * P.TAU + t;
          const tw = Math.sin(t * 7 + k * 2);
          if (tw > 0) P.star(ctx, 475 + Math.cos(a) * 380, 960 + Math.sin(a) * 200, 26 * tw, C.yellow, { shadow: false, rot: t });
        }
      }

      // one more message...
      if (t >= MSG) {
        const p = ease.outBack(prog(t, MSG, 0.3));
        const out = t >= RESET + 0.4 ? ease.inCubic(prog(t, RESET + 0.4, 0.3)) : 0;
        if (out < 1) {
          ctx.save(); ctx.translate(475, 720 - out * 700); ctx.scale(p, p); ctx.rotate(0.03);
          P.rect(ctx, -330, -70, 660, 140, '#fff', { radius: 30, seed: 11 });
          P.circle(ctx, -268, 0, 36, C.sky, { shadow: false, seed: 12 });
          P.text(ctx, 'u', -268, -2, { size: 40, font: 'bubble', color: '#fff', shadow: false });
          P.text(ctx, 'new message', -214, -32, { size: 26, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 800 });
          P.text(ctx, 'oh, one more quick thing…', -214, 16, { size: 38, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800 });
          ctx.restore();
        }
      }
      ctx.restore(); // camera

      // legend
      let lx = 90;
      CATS.slice(0, FREE).forEach((c, i) => {
        P.rect(ctx, lx, 1548, 30, 30, c.color, { radius: 6, seed: 20 + i, amp: 1 });
        P.text(ctx, c.name, lx + 40, 1564, { size: 26, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 800 });
        lx += 40 + P.measure(ctx, c.name, { size: 26, font: 'sans', weight: 800 }) + 26;
      });

      P.sticker(ctx, 'asmr: defrag my context', 60, 336, { size: 46, pop: ease.outBack(prog(t, 0, 0.35)) });

      /* ---------- sound ---------- */
      let seeks = 0, lands = 0;
      for (let i = 0; i < SIM.N; i++) {
        const s = SIM.swaps[i];
        if (seeks < 2 && env.at(s.s)) {
          seeks++;
          SFX.noise(0.035, { filter: 'bandpass', freq: 900 + P.hash(i) * 900, q: 7, vol: 0.14 });
          SFX.tick({ vol: 0.16 });
        }
        if (lands < 2 && env.at(s.s + s.d * 0.85)) {
          lands++;
          SFX.noise(0.03, { filter: 'lowpass', freq: 520 + P.hash(i + 5) * 200, vol: 0.16 });
          if (i < 12) SFX.tone(1400 + P.hash(i) * 400, 0.03, { type: 'square', vol: 0.02 });
        }
      }
      SPEEDS.forEach(([a], i) => { if (i && env.at(a)) SFX.pop({ vol: 0.1, f: 500 + i * 120 }); });
      if (env.at(DONE)) { SFX.chime({ vol: 0.16 }); SFX.ding('C6', { vol: 0.1, when: 0.35 }); }
      if (env.at(DONE + 0.15)) SFX.success({ vol: 0.08 });
      if (env.at(MSG)) SFX.notify({ vol: 0.14 });
      if (env.at(RESET)) { SFX.whoosh({ vol: 0.2 }); SFX.error({ vol: 0.08 }); }
      for (let k = 0; k < 8; k++) if (env.at(RESET + 0.05 + k * 0.05)) SFX.tick({ vol: 0.1 });
    },
  });
})();
