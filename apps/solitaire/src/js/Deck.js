import Card from "./Card.js";

const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const VALUES = [
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

export default class Deck {
  constructor() {
    this.cards = [];
    this.init();
  }

  // Populates this.cards with 52 new Card instances
  init() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        this.cards.push(new Card(suit, value, false));
      }
    }
  }

  // Fisher–Yates shuffle
  shuffle() {
    const { cards } = this;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  // Draws one card from the end of the deck
  draw() {
    return this.cards.pop();
  }
}
