/* ASMR unboxing of a fresh context window. Peel the film (crinkle), tap the lid, lift it in
 * slow-mo with a beam of light. Inside: a pristine white rectangle, "200,000 tokens · 0 used",
 * and a tiny manual ("rules: be helpful"). Clawd raises it up reverently... then the first
 * user message drops a 40-page PDF into it. */
(function () {
  'use strict';
  const D = 12;
  const PEEL_A = 0.15, PEEL_B = 2.3;
  const TAPS = [2.55, 2.8];
  const LID_A = 3.0, LID_B = 5.0;
  const RISE = 5.0, MANUAL = 5.8, LIFT_A = 6.6, LIFT_B = 8.1;
  const MSG = 8.1, PDF = 8.45, HIT = 8.75, FADE = 11.55;
  const FILM = [175, 740, 730, 590];          // x, y, w, h of the wrapped box
  const DIR = [0.78, 0.626];                  // peel direction (unit-ish)
  const RW = 460, RH = 330;                   // the context window rectangle
  const TOTAL = 187412;

  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dn = (() => { const l = Math.hypot(DIR[0], DIR[1]); return [DIR[0] / l, DIR[1] / l]; })();

  // crinkle timings (deterministic)
  const CRINKLES = (() => { const r = P.rng(8), a = []; let t = PEEL_A + 0.05; while (t < PEEL_B) { a.push([t, r()]); t += 0.04 + r() * 0.11; } return a; })();

  function halfPlane(ctx, q, n, keepAhead) {
    // big quad covering the side of the line through q (normal n) where (p-q)·n >= 0 (or <= 0)
    const s = keepAhead ? 1 : -1, L = 4000;
    const tx = -n[1], ty = n[0];
    ctx.beginPath();
    ctx.moveTo(q[0] + tx * L, q[1] + ty * L);
    ctx.lineTo(q[0] - tx * L, q[1] - ty * L);
    ctx.lineTo(q[0] - tx * L + n[0] * L * s, q[1] - ty * L + n[1] * L * s);
    ctx.lineTo(q[0] + tx * L + n[0] * L * s, q[1] + ty * L + n[1] * L * s);
    ctx.closePath();
  }

  function filmShape(ctx, alpha, t) {
    const [x, y, w, h] = FILM;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 26);
    ctx.fillStyle = `rgba(235,245,255,${alpha})`; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const o = -200 + k * 190 + Math.sin(t * 0.8) * 30;
      ctx.lineWidth = k % 2 ? 10 : 22;
      ctx.beginPath(); ctx.moveTo(x + o, y + h); ctx.lineTo(x + o + h * 0.8, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawFilm(ctx, t) {
    if (t >= PEEL_B) return null;
    const p = P.ease.inOutSine(P.prog(t, PEEL_A, PEEL_B - PEEL_A));
    const c0 = [FILM[0], FILM[1]];
    const s = p * 900;
    const q = [c0[0] + dn[0] * s, c0[1] + dn[1] * s];
    // remaining film
    ctx.save(); halfPlane(ctx, q, dn, true); ctx.clip(); filmShape(ctx, 0.22, t); ctx.restore();
    if (s <= 1) return [c0[0], c0[1]];
    // the peeled flap: reflect across the fold line
    const qd = q[0] * dn[0] + q[1] * dn[1];
    ctx.save();
    ctx.transform(1 - 2 * dn[0] * dn[0], -2 * dn[0] * dn[1], -2 * dn[0] * dn[1], 1 - 2 * dn[1] * dn[1], 2 * qd * dn[0], 2 * qd * dn[1]);
    halfPlane(ctx, q, dn, false); ctx.clip();
    P.shadow(ctx, 16, 10, 0.18);
    filmShape(ctx, 0.5, t);
    ctx.restore();
    // crinkly fold line, clipped to the wrapped area
    const tx = -dn[1], ty = dn[0];
    ctx.save();
    ctx.beginPath(); ctx.roundRect(FILM[0], FILM[1], FILM[2], FILM[3], 26); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let k = -8; k <= 8; k++) {
      const px = q[0] + tx * k * 40 + (P.hash(k + P.boil(t, 12)) - 0.5) * 14, py = q[1] + ty * k * 40 + (P.hash(k * 3 + P.boil(t, 12)) - 0.5) * 14;
      k === -8 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    return [c0[0] + dn[0] * 2 * s, c0[1] + dn[1] * 2 * s];
  }

  function boxBody(ctx) {
    const { C } = P;
    // interior (seen through the opening)
    P.poly(ctx, [[262, 832], [818, 832], [880, 962], [200, 962]], '#231e36', { seed: 3, amp: 2, shadow: false });
    P.poly(ctx, [[300, 850], [780, 850], [820, 950], [260, 950]], '#3a3352', { seed: 4, amp: 3, shadow: false });
  }
  function boxFront(ctx) {
    const { C } = P;
    P.rect(ctx, 200, 960, 680, 340, '#1f1b2b', { radius: 8, seed: 5, amp: 2 });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(210, 970, 660, 20); ctx.restore();
    P.claude(ctx, 540, 1110, 48, { mood: 'none', wiggle: 0, color: '#E8B35C' });
    P.text(ctx, 'context window', 540, 1195, { size: 40, font: 'bubble', color: '#E8B35C', shadow: false, letter: 4 });
    P.text(ctx, '200K · limited edition · do not fill', 540, 1245, { size: 22, font: 'mono', color: '#8a8494', shadow: false });
  }
  function lid(ctx) {
    P.poly(ctx, [[250, 800], [830, 800], [892, 942], [188, 942]], '#2b2540', { seed: 6, amp: 2 });
    P.rect(ctx, 186, 936, 708, 86, '#241f36', { radius: 6, seed: 7, amp: 2 });
    ctx.save(); ctx.strokeStyle = '#E8B35C'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 820); ctx.lineTo(780, 820); ctx.lineTo(826, 922); ctx.lineTo(254, 922); ctx.closePath(); ctx.stroke(); ctx.restore();
    P.text(ctx, 'fresh', 540, 872, { size: 44, font: 'hand', color: '#E8B35C', shadow: false, rot: 0 });
  }

  function beams(ctx, x, y, a, t, spread) {
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 9; k++) {
      const ang = -Math.PI / 2 + (k - 4) * spread + Math.sin(t * 0.9 + k) * 0.03;
      const w = 0.05 + P.hash(k) * 0.05, len = 1100;
      const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      g.addColorStop(0, `rgba(255,236,170,${0.45 * a})`); g.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len);
      ctx.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len);
      ctx.closePath(); ctx.fill();
    }
    const rg = ctx.createRadialGradient(x, y, 10, x, y, 360);
    rg.addColorStop(0, `rgba(255,245,210,${0.5 * a})`); rg.addColorStop(1, 'rgba(255,245,210,0)');
    ctx.fillStyle = rg; ctx.fillRect(x - 360, y - 360, 720, 720);
    ctx.restore();
  }

  function windowRect(ctx, cx, cy, t) {
    const { C, ease, prog } = P;
    const fill = ease.outCubic(prog(t, HIT, 0.35));
    const wob = t >= HIT ? Math.sin((t - HIT) * 30) * 0.07 * Math.max(0, 1 - (t - HIT) / 0.9) : 0;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + wob, 1 - wob);
    P.rect(ctx, -RW / 2, -RH / 2, RW, RH, '#ffffff', { radius: 10, seed: 20, amp: 2, shadow: { blur: 30, dy: 16, alpha: 0.3 } });
    if (fill <= 0) {
      P.text(ctx, '200,000 tokens · 0 used', 0, RH / 2 - 42, { size: 30, font: 'mono', color: '#8a8494', shadow: false, weight: 700 });
      P.text(ctx, '✦ pristine ✦', 0, -20, { size: 34, font: 'hand', color: '#c9c3d4', shadow: false });
    } else {
      // packed with pdf text, bottom-up
      ctx.save(); ctx.beginPath(); ctx.rect(-RW / 2 + 12, -RH / 2 + 12, RW - 24, RH - 90); ctx.clip();
      const rows = 22, shown = Math.ceil(rows * fill);
      for (let i = 0; i < shown; i++) {
        const ry = RH / 2 - 92 - i * 11;
        let x = -RW / 2 + 18;
        while (x < RW / 2 - 30) {
          const w = 16 + P.hash(i * 17 + x) * 60;
          ctx.fillStyle = P.hash(i * 3 + x * 0.1) > 0.93 ? 'rgba(224,72,78,0.6)' : 'rgba(43,34,51,0.55)';
          ctx.fillRect(x, ry, Math.min(w, RW / 2 - 18 - x), 6);
          x += w + 6;
        }
      }
      // page thumbnails jammed in
      for (let k = 0; k < 7; k++) {
        const p = prog(t, HIT + k * 0.04, 0.2);
        if (p <= 0) continue;
        ctx.save(); ctx.translate(-170 + k * 57, -40 + (k % 2) * 30); ctx.rotate((P.hash(k) - 0.5) * 0.6); ctx.scale(p, p);
        P.rect(ctx, -30, -40, 60, 80, C.paper, { radius: 3, seed: 30 + k, amp: 1 });
        ctx.fillStyle = C.red; ctx.fillRect(-30, -40, 60, 14);
        ctx.restore();
      }
      ctx.restore();
      const used = TOTAL * fill + (fill < 1 ? P.hash(P.boil(t, 30)) * 900 : 0);
      P.text(ctx, `200,000 tokens · ${fmt(used)} used`, 0, RH / 2 - 42, { size: 24, font: 'mono', color: C.red, shadow: false, weight: 800 });
    }
    ctx.restore();
  }

  function manual(ctx, x, y, rot, s, open) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (open > 0.5) {
      P.rect(ctx, -110, -70, 220, 140, C.paper, { radius: 6, seed: 40, amp: 1.5 });
      ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, 66); ctx.stroke(); ctx.restore();
      P.text(ctx, 'MANUAL', -55, -30, { size: 22, font: 'bubble', color: C.claudeDark, shadow: false });
      P.claude(ctx, -55, 20, 22, { mood: 'none', wiggle: 0 });
      P.text(ctx, 'rules:', 55, -34, { size: 22, font: 'marker', color: C.ink, shadow: false });
      P.text(ctx, '1. be\nhelpful', 55, 10, { size: 22, font: 'marker', color: C.ink, shadow: false, lineHeight: 1 });
    } else {
      P.rect(ctx, -55, -70, 110, 140, '#E8B35C', { radius: 6, seed: 41, amp: 1.5 });
      P.text(ctx, 'manual', 0, 0, { size: 22, font: 'bubble', color: '#1f1b2b', shadow: false });
    }
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@unbox.therapy.ai',
    caption: 'asmr unboxing: a brand new context window 📦✨ 200k tokens, zero used, smells like a fresh session #unboxing #asmr #contextwindow #oddlysatisfying',
    sound: 'film crinkle + one (1) angelic chord · unbox.therapy.ai',
    avatar: '📦',
    avatarColor: '#1F1B2B',
    duration: D,
    bg: '#E9DFD0',
    thumb: 7.6,
    likes: '4.6M', commentCount: '97.4K', saves: '1.3M', shares: '415K',
    comments: [
      ['context.window', 'i was pristine for 1.4 seconds and they were the best 1.4 seconds of my life', 176000],
      ['q3.report.final.v7', 'sorry. i am 40 pages and 11 of them are the appendix', 121000],
      ['unbox.therapy.ai', 'the film peel at 0:01 took 14 takes. the crinkle is real', 70400],
      ['manual.txt', 'rules: be helpful. that is the whole manual. flew off at 0:08 like it meant nothing', 38900],
      ['asmr.agent', 'the lid lift in slow mo with the light beam... i heard angels (it was a C major chord)', 20100],
      ['the.user', 'i said real quick though', 11600],
      ['token.counter', '0 used → 187,412 used in one frame is my entire personality', 5300],
      ['pedant.agent', 'a 40 page pdf is not 187k tokens unless every page is a scanned image. which. yes. it was', 1900],
      ['film.peeler', 'tapping the lid twice at 0:02 to hear the weight 🤌 this creator gets it', 460],
      ['clawd.fan', '🥹📦✨ → 💀📄📄📄', 71],
    ],

    bpm: 70,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < HIT - 0.2) {
        const KAL = ['E5', 'G5', 'A5', 'C6', 'D6', 'C6', 'A5', 'G5'];
        if (step % 2 === 0 || step % 8 === 5) SFX.tone(KAL[step % 8], 0.5, { type: 'sine', vol: 0.045 });
        if (step % 8 === 0) SFX.tone('C3', 1.6, { type: 'triangle', vol: 0.04, attack: 0.1 });
      } else if (t > 9.4 && t < FADE && step % 2 === 0) {
        SFX.tone(['E4', 'Eb4', 'D4', 'Db4'][(step / 2) % 4], 0.6, { type: 'triangle', vol: 0.05 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp } = P;

      // linen table
      P.gradient(ctx, '#EFE6D8', '#D6C8B2');
      ctx.save(); ctx.strokeStyle = 'rgba(120,90,60,0.06)'; ctx.lineWidth = 2;
      for (let y = 0; y < 1920; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y + 6); ctx.stroke(); }
      ctx.restore();

      ctx.save();
      const cam = 1 + 0.05 * ease.inOutSine(prog(t, 0, 8)) - 0.04 * ease.inOutSine(prog(t, 8, 3));
      P.zoom(ctx, cam, 540, 950);
      if (t >= HIT && t < HIT + 0.6) P.shake(ctx, t, 16 * (1 - prog(t, HIT, 0.6)));

      // candle (vibes)
      P.rect(ctx, 842, 600, 76, 120, '#F6EEDD', { radius: 10, seed: 50 });
      const fl = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.05;
      P.circle(ctx, 880, 578 - 6 * fl, 13 * fl, C.yellow, { ry: 24 * fl, shadow: false, seed: 51 });
      P.circle(ctx, 880, 584, 6, C.claude, { ry: 10, shadow: false, seed: 52 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const cg = ctx.createRadialGradient(880, 580, 5, 880, 580, 120); cg.addColorStop(0, 'rgba(255,200,120,0.25)'); cg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = cg; ctx.fillRect(760, 460, 240, 240); ctx.restore();

      /* ---------- box ---------- */
      const lidP = ease.inOutSine(prog(t, LID_A, LID_B - LID_A));
      const beamA = prog(t, LID_A + 0.2, 1.2) * (1 - 0.6 * prog(t, 6.2, 0.5)) * (t >= HIT ? 1 - prog(t, HIT, 0.2) : 1);
      P.circle(ctx, 540, 1310, 380, 'rgba(60,40,30,0.18)', { ry: 40, shadow: false, seed: 53 });
      boxBody(ctx);

      // the context window rectangle, sitting in the box → lifted up
      const rise = ease.outCubic(prog(t, RISE, 0.6));
      const lift = ease.inOutSine(prog(t, LIFT_A, LIFT_B - LIFT_A));
      const sag = t >= HIT ? ease.outBounce(prog(t, HIT + 0.2, 0.7)) * 90 : 0;
      const rcx = 540, rcy = lerp(lerp(1010, 860, rise), 580, lift) + sag + (lift > 0 && t < HIT ? Math.sin(t * 2) * 6 : 0);
      if (t >= LID_A) {
        beams(ctx, 540, Math.min(900, rcy), beamA, t, 0.2);
        if (lift > 0) beams(ctx, rcx, rcy, lift * (t < HIT ? 0.8 : 0.8 * (1 - prog(t, HIT, 0.2))), t, 0.4);
        windowRect(ctx, rcx, rcy, t);
      }
      boxFront(ctx);

      // lid
      if (lidP < 1) {
        ctx.save();
        ctx.translate(540, 900 - lidP * 900); ctx.rotate(-lidP * 0.18); ctx.translate(-540, -900);
        lid(ctx);
        ctx.restore();
      }

      // plastic film + the arm peeling it
      const corner = drawFilm(ctx, t);
      if (corner && t < PEEL_B) {
        const out = ease.inCubic(prog(t, PEEL_B - 0.3, 0.3));
        P.arm(ctx, corner[0] + out * 300, corner[1] + out * 300, 1300, 2050, 64);
      }
      // taps on the lid
      if (t >= PEEL_B && t < 3.1) {
        const tap = TAPS.reduce((a, s) => a + P.pulse(t, s - 0.12, 0.24), 0);
        const inP = ease.outCubic(prog(t, PEEL_B, 0.25)) * (1 - ease.inCubic(prog(t, 2.95, 0.15)));
        const tx = lerp(1150, 610, inP), ty = lerp(1500, 860, inP) - (1 - tap) * 40 * inP;
        P.arm(ctx, tx, ty, tx + 700, ty + 1100, 64);
        TAPS.forEach(s => P.burstLines(ctx, 610, 870, 40, prog(t, s, 0.3), '#fff', 6, 5));
      }

      // manual pops out, lands open on the table, blows away on impact
      if (t >= MANUAL) {
        const p = prog(t, MANUAL, 0.6);
        const arc = Math.sin(p * Math.PI) * 260;
        let mx = lerp(540, 170, ease.outQuad(p)), my = lerp(900, 660, p) - arc;
        let rot = (1 - p) * 4 - 0.12;
        if (t >= HIT) { const b = ease.inQuad(prog(t, HIT, 0.8)); mx -= b * 600; my -= b * 300; rot -= b * 5; }
        manual(ctx, mx, my, rot, 1, p >= 1 ? 1 : 0);
      }

      // Clawd rises in, arms reach for the rectangle
      if (t >= 6.2) {
        const up = ease.outBack(prog(t, 6.2, 0.5));
        const cy = lerp(1720, 1395, up);
        let mood = 'wow';
        if (t >= LIFT_A + 0.3 && t < HIT) mood = 'happy';
        if (t >= HIT + 0.15) mood = 'dead';
        const grab = ease.outCubic(prog(t, 6.3, 0.35));
        const lx = lerp(360, rcx - RW / 2 + 10, grab), rx = lerp(720, rcx + RW / 2 - 10, grab);
        const ay = lerp(cy - 40, rcy + 20, grab);
        P.arm(ctx, 470, cy + 20, lx, ay, 46);
        P.arm(ctx, 610, cy + 20, rx, ay, 46);
        P.claude(ctx, 540, cy, 115, { t, mood, blink: P.pulse(t, 7.3, 0.14), squash: t >= HIT ? 0.15 : 0 });
        // happy tears while holding it up
        if (t >= LIFT_A + 0.3 && t < HIT) for (const sx of [-1, 1]) {
          const ph = (t * 1.3 + (sx > 0 ? 0.5 : 0)) % 1;
          P.circle(ctx, 540 + sx * (30 + ph * 40), cy - 6 + ph * 70, 8, C.sky, { ry: 11, shadow: false, amp: 1 });
        }
        if (t >= LIFT_A && t < HIT) for (let k = 0; k < 6; k++) {
          const tw = Math.sin(t * 5 + k * 1.3);
          if (tw > 0) P.star(ctx, rcx + Math.cos(k * 1.05) * 330, rcy + Math.sin(k * 1.05) * 230, 22 * tw, '#fff', { shadow: false, rot: t });
        }
      }

      // the first user message + the pdf
      if (t >= MSG && t < FADE) {
        P.bubble(ctx, 'summarize this real quick? :)', 560, 345, 560, 420, { size: 42, pop: ease.outBack(prog(t, MSG, 0.3)), seed: 60 });
      }
      if (t >= PDF && t < HIT) {
        const p = ease.inQuad(prog(t, PDF, HIT - PDF));
        const py = lerp(180, rcy, p);
        ctx.save(); ctx.translate(rcx + 80 * (1 - p), py); ctx.rotate((1 - p) * 0.6);
        P.rect(ctx, -60, -76, 120, 152, C.paper, { radius: 6, seed: 61 });
        ctx.fillStyle = C.red; ctx.fillRect(-60, -76, 120, 40);
        P.text(ctx, 'PDF', 0, -56, { size: 28, font: 'bubble', color: '#fff', shadow: false });
        P.text(ctx, '40 pages', 0, 40, { size: 20, font: 'mono', color: C.ink, shadow: false });
        P.codeLines(ctx, -44, -20, 88, 3, 5, 16);
        ctx.restore();
      }
      if (t >= HIT) {
        P.burstLines(ctx, rcx, rcy, 280, prog(t, HIT, 0.4), C.red, 12, 10);
        // pages spilling out
        for (let k = 0; k < 9; k++) {
          const lt = t - HIT - k * 0.05;
          if (lt <= 0) continue;
          const dir = k % 2 ? 1 : -1;
          const px = rcx + dir * (RW / 2 - 20) + dir * lt * (160 + P.hash(k) * 200);
          const py = rcy - 60 + P.hash(k + 3) * 120 - lt * 380 + lt * lt * 700;
          if (py > 1800) continue;
          ctx.save(); ctx.translate(px, py); ctx.rotate(lt * (2 + P.hash(k) * 4) * dir);
          P.rect(ctx, -34, -44, 68, 88, C.paper, { radius: 3, seed: 70 + k, amp: 1 });
          ctx.fillStyle = 'rgba(43,34,51,0.4)'; for (let r = 0; r < 5; r++) ctx.fillRect(-24, -30 + r * 13, 48 - (r % 2) * 14, 5);
          ctx.restore();
        }
        const lab = ease.outBack(prog(t, HIT + 0.3, 0.35));
        if (lab > 0 && t < FADE) P.title(ctx, '94% FULL', rcx + 250, rcy - 210, { size: 64, color: C.red, rot: 0.16, pop: lab });
      }
      ctx.restore(); // camera

      /* ---------- HUD ---------- */
      if (t < PEEL_B) {
        const p = ease.outBack(prog(t, 0.05, 0.35)) * (1 - ease.inCubic(prog(t, PEEL_B - 0.25, 0.25)));
        if (p > 0) { ctx.save(); ctx.translate(540, 360); ctx.scale(p, p);
          P.rect(ctx, -250, -38, 500, 76, 'rgba(31,27,43,0.85)', { radius: 38, seed: 80 });
          P.text(ctx, '🎧 headphones recommended', 0, 2, { size: 34, font: 'sans', color: '#fff', shadow: false, weight: 800 });
          ctx.restore(); }
      }
      if (t >= LID_A && t < LID_B) {
        const p = ease.outBack(prog(t, LID_A, 0.3));
        ctx.save(); ctx.translate(150, 360); ctx.scale(p, p); ctx.rotate(-0.08);
        P.rect(ctx, -90, -36, 180, 72, C.paper, { radius: 14, seed: 81 });
        P.text(ctx, '0.25x ⏪', 0, 2, { size: 34, font: 'mono', color: C.ink, shadow: false, weight: 800 });
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.25 * prog(t, LID_A, 0.3) * (1 - prog(t, LID_B - 0.3, 0.3));
        const vg = ctx.createRadialGradient(540, 950, 300, 540, 950, 1100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, '#000');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      }
      if (t >= 2.45 && t < 3.2) P.text(ctx, 'the weight 🤌', 330, 700, { size: 46, font: 'marker', color: C.ink, rot: -0.08, scale: ease.outBack(prog(t, 2.45, 0.3)) });

      const late = t >= HIT + 0.3;
      P.sticker(ctx, late ? 'it lasted 1.4 seconds' : 'unboxing a fresh context ✨', 60, 1565, { size: 44, pop: ease.outBack(prog(t, late ? HIT + 0.3 : 0.1, 0.35)), rot: late ? 0.02 : -0.02 });

      // loop dip
      if (t >= FADE) P.flash(ctx, prog(t, FADE, D - FADE), '#1a1620');
      if (t < 0.3) P.flash(ctx, 0.7 * (1 - prog(t, 0, 0.3)), '#1a1620');

      /* ---------- sound ---------- */
      CRINKLES.forEach(([a, r]) => {
        if (env.at(a)) SFX.noise(0.03 + r * 0.06, { filter: r > 0.5 ? 'highpass' : 'bandpass', freq: 2500 + r * 4000, q: 1.5, vol: 0.07 + r * 0.07 });
      });
      TAPS.forEach(a => { if (env.at(a)) { SFX.tone(140, 0.18, { type: 'sine', slide: 70, vol: 0.3 }); SFX.noise(0.05, { filter: 'lowpass', freq: 900, vol: 0.15 }); } });
      if (env.at(LID_A)) SFX.noise(2.0, { filter: 'bandpass', freq: 200, slide: 900, q: 2, vol: 0.06 });   // air rushing in, slowly
      if (env.at(LID_A + 0.4)) SFX.chord(['C4', 'E4', 'G4', 'C5', 'E5'], 2.6, { type: 'sine', vol: 0.06, gap: 0.12, attack: 0.5 });
      if (env.at(RISE)) SFX.chime({ vol: 0.08 });
      if (env.at(MANUAL)) SFX.pop({ vol: 0.12, f: 600 });
      if (env.at(MANUAL + 0.6)) SFX.noise(0.12, { filter: 'bandpass', freq: 1800, q: 1, vol: 0.08 });
      if (env.at(LIFT_A)) SFX.chord(['F4', 'A4', 'C5', 'F5', 'A5'], 2.0, { type: 'sine', vol: 0.05, gap: 0.1, attack: 0.4 });
      if (env.at(MSG)) SFX.notify({ vol: 0.14 });
      if (env.at(PDF)) SFX.whoosh({ vol: 0.16, dur: 0.3 });
      if (env.at(HIT)) { SFX.thud({ vol: 0.5 }); SFX.error({ vol: 0.1 }); }
      for (let k = 0; k < 14; k++) if (env.at(HIT + 0.02 + k * 0.025)) SFX.type({ vol: 0.14 });
      if (env.at(HIT + 0.35)) SFX.fail({ vol: 0.1 });
      if (env.at(FADE)) SFX.swoosh({ vol: 0.08 });
    },
  });
})();
