// The whole game in ONE class: the grid of squares and the rules for moving (model), turning key presses into
// changes (controller), and drawing the grid on the page (view) - all mixed together.
// A starting point to pull apart into separate classes, following the MVC pattern.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";

export const WIDTH = 20;
export const HEIGHT = 12;

export class Game {
  // a grid of squares - each is empty (null), or has a creature or some food in it
  public readonly grid: (Creature | Food | null)[][];
  public readonly ant: Creature;
  public readonly rabbit: Creature;
  public selected: Creature;
  private renderCount = 0; // how many times render() has been called

  constructor() {
    this.grid = [];
    for (let row = 0; row < HEIGHT; row++) {
      const squares: (Creature | Food | null)[] = [];
      for (let col = 0; col < WIDTH; col++) {
        squares.push(null);
      }
      this.grid.push(squares);
    }

    this.ant = new Creature("ant", "images/sprites/ant.png", 2, 3);
    this.rabbit = new Creature("rabbit", "images/sprites/rabbit.png", 8, 15);
    this.addCreature(this.ant);
    this.addCreature(this.rabbit);

    this.addFood(new Food("images/sprites/carrot.png"), 2, 8);
    this.addFood(new Food("images/sprites/carrot.png"), 5, 12);
    this.addFood(new Food("images/sprites/carrot.png"), 9, 4);

    this.selected = this.ant;
  }

  /** Returns what is in a square (null if it is empty). */
  public getSquare(row: number, col: number): Creature | Food | null {
    return this.grid[row][col];
  }

  /** Puts a creature on the grid, at its own row and col. */
  public addCreature(creature: Creature): void {
    this.grid[creature.row][creature.col] = creature;
  }

  /** Puts some food in a square. */
  public addFood(food: Food, row: number, col: number): void {
    this.grid[row][col] = food;
  }

  /**
   * Moves a creature one step (dRow, dCol). It stays where it is if that would take it off the
   * grid, or into another creature. If there is food there, it eats it.
   */
  public moveCreature(creature: Creature, dRow: number, dCol: number): void {
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

  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.selected = this.ant;
    } else if (key === "2") {
      this.selected = this.rabbit;
    } else if (key === "ArrowUp") {
      this.moveCreature(this.selected, -1, 0);
    } else if (key === "ArrowDown") {
      this.moveCreature(this.selected, 1, 0);
    } else if (key === "ArrowLeft") {
      this.moveCreature(this.selected, 0, -1);
    } else if (key === "ArrowRight") {
      this.moveCreature(this.selected, 0, 1);
    }
  }

  /** Shows the frame count and the render() count. Called every frame, so it is kept cheap. */
  public showCounters(frameCount: number): void {
    const counters = document.querySelector<HTMLParagraphElement>("#counters");
    if (!counters) return;
    counters.textContent = `Frames: ${frameCount} | render() calls: ${this.renderCount}`;
  }

  /** Redraws the grid and the status line on the page. */
  public render(): void {
    this.renderCount++;
    const table = document.querySelector<HTMLTableElement>("#grid");
    const status = document.querySelector<HTMLParagraphElement>("#status");
    if (!table || !status) return;

    let html = "";
    for (const row of this.grid) {
      html += "<tr>";
      for (const square of row) {
        if (square instanceof Creature) {
          const selected = square === this.selected ? " class=\"selected\"" : "";
          html += `<td${selected}><img src="${square.image}" alt="${square.name}"></td>`;
        } else if (square instanceof Food) {
          html += `<td><img src="${square.image}" alt="food"></td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    table.innerHTML = html;

    status.textContent = `Selected: ${this.selected.name}`;
  }
}
