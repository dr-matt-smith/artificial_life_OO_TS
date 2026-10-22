// main.ts starts everything: it creates the game and runs the game loop.

import { Game } from "./Game.ts";

const game = new Game();

// Counts every frame the browser draws (about 60 a second), and shows it next to the number of
// render() calls.
let frameCount = 0;
function frame(): void {
    // (1) increment frame count
    frameCount++;

    // (2) update HTML display of world grid data
    game.render();

    // (3) update HTML display of counters
    game.showCounters(frameCount);

    // (4) repeat this game loop next frame ....
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
