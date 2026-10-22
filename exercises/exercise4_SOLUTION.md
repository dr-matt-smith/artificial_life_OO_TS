# Exercise 4 - solution: the Observer pattern

every change made on branch `ex4-observer-pattern`, starting from `ex3-redraw-only-when-changed`

to see them all: `git diff ex3-redraw-only-when-changed ex4-observer-pattern -- src tests`

| File | Change |
|---|---|
| `src/Subject.ts` | NEW - abstract class: the list of observers, `attach()`, `detach()`, `notify()` |
| `src/Observer.ts` | NEW - interface: `update(subject)` |
| `src/World.ts` | UPDATED - `extends Subject`, holds the selected creature, and calls `notify()` after every change |
| `src/Display.ts` | UPDATED - `implements Observer`, and takes the World instead of the Game |
| `src/Game.ts` | UPDATED - no `selected`, no `changed`; selects and moves through the World |
| `src/main.ts` | UPDATED - attaches the Display to the World; the game loop no longer checks for changes |
| `tests/CountingObserver.ts` | NEW - a test observer that counts its `update()` calls |
| `tests/Subject.test.ts` | NEW - 3 tests for attach / notify / detach |
| `tests/World.test.ts` | UPDATED - 5 new tests: selecting, and which changes notify |
| `tests/Game.test.ts` | UPDATED - `selected` is now in the World; the `changed` tests become "who is notified" tests |

`Creature.ts`, `Food.ts` and `public/` don't change.

## `src/Observer.ts` - NEW

```ts
// OBSERVER (the Observer pattern): anything that wants to be told when a Subject changes.
// The subject passes itself to update(), and the observer reads ("pulls") whatever it needs from it.

import type { Subject } from "./Subject.ts";

export interface Observer {
  update(subject: Subject): void;
}
```

notes:
- interface members have no `public` / `private` - everything in an interface is public
- `import type`: Observer and Subject each mention the other. `import type` only brings in the TYPE, so the
  two files don't need to load each other when the program runs

## `src/Subject.ts` - NEW

```ts
// SUBJECT (the Observer pattern): something that observers can watch. It keeps a list of its observers, and
// tells every one of them when it changes. Abstract, because every subject does this in the same way - so
// the code is written once, here, and each subject (e.g. World) just extends it and calls notify().

import type { Observer } from "./Observer.ts";

export abstract class Subject {
  private readonly observers: Observer[] = [];

  /** Starts telling this observer about changes. */
  public attach(observer: Observer): void {
    this.observers.push(observer);
  }

  /** Stops telling this observer about changes. */
  public detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  /** Tells every attached observer that this subject has changed. Only a subject can call it, on itself. */
  protected notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}
```

notes:
- `abstract`: you can't write `new Subject()` - only make subclasses of it, like World
- `observers` is `private readonly`: subclasses can't touch the list directly (only through `attach()` /
  `detach()`), and the array itself is never replaced - only added to and removed from
- `notify()` is `protected`: World can call `this.notify()`, but other classes can't call `world.notify()`

## `src/World.ts` - UPDATED

### 1. import Subject, and extend it

```ts
import { Subject } from "./Subject.ts";
```

```ts
export class World extends Subject {
```

### 2. add the selected creature - after `grid`

```ts
  private selected: Creature | null = null; // the creature the player controls - null until one is selected
```

it is `private` so that the only way to change it is `selectCreature()` - which notifies

### 3. call `super()` - the first line of the constructor

```ts
  constructor() {
    super();
    this.grid = [];
```

a subclass's constructor must call its parent's constructor before it uses `this`

### 4. add `getSelected()` and `selectCreature()` - after `getSquare()`

```ts
  /** Returns the selected creature (null if none has been selected yet). */
  public getSelected(): Creature | null {
    return this.selected;
  }

  /** Selects a creature - the one the player controls. */
  public selectCreature(creature: Creature): void {
    this.selected = creature;
    this.notify();
  }
```

### 5. `this.notify();` at the end of `addCreature()`, `addFood()` and `moveCreature()`

