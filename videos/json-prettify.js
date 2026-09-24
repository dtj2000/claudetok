/* A minified one-line JSON blob. Then: ⌘S. Every token flies home. */
(function () {
  const DATA = { agent: 'claude', mood: 'focused', context: { used: 199872, max: 200000 }, tools: ['bash', 'edit', 'grep'], sleep: false, coffee: null };
  const X0 = 176, Y0 = 412, LH = 48, SIZE = 32;
  const CASCADE = 2.6, STAG = 0.036, FLY = 0.45, SPARK = 5.25, COLLAPSE = 8.9, DUR = 9.6;
  const COLORS = { brace: '#F6EEDD', punct: '#9aa0b5', key: '#F2B8C6', str: '#8FD3B6', num: '#F5C84B', bool: '#c9b6ff', null: '#9aa0b5' };
  const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];

  // tokenize once: every token knows its spot in the one-liner (mcol) and in the pretty tree (line, col)
  const TOKS = [], BLOCKS = [];
  {
    let line = 0, col = 0, mcol = 0;
    const emit = (s, type) => { TOKS.push({ s, type, line, col, mcol }); col += s.length; mcol += s.length; };
    const nl = (ind) => { line++; col = ind * 2; };
    const val = (v, ind) => {
      if (v && typeof v === 'object') {
        const arr = Array.isArray(v), a = line;
        emit(arr ? '[' : '{', 'brace');
        const keys = arr ? v.map((_, i) => i) : Object.keys(v);
        keys.forEach((k, i) => {
          nl(ind + 1);
          if (!arr) { emit(JSON.stringify(k), 'key'); emit(':', 'punct'); col += 1; }
          val(v[k], ind + 1);
          if (i < keys.length - 1) emit(',', 'punct');
        });
        nl(ind);
        BLOCKS.push({ a, b: line, ind });
        emit(arr ? ']' : '}', 'brace');
      } else {
        emit(JSON.stringify(v), v === null ? 'null' : typeof v === 'number' ? 'num' : typeof v === 'boolean' ? 'bool' : 'str');
      }
    };
    val(DATA, 0);
  }
  const NT = TOKS.length;
  const LINES = TOKS[NT - 1].line + 1;
  const MLEN = TOKS[NT - 1].mcol + 1;
  TOKS.forEach((tk, k) => {
    tk.s0 = CASCADE + k * STAG;
    tk.back = COLLAPSE + (NT - 1 - k) * 0.006;
    tk.first = k === 0 || TOKS[k - 1].line !== tk.line;
  });
  const lineLand = [];
  TOKS.forEach((tk) => { if (tk.first) lineLand[tk.line] = tk.s0 + FLY * 0.8; });

  function keycap(ctx, x, y, w, label, press) {
    P.rect(ctx, x - w / 2, y - 60, w, 130, '#b9aee0', { radius: 26, seed: w });
    P.rect(ctx, x - w / 2 + 10, y - 70 + press * 12, w - 20, 104, C_KEY, { radius: 22, seed: w + 1, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
    P.text(ctx, label, x, y - 18 + press * 12, { size: 64, font: 'bubble', color: P.C.purple, shadow: false });
  }
  const C_KEY = '#F6EEDD';

  ClaudeTok.register({
    author: '@format.on.save',
    caption: 'format on save hits different ✨ minified → prettified in one keystroke #asmr #oddlysatisfying #json #prettier',
    sound: 'the prettier cascade · format.on.save',
    avatar: '✨',
    avatarColor: '#6B4E9B',
    duration: DUR,
    bg: '#5b4a8f',
    thumb: 6.2,
    likes: '1.7M', commentCount: '29K', saves: '488K', shares: '97K',
    comments: [
      ['minifier', 'i worked so hard on that one line 😔', 58400],
      ['trailing.comma', 'not allowed in json. i know. i KNOW.', 44700],
      ['claude', 'me reading my own tool output before vs after', 33800],
      ['coffee.null', 'coffee: null. in THIS economy', 19600],
      ['context.used', '"used": 199872 out of 200000 is the scariest number in the file and nobody flinched', 11200],
      ['format.on.save', 'every token plays a note on the way home. the closing brace is the high A. you are welcome', 6300],
      ['tabs.2.spaces', 'prettier chose 2 spaces and the comment section will now fight about it', 2900],
      ['my.eyes.bot', '"my eyes 😵" at 0:01 is how i react to every api response i get', 1100],
      ['cmd.s.keycap', '⌘S ⌘S ⌘S ⌘S ⌘S', 340],
      ['json.pedant', 'technically that red squiggle would never appear, minified json is valid json. but i felt it', 47],
    ],

    draw(ctx, t, env) {
      const { C, ease, prog, pulse, lerp } = P;

      // ---- background
      P.stripes(ctx, '#5b4a8f', '#64529a', 70, 0.35);

      ctx.save();
      const punch = pulse(t, SPARK, 0.35);
      if (punch > 0) P.zoom(ctx, 1 + 0.04 * punch, 495, 740);
      if (t > 2.25 && t < 2.55) P.shake(ctx, t, 10 * (1 - prog(t, 2.25, 0.3)));

      // ---- editor window
      P.window(ctx, 80, 300, 830, 900, 'data.json', { bg: '#282a3a', titleColor: '#d9d4e8', bar: 'rgba(255,255,255,0.06)', seed: 11 });
      const cw = P.measure(ctx, '0', { size: SIZE, font: 'mono' });
      const maxScroll = Math.max(0, MLEN * cw - 700);
      const scroll = t < 2.3 ? maxScroll * ease.outQuad(prog(t, 0, 2.1)) : maxScroll * (1 - ease.outCubic(prog(t, 2.3, 0.28)));

      ctx.save();
      ctx.beginPath(); ctx.rect(84, 372, 822, 766); ctx.clip();

      // line numbers
      for (let l = 0; l < LINES; l++) {
        const shown = l === 0 || (t >= lineLand[l] && t < COLLAPSE + 0.1);
        if (!shown) continue;
        const np = l === 0 ? 1 : ease.outBack(prog(t, lineLand[l], 0.25));
        P.text(ctx, String(l + 1), 136, Y0 + l * LH, { size: 26, font: 'mono', align: 'right', color: '#6c7089', shadow: false, scale: np });
      }
      // indent guides
      const ga = prog(t, 4.9, 0.4) * (1 - prog(t, COLLAPSE, 0.15));
      if (ga > 0) {
        ctx.save(); ctx.globalAlpha = ga; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
        BLOCKS.forEach(({ a, b, ind }) => {
          if (b - a < 2) return;
          const gx = X0 + ind * 2 * cw + cw * 0.45;
          ctx.beginPath(); ctx.moveTo(gx, Y0 + a * LH + LH * 0.55); ctx.lineTo(gx, Y0 + (b - 0.55) * LH); ctx.stroke();
        });
        ctx.restore();
      }
      // the red "this is unreadable" squiggle
      const sq = t < 4 ? 1 - prog(t, 2.3, 0.2) : prog(t, COLLAPSE + 0.3, 0.3);
      if (sq > 0) {
        ctx.save(); ctx.globalAlpha = sq; ctx.strokeStyle = C.red; ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = X0; x <= 900; x += 6) ctx.lineTo(x, Y0 + 26 + Math.sin(x * 0.35) * 5);
        ctx.stroke(); ctx.restore();
      }

      // tokens
      TOKS.forEach((tk, k) => {
        const mx = X0 + tk.mcol * cw - scroll, my = Y0;
        const px = X0 + tk.col * cw, py = Y0 + tk.line * LH;
        const p = prog(t, tk.s0, FLY);
        const b = prog(t, tk.back, 0.3);
        let x, y, rot = 0, sc = 1;
        if (b > 0) {
          const e = ease.inOutCubic(b);
          x = lerp(px, mx, e); y = lerp(py, my, e) - Math.sin(b * Math.PI) * 24;
        } else {
          x = lerp(mx, px, ease.outCubic(p));
          y = lerp(my, py, ease.outBack(p)) - Math.sin(p * Math.PI) * 36;
          rot = Math.sin(p * Math.PI) * (P.hash(k) - 0.5) * 0.9;
          sc = 1 + 0.3 * pulse(t, tk.s0 + FLY * 0.75, 0.2);
        }
        if (x > 920 || x < -300) return;
        P.text(ctx, tk.s, x, y, { size: SIZE, font: 'mono', align: 'left', color: COLORS[tk.type], shadow: false, rot, scale: sc });
        if (env.at(tk.s0 + FLY * 0.8)) {
          SFX.tick({ vol: 0.16 });
          if (tk.first) SFX.pluck(NOTES[tk.line % NOTES.length], { vol: 0.09 });
        }
      });
      // cursor
      if (t < CASCADE && Math.floor(t * 4) % 2 === 0) {
        ctx.save(); ctx.fillStyle = C.mint; ctx.fillRect(Math.min(890, X0 + MLEN * cw - scroll + 4), Y0 - 20, 4, 40); ctx.restore();
      }
      // glint sweep
      const gp = prog(t, SPARK, 0.6);
      if (gp > 0 && gp < 1) {
        const gx = lerp(-200, 1200, ease.inOutCubic(gp));
        ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(gx, 372); ctx.lineTo(gx + 120, 372); ctx.lineTo(gx - 180, 1140); ctx.lineTo(gx - 300, 1140); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore(); // clip

      // status bar
      const pretty = t >= 5.0 && t < COLLAPSE + 0.15;
      ctx.save(); ctx.fillStyle = pretty ? 'rgba(93,179,106,0.35)' : 'rgba(224,72,78,0.3)';
      ctx.beginPath(); ctx.roundRect(84, 1140, 822, 56, [0, 0, 20, 20]); ctx.fill(); ctx.restore();
      P.text(ctx, pretty ? `✓ Prettier · ${LINES} lines` : `⚠ Ln 1, Col ${MLEN} · 1 line`, 110, 1169, { size: 28, font: 'mono', align: 'left', color: '#f1ecff', shadow: false });
      P.text(ctx, 'JSON', 880, 1169, { size: 28, font: 'mono', align: 'right', color: '#c9c3dd', shadow: false });

      // ⌘S keycaps slam in
      const kin = prog(t, 2.02, 0.2), kout = prog(t, 2.75, 0.2);
      if (kin > 0 && kout < 1) {
        const ks = lerp(2.2, 1, ease.outBack(kin)) * (1 - ease.inCubic(kout));
        const press = pulse(t, 2.22, 0.2);
        ctx.save(); ctx.translate(495, 760); ctx.scale(ks, ks); ctx.rotate(-0.04); ctx.translate(-495, -760);
        keycap(ctx, 410, 760, 150, '⌘', press);
        keycap(ctx, 590, 760, 150, 'S', press);
        ctx.restore();
        P.burstLines(ctx, 495, 740, 170, prog(t, 2.24, 0.35), C.yellow, 12, 9);
      }
      ctx.restore(); // camera

      // ---- sparkle payoff
      if (t >= SPARK && t < SPARK + 0.2) P.flash(ctx, 0.35 * (1 - prog(t, SPARK, 0.2)));
      const spOut = 1 - prog(t, COLLAPSE - 0.2, 0.3);
      [[110, 330, 46], [880, 350, 38], [860, 1180, 52], [120, 1150, 34], [520, 305, 30], [950, 760, 44], [60, 760, 40]].forEach(([x, y, r], i) => {
        const on = ease.outBack(prog(t, SPARK + i * 0.07, 0.3)) * spOut;
        if (on <= 0.01) return;
        const tw = 0.6 + 0.4 * Math.sin((t - SPARK) * 5 + i * 1.7);
        P.star(ctx, x, y, r * on * tw, i % 2 ? C.yellow : '#fff', { points: 4, inner: 0.28, rot: (t - SPARK) * 0.6 + i, shadow: { blur: 8, dy: 3, alpha: 0.25 } });
      });
      const tp = ease.outBack(prog(t, SPARK + 0.2, 0.45)) * spOut;
      if (tp > 0.01) P.title(ctx, 'prettified ✨', 610, 1305 + Math.sin(t * 3) * 6, { size: 96, color: C.mint, rot: -0.04, pop: tp });

      // ---- Clawd: horrified, then healed
      const mood = t < 2.05 ? 'dead' : t < SPARK ? 'wow' : t < COLLAPSE ? 'happy' : t < COLLAPSE + 0.35 ? 'sad' : 'dead';
      const hop = pulse(t, SPARK, 0.4) * 60;
      P.claude(ctx, 170, 1320 - hop + Math.sin(t * 2) * 4, 95, { t, mood, squash: hop > 5 ? -0.15 : 0, blink: pulse(t, 6.6, 0.15) });
      if (t >= SPARK + 0.4 && t < COLLAPSE) {
        for (let h = 0; h < 2; h++) {
          const hp = ((t - SPARK - 0.4) * 0.7 + h * 0.5) % 1;
          ctx.save(); ctx.globalAlpha = (1 - hp) * spOut;
          P.heart(ctx, 230 + h * 40 + Math.sin(hp * 8 + h) * 14, 1210 - hp * 160, 24, C.rose, { shadow: false });
          ctx.restore();
        }
      }
      if (t > 0.7 && t < 2.05) P.bubble(ctx, 'my eyes 😵', 520, 1290, 260, 1300, { size: 52, pop: ease.outBack(prog(t, 0.7, 0.3)) });

      P.sticker(ctx, 'format on save hits different', 70, 1525, { pop: ease.outBack(prog(t, 0.3, 0.4)) });

      // ---- sounds
      for (let i = 0; i < 26; i++) if (env.at(0.02 + i * 0.078)) SFX.type({ vol: 0.1 });
      if (env.at(2.02)) SFX.swoosh({ vol: 0.08 });
      if (env.at(2.24)) { SFX.click({ vol: 0.3 }); SFX.thud({ vol: 0.22 }); }
      if (env.at(2.32)) SFX.whoosh({ vol: 0.1, dur: 0.3 });
      if (env.at(SPARK)) {
        SFX.chime({ vol: 0.13 });
        for (let i = 0; i < 6; i++) SFX.tone(2000 + i * 330, 0.25, { vol: 0.03, when: 0.1 + i * 0.05 });
      }
      if (env.at(COLLAPSE)) SFX.swoosh({ vol: 0.12, dur: 0.4 });
      if (env.at(COLLAPSE + 0.35)) SFX.pop({ f: 300, vol: 0.08 });
    },
  });
})();
