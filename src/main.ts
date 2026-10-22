// main.ts wires everything together: it creates the game and its display, attaches the display to the world
// as an observer, passes each key press to the game, and runs the game loop.

import { Display } from "./Display.ts";
import { Game } from "./Game.ts";

const game = new Game();
const display = new Display(game.world);
game.world.attach(display); // the Display observes the World - it is told every time the world changes
display.render(); // draw the first frame - nothing has changed yet, so nobody has been notified

document.addEventListener("keydown", (event) => {
  game.handleKey(event.key); // any change to the world notifies the Display, which redraws

  if (event.key.startsWith("Arrow")) {
    event.preventDefault(); // stop the arrow keys scrolling the page
  }
});


// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls - which only goes up when the world changes.
let frameCount = 0;
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) one tick of the simulation - any change to the world notifies the Display
    game.update();

    // (3) update HTML display of counters
    display.showCounters(frameCount);

    // (4) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
