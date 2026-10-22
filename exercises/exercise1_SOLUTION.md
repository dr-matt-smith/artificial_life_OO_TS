# Exercise 1 - solution: move creatures with the keyboard

every change made on branch `ex1-move-creatures-with-keyboard`, starting from `main`

to see them all: `git diff main ex1-move-creatures-with-keyboard -- src tests public`

| File | Change |
|---|---|
| `src/Game.ts` | UPDATED - 2 new methods: `moveCreature()` and `handleKey()` |
| `src/main.ts` | UPDATED - a `keydown` listener |
| `public/index.html` | UPDATED - the instructions line |
| `tests/Grid.test.ts` | UPDATED - 4 new tests for moving |
| `tests/Game.test.ts` | UPDATED - 4 new tests for the keys |

`Creature.ts` and `Food.ts` don't change.

## `src/Game.ts` - UPDATED

### 1. add `moveCreature()` - after `addFood()`

```ts
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
```

notes:
- check the edge FIRST - otherwise `this.grid[newRow]` is `undefined` for a row off the grid, and
  `this.grid[newRow][newCol]` crashes
- update BOTH the grid (empty the old square, fill the new one) and the creature's own `row` and `col` -
  if they disagree, the creature is drawn in one place but moves from another
- eating food needs no extra code: putting the creature in the square replaces the `Food` that was there

### 2. add `handleKey()` - after `moveCreature()`

```ts
  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.selected = this.ant;
    } else if (key === "2") {
      this.selected = this.rabbit;
    } else if (key === "ArrowUp") {
      this.moveCreature(this.selected, -1, 0);
    } else if (key === "ArrowDown") {
      this.moveCreature(this.selected, 1, 0);
    } else if (key === "ArrowLeft") {
      this.moveCreature(this.selected, 0, -1);
    } else if (key === "ArrowRight") {
      this.moveCreature(this.selected, 0, 1);
    }
  }
```

notes:
- it takes the key's NAME (a string), not the browser's event - so the tests can call
  `game.handleKey("ArrowUp")` with no web page
- up is `-1` row (row 0 is the top of the grid)
- any other key falls through every `if` and does nothing

### 3. the comment at the top of the file

```ts
// The whole game in ONE class: the grid of squares and the rules for moving (model), turning key presses into
// changes (controller), and drawing the grid on the page (view) - all mixed together.
// A starting point to pull apart into separate classes, following the MVC pattern.
```

## `src/main.ts` - UPDATED

### add a `keydown` listener - after `const game = new Game();`

```ts
document.addEventListener("keydown", (event) => {
  game.handleKey(event.key);

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
  game.render();
});
```

notes:
- `event.key` is the key's name: `"1"`, `"2"`, `"ArrowUp"`, ...
- `preventDefault()` stops the browser's own action for that key - for the arrow keys, scrolling the page
- `game.render()` redraws straight away. The game loop redraws every frame anyway, so this line is not
  strictly needed - exercise 3 comes back to this

and the comment at the top:

```ts
// main.ts starts everything: it creates the game, passes each key press to it, and runs the game loop.
```

## `public/index.html` - UPDATED

replace the instructions line:

```html
<p class="muted">No keyboard controls yet - see <b>exercises/exercise1.md</b>.</p>
```

with:

```html
<p class="muted">Press <b>1</b> for the ant, <b>2</b> for the rabbit, then the <b>arrow keys</b> to move it.</p>
```

## `tests/Grid.test.ts` - UPDATED

add at the end:

```ts
Deno.test("moving a creature updates its position and the grid", () => {
  const game = new Game();
  const ant = new Creature("ant", "ant.png", 3, 4);
  game.addCreature(ant);

  game.moveCreature(ant, 0, 1);

  assertEquals(ant.row, 3);
  assertEquals(ant.col, 5);
  assertEquals(game.getSquare(3, 5), ant);
  assertEquals(game.getSquare(3, 4), null);
});

Deno.test("a creature cannot move off the edge of the grid", () => {
  const game = new Game();
  const ant = new Creature("ant", "ant.png", 0, 0);
  game.addCreature(ant);

  game.moveCreature(ant, -1, 0);
  game.moveCreature(ant, 0, -1);

  assertEquals(ant.row, 0);
  assertEquals(ant.col, 0);
  assertEquals(game.getSquare(0, 0), ant);
});

Deno.test("a creature cannot move into another creature", () => {
  const game = new Game();
  const ant = new Creature("ant", "ant.png", 3, 4);
  const rabbit = new Creature("rabbit", "rabbit.png", 3, 5);
  game.addCreature(ant);
  game.addCreature(rabbit);

  game.moveCreature(ant, 0, 1);

  assertEquals(ant.col, 4);
  assertEquals(game.getSquare(3, 4), ant);
  assertEquals(game.getSquare(3, 5), rabbit);
});

Deno.test("a creature that moves onto food eats it", () => {
  const game = new Game();
  const ant = new Creature("ant", "ant.png", 3, 4);
  game.addCreature(ant);
  game.addFood(new Food("heart.png"), 3, 5);

  game.moveCreature(ant, 0, 1);

  assertEquals(game.getSquare(3, 5), ant);
});
```

these use squares away from where the game puts its own ant, rabbit and carrots, so they don't get in the way

## `tests/Game.test.ts` - UPDATED

add at the end:

```ts
Deno.test("key 2 selects the rabbit, key 1 selects the ant", () => {
  const game = new Game();
  game.handleKey("2");
  assertEquals(game.selected, game.rabbit);
  game.handleKey("1");
  assertEquals(game.selected, game.ant);
});

Deno.test("arrow keys move the selected creature one step", () => {
  const game = new Game();
  const row = game.ant.row;
  const col = game.ant.col;

  game.handleKey("ArrowDown");
  assertEquals([game.ant.row, game.ant.col], [row + 1, col]);
  game.handleKey("ArrowRight");
  assertEquals([game.ant.row, game.ant.col], [row + 1, col + 1]);
  game.handleKey("ArrowUp");
  assertEquals([game.ant.row, game.ant.col], [row, col + 1]);
  game.handleKey("ArrowLeft");
  assertEquals([game.ant.row, game.ant.col], [row, col]);
});

Deno.test("arrow keys only move the selected creature", () => {
  const game = new Game();
  const rabbitRow = game.rabbit.row;
  game.handleKey("1");
  game.handleKey("ArrowDown");
  assertEquals(game.rabbit.row, rabbitRow);
});

Deno.test("other keys do nothing", () => {
  const game = new Game();
  game.handleKey("x");
  assertEquals(game.selected, game.ant);
  assertEquals([game.ant.row, game.ant.col], [2, 3]);
});
```

and change the comment at the top to:

```ts
// Tests for the player controls in src/Game.ts.
```

## check
- `deno task build`: **14 passed**, 0 type errors, 0 lint warnings
- in the page: 1 / 2 move the green outline between the ant and the rabbit; the arrow keys move it; it stops
  at the edges and at the other creature; walking onto a carrot eats it
