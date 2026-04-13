"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

interface DropZoneProps {
  onPdfLoaded: (file: File, buffer: ArrayBuffer, pages: number) => void;
  className?: string;
  compact?: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function DropZone({ onPdfLoaded, className, compact = false }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        if (file.type !== "application/pdf") {
          setError("Only PDF files are supported.");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`File too large. Max size is 100MB.`);
          return;
        }
        const buffer = await file.arrayBuffer();
        let pdfDoc: PDFDocument;
        try {
          pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        } catch {
          setError("Could not read this PDF. It may be corrupted or password-protected.");
          return;
        }
        const totalPages = pdfDoc.getPageCount();
        if (totalPages === 0) {
          setError("This PDF has no pages.");
          return;
        }
        onPdfLoaded(file, buffer, totalPages);
      } catch {
        setError("Something went wrong reading the file. Please try another PDF.");
      } finally {
        setLoading(false);
      }
    },
    [onPdfLoaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const code = fileRejections[0]?.errors?.[0]?.code;
        if (code === "file-too-large") setError("File too large. Max 100MB.");
        else if (code === "file-invalid-type") setError("Only PDF files are accepted.");
        else setError("Invalid file.");
        return;
      }
      if (acceptedFiles[0]) processFile(acceptedFiles[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: loading,
  });

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all duration-200",
            isDragActive ? "border-[var(--brand)] bg-[var(--brand-dim)]" : "border-[var(--surface-border)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)]"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-4 h-4 text-[var(--brand)] shrink-0" />
          <span className="text-sm text-[var(--muted)]">Try another PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        {...(getRootProps() as object)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-300 group",
          isDragActive && !isDragReject
            ? "border-[var(--brand)] bg-[var(--brand-dim)] shadow-[0_0_40px_var(--brand-glow)]"
            : isDragReject
            ? "border-[var(--destructive)] bg-red-950/20"
            : "border-[var(--surface-border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--surface-raised)]"
        )}
      >
        <input {...getInputProps()} id="pdf-upload-input" />

        {/* Animated icon */}
        <motion.div
          animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300",
            isDragActive ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-raised)] text-[var(--brand)] group-hover:bg-[var(--brand-dim)]"
          )}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full"
            />
          ) : (
            <FileText className="w-9 h-9" />
          )}
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-[var(--foreground)]">
            {isDragActive ? "Drop it!" : loading ? "Processing…" : "Drop your PDF here"}
          </p>
          <p className="text-sm text-[var(--muted)]">
            or{" "}
            <span className="text-[var(--brand)] underline underline-offset-2">click to browse</span>
            {" "}· PDF only · Max 100MB
          </p>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{ opacity: 0.2 + i * 0.25 }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]"
            />
          ))}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
