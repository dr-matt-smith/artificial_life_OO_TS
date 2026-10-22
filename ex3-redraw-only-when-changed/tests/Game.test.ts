// Tests for src/Game.ts - the player controls.

import { assertEquals } from "@std/assert";
import { Game } from "../src/Game.ts";

Deno.test("the game starts with an ant and a rabbit on the grid", () => {
  const game = new Game();
  assertEquals(game.world.getSquare(game.ant.row, game.ant.col), game.ant);
  assertEquals(game.world.getSquare(game.rabbit.row, game.rabbit.col), game.rabbit);
});

Deno.test("the ant is selected to start with", () => {
  const game = new Game();
  assertEquals(game.selected, game.ant);
});

Deno.test("key 2 selects the rabbit, key 1 selects the ant", () => {
  const game = new Game();
  game.handleKey("2");
  assertEquals(game.selected, game.rabbit);
  game.handleKey("1");
  assertEquals(game.selected, game.ant);
});

Deno.test("arrow keys move the selected creature one step", () => {
  const game = new Game();
  const row = game.ant.row;
  const col = game.ant.col;

  game.handleKey("ArrowDown");
  assertEquals([game.ant.row, game.ant.col], [row + 1, col]);
  game.handleKey("ArrowRight");
  assertEquals([game.ant.row, game.ant.col], [row + 1, col + 1]);
  game.handleKey("ArrowUp");
  assertEquals([game.ant.row, game.ant.col], [row, col + 1]);
  game.handleKey("ArrowLeft");
  assertEquals([game.ant.row, game.ant.col], [row, col]);
});

Deno.test("arrow keys only move the selected creature", () => {
  const game = new Game();
  const rabbitRow = game.rabbit.row;
  game.handleKey("1");
  game.handleKey("ArrowDown");
  assertEquals(game.rabbit.row, rabbitRow);
});

Deno.test("other keys do nothing", () => {
  const game = new Game();
  game.handleKey("x");
  assertEquals(game.selected, game.ant);
  assertEquals([game.ant.row, game.ant.col], [2, 3]);
});

Deno.test("a new game starts with changed true, so the first frame draws the grid", () => {
  const game = new Game();
  assertEquals(game.changed, true);
});

Deno.test("keys 1 and 2 set changed", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("2");
  assertEquals(game.changed, true);

  game.changed = false;
  game.handleKey("1");
  assertEquals(game.changed, true);
});

Deno.test("an arrow key sets changed", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("ArrowDown");
  assertEquals(game.changed, true);
});

Deno.test("a key the game does not handle leaves changed false", () => {
  const game = new Game();
  game.changed = false;
  game.handleKey("x");
  assertEquals(game.changed, false);
});

Deno.test("update() leaves changed false (it does nothing yet)", () => {
  const game = new Game();
  game.changed = false;
  game.update();
  assertEquals(game.changed, false);
});
