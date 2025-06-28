let time = 0;
let running = false;
let interval;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updateDisplay() {
  document.getElementById("time").textContent = formatTime(time);
}

export function startStopwatch() {
  if (!running) {
    running = true;
    interval = setInterval(() => {
      time++;
      updateDisplay();
    }, 1000);
  }
}

export function stopStopwatch() {
  running = false;
  clearInterval(interval);
}

export function resetStopwatch() {
  stopStopwatch();
  time = 0;
  updateDisplay();
}
