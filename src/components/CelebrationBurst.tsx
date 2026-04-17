import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type CelebrationBurstProps = {
  burstKey: number;
  isMilestone: boolean;
};

export function CelebrationBurst({ burstKey, isMilestone }: CelebrationBurstProps) {
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
