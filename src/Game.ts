// The CONTROLLER: sets up the world, and turns key presses into changes to it.
// No DOM in here either - main.ts passes in the name of each key that is pressed.

import { Creature } from "./Creature.ts";
import { Food } from "./Food.ts";
import { World } from "./World.ts";

export class Game {
  public readonly world: World;
  public readonly ant: Creature;
  public readonly rabbit: Creature;
  public selected: Creature;

  constructor() {
    this.world = new World();

    this.ant = new Creature("ant", "images/sprites/ant.png", 2, 3);
    this.rabbit = new Creature("rabbit", "images/sprites/rabbit.png", 8, 15);
    this.world.addCreature(this.ant);
    this.world.addCreature(this.rabbit);

    this.world.addFood(new Food("images/sprites/carrot.png"), 2, 8);
    this.world.addFood(new Food("images/sprites/carrot.png"), 5, 12);
    this.world.addFood(new Food("images/sprites/carrot.png"), 9, 4);

    this.selected = this.ant;
  }

  /** Handles one key press, e.g. "1", "2", "ArrowUp". */
  public handleKey(key: string): void {
    if (key === "1") {
      this.selected = this.ant;
    } else if (key === "2") {
      this.selected = this.rabbit;
    } else if (key === "ArrowUp") {
      this.world.moveCreature(this.selected, -1, 0);
    } else if (key === "ArrowDown") {
      this.world.moveCreature(this.selected, 1, 0);
    } else if (key === "ArrowLeft") {
      this.world.moveCreature(this.selected, 0, -1);
    } else if (key === "ArrowRight") {
      this.world.moveCreature(this.selected, 0, 1);
    }
  }
}
