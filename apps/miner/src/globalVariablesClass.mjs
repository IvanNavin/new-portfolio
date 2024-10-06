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
    this.myLatestTap = null;
    this.winResult = (this.rows * this.cols) - this.mine;
    this.cells = document.querySelector('.cells');
    this.field = document.querySelector('.field');
    this.select = document.getElementById('select');
    this.counterBomb = document.querySelector('.counter.bomb');
  }

  random = (n) => Math.floor(Math.random() * n);

  pad = (n) => Number(n).toString().padStart(3, '0');

  isMob = () => /Mobi|Android/i.test(navigator.userAgent);
}