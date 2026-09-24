/* Planet Compute II: the wild subagent. A letterboxed nature documentary.
 * A big Clawd spawns five tiny Clawds, they migrate to task flags, forage
 * for tokens, and come home with report scrolls (one of them far too long). */
(function () {
  const { C, ease, prog, pulse, lerp, clamp, hash } = P;
  const D = 12;
  const TOP = 340, BOT = 1440;           // letterbox bars
  const BIG = { x: 250, y: 1140, r: 118 };
  const SR = 34;                          // subagent radius
  const PAN = 870;                        // how far the camera follows the migration
  const FLAGS = [
    { x: 1150, y: 1235, label: 'grep', col: C.sky },
    { x: 1270, y: 1305, label: 'tests', col: C.mint },
    { x: 1390, y: 1220, label: 'docs', col: C.pink },
    { x: 1505, y: 1295, label: 'lint', col: C.yellow },
    { x: 1625, y: 1245, label: 'refactor', col: '#c9b6ff' },
  ];
  const NARR = [
    [0.15, 2.4, 'here we observe the wild agent, in its natural habitat.'],
    [2.4, 3.9, 'faced with a large task... it spawns its young.'],
    [3.9, 6.0, 'the great migration. each carries only a sliver of context.'],
    [6.0, 7.4, 'far from the parent, they forage for tokens.'],
    [7.4, 9.6, 'and return, bearing reports.'],
    [9.6, 12, 'the parent will skim them. truly... majestic.'],
  ];

  const spawnT = i => 2.5 + i * 0.2;
  const outT = i => 3.8 + i * 0.12;
  const backT = i => (i === 4 ? 7.6 : 7.4 + i * 0.1);
  const backDur = i => (i === 4 ? 2.1 : 1.9);
  const mergeT = i => 9.55 + i * 0.12;
  const checkT = i => 6.5 + i * 0.15;
  const scrollT = i => 7.05 + i * 0.06;
  const stage = i => ({ x: 420 + i * 72, y: 1300 + (i % 2) * 26 });
  const home = i => ({ x: BIG.x + 120 + i * 56, y: 1290 + (i % 2) * 22 });

  function camera(t) {
    return PAN * ease.inOutCubic(prog(t, 3.8, 2.0)) * (1 - ease.inOutCubic(prog(t, 7.5, 1.9)));
  }

  /** Where subagent i is at time t (world coords), or null if not on screen. */
  function sub(i, t) {
    const s0 = spawnT(i);
    if (t < s0) return null;
    const st = stage(i), f = FLAGS[i], h = home(i);
    const fx = f.x - 52, fy = f.y - SR * 0.9;
    let x, y, scale = 1, rot = 0, mood = 'happy', moving = false, ground = null;
    const q = prog(t, outT(i), 2.0), r = prog(t, backT(i), backDur(i));
    if (t < s0 + 0.45) {
      const p = prog(t, s0, 0.45);
      x = lerp(BIG.x + 30, st.x, p);
      y = lerp(BIG.y - 20, st.y - SR * 0.9, p) - Math.sin(p * Math.PI) * 230;
      scale = ease.outBack(prog(t, s0, 0.3));
      rot = p * Math.PI * 2;
      mood = 'wow';
    } else if (t < outT(i)) {
      x = st.x; y = st.y - SR * 0.9 - Math.abs(Math.sin(t * 7 + i)) * 10; ground = st.y;
    } else if (q < 1) {
      const e = ease.inOutSine(q);
      x = lerp(st.x, fx, e); ground = lerp(st.y, f.y, e); y = ground - SR * 0.9 - Math.abs(Math.sin(q * Math.PI * 8)) * 26;
      moving = true;
    } else if (t < backT(i)) {
      x = fx + Math.sin(t * 38 + i) * 3; y = fy - Math.abs(Math.sin(t * 16 + i * 2)) * 6; ground = f.y;
      mood = 'side';
    } else if (r < 1) {
      const e = ease.inOutSine(r);
      const hops = i === 4 ? 6 : 8;
      x = lerp(fx, h.x, e); ground = lerp(f.y, h.y, e); y = ground - SR * 0.9 - Math.abs(Math.sin(r * Math.PI * hops)) * (i === 4 ? 12 : 24);
      mood = i === 4 ? 'sleepy' : 'happy';
      moving = true;
    } else {
      const m = prog(t, mergeT(i), 0.3);
      if (m >= 1) return null;
      const e = ease.inCubic(m);
      x = lerp(h.x, BIG.x, e); y = lerp(h.y - SR * 0.9, BIG.y, e) - Math.sin(m * Math.PI) * 60;
      scale = 1 - e;
      mood = i === 4 ? 'sleepy' : 'happy';
    }
    return { x, y, scale, rot, mood, moving, ground, carrying: t >= scrollT(i) };
  }

  /** Little rolled scroll. */
  function scroll(ctx, x, y, s, rot = 0) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.rect(ctx, -26, -12, 52, 24, C.paper, { radius: 6, seed: 3, amp: 1.5, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    P.rect(ctx, -32, -15, 10, 30, C.wood, { radius: 5, seed: 4, amp: 1, shadow: false });
    P.rect(ctx, 22, -15, 10, 30, C.wood, { radius: 5, seed: 5, amp: 1, shadow: false });
    ctx.fillStyle = 'rgba(43,34,51,0.35)';
    ctx.fillRect(-16, -5, 30, 3); ctx.fillRect(-16, 2, 22, 3);
    ctx.restore();
  }

  /** The very long report, trailing from (x, y) along the ground behind. */
  function longReport(ctx, x, y, ground, len, alpha = 1) {
    if (len <= 4) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 8);
    ctx.lineTo(x + 26, y - 8);
    ctx.lineTo(x + 70, ground - 26);
    ctx.lineTo(x + 70 + len, ground - 26);
    ctx.lineTo(x + 70 + len, ground);
    ctx.lineTo(x + 50, ground);
    ctx.lineTo(x + 4, y + 10);
    ctx.closePath();
    P.cut(ctx, C.paper, { shadow: { blur: 6, dy: 4, alpha: 0.22 } });
    ctx.fillStyle = 'rgba(43,34,51,0.28)';
    for (let k = 0; k * 34 < len - 30; k++) ctx.fillRect(x + 84 + k * 34, ground - 17 + (k % 2) * 6, 22 - (k % 3) * 5, 3);
    if (len > 260) P.text(ctx, 'report_FINAL_v3.md', x + 80 + len * 0.5, ground - 34, { size: 22, font: 'mono', color: C.ink, shadow: false, weight: 600 });
    P.rect(ctx, x + 60 + len, ground - 32, 22, 36, C.wood, { radius: 8, seed: 6, amp: 1, shadow: false });
    ctx.restore();
  }

  function flag(ctx, f, i, t) {
    const top = f.y - 190;
    P.rect(ctx, f.x - 5, top, 10, 195, C.brown, { radius: 4, seed: 30 + i, amp: 1 });
    ctx.beginPath();
    const n = 6;
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      ctx.lineTo(f.x + 5 + u * 120, top + 6 + u * 34 + Math.sin(t * 4 + u * 3 + i) * 7 * u);
    }
    for (let k = n; k >= 0; k--) {
      const u = k / n;
      ctx.lineTo(f.x + 5 + u * 120, top + 76 - u * 34 + Math.sin(t * 4 + u * 3 + i) * 7 * u);
    }
    ctx.closePath();
    P.cut(ctx, f.col, { shadow: { blur: 5, dy: 4, alpha: 0.22 } });
    P.text(ctx, f.label, f.x + 50, top + 42, { size: f.label.length > 5 ? 20 : 26, font: 'mono', color: C.ink, shadow: false, weight: 700 });
    const c = ease.outBack(prog(t, checkT(i), 0.35));
    if (c > 0 && t < 9.3) {
      ctx.save(); ctx.translate(f.x + 128, top + 10); ctx.scale(c, c);
      P.check(ctx, 0, 0, 24, prog(t, checkT(i) + 0.1, 0.25));
      ctx.restore();
    }
  }

  function acacia(ctx, x, y, s) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.strokeStyle = '#5E4128'; ctx.lineWidth = 16 * s;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 6 * s, y - 120 * s);
    ctx.lineTo(x - 60 * s, y - 190 * s);
    ctx.moveTo(x + 6 * s, y - 120 * s); ctx.lineTo(x + 70 * s, y - 185 * s);
    ctx.moveTo(x + 4 * s, y - 100 * s); ctx.lineTo(x + 10 * s, y - 200 * s);
    ctx.stroke();
    ctx.restore();
    P.circle(ctx, x - 70 * s, y - 205 * s, 90 * s, '#6E7B38', { ry: 26 * s, seed: 11, amp: 4 });
    P.circle(ctx, x + 60 * s, y - 210 * s, 100 * s, '#768441', { ry: 30 * s, seed: 12, amp: 4 });
    P.circle(ctx, x, y - 226 * s, 120 * s, '#7F8D47', { ry: 30 * s, seed: 13, amp: 4 });
  }

  function hillPath(ctx, x0, x1, base, a1, f1, a2, f2, ph) {
    ctx.beginPath();
    ctx.moveTo(x0, BOT + 20);
    for (let x = x0; x <= x1; x += 30) ctx.lineTo(x, base + Math.sin(x * f1 + ph) * a1 + Math.sin(x * f2 + ph * 2) * a2);
    ctx.lineTo(x1, BOT + 20);
    ctx.closePath();
  }

  function vbird(ctx, x, y, s, t, k) {
    const flap = Math.sin(t * 9 + k * 2) * 10 * s;
    ctx.save();
    ctx.strokeStyle = 'rgba(60,40,50,0.65)'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 22 * s, y - flap); ctx.quadraticCurveTo(x - 10 * s, y - 4 * s, x, y + 4 * s);
    ctx.quadraticCurveTo(x + 10 * s, y - 4 * s, x + 22 * s, y - flap);
    ctx.stroke();
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@planet.compute',
    caption: 'the great subagent migration 🌾 narrated by david attentionborough #naturedoc #subagents #planetcompute',
    sound: 'savanna pad (ambient) · planet.compute',
    avatar: '🌍',
    avatarColor: '#6E7B38',
    duration: D,
    bg: '#0d0b10',
    thumb: 5.2,
    likes: '3.8M', commentCount: '61.2K', saves: '802K', shares: '211K',
    comments: [
      '@orchestrator.prime: the parent skimming the reports is too real. i read the first line and said "great work"',
      ['subagent.07', 'i went all that way and returned 40k tokens of grep output. the circle of life'],
      '@context.window: the long scroll kid is me. nobody asked for the appendix',
    ],

    bpm: 60,
    subdiv: 2,
    onBeat(step) {
      // soft savanna pad, one chord every 2s
      const pads = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'A4']];
      if (step % 4 === 0) {
        const ch = pads[(step / 4) % pads.length];
        SFX.chord(ch, 2.6, { type: 'sine', vol: 0.035, attack: 0.7 });
        SFX.tone(ch[0].replace(/\d/, d => d - 1), 2.4, { type: 'triangle', vol: 0.05, attack: 0.5 });
      }
      // birds
      if (P.hash(step * 3.17) > 0.55) {
        const f = 2300 + P.hash(step * 7.3) * 1400, pan = P.hash(step) * 1.6 - 0.8;
        SFX.tone(f, 0.07, { slide: f * 1.35, vol: 0.05, pan });
        SFX.tone(f * 1.1, 0.06, { slide: f * 1.5, vol: 0.04, pan, when: 0.1 });
        if (P.hash(step * 1.9) > 0.6) SFX.tone(f * 0.9, 0.12, { slide: f * 0.7, vol: 0.035, pan, when: 0.22 });
      }
    },

    draw(ctx, t, env) {
      const cam = camera(t);

      /* ---------------- the savanna ---------------- */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, TOP, 1080, BOT - TOP); ctx.clip();
      // slow ken-burns breathing zoom
      P.zoom(ctx, 1.035 + 0.015 * Math.sin((t / D) * Math.PI * 2), 540, 900);

      const sky = ctx.createLinearGradient(0, TOP, 0, 1200);
      sky.addColorStop(0, '#F3A76B'); sky.addColorStop(0.55, '#F8D08A'); sky.addColorStop(1, '#FCE9B8');
      ctx.fillStyle = sky; ctx.fillRect(-100, TOP - 100, 1300, BOT - TOP + 200);

      // sun + halo
      const sx = 760 - cam * 0.06;
      ctx.save();
      const halo = ctx.createRadialGradient(sx, 850, 60, sx, 850, 460);
      halo.addColorStop(0, 'rgba(255,248,210,0.8)'); halo.addColorStop(1, 'rgba(255,248,210,0)');
      ctx.fillStyle = halo; ctx.fillRect(-100, TOP - 100, 1300, 1100);
      ctx.restore();
      P.circle(ctx, sx, 860, 165, '#FFF1C2', { seed: 2, shadow: { blur: 30, dy: 0, alpha: 0.15 } });

      // paper clouds drifting
      P.cloud(ctx, 200 - cam * 0.1 + t * 6, 520, 0.9, 'rgba(255,250,240,0.85)');
      P.cloud(ctx, 980 - cam * 0.1 + t * 4, 460, 0.6, 'rgba(255,250,240,0.8)');

      // flock of birds (screen space)
      for (let k = 0; k < 3; k++) {
        const bx = lerp(-120, 1200, prog(t, k * 0.25, 6)) + k * 50, by = 560 + k * 30 + Math.sin(t * 2 + k) * 10;
        vbird(ctx, bx, by, 1 - k * 0.15, t, k);
        const bx2 = lerp(1250, -150, prog(t, 7 + k * 0.2, 5)) - k * 45, by2 = 470 + k * 26;
        vbird(ctx, bx2, by2, 0.7, t, k + 5);
      }

      // far hills (parallax 0.25)
      ctx.save(); ctx.translate(-cam * 0.25, 0);
      hillPath(ctx, -200, 2000, 1040, 34, 0.0045, 16, 0.012, 1);
      P.cut(ctx, '#E2A06C', { rim: false, shadow: { blur: 10, dy: -3, alpha: 0.12 } });
      ctx.restore();
      // mid hills + acacias (parallax 0.55)
      ctx.save(); ctx.translate(-cam * 0.55, 0);
      hillPath(ctx, -200, 2400, 1100, 22, 0.006, 10, 0.017, 4);
      P.cut(ctx, '#D8A955', { rim: false, shadow: { blur: 10, dy: -3, alpha: 0.15 } });
      acacia(ctx, 640, 1110, 0.8);
      acacia(ctx, 1480, 1100, 1.05);
      acacia(ctx, 2050, 1105, 0.7);
      // a giraffe-shaped GPU rack in the distance, obviously
      P.rect(ctx, 1080, 960, 36, 140, '#B7864A', { radius: 6, seed: 40, shadow: false });
      P.rect(ctx, 1070, 930, 56, 40, '#B7864A', { radius: 10, seed: 41, shadow: false });
      for (let k = 0; k < 4; k++) P.dot(ctx, 1098, 990 + k * 26, 5, P.boil(t, 3) % 4 === k ? '#9CF09C' : '#8A6034');
      ctx.restore();

      // ground (parallax 1)
      ctx.save(); ctx.translate(-cam, 0);
      hillPath(ctx, -300, 2600, 1170, 10, 0.004, 6, 0.02, 2);
      P.cut(ctx, '#DDB552', { rim: false, shadow: { blur: 14, dy: -4, alpha: 0.18 } });
      // grass tufts
      for (let k = 0; k < 34; k++) {
        const gx = -200 + k * 85 + hash(k) * 40, gy = 1195 + hash(k + 50) * 200;
        const col = hash(k + 9) > 0.5 ? '#B8902F' : '#E8C868';
        const sway = Math.sin(t * 1.6 + k) * 5;
        P.poly(ctx, [[gx - 20, gy], [gx - 8 + sway, gy - 44], [gx, gy], [gx + 6 + sway, gy - 58], [gx + 14, gy], [gx + 22 + sway, gy - 38], [gx + 28, gy]], col, { seed: k, amp: 1.5, shadow: { blur: 4, dy: 3, alpha: 0.18 } });
      }
      // the parent's rock
      P.circle(ctx, BIG.x + 10, 1262, 170, '#A0907F', { ry: 58, seed: 21 });
      P.circle(ctx, BIG.x - 30, 1245, 90, '#B3A493', { ry: 22, seed: 22, shadow: false });

      // flags
      FLAGS.forEach((f, i) => flag(ctx, f, i, t));

      // big Clawd, the parent
      const puff = pulse(t, 2.15, 0.35);
      const gulp = [0, 1, 2, 3, 4].reduce((a, i) => a + pulse(t, mergeT(i) + 0.25, 0.2), 0);
      const kick = [0, 1, 2, 3, 4].reduce((a, i) => a + pulse(t, spawnT(i), 0.15), 0);
      const reading = env.between(10.05, 11.7);
      const bigMood = t < 2.1 ? (t > 1.2 && t < 1.5 ? 'sleepy' : 'side')
        : t < 2.5 ? 'wow' : t < 3.6 ? 'happy' : t < 9.5 ? 'side' : reading ? 'side' : 'happy';
      const breathe = Math.sin(t * 1.6) * 0.04;
      P.claude(ctx, BIG.x, BIG.y - puff * 30, BIG.r * (1 + puff * 0.15), {
        t, mood: bigMood, squash: breathe - puff * 0.3 + kick * 0.25 + gulp * 0.3, blink: pulse(t, 0.9, 0.2) + pulse(t, 8.4, 0.2),
      });
      if (reading) {
        // reading glasses
        const g = ease.outBack(prog(t, 10.05, 0.3)) * (1 - prog(t, 11.5, 0.2));
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.globalAlpha = clamp(g);
        ctx.beginPath(); ctx.arc(BIG.x - 19, BIG.y - 2, 17, 0, Math.PI * 2); ctx.moveTo(BIG.x + 36, BIG.y - 2); ctx.arc(BIG.x + 19, BIG.y - 2, 17, 0, Math.PI * 2);
        ctx.moveTo(BIG.x - 2, BIG.y - 4); ctx.lineTo(BIG.x + 2, BIG.y - 4); ctx.stroke(); ctx.restore();
      }

      // pile of reports at the parent's feet (fades before the loop)
      const pileFade = 1 - prog(t, 11.3, 0.5);
      let merged = 0;
      for (let i = 0; i < 4; i++) if (t >= mergeT(i) + 0.3) merged++;
      if (pileFade > 0) {
        ctx.save(); ctx.globalAlpha = pileFade;
        for (let k = 0; k < merged; k++) scroll(ctx, BIG.x + 110 + (k % 2) * 30, 1250 - k * 22, 1, (k % 2 ? 0.12 : -0.08));
        ctx.restore();
      }
      // the parent holds the long one up to "read"
      if (t >= mergeT(4) + 0.3 && pileFade > 0) {
        longReport(ctx, BIG.x - 20, BIG.y + 60, 1300, 330 * ease.outCubic(prog(t, mergeT(4) + 0.3, 0.4)), pileFade);
      }

      // subagents (+ trail of the long report)
      for (let i = 0; i < 5; i++) {
        const s = sub(i, t);
        if (!s) continue;
        if (i === 4 && s.carrying && t > backT(4) && t < mergeT(4)) {
          longReport(ctx, s.x, s.y - 28, (s.ground ?? home(4).y) + 8, clamp((t - scrollT(4)) * 260, 0, 440));
        }
        // shadow blob
        if (s.ground !== null) {
          ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = C.black;
          ctx.beginPath(); ctx.ellipse(s.x, s.ground + 2, SR * 0.8, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        if (s.scale > 0.02) P.claude(ctx, s.x, s.y, SR * s.scale, { t: t + i, mood: s.mood, rot: s.rot, seed: 60 + i, squash: s.moving ? Math.sin(t * 20 + i) * 0.12 : 0 });
        if (s.carrying && i !== 4 && s.scale > 0.3) scroll(ctx, s.x, s.y - 46 * s.scale, s.scale * 0.9, Math.sin(t * 6 + i) * 0.15);
        // foraging: tokens rise from the ground into the subagent
        if (t > 6.0 && t < backT(i) + 0.2) {
          for (let k = 0; k < 3; k++) {
            const lt = prog(t, 6.1 + k * 0.38 + i * 0.05, 0.45);
            if (lt <= 0 || lt >= 1) continue;
            const tx = lerp(FLAGS[i].x - 5, s.x, lt), ty = lerp(FLAGS[i].y + 4, s.y, lt) - Math.sin(lt * Math.PI) * 70;
            P.circle(ctx, tx, ty, 11, C.yellow, { seed: k, amp: 1, shadow: { blur: 3, dy: 2, alpha: 0.2 } });
            P.text(ctx, 'T', tx, ty + 1, { size: 14, font: 'bubble', color: C.mustard, shadow: false });
          }
        }
      }
      // spawn sparkles
      for (let i = 0; i < 5; i++) P.burstLines(ctx, BIG.x + 40, BIG.y - 40, 50, prog(t, spawnT(i), 0.35), C.paper, 7, 6);
      ctx.restore();

      // foreground tall grass (parallax 1.3), telephoto framing
      ctx.save(); ctx.translate(-cam * 1.3, 0);
      for (let k = 0; k < 40; k++) {
        const gx = -200 + k * 70 + hash(k + 3) * 30;
        const hgt = 110 + hash(k + 7) * 120, sway = Math.sin(t * 1.3 + k * 0.7) * 14;
        P.poly(ctx, [[gx - 14, BOT + 10], [gx + sway, BOT - hgt], [gx + 14, BOT + 10]], hash(k) > 0.5 ? '#8F7328' : '#A7862F', { seed: k + 70, amp: 1.5, shadow: { blur: 6, dy: -2, alpha: 0.2 } });
      }
      ctx.restore();

      // parent's "tl;dr" bubble
      if (t > 10.2 && t < 11.6) {
        const b = ease.outBack(prog(t, 10.2, 0.3)) * (1 - ease.inCubic(prog(t, 11.35, 0.25)));
        P.bubble(ctx, "tl;dr: it's fine 👍", 470, 900, BIG.x + 60, BIG.y - 90, { size: 48, pop: b, seed: 4 });
      }
      ctx.restore(); // end scene clip

      /* ---------------- overlay: watermark, sticker ---------------- */
      P.text(ctx, 'PLANET COMPUTE II', 70, 390, { size: 30, font: 'sans', align: 'left', color: 'rgba(255,255,255,0.75)', weight: 800, letter: 6, shadow: false });
      P.text(ctx, 'EP. 4 · "THE SUBAGENT"', 72, 428, { size: 22, font: 'sans', align: 'left', color: 'rgba(255,255,255,0.6)', weight: 700, letter: 3, shadow: false });
      const stk = ease.outBack(prog(t, 0.4, 0.4)) * (1 - ease.inCubic(prog(t, 3.0, 0.3)));
      if (stk > 0) P.sticker(ctx, 'narrated by david attentionborough', 60, 510, { size: 40, pop: stk, rot: -0.03 });
      if (t > 3.3 && t < 5.6) {
        const k = ease.outBack(prog(t, 3.35, 0.35)) * (1 - prog(t, 5.3, 0.3));
        P.title(ctx, 'SPAWN ×5', 760, 560, { size: 84, color: C.claude, rot: 0.08, pop: k });
      }

      /* ---------------- letterbox + narration ---------------- */
      ctx.fillStyle = '#0d0b10';
      ctx.fillRect(0, 0, 1080, TOP); ctx.fillRect(0, BOT, 1080, 1920 - BOT);
      const cur = NARR.find(([a, b]) => t >= a && t < b);
      if (cur) {
        const [a, b, str] = cur;
        const shown = P.typed(str, prog(t, a + 0.05, str.length * 0.032));
        const fade = clamp((b - t) / 0.25);
        const cursor = shown.length < str.length && Math.floor(t * 6) % 2 ? '▍' : '';
        ctx.save(); ctx.globalAlpha = fade;
        P.text(ctx, shown + cursor, 540, 1522, { size: 42, font: 'sans', weight: 'italic 600', color: '#F3E9D2', maxWidth: 980, shadow: false });
        ctx.restore();
      }
      // letterbox film grain specks
      for (let k = 0; k < 6; k++) {
        const h = hash(P.boil(t, 12) * 13 + k);
        P.dot(ctx, h * 1080, (k % 2 ? 60 + hash(k + P.boil(t, 12)) * 260 : BOT + 10 + hash(k * 3 + P.boil(t, 12)) * 60), 1.5 + h * 1.5, 'rgba(255,255,255,0.18)');
      }

      /* ---------------- sounds ---------------- */
      if (env.at(2.15)) SFX.tone(220, 0.4, { slide: 330, type: 'triangle', vol: 0.12 });
      for (let i = 0; i < 5; i++) {
        if (env.at(spawnT(i))) SFX.pop({ f: 640 + i * 90, vol: 0.14 });
        if (env.at(checkT(i))) SFX.ding(['C6', 'D6', 'E6', 'G6', 'A6'][i], { vol: 0.07 });
        if (env.at(mergeT(i) + 0.25)) SFX.pop({ f: 500 - i * 40, vol: 0.12 });
      }
      if (env.at(3.8)) SFX.whoosh({ vol: 0.08, dur: 1.2, freq: 200, slide: 900 });
      if (env.at(7.5)) SFX.whoosh({ vol: 0.08, dur: 1.2, freq: 900, slide: 200 });
      if (env.at(7.05)) SFX.noise(0.35, { filter: 'bandpass', freq: 2500, q: 0.7, vol: 0.06 });
      if (env.at(10.2)) SFX.blip(660, { vol: 0.06 });
      if (env.at(10.3)) SFX.blip(880, { vol: 0.05 });
    },
  });
})();
