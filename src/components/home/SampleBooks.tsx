import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, FileText, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  groupByGrade,
  loadBookCatalog,
  type GradeFolder,
} from "@/lib/enliteBooks";
import { usePdfViewer } from "@/components/pdf/PdfViewerContext";

const SampleBooks = () => {
  const [folders, setFolders] = useState<GradeFolder[]>([]);
  const [activeSlug, setActiveSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const { openPdf } = usePdfViewer();

  useEffect(() => {
    let cancelled = false;
    loadBookCatalog().then((catalog) => {
      if (cancelled) return;
      const next = groupByGrade(catalog.books, catalog.gradeOrder);
      setFolders(next);
      setActiveSlug(next[0]?.slug || "");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => folders.find((folder) => folder.slug === activeSlug) || folders[0],
    [folders, activeSlug]
  );



  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Sample books from our library
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Books by Class</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Open a class folder to preview sample textbooks already published on
            Enlite Educations.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading class folders…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 max-w-6xl mx-auto">
              {folders.map((folder) => {
                const selected = folder.slug === active?.slug;
                const Icon = selected ? FolderOpen : Folder;
                return (
                  <button
                    key={folder.slug}
                    type="button"
                    onClick={() => setActiveSlug(folder.slug)}
                    className={`rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      selected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 mb-3 ${selected ? "text-accent" : "text-primary"}`}
                    />
                    <p className="font-semibold leading-tight">{folder.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {folder.books.length} sample{folder.books.length === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>

            {active && (
              <div className="max-w-6xl mx-auto mt-10">
                <div className="flex items-end justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{active.name} samples</h3>
                    <p className="text-sm text-muted-foreground">
                      Cover previews from the live Enlite library. Open a PDF to browse the sample book.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/catalog">View full catalog</Link>
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.books.map((book) => (
                    <article
                      key={book.id}
                      className="group rounded-xl border-2 border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-primary">
                            <FileText className="h-16 w-16" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{book.grade}</Badge>
                          <Badge variant="outline">{book.subject}</Badge>
                        </div>
                        <h4 className="font-semibold leading-snug">{book.title}</h4>
                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {book.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              openPdf({
                                title: book.title,
                                pdfUrl: book.pdfUrl,
                                slug: book.slug,
                              })
                            }
                            disabled={!book.pdfUrl}
                          >
                            <FileText className="h-4 w-4" />
                            View sample PDF
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={book.appUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              App page
                            </a>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SampleBooks;
