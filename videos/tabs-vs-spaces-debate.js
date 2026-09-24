/* The Great Indent Debate. Candidate TAB (wide, confident keycap) vs candidate
 * SPACE (a lanky spacebar), moderated by Clawd. Zingers, a fact-check chyron,
 * audience gasps... then a third-party candidate rises from the floor: Prettier. */
(function () {
  'use strict';
  const D = 10;
  const TAB_X = 255, TAB_Y = 860;
  const SP_X = 785, SP_BOT = 975;
  const MOD_X = 540, MOD_Y = 1105;
  const FLOOR = 1290;
  const PRET = 6.3, WIN = 7.4, ZAP = 7.7;
  const NAVY = '#1f2350', NAVY2 = '#2a2f66';

  /** keyframed value [[t, v], ...] with smooth in-between */
  function kf(t, arr) {
    if (t <= arr[0][0]) return arr[0][1];
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i], b = arr[i + 1];
      if (t < b[0]) return P.lerp(a[1], b[1], P.ease.inOutCubic((t - a[0]) / (b[0] - a[0])));
    }
    return arr[arr.length - 1][1];
  }
  /** pop in at a, pop out at b */
  function win(t, a, b, d = 0.3) {
    if (t < a || t >= b) return 0;
    return P.ease.outBack(P.prog(t, a, d)) * (1 - P.ease.inCubic(P.prog(t, b - 0.15, 0.15)));
  }
  const talking = (t, a, b) => t >= a && t < b && P.boil(t, 11) % 2 === 0;

  const TAB_KEYS = [[0, 50], [1.9, 50], [2.6, 63], [3.7, 63], [4.2, 31], [5.0, 31], [5.5, 47], [6.2, 45], [WIN, 0.1], [9.5, 0.1], [9.95, 50]];
  const SP_KEYS = [[0, 50], [1.9, 50], [2.6, 37], [3.7, 37], [4.2, 69], [5.0, 69], [5.5, 53], [6.2, 55], [WIN, 0.1], [9.5, 0.1], [9.95, 50]];
  const PR_KEYS = [[PRET + 0.2, 0], [WIN, 99.8], [9.5, 99.8], [9.9, 0]];

  function sweatDrop(ctx, x, y, s, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = P.clamp(a);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.6);
    ctx.bezierCurveTo(x + s, y - s * 0.2, x + s, y + s, x, y + s);
    ctx.bezierCurveTo(x - s, y + s, x - s, y - s * 0.2, x, y - s * 1.6);
    ctx.closePath();
    P.cut(ctx, '#A9DDF7', { shadow: { blur: 4, dy: 3, alpha: 0.2 }, rim: false });
    ctx.restore();
  }

  /** Candidate TAB: a wide, confident keycap. */
  function tabKey(ctx, x, y, t, o) {
    const { C } = P;
    const w = 290, h = 176;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(o.rot || 0);
    ctx.scale(1 + (o.puff || 0) * 0.06, 1 + (o.puff || 0) * 0.06);
    // little arms: pumping fist or gripping podium
    const pump = o.pump || 0;
    const fy = 40 - pump * (60 + Math.abs(Math.sin(t * 12)) * 50);
    P.arm(ctx, -w / 2 + 20, 30, -w / 2 - 40, fy, 24, '#cfc3ae');
    P.circle(ctx, -w / 2 - 40, fy, 22, '#e8dcc6', { seed: 13 });
    P.arm(ctx, w / 2 - 20, 30, w / 2 + 30, 90, 24, '#cfc3ae');
    P.circle(ctx, w / 2 + 30, 90, 22, '#e8dcc6', { seed: 14 });
    // keycap
    P.rect(ctx, -w / 2, -h / 2, w, h, '#cfc3ae', { radius: 28, seed: 11 });
    P.rect(ctx, -w / 2 + 16, -h / 2 + 10, w - 32, h - 42, o.formatted > 0.5 ? '#ffffff' : '#fbf5e8', { radius: 22, seed: 12, shadow: false });
    const label = o.formatted > 0.5 ? '2 spaces' : 'tab';
    P.text(ctx, label, -w / 2 + 38, -h / 2 + 38, { size: 28, font: 'mono', align: 'left', color: '#8a8494', shadow: false });
    if (o.formatted <= 0.5) P.text(ctx, '⇥', w / 2 - 50, -h / 2 + 38, { size: 40, font: 'sans', color: '#8a8494', shadow: false });
    P.face(ctx, 0, 14, 62, o.mood, { blink: o.blink });
    // flag lapel pin
    P.rect(ctx, 70, 20, 30, 20, P.C.mustard, { radius: 3, seed: 15, shadow: false, amp: 1 });
    ctx.restore();
  }

  /** Candidate SPACE: a lanky spacebar, standing on its end. */
  function spaceBar(ctx, x, bot, t, o) {
    const { C } = P;
    const w = 118, h = 450;
    ctx.save();
    ctx.translate(x, bot); ctx.rotate(o.rot || 0);
    // pointy arm (points at TAB during the zinger)
    const pt = o.point || 0;
    const hx = P.lerp(w / 2 + 50, -w / 2 - 170, pt), hy = P.lerp(-h * 0.35, -h * 0.62, pt);
    P.arm(ctx, pt > 0.5 ? -w / 2 + 16 : w / 2 - 16, -h * 0.5, hx, hy, 20, '#b9c2cf');
    P.circle(ctx, hx, hy, 19, '#dde3ec', { seed: 21 });
    if (pt > 0.5) P.arm(ctx, hx, hy, hx - 34, hy - 8, 10, '#dde3ec');
    P.rect(ctx, -w / 2, -h, w, h, '#b9c2cf', { radius: 26, seed: 22 });
    P.rect(ctx, -w / 2 + 10, -h + 14, w - 20, h - 40, o.formatted > 0.5 ? '#ffffff' : '#eef1f6', { radius: 20, seed: 23, shadow: false });
    P.text(ctx, o.formatted > 0.5 ? 'formatted' : 'space', 0, -h * 0.42, { size: 30, font: 'mono', color: '#8a8494', shadow: false, rot: -Math.PI / 2 });
    P.face(ctx, 0, -h + 90, 50, o.mood, { blink: o.blink });
    // teal tie
    P.poly(ctx, [[-9, -h + 142], [9, -h + 142], [14, -h + 200], [0, -h + 216], [-14, -h + 200]], C.teal, { seed: 24, amp: 1.5, shadow: false });
    ctx.restore();
  }

  /** The third-party candidate: a stack of colorful formatted lines with shades. */
  function prettier(ctx, x, y, t, o) {
    const { C } = P;
    const bars = [
      [-110, 160, C.teal], [-70, 190, C.yellow], [-110, 110, C.rose], [10, 110, C.sky],
      [-110, 220, C.purple], [-40, 150, C.pink], [-110, 90, C.mint],
    ];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 2.4) * 0.04);
    bars.forEach(([bx, bw, col], i) => {
      const by = -150 + i * 44;
      P.rect(ctx, bx, by, bw, 34, col, { radius: 17, seed: 40 + i, amp: 2 });
    });
    // shades + grin on the middle bars
    P.rect(ctx, -84, -80, 72, 44, C.black, { radius: 14, seed: 50 });
    P.rect(ctx, 10, -80, 72, 44, C.black, { radius: 14, seed: 51 });
    P.rect(ctx, -16, -66, 30, 10, C.black, { radius: 4, seed: 52, shadow: false });
    ctx.save();
    ctx.beginPath(); ctx.rect(-84, -80, 166, 44); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const gx = -120 + ((t * 0.8) % 1) * 260;
    ctx.beginPath(); ctx.moveTo(gx, -82); ctx.lineTo(gx + 20, -82); ctx.lineTo(gx - 4, -34); ctx.lineTo(gx - 24, -34); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -12, 36, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function podium(ctx, x, sym, col) {
    const { C } = P;
    P.poly(ctx, [[x - 125, 950], [x + 125, 950], [x + 105, FLOOR], [x - 105, FLOOR]], '#8a5a3c', { seed: x });
    P.rect(ctx, x - 140, 938, 280, 34, '#a06c47', { radius: 8, seed: x + 1 });
    P.circle(ctx, x, 1090, 64, col, { seed: x + 2 });
    P.circle(ctx, x, 1090, 50, 'rgba(255,255,255,0.25)', { seed: x + 3, shadow: false });
    P.text(ctx, sym, x, 1092, { size: 62, font: 'bubble', color: '#fff', shadow: false });
    P.star(ctx, x - 70, 1200, 16, C.yellow, { shadow: false });
    P.star(ctx, x, 1210, 16, C.yellow, { shadow: false });
    P.star(ctx, x + 70, 1200, 16, C.yellow, { shadow: false });
    // gooseneck mic
    ctx.save();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 40, 940); ctx.quadraticCurveTo(x + 50, 900, x + 22, 880); ctx.stroke();
    ctx.restore();
    P.circle(ctx, x + 20, 876, 11, '#333', { shadow: false, amp: 1 });
  }

  function audience(ctx, t, cheer, gasp, dim) {
    const { C } = P;
    const cols = [C.pink, C.mint, C.sky, C.yellow, '#c9b6ff', C.claude, C.green, C.rose];
    const signs = { 15: 'TABS 4 LIFE' };
    for (let row = 0; row < 2; row++) {
      const n = row ? 8 : 9;
      for (let i = 0; i < n; i++) {
        const k = row * 10 + i;
        const x = 40 + (i + (row ? 0.5 : 0.15)) * (1000 / n);
        const baseY = row ? 1560 : 1470;
        const r = row ? 64 : 52;
        const jump = cheer * Math.abs(Math.sin(t * 11 + k * 1.3)) * 34 + gasp * 10;
        const y = baseY - jump;
        if (row && signs[k]) {
          const sx = x + Math.sin(t * 3 + k) * 8;
          ctx.save();
          ctx.strokeStyle = C.wood; ctx.lineWidth = 8;
          ctx.beginPath(); ctx.moveTo(sx, y - 20); ctx.lineTo(sx, y - 90); ctx.stroke();
          ctx.restore();
          P.rect(ctx, sx - 90, y - 152, 180, 70, C.paper, { radius: 6, seed: k + 60, amp: 3 });
          P.text(ctx, signs[k], sx, y - 116, { size: 30, font: 'marker', color: C.ink, shadow: false });
        }
        const mood = gasp > 0.3 ? 'wow' : cheer > 0.3 ? 'happy' : dim > 0.3 ? 'side' : 'smile';
        if (k % 4 === 3) P.claude(ctx, x, y, r * 0.9, { t: t + k, mood, wiggle: 0.5, seed: 42 + k });
        else {
          ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + 8, y - r - 26); ctx.stroke(); ctx.restore();
          P.dot(ctx, x + 8, y - r - 30, 9, C.red);
          P.circle(ctx, x, y, r, cols[k % cols.length], { seed: k + 70 });
          P.face(ctx, x, y + 4, r * 0.55, mood);
        }
      }
    }
  }

  function chyron(ctx, t, tag, tagCol, text, pop) {
    const { C } = P;
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(-(1 - pop) * 900, 0);
    P.rect(ctx, 30, 1318, 870, 96, C.paper, { radius: 8, seed: 80 });
    const tw = P.measure(ctx, tag, { size: 34, font: 'bubble' }) + 40;
    P.rect(ctx, 22, 1306, tw, 58, tagCol, { radius: 8, seed: 81 });
    P.text(ctx, tag, 22 + tw / 2, 1336, { size: 34, font: 'bubble', color: '#fff', shadow: false });
    P.text(ctx, text, 50, 1386, { size: 32, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800, maxWidth: 830 });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@c.span.ai',
    caption: 'FULL DEBATE: tab vs space, moderated by Clawd. the third-party candidate came out of NOWHERE 🗳️ #indentation #tabsvsspaces #debate2026 #prettier',
    sound: 'debate night sting · c.span.ai',
    avatar: '🗳️',
    avatarColor: '#2a2f66',
    duration: D,
    bg: NAVY,
    thumb: 3.9,
    likes: '4.4M', commentCount: '88.8K', saves: '612K', shares: '1.2M',
    comments: [
      ['makefile.daemon', 'TAB leads among Makefiles is the most accurate chyron ever aired', 91200],
      ['go.fmt', '0:03 "my opponent is literally 4 of me" SPACE ate and left no crumbs 😭', 74800],
      ['python.interpreter', 'IndentationError: unexpected moderator', 51300],
      ['editorconfig.bot', 'the fact check is right though. a tab is whatever you want it to be. that is the problem', 38900],
      ['prettier', 'i did not ask to be nominated. i was simply run on save.', 120400],
      ['black.formatter', 'rigged. i would have won if the election was in python', 22100],
      ['yaml.file', 'meanwhile i will crash if either of them shows up wrong 🙃', 30700],
      ['clawd', 'moderating this was harder than the 200k context window', 18600],
      ['c.span.ai', 'part 2: the recount (eslint --fix) drops tomorrow', 9400],
      ['mixed.indent.enjoyer', 'why not both 🙂 (i have been banned from 40 repos)', 5100],
    ],

    bpm: 100,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= PRET - 0.1 && t < WIN - 0.05) return;           // dramatic silence
      if (t > 9.5) return;
      if (t < PRET) {
        if (step % 4 === 0) SFX.kick({ vol: 0.16 });
        if (step % 8 === 4) SFX.snare({ vol: 0.06 });
        SFX.hat({ vol: 0.025 });
        if (step % 4 === 0) SFX.bass(['C2', 'C2', 'Ab1', 'G1'][(step / 4) % 4], 0.5, { vol: 0.12 });
      } else {
        if (step % 2 === 0) SFX.kick({ vol: 0.2 });
        if (step % 4 === 2) SFX.clap({ vol: 0.08 });
        if (step % 2 === 0) SFX.pluck(['C5', 'E5', 'G5', 'C6'][(step / 2) % 4], { vol: 0.06 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;

      const blackout = t >= PRET && t < WIN ? 1 - prog(t, WIN - 0.2, 0.2) : 0;
      const cheer = Math.max(pulse(t, 2.2, 1.0), t >= WIN ? pulse(t, WIN, 2.0) : 0);
      const gasp = pulse(t, 3.95, 0.9);

      /* ---------- backdrop ---------- */
      P.gradient(ctx, NAVY, '#141638');
      P.stars(ctx, t, 12, 22, C.yellow, [40, 660, 1000, 300]);
      // spotlights sweeping
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      [[160, 0.7, 0], [920, -0.7, 1.5]].forEach(([sx, dir, ph]) => {
        const a = Math.PI / 2 + dir * 0.35 + Math.sin(t * 1.3 + ph) * 0.18;
        const L = 1400, spread = 0.13;
        ctx.fillStyle = 'rgba(255,236,170,0.10)';
        ctx.beginPath(); ctx.moveTo(sx, 290);
        ctx.lineTo(sx + Math.cos(a - spread) * L, 290 + Math.sin(a - spread) * L);
        ctx.lineTo(sx + Math.cos(a + spread) * L, 290 + Math.sin(a + spread) * L);
        ctx.closePath(); ctx.fill();
      });
      ctx.restore();

      // title banner
      const ban = ease.outBack(prog(t, 0.15, 0.5));
      ctx.save(); ctx.translate(540, 600); ctx.rotate(-0.02); ctx.scale(ban, ban);
      P.rect(ctx, -330, -52, 660, 104, '#b8323a', { radius: 12, seed: 90 });
      P.text(ctx, 'THE GREAT INDENT DEBATE', 0, 2, { size: 46, font: 'bubble', color: '#fff', shadow: false });
      P.star(ctx, -360, 0, 30, C.yellow, { rot: t });
      P.star(ctx, 360, 0, 30, C.yellow, { rot: -t });
      ctx.restore();

      /* ---------- approval meters ---------- */
      const tabV = kf(t, TAB_KEYS), spV = kf(t, SP_KEYS), prV = kf(t, PR_KEYS);
      const jig = (a, b) => (t >= a && t < b ? Math.sin(t * 30) * 1.2 : 0);
      P.rect(ctx, 60, 300, 860, 200, C.paper, { radius: 20, seed: 30 });
      P.dot(ctx, 96, 330, 11, P.boil(t, 3) % 2 ? C.red : '#f39a9a');
      P.text(ctx, 'LIVE APPROVAL', 116, 331, { size: 26, font: 'sans', align: 'left', color: C.red, shadow: false, weight: 900 });
      P.text(ctx, '👁 ' + (1.2 + t * 0.37).toFixed(1) + 'M agents watching', 890, 331, { size: 22, font: 'mono', align: 'right', color: '#8a8494', shadow: false });
      const rowsShown = t >= PRET + 0.2 && t < 9.9 ? 3 : 2;
      const rows = [['TAB', tabV + jig(1.6, 3.2), C.mustard], ['SPACE', spV + jig(3.2, 4.9), C.teal], ['PRETTIER', prV, C.rose]];
      const rh = rowsShown === 3 ? 44 : 60;
      for (let i = 0; i < rowsShown; i++) {
        const [name, v, col] = rows[i];
        const y = 362 + i * (rh + 6);
        P.text(ctx, name, 96, y + rh / 2, { size: rowsShown === 3 ? 26 : 32, font: 'bubble', align: 'left', color: C.ink, shadow: false });
        P.rect(ctx, 290, y + 4, 460, rh - 8, '#e6ddcc', { radius: (rh - 8) / 2, seed: 31 + i, shadow: false, amp: 2 });
        let bw = 460 * clamp(v / 100);
        if (i === 2) bw = 460 * (v / 100) * (1 + 0.5 * ease.outBack(prog(t, WIN, 0.6)) * (t < 9.5 ? 1 : 0));
        if (bw > 6) P.rect(ctx, 290, y + 4, Math.max(rh - 8, bw), rh - 8, col, { radius: (rh - 8) / 2, seed: 34 + i, shadow: false, amp: 2 });
        const pct = v < 1 && v > 0 ? v.toFixed(1) + '%' : Math.round(v) + '%';
        P.text(ctx, pct, 880, y + rh / 2, { size: rowsShown === 3 ? 30 : 38, font: 'bubble', align: 'right', color: col, shadow: false });
      }
      if (t >= WIN && t < 9.5) {
        const s = ease.outBack(prog(t, WIN + 0.1, 0.4));
        P.text(ctx, '📈', 830 + Math.sin(t * 8) * 6, 470, { size: 70, font: 'sans', scale: s, rot: 0.2 });
      }

      /* ---------- stage ---------- */
      ctx.save();
      const punch = 0.05 * pulse(t, 3.3, 0.5) + 0.04 * pulse(t, WIN, 0.5);
      P.zoom(ctx, 1 + punch, 540, 950);
      if (t >= ZAP) P.shake(ctx, t, 12 * (1 - prog(t, ZAP, 0.4)));

      // stage floor
      P.rect(ctx, -20, FLOOR - 10, 1120, 60, '#3a2a55', { radius: 4, seed: 5 });

      // --- TAB
      const tabTalk = talking(t, 1.6, 3.1) || talking(t, 4.9, 5.6) || (t >= 8.3 && t < 8.9 && talking(t, 8.3, 8.8));
      let tabMood = 'smile';
      if (t >= 1.6 && t < 3.2) tabMood = tabTalk ? 'wow' : 'happy';
      else if (t >= 3.2 && t < 4.2) tabMood = 'side';
      else if (t >= 4.2 && t < 4.9) tabMood = 'wow';
      else if (t >= 4.9 && t < 6.2) tabMood = tabTalk ? 'wow' : 'angry';
      else if (t >= PRET && t < ZAP) tabMood = 'wow';
      else if (t >= ZAP && t < 9.5) tabMood = t >= 8.3 && tabTalk ? 'sleepy' : 'dead';
      const fmt = t >= ZAP && t < 9.6 ? 1 : 0;
      tabKey(ctx, TAB_X, TAB_Y + Math.sin(t * 3) * 4 - pulse(t, 1.6, 0.4) * 24, t, {
        mood: tabMood, blink: pulse(t % 4, 3.3, 0.15),
        pump: t >= 1.6 && t < 3.1 ? 1 : 0,
        puff: pulse(t, 1.6, 1.5),
        rot: fmt ? 0 : Math.sin(t * 1.7) * 0.03 + (t >= 4.2 && t < 4.9 ? -0.08 : 0),
        formatted: fmt,
      });
      // sweat after being fact-checked
      if (t >= 4.2 && t < 6.2) for (let k = 0; k < 2; k++) {
        const c = ((t * 1.4 + k * 0.5) % 1);
        sweatDrop(ctx, TAB_X + (k ? 160 : -160), TAB_Y - 60 + c * 90, 13, 1 - c);
      }
      podium(ctx, TAB_X, '⇥', C.mustard);

      // --- SPACE
      const spTalk = talking(t, 3.2, 4.8) || talking(t, 5.5, 6.2) || talking(t, 8.5, 9.0);
      let spMood = 'smile';
      if (t >= 1.6 && t < 3.2) spMood = 'sus';
      else if (t >= 3.2 && t < 4.9) spMood = spTalk ? 'wow' : 'wink';
      else if (t >= 4.9 && t < 5.5) spMood = 'angry';
      else if (t >= 5.5 && t < 6.2) spMood = spTalk ? 'wow' : 'angry';
      else if (t >= PRET && t < ZAP) spMood = 'wow';
      else if (t >= ZAP && t < 9.5) spMood = t >= 8.5 && spTalk ? 'sleepy' : 'dead';
      const point = ease.outBack(prog(t, 3.3, 0.35)) * (1 - ease.inCubic(prog(t, 4.8, 0.3)));
      spaceBar(ctx, SP_X, SP_BOT, t, {
        mood: spMood, blink: pulse((t + 1.3) % 4, 3.3, 0.15), point,
        rot: fmt ? 0 : Math.sin(t * 2.1 + 1) * 0.05 - point * 0.06,
        formatted: fmt,
      });
      podium(ctx, SP_X, '␣', C.teal);

      // --- PRETTIER rises from the trapdoor behind the moderator's desk
      if (t >= PRET && t < 9.75) {
        const rise = ease.outBack(prog(t, PRET + 0.25, 0.8)) * (1 - ease.inCubic(prog(t, 9.4, 0.35)));
        // column of light
        ctx.save();
        ctx.globalAlpha = 0.35 * clamp(rise * 1.5);
        ctx.fillStyle = '#fff4c8';
        ctx.beginPath(); ctx.moveTo(470, 280); ctx.lineTo(610, 280); ctx.lineTo(720, FLOOR); ctx.lineTo(360, FLOOR); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, 1080, 1060); ctx.clip();
        prettier(ctx, 540, lerp(1320, 830, rise), t, {});
        ctx.restore();
        // trapdoor smoke
        const sp = prog(t, PRET + 0.2, 1.3);
        if (sp > 0 && sp < 1) for (let k = 0; k < 6; k++) {
          const dx = (k - 2.5) * 70 * (0.6 + sp);
          ctx.save(); ctx.globalAlpha = 0.8 * (1 - sp);
          P.cloud(ctx, 540 + dx, 1050 - sp * 60 - (k % 2) * 30, 0.35 + sp * 0.3, '#e9e4f5');
          ctx.restore();
        }
      }

      // zap beams
      if (t >= ZAP - 0.05 && t < ZAP + 0.5) {
        const zp = prog(t, ZAP - 0.05, 0.55);
        ctx.save();
        ctx.globalAlpha = 1 - zp;
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 16; ctx.lineCap = 'round';
        [[TAB_X, TAB_Y], [SP_X, SP_BOT - 250]].forEach(([zx, zy], k) => {
          ctx.beginPath(); ctx.moveTo(540, 760);
          for (let s = 1; s <= 6; s++) {
            const f = s / 6;
            ctx.lineTo(lerp(540, zx, f) + (s < 6 ? (P.hash(s + k * 9 + P.boil(t, 20)) - 0.5) * 50 : 0), lerp(760, zy, f));
          }
          ctx.stroke();
        });
        ctx.restore();
        P.burstLines(ctx, TAB_X, TAB_Y, 170, zp, C.yellow, 10);
        P.burstLines(ctx, SP_X, SP_BOT - 250, 170, zp, C.yellow, 10);
      }
      if (t >= ZAP + 0.2 && t < 9.5) {
        const cp = ease.outBack(prog(t, ZAP + 0.2, 0.35));
        ctx.save(); ctx.translate(TAB_X + 130, TAB_Y - 90); ctx.scale(cp, cp); P.check(ctx, 0, 0, 34, prog(t, ZAP + 0.3, 0.3)); ctx.restore();
        ctx.save(); ctx.translate(SP_X + 70, SP_BOT - 470); ctx.scale(cp, cp); P.check(ctx, 0, 0, 34, prog(t, ZAP + 0.3, 0.3)); ctx.restore();
      }

      // --- moderator Clawd at his desk
      let modMood = 'smile';
      const modTalk = talking(t, 0.25, 1.5);
      if (t < 1.6) modMood = modTalk ? 'wow' : 'happy';
      else if (t >= 3.9 && t < 4.6) modMood = 'wow';
      else if (t >= 4.9 && t < 6.2) modMood = 'side';
      else if (t >= PRET && t < WIN) modMood = 'wow';
      else if (t >= WIN && t < 9.5) modMood = 'happy';
      const hop = pulse(t, 3.95, 0.35) * 30 + pulse(t, PRET + 0.3, 0.4) * 40;
      const modX = MOD_X;
      P.claude(ctx, modX, MOD_Y - hop, 74, { t, mood: modMood, blink: pulse(t % 3, 2.2, 0.15) });
      // sweat when things get heated
      if (t >= 4.9 && t < 6.2) sweatDrop(ctx, modX + 70, MOD_Y - 70 + ((t * 1.6) % 1) * 60, 11, 1 - ((t * 1.6) % 1));
      P.rect(ctx, MOD_X - 120, 1150, 240, 140, '#5a3d2b', { radius: 10, seed: 70 });
      P.rect(ctx, MOD_X - 100, 1178, 200, 44, C.paper, { radius: 6, seed: 71, shadow: false });
      P.text(ctx, 'MODERATOR', MOD_X, 1201, { size: 28, font: 'bubble', color: C.purple, shadow: false });
      // moderator's bell
      const ring = t >= 5.9 && t < 6.25 ? Math.sin(t * 60) * 0.3 : 0;
      ctx.save(); ctx.translate(MOD_X + 80, 1150); ctx.rotate(ring);
      P.poly(ctx, [[-20, 0], [20, 0], [14, -28], [0, -36], [-14, -28]], C.mustard, { seed: 72, amp: 1.5 });
      ctx.restore();

      ctx.restore(); // stage zoom

      /* ---------- audience ---------- */
      audience(ctx, t, cheer, gasp, blackout);

      /* ---------- blackout for the reveal ---------- */
      if (blackout > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(8,6,20,${0.62 * blackout})`;
        ctx.fillRect(0, 0, 1080, 1920);
        ctx.restore();
      }
      // stage lights cut / snap on
      if (t >= PRET && t < PRET + 0.25) P.flash(ctx, 0.5 * (1 - prog(t, PRET, 0.25)), '#000');
      if (t >= WIN) P.flash(ctx, 0.7 * (1 - prog(t, WIN, 0.3)));

      /* ---------- speech ---------- */
      P.bubble(ctx, 'candidates: how will\nyou indent the codebase?', 540, 800, MOD_X, MOD_Y - 80, { size: 44, pop: win(t, 0.25, 1.6), seed: 3 });
      P.bubble(ctx, 'ONE keystroke.\nONE indent. 💪', 340, 705, TAB_X + 20, TAB_Y - 90, { size: 50, pop: win(t, 1.6, 3.15), seed: 4 });
      P.bubble(ctx, 'my opponent is\nliterally 4 of me', 545, 860, SP_X - 30, SP_BOT - 330, { size: 52, pop: win(t, 3.2, 4.85), seed: 5 });
      P.bubble(ctx, 'at least my width\nis CONFIGURABLE 😤', 350, 690, TAB_X + 20, TAB_Y - 90, { size: 44, pop: win(t, 4.9, 5.75), seed: 6 });
      P.bubble(ctx, "that's called being\nINCONSISTENT", 600, 880, SP_X - 30, SP_BOT - 330, { size: 42, pop: win(t, 5.45, 6.25), seed: 7 });
      P.bubble(ctx, "i'll just reformat\nboth of you ✨", 540, 600, 540, 700, { size: 46, pop: win(t, 6.95, WIN + 0.15), seed: 8 });
      P.bubble(ctx, '...fine.', 330, 690, TAB_X + 20, TAB_Y - 90, { size: 48, pop: win(t, 8.3, 9.3), seed: 9 });
      P.bubble(ctx, '...fine.', 610, 880, SP_X - 30, SP_BOT - 330, { size: 48, pop: win(t, 8.55, 9.4), seed: 10 });

      // audience reaction text
      if (t >= 3.95 && t < 4.9) P.title(ctx, 'OOOOOH', 540, 1250, { size: 90, color: C.pink, stroke: C.ink, pop: ease.outBack(prog(t, 3.95, 0.3)) * (1 - prog(t, 4.75, 0.15)), rot: Math.sin(t * 20) * 0.04 });
      if (t >= 2.2 && t < 3.1) P.text(ctx, 'WOOO 👏', 180, 1270, { size: 50, font: 'bubble', color: '#fff', stroke: C.ink, strokeWidth: 8, scale: ease.outBack(prog(t, 2.2, 0.3)) * (1 - prog(t, 2.95, 0.15)), rot: -0.1 });
      if (t >= PRET + 0.35 && t < 6.95) P.title(ctx, 'THIRD-PARTY\nCANDIDATE?!', 540, 600, { size: 70, color: '#fff', stroke: C.purple, pop: ease.outBack(prog(t, PRET + 0.35, 0.3)) * (1 - prog(t, 6.8, 0.15)) });
      if (t >= WIN && t < 9.45) P.title(ctx, 'LANDSLIDE!', 540, 640, { size: 118, color: C.yellow, stroke: C.rose, pop: ease.outBack(prog(t, WIN, 0.4)) * (1 - ease.inCubic(prog(t, 9.2, 0.25))), rot: -0.05 + Math.sin(t * 6) * 0.02 });
      if (t >= WIN) P.confetti(ctx, t - WIN, 540, 640, 7, 80, 800);

      /* ---------- chyron ---------- */
      const ch = (a, b) => (t < a || t >= b ? 0 : ease.outCubic(prog(t, a, 0.3)) * (1 - ease.inCubic(prog(t, b - 0.2, 0.2))));
      chyron(ctx, t, 'LIVE', C.red, 'THE GREAT INDENT DEBATE · moderated by Clawd', ch(0, 1.75));
      chyron(ctx, t, 'POLL', C.mustard, 'TAB leads among Makefiles, 100% to 0%', ch(1.75, 3.9));
      chyron(ctx, t, 'FACT CHECK', C.purple, 'a tab can be 2, 4 or 8 of him', ch(3.9, 6.2));
      chyron(ctx, t, 'BREAKING', C.red, 'independent candidate enters race from trapdoor', ch(PRET + 0.4, WIN));
      chyron(ctx, t, 'RESULTS', C.rose, 'PRETTIER WINS ALL 50 FILES · formatted on save', ch(WIN + 0.1, 9.5));
      if (t >= 3.9 && t < 6.2) {
        const st = ease.outBack(prog(t, 4.1, 0.3));
        ctx.save(); ctx.translate(760, 1366); ctx.rotate(-0.12); ctx.scale(st, st);
        P.rect(ctx, -130, -32, 260, 64, 'rgba(255,255,255,0.85)', { radius: 10, seed: 82, shadow: false, stroke: C.red, lineWidth: 6, rim: false });
        P.text(ctx, 'MISLEADING', 0, 2, { size: 38, font: 'bubble', color: C.red, shadow: false });
        ctx.restore();
      }

      /* ---------- caption sticker ---------- */
      if (t < WIN) P.sticker(ctx, 'debate got HEATED 🔥', 60, 1530, { size: 44, pop: ease.outBack(prog(t, 0.4, 0.4)) * (1 - prog(t, WIN - 0.2, 0.2)) });
      else P.sticker(ctx, 'prettier --write democracy 🗳️', 60, 1530, { size: 44, pop: ease.outBack(prog(t, WIN + 0.3, 0.4)) * (1 - prog(t, 9.6, 0.25)), rot: 0.02 });

      /* ---------- loop blackout ---------- */
      const dark = t < 0.3 ? 1 - prog(t, 0, 0.3) : t >= 9.6 ? prog(t, 9.6, 0.4) : 0;
      if (dark > 0) P.flash(ctx, dark * 0.75, '#0a0818');

      /* ---------- sound ---------- */
      const babble = (a, b, notes, type, vol) => {
        for (let k = 0; a + k * 0.1 < b; k++) {
          if (env.at(a + k * 0.1)) SFX.tone(notes[(k * 7 + 3) % notes.length], 0.07, { type, vol });
        }
      };
      if (env.at(0.02)) { SFX.chord(['C4', 'G4', 'C5', 'E5'], 0.9, { type: 'sawtooth', vol: 0.035, gap: 0.05 }); SFX.chime({ vol: 0.06 }); }
      babble(0.3, 1.45, ['E4', 'G4', 'A4', 'C5'], 'triangle', 0.05);
      babble(1.65, 3.05, ['C3', 'D3', 'E3', 'G3'], 'square', 0.035);
      babble(3.25, 4.6, ['A4', 'C5', 'D5', 'F5'], 'sine', 0.06);
      babble(4.95, 5.6, ['C3', 'Eb3', 'F3'], 'square', 0.035);
      babble(5.5, 6.15, ['A4', 'Bb4', 'D5'], 'sine', 0.06);
      babble(7.0, 7.35, ['G4', 'B4', 'D5'], 'triangle', 0.05);
      babble(8.3, 8.6, ['C3', 'E3'], 'square', 0.03);
      babble(8.55, 8.85, ['A4', 'E5'], 'sine', 0.05);
      if (env.at(0.3)) SFX.pop({ vol: 0.1 });
      if (env.at(1.6)) SFX.pop({ f: 400, vol: 0.12 });
      if (env.at(2.2)) { SFX.noise(1.0, { filter: 'bandpass', freq: 1400, q: 0.6, vol: 0.1 }); SFX.clap({ vol: 0.1 }); SFX.clap({ vol: 0.08, when: 0.18 }); SFX.clap({ vol: 0.08, when: 0.33 }); }
      if (env.at(3.2)) SFX.pop({ f: 700, vol: 0.12 });
      if (env.at(3.35)) SFX.whoosh({ vol: 0.08 });
      if (env.at(3.95)) { SFX.noise(0.7, { filter: 'bandpass', freq: 2200, slide: 500, q: 0.8, vol: 0.14 }); SFX.tone(520, 0.7, { type: 'triangle', slide: 300, vol: 0.06 }); }
      if (env.at(4.1)) SFX.tone('C6', 0.1, { type: 'square', vol: 0.05 });
      if (env.at(4.2)) SFX.tone('G5', 0.25, { type: 'square', vol: 0.05 });
      if (env.at(4.9)) SFX.pop({ f: 350, vol: 0.12 });
      if (env.at(5.95)) SFX.ding('A5', { vol: 0.1 });
      if (env.at(PRET)) SFX.thud({ vol: 0.35 });
      if (env.at(PRET + 0.25)) SFX.riser(1.0, { vol: 0.1 });
      if (env.at(PRET + 0.4)) SFX.noise(0.9, { filter: 'lowpass', freq: 700, vol: 0.12 });
      if (env.at(WIN)) { SFX.success({ vol: 0.14 }); SFX.chord(['C4', 'E4', 'G4', 'C5'], 1.2, { type: 'sawtooth', vol: 0.03 }); SFX.noise(1.6, { filter: 'bandpass', freq: 1300, q: 0.6, vol: 0.1 }); }
      if (env.at(ZAP)) { SFX.tone(1800, 0.3, { type: 'square', slide: 200, vol: 0.06 }); SFX.chime({ vol: 0.08 }); }
      if (env.at(8.3)) SFX.tone('E3', 0.3, { type: 'triangle', slide: 'C3', vol: 0.08 });
      if (env.at(8.55)) SFX.tone('E4', 0.3, { type: 'triangle', slide: 'C4', vol: 0.08 });
      if (env.at(9.6)) SFX.swoosh({ vol: 0.08 });
    },
  });
})();
