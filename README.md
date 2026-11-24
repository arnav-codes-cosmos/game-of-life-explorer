# Life Explorer

An interactive cellular automaton explorer in plain HTML, CSS and JavaScript. Draw cells on a grid, load classic patterns, change the rules, and watch population statistics build up as the system evolves. It is built around Conway's Game of Life but runs any rule in B/S notation.

## Run it

Open `index.html` in a browser. No build step, no dependencies. To run the engine tests: `node test.js`.

## Controls

- **Click or drag** on the grid to toggle cells (a drag paints with whatever the first cell flipped to)
- **Play / Pause**, **Step**, **Clear**, and **Random fill** with a density slider
- **Speed** slider from 1 to 60 generations per second
- **Pattern** menu: glider, blinker, block, lightweight spaceship, pulsar, R-pentomino, acorn, Gosper glider gun
- **Rule** menu and **Custom** box: type any rule such as `B36/S23`
- **Wrap edges**: when on, the grid is a torus; when off, the edges are dead cells
- Keyboard: `Space` plays or pauses, `n` steps

## Rules in B/S notation

`B3/S23` reads as: a dead cell with exactly 3 live neighbours is **B**orn; a live cell with 2 or 3 live neighbours **S**urvives; everything else is dead next generation. Included rules:

| Rule | Notation | Character |
|---|---|---|
| Conway's Life | B3/S23 | Balanced; gliders, oscillators, spaceships, guns |
| HighLife | B36/S23 | Like Life, plus a small self-replicating pattern |
| Day & Night | B3678/S34678 | Symmetric between live and dead cells |
| Seeds | B2/S | Nothing survives; explosive growth |
| Replicator | B1357/S1357 | Every pattern copies itself |
| Maze | B3/S12345 | Grows into maze-like walls |
| Life without Death | B3/S012345678 | Cells never die, so structures only grow |

## Statistics shown

- Generation, live cell count, density, and peak population
- A population-over-time chart (last 400 generations)
- A status line that detects when the board is **extinct**, **stable** (a still life) or **repeating** with a given period. Detection hashes every state and spots the first repeat, so it also catches long cycles, such as a glider crossing a wrapped grid.

## Emergent behaviour: what to look for

The rules only mention a cell and its eight neighbours, yet large-scale structure appears that no rule describes.

- **Gliders and spaceships.** A 5-cell glider travels diagonally one cell every 4 generations, though no individual cell moves. Motion is a property of the pattern, not of any cell.
- **Glider guns.** Load the Gosper gun and turn **Wrap edges** off. The gun is 36 cells and emits a 5-cell glider every 30 generations, so the population chart climbs in a steady staircase (36, 41, 46, ...). Simple local rules produce unbounded, perfectly regular growth. The engine tests confirm those three population figures.
- **Methuselahs.** The R-pentomino has only 5 cells but runs for over a thousand generations before things settle. On an infinite plane it is widely documented to stabilise at generation 1103 with 116 cells, including six gliders that fly away. On this bounded board the gliders hit the edges, so the outcome differs; a test run on a 400 × 400 non-wrapping grid ended at 111 cells.
- **Random soup.** Use Random fill at different densities with Conway's rules. Overcrowded soups collapse quickly, then the population typically levels off at a small fraction of the grid, made of still lifes, blinkers and the occasional glider. Watch the chart's sharp early drop followed by a long, flat tail.
- **Rule comparison.** Run the same random start under Life, Seeds and Life without Death. Seeds fills the board in a wave, Life without Death only grows, and Life settles. The three population curves look completely different.

## Experiments

1. Load Glider with wrap on, then off. With wrap on it returns to its starting position after 1600 generations (4 × lcm of the 80 × 50 grid), and the status line reports that period. With wrap off it hits the edge and settles into a stable 4-cell block (about generation 99 from the centre).
2. Collide two patterns by drawing a blinker in the path of a glider and compare the outcome with a different position.
3. Record the final population of ten random starts at 25% density and note the spread.
4. Try `B3/S23`, then `B3/S2`, `B3/S234`, and `B35/S23` in the custom box and describe what changes.

## Files

- `life.js`: the engine (rule parsing, stepping, hashing, patterns), with no DOM code, so it runs in the browser and in Node
- `script.js`: canvas drawing, controls, statistics, population chart
- `index.html`, `style.css`: layout and styling
- `test.js`: engine tests (block is stable, blinker has period 2, glider moves (1,1) per 4 generations, torus return, Gosper gun populations, rule parsing). Run `node test.js --long` for the 1200-generation R-pentomino run (about 10 seconds).

## Ideas to extend

- Click-to-stamp: place the selected pattern wherever you click, with rotate and flip
- Import and export patterns in RLE format
- Other neighbourhoods (von Neumann) or one-dimensional automata such as Rule 110
- Colour cells by age to show which structures are long-lived
- Zoom and pan on a larger or unbounded grid
