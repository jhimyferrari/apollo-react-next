# Apollo System - Frontend

Frontend do **Apollo System**, um sistema ERP moderno para gestão empresarial de pequenas e médias empresas brasileiras com suporte **multi-tenant**, controle de acesso granular (**RBAC**), catálogo de produtos, controle de estoque e ciclo completo de **Pedidos de Venda e Compra**, desenvolvido com **Next.js 16 (App Router)**, **React 19**, **TypeScript** e **Tailwind CSS v4**.

---

## 🚀 Tecnologias e Padrões Principais

* **Framework**: Next.js 16 (App Router com Turbopack, Route Handlers BFF e `proxy.ts`)
* **Reatividade**: React 19 + TypeScript 5
* **Segurança & Sessão (BFF)**: Proxy reverso same-origin em `/api/*` com cookies `HttpOnly` cifrados via AES-256-GCM (`node:crypto`), proteção anti-CSRF (`SameSite=Lax` + `Origin` + `X-Requested-With`), hidratação SSR via `/v1/me` e cabeçalhos de segurança (`CSP`, `X-Frame-Options`, `Referrer-Policy`, `HSTS`)
* **Design & Estilo**: Tailwind CSS v4 + Componentes acessíveis baseados em shadcn/ui e Radix UI Headless
* **Formulários & Validação**: `react-hook-form` + `zod` + `@hookform/resolvers`
* **Gerenciamento de Estado de Servidor**: `@tanstack/react-query` v5
* **Notificações**: `sonner`
* **Arquitetura**: Feature-Driven / Modular por Domínio (`features/*`), com atualizações parciais determinísticas via `calculateDiff` (`PATCH`)
* **Controle de Acesso (RBAC)**: Guardas declarativos (`<Can>`, `<PermissionGuard>`, `usePermissions`) sincronizados com as 36 permissões atômicas do backend (sendo as 4 de `user.*` reservadas a administradores e 32 atribuíveis a operadores)
* **Endereços IBGE**: Seleção em cascata de **Estado (UF) $\rightarrow$ Cidade** em tempo $O(1)$ usando base oficial local do IBGE (27 UFs e 5.570 municípios), enviando `city_ibge_code` de forma transparente para a API
* **Moedas, Máscaras & Datas**: `Intl.NumberFormat` (BRL até 4 casas decimais com suporte ao contrato `Money` `{ amount, currency, formatted }` e strings/números via `formatBRL` e `MoneyDisplay`) e `Intl.DateTimeFormat` (`pt-BR`), além de máscaras puras para CPF, CNPJ numérico/alfanumérico, CEP, NCM, Telefone, Preços e Estoque

---

## 📋 Pré-requisitos

* **Node.js**: Versão 20.x ou superior recomendada
* **npm**: Versão 10.x ou superior (ou gerenciador compatível)
* **API Backend**: Servidor Laravel do Apollo rodando (por padrão em `http://localhost:8000/api`)

---

## ⚙️ Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
# URL interna da API Laravel do Apollo (server-only, nunca exposta ao navegador)
API_INTERNAL_URL=http://localhost:8000/api

# Origem canônica do front-end para validação anti-CSRF no BFF
APP_ORIGIN=http://localhost:3000

# Chave secreta server-only (>= 32 bytes / 64 hex chars) para cifragem AES-256-GCM dos cookies HttpOnly
BFF_COOKIE_SECRET=gere-uma-chave-hex-de-64-caracteres

