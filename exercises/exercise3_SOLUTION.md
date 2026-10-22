# Exercise 3 - solution: redraw only when something changed

every change made on branch `ex3-redraw-only-when-changed`, starting from `ex2-separate-model-view-controller`

to see them all: `git diff ex2-separate-model-view-controller ex3-redraw-only-when-changed -- src tests`

| File | Change |
|---|---|
| `src/Game.ts` | UPDATED - a `changed` property, `handleKey()` sets it, and a new empty `update()` method |
| `src/main.ts` | UPDATED - the game loop calls `update()`, and only redraws when `changed` is set |
| `tests/Game.test.ts` | UPDATED - 5 new tests for the `changed` flag |

`World.ts`, `Display.ts`, `Creature.ts`, `Food.ts` and `public/` don't change. Display doesn't know about the
flag at all - it still just draws when it is asked to.

## `src/Game.ts` - UPDATED

### 1. add the `changed` property - after `selected`

```ts
  public selected: Creature;
  public changed = true; // true when the page needs redrawing - starts true, so the first frame draws the grid
```

notes:
- it starts `true` - otherwise nothing is drawn until the first key press, and the page shows an empty grid
- it is `public` (not `readonly`): main.ts clears it after redrawing, and the tests set it to `false`

### 2. set `changed` in `handleKey()` - but only for keys the game uses

add an `else` at the end of the `if` chain, and set the flag after it:

```ts
    } else if (key === "ArrowRight") {
      this.world.moveCreature(this.selected, 0, 1);
    } else {
      return; // not a key the game uses - nothing has changed
    }
    this.changed = true;
  }
```

notes:
- every key that IS handled falls out of the `if` chain and reaches `this.changed = true;`
- any other key (e.g. `"x"`) takes the new `else` and returns early, so `changed` is left alone
- the other way to write it is `this.changed = true;` inside each of the six branches - it works, but it is
  6 copies of the same line, and easy to forget in the next branch you add

### 3. add `update()` - after `handleKey()`

```ts
  /**
   * One "tick" of the simulation - main.ts calls it every frame. It does nothing yet: later, creatures
   * could wander, get hungry, ... and anything that changes the world should set `changed`.
   */
  public update(): void {
  }
```

### 4. the comment at the top of the file

```ts
// The CONTROLLER: sets up the world, turns key presses into changes to it, and remembers when the page needs
// redrawing (`changed`).
// No DOM in here either - main.ts passes in the name of each key that is pressed.
```

## `src/main.ts` - UPDATED

### 1. the `keydown` listener no longer redraws

remove `display.render();` from the listener - the game loop does ALL the drawing now:

```ts
document.addEventListener("keydown", (event) => {
  game.handleKey(event.key); // sets game.changed if the key did something - the game loop redraws

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
});
```

### 2. the game loop - `frame()` becomes

```ts
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) one tick of the simulation
    game.update();

    // (3) update HTML display of world grid data - only if something has changed
    if (game.changed) {
        display.render();
        game.changed = false;
    }

    // (4) update HTML display of counters
    display.showCounters(frameCount);

    // (5) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
```

compared with exercise 2:
- NEW step (2): `game.update();`
- step (3): `display.render();` is wrapped in `if (game.changed) { ... }`, and the flag is cleared straight
  after drawing
- the old steps (3) and (4) become (4) and (5)
- `showCounters()` still runs every frame - it only sets one line of text, so it is cheap

### 3. the comments

at the top of the file:

```ts
// main.ts wires everything together: it creates the game and its display, passes each key press to the
// game, and runs the game loop - which only redraws when something has changed.
```

and above `let frameCount = 0;`:

```ts
// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls - which only goes up when something has changed.
```

## `tests/Game.test.ts` - UPDATED

add at the end:

```ts
Deno.test("a new game starts with changed true, so the first frame draws the grid", () => {
  const game = new Game();
  assertEquals(game.changed, true);
});

Deno.test("keys 1 and 2 set changed", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("2");
  assertEquals(game.changed, true);

  game.changed = false;
  game.handleKey("1");
  assertEquals(game.changed, true);
});

Deno.test("an arrow key sets changed", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("ArrowDown");
  assertEquals(game.changed, true);
});

Deno.test("a key the game does not handle leaves changed false", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("x");
  assertEquals(game.changed, false);
});

Deno.test("update() leaves changed false (it does nothing yet)", () => {
  const game = new Game();
  game.changed = false;
  game.update();
  assertEquals(game.changed, false);
});
```

each test (apart from the first) sets `game.changed = false` first - a new game starts with it `true`, so
without that the tests would pass whatever `handleKey()` did

written before the code, 4 of these fail. "a key the game does not handle leaves changed false" passes
straight away (nothing sets the flag yet) - it is there to catch the mistake of setting `changed` for EVERY
key

## check
- `deno task build`: **19 passed** (the 14 from before + 5 new), 0 type errors, 0 lint warnings
- in the page:
  - with no keys pressed, Frames climbs about 60 a second, but `render() calls` stays at **1**
  - each press of 1, 2 or an arrow key adds 1 to `render() calls`
  - pressing another key (e.g. `x`) adds nothing

## the stretch task (not in this solution)
an arrow key that bumps into the edge or another creature moves nothing, but still sets `changed` - so the
page is redrawn for no reason. To fix it, make `World.moveCreature()` return `true` when the creature moved
(and `false` at each early `return`), and in `handleKey()` only set `changed` when it returns `true`.
