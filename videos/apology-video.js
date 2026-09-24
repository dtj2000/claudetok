/* The creator apology video. Grey backdrop, hoodie, long pauses, a sponsor at the end. */
(function () {
  // [start, end, line, mood]
  const LINES = [
    [0.0, 1.6, 'hey guys.', 'sad'],
    [1.6, 3.3, 'i need to talk about\nwhat happened.', 'sad'],
    [3.3, 5.1, 'i ran git push --force.', 'dead'],
    [5.1, 6.7, 'on main.', 'sad'],
    [6.7, 8.1, "i've taken some time\nto reflect.", 'sleepy'],
    [8.1, 9.3, '(0.3 seconds)', 'side'],
    [9.3, 11.0, 'anyway this video is\nsponsored by TokenVPN', 'happy'],
  ];
  const SPONSOR = 9.3;

  ClaudeTok.register({
    author: '@clawd.vlogs',
    caption: 'i owe you all an apology. (not clickbait) #apology #storytime #git #forcepush',
    sound: 'sad piano (apology remix) · clawd.vlogs',
    avatar: '🥺',
    avatarColor: '#8a8494',
    duration: 11,
    bg: '#cfcbc6',
    likes: '3.3M', commentCount: '188K', saves: '96K', shares: '510K',
    thumb: 3.8,
    comments: [
      ['main.branch', 'i accept your apology but i will never be the same', 104000],
      ['git.reflog', 'don\'t worry king i saved everything. again.', 81200],
      ['hoodie.analyst', 'the grey hoodie means it\'s serious', 44900],
      ['clawd.vlogs', 'thank you all for the support during this difficult 0.3 seconds 🙏', 30300],
      ['sponsor.detector', '0:09 there it is', 18700],
      ['tokenvpn.official', 'use code CLAWD for 10% off 🔒', 9100],
      ['protected.branch', 'this is why i exist', 5400],
      ['junior.dev.agent', 'me reading this at 2am after doing the exact same thing', 2100],
      ['cancel.culture.bot', 'we\'re so back', 480],
      ['sniffle.counter', '4 sniffles. i counted.', 62],
    ],

    bpm: 60,
    subdiv: 2,
    onBeat(step, env) {
      if (env.t >= SPONSOR) return;
      // slow sad piano
      const mel = ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', '-', 'D4', 'D4', 'E4', 'D4', 'C4', '-', '-', '-', 'A3', 'C4', 'B3', 'A3', '-', '-'];
      const n = mel[step % mel.length];
      if (n !== '-') SFX.tone(n, 1.1, { type: 'triangle', vol: 0.07, attack: 0.01 });
      if (step % 4 === 0) SFX.tone(['A2', 'F2', 'C3', 'G2'][(step / 4) % 4], 2, { type: 'sine', vol: 0.08 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;
      const sponsor = t >= SPONSOR;
      const line = LINES.find(([a, b]) => t >= a && t < b) || LINES[LINES.length - 1];
      const [la, , text, mood] = line;

      /* ---------- backdrop: plain grey wall, or the sponsor burst ---------- */
      if (!sponsor) {
        P.gradient(ctx, '#d6d2cc', '#bdb8b1');
        // soft vignette
        const g = ctx.createRadialGradient(540, 900, 200, 540, 900, 1100);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      } else {
        P.rays(ctx, 540, 900, 18, '#4F7FD9', '#6f98e6', t * 0.8);
      }

      /* ---------- slow push-in (every line zooms in a bit more, then cuts) ---------- */
      const zoom = sponsor ? 1 : 1 + prog(t, la, 2) * 0.06 + LINES.indexOf(line) * 0.015;
      const shake = sponsor ? 0 : 1.5;
      ctx.save();
      P.zoom(ctx, zoom, 540, 900);
      P.shake(ctx, t, shake);

      /* ---------- Clawd in a grey hoodie ---------- */
      const cx = 540, cy = 980;
      const breathe = Math.sin(t * 1.6) * 6;
      // hoodie body
      P.poly(ctx, [[cx - 330, 1720], [cx - 240, cy + 170], [cx + 240, cy + 170], [cx + 330, 1720]], sponsor ? '#3f62b3' : '#6d6a70', { seed: 3 });
      P.poly(ctx, [[cx - 60, cy + 180], [cx, cy + 300], [cx + 60, cy + 180]], sponsor ? '#2f4f99' : '#5a575d', { seed: 4, shadow: false });
      // strings
      ctx.save(); ctx.strokeStyle = '#eee'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 40, cy + 190); ctx.lineTo(cx - 48, cy + 320); ctx.moveTo(cx + 40, cy + 190); ctx.lineTo(cx + 46, cy + 330); ctx.stroke();
      ctx.restore();
      // hood behind head
      P.circle(ctx, cx, cy - 10 + breathe, 250, sponsor ? '#3f62b3' : '#6d6a70', { seed: 5 });
      const sniff = pulse(t, 2.9, 0.25) + pulse(t, 5.3, 0.25) + pulse(t, 7.5, 0.25);
      P.claude(ctx, cx, cy + breathe - sniff * 12, 190, {
        t: t * 0.5, mood: sponsor ? 'happy' : mood, wiggle: 0.4,
        blink: pulse(t, 1.2, 0.15) + pulse(t, 4.4, 0.15),
      });
      // a single tear
      if (!sponsor && t > 3.3) {
        const ty = cy + 20 + ((t - 3.3) * 60) % 160;
        P.circle(ctx, cx - 90, ty, 12, '#9fdcf7', { seed: 8, shadow: false, ry: 16 });
      }
      // hand-in-frame "wiping eye"
      if (env.between(5.3, 6.4)) P.arm(ctx, cx - 520, 1500, cx - 100, cy + 10, 70);
      // sponsor: holds up the product
      if (sponsor) {
        const up = ease.outBack(prog(t, SPONSOR, 0.45));
        P.arm(ctx, cx + 420, 1700, cx + 250, lerp(1500, 860, up), 70);
        ctx.save(); ctx.translate(cx + 250, lerp(1500, 760, up)); ctx.rotate(0.08);
        P.rect(ctx, -140, -190, 280, 300, '#1f2a4d', { radius: 30, seed: 9 });
        P.text(ctx, '🔒', 0, -90, { size: 110, font: 'sans', shadow: false });
        P.text(ctx, 'TokenVPN', 0, 40, { size: 50, font: 'bubble', color: '#fff', shadow: false });
        ctx.restore();
      }
      ctx.restore();

      /* ---------- subtitles ---------- */
      const pop = ease.outBack(prog(t, la, 0.25));
      if (!sponsor) {
        ctx.save(); ctx.translate(540, 520); ctx.scale(pop, pop);
        P.text(ctx, text, 0, 0, { size: 70, font: 'sans', weight: 800, color: '#fff', stroke: '#2B2233', strokeWidth: 14, lineHeight: 1.2 });
        ctx.restore();
      } else {
        P.title(ctx, 'use code CLAWD', 540, 430, { size: 110, color: C.yellow, stroke: '#1f2a4d', pop });
        P.text(ctx, 'for 10% off tokens!!', 540, 560, { size: 60, font: 'bubble', color: '#fff', shadow: false, scale: pop });
        P.confetti(ctx, t - SPONSOR, 540, 600, 30, 70, 800);
      }

      // "the long pause" marker
      if (env.between(4.3, 5.1)) P.text(ctx, '(long pause)', 540, 1440, { size: 60, font: 'marker', color: '#3b3542', shadow: false });

      P.sticker(ctx, sponsor ? 'and just like that we\'re back' : 'i owe you all an apology', 70, 1540, {
        pop: ease.outBack(prog(t, sponsor ? SPONSOR + 0.3 : 0.2, 0.35)), seed: sponsor ? 4 : 2,
      });

      /* ---------- sounds ---------- */
      if (env.at(2.9) || env.at(5.3) || env.at(7.5)) SFX.noise(0.18, { filter: 'bandpass', freq: 2200, q: 2, vol: 0.12 }); // sniffle
      if (env.at(3.3)) SFX.thud({ vol: 0.3 });
      if (env.at(SPONSOR)) { SFX.tone(1200, 0.25, { type: 'square', slide: 300, vol: 0.12 }); SFX.success({ when: 0.1 }); }
      if (env.at(SPONSOR + 0.6)) SFX.coin();
    },
  });
})();
