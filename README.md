# Apollo System - Frontend

Frontend do **Apollo System**, um sistema ERP moderno para gestão empresarial de pequenas e médias empresas brasileiras com suporte **multi-tenant**, controle de acesso granular (**RBAC**), catálogo de produtos, controle de estoque e ciclo completo de **Pedidos de Venda e Compra**, desenvolvido com **Next.js 16 (App Router)**, **React 19**, **TypeScript** e **Tailwind CSS v4**.

---

## 🚀 Tecnologias e Padrões Principais

* **Framework**: Next.js 16 (App Router com Turbopack)
* **Reatividade**: React 19 + TypeScript 5
* **Design & Estilo**: Tailwind CSS v4 + Componentes acessíveis baseados em shadcn/ui e Radix UI Headless
* **Formulários & Validação**: `react-hook-form` + `zod` + `@hookform/resolvers`
* **Gerenciamento de Estado de Servidor**: `@tanstack/react-query` v5
* **Notificações**: `sonner`
* **Arquitetura**: Feature-Driven / Modular por Domínio (`features/*`), com atualizações parciais determinísticas via `calculateDiff` (`PATCH`)
* **Controle de Acesso (RBAC)**: Guardas declarativos (`<Can>`, `<PermissionGuard>`, `usePermissions`) sincronizados com as 36 permissões atômicas do backend
* **Endereços IBGE**: Seleção em cascata de **Estado (UF) $\rightarrow$ Cidade** em tempo $O(1)$ usando base oficial local do IBGE (27 UFs e 5.570 municípios), enviando `city_ibge_code` de forma transparente para a API
* **Moedas, Máscaras & Datas**: `Intl.NumberFormat` (BRL até 4 casas decimais) e `Intl.DateTimeFormat` (`pt-BR`), além de máscaras puras para CPF, CNPJ numérico/alfanumérico, CEP, NCM, Telefone, Preços e Estoque

---

## 📋 Pré-requisitos

* **Node.js**: Versão 20.x ou superior recomendada
* **npm**: Versão 10.x ou superior (ou gerenciador compatível)
* **API Backend**: Servidor Laravel do Apollo rodando (por padrão em `http://localhost:8000/api`)

---

## ⚙️ Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
# URL base para a API Laravel do Apollo
NEXT_PUBLIC_API_URL=http://localhost:8000/api
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
  * Máquina de estados de Pedidos de Venda e Compra (`draf`, `confirmed`, `cancelled`, `reopen` e `outdated_prices`)
* **[docs/FEATURES_AND_WORKFLOWS.md](docs/FEATURES_AND_WORKFLOWS.md)**:
  * Guia funcional e técnico detalhado de todos os 11 módulos de domínio e do Dashboard
  * Tabelas de rotas, permissões exigidas, validações de formulário e payloads
  * Explicação passo a passo das operações delta de itens de pedido (`to_add`, `to_update`, `to_remove`) e rastreabilidade de pedidos reabertos
  * Tabela de referência rápida de todas as máscaras e formatadores
* **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)**:
  * Justificativa técnica minuciosa de cada dependência de produção e desenvolvimento
  * Decisões arquiteturais conscientes de "Zero Over-engineering"

---

## 🔐 Resumo do Contrato de Autenticação

* **Login**: `POST /v1/login` com `{ email, password, organization_document }`.
* **Token**: Bearer token injetado automaticamente pelo cliente HTTP central ([`lib/api/client.ts`](lib/api/client.ts)).
* **Logout**: `POST /v1/logout` com limpeza determinística no cliente e redirecionamento para `/login`.
* **Erros 401**: Interceptor global limpa a sessão local e redireciona automaticamente para `/login`.

---

## 📄 Licença

Proprietário - Apollo System. Todos os direitos reservados.
