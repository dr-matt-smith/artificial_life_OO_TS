# Exercise 6 - the State pattern: creatures with a life of their own

start from: folder `ex4-observer-pattern/`, or your own exercise 5
a solution: none - this one is for you to explore in your own way. Below are ideas, questions and hints, not
a recipe

## the idea
so far, creatures only move when the player presses a key. Give them a life of their own: each creature is
in a **state**, and what it does on each tick depends on that state. For example:

| State | What the creature does each tick | Moves to another state when ... |
|---|---|---|
| `Wandering` | takes a random step now and then; gets hungrier | it gets hungry enough -> `Hungry` |
| `Hungry` | heads towards the nearest food | it reaches food -> `Eating` |
| `Eating` | stays still for a few ticks; hunger goes down | it has finished -> `Wandering` |

this is what the empty `Game.update()` from exercise 3 was left there for: the game loop already calls it
every frame - it just needs something to do

## the problem the State pattern solves
the obvious first version is a `state` string and a big `if` in the creature:

    if (this.state === "wandering") { ... } else if (this.state === "hungry") { ... } else if ...

it works for two states. With five states, each with its own rules for what to do AND when to change, that
`if` grows in every method, and every new state means editing all of them

## the State pattern (Gang of Four)
"Allow an object to alter its behavior when its internal state changes. The object will appear to change
its class."

| GoF role | in this project |
|---|---|
| Context | `Creature` - holds its current state, and passes the work to it |
| State | an interface (or abstract class), e.g. `CreatureState` with `update(creature, world)` |
| ConcreteState | `WanderingState`, `HungryState`, `EatingState` - one class per state |

- each state class does ONLY its own behaviour
- each state decides when to switch, and to which state - e.g. `creature.setState(new HungryState())`
- a new state is a new class - the existing states don't change (well, only the ones that switch to it)

## things to build - pick your own route
- give `Creature` a `hunger` (a number) and a `state`
- `Game.update()` asks every creature to `update()` - the creature passes it on to its state
- the selected creature could stay under the player's control - another state, `PlayerControlled`?
- show each creature's state on the page - a coloured outline, a small label, or the status line

## questions to think about
1. **who creates the states?** a new state object on every switch, or one shared object per state? (if the
   state classes hold no data of their own, one shared object is enough - why?)
2. **where does the data live?** `hunger` belongs to the creature, but how long it has been eating could
   belong to `EatingState`. What is the difference?
3. **speed** - the game loop runs about 60 times a second. A creature that moves on every tick crosses the
   grid in a fraction of a second. How do you slow it down? (count ticks? use the time between frames?)
4. **randomness** - wandering is random, but random code is hard to test. How can a test control it? (hint:
   pass in a function that picks the direction - a test can pass one that always picks "right")
5. **finding food** - how does a hungry creature know where the nearest food is? Which class should answer
   that question: the creature, its state, or the World?
6. **redrawing** - creatures now move with no key pressed. Does your Observer (or event bus) already redraw
   for these moves? What happens to the `render() calls` counter? Is one redraw per creature per frame a
   problem yet? (see the trade-off at the end of exercise4_SOLUTION.md)

## ideas to take it further
- new states: `Sleeping`, `Fleeing` (the rabbit runs from the ... snake? there is a sprite for one in
  `public/images/sprites/`), `Dead` (hunger reached its limit)
- food that grows back after a while - food can have states too
- different creatures with different rules - an ant that is never hungry for long, a rabbit that sleeps a lot
- draw a **state diagram** (UML state machine) for a creature before you code it: the states are the boxes,
  and the arrows are labelled with what causes each switch

## testing hints
- states need no DOM, so they can be tested with Deno:
  - a wandering creature that gets hungry enough switches to `Hungry`
  - a hungry creature next to food moves onto it, and switches to `Eating`
  - an eating creature's hunger goes down, and it switches back to `Wandering` when it has finished
- test each state class on its own: make a small World, put a creature in the state you want, call
  `update()` a few times, and check where it is and what state it is in

## code style
very simple OO TS - write `public` / `private` / `protected` (and `readonly`) on every property and method
