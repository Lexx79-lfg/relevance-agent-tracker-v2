import { useRef } from "react";

type RewardSoundVolumes = {
  regular: number;
  milestone: number;
};

type RewardSoundType = "token" | "milestone";

type GeneratedToneStep = {
  kind: "tone";
  oscillatorType: OscillatorType;
  frequency: number;
  start: number;
  duration: number;
  gain: number;
  endFrequency?: number;
};

type GeneratedNoiseStep = {
  kind: "noise";
  start: number;
  duration: number;
  gain: number;
};

type AudioFileStep = {
  kind: "audio-file";
  src: string;
  start: number;
  duration?: number;
  playbackRate?: number;
  volume?: number;
};

type RewardStep = GeneratedToneStep | GeneratedNoiseStep | AudioFileStep;

type GeneratedRewardClip = {
  mode: "generated";
  duration: number;
  masterGain: number;
  steps: RewardStep[];
};

type AudioFileRewardClip = {
  mode: "audio-file";
  duration: number;
  masterGain: number;
  steps: AudioFileStep[];
  fallback?: GeneratedRewardClip;
};

type RewardClip = GeneratedRewardClip | AudioFileRewardClip;

export type RewardProfile = {
  token: RewardClip;
  milestone: RewardClip;
};

export type RewardProfileName = keyof typeof REWARD_PROFILES;

const defaultTokenGeneratedClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 0.3,
  masterGain: 0.32,
  steps: [
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 660,
      endFrequency: 560,
      start: 0,
      duration: 0.08,
      gain: 0.08,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 880,
      endFrequency: 740,
      start: 0.035,
      duration: 0.14,
      gain: 0.035,
    },
  ],
};

const defaultMilestoneGeneratedClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 1.9,
  masterGain: 0.62,
  steps: [
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 240,
      endFrequency: 180,
      start: 0,
      duration: 0.16,
      gain: 0.11,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 320,
      endFrequency: 260,
      start: 0.02,
      duration: 0.18,
      gain: 0.065,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 523.25,
      start: 0.3,
      duration: 0.34,
      gain: 0.055,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 659.25,
      start: 0.36,
      duration: 0.4,
      gain: 0.05,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 783.99,
      start: 0.42,
      duration: 0.46,
      gain: 0.045,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 587.33,
      endFrequency: 880,
      start: 0.54,
      duration: 0.48,
      gain: 0.04,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 392,
      endFrequency: 523.25,
      start: 1.0,
      duration: 0.7,
      gain: 0.05,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 783.99,
      endFrequency: 987.77,
      start: 1.08,
      duration: 0.54,
      gain: 0.026,
    },
  ],
};

const defaultTokenClip: AudioFileRewardClip = {
  mode: "audio-file",
  duration: 0.35,
  masterGain: 1,
  steps: [{ kind: "audio-file", src: "/sounds/token.mp3", start: 0 }],
  fallback: defaultTokenGeneratedClip,
};

const defaultMilestoneClip: AudioFileRewardClip = {
  mode: "audio-file",
  duration: 2,
  masterGain: 1,
  steps: [{ kind: "audio-file", src: "/sounds/milestone.mp3", start: 0 }],
  fallback: defaultMilestoneGeneratedClip,
};

const calmTokenClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 0.36,
  masterGain: 0.28,
  steps: [
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 560,
      endFrequency: 500,
      start: 0,
      duration: 0.09,
      gain: 0.08,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 820,
      endFrequency: 700,
      start: 0.03,
      duration: 0.16,
      gain: 0.045,
    },
  ],
};

const calmMilestoneClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 2.2,
  masterGain: 0.55,
  steps: [
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 210,
      endFrequency: 170,
      start: 0,
      duration: 0.16,
      gain: 0.1,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 620,
      start: 0.3,
      duration: 0.4,
      gain: 0.06,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 820,
      start: 0.37,
      duration: 0.44,
      gain: 0.05,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 420,
      endFrequency: 620,
      start: 1.02,
      duration: 0.82,
      gain: 0.06,
    },
  ],
};

const hypeTokenClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 0.38,
  masterGain: 0.42,
  steps: [
    { kind: "noise", start: 0, duration: 0.02, gain: 0.04 },
    {
      kind: "tone",
      oscillatorType: "square",
      frequency: 760,
      endFrequency: 640,
      start: 0,
      duration: 0.06,
      gain: 0.13,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 1280,
      endFrequency: 980,
      start: 0.025,
      duration: 0.14,
      gain: 0.07,
    },
  ],
};

const hypeMilestoneClip: GeneratedRewardClip = {
  mode: "generated",
  duration: 2.25,
  masterGain: 0.8,
  steps: [
    { kind: "noise", start: 0, duration: 0.035, gain: 0.14 },
    {
      kind: "tone",
      oscillatorType: "square",
      frequency: 150,
      endFrequency: 95,
      start: 0,
      duration: 0.14,
      gain: 0.2,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 240,
      endFrequency: 170,
      start: 0.02,
      duration: 0.19,
      gain: 0.14,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 820,
      start: 0.28,
      duration: 0.36,
      gain: 0.1,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 1100,
      start: 0.34,
      duration: 0.4,
      gain: 0.085,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 1480,
      start: 0.4,
      duration: 0.42,
      gain: 0.07,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 720,
      endFrequency: 1440,
      start: 0.38,
      duration: 0.58,
      gain: 0.08,
    },
    {
      kind: "tone",
      oscillatorType: "triangle",
      frequency: 460,
      endFrequency: 820,
      start: 1.0,
      duration: 0.84,
      gain: 0.095,
    },
    {
      kind: "tone",
      oscillatorType: "sine",
      frequency: 960,
      endFrequency: 1220,
      start: 1.14,
      duration: 0.72,
      gain: 0.055,
    },
  ],
};

