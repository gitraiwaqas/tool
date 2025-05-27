document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Constants for the Wheel
  const SEGMENT_COLORS = [
    "#FF6B6B", "#FFD166", "#06D6A0", "#118AB2", "#6A4C93",
    "#E76F51", "#F4A261", "#E9C46A", "#2A9D8F", "#8338EC",
    "#A64AC9", "#F72585"
  ];

  // WheelOfBirthdays Component
  class WheelOfBirthdays {
    constructor(containerId, onSpinComplete) {
      this.container = document.getElementById(containerId);
      this.onSpinComplete = onSpinComplete;
      this.sidebarManager = null; // Will be set after initialization
      this.isSpinning = false;
      this.rotation = 0;
      this.radius = 250;
      this.cx = this.radius;
      this.cy = this.radius;
    }

    initialize(sidebarManager) {
      this.sidebarManager = sidebarManager;
      this.render(); // Render after sidebarManager is set
    }

    getTextColorForBackground(hexColor) {
      try {
        if (!hexColor.startsWith("#") || hexColor.length !== 7) return "#FFFFFF";
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#333333" : "#FFFFFF";
      } catch (e) {
        return "#FFFFFF";
      }
    }

    getCoordinatesForAngle(angleDegrees, r = this.radius) {
      const angleRadians = (angleDegrees * Math.PI) / 180;
      return [
        this.cx + r * Math.cos(angleRadians),
        this.cy + r * Math.sin(angleRadians),
      ];
    }

    handleSpin() {
      if (this.isSpinning || !this.sidebarManager.names.length) return;

      this.isSpinning = true;
      const numSegments = this.sidebarManager.names.length;
      const segmentAngleDegrees = 360 / numSegments;
      const winningSegmentIndex = Math.floor(Math.random() * numSegments);
      const angleToAlignMiddleWithPointer = -(
        winningSegmentIndex * segmentAngleDegrees +
        segmentAngleDegrees / 2
      );
      const randomFullSpins = (5 + Math.floor(Math.random() * 3)) * 360;

      const currentEffectiveRotation = this.rotation % 360;
      const adjustmentToAlign =
        (angleToAlignMiddleWithPointer - currentEffectiveRotation + 360) % 360;
      const newTargetRotation =
        this.rotation + randomFullSpins + adjustmentToAlign;

      this.rotation = newTargetRotation;
      this.wheelElement.style.transition =
        "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
      this.wheelElement.style.transform = `rotate(${this.rotation}deg)`;

      setTimeout(() => {
        this.isSpinning = false;
        this.wheelElement.style.transition = "none";
        const selectedName = this.sidebarManager.names[winningSegmentIndex];
        this.onSpinComplete(selectedName);
        this.sidebarManager.addResult(`Selected: ${selectedName}`);
      }, 5000);
    }

    refresh() {
      this.render();
    }

    render() {
      const names = this.sidebarManager && this.sidebarManager.names.length
        ? this.sidebarManager.names
        : ["No names added"];
      const numSegments = names.length;
      const segmentAngleDegrees = 360 / numSegments;

      const segments = names.map((name, index) => {
        const startAngle = index * segmentAngleDegrees;
        const endAngle = (index + 1) * segmentAngleDegrees;
        const [startX, startY] = this.getCoordinatesForAngle(startAngle);
        const [endX, endY] = this.getCoordinatesForAngle(endAngle);

        const pathData = `M ${this.cx} ${this.cy} L ${startX} ${startY} A ${this.radius} ${this.radius} 0 0 1 ${endX} ${endY} Z`;

        const textAngle = startAngle + segmentAngleDegrees / 2;
        const textRadius = this.radius * 0.65;
        const [textX, textY] = this.getCoordinatesForAngle(textAngle, textRadius);
        const textColor = this.getTextColorForBackground(
          SEGMENT_COLORS[index % SEGMENT_COLORS.length]
        );

        return {
          path: pathData,
          color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
          name: name.substring(0, 10).toUpperCase(),
          textX,
          textY,
          textTransform: `rotate(${textAngle + 90}, ${textX}, ${textY})`,
          textColor,
        };
      });

      const wheelHTML = `
        <div class="relative flex flex-col items-center justify-center my-8 select-none" role="application" aria-label="Name Wheel Game">
          <div class="absolute right-[195px] top-1/2 z-20 transform -translate-y-1/2 drop-shadow-lg">
            <svg width="32" height="48" viewBox="0 0 32 48" aria-hidden="true">
              <path d="M0 24L32 0V48L0 24Z" class="fill-purple-500" />
            </svg>
          </div>
          
          <div class="w-[520px] h-[520px] sm:w-[600px] sm:h-[600px] rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-purple-600 via-purple-400 to-purple-500 p-2">
            <div id="zoom-container" class="w-full h-full rounded-full relative overflow-hidden border-4 border-white" style="animation: zoomPulse 2s infinite;">
              <div id="wheel" class="w-full h-full">
                <svg viewBox="0 0 ${this.radius * 2} ${this.radius * 2}" class="w-full h-full" aria-label="Spinning wheel with names" role="img">
                  ${segments
                    .map(
                      (seg, i) => `
                      <g key="${i}">
                        <path d="${seg.path}" fill="${seg.color}" stroke="white" stroke-width="2" />
                        <text
                          x="${seg.textX}"
                          y="${seg.textY}"
                          transform="${seg.textTransform}"
                          text-anchor="middle"
                          dominant-baseline="central"
                          fill="${seg.textColor}"
                          font-size="16"
                          font-weight="600"
                          letter-spacing="0.5"
                          class="pointer-events-none"
                          aria-label="${names[i]}"
                        >
                          ${seg.name}
                        </text>
                      </g>
                    `
                    )
                    .join("")}
                </svg>
              </div>
            </div>
          </div>
          
          <button id="spin-button" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 rounded-full text-2xl font-bold border-4 border-white shadow-xl z-10 bg-purple-600 hover:bg-purple-600/90 focus:ring-4 focus:ring-purple-600/50 flex items-center justify-center ${
            !this.sidebarManager || !this.sidebarManager.names.length ? "opacity-50 cursor-not-allowed" : ""
          }" 
            aria-label="${this.isSpinning ? 'Spinning wheel' : 'Spin the wheel'}" 
            ${!this.sidebarManager || !this.sidebarManager.names.length ? "disabled" : ""}>
            ${this.isSpinning ? "..." : "SPIN"}
          </button>
        </div>
      `;

      this.container.innerHTML = wheelHTML;
      this.wheelElement = document.getElementById("wheel");
      this.zoomContainer = document.getElementById("zoom-container");
      const spinButton = document.getElementById("spin-button");
      if (spinButton) {
        spinButton.addEventListener("click", () => {
          console.log("Event listener triggered for spin button");
          this.handleSpin();
        });
      } else {
        console.error("Spin button not found in the DOM");
      }
    }
  }

  // SidebarManager Component
  class SidebarManager {
    constructor(wheel) {
      this.wheel = wheel;
      this.names = ["Ali", "Charles", "Diya", "Eric", "Fatima", "Gabriel", "Hanna"];
      this.results = [];
      this.entryCountElement = document.getElementById("entry-count");
      this.resultCountElement = document.getElementById("result-count");
      this.nameListElement = document.getElementById("names");
      this.resultListElement = document.getElementById("results");
      this.shuffleButton = document.getElementById("shuffle-button");
      this.sortButton = document.getElementById("sort-button");
      this.addImageButton = document.getElementById("add-image-button");
      this.addNameInput = document.getElementById("add-name-input");
      this.hideSidebarButton = document.getElementById("hide-sidebar");
      this.showSidebarButton = document.getElementById("show-sidebar");
      this.showSidebarContainer = document.getElementById("show-sidebar-container");
      this.sidebar = document.getElementById("sidebar");
      this.entriesTab = document.getElementById("entries-tab");
      this.resultsTab = document.getElementById("results-tab");
      this.entriesSection = document.getElementById("entries-section");
      this.resultsSection = document.getElementById("results-section");
      this.isSidebarVisible = true;
      this.activeTab = "entries";

      this.init();
    }

    init() {
      this.renderNames();
      this.renderResults();
      this.updateCounts();

      this.shuffleButton.addEventListener("click", () => this.shuffleNames());
      this.sortButton.addEventListener("click", () => this.sortNames());
      this.addImageButton.addEventListener("click", () => this.addImage());
      this.addNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && this.addNameInput.value.trim()) {
          this.addName(this.addNameInput.value.trim());
          this.addNameInput.value = "";
        }
      });
      this.hideSidebarButton.addEventListener("click", () => this.toggleSidebar());
      this.showSidebarButton.addEventListener("click", () => this.toggleSidebar());
      this.entriesTab.addEventListener("click", () => this.switchTab("entries"));
      this.resultsTab.addEventListener("click", () => this.switchTab("results"));
    }

    renderNames() {
      this.nameListElement.innerHTML = this.names
        .map(
          (name, index) => `
          <li class="flex items-center justify-between p-2 hover:bg-purple-50 rounded">
            <span>${name}</span>
            <button class="remove-name text-red-500 hover:text-red-700" data-index="${index}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </li>
        `
        )
        .join("");
      this.nameListElement.querySelectorAll(".remove-name").forEach((button) => {
        button.addEventListener("click", () => {
          const index = button.getAttribute("data-index");
          this.removeName(index);
        });
      });
      lucide.createIcons();
    }

    renderResults() {
      this.resultListElement.innerHTML = this.results.length
        ? this.results
            .map(
              (result, index) => `
            <li class="p-2 bg-gray-50 rounded">${result}</li>
          `
            )
            .join("")
        : "<li class='p-2 text-gray-500'>No results yet.</li>";
    }

    updateCounts() {
      this.entryCountElement.textContent = this.names.length;
      this.resultCountElement.textContent = this.results.length;
    }

    addName(name) {
      this.names.push(name);
      this.renderNames();
      this.updateCounts();
      if (this.wheel) this.wheel.refresh();
    }

    removeName(index) {
      this.names.splice(index, 1);
      this.renderNames();
      this.updateCounts();
      if (this.wheel) this.wheel.refresh();
    }

    shuffleNames() {
      for (let i = this.names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.names[i], this.names[j]] = [this.names[j], this.names[i]];
      }
      this.renderNames();
      if (this.wheel) this.wheel.refresh();
    }

    sortNames() {
      this.names.sort();
      this.renderNames();
      if (this.wheel) this.wheel.refresh();
    }

    addImage() {
      alert("Add Image functionality is not implemented yet.");
    }

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
      this.sidebar.style.display = this.isSidebarVisible ? "flex" : "none";
      this.showSidebarContainer.style.display = this.isSidebarVisible ? "none" : "block";
      this.hideSidebarButton.innerHTML = `<i data-lucide="${this.isSidebarVisible ? 'eye-off' : 'eye'}" class="w-5 h-5"></i>`;
      lucide.createIcons();
    }

    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.entriesTab.classList.toggle("active-tab", tab === "entries");
      this.resultsTab.classList.toggle("active-tab", tab === "results");
      this.entriesSection.classList.toggle("hidden", tab !== "entries");
      this.resultsSection.classList.toggle("hidden", tab !== "results");
    }

    addResult(result) {
      this.results.unshift(result);
      this.renderResults();
      this.updateCounts();
    }
  }

  // CongratsPopup Component
  class CongratsPopup {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.isOpen = false;
      this.name = null;
      this.messageTemplate =
        "Hooray! The wheel has chosen **{name}**! May this selection bring joy and celebrations!";
    }

    open(name) {
      this.name = name;
      this.isOpen = true;
      this.render();
    }

    close() {
      this.isOpen = false;
      this.render();
    }

    render() {
      if (!this.isOpen || !this.name) {
        this.container.innerHTML = "";
        return;
      }

      const messageParts = this.messageTemplate.split("{name}");

      const popupHTML = `
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full">
            <div class="relative h-48 w-full">
              <img src="https://placehold.co/600x300/A64AC9/FFFFFF.png?text=Celebration!" alt="Celebration background" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center p-6">
                <i data-lucide="party-popper" class="h-16 w-16 text-white opacity-80 drop-shadow-lg animate-pulse"></i>
              </div>
            </div>
            <div class="p-6 text-center">
              <h3 class="text-3xl font-bold text-purple-600 flex items-center justify-center">
                <i data-lucide="gift" class="h-8 w-8 mr-3 text-purple-500"></i>
                Congratulations!
              </h3>
              <p class="text-lg text-gray-600 mt-4">
                ${messageParts[0]}
                <strong class="text-purple-500 font-semibold">${this.name}</strong>
                ${messageParts[1]}
              </p>
            </div>
            <div class="p-6 pt-4 bg-transparent">
              <button id="close-popup" class="w-full bg-purple-500 hover:bg-purple-500/90 text-white text-lg py-3 rounded-md">
                Awesome!
              </button>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = popupHTML;
      document
        .getElementById("close-popup")
        .addEventListener("click", () => this.close());
      lucide.createIcons();
    }
  }

  // Initialize the app
  const popup = new CongratsPopup("popup-container");
  const wheel = new WheelOfBirthdays("wheel-container", (name) => {
    popup.open(name);
  });
  const sidebarManager = new SidebarManager(wheel);
  wheel.initialize(sidebarManager); // Initialize wheel with sidebarManager
});