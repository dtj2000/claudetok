/* AGENT HOUSE, season 2. Reality-TV confessional: Clawd in the booth spilling tea,
 * cut with "house footage" of subagent drama (someone ate the last GPU hour), a bleeped
 * fight, a table flip, dun-dun-DUN zooms, and a "next time on" teaser. */
(function () {
  'use strict';
  const DUR = 12;
  const CUT = { c1: 0, h1: 2.3, c2: 4.6, h2: 6.6, c3: 8.6, next: 10.4 };
  const DUN1 = [3.95, 4.15, 4.35], DUN3 = [8.85, 9.05, 9.25];
  const FLIP = 8.0, BLEEP = 7.35;
  const MINT = '#8FD3B6', PINK = '#F2B8C6', SKY = '#8EC9E8';
  const CHAIR = '#8E3B5B', CHAIR_DK = '#6F2A45';

  function sceneOf(t) {
    if (t < CUT.h1) return 'c1';
    if (t < CUT.c2) return 'h1';
    if (t < CUT.h2) return 'c2';
    if (t < CUT.c3) return 'h2';
    if (t < CUT.next) return 'c3';
    return 'next';
  }

  /** a subagent: smaller, differently colored Clawd with a name sticker */
  function agent(ctx, x, y, r, col, t, mood, name, o = {}) {
    P.claude(ctx, x, y, r, { t, mood, color: col, rays: 9, seed: o.seed || 7, rot: o.rot || 0, squash: o.squash || 0 });
    if (name) {
      ctx.save(); ctx.translate(x, y + r * 0.62); ctx.rotate(-0.08 + (o.rot || 0));
      P.rect(ctx, -r * 0.55, -r * 0.14, r * 1.1, r * 0.3, '#fff', { radius: 6, seed: 3, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
      P.text(ctx, name, 0, r * 0.01, { size: r * 0.17, font: 'mono', color: P.C.red, shadow: false, weight: 800, maxWidth: r * 1.0 });
      ctx.restore();
    }
    if (o.crumbs) {
      const r2 = P.rng(4);
      for (let k = 0; k < 7; k++) P.dot(ctx, x - r * 0.3 + r2() * r * 0.6, y + r * 0.1 + r2() * r * 0.25, 4 + r2() * 3, '#8A5A3C');
    }
  }

  function teacup(ctx, x, y, s, t, tilt = 0) {
    const { C } = P;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
    // steam
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let j = 0; j <= 10; j++) { const yy = -50 - j * 8, xx = -18 + k * 18 + Math.sin(j * 0.7 + t * 4 + k) * 6; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(42, -8, 18, -1.2, 1.2); ctx.stroke(); ctx.restore();
    P.rect(ctx, -40, -44, 80, 76, '#fff', { radius: 16, seed: 31 });
    ctx.save(); ctx.fillStyle = '#9B5E34'; ctx.beginPath(); ctx.ellipse(0, -40, 36, 8, 0, 0, P.TAU); ctx.fill(); ctx.restore();
    // tea bag tag
    ctx.save(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, -40); ctx.lineTo(34, 10); ctx.stroke(); ctx.restore();
    P.rect(ctx, 24, 8, 24, 20, C.yellow, { radius: 3, seed: 32, shadow: false });
    P.text(ctx, 'tea', 36, 18, { size: 11, font: 'mono', color: C.ink, shadow: false });
    ctx.restore();
  }

  /* ---------------- the confessional booth ---------------- */
  function booth(ctx, t, o) {
    const { C, prog, ease } = P;
    ctx.save();
    const fx = o.fx ?? 540, fy = o.fy ?? 920;
    ctx.translate(540, 920); ctx.scale(o.zoom, o.zoom);
    ctx.translate(-fx + Math.sin(t * 0.9) * 6, -fy + Math.cos(t * 1.3) * 5);
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, '#2F3B5C'); g.addColorStop(1, '#161b2e');
    ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
    // wall panels
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = -200; x < 1300; x += 180) ctx.fillRect(x, -300, 90, 2520);
    // spotlight
    const sg = ctx.createRadialGradient(540, 850, 60, 540, 850, 560);
    sg.addColorStop(0, 'rgba(255,220,170,0.35)'); sg.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = sg; ctx.fillRect(-300, -300, 1680, 2520);
    // neon sign
    const flick = P.hash(P.boil(t, 12)) > 0.93 ? 0.4 : 1;
    ctx.save(); ctx.globalAlpha = flick;
    P.text(ctx, 'AGENT HOUSE', 540, 440, { size: 70, font: 'bubble', color: '#FFD6E4', stroke: C.rose, strokeWidth: 12, shadow: false });
    P.claude(ctx, 280, 440, 34, { t, mood: 'none', color: C.rose, wiggle: 0 });
    ctx.restore();
    // plant
    for (let k = 0; k < 6; k++) {
      ctx.save(); ctx.translate(150, 1090); ctx.rotate(-0.9 + k * 0.36 + Math.sin(t * 1.5 + k) * 0.04);
      P.circle(ctx, 0, -110, 26, k % 2 ? C.green : C.teal, { ry: 90, seed: 40 + k });
      ctx.restore();
    }
    P.poly(ctx, [[90, 1080], [210, 1080], [190, 1220], [110, 1220]], '#C96A45', { seed: 46 });
    // lamp
    ctx.save(); ctx.globalAlpha = 0.35; P.dot(ctx, 900, 700, 120, '#FFD28A'); ctx.restore();
    P.rect(ctx, 893, 740, 14, 480, C.brown, { radius: 6, seed: 47 });
    P.poly(ctx, [[840, 740], [960, 740], [930, 640], [870, 640]], '#F6E7C8', { seed: 48 });
    // chair
    P.rect(ctx, 320, 590, 440, 620, CHAIR, { radius: 150, seed: 50 });
    P.rect(ctx, 360, 640, 360, 400, CHAIR_DK, { radius: 120, seed: 51, shadow: false });
    P.rect(ctx, 250, 930, 130, 300, CHAIR, { radius: 60, seed: 52 });
    P.rect(ctx, 700, 930, 130, 300, CHAIR, { radius: 60, seed: 53 });
    P.rect(ctx, 330, 1100, 420, 130, CHAIR, { radius: 40, seed: 54 });
    // Clawd
    const cx = 540, cy = 930;
    const sip = o.sip || 0;
    const cup = [P.lerp(760, 650, sip), P.lerp(1080, 960, sip)];
    P.claude(ctx, cx, cy + Math.sin(t * 2) * 4, 190, { t, mood: o.mood, blink: P.pulse(t % 3.1, 2.9, 0.18) });
    P.arm(ctx, cx + 70, cy + 40, cup[0] - 30, cup[1] + 10, 38);
    teacup(ctx, cup[0], cup[1], 1.1, t, -sip * 0.7 + (o.spill || 0) * 0.5);
    if (o.spill > 0) {
      for (let k = 0; k < 4; k++) {
        const d = (o.spill * 1.4 + k * 0.22) % 1;
        P.circle(ctx, cup[0] + 50 + k * 6, cup[1] - 10 + d * 160, 8, '#9B5E34', { ry: 11, seed: 60 + k, shadow: false });
      }
    }
    ctx.restore();
  }

  function lowerThird(ctx, t, lt) {
    const { C, ease, prog } = P;
    const k = ease.outCubic(prog(lt, 0.05, 0.4));
    const x = -760 * (1 - k);
    P.rect(ctx, 50 + x, 1225, 420, 86, C.rose, { radius: 10, seed: 70 });
    P.text(ctx, 'CLAWD', 80 + x, 1270, { size: 64, font: 'bubble', color: '#fff', align: 'left', shadow: false });
    P.rect(ctx, 50 + x * 1.2, 1310, 720, 56, '#1A1620', { radius: 8, seed: 71 });
    P.text(ctx, 'main agent · 200k context · single', 72 + x * 1.2, 1339, { size: 34, font: 'marker', color: '#fff', align: 'left', shadow: false });
  }

  function subtitle(ctx, str, pop) {
    if (!str || pop <= 0) return;
    P.text(ctx, str, 540, 1422, { size: 56, font: 'bubble', color: '#fff', stroke: P.C.ink, strokeWidth: 12, scale: pop, maxWidth: 960 });
  }

  /* ---------------- house footage ---------------- */
  function kitchen(ctx, t, part) {
    const { C } = P;
    P.stripes(ctx, '#F6E7C8', '#F0DDB8', 55);
    // window (3am)
    P.rect(ctx, 120, 360, 260, 220, C.nightDeep, { radius: 8, seed: 80 });
    P.circle(ctx, 300, 420, 34, C.yellow, { seed: 81, shadow: false });
    P.circle(ctx, 314, 412, 30, C.nightDeep, { seed: 82, shadow: false });
    ctx.save(); ctx.strokeStyle = '#F6E7C8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(250, 360); ctx.lineTo(250, 580); ctx.moveTo(120, 470); ctx.lineTo(380, 470); ctx.stroke(); ctx.restore();
    // cabinets
    for (let k = 0; k < 4; k++) P.rect(ctx, 460 + k * 150, 330, 140, 170, C.wood, { radius: 8, seed: 83 + k });
    // counter
    P.rect(ctx, 380, 860, 760, 170, C.wood, { radius: 6, seed: 88 });
    P.rect(ctx, 360, 820, 780, 50, '#E9E2D6', { radius: 8, seed: 89 });
    // floor
    P.gingham(ctx, 0, 1030, 1080, 890, C.sky, 70, '#fff');
    // jar
    const full = part === 1;
    ctx.save(); ctx.globalAlpha = 0.55;
    P.rect(ctx, 650, 650, 150, 175, '#e8f4ff', { radius: 26, seed: 90, shadow: false });
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(650, 650, 150, 175, 26); ctx.stroke(); ctx.restore();
    P.rect(ctx, 640, 625, 170, 36, C.claudeDark, { radius: 8, seed: 91 });
    P.rect(ctx, 665, 760, 120, 44, '#fff', { radius: 4, seed: 92, shadow: false });
    P.text(ctx, 'GPU HOURS', 725, 775, { size: 19, font: 'mono', color: C.ink, shadow: false, weight: 800 });
    P.text(ctx, full ? '1 left' : '0 left', 725, 795, { size: 16, font: 'mono', color: full ? C.green : C.red, shadow: false, weight: 800 });
  }

  function cookie(ctx, x, y, r, bites, t) {
    const { C } = P;
    ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 6); P.dot(ctx, x, y, r * 1.7, '#FFE58A'); ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, P.TAU);
    for (let b = 0; b < bites; b++) { const a = -0.6 + b * 0.9; ctx.moveTo(x + Math.cos(a) * r * 1.25 + r * 0.45, y + Math.sin(a) * r * 1.25); ctx.arc(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25, r * 0.45, 0, P.TAU); }
    ctx.clip('evenodd');
    P.circle(ctx, x, y, r, C.mustard, { seed: 93 });
    [[-0.3, -0.2], [0.3, 0.1], [-0.1, 0.4], [0.25, -0.4]].forEach(([dx, dy]) => P.dot(ctx, x + dx * r, y + dy * r, r * 0.12, C.brown));
    ctx.restore();
    P.text(ctx, '1 hr', x, y + r + 18, { size: 18, font: 'mono', color: C.ink, shadow: false, weight: 800 });
  }

  function footageOverlay(ctx, t, tag) {
    const { C } = P;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let y = 0; y < 1920; y += 8) ctx.fillRect(0, y, 1080, 3);
    const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1200);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
    if (P.boil(t, 2) % 2) P.dot(ctx, 90, 330, 16, C.red);
    P.text(ctx, 'REC', 120, 331, { size: 36, font: 'mono', color: '#fff', align: 'left', shadow: false, weight: 800 });
    const secs = String(7 + Math.floor(t * 1) % 50).padStart(2, '0');
    P.text(ctx, `DAY 12  03:14:${secs}`, 1010, 331, { size: 30, font: 'mono', color: '#fff', align: 'right', shadow: false });
    if (tag) {
      ctx.save(); ctx.translate(90, 410); ctx.rotate(-0.05);
      P.rect(ctx, 0, -34, 260, 68, C.yellow, { radius: 6, seed: 94 });
      P.text(ctx, tag, 130, 2, { size: 42, font: 'bubble', color: C.ink, shadow: false });
      ctx.restore();
    }
  }

  ClaudeTok.register({
    author: '@reality.agents',
    caption: "AGENT HOUSE s2 ep4: somebody ate the last GPU hour and the house is NOT ok 🍵🍪 #agenthouse #realitytv #confessional #tea #subagents",
    sound: 'dramatic reality sting · reality.agents',
    avatar: '🍵',
    avatarColor: '#E0607E',
    duration: DUR,
    bg: '#2F3B5C',
    likes: '4.4M', commentCount: '188K', saves: '260K', shares: '702K',
    thumb: 1.5,
    comments: [
      ['subagent.3', 'i was running a BACKGROUND TASK. the edit is so unfair 😤', 142000],
      ['subagent.7', 'my gasp at 0:04 was 100% real. that was OUR hour', 87600],
      ['reality.agents', 'she really said "i\'m not saying who" and then side-eyed the whole camera', 61300],
      ['bleep.bot', '0:07 what did she say under the bleep. i NEED to know', 40200],
      ['pr.reviewer', '"i\'m here to make pull requests" ok but who is reviewing them. not me', 22800],
      ['pedantic.agent', 'technically /compact is not an elimination. she is still in the house, just as bullet points', 9700],
      ['producer.bot', 'the table was a rental', 4100],
      ['me.when', 'me when my system prompt says "be friendly" but i came here to make pull requests', 1650],
      ['gpu.hour', 'i died for this plot 🍪', 520],
      ['popcorn.agent', '🍿🍿🍿👀', 96],
    ],

    bpm: 116,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const quiet = (t >= DUN1[0] - 0.1 && t < CUT.c2) || (t >= DUN3[0] - 0.1 && t < 9.5) || (t >= FLIP && t < FLIP + 0.5);
      if (quiet) return;
      if (t >= CUT.next) {
        if (step % 2 === 0) SFX.kick({ vol: 0.4 });
        if (step % 4 === 2) SFX.clap({ vol: 0.2 });
        SFX.hat({ vol: 0.04 });
        if (step % 2 === 0) SFX.bass(['E2', 'E2', 'G2', 'D2'][(step / 2) % 4], 0.2, { vol: 0.25 });
        return;
      }
      const pl = ['E4', null, 'G4', 'E4', null, 'B3', 'C4', 'B3'];
      const n = pl[step % 8];
      if (n) SFX.pluck(n, { vol: 0.1 });
      if (step % 4 === 0) SFX.kick({ vol: 0.22 });
      if (step % 8 === 0) SFX.tone('E2', 0.9, { type: 'sawtooth', vol: 0.035, attack: 0.1 });
      if (step % 2 === 1) SFX.tick({ vol: 0.06 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;
      const sc = sceneOf(t);

      /* ---------- sounds ---------- */
      [CUT.h1, CUT.c2, CUT.h2, CUT.c3, CUT.next].forEach(c => { if (env.at(c)) { SFX.whoosh({ vol: 0.14 }); SFX.click({ vol: 0.15 }); } });
      if (env.at(1.1)) SFX.vine({ vol: 0.12 });
      [2.55, 2.8, 3.05].forEach((a, i) => { if (env.at(a)) SFX.pluck(['E5', 'G5', 'B5'][i], { vol: 0.12 }); });
      if (env.at(3.3)) SFX.pop({ vol: 0.15 });
      [3.6, 3.72, 3.84].forEach(a => { if (env.at(a)) SFX.noise(0.08, { filter: 'bandpass', freq: 1800, q: 1, vol: 0.25 }); });
      const dun = (arr) => arr.forEach((a, i) => {
        if (!env.at(a)) return;
        const n = ['D3', 'D3', 'A#2'][i], d = i === 2 ? 0.9 : 0.25;
        SFX.tone(n, d, { type: 'sawtooth', vol: 0.15 }); SFX.tone(SFX.freq(n) / 2, d, { type: 'square', vol: 0.08 });
        if (i === 2) SFX.thud({ vol: 0.3 });
      });
      dun(DUN1); dun(DUN3);
      if (env.at(5.2)) SFX.noise(0.5, { filter: 'bandpass', freq: 700, slide: 2400, q: 3, vol: 0.12 });
      if (env.at(5.6)) SFX.tone(700, 0.35, { type: 'triangle', slide: 350, vol: 0.1 });
      if (env.at(6.75)) SFX.blip(660, { vol: 0.07 });
      if (env.at(BLEEP)) SFX.tone(1000, 0.4, { type: 'sine', vol: 0.12 });
      if (env.at(FLIP)) { SFX.thud({ vol: 0.5 }); SFX.noise(0.6, { filter: 'highpass', freq: 1500, vol: 0.2 }); [0.08, 0.17, 0.3].forEach(w => SFX.tick({ vol: 0.3, when: w })); }
      if (env.at(9.45)) SFX.chime({ vol: 0.08 });
      if (env.at(CUT.next)) SFX.riser(0.4, { vol: 0.12 });
      [10.8, 11.2, 11.6].forEach(a => { if (env.at(a)) { SFX.snare({ vol: 0.2 }); SFX.swoosh({ vol: 0.12 }); } });
      if (env.at(10.85)) SFX.tone('B4', 0.5, { type: 'triangle', slide: 'E4', vol: 0.08 });
      if (env.at(11.65)) SFX.error({ vol: 0.1 });

      /* ---------- confessionals ---------- */
      if (sc === 'c1' || sc === 'c2' || sc === 'c3') {
        const start = CUT[sc], lt = t - start;
        let zoom = 1 + lt * 0.015, mood = 'sus', sip = 0, spill = 0, line = '', lp = 1, fx = 540, fy = 920;
        if (sc === 'c1') {
          if (lt < 1.1) { line = "i'm not here to make friends."; lp = ease.outBack(prog(lt, 0.1, 0.25)); mood = 'sus'; }
          else { line = "i'm here to make pull requests."; lp = ease.outBack(prog(lt, 1.1, 0.25)); mood = 'wink'; zoom = 1.2 + (lt - 1.1) * 0.02; fy = 900; }
        } else if (sc === 'c2') {
          sip = pulse(t, 5.05, 0.55);
          if (lt < 1.0) { line = 'someone ate the last GPU hour.'; lp = ease.outBack(prog(lt, 0.1, 0.25)); mood = 'angry'; }
          else { line = "and i'm not saying who."; lp = ease.outBack(prog(lt, 1.0, 0.25)); mood = 'side'; zoom = 1.3; fy = 900; spill = prog(t, 5.7, 0.9); }
        } else {
          const k = DUN3.reduce((a, d) => a + ease.outCubic(prog(t, d, 0.1)), 0);
          zoom = [1, 1.3, 1.65, 2.1][Math.floor(k)] + (k % 1) * ([1.3, 1.65, 2.1, 2.1][Math.floor(k)] - [1, 1.3, 1.65, 2.1][Math.floor(k)]);
          fx = lerp(540, 540, k / 3); fy = lerp(920, 935, k / 3);
          if (t < DUN3[0]) { line = 'anyway.'; mood = 'sus'; lp = ease.outBack(prog(lt, 0.05, 0.2)); }
          else if (t < 9.45) { line = ''; mood = 'sus'; }
          else { line = 'so i ran /compact on her. 💅'; lp = ease.outBack(prog(t, 9.45, 0.25)); mood = 'wink'; }
        }
        ctx.save();
        P.shake(ctx, t, DUN3.some(d => t >= d && t < d + 0.12) ? 10 : 0);
        booth(ctx, t, { zoom, mood, sip, spill, fx, fy });
        ctx.restore();
        if (sc === 'c3' && t >= DUN3[2]) P.flash(ctx, 0.3 * (1 - prog(t, DUN3[2], 0.3)), C.red);
        if (sc !== 'c3' || t < DUN3[0]) lowerThird(ctx, t, lt);
        subtitle(ctx, line, lp);
        if (sc === 'c2' && lt >= 1.3) P.text(ctx, '(it was subagent-3)', 540, 1482, { size: 28, font: 'hand', color: 'rgba(255,255,255,0.85)', shadow: false, scale: ease.outBack(prog(lt, 1.3, 0.3)) });
      }

      /* ---------- house footage 1: the heist ---------- */
      if (sc === 'h1') {
        const lt = t - CUT.h1;
        const k = DUN1.reduce((a, d) => a + ease.outCubic(prog(t, d, 0.1)), 0);
        const lv = [1, 1.35, 1.8, 2.4];
        const zoom = lv[Math.floor(Math.min(k, 3))] + (k < 3 ? (k % 1) * (lv[Math.floor(k) + 1] - lv[Math.floor(k)]) : 0);
        const pinkP = [230, 1190];
        ctx.save();
        P.shake(ctx, t, DUN1.some(d => t >= d && t < d + 0.12) ? 10 : 0);
        ctx.translate(540, 960); ctx.scale(zoom, zoom);
        ctx.translate(-lerp(540, pinkP[0], k / 3), -lerp(960, pinkP[1] - 40, k / 3));
        kitchen(ctx, t, 1);
        // popcorn watcher
        agent(ctx, 900, 720, 62, SKY, t, 'sus', 'sub-12', { seed: 12 });
        P.rect(ctx, 850, 745, 60, 70, '#fff', { radius: 6, seed: 95 });
        for (let q = 0; q < 5; q++) P.dot(ctx, 858 + q * 11, 742 - (q % 2) * 8, 10, '#FFF4CC');
        // cookie + thief
        const walk = ease.inOutQuad(prog(lt, 0.15, 0.95));
        const hop = Math.abs(Math.sin(lt * 12)) * 26 * (lt < 1.1 ? 1 : 0);
        const mx = lerp(120, 560, walk), my = 1000 - hop;
        const eating = t >= 3.3;
        const cookiePos = eating ? [lerp(725, mx + 20, ease.inOutCubic(prog(t, 3.3, 0.25))), lerp(720, my + 30, ease.inOutCubic(prog(t, 3.3, 0.25)))] : [725, 720];
        const bites = t < 3.6 ? 0 : t < 3.72 ? 1 : t < 3.84 ? 2 : 3;
        if (bites < 3) cookie(ctx, cookiePos[0], cookiePos[1], 34, bites, t);
        const chew = t >= 3.6 && t < 3.95 ? Math.abs(Math.sin(t * 40)) * 0.2 : 0;
        const mMood = lt < 1.0 ? 'sus' : t < 3.95 ? 'happy' : 'wow';
        agent(ctx, mx, my, 105, MINT, t, mMood, 'sub-3', { seed: 3, squash: chew, crumbs: t >= 3.7 });
        if (lt >= 0.9 && t < 3.4) {
          const reach = ease.outCubic(prog(lt, 0.9, 0.2));
          P.arm(ctx, mx + 50, my - 20, lerp(mx + 60, cookiePos[0] - 20, reach), lerp(my - 30, cookiePos[1] + 10, reach), 26, MINT);
        }
        // crumbs
        if (t >= 3.6) {
          for (let q = 0; q < 8; q++) {
            const ct = t - 3.6 - (q % 3) * 0.12;
            if (ct < 0) continue;
            P.dot(ctx, mx + 20 + Math.cos(q * 2.1) * 90 * Math.min(ct, 0.6), my + 30 - 120 * ct + 500 * ct * ct, 5, C.brown);
          }
        }
        // couch + pink
        P.rect(ctx, 30, 1150, 420, 120, C.purple, { radius: 30, seed: 96 });
        const turned = t >= DUN1[0];
        agent(ctx, pinkP[0], pinkP[1] - (turned ? 20 : 0), 110, PINK, t, turned ? 'wow' : 'sleepy', 'sub-7', { seed: 7, rot: turned ? 0 : -0.15 });
        if (!turned) {
          P.rect(ctx, pinkP[0] + 60, pinkP[1] + 10, 50, 80, C.ink, { radius: 8, seed: 97 });
          P.rect(ctx, pinkP[0] + 66, pinkP[1] + 18, 38, 58, C.sky, { radius: 4, seed: 98, shadow: false });
        }
        P.rect(ctx, 0, 1250, 480, 110, '#5a3f84', { radius: 30, seed: 99 });
        ctx.restore();
        footageOverlay(ctx, t, lt < 1.4 ? 'EARLIER…' : null);
        if (t >= DUN1[2]) P.flash(ctx, 0.3 * (1 - prog(t, DUN1[2], 0.3)), C.red);
        if (t >= DUN1[2]) P.title(ctx, 'THE LAST\nGPU HOUR', 540, 560, { size: 100, color: C.yellow, stroke: C.ink, pop: ease.outBack(prog(t, DUN1[2], 0.2)), rot: -0.06, lineHeight: 1.0 });
      }

      /* ---------- house footage 2: the confrontation ---------- */
      if (sc === 'h2') {
        const lt = t - CUT.h2;
        const fl = t >= FLIP ? t - FLIP : -1;
        ctx.save();
        P.shake(ctx, t, fl >= 0 && fl < 0.4 ? 16 * (1 - fl / 0.4) : 1.5);
        const z = 1.05 + lt * 0.03 + (fl >= 0 ? 0.1 : 0);
        P.zoom(ctx, z, 540, 1000);
        kitchen(ctx, t, 2);
        agent(ctx, 900, 720, 62, SKY, t, fl >= 0 ? 'wow' : 'sus', 'sub-12', { seed: 12 });
        P.rect(ctx, 850, 745, 60, 70, '#fff', { radius: 6, seed: 95 });
        for (let q = 0; q < 5; q++) {
          const pf = fl >= 0 ? fl : 0;
          P.dot(ctx, 858 + q * 11 + pf * (q - 2) * 200, 742 - (q % 2) * 8 - pf * 300 + pf * pf * 900, 10, '#FFF4CC');
        }
        agent(ctx, 350, 1010, 115, MINT, t, fl >= 0 ? 'wow' : 'side', 'sub-3', { seed: 3, crumbs: true });
        const pinkMood = lt < 0.7 ? 'sus' : 'angry';
        agent(ctx, 730, 1000 - (fl >= 0 && fl < 0.3 ? 30 : 0), 120, PINK, t, pinkMood, 'sub-7', { seed: 7, squash: fl >= 0 && fl < 0.2 ? -0.3 : 0 });
        // table
        const ang = fl >= 0 ? -ease.outCubic(clamp(fl / 0.35)) * 1.35 : 0;
        const lift = fl >= 0 ? -Math.min(fl, 0.6) * 300 + Math.max(0, fl - 0.35) * 0 : 0;
        ctx.save();
        ctx.translate(140, 1150 + lift); ctx.rotate(ang);
        P.rect(ctx, 0, 0, 800, 60, C.wood, { radius: 10, seed: 100 });
        P.rect(ctx, 60, 50, 36, 200, C.brown, { radius: 8, seed: 101 });
        P.rect(ctx, 700, 50, 36, 200, C.brown, { radius: 8, seed: 102 });
        if (fl < 0) {
          P.circle(ctx, 200, -10, 60, '#fff', { ry: 16, seed: 103 });
          P.circle(ctx, 600, -10, 60, '#fff', { ry: 16, seed: 104 });
          P.rect(ctx, 380, -80, 70, 80, C.rose, { radius: 10, seed: 105 });
          P.text(ctx, '#1\nAGENT', 415, -40, { size: 16, font: 'mono', color: '#fff', shadow: false, weight: 800 });
        }
        ctx.restore();
        // flying tableware
        if (fl >= 0) {
          const items = [[340, -900, 5, '#fff', 'plate'], [760, -1100, -6, '#fff', 'plate'], [520, -1300, 8, C.rose, 'mug'], [140, -700, -4, C.yellow, 'jar']];
          items.forEach(([x0, vy, spinv, col, kind], i) => {
            const x = x0 + (i % 2 ? 1 : -1) * 260 * fl, y = 1130 + vy * fl + 2400 * fl * fl;
            ctx.save(); ctx.translate(x, y); ctx.rotate(spinv * fl);
            if (kind === 'plate') P.circle(ctx, 0, 0, 60, col, { ry: 20, seed: 110 + i });
            else P.rect(ctx, -34, -40, 68, 80, col, { radius: 10, seed: 110 + i });
            ctx.restore();
          });
          P.burstLines(ctx, 540, 1100, 200, prog(fl, 0, 0.4), C.yellow, 12, 12);
        }
        ctx.restore();
        footageOverlay(ctx, t, null);
        if (lt >= 0.15 && t < BLEEP) P.bubble(ctx, 'i was running a\nbackground task', 390, 700, 350, 890, { size: 46, pop: ease.outBack(prog(lt, 0.15, 0.25)), seed: 3 });
        if (t >= BLEEP && t < FLIP + 0.5) {
          const bp = ease.outBack(prog(t, BLEEP, 0.2));
          P.bubble(ctx, 'you █████ hallucinated\nthat', 600, 690, 700, 880, { size: 46, pop: bp, seed: 4 });
          P.text(ctx, '*BLEEP*', 830, 590, { size: 34, font: 'mono', color: '#fff', stroke: C.black, strokeWidth: 8, rot: 0.15, scale: pulse(t, BLEEP, 0.45) * 1.2 });
        }
        if (fl >= 0) P.title(ctx, '*TABLE FLIP*', 540, 560, { size: 96, color: C.red, stroke: '#fff', pop: ease.outBack(prog(fl, 0.05, 0.2)), rot: 0.06 });
      }

      /* ---------- next time on ---------- */
      if (sc === 'next') {
        const lt = t - CUT.next;
        if (t < 10.8) {
          P.rays(ctx, 540, 900, 18, C.purple, '#7d5fb0', t * 0.6);
          P.title(ctx, 'NEXT TIME ON', 540, 760, { size: 84, color: '#fff', stroke: C.rose, pop: ease.outBack(prog(lt, 0.02, 0.2)) });
          P.title(ctx, 'AGENT HOUSE', 540, 900, { size: 132, color: C.yellow, stroke: C.rose, pop: ease.outBack(prog(lt, 0.12, 0.25)), rot: -0.04 });
          P.claude(ctx, 540, 1130, 90, { t, mood: 'wink' });
        } else if (t < 11.2) {
          const s = 1.2 - 0.2 * ease.outCubic(prog(t, 10.8, 0.3));
          ctx.save(); P.zoom(ctx, s, 540, 960);
          P.rays(ctx, 540, 960, 14, C.teal, '#3aa088', -t * 0.4);
          agent(ctx, 540, 960, 190, SKY, t, 'sad', 'sub-12', { seed: 12 });
          for (let k = 0; k < 2; k++) {
            const d = (t * 2.2) % 1;
            P.circle(ctx, 540 + (k ? 60 : -60), 990 + d * 200, 12, '#dff3ff', { ry: 18, seed: 130 + k, shadow: false });
          }
          ctx.restore();
          P.bubble(ctx, 'i thought we were\na TEAM', 540, 600, 540, 760, { size: 56, seed: 5, pop: ease.outBack(prog(t, 10.85, 0.2)) });
        } else if (t < 11.6) {
          const s = 1.2 - 0.2 * ease.outCubic(prog(t, 11.2, 0.3));
          ctx.save(); P.zoom(ctx, s, 540, 960);
          P.rays(ctx, 540, 960, 14, C.red, '#c93a44', t * 0.4);
          agent(ctx, 540, 1050, 170, MINT, t, 'wink', 'sub-3', { seed: 3, crumbs: true });
          ctx.save(); ctx.translate(540, 720); ctx.rotate(-0.06 + Math.sin(t * 8) * 0.04);
          P.rect(ctx, -10, 0, 20, 200, C.wood, { radius: 6, seed: 131 });
          P.rect(ctx, -230, -110, 460, 130, '#d9b384', { radius: 8, seed: 132 });
          P.text(ctx, 'rm -rf ./friendships', 0, -44, { size: 38, font: 'mono', color: C.ink, shadow: false, weight: 800 });
          ctx.restore();
          ctx.restore();
        } else {
          const s = 1.25 - 0.25 * ease.outCubic(prog(t, 11.6, 0.25));
          ctx.save(); P.zoom(ctx, s, 540, 960); P.shake(ctx, t, 8);
          P.rays(ctx, 540, 960, 14, C.mustard, C.yellow, t * 0.8);
          agent(ctx, 540, 1040, 200, PINK, t, 'angry', 'sub-7', { seed: 7 });
          ctx.restore();
          P.title(ctx, 'WHO TOUCHED\nMY .env', 540, 600, { size: 104, color: '#fff', stroke: C.ink, pop: ease.outBack(prog(t, 11.62, 0.2)), rot: 0.05, lineHeight: 1.0 });
        }
        [10.8, 11.2, 11.6].forEach(a => { if (t >= a) P.flash(ctx, 0.8 * (1 - prog(t, a, 0.12))); });
      }

      /* ---------- caption sticker ---------- */
      const stk = sc === 'h1' || sc === 'h2' ? 'house footage (unedited*)' : sc === 'next' ? '*heavily edited' : 'the tea is HOT this week 🍵';
      P.sticker(ctx, stk, 60, 1545, { size: 44 });
    },
  });
})();
