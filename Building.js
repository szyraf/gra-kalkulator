export class Building {
  name;
  description;
  cost;
  energyPerHour;
  currentEnergy;
  type;
  energyType;
  art;
  gridX;
  gridY;
  upgrades = [];

  constructor(jsonObject, gridX, gridY) {
    this.name = jsonObject["name"];
    this.description = jsonObject["description"];
    this.cost = jsonObject["cost"];
    this.energyPerHour = jsonObject["energyPerHour"];
    this.type = BuildingType[jsonObject["type"]];
    this.gridX = gridX;
    this.gridY = gridY;
    this.energyType = EnergyType.wind;
    this.currentEnergy = 0;
  }

  getProducedEnergy() {
    let weather = JSON.parse(localStorage.getItem("weather"))[0];
    if (this.energyType == EnergyType.wind) {
      let speed = (weather.windSpeed * 1000) / 3600;
      return this.#round(((0.5 * 1.225 * 3.14 * 5026.5 * speed * speed * speed * 0.45) / 1000) * 15); //70m - promień
    } else if (this.energyType == EnergyType.solarSmall) {
      let sunPercent = 1 - weather.cloud / 100;
      return this.#round(27 * 1 * sunPercent * 0.85); //27kw - średnia moc
    } else if (this.energyType == EnergyType.solar) {
      let sunPercent = 1 - weather.cloud / 100;
      return this.#round(86820 * 1 * sunPercent * 0.85); //86820kw - średnia moc
    } else {
      return 0;
    }
  }

  #round(number) {
    return Math.round(number * 100) / 100;
  }
}

export const BuildingType = {
  consumer: 1,
  producent: 2,
  bank: 3,
};

export const EnergyType = {
  solar: 1,
  solarSmall: 2,
  wind: 3,
  none: 4,
};
