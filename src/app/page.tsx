"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { DropZone } from "@/components/DropZone";
import { PRESETS } from "@/lib/presets";
import { Zap, ChevronRight } from "lucide-react";

function LandingInner() {
  const { setPdf, applyPreset } = useApp();
  const router = useRouter();

  const handlePdfLoaded = (file: File, buffer: ArrayBuffer, pages: number) => {
    setPdf(file, buffer, pages);
    router.push("/editor");
  };

  const handlePresetClick = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) applyPreset(preset);
    // Open file dialog
    const input = document.getElementById("pdf-upload-input") as HTMLInputElement | null;
    input?.click();
  };

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💣</span>
          <span className="font-display font-bold text-xl tracking-tight text-[var(--foreground)]">
            paeger<span className="gradient-text">bomb</span>
          </span>
        </div>
        <span className="text-xs text-[var(--muted)] bg-[var(--surface-raised)] px-3 py-1.5 rounded-full border border-[var(--surface-border)]">
          No login. No nonsense.
        </span>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-3xl mx-auto w-full gap-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-6xl mb-2"
          >
            💣
          </motion.div>
          <h1 className="text-5xl font-display font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Add page numbers to{" "}
            <span className="gradient-text">any PDF</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Drop your PDF, tweak the style, download. Zero friction — like a shot of Jaeger. 🥃
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full"
        >
          <DropZone onPdfLoaded={handlePdfLoaded} />
        </motion.div>

        {/* Quick presets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Quick Templates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                id={`preset-${preset.id}`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePresetClick(preset.id)}
                className="group flex flex-col gap-2 p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{preset.icon}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--brand)] transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[var(--surface-border)]">
        <p className="text-xs text-[var(--muted)]">
          All processing happens in your browser. Your PDFs never leave your device. 🔒
        </p>
      </footer>
    </main>
  );
}

export default function HomePage() {
  return <LandingInner />;
}
