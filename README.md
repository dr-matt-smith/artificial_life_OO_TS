# Artificial Life

A 20 x 12 grid with an ant, a rabbit and some food - a starting point for exploring design patterns
(MVC, observer / pub-sub, state, ...).

![screenshot](README_images/screenshot1.webp)

## The projects

Each folder is a **Celbridge project of its own** - the starting point, and a solution to each exercise.
Download (or clone) this repository and you have them all. Open one folder at a time in Celbridge, and work in
it on its own: each has its own code, tests, build, exercises and Celbridge console.

| Folder | What it is |
|---|---|
| [`start/`](start/) | the starting point: the grid, the creatures and the food, all in one `Game` class - nothing moves yet |
| [`ex1-move-with-keyboard/`](ex1-move-with-keyboard/) | a solution to exercise 1 - move the creatures with the keyboard |
| [`ex2-separate-model-view-controller/`](ex2-separate-model-view-controller/) | a solution to exercise 2 - **MVC**: `World`, `Display` and `Game` |
| [`ex3-redraw-only-when-changed/`](ex3-redraw-only-when-changed/) | a solution to exercise 3 - a `changed` flag, so the grid is only redrawn when needed |
| [`ex4-observer-pattern/`](ex4-observer-pattern/) | a solution to exercise 4 - the **Observer** pattern |

Each project's README describes its code, with a class diagram, and says how to run it.

## Exercises

Every project has the exercises in its own `exercises/` folder. Each solution project also has the solution
notes for the exercises solved so far (`exercise<n>_SOLUTION.md`: every new or changed file, with the code) -
the `start/` project has none, so it gives nothing away.

| Exercise | What you do | Start from | A solution |
|---|---|---|---|
| [1](start/exercises/exercise1.md) | move the creatures with the keyboard | `start/` | `ex1-move-with-keyboard/` |
| [2](start/exercises/exercise2.md) | separate Model, Display (view) and Game (controller) - **MVC** | `ex1-move-with-keyboard/` | `ex2-separate-model-view-controller/` |
| [3](start/exercises/exercise3.md) | redraw only when something changed | `ex2-separate-model-view-controller/` | `ex3-redraw-only-when-changed/` |
| [4](start/exercises/exercise4.md) | tell the view when the model changes - the **Observer** pattern | `ex3-redraw-only-when-changed/` | `ex4-observer-pattern/` |
| [5](start/exercises/exercise5.md) | an event bus with named topics - **publish / subscribe** | `ex4-observer-pattern/` | none - explore your own way |
| [6](start/exercises/exercise6.md) | creatures that wander, get hungry and eat - the **State** pattern | `ex4-observer-pattern/`, or your exercise 5 | none - explore your own way |

Exercises 5 and 6 are open-ended: ideas and questions to explore in your own way, with no solution.

**To do an exercise**, make your own copy of the "start from" folder, and open the copy in Celbridge - so you
can always compare your work with the original. For example, from a terminal in this folder:

```bash
cp -r start my-ex1
```

To see everything a solution changed, compare the two folders, e.g.:

```bash
git diff --no-index start/src ex1-move-with-keyboard/src
```

## Running a project

In Celbridge: open the project's folder. Its console starts by itself, and builds, tests, and rebuilds on every
save; the page opens beside it.

Without Celbridge: from a terminal in the project's folder, run `deno task dev` (it needs
[Deno](https://deno.com)), and open the project's `dist/index.html` in a browser - no server is needed.

## The files

- `start/`, `ex1-.../` ... `ex4-.../` - the projects (see above)
- `README_images/` - pictures used in this README
