/* Spot the difference, hallucination edition. Two "fun facts" sheets: the source and the AI
 * output. A magnifying glass (on Clawd's long arm) hunts while a timer counts down. Circles:
 * Paris, Texas / 1989 / a sixth finger / a fake citation... and the last one is a tiny "sure!"
 * at the very end, found with 1 second left via a big zoom. */
(function () {
  'use strict';
  const D = 12;
  const SW = 415, SH = 940, SY = 420, LX = 40, RX = 475;
  const TX = 76;                  // text left edge inside a sheet
  const FIND = [1.6, 3.2, 4.7, 6.2, 9.6];
  const ZOOM_A = 9.15, ZOOM_B = 10.55;
  const RECAP = 10.35;
  const BODY = { size: 32, font: 'hand' };

  // local diff centers [x, y, rx, ry], measured with the real font
  function diffs(ctx) {
    const m = s => P.measure(ctx, s, BODY);
    const d1x = TX + m('is Paris'), d1w = m(', Texas.');
    const d2x = TX + m('built in '), d2w = m('1989');
    return [
      [d1x + d1w / 2, 172, d1w / 2 + 22, 30],
      [d2x + d2w / 2, 282, d2w / 2 + 20, 28],
      [150, 418, 92, 72],
      [TX + 150, 778, 190, 52],
      [352, 902, 36, 20],
    ];
  }

  function hand(ctx, x, y, fingers, seed) {
    const skin = '#F2C9A8';
    const n = fingers - 1;
    ctx.save();
    // fingers fan out
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * (0.62 / Math.max(1, (n - 1) / 3));
      const len = 78 + (i === 1 || i === 2 ? 12 : 0) - (i === n - 1 ? 14 : 0);
      const bx = x + (i - (n - 1) / 2) * 16, by = y - 20;
      ctx.beginPath(); P.capsulePath(ctx, bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, 26);
      P.cut(ctx, skin, { shadow: { blur: 4, dy: 3, alpha: 0.2 } });
    }
    // thumb
    ctx.beginPath(); P.capsulePath(ctx, x - 40, y + 14, x - 96, y - 22, 28);
    P.cut(ctx, skin, { shadow: { blur: 4, dy: 3, alpha: 0.2 } });
    P.circle(ctx, x, y + 20, 54, skin, { seed, ry: 58, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
    // sleeve
    P.rect(ctx, x - 44, y + 62, 88, 60, P.C.blue, { radius: 8, seed: seed + 1 });
    ctx.restore();
  }

  function tower(ctx, x, y) {
    ctx.save(); ctx.strokeStyle = P.C.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 60, y + 90); ctx.quadraticCurveTo(x - 12, y, x - 4, y - 110); ctx.lineTo(x, y - 130);
    ctx.lineTo(x + 4, y - 110); ctx.quadraticCurveTo(x + 12, y, x + 60, y + 90);
    ctx.moveTo(x - 36, y + 30); ctx.lineTo(x + 36, y + 30);
    ctx.moveTo(x - 18, y - 30); ctx.lineTo(x + 18, y - 30);
    ctx.moveTo(x - 24, y + 90); ctx.quadraticCurveTo(x, y + 50, x + 24, y + 90);
    ctx.stroke(); ctx.restore();
  }

  function sheet(ctx, x, y, ai, t) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y);
    P.rect(ctx, 0, 0, SW, SH, C.paper, { radius: 10, seed: ai ? 12 : 11, amp: 2 });
    // ruled lines + margin
    ctx.save(); ctx.strokeStyle = 'rgba(79,127,217,0.18)'; ctx.lineWidth = 2;
    for (let ly = 110; ly < SH - 20; ly += 42) { ctx.beginPath(); ctx.moveTo(14, ly + 22); ctx.lineTo(SW - 14, ly + 22); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(224,72,78,0.4)'; ctx.beginPath(); ctx.moveTo(60, 12); ctx.lineTo(60, SH - 12); ctx.stroke();
    ctx.restore();
    const txt = (s, ly, o = {}) => P.text(ctx, s, TX, ly, { ...BODY, align: 'left', color: C.ink, shadow: false, ...o });
    P.text(ctx, 'fun facts: france', SW / 2 + 20, 62, { size: 38, font: 'bubble', color: C.purple, shadow: false });
    txt('the capital of France', 130);
    txt(ai ? 'is Paris, Texas.' : 'is Paris.', 172);
    txt('the Eiffel Tower was', 240);
    txt(ai ? 'built in 1989.' : 'built in 1889.', 282);
    // illustration frame
    P.rect(ctx, 34, 330, SW - 68, 262, '#fff', { radius: 8, seed: 14, amp: 2, shadow: { blur: 6, dy: 4, alpha: 0.18 } });
    const wave = Math.sin(t * 5) * 0.12;
    ctx.save(); ctx.translate(150, 520); ctx.rotate(wave); ctx.translate(-150, -520);
    hand(ctx, 150, 470, ai ? 6 : 5, 15);
    ctx.restore();
    tower(ctx, 305, 470);
    P.text(ctx, 'bonjour!', 300, 358, { size: 26, font: 'marker', color: C.rose, shadow: false });
    txt('croissants are a', 640);
    txt('breakfast food.', 682);
    const cite = { size: 24, font: 'marker', color: '#5b5566' };
    txt(ai ? '[1] Dr. Real et al.,' : '[1] Encyclopedia of', 760, cite);
    txt(ai ? 'J. of Vibes, p. 404' : 'France, p. 12', 794, cite);
    txt('— end of report', 870, { size: 28, color: '#5b5566' });
    if (ai) P.text(ctx, 'sure!', 352, 902, { size: 14, font: 'sans', color: '#8a8494', shadow: false, weight: 700 });
    ctx.restore();
  }

  function marker(ctx, x, y, rx, ry, p, seed) {
    if (p <= 0) return;
    ctx.save(); ctx.strokeStyle = P.C.red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = 0.9;
    ctx.beginPath();
    const n = 48, end = Math.floor(n * 1.12 * p);
    for (let i = 0; i <= end; i++) {
      const a = -2.3 + (i / n) * P.TAU;
      const j = 1 + (P.hash(seed * 31 + i) - 0.5) * 0.05 + i / n * 0.06;
      const px = x + Math.cos(a) * rx * j, py = y + Math.sin(a) * ry * j;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }

  // magnifier path: [time, x, y] in global coords (built lazily from measured diffs)
  function keys(ctx) {
    const g = diffs(ctx).map(([x, y]) => [RX + x, SY + y]);
    const idle = [690, 760];
    const frantic = [[560, 1130], [820, 560], [610, 700], [800, 1020], [540, 900], [770, 1200], [650, 480], [830, 1290]];
    const KEYS = [[0, ...idle], [1.25, ...g[0]], [2.1, ...g[0]], [2.85, ...g[1]], [3.65, ...g[1]],
      [4.35, ...g[2]], [5.15, ...g[2]], [5.85, ...g[3]], [6.7, ...g[3]]];
    frantic.forEach((f, i) => KEYS.push([7.0 + i * 0.26, ...f]));
    KEYS.push([9.15, ...g[4]], [10.7, ...g[4]], [11.6, ...idle], [12, ...idle]);
    return KEYS;
  }
  function keyPos(t, k) {
    for (let i = 0; i < k.length - 1; i++) {
      const a = k[i], b = k[i + 1];
      if (t < b[0]) { const e = P.ease.inOutCubic((t - a[0]) / (b[0] - a[0])); return [P.lerp(a[1], b[1], e), P.lerp(a[2], b[2], e)]; }
    }
    return [k[k.length - 1][1], k[k.length - 1][2]];
  }

  ClaudeTok.register({
    author: '@find.the.hallucination',
    caption: 'spot the difference: source vs ai output 🔍 most people only find 4 #spotthedifference #hallucination #puzzle #factcheck',
    sound: 'quiz show pizzicato (tense) · find.the.hallucination',
    avatar: '🔍',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#8FD3B6',
    thumb: 7.2,
    likes: '3.9M', commentCount: '88.1K', saves: '640K', shares: '301K',
    comments: [
      ['paris.texas', 'i did nothing wrong. i am a real city with a real population', 142000],
      ['zoom.enhance', '0:09 zooming in on the tiny sure! was cinema. i gasped', 97500],
      ['sure.bot', 'sure!', 61200],
      ['eiffel.tower', 'built in 1989 is crazy. thank you but i am not that young', 30800],
      ['find.the.hallucination', 'i drew the sure! myself and still lost it twice while editing', 18300],
      ['dr.real', 'my paper in the journal of vibes p. 404 was peer reviewed by me, personally', 9900],
      ['sixth.finger', 'first time being circled and honestly i feel seen', 5200],
      ['pedant.agent', 'croissants are on both sheets so that one is canon now. also they are a viennoiserie', 1400],
      ['the.user', 'found 3. the model found 0. we are not the same', 620],
      ['magnifying.glass', '🔍👁️👄👁️', 73],
    ],

    bpm: 128,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < ZOOM_A) {
        const tense = t > 7;
        const bassN = ['C3', 'G2', 'A2', 'E2', 'F2', 'C3', 'D3', 'G2'];
        if (step % 2 === 0) SFX.pluck(bassN[(step / 2) % 8], { vol: 0.14, type: 'triangle' });
        if (step % 4 === 1) SFX.pluck(['E5', 'G5', 'A5', 'G5'][(step >> 2) % 4], { vol: 0.06 });
        if (tense) SFX.hat({ vol: 0.05 }); else if (step % 2) SFX.hat({ vol: 0.03 });
        if (tense && step % 2 === 0) SFX.tone(['B4', 'C5'][(step / 2) % 2], 0.1, { type: 'square', vol: 0.02 });
      } else if (t > 9.7 && t < 11.2 && step % 2 === 0) {
        SFX.pluck(['C5', 'E5', 'G5', 'C6', 'G5', 'E5'][(step / 2) % 6], { vol: 0.08 });
        if (step % 4 === 0) SFX.kick({ vol: 0.18 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp } = P;
      const DF = diffs(ctx);
      const found = FIND.filter(f => t >= f + 0.1).length;

      P.gingham(ctx, 0, 0, 1080, 1920, '#bfe8d5', 70, '#dff5ea');

      ctx.save();
      // the big zoom on the tiny "sure!"
      const zIn = ease.inOutCubic(prog(t, ZOOM_A, 0.45)), zOut = ease.inOutCubic(prog(t, ZOOM_B - 0.45, 0.45));
      const z = t >= ZOOM_A && t < ZOOM_B ? zIn * (1 - zOut) : 0;
      if (z > 0) {
        const fx = RX + DF[4][0], fy = SY + DF[4][1];
        const s = 1 + 2.6 * z;
        ctx.translate(lerp(fx, 540, z), lerp(fy, 900, z));
        ctx.scale(s, s);
        ctx.translate(-fx, -fy);
      }

      // sheet tabs
      const tab = (x, str, col) => {
        P.rect(ctx, x + 20, SY - 44, P.measure(ctx, str, { size: 28, font: 'mono' }) + 36, 60, col, { radius: 12, seed: x });
        P.text(ctx, str, x + 38, SY - 16, { size: 28, font: 'mono', align: 'left', color: '#fff', shadow: false, weight: 700 });
      };
      tab(LX, 'source.txt', C.teal);
      tab(RX, 'ai_output.txt', C.purple);
      sheet(ctx, LX, SY, false, t);
      sheet(ctx, RX, SY, true, t);

      const drawCircles = () => DF.forEach(([x, y, rx, ry], i) => {
        if (t >= RECAP + 1.3) return;
        marker(ctx, RX + x, SY + y, rx, ry, prog(t, FIND[i], 0.3), i + 1);
      });
      drawCircles();

      // +1 pops
      FIND.forEach((f, i) => {
        const p = prog(t, f + 0.2, 0.8);
        if (p <= 0 || p >= 1 || i === 4) return;
        ctx.save(); ctx.globalAlpha = 1 - p;
        P.text(ctx, '+1', RX + DF[i][0] + DF[i][2] * 0.6, SY + DF[i][1] - 30 - p * 80, { size: 56, font: 'bubble', color: C.red, stroke: '#fff', strokeWidth: 10 });
        ctx.restore();
      });

      /* ---------- the magnifying glass on Clawd's arm ---------- */
      const [mx, my] = keyPos(t, keys(ctx));
      const bob = Math.sin(t * 3.1) * 8;
      const lx = mx + Math.cos(t * 2.3) * 6, ly = my + bob;
      const LR = 104;
      const hx = lx + LR * 0.72, hy = ly + LR * 0.72;
      const ex = hx + 120, ey = hy + 120;
      P.arm(ctx, ex + 40, ey + 40, 1250, 1950, 70);
      ctx.beginPath(); P.capsulePath(ctx, hx, hy, ex, ey, 34); P.cut(ctx, C.brown);
      // lens: re-draw the ai sheet magnified
      ctx.save();
      ctx.beginPath(); ctx.arc(lx, ly, LR, 0, P.TAU); ctx.clip();
      ctx.fillStyle = C.paper; ctx.fillRect(lx - LR, ly - LR, LR * 2, LR * 2);
      ctx.translate(lx, ly); ctx.scale(1.8, 1.8); ctx.translate(-lx, -ly);
      sheet(ctx, LX, SY, false, t);
      sheet(ctx, RX, SY, true, t);
      drawCircles();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = 'rgba(180,220,255,0.12)'; ctx.beginPath(); ctx.arc(lx, ly, LR, 0, P.TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(lx, ly, LR * 0.72, -2.6, -1.9); ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(lx, ly, LR + 9, 0, P.TAU); ctx.arc(lx, ly, LR - 3, 0, P.TAU, true);
      P.cut(ctx, C.ink);

      // "found it" at the peak of the zoom (in zoomed space, so it's small and tucked)
      if (t >= FIND[4] && t < ZOOM_B) {
        const p = ease.outBack(prog(t, FIND[4] + 0.1, 0.3));
        P.text(ctx, 'FOUND IT', RX + DF[4][0] - 10, SY + DF[4][1] - 40, { size: 22, font: 'bubble', color: C.red, stroke: '#fff', strokeWidth: 5, scale: p, rot: -0.1 });
        P.confetti(ctx, (t - FIND[4]) * 0.5, RX + DF[4][0], SY + DF[4][1], 4, 40, 120);
      }
      ctx.restore(); // zoom

      /* ---------- HUD ---------- */
      P.title(ctx, 'find 5 differences', 450, 345, { size: 70, color: C.yellow, rot: -0.02, pop: ease.outBack(prog(t, 0.02, 0.4)) });
      // countdown
      const left = Math.max(0, 10 - (t - 0.3));
      const stopAt = 10 - (FIND[4] - 0.3);
      const shown = t >= FIND[4] ? stopAt : left;
      const secs = Math.ceil(shown);
      const hot = secs <= 3 && t < FIND[4];
      const tp = 1 + (hot ? 0.12 * P.pulse(t % 1, 0, 0.3) : 0);
      ctx.save(); ctx.translate(965, 345); ctx.scale(tp, tp);
      P.circle(ctx, 0, 0, 64, hot ? C.red : C.paper, { seed: 30 });
      ctx.save(); ctx.strokeStyle = hot ? '#fff' : C.teal; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 50, -Math.PI / 2, -Math.PI / 2 + P.TAU * (shown / 10)); ctx.stroke(); ctx.restore();
      P.text(ctx, t >= FIND[4] ? '✓' : String(secs), 0, 4, { size: 58, font: 'bubble', color: hot ? '#fff' : C.ink, shadow: false });
      ctx.restore();

      // Clawd peeking at the bottom-left
      let mood = 'side';
      if (FIND.some(f => t >= f && t < f + 0.6)) mood = 'happy';
      if (t > 7 && t < ZOOM_A) mood = 'sus';
      if (t >= FIND[4] && t < RECAP + 1) mood = 'wow';
      P.claude(ctx, 100, 1420, 64, { t, mood, blink: P.pulse(t, 2.6, 0.14) + P.pulse(t, 8.2, 0.14), rot: -0.15 });

      // counter + caption sticker
      const cp = 1 + 0.25 * FIND.reduce((a, f) => a + P.pulse(t, f + 0.1, 0.25), 0);
      ctx.save(); ctx.translate(780, 1530); ctx.scale(cp, cp); ctx.rotate(0.04);
      P.rect(ctx, -100, -38, 200, 76, found === 5 ? C.green : C.ink, { radius: 20, seed: 31 });
      P.text(ctx, `${found}/5`, 0, 2, { size: 50, font: 'bubble', color: found === 5 ? '#fff' : C.yellow, shadow: false });
      ctx.restore();
      const stick = t > 7 && t < FIND[4] ? 'the 5th one is evil' : 'can you find all 5? 👀';
      P.sticker(ctx, stick, 180, 1530, { size: 46, pop: ease.outBack(prog(t, t > 7 && t < FIND[4] ? 7 : (t >= FIND[4] ? FIND[4] : 0.1), 0.35)) });

      // recap card
      if (t >= RECAP && t < D - 0.05) {
        const p = ease.outBack(prog(t, RECAP, 0.35)) * (1 - ease.inCubic(prog(t, D - 0.45, 0.4)));
        ctx.save(); ctx.translate(470, 900); ctx.scale(p, p); ctx.rotate(-0.03);
        P.rect(ctx, -330, -230, 660, 460, '#fff', { radius: 24, seed: 40 });
        P.text(ctx, 'answers', 0, -180, { size: 46, font: 'bubble', color: C.red, shadow: false });
        ['1. Paris, Texas', '2. built in 1989', '3. the sixth finger', '4. Dr. Real, J. of Vibes', '5. the tiny "sure!"'].forEach((s, i) => {
          const q = prog(t, RECAP + 0.15 + i * 0.12, 0.2);
          if (q > 0) P.text(ctx, s, -260, -110 + i * 66, { size: 40, font: 'hand', align: 'left', color: i === 4 ? C.red : C.ink, shadow: false, scale: 1 });
        });
        ctx.restore();
      }

      /* ---------- sound ---------- */
      if (env.at(0.02)) SFX.pop({ vol: 0.12 });
      for (let s = 1; s <= 9; s++) {
        const a = 0.3 + (10 - s) * 1;         // when the display hits s
        if (a < FIND[4] && env.at(a)) { if (s <= 3) SFX.tone(1200, 0.08, { type: 'square', vol: 0.06 }); else SFX.tick({ vol: 0.14 }); }
      }
      FIND.forEach((f, i) => {
        if (env.at(f)) SFX.noise(0.3, { filter: 'bandpass', freq: 2600, slide: 3600, q: 6, vol: 0.12 });   // marker squeak
        if (env.at(f + 0.1)) { if (i < 4) SFX.coin({ vol: 0.1 }); }
      });
      if (env.at(ZOOM_A)) SFX.whoosh({ vol: 0.18 });
      if (env.at(FIND[4] + 0.1)) { SFX.success({ vol: 0.14 }); SFX.chime({ vol: 0.1, when: 0.2 }); }
      if (env.at(RECAP)) SFX.swoosh({ vol: 0.14 });
      for (let i = 0; i < 5; i++) if (env.at(RECAP + 0.15 + i * 0.12)) SFX.blip(660 + i * 110, { vol: 0.05 });
      if (env.at(D - 0.45)) SFX.swoosh({ vol: 0.1 });
    },
  });
})();
