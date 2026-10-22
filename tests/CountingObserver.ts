// A test double (not a test file): an Observer that just counts how many times it has been told about a change.

import { Observer } from "../src/Observer.ts";
import { Subject } from "../src/Subject.ts";

export class CountingObserver implements Observer {
  public count = 0;
  public lastSubject: Subject | null = null;

  public update(subject: Subject): void {
    this.count++;
    this.lastSubject = subject;
  }
}
