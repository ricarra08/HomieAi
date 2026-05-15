import "server-only";

const GEOAPIFY_BASE = "https://api.geoapify.com/v1/geocode/autocomplete";

export interface AutocompleteAddress {
  formattedAddress: string;
  addressLine: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  county: string;
  country: string;
}

export async function searchAddresses(
  query: string,
  options?: { stateCode?: string; signal?: AbortSignal }
): Promise<AutocompleteAddress[]> {
  if (query.length < 3) return [];

  const key = process.env.GEOAPIFY_KEY;
  if (!key) {
    console.error("GEOAPIFY_KEY not configured");
    return [];
  }

  // Geoapify's Autocomplete API doesn't support a state filter — only
  // countrycode, rect, circle, and place. To bias results to a state, we
  // append the state code to the query text, then filter the response.
  // Oversample (limit=10) when filtering to survive dropouts; otherwise 5.
  const stateCodeUpper = options?.stateCode?.toUpperCase();
  const queryText = stateCodeUpper && !query.toUpperCase().includes(stateCodeUpper)
    ? `${query}, ${stateCodeUpper}`
    : query;

  const params = new URLSearchParams({
    text: queryText,
    filter: "countrycode:us",
    format: "json",
    limit: stateCodeUpper ? "10" : "5",
    apiKey: key,
  });

  const res = await fetch(`${GEOAPIFY_BASE}?${params}`, {
    signal: options?.signal,
  });
  if (!res.ok) return [];

  const data = await res.json();
  const results: AutocompleteAddress[] = (data.results ?? []).map((r: Record<string, string>) => ({
    formattedAddress: r.formatted ?? "",
    addressLine: r.address_line1 ?? "",
    city: r.city ?? "",
    state: r.state ?? "",
    stateCode: r.state_code ?? "",
    postalCode: r.postcode ?? "",
    county: r.county ?? "",
    country: r.country ?? "",
  }));

  const filtered = stateCodeUpper
    ? results.filter((r) => r.stateCode.toUpperCase() === stateCodeUpper)
    : results;

  return filtered.slice(0, 5);
}
