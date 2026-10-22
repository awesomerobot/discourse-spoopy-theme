import { apiInitializer } from "discourse/lib/api";
import SpookyAtmosphere from "../components/spooky-atmosphere";
import WillOWisp from "../components/will-o-wisp";
import { CHAT_SOUNDS } from "../lib/chat-sounds";
import crumble from "../lib/crumbling-composer";
import installFlashlight from "../lib/flashlight";

const SETTING_CLASSES = {
  spooky_fonts: "nbd-spooky-fonts",
  serif_text: "nbd-serif-text",
  pumpkin_likes: "nbd-pumpkin-likes",
  header_branches: "nbd-header-branches",
  gravestone_composer: "nbd-gravestone-composer",
  candle_timeline: "nbd-candle-timeline",
  skull_spinner: "nbd-skull-spinner",
};

export default apiInitializer((api) => {
  const classes = Object.entries(SETTING_CLASSES)
    .filter(([setting]) => settings[setting])
    .map(([, className]) => className);
  document.documentElement.classList.add(
    "nightmare-before-discourse",
    ...classes
  );

  if (settings.pumpkin_likes) {
    api.replaceIcon("d-liked", "nbd-pumpkin");
    api.replaceIcon("d-unliked", "nbd-pumpkin-outline");
  }

  api.renderInOutlet("after-main-outlet", SpookyAtmosphere);

  if (settings.will_o_wisp) {
    api.renderInOutlet("header-contents__before", WillOWisp);
  }

  if (settings.flashlight_pointer) {
    installFlashlight();
  }

  if (settings.crumbling_composer) {
    api.onAppEvent("composer:opened", () => {
      const composer = document.getElementById("reply-control");
      if (composer) {
        crumble(composer);
      }
    });
  }

  // only present when chat is installed
  if (settings.chat_sounds && api.registerChatSound) {
    Object.entries(CHAT_SOUNDS).forEach(([name, sound]) =>
      api.registerChatSound(name, {
        ...sound,
        label: themePrefix(`chat_sounds.${name}`),
      })
    );

    if (settings.default_chat_sound !== "none") {
      api.setDefaultChatSound?.(settings.default_chat_sound);
    }
  }
});
