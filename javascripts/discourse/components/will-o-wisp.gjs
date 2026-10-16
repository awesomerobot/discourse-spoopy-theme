import { modifier } from "ember-modifier";

// pixels per second; each leg picks its own pace within this range
const MIN_SPEED = 25;
const MAX_SPEED = 70;
const HOVER_CHANCE = 0.45;

function random(min, max) {
  return min + Math.random() * (max - min);
}

// wanders the header on its own, never quite the same way twice: it drifts to
// a random spot, sometimes hovers there a while bobbing gently, then moves on
const wander = modifier((element) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let x = random(0.1, 0.4) * window.innerWidth;
  let y = random(18, 36);
  let current;
  let stopped = false;

  const play = (keyframes, options) => {
    current = element.animate(keyframes, { fill: "forwards", ...options });
    return current.finished.catch(() => {});
  };

  const loop = async () => {
    element.style.transform = `translate(${x}px, ${y}px)`;

    while (!stopped) {
      // favour a real journey over a shuffle in place
      const width = window.innerWidth;
      let nextX;
      do {
        nextX = random(-0.04, 1.04) * width;
      } while (Math.abs(nextX - x) < width * 0.12);
      const nextY = random(12, 44);
      const distance = Math.hypot(nextX - x, nextY - y);

      await play(
        [
          { transform: `translate(${x}px, ${y}px)` },
          {
            transform: `translate(${(x + nextX) / 2 + random(-30, 30)}px, ${random(10, 46)}px)`,
            offset: random(0.35, 0.65),
          },
          { transform: `translate(${nextX}px, ${nextY}px)` },
        ],
        {
          duration: (distance / random(MIN_SPEED, MAX_SPEED)) * 1000,
          easing: "ease-in-out",
        }
      );
      x = nextX;
      y = nextY;

      if (!stopped && Math.random() < HOVER_CHANCE) {
        const bob = random(3, 7);
        await play(
          [
            { transform: `translate(${x}px, ${y}px)` },
            { transform: `translate(${x + random(-6, 6)}px, ${y - bob}px)` },
            { transform: `translate(${x}px, ${y}px)` },
          ],
          {
            duration: random(1.5, 3.5) * 1000,
            iterations: Math.ceil(random(1, 4)),
            easing: "ease-in-out",
          }
        );
      }
    }
  };

  loop();

  return () => {
    stopped = true;
    current?.cancel();
  };
});

// drifts through the header's branches; see scss/wisp.scss
const WillOWisp = <template>
  <span class="nbd-wisp" aria-hidden="true" {{wander}}>
    <span class="nbd-wisp__glow"></span>
  </span>
</template>;

export default WillOWisp;
