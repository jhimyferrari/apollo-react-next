# Apollo System - Frontend

Frontend do **Apollo System**, um sistema de gestão empresarial moderno para pequenas e médias empresas brasileiras com suporte multi-tenant, desenvolvido com **Next.js (App Router)**, **React 19**, **TypeScript** e **Tailwind CSS**.

---

## 🚀 Tecnologias e Padrões Principais

* **Framework**: Next.js 16 (App Router com Turbopack)
* **Reatividade**: React 19 + TypeScript
* **Design & Estilo**: Tailwind CSS v4 + Componentes Modernos (base shadcn/ui com Radix UI Headless)
* **Formulários & Validação**: `react-hook-form` + `zod`
* **Gerenciamento de Estado de Servidor**: `@tanstack/react-query` v5
* **Notificações**: `sonner`
* **Arquitetura**: Feature-Driven / Modular por Domínio (sem lógica de negócio duplicada)
* **Moedas & Datas**: `Intl.NumberFormat` (BRL a partir de strings monetárias, sem float) e `Intl.DateTimeFormat` (pt-BR)

---

## 📋 Pré-requisitos

* **Node.js**: Versão 20.x ou superior recomendada
* **npm**: Versão 10.x ou superior (ou gerenciador compatível)
* **API Backend**: Servidor Laravel rodando (por padrão em `http://localhost:8000/api`)

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

## 📚 Documentação Técnica Completa

Para aprofundar na engenharia e decisões de design do projeto, consulte a documentação detalhada:

* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**:
  * Árvore de pastas comentada e convenções de nomenclatura
  * Diagrama de fluxo de dados completo em Mermaid (`Tela → Hook → Service → Cliente HTTP → API → UI`)
  * Fluxo de autenticação multi-tenant e tratamento de sessão/expiração (401)
  * Resolução e normalização unificada de erros (`VALIDATION_ERROR`, chaves aninhadas e toasts)
  * Guia passo a passo para adicionar novos módulos/features ao ERP
* **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)**:
  * Justificativa técnica minuciosa de cada dependência de produção e desenvolvimento
  * Racional de "Zero Over-engineering"

---

## 🔐 Contrato de Autenticação

* **Login**: `POST /v1/login` com `{ email, password, organization_document }`.
* **Token**: Bearer token injetado automaticamente pelo cliente HTTP central ([`lib/api/client.ts`](lib/api/client.ts)).
* **Logout**: `POST /v1/logout` com limpeza determinística no cliente e redirecionamento para `/login`.
* **Erros 401**: Interceptor global desloga e redireciona automaticamente para a tela de login.

---

## 📄 Licença

Proprietário - Apollo System. Todos os direitos reservados.
