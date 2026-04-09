export const INSPECTION_SUBTYPES = [
  "general",
  "pest",
  "roof",
  "hvac",
  "foundation",
] as const;

export type InspectionSubtype = (typeof INSPECTION_SUBTYPES)[number];

export function isInspectionSubtype(s: string): s is InspectionSubtype {
  return (INSPECTION_SUBTYPES as readonly string[]).includes(s);
}

export const INSPECTION_SUBTYPE_LABELS: Record<InspectionSubtype, string> = {
  general: "General Home Inspection",
  pest: "Pest / Termite",
  roof: "Roof Inspection",
  hvac: "HVAC Inspection",
  foundation: "Foundation Inspection",
};