# Tempo de vida padrão do cookie de sessão do BFF em segundos (padrão: 28800 = 8h)
SESSION_MAX_AGE_SECONDS=28800
```

---

## 🛠️ Como Instalar e Rodar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

3. **Gerar build de produção**:
   ```bash
   npm run build
   ```

4. **Executar build de produção**:
   ```bash
   npm run start
   ```

5. **Checagem de Lint**:
   ```bash
   npm run lint
   ```

---

## 🧪 Credenciais de Desenvolvimento (`DevelopmentSeeder`)

Caso o banco de dados da API tenha sido populado com o seeder de desenvolvimento (`php artisan db:seed --class=DevelopmentSeeder`), você pode utilizar os seguintes acessos na tela de `/login`:

* **Documento da Organização (CNPJ)**: `11.222.333/0001-81` *(Apollo Tecnologia e Comércio LTDA)*
* **Senha padrão para todos os usuários**: `Apollo@2026!`

| Perfil de Acesso | E-mail | Permissões Configuradas |
| :--- | :--- | :--- |
| **Administrador Geral** | `admin@apollo.com.br` | Acesso total irrestrito (`is_administrator: true`) |
| **Comercial / Vendas** | `vendas@apollo.com.br` | Gestão de Clientes, Vendedores, Pedidos de Venda e leitura do Catálogo |
| **Compras / Suprimentos** | `compras@apollo.com.br` | Gestão de Fornecedores, Marcas, Categorias, Produtos e Pedidos de Compra |
| **Financeiro** | `financeiro@apollo.com.br` | Leitura e atualização de Pedidos de Venda/Compra e leitura de Parceiros |
| **Auditor (Somente Leitura)** | `consulta@apollo.com.br` | Permissão exclusiva de visualização (`*.view`) nos 9 módulos do sistema |

---

## 📚 Documentação Técnica Completa

Para aprofundar na engenharia, regras de negócio e decisões de design do projeto, consulte a documentação detalhada no diretório [`docs/`](docs/):

* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**:
  * Árvore de pastas completa e convenções de nomenclatura
  * Diagrama de fluxo de dados em Mermaid (`UI → Hook → Service → Cliente HTTP → API`)
  * Fluxo de autenticação multi-tenant, sessão e tratamento de códigos HTTP (`401`, `403`, `422`)
  * Normalização unificada de erros (`parseApiError`, `applyApiValidationErrors`)
  * Atualizações parciais determinísticas com `calculateDiff` (`PATCH`)
  * Arquitetura de permissões RBAC (`usePermissions`, `<Can>`, `<PermissionGuard>`)
  * Gestão de endereços polimórficos e seleção UF $\rightarrow$ Cidade com código IBGE
  * Máquina de estados de Pedidos de Venda e Compra (`draft`, `confirmed`, `cancelled`, `reopen` e `outdated_prices`) e fluxo dedicado de status de pagamento (`pending`, `paid`, `refunded`, `cancelled` via `PATCH /v1/{orders}/{id}/payment-status`)
* **[docs/FEATURES_AND_WORKFLOWS.md](docs/FEATURES_AND_WORKFLOWS.md)**:
  * Guia funcional e técnico detalhado de todos os 11 módulos de domínio, Dashboard, Lookups (`/v1/lookups/*`) e Relatórios Gerenciais (`/reports`)
  * Tabelas de rotas, permissões exigidas, validações de formulário, alteração de senha própria (`PATCH /v1/users/me/password`) e de terceiros, e payloads
  * Explicação passo a passo das operações delta de itens de pedido (`to_add`, `to_update`, `to_remove`), transição de status de pagamento dedicado e rastreabilidade de pedidos reabertos
  * Tabela de referência rápida de todas as máscaras e formatadores
* **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)**:
  * Justificativa técnica minuciosa de cada dependência de produção e desenvolvimento
  * Decisões arquiteturais conscientes de "Zero Over-engineering"

---

## 🔐 Resumo do Contrato de Autenticação (BFF)

* **Login**: `POST /api/v1/login` (BFF) $\rightarrow$ `POST /v1/login` (Laravel) com `{ email, password, organization_document }`. O BFF extrai o token Sanctum, grava-o em cookie `HttpOnly` cifrado (`apollo_token` / `__Host-apollo_token` em produção) e retorna apenas `{ message, data: { user } }` ao navegador.
* **Proxy Reverso & Token**: Todas as requisições do cliente HTTP ([`lib/api/client.ts`](lib/api/client.ts)) vão para `/api/v1/*` em `same-origin` com `X-Requested-With: XMLHttpRequest`; o BFF valida CSRF, decifra o cookie `HttpOnly` e injeta `Authorization: Bearer <token>` antes de encaminhar ao Laravel.
* **Sessão Canônica**: `GET /api/auth/session` (BFF) $\rightarrow$ `GET /v1/me` (Laravel), além de validação SSR no layout do dashboard ([`app/(dashboard)/layout.tsx`](app/(dashboard)/layout.tsx)) e guarda de borda em [`proxy.ts`](proxy.ts).
* **Logout**: `POST /api/v1/logout` revoga o token no Laravel, expira o cookie `HttpOnly` no BFF, limpa o cache do React Query e sincroniza outras abas via `BroadcastChannel`.
* **Alteração da própria senha**: `PATCH /api/v1/users/me/password` com `{ current_password, password }` disponível para qualquer usuário autenticado (mantém o token da sessão atual ativo e revoga demais dispositivos).
* **Erros 401**: Quando o backend retorna `401`, o BFF expira o cookie de sessão e o cliente HTTP redireciona automaticamente para `/login` (exceto na própria tentativa de login).

---

## 📄 Licença

Proprietário - Apollo System. Todos os direitos reservados.
