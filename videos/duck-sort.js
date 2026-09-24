/* Bubble sort, but every element is a rubber duck and every swap is a QUACK. */
(function () {
  const INIT = [5, 2, 6, 1, 4, 3];          // duck sizes (rank 1..6)
  const N = INIT.length;
  const WL = 1040;                           // water line
  const slotX = (i) => 190 + i * 140;
  const scaleOf = (rank) => 0.55 + rank * 0.09;

  // precompute the bubble sort schedule (comparisons + swaps), speeding up as it goes
  const steps = [];
  {
    const arr = INIT.slice();
    let tt = 0.85, idx = 0;
    for (let pass = 0; pass < N - 1; pass++) {
      let swapped = false;
      for (let i = 0; i < N - 1 - pass; i++) {
        const swap = arr[i] > arr[i + 1];
        const d = (swap ? 0.6 : 0.3) * Math.pow(0.965, idx++);
        steps.push({ t0: tt, d, i, swap, pass });
        if (swap) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; swapped = true; }
        tt += d;
      }
      if (!swapped) break;
    }
  }
  const SORTED_T = steps[steps.length - 1].t0 + steps[steps.length - 1].d + 0.1;
  const DUR = Math.round((SORTED_T + 2.3) * 10) / 10;
  const DIVE_T = DUR - 0.62;

  /** Rubber duck facing right, body centered at (x, y). */
  function duck(ctx, x, y, s, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot || 0);
    ctx.scale(s * (1 + (o.squash || 0) * 0.2), s * (1 - (o.squash || 0) * 0.2));
    // tail
    P.poly(ctx, [[-50, -10], [-82, -44], [-40, -30]], C_DUCK, { seed: o.seed || 1, amp: 2, shadow: false });
    // body
    P.circle(ctx, 0, 0, 62, C_DUCK, { ry: 42, seed: o.seed || 1, amp: 2 });
    // wing
    P.circle(ctx, -12, -4, 30, '#E8B53A', { ry: 18, seed: (o.seed || 1) + 5, amp: 2, shadow: false });
    // head
    P.circle(ctx, 30, -52, 32, C_DUCK, { seed: (o.seed || 1) + 9, amp: 2, shadow: { blur: 6, dy: 3, alpha: 0.18 } });
    // beak
    const open = o.quack || 0;
    P.poly(ctx, [[54, -60], [86, -54 - open * 6], [58, -46]], P.C.claude, { amp: 1, shadow: false });
    if (open > 0.05) P.poly(ctx, [[56, -46], [82, -38 + open * 8], [54, -40]], P.C.claudeDark, { amp: 1, shadow: false });
    // eye
    P.dot(ctx, 38, -62, 6, P.C.ink);
    P.dot(ctx, 36, -64, 2.2, '#fff');
    ctx.fillStyle = 'rgba(240,110,120,0.45)';
    ctx.beginPath(); ctx.ellipse(28, -44, 8, 5, 0, 0, P.TAU); ctx.fill();
    ctx.restore();
  }
  const C_DUCK = '#F7D047';

  const qk = (s, when) => {
    SFX.tone(640 / s, 0.14, { type: 'sawtooth', slide: 400 / s, vol: 0.1, when });
    SFX.noise(0.12, { filter: 'bandpass', freq: 1300 / s, q: 4, vol: 0.1, when });
  };

  ClaudeTok.register({
    author: '@rubberduck.dev',
    caption: 'bubble sort but make it ducks 🦆 O(quack²) #sorting #algorithms #rubberduck #asmr',
    sound: 'oom-pah bubble sort · rubberduck.dev',
    avatar: '🦆',
    avatarColor: '#E5A93B',
    duration: DUR,
    bg: '#8EC9E8',
    thumb: 3.1,
    likes: '2.3M', commentCount: '45K', saves: '310K', shares: '128K',
    comments: [
      ['quick.sort', 'O(n²) behavior tbh', 69800],
      ['merge.sort', 'divide and quack', 52100],
      ['claude', 'i explained my bug to the big one and fixed it mid-swap', 38400],
      ['the.actual.duck', 'as the size-1 duck i want everyone to know i started in slot 4 and i earned the front of the line', 24700],
      ['rubberduck.dev', 'yes every quack is pitched to the duck size. yes it took a whole day', 13100],
      ['big.o.bouncer', '"0 swaps left. peace." should be printed on every CI badge', 7900],
      ['heap.sort.hater', 'actually bubble sort would stop one pass earlier if you tracked— *gets quacked at*', 3600],
      ['pond.ops', 'me when the ducks all dive at the end and the loop restarts unsorted 😐', 1450],
      ['lily.pad.ref', 'clawd refereeing from the lily pad with the ≤ badge is peak officiating', 520],
      ['bath.time.bot', '🦆🦆🦆🦆🦆🦆', 73],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t > DIVE_T) return;
      const roots = ['C2', 'G1', 'F1', 'G1'];
      const chords = [['C4', 'E4', 'G4'], ['B3', 'D4', 'G4'], ['A3', 'C4', 'F4'], ['B3', 'D4', 'G4']];
      const bar = Math.floor(step / 8) % 4;
      if (step % 2 === 0) SFX.bass(step % 4 === 0 ? roots[bar] : 'G2', 0.22, { vol: 0.16 });
      else SFX.chord(chords[bar], 0.14, { type: 'triangle', vol: 0.035 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      // ---- scene: sky, hills, pond, grass
      P.gradient(ctx, '#9fd4f0', '#d8f0fb');
      [[200, 470, 0.9], [760, 400, 1.1], [520, 560, 0.7]].forEach(([x, y, s], i) =>
        P.cloud(ctx, x + Math.sin(t * 0.5 + i * 2) * 30, y, s));
      P.circle(ctx, 180, 900, 380, '#7cc47f', { ry: 220, seed: 3, shadow: false });
      P.circle(ctx, 880, 880, 420, '#6db870', { ry: 240, seed: 4, shadow: false });
      P.rect(ctx, -40, 800, 1160, 1200, '#5DB36A', { radius: 0, seed: 5, shadow: false });
      P.circle(ctx, 540, 1090, 600, '#4F9FD9', { ry: 280, seed: 6, amp: 6, shadow: { blur: 12, dy: -4, alpha: 0.2 } });
      P.circle(ctx, 540, 1110, 560, '#5aabe0', { ry: 240, seed: 7, amp: 6, shadow: false });
      // reeds
      [[60, 1000], [95, 1030], [990, 990], [1030, 1020]].forEach(([x, y], i) => {
        const sw = Math.sin(t * 1.5 + i) * 8;
        ctx.save(); ctx.strokeStyle = '#3f8a4a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y + 60); ctx.quadraticCurveTo(x, y - 60, x + sw, y - 150); ctx.stroke(); ctx.restore();
        P.rect(ctx, x + sw - 11, y - 190, 22, 70, C.brown, { radius: 11, seed: i + 20 });
      });
      // lily pads
      P.circle(ctx, 250, 1300, 90, '#3f9a55', { ry: 34, seed: 30 });
      P.circle(ctx, 820, 1250, 60, '#3f9a55', { ry: 24, seed: 31 });
      P.circle(ctx, 838, 1236, 18, C.pink, { seed: 32, shadow: false });

      // ---- where is every duck right now?
      let arr = INIT.slice();
      let active = null, swaps = 0, pass = 0;
      for (const s of steps) {
        if (t >= s.t0 + s.d) {
          if (s.swap) { [arr[s.i], arr[s.i + 1]] = [arr[s.i + 1], arr[s.i]]; swaps++; }
          pass = s.pass;
        } else if (t >= s.t0) { active = s; pass = s.pass; break; }
        else break;
      }
      const sorted = t >= SORTED_T;

      // spotlight under the compared pair
      if (active) {
        const a = ease.outBack(prog(t, active.t0, 0.15));
        const mx = (slotX(active.i) + slotX(active.i + 1)) / 2;
        ctx.save(); ctx.globalAlpha = 0.35 * a;
        ctx.fillStyle = C.yellow;
        ctx.beginPath(); ctx.ellipse(mx, WL + 14, 170 * a, 44 * a, 0, 0, P.TAU); ctx.fill();
        ctx.restore();
        // literal bubbles rising between them
        for (let b = 0; b < 5; b++) {
          const bp = P.clamp((t - active.t0) / active.d * 1.4 - b * 0.12);
          if (bp <= 0 || bp >= 1) continue;
          const bx = mx + (P.hash(b + active.i * 7) - 0.5) * 120 + Math.sin(bp * 9 + b) * 10;
          ctx.save(); ctx.globalAlpha = 1 - bp; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(bx, WL + 30 - bp * 90, 8 + b * 2, 0, P.TAU); ctx.stroke(); ctx.restore();
        }
      }

      // ---- ducks
      const drawList = [];
      for (let slot = 0; slot < N; slot++) {
        const rank = arr[slot];
        let x = slotX(slot), lift = 0, squash = 0, rot = 0, quack = 0, z = 0;
        if (active && active.swap && (slot === active.i || slot === active.i + 1)) {
          const hp = prog(t, active.t0 + 0.08, active.d - 0.14);
          const e = ease.inOutCubic(hp);
          const goingRight = slot === active.i;
          x = lerp(slotX(slot), slotX(goingRight ? slot + 1 : slot - 1), e);
          lift = Math.sin(hp * Math.PI) * (goingRight ? 190 : 60);
          rot = goingRight ? (hp - 0.5) * 0.55 * Math.sin(hp * Math.PI) : -Math.sin(hp * Math.PI) * 0.12;
          squash = pulse(t, active.t0, 0.12) * 0.8 - pulse(t, active.t0 + 0.12, 0.2) * 0.6 + pulse(t, active.t0 + active.d - 0.1, 0.16) * 0.9;
          quack = goingRight ? pulse(t, active.t0 + 0.06, 0.3) : 0;
          z = goingRight ? 1 : 0;
        }
        // sorted celebration: a wave of hops + quacks
        const cel = pulse(t, SORTED_T + 0.35 + slot * 0.11, 0.34);
        if (sorted) { lift += cel * 70; quack = Math.max(quack, cel); }
        // emerge at loop start, dive at the end
        const up = ease.outBack(prog(t, 0.05 + slot * 0.06, 0.42));
        const dive = ease.inCubic(prog(t, DIVE_T + slot * 0.05, 0.3));
        const sink = (1 - up) * 170 + dive * 170;
        drawList.push({ slot, rank, x, lift, squash, rot, quack, z, sink });
      }
      drawList.sort((a, b) => a.z - b.z);
      drawList.forEach((d) => {
        const s = scaleOf(d.rank);
        const bob = Math.sin(t * 2.4 + d.slot * 1.3) * 5;
        const y = WL - 22 * s + bob - d.lift + d.sink;
        // ripple ring on the water
        const rp = (t * 0.8 + d.slot * 0.37) % 1;
        ctx.save(); ctx.globalAlpha = 0.45 * (1 - rp) * (1 - d.lift / 200);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(d.x, WL + 16, 60 * s + rp * 50, 14 * s + rp * 12, 0, 0, P.TAU); ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, 1080, WL + 10); ctx.clip();
        duck(ctx, d.x, y, s, { seed: d.rank * 3, squash: d.squash, rot: d.rot, quack: d.quack });
        ctx.restore();
        if (d.lift > 20 && d.z) {
          // splash shadow under the hopping duck
          ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#1d4f7a';
          ctx.beginPath(); ctx.ellipse(d.x, WL + 16, 55 * s, 12 * s, 0, 0, P.TAU); ctx.fill(); ctx.restore();
        }
      });
      // splash rings where ducks come up / go down
      for (let slot = 0; slot < N; slot++) {
        [0.12 + slot * 0.06, DIVE_T + slot * 0.05 + 0.22].forEach((st) => {
          const sp = prog(t, st, 0.5);
          if (sp <= 0 || sp >= 1) return;
          ctx.save(); ctx.globalAlpha = 1 - sp; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.ellipse(slotX(slot), WL + 12, 40 + sp * 90, 10 + sp * 20, 0, 0, P.TAU); ctx.stroke(); ctx.restore();
        });
      }

      // ---- comparison badge above the pair
      if (active) {
        const mx = (slotX(active.i) + slotX(active.i + 1)) / 2;
        const bp = ease.outBack(prog(t, active.t0, 0.18)) * (1 - prog(t, active.t0 + active.d - 0.08, 0.08));
        if (bp > 0.01) {
          ctx.save(); ctx.translate(mx, 690); ctx.scale(bp, bp); ctx.rotate(active.swap ? -0.08 : 0.06);
          P.circle(ctx, 0, 0, 56, active.swap ? C.rose : C.green, { seed: active.i + 40 });
          P.text(ctx, active.swap ? '>' : '≤', 0, 2, { size: 80, font: 'bubble', color: '#fff', shadow: false });
          ctx.restore();
        }
      }
      // sounds for every step
      steps.forEach((s) => {
        if (env.at(s.t0)) SFX.tick({ vol: 0.25 });
        if (s.swap && env.at(s.t0 + 0.06)) SFX.quack({ vol: 0.17 });
        if (s.swap && env.at(s.t0 + s.d - 0.08)) SFX.noise(0.18, { filter: 'lowpass', freq: 1400, slide: 250, vol: 0.14 });
        if (!s.swap && env.at(s.t0 + 0.05)) SFX.pluck('E5', { vol: 0.08 });
      });
      for (let slot = 0; slot < N; slot++) {
        if (env.at(0.12 + slot * 0.06)) SFX.pop({ f: 380 + slot * 60, vol: 0.1 });
        if (env.at(SORTED_T + 0.35 + slot * 0.11)) qk(scaleOf(slot + 1), 0);
      }
      if (env.at(SORTED_T)) SFX.success({ vol: 0.16 });
      if (env.at(DIVE_T)) SFX.noise(0.5, { filter: 'lowpass', freq: 1800, slide: 200, vol: 0.14 });

      // ---- header tag
      const hp = ease.outBack(prog(t, 0.3, 0.4));
      ctx.save(); ctx.translate(540, 340); ctx.scale(hp, hp); ctx.rotate(-0.02);
      P.rect(ctx, -260, -44, 520, 88, sorted ? C.green : C.paper, { radius: 20, seed: 8 });
      P.text(ctx, sorted ? '0 swaps left. peace.' : `pass ${pass + 1} · swaps: ${swaps}`, 0, 2, {
        size: 44, font: sorted ? 'bubble' : 'mono', color: sorted ? '#fff' : C.ink, shadow: false,
      });
      ctx.restore();

      // ---- payoff title
      const tp = ease.outBack(prog(t, SORTED_T, 0.5)) * (1 - ease.inCubic(prog(t, DIVE_T - 0.15, 0.3)));
      if (sorted && tp > 0.01) {
        P.title(ctx, 'sorted ✓', 540, 560 + Math.sin(t * 3) * 8, { size: 150, color: C.yellow, rot: -0.04, pop: tp });
        P.confetti(ctx, t - SORTED_T, 540, 560, 11, 70, 700);
      }

      // ---- Clawd, referee on the lily pad
      const cHop = sorted ? Math.abs(Math.sin((t - SORTED_T) * 6)) * 30 * (1 - prog(t, DIVE_T, 0.3)) : 0;
      P.claude(ctx, 250, 1236 - cHop + Math.sin(t * 2) * 3, 80, {
        t, mood: sorted ? 'happy' : active && active.swap ? 'wow' : 'side',
        blink: pulse(t, 2.1, 0.15) + pulse(t, 5.4, 0.15),
      });
      const bubP = sorted ? ease.outBack(prog(t, SORTED_T + 0.8, 0.3)) * (1 - prog(t, DIVE_T, 0.2)) : 0;
      if (bubP > 0.01) P.bubble(ctx, 'O(quack²)', 520, 1330, 330, 1260, { size: 50, pop: bubP });

      P.sticker(ctx, 'bubble sort but ducks 🦆', 70, 1530, { pop: ease.outBack(prog(t, 0.5, 0.4)) });
    },
  });
})();
