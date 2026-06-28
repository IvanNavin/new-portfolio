const controls = {
  duration: 2,
  blur: 3,
  windX: 200, // base horizontal drift of the dust (px)
  windY: -100, // base vertical drift of the dust (px, negative = up)
  fan: 150, // how much the layers spread sideways into a cone
  jitter: 45, // random per-layer wobble so no two layers move alike
  scatter: 25, // max rotation of a layer (deg)
  detail: 20, // number of dust layers
  resetDelay: 1000, // ms to wait, after the snap finishes, before restoring
};

const RES = 332; // internal pixel resolution of each dust canvas

const btn = document.querySelector("[data-effect]");

btn.addEventListener("click", (e) => {
  // currentTarget is always the button, even when the click lands on the
  // gauntlet icon inside it (e.target would be that <img>, with no dataset).
  const target = document.querySelector(e.currentTarget.dataset.target);

  if (target.style.display === "none") {
    target.style.display = "";
  }

  // Clear any leftover transition classes from a previous run.
  Array.from(target.children).forEach((el) => {
    el.classList.remove("quickFade", "fadeinimage");
  });

  btn.disabled = true;
  snap(target);
});

const snap = (target) => {
  const canvasCount = controls.detail;
  const img = target.querySelector("img");
  const canvas = document.createElement("canvas");
  canvas.width = RES;
  canvas.height = RES;
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

  const center = (canvasCount - 1) / 2;
  const d = controls.duration * 1000;

  //create canvas for each imageData and append to target element
  for (let i = 0; i < canvasCount; i++) {
    const c = newCanvasFromImageData(
      imageDataArray[i],
      canvas.width,
      canvas.height,
    );
    c.classList.add("dust");

    // Spread the layers into a cone: outer layers (by horizontal band) lean
    // further out, and every layer gets a little random jitter so the cloud
    // disperses organically instead of as 20 identical sheets.
    const lean = center === 0 ? 0 : (i - center) / center; // -1 .. 1
    const sx = controls.windX + lean * controls.fan + jitter();
    const sy = controls.windY - Math.abs(lean) * 30 + jitter();
    const angle = chance.integer({
      min: -controls.scatter,
      max: controls.scatter,
    });

    //apply animation, staggered so the dust peels away gradually
    setTimeout(() => {
      animateTransform(c, sx, sy, angle, d);
      c.classList.add("blur");
      setTimeout(() => {
        c.remove();
      }, d + 50);
    }, 65 * i);

    //append dust to target
    target.appendChild(c);
  }

  Array.from(target.querySelectorAll(":not(.dust)")).forEach((el) => {
    el.classList.add("quickFade");
  });

  // Reset once the last layer has drifted off and the pause has elapsed.
  setTimeout(
    () => {
      btn.disabled = false;
      reset(target);
    },
    controls.duration * 1000 + 65 * canvasCount + controls.resetDelay,
  );
};

const jitter = () =>
  chance.integer({ min: -controls.jitter, max: controls.jitter });

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

// Remove the leftover dust and fade the original image back in.
const reset = (target) => {
  const img = target.querySelector("img");

  Array.from(target.children).forEach((child) => {
    if (child !== img) {
      child.remove();
    }
  });

  img.classList.remove("quickFade");
  img.classList.add("fadeinimage");
  target.style.display = "";
};
