// A pool of warm light follows the mouse pointer while the rest of the page
// sits a little in shadow, like walking the forum with a flashlight. The
// timeline's candle casts its own small pool of light through the shadow.

const CANDLE_CHECK_MS = 500;

export default function installFlashlight() {
  // only for a real mouse; touch has no pointer to follow
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const beam = document.createElement("div");
  beam.className = "nbd-flashlight";
  beam.setAttribute("aria-hidden", "true");
  document.body.appendChild(beam);

  let x = 0;
  let y = 0;
  let queued = false;

  const paint = () => {
    queued = false;
    beam.style.setProperty("--nbd-beam-x", `${x}px`);
    beam.style.setProperty("--nbd-beam-y", `${y}px`);
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      x = event.clientX;
      y = event.clientY;
      beam.classList.add("--on");

      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    },
    { passive: true }
  );

  // the candle moves as the page scrolls and comes and goes with the route,
  // so follow it on scroll and resize, and check now and then for the rest
  let candleQueued = false;

  const placeCandle = () => {
    candleQueued = false;
    // only a lit candle casts light
    const handle = document.documentElement.classList.contains(
      "nbd-candle-timeline"
    )
      ? document.querySelector(".topic-timeline .timeline-handle")
      : null;
    const rect = handle?.getBoundingClientRect();

    if (rect?.height) {
      beam.style.setProperty(
        "--nbd-candle-x",
        `${rect.left + rect.width / 2}px`
      );
      // the flame sits just above the top of the handle
      beam.style.setProperty("--nbd-candle-y", `${rect.top - 8}px`);
    } else {
      beam.style.setProperty("--nbd-candle-x", "-999px");
    }
  };

  const queueCandle = () => {
    if (!candleQueued) {
      candleQueued = true;
      requestAnimationFrame(placeCandle);
    }
  };

  document.addEventListener("scroll", queueCandle, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", queueCandle, { passive: true });
  setInterval(queueCandle, CANDLE_CHECK_MS);
  queueCandle();

  // switch the light off when the pointer leaves the window
  document.documentElement.addEventListener("pointerleave", () =>
    beam.classList.remove("--on")
  );
}
