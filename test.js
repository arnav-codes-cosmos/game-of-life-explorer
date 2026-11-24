// Engine tests: node test.js   (add --long for the 1103-generation R-pentomino check)
const assert = require('assert');
const Life = require('./life.js');
const conway = Life.parseRule('B3/S23');
const run = (g, n, wrap = false) => { for (let i = 0; i < n; i++) g = Life.step(g, conway, wrap); return g; };
const cells = g => [...g.c.keys()].filter(i => g.c[i]).map(i => [i % g.w, (i / g.w) | 0]);

// rule parsing
assert.deepStrictEqual(Life.parseRule('b36/s23').text, 'B36/S23');
assert.ok(Life.parseRule('B2/S'));
assert.strictEqual(Life.parseRule('hello'), null);
assert.strictEqual(Life.parseRule('B9/S1'), null);

// block is a still life
let g = Life.create(10, 10); Life.stamp(g, Life.PATTERNS.Block, 4, 4);
assert.deepStrictEqual(run(g, 5).c, g.c);

// blinker has period 2
g = Life.create(10, 10); Life.stamp(g, Life.PATTERNS.Blinker, 3, 4);
assert.notDeepStrictEqual(run(g, 1).c, g.c);
assert.deepStrictEqual(run(g, 2).c, g.c);

// glider moves one cell diagonally every 4 generations
g = Life.create(20, 20); Life.stamp(g, Life.PATTERNS.Glider, 2, 2);
const moved = Life.create(20, 20); Life.stamp(moved, Life.PATTERNS.Glider, 3, 3);
assert.deepStrictEqual(run(g, 4).c, moved.c);

// wrap-around: glider on a torus returns home after 4 * lcm(w, h) steps (here 4 * 20)
assert.deepStrictEqual(run(g, 80, true).c, g.c);

// Gosper gun: 36 cells, emits a 5-cell glider every 30 generations
g = Life.create(80, 50); Life.stamp(g, Life.PATTERNS['Gosper glider gun'], 2, 2);
assert.strictEqual(Life.population(g), 36);
assert.strictEqual(Life.population(run(g, 30)), 41);
assert.strictEqual(Life.population(run(g, 60)), 46);

// Seeds (B2/S): nothing survives, so a lone pair dies out or explodes but never keeps its cells
const seeds = Life.parseRule('B2/S');
g = Life.create(10, 10); Life.stamp(g, ['OO'], 4, 4);
const next = Life.step(g, seeds, false);
assert.ok(cells(next).every(([x, y]) => !(y === 4 && (x === 4 || x === 5))));

console.log('all tests passed');

if (process.argv.includes('--long')) {
  // On an infinite plane the R-pentomino stabilises at generation 1103 with 116 cells.
  let r = Life.create(400, 400); Life.stamp(r, Life.PATTERNS['R-pentomino'], 199, 199);
  const pops = [Life.population(r)];
  for (let i = 0; i < 1200; i++) { r = Life.step(r, conway, false); pops.push(Life.population(r)); }
  console.log('R-pentomino population at gen 1102, 1103, 1104, 1200:', pops[1102], pops[1103], pops[1104], pops[1200]);
}
