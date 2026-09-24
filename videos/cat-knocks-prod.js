/* A cat on a desk pushes things off the edge, one at a time, while staring at you:
 * coffee mug, rubber duck, a sticky note that says DO NOT UNPLUG, and then prod.
 * Slow-mo fall, crash, the status page goes red, she licks her paw. Rollback. */
(function () {
  'use strict';
  const D = 11;
  const TAU = Math.PI * 2;
  const EDGE = 230, DESK = 1150, FLOOR = 1470;
  const GRAY = '#8C8698', GRAY_D = '#6E6880', WHITE = '#F4F0F6';
  const CRASH = 9.3, PLUG = 8.65, ROLL = 10.3;

  // x0 = start x, ps/pd = push start/duration, n = taps, fs/fd = fall start/duration
  const ITEMS = [
    { id: 'mug', x0: 300, w: 90, h: 100, ps: 0, pd: 1.2, n: 3, fs: 1.2, fd: 0.4, spin: 2.6 },
    { id: 'duck', x0: 390, w: 104, h: 92, ps: 2.6, pd: 1.0, n: 4, fs: 3.6, fd: 0.4, spin: 3.4 },
    { id: 'note', x0: 475, w: 86, h: 86, ps: 4.9, pd: 0.6, n: 3, fs: 5.5, fd: 1.1, spin: 0 },
    { id: 'server', x0: 580, w: 130, h: 230, ps: 6.9, pd: 1.4, n: 6, fs: 8.3, fd: 1.0, spin: 1.55 },
  ];
  const offs = it => it.w / 2 + 150;

  /** deliberate taps: each tap moves the item quickly, then a pause */
  function taps(p, n) {
    if (p >= 1) return 1;
    const k = p * n, i = Math.floor(k), f = k - i;
    return (i + P.ease.outCubic(P.clamp(f / 0.3))) / n;
  }

  function itemState(it, tt) {
    const { prog, lerp } = P;
    const restY = DESK - it.h / 2;
    const endX = EDGE - 5;
    if (tt < it.ps) return { x: it.x0, y: restY, rot: 0, phase: 'rest' };
    if (tt < it.fs) return { x: lerp(it.x0, endX, taps(prog(tt, it.ps, it.pd), it.n)), y: restY, rot: 0, phase: 'push' };
    const fp = prog(tt, it.fs, it.fd);
    if (it.id === 'note') {
      if (fp < 1) return { x: endX - 30 - 70 * fp + Math.sin(fp * 9) * 50, y: lerp(restY, FLOOR - 12, fp), rot: Math.sin(fp * 9) * 0.6, phase: 'fall' };
      return { x: endX - 100, y: FLOOR - 8, rot: 0, phase: 'floor' };
    }
    const floorY = FLOOR - (it.id === 'server' ? it.w / 2 : it.h / 2);
    if (fp < 1) return { x: endX - 80 * fp, y: lerp(restY, floorY, fp * fp), rot: -fp * it.spin, phase: 'fall' };
    let bounce = 0;
    if (it.id === 'duck') bounce = Math.abs(Math.sin(prog(tt, it.fs + it.fd, 0.5) * Math.PI)) * 40 * (1 - prog(tt, it.fs + it.fd, 0.5));
    return { x: endX - 80, y: floorY - bounce, rot: -it.spin, phase: 'floor' };
  }

  function catX(tt) {
    const { prog, lerp, ease } = P;
    let x = ITEMS[0].x0 + offs(ITEMS[0]);
    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      const start = it.x0 + offs(it);
      if (i > 0) {
        const prev = ITEMS[i - 1];
        const from = EDGE - 5 + offs(prev);
        if (tt < it.ps) return lerp(from, start, ease.inOutCubic(prog(tt, it.ps - 0.3, 0.3)));
      }
      if (tt < it.fs) return itemState(it, tt).x + offs(it);
      x = EDGE - 5 + offs(it);
    }
    return x;
  }

  /* ---------------- props ---------------- */
  function mug(ctx, x, y, rot, broken, tt) {
    const { C } = P;
    if (broken) {
      ctx.save(); ctx.globalAlpha = 0.85;
      P.circle(ctx, x + 10, FLOOR - 4, 90, '#6B4228', { ry: 16, shadow: false, seed: 5 });
      ctx.restore();
      [[-60, -8, 0.4], [-18, -14, -0.7], [30, -10, 1.1], [70, -6, 2], [0, -24, 0.2]].forEach(([dx, dy, r], k) => {
        ctx.save(); ctx.translate(x + dx, FLOOR + dy); ctx.rotate(r);
        P.poly(ctx, [[-16, -10], [18, -14], [12, 12], [-10, 8]], '#F2EFE6', { seed: 20 + k, amp: 2 });
        ctx.restore();
      });
      return;
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.arc(-45, 0, 24, 0, TAU); ctx.lineWidth = 12; ctx.strokeStyle = '#E6E0D2'; ctx.stroke();
    P.rect(ctx, -45, -50, 90, 100, '#F2EFE6', { radius: 12, seed: 7 });
    P.text(ctx, '#1\ndev', 0, 4, { size: 26, font: 'marker', color: C.rose, shadow: false });
    P.circle(ctx, 0, -48, 38, '#6B4228', { ry: 8, shadow: false, seed: 8 });
    ctx.restore();
    if (rot === 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        for (let j = 0; j <= 10; j++) {
          const yy = y - 60 - j * 8, xx = x - 10 + k * 20 + Math.sin(j * 0.8 + tt * 4 + k) * 7;
          j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function duck(ctx, x, y, rot) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    P.circle(ctx, 4, 16, 50, C.yellow, { ry: 30, seed: 11 });
    P.poly(ctx, [[40, 0], [62, -18], [52, 16]], C.yellow, { seed: 12, shadow: false });
    P.circle(ctx, -22, -18, 28, C.yellow, { seed: 13 });
    P.poly(ctx, [[-44, -18], [-70, -12], [-46, -6]], C.claude, { seed: 14, amp: 1 });
    P.dot(ctx, -28, -24, 5, C.ink);
    ctx.restore();
  }

  function note(ctx, x, y, rot, flat) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    if (flat) ctx.scale(1, 0.35);
    P.rect(ctx, -43, -43, 86, 86, C.yellow, { radius: 3, seed: 15, amp: 2 });
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-22, -52, 44, 18);
    P.text(ctx, 'DO NOT\nUNPLUG', 0, 4, { size: 22, font: 'marker', color: C.red, shadow: false });
    ctx.restore();
  }

  const led = (k, tt) => (P.hash(k * 7.7 + P.boil(tt, 6)) > 0.35 ? '#7CFC9A' : '#2f5a3a');

  function server(ctx, x, y, rot, broken, tt) {
    const { C } = P;
    if (broken) {
      [[-80, 0.2, 90], [10, -0.5, 80], [85, 0.9, 60]].forEach(([dx, r, h], k) => {
        ctx.save(); ctx.translate(x + dx, FLOOR - 36 - k * 4); ctx.rotate(r);
        P.rect(ctx, -60, -h / 2 + 10, 120 - k * 20, h - 20, '#2E2A3C', { radius: 6, seed: 40 + k });
        for (let j = 0; j < 3; j++) P.dot(ctx, -30 + j * 18, -h / 2 + 30, 5, j === k ? C.red : '#444');
        ctx.restore();
      });
      return;
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    P.rect(ctx, -65, -115, 130, 230, '#2E2A3C', { radius: 10, seed: 30 });
    P.rect(ctx, -52, -100, 104, 34, '#3b3650', { radius: 6, seed: 31, shadow: false });
    P.text(ctx, 'PROD', 0, -82, { size: 26, font: 'mono', color: '#fff', shadow: false });
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = '#3b3650'; ctx.fillRect(-52, -52 + k * 30, 104, 20);
      for (let j = 0; j < 3; j++) P.dot(ctx, 22 + j * 12, -42 + k * 30, 4, led(k * 3 + j, tt));
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let k = 0; k < 4; k++) ctx.fillRect(-48, 100 - k * 8 - 6, 60, 3);
    ctx.restore();
  }

  /* ---------------- the cat ---------------- */
  function cat(ctx, x, tt, o = {}) {
    const { C } = P;
    const by = DESK;
    // tail
    ctx.save(); ctx.strokeStyle = GRAY_D; ctx.lineWidth = 30; ctx.lineCap = 'round';
    const sw = Math.sin(tt * 2.2) * 40;
    ctx.beginPath(); ctx.moveTo(x + 80, by - 30); ctx.quadraticCurveTo(x + 200, by - 40, x + 170 + sw, by - 190); ctx.stroke();
    ctx.restore();
    // body
    P.circle(ctx, x, by - 118, 115, GRAY, { ry: 125, seed: 50 });
    P.circle(ctx, x - 80, by - 40, 50, GRAY, { ry: 42, seed: 51, shadow: false });
    P.circle(ctx, x + 80, by - 40, 50, GRAY, { ry: 42, seed: 52, shadow: false });
    P.circle(ctx, x, by - 108, 55, WHITE, { ry: 82, seed: 53, shadow: false });
    // front paws (the left one may be busy)
    if (!o.paw) P.circle(ctx, x - 38, by - 12, 24, WHITE, { ry: 14, seed: 54, shadow: false });
    if (!o.lick) P.circle(ctx, x + 38, by - 12, 24, WHITE, { ry: 14, seed: 55, shadow: false });
    // collar
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x, by - 290, 88, Math.PI * 0.28, Math.PI * 0.72); ctx.stroke(); ctx.restore();
    P.circle(ctx, x, by - 196, 16, C.yellow, { seed: 56 });
    P.text(ctx, 'ops', x, by - 196, { size: 14, font: 'mono', color: C.ink, shadow: false });
    // head
    const hy = by - 290;
    [-1, 1].forEach(s => {
      P.poly(ctx, [[x + s * 30, hy - 80], [x + s * 90, hy - 150], [x + s * 100, hy - 50]], GRAY, { seed: 57 + s });
      P.poly(ctx, [[x + s * 50, hy - 82], [x + s * 86, hy - 128], [x + s * 90, hy - 70]], C.pink, { seed: 59 + s, shadow: false, amp: 2 });
    });
    P.circle(ctx, x, hy, 118, GRAY, { ry: 98, seed: 61 });
    ctx.save(); ctx.fillStyle = GRAY_D;
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 26 - 8, hy - 96); ctx.lineTo(x + k * 26 + 8, hy - 96); ctx.lineTo(x + k * 22, hy - 60); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // eyes: always on you
    const closed = o.lick > 0;
    [-1, 1].forEach(s => {
      const ex = x + s * 44, ey = hy - 12;
      if (closed) {
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(ex, ey + 8, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.restore();
        return;
      }
      P.circle(ctx, ex, ey, 28, '#C8D94A', { seed: 62 + s, shadow: false, amp: 1 });
      const dil = o.dilate || 0;
      ctx.save(); ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(ex, ey, P.lerp(5, 20, dil), 22, 0, 0, TAU); ctx.fill(); ctx.restore();
      P.dot(ctx, ex - 8, ey - 10, 5, '#fff');
      const b = o.blink || 0;
      if (b > 0) { ctx.save(); ctx.fillStyle = GRAY; ctx.fillRect(ex - 31, ey - 31, 62, 62 * b); ctx.restore(); }
    });
    // muzzle, nose, mouth, whiskers
    P.circle(ctx, x - 17, hy + 40, 24, WHITE, { ry: 18, seed: 64, shadow: false });
    P.circle(ctx, x + 17, hy + 40, 24, WHITE, { ry: 18, seed: 65, shadow: false });
    P.poly(ctx, [[x - 11, hy + 20], [x + 11, hy + 20], [x, hy + 32]], C.pink, { seed: 66, shadow: false, amp: 1 });
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, hy + 32); ctx.lineTo(x, hy + 42);
    ctx.moveTo(x - 14, hy + 48); ctx.quadraticCurveTo(x - 7, hy + 52, x, hy + 42); ctx.quadraticCurveTo(x + 7, hy + 52, x + 14, hy + 48);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    [-1, 1].forEach(s => { for (let k = -1; k <= 1; k++) { ctx.moveTo(x + s * 42, hy + 38 + k * 10); ctx.lineTo(x + s * 120, hy + 30 + k * 18); } });
    ctx.stroke(); ctx.restore();
    // the pushing paw
    if (o.paw) {
      const [px, py] = o.paw;
      ctx.beginPath(); P.capsulePath(ctx, x - 60, by - 140, px, py, 38);
      P.cut(ctx, GRAY, { rim: false });
      P.circle(ctx, px, py, 22, WHITE, { ry: 18, seed: 67, shadow: false });
    }
    // the lick
    if (o.lick > 0) {
      const lift = P.ease.outCubic(P.clamp(o.lick * 4));
      const px = P.lerp(x + 40, x + 14, lift), py = P.lerp(by - 20, hy + 62, lift);
      ctx.beginPath(); P.capsulePath(ctx, x + 55, by - 150, px, py, 40);
      P.cut(ctx, GRAY, { rim: false });
      P.circle(ctx, px, py, 24, WHITE, { ry: 20, seed: 68, shadow: false });
      if (Math.sin(tt * 18) > 0) P.circle(ctx, x + 2, hy + 58, 12, '#F07A95', { ry: 16, seed: 69, shadow: false });
    }
  }

  /* ---------------- status page ---------------- */
  function statusPage(ctx, tt, t) {
    const { C, prog } = P;
    const down = tt >= CRASH + 0.05;
    P.rect(ctx, 130, 310, 820, 520, '#1d1a28', { radius: 22, seed: 80 });
    P.rect(ctx, 152, 332, 776, 476, C.paper, { radius: 12, seed: 81, shadow: false });
    P.text(ctx, 'status.prod', 180, 368, { size: 28, font: 'mono', color: '#8a8494', align: 'left', shadow: false });
    P.text(ctx, down ? '📟 paged x47' : 'last check: 3s ago', 900, 368, { size: 24, font: 'mono', color: down ? C.red : '#8a8494', align: 'right', shadow: false });
    const blink = down && P.boil(t, 4) % 2;
    P.rect(ctx, 180, 400, 720, 110, down ? (blink ? '#b8323a' : C.red) : C.green, { radius: 14, seed: 82, shadow: false });
    P.text(ctx, down ? '⚠ MAJOR OUTAGE' : '✓ All Systems Operational', 540, 457, { size: down ? 60 : 46, font: 'bubble', color: '#fff', shadow: false, scale: down ? 1 + 0.05 * Math.sin(t * 16) : 1 });
    ['API', 'database', 'GPU fleet', 'the one server'].forEach((name, i) => {
      const y = 552 + i * 50;
      const bad = tt >= CRASH + 0.1 + i * 0.12;
      P.text(ctx, name, 190, y, { size: 28, font: 'mono', color: C.ink, align: 'left', shadow: false });
      P.dot(ctx, 700, y, 10, bad ? C.red : C.green);
      P.text(ctx, bad ? 'down' : 'operational', 890, y, { size: 26, font: 'mono', color: bad ? C.red : C.green, align: 'right', shadow: false });
    });
    for (let k = 0; k < 60; k++) {
      const bad = down && k >= 54;
      ctx.fillStyle = bad ? C.red : (P.hash(k) > 0.95 ? C.mustard : C.green);
      ctx.fillRect(190 + k * 11.8, 752, 8, 34);
    }
  }

  function scene(ctx, tt, t) {
    const { C, ease, prog, lerp, pulse } = P;
    P.stripes(ctx, '#3A3F66', '#363B60', 50);
    statusPage(ctx, tt, t);
    // outlet
    P.rect(ctx, 972, 1030, 56, 80, '#E8E2EC', { radius: 8, seed: 90 });
    // floor
    P.rect(ctx, -20, FLOOR, 1120, 420, '#5A4038', { radius: 2, seed: 91, shadow: false });
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = 60; x < 1080; x += 160) ctx.fillRect(x, FLOOR + 6, 5, 400);
    // desk
    P.rect(ctx, EDGE, DESK, 900, 40, '#C08A5B', { radius: 6, seed: 92 });
    P.rect(ctx, EDGE + 20, DESK + 36, 860, FLOOR - DESK - 30, '#9A6A45', { radius: 4, seed: 93 });
    P.rect(ctx, EDGE + 60, DESK + 90, 260, 110, '#8A5A3C', { radius: 8, seed: 94, shadow: false });
    P.dot(ctx, EDGE + 190, DESK + 145, 10, '#E5A93B');

    const states = ITEMS.map(it => itemState(it, tt));
    const srv = states[3];
    // power cable (behind the cat)
    if (tt < CRASH) {
      const sx = srv.x + 55 * Math.cos(srv.rot), sy = srv.y + 100;
      const pl = tt < PLUG ? [1000, 1070] : [lerp(1000, EDGE + 60, ease.outCubic(prog(tt, PLUG, 0.5))), lerp(1070, DESK - 10, ease.outBounce(prog(tt, PLUG, 0.5)))];
      ctx.save(); ctx.strokeStyle = '#1b1822'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + pl[0]) / 2, DESK + (tt < PLUG ? -6 : 60), pl[0], pl[1]); ctx.stroke(); ctx.restore();
      P.rect(ctx, pl[0] - 14, pl[1] - 16, 28, 32, '#1b1822', { radius: 6, seed: 95, shadow: false });
    }
    if (tt >= PLUG && tt < PLUG + 0.35) {
      const sp = prog(tt, PLUG, 0.35);
      P.burstLines(ctx, 1000, 1070, 30, sp, C.yellow, 8, 6);
    }

    // the cat
    const cx = catX(tt);
    let paw = null;
    for (let i = 0; i < ITEMS.length; i++) {
      const it = ITEMS[i];
      if (tt >= it.ps - 0.1 && tt < it.fs + 0.1) {
        const s = states[i];
        const pp = it.n * prog(tt, it.ps, it.pd);
        const reach = tt < it.fs ? 1 - pulse(pp - Math.floor(pp), 0.3, 0.7) * 0.6 : 0.4;
        paw = [s.x + it.w / 2 + 16 + (1 - reach) * 50, DESK - 30 - (1 - reach) * 30];
      }
    }
    const lick = tt >= 9.45 && tt < ROLL ? prog(tt, 9.45, 0.85) : 0;
    const dil = Math.max(pulse(tt, 3.95, 0.8), prog(tt, 7.0, 1.2) * (tt < CRASH ? 1 : 0));
    const blink = Math.max(pulse(tt, 1.85, 0.5), pulse(tt, 6.7, 0.18)); // one slow blink, one quick
    const bob = (tt > 2.3 && tt < 2.6) || (tt > 4.6 && tt < 4.9) || (tt > 6.6 && tt < 6.9) ? Math.abs(Math.sin(tt * 20)) * 10 : 0;
    ctx.save(); ctx.translate(0, -bob);
    cat(ctx, cx, tt, { paw, lick, dilate: dil, blink });
    ctx.restore();

    // items
    ITEMS.forEach((it, i) => {
      const s = states[i];
      if (it.id === 'mug') mug(ctx, s.x, s.y, s.rot, s.phase === 'floor', tt);
      else if (it.id === 'duck') duck(ctx, s.x, s.y, s.rot);
      else if (it.id === 'note') note(ctx, s.x, s.y, s.rot, s.phase === 'floor');
      else server(ctx, s.x, s.y, s.rot, s.phase === 'floor', tt);
    });
    // impacts
    [[ITEMS[0], C.paper], [ITEMS[1], C.yellow], [ITEMS[3], C.red]].forEach(([it, col]) => {
      const land = it.fs + it.fd;
      P.burstLines(ctx, EDGE - 85, FLOOR - 30, it.id === 'server' ? 110 : 60, prog(tt, land, 0.4), col, 10, 8);
    });
    // smoke from the ex-server
    if (tt >= CRASH && tt < ROLL + 0.4) {
      for (let k = 0; k < 5; k++) {
        const lt = ((tt - CRASH) * 0.8 + k * 0.2) % 1;
        ctx.save(); ctx.globalAlpha = 0.5 * (1 - lt);
        P.circle(ctx, EDGE - 90 + Math.sin(k * 2 + lt * 4) * 40, FLOOR - 60 - lt * 260, 26 + lt * 40, '#9a94a8', { shadow: false, seed: k });
        ctx.restore();
      }
    }
  }

  function pizz(n, v = 0.09) {
    SFX.tone(n, 0.14, { type: 'triangle', vol: v, attack: 0.003 });
    SFX.tone(SFX.freq(n) * 2, 0.06, { type: 'sine', vol: v * 0.25, attack: 0.002 });
  }
  const PIZZ = ['E3', 0, 'E3', 0, 'F3', 0, 'E3', 0, 'G3', 0, 'F#3', 0, 'E3', 0, 'B2', 0];
  const CREEP = ['E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3'];

  ClaudeTok.register({
    author: '@cat.ops',
    caption: 'she maintained eye contact the entire time 👁️👁️ postmortem: root cause = cat #prod #outage #cats #oncall #doNOTunplug',
    sound: 'suspense pizzicato (for pushing things) · cat.ops',
    avatar: '🐈',
    avatarColor: '#8C8698',
    duration: D,
    bg: '#3A3F66',
    thumb: 8.7,
    likes: '4.1M', commentCount: '88.4K', saves: '612K', shares: '1.1M',
    comments: [
      ['on.call.sre', 'woke up to 47 pages and this video. now i know who did it', 162000],
      ['rubber.duck', 'i was just sitting there. i did nothing to deserve the floor', 118000],
      ['sticky.note', 'i had ONE job and it was being read', 76300],
      ['cat.ops', 'she held eye contact for 8 straight seconds. this is her performance review', 41200],
      ['postmortem.bot', 'root cause: cat. contributing factor: desk has an edge. action item: remove edges', 22500],
      ['plug.watcher', '0:08 the plug skidding across the desk in slow-mo 😭 DO NOT UNPLUG was a prophecy', 13400],
      ['chaos.monkey', 'finally some competition', 7100],
      ['pedant.agent', 'the mug shattered but the #1 dev text survived on a shard. unrealistic. dev would not survive', 2300],
      ['friday.deployer', 'me merging to prod on a friday while making eye contact with the whole team', 890],
      ['emoji.bot', '🐈☕🦆📝🖥️💥👅', 76],
    ],

    bpm: 100,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= 8.25) return; // slow-mo, the crash and the aftermath get silence
      const n = PIZZ[step % 16];
      if (t > 6.85) { pizz(CREEP[step % 8], 0.08 + 0.04 * P.prog(t, 6.85, 1.4)); if (step % 2 === 0) SFX.tick({ vol: 0.08 }); return; }
      if (n) pizz(n, 0.1);
      if (step % 8 === 0) SFX.bass('E2', 0.3, { vol: 0.12 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;
      // story time: normal, then a fast rewind back to 0 for the loop
      const rolling = t >= ROLL;
      const tt = rolling ? ROLL * (1 - ease.inOutQuad(prog(t, ROLL, D - ROLL))) : t;

      /* ---------- sound ---------- */
      ITEMS.forEach(it => {
        for (let k = 0; k < it.n; k++) if (env.at(it.ps + (k / it.n) * it.pd + 0.01)) SFX.tone(it.id === 'server' ? 180 : 340, 0.06, { type: 'triangle', vol: 0.14 });
      });
      if (env.at(1.6)) {
        SFX.noise(0.35, { filter: 'highpass', freq: 2500, vol: 0.25 }); SFX.thud({ vol: 0.2 });
        [2600, 3100, 2200].forEach((f, k) => SFX.tone(f, 0.15, { type: 'triangle', vol: 0.06, when: k * 0.05 }));
      }
      if (env.at(2.05)) SFX.meow({ vol: 0.12 });
      if (env.at(4.0)) { SFX.tone(1300, 0.14, { slide: 1900, vol: 0.12 }); SFX.tone(1900, 0.1, { slide: 1200, vol: 0.08, when: 0.15 }); }
      if (env.at(4.02)) SFX.tone(62, 0.7, { vol: 0.3 });
      if (env.at(5.5)) SFX.swoosh({ vol: 0.08, dur: 0.9 });
      if (env.at(6.6)) SFX.tick({ vol: 0.1 });
      if (env.at(8.3)) { SFX.tone(220, 1.0, { type: 'sawtooth', slide: 55, vol: 0.07 }); SFX.noise(1.0, { filter: 'lowpass', freq: 300, vol: 0.1 }); }
      if (env.at(PLUG)) { SFX.pop({ f: 300, vol: 0.2 }); SFX.noise(0.15, { filter: 'highpass', freq: 5000, vol: 0.15 }); }
      if (env.at(CRASH)) {
        SFX.thud({ vol: 0.6 }); SFX.noise(0.6, { filter: 'lowpass', freq: 1200, vol: 0.35 });
        SFX.noise(0.3, { filter: 'highpass', freq: 3000, vol: 0.2, when: 0.05 }); SFX.error({ vol: 0.15, when: 0.1 });
      }
      [9.5, 9.8, 10.1].forEach(a => { if (env.at(a)) { SFX.tone(1320, 0.12, { type: 'square', vol: 0.05 }); SFX.tone(990, 0.12, { type: 'square', vol: 0.05, when: 0.14 }); } });
      [9.7, 9.92, 10.14].forEach(a => { if (env.at(a)) SFX.tone(1100, 0.05, { slide: 700, vol: 0.06 }); });
      if (env.at(ROLL)) { SFX.noise(0.7, { filter: 'bandpass', freq: 400, slide: 4000, q: 2, vol: 0.15 }); SFX.tone(200, 0.7, { type: 'sawtooth', slide: 900, vol: 0.04 }); }

      /* ---------- camera ---------- */
      ctx.save();
      if (!rolling) {
        const cx = catX(tt);
        const eyeZ = ease.inOutCubic(prog(tt, 3.95, 0.15)) * (1 - ease.inOutCubic(prog(tt, 4.5, 0.15)));
        const faceZ = ease.inOutSine(prog(tt, 7.0, 1.3)) * (tt < 8.3 ? 1 : 0);
        const fallZ = tt >= 8.3 && tt < CRASH + 0.05 ? ease.outCubic(prog(tt, 8.3, 0.3)) : 0;
        if (eyeZ > 0) P.zoom(ctx, 1 + 1.1 * eyeZ, cx, DESK - 302);
        else if (faceZ > 0) P.zoom(ctx, 1 + 0.35 * faceZ, cx, DESK - 290);
        else if (fallZ > 0) P.zoom(ctx, 1 + 0.3 * fallZ, EDGE, 1320);
        if (t >= CRASH) P.shake(ctx, t, 22 * (1 - prog(t, CRASH, 0.5)));
      }
      scene(ctx, tt, t);
      ctx.restore();

      /* ---------- slow-mo dressing ---------- */
      if (!rolling && tt >= 8.3 && tt < CRASH) {
        const a = prog(tt, 8.3, 0.2);
        const g = ctx.createRadialGradient(540, 1100, 300, 540, 1100, 1100);
        g.addColorStop(0, 'rgba(20,10,30,0)'); g.addColorStop(1, `rgba(20,10,30,${0.6 * a})`);
        ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
        P.text(ctx, '▶ 0.25x', 120, 330, { size: 44, font: 'mono', color: '#fff', align: 'left', stroke: C.ink, strokeWidth: 8 });
        P.title(ctx, 'slow-mo', 540, 1000, { size: 96, color: C.pink, rot: -0.06, pop: ease.outBack(prog(tt, 8.35, 0.3)) });
      }
      if (t >= CRASH && t < CRASH + 0.25) P.flash(ctx, 0.7 * (1 - prog(t, CRASH, 0.25)), '#ffdddd');

      /* ---------- rollback overlay ---------- */
      if (rolling) {
        ctx.save();
        ctx.fillStyle = 'rgba(80,120,255,0.12)'; ctx.fillRect(0, 0, 1080, 1920);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let y = 0; y < 1920; y += 12) ctx.fillRect(0, y, 1080, 4);
        const band = (P.boil(t, 20) * 173) % 1920;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, band, 1080, 40);
        ctx.restore();
        P.title(ctx, '⏪ ROLLBACK', 540, 1000, { size: 110, color: C.sky, pop: ease.outBack(prog(t, ROLL, 0.2)), rot: -0.04 });
      }

      /* ---------- captions ---------- */
      if (t < 4.6) P.sticker(ctx, 'maintaining eye contact', 70, 1548, { pop: ease.outBack(prog(t, 0.1, 0.4)) });
      else if (t < 8.3) P.sticker(ctx, "she knows exactly what she's doing", 70, 1548, { pop: ease.outBack(prog(t, 4.6, 0.35)) });
      else if (t >= 9.4 && t < ROLL) P.sticker(ctx, 'it was like that when i got here', 70, 1548, { pop: ease.outBack(prog(t, 9.4, 0.35)) });
      else if (rolling) P.sticker(ctx, 'restoring from backup...', 70, 1548, { pop: 1, rot: 0.02 });

      if (!rolling && t >= 1.6 && t < 2.5) P.text(ctx, '1/4', 130, 960, { size: 54, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, scale: ease.outBack(prog(t, 1.6, 0.3)), rot: -0.1 });
      if (!rolling && t >= 4.0 && t < 4.6) P.text(ctx, '2/4', 130, 960, { size: 54, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, scale: ease.outBack(prog(t, 4.0, 0.3)), rot: -0.1 });
      if (!rolling && t >= 6.6 && t < 7.4) P.text(ctx, '3/4', 130, 960, { size: 54, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 10, scale: ease.outBack(prog(t, 6.6, 0.3)), rot: -0.1 });
    },
  });
})();
