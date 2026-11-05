export interface UfResource {
  ibge_code: string;
  name: string;
  abbreviation: string;
}

export interface CityResource {
  ibge_code: string;
  name: string;
  uf_ibge_code: string;
  uf?: UfResource;
}

export interface AddressResource {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string | null;
  cep: string;
  city_ibge_code: string | number;
  city?: CityResource;
  is_default?: boolean;
}

export interface StoreAddressRequest {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string | null;
  cep: string;
  city_ibge_code: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string | null;
  cep?: string;
  city_ibge_code?: string;
  is_default?: boolean;
}
