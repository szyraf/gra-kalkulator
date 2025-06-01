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
  solarSmall: 2,
  wind: 3,
  none: 4,
};
