# Arquitetura do Apollo System Frontend

Este documento descreve detalhadamente a arquitetura, convenções, padrões de projeto e fluxos operacionais do frontend do **Apollo System**, construído em Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS v4.

---

## 1. Estrutura de Pastas e Convenções de Nomenclatura

A arquitetura adota o padrão **Feature-Driven (Modular por Domínio)**. Cada domínio de negócio possui seu próprio diretório contendo componentes, hooks, services, schemas e types. Componentes genéricos e infraestrutura técnica residem em diretórios globais agnósticos.

### 1.1. Árvore do Projeto

```text
apollo-react-next/
├── proxy.ts                                # Borda Next.js 16: guarda rápida de rotas públicas/privadas por cookie
├── next.config.ts                          # Headers de segurança HTTP (CSP, HSTS, X-Frame-Options, etc.)
├── app/                                    # Next.js App Router (Páginas, Layouts e Route Handlers BFF)
│   ├── api/                                # Camada BFF (Backend for Frontend) same-origin
│   │   ├── auth/
│   │   │   ├── session/route.ts            # GET /api/auth/session -> valida sessão via Laravel GET /v1/me
│   │   │   └── clear-session/route.ts      # GET /api/auth/clear-session -> limpa cookie expirado e redireciona ao /login
│   │   ├── v1/
│   │   │   ├── login/route.ts              # POST /api/v1/login -> grava token em cookie HttpOnly cifrado (sem expor token)
│   │   │   └── logout/route.ts             # POST /api/v1/logout -> revoga token no Laravel e expira cookie HttpOnly
│   │   └── [...path]/route.ts              # Proxy reverso /api/v1/* -> injeta Bearer token do cookie HttpOnly
│   ├── login/page.tsx                      # Tela pública de autenticação multi-tenant
│   ├── register-organization/page.tsx      # Tela pública de cadastro da organização + admin
│   ├── (dashboard)/                        # Grupo de rotas protegidas por autenticação
│   │   ├── layout.tsx                      # Server Component: valida sessão via /v1/me e hidrata AuthProvider SSR
│   │   ├── page.tsx                        # Visão geral / Dashboard inicial com KPIs
│   │   ├── products/                       # Rotas de Catálogo de Produtos (/products, /new, /[id])
│   │   ├── brands/                         # Rotas de Marcas (/brands, /new, /[id])
│   │   ├── categories/                     # Rotas de Categorias (/categories, /new, /[id])
│   │   ├── clients/                        # Rotas de Clientes e Endereços (/clients, /new, /[id])
│   │   ├── sellers/                        # Rotas de Vendedores e Endereços (/sellers, /new, /[id])
│   │   ├── suppliers/                      # Rotas de Fornecedores e Endereços (/suppliers, /new, /[id])
│   │   ├── sales-orders/                   # Rotas de Pedidos de Venda (/sales-orders, /new, /[id])
│   │   ├── purchase-orders/                # Rotas de Pedidos de Compra (/purchase-orders, /new, /[id])
│   │   ├── reports/                        # Rotas de Relatórios Gerenciais (/reports, /sales/*, /purchases/*)
│   │   └── users/                          # Rotas de Usuários e Permissões (/users, /new, /[id])
│   ├── layout.tsx                          # Root Layout (Providers de Tema, Cache e Toaster)
│   ├── globals.css                         # Estilos globais e tokens CSS (Tailwind v4)
│   └── not-found.tsx                       # Página 404 personalizada
│
├── components/                             # Componentes de interface agnósticos de domínio
│   ├── ui/                                 # Componentes primitivos shadcn/ui (Button, Card, Table, Dialog, Select, etc.)
│   ├── layout/                             # Componentes estruturais (DashboardShell, Sidebar, Header, UserNav)
│   ├── providers/                          # Provedores de contexto (QueryProvider, AuthProvider, ThemeProvider, AccessibilityProvider)
│   └── common/                             # Componentes visuais e guardas utilitários compartilhados
│       ├── can.tsx                         # Renderização condicional declarativa baseada em permissões (<Can>)
│       ├── permission-guard.tsx            # Proteção de página/bloco com tela de "Acesso Restrito" (<PermissionGuard>)
│       ├── page-header.tsx                 # Cabeçalho padrão de página com título, subtítulo e ações
│       ├── data-table-pagination.tsx       # Paginação padronizada compatível com o envelope da API Laravel
│       ├── empty-state.tsx                 # Estado vazio amigável com ícone, descrição e call-to-action
│       ├── loading-skeleton.tsx            # Skeletons para tabelas, cards e formulários
│       ├── confirm-dialog.tsx              # Modal de confirmação para ações críticas ou destrutivas
│       ├── form-field-error.tsx            # Exibidor padronizado de mensagens de erro por campo
│       └── money-display.tsx               # Renderizador tipado (MoneyLike: objeto Money ou string/número) em BRL
│
├── features/                               # Módulos organizados estritamente por domínio de negócio
│   ├── auth/                               # Domínio: Autenticação, Registro de Organização e Hook usePermissions
│   ├── products/                           # Domínio: Produtos, Preços, Unidades, Categorias e Estoque Inicial
│   ├── brands/                             # Domínio: Marcas de Produtos
│   ├── categories/                         # Domínio: Categorias de Produtos
│   ├── clients/                            # Domínio: Clientes (PF/PJ)
│   ├── sellers/                            # Domínio: Vendedores (PF/PJ) e Comissão
│   ├── suppliers/                          # Domínio: Fornecedores (PF/PJ)
│   ├── sales-orders/                       # Domínio: Pedidos de Venda (Rascunho, Confirmação, Cancelamento, Reabertura, Pagamento)
│   ├── purchase-orders/                    # Domínio: Pedidos de Compra (Rascunho, Confirmação, Cancelamento, Reabertura, Pagamento)
│   ├── lookups/                            # Domínio: Endpoints leves de seletores (/v1/lookups/*)
│   ├── reports/                            # Domínio: Relatórios Gerenciais de Vendas e Compras (/v1/reports/*)
│   ├── addresses/                          # Domínio: Endereços Polimórficos e Base Local IBGE (UF -> Cidade)
│   │   ├── components/                     # AddressList e AddressDialog (seleção em cascata UF -> Cidade)
│   │   ├── data/ibge-locations.json        # Base oficial do IBGE com 27 UFs e 5.570 municípios brasileiros
│   │   ├── utils/locations.ts              # Helpers O(1) de lookup por código IBGE de UF e Município
│   │   ├── hooks/                          # Hooks de mutação de endereços (create, update, delete)
│   │   ├── services/                       # Serviço polimórfico (/v1/{ownerType}/{ownerId}/addresses)
│   │   ├── schemas/                        # Schema Zod de endereço (uf_ibge_code + city_ibge_code)
│   │   └── types/                          # Interfaces AddressResource, CityResource, UfResource
│   └── users/                              # Domínio: Usuários e Matriz de Permissões (RBAC)
│       # Estrutura padrão dentro de cada feature/:
│       ├── components/                     # Componentes visuais específicos da feature (Tabelas, Forms, Dialogs)
│       ├── hooks/                          # Hooks de dados (useQuery/useMutation)
│       ├── services/                       # Funções de chamada à API usando o cliente HTTP
│       ├── schemas/                        # Schemas Zod de validação client-side
│       └── types/                          # Interfaces e tipos TypeScript do domínio
│
├── lib/                                    # Infraestrutura técnica e utilitários agnósticos
│   ├── api/
│   │   ├── client.ts                       # Cliente HTTP same-origin (/api) com anti-CSRF e interceptors
│   │   ├── errors.ts                       # parseApiError (incl. 429 e 502/504) e applyApiValidationErrors
│   │   └── types.ts                        # Envelopes de resposta (ApiResponse, PaginatedResponse)
│   ├── auth/
│   │   ├── sync.ts                         # Sincronização de sessão entre abas via BroadcastChannel
│   │   ├── session.ts                      # Tipo SessionUser e limpeza de credenciais legadas
│   │   └── permissions.ts                  # Motor de normalização e avaliação de permissões RBAC
│   ├── bff/                                # Infraestrutura server-only do BFF (não importável no browser)
│   │   ├── config.ts                       # Variáveis server-only, nomes de cookie e chave AES-256-GCM
│   │   ├── crypto.ts                       # Cifragem/decifragem autenticada AES-256-GCM (node:crypto)
│   │   ├── cookies.ts                      # Gestão de cookies HttpOnly (__Host- em produção)
│   │   ├── security.ts                     # Validação anti-CSRF (Origin/Referer/Sec-Fetch-Site) e path allowlist
│   │   ├── session.ts                      # fetchServerSession (/v1/me) e sanitizeSessionUser
│   │   └── proxy.ts                        # Proxy reverso HTTP, sanitização de headers, Cache-Control e timeouts
│   ├── orders/
│   │   └── payment-status.ts               # Configuração e regras de transição manual de payment_status
│   ├── diff.ts                             # Cálculo determinístico de diff para requisições PATCH
│   ├── formatters.ts                       # Formatadores nativos Intl (Money, BRL até 4 decimais, Datas pt-BR, Quantidades)
│   ├── masks.ts                            # Máscaras puras em TypeScript (CNPJ alfanumérico, CPF, CEP, Telefone, NCM, Preço, Estoque)
│   └── utils.ts                            # Função `cn` para composição de classes Tailwind CSS
│
├── docs/                                   # Documentação técnica do projeto
│   ├── ARCHITECTURE.md                     # Arquitetura, padrões, segurança e fluxos de engenharia (este arquivo)
│   ├── FEATURES_AND_WORKFLOWS.md           # Guia funcional e técnico detalhado de todos os módulos e fluxos de negócio
│   └── DEPENDENCIES.md                     # Justificativa técnica de todas as dependências e decisões arquiteturais
└── README.md                               # Guia rápido de instalação, credenciais de desenvolvimento e visão geral
```

