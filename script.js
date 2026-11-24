const $ = id => document.getElementById(id);
const W = 80, H = 50, CS = 10;
const ctx = $('grid').getContext('2d'), cctx = $('chart').getContext('2d');
let grid = Life.create(W, H), rule = Life.parseRule('B3/S23');
let playing = false, gen = 0, pops = [], seen = new Map(), period = null, peak = 0, extinct = false, note = '', lastTick = 0;

for (const [name, r] of Object.entries(Life.RULES)) $('ruleSel').add(new Option(`${name} (${r})`, r));
for (const name of Object.keys(Life.PATTERNS)) $('patSel').add(new Option(name, name));

function resetHistory() {
  gen = 0; pops = [Life.population(grid)]; peak = pops[0]; extinct = false; period = null;
  seen = new Map([[Life.hash(grid), 0]]); refresh();
}
function advance() {
  grid = Life.step(grid, rule, $('wrap').checked); gen++; note = '';
  const p = Life.population(grid), h = Life.hash(grid);
  pops.push(p); peak = Math.max(peak, p);
  if (!period && seen.has(h)) period = {from: seen.get(h), len: gen - seen.get(h)};
  if (seen.size > 5000) seen.clear();
  seen.set(h, gen);
  if (p === 0) { extinct = true; setPlaying(false); }
  refresh();
}
function setPlaying(on) { playing = on; $('play').textContent = on ? 'Pause' : 'Play'; }

function drawGrid() {
  ctx.fillStyle = '#18202b'; ctx.fillRect(0, 0, W * CS, H * CS);
  ctx.fillStyle = '#5fc48a';
  for (let i = 0; i < grid.c.length; i++)
    if (grid.c[i]) ctx.fillRect((i % W) * CS + 1, ((i / W) | 0) * CS + 1, CS - 1, CS - 1);
}
function drawChart() {
  const cw = 800, ch = 150, padL = 44, n = Math.min(pops.length, 400), start = pops.length - n;
  const top = Math.max(10, Math.max(...pops.slice(start)) * 1.1), span = Math.max(n - 1, 100);
  cctx.fillStyle = '#18202b'; cctx.fillRect(0, 0, cw, ch);
  cctx.strokeStyle = '#2a3544'; cctx.fillStyle = '#8b98a8'; cctx.font = '11px sans-serif'; cctx.lineWidth = 1;
  for (const f of [0, 0.5, 1]) {
    const y = ch - 14 - f * (ch - 28);
    cctx.beginPath(); cctx.moveTo(padL, y); cctx.lineTo(cw - 6, y); cctx.stroke();
    cctx.fillText(Math.round(f * top), 4, y + 4);
  }
  cctx.strokeStyle = '#5fc48a'; cctx.lineWidth = 2; cctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = padL + i / span * (cw - padL - 6), y = ch - 14 - pops[start + i] / top * (ch - 28);
    i ? cctx.lineTo(x, y) : cctx.moveTo(x, y);
  }
  cctx.stroke();
}
function refresh() {
  drawGrid(); drawChart();
  const p = pops[pops.length - 1];
  $('c-gen').textContent = gen; $('c-pop').textContent = p;
  $('c-den').textContent = (p / grid.c.length * 100).toFixed(1) + '%'; $('c-peak').textContent = peak;
  let s;
  if (extinct) s = `Extinct at generation ${gen}.`;
  else if (period) s = period.len === 1 ? `Stable since generation ${period.from}.`
    : `Repeating with period ${period.len} (first seen at generation ${period.from}).`;
  else if (gen === 0) s = note || 'Draw cells or load a pattern, then press Play.';
  else s = 'Evolving.';
  $('status').textContent = s;
}

// editing: click toggles, drag paints with the state the first cell flipped to
let painting = null;
const cv = $('grid');
function cellAt(e) {
  const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * W), y = Math.floor((e.clientY - r.top) / r.height * H);
  return x < 0 || y < 0 || x >= W || y >= H ? -1 : y * W + x;
}
function paint(c) { if (c >= 0 && grid.c[c] !== painting) { grid.c[c] = painting; resetHistory(); } }
cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); const c = cellAt(e); if (c < 0) return; painting = grid.c[c] ? 0 : 1; paint(c); };
cv.onpointermove = e => { if (painting !== null) paint(cellAt(e)); };
cv.onpointerup = () => painting = null;

$('play').onclick = () => setPlaying(!playing);
$('step').onclick = () => { setPlaying(false); advance(); };
$('clear').onclick = () => { setPlaying(false); grid = Life.create(W, H); resetHistory(); };
$('random').onclick = () => {
  const d = $('dens').value / 100;
  grid = Life.create(W, H); for (let i = 0; i < grid.c.length; i++) grid.c[i] = Math.random() < d ? 1 : 0;
  resetHistory();
};
$('dens').oninput = () => $('o-dens').textContent = $('dens').value + '%';
$('speed').oninput = () => $('o-speed').textContent = $('speed').value + '/s';
$('wrap').onchange = () => { seen = new Map([[Life.hash(grid), gen]]); period = null; };
$('patSel').onchange = () => {
  const name = $('patSel').value; if (!name) return;
  const rows = Life.PATTERNS[name];
  setPlaying(false); grid = Life.create(W, H);
  Life.stamp(grid, rows, (W - rows[0].length) >> 1, (H - rows.length) >> 1);
  note = `Loaded ${name}.`; resetHistory(); $('patSel').selectedIndex = 0;
};
function applyRule(text) {
  const r = Life.parseRule(text);
  $('ruleText').classList.toggle('bad', !r);
  if (!r) return;
  rule = r; seen = new Map([[Life.hash(grid), gen]]); period = null; refresh();
}
$('ruleSel').onchange = () => { $('ruleText').value = $('ruleSel').value; applyRule($('ruleSel').value); };
$('ruleText').oninput = () => applyRule($('ruleText').value);
document.addEventListener('keydown', e => {
  if (e.target.matches('input, select')) return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  if (e.key === 'n') { setPlaying(false); advance(); }
});

function loop(ts) {
  if (playing && ts - lastTick >= 1000 / $('speed').value) { lastTick = ts; advance(); }
  requestAnimationFrame(loop);
}
$('ruleSel').value = 'B3/S23';
resetHistory(); requestAnimationFrame(loop);
