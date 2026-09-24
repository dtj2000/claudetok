/* Smoke test: runs every video's setup/draw/onBeat across its whole
 * duration against a fake canvas, to catch crashes without a browser.
 *
 *   node tools/smoke.js            # all videos in playlist.js
 *   node tools/smoke.js my-video   # just one
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const fakeCtx = () => {
  const noop = () => {};
  const grad = { addColorStop: noop };
  const target = {
    measureText: (s) => ({ width: String(s).length * 30 }),
    createLinearGradient: () => grad, createRadialGradient: () => grad, createConicGradient: () => grad,
    createPattern: () => ({}), getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    isPointInPath: () => false, getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    canvas: { width: 1080, height: 1920 },
  };
  return new Proxy(target, {
    get: (o, k) => (k in o ? o[k] : noop),
    set: (o, k, v) => { o[k] = v; return true; },
  });
};

const registered = [];
const sandbox = {
  console, Math, Date, JSON, Array, Object, String, Number, Promise, Set, Map, Symbol, Uint8ClampedArray, Float32Array,
  document: { currentScript: null, createElement: () => ({ getContext: () => fakeCtx(), width: 0, height: 0 }) },
  performance: { now: () => Date.now() },
};
sandbox.window = sandbox;
sandbox.OffscreenCanvas = function () { return { getContext: () => fakeCtx(), width: 0, height: 0 }; };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js/lib.js'), 'utf8'), sandbox, { filename: 'lib.js' });

let names = [];
sandbox.ClaudeTok = { register: (d) => registered.push(d), playlist: (n) => { names = n; } };
vm.runInContext(fs.readFileSync(path.join(root, 'videos/playlist.js'), 'utf8'), sandbox);
if (process.argv[2]) names = [process.argv[2]];

let failed = 0;
for (const name of names) {
  const file = path.join(root, 'videos', name + '.js');
  if (!fs.existsSync(file)) { console.log(`✗ ${name}: file missing`); failed++; continue; }
  const before = registered.length;
  try {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: name + '.js' });
  } catch (e) { console.log(`✗ ${name}: load error\n   ${e.stack.split('\n').slice(0, 3).join('\n   ')}`); failed++; continue; }
  const def = registered[before];
  if (!def || typeof def.draw !== 'function') { console.log(`✗ ${name}: no ClaudeTok.register({draw}) call`); failed++; continue; }
  const dur = def.duration || 8;
  try {
    const ctx = fakeCtx();
    let state = def.setup ? def.setup() || {} : {};
    let prev = -1e-4;
    const dt = 1 / 30;
    for (let t = 0; t <= dur; t += dt) {
      const env = {
        t, dt, p: t / dur, W: 1080, H: 1920, P: sandbox.P, SFX: sandbox.SFX, state, loop: 0, live: true,
        at: (x) => prev < x && t >= x, between: (a, b) => t >= a && t < b,
      };
      if (def.bpm && def.onBeat) {
        const step = 60 / def.bpm / (def.subdiv || 2);
        for (let k = Math.max(0, Math.floor(prev / step) + 1); k <= Math.floor(t / step); k++) def.onBeat(k, env);
      }
      def.draw(ctx, t, env);
      prev = t;
    }
    console.log(`✓ ${name} (${dur}s)`);
  } catch (e) {
    console.log(`✗ ${name}: runtime error\n   ${e.stack.split('\n').slice(0, 4).join('\n   ')}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
