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


// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls.
let frameCount = 0;
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) update HTML display of world grid data
    display.render();

    // (3) update HTML display of counters
    display.showCounters(frameCount);

    // (4) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
