// Tests for the grid part of src/Game.ts - run on every save by "deno task dev", results in test_output/.

import { assertEquals } from "@std/assert";
import { Creature } from "../src/Creature.ts";
import { Food } from "../src/Food.ts";
import { Game, HEIGHT, WIDTH } from "../src/Game.ts";

Deno.test("the grid is 20 wide by 12 high", () => {
  const game = new Game();
  assertEquals(game.grid.length, 12);
  assertEquals(game.grid[0].length, 20);
  assertEquals(WIDTH, 20);
  assertEquals(HEIGHT, 12);
});

Deno.test("squares with nothing in them are empty", () => {
  const game = new Game();
  assertEquals(game.getSquare(0, 0), null);
  assertEquals(game.getSquare(11, 19), null);
});

Deno.test("a creature can be added to the grid", () => {
  const game = new Game();
  const ant = new Creature("ant", "ant.png", 3, 4);
  game.addCreature(ant);
  assertEquals(game.getSquare(3, 4), ant);
});

Deno.test("food can be added to the grid", () => {
  const game = new Game();
  const food = new Food("heart.png");
  game.addFood(food, 5, 6);
  assertEquals(game.getSquare(5, 6), food);
});

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
