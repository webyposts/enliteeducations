import snapshot from "@/data/live-books.json";
import { CATALOGUE_TITLE, cataloguePdfUrl } from "@/lib/pdfProxy";

export type EnliteBook = {
  id: number;
  slug: string;
  title: string;
  description: string;
  grade: string;
  gradeSlug: string;
  subject: string;
  subjectSlug: string;
  coverUrl: string;
  pdfUrl: string;
  appUrl: string;
  displayOrder: number;
  author: string;
};

export type BookCatalog = {
  syncedAt: string;
  source: string;
  gradeOrder: string[];
  books: EnliteBook[];
};

export type GradeFolder = {
  slug: string;
  name: string;
  books: EnliteBook[];
};

const API = "https://app.enliteeducations.in/wp-json/wp/v2";

function decodeHtml(html = "") {
  return html
    .replace(/&#8211;/g, "–")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function inferGrade(book: EnliteBook): EnliteBook {
  if (book.gradeSlug && book.gradeSlug !== "other") return book;
  const hay = `${book.slug} ${book.title}`.toLowerCase();
  const map: Array<[RegExp, string, string]> = [
    [/nursery/, "Nursery", "nursery"],
    [/\blkg\b/, "LKG", "lkg"],
    [/\bukg\b/, "UKG", "ukg"],
    [/class[- ]?10/, "Class 10", "class-10"],
    [/class[- ]?1\b/, "Class 1", "class-1"],
    [/class[- ]?2/, "Class 2", "class-2"],
    [/class[- ]?3/, "Class 3", "class-3"],
    [/class[- ]?4/, "Class 4", "class-4"],
    [/class[- ]?5/, "Class 5", "class-5"],
    [/class[- ]?6/, "Class 6", "class-6"],
    [/class[- ]?7/, "Class 7", "class-7"],
    [/class[- ]?8/, "Class 8", "class-8"],
    [/class[- ]?9/, "Class 9", "class-9"],
  ];
  for (const [re, name, slug] of map) {
    if (re.test(hay)) return { ...book, grade: name, gradeSlug: slug };
  }
  return book;
}

function normalize(books: EnliteBook[]) {
  return books.map(inferGrade);
}

export function groupByGrade(books: EnliteBook[], gradeOrder: string[]): GradeFolder[] {
  const grouped = new Map<string, GradeFolder>();
  for (const book of books) {
    const slug = book.gradeSlug || "other";
    if (!grouped.has(slug)) {
      grouped.set(slug, { slug, name: book.grade, books: [] });
    }
    grouped.get(slug)!.books.push(book);
  }
  for (const folder of grouped.values()) {
    folder.books.sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
  }
  const ordered = gradeOrder
    .map((slug) => grouped.get(slug))
    .filter((folder): folder is GradeFolder => Boolean(folder && folder.books.length));
  const rest = [...grouped.values()].filter((folder) => !gradeOrder.includes(folder.slug) && folder.books.length);
  return [...ordered, ...rest];
}

function mapWpBook(book: Record<string, any>, pdfById: Map<number, string>): EnliteBook {
  const grade = book._embedded?.["wp:term"]?.[0]?.[0];
  const subject = book._embedded?.["wp:term"]?.[1]?.[0];
  const cover = book._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  const pdfId = book.acf?.pdf_file;
  const pdfUrl = (typeof pdfId === "number" && pdfById.get(pdfId)) || "";
  return inferGrade({
    id: book.id,
    slug: book.slug,
    title: decodeHtml(book.title?.rendered),
    description: decodeHtml(book.acf?.short_description || ""),
    grade: grade?.name || "Other",
    gradeSlug: grade?.slug || "other",
    subject: subject?.name || "Textbook",
    subjectSlug: subject?.slug || "textbook",
    coverUrl: cover,
    pdfUrl,
    appUrl: book.link,
    displayOrder: Number(book.acf?.display_order) || 99,
    author: book.acf?.author || "Enlite Education",
  });
}

export function catalogueBook(): EnliteBook {
  return {
    id: 0,
    slug: "catalogue",
    title: CATALOGUE_TITLE,
    description: "Complete Enlite Education catalogue of curriculum content and books.",
    grade: "All classes",
    gradeSlug: "catalogue",
    subject: "Catalogue",
    subjectSlug: "catalogue",
    coverUrl: "",
    pdfUrl: cataloguePdfUrl(),
    appUrl: cataloguePdfUrl(),
    displayOrder: 0,
    author: "Enlite Education",
  };
}

export function findBook(slug: string, books: EnliteBook[]): EnliteBook | null {
  if (slug === "catalogue") return catalogueBook();
  return books.find((item) => item.slug === slug) || null;
}

export function getSnapshotCatalog(): BookCatalog {
  return {
    ...(snapshot as BookCatalog),
    books: normalize((snapshot as BookCatalog).books),
  };
}

export async function loadBookCatalog(): Promise<BookCatalog> {
  const fallback = getSnapshotCatalog();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const [booksRes, mediaRes] = await Promise.all([
      fetch(`${API}/book?per_page=100&_embed=1`, { signal: controller.signal }),
      fetch(`${API}/media?per_page=100&media_type=application`, { signal: controller.signal }),
    ]);
    clearTimeout(timer);
    if (!booksRes.ok) return fallback;
    const booksRaw = await booksRes.json();
    const mediaRaw = mediaRes.ok ? await mediaRes.json() : [];
    const pdfById = new Map<number, string>(
      (mediaRaw as any[])
        .filter((m) => m.mime_type === "application/pdf")
        .map((m) => [m.id, m.source_url])
    );
    return {
      syncedAt: new Date().toISOString(),
      source: "https://app.enliteeducations.in",
      gradeOrder: fallback.gradeOrder,
      books: (booksRaw as any[]).map((book) => mapWpBook(book, pdfById)),
    };
  } catch {
    return fallback;
  }
}
