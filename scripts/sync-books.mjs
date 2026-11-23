import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://app.enliteeducations.in/wp-json/wp/v2";
const __dirname = dirname(fileURLToPath(import.meta.url));

async function getAll(path, extra = "") {
  const items = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/${path}?per_page=100&page=${page}${extra}`);
    if (!res.ok) throw new Error(`${path} ${res.status}`);
    const batch = await res.json();
    items.push(...batch);
    const totalPages = Number(res.headers.get("X-WP-TotalPages") || "1");
    if (page >= totalPages) break;
    page += 1;
  }
  return items;
}

function decode(html = "") {
  return html
    .replace(/&#8211;/g, "–")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const GRADE_ORDER = [
  "nursery",
  "lkg",
  "ukg",
  "class-1",
  "class-2",
  "class-3",
  "class-4",
  "class-5",
  "class-6",
  "class-7",
  "class-8",
  "class-9",
  "class-10",
];

const booksRaw = await getAll("book", "&_embed=1");
const mediaRaw = await getAll("media", "&media_type=application");
const pdfById = new Map(
  mediaRaw
    .filter((m) => m.mime_type === "application/pdf")
    .map((m) => [m.id, m.source_url])
);

const books = booksRaw.map((book) => {
  const grade = book._embedded?.["wp:term"]?.[0]?.[0];
  const subject = book._embedded?.["wp:term"]?.[1]?.[0];
  const cover =
    book._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    book._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium
      ?.source_url ||
    "";
  const pdfId = book.acf?.pdf_file;
  const pdfUrl =
    (typeof pdfId === "number" && pdfById.get(pdfId)) ||
    mediaRaw.find(
      (m) => m.post === book.id && m.mime_type === "application/pdf"
    )?.source_url ||
    "";

  return {
    id: book.id,
    slug: book.slug,
    title: decode(book.title?.rendered),
    description: decode(book.acf?.short_description || ""),
    grade: grade?.name || "Other",
    gradeSlug: grade?.slug || "other",
    subject: subject?.name || "Textbook",
    subjectSlug: subject?.slug || "textbook",
    coverUrl: cover,
    pdfUrl,
    appUrl: book.link,
    displayOrder: Number(book.acf?.display_order) || 99,
    author: book.acf?.author || "Enlite Education",
  };
});

const catalog = {
  syncedAt: new Date().toISOString(),
  source: "https://app.enliteeducations.in",
  gradeOrder: GRADE_ORDER,
  books,
};

const out = join(__dirname, "..", "src", "data", "live-books.json");
await writeFile(out, JSON.stringify(catalog, null, 2));
console.log(`Wrote ${books.length} books to ${out}`);
console.log(
  [...new Set(books.map((b) => b.grade))]
    .sort()
    .map((g) => `${g}: ${books.filter((b) => b.grade === g).length}`)
    .join("\n")
);
