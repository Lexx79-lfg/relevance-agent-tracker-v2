import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Volume2,
} from "lucide-react";
import { HeaderHero } from "./components/HeaderHero";
import { RecentLogs } from "./components/RecentLogs";
import { StatsGrid } from "./components/StatsGrid";
import { CelebrationBurst } from "./components/CelebrationBurst";
import { REWARD_PROFILES, RewardProfileName, useRewardSound } from "./hooks/useRewardSound";
import { TrackerState, daysBetween, getDefaultState, safeLoad, save, todayKey } from "./lib/tracker";

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

const REWARD_PROFILE_NAME: RewardProfileName = "default";

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

export default function App() {
  const [state, setState] = useState<TrackerState>(() => safeLoad());
  const [burstKey, setBurstKey] = useState(0);
  const [message, setMessage] = useState("Welcome, Relevance Agent.");
  const [logText, setLogText] = useState("");
  const [lastBurstWasMilestone, setLastBurstWasMilestone] = useState(false);

  useEffect(() => {
    save(state);
  }, [state]);

  const playSound = useRewardSound(state.soundOn, {
    regular: state.regularVolume,
    milestone: state.milestoneVolume,
  }, REWARD_PROFILES[REWARD_PROFILE_NAME]);
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
      regularVolume: state.regularVolume,
      milestoneVolume: state.milestoneVolume,
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
              <HeaderHero
                todayMission={state.todayMission}
                headline={headline}
                quote={quote}
                soundOn={state.soundOn}
                onToggleSound={() => setState((previous) => ({ ...previous, soundOn: !previous.soundOn }))}
                onReset={resetAll}
              />
            </CardHeader>

            <CardContent className="space-y-6">
              <StatsGrid tokens={state.tokens} streak={state.streak} today={todayKey()} />

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
                        <Volume2 className="h-4 w-4" /> Regular token volume
                      </div>
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                        <Slider
                          value={[state.regularVolume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) =>
                            setState((previous) => ({ ...previous, regularVolume: value[0] ?? previous.regularVolume }))
                          }
                        />
                        <div className="mt-2 text-sm text-slate-200">{state.regularVolume}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Volume2 className="h-4 w-4" /> Milestone volume
                      </div>
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                        <Slider
                          value={[state.milestoneVolume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) =>
                            setState((previous) => ({
                              ...previous,
                              milestoneVolume: value[0] ?? previous.milestoneVolume,
                            }))
                          }
                        />
                        <div className="mt-2 text-sm text-slate-200">{state.milestoneVolume}%</div>
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
                  <RecentLogs notes={state.notes} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
