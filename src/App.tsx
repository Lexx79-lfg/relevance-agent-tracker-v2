import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  CalendarDays,
  Coins,
  Flame,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const STORAGE_KEY = "relevance-agent-token-tracker-v3";
const MILESTONE_EVERY = 4;

const QUOTES = [
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "The best way to predict the future is to create it. — Peter Drucker",
  "Action is the foundational key to all success. — Pablo Picasso",
  "I didn't need a better answer to 'If.' I needed a way to move forward.",
  "A mission completed is stronger than a perfect plan delayed.",
];

const HEADLINES = [
  "You are not behind. You are building.",
  "One mission. One token. One step forward.",
  "Action beats doubt.",
  "Small wins change lives.",
  "Complete the mission. Claim the reward.",
];

type TrackerState = {
  tokens: number;
  streak: number;
  lastTokenDate: string | null;
  milestone: number;
  todayMission: string;
  notes: { date: string; text: string }[];
  soundOn: boolean;
  volume: number;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border shadow-sm", className)} {...props} />;
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "outline"
          ? "border border-slate-600 bg-transparent text-slate-100"
          : "bg-slate-100 text-slate-950",
        className
      )}
      {...props}
    />
  );
}

function Input({ className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-600 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-slate-700/70", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300 transition-[width] duration-300"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors",
        className
      )}
      {...props}
    />
  );
}

function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
}: {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? min}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      className="slider h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
    />
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateA: string, dateB: string) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function getDefaultState(): TrackerState {
  return {
    tokens: 0,
    streak: 0,
    lastTokenDate: null,
    milestone: MILESTONE_EVERY,
    todayMission: "Operation Deploy App 🚀",
    notes: [],
    soundOn: true,
    volume: 82,
  };
}

function safeLoad(): TrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    return {
      ...getDefaultState(),
      ...parsed,
      milestone: MILESTONE_EVERY,
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return getDefaultState();
  }
}

