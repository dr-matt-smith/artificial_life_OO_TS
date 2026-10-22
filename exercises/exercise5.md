# Exercise 5 - publish / subscribe (an event bus)

start from: folder `ex4-observer-pattern/`
a solution: none - this one is for you to explore in your own way. Below are ideas, questions and hints, not
a recipe

## the problem
the Observer pattern still ties the two sides together:

- `Display` must be given the `World`, and must be attached to it: `game.world.attach(display)`
- `World` holds a list of its observers - it has to `extends Subject` to be watched at all
- every observer is told about EVERY change, and works out for itself whether it cares
- to watch something new (e.g. the Game, or a single Creature), that class must become a Subject too

## the publish / subscribe idea
put a go-between in the middle - an **event bus**:

    publisher  --publish("creature-moved", data)-->  EventBus  --calls-->  every subscriber to "creature-moved"

- a **publisher** announces that something happened, on a named **topic** - e.g. `"creature-moved"`
- a **subscriber** asks the bus to call it for a topic - e.g. `bus.subscribe("creature-moved", ...)`
- publishers and subscribers **don't know about each other at all** - they only know the bus, and the
  topic names

that is the key difference from Observer: in Observer, the observer knows the subject, and the subject
holds its observers. In pub-sub, neither side knows the other exists

## things to build - pick your own route
- an `EventBus` class: `subscribe(topic, handler)`, `unsubscribe(...)`, `publish(topic, data)`
- topics for what happens in the game - for example:
  - `"creature-moved"` - which creature, from where, to where
  - `"creature-selected"`
  - `"food-eaten"` - which creature ate it, and where
  - `"move-blocked"` - it tried, but hit the edge or another creature
- the World publishes instead of calling `notify()`
- the Display subscribes to the topics that mean "redraw"

## questions to think about
1. **one bus, or many?** should there be one shared bus for the whole game? who creates it, and how does each
   class get hold of it - passed into its constructor? a global? (what is wrong with a global?)
2. **topic names** - strings are easy to mistype: `"creature-moved"` vs `"creatureMoved"`. Can TypeScript
   help? (try a union type of the allowed names, or a type that maps each topic to its data)
3. **the data** - Observer's `update(subject)` made the observer PULL what it needed. With pub-sub, the
   publisher usually PUSHES the details with the event. What goes in a `"creature-moved"` event? What can a
   subscriber do with it that `update(subject)` couldn't?
4. **does World still need to be a Subject?** what can you delete once the bus is in?
5. **order** - if two subscribers listen to the same topic, which runs first? Should anything depend on that?
6. **unsubscribing** - how does a subscriber stop listening? (hint: `subscribe()` could return a function
   that unsubscribes)

## ideas that pub-sub makes easy
none of these should need the World, the Game or the Display to change - only new subscribers:
- a **message log** under the grid: "ant ate a carrot at 5, 12", "rabbit bumped into the edge"
- a **score** - +1 for each `"food-eaten"`
- a **sound** for each event - make some with the Sound FX tool in `tools/sound-fx/`
- a **statistics** panel: how many moves, how many bumps, food left
- a **replay**: record every event, then play them back

## testing hints
- the bus needs no DOM, so it can be tested with Deno, like the World:
  - a subscriber is called for its topic, with the data
  - a subscriber is NOT called for other topics
  - after unsubscribing, it is not called any more
- test that the World publishes the right event, with the right data, by subscribing a test function to the
  topic - like the `CountingObserver` in exercise 4

## compare
when you have finished, draw the class diagram and compare it with exercise 4's. Which arrows have gone?
Which classes don't import each other any more? What did that cost - what is now harder to follow when you
read the code?

## code style
very simple OO TS - write `public` / `private` / `protected` (and `readonly`) on every property and method
