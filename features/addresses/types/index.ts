export interface AddressResource {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string | null;
  cep: string;
  city_ibge_code: string | number;
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
