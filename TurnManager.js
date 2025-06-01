import { nextDay } from "./date-weather";

const hourDuration = 2000;

export class TurnManager {
    #updateInterval;
    #game;
    #playing = false;
    #hour = 8;

    constructor(game) {
        this.#game = game;
        document.getElementById("startTurnButton").addEventListener("click", () => {
            this.playTurn();
        });
    }

    playTurn() {
        if (this.#playing) return;
        this.#playing = true;
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
        this.#playing = false;
    }
}
