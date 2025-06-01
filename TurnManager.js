import { nextDay } from "./date-weather";

const hourDuration = 2000;

export class TurnManager {
    #updateInterval;
    #game;
    #weather;
    #hour = 8;

    constructor(game) {
        this.#game = game;
    }

    playTurn() {
        this.#hour = 8;
        this.#updateInterval = window.setInterval(this.#update, hourDuration);
    }

    #update() {
        if (this.#hour >= 32) {
            window.clearInterval(this.#updateInterval);
            this.#endTurn();
            return;
        }
        this.#hour += 1;
        this.#game.updateEnergy();
    }

    #endTurn() {
        nextDay();
    }
}
