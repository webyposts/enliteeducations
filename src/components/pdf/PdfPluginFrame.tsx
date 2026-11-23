import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { proxiedPdfUrl } from "@/lib/pdfProxy";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

const PdfPluginFrame = ({ pdfUrl }: { pdfUrl: string }) => {
  const layoutPlugin = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]],
  });
  const fileUrl = proxiedPdfUrl(pdfUrl);
  if (!fileUrl) {
    return <p className="text-white/80 p-8 text-center">This title does not have a PDF yet.</p>;
  }

  return (
    <div className="h-full min-h-[70vh]">
      <Worker workerUrl={WORKER_URL}>
        <Viewer fileUrl={fileUrl} plugins={[layoutPlugin]} />
      </Worker>
    </div>
  );
};

export default PdfPluginFrame;
