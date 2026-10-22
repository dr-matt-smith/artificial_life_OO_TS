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
