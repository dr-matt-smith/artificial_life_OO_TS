// Tests for src/Game.ts - the player controls.

import { assertEquals } from "@std/assert";
import { Game } from "../src/Game.ts";
import { CountingObserver } from "./CountingObserver.ts";

Deno.test("the game starts with an ant and a rabbit on the grid", () => {
  const game = new Game();
  assertEquals(game.world.getSquare(game.ant.row, game.ant.col), game.ant);
  assertEquals(game.world.getSquare(game.rabbit.row, game.rabbit.col), game.rabbit);
});

Deno.test("the ant is selected to start with", () => {
  const game = new Game();
  assertEquals(game.world.getSelected(), game.ant);
});

Deno.test("key 2 selects the rabbit, key 1 selects the ant", () => {
  const game = new Game();
  game.handleKey("2");
  assertEquals(game.world.getSelected(), game.rabbit);
  game.handleKey("1");
  assertEquals(game.world.getSelected(), game.ant);
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
  assertEquals(game.world.getSelected(), game.ant);
  assertEquals([game.ant.row, game.ant.col], [2, 3]);
});

Deno.test("a key that selects a creature notifies the world's observers", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("2");

  assertEquals(observer.count, 1);
});

Deno.test("an arrow key that moves the creature notifies the world's observers", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("ArrowDown");

  assertEquals(observer.count, 1);
});

Deno.test("an arrow key that is blocked by the edge notifies nobody", () => {
  const game = new Game();
  game.handleKey("ArrowUp"); // the ant starts in row 2 - up twice takes it to row 0, the top edge
  game.handleKey("ArrowUp");
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("ArrowUp");

  assertEquals(game.ant.row, 0);
  assertEquals(observer.count, 0);
});

Deno.test("a key the game does not handle notifies nobody", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.handleKey("x");

  assertEquals(observer.count, 0);
});

Deno.test("update() notifies nobody (it does nothing yet)", () => {
  const game = new Game();
  const observer = new CountingObserver();
  game.world.attach(observer);

  game.update();

  assertEquals(observer.count, 0);
});
