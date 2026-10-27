"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Save, Plus, Trash2, ShoppingBag } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { FormFieldError } from "@/components/common/form-field-error";
import { MoneyDisplay } from "@/components/common/money-display";
import {
  purchaseOrderSchema,
  type PurchaseOrderFormData,
} from "../schemas/purchase-order.schema";
import { useCreatePurchaseOrder } from "../hooks/use-purchase-orders";
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers";
import { useProducts } from "@/features/products/hooks/use-products";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";

export function PurchaseOrderForm() {
  const router = useRouter();
  const createMutation = useCreatePurchaseOrder();

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers(1);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(1);

  const suppliers = suppliersData?.data || [];
  const products = productsData?.data || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      items: [{ product_id: "", quantity: "1", unit_price: "0.0000" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items") || [];

  // Calcula o total ao vivo
  const calculatedTotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item.quantity?.replace(",", ".") || 0);
    const price = Number(item.unit_price?.replace(",", ".") || 0);
    return acc + qty * price;
  }, 0);

  const isSubmitting = createMutation.isPending;

  const handleProductChange = (index: number, productId: string) => {
    setValue(`items.${index}.product_id`, productId, { shouldValidate: true });

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const priceStr =
        typeof prod.cost_price === "object" && prod.cost_price !== null
          ? String((prod.cost_price as Record<string, unknown>).amount || "0")
          : String(prod.cost_price || "0");

      setValue(`items.${index}.unit_price`, priceStr);
    }
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      const payload = {
        supplier_id: data.supplier_id,
        items: data.items.map((it, idx) => ({
          product_id: it.product_id,
          number: idx + 1,
          quantity: Number(it.quantity.replace(",", ".")),
        })),
      };

      const res = await createMutation.mutateAsync(payload);
      if (res?.data?.id) {
        router.push(`/purchase-orders/${res.data.id}`);
      } else {
        router.push("/purchase-orders");
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.isValidationError) {
        applyApiValidationErrors(parsed, setError);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Fornecedor */}
      <div className="p-5 rounded-lg border border-border bg-card">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="supplier_id" className="text-sm font-medium">
            Fornecedor <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("supplier_id")}
            onValueChange={(val) =>
              setValue("supplier_id", val, { shouldValidate: true })
            }
            disabled={isLoadingSuppliers || isSubmitting}
          >
            <SelectTrigger id="supplier_id">
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.legal_name} ({s.trade_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError error={errors.supplier_id} />
        </div>
      </div>

      {/* Itens do Pedido de Compra */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Itens da Ordem de Compra
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecione os produtos e quantidades compradas (valores precisos com até 4 casas decimais)
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              append({ product_id: "", quantity: "1", unit_price: "0.0000" })
            }
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Adicionar Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const itemQty = Number(
              watchedItems[index]?.quantity?.replace(",", ".") || 0
            );
            const itemPrice = Number(
              watchedItems[index]?.unit_price?.replace(",", ".") || 0
            );
            const itemSubtotal = itemQty * itemPrice;

            return (
              <Card key={field.id} className="border border-border bg-card/60">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Número do item */}
                  <div className="md:col-span-1 flex items-center justify-center font-mono text-xs text-muted-foreground">
                    #{index + 1}
                  </div>

                  {/* Seleção de Produto */}
                  <div className="md:col-span-5 space-y-1">
                    <Label className="text-xs font-medium">Produto</Label>
                    <Select
                      value={watchedItems[index]?.product_id || ""}
                      onValueChange={(val) => handleProductChange(index, val)}
                      disabled={isLoadingProducts || isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantidade */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium">Qtd</Label>
                    <Input
                      placeholder="1"
                      {...register(`items.${index}.quantity` as const)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Preço de Custo (Visualização R$) */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Custo Unit.
                    </Label>
                    <div className="h-9 px-3 flex items-center text-xs font-medium bg-muted/40 rounded-md border border-border">
                      <MoneyDisplay value={itemPrice} />
                    </div>
                  </div>

                  {/* Subtotal e Remover */}
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Subtotal
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        <MoneyDisplay value={itemSubtotal} />
                      </span>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <FormFieldError error={errors.items?.root || errors.items} />
      </div>

      {/* Resumo e Botão Salvar */}
      <div className="p-6 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Valor Total da Compra
          </span>
          <span className="text-2xl font-bold text-foreground tabular-nums">
            <MoneyDisplay value={calculatedTotal} />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" type="button" disabled={isSubmitting}>
            <Link href="/purchase-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Ordem...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Emitir Ordem de Compra
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
