import { get } from "@ember/helper";
import { htmlSafe } from "@ember/template";

// left wing in three poses; the right wing is the same path mirrored
const WINGS = {
  up: "M46 24C40 16 35 9 30 5C24 3 14 1 4 3C10 7 12 11 12 15C17 13 21 15 23 19C28 17 33 21 35 25C39 25 42 28 45 32Z",
  mid: "M46 25C38 22 28 20 18 21C12 21 6 23 2 27C8 27 11 30 12 33C16 30 20 30 23 32C27 29 32 29 35 30C39 28 42 28 45 30Z",
  down: "M46 26C40 30 34 36 28 42C22 46 14 48 6 46C11 42 13 38 13 34C18 35 22 33 24 30C29 31 33 28 36 26C40 27 43 28 45 30Z",
};
const POSES = Object.entries(WINGS);
const BODY =
  "M50 14C53 14 54.5 18 54 22C56 26 55 33 50 40C45 33 44 26 46 22C45.5 18 47 14 50 14ZM46.5 17L45 10L48.5 15ZM53.5 17L55 10L51.5 15Z";

function vars(values) {
  return htmlSafe(
    Object.entries(values)
      .map(([key, value]) => `--nbd-${key}: ${value}`)
      .join("; ")
  );
}

// far bats are small and soft, near ones big, fast, and a little out of focus
const SOLO_BATS = [
  {
    y: "18vh",
    size: "44px",
    bob: "4vh",
    duration: "38s",
    delay: "3s",
    direction: "normal",
    flap: "0.26s",
    flutter: "1.1s",
    depth: "mid",
  },
  {
    y: "30vh",
    size: "24px",
    bob: "5vh",
    duration: "58s",
    delay: "19s",
    direction: "reverse",
    flap: "0.22s",
    flutter: "0.9s",
    depth: "far",
  },
  {
    y: "12vh",
    size: "18px",
    bob: "2vh",
    duration: "66s",
    delay: "31s",
    direction: "normal",
    flap: "0.2s",
    flutter: "0.8s",
    depth: "far",
  },
  {
    y: "50vh",
    size: "36px",
    bob: "6vh",
    duration: "72s",
    delay: "42s",
    direction: "reverse",
    flap: "0.28s",
    flutter: "1.3s",
    depth: "mid",
  },
  {
    y: "22vh",
    size: "84px",
    bob: "8vh",
    duration: "60s",
    delay: "65s",
    direction: "normal",
    flap: "0.34s",
    flutter: "1.5s",
    depth: "near",
    eyes: true,
  },
].map(({ depth, eyes, ...rest }) => ({ depth, eyes, style: vars(rest) }));

const COLONY = vars({
  y: "16vh",
  bob: "5vh",
  duration: "110s",
  delay: "80s",
  direction: "reverse",
});

const COLONY_BATS = [
  { x: "0px", dy: "0px", size: "28px", flap: "0.24s", flutter: "1s" },
  { x: "34px", dy: "-16px", size: "22px", flap: "0.21s", flutter: "0.85s" },
  { x: "62px", dy: "8px", size: "24px", flap: "0.25s", flutter: "1.2s" },
  { x: "20px", dy: "22px", size: "17px", flap: "0.19s", flutter: "0.75s" },
].map((bat) => vars(bat));

const Bat = <template>
  <span class="nbd-bat__flutter">
    <svg class="nbd-bat__body" viewBox="0 0 100 50">
      {{#each POSES as |pose|}}
        <g class="nbd-bat__wings --{{get pose 0}}">
          <path d={{get pose 1}} />
          <path d={{get pose 1}} transform="matrix(-1 0 0 1 100 0)" />
        </g>
      {{/each}}
      <path d={{BODY}} />
      {{#if @eyes}}
        <g class="nbd-bat__eyes">
          <circle cx="48" cy="19" r="1.4" />
          <circle cx="52" cy="19" r="1.4" />
        </g>
      {{/if}}
    </svg>
  </span>
</template>;

const FlyingBats = <template>
  <div class="spooky-atmosphere__bats">
    {{#each SOLO_BATS as |bat|}}
      <span class="nbd-bat --{{bat.depth}}" style={{bat.style}}>
        <Bat @eyes={{bat.eyes}} />
      </span>
    {{/each}}

    <span class="nbd-bat nbd-bat--colony" style={{COLONY}}>
      {{#each COLONY_BATS as |style|}}
        <span class="nbd-bat__member --mid" style={{style}}>
          <Bat />
        </span>
      {{/each}}
    </span>
  </div>
</template>;

export default FlyingBats;
