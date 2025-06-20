// src/js/app.js

class Card {
  /**
   * @param {string} suit – card suit ('hearts' | 'diamonds' | 'clubs' | 'spades')
   * @param {string} value – card value ('ace', '2', …, '10', 'jack', 'queen', 'king')
   * @param {boolean} faceUp – whether the card is face-up
   */
  constructor(suit, value, faceUp = false) {
    this.suit = suit;
    this.value = value;
    this.faceUp = faceUp;
    this.image = new Image();
    this.image.src = `src/assets/cards/${suit}_${value}.png`;
  }

  // Toggles card state (face-down ↔ face-up)
  flip() {
    this.faceUp = !this.faceUp;
  }

  /**
   * Draws the card on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  draw(ctx, x, y, width, height) {
    if (this.faceUp) {
      ctx.drawImage(this.image, x, y, width, height);
    } else {
      ctx.drawImage(Card.backImage, x, y, width, height);
    }
  }

  /**
   * Preloads all card face images for preview
   */
  static preloadFaces() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const values = [
      "ace",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "jack",
      "queen",
      "king",
    ];
    return Promise.all(
      suits.flatMap((suit) =>
        values.map(
          (value) =>
            new Promise((res) => {
              const img = new Image();
              img.src = `src/assets/cards/${suit}_${value}.png`;
              img.onload = img.onerror = res;
            }),
        ),
      ),
    );
  }

  /**
   * Loads the card back image
   * @param {string} [path] – path to back.png file
   * @returns {Promise<void>}
   */
  static loadBackImage(path = "src/assets/cards/back08.png") {
    const cardBackPath = localStorage.getItem("cardBack") || path;
    return new Promise((resolve) => {
      Card.backImage = new Image();
      Card.backImage.src = cardBackPath;
      Card.backImage.onload = () => resolve();
    });
  }
}

// Initializes static field (will be filled via loadBackImage)
Card.backImage = null;

export default Card;
