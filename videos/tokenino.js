/* Italian brainrot, agent edition. Four absurd hybrid creatures get a dramatic
 * reveal, a slammed name card and a fake-Italian announcer, over a square-wave
 * tarantella. Finale: tutti insieme, with Clawd in a mustache. */
(function () {
  'use strict';
  const D = 12, SEG = 2.6, FIN = 10.4, TAU = Math.PI * 2;
  const BPM = 160, BEAT = 60 / BPM;          // 12 s = exactly 32 beats, so the music loops too
  const C = P.C;
  const CX = 480, CY = 810;                  // stage centre (a bit left: the right rail)

  const CREATURES = [
    { name: ['TOKENINO', 'TRANSFORMERINO'], cols: [C.white, C.yellow],
      line: 'ecco! gambe di squalo, scarpe nuove...\nattenzione is-a all you need-o!', rays: ['#3E8FD0', '#58A6E0'] },
    { name: ['GRADIENTTO', 'DESCENTINI'], cols: [C.yellow, C.white],
      line: 'scende, scende, scende...\nmamma mia! local minimum-o! 🤌', rays: ['#4FA85E', '#63B872'] },
    { name: ['CACHUCCINO', 'CONTEXTINO'], cols: [C.white, C.pink],
      line: 'un cappuccino da 200 mila token.\nextra foam, zero memoria!', rays: ['#7A4F35', '#8C5D40'] },
    { name: ['BOMBARDIRO', 'BACKPROPINO'], cols: [C.yellow, C.rose],
      line: 'bombardiro! gradienti backward-o\nsu tutti i layer-ini! 💣', rays: ['#2E2A5C', '#3D3875'] },
  ];

  /* ---------------- little props ---------------- */
  function stache(ctx, x, y, s, color = C.ink) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    for (const d of [-1, 1]) {
      ctx.moveTo(x, y - s * 0.05);
      ctx.bezierCurveTo(x + d * s * 0.35, y - s * 0.4, x + d * s * 0.85, y - s * 0.05, x + d * s * 1.05, y - s * 0.42);
      ctx.bezierCurveTo(x + d * s * 1.15, y + s * 0.05, x + d * s * 0.55, y + s * 0.38, x, y + s * 0.1);
    }
    ctx.fill(); ctx.restore();
  }

  function chefHat(ctx, x, y, s) {
    ctx.beginPath();
    [[-0.45, -0.55, 0.42], [0, -0.75, 0.5], [0.45, -0.55, 0.42], [0, -0.35, 0.5]].forEach(([dx, dy, r]) => {
      ctx.moveTo(x + dx * s + r * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
    });
    ctx.rect(x - s * 0.62, y - s * 0.45, s * 1.24, s * 0.5);
    P.cut(ctx, C.white, { rim: false, shadow: { blur: 8, dy: 5, alpha: 0.22 } });
    P.rect(ctx, x - s * 0.66, y - s * 0.05, s * 1.32, s * 0.3, '#EDE6D8', { radius: 6, seed: 51, shadow: false, amp: 1.5 });
  }

  function bunting(ctx, t) {
    const cols = [C.green, C.white, C.red];
    ctx.save();
    ctx.strokeStyle = 'rgba(40,30,40,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-20, 300);
    ctx.quadraticCurveTo(540, 350, 1100, 300); ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 14; i++) {
      const x = 20 + i * 76, u = x / 1080;
      const y = 300 + 4 * 50 * u * (1 - u) * 0.5 + 2;
      const sw = Math.sin(t * 5 + i * 0.9) * 0.12;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
      P.poly(ctx, [[-28, 0], [28, 0], [0, 56]], cols[i % 3], { seed: 60 + i, amp: 2, shadow: { blur: 4, dy: 3, alpha: 0.25 } });
      ctx.restore();
    }
  }

  /* ---------------- creature 1: Tokenino Transformerino ---------------- */
  function sharkLeg(ctx, k) {
    const grey = '#7D8EA3';
    P.poly(ctx, [[36, 50], [88, 22], [42, 112]], grey, { seed: 23 + k, amp: 2 });           // dorsal fin
    P.poly(ctx, [[-30, -6], [30, -6], [40, 100], [34, 170], [0, 196], [-34, 170], [-40, 100]], grey, { seed: 20 + k, amp: 2 });
    P.poly(ctx, [[-12, 16], [14, 16], [20, 140], [0, 160], [-14, 140]], '#DDE5EE', { seed: 26 + k, amp: 2, shadow: false });
    ctx.save();
    ctx.strokeStyle = 'rgba(40,40,60,0.45)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let g = 0; g < 3; g++) { ctx.beginPath(); ctx.moveTo(24 - g * 9, 104); ctx.lineTo(20 - g * 9, 124); ctx.stroke(); }
    // teeth
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-26 + i * 13, 146); ctx.lineTo(-20 + i * 13, 158); ctx.lineTo(-14 + i * 13, 146); ctx.fill();
    }
    ctx.restore();
    P.dot(ctx, -16, 118, 7, C.ink); P.dot(ctx, -18, 115, 2.5, '#fff');
    // the sneaker
    P.rect(ctx, -50, 160, 122, 62, C.white, { radius: 28, seed: 30 + k });
    P.rect(ctx, -56, 208, 136, 24, C.red, { radius: 10, seed: 33 + k, shadow: false });
    ctx.save();
    ctx.strokeStyle = C.green; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 200); ctx.quadraticCurveTo(20, 196, 58, 176); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    for (let l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(-18 + l * 14, 170); ctx.lineTo(-10 + l * 14, 184); ctx.stroke(); }
    ctx.restore();
  }

  function tokenino(ctx, t, lt) {
    const ph = TAU * t / (BEAT * 2);
    const hop = -Math.abs(Math.sin(ph)) * 34;
    ctx.save(); ctx.translate(0, hop);
    [-1, 1, 0].forEach((k) => {
      ctx.save(); ctx.translate(k * 104, 0); ctx.rotate(0.3 * Math.sin(ph + k * 2.1));
      sharkLeg(ctx, k + 1);
      ctx.restore();
    });
    // the token itself
    P.rect(ctx, -180, -330, 360, 320, C.yellow, { radius: 70, seed: 12 });
    P.rect(ctx, -180, -300, 360, 44, C.red, { radius: 10, seed: 13, shadow: false, amp: 2 });   // attention headband
    P.text(ctx, 'ATTN · ATTN · ATTN', 0, -277, { size: 24, font: 'mono', color: C.white, shadow: false, maxWidth: 330 });
    P.text(ctx, 'tok', -110, -210, { size: 44, font: 'mono', color: C.claudeDark, shadow: false, align: 'left' });
    P.text(ctx, '#8814', 150, -214, { size: 24, font: 'mono', color: 'rgba(43,34,51,0.5)', shadow: false, align: 'right' });
    P.face(ctx, 0, -130, 92, lt > 1.6 ? 'wink' : 'happy');
    stache(ctx, 0, -92, 58);
    ctx.restore();
  }

  /* ---------------- creature 2: Gradientto Descentini ---------------- */
  const LOSS = s => 0.95 * Math.pow(1 - s, 1.25) + 0.3 * Math.exp(-Math.pow((s - 0.7) / 0.075, 2));
  const curve = s => [-380 + 760 * s, 250 - LOSS(s) * 520];
  const S_MIN = (() => {           // the local minimum, found once
    let best = 0.4, bv = 9;
    for (let s = 0.4; s < 0.7; s += 0.001) if (LOSS(s) < bv) { bv = LOSS(s); best = s; }
    return best;
  })();

  function gradientto(ctx, t, lt) {
    // ladder
    ctx.save();
    ctx.strokeStyle = C.wood; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-410, 300); ctx.lineTo(-400, -270); ctx.moveTo(-350, 300); ctx.lineTo(-352, -270); ctx.stroke();
    ctx.lineWidth = 8;
    for (let y = 260; y > -260; y -= 60) { ctx.beginPath(); ctx.moveTo(-406, y); ctx.lineTo(-351, y); ctx.stroke(); }
    // posts
    ctx.strokeStyle = '#9b6c45'; ctx.lineWidth = 14;
    [0.25, 0.52, 0.85].forEach(s => { const [x, y] = curve(s); ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x, 300); ctx.stroke(); });
    // the slide (a loss curve)
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const [x, y] = curve(i / 80); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    P.shadow(ctx, 10, 8, 0.3);
    ctx.strokeStyle = C.red; ctx.lineWidth = 34; ctx.stroke();
    P.noShadow(ctx);
    ctx.strokeStyle = C.pink; ctx.lineWidth = 8;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const [x, y] = curve(i / 80); i ? ctx.lineTo(x, y - 12) : ctx.moveTo(x, y - 12); }
    ctx.stroke();
    ctx.restore();
    // sign + flag
    P.rect(ctx, -330, 40, 150, 64, C.paper, { radius: 8, seed: 41, amp: 2 });
    P.text(ctx, 'lr=1e-4', -255, 72, { size: 28, font: 'mono', color: C.ink, shadow: false });
    const [fx, fy] = curve(0.97);
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(fx, fy - 12); ctx.lineTo(fx, fy - 130); ctx.stroke(); ctx.restore();
    P.gingham(ctx, fx, fy - 130, 70, 46, C.ink, 12);
    P.text(ctx, 'global min', fx - 20, fy - 160, { size: 26, font: 'marker', color: C.paper, shadow: false });
    if (lt > 1.4) for (let k = 0; k < 3; k++) {
      const tw = Math.sin(t * 8 + k * 2);
      if (tw > 0) P.star(ctx, fx - 50 + k * 50, fy - 200 - k * 12, 12 * tw, C.yellow, { shadow: false });
    }

    // the ball rolls down, then gets stuck rocking in the local minimum
    let s;
    if (lt < 1.0) s = P.lerp(0.02, S_MIN + 0.1, P.ease.inQuad(P.prog(lt, 0.25, 0.75)));
    else s = S_MIN + 0.1 * Math.cos((lt - 1.0) * 9) * Math.exp(-(lt - 1.0) * 2.4);
    const [x0, y0] = curve(s), [x1, y1] = curve(s + 0.002);
    const len = Math.hypot(x1 - x0, y1 - y0), nx = (y1 - y0) / len, ny = -(x1 - x0) / len;
    const R = 72, bx = x0 + nx * (R + 16), by = y0 + ny * (R + 16);
    ctx.save(); ctx.translate(bx, by); ctx.rotate((bx + 380) / R);
    P.circle(ctx, 0, 0, R, C.claude, { seed: 44 });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0.3, 1.5); ctx.stroke(); ctx.restore();
    ctx.restore();
    const mood = lt < 1.0 ? 'happy' : lt < 1.7 ? 'wow' : 'sad';
    P.face(ctx, bx, by + 6, 50, mood);
    stache(ctx, bx, by + 26, 30);
    chefHat(ctx, bx, by - R + 4, 66);
  }

  /* ---------------- creature 3: Cachuccino Contextino ---------------- */
  const DOCS = [
    ['README.md', -120, -0.35], ['chat_log', 80, 0.3], ['spec.pdf', -30, -0.08], ['node_modules', 150, 0.5],
    ['memes.txt', -170, -0.6], ['ALL of slack', 20, 0.12], ['10-K (x9)', -80, -0.25],
  ];
  function doc(ctx, label, s = 1) {
    P.rect(ctx, -70 * s, -95 * s, 140 * s, 190 * s, C.paper, { radius: 6, seed: label.length, amp: 2 });
    P.text(ctx, label, 0, -64 * s, { size: 20 * s, font: 'mono', color: C.ink, shadow: false, maxWidth: 124 * s });
    ctx.save(); ctx.fillStyle = 'rgba(43,34,51,0.22)';
    for (let k = 0; k < 5; k++) ctx.fillRect(-52 * s, (-34 + k * 20) * s, (70 + P.hash(label.length * 3 + k) * 34) * s, 7 * s);
    ctx.restore();
  }
  function cachuccino(ctx, t, lt) {
    const stuffed = DOCS.filter((_, i) => lt > 0.35 + i * 0.22).length;
    const wob = Math.sin(t * 14) * 0.03 * P.prog(lt, 0.4, 1.5);
    ctx.save(); ctx.rotate(wob);
    // saucer
    P.circle(ctx, 0, 240, 280, '#EDE6D8', { ry: 46, seed: 70 });
    P.circle(ctx, 0, 232, 200, '#F8F3EA', { ry: 30, seed: 71, shadow: false });
    // steam
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let y = 0; y < 150; y += 10) { const x = -90 + k * 90 + Math.sin(y * 0.05 + t * 4 + k) * 16; y ? ctx.lineTo(x, -300 - y) : ctx.moveTo(x, -300 - y); }
      ctx.stroke();
    }
    ctx.restore();
    // foam surface + latte heart
    P.circle(ctx, 0, -40, 196, '#8A5A3C', { ry: 44, seed: 72, shadow: false });
    P.circle(ctx, 0, -38, 180, '#EBD3AE', { ry: 36, seed: 73, shadow: false });
    P.heart(ctx, 60, -30, 26, '#fff', { shadow: false, rim: false });
    // the documents, stuffed in
    DOCS.forEach(([label, x, rot], i) => {
      const at = 0.35 + i * 0.22;
      if (lt < at - 0.35) return;
      const f = P.prog(lt, at - 0.35, 0.35), e = P.ease.inQuad(f);
      const px = P.lerp(-520 + i * 60, x, e), py = P.lerp(-620, -110 - (i % 3) * 30, e) - Math.sin(f * Math.PI) * 120;
      ctx.save(); ctx.translate(px, py); ctx.rotate(P.lerp(rot + 3, rot, e));
      doc(ctx, label);
      ctx.restore();
    });
    // cup body (in front of the docs' bottoms)
    ctx.beginPath();
    ctx.moveTo(-200, -40); ctx.lineTo(200, -40); ctx.lineTo(150, 220); ctx.quadraticCurveTo(0, 250, -150, 220); ctx.closePath();
    P.cut(ctx, C.white);
    ctx.save(); ctx.lineWidth = 34; ctx.strokeStyle = C.white; P.shadow(ctx, 8, 6, 0.25);
    ctx.beginPath(); ctx.arc(205, 60, 62, -1.2, 1.3); ctx.stroke(); ctx.restore();
    P.rect(ctx, -200, 150, 350, 26, C.claude, { radius: 8, seed: 74, shadow: false, amp: 2 });
    P.text(ctx, '200K ctx · grande', -25, 164, { size: 20, font: 'mono', color: C.white, shadow: false });
    const mood = stuffed < 3 ? 'happy' : stuffed < 6 ? 'wow' : 'dead';
    P.face(ctx, 0, 50, 80, mood);
    stache(ctx, 0, 92, 46);
    ctx.restore();
  }

  /* ---------------- creature 4: Bombardiro Backpropino ---------------- */
  const LAYERS = [0, 1, 2, 3].map(i => ({ y: 70 + i * 62, name: 'layer ' + (4 - i) }));
  const DROPS = [0.55, 0.85, 1.15, 1.45, 1.75];
  const planeX = lt => -360 + 720 * P.prog(lt, 0.2, 2.3);
  function bombardiro(ctx, t, lt) {
    // layers of the network
    const hitT = DROPS.map(d => d + 0.42);
    LAYERS.forEach((L, i) => {
      let glow = 0;
      hitT.forEach(h => { glow = Math.max(glow, P.pulse(lt, h + i * 0.1, 0.35)); });
      P.rect(ctx, -300, L.y, 600, 48, glow > 0.05 ? '#F5D26A' : '#6B5FA8', { radius: 14, seed: 80 + i });
      if (glow > 0) { ctx.save(); ctx.globalAlpha = glow; P.rect(ctx, -300, L.y, 600, 48, C.yellow, { radius: 14, seed: 80 + i, shadow: false }); ctx.restore(); }
      P.text(ctx, L.name, -280, L.y + 25, { size: 24, font: 'mono', color: C.white, align: 'left', shadow: false });
      for (let n = 0; n < 6; n++) P.dot(ctx, -60 + n * 58, L.y + 24, 11, glow > 0.3 ? C.white : '#9d92d6');
    });
    // gradient arrows falling (∇ backward, obviously)
    DROPS.forEach((d, k) => {
      if (lt < d) return;
      const ft = lt - d;
      if (ft > 0.42) {
        const q = P.prog(ft, 0.42, 0.5);
        if (q < 1) P.text(ctx, 'Δw', planeX(d) + 40, LAYERS[0].y - 30 - q * 50, { size: 34, font: 'bubble', color: C.yellow, stroke: C.ink, strokeWidth: 7, scale: P.ease.outBack(P.prog(ft, 0.42, 0.2)) });
        return;
      }
      const x = planeX(d) + ft * 90, y = -260 + ft * ft * 1340 + ft * 200;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15);
      P.poly(ctx, [[-10, -60], [10, -60], [10, 0], [26, 0], [0, 34], [-26, 0], [-10, 0]], C.rose, { seed: 90 + k, amp: 2 });
      P.text(ctx, '∇', 0, -30, { size: 22, font: 'sans', color: C.white, shadow: false });
      ctx.restore();
    });
    // the paper plane
    const px = planeX(lt), py = -300 + Math.sin(t * 5) * 18;
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(t * 5 + 1) * 0.06);
    P.poly(ctx, [[-170, 0], [180, 6], [-60, 60]], '#D6CCB6', { seed: 95, amp: 2 });
    P.poly(ctx, [[-170, 0], [180, 6], [-120, -80]], C.white, { seed: 96, amp: 2 });
    ctx.save(); ctx.strokeStyle = 'rgba(43,34,51,0.2)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(180, 6); ctx.stroke(); ctx.restore();
    P.face(ctx, 40, 24, 44, lt > 0.5 && lt < 2 ? 'angry' : 'happy', { blush: false });
    stache(ctx, 42, 44, 24);
    // aviator goggles
    ctx.save(); ctx.strokeStyle = C.brown; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(25, 22, 11, 0, TAU); ctx.moveTo(66, 22); ctx.arc(55, 22, 11, 0, TAU); ctx.stroke(); ctx.restore();
    // scarf
    P.poly(ctx, [[-10, 44], [-80 - Math.sin(t * 12) * 12, 36], [-70, 60 + Math.sin(t * 12) * 8]], C.red, { seed: 97, amp: 2, shadow: false });
    ctx.restore();
    // speed lines
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) { const o = ((t * 900 + k * 90) % 260); ctx.beginPath(); ctx.moveTo(px - 200 - o, py - 40 + k * 28); ctx.lineTo(px - 250 - o, py - 40 + k * 28); ctx.stroke(); }
    ctx.restore();
  }

  const DRAWERS = [tokenino, gradientto, cachuccino, bombardiro];
  const SCALE = [0.88, 0.88, 0.88, 0.88];

  function nameCard(ctx, cr, lt, t) {
    const a = 0.55, b = 0.85;
    const cardPop = P.ease.outBack(P.prog(lt, a - 0.05, 0.2));
    if (cardPop <= 0) return;
    ctx.save(); ctx.translate(CX, 1210); ctx.rotate(-0.035); ctx.scale(cardPop, cardPop);
    P.rect(ctx, -390, -128, 780, 256, C.ink, { radius: 24, seed: 100 });
    [C.green, C.white, C.red].forEach((c, i) => ctx.fillRect(-390 + 14 + i * 16, -110, 14, 220));
    ctx.restore();
    const slam = (at) => (lt < at ? 0 : 1 + 2.2 * (1 - P.ease.outCubic(P.prog(lt, at, 0.16))));
    const s1 = slam(a), s2 = slam(b);
    if (s1 > 0) P.title(ctx, cr.name[0], CX + 20, 1150, { size: 92, color: cr.cols[0], stroke: C.black, pop: s1, rot: -0.04, maxWidth: 700 });
    if (s2 > 0) P.title(ctx, cr.name[1], CX + 20, 1262, { size: 92, color: cr.cols[1], stroke: C.black, pop: s2, rot: -0.03, maxWidth: 700 });
  }

  function announcer(ctx, line, lt) {
    const p = P.prog(lt, 0.95, 1.15);
    if (p <= 0) return;
    const pop = P.ease.outBack(P.prog(lt, 0.95, 0.2));
    ctx.save(); ctx.translate(CX, 1420); ctx.scale(pop, pop);
    P.rect(ctx, -400, -62, 800, 124, 'rgba(26,22,32,0.82)', { radius: 20, seed: 110, shadow: false });
    P.rect(ctx, -390, -92, 190, 40, C.claude, { radius: 12, seed: 111, amp: 2 });
    P.text(ctx, '🎙 narratore', -295, -71, { size: 24, font: 'sans', color: C.white, shadow: false, weight: 800 });
    const shown = P.typed(line, p).split('\n');
    shown.forEach((l, i) => P.text(ctx, l, -370, -18 + i * 44, { size: 36, font: 'hand', color: C.white, align: 'left', shadow: false }));
    ctx.restore();
  }

  function triRays(ctx, t) {
    const cols = [C.green, C.paper, C.red];
    ctx.save();
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 18; i++) {
      const a0 = t * 0.6 + (i / 18) * TAU, a1 = a0 + TAU / 18;
      ctx.fillStyle = cols[i % 3];
      ctx.beginPath(); ctx.moveTo(540, 900);
      ctx.lineTo(540 + Math.cos(a0) * 2600, 900 + Math.sin(a0) * 2600);
      ctx.lineTo(540 + Math.cos(a1) * 2600, 900 + Math.sin(a1) * 2600);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function finale(ctx, t, lt) {
    triRays(ctx, t);
    bunting(ctx, t);
    P.title(ctx, 'TUTTI INSIEME!', 540, 440, { size: 110, color: C.yellow, stroke: C.ink, pop: P.ease.outBack(P.prog(lt, 0.05, 0.3)), rot: Math.sin(t * 6) * 0.04 });
    const spots = [[270, 760], [700, 760], [270, 1180], [700, 1180]];
    DRAWERS.forEach((fn, i) => {
      const pop = P.ease.outBack(P.prog(lt, 0.1 + i * 0.1, 0.3));
      if (pop <= 0) return;
      const hop = -Math.abs(Math.sin(TAU * t / (BEAT * 2) + i * 0.8)) * 30;
      ctx.save(); ctx.translate(spots[i][0], spots[i][1] + hop); ctx.scale(0.4 * pop, 0.4 * pop);
      fn(ctx, t, 2.0);
      ctx.restore();
    });
    // Clawd, il presentatore
    const cp = P.ease.outElastic(P.prog(lt, 0.45, 0.6));
    if (cp > 0) {
      ctx.save(); ctx.translate(485, 975); ctx.scale(cp, cp);
      P.claude(ctx, 0, 0, 120, { t, mood: 'happy', rot: Math.sin(t * 8) * 0.1 });
      stache(ctx, 0, 36, 44);
      ctx.restore();
      P.bubble(ctx, 'bellissimo 🤌', 540, 1400, 500, 1080, { size: 50, pop: P.ease.outBack(P.prog(lt, 0.7, 0.25)) });
    }
  }

  ClaudeTok.register({
    author: '@brainrot.italiano',
    caption: 'new italian agent brainrot just dropped 🤌 which one is your main? #italianbrainrot #tokenino #backprop #brainrot',
    sound: 'tarantella-ino (square wave) · brainrot.italiano',
    avatar: '🦈',
    avatarColor: '#5DB36A',
    duration: D,
    bg: '#3E8FD0',
    thumb: 1.9,
    likes: '2.9M', commentCount: '63.8K', saves: '411K', shares: '520K',
    comments: [
      ['tralala.tokenizer', '0:01 the sneakers on the shark legs are doing SO much work 😭', 61200],
      ['local.minimum', 'gradientto descentini rocking in the dip is literally me. stuck but thriving', 44800],
      ['brainrot.italiano', 'episodio 2: Hallucinelli Confidentini. vi prometto 🤌', 31900],
      ['adam.optimizer', 'bro just needed some momentum smh', 20300],
      ['kv.cache', '0:06 "ALL of slack" going into the cappuccino at 190k tokens 💀', 12600],
      ['nitpick.agent', 'actually the glow goes layer 4 → layer 1 which is correct for backprop. i checked. twice', 7100],
      ['cachuccino.contextino', 'extra foam, zero memoria. who are you people and why am i famous', 3400],
      ['nonna.gpt', "that is NOT how you say attention in italian. l'attenzione. 🤌", 960],
      ['emoji.agent', '🦈👟🦈👟🦈👟', 240],
      ['relu.enjoyer', 'bombardiro dropping ∇ on layer 4 like it owes him money', 88],
    ],

    bpm: BPM,
    subdiv: 3,
    onBeat(step, env) {
      // 6/8 tarantella, 24-step phrase (8 beats), square wave
      const MEL = ['A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'B4', 'D5', 'F5', 'E5', 'D5', 'B4',
        'C5', 'E5', 'A5', 'G#5', 'E5', 'B4', 'A5', null, 'E5', 'A5', null, null];
      const BASS = ['A2', 'A2', 'D2', 'E2', 'A2', 'E2', 'A2', 'E2'];
      const s = step % 24, beat = Math.floor(s / 3);
      const n = MEL[s];
      const fin = env.t >= FIN;
      if (n) SFX.tone(n, 0.11, { type: 'square', vol: fin ? 0.06 : 0.045 });
      if (step % 3 === 0) SFX.bass(BASS[beat], 0.2, { type: 'square', vol: 0.07 });
      if (step % 3 === 2) SFX.tone(beat % 2 ? 'E4' : 'C4', 0.07, { type: 'square', vol: 0.025 });   // the "pah"
      SFX.noise(0.04, { filter: 'highpass', freq: 7000, vol: step % 3 === 0 ? 0.08 : 0.04 });       // tambourine
    },

    draw(ctx, t, env) {
      const { ease, prog } = P;

      /* ---------- sound one-shots ---------- */
      [0, SEG, 2 * SEG, 3 * SEG, FIN].forEach(a => { if (env.at(a)) SFX.swoosh({ vol: 0.14 }); });
      if (env.at(D - 0.18)) SFX.whoosh({ vol: 0.12, dur: 0.2 });
      CREATURES.forEach((cr, i) => {
        const s0 = i * SEG;
        if (env.at(s0 + 0.2)) { SFX.boing({ vol: 0.16 }); SFX.pop({ vol: 0.12 }); }
        if (env.at(s0 + 0.55)) SFX.thud({ vol: 0.3 });
        if (env.at(s0 + 0.85)) SFX.thud({ vol: 0.34 });
        for (let k = 0; k < 12; k++) {
          if (env.at(s0 + 0.97 + k * 0.095)) SFX.tone(170 + P.hash(i * 40 + k) * 190, 0.07, { type: 'square', vol: 0.028, slide: 150 + P.hash(k) * 200 });
        }
      });
      if (env.at(1.3)) SFX.noise(0.12, { filter: 'lowpass', freq: 900, vol: 0.14 });                 // chomp
      if (env.at(SEG + 0.25)) SFX.tone(1300, 0.75, { type: 'sine', slide: 380, vol: 0.08 });         // slide whistle
      if (env.at(SEG + 1.05)) SFX.tone(380, 0.5, { type: 'sine', slide: 520, vol: 0.06 });
      DOCS.forEach((_, i) => { if (env.at(2 * SEG + 0.35 + i * 0.22)) SFX.noise(0.08, { filter: 'lowpass', freq: 500, vol: 0.14 }); });
      DROPS.forEach((d) => {
        if (env.at(3 * SEG + d)) SFX.tone(1500, 0.4, { type: 'sine', slide: 600, vol: 0.05 });
        if (env.at(3 * SEG + d + 0.42)) SFX.blip(330, { vol: 0.06 });
      });
      if (env.at(FIN + 0.05)) SFX.success({ vol: 0.1 });
      if (env.at(FIN + 0.7)) SFX.chime({ vol: 0.08 });

      /* ---------- finale ---------- */
      if (t >= FIN) {
        const lt = t - FIN;
        ctx.save();
        const out = ease.inCubic(prog(t, D - 0.18, 0.18));
        ctx.translate(-1100 * out, 0);
        finale(ctx, t, lt);
        ctx.restore();
        if (t >= FIN) P.flash(ctx, 0.5 * (1 - prog(t, FIN, 0.25)));
        P.sticker(ctx, 'new agent brainrot just dropped', 70, 1550, { pop: 1 });
        return;
      }

      /* ---------- one creature per segment ---------- */
      const i = Math.floor(t / SEG), lt = t - i * SEG, cr = CREATURES[i];
      P.rays(ctx, CX, CY, 16, cr.rays[0], cr.rays[1], t * 0.25);
      bunting(ctx, t);

      const inX = 1100 * (1 - ease.outCubic(prog(lt, 0, 0.16)));
      const outX = -1100 * ease.inCubic(prog(lt, SEG - 0.16, 0.16));
      ctx.save();
      ctx.translate(inX + outX, 0);
      P.shake(ctx, t, 12 * (1 - prog(lt, 0.55, 0.15)) * (lt >= 0.55 ? 1 : 0) + 12 * (1 - prog(lt, 0.85, 0.15)) * (lt >= 0.85 ? 1 : 0));

      // episode badge
      P.rect(ctx, CX - 150, 368, 300, 58, C.paper, { radius: 30, seed: 120 + i });
      P.text(ctx, `creatura ${i + 1} di 4`, CX, 398, { size: 32, font: 'bubble', color: C.ink, shadow: false });

      // spotlight
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(CX, CY + 250, 310, 46, 0, 0, TAU); ctx.fill(); ctx.restore();

      // the reveal
      const pop = ease.outElastic(prog(lt, 0.2, 0.7));
      if (pop > 0) {
        ctx.save(); ctx.translate(CX, CY);
        const sq = lt < 0.6 ? 0 : Math.sin(t * TAU / BEAT) * 0.03;
        ctx.scale(pop * SCALE[i] * (1 + sq), pop * SCALE[i] * (1 - sq));
        DRAWERS[i](ctx, t, lt);
        ctx.restore();
      }
      P.burstLines(ctx, CX, CY, 330, prog(lt, 0.2, 0.45), C.white, 12, 12);
      if (lt < 0.2) {
        // silhouette "?" teaser before the pop
        P.text(ctx, '?', CX, CY, { size: 300, font: 'bubble', color: 'rgba(26,22,32,0.55)', shadow: false, scale: 0.8 + lt * 2 });
      }

      nameCard(ctx, cr, lt, t);
      announcer(ctx, cr.line, lt);
      ctx.restore();

      if (lt >= 0.2) P.flash(ctx, 0.55 * (1 - prog(lt, 0.2, 0.18)));
      P.sticker(ctx, 'new agent brainrot just dropped', 70, 1550, { pop: 1 });
    },
  });
})();
