// OBSERVER (the Observer pattern): anything that wants to be told when a Subject changes.
// The subject passes itself to update(), and the observer reads ("pulls") whatever it needs from it.

import type { Subject } from "./Subject.ts";

export interface Observer {
  update(subject: Subject): void;
}
