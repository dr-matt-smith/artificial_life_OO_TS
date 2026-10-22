// main.ts wires everything together: it creates the game and its display, and passes each key
// press to the game, then redraws.

import { Display } from "./Display.ts";
import { Game } from "./Game.ts";

const game = new Game();
const display = new Display(game);

document.addEventListener("keydown", (event) => {
  game.handleKey(event.key);

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
  display.render();
});

display.render();

// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls - which only goes up when a key is pressed.
let frameCount = 0;
function frame(): void {
  frameCount++;
  display.showCounters(frameCount);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
