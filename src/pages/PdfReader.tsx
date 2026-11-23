import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import PdfPluginFrame from "@/components/pdf/PdfPluginFrame";
import { findBook, getSnapshotCatalog, loadBookCatalog, type EnliteBook } from "@/lib/enliteBooks";

const PdfReader = () => {
  const { slug = "" } = useParams();
  const [book, setBook] = useState<EnliteBook | null>(
    () => findBook(slug, getSnapshotCatalog().books)
  );
  const [missing, setMissing] = useState(
    () => !findBook(slug, getSnapshotCatalog().books)
  );

  useEffect(() => {
    loadBookCatalog().then((catalog) => {
      const found = findBook(slug, catalog.books);
      setBook(found);
      setMissing(!found);
    });
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1b1b1b]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 text-white">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-white/60">Sample book viewer</p>
            <h1 className="font-semibold truncate">{book?.title || "Loading book…"}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" variant="secondary">
              <Link to="/catalog">
                <ArrowLeft className="h-4 w-4" />
                Catalog
              </Link>
            </Button>
            {book?.pdfUrl && (
              <Button asChild size="sm" variant="secondary">
                <a href={book.pdfUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open file
                </a>
              </Button>
            )}
          </div>
        </div>

        {missing && (
          <p className="text-white/80 p-8 text-center">This sample book was not found.</p>
        )}

        {book?.pdfUrl && (
          <div className="flex-1 min-h-[70vh] bg-[#525659]">
            <PdfPluginFrame pdfUrl={book.pdfUrl} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PdfReader;
