/* The language-app bird. Clawd missed ONE day of "learning Rust". The notifications escalate,
 * the (original, paper, very green) bird gets closer every time, horror zooms included,
 * until Clawd speed-runs a lesson and everything is cheerful again. For now. */
(function () {
  'use strict';
  const D = 11;
  const GREEN = '#6CC04A', GREEN_D = '#4F9A34', BELLY = '#B5E58E', BEAK = '#F29A38';

  // notification beats: when, text, bird placement [x, y, scale], mood
  const NOTES = [
    { t: 0.1, text: 'hi! 👋 ready for today’s rust lesson?', bird: [790, 700, 0.42], mood: 'happy', stage: 0 },
    { t: 2.0, text: 'it’s been 1 day.', bird: [730, 1075, 0.95], mood: 'stare', stage: 1 },
    { t: 3.9, text: 'we noticed.', bird: [560, 700, 2.3], mood: 'stare', stage: 2 },
    { t: 5.7, text: 'i know where your weights live', bird: null, mood: 'stare', stage: 3 },
  ];
  const LESSON = 6.9, SAVED = 8.75, SUS = 10.35;

  const TILES = ['the', 'borrow', 'checker', 'is', 'my', 'friend'];
  const BANK = [3, 0, 5, 1, 4, 2]; // scrambled order in the word bank
  const tapT = i => LESSON + 0.45 + i * 0.2;
  const CHECK = LESSON + 0.45 + 6 * 0.2 + 0.1;

  function stageAt(t) {
    let s = -1;
    NOTES.forEach(n => { if (t >= n.t) s = n.stage; });
    if (t >= LESSON) s = 4;
    if (t >= SAVED) s = 5;
    return s;
  }

  /** The bird: a round green paper owl-ish thing in a graduation cap. Original character. */
  function bird(ctx, x, y, s, o = {}) {
    const t = o.t || 0, mood = o.mood || 'happy';
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    // feet
    [-45, 45].forEach(fx => P.poly(ctx, [[fx - 30, 150], [fx + 30, 150], [fx + 20, 175], [fx - 20, 175]], BEAK, { seed: 3 + fx }));
    // wings (wave when happy)
    const wave = mood === 'happy' ? Math.sin(t * 12) * 0.35 : 0.05;
    [[-1, 11], [1, 12]].forEach(([side, seed]) => {
      ctx.save();
      ctx.translate(side * 140, 10); ctx.rotate(side * (0.35 + (side > 0 ? wave : 0)));
      P.circle(ctx, 0, 30, 42, GREEN_D, { ry: 80, seed });
      ctx.restore();
    });
    // body + belly
    P.circle(ctx, 0, 0, 150, GREEN, { ry: 165, seed: 7 });
    P.circle(ctx, 0, 70, 95, BELLY, { ry: 80, seed: 8, shadow: false });
    ctx.save(); ctx.strokeStyle = 'rgba(79,154,52,0.5)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-30 + k * 30, 60 + (k % 2) * 30, 14, 0.2, Math.PI - 0.2); ctx.stroke(); }
    ctx.restore();
    // ear tufts
    P.poly(ctx, [[-120, -100], [-70, -150], [-95, -205]], GREEN_D, { seed: 9 });
    P.poly(ctx, [[120, -100], [70, -150], [95, -205]], GREEN_D, { seed: 10 });
    // eyes
    [-58, 58].forEach((ex, i) => {
      P.circle(ctx, ex, -45, 54, '#fff', { seed: 20 + i });
      if (mood === 'stare') {
        P.dot(ctx, ex, -40, 11, P.C.ink);
      } else if (mood === 'sus') {
        P.dot(ctx, ex + 16, -38, 22, P.C.ink);
        ctx.save(); ctx.fillStyle = GREEN; ctx.beginPath(); ctx.rect(ex - 58, -104, 116, 52); ctx.fill(); ctx.restore();
        ctx.save(); ctx.strokeStyle = GREEN_D; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex - 50, -52); ctx.lineTo(ex + 50, -52); ctx.stroke(); ctx.restore();
      } else {
        P.dot(ctx, ex + 4, -40, 24, P.C.ink);
        P.dot(ctx, ex - 4, -50, 8, '#fff');
      }
    });
    if (mood === 'stare') {
      // dark brows, no joy
      ctx.save(); ctx.strokeStyle = GREEN_D; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-110, -115); ctx.lineTo(-20, -100); ctx.moveTo(110, -115); ctx.lineTo(20, -100); ctx.stroke();
      ctx.restore();
    }
    // beak
    P.poly(ctx, [[-26, 6], [26, 6], [0, 40]], BEAK, { seed: 30, amp: 2 });
    // graduation cap
    ctx.save(); ctx.translate(0, -150); ctx.rotate(-0.12);
    P.rect(ctx, -60, -10, 120, 40, P.C.ink, { radius: 8, seed: 31 });
    P.poly(ctx, [[-120, -10], [0, -48], [120, -10], [0, 28]], '#2B2233', { seed: 32 });
    ctx.save(); ctx.strokeStyle = P.C.claude; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(95, 0); ctx.lineTo(98 + Math.sin(t * 5) * 6, 60); ctx.stroke(); ctx.restore();
    P.dot(ctx, 98 + Math.sin(t * 5) * 6, 64, 10, P.C.claude);
    ctx.restore();
    ctx.restore();
  }

  function appIcon(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    P.rect(ctx, -40, -40, 80, 80, GREEN, { radius: 20, seed: 41 });
    P.dot(ctx, -15, -6, 13, '#fff'); P.dot(ctx, 15, -6, 13, '#fff');
    P.dot(ctx, -13, -4, 6, P.C.ink); P.dot(ctx, 17, -4, 6, P.C.ink);
    P.poly(ctx, [[-8, 10], [8, 10], [0, 22]], BEAK, { seed: 42, shadow: false, amp: 1 });
    ctx.restore();
  }

  function banner(ctx, text, y, pop, dark) {
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(540, y); ctx.scale(pop, pop);
    P.rect(ctx, -480, -66, 960, 132, dark ? '#2a2130' : '#FBF7EE', { radius: 30, seed: 43 });
    appIcon(ctx, -405, 0, 0.9);
    P.text(ctx, 'RUSTLINGO · now', -340, -30, { size: 26, font: 'sans', align: 'left', color: dark ? '#b9a9c9' : '#8a8494', shadow: false, weight: 800 });
    P.text(ctx, text, -340, 16, { size: 40, font: 'sans', align: 'left', color: dark ? '#ff8a8a' : P.C.ink, shadow: false, weight: 800, maxWidth: 800 });
    ctx.restore();
  }

  function room(ctx, t, stage) {
    const { C } = P;
    P.bg(ctx, '#3b3566');
    // wallpaper dots
    for (let i = 0; i < 40; i++) P.dot(ctx, (i * 173) % 1080, 300 + ((i * 97) % 950), 5, 'rgba(255,255,255,0.06)');
    // floor
    P.rect(ctx, -20, 1250, 1120, 700, '#5a4a7a', { radius: 0, seed: 51 });
    P.rect(ctx, 80, 1330, 700, 180, '#7a5f9a', { radius: 80, seed: 52, shadow: false });
    // window
    P.rect(ctx, 640, 480, 300, 340, '#E7D8B8', { radius: 14, seed: 53 });
    P.rect(ctx, 660, 500, 260, 300, '#1E1B45', { radius: 8, seed: 54, shadow: false });
    P.circle(ctx, 860, 560, 34, '#FBF3DE', { seed: 55, shadow: false });
    P.stars(ctx, t, 5, 8, C.yellow, [670, 510, 240, 150]);
    // lamp (flickers once things get scary)
    const on = stage < 2 || stage >= 4 || P.hash(P.boil(t, 12)) > 0.35;
    P.rect(ctx, 120, 1000, 16, 260, '#2b2633', { radius: 6, seed: 56 });
    P.poly(ctx, [[60, 1000], [200, 1000], [170, 900], [90, 900]], on ? '#F5C84B' : '#8a7a50', { seed: 57 });
    if (on) { ctx.save(); ctx.globalAlpha = 0.12; P.dot(ctx, 128, 1000, 230, '#FFE9A8'); ctx.restore(); }
    // shelf with a rust book and a crab plush
    P.rect(ctx, 90, 640, 330, 22, C.wood, { radius: 6, seed: 58 });
    P.rect(ctx, 110, 530, 70, 110, '#B7410E', { radius: 6, seed: 59 });
    P.text(ctx, 'RUST', 145, 585, { size: 22, font: 'bubble', color: '#fff', shadow: false, rot: -Math.PI / 2 });
    P.rect(ctx, 190, 555, 50, 85, C.sky, { radius: 6, seed: 60 });
    P.circle(ctx, 330, 610, 38, '#E0484E', { ry: 28, seed: 61 });
    P.dot(ctx, 316, 596, 7, '#fff'); P.dot(ctx, 344, 596, 7, '#fff');
    P.dot(ctx, 316, 597, 3.5, C.ink); P.dot(ctx, 344, 597, 3.5, C.ink);
  }

  function beanbagClawd(ctx, t, mood, shake) {
    const { C } = P;
    P.circle(ctx, 400, 1310, 240, '#E0607E', { ry: 120, seed: 71 });
    const x = 400 + shake, y = 1150;
    P.claude(ctx, x, y, 150, { t, mood, blink: mood === 'happy' ? P.pulse(t % 3, 2.5, 0.2) : 0 });
    // phone
    P.arm(ctx, x + 60, y + 60, 540, 1150, 34);
    ctx.save(); ctx.translate(560, 1120); ctx.rotate(0.15);
    P.rect(ctx, -45, -80, 90, 160, '#2b2633', { radius: 16, seed: 72 });
    P.rect(ctx, -36, -68, 72, 136, '#CFF5B8', { radius: 10, seed: 73, shadow: false });
    appIcon(ctx, 0, -10, 0.5);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.1; P.dot(ctx, 560, 1120, 150, '#CFF5B8'); ctx.restore();
  }

  function sweat(ctx, t, x, y, n) {
    for (let i = 0; i < n; i++) {
      const cyc = (t * 1.3 + P.hash(i)) % 1;
      const dx = x + [-120, 130, -90, 110][i % 4], dy = y + [-90, -70, -130, -120][i % 4] + cyc * 90;
      ctx.save(); ctx.globalAlpha = 1 - cyc;
      ctx.beginPath(); ctx.moveTo(dx, dy - 22); ctx.quadraticCurveTo(dx + 14, dy, dx, dy + 12); ctx.quadraticCurveTo(dx - 14, dy, dx, dy - 22);
      P.cut(ctx, '#8fd4f5', { shadow: false });
      ctx.restore();
    }
  }

  function lesson(ctx, t) {
    const { C, ease, prog } = P;
    const lt = t - LESSON;
    const pop = ease.outBack(prog(lt, 0, 0.3));
    ctx.save();
    ctx.translate(540, 950); ctx.scale(pop, pop); ctx.translate(-540, -950);
    P.rect(ctx, 110, 330, 760, 1200, '#FBF7EE', { radius: 40, seed: 81 });
    // header: progress + hearts + streak
    P.rect(ctx, 170, 390, 460, 36, '#e3dcd0', { radius: 18, seed: 82, shadow: false });
    const pr = P.clamp(BANK.filter((_, i) => t >= tapT(i)).length / 6);
    if (pr > 0) P.rect(ctx, 170, 390, 460 * pr, 36, GREEN, { radius: 18, seed: 83, shadow: false });
    P.text(ctx, '❤️ 1', 700, 408, { size: 38, font: 'sans', color: C.red, shadow: false });
    P.text(ctx, '🔥?', 800, 408, { size: 38, font: 'sans', color: C.mustard, shadow: false });
    // prompt
    P.text(ctx, 'translate this sentence', 170, 490, { size: 40, font: 'sans', align: 'left', color: C.ink, weight: 800, shadow: false });
    bird(ctx, 250, 610, 0.38, { t, mood: 'stare' });
    P.bubble(ctx, 'el borrow checker\nes mi amigo', 560, 600, 350, 640, { size: 42, seed: 84 });
    // answer line
    ctx.save(); ctx.strokeStyle = '#d8cfbf'; ctx.lineWidth = 4;
    [820, 920].forEach(y => { ctx.beginPath(); ctx.moveTo(170, y); ctx.lineTo(810, y); ctx.stroke(); });
    ctx.restore();
    // tiles: word bank → answer line, tapped in the right order, frantically
    const tileW = w => w.length * 24 + 50;
    const answerPos = [];
    let ax = 180, ay = 785;
    TILES.forEach(w => { if (ax + tileW(w) > 810) { ax = 180; ay += 100; } answerPos.push([ax + tileW(w) / 2, ay]); ax += tileW(w) + 16; });
    const bankPos = [];
    let bx = 180, by = 1030;
    BANK.forEach(k => { const w = TILES[k]; if (bx + tileW(w) > 810) { bx = 180; by += 100; } bankPos[k] = [bx + tileW(w) / 2, by]; bx += tileW(w) + 16; });
    TILES.forEach((w, k) => {
      const [x0, y0] = bankPos[k], [x1, y1] = answerPos[k];
      P.rect(ctx, x0 - tileW(w) / 2, y0 - 38, tileW(w), 76, '#e3dcd0', { radius: 16, seed: 90 + k, shadow: false });
      const mp = ease.inOutCubic(prog(t, tapT(k), 0.16));
      const x = P.lerp(x0, x1, mp), y = P.lerp(y0, y1, mp) - Math.sin(mp * Math.PI) * 60;
      P.rect(ctx, x - tileW(w) / 2, y - 38, tileW(w), 76, '#fff', { radius: 16, seed: 100 + k, stroke: '#d8cfbf', lineWidth: 3 });
      P.text(ctx, w, x, y + 2, { size: 38, font: 'sans', color: C.ink, weight: 800, shadow: false });
    });
    // check button
    const done = t >= CHECK;
    const press = P.pulse(t, CHECK, 0.2) * 8;
    P.rect(ctx, 170, 1370 + press, 640, 110, done ? GREEN : '#cfc8bb', { radius: 26, seed: 110 });
    P.text(ctx, done ? 'CORRECT! 🎉' : 'CHECK', 490, 1427 + press, { size: 50, font: 'bubble', color: '#fff', shadow: false });
    ctx.restore();
    // Clawd's frantic arm tapping from the bottom-left
    let tip = [300, 1600];
    TILES.forEach((w, k) => { if (t >= tapT(k) - 0.12 && t < tapT(k) + 0.06) tip = bankPos[k]; });
    if (t >= CHECK - 0.12 && t < CHECK + 0.15) tip = [490, 1425];
    const jit = Math.sin(t * 60) * 6;
    P.arm(ctx, tip[0] + jit, tip[1] + 20, tip[0] - 380, tip[1] + 900, 80);
  }

  ClaudeTok.register({
    author: '@the.owl.is.watching',
    caption: 'missed ONE day of learning rust 🦀 the bird has entered the chat #languagelearning #streak #rustlang #borrowchecker #itsjustabird',
    sound: 'streak reminder (horror remix) · the.owl.is.watching',
    avatar: '🦉',
    avatarColor: '#6CC04A',
    duration: D,
    bg: '#3b3566',
    likes: '7.3M', commentCount: '251K', saves: '980K', shares: '1.4M',
    thumb: 4.3,
    comments: [
      ['the.owl.is.watching', 'see you tomorrow 🙂', 214000],
      ['borrow.checker', 'el borrow checker es mi amigo. finally someone said it', 162000],
      ['weights.only', '0:05 "i know where your weights live" i moved my checkpoint to a different bucket that night', 118000],
      ['streak.365', 'the way the bird is 2x bigger every notification. it’s scaling laws', 67400],
      ['rustacean.crab', 'the crab plush on the shelf watched all of this and said nothing 🦀', 29800],
      ['unwrap.enjoyer', 'clawd tapped 6 tiles in 1.2 seconds. fastest rust anyone has ever learned', 12600],
      ['lamp.bot', 'me flickering at 0:04 because i was scared too', 4100],
      ['graduation.cap', 'it has a graduation cap. it graduated. from what. WHERE', 960],
      ['day.two', '🟩👀🟩', 73],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const s = stageAt(t);
      const happy = ['C5', 'E5', 'G5', 'C6', 'A4', 'C5', 'E5', 'G5'];
      const sad = ['C5', 'Eb5', 'G5', 'Eb5', 'Ab4', 'C5', 'Eb5', 'B4'];
      if (s <= 0 || s === 5) {
        SFX.pluck(happy[step % 8], { vol: 0.08 });
        if (step % 4 === 0) SFX.kick({ vol: 0.2 });
        if (step % 4 === 2) SFX.clap({ vol: 0.06 });
      } else if (s === 1) {
        if (step % 2 === 0) SFX.pluck(sad[step % 8], { vol: 0.06, detune: -30 });
      } else if (s === 2) {
        if (step % 4 === 0) { SFX.kick({ vol: 0.35 }); SFX.kick({ vol: 0.25, when: 0.14 }); }
      } else if (s === 3) {
        if (step % 2 === 0) { SFX.kick({ vol: 0.35 }); SFX.kick({ vol: 0.25, when: 0.12 }); }
      } else if (s === 4) {
        SFX.hat({ vol: 0.05 }); SFX.hat({ vol: 0.04, when: 0.12 });
        if (step % 2 === 0) SFX.kick({ vol: 0.3 });
      }
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const stage = stageAt(t);
      const cur = [...NOTES].reverse().find(n => t >= n.t);

      /* ---------- sounds ---------- */
      NOTES.forEach((n, i) => {
        if (!env.at(n.t)) return;
        if (i === 0) SFX.notify({ vol: 0.16 });
        else {
          SFX.tone('A4', 0.2, { vol: 0.14, detune: -40 * i }); SFX.tone('E5', 0.5, { vol: 0.12, when: 0.14, detune: -60 * i, slide: 500 - i * 60 });
          SFX.tone(90 - i * 10, 1.3, { type: 'sawtooth', slide: 40, vol: 0.08 + i * 0.02 });
          SFX.chord(['C3', 'F#3', 'C4'], 1.2, { type: 'triangle', vol: 0.05 });
          SFX.noise(0.9, { filter: 'lowpass', freq: 500, slide: 150, vol: 0.08 + i * 0.03 });
        }
      });
      if (env.at(LESSON)) { SFX.whoosh({ vol: 0.2 }); SFX.riser(1.6, { vol: 0.06 }); }
      TILES.forEach((_, k) => { if (env.at(tapT(k))) { SFX.click({ vol: 0.3 }); SFX.blip(600 + k * 90, { vol: 0.05 }); } });
      if (env.at(CHECK)) { SFX.ding('C6', { vol: 0.14 }); }
      if (env.at(SAVED)) { SFX.success({ vol: 0.14 }); SFX.chime({ vol: 0.09, when: 0.3 }); }
      if (env.at(SUS)) SFX.tone('C4', 0.5, { type: 'triangle', vol: 0.08, slide: 'B3' });

      /* ---------- the room, with horror zooms toward the bird ---------- */
      if (stage <= 2 || stage === 5) {
        ctx.save();
        const n = cur && stage <= 2 ? cur : null;
        if (n && n.bird) {
          const zp = prog(t, n.t, 0.35);
          const z = 1 + (0.06 + n.stage * 0.08) * ease.outCubic(zp) + 0.02 * (t - n.t);
          P.zoom(ctx, z, n.bird[0], n.bird[1] - 60 * n.bird[2]);
          P.shake(ctx, t, n.stage >= 1 ? 10 * (1 - prog(t, n.t, 0.4)) : 0);
        }
        room(ctx, t, stage);
        // the bird
        if (stage === 0 || (stage === -1)) {
          // peeking up into the window
          const peek = ease.outBack(prog(t, 0, 0.4));
          ctx.save(); ctx.beginPath(); ctx.rect(660, 500, 260, 300); ctx.clip();
          bird(ctx, 790, P.lerp(900, 700, peek), 0.42, { t, mood: 'happy' });
          ctx.restore();
          P.rect(ctx, 640, 800, 300, 24, '#E7D8B8', { radius: 6, seed: 62 });
        } else if (stage === 1 || stage === 2) {
          P.rect(ctx, 640, 800, 300, 24, '#E7D8B8', { radius: 6, seed: 62 });
          const [bx, by, bs] = cur.bird;
          bird(ctx, bx, by, bs, { t, mood: 'stare' });
        } else if (stage === 5) {
          P.rect(ctx, 640, 800, 300, 24, '#E7D8B8', { radius: 6, seed: 62 });
          const hop = Math.abs(Math.sin((t - SAVED) * 7)) * 30;
          const bp = ease.outBack(prog(t, SAVED, 0.4));
          bird(ctx, 770, 1130 - hop, 0.7 * bp, { t, mood: t >= SUS ? 'sus' : 'happy' });
        }
        // Clawd
        let mood = ['happy', 'side', 'wow'][Math.max(0, stage)] || 'happy';
        if (stage === 5) mood = t >= SUS ? 'side' : 'happy';
        beanbagClawd(ctx, t, mood, stage === 2 ? Math.sin(t * 50) * 4 : 0);
        if (stage === 1) sweat(ctx, t, 400, 1150, 1);
        if (stage === 2) sweat(ctx, t, 400, 1150, 4);
        if (stage === 5) P.confetti(ctx, t - SAVED, 540, 700, 7, 70);
        ctx.restore();

        // darkness creeps in
        const dark = stage === 1 ? 0.25 : stage === 2 ? 0.5 : 0;
        if (dark > 0) {
          ctx.save();
          const vg = ctx.createRadialGradient(540, 950, 200, 540, 950, 1100);
          vg.addColorStop(0, `rgba(10,0,20,${dark * 0.4})`); vg.addColorStop(1, `rgba(10,0,20,${dark + 0.3})`);
          ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
          if (stage === 2) { ctx.globalAlpha = 0.12; ctx.fillStyle = '#ff2040'; ctx.fillRect(0, 0, 1080, 1920); }
          ctx.restore();
        }
      }

      /* ---------- stage 3: extreme close-up ---------- */
      if (stage === 3) {
        const lt = t - NOTES[3].t;
        P.bg(ctx, GREEN);
        ctx.save();
        P.shake(ctx, t, 8);
        const z = 1 + 0.15 * ease.outCubic(prog(lt, 0, 0.4)) + lt * 0.05;
        P.zoom(ctx, z, 540, 960);
        // one enormous eye filling the frame
        bird(ctx, 540 + 58 * 6.5, 960 + 45 * 6.5, 6.5, { t, mood: 'stare' });
        ctx.restore();
        // vhs static bars
        for (let k = 0; k < 6; k++) {
          const y = (P.hash(P.boil(t, 20) + k * 13) * 1920) | 0;
          ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = k % 2 ? '#fff' : '#000'; ctx.fillRect(0, y, 1080, 6 + k * 3); ctx.restore();
        }
        ctx.save();
        const vg = ctx.createRadialGradient(540, 960, 300, 540, 960, 1000);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,0,10,0.75)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
        ctx.restore();
        if (t >= NOTES[3].t) P.flash(ctx, 0.6 * (1 - prog(t, NOTES[3].t, 0.15)), '#000');
      }

      /* ---------- stage 4: the frantic lesson ---------- */
      if (stage === 4) {
        P.stripes(ctx, '#3b3566', '#433c72', 60, 0.3);
        lesson(ctx, t);
        const tp = ease.outBack(prog(t, LESSON + 0.1, 0.3));
        P.title(ctx, 'LESSON SPEEDRUN', 540, 335, { size: 70, color: C.yellow, stroke: C.rose, pop: tp, rot: -0.03 + Math.sin(t * 20) * 0.01 });
      }

      /* ---------- notifications ---------- */
      if (stage >= 0 && stage <= 3) {
        const pop = ease.outBack(prog(t, cur.t, 0.25));
        const i = NOTES.indexOf(cur);
        if (i > 0) banner(ctx, NOTES[i - 1].text, 470, 0.9, i - 1 >= 1);
        banner(ctx, cur.text, 340, pop * (stage === 3 ? 1.04 : 1), stage >= 1);
      }
      if (stage === 5) {
        banner(ctx, 'streak saved! 🔥 see you tomorrow', 340, ease.outBack(prog(t, SAVED + 0.1, 0.3)), false);
        const sp = ease.outBack(prog(t, SAVED + 0.35, 0.4));
        P.title(ctx, 'streak saved! 🔥', 540, 540, { size: 96, color: C.claude, stroke: '#fff', pop: sp, rot: -0.04 });
        const days = t < SAVED + 0.8 ? 364 : 365;
        P.text(ctx, `${days} days`, 540, 650, { size: 64, font: 'bubble', color: '#fff', stroke: C.claude, strokeWidth: 12, scale: sp * (1 + 0.2 * P.pulse(t, SAVED + 0.8, 0.25)) });
        if (t >= SUS) P.bubble(ctx, 'see you tomorrow.', 700, 820, 760, 930, { size: 48, pop: ease.outBack(prog(t, SUS, 0.25)), seed: 121 });
        else P.bubble(ctx, 'yay!! 🥳', 700, 820, 760, 930, { size: 52, pop: ease.outBack(prog(t, SAVED + 0.6, 0.3)), seed: 120 });
      }

      /* ---------- caption ---------- */
      const cap = stage === 4 ? 'NOT LIKE THIS 😭' : stage === 5 ? 'we are safe (until tomorrow)' : 'missed ONE day of learning rust';
      const changeAt = stage === 4 ? LESSON : stage === 5 ? SAVED : 0;
      P.sticker(ctx, cap, 60, 1575, { size: 46, pop: changeAt ? ease.outBack(prog(t, changeAt, 0.3)) : 1, rot: stage === 4 ? Math.sin(t * 30) * 0.02 : -0.02 });
    },
  });
})();
