// Spooky chat notification sounds, synthesized with Web Audio so the theme
// ships no audio files. Each sound receives the shared audio context and the
// time it should start at.

const SILENT = 0.0001;

// pipe ranks from a sub-octave up, weighted like pulled drawbars
const ORGAN_RANKS = [
  [0.5, 0.5],
  [1, 1],
  [2, 0.45],
  [3, 0.25],
  [4, 0.15],
];
const ORGAN_ATTACK = 0.06;
const ORGAN_RELEASE = 0.12;

// a fading repeat of the signal, like a voice in a stone chapel
function echoTail(ctx, source, { delay = 0.14, feedback = 0.35 } = {}) {
  const echo = ctx.createDelay();
  const repeat = ctx.createGain();

  echo.delayTime.value = delay;
  repeat.gain.value = feedback;

  source.connect(echo).connect(repeat).connect(echo);
  repeat.connect(ctx.destination);
}

// fading noise as an impulse response washes the sound around a large stone
// room; the returned node is the dry input
function chapel(ctx, { seconds = 2.5, wet = 0.6 } = {}) {
  const input = ctx.createGain();
  const room = ctx.createConvolver();
  const level = ctx.createGain();
  const length = Math.ceil(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const samples = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
  }

  room.buffer = impulse;
  level.gain.value = wet;

  input.connect(ctx.destination);
  input.connect(room).connect(level).connect(ctx.destination);

  return input;
}

// pipes sound at a steady level while held instead of decaying like a
// struck note
function organNote(ctx, output, frequency, start, duration, gain = 0.03) {
  const end = start + duration;
  const envelope = ctx.createGain();
  const darken = ctx.createBiquadFilter();
  const tremulant = ctx.createOscillator();
  const tremulantDepth = ctx.createGain();

  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + ORGAN_ATTACK);
  envelope.gain.setValueAtTime(gain, end - ORGAN_RELEASE);
  envelope.gain.linearRampToValueAtTime(0, end);

  tremulant.frequency.value = 5.5;
  tremulantDepth.gain.value = gain * 0.15;
  tremulant.connect(tremulantDepth).connect(envelope.gain);
  tremulant.start(start);
  tremulant.stop(end);

  darken.type = "lowpass";
  darken.frequency.value = 2200;

  envelope.connect(darken).connect(output);

  ORGAN_RANKS.forEach(([ratio, weight]) => {
    const pipe = ctx.createOscillator();
    const level = ctx.createGain();

    pipe.frequency.value = frequency * ratio;
    level.gain.value = weight;
    pipe.connect(level).connect(envelope);
    pipe.start(start);
    pipe.stop(end);
  });
}

// vocal-tract resonances: "oo" is a small, rounded mouth, "oh" a wider one
const OO = [320, 800];
const OH = [480, 880];

function noise(ctx, start, duration) {
  const buffer = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * duration),
    ctx.sampleRate
  );
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.start(start);
  return source;
}

