// Something a creature can eat. It just sits in one square until it is eaten.

export class Food {
  public readonly image: string;

  constructor(image: string) {
    this.image = image;
  }
}
