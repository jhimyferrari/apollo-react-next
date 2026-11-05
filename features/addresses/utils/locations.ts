import locationsData from "../data/ibge-locations.json";
import type { AddressResource, CityResource, UfResource } from "../types";

interface LocationsJson {
  ufs: UfResource[];
  citiesByUf: Record<string, [string, string][]>;
}

const data = locationsData as unknown as LocationsJson;

export const UFS: UfResource[] = data.ufs;

const ufByCodeMap = new Map<string, UfResource>(
  UFS.map((uf) => [String(uf.ibge_code), uf])
);

const citiesCacheByUf = new Map<string, CityResource[]>();
const cityByIbgeMap = new Map<string, CityResource>();

export function getUfByIbgeCode(ufIbgeCode?: string | number | null): UfResource | undefined {
  if (!ufIbgeCode) return undefined;
  return ufByCodeMap.get(String(ufIbgeCode).trim());
}

export function getCitiesByUf(ufIbgeCode?: string | number | null): CityResource[] {
  if (!ufIbgeCode) return [];
  const key = String(ufIbgeCode).trim();

  const cached = citiesCacheByUf.get(key);
  if (cached) return cached;

  const tuples = data.citiesByUf[key] || [];
  const uf = ufByCodeMap.get(key);

  const cities: CityResource[] = tuples.map(([ibge_code, name]) => {
    const city: CityResource = {
      ibge_code,
      name,
      uf_ibge_code: key,
      uf,
    };
    cityByIbgeMap.set(ibge_code, city);
    return city;
  });

  citiesCacheByUf.set(key, cities);
  return cities;
}

export function getCityByIbgeCode(
  cityIbgeCode?: string | number | null
): CityResource | undefined {
  if (!cityIbgeCode) return undefined;
  const code = String(cityIbgeCode).trim();
  if (code.length < 2) return undefined;

  const cached = cityByIbgeMap.get(code);
  if (cached) return cached;

  const ufCode = code.slice(0, 2);
  getCitiesByUf(ufCode);
  return cityByIbgeMap.get(code);
}

export function resolveAddressUfIbgeCode(
  address?: AddressResource | null
): string {
  if (!address) return "";
  if (address.city?.uf?.ibge_code) {
    return String(address.city.uf.ibge_code);
  }
  if (address.city?.uf_ibge_code) {
    return String(address.city.uf_ibge_code);
  }
  const cityCode = String(address.city?.ibge_code || address.city_ibge_code || "").trim();
  if (cityCode.length >= 2) {
    const ufCode = cityCode.slice(0, 2);
    if (ufByCodeMap.has(ufCode)) {
      return ufCode;
    }
  }
  return "";
}