// mostly breath shaped by two vowel formants over a soft hum: one long
// "Ooooh" that swells in, opens slowly toward "oh", and sags as it fades
function ghostMoan(ctx, start, { pitch, fall, duration, gain = 0.27 }) {
  const end = start + duration;
  const voice = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const vibratoDepth = ctx.createGain();
  const mouth = ctx.createGain();
  const envelope = ctx.createGain();
  const air = ctx.createGain();
  const hum = ctx.createGain();

  voice.type = "triangle";
  voice.frequency.setValueAtTime(pitch, start);
  voice.frequency.setValueAtTime(pitch, start + duration * 0.6);
  voice.frequency.exponentialRampToValueAtTime(fall, end);

  vibrato.frequency.value = 3.5;
  vibratoDepth.gain.value = pitch * 0.04;
  vibrato.connect(vibratoDepth).connect(voice.frequency);

  const formants = [OO, OH].map(() => ctx.createBiquadFilter());
  formants.forEach((formant, index) => {
    formant.type = "bandpass";
    formant.Q.value = 7;
    formant.frequency.setValueAtTime(OO[index], start);
    mouth.connect(formant).connect(envelope);
  });

  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + duration * 0.35);
  envelope.gain.setValueAtTime(gain, start + duration * 0.7);
  envelope.gain.linearRampToValueAtTime(0, end);

  formants.forEach((formant, index) => {
    formant.frequency.linearRampToValueAtTime(
      OH[index],
      start + duration * 0.5
    );
    formant.frequency.linearRampToValueAtTime(OO[index], end);
  });

  air.gain.value = 0.6;
  hum.gain.value = 0.15;
  voice.connect(mouth);
  voice.connect(hum).connect(envelope);
  noise(ctx, start, duration).connect(air).connect(mouth);

  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 1100;
  envelope.connect(soften).connect(ctx.destination);
  echoTail(ctx, soften, { delay: 0.18, feedback: 0.3 });

  [voice, vibrato].forEach((oscillator) => {
    oscillator.start(start);
    oscillator.stop(end);
  });
}

// a struck bar rings at its fundamental and an out-of-tune overtone, which
// is what makes a woodblock or xylophone knock sound hollow
const BONE_MODES = [
  [1, 1],
  [2.76, 0.35],
];
const BONE_STRIKE = 0.008;
// the narrow resonances pass little of the short strike, so it hits hard
const BONE_GAIN = 13;

function bone(ctx, frequency, start, gain = BONE_GAIN) {
  const strike = ctx.createGain();

  strike.gain.setValueAtTime(gain, start);
  strike.gain.exponentialRampToValueAtTime(SILENT, start + BONE_STRIKE);
  noise(ctx, start, BONE_STRIKE).connect(strike);

  BONE_MODES.forEach(([ratio, weight]) => {
    const resonance = ctx.createBiquadFilter();
    const level = ctx.createGain();

    resonance.type = "bandpass";
    resonance.frequency.value = frequency * ratio;
    resonance.Q.value = 40;
    level.gain.value = weight;

    strike.connect(resonance).connect(level).connect(ctx.destination);
  });
}

// a softer knock right after each hit, as loose bones clatter together
function rattle(ctx, frequency, start) {
  bone(ctx, frequency, start);
  bone(ctx, frequency * 1.06, start + 0.025, BONE_GAIN * 0.4);
}

export const CHAT_SOUNDS = {
  nbd_haunted_organ: {
    incoming(ctx, now) {
      const room = chapel(ctx);
      organNote(ctx, room, 440, now, 0.2);
      organNote(ctx, room, 392, now + 0.16, 0.16);
      organNote(ctx, room, 440, now + 0.3, 0.7);
    },

    mention(ctx, now) {
      const room = chapel(ctx);
      [440, 392, 349.23, 329.63, 293.66, 277.18].forEach((note, index) =>
        organNote(ctx, room, note, now + index * 0.1, 0.18)
      );
      [146.83, 220, 293.66, 349.23].forEach((note) =>
        organNote(ctx, room, note, now + 0.62, 1.1, 0.022)
      );
    },
  },

  nbd_moaning_ghost: {
    incoming(ctx, now) {
      ghostMoan(ctx, now, { pitch: 120, fall: 95, duration: 1.1 });
    },

    mention(ctx, now) {
      ghostMoan(ctx, now, { pitch: 130, fall: 85, duration: 1.7 });
    },
  },

  nbd_rattling_bones: {
    incoming(ctx, now) {
      rattle(ctx, 392, now);
      rattle(ctx, 466.16, now + 0.1);
      rattle(ctx, 554.37, now + 0.2);
    },

    mention(ctx, now) {
      [392, 466.16, 554.37, 659.25, 783.99, 659.25, 783.99].forEach(
        (note, index) => rattle(ctx, note, now + index * 0.08)
      );
    },
  },
};
