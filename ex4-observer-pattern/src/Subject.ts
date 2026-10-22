// SUBJECT (the Observer pattern): something that observers can watch. It keeps a list of its observers, and
// tells every one of them when it changes. Abstract, because every subject does this in the same way - so
// the code is written once, here, and each subject (e.g. World) just extends it and calls notify().

import type { Observer } from "./Observer.ts";

export abstract class Subject {
  private readonly observers: Observer[] = [];

  /** Starts telling this observer about changes. */
  public attach(observer: Observer): void {
    this.observers.push(observer);
  }

  /** Stops telling this observer about changes. */
  public detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  /** Tells every attached observer that this subject has changed. Only a subject can call it, on itself. */
  protected notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}
