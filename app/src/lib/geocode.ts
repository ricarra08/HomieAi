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

  const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    text: query,
    filter: "countrycode:us",
    format: "json",
    limit: "5",
    apiKey: key,
  });

  if (options?.stateCode) {
    params.set("filter", `countrycode:us,state:${options.stateCode}`);
  }

  const res = await fetch(`${GEOAPIFY_BASE}?${params}`, {
    signal: options?.signal,
  });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? []).map((r: Record<string, string>) => ({
    formattedAddress: r.formatted ?? "",
    addressLine: r.address_line1 ?? "",
    city: r.city ?? "",
    state: r.state ?? "",
    stateCode: r.state_code ?? "",
    postalCode: r.postcode ?? "",
    county: r.county ?? "",
    country: r.country ?? "",
  }));
}
