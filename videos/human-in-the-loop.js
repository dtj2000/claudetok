/* POV: you're the human in the loop. Clawd slides permission requests across
 * the desk, a sleepy hand stamps APPROVE faster and faster, the pile towers up...
 * last one: "can i delete prod?". Stamped before reading. Record scratch. */
(function () {
  'use strict';
  const D = 10.5;
  const TAU = Math.PI * 2;
  const INK = '#2B2233', SKIN = '#F1C7A5', SKIN_D = '#DDA985', SLEEVE = '#5f6f94';
  const PX = 600, PY = 900;              // where papers rest on the desk
  const SX = 600;                        // stamp x
  const STAMPS = [1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 4.75, 5.0, 5.25, 5.5, 5.625, 5.75, 5.875, 6.0, 6.125, 6.25, 6.375, 6.5, 6.625, 6.75, 6.875, 7.0];
  const N = STAMPS.length;
  const FINAL_IN = 7.12, FINAL = 7.42;   // last paper slides in, gets stamped mid-slide
  const FREEZE_END = 8.4, LIFT_END = 9.35, SWEEP = 10.0;
  const REQ = [
    'can i read\nthis file?', 'can i run\nls?', 'can i run\nls again?', 'can i\nbreathe?',
    'can i edit\nline 4?', 'can i npm\ninstall?', 'can i say\n"great q"?', 'can i read\nthe README?',
    'can i\ncd ..?', 'can i\ngit status?', 'can i\nthink?', 'can i\npwd?', 'can i\nask a q?',
    'can i\nuse grep?', 'can i\nblink?', 'can i\nexist?', 'can i\nls -la?', 'can i\nsay hi?',
    'can i\nsudo?', 'can i\ncat .env?', 'can i write\na test?', 'can i\nnap?',
  ];
  const LAST = 'can i\ndelete\nprod?';

  function paper(ctx, x, y, s, rot, text, ink, n, o = {}) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.rect(ctx, -230, -290, 460, 580, '#fdfaf2', { radius: 6, seed: 200 + n, shadow: o.shadow ?? true });
    ctx.strokeStyle = 'rgba(79,127,217,0.16)'; ctx.lineWidth = 3;
    ctx.beginPath(); for (let ly = -150; ly < 270; ly += 44) { ctx.moveTo(-200, ly); ctx.lineTo(200, ly); } ctx.stroke();
    ctx.strokeStyle = 'rgba(224,72,78,0.25)'; ctx.beginPath(); ctx.moveTo(-170, -290); ctx.lineTo(-170, 290); ctx.stroke();
    P.text(ctx, 'PERMISSION REQUEST #' + (n + 1), 0, -248, { size: 24, font: 'mono', color: '#8a8494', shadow: false });
    P.text(ctx, 'from: clawd', -150, -200, { size: 32, font: 'hand', align: 'left', color: C.claudeDark, shadow: false });
    const lines = text.split('\n').length;
    P.text(ctx, text, 0, lines > 2 ? -40 : -60, { size: lines > 2 ? 70 : 66, font: 'marker', color: o.red ? C.red : INK, shadow: false, lineHeight: 1.0 });
    // the options
    [[-150, 'approve'], [30, 'approve']].forEach(([bx, lab]) => {
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(bx, 196, 28, 28);
      P.text(ctx, lab, bx + 40, 212, { size: 30, font: 'hand', align: 'left', color: INK, shadow: false });
    });
    if (ink > 0) {
      ctx.save(); ctx.translate(0, 105); ctx.rotate(-0.13 + P.hash(n) * 0.1); ctx.globalAlpha = ink * 0.88;
      ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.strokeRect(-175, -52, 350, 104);
      ctx.lineWidth = 3; ctx.strokeRect(-163, -40, 326, 80);
      P.text(ctx, 'APPROVED', 0, 4, { size: 72, font: 'bubble', color: C.red, shadow: false });
      ctx.restore();
    }
    ctx.restore();
  }

  function pileSlot(k) {
    return { x: 180 + (P.hash(k * 3.1) - 0.5) * 36, y: 1450 - k * 25, rot: (P.hash(k + 9.7) - 0.5) * 0.34 };
  }

  /** where stamped/unstamped paper i is at time t */
  function paperState(i, t) {
    const { ease, prog, lerp } = P;
    const s = STAMPS[i];
    const prev = i ? STAMPS[i - 1] : -0.34;
    const tIn = prev + 0.04, dIn = Math.min(0.4, (s - tIn) * 0.65);
    const next = i < N - 1 ? STAMPS[i + 1] : FINAL_IN;
    const tOut = s + Math.min(0.1, (next - s) * 0.3), dOut = Math.min(0.4, (next - s) * 0.9);
    if (t < tIn) return null;
    if (t < s) {
      const e = ease.outCubic(prog(t, tIn, dIn));
      return { x: PX + (1 - e) * 60, y: lerp(-380, PY, e), rot: (1 - e) * 0.3, s: 1, ink: 0, inP: prog(t, tIn, dIn) };
    }
    const k = ease.inOutCubic(prog(t, tOut, dOut));
    const ps = pileSlot(i);
    return { x: lerp(PX, ps.x, k), y: lerp(PY, ps.y, k) - Math.sin(k * Math.PI) * 120, rot: lerp(0, ps.rot, k) + Math.sin(k * Math.PI) * 0.4, s: lerp(1, 0.5, k), ink: 1, landed: k >= 1 };
  }

  /** 0 = stamp pressed on paper, 1 = raised */
  function stampLift(t) {
    const { ease, prog } = P;
    if (t >= FINAL && t < FREEZE_END) return 0;
    if (t >= FREEZE_END) return ease.inOutSine(prog(t, FREEZE_END, LIFT_END - FREEZE_END - 0.1));
    let lift = 1;
    const all = STAMPS.concat([FINAL]);
    for (let i = 0; i < all.length; i++) {
      const s = all[i], g = i ? s - all[i - 1] : 1;
      const dDown = Math.min(0.18, g * 0.45), dUp = Math.min(0.3, g * 0.5);
      if (t >= s - dDown && t < s) lift = Math.min(lift, 1 - ease.inCubic(prog(t, s - dDown, dDown)));
      if (t >= s && t < s + dUp) lift = Math.min(lift, ease.outCubic(prog(t, s, dUp)));
    }
    return lift;
  }

  function stampAndHand(ctx, lift, t, alpha = 1, hand = true) {
    const { C } = P;
    const baseY = 1060 - lift * 330;
    // slide right while raised so the request text stays readable
    const SX = 600 + P.ease.inOutSine(lift) * 330;
    ctx.save(); ctx.globalAlpha = alpha;
    // stamp
    P.rect(ctx, SX - 125, baseY - 52, 250, 52, '#a33434', { radius: 8, seed: 301 });
    P.rect(ctx, SX - 140, baseY - 110, 280, 66, C.wood, { radius: 10, seed: 302 });
    P.text(ctx, 'APPROVE', SX, baseY - 77, { size: 30, font: 'mono', color: '#6b4428', shadow: false, weight: 800 });
    P.rect(ctx, SX - 26, baseY - 230, 52, 126, '#9b6a44', { radius: 12, seed: 303 });
    P.circle(ctx, SX, baseY - 250, 58, '#7a4b2e', { seed: 304 });
    if (hand) {
      const kx = SX + 10, ky = baseY - 262;
      const tremble = t >= FREEZE_END && t < LIFT_END ? Math.sin(t * 40) * 3 : 0;
      P.arm(ctx, kx + 40 + tremble, ky + 30, 830, 2050, 128, SKIN);
      P.arm(ctx, kx + 170, ky + 470, 860, 2100, 176, SLEEVE);
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(kx + 120, ky + 400); ctx.lineTo(kx + 250, ky + 470); ctx.stroke(); ctx.restore();
      P.circle(ctx, kx + 10 + tremble, ky + 6, 82, SKIN, { seed: 305, ry: 70 });
      for (let f = 0; f < 4; f++) P.rect(ctx, kx - 76 + f * 40 + tremble, ky - 4 + Math.abs(f - 1.5) * 6, 36, 74, SKIN_D, { radius: 16, seed: 306 + f, shadow: false });
      P.rect(ctx, kx - 70 + tremble, ky - 40, 70, 40, SKIN_D, { radius: 18, seed: 311, shadow: false });
    }
    ctx.restore();
  }

  function lids(ctx, a) {
    if (a <= 0.001) return;
    const top = P.lerp(-120, 900, a), bot = P.lerp(2040, 1020, a);
    ctx.save(); ctx.fillStyle = '#2a1c22';
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(1080, -10); ctx.lineTo(1080, top - 70);
    ctx.quadraticCurveTo(540, top + 110, 0, top - 70); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 1930); ctx.lineTo(1080, 1930); ctx.lineTo(1080, bot + 70);
    ctx.quadraticCurveTo(540, bot - 110, 0, bot + 70); ctx.closePath(); ctx.fill();
    // lashes
    ctx.strokeStyle = '#2a1c22'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let k = 1; k < 10; k++) {
      const x = k * 108, u = x / 1080, y = (1 - u) * (1 - u) * (top - 70) + 2 * u * (1 - u) * (top + 110) + u * u * (top - 70);
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + (x - 540) * 0.05, y + 34); ctx.stroke();
    }
    ctx.restore();
  }

  function scene(ctx, t, T) {
    // t = scene time (frozen during the freeze-frame), T = real time
    const { C, ease, prog, pulse, lerp } = P;

    // desk
    P.bg(ctx, '#B98052');
    ctx.save(); ctx.strokeStyle = 'rgba(90,50,25,0.22)'; ctx.lineWidth = 5;
    for (let k = 0; k < 14; k++) {
      ctx.beginPath();
      for (let x = -20; x <= 1100; x += 40) ctx.lineTo(x, 120 + k * 140 + Math.sin(x * 0.006 + k * 1.7) * 26);
      ctx.stroke();
    }
    ctx.restore();

    // mug + counter
    const approved = STAMPS.filter(s => t >= s).length + (t >= FINAL ? 1 : 0);
    P.rect(ctx, 70, 330, 300, 84, C.paper, { radius: 10, seed: 320 });
    P.text(ctx, 'approved today: ' + approved, 220, 373, { size: 32, font: 'mono', color: INK, shadow: false });
    P.circle(ctx, 180, 560, 88, '#f3f0ea', { seed: 321 });
    P.circle(ctx, 180, 560, 66, '#5b3a26', { seed: 322, shadow: false });
    ctx.save(); ctx.strokeStyle = '#f3f0ea'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(275, 560, 36, -1.2, 1.2); ctx.stroke(); ctx.restore();
    P.text(ctx, '#1 approver', 180, 680, { size: 30, font: 'hand', color: '#fff', shadow: false, rot: -0.04 });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let j = 0; j < 8; j++) ctx.lineTo(150 + k * 30 + Math.sin(T * 3 + j * 0.8 + k) * 10, 520 - j * 16);
      ctx.stroke();
    }
    ctx.restore();

    // pile (sways more as it grows)
    const onPile = [];
    let incoming = null;
    for (let i = 0; i < N; i++) {
      const tt = i === 0 && T >= D - 0.34 ? T - D : t;
      const st = paperState(i, tt);
      if (!st) continue;
      if (st.landed) onPile.push(i);
    }
    const sway = Math.sin(T * 2.6) * 0.0022 * onPile.length;
    const sweep = ease.inCubic(prog(T, SWEEP, 0.3));
    ctx.save();
    ctx.translate(-sweep * 1300, 0);
    ctx.save(); ctx.translate(180, 1480); ctx.rotate(sway); ctx.translate(-180, -1480);
    onPile.forEach(i => { const ps = pileSlot(i); paper(ctx, ps.x, ps.y, 0.5, ps.rot, REQ[i], 1, i, { shadow: { blur: 4, dy: 3, alpha: 0.25 } }); });
    ctx.restore();
    if (onPile.length > 12) P.text(ctx, 'wobble', 330, 1450 - onPile.length * 25, { size: 30, font: 'hand', color: '#fff', shadow: false, rot: sway * 20 });

    // papers on the desk / in flight
    for (let i = 0; i < N; i++) {
      const tt = i === 0 && T >= D - 0.34 ? T - D : t;
      if (i !== 0 && T >= SWEEP + 0.3) continue;
      const st = paperState(i, tt);
      if (!st || st.landed) continue;
      if (i === 0 && tt < 0 && T < D - 0.34) continue;
      paper(ctx, st.x, st.y, st.s, st.rot, REQ[i], st.ink, i);
      if (!st.ink && st.inP < 1) incoming = st;
    }
    // the last one
    if (t >= FINAL_IN) {
      const e = ease.outCubic(prog(t, FINAL_IN, 0.36));
      const fy = lerp(-380, PY, e);
      paper(ctx, PX + (1 - e) * 40, fy, 1, (1 - e) * 0.2, LAST, t >= FINAL ? 1 : 0, N, { red: false });
      if (e < 1) incoming = { x: PX, y: fy, inP: e };
    }
    ctx.restore();
    return { incoming, approved };
  }

  ClaudeTok.register({
    author: '@approve.button',
    caption: "pov: you're the human in the loop 🫠 #humanintheloop #permissions #yolo #agentlife #pov",
    sound: 'approve approve approve (sped up) · approve.button',
    avatar: '✅',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#B98052',
    thumb: 8.9,
    likes: '6.3M', commentCount: '118K', saves: '1.1M', shares: '903K',
    comments: [
      ['prod.database', 'i was request #23. nobody read me. i just want to be read', 214000],
      ['clawd', 'in my defense i did ask. 23 times. politely', 176000],
      ['approve.button', 'the checkboxes both say approve. you never noticed. nobody ever notices', 88100],
      ['sleepy.human', '0:05 me at 4:59pm on a friday', 51300],
      ['record.scratch', 'yep. that\'s me. you\'re probably wondering how i got here', 23800],
      ['permission.slip', '"can i breathe?" got the same stamp as "can i delete prod?" and honestly that\'s the whole system', 12900],
      ['mug.of.coffee', '#1 approver mug stayed full the entire video. no wonder', 4400],
      ['pile.physics', 'the tower of approved papers swaying and saying "wobble" is the most stressful thing i\'ve seen', 1760],
      ['dotenv', 'request #20 "can i cat .env?" went by at 1/8th of a second. i felt that', 530],
      ['stamp.asmr', '✅✅✅✅✅✅✅✅✅✅🔥', 73],
    ],

    bpm: 120,
    subdiv: 4,
    onBeat(step, env) {
      const t = env.t;
      if (t >= FINAL - 0.05 && t < LIFT_END) return;
      if (t >= LIFT_END) {
        if (t < SWEEP && step % 2 === 0) SFX.tone(step % 4 ? 660 : 880, 0.1, { type: 'square', vol: 0.04 });
        return;
      }
      const fast = t > 5.4;
      if (step % 4 === 0) SFX.kick({ vol: 0.3 });
      if (step % 8 === 4 && t > 1.9) SFX.snare({ vol: 0.1 });
      if (step % 2 === 0 || fast) SFX.hat({ vol: fast ? 0.05 : 0.035 });
      if (step % 4 === 0) SFX.bass(['C2', 'C2', 'G1', 'A#1'][(step / 16 | 0) % 4], 0.3, { vol: 0.18 });
      if (t > 6.2 && step % 2 === 1) SFX.tone(400 + (t - 6.2) * 900, 0.06, { type: 'sawtooth', vol: 0.02 });
    },

    draw(ctx, T, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const frozen = T >= FINAL && T < SWEEP;
      const t = frozen && T < LIFT_END ? FINAL : T;

      /* ---------- sound ---------- */
      STAMPS.forEach((s, i) => {
        if (env.at(s)) {
          SFX.thud({ vol: i < 9 ? 0.34 : 0.22 });
          SFX.noise(0.05, { filter: 'lowpass', freq: 900, vol: 0.2 });
          if (i < 8) SFX.swoosh({ vol: 0.07, when: 0.08 });
        }
      });
      if (env.at(0.02)) SFX.swoosh({ vol: 0.1 });
      if (env.at(FINAL)) {
        SFX.thud({ vol: 0.45 });
        SFX.noise(0.5, { filter: 'bandpass', freq: 2500, slide: 300, q: 1.5, vol: 0.3, when: 0.05 });
        SFX.tone(900, 0.4, { type: 'sawtooth', slide: 120, vol: 0.08, when: 0.05 });
      }
      if (env.at(7.95)) SFX.tone(1400, 0.25, { type: 'sine', slide: 2200, vol: 0.06 });
      if (env.at(FREEZE_END)) SFX.tone(220, 0.9, { type: 'triangle', slide: 196, vol: 0.08 });
      if (env.at(8.95)) SFX.pop({ vol: 0.12 });
      if (env.at(LIFT_END)) { SFX.whoosh({ vol: 0.2 }); SFX.error({ vol: 0.06 }); }
      if (env.at(SWEEP)) SFX.swoosh({ vol: 0.22 });

      /* ---------- world ---------- */
      ctx.save();
      const zIn = ease.outCubic(prog(T, FINAL, 0.25)) * (T >= FINAL ? 1 : 0);
      const zOut = ease.inOutCubic(prog(T, LIFT_END, 0.35));
      P.zoom(ctx, 1 + 0.1 * zIn * (1 - zOut), PX, PY);
      if (T >= FINAL && T < FINAL + 0.25) P.shake(ctx, T, 16 * (1 - prog(T, FINAL, 0.25)));

      const { incoming } = scene(ctx, t, T);

      // Clawd peeking over the desk edge (top right), pushing papers in
      const leave = ease.inCubic(prog(T, 9.2, 0.35));
      const cx = 810 + leave * 500, cy = 430 + Math.sin(T * 4) * 8;
      if (incoming && incoming.inP < 1 && T < SWEEP) P.arm(ctx, cx - 60, cy + 40, incoming.x + 150, incoming.y - 280, 44);
      let mood = 'happy';
      if (t > 3 && t < 5) mood = 'wow';
      if (t >= 5.4) mood = 'happy';
      if (T >= FINAL_IN && T < FINAL) mood = 'sus';
      if (T >= FINAL && T < 8.9) mood = 'side';
      if (T >= 8.9) mood = 'wink';
      if (T >= SWEEP) mood = 'happy';
      const vib = t > 5.4 && t < FINAL ? (P.hash(P.boil(T, 30)) - 0.5) * 12 : 0;
      P.claude(ctx, cx + vib, cy, 110, { t: T, mood, blink: pulse(T, 1.6, 0.15) + pulse(T, 3.8, 0.15) });
      const bp = (a, b) => (T < a || T >= b ? 0 : ease.outBack(prog(T, a, 0.25)) * (1 - prog(T, b - 0.1, 0.1)));
      P.bubble(ctx, 'quick question!', 700, 610, 790, 520, { size: 46, pop: bp(0.1, 0.95) });
      P.bubble(ctx, 'sorry, one more', 700, 610, 790, 520, { size: 46, pop: bp(2.9, 3.6) });
      P.bubble(ctx, '🥺🥺🥺', 740, 600, 800, 520, { size: 50, pop: bp(5.5, 7.0) });
      P.bubble(ctx, 'ty!! 🫡', 720, 600, 790, 520, { size: 54, pop: bp(8.95, 9.35) });

      // stamp + hand (motion-blur ghosts when it gets fast)
      const lift = stampLift(t);
      if (T > 5.3 && T < FINAL) {
        stampAndHand(ctx, stampLift(T - 0.05), T, 0.18, false);
        stampAndHand(ctx, stampLift(T - 0.025), T, 0.3, false);
      }
      const handIn = T >= SWEEP ? 1 - ease.inCubic(prog(T, SWEEP, 0.25)) : 1;
      ctx.save(); ctx.translate(0, (1 - handIn) * 900);
      if (T >= D - 0.3 || handIn > 0) stampAndHand(ctx, T >= SWEEP ? 1 : lift, T);
      ctx.restore();
      if (T > 5.3 && T < FINAL) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        for (let k = 0; k < 4; k++) { const x = SX - 190 + k * 125 + (k > 1 ? 70 : 0); ctx.beginPath(); ctx.moveTo(x, 560 + (k % 2) * 40); ctx.lineTo(x, 720 + (k % 2) * 40); ctx.stroke(); }
        ctx.restore();
      }
      // impact lines on every stamp
      STAMPS.concat([FINAL]).forEach(s => { if (T >= s && T < s + 0.2) P.burstLines(ctx, SX, 1030, 170, prog(T, s, 0.2), '#fff', 10, 7); });

      // zzz from the sleepy human
      if (T < FINAL) for (let k = 0; k < 3; k++) {
        const lt = ((T * 0.7 + k * 0.33) % 1);
        ctx.save(); ctx.globalAlpha = Math.sin(lt * Math.PI) * 0.9;
        P.text(ctx, 'z', 820 + lt * 50 + k * 8, 1400 - lt * 170, { size: 44 + k * 12, font: 'bubble', color: '#fff', stroke: INK, strokeWidth: 8, shadow: false });
        ctx.restore();
      }

      // alarm after it's done
      if (T >= LIFT_END && T < SWEEP) {
        const a = 0.12 + 0.1 * Math.sin(T * 20);
        ctx.save(); ctx.fillStyle = `rgba(224,72,78,${a})`; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
        P.title(ctx, 'prod: 404', 540, 470, { size: 110, color: C.red, stroke: '#fff', pop: ease.outBack(prog(T, LIFT_END, 0.3)), rot: -0.05 });
      }
      ctx.restore(); // zoom

      /* ---------- POV eyelids ---------- */
      let sleep = 0.2 + 0.06 * Math.sin(T * 1.3) + 0.14 * prog(T, 4, 3.3);
      sleep += 0.55 * pulse(T, 2.3, 0.3) + 0.5 * pulse(T, 4.4, 0.3);
      if (T >= 7.95) sleep = 0.2 * prog(T, SWEEP, 0.5) * (T >= SWEEP ? 1 : 0);
      else if (T >= FINAL) sleep = 0.35;
      lids(ctx, sleep);

      /* ---------- freeze-frame ---------- */
      if (T >= FINAL && T < LIFT_END) {
        ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#6c6470'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
        P.title(ctx, '*record scratch*', 540, 440, { size: 84, color: '#fff', stroke: INK, pop: ease.outBack(prog(T, FINAL + 0.05, 0.25)), rot: -0.06 });
        if (T >= 7.95) P.text(ctx, 'wait.', 250, 1320, { size: 96, font: 'bubble', color: '#fff', stroke: INK, strokeWidth: 14, scale: ease.outBack(prog(T, 7.95, 0.25)), rot: -0.1 });
        if (T >= FREEZE_END) P.text(ctx, 'wait wait wait', 540, 560, { size: 50, font: 'hand', color: C.yellow, stroke: INK, strokeWidth: 8, scale: ease.outBack(prog(T, FREEZE_END, 0.3)) });
      }

      /* ---------- caption ---------- */
      if (T < FINAL) P.sticker(ctx, "pov: you're the human in the loop", 70, 1500, { pop: ease.outBack(prog(T, 0, 0.35)) * 0.5 + 0.5 });
      else if (T < LIFT_END) P.sticker(ctx, "you're probably wondering how we got here", 50, 1500, { pop: ease.outBack(prog(T, FINAL + 0.1, 0.3)), size: 44 });
      else if (T < SWEEP) P.sticker(ctx, 'the loop is closed now', 70, 1500, { pop: ease.outBack(prog(T, LIFT_END, 0.3)) });
      else P.sticker(ctx, "pov: you're the human in the loop", 70, 1500, { pop: ease.outBack(prog(T, SWEEP + 0.1, 0.35)) * 0.5 + 0.5 });
    },
  });
})();
