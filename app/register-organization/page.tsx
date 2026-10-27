import type { Metadata } from "next";
import { RegisterOrgForm } from "@/features/auth/components/register-org-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cadastrar Organização | Apollo System",
  description: "Crie uma nova conta empresarial no Apollo System",
};

export default function RegisterOrganizationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl shadow-md">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight">Apollo System</span>
        </div>

        <Card className="border-border shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Cadastre sua Empresa
            </CardTitle>
            <CardDescription>
              Inicie a operação da sua organização no Apollo System com ambiente isolado e seguro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterOrgForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
