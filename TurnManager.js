import { nextDay } from "./date-weather.js";
const hourDuration = 1000;

export class TurnManager {
  #updateInterval;
  #game;
  #playButton;
  #playing = false;
  #hour = 8;

  constructor(game) {
    this.#hour = 8;
    this.#game = game;
    game.updateEnergy(this.#hour);
    game.updateWeatherInfo();
    this.#playButton = document.getElementById("startTurnButton");
    this.#playButton.addEventListener("click", () => {
      this.playTurn(this);
    });
  }

  playTurn() {
    if (this.#playing) return;
    this.#playButton.style.display = "none";
    this.#playing = true;
    this.#hour = 8;
    this.#game.updateTimeInfo(this.#hour);
    this.#updateInterval = window.setInterval(() => {
      this.#update();
    }, hourDuration);
  }

  #update() {
    if (this.#hour == 23) {
      nextDay();
      console.log(localStorage.getItem("dayOffset"));
    } else if (this.#hour >= 32) {
      window.clearInterval(this.#updateInterval);
      this.#endTurn();
      return;
    }
    this.#hour += 1;
    this.#game.updateEnergy(this.#hour % 24);
    this.#game.updateWeatherInfo();
    this.#game.updateTimeInfo(this.#hour % 24);
  }

  #endTurn() {
    this.#playing = false;
    this.#playButton.style.display = "";
    this.#game.startDay();
  }
}