function save(data: TrackerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function useRewardSound(enabled: boolean, volumePercent: number) {
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

function CelebrationBurst({ burstKey, isMilestone }: { burstKey: number; isMilestone: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: isMilestone ? 64 : 20 }, (_, index) => ({
        id: `${burstKey}-${index}`,
        left: 4 + Math.random() * 92,
        delay: Math.random() * (isMilestone ? 0.25 : 0.1),
        duration: (isMilestone ? 2.4 : 1.1) + Math.random() * (isMilestone ? 0.9 : 0.45),
        rotate: -240 + Math.random() * 480,
        x: -180 + Math.random() * 360,
        size: isMilestone ? 6 + Math.random() * 8 : 4 + Math.random() * 4,
        shape: Math.random() > 0.7 ? "circle" : Math.random() > 0.45 ? "diamond" : "rect",
        color: ["bg-amber-300", "bg-yellow-200", "bg-sky-300", "bg-emerald-300", "bg-fuchsia-300", "bg-rose-300"][
          Math.floor(Math.random() * 6)
        ],
      })),
    [burstKey, isMilestone]
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: isMilestone ? 28 : 8 }, (_, index) => ({
        id: `spark-${burstKey}-${index}`,
        left: 6 + Math.random() * 88,
        delay: Math.random() * (isMilestone ? 0.5 : 0.12),
        duration: (isMilestone ? 1.9 : 0.7) + Math.random() * (isMilestone ? 0.6 : 0.25),
        x: -120 + Math.random() * 240,
        size: isMilestone ? 4 + Math.random() * 5 : 2 + Math.random() * 2,
      })),
    [burstKey, isMilestone]
  );

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ opacity: 0, y: -20, x: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: 900, x: piece.x, rotate: piece.rotate }}
          exit={{ opacity: 0 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
          className={cn("pointer-events-none absolute top-0", piece.color)}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "diamond" ? "2px" : "1px",
            transform: piece.shape === "diamond" ? "rotate(45deg)" : undefined,
          }}
        />
      ))}

      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, y: -10, x: 0 }}
          animate={{ opacity: [0, 1, 0], y: 820, x: sparkle.x }}
          exit={{ opacity: 0 }}
          transition={{ duration: sparkle.duration, delay: sparkle.delay, ease: "easeOut" }}
          className="pointer-events-none absolute top-0 rounded-full bg-white/80"
          style={{
            left: `${sparkle.left}%`,
            width: sparkle.size,
            height: sparkle.size,
            boxShadow: "0 0 14px rgba(255,255,255,0.9)",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export default function App() {
  const [state, setState] = useState<TrackerState>(() => safeLoad());
  const [burstKey, setBurstKey] = useState(0);
  const [message, setMessage] = useState("Welcome, Relevance Agent.");
  const [logText, setLogText] = useState("");
  const [lastBurstWasMilestone, setLastBurstWasMilestone] = useState(false);

  useEffect(() => {
    save(state);
  }, [state]);

  const playSound = useRewardSound(state.soundOn, state.volume);
  const milestoneMod = state.tokens % state.milestone;
  const toNextMilestone = state.milestone - (milestoneMod || state.milestone);
  const progressValue = (milestoneMod / state.milestone) * 100;
  const quote = QUOTES[state.tokens % QUOTES.length];
  const headline = HEADLINES[state.tokens % HEADLINES.length];

  const addToken = () => {
    const today = todayKey();
    let newStreak = 1;

    if (state.lastTokenDate) {
      const gap = daysBetween(state.lastTokenDate, today);
      if (gap === 0) {
        newStreak = state.streak;
      } else if (gap === 1) {
        newStreak = state.streak + 1;
      }
    }

    const newTokens = state.tokens + 1;
    const hitMilestone = newTokens % state.milestone === 0;

    setState((previous) => ({
      ...previous,
      tokens: newTokens,
      streak: newStreak,
      lastTokenDate: today,
      notes:
        logText.trim().length > 0
          ? [{ date: new Date().toLocaleString(), text: logText.trim() }, ...previous.notes].slice(0, 20)
          : previous.notes,
    }));

    setLogText("");
    setLastBurstWasMilestone(hitMilestone);
    setBurstKey((current) => current + 1);
    playSound(hitMilestone ? "milestone" : "token");
    setMessage(hitMilestone ? `Milestone reached: ${newTokens} tokens. Yaaaaay.` : "+1 token earned.");
  };

  const removeToken = () => {
    if (state.tokens <= 0) {
      return;
    }

    setState((previous) => ({ ...previous, tokens: previous.tokens - 1 }));
    setMessage("Removed 1 token.");
  };

  const resetAll = () => {
    setState({
      ...getDefaultState(),
      soundOn: state.soundOn,
      volume: state.volume,
      todayMission: state.todayMission || "Your Mission",
    });
    setLogText("");
    setMessage("Tracker reset.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden rounded-3xl border-slate-700 bg-slate-900/80 backdrop-blur">
            <div className="pointer-events-none fixed inset-0 z-50">
              <CelebrationBurst burstKey={burstKey} isMilestone={lastBurstWasMilestone} />
            </div>

            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-slate-300">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.25em] text-sky-200">The Relevance Agent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-amber-300" />
                    <ArrowDown className="h-6 w-6 text-sky-300" />
                    <CardTitle className="text-3xl text-slate-50 md:text-4xl">{state.todayMission || "Your Mission"}</CardTitle>
                  </div>
                  <p className="mt-2 max-w-2xl text-slate-300">
                    Complete one mission. Log it. Earn the token. Every 4th token gets the full celebration.
                  </p>
                  <p className="mt-4 text-2xl font-bold leading-9 text-white md:text-3xl">{headline}</p>
                  <p className="mt-2 max-w-3xl text-lg italic leading-8 text-slate-100">"{quote}"</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={() => setState((previous) => ({ ...previous, soundOn: !previous.soundOn }))}
                  >
                    {state.soundOn ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                    {state.soundOn ? "Sound On" : "Sound Off"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={resetAll}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-amber-400/20 p-3 shadow-[0_0_24px_rgba(251,191,36,0.22)]">
                      <Coins className="h-6 w-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">Total Tokens</div>
                      <div className="text-3xl font-bold">{state.tokens}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-orange-400/20 p-3 shadow-[0_0_24px_rgba(251,146,60,0.22)]">
                      <Flame className="h-6 w-6 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">Current Streak</div>
                      <div className="text-3xl font-bold">{state.streak}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-sky-400/20 p-3 shadow-[0_0_24px_rgba(56,189,248,0.22)]">
                      <CalendarDays className="h-6 w-6 text-sky-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">Today</div>
                      <div className="text-lg font-semibold">{todayKey()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <Card className="rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3 backdrop-blur">
                      <Button onClick={addToken} className="rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                        <Plus className="mr-2 h-4 w-4" /> Earn Token
                      </Button>
                      <Button
                        onClick={removeToken}
                        variant="outline"
                        className="rounded-2xl border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700"
                      >
                        <Minus className="mr-2 h-4 w-4" /> Remove Token
                      </Button>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Today's mission</label>
                      <Input
                        value={state.todayMission}
                        onChange={(event) => setState((previous) => ({ ...previous, todayMission: event.target.value }))}
                        placeholder="Name your mission (e.g., Operation Focus Mode 🚀)"
                        className="rounded-2xl border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Quick log entry</label>
                      <textarea
                        value={logText}
                        onChange={(event) => setLogText(event.target.value)}
                        placeholder={"Mission: ...\nWin: ...\nNext: ..."}
                        className="min-h-[180px] w-full rounded-2xl border border-slate-600 bg-slate-900 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Volume2 className="h-4 w-4" /> Reward volume
                      </div>
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                        <Slider
                          value={[state.volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => setState((previous) => ({ ...previous, volume: value[0] ?? 80 }))}
                        />
                        <div className="mt-2 text-sm text-slate-200">{state.volume}%</div>
                      </div>
                    </div>

                    <div className="mb-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                      "I complete my mission. I am a Relevance Agent."
                    </div>

                    <Card className="rounded-2xl border-slate-600/70 bg-slate-900/60 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Milestone Progress</div>
                            <div className="text-sm text-slate-300">
                              {toNextMilestone} token{toNextMilestone === 1 ? "" : "s"} until your next celebration.
                            </div>
                          </div>
                          <Badge className="rounded-xl bg-slate-700 text-slate-100 hover:bg-slate-700">Every {state.milestone}</Badge>
                        </div>
                        <Progress value={progressValue} className="h-3 rounded-full" />
                      </CardContent>
                    </Card>

                    <motion.div
                      key={message}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200"
                    >
                      {message}
                    </motion.div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {state.notes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-600 p-4 text-sm text-slate-200">
                          No logs yet. Complete a mission, add a note, and earn your first token.
                        </div>
                      ) : (
                        state.notes.map((note, index) => (
                          <motion.div
                            key={`${note.date}-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4"
                          >
                            <div className="mb-2 text-xs text-slate-200">{note.date}</div>
                            <div className="whitespace-pre-wrap text-sm text-slate-200">{note.text}</div>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
