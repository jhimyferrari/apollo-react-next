export interface CategoryResource {
  id: string;
  number: number;
  name: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}
