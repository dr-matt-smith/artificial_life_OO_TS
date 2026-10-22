// The VIEW: the only class that talks to the page (the DOM). Every time the world changes,
// render() loops over the grid and rebuilds the whole HTML table.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { Game } from "./Game.ts";

export class Display {
  private readonly game: Game;
  private readonly table: HTMLTableElement | null;
  private readonly status: HTMLParagraphElement | null;
  private readonly counters: HTMLParagraphElement | null;
  private renderCount = 0; // how many times render() has been called

  constructor(game: Game) {
    this.game = game;
    this.table = document.querySelector<HTMLTableElement>("#grid");
    this.status = document.querySelector<HTMLParagraphElement>("#status");
    this.counters = document.querySelector<HTMLParagraphElement>("#counters");
  }

  /** Shows the frame count and the render() count. Called every frame, so it is kept cheap. */
  public showCounters(frameCount: number): void {
    if (!this.counters) return;
    this.counters.textContent = `Frames: ${frameCount} | render() calls: ${this.renderCount}`;
  }

  /** Redraws the grid and the status line from the current state of the game. */
  public render(): void {
    this.renderCount++;
    if (!this.table || !this.status) return;

    let html = "";
    for (const row of this.game.world.grid) {
      html += "<tr>";
      for (const square of row) {
        if (square instanceof Creature) {
          const selected = square === this.game.selected ? " class=\"selected\"" : "";
          html += `<td${selected}><img src="${square.image}" alt="${square.name}"></td>`;
        } else if (square instanceof Food) {
          html += `<td><img src="${square.image}" alt="food"></td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    this.table.innerHTML = html;

    this.status.textContent = `Selected: ${this.game.selected.name}`;
  }
}
