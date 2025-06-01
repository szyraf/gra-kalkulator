import { Building, BuildingType, EnergyType } from "./Building.js";
import { imageManager } from "./imageManager.js";
import { Grid } from "./grid.js";
import { startingDate } from "./date-weather.js";
import { TurnManager } from "./TurnManager.js";

const startBudget = 4050000;

class Game {
  constructor(buildingsData) {
    this.buildingsData = buildingsData;
    this.initializeGameState();
    this.initializeCanvas();
    this.setupEventListeners();
    this.startGameLoop();
  }

  startDay() {
    this.money = this.dailyBudget;
  }

  initializeGameState() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 250;
    this.texture = document.getElementById("texture");
    this.backgroundPattern = null;

    startingDate();

    if (this.texture.complete) {
      this.backgroundPattern = this.createScaledPattern(this.texture, 0.38); // 0.5 = 2x częściej
    } else {
      this.texture.onload = () => {
        this.backgroundPattern = this.createScaledPattern(this.texture, 0.38);
      };
    }
    this.grid = new Grid(this.gridSize);
    this.buildings = [];
    this.selectedBuilding = null;
    this.selectedBlueprint = null;
    this.day = "1 - Godzina: 8:00";
    this.hour = 8;
    this.weather = this.createInitialWeather();
    this.energy = this.createInitialEnergyState();
    this.camera = this.createInitialCameraState();
    this.dailyBudget = startBudget;
    this.mouseMovementCount = 0;
    this.hoverPosition = null;
    this.buildingAtPosition = null;
    this.money = this.dailyBudget;
  }

  createInitialWeather() {
    return {
      type: "sunny",
      sunlight: 100,
      wind: 5,
    };
  }

  createInitialEnergyState() {
    return {
      available: 0,
      production: 0,
      consumption: 0,
    };
  }

  createInitialCameraState() {
    return {
      x: 0,
      y: 0,
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 100,
    };
  }

  initializeCanvas() {
    this.resizeCanvasToWindow();
    window.addEventListener("resize", () => this.resizeCanvasToWindow());
  }

  resizeCanvasToWindow() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("wheel", (e) => this.handleZoom(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseUp());
    this.canvas.addEventListener("mousemove", (e) => this.handleHover(e));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideBuildingInfo();
        this.selectedBlueprint = null;
      }
    });
  }

  handleZoom(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const mousePosition = this.getMousePosition(e);
    const worldPositionBeforeZoom = this.screenToWorldCoordinates(mousePosition.x, mousePosition.y);

    if (e.deltaY < 0) {
      this.camera.zoom = Math.min(this.camera.zoom * zoomFactor, this.camera.maxZoom);
    } else {
      this.camera.zoom = Math.max(this.camera.zoom / zoomFactor, this.camera.minZoom);
    }

    const worldPositionAfterZoom = this.screenToWorldCoordinates(mousePosition.x, mousePosition.y);
    this.adjustCameraPosition(worldPositionBeforeZoom, worldPositionAfterZoom);
  }

  getMousePosition(e) {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }

  screenToWorldCoordinates(screenX, screenY) {
    return {
      x: (screenX - this.camera.x) / this.camera.zoom,
      y: (screenY - this.camera.y) / this.camera.zoom,
    };
  }

  adjustCameraPosition(worldBefore, worldAfter) {
    this.camera.x += (worldAfter.x - worldBefore.x) * this.camera.zoom;
    this.camera.y += (worldAfter.y - worldBefore.y) * this.camera.zoom;
  }

  handleMouseDown(e) {
    if (e.button === 1 || e.button === 0) {
      this.mouseMovementCount = 0;
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      this.mouseMovementCount += 1;
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      this.updateCameraPosition(deltaX, deltaY);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  updateCameraPosition(deltaX, deltaY) {
    this.camera.x += deltaX;
    this.camera.y += deltaY;
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleClick(e) {
    if (this.isDragging) return;
    if (this.mouseMovementCount >= 10) return;

    const clickPosition = this.getClickPosition(e);
    clickPosition.x = clickPosition.x - this.gridSize / 2;
    const gridPosition = this.grid.worldToGridCoordinates(clickPosition.x, clickPosition.y);
    const clickedBuilding = this.findBuildingAtPosition(gridPosition.x, gridPosition.y);

    if (clickedBuilding) {
      this.showBuildingInfo(clickedBuilding);
    } else {
      if (this.selectedBlueprint != null) {
        if (this.canPlaceBuildingAtPosition(gridPosition.x, gridPosition.y, this.selectedBlueprint.sizeX, this.selectedBlueprint.sizeY)) {
          this.hideBuildingInfo();
          document.getElementById("building-upgrade").style.display = "none";
          this.addBuilding(this.selectedBlueprint, gridPosition.x, gridPosition.y);
        }
      }
    }
  }

  getClickPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return this.screenToWorldCoordinates(screenX, screenY);
  }

  findBuildingAtPosition(gridX, gridY) {
    return this.buildings.find((b) => {
      return gridX <= b.gridX && gridX >= b.gridX - (b.sizeX - 1) && gridY <= b.gridY && gridY >= b.gridY - (b.sizeY - 1);
    });
  }

  canPlaceBuildingAtPosition(gridX, gridY, buildingSizeX, buildingSizeY) {
    for (let building of this.buildings) {
      for (let i = 0; i < buildingSizeX; i++) {
        for (let j = 0; j < buildingSizeY; j++) {
          if (gridX - i <= building.gridX && gridX - i >= building.gridX - (building.sizeX - 1) && gridY - j <= building.gridY && gridY - j >= building.gridY - (building.sizeY - 1)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  showBuildingInfo(building) {
    this.selectedBuilding = building;
    const infoPanel = document.getElementById("buildingInfo");
    this.updateBuildingInfoPanel(building, infoPanel);

    const buildingPosition = this.calculateBuildingPosition(building);
    const screenPosition = this.worldToScreenCoordinates(buildingPosition.x, buildingPosition.y);

    infoPanel.style.display = "block";
  }

  worldToScreenCoordinates(worldX, worldY) {
    return {
      x: worldX * this.camera.zoom + this.camera.x,
      y: worldY * this.camera.zoom + this.camera.y,
    };
  }

  updateBuildingInfoPanel(building, infoPanel) {
    document.getElementById("building-name").textContent = building.description;
    const energyInfoPrefix = this.getEnergyInfoPrefix(building);
    document.getElementById("building-energy").textContent = this.getEnergyInfoText(building);
    document.getElementById("building-upgrades").textContent = `Ulepszenia: ${building.upgrades.join(", ") || "Brak"}`;

    //Tutaj jest cena zakupu panelu w budynku vvvvvvvvv
    document.getElementById("building-upgrade").textContent = `Kup panel solarny: ${building.upgradePrice} `;

    if (building.type === BuildingType.consumer && building.energyType !== EnergyType.solarSmall) {
      document.getElementById("building-upgrade").style.display = "block";

      document.getElementById("building-upgrade").onclick = () => {
        if (this.money >= 5) {
          this.money -= 5;
          building.energyType = EnergyType.solarSmall;
          imageManager.updateCosts();
          building.name = building.name + "S";
          building.upgrades.push("Panele słoneczne");
          this.drawBuilding(building);
          this.updateBuildingInfoPanel(building, infoPanel);
        } else {
          alert("Nie masz wystarczająco pieniędzy na ulepszenie tego budynku.");
        }
      };
    } else {
      document.getElementById("building-upgrade").style.display = "none";
    }
  }

  getEnergyInfoText(building) {
    const energyInfoPrefix = this.getEnergyInfoPrefix(building);
    let energy = 0;
    if (building.type == BuildingType.bank) energy = building.currentEnergy;
    else if (building.type == BuildingType.consumer) energy = building.energyPerHour - building.getProducedEnergy(this.hour);
    else energy = building.getProducedEnergy(this.hour);
    let energyUnit = "kWh";
    if (energy >= 1000) {
      energyUnit = "MWh";
      energy = energy / 1000;
    }
    return energyInfoPrefix + energy.toFixed(2) + " " + energyUnit;
  }

  getEnergyInfoPrefix(building) {
    if (building.type === BuildingType.bank) return "Zgromadzona energia: ";
    if (building.type === BuildingType.consumer) return "Zużywana energia: ";
    return "Produkowana energia: ";
  }

  hideBuildingInfo() {
    this.selectedBuilding = null;
    document.getElementById("buildingInfo").style.display = "none";
  }

  addBuilding(jsonObject, gridX, gridY, free = false) {
    if (!free && this.money < jsonObject.cost) return;
    const building = new Building(jsonObject, gridX, gridY);
    if (!free) {
      this.money -= building.cost;
      imageManager.updateCosts();
    }
    this.buildings.push(building);
  }

  calculateEnergyProduction() {
    this.energy.production = this.buildings.filter((b) => b.type === BuildingType.producent).reduce((sum, b) => sum + b.energyPerHour, 0);
  }

  calculateEnergyConsumption() {
    this.energy.consumption = Math.abs(this.buildings.filter((b) => b.type === BuildingType.consumer).reduce((sum, b) => sum - b.energyPerHour, 0));
  }

  calculateAvailableEnergy() {
    this.energy.available = this.energy.production - this.energy.consumption;
  }

  checkEnergy(building) {
    let percentage = (building.currentEnergy / building.energyPerHour) * 100;
    let name = "";
    console.log(building.name);
    if (building.description == "Mały magazyn") name = "Storage_Small_";
    else name = "Storage_Big_";

    if (percentage < 25) {
      building.name = name += "0";
    } else if (percentage < 50) {
      building.name = name += "25";
    } else if (percentage < 75) {
      building.name = name += "50";
    } else if (percentage < 100) {
      building.name = name += "75";
    } else {
      building.name = name += "100";
    }
    this.drawBuilding(building);
  }

  updateEnergy(hour) {
    let produced = 0;
    let consumed = 0;
    for (let building of this.buildings) {
      if (building.type == BuildingType.consumer) {
        consumed += building.energyPerHour;
      }
      produced += building.getProducedEnergy(hour);
      if (building.type == BuildingType.bank) {
        this.checkEnergy(building);
      }
    }

    let outcome = produced - consumed;
    if (outcome < 0) {
      for (let building of this.buildings) {
        if (building.type == BuildingType.bank) {
          console.log(building.name, building.currentEnergy, outcome);
          let energy = building.currentEnergy;
          if (outcome + energy >= 0) {
            building.currentEnergy += outcome;
            outcome = 0;
            break;
          } else {
            building.currentEnergy = 0;
            outcome += energy;
          }
          this.checkEnergy(building);
        }
      }
    } else if (outcome > 0) {
      for (let building of this.buildings) {
        if (building.type == BuildingType.bank) {
          let space = building.energyPerHour - building.currentEnergy;
          if (space > outcome) {
            building.currentEnergy += outcome;
            outcome = 0;
            break;
          } else if (space > 0 && space < outcome) {
            building.currentEnergy = building.energyPerHour;
            outcome -= space;
          }
        }
      }
    }

    let capacity = 0;

    for (let building of this.buildings) {
      if (building.type == BuildingType.bank) {
        capacity += building.currentEnergy;
      }
    }

    if (outcome < 0) capacity = outcome;
    capacity = capacity;

    this.updateEnergyUI(produced, consumed, capacity);
  }

  updateEnergyUI(produced, consumed, capacity) {
    let capacityUnit = "kWh";
    if (capacity >= 1000) {
      capacityUnit = "MWh";
      capacity = capacity / 1000;
    }

    let producedUnit = "kWh";
    if (produced >= 1000) {
      producedUnit = "MWh";
      produced = produced / 1000;
    }

    let consumedUnit = "kWh";
    if (consumed >= 1000) {
      consumedUnit = "MWh";
      consumed = consumed / 1000;
    }

    document.getElementById("available-energy").textContent = `Dostępna energia: ${capacity.toFixed(2)} ${capacityUnit}`;
    document.getElementById("total-production").textContent = `Produkcja: ${produced.toFixed(2)} ${producedUnit}`;
    document.getElementById("total-consumption").textContent = `Zużycie: ${consumed.toFixed(2)} ${consumedUnit}`;
    if (this.selectedBuilding != null) this.showBuildingInfo(this.selectedBuilding);
  }

  updateWeatherInfo() {
    let weather = JSON.parse(localStorage.getItem("weather"))[0];
    document.getElementById("sunlight-info").textContent = `Zachmurzenie: ${weather.cloudCoverage}%`;
    document.getElementById("wind-info").textContent = `Pręskość wiatru: ${weather.windSpeed} km/h`;
  }

  updateTimeInfo(hour) {
    this.hour = hour;
    this.day = `${parseInt(localStorage.getItem("dayOffset")) + 1} - Godzina: ${hour}:00`;
  }

  draw() {
    this.clearCanvas();
    this.applyCameraTransform();
    this.drawBackground();
    this.drawGameElements();
    this.restoreCanvasState();
    this.updateHtml();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  applyCameraTransform() {
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
  }

  createScaledPattern(img, scale = 0.5) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width * scale;
    tempCanvas.height = img.height * scale;

    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    return this.ctx.createPattern(tempCanvas, "repeat");
  }

  drawBackground() {
    const viewportWidth = this.canvas.width / this.camera.zoom;
    const viewportHeight = this.canvas.height / this.camera.zoom;
    const startX = -this.camera.x / this.camera.zoom;
    const startY = -this.camera.y / this.camera.zoom;

    if (this.backgroundPattern) {
      this.ctx.fillStyle = this.backgroundPattern;
      this.ctx.fillRect(startX, startY, viewportWidth, viewportHeight);
    }
  }

  drawGameElements() {
    this.grid.drawGrid(this.ctx, 1000, 1000);
    this.drawBuildings();
    this.drawHoverPreview();
  }

  restoreCanvasState() {
    this.ctx.restore();
  }

  updateHtml() {
    document.getElementById("day-info").textContent = `Dzień: ${this.day}`;
    document.getElementById("money").textContent = `Pieniądze: ${this.money} PLN`;
  }

  drawBuildings() {
    const sortedBuildings = [...this.buildings].sort((a, b) => {
      if (a.gridX !== b.gridX) {
        return a.gridX - b.gridX;
      }
      return a.gridY - b.gridY;
    });
    sortedBuildings.forEach((building) => this.drawBuilding(building));
  }

  drawBuilding(building) {
    const position = this.calculateBuildingPosition(building);
    if (this.buildingAtPosition === building) {
      this.drawBuildingImage(building, position, 0.8, true);
    } else {
      this.drawBuildingImage(building, position);
    }
    if (this.selectedBuilding === building) {
      this.drawSelectedBuildingOverlay(building, position);
    }
  }

  calculateBuildingPosition(building) {
    return this.grid.gridToWorldCoordinates(building.gridX, building.gridY);
  }

  drawBuildingImage(building, position, alpha = 1.0, highlight = false) {
    let img;
    if (highlight) {
      img = imageManager.getImage(building.name + "P");
    } else img = imageManager.getImage(building.name);
    if (img) {
      this.drawBuildingImageAtPosition(img, building, position, alpha);
    }
  }

  drawBuildingImageAtPosition(img, building, position, alpha = 1.0) {
    this.ctx.globalAlpha = alpha;
    const offsetX = ((building.sizeX * building.scale - 1) * this.gridSize) / 2;
    const offsetY = ((building.sizeY * building.scale - 1) * this.gridSize) / 2;
    const width = (this.gridSize - 4) * building.sizeX * building.scale;
    const height = (this.gridSize - 4) * building.sizeY * building.scale;

    this.ctx.drawImage(img, position.x + 2 - offsetX, position.y + 2 - offsetY * 2, width, height);
    this.ctx.globalAlpha = 1.0;
  }

  drawSelectedBuildingOverlay(building, position) {
    const selectedImg = imageManager.getImage(building.name + "Selected");
    if (selectedImg) {
      this.drawBuildingImageAtPosition(selectedImg, building, position);
    }
  }

  drawHoverPreview() {
    if (!this.hoverPosition || !this.selectedBlueprint) return;

    const position = this.grid.gridToWorldCoordinates(this.hoverPosition.x, this.hoverPosition.y);

    const img = imageManager.getImage(this.selectedBlueprint.name);
    if (img) {
      this.ctx.globalAlpha = 0.5;

      if (this.money < this.selectedBlueprint.cost || !this.canPlaceBuildingAtPosition(this.hoverPosition.x, this.hoverPosition.y, this.selectedBlueprint.sizeX, this.selectedBlueprint.sizeY)) {
        this.ctx.filter = "sepia(1) saturate(5) hue-rotate(-50deg)";
      }

      this.drawBuildingImageAtPosition(img, this.selectedBlueprint, position, 0.5);

      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.globalAlpha = 1.0;
      this.ctx.restore();
    }
  }

  handleHover(e) {
    if (this.isDragging) return;

    const clickPosition = this.getClickPosition(e);
    clickPosition.x = clickPosition.x - this.gridSize / 2;
    const gridPosition = this.grid.worldToGridCoordinates(clickPosition.x, clickPosition.y);
    const buildingAtPosition = this.findBuildingAtPosition(gridPosition.x, gridPosition.y);

    if (!buildingAtPosition) {
      this.buildingAtPosition = null;
      this.hoverPosition = gridPosition;
    } else {
      this.buildingAtPosition = buildingAtPosition;
      this.hoverPosition = gridPosition;
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
}

window.addEventListener("load", async () => {
  try {
    const response = await fetch("./buildings.json");
    const buildingsData = await response.json();
    await imageManager.initialize();

    const game = new Game(buildingsData.buildings);
    imageManager.setGame(game);

    const initial_buildings = await (await fetch("./initial_buildings.json")).json();
    initial_buildings.buildings.forEach((initial_building) => {
      const building_json = buildingsData.buildings.find((b) => b.name === initial_building.name);
      game.addBuilding(building_json, initial_building.x, initial_building.y, true);
    });

    let turnManager = new TurnManager(game);

    imageManager.setupBuildingMenu();
  } catch (error) {
    console.error("Failed to start game:", error);
  }
});
