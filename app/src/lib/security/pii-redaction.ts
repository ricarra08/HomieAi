/**
 * PII redaction for document-derived text (audit H3).
 *
 * Security invariant: `documents.extracted_text` and everything derived from it
 * (ai_summary, extracted_fields, LLM prompt context) must never contain Social
 * Security numbers, bank account numbers, ABA routing numbers, or card numbers.
 * The uploaded PDF in Storage remains the system of record, so redacting derived
 * text is lossless — reprocessing the document regenerates everything.
 *
 * Applied at two layers:
 *  1. Choke point: /api/documents/process redacts once, right after text
 *     extraction, so all OpenAI calls and DB writes derive from redacted text.
 *  2. Defense in depth: prompt assembly (context-engine, draft-question) redacts
 *     again — covers rows written before this module existed.
 *
 * Design notes:
 *  - Replacement tokens contain no digits, so redaction is idempotent by
 *    construction (re-running over redacted text matches nothing).
 *  - Real-estate documents are full of long digit identifiers that must SURVIVE
 *    (loan numbers, escrow/order file numbers, MLS numbers, APNs, ZIP+4, phone
 *    numbers, dollar amounts). Every pass therefore combines shape, checksum
 *    (ABA, Luhn), and nearby-context requirements; dollar-prefixed numbers are
 *    exempt everywhere.
 *  - Redacting wire-instruction numbers is product-aligned: WireTransferSafeSend
 *    teaches buyers to never trust wire instructions found in documents. Numbers
 *    are replaced individually (not the whole block) so summaries can still say
 *    "this document contains wire instructions — verify by phone".
 *  - All patterns are linear (no nested quantifiers); a 100K-char document
 *    redacts in single-digit milliseconds.
 */

export type PiiKind = "ssn" | "routing" | "account" | "card" | "wire";

export interface RedactionResult {
  text: string;
  counts: Partial<Record<PiiKind, number>>;
  total: number;
}

const TOKENS: Record<PiiKind, string> = {
  ssn: "[REDACTED:SSN]",
  routing: "[REDACTED:ROUTING]",
  account: "[REDACTED:ACCOUNT]",
  card: "[REDACTED:CARD]",
  wire: "[REDACTED:WIRE]",
};

// ---------------------------------------------------------------------------
// Checksum validators (exported for direct unit testing)
// ---------------------------------------------------------------------------

/** Luhn check for 13–19 digit card candidates. */
export function passesLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * ABA routing number check: 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) ≡ 0 (mod 10),
 * AND the two-digit prefix must be in a Federal Reserve range (00–12, 21–32,
 * 61–72, 80). Together these reject ~96% of random 9-digit numbers.
 */
