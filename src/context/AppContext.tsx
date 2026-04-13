"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_CONFIG, PRESETS } from "@/lib/presets";
import type { PageNumberConfig, Preset } from "@/lib/presets";

interface PdfState {
  file: File | null;
  arrayBuffer: ArrayBuffer | null;
  totalPages: number;
  fileName: string;
}

interface AppContextValue {
  // PDF
  pdfState: PdfState;
  setPdf: (file: File, buffer: ArrayBuffer, pages: number) => void;
  clearPdf: () => void;

  // Config
  config: PageNumberConfig;
  setConfig: React.Dispatch<React.SetStateAction<PageNumberConfig>>;
  updateConfig: (partial: Partial<PageNumberConfig>) => void;
  applyPreset: (preset: Preset) => void;
  resetConfig: () => void;

  // Processing
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pdfState, setPdfState] = useState<PdfState>({
    file: null,
    arrayBuffer: null,
    totalPages: 0,
    fileName: "",
  });

  const [config, setConfig] = useState<PageNumberConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);

  const setPdf = useCallback((file: File, buffer: ArrayBuffer, pages: number) => {
    setPdfState({ file, arrayBuffer: buffer, totalPages: pages, fileName: file.name });
  }, []);

  const clearPdf = useCallback(() => {
    setPdfState({ file: null, arrayBuffer: null, totalPages: 0, fileName: "" });
    setConfig(DEFAULT_CONFIG);
  }, []);

  const updateConfig = useCallback((partial: Partial<PageNumberConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setConfig((prev) => ({ ...prev, ...preset.config }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return (
    <AppContext.Provider
      value={{
        pdfState,
        setPdf,
        clearPdf,
        config,
        setConfig,
        updateConfig,
        applyPreset,
        resetConfig,
        isProcessing,
        setIsProcessing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
