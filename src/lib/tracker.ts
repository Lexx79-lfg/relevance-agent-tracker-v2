export const STORAGE_KEY = "relevance-agent-token-tracker-v3";
export const MILESTONE_EVERY = 4;

export type TrackerState = {
  tokens: number;
  streak: number;
  lastTokenDate: string | null;
  milestone: number;
  todayMission: string;
  notes: { date: string; text: string }[];
  soundOn: boolean;
  volume: number;
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
    volume: 82,
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
    };
  } catch {
    return getDefaultState();
  }
}

export function save(data: TrackerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
