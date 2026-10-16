// Dirt crumbles off the headstone composer as it rises: clumps of grit and
// clods spill from the arch (mostly off the steep shoulders, falling past the
// sides onto the heap), fine soil sifts after them, and a little dust kicks up
// from the ground at its base.

// mostly dark, damp soil with a few lighter, drier bits
const SOIL = ["#1e1611", "#2a1f18", "#33261d", "#3e2f24", "#4d3b2d", "#5c4836"];
const BATCHES = 8;
const BATCH_INTERVAL_MS = 60;
const SHOULDER_CLUMPS_PER_BATCH = 5;
const SIFT_PER_BATCH = 5;
const FACE_CRUMBS_PER_BATCH = 2;

let layer;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function ensureLayer(composer) {
  if (!layer?.isConnected) {
    layer = document.createElement("div");
    layer.className = "nbd-crumbs";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }

  // above the composer, so crumbs can slide down its face
  const z = parseInt(getComputedStyle(composer).zIndex, 10);
  layer.style.zIndex = Number.isNaN(z) ? "" : String(z + 1);
  return layer;
}

// y of the arch's top edge at x: a segmental arch, the quadratic curve from
// one shoulder (rise below the top) through the apex to the other
function archTop(rect, rise, x) {
  const t = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
  return rect.top + rise * (1 - 2 * t) ** 2;
}

function spawn(className, styles, keyframes, options) {
  const el = document.createElement("span");
  el.className = className;
  Object.assign(el.style, styles);
  layer.appendChild(el);
  el.animate(keyframes, { fill: "forwards", ...options }).onfinish = () =>
    el.remove();
}

// an irregular, jagged outline, so no two crumbs share a shape
function jaggedOutline() {
  const corners = Math.round(random(5, 8));
  const points = [];

  for (let i = 0; i < corners; i++) {
    const angle = (i / corners) * Math.PI * 2 + random(-0.3, 0.3);
    const reach = random(0.55, 1) * 50;
    points.push(
      `${(50 + Math.cos(angle) * reach).toFixed(1)}% ${(50 + Math.sin(angle) * reach).toFixed(1)}%`
    );
  }

  return `polygon(${points.join(", ")})`;
}

// mostly fine grit, now and then a proper clod
function crumbSize() {
  return Math.random() < 0.7 ? random(1, 2.6) : random(3, 6.5);
}

function crumb(x, y, dx, dy, duration, size = crumbSize()) {
  const tone = pick(SOIL);
  const opacity = random(0.65, 1);
  const tiny = size < 2;
  // a little sideways tumble partway down instead of a clean arc
  const wobble = random(-6, 6);

  spawn(
    "nbd-crumb",
    {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size * random(0.6, 1.3)}px`,
      background: tiny
        ? tone
        : `radial-gradient(circle at 35% 30%, ${pick(SOIL)}, ${tone} 55%, #0d0907)`,
      clipPath: tiny ? "" : jaggedOutline(),
      filter: tiny ? "blur(0.3px)" : "",
    },
    [
      { transform: "translate(0, 0) rotate(0deg)", opacity },
      {
        transform: `translate(${dx * 0.35 + wobble}px, ${dy * 0.3}px) rotate(${random(-90, 90)}deg)`,
        opacity,
        offset: 0.4,
      },
      { opacity: opacity * 0.9, offset: 0.75 },
      {
        transform: `translate(${dx}px, ${dy}px) rotate(${random(-400, 400)}deg)`,
        opacity: 0,
      },
    ],
    // ease-in, so crumbs accelerate like they're falling
    { duration, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)" }
  );
}

