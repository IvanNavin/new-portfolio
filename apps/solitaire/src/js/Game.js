import Deck from "./Deck.js";
import Card from "./Card.js";
import {
  isValidFoundationDrop,
  isValidTableauDrop,
  strokeRoundedRect,
} from "./helpers.js";

export default class Game {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;

    this.tableau = Array.from({ length: 7 }, () => []); // 7 tableau columns
    this.foundations = Array.from({ length: 4 }, () => []); // 4 foundation piles
    this.stock = []; // stock pile (face-down)
    this.waste = []; // waste pile (face-up)

    this.verticalOffset = 40;
    this.overlapFactor = 0.1;
    this.moveCount = 0; // move counter
    this.startTime = null; // game start time
    this.history = []; // stack of previous states for undo
    this.accumulatedPause = 0;
    this.pauseStart = null;
    this.paused = false;
    this.drag = null;
    this.wasteAnim = {
      active: false,
      start: 0,
      duration: 200,
      fromSlot: new Map(),
      toSlot: new Map(),
    };
  }

  init() {
    // Reset everything to the initial state
    this.tableau = Array.from({ length: 7 }, () => []);
    this.foundations = Array.from({ length: 4 }, () => []);
    this.stock = [];
    this.waste = [];
    this.moveCount = 0;
    this.startTime = Date.now();
    this.history = [];
    this.drag = null;
    this.accumulatedPause = 0;
    this.pauseStart = null;
    this.paused = false;

    // 1) Create and shuffle the deck
    this.deck = new Deck();
    this.deck.shuffle();

    // 2) Deal cards into tableau
    for (let col = 0; col < 7; col++) {
      for (let i = 0; i <= col; i++) {
        const card = this.deck.draw();
        this.tableau[col].push(card);
      }
      // Flip only the top card in each column
      this.tableau[col][col].flip();
    }

    // 3) All remaining cards go to the stock pile
    this.stock = this.deck.cards.slice();

    // 4) Save the initial state to history for undo
    this.recordHistory();
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
      this.pauseStart = Date.now();
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      this.accumulatedPause += Date.now() - this.pauseStart;
      this.pauseStart = null;
    }
  }

  /**
   * Returns true if all foundation piles contain 13 cards
   */
  checkWin() {
    return this.foundations.every((pile) => pile.length === 13);
  }

  render() {
    if (this.paused) return;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    const margin = 20;
    const gap = 20; // The gap between the pictures
    const cols = 7; // the number of columns in Tableau

    // Calculate the width and height of the card to fit in 7 columns
    const cw = (W - 2 * margin - (cols - 1) * gap) / cols;
    const ch = cw * 1.5; // The ratio of the sides is 2: 3

    // Зсув угорі під HUD/меню
    const extra = this.verticalOffset;

    // Y-координати
    const topY = margin + extra;
    const tableauY = topY + ch + margin;

    // 1) Малюємо 4 foundations зліва
    for (let i = 0; i < 4; i++) {
      const x = margin + i * (cw + gap);
      const y = topY;

      if (this.foundations[i].length) {
        this.foundations[i].at(-1).draw(ctx, x, y, cw, ch);
      } else {
        // 1) External white frame with rounded
        ctx.save();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        strokeRoundedRect(ctx, x, y, cw, ch, 10);
        ctx.restore();

        // 2) Inside the dotted point is transparent
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // 5px stroke, 5px skip
        // Move a little inside so that the dotted dot is “in the middle”
        strokeRoundedRect(ctx, x + 8, y + 8, cw - 16, ch - 16, 8);
        ctx.restore();

        // 3) Draw the letter “A”
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${ch * 0.6}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("A", x + cw / 2, y + ch / 2);
        ctx.restore();
      }
    }

    // 2) Drawing Stock and Waste to the right
    // Stock pressed to the right edge
    const stockX = W - margin - cw;

    if (this.stock.length) {
      this.stock.at(-1).draw(ctx, stockX, topY, cw, ch);
    } else {
      // 1) External white frame
      ctx.save();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      strokeRoundedRect(ctx, stockX, topY, cw, ch, 10);
      ctx.restore();

      // 2) Dashed inner frame
      const inset = 8;
      const innerX = stockX + inset;
      const innerY = topY + inset;
      const innerW = cw - inset * 2;
      const innerH = ch - inset * 2;

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      strokeRoundedRect(ctx, innerX, innerY, innerW, innerH, 8);
      ctx.restore();

      // 3) SVG-Icon inside the dotted
      const svgPath = `M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z`;
      const p = new Path2D(svgPath);

      // Calculate the scale to fit the icon in innerW × innerH
      const scaleX = innerW / 256;
      const scaleY = innerH / 256;
      const scale = Math.min(scaleX, scaleY);
      // Centering
      const iconW = 256 * scale;
      const iconH = 256 * scale;
      const dx = innerX + (innerW - iconW) / 2;
      const dy = innerY + (innerH - iconH) / 2;

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.translate(dx, dy);
      ctx.scale(scale, scale);
      ctx.fill(p);
      ctx.restore();
    }

    // Waste to the left of the Stock with the indentation gap
    const wasteX = stockX - gap - cw;
    const maxVisible = 3;
    const wasteArray = this.waste;
    const total = wasteArray.length;

    // If we right now pull a map from Waste - do not animate, and show only two cards,
    // for the third in the hands
    if (this.drag?.from?.pile === "waste") {
      const overlapX = cw * 0.3;
      const xSlots = [wasteX - 2 * overlapX, wasteX - overlapX, wasteX];
      // Take the last two
      const visible = wasteArray.slice(-2);
      visible.forEach((card, i) => {
        // Two cards occupy slots 1 and 2
        const slotIndex = 1 + i;
        const x = xSlots[slotIndex];
        card.draw(ctx, x, topY, cw, ch);
      });
    }
    // All other cases - normally animated three cards
    else if (total > 0) {
      const overlapX = cw * 0.3;
      const xSlots = [wasteX - 2 * overlapX, wasteX - overlapX, wasteX];

      // 1) Hidden cards (all except the last three)
      const hiddenCount = Math.max(0, total - maxVisible);
      for (let i = 0; i < hiddenCount; i++) {
        wasteArray[i].draw(ctx, xSlots[0], topY, cw, ch);
      }

      // 2) The last three cards
      const visible = wasteArray.slice(-maxVisible);

      // 3) Progress of animation 0 → 1
      let t = 1;
      if (this.wasteAnim.active) {
        const elapsed = Date.now() - this.wasteAnim.start;
        t = Math.min(1, elapsed / this.wasteAnim.duration);
        if (t === 1) this.wasteAnim.active = false;
      }

      // 4) Draw with the interpolation of slots
      visible.forEach((card, i) => {
        const fromSlot = this.wasteAnim.fromSlot.get(card);
        const toSlot = this.wasteAnim.toSlot.get(card);
        let x;
        if (this.wasteAnim.active && fromSlot != null && toSlot != null) {
          const x0 = xSlots[fromSlot];
          const x1 = xSlots[toSlot];
          x = x0 + (x1 - x0) * t;
        } else {
          // static mode - just take our slot
          const startSlot = maxVisible - visible.length;
          const slotIndex = startSlot + i;
          x = xSlots[slotIndex];
        }
        card.draw(ctx, x, topY, cw, ch);
      });
    }

    // 3) Draw Tableau (7 columns) all over the space below
    const overlapY = ch * this.overlapFactor;

    for (let col = 0; col < cols; col++) {
      const xStart = margin + col * (cw + gap);
      const column = this.tableau[col];
      for (let row = 0; row < column.length; row++) {
        const card = column[row];
        // shift by y - for example 30% of the height of the card
        const y = tableauY + row * overlapY;
        card.draw(ctx, xStart, y, cw, ch);
      }
    }

    if (this.drag) {
      const { cards, x, y, offsetX, offsetY, cw, ch, overlapY } = this.drag;
      cards.forEach((card, i) => {
        card.draw(this.ctx, x - offsetX, y - offsetY + i * overlapY, cw, ch);
      });
    }

    this.drawHUD();
  }

  // Converts clientX/Y → canvas coordinates
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  // Determines which "bite" (pile) click
  hitTest(x, y) {
    const W = this.canvas.width;
    const margin = 20;
    const gap = 20;
    const cols = 7;
    const cw = (W - 2 * margin - (cols - 1) * gap) / cols;
    const ch = cw * 1.5;
    const extra = this.verticalOffset;
    const topY = margin + extra;
    const rowY = topY + ch + margin;
    const overlap = ch * this.overlapFactor;

    // 0) Allow a drop on the empty column of Tableau
    for (let col = 0; col < cols; col++) {
      if (this.tableau[col].length === 0) {
        const tx = margin + col * (cw + gap);
        // the area where the cards fall: If there was one card
        if (x >= tx && x <= tx + cw && y >= rowY && y <= rowY + ch) {
          return {
            pile: "tableau",
            index: col,
            row: 0,
            fx: tx,
            fy: rowY,
            cw,
            ch,
            overlap,
          };
        }
      }
    }

    // 1) Foundations (i=0..3)
    for (let i = 0; i < 4; i++) {
      const fx = margin + i * (cw + gap);
      const fy = topY;
      if (x >= fx && x <= fx + cw && y >= fy && y <= fy + ch) {
        return { pile: "foundation", index: i, fx, fy, cw, ch };
      }
    }

    // 2) Stock & Waste in the right corner
    const stockX = W - margin - cw;
    const wasteX = stockX - gap - cw;
    // stock
    if (x >= stockX && x <= stockX + cw && y >= topY && y <= topY + ch) {
      return { pile: "stock", index: null, fx: stockX, fy: topY, cw, ch };
    }
    // waste
    if (x >= wasteX && x <= wasteX + cw && y >= topY && y <= topY + ch) {
      return { pile: "waste", index: null, fx: wasteX, fy: topY, cw, ch };
    }

    // 3) Tableau
    for (let col = 0; col < cols; col++) {
      const tx = margin + col * (cw + gap);
      const column = this.tableau[col];
      for (let row = column.length - 1; row >= 0; row--) {
        const ty = rowY + row * overlap;
        if (x >= tx && x <= tx + cw && y >= ty && y <= ty + ch) {
          return {
            pile: "tableau",
            index: col,
            row,
            fx: tx,
            fy: ty,
            cw,
            ch,
            overlap,
          };
        }
      }
    }

    return null;
  }

  onMouseDown(e) {
    const { x, y } = this.getMousePos(e);
    const hit = this.hitTest(x, y);
    if (!hit) return;

    // 1) Stock
    if (hit.pile === "stock") {
      // 1) oldVis up to 3 cards
      const oldVis = this.waste.slice(-3);

      // 2) Classical translation logic
      if (this.stock.length) {
        const card = this.stock.pop();
        card.flip();
        this.waste.push(card);
      } else {
        while (this.waste.length) {
          const c = this.waste.pop();
          c.faceUp = false;
          this.stock.push(c);
        }
      }

      // 3) newVis up to 3 cards
      const newVis = this.waste.slice(-3);

      // 4) Running animation
      this.startWasteAnimation(oldVis, newVis);

      // 5) History
      this.recordHistory();
      return;
    }

    // 2) Waste → drag’n’drop
    if (hit.pile === "waste" && this.waste.length) {
      // The old three Visible was remembered
      const oldVis = this.waste.slice(-3);
      // Get one card
      const cards = [this.waste.pop()];
      this.drag = {
        cards,
        from: hit,
        oldVis, // Remember for animation after Drop
        x,
        y,
        offsetX: x - hit.fx,
        offsetY: y - hit.fy,
        cw: hit.cw,
        ch: hit.ch,
        overlapY: hit.overlap ?? hit.ch * this.overlapFactor,
      };
      this.render();
      return;
    }

    // 3) Tableau → drag’n’drop
    if (hit.pile === "tableau") {
      const cards = this.tableau[hit.index].slice(hit.row);
      this.tableau[hit.index] = this.tableau[hit.index].slice(0, hit.row);
      this.drag = {
        cards,
        from: hit,
        x,
        y,
        offsetX: x - hit.fx,
        offsetY: y - hit.fy,
        cw: hit.cw,
        ch: hit.ch,
        overlapY: hit.overlap ?? hit.ch * this.overlapFactor,
      };
      this.render();
      return;
    }

    // Other cases - we're not dragging anything
  }

  onMouseMove(e) {
    if (!this.drag) return;
    const { x, y } = this.getMousePos(e);
    this.drag.x = x;
    this.drag.y = y;
    this.render();
  }

  onMouseUp(e) {
    if (!this.drag) return;
    const { x, y } = this.getMousePos(e);
    const hit = this.hitTest(x, y);

    const { cards, from, oldVis } = this.drag;
    const moving = cards[0];
    let moved = false;

    // 1) Drop → Foundation
    if (hit?.pile === "foundation") {
      const fPile = this.foundations[hit.index];
      if (isValidFoundationDrop(moving, fPile)) {
        fPile.push(moving);
        moved = true;
      }
    }
    // 2) Drop → Tableau
    else if (hit?.pile === "tableau") {
      const tPile = this.tableau[hit.index];
      if (isValidTableauDrop(moving, tPile)) {
        tPile.push(...cards);
        moved = true;
      }
    }

    // 3) If it was the correct move
    if (moved) {
      // а) flip if necessary
      if (from.pile === "tableau") {
        const src = this.tableau[from.index];
        if (src.length && !src.at(-1).faceUp) src.at(-1).flip();
      }
      // б) If we dragged with Waste - we run animation
      if (from.pile === "waste") {
        const newVis = this.waste.slice(-3);
        this.startWasteAnimation(oldVis, newVis);
      }
      this.moveCount++;
      this.recordHistory();
    }
    // 4) Otherwise - to return the card to your place
    else {
      if (from.pile === "waste") {
        this.waste.push(...cards);
      } else if (from.pile === "tableau") {
        this.tableau[from.index].push(...cards);
      }
    }

    // 5) Now we reset Drag and render the final state
    this.drag = null;
    this.render();

    // 6) Victory check
    if (this.checkWin()) {
      setTimeout(() => {
        document.getElementById("winOverlay").classList.remove("hidden");
      }, 200);
    }
  }

  recordHistory() {
    // Instead of slice() we keep the “clean” card data
    const snapshot = {
      // Each card as plain object
      tableau: this.tableau.map((col) =>
        col.map((c) => ({ suit: c.suit, value: c.value, faceUp: c.faceUp })),
      ),
      foundations: this.foundations.map((col) =>
        col.map((c) => ({ suit: c.suit, value: c.value, faceUp: c.faceUp })),
      ),
      stock: this.stock.map((c) => ({
        suit: c.suit,
        value: c.value,
        faceUp: c.faceUp,
      })),
      waste: this.waste.map((c) => ({
        suit: c.suit,
        value: c.value,
        faceUp: c.faceUp,
      })),
      moveCount: this.moveCount,
    };
    this.history.push(snapshot);
    if (this.history.length > 100) this.history.shift();
  }

  drawHUD() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const margin = 20;

    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Calculate y so that HUD was above the bottom (retreat margin)
    const yPos = margin;

    const elapsed = Date.now() - this.startTime - this.accumulatedPause;
    const secs = Math.floor(elapsed / 1000);
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    ctx.fillText(`Moves: ${this.moveCount}     Time: ${m}:${s}`, 20, yPos);

    ctx.restore();
  }

  undo() {
    // If there is no previous state - we do nothing
    if (this.history.length < 2) return;

    // 1) Throw out the current condition
    this.history.pop();

    // 2) Take now the last (ie the one we want to roll)
    const prev = this.history[this.history.length - 1];

    // 3) Play all arrays of maps with Snapshot
    this.tableau = prev.tableau.map((colData) =>
      colData.map((d) => new Card(d.suit, d.value, d.faceUp)),
    );
    this.foundations = prev.foundations.map((colData) =>
      colData.map((d) => new Card(d.suit, d.value, d.faceUp)),
    );
    this.stock = prev.stock.map((d) => new Card(d.suit, d.value, d.faceUp));
    this.waste = prev.waste.map((d) => new Card(d.suit, d.value, d.faceUp));

    // 4) Restoring the move counter
    this.moveCount = prev.moveCount;

    // 5) Re-render the field
    this.render();
  }

  /**
   * Starts Waste Running Animation.
   * @param {Card []} oldVis - an array
   * @param {Card []} newVis - an array
   */
  startWasteAnimation(oldVis, newVis) {
    const now = Date.now();
    this.wasteAnim.active = true;
    this.wasteAnim.start = now;
    this.wasteAnim.fromSlot.clear();
    this.wasteAnim.toSlot.clear();

    const maxVisible = 3;
    const oldStart = maxVisible - oldVis.length;
    oldVis.forEach((c, i) => this.wasteAnim.fromSlot.set(c, oldStart + i));
    const newStart = maxVisible - newVis.length;
    newVis.forEach((c, i) => this.wasteAnim.toSlot.set(c, newStart + i));

    // Local animation cycle
    const step = () => {
      this.render();
      if (this.wasteAnim.active) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
