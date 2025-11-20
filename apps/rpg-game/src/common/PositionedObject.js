import EventSourceMixin from './EventSourceMixin';

class PositionedObject {
  constructor(cfg) {
    Object.assign(
      this,
      {
        cfg,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      cfg,
    );
  }

  /**
   * object coordinates in the world
   * @param {int} offsetPercentX Shift relative to the upper left corner as a percentage of the object size
   * @param {int} offsetPercentY Shift relative to the upper left corner as a percentage of the object size
   */
  worldPosition(offsetPercentX = 0, offsetPercentY = 0) {
    return {
      x: this.x + (this.width * offsetPercentX) / 100,
      y: this.y + (this.height * offsetPercentY) / 100,
    };
  }

  worldBounds() {
    const { x, y, width, height } = this;
    return {
      x,
      y,
      width,
      height,
    };
  }

  /**
   * Coordinates of the object relative to the display window (canvas)
   * @param {int} offsetPercentX Shift relative to the upper left corner as a percentage of the object size
   * @param {int} offsetPercentY Shift relative to the upper left corner as a percentage of the object size
   */
  canvasPosition(offsetPercentX = 0, offsetPercentY = 0) {
    const pos = this.worldPosition(offsetPercentX, offsetPercentY);

    return {
      x: pos.x,
      y: pos.y,
    };
  }
}

Object.assign(PositionedObject.prototype, EventSourceMixin);

export default PositionedObject;
