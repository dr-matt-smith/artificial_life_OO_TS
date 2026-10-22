// The MODEL: a grid of squares. Each square is empty (null), or has a creature or some food in it.
// No DOM in here - so it can be tested with Deno, away from the browser.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";

export const WIDTH = 20;
export const HEIGHT = 12;

export class World {
  grid: (Creature | Food | null)[][];

  constructor() {
    this.grid = [];
    for (let row = 0; row < HEIGHT; row++) {
      const squares: (Creature | Food | null)[] = [];
      for (let col = 0; col < WIDTH; col++) {
        squares.push(null);
      }
      this.grid.push(squares);
    }
  }

  /** Returns what is in a square (null if it is empty). */
  getSquare(row: number, col: number): Creature | Food | null {
    return this.grid[row][col];
  }

  /** Puts a creature on the grid, at its own row and col. */
  addCreature(creature: Creature): void {
    this.grid[creature.row][creature.col] = creature;
  }

  /** Puts some food in a square. */
  addFood(food: Food, row: number, col: number): void {
    this.grid[row][col] = food;
  }

  /**
   * Moves a creature one step (dRow, dCol). It stays where it is if that would take it off the
   * grid, or into another creature. If there is food there, it eats it.
   */
  moveCreature(creature: Creature, dRow: number, dCol: number): void {
    const newRow = creature.row + dRow;
    const newCol = creature.col + dCol;

    if (newRow < 0 || newRow >= HEIGHT || newCol < 0 || newCol >= WIDTH) {
      return; // off the edge
    }
    if (this.grid[newRow][newCol] instanceof Creature) {
      return; // square already taken
    }

    this.grid[creature.row][creature.col] = null;
    creature.row = newRow;
    creature.col = newCol;
    this.grid[newRow][newCol] = creature; // replaces any food that was there
  }
}
