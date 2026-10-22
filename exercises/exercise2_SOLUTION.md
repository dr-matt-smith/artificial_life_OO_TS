# Exercise 2 - solution: separate Model, Display (view) and Game (controller)

every change made on branch `ex2-separate-model-view-controller`, starting from `ex1-move-creatures-with-keyboard`

to see them all: `git diff ex1-move-creatures-with-keyboard ex2-separate-model-view-controller -- src tests`

| File | Change |
|---|---|
| `src/World.ts` | NEW - the MODEL: the grid and the rules for moving, moved out of Game |
| `src/Display.ts` | NEW - the VIEW: `render()` and `showCounters()`, moved out of Game |
| `src/Game.ts` | UPDATED - now only the CONTROLLER: it has a `World`, and `handleKey()` |
| `src/main.ts` | UPDATED - creates a `Display`, and calls it instead of the game |
| `tests/Grid.test.ts` | RENAMED to `tests/World.test.ts` - tests `World` on its own |
| `tests/Game.test.ts` | UPDATED - the grid is now `game.world` |

`Creature.ts`, `Food.ts` and `public/` don't change. No new tests are needed: every test from exercise 1
should still pass - that is how you know the split didn't break anything.

The steps, in an order that keeps the tests passing most of the way: World first, then Game, then Display,
then main.ts.

## `src/World.ts` - NEW

everything about the grid moves here from Game: the `WIDTH` / `HEIGHT` constants, the `grid`, and
`getSquare()`, `addCreature()`, `addFood()`, `moveCreature()` - with no changes to the method bodies

```ts
// The MODEL: a grid of squares. Each square is empty (null), or has a creature or some food in it.
// No DOM in here - so it can be tested with Deno, away from the browser.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";

export const WIDTH = 20;
export const HEIGHT = 12;

export class World {
  public readonly grid: (Creature | Food | null)[][];

  constructor() {
    this.grid = [];
    for (let row = 0; row < HEIGHT; row++) {
      const squares: (Creature | Food | null)[] = [];
      for (let col = 0; col < WIDTH; col++) {
        squares.push(null);
      }
      this.grid.push(squares);
    }
  }

  /** Returns what is in a square (null if it is empty). */
  public getSquare(row: number, col: number): Creature | Food | null {
    return this.grid[row][col];
  }

  /** Puts a creature on the grid, at its own row and col. */
  public addCreature(creature: Creature): void {
    this.grid[creature.row][creature.col] = creature;
  }

  /** Puts some food in a square. */
  public addFood(food: Food, row: number, col: number): void {
    this.grid[row][col] = food;
  }

  /**
   * Moves a creature one step (dRow, dCol). It stays where it is if that would take it off the
   * grid, or into another creature. If there is food there, it eats it.
   */
  public moveCreature(creature: Creature, dRow: number, dCol: number): void {
    const newRow = creature.row + dRow;
    const newCol = creature.col + dCol;

    if (newRow < 0 || newRow >= HEIGHT || newCol < 0 || newCol >= WIDTH) {
      return; // off the edge
    }
    if (this.grid[newRow][newCol] instanceof Creature) {
      return; // square already taken
    }

    this.grid[creature.row][creature.col] = null;
    creature.row = newRow;
    creature.col = newCol;
    this.grid[newRow][newCol] = creature; // replaces any food that was there
  }
}
```

notes:
- World doesn't know there is a game, an ant, a selected creature, or a web page - it only knows squares
- it imports `Creature` and `Food`, but nothing else

## `src/Display.ts` - NEW

`render()` and `showCounters()` move here from Game, with `renderCount`

```ts
// The VIEW: the only class that talks to the page (the DOM). Every time the world changes,
// render() loops over the grid and rebuilds the whole HTML table.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { Game } from "./Game.ts";

export class Display {
  private readonly game: Game;
  private readonly table: HTMLTableElement | null;
  private readonly status: HTMLParagraphElement | null;
  private readonly counters: HTMLParagraphElement | null;
  private renderCount = 0; // how many times render() has been called

  constructor(game: Game) {
    this.game = game;
    this.table = document.querySelector<HTMLTableElement>("#grid");
    this.status = document.querySelector<HTMLParagraphElement>("#status");
    this.counters = document.querySelector<HTMLParagraphElement>("#counters");
  }

  /** Shows the frame count and the render() count. Called every frame, so it is kept cheap. */
  public showCounters(frameCount: number): void {
    if (!this.counters) return;
    this.counters.textContent = `Frames: ${frameCount} | render() calls: ${this.renderCount}`;
  }

  /** Redraws the grid and the status line from the current state of the game. */
  public render(): void {
    this.renderCount++;
    if (!this.table || !this.status) return;

    let html = "";
    for (const row of this.game.world.grid) {
      html += "<tr>";
      for (const square of row) {
        if (square instanceof Creature) {
          const selected = square === this.game.selected ? " class=\"selected\"" : "";
          html += `<td${selected}><img src="${square.image}" alt="${square.name}"></td>`;
        } else if (square instanceof Food) {
          html += `<td><img src="${square.image}" alt="food"></td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    this.table.innerHTML = html;

    this.status.textContent = `Selected: ${this.game.selected.name}`;
  }
}
```

what changed from the versions in Game:
- `this.grid` becomes `this.game.world.grid`, and `this.selected` becomes `this.game.selected` - the view
  READS the game, but never changes it
- the page elements are looked up ONCE, in the constructor, and kept in `private readonly` properties. Game
  couldn't do this: the tests call `new Game()`, and Deno has no `document`. Display is never created in
  the tests, so it can
- every property is `private` - nothing outside Display needs them

## `src/Game.ts` - UPDATED

Game keeps only the controller's jobs: creating things, remembering the selected creature, and `handleKey()`.
The whole file becomes:

```ts
// The CONTROLLER: sets up the world, and turns key presses into changes to it.
// No DOM in here either - main.ts passes in the name of each key that is pressed.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { World } from "./World.ts";

