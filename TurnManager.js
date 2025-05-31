import { BuildingType } from "./Building";

const hourDuration = 2000;

export class TurnManager {
    #updateInterval;
    #game;
    #weather;
    #weatherIndex = 0;
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
        this.#game.updateEnergy(this.#weather[this.#weatherIndex]);
    }

    #endTurn() {
        this.#weatherIndex += 1;
        if (this.#weatherIndex >= 7) this.#getNewWeather();
    }

    #getNewWeather() {
        this.#weatherIndex = 0;
    }
}
