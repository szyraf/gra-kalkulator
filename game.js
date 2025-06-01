import { Building, BuildingType } from "./Building.js";
import { imageManager } from "./imageManager.js";
import { Grid } from "./grid.js";
import { startingDate } from "./date-weather.js";

class Game {
    constructor(buildingsData) {
        this.buildingsData = buildingsData;
        this.initializeGameState();
        this.initializeCanvas();
        this.setupEventListeners();
        this.startGameLoop();
    }

    initializeGameState() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.texture = document.getElementById("texture");
        this.backgroundPattern = null;

        if (this.texture.complete) {
        this.backgroundPattern = this.createScaledPattern(this.texture, 0.38); // 0.5 = 2x częściej
        } else {
        this.texture.onload = () => {
            this.backgroundPattern = this.createScaledPattern(this.texture,0.38);
        };
        }
        this.gridSize = 250;
        this.grid = new Grid(this.gridSize);
        this.buildings = [];
        this.selectedBuilding = null;
        this.selectedBlueprint = null;
        this.day = 1;
        this.energy = this.createInitialEnergyState();
        this.camera = this.createInitialCameraState();
        this.dailyBudget = 1000;
        this.mouseMovementCount = 0;
        this.hoverPosition = null;
        this.buildingAtPosition = null;
        this.money = 600;

        startingDate();
        this.updateWeatherInfo();
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
            zoom: 0.8,
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
            this.hideBuildingInfo();
            if (this.selectedBlueprint != null) {
                this.addBuilding(this.selectedBlueprint, gridPosition.x, gridPosition.y);
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
        return this.buildings.find((b) => b.gridX === gridX && b.gridY === gridY);
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
        document.getElementById("building-name").textContent = building.name;
        document.getElementById("building-energy").textContent = this.getEnergyInfoText(building);
        document.getElementById("building-upgrades").textContent = `Ulepszenia: ${building.upgrades.join(", ") || "Brak"}`;
    }

    getEnergyInfoText(building) {
        const energyInfoPrefix = this.getEnergyInfoPrefix(building);
        return energyInfoPrefix + building.energyPerHour;
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
        if (!free && this.money < jsonObject.Cost) return;
        const building = new Building(jsonObject, gridX, gridY);
        if (!free) {
            this.money -= building.cost;
            imageManager.updateCosts();
        }
        this.buildings.push(building);
        //this.updateEnergyStats();
    }

    // updateEnergyStats() {
    //     this.calculateEnergyProduction();
    //     this.calculateEnergyConsumption();
    //     this.calculateAvailableEnergy();
    //     this.updateEnergyUI();
    // }

    calculateEnergyProduction() {
        this.energy.production = this.buildings.filter((b) => b.type === BuildingType.producent).reduce((sum, b) => sum + b.energyPerHour, 0);
    }

    calculateEnergyConsumption() {
        this.energy.consumption = Math.abs(this.buildings.filter((b) => b.type === BuildingType.consumer).reduce((sum, b) => sum - b.energyPerHour, 0));
    }

    calculateAvailableEnergy() {
        this.energy.available = this.energy.production - this.energy.consumption;
    }

    updateEnergy() {
        let weather = JSON.parse(localStorage.getItem("weather"))[0];
        let produced = 0;
        let consumed = 0;
        for (let building of this.buildings) {
            if (building.type == BuildingType.consumer) {
                consumed += building.energyPerHour;
            } else {
                produced += building.getProducedEnergy(weather);
            }
        }

        let outcome = produced - consumed;
        if (outcome < 0) {
            for (let building of this.buildings) {
                if (building.type == BuildingType.bank) {
                    let energy = building.currentEnergy;
                    if (outcome + energy >= 0) {
                        building.currentEnergy += outcome;
                        outcome += energy;
                        break;
                    } else {
                        building.currentEnergy = 0;
                        outcome += energy;
                    }
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

        this.updateEnergyUI(produced, consumed, capacity);
    }

    updateEnergyUI(produced, consumed, capacity) {
        document.getElementById("available-energy").textContent = `Dostępna energia: ${capacity} kWh`;
        document.getElementById("total-production").textContent = `Produkcja: ${produced} kWh`;
        document.getElementById("total-consumption").textContent = `Zużycie: ${consumed} kWh`;
    }

    updateWeatherInfo() {
        let weather = JSON.parse(localStorage.getItem("weather"))[0];
        document.getElementById("sunlight-info").textContent = `Zachmurzenie: ${weather.cloudCoverage}%`;
        document.getElementById("wind-info").textContent = `Pręskość wiatru: ${weather.windSpeed} km/h`;
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
        this.buildings.forEach((building) => this.drawBuilding(building));
    }

    drawBuilding(building) {
        const position = this.calculateBuildingPosition(building);
        if (this.buildingAtPosition === building) {
            this.drawBuildingImage(building, position, 0.8);
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

    drawBuildingImage(building, position, alpha = 1.0) {
        const img = imageManager.getImage(building.name);
        if (img) {
            this.ctx.globalAlpha = alpha;
            this.ctx.drawImage(img, position.x + 2, position.y + 2, this.gridSize - 4, this.gridSize - 4);
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawSelectedBuildingOverlay(building, position) {
        const selectedImg = imageManager.getImage(building.name + "Selected");
        if (selectedImg) {
            this.ctx.drawImage(selectedImg, position.x + 2, position.y + 2, this.gridSize - 4, this.gridSize - 4);
        }
    }

    drawHoverPreview() {
        if (!this.hoverPosition || !this.selectedBlueprint) return;

        const position = this.grid.gridToWorldCoordinates(this.hoverPosition.x, this.hoverPosition.y);

        const img = imageManager.getImage(this.selectedBlueprint.Name);
        if (img) {
            this.ctx.globalAlpha = 0.5;

            if (this.money < this.selectedBlueprint.Cost || this.findBuildingAtPosition(this.hoverPosition.x, this.hoverPosition.y)) {
                this.ctx.filter = "sepia(1) saturate(5) hue-rotate(-50deg)";
            }

            this.ctx.drawImage(img, position.x + 2, position.y + 2, this.gridSize - 4, this.gridSize - 4);

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

// Wait for both DOM and images to be loaded before starting the game
window.addEventListener("load", async () => {
    try {
        const response = await fetch("./buildings.json");
        const buildingsData = await response.json();
        await imageManager.initialize();

        const game = new Game(buildingsData.buildings);
        imageManager.setGame(game);

        // Add initial buildings
        game.addBuilding(buildingsData.buildings[0], 2, 2, true);
        game.addBuilding(buildingsData.buildings[1], 4, 2, true);
        game.addBuilding(buildingsData.buildings[3], 2, 4, true);
        game.addBuilding(buildingsData.buildings[2], 4, 4, true);
    } catch (error) {
        console.error("Failed to start game:", error);
    }
});
