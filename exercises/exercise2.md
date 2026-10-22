# Exercise 2 - separate Model, Display (view) and Game (controller)

start from: branch `ex1-move-creatures-with-keyboard`
a solution: branch `ex2-separate-model-view-controller`

## the problem
`Game` does every job:
- holds the grid and the rules for moving
- turns key presses into changes
- draws the grid on the web page

so:
- it is big, and every change touches the same class
- the drawing code needs a web page (`document`), so it can't be tested with Deno
- to draw the game differently (e.g. on a canvas), you would have to change the class that has the rules

## the MVC pattern
split `Game` into 3 classes, one job each:

### World (the MODEL) - new file `src/World.ts`
- the grid, and `WIDTH` / `HEIGHT`
- `getSquare()`, `addCreature()`, `addFood()`, `moveCreature()` - move these from Game
- NO DOM in here

### Display (the VIEW) - new file `src/Display.ts`
- the ONLY class that touches the page
- `render()` and `showCounters()` - move these from Game, with `renderCount`
- constructor takes the game: `new Display(game)` - it reads `game.world.grid` and `game.selected`
- look up the page elements (`#grid`, `#status`, `#counters`) once, in the constructor

### Game (the CONTROLLER) - `src/Game.ts`
- creates the World, the ant, the rabbit and the food
- remembers which creature is selected
- `handleKey()` turns a key press into a change to the world: `this.world.moveCreature(...)`
- NO DOM in here either

### main.ts
creates the game AND its display, passes key presses to the game, and runs the game loop calling
`display.render()` and `display.showCounters()`

## which class knows about which
    main.ts  -> Game, Display
    Display  -> Game        (reads it, never changes it)
    Game     -> World
    World    -> nothing     (doesn't know there is a game, or a page)

## tests
- the grid tests become `tests/World.test.ts` - testing `new World()` on its own
- `tests/Game.test.ts` - same tests as before, but the grid is now `game.world`
- Display has no tests - it needs a web page. That is fine: it has no rules in it, only drawing

all the tests should still pass, and the game should look and work exactly the same

## code style
very simple OO TS - write `public` / `private` (and `readonly`) on every property and method

Display's properties can all be `private` - nothing else needs them
