import { z } from "zod";

const numOrNull = z.number().nullable();
const boolOrNull = z.boolean().nullable();
const strOrNull = z.string().nullable();

export const propertySnapshotSchema = z.object({
  property: z.object({
    beds: numOrNull,
    baths: numOrNull,
    sqft_living: numOrNull,
    sqft_lot: numOrNull,
    year_built: numOrNull,
    effective_year_built: numOrNull,
    stories: numOrNull,
    garage_spaces: numOrNull,
    pool: boolOrNull,
    hoa: boolOrNull,
    waterfront: boolOrNull,
    cul_de_sac: boolOrNull,
    corner_lot: boolOrNull,
    gated: boolOrNull,
    adu: boolOrNull,
    zoning: strOrNull,
    last_sale_price: numOrNull,
    last_sale_date: strOrNull,
    assessed_value: numOrNull,
    tax_year: numOrNull,
    kitchen_update_level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).nullable(),
    bath_update_level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).nullable(),
    roof_age_years: numOrNull,
    hvac_age_years: numOrNull,
  }),
  spatial: z.object({
    school_score: numOrNull,
    walkability: numOrNull,
    flood_zone: strOrNull,
    distance_to_water_miles: numOrNull,
    distance_to_job_center_miles: numOrNull,
    crime_index_zscore: numOrNull,
  }),
  comps: z.array(z.object({
    address: z.string(),
    sale_price: z.number(),
    sale_date: z.string(),
    // Nullable: a comp with only price+date is still useful, but missing facts must stay
    // null in the cached snapshot — backfilled zeros would poison future model fitting.
    beds: numOrNull,
    baths: numOrNull,
    sqft: numOrNull,
    distance_miles: numOrNull,
  })),
  neighborhood_signals: z.object({
    permit_count_trend: numOrNull,
    permit_value_trend: numOrNull,
    rezoning_announcements: numOrNull,
    infrastructure_announcements: numOrNull,
    school_trend: numOrNull,
    crime_trend: numOrNull,
    rent_growth_vs_metro: numOrNull,
    investor_share: numOrNull,
    flip_intensity: numOrNull,
    retail_quality_score: numOrNull,
    dom_compression: numOrNull,
    sale_to_list_improvement: numOrNull,
    income_growth: numOrNull,
    educational_attainment_shift: numOrNull,
  }),
  macro_snapshot: z.object({
    mortgage_rate_30y: numOrNull,
    cpi_yoy: numOrNull,
    metro_unemployment: numOrNull,
    metro_hpi_yoy: numOrNull,
    metro_inventory_months: numOrNull,
    metro_dom_median: numOrNull,
    metro_median_price: numOrNull,   // USD; metro-level median sale price (ZHVI / Redfin / Realtor)
  }),
  source_quality: z.object({
    sources_used: z.array(z.string()),
    completeness_score: z.number().min(0).max(1),
    notes: z.string(),
  }),
  explanation: z.string(),
});

export type PropertySnapshot = z.infer<typeof propertySnapshotSchema>;

export interface SavedHomeInput {
  address: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: string | null;
}

export interface DataProvider {
  name: string;
  fetchSnapshot(input: { address: string; savedHome: SavedHomeInput }): Promise<PropertySnapshot>;
}

export function normalizeAddress(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "")
    .trim();
}
