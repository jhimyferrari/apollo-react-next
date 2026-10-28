import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShieldCheck, BarChart3, Layers, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Entrar | Apollo System",
  description: "Acesse sua conta no Apollo System",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Coluna da esquerda: Branding & Benefícios (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white p-12 flex-col justify-between border-r border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              A
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">Apollo System</span>
              <span className="block text-xs text-zinc-400">
                Gestão Simplificada para Empresas Brasileiras
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
            Controle total de produtos, pedidos e parceiros em um só lugar.
          </h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Plataforma multi-tenant desenvolvida para empresas brasileiras, com suporte nativo a regras tributárias (NCM), pedidos de compra e venda e integração financeira.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  Gestão Ágil de Pedidos
                </h4>
                <p className="text-xs text-zinc-400">
                  Confirmação, cancelamento e reabertura com detecção inteligente de preços desatualizados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  Estoque & Precificação Segura
                </h4>
                <p className="text-xs text-zinc-400">
                  Campos monetários de alta precisão formatados em BRL sem perdas decimais.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  Segurança Multi-Tenant
                </h4>
                <p className="text-xs text-zinc-400">
                  Isolamento rigoroso de dados por organização e controle granular de permissões.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500 flex items-center justify-between border-t border-zinc-900 pt-6">
          <span>Apollo System &copy; {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Conexão Criptografada
          </span>
        </div>
      </div>

      {/* Coluna da direita: Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg">
              A
            </div>
            <span className="text-xl font-bold tracking-tight">Apollo System</span>
          </div>

          <Card className="border-border shadow-xl shadow-black/5 bg-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Entrar no Sistema
              </CardTitle>
              <CardDescription>
                Informe o documento da sua empresa e suas credenciais de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
