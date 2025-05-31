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
        this.name = jsonObject["name"];
        this.description = jsonObject["description"];
        this.cost = jsonObject["cost"];
        this.energyPerHour = jsonObject["energyPerHour"];
        this.type = jsonObject["type"];
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