export class Game {
  public readonly world: World;
  public readonly ant: Creature;
  public readonly rabbit: Creature;
  public selected: Creature;

  constructor() {
    this.world = new World();

    this.ant = new Creature("ant", "images/sprites/ant.png", 2, 3);
    this.rabbit = new Creature("rabbit", "images/sprites/rabbit.png", 8, 15);
    this.world.addCreature(this.ant);
    this.world.addCreature(this.rabbit);

    this.world.addFood(new Food("images/sprites/carrot.png"), 2, 8);
    this.world.addFood(new Food("images/sprites/carrot.png"), 5, 12);
    this.world.addFood(new Food("images/sprites/carrot.png"), 9, 4);

    this.selected = this.ant;
  }

  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.selected = this.ant;
    } else if (key === "2") {
      this.selected = this.rabbit;
    } else if (key === "ArrowUp") {
      this.world.moveCreature(this.selected, -1, 0);
    } else if (key === "ArrowDown") {
      this.world.moveCreature(this.selected, 1, 0);
    } else if (key === "ArrowLeft") {
      this.world.moveCreature(this.selected, 0, -1);
    } else if (key === "ArrowRight") {
      this.world.moveCreature(this.selected, 0, 1);
    }
  }
}
```

in detail, compared with exercise 1:
- REMOVED: `WIDTH`, `HEIGHT`, `grid`, `getSquare()`, `addCreature()`, `addFood()`, `moveCreature()` (now in
  World), and `renderCount`, `showCounters()`, `render()` (now in Display)
- ADDED: `import { World } from "./World.ts";` and the property `public readonly world: World;`
- the constructor makes the grid with `this.world = new World();` instead of the two `for` loops
- `this.addCreature(...)` / `this.addFood(...)` become `this.world.addCreature(...)` / `this.world.addFood(...)`
- in `handleKey()`, `this.moveCreature(...)` becomes `this.world.moveCreature(...)`

## `src/main.ts` - UPDATED

1. import and create the display:

```ts
import { Display } from "./Display.ts";
import { Game } from "./Game.ts";

const game = new Game();
const display = new Display(game);
```

2. call the display instead of the game - 3 places:
   - in the `keydown` listener: `game.render();` becomes `display.render();`
   - in `frame()`: `game.render();` becomes `display.render();`
   - in `frame()`: `game.showCounters(frameCount);` becomes `display.showCounters(frameCount);`

3. the comment at the top:

```ts
// main.ts wires everything together: it creates the game and its display, and passes each key
// press to the game, then redraws.
```

## `tests/Grid.test.ts` - RENAMED to `tests/World.test.ts`

the grid tests now test `World` on its own - no game needed

1. the import: `import { Game, HEIGHT, WIDTH } from "../src/Game.ts";` becomes

```ts
import { HEIGHT, WIDTH, World } from "../src/World.ts";
```

2. in every test: `const game = new Game();` becomes `const world = new World();`, and every `game.` becomes
   `world.` (e.g. `world.moveCreature(ant, 0, 1)`, `world.getSquare(3, 5)`, `world.grid.length`)
3. the test "squares with nothing in them are empty" can go back to its old name, "a new world is all empty
   squares" - a new World really is empty now, with no ant, rabbit or carrots in it
4. the comment at the top:

```ts
// Tests for src/World.ts - run on every save by "deno task dev", results in test_output/.
```

## `tests/Game.test.ts` - UPDATED

in "the game starts with an ant and a rabbit on the grid", the grid is now inside the world:

```ts
  assertEquals(game.world.getSquare(game.ant.row, game.ant.col), game.ant);
  assertEquals(game.world.getSquare(game.rabbit.row, game.rabbit.col), game.rabbit);
```

the key tests don't change at all - they only use `handleKey()`, `selected`, `ant` and `rabbit`, which are
still on Game

## check
- `deno task build`: **14 passed** (the same 14 as exercise 1), 0 type errors, 0 lint warnings
- the page looks and works exactly as before
- `grep document src/World.ts src/Game.ts` finds nothing - only Display touches the page
