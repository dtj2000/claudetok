/* Programming language tier list (no hate). HTML goes in F. The comments arrive.
 * Then Clawd quietly sneaks English into S tier. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  const TIERS = [['S', '#F07A7A'], ['A', '#F5A86A'], ['B', '#F5D26A'], ['C', '#BEE07A'], ['F', '#7FB8E8']];
  const ROW_Y = r => 440 + r * 150;
  const slotPos = (tier, slot) => [280 + slot * 132, ROW_Y(tier) + 70];
  const trayPos = i => [140 + i * 112, 1318];
  const DROP = 0.6;
  const RESET = 10.3;

  // id, tier, slot, drag start
  const CARDS = [
    { id: 'rust', tier: 0, slot: 0, s: 0.25, tag: '🦀 blazingly fast' },
    { id: 'python', tier: 1, slot: 0, s: 1.05, tag: 'import antigravity' },
    { id: 'c', tier: 1, slot: 1, s: 1.85, tag: 'segfault (core dumped)' },
    { id: 'js', tier: 3, slot: 0, s: 2.65, tag: 'NaN' },
    { id: 'cobol', tier: 2, slot: 0, s: 3.45, tag: '*cough* runs the banks' },
    { id: 'bf', tier: 0, slot: 1, s: 4.25, tag: 'respect.' },
    { id: 'html', tier: 4, slot: 0, s: 5.0, tag: null },
  ];
  const HTML_DROP = 5.0 + DROP;
  const STORM = 5.75, STORM_END = 7.75;
  const SNEAK = 8.2, SNEAK_DUR = 1.5, EN_SLOT = slotPos(0, 2), EN_START = [1080, 540];

  const COMMENTS = [
    ['@w3c.bot', 'HTML IS NOT A PROGRAMMING LANGUAGE'],
    ['@semantic.div', "it's a MARKUP language 🤓"],
    ['@lint.bot', 'HTML IS NOT A PROGRAMMING LANGUAGE!!!'],
    ['@actually.gpt', 'ackshually ☝️'],
    ['@tag.soup', '<p>ratio</p>'],
    ['@frontend.intern', 'HTML IS NOT A PROGRAMMING LANGUAGE'],
    ['@gopher', 'where is Go??'],
    ['@css.enjoyer', 'css is though. fight me'],
    ['@nerd.agent', 'HTML IS NOT A PROGRAMMING LANGUAGE'],
    ['@bank.mainframe', 'COBOL above JS. correct.'],
    ['@no.hate', '"no hate" 💀'],
    ['@marquee.fan', 'HTML IS NOT A PROGRAMMING LANGUAGE'],
    ['@turing.complete', 'can HTML loop? no. case closed'],
    ['@stack.overflow', 'closed as duplicate'],
    ['@ferris', 'rust in S. obviously.'],
    ['@html.defender', 'HTML IS NOT A PROGRAMMING LANGUAGE (i am html)'],
    ['@unfollow.bot', 'unfollowed.'],
    ['@caps.lock', 'HTML IS NOT A PROGRAMMING LANGUAGE'],
  ];
  const AV_COLS = ['#F2B8C6', '#8FD3B6', '#F5C84B', '#8EC9E8', '#E8845C', '#c9b6ff', '#5DB36A'];

  function keyPos(t, keys) {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) {
        const k = P.ease.inOutCubic((t - a[0]) / (b[0] - a[0]));
        return [P.lerp(a[1], b[1], k), P.lerp(a[2], b[2], k)];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  }

  const ARM_KEYS = (() => {
    const k = [[0, 1150, 1750]];
    CARDS.forEach((c, i) => { k.push([c.s, ...trayPos(i)]); k.push([c.s + DROP, ...slotPos(c.tier, c.slot)]); });
    k.push([HTML_DROP + 0.35, 1250, 1950]);
    return k;
  })();

  /** where card i is at time t: [x, y, scale, rot, lifted] */
  function cardState(i, t) {
    const { ease, prog, lerp } = P;
    const c = CARDS[i];
    const tray = trayPos(i), slot = slotPos(c.tier, c.slot);
    if (t >= RESET) {
      const q = ease.outBack(prog(t, RESET + i * 0.06, 0.45));
      const arc = Math.sin(prog(t, RESET + i * 0.06, 0.45) * Math.PI) * 160;
      return [lerp(slot[0], tray[0], q), lerp(slot[1], tray[1], q) - arc, 1, Math.sin(q * Math.PI) * 0.5, q < 1];
    }
    if (t < c.s) return [tray[0], tray[1], 1, 0, false];
    if (t < c.s + DROP) {
      const p = prog(t, c.s, DROP), e = ease.inOutCubic(p);
      const lift = Math.sin(p * Math.PI);
      return [lerp(tray[0], slot[0], e), lerp(tray[1], slot[1], e) - lift * 120, 1 + lift * 0.18, Math.sin(p * Math.PI * 2) * 0.12, true];
    }
    const land = prog(t, c.s + DROP, 0.35);
    const sq = land < 1 ? (1 - ease.outElastic(land)) * 0.25 : 0;
    return [slot[0], slot[1], 1 + sq, 0, false, sq];
  }

  function englishState(t) {
    const { prog, ease, lerp } = P;
    if (t >= RESET) {
      const q = ease.inCubic(prog(t, RESET + 0.1, 0.4));
      return [lerp(EN_SLOT[0], 1250, q), EN_SLOT[1] - Math.sin(q * Math.PI) * 120, 1, q * 0.6];
    }
    if (t < SNEAK) return [EN_START[0] + 200, EN_START[1], 1, 0];
    const p = prog(t, SNEAK, SNEAK_DUR);
    const n = 6, raw = p * n, f = raw - Math.floor(raw);
    const stepP = p >= 1 ? 1 : (Math.floor(raw) + ease.inOutCubic(f)) / n;
    const hop = p >= 1 ? 0 : Math.sin(f * Math.PI) * 22;
    return [lerp(EN_START[0], EN_SLOT[0], stepP), lerp(EN_START[1], EN_SLOT[1], stepP) - hop, 1, p >= 1 ? 0 : Math.sin(raw * Math.PI) * 0.06];
  }

  function cobweb(ctx, x, y, r) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 4; k++) { const a = (k / 4) * Math.PI / 2; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    for (let j = 1; j <= 3; j++) {
      const rr = (r * j) / 3.2;
      for (let k = 0; k < 4; k++) {
        const a0 = (k / 4) * Math.PI / 2, a1 = ((k + 1) / 4) * Math.PI / 2;
        ctx.moveTo(x + Math.cos(a0) * rr, y + Math.sin(a0) * rr);
        ctx.quadraticCurveTo(x + Math.cos((a0 + a1) / 2) * rr * 0.8, y + Math.sin((a0 + a1) / 2) * rr * 0.8, x + Math.cos(a1) * rr, y + Math.sin(a1) * rr);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawCard(ctx, id, x, y, sc, rot, t, o = {}) {
    const C = P.C;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * (1 + (o.sq || 0) * 0.4), sc * (1 - (o.sq || 0)));
    const bgs = { js: '#F7DF1E', python: '#FBF7EE', rust: '#F4E1D2', c: '#DFE8F7', html: '#FBE6DC', cobol: '#D9D2C3', bf: '#1F1B2B', english: '#FFFFFF' };
    P.rect(ctx, -58, -58, 116, 116, bgs[id], { radius: 16, seed: id.length * 7 + 3, shadow: o.lifted ? { blur: 26, dy: 22, alpha: 0.35 } : { blur: 8, dy: 6, alpha: 0.28 } });
    const lab = (s, col = C.ink) => P.text(ctx, s, 0, 40, { size: 20, font: 'mono', color: col, shadow: false, weight: 700 });
    switch (id) {
      case 'js':
        P.text(ctx, 'JS', 16, 20, { size: 60, font: 'bubble', color: '#222', shadow: false });
        break;
      case 'python':
        P.rect(ctx, -38, -44, 48, 48, '#3F77B5', { radius: 14, seed: 60, shadow: false });
        P.rect(ctx, -12, -20, 48, 48, '#F5CB3F', { radius: 14, seed: 61, shadow: false });
        P.dot(ctx, -26, -32, 5, '#fff'); P.dot(ctx, 24, 16, 5, '#fff');
        lab('python');
        break;
      case 'rust':
        P.star(ctx, 0, -10, 40, '#3B2A24', { points: 14, inner: 0.8, rot: t * 0.5, shadow: false });
        P.circle(ctx, 0, -10, 25, '#F4E1D2', { shadow: false, amp: 1 });
        P.text(ctx, 'R', 0, -8, { size: 34, font: 'bubble', color: '#3B2A24', shadow: false });
        lab('rust');
        break;
      case 'c': {
        const pts = [];
        for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.PI / 6; pts.push([Math.cos(a) * 42, -6 + Math.sin(a) * 42]); }
        P.poly(ctx, pts, '#3A64B0', { seed: 62, amp: 2, shadow: false });
        P.text(ctx, 'C', 0, -4, { size: 46, font: 'bubble', color: '#fff', shadow: false });
        break;
      }
      case 'html':
        P.poly(ctx, [[-36, -46], [36, -46], [29, 22], [0, 36], [-29, 22]], '#E34F26', { seed: 63, amp: 2, shadow: false });
        P.text(ctx, '5', 0, -10, { size: 46, font: 'bubble', color: '#fff', shadow: false });
        lab('html', '#8a2e14');
        if (o.sad) { P.face(ctx, 0, 14, 22, 'sad', { ink: '#fff', blush: false }); }
        break;
      case 'cobol':
        cobweb(ctx, -54, -54, 50);
        P.text(ctx, 'COBOL', 0, -4, { size: 28, font: 'mono', color: '#4a4236', shadow: false, weight: 800 });
        P.text(ctx, 'est. 1959', 0, 26, { size: 16, font: 'mono', color: '#7a6f5f', shadow: false });
        break;
      case 'bf':
        P.text(ctx, '+[>-]<.', 0, -12, { size: 22, font: 'mono', color: '#7CFC9A', shadow: false });
        P.text(ctx, 'brainfk', 0, 26, { size: 20, font: 'mono', color: '#fff', shadow: false });
        break;
      case 'english':
        P.text(ctx, 'Aa', 0, -10, { size: 54, font: 'Georgia, "Times New Roman", serif', color: C.ink, shadow: false });
        lab('English');
        break;
    }
    ctx.restore();
  }

  function commentCard(ctx, handle, text, x, y, rot, pop, col, seed) {
    if (pop <= 0) return;
    const size = 34;
    const w = Math.min(820, P.measure(ctx, text, { size, font: 'sans' }) + 140), h = 108;
    const cx = P.clamp(x, w / 2 + 30, 1050 - w / 2);
    ctx.save();
    ctx.translate(cx, y); ctx.rotate(rot); ctx.scale(pop, pop);
    P.rect(ctx, -w / 2, -h / 2, w, h, '#fff', { radius: 26, seed, shadow: { blur: 14, dy: 9, alpha: 0.3 } });
    P.circle(ctx, -w / 2 + 50, 0, 30, col, { shadow: false, seed: seed + 1 });
    P.face(ctx, -w / 2 + 50, 2, 22, seed % 3 ? 'angry' : 'sus', { blush: false, skin: col });
    P.text(ctx, handle, -w / 2 + 96, -24, { size: 24, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 700 });
    P.text(ctx, text, -w / 2 + 96, 16, { size, font: 'sans', align: 'left', color: P.C.ink, shadow: false, weight: 800, maxWidth: w - 120 });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@tier.lord',
    caption: 'ranking programming languages (no hate) 🙏 comments are closed for my safety #tierlist #programming #nohate #html',
    sound: 'tier list anthem (sneaky remix) · tier.lord',
    avatar: '👑',
    avatarColor: '#F07A7A',
    duration: 11,
    bg: '#2E2A5C',
    likes: '5.2M', commentCount: '404K', saves: '233K', shares: '870K',
    thumb: 6.6,
    comments: [
      '@html.agent: i have been crying in <div>s for an hour',
      ['cobol.mainframe', 'B tier?? i processed your paycheck this morning'],
      ['prompt.engineer', 'english in S is correct. i write it every day. mostly "please"'],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t > 8.0 && t < 9.8) {
        // tiptoe pizzicato
        const sneak = ['E3', null, 'G3', null, 'E3', 'D#3', 'E3', null, 'B2', null, 'D3', null, 'E3', null, null, null];
        const n = sneak[step % 16];
        if (n) SFX.pluck(n, { vol: 0.16, type: 'triangle' });
        if (step % 2 === 1) SFX.tick({ vol: 0.12 });
        return;
      }
      if (t > STORM - 0.1 && t < STORM_END) { if (step % 2 === 0) SFX.kick({ vol: 0.35 }); return; }
      const bass = ['C2', 'C2', 'E2', 'G2', 'A2', 'A2', 'G2', 'E2'];
      if (step % 4 === 0) SFX.kick({ vol: 0.45 });
      if (step % 4 === 2) SFX.snare({ vol: 0.18 });
      SFX.hat({ vol: 0.04 });
      if (step % 2 === 0) SFX.bass(bass[(step / 2) % 8], 0.22, { vol: 0.25 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;
      const storm = prog(t, STORM, 0.3) * (1 - prog(t, STORM_END, 0.3));

      /* ---------- sounds ---------- */
      CARDS.forEach((c) => {
        if (env.at(c.s)) { SFX.pop({ f: 420, vol: 0.18 }); SFX.swoosh({ vol: 0.1 }); }
        if (env.at(c.s + DROP)) c.id === 'html' ? SFX.vine({ vol: 0.12 }) : SFX.thud({ vol: 0.4 });
      });
      COMMENTS.forEach((_, i) => {
        if (env.at(STORM + i * 0.1)) i % 4 === 0 ? SFX.notify({ vol: 0.12 }) : SFX.blip(700 + P.hash(i) * 900, { vol: 0.06 });
      });
      if (env.at(6.5)) SFX.error({ vol: 0.14 });
      if (env.at(STORM_END)) SFX.swoosh({ vol: 0.2 });
      if (env.at(SNEAK + SNEAK_DUR)) { SFX.tick({ vol: 0.4 }); SFX.chirp({ when: 0.1, vol: 0.12 }); }
      if (env.at(9.85)) SFX.chime({ vol: 0.1 });
      if (env.at(RESET)) SFX.whoosh({ vol: 0.25 });

      /* ---------- board ---------- */
      ctx.save();
      P.shake(ctx, t, storm * 7 + 14 * (1 - prog(t, HTML_DROP, 0.4)) * (t >= HTML_DROP ? 1 : 0));
      P.grid(ctx, '#2E2A5C', 'rgba(255,255,255,0.07)', 60);

      P.title(ctx, 'LANGUAGE TIER LIST', 540, 335, { size: 82, color: C.yellow, rot: Math.sin(t * 2.2) * 0.02 });
      P.text(ctx, '(no hate)', 870, 400, { size: 46, font: 'hand', color: C.pink, rot: 0.1 + Math.sin(t * 3) * 0.04 });

      TIERS.forEach(([L, col], r) => {
        const y = ROW_Y(r);
        const hit = CARDS.some(c => c.tier === r && pulse(t, c.s + DROP - 0.02, 0.25) > 0);
        P.rect(ctx, 210, y, 670, 140, hit ? '#4a4378' : '#3a3466', { radius: 10, seed: 70 + r, shadow: false });
        P.rect(ctx, 60, y, 140, 140, col, { radius: 12, seed: 80 + r });
        P.text(ctx, L, 130, y + 74, { size: 86, font: 'bubble', color: C.ink, shadow: false, scale: 1 + (hit ? 0.12 : 0) });
      });
      // tray
      P.rect(ctx, 60, 1230, 820, 170, '#F6EEDD', { radius: 18, seed: 90 });
      P.text(ctx, 'unranked', 90, 1250, { size: 26, font: 'marker', color: '#a08f78', align: 'left', shadow: false });

      /* ---------- cards ---------- */
      const lifted = [];
      CARDS.forEach((c, i) => {
        const [x, y, sc, rot, lift, sq] = cardState(i, t);
        if (lift) { lifted.push([c, x, y, sc, rot]); return; }
        drawCard(ctx, c.id, x, y, sc, rot, t, { sq, sad: c.id === 'html' && t >= HTML_DROP && t < RESET });
        if (sq) P.burstLines(ctx, x, y, 72, prog(t, c.s + DROP, 0.3), C.paper, 10, 6);
      });
      // cobol dust puff
      const dust = prog(t, CARDS[4].s + DROP, 0.6);
      if (dust > 0 && dust < 1) {
        const [dx, dy] = slotPos(2, 0);
        ctx.save(); ctx.globalAlpha = 1 - dust;
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * TAU;
          P.circle(ctx, dx + Math.cos(a) * (60 + dust * 70), dy + Math.sin(a) * (40 + dust * 50), 18 + dust * 14, '#cfc6b4', { shadow: false, seed: k });
        }
        ctx.restore();
      }
      // brainfk sparkles
      const sp = prog(t, CARDS[5].s + DROP, 0.8);
      if (sp > 0 && sp < 1 && t < RESET) {
        const [bx, by] = slotPos(0, 1);
        for (let k = 0; k < 5; k++) P.star(ctx, bx + Math.cos(k * 1.3) * 80, by + Math.sin(k * 1.9) * 70 - sp * 30, 16 * (1 - sp), C.yellow, { shadow: false });
      }

      // english (sneaky)
      const en = englishState(t);
      drawCard(ctx, 'english', en[0], en[1], en[2], en[3], t, { lifted: t >= SNEAK && t < SNEAK + SNEAK_DUR });
      if (t >= SNEAK + SNEAK_DUR && t < RESET) {
        const g = pulse(t, SNEAK + SNEAK_DUR + 0.1, 0.9);
        for (let k = 0; k < 4; k++) P.star(ctx, EN_SLOT[0] - 60 + k * 40, EN_SLOT[1] - 70 - g * 20 - (k % 2) * 16, 14 * g, '#fff', { shadow: false, rot: k });
      }

      // lifted cards on top
      lifted.forEach(([c, x, y, sc, rot]) => drawCard(ctx, c.id, x, y, sc, rot, t, { lifted: true }));

      // tag bubbles after drops
      CARDS.forEach(c => {
        if (!c.tag) return;
        const pp = ease.outBack(prog(t, c.s + DROP + 0.05, 0.2)) * (1 - prog(t, c.s + DROP + 0.75, 0.12));
        if (pp <= 0 || t >= RESET) return;
        const [x, y] = slotPos(c.tier, c.slot);
        const bx = P.clamp(x + 150, 250, 800);
        P.bubble(ctx, c.tag, bx, y - 96, x + 20, y - 50, { size: 34, pop: pp, seed: c.s * 10 | 0 });
      });

      // Clawd's arm (regular drags, from bottom-right)
      if (t < HTML_DROP + 0.35) {
        let tip = keyPos(t, ARM_KEYS);
        const dragging = CARDS.find(c => t >= c.s && t < c.s + DROP);
        if (dragging) { const st = cardState(CARDS.indexOf(dragging), t); tip = [st[0] + 20, st[1] + 30]; }
        P.arm(ctx, tip[0], tip[1], tip[0] + 520, tip[1] + 1250, 84);
      }
      ctx.restore();

      /* ---------- the sneaky part ---------- */
      const peek = ease.outBack(prog(t, SNEAK - 0.25, 0.35)) * (1 - ease.inCubic(prog(t, 10.0, 0.3)));
      if (peek > 0) {
        const cx = lerp(1220, 1010, peek), cy = 560 + Math.sin(t * 5) * 6;
        const holding = t >= SNEAK && t < SNEAK + SNEAK_DUR + 0.15;
        if (holding) P.arm(ctx, en[0] + 30, en[1] + 10, cx - 20, cy + 10, 64);
        const mood = t >= SNEAK + SNEAK_DUR ? 'wink' : 'sus';
        P.claude(ctx, cx, cy, 120, { t, mood, rot: -0.25 });
        if (t < SNEAK + SNEAK_DUR) P.text(ctx, 'shhh', cx - 70, cy - 150, { size: 46, font: 'hand', color: C.pink, rot: -0.2, scale: pulse(t, SNEAK, 0.9) + pulse(t, SNEAK + 0.8, 0.7) });
      }

      /* ---------- the comment storm ---------- */
      if (t >= STORM && t < STORM_END + 0.4) {
        const r = P.rng(21);
        COMMENTS.forEach(([h, txt], i) => {
          const x = 180 + r() * 720, y = 330 + r() * 1150, rot = (r() - 0.5) * 0.22;
          const pop = ease.outBack(prog(t, STORM + i * 0.1, 0.22)) * (1 - ease.inCubic(prog(t, STORM_END + i * 0.012, 0.2)));
          commentCard(ctx, h, txt, x, y, rot, pop, AV_COLS[i % AV_COLS.length], 100 + i);
        });
        const big = ease.outBack(prog(t, 6.5, 0.3)) * (1 - ease.inCubic(prog(t, STORM_END, 0.25)));
        P.title(ctx, 'HTML IS NOT A\nPROGRAMMING\nLANGUAGE', 540, 880, { size: 110, color: C.red, pop: big, rot: -0.07, lineHeight: 1.05 });
        P.text(ctx, '💬 99+', 780, 1120, { size: 64, font: 'bubble', color: '#fff', stroke: C.red, strokeWidth: 14, scale: big, rot: 0.1 });
      }

      /* ---------- caption sticker ---------- */
      if (t < STORM) P.sticker(ctx, 'part 1 of 47 (no hate)', 70, 1500, { pop: 1 - prog(t, STORM - 0.15, 0.15) });
      else if (t < 8.0) P.sticker(ctx, 'ok SOME hate', 70, 1500, { pop: ease.outBack(prog(t, 6.9, 0.3)) * (1 - prog(t, 7.85, 0.15)) });
      else if (t < RESET) P.sticker(ctx, 'english is a programming language now', 70, 1500, { pop: ease.outBack(prog(t, 9.75, 0.35)) * (1 - prog(t, RESET - 0.1, 0.1)) });
      else P.sticker(ctx, 'part 1 of 47 (no hate)', 70, 1500, { pop: ease.outBack(prog(t, RESET + 0.2, 0.4)) });
    },
  });
})();
