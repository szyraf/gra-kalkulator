import { Building, BuildingType } from "./Building.js";
const buildings = [
    {
        Name: "House",
        Description: "Dom jednorodzinny",
        Cost: 0,
        Type: BuildingType.consumer,
        EnergyPerHour: 100,
        ToBuild: false,
    },
    {
        Name: "Apartament",
        Description: "Blok mieszkalny",
        Cost: 0,
        Type: BuildingType.consumer,
        EnergyPerHour: 1000,
        ToBuild: false,
    },
    {
        Name: "Tower",
        Description: "Wieżowiec",
        Cost: 0,
        Type: BuildingType.consumer,
        EnergyPerHour: 2000,
        ToBuild: false,
    },
    {
        Name: "Solar",
        Description: "Elektrownia Słoneczna",
        Cost: 0,
        Type: BuildingType.producent,
        EnergyPerHour: 100,
        ToBuild: true,
    },
];
class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.gridSize = 25;
        this.buildings = [];
        this.selectedBuilding = null;
        this.selectedBlueprint = null;
        this.day = 1;
        this.weather = {
            type: "sunny",
            sunlight: 100,
            wind: 5,
        };
        this.energy = {
            available: 0,
            production: 0,
            consumption: 0,
        };

        // Camera/View settings
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.1,
            maxZoom: 10,
        };

        this.dailyBudget = 1000;

        this.setupCanvas();
        this.setupEventListeners();
        this.gameLoop();
    }

    setupCanvas() {
        // Set canvas to window size
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
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
    }

    handleZoom(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate world position before zoom
        const worldX = (mouseX - this.camera.x) / this.camera.zoom;
        const worldY = (mouseY - this.camera.y) / this.camera.zoom;

        // Update zoom level
        if (e.deltaY < 0) {
            this.camera.zoom = Math.min(this.camera.zoom + zoomIntensity, this.camera.maxZoom);
        } else {
            this.camera.zoom = Math.max(this.camera.zoom - zoomIntensity, this.camera.minZoom);
        }

        // Calculate new world position after zoom
        const newWorldX = (mouseX - this.camera.x) / this.camera.zoom;
        const newWorldY = (mouseY - this.camera.y) / this.camera.zoom;

        // Adjust camera position to keep mouse position stable
        this.camera.x += (newWorldX - worldX) * this.camera.zoom;
        this.camera.y += (newWorldY - worldY) * this.camera.zoom;
    }

    handleMouseDown(e) {
        if (e.button === 1 || e.button === 0) {
            // Middle or left mouse button
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.camera.x += deltaX;
            this.camera.y += deltaY;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleClick(e) {
        if (this.isDragging) return; // Ignore click if we were dragging

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert screen coordinates to world coordinates
        const worldX = (x - this.camera.x) / this.camera.zoom;
        const worldY = (y - this.camera.y) / this.camera.zoom;

        // Convert to grid coordinates
        const gridX = Math.floor(worldX / this.gridSize);
        const gridY = Math.floor(worldY / this.gridSize);

        // Check if clicked on existing building
        const clickedBuilding = this.buildings.find((b) => b.gridX === gridX && b.gridY === gridY);

        if (clickedBuilding) {
            this.showBuildingInfo(clickedBuilding);
        } else {
            this.hideBuildingInfo();
            if (this.selectedBlueprint != null) {
                this.addBuilding(this.selectedBlueprint, gridX, gridY);
            }
        }
    }

    showBuildingInfo(building) {
        this.selectedBuilding = building;
        const infoPanel = document.getElementById("buildingInfo");
        document.getElementById("building-name").textContent = building.name;
        let energyInfoText = "";
        if (building.type == BuildingType.bank) energyInfoText = "Zgromadzona energia: ";
        else if (building.type == BuildingType.consumer) energyInfoText = "Zużywana energia: ";
        else energyInfoText = "Produkowana energia: ";
        document.getElementById("building-energy").textContent = energyInfoText + building.energyPerHour;
        document.getElementById("building-upgrades").textContent = `Ulepszenia: ${building.upgrades.join(", ") || "Brak"}`;
        infoPanel.style.display = "block";
    }

    hideBuildingInfo() {
        this.selectedBuilding = null;
        document.getElementById("buildingInfo").style.display = "none";
    }

    addBuilding(jsonObject, gridX, gridY) {
        // const building = {
        //     type,
        //     gridX,
        //     gridY,
        //     name: this.getBuildingName(type),
        //     energy: this.getBuildingEnergy(type),
        //     upgrades: []
        // };
        const building = new Building(jsonObject, gridX, gridY);
        this.buildings.push(building);
        this.updateEnergyStats();
    }

    updateEnergyStats() {
        this.energy.production = this.buildings.filter((b) => b.type == BuildingType.producent).reduce((sum, b) => sum + b.energyPerHour, 0);

        this.energy.consumption = Math.abs(this.buildings.filter((b) => b.type == BuildingType.consumer).reduce((sum, b) => sum - b.energyPerHour, 0));

        this.energy.available = this.energy.production - this.energy.consumption;

        // Update UI
        document.getElementById("available-energy").textContent = `Dostępna energia: ${this.energy.available} kWh`;
        document.getElementById("total-production").textContent = `Produkcja: ${this.energy.production} kWh`;
        document.getElementById("total-consumption").textContent = `Zużycie: ${this.energy.consumption} kWh`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save the current context state
        this.ctx.save();

        // Apply camera transform
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Draw grid
        this.drawGrid();

        // Draw buildings
        this.buildings.forEach((building) => {
            this.drawBuilding(building);
        });

        // Restore the context state
        this.ctx.restore();
    }

    drawGrid() {
        const gridWidth = 1000;
        const gridHeight = 1000;

        this.ctx.strokeStyle = "#ccc";
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x < gridWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, gridHeight);
            this.ctx.stroke();
        }

        for (let y = 0; y < gridHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(gridWidth, y);
            this.ctx.stroke();
        }
    }

    drawBuilding(building) {
        const x = building.gridX * this.gridSize;
        const y = building.gridY * this.gridSize;

        const img = document.getElementById(building.name);
        this.ctx.drawImage(img, x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        //this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

        if (this.selectedBuilding === building) {
            const selectedImg = document.getElementById(building.name + "Selected");
            this.ctx.drawImage(img, x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        }
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when the page loads
window.addEventListener("load", () => {
    const game = new Game();
    // Add some initial buildings for testing
    game.addBuilding(buildings[0], 2, 2);
    game.addBuilding(buildings[1], 4, 2);
    game.addBuilding(buildings[3], 2, 4);
    game.addBuilding(buildings[2], 4, 4);
});
