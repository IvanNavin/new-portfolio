const from = (x, fromX) => (x < fromX ? fromX : x);
const to = (x, toX) => (x > toX ? toX : x);

function clamp(x, fromX, toX) {
  let tempVariable = from(x, fromX);
  tempVariable = to(tempVariable, toX);
  return tempVariable;
}

export function animateEx(dx, startTime, currentTime, speed, looped = false) {
  const diff = currentTime - startTime;
  let time = (speed && diff / speed) || 0;

  if (looped) {
    time %= 1;
  } else if (time > 1) {
    time = 1;
  }

  return { offset: dx * time, progress: time };
}

// Escape user-supplied text before inserting it into the DOM via innerHTML,
// so a chat message like `<img src=x onerror=...>` renders as text, not markup.
export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
}

const normalize = (num) => (num.toString().length > 1 ? num : `0${num}`);

export function getTime(date) {
  const convertDate = new Date(date);
  return `${normalize(convertDate.getHours())}:${normalize(convertDate.getMinutes())}`;
}

export default clamp;
