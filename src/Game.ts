// The CONTROLLER: sets up the world, and turns key presses into changes to it.
// No DOM in here either - main.ts passes in the name of each key that is pressed.
// It doesn't tell the Display about changes: the World does that itself, by notifying its observers.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { World } from "./World.ts";

export class Game {
  public readonly world: World;
  public readonly ant: Creature;
  public readonly rabbit: Creature;

  constructor() {
    this.world = new World();

    this.ant = new Creature("ant", "images/sprites/ant.png", 2, 3);
    this.rabbit = new Creature("rabbit", "images/sprites/rabbit.png", 8, 15);
    this.world.addCreature(this.ant);
    this.world.addCreature(this.rabbit);

    this.world.addFood(new Food("images/sprites/carrot.png"), 2, 8);
    this.world.addFood(new Food("images/sprites/carrot.png"), 5, 12);
    this.world.addFood(new Food("images/sprites/carrot.png"), 9, 4);

    this.world.selectCreature(this.ant);
  }

  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.world.selectCreature(this.ant);
    } else if (key === "2") {
      this.world.selectCreature(this.rabbit);
    } else if (key === "ArrowUp") {
      this.moveSelected(-1, 0);
    } else if (key === "ArrowDown") {
      this.moveSelected(1, 0);
    } else if (key === "ArrowLeft") {
      this.moveSelected(0, -1);
    } else if (key === "ArrowRight") {
      this.moveSelected(0, 1);
    }
  }

  /**
   * One "tick" of the simulation - main.ts calls it every frame. It does nothing yet: later, creatures
   * could wander, get hungry, ... - by calling World methods, which notify the observers.
   */
  public update(): void {
  }

  /** Moves the selected creature one step (if one is selected). */
  private moveSelected(dRow: number, dCol: number): void {
    const selected = this.world.getSelected();
    if (selected) {
      this.world.moveCreature(selected, dRow, dCol);
    }
  }
}
