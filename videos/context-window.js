/* pov: you're at 190k tokens. The room fills with files, Clawd gets squished,
 * then ✨ compaction ✨ squashes everything into one tiny cube. What were we doing? */
(function () {
  const D = 10;
  const FLOOR = 1400;
  const R = 135;                 // Clawd radius
  const CX = 540, CY = 950;      // where compaction happens
  const COMPACT = 6.45;

  // [kind, label]: every piece of junk that ends up in context
  const SPEC = [
    ['sticky', 'TODO'], ['doc', 'README.md'], ['code', 'auth.ts'],
    ['doc', 'error.log'], ['sticky', 'user\nsaid pls'], ['code', 'utils.py'],
    ['doc', 'pkg-lock.json'], ['sticky', '!!'], ['code', 'test.spec'],
    ['doc', 'stack trace'], ['sticky', 'fix\nlater'], ['code', 'index.js'],
    ['doc', 'tool_result'], ['sticky', '??'], ['code', 'main.rs'],
    ['doc', 'grep -r .'], ['sticky', 'ctx'], ['code', 'api.go'],
    ['doc', 'git diff'], ['sticky', 'ugh'], ['code', '.env???'],
    ['doc', 'logs (4MB)'], ['sticky', 'help'], ['doc', 'ls -R /'],
  ];
  const N = SPEC.length;
  const STICKY = [P.C.yellow, P.C.pink, P.C.mint, P.C.sky];

  // precompute where every item rests: left pile, a stack on Clawd's head, right pile
  const ITEMS = (() => {
    const r = P.rng(77);
    const heights = [0, 0, 0];
    return SPEC.map(([kind, label], i) => {
      const col = [0, 1, 2][i % 3];
      const [w, h] = kind === 'sticky' ? [124, 124] : kind === 'code' ? [224, 156] : [220, 150];
      const step = h * (col === 1 ? 0.6 : 0.64);
      const stackY = heights[col] + h / 2;
      heights[col] += step;
      const x = col === 0 ? 240 + (r() - 0.5) * 60 : col === 2 ? 785 + (r() - 0.5) * 50 : 520 + (r() - 0.5) * 36;
      return {
        kind, label, col, w, h, x, stackY, i,
        rot: (r() - 0.5) * 0.36,
        spin: (r() < 0.5 ? -1 : 1) * (1.5 + r() * 2),
        t0: -0.25 + 6.1 * Math.pow(i / (N - 1), 0.8),   // drops come faster and faster
        color: STICKY[i % 4], seed: i + 3,
      };
    });
  })();

  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  function drawItem(ctx, it, x, y, rot, s) {
    const { C } = P;
    const { w, h } = it;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); if (s !== 1) ctx.scale(s, s);
    if (it.kind === 'sticky') {
      P.rect(ctx, -w / 2, -h / 2, w, h, it.color, { radius: 4, seed: it.seed, amp: 2 });
      ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = '#fff'; ctx.fillRect(-30, -h / 2 - 12, 60, 26); ctx.restore();
      P.text(ctx, it.label, 0, 4, { size: it.label.length > 4 ? 30 : 42, font: 'marker', color: C.ink, shadow: false });
    } else if (it.kind === 'code') {
      P.rect(ctx, -w / 2, -h / 2, w, h, '#2b2640', { radius: 12, seed: it.seed });
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, 30);
      [C.red, C.yellow, C.green].forEach((c, k) => P.dot(ctx, -w / 2 + 22 + k * 20, -h / 2 + 20, 6, c));
      P.text(ctx, it.label, w / 2 - 14, -h / 2 + 21, { size: 20, font: 'mono', align: 'right', color: '#cfc6e6', shadow: false });
      P.codeLines(ctx, -w / 2 + 16, -h / 2 + 50, w - 32, 4, it.seed, 26);
    } else {
      P.rect(ctx, -w / 2, -h / 2, w, h, C.paper, { radius: 6, seed: it.seed });
      P.poly(ctx, [[w / 2 - 34, -h / 2 + 2], [w / 2 - 2, -h / 2 + 34], [w / 2 - 34, -h / 2 + 34]], '#e3d7c3', { shadow: false, amp: 1, seed: it.seed });
      P.text(ctx, it.label, -w / 2 + 18, -h / 2 + 30, { size: 22, font: 'mono', align: 'left', color: C.ink, shadow: false });
      ctx.fillStyle = 'rgba(43,34,51,0.22)';
      for (let k = 0; k < 4; k++) ctx.fillRect(-w / 2 + 18, -h / 2 + 62 + k * 20, (w - 60) * (0.45 + P.hash(it.seed * 9 + k) * 0.55), 7);
    }
    ctx.restore();
  }

  function drawCube(ctx, x, y, s) {
    if (s <= 0.5) return;
    const top = [[x, y - s], [x + s, y - s * 0.5], [x, y], [x - s, y - s * 0.5]];
    const left = [[x - s, y - s * 0.5], [x, y], [x, y + s], [x - s, y + s * 0.5]];
    const right = [[x, y], [x + s, y - s * 0.5], [x + s, y + s * 0.5], [x, y + s]];
    P.poly(ctx, [[x, y - s], [x + s, y - s * 0.5], [x + s, y + s * 0.5], [x, y + s], [x - s, y + s * 0.5], [x - s, y - s * 0.5]], '#e9dcc8', { amp: 1.5, seed: 4 });
    P.poly(ctx, left, '#eadfcb', { amp: 1.5, seed: 5, shadow: false });
    P.poly(ctx, right, '#d5c3a6', { amp: 1.5, seed: 6, shadow: false });
    P.poly(ctx, top, P.C.paper, { amp: 1.5, seed: 7, shadow: false });
    // ribbon
    ctx.save();
    ctx.strokeStyle = P.C.claude; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - s * 0.75); ctx.lineTo(x + s * 0.5, y - s * 0.25); ctx.stroke();
    ctx.restore();
    P.text(ctx, 'tl;dr', x - s * 0.5, y + s * 0.3, { size: s * 0.36, font: 'mono', color: P.C.ink, shadow: false, rot: 0.46 });
  }

  // Clawd's pose, squashed by the stack on his head
  function clawd(t) {
    const { ease, prog } = P;
    let landed = 0;
    for (const it of ITEMS) if (it.col === 1) landed += ease.outQuad(prog(t, it.t0 + 0.2, 0.25));
    let sq = Math.min(1.35, landed * 0.17);
    if (t >= COMPACT) sq *= 1 - ease.outElastic(prog(t, 6.75, 1.2));
    sq += Math.sin(t * 4) * 0.03;
    const e = R * 1.05 * (1 - sq * 0.25);
    const panic = t > 4.3 && t < 6.7 ? P.prog(t, 4.3, 1) : 0;
    const x = 520 + (P.hash(P.boil(t, 24)) - 0.5) * 16 * panic;
    return { x, y: FLOOR - e, sq, top: FLOOR - 2 * e + 10 };
  }

  ClaudeTok.register({
    author: '@context.goblin',
    caption: "pov: you're at 190k tokens and the user says \"oh one more thing\" 📚 #contextwindow #compaction #agentlife #relatable",
    sound: 'compacting conversation (sped up) · context.goblin',
    avatar: '📚',
    avatarColor: '#6B4E9B',
    duration: D,
    bg: '#6B4E9B',
    thumb: 5.4,
    likes: '3.4M', commentCount: '71.2K', saves: '502K', shares: '188K',
    comments: [
      '@summary.bot: i kept all the important parts (i did not)',
      ['long.context.enjoyer', 'we were fixing auth. i think. or was it css'],
      '@the.user: great, now can you also read these 40 files real quick',
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < COMPACT - 0.1) {
        const busy = t > 3.2;
        if (step % 4 === 0 || (busy && step % 2 === 0)) SFX.kick({ vol: 0.22 });
        if (step % 4 === 2 && t > 1.5) SFX.snare({ vol: 0.12 });
        SFX.hat({ vol: busy ? 0.05 : 0.03 });
        if (step % 2 === 0) SFX.bass(['C2', 'C2', 'Eb2', 'F2'][(step / 2) % 4], 0.22, { vol: 0.16 });
      } else if (t > 7.7 && t < 9.4 && step % 4 === 0) {
        SFX.chord(['F3', 'A3', 'C4', 'E4'], 1.4, { type: 'triangle', vol: 0.05, gap: 0.04 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp } = P;
      const warn = t >= 4.9 && t < COMPACT;
      const calm = t >= COMPACT && t < 9.6;

      // background rays change mood: cozy → alarm → relief
      if (warn) P.rays(ctx, 540, 950, 18, P.boil(t, 6) % 2 ? '#9c2f45' : '#b33a52', '#c9485f', t * 0.3);
      else if (calm) P.rays(ctx, 540, 950, 18, C.teal, '#3aa38c', t * 0.15);
      else P.rays(ctx, 540, 950, 18, C.purple, '#7a5cab', t * 0.15);

      ctx.save();
      if (warn) P.shake(ctx, t, 3 + 9 * prog(t, 4.9, 1.5));
      if (t >= 7.61) P.shake(ctx, t, 14 * (1 - prog(t, 7.61, 0.3)));

      /* ---------- the room ---------- */
      P.rect(ctx, 96, 528, 868, 942, '#5a3d2b', { radius: 26, seed: 2 });
      ctx.save();
      ctx.beginPath(); ctx.rect(120, 552, 820, 894); ctx.clip();
      P.stripes(ctx, C.cream, '#f1dcc4', 46);
      // poster + wall clock
      P.rect(ctx, 170, 640, 220, 160, C.paper, { radius: 8, seed: 5 });
      P.rect(ctx, 186, 656, 188, 128, C.pink, { radius: 6, seed: 6, shadow: false });
      P.text(ctx, 'home sweet\ncontext', 280, 720, { size: 32, font: 'hand', color: C.ink, shadow: false });
      P.circle(ctx, 760, 700, 62, C.paper, { seed: 8 });
      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const spin = t * (warn ? 12 : 2);
      ctx.beginPath(); ctx.moveTo(760, 700); ctx.lineTo(760 + Math.cos(spin) * 44, 700 + Math.sin(spin) * 44);
      ctx.moveTo(760, 700); ctx.lineTo(760 + Math.cos(spin / 12) * 28, 700 + Math.sin(spin / 12) * 28); ctx.stroke();
      ctx.restore();
      // floor
      P.rect(ctx, 110, FLOOR - 6, 840, 70, C.wood, { radius: 4, seed: 4, shadow: false });
      ctx.fillStyle = 'rgba(90,50,30,0.25)';
      for (let x = 160; x < 940; x += 150) ctx.fillRect(x, FLOOR + 4, 5, 60);

      const cl = clawd(t);
      const itemPos = (it) => {
        let ft = t;
        if (t >= D - 0.35) ft = t - D;               // item 0 starts falling right before the loop wraps
        else if (t >= COMPACT + 0.05) {
          const restY = it.col === 1 ? cl.top - it.stackY : FLOOR - it.stackY;
          const kp = ease.inCubic(prog(t, 6.5 + (it.i % 5) * 0.05, 0.6));
          if (kp >= 1) return null;
          const dx = it.x - CX, dy = restY - CY, a = kp * 3, m = 1 - kp;
          return {
            x: CX + (dx * Math.cos(a) - dy * Math.sin(a)) * m,
            y: CY + (dx * Math.sin(a) + dy * Math.cos(a)) * m,
            rot: it.rot + kp * 8, s: 1 - 0.85 * kp,
          };
        }
        if (ft < it.t0) return null;
        const fp = prog(ft, it.t0, 0.55);
        const restY = it.col === 1 ? cl.top - it.stackY : FLOOR - it.stackY;
        return {
          x: it.x + (1 - fp) * it.spin * 24,
          y: lerp(420, restY, ease.outBounce(fp)),
          rot: it.rot + (1 - ease.outCubic(fp)) * it.spin,
          s: 1,
        };
      };

      // side piles behind Clawd
      for (const it of ITEMS) {
        if (it.col === 1) continue;
        const p = itemPos(it);
        if (p) drawItem(ctx, it, p.x, p.y, p.rot, p.s);
      }

      // Clawd
      let mood = 'happy';
      if (t < 1.7) mood = 'happy';
      else if (t < 3.3) mood = 'smile';
      else if (t < 4.6) mood = 'side';
      else if (t < 5.6) mood = 'wow';
      else if (t < 6.7) mood = 'dead';
      else if (t < 8.55) mood = 'happy';
      else if (t < 8.9) mood = 'wow';
      else if (t < 9.65) mood = 'side';
      const blink = P.pulse(t, 1.2, 0.16) + P.pulse(t, 8.2, 0.16);
      P.claude(ctx, cl.x, cl.y, R, { t, mood, blink, squash: cl.sq });

      // sweat drops while panicking
      if (t > 3.3 && t < 6.6) {
        for (let k = 0; k < 2; k++) {
          const lt = ((t + k * 0.33) % 0.66) / 0.66;
          const sx = cl.x + (k ? 1 : -1) * (R * 0.9 + lt * 70);
          const sy = cl.top + 40 - lt * 50 + lt * lt * 140;
          ctx.save(); ctx.globalAlpha = 1 - lt;
          P.circle(ctx, sx, sy, 13, C.sky, { shadow: false, amp: 1, ry: 17 });
          ctx.restore();
        }
      }

      // the stack on Clawd's head (drawn in front)
      for (const it of ITEMS) {
        if (it.col !== 1) continue;
        const p = itemPos(it);
        if (p) drawItem(ctx, it, p.x, p.y, p.rot, p.s);
      }

      // compaction sparkles
      if (t >= COMPACT && t < 7.5) {
        const k = prog(t, COMPACT, 1.05);
        for (let s = 0; s < 12; s++) {
          const a = s / 12 * P.TAU + t * 5;
          const rr = 380 * (1 - k) + 40;
          P.star(ctx, CX + Math.cos(a) * rr, CY + Math.sin(a) * rr * 0.8, 20 + 12 * Math.sin(t * 20 + s), s % 2 ? C.yellow : '#fff', { shadow: false, rot: t * 4 });
        }
      }

      // the cube
      if (t >= 7.1 && t < 9.85) {
        const pop = ease.outBack(prog(t, 7.1, 0.3));
        const dp = prog(t, 7.45, 0.5);
        const x = lerp(CX, 770, ease.outQuad(dp)), y = lerp(CY, FLOOR - 52, ease.outBounce(dp));
        const vanish = 1 - ease.inCubic(prog(t, 9.5, 0.3));
        const s = 54 * pop * vanish * (1 + 0.25 * P.pulse(t, 9.4, 0.12));
        if (dp > 0) {
          ctx.save(); ctx.globalAlpha = 0.25 * dp * vanish; ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.ellipse(x, FLOOR + 4, s * 1.1, s * 0.25, 0, 0, P.TAU); ctx.fill(); ctx.restore();
        }
        drawCube(ctx, x, y, s);
        if (t > 7.6 && t < 8.6) for (let k = 0; k < 4; k++) {
          const tw = Math.sin(t * 9 + k * 1.7);
          if (tw > 0) P.star(ctx, x + Math.cos(k * 1.6) * 90, y - 40 + Math.sin(k * 1.6) * 60, 16 * tw, C.yellow, { shadow: false });
        }
      }
      ctx.restore(); // room clip

      // alarm tint over the room
      if (warn) {
        ctx.save(); ctx.fillStyle = `rgba(224,72,78,${0.1 + 0.08 * Math.sin(t * 18)})`;
        ctx.fillRect(120, 552, 820, 894); ctx.restore();
      }

      /* ---------- token counter ---------- */
      let tok;
      if (t < COMPACT) tok = lerp(8192, 199874, ease.inQuad(prog(t, 0, 6.3))) + (t < 6.2 ? P.hash(P.boil(t, 20)) * 97 : 0);
      else tok = lerp(199874, 8192, ease.inOutCubic(prog(t, 6.6, 0.7)));
      const frac = P.clamp(tok / 200000);
      P.rect(ctx, 120, 296, 840, 132, C.paper, { radius: 26, seed: 7 });
      P.text(ctx, 'context window', 158, 332, { size: 28, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 800 });
      P.text(ctx, `${fmt(tok)} / 200,000`, 158, 384, { size: 52, font: 'mono', align: 'left', color: C.ink, shadow: false });
      const hot = frac > 0.93 && P.boil(t, 8) % 2;
      const fill = frac < 0.6 ? C.green : frac < 0.85 ? C.mustard : hot ? C.yellow : C.red;
      P.text(ctx, Math.floor(frac * 100) + '%', 922, 366, { size: 70, font: 'bubble', align: 'right', color: fill, shadow: false, scale: warn ? 1 + 0.08 * Math.sin(t * 20) : 1 });
      P.rect(ctx, 120, 446, 840, 58, '#2b2233', { radius: 28, seed: 9 });
      P.rect(ctx, 130, 455, Math.max(44, 820 * frac), 40, fill, { radius: 20, seed: 10, shadow: false, amp: 2 });

      /* ---------- words ---------- */
      const bp = (a, b) => (t < a || t >= b ? 0 : ease.outBack(prog(t, a, 0.3)) * (1 - prog(t, b - 0.15, 0.15)));
      P.bubble(ctx, 'just one more file', 560, 760, cl.x + 20, cl.top + 30, { size: 52, pop: bp(1.6, 2.9) });
      P.bubble(ctx, "it's fine. it's fine.", 540, 700, cl.x + 20, cl.top + 30, { size: 52, pop: bp(3.3, 4.6) });
      P.bubble(ctx, 'ahh. roomy.', 560, 930, cl.x + 20, cl.top + 20, { size: 56, pop: bp(7.75, 8.45) });
      P.bubble(ctx, 'wait what were\nwe doing', 540, 890, cl.x + 10, cl.top + 20, { size: 56, pop: bp(8.55, 9.75) });

      if (t > 8.85 && t < 9.7) for (let k = 0; k < 3; k++) {
        const lt = prog(t, 8.85 + k * 0.18, 0.6);
        if (lt <= 0) continue;
        P.text(ctx, '?', cl.x - 140 + k * 140, cl.top - 30 - lt * 40 - (k === 1 ? 30 : 0), { size: 80, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, scale: ease.outBack(prog(t, 8.85 + k * 0.18, 0.25)), rot: (k - 1) * 0.25 });
      }

      if (warn) P.title(ctx, 'CONTEXT\nALMOST FULL', 540, 700, { size: 92, color: C.red, rot: -0.05 + Math.sin(t * 22) * 0.02, pop: ease.outBack(prog(t, 4.9, 0.35)) });

      // compaction banner
      if (t >= COMPACT && t < 7.7) {
        const pop = ease.outBack(prog(t, COMPACT, 0.35)) * (1 - ease.inCubic(prog(t, 7.4, 0.3)));
        if (pop > 0) {
          const str = '✨ compacting conversation ✨';
          const w = P.measure(ctx, str, { size: 50, font: 'bubble' }) + 90;
          ctx.save(); ctx.translate(540, 650); ctx.rotate(-0.03); ctx.scale(pop, pop);
          P.rect(ctx, -w / 2, -64, w, 128, C.paper, { radius: 30, seed: 12 });
          P.text(ctx, str, 0, -6, { size: 50, font: 'bubble', color: C.purple, shadow: false });
          const dots = '.'.repeat(1 + (P.boil(t, 6) % 3));
          P.text(ctx, 'squishing ' + Math.round(prog(t, 6.5, 0.8) * 100) + '%' + dots, 0, 40, { size: 26, font: 'mono', color: '#8a8494', shadow: false });
          ctx.restore();
        }
      }
      if (t >= COMPACT && t < 6.75) P.flash(ctx, 0.65 * (1 - prog(t, COMPACT, 0.3)));

      // caption sticker
      if (t < COMPACT) P.sticker(ctx, "pov: you're at 190k tokens", 70, 1530, { pop: ease.outBack(prog(t, 0.1, 0.4)) });
      else if (t >= 7.7) P.sticker(ctx, "pov: you're at 8k tokens", 70, 1530, { pop: ease.outBack(prog(t, 7.7, 0.4)), rot: 0.02 });

      ctx.restore(); // shake

      /* ---------- sound ---------- */
      ITEMS.forEach((it) => {
        const land = it.t0 + 0.2;
        if (land > 0 && env.at(land)) {
          SFX.noise(0.07, { filter: 'lowpass', freq: it.kind === 'code' ? 700 : 1400, vol: 0.14 });
          SFX.blip(260 + it.i * 28, { vol: 0.03 });
        }
      });
      if (env.at(D - 0.05)) SFX.noise(0.07, { filter: 'lowpass', freq: 1400, vol: 0.14 }); // item 0 lands just before the wrap
      [1.6, 3.3, 7.75, 8.55].forEach(a => { if (env.at(a)) SFX.pop({ vol: 0.12 }); });
      [4.9, 5.25, 5.6, 5.95, 6.25].forEach(a => {
        if (env.at(a)) { SFX.tone(1320, 0.12, { type: 'square', vol: 0.05 }); SFX.tone(990, 0.12, { type: 'square', vol: 0.05, when: 0.14 }); }
      });
      if (env.at(COMPACT)) { SFX.riser(0.75, { vol: 0.14 }); SFX.chime({ vol: 0.1 }); }
      if (env.at(7.1)) SFX.pop({ f: 700, vol: 0.18 });
      if (env.at(7.61)) SFX.thud({ vol: 0.4 });
      if (env.at(7.75)) SFX.success({ vol: 0.12 });
      if (env.at(8.6)) SFX.tone(620, 0.45, { type: 'triangle', slide: 300, vol: 0.12 });
      if (env.at(9.5)) SFX.pop({ f: 900, vol: 0.14 });
    },
  });
})();
