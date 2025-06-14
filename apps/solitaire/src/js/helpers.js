// Convert value ('a', '2', ..., 'jack', 'queen', 'king') to rank 1–13
export function rankOf(value) {
  if (value === "ace") return 1;
  if (value === "jack") return 11;
  if (value === "queen") return 12;
  if (value === "king") return 13;
  return parseInt(value, 10);
}

// Checks whether suits are the same
export function sameSuit(a, b) {
  return a.suit === b.suit;
}

// Checks whether colors are opposite (black - spades, clubs; red - hearts, diamonds)
export function isOppositeColor(a, b) {
  const red = ["hearts", "diamonds"];
  const black = ["spades", "clubs"];
  return (
    (red.includes(a.suit) && black.includes(b.suit)) ||
    (black.includes(a.suit) && red.includes(b.suit))
  );
}

// Rules for foundation pile:
// • if the pile is empty — only ace allowed
// • otherwise — same suit and rank exactly one higher
export function isValidFoundationDrop(card, fPile) {
  if (fPile.length === 0) {
    return card.value.toLowerCase() === "ace";
  }
  const top = fPile.at(-1);
  return sameSuit(card, top) && rankOf(card.value) === rankOf(top.value) + 1;
}

// Rules for tableau pile:
// • if the pile is empty — only king allowed
// • otherwise — opposite color and rank exactly one lower
export function isValidTableauDrop(card, tPile) {
  if (tPile.length === 0) {
    return card.value.toLowerCase() === "king";
  }
  const top = tPile.at(-1);
  return (
    isOppositeColor(card, top) && rankOf(card.value) === rankOf(top.value) - 1
  );
}

/**
 * Draws a rectangle with rounded corners
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — top-left x coordinate
 * @param {number} y — top-left y coordinate
 * @param {number} w — width
 * @param {number} h — height
 * @param {number} r — corner radius
 */
export function strokeRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
}
