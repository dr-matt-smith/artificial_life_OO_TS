// The MODEL: a grid of squares. Each square is empty (null), or has a creature or some food in it.
// No DOM in here - so it can be tested with Deno, away from the browser.
// It is also the SUBJECT in the Observer pattern: every change to it notifies its observers (e.g. the Display).

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { Subject } from "./Subject.ts";

export const WIDTH = 20;
export const HEIGHT = 12;

export class World extends Subject {
  public readonly grid: (Creature | Food | null)[][];
  private selected: Creature | null = null; // the creature the player controls - null until one is selected

  constructor() {
    super();
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
  public getSquare(row: number, col: number): Creature | Food | null {
    return this.grid[row][col];
  }

  /** Returns the selected creature (null if none has been selected yet). */
  public getSelected(): Creature | null {
    return this.selected;
  }

  /** Selects a creature - the one the player controls. */
  public selectCreature(creature: Creature): void {
    this.selected = creature;
    this.notify();
  }

  /** Puts a creature on the grid, at its own row and col. */
  public addCreature(creature: Creature): void {
    this.grid[creature.row][creature.col] = creature;
    this.notify();
  }

  /** Puts some food in a square. */
  public addFood(food: Food, row: number, col: number): void {
    this.grid[row][col] = food;
    this.notify();
  }

  /**
   * Moves a creature one step (dRow, dCol). It stays where it is if that would take it off the
   * grid, or into another creature. If there is food there, it eats it.
   */
  public moveCreature(creature: Creature, dRow: number, dCol: number): void {
    const newRow = creature.row + dRow;
    const newCol = creature.col + dCol;

    if (newRow < 0 || newRow >= HEIGHT || newCol < 0 || newCol >= WIDTH) {
      return; // off the edge - nothing changed, so nobody is notified
    }
    if (this.grid[newRow][newCol] instanceof Creature) {
      return; // square already taken - nothing changed, so nobody is notified
    }

    this.grid[creature.row][creature.col] = null;
    creature.row = newRow;
    creature.col = newCol;
    this.grid[newRow][newCol] = creature; // replaces any food that was there
    this.notify();
  }
}
