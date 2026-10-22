// Tests for src/World.ts - run on every save by "deno task dev", results in test_output/.

import { assertEquals } from "@std/assert";
import { Creature } from "../src/Creature.ts";
import { Food } from "../src/Food.ts";
import { HEIGHT, WIDTH, World } from "../src/World.ts";
import { CountingObserver } from "./CountingObserver.ts";

Deno.test("the grid is 20 wide by 12 high", () => {
  const world = new World();
  assertEquals(world.grid.length, 12);
  assertEquals(world.grid[0].length, 20);
  assertEquals(WIDTH, 20);
  assertEquals(HEIGHT, 12);
});

Deno.test("a new world is all empty squares", () => {
  const world = new World();
  assertEquals(world.getSquare(0, 0), null);
  assertEquals(world.getSquare(11, 19), null);
});

Deno.test("a creature can be added to the grid", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  world.addCreature(ant);
  assertEquals(world.getSquare(3, 4), ant);
});

Deno.test("food can be added to the grid", () => {
  const world = new World();
  const food = new Food("heart.png");
  world.addFood(food, 5, 6);
  assertEquals(world.getSquare(5, 6), food);
});

Deno.test("moving a creature updates its position and the grid", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  world.addCreature(ant);

  world.moveCreature(ant, 0, 1);

  assertEquals(ant.row, 3);
  assertEquals(ant.col, 5);
  assertEquals(world.getSquare(3, 5), ant);
  assertEquals(world.getSquare(3, 4), null);
});

Deno.test("a creature cannot move off the edge of the grid", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 0, 0);
  world.addCreature(ant);

  world.moveCreature(ant, -1, 0);
  world.moveCreature(ant, 0, -1);

  assertEquals(ant.row, 0);
  assertEquals(ant.col, 0);
  assertEquals(world.getSquare(0, 0), ant);
});

Deno.test("a creature cannot move into another creature", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  const rabbit = new Creature("rabbit", "rabbit.png", 3, 5);
  world.addCreature(ant);
  world.addCreature(rabbit);

  world.moveCreature(ant, 0, 1);

  assertEquals(ant.col, 4);
  assertEquals(world.getSquare(3, 4), ant);
  assertEquals(world.getSquare(3, 5), rabbit);
});

Deno.test("a creature that moves onto food eats it", () => {
  const world = new World();
  const ant = new Creature("ant", "ant.png", 3, 4);
  world.addCreature(ant);
  world.addFood(new Food("heart.png"), 3, 5);

  world.moveCreature(ant, 0, 1);

  assertEquals(world.getSquare(3, 5), ant);
});

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
