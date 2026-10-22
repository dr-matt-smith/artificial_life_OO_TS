# Exercise 1 - move creatures with the keyboard

start from: `main`
a solution: branch `ex1-move-creatures-with-keyboard`

## where you start
a 20 wide by 12 high grid - each square is empty, or has a creature or food in it

- two creatures: the ant and the rabbit
- three carrots (food)
- the ant is selected to start with (it has a green outline)

everything is in ONE class: `Game` (in `src/Game.ts`)

nothing moves yet

## what to add

### player controls
- **1** / **2** - select the ant / the rabbit
- **arrow keys** - move the selected creature 1 step in the arrow key's direction

### rules for moving
- a creature can't move off the edge of the grid
- a creature can't move into a square that has another creature in it
- a creature that moves onto food eats it (the food disappears)

## design
add 2 methods to Game:

    public moveCreature(creature: Creature, dRow: number, dCol: number): void
    public handleKey(key: string): void

- `moveCreature()` - moves a creature one step, following the rules above. Remember to update BOTH the
  grid and the creature's own `row` and `col`
- `handleKey()` - takes the name of a key (e.g. `"1"`, `"ArrowUp"`) and selects or moves a creature

in `main.ts`, listen for key presses and pass each key's name to the game:

    document.addEventListener("keydown", (event) => { ... event.key ... });

hint: call `event.preventDefault()` for the arrow keys - otherwise they scroll the page as well

## tests to write first
in `tests/Grid.test.ts`:
- moving a creature updates its position and the grid
- a creature cannot move off the edge of the grid
- a creature cannot move into another creature
- a creature that moves onto food eats it

in `tests/Game.test.ts`:
- key 2 selects the rabbit, key 1 selects the ant
- arrow keys move the selected creature one step
- arrow keys only move the selected creature
- other keys (e.g. "x") do nothing

`handleKey()` takes a plain string, not a browser event - so it can be tested with Deno, away from the browser

## code style
very simple OO TS - write `public` / `private` (and `readonly`) on every property and method
