document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Constants
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const SEGMENT_COLORS = [
    "#FF6B6B",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#6A4C93",
    "#E76F51",
    "#F4A261",
    "#E9C46A",
    "#2A9D8F",
    "#8338EC",
    "#A64AC9",
    "#F72585",
  ];

  const NUM_SEGMENTS = 12;
  const SEGMENT_ANGLE_DEGREES = 360 / NUM_SEGMENTS;

  // Wheel of Birthdays Component
  class WheelOfBirthdays {
    constructor(containerId, onSpinComplete) {
      this.container = document.getElementById(containerId);
      this.onSpinComplete = onSpinComplete;
      this.isSpinning = false;
      this.rotation = 0;
      this.radius = 150;
      this.cx = this.radius;
      this.cy = this.radius;

      this.render();
    }

    getTextColorForBackground(hexColor) {
      try {
        if (!hexColor.startsWith("#") || hexColor.length !== 7)
          return "#FFFFFF";
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
      if (this.isSpinning) return;

      this.isSpinning = true;
      const winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
      const angleToAlignMiddleWithPointer = -(
        winningSegmentIndex * SEGMENT_ANGLE_DEGREES +
        SEGMENT_ANGLE_DEGREES / 2
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
        this.onSpinComplete(MONTHS[winningSegmentIndex]);
      }, 5000);
    }

   // Update the render method - replace the wheel HTML section with this:
render() {
  const segments = MONTHS.map((month, index) => {
    const startAngle = index * SEGMENT_ANGLE_DEGREES;
    const endAngle = (index + 1) * SEGMENT_ANGLE_DEGREES;
    const [startX, startY] = this.getCoordinatesForAngle(startAngle);
    const [endX, endY] = this.getCoordinatesForAngle(endAngle);

    const pathData = `M ${this.cx} ${this.cy} L ${startX} ${startY} A ${this.radius} ${this.radius} 0 0 1 ${endX} ${endY} Z`;

    const textAngle = startAngle + SEGMENT_ANGLE_DEGREES / 2;
    const textRadius = this.radius * 0.65;
    const [textX, textY] = this.getCoordinatesForAngle(
      textAngle,
      textRadius
    );
    const textColor = this.getTextColorForBackground(
      SEGMENT_COLORS[index % SEGMENT_COLORS.length]
    );

    return {
      path: pathData,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      month: month.substring(0, 3).toUpperCase(),
      textX,
      textY,
      textTransform: `rotate(${textAngle + 90}, ${textX}, ${textY})`,
      textColor,
    };
  });

  const wheelHTML = `
            <div class="relative flex flex-col items-center justify-center my-8 select-none" role="application" aria-label="Birthday Wheel Game">
                <div class="absolute right-[115px] top-1/2 z-20 transform -translate-y-1/2 drop-shadow-lg">
                     <svg width="32" height="48" viewBox="0 0 32 48" aria-hidden="true">
                         <path d="M0 24L32 0V48L0 24Z" class="fill-purple-500" />
                     </svg>
                </div>
                
                <div class="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-purple-600 via-purple-400 to-purple-500 p-2">
                    <!-- Zoom container - handles zoom animation -->
                    <div id="zoom-container" class="w-full h-full rounded-full relative overflow-hidden border-4 border-white" style="animation: zoomPulse 2s infinite;">
                        <!-- Rotation container - handles spin rotation -->
                        <div id="wheel" class="w-full h-full">
                            <svg viewBox="0 0 ${this.radius * 2} ${
    this.radius * 2
  }" class="w-full h-full" aria-label="Spinning wheel with months" role="img">
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
                                            font-size="12"
                                            font-weight="600"
                                            letter-spacing="0.5"
                                            class="pointer-events-none"
                                            aria-label="${MONTHS[i]}"
                                        >
                                            ${seg.month}
                                        </text>
                                    </g>
                                `
                                  )
                                  .join("")}
                            </svg>
                        </div>
                    </div>
                </div>
                
                <button id="spin-button" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full text-xl font-bold border-4 border-white shadow-xl z-10 bg-purple-600 hover:bg-purple-600/90 focus:ring-4 focus:ring-purple-600/50 flex items-center justify-center"
                    aria-label="${
                      this.isSpinning ? "Spinning wheel" : "Spin the wheel"
                    }">
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
      console.log("Event listener triggered for spin button"); // Debug log
      this.handleSpin();
    });
  } else {
    console.error("Spin button not found in the DOM");
  }
}

// Updated handleSpin method:
handleSpin() {
  if (this.isSpinning) return;

  console.log("Spin button clicked, starting spin..."); // Debug log
  this.isSpinning = true;
  const winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
  const angleToAlignMiddleWithPointer = -(
    winningSegmentIndex * SEGMENT_ANGLE_DEGREES +
    SEGMENT_ANGLE_DEGREES / 2
  );
  const randomFullSpins = (5 + Math.floor(Math.random() * 3)) * 360;

  const currentEffectiveRotation = this.rotation % 360;
  const adjustmentToAlign =
    (angleToAlignMiddleWithPointer - currentEffectiveRotation + 360) % 360;
  const newTargetRotation =
    this.rotation + randomFullSpins + adjustmentToAlign;

  this.rotation = newTargetRotation;

  // Apply rotation to the wheel (inner container)
  this.wheelElement.style.transition =
    "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
  this.wheelElement.style.transform = `rotate(${this.rotation}deg)`;
  
  // Keep zoom animation running on the zoom container (outer container)
  // No need to modify zoom container - it continues zooming automatically

  setTimeout(() => {
    console.log("Spin complete, showing result..."); // Debug log
    this.isSpinning = false;
    this.wheelElement.style.transition = "none";
    this.onSpinComplete(MONTHS[winningSegmentIndex]);
  }, 5000);
}
  }

  // CongratsPopup Component
  class CongratsPopup {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.isOpen = false;
      this.month = null;
      this.messageTemplate =
        "Hooray! The wheel has chosen **{month}**! May your birthday month be filled with joy and celebrations!";
    }

    open(month) {
      this.month = month;
      this.isOpen = true;
      this.render();
    }

    close() {
      this.isOpen = false;
      this.render();
    }

    render() {
      if (!this.isOpen || !this.month) {
        this.container.innerHTML = "";
        return;
      }

      const messageParts = this.messageTemplate.split("{month}");

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
                                <strong class="text-purple-500 font-semibold">${this.month}</strong>
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
      lucide.createIcons(); // Refresh icons
    }
  }

  // Initialize the app
  const popup = new CongratsPopup("popup-container");
  const wheel = new WheelOfBirthdays("wheel-container", (month) => {
    popup.open(month);
  });
});
