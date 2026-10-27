# Dependências do Projeto (Apollo System)

Este documento detalha **todas** as dependências instaladas no projeto (produção e desenvolvimento), justificando rigorosamente o motivo da escolha de cada uma, o problema real que ela soluciona e onde é aplicada no código-fonte, em conformidade com o princípio de **zero over-engineering**.

---

## 1. Dependências de Produção (`dependencies`)

### 1.1. Framework e Reatividade Base

#### `next` (`16.0.0`)
* **O que faz**: Framework React completo para aplicações web com suporte a Server/Client Components, App Router e otimização de rotas e assets.
* **Por que foi escolhida**: Padrão moderno corporativo e exigência da stack do projeto. Permite roteamento hierárquico, separação de layouts compartilhados e otimização de compilação via Turbopack.
* **Onde é usada**: Estrutura de rotas em [`app/`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/app), navegação (`useRouter`, `usePathname`, `<Link />`) e configuração em [`next.config.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/next.config.ts).

#### `react` e `react-dom` (`19.2.0`)
* **O que faz**: Biblioteca central de interface declarativa e renderizador DOM.
* **Por que foi escolhida**: Motor fundamental da aplicação.
* **Onde é usada**: Em todos os componentes, hooks e páginas da aplicação.

---

### 1.2. Gerenciamento de Estado de Servidor e Cache

#### `@tanstack/react-query` (`^5.104.1`)
* **O que faz**: Camada de gerenciamento de estado assíncrono de servidor (Server State Management).
* **Por que foi escolhida**: O Apollo System possui mais de 10 recursos paginados, ações transacionais com mutações parciais (PATCH com diffs) e necessidade de sincronização reativa. O TanStack Query elimina centenas de linhas de código boilerplate com `useEffect`, gerenciando cache automático, invalidação reativa após mutações (ex.: reabrir/cancelar pedidos), deduplicação de requisições e estados previsíveis de loading/erro.
* **Onde é usada**: Em [`components/providers/query-provider.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/providers/query-provider.tsx) e em todos os hooks de domínio (`features/*/hooks/`).

---

### 1.3. Formulários e Validação

