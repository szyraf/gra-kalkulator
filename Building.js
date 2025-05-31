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
    upgrades = [];

    constructor(jsonObject, gridX, gridY) {
        this.name = jsonObject["Name"];
        this.Description = jsonObject["Description"];
        this.cost = jsonObject["Cost"];
        this.energyPerHour = jsonObject["EnergyPerHour"];
        this.type = jsonObject["Type"];
        this.gridX = gridX;
        this.gridY = gridY;

        this.currentEnergy = 0;
    }
}

export const BuildingType = {
    consumer: 1,
    producent: 2,
    bank: 3,
};
