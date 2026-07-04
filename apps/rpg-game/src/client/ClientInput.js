import EventSourceMixin from "../common/EventSourceMixin";

// Keys that scroll the page by default — we swallow them so the world moves
// instead of the document while playing.
const MOVEMENT_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "Space",
]);

class ClientInput {
  constructor(canvas) {
    Object.assign(this, {
      canvas,
      keysPressed: new Set(), // currently held keys
      keyStateHandlers: {}, // handlers that fire every render if a key is pressed
      keyHandlers: {}, // handlers when a specific key is pressed
    });
    // Listen on the window so movement keeps working after the user clicks the
    // chat and back on the page (canvas focus is easy to lose).
    window.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    window.addEventListener("keyup", (e) => this.onKeyUp(e), false);
  }

  // Don't hijack keystrokes while the player is typing in a text field.
  static isTyping(e) {
    const el = e.target;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  onKeyDown(e) {
    if (ClientInput.isTyping(e)) return;
    if (MOVEMENT_KEYS.has(e.code)) e.preventDefault();

    this.keysPressed.add(e.code);
    if (this.keyHandlers[e.code]) {
      this.keyHandlers[e.code](true);
    }
    this.trigger("keydown", e);
  }

  onKeyUp(e) {
    this.keysPressed.delete(e.code);
    if (this.keyHandlers[e.code]) {
      this.keyHandlers[e.code](false);
    }
    this.trigger("keyup", e);
  }

  onKey({ ...handlers }) {
    this.keyHandlers = { ...this.keyHandlers, ...handlers };
  }
}

Object.assign(ClientInput.prototype, EventSourceMixin);

export default ClientInput;
