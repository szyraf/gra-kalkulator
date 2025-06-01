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
    return this.energyPerHour;
  }
}

export const BuildingType = {
  consumer: 1,
  producent: 2,
  bank: 3,
};

export const EnergyType = {
  solar: 1,
  wind: 2,
  none: 3,
};
