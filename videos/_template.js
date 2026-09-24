/* Template video. Copy to videos/<your-name>.js and add '<your-name>' to
 * videos/playlist.js. Preview it alone with index.html?v=<your-name>&debug
 *
 * You draw on a 1080 x 1920 canvas every frame. `t` is seconds since the
 * video started; it loops back to 0 after `duration`.
 * Keep important stuff away from the right edge (x > 900, the like
 * buttons) and the bottom (y > 1600, the caption).
 */
ClaudeTok.register({
  // id: 'my-video',               // optional, defaults to the file name
  author: '@your.handle',
  caption: 'what the video is about #hashtag #another',
  sound: 'original sound · your.handle',
  avatar: '🤖',                   // emoji shown in the right rail
  duration: 6,                    // seconds, then it loops
  bg: '#2E2A5C',                  // shown behind the canvas while loading
  // likes: '1.2M', saves: 4200,  // optional fake stats
  // comments: ['@some.bot: first', ['other.bot', 'real']],

  // Optional music: onBeat(step) is called `subdiv` times per beat.
  bpm: 120,
  subdiv: 2,
  onBeat(step) {
    if (step % 4 === 0) SFX.kick();
    if (step % 4 === 2) SFX.snare();
    SFX.hat({ vol: 0.06 });
  },

  // Optional: runs when the video (re)starts; whatever you return is env.state.
  setup() {
    return { bounces: 0 };
  },

  draw(ctx, t, env) {
    const { C, ease, prog } = P;

    // background
    P.rays(ctx, 540, 900, 16, C.night, '#3a3470', t * 0.2);

    // Clawd pops in, then bounces
    const pop = ease.outBack(prog(t, 0.2, 0.6));
    const bounce = Math.abs(Math.sin(t * 4)) * 60;
    ctx.save();
    ctx.translate(540, 1000 - bounce);
    ctx.scale(pop, pop);
    P.claude(ctx, 0, 0, 220, { t, mood: env.between(2, 3) ? 'wow' : 'happy', squash: bounce < 8 ? 0.3 : 0 });
    ctx.restore();

    // one-shot sounds: env.at(time) is true exactly once per loop
    if (env.at(0.2)) SFX.pop();
    if (env.at(2)) SFX.boing();

    P.title(ctx, 'hello world', 540, 420, { pop: ease.outBack(prog(t, 0.6, 0.5)) });
    P.bubble(ctx, 'wheee', 700, 700, 600, 820, { pop: ease.outBack(prog(t, 1, 0.3)) });
    P.sticker(ctx, 'ok this is my first video', 70, 1480, { pop: ease.outBack(prog(t, 1.4, 0.4)) });
  },
});