```ts
  public addCreature(creature: Creature): void {
    this.grid[creature.row][creature.col] = creature;
    this.notify();
  }

  public addFood(food: Food, row: number, col: number): void {
    this.grid[row][col] = food;
    this.notify();
  }
```

in `moveCreature()`, `notify()` goes ONLY at the very end - after the creature has moved. The two early
`return`s don't notify, because nothing changed:

```ts
    if (newRow < 0 || newRow >= HEIGHT || newCol < 0 || newCol >= WIDTH) {
      return; // off the edge - nothing changed, so nobody is notified
    }
    if (this.grid[newRow][newCol] instanceof Creature) {
      return; // square already taken - nothing changed, so nobody is notified
    }

    this.grid[creature.row][creature.col] = null;
    creature.row = newRow;
    creature.col = newCol;
    this.grid[newRow][newCol] = creature; // replaces any food that was there
    this.notify();
  }
```

### 6. the comment at the top - add a third line

```ts
// It is also the SUBJECT in the Observer pattern: every change to it notifies its observers (e.g. the Display).
```

## `src/Display.ts` - UPDATED

### 1. the imports - `Game` goes, `Observer`, `Subject` and `World` come in

```ts
import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { Observer } from "./Observer.ts";
import { Subject } from "./Subject.ts";
import { World } from "./World.ts";
```

### 2. implement Observer, and hold the World instead of the Game

```ts
export class Display implements Observer {
  private readonly world: World;
```

```ts
  constructor(world: World) {
    this.world = world;
```

the view only needs the model - it never needed the controller

### 3. add `update()` - after the constructor

```ts
  /** Called by the World (via notify()) every time it changes. */
  public update(subject: Subject): void {
    if (subject === this.world) {
      this.render();
    }
  }
```

the `subject` parameter says WHICH subject changed - useful when one observer watches several. Display only
watches its world, but checking costs nothing and shows what the parameter is for

### 4. `render()` reads from the World

```ts
    const selectedCreature = this.world.getSelected();
    let html = "";
    for (const row of this.world.grid) {
```

- `this.game.world.grid` becomes `this.world.grid`
- `square === this.game.selected` becomes `square === selectedCreature`
- the status line - the selected creature can now be `null`:

```ts
    this.status.textContent = `Selected: ${selectedCreature ? selectedCreature.name : "nothing"}`;
```

### 5. the comment at the top

```ts
// The VIEW: the only class that talks to the page (the DOM). render() loops over the grid and rebuilds the
// whole HTML table.
// It is also an OBSERVER in the Observer pattern: attached to the World, it is told every time the world
// changes - and redraws.
```

## `src/Game.ts` - UPDATED

the whole file becomes:

```ts
// The CONTROLLER: sets up the world, and turns key presses into changes to it.
// No DOM in here either - main.ts passes in the name of each key that is pressed.
// It doesn't tell the Display about changes: the World does that itself, by notifying its observers.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { World } from "./World.ts";

export class Game {
  public readonly world: World;
  public readonly ant: Creature;
  public readonly rabbit: Creature;

  constructor() {
    this.world = new World();

    this.ant = new Creature("ant", "images/sprites/ant.png", 2, 3);
    this.rabbit = new Creature("rabbit", "images/sprites/rabbit.png", 8, 15);
    this.world.addCreature(this.ant);
    this.world.addCreature(this.rabbit);

    this.world.addFood(new Food("images/sprites/carrot.png"), 2, 8);
    this.world.addFood(new Food("images/sprites/carrot.png"), 5, 12);
    this.world.addFood(new Food("images/sprites/carrot.png"), 9, 4);

    this.world.selectCreature(this.ant);
  }

  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.world.selectCreature(this.ant);
    } else if (key === "2") {
      this.world.selectCreature(this.rabbit);
    } else if (key === "ArrowUp") {
      this.moveSelected(-1, 0);
    } else if (key === "ArrowDown") {
      this.moveSelected(1, 0);
    } else if (key === "ArrowLeft") {
      this.moveSelected(0, -1);
    } else if (key === "ArrowRight") {
      this.moveSelected(0, 1);
    }
  }

  /**
   * One "tick" of the simulation - main.ts calls it every frame. It does nothing yet: later, creatures
   * could wander, get hungry, ... - by calling World methods, which notify the observers.
   */
  public update(): void {
  }

  /** Moves the selected creature one step (if one is selected). */
  private moveSelected(dRow: number, dCol: number): void {
    const selected = this.world.getSelected();
    if (selected) {
      this.world.moveCreature(selected, dRow, dCol);
    }
  }
}
```

