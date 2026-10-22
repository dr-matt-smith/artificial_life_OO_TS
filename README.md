# Artificial Life

A 20 x 12 grid with an ant, a rabbit and some food - a starting point for exploring design patterns
(MVC, observer / pub-sub, state, ...).

![screenshot](README_images/screenshot1.webp)

## The projects

Each folder is a complete project of its own - the starting point, and a solution to each exercise. Download
(or clone) the repository and you have them all.

| Folder | What it is |
|---|---|
| [`start/`](start/) | the starting point: the grid, the creatures and the food, all in one `Game` class - nothing moves yet |
| [`ex1-move-with-keyboard/`](ex1-move-with-keyboard/) | a solution to exercise 1 - move the creatures with the keyboard |
| [`ex2-separate-model-view-controller/`](ex2-separate-model-view-controller/) | a solution to exercise 2 - **MVC**: `World`, `Display` and `Game` |
| [`ex3-redraw-only-when-changed/`](ex3-redraw-only-when-changed/) | a solution to exercise 3 - a `changed` flag, so the grid is only redrawn when needed |
| [`ex4-observer-pattern/`](ex4-observer-pattern/) | a solution to exercise 4 - the **Observer** pattern |

Each project's own README describes its code, with a class diagram.

## Exercises

The exercises are in [`exercises/`](exercises/). Start from the folder in the "start from" column; the folder in
the "a solution" column has one.

| Exercise | What you do | Start from | A solution |
|---|---|---|---|
| [1](exercises/exercise1.md) | move the creatures with the keyboard | `start/` | `ex1-move-with-keyboard/` |
| [2](exercises/exercise2.md) | separate Model, Display (view) and Game (controller) - **MVC** | `ex1-move-with-keyboard/` | `ex2-separate-model-view-controller/` |
| [3](exercises/exercise3.md) | redraw only when something changed | `ex2-separate-model-view-controller/` | `ex3-redraw-only-when-changed/` |
| [4](exercises/exercise4.md) | tell the view when the model changes - the **Observer** pattern | `ex3-redraw-only-when-changed/` | `ex4-observer-pattern/` |
| [5](exercises/exercise5.md) | an event bus with named topics - **publish / subscribe** | `ex4-observer-pattern/` | none - explore your own way |
| [6](exercises/exercise6.md) | creatures that wander, get hungry and eat - the **State** pattern | `ex4-observer-pattern/`, or your exercise 5 | none - explore your own way |

Exercises 5 and 6 are open-ended: ideas and questions to explore in your own way, with no solution.

For exercises 1 to 4 there is also `exercises/exercise<n>_SOLUTION.md`, which lists every new or changed file,
with the code to add or change in each.

**To do an exercise**, make your own copy of the "start from" folder, and work in the copy - so you can
always compare with the original. For example, from a terminal in this folder:

```bash
cp -r start my-ex1
```

To see everything a solution changed, compare the two folders, e.g.:

```bash
git diff --no-index start/src ex1-move-with-keyboard/src
```

## Running a project

Every project runs on its own, with [Deno](https://deno.com). From a terminal in the project's folder:

```bash
deno task dev
```

That builds the project into its `dist/` folder, runs its tests, and rebuilds and retests every time you save a
file. Open the project's `dist/index.html` in a browser - no server is needed. Each project's README has the
details.

From this top folder, `deno task <name>` does the same for one project, without changing folder:
`deno task start`, `deno task ex1`, `deno task ex2`, `deno task ex3` or `deno task ex4`.

### In Celbridge

Open this top folder as the Celbridge project. The console at the bottom starts the `start/` project by
itself (`deno task start`), and opens `start/dist/index.html` beside it. The console's buttons run the other
projects: press **Ctrl+C** first to stop the one that is running. To see another project's page, open its
`dist/index.html`.

## The files

- `start/`, `ex1-.../` ... `ex4-.../` - the projects (see above). Each has its own `src/`, `tests/`,
  `public/`, `build.ts`, `deno.json` and `tools/test_report.ts`, so any one of them can be copied out and run
  on its own
- `exercises/` - the exercises, and the solution notes for exercises 1 to 4
- `README_images/` - pictures used in this README
- `deno.json` - `deno task start`, `deno task ex1`, ... - run a project from this top folder
- `terminal.console` - the Celbridge console, and its buttons
- `claude.console` - a Celbridge console for Claude
- `artificial_life.celbridge` - the Celbridge project file (which files open when the project loads)
- `tools/emoji-sprite/`, `tools/image-editor/`, `tools/sound-fx/` - Celbridge tools for making sprites,
  editing images, and making sound effects
