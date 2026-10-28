export interface BrandResource {
  id: string;
  number: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreBrandRequest {
  name: string;
  description?: string | null;
}

export interface UpdateBrandRequest {
  name: string;
  description?: string | null;
}
