import { motion } from "framer-motion";
import { TrackerState } from "../lib/tracker";

type RecentLogsProps = {
  notes: TrackerState["notes"];
};

export function RecentLogs({ notes }: RecentLogsProps) {
  return (
    <div className="rounded-xl border shadow-sm rounded-3xl border-slate-500/70 bg-slate-800/85 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight text-xl">Recent Logs</h3>
      </div>
      <div className="p-6 pt-0 space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-600 p-4 text-sm text-slate-200">
            No logs yet. Complete a mission, add a note, and earn your first token.
          </div>
        ) : (
          notes.map((note, index) => (
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
      </div>
    </div>
  );
}
