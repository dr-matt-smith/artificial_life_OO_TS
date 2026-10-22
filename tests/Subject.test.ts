// Tests for src/Subject.ts - the Subject half of the Observer pattern.

import { assertEquals } from "@std/assert";
import { Subject } from "../src/Subject.ts";
import { CountingObserver } from "./CountingObserver.ts";

// Subject is abstract, so the tests need a subject of their own - one that can announce a change.
class TestSubject extends Subject {
  public change(): void {
    this.notify();
  }
}

Deno.test("an attached observer is told when the subject changes, and is passed the subject", () => {
  const subject = new TestSubject();
  const observer = new CountingObserver();
  subject.attach(observer);

  subject.change();

  assertEquals(observer.count, 1);
  assertEquals(observer.lastSubject, subject);
});

Deno.test("every attached observer is told", () => {
  const subject = new TestSubject();
  const first = new CountingObserver();
  const second = new CountingObserver();
  subject.attach(first);
  subject.attach(second);

  subject.change();

  assertEquals(first.count, 1);
  assertEquals(second.count, 1);
});

Deno.test("a detached observer is not told any more", () => {
  const subject = new TestSubject();
  const observer = new CountingObserver();
  subject.attach(observer);
  subject.change();

  subject.detach(observer);
  subject.change();

  assertEquals(observer.count, 1);
});
