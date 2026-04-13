"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { CustomizationSidebar } from "@/components/CustomizationSidebar";
import { DropZone } from "@/components/DropZone";
import { applyPageNumbers } from "@/lib/pdfUtils";
import { PRESETS } from "@/lib/presets";
import { Download, ArrowLeft, Zap, Loader2, FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";



const PDFPreview = dynamic(() => import("@/components/PDFPreview").then(mod => mod.PDFPreview), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)] opacity-20" />
    </div>
  )
});


export default function EditorPage() {
  const { pdfState, config, setPdf, applyPreset, isProcessing, setIsProcessing } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();


  // If no PDF, redirect back
  useEffect(() => {
    if (!pdfState.arrayBuffer) {
      router.replace("/");
    }
  }, [pdfState.arrayBuffer, router]);

  const handleDownload = async () => {
    if (!pdfState.arrayBuffer) {
      toast.error("No PDF loaded.");
      return;
    }

    // Validate config
    if (config.startPage < 1) {
      toast.error("Start page must be at least 1.");
      return;
    }
    if (config.endPage !== null && config.endPage < config.startPage) {
      toast.error("End page must be ≥ start page.");
      return;
    }


    setIsProcessing(true);
    try {
      const result = await applyPageNumbers(pdfState.arrayBuffer, config);
      const blob = new Blob([result as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);


      const a = document.createElement("a");
      a.href = url;
      const baseName = pdfState.fileName.replace(/\.pdf$/i, "");
      a.download = `${baseName}_numbered.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { description: "Page numbers added successfully." });
    } catch (err) {
      console.error(err);
      toast.error("Failed to process PDF.", {
        description: "The PDF might be encrypted or malformed.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pdfState.arrayBuffer) return null;

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="beforeInteractive"
      />
      <div className="h-dvh flex flex-col bg-[var(--background)]">

      {/* Topbar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--surface-border)] bg-[var(--surface)] shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            id="mobile-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] lg:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            id="back-to-home"
            onClick={() => router.push("/")}
            className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-dim)] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[var(--brand)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                {pdfState.fileName}
              </span>
              <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wider">
                {pdfState.totalPages} pages
              </span>
            </div>
          </div>
        </div>

        {/* Download */}
        <motion.button
          id="download-pdf-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={isProcessing}
          className="btn-glow flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[var(--brand)] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden xs:inline">
            {isProcessing ? "Processing…" : "Download PDF"}
          </span>
          <span className="xs:hidden">
             {isProcessing ? "" : "Save"}
          </span>
        </motion.button>
      </header>


      {/* Body: sidebar + preview */}
      <div className="flex flex-1 min-h-0 relative">
        <CustomizationSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />


        <div className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
          {/* Replace PDF strip */}
          <div className="px-6 py-3 border-b border-[var(--surface-border)] flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="text-xs text-[var(--muted)] whitespace-nowrap">Replace PDF:</span>
            <DropZone
              onPdfLoaded={(file, buffer, pages) => setPdf(file, buffer, pages)}
              compact
            />
          </div>


          {/* Preview */}
          <PDFPreview />
        </div>
      </div>
    </div>
    </>
  );
}



