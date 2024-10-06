export class GenerateField {
  constructor(opts) {
    this.opts = opts;
  }

  createField = () => {
    const arr = []

    for (let i = 0; i <  this.opts.rows; i++) {
      arr[i] = new Array( this.opts.cols).fill(0)
    }

    return arr;
  }

  createMatrix = () => {
    const matrix = this.createField();
    let mine = this.opts.mine;

    while (mine > 0) {
      const x = this.opts.random(this.opts.cols-1);
      const y = this.opts.random(this.opts.rows-1);

      if (matrix[y][x] !== this.opts.bomb) {
        matrix[y][x] = this.opts.bomb;
        mine--;
      }
    }

    for (let i = 0; i < this.opts.rows; i++) {
      for (let j = 0; j < this.opts.cols; j++) {
        if (matrix[i][j] === this.opts.bomb) {
          continue;
        }
        if (i - 1 >= 0) {
          if (j - 1 >= 0 && matrix[i-1][j-1] === this.opts.bomb) matrix[i][j]++
          if (matrix[i-1][j] === this.opts.bomb) matrix[i][j]++
          if (j + 1 < this.opts.cols && matrix[i-1][j+1] === this.opts.bomb)  matrix[i][j]++
        }
        if (i + 1 < this.opts.rows) {
          if (j - 1 >= 0 && matrix[i+1][j-1] === this.opts.bomb) matrix[i][j]++
          if (matrix[i+1][j] === this.opts.bomb) matrix[i][j]++
          if (j + 1 < this.opts.cols && matrix[i+1][j+1] === this.opts.bomb)  matrix[i][j]++
        }
        if (j - 1 >= 0 && matrix[i][j-1] === this.opts.bomb) matrix[i][j]++
        if (j + 1 < this.opts.cols && matrix[i][j+1] === this.opts.bomb) matrix[i][j]++
      }
    }

    return matrix;
  }

  createHtml = () => {
    const countCells =  this.opts.rows *  this.opts.cols;
    let html = '';

    for (let i = 0; i < countCells; i++) {
      html += `<div class="cell" index="${i}" onselectstart="return false;"></div>`
    }

     this.opts.cells.insertAdjacentHTML('afterbegin', html);
  }

  resetField = () => {
     this.opts.matrix = [];
     this.opts.cover = [];
     this.opts.cells.textContent = '';
  }
}