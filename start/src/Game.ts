// The whole game in ONE class: the grid of squares, the creatures and the food, and drawing the grid on the
// page. Nothing moves yet - see ../exercises/exercise1.md.

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
