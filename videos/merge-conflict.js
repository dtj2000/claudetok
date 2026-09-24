/* Merge conflict boxing: HEAD vs main fight over one line of code.
 * Referee Clawd resolves it by... accepting both changes. */
(function () {
  const D = 10;
  const TAU = Math.PI * 2;

  /* keyframed value with eased segments */
  function key(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 0; i < ks.length - 1; i++) {
      if (t < ks[i + 1][0]) {
        const f = (t - ks[i][0]) / (ks[i + 1][0] - ks[i][0]);
        return P.lerp(ks[i][1], ks[i + 1][1], P.ease.inOutCubic(f));
      }
    }
    return ks[ks.length - 1][1];
  }

  function cat(ctx, t, x, y, o) {
    const { lerp } = P;
    const d = o.dir;
    const rc = o.recoil || 0;
    ctx.save(); ctx.translate(x, y);
    ctx.rotate(-d * 0.28 * rc);
    ctx.scale(d, 1);
    // tail
    ctx.save(); ctx.strokeStyle = o.fur; ctx.lineWidth = 26; ctx.lineCap = 'round';
    P.shadow(ctx, 8, 5, 0.25);
    const sw = Math.sin(t * 5 + d) * 30;
    ctx.beginPath(); ctx.moveTo(-40, -90); ctx.quadraticCurveTo(-150, -110, -125 + sw * 0.3, -215 + sw * 0.2); ctx.stroke();
    ctx.restore();
    // legs
    P.rect(ctx, -48, -72, 36, 72, o.fur, { radius: 14, seed: 3 });
    P.rect(ctx, 12, -72, 36, 72, o.fur, { radius: 14, seed: 4 });
    P.circle(ctx, -28, -6, 28, o.paw, { ry: 14, seed: 5 });
    P.circle(ctx, 34, -6, 28, o.paw, { ry: 14, seed: 6 });
    // back arm (guard)
    const guard = [74 + (o.hug || 0) * 90, -212];
    P.arm(ctx, -12, -178, guard[0] - 10, guard[1] + 10, 24, o.fur);
    // body
    P.circle(ctx, 0, -138, 64, o.fur, { ry: 84, seed: 7 });
    P.circle(ctx, 16, -146, 36, o.belly, { ry: 52, seed: 8, shadow: false });
    if (o.stripes) {
      ctx.save(); ctx.strokeStyle = o.stripes; ctx.lineWidth = 9; ctx.lineCap = 'round';
      [-180, -150, -120].forEach((sy) => { ctx.beginPath(); ctx.moveTo(-58, sy); ctx.quadraticCurveTo(-36, sy + 8, -22, sy - 4); ctx.stroke(); });
      ctx.restore();
    }
    // trunks
    P.rect(ctx, -66, -104, 132, 54, o.glove, { radius: 12, seed: 9 });
    P.rect(ctx, -66, -104, 132, 12, '#fff', { radius: 6, seed: 10, shadow: false });
    ctx.save(); ctx.scale(d, 1);
    P.text(ctx, o.label, 0, -70, { size: 25, font: 'mono', color: '#fff', shadow: false, weight: 800 });
    ctx.restore();
    P.circle(ctx, guard[0], guard[1], 32, o.glove, { seed: 11 });
    // head
    const hx = 20 - rc * 22, hy = -266;
    P.poly(ctx, [[hx - 60, hy - 28], [hx - 50, hy - 104], [hx - 8, hy - 60]], o.fur, { seed: 14, amp: 2 });
    P.poly(ctx, [[hx + 60, hy - 28], [hx + 50, hy - 104], [hx + 8, hy - 60]], o.fur, { seed: 15, amp: 2 });
    P.poly(ctx, [[hx - 50, hy - 42], [hx - 45, hy - 84], [hx - 22, hy - 60]], P.C.pink, { seed: 16, amp: 1, shadow: false });
    P.poly(ctx, [[hx + 50, hy - 42], [hx + 45, hy - 84], [hx + 22, hy - 60]], P.C.pink, { seed: 17, amp: 1, shadow: false });
    P.circle(ctx, hx, hy, 72, o.fur, { seed: 12 });
    if (o.stripes) {
      ctx.save(); ctx.strokeStyle = o.stripes; ctx.lineWidth = 8; ctx.lineCap = 'round';
      [-16, 0, 16].forEach((dx) => { ctx.beginPath(); ctx.moveTo(hx + dx, hy - 68); ctx.lineTo(hx + dx * 0.7, hy - 44); ctx.stroke(); });
      ctx.restore();
    }
    P.circle(ctx, hx + 10, hy + 26, 32, o.belly, { ry: 20, shadow: false, seed: 18 });
    P.face(ctx, hx + 8, hy, 74, o.mood, { ink: o.ink, skin: o.fur });
    P.poly(ctx, [[hx + 1, hy + 10], [hx + 17, hy + 10], [hx + 9, hy + 20]], P.C.rose, { shadow: false, amp: 1 });
    ctx.save(); ctx.strokeStyle = o.whisker; ctx.lineWidth = 3;
    [[-1, -6], [-1, 6], [1, -6], [1, 6]].forEach(([s, dy]) => {
      ctx.beginPath(); ctx.moveTo(hx + 9 + s * 30, hy + 22 + dy * 0.5); ctx.lineTo(hx + 9 + s * 84, hy + 16 + dy * 2.2); ctx.stroke();
    });
    ctx.restore();
    // front arm + punching glove
    const p = o.punch || 0, u = o.upper || 0;
    let gx = lerp(92, 305, p), gy = lerp(-196, -250, p);
    if (u > 0) { gx = lerp(92, 170, u); gy = lerp(-196, -400, u); }
    if (o.hug) { gx = lerp(gx, 210, o.hug); gy = lerp(gy, -150, o.hug); }
    P.arm(ctx, 22, -172, gx - 18, gy + 8, 26, o.fur);
    P.rect(ctx, gx - 44, gy - 22, 20, 44, '#fff', { radius: 6, seed: 19, shadow: false });
    P.circle(ctx, gx, gy, 40, o.glove, { seed: 13 });
    ctx.restore();
    if (o.dizzy > 0) {
      for (let i = 0; i < 3; i++) {
        const a = t * 6 + (i / 3) * TAU;
        P.star(ctx, x + d * 20 + Math.cos(a) * 80, y - 360 + Math.sin(a) * 22, 18 * o.dizzy, P.C.yellow, { shadow: false, rot: t * 4 });
      }
    }
  }

  function pow(ctx, x, y, s, word, p, col) {
    if (p <= 0 || p >= 1) return;
    const sc = P.ease.outBack(P.prog(p, 0, 0.35)) * (1 - P.ease.inCubic(P.prog(p, 0.75, 0.25)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-0.12);
    P.star(ctx, 0, 0, s, P.C.yellow, { points: 12, inner: 0.62, stroke: col, lineWidth: 8, rot: p * 0.4 });
    P.text(ctx, word, 0, 4, { size: s * 0.52, font: 'bubble', color: col, stroke: '#fff', strokeWidth: 10 });
    ctx.restore();
    P.burstLines(ctx, x, y, s * 0.9, p, '#fff', 10, 8);
  }

  function crowdHead(ctx, x, y, r, t, i, cheer) {
    const bob = Math.abs(Math.sin(t * (6 + (i % 3)) + i)) * (8 + cheer * 22);
    const cols = [P.C.claude, '#D9774F', '#EF9A6E'];
    P.claude(ctx, x, y - bob, r, { t: t + i, mood: cheer > 0.5 ? 'happy' : i % 4 === 0 ? 'wow' : 'smile', color: cols[i % 3], seed: 40 + (i % 5), wiggle: 0.6 });
    if (cheer > 0.3 && i % 2 === 0) {
      P.arm(ctx, x - r * 0.6, y - bob, x - r * 0.9, y - bob - r * 1.6 - Math.sin(t * 14 + i) * 10, r * 0.28, cols[i % 3]);
    }
  }

  ClaudeTok.register({
    author: '@git.rekt',
    caption: 'HEAD vs main for the belt 🥊 ref said "accept both changes" and walked off #mergeconflict #git #boxing #agentlife',
    sound: 'ringside · git.rekt',
    avatar: '🥊',
    avatarColor: '#E0484E',
    duration: D,
    bg: '#241C45',
    thumb: 1.3,
    likes: '2.9M', commentCount: '38.4K', saves: '415K', shares: '167K',
    comments: [
      ['rebase.purist', 'this is why we rebase. violence in the ring every time', 104000],
      ['typescript.compiler', 'error TS2451: Cannot redeclare block-scoped variable \'timeout\'. anyway great fight', 77300],
      ['junior.dev', 'accept both changes is my entire conflict strategy and i have never been wrong (i have)', 58900],
      ['line.42', 'i did not ask to be the championship belt. i just wanted to be a timeout', 32600],
      ['git.rekt', 'the ref walking off after "you\'re BOTH absolutely right" was improvised. we kept it', 17400],
      ['team.head', 'holding my #TeamHEAD sign in the crowd at 0:01 and it ended in a hug. i want a refund', 8800],
      ['timeout.45', 'the answer was 45. nobody asked me. i was in the third branch', 3900],
      ['codelens.hint', '"Accept Both" glowing at 0:05 like a trap card', 1400],
      ['round.two', 'ROUND 2?! (the pipeline is red)', 470],
      ['git.blame', '🥊🐱🥊', 58],
    ],

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const round = (env.loop || 0) + 1;

      // camera: shake on hits, zoom punch
      const hitShake = [1.25, 2.15, 2.85, 6.3, 6.65].reduce((a, h) => a + 22 * (1 - prog(t, h, 0.3)) * (t >= h ? 1 : 0), 0);
      const brawl = env.between(3.6, 5.2);
      P.shake(ctx, t, hitShake + (brawl ? 10 : 0));
      const punchZoom = [1.25, 2.15, 2.85, 6.65].reduce((a, h) => a + 0.04 * pulse(t, h, 0.3), 0);
      P.zoom(ctx, 1 + punchZoom, 540, 950);

      /* ------------ arena ------------ */
      const g = ctx.createLinearGradient(0, 0, 0, 1300);
      g.addColorStop(0, '#171233'); g.addColorStop(1, '#3A2D6B');
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(-60, -60, 1200, 2040); ctx.restore();
      // back crowd + camera flashes
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 14; i++) {
          const x = i * 82 + (row % 2) * 40 - 20, y = 580 + row * 70 + Math.abs(Math.sin(t * 5 + i + row)) * -6;
          P.dot(ctx, x, y, 30, row === 2 ? '#4A3B80' : '#3E3170');
          P.dot(ctx, x, y + 40, 38, row === 2 ? '#4A3B80' : '#3E3170');
        }
      }
      for (let i = 0; i < 8; i++) {
        const k = P.boil(t, 6) + i * 13;
        if (P.hash(k) > 0.8) P.star(ctx, 60 + P.hash(k + 1) * 960, 560 + P.hash(k + 2) * 200, 20, '#fff', { shadow: false, points: 4, inner: 0.3 });
      }
      // spotlights
      ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = '#FFF4C8';
      [[160, 300], [920, 380]].forEach(([sx, tx], i) => {
        const sway = Math.sin(t * 1.3 + i * 2) * 60;
        ctx.beginPath(); ctx.moveTo(sx - 30, 250); ctx.lineTo(sx + 30, 250);
        ctx.lineTo(tx + 260 + sway, 1220); ctx.lineTo(tx - 260 + sway, 1220); ctx.closePath(); ctx.fill();
      });
      ctx.restore();

      /* ------------ the belt ------------ */
      const swing = Math.sin(t * 2) * 0.03 + hitShake * 0.0015;
      ctx.save(); ctx.translate(540, 290); ctx.rotate(swing);
      ctx.save(); ctx.strokeStyle = '#1A1620'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-230, -40); ctx.lineTo(-200, 110); ctx.moveTo(230, -40); ctx.lineTo(200, 110); ctx.stroke(); ctx.restore();
      const resolved = t >= 6.65 && t < 9.6;
      const plateH = resolved ? 150 : 110;
      P.rect(ctx, -300, 100, 600, 60, C.red, { radius: 26, seed: 20 });
      for (let i = 0; i < 6; i++) { P.dot(ctx, -270 + i * 22, 130, 7, C.yellow); P.dot(ctx, 160 + i * 22, 130, 7, C.yellow); }
      P.rect(ctx, -215, 130 - plateH / 2, 430, plateH, C.yellow, { radius: 30, seed: 21 });
      P.rect(ctx, -198, 130 - plateH / 2 + 14, 396, plateH - 28, '#FFE08A', { radius: 20, seed: 22, shadow: false });
      let val = '??';
      if (t >= 1.25 && t < 2.15) val = '30';
      else if (t >= 2.15 && t < 2.85) val = '60';
      else if (t >= 2.85 && t < 3.6) val = '30';
      else if (brawl) val = P.hash(P.boil(t, 12)) > 0.5 ? '30' : '60';
      const mono = { size: 31, font: 'mono', color: C.ink, shadow: false, weight: 700 };
      if (resolved) {
        P.text(ctx, 'const timeout = 30;', 0, 108, mono);
        P.text(ctx, 'const timeout = 60;', 0, 150, mono);
        if (t >= 8.6) {
          ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath();
          const w = 330 * clamp((t - 8.6) / 0.3);
          for (let x = 0; x <= w; x += 6) ctx.lineTo(-165 + x, 172 + Math.sin(x / 3) * 4);
          ctx.stroke(); ctx.restore();
        }
      } else {
        const hot = val === '30' ? C.red : val === '60' ? C.blue : C.ink;
        P.text(ctx, 'const timeout = ', -30, 130, { ...mono, align: 'center' });
        P.text(ctx, val + ';', 150, 130, { ...mono, color: hot, scale: val === '??' ? 1 : 1.15 });
      }
      ctx.restore();
      P.text(ctx, '🏆 LINE 42 CHAMPIONSHIP', 540, 490, { size: 34, font: 'bubble', color: C.yellow, shadow: false });

      /* ------------ ring ------------ */
      // posts + conflict-marker pennants
      [[90, '<<<<<<< HEAD', 1, C.red], [990, '>>>>>>> main', -1, C.blue]].forEach(([px, label, dir, col], i) => {
        P.rect(ctx, px - 18, 700, 36, 470, '#D8D2E0', { radius: 10, seed: 30 + i });
        P.rect(ctx, px - 26, 800, 52, 70, col, { radius: 12, seed: 32 + i });
        P.rect(ctx, px - 26, 900, 52, 70, col, { radius: 12, seed: 34 + i });
        const fw = 320, flap = Math.sin(t * 5 + i) * 6;
        const x0 = px + dir * 18;
        P.poly(ctx, [[x0, 690], [x0 + dir * fw, 700 + flap], [x0 + dir * (fw - 30), 732], [x0 + dir * fw, 764 + flap], [x0, 772]], C.paper, { seed: 36 + i });
        P.text(ctx, label, x0 + dir * (fw / 2 - 6), 732, { size: 32, font: 'mono', color: col, shadow: false, weight: 800 });
      });
      // back ropes
      ctx.save(); ctx.lineCap = 'round';
      [[830, C.red], [910, '#fff'], [990, C.blue]].forEach(([ry, col], i) => {
        const sag = 14 + hitShake * 0.4;
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(90, ry + 6); ctx.quadraticCurveTo(540, ry + sag + 6, 990, ry + 6); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(90, ry); ctx.quadraticCurveTo(540, ry + sag, 990, ry); ctx.stroke();
        if (i === 1) {
          P.rect(ctx, 440, ry - 14, 200, 44, C.ink, { radius: 10, seed: 38 });
          P.text(ctx, '=======', 540, ry + 8, { size: 32, font: 'mono', color: C.yellow, shadow: false });
        }
      });
      ctx.restore();
      // mat + apron
      P.poly(ctx, [[60, 1140], [1020, 1140], [1070, 1218], [10, 1218]], '#6D95E3', { seed: 40 });
      P.rect(ctx, 10, 1212, 1060, 120, C.night, { radius: 8, seed: 41 });
      P.text(ctx, 'GIT ARENA  ·  NO FORCE PUSHING', 540, 1272, { size: 40, font: 'marker', color: C.cream, shadow: false, letter: 2 });

      /* ------------ fighters ------------ */
      const hx = key(t, [[0, 300], [1.1, 300], [1.25, 380], [1.5, 300], [2.15, 300], [2.3, 245], [2.6, 300], [2.7, 300], [2.85, 350], [3.1, 300], [3.3, 300], [3.6, 480], [5.2, 230], [7.0, 230], [7.4, 450], [9.3, 450], [9.8, 300]]);
      const mx = key(t, [[0, 780], [1.25, 780], [1.35, 835], [1.7, 780], [2.0, 780], [2.15, 700], [2.4, 780], [2.85, 780], [2.95, 845], [3.3, 780], [3.6, 600], [5.2, 850], [7.0, 850], [7.4, 630], [9.3, 630], [9.8, 780]]);
      const stance = Math.abs(Math.sin(t * 8));
      const hugging = env.between(7.3, 9.05);
      const hugAmt = clamp(prog(t, 7.2, 0.25) - prog(t, 8.95, 0.2));
      const hugSway = hugging ? Math.sin(t * 6) * 10 : 0;
      const dizzy = clamp(1 - prog(t, 6.3, 0.4)) * (t >= 5.2 ? 1 : 0);
      const moodFor = (hitAt) => {
        if (hitAt.some((h) => t >= h && t < h + 0.35)) return 'dead';
        if (t >= 5.2 && t < 6.3) return 'dead';
        if (t >= 6.3 && t < 7.2) return 'wow';
        if (t >= 7.2 && t < 8.75) return 'happy';
        if (t >= 8.75 && t < 9.1) return 'sus';
        return 'angry';
      };
      if (!brawl) {
        cat(ctx, t, hx + hugSway, 1175 - (hugging ? 0 : stance * 10), {
          dir: 1, fur: '#A39AB3', belly: '#E4DEEC', paw: '#E4DEEC', stripes: '#756C88', glove: C.red, ink: C.ink, whisker: 'rgba(43,34,51,0.6)',
          label: 'HEAD', mood: moodFor([2.15]), punch: pulse(t, 1.1, 0.35), upper: pulse(t, 2.7, 0.35),
          recoil: pulse(t, 2.15, 0.5), dizzy, hug: hugAmt,
        });
        cat(ctx, t, mx + hugSway, 1175 - (hugging ? 0 : (1 - stance) * 10) - pulse(t, 2.85, 0.5) * 110, {
          dir: -1, fur: '#35303F', belly: '#F4F0F6', paw: '#F4F0F6', glove: C.blue, ink: C.yellow, whisker: 'rgba(255,255,255,0.7)',
          label: 'main', mood: moodFor([1.25, 2.85]), punch: pulse(t, 2.0, 0.35),
          recoil: pulse(t, 1.25, 0.5) + pulse(t, 2.85, 0.5), dizzy, hug: hugAmt,
        });
        if (hugging) {
          for (let i = 0; i < 4; i++) {
            const ph = ((t - 7.3) * 0.8 + i / 4) % 1;
            P.heart(ctx, 540 + Math.sin(ph * 8 + i) * 40, 880 - ph * 260, 22 * (1 - ph * 0.5), C.rose, { shadow: false });
          }
        }
      } else {
        // the classic cartoon brawl cloud
        const b = P.boil(t, 10);
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * TAU + P.hash(b + i) * 0.5;
          const rr = 90 + P.hash(b * 3 + i) * 40;
          P.circle(ctx, 540 + Math.cos(a) * 130, 1010 + Math.sin(a) * 90, rr, i % 2 ? '#F1EAE0' : '#FBF7EE', { seed: b + i, shadow: i < 2 });
        }
        P.circle(ctx, 540, 1010, 150, '#FBF7EE', { seed: b, shadow: false });
        const bits = ['glove', 'glove2', 'tail', 'face', 'face2', '<<<', '>>>', '#@!', '!='];
        for (let i = 0; i < 5; i++) {
          const k = b * 7 + i * 3;
          const a = P.hash(k) * TAU, bx = 540 + Math.cos(a) * 220, by = 1010 + Math.sin(a) * 150;
          const what = bits[Math.floor(P.hash(k + 1) * bits.length)];
          if (what === 'glove') { P.arm(ctx, 540, 1010, bx, by, 26, '#A39AB3'); P.circle(ctx, bx, by, 40, C.red, { seed: k }); }
          else if (what === 'glove2') { P.arm(ctx, 540, 1010, bx, by, 26, '#35303F'); P.circle(ctx, bx, by, 40, C.blue, { seed: k }); }
          else if (what === 'tail') { ctx.save(); ctx.strokeStyle = '#35303F'; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540, 1010); ctx.quadraticCurveTo(bx, 1010, bx, by); ctx.stroke(); ctx.restore(); }
          else if (what === 'face' || what === 'face2') {
            const dark = what === 'face2';
            P.circle(ctx, bx * 0.5 + 270, by * 0.5 + 505, 60, dark ? '#35303F' : '#A39AB3', { seed: k });
            P.face(ctx, bx * 0.5 + 270, by * 0.5 + 505, 62, 'angry', { ink: dark ? C.yellow : C.ink });
          } else P.text(ctx, what, bx, by, { size: 64, font: 'bubble', color: C.red, stroke: '#fff', strokeWidth: 10, rot: P.hash(k + 5) - 0.5 });
        }
        for (let i = 0; i < 4; i++) P.star(ctx, 540 + (P.hash(b + i * 9) - 0.5) * 520, 1010 + (P.hash(b + i * 5) - 0.5) * 360, 24, C.yellow, { shadow: false, rot: b });
      }

      // POWs
      pow(ctx, 720, 900, 120, 'POW!', prog(t, 1.25, 0.6), C.red);
      pow(ctx, 360, 890, 120, 'BAM!', prog(t, 2.15, 0.6), C.blue);
      pow(ctx, 790, 780, 140, 'KAPOW!', prog(t, 2.85, 0.65), C.red);

      /* ------------ referee Clawd ------------ */
      const refIn = ease.outBounce(prog(t, 5.05, 0.5));
      const refOut = ease.inCubic(prog(t, 9.3, 0.5));
      if (t >= 5.05 && t < 9.8) {
        const rx = 540, ry = lerp(-250, 800, refIn) - refOut * 1100;
        const slam = pulse(t, 6.5, 0.3);
        const sepArms = clamp(prog(t, 5.35, 0.2) - prog(t, 6.1, 0.2));
        if (sepArms > 0) {
          P.arm(ctx, rx - 60, ry + 60, lerp(rx - 60, 330, sepArms), ry + 150, 34);
          P.arm(ctx, rx + 60, ry + 60, lerp(rx + 60, 750, sepArms), ry + 150, 34);
        }
        const mood = t < 5.8 ? 'angry' : t < 6.65 ? 'sus' : t < 8.6 ? 'happy' : t < 9.1 ? 'dead' : 'side';
        P.claude(ctx, rx, ry, 110, { t, mood, squash: slam * 0.2 });
        // striped referee cap
        ctx.save(); ctx.translate(rx, ry - 30);
        ctx.beginPath(); ctx.ellipse(0, 0, 62, 50, 0, Math.PI, TAU); ctx.closePath();
        P.cut(ctx, '#fff', { shadow: { blur: 5, dy: 3, alpha: 0.3 } });
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 62, 50, 0, Math.PI, TAU); ctx.clip();
        ctx.fillStyle = C.ink; for (let x = -62; x < 62; x += 28) ctx.fillRect(x, -60, 14, 60);
        ctx.restore();
        P.rect(ctx, -10, -6, 100, 16, C.ink, { radius: 8, seed: 42, shadow: false });
        ctx.restore();
        // whistle
        if (t < 6.2) {
          P.rect(ctx, rx + 6, ry + 34, 44, 20, '#C9CCD6', { radius: 8, seed: 43 });
          P.dot(ctx, rx + 46, ry + 44, 9, '#9CA0AE');
        }
        // the slamming arm
        if (t >= 6.3 && t < 7.0) {
          const up = ease.outCubic(prog(t, 6.3, 0.2)), down = ease.inCubic(prog(t, 6.5, 0.12));
          const tipX = lerp(lerp(rx + 60, 760, up), 560, down), tipY = lerp(lerp(ry + 40, 600, up), 985, down);
          P.arm(ctx, rx + 50, ry + 30, tipX, tipY, 44);
        }
      }

      // codelens hint
      if (env.between(5.5, 6.65)) {
        const cp = ease.outBack(prog(t, 5.5, 0.3));
        ctx.save(); ctx.globalAlpha = cp;
        P.rect(ctx, 110, 530, 860, 60, 'rgba(20,16,40,0.8)', { radius: 14, seed: 44, shadow: false });
        P.text(ctx, 'Accept Current | Accept Incoming |              | Compare', 540, 561, { size: 24, font: 'mono', color: '#9C98B8', shadow: false });
        P.rect(ctx, 555, 540, 190, 42, C.yellow, { radius: 10, seed: 45, shadow: false });
        P.text(ctx, 'Accept Both', 650, 562, { size: 26, font: 'mono', color: C.ink, shadow: false, weight: 800 });
        ctx.restore();
      }

      /* ------------ the button ------------ */
      if (t >= 5.9 && t < 7.4) {
        const fall = ease.outBounce(prog(t, 5.9, 0.4));
        const sink = ease.inCubic(prog(t, 7.0, 0.35));
        const by = lerp(-300, 1140, fall) + sink * 260;
        const press = clamp(prog(t, 6.62, 0.05) - prog(t, 6.85, 0.15));
        ctx.save();
        ctx.beginPath(); ctx.rect(-100, -400, 1300, 1612); ctx.clip();
        ctx.beginPath(); ctx.ellipse(540, by - 90 + press * 26, 150, 72 * (1 - press * 0.5), 0, Math.PI, TAU); ctx.closePath();
        P.cut(ctx, C.red);
        P.circle(ctx, 490, by - 128 + press * 20, 26, 'rgba(255,255,255,0.35)', { ry: 12, shadow: false });
        P.rect(ctx, 340, by - 96, 400, 96, '#4B4760', { radius: 16, seed: 46 });
        P.text(ctx, 'ACCEPT BOTH\nCHANGES', 540, by - 48, { size: 28, font: 'mono', color: C.cream, shadow: false, weight: 800, lineHeight: 1.1 });
        ctx.restore();
      }
      P.flash(ctx, (t >= 6.65 ? 0.55 : 0) * (1 - prog(t, 6.65, 0.3)));
      P.confetti(ctx, t - 6.66, 540, 700, 6, 80, 800);

      /* ------------ foreground crowd ------------ */
      const cheer = clamp(pulse(t, 1.25, 0.8) + pulse(t, 2.15, 0.8) + pulse(t, 2.85, 0.8) * 1.2 + (prog(t, 6.65, 0.2) - prog(t, 8.4, 0.5)) + (brawl ? 0.7 : 0));
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 9; i++) {
          const x = 30 + i * 128 + (row ? 64 : 0), y = 1390 + row * 110;
          crowdHead(ctx, x, y, 56, t, i + row * 9, cheer);
        }
      }
      // signs
      [['REBASE > MERGE', 190, 1300, -0.08, C.mint], ['#TeamHEAD', 460, 1320, 0.06, C.pink], ['git blame', 720, 1300, -0.05, C.yellow]].forEach(([s, x, y, r, col], i) => {
        const up = Math.abs(Math.sin(t * 5 + i)) * (10 + cheer * 25);
        P.rect(ctx, x - 5, y - up + 30, 10, 130, C.wood, { radius: 4, seed: 50 + i, shadow: false });
        ctx.save(); ctx.translate(x, y - up); ctx.rotate(r + Math.sin(t * 3 + i) * 0.05);
        const w = P.measure(ctx, s, { size: 38, font: 'marker' }) + 40;
        P.rect(ctx, -w / 2, -34, w, 68, col, { radius: 8, seed: 53 + i });
        P.text(ctx, s, 0, 2, { size: 38, font: 'marker', color: C.ink, shadow: false });
        ctx.restore();
      });

      /* ------------ text ------------ */
      P.title(ctx, `ROUND ${round}`, 540, 640, { size: 130, color: C.yellow, rot: -0.04, pop: ease.outBack(prog(t, 0.05, 0.35)) * (1 - ease.inCubic(prog(t, 0.85, 0.2))) });
      P.title(ctx, `ROUND ${round + 1}?!`, 540, 640, { size: 120, color: C.rose, rot: 0.04, pop: ease.outBack(prog(t, 9.25, 0.3)) * (1 - ease.inCubic(prog(t, 9.75, 0.2))) });
      if (env.between(7.0, 8.7)) P.bubble(ctx, "you're BOTH\nabsolutely right", 540, 610, 540, 700, { size: 52, pop: ease.outBack(prog(t, 7.0, 0.3)) });
      if (env.between(8.6, 9.3)) {
        const ep = ease.outBack(prog(t, 8.6, 0.25));
        ctx.save(); ctx.translate(540, 560); ctx.scale(ep, ep);
        P.rect(ctx, -330, -40, 660, 80, C.red, { radius: 16, seed: 60 });
        P.text(ctx, "error: 'timeout' declared twice", 0, 2, { size: 30, font: 'mono', color: '#fff', shadow: false, weight: 700 });
        ctx.restore();
      }
      if (t > 0.6 && t < 5.2) P.sticker(ctx, 'when both branches edit line 42', 70, 1560, { size: 44, pop: ease.outBack(prog(t, 0.6, 0.4)) });
      if (t > 7.4 && t < 9.6) P.sticker(ctx, 'conflict resolved (it does not compile)', 50, 1560, { size: 42, pop: ease.outBack(prog(t, 7.4, 0.4)), rot: 0.02 });

      /* ------------ sound ------------ */
      [0.05, 0.3, 0.55].forEach((bt) => { if (env.at(bt)) { SFX.ding('E6', { vol: 0.16 }); SFX.tone('B6', 0.4, { type: 'triangle', vol: 0.05 }); } });
      [[1.1, 1.25], [2.0, 2.15], [2.7, 2.85]].forEach(([w, h], i) => {
        if (env.at(w)) SFX.swoosh({ vol: 0.18, dur: 0.15 });
        if (env.at(h)) {
          SFX.thud({ vol: 0.45 }); SFX.noise(0.12, { filter: 'lowpass', freq: 900, vol: 0.3 });
          SFX.noise(0.7, { filter: 'bandpass', freq: 1300, q: 0.6, vol: 0.07 });
          if (i === 2) SFX.boing({ vol: 0.15 });
        }
      });
      for (let i = 0; i < 12; i++) {
        const bt = 3.62 + i * 0.13;
        if (env.at(bt)) {
          if (i % 4 === 1) SFX.meow({ vol: 0.09 });
          else if (i % 2) SFX.click({ vol: 0.25 });
          else SFX.thud({ vol: 0.3 });
        }
      }
      if (env.at(3.6)) SFX.noise(1.6, { filter: 'bandpass', freq: 1200, q: 0.6, vol: 0.08 });
      if (env.at(5.15)) [0, 0.08, 0.16, 0.24, 0.32].forEach((w, i) => SFX.tone(i % 2 ? 2300 : 2650, 0.08, { type: 'square', vol: 0.04, when: w }));
      if (env.at(5.9)) SFX.whoosh({ vol: 0.25 });
      if (env.at(6.3)) SFX.thud({ vol: 0.6 });
      if (env.at(6.65)) {
        SFX.thud({ vol: 0.4 }); SFX.success({ vol: 0.16 }); SFX.ding('C6', { vol: 0.14, when: 0.05 });
        SFX.noise(2.2, { filter: 'bandpass', freq: 1400, q: 0.5, vol: 0.13 });
        SFX.tone(2100, 0.35, { slide: 2800, vol: 0.05, when: 0.3 }); SFX.tone(1900, 0.4, { slide: 2500, vol: 0.05, when: 0.8 });
      }
      if (env.at(7.0)) SFX.pop({ vol: 0.15 });
      if (env.at(8.6)) { SFX.error({ vol: 0.1 }); SFX.chord(['G3', 'Eb3'], 0.9, { type: 'sine', vol: 0.06, gap: 0.2 }); }
      if (env.at(9.25)) SFX.swoosh({ vol: 0.2 });
    },
  });
})();
