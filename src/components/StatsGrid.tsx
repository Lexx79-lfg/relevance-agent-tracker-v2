import { CalendarDays, Coins, Flame } from "lucide-react";

type StatsGridProps = {
  tokens: number;
  streak: number;
  today: string;
};

export function StatsGrid({ tokens, streak, today }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border shadow-sm rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
        <div className="p-6 pt-0 flex items-center gap-4 p-6">
          <div className="rounded-2xl bg-amber-400/20 p-3 shadow-[0_0_24px_rgba(251,191,36,0.22)]">
            <Coins className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <div className="text-sm text-slate-200">Total Tokens</div>
            <div className="text-3xl font-bold">{tokens}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
        <div className="p-6 pt-0 flex items-center gap-4 p-6">
          <div className="rounded-2xl bg-orange-400/20 p-3 shadow-[0_0_24px_rgba(251,146,60,0.22)]">
            <Flame className="h-6 w-6 text-orange-300" />
          </div>
          <div>
            <div className="text-sm text-slate-200">Current Streak</div>
            <div className="text-3xl font-bold">{streak}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
        <div className="p-6 pt-0 flex items-center gap-4 p-6">
          <div className="rounded-2xl bg-sky-400/20 p-3 shadow-[0_0_24px_rgba(56,189,248,0.22)]">
            <CalendarDays className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <div className="text-sm text-slate-200">Today</div>
            <div className="text-lg font-semibold">{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
