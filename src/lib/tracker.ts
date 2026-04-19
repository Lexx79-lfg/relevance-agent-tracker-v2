export const STORAGE_KEY = "relevance-agent-token-tracker-v3";
export const MILESTONE_EVERY = 5;

export type TrackerState = {
  tokens: number;
  streak: number;
  lastTokenDate: string | null;
  milestone: number;
  todayMission: string;
  notes: { date: string; text: string }[];
  soundOn: boolean;
  regularVolume: number;
  milestoneVolume: number;
};

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(dateA: string, dateB: string) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDefaultState(): TrackerState {
  return {
    tokens: 0,
    streak: 0,
    lastTokenDate: null,
    milestone: MILESTONE_EVERY,
    todayMission: "Operation Deploy App 🚀",
    notes: [],
    soundOn: true,
    regularVolume: 42,
    milestoneVolume: 78,
  };
}

export function safeLoad(): TrackerState {
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
      regularVolume:
        typeof parsed.regularVolume === "number"
          ? parsed.regularVolume
          : typeof (parsed as Partial<{ volume: number }>).volume === "number"
            ? (parsed as Partial<{ volume: number }>).volume ?? getDefaultState().regularVolume
            : getDefaultState().regularVolume,
      milestoneVolume:
        typeof parsed.milestoneVolume === "number"
          ? parsed.milestoneVolume
          : typeof (parsed as Partial<{ volume: number }>).volume === "number"
            ? Math.max((parsed as Partial<{ volume: number }>).volume ?? getDefaultState().milestoneVolume, 60)
            : getDefaultState().milestoneVolume,
    };
  } catch {
    return getDefaultState();
  }
}

export function save(data: TrackerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