export const REWARD_PROFILES = {
  default: {
    token: defaultTokenClip,
    milestone: defaultMilestoneClip,
  },
  calm: {
    token: calmTokenClip,
    milestone: calmMilestoneClip,
  },
  hype: {
    token: hypeTokenClip,
    milestone: hypeMilestoneClip,
  },
} satisfies Record<string, RewardProfile>;

export function useRewardSound(enabled: boolean, volumes: RewardSoundVolumes, profile: RewardProfile) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeMasterRef = useRef<GainNode | null>(null);
  const activeUntilRef = useRef(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    return audioCtxRef.current;
  };

  const clampVolume = (value: number) => Math.min(1, Math.max(0, value / 100));

  const stopActiveSound = (ctx: AudioContext) => {
    const master = activeMasterRef.current;
    if (!master) {
      activeUntilRef.current = 0;
      return;
    }

    const now = ctx.currentTime;
    const currentValue = Math.max(master.gain.value, 0.0001);

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(currentValue, now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    activeMasterRef.current = null;
    activeUntilRef.current = 0;
  };

  const stopActiveAudio = () => {
    const audio = activeAudioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    activeAudioRef.current = null;
  };

  const tone = (
    ctx: AudioContext,
    destination: AudioNode,
    opts: {
      type: OscillatorType;
      frequency: number;
      start: number;
      duration: number;
      gain: number;
      endFrequency?: number;
    }
  ) => {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = opts.type;
    oscillator.frequency.setValueAtTime(opts.frequency, now + opts.start);

    if (opts.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(opts.endFrequency, now + opts.start + opts.duration);
    }

    gainNode.gain.setValueAtTime(0.0001, now + opts.start);
    gainNode.gain.exponentialRampToValueAtTime(opts.gain, now + opts.start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + opts.start + opts.duration);

    oscillator.connect(gainNode);
    gainNode.connect(destination);
    oscillator.start(now + opts.start);
    oscillator.stop(now + opts.start + opts.duration + 0.03);
  };

  const noiseBurst = (ctx: AudioContext, destination: AudioNode, start: number, duration: number, gain: number) => {
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < sampleCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * 0.8;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime + start);
    source.buffer = buffer;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gainNode.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

    source.start(ctx.currentTime + start);
    source.stop(ctx.currentTime + start + duration + 0.02);
  };

  const createMaster = (ctx: AudioContext, duration: number, volume: number) => {
    const now = ctx.currentTime;

    if (now < activeUntilRef.current) {
      stopActiveSound(ctx);
    }

    stopActiveAudio();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.connect(ctx.destination);

    activeMasterRef.current = master;
    activeUntilRef.current = now + duration;

    const releaseAt = now + Math.max(0.04, duration - 0.08);
    master.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), now + 0.012);
    master.gain.setValueAtTime(Math.max(volume, 0.0001), releaseAt);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    return master;
  };

  const playGeneratedClip = (ctx: AudioContext, clip: GeneratedRewardClip, volume: number) => {
    const master = createMaster(ctx, clip.duration, volume * clip.masterGain);

    clip.steps.forEach((step) => {
      if (step.kind === "noise") {
        noiseBurst(ctx, master, step.start, step.duration, step.gain);
        return;
      }

      if (step.kind === "tone") {
        tone(ctx, master, {
          type: step.oscillatorType,
          frequency: step.frequency,
          endFrequency: step.endFrequency,
          start: step.start,
          duration: step.duration,
          gain: step.gain,
        });
      }
    });
  };

  const playAudioFileClip = (clip: AudioFileRewardClip, volume: number) => {
    stopActiveAudio();
    activeUntilRef.current = 0;
    activeMasterRef.current = null;

    const primaryStep = clip.steps[0];
    if (!primaryStep) {
      return;
    }

    const audio = new Audio(primaryStep.src);
    audio.preload = "auto";
    audio.volume = Math.min(1, Math.max(0, volume * clip.masterGain * (primaryStep.volume ?? 1)));
    audio.playbackRate = primaryStep.playbackRate ?? 1;

    activeAudioRef.current = audio;

    const fallbackToGenerated = () => {
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
      }

      if (!clip.fallback) {
        return;
      }

      const ctx = ensureCtx();
      if (!ctx) {
        return;
      }

      const playFallback = () => {
        playGeneratedClip(ctx, clip.fallback as GeneratedRewardClip, volume);
      };

      if (ctx.state === "suspended") {
        void ctx.resume().then(playFallback).catch(() => {});
        return;
      }

      playFallback();
    };

    audio.addEventListener("error", fallbackToGenerated, { once: true });

    window.setTimeout(() => {
      if (activeAudioRef.current === audio) {
        audio.pause();
        audio.currentTime = 0;
        activeAudioRef.current = null;
      }
    }, clip.duration * 1000);

    void audio.play().catch(() => {
      fallbackToGenerated();
    });
  };

  return (type: RewardSoundType = "token") => {
    if (!enabled) {
      return;
    }

    const clip = profile[type];
    const volume = clampVolume(type === "token" ? volumes.regular : volumes.milestone);

    if (clip.mode === "audio-file") {
      playAudioFileClip(clip, volume);
      return;
    }

    const ctx = ensureCtx();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    playGeneratedClip(ctx, clip, volume);
  };
}
