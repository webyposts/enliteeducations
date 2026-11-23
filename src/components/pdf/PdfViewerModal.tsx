import { ExternalLink, Maximize2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PdfPluginFrame from "@/components/pdf/PdfPluginFrame";

type PdfViewerModalProps = {
  open: boolean;
  title: string;
  pdfUrl: string;
  slug?: string;
  onClose: () => void;
};

const PdfViewerModal = ({ open, title, pdfUrl, slug, onClose }: PdfViewerModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-[#1b1b1b] flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 text-white">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/60">Sample book viewer</p>
          <h2 className="font-semibold truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {slug && (
            <Button asChild size="sm" variant="secondary">
              <Link to={`/read/${slug}`} onClick={onClose}>
                <Maximize2 className="h-4 w-4" />
                Full page
              </Link>
            </Button>
          )}
          {pdfUrl && (
            <Button asChild size="sm" variant="secondary">
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open file
              </a>
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-[#525659]">
        <PdfPluginFrame pdfUrl={pdfUrl} />
      </div>
    </div>
  );
};

export default PdfViewerModal;
