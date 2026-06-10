/**
 * Content-based file-type detection via magic numbers (audit finding H6).
 *
 * Upload routes must not trust the client-supplied MIME type or filename extension — both are
 * attacker-controlled. These helpers sniff the actual leading bytes so a renamed/disguised payload
 * (e.g. an HTML or executable file claiming `application/pdf`) is rejected before it is stored or
 * fed to the PDF/vision pipeline.
 */

export type SniffedType = "pdf" | "jpeg" | "png" | "webp";

/** Detect a file's true type from its leading bytes. Returns null if unrecognized. */
export function sniffFileType(bytes: Uint8Array): SniffedType | null {
  if (bytes.length < 12) return null;

  // PDF: "%PDF" (25 50 44 46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "pdf";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "png";
  }
  // WebP: "RIFF" (52 49 46 46) .... "WEBP" (57 45 42 50) at offset 8
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

const MIME_TO_SNIFFED: Record<string, SniffedType> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * True only if the bytes match one of our allowed types AND that type is consistent with the
 * declared MIME (so a PDF-renamed-as-PNG, or any disguise, is rejected).
 */
export function isAllowedFileContent(bytes: Uint8Array, declaredMime: string): boolean {
  const sniffed = sniffFileType(bytes);
  if (!sniffed) return false;
  return MIME_TO_SNIFFED[declaredMime] === sniffed;
}
