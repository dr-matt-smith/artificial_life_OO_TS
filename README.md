# Artificial Life

A 20 x 12 grid with an ant, a rabbit and some food - a starting point for exploring design patterns
(MVC, observer / pub-sub, state, ...).

![screesnhot](README_images/screenshot1.webp)

## Exercises

Each exercise is in `exercises/`. Start from the branch in the "start from" column; the next branch has a
solution.

| Exercise | What you do | Start from | A solution |
|---|---|---|---|
| [1](exercises/exercise1.md) | move the creatures with the keyboard | `main` | `ex1-move-creatures-with-keyboard` |
| [2](exercises/exercise2.md) | separate Model, Display (view) and Game (controller) - **MVC** | `ex1-move-creatures-with-keyboard` | `ex2-separate-model-view-controller` |
| [3](exercises/exercise3.md) | redraw only when something changed | `ex2-separate-model-view-controller` | - |

To switch branch: `git switch ex1-move-creatures-with-keyboard` (and so on). To see everything an exercise
changed: `git diff main ex1-move-creatures-with-keyboard`.

## This branch: `ex1-move-creatures-with-keyboard` - a solution to exercise 1

- a 20 wide by 12 high grid; each square is empty, or has a creature or food (🥕) in it
- two creatures: 
    - the ant: 🐜
    - the rabbit: 🐇
- **1** / **2** selects the ant / rabbit; the **arrow keys** move it one step
- a creature can't move off the grid or into another creature; moving onto food eats it
- a simple **game loop**: `main.ts` redraws the grid on every animation frame (about 60 a second), using
  `requestAnimationFrame`
- two **counters** above the grid: how many frames have been drawn, and how many times `render()` has been
  called. They climb together, because the grid is redrawn every frame whether or not anything changed
  (that is exercise 3)

The code is deliberately simple - there is plenty of room to improve it with design patterns.

## Running it

Open the project in Celbridge. The console at the bottom starts by itself, and runs `deno task dev`:

1. **builds** `src/` (TypeScript) and `public/` (HTML, CSS, images) into `dist/`
2. **tests** everything in `tests/`, printing the results in the console (in TAP format) and writing a
   readable report to `test_output/index.html` (and `test_output/summary.md`)
3. **watches** - every time you save a file in `src/`, `public/` or `tests/`, it does it all again. Only
   one build runs at a time: saving during a build just means one more build once it has finished

`dist/index.html` opens beside the console. After a rebuild, its preview's **refresh** button lights
up - press it to see your changes. The clipboard icon opens the test report.

The console's buttons: rebuild-and-watch, build once, test once, and lint. To use them while the
watcher is running, press **Ctrl+C** first to stop it.

No server is needed: `dist/` is a plain web page, so you can also open `dist/index.html` in any browser.

## Class diagram

![Class diagram](README_images/class_diagram_v1.svg)

**One class does everything**: `Game` holds the grid and the rules for moving (the model), turns key
presses into changes (the controller), and draws the page (the view). Exercise 2 pulls those three jobs
apart into separate classes, following the **MVC** pattern.

`main.ts` is not a class: it creates the game, passes key presses to it, and runs the game loop.

## The files

### Classes (`src/`)

- `src/Creature.ts` - **Creature**: a creature on the grid (the ant or the rabbit). Holds its name, its
  picture, and its row and column.
- `src/Food.ts` - **Food**: something a creature can eat. Holds just its picture.
- `src/Game.ts` - **Game**: the whole game in one class.
  - the 20 x 12 grid: each square is `null` (empty), a `Creature` or a `Food`, and the rules for moving:
    a creature can't leave the grid or walk into another creature, and it eats any food it moves onto
  - creates the ant, the rabbit and the food, and remembers which creature is selected; `handleKey()`
    turns a key press into a change to the grid
  - `render()` rebuilds the HTML table from the grid (and counts how often it is called);
    `showCounters()` shows the frame and `render()` counts
  - also exports the `WIDTH` and `HEIGHT` constants
- `src/main.ts` - the entry point (not a class). Creates the `Game`, passes each key press to
  `game.handleKey()`, and runs the game loop: every frame, `frame()` calls `game.render()` and
  `game.showCounters()`.

### Tests (`tests/`)

- `tests/Grid.test.ts` - tests for the grid and the movement rules
- `tests/Game.test.ts` - tests for the player controls (selecting and moving creatures)

### The web page (`public/`, copied into `dist/` by the build)

- `public/index.html` - the page: a heading, the instructions, the status and counters lines, and the
  empty `<table>` that `Game` fills
- `public/css/styles.css` - the look; the grid's styles are at the bottom, under "this project"
- `public/images/sprites/` - the PNG pictures for the creatures and food

### Everything else

- `exercises/` - the exercises: what to build next, step by step
- `README_images/` - pictures used in this README
- `build.ts` - builds `src/` and `public/` into `dist/`, then runs the tests; with `--watch` it rebuilds on
  every save (you never need to edit it)
- `deno.json` - the `deno task` commands (`dev`, `build`, `test`, `check`, `lint`) and settings
- `terminal.console` - the Celbridge console, and its buttons
- `artificial_life.celbridge` - the Celbridge project file (which files open when the project loads)
- `tools/test_report.ts` - runs the tests and writes the report in `test_output/`
- `tools/emoji-sprite/`, `tools/image-editor/`, `tools/sound-fx/` - Celbridge tools for making sprites,
  editing images, and making sound effects
- `dist/`, `test_output/` - made by the build; don't edit these, they are rebuilt on every save
