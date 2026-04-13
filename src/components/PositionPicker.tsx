"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/presets";

const POSITIONS: Position[] = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const LABEL_MAP: Record<Position, string> = {
  "top-left": "↖",
  "top-center": "↑",
  "top-right": "↗",
  "middle-left": "←",
  "middle-center": "•",
  "middle-right": "→",
  "bottom-left": "↙",
  "bottom-center": "↓",
  "bottom-right": "↘",
};

interface PositionPickerProps {
  value: Position;
  onChange: (position: Position) => void;
}

export function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Position</p>
      <div
        className="grid grid-cols-3 gap-1.5 w-fit"
        role="radiogroup"
        aria-label="Page number position"
      >
        {POSITIONS.map((pos) => (
          <motion.button
            key={pos}
            id={`pos-${pos}`}
            role="radio"
            aria-checked={value === pos}
            aria-label={pos.replace("-", " ")}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(pos)}
            className={cn("pos-cell", value === pos && "active")}
            title={pos.replace(/-/g, " ")}
          >
            <span className="text-[var(--muted)] text-sm leading-none select-none">
              {LABEL_MAP[pos]}
            </span>
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)] capitalize">
        {value.replace(/-/g, " ")}
      </p>
    </div>
  );
}
