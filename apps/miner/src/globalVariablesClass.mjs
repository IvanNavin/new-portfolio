export class GlobalVariablesClass {
  constructor() {
    this.matrix = [];
    this.cover = [];
    this.bomb = 'bomb';
    this.rows = 8;
    this.cols = 10;
    this.mine = 10;
    this.flags = this.mine;
    this.touchTimer = 0;
    this.longPressed = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.winResult = (this.rows * this.cols) - this.mine;
    this.cells = document.querySelector('.cells');
    this.field = document.querySelector('.field');
    this.select = document.getElementById('select');
    this.counterBomb = document.querySelector('.counter.bomb');
  }

  random = (n) => Math.floor(Math.random() * n);

  pad = (n, len = 3) => {
    const num = Number(n);
    const sign = num < 0 ? '-' : '';
    return sign + Math.abs(num).toString().padStart(len, '0');
  };

  isMob = () =>
    /Mobi|Android/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches);
}