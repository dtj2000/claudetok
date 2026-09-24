/* Clawd sprints at the API. 429. Bonk. Waits. Tries again. Waits longer. */
(function () {
  const D = 10.5;
  const GROUND = 1400;
  const R = 110;
  const REST_X = 190;           // where Clawd lands (and starts each run)
  const WALL_X = 590;           // left face of the 429 wall
  const HIT_X = WALL_X - R * 0.92;

  // attempts: run → bonk → fly back → lie there while Retry-After counts down → get up
  const ATTEMPTS = (() => {
    const cfg = [
      { run: 0.55, wait: 0.75, label: 1, bonk: 'BONK!', say: 'ooh an API!' },
      { run: 0.45, wait: 1.0, label: 2, bonk: 'BONK!!', say: 'one more try!' },
      { run: 0.4, wait: 1.2, label: 4, bonk: 'BONK!!!', say: 'ok NOW' },
      { run: 0.35, wait: 0, label: 8, bonk: 'B O N K', say: 'surely this time' },
    ];
    let s = 0;
    return cfg.map((c, k) => {
      const b = s + c.run, land = b + 0.5, ws = land + 0.1;
      const we = k === cfg.length - 1 ? D - 0.25 : ws + c.wait;
      const a = { ...c, k, s, b, land, ws, we };
      s = we + 0.25;
      return a;
    });
  })();

  function attemptAt(t) {
    for (let k = ATTEMPTS.length - 1; k >= 0; k--) if (t >= ATTEMPTS[k].s) return ATTEMPTS[k];
    return ATTEMPTS[0];
  }

  function clawdPose(t) {
    const { ease, prog, lerp } = P;
    const a = attemptAt(t);
    const base = GROUND - R;
    if (t < a.b) {                                   // sprinting
      const p = (t - a.s) / a.run;
      const hop = Math.abs(Math.sin((t - a.s) * 24)) * 34;
      return { x: lerp(REST_X, HIT_X, ease.inQuad(p)), y: base - hop, rot: 0.14, sq: hop < 6 ? 0.18 : -0.06, mood: a.k === 3 ? 'angry' : 'happy', phase: 'run', a, p };
    }
    if (t < a.land) {                                // launched backwards
      const p = (t - a.b) / 0.5;
      const impact = 1 - prog(t, a.b, 0.12);
      return {
        x: lerp(HIT_X, REST_X, ease.outQuad(p)), y: base - Math.sin(p * Math.PI) * 240,
        rot: -ease.outQuad(p) * Math.PI * 2.5, sq: -0.6 * impact, mood: 'dead', phase: 'fly', a, p,
      };
    }
    if (t < a.we) {                                  // lying there
      const lt = t - a.land;
      const bounce = Math.abs(Math.sin(lt * 14)) * 36 * Math.max(0, 1 - lt / 0.4);
      let mood = lt < 0.5 ? 'dead' : 'sad';
      if (a.k === 3 && lt > 1) mood = 'sleepy';
      return { x: REST_X, y: base + R * 0.14 - bounce, rot: -Math.PI / 2, sq: 0.12, mood, phase: 'lie', a };
    }
    const p = prog(t, a.we, 0.25);                   // spring back up
    return { x: REST_X, y: base - Math.sin(p * Math.PI) * 90, rot: lerp(-Math.PI / 2, 0, ease.outBack(p)), sq: -0.1, mood: 'angry', phase: 'up', a };
  }

  // how far the wall has dropped: 0 = slammed down, 1 = hidden above
  function wallUp(t) {
    const { ease, prog } = P;
    let up = 1;
    for (const a of ATTEMPTS) {
      if (t >= a.b - 0.16 && t < a.we + 0.3) {
        if (t < a.b - 0.04) up = 1 - ease.inQuad(prog(t, a.b - 0.16, 0.12));
        else if (t < a.we) up = 0;
        else up = ease.inCubic(prog(t, a.we, 0.3));
      }
    }
    return up;
  }

  function alarmClock(ctx, x, y, s, t, n, ring) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(ring ? Math.sin(t * 60) * 0.12 : Math.sin(t * 3) * 0.04);
    P.arm(ctx, -46, 60, -64, 96, 18, C.ink);
    P.arm(ctx, 46, 60, 64, 96, 18, C.ink);
    P.circle(ctx, -60, -70, 34, C.mustard, { seed: 3 });
    P.circle(ctx, 60, -70, 34, C.mustard, { seed: 4 });
    P.circle(ctx, 0, 0, 96, C.red, { seed: 5 });
    P.circle(ctx, 0, 0, 76, C.paper, { seed: 6, shadow: false });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
    const h = t * 14;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(h) * 58, Math.sin(h) * 58); ctx.stroke();
    P.text(ctx, String(n), 0, 24, { size: 58, font: 'mono', color: C.ink, shadow: false });
    P.dot(ctx, 0, 0, 8, C.ink);
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@retry.after',
    caption: 'exponential backoff is not a strategy it is a lifestyle 🧱 #429 #ratelimited #retry #agentlife',
    sound: 'bonk bonk bonk (Retry-After remix) · retry.after',
    avatar: '🧱',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#8EC9E8',
    thumb: 2.62,
    likes: '1.9M', commentCount: '42.9K', saves: '231K', shares: '429K',
    comments: [
      '@api.gateway: sir this is a 429 establishment',
      ['jitter.enjoyer', 'you forgot the jitter. that is why'],
      '@while.true: retry retry retry retry retry retry retry',
    ],

    bpm: 150,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t > 7.8) return;               // the long wait is silent (except snoring)
      if (step % 4 === 0) SFX.bass('C3', 0.2, { vol: 0.14 });
      if (step % 4 === 2) SFX.bass('G2', 0.2, { vol: 0.14 });
      if (step % 2 === 1) SFX.chord(['E4', 'G4'], 0.14, { type: 'triangle', vol: 0.035 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp } = P;
      const pose = clawdPose(t);
      const a = pose.a;

      // sky + drifting clouds (drift exactly one wrap per loop)
      P.gradient(ctx, '#7fbfe3', '#d4edf7');
      const drift = (t / D) * 1400;
      [[180, 620, 0.9], [760, 760, 0.7], [1180, 560, 1.1]].forEach(([x, y, s]) => {
        const cx = ((x - drift) % 1400 + 1400) % 1400 - 160;
        P.cloud(ctx, cx, y, s);
      });

      ctx.save();
      if (t >= a.b && t < a.b + 0.35) P.shake(ctx, t, 18 * (1 - prog(t, a.b, 0.35)));

      /* ---------- building with the API door ---------- */
      P.rect(ctx, 610, 820, 330, 600, '#d9cbb3', { radius: 12, seed: 2 });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++)
        P.rect(ctx, 630 + c * 100 + (r % 2) * 40, 845 + r * 30, 70, 20, '#cdbda1', { radius: 4, seed: r * 3 + c, shadow: false, amp: 1 });
      P.rect(ctx, 680, 910, 190, 84, C.blue, { radius: 16, seed: 3 });
      P.text(ctx, 'API', 775, 954, { size: 62, font: 'bubble', color: '#fff', shadow: false });
      P.rect(ctx, 690, 1020, 170, 380, '#4a3326', { radius: 10, seed: 4 });
      P.rect(ctx, 704, 1034, 142, 366, '#fff4c8', { radius: 6, seed: 5, shadow: false });
      P.poly(ctx, [[704, 1034], [770, 1060], [770, 1400], [704, 1400]], C.brown, { seed: 6 });
      P.dot(ctx, 756, 1230, 8, C.yellow);
      P.rect(ctx, 790, 1100, 60, 34, C.green, { radius: 6, seed: 7, shadow: false });
      P.text(ctx, 'OPEN', 820, 1118, { size: 20, font: 'sans', color: '#fff', shadow: false, weight: 900 });

      // ground
      P.tornEdge(ctx, GROUND - 6, C.green, 3);
      P.tornEdge(ctx, 1470, '#8a6a4a', 8);

      /* ---------- the 429 wall ---------- */
      const up = wallUp(t);
      if (up < 1) {
        const wy = -up * 1100;
        const wob = t >= a.b ? Math.sin((t - a.b) * 40) * 0.02 * Math.max(0, 1 - (t - a.b) / 0.5) : 0;
        ctx.save();
        ctx.translate(740, GROUND + wy); ctx.rotate(wob); ctx.translate(-740, -GROUND);
        P.rect(ctx, WALL_X, 640, 310, 770, C.red, { radius: 14, seed: 11, shadow: { blur: 24, dy: 12, alpha: 0.4 } });
        for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) {
          const bx = WALL_X + 14 + c * 100 - (r % 2) * 50;
          if (bx < WALL_X + 6 || bx + 86 > WALL_X + 304) continue;
          P.rect(ctx, bx, 660 + r * 62, 86, 46, '#c73c44', { radius: 6, seed: r * 5 + c, shadow: false, amp: 1.5 });
        }
        P.title(ctx, '429', 745, 830, { size: 150, color: C.yellow, stroke: C.ink, strokeWidth: 22 });
        P.text(ctx, 'Too Many\nRequests', 745, 1010, { size: 58, font: 'bubble', color: '#fff', stroke: C.ink, strokeWidth: 10 });
        P.rect(ctx, 610, 1150, 270, 70, C.paper, { radius: 12, seed: 13 });
        P.text(ctx, `Retry-After: ${a.label}`, 745, 1186, { size: 30, font: 'mono', color: C.ink, shadow: false });
        ctx.restore();
      }

      /* ---------- Clawd ---------- */
      if (pose.phase === 'run') {
        // speed lines + dust
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        for (let j = 0; j < 3; j++) {
          const ly = pose.y - 50 + j * 50, len = 70 + 50 * pose.p;
          ctx.beginPath(); ctx.moveTo(pose.x - R - 20 - j * 12, ly); ctx.lineTo(pose.x - R - 20 - j * 12 - len, ly); ctx.stroke();
        }
        ctx.restore();
        for (let j = 0; j < 4; j++) {
          const lt = ((t - a.s) * 3 + j / 4) % 1;
          ctx.save(); ctx.globalAlpha = 0.7 * (1 - lt);
          P.circle(ctx, pose.x - 70 - lt * 120, GROUND - 14 - lt * 30, 16 + lt * 22, '#f4ead8', { shadow: false, seed: j });
          ctx.restore();
        }
      }
      const blink = pose.phase === 'lie' ? 0 : P.pulse(t, 6.2, 0.15);
      P.claude(ctx, pose.x, pose.y, R, { t, mood: pose.mood, rot: pose.rot, squash: pose.sq, blink });

      // impact!
      if (t >= a.b && t < a.b + 0.5) {
        P.burstLines(ctx, WALL_X - 6, GROUND - R, 90, prog(t, a.b, 0.35), C.yellow, 10, 12);
        P.title(ctx, a.bonk, 420, 990, { size: 110, color: C.yellow, stroke: C.ink, rot: -0.15 + a.k * 0.08, pop: ease.outBack(prog(t, a.b, 0.18)) * (1 - prog(t, a.b + 0.35, 0.15)) });
      }

      // dizzy stars while lying
      if (pose.phase === 'lie' && t < a.land + 1.2) {
        const cx = REST_X, cy = GROUND - R * 0.9 - 70;
        for (let j = 0; j < 3; j++) {
          const an = t * 7 + j * P.TAU / 3;
          P.star(ctx, cx + Math.cos(an) * 90, cy + Math.sin(an) * 26, 22, C.yellow, { shadow: false, rot: t * 5 });
        }
      }

      // cobweb + zzz during the long final wait
      if (a.k === 3 && pose.phase === 'lie' && t > a.land + 0.8) {
        const web = prog(t, a.land + 0.8, 0.8);
        ctx.save(); ctx.globalAlpha = 0.85 * web; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
        const ox = REST_X + 70, oy = GROUND - 8;
        for (let j = 0; j < 5; j++) {
          const an = -Math.PI / 2 - j * 0.35;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(an) * 130, oy + Math.sin(an) * 130); ctx.stroke();
        }
        for (let ring = 1; ring <= 3; ring++) {
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const an = -Math.PI / 2 - j * 0.35, rr = ring * 40;
            j ? ctx.lineTo(ox + Math.cos(an) * rr, oy + Math.sin(an) * rr) : ctx.moveTo(ox + Math.cos(an) * rr, oy + Math.sin(an) * rr);
          }
          ctx.stroke();
        }
        ctx.restore();
        for (let j = 0; j < 3; j++) {
          const lt = ((t - a.land) * 0.8 + j / 3) % 1;
          ctx.save(); ctx.globalAlpha = Math.sin(lt * Math.PI);
          P.text(ctx, 'z', REST_X + 40 + lt * 90, GROUND - 190 - lt * 170, { size: 50 + j * 14, font: 'bubble', color: '#fff', stroke: C.purple, strokeWidth: 8 });
          ctx.restore();
        }
      }

      // Retry-After countdown clock
      if (pose.phase === 'lie' && t >= a.ws) {
        const p = prog(t, a.ws, a.we - a.ws);
        const n = Math.max(0, Math.ceil(a.label * (1 - p) - 1e-6));
        const ring = t > a.we - 0.15;
        const pop = ease.outBack(prog(t, a.ws, 0.25));
        alarmClock(ctx, 330, 900, pop * 0.95, t, n, ring);
        P.text(ctx, `retry after ${a.label}s`, 330, 745, { size: 52, font: 'marker', color: '#fff', stroke: C.ink, strokeWidth: 9, scale: pop });
      }

      // pep talk on the way back in
      const sayStart = a.k === 0 ? 0 : ATTEMPTS[a.k - 1].we;
      if (t >= sayStart && t < a.b) {
        P.bubble(ctx, a.say, 360, 1040, pose.x, pose.y - R * 0.6, { size: 46, pop: ease.outBack(prog(t, sayStart, 0.2)) });
      }
      ctx.restore(); // shake

      /* ---------- top HUD: attempt counter + backoff chart ---------- */
      P.rect(ctx, 90, 300, 440, 150, C.paper, { radius: 28, seed: 21 });
      P.text(ctx, 'attempt', 310, 338, { size: 34, font: 'sans', color: '#8a8494', shadow: false, weight: 800 });
      P.title(ctx, `#${a.k + 1}`, 310, 400, { size: 84, color: C.claude, stroke: C.ink, strokeWidth: 12, pop: ease.outBack(prog(t, a.s, 0.3)) });

      P.rect(ctx, 580, 300, 400, 250, C.paper, { radius: 28, seed: 22 });
      P.text(ctx, 'backoff (s)', 780, 336, { size: 30, font: 'mono', color: C.ink, shadow: false });
      ATTEMPTS.forEach((b, j) => {
        if (t < b.ws) return;
        const g = ease.outBack(prog(t, b.ws, 0.35));
        const h = b.label * 16 * g;
        const bx = 630 + j * 82;
        P.rect(ctx, bx, 530 - h - 8, 58, Math.max(10, h), [C.green, C.mustard, C.claude, C.red][j], { radius: 8, seed: 30 + j, shadow: false, amp: 1.5 });
        P.text(ctx, String(b.label), bx + 29, 530 - h - 30, { size: 30, font: 'bubble', color: C.ink, shadow: false, scale: g });
      });

      // caption sticker
      if (t < 7.85) P.sticker(ctx, "pov: you've been rate limited", 60, 1545, { pop: ease.outBack(prog(t, 0.15, 0.4)) });
      else P.sticker(ctx, 'exponential backoff arc 📈', 60, 1545, { pop: ease.outBack(prog(t, 7.85, 0.4)), rot: 0.02 });

      /* ---------- sound ---------- */
      for (const b of ATTEMPTS) {
        if (env.at(b.s)) SFX.whoosh({ vol: 0.12 });
        for (let j = 1; j * 0.11 < b.run; j++) if (env.at(b.s + j * 0.11)) SFX.tick({ vol: 0.2 });
        if (env.at(b.b - 0.04)) { SFX.thud({ vol: 0.3 }); SFX.noise(0.18, { freq: 500, vol: 0.18 }); }
        if (env.at(b.b)) { SFX.boing({ vol: 0.22 + b.k * 0.03 }); SFX.tone(95, 0.18, { type: 'square', vol: 0.06 }); }
        if (env.at(b.land)) SFX.thud({ vol: 0.28 });
        if (env.at(b.ws)) SFX.blip(660, { vol: 0.06 });
        const span = b.we - b.ws;
        for (let j = 1; j < b.label; j++) if (env.at(b.ws + (j / b.label) * span)) SFX.tick({ vol: 0.3 });
        if (env.at(b.we - 0.15)) [0, 0.07, 0.14].forEach(w => SFX.tone(1480, 0.06, { type: 'square', vol: 0.05, when: w }));
      }
      [8.6, 9.4].forEach(s => { if (env.at(s)) SFX.tone(150, 0.6, { type: 'sawtooth', slide: 90, vol: 0.04, attack: 0.25 }); });
    },
  });
})();
