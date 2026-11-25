"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/common/form-field-error";
import {
  productSchema,
  productUnits,
  type ProductFormData,
} from "../schemas/product.schema";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../hooks/use-products";
import { useBrandLookup, useCategoryLookup } from "@/features/lookups/hooks/use-lookups";
import { LookupCodeSelect } from "@/features/lookups/components/lookup-code-select";
import { lookupService } from "@/features/lookups/services/lookup.service";
import type {
  BrandLookupResource,
  CategoryLookupResource,
} from "@/features/lookups/types";
import { maskNCM, onlyDigits, maskPrice, maskStock } from "@/lib/masks";
import { calculateDiff } from "@/lib/diff";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";
import type {
  ProductResource,
  ProductStatus,
  ProductUnit,
  StoreProductRequest,
  UpdateProductRequest,
} from "../types";

interface ProductFormProps {
  initialData?: ProductResource;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // Busca lista de marcas e categorias via endpoints de lookup (/v1/lookups/*)
  const { data: brandsData, isLoading: isLoadingBrands } = useBrandLookup();
  const { data: categoriesData } = useCategoryLookup();

  const brands = brandsData?.data || [];
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData]
  );

  const [categoryCodeInput, setCategoryCodeInput] = useState("");
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);
  const [categoryCodeError, setCategoryCodeError] = useState<string | null>(null);
  const [extraCategories, setExtraCategories] = useState<CategoryLookupResource[]>([]);
  const categoryRequestIdRef = useRef(0);

  const mergedCategories = useMemo(() => {
    const existingIds = new Set(categories.map((c) => c.id));
    const extras = extraCategories.filter((c) => !existingIds.has(c.id));
    return extras.length > 0 ? [...categories, ...extras] : categories;
  }, [categories, extraCategories]);

  // Formata valores iniciais caso venham de objeto
  const defaultCostPrice = useMemo(() => {
    if (!initialData) return "";
    let raw = "";
    if (typeof initialData.cost_price === "object" && initialData.cost_price !== null) {
      raw = String((initialData.cost_price as Record<string, unknown>).amount || "");
    } else {
      raw = String(initialData.cost_price ?? "");
    }
    return maskPrice(raw);
  }, [initialData]);

  const defaultSalePrice = useMemo(() => {
    if (!initialData) return "";
    let raw = "";
    if (typeof initialData.sale_price === "object" && initialData.sale_price !== null) {
      raw = String((initialData.sale_price as Record<string, unknown>).amount || "");
    } else {
      raw = String(initialData.sale_price ?? "");
    }
    return maskPrice(raw);
  }, [initialData]);

  const defaultStock = useMemo(() => {
    if (!initialData || initialData.stock_quantity === null || initialData.stock_quantity === undefined)
      return "";
    let raw = "";
    if (typeof initialData.stock_quantity === "object" && initialData.stock_quantity !== null) {
      raw = String((initialData.stock_quantity as Record<string, unknown>).amount || "");
    } else {
      raw = String(initialData.stock_quantity);
    }
    return maskStock(raw);
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: initialData?.status
        ? (initialData.status as ProductStatus)
        : undefined,
      name: initialData?.name || "",
      description: initialData?.description || "",
      unit: (initialData?.unit as ProductUnit) || "un",
      cost_price: defaultCostPrice,
      sale_price: defaultSalePrice,
      stock_quantity: defaultStock,
      ncm: initialData?.ncm?.code ? maskNCM(initialData.ncm.code) : "",
      ean: initialData?.ean || "",
      brand_id: initialData?.brand?.id || "",
      category_ids: initialData?.categories?.map((c) => c.id) || [],
    },
  });

  const costPriceValue = useWatch({ control, name: "cost_price" });
  const salePriceValue = useWatch({ control, name: "sale_price" });
  const stockQuantityValue = useWatch({ control, name: "stock_quantity" });
  const ncmValue = useWatch({ control, name: "ncm" });
  const selectedCategories = useWatch({ control, name: "category_ids" }) || [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (formData: ProductFormData) => {
    // Normaliza números mantendo precisão exata aceita pelo backend (4 decimais para preços, 3 para estoque)
    const costNum = Number(Number(formData.cost_price.replace(",", ".")).toFixed(4));
    const saleNum = Number(Number(formData.sale_price.replace(",", ".")).toFixed(4));
    const stockNum = formData.stock_quantity
      ? Number(Number(formData.stock_quantity.replace(",", ".")).toFixed(3))
      : null;

    const payloadCategories =
      formData.category_ids && formData.category_ids.length > 0
        ? formData.category_ids.map((id) => ({ id }))
        : null;

    const productKnownFields = [
      "status",
      "name",
      "description",
      "unit",
      "cost_price",
      "sale_price",
      "stock_quantity",
      "ncm",
      "ean",
      "brand_id",
      "category_ids",
    ] as const;

    if (isEditing && initialData) {
      // Cria objeto normalizado da versão atual e compara com a original
      // Não inclui stock_quantity pois estoque não pode ser atualizado via update de produto
      const currentPayload: UpdateProductRequest = {
        status: formData.status || (initialData.status as ProductStatus),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        unit: formData.unit,
        cost_price: costNum,
        sale_price: saleNum,
        ncm: formData.ncm ? onlyDigits(formData.ncm) : null,
        ean: formData.ean ? onlyDigits(formData.ean) : null,
        brand_id: formData.brand_id || null,
        categories: payloadCategories,
      };

      const originalPayload: UpdateProductRequest = {
        status: initialData.status as ProductStatus,
        name: initialData.name,
        description: initialData.description || null,
        unit: initialData.unit,
        cost_price: Number(Number(defaultCostPrice.replace(",", ".")).toFixed(4)),
        sale_price: Number(Number(defaultSalePrice.replace(",", ".")).toFixed(4)),
        ncm: initialData.ncm?.code ? onlyDigits(initialData.ncm.code) : null,
        ean: initialData.ean ? onlyDigits(initialData.ean) : null,
        brand_id: initialData.brand?.id || null,
        categories:
          initialData.categories && initialData.categories.length > 0
            ? initialData.categories.map((c) => ({ id: c.id }))
            : null,
      };

      // REGRA: Telas de edição enviam apenas o que mudou (PATCH com diffs)
      const diff = calculateDiff(originalPayload, currentPayload);
      delete (diff as Record<string, unknown>).stock_quantity;

      if (Object.keys(diff).length === 0) {
        router.push("/products");
        return;
      }

      if (diff.cost_price !== undefined) {
        diff.cost_price = Number(diff.cost_price.toFixed(4));
      }
      if (diff.sale_price !== undefined) {
        diff.sale_price = Number(diff.sale_price.toFixed(4));
      }

      try {
        await updateMutation.mutateAsync({ id: initialData.id, diff });
        router.push("/products");
      } catch (err) {
        const parsed = parseApiError(err);
        if (parsed.isValidationError) {
          applyApiValidationErrors(parsed, setError, {
            knownFields: productKnownFields,
          });
        }
      }
    } else {
      // Modo Criação (POST)
      const storePayload: StoreProductRequest & { stock_quantity?: number | null } = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        unit: formData.unit,
        cost_price: costNum,
        sale_price: saleNum,
        stock_quantity: stockNum,
        ncm: formData.ncm ? onlyDigits(formData.ncm) : null,
        ean: formData.ean ? onlyDigits(formData.ean) : null,
        brand_id: formData.brand_id || null,
        categories: payloadCategories,
      };
      
      try {
        await createMutation.mutateAsync(storePayload);
        router.push("/products");
      } catch (err) {
        const parsed = parseApiError(err);
        if (parsed.isValidationError) {
          applyApiValidationErrors(parsed, setError, {
            knownFields: productKnownFields,
          });
        }
      }
    }
  };

  const toggleCategory = (catId: string) => {
    const current = new Set(selectedCategories);
    if (current.has(catId)) {
      current.delete(catId);
    } else {
      current.add(catId);
    }
    setValue("category_ids", Array.from(current), { shouldValidate: true });
  };

  const handleAddCategoryByCode = async () => {
    const trimmed = categoryCodeInput.trim();
    if (!trimmed) return;

    const num = Number(trimmed);
    if (!Number.isSafeInteger(num) || num < 1) {
      setCategoryCodeError("Código inválido para categoria.");
      return;
    }

    const reqId = ++categoryRequestIdRef.current;
    setIsSearchingCategory(true);
    setCategoryCodeError(null);

    try {
      const res = await lookupService.categoryByNumber(num);
      if (reqId !== categoryRequestIdRef.current) return;

      const found = res?.data;
      if (!found) {
        setCategoryCodeError(`Código ${num} não encontrado.`);
        return;
      }

      setExtraCategories((prev) =>
        prev.some((c) => c.id === found.id) ? prev : [...prev, found]
      );

      if (!selectedCategories.includes(found.id)) {
        setValue("category_ids", [...selectedCategories, found.id], {
          shouldValidate: true,
        });
      }

      setCategoryCodeInput("");
      setCategoryCodeError(null);
    } catch (err) {
      if (reqId !== categoryRequestIdRef.current) return;
      const parsed = parseApiError(err);
      if (parsed.statusCode === 404) {
        setCategoryCodeError(`Código ${num} não encontrado.`);
      } else {
        setCategoryCodeError(parsed.message);
      }
    } finally {
      if (reqId === categoryRequestIdRef.current) {
        setIsSearchingCategory(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl" noValidate>
      {/* Dados Principais */}
      <div
        className={`grid grid-cols-1 ${
          isEditing ? "md:grid-cols-4" : "md:grid-cols-3"
        } gap-6`}
      >
        {/* Nome do Produto (Obrigatório, max 45) */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome do Produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ex.: Parafuso Sextavado Aço 3/8"
            maxLength={45}
            {...register("name")}
            disabled={isSubmitting}
          />
          <FormFieldError error={errors.name} />
        </div>

        {/* Unidade de Medida */}
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-sm font-medium">
            Unidade <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {productUnits.map((u) => (
                    <SelectItem key={u} value={u} className="uppercase">
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError error={errors.unit} />
        </div>

        {/* Status do Produto (Exibido apenas em Modo de Edição / Update) */}
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status do Produto
            </Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value || "active"}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="discontinued">Descontinuado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError error={errors.status} />
          </div>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição Detalhada
        </Label>
        <Input
          id="description"
          placeholder="Características técnicas, especificações, dimensões..."
          {...register("description")}
          disabled={isSubmitting}
        />
        <FormFieldError error={errors.description} />
      </div>

      {/* Precificação e Estoque */}
      <div className="p-4 rounded-lg border border-border bg-card/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {isEditing ? "Precificação" : "Precificação e Estoque"}
          </h3>
          {isEditing && (
            <span className="text-[11px] text-muted-foreground italic">
              O estoque não pode ser alterado por aqui. Ajustes ocorrem via ordens de compra/venda.
            </span>
          )}
        </div>
        <div
          className={`grid grid-cols-1 ${
            isEditing ? "sm:grid-cols-2" : "sm:grid-cols-3"
          } gap-4`}
        >
          {/* Preço de Custo */}
          <div className="space-y-2">
            <Label htmlFor="cost_price" className="text-sm font-medium">
              Preço de Custo (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cost_price"
              type="text"
              placeholder="0,0000"
              value={costPriceValue || ""}
              onChange={(e) => {
                const masked = maskPrice(e.target.value);
                setValue("cost_price", masked, { shouldValidate: true });
              }}
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Apenas números e vírgula, até 4 casas decimais.
            </p>
            <FormFieldError error={errors.cost_price} />
          </div>

          {/* Preço de Venda */}
          <div className="space-y-2">
            <Label htmlFor="sale_price" className="text-sm font-medium">
              Preço de Venda (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sale_price"
              type="text"
              placeholder="0,0000"
              value={salePriceValue || ""}
              onChange={(e) => {
                const masked = maskPrice(e.target.value);
                setValue("sale_price", masked, { shouldValidate: true });
              }}
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Apenas números e vírgula, até 4 casas decimais.
            </p>
            <FormFieldError error={errors.sale_price} />
          </div>

          {/* Quantidade em Estoque - Oculto em modo de Edição */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className="text-sm font-medium">
                Estoque Inicial
              </Label>
              <Input
                id="stock_quantity"
                type="text"
                placeholder="0,000"
                value={stockQuantityValue || ""}
                onChange={(e) => {
                  const masked = maskStock(e.target.value);
                  setValue("stock_quantity", masked, { shouldValidate: true });
                }}
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Apenas números e vírgula decimal (ex.: 10 ou 2,500).
              </p>
              <FormFieldError error={errors.stock_quantity} />
            </div>
          )}
        </div>
      </div>

      {/* Informações Fiscais e Códigos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* NCM (8 dígitos) */}
        <div className="space-y-2">
          <Label htmlFor="ncm" className="text-sm font-medium">
            Código NCM (8 dígitos)
          </Label>
          <Input
            id="ncm"
            placeholder="0000.00.00"
            value={ncmValue || ""}
            onChange={(e) => {
              const masked = maskNCM(e.target.value);
              setValue("ncm", masked, { shouldValidate: true });
            }}
            disabled={isSubmitting}
          />
          <p className="text-[11px] text-muted-foreground">
            Classificação fiscal do produto no Mercosul.
          </p>
          <FormFieldError error={errors.ncm} />
        </div>

        {/* EAN (13 dígitos) */}
        <div className="space-y-2">
          <Label htmlFor="ean" className="text-sm font-medium">
            Código de Barras (EAN-13)
          </Label>
          <Input
            id="ean"
            placeholder="7890000000000"
            maxLength={13}
            {...register("ean")}
            disabled={isSubmitting}
          />
          <p className="text-[11px] text-muted-foreground">
            Código universal de 13 dígitos numéricos.
          </p>
          <FormFieldError error={errors.ean} />
        </div>
      </div>

      {/* Relacionamentos: Marcas e Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="brand_id" className="text-sm font-medium">
            Marca do Produto
          </Label>
          <Controller
            control={control}
            name="brand_id"
            render={({ field }) => (
              <LookupCodeSelect<BrandLookupResource>
                id="brand_id"
                value={field.value || ""}
                onValueChange={(val) => field.onChange(val)}
                options={brands}
                selectedFallback={
                  initialData?.brand
                    ? {
                        id: initialData.brand.id,
                        number: initialData.brand.number,
                        name: initialData.brand.name,
                      }
                    : null
                }
                lookupByNumber={(num) => lookupService.brandByNumber(num)}
                renderOptionLabel={(b) => `${b.number} - ${b.name}`}
                placeholder="Selecione uma marca..."
                emptyOption={{
                  value: "none",
                  label: "Nenhuma marca vinculada",
                }}
                resourceLabel="Marca"
                disabled={isSubmitting}
                isLoadingOptions={isLoadingBrands}
              />
            )}
          />
          <FormFieldError error={errors.brand_id} />
        </div>

        {/* Categorias */}
        <div className="space-y-2">
          <Label htmlFor="category_code_input" className="text-sm font-medium">
            Categorias
          </Label>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  id="category_code_input"
                  type="text"
                  inputMode="numeric"
                  value={categoryCodeInput}
                  onChange={(e) => {
                    setCategoryCodeInput(e.target.value.replace(/\D/g, ""));
                    setCategoryCodeError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleAddCategoryByCode();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      categoryRequestIdRef.current += 1;
                      setIsSearchingCategory(false);
                      setCategoryCodeInput("");
                      setCategoryCodeError(null);
                    }
                  }}
                  placeholder="Cód."
                  aria-label="Código da categoria"
                  aria-invalid={Boolean(categoryCodeError)}
                  disabled={isSubmitting || isSearchingCategory}
                  className={`w-24 font-mono text-sm ${
                    isSearchingCategory ? "pr-7" : ""
                  } ${
                    categoryCodeError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                {isSearchingCategory && (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  isSubmitting ||
                  isSearchingCategory ||
                  categoryCodeInput.trim() === ""
                }
                onClick={() => void handleAddCategoryByCode()}
              >
                Adicionar por código
              </Button>
            </div>
            {categoryCodeError && (
              <p className="text-xs text-destructive">{categoryCodeError}</p>
            )}
          </div>
          {mergedCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 italic">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {mergedCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-card text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {cat.number} - {cat.name}
                  </button>
                );
              })}
            </div>
          )}
          <FormFieldError error={errors.category_ids} />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button asChild variant="outline">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Lista
          </Link>
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Salvando Alterações..." : "Cadastrando Produto..."}
            </>
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Cadastrar Produto"
          )}
        </Button>
      </div>
    </form>
  );
}
