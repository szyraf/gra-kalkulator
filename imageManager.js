class ImageManager {
  constructor() {
    this.images = new Map();
    this.buildingMenuImages = [];
    this.imagesPerPage = 4;
    this.isInitialized = false;
    this.game = null;
    this.imageData = [];
    this.selectedImageId = null;
    this.buildingElements = new Map();
  }

  setGame(game) {
    this.game = game;
    this.updateCosts();
  }

  updateCosts() {
    if (!this.game || !this.game.buildingsData) return;

    this.buildingElements.forEach((element, id) => {
      const costElement = element.querySelector(".cost-text");
      if (costElement) {
        const buildingData = this.game.buildingsData.find((b) => b.Name === id);
        if (buildingData) {
          const canAfford = this.game.money >= buildingData.Cost;
          costElement.textContent = `${buildingData.Cost} zł`;
          costElement.className = `cost-text text-center mt-1 text-sm font-medium ${
            canAfford ? "text-green-600" : "text-red-600"
          }`;
        }
      }
    });
  }

  updateSelection(buildingId) {
    this.buildingElements.forEach((element, id) => {
      const imgElement = element.querySelector("img");
      if (id === buildingId) {
        imgElement.classList.add("border-4", "border-yellow-400", "shadow-lg");
      } else {
        imgElement.classList.remove(
          "border-4",
          "border-yellow-400",
          "shadow-lg"
        );
      }
    });
  }

  async initialize() {
    try {
      const response = await fetch("./imageData.json");
      const data = await response.json();
      this.imageData = data.buildings;
      await this.loadImages();
      this.setupBuildingMenu();
      this.isInitialized = true;
      console.log("ImageManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ImageManager:", error);
      throw error;
    }
  }

  async loadImages() {
    const loadPromises = this.imageData.map(async (data) => {
      try {
        const img = new Image();
        img.src = data.src;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        this.images.set(data.id, img);
      } catch (error) {
        console.error(`Failed to load image ${data.src}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  getImage(id) {
    return this.images.get(id);
  }

  setupBuildingMenu() {
    const buildingImagesContainer = document.getElementById(
      "building-menu-building-images"
    );
    if (!buildingImagesContainer) {
      console.error("Building images container not found");
      return;
    }

    const updateBuildingMenu = () => {
      buildingImagesContainer.innerHTML = "";
      this.buildingElements.clear();
      const startIndex = Math.max(
        0,
        Math.min(this.currentIndex, this.imageData.length - this.imagesPerPage)
      );

      for (
        let i = startIndex;
        i < startIndex + this.imagesPerPage && i < this.imageData.length;
        i++
      ) {
        const data = this.imageData[i];
        const img = this.images.get(data.id);

        if (!img) {
          console.error(`Image not found for id: ${data.id}`);
          continue;
        }

        const imgElement = img.cloneNode();
        imgElement.className =
          "w-full h-full object-cover rounded cursor-pointer hover:scale-105 transition-transform";
        if (data.id === this.selectedImageId) {
          imgElement.classList.add(
            "border-4",
            "border-yellow-400",
            "shadow-lg"
          );
        }
        imgElement.onclick = () => this.handleImageClick(data.id);

        const wrapper = document.createElement("div");
        wrapper.className = "w-24 h-24 relative";
        wrapper.appendChild(imgElement);

        const costElement = document.createElement("div");
        costElement.className =
          "cost-text text-center mt-1 text-sm font-medium";

        if (this.game && this.game.buildingsData) {
          const buildingData = this.game.buildingsData.find(
            (b) => b.Name === data.id
          );
          if (buildingData) {
            const canAfford = this.game.money >= buildingData.Cost;
            costElement.textContent = `${buildingData.Cost} zł`;
            costElement.className = `cost-text text-center mt-1 text-sm font-medium ${
              canAfford ? "text-green-600" : "text-red-600"
            }`;
          }
        }
        wrapper.appendChild(costElement);
        buildingImagesContainer.appendChild(wrapper);
        this.buildingElements.set(data.id, wrapper);
      }
    };

    updateBuildingMenu();
  }

  handleImageClick(buildingId) {
    if (!this.game) return;

    if (this.selectedImageId === buildingId) {
      this.selectedImageId = null;
      this.game.selectedBlueprint = null;
      this.updateSelection(null);
      return;
    }

    const buildingData = this.game.buildingsData.find(
      (b) => b.Name === buildingId
    );
    if (buildingData) {
      this.game.selectedBlueprint = buildingData;
      this.selectedImageId = buildingId;
      this.updateSelection(buildingId);
    }
  }
}

export const imageManager = new ImageManager();

// Initialize the image manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  imageManager.initialize().catch((error) => {
    console.error("Failed to initialize image manager:", error);
  });
});
