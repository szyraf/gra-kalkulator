export class Building {
    name;
    description;
    energy;
    type;
    art;
    gridX;
    gridY;
    upgrades = [];

    constructor(jsonObject, gridX, gridY) {
        this.name = jsonObject["Name"];
        this.Description = jsonObject["Description"];
        this.Energy = jsonObject["Energy"];
        this.Type = jsonObject["Type"];
        this.art = jsonObject["Art"];
        this.gridX = gridX;
        this.gridY = gridY;
    }
}

export const BuildingType = {
    consumer: 1,
    producent: 2,
    bank: 3,
};
