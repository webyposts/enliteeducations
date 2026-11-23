const ALLOWED_PREFIX = "https://app.enliteeducations.in/wp-content/uploads/";

export const CATALOGUE_TITLE = "Enlite Education Catalogue";

export function cataloguePdfUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}catalogue/enlite-education-catalogue.pdf`;
}

export function proxiedPdfUrl(pdfUrl: string) {
  if (!pdfUrl) return "";
  const base = import.meta.env.BASE_URL || "/";
  if (pdfUrl.startsWith(ALLOWED_PREFIX)) {
    return `${base}pdf-proxy.php?url=${encodeURIComponent(pdfUrl)}`;
  }
  if (pdfUrl.startsWith(base) || pdfUrl.startsWith("/")) {
    return pdfUrl;
  }
  return "";
}
