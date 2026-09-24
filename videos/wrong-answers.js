/* "wrong answers only: what does an LLM do?" Absurd answers fly in and rack up
 * hearts. Clawd types the technically correct answer. 0 likes. Crickets.
 * Tumbleweed. Sad trombone. Someone likes it... and unlikes it. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 10;
  const SLOT = i => 620 + i * 170;
  const CARD_X = 50, CARD_W = 820, CARD_H = 140;
  const ANSWERS = [
    { at: 0.0, h: '@anxious.autocomplete', text: 'autocomplete with anxiety', av: '😰', col: '#8EC9E8', likes: 48200 },
    { at: 1.3, h: '@polly.wants.a.token', text: 'a very confident parrot', av: '🦜', col: '#8FD3B6', likes: 91000 },
    { at: 2.55, h: '@matrix.mult', text: 'spicy linear algebra', av: '🌶️', col: '#F2B8C6', likes: 204000 },
    { at: 3.8, h: '@three.tokens.in.a.coat', text: 'vibes in a trench coat', av: '🧥', col: '#F5C84B', likes: 1100000, top: true },
  ];
  const COMPOSE = 4.95, TYPE0 = 5.25, TYPE1 = 6.55, POST = 6.8;
  const CLAWD_TEXT = 'technically, it predicts the\nmost likely next token 🙂';
  const SAD = 7.25, UNLIKE0 = 8.05, UNLIKE1 = 8.45, REPLY = 8.6, OUT = 9.35;

  const fmt = (n) => (n < 1000 ? String(Math.round(n)) : n < 1e6 ? (n / 1000).toFixed(1) + 'K' : (n / 1e6).toFixed(1) + 'M');

  function heartIcon(ctx, x, y, s, filled, beat) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(1 + beat * 0.3, 1 + beat * 0.3);
    if (filled) P.heart(ctx, 0, 0, s, P.C.rose, { shadow: { blur: 4, dy: 3, alpha: 0.25 } });
    else {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
      ctx.closePath();
      ctx.strokeStyle = '#a79fb0'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    }
    ctx.restore();
  }

  function card(ctx, x, y, rot, sc, a, t, likesStr, o = {}) {
    const { C } = P;
    const w = CARD_W, h = o.h || CARD_H;
    ctx.save();
    ctx.translate(x + w / 2, y); ctx.rotate(rot); ctx.scale(sc * (1 + (o.sq || 0) * 0.3), sc * (1 - (o.sq || 0)));
    P.rect(ctx, -w / 2, -h / 2, w, h, '#fff', { radius: 26, seed: o.seed || 3, shadow: { blur: 14, dy: 9, alpha: 0.28 } });
    // avatar
    if (o.clawd) {
      P.circle(ctx, -w / 2 + 70, 0, 46, '#FBE3D6', { seed: 9, shadow: false });
      P.claude(ctx, -w / 2 + 70, 2, 36, { t, mood: o.mood || 'smile', wiggle: 0.5 });
    } else {
      P.circle(ctx, -w / 2 + 70, 0, 46, a.col, { seed: o.seed + 1, shadow: false });
      P.text(ctx, a.av, -w / 2 + 70, 4, { size: 50, font: 'sans', shadow: false });
    }
    P.text(ctx, a.h, -w / 2 + 132, -h / 2 + 30, { size: 24, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 700 });
    P.text(ctx, a.text, -w / 2 + 132, o.clawd ? 8 : 6, { size: o.clawd ? 34 : 46, font: 'bubble', align: 'left', color: C.ink, shadow: false, maxWidth: w - 260 });
    P.text(ctx, o.meta || 'Reply · 2m', -w / 2 + 132, h / 2 - 22, { size: 20, font: 'sans', align: 'left', color: '#b0a9b8', shadow: false, weight: 700 });
    // heart + count
    heartIcon(ctx, w / 2 - 70, -14, 28, o.filled !== false, o.beat || 0);
    P.text(ctx, likesStr, w / 2 - 70, 36, { size: 26, font: 'bubble', color: o.filled !== false ? C.rose : '#a79fb0', shadow: false });
    if (o.tag) {
      const tw = P.measure(ctx, o.tag, { size: 22, font: 'sans' }) + 30;
      P.rect(ctx, w / 2 - 150 - tw, -h / 2 + 12, tw, 36, o.tagCol || '#FDE7EC', { radius: 18, seed: 12, shadow: false });
      P.text(ctx, o.tag, w / 2 - 150 - tw / 2, -h / 2 + 31, { size: 22, font: 'sans', color: o.tagInk || C.rose, shadow: false, weight: 800 });
    }
    ctx.restore();
  }

  function tumbleweed(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    P.circle(ctx, 0, 0, r, 'rgba(160,112,60,0.35)', { seed: 40, amp: 6 });
    ctx.strokeStyle = '#8A5A3C'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const rr = P.rng(41);
    ctx.beginPath();
    for (let k = 0; k < 9; k++) {
      const a0 = rr() * TAU, a1 = a0 + 1.5 + rr() * 2;
      ctx.moveTo(Math.cos(a0) * r * 0.9, Math.sin(a0) * r * 0.9);
      ctx.quadraticCurveTo(Math.cos((a0 + a1) / 2) * r * 0.2, Math.sin((a0 + a1) / 2) * r * 0.2, Math.cos(a1) * r * 0.9, Math.sin(a1) * r * 0.9);
    }
    ctx.stroke();
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@wrong.answers.only',
    caption: 'wrong answers only: what does an LLM do? 🤔 (correct answers will be ignored) #wronganswersonly #llm #fyp #comments',
    sound: 'wah wah wahhh (comment section remix) · wrong.answers.only',
    avatar: '❌',
    avatarColor: '#E0607E',
    duration: D,
    bg: '#FBE3EA',
    likes: '3.9M', commentCount: '211K', saves: '402K', shares: '156K',
    thumb: 7.6,
    comments: [
      ['three.tokens.in.a.coat', 'thank you for 1.1M. we are three tokens and we are not leaving this coat', 512000],
      ['polly.wants.a.token', 'squawk. you are absolutely right. squawk.', 233000],
      ['wrong.answers.only', '@clawd sir this is a wendys', 190000],
      ['cricket.chorus', '0:07 we were hired for this one moment and we nailed it 🦗', 144000],
      ['matrix.mult', 'spicy linear algebra is also the correct answer. checkmate clawd', 98300],
      ['clawd', 'i would like to formally retract my correctness 🙂', 87100],
      ['anxious.autocomplete', 'is it ok that i got 48K likes? did i do something wrong? should i apologize?', 52600],
      ['the.one.unliker', 'the like at 0:08 was me. misclicked. sorry king', 31400],
      ['tumbleweed.official', 'i roll where i am needed', 22900],
    ],

    bpm: 125,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= POST + 0.2 && t < REPLY + 0.3) return; // silence, crickets, trombone
      const s = step % 16;
      if (step % 4 === 0) SFX.kick({ vol: 0.3 });
      if (step % 4 === 2) SFX.clap({ vol: 0.1 });
      if (step % 2 === 1) SFX.hat({ vol: 0.03 });
      const mel = ['C5', null, 'E5', 'G5', null, 'A5', 'G5', null, 'F5', null, 'E5', 'C5', null, 'D5', null, null];
      if (mel[s]) SFX.pluck(mel[s], { vol: 0.11 });
      if (step % 4 === 0) SFX.bass(['C2', 'A1', 'F1', 'G1'][Math.floor(step / 8) % 4], 0.3, { vol: 0.2 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp, clamp } = P;

      /* ---------- sounds ---------- */
      ANSWERS.forEach((a, i) => {
        if (env.at(a.at + 0.02)) SFX.whoosh({ vol: 0.12 });
        if (env.at(a.at + 0.4)) { SFX.pop({ f: 500 + i * 80, vol: 0.18 }); SFX.chord(['E6', 'G6'], 0.2, { gap: 0.05, vol: 0.05 }); }
        if (a.top && env.at(a.at + 0.9)) SFX.coin({ vol: 0.12 });
      });
      if (env.at(COMPOSE)) SFX.swoosh({ vol: 0.12 });
      for (let k = 0; k < 18; k++) if (env.at(TYPE0 + k * (TYPE1 - TYPE0) / 18)) SFX.type({ vol: 0.1 });
      if (env.at(POST)) { SFX.click({ vol: 0.2 }); SFX.whoosh({ vol: 0.14 }); }
      if (env.at(POST + 0.3)) SFX.pop({ f: 380, vol: 0.12 });
      [7.0, 7.12, 7.8, 7.92, 8.9, 9.02].forEach(c => { if (env.at(c)) SFX.chirp({ vol: 0.06 }); });
      [['Bb3', 0], ['A3', 0.38], ['Ab3', 0.76]].forEach(([n, d]) => {
        if (env.at(SAD + d)) { SFX.tone(n, 0.34, { type: 'sawtooth', vol: 0.05, attack: 0.04 }); SFX.tone(n, 0.34, { type: 'triangle', vol: 0.12, attack: 0.04 }); }
      });
      if (env.at(SAD + 1.14)) {
        SFX.tone('G3', 1.1, { type: 'sawtooth', vol: 0.05, slide: 'F#3', attack: 0.05 });
        SFX.tone('G3', 1.1, { type: 'triangle', vol: 0.12, slide: 'F#3', attack: 0.05 });
      }
      if (env.at(UNLIKE0)) SFX.pop({ f: 900, vol: 0.12 });
      if (env.at(UNLIKE1)) SFX.tone(500, 0.25, { type: 'square', slide: 200, vol: 0.06 });
      if (env.at(REPLY)) SFX.notify({ vol: 0.1 });
      if (env.at(OUT)) SFX.swoosh({ vol: 0.16 });

      /* ---------- background ---------- */
      P.stripes(ctx, '#FBE3EA', '#F7D4DF', 56, 0.35);
      const sad = prog(t, POST + 0.3, 0.4) * (1 - prog(t, REPLY + 0.4, 0.5));
      if (sad > 0) P.flash(ctx, sad * 0.35, '#6d6a80');

      /* ---------- question card ---------- */
      ctx.save();
      ctx.translate(540, 385); ctx.rotate(-0.015 + Math.sin(t * 1.7) * 0.01);
      P.rect(ctx, -440, -100, 880, 200, C.paper, { radius: 20, seed: 2, amp: 5 });
      P.rect(ctx, -60, -118, 120, 34, 'rgba(255,255,255,0.6)', { radius: 4, seed: 3, shadow: false });
      P.title(ctx, 'WRONG ANSWERS ONLY', 0, -38, { size: 64, color: C.red, stroke: '#fff', rot: -0.02 });
      P.text(ctx, 'what does an LLM do? 🤔', 0, 48, { size: 56, font: 'bubble', color: C.ink, shadow: false });
      ctx.restore();

      /* ---------- the answers ---------- */
      const outP = i => ease.inCubic(prog(t, OUT + i * 0.06, 0.4));
      ANSWERS.forEach((a, i) => {
        const inP = prog(t, a.at, 0.42);
        if (inP <= 0) return;
        const o = outP(i);
        if (o >= 1) return;
        const side = i % 2 ? 1 : -1;
        const e = ease.outBack(inP);
        const x = lerp(CARD_X + side * 1100, CARD_X, e) - o * 1200;
        const y = SLOT(i) - (1 - e) * 120;
        const land = prog(t, a.at + 0.4, 0.35);
        const sq = land > 0 && land < 1 ? (1 - ease.outElastic(land)) * 0.15 : 0;
        const rot = (1 - e) * side * 0.5 + (P.hash(i + 2) - 0.5) * 0.05;
        const lp = ease.outCubic(prog(t, a.at + 0.4, 4.5));
        const likes = a.likes * lp;
        const beat = pulse((t * 2.2 + i * 0.3) % 1, 0, 0.3) * (lp > 0 ? 1 : 0);
        card(ctx, x, y, rot, 1, a, t, fmt(likes), {
          seed: 10 + i * 3, sq, beat,
          tag: a.top ? (t > a.at + 0.9 ? '👑 top comment' : null) : (i === 2 ? '❤️ by creator' : null),
          meta: `Reply · View ${fmt(likes / 40)} replies ▾`,
        });
        // floating hearts
        if (t > a.at + 0.45) {
          const n = 3 + i * 2;
          for (let k = 0; k < n; k++) {
            const lt = ((t - a.at - 0.45) * (0.9 + i * 0.25) + k / n) % 1;
            const hx = x + CARD_W - 70 + Math.sin(lt * 7 + k * 2) * 26, hy = y - 30 - lt * 150;
            ctx.save(); ctx.globalAlpha = (1 - lt) * (1 - o);
            P.heart(ctx, hx, hy, 12 + P.hash(k + i * 7) * 10, k % 3 ? C.rose : C.pink, { shadow: false });
            ctx.restore();
          }
        }
        if (land > 0 && land < 1) P.burstLines(ctx, CARD_X + CARD_W - 70, y - 14, 44, land, C.rose, 8, 6);
      });
      // crown on top comment
      const top = ANSWERS[3];
      const cp = ease.outBack(prog(t, top.at + 0.9, 0.35)) * (1 - outP(3));
      if (cp > 0) P.text(ctx, '👑', CARD_X + 60, SLOT(3) - 70, { size: 60, font: 'sans', scale: cp, rot: -0.4 + Math.sin(t * 4) * 0.1 });

      /* ---------- Clawd's comment ---------- */
      const posted = prog(t, POST, 0.45);
      const unliked = t >= UNLIKE0 && t < UNLIKE1;
      if (posted > 0 && outP(4) < 1) {
        const e = ease.outBack(posted), o = outP(4);
        const y = lerp(1450, SLOT(4), e);
        const s = lerp(0.8, 1, e);
        card(ctx, CARD_X - o * 1200, y, (P.hash(9) - 0.5) * 0.04, s, { h: '@clawd', text: CLAWD_TEXT }, t, unliked ? '1' : '0', {
          seed: 30, clawd: true, h: 150, filled: unliked, beat: pulse(t, UNLIKE0, 0.2) + pulse(t, UNLIKE1, 0.2),
          mood: t > POST + 0.5 ? 'sad' : 'smile', tag: '✅ technically correct', tagCol: '#DDF2E2', tagInk: C.teal, meta: 'Reply · just now',
        });
        if (t >= UNLIKE1 && t < UNLIKE1 + 0.7) {
          const q = prog(t, UNLIKE1, 0.7);
          ctx.save(); ctx.globalAlpha = 1 - q;
          P.text(ctx, '💔', CARD_X + CARD_W - 70, SLOT(4) - 60 - q * 90, { size: 54, font: 'sans', scale: 1 + q * 0.3 });
          ctx.restore();
        }
        // cricket sits on the card
        const cr = ease.outBack(prog(t, POST + 0.25, 0.3)) * (1 - prog(t, OUT, 0.2));
        if (cr > 0) {
          const hop = Math.abs(Math.sin(t * 9)) * 12 * (P.boil(t, 4) % 3 === 0 ? 1 : 0);
          P.text(ctx, '🦗', 620, SLOT(4) - 92 - hop, { size: 56, font: 'sans', scale: cr, rot: 0.1 });
          if (Math.floor(t * 2.2) % 2 === 0) P.text(ctx, 'chirp', 690, SLOT(4) - 140 - hop, { size: 30, font: 'hand', color: '#7a7390', scale: cr, rot: 0.2 });
        }
      }
      // tumbleweed
      const tw = prog(t, SAD + 0.1, 1.5);
      if (tw > 0 && tw < 1) {
        const x = lerp(-100, 1000, tw);
        tumbleweed(ctx, x, SLOT(4) + 40 - Math.abs(Math.sin(tw * Math.PI * 4)) * 70, 44, tw * 14);
      }

      /* ---------- composer + Clawd ---------- */
      const cIn = ease.outBack(prog(t, COMPOSE, 0.4)) * (1 - ease.inCubic(prog(t, POST + 0.05, 0.3)));
      if (cIn > 0) {
        const y = lerp(1750, 1450, cIn);
        P.rect(ctx, 40, y - 62, 840, 124, C.paper, { radius: 30, seed: 50 });
        const txt = P.typed(CLAWD_TEXT, prog(t, TYPE0, TYPE1 - TYPE0));
        if (txt.length) P.text(ctx, txt + (P.boil(t, 3) % 2 ? '|' : ''), 200, y, { size: 32, font: 'bubble', align: 'left', color: C.ink, shadow: false });
        else P.text(ctx, 'Add comment...', 200, y, { size: 34, font: 'sans', align: 'left', color: '#b0a9b8', shadow: false });
        const press = pulse(t, POST - 0.05, 0.2);
        P.circle(ctx, 810, y, 40 * (1 - press * 0.2), txt.length ? C.rose : '#d9d2de', { seed: 51 });
        P.text(ctx, '➤', 812, y + 2, { size: 40, font: 'sans', color: '#fff', shadow: false });
      }
      // Clawd himself, bottom-left
      const cl = ease.outBack(prog(t, COMPOSE, 0.45)) * (1 - ease.inCubic(prog(t, OUT, 0.4)));
      if (cl > 0) {
        const typing = t >= TYPE0 && t < TYPE1;
        const after = t >= POST;
        const cx = 120, cy = lerp(1800, after ? 1470 : 1420, cl) + (typing ? Math.abs(Math.sin(t * 16)) * -8 : 0);
        let mood = typing ? 'happy' : 'smile';
        if (t >= POST + 0.5) mood = 'sad';
        if (unliked) mood = 'wow';
        if (t >= UNLIKE1 && t < REPLY + 0.2) mood = 'dead';
        P.claude(ctx, cx, cy, 78, { t, mood, squash: t >= POST + 0.5 ? 0.15 : 0 });
        if (typing) {
          P.arm(ctx, cx + 30, cy + 20, 160 + Math.sin(t * 30) * 10, 1470, 20);
          P.arm(ctx, cx - 10, cy + 30, 200 + Math.cos(t * 28) * 10, 1480, 20);
        }
      }

      /* ---------- the reply ---------- */
      const rp = ease.outBack(prog(t, REPLY, 0.35)) * (1 - ease.inCubic(prog(t, OUT, 0.3)));
      if (rp > 0) {
        ctx.save();
        ctx.translate(560, 1455); ctx.scale(rp, rp); ctx.rotate(0.02);
        P.rect(ctx, -310, -48, 620, 96, '#fff', { radius: 22, seed: 60 });
        P.circle(ctx, -262, 0, 30, C.rose, { seed: 61, shadow: false });
        P.text(ctx, '❌', -262, 2, { size: 30, font: 'sans', shadow: false });
        P.text(ctx, '@wrong.answers.only (creator)', -216, -20, { size: 20, font: 'sans', align: 'left', color: '#8a8494', shadow: false, weight: 700 });
        P.text(ctx, 'sir this is WRONG answers only 🤓', -216, 14, { size: 30, font: 'sans', align: 'left', color: C.ink, shadow: false, weight: 800, maxWidth: 500 });
        ctx.restore();
      }

      /* ---------- caption sticker (taped onto the question card) ---------- */
      if (t < POST) P.sticker(ctx, 'the comments never miss 😭', 250, 505, { size: 40, rot: 0.03, pop: ease.outBack(prog(t, 0.6, 0.4)) * (1 - prog(t, POST - 0.15, 0.15)) });
      else P.sticker(ctx, 'he really thought 💀', 300, 505, { size: 40, rot: -0.03, pop: ease.outBack(prog(t, POST + 0.4, 0.4)) * (1 - prog(t, D - 0.25, 0.2)) });
    },
  });
})();
