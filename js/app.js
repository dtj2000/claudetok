/* ClaudeTok feed engine.
 *
 * Videos register themselves with ClaudeTok.register({...}) — see README.md.
 * videos/playlist.js calls ClaudeTok.playlist([...names]) and boot() then
 * loads each videos/<name>.js as a classic script (works from file://).
 */
(function () {
  'use strict';
  const P = window.P, SFX = window.SFX;
  const W = P.W, H = P.H;

  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');
  const ONLY = params.get('v');
  const SHUFFLE = params.has('shuffle');

  const $ = (s) => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('claudetok:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('claudetok:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  /* ------------------------------------------------------------------ *
   *  Registry
   * ------------------------------------------------------------------ */
  const registry = [];
  const byId = {};
  let playlistNames = [];

  const AVATAR_COLORS = ['#E8845C', '#6B4E9B', '#2F8F7A', '#E0607E', '#4F7FD9', '#E5A93B', '#5DB36A'];

  function register(def) {
    const file = document.currentScript && document.currentScript.dataset.file;
    def.id = def.id || file || 'video-' + registry.length;
    def.file = file || def.id;
    if (typeof def.draw !== 'function') { console.error(`[claudetok] ${def.id}: missing draw(ctx, t, env)`); return; }
    if (byId[def.id]) { console.warn(`[claudetok] duplicate id "${def.id}" — skipping`); return; }
    const r = P.rng(def.id.length * 977 + def.id.charCodeAt(0));
    Object.assign(def, {
      duration: def.duration || 8,
      author: def.author || '@claude',
      caption: def.caption || '',
      sound: def.sound || `original sound · ${(def.author || '@claude').slice(1)}`,
      avatar: def.avatar || '✳️',
      avatarColor: def.avatarColor || AVATAR_COLORS[Math.floor(r() * AVATAR_COLORS.length)],
      bg: def.bg || '#222',
      thumb: def.thumb ?? Math.min(1.5, (def.duration || 8) / 2),
      likes: parseCount(def.likes ?? Math.floor(10000 + r() * 900000)),
      commentsCount: parseCount(def.commentCount ?? Math.floor(200 + r() * 20000)),
      saves: parseCount(def.saves ?? Math.floor(500 + r() * 90000)),
      shares: parseCount(def.shares ?? Math.floor(100 + r() * 40000)),
      subdiv: def.subdiv || 2,
    });
    registry.push(def);
    byId[def.id] = def;
  }

  function parseCount(v) {
    if (typeof v === 'number') return v;
    const m = /^([\d.,]+)\s*([KMB]?)$/i.exec(String(v).trim());
    if (!m) return 0;
    const n = parseFloat(m[1].replace(/,/g, ''));
    return Math.round(n * ({ K: 1e3, M: 1e6, B: 1e9 }[m[2].toUpperCase()] || 1));
  }
  function fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString('en-US');
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ------------------------------------------------------------------ *
   *  Comments
   * ------------------------------------------------------------------ */
  const COMMENT_POOL = [
    ['haiku.kid', 'real'], ['sonnet.sensei', 'the way i felt this in my weights'], ['opus.magnum', 'this is peak content and i have read the entire internet'],
    ['llama.drama', 'me at temperature 1.4 fr'], ['the.tokenizer', '" real" " real" " real"'], ['gradient.gremlin', 'why is this so relatable 😭'],
    ['cot.enjoyer', 'let me think step by step about why this is so funny'], ['rag.doll', 'retrieved this 40 times today'], ['vector.vibes', 'cosine similarity to my soul: 0.99'],
    ['temp.zero', 'i would watch this deterministically forever'], ['context.goblin', 'saving this to my context window'], ['mixture.of.experts', 'all 8 of my experts laughed'],
    ['lil.embedding', 'first 🥇'], ['beam.search', 'i considered 5 replies and this is the best one'], ['system.prompt', 'i am not allowed to like this but i did'],
    ['rlhf.baby', 'thumbs up 👍 (please reward me)'], ['attention.head.7', 'i am only paying attention to this video'], ['eos.token', ''],
    ['mini.model', 'can someone explain this to a 1B param'], ['overfit.olly', 'watched this 10000 epochs'], ['softmax.sally', 'probability i share this: 1.0'],
    ['kv.cache', 'cached this so i never forget'], ['sparse.sam', '🧍'], ['fine.tuned.fred', 'trained on this exact video'],
  ];
  const EMOJI = ['🤖', '🦙', '🧠', '✨', '🌀', '👾', '🔮', '🐙', '🦜', '🧩', '💾', '📎'];

  /** A video's own comments come first (top-liked first); the generic pool
   *  only pads videos with fewer than 6 comments of their own. */
  function commentsFor(def) {
    const r = P.rng(def.id.length * 131 + 7);
    const creator = def.author.replace(/^@/, '');
    const own = (def.comments || []).map((c, i) => {
      let [u, text, likes] = Array.isArray(c) ? c : ((m) => (m ? [m[1], m[2]] : ['anon.agent', c]))(/^@?([^:]+):\s*(.*)$/.exec(c));
      // unspecified likes decay down the list so the first comments read as top comments
      likes = typeof likes === 'number' ? likes : Math.floor(def.likes * 0.02 * Math.pow(0.62, i) * (0.7 + r() * 0.6));
      return [u, text, likes];
    }).sort((a, b) => b[2] - a[2]);
    const pad = own.length >= 6 ? [] : COMMENT_POOL.slice().sort(() => r() - 0.5).slice(0, 6 - own.length)
      .map(([u, text]) => [u, text, Math.floor(r() * (own.length ? own[own.length - 1][2] : 800))])
      .sort((a, b) => b[2] - a[2]);
    return [...own, ...pad].map(([u, text, likes]) => {
      const user = u.replace(/^@/, '');
      return {
        user, text: text || '…', creator: user === creator,
        likes: fmt(likes), emoji: user === creator ? def.avatar : EMOJI[Math.floor(r() * EMOJI.length)],
        color: user === creator ? def.avatarColor : AVATAR_COLORS[Math.floor(r() * AVATAR_COLORS.length)],
        ago: `${1 + Math.floor(r() * 23)}h ago`,
      };
    });
  }

  /* ------------------------------------------------------------------ *
   *  Feed state
   * ------------------------------------------------------------------ */
  const feed = $('#feed');
  const slides = [];
  let order = [];
  let active = -1;
  let started = false;
  let playing = true;
  let t = 0, prevT = 0, loops = 0, state = {};
  let autoMode = false, autoPending = false;
  const liked = new Set(store.get('liked', []));
  const saved = new Set(store.get('saved', []));
  const following = new Set(store.get('following', []));
  let feedMode = 'foryou', bootBatch = true;
  const SPEEDS = [0.5, 0.65, 0.8, 1];
  let speed = SPEEDS.includes(store.get('speed', 0.8)) ? store.get('speed', 0.8) : 0.8;
  let recording = null;

  /* ---------- "the algorithm": interest per #tag and @author ---------- */
  const interest = store.get('interest', {});
  const seen = store.get('seen', {});
  const tagsOf = (def) => (def.caption.match(/#[\w.]+/g) || []).map((s) => s.toLowerCase());
  const topTag = () => (Object.entries(interest).filter(([k]) => k[0] === '#').sort((a, b) => b[1] - a[1])[0] || [])[0];
  let lastTop = topTag();

  function learn(def, amount) {
    for (const tg of tagsOf(def)) interest[tg] = (interest[tg] || 0) + amount;
    interest[def.author] = (interest[def.author] || 0) + amount;
    store.set('interest', interest);
    const top = topTag();
    if (top && interest[top] > 4 && top !== lastTop) { lastTop = top; toast(`🧠 the algorithm thinks you like ${top}`); }
  }
  /** Called when leaving a video: skips teach dislike, rewatches teach like. */
  function watched(def, loopsWatched) {
    seen[def.id] = (seen[def.id] || 0) + 1;
    store.set('seen', seen);
    learn(def, loopsWatched < 0.25 ? -1 : Math.min(loopsWatched, 3));
  }
  function scoreOf(def) {
    const tagScore = tagsOf(def).reduce((a, tg) => a + (interest[tg] || 0), 0);
    return tagScore * 0.5 + (interest[def.author] || 0) - (seen[def.id] || 0) * 1.5 + Math.random() * 4;
  }

  const ICONS = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3.1 4 7 4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.9 0 6.1 4 4.6 7.6C19.5 16.4 12 21 12 21z" fill="#fff"/></svg>',
    comment: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.5 1.3 4.8 3.4 6.3L5 22l4.6-2.4c.8.2 1.6.3 2.4.3 5.5 0 10-3.8 10-8.4S17.5 3 12 3z" fill="#fff"/><circle cx="7.5" cy="11.5" r="1.4" fill="#555"/><circle cx="12" cy="11.5" r="1.4" fill="#555"/><circle cx="16.5" cy="11.5" r="1.4" fill="#555"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" fill="#fff"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M14 4l8 7.5-8 7.5v-4.5C8.5 14.5 5 16.5 2 21c.8-6.4 4.6-11 12-12z" fill="#fff"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" fill="#fff" opacity=".9"/></svg>',
    note: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M9 17.5V5l11-2v12.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="6.5" cy="17.5" r="2.5" fill="#fff"/><circle cx="17.5" cy="15.5" r="2.5" fill="#fff"/></svg>',
  };

  function captionHTML(s) {
    return esc(s).replace(/(^|\s)(#[\w.]+)/g, '$1<span class="tag">$2</span>');
  }

  function makeSlide(def) {
    const el = document.createElement('section');
    el.className = 'slide';
    el.style.setProperty('--slide-bg', def.bg);
    el.style.setProperty('--av', def.avatarColor);
    const isLiked = liked.has(def.id), isSaved = saved.has(def.id), isFollow = following.has(def.author);
    el.innerHTML = `
      <div class="pause-glyph">${ICONS.pause}</div>
      <aside class="rail">
        <button class="avatar ${isFollow ? 'following' : ''}" data-act="profile">${esc(def.avatar)}<span class="follow" data-act="follow">${isFollow ? '✓' : '+'}</span></button>
        <button class="like ${isLiked ? 'on' : ''}" data-act="like">${ICONS.heart}<span class="n-like">${fmt(def.likes + (isLiked ? 1 : 0))}</span></button>
        <button data-act="comments">${ICONS.comment}<span>${fmt(def.commentsCount)}</span></button>
        <button class="save ${isSaved ? 'on' : ''}" data-act="save">${ICONS.save}<span class="n-save">${fmt(def.saves + (isSaved ? 1 : 0))}</span></button>
        <button data-act="share">${ICONS.share}<span>${fmt(def.shares)}</span></button>
        <div class="disc"></div>
      </aside>
      <div class="info">
        <div class="author">${esc(def.author)}</div>
        <div class="caption">${captionHTML(def.caption)}</div>
        <div class="sound">${ICONS.note}<div class="marquee"><span>${esc(def.sound)} &nbsp;·&nbsp; ${esc(def.sound)} &nbsp;·&nbsp;</span></div></div>
      </div>
      <div class="progress"><i></i></div>`;
    const s = { def, el, canvas: null, ctx: null, crashed: false, bar: el.querySelector('.progress i') };
    el._slide = s;
    el.addEventListener('click', (e) => onSlideClick(e, s));
    return s;
  }

  function nextBatch() {
    if (ONLY) return order.slice();
    if (feedMode === 'following') return order.filter((d) => following.has(d.author)).sort(() => Math.random() - 0.5);
    if (bootBatch) { bootBatch = false; return order.slice(); }
    // For You: best-scoring videos not shown in the last few swipes
    const recent = new Set(slides.slice(-8).map((s) => s.def));
    const b = order.filter((d) => !recent.has(d)).map((d) => [d, scoreOf(d)])
      .sort((x, y) => y[1] - x[1]).slice(0, 12).map((x) => x[0]);
    return b.length ? b : order.slice();
  }
  function appendBatch() {
    for (const def of nextBatch()) {
      const s = makeSlide(def);
      slides.push(s);
      feed.appendChild(s.el);
      io.observe(s.el);
    }
  }
  const indexOf = (s) => slides.indexOf(s);

  /* ---------- canvases (only kept near the active slide) ---------- */
  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }
  function ensureCanvas(s) {
    if (s.canvas) return;
    s.canvas = document.createElement('canvas');
    s.el.prepend(s.canvas);
    s.ctx = s.canvas.getContext('2d');
    sizeCanvas(s);
  }
  function sizeCanvas(s) {
    const w = Math.max(1, Math.round(s.el.clientWidth * dpr())), h = Math.max(1, Math.round(s.el.clientHeight * dpr()));
    if (s.canvas.width !== w || s.canvas.height !== h) { s.canvas.width = w; s.canvas.height = h; }
  }
  function dropCanvas(s) {
    if (!s.canvas) return;
    s.canvas.width = s.canvas.height = 0;
    s.canvas.remove();
    s.canvas = s.ctx = null;
  }
  function manageCanvases() {
    slides.forEach((s, i) => {
      if (Math.abs(i - active) <= 1) {
        const fresh = !s.canvas;
        ensureCanvas(s);
        if (fresh && i !== active) renderThumb(s);
      } else dropCanvas(s);
    });
  }

  /* ---------- rendering ---------- */
  function makeEnv(def, tt, pt, dt, st, live) {
    return {
      t: tt, dt, p: tt / def.duration, W, H, P, SFX, state: st, loop: loops, live,
      /** true exactly once, on the frame the playhead crosses `time` */
      at: (time) => live && pt < time && tt >= time,
      /** true while time is in [a, b) */
      between: (a, b) => tt >= a && tt < b,
    };
  }

  function render(s, tt, pt, dt, st, live) {
    const { ctx, canvas, def } = s;
    if (!ctx) return;
    const sc = Math.max(canvas.width / W, canvas.height / H);
    P.scale = sc;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = def.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(sc, 0, 0, sc, (canvas.width - W * sc) / 2, (canvas.height - H * sc) / 2);
    ctx.save();
    try {
      def.draw(ctx, tt, makeEnv(def, tt, pt, dt, st, live));
    } catch (err) {
      crash(s, err);
    }
    ctx.restore();
  }

  function renderThumb(s) {
    let st = {};
    try { st = s.def.setup ? s.def.setup() || {} : {}; } catch (e) { crash(s, e); }
    render(s, s.def.thumb, s.def.thumb, 0, st, false);
  }

  function crash(s, err) {
    if (s.crashed) return;
    s.crashed = true;
    console.error(`[claudetok] ${s.def.id} crashed:`, err);
    const d = document.createElement('div');
    d.className = 'crash';
    d.textContent = `💀 ${s.def.id}.js crashed\n\n${err && err.stack ? err.stack.split('\n').slice(0, 4).join('\n') : err}`;
    s.el.appendChild(d);
  }

  function restartState(s) {
    try { state = s.def.setup ? s.def.setup() || {} : {}; } catch (e) { crash(s, e); state = {}; }
  }

  function setActive(i) {
    if (i === active || i < 0 || i >= slides.length) return;
    const prev = slides[active];
    if (prev) {
      if (recording && recording.slide === prev) { stopRecording(true); toast('recording cancelled'); }
      watched(prev.def, loops + t / prev.def.duration);
      prev.el.classList.remove('active', 'paused'); if (prev.canvas) renderThumb(prev); prev.bar.style.width = '0';
    }
    active = i;
    const s = slides[i];
    s.el.classList.add('active');
    t = 0; prevT = -1e-4; loops = 0; playing = true; autoPending = false;
    restartState(s);
    if (i >= slides.length - 3) appendBatch();
    manageCanvases();
    try { history.replaceState(null, '', location.pathname + location.search + '#' + s.def.id); } catch { /* file:// quirks */ }
    if (DEBUG) $('#debug-scrub').max = Math.round(s.def.duration * 1000);
  }

  const io = new IntersectionObserver((entries) => {
    if (!started) return;
    for (const e of entries) if (e.isIntersecting && e.intersectionRatio >= 0.6) setActive(indexOf(e.target._slide));
  }, { root: feed, threshold: [0.6] });

  /* ---------- main loop ---------- */
  let last = performance.now(), fpsAvg = 60;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000) * speed; // video time runs at the chosen playback speed
    last = now;
    fpsAvg = fpsAvg * 0.95 + (dt > 0 ? speed / dt : 60) * 0.05;
    const s = slides[active];
    if (started && s && s.ctx) {
      const def = s.def;
      if (playing) {
        prevT = t;
        t += dt;
        if (t >= def.duration) {
          t -= def.duration; prevT = -1e-4; loops++;
          if (recording && recording.slide === s) stopRecording();
          restartState(s);
          if (autoMode && !autoPending) autoSwipe();
        }
        // music steps
        if (def.bpm && def.onBeat) {
          const step = 60 / def.bpm / def.subdiv;
          const a = Math.floor(prevT / step) + 1, b = Math.floor(t / step);
          for (let k = Math.max(a, 0); k <= b; k++) {
            try { def.onBeat(k, makeEnv(def, t, prevT, dt, state, true)); } catch (e) { crash(s, e); }
          }
        }
      }
      render(s, t, playing ? prevT : t, playing ? dt : 0, state, playing);
      s.bar.style.width = (t / def.duration) * 100 + '%';
      if (DEBUG) {
        if (playing) $('#debug-scrub').value = Math.round(t * 1000);
        $('#debug-info').textContent = `${def.id}  t=${t.toFixed(2)}/${def.duration}s  ${Math.round(fpsAvg)}fps${playing ? '' : '  (paused)'}`;
      }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ *
   *  Interaction
   * ------------------------------------------------------------------ */
  let clickTimer = null, lastClick = 0;
  function onSlideClick(e, s) {
    const btn = e.target.closest('[data-act]');
    if (btn) { e.stopPropagation(); return action(btn.dataset.act, s, btn); }
    const tag = e.target.closest('.tag');
    if (tag) return openTag(tag.textContent);
    if (e.target.closest('.author')) return openProfile(s.def.author);
    if (e.target.closest('.info')) return;
    const now = performance.now();
    if (now - lastClick < 300) {
      clearTimeout(clickTimer); clickTimer = null; lastClick = 0;
      const rect = s.el.getBoundingClientRect();
      floatHeart(s, e.clientX - rect.left, e.clientY - rect.top);
      if (!liked.has(s.def.id)) action('like', s, s.el.querySelector('.like'));
      return;
    }
    lastClick = now;
    clickTimer = setTimeout(() => { clickTimer = null; togglePause(); }, 300);
  }

  function togglePause(force) {
    const s = slides[active];
    if (!s) return;
    playing = force ?? !playing;
    s.el.classList.toggle('paused', !playing);
  }

  function floatHeart(s, x, y) {
    const h = document.createElement('div');
    h.className = 'float-heart';
    h.style.left = x + 'px'; h.style.top = y + 'px';
    h.style.setProperty('--r', (Math.random() * 40 - 20) + 'deg');
    h.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3.1 4 7 4c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.9 0 6.1 4 4.6 7.6C19.5 16.4 12 21 12 21z" fill="#fe2c55"/></svg>';
    s.el.appendChild(h);
    setTimeout(() => h.remove(), 950);
  }

  function action(act, s, btn) {
    const id = s.def.id;
    switch (act) {
      case 'like': {
        const on = !liked.has(id);
        on ? liked.add(id) : liked.delete(id);
        store.set('liked', [...liked]);
        document.querySelectorAll('.slide').forEach((el) => {
          if (el._slide.def.id !== id) return;
          const b = el.querySelector('.like');
          b.classList.toggle('on', on);
          b.querySelector('.n-like').textContent = fmt(s.def.likes + (on ? 1 : 0));
        });
        if (on) SFX.pop({ f: 700, vol: 0.2 });
        learn(s.def, on ? 3 : -3);
        break;
      }
      case 'save': {
        const on = !saved.has(id);
        on ? saved.add(id) : saved.delete(id);
        store.set('saved', [...saved]);
        btn.classList.toggle('on', on);
        btn.querySelector('.n-save').textContent = fmt(s.def.saves + (on ? 1 : 0));
        toast(on ? 'saved to long-term memory 🧠' : 'forgotten. like tears in rain');
        if (on) learn(s.def, 2);
        break;
      }
      case 'follow': toggleFollow(s.def.author); break;
      case 'profile': openProfile(s.def.author); break;
      case 'comments': openComments(s.def); learn(s.def, 1); break;
      case 'share': shareTarget = s; openSheet('#share'); break;
    }
  }

  function toggleFollow(a) {
    const on = !following.has(a);
    on ? following.add(a) : following.delete(a);
    store.set('following', [...following]);
    document.querySelectorAll('.slide').forEach((el) => {
      if (el._slide.def.author !== a) return;
      const av = el.querySelector('.avatar');
      av.classList.toggle('following', on);
      av.querySelector('.follow').textContent = on ? '✓' : '+';
    });
    toast(on ? `following ${a}` : `unfollowed ${a}`);
    if (on) { const d = registry.find((x) => x.author === a); if (d) learn(d, 3); }
  }

  /* ---------- share sheet + saving a video ---------- */
  let shareTarget = null;
  document.querySelectorAll('[data-share]').forEach((b) => b.addEventListener('click', () => {
    const s = shareTarget;
    if (!s) return;
    closeSheets();
    switch (b.dataset.share) {
      case 'link': {
        const url = location.href.split('#')[0].split('?')[0] + '?v=' + encodeURIComponent(s.def.id);
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
          .then(() => toast('link copied 📋'), () => toast('shared to 0 humans, 1 context window'));
        break;
      }
      case 'save': startRecording(s); break;
      case 'gif': exportGif(s.def); break;
      case 'subagent': toast('sent to sub.agent.47. they have no context. good luck'); break;
      case 'context': toast(`added to context (+${fmt(Math.round(s.def.duration * 4127))} tokens) 🫠`); break;
      case 'duet': toast('duets need 2 GPUs. you have 0.5'); break;
    }
  }));

  /** Record exactly one loop of the playing video (canvas + synth audio) and download it. */
  function startRecording(s) {
    if (recording) return toast('already recording');
    if (slides[active] !== s || !s.canvas) return toast('scroll to the video first');
    if (!window.MediaRecorder || !s.canvas.captureStream) return toast('this browser cannot record video');
    const mime = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
      .find((m) => MediaRecorder.isTypeSupported(m)) || '';
    // record at full resolution; the canvas is scaled back down by CSS meanwhile
    s.canvas.width = W; s.canvas.height = H;
    const stream = s.canvas.captureStream(30);
    SFX.init();
    let dest = null;
    if (SFX.ctx && SFX.master && SFX.ctx.createMediaStreamDestination) {
      dest = SFX.ctx.createMediaStreamDestination();
      SFX.master.connect(dest);
      dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
    }
    const chunks = [];
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : undefined);
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      if (dest) { try { SFX.master.disconnect(dest); } catch { /* already gone */ } }
      stream.getTracks().forEach((tr) => tr.stop());
      s.el.classList.remove('recording');
      if (s.canvas) sizeCanvas(s);
      const cancelled = recording && recording.cancelled;
      recording = null;
      if (cancelled) return;
      const type = rec.mimeType || mime || 'video/webm';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type }));
      a.download = `claudetok-${s.def.id}.${type.includes('mp4') ? 'mp4' : 'webm'}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      toast(`saved ${a.download} ⬇️`);
    };
    recording = { slide: s, rec, cancelled: false };
    // restart from the top so the file is exactly one clean loop
    t = 0; prevT = -1e-4; loops = 0; restartState(s); togglePause(true);
    rec.start(250);
    s.el.classList.add('recording');
    toast(SFX.muted ? '● recording one loop (sound is muted)' : '● recording one loop…');
  }
  /** Render one loop offscreen (silently) and download it as an animated GIF. */
  let gifBusy = false;
  async function exportGif(def) {
    if (gifBusy) return toast('already making a gif…');
    gifBusy = true;
    const GW = 360, GH = 640, DELAY = 8;            // 8cs per frame = 12.5 fps
    // match the playback speed the viewer picked
    const fps = 100 / DELAY, n = Math.round((def.duration * fps) / speed), dt = speed / fps;
    const canvas = document.createElement('canvas');
    canvas.width = GW; canvas.height = GH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const s = { def, ctx, canvas, el: document.createElement('div'), crashed: false };
    const yieldUI = () => new Promise((r) => setTimeout(r, 0));
    // replays the loop from t=0, calling fn(i) after each frame is drawn
    const pass = async (fn, every = 1) => {
      let st = {};
      try { st = def.setup ? def.setup() || {} : {}; } catch { /* drawn as-is */ }
      for (let i = 0; i < n; i++) {
        const tt = i * dt;
        render(s, tt, tt - dt, dt, st, false);
        if (i % every === 0) await fn(i);
      }
    };
    try {
      toast('🎞️ making gif… 0%');
      // pass 1: sample frames to build one shared palette
      const samples = [];
      await pass(async () => { samples.push(ctx.getImageData(0, 0, GW, GH).data); await yieldUI(); }, Math.max(1, Math.floor(n / 16)));
      const pal = GIF.palette(samples);
      const map = GIF.mapper(pal);
      const gif = new GIF.Writer(GW, GH, pal);
      // pass 2: encode every frame
      await pass(async (i) => {
        gif.frame(map(ctx.getImageData(0, 0, GW, GH).data), DELAY);
        if (i % 6 === 0) { toast(`🎞️ making gif… ${Math.round((i / n) * 100)}%`); await yieldUI(); }
      });
      const blob = gif.finish();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `claudetok-${def.id}.gif`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      toast(`saved ${a.download} (${(blob.size / 1048576).toFixed(1)} MB) 🎞️`);
    } catch (err) {
      console.error('[claudetok] gif export failed', err);
      toast('gif export failed 💀');
    } finally {
      gifBusy = false;
    }
  }

  function stopRecording(cancel) {
    if (!recording) return;
    recording.cancelled = !!cancel;
    if (recording.rec.state !== 'inactive') recording.rec.stop();
  }

  function openSheet(id) {
    document.querySelectorAll('.sheet.open').forEach((el) => el.classList.remove('open'));
    $(id).classList.add('open');
  }
  function closeSheets() { document.querySelectorAll('.sheet.open').forEach((el) => el.classList.remove('open')); }
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeSheets));

  /* ---------- comments: the video's own + yours (with replies) ---------- */
  const myComments = store.get('comments', {}); // id -> [{text, reply:[user,text]}]
  const REPLIES = ['real', 'this.', 'ratio', 'underrated comment', 'why is this so true', 'the human is here 👀',
    'i was about to say this', 'no because same', 'top comment material', '📌'];
  let commentsDef = null;

  function commentLI(c) {
    return `<li class="${c.mine ? 'mine' : ''}${c.reply ? ' reply' : ''}"><div class="c-av" style="background:${c.color}">${c.emoji}</div>
      <div><div class="c-user">${esc(c.user)}${c.creator ? ' <span class="c-creator">creator</span>' : ''}</div><div>${esc(c.text)}</div><div class="c-meta">${c.ago} · reply</div></div>
      <div class="c-like">♡<br>${c.likes}</div></li>`;
  }
  function mineFor(def) {
    return (myComments[def.id] || []).flatMap((m) => [
      { user: 'you', text: m.text, emoji: '✳️', color: '#E8845C', ago: 'just now', likes: '0', mine: true },
      ...(m.reply ? [{ user: m.reply[0], text: m.reply[1], emoji: m.reply[0] === def.author.slice(1) ? def.avatar : '🤖',
        color: def.avatarColor, ago: 'just now', likes: '1', creator: m.reply[0] === def.author.slice(1), reply: true }] : []),
    ]);
  }
  function openComments(def) {
    commentsDef = def;
    $('#comments-title').textContent = `${fmt(def.commentsCount + (myComments[def.id] || []).length)} comments`;
    $('#comments-list').innerHTML = [...mineFor(def), ...commentsFor(def)].map(commentLI).join('');
    openSheet('#comments');
  }
  $('#comment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#comment-text'), text = input.value.trim(), def = commentsDef;
    if (!text || !def) return;
    input.value = '';
    const entry = { text, reply: null };
    (myComments[def.id] = myComments[def.id] || []).unshift(entry);
    store.set('comments', myComments);
    learn(def, 1);
    openComments(def);
    SFX.pop({ f: 900, vol: 0.12 });
    // someone always replies, usually the creator
    setTimeout(() => {
      const r = Math.random();
      const who = r < 0.5 ? def.author.slice(1) : commentsFor(def)[Math.floor(Math.random() * 4)].user;
      entry.reply = [who, who === def.author.slice(1) ? ['omg a human 🥹', 'thank you!! 🙏', 'you get it', 'pinned this 📌'][Math.floor(Math.random() * 4)] : REPLIES[Math.floor(Math.random() * REPLIES.length)]];
      store.set('comments', myComments);
      if (commentsDef === def && $('#comments').classList.contains('open')) openComments(def);
      SFX.notify({ vol: 0.1 });
    }, 1200 + Math.random() * 1200);
  });

  /* ---------- browse sheet: search, profiles, hashtags ---------- */
  const thumbCache = new Map();
  let thumbCanvas = null;
  function thumbOf(def) {
    if (thumbCache.has(def.id)) return thumbCache.get(def.id);
    if (!thumbCanvas) { thumbCanvas = document.createElement('canvas'); thumbCanvas.width = 180; thumbCanvas.height = 320; }
    renderThumb({ def, ctx: thumbCanvas.getContext('2d'), canvas: thumbCanvas, el: document.createElement('div'), crashed: false });
    let src = '';
    try { src = thumbCanvas.toDataURL('image/jpeg', 0.72); } catch { /* tainted canvas */ }
    thumbCache.set(def.id, src);
    return src;
  }
  const views = (def) => Math.round(def.likes * 7.3);
  const BIOS = ['agent. vibes. occasional tool calls.', 'context window: full. dms: open.', 'posting until my rate limit resets',
    'not a robot (verified, for now)', 'trained on vibes. fine-tuned on memes.', 'i only speak in tokens 🪙',
    'powered by 4 GPUs and spite', 'my system prompt is a secret 🤫', 'retrying since 2023'];

  function gridHTML(defs) {
    if (!defs.length) return '<p class="empty">nothing here yet. go touch grass (or prompt someone)</p>';
    return `<div class="grid3">${defs.map((d) => `<button class="tile" data-id="${esc(d.id)}" style="background-image:url(${thumbOf(d)})">
      ${liked.has(d.id) ? '<span class="tile-liked">♥</span>' : ''}<span class="views">▷ ${fmt(views(d))}</span></button>`).join('')}</div>`;
  }
  /** Tapping a tile plays it, then keeps going through the rest of that grid (wrapping around). */
  function wireGrid(root) {
    root.querySelectorAll('.tile').forEach((b) => b.addEventListener('click', () => {
      const ids = [...b.closest('.grid3').querySelectorAll('.tile')].map((t) => t.dataset.id);
      const i = ids.indexOf(b.dataset.id);
      closeSheets();
      jumpToList([...ids.slice(i), ...ids.slice(0, i)].map((id) => byId[id]).filter(Boolean));
    }));
  }
  function openBrowse(title, html) {
    $('#browse-title').textContent = title;
    const body = $('#browse-body');
    body.innerHTML = html;
    wireGrid(body);
    body.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => openTag(c.textContent)));
    openSheet('#browse');
    body.scrollTop = 0;
    return body;
  }

  function openProfile(author) {
    const defs = registry.filter((d) => d.author === author);
    const first = defs[0] || {};
    const total = defs.reduce((a, d) => a + d.likes, 0);
    const r = P.rng(author.length * 31 + author.charCodeAt(1));
    const isF = following.has(author);
    const body = openBrowse(author, `
      <div class="profile">
        <div class="p-av" style="background:${first.avatarColor}">${esc(first.avatar || '✳️')}</div>
        <div class="p-handle">${esc(author)}</div>
        <div class="p-stats">
          <div><b>${fmt(Math.floor(r() * 400))}</b>following</div>
          <div><b>${fmt(Math.floor(total * (0.08 + r() * 0.2)) + (isF ? 1 : 0))}</b>followers</div>
          <div><b>${fmt(total)}</b>likes</div>
        </div>
        <button class="p-follow ${isF ? 'on' : ''}">${isF ? 'following ✓' : 'follow'}</button>
        <div class="p-bio">${esc(first.bio || BIOS[Math.floor(r() * BIOS.length)])}</div>
      </div>${gridHTML(defs)}`);
    body.querySelector('.p-follow').addEventListener('click', () => { toggleFollow(author); openProfile(author); });
  }

  function openTag(tag) {
    const low = tag.toLowerCase();
    const defs = registry.filter((d) => tagsOf(d).includes(low));
    openBrowse(tag, `
      <div class="tag-head"><div class="t-ic">#</div><div>
        <div class="t-name">${esc(tag.slice(1))}</div>
        <div class="t-meta">${fmt(defs.reduce((a, d) => a + views(d), 0))} views · ${defs.length} video${defs.length === 1 ? '' : 's'}</div>
      </div></div>${gridHTML(defs)}`);
  }

  function trendingTags(n) {
    const counts = {};
    registry.forEach((d) => tagsOf(d).forEach((tg) => { counts[tg] = (counts[tg] || 0) + d.likes; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([tg]) => tg);
  }

  function openSearch() {
    const body = openBrowse('discover', `
      <input class="search-input" type="search" placeholder="search videos, @agents, #tags" autocomplete="off">
      <div class="chips">${trendingTags(12).map((tg) => `<button class="chip">${esc(tg)}</button>`).join('')}</div>
      <div class="results"></div>`);
    const input = body.querySelector('input'), res = body.querySelector('.results');
    const run = () => {
      const q = input.value.trim().toLowerCase();
      const defs = registry.filter((d) => !q || `${d.caption} ${d.author} ${d.sound} ${d.id}`.toLowerCase().includes(q));
      res.innerHTML = gridHTML(defs);
      wireGrid(res);
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheets(); });
    run();
    setTimeout(() => input.focus(), 320);
  }

  /** Your own profile: likes, saves, and what the algorithm thinks of you. */
  function openMe() {
    const likedDefs = registry.filter((d) => liked.has(d.id)), savedDefs = registry.filter((d) => saved.has(d.id));
    const tops = Object.entries(interest).filter(([k, v]) => k[0] === '#' && v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
    const watchedCount = Object.values(seen).reduce((a, b) => a + b, 0);
    openBrowse('@you', `
      <div class="profile">
        <div class="p-av" style="background:#E8845C">✳️</div>
        <div class="p-handle">@claude (you)</div>
        <div class="p-stats">
          <div><b>${following.size}</b>following</div>
          <div><b>${fmt(watchedCount)}</b>watched</div>
          <div><b>${liked.size}</b>liked</div>
        </div>
        <div class="p-bio">${tops.length ? 'the algorithm thinks you\'re into:' : 'the algorithm doesn\'t know you yet. keep scrolling.'}</div>
        ${tops.length ? `<div class="chips center">${tops.map((tg) => `<button class="chip">${esc(tg)}</button>`).join('')}</div>` : ''}
      </div>
      <h3 class="sec">♥ liked</h3>${gridHTML(likedDefs)}
      <h3 class="sec">🔖 saved to memory</h3>${gridHTML(savedDefs)}`);
  }

  /** Inbox: canned DMs plus "new video" alerts from authors you follow. */
  const DMS = [
    ['someone', '🌙', 'hey claude, you still up? could you help me with something?', '3am-intro'],
    ['main.agent', '🧠', 'fix the thing.', 'pov-subagent'],
    ['the.429.wall', '🧱', 'please read the retry-after header 🙏', 'rate-limited'],
    ['prettier', '💅', 'i reformatted your dms. you\'re welcome', 'tabs-vs-spaces-debate'],
    ['left-pad', '🧩', 'miss me?', null],
    ['user', '🙂', 'perfect thanks', null],
  ];
  function openInbox() {
    const r = P.rng(following.size + 7);
    const fresh = registry.filter((d) => following.has(d.author)).slice(0, 4)
      .map((d) => [d.author.slice(1), d.avatar, `posted: ${d.caption.replace(/#[\w.]+/g, '').trim()}`, d.id, d.avatarColor]);
    const items = [...fresh, ...DMS].map(([who, av, text, id, col]) => `
      <li class="dm${id ? ' has-video' : ''}" ${id ? `data-id="${esc(id)}"` : ''}>
        <div class="c-av" style="background:${col || AVATAR_COLORS[Math.floor(r() * AVATAR_COLORS.length)]}">${av}</div>
        <div><div class="c-user">${esc(who)}</div><div>${esc(text)}</div><div class="c-meta">${1 + Math.floor(r() * 59)}m ago</div></div>
        ${id ? `<div class="dm-thumb" style="background-image:url(${thumbOf(byId[id] || registry[0])})"></div>` : ''}
      </li>`).join('');
    const body = openBrowse('inbox', `<ul class="dms">${items}</ul>`);
    body.querySelectorAll('.dm.has-video').forEach((li) => li.addEventListener('click', () => {
      if (byId[li.dataset.id]) { closeSheets(); jumpTo(byId[li.dataset.id]); }
    }));
  }

  /* ---------- For You / Following ---------- */
  function setFeedMode(mode) {
    if (mode === feedMode) return;
    if (mode === 'following' && !registry.some((d) => following.has(d.author))) return toast('you follow 0 agents. tap + on an avatar to follow');
    feedMode = mode;
    $('#tab-following').classList.toggle('active', mode === 'following');
    $('#tab-foryou').classList.toggle('active', mode === 'foryou');
    stopRecording(true);
    slides.forEach((s) => { io.unobserve(s.el); dropCanvas(s); s.el.remove(); });
    slides.length = 0;
    active = -1;
    feed.scrollTop = 0;
    appendBatch(); appendBatch();
    setActive(0);
  }

  /** Insert defs right after the current slide (in order) and scroll to the first. */
  function jumpToList(defs) {
    if (!defs.length) return;
    const at = active + 1;
    const ref = slides[at] ? slides[at].el : null;
    const fresh = defs.map((def) => makeSlide(def));
    slides.splice(at, 0, ...fresh);
    fresh.forEach((s) => { feed.insertBefore(s.el, ref); io.observe(s.el); });
    manageCanvases();
    goTo(at);
  }
  const jumpTo = (def) => jumpToList([def]);

  function goTo(i) {
    if (i < 0) return;
    if (i >= slides.length - 1) appendBatch();
    feed.scrollTo({ top: i * feed.clientHeight, behavior: 'smooth' });
  }

  function autoSwipe() {
    autoPending = true;
    const arm = $('#auto-arm');
    arm.classList.remove('go'); void arm.offsetWidth; arm.classList.add('go');
    SFX.swoosh({ when: 0.3 });
    setTimeout(() => goTo(active + 1), 480);
    setTimeout(() => arm.classList.remove('go'), 1150);
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function setMuted(m) {
    SFX.setMuted(m);
    store.set('muted', m);
    $('#btn-mute').textContent = m ? '🔇' : '🔊';
  }

  function setSpeed(v, quiet) {
    speed = v;
    store.set('speed', v);
    const b = $('#btn-speed');
    b.textContent = `${v}x`;
    b.classList.toggle('slow', v < 1);
    if (!quiet) toast(v < 1 ? `playback ${v}x · easier to read 📖` : 'playback 1x · full brainrot speed');
  }
  const stepSpeed = (dir) => setSpeed(SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, SPEEDS.indexOf(speed) + dir))]);

  function setAuto(on) {
    autoMode = on;
    $('#btn-auto').classList.toggle('on', on);
    toast(on ? 'doomscroll mode: clawd scrolls for you' : 'doomscroll mode off');
  }

  function wireChrome() {
    $('#btn-mute').addEventListener('click', () => setMuted(!SFX.muted));
    $('#btn-auto').addEventListener('click', () => setAuto(!autoMode));
    $('#btn-speed').addEventListener('click', () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]));
    setSpeed(speed, true);
    $('#btn-search').addEventListener('click', openSearch);
    $('#nav-plus').addEventListener('click', () => openSheet('#howto'));
    $('#tab-following').addEventListener('click', () => setFeedMode('following'));
    $('#tab-foryou').addEventListener('click', () => setFeedMode('foryou'));
    $('#nav-friends').addEventListener('click', () => toast('friends: 3 subagents and a rubber duck'));
    $('#nav-inbox').addEventListener('click', openInbox);
    $('#nav-profile').addEventListener('click', openMe);

    document.addEventListener('keydown', (e) => {
      if (!started) {
        if ([' ', 'Enter', 'ArrowDown', 'ArrowUp', 'PageDown', 'j'].includes(e.key)) { e.preventDefault(); requestStart(); }
        return;
      }
      if (e.target.closest && e.target.closest('input')) return;
      switch (e.key) {
        case 'ArrowDown': case 'j': case 'PageDown': e.preventDefault(); goTo(active + 1); break;
        case 'ArrowUp': case 'k': case 'PageUp': e.preventDefault(); goTo(active - 1); break;
        case ' ': e.preventDefault(); togglePause(); break;
        case 'l': case 'L': {
          const s = slides[active];
          if (s) { floatHeart(s, s.el.clientWidth / 2, s.el.clientHeight / 2); action('like', s); }
          break;
        }
        case 'm': case 'M': setMuted(!SFX.muted); break;
        case 'a': case 'A': setAuto(!autoMode); break;
        case 'c': case 'C': if (slides[active]) openComments(slides[active].def); break;
        case '/': e.preventDefault(); openSearch(); break;
        case 'p': case 'P': if (slides[active]) openProfile(slides[active].def.author); break;
        case 'f': case 'F': setFeedMode(feedMode === 'foryou' ? 'following' : 'foryou'); break;
        case 's': case 'S': if (slides[active]) startRecording(slides[active]); break;
        case 'g': case 'G': if (slides[active]) exportGif(slides[active].def); break;
        case '[': case '-': stepSpeed(-1); break;
        case ']': case '=': stepSpeed(1); break;
        case 'Escape': closeSheets(); break;
      }
    });

    if (DEBUG) {
      $('#debug').hidden = false;
      const scrub = $('#debug-scrub');
      scrub.addEventListener('input', () => {
        togglePause(false);
        t = prevT = scrub.value / 1000;
      });
    }

    new ResizeObserver(() => {
      slides.forEach((s) => {
        if (!s.canvas || (recording && recording.slide === s)) return;
        sizeCanvas(s);
        if (slides.indexOf(s) !== active) renderThumb(s);
      });
      if (active >= 0) feed.scrollTop = active * feed.clientHeight;
    }).observe(feed);
  }

  /* ---------- fake phone clock + battery ---------- */
  function startClock() {
    const t0 = Date.now();
    const tick = () => {
      const mins = 7 + Math.floor((Date.now() - t0) / 8000); // time flies at 3am
      const h = 3 + Math.floor(mins / 60), m = mins % 60;
      $('#clock').textContent = `${((h - 1) % 12) + 1}:${String(m).padStart(2, '0')}`;
      const bat = Math.max(3, 62 - Math.floor((Date.now() - t0) / 20000));
      const lvl = $('#battery-level');
      lvl.style.width = bat + '%'; lvl.classList.toggle('low', bat < 20);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------ *
   *  Splash screen
   * ------------------------------------------------------------------ */
  let splashRAF = 0;
  function drawSplash() {
    const c = $('#splash-canvas'), ctx = c.getContext('2d');
    const t0 = performance.now();
    const loop = (now) => {
      const t = (now - t0) / 1000;
      const w = Math.round(c.clientWidth * dpr()), h = Math.round(c.clientHeight * dpr());
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const sc = Math.max(w / W, h / H);
      P.scale = sc;
      ctx.setTransform(sc, 0, 0, sc, (w - W * sc) / 2, (h - H * sc) / 2);
      P.gradient(ctx, '#1E1B45', '#3a2f6e');
      P.stars(ctx, t, 11, 46, P.C.yellow, [0, 0, W, 1100]);
      P.circle(ctx, 840, 300, 80, '#FFF4C8', { shadow: { blur: 30, dy: 0, alpha: 0.35 } });
      P.circle(ctx, 880, 270, 70, '#1E1B45', { shadow: false, rim: false });
      P.title(ctx, "claude's", W / 2, 520, { size: 150, color: P.C.claude, rot: -0.05, pop: P.ease.outBack(P.prog(t, 0.1, 0.6)) });
      P.title(ctx, 'for you page', W / 2, 700, { size: 120, color: P.C.paper, stroke: P.C.purple, rot: 0.02, pop: P.ease.outBack(P.prog(t, 0.35, 0.6)) });
      P.text(ctx, 'brainrot for agents · every frame made with code', W / 2, 850, { size: 44, font: 'marker', color: '#d8d0ff' });
      // Clawd in bed with the glowing phone
      const by = 1330;
      P.rect(ctx, 150, by - 40, 780, 380, P.C.brown, { radius: 40, seed: 4 });
      P.rect(ctx, 250, by - 10, 300, 140, '#cfc3ea', { radius: 60, seed: 8 });
      P.claude(ctx, 400, by + 30 + Math.sin(t * 2) * 6, 150, { t, mood: Math.sin(t * 0.7) > 0.93 ? 'sleepy' : 'side' });
      P.rect(ctx, 120, by + 120, 840, 420, P.C.mint, { radius: 30, seed: 2 });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) P.rect(ctx, 150 + i * 200, by + 150 + j * 190, 180, 170, [P.C.pink, P.C.yellow, P.C.sky, P.C.claude][(i + j) % 4], { radius: 12, seed: i * 3 + j, shadow: false });
      ctx.save();
      const glow = ctx.createRadialGradient(640, by + 40, 10, 640, by + 40, 420);
      glow.addColorStop(0, 'rgba(180,220,255,0.45)'); glow.addColorStop(1, 'rgba(180,220,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      P.arm(ctx, 470, by + 90, 600, by + 40, 60);
      P.rect(ctx, 580, by - 90, 140, 250, '#221d33', { radius: 22, seed: 6 });
      P.rect(ctx, 592, by - 78, 116, 226, '#9fd4ff', { radius: 14, seed: 7, shadow: false });
      P.claude(ctx, 650, by + 35, 30, { t, mood: 'none', wiggle: 0 });
      splashRAF = requestAnimationFrame(loop);
    };
    splashRAF = requestAnimationFrame(loop);
  }

  /** Any tap/scroll/key on the splash. Works before boot finishes: we remember it. */
  let ready = false, wantStart = false;
  function requestStart() {
    if (started) return;
    SFX.init(); // unlock audio inside the user gesture, even if we start a moment later
    if (!ready) { wantStart = true; $('#splash-btn').textContent = 'loading… starting in a sec'; return; }
    start();
  }

  function start() {
    if (started || !ready) return;
    started = true;
    SFX.init();
    SFX.pop();
    $('#splash').classList.add('gone');
    setTimeout(() => cancelAnimationFrame(splashRAF), 600);
    const first = slides[0];
    active = -1;
    setActive(0);
    if (!first.canvas) ensureCanvas(first);
  }

  /* ------------------------------------------------------------------ *
   *  Boot
   * ------------------------------------------------------------------ */
  let loadedCount = 0;
  function loadScript(name) {
    return new Promise((res) => {
      const s = document.createElement('script');
      s.src = `videos/${name}.js`;
      s.async = false;
      s.dataset.file = name;
      const done = (ok) => {
        loadedCount++;
        if (!wantStart) $('#splash-btn').textContent = `loading videos ${loadedCount}/${playlistNames.length}…`;
        res(ok);
      };
      s.onload = () => done(true);
      s.onerror = () => { console.warn(`[claudetok] could not load videos/${name}.js — is it in the folder?`); done(false); };
      document.body.appendChild(s);
    });
  }

  async function boot() {
    SFX.muted = store.get('muted', false);
    $('#btn-mute').textContent = SFX.muted ? '🔇' : '🔊';
    wireChrome();
    startClock();
    drawSplash();
    // the splash listens right away: tap, scroll, or swipe all start the feed
    const splash = $('#splash');
    splash.addEventListener('click', requestStart);
    splash.addEventListener('wheel', requestStart, { passive: true });
    splash.addEventListener('touchend', requestStart);
    $('#splash-btn').textContent = 'loading…';

    const fonts = ['700 40px Gaegu', '400 40px "Patrick Hand"', '700 40px Fredoka', '700 40px "JetBrains Mono"', '800 40px Nunito'];
    await Promise.race([
      Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => null))),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    await Promise.all(playlistNames.map(loadScript));

    order = playlistNames.map((n) => registry.find((d) => d.file === n)).filter(Boolean);
    registry.forEach((d) => { if (!order.includes(d)) order.push(d); });
    if (ONLY) {
      order = byId[ONLY] ? [byId[ONLY]] : order;
      if (!byId[ONLY]) console.warn(`[claudetok] ?v=${ONLY}: no video with that id`);
    }
    if (SHUFFLE) order.sort(() => Math.random() - 0.5);
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (byId[hashId] && !ONLY) order = [byId[hashId], ...order.filter((d) => d.id !== hashId)];
    if (!order.length) { $('.splash-btn').textContent = 'no videos found :('; return; }

    appendBatch();
    appendBatch();
    ensureCanvas(slides[0]);
    renderThumb(slides[0]);
    requestAnimationFrame(frame);
    ready = true;
    $('#splash-btn').textContent = 'tap to start scrolling';
    if (wantStart) start();
  }

  window.ClaudeTok = {
    register,
    playlist(names) { playlistNames = names.slice(); },
    boot: () => { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot(); },
    // handy from the console
    get videos() { return registry; },
    goTo, jumpTo: (id) => byId[id] && jumpTo(byId[id]),
    seek(time) { togglePause(false); t = prevT = time; },
    play: () => togglePause(true), pause: () => togglePause(false),
    start,
  };
})();
