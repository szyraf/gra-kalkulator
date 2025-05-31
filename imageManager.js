import imageData from "./imageData.json";

class ImageManager {
  constructor() {
    this.images = new Map();
    this.buildingMenuImages = [];
    this.currentIndex = 0;
    this.imagesPerPage = 4;
    this.isInitialized = false;
    this.game = null;
  }

  setGame(game) {
    this.game = game;
  }

  async initialize() {
    try {
      await this.loadImages();
      this.setupBuildingMenu();
      this.setupNavigation();
      this.isInitialized = true;
      console.log("ImageManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ImageManager:", error);
      throw error;
    }
  }

  async loadImages() {
    console.log("Starting to load images...");
    const loadPromises = imageData.map((data) => {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          console.log(`Successfully loaded image: ${data.id}`);
          this.images.set(data.id, img);
          resolve();
        };

        img.onerror = (error) => {
          console.error(`Failed to load image: ${data.src}`, error);
          reject(new Error(`Failed to load image: ${data.src}`));
        };

        img.src = data.src;
        img.id = data.id;
        img.alt = data.alt;
        img.className = "hidden";
      });
    });

    try {
      await Promise.all(loadPromises);
      console.log("All images loaded successfully");
    } catch (error) {
      console.error("Error loading images:", error);
      throw error;
    }
  }

  setupBuildingMenu() {
    const container = document.getElementById("building-menu-building-images");
    if (!container) {
      console.error("Building menu container not found");
      return;
    }
    this.updateBuildingMenu();
  }

  updateBuildingMenu() {
    const container = document.getElementById("building-menu-building-images");
    if (!container) {
      console.error("Building menu container not found");
      return;
    }

    container.innerHTML = "";

    const startIndex = this.currentIndex;
    const endIndex = Math.min(
      startIndex + this.imagesPerPage,
      imageData.length
    );

    for (let i = startIndex; i < endIndex; i++) {
      const data = imageData[i];
      const img = this.images.get(data.id);

      if (!img) {
        console.error(`Image not found for id: ${data.id}`);
        continue;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "w-24 h-24 relative";

      const imgElement = img.cloneNode();
      imgElement.className =
        "w-full h-full object-cover rounded cursor-pointer hover:scale-105 transition-transform";
      imgElement.onclick = () => this.handleImageClick(data.id);

      wrapper.appendChild(imgElement);
      container.appendChild(wrapper);
    }
  }

  setupNavigation() {
    const leftArrow = document.getElementById("building-menu-left-arrow");
    const rightArrow = document.getElementById("building-menu-right-arrow");

    if (!leftArrow || !rightArrow) {
      console.error("Navigation arrows not found");
      return;
    }

    leftArrow.onclick = () => {
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - this.imagesPerPage);
        this.updateBuildingMenu();
      }
    };

    rightArrow.onclick = () => {
      if (this.currentIndex + this.imagesPerPage < imageData.length) {
        this.currentIndex = Math.min(
          imageData.length - this.imagesPerPage,
          this.currentIndex + this.imagesPerPage
        );
        this.updateBuildingMenu();
      }
    };
  }

  handleImageClick(buildingId) {
    if (!this.game) return;

    const buildingData = this.game.buildingsData.find(
      (b) => b.Name === buildingId
    );
    if (buildingData) {
      this.game.selectedBlueprint = buildingData;
    }
  }

  getImage(id) {
    if (!this.isInitialized) {
      console.warn("ImageManager not initialized yet");
      return null;
    }
    return this.images.get(id);
  }
}

const imageManager = new ImageManager();

// Initialize the image manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  imageManager.initialize().catch((error) => {
    console.error("Failed to initialize image manager:", error);
  });
});

export { imageManager };
