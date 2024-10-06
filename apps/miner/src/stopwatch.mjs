export class Stopwatch {
  constructor(display) {
    this.running = false;
    this.display = display;

    this.resetStopwatch();
  }

  resetStopwatch = () => {
    this.sec = 0;
    this.print(this.sec);
  }

  start = () => {
    if (!this.running) {
      this.running = true;
      this.interval = setInterval(() => {
        this.sec++;
        this.print();
      }, 1000);
    }
  }

  stop = () => {
    this.running = false;
    clearInterval(this.interval);
  }

  print = () => {
    this.display.innerText = Number(this.sec).toString().padStart(3, '0');
  }
}