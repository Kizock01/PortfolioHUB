"use client";

let audioContext: AudioContext | null = null;

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }
  return audioContext;
}

async function playTone({
  frequency,
  duration,
  volume,
  type = "sine",
}: {
  frequency: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
}) {
  try {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  } catch {
    // Audio can be blocked by browser autoplay rules; gameplay must continue.
  }
}

export function preloadArenaSounds() {
  void getAudioContext();
}

export function playCountdownTick() {
  void playTone({ frequency: 520, duration: 0.12, volume: 0.045 });
}

export function playCountdownFinal() {
  void playTone({ frequency: 680, duration: 0.28, volume: 0.06, type: "triangle" });
}

export function playCorrectSound() {
  void playTone({ frequency: 760, duration: 0.12, volume: 0.045, type: "triangle" });
  window.setTimeout(() => {
    void playTone({ frequency: 980, duration: 0.16, volume: 0.04, type: "triangle" });
  }, 85);
}

export function playWrongSound() {
  void playTone({ frequency: 240, duration: 0.18, volume: 0.045, type: "sawtooth" });
}

export function playVictorySound() {
  void playTone({ frequency: 620, duration: 0.12, volume: 0.04, type: "triangle" });
  window.setTimeout(() => {
    void playTone({ frequency: 820, duration: 0.12, volume: 0.04, type: "triangle" });
  }, 95);
  window.setTimeout(() => {
    void playTone({ frequency: 1040, duration: 0.2, volume: 0.045, type: "triangle" });
  }, 190);
}
