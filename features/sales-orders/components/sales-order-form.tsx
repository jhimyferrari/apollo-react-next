"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Save, Plus, Trash2, ShoppingCart } from "lucide-react";
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
import { salesOrderSchema, type SalesOrderFormData } from "../schemas/sales-order.schema";
import { useCreateSalesOrder } from "../hooks/use-sales-orders";
import { useClients } from "@/features/clients/hooks/use-clients";
import { useSellers } from "@/features/sellers/hooks/use-sellers";
import { useProducts } from "@/features/products/hooks/use-products";
import { parseApiError, applyApiValidationErrors } from "@/lib/api/errors";

export function SalesOrderForm() {
  const router = useRouter();
  const createMutation = useCreateSalesOrder();

  const { data: clientsData, isLoading: isLoadingClients } = useClients(1);
  const { data: sellersData, isLoading: isLoadingSellers } = useSellers(1);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(1);

  const clients = clientsData?.data || [];
  const sellers = sellersData?.data || [];
  const products = productsData?.data || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      client_id: "",
      seller_id: "",
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
        typeof prod.sale_price === "object" && prod.sale_price !== null
          ? String((prod.sale_price as Record<string, unknown>).amount || "0")
          : String(prod.sale_price || "0");

      setValue(`items.${index}.unit_price`, priceStr);
    }
  };

  const onSubmit = async (data: SalesOrderFormData) => {
    try {
      const payload = {
        client_id: data.client_id,
        seller_id: data.seller_id,
        items: data.items.map((it, idx) => ({
          product_id: it.product_id,
          number: idx + 1,
          quantity: Number(it.quantity.replace(",", ".")),
        })),
      };

      const res = await createMutation.mutateAsync(payload);
      if (res?.data?.id) {
        router.push(`/sales-orders/${res.data.id}`);
      } else {
        router.push("/sales-orders");
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
      {/* Dados do Cabeçalho do Pedido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-lg border border-border bg-card">
        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="client_id" className="text-sm font-medium">
            Cliente <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("client_id")}
            onValueChange={(val) =>
              setValue("client_id", val, { shouldValidate: true })
            }
            disabled={isLoadingClients || isSubmitting}
          >
            <SelectTrigger id="client_id">
              <SelectValue placeholder="Selecione o cliente comprador" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.legal_name} ({c.trade_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError error={errors.client_id} />
        </div>

        {/* Vendedor */}
        <div className="space-y-2">
          <Label htmlFor="seller_id" className="text-sm font-medium">
            Vendedor Responsável <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("seller_id")}
            onValueChange={(val) =>
              setValue("seller_id", val, { shouldValidate: true })
            }
            disabled={isLoadingSellers || isSubmitting}
          >
            <SelectTrigger id="seller_id">
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent>
              {sellers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.trade_name} ({s.legal_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError error={errors.seller_id} />
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Itens do Pedido de Venda
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecione os produtos e as quantidades vendidas (preços e subtotais com até 4 casas decimais)
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
            const itemProduct = products.find(
              (p) => p.id === watchedItems[index]?.product_id
            );
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

                  {/* Preço Unitário (Visualização R$) */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Preço Unit.
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

      {/* Resumo do Pedido e Botão Salvar */}
      <div className="p-6 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Valor Total do Pedido
          </span>
          <span className="text-2xl font-bold text-foreground tabular-nums">
            <MoneyDisplay value={calculatedTotal} />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" type="button" disabled={isSubmitting}>
            <Link href="/sales-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Pedido...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Pedido de Venda
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
