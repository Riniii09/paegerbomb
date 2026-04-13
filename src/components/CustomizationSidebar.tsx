"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { PositionPicker } from "./PositionPicker";
import { PageRangeInput, NumberInput } from "./PageRangeInput";
import { cn } from "@/lib/utils";
import { RotateCcw, Zap, ArrowLeft, X } from "lucide-react";
import { PRESETS } from "@/lib/presets";
import { toast } from "sonner";

import type { NumberStyle, PageNumberConfig } from "@/lib/presets";

const FONT_FAMILIES: { value: PageNumberConfig["fontFamily"]; label: string }[] = [
  { value: "Helvetica", label: "Helvetica (Sans)" },
  { value: "Times-Roman", label: "Times (Serif)" },
  { value: "Courier", label: "Courier (Mono)" },
];

const NUMBER_STYLES: { value: NumberStyle; label: string; example: string }[] = [
  { value: "arabic", label: "Numbers", example: "1, 2, 3…" },
  { value: "roman", label: "Roman (Upper)", example: "I, II, III…" },
  { value: "roman-lower", label: "Roman (Lower)", example: "i, ii, iii…" },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-[var(--surface-border)]" />
    </div>
  );
}

function SelectInput({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_2px_var(--brand-dim)] transition-all duration-200 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  id,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
        active
          ? "bg-[var(--brand-dim)] border-[var(--brand)] text-[var(--brand)]"
          : "bg-[var(--surface)] border-[var(--surface-border)] text-[var(--muted)] hover:border-[var(--brand)]/50 hover:text-[var(--foreground)]"
      )}
    >
      {children}
    </button>
  );
}

