const controls = {
  duration: 2,
  blur: 3,
  windX: 200,
  windY: -100,
  scatter: 25,
  detail: 20,
  resetDelay: 1000, // the time in milliseconds before the image returns
};

document.querySelector("[data-effect]").addEventListener("click", (e) => {
  const target = document.querySelector(e.target.dataset.target);

  if (target.style.display === "none") {
    target.style.display = "";
  }

  Array.from(target.children).map((el) => {
    el.classList.remove("quickFade");
  });

  snap(target);
});

const snap = (target) => {
  const canvasCount = controls.detail;
  const img = target.querySelector("img");
  const canvas = document.createElement("canvas");
  canvas.width = 332;
  canvas.height = 332;
  canvas.setAttribute("id", "effect-canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelArr = imageData.data;
  const data = imageData.data.slice(0).fill(0);
  let imageDataArray = Array.from({ length: canvasCount }, () => data.slice(0));

  //put pixel info to imageDataArray (Weighted Distributed)
  for (let i = 0; i < pixelArr.length; i += 4) {
    //find the highest probability canvas the pixel should be in
    const p = Math.floor((i / pixelArr.length) * canvasCount);
    const a = imageDataArray[weightedRandomDistrib(p, canvasCount)];

    // assign RGBA values from image to dust canvas
    a[i] = pixelArr[i];
    a[i + 1] = pixelArr[i + 1];
    a[i + 2] = pixelArr[i + 2];
    a[i + 3] = pixelArr[i + 3];
  }

  //create canvas for each imageData and append to target element
  for (let i = 0; i < canvasCount; i++) {
    const c = newCanvasFromImageData(
      imageDataArray[i],
      canvas.width,
      canvas.height,
    );
    c.classList.add("dust");
    // c.style.zIndex = canvasCount - i;

    const d = controls.duration * 1000;

    //apply animation
    setTimeout(
      () => {
        animateTransform(
          c,
          controls.windX,
          controls.windY,
          chance.integer({
            min: -controls.scatter,
            max: controls.scatter,
          }),
          d,
        );
        c.classList.add("blur");
        setTimeout(() => {
          c.remove();
        }, d + 50);
      },
      65 * i + 4 * controls.duration,
    );

    //append dust to target
    target.appendChild(c);
  }

  Array.from(target.querySelectorAll(":not(.dust)")).map((el) => {
    el.classList.add("quickFade");
  });

  // Запускаємо reset після того, як анімація завершиться
  setTimeout(
    () => {
      reset(target);
    },
    controls.duration * 1000 + controls.resetDelay,
  );
};

const weightedRandomDistrib = (peak, count) => {
  const prob = [],
    seq = [];

  for (let i = 0; i < count; i++) {
    prob.push(Math.pow(count - Math.abs(peak - i), controls.detail / 2));
    seq.push(i);
  }
  return chance.weighted(seq, prob);
};

const animateTransform = (elem, sx, sy, angle, duration) => {
  elem.animate(
    [
      // keyframes
      { transform: "rotate(0) translate(0, 0)" },
      {
        transform:
          "rotate(" + angle + "deg) translate(" + sx + "px," + sy + "px)",
      },
    ],
    {
      // timing options
      duration: duration,
      easing: "ease-in",
    },
  );
};

const newCanvasFromImageData = (imageDataArray, w, h) => {
  const canvas = document.createElement("canvas");

  canvas.width = w;
  canvas.height = h;

  const tempCtx = canvas.getContext("2d");

  tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);

  return canvas;
};

// Функція для скидання ефекту і повернення зображення
const reset = (target) => {
  const img = target.querySelector("img");

  Array.from(target.children).forEach((child) => {
    if (child !== img) {
      child.remove();
    }
  });

  img.classList.remove("quickFade");
  target.style.display = "";
};