export function isValidAbaRouting(digits: string): boolean {
  if (!/^\d{9}$/.test(digits)) return false;
  const d = Array.from(digits, (c) => c.charCodeAt(0) - 48);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  if (sum % 10 !== 0) return false;
  const prefix = d[0] * 10 + d[1];
  return (
    prefix <= 12 ||
    (prefix >= 21 && prefix <= 32) ||
    (prefix >= 61 && prefix <= 72) ||
    prefix === 80
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface PassResult {
  text: string;
  count: number;
}

/** Replace every match the predicate approves; returns new text + count. */
function replaceMatches(
  text: string,
  re: RegExp,
  token: string,
  shouldRedact: (match: string, offset: number, text: string) => boolean,
): PassResult {
  let out = "";
  let last = 0;
  let count = 0;
  for (const m of text.matchAll(re)) {
    const offset = m.index;
    if (!shouldRedact(m[0], offset, text)) continue;
    out += text.slice(last, offset) + token;
    last = offset + m[0].length;
    count++;
  }
  if (count === 0) return { text, count: 0 };
  out += text.slice(last);
  return { text: out, count };
}

/**
 * Case-insensitive keyword scan in text[offset-before, offset+len+after].
 * Deliberately crosses newlines — PDF extraction often puts the form label on
 * the line above the value.
 */
function hasNearbyContext(
  text: string,
  offset: number,
  len: number,
  contextRe: RegExp,
  before: number,
  after: number,
): boolean {
  const window = text.slice(Math.max(0, offset - before), Math.min(text.length, offset + len + after));
  return contextRe.test(window);
}

/** Dollar amounts are never PII — exempt any candidate preceded by `$`. */
function hasDollarPrefix(text: string, offset: number): boolean {
  return text.slice(Math.max(0, offset - 4), offset).includes("$");
}

// ---------------------------------------------------------------------------
// Pass 1+2 — Social Security numbers
// ---------------------------------------------------------------------------

const SSN_DASHED = /\b(\d{3})-(\d{2})-(\d{4})\b/g;
// Literal spaces (NOT \s): CD/LE tables are columns of space-separated numbers,
// and \s would let the pattern straddle cells and lines.
const SSN_SPACED = /\b\d{3} \d{2} \d{4}\b/g;
const BARE_NINE = /\b\d{9}\b/g;

const SSN_CONTEXT_CI =
  /\b(ssn|soc(?:ial)?[\s-]*sec(?:urity)?(?:[\s-]*(?:no\.?|num(?:ber)?|#))?|taxpayer[\s-]*id(?:entification)?)\b/i;
// TIN/ITIN only as uppercase acronyms — lowercase "tin" is an English word.
const SSN_CONTEXT_CS = /\b(?:TIN|ITIN)\b/;

function hasSsnContext(text: string, offset: number, len: number): boolean {
  const window = text.slice(Math.max(0, offset - 200), Math.min(text.length, offset + len + 50));
  return SSN_CONTEXT_CI.test(window) || SSN_CONTEXT_CS.test(window);
}

function redactSsns(text: string): PassResult {
  // Dashed 3-2-4 is distinctive enough to redact unconditionally. Skip only
  // structurally invalid placeholders (area 000, group 00, serial 0000); area
  // 9xx is kept so ITINs are caught. Phones (3-3-4), ZIP+4 (5-4), dates, and
  // APNs all fail the shape or the digit word-boundaries.
  const dashed = replaceMatches(text, SSN_DASHED, TOKENS.ssn, (m) => {
    const [area, group, serial] = m.split("-");
    return area !== "000" && group !== "00" && serial !== "0000";
  });

  // Space-separated and bare 9-digit forms only redact with an SSN-ish label
  // nearby — unlabeled candidates are overwhelmingly table cells, escrow file
  // numbers, or ZIP9s.
  const spaced = replaceMatches(dashed.text, SSN_SPACED, TOKENS.ssn, (m, off, t) =>
    hasSsnContext(t, off, m.length),
  );
  const bare = replaceMatches(spaced.text, BARE_NINE, TOKENS.ssn, (m, off, t) => {
    if (hasDollarPrefix(t, off)) return false;
    return hasSsnContext(t, off, m.length);
  });

  return { text: bare.text, count: dashed.count + spaced.count + bare.count };
}

// ---------------------------------------------------------------------------
// Pass 3 — Credit/debit card numbers (Luhn-gated)
// ---------------------------------------------------------------------------

// Uniform separator enforced via backreference (no mixed "1234-5678 9012").
const CARD_GROUPED = /\b\d{4}([- ])\d{4}\1\d{4}\1\d{1,4}\b/g;
const CARD_AMEX = /\b\d{4}([- ])\d{6}\1\d{5}\b/g;
const CARD_CONTIGUOUS = /\b\d{13,19}\b/g;

const CARD_IIN = /^(?:4|5[1-5]|2[2-7]|3[47]|6011|65)/;
// Long identifiers labeled like these are never card numbers in this domain.
const CARD_EXCLUSION_CONTEXT =
  /\b(loan|escrow|file|order|parcel|apn|mls|policy|case|tracking)\b[\s.#:a-z]*$/i;

function redactCards(text: string): PassResult {
  let count = 0;
  let current = text;
  for (const re of [CARD_GROUPED, CARD_AMEX]) {
    const r = replaceMatches(current, re, TOKENS.card, (m, off, t) => {
      if (hasDollarPrefix(t, off)) return false;
      return passesLuhn(m.replace(/[- ]/g, ""));
    });
    current = r.text;
    count += r.count;
  }
  const contiguous = replaceMatches(current, CARD_CONTIGUOUS, TOKENS.card, (m, off, t) => {
    if (hasDollarPrefix(t, off)) return false;
    if (!CARD_IIN.test(m) || !passesLuhn(m)) return false;
    const before = t.slice(Math.max(0, off - 60), off);
    return !CARD_EXCLUSION_CONTEXT.test(before);
  });
  return { text: contiguous.text, count: count + contiguous.count };
}

// ---------------------------------------------------------------------------
// Pass 4 — ABA routing numbers (checksum + banking context)
// ---------------------------------------------------------------------------

const ROUTING_CONTEXT = /\b(aba|routing|rtn|r\/t|wire|wiring|swift|ach|bank|transit)\b/i;

function redactRoutingNumbers(text: string): PassResult {
  return replaceMatches(text, BARE_NINE, TOKENS.routing, (m, off, t) => {
    if (hasDollarPrefix(t, off)) return false;
    if (!isValidAbaRouting(m)) return false;
    return hasNearbyContext(t, off, m.length, ROUTING_CONTEXT, 200, 50);
  });
}

// ---------------------------------------------------------------------------
// Pass 5 — Bank account numbers (strictly context-driven)
// ---------------------------------------------------------------------------

// Separators limited to dash/space; comma and period are excluded so formatted
// currency ($52,431.18) and decimals structurally never form candidates.
const ACCOUNT_CANDIDATE = /\b\d[\d\- ]{3,20}\d\b/g;

const ACCOUNT_CONTEXT =
  /\b(account|acct\.?|a\/c|checking|savings|iban|beneficiary|for\s+(?:further\s+)?credit\s+(?:to|of)|deposit\s+to)\b/i;
const PHONE_SHAPE = /(?:\(\d{3}\)[-. ]?|\b\d{3}[-. ])\d{3}[-. ]\d{4}\b/;
const PHONE_CONTEXT = /\b(phone|tel(?:ephone)?|call|fax|cell|mobile|customer\s+service)\b/i;
const DATE_SHAPES = [
  /^(?:19|20)\d{2}[-\/. ]\d{1,2}[-\/. ]\d{1,2}$/,
  /^\d{1,2}[-\/. ]\d{1,2}[-\/. ](?:19|20)?\d{2}$/,
];
const ZIP_PLUS_FOUR = /^\d{5}-\d{4}$/;
const STATE_CODE_BEFORE = /\b[A-Z]{2}\s+$/;

function redactAccountNumbers(text: string): PassResult {
  return replaceMatches(text, ACCOUNT_CANDIDATE, TOKENS.account, (m, off, t) => {
    const digits = m.replace(/[- ]/g, "");
    if (digits.length < 5 || digits.length > 17) return false;
    if (hasDollarPrefix(t, off)) return false;
    if (DATE_SHAPES.some((re) => re.test(m))) return false;
    // Positive context required, in a NARROW window — "account" must label this
    // number, not merely appear in the same paragraph.
    if (!hasNearbyContext(t, off, m.length, ACCOUNT_CONTEXT, 60, 20)) return false;
    // Exemptions that beat positive context:
    const phoneWindow = t.slice(Math.max(0, off - 18), off + m.length);
    if (PHONE_SHAPE.test(phoneWindow)) return false;
    if (hasNearbyContext(t, off, m.length, PHONE_CONTEXT, 30, 0)) return false;
    if (ZIP_PLUS_FOUR.test(m) && STATE_CODE_BEFORE.test(t.slice(Math.max(0, off - 8), off))) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Pass 6 — Wire-instruction block sweep (belt and braces)
// ---------------------------------------------------------------------------

const WIRE_TRIGGER =
  /\b(?:wire|wiring)\s+(?:transfer\s+)?instructions?\b|\bbeneficiary\s+(?:bank|account|name)\b|\breceiving\s+bank\b|\bintermediary\s+bank\b|\bfor\s+(?:further\s+)?credit\s+to\b|\bswift(?:\s*\/?\s*bic)?\s*(?:code)?\s*:/gi;

const WIRE_BLOCK_MAX_CHARS = 600;
const WIRE_BLOCK_MAX_LINES = 12;

// 8 or 11 char SWIFT/BIC shape — only redacted directly after a swift/bic label,
// otherwise ordinary all-caps words ("TRANSFER", "DISCLOSE") would match.
const SWIFT_SHAPE = /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g;
const SWIFT_LABEL_BEFORE = /\b(?:swift|bic)\b[\s:\/\-]*$/i;

function findWireBlocks(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const m of text.matchAll(WIRE_TRIGGER)) {
    const start = m.index;
    let end = Math.min(text.length, start + WIRE_BLOCK_MAX_CHARS);
    let newlines = 0;
    for (let i = start; i < end; i++) {
      if (text[i] === "\n" && ++newlines >= WIRE_BLOCK_MAX_LINES) {
        end = i;
        break;
      }
    }
    // Blank-line boundary, but only after the block has had room to start —
    // headers are often followed by one blank line before the details.
    const tail = text.slice(start + 100, end);
    const blank = tail.search(/\n[ \t]*\n/);
    if (blank !== -1) end = start + 100 + blank;
    ranges.push([start, end]);
  }
  // Merge overlapping ranges.
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

function redactWireBlocks(text: string): PassResult {
  const blocks = findWireBlocks(text);
  if (!blocks.length) return { text, count: 0 };
  let result = text;
  let count = 0;
  // Process back-to-front so earlier indices stay valid.
  for (let i = blocks.length - 1; i >= 0; i--) {
    const [start, end] = blocks[i];
    let block = result.slice(start, end);
    // Any remaining ≥5-digit run inside a wire block is presumed sensitive.
    // Dollar amounts are exempt; separator-formatted dates ("04/15/2026") never
    // form ≥5 contiguous digits, so they survive structurally.
    const digits = replaceMatches(block, /\d{5,}/g, TOKENS.wire, (m, off, t) => !hasDollarPrefix(t, off));
    block = digits.text;
    count += digits.count;
    const swift = replaceMatches(block, SWIFT_SHAPE, TOKENS.wire, (m, off, t) => {
      if (t[off - 1] === "[") return false; // inside an existing [REDACTED:*] token
      return SWIFT_LABEL_BEFORE.test(t.slice(Math.max(0, off - 20), off));
    });
    block = swift.text;
    count += swift.count;
    result = result.slice(0, start) + block + result.slice(end);
  }
  return { text: result, count };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/**
 * Redact PII from document-derived text. Pure, deterministic, idempotent
 * (tokens contain no digits, every pattern requires them). Never throws.
 */
export function redactPii(raw: string): RedactionResult {
  if (typeof raw !== "string" || raw.length === 0) {
    return { text: typeof raw === "string" ? raw : "", counts: {}, total: 0 };
  }

  const counts: Partial<Record<PiiKind, number>> = {};
  let text = raw;

  // Order matters: explicit SSN labels win over routing for the same 9 digits;
  // routing/account tokenization happens before the wire-block sweep so the
  // sweep only catches unlabeled leftovers.
  const passes: Array<[PiiKind, (t: string) => PassResult]> = [
    ["ssn", redactSsns],
    ["card", redactCards],
    ["routing", redactRoutingNumbers],
    ["account", redactAccountNumbers],
    ["wire", redactWireBlocks],
  ];

  let total = 0;
  for (const [kind, pass] of passes) {
    const r = pass(text);
    text = r.text;
    if (r.count > 0) {
      counts[kind] = (counts[kind] ?? 0) + r.count;
      total += r.count;
    }
  }

  return { text, counts, total };
}

/** Convenience for one-line prompt-assembly call sites. */
export function redactPiiText(raw: string): string {
  return redactPii(raw).text;
}
