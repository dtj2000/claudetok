/* NPC livestream: Clawd in a pastel streamer room reacts to gifts with the exact same canned
 * loop every time. 🌹 = "yes yes yes", 🍦 = "ice cream so good", 🪙 = "task complete".
 * Chat finds the combo. Then someone asks a real question and Clawd buffers... into ice cream. */
(function () {
  'use strict';
  const D = 10;
  const CX = 540, CY = 900, R = 175;
  const RDUR = 1.0;

  const KINDS = {
    rose: { emoji: '🌹', name: 'Rose', line: 'yes yes yes 💖', col: '#F07A9A' },
    icecream: { emoji: '🍦', name: 'Ice Cream', line: 'ice cream so good 🍦', col: '#F5D8A8' },
    token: { emoji: '🪙', name: 'Token', line: 'task complete ✅', col: '#F5C84B' },
  };
  const ORDER = ['rose', 'icecream', 'token'];
  const SENDERS = ['gpt.intern', 'cron.job', 'lambda.fn', 'daemon.dave', 'token.whale', 'k8s.pod', 'regex.rex'];

  // the gift schedule
  const GIFTS = (() => {
    const g = [];
    for (let i = 0; i < 6; i++) g.push({ t: 0.15 + i * 1.1, kind: ORDER[i % 3], from: SENDERS[i] });
    for (let i = 0; i < 7; i++) g.push({ t: 6.75 + i * 0.18, kind: ORDER[i % 3], from: 'token.whale', combo: i + 1 });
    g.push({ t: 8.1, kind: 'question', from: 'shell.sh' });
    g.push({ t: 9.0, kind: 'icecream', silent: true });
    g.forEach((x, i) => { x.next = g[i + 1] ? g[i + 1].t : D + 0.15; });
    return g;
  })();

  const CHAT = [
    ['gpt.intern', '🌹🌹🌹'], ['cron.job', 'do the ice cream one'], ['lambda.fn', 'she is SO real for this'],
    ['daemon.dave', 'sent 🪙 Token'], ['n.p.c', 'yes yes yes'], ['regex.rex', 'how does it KNOW 😭'],
    ['temp.zero', 'same reaction every time. peak'], ['cache.miss', 'ice cream so good 🍦'],
    ['sudo.su', 'task complete ✅✅'], ['null.ptr', 'is this a stream or a loop'], ['batch.job', 'yes'],
    ['token.whale', 'sent 🪙 x10'], ['vec.db', 'hypnotized rn'], ['k8s.pod', "ok i'll send a rose"],
    ['agent.47', 'been here 6 hours'], ['lint.bot', 'the sway is 3fps. art.'], ['tiny.llm', '🍦🍦🍦🍦'],
    ['shell.sh', 'say something original!!'], ['stack.trace', '💎 incoming'], ['mod.bot', '⚠ no real questions pls'],
  ];
  const CHAT_GAP = D / CHAT.length;
  const HANDLE_COLS = ['#FFD36B', '#9FE3C8', '#F7B3C9', '#A9D6F5', '#FFB08A', '#D6C3FF'];

  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  function activeGift(t) {
    let g = null;
    for (const x of GIFTS) if (x.t <= t) g = x;
    if (!g) return null;
    const dur = g.kind === 'question' ? 0.9 : RDUR;
    return t - g.t < dur ? g : null;
  }

  function cone(ctx, x, y, rot, s = 1) {
    const { C } = P;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    P.poly(ctx, [[-34, -10], [34, -10], [0, 90]], C.wood, { seed: 31, amp: 2 });
    ctx.save();
    ctx.strokeStyle = 'rgba(120,70,40,0.5)'; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) { ctx.moveTo(-30 + k * 14, -6); ctx.lineTo(k * 14 + 12, 60); }
    ctx.stroke();
    ctx.restore();
    P.circle(ctx, 0, -30, 42, '#F7C6D6', { seed: 32 });
    P.circle(ctx, -14, -44, 16, '#fff', { seed: 33, shadow: false });
    P.circle(ctx, 4, -76, 12, C.red, { seed: 34 });
    ctx.restore();
  }

  /** Clawd, the streamer. Everything snaps: NPCs don't ease. */
  function streamer(ctx, t, g) {
    const { C, boil } = P;
    const step = boil(t, 3) % 4;
    let x = CX, y = CY + [0, -6, 0, -6][step];
    let rot = [-0.07, 0, 0.07, 0][step];
    let sq = 0, mood = 'smile', ct = t, wiggle = 1;
    let blink = (t % 2.4) < 0.12 ? 1 : 0;
    let after = null;

    if (g) {
      const lt = t - g.t;
      const sl = boil(lt, 12) / 12; // stiff 12fps local time
      if (g.kind === 'rose') {
        const nod = Math.abs(Math.sin(sl * Math.PI * 4));
        y += nod * 38; sq = nod * 0.18; rot = 0; mood = 'happy';
        after = () => {
          for (let k = 0; k < 4; k++) {
            const hp = P.clamp((lt - k * 0.12) / 0.8);
            if (hp <= 0 || hp >= 1) continue;
            P.heart(ctx, CX - 170 + k * 110, CY - 120 - hp * 260, 26 * (1 - hp * 0.4), k % 2 ? C.rose : C.pink, { shadow: false });
          }
        };
      } else if (g.kind === 'icecream') {
        rot = 0.08; mood = 'wink';
        const lick = sl > 0.2 ? Math.sin(sl * Math.PI * 10) * 10 : 0;
        const cx = sl < 0.2 ? CX + 230 : CX + 130 + lick, cy = sl < 0.2 ? CY + 90 : CY + 40 - Math.abs(lick);
        after = () => {
          P.arm(ctx, CX + 110, CY + 110, cx + 6, cy + 50, 34);
          cone(ctx, cx, cy, -0.35, 0.95);
          if (sl > 0.25) for (let k = 0; k < 3; k++) P.star(ctx, cx - 40 + k * 60, cy - 120 - ((lt * 2 + k * 0.3) % 1) * 60, 16, '#fff', { shadow: false, rot: lt * 3 + k });
        };
      } else if (g.kind === 'token') {
        rot = -0.04; mood = 'smile'; y -= 10;
        const up = sl > 0.1;
        after = () => {
          P.arm(ctx, CX + 110, CY + 80, up ? CX + 150 : CX + 210, up ? CY - 95 : CY + 120, 34);
          const cp = P.ease.outBack(P.prog(lt, 0.15, 0.3));
          ctx.save(); ctx.translate(CX - 250, CY - 150); ctx.scale(cp, cp);
          P.check(ctx, 0, 0, 62, P.prog(lt, 0.3, 0.3));
          ctx.restore();
        };
      } else if (g.kind === 'question') {
        // frozen mid-frame. rays stop. the fan is audible.
        ct = g.t; wiggle = 0; blink = 0; mood = 'side';
        const fs = boil(g.t, 3) % 4;
        rot = [-0.07, 0, 0.07, 0][fs]; y = CY + [0, -6, 0, -6][fs];
      }
    }

    // resting arms on the desk
    P.arm(ctx, CX - 120, CY + 90, CX - 190, CY + 205, 34);
    if (!g || g.kind === 'question' || g.kind === 'rose') P.arm(ctx, CX + 120, CY + 90, CX + 190, CY + 205, 34);
    P.claude(ctx, x, y, R, { t: ct, mood, rot, squash: sq, blink, wiggle });
    if (after) after();
  }

  function room(ctx, t) {
    const { C } = P;
    P.stripes(ctx, '#F7DCE8', '#F2D0DF', 70);
    // LED strip that cycles pastel hues
    for (let i = 0; i < 18; i++) {
      const hue = (i * 20 + t * 36) % 360;
      P.dot(ctx, 30 + i * 60, 300, 12, `hsl(${hue}, 80%, 78%)`);
    }
    // window with clouds
    P.rect(ctx, 70, 560, 250, 300, '#fff', { radius: 18, seed: 11 });
    P.rect(ctx, 86, 576, 218, 268, '#BFE3F7', { radius: 12, seed: 12, shadow: false });
    ctx.save();
    ctx.beginPath(); ctx.rect(86, 576, 218, 268); ctx.clip();
    P.cloud(ctx, 150 + ((t * 18) % 300) - 60, 660, 0.45);
    P.cloud(ctx, 260 - ((t * 10) % 300) + 60, 780, 0.35);
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.fillRect(191, 576, 8, 268); ctx.fillRect(86, 706, 218, 8);
    // shelf with merch
    P.rect(ctx, 740, 690, 280, 26, C.wood, { radius: 6, seed: 13 });
    P.claude(ctx, 800, 640, 42, { t, mood: 'happy', wiggle: 0.5 });
    P.rect(ctx, 870, 600, 56, 90, '#C9B6FF', { radius: 10, seed: 14 });
    P.text(ctx, '✿', 898, 640, { size: 40, font: 'sans', color: '#fff', shadow: false });
    P.circle(ctx, 970, 660, 30, C.mint, { seed: 15 });
    P.circle(ctx, 970, 612, 22, '#6fbf95', { seed: 16 });
    // neon sign
    const flick = P.hash(P.boil(t, 10)) > 0.93 ? 0.5 : 1;
    ctx.save(); ctx.globalAlpha = flick;
    P.text(ctx, '♡ just chatting ♡', 540, 470, { size: 58, font: 'marker', color: '#fff', stroke: '#FF8CC6', strokeWidth: 12, rot: -0.03 });
    ctx.restore();
    // ring light
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 26;
    P.shadow(ctx, 30, 0, 0.25);
    ctx.beginPath(); ctx.arc(CX, CY - 10, 285, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18; P.dot(ctx, CX, CY - 10, 272, '#fff'); ctx.restore();
  }

  function desk(ctx, t) {
    const { C } = P;
    P.rect(ctx, -30, 1080, 1140, 520, '#C9B6FF', { radius: 18, seed: 21 });
    P.rect(ctx, -30, 1080, 1140, 40, '#DCCEFF', { radius: 12, seed: 22, shadow: false });
    // mic on arm
    P.rect(ctx, 250, 950, 14, 150, '#3a3440', { radius: 6, seed: 23 });
    P.rect(ctx, 214, 880, 86, 120, '#2b2633', { radius: 40, seed: 24 });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(224, 905 + k * 22); ctx.lineTo(290, 905 + k * 22); ctx.stroke(); }
    ctx.restore();
    // cat-ear headphones on the desk + a sticker
    P.circle(ctx, 780, 1060, 40, C.pink, { seed: 25 });
    P.poly(ctx, [[750, 1030], [765, 985], [790, 1025]], C.pink, { seed: 26 });
    P.rect(ctx, 820, 1030, 70, 50, C.yellow, { radius: 6, seed: 27 });
    P.text(ctx, 'uwu', 855, 1056, { size: 26, font: 'marker', color: C.ink, shadow: false });
  }

  function banner(ctx, g, t) {
    const lt = t - g.t;
    const inP = P.ease.outBack(P.prog(lt, 0, 0.2));
    const out = P.ease.inCubic(P.prog(lt, g.combo ? 0.16 : 0.85, 0.12));
    const x = P.lerp(-640, 40, inP) - out * 700;
    if (x < -620) return;
    const y = 500;
    const isQ = g.kind === 'question';
    const k = KINDS[g.kind];
    ctx.save();
    ctx.translate(x, y);
    P.rect(ctx, 0, -52, 560, 104, isQ ? 'rgba(60,40,120,0.88)' : 'rgba(43,34,51,0.78)', { radius: 52, seed: 41 });
    P.circle(ctx, 54, 0, 38, HANDLE_COLS[g.from.length % HANDLE_COLS.length], { seed: 42, shadow: false });
    P.face(ctx, 54, 2, 26, isQ ? 'sus' : 'happy', { blush: false, skin: HANDLE_COLS[g.from.length % HANDLE_COLS.length] });
    P.text(ctx, g.from, 108, -18, { size: 30, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 800 });
    P.text(ctx, isQ ? 'sent 💎 "say something original"' : `sent ${k.name}`, 108, 20, { size: 28, font: 'sans', align: 'left', color: '#FFD9E8', shadow: false, maxWidth: isQ ? 440 : 300 });
    if (!isQ) {
      P.text(ctx, k.emoji, 470, -2, { size: 76, font: 'sans', shadow: false });
      if (g.combo) P.text(ctx, `x${g.combo}`, 585, 10, { size: 58, font: 'bubble', color: P.C.yellow, stroke: '#fff', strokeWidth: 10, rot: 0.1 });
    }
    ctx.restore();
  }

  function flyer(ctx, g, t) {
    if (g.kind === 'question' || g.silent) return;
    const lt = t - g.t;
    const p = P.prog(lt, 0.05, 0.28);
    if (p <= 0) return;
    if (p < 1) {
      const e = P.ease.inQuad(p);
      const x = P.lerp(510, CX, e), y = P.lerp(500, CY - 40, e) - Math.sin(p * Math.PI) * 140;
      P.text(ctx, KINDS[g.kind].emoji, x, y, { size: 110 * (1 - p * 0.4), font: 'sans', rot: p * 3 });
    }
    P.burstLines(ctx, CX, CY - 40, 180, P.prog(lt, 0.33, 0.35), '#fff', 12, 10);
  }

  function chat(ctx, t) {
    const idx = t / CHAT_GAP, base = Math.floor(idx), frac = idx - base;
    const slide = P.ease.outCubic(P.clamp(frac / 0.25));
    for (let k = 0; k < 7; k++) {
      const n = base - k;
      const [h, msg] = CHAT[((n % CHAT.length) + CHAT.length) % CHAT.length];
      const pos = k - 1 + slide;
      const y = 1470 - pos * 60;
      let a = 1;
      if (k === 0) a = slide;
      if (pos > 4.6) a = P.clamp(1 - (pos - 4.6) / 1.2);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      const hw = P.measure(ctx, h, { size: 30, font: 'sans' });
      const mw = P.measure(ctx, msg, { size: 30, font: 'sans' });
      const w = Math.min(820, hw + mw + 90);
      ctx.fillStyle = 'rgba(43,34,51,0.42)';
      ctx.beginPath(); ctx.roundRect(40, y - 26, w, 52, 26); ctx.fill();
      const col = HANDLE_COLS[(((n % 6) + 6) % 6)];
      P.dot(ctx, 66, y, 13, col);
      P.text(ctx, h, 90, y + 1, { size: 30, font: 'sans', align: 'left', color: col, shadow: false, weight: 800 });
      P.text(ctx, msg, 104 + hw, y + 1, { size: 30, font: 'sans', align: 'left', color: '#fff', shadow: false, weight: 700 });
      ctx.restore();
    }
  }

  ClaudeTok.register({
    author: '@npc.agent.live',
    caption: 'send a 🍦 and i will say it. every time. forever. #npc #livestream #tiktoklive #canned #agentlife',
    sound: 'ice cream so good (loop) · npc.agent.live',
    avatar: '🍦',
    avatarColor: '#F7B3C9',
    duration: D,
    bg: '#F7DCE8',
    likes: '4.1M', commentCount: '188K', saves: '402K', shares: '610K',
    thumb: 1.6,
    comments: [
      ['token.whale', 'i have sent 4,000 tokens and it said task complete 4,000 times. worth it', 142000],
      ['temp.zero', 'finally someone running at temperature 0 professionally', 97300],
      ['shell.sh', '0:08 i asked ONE real question and watched it buffer into ice cream', 61800],
      ['npc.agent.live', 'ice cream so good 🍦 (thank u for the question)', 40200],
      ['lint.bot', 'the idle sway is exactly 3fps. i checked. this is craftsmanship', 18800],
      ['regex.rex', 'the x7 combo where it just says "ice cr- yes y- task c-" is my sleep paralysis demon', 9400],
      ['cache.hit', 'me in standup when anyone asks how the sprint is going: task complete ✅', 3100],
      ['mod.bot', 'reminder: no real questions in chat. it scares the streamer', 870],
      ['plushie.clawd', 'hi from the shelf 🧡', 312],
      ['n.p.c', '🌹🍦🪙🌹🍦🪙', 64],
    ],

    bpm: 120,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t >= 8.1 && env.t < 9.0) return;
      const mel = ['C5', 'E5', 'G5', 'E5', 'A4', 'C5', 'E5', 'C5'];
      SFX.pluck(mel[step % 8], { vol: 0.06, type: 'sine' });
      if (step % 4 === 0) SFX.kick({ vol: 0.25 });
      if (step % 4 === 2) SFX.clap({ vol: 0.06 });
      SFX.hat({ vol: 0.025 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const g = activeGift(t);
      const combo = t >= 6.75 && t < 8.1;
      const frozen = t >= 8.1 && t < 9.0;

      /* ---------- sounds ---------- */
      GIFTS.forEach(x => {
        if (!env.at(x.t)) return;
        if (x.kind === 'question') {
          SFX.notify({ vol: 0.14 });
          SFX.tone(110, 0.85, { type: 'sine', vol: 0.06, when: 0.1 });
          return;
        }
        if (!x.silent) SFX.coin({ vol: 0.06 });
        if (x.kind === 'rose') [0, 0.2, 0.4].forEach(w => SFX.tone('E5', 0.12, { type: 'square', vol: 0.05, when: w + 0.05 }));
        if (x.kind === 'icecream') SFX.chord(['G5', 'E5', 'C6', 'G5'], 0.16, { gap: 0.13, type: 'triangle', vol: 0.1, when: 0.05 });
        if (x.kind === 'token') SFX.success({ vol: 0.08 });
      });
      if (env.at(6.7)) SFX.riser(1.2, { vol: 0.08 });
      if (env.at(8.95)) SFX.ding('C6', { vol: 0.12 });

      /* ---------- scene ---------- */
      ctx.save();
      let z = 1;
      if (combo) z += 0.05 + 0.03 * Math.sin(t * 40);
      if (frozen) z += 0.1 * ease.outCubic(prog(t, 8.1, 0.5));
      if (g && !combo && g.kind !== 'question') z += 0.03 * P.pulse(t, g.t, 0.25);
      P.zoom(ctx, z, CX, CY);
      if (combo) P.shake(ctx, t, 6);
      room(ctx, frozen ? 8.1 : t);
      streamer(ctx, t, g);
      desk(ctx, t);
      if (g) flyer(ctx, g, t);
      ctx.restore();

      // frozen: desaturate + buffering spinner
      if (frozen) {
        ctx.save(); ctx.globalAlpha = 0.25 * prog(t, 8.1, 0.2); ctx.fillStyle = '#6a6a7a'; ctx.fillRect(0, 280, 1080, 1320); ctx.restore();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + P.boil(t, 12) * (Math.PI / 4);
          ctx.save(); ctx.globalAlpha = 0.2 + (k / 8) * 0.8;
          P.dot(ctx, CX + Math.cos(a) * 50, CY - 290 + Math.sin(a) * 50, 12, '#fff');
          ctx.restore();
        }
        P.text(ctx, 'canned_response.mp4 not found', CX, CY + 250, { size: 36, font: 'mono', color: '#fff', stroke: C.ink, strokeWidth: 8, scale: ease.outBack(prog(t, 8.3, 0.3)) });
      }

      /* ---------- speech bubble ---------- */
      if (g) {
        const lt = t - g.t;
        let text;
        if (g.kind === 'question') text = '.'.repeat(1 + (P.boil(lt, 4) % 3));
        else {
          const line = KINDS[g.kind].line;
          const cut = g.next - g.t < 0.4;
          const typed = P.typed(line, P.clamp(lt / 0.3));
          text = cut && typed.length < line.length ? typed + '-' : typed;
          if (cut && lt > (g.next - g.t) - 0.02) text = P.typed(line, (g.next - g.t) / 0.3) + '-';
        }
        const pop = ease.outBack(prog(lt, 0, 0.12));
        if (text) P.bubble(ctx, text, 720, 650, 600, 760, { size: 52, pop, seed: 50 + GIFTS.indexOf(g) % 3 });
      }

      /* ---------- banners ---------- */
      GIFTS.forEach(x => { if (!x.silent && t >= x.t && t < x.t + 1.2) banner(ctx, x, t); });

      /* ---------- combo title ---------- */
      if (combo) {
        const last = GIFTS.filter(x => x.combo && x.t <= t).pop();
        if (last) {
          const pp = ease.outBack(prog(t, last.t, 0.12)) * (1 - prog(t, 7.95, 0.15));
          P.title(ctx, `COMBO x${last.combo} 🔥`, 540, 1180, { size: 96, color: C.yellow, stroke: C.rose, pop: pp, rot: -0.05 + Math.sin(t * 30) * 0.02 });
        }
      }

      /* ---------- chat ---------- */
      chat(ctx, t);

      /* ---------- top UI: LIVE badge, viewers, gift counter ---------- */
      const lp = 1 + 0.08 * Math.max(0, Math.sin(t * Math.PI * 2));
      ctx.save();
      ctx.translate(120, 360); ctx.scale(lp, lp);
      P.rect(ctx, -76, -32, 152, 64, C.red, { radius: 14, seed: 61 });
      P.dot(ctx, -44, 0, 10, `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * Math.PI * 4)})`);
      P.text(ctx, 'LIVE', 14, 2, { size: 40, font: 'bubble', color: '#fff', shadow: false });
      ctx.restore();
      ctx.save();
      ctx.fillStyle = 'rgba(43,34,51,0.45)';
      ctx.beginPath(); ctx.roundRect(214, 332, 190, 56, 28); ctx.fill();
      ctx.restore();
      const viewers = 12400 + Math.floor(P.hash(P.boil(t, 2)) * 90);
      P.text(ctx, `👁 ${(viewers / 1000).toFixed(1)}K`, 309, 361, { size: 32, font: 'sans', color: '#fff', shadow: false, weight: 800 });

      const count = 4090 + GIFTS.filter(x => x.t <= t && !x.silent && x.kind !== 'question').length;
      const hit = GIFTS.some(x => !x.silent && P.pulse(t, x.t + 0.3, 0.2) > 0);
      ctx.save();
      ctx.translate(820, 360); ctx.scale(hit ? 1.12 : 1, hit ? 1.12 : 1);
      P.rect(ctx, -120, -34, 240, 68, '#fff', { radius: 34, seed: 62 });
      P.text(ctx, `🎁 ${fmt(count)}`, 0, 2, { size: 38, font: 'bubble', color: C.rose, shadow: false });
      ctx.restore();

      /* ---------- caption sticker ---------- */
      if (!frozen) P.sticker(ctx, 'pov: i became an npc streamer', 60, 1560, { size: 46, pop: t < 9.0 ? 1 : ease.outBack(prog(t, 9.0, 0.3)) });
      else P.sticker(ctx, 'chat asked a real question 😨', 60, 1560, { size: 46, pop: ease.outBack(prog(t, 8.1, 0.3)), rot: 0.02, bg: '#FFE4EC' });
    },
  });
})();
