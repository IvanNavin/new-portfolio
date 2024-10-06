export class Menu {
  constructor(opts) {
    this.opts = opts
  }

  setSimple = () => {
     this.opts.rows = 8;
     this.opts.cols = 10;
     this.opts.mine = 10;
     this.opts.flags = 10;
     this.opts.counterBomb.innerText = '010';
  }

  setNormal = () => {
     this.opts.rows = 14;
     this.opts.cols = 18;
     this.opts.mine = 40;
     this.opts.flags = 40;
     this.opts.counterBomb.innerText = '040';
  }

  setHard = () => {
     this.opts.rows = 20;
     this.opts.cols = 24;
     this.opts.mine = 99;
     this.opts.flags = 99;
     this.opts.counterBomb.innerText = '099';
  }

  onSelect = ({ target: { value }}) => {
    switch (value) {
      case 'simple': {
        this.setSimple();
        break;
      }
      case 'normal': {
        this.setNormal();
        break;
      }
      case 'hard': {
        this.setHard();
        break;
      }
      default: {
        this.setSimple();
      }
    }

     this.opts.cells.style['grid-template-columns'] = `repeat(${ this.opts.cols}, 32px)`;
  }

  listenSelect = () => {
     this.opts.select?.addEventListener('change', this.onSelect);
  }

  resetMenu = () => {
    this.setSimple();
     this.opts.cells.style['grid-template-columns'] = `repeat(10, 32px)`;
     this.opts.select.value = 'simple';
     this.opts.field.dataset.state = 'menu';
  }
}