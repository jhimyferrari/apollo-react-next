export interface CategoryResource {
  id: string;
  number: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreCategoryRequest {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string | null;
}
