# Exercise 3 - redraw only when something changed

start from: branch `ex2-separate-model-view-controller`

features:

## game loop
main.ts runs a loop with requestAnimationFrame - about 60 frames a second

each frame:
1. count the frame
2. if the game has changed, redraw the grid, then clear the flag
3. show the counters

key presses no longer call render() themselves - the loop does all the drawing

## the changed flag
Game gets a `changed` property (boolean)

- starts as `true` - so the very first frame draws the grid
- set to `true` by handleKey() for keys it handles (1, 2, arrow keys)
- other keys leave it alone (e.g. "x" does not cause a redraw)
- set to `true` by update() whenever it changes the world
- main.ts sets it back to `false` after calling display.render()

## Game.update()
one "tick" of the simulation - called by the game loop every frame

for now it does nothing (so it never sets `changed`)
later versions: creatures wander, get hungry, food grows ...

## MVC
Game (controller) and World (model) still have no DOM in them - so the flag can be tested with Deno

Display (view) does not know about the flag - it just draws when asked

## counters
shown above the grid:

    Frames: 1234 | render() calls: 7

- Frames climbs about 60 a second
- render() calls only goes up when something actually changes (1 for the start, +1 per handled key press)

this is the point of version 2: the expensive work (rebuilding the HTML table) only happens when needed

## tests (tests/Game.test.ts)
- a new game starts with `changed` true
- after clearing it, key 1 / 2 sets `changed` to true
- after clearing it, an arrow key sets `changed` to true
- after clearing it, an unhandled key (e.g. "x") leaves `changed` false
- after clearing it, update() leaves `changed` false (it does nothing yet)

## stretch (optional)
an arrow key that bumps into the edge, or another creature, does not move anything - so it should not set `changed` either
(hint: make World.moveCreature() return true if the creature moved)

## code style
very simple OO TS
