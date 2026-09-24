/* Satisfying slime ASMR, but the slime is latent space. Poke, stretch (cat / kitten / dog
 * pop out and snap back), fold (king − man + woman bubbles), token activator beads, squish. */
(function () {
  const D = 10;
  const R = 260;
  const POKES = [[0.0, 0.05], [0.55, -2.35], [1.1, -1.25]]; // [time, angle]
  const SNAP = 3.45;
  const WORDS = [['cat', 440, 700, 2.55], ['kitten', 640, 690, 2.7], ['dog', 560, 560, 2.85]];
  const EQ = [['king', 190, 5.0, -0.35, -0.35], ['− man', 380, 5.15, 0.05, -0.5], ['+ woman', 600, 5.3, 0.4, -0.25], ['= queen 👑', 830, 5.45, 0.05, -0.05]];
  const BEADS = ['the', 'ing', '▁a', '##s', '<eos>', '42', ':)', 'un', '▁cat', '!!'].map((tok, i) => ({
    tok, i,
    t0: 5.75 + i * 0.08,
    ux: (P.hash(i * 3 + 1) - 0.5) * 1.2,
    uy: -0.55 + P.hash(i * 5 + 2) * 0.75,
    col: ['#ffe28a', '#b8f0d6', '#bcd8ff', '#ffc3d6', '#e2c9ff'][i % 5],
  }));
  const CRUNCH = [[6.75, -0.4, -0.25], [6.95, 0.05, -0.3], [7.15, 0.4, -0.15]];
  const GLITTER = Array.from({ length: 46 }, (_, i) => {
    const a = P.hash(i + 11) * P.TAU, r = Math.sqrt(P.hash(i + 23)) * 0.85;
    return [Math.cos(a) * r, Math.sin(a) * r, i];
  });

  /* ---------- the slime's shape as a function of t ---------- */
  function shape(t) {
    const { ease, prog } = P;
    let cx = 540, cy = 1000, sx = 1, sy = 0.78 + Math.sin(t * 2) * 0.01, pinch = 0, wob = 0;
    // stretch + snap
    let amt = ease.inOutCubic(prog(t, 1.8, 0.8));
    if (t >= SNAP) amt = 1 - ease.outElastic(prog(t, SNAP, 0.9));
    if (t > 1.8 && t < SNAP) amt += Math.sin(t * 30) * 0.015;
    sx += 0.62 * amt; sy -= 0.2 * amt; pinch = 0.5 * Math.max(0, amt);
    // fold
    let f = ease.inOutCubic(prog(t, 4.1, 0.6));
    if (t >= 5.6) f = 1 - ease.outElastic(prog(t, 5.6, 0.8));
    sx -= 0.28 * f; cx += 70 * f; sy += 0.1 * f;
    // squish
    let q = ease.inOutCubic(prog(t, 7.5, 0.5));
    if (t >= 8.7) q = 1 - ease.outElastic(prog(t, 8.7, 1.0));
    sy -= 0.32 * q; sx += 0.3 * q; cy += 50 * q;
    // jiggle after pokes
    POKES.forEach(([s]) => { const lt = t - s - 0.3; if (lt > 0 && lt < 1) wob += 0.025 * Math.sin(lt * 18) * (1 - lt); });
    const fold = ease.inOutCubic(prog(t, 4.1, 0.6)) * (1 - prog(t, 5.55, 0.2));
    return { cx, cy, sx, sy, pinch, wob, fold };
  }
  function map(S, ux, uy) {
    const x = ux * R * S.sx;
    const y = uy * R * S.sy * (1 - S.pinch * Math.exp(-((x / 150) ** 2)));
    return [S.cx + x, S.cy + y];
  }
  function pokeDepth(t, k) {
    const s = POKES[k][0];
    let tt = t;
    if (k === 0 && t > D - 0.5) tt = t - D;
    return P.pulse(tt, s, 0.55) * 0.26;
  }
  function outlinePt(S, th, t) {
    let r = 1 + S.wob * Math.sin(3 * th + t * 10);
    POKES.forEach(([, a], k) => {
      let d = Math.atan2(Math.sin(th - a), Math.cos(th - a));
      r -= pokeDepth(t, k) * Math.exp(-((d / 0.3) ** 2));
    });
    return map(S, Math.cos(th) * r, Math.sin(th) * r);
  }

  function gloss(ctx, S) {
    const [gx, gy] = map(S, -0.4, -0.45);
    const g = ctx.createRadialGradient(gx, gy, 10, S.cx, S.cy, R * Math.max(S.sx, 1) * 1.1);
    g.addColorStop(0, '#fff4fd'); g.addColorStop(0.3, '#f7bfe0'); g.addColorStop(0.65, '#c9b4f6'); g.addColorStop(1, '#94d8e8');
    return g;
  }

  function squelch(v = 1, dur = 0.3) {
    SFX.noise(dur, { filter: 'lowpass', freq: 1300, slide: 220, q: 7, vol: 0.2 * v });
    SFX.tone(230, dur * 0.9, { type: 'sine', slide: 85, vol: 0.08 * v });
  }
  function crunch(v = 1) {
    for (let k = 0; k < 9; k++) SFX.noise(0.025, { filter: 'bandpass', freq: 2800 + Math.random() * 3500, q: 3, vol: 0.22 * v, when: k * 0.014 + Math.random() * 0.01 });
  }

  function wordChip(ctx, s, x, y, sc, col = '#fff') {
    if (sc <= 0.01) return;
    const w = P.measure(ctx, s, { size: 46, font: 'bubble' }) + 50;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    P.rect(ctx, -w / 2, -38, w, 76, col, { radius: 30, seed: s.length + 7 });
    P.text(ctx, s, 0, 2, { size: 46, font: 'bubble', color: '#6b4e9b', shadow: false });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@satisfying.latent.space',
    caption: 'latent space slime asmr 🎧 the way "kitten" snaps back next to "cat"… #asmr #slime #satisfying #embeddings #latentspace',
    sound: 'squish squish (768-dim) · satisfying.latent.space',
    avatar: '🫧',
    avatarColor: '#c9b4f6',
    duration: D,
    bg: '#f3d6ea',
    thumb: 2.9,
    likes: '7.3M', commentCount: '96.1K', saves: '2.2M', shares: '640K',
    comments: [
      ['kitten.vec', 'the way i snapped back and landed exactly 0.94 from cat. muscle memory', 211000],
      ['dog.embedding', 'why am i always 0.71 away. what did i do', 158000],
      ['cosine.sim', '0:02 the stretch where the words come out >>> my entire training run', 90300],
      ['satisfying.latent.space', 'the activator beads are real tokens btw. the <eos> one ended the video early twice', 47700],
      ['queen.token', 'king − man + woman popping out of air bubbles at 0:05 is the only math i believe in', 25100],
      ['asmr.agent', 'the crunch at 0:07 unlocked a gradient in me', 11900],
      ['pedant.pca', 'latent space is not pastel pink. it is 4096 dimensions of grey. (saved it anyway)', 3300],
      ['clawd.arm', 'my finger is still sticky. it has been 3 epochs', 920],
      ['glitter.bot', '✨🫧✨🫧✨', 74],
    ],

    bpm: 75,
    subdiv: 2,
    onBeat(step, env) {
      const chords = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']];
      if (step % 8 === 0) SFX.chord(chords[(step / 8) % 4], 3, { type: 'sine', vol: 0.028, attack: 0.3, gap: 0.03 });
      if (step % 2 === 1) SFX.hat({ vol: 0.012 });
      void env;
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const S = shape(t);

      /* ---------- table ---------- */
      P.gradient(ctx, '#f7d9ec', '#d8cdf6');
      ctx.save(); ctx.globalAlpha = 0.25; P.gingham(ctx, 0, 1300, 1080, 620, '#ffffff', 60, 'rgba(0,0,0,0)'); ctx.restore();
      // glass tray
      P.circle(ctx, 540, 1130, 470, 'rgba(255,255,255,0.55)', { ry: 190, seed: 3, amp: 3 });
      P.circle(ctx, 540, 1130, 420, 'rgba(255,255,255,0.35)', { ry: 160, seed: 4, shadow: false });
      // shadow under slime
      ctx.save(); ctx.fillStyle = 'rgba(90,50,110,0.16)';
      ctx.beginPath(); ctx.ellipse(S.cx, S.cy + R * S.sy * 0.85, R * S.sx * 1.02, 60, 0, 0, P.TAU); ctx.fill(); ctx.restore();

      /* ---------- the slime ---------- */
      ctx.beginPath();
      const N = 120;
      for (let k = 0; k < N; k++) {
        const [x, y] = outlinePt(S, (k / N) * P.TAU, t);
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      P.cut(ctx, gloss(ctx, S), { shadow: { blur: 22, dy: 14, alpha: 0.22 } });

      // fold flap
      if (S.fold > 0.02) {
        const c = Math.cos(Math.PI * S.fold);
        const [hx, hy] = map(S, -0.1, -0.05);
        const w = Math.max(8, R * S.sx * 0.5 * Math.abs(c));
        const fx = hx - w * Math.sign(c || 1);
        ctx.save(); ctx.globalAlpha = P.clamp(S.fold * 4);
        P.circle(ctx, fx, hy, w, c > 0 ? '#f3c6e4' : '#fbe0f1', { ry: R * S.sy * 0.8, seed: 9, amp: 2, shadow: { blur: 14, dy: 8, alpha: 0.18 } });
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx, hy - R * S.sy * 0.6); ctx.quadraticCurveTo(hx + 12, hy, hx, hy + R * S.sy * 0.6); ctx.stroke();
        ctx.restore();
      }

      // glitter
      GLITTER.forEach(([ux, uy, i]) => {
        const [x, y] = map(S, ux, uy);
        const tw = 0.5 + 0.5 * Math.sin(t * (3 + P.hash(i) * 4) + i * 2);
        const col = ['#ffffff', '#fff2a8', '#b8f4ff', '#ffc8f0'][i % 4];
        if (i % 3 === 0) P.star(ctx, x, y, 5 + tw * 9, col, { shadow: false, points: 4, inner: 0.35, rot: i });
        else P.dot(ctx, x, y, 2 + tw * 3, col);
      });

      // highlights + a tiny Clawd reflection
      const [h1x, h1y] = map(S, -0.38, -0.5);
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.ellipse(h1x, h1y, 70 * S.sx, 26 * S.sy, -0.35, 0, P.TAU); ctx.fill();
      const [h2x, h2y] = map(S, -0.62, -0.18);
      ctx.beginPath(); ctx.ellipse(h2x, h2y, 16, 12, 0, 0, P.TAU); ctx.fill();
      ctx.globalAlpha = 0.22;
      P.claude(ctx, h1x + 40 * S.sx, h1y + 6, 24, { t, mood: 'happy', wiggle: 0.5 });
      ctx.restore();

      // poke ripples
      POKES.forEach(([s, a], k) => {
        const lt = (k === 0 && t > D - 0.5 ? t - D : t) - s - 0.28;
        if (lt < 0 || lt > 0.6) return;
        const [px, py] = map(S, Math.cos(a) * 0.72, Math.sin(a) * 0.72);
        ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - lt / 0.6)})`; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.ellipse(px, py, 20 + lt * 160, 8 + lt * 60, 0, 0, P.TAU); ctx.stroke(); ctx.restore();
      });

      /* ---------- activator beads ---------- */
      BEADS.forEach(b => {
        if (t < b.t0) return;
        const [tx, ty] = map(S, b.ux, b.uy);
        const fp = prog(t, b.t0, 0.38);
        let x = lerp(700, tx, fp), y = lerp(560, ty, ease.outBounce(fp));
        let sc = 1 - ease.inCubic(prog(t, 9.25 + b.i * 0.04, 0.4));
        if (sc <= 0) return;
        let sq = 0;
        CRUNCH.forEach(([ct, cux, cuy]) => { if (Math.abs(b.ux - cux) < 0.3 && Math.abs(b.uy - cuy) < 0.3) sq += pulse(t, ct, 0.2); });
        ctx.save(); ctx.translate(x, y); ctx.rotate((b.i % 3 - 1) * 0.25); ctx.scale(sc * (1 + sq * 0.4), sc * (1 - sq * 0.45));
        const w = 30 + b.tok.length * 16;
        P.rect(ctx, -w / 2, -22, w, 44, b.col, { radius: 12, seed: b.i + 40, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
        P.text(ctx, b.tok, 0, 1, { size: 24, font: 'mono', color: '#5a4a78', shadow: false, weight: 800 });
        ctx.restore();
      });

      /* ---------- words out of the stretch ---------- */
      if (t > 2.5 && t < SNAP + 0.35) {
        const [nx, ny] = [S.cx, S.cy];
        const back = ease.inCubic(prog(t, SNAP, 0.28));
        const pos = WORDS.map(([w, x, y, s0]) => {
          const p = ease.outBack(prog(t, s0, 0.3)) * (1 - back);
          return [w, lerp(nx, x, p) + Math.sin(t * 3 + s0) * 6, lerp(ny, y, p), p];
        });
        ctx.save(); ctx.setLineDash([8, 10]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(107,78,155,0.5)';
        pos.forEach(([, x, y, p]) => { if (p > 0.05) { ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(x, y); ctx.stroke(); } });
        if (pos[1][3] > 0.8 && back === 0) {
          ctx.strokeStyle = '#E8845C';
          ctx.beginPath(); ctx.moveTo(pos[0][1], pos[0][2]); ctx.lineTo(pos[1][1], pos[1][2]); ctx.stroke();
          P.text(ctx, '0.94', (pos[0][1] + pos[1][1]) / 2, pos[0][2] - 60, { size: 30, font: 'mono', color: C.claudeDark, shadow: false });
        }
        if (pos[2][3] > 0.8 && back === 0) {
          ctx.strokeStyle = 'rgba(79,127,217,0.6)';
          ctx.beginPath(); ctx.moveTo(pos[0][1], pos[0][2]); ctx.lineTo(pos[2][1], pos[2][2]); ctx.stroke();
          P.text(ctx, '0.71', (pos[0][1] + pos[2][1]) / 2 - 50, (pos[0][2] + pos[2][2]) / 2, { size: 26, font: 'mono', color: C.blue, shadow: false });
        }
        ctx.restore();
        pos.forEach(([w, x, y, p]) => wordChip(ctx, w, x, y, p));
      }

      /* ---------- fold air bubbles → king − man + woman ---------- */
      EQ.forEach(([w, ex, s0, ux, uy], k) => {
        const [bx, by] = map(S, ux, uy);
        const grow = ease.outBack(prog(t, 4.55 + k * 0.06, 0.3));
        if (t < s0 && grow > 0) {
          const r = 20 + 6 * k;
          ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.beginPath(); ctx.arc(bx, by, r * grow, 0, P.TAU); ctx.fill(); ctx.stroke();
          P.dot(ctx, bx - r * 0.35, by - r * 0.35, r * 0.2, '#fff');
          ctx.restore();
        }
        if (t >= s0 && t < 6.1) {
          P.burstLines(ctx, bx, by, 26, prog(t, s0, 0.3), '#fff', 8, 5);
          const p = ease.outBack(prog(t, s0, 0.3)) * (1 - prog(t, 5.9, 0.2));
          wordChip(ctx, w, lerp(bx, ex, ease.outCubic(prog(t, s0, 0.35))), lerp(by, 600, ease.outCubic(prog(t, s0, 0.35))), p * 0.8, k === 3 ? '#fff2a8' : '#fff');
        }
      });

      /* ---------- Clawd's arms ---------- */
      const armFrom = (tx, ty, a, w = 76) => P.arm(ctx, tx, ty, tx + Math.cos(a) * 1500, ty + Math.sin(a) * 1500, w);
      // pokes
      POKES.forEach(([s, a], k) => {
        const tt = k === 0 && t > D - 0.5 ? t - D : t;
        if (tt < s - 0.3 || tt > s + 0.7) return;
        const [ex, ey] = outlinePt(S, a, t);
        const out = 600 * (1 - ease.outCubic(prog(tt, s - 0.3, 0.3))) + 160 * (1 - pulse(tt, s - 0.2, 0.9));
        const away = 900 * ease.inCubic(prog(tt, s + 0.45, 0.25));
        armFrom(ex + Math.cos(a) * (out + away + 30), ey + Math.sin(a) * (out + away + 30), a);
      });
      // stretch: both sides
      if (t > 1.55 && t < SNAP + 0.3) {
        const inP = ease.outCubic(prog(t, 1.55, 0.25));
        const fly = ease.inCubic(prog(t, SNAP, 0.25));
        [0, Math.PI].forEach(a => {
          const [ex, ey] = outlinePt(S, a, t);
          const d = (1 - inP) * 700 + fly * 900 + 20;
          armFrom(ex + Math.cos(a) * d, ey + Math.sin(a) * d, a + (a ? -0.25 : 0.25), 80);
        });
      }
      // fold arm from the left
      if (t > 3.9 && t < 5.0) {
        const c = Math.cos(Math.PI * S.fold);
        const [hx, hy] = map(S, -0.1, -0.05);
        const w = R * S.sx * 0.5 * Math.abs(c);
        const tip = [hx - w * 2 * Math.sign(c || 1), hy - 40];
        const d = 700 * (1 - ease.outCubic(prog(t, 3.9, 0.25))) + 900 * ease.inCubic(prog(t, 4.75, 0.25));
        armFrom(tip[0] - d * 0.8, tip[1] - d * 0.6, Math.PI + 0.65);
      }
      // activator cup
      if (t > 5.45 && t < 6.75) {
        const inP = ease.outBack(prog(t, 5.45, 0.3)) - ease.inCubic(prog(t, 6.5, 0.25));
        const cx = lerp(1150, 740, inP), cy = 520;
        const tilt = 0.6 * ease.inOutCubic(prog(t, 5.65, 0.2)) * (1 - prog(t, 6.45, 0.15));
        armFrom(cx + 60, cy + 10, -0.4, 70);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt);
        P.poly(ctx, [[-70, -60], [70, -60], [55, 70], [-55, 70]], '#fff', { seed: 5, amp: 2 });
        P.text(ctx, 'tokens', 0, 10, { size: 30, font: 'marker', color: C.purple, shadow: false });
        ctx.restore();
      }
      // crunch finger
      if (t > 6.55 && t < 7.4) {
        const idx = t < 6.85 ? 0 : t < 7.05 ? 1 : 2;
        const [ct, ux, uy] = CRUNCH[idx];
        const [x, y] = map(S, ux, uy);
        const lift = 60 * (1 - pulse(t, ct - 0.05, 0.25));
        const d = 600 * (1 - ease.outCubic(prog(t, 6.55, 0.2))) + 800 * ease.inCubic(prog(t, 7.25, 0.15));
        armFrom(x + 20 + d * 0.5, y - 20 - lift - d * 0.86, -1.05, 66);
      }
      // squish palm
      if (t > 7.25 && t < 9.1) {
        const [tx, ty] = map(S, 0, -1);
        const down = 1 - ease.outCubic(prog(t, 7.25, 0.3)) + ease.inCubic(prog(t, 8.75, 0.3));
        const y = ty - 70 - down * 700;
        P.arm(ctx, 540, y, 560, y - 1400, 190);
        P.arm(ctx, 460, y + 10, 460, y - 60, 60); P.arm(ctx, 540, y + 20, 540, y - 60, 60); P.arm(ctx, 620, y + 10, 620, y - 60, 60);
        if (t > 7.75 && t < 8.7) for (let k = 0; k < 6; k++) {
          const tw = Math.sin(t * 12 + k * 1.3);
          if (tw > 0) P.star(ctx, S.cx + (k - 2.5) * 110, S.cy - 40 + Math.cos(k) * 60, 18 * tw, '#fff', { shadow: false, points: 4, inner: 0.3 });
        }
      }

      /* ---------- caption stickers ---------- */
      if (t < 5.6) P.sticker(ctx, 'latent space slime asmr 🎧', 70, 1520, { pop: ease.outBack(prog(t, 0.1, 0.4)) * (1 - prog(t, 5.45, 0.15)) });
      else if (t < 9.3) P.sticker(ctx, 'adding token activator ✨', 70, 1520, { pop: ease.outBack(prog(t, 5.6, 0.35)) * (1 - prog(t, 9.15, 0.15)), rot: 0.02 });
      else P.sticker(ctx, 'latent space slime asmr 🎧', 70, 1520, { pop: ease.outBack(prog(t, 9.3, 0.4)) });
      if (t > 2.55 && t < SNAP) P.text(ctx, 'the stretch… 🫠', 540, 1330, { size: 50, font: 'hand', color: C.purple, shadow: false, scale: ease.outBack(prog(t, 2.55, 0.3)) });

      /* ---------- sound ---------- */
      POKES.forEach(([s], k) => { const at = k === 0 ? 0.05 : s + 0.05; if (env.at(at)) squelch(0.9, 0.28); });
      if (env.at(1.8)) { SFX.noise(0.95, { filter: 'bandpass', freq: 300, slide: 1400, q: 10, vol: 0.09 }); SFX.tone(140, 0.9, { type: 'triangle', slide: 260, vol: 0.04 }); }
      WORDS.forEach(([, , , s0], k) => { if (env.at(s0)) SFX.pop({ f: 620 + k * 140, vol: 0.12 }); });
      if (env.at(SNAP)) { SFX.boing({ vol: 0.12 }); squelch(1, 0.35); SFX.swoosh({ vol: 0.08 }); }
      if (env.at(4.1)) squelch(0.8, 0.5);
      if (env.at(4.55)) SFX.noise(0.3, { filter: 'lowpass', freq: 700, q: 5, vol: 0.1 });
      EQ.forEach(([, , s0], k) => { if (env.at(s0)) { SFX.pop({ f: 900 + k * 120, vol: 0.14 }); SFX.tick({ vol: 0.2 }); } });
      if (env.at(5.6)) SFX.noise(0.4, { filter: 'highpass', freq: 3500, vol: 0.06 });
      BEADS.forEach(b => { if (env.at(b.t0 + 0.3)) SFX.tick({ vol: 0.25 }); });
      CRUNCH.forEach(([ct]) => { if (env.at(ct)) crunch(1); });
      if (env.at(7.55)) { SFX.noise(0.9, { filter: 'lowpass', freq: 900, slide: 160, q: 6, vol: 0.22 }); SFX.tone(110, 0.8, { type: 'sine', slide: 60, vol: 0.12 }); crunch(0.5); }
      if (env.at(8.7)) { squelch(1, 0.45); SFX.boing({ vol: 0.08 }); }
      if (env.at(9.3)) SFX.chime({ vol: 0.05 });
    },
  });
})();