### 1.2. Convenções de Nomes

* **Arquivos e Pastas**: `kebab-case` (ex.: `sales-orders`, `form-field-error.tsx`, `use-products.ts`).
* **Componentes React**: `PascalCase` (ex.: `DataTablePagination`, `ProductForm`, `PermissionGuard`).
* **Funções e Utilitários**: `camelCase` (ex.: `formatBRL`, `parseApiError`, `calculateDiff`, `getCitiesByUf`).
* **Tipos e Interfaces**: `PascalCase` (ex.: `ProductResource`, `ParsedApiError`, `CityResource`).
* **Constantes e Schemas**: `camelCase` terminando com `Schema` para validadores Zod (ex.: `productSchema`, `loginSchema`, `addressSchema`).

---

## 2. Fluxo de Dados Unidirecional

Nenhum componente de tela realiza chamadas `fetch` diretamente. Os componentes apenas apresentam dados e despacham eventos de interface. Toda a lógica de requisição, cache e mutação é orquestrada por **Hooks**, que utilizam **Services**, que por sua vez utilizam o **Cliente HTTP central**.

### Diagrama de Fluxo de Dados (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant Componente as Componente / Tela (UI)
    participant Hook as Hook de Domínio (TanStack Query)
    participant Service as Service do Domínio
    participant Client as Cliente HTTP (/api)
    participant BFF as Next.js BFF (Proxy Reverso)
    participant Backend as API Laravel (Backend)

    Usuario->>Componente: Interação (Ex.: Submeter Formulário / Mudar Página)
    Componente->>Hook: Chama Mutação ou Consulta (ex.: useCreateProduct)
    Hook->>Service: Invoca Método do Serviço (ex.: productService.create)
    Service->>Client: Chama Método Tipado (client.post / client.patch)
    Note over Client: Envia cookie HttpOnly same-origin + X-Requested-With
    Client->>BFF: Requisição HTTP (/api/v1/*)
    Note over BFF: Valida CSRF + decifra cookie + injeta Bearer Token
    BFF->>Backend: Requisição HTTP (API_INTERNAL_URL/v1/*)
    Backend-->>BFF: Resposta HTTP (200/201/204/401/403/422/429)
    BFF-->>Client: Resposta HTTP (sem cache; limpa cookie se 401)
    
    alt Sucesso (2xx)
        Client-->>Service: Retorna Dados Tipados (ou undefined em 204)
        Service-->>Hook: Retorna Payload
        Hook->>Hook: Invalida Cache / Dispara Toast de Sucesso
        Hook-->>Componente: Atualiza Estado da UI reativamente
        Componente-->>Usuario: Renderiza Sucesso / Atualiza Tabela
    else Erro de Validação (422 / VALIDATION_ERROR)
        Client-->>Service: Lança ApiClientError
        Service-->>Hook: Propaga Erro
        Hook->>Hook: parseApiError normaliza campos
        Hook-->>Componente: Mapeia erros nos inputs via applyApiValidationErrors
        Componente-->>Usuario: Exibe mensagens abaixo de cada campo (FormFieldError)
    else Erro de Permissão (403 / FORBIDDEN)
        Client-->>Service: Lança ApiClientError (statusCode 403)
        Service-->>Hook: Propaga Erro
        Hook->>Componente: Exibe Toast de Acesso Negado
    else Erro Desautenticado (401 / UNAUTHENTICATED)
        BFF->>BFF: Expira Cookie HttpOnly (Max-Age=0)
        Client->>Client: Notifica abas (BroadcastChannel)
        Client->>Componente: Redireciona determinísticamente para /login
    end
```

---

## 3. Fluxo de Autenticação, BFF e Segurança Multi-Tenant

A autenticação no Apollo System é **multi-tenant** (vinculada ao documento da Organização) e protegida por uma camada **BFF (Backend for Frontend)** no próprio servidor Next.js 16, mantendo o *Personal Access Token* (Sanctum) **100% isolado do JavaScript no navegador**:

1. **Cadastro de Organização (`POST /api/v1/organizations`)**:
   * Encaminhado pelo proxy reverso do BFF ao Laravel para criar simultaneamente a Organização (Pessoa Física ou Jurídica) e seu primeiro Usuário Administrador (`is_administrator: true`).
2. **Login Multi-Tenant via BFF (`POST /api/v1/login`)**:
   * O usuário informa `email`, `password` e `organization_document` (CNPJ ou CPF da empresa, enviado sem pontuação via `cleanDocument`).
   * O Route Handler [`app/api/v1/login/route.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/app/api/v1/login/route.ts) valida o CSRF, encaminha as credenciais ao Laravel, recebe `{ data: { token, expires_at, user } }`, cifra o token com **AES-256-GCM** e grava-o em cookie **`HttpOnly` + `SameSite=Lax`** (`apollo_token` em dev / `__Host-apollo_token` + `Secure` em produção).
   * O token **nunca** é retornado ao navegador: o BFF devolve apenas `{ message, data: { user } }` sanitizado, hidratando o [`AuthProvider`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/providers/auth-provider.tsx) em memória.
3. **Proxy Reverso Autenticado (`/api/[...path]`)**:
   * O cliente HTTP ([`lib/api/client.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/api/client.ts)) envia requisições `same-origin` para `/api/v1/*` com `credentials: "same-origin"` e `X-Requested-With: XMLHttpRequest`.
   * O BFF ([`lib/bff/proxy.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/bff/proxy.ts)) valida CSRF (`Origin`/`Referer`/`Sec-Fetch-Site`), valida a allowlist de rota (`/v1/*`), decifra o cookie `HttpOnly` e injeta `Authorization: Bearer <token>` antes de encaminhar ao backend Laravel.
   * Todas as respostas do BFF retornam `Cache-Control: no-store, no-cache, must-revalidate, private` e `Vary: Cookie`.
4. **Proteção de Rotas e Sessão SSR (`proxy.ts` + `(dashboard)/layout.tsx`)**:
   * A borda [`proxy.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/proxy.ts) redireciona requisições sem cookie de sessão diretamente para `/login` e usuários autenticados que acessam `/login` ou `/register-organization` para `/`.
   * O layout do dashboard ([`app/(dashboard)/layout.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/app/(dashboard)/layout.tsx)) executa como **Server Component**, consulta `GET /v1/me` no servidor via [`fetchServerSession`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/bff/session.ts) antes de renderizar qualquer HTML e injeta `initialUser` no [`AuthProvider`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/providers/auth-provider.tsx).
5. **Expiração e Desautenticação Automática (HTTP 401)**:
   * Quando qualquer endpoint autenticado retorna `401` (`UNAUTHENTICATED`), o BFF expira o cookie `HttpOnly` (`Max-Age=0`) e o cliente HTTP dispara `broadcastAuthEvent("logout")` via `BroadcastChannel("apollo-auth")`, redirecionando todas as abas abertas para `/login` (exceto em tentativas inválidas na própria rota `/v1/login`).
6. **Logout Determinístico (`POST /api/v1/logout`)**:
   * O BFF revoga o token no Laravel (`POST /v1/logout`), expira o cookie `HttpOnly` mesmo em caso de falha de rede, limpa o cache do React Query e notifica as demais abas via `BroadcastChannel`.

---

## 4. Fluxo e Normalização de Tratamento de Erros

O tratamento de erros é centralizado no utilitário [`parseApiError`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/api/errors.ts).

### 4.1. Resolução de Envelopes de Erro da API

A API Laravel pode retornar erros em dois formatos:

1. **Envelope padrão do Laravel (`ValidationException` / HTTP 422)**:
   ```json
   {
     "message": "O campo nome é obrigatório.",
     "errors": {
       "name": ["O campo nome é obrigatório."],
       "items.0.quantity": ["A quantidade do item deve ser maior que zero."]
     }
   }
   ```
2. **Envelope customizado de domínio do Apollo ERP**:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Dados inválidos.",
       "fields": {
         "email": ["O e-mail informado já está em uso."]
       }
     }
   }
   ```

O utilitário [`parseApiError`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/api/errors.ts) inspeciona ambos os envelopes e os converte para uma estrutura única `ParsedApiError`:

```typescript
export interface ParsedApiError {
  code: string;                     // ex: "VALIDATION_ERROR", "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND"
  message: string;                  // Mensagem amigável em português
  fields: Record<string, string[]>; // Dicionário de campos com lista de mensagens de erro
  statusCode: number;               // Código HTTP (422, 401, 403, 404, 500, etc.)
  isValidationError: boolean;       // true se statusCode === 422 ou code === "VALIDATION_ERROR"
  isUnauthenticated: boolean;       // true se statusCode === 401 ou code === "UNAUTHENTICATED"
}
```

### 4.2. Comportamento na Interface por Tipo de Erro

* **Erros de Validação (`422` / `isValidationError`)**:
  * O helper `applyApiValidationErrors(parsed, setError)` percorre `parsed.fields` e registra cada erro diretamente no `react-hook-form`, inclusive para chaves aninhadas (como `items.0.quantity` ou `categories.0.id`).
  * O componente [`FormFieldError`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/common/form-field-error.tsx) exibe a mensagem em vermelho logo abaixo do campo correspondente.
  * Caso um erro `422` de regra de negócio não traga `fields` específicos (ex.: tentativa de confirmar pedido sem estoque disponível), a mensagem principal é exibida via `toast.error(parsed.message)`.
* **Erros de Autorização (`403 Forbidden`)**:
  * Quando um usuário autenticado tenta executar uma operação para a qual não possui permissão no backend, a API retorna `403 Forbidden`, sendo exibido um alerta claro via `toast.error`. Além disso, a própria UI previne proativamente essas ações ocultando botões e protegendo rotas com RBAC.
* **Erros de Sessão (`401 Unauthenticated`)**:
  * O BFF remove o cookie `HttpOnly` e o cliente redireciona para `/login` sincronizando as demais abas.
* **Limitação de Taxa e Disponibilidade (`429 Rate Limited` / `502-504 Upstream Unavailable`)**:
  * Mapeados explicitamente por `parseApiError` para os códigos `RATE_LIMITED` e `UPSTREAM_UNAVAILABLE` com mensagens amigáveis ao usuário.

---

## 5. Atualizações Parciais Determinísticas (`calculateDiff` em Requisições `PATCH`)

Todas as operações de atualização cadastral (`PATCH /v1/{recurso}/{id}`) utilizam o utilitário [`calculateDiff`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/diff.ts):

```typescript
const diff = calculateDiff(initialValues, currentFormValues);
```

### Por que o `calculateDiff` é fundamental?
1. **Prevenção de Falsos Conflitos de Unicidade**: Evita reenviar campos únicos inalterados (como `email`, `document_number`, `code` ou `ean`), garantindo que o backend valide apenas o que realmente mudou.
2. **Economia de Payload e Auditoria Limpa**: Apenas as propriedades efetivamente modificadas pelo operador trafegam na rede.
3. **Curto-Circuito Inteligente**: Se o objeto retornado por `calculateDiff` estiver vazio (`Object.keys(diff).length === 0`), o frontend exibe um aviso amigável (`toast.info("Nenhuma alteração detectada.")`) ou fecha o modal sem disparar uma requisição HTTP desnecessária ao servidor.

---

## 6. Controle de Acesso Baseado em Permissões (RBAC)

O controle de acesso no Apollo System opera em duas camadas complementares: **validação estrita no Backend Laravel** (que retorna `403 Forbidden` na ausência de permissão) e **adaptação reativa da Interface no Frontend**.

### 6.1. As 36 Permissões Atômicas por Domínio

Cada um dos **9 domínios operacionais** possui **4 permissões canônicas**:

| Ação na UI | Sufixo no Backend | Operação HTTP | Descrição |
| :--- | :--- | :--- | :--- |
| **Visualizar** | `*.view` | `GET /v1/[recurso]` | Listagem, busca e visualização de detalhes |
| **Criar** | `*.create` | `POST /v1/[recurso]` | Cadastro de novos registros |
| **Editar** | `*.update` | `PATCH /v1/[recurso]/{id}` | Edição cadastral, confirmação, cancelamento e reabertura |
| **Excluir** | `*.delete` | `DELETE /v1/[recurso]/{id}` | Exclusão de registros |

Os 9 domínios controlados são:
1. **Usuários (`user.*`)**: `user.view`, `user.create`, `user.update`, `user.delete`
2. **Produtos (`product.*`)**: `product.view`, `product.create`, `product.update`, `product.delete`
3. **Marcas (`brand.*`)**: `brand.view`, `brand.create`, `brand.update`, `brand.delete`
4. **Categorias (`category.*`)**: `category.view`, `category.create`, `category.update`, `category.delete`
5. **Clientes (`client.*`)**: `client.view`, `client.create`, `client.update`, `client.delete`
6. **Vendedores (`seller.*`)**: `seller.view`, `seller.create`, `seller.update`, `seller.delete`
7. **Fornecedores (`supplier.*`)**: `supplier.view`, `supplier.create`, `supplier.update`, `supplier.delete`
8. **Pedidos de Venda (`sales-order.*`)**: `sales-order.view`, `sales-order.create`, `sales-order.update`, `sales-order.delete`
9. **Pedidos de Compra (`purchase-order.*`)**: `purchase-order.view`, `purchase-order.create`, `purchase-order.update`, `purchase-order.delete`

> [!NOTE]
> O domínio de **Endereços (`addresses`)** é polimórfico e herda as permissões do seu respectivo proprietário (`client.*`, `seller.*` ou `supplier.*`).
> Das **36 permissões atômicas** do backend, as **4 permissões de Usuários (`user.*`)** são reservadas a administradores, enquanto as **32 permissões operacionais** dos demais 8 domínios são atribuíveis na matriz da UI de usuários.

### 6.2. Arquitetura de Verificação no Frontend

1. **Normalização ([`lib/auth/permissions.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/auth/permissions.ts))**:
   * A função `normalizePermissionKey` garante compatibilidade transparente entre chaves no singular/plural ou com sufixo `.read`/`.view` (ex.: `products.read` $\rightarrow$ `product.view`).
   * Usuários com `is_administrator: true` possuem passe livre automático em `hasPermission()`.
2. **Hook `usePermissions` ([`features/auth/hooks/use-permissions.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/auth/hooks/use-permissions.ts))**:
   * Expõe `{ can, isAdministrator, permissions, user, isInitialized }`.
   * Consome diretamente a sessão autenticada do [`AuthProvider`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/providers/auth-provider.tsx), hidratada inicialmente no SSR via `GET /v1/me` e revalidada em background pelo TanStack Query (`GET /api/auth/session`).
3. **Componente `<Can>` ([`components/common/can.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/common/can.tsx))**:
   * Envolve botões de criação, edição, exclusão e ações transacionais para ocultá-los quando o operador não possui a permissão exigida:
     ```tsx
     <Can permission="product.create">
       <Button>Novo Produto</Button>
     </Can>
     ```
4. **Componente `<PermissionGuard>` ([`components/common/permission-guard.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/common/permission-guard.tsx))**:
   * Protege páginas completas (`page.tsx`). Se o operador navegar diretamente via URL para uma rota sem permissão (ex.: `/products/new` sem `product.create`), renderiza um card de **Acesso Restrito** com botão de retorno ao início.
5. **Filtragem Dinâmica da Sidebar ([`components/layout/sidebar.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/layout/sidebar.tsx))**:
   * O menu lateral exibe apenas os módulos para os quais o usuário possui permissão de visualização (`*.view`).

---

## 7. Gestão de Endereços Polimórficos e Base Local IBGE (UF $\rightarrow$ Cidade)

Clientes (`clients`), Vendedores (`sellers`) e Fornecedores (`suppliers`) compartilham o mesmo módulo reutilizável de endereços em [`features/addresses/`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/addresses).

### 7.1. Seleção em Cascata (UF $\rightarrow$ Cidade) com Código IBGE Transparente

Embora o backend armazene e valide o endereço através do código IBGE de 7 dígitos do município (`city_ibge_code`), o usuário final **nunca precisa digitar códigos IBGE manualmente**:

1. **Base Local Oficial ([`features/addresses/data/ibge-locations.json`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/addresses/data/ibge-locations.json))**:
   * Contém as **27 Unidades Federativas (UFs)** e todos os **5.570 municípios brasileiros** extraídos da tabela oficial do IBGE utilizada pelo backend.
   * Por ser empacotada estaticamente e indexada em memória por [`features/addresses/utils/locations.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/addresses/utils/locations.ts), a filtragem de cidades ao trocar a UF ocorre em **tempo $O(1)$ (zero latência de rede e zero dependência de APIs externas instáveis)**.
2. **Fluxo no Formulário ([`AddressDialog`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/addresses/components/address-dialog.tsx))**:
   * O usuário seleciona primeiro o **Estado (UF)** (ex.: `SP - São Paulo`, código IBGE `35`).
   * O seletor de **Cidade** é habilitado e populado exclusivamente com os municípios daquela UF em ordem alfabética.
   * Ao escolher a cidade (ex.: `São Paulo`), o formulário armazena seu `city_ibge_code` (`3550308`) e o envia de forma transparente no payload `POST` ou `PATCH` para a API.
3. **Exibição e Edição ([`AddressList`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/addresses/components/address-list.tsx))**:
   * A API retorna no `AddressResource` o objeto aninhado `city` contendo `{ ibge_code, name, uf: { ibge_code, acronym, name } }`.
   * Na listagem e ao abrir o modal de edição, o frontend resolve automaticamente o nome da cidade e a sigla da UF a partir do objeto `address.city` (com fallback instantâneo via `getCityByIbgeCode(address.city_ibge_code)`).

---

## 8. Ciclo de Vida de Pedidos de Venda e Compra

Os módulos de **Pedidos de Venda (`sales-orders`)** e **Pedidos de Compra (`purchase-orders`)** implementam uma máquina de estados transacional alinhada às regras de estoque e precificação do backend:

```mermaid
stateDiagram-v2
    [*] --> draft: Criação (POST /v1/*-orders)
    draft--> draft: Edição de Cabeçalho e Diff de Itens (PATCH /v1/*-orders/{id})
    draft--> confirmed : Confirmar Pedido (PATCH /v1/*-orders/{id}/confirm)
    draft--> cancelled : Cancelar Rascunho (PATCH /v1/*-orders/{id}/cancel)
    confirmed --> cancelled : Cancelar Pedido Confirmado (Estorna Estoque)
    confirmed --> draft: Reabrir Pedido (Cancela original + Cria novo Rascunho vinculado)
    cancelled --> draft: Reabrir Pedido (Cria novo Rascunho vinculado ao cancelado)
```

### 8.1. Particularidades Técnicas Importantes dos Pedidos

1. **Valor Literal do Status de Rascunho (`"draft"`)**:
   * Por contrato do backend Laravel (`OrderStatus::Draft = 'draft'`), o status de rascunho no JSON é grafado literalmente como `"draft"`. Todos os tipos TypeScript, filtros e badges do frontend respeitam essa constante exata.
2. **Operações Delta em Itens na Edição de Rascunho (`items.to_add`, `to_update`, `to_remove`)**:
   * Enquanto um pedido está em rascunho (`draft`), sua edição (`PATCH /v1/{orders}/{id}`) não sobrescreve cegamente a lista de itens. O formulário compara os itens originais (identificados pelo seu número sequencial `number`) com os itens atuais e monta o objeto delta:
     * `to_add`: Novos produtos adicionados ao pedido (`{ product_id, quantity }`).
     * `to_update`: Itens existentes cuja quantidade ou produto foi alterado (`{ number, product_id, quantity }`).
     * `to_remove`: Itens existentes removidos pelo usuário (`{ number }`).
3. **Confirmação e Movimentação de Estoque (`/confirm`)**:
   * Ao confirmar um **Pedido de Venda**, o backend realiza a baixa de estoque (`StockMovement` de saída).
   * Ao confirmar um **Pedido de Compra**, o backend realiza a entrada de estoque (`StockMovement` de entrada).
4. **Reabertura de Pedido (`/reopen`), Rastreabilidade e Divergência de Preços (`outdated_prices`)**:
   * Pedidos nos status `confirmed` ou `cancelled` não podem ser editados diretamente, mas podem ser **Reabertos** (`PATCH /v1/{orders}/{id}/reopen`).
   * A reabertura cancela o pedido original (caso ainda esteja confirmado, estornando o estoque) e cria automaticamente um **novo pedido em rascunho (`draft`)** contendo os mesmos itens e vinculado ao pedido anterior através de `replaces_order_id` (exibido na UI pelos links de rastreabilidade *"Substitui o pedido #X"* e *"Substituído pelo pedido #Y"*).
   * Se o preço de catálogo de algum produto tiver sofrido alteração desde a emissão do pedido original, o endpoint `/reopen` retorna a lista `outdated_prices` (contendo `negotiated_price` vs. `current_price`), apresentada em um banner de alerta detalhado na tela do novo pedido.
5. **Fluxo Dedicado de Status de Pagamento (`PATCH /v1/{orders}/{id}/payment-status`)**:
   * O `payment_status` possui 4 valores possíveis: `pending`, `paid`, `refunded` e `cancelled`, desacoplados da edição cadastral de rascunho (`PATCH /v1/{orders}/{id}`).
   * As transições manuais permitidas são centralizadas em [`lib/orders/payment-status.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/orders/payment-status.ts) (`getAvailablePaymentAction`): em pedidos `draft` ou `confirmed`, alterna `pending` ↔ `paid`; em pedidos `cancelled` ainda pagos (`paid`), permite apenas estornar para `refunded`.
   * Eventos de pagamento e estorno registram os timestamps `paid_at` e `refunded_at` retornados pela API e exibidos nos detalhes do pedido.

---

## 9. Regras de Produtos, Estoque, Moeda e Máscaras

### 9.1. Imutabilidade de Estoque em Edições de Produto
* **Cadastro Inicial (`POST /v1/products`)**: O operador pode definir opcionalmente o saldo inicial (`stock_quantity`).
* **Edição (`PATCH /v1/products/{id}`)**: O campo `stock_quantity` é ocultado da UI e omitido do payload. Ajustes posteriores de estoque ocorrem exclusivamente por meio da confirmação ou cancelamento de **Pedidos de Compra** e **Pedidos de Venda**.

### 9.2. Precisão Monetária e Formatação (`lib/formatters.ts` e `lib/masks.ts`)
* **Contrato `Money` e `formatBRL`**: Os endpoints de pedidos e relatórios retornam valores monetários serializados como objeto `Money` (`{ amount, currency, formatted }`), enquanto outros recursos podem retornar strings decimais (até 4 casas decimais, ex.: `"1250.50"` ou `"12.3456"`). O tipo `MoneyLike`, o extrator `extractMoneyAmount` e o formatador `formatBRL` (usado por `MoneyDisplay`) aceitam ambos os formatos sem perda de precisão, preservando de 2 a 4 casas decimais significativas via `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
* **Máscaras de Digitação com Vírgula (`maskPrice` e `maskStock`)**:
  * Permitem digitar números utilizando vírgula (ou ponto do teclado numérico, convertido automaticamente para vírgula) com até **4 casas decimais para preços** e até **3 casas decimais para quantidades de estoque**.
  * Na submissão do formulário, o valor é sanitizado para número JSON válido (`Number(val.replace(",", "."))`).
* **Suporte a CNPJ Alfanumérico (`cleanDocument` e `maskCNPJ`)**:
  * Em conformidade com o padrão da Receita Federal e as regras do backend, as máscaras de CNPJ suportam tanto dígitos quanto letras maiúsculas (`[A-Z0-9]{14}` formatado como `XX.XXX.XXX/XXXX-XX`).

---

## 10. Guia Passo a Passo: Como Adicionar uma Nova Feature

Para criar um novo módulo no ERP seguindo estritamente o padrão arquitetural:

1. **Tipos (`features/[modulo]/types/index.ts`)**: Defina as interfaces `Resource`, `CreatePayload`, `UpdatePayload` e `Filters` espelhando o contrato OpenAPI (`api.json`).
2. **Schema Zod (`features/[modulo]/schemas/[modulo].schema.ts`)**: Defina as regras de validação client-side e exporte o tipo inferido com `z.infer`.
3. **Service (`features/[modulo]/services/[modulo].service.ts`)**: Crie os métodos `list`, `getById`, `create`, `update` e `delete` consumindo o `apiClient`.
4. **Hooks (`features/[modulo]/hooks/use-[modulo].ts`)**: Encapsule as queries e mutations com `@tanstack/react-query`, invalidando as `queryKeys` afetadas e disparando feedbacks via `toast.success` / `toast.error`.
5. **Componentes (`features/[modulo]/components/`)**:
   * Proteja botões de ação com `<Can permission="[modulo].create|update|delete">`.
   * Em formulários de edição, utilize `calculateDiff` antes de invocar a mutation `PATCH` e `applyApiValidationErrors` no `catch`.
6. **Rotas (`app/(dashboard)/[modulo]/page.tsx`)**: Envolva a página com `<PermissionGuard permission="[modulo].view">` e registre o item correspondente na [`Sidebar`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/layout/sidebar.tsx).
