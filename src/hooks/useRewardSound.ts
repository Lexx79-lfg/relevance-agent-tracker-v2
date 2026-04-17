import { useRef } from "react";

export function useRewardSound(enabled: boolean, volumePercent: number) {
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  return (type: "token" | "milestone" = "token") => {
    if (!enabled) {
      return;
    }

    const ctx = ensureCtx();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const volume = Math.min(1, Math.max(0, volumePercent / 100));
    const now = ctx.currentTime;
    const master = ctx.createGain();

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime((type === "milestone" ? 0.75 : 0.5) * volume, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (type === "milestone" ? 1.6 : 0.55));
    master.connect(ctx.destination);

    noiseBurst(ctx, master, 0, 0.035, type === "milestone" ? 0.55 : 0.35);
    tone(ctx, master, {
      type: "square",
      frequency: type === "milestone" ? 420 : 300,
      endFrequency: type === "milestone" ? 100 : 130,
      start: 0,
      duration: type === "milestone" ? 0.07 : 0.045,
      gain: type === "milestone" ? 0.22 : 0.15,
    });

    const baseFrequencies = type === "milestone" ? [900, 1320, 1760] : [720, 1080, 1440];

    baseFrequencies.forEach((frequency, index) => {
      tone(ctx, master, {
        type: index === 0 ? "triangle" : "sine",
        frequency,
        start: 0.045 + index * 0.028,
        duration: type === "milestone" ? 0.5 : 0.25,
        gain: (type === "milestone" ? 0.14 : 0.1) / (index + 1),
      });
    });

    if (type === "milestone") {
      tone(ctx, master, {
        type: "triangle",
        frequency: 740,
        endFrequency: 1020,
        start: 0.22,
        duration: 0.52,
        gain: 0.12,
      });

      tone(ctx, master, {
        type: "sine",
        frequency: 1020,
        endFrequency: 1580,
        start: 0.38,
        duration: 0.8,
        gain: 0.1,
      });

      [0.62, 0.82, 1.02].forEach((start, index) => {
        tone(ctx, master, {
          type: "triangle",
          frequency: 2000 + index * 220,
          start,
          duration: 0.15,
          gain: 0.045,
        });
      });
    }
  };
}
