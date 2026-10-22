# Exercise 4 - the Observer pattern

start from: branch `ex3-redraw-only-when-changed`
a solution: branch `ex4-observer-pattern`

## the problem
in exercise 3, nobody TELLS the view that something changed:

- Game sets a `changed` flag
- main.ts asks `game.changed?` every frame - 60 times a second, even when nothing happens
- main.ts has to know that Game has a flag, AND that the flag means "redraw the Display"

the view should find out from the model itself, the moment the model changes

## the Observer pattern (Gang of Four)
"Define a one-to-many dependency between objects so that when one object changes state, all its dependents
are notified and updated automatically."

| GoF role | in this project |
|---|---|
| Subject | new abstract class `Subject` - keeps a list of observers |
| Observer | new interface `Observer` - anything that wants to be told about changes |
| ConcreteSubject | `World` - the model |
| ConcreteObserver | `Display` - the view |

## Subject - new file `src/Subject.ts`
an ABSTRACT class: every subject attaches, detaches and notifies in the same way, so the code is written
once, here - an interface couldn't hold it

    public attach(observer: Observer): void
    public detach(observer: Observer): void
    protected notify(): void          calls update(this) on every attached observer

- the list of observers is `private` - only Subject touches it
- `notify()` is `protected` - only a subject can announce its own changes

## Observer - new file `src/Observer.ts`
an INTERFACE - just one method:

    update(subject: Subject): void

the subject passes ITSELF, and the observer reads ("pulls") whatever it needs from it - the GoF "pull" model

## World (ConcreteSubject)
- `World extends Subject` (remember `super()` in the constructor)
- after each change to the grid, call `this.notify()`:
  - `addCreature()` and `addFood()`
  - `moveCreature()` - but ONLY if the creature actually moved (not at the early `return`s)

which creature is selected is part of the game's state, so it moves from Game into World:

    public selectCreature(creature: Creature): void      selects it, and notifies
    public getSelected(): Creature | null                null until something is selected

## Display (ConcreteObserver)
- `Display implements Observer`
- its constructor takes the `World` (not the Game) - the view only needs the model
- `update(subject)` redraws the page with `render()`
- `render()` reads the grid, and `world.getSelected()` for the outline and the status line

## Game (the controller)
- no `selected`, and no `changed` flag any more
- key 1 / 2: `this.world.selectCreature(...)`
- arrow keys: move `this.world.getSelected()` with `this.world.moveCreature(...)`
- keep the empty `update()` - the game loop still calls it

## main.ts

    const game = new Game();
    const display = new Display(game.world);
    game.world.attach(display);     // the Display observes the World
    display.render();               // draw the first frame - nothing has changed yet, so nobody was notified

- the keydown listener just calls `game.handleKey()` - nothing else
- the game loop no longer checks for changes: count the frame, `game.update()`, `display.showCounters()`

## counters
- render() calls: 1 at the start, then +1 for each change to the world
- a key that does nothing (e.g. "x") adds nothing
- NEW: an arrow key that bumps into the edge, or another creature, adds nothing either - the world didn't
  change, so it didn't notify (this was the exercise 3 stretch task - Observer gets it for free)

## tests
`tests/Subject.test.ts` (new) - use a small test subject and a test observer that counts its `update()` calls:
- an attached observer is told when the subject changes (and is passed the subject)
- every attached observer is told
- a detached observer is not told any more

`tests/World.test.ts`:
- moving a creature notifies the observers
- a move that is blocked (by the edge, or another creature) does not notify
- `selectCreature()` notifies, and `getSelected()` returns the creature
- a new world has nothing selected

`tests/Game.test.ts`:
- `game.selected` becomes `game.world.getSelected()`
- the `changed` tests go - test instead that a key which does something notifies an observer of
  `game.world`, and a key which doesn't, doesn't

## stretch (optional)
1. add a second observer - e.g. a `Logger` that writes `"ant moved to 3, 5"` to the console in its
   `update()`. Attach it in main.ts: World and Display don't change at all. That is the point of the pattern
2. press **D** to detach the Display (the grid freezes, but the game still runs) and **A** to attach it again

## code style
very simple OO TS - write `public` / `private` / `protected` (and `readonly`) on every property and method
