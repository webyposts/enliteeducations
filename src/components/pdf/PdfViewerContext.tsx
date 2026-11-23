import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import PdfViewerModal from "@/components/pdf/PdfViewerModal";

type PdfTarget = {
  title: string;
  pdfUrl: string;
  slug?: string;
};

type PdfViewerContextValue = {
  openPdf: (target: PdfTarget) => void;
};

const PdfViewerContext = createContext<PdfViewerContextValue | null>(null);

export const PdfViewerProvider = ({ children }: { children: ReactNode }) => {
  const [target, setTarget] = useState<PdfTarget | null>(null);
  const value = useMemo(
    () => ({
      openPdf: (next: PdfTarget) => {
        if (next.pdfUrl) setTarget(next);
      },
    }),
    []
  );

  return (
    <PdfViewerContext.Provider value={value}>
      {children}
      <PdfViewerModal
        open={Boolean(target)}
        title={target?.title || ""}
        pdfUrl={target?.pdfUrl || ""}
        slug={target?.slug}
        onClose={() => setTarget(null)}
      />
    </PdfViewerContext.Provider>
  );
};

export function usePdfViewer() {
  const ctx = useContext(PdfViewerContext);
  if (!ctx) {
    throw new Error("usePdfViewer must be used inside PdfViewerProvider");
  }
  return ctx;
}
