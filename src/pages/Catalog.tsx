import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  groupByGrade,
  loadBookCatalog,
  type GradeFolder,
} from "@/lib/enliteBooks";
import { usePdfViewer } from "@/components/pdf/PdfViewerContext";

const Catalog = () => {
  const [folders, setFolders] = useState<GradeFolder[]>([]);
  const { openPdf } = usePdfViewer();

  useEffect(() => {
    loadBookCatalog().then((catalog) => {
      setFolders(groupByGrade(catalog.books, catalog.gradeOrder));
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-primary-light via-background to-accent-light">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Catalog</h1>
              <p className="text-lg text-muted-foreground">
                Sample textbooks from the live Enlite library, organised by class folder.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-14">
            {folders.map((folder) => (
              <div key={folder.slug}>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">{folder.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {folder.books.length} sample book{folder.books.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folder.books.map((book) => (
                    <article
                      key={book.id}
                      className="rounded-xl border-2 border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[3/4] bg-muted">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{book.grade}</Badge>
                          <Badge variant="outline">{book.subject}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{book.title}</h3>
                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {book.description}
                          </p>
                        )}
                        {book.pdfUrl ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              openPdf({
                                title: book.title,
                                pdfUrl: book.pdfUrl,
                                slug: book.slug,
                              })
                            }
                          >
                            <FileText className="h-4 w-4" />
                            View sample PDF
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <a href={book.appUrl} target="_blank" rel="noreferrer">
                              Open on app
                            </a>
                          </Button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
