// Cellular automaton engine (no DOM). Works in the browser and in Node for testing.
const Life = (() => {
  const create = (w, h) => ({w, h, c: new Uint8Array(w * h)});

  // "B3/S23" -> birth/survival lookup tables indexed by neighbour count 0..8
  function parseRule(text) {
    const m = /^\s*B([0-8]*)\s*\/\s*S([0-8]*)\s*$/i.exec(text);
    if (!m) return null;
    const b = Array(9).fill(0), s = Array(9).fill(0);
    for (const d of m[1]) b[+d] = 1;
    for (const d of m[2]) s[+d] = 1;
    return {b, s, text: `B${m[1]}/S${m[2]}`};
  }

  function step(g, rule, wrap) {
    const {w, h, c} = g, out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            let nx = x + dx, ny = y + dy;
            if (wrap) { nx = (nx + w) % w; ny = (ny + h) % h; }
            else if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            k += c[ny * w + nx];
          }
        }
        out[y * w + x] = c[y * w + x] ? rule.s[k] : rule.b[k];
      }
    }
    return {w, h, c: out};
  }

  const population = g => g.c.reduce((a, v) => a + v, 0);

  function hash(g) {            // FNV-1a, used to spot repeating states
    let x = 2166136261;
    for (let i = 0; i < g.c.length; i++) x = Math.imul(x ^ g.c[i], 16777619);
    return x >>> 0;
  }

  function stamp(g, rows, ox, oy) {
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const gx = ox + x, gy = oy + y;
      if (ch === 'O' && gx >= 0 && gy >= 0 && gx < g.w && gy < g.h) g.c[gy * g.w + gx] = 1;
    }));
  }

  const PATTERNS = {
    'Glider': ['.O.', '..O', 'OOO'],
    'Blinker': ['OOO'],
    'Block': ['OO', 'OO'],
    'Lightweight spaceship': ['.O..O', 'O....', 'O...O', 'OOOO.'],
    'Pulsar': ['..OOO...OOO..', '.............', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '..OOO...OOO..',
               '.............', '..OOO...OOO..', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '.............', '..OOO...OOO..'],
    'R-pentomino': ['.OO', 'OO.', '.O.'],
    'Acorn': ['.O.....', '...O...', 'OO..OOO'],
    'Gosper glider gun': ['........................O...........', '......................O.O...........',
      '............OO......OO............OO', '...........O...O....OO............OO', 'OO........O.....O...OO..............',
      'OO........O...O.OO....O.O...........', '..........O.....O.......O...........', '...........O...O....................',
      '............OO......................'],
  };

  const RULES = {
    'Conway\'s Life': 'B3/S23', 'HighLife': 'B36/S23', 'Day & Night': 'B3678/S34678',
    'Seeds': 'B2/S', 'Replicator': 'B1357/S1357', 'Maze': 'B3/S12345', 'Life without Death': 'B3/S012345678',
  };

  return {create, parseRule, step, population, hash, stamp, PATTERNS, RULES};
})();
if (typeof module !== 'undefined') module.exports = Life;
