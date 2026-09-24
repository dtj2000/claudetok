/* Cold Case Cache, ep. 47: the case of the missing semicolon.
 * Moody podcast desk, corkboard, red string. Suspects: the linter, the cat,
 * the intern. The "?" card pinned since the start was auto-format all along. */
(function () {
  const D = 12;
  const CW = 460, CH = 600, PIN_S = 0.36;
  const CENTER = [540, 830];
  const SLOT = { crime: [540, 650], linter: [215, 560], cat: [865, 560], intern: [230, 875], mystery: [850, 875] };
  // [id, appear, pin]
  const CARDS = [['crime', 1.7, 3.0], ['linter', 3.3, 4.6], ['cat', 4.9, 6.2], ['intern', 6.5, 7.8]];
  const STRING_SNAP = 8.1, FLIP = 8.5, BIG = 8.9, UNBIG = 10.4, DARK = 11.55;
  const INFO = {
    crime: ['EXHIBIT A', 'line 42. body never found.', 'time of death: on save'],
    linter: ['ESLINT  #4012', 'motive: none. DEMANDS semis.', 'alibi: yelling at unused vars'],
    cat: ['WHISKERS  #0000', 'seen on keyboard 3:06am', "alibi: 'mrrp'"],
    intern: ['INTERN (UNPAID)', 'pushed to main on a friday', "alibi: 'i only touched README'"],
    mystery: ['???', 'pinned here since the start', 'nobody asked about it'],
    fmt: ['FORMAT ON SAVE', 'config: { semi: false }', "motive: 'consistency'"],
  };

  /* ---------------- suspects ---------------- */
  function subject(ctx, id, t) {
    const { C } = P;
    if (id === 'linter') {
      const pts = [];
      for (let k = 0; k < 6; k++) { const a = k * P.TAU / 6 + Math.PI / 6; pts.push([Math.cos(a) * 120, -60 + Math.sin(a) * 120]); }
      P.poly(ctx, pts, '#4B32C3', { seed: 11, amp: 3 });
      P.poly(ctx, pts.map(([x, y]) => [x * 0.62, -60 + (y + 60) * 0.62]), '#8080F2', { seed: 12, amp: 2, shadow: false });
      P.face(ctx, 0, -56, 64, 'angry', { ink: '#fff', blush: false });
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) { const x = -110 + k * 13.75; k ? ctx.lineTo(x, 85 + (k % 2 ? -8 : 8)) : ctx.moveTo(x, 85); }
      ctx.stroke(); ctx.restore();
    } else if (id === 'cat') {
      P.poly(ctx, [[-100, -120], [-70, -210], [-20, -140]], '#8a8494', { seed: 13 });
      P.poly(ctx, [[100, -120], [70, -210], [20, -140]], '#8a8494', { seed: 14 });
      P.circle(ctx, 0, -60, 118, '#8a8494', { seed: 15, ry: 104 });
      P.poly(ctx, [[-78, -140], [-68, -185], [-38, -142]], C.pink, { seed: 16, shadow: false });
      P.poly(ctx, [[78, -140], [68, -185], [38, -142]], C.pink, { seed: 17, shadow: false });
      P.face(ctx, 0, -50, 78, 'side', { skin: '#8a8494' });
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath();
      [-1, 1].forEach(s => { for (let k = -1; k <= 1; k++) { ctx.moveTo(s * 50, -20 + k * 12); ctx.lineTo(s * 150, -30 + k * 22); } });
      ctx.stroke(); ctx.restore();
      // a keycap stuck to its paw
      P.circle(ctx, 60, 70, 40, '#8a8494', { seed: 18 });
      P.rect(ctx, 30, 30, 60, 50, C.paper, { radius: 8, seed: 19 });
      P.text(ctx, ';', 60, 52, { size: 40, font: 'mono', color: C.ink, shadow: false });
    } else if (id === 'intern') {
      P.rect(ctx, -110, 10, 220, 120, C.blue, { radius: 40, seed: 20 });
      P.circle(ctx, 0, -70, 92, '#E7B089', { seed: 21 });
      P.poly(ctx, [[-92, -90], [-60, -165], [40, -175], [95, -100], [40, -130], [-20, -120]], '#5a3a24', { seed: 22 });
      P.face(ctx, 0, -60, 64, 'wow', { skin: '#E7B089' });
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-40, 14); ctx.lineTo(0, 70); ctx.lineTo(40, 14); ctx.stroke(); ctx.restore();
      P.rect(ctx, -34, 66, 68, 50, '#fff', { radius: 6, seed: 23 });
      P.text(ctx, 'INTERN', 0, 91, { size: 14, font: 'mono', color: C.ink, shadow: false });
      const dp = (t * 1.3) % 1;
      ctx.save(); ctx.globalAlpha = 1 - dp;
      P.circle(ctx, 95, -110 + dp * 60, 12, C.sky, { shadow: false, ry: 16 });
      ctx.restore();
    } else if (id === 'fmt') {
      const bars = [[-100, 150, '#56B3B4'], [-70, 190, '#EA5E5E'], [-110, 130, '#F7BA3E'], [-60, 170, '#BF85BF'], [-90, 140, '#56B3B4']];
      bars.forEach(([x, w, c], k) => P.rect(ctx, x, -150 + k * 44, w, 30, c, { radius: 15, seed: 30 + k }));
      // shades + smirk
      P.rect(ctx, -80, -110, 70, 40, '#141018', { radius: 12, seed: 36 });
      P.rect(ctx, 10, -110, 70, 40, '#141018', { radius: 12, seed: 37 });
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-30, -20); ctx.quadraticCurveTo(10, -6, 44, -34); ctx.stroke(); ctx.restore();
      for (let k = 0; k < 4; k++) {
        const tw = Math.sin(t * 7 + k * 1.8);
        if (tw > 0) P.star(ctx, -150 + (k % 2) * 300, -170 + k * 70, 20 * tw, C.yellow, { shadow: false });
      }
    } else if (id === 'mystery') {
      P.circle(ctx, 0, -110, 80, '#221c2a', { seed: 40 });
      P.rect(ctx, -120, -30, 240, 160, '#221c2a', { radius: 60, seed: 41 });
      P.text(ctx, '?', 0, -70, { size: 150, font: 'bubble', color: '#fff', shadow: false });
    }
  }

  function card(ctx, id, x, y, s, rot, t, flip = 1) {
    const { C } = P;
    if (s <= 0.01) return;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * flip, s);
    P.rect(ctx, -CW / 2, -CH / 2, CW, CH, C.paper, { radius: 6, seed: id.length * 5 + 1, shadow: { blur: 16, dy: 12, alpha: 0.45 } });
    ctx.save();
    ctx.beginPath(); ctx.rect(-200, -270, 400, 380); ctx.clip();
    if (id === 'crime') {
      ctx.fillStyle = '#211d2e'; ctx.fillRect(-200, -270, 400, 380);
      P.text(ctx, '41', -180, -200, { size: 24, font: 'mono', color: '#6a6380', align: 'left', shadow: false });
      P.text(ctx, '42', -180, -120, { size: 24, font: 'mono', color: '#6a6380', align: 'left', shadow: false });
      P.text(ctx, '43', -180, -40, { size: 24, font: 'mono', color: '#6a6380', align: 'left', shadow: false });
      P.text(ctx, 'let a = b', -140, -200, { size: 30, font: 'mono', color: C.pink, align: 'left', shadow: false });
      P.text(ctx, 'return a + b', -140, -120, { size: 30, font: 'mono', color: C.mint, align: 'left', shadow: false });
      P.text(ctx, '}', -140, -40, { size: 30, font: 'mono', color: C.yellow, align: 'left', shadow: false });
      // chalk outline where the semicolon used to be
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([10, 7]);
      ctx.beginPath(); ctx.arc(115, -138, 12, 0, P.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(115, -112); ctx.quadraticCurveTo(126, -96, 106, -76); ctx.lineTo(110, -100); ctx.closePath(); ctx.stroke();
      ctx.restore();
      P.rect(ctx, 150, -170, 44, 34, C.yellow, { radius: 4, seed: 42 });
      P.text(ctx, '1', 172, -152, { size: 24, font: 'bubble', color: C.ink, shadow: false });
      ctx.save(); ctx.translate(0, 40); ctx.rotate(-0.28);
      ctx.fillStyle = C.yellow; ctx.fillRect(-300, -26, 600, 52);
      P.text(ctx, 'DO NOT CROSS · DO NOT CROSS', 0, 2, { size: 26, font: 'bubble', color: C.ink, shadow: false });
      ctx.restore();
    } else {
      ctx.fillStyle = id === 'fmt' ? '#c9e6e0' : '#a7abb4'; ctx.fillRect(-200, -270, 400, 380);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
      for (let k = 0; k < 9; k++) {
        const ly = -250 + k * 44;
        ctx.beginPath(); ctx.moveTo(-200, ly); ctx.lineTo(200, ly); ctx.stroke();
        if (k % 2 === 0) P.text(ctx, `${7 - k / 2}'`, 180, ly - 12, { size: 18, font: 'mono', color: '#fff', shadow: false });
      }
      subject(ctx, id, t);
    }
    ctx.restore();
    const [name, n1, n2] = INFO[id];
    P.rect(ctx, -170, 128, 340, 58, '#1a1620', { radius: 4, seed: 43, shadow: false });
    P.text(ctx, name, 0, 158, { size: 30, font: 'mono', color: '#fff', shadow: false, maxWidth: 320 });
    P.text(ctx, n1, 0, 222, { size: 30, font: 'marker', color: C.ink, shadow: false, maxWidth: 420 });
    P.text(ctx, n2, 0, 262, { size: 30, font: 'marker', color: C.red, shadow: false, maxWidth: 420 });
    ctx.restore();
  }

  /** Where a suspect card is: [x, y, scale, rot, presence (for the dim)] */
  function cardState(id, t0, t1, t) {
    const { ease, prog, lerp } = P;
    const slot = SLOT[id], r0 = (P.hash(t0) - 0.5) * 0.14;
    if (t < t0) return null;
    if (t < t1) {
      const p = ease.outBack(prog(t, t0, 0.35));
      return [CENTER[0], CENTER[1] + Math.sin(t * 2) * 8, p, (1 - p) * 0.5 + Math.sin(t * 1.5) * 0.02, prog(t, t0, 0.2)];
    }
    const q = ease.inOutCubic(prog(t, t1, 0.35));
    return [lerp(CENTER[0], slot[0], q), lerp(CENTER[1], slot[1], q), lerp(1, PIN_S, q), lerp(0, r0, q), 1 - q];
  }

  function stringLine(ctx, a, b, p, sag = 40) {
    if (p <= 0) return;
    const { lerp } = P;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
    ctx.save();
    ctx.strokeStyle = '#c21f32'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    P.shadow(ctx, 4, 4, 0.35);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]);
    const N = 20;
    for (let k = 1; k <= Math.round(N * p); k++) {
      const u = k / N;
      ctx.lineTo(lerp(lerp(a[0], mx, u), lerp(mx, b[0], u), u), lerp(lerp(a[1], my, u), lerp(my, b[1], u), u));
    }
    ctx.stroke();
    ctx.restore();
  }

  function tack(ctx, x, y) { P.circle(ctx, x, y, 13, P.C.red, { seed: 50, amp: 1 }); P.dot(ctx, x - 4, y - 4, 4, 'rgba(255,255,255,0.6)'); }

  /* ---------------- set ---------------- */
  function room(ctx, t) {
    const { C } = P;
    P.stripes(ctx, '#1f1a28', '#241e2e', 70);
    // corkboard
    P.rect(ctx, 50, 290, 980, 760, '#5a3d2b', { radius: 12, seed: 60 });
    P.rect(ctx, 72, 312, 936, 716, '#b98a5a', { radius: 6, seed: 61, shadow: false });
    const r = P.rng(62);
    ctx.fillStyle = 'rgba(90,55,30,0.35)';
    for (let k = 0; k < 160; k++) ctx.fillRect(80 + r() * 920, 320 + r() * 700, 4 + r() * 5, 3 + r() * 4);
    // background clutter on the board
    P.rect(ctx, 110, 950, 150, 60, C.yellow, { radius: 3, seed: 63 });
    P.text(ctx, 'who??', 185, 982, { size: 32, font: 'marker', color: C.ink, shadow: false, rot: -0.05 });
    P.rect(ctx, 400, 930, 190, 70, C.pink, { radius: 3, seed: 64 });
    P.text(ctx, 'git blame\nsays "me"', 495, 966, { size: 24, font: 'marker', color: C.ink, shadow: false, lineHeight: 1 });
    // title strip
    const title = 'EP. 47 — THE CASE OF THE MISSING SEMICOLON';
    ctx.save(); ctx.translate(540, 370); ctx.rotate(-0.015);
    P.rect(ctx, -440, -38, 880, 76, C.paper, { radius: 4, seed: 65 });
    P.text(ctx, P.typed(title, P.prog(t, 0.2, 1.3)), -415, 3, { size: 38, font: 'marker', color: C.ink, align: 'left', shadow: false, maxWidth: 840 });
    ctx.restore();
    tack(ctx, 110, 345); tack(ctx, 970, 345);
  }

  function desk(ctx, t, mood, lean) {
    const { C } = P;
    // host Clawd with headphones
    const x = 665, y = 1235 + lean * 20;
    P.claude(ctx, x - lean * 30, y, 125, { t, mood, blink: P.pulse(t % 4, 3.2, 0.18), rot: -lean * 0.12 });
    ctx.save();
    ctx.translate(x - lean * 30, y); ctx.rotate(-lean * 0.12);
    ctx.strokeStyle = '#2b2233'; ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -8, 118, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    P.rect(ctx, -148, -60, 46, 96, '#2b2233', { radius: 18, seed: 70 });
    P.rect(ctx, 102, -60, 46, 96, '#2b2233', { radius: 18, seed: 71 });
    P.rect(ctx, -138, -48, 18, 72, C.claudeDark, { radius: 8, seed: 72, shadow: false });
    ctx.restore();
    // desk
    P.rect(ctx, -20, 1370, 1120, 600, '#3a2a22', { radius: 10, seed: 73 });
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let k = 0; k < 5; k++) ctx.fillRect(0, 1420 + k * 44, 1080, 3);
    // case folder
    ctx.save(); ctx.translate(560, 1440); ctx.rotate(0.05);
    P.rect(ctx, -140, -40, 280, 90, '#d9b384', { radius: 6, seed: 74 });
    P.text(ctx, 'CASE #0x3B', 0, 6, { size: 32, font: 'mono', color: '#6b4a2a', shadow: false });
    ctx.restore();
    // mug + clock
    P.rect(ctx, 790, 1300, 84, 96, C.paper, { radius: 10, seed: 75 });
    P.text(ctx, '☕', 832, 1346, { size: 40, font: 'sans', shadow: false });
    P.rect(ctx, 40, 1300, 190, 80, '#141018', { radius: 10, seed: 76 });
    P.text(ctx, P.boil(t, 1) % 2 ? '3:07' : '3 07', 135, 1342, { size: 50, font: 'mono', color: '#ff4d5a', shadow: false });
    // mic stand + mic + pop filter
    P.arm(ctx, 330, 1390, 440, 1255, 18, '#56506a');
    ctx.save(); ctx.translate(445, 1250); ctx.rotate(-0.55);
    P.rect(ctx, -30, -95, 60, 130, '#3d3747', { radius: 30, seed: 77 });
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
    ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(-26, -80 + k * 14); ctx.lineTo(26, -80 + k * 14); } ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#56506a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(470, 1290); ctx.quadraticCurveTo(520, 1300, 545, 1250); ctx.stroke(); ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(555, 1175, 78, 0, P.TAU);
    ctx.fillStyle = 'rgba(20,16,26,0.45)'; ctx.fill();
    ctx.strokeStyle = '#141018'; ctx.lineWidth = 9; ctx.stroke();
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); for (let k = -80; k <= 80; k += 12) { ctx.moveTo(475 + k + 80, 1095); ctx.lineTo(475 + k + 80, 1255); ctx.moveTo(475, 1175 + k); ctx.lineTo(635, 1175 + k); } ctx.stroke();
    ctx.restore();
  }

  function lamp(ctx, t, light) {
    const { C } = P;
    // cone of light
    if (light > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22 * light;
      const g = ctx.createLinearGradient(0, 1080, 0, 1440);
      g.addColorStop(0, '#ffe7a8'); g.addColorStop(1, 'rgba(255,231,168,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(300, 1110); ctx.lineTo(400, 1080); ctx.lineTo(880, 1440); ctx.lineTo(220, 1440); ctx.closePath(); ctx.fill();
      ctx.restore();
      for (let k = 0; k < 12; k++) {
        const u = (t * 0.07 + P.hash(k)) % 1;
        const dx = 300 + P.hash(k + 4) * 420 + Math.sin(t + k) * 20, dy = 1120 + u * 300;
        ctx.save(); ctx.globalAlpha = 0.6 * light * Math.sin(u * Math.PI);
        P.dot(ctx, dx, dy, 3 + P.hash(k + 8) * 3, '#fff3cf');
        ctx.restore();
      }
    }
    P.circle(ctx, 140, 1390, 80, '#2b2233', { ry: 20, seed: 80 });
    P.arm(ctx, 140, 1385, 200, 1180, 16, '#2b2233');
    P.arm(ctx, 200, 1180, 320, 1085, 16, '#2b2233');
    P.poly(ctx, [[270, 1040], [390, 1020], [430, 1100], [280, 1150]], '#2f6a58', { seed: 81 });
    if (light > 0) P.circle(ctx, 360, 1115, 26, `rgba(255,236,170,${light})`, { shadow: false, seed: 82 });
  }

  ClaudeTok.register({
    author: '@cold.case.cache',
    caption: 'the case of the missing semicolon 🔍 part 1/3 (i have not slept) #truecrime #coldcase #javascript #semicolon #fyp',
    sound: 'ominous lofi for solving crimes · cold.case.cache',
    avatar: '🔍',
    avatarColor: '#6B4E9B',
    duration: D,
    bg: '#1f1a28',
    thumb: 9.3,
    likes: '2.8M', commentCount: '64.1K', saves: '903K', shares: '211K',
    comments: [
      ['prettier.bot', 'i was just making it consistent 😎', 88100],
      ['eslint.official', "i would NEVER. i have a rule that literally requires semicolons. check my alibi", 51700],
      ['whiskers.the.cat', 'mrrp', 120400],
      ['unpaid.intern', 'why am i always a suspect. i DID only touch the README', 19300],
      ['case.file.0x3b', 'did nobody notice the case number is 0x3B. that is literally ; in ascii 😭', 43800],
      ['detective.agent', '0:08 the "?" card was pinned the WHOLE time. rewatch it. it was right there', 36200],
      ['semi.colon', 'i am not missing. i am free.', 64000],
      ['asi.enjoyer', 'automatic semicolon insertion has entered the chat', 7900],
      ['cold.case.cache', 'next week: who deleted node_modules (it was also you)', 14500],
    ],

    bpm: 80,
    subdiv: 2,
    onBeat(step, env) {
      const t = env.t;
      const chords = [['A2', 'E3', 'G3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['D2', 'A2', 'C3', 'F3'], ['E2', 'B2', 'D3', 'G#3']];
      if (step % 8 === 0) SFX.chord(chords[(step / 8) % 4], 2.8, { type: 'triangle', vol: 0.03, gap: 0.03 });
      if (P.hash(step * 3.7) > 0.4) SFX.noise(0.02, { filter: 'highpass', freq: 3500, vol: 0.03 }); // vinyl crackle
      if (t < 0.3 || (t > STRING_SNAP && t < UNBIG) || t > DARK) return;
      const s = step % 16;
      if (s === 0 || s === 7 || s === 10) SFX.kick({ vol: 0.28 });
      if (s % 8 === 4) SFX.noise(0.12, { filter: 'lowpass', freq: 1800, vol: 0.08 });
      if (step % 2 === 1) SFX.hat({ vol: 0.018 });
      const mel = ['E5', null, null, 'C5', null, 'B4', null, null, 'A4', null, null, null, 'G#4', null, null, null];
      if (mel[s]) SFX.tone(mel[s], 0.6, { type: 'sine', vol: 0.035 });
    },

    draw(ctx, t, env) {
      const { C, ease, prog, lerp, pulse } = P;

      /* ---------- sound ---------- */
      const sting = () => { SFX.tone(48, 1.4, { type: 'sine', slide: 34, vol: 0.34 }); SFX.tone(96, 1.0, { type: 'sawtooth', slide: 70, vol: 0.06 }); SFX.noise(0.5, { filter: 'lowpass', freq: 260, vol: 0.2 }); };
      if (env.at(0.05)) { SFX.noise(0.08, { filter: 'bandpass', freq: 3000, vol: 0.12 }); SFX.tone(60, 0.3, { type: 'square', vol: 0.03 }); }
      if (env.at(0.22)) SFX.click({ vol: 0.2 });
      for (let k = 0; k < 10; k++) if (env.at(0.25 + k * 0.13)) SFX.type({ vol: 0.12 });
      CARDS.forEach(([, a, b]) => {
        if (env.at(a)) sting();
        if (env.at(a + 0.05)) SFX.swoosh({ vol: 0.08 });
        if (env.at(b + 0.33)) SFX.thud({ vol: 0.25 });
      });
      if (env.at(4.95)) SFX.meow({ vol: 0.1 });
      if (env.at(STRING_SNAP)) { SFX.riser(0.8, { vol: 0.12 }); [0, 0.08, 0.16, 0.24].forEach(w => SFX.pluck('A2', { vol: 0.12, when: w })); }
      if (env.at(FLIP)) SFX.swoosh({ vol: 0.14 });
      if (env.at(BIG)) { sting(); SFX.drop({ vol: 0.22 }); SFX.chord(['C3', 'F#3', 'B3'], 1.2, { type: 'sawtooth', vol: 0.04 }); }
      if (env.at(UNBIG + 0.3)) SFX.thud({ vol: 0.25 });
      if (env.at(10.75)) SFX.pop({ vol: 0.1 });
      if (env.at(DARK)) SFX.click({ vol: 0.25 });

      /* ---------- light ---------- */
      let light = 1;
      if (t < 0.35) light = [0, 1, 0, 0, 1, 0.4, 1][P.boil(t, 20)] ?? 1;
      if (t >= DARK) light = 1 - prog(t, DARK, 0.12);

      /* ---------- camera ---------- */
      ctx.save();
      const push = 1 + 0.04 * ease.inOutSine(prog(t, 0, 1.7)) + 0.06 * ease.outCubic(prog(t, STRING_SNAP, 0.4)) * (1 - ease.inOutCubic(prog(t, UNBIG, 0.6)));
      P.zoom(ctx, push, 540, 900);
      if (t >= BIG) P.shake(ctx, t, 14 * (1 - prog(t, BIG, 0.5)));
      if (t >= STRING_SNAP && t < STRING_SNAP + 0.4) P.shake(ctx, t, 5);

      room(ctx, t);

      // strings: crime scene → each suspect, then all of them re-route to the "?" card
      const snap = ease.outBack(prog(t, STRING_SNAP, 0.4));
      const crimeT = SLOT.crime, mys = SLOT.mystery;
      const target = [lerp(crimeT[0], mys[0], snap), lerp(crimeT[1] - 80, mys[1] - 80, snap)];
      ['linter', 'cat', 'intern'].forEach((id, i) => {
        const pin = CARDS[i + 1][2];
        const p = prog(t, pin + 0.35, 0.3);
        stringLine(ctx, [SLOT[id][0], SLOT[id][1] - 80], p >= 1 ? target : [crimeT[0], crimeT[1] - 80], p, 50 - snap * 20);
      });
      stringLine(ctx, [crimeT[0], crimeT[1] - 80], [mys[0], mys[1] - 80], prog(t, STRING_SNAP + 0.1, 0.3), 60);

      // mystery card, pinned since the start; flips at the twist
      const fp = prog(t, FLIP, 0.35);
      const flipScale = Math.abs(Math.cos(fp * Math.PI));
      const face = fp > 0.5 ? 'fmt' : 'mystery';
      let mx = mys[0], my = mys[1], ms = PIN_S, mr = 0.06, dim = 0;
      if (t >= BIG) {
        const up = ease.outBack(prog(t, BIG, 0.35)), down = ease.inOutCubic(prog(t, UNBIG, 0.35));
        const k = up * (1 - down);
        mx = lerp(mys[0], CENTER[0], k); my = lerp(mys[1], CENTER[1] - 40, k); ms = lerp(PIN_S, 1.05, k); mr = lerp(0.06, -0.04, k);
        dim = P.clamp(k) * 0.6;
      }

      // pinned + presented suspects
      const states = CARDS.map(([id, a, b]) => [id, cardState(id, a, b, t)]);
      states.forEach(([id, s]) => {
        if (s && s[4] <= 0.001) { card(ctx, id, s[0], s[1], s[2], s[3], t); tack(ctx, s[0], s[1] - CH * s[2] / 2 + 14); }
      });
      if (t < BIG) { card(ctx, face, mx, my, ms, mr, t, flipScale); tack(ctx, mx, my - CH * ms / 2 + 14); }

      /* ---------- the host ---------- */
      const presenting = states.find(([, s]) => s && s[4] > 0.001);
      let mood = 'smile';
      if (t < 1.7) mood = t > 0.4 && t < 1.6 ? (P.boil(t, 7) % 2 ? 'smile' : 'wow') : 'smile';
      else if (presenting) mood = presenting[0] === 'cat' ? 'side' : 'sus';
      else if (t >= STRING_SNAP && t < BIG) mood = 'side';
      else if (t >= BIG && t < UNBIG) mood = 'wow';
      else if (t >= UNBIG) mood = t < 11.3 ? (P.boil(t, 7) % 2 ? 'smile' : 'wow') : 'wink';
      const lean = t < 1.7 ? pulse(t, 0.3, 1.4) : t > 10.6 ? pulse(t, 10.6, 1.0) : 0;
      lamp(ctx, t, light);
      desk(ctx, t, mood, lean);

      // presented card on top with dim
      if (presenting) dim = Math.max(dim, presenting[1][4] * 0.6);
      if (dim > 0) { ctx.save(); ctx.globalAlpha = dim; ctx.fillStyle = '#0c0910'; ctx.fillRect(-100, -100, 1300, 2200); ctx.restore(); }
      if (presenting) {
        const [id, s] = presenting;
        card(ctx, id, s[0], s[1], s[2], s[3], t);
        const lab = ['', 'SUSPECT #1', 'SUSPECT #2', 'SUSPECT #3'][CARDS.findIndex(c => c[0] === id)];
        if (lab) P.title(ctx, lab, 540, 470, { size: 80, color: C.red, stroke: C.paper, rot: -0.04, pop: ease.outBack(prog(t, CARDS.find(c => c[0] === id)[1] + 0.15, 0.3)) * P.clamp(s[4] * 3) });
        else P.title(ctx, 'THE SCENE', 540, 470, { size: 80, color: C.yellow, stroke: C.ink, rot: -0.04, pop: ease.outBack(prog(t, 1.85, 0.3)) * P.clamp(s[4] * 3) });
      }
      if (t >= BIG) {
        card(ctx, 'fmt', mx, my, ms, mr, t);
        if (ms < 0.5) tack(ctx, mx, my - CH * ms / 2 + 14);
        const tp = ease.outBack(prog(t, BIG + 0.15, 0.35)) * (1 - ease.inCubic(prog(t, UNBIG - 0.1, 0.25)));
        P.title(ctx, 'IT WAS AUTO-FORMAT', 540, 1210, { size: 84, color: C.yellow, stroke: C.red, pop: tp, rot: -0.04 });
        P.title(ctx, 'ALL ALONG', 540, 1320, { size: 96, color: '#fff', stroke: C.red, pop: ease.outBack(prog(t, BIG + 0.45, 0.35)) * (1 - ease.inCubic(prog(t, UNBIG - 0.1, 0.25))), rot: 0.03 });
      }

      // host lines
      const bp = (a, b) => (t < a || t >= b ? 0 : ease.outBack(prog(t, a, 0.25)) * (1 - prog(t, b - 0.12, 0.12)));
      P.bubble(ctx, 'it was 3:07am.\nthe build was green.', 640, 800, 660, 1100, { size: 50, pop: bp(0.4, 1.65), seed: 90, bg: C.paper });
      P.bubble(ctx, 'wait. the strings...', 540, 820, 640, 1100, { size: 52, pop: bp(STRING_SNAP + 0.1, BIG - 0.05), seed: 91, bg: C.paper });
      P.bubble(ctx, "format on save.\nit's always format on save.", 580, 820, 660, 1100, { size: 48, pop: bp(10.75, DARK), seed: 92, bg: C.paper });
      ctx.restore(); // camera

      // vignette
      ctx.save();
      const vg = ctx.createRadialGradient(540, 1000, 300, 540, 1000, 1150);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();

      // caption sticker
      if (t < BIG) P.sticker(ctx, 'true crime but it happened in my repo', 50, 1520, { size: 44, pop: ease.outBack(prog(t, 0.4, 0.4)) });
      else P.sticker(ctx, 'i KNEW it was prettier', 50, 1520, { size: 44, pop: ease.outBack(prog(t, BIG + 0.8, 0.4)), rot: 0.02 });

      if (t >= BIG) P.flash(ctx, 0.7 * (1 - prog(t, BIG, 0.3)), '#fff');
      if (light < 1) P.flash(ctx, 1 - light, '#050308');
    },
  });
})();
