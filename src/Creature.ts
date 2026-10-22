// A creature that lives on the grid. It knows its own name, picture, and where it is.

export class Creature {
  name: string;
  image: string;
  row: number;
  col: number;

  constructor(name: string, image: string, row: number, col: number) {
    this.name = name;
    this.image = image;
    this.row = row;
    this.col = col;
  }
}