// dirt comes away in clumps of a few bits that fall together and spread
function shoulderClump(rect, rise, ground) {
  const left = Math.random() < 0.5;
  const along = random(0, rect.width * 0.12);
  const x = left ? rect.left + along : rect.right - along;
  const y = archTop(rect, rise, x) + random(0, 4);
  const outward = (left ? -1 : 1) * random(8, 46);
  const dy = Math.max(20, ground - y - random(0, 18));
  const duration = random(700, 1300);
  const pieces = Math.round(random(1, 4));

  for (let i = 0; i < pieces; i++) {
    crumb(
      x + random(-4, 4),
      y + random(-2, 3),
      outward * random(0.8, 1.25),
      dy * random(0.92, 1),
      duration * random(0.9, 1.1)
    );
  }
}

// fine dry soil sifting off the shoulders: faint, slow, and drifting
function sift(rect, rise, ground) {
  const left = Math.random() < 0.5;
  const along = random(0, rect.width * 0.08);
  const x = left ? rect.left + along : rect.right - along;
  const y = archTop(rect, rise, x) + random(0, 3);
  const opacity = random(0.25, 0.5);

  spawn(
    "nbd-crumb",
    {
      left: `${x}px`,
      top: `${y}px`,
      width: "1px",
      height: `${random(1, 3)}px`,
      background: pick(SOIL.slice(3)),
      filter: "blur(0.4px)",
    },
    [
      { transform: "translate(0, 0)", opacity },
      {
        transform: `translate(${(left ? -1 : 1) * random(4, 30)}px, ${Math.max(20, ground - y) * random(0.4, 0.9)}px)`,
        opacity: 0,
      },
    ],
    { duration: random(1200, 1900), easing: "cubic-bezier(0.3, 0, 0.7, 1)" }
  );
}

function faceCrumb(rect, rise) {
  const x = rect.left + random(rect.width * 0.12, rect.width * 0.88);
  const y = archTop(rect, rise, x) + random(0, 3);

  crumb(x, y, random(-5, 5), random(12, 50), random(450, 750), random(1, 3));
}

function dust(rect, ground) {
  const spots = [
    rect.left + random(-50, 20),
    rect.right + random(-20, 50),
    rect.left + rect.width * random(0.25, 0.45),
    rect.left + rect.width * random(0.55, 0.75),
  ];

  spots.forEach((x, i) => {
    const size = random(40, 80);

    spawn(
      "nbd-dust",
      {
        left: `${x - size / 2}px`,
        top: `${ground - size / 2 - 6}px`,
        width: `${size}px`,
        height: `${size}px`,
      },
      [
        { transform: "translateY(0) scale(0.3)", opacity: 0.8 },
        {
          transform: `translateY(${-random(10, 24)}px) scale(1.5)`,
          opacity: 0,
        },
      ],
      { duration: random(900, 1400), delay: 120 + i * 60, easing: "ease-out" }
    );
  });
}

export default function crumble(composer) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // only set while the composer is shaped like a headstone
  const rise = parseFloat(
    getComputedStyle(composer).getPropertyValue("--nbd-gravestone-rise")
  );
  if (!rise) {
    return;
  }

  ensureLayer(composer);
  const ground = window.innerHeight;
  const started = performance.now();
  let batch = 0;
  let nextAt = 0;

  // the composer starts at zero height, so wait for it to begin rising, then
  // shed a batch every interval, reading where the arch is each time
  const tick = (now) => {
    const rect = composer.getBoundingClientRect();

    if (rect.height && now >= nextAt) {
      for (let i = 0; i < SHOULDER_CLUMPS_PER_BATCH; i++) {
        shoulderClump(rect, rise, ground);
      }
      for (let i = 0; i < SIFT_PER_BATCH; i++) {
        sift(rect, rise, ground);
      }
      for (let i = 0; i < FACE_CRUMBS_PER_BATCH; i++) {
        faceCrumb(rect, rise);
      }
      if (batch === 0) {
        dust(rect, ground);
      }
      batch++;
      nextAt = now + BATCH_INTERVAL_MS;
    }

    // give up if it never opens
    if (batch < BATCHES && now - started < 2000) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}
