import { describe, it, expect } from "vitest";
import { sniffFileType, isAllowedFileContent } from "../file-signature";

// Magic-byte fixtures padded to >= 12 bytes.
const PDF = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x25, 0x00, 0x00]); // "%PDF-1.7"
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const WEBP = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
const HTML = Uint8Array.from([0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45, 0x20, 0x68, 0x74]); // "<!DOCTYPE ht"

describe("sniffFileType", () => {
  it("detects each allowed type by its magic bytes", () => {
    expect(sniffFileType(PDF)).toBe("pdf");
    expect(sniffFileType(JPEG)).toBe("jpeg");
    expect(sniffFileType(PNG)).toBe("png");
    expect(sniffFileType(WEBP)).toBe("webp");
  });

  it("returns null for unrecognized content", () => {
    expect(sniffFileType(HTML)).toBeNull();
  });

  it("returns null for too-short input", () => {
    expect(sniffFileType(Uint8Array.from([0x25, 0x50, 0x44, 0x46]))).toBeNull();
  });
});

describe("isAllowedFileContent", () => {
  it("accepts content that matches its declared MIME", () => {
    expect(isAllowedFileContent(PDF, "application/pdf")).toBe(true);
    expect(isAllowedFileContent(PNG, "image/png")).toBe(true);
  });

  it("rejects a disguised payload (HTML claiming PDF)", () => {
    expect(isAllowedFileContent(HTML, "application/pdf")).toBe(false);
  });

  it("rejects a real type masquerading as a different allowed type (PDF declared as PNG)", () => {
    expect(isAllowedFileContent(PDF, "image/png")).toBe(false);
  });

  it("rejects an unknown declared MIME even with valid content", () => {
    expect(isAllowedFileContent(PDF, "application/octet-stream")).toBe(false);
  });
});
