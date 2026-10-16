import icon from "discourse/helpers/d-icon";
import FlyingBats from "./flying-bats";

const COBWEB =
  "M0 0L170 0M0 0L164 44M0 0L144 90M0 0L114 126M0 0L77 151M0 0L35 166M0 0L0 170M28 0Q24 3 27 7Q22 10 24 15Q18 15 19 21Q14 20 13 25Q8 23 6 27Q3 24 0 28M58 0Q49 7 56 15Q46 20 49 31Q38 32 39 43Q28 41 26 52Q17 47 12 57Q5 50 0 58M92 0Q78 10 89 24Q73 32 78 49Q61 51 62 68Q45 65 42 82Q26 75 19 90Q8 79 0 92M128 0Q109 14 124 33Q101 44 109 68Q84 71 86 95Q62 91 58 114Q37 104 27 125Q12 109 0 128M162 0Q138 18 156 42Q128 56 137 86Q107 90 108 120Q79 115 74 144Q47 131 34 158Q15 139 0 162";

const Cobweb = <template>
  <svg class="nbd-cobweb {{@class}}" viewBox="0 0 172 172">
    <path d={{COBWEB}} />
  </svg>
</template>;

export default <template>
  <div class="spooky-atmosphere" aria-hidden="true">
    {{#if settings.flying_critters}}
      <FlyingBats />

    {{/if}}

    {{#if settings.peeking_ghost}}
      <span class="nbd-peeking-ghost">{{icon "nbd-ghost"}}</span>
    {{/if}}

    {{#if settings.graveyard_fog}}
      <div class="spooky-atmosphere__fog">
        <div class="nbd-fog nbd-fog--back"></div>
        <div class="nbd-fog nbd-fog--front"></div>
      </div>
    {{/if}}

    {{#if settings.cobwebs}}
      <Cobweb @class="nbd-cobweb--top-right" />
      <Cobweb @class="nbd-cobweb--bottom-left" />
    {{/if}}

    {{#if settings.dangling_spider}}
      <span class="nbd-spider"></span>
    {{/if}}
  </div>
</template>
