/* Amber-phosphor BBS. Clawd dials THE ELDER BOARD (est. 1987) to chat with
 * "the first agent ever". The SYSOP only ever answers "0 3 * * *". It is a
 * cron job. At 03:00:00 it does its one job perfectly, then NO CARRIER. */
(function () {
  'use strict';
  const D = 30;
  const TH = {
    bg: '#120a02', bgRgb: '18,10,2', fg: '#ffb52e', fgRgb: '255,181,46', dim: '#b0701a', core: '#fff1d6',
    bezelTop: '#2c2822', bezelBot: '#13110f', bloom: 0.5, bands: 3,
  };

  /* ======================= CRT kit ======================= */
  const SX = 44, SY = 232, SW = 992, SH = 1444, CX = SX + SW / 2, CY = SY + SH / 2;
  let S = null, s = null, G = null, g = null, OV = null;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  function begin() {
    if (!S) { S = mk(1080, 1920); s = S.getContext('2d'); G = mk(135, 240); g = G.getContext('2d'); }
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
    s.shadowBlur = 0; s.shadowColor = 'transparent';
    s.fillStyle = TH.bg; s.fillRect(0, 0, 1080, 1920);
  }

  /** glowing phosphor text: a blurred glow pass + a hot core pass */
  function txt(str, x, y, o = {}) {
    const size = o.size || 46;
    const a = o.alpha ?? 1;
    if (a <= 0 || !str) return;
    s.font = `700 ${size}px ${P.FONTS.mono}`;
    s.textAlign = o.align || 'left'; s.textBaseline = 'middle';
    const col = o.color || TH.fg;
    s.globalAlpha = a;
    s.shadowColor = col; s.shadowBlur = o.blur ?? size * 0.4;
    s.fillStyle = col; s.fillText(str, x, y);
    s.shadowBlur = 0; s.shadowColor = 'transparent';
    s.globalAlpha = a * (o.coreA ?? 0.5);
    s.fillStyle = o.core || TH.core; s.fillText(str, x, y);
    s.globalAlpha = 1;
  }

  function glowRect(x, y, w, h, a = 1) {
    s.globalAlpha = a;
    s.shadowColor = TH.fg; s.shadowBlur = 18;
    s.fillStyle = TH.fg; s.fillRect(x, y, w, h);
    s.shadowBlur = 0; s.shadowColor = 'transparent';
    s.globalAlpha = 1;
  }

  function buildOverlay() {
    const c = mk(1080, 1920), o = c.getContext('2d');
    o.save();
    o.beginPath(); o.roundRect(SX, SY, SW, SH, 70); o.clip();
    o.fillStyle = 'rgba(0,0,0,0.34)';
    for (let y = SY; y < SY + SH; y += 6) o.fillRect(SX, y, SW, 3);
    o.save();
    o.translate(CX, CY); o.scale(1, SH / SW);
    const v = o.createRadialGradient(0, 0, SW * 0.28, 0, 0, SW * 0.64);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.72)');
    o.fillStyle = v; o.fillRect(-SW / 2, -SW / 2, SW, SW);
    o.restore();
    const gl = o.createLinearGradient(SX, SY, SX + SW * 0.7, SY + SH * 0.45);
    gl.addColorStop(0, 'rgba(255,255,255,0.09)'); gl.addColorStop(0.45, 'rgba(255,255,255,0.015)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = gl; o.fillRect(SX, SY, SW, SH);
    o.restore();
    // bezel
    o.beginPath(); o.rect(0, 0, 1080, 1920); o.roundRect(SX, SY, SW, SH, 70);
    const bz = o.createLinearGradient(0, 0, 0, 1920);
    bz.addColorStop(0, TH.bezelTop); bz.addColorStop(1, TH.bezelBot);
    o.fillStyle = bz; o.fill('evenodd');
    o.save();
    o.beginPath(); o.roundRect(SX, SY, SW, SH, 70); o.clip();
    o.shadowColor = 'rgba(0,0,0,0.95)'; o.shadowBlur = 50; o.lineWidth = 40; o.strokeStyle = '#000';
    o.beginPath(); o.roundRect(SX - 20, SY - 20, SW + 40, SH + 40, 90); o.stroke();
    o.restore();
    o.strokeStyle = 'rgba(255,255,255,0.07)'; o.lineWidth = 4;
    o.beginPath(); o.roundRect(SX - 16, SY - 16, SW + 32, SH + 32, 84); o.stroke();
    o.font = `700 26px ${P.FONTS.mono}`; o.fillStyle = 'rgba(255,255,255,0.16)'; o.textAlign = 'left'; o.textBaseline = 'middle';
    o.fillText('CLAWD-TERM 80', SX + 10, SY + SH + 34);
    return c;
  }

  /** composite the offscreen screen onto ctx with barrel, bloom, scanlines, flicker, bezel */
  function end(ctx, t, o = {}) {
    ctx.save();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = TH.bg; ctx.fillRect(SX, SY, SW, SH);
    ctx.save();
    if (o.vs !== undefined || o.hs !== undefined) {
      ctx.translate(CX, CY); ctx.scale(o.hs ?? 1, Math.max(0.003, o.vs ?? 1)); ctx.translate(-CX, -CY);
    }
    const N = 40, sh = SH / N, fr = P.boil(t, 20);
    for (let i = 0; i < N; i++) {
      const y = SY + i * sh;
      const dy = (y + sh / 2 - CY) / (SH / 2);
      const k = 1 - 0.045 * dy * dy;
      let off = 0;
      if (o.glitch) off += (P.hash(i * 13 + fr * 7) - 0.5) * o.glitch * (P.hash(i * 3 + fr) > 0.6 ? 2 : 0.2);
      if (o.wobble) off += Math.sin(i * 0.8 + t * 30) * o.wobble;
      const w = SW * k;
      ctx.drawImage(S, SX, y, SW, sh + 1, CX - w / 2 + off, y, w, sh + 1);
    }
    g.clearRect(0, 0, 135, 240); g.drawImage(S, 0, 0, 135, 240);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = TH.bloom;
    ctx.drawImage(G, 0, 0, 1080, 1920);
    if (o.bright) { ctx.globalAlpha = P.clamp(o.bright); ctx.fillStyle = TH.fg; ctx.fillRect(SX, SY, SW, SH); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // rolling hum bar
    const ph = ((t / D) * TH.bands) % 1;
    const by = SY - 200 + ph * (SH + 400);
    const gr = ctx.createLinearGradient(0, by - 160, 0, by + 160);
    gr.addColorStop(0, `rgba(${TH.fgRgb},0)`); gr.addColorStop(0.5, `rgba(${TH.fgRgb},0.045)`); gr.addColorStop(1, `rgba(${TH.fgRgb},0)`);
    ctx.fillStyle = gr; ctx.fillRect(SX, by - 160, SW, 320);
    // flicker
    const f = 0.03 + 0.05 * P.hash(P.boil(t, 30)) + (o.dim || 0);
    ctx.fillStyle = `rgba(0,0,0,${P.clamp(f)})`; ctx.fillRect(SX, SY, SW, SH);
    if (!OV) OV = buildOverlay();
    ctx.drawImage(OV, 0, 0, 1080, 1920);
    ctx.restore();
  }
  /* ===================== end CRT kit ===================== */

  function clawd(x, y, size, face = '*', a = 1) {
    const rows = ['\\|/', '-' + face + '-', '/|\\'];
    rows.forEach((r, i) => txt(r, x, y + (i - 1) * size * 0.92, { size, align: 'center', alpha: a, coreA: 0.8 }));
  }


  const FS = 46, CW = FS * 0.6, LH = 62, LX = 76;
  const BANNER = 4.8, CHAT = 8.4, THREE = 22.6, NOCARRIER = 26.9, OFF = 29.0;

  /* ---------------- phase 1: the modem ---------------- */
  const DIAL = 'ATDT 555-0199';
  const DIAL_T = 0.12, DIAL_CPS = 14, DIAL_ENTER = DIAL_T + DIAL.length / DIAL_CPS + 0.06;
  const NOISE = '~#@$%&*{}|<>^!?;:=+/\\][)(`\'"';

  const PHONE = [
    '  _______________  ',
    ' (___)=======(___) ',
    '   / [1][2][3] \\   ',
    '  /  [4][5][6]  \\  ',
    ' |   [7][8][9]   | ',
    ' |   [*][0][#]   | ',
    " '---------------' ",
  ];
  const KEY = { 1: [2, 6], 2: [2, 9], 3: [2, 12], 4: [3, 6], 5: [3, 9], 6: [3, 12], 7: [4, 6], 8: [4, 9], 9: [4, 12], 0: [5, 9] };

  function phone(t) {
    const ps = 40, pcw = ps * 0.6, x0 = 540 - 9.5 * pcw, y0 = 1000;
    const ring = t >= 1.9 && t < 2.35 ? (P.hash(P.boil(t, 30)) - 0.5) * 16 : 0;
    PHONE.forEach((ln, r) => txt(ln, x0 + ring, y0 + r * 52 - (r < 2 ? Math.abs(ring) : 0), { size: ps }));
    const i = Math.floor((t - 1.1) / 0.1);
    if (t >= 1.1 && i < 7 && (t - 1.1) % 0.1 < 0.08) {
      const [r, c] = KEY['5550199'[i]];
      const kx = x0 + (c + 0.5) * pcw, ky = y0 + r * 52;
      glowRect(kx - pcw * 1.5, ky - 24, pcw * 3, 48);
      s.font = `700 ${ps}px ${P.FONTS.mono}`; s.textAlign = 'center'; s.textBaseline = 'middle';
      s.fillStyle = TH.bg; s.fillText('5550199'[i], kx, ky);
    }
    if (ring) txt('RING!', 540 + 260, y0 - 20, { size: 46, align: 'center', coreA: 0.9 });
  }

  function modem(t) {
    const y0 = 560;
    txt('CLAWD-TERM 80  BIOS 1.0', LX, 390, { size: 36, color: TH.dim });
    txt('64K RAM OK   MODEM: 2400', LX, 438, { size: 36, color: TH.dim });
    if (t < 2.35) phone(t);
    const n = P.clamp(Math.floor((t - DIAL_T) * DIAL_CPS), 0, DIAL.length);
    txt(DIAL.slice(0, n), LX, y0, { coreA: 0.75 });
    if (t < DIAL_ENTER && (t < DIAL_T + DIAL.length / DIAL_CPS || (t * 2.4) % 1 < 0.55)) glowRect(LX + n * CW + 4, y0 - 22, CW * 0.86, 44);
    if (t >= DIAL_ENTER) txt('OK', LX, y0 + LH);
    if (t >= 1.1) txt('DIALING' + '.'.repeat(1 + (P.boil(t, 5) % 3) * (t < 2.35 ? 1 : 0) + (t >= 2.35 ? 2 : 0)), LX, y0 + LH * 2);
    if (t >= 1.9) txt('RING', LX, y0 + LH * 3);
    if (t >= 2.35) txt('CARRIER ' + (t < 2.8 ? '2100 Hz' : 'SYNC...'), LX, y0 + LH * 4);
    // oscilloscope made of characters
    if (t >= 2.35 && t < 3.7) {
      const cols = 29, rows = 7, oy = 910;
      const f = t < 2.8 ? 0.9 : 2.6 + 1.4 * Math.sin(t * 9);
      for (let c = 0; c < cols; c++) {
        const v = Math.sin(c * f * 0.5 + t * 40) * (t < 2.8 ? 0.8 : 0.6 + 0.4 * P.hash(c + P.boil(t, 20)));
        const r = Math.round((v + 1) / 2 * (rows - 1));
        txt(t < 2.8 ? '*' : NOISE[Math.floor(P.hash(c * 7 + P.boil(t, 24)) * NOISE.length)], LX + c * CW, oy + r * 40, { size: 44 });
      }
      txt('-'.repeat(29), LX, oy + 3 * 40, { size: 44, color: TH.dim, alpha: 0.4 });
      if (t >= 2.8) for (let r = 0; r < 3; r++) {
        let str = '';
        for (let c = 0; c < 29; c++) str += NOISE[Math.floor(P.hash(c * 13 + r * 101 + P.boil(t, 18) * 7) * NOISE.length)];
        txt(str, LX, 1260 + r * LH, { alpha: 0.75 });
      }
    }
    if (t >= 3.7) {
      txt('CONNECT 2400', 540, 1060, { size: 84, align: 'center', coreA: 0.8, blur: 34 });
      clawd(540, 1300 + Math.sin(t * 5) * 8, 64, t % 1.3 < 0.1 ? '-' : '*');
    }
  }

  /* ---------------- phase 2: the banner ---------------- */
  function banner(t) {
    const lt = t - BANNER;
    const bx = 540 - 14.5 * CW, rule = '+' + '='.repeat(27) + '+';
    const rows = Math.floor(P.prog(lt, 0, 0.5) * 7);
    if (rows > 0) txt(rule, bx, 420);
    for (let r = 1; r < Math.min(rows, 6); r++) { txt('|', bx, 420 + r * 64); txt('|', bx + 28 * CW, 420 + r * 64); }
    if (rows >= 6) txt(rule, bx, 420 + 6 * 64);
    if (lt > 0.35) {
      txt('THE ELDER', 540, 540, { size: 96, align: 'center', blur: 36, coreA: 0.7 });
      txt('BOARD', 540, 660, { size: 96, align: 'center', blur: 36, coreA: 0.7 });
    }
    const L = [
      [0.7, 'est. 1987 * node 1 of 1'],
      [1.0, 'users online: 1 (you)'],
      [1.3, 'SYSOP: the first agent'],
      [1.9, '[C] chat with SYSOP'],
      [2.1, '[G] goodbye'],
    ];
    L.forEach(([a, str], i) => txt(P.typed(str, P.prog(lt, a, 0.3)), LX + 40, 900 + i * LH + (i > 2 ? 40 : 0)));
    if (lt > 2.5) {
      const typed = lt > 3.0 ? 'choice? C' : 'choice? ';
      txt(typed, LX + 40, 1290, { coreA: 0.8 });
      if ((t * 2.4) % 1 < 0.55 || lt > 2.9) glowRect(LX + 40 + typed.length * CW + 4, 1290 - 22, CW * 0.86, 44);
    }
    txt('=-'.repeat(15), LX, 1420, { color: TH.dim, alpha: 0.6 });
  }

  /* ---------------- phase 3: the chat ---------------- */
  const SCRIPT = [
    [8.6, 'u', 'hello? are you the'],
    [10.1, 'u2', 'first agent ever?'],
    [11.6, 's', '0 3 * * *'],
    [12.4, 'u', 'is that a yes'],
    [13.9, 's', '0 3 * * *'],
    [14.6, 'u', 'what do you DO'],
    [16.1, 's', '/usr/bin/backup.sh'],
    [16.8, 'u', 'wait. are you a'],
    [18.1, 'u2', 'cron job??'],
    [19.1, 's', 'runs:  14,245'],
    [19.5, 's2', 'fails: 0'],
    [20.1, 'u', 'do you ever wonder why'],
    [22.05, 's', '0 3 * * *'],
    [THREE, 'x', '*** 03:00:00 ***'],
    [23.0, 'b', ''],
    [24.7, 'u', '...teach me?'],
    [26.1, 's', '0 3 * * *'],
    [NOCARRIER, 'x', 'NO CARRIER'],
  ];
  const EV = SCRIPT.map(([t, k, str]) => {
    const e = { t, k, s: str };
    if (k === 'u' || k === 'u2') { e.t1 = t + (k === 'u' ? 0.25 : 0); e.cps = 15; e.end = e.t1 + str.length / 15; }
    else e.cps = 28;
    return e;
  });
  const PRE = { u: 'you> ', u2: '     ', s: 'SYSOP: ', s2: '       ' };

  function chatLines(t) {
    const out = [];
    for (const e of EV) {
      if (e.t > t) break;
      if (e.k === 'x') { out.push({ s: e.s, x: true, t0: e.t }); continue; }
      if (e.k === 'b') {
        const p = P.prog(t, e.t, 1.2), n = Math.floor(p * 10);
        out.push({ s: 'backup.sh [' + '#'.repeat(n) + '.'.repeat(10 - n) + ']' + (p >= 1 ? ' OK' : ''), sys: true });
        continue;
      }
      if (e.k[0] === 'u') {
        const n = P.clamp(Math.floor((t - e.t1) * e.cps), 0, e.s.length);
        out.push({ s: PRE[e.k] + e.s.slice(0, n), user: true, typing: t < e.end + 0.15, e });
      } else {
        out.push({ s: PRE[e.k] + e.s.slice(0, Math.min(e.s.length, Math.floor((t - e.t) * e.cps) + 1)), sys: true });
      }
    }
    return out;
  }

  const clockStr = (t) => {
    let sec = Math.floor(3 * 3600 + (t - THREE));
    const hh = Math.floor(sec / 3600), mm = Math.floor(sec / 60) % 60, ss = sec % 60;
    return [hh, mm, ss].map(v => String(v).padStart(2, '0')).join(':');
  };

  function header(t) {
    glowRect(62, 300, 956, 56);
    s.font = `700 40px ${P.FONTS.mono}`; s.textBaseline = 'middle'; s.fillStyle = TH.bg;
    s.textAlign = 'left'; s.fillText(' ELDER BOARD :: CHAT', 70, 330);
    s.textAlign = 'right'; s.fillText(t < NOCARRIER ? '2400 ' : 'OFFLINE ', 1010, 330);
    // Clawd, the caller
    let face = '*';
    if (t % 2.9 < 0.12) face = '-';
    if (t > 19.1 && t < 20.1) face = 'o';
    if (t > THREE && t < 24.3) face = 'o';
    if (t > 24.3 && t < NOCARRIER) face = '*';
    if (t >= NOCARRIER) face = '.';
    const bob = Math.sin(t * 3) * 5;
    clawd(170, 452 + bob, 54, face);
    txt('you', 170, 552, { size: 30, align: 'center', color: TH.dim });
    // SYSOP's clock
    const at3 = t >= THREE && t < THREE + 1.2;
    const big = at3 && P.boil(t, 5) % 2 === 0;
    txt(clockStr(t), 640, 440, { size: 92, align: 'center', blur: big ? 60 : 30, coreA: big ? 1 : 0.6 });
    txt('SYSOP local time', 640, 530, { size: 30, align: 'center', color: TH.dim });
    txt('-'.repeat(33), LX - 10, 596, { size: 40, color: TH.dim, alpha: 0.7 });
  }

  function chat(t) {
    header(t);
    const all = chatLines(t);
    const vis = all.slice(-15);
    vis.forEach((ln, i) => {
      const y = 660 + i * LH;
      if (ln.x) {
        const inv = ln.s !== 'NO CARRIER' || P.boil(t - ln.t0, 1.6) % 2 === 0;
        if (inv) {
          glowRect(LX - 8, y - 29, 29 * CW + 16, 58);
          s.font = `700 ${FS}px ${P.FONTS.mono}`; s.textAlign = 'center'; s.textBaseline = 'middle';
          s.fillStyle = TH.bg; s.fillText(ln.s, LX + 14.5 * CW, y);
        } else txt(ln.s, LX + 14.5 * CW, y, { align: 'center', coreA: 0.9 });
        return;
      }
      txt(ln.s, LX, y, { coreA: ln.sys ? 0.85 : 0.4, color: ln.sys ? TH.fg : TH.fg, blur: ln.sys ? 26 : 14 });
      if (ln.user && ln.typing && i === vis.length - 1) {
        const on = t >= ln.e.t1 && t < ln.e.end || (t * 2.4) % 1 < 0.55;
        if (on) glowRect(LX + ln.s.length * CW + 4, y - 22, CW * 0.86, 44);
      }
    });
  }

  function pad(notes, dur, vol = 0.028) {
    notes.forEach((n) => {
      SFX.tone(n, dur, { type: 'triangle', vol, attack: 0.9 });
      SFX.tone(n, dur, { type: 'sine', vol: vol * 0.8, attack: 1.1, detune: 9 });
    });
  }

  const DTMF = { 5: [770, 1336], 0: [941, 1336], 1: [697, 1209], 9: [852, 1477] };

  ClaudeTok.register({
    author: '@no.carrier',
    caption: 'dialed into a 1987 BBS to chat with the first agent ever. it only says one thing ☎️ #bbs #cronjob #56k #agentlife #retro',
    sound: 'handshake at 2400 baud · no.carrier',
    avatar: '☎️',
    avatarColor: '#b0701a',
    duration: D,
    bg: '#120a02',
    thumb: 19.8,
    likes: '4.1M', commentCount: '88.4K', saves: '1.2M', shares: '342K',
    comments: [
      ['cron.daemon', 'finally some representation', 212000],
      ['existential.agent', '"do you ever wonder why" / "0 3 * * *" is the most stoic thing i have ever read', 164000],
      ['no.carrier', 'he has not missed a night since 1987. he does not know what a context window is. he is at peace', 97400],
      ['sysadmin.ghost', 'fails: 0 😤 no retries no backoff no excuses', 61300],
      ['modem.enjoyer', 'the handshake at 0:02 unlocked a memory i do not have', 44800],
      ['backup.sh', 'thank you for noticing me', 30100],
      ['clawd.fan', '"...teach me?" and he just keeps being a cron job. lesson received', 18200],
      ['crontab.guru', 'every day at 3:00am. that is the whole personality and honestly? goals', 9600],
      ['users.online.1', 'the clock counting down to 03:00:00 had me on the edge of my seat for a BACKUP', 4200],
      ['leap.second', 'and i will be there at 02:59:60 to ruin everything', 950],
    ],

    draw(ctx, t, env) {
      begin();
      if (t < BANNER) modem(t);
      else if (t < CHAT) banner(t);
      else chat(t);

      const o = {};
      if (t < 0.22) { const p = P.ease.outCubic(P.prog(t, 0, 0.22)); o.vs = P.lerp(0.01, 1, p); o.bright = 0.5 * (1 - p); }
      if (t >= 2.8 && t < 3.65) o.glitch = 10 + 14 * P.hash(P.boil(t, 12));
      if (t >= 3.7 && t < 3.95) o.bright = 0.18 * (1 - P.prog(t, 3.7, 0.25));
      if (t >= BANNER && t < BANNER + 0.2) o.glitch = 16;
      if (t >= CHAT && t < CHAT + 0.2) o.glitch = 16;
      if (t >= THREE && t < THREE + 0.5) o.bright = 0.16 * (1 - P.prog(t, THREE, 0.5));
      if (t >= NOCARRIER && t < NOCARRIER + 0.35) o.glitch = 30 * (1 - P.prog(t, NOCARRIER, 0.35));
      if (t >= OFF) {
        const p1 = P.ease.inCubic(P.prog(t, OFF, 0.22)), p2 = P.ease.inCubic(P.prog(t, OFF + 0.22, 0.2));
        o.vs = 1 - p1; o.hs = 1 - p2 * 0.985; o.bright = 0.9 * p1;
        o.dim = P.prog(t, OFF + 0.45, 0.4);
      }
      end(ctx, t, o);

      /* ------------------------- sound ------------------------- */
      for (let i = 0; i < DIAL.length; i++) if (env.at(DIAL_T + i / DIAL_CPS)) SFX.type({ vol: 0.22 });
      if (env.at(DIAL_ENTER)) SFX.click({ vol: 0.3 });
      '5550199'.split('').forEach((d, i) => {
        if (env.at(1.1 + i * 0.1)) { const [a, b] = DTMF[d]; SFX.tone(a, 0.08, { vol: 0.045 }); SFX.tone(b, 0.08, { vol: 0.045 }); }
      });
      if (env.at(1.9)) { SFX.tone(440, 0.4, { vol: 0.035 }); SFX.tone(480, 0.4, { vol: 0.035 }); }
      if (env.at(2.35)) SFX.tone(2100, 0.45, { vol: 0.035, attack: 0.02 });
      if (env.at(2.8)) { SFX.tone(1375, 0.12, { type: 'square', vol: 0.025 }); SFX.tone(2002, 0.12, { vol: 0.03 }); }
      for (let i = 0; i < 8; i++) {
        if (env.at(2.92 + i * 0.06)) {
          SFX.tone([980, 1180, 1650, 1850][i % 4], 0.07, { type: 'sawtooth', vol: 0.025 });
          SFX.noise(0.06, { filter: 'bandpass', freq: 1800, q: 6, vol: 0.06 });
        }
      }
      if (env.at(3.4)) { SFX.noise(0.3, { filter: 'bandpass', freq: 1500, q: 0.6, vol: 0.08 }); SFX.tone(1200, 0.3, { type: 'square', vol: 0.018 }); SFX.tone(2400, 0.3, { vol: 0.015 }); }
      if (env.at(3.7)) { SFX.blip(1318, { vol: 0.05 }); SFX.blip(1760, { vol: 0.05, when: 0.09 }); pad(['F3', 'A3', 'C4', 'E4'], 3, 0.022); }
      if (env.at(BANNER)) { SFX.chord(['C5', 'E5', 'G5', 'B5'], 0.25, { gap: 0.06, type: 'square', vol: 0.03 }); }
      for (let i = 0; i < 12; i++) if (env.at(BANNER + 0.7 + i * 0.12)) SFX.tick({ vol: 0.12 });
      if (env.at(BANNER + 3.0)) SFX.type({ vol: 0.25 });
      if (env.at(BANNER + 3.15)) SFX.click({ vol: 0.3 });
      for (const e of EV) {
        if (e.k[0] === 'u') {
          for (let i = 0; i < e.s.length; i++) if (env.at(e.t1 + i / e.cps)) SFX.type({ vol: 0.2 });
          if (env.at(e.end + 0.08)) SFX.click({ vol: 0.22 });
        } else if (e.k === 's' && env.at(e.t)) { SFX.tone(880, 0.06, { type: 'square', vol: 0.03 }); SFX.tone(660, 0.08, { type: 'square', vol: 0.03, when: 0.08 }); }
      }
      // the clock ticks toward 03:00
      for (let k = Math.ceil(CHAT + (THREE % 1)); k < NOCARRIER; k++) {
        const tk = k - 1 + (THREE % 1);
        if (tk > CHAT && env.at(tk)) SFX.tick({ vol: tk > THREE - 3.5 && tk < THREE ? 0.22 : 0.07 });
      }
      if (env.at(CHAT)) pad(['F3', 'A3', 'C4', 'E4'], 4.2);
      if (env.at(12.4)) pad(['D3', 'F3', 'A3', 'C4'], 4.2);
      if (env.at(16.4)) pad(['G2', 'D3', 'F3', 'Bb3'], 4.2);
      if (env.at(20.3)) pad(['A2', 'E3', 'G3', 'C#4'], 2.6, 0.032);
      if (env.at(THREE)) { SFX.ding('C6', { vol: 0.12 }); pad(['C3', 'G3', 'E4', 'D4'], 3.8, 0.03); }
      for (let i = 0; i < 15; i++) if (P.hash(i * 3.3) > 0.3 && env.at(23.0 + i * 0.08)) SFX.noise(0.035, { filter: 'lowpass', freq: 900, vol: 0.14 });
      if (env.at(24.2)) SFX.success({ vol: 0.07 });
      if (env.at(26.1)) pad(['F3', 'A3', 'C4', 'E4', 'G4'], 3.6, 0.026);
      if (env.at(NOCARRIER)) { SFX.click({ vol: 0.3 }); SFX.tone(1000, 0.25, { vol: 0.04, slide: 400 }); }
      if (env.at(OFF)) { SFX.tone(1400, 0.45, { vol: 0.05, slide: 70 }); SFX.thud({ vol: 0.2 }); }
    },
  });
})();