compared with exercise 3:
- REMOVED: the `selected` and `changed` properties, the `else { return; }` and `this.changed = true;` at the
  end of `handleKey()`
- `this.selected = this.ant;` becomes `this.world.selectCreature(this.ant);` (in the constructor, and for
  keys 1 and 2)
- NEW private helper `moveSelected()`: `getSelected()` can return `null`, so TypeScript makes us check before
  moving - the check is written once here, instead of in all four arrow-key branches
- Game no longer knows or cares whether anything is watching. That is the point

## `src/main.ts` - UPDATED

the whole file becomes:

```ts
// main.ts wires everything together: it creates the game and its display, attaches the display to the world
// as an observer, passes each key press to the game, and runs the game loop.

import { Display } from "./Display.ts";
import { Game } from "./Game.ts";

const game = new Game();
const display = new Display(game.world);
game.world.attach(display); // the Display observes the World - it is told every time the world changes
display.render(); // draw the first frame - nothing has changed yet, so nobody has been notified

document.addEventListener("keydown", (event) => {
  game.handleKey(event.key); // any change to the world notifies the Display, which redraws

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
});


// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls - which only goes up when the world changes.
let frameCount = 0;
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) one tick of the simulation - any change to the world notifies the Display
    game.update();

    // (3) update HTML display of counters
    display.showCounters(frameCount);

    // (4) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

compared with exercise 3:
- `new Display(game)` becomes `new Display(game.world)`
- NEW: `game.world.attach(display);` - this one line is what connects the view to the model
- NEW: `display.render();` - the game set up its creatures and food BEFORE the display was attached, so
  nobody was notified about them. Without this line the page stays empty until the first key press
- the `if (game.changed) { ... }` step is gone from the game loop - the steps are renumbered (1) to (4)

## `tests/CountingObserver.ts` - NEW

not a test file (its name doesn't end in `.test.ts`) - a TEST DOUBLE that the tests attach to a subject, to
see whether it was notified

```ts
// A test double (not a test file): an Observer that just counts how many times it has been told about a change.

import { Observer } from "../src/Observer.ts";
import { Subject } from "../src/Subject.ts";

export class CountingObserver implements Observer {
  public count = 0;
  public lastSubject: Subject | null = null;

  public update(subject: Subject): void {
    this.count++;
    this.lastSubject = subject;
  }
}
```

## `tests/Subject.test.ts` - NEW

```ts
// Tests for src/Subject.ts - the Subject half of the Observer pattern.

import { assertEquals } from "@std/assert";
import { Subject } from "../src/Subject.ts";
import { CountingObserver } from "./CountingObserver.ts";

// Subject is abstract, so the tests need a subject of their own - one that can announce a change.
class TestSubject extends Subject {
  public change(): void {
    this.notify();
  }
}

Deno.test("an attached observer is told when the subject changes, and is passed the subject", () => {
  const subject = new TestSubject();
  const observer = new CountingObserver();
  subject.attach(observer);

  subject.change();

  assertEquals(observer.count, 1);
  assertEquals(observer.lastSubject, subject);
});

Deno.test("every attached observer is told", () => {
  const subject = new TestSubject();
  const first = new CountingObserver();
  const second = new CountingObserver();
  subject.attach(first);
  subject.attach(second);

  subject.change();

  assertEquals(first.count, 1);
  assertEquals(second.count, 1);
});

