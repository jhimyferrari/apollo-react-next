"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import { useBrands } from "@/features/brands/hooks/use-brands";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { maskNCM, onlyDigits, maskPrice, maskStock } from "@/lib/masks";
import { calculateDiff } from "@/lib/diff";
import { applyApiValidationErrors, parseApiError } from "@/lib/api/errors";
import type {
  ProductResource,
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

  // Busca lista de marcas e categorias para os seletores
  const { data: brandsData } = useBrands(1);
  const { data: categoriesData } = useCategories(1);

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];

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
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
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

  const ncmValue = watch("ncm");
  const selectedCategories = watch("category_ids") || [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (formData: ProductFormData) => {
    // Normaliza números sem perdas
    const costNum = Number(formData.cost_price.replace(",", "."));
    const saleNum = Number(formData.sale_price.replace(",", "."));
    const stockNum = formData.stock_quantity
      ? Number(formData.stock_quantity.replace(",", "."))
      : null;

    const payloadCategories =
      formData.category_ids && formData.category_ids.length > 0
        ? formData.category_ids.map((id) => ({ id }))
        : null;

    if (isEditing && initialData) {
      // Cria objeto normalizado da versão atual e compara com a original
      // Não inclui stock_quantity pois estoque não pode ser atualizado via update de produto
      const currentPayload: UpdateProductRequest = {
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
        name: initialData.name,
        description: initialData.description || null,
        unit: initialData.unit,
        cost_price: Number(defaultCostPrice.replace(",", ".")),
        sale_price: Number(defaultSalePrice.replace(",", ".")),
        ncm: initialData.ncm?.code || null,
        ean: initialData.ean || null,
        brand_id: initialData.brand?.id || null,
        categories: initialData.categories?.map((c) => ({ id: c.id })) || null,
      };

      // REGRA: Telas de edição enviam apenas o que mudou (PATCH com diffs)
      const diff = calculateDiff(originalPayload, currentPayload);

      // No OpenAPI, UpdateProductRequest tem [name, unit, cost_price, sale_price] como required
      // Garantimos que os campos required do schema da rota continuem coerentes
      diff.name = currentPayload.name;
      diff.unit = currentPayload.unit;
      diff.cost_price = currentPayload.cost_price;
      diff.sale_price = currentPayload.sale_price;
      delete (diff as Record<string, unknown>).stock_quantity;

      try {
        await updateMutation.mutateAsync({ id: initialData.id, diff });
        router.push("/products");
      } catch (err) {
        const parsed = parseApiError(err);
        if (parsed.isValidationError) {
          applyApiValidationErrors(parsed, setError);
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
          applyApiValidationErrors(parsed, setError);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl" noValidate>
      {/* Dados Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              value={watch("cost_price") || ""}
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
              value={watch("sale_price") || ""}
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
                value={watch("stock_quantity") || ""}
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
              <Select
                value={field.value || "none"}
                onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="brand_id">
                  <SelectValue placeholder="Selecione uma marca..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma marca vinculada</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError error={errors.brand_id} />
        </div>

        {/* Categorias */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Categorias</Label>
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 italic">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => {
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
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
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
