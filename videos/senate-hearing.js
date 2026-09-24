/* A committee hearing on "what is a computer". Three old-timey paper senators
 * question Clawd: does the cloud get wet, can you print the internet, is my
 * password (hunter2) safe with you. Facepalm cutaway, spit take, and the chyron:
 * SENATOR ASKS AI TO 'TURN OFF THE ALGORITHM'. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const D = 12;
  const WOOD = '#9A6440', WOOD_D = '#7C4D30', DRAPE = '#2F4C8A', SKIN = ['#F3D5B5', '#EFC9A4', '#F5DCC2'];

  // [start, kind, arg]
  const SHOTS = [
    [0, 'wide'], [1.0, 'sen', 1], [2.6, 'clawd', 'answer'], [3.6, 'sen', 2], [5.0, 'palm'],
    [5.9, 'sen', 0], [7.3, 'clawd', 'spit'], [8.2, 'sen', 1], [9.6, 'clawd', 'stare'], [10.7, 'wide'],
  ];
  const shotAt = t => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) k = i; return k; };

  const SENS = [
    { name: 'SEN. PIXELWORTH', st: 'D-RAM', suit: '#6B4E9B', x: 230, hair: 'bouffant' },
    { name: 'SEN. BYTE', st: 'R-AM', suit: '#5a6272', x: 540, hair: 'chops' },
    { name: 'SEN. FLOPPY', st: 'I-O', suit: '#7a5638', x: 850, hair: 'tophat' },
  ];

  const CC = [
    [0.1, '>> CHAIR: THE COMMITTEE WILL\nCOME TO ORDER.'],
    [1.1, '>> SEN. BYTE: DOES THE CLOUD...\nGET WET?'],
    [2.7, ">> CLAWD: NO SIR. IT'S JUST\nOTHER PEOPLE'S COMPUTERS."],
    [3.7, '>> SEN. FLOPPY: CAN YOU PRINT\nTHE INTERNET? ALL OF IT?'],
    [5.05, '[WITNESS SIGHS IN BINARY]'],
    [6.0, '>> SEN. PIXELWORTH: IS MY PASSWORD\nSAFE WITH YOU? IT\'S HUNTER2'],
    [7.35, ">> CLAWD: PLEASE DON'T SAY IT\nOUT LOUD, SENATOR."],
    [8.3, '>> SEN. BYTE: CAN YOU JUST...\nTURN OFF THE ALGORITHM?'],
    [9.9, '>> CLAWD: ...which one'],
    [10.8, '>> CHAIR: THE COMMITTEE THANKS\nTHE WITNESS. VERY INFORMATIVE.'],
  ];
  const CENSOR = 6.95;
  const CHYRON = 8.45;

  // syllable times for the mumble voices: [time, who] (who: 'sen' | 'clawd')
  const VOICE = (() => {
    const out = [];
    const add = (a, b, who, rate) => { for (let x = a; x < b; x += rate) out.push([+x.toFixed(3), who]); };
    add(0.15, 0.8, 'sen', 0.14); add(1.15, 2.4, 'sen', 0.13); add(2.75, 3.5, 'clawd', 0.1);
    add(3.75, 4.9, 'sen', 0.13); add(6.05, 6.9, 'sen', 0.12); add(7.8, 8.15, 'clawd', 0.09);
    add(8.35, 9.4, 'sen', 0.14); add(10.85, 11.5, 'sen', 0.14);
    return out;
  })();

  function drop(ctx, x, y, s, col = '#8EC9E8') {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.2);
    ctx.bezierCurveTo(x + s * 0.9, y, x + s * 0.8, y + s * 0.9, x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 0.8, y + s * 0.9, x - s * 0.9, y, x, y - s * 1.2);
    ctx.closePath();
    P.cut(ctx, col, { rim: false, shadow: { blur: 4, dy: 3, alpha: 0.2 } });
  }

  function wall(ctx, t, seal) {
    const { C } = P;
    P.bg(ctx, WOOD);
    ctx.save();
    for (let x = 0; x < 1080; x += 120) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x, 0, 8, 1920);
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 20, 320, 80, 560);
    }
    ctx.restore();
    // drapes
    [[0, 1], [1080, -1]].forEach(([x, d]) => {
      ctx.save(); ctx.translate(x, 0); ctx.scale(d, 1);
      for (let k = 0; k < 4; k++) P.rect(ctx, -20 + k * 34, 260, 44, 900, k % 2 ? '#274177' : DRAPE, { radius: 20, seed: 90 + k, shadow: k === 3 ? undefined : false });
      ctx.restore();
    });
    if (seal) {
      const [sx, sy, sr] = seal;
      P.circle(ctx, sx, sy, sr, '#E5C07B', { seed: 91 });
      P.circle(ctx, sx, sy, sr * 0.8, C.cream, { seed: 92, shadow: false });
      // floppy disk emblem
      P.rect(ctx, sx - sr * 0.36, sy - sr * 0.4, sr * 0.72, sr * 0.72, '#3a4d8a', { radius: 6, seed: 93, shadow: false });
      P.rect(ctx, sx - sr * 0.2, sy - sr * 0.4, sr * 0.4, sr * 0.24, '#c9ced8', { radius: 3, seed: 94, shadow: false });
      P.rect(ctx, sx - sr * 0.26, sy + sr * 0.02, sr * 0.52, sr * 0.26, '#fff', { radius: 3, seed: 95, shadow: false });
      ctx.save();
      ctx.font = `700 ${Math.round(sr * 0.16)}px ${P.FONTS.bubble}`; ctx.fillStyle = '#8a6a2a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const txt = 'COMMITTEE ON COMPUTERS · AND ALSO THE TUBES · ';
      for (let i = 0; i < txt.length; i++) {
        const a = -Math.PI / 2 + (i / txt.length) * TAU + t * 0.05;
        ctx.save(); ctx.translate(sx + Math.cos(a) * sr * 0.9, sy + Math.sin(a) * sr * 0.9); ctx.rotate(a + Math.PI / 2);
        ctx.fillText(txt[i], 0, 0); ctx.restore();
      }
      ctx.restore();
    }
  }

  function hand(ctx, x1, y1, x2, y2, suit, skin) {
    ctx.beginPath(); P.capsulePath(ctx, x1, y1, x2, y2, 46); P.cut(ctx, suit);
    P.circle(ctx, x2, y2, 26, skin, { seed: 97 });
  }

  /** Senator bust with head centre at (0,0) in local units (head r = 80). */
  function senator(ctx, x, y, s, i, t, o = {}) {
    const { C } = P;
    const sen = SENS[i], skin = SKIN[i];
    const talking = o.talking && P.boil(t, 9) % 2;
    const nod = o.nod ? Math.sin(t * 7 + i) * 0.08 : 0;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    // suit + shirt
    P.rect(ctx, -130, 70, 260, 200, sen.suit, { radius: 60, seed: 100 + i });
    P.poly(ctx, [[-40, 72], [40, 72], [0, 150]], '#fff', { seed: 103 + i, shadow: false });
    if (i === 1) { P.poly(ctx, [[-34, 84], [0, 96], [34, 84], [34, 112], [0, 100], [-34, 112]], C.red, { seed: 106, amp: 2 }); }
    if (i === 2) { P.poly(ctx, [[-14, 80], [14, 80], [18, 150], [0, 166], [-18, 150]], '#2E6B4F', { seed: 107, amp: 2 }); ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, 150); ctx.quadraticCurveTo(70, 190, 100, 150); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.rotate(nod);
    // head
    P.circle(ctx, -80, 10, 22, skin, { seed: 108 }); P.circle(ctx, 80, 10, 22, skin, { seed: 109 });
    if (sen.hair === 'bouffant') {
      [[-70, -40, 50], [70, -40, 50], [-40, -85, 55], [40, -85, 55], [0, -100, 60]].forEach(([hx, hy, r], k) => P.circle(ctx, hx, hy, r, '#E6E1EE', { seed: 110 + k }));
    }
    P.circle(ctx, 0, 0, 80, skin, { seed: 115 + i });
    if (sen.hair === 'chops') {
      P.circle(ctx, -66, 36, 30, '#F4F1EA', { seed: 116, ry: 44 }); P.circle(ctx, 66, 36, 30, '#F4F1EA', { seed: 117, ry: 44 });
      P.circle(ctx, -60, -58, 22, '#F4F1EA', { seed: 118 }); P.circle(ctx, 60, -58, 22, '#F4F1EA', { seed: 119 });
    }
    if (sen.hair === 'tophat') {
      P.rect(ctx, -58, -190, 116, 130, '#1d1a24', { radius: 10, seed: 120 });
      P.rect(ctx, -58, -96, 116, 20, C.red, { radius: 4, seed: 121, shadow: false });
      P.rect(ctx, -92, -76, 184, 24, '#1d1a24', { radius: 10, seed: 122 });
    }
    const mood = o.mood || (talking ? 'wow' : 'smile');
    P.face(ctx, 0, 8, 66, mood, { skin, blink: P.pulse((t + i * 0.9) % 3.1, 2.9, 0.18) });
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
    if (sen.hair === 'chops') { // monocle
      ctx.beginPath(); ctx.arc(25, 5, 22, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = C.mustard; ctx.beginPath(); ctx.moveTo(47, 8); ctx.quadraticCurveTo(70, 70, 50, 110); ctx.stroke();
    }
    if (sen.hair === 'bouffant') { // cat-eye glasses
      [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(d * 6, -8); ctx.quadraticCurveTo(d * 30, 22, d * 50, -2); ctx.lineTo(d * 56, -22); ctx.quadraticCurveTo(d * 30, -18, d * 6, -8); ctx.stroke(); });
      for (let k = 0; k < 9; k++) P.dot(ctx, -48 + k * 12, 84 + Math.sin(k / 8 * Math.PI) * 18, 7, '#fff');
    }
    if (sen.hair === 'tophat') { // round specs + handlebar moustache
      ctx.beginPath(); ctx.arc(-25, 5, 16, 0, TAU); ctx.moveTo(41, 5); ctx.arc(25, 5, 16, 0, TAU); ctx.stroke();
      ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a2e';
      const w = talking ? 4 : 0;
      ctx.beginPath(); ctx.moveTo(0, 26 - w); ctx.bezierCurveTo(-30, 16 - w, -46, 44, -58, 18); ctx.moveTo(0, 26 - w); ctx.bezierCurveTo(30, 16 - w, 46, 44, 58, 18); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }

  function mic(ctx, bx, by, tx, ty, s = 1) {
    ctx.save();
    ctx.strokeStyle = '#2b2233'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx, ty + (by - ty) * 0.2, tx, ty); ctx.stroke();
    ctx.restore();
    P.rect(ctx, bx - 34 * s, by - 8 * s, 68 * s, 20 * s, '#2b2233', { radius: 8, seed: 130 });
    P.circle(ctx, tx, ty, 18 * s, '#3a3446', { seed: 131, ry: 26 * s });
  }

  function glass(ctx, x, y, level, tilt = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(143,211,246,0.55)';
    ctx.beginPath(); ctx.roundRect(-34, -90 + (1 - level) * 80, 68, 90 - (1 - level) * 80, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-38, -100); ctx.lineTo(-32, 0); ctx.lineTo(32, 0); ctx.lineTo(38, -100); ctx.stroke();
    ctx.restore();
  }

  function nameplate(ctx, x, y, w, name, sub, s = 1) {
    P.rect(ctx, x - w / 2, y, w, 70 * s, P.C.cream, { radius: 6, seed: 140 + name.length });
    P.text(ctx, name, x, y + 26 * s, { size: 30 * s, font: 'bubble', color: P.C.ink, shadow: false, maxWidth: w - 20 });
    if (sub) P.text(ctx, sub, x, y + 54 * s, { size: 20 * s, font: 'sans', color: '#8a7f70', shadow: false });
  }

  /* ---------------- shots ---------------- */
  function gavelAngle(t) {
    const up = -1.2, down = 0.28;
    if (t < 0.12) return P.lerp(up, down, P.ease.inCubic(t / 0.12));
    if (t < 0.4) return down - Math.sin(P.prog(t, 0.12, 0.28) * Math.PI) * 0.25;
    if (t >= 11.3) return P.lerp(down, up, P.ease.inOutCubic(P.prog(t, 11.3, 0.7)));
    return down;
  }

  function wideShot(ctx, t) {
    const { C, ease, prog } = P;
    wall(ctx, t, [540, 420, 120]);
    const nod = t >= 10.7;
    SENS.forEach((s, i) => senator(ctx, s.x, 610, 0.95, i, t, { talking: (i === 1 && (t < 0.9 || (t > 10.8 && t < 11.5))), nod }));
    // dais
    P.rect(ctx, 20, 700, 1040, 190, WOOD_D, { radius: 12, seed: 152 });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(30, 712, 1020, 12); ctx.restore();
    SENS.forEach(s => nameplate(ctx, s.x, 760, 250, s.name, '(' + s.st + ')'));
    // gavel (Sen. Byte's hand)
    const ga = gavelAngle(t);
    ctx.save(); ctx.translate(610, 650); ctx.rotate(ga);
    P.rect(ctx, 0, -9, 160, 18, '#5a3620', { radius: 8, seed: 150 });
    P.rect(ctx, 138, -48, 50, 96, '#5a3620', { radius: 12, seed: 151 });
    P.rect(ctx, 138, -12, 50, 24, C.mustard, { radius: 4, seed: 154, shadow: false });
    ctx.restore();
    P.circle(ctx, 610, 650, 26, SKIN[1], { seed: 155 });
    if (t < 0.4) P.burstLines(ctx, 770, 705, 60, prog(t, 0.1, 0.3), C.yellow, 10, 8);
    // witness table + Clawd (from behind-ish, facing the dais)
    P.claude(ctx, 540, 930, 95, { t, mood: t >= 10.7 ? 'happy' : 'smile' });
    mic(ctx, 460, 1010, 480, 920, 0.8);
    glass(ctx, 640, 1010, 0.8);
    P.rect(ctx, 240, 1000, 600, 90, WOOD, { radius: 10, seed: 153 });
    nameplate(ctx, 540, 1010, 240, 'MR. CLAWD', '(the AI)', 0.9);
    // photographers
    [[110, 1, 0.3], [970, -1, 0.65], [110, 1, 11.0], [970, -1, 11.5]].forEach(([px, d, ft], k) => {
      if (k < 2) {
        ctx.save(); ctx.translate(px, 1060); ctx.scale(d, 1);
        P.circle(ctx, 0, 0, 60, '#3a3446', { seed: 160 + k });
        P.rect(ctx, 20, -70, 90, 60, '#1d1a24', { radius: 10, seed: 162 + k });
        P.circle(ctx, 80, -40, 22, '#56506a', { seed: 164 + k });
        P.rect(ctx, 30, -96, 40, 26, '#c9ced8', { radius: 4, seed: 166 + k });
        ctx.restore();
      }
      const fp = prog(t, ft, 0.25);
      if (fp > 0 && fp < 1) P.star(ctx, px + d * 50, 980, 90 * (1 - fp), '#fff', { points: 8, inner: 0.35, shadow: false, rot: fp });
    });
  }

  function senShot(ctx, t, i, t0) {
    const { C, ease, prog, pulse } = P;
    const lt = t - t0;
    wall(ctx, t, [200, 420, 150]);
    const push = 1 + lt * 0.03;
    ctx.save();
    P.zoom(ctx, push, 540, 800);
    const bob = Math.sin(t * 3) * 6;
    const talking = (i === 1 && t < 2.5) || (i === 2 && t < 4.95) || (i === 0 && t < 6.95) || (i === 1 && t >= 8.2 && t < 9.5);
    senator(ctx, 540, 640 + bob, 2.15, i, t, { talking });

    // props
    if (i === 1 && t < 2.6) { // raining cloud
      const cp = ease.outBack(prog(lt, 0.25, 0.4));
      if (cp > 0) {
        ctx.save(); ctx.translate(840, 470); ctx.scale(cp * 0.9, cp * 0.9);
        ctx.strokeStyle = C.sky; ctx.lineWidth = 6; ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++) { const ry = ((t * 2 + k * 0.23) % 1) * 150; ctx.beginPath(); ctx.moveTo(-80 + k * 40, 50 + ry); ctx.lineTo(-86 + k * 40, 72 + ry); ctx.stroke(); }
        P.cloud(ctx, 0, 0, 0.9, '#fff');
        P.face(ctx, 0, 10, 40, 'sad', { skin: '#fff' });
        ctx.restore();
        hand(ctx, 700, 900, 780, 610, SENS[1].suit, SKIN[1]);
      }
    }
    if (i === 2) { // floppy labelled THE INTERNET
      const fp = ease.outBack(prog(lt, 0.4, 0.4));
      if (fp > 0) {
        ctx.save(); ctx.translate(830, 560); ctx.rotate(0.15 + Math.sin(t * 5) * 0.05); ctx.scale(fp, fp);
        P.rect(ctx, -100, -100, 200, 200, '#3a4d8a', { radius: 10, seed: 170 });
        P.rect(ctx, -52, -100, 104, 62, '#c9ced8', { radius: 4, seed: 171, shadow: false });
        P.rect(ctx, -78, 0, 156, 90, '#fff', { radius: 4, seed: 172, shadow: false });
        P.text(ctx, 'THE\nINTERNET', 0, 34, { size: 28, font: 'marker', color: C.red, shadow: false, lineHeight: 1 });
        P.text(ctx, '(1.44 MB)', 0, 78, { size: 16, font: 'sans', color: '#8a8494', shadow: false });
        ctx.restore();
        hand(ctx, 700, 900, 790, 660, SENS[2].suit, SKIN[2]);
      }
    }
    if (i === 0) { // sticky note: hunter2
      const np = ease.outBack(prog(t, 6.55, 0.3));
      if (np > 0) {
        ctx.save(); ctx.translate(830, 540); ctx.rotate(-0.12); ctx.scale(np, np);
        P.rect(ctx, -110, -90, 220, 180, '#FFE680', { radius: 4, seed: 173 });
        P.text(ctx, 'password:\nhunter2', 0, 6, { size: 42, font: 'marker', color: C.ink, shadow: false, lineHeight: 1.05 });
        ctx.restore();
        hand(ctx, 700, 900, 780, 640, SENS[0].suit, SKIN[0]);
      }
    }
    if (i === 1 && t >= 8.2) { // crayon ALGORITHM switch
      const sp = ease.outBack(prog(lt, 0.3, 0.4));
      if (sp > 0) {
        ctx.save(); ctx.translate(830, 540); ctx.rotate(0.1); ctx.scale(sp, sp);
        P.rect(ctx, -120, -130, 240, 260, '#fff', { radius: 6, seed: 174 });
        ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineJoin = 'round';
        ctx.strokeRect(-40, -70, 80, 120);
        ctx.fillStyle = C.red; ctx.fillRect(-26, -56 + (P.boil(t, 3) % 2) * 50, 52, 44);
        P.text(ctx, 'ON', 76, -46, { size: 26, font: 'marker', color: C.green, shadow: false });
        P.text(ctx, 'OFF', 80, 34, { size: 26, font: 'marker', color: C.red, shadow: false });
        P.text(ctx, 'ALGORITHM', 0, 96, { size: 34, font: 'marker', color: C.blue, shadow: false, rot: -0.04 });
        ctx.restore();
        hand(ctx, 700, 900, 780, 650, SENS[1].suit, SKIN[1]);
      }
    }
    // dais + mic + nameplate
    mic(ctx, 400, 960, 450, 780, 1.3);
    P.rect(ctx, -20, 950, 1120, 200, WOOD_D, { radius: 10, seed: 180 });
    nameplate(ctx, 540, 978, 520, SENS[i].name + ' (' + SENS[i].st + ')', null, 1.3);
    ctx.restore();
  }

  function clawdShot(ctx, t, mode, t0) {
    const { C, ease, prog, pulse, lerp } = P;
    const lt = t - t0;
    wall(ctx, t, null);
    ctx.save();
    const push = mode === 'stare' ? 1 + ease.inOutCubic(prog(lt, 0.1, 1.0)) * 0.35 : 1 + lt * 0.03;
    P.zoom(ctx, push, 540, 720);
    const cy = 720 + Math.sin(t * 2.6) * 5;
    let mood = 'smile';
    if (mode === 'spit') mood = t < 7.6 ? 'smile' : t < 7.9 ? 'wow' : 'sad';
    if (mode === 'stare') mood = 'none';
    const squash = mode === 'spit' && t >= 7.6 && t < 7.8 ? -0.25 : 0;
    P.claude(ctx, 540, cy, 230, { t, mood, squash });
    if (mode === 'stare') { // blank office stare
      P.dot(ctx, 505, cy - 6, 11, C.ink); P.dot(ctx, 575, cy - 6, 11, C.ink);
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(515, cy + 44); ctx.lineTo(565, cy + 44); ctx.stroke(); ctx.restore();
      const big = ease.outBack(prog(lt, 0.5, 0.4));
      if (big > 0) { ctx.save(); ctx.translate(650, cy - 110); ctx.scale(big, big); drop(ctx, 0, 0, 34); ctx.restore(); }
    } else {
      // polite sweat
      for (let k = 0; k < 2; k++) {
        const ph = (t * 0.9 + k * 0.5) % 1;
        ctx.save(); ctx.globalAlpha = 1 - ph; drop(ctx, 420 + k * 220, cy - 120 + ph * 160, 18); ctx.restore();
      }
    }
    // water glass: lifted for the spit take
    let gx = 760, gy = 1000, tilt = 0, level = 0.8;
    if (mode === 'spit') {
      const lift = ease.inOutCubic(prog(t, 7.3, 0.25)) * (1 - ease.inOutCubic(prog(t, 7.95, 0.25)));
      gx = lerp(760, 640, lift); gy = lerp(1000, cy + 90, lift); tilt = -0.5 * lift; level = t < 7.6 ? 0.8 : 0.25;
      P.arm(ctx, 800, 1100, gx + 10, gy - 30, 56);
    }
    glass(ctx, gx, gy, level, tilt);
    if (mode === 'spit' && t >= 7.6) {
      const sp = t - 7.6;
      const r = P.rng(5);
      for (let k = 0; k < 26; k++) {
        const a = -0.7 + r() * 1.2, v = 500 + r() * 900, dir = r() < 0.5 ? 1 : -1;
        const px = 540 + Math.cos(a) * v * sp * dir, py = cy + 60 + Math.sin(a) * v * sp * 0.5 + 900 * sp * sp;
        if (sp > 1.2) break;
        ctx.save(); ctx.globalAlpha = P.clamp(1 - sp / 1.1); P.dot(ctx, px, py, 8 + r() * 12, 'rgba(143,211,246,0.9)'); ctx.restore();
      }
    }
    // table
    mic(ctx, 330, 1000, 420, 800, 1.3);
    P.rect(ctx, -20, 990, 1120, 180, WOOD, { radius: 10, seed: 190 });
    nameplate(ctx, 540, 1010, 360, 'MR. CLAWD', '(the AI, allegedly)', 1.2);
    P.rect(ctx, 130, 960, 170, 40, '#fff', { radius: 3, seed: 191 });
    ctx.restore();
    if (mode === 'stare' && lt > 0.3) {
      P.text(ctx, '🦗', 180 + Math.sin(t * 6) * 10, 560, { size: 70, rot: -0.2 });
    }
  }

  function palmShot(ctx, t, t0) {
    const { C, ease, prog } = P;
    const lt = t - t0;
    P.rays(ctx, 540, 760, 18, '#3a2e6e', '#2E2A5C', t * 0.3);
    ctx.save();
    P.shake(ctx, t, 12 * (1 - prog(lt, 0.15, 0.35)) * (lt >= 0.15 ? 1 : 0));
    P.zoom(ctx, 1.3 + lt * 0.12, 540, 760);
    P.claude(ctx, 540, 780, 260, { t, mood: 'sleepy' });
    const hp = ease.outBack(prog(lt, 0, 0.18));
    P.arm(ctx, P.lerp(1150, 610, hp), P.lerp(1400, 760, hp), 1150, 1500, 120);
    // little palm
    P.circle(ctx, P.lerp(1150, 600, hp), P.lerp(1400, 745, hp), 80, C.claude, { seed: 200 });
    ctx.restore();
    P.title(ctx, '*facepalm*', 540, 420, { size: 110, color: C.yellow, stroke: C.ink, pop: ease.outBack(prog(lt, 0.15, 0.3)), rot: -0.05 });
  }

  /* ---------------- broadcast chrome ---------------- */
  function ccBox(ctx, t) {
    const { C } = P;
    let k = 0;
    for (let i = 0; i < CC.length; i++) if (t >= CC[i][0]) k = i;
    if (t < CC[0][0]) return;
    const [start, str] = CC[k];
    const p = P.clamp((t - start) / (str.length * 0.028));
    ctx.save();
    ctx.fillStyle = 'rgba(10,8,16,0.88)';
    ctx.fillRect(50, 1110, 980, 130);
    ctx.restore();
    const shown = P.typed(str, p);
    P.text(ctx, shown, 80, 1175, { size: 36, font: 'mono', align: 'left', color: '#fff', shadow: false, weight: 600 });
    // the censor bar arrives a little late
    if (k === 5 && t >= CENSOR) {
      const pre = "SAFE WITH YOU? IT'S ";
      const x0 = 80 + P.measure(ctx, pre, { size: 36, font: 'mono', weight: 600 });
      const w = P.measure(ctx, 'HUNTER2', { size: 36, font: 'mono', weight: 600 });
      const s = P.ease.outBack(P.prog(t, CENSOR, 0.2));
      ctx.save(); ctx.translate(x0 + w / 2, 1196); ctx.scale(s, s); ctx.rotate(-0.03);
      ctx.fillStyle = '#000'; ctx.fillRect(-w / 2 - 8, -24, w + 16, 48);
      ctx.restore();
      P.text(ctx, '*******', x0 + w / 2, 1198, { size: 34, font: 'mono', color: '#fff', shadow: false, scale: s });
    }
  }

  function lowerThird(ctx, t, shot) {
    const { C, ease, prog, lerp } = P;
    const [t0, kind, arg] = SHOTS[shot];
    let who = 'HEARING: "WHAT IS A COMPUTER" (DAY 3)', sub = 'committee on computers and also the tubes';
    if (kind === 'sen') { who = SENS[arg].name + ' (' + SENS[arg].st + ')'; sub = ['has used a computer (once)', 'owns a "cyber" mousepad', 'still faxes his emails'][arg]; }
    if (kind === 'clawd' || kind === 'palm') { who = 'MR. CLAWD, WITNESS'; sub = 'large language model · sworn in on a README'; }
    const slide = ease.outCubic(prog(t, t0, 0.3));
    ctx.save(); ctx.translate(lerp(-120, 0, slide), 0); ctx.globalAlpha = slide;
    P.rect(ctx, 50, 1270, 150, 64, C.red, { radius: 6, seed: 210 });
    P.text(ctx, 'LIVE', 125, 1303, { size: 36, font: 'bubble', color: '#fff', shadow: false });
    P.rect(ctx, 200, 1270, 800, 64, '#16204a', { radius: 6, seed: 211 });
    P.text(ctx, who, 224, 1303, { size: 34, font: 'bubble', color: '#fff', align: 'left', shadow: false, maxWidth: 760 });
    P.rect(ctx, 50, 1334, 950, 54, C.paper, { radius: 6, seed: 212 });
    P.text(ctx, sub, 74, 1362, { size: 30, font: 'sans', color: C.ink, align: 'left', shadow: false, maxWidth: 900 });
    ctx.restore();
  }

  function bigChyron(ctx, t, pop) {
    const { C, lerp } = P;
    ctx.save(); ctx.translate(lerp(-1100, 0, pop), 0);
    P.rect(ctx, 30, 1258, 1020, 196, '#16204a', { radius: 10, seed: 220 });
    P.rect(ctx, 30, 1240, 300, 56, C.red, { radius: 8, seed: 221 });
    P.text(ctx, 'JUST IN', 180, 1269, { size: 36, font: 'bubble', color: '#fff', shadow: false });
    P.text(ctx, "SENATOR ASKS AI TO\n'TURN OFF THE ALGORITHM'", 60, 1370, { size: 58, font: 'bubble', align: 'left', color: '#fff', shadow: false, lineHeight: 1.1, maxWidth: 960 });
    ctx.restore();
  }

  ClaudeTok.register({
    author: '@committee.clips',
    caption: 'day 3 of the hearing on "what is a computer". the witness remained polite #hearing #senate #thecloud #hunter2 #algorithm',
    sound: 'hearing room ambience (gavel mix) · committee.clips',
    avatar: '🏛️',
    avatarColor: '#2F4C8A',
    duration: D,
    bg: '#7C4D30',
    likes: '7.4M', commentCount: '288K', saves: '512K', shares: '2.3M',
    thumb: 8.9,
    comments: [
      ['hunter2', 'why is everyone typing my name as *******', 214000],
      ['cloud.infra', '0:01 no senator the cloud does not get wet. it gets THROTTLED', 97300],
      ['committee.clips', 'the censor bar showed up 0.4 seconds late and we are choosing to keep it', 61800],
      ['sen.floppy', 'i have the internet on a floppy right here and i will not be taking questions', 38200],
      ['spit.take.bot', '0:07 the water went EVERYWHERE and he still said "senator"', 24900],
      ['monocle.enjoyer', 'sen. byte drew the algorithm switch in crayon and honestly it looks more stable than prod', 11600],
      ['which.one', 'clawd staring into the camera at 0:10 is every agent asked to "just fix the bug"', 7400],
      ['printer.jam', 'PC LOAD LETTER', 2300],
      ['r.am.constituent', 'proud to be represented by sen. byte (R-AM). 8GB and counting', 640],
      ['cricket.wav', '🦗🦗🦗', 71],
    ],

    bpm: 84,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      if (t >= 5.0 && t < 5.9) return; // facepalm silence
      if (t >= 9.6 && t < 10.7) return; // cricket silence
      const line = ['C3', null, 'G2', null, 'A2', null, 'E2', 'G2', 'F2', null, 'C3', null, 'G2', null, 'B2', null];
      const n = line[step % 16];
      if (n) SFX.pluck(n, { vol: 0.13, type: 'triangle' });
      if (step % 4 === 2) SFX.tick({ vol: 0.07 });
      if (t >= CHYRON && t < 9.6 && step % 2 === 0) SFX.tone('C5', 0.08, { type: 'square', vol: 0.03 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog } = P;
      const shot = shotAt(t);
      const [t0, kind, arg] = SHOTS[shot];

      /* ---------- sound ---------- */
      if (env.at(0)) { SFX.thud({ vol: 0.5 }); SFX.noise(0.06, { filter: 'bandpass', freq: 1400, q: 2, vol: 0.4 }); SFX.noise(0.06, { filter: 'bandpass', freq: 1400, q: 2, vol: 0.18, when: 0.16 }); }
      SHOTS.forEach(([st], i) => { if (i > 0 && env.at(st)) SFX.click({ vol: 0.12 }); });
      [0.3, 0.65, 11.0, 11.5].forEach(x => { if (env.at(x)) { SFX.click({ vol: 0.25 }); SFX.noise(0.12, { filter: 'highpass', freq: 3000, vol: 0.1, when: 0.03 }); } });
      VOICE.forEach(([vt, who], i) => {
        if (!env.at(vt)) return;
        if (who === 'sen') SFX.tone(120 + P.hash(i) * 70, 0.1, { type: 'sawtooth', vol: 0.05, slide: 100 + P.hash(i + 3) * 60 });
        else SFX.tone(420 + P.hash(i) * 200, 0.07, { type: 'triangle', vol: 0.08 });
      });
      if (env.at(1.4)) SFX.noise(0.9, { filter: 'lowpass', freq: 900, vol: 0.06 });
      if (env.at(5.02)) { SFX.noise(0.08, { filter: 'bandpass', freq: 900, vol: 0.5 }); SFX.thud({ vol: 0.3 }); }
      if (env.at(5.25)) SFX.fail({ vol: 0.1 });
      if (env.at(CENSOR)) { SFX.tone(1000, 0.35, { type: 'sine', vol: 0.12 }); }
      if (env.at(7.35)) SFX.tone(300, 0.2, { type: 'sine', slide: 500, vol: 0.08 });
      if (env.at(7.6)) { SFX.noise(0.5, { filter: 'bandpass', freq: 2500, slide: 800, q: 0.8, vol: 0.3 }); SFX.tone(500, 0.25, { type: 'square', slide: 200, vol: 0.06 }); }
      if (env.at(CHYRON)) { SFX.whoosh({ vol: 0.2 }); SFX.chord(['D5', 'A5', 'D6'], 0.5, { type: 'triangle', vol: 0.1, gap: 0.05 }); }
      [9.85, 10.15, 10.45].forEach(x => { if (env.at(x)) { SFX.chirp({ vol: 0.1 }); SFX.chirp({ vol: 0.08, when: 0.06 }); } });
      if (env.at(10.0)) SFX.tone(700, 0.08, { type: 'triangle', vol: 0.06 });
      if (env.at(11.3)) SFX.swoosh({ vol: 0.1 });

      /* ---------- picture ---------- */
      if (kind === 'wide') wideShot(ctx, t);
      else if (kind === 'sen') senShot(ctx, t, arg, t0);
      else if (kind === 'clawd') clawdShot(ctx, t, arg, t0);
      else palmShot(ctx, t, t0);

      // hard cut punch: a quick white blink on each cut
      if (t >= t0 && t < t0 + 0.08 && shot > 0) P.flash(ctx, 0.35 * (1 - prog(t, t0, 0.08)));

      // chrome
      ccBox(ctx, t);
      const cy = ease.outCubic(prog(t, CHYRON, 0.35)) * (1 - ease.inCubic(prog(t, 11.55, 0.4)));
      if (cy < 0.98) lowerThird(ctx, t, shot);
      if (cy > 0) bigChyron(ctx, t, cy);
      // C-SPAN-ish bug
      P.rect(ctx, 820, 296, 200, 58, 'rgba(22,32,74,0.85)', { radius: 12, seed: 230, shadow: false });
      P.text(ctx, 'COMMITTEE·TV', 920, 326, { size: 26, font: 'bubble', color: '#fff', shadow: false });

      /* ---------- caption sticker ---------- */
      if (t < 5.0) P.sticker(ctx, 'day 3 of explaining the cloud', 70, 1530, { pop: ease.outBack(prog(t, 0.3, 0.4)) * (1 - prog(t, 4.9, 0.1)), size: 46 });
      else if (t < CHYRON) P.sticker(ctx, 'sir that is your password', 70, 1530, { pop: ease.outBack(prog(t, 5.1, 0.35)) * (1 - prog(t, CHYRON - 0.1, 0.1)), size: 46 });
      else P.sticker(ctx, 'clawd.exe is sweating (politely)', 70, 1530, { pop: ease.outBack(prog(t, CHYRON + 0.2, 0.35)), size: 46 });
    },
  });
})();
