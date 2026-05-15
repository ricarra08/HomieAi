import OpenAI from "openai";
import {
  type DataProvider,
  type PropertySnapshot,
  type SavedHomeInput,
  propertySnapshotSchema,
} from "./types";

const MODEL = "gpt-4o";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function detectFloridaCounty(address: string): string | null {
  const upper = address.toUpperCase();
  // Address heuristic: comma-separated parts often look like "..., Orlando, FL 32825, ..."
  // We don't have county directly; map city → county for the common FL metros.
  const cityToCounty: Array<[RegExp, string]> = [
    [/\bORLANDO\b|\bAPOPKA\b|\bWINTER PARK\b|\bOCOEE\b/, "Orange"],
    [/\bMIAMI\b|\bHIALEAH\b|\bCORAL GABLES\b|\bHOMESTEAD\b/, "Miami-Dade"],
    [/\bFORT LAUDERDALE\b|\bHOLLYWOOD\b|\bPOMPANO\b|\bCORAL SPRINGS\b/, "Broward"],
    [/\bWEST PALM BEACH\b|\bBOCA RATON\b|\bDELRAY\b|\bJUPITER\b/, "Palm Beach"],
    [/\bTAMPA\b|\bBRANDON\b|\bPLANT CITY\b/, "Hillsborough"],
    [/\bST\.? PETERSBURG\b|\bCLEARWATER\b|\bLARGO\b/, "Pinellas"],
    [/\bJACKSONVILLE\b/, "Duval"],
    [/\bFORT MYERS\b|\bCAPE CORAL\b|\bBONITA SPRINGS\b/, "Lee"],
    [/\bLAKELAND\b|\bWINTER HAVEN\b|\bDAVENPORT\b/, "Polk"],
    [/\bSARASOTA\b|\bVENICE\b|\bNORTH PORT\b/, "Sarasota"],
    [/\bKISSIMMEE\b|\bST\.? CLOUD\b/, "Osceola"],
    [/\bGAINESVILLE\b/, "Alachua"],
    [/\bTALLAHASSEE\b/, "Leon"],
    [/\bPENSACOLA\b/, "Escambia"],
  ];
  for (const [re, county] of cityToCounty) {
    if (re.test(upper)) return county;
  }
  return null;
}

const FL_SOURCE_DIRECTORY = `
FLORIDA — authoritative free sources, in priority order:

For property facts (sqft, year built, lot size, last sale, assessed value, exemptions, building details):
- Orange County (Orlando area): https://ocpaweb.ocpafl.org/  (also: ocpafl.org)
- Miami-Dade: https://www.miamidade.gov/Apps/PA/propertysearch/
- Broward: https://bcpa.net/
- Palm Beach: https://www.pbcgov.com/papa/
- Hillsborough (Tampa): https://hcpafl.org/
- Pinellas (St. Pete/Clearwater): https://pcpao.gov/
- Duval (Jacksonville): https://paopropertysearch.coj.net/
- Lee (Fort Myers/Cape Coral): https://leepa.org/
- Polk: https://polkpa.org/
- Sarasota: https://www.sc-pa.com/
- Osceola (Kissimmee): https://ira.osceola.org/
- Other FL counties: search "<county name> property appraiser" — every county has a public site.

For property tax dollars and millage rate:
- Search the County Tax Collector site OR the Property Appraiser's TRIM notice / tax estimator.
- Orange: https://www.octaxcol.com/
- Most counties expose a tax estimator on the appraiser site that returns annual property tax for a given assessed value.

For deed / sale history when not on the appraiser site: <county> Clerk of Court → Official Records search.

For CDD (Community Development District) annual assessment in newer FL master-planned communities:
- Search "<community name> CDD bond" or check the property's tax bill non-ad-valorem section.

For HOA dues:
- These are NOT in public records. Check the active Zillow/Realtor/Redfin listing if the home is currently for sale.
- If unavailable, return null. Do not estimate.
`;

