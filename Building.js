export class Building {
  name;
  description;
  cost;
  energyPerHour;
  currentEnergy;
  type;
  art;
  gridX;
  gridY;
  sizeX;
  sizeY;
  scale;
  upgrades = [];

  constructor(jsonObject, gridX, gridY) {
    this.name = jsonObject["name"];
    this.description = jsonObject["description"];
    this.cost = jsonObject["cost"];
    this.energyPerHour = jsonObject["energyPerHour"];
    this.type = jsonObject["type"];
    this.gridX = gridX;
    this.gridY = gridY;
    this.sizeX = jsonObject["sizeX"];
    this.sizeY = jsonObject["sizeY"];
    this.scale = jsonObject["scale"];
    this.energyType = EnergyType[jsonObject["energyType"]];
    this.currentEnergy = 0;
  }

  getProducedEnergy(hour) {
    let weather = JSON.parse(localStorage.getItem("weather"))[0];
    if (this.energyType == EnergyType.wind) {
      let speed = (weather.windSpeed * 1000) / 3600;
      return this.#round(((0.5 * 1.225 * 3.14 * 5026.5 * speed * speed * speed * 0.45) / 1000) * 15); //70m - promień
    } else if (this.energyType == EnergyType.solarSmall) {
      if (hour > weather.sunset || hour < weather.sunrise) return 0;
      let sunPercent = 1 - weather.cloudCoverage / 100;
      return this.#round(27 * 1 * sunPercent * 0.85); //27kw - średnia moc
    } else if (this.energyType == EnergyType.solar) {
      if (hour > weather.sunset || hour < weather.sunrise) return 0;
      let sunPercent = 1 - weather.cloudCoverage / 100;
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
