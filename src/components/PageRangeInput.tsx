"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validatePageRange } from "@/lib/pageRangeParser";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface PageRangeInputProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  totalPages: number;
  id: string;
  placeholder?: string;
}

export function PageRangeInput({
  label,
  hint,
  value,
  onChange,
  totalPages,
  id,
  placeholder = "e.g. 3, 7-9, 15",
}: PageRangeInputProps) {
  const [touched, setTouched] = useState(false);
  const error = touched ? validatePageRange(value, totalPages) : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
        {hint && (
          <span className="text-xs text-[var(--muted)]">{hint}</span>
        )}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border transition-all duration-200 outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]/50",
          error
            ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
            : "border-[var(--surface-border)] focus:border-[var(--brand)] focus:shadow-[0_0_0_2px_var(--brand-dim)]"
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.div
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-[var(--destructive)]"
            role="alert"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id: string;
  hint?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max,
  id,
  hint,
}: NumberInputProps) {
  const [raw, setRaw] = useState(String(value));
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) onChange(n);
  };

  const handleBlur = () => {
    setTouched(true);
    const n = parseInt(raw, 10);
    if (isNaN(n) || (min !== undefined && n < min) || (max !== undefined && n > max)) {
      const clamped = isNaN(n) ? min : Math.max(min, Math.min(max ?? Infinity, n));
      setRaw(String(clamped));
      onChange(clamped);
    } else {
      setRaw(String(n));
    }
  };

  const error = touched
    ? isNaN(parseInt(raw, 10))
      ? "Must be a number"
      : max && parseInt(raw, 10) > max
      ? `Max is ${max}`
      : parseInt(raw, 10) < min
      ? `Min is ${min}`
      : null
    : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
        {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      </div>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!error}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border transition-all duration-200 outline-none text-[var(--foreground)]",
          error
            ? "border-[var(--destructive)]"
            : "border-[var(--surface-border)] focus:border-[var(--brand)] focus:shadow-[0_0_0_2px_var(--brand-dim)]"
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-[var(--destructive)] flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
