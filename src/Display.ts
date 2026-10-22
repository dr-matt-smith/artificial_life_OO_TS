// The VIEW: the only class that talks to the page (the DOM). render() loops over the grid and rebuilds the
// whole HTML table.
// It is also an OBSERVER in the Observer pattern: attached to the World, it is told every time the world
// changes - and redraws.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { Observer } from "./Observer.ts";
import { Subject } from "./Subject.ts";
import { World } from "./World.ts";

export class Display implements Observer {
  private readonly world: World;
  private readonly table: HTMLTableElement | null;
  private readonly status: HTMLParagraphElement | null;
  private readonly counters: HTMLParagraphElement | null;
  private renderCount = 0; // how many times render() has been called

  constructor(world: World) {
    this.world = world;
    this.table = document.querySelector<HTMLTableElement>("#grid");
    this.status = document.querySelector<HTMLParagraphElement>("#status");
    this.counters = document.querySelector<HTMLParagraphElement>("#counters");
  }

  /** Called by the World (via notify()) every time it changes. */
  public update(subject: Subject): void {
    if (subject === this.world) {
      this.render();
    }
  }

  /** Shows the frame count and the render() count. Called every frame, so it is kept cheap. */
  public showCounters(frameCount: number): void {
    if (!this.counters) return;
    this.counters.textContent = `Frames: ${frameCount} | render() calls: ${this.renderCount}`;
  }

  /** Redraws the grid and the status line from the current state of the world. */
  public render(): void {
    this.renderCount++;
    if (!this.table || !this.status) return;

    const selectedCreature = this.world.getSelected();
    let html = "";
    for (const row of this.world.grid) {
      html += "<tr>";
      for (const square of row) {
        if (square instanceof Creature) {
          const selected = square === selectedCreature ? " class=\"selected\"" : "";
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

    this.status.textContent = `Selected: ${selectedCreature ? selectedCreature.name : "nothing"}`;
  }
}
