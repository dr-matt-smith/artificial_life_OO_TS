// Tests for setting up the game in src/Game.ts.

import { assertEquals } from "@std/assert";
import { Game } from "../src/Game.ts";

Deno.test("the game starts with an ant and a rabbit on the grid", () => {
  const game = new Game();
  assertEquals(game.getSquare(game.ant.row, game.ant.col), game.ant);
  assertEquals(game.getSquare(game.rabbit.row, game.rabbit.col), game.rabbit);
});

Deno.test("the ant is selected to start with", () => {
  const game = new Game();
  assertEquals(game.selected, game.ant);
});
