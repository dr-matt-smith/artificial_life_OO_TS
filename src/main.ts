// main.ts wires everything together: it creates the game and its display, passes each key press to the
// game, and runs the game loop - which only redraws when something has changed.

import { Display } from "./Display.ts";
import { Game } from "./Game.ts";

const game = new Game();
const display = new Display(game);

document.addEventListener("keydown", (event) => {
  game.handleKey(event.key); // sets game.changed if the key did something - the game loop redraws

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
});


// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls - which only goes up when something has changed.
let frameCount = 0;
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) one tick of the simulation
    game.update();

    // (3) update HTML display of world grid data - only if something has changed
    if (game.changed) {
        display.render();
        game.changed = false;
    }

    // (4) update HTML display of counters
    display.showCounters(frameCount);

    // (5) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
