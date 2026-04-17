import { ArrowDown, Package, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type HeaderHeroProps = {
  todayMission: string;
  headline: string;
  quote: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onReset: () => void;
};

function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
}) {
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

export function HeaderHero({
  todayMission,
  headline,
  quote,
  soundOn,
  onToggleSound,
  onReset,
}: HeaderHeroProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-slate-300">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm uppercase tracking-[0.25em] text-sky-200">The Relevance Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-amber-300" />
          <ArrowDown className="h-6 w-6 text-sky-300" />
          <h3 className="font-semibold leading-none tracking-tight text-3xl text-slate-50 md:text-4xl">
            {todayMission || "Your Mission"}
          </h3>
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
          onClick={onToggleSound}
        >
          {soundOn ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
          {soundOn ? "Sound On" : "Sound Off"}
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