export function CustomizationSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { config, updateConfig, resetConfig, pdfState, applyPreset } = useApp();
  const totalPages = pdfState.totalPages || 9999;


  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-80 shrink-0 h-full overflow-y-auto bg-[var(--surface)] border-r border-[var(--surface-border)] flex flex-col z-50 transition-transform lg:relative lg:translate-x-0 lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--surface-border)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
          <div className="flex items-center gap-2">
            <button
               onClick={onClose}
               className="lg:hidden p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-semibold text-[var(--foreground)]">Customize</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="reset-config-btn"
              onClick={resetConfig}
              title="Reset to defaults"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
               onClick={onClose}
               className="lg:hidden p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 space-y-6">
          {/* Templates - Moved from header */}
          <section>
            <SectionHeader>Templates</SectionHeader>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  id={`sidebar-preset-${preset.id}`}
                  onClick={() => {
                    applyPreset(preset);
                    toast.success(`"${preset.name}" template applied!`);
                    if (window.innerWidth < 1024) onClose?.();
                  }}
                  className={cn(
                    "flex flex-col gap-1 px-4 py-3 rounded-xl border text-left transition-all duration-200",
                    config.id === preset.id // Note: context needs to store current preset ID if we want active state, but presets usually just apply a partial config
                      ? "border-[var(--brand)] bg-[var(--brand-dim)]"
                      : "border-[var(--surface-border)] bg-[var(--surface-raised)] hover:border-[var(--brand)]/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{preset.name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-tight">{preset.description}</p>
                </button>
              ))}
            </div>
          </section>
        {/* Page Range */}
        <section>
          <SectionHeader>Page Range</SectionHeader>
          <div className="space-y-4">
            <NumberInput
              id="start-page"
              label="Start From Page"
              value={config.startPage}
              onChange={(v) => updateConfig({ startPage: v })}
              min={1}
              max={totalPages}
              hint={`of ${totalPages}`}
            />
            <NumberInput
              id="end-page"
              label="End At Page"
              value={config.endPage ?? totalPages}
              onChange={(v) => updateConfig({ endPage: v })}
              min={config.startPage}
              max={totalPages}
              hint="inclusive"
            />
            <PageRangeInput
              id="skip-pages"
              label="Skip Pages"
              hint="optional"
              value={config.skipPages}
              onChange={(v) => updateConfig({ skipPages: v })}
              totalPages={totalPages}
              placeholder="e.g. 3, 7-9"
            />
          </div>
        </section>

        {/* Numbering */}
        <section>
          <SectionHeader>Numbering</SectionHeader>
          <div className="space-y-4">
            <NumberInput
              id="start-number"
              label="Start Count From"
              value={config.startNumber}
              onChange={(v) => updateConfig({ startNumber: v })}
              min={1}
            />

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[var(--foreground)]">Style</p>
              <div className="space-y-1.5">
                {NUMBER_STYLES.map((s) => (
                  <button
                    key={s.value}
                    id={`style-${s.value}`}
                    onClick={() => updateConfig({ numberStyle: s.value })}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-sm",
                      config.numberStyle === s.value
                        ? "border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--foreground)]"
                        : "border-[var(--surface-border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)]/40"
                    )}
                  >
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs opacity-70">{s.example}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="prefix-input" className="text-sm font-medium text-[var(--foreground)]">Prefix</label>
                <input
                  id="prefix-input"
                  value={config.prefix}
                  onChange={(e) => updateConfig({ prefix: e.target.value })}
                  placeholder="e.g. Page "
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_2px_var(--brand-dim)] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="suffix-input" className="text-sm font-medium text-[var(--foreground)]">Suffix</label>
                <input
                  id="suffix-input"
                  value={config.suffix}
                  onChange={(e) => updateConfig({ suffix: e.target.value })}
                  placeholder="e.g. /10"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_2px_var(--brand-dim)] transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionHeader>Typography</SectionHeader>
          <div className="space-y-4">
            <SelectInput
              id="font-family"
              label="Font"
              value={config.fontFamily}
              options={FONT_FAMILIES}
              onChange={(v) => updateConfig({ fontFamily: v as PageNumberConfig["fontFamily"] })}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-[var(--foreground)]">Font Size</label>
                <span className="text-sm text-[var(--brand)] font-medium">{config.fontSize}pt</span>
              </div>
              <input
                id="font-size-slider"
                type="range"
                min={6}
                max={24}
                step={1}
                value={config.fontSize}
                onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--brand)] bg-[var(--surface-border)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>6pt</span>
                <span>24pt</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[var(--foreground)]">Style</p>
              <div className="flex gap-2">
                <ToggleButton
                  id="toggle-bold"
                  active={config.bold}
                  onClick={() => updateConfig({ bold: !config.bold })}
                >
                  <span className="font-bold">B</span>
                </ToggleButton>
                <ToggleButton
                  id="toggle-italic"
                  active={config.italic}
                  onClick={() => updateConfig({ italic: !config.italic })}
                >
                  <span className="italic">I</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </section>

        {/* Position */}
        <section>
          <SectionHeader>Position</SectionHeader>
          <PositionPicker
            value={config.position}
            onChange={(pos) => updateConfig({ position: pos })}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="margin-x" className="text-sm font-medium text-[var(--foreground)]">
                H. Margin
              </label>
              <input
                id="margin-x"
                type="number"
                min={0}
                max={200}
                value={config.marginX}
                onChange={(e) => updateConfig({ marginX: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] outline-none focus:border-[var(--brand)] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="margin-y" className="text-sm font-medium text-[var(--foreground)]">
                V. Margin
              </label>
              <input
                id="margin-y"
                type="number"
                min={0}
                max={200}
                value={config.marginY}
                onChange={(e) => updateConfig({ marginY: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--foreground)] outline-none focus:border-[var(--brand)] transition-all"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Preview badge */}
      <div className="px-5 py-4 border-t border-[var(--surface-border)]">
        <motion.div
          key={`${config.prefix}${config.startNumber}${config.suffix}${config.numberStyle}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--surface-border)]"
        >
          <span className="text-xs text-[var(--muted)]">Preview label:</span>
          <span
            className="text-sm font-medium text-[var(--brand)]"
            style={{
              fontFamily: config.fontFamily === "Courier" ? "monospace" : config.fontFamily === "Times-Roman" ? "serif" : "sans-serif",
              fontWeight: config.bold ? 700 : 400,
              fontStyle: config.italic ? "italic" : "normal",
            }}
          >
            {config.prefix}
            {config.numberStyle === "arabic"
              ? config.startNumber
              : config.numberStyle === "roman"
              ? ["I", "II", "III", "IV", "V"][config.startNumber - 1] ?? "I"
              : ["i", "ii", "iii", "iv", "v"][config.startNumber - 1] ?? "i"}
            {config.suffix}
          </span>
        </motion.div>
      </div>
      </aside>
    </>
  );
}