Deno.test("a detached observer is not told any more", () => {
  const subject = new TestSubject();
  const observer = new CountingObserver();
  subject.attach(observer);
  subject.change();

  subject.detach(observer);
  subject.change();

  assertEquals(observer.count, 1);
});
```

## `tests/World.test.ts` - UPDATED

add the import, after the World import:

```ts
import { CountingObserver } from "./CountingObserver.ts";
```

and at the end:

```ts
Deno.test("a new world has nothing selected", () => {
  const world = new World();
  assertEquals(world.getSelected(), null);
});

Deno.test("selectCreature() selects the creature, and notifies the observers", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  world.addCreature(ant);
  const observer = new CountingObserver();
  world.attach(observer);

  world.selectCreature(ant);

  assertEquals(world.getSelected(), ant);
  assertEquals(observer.count, 1);
  assertEquals(observer.lastSubject, world);
});

Deno.test("adding a creature or food notifies the observers", () => {
  const world = new World();
  const observer = new CountingObserver();
  world.attach(observer);

  world.addCreature(new Creature("ant", "ant.png", 3, 4));
  world.addFood(new Food("heart.png"), 5, 6);

  assertEquals(observer.count, 2);
});

Deno.test("moving a creature notifies the observers", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  world.addCreature(ant);
  const observer = new CountingObserver();
  world.attach(observer);

  world.moveCreature(ant, 0, 1);

  assertEquals(observer.count, 1);
});

Deno.test("a move that is blocked by the edge, or another creature, does not notify", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 0, 0);
  const rabbit = new Creature("rabbit", "rabbit.png", 0, 1);
  world.addCreature(ant);
  world.addCreature(rabbit);
  const observer = new CountingObserver();
  world.attach(observer);

  world.moveCreature(ant, -1, 0); // off the top edge
  world.moveCreature(ant, 0, 1); // into the rabbit

  assertEquals(observer.count, 0);
});
```

the observer is attached AFTER the set-up (adding the creatures), so it only counts what the test is about

## `tests/Game.test.ts` - UPDATED

1. add the import, after the Game import:

```ts
import { CountingObserver } from "./CountingObserver.ts";
```

2. the selected creature is in the World now: every `game.selected` becomes `game.world.getSelected()`
   (4 places, in "the ant is selected to start with", "key 2 selects the rabbit, key 1 selects the ant" and
   "other keys do nothing")

3. delete the 5 `changed` tests from exercise 3, and add these instead:

```ts
Deno.test("a key that selects a creature notifies the world's observers", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("2");

  assertEquals(observer.count, 1);
});

Deno.test("an arrow key that moves the creature notifies the world's observers", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("ArrowDown");

  assertEquals(observer.count, 1);
});

Deno.test("an arrow key that is blocked by the edge notifies nobody", () => {
  const game = new Game();
  game.handleKey("ArrowUp"); // the ant starts in row 2 - up twice takes it to row 0, the top edge
  game.handleKey("ArrowUp");
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("ArrowUp");

  assertEquals(game.ant.row, 0);
  assertEquals(observer.count, 0);
});

Deno.test("a key the game does not handle notifies nobody", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("x");

  assertEquals(observer.count, 0);
});

Deno.test("update() notifies nobody (it does nothing yet)", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.update();

  assertEquals(observer.count, 0);
});
```

## check
- `deno task build`: **27 passed**, 0 type errors, 0 lint warnings
  (exercise 3 had 19: 5 `changed` tests removed, 3 + 5 + 5 new ones added)
- in the page:
  - with no keys pressed, Frames climbs about 60 a second, but `render() calls` stays at **1**
  - each move, and each press of 1 or 2, adds 1
  - pressing `x` adds nothing - and NOW an arrow key that bumps into the edge or the other creature adds
    nothing too (the exercise 3 stretch task, for free)
- `grep -E "(this|game)\.changed" src/` finds nothing - the flag is gone: nobody checks for changes any
  more, the world announces them

## the trade-off to discuss
the Display now redraws once for EVERY change. Today that is at most one per key press, so it doesn't
matter. But if `update()` later moves 50 creatures in one frame, that is 50 redraws in one frame, where 1
would do. The usual fix combines both patterns: `Display.update()` just sets its own "needs redrawing" flag
(exercise 3's dirty flag, but now owned by the view), and the game loop calls `display.render()` once per
frame if it is set.