const NATIONAL_SOURCE_DIRECTORY = `
NATIONAL — for macro and metro signals:
- Mortgage rate 30y: Freddie Mac PMMS (https://www.freddiemac.com/pmms) — use the most recent weekly value.
- CPI YoY: BLS (https://www.bls.gov/cpi/) — most recent monthly all-items YoY.
- Metro unemployment: BLS LAUS for the MSA the address belongs to.
- Metro HPI YoY: FHFA HPI quarterly, or Case-Shiller for major metros, or Zillow Home Value Index (ZHVI).
- Metro inventory months / DOM: Realtor.com or Redfin metro market data pages.
- Metro migration / population growth: U.S. Census Bureau ACS or recent metro population estimates.

For property facts outside Florida: search "<county> property appraiser" or "<county> assessor". Most US counties publish parcel data online.
`;

function buildPrompt(address: string, savedHome: SavedHomeInput): string {
  const hints: string[] = [];
  if (savedHome.price) hints.push(`listed/anchor price: $${savedHome.price.toLocaleString()}`);
  if (savedHome.beds) hints.push(`${savedHome.beds} bed`);
  if (savedHome.baths) hints.push(`${savedHome.baths} bath`);
  if (savedHome.sqft) hints.push(`${savedHome.sqft} sqft`);

  const flCounty = detectFloridaCounty(address);
  const countyHint = flCounty
    ? `This address appears to be in ${flCounty} County, Florida. START with that county's Property Appraiser site (see Florida sources below). Search by street address or owner name.`
    : "";

  return `You are gathering data for a home valuation model. Use the web_search tool to look up real, recent information about the property and its market. Do NOT invent values; use null when uncertain. Cite every source you use in source_quality.sources_used (full URLs).

Property address: ${address}
${hints.length ? `User-provided hints: ${hints.join(", ")}` : ""}
${countyHint}

DATA SOURCING PRIORITY:
1. Public county property appraiser → ground-truth sqft, year built, lot size, last sale, assessed value (free, authoritative).
2. County tax collector → annual property tax dollars, millage rate.
3. Zillow/Redfin/Realtor only when the home is an active or recent listing (do not invent if not found).
4. Government statistical sources (Freddie Mac, BLS, FHFA, Census) for macro/metro fields — NOT consumer real-estate sites for macro.

${FL_SOURCE_DIRECTORY}
${NATIONAL_SOURCE_DIRECTORY}

CRITICAL UNIT RULES — apply EVERY time:
- Any field labeled "_yoy" or describing growth/appreciation MUST be returned as a DECIMAL FRACTION, never as percentage points.
  Examples: 4% appreciation → 0.04, NOT 4. 2.5% inflation → 0.025, NOT 2.5. -1% trend → -0.01.
- Mortgage rate stays in percent (e.g., 6.5 means 6.5%, NOT 0.065).
- Unemployment stays in percent (e.g., 3.5 means 3.5%).
- All other "trend" / "share" / "compression" fields are decimal fractions in roughly [-1, 1] (e.g., 0.08 means an 8% improvement).
- Counts (rezoning_announcements, infrastructure_announcements) are small non-negative integers.

Return a single JSON object exactly matching this TypeScript shape. Use null for unknown fields. Do not wrap in markdown.

{
  "property": {
    "beds": number|null, "baths": number|null,
    "sqft_living": number|null, "sqft_lot": number|null,
    "year_built": number|null, "effective_year_built": number|null,
    "stories": number|null, "garage_spaces": number|null,
    "pool": boolean|null, "hoa": boolean|null, "waterfront": boolean|null,
    "cul_de_sac": boolean|null, "corner_lot": boolean|null, "gated": boolean|null,
    "adu": boolean|null, "zoning": string|null,
    "last_sale_price": number|null, "last_sale_date": "YYYY-MM-DD"|null,
    "assessed_value": number|null, "tax_year": number|null,
    "kitchen_update_level": 0|1|2|3|null,
    "bath_update_level": 0|1|2|3|null,
    "roof_age_years": number|null, "hvac_age_years": number|null
  },
  "spatial": {
    "school_score": number_0_to_10|null,
    "walkability": number_0_to_100|null,
    "flood_zone": string|null,
    "distance_to_water_miles": number|null,
    "distance_to_job_center_miles": number|null,
    "crime_index_zscore": number|null
  },
  "comps": [
    { "address": string, "sale_price": number, "sale_date": "YYYY-MM-DD",
      "beds": number, "baths": number, "sqft": number, "distance_miles": number }
  ],
  "neighborhood_signals": {
    "permit_count_trend": number_yoy_pct|null,
    "permit_value_trend": number_yoy_pct|null,
    "rezoning_announcements": number|null,
    "infrastructure_announcements": number|null,
    "school_trend": number|null,
    "crime_trend": number|null,
    "rent_growth_vs_metro": number|null,
    "investor_share": number_0_to_1|null,
    "flip_intensity": number|null,
    "retail_quality_score": number|null,
    "dom_compression": number|null,
    "sale_to_list_improvement": number|null,
    "income_growth": number_yoy_pct|null,
    "educational_attainment_shift": number|null
  },
  "macro_snapshot": {
    "mortgage_rate_30y": number,
    "cpi_yoy": number,
    "metro_unemployment": number,
    "metro_hpi_yoy": number,
    "metro_inventory_months": number,
    "metro_dom_median": number
  },
  "source_quality": {
    "sources_used": [string],
    "completeness_score": number_0_to_1,
    "notes": string
  },
  "explanation": "2-3 sentences in plain English describing what most drives this home's projected value. Mention macro headwinds/tailwinds, neighborhood regime if notable, and any large data gaps."
}

Per-field sourcing guidance:
- sqft_living / sqft_lot / year_built / effective_year_built / stories / garage_spaces / pool / waterfront / zoning / assessed_value / tax_year / last_sale_price / last_sale_date: pull from the county property appraiser. These should be authoritative numbers, not estimates.
- kitchen_update_level / bath_update_level: 0=dated, 1=partial, 2=modern, 3=premium. Estimate from active listing photos/descriptions if available; null otherwise.
- roof_age_years / hvac_age_years: derive from county permit history if accessible, or from the listing remarks. Null when truly unknown — do not guess.
- completeness_score: honest self-assessment of how much you actually found in authoritative sources vs estimated. 1.0 = every property field traced to the county appraiser; 0.3 = mostly inferred from priors.
- macro_snapshot: use the most recent monthly data for the metro this address sits in. Pull from the National sources directory above (Freddie Mac, BLS, FHFA, Census, ZHVI). If a metro-specific value isn't available, use the most recent US-national value and note in source_quality.notes.
- comps: 3-6 recent (within ~12 months) sales within ~1 mile if available. For Florida, the county appraiser's recent-sales nearby tool is the canonical source. Empty array is acceptable when no comps found.
- sources_used: include every URL you actually visited (county appraiser, Freddie Mac, BLS, listing pages, etc.). This is what we use to audit data quality.`;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export const openaiWebSearchProvider: DataProvider = {
  name: "openai_web_search",
  async fetchSnapshot({ address, savedHome }) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY env var is not set");
    }
    const openai = getOpenAI();
    const prompt = buildPrompt(address, savedHome);

    let response;
    try {
      response = await openai.responses.create({
        model: MODEL,
        tools: [{ type: "web_search_preview" }],
        input: prompt,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[openai-websearch] responses.create failed:", detail);
      // Retry once with the newer "web_search" tool name in case the model + SDK pair prefers it.
      try {
        response = await openai.responses.create({
          model: MODEL,
          tools: [{ type: "web_search" }],
          input: prompt,
        });
      } catch (err2) {
        const detail2 = err2 instanceof Error ? err2.message : String(err2);
        console.error("[openai-websearch] retry with web_search also failed:", detail2);
        throw new Error(`OpenAI Responses API call failed: ${detail}`);
      }
    }

    const text = response.output_text;
    if (!text) {
      console.error(
        "[openai-websearch] empty output_text. Response output preview:",
        JSON.stringify(response.output ?? response).slice(0, 800),
      );
      throw new Error("Empty output_text from OpenAI Responses API");
    }

    let raw;
    try {
      raw = extractJson(text);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(
        "[openai-websearch] JSON extraction failed:",
        detail,
        "\nText preview:",
        text.slice(0, 800),
      );
      throw new Error(`Failed to extract JSON from response: ${detail}`);
    }

    const parsed = propertySnapshotSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "[openai-websearch] Zod validation failed:",
        parsed.error.issues.slice(0, 8),
        "\nRaw object keys:",
        Object.keys(raw as object),
      );
      throw new Error(
        `PropertySnapshot validation failed: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }

    return parsed.data as PropertySnapshot;
  },
};
