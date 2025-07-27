import { ACTION_KEYS } from '../config/gameConfig';

export class HelpOverlay {
  constructor(k) {
    this.k = k;
    this.isVisible = false;
    this.helpElements = [];
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.createHelpUI();
  }

  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    this.destroyHelpUI();
  }

  createHelpUI() {
    const overlayWidth = 400;
    const overlayHeight = 350;
    const x = (this.k.width() - overlayWidth) / 2;
    const y = (this.k.height() - overlayHeight) / 2;

    // Background
    this.helpElements.push(
      this.k.add([
        this.k.rect(overlayWidth, overlayHeight),
        this.k.color(0, 0, 0),
        this.k.opacity(0.9),
        this.k.pos(x, y),
        this.k.fixed(),
        this.k.z(200),
        "helpOverlay"
      ])
    );

    // Border
    this.helpElements.push(
      this.k.add([
        this.k.rect(overlayWidth + 4, overlayHeight + 4),
        this.k.color(255, 255, 255),
        this.k.opacity(0.8),
        this.k.pos(x - 2, y - 2),
        this.k.fixed(),
        this.k.z(199),
        "helpOverlay"
      ])
    );

    // Title
    this.helpElements.push(
      this.k.add([
        this.k.text("CONTROLS", {
          size: 24,
          font: "monospace"
        }),
        this.k.color(255, 255, 255),
        this.k.pos(x + overlayWidth/2, y + 20),
        this.k.anchor("center"),
        this.k.fixed(),
        this.k.z(201),
        "helpOverlay"
      ])
    );

    // Movement controls
    const movementText = [
      "MOVEMENT:",
      "WASD / Arrow Keys - Move",
      "Click Agent - Start Chat",
      "",
      "ACTIONS (Repeatable):"
    ];

    movementText.forEach((text, index) => {
      this.helpElements.push(
        this.k.add([
          this.k.text(text, {
            size: 14,
            font: "monospace"
          }),
          this.k.color(text === "MOVEMENT:" || text === "ACTIONS:" ? [255, 255, 0] : [255, 255, 255]),
          this.k.pos(x + 20, y + 60 + (index * 20)),
          this.k.fixed(),
          this.k.z(201),
          "helpOverlay"
        ])
      );
    });

    // Action controls
    let yOffset = 60 + (movementText.length * 20);
    Object.entries(ACTION_KEYS).forEach(([key, data], index) => {
      const displayKey = key === "space" ? "SPACE" : key;
      this.helpElements.push(
        this.k.add([
          this.k.text(`${displayKey} - ${data.name}`, {
            size: 14,
            font: "monospace"
          }),
          this.k.color(255, 255, 255),
          this.k.pos(x + 20, y + yOffset + (index * 20)),
          this.k.fixed(),
          this.k.z(201),
          "helpOverlay"
        ])
      );
    });

    // Close instruction
    this.helpElements.push(
      this.k.add([
        this.k.text("Press H to close", {
          size: 16,
          font: "monospace"
        }),
        this.k.color(255, 255, 0),
        this.k.pos(x + overlayWidth/2, y + overlayHeight - 30),
        this.k.anchor("center"),
        this.k.fixed(),
        this.k.z(201),
        "helpOverlay"
      ])
    );
  }

  destroyHelpUI() {
    this.k.destroyAll("helpOverlay");
    this.helpElements = [];
  }

  isHelpVisible() {
    return this.isVisible;
  }
}