#### `react-hook-form` (`^7.65.0`)
* **O que faz**: Biblioteca de controle de formulários baseada em inputs não-controlados com re-renderizações mínimas.
* **Por que foi escolhida**: Máxima performance ao digitar, essencial para ERPs com formulários complexos e extensos (como itens dinâmicos de pedidos e cadastros fiscais).
* **Onde é usada**: Em todos os formulários da aplicação ([`features/auth/components/login-form.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/features/auth/components/login-form.tsx), formulários de produtos, parceiros e pedidos).

#### `zod` (`^4.1.12`)
* **O que faz**: Validador de esquemas TypeScript-first.
* **Por que foi escolhida**: Permite definir contratos tipados para formulários com inferência estática de tipos (`z.infer`), validando dados no cliente antes do envio como conveniência de UX.
* **Onde é usada**: Em todos os schemas de domínio em `features/*/schemas/`.

#### `@hookform/resolvers` (`^5.2.2`)
* **O que faz**: Adaptador entre `react-hook-form` e bibliotecas de validação externa como `zod`.
* **Por que foi escolhida**: Integração nativa do schema Zod com o ciclo de validação do formulário.
* **Onde é usada**: Como argumento `resolver: zodResolver(...)` nas chamadas de `useForm`.

---

### 1.4. Sistema de Design, Estilização e Acessibilidade

#### `tailwindcss` (`^4`)
* **O que faz**: Framework de estilização baseado em classes utilitárias e CSS moderno.
* **Por que foi escolhida**: Velocidade de desenvolvimento, facilidade de manutenção e zero bundle runtime CSS.
* **Onde é usada**: Estilos globais em [`app/globals.css`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/app/globals.css) e classes utilitárias em todos os componentes.

#### `clsx` (`^2.1.1`) e `tailwind-merge` (`^3.3.1`)
* **O que faz**: Concatenação condicional de classes (`clsx`) e resolução determinística de conflitos de classes Tailwind (`tailwind-merge`).
* **Por que foi escolhida**: Indispensável para o padrão shadcn/ui para permitir que componentes aceitem sobrescrita de classes sem colisões de especificidade.
* **Onde é usada**: No helper central [`lib/utils.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/utils.ts) na função `cn()`.

#### `class-variance-authority` (`^0.7.1`)
* **O que faz**: Criação de variantes tipadas de componentes UI (ex.: `variant="destructive"`, `size="sm"`).
* **Por que foi escolhida**: Padronização dos componentes primitivos shadcn/ui.
* **Onde é usada**: Em [`components/ui/button.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/ui/button.tsx), [`components/ui/badge.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/ui/badge.tsx).

#### `lucide-react` (`^0.548.0`)
* **O que faz**: Conjunto de ícones vetoriais modernos e leves em SVG.
* **Por que foi escolhida**: Ícones consistentes e completos para sistemas administrativos e ERP.
* **Onde é usada**: Na Sidebar, Header, formulários, botões de ação e tabelas.

#### `next-themes` (`^0.4.6`)
* **O que faz**: Gerenciador de tema Dark/Light com persistência e prevenção de flash de cor (FOUC).
* **Por que foi escolhida**: Oferece alternância de tema no ERP mantendo sincronia com preferências do sistema operacional.
* **Onde é usada**: Em [`components/providers/theme-provider.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/providers/theme-provider.tsx) e [`components/layout/header.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/layout/header.tsx).

#### `sonner` (`^2.0.8`)
* **O que faz**: Biblioteca de notificações em Toast.
* **Por que foi escolhida**: Requisito explícito de feedback da API (mensagens de sucesso `message` e erros genéricos em toast). Extremamente leve (<4KB gzipped), acessível e recomendada pelo shadcn/ui.
* **Onde é usada**: Em [`components/ui/sonner.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/components/ui/sonner.tsx), montada em [`app/layout.tsx`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/app/layout.tsx) e disparada via `toast.success() / toast.error()` nos hooks.

---

### 1.5. Primitivos de Interface Radix UI Headless

Os seguintes componentes Radix foram adotados para garantir 100% de conformidade com padrões de acessibilidade WAI-ARIA, foco pelo teclado e renderização sem estilos intrusivos:

* **`@radix-ui/react-slot` (`^1.2.3`)**: Permite o padrão `asChild` em botões e links.
* **`@radix-ui/react-label` (`^2.1.7`)**: Rótulos acessíveis associados aos inputs.
* **`@radix-ui/react-dialog` (`^1.2.0`)**: Modais para criação e edição rápida.
* **`@radix-ui/react-alert-dialog` (`^1.1.24`)**: Diálogos de confirmação para ações destrutivas (excluir cadastro, cancelar pedido).
* **`@radix-ui/react-dropdown-menu` (`^2.1.25`)**: Menu de ações em linhas de tabelas e perfil do usuário.
* **`@radix-ui/react-select` (`^2.3.8`)**: Seletores acessíveis de unidades de medida, status e associações.
* **`@radix-ui/react-popover` (`^1.2.0`)**: Popovers contextuais para filtros e seletores.
* **`@radix-ui/react-separator` (`^1.1.16`)**: Divisores semânticos acessíveis.
* **`@radix-ui/react-tabs` (`^1.1.22`)**: Abas de navegação interna.
* **`@radix-ui/react-tooltip` (`^1.3.0`)**: Dicas contextuais para ações e status.

---

## 2. Dependências de Desenvolvimento (`devDependencies`)

* **`typescript` (`^5`)**: Compilador de tipos estáticos para garantia de integridade em tempo de build.
* **`@types/node` (`^20`)**, **`@types/react` (`^19`)**, **`@types/react-dom` (`^19`)**: Definições de tipagem para Node e React 19.
* **`eslint` (`^9`)** e **`eslint-config-next` (`16.0.0`)**: Análise estática de código e boas práticas Next.js.
* **`@tailwindcss/postcss` (`^4`)**: Plugin PostCSS oficial para integração do Tailwind CSS v4.
* **`tw-animate-css` (`^1.4.0`)**: Classes de animação suaves para diálogos e transições.
* **`husky` (`^9.1.7`)**, **`@commitlint/cli` (`^20.1.0`)**, **`@commitlint/config-conventional` (`^20.0.0`)**, **`cz-conventional-changelog` (`^3.3.0`)**: Padronização de mensagens de commit seguindo Conventional Commits.

---

## 3. O que NÃO foi adicionado (Decisões de Engenharia Conscientes)

1. **Sem Axios**: O cliente HTTP foi construído sobre a `fetch` API nativa com interceptors tipados em [`lib/api/client.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/api/client.ts), economizando bundle e aproveitando o ecossistema nativo do Next.js.
2. **Sem bibliotecas externas de Máscara (ex.: react-input-mask)**: Máscaras foram implementadas em funções puras em [`lib/masks.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/masks.ts) sem incompatibilidade com React 19.
3. **Sem bibliotecas de Moeda/Data pesadas (ex.: moment, date-fns, currency.js)**: Utilização estrita dos padrões nativos de navegador `Intl.NumberFormat` e `Intl.DateTimeFormat` em [`lib/formatters.ts`](file:///home/jhimy-ferrari/repos/apollo/apollo-react-next/lib/formatters.ts).
