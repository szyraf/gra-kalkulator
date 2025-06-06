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
    let energyPerHourData = jsonObject["energyPerHour"];
    this.energyPerHour = energyPerHourData.length > 1 ? this.getRandomInt(energyPerHourData[0], energyPerHourData[1]) : energyPerHourData[0];
    this.type = BuildingType[jsonObject["type"]];
    this.gridX = gridX;
    this.gridY = gridY;
    this.sizeX = jsonObject["sizeX"];
    this.sizeY = jsonObject["sizeY"];
    this.scale = jsonObject["scale"];
    this.upgradePrice = jsonObject["upgradePrice"];
    this.energyType = EnergyType[jsonObject["energyType"]];
    this.currentEnergy = 0;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getProducedEnergy(hour) {
    let weather = JSON.parse(localStorage.getItem("weather"))[0];
    let outcome = 0;
    if (this.energyType == EnergyType.wind) {
      let speed = (weather.windSpeed * 1000) / 3600;
      //outcome = ((0.5 * 1.225 * 3.14 * 5026.5 * speed * speed * speed * 0.45) / 1000) * 15; //70m - promień
      outcome = 2000 * (speed / 11.11);
    } else if (this.energyType == EnergyType.solarSmall) {
      if (hour > weather.sunset || hour < weather.sunrise) return 0;
      let sunPercent = 1 - weather.cloudCoverage / 100;
      let power = this.name == "House" ? 8 : 24;
      outcome = power * 1 * sunPercent * 0.85; //4-8kw - średnia moc
    } else if (this.energyType == EnergyType.solar) {
      if (hour > weather.sunset || hour < weather.sunrise) return 0;
      let sunPercent = 1 - weather.cloudCoverage / 100;
      outcome = 20 * 1 * sunPercent * 0.85; //20kw - średnia moc
    } else if (this.energyType == EnergyType.coal) {
      outcome = this.energyPerHour;
    } else {
      outcome = 0;
    }
    return parseFloat(outcome.toFixed(2));
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
  coal: 4,
  none: 5,
};
