import Deck from "./Deck.js";
import Card from "./Card.js";
import {
  isValidFoundationDrop,
  isValidTableauDrop,
  rankOf,
  strokeRoundedRect,
} from "./helpers.js";

const now = () => performance.now();
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
// easeOutCubic — cards decelerate as they land.
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const MOVE_MS = 170;
const SNAP_MS = 200;
const FLIP_MS = 240;
const DEAL_MS = 260;
const DEAL_STAGGER = 45;

export default class Game {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;

    this.tableau = Array.from({ length: 7 }, () => []);
    this.foundations = Array.from({ length: 4 }, () => []);
    this.stock = [];
    this.waste = [];

    this.verticalOffset = 40;
    this.overlapFactor = 0.1;
    this.moveCount = 0;
    this.startTime = null;
    this.history = [];
    this.accumulatedPause = 0;
    this.pauseStart = null;
    this.paused = false;
    this.drag = null;

    // --- animation state ---
    this.flying = new Map(); // Card -> { fromX, fromY, toX, toY, start, duration, delay, onComplete }
    this.flips = new Map(); // Card -> { start, duration }
    this.winCascade = null; // { particles: [...] }
    this.inputLocked = false; // true while dealing / auto-completing / cascading
    this.loopRunning = false;
    this.wasteAnim = {
      active: false,
      start: 0,
      duration: 200,
      fromSlot: new Map(),
      toSlot: new Map(),
    };
  }

  init() {
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
    this.flying.clear();
    this.flips.clear();
    this.winCascade = null;

    this.deck = new Deck();
    this.deck.shuffle();

    // Deal face-down; the reveal happens after the deal animation lands.
    for (let col = 0; col < 7; col++) {
      for (let i = 0; i <= col; i++) {
        this.tableau[col].push(this.deck.draw());
      }
    }
    this.stock = this.deck.cards.slice();

    this.startDealAnimation();
    this.recordHistory();
  }

  // ---------- geometry ----------

  getLayout() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const idealW = 1000;
    const idealH = 780;
    const scale = Math.min(W / idealW, H / idealH);
    const idealMargin = 20;
    const idealGap = 20;
    const cols = 7;
    const margin = idealMargin * scale;
    const gap = idealGap * scale;
    const cw0 = (idealW - 2 * idealMargin - (cols - 1) * idealGap) / cols;
    const cw = cw0 * scale;
    const ch = cw0 * 1.5 * scale;
    const groupW = (cw + gap) * 7 - gap;
    const startX = (W - groupW) / 2;
    const topY = margin + this.verticalOffset;
    const tableauY = topY + ch + margin;
    // Face-down cards pack tight; face-up cards fan out so their rank/suit
    // corner stays readable. The face-up gap shrinks as needed so the tallest
    // column still fits on screen (never overflowing off the bottom).
    const overlapDown = ch * 0.14;
    const idealUp = ch * 0.3;
    const available = H - tableauY - margin;
    let overlapUp = idealUp;
    for (let c = 0; c < cols; c++) {
      let up = 0;
      let down = 0;
      for (const card of this.tableau[c]) card.faceUp ? (up += 1) : (down += 1);
      if (up > 1) {
        const room = available - ch - down * overlapDown;
        overlapUp = Math.min(overlapUp, room / (up - 1));
      }
    }
    overlapUp = Math.max(overlapUp, ch * 0.11);
    const stockX = startX + 6 * (cw + gap);
    const wasteX = stockX - gap - cw;
    return {
      W,
      H,
      scale,
      margin,
      gap,
      cw,
      ch,
      startX,
      topY,
      tableauY,
      overlapDown,
      overlapUp,
      stockX,
      wasteX,
      cols,
    };
  }

  foundationPos(i, L) {
    return { x: L.startX + i * (L.cw + L.gap), y: L.topY };
  }

  // Cumulative Y of a card in a column — depends on how many face-down vs
  // face-up cards sit beneath it.
  tableauCardY(col, row, L) {
    const pile = this.tableau[col];
    let y = L.tableauY;
    for (let i = 0; i < row; i++) {
      y += pile[i] && pile[i].faceUp ? L.overlapUp : L.overlapDown;
    }
    return y;
  }

  tableauPos(col, row, L) {
    return {
      x: L.startX + col * (L.cw + L.gap),
      y: this.tableauCardY(col, row, L),
    };
  }

  // ---------- animation core ----------

  isAnimating() {
    return (
      this.flying.size > 0 ||
      this.flips.size > 0 ||
      this.wasteAnim.active ||
      !!this.winCascade
    );
  }

  // Drive the canvas only while something is moving (no idle 60fps repaint).
  requestRender() {
    if (this.loopRunning) return;
    this.loopRunning = true;
    const loop = () => {
      this.render();
      if (this.isAnimating()) {
        requestAnimationFrame(loop);
      } else {
        this.loopRunning = false;
        this.render(); // settle the final static frame
      }
    };
    requestAnimationFrame(loop);
  }

  // Animate a group of cards gliding from (fromX,fromY) to (toX,toY), keeping
  // their vertical spacing. onComplete fires once, when the last card lands.
  animateFlight(cards, fromX, fromY, toX, toY, overlapY, opts = {}) {
    const t0 = now();
    const duration = opts.duration ?? MOVE_MS;
    cards.forEach((card, i) => {
      this.flying.set(card, {
        fromX,
        fromY: fromY + i * overlapY,
        toX,
        toY: toY + i * overlapY,
        start: t0,
        duration,
        delay: (opts.delay ?? 0) + i * (opts.stagger ?? 0),
        onComplete: i === cards.length - 1 ? opts.onComplete : null,
      });
    });
    this.requestRender();
  }

  reveal(card) {
    if (!card || card.faceUp) return;
    card.faceUp = true;
    this.flips.set(card, { start: now(), duration: FLIP_MS });
    this.requestRender();
  }

  startDealAnimation() {
    const L = this.getLayout();
    this.inputLocked = true;
    let order = 0;
    let last = null;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < this.tableau[col].length; row++) {
        const card = this.tableau[col][row];
        const to = this.tableauPos(col, row, L);
        this.flying.set(card, {
          fromX: L.stockX,
          fromY: L.topY,
          toX: to.x,
          toY: to.y,
          start: now(),
          duration: DEAL_MS,
          delay: order * DEAL_STAGGER,
          onComplete: null,
        });
        last = card;
        order += 1;
      }
    }
    if (last) {
      this.flying.get(last).onComplete = () => {
        // Reveal the bottom (top-of-column) cards once everything has landed.
        for (let col = 0; col < 7; col++) {
          const top = this.tableau[col].at(-1);
          setTimeout(() => this.reveal(top), col * 60);
        }
        this.inputLocked = false;
      };
    } else {
      this.inputLocked = false;
    }
    this.requestRender();
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

  checkWin() {
    return this.foundations.every((pile) => pile.length === 13);
  }

  // ---------- render ----------

  render() {
    if (this.paused) return;
    if (this.winCascade) {
      this.renderWinCascade();
      return;
    }

    const ctx = this.ctx;
    const L = this.getLayout();
    const { W, H, scale, cw, ch, topY, stockX } = L;
    ctx.clearRect(0, 0, W, H);

    const isFlying = (c) => this.flying.has(c);

    // --- foundations ---
    for (let i = 0; i < 4; i++) {
      const { x, y } = this.foundationPos(i, L);
      const top = this.foundations[i].at(-1);
      if (top && !isFlying(top)) {
        top.draw(ctx, x, y, cw, ch);
      } else if (!top) {
        this.drawEmptySlot(ctx, x, y, cw, ch, scale, "A");
      }
    }

    // --- stock ---
    const stockTop = this.stock.at(-1);
    if (stockTop && !isFlying(stockTop)) {
      stockTop.draw(ctx, stockX, topY, cw, ch);
    } else if (!this.stock.length) {
      this.drawEmptySlot(ctx, stockX, topY, cw, ch, scale, "recycle");
    }

    // --- waste ---
    this.drawWaste(ctx, L);

    // --- tableau ---
    for (let col = 0; col < L.cols; col++) {
      this.tableau[col].forEach((card, row) => {
        if (isFlying(card)) return;
        const { x, y } = this.tableauPos(col, row, L);
        this.drawCard(ctx, card, x, y, cw, ch);
      });
    }

    // --- flying layer (on top) ---
    this.drawFlying(ctx, cw, ch);

    // --- drag layer ---
    if (this.drag) {
      const { cards, x, y, offsetX, offsetY, overlapY: oy } = this.drag;
      cards.forEach((c, i) =>
        this.drawCard(ctx, c, x - offsetX, y - offsetY + i * oy, cw, ch),
      );
    }

    this.drawHUD();
  }

  // Draws a card, applying a horizontal flip if it's mid-reveal.
  drawCard(ctx, card, x, y, cw, ch) {
    const flip = this.flips.get(card);
    if (!flip) {
      card.draw(ctx, x, y, cw, ch);
      return;
    }
    const t = clamp01((now() - flip.start) / flip.duration);
    if (t >= 1) {
      this.flips.delete(card);
      card.draw(ctx, x, y, cw, ch);
      return;
    }
    // First half shrinks the back to zero width, second half grows the face.
    const front = t >= 0.5;
    const p = front ? (t - 0.5) * 2 : 1 - t * 2;
    const img = front ? card.image : Card.backImage;
    const dw = Math.max(cw * p, 0.5);
    if (img) ctx.drawImage(img, x + (cw - dw) / 2, y, dw, ch);
  }

  drawFlying(ctx, cw, ch) {
    if (!this.flying.size) return;
    const t = now();
    const done = [];
    for (const [card, a] of this.flying) {
      const local = clamp01((t - a.start - (a.delay || 0)) / a.duration);
      const e = easeOut(local);
      const x = a.fromX + (a.toX - a.fromX) * e;
      const y = a.fromY + (a.toY - a.fromY) * e;
      card.draw(ctx, x, y, cw, ch);
      if (local >= 1) done.push(card);
    }
    for (const card of done) {
      const a = this.flying.get(card);
      this.flying.delete(card);
      a.onComplete?.();
    }
  }

  drawWaste(ctx, L) {
    const { cw, ch, topY, wasteX } = L;
    const maxVis = 3;
    const total = this.waste.length;
    const overlapX = cw * 0.3;
    const xSlots = [wasteX - 2 * overlapX, wasteX - overlapX, wasteX];

    // While the top waste card is being dragged, leave the cards under it
    // exactly where they were (they don't slide toward the gap).
    if (this.drag?.from?.pile === "waste") {
      const under = this.waste.slice(-2);
      const offset = 2 - under.length;
      for (let i = 0; i < this.waste.length - under.length; i++) {
        if (!this.flying.has(this.waste[i]))
          this.waste[i].draw(ctx, xSlots[0], topY, cw, ch);
      }
      under.forEach((c, i) => {
        if (!this.flying.has(c)) c.draw(ctx, xSlots[i + offset], topY, cw, ch);
      });
      return;
    }

    if (total === 0) return;

    const hidden = Math.max(0, total - maxVis);
    for (let i = 0; i < hidden; i++) {
      if (!this.flying.has(this.waste[i]))
        this.waste[i].draw(ctx, xSlots[0], topY, cw, ch);
    }
    const visible = this.waste.slice(-maxVis);
    let t = 1;
    if (this.wasteAnim.active) {
      const e = now() - this.wasteAnim.start;
      t = Math.min(1, e / this.wasteAnim.duration);
      if (t === 1) this.wasteAnim.active = false;
    }
    visible.forEach((c, i) => {
      if (this.flying.has(c)) return;
      const from = this.wasteAnim.fromSlot.get(c);
      const to = this.wasteAnim.toSlot.get(c);
      let x;
      if (this.wasteAnim.active && from != null && to != null) {
        x = xSlots[from] + (xSlots[to] - xSlots[from]) * t;
      } else {
        x = xSlots[maxVis - visible.length + i];
      }
      c.draw(ctx, x, topY, cw, ch);
    });
  }

  drawEmptySlot(ctx, x, y, cw, ch, scale, glyph) {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    strokeRoundedRect(ctx, x, y, cw, ch, 10);
    ctx.restore();

    const inset = 8 * scale;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5 * scale, 5 * scale]);
    strokeRoundedRect(
      ctx,
      x + inset,
      y + inset,
      cw - inset * 2,
      ch - inset * 2,
      8 * scale,
    );
    ctx.restore();

    if (glyph === "recycle") {
      const svg = `M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z`;
      const p = new Path2D(svg);
      const s = Math.min((cw - inset * 2) / 256, (ch - inset * 2) / 256);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.translate(x + (cw - 256 * s) / 2, y + (ch - 256 * s) / 2);
      ctx.scale(s, s);
      ctx.fill(p);
      ctx.restore();
    } else if (glyph) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `${ch * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(glyph, x + cw / 2, y + ch / 2);
      ctx.restore();
    }
  }

  // ---------- input ----------

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const src = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  hitTest(x, y) {
    const L = this.getLayout();
    const { cw, ch, startX, topY, tableauY, stockX, wasteX, cols } = L;

    for (let col = 0; col < cols; col++) {
      if (!this.tableau[col].length) {
        const tx = startX + col * (cw + L.gap);
        if (x >= tx && x <= tx + cw && y >= tableauY && y <= tableauY + ch) {
          return {
            pile: "tableau",
            index: col,
            row: 0,
            fx: tx,
            fy: tableauY,
            cw,
            ch,
            overlap: L.overlapUp,
          };
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      const { x: fx, y: fy } = this.foundationPos(i, L);
      if (x >= fx && x <= fx + cw && y >= fy && y <= fy + ch) {
        return { pile: "foundation", index: i, fx, fy, cw, ch };
      }
    }
    if (x >= stockX && x <= stockX + cw && y >= topY && y <= topY + ch) {
      return { pile: "stock", fx: stockX, fy: topY, cw, ch };
    }
    if (x >= wasteX && x <= wasteX + cw && y >= topY && y <= topY + ch) {
      return { pile: "waste", fx: wasteX, fy: topY, cw, ch };
    }
    for (let col = 0; col < cols; col++) {
      const tx = startX + col * (cw + L.gap);
      const pile = this.tableau[col];
      for (let row = pile.length - 1; row >= 0; row--) {
        const ty = this.tableauCardY(col, row, L);
        const bottom =
          row === pile.length - 1
            ? ty + ch
            : this.tableauCardY(col, row + 1, L);
        if (x >= tx && x <= tx + cw && y >= ty && y <= bottom) {
          return {
            pile: "tableau",
            index: col,
            row,
            fx: tx,
            fy: ty,
            cw,
            ch,
            overlap: L.overlapUp,
          };
        }
      }
    }
    return null;
  }

  onMouseDown(e) {
    if (this.inputLocked) return;
    const { x, y } = this.getMousePos(e);
    const hit = this.hitTest(x, y);
    if (!hit) return;

    if (hit.pile === "stock") {
      const oldVis = this.waste.slice(-3);
      if (this.stock.length) {
        const card = this.stock.pop();
        card.flip();
        this.waste.push(card);
        // The drawn card flies from the stock over to the waste.
        const L = this.getLayout();
        this.animateFlight([card], L.stockX, L.topY, L.wasteX, L.topY, 0);
      } else {
        while (this.waste.length) {
          const c = this.waste.pop();
          c.faceUp = false;
          this.stock.push(c);
        }
      }
      this.startWasteAnimation(oldVis, this.waste.slice(-3));
      this.recordHistory();
      return;
    }

    if (
      hit.pile === "waste" &&
      this.waste.length &&
      !this.flying.has(this.waste.at(-1))
    ) {
      const oldVis = this.waste.slice(-3);
      const cards = [this.waste.pop()];
      this.drag = {
        cards,
        from: hit,
        oldVis,
        x,
        y,
        offsetX: x - hit.fx,
        offsetY: y - hit.fy,
        cw: hit.cw,
        ch: hit.ch,
        overlapY: hit.overlap ?? hit.ch * this.overlapFactor,
      };
      // Note: no re-fan on pickup — the cards under the lifted one stay put
      // (handled in drawWaste), so nothing slides around.
      this.render();
      return;
    }

    if (hit.pile === "tableau" && this.tableau[hit.index].length) {
      const card = this.tableau[hit.index][hit.row];
      if (!card.faceUp || this.flying.has(card)) return;
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
    }
  }

  onMouseMove(e) {
    const p = this.getMousePos(e);
    if (!this.drag) {
      // Pointer cursor over anything grabbable, as a hover affordance.
      const hit = this.hitTest(p.x, p.y);
      const grabbable =
        (hit?.pile === "stock" && (this.stock.length || this.waste.length)) ||
        (hit?.pile === "waste" && this.waste.length) ||
        (hit?.pile === "tableau" && this.tableau[hit.index][hit.row]?.faceUp);
      this.canvas.style.cursor = grabbable ? "pointer" : "default";
      return;
    }
    if (Math.hypot(p.x - this.drag.x, p.y - this.drag.y) > 6) {
      this.drag.moved = true;
    }
    this.drag.x = p.x;
    this.drag.y = p.y;
    this.render();
  }

  onMouseUp(e) {
    if (!this.drag) return;
    const { x, y } = this.getMousePos(e);
    const hit = this.hitTest(x, y);
    const { cards, from, oldVis, offsetX, offsetY, overlapY, moved } =
      this.drag;
    const moving = cards[0];
    const dropX = x - offsetX;
    const dropY = y - offsetY;
    const L = this.getLayout();
    let target = null; // {x,y}

    // Only a real drag counts as a move — a plain click (that happens to land
    // back on a valid spot) must not trigger a spurious move, which would also
    // leave the card mid-flight and swallow the following double-click.
    if (moved) {
      if (
        hit?.pile === "foundation" &&
        cards.length === 1 &&
        isValidFoundationDrop(moving, this.foundations[hit.index])
      ) {
        this.foundations[hit.index].push(moving);
        target = this.foundationPos(hit.index, L);
      } else if (
        hit?.pile === "tableau" &&
        isValidTableauDrop(moving, this.tableau[hit.index])
      ) {
        const pile = this.tableau[hit.index];
        const startRow = pile.length;
        pile.push(...cards);
        target = this.tableauPos(hit.index, startRow, L);
      }
    }

    this.drag = null;

    if (target) {
      this.animateFlight(cards, dropX, dropY, target.x, target.y, overlapY, {
        onComplete: () => {
          if (from.pile === "tableau") {
            const src = this.tableau[from.index];
            if (src.length) this.reveal(src.at(-1));
          }
          this.afterMove();
        },
      });
      if (from.pile === "waste")
        this.startWasteAnimation(oldVis, this.waste.slice(-3));
      this.moveCount++;
      this.recordHistory();
    } else if (moved) {
      // Snap back to origin. Commit the cards back into their pile immediately
      // (not on animation end) so the card is never in limbo — a double-click
      // fired right after can still find and move it.
      if (from.pile === "waste") this.waste.push(...cards);
      else this.tableau[from.index].push(...cards);
      const startRow =
        from.pile === "waste"
          ? 0
          : this.tableau[from.index].length - cards.length;
      const back =
        from.pile === "waste"
          ? { x: L.wasteX, y: L.topY }
          : this.tableauPos(from.index, startRow, L);
      this.animateFlight(cards, dropX, dropY, back.x, back.y, overlapY, {
        duration: SNAP_MS,
      });
    } else {
      // A plain click that never moved — restore instantly, no animation.
      if (from.pile === "waste") this.waste.push(...cards);
      else this.tableau[from.index].push(...cards);
      this.render();
    }
  }

  // Double-click / double-tap → send the card to a foundation if it fits.
  onDoubleClick(e) {
    if (this.inputLocked || this.drag) return;
    const { x, y } = this.getMousePos(e);
    const hit = this.hitTest(x, y);
    if (!hit) return;

    let card = null;
    let from = null;
    if (hit.pile === "waste" && this.waste.length) {
      card = this.waste.at(-1);
      from = { pile: "waste" };
    } else if (hit.pile === "tableau" && this.tableau[hit.index].length) {
      const col = this.tableau[hit.index];
      if (hit.row === col.length - 1 && col.at(-1).faceUp) {
        card = col.at(-1);
        from = { pile: "tableau", index: hit.index };
      }
    }
    if (!card) return;
    // If the card is still animating home from a jittery click, cancel that
    // flight so the double-click can take over instead of being ignored.
    this.flying.delete(card);

    for (let i = 0; i < 4; i++) {
      if (isValidFoundationDrop(card, this.foundations[i])) {
        this.moveToFoundation(card, from, i);
        return;
      }
    }
  }

  moveToFoundation(card, from, fIndex) {
    const L = this.getLayout();
    let fromX;
    let fromY;
    if (from.pile === "waste") {
      this.waste.pop();
      const oldVis = this.waste.slice(-3).concat(card);
      fromX = L.wasteX;
      fromY = L.topY;
      this.startWasteAnimation(oldVis, this.waste.slice(-3));
    } else {
      const col = this.tableau[from.index];
      col.pop();
      const pos = this.tableauPos(from.index, col.length, L);
      fromX = pos.x;
      fromY = pos.y;
    }
    this.foundations[fIndex].push(card);
    const to = this.foundationPos(fIndex, L);
    this.moveCount++;
    this.animateFlight([card], fromX, fromY, to.x, to.y, 0, {
      onComplete: () => {
        if (from.pile === "tableau") {
          const src = this.tableau[from.index];
          if (src.length) this.reveal(src.at(-1));
        }
        this.afterMove();
      },
    });
    this.recordHistory();
  }

  // Runs after any committed move: win check + optional auto-finish.
  afterMove() {
    if (this.checkWin()) {
      this.startWinCascade();
      return;
    }
    if (!this.inputLocked && this.canAutoComplete()) {
      this.autoCompleteStep();
    }
  }

  canAutoComplete() {
    return (
      this.stock.length === 0 &&
      this.waste.length <= 1 &&
      this.tableau.every((col) => col.every((c) => c.faceUp))
    );
  }

  // One auto-move to a foundation, then chains to the next via the flight end.
  autoCompleteStep() {
    this.inputLocked = true;
    const candidates = [];
    if (this.waste.length)
      candidates.push({ card: this.waste.at(-1), from: { pile: "waste" } });
    this.tableau.forEach((col, index) => {
      if (col.length)
        candidates.push({ card: col.at(-1), from: { pile: "tableau", index } });
    });

    // Prefer the lowest rank so aces/twos go first.
    candidates.sort((a, b) => rankOf(a.card.value) - rankOf(b.card.value));
    for (const { card, from } of candidates) {
      for (let i = 0; i < 4; i++) {
        if (isValidFoundationDrop(card, this.foundations[i])) {
          const cb = () => {
            if (this.checkWin()) this.startWinCascade();
            else this.autoCompleteStep();
          };
          this.moveToFoundationChained(card, from, i, cb);
          return;
        }
      }
    }
    this.inputLocked = false;
  }

  moveToFoundationChained(card, from, fIndex, onDone) {
    const L = this.getLayout();
    let fromX;
    let fromY;
    if (from.pile === "waste") {
      this.waste.pop();
      fromX = L.wasteX;
      fromY = L.topY;
    } else {
      const col = this.tableau[from.index];
      col.pop();
      const pos = this.tableauPos(from.index, col.length, L);
      fromX = pos.x;
      fromY = pos.y;
    }
    this.foundations[fIndex].push(card);
    this.moveCount++;
    const to = this.foundationPos(fIndex, L);
    this.animateFlight([card], fromX, fromY, to.x, to.y, 0, {
      duration: 120,
      onComplete: onDone,
    });
  }

  // ---------- win cascade ----------

  startWinCascade() {
    const L = this.getLayout();
    const particles = [];
    this.foundations.forEach((pile, i) => {
      const { x, y } = this.foundationPos(i, L);
      pile.forEach((card) => {
        particles.push({
          card,
          x,
          y,
          vx: (Math.random() * 2 - 1) * 6 * (L.scale + 0.4),
          vy: -Math.random() * 4,
          cw: L.cw,
          ch: L.ch,
        });
      });
    });
    this.inputLocked = true;
    this.winCascade = { particles, ground: L.H - L.ch };
    // Fill once so the trails build on a clean board.
    this.ctx.fillStyle = "rgba(0,0,0,0.25)";
    this.ctx.fillRect(0, 0, L.W, L.H);
    this.requestRender();
    setTimeout(() => {
      document.getElementById("winOverlay")?.classList.remove("hidden");
    }, 3200);
  }

  renderWinCascade() {
    const ctx = this.ctx;
    const { W, H } = this.getLayout();
    // Translucent wash → cards leave fading trails (classic Solitaire win).
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, W, H);

    let alive = 0;
    for (const p of this.winCascade.particles) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      if (p.y + p.ch >= H) {
        p.y = H - p.ch;
        p.vy = -p.vy * 0.78;
        if (Math.abs(p.vy) < 1) p.vy = 0;
      }
      if (p.x + p.cw > 0 && p.x < W) {
        alive += 1;
        p.card.draw(ctx, p.x, p.y, p.cw, p.ch);
      }
    }
    if (alive === 0) this.winCascade = null;
  }

  // ---------- history / hud ----------

  recordHistory() {
    const snap = (pile) =>
      pile.map((c) => ({ suit: c.suit, value: c.value, faceUp: c.faceUp }));
    this.history.push({
      tableau: this.tableau.map(snap),
      foundations: this.foundations.map(snap),
      stock: snap(this.stock),
      waste: snap(this.waste),
      moveCount: this.moveCount,
    });
    if (this.history.length > 100) this.history.shift();
  }

  drawHUD() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const elapsed = Date.now() - this.startTime - this.accumulatedPause;
    const secs = Math.max(0, Math.floor(elapsed / 1000));
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    ctx.fillText(`Moves: ${this.moveCount}     Time: ${m}:${s}`, 20, 20);
    ctx.restore();
  }

  undo() {
    if (this.inputLocked || this.history.length < 2) return;
    this.history.pop();
    const prev = this.history[this.history.length - 1];
    const build = (pile) =>
      pile.map((d) => new Card(d.suit, d.value, d.faceUp));
    this.tableau = prev.tableau.map(build);
    this.foundations = prev.foundations.map(build);
    this.stock = build(prev.stock);
    this.waste = build(prev.waste);
    this.moveCount = prev.moveCount;
    this.flying.clear();
    this.flips.clear();
    this.render();
  }

  startWasteAnimation(oldVis, newVis) {
    this.wasteAnim.active = true;
    this.wasteAnim.start = now();
    this.wasteAnim.fromSlot.clear();
    this.wasteAnim.toSlot.clear();
    const maxVisible = 3;
    oldVis.forEach((c, i) =>
      this.wasteAnim.fromSlot.set(c, maxVisible - oldVis.length + i),
    );
    newVis.forEach((c, i) =>
      this.wasteAnim.toSlot.set(c, maxVisible - newVis.length + i),
    );
    this.requestRender();
  }
}
