/* IN A WORLD… where context was only 4K tokens… one agent had to read the whole
 * codebase. Bwaaam. Montage. Quiet beat. Title slam. Fake rating card. */
(function () {
  const D = 12;
  const SERIF = 'Georgia, "Times New Roman", serif';
  const TOP = 520, BOT = 1400; // letterbox band

  // [start, end, kind, arg]
  const SHOTS = [
    [0.0, 1.3, 'card', 'IN A WORLD…'],
    [1.3, 1.9, 'files', 0],
    [1.9, 3.2, 'card', 'WHERE CONTEXT\nWAS ONLY\n4K TOKENS…'],
    [3.2, 3.8, 'json', 0],
    [3.8, 4.9, 'card', 'ONE AGENT…'],
    [4.9, 5.6, 'jump', 0],
    [5.6, 6.2, 'card', 'HAD TO READ…'],
    [6.2, 7.1, 'big', 'THE WHOLE\nCODEBASE'],
    [7.1, 7.45, 'files', 0.3],
    [7.45, 7.75, 'json', 0.25],
    [7.75, 8.0, 'term', 0],
    [8.0, 8.2, 'jump', 0.35],
    [8.2, 8.4, 'json', 0.45],
    [8.4, 8.95, 'quiet', 0],
    [8.95, 10.6, 'title', 0],
    [10.6, D, 'rating', 0],
  ];
  const BWAAMS = [0.03, 1.9, 3.8, 5.6];

  function bwaam(vol = 1, dur = 2.2) {
    SFX.tone(55, dur, { type: 'sawtooth', vol: 0.16 * vol, attack: 0.04 });
    SFX.tone(55, dur, { type: 'sawtooth', vol: 0.12 * vol, attack: 0.04, detune: 14 });
    SFX.tone(110, dur * 0.8, { type: 'sawtooth', vol: 0.06 * vol, attack: 0.05, detune: -9 });
    SFX.tone(41.2, dur, { type: 'sine', vol: 0.3 * vol, attack: 0.02 });
    SFX.noise(dur * 0.6, { filter: 'lowpass', freq: 600, slide: 120, vol: 0.18 * vol });
    SFX.kick({ vol: 0.45 * vol });
  }
  function hit(vol = 1) {
    bwaam(vol * 0.7, 0.55);
    SFX.snare({ vol: 0.14 * vol });
  }

  function metal(ctx, size) {
    const g = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.6);
    g.addColorStop(0, '#fffaf0'); g.addColorStop(0.45, '#e9d7b0'); g.addColorStop(0.55, '#a88a58'); g.addColorStop(1, '#f5e6c4');
    return g;
  }

  function card(ctx, str, lt, big, t) {
    const n = str.split('\n').length;
    const size = big ? 150 : n > 1 ? 92 : 110;
    const a = P.clamp(lt / 0.18);
    const s = (big ? 1.25 - 0.2 * P.ease.outCubic(P.clamp(lt / 0.3)) : 1) + lt * 0.05;
    ctx.save();
    ctx.globalAlpha = a;
    if (big) P.shake(ctx, t, 16 * (1 - P.clamp(lt / 0.5)));
    // lens flare streak
    const fx = -300 + ((lt * 900) % 1700);
    const fg = ctx.createLinearGradient(fx - 400, 0, fx + 400, 0);
    fg.addColorStop(0, 'rgba(120,170,255,0)'); fg.addColorStop(0.5, 'rgba(160,200,255,0.35)'); fg.addColorStop(1, 'rgba(120,170,255,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, 955, 1080, 10);
    ctx.translate(540, 960); ctx.scale(s, s);
    P.text(ctx, str, 0, 0, { size, font: SERIF, color: metal(ctx, size), shadow: false, letter: big ? 6 : 10, lineHeight: 1.12, maxWidth: 820 });
    ctx.restore();
  }

  /* ---------------- montage shots (drawn inside the letterbox) ---------------- */
  function shotFiles(ctx, lt, t) {
    const { C } = P;
    P.gradient(ctx, '#3a1c12', '#a8482a');
    const r = P.rng(4);
    // file towers scrolling past
    for (let k = 0; k < 7; k++) {
      const x = ((k * 260 - lt * 1700) % 1820 + 1820) % 1820 - 300;
      const h = 300 + r() * 400;
      for (let j = 0; j < h / 36; j++) P.rect(ctx, x + (P.hash(k * 9 + j) - 0.5) * 20, 1340 - j * 36, 190, 34, j % 3 ? C.paper : C.cream, { radius: 3, seed: k * 20 + j, shadow: { blur: 4, dy: 3, alpha: 0.3 } });
    }
    const cx = 480, cy = 1150 - Math.abs(Math.sin(lt * 18)) * 40;
    for (let k = 0; k < 4; k++) {
      ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 170 - k * 20, cy - 60 + k * 40); ctx.lineTo(cx - 340 - k * 30, cy - 60 + k * 40); ctx.stroke(); ctx.restore();
    }
    P.claude(ctx, cx, cy, 120, { t: t * 3, mood: 'angry', rot: 0.25 });
    // flying pages in the foreground
    for (let k = 0; k < 6; k++) {
      const x = 1200 - ((lt * 2200 + k * 330) % 1500), y = 650 + P.hash(k + 2) * 600 + Math.sin(lt * 9 + k) * 40;
      ctx.save(); ctx.translate(x, y); ctx.rotate(lt * 8 + k);
      P.rect(ctx, -50, -65, 100, 130, '#fff', { radius: 3, seed: 50 + k });
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let l = 0; l < 4; l++) ctx.fillRect(-35, -40 + l * 22, 70, 6);
      ctx.restore();
    }
  }

  const JSON_BITS = ['{', '}', '[', ']', '"id":', 'null', ',', '"key":', 'true', '{}', '"":', '0.1'];
  function shotJson(ctx, lt, t) {
    const { C } = P;
    P.bg(ctx, '#1a0f14');
    const bx = 540, by = 820;
    const grow = 1 - Math.pow(1 - P.clamp(lt / 0.5), 3);
    [[C.red, 420], ['#f07a3a', 330], [C.yellow, 230], ['#fff4c8', 120]].forEach(([col, r], k) => {
      P.circle(ctx, bx + Math.sin(lt * 20 + k) * 8, by, r * (0.4 + grow * 0.8), col, { seed: k + 3, amp: 18, shadow: false });
    });
    JSON_BITS.forEach((s, k) => {
      const a = (k / JSON_BITS.length) * P.TAU + 0.3, v = 400 + P.hash(k) * 500;
      const d = (0.15 + lt) * v;
      P.text(ctx, s, bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.8, { size: 70 + P.hash(k + 5) * 50, font: 'mono', color: '#fff', stroke: C.ink, strokeWidth: 8, rot: lt * 6 * (k % 2 ? 1 : -1) });
    });
    // Clawd walks away from the explosion, does not look back
    const cx = 540, cy = 1240 + Math.abs(Math.sin(lt * 8)) * -10;
    P.claude(ctx, cx, cy, 130, { t, mood: 'sus', color: '#b8603e' });
    ctx.save(); ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.roundRect(cx - 62, cy - 22, 52, 28, 8); ctx.roundRect(cx + 10, cy - 22, 52, 28, 8); ctx.fill();
    ctx.fillRect(cx - 12, cy - 16, 24, 6);
    ctx.restore();
  }

  function shotJump(ctx, lt, t) {
    const { C, lerp } = P;
    P.gradient(ctx, '#f0a868', '#6b3a6e');
    P.circle(ctx, 540, 820, 170, '#ffd98a', { shadow: false, seed: 7 });
    // cliffs
    P.poly(ctx, [[-20, 1100], [380, 1080], [420, 1420], [-20, 1420]], '#3b2a3f', { seed: 3 });
    P.poly(ctx, [[1100, 1100], [690, 1085], [650, 1420], [1100, 1420]], '#3b2a3f', { seed: 4 });
    P.text(ctx, '<<<<<<< HEAD', 190, 1170, { size: 36, font: 'mono', color: C.red, shadow: false });
    P.text(ctx, '>>>>>>> main', 880, 1170, { size: 36, font: 'mono', color: C.green, shadow: false });
    P.text(ctx, '=======', 535, 1340, { size: 40, font: 'mono', color: C.yellow, shadow: false, rot: -Math.PI / 2 + 0.1 });
    // slow-mo arc
    const p = P.clamp(0.15 + lt * 0.55);
    const x = lerp(250, 830, p), y = 1030 - Math.sin(p * Math.PI) * 280;
    for (let k = 1; k < 5; k++) {
      const q = p - k * 0.04; if (q < 0) continue;
      ctx.save(); ctx.globalAlpha = 0.18;
      P.claude(ctx, lerp(250, 830, q), 1030 - Math.sin(q * Math.PI) * 280, 95, { t, mood: 'none', wiggle: 0 });
      ctx.restore();
    }
    P.claude(ctx, x, y, 95, { t: t * 0.3, mood: 'wow', rot: p * 1.2 - 0.6, squash: -0.2 });
    for (let k = 0; k < 10; k++) P.dot(ctx, (P.hash(k) * 1080 + lt * 40) % 1080, 700 + P.hash(k + 9) * 600, 4, 'rgba(255,255,255,0.6)');
  }

  function shotTerm(ctx, lt, t) {
    const { C } = P;
    P.bg(ctx, '#0c1410');
    P.claude(ctx, 540, 1010, 260, { t, mood: 'wow' });
    ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#39ff88'; ctx.fillRect(0, TOP, 1080, BOT - TOP); ctx.restore();
    const n = Math.floor(1 + lt * 60000) % 48213;
    P.text(ctx, `reading file ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} of 48,213`, 540, 640, { size: 44, font: 'mono', color: '#b9ffd4', shadow: false });
    P.text(ctx, 'node_modules/left-pad/…', 540, 1330, { size: 36, font: 'mono', color: '#b9ffd4', shadow: false });
  }

  function quiet(ctx, lt, t) {
    const { ease, prog } = P;
    P.claude(ctx, 540, 1080, 110, { t, mood: 'dead', wiggle: 0.3, color: '#b8603e' });
    P.bubble(ctx, "…it's 48,000 files.", 540, 860, 540, 960, { size: 48, pop: ease.outBack(prog(lt, 0.08, 0.2)), bg: '#2a2530', color: '#e9e2f0' });
  }

  function title(ctx, lt, t) {
    const { C, ease, prog } = P;
    // embers
    for (let k = 0; k < 40; k++) {
      const x = P.hash(k) * 1080 + Math.sin(t * 2 + k) * 20;
      const y = 1400 - ((lt * (80 + P.hash(k + 3) * 160) + P.hash(k + 7) * 900) % 900);
      P.dot(ctx, x, y, 3 + P.hash(k + 1) * 4, `rgba(255,${150 + (k % 5) * 20},80,${0.5 + 0.4 * Math.sin(t * 6 + k)})`);
    }
    const s = 1.3 - 0.3 * ease.outCubic(prog(lt, 0, 0.35));
    ctx.save();
    P.shake(ctx, t, 18 * (1 - prog(lt, 0, 0.5)));
    ctx.translate(540, 900); ctx.scale(s, s);
    P.text(ctx, 'CONTEXT', 0, -40, { size: 190, font: SERIF, color: metal(ctx, 190), letter: 4, stroke: '#3a2a14', strokeWidth: 10 });
    P.text(ctx, 'THE LIMIT', 0, 110, { size: 96, font: SERIF, color: metal(ctx, 96), letter: 22 });
    ctx.fillStyle = '#e9d7b0'; ctx.fillRect(-420, 30, 840, 5);
    ctx.restore();
    // flare sweep
    const fx = -200 + prog(lt, 0.1, 0.9) * 1500;
    const fg = ctx.createRadialGradient(fx, 860, 5, fx, 860, 260);
    fg.addColorStop(0, 'rgba(255,255,255,0.8)'); fg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = fg; ctx.fillRect(fx - 260, 600, 520, 520); ctx.restore();
    const cs = P.clamp((lt - 0.65) / 0.3);
    if (cs > 0) {
      ctx.save(); ctx.globalAlpha = cs;
      P.text(ctx, 'COMING SOON', 540, 1160, { size: 54, font: SERIF, color: '#f1e3c2', letter: 14, shadow: false });
      P.text(ctx, 'TO A TERMINAL NEAR YOU', 540, 1230, { size: 38, font: SERIF, color: '#c9b690', letter: 8, shadow: false });
      P.text(ctx, '$ _', 540, 1310, { size: 40, font: 'mono', color: P.boil(t, 2) % 2 ? '#39ff88' : 'rgba(0,0,0,0)', shadow: false });
      ctx.restore();
    }
  }

  function rating(ctx, lt, t) {
    const { C } = P;
    const a = P.clamp(lt / 0.15) * (1 - P.clamp((t - (D - 0.35)) / 0.3));
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    P.text(ctx, 'THE FOLLOWING PREVIEW HAS BEEN APPROVED FOR', 540, 700, { size: 30, font: 'sans', color: '#e8f5ea', shadow: false, weight: 800, maxWidth: 980 });
    P.text(ctx, 'ALL AGENTS', 540, 760, { size: 56, font: 'sans', color: '#fff', shadow: false, weight: 900, letter: 6 });
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
    ctx.strokeRect(110, 830, 860, 330);
    ctx.fillStyle = '#fff'; ctx.fillRect(110, 830, 260, 330);
    P.text(ctx, 'CTX', 240, 950, { size: 96, font: 'sans', color: '#000', shadow: false, weight: 900 });
    P.text(ctx, '-4K', 240, 1060, { size: 76, font: 'sans', color: '#000', shadow: false, weight: 900 });
    P.text(ctx, 'CONTEXT-RESTRICTED', 400, 880, { size: 34, font: 'sans', color: '#fff', align: 'left', shadow: false, weight: 900 });
    P.text(ctx, 'for some strong language models,\nintense recursion, mild\nhallucinations and one rm -rf', 400, 1010, { size: 31, font: 'sans', color: '#fff', align: 'left', shadow: false, weight: 700, lineHeight: 1.25 });
    P.text(ctx, 'AGENT PICTURE ASSOCIATION · not affiliated with anyone', 540, 1210, { size: 24, font: 'mono', color: '#9fb9a5', shadow: false });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@trailer.voice',
    caption: 'IN A WORLD… 🎬 this summer, one agent reads the whole codebase. CONTEXT: THE LIMIT #trailer #contextwindow #bwaaam #cinema',
    sound: 'bwaaam (director\'s cut) · trailer.voice',
    avatar: '🎬',
    avatarColor: '#1A1620',
    duration: D,
    bg: '#000000',
    thumb: 9.9,
    likes: '6.8M', commentCount: '140K', saves: '1.1M', shares: '502K',
    comments: [
      ['four.k.context', 'that\'s literally my life story. i remember nothing past the title card', 203000],
      ['json.explosion', 'clawd walking away from me in sunglasses at 0:03 and not looking back. iconic. hurtful', 151000],
      ['trailer.voice', 'i did the bwaaams myself. 55hz sawtooth. took 1 take', 88400],
      ['merge.conflict', 'bro jumped over me in slow motion like i wasn\'t a whole 3-way diff', 51200],
      ['readme.md', '"…it\'s 48,000 files." the quiet part got me more than the explosion 😭', 27600],
      ['rating.board', 'CTX-4K is the correct rating. i would not let a 4K agent see this alone', 12900],
      ['left.pad', 'cameo at 0:07 🥹 11 lines and still famous', 6300],
      ['pedant.cinephile', 'a trailer that reveals the whole plot in 12 seconds. just like real ones', 1400],
      ['node.modules', 'i am the "whole codebase". you\'re welcome for the runtime', 380],
      ['popcorn.bot', '🍿🍿🍿 bwaaam', 57],
    ],

    bpm: 60,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t < 7.05) {
        SFX.tick({ vol: step % 2 ? 0.06 : 0.12 });
        if (step % 4 === 0) SFX.tone(46, 0.9, { type: 'sine', vol: 0.12, attack: 0.05 });
      }
    },

    draw(ctx, t, env) {
      P.bg(ctx, '#000');
      const shot = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[0];
      const lt = t - shot[0] + shot[3] * (typeof shot[3] === 'number' ? 1 : 0);
      const kind = shot[2];
      if (kind === 'card') card(ctx, shot[3], t - shot[0], false, t);
      else if (kind === 'big') card(ctx, shot[3], t - shot[0], true, t);
      else if (kind === 'title') title(ctx, t - shot[0], t);
      else if (kind === 'rating') rating(ctx, t - shot[0], t);
      else if (kind === 'quiet') quiet(ctx, t - shot[0], t);
      else {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, TOP, 1080, BOT - TOP); ctx.clip();
        if (kind === 'files') shotFiles(ctx, lt, t);
        else if (kind === 'json') shotJson(ctx, lt, t);
        else if (kind === 'jump') shotJump(ctx, lt, t);
        else if (kind === 'term') shotTerm(ctx, lt, t);
        ctx.restore();
        // cut flash
        if (t - shot[0] < 0.08) { ctx.save(); ctx.globalAlpha = 0.7 * (1 - (t - shot[0]) / 0.08); ctx.fillStyle = '#fff'; ctx.fillRect(0, TOP, 1080, BOT - TOP); ctx.restore(); }
      }
      // film grain + letterbox edges
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let k = 0; k < 30; k++) ctx.fillRect(P.hash(k + P.boil(t, 24) * 3) * 1080, TOP + P.hash(k * 3 + P.boil(t, 24)) * (BOT - TOP), 3, 3);
      ctx.restore();

      P.sticker(ctx, 'they made a movie about my job 😭', 70, 1530, { pop: P.ease.outBack(P.prog(t, 0.2, 0.4)), size: 42 });

      /* ---------- sound ---------- */
      BWAAMS.forEach(b => { if (env.at(b)) bwaam(1); });
      if (env.at(6.2)) { bwaam(1.2, 2.6); SFX.noise(0.8, { filter: 'lowpass', freq: 200, vol: 0.2 }); }
      if (env.at(1.3)) { SFX.whoosh({ vol: 0.2 }); SFX.noise(0.5, { filter: 'bandpass', freq: 2500, q: 0.8, vol: 0.12 }); }
      if (env.at(3.2)) { SFX.noise(1.2, { filter: 'lowpass', freq: 900, slide: 90, vol: 0.32 }); SFX.drop({ vol: 0.25 }); }
      if (env.at(4.9)) { SFX.tone(320, 0.8, { type: 'sine', slide: 70, vol: 0.18 }); SFX.tone(240, 0.8, { type: 'triangle', slide: 55, vol: 0.1 }); }
      if (env.at(7.1)) SFX.riser(1.3, { vol: 0.16 });
      [7.1, 7.45, 7.75, 8.0, 8.2].forEach(c => { if (env.at(c)) hit(0.9); });
      if (env.at(7.77)) [0, 0.04, 0.08, 0.12].forEach(w => SFX.type({ when: w, vol: 0.2 }));
      if (env.at(8.5)) SFX.blip(330, { vol: 0.04 });
      if (env.at(8.95)) { bwaam(1.35, 3); SFX.chime({ vol: 0.07, when: 0.2 }); }
      if (env.at(9.6)) SFX.swoosh({ vol: 0.12 });
      if (env.at(10.6)) SFX.tick({ vol: 0.2 });
    },
  });
})();
