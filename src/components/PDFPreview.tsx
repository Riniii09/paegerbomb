"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { parsePageRange, buildPageLabels } from "@/lib/pageRangeParser";
import { toRoman, toLowerRoman } from "@/lib/romanNumerals";
import { FileText, Loader2 } from "lucide-react";



const POSITION_STYLES: Record<string, { top?: string; bottom?: string; left?: string; right?: string; transform?: string }> = {
  "top-left":       { top: "6%", left: "8%" },
  "top-center":     { top: "6%", left: "50%", transform: "translateX(-50%)" },
  "top-right":      { top: "6%", right: "8%" },
  "middle-left":    { top: "50%", left: "8%", transform: "translateY(-50%)" },
  "middle-center":  { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "middle-right":   { top: "50%", right: "8%", transform: "translateY(-50%)" },
  "bottom-left":    { bottom: "6%", left: "8%" },
  "bottom-center":  { bottom: "6%", left: "50%", transform: "translateX(-50%)" },
  "bottom-right":   { bottom: "6%", right: "8%" },
};

function formatLabel(num: number, style: string, prefix: string, suffix: string): string {
  const core =
    style === "roman" ? toRoman(num) : style === "roman-lower" ? toLowerRoman(num) : String(num);
  return `${prefix}${core}${suffix}`;
}

function PageThumbnail({
  pageNum,
  label,
  config,
  index,
  pdfDoc,
}: {
  pageNum: number;
  label: string | null;
  config: ReturnType<typeof useApp>["config"];
  index: number;
  pdfDoc: any | null;
}) {
  const posStyle = POSITION_STYLES[config.position] ?? POSITION_STYLES["bottom-center"];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 }); // Low scale for thumbnail
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        setIsRendered(true);
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    }
    renderPage();
  }, [pdfDoc, pageNum]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Page card */}
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border border-[var(--surface-border)] group"
        style={{ width: 160, height: 220, minHeight: 220 }}>
        
        {/* Real PDF Content */}
        {!isRendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
             <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)] opacity-20" />
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isRendered ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Gradient overlay for better label visibility if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />


        {/* Page number overlay */}
        <AnimatePresence>
          {label && (
            <motion.span
              key={label + config.position}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute text-black pointer-events-none z-10"
              style={{
                ...posStyle,
                fontSize: Math.max(7, Math.min(config.fontSize * 0.8, 14)),
                fontWeight: config.bold ? 700 : 400,
                fontStyle: config.italic ? "italic" : "normal",
                fontFamily:
                  config.fontFamily === "Courier"
                    ? "monospace"
                    : config.fontFamily === "Times-Roman"
                    ? "serif"
                    : "sans-serif",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Page number label */}
      <span className="text-xs text-[var(--muted)]">p.{pageNum}</span>
    </motion.div>
  );
}

export function PDFPreview() {
  const { pdfState, config } = useApp();
  const { totalPages, arrayBuffer } = pdfState;
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);

  useEffect(() => {
    async function loadPdf() {
      if (!arrayBuffer) {
        setPdfDoc(null);
        return;
      }
      try {
        // Use the global library from the script tag injected in EditorPage
        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
            // Wait a bit if library hasn't loaded yet
            setTimeout(loadPdf, 100);
            return;
        }

        // Initialize worker from CDN
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (err) {
        console.error("Error loading PDF for preview:", err);
      }
    }
    loadPdf();
  }, [arrayBuffer]);


  const labelMap = useMemo(() => {
    if (!totalPages) return new Map<number, number>();
    const endPage = config.endPage ?? totalPages;
    const rangePages: number[] = [];
    for (let i = config.startPage; i <= Math.min(endPage, totalPages); i++) {
      rangePages.push(i);
    }
    const skippedSet = new Set(
      config.skipPages ? parsePageRange(config.skipPages, totalPages) : []
    );
    const numberedPages = rangePages.filter((p) => !skippedSet.has(p));
    return buildPageLabels(totalPages, numberedPages, config.startNumber);
  }, [totalPages, config]);

  if (!totalPages) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm">No PDF loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
        <h3 className="text-sm font-medium text-[var(--muted)] text-center sm:text-left">
          {totalPages} pages · {labelMap.size} will be numbered
        </h3>
        <div className="hidden sm:block flex-1 h-px bg-[var(--surface-border)]" />
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum, index) => {
          const labelNum = labelMap.get(pageNum);
          const label = labelNum !== undefined
            ? formatLabel(labelNum, config.numberStyle, config.prefix, config.suffix)
            : null;
          return (
            <PageThumbnail
              key={`${pageNum}-${pdfDoc ? "loaded" : "loading"}`}
              pageNum={pageNum}
              label={label}
              config={config}
              index={index}
              pdfDoc={pdfDoc}
            />
          );
        })}
      </div>
    </div>
  );
}


function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
