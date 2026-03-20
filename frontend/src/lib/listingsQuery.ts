import type { GetListingsParams } from "@workspace/api-client-react";

/** Chave sessionStorage entre Home (busca) e página /imoveis */
export const LISTINGS_FILTER_SESSION_KEY = "aaagronegocio:listingsFilters";

export function listingsParamsFromSearch(search: string): GetListingsParams {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const num = (k: string): number | undefined => {
    const v = sp.get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const str = (k: string) => {
    const v = sp.get(k);
    return v && v.length > 0 ? v : undefined;
  };
  const sort = str("sortBy") as GetListingsParams["sortBy"] | undefined;
  const allowed: GetListingsParams["sortBy"][] = [
    "featured",
    "newest",
    "price_asc",
    "price_desc",
    "area_asc",
    "area_desc",
  ];
  return {
    page: Math.max(1, num("page") ?? 1),
    limit: Math.min(50, Math.max(1, num("limit") ?? 12)),
    sortBy: sort && allowed.includes(sort) ? sort : "featured",
    search: str("search"),
    state: str("state"),
    city: str("city"),
    country: str("country"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minArea: num("minArea"),
    maxArea: num("maxArea"),
    propertyType: str("propertyType"),
    aptitude: str("aptitude"),
    hasWater: sp.get("hasWater") === "true" ? true : undefined,
    hasIrrigation: sp.get("hasIrrigation") === "true" ? true : undefined,
  };
}

export function listingsParamsToSearch(params: GetListingsParams): string {
  const sp = new URLSearchParams();
  const set = (k: string, v: string | number | boolean | undefined | null) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  };
  set("page", params.page);
  set("limit", params.limit);
  set("sortBy", params.sortBy);
  set("search", params.search);
  set("state", params.state);
  set("city", params.city);
  set("country", params.country);
  set("minPrice", params.minPrice);
  set("maxPrice", params.maxPrice);
  set("minArea", params.minArea);
  set("maxArea", params.maxArea);
  set("propertyType", params.propertyType);
  set("aptitude", params.aptitude);
  if (params.hasWater === true) sp.set("hasWater", "true");
  if (params.hasIrrigation === true) sp.set("hasIrrigation", "true");
  return sp.toString();
}
